import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getExerciseRewards } from '@/lib/exercise-rewards';
import {
  updateUnifiedAxisXP,
  migrateToUnifiedHexagon,
  getUnifiedAxisXPField,
  getUnifiedAxisLevelField,
  getUnifiedAxisVisualField,
  type UnifiedHexagonAxis,
} from '@/lib/unified-hexagon-system';
import { updateStreakAfterWorkout, applyStreakBonus } from '@/lib/streak-system';
import { trackAllWorkoutAchievements } from '@/lib/achievement-tracking';

export const runtime = 'nodejs';

const UpdateSessionSchema = z.object({
  sessionId: z.string(),
  action: z.enum(['complete_exercise', 'complete_session', 'update_progress']),
  data: z.any().optional(),
});

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
 * PUT /api/training/update-workout-session
 *
 * Updates workout session progress or completes it
 *
 * Actions:
 * 1. complete_exercise: Mark an exercise as completed
 *    data: { phaseIndex: number, exerciseIndex: number, reps?: number, time?: number }
 *
 * 2. update_progress: Update current position
 *    data: { phaseIndex: number, exerciseIndex: number }
 *
 * 3. complete_session: Finish session and award rewards
 *    data: {} (optional)
 */
export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = UpdateSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId, action, data } = parsed.data;

    // Get session
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const progress = JSON.parse(session.progress as string);
    const routine = JSON.parse(session.routine as string);

    // Handle different actions
    if (action === 'complete_exercise') {
      const { phaseIndex, exerciseIndex, reps, time } = data;

      // Mark exercise as completed
      if (progress.phases[phaseIndex]?.exercises[exerciseIndex]) {
        const exercise = progress.phases[phaseIndex].exercises[exerciseIndex];
        exercise.completed = true;
        exercise.completedSets = exercise.sets;

        if (reps !== undefined) {
          exercise.actualReps.push(reps);
        }
        if (time !== undefined) {
          exercise.actualTimes.push(time);
        }
      }

      // Update completed exercises count
      const completedExercises = JSON.parse(session.completedExercises as string);
      completedExercises.push(`${phaseIndex}-${exerciseIndex}`);

      // Save
      const updated = await prisma.workoutSession.update({
        where: { id: sessionId },
        data: {
          progress: JSON.stringify(progress),
          completedExercises: JSON.stringify(completedExercises),
        },
      });

      return NextResponse.json({
        success: true,
        session: {
          ...updated,
          routine,
          progress,
        },
      });
    }

    if (action === 'update_progress') {
      const { phaseIndex, exerciseIndex } = data;

      // Update current position
      const updated = await prisma.workoutSession.update({
        where: { id: sessionId },
        data: {
          currentPhaseIndex: phaseIndex,
          currentExerciseIndex: exerciseIndex,
        },
      });

      return NextResponse.json({
        success: true,
        session: {
          ...updated,
          routine,
          progress,
        },
      });
    }

    if (action === 'complete_session') {
      console.log('[COMPLETE_WORKOUT] Completing session:', sessionId);

      // Calculate total XP/Coins earned based on completed exercises
      const completedExercises = JSON.parse(session.completedExercises as string);
      let baseXP = 0;
      let baseCoins = 0;
      const hexagonXP: Partial<Record<UnifiedHexagonAxis, number>> = {};

      progress.phases.forEach((phase: any) => {
        phase.exercises.forEach((ex: any) => {
          if (ex.completed) {
            // Get exercise from routine
            const routinePhase = routine.phases.find((p: any) => p.phase === phase.phase);
            const routineExercise = routinePhase?.exercises.find((e: any) => e.exercise.id === ex.exerciseId);

            if (routineExercise) {
              const category = routineExercise.exercise.category;
              const difficulty = routineExercise.exercise.difficulty;

              // Calculate rewards
              const rewards = getExerciseRewards(category, difficulty, 1.0);

              baseXP += rewards.totalXP;
              baseCoins += rewards.coins;

              // Accumulate hexagon XP
              Object.entries(rewards.hexagonXP).forEach(([axis, xp]) => {
                hexagonXP[axis as UnifiedHexagonAxis] = (hexagonXP[axis as UnifiedHexagonAxis] || 0) + (xp || 0);
              });
            }
          }
        });
      });

      // Get current user data to check streak
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { dailyStreak: true },
      });

      // Apply streak bonus to rewards
      const streakBonus = applyStreakBonus(baseXP, baseCoins, user?.dailyStreak || 0);
      const totalXP = streakBonus.xp;
      const totalCoins = streakBonus.coins;
      const bonusPercent = streakBonus.bonusPercent;

      // Award XP to hexagon axes
      let hexProfile = await prisma.hexagonProfile.findUnique({
        where: { userId },
      });

      if (!hexProfile) {
        hexProfile = await prisma.hexagonProfile.create({
          data: { userId },
        });
      }

      let updatedProfile = migrateToUnifiedHexagon(hexProfile);

      // Store pre-workout XP levels for percentage calculation
      const preWorkoutXP: Record<string, number> = {
        balance: updatedProfile.balanceXP,
        strength: updatedProfile.strengthXP,
        staticHolds: updatedProfile.staticHoldsXP,
        core: updatedProfile.coreXP,
        endurance: updatedProfile.enduranceXP,
        mobility: updatedProfile.mobilityXP,
      };

      const hexagonUpdates: Record<string, any> = {};

      for (const [axis, xp] of Object.entries(hexagonXP)) {
        if (xp && xp > 0) {
          updatedProfile = updateUnifiedAxisXP(updatedProfile, axis as UnifiedHexagonAxis, xp);

          const visualField = getUnifiedAxisVisualField(axis as UnifiedHexagonAxis);
          const xpField = getUnifiedAxisXPField(axis as UnifiedHexagonAxis);
          const levelField = getUnifiedAxisLevelField(axis as UnifiedHexagonAxis);

          hexagonUpdates[visualField] = updatedProfile[axis as keyof typeof updatedProfile];
          hexagonUpdates[xpField] = updatedProfile[`${axis}XP` as keyof typeof updatedProfile];
          hexagonUpdates[levelField] = updatedProfile[`${axis}Level` as keyof typeof updatedProfile];
        }
      }

      await prisma.hexagonProfile.update({
        where: { userId },
        data: hexagonUpdates,
      });

      // Award coins and XP to user
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXP: { increment: totalXP },
          virtualCoins: { increment: totalCoins },
        },
      });

      // Mark session as completed
      const completedSession = await prisma.workoutSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          actualXP: totalXP,
          actualCoins: totalCoins,
        },
      });

      // Update streak after completing workout
      let streakData;
      try {
        streakData = await updateStreakAfterWorkout(userId);
      } catch (streakError) {
        console.warn('[COMPLETE_WORKOUT] Streak update failed (non-critical):', streakError);
        // Use fallback streak data
        streakData = {
          currentStreak: 1,
          longestStreak: 1,
          currentBonus: 0,
          nextMilestone: null,
        };
      }

      // Track achievement progress
      const exercisesForTracking = progress.phases.flatMap((phase: any) =>
        phase.exercises
          .filter((ex: any) => ex.completed)
          .map((ex: any) => {
            const routinePhase = routine.phases.find((p: any) => p.phase === phase.phase);
            const routineExercise = routinePhase?.exercises.find((e: any) => e.exercise.id === ex.exerciseId);
            return {
              category: routineExercise?.exercise.category || 'UNKNOWN',
              reps: ex.actualReps?.reduce((sum: number, r: number) => sum + r, 0),
              time: ex.actualTimes?.reduce((sum: number, t: number) => sum + t, 0),
            };
          })
      );

      let achievementUpdate;
      try {
        achievementUpdate = await trackAllWorkoutAchievements(userId, exercisesForTracking);
      } catch (achievementError) {
        console.warn('[COMPLETE_WORKOUT] Achievement tracking failed (non-critical):', achievementError);
        // Use fallback achievement data
        achievementUpdate = {
          achieved: [],
          unlockedNext: [],
        };
      }

      // Calculate hexagon improvement percentages
      const hexagonImprovement: Record<string, number> = {};
      Object.keys(preWorkoutXP).forEach(axis => {
        const prevXP = preWorkoutXP[axis] || 1; // Use 1 to avoid division by zero
        const gainedXP = hexagonXP[axis as UnifiedHexagonAxis] || 0;
        // Calculate percentage: (gained / previous) * 100
        const percentImprovement = (gainedXP / prevXP) * 100;
        hexagonImprovement[axis] = Math.round(percentImprovement * 100) / 100; // Round to 2 decimals
      });

      console.log('[COMPLETE_WORKOUT] ✅ Session completed. XP:', totalXP, 'Coins:', totalCoins, 'Streak:', streakData.currentStreak);
      console.log('[COMPLETE_WORKOUT] 📊 Hexagon improvements:', hexagonImprovement);
      if (achievementUpdate.achieved.filter(a => a.justCompleted).length > 0) {
        console.log('[COMPLETE_WORKOUT] 🏆 Achievements completed:', achievementUpdate.achieved.filter(a => a.justCompleted).length);
      }

      return NextResponse.json({
        success: true,
        session: completedSession,
        rewards: {
          totalXP,
          totalCoins,
          hexagonXP,
          hexagonImprovement,
          baseXP,
          baseCoins,
          streakBonus: bonusPercent,
        },
        streak: {
          current: streakData.currentStreak,
          longest: streakData.longestStreak,
          bonus: streakData.currentBonus,
          nextMilestone: streakData.nextMilestone,
        },
        achievements: {
          completed: achievementUpdate.achieved.filter(a => a.justCompleted),
          progress: achievementUpdate.achieved.filter(a => !a.justCompleted),
          unlockedNext: achievementUpdate.unlockedNext,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[UPDATE_WORKOUT] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update session',
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
