import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

const markExerciseSchema = z.object({
  sessionId: z.string(),
  exerciseIndex: z.number(),
  completed: z.boolean(),
});

/**
 * PUT /api/training-session/exercise
 * Mark an exercise as complete or incomplete
 */
export async function PUT(req: NextRequest) {
  try {
    const json = await req.json();
    const data = markExerciseSchema.parse(json);

    console.log('[TRAINING_EXERCISE] Updating exercise:', data);

    // Find the exercise completion record
    const exerciseCompletion = await prisma.sessionExerciseCompletion.findUnique({
      where: {
        trainingSessionId_exerciseIndex: {
          trainingSessionId: data.sessionId,
          exerciseIndex: data.exerciseIndex,
        },
      },
    });

    if (!exerciseCompletion) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    // Update completion status
    const updated = await prisma.sessionExerciseCompletion.update({
      where: {
        trainingSessionId_exerciseIndex: {
          trainingSessionId: data.sessionId,
          exerciseIndex: data.exerciseIndex,
        },
      },
      data: {
        completed: data.completed,
        completedAt: data.completed ? new Date() : null,
      },
    });

    console.log('[TRAINING_EXERCISE] Updated successfully');

    return NextResponse.json(
      {
        success: true,
        exerciseCompletion: updated,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[TRAINING_EXERCISE] Error:', err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid data',
          details: err.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: err?.message,
        code: err?.code,
      },
      { status: 500 }
    );
  }
}
