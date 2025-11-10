import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MasteryGoal } from '@/lib/fig-level-progressions';
import { recalculateHexagonFromFigAssessments } from '@/lib/unified-fig-hexagon-mapping';
import {
  getUnifiedLevelFromXP,
  getUnifiedVisualValueFromXP,
  calculateUnifiedOverallLevel,
} from '@/lib/unified-hexagon-system';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * FIG Assessment Result Schema
 */
const FigAssessmentResultSchema = z.object({
  skill: z.string(),
  score: z.number().min(0).max(9),
  level: z.string(),
});

const FigInitialAssessmentSchema = z.object({
  assessments: z.array(FigAssessmentResultSchema).min(1),
});

/**
 * POST /api/assessment/fig-initial
 *
 * Process initial FIG skill assessments from onboarding
 *
 * Request body:
 * {
 *   assessments: [
 *     { skill: 'HANDSTAND', score: 5, level: 'INTERMEDIATE' },
 *     { skill: 'PULL_UPS', score: 3, level: 'BEGINNER' },
 *     ...
 *   ]
 * }
 *
 * This endpoint:
 * 1. Saves all assessments to UserSkillProgress
 * 2. Auto-generates hexagon profile from FIG assessments
 * 3. Marks user as completed assessment
 * 4. Redirects to dashboard
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    console.log('[FIG_ASSESSMENT] POST request received:', {
      hasUserId: !!userId,
      userId: userId,
    });

    if (!userId) {
      console.error('[FIG_ASSESSMENT] No user ID provided');
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const body = await req.json();

    console.log('[FIG_ASSESSMENT] Request body:', {
      hasAssessments: !!body.assessments,
      assessmentsCount: body.assessments?.length,
      assessments: body.assessments,
    });

    const parsed = FigInitialAssessmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid assessment data',
          issues: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const { assessments } = parsed.data;

    console.log(`[FIG_ONBOARDING] Processing ${assessments.length} assessments for user ${userId}`);

    // Step 1: Save all FIG assessments to UserSkillProgress
    const savedAssessments = [];

    for (const assessment of assessments) {
      const { skill, score, level } = assessment;

      // Upsert skill progress
      const skillProgress = await prisma.userSkillProgress.upsert({
        where: {
          userId_skillBranch: {
            userId,
            skillBranch: skill,
          },
        },
        create: {
          userId,
          skillBranch: skill,
          currentLevel: level,
          assessmentScore: score,
          assessmentDate: new Date(),
        },
        update: {
          currentLevel: level,
          assessmentScore: score,
          assessmentDate: new Date(),
        },
      });

      savedAssessments.push(skillProgress);
      console.log(`[FIG_ONBOARDING] Saved ${skill}: ${level} (score: ${score})`);
    }

    // Step 2: Auto-generate hexagon profile from FIG assessments
    const assessmentData = assessments.map((a: any) => ({
      skill: a.skill as MasteryGoal,
      level: a.level,
    }));

    console.log('[FIG_ONBOARDING] Assessment data for hexagon calculation:', assessmentData);

    const calculatedXP = recalculateHexagonFromFigAssessments(assessmentData);

    console.log('[FIG_ONBOARDING] Calculated XP from assessments:', calculatedXP);

    // Map unified axes to old schema field names
    const balanceXP = calculatedXP.balance || 0;
    const strengthXP = calculatedXP.strength || 0;
    const staticHoldsXP = calculatedXP.staticHolds || 0;
    const coreXP = calculatedXP.core || 0;
    const enduranceXP = calculatedXP.endurance || 0;
    const mobilityXP = calculatedXP.mobility || 0;

    console.log('[FIG_ONBOARDING] Mapped XP values:', {
      balance: balanceXP,
      strength: strengthXP,
      staticHolds: staticHoldsXP,
      core: coreXP,
      endurance: enduranceXP,
      mobility: mobilityXP
    });

    const balanceLevel = getUnifiedLevelFromXP(balanceXP);
    const strengthLevel = getUnifiedLevelFromXP(strengthXP);
    const staticHoldsLevel = getUnifiedLevelFromXP(staticHoldsXP);
    const coreLevel = getUnifiedLevelFromXP(coreXP);
    const enduranceLevel = getUnifiedLevelFromXP(enduranceXP);
    const mobilityLevel = getUnifiedLevelFromXP(mobilityXP);

    const balanceValue = getUnifiedVisualValueFromXP(balanceXP, balanceLevel);
    const strengthValue = getUnifiedVisualValueFromXP(strengthXP, strengthLevel);
    const staticHoldsValue = getUnifiedVisualValueFromXP(staticHoldsXP, staticHoldsLevel);
    const coreValue = getUnifiedVisualValueFromXP(coreXP, coreLevel);
    const enduranceValue = getUnifiedVisualValueFromXP(enduranceXP, enduranceLevel);
    const mobilityValue = getUnifiedVisualValueFromXP(mobilityXP, mobilityLevel);

    console.log('[FIG_ONBOARDING] Calculated visual values (0-10):', {
      balance: balanceValue,
      strength: strengthValue,
      staticHolds: staticHoldsValue,
      core: coreValue,
      endurance: enduranceValue,
      mobility: mobilityValue
    });

    console.log('[FIG_ONBOARDING] Calculated levels:', {
      balance: balanceLevel,
      strength: strengthLevel,
      staticHolds: staticHoldsLevel,
      core: coreLevel,
      endurance: enduranceLevel,
      mobility: mobilityLevel
    });

    // Create/update hexagon profile
    console.log('[FIG_ASSESSMENT] About to create/update hexagon profile for userId:', userId);
    console.log('[FIG_ASSESSMENT] Hexagon data to save:', {
      visualValues: {
        balanceControl: balanceValue,
        relativeStrength: strengthValue,
        skillTechnique: staticHoldsValue,
        bodyTension: coreValue,
        muscularEndurance: enduranceValue,
        jointMobility: mobilityValue,
      },
      xpValues: {
        balanceControlXP: balanceXP,
        relativeStrengthXP: strengthXP,
        skillTechniqueXP: staticHoldsXP,
        bodyTensionXP: coreXP,
        muscularEnduranceXP: enduranceXP,
        jointMobilityXP: mobilityXP,
      },
      levels: {
        balanceControlLevel: balanceLevel,
        relativeStrengthLevel: strengthLevel,
        skillTechniqueLevel: staticHoldsLevel,
        bodyTensionLevel: coreLevel,
        muscularEnduranceLevel: enduranceLevel,
        jointMobilityLevel: mobilityLevel,
      }
    });

    let hexagonProfile;
    try {
      console.log('[FIG_ASSESSMENT] Calling prisma.hexagonProfile.upsert...');
      hexagonProfile = await prisma.hexagonProfile.upsert({
        where: { userId },
        create: {
          userId,
          balanceControl: balanceValue,
          relativeStrength: strengthValue,
          skillTechnique: staticHoldsValue,
          bodyTension: coreValue,
          muscularEndurance: enduranceValue,
          jointMobility: mobilityValue,
          balanceControlXP: balanceXP,
          relativeStrengthXP: strengthXP,
          skillTechniqueXP: staticHoldsXP,
          bodyTensionXP: coreXP,
          muscularEnduranceXP: enduranceXP,
          jointMobilityXP: mobilityXP,
          balanceControlLevel: balanceLevel,
          relativeStrengthLevel: strengthLevel,
          skillTechniqueLevel: staticHoldsLevel,
          bodyTensionLevel: coreLevel,
          muscularEnduranceLevel: enduranceLevel,
          jointMobilityLevel: mobilityLevel,
        },
        update: {
          balanceControl: balanceValue,
          relativeStrength: strengthValue,
          skillTechnique: staticHoldsValue,
          bodyTension: coreValue,
          muscularEndurance: enduranceValue,
          jointMobility: mobilityValue,
          balanceControlXP: balanceXP,
          relativeStrengthXP: strengthXP,
          skillTechniqueXP: staticHoldsXP,
          bodyTensionXP: coreXP,
          muscularEnduranceXP: enduranceXP,
          jointMobilityXP: mobilityXP,
          balanceControlLevel: balanceLevel,
          relativeStrengthLevel: strengthLevel,
          skillTechniqueLevel: staticHoldsLevel,
          bodyTensionLevel: coreLevel,
          muscularEnduranceLevel: enduranceLevel,
          jointMobilityLevel: mobilityLevel,
        },
      });

      console.log('[FIG_ASSESSMENT] Hexagon profile upsert completed successfully!', {
        hexagonId: hexagonProfile.id,
        userId: hexagonProfile.userId,
      });
    } catch (hexagonError) {
      console.error('[FIG_ASSESSMENT] CRITICAL ERROR: Failed to create/update hexagon profile:', hexagonError);
      console.error('[FIG_ASSESSMENT] Error details:', {
        errorMessage: hexagonError instanceof Error ? hexagonError.message : 'Unknown error',
        errorStack: hexagonError instanceof Error ? hexagonError.stack : null,
        userId,
      });
      return NextResponse.json(
        { error: 'Failed to create hexagon profile', details: hexagonError instanceof Error ? hexagonError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    console.log('[FIG_ONBOARDING] Hexagon profile created/updated successfully:', {
      hexagonId: hexagonProfile.id,
      userId: hexagonProfile.userId,
      visualValues: {
        balance: balanceValue.toFixed(1),
        strength: strengthValue.toFixed(1),
        staticHolds: staticHoldsValue.toFixed(1),
        core: coreValue.toFixed(1),
        endurance: enduranceValue.toFixed(1),
        mobility: mobilityValue.toFixed(1),
      },
      xpValues: {
        balance: hexagonProfile.balanceControlXP,
        strength: hexagonProfile.relativeStrengthXP,
        staticHolds: hexagonProfile.skillTechniqueXP,
        core: hexagonProfile.bodyTensionXP,
        endurance: hexagonProfile.muscularEnduranceXP,
        mobility: hexagonProfile.jointMobilityXP,
      },
      levels: {
        balance: hexagonProfile.balanceControlLevel,
        strength: hexagonProfile.relativeStrengthLevel,
        staticHolds: hexagonProfile.skillTechniqueLevel,
        core: hexagonProfile.bodyTensionLevel,
        endurance: hexagonProfile.muscularEnduranceLevel,
        mobility: hexagonProfile.jointMobilityLevel,
      }
    });

    // Step 3: Verify hexagon was saved
    console.log('[FIG_ASSESSMENT] Verifying hexagon was saved - reading back from DB...');
    const verifyHexagon = await prisma.hexagonProfile.findUnique({
      where: { userId },
    });

    if (!verifyHexagon) {
      console.error('[FIG_ASSESSMENT] CRITICAL: Hexagon profile was NOT found in database after upsert!');
    } else {
      console.log('[FIG_ASSESSMENT] SUCCESS: Hexagon profile verified in database:', {
        id: verifyHexagon.id,
        userId: verifyHexagon.userId,
        relativeStrength: verifyHexagon.relativeStrength,
        balanceControl: verifyHexagon.balanceControl,
      });
    }

    // Step 3: Calculate overall fitness level from hexagon
    const overallLevel = calculateUnifiedOverallLevel({
      balanceLevel,
      strengthLevel,
      staticHoldsLevel,
      coreLevel,
      enduranceLevel,
      mobilityLevel,
    } as any);

    // Step 4: Mark user as completed assessment
    console.log('[FIG_ASSESSMENT] Updating user record with fitnessLevel:', overallLevel);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hasCompletedAssessment: true,
        assessmentDate: new Date(),
        fitnessLevel: overallLevel,
      },
    });

    console.log(`[FIG_ASSESSMENT] ✅ User ${userId} assessment completed successfully!`, {
      userId: updatedUser.id,
      fitnessLevel: updatedUser.fitnessLevel,
      hasCompletedAssessment: updatedUser.hasCompletedAssessment,
      overallLevel,
    });

    // Final verification: Ensure data is persisted by reading it back one more time
    console.log('[FIG_ASSESSMENT] Final verification - Reading user with hexagon profile...');
    const finalVerification = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hexagonProfile: true,
      },
    });

    console.log('[FIG_ASSESSMENT] Final verification result:', {
      userExists: !!finalVerification,
      hasHexagonProfile: !!finalVerification?.hexagonProfile,
      hexagonSample: finalVerification?.hexagonProfile ? {
        balanceControl: finalVerification.hexagonProfile.balanceControl,
        relativeStrength: finalVerification.hexagonProfile.relativeStrength,
        balanceControlXP: finalVerification.hexagonProfile.balanceControlXP,
      } : null,
    });

    if (!finalVerification?.hexagonProfile) {
      console.error('[FIG_ASSESSMENT] ❌ CRITICAL: Final verification failed - hexagon profile not found!');
      return NextResponse.json(
        {
          error: 'Data persistence verification failed',
          details: 'Hexagon profile was not found after save. Please try again.'
        },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'FIG assessments processed successfully',
      assessmentsSaved: savedAssessments.length,
      hexagonProfile: {
        // Visual values (0-10 scale)
        balance: balanceValue,
        strength: strengthValue,
        staticHolds: staticHoldsValue,
        core: coreValue,
        endurance: enduranceValue,
        mobility: mobilityValue,
        // XP values (needed for proper reconstruction)
        balanceXP: balanceXP,
        strengthXP: strengthXP,
        staticHoldsXP: staticHoldsXP,
        coreXP: coreXP,
        enduranceXP: enduranceXP,
        mobilityXP: mobilityXP,
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
    console.error('[FIG_ONBOARDING] Error processing assessments:', error);

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
        error: 'Failed to process FIG assessments',
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
