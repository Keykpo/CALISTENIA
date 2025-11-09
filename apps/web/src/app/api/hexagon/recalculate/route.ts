import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  initializeUnifiedHexagonProfile,
  getUnifiedLevelFromXP,
  getUnifiedVisualValueFromXP,
} from '@/lib/unified-hexagon-system';
import {
  recalculateHexagonFromFigAssessments,
} from '@/lib/unified-fig-hexagon-mapping';
import { MasteryGoal } from '@/lib/fig-level-progressions';

/**
 * POST /api/hexagon/recalculate
 *
 * Recalculates user's hexagon profile based on their FIG skill assessments
 *
 * Headers:
 * - x-user-id: User ID
 *
 * Returns: Updated hexagon profile
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get all user skill progress records
    const skillProgress = await prisma.userSkillProgress.findMany({
      where: {
        userId,
      },
      select: {
        masteryGoal: true,
        assessmentScore: true,
      },
    });

    if (skillProgress.length === 0) {
      // No assessments found - initialize with default values
      const defaultProfile = initializeUnifiedHexagonProfile();

      // Update or create hexagon profile
      const hexagonProfile = await prisma.hexagonProfile.upsert({
        where: { userId },
        create: {
          userId,
          // Map unified axes to old schema
          balanceControl: defaultProfile.balance,
          relativeStrength: defaultProfile.strength,
          skillTechnique: defaultProfile.staticHolds,
          bodyTension: defaultProfile.core,
          muscularEndurance: defaultProfile.endurance,
          jointMobility: defaultProfile.mobility,
          balanceControlXP: defaultProfile.balanceXP,
          relativeStrengthXP: defaultProfile.strengthXP,
          skillTechniqueXP: defaultProfile.staticHoldsXP,
          bodyTensionXP: defaultProfile.coreXP,
          muscularEnduranceXP: defaultProfile.enduranceXP,
          jointMobilityXP: defaultProfile.mobilityXP,
          balanceControlLevel: defaultProfile.balanceLevel,
          relativeStrengthLevel: defaultProfile.strengthLevel,
          skillTechniqueLevel: defaultProfile.staticHoldsLevel,
          bodyTensionLevel: defaultProfile.coreLevel,
          muscularEnduranceLevel: defaultProfile.enduranceLevel,
          jointMobilityLevel: defaultProfile.mobilityLevel,
        },
        update: {
          balanceControl: defaultProfile.balance,
          relativeStrength: defaultProfile.strength,
          skillTechnique: defaultProfile.staticHolds,
          bodyTension: defaultProfile.core,
          muscularEndurance: defaultProfile.endurance,
          jointMobility: defaultProfile.mobility,
          balanceControlXP: defaultProfile.balanceXP,
          relativeStrengthXP: defaultProfile.strengthXP,
          skillTechniqueXP: defaultProfile.staticHoldsXP,
          bodyTensionXP: defaultProfile.coreXP,
          muscularEnduranceXP: defaultProfile.enduranceXP,
          jointMobilityXP: defaultProfile.mobilityXP,
          balanceControlLevel: defaultProfile.balanceLevel,
          relativeStrengthLevel: defaultProfile.strengthLevel,
          skillTechniqueLevel: defaultProfile.staticHoldsLevel,
          bodyTensionLevel: defaultProfile.coreLevel,
          muscularEnduranceLevel: defaultProfile.enduranceLevel,
          jointMobilityLevel: defaultProfile.mobilityLevel,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Hexagon initialized with default values',
        hexagonProfile,
      });
    }

    // Map assessment scores to levels
    const assessments = skillProgress.map(sp => {
      let level: string = 'BEGINNER';
      const score = sp.assessmentScore || 0;

      // Map assessment score to level (based on your assessment system)
      if (score >= 8) {
        level = 'ELITE';
      } else if (score >= 6) {
        level = 'ADVANCED';
      } else if (score >= 3) {
        level = 'INTERMEDIATE';
      } else {
        level = 'BEGINNER';
      }

      return {
        skill: sp.masteryGoal as MasteryGoal,
        level,
      };
    });

    // Recalculate hexagon XP from assessments
    const calculatedXP = recalculateHexagonFromFigAssessments(assessments);

    // Map unified axes to old schema and calculate visual values and levels
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

    // Update hexagon profile
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

    return NextResponse.json({
      success: true,
      message: 'Hexagon recalculated successfully',
      hexagonProfile,
      assessmentsUsed: assessments.length,
    });
  } catch (error) {
    console.error('Error recalculating hexagon:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate hexagon' },
      { status: 500 }
    );
  }
}
