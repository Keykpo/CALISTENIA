/**
 * NEW FIG ASSESSMENT LOGIC - D-S SYSTEM
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

  // Legs tests
  squats: number; // 0-10, 11-20, 21-40, 41-60, 61+
  pistolSquat: 'no' | 'assisted' | '1-3' | '4-8' | '9+';
}

export interface AssessmentStep4Data {
  // Balance skills
  handstand: 'no' | 'wall_5-15s' | 'wall_15-60s' | 'freestanding_5-15s' | 'freestanding_15s+';
  handstandPushUp: 'no' | 'partial_wall' | 'full_wall_1-5' | 'full_wall_6+' | 'freestanding';

  // Static holds
  frontLever: 'no' | 'tuck_5-10s' | 'adv_tuck_5-10s' | 'straddle_3-8s' | 'one_leg_3-8s' | 'full_3s+';
  planche: 'no' | 'frog_tuck_5-10s' | 'adv_tuck_5-10s' | 'straddle_3-8s' | 'full_3s+';
  lSit: 'no' | 'tuck_10-20s' | 'bent_legs_10-20s' | 'full_10-20s' | 'full_20s+_or_vsit';

  // Advanced dynamics
  muscleUp: 'no' | 'kipping' | 'strict_1-3' | 'strict_4+';
  archerPullUp: 'no' | 'assisted' | 'full_3-5_each' | 'full_6+_each';
  oneArmPullUp: 'no' | 'band_assisted' | '1_rep_clean' | '2+_reps';
}

export interface HexagonAxisXP {
  balance: number;
  strength: number;
  staticHolds: number;
  core: number;
  endurance: number;
  mobility: number;
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
 * Maps D-S level to base XP per axis
 * These are starting values that get adjusted based on specific skills
 */
const LEVEL_TO_BASE_XP: Record<DifficultyLevel, HexagonAxisXP> = {
  D: {
    balance: 5000,
    strength: 8000,
    staticHolds: 2000,
    core: 6000,
    endurance: 7000,
    mobility: 4000,
  },
  C: {
    balance: 55000,
    strength: 65000,
    staticHolds: 50000,
    core: 60000,
    endurance: 70000,
    mobility: 52000,
  },
  B: {
    balance: 180000,
    strength: 200000,
    staticHolds: 170000,
    core: 185000,
    endurance: 195000,
    mobility: 175000,
  },
  A: {
    balance: 420000,
    strength: 450000,
    staticHolds: 400000,
    core: 430000,
    endurance: 440000,
    mobility: 410000,
  },
  S: {
    balance: 650000,
    strength: 700000,
    staticHolds: 680000,
    core: 660000,
    endurance: 670000,
    mobility: 640000,
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
    xp.strength += 50000;
  } else if (step3.pullUps >= 10) {
    xp.strength += 25000;
  }

  // High push-up count = boost strength
  if (step3.pushUps >= 40) {
    xp.strength += 40000;
  } else if (step3.pushUps >= 25) {
    xp.strength += 20000;
  }

  // Strong core = boost core axis
  if (step3.plankTime >= 120) {
    xp.core += 40000;
  } else if (step3.plankTime >= 90) {
    xp.core += 20000;
  }

  if (step3.hollowBodyHold >= 30) {
    xp.core += 30000;
  }

  // Pistol squat ability = boost strength & balance
  if (step3.pistolSquat === '9+') {
    xp.strength += 30000;
    xp.balance += 20000;
  } else if (step3.pistolSquat === '4-8') {
    xp.strength += 15000;
    xp.balance += 10000;
  }

  // Adjust based on Step 4 skills (if provided)
  if (step4) {
    // Handstand skills → balance + core
    if (step4.handstand === 'freestanding_15s+') {
      xp.balance += 80000;
      xp.core += 30000;
    } else if (step4.handstand === 'freestanding_5-15s') {
      xp.balance += 50000;
      xp.core += 20000;
    } else if (step4.handstand === 'wall_15-60s') {
      xp.balance += 20000;
      xp.core += 10000;
    }

    // HSPU → strength + balance
    if (step4.handstandPushUp === 'freestanding') {
      xp.strength += 100000;
      xp.balance += 60000;
    } else if (step4.handstandPushUp === 'full_wall_6+') {
      xp.strength += 60000;
      xp.balance += 30000;
    }

    // Front Lever → staticHolds + strength
    if (step4.frontLever === 'full_3s+') {
      xp.staticHolds += 150000;
      xp.strength += 80000;
    } else if (step4.frontLever === 'one_leg_3-8s' || step4.frontLever === 'straddle_3-8s') {
      xp.staticHolds += 80000;
      xp.strength += 40000;
    } else if (step4.frontLever === 'adv_tuck_5-10s') {
      xp.staticHolds += 40000;
      xp.strength += 20000;
    } else if (step4.frontLever === 'tuck_5-10s') {
      xp.staticHolds += 20000;
      xp.strength += 10000;
    }

    // Planche → staticHolds + strength
    if (step4.planche === 'full_3s+') {
      xp.staticHolds += 180000;
      xp.strength += 90000;
    } else if (step4.planche === 'straddle_3-8s') {
      xp.staticHolds += 90000;
      xp.strength += 50000;
    } else if (step4.planche === 'adv_tuck_5-10s') {
      xp.staticHolds += 45000;
      xp.strength += 25000;
    } else if (step4.planche === 'frog_tuck_5-10s') {
      xp.staticHolds += 15000;
      xp.balance += 10000;
    }

    // L-Sit → core
    if (step4.lSit === 'full_20s+_or_vsit') {
      xp.core += 80000;
    } else if (step4.lSit === 'full_10-20s') {
      xp.core += 40000;
    } else if (step4.lSit === 'bent_legs_10-20s') {
      xp.core += 20000;
    } else if (step4.lSit === 'tuck_10-20s') {
      xp.core += 10000;
    }

    // Muscle-up → strength + staticHolds
    if (step4.muscleUp === 'strict_4+') {
      xp.strength += 100000;
      xp.staticHolds += 50000;
    } else if (step4.muscleUp === 'strict_1-3') {
      xp.strength += 70000;
      xp.staticHolds += 35000;
    } else if (step4.muscleUp === 'kipping') {
      xp.strength += 40000;
      xp.staticHolds += 15000;
    }

    // Archer Pull-up → strength
    if (step4.archerPullUp === 'full_6+_each') {
      xp.strength += 60000;
    } else if (step4.archerPullUp === 'full_3-5_each') {
      xp.strength += 35000;
    }

    // One-Arm Pull-up → strength
    if (step4.oneArmPullUp === '2+_reps') {
      xp.strength += 150000;
    } else if (step4.oneArmPullUp === '1_rep_clean') {
      xp.strength += 100000;
    } else if (step4.oneArmPullUp === 'band_assisted') {
      xp.strength += 50000;
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
    (hexagonXP.balance +
      hexagonXP.strength +
      hexagonXP.staticHolds +
      hexagonXP.core +
      hexagonXP.endurance +
      hexagonXP.mobility) /
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

// ==========================================
// EXPORT ALL
// ==========================================

export default {
  shouldShowStep4,
  calculateBaseLevelFromStep3,
  calculateLevelFromStep4,
  calculateHexagonXP,
  processAssessment,
  getVisualValueFromXP,
  getVisualRank,
  mapDSToUnifiedLevel,
};
