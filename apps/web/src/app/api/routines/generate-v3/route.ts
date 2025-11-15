import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  generateRoutineV3,
  determineTrainingStage,
  type RoutineConfig,
  type MasteryGoal,
} from '@/lib/routine-generator-v3';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import exercisesData from '@/data/exercises.json';

export const runtime = 'nodejs';

const GenerateRoutineV3Schema = z.object({
  daysPerWeek: z.number().min(2).max(6).default(3),
  minutesPerSession: z.number().min(30).max(120).default(60),
  masteryGoals: z.array(z.enum([
    'HANDSTAND',
    'PLANCHE',
    'FRONT_LEVER',
    'ONE_ARM_PULL_UP',
    'HANDSTAND_PUSH_UP',
    'MUSCLE_UP',
    'HUMAN_FLAG',
  ])).optional(),
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
 * POST /api/routines/generate-v3
 *
 * Generates a weekly routine following the Calisthenics Progression Guide V3
 * Implements Mode 1 (skill with buffer) vs Mode 2 (strength to failure)
 *
 * Request body:
 * {
 *   daysPerWeek?: number (2-6, default: 3)
 *   minutesPerSession?: number (30-120, default: 60)
 *   masteryGoals?: MasteryGoal[] (optional)
 * }
 *
 * Response:
 * {
 *   success: true,
 *   routines: WorkoutRoutine[]
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
    const parsed = GenerateRoutineV3Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { daysPerWeek, minutesPerSession, masteryGoals } = parsed.data;

    console.log('[ROUTINE_V3] Generating V3 routine for user:', userId);

    // Fetch user with strength metrics
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error('[ROUTINE_V3] User not found:', userId);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[ROUTINE_V3] User found:', {
      userId: user.id,
      difficultyLevel: user.difficultyLevel,
      pullUpsMax: user.pullUpsMax,
      dipsMax: user.dipsMax,
    });

    // Parse user equipment
    let equipment: string[] = ['NONE'];
    try {
      if (user.equipment) {
        const userEquipment = JSON.parse(user.equipment as string);
        const equipmentList: string[] = ['NONE'];

        if (userEquipment.pullUpBar) equipmentList.push('PULL_UP_BAR');
        if (userEquipment.rings) equipmentList.push('RINGS');
        if (userEquipment.parallelBars) equipmentList.push('PARALLEL_BARS');
        if (userEquipment.resistanceBands) equipmentList.push('RESISTANCE_BANDS');

        equipment = equipmentList;
      }
    } catch (e) {
      console.warn('[ROUTINE_V3] Could not parse user equipment, using default');
    }

    // Parse user mastery goals or use from request
    let userMasteryGoals: MasteryGoal[] = [];
    try {
      if (masteryGoals && masteryGoals.length > 0) {
        userMasteryGoals = masteryGoals as MasteryGoal[];
      } else if (user.masteryGoals) {
        userMasteryGoals = JSON.parse(user.masteryGoals);
      }
    } catch (e) {
      console.warn('[ROUTINE_V3] Could not parse mastery goals');
    }

    // Map difficulty level to FitnessLevel
    const difficultyToFitness: Record<string, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'> = {
      'D': 'BEGINNER',
      'C': 'INTERMEDIATE',
      'B': 'INTERMEDIATE',
      'A': 'ADVANCED',
      'S': 'ELITE',
    };

    const fitnessLevel = user.difficultyLevel
      ? difficultyToFitness[user.difficultyLevel] || 'BEGINNER'
      : (user.fitnessLevel as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE' || 'BEGINNER');

    // Build routine config
    const config: RoutineConfig = {
      userId,
      level: fitnessLevel,
      stage: determineTrainingStage({
        pullUpsMax: user.pullUpsMax || 0,
        dipsMax: user.dipsMax || 0,
        pushUpsMax: user.pushUpsMax || 0,
        weightedPullUps: user.weightedPullUps || 0,
        weightedDips: user.weightedDips || 0,
      }),
      daysPerWeek,
      minutesPerSession,
      equipment,
      pullUpsMax: user.pullUpsMax || 0,
      dipsMax: user.dipsMax || 0,
      pushUpsMax: user.pushUpsMax || 0,
      weightedPullUps: user.weightedPullUps || 0,
      weightedDips: user.weightedDips || 0,
      masteryGoals: userMasteryGoals,
    };

    console.log('[ROUTINE_V3] Config:', config);

    // Load exercises from JSON
    const allExercises = exercisesData as any[];

    // Generate V3 routine
    const routines = generateRoutineV3(config, allExercises);

    console.log('[ROUTINE_V3] ✅ Routines generated:', {
      count: routines.length,
      stage: config.stage,
      daysPerWeek,
    });

    return NextResponse.json({
      success: true,
      routines,
      config: {
        stage: config.stage,
        level: fitnessLevel,
        masteryGoals: userMasteryGoals,
      },
    });
  } catch (error: any) {
    console.error('[ROUTINE_V3] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate routine',
        message: error?.message,
        stack: error?.stack,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/routines/generate-v3
 *
 * Get user's current V3 routine or generate a new one with default params
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Generate routine with default params
    const defaultBody = {
      daysPerWeek: 3,
      minutesPerSession: 60,
    };

    const postRequest = new NextRequest(req.url, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(defaultBody),
    });

    return await POST(postRequest);
  } catch (error: any) {
    console.error('[ROUTINE_V3_GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get routine',
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
