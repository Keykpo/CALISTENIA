/**
 * XP Calculation System
 *
 * Calculates XP rewards based on:
 * - User's skill level (BEGINNER, INTERMEDIATE, ADVANCED, ELITE)
 * - Training duration (10-120 minutes)
 *
 * Formula: XP = baseXP[level] * (duration / 24)
 *
 * Examples:
 * - BEGINNER, 20 min: 50 * (20/24) ≈ 42 XP
 * - INTERMEDIATE, 60 min: 75 * (60/24) ≈ 188 XP
 * - ADVANCED, 120 min: 100 * (120/24) = 500 XP
 * - ELITE, 60 min: 150 * (60/24) ≈ 375 XP
 */

import { DifficultyLevel } from './fig-level-progressions';

const BASE_XP: Record<DifficultyLevel, number> = {
  BEGINNER: 50,
  INTERMEDIATE: 75,
  ADVANCED: 100,
  ELITE: 150,
};

/**
 * Calculate XP reward for a training session
 */
export function calculateXP(duration: number, level: DifficultyLevel): number {
  const baseXP = BASE_XP[level];
  const multiplier = duration / 24;
  return Math.round(baseXP * multiplier);
}

/**
 * Get estimated XP range for a duration across all levels
 */
export function getXPRange(duration: number): { min: number; max: number } {
  const beginnerXP = calculateXP(duration, 'BEGINNER');
  const eliteXP = calculateXP(duration, 'ELITE');

  return {
    min: beginnerXP,
    max: eliteXP,
  };
}

/**
 * Calculate level thresholds for hexagon categories
 * These determine when a user levels up in a specific category
 */
export function getHexagonLevelThresholds(): Record<DifficultyLevel, number> {
  return {
    BEGINNER: 0,
    INTERMEDIATE: 500,  // 500 XP to reach INTERMEDIATE
    ADVANCED: 1500,     // 1500 XP to reach ADVANCED
    ELITE: 3000,        // 3000 XP to reach ELITE
  };
}

/**
 * Determine level based on total XP in a category
 */
export function getLevelFromXP(xp: number): DifficultyLevel {
  const thresholds = getHexagonLevelThresholds();

  if (xp >= thresholds.ELITE) return 'ELITE';
  if (xp >= thresholds.ADVANCED) return 'ADVANCED';
  if (xp >= thresholds.INTERMEDIATE) return 'INTERMEDIATE';
  return 'BEGINNER';
}

/**
 * Get XP needed to reach next level
 */
export function getXPToNextLevel(currentXP: number, currentLevel: DifficultyLevel): number | null {
  const thresholds = getHexagonLevelThresholds();

  switch (currentLevel) {
    case 'BEGINNER':
      return thresholds.INTERMEDIATE - currentXP;
    case 'INTERMEDIATE':
      return thresholds.ADVANCED - currentXP;
    case 'ADVANCED':
      return thresholds.ELITE - currentXP;
    case 'ELITE':
      return null; // Already at max level
  }
}

/**
 * Calculate progress percentage toward next level
 */
export function getLevelProgress(currentXP: number, currentLevel: DifficultyLevel): number {
  const thresholds = getHexagonLevelThresholds();

  let currentThreshold: number;
  let nextThreshold: number;

  switch (currentLevel) {
    case 'BEGINNER':
      currentThreshold = thresholds.BEGINNER;
      nextThreshold = thresholds.INTERMEDIATE;
      break;
    case 'INTERMEDIATE':
      currentThreshold = thresholds.INTERMEDIATE;
      nextThreshold = thresholds.ADVANCED;
      break;
    case 'ADVANCED':
      currentThreshold = thresholds.ADVANCED;
      nextThreshold = thresholds.ELITE;
      break;
    case 'ELITE':
      return 100; // Already at max
  }

  const progress = ((currentXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}
