import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateAxisXP, type HexagonAxis, type HexagonProfileWithXP } from '@/lib/hexagon-progression';

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

    const hexProfile = user.hexagonProfile as HexagonProfileWithXP;

    // Calculate routine completion bonus: 5,000 XP distributed equally
    const ROUTINE_COMPLETION_BONUS = 5000;
    const BONUS_PER_AXIS = Math.floor(ROUTINE_COMPLETION_BONUS / 6); // ~833 XP per axis

    // Update each axis with the bonus
    let updatedProfile = { ...hexProfile };
    const axes: HexagonAxis[] = [
      'relativeStrength',
      'muscularEndurance',
      'balanceControl',
      'jointMobility',
      'bodyTension',
      'skillTechnique'
    ];

    const xpGainedPerAxis: Record<HexagonAxis, number> = {} as Record<HexagonAxis, number>;

    for (const axis of axes) {
      updatedProfile = updateAxisXP(updatedProfile, axis, BONUS_PER_AXIS);
      xpGainedPerAxis[axis] = BONUS_PER_AXIS;
    }

    // Prepare update data for Prisma
    const updateData: any = {
      // Visual values (0-10)
      relativeStrength: updatedProfile.relativeStrength,
      muscularEndurance: updatedProfile.muscularEndurance,
      balanceControl: updatedProfile.balanceControl,
      jointMobility: updatedProfile.jointMobility,
      bodyTension: updatedProfile.bodyTension,
      skillTechnique: updatedProfile.skillTechnique,

      // XP values
      relativeStrengthXP: updatedProfile.relativeStrengthXP,
      muscularEnduranceXP: updatedProfile.muscularEnduranceXP,
      balanceControlXP: updatedProfile.balanceControlXP,
      jointMobilityXP: updatedProfile.jointMobilityXP,
      bodyTensionXP: updatedProfile.bodyTensionXP,
      skillTechniqueXP: updatedProfile.skillTechniqueXP,

      // Level strings
      relativeStrengthLevel: updatedProfile.relativeStrengthLevel,
      muscularEnduranceLevel: updatedProfile.muscularEnduranceLevel,
      balanceControlLevel: updatedProfile.balanceControlLevel,
      jointMobilityLevel: updatedProfile.jointMobilityLevel,
      bodyTensionLevel: updatedProfile.bodyTensionLevel,
      skillTechniqueLevel: updatedProfile.skillTechniqueLevel,
    };

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

    return NextResponse.json({
      success: true,
      message: 'Routine completed successfully!',
      xpGained: {
        total: ROUTINE_COMPLETION_BONUS,
        perAxis: xpGainedPerAxis,
      },
      updatedProfile: updatedProfile,
      levelsChanged: {
        relativeStrength: hexProfile.relativeStrengthLevel !== updatedProfile.relativeStrengthLevel,
        muscularEndurance: hexProfile.muscularEnduranceLevel !== updatedProfile.muscularEnduranceLevel,
        balanceControl: hexProfile.balanceControlLevel !== updatedProfile.balanceControlLevel,
        jointMobility: hexProfile.jointMobilityLevel !== updatedProfile.jointMobilityLevel,
        bodyTension: hexProfile.bodyTensionLevel !== updatedProfile.bodyTensionLevel,
        skillTechnique: hexProfile.skillTechniqueLevel !== updatedProfile.skillTechniqueLevel,
      }
    });

  } catch (error: any) {
    console.error('Error completing routine:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
