/**
 * Hexagon Progression System
 *
 * This file contains all the logic for hexagon skill progression:
 * - XP to Level conversion per axis
 * - Level to normalized value (0-10) conversion
 * - Overall level calculation from hexagon axes
 * - XP requirements per level
 */

export type FitnessLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
export type HexagonAxis =
  | 'relativeStrength'
  | 'muscularEndurance'
  | 'balanceControl'
  | 'jointMobility'
  | 'bodyTension'
  | 'skillTechnique';

export interface HexagonProfile {
  relativeStrength: number;
  muscularEndurance: number;
  balanceControl: number;
  jointMobility: number;
  bodyTension: number;
  skillTechnique: number;
}

export interface HexagonProfileWithXP extends HexagonProfile {
  relativeStrengthXP: number;
  muscularEnduranceXP: number;
  balanceControlXP: number;
  jointMobilityXP: number;
  bodyTensionXP: number;
  skillTechniqueXP: number;

  relativeStrengthLevel: FitnessLevel;
  muscularEnduranceLevel: FitnessLevel;
  balanceControlLevel: FitnessLevel;
  jointMobilityLevel: FitnessLevel;
  bodyTensionLevel: FitnessLevel;
  skillTechniqueLevel: FitnessLevel;
}

/**
 * XP Requirements for each level transition
 * As specified by the user:
 * - BEGINNER → INTERMEDIATE: 2,000 XP
 * - INTERMEDIATE → ADVANCED: 5,000 XP
 * - ADVANCED → ELITE: 10,000 XP
 */
export const XP_REQUIREMENTS: Record<FitnessLevel, number> = {
  BEGINNER: 0,        // Start of BEGINNER
  INTERMEDIATE: 2000, // Need 2,000 XP to reach INTERMEDIATE
  ADVANCED: 7000,     // Need 7,000 total XP (2k + 5k) to reach ADVANCED
  ELITE: 17000,       // Need 17,000 total XP (2k + 5k + 10k) to reach ELITE
};

/**
 * Calculate the fitness level based on XP earned in an axis
 */
export function getLevelFromXP(xp: number): FitnessLevel {
  if (xp >= XP_REQUIREMENTS.ELITE) return 'ELITE';
  if (xp >= XP_REQUIREMENTS.ADVANCED) return 'ADVANCED';
  if (xp >= XP_REQUIREMENTS.INTERMEDIATE) return 'INTERMEDIATE';
  return 'BEGINNER';
}

/**
 * Get XP remaining to reach next level
 */
export function getXPToNextLevel(xp: number): { remaining: number; nextLevel: FitnessLevel | null } {
  const currentLevel = getLevelFromXP(xp);

  if (currentLevel === 'ELITE') {
    return { remaining: 0, nextLevel: null };
  }

  const nextLevelMap: Record<FitnessLevel, FitnessLevel | null> = {
    BEGINNER: 'INTERMEDIATE',
    INTERMEDIATE: 'ADVANCED',
    ADVANCED: 'ELITE',
    ELITE: null,
  };

  const nextLevel = nextLevelMap[currentLevel];
  if (!nextLevel) {
    return { remaining: 0, nextLevel: null };
  }

  const remaining = XP_REQUIREMENTS[nextLevel] - xp;
  return { remaining, nextLevel };
}

/**
 * Convert level to normalized value (0-10) for hexagon display
 * This maps the level to a visual representation
 */
export function levelToNormalizedValue(level: FitnessLevel, xp: number): number {
  const ranges: Record<FitnessLevel, { min: number; max: number }> = {
    BEGINNER: { min: 0, max: 2.5 },      // 0.0 - 2.5
    INTERMEDIATE: { min: 2.5, max: 5.0 }, // 2.5 - 5.0
    ADVANCED: { min: 5.0, max: 7.5 },    // 5.0 - 7.5
    ELITE: { min: 7.5, max: 10.0 },      // 7.5 - 10.0
  };

  const range = ranges[level];
  const levelStartXP = XP_REQUIREMENTS[level];
  const { remaining, nextLevel } = getXPToNextLevel(xp);

  if (!nextLevel) {
    // Max level (ELITE) - scale from 7.5 to 10 based on total XP beyond threshold
    const extraXP = xp - XP_REQUIREMENTS.ELITE;
    const progress = Math.min(extraXP / 10000, 1); // Cap at extra 10k XP for max visual
    return range.min + (range.max - range.min) * progress;
  }

  const totalXPNeeded = XP_REQUIREMENTS[nextLevel] - levelStartXP;
  const xpInCurrentLevel = xp - levelStartXP;
  const progress = xpInCurrentLevel / totalXPNeeded;

  return range.min + (range.max - range.min) * progress;
}

/**
 * Calculate overall user level from hexagon axes
 * Uses the AVERAGE of all 6 axes to determine overall level
 * This is the SINGLE SOURCE OF TRUTH for user level
 */
export function calculateOverallLevel(profile: Partial<HexagonProfileWithXP>): FitnessLevel {
  const axes: HexagonAxis[] = [
    'relativeStrength',
    'muscularEndurance',
    'balanceControl',
    'jointMobility',
    'bodyTension',
    'skillTechnique',
  ];

  // Get XP values for all axes
  const xpValues = axes.map(axis => {
    const xpField = `${axis}XP` as keyof HexagonProfileWithXP;
    return (profile[xpField] as number) || 0;
  });

  // Calculate average XP across all axes
  const averageXP = xpValues.reduce((sum, xp) => sum + xp, 0) / axes.length;

  // Return level based on average XP
  return getLevelFromXP(averageXP);
}

/**
 * Calculate progress percentage within current level
 * Used for progress bars
 */
export function getLevelProgress(xp: number): number {
  const currentLevel = getLevelFromXP(xp);
  const { remaining, nextLevel } = getXPToNextLevel(xp);

  if (!nextLevel) {
    return 100; // Max level
  }

  const levelStartXP = XP_REQUIREMENTS[currentLevel];
  const levelEndXP = XP_REQUIREMENTS[nextLevel];
  const totalXPNeeded = levelEndXP - levelStartXP;
  const xpInCurrentLevel = xp - levelStartXP;

  return Math.round((xpInCurrentLevel / totalXPNeeded) * 100);
}

/**
 * Get level configuration for display
 */
export interface LevelConfig {
  level: FitnessLevel;
  label: string;
  description: string;
  color: string;
  gradient: string;
  percentage: number;
}

export function getLevelConfig(level: FitnessLevel, xp?: number): LevelConfig {
  const configs: Record<FitnessLevel, Omit<LevelConfig, 'percentage' | 'level'>> = {
    BEGINNER: {
      label: 'Beginner',
      description: 'Starting your calisthenics journey with foundational movements',
      color: 'text-green-700',
      gradient: 'from-green-400 to-emerald-600',
    },
    INTERMEDIATE: {
      label: 'Intermediate',
      description: 'Building strength and mastering core exercises',
      color: 'text-blue-700',
      gradient: 'from-blue-400 to-blue-600',
    },
    ADVANCED: {
      label: 'Advanced',
      description: 'Pushing limits with advanced skills and techniques',
      color: 'text-purple-700',
      gradient: 'from-purple-400 to-purple-600',
    },
    ELITE: {
      label: 'Elite',
      description: 'Mastering the most challenging calisthenics movements',
      color: 'text-amber-700',
      gradient: 'from-amber-400 to-orange-600',
    },
  };

  const config = configs[level];
  const percentage = xp !== undefined ? getLevelProgress(xp) : 0;

  return {
    level,
    ...config,
    percentage,
  };
}

/**
 * Update hexagon profile with new XP
 * Returns updated profile with recalculated levels and normalized values
 */
export function updateAxisXP(
  profile: HexagonProfileWithXP,
  axis: HexagonAxis,
  xpToAdd: number
): HexagonProfileWithXP {
  const xpField = `${axis}XP` as keyof HexagonProfileWithXP;
  const levelField = `${axis}Level` as keyof HexagonProfileWithXP;

  const newXP = ((profile[xpField] as number) || 0) + xpToAdd;
  const newLevel = getLevelFromXP(newXP);
  const newNormalizedValue = levelToNormalizedValue(newLevel, newXP);

  return {
    ...profile,
    [axis]: newNormalizedValue,
    [xpField]: newXP,
    [levelField]: newLevel,
  };
}

/**
 * Axis display names
 */
export const AXIS_LABELS: Record<HexagonAxis, string> = {
  relativeStrength: 'Relative Strength',
  muscularEndurance: 'Muscular Endurance',
  balanceControl: 'Balance Control',
  jointMobility: 'Joint Mobility',
  bodyTension: 'Body Tension',
  skillTechnique: 'Skill Technique',
};
