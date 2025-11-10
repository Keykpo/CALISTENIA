import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  updateUnifiedAxisXP,
  type UnifiedHexagonAxis,
  migrateToUnifiedHexagon,
  getUnifiedAxisXPField,
  getUnifiedAxisLevelField,
  getUnifiedAxisVisualField,
  getAllUnifiedAxes,
} from '@/lib/unified-hexagon-system';
import {
  trackRoutineCompletion,
  trackTotalTrainingDays,
  trackHexagonAxisXP,
  trackTotalXP,
} from '@/lib/progressive-achievements';

async function getUserId(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id as string;
  } catch {}
  const headerUser = req.headers.get('x-user-id');
  if (headerUser) return headerUser;
  return null;
}

/**
 * Complete a routine and award 5,000 XP bonus distributed across all axes
 *
 * POST /api/routines/complete
 * Body: {
 *   routineId?: string,
 *   exercises: Array<{ name: string, category: string, difficulty: string, reps?: number, duration?: number }>,
 *   totalDuration?: number (in seconds)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { routineId, exercises = [], totalDuration = 0 } = body;

    if (!exercises || exercises.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No exercises provided'
      }, { status: 400 });
    }

    // Get user and hexagon profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { hexagonProfile: true }
    });

    if (!user || !user.hexagonProfile) {
      return NextResponse.json({
        success: false,
        error: 'User or hexagon profile not found'
      }, { status: 404 });
    }

    // Migrate to unified profile
    const hexProfile = migrateToUnifiedHexagon(user.hexagonProfile);

    // Calculate routine completion bonus: 5,000 XP distributed equally
    const ROUTINE_COMPLETION_BONUS = 5000;
    const BONUS_PER_AXIS = Math.floor(ROUTINE_COMPLETION_BONUS / 6); // ~833 XP per axis

    // Update each axis with the bonus
    let updatedProfile = { ...hexProfile };
    const axes = getAllUnifiedAxes();

    const xpGainedPerAxis: Partial<Record<UnifiedHexagonAxis, number>> = {};

    for (const axis of axes) {
      updatedProfile = updateUnifiedAxisXP(updatedProfile, axis, BONUS_PER_AXIS);
      xpGainedPerAxis[axis] = BONUS_PER_AXIS;
    }

    // Prepare update data for Prisma using database field names
    const updateData: any = {};

    for (const axis of axes) {
      const visualField = getUnifiedAxisVisualField(axis);
      const xpField = getUnifiedAxisXPField(axis);
      const levelField = getUnifiedAxisLevelField(axis);

      updateData[visualField] = updatedProfile[axis];
      updateData[xpField] = updatedProfile[`${axis}XP` as keyof typeof updatedProfile];
      updateData[levelField] = updatedProfile[`${axis}Level` as keyof typeof updatedProfile];
    }

    // Update hexagon profile in database
    await prisma.hexagonProfile.update({
      where: { userId },
      data: updateData
    });

    // Create workout history entry
    await prisma.workoutHistory.create({
      data: {
        userId,
        routineId: routineId || null,
        exercises: JSON.stringify(exercises),
        totalDuration: totalDuration || 0,
        completedAt: new Date(),
      }
    });

    // Update user stats (optional: increment totalXP, dailyStreak, etc.)
    const totalXPGained = ROUTINE_COMPLETION_BONUS;
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalXP: (user.totalXP || 0) + totalXPGained,
        // Update streak if needed (check if completed today)
        lastDailyCompletedAt: new Date(),
      }
    });

    // Calculate which levels changed
    const levelsChanged: Partial<Record<UnifiedHexagonAxis, boolean>> = {};
    for (const axis of axes) {
      levelsChanged[axis] = hexProfile[`${axis}Level` as keyof typeof hexProfile] !== updatedProfile[`${axis}Level` as keyof typeof updatedProfile];
    }

    // Track achievements (progressive system)
    const achievementResults = await Promise.allSettled([
      // Track routine completion
      trackRoutineCompletion(userId),

      // Track total training days
      trackTotalTrainingDays(userId),

      // Track hexagon axis XP for each axis
      ...axes.map(axis => trackHexagonAxisXP(userId, axis, BONUS_PER_AXIS)),

      // Track total XP
      trackTotalXP(userId, (user.totalXP || 0) + totalXPGained),
    ]);

    // Collect unlocked tiers from all achievement updates
    const allTiersUnlocked: any[] = [];
    achievementResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.tiersUnlocked.length > 0) {
        allTiersUnlocked.push(...result.value.tiersUnlocked);
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Routine completed successfully!',
      xpGained: {
        total: ROUTINE_COMPLETION_BONUS,
        perAxis: xpGainedPerAxis,
      },
      updatedProfile: updatedProfile,
      levelsChanged,
      achievements: {
        tiersUnlocked: allTiersUnlocked,
        count: allTiersUnlocked.length,
      },
    });

  } catch (error: any) {
    console.error('Error completing routine:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
