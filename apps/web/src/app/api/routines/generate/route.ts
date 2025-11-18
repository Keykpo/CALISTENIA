/**
 * UNIFIED ROUTINE GENERATION API
 *
 * This endpoint replaces both:
 * - /api/routines/generate-v3 (weekly routines)
 * - /api/training/generate-daily-routine (daily routines)
 *
 * Features:
 * - Unified stage calculation
 * - Unified user stats
 * - Exercise validation
 * - Better error handling
 * - Supports both daily and weekly generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import exercisesData from '@/data/exercises.json';

// Unified system imports
import { calculateUnifiedStage, type UnifiedStageParams } from '@/lib/training-stages';
import { getUserStats } from '@/lib/user-stats';
import {
  generateDailyRoutine,
  generateWeeklyRoutine,
  type GenerateRoutineParams,
  type WeeklyRoutineParams,
  type Exercise,
  type RoutineDuration,
  type EquipmentType,
} from '@/lib/daily-routine-generator';
import { migrateToUnifiedHexagon } from '@/lib/unified-hexagon-system';

export const runtime = 'nodejs';

/**
 * Request schema
 */
const GenerateRoutineSchema = z.object({
  // Mode: 'daily' or 'weekly'
  mode: z.enum(['daily', 'weekly']).default('daily'),

  // Daily mode params
  duration: z.enum(['15min', '30min', '45min', '60min']).optional(),
  focusAreas: z.array(z.enum(['balance', 'strength', 'staticHolds', 'core', 'endurance', 'mobility'])).optional(),

  // Weekly mode params
  daysPerWeek: z.number().min(2).max(6).optional(),

  // Common params
  targetSkill: z.string().optional(),

  // Dev only
  forceDay: z.number().min(0).max(6).optional(),
});

/**
 * Get user ID from session or header
 */
async function getUserId(req: NextRequest): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id as string;
  } catch {}
  const headerUser = req.headers.get('x-user-id');
  if (headerUser) return headerUser;
  return null;
}

/**
 * POST /api/routines/generate
 *
 * Generate either a daily routine or weekly routine based on mode parameter
 *
 * Request body:
 * {
 *   mode: 'daily' | 'weekly' (default: 'daily')
 *
 *   // For daily mode:
 *   duration?: '15min' | '30min' | '45min' | '60min'
 *   focusAreas?: ['balance', 'strength', ...]
 *
 *   // For weekly mode:
 *   daysPerWeek?: 2-6 (default: 3)
 *
 *   // Optional:
 *   targetSkill?: string
 *   forceDay?: 0-6 (dev only)
 * }
 *
 * Response:
 * {
 *   success: true,
 *   mode: 'daily' | 'weekly',
 *   routine: DailyRoutine | WeeklyRoutine,
 *   metadata: { stage, userStats, ... }
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

    const { mode, duration, focusAreas, daysPerWeek, targetSkill, forceDay } = parsed.data;

    console.log('[UNIFIED_ROUTINE] ===== UNIFIED ROUTINE GENERATION =====');
    console.log('[UNIFIED_ROUTINE] Mode:', mode);
    console.log('[UNIFIED_ROUTINE] User ID:', userId);

    // ========================================
    // STEP 1: FETCH USER DATA
    // ========================================

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hexagonProfile: true,
        skillProgress: true,
      },
    });

    if (!user) {
      console.error('[UNIFIED_ROUTINE] User not found:', userId);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[UNIFIED_ROUTINE] User found:', {
      userId: user.id,
      hasHexagonProfile: !!user.hexagonProfile,
      hasCompletedAssessment: user.hasCompletedAssessment,
    });

    // ========================================
    // STEP 2: GET UNIFIED USER STATS
    // ========================================

    const userStats = await getUserStats(prisma, userId, {
      preferUserModel: true,
      includeLogAnalysis: true,
    });

    console.log('[UNIFIED_ROUTINE] User stats:', {
      pullUps: userStats.pullUpsMax,
      dips: userStats.dipsMax,
      bodyWeight: userStats.bodyWeight,
      source: userStats.source,
    });

    // ========================================
    // STEP 3: CALCULATE UNIFIED STAGE
    // ========================================

    const stageParams: UnifiedStageParams = {
      // Try performance metrics first
      pullUpsMax: userStats.pullUpsMax,
      dipsMax: userStats.dipsMax,
      pushUpsMax: userStats.pushUpsMax,
      weightedPullUps: userStats.weightedPullUps,
      weightedDips: userStats.weightedDips,
      bodyWeight: userStats.bodyWeight,
    };

    // Fallback to hexagon if no performance data
    if (user.hexagonProfile) {
      const unifiedProfile = migrateToUnifiedHexagon(user.hexagonProfile);
      stageParams.strengthLevel = unifiedProfile.strengthLevel;
      stageParams.strengthXP = unifiedProfile.strengthXP;
      stageParams.balanceLevel = unifiedProfile.balanceLevel;
      stageParams.staticHoldsLevel = unifiedProfile.staticHoldsLevel;
    }

    const stage = calculateUnifiedStage(stageParams);

    console.log('[UNIFIED_ROUTINE] Stage calculated:', stage);

    // ========================================
    // STEP 4: PREPARE GENERATION PARAMS
    // ========================================

    // Get hexagon levels
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

    // Get user goals
    let goals: string[] = ['general'];
    try {
      goals = user.goals ? JSON.parse(user.goals as string) : ['general'];
    } catch (e) {
      console.warn('[UNIFIED_ROUTINE] Could not parse user goals');
    }

    // Get equipment
    let equipment: EquipmentType[] = ['NONE'];
    try {
      if (user.equipment) {
        const userEquipment = JSON.parse(user.equipment as string);
        const equipmentList: EquipmentType[] = ['NONE'];

        if (userEquipment.pullUpBar) equipmentList.push('PULL_UP_BAR');
        if (userEquipment.rings) equipmentList.push('RINGS');
        if (userEquipment.parallelBars) equipmentList.push('PARALLEL_BARS');
        if (userEquipment.resistanceBands) equipmentList.push('RESISTANCE_BANDS');

        equipment = equipmentList;
      }
    } catch (e) {
      console.warn('[UNIFIED_ROUTINE] Could not parse equipment');
    }

    // Get training goal for duration preference
    const trainingGoal = await prisma.trainingGoal.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const preferredDurationMinutes = trainingGoal?.preferredDuration || 60;
    let mappedDuration: RoutineDuration = '30min';
    if (preferredDurationMinutes <= 15) mappedDuration = '15min';
    else if (preferredDurationMinutes <= 30) mappedDuration = '30min';
    else if (preferredDurationMinutes <= 45) mappedDuration = '45min';
    else mappedDuration = '60min';

    // ========================================
    // STEP 5: VALIDATE EXERCISES
    // ========================================

    const allExercises = exercisesData as Exercise[];

    if (!allExercises || allExercises.length === 0) {
      console.error('[UNIFIED_ROUTINE] No exercises available in exercises.json');
      return NextResponse.json(
        {
          success: false,
          error: 'No exercises available',
          message: 'Exercise database is empty. Please check exercises.json file.',
        },
        { status: 500 }
      );
    }

    console.log('[UNIFIED_ROUTINE] Loaded exercises:', {
      total: allExercises.length,
      categories: [...new Set(allExercises.map(ex => ex.category))],
    });

    // ========================================
    // STEP 6: GENERATE ROUTINE
    // ========================================

    if (mode === 'weekly') {
      // Generate weekly routine
      const params: WeeklyRoutineParams = {
        userId,
        hexagonLevels,
        hexagonXP,
        figLevels,
        goals,
        equipment,
        duration: duration || mappedDuration,
        daysPerWeek: daysPerWeek || 3,
        focusAreas: focusAreas as any,
        targetSkill: targetSkill as any,
        userStats: {
          pullUps: userStats.pullUpsMax,
          dips: userStats.dipsMax,
          weightedPullUpsPercent: userStats.weightedPullUpsPercent,
          weightedDipsPercent: userStats.weightedDipsPercent,
        },
      };

      const routine = generateWeeklyRoutine(params, allExercises);

      console.log('[UNIFIED_ROUTINE] ✅ Weekly routine generated:', {
        daysGenerated: routine.dailyRoutines.length,
        totalXP: routine.totalEstimatedXP,
        stage: routine.stage,
      });

      // Save weekly routine metadata to DB
      try {
        // Store as a weekly routine record (you may need to add this model)
        // For now, we'll just save each daily routine
        for (const dailyRoutine of routine.dailyRoutines) {
          await prisma.dailyRoutine.create({
            data: {
              userId,
              date: dailyRoutine.date,
              difficulty: dailyRoutine.difficulty,
              totalDuration: dailyRoutine.totalDuration,
              estimatedXP: dailyRoutine.estimatedXP,
              estimatedCoins: dailyRoutine.estimatedCoins,
              focusAreas: JSON.stringify(dailyRoutine.focusAreas),
              routine: JSON.stringify(dailyRoutine),
            },
          });
        }
      } catch (err) {
        console.warn('[UNIFIED_ROUTINE] Could not save weekly routine to DB:', err);
      }

      return NextResponse.json({
        success: true,
        mode: 'weekly',
        routine,
        metadata: {
          stage,
          userStats: {
            pullUps: userStats.pullUpsMax,
            dips: userStats.dipsMax,
            bodyWeight: userStats.bodyWeight,
            source: userStats.source,
          },
        },
      });
    } else {
      // Generate daily routine
      const params: GenerateRoutineParams = {
        userId,
        hexagonLevels,
        hexagonXP,
        figLevels,
        goals,
        equipment,
        duration: duration || mappedDuration,
        focusAreas: focusAreas as any,
        targetSkill: targetSkill as any,
        userStats: {
          pullUps: userStats.pullUpsMax,
          dips: userStats.dipsMax,
          weightedPullUpsPercent: userStats.weightedPullUpsPercent,
          weightedDipsPercent: userStats.weightedDipsPercent,
        },
        forceDay,
      };

      const routine = generateDailyRoutine(params, allExercises);

      console.log('[UNIFIED_ROUTINE] ✅ Daily routine generated:', {
        phases: routine.phases.length,
        totalDuration: routine.totalDuration,
        estimatedXP: routine.estimatedXP,
        stage: routine.stage,
      });

      // Save routine to database
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
            routine: JSON.stringify(routine),
          },
        });
      } catch (err) {
        console.warn('[UNIFIED_ROUTINE] Could not save routine to DB:', err);
      }

      return NextResponse.json({
        success: true,
        mode: 'daily',
        routine,
        metadata: {
          stage,
          userStats: {
            pullUps: userStats.pullUpsMax,
            dips: userStats.dipsMax,
            bodyWeight: userStats.bodyWeight,
            source: userStats.source,
          },
        },
      });
    }
  } catch (error: any) {
    console.error('[UNIFIED_ROUTINE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate routine',
        message: error?.message,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/routines/generate
 *
 * Get today's routine or generate a new one with default params
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
      const routine = JSON.parse(existingRoutine.routine as string);

      return NextResponse.json({
        success: true,
        mode: 'daily',
        routine,
        isNew: false,
      });
    }

    // No routine exists, generate one with default params
    const defaultBody = { mode: 'daily', duration: '30min' };

    const postRequest = new NextRequest(req.url, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(defaultBody),
    });

    return await POST(postRequest);
  } catch (error: any) {
    console.error('[UNIFIED_ROUTINE_GET] Error:', error);
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
