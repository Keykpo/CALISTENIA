import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { DailyRoutine } from '@/lib/daily-routine-generator';

export const runtime = 'nodejs';

const StartSessionSchema = z.object({
  routine: z.any(), // DailyRoutine object
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
 * POST /api/training/start-workout-session
 *
 * Starts a new workout session and creates tracking record
 *
 * Request body:
 * {
 *   routine: DailyRoutine
 * }
 *
 * Response:
 * {
 *   success: true,
 *   session: {
 *     id: string,
 *     startedAt: Date,
 *     currentPhaseIndex: number,
 *     currentExerciseIndex: number,
 *     completedExercises: string[],
 *     ...
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = StartSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { routine } = parsed.data as { routine: DailyRoutine };

    console.log('[START_WORKOUT] Starting session for user:', userId);
    console.log('[START_WORKOUT] Routine structure:', {
      id: routine.id,
      phasesCount: routine.phases?.length,
      firstPhaseExercises: routine.phases?.[0]?.exercises?.length,
      firstExerciseName: routine.phases?.[0]?.exercises?.[0]?.exercise?.name,
    });

    // Create workout session record
    const session = await prisma.workoutSession.create({
      data: {
        userId,
        routineId: routine.id,
        startedAt: new Date(),
        status: 'IN_PROGRESS',
        totalDuration: routine.totalDuration,
        estimatedXP: routine.estimatedXP,
        estimatedCoins: routine.estimatedCoins,
        routine: JSON.stringify(routine),
        currentPhaseIndex: 0,
        currentExerciseIndex: 0,
        completedExercises: JSON.stringify([]),
        progress: JSON.stringify({
          phases: routine.phases.map((phase, phaseIdx) => ({
            phaseIndex: phaseIdx,
            phase: phase.phase,
            exercises: phase.exercises.map((ex, exIdx) => ({
              exerciseIndex: exIdx,
              exerciseId: ex.exercise.id,
              exerciseName: ex.exercise.name,
              completed: false,
              sets: ex.sets,
              completedSets: 0,
              repsOrTime: ex.repsOrTime,
              actualReps: [],
              actualTimes: [],
            })),
          })),
        }),
      },
    });

    console.log('[START_WORKOUT] ✅ Session created:', session.id);

    const parsedProgress = JSON.parse(session.progress as string);

    const responseData = {
      success: true,
      session: {
        id: session.id,
        startedAt: session.startedAt,
        routine,
        currentPhaseIndex: 0,
        currentExerciseIndex: 0,
        progress: parsedProgress,
      },
    };

    console.log('[START_WORKOUT] Response structure:', {
      sessionId: responseData.session.id,
      routinePhasesCount: responseData.session.routine?.phases?.length,
      progressPhasesCount: responseData.session.progress?.phases?.length,
      firstProgressExercise: responseData.session.progress?.phases?.[0]?.exercises?.[0],
      firstRoutineExercise: responseData.session.routine?.phases?.[0]?.exercises?.[0],
    });

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('[START_WORKOUT] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start session',
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
