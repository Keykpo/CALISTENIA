/**
 * ASSESSMENT TO FIG BRANCHES MAPPING
 *
 * Intelligent mapping algorithm that assigns initial levels to all 17 FIG skill branches
 * based on the unified onboarding assessment results.
 *
 * Uses both DIRECT MAPPING (specific questions) and INFERRED MAPPING (combinations)
 * to provide a complete skill profile from a single assessment.
 */

import type { MasteryGoal } from './fig-level-progressions';
import type { DifficultyLevel } from './assessment-d-s-logic';
import type { AssessmentStep3Data, AssessmentStep4Data } from './assessment-d-s-logic';

export type FigBranchLevels = Record<MasteryGoal, DifficultyLevel>;

// ==========================================
// DIRECT MAPPING HELPERS
// ==========================================

/**
 * Map handstand ability to level
 */
function mapHandstandLevel(
  handstand: AssessmentStep4Data['handstand'],
  crowPose?: AssessmentStep4Data['crowPose']
): DifficultyLevel {
  if (!handstand || handstand === 'no') {
    // Use crow pose as beginner indicator
    if (crowPose === '30s+') return 'C';
    if (crowPose === '10-30s') return 'C';
    return 'D';
  }

  if (handstand === 'freestanding_15s+') return 'A';
  if (handstand === 'freestanding_5-15s') return 'B';
  if (handstand === 'wall_15-60s') return 'C';
  if (handstand === 'wall_5-15s') return 'C';

  return 'D';
}

/**
 * Map handstand push-up ability to level
 */
function mapHandstandPushupLevel(
  hspu: AssessmentStep4Data['handstandPushUp']
): DifficultyLevel {
  if (!hspu || hspu === 'no') return 'D';
  if (hspu === 'freestanding') return 'S';
  if (hspu === 'full_wall_6+') return 'A';
  if (hspu === 'full_wall_1-5') return 'B';
  if (hspu === 'partial_wall') return 'C';
  return 'D';
}

/**
 * Map front lever ability to level
 */
function mapFrontLeverLevel(
  frontLever: AssessmentStep4Data['frontLever']
): DifficultyLevel {
  if (!frontLever || frontLever === 'no') return 'D';
  if (frontLever === 'full_3s+') return 'S';
  if (frontLever === 'one_leg_3-8s' || frontLever === 'straddle_3-8s') return 'A';
  if (frontLever === 'adv_tuck_5-10s') return 'B';
  if (frontLever === 'tuck_5-10s') return 'C';
  return 'D';
}

/**
 * Map back lever ability to level
 */
function mapBackLeverLevel(
  backLever?: AssessmentStep4Data['backLever']
): DifficultyLevel {
  if (!backLever || backLever === 'no') return 'D';
  if (backLever === 'full') return 'A';
  if (backLever === 'straddle') return 'B';
  if (backLever === 'adv_tuck') return 'C';
  if (backLever === 'tuck') return 'C';
  return 'D';
}

/**
 * Map planche ability to level
 */
function mapPlancheLevel(
  planche: AssessmentStep4Data['planche']
): DifficultyLevel {
  if (!planche || planche === 'no') return 'D';
  if (planche === 'full_3s+') return 'S';
  if (planche === 'straddle_3-8s') return 'A';
  if (planche === 'adv_tuck_5-10s') return 'B';
  if (planche === 'frog_tuck_5-10s') return 'C';
  return 'D';
}

/**
 * Map L-sit ability to level
 */
function mapLSitMannaLevel(
  lSit: AssessmentStep4Data['lSit'],
  lSitAttempt?: AssessmentStep3Data['lSitAttempt']
): DifficultyLevel {
  if (!lSit || lSit === 'no') {
    // Use Step 3 basic L-sit attempt as indicator
    if (lSitAttempt === 'full') return 'C';
    if (lSitAttempt === 'one_leg') return 'C';
    if (lSitAttempt === 'tuck') return 'D';
    return 'D';
  }

  if (lSit === 'full_20s+_or_vsit') return 'A';
  if (lSit === 'full_10-20s') return 'B';
  if (lSit === 'bent_legs_10-20s') return 'C';
  if (lSit === 'tuck_10-20s') return 'C';
  return 'D';
}

/**
 * Map muscle-up ability to level
 */
function mapMuscleUpLevel(
  muscleUp: AssessmentStep4Data['muscleUp']
): DifficultyLevel {
  if (!muscleUp || muscleUp === 'no') return 'D';
  if (muscleUp === 'strict_4+') return 'A';
  if (muscleUp === 'strict_1-3') return 'B';
  if (muscleUp === 'kipping') return 'C';
  return 'D';
}

/**
 * Map human flag ability to level
 */
function mapFlagLevel(
  humanFlag?: AssessmentStep4Data['humanFlag']
): DifficultyLevel {
  if (!humanFlag || humanFlag === 'no') return 'D';
  if (humanFlag === 'full') return 'S';
  if (humanFlag === 'straddle') return 'A';
  if (humanFlag === 'adv_tuck') return 'B';
  if (humanFlag === 'tuck') return 'C';
  return 'D';
}

/**
 * Map ab wheel ability to level
 */
function mapAbWheelLevel(
  abWheel?: AssessmentStep4Data['abWheel'],
  plankTime?: number
): DifficultyLevel {
  if (!abWheel || abWheel === 'no') {
    // Infer from plank time
    if (plankTime && plankTime >= 120) return 'C';
    return 'D';
  }

  if (abWheel === 'standing') return 'A';
  if (abWheel === 'knees_full') return 'B';
  if (abWheel === 'knees_partial') return 'C';
  return 'D';
}

/**
 * Map pistol squat ability to level
 */
function mapPistolSquatLevel(
  pistolSquat: AssessmentStep3Data['pistolSquat']
): DifficultyLevel {
  if (pistolSquat === '9+') return 'A';
  if (pistolSquat === '4-8') return 'B';
  if (pistolSquat === '1-3') return 'C';
  if (pistolSquat === 'assisted') return 'D';
  return 'D';
}

// ==========================================
// INFERRED MAPPING HELPERS
// ==========================================

/**
 * Infer pull-ups level from fundamentals + weighted
 */
function inferPullUpsLevel(
  pullUps: number,
  weightedPullUps?: AssessmentStep4Data['weightedPullUps']
): DifficultyLevel {
  if (weightedPullUps === '+45lbs+') return 'S';
  if (weightedPullUps === '+25-40lbs') return 'A';
  if (weightedPullUps === '+10-20lbs') return 'B';

  // Based on reps alone
  if (pullUps >= 26) return 'A';
  if (pullUps >= 16) return 'B';
  if (pullUps >= 9) return 'C';
  if (pullUps >= 4) return 'D';

  return 'D';
}

/**
 * Infer one-arm pull-up level from archer + OAP data
 */
function inferOneArmPullUpLevel(
  archerPullUp: AssessmentStep4Data['archerPullUp'],
  oneArmPullUp: AssessmentStep4Data['oneArmPullUp']
): DifficultyLevel {
  if (!oneArmPullUp || oneArmPullUp === 'no') {
    // Use archer pull-ups as indicator
    if (!archerPullUp || archerPullUp === 'no') return 'D';
    if (archerPullUp === 'full_6+_each') return 'B';
    if (archerPullUp === 'full_3-5_each') return 'C';
    if (archerPullUp === 'assisted') return 'D';
    return 'D';
  }

  if (oneArmPullUp === '2+_reps') return 'S';
  if (oneArmPullUp === '1_rep_clean') return 'A';
  if (oneArmPullUp === 'band_assisted') return 'B';
  return 'D';
}

/**
 * Infer dips level from fundamentals + weighted
 */
function inferDipsLevel(
  dips: number,
  weightedDips?: AssessmentStep4Data['weightedDips']
): DifficultyLevel {
  if (weightedDips === '+45lbs+') return 'S';
  if (weightedDips === '+25-40lbs') return 'A';
  if (weightedDips === '+10-20lbs') return 'B';

  // Based on reps alone
  if (dips >= 20) return 'A';
  if (dips >= 12) return 'B';
  if (dips >= 5) return 'C';
  if (dips >= 1) return 'D';

  return 'D';
}

/**
 * Infer ring dips level from dips + ring support
 */
function inferRingDipsLevel(
  dips: number,
  ringSupport?: AssessmentStep4Data['ringSupport'],
  weightedDips?: AssessmentStep4Data['weightedDips']
): DifficultyLevel {
  // Ring support is strong indicator
  if (ringSupport === 'stable_60s+_RTO') return 'A';
  if (ringSupport === 'stable_30s') return 'B';
  if (ringSupport === 'shaky') return 'C';

  // Infer from regular dips
  const dipsLevel = inferDipsLevel(dips, weightedDips);

  // Ring dips are harder, so downgrade by one level
  if (dipsLevel === 'S') return 'A';
  if (dipsLevel === 'A') return 'B';
  if (dipsLevel === 'B') return 'C';
  if (dipsLevel === 'C') return 'D';

  return 'D';
}

/**
 * Infer rings handstand level from handstand + ring support
 */
function inferRingsHandstandLevel(
  handstand: AssessmentStep4Data['handstand'],
  ringSupport?: AssessmentStep4Data['ringSupport']
): DifficultyLevel {
  const handstandLevel = mapHandstandLevel(handstand);

  // Ring support is prerequisite
  if (!ringSupport || ringSupport === 'no' || ringSupport === 'shaky') {
    return 'D';
  }

  // If can do freestanding on floor, can attempt on rings
  if (ringSupport === 'stable_60s+_RTO') {
    if (handstandLevel === 'S') return 'B'; // Still very hard on rings
    if (handstandLevel === 'A') return 'C';
    if (handstandLevel === 'B') return 'D';
  }

  if (ringSupport === 'stable_30s') {
    return 'D'; // Just starting rings handstand
  }

  return 'D';
}

/**
 * Infer press handstand level from handstand + shoulder strength
 */
function inferPressHandstandLevel(
  handstand: AssessmentStep4Data['handstand'],
  dips: number,
  hspu: AssessmentStep4Data['handstandPushUp']
): DifficultyLevel {
  // Need handstand first
  if (!handstand || handstand === 'no' || handstand === 'wall_5-15s') {
    return 'D';
  }

  // HSPU is good indicator of pressing strength
  if (hspu === 'freestanding') return 'B'; // Can probably do press
  if (hspu === 'full_wall_6+') return 'C';

  // Need strong shoulders
  if (dips >= 15 && (handstand === 'freestanding_5-15s' || handstand === 'freestanding_15s+')) {
    return 'C';
  }

  return 'D';
}

/**
 * Infer straight arm press level (very advanced)
 */
function inferStraightArmPressLevel(
  handstand: AssessmentStep4Data['handstand'],
  planche: AssessmentStep4Data['planche']
): DifficultyLevel {
  // Requires advanced planche + handstand
  if (
    planche === 'full_3s+' &&
    (handstand === 'freestanding_15s+' || handstand === 'freestanding_5-15s')
  ) {
    return 'B'; // Can start training
  }

  if (planche === 'straddle_3-8s' && handstand === 'freestanding_5-15s') {
    return 'C'; // Prerequisites met
  }

  return 'D'; // Too advanced
}

/**
 * Infer iron cross level from ring support + pull strength
 */
function inferIronCrossLevel(
  ringSupport?: AssessmentStep4Data['ringSupport'],
  pullUps?: number,
  frontLever?: AssessmentStep4Data['frontLever']
): DifficultyLevel {
  // Ring support is mandatory prerequisite
  if (!ringSupport || ringSupport === 'no' || ringSupport === 'shaky') {
    return 'D';
  }

  // Need RTO support + strong pulling
  if (ringSupport === 'stable_60s+_RTO') {
    if (frontLever === 'full_3s+') return 'B';
    if (frontLever === 'straddle_3-8s' || frontLever === 'one_leg_3-8s') return 'C';
    if (pullUps && pullUps >= 20) return 'C';
  }

  return 'D';
}

// ==========================================
// MAIN MAPPING FUNCTION
// ==========================================

/**
 * Map assessment results to all 17 FIG skill branches
 * Uses both direct answers and intelligent inference
 */
export function mapAssessmentToFigBranches(
  step3: AssessmentStep3Data,
  step4?: AssessmentStep4Data
): FigBranchLevels {
  // If no Step 4, all advanced skills default to D
  const defaultStep4: AssessmentStep4Data = {
    handstand: 'no',
    handstandPushUp: 'no',
    frontLever: 'no',
    planche: 'no',
    lSit: 'no',
    muscleUp: 'no',
    archerPullUp: 'no',
    oneArmPullUp: 'no',
  };

  const s4 = step4 || defaultStep4;

  // DIRECT MAPPINGS
  const branches: FigBranchLevels = {
    HANDSTAND: mapHandstandLevel(s4.handstand, s4.crowPose),
    HANDSTAND_PUSHUP: mapHandstandPushupLevel(s4.handstandPushUp),
    FRONT_LEVER: mapFrontLeverLevel(s4.frontLever),
    BACK_LEVER: mapBackLeverLevel(s4.backLever),
    PLANCHE: mapPlancheLevel(s4.planche),
    L_SIT_MANNA: mapLSitMannaLevel(s4.lSit, step3.lSitAttempt),
    MUSCLE_UP: mapMuscleUpLevel(s4.muscleUp),
    FLAG: mapFlagLevel(s4.humanFlag),
    AB_WHEEL: mapAbWheelLevel(s4.abWheel, step3.plankTime),
    PISTOL_SQUAT: mapPistolSquatLevel(step3.pistolSquat),

    // INFERRED MAPPINGS
    PULL_UPS: inferPullUpsLevel(step3.pullUps, s4.weightedPullUps),
    ONE_ARM_PULL_UP: inferOneArmPullUpLevel(s4.archerPullUp, s4.oneArmPullUp),
    DIPS: inferDipsLevel(step3.dips, s4.weightedDips),
    RING_DIPS: inferRingDipsLevel(step3.dips, s4.ringSupport, s4.weightedDips),
    RINGS_HANDSTAND: inferRingsHandstandLevel(s4.handstand, s4.ringSupport),
    PRESS_HANDSTAND: inferPressHandstandLevel(s4.handstand, step3.dips, s4.handstandPushUp),
    STRAIGHT_ARM_PRESS: inferStraightArmPressLevel(s4.handstand, s4.planche),
    IRON_CROSS: inferIronCrossLevel(s4.ringSupport, step3.pullUps, s4.frontLever),
  };

  return branches;
}

/**
 * Helper to get a summary of which branches are at each level
 */
export function getBranchLevelDistribution(
  branches: FigBranchLevels
): Record<DifficultyLevel, number> {
  const distribution: Record<DifficultyLevel, number> = {
    D: 0,
    C: 0,
    B: 0,
    A: 0,
    S: 0,
  };

  Object.values(branches).forEach((level) => {
    distribution[level]++;
  });

  return distribution;
}

/**
 * Helper to identify strongest and weakest branches
 */
export function getStrengthWeaknessAnalysis(branches: FigBranchLevels): {
  strongest: Array<{ branch: MasteryGoal; level: DifficultyLevel }>;
  weakest: Array<{ branch: MasteryGoal; level: DifficultyLevel }>;
  balanced: boolean;
} {
  const entries = Object.entries(branches) as Array<[MasteryGoal, DifficultyLevel]>;

  const levelOrder: Record<DifficultyLevel, number> = { D: 0, C: 1, B: 2, A: 3, S: 4 };

  const sorted = entries.sort((a, b) => levelOrder[b[1]] - levelOrder[a[1]]);

  const strongest = sorted
    .slice(0, 3)
    .map(([branch, level]) => ({ branch, level }));

  const weakest = sorted
    .slice(-3)
    .map(([branch, level]) => ({ branch, level }));

  // Check if balanced (all within 2 levels of each other)
  const maxLevel = levelOrder[sorted[0][1]];
  const minLevel = levelOrder[sorted[sorted.length - 1][1]];
  const balanced = maxLevel - minLevel <= 2;

  return { strongest, weakest, balanced };
}
