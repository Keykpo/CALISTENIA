import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  processAssessment,
  AssessmentStep1Data,
  AssessmentStep2Data,
  AssessmentStep3Data,
  AssessmentStep4Data,
  DifficultyLevel,
  mapDSToUnifiedLevel,
} from '@/lib/assessment-d-s-logic';
import {
  getUnifiedLevelFromXP,
  getUnifiedVisualValueFromXP,
  calculateUnifiedOverallLevel,
} from '@/lib/unified-hexagon-system';
import { mapAssessmentToFigBranches } from '@/lib/assessment-to-fig-mapping';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * D-S Assessment Schema
 */
const Step1Schema = z.object({
  age: z.number().min(13).max(100),
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(200),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  goals: z.array(z.string()).min(1).max(3),
});

const Step2Schema = z.object({
  equipment: z.object({
    floor: z.boolean(),
    pullUpBar: z.boolean(),
    rings: z.boolean(),
    parallelBars: z.boolean(),
    resistanceBands: z.boolean(),
  }),
});

const Step3Schema = z.object({
  pushUps: z.number().min(0),
  dips: z.number().min(0),
  pullUps: z.number().min(0),
  deadHangTime: z.number().min(0),
  plankTime: z.number().min(0),
  hollowBodyHold: z.number().min(0),
  squats: z.number().min(0),
  pistolSquat: z.enum(['no', 'assisted', '1-3', '4-8', '9+']),
  // 🆕 NEW: Expanded assessment fields
  lSitAttempt: z.enum(['no', 'tuck', 'one_leg', 'full']).optional(),
  shoulderMobility: z.enum(['poor', 'average', 'good', 'excellent']).optional(),
  bridge: z.enum(['no', 'partial', 'full']).optional(),
  maxPushUpsIn60s: z.number().min(0).optional(),
  circuitEndurance: z.enum(['cannot_complete', 'long_breaks', 'short_breaks', 'no_breaks']).optional(),
});

const Step4Schema = z.object({
  handstand: z.enum(['no', 'wall_5-15s', 'wall_15-60s', 'freestanding_5-15s', 'freestanding_15s+']),
  handstandPushUp: z.enum(['no', 'partial_wall', 'full_wall_1-5', 'full_wall_6+', 'freestanding']),
  frontLever: z.enum(['no', 'tuck_5-10s', 'adv_tuck_5-10s', 'straddle_3-8s', 'one_leg_3-8s', 'full_3s+']),
  planche: z.enum(['no', 'frog_tuck_5-10s', 'adv_tuck_5-10s', 'straddle_3-8s', 'full_3s+']),
  lSit: z.enum(['no', 'tuck_10-20s', 'bent_legs_10-20s', 'full_10-20s', 'full_20s+_or_vsit']),
  muscleUp: z.enum(['no', 'kipping', 'strict_1-3', 'strict_4+']),
  archerPullUp: z.enum(['no', 'assisted', 'full_3-5_each', 'full_6+_each']),
  oneArmPullUp: z.enum(['no', 'band_assisted', '1_rep_clean', '2+_reps']),
  // 🆕 NEW: Advanced skills additions
  crowPose: z.enum(['no', 'less_than_10s', '10-30s', '30s+']).optional(),
  backLever: z.enum(['no', 'tuck', 'adv_tuck', 'straddle', 'full']).optional(),
  ringSupport: z.enum(['no', 'shaky', 'stable_30s', 'stable_60s+_RTO']).optional(),
  weightedPullUps: z.enum(['no', '+10-20lbs', '+25-40lbs', '+45lbs+']).optional(),
  weightedDips: z.enum(['no', '+10-20lbs', '+25-40lbs', '+45lbs+']).optional(),
  humanFlag: z.enum(['no', 'tuck', 'adv_tuck', 'straddle', 'full']).optional(),
  abWheel: z.enum(['no', 'knees_partial', 'knees_full', 'standing']).optional(),
}).optional();

const DSAssessmentSchema = z.object({
  level: z.enum(['D', 'C', 'B', 'A', 'S']), // Placeholder, will be calculated
  step1: Step1Schema,
  step2: Step2Schema,
  step3: Step3Schema,
  step4: Step4Schema.optional(),
});

/**
 * POST /api/assessment/fig-initial
 *
 * Process D-S assessment from 4-step onboarding
 *
 * Request body:
 * {
 *   level: 'D', // placeholder
 *   step1: { age, height, weight, gender, goals },
 *   step2: { equipment: {...} },
 *   step3: { pushUps, pullUps, ... },
 *   step4: { handstand, frontLever, ... } // optional
 * }
 *
 * This endpoint:
 * 1. Calculates user's D-S level using assessment logic
 * 2. Calculates hexagon XP for each axis
 * 3. Saves hexagon profile to database
 * 4. Marks user as completed assessment
 * 5. Returns user's assigned level and hexagon data
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    console.log('[D-S_ASSESSMENT] POST request received:', {
      hasUserId: !!userId,
      userId: userId,
    });

    if (!userId) {
      console.error('[D-S_ASSESSMENT] No user ID provided');
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const body = await req.json();

    console.log('[D-S_ASSESSMENT] Request body:', {
      hasStep1: !!body.step1,
      hasStep2: !!body.step2,
      hasStep3: !!body.step3,
      hasStep4: !!body.step4,
    });

    const parsed = DSAssessmentSchema.safeParse(body);

    if (!parsed.success) {
      console.error('[D-S_ASSESSMENT] Validation failed:', parsed.error.flatten());
      return NextResponse.json(
        {
          error: 'Invalid assessment data',
          issues: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const { step1, step2, step3, step4 } = parsed.data;

    console.log(`[D-S_ASSESSMENT] Processing assessment for user ${userId}`);

    // Step 1: Calculate user's level using D-S assessment logic
    const assessmentResult = processAssessment(
      step1 as AssessmentStep1Data,
      step2 as AssessmentStep2Data,
      step3 as AssessmentStep3Data,
      step4 as AssessmentStep4Data | undefined
    );

    console.log('[D-S_ASSESSMENT] Assessment result:', {
      assignedLevel: assessmentResult.assignedLevel,
      unifiedLevel: assessmentResult.unifiedLevel,
      visualRank: assessmentResult.visualRank,
      visualValue: assessmentResult.visualValue,
      estimatedTrainingAge: assessmentResult.estimatedTrainingAge,
    });

    // 🆕 NEW: Step 1b - Map assessment to 17 FIG skill branches
    console.log('[D-S_ASSESSMENT] Mapping assessment to 17 FIG skill branches...');
    const figBranchLevels = mapAssessmentToFigBranches(
      step3 as AssessmentStep3Data,
      step4 as AssessmentStep4Data | undefined
    );

    console.log('[D-S_ASSESSMENT] FIG branch levels calculated:', figBranchLevels);

    // Step 2: Extract hexagon XP values
    const hexagonXP = assessmentResult.hexagonXP;

    console.log('[D-S_ASSESSMENT] Hexagon XP values:', hexagonXP);

    // Calculate levels for each axis
    const balanceLevel = getUnifiedLevelFromXP(hexagonXP.balanceControlXP);
    const strengthLevel = getUnifiedLevelFromXP(hexagonXP.relativeStrengthXP);
    const staticHoldsLevel = getUnifiedLevelFromXP(hexagonXP.skillTechniqueXP);
    const coreLevel = getUnifiedLevelFromXP(hexagonXP.bodyTensionXP);
    const enduranceLevel = getUnifiedLevelFromXP(hexagonXP.muscularEnduranceXP);
    const mobilityLevel = getUnifiedLevelFromXP(hexagonXP.jointMobilityXP);

    // Calculate visual values (0-10 scale)
    const balanceValue = getUnifiedVisualValueFromXP(hexagonXP.balanceControlXP, balanceLevel);
    const strengthValue = getUnifiedVisualValueFromXP(hexagonXP.relativeStrengthXP, strengthLevel);
    const staticHoldsValue = getUnifiedVisualValueFromXP(hexagonXP.skillTechniqueXP, staticHoldsLevel);
    const coreValue = getUnifiedVisualValueFromXP(hexagonXP.bodyTensionXP, coreLevel);
    const enduranceValue = getUnifiedVisualValueFromXP(hexagonXP.muscularEnduranceXP, enduranceLevel);
    const mobilityValue = getUnifiedVisualValueFromXP(hexagonXP.jointMobilityXP, mobilityLevel);

    console.log('[D-S_ASSESSMENT] Calculated visual values (0-10):', {
      balance: balanceValue,
      strength: strengthValue,
      staticHolds: staticHoldsValue,
      core: coreValue,
      endurance: enduranceValue,
      mobility: mobilityValue,
    });

    console.log('[D-S_ASSESSMENT] Calculated levels:', {
      balance: balanceLevel,
      strength: strengthLevel,
      staticHolds: staticHoldsLevel,
      core: coreLevel,
      endurance: enduranceLevel,
      mobility: mobilityLevel,
    });

    // Step 3: Save hexagon profile to database
    console.log('[D-S_ASSESSMENT] Creating/updating hexagon profile...');

    let hexagonProfile;
    try {
      hexagonProfile = await prisma.hexagonProfile.upsert({
        where: { userId },
        create: {
          userId,
          // Visual values (0-10 scale)
          balanceControl: balanceValue,
          relativeStrength: strengthValue,
          skillTechnique: staticHoldsValue,
          bodyTension: coreValue,
          muscularEndurance: enduranceValue,
          jointMobility: mobilityValue,
          // XP values
          balanceControlXP: hexagonXP.balanceControlXP,
          relativeStrengthXP: hexagonXP.relativeStrengthXP,
          skillTechniqueXP: hexagonXP.skillTechniqueXP,
          bodyTensionXP: hexagonXP.bodyTensionXP,
          muscularEnduranceXP: hexagonXP.muscularEnduranceXP,
          jointMobilityXP: hexagonXP.jointMobilityXP,
          // Level values
          balanceControlLevel: balanceLevel,
          relativeStrengthLevel: strengthLevel,
          skillTechniqueLevel: staticHoldsLevel,
          bodyTensionLevel: coreLevel,
          muscularEnduranceLevel: enduranceLevel,
          jointMobilityLevel: mobilityLevel,
        },
        update: {
          // Visual values (0-10 scale)
          balanceControl: balanceValue,
          relativeStrength: strengthValue,
          skillTechnique: staticHoldsValue,
          bodyTension: coreValue,
          muscularEndurance: enduranceValue,
          jointMobility: mobilityValue,
          // XP values
          balanceControlXP: hexagonXP.balanceControlXP,
          relativeStrengthXP: hexagonXP.relativeStrengthXP,
          skillTechniqueXP: hexagonXP.skillTechniqueXP,
          bodyTensionXP: hexagonXP.bodyTensionXP,
          muscularEnduranceXP: hexagonXP.muscularEnduranceXP,
          jointMobilityXP: hexagonXP.jointMobilityXP,
          // Level values
          balanceControlLevel: balanceLevel,
          relativeStrengthLevel: strengthLevel,
          skillTechniqueLevel: staticHoldsLevel,
          bodyTensionLevel: coreLevel,
          muscularEnduranceLevel: enduranceLevel,
          jointMobilityLevel: mobilityLevel,
        },
      });

      console.log('[D-S_ASSESSMENT] Hexagon profile saved successfully:', {
        hexagonId: hexagonProfile.id,
        userId: hexagonProfile.userId,
      });
    } catch (hexagonError) {
      console.error('[D-S_ASSESSMENT] CRITICAL ERROR: Failed to create/update hexagon profile:', hexagonError);
      return NextResponse.json(
        {
          error: 'Failed to create hexagon profile',
          details: hexagonError instanceof Error ? hexagonError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // 🆕 NEW: Step 3b - Save FIG branch levels to userSkillProgress
    console.log('[D-S_ASSESSMENT] Saving FIG branch levels to userSkillProgress...');

    try {
      // Map D-S level (D, C, B, A, S) to UnifiedProgressionLevel (BEGINNER, INTERMEDIATE, ADVANCED, ELITE)
      const levelMapping: Record<DifficultyLevel, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'> = {
        D: 'BEGINNER',
        C: 'INTERMEDIATE',
        B: 'ADVANCED',
        A: 'ELITE',
        S: 'ELITE',
      };

      // Create upsert operations for all 17 branches
      const branchUpsertOperations = Object.entries(figBranchLevels).map(([skillBranch, dsLevel]) => {
        const unifiedLevel = levelMapping[dsLevel];

        return prisma.userSkillProgress.upsert({
          where: {
            userId_skillBranch: {
              userId,
              skillBranch: skillBranch as any,
            },
          },
          create: {
            userId,
            skillBranch: skillBranch as any,
            currentLevel: unifiedLevel,
            assessmentDate: new Date(),
            assessmentScore: 0,
          },
          update: {
            currentLevel: unifiedLevel,
            assessmentDate: new Date(),
          },
        });
      });

      // Execute all upserts in parallel
      const savedBranches = await Promise.all(branchUpsertOperations);

      console.log(`[D-S_ASSESSMENT] ✅ Successfully saved ${savedBranches.length} FIG branch levels`);
    } catch (branchError) {
      console.error('[D-S_ASSESSMENT] ERROR: Failed to save FIG branch levels:', branchError);
      // Non-critical error - continue execution
      console.warn('[D-S_ASSESSMENT] Continuing despite FIG branch save error...');
    }

    // Step 4: Calculate overall fitness level
    const overallLevel = calculateUnifiedOverallLevel({
      balanceLevel,
      strengthLevel,
      staticHoldsLevel,
      coreLevel,
      enduranceLevel,
      mobilityLevel,
    } as any);

    console.log('[D-S_ASSESSMENT] Overall fitness level:', overallLevel);

    // Step 5: Save D-S level to user's profile
    console.log('[D-S_ASSESSMENT] Updating user with D-S level and fitness level...');

    // Format equipment for storage
    const userEquipment = {
      floor: step2.equipment.floor,
      pullUpBar: step2.equipment.pullUpBar,
      rings: step2.equipment.rings,
      parallelBars: step2.equipment.parallelBars,
      resistanceBands: step2.equipment.resistanceBands,
    };

    console.log('[D-S_ASSESSMENT] User equipment:', userEquipment);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hasCompletedAssessment: true,
        assessmentDate: new Date(),
        fitnessLevel: overallLevel,
        equipment: JSON.stringify(userEquipment),
        // Store D-S assessment results
        difficultyLevel: assessmentResult.assignedLevel,
        visualRank: assessmentResult.visualRank,
      },
    });

    console.log(`[D-S_ASSESSMENT] ✅ User ${userId} assessment completed!`, {
      userId: updatedUser.id,
      fitnessLevel: updatedUser.fitnessLevel,
      assignedLevel: assessmentResult.assignedLevel,
      visualRank: assessmentResult.visualRank,
      hasCompletedAssessment: updatedUser.hasCompletedAssessment,
    });

    // Final verification
    console.log('[D-S_ASSESSMENT] Final verification - Reading user with hexagon profile...');
    const finalVerification = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hexagonProfile: true,
      },
    });

    if (!finalVerification?.hexagonProfile) {
      console.error('[D-S_ASSESSMENT] ❌ CRITICAL: Final verification failed - hexagon profile not found!');
      return NextResponse.json(
        {
          error: 'Data persistence verification failed',
          details: 'Hexagon profile was not found after save. Please try again.'
        },
        { status: 500 }
      );
    }

    console.log('[D-S_ASSESSMENT] Final verification SUCCESS:', {
      userExists: true,
      hasHexagonProfile: true,
      hexagonId: finalVerification.hexagonProfile.id,
    });

    // Return response
    const response = NextResponse.json({
      success: true,
      message: 'D-S assessment processed successfully',
      assignedLevel: assessmentResult.assignedLevel,
      visualRank: assessmentResult.visualRank,
      visualValue: assessmentResult.visualValue,
      unifiedLevel: assessmentResult.unifiedLevel,
      estimatedTrainingAge: assessmentResult.estimatedTrainingAge,
      recommendedExercises: assessmentResult.recommendedStartingExercises,
      figBranchLevels: figBranchLevels, // 🆕 NEW: FIG skill branch levels
      hexagonProfile: {
        // Visual values (0-10 scale)
        balance: balanceValue,
        strength: strengthValue,
        staticHolds: staticHoldsValue,
        core: coreValue,
        endurance: enduranceValue,
        mobility: mobilityValue,
        // XP values
        balanceXP: hexagonXP.balanceControlXP,
        strengthXP: hexagonXP.relativeStrengthXP,
        staticHoldsXP: hexagonXP.skillTechniqueXP,
        coreXP: hexagonXP.bodyTensionXP,
        enduranceXP: hexagonXP.muscularEnduranceXP,
        mobilityXP: hexagonXP.jointMobilityXP,
        // Level values
        balanceLevel: balanceLevel,
        strengthLevel: strengthLevel,
        staticHoldsLevel: staticHoldsLevel,
        coreLevel: coreLevel,
        enduranceLevel: enduranceLevel,
        mobilityLevel: mobilityLevel,
      },
      overallLevel,
      redirectTo: '/onboarding/results',
      _debug: {
        hexagonId: finalVerification.hexagonProfile.id,
        userId: finalVerification.hexagonProfile.userId,
        verified: true,
        fullHexagon: finalVerification.hexagonProfile,
      }
    });

    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error: any) {
    console.error('[D-S_ASSESSMENT] Error processing assessment:', error);
    console.error('[D-S_ASSESSMENT] Error stack:', error?.stack);

    // Handle Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Assessment already exists for this user' },
        { status: 409 }
      );
    }

    if (error?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to process D-S assessment',
        message: error?.message,
        stack: error?.stack,
      },
      { status: 500 }
    );
  }
}
