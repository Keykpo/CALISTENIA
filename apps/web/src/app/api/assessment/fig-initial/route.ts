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

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const body = await req.json();
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

    const calculatedXP = recalculateHexagonFromFigAssessments(assessmentData);

    // Map unified axes to old schema field names
    const balanceXP = calculatedXP.balance || 0;
    const strengthXP = calculatedXP.strength || 0;
    const staticHoldsXP = calculatedXP.staticHolds || 0;
    const coreXP = calculatedXP.core || 0;
    const enduranceXP = calculatedXP.endurance || 0;
    const mobilityXP = calculatedXP.mobility || 0;

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

    // Create/update hexagon profile
    const hexagonProfile = await prisma.hexagonProfile.upsert({
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

    console.log('[FIG_ONBOARDING] Hexagon profile created/updated:', {
      balance: balanceValue.toFixed(1),
      strength: strengthValue.toFixed(1),
      staticHolds: staticHoldsValue.toFixed(1),
      core: coreValue.toFixed(1),
      endurance: enduranceValue.toFixed(1),
      mobility: mobilityValue.toFixed(1),
    });

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
    await prisma.user.update({
      where: { id: userId },
      data: {
        hasCompletedAssessment: true,
        assessmentDate: new Date(),
        fitnessLevel: overallLevel,
      },
    });

    console.log(`[FIG_ONBOARDING] User ${userId} assessment completed. Overall level: ${overallLevel}`);

    return NextResponse.json({
      success: true,
      message: 'FIG assessments processed successfully',
      assessmentsSaved: savedAssessments.length,
      hexagonProfile: {
        balance: balanceValue,
        strength: strengthValue,
        staticHolds: staticHoldsValue,
        core: coreValue,
        endurance: enduranceValue,
        mobility: mobilityValue,
      },
      overallLevel,
      redirectTo: '/onboarding/results',
    });

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
