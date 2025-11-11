/**
 * EXERCISE REWARDS SYSTEM
 *
 * Centralizes reward calculation for completed exercises.
 * Awards XP to hexagon axes, coins, and user total XP.
 */

import {
  getExerciseXPRewards,
  type ExerciseCategory,
  CATEGORY_TO_PRIMARY_AXIS,
} from './exercise-to-axis-mapping';
import type { UnifiedHexagonAxis } from './unified-hexagon-system';

export interface ExerciseReward {
  // Hexagon XP rewards (sent to hexagon/add-xp PUT endpoint)
  hexagonXP: Partial<Record<UnifiedHexagonAxis, number>>;

  // User-level rewards
  totalXP: number; // For user.totalXP
  coins: number; // For user.virtualCoins

  // Metadata
  primaryAxis: UnifiedHexagonAxis;
  category: ExerciseCategory;
  difficulty: string;
}

/**
 * Calculate coins reward based on XP earned
 * Formula: 1 coin per 10 XP (rounded)
 */
function calculateCoins(totalXP: number): number {
  return Math.round(totalXP / 10);
}

/**
 * Calculate total XP from hexagon XP rewards
 */
function calculateTotalXP(hexagonXP: Partial<Record<UnifiedHexagonAxis, number>>): number {
  return Object.values(hexagonXP).reduce((sum, xp) => sum + (xp || 0), 0);
}

/**
 * Get rewards for completing an exercise
 *
 * @param exerciseCategory - Category of the exercise (PUSH, PULL, CORE, etc.)
 * @param difficulty - Difficulty level (BEGINNER, INTERMEDIATE, ADVANCED, ELITE)
 * @param performanceMultiplier - Optional multiplier for good performance (1.0 - 2.0)
 * @returns ExerciseReward object with all rewards
 *
 * @example
 * ```ts
 * const rewards = getExerciseRewards('PUSH', 'INTERMEDIATE', 1.5);
 * // rewards.hexagonXP = { strength: 750, staticHolds: 300 }
 * // rewards.totalXP = 1050
 * // rewards.coins = 105
 * ```
 */
export function getExerciseRewards(
  exerciseCategory: ExerciseCategory,
  difficulty: string,
  performanceMultiplier: number = 1.0
): ExerciseReward {
  // Clamp multiplier to reasonable range
  const multiplier = Math.max(0.5, Math.min(2.0, performanceMultiplier));

  // Get base hexagon XP rewards
  const baseHexagonXP = getExerciseXPRewards(exerciseCategory, difficulty);

  // Apply multiplier
  const hexagonXP: Partial<Record<UnifiedHexagonAxis, number>> = {};
  for (const [axis, xp] of Object.entries(baseHexagonXP)) {
    hexagonXP[axis as UnifiedHexagonAxis] = Math.round((xp as number) * multiplier);
  }

  // Calculate totals
  const totalXP = calculateTotalXP(hexagonXP);
  const coins = calculateCoins(totalXP);

  // Get primary axis
  const primaryAxis = CATEGORY_TO_PRIMARY_AXIS[exerciseCategory];

  return {
    hexagonXP,
    totalXP,
    coins,
    primaryAxis,
    category: exerciseCategory,
    difficulty,
  };
}

/**
 * Calculate performance multiplier based on reps/time vs expected
 *
 * @param actual - Actual reps or time completed
 * @param expected - Expected reps or time for the exercise
 * @returns Multiplier between 0.5 and 2.0
 *
 * @example
 * ```ts
 * calculatePerformanceMultiplier(12, 10); // 1.2 (20% bonus)
 * calculatePerformanceMultiplier(8, 10);  // 0.8 (20% penalty)
 * calculatePerformanceMultiplier(20, 10); // 2.0 (capped at 100% bonus)
 * ```
 */
export function calculatePerformanceMultiplier(actual: number, expected: number): number {
  if (expected === 0) return 1.0;

  const ratio = actual / expected;

  // 50% below expected = 0.5x multiplier
  // At expected = 1.0x multiplier
  // 100% above expected = 2.0x multiplier (capped)
  return Math.max(0.5, Math.min(2.0, ratio));
}

/**
 * Get category from exercise name (fallback when category not available)
 * Uses keyword matching
 */
export function inferCategoryFromName(exerciseName: string): ExerciseCategory {
  const name = exerciseName.toLowerCase();

  // Push exercises
  if (/(push.*up|dip|press)/.test(name)) return 'PUSH';

  // Pull exercises
  if (/(pull.*up|row|chin.*up)/.test(name)) return 'PULL';

  // Core exercises
  if (/(plank|l-sit|hollow|crunch|sit.*up|leg.*raise|dragon)/.test(name)) return 'CORE';

  // Balance exercises
  if (/(handstand|balance|crow|arabesque)/.test(name)) return 'BALANCE';

  // Statics
  if (/(lever|planche|flag|human.*flag|iron.*cross)/.test(name)) return 'STATICS';

  // Lower body
  if (/(squat|lunge|pistol|step.*up)/.test(name)) return 'LOWER_BODY';

  // Warm-up / Mobility
  if (/(stretch|mobility|warm|dynamic|foam.*roll)/.test(name)) return 'WARM_UP';

  // Cardio
  if (/(burpee|jumping|run|jog|sprint|mountain.*climber)/.test(name)) return 'CARDIO';

  // Default to PUSH if uncertain
  return 'PUSH';
}

/**
 * Get difficulty from exercise object or infer from name
 */
export function inferDifficultyFromName(exerciseName: string): string {
  const name = exerciseName.toLowerCase();

  // Elite indicators
  if (/(one.*arm|full.*planche|full.*front.*lever|freestanding|strict.*muscle.*up)/.test(name)) {
    return 'ELITE';
  }

  // Advanced indicators
  if (/(straddle|tuck.*planche|adv.*tuck|archer|explosive|weighted)/.test(name)) {
    return 'ADVANCED';
  }

  // Intermediate indicators
  if (/(diamond|wide|close.*grip|l-sit|tuck.*lever|pike)/.test(name)) {
    return 'INTERMEDIATE';
  }

  // Beginner by default
  return 'BEGINNER';
}

/**
 * Convenience function: Get rewards from exercise name only
 * Useful when category/difficulty not available
 */
export function getRewardsFromName(
  exerciseName: string,
  performanceMultiplier: number = 1.0
): ExerciseReward {
  const category = inferCategoryFromName(exerciseName);
  const difficulty = inferDifficultyFromName(exerciseName);

  return getExerciseRewards(category, difficulty, performanceMultiplier);
}
