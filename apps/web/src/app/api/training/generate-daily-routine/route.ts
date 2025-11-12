import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  generateDailyRoutine,
  type GenerateRoutineParams,
  type RoutineDuration,
  type EquipmentType,
  type Exercise,
} from '@/lib/daily-routine-generator';
import { migrateToUnifiedHexagon } from '@/lib/unified-hexagon-system';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import exercisesData from '@/data/exercises.json';

export const runtime = 'nodejs';

const GenerateRoutineSchema = z.object({
  duration: z.enum(['15min', '30min', '45min', '60min']).default('30min'),
  focusAreas: z.array(z.enum(['balance', 'strength', 'staticHolds', 'core', 'endurance', 'mobility'])).optional(),
  // DEV ONLY: Force a specific day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  forceDay: z.number().min(0).max(6).optional(),
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
 * POST /api/training/generate-daily-routine
 *
 * Generates a personalized daily workout routine based on user's profile
 *
 * Request body:
 * {
 *   duration?: '15min' | '30min' | '45min' | '60min' (default: '30min')
 *   focusAreas?: ['balance', 'strength', ...] (optional, auto-selects weak axes if not provided)
 * }
 *
 * Response:
 * {
 *   success: true,
 *   routine: DailyRoutine
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
    const parsed = GenerateRoutineSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { duration, focusAreas, forceDay } = parsed.data;

    console.log('[GENERATE_ROUTINE] Generating routine for user:', userId);
    if (forceDay !== undefined) {
      console.log('[GENERATE_ROUTINE] 🔧 DEV MODE: Forcing day of week to:', forceDay);
    }

    // Fetch user with hexagon profile and skill progress
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hexagonProfile: true,
        skillProgress: true,
      },
    });

    if (!user) {
      console.error('[GENERATE_ROUTINE] User not found:', userId);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[GENERATE_ROUTINE] User found:', {
      userId: user.id,
      hasHexagonProfile: !!user.hexagonProfile,
      hasCompletedAssessment: user.hasCompletedAssessment,
      skillProgressCount: user.skillProgress.length,
    });

    // Get user's training goal and preferred duration
    const trainingGoal = await prisma.trainingGoal.findFirst({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map preferred duration (in minutes) to RoutineDuration
    const preferredDurationMinutes = trainingGoal?.preferredDuration || 60;
    let mappedDuration: RoutineDuration;
    if (preferredDurationMinutes <= 15) {
      mappedDuration = '15min';
    } else if (preferredDurationMinutes <= 30) {
      mappedDuration = '30min';
    } else if (preferredDurationMinutes <= 45) {
      mappedDuration = '45min';
    } else {
      mappedDuration = '60min';
    }

    // Get user's goals
    let goals: string[] = ['general'];
    try {
      goals = user.goals ? JSON.parse(user.goals as string) : ['general'];
    } catch (e) {
      console.warn('[GENERATE_ROUTINE] Could not parse user goals, using default');
    }

    // Get user's equipment (from assessment or default)
    let equipment: EquipmentType[] = ['NONE']; // Default: body weight only

    try {
      if (user.equipment) {
        const userEquipment = JSON.parse(user.equipment as string);
        const equipmentList: EquipmentType[] = ['NONE']; // Always include body weight

        if (userEquipment.pullUpBar) equipmentList.push('PULL_UP_BAR');
        if (userEquipment.rings) equipmentList.push('RINGS');
        if (userEquipment.parallelBars) equipmentList.push('PARALLEL_BARS');
        if (userEquipment.resistanceBands) equipmentList.push('RESISTANCE_BANDS');

        equipment = equipmentList;
        console.log('[GENERATE_ROUTINE] User equipment from assessment:', equipment);
      } else {
        console.log('[GENERATE_ROUTINE] No equipment data found, using body weight only');
      }
    } catch (e) {
      console.warn('[GENERATE_ROUTINE] Could not parse user equipment, using default');
    }

    // Get hexagon levels (with fallback if profile doesn't exist)
    const unifiedProfile = user.hexagonProfile
      ? migrateToUnifiedHexagon(user.hexagonProfile)
      : {
          balanceLevel: 'BEGINNER' as const,
          strengthLevel: 'BEGINNER' as const,
          staticHoldsLevel: 'BEGINNER' as const,
          coreLevel: 'BEGINNER' as const,
          enduranceLevel: 'BEGINNER' as const,
          mobilityLevel: 'BEGINNER' as const,
          balanceXP: 0,
          strengthXP: 0,
          staticHoldsXP: 0,
          coreXP: 0,
          enduranceXP: 0,
          mobilityXP: 0,
        };

    const hexagonLevels = {
      balance: unifiedProfile.balanceLevel,
      strength: unifiedProfile.strengthLevel,
      staticHolds: unifiedProfile.staticHoldsLevel,
      core: unifiedProfile.coreLevel,
      endurance: unifiedProfile.enduranceLevel,
      mobility: unifiedProfile.mobilityLevel,
    };

    // Get hexagon XP values for stage calculation
    const hexagonXP = user.hexagonProfile ? {
      balance: unifiedProfile.balanceXP,
      strength: unifiedProfile.strengthXP,
      staticHolds: unifiedProfile.staticHoldsXP,
      core: unifiedProfile.coreXP,
      endurance: unifiedProfile.enduranceXP,
      mobility: unifiedProfile.mobilityXP,
    } : undefined;

    // Get FIG skill levels
    const figLevels: any = {};
    user.skillProgress.forEach(progress => {
      figLevels[progress.skillBranch] = progress.currentLevel;
    });

    // Get target skill from training goal if set (only for skill_mastery goal)
    const targetSkill = (trainingGoal?.goalType === 'skill_mastery' && trainingGoal?.name)
      ? (trainingGoal.name as any)
      : undefined;

    // Get user's actual performance stats from workout history
    console.log('[GENERATE_ROUTINE] Fetching user performance stats...');

    // Query pull-up history (max reps in a single set)
    const pullUpLogs = await prisma.manualExerciseLog.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: 'pull' } },
          { name: { contains: 'Pull' } },
          { name: { contains: 'PULL' } },
        ],
      },
      orderBy: {
        reps: 'desc',
      },
      take: 1,
    });

    // Query dip history (max reps in a single set)
    const dipLogs = await prisma.manualExerciseLog.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: 'dip' } },
          { name: { contains: 'Dip' } },
          { name: { contains: 'DIP' } },
        ],
      },
      orderBy: {
        reps: 'desc',
      },
      take: 1,
    });

    const userStats = {
      pullUps: pullUpLogs[0]?.reps || 0,
      dips: dipLogs[0]?.reps || 0,
      weightedPullUpsPercent: 0, // TODO: Add weight field to ManualExerciseLog to track weighted exercises
      weightedDipsPercent: 0, // TODO: Add weight field to ManualExerciseLog to track weighted exercises
    };

    console.log('[GENERATE_ROUTINE] User stats:', userStats);

    // Prepare generation params
    const params: GenerateRoutineParams = {
      userId,
      hexagonLevels,
      hexagonXP,
      figLevels,
      goals,
      equipment,
      duration: mappedDuration,
      focusAreas: focusAreas as any,
      targetSkill,
      userStats,
      forceDay, // DEV ONLY: Force specific day
    };

    // Load exercises
    const allExercises = exercisesData as Exercise[];

    console.log('[GENERATE_ROUTINE] Loaded exercises:', {
      totalExercises: allExercises.length,
      params: {
        duration: mappedDuration,
        equipment: equipment.length,
        goals: goals.length,
        targetSkill,
      },
    });

    // Validate exercises data
    if (!allExercises || allExercises.length === 0) {
      console.error('[GENERATE_ROUTINE] No exercises available in exercises.json');
      return NextResponse.json(
        {
          success: false,
          error: 'No exercises available',
          message: 'Exercise database is empty. Please check exercises.json file.',
        },
        { status: 500 }
      );
    }

    // Generate routine
    const routine = generateDailyRoutine(params, allExercises);

    console.log('[GENERATE_ROUTINE] ✅ Routine generated:', {
      phases: routine.phases.length,
      totalDuration: routine.totalDuration,
      estimatedXP: routine.estimatedXP,
      difficulty: routine.difficulty,
      exercisesPerPhase: routine.phases.map(p => ({ phase: p.phase, exerciseCount: p.exercises.length })),
    });

    // Save routine to database (optional - for history tracking)
    try {
      await prisma.dailyRoutine.create({
        data: {
          userId,
          date: routine.date,
          difficulty: routine.difficulty,
          totalDuration: routine.totalDuration,
          estimatedXP: routine.estimatedXP,
          estimatedCoins: routine.estimatedCoins,
          focusAreas: JSON.stringify(routine.focusAreas),
          routine: JSON.stringify(routine), // Store complete routine as JSON
        },
      });
    } catch (err) {
      console.warn('[GENERATE_ROUTINE] Could not save routine to DB:', err);
      // Non-critical, continue
    }

    return NextResponse.json({
      success: true,
      routine,
    });
  } catch (error: any) {
    console.error('[GENERATE_ROUTINE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate routine',
        message: error?.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/training/generate-daily-routine
 *
 * Get today's routine if it exists, or generate a new one
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

    // Check if routine exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingRoutine = await prisma.dailyRoutine.findFirst({
      where: {
        userId,
        date: {
          gte: today,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (existingRoutine) {
      // Return existing routine
      const routine = JSON.parse(existingRoutine.routine as string);

      return NextResponse.json({
        success: true,
        routine,
        isNew: false,
      });
    }

    // No routine exists, generate one with default params
    // We'll redirect to POST logic by calling it internally
    const defaultBody = { duration: '30min' };

    // Re-invoke POST logic
    const postRequest = new NextRequest(req.url, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(defaultBody),
    });

    return await POST(postRequest);
  } catch (error: any) {
    console.error('[GET_ROUTINE] Error:', error);
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
