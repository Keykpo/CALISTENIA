import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { generateTrainingSession } from '@/lib/training-generator';
import { calculateXP } from '@/lib/xp-calculator';
import { getUnifiedPrimaryAxis } from '@/lib/unified-fig-hexagon-mapping';
import { MasteryGoal, DifficultyLevel } from '@/lib/fig-level-progressions';

export const runtime = 'nodejs';

const startSessionSchema = z.object({
  userId: z.string(),
  skillBranch: z.string(),
  userLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE']),
  duration: z.number().min(10).max(120),
});

/**
 * POST /api/training-session
 * Start a new training session
 */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = startSessionSchema.parse(json);

    console.log('[TRAINING_SESSION] Starting new session:', data);

    // Check if user has progress for this skill
    const skillProgress = await prisma.userSkillProgress.findUnique({
      where: {
        userId_skillBranch: {
          userId: data.userId,
          skillBranch: data.skillBranch,
        },
      },
    });

    if (!skillProgress) {
      return NextResponse.json(
        { error: 'No skill progress found. Please complete assessment first.' },
        { status: 400 }
      );
    }

    // Generate training session
    const sessionData = generateTrainingSession(
      data.skillBranch as MasteryGoal,
      data.userLevel as DifficultyLevel,
      data.duration
    );

    // Calculate XP reward
    const xpAwarded = calculateXP(data.duration, data.userLevel as DifficultyLevel);

    // Store skill branch directly - will be converted to hexagon axis on session completion
    const hexagonCategory = data.skillBranch;

    // Create training session record
    const session = await prisma.trainingSession.create({
      data: {
        userId: data.userId,
        userSkillProgressId: skillProgress.id,
        skillBranch: data.skillBranch,
        userLevel: data.userLevel,
        duration: data.duration,
        status: 'IN_PROGRESS',
        sessionData: JSON.stringify(sessionData),
        xpAwarded,
        hexagonCategory,
      },
    });

    // Create exercise completion records
    let exerciseIndex = 0;
    for (const phase of sessionData.phases) {
      for (const exercise of phase.exercises) {
        await prisma.sessionExerciseCompletion.create({
          data: {
            trainingSessionId: session.id,
            exerciseIndex,
            exerciseName: exercise.name,
            completed: false,
          },
        });
        exerciseIndex++;
      }
    }

    console.log('[TRAINING_SESSION] Created session:', session.id);

    return NextResponse.json(
      {
        success: true,
        session: {
          id: session.id,
          ...sessionData,
          xpAwarded,
          hexagonCategory,
          startedAt: session.startedAt,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[TRAINING_SESSION] POST Error:', err);

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

/**
 * GET /api/training-session?sessionId=xxx
 * Get session details including exercise completions
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const session = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: {
        exerciseCompletions: {
          orderBy: { exerciseIndex: 'asc' },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        session: {
          ...session,
          sessionData: JSON.parse(session.sessionData),
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[TRAINING_SESSION] GET Error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: err?.message },
      { status: 500 }
    );
  }
}
