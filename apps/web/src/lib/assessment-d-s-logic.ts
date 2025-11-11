/**
 * D-S ASSESSMENT LOGIC
 *
 * Implements the 4-step progressive assessment that assigns users
 * to levels D, C, B, A, or S based on their performance.
 *
 * Synced with unified hexagon system and FIG progression.
 */

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type DifficultyLevel = 'D' | 'C' | 'B' | 'A' | 'S';
export type UnifiedProgressionLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

export interface AssessmentStep1Data {
  age: number;
  height: number; // cm
  weight: number; // kg
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  goals: string[]; // Up to 3 primary goals
}

export interface AssessmentStep2Data {
  equipment: {
    floor: boolean;
    pullUpBar: boolean;
    rings: boolean;
    parallelBars: boolean;
    resistanceBands: boolean;
  };
}

export interface AssessmentStep3Data {
  // Push tests
  pushUps: number; // 0, 1-5, 6-10, 11-20, 21-30, 31+
  dips: number; // 0, 1-3, 4-8, 9-15, 16+

  // Pull tests
  pullUps: number; // 0, 1-3, 4-8, 9-15, 16-25, 26+
  deadHangTime: number; // seconds: 0, 1-15, 16-30, 31-60, 60+

  // Core tests
  plankTime: number; // seconds: 0-15, 16-30, 31-60, 61-90, 91+
  hollowBodyHold: number; // seconds: 0, <10, 10-20, 20-30, 30+
  lSitAttempt?: 'no' | 'tuck' | 'one_leg' | 'full'; // 🆕 NEW: L-sit capability

  // Legs tests
  squats: number; // 0-10, 11-20, 21-40, 41-60, 61+
  pistolSquat: 'no' | 'assisted' | '1-3' | '4-8' | '9+';

  // 🆕 NEW: Mobility tests
  shoulderMobility?: 'poor' | 'average' | 'good' | 'excellent';
  bridge?: 'no' | 'partial' | 'full';

  // 🆕 NEW: Endurance tests
  maxPushUpsIn60s?: number; // Max push-ups in 1 minute
  circuitEndurance?: 'cannot_complete' | 'long_breaks' | 'short_breaks' | 'no_breaks';
}

export interface AssessmentStep4Data {
  // Balance skills
  handstand: 'no' | 'wall_5-15s' | 'wall_15-60s' | 'freestanding_5-15s' | 'freestanding_15s+';
  handstandPushUp: 'no' | 'partial_wall' | 'full_wall_1-5' | 'full_wall_6+' | 'freestanding';
  crowPose?: 'no' | 'less_than_10s' | '10-30s' | '30s+'; // 🆕 NEW: Basic balance indicator

  // Static holds
  frontLever: 'no' | 'tuck_5-10s' | 'adv_tuck_5-10s' | 'straddle_3-8s' | 'one_leg_3-8s' | 'full_3s+';
  backLever?: 'no' | 'tuck' | 'adv_tuck' | 'straddle' | 'full'; // 🆕 NEW
  planche: 'no' | 'frog_tuck_5-10s' | 'adv_tuck_5-10s' | 'straddle_3-8s' | 'full_3s+';
  lSit: 'no' | 'tuck_10-20s' | 'bent_legs_10-20s' | 'full_10-20s' | 'full_20s+_or_vsit';
  ringSupport?: 'no' | 'shaky' | 'stable_30s' | 'stable_60s+_RTO'; // 🆕 NEW: Ring strength indicator

  // Advanced dynamics
  muscleUp: 'no' | 'kipping' | 'strict_1-3' | 'strict_4+';
  archerPullUp: 'no' | 'assisted' | 'full_3-5_each' | 'full_6+_each';
  oneArmPullUp: 'no' | 'band_assisted' | '1_rep_clean' | '2+_reps';
  weightedPullUps?: 'no' | '+10-20lbs' | '+25-40lbs' | '+45lbs+'; // 🆕 NEW
  weightedDips?: 'no' | '+10-20lbs' | '+25-40lbs' | '+45lbs+'; // 🆕 NEW

  // Misc advanced skills
  humanFlag?: 'no' | 'tuck' | 'adv_tuck' | 'straddle' | 'full'; // 🆕 NEW
  abWheel?: 'no' | 'knees_partial' | 'knees_full' | 'standing'; // 🆕 NEW
}

export interface HexagonAxisXP {
  balanceControlXP: number;
  relativeStrengthXP: number;
  skillTechniqueXP: number;
  bodyTensionXP: number;
  muscularEnduranceXP: number;
  jointMobilityXP: number;
}

export interface AssessmentResult {
  assignedLevel: DifficultyLevel;
  unifiedLevel: UnifiedProgressionLevel;
  hexagonXP: HexagonAxisXP;
  visualRank: string; // e.g., "D+", "C-", "B", "A+", "S"
  visualValue: number; // 0-10 scale
  recommendedStartingExercises: string[];
  estimatedTrainingAge: string; // e.g., "0-6 months", "1-2 years"
}

// ==========================================
// STEP 3: FUNDAMENTAL TEST EVALUATION
// ==========================================

/**
 * Determines if user should skip Step 4 (advanced skills)
 * based on fundamental strength levels
 */
export function shouldShowStep4(step3: AssessmentStep3Data): boolean {
  const minPullUps = step3.pullUps >= 5;
  const minPushUps = step3.pushUps >= 10;
  const minPlank = step3.plankTime >= 30;

  return minPullUps && minPushUps && minPlank;
}

/**
 * Calculate base level from Step 3 fundamental tests
 * This is the minimum level a user can be assigned
 */
export function calculateBaseLevelFromStep3(step3: AssessmentStep3Data): DifficultyLevel {
  const {
    pushUps,
    pullUps,
    plankTime,
    dips,
    hollowBodyHold,
    squats,
    pistolSquat,
  } = step3;

  // LEVEL S criteria (extremely rare from fundamentals alone)
  if (
    pushUps >= 50 &&
    pullUps >= 30 &&
    plankTime >= 180 &&
    dips >= 20
  ) {
    return 'S';
  }

  // LEVEL A criteria
  if (
    pushUps >= 31 &&
    pullUps >= 16 &&
    plankTime >= 90 &&
    dips >= 12 &&
    hollowBodyHold >= 30
  ) {
    return 'A';
  }

  // LEVEL B criteria
  if (
    pushUps >= 16 &&
    pullUps >= 6 &&
    plankTime >= 60 &&
    (dips >= 5 || pistolSquat === '1-3' || pistolSquat === '4-8')
  ) {
    return 'B';
  }

  // LEVEL C criteria
  if (
    pushUps >= 6 &&
    pullUps >= 1 &&
    plankTime >= 30 &&
    hollowBodyHold >= 10
  ) {
    return 'C';
  }

  // Default: LEVEL D
  return 'D';
}

// ==========================================
// STEP 4: ADVANCED SKILLS EVALUATION
// ==========================================

/**
 * Calculate level upgrade based on advanced skills (Step 4)
 * This can elevate a user from their base level
 */
export function calculateLevelFromStep4(
  baseLevel: DifficultyLevel,
  step4: AssessmentStep4Data
): DifficultyLevel {
  let calculatedLevel = baseLevel;

  // S LEVEL indicators (master skills)
  const hasMasterSkills =
    step4.frontLever === 'full_3s+' ||
    step4.planche === 'full_3s+' ||
    step4.oneArmPullUp === '2+_reps' ||
    (step4.handstandPushUp === 'freestanding' && step4.muscleUp === 'strict_4+');

  if (hasMasterSkills) {
    calculatedLevel = 'S';
  }

  // A LEVEL indicators (advanced skills)
  else if (
    step4.frontLever === 'one_leg_3-8s' ||
    step4.frontLever === 'straddle_3-8s' ||
    step4.planche === 'straddle_3-8s' ||
    step4.muscleUp === 'strict_1-3' ||
    step4.muscleUp === 'strict_4+' ||
    step4.oneArmPullUp === '1_rep_clean' ||
    step4.lSit === 'full_20s+_or_vsit' ||
    (step4.handstandPushUp === 'full_wall_6+' && step4.handstand === 'freestanding_15s+')
  ) {
    calculatedLevel = 'A';
  }

  // B LEVEL indicators (intermediate skills)
  else if (
    step4.frontLever === 'tuck_5-10s' ||
    step4.frontLever === 'adv_tuck_5-10s' ||
    step4.planche === 'adv_tuck_5-10s' ||
    step4.lSit === 'full_10-20s' ||
    step4.archerPullUp === 'full_3-5_each' ||
    step4.archerPullUp === 'full_6+_each' ||
    step4.muscleUp === 'kipping' ||
    step4.handstandPushUp === 'full_wall_1-5'
  ) {
    // Only upgrade to B if not already higher
    if (baseLevel === 'D' || baseLevel === 'C') {
      calculatedLevel = 'B';
    }
  }

  // C LEVEL indicators (novice skills)
  else if (
    step4.planche === 'frog_tuck_5-10s' ||
    step4.lSit === 'tuck_10-20s' ||
    step4.handstand === 'wall_15-60s'
  ) {
    // Only upgrade to C if currently D
    if (baseLevel === 'D') {
      calculatedLevel = 'C';
    }
  }

  return calculatedLevel;
}

// ==========================================
// HEXAGON XP CALCULATION
// ==========================================

/**
 * Maps D-S level to base XP per axis (using database field names)
 * These are starting values that get adjusted based on specific skills
 */
const LEVEL_TO_BASE_XP: Record<DifficultyLevel, HexagonAxisXP> = {
  D: {
    balanceControlXP: 5000,
    relativeStrengthXP: 8000,
    skillTechniqueXP: 2000,
    bodyTensionXP: 6000,
    muscularEnduranceXP: 7000,
    jointMobilityXP: 4000,
  },
  C: {
    balanceControlXP: 55000,
    relativeStrengthXP: 65000,
    skillTechniqueXP: 50000,
    bodyTensionXP: 60000,
    muscularEnduranceXP: 70000,
    jointMobilityXP: 52000,
  },
  B: {
    balanceControlXP: 180000,
    relativeStrengthXP: 200000,
    skillTechniqueXP: 170000,
    bodyTensionXP: 185000,
    muscularEnduranceXP: 195000,
    jointMobilityXP: 175000,
  },
  A: {
    balanceControlXP: 420000,
    relativeStrengthXP: 450000,
    skillTechniqueXP: 400000,
    bodyTensionXP: 430000,
    muscularEnduranceXP: 440000,
    jointMobilityXP: 410000,
  },
  S: {
    balanceControlXP: 650000,
    relativeStrengthXP: 700000,
    skillTechniqueXP: 680000,
    bodyTensionXP: 660000,
    muscularEnduranceXP: 670000,
    jointMobilityXP: 640000,
  },
};

/**
 * Calculate hexagon XP based on assessment results
 */
export function calculateHexagonXP(
  level: DifficultyLevel,
  step3: AssessmentStep3Data,
  step4?: AssessmentStep4Data
): HexagonAxisXP {
  // Start with base XP for the level
  const xp = { ...LEVEL_TO_BASE_XP[level] };

  // Adjust based on Step 3 performance
  // High pull-up count = boost strength
  if (step3.pullUps >= 20) {
    xp.relativeStrengthXP += 50000;
  } else if (step3.pullUps >= 10) {
    xp.relativeStrengthXP += 25000;
  }

  // High push-up count = boost strength
  if (step3.pushUps >= 40) {
    xp.relativeStrengthXP += 40000;
  } else if (step3.pushUps >= 25) {
    xp.relativeStrengthXP += 20000;
  }

  // Strong core = boost core axis
  if (step3.plankTime >= 120) {
    xp.bodyTensionXP += 40000;
  } else if (step3.plankTime >= 90) {
    xp.bodyTensionXP += 20000;
  }

  if (step3.hollowBodyHold >= 30) {
    xp.bodyTensionXP += 30000;
  }

  // Pistol squat ability = boost strength & balance
  if (step3.pistolSquat === '9+') {
    xp.relativeStrengthXP += 30000;
    xp.balanceControlXP += 20000;
  } else if (step3.pistolSquat === '4-8') {
    xp.relativeStrengthXP += 15000;
    xp.balanceControlXP += 10000;
  }

  // 🆕 L-Sit attempt = boost core
  if (step3.lSitAttempt === 'full') {
    xp.bodyTensionXP += 25000;
  } else if (step3.lSitAttempt === 'one_leg') {
    xp.bodyTensionXP += 15000;
  } else if (step3.lSitAttempt === 'tuck') {
    xp.bodyTensionXP += 8000;
  }

  // 🆕 Shoulder mobility = boost mobility axis
  if (step3.shoulderMobility === 'excellent') {
    xp.jointMobilityXP += 40000;
  } else if (step3.shoulderMobility === 'good') {
    xp.jointMobilityXP += 25000;
  } else if (step3.shoulderMobility === 'average') {
    xp.jointMobilityXP += 10000;
  }

  // 🆕 Bridge ability = boost mobility axis
  if (step3.bridge === 'full') {
    xp.jointMobilityXP += 35000;
  } else if (step3.bridge === 'partial') {
    xp.jointMobilityXP += 15000;
  }

  // 🆕 Max push-ups in 60s = boost endurance
  if (step3.maxPushUpsIn60s) {
    if (step3.maxPushUpsIn60s >= 40) {
      xp.muscularEnduranceXP += 50000;
    } else if (step3.maxPushUpsIn60s >= 30) {
      xp.muscularEnduranceXP += 35000;
    } else if (step3.maxPushUpsIn60s >= 20) {
      xp.muscularEnduranceXP += 20000;
    } else if (step3.maxPushUpsIn60s >= 10) {
      xp.muscularEnduranceXP += 10000;
    }
  }

  // 🆕 Circuit endurance = boost endurance
  if (step3.circuitEndurance === 'no_breaks') {
    xp.muscularEnduranceXP += 40000;
  } else if (step3.circuitEndurance === 'short_breaks') {
    xp.muscularEnduranceXP += 25000;
  } else if (step3.circuitEndurance === 'long_breaks') {
    xp.muscularEnduranceXP += 10000;
  }

  // Adjust based on Step 4 skills (if provided)
  if (step4) {
    // Handstand skills → balance + core
    if (step4.handstand === 'freestanding_15s+') {
      xp.balanceControlXP += 80000;
      xp.bodyTensionXP += 30000;
    } else if (step4.handstand === 'freestanding_5-15s') {
      xp.balanceControlXP += 50000;
      xp.bodyTensionXP += 20000;
    } else if (step4.handstand === 'wall_15-60s') {
      xp.balanceControlXP += 20000;
      xp.bodyTensionXP += 10000;
    }

    // HSPU → strength + balance
    if (step4.handstandPushUp === 'freestanding') {
      xp.relativeStrengthXP += 100000;
      xp.balanceControlXP += 60000;
    } else if (step4.handstandPushUp === 'full_wall_6+') {
      xp.relativeStrengthXP += 60000;
      xp.balanceControlXP += 30000;
    }

    // Front Lever → skillTechnique + strength
    if (step4.frontLever === 'full_3s+') {
      xp.skillTechniqueXP += 150000;
      xp.relativeStrengthXP += 80000;
    } else if (step4.frontLever === 'one_leg_3-8s' || step4.frontLever === 'straddle_3-8s') {
      xp.skillTechniqueXP += 80000;
      xp.relativeStrengthXP += 40000;
    } else if (step4.frontLever === 'adv_tuck_5-10s') {
      xp.skillTechniqueXP += 40000;
      xp.relativeStrengthXP += 20000;
    } else if (step4.frontLever === 'tuck_5-10s') {
      xp.skillTechniqueXP += 20000;
      xp.relativeStrengthXP += 10000;
    }

    // Planche → skillTechnique + strength
    if (step4.planche === 'full_3s+') {
      xp.skillTechniqueXP += 180000;
      xp.relativeStrengthXP += 90000;
    } else if (step4.planche === 'straddle_3-8s') {
      xp.skillTechniqueXP += 90000;
      xp.relativeStrengthXP += 50000;
    } else if (step4.planche === 'adv_tuck_5-10s') {
      xp.skillTechniqueXP += 45000;
      xp.relativeStrengthXP += 25000;
    } else if (step4.planche === 'frog_tuck_5-10s') {
      xp.skillTechniqueXP += 15000;
      xp.balanceControlXP += 10000;
    }

    // L-Sit → core
    if (step4.lSit === 'full_20s+_or_vsit') {
      xp.bodyTensionXP += 80000;
    } else if (step4.lSit === 'full_10-20s') {
      xp.bodyTensionXP += 40000;
    } else if (step4.lSit === 'bent_legs_10-20s') {
      xp.bodyTensionXP += 20000;
    } else if (step4.lSit === 'tuck_10-20s') {
      xp.bodyTensionXP += 10000;
    }

    // Muscle-up → strength + skillTechnique
    if (step4.muscleUp === 'strict_4+') {
      xp.relativeStrengthXP += 100000;
      xp.skillTechniqueXP += 50000;
    } else if (step4.muscleUp === 'strict_1-3') {
      xp.relativeStrengthXP += 70000;
      xp.skillTechniqueXP += 35000;
    } else if (step4.muscleUp === 'kipping') {
      xp.relativeStrengthXP += 40000;
      xp.skillTechniqueXP += 15000;
    }

    // Archer Pull-up → strength
    if (step4.archerPullUp === 'full_6+_each') {
      xp.relativeStrengthXP += 60000;
    } else if (step4.archerPullUp === 'full_3-5_each') {
      xp.relativeStrengthXP += 35000;
    }

    // One-Arm Pull-up → strength
    if (step4.oneArmPullUp === '2+_reps') {
      xp.relativeStrengthXP += 150000;
    } else if (step4.oneArmPullUp === '1_rep_clean') {
      xp.relativeStrengthXP += 100000;
    } else if (step4.oneArmPullUp === 'band_assisted') {
      xp.relativeStrengthXP += 50000;
    }

    // 🆕 Crow Pose → balance
    if (step4.crowPose === '30s+') {
      xp.balanceControlXP += 25000;
    } else if (step4.crowPose === '10-30s') {
      xp.balanceControlXP += 15000;
    } else if (step4.crowPose === 'less_than_10s') {
      xp.balanceControlXP += 8000;
    }

    // 🆕 Back Lever → skillTechnique + strength
    if (step4.backLever === 'full') {
      xp.skillTechniqueXP += 120000;
      xp.relativeStrengthXP += 60000;
    } else if (step4.backLever === 'straddle') {
      xp.skillTechniqueXP += 70000;
      xp.relativeStrengthXP += 35000;
    } else if (step4.backLever === 'adv_tuck') {
      xp.skillTechniqueXP += 40000;
      xp.relativeStrengthXP += 20000;
    } else if (step4.backLever === 'tuck') {
      xp.skillTechniqueXP += 20000;
      xp.relativeStrengthXP += 10000;
    }

    // 🆕 Ring Support → balance + skillTechnique
    if (step4.ringSupport === 'stable_60s+_RTO') {
      xp.balanceControlXP += 80000;
      xp.skillTechniqueXP += 60000;
    } else if (step4.ringSupport === 'stable_30s') {
      xp.balanceControlXP += 40000;
      xp.skillTechniqueXP += 30000;
    } else if (step4.ringSupport === 'shaky') {
      xp.balanceControlXP += 15000;
      xp.skillTechniqueXP += 10000;
    }

    // 🆕 Weighted Pull-ups → strength
    if (step4.weightedPullUps === '+45lbs+') {
      xp.relativeStrengthXP += 120000;
    } else if (step4.weightedPullUps === '+25-40lbs') {
      xp.relativeStrengthXP += 80000;
    } else if (step4.weightedPullUps === '+10-20lbs') {
      xp.relativeStrengthXP += 45000;
    }

    // 🆕 Weighted Dips → strength
    if (step4.weightedDips === '+45lbs+') {
      xp.relativeStrengthXP += 110000;
    } else if (step4.weightedDips === '+25-40lbs') {
      xp.relativeStrengthXP += 70000;
    } else if (step4.weightedDips === '+10-20lbs') {
      xp.relativeStrengthXP += 40000;
    }

    // 🆕 Human Flag → skillTechnique + core
    if (step4.humanFlag === 'full') {
      xp.skillTechniqueXP += 180000;
      xp.bodyTensionXP += 90000;
    } else if (step4.humanFlag === 'straddle') {
      xp.skillTechniqueXP += 100000;
      xp.bodyTensionXP += 50000;
    } else if (step4.humanFlag === 'adv_tuck') {
      xp.skillTechniqueXP += 60000;
      xp.bodyTensionXP += 30000;
    } else if (step4.humanFlag === 'tuck') {
      xp.skillTechniqueXP += 30000;
      xp.bodyTensionXP += 15000;
    }

    // 🆕 Ab Wheel → core
    if (step4.abWheel === 'standing') {
      xp.bodyTensionXP += 100000;
    } else if (step4.abWheel === 'knees_full') {
      xp.bodyTensionXP += 50000;
    } else if (step4.abWheel === 'knees_partial') {
      xp.bodyTensionXP += 20000;
    }
  }

  return xp;
}

// ==========================================
// VISUAL RANK CALCULATION
// ==========================================

/**
 * Maps XP to visual 0-10 scale
 * Uses the existing unified-hexagon-system logic
 */
export function getVisualValueFromXP(xp: number, level: UnifiedProgressionLevel): number {
  const XP_THRESHOLDS: Record<UnifiedProgressionLevel, { min: number; max: number }> = {
    BEGINNER: { min: 0, max: 48000 },
    INTERMEDIATE: { min: 48000, max: 144000 },
    ADVANCED: { min: 144000, max: 384000 },
    ELITE: { min: 384000, max: Infinity },
  };

  const thresholds = XP_THRESHOLDS[level];
  const levelStart = thresholds.min;
  const levelEnd = thresholds.max === Infinity ? 1000000 : thresholds.max;

  const progressInLevel = (xp - levelStart) / (levelEnd - levelStart);
  const clampedProgress = Math.max(0, Math.min(1, progressInLevel));

  const levelBaseValues: Record<UnifiedProgressionLevel, number> = {
    BEGINNER: 0,
    INTERMEDIATE: 2.5,
    ADVANCED: 5.0,
    ELITE: 7.5,
  };

  const baseValue = levelBaseValues[level];
  const visualValue = baseValue + clampedProgress * 2.5;

  return Math.min(10, Math.max(0, visualValue));
}

/**
 * Maps D-S level to UnifiedProgressionLevel
 */
export function mapDSToUnifiedLevel(dsLevel: DifficultyLevel): UnifiedProgressionLevel {
  const mapping: Record<DifficultyLevel, UnifiedProgressionLevel> = {
    D: 'BEGINNER',
    C: 'INTERMEDIATE',
    B: 'ADVANCED',
    A: 'ELITE',
    S: 'ELITE',
  };
  return mapping[dsLevel];
}

/**
 * Get visual rank (D-, D, D+, C-, etc.) from visual value
 */
export function getVisualRank(visualValue: number): string {
  if (visualValue >= 9.5) return 'S+';
  if (visualValue >= 9.0) return 'S';
  if (visualValue >= 8.5) return 'S-';
  if (visualValue >= 8.0) return 'A+';
  if (visualValue >= 7.0) return 'A';
  if (visualValue >= 6.0) return 'A-';
  if (visualValue >= 5.5) return 'B+';
  if (visualValue >= 5.0) return 'B';
  if (visualValue >= 4.0) return 'B-';
  if (visualValue >= 3.5) return 'C+';
  if (visualValue >= 2.5) return 'C';
  if (visualValue >= 2.0) return 'C-';
  if (visualValue >= 1.5) return 'D+';
  if (visualValue >= 1.0) return 'D';
  return 'D-';
}

// ==========================================
// MAIN ASSESSMENT PROCESSOR
// ==========================================

/**
 * Process complete assessment and return user level + hexagon XP
 */
export function processAssessment(
  step1: AssessmentStep1Data,
  step2: AssessmentStep2Data,
  step3: AssessmentStep3Data,
  step4?: AssessmentStep4Data
): AssessmentResult {
  // Calculate base level from fundamentals
  const baseLevel = calculateBaseLevelFromStep3(step3);

  // Upgrade level if advanced skills are present
  const finalLevel = step4
    ? calculateLevelFromStep4(baseLevel, step4)
    : baseLevel;

  // Calculate hexagon XP
  const hexagonXP = calculateHexagonXP(finalLevel, step3, step4);

  // Map to unified level
  const unifiedLevel = mapDSToUnifiedLevel(finalLevel);

  // Calculate average visual value from all axes
  const avgXP =
    (hexagonXP.balanceControlXP +
      hexagonXP.relativeStrengthXP +
      hexagonXP.skillTechniqueXP +
      hexagonXP.bodyTensionXP +
      hexagonXP.muscularEnduranceXP +
      hexagonXP.jointMobilityXP) /
    6;

  const visualValue = getVisualValueFromXP(avgXP, unifiedLevel);
  const visualRank = getVisualRank(visualValue);

  // Recommended starting exercises based on level
  const recommendedStartingExercises = getRecommendedExercises(finalLevel, step2.equipment);

  // Estimated training age
  const estimatedTrainingAge = getEstimatedTrainingAge(finalLevel);

  return {
    assignedLevel: finalLevel,
    unifiedLevel,
    hexagonXP,
    visualRank,
    visualValue,
    recommendedStartingExercises,
    estimatedTrainingAge,
  };
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getRecommendedExercises(
  level: DifficultyLevel,
  equipment: AssessmentStep2Data['equipment']
): string[] {
  const exercises: Record<DifficultyLevel, string[]> = {
    D: [
      'Wall Push-ups',
      'Dead Hang',
      'Plank Hold',
      'Bodyweight Squats',
      equipment.pullUpBar ? 'Scapular Pulls' : 'Australian Rows (low bar)',
    ],
    C: [
      'Regular Push-ups',
      'Pull-ups (assisted or regular)',
      'Tuck L-Sit',
      'Lunges',
      equipment.parallelBars ? 'Dips (assisted)' : 'Diamond Push-ups',
    ],
    B: [
      'Diamond Push-ups',
      'Pull-ups (10+ reps)',
      'Tuck Front Lever',
      'Pistol Squats',
      equipment.rings ? 'Ring Dips' : 'Archer Push-ups',
    ],
    A: [
      'Archer Pull-ups',
      'L-Sit Pull-ups',
      'Straddle Front Lever',
      'Advanced Tuck Planche',
      'Muscle-up progressions',
    ],
    S: [
      'Full Front Lever',
      'Full Planche',
      'One-Arm Pull-up',
      'Handstand Push-ups',
      'Muscle-ups (strict)',
    ],
  };

  return exercises[level];
}

function getEstimatedTrainingAge(level: DifficultyLevel): string {
  const ages: Record<DifficultyLevel, string> = {
    D: '0-6 months',
    C: '6-18 months',
    B: '1.5-3 years',
    A: '3-5 years',
    S: '5+ years',
  };
  return ages[level];
}
