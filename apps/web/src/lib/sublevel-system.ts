/**
 * ============================================================================
 * SUBLEVEL SYSTEM - 15 Granular Training Levels
 * ============================================================================
 *
 * Subdivides the 3 V3 stages into 15 precise sublevels for gradual progression.
 *
 * MAPPING:
 * - D-, D, D+ (BEGINNER) → STAGE_1_2
 * - C-, C, C+ (NOVICE) → STAGE_1_2
 * - B-, B, B+ (INTERMEDIATE) → STAGE_3
 * - A-, A, A+ (ADVANCED) → STAGE_4
 * - S-, S, S+ (EXPERT) → STAGE_4
 *
 * Based on: RUTINAS_POR_NIVEL detailed progression criteria
 * ============================================================================
 */

import type { TrainingStage } from './routine-generator-v3';

// ==========================================
// TYPES
// ==========================================

export type SubLevel =
  // BEGINNER (D) - Learning fundamentals
  | 'D_MINUS' // Can't do 1 pull-up yet
  | 'D' // 1-2 pull-ups (AJUSTADO: antes 1-3)
  | 'D_PLUS' // 3-5 pull-ups (AJUSTADO: antes 4-7)

  // NOVICE (C) - Building base strength
  | 'C_MINUS' // 6-9 pull-ups (AJUSTADO: antes 8-10)
  | 'C' // 10-13 pull-ups (AJUSTADO: antes 11-14)
  | 'C_PLUS' // 14-17 pull-ups (AJUSTADO: antes 15-19)

  // INTERMEDIATE (B) - Introducing weighted work
  | 'B_MINUS' // 18-21 pull-ups OR weighted +10% BW (AJUSTADO: antes 20-24)
  | 'B' // 22-27 pull-ups OR weighted +20% BW (AJUSTADO: antes 25-29)
  | 'B_PLUS' // 28-34 pull-ups OR weighted +25% BW (AJUSTADO: antes 30-34)

  // ADVANCED (A) - Advanced weighted + skills
  | 'A_MINUS' // 35-39 pull-ups OR weighted +30% BW
  | 'A' // 40-44 pull-ups OR weighted +35% BW
  | 'A_PLUS' // 45-49 pull-ups OR weighted +40% BW

  // EXPERT (S) - Elite level
  | 'S_MINUS' // 50-59 pull-ups OR weighted +45% BW
  | 'S' // 60-69 pull-ups OR weighted +50% BW
  | 'S_PLUS'; // 70+ pull-ups OR weighted +55% BW

export interface UserMetrics {
  pullUpsMax: number;
  dipsMax: number;
  pushUpsMax: number;
  weightedPullUps: number; // kg added
  weightedDips: number; // kg added
  bodyWeight: number; // kg
}

export interface SubLevelInfo {
  subLevel: SubLevel;
  stage: TrainingStage;
  displayName: string;
  description: string;
  requirements: {
    pullUps?: string;
    dips?: string;
    weightedPullUps?: string;
    weightedDips?: string;
  };
  focusAreas: string[];
  expectedDuration: string; // Time to complete this sublevel
}

// ==========================================
// SUBLEVEL DETERMINATION
// ==========================================

/**
 * Determines user's precise sublevel based on strength metrics
 */
export function determineSubLevel(metrics: UserMetrics): SubLevel {
  const { pullUpsMax, dipsMax, weightedPullUps, weightedDips, bodyWeight } = metrics;

  // Calculate weighted percentages (% of bodyweight)
  const wpPercent = (weightedPullUps / bodyWeight) * 100;
  const wdPercent = (weightedDips / bodyWeight) * 100;

  // EXPERT (S) - Elite level
  if (pullUpsMax >= 70 || wpPercent >= 55) return 'S_PLUS';
  if (pullUpsMax >= 60 || wpPercent >= 50) return 'S';
  if (pullUpsMax >= 50 || wpPercent >= 45) return 'S_MINUS';

  // ADVANCED (A) - Advanced weighted + skills
  if (pullUpsMax >= 45 || wpPercent >= 40) return 'A_PLUS';
  if (pullUpsMax >= 40 || wpPercent >= 35) return 'A';
  if (pullUpsMax >= 35 || wpPercent >= 30) return 'A_MINUS';

  // INTERMEDIATE (B) - Introducing weighted work
  if (pullUpsMax >= 28 || wpPercent >= 25) return 'B_PLUS'; // AJUSTADO: antes 30
  if (pullUpsMax >= 22 || wpPercent >= 20) return 'B'; // AJUSTADO: antes 25
  if (pullUpsMax >= 18 || wpPercent >= 10) return 'B_MINUS'; // AJUSTADO: antes 20

  // NOVICE (C) - Building base strength
  if (pullUpsMax >= 14) return 'C_PLUS'; // AJUSTADO: antes 15
  if (pullUpsMax >= 10) return 'C'; // AJUSTADO: antes 11
  if (pullUpsMax >= 6) return 'C_MINUS'; // AJUSTADO: antes 8

  // BEGINNER (D) - Learning fundamentals
  if (pullUpsMax >= 3) return 'D_PLUS'; // AJUSTADO: antes 4
  if (pullUpsMax >= 1) return 'D';

  return 'D_MINUS';
}

// ==========================================
// SUBLEVEL INFORMATION
// ==========================================

/**
 * Get detailed information about a sublevel
 */
export function getSubLevelInfo(subLevel: SubLevel): SubLevelInfo {
  const infoMap: Record<SubLevel, SubLevelInfo> = {
    // BEGINNER (D)
    D_MINUS: {
      subLevel: 'D_MINUS',
      stage: 'STAGE_1_2',
      displayName: 'D- (Beginner Minus)',
      description: 'Learning fundamentals with assistance',
      requirements: {
        pullUps: '0 pull-ups',
        dips: '0-5 dips',
      },
      focusAreas: ['Assisted Pull-ups', 'Negative Pull-ups', 'Incline Push-ups', 'Basic Core'],
      expectedDuration: '4-8 weeks',
    },
    D: {
      subLevel: 'D',
      stage: 'STAGE_1_2',
      displayName: 'D (Beginner)',
      description: 'First pull-ups and basic bodyweight movements',
      requirements: {
        pullUps: '1-2 pull-ups',
        dips: '3-6 dips',
      },
      focusAreas: ['First Pull-ups', 'Regular Push-ups', 'Assisted Dips', 'Hollow Body'],
      expectedDuration: '3-4 weeks',
    },
    D_PLUS: {
      subLevel: 'D_PLUS',
      stage: 'STAGE_1_2',
      displayName: 'D+ (Beginner Plus)',
      description: 'Consistent sets of basic movements',
      requirements: {
        pullUps: '3-5 pull-ups',
        dips: '7-12 dips',
      },
      focusAreas: ['Multiple Sets Pull-ups', 'Diamond Push-ups', 'Basic Handstand Practice'],
      expectedDuration: '4-6 weeks',
    },

    // NOVICE (C)
    C_MINUS: {
      subLevel: 'C_MINUS',
      stage: 'STAGE_1_2',
      displayName: 'C- (Novice Minus)',
      description: 'Building solid base strength',
      requirements: {
        pullUps: '6-9 pull-ups',
        dips: '13-17 dips',
      },
      focusAreas: ['Volume Work', 'Archer Push-ups Intro', 'L-sit Progressions'],
      expectedDuration: '4-6 weeks',
    },
    C: {
      subLevel: 'C',
      stage: 'STAGE_1_2',
      displayName: 'C (Novice)',
      description: 'Strong base, ready for progressive overload',
      requirements: {
        pullUps: '10-13 pull-ups',
        dips: '18-23 dips',
      },
      focusAreas: ['High Volume Training', 'First Weighted Attempts', 'Handstand Holds 30s+'],
      expectedDuration: '4-8 weeks',
    },
    C_PLUS: {
      subLevel: 'C_PLUS',
      stage: 'STAGE_1_2',
      displayName: 'C+ (Novice Plus)',
      description: 'Transitioning to weighted work',
      requirements: {
        pullUps: '14-17 pull-ups',
        dips: '24-28 dips',
      },
      focusAreas: ['First Weighted Sets', 'Archer Pull-ups', 'Pseudo Planche Push-ups'],
      expectedDuration: '6-8 weeks',
    },

    // INTERMEDIATE (B)
    B_MINUS: {
      subLevel: 'B_MINUS',
      stage: 'STAGE_3',
      displayName: 'B- (Intermediate Minus)',
      description: 'Early weighted work phase',
      requirements: {
        pullUps: '18-21 pull-ups',
        dips: '29-33 dips',
        weightedPullUps: '+10% BW',
      },
      focusAreas: ['Weighted Pull-ups +10%', 'Weighted Dips +15%', 'Tuck Planche'],
      expectedDuration: '8-12 weeks',
    },
    B: {
      subLevel: 'B',
      stage: 'STAGE_3',
      displayName: 'B (Intermediate)',
      description: 'Solid weighted strength base',
      requirements: {
        pullUps: '22-27 pull-ups',
        dips: '34-39 dips',
        weightedPullUps: '+20% BW',
      },
      focusAreas: ['Weighted Pull-ups +20%', 'Weighted Dips +30%', 'Adv Tuck Planche'],
      expectedDuration: '8-12 weeks',
    },
    B_PLUS: {
      subLevel: 'B_PLUS',
      stage: 'STAGE_3',
      displayName: 'B+ (Intermediate Plus)',
      description: 'Strong weighted work, entering advanced territory',
      requirements: {
        pullUps: '28-34 pull-ups',
        dips: '40-48 dips',
        weightedPullUps: '+25% BW',
      },
      focusAreas: ['Weighted Pull-ups +25%', 'Weighted Dips +40%', 'Straddle Planche'],
      expectedDuration: '12-16 weeks',
    },

    // ADVANCED (A)
    A_MINUS: {
      subLevel: 'A_MINUS',
      stage: 'STAGE_4',
      displayName: 'A- (Advanced Minus)',
      description: 'Advanced weighted + skill bifurcation starts',
      requirements: {
        pullUps: '35-39 pull-ups',
        dips: '45-50 dips',
        weightedPullUps: '+30% BW',
      },
      focusAreas: ['Weighted +30%', 'Half Lay Planche', 'Front Lever Progressions', 'OAP Training'],
      expectedDuration: '12-20 weeks',
    },
    A: {
      subLevel: 'A',
      stage: 'STAGE_4',
      displayName: 'A (Advanced)',
      description: 'Advanced skills + heavy weighted work',
      requirements: {
        pullUps: '40-44 pull-ups',
        dips: '50-55 dips',
        weightedPullUps: '+35% BW',
      },
      focusAreas: ['Weighted +35%', 'Full Planche Attempts', 'Front Lever Holds', 'Muscle-ups'],
      expectedDuration: '16-24 weeks',
    },
    A_PLUS: {
      subLevel: 'A_PLUS',
      stage: 'STAGE_4',
      displayName: 'A+ (Advanced Plus)',
      description: 'Elite skills within reach',
      requirements: {
        pullUps: '45-49 pull-ups',
        dips: '55-60 dips',
        weightedPullUps: '+40% BW',
      },
      focusAreas: ['Weighted +40%', 'Full Planche 5s+', 'Full Front Lever', 'OAP Negatives'],
      expectedDuration: '20-32 weeks',
    },

    // EXPERT (S)
    S_MINUS: {
      subLevel: 'S_MINUS',
      stage: 'STAGE_4',
      displayName: 'S- (Expert Minus)',
      description: 'Expert level - Mastery of advanced skills',
      requirements: {
        pullUps: '50-59 pull-ups',
        dips: '60-70 dips',
        weightedPullUps: '+45% BW',
      },
      focusAreas: ['Weighted +45%', 'Full Planche 10s+', 'OAP Attempts', 'Maltese Progressions'],
      expectedDuration: '6-12 months',
    },
    S: {
      subLevel: 'S',
      stage: 'STAGE_4',
      displayName: 'S (Expert)',
      description: 'True expert - Elite skills mastered',
      requirements: {
        pullUps: '60-69 pull-ups',
        dips: '70-80 dips',
        weightedPullUps: '+50% BW',
      },
      focusAreas: ['Weighted +50%', 'Full Planche 20s+', 'Clean OAP', 'Iron Cross Progressions'],
      expectedDuration: '12+ months',
    },
    S_PLUS: {
      subLevel: 'S_PLUS',
      stage: 'STAGE_4',
      displayName: 'S+ (Expert Plus)',
      description: 'Peak human performance',
      requirements: {
        pullUps: '70+ pull-ups',
        dips: '80+ dips',
        weightedPullUps: '+55% BW',
      },
      focusAreas: ['Weighted +55%', 'Planche variations', 'Multiple OAP', 'Iron Cross attempts'],
      expectedDuration: 'Ongoing mastery',
    },
  };

  return infoMap[subLevel];
}

// ==========================================
// STAGE MAPPING
// ==========================================

/**
 * Get V3 TrainingStage from SubLevel
 */
export function getStageFromSubLevel(subLevel: SubLevel): TrainingStage {
  const info = getSubLevelInfo(subLevel);
  return info.stage;
}

/**
 * Get next sublevel in progression
 */
export function getNextSubLevel(current: SubLevel): SubLevel | null {
  const order: SubLevel[] = [
    'D_MINUS',
    'D',
    'D_PLUS',
    'C_MINUS',
    'C',
    'C_PLUS',
    'B_MINUS',
    'B',
    'B_PLUS',
    'A_MINUS',
    'A',
    'A_PLUS',
    'S_MINUS',
    'S',
    'S_PLUS',
  ];

  const currentIndex = order.indexOf(current);
  if (currentIndex === -1 || currentIndex === order.length - 1) {
    return null; // Already at max
  }

  return order[currentIndex + 1];
}

/**
 * Get previous sublevel
 */
export function getPreviousSubLevel(current: SubLevel): SubLevel | null {
  const order: SubLevel[] = [
    'D_MINUS',
    'D',
    'D_PLUS',
    'C_MINUS',
    'C',
    'C_PLUS',
    'B_MINUS',
    'B',
    'B_PLUS',
    'A_MINUS',
    'A',
    'A_PLUS',
    'S_MINUS',
    'S',
    'S_PLUS',
  ];

  const currentIndex = order.indexOf(current);
  if (currentIndex <= 0) {
    return null; // Already at min
  }

  return order[currentIndex - 1];
}

/**
 * Get all sublevels for a given stage
 */
export function getSubLevelsForStage(stage: TrainingStage): SubLevel[] {
  const allSubLevels: SubLevel[] = [
    'D_MINUS',
    'D',
    'D_PLUS',
    'C_MINUS',
    'C',
    'C_PLUS',
    'B_MINUS',
    'B',
    'B_PLUS',
    'A_MINUS',
    'A',
    'A_PLUS',
    'S_MINUS',
    'S',
    'S_PLUS',
  ];

  return allSubLevels.filter((subLevel) => getStageFromSubLevel(subLevel) === stage);
}

/**
 * Check if user meets requirements for a specific sublevel
 */
export function meetsRequirementsForSubLevel(
  metrics: UserMetrics,
  targetSubLevel: SubLevel
): boolean {
  const currentSubLevel = determineSubLevel(metrics);
  const order: SubLevel[] = [
    'D_MINUS',
    'D',
    'D_PLUS',
    'C_MINUS',
    'C',
    'C_PLUS',
    'B_MINUS',
    'B',
    'B_PLUS',
    'A_MINUS',
    'A',
    'A_PLUS',
    'S_MINUS',
    'S',
    'S_PLUS',
  ];

  const currentIndex = order.indexOf(currentSubLevel);
  const targetIndex = order.indexOf(targetSubLevel);

  return currentIndex >= targetIndex;
}

// ==========================================
// DISPLAY HELPERS
// ==========================================

/**
 * Get display name with emoji
 */
export function getSubLevelDisplayName(subLevel: SubLevel): string {
  const info = getSubLevelInfo(subLevel);
  const emojiMap: Record<string, string> = {
    D_MINUS: '🌱',
    D: '🌱',
    D_PLUS: '🌱',
    C_MINUS: '💪',
    C: '💪',
    C_PLUS: '💪',
    B_MINUS: '🔥',
    B: '🔥',
    B_PLUS: '🔥',
    A_MINUS: '⭐',
    A: '⭐',
    A_PLUS: '⭐',
    S_MINUS: '🏆',
    S: '🏆',
    S_PLUS: '👑',
  };

  return `${emojiMap[subLevel]} ${info.displayName}`;
}

/**
 * Get progress percentage to next sublevel
 */
export function getProgressToNextLevel(metrics: UserMetrics, currentSubLevel: SubLevel): number {
  const nextSubLevel = getNextSubLevel(currentSubLevel);
  if (!nextSubLevel) return 100; // Already at max

  const current = determineSubLevel(metrics);
  if (current !== currentSubLevel) {
    // User has already advanced
    return 100;
  }

  // Simple approximation based on pull-ups
  const currentInfo = getSubLevelInfo(currentSubLevel);
  const nextInfo = getSubLevelInfo(nextSubLevel);

  // Extract pull-up numbers from requirements (rough estimate)
  const currentPullUps = metrics.pullUpsMax;

  // Approximate progress (this is simplified, could be more sophisticated)
  const baseProgress = (currentPullUps % 5) * 20; // 5 pull-ups per sublevel roughly

  return Math.min(baseProgress, 99); // Never show 100% unless actually ready
}
