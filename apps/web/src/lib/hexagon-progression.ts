/**
 * Hexagon Progression System
 *
 * Manages XP, levels, and progression for each hexagon axis.
 * Single Source of Truth for all progression calculations.
 */

export type HexagonAxis =
  | 'relativeStrength'
  | 'muscularEndurance'
  | 'balanceControl'
  | 'jointMobility'
  | 'bodyTension'
  | 'skillTechnique';

export type ProgressionLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

/**
 * XP thresholds for each level
 * BEGINNER: 0 - 2,000 XP
 * INTERMEDIATE: 2,000 - 5,000 XP
 * ADVANCED: 5,000 - 10,000 XP
 * ELITE: 10,000+ XP
 */
export const XP_THRESHOLDS: Record<ProgressionLevel, { min: number; max: number }> = {
  BEGINNER: { min: 0, max: 2000 },
  INTERMEDIATE: { min: 2000, max: 5000 },
  ADVANCED: { min: 5000, max: 10000 },
  ELITE: { min: 10000, max: Infinity },
};

/**
 * Extended HexagonProfile with XP tracking
 */
export interface HexagonProfileWithXP {
  // Visual values (0-10)
  relativeStrength: number;
  muscularEndurance: number;
  balanceControl: number;
  jointMobility: number;
  bodyTension: number;
  skillTechnique: number;

  // XP values
  relativeStrengthXP: number;
  muscularEnduranceXP: number;
  balanceControlXP: number;
  jointMobilityXP: number;
  bodyTensionXP: number;
  skillTechniqueXP: number;

  // Level values
  relativeStrengthLevel: ProgressionLevel;
  muscularEnduranceLevel: ProgressionLevel;
  balanceControlLevel: ProgressionLevel;
  jointMobilityLevel: ProgressionLevel;
  bodyTensionLevel: ProgressionLevel;
  skillTechniqueLevel: ProgressionLevel;
}

/**
 * Calculate level from XP
 */
export function getLevelFromXP(xp: number): ProgressionLevel {
  if (xp >= XP_THRESHOLDS.ELITE.min) return 'ELITE';
  if (xp >= XP_THRESHOLDS.ADVANCED.min) return 'ADVANCED';
  if (xp >= XP_THRESHOLDS.INTERMEDIATE.min) return 'INTERMEDIATE';
  return 'BEGINNER';
}

/**
 * Calculate visual value (0-10) from XP and level
 *
 * Each level spans 2.5 points on the visual scale:
 * BEGINNER: 0-2.5
 * INTERMEDIATE: 2.5-5.0
 * ADVANCED: 5.0-7.5
 * ELITE: 7.5-10.0
 */
export function getVisualValueFromXP(xp: number, level: ProgressionLevel): number {
  const thresholds = XP_THRESHOLDS[level];
  const levelStart = thresholds.min;
  const levelEnd = thresholds.max === Infinity ? 20000 : thresholds.max; // Cap ELITE at 20k for visual

  const progressInLevel = (xp - levelStart) / (levelEnd - levelStart);
  const clampedProgress = Math.max(0, Math.min(1, progressInLevel));

  // Each level = 2.5 points on visual scale
  const levelBaseValues: Record<ProgressionLevel, number> = {
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
 * Get XP progress percentage within current level
 */
export function getLevelProgress(xp: number): number {
  const level = getLevelFromXP(xp);
  const thresholds = XP_THRESHOLDS[level];

  const levelStart = thresholds.min;
  const levelEnd = thresholds.max === Infinity ? 20000 : thresholds.max;

  const progress = ((xp - levelStart) / (levelEnd - levelStart)) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

/**
 * Calculate overall level from average XP across all axes
 */
export function calculateOverallLevel(profile: Partial<HexagonProfileWithXP>): ProgressionLevel {
  const axes: (keyof Pick<HexagonProfileWithXP,
    'relativeStrengthXP' | 'muscularEnduranceXP' | 'balanceControlXP' |
    'jointMobilityXP' | 'bodyTensionXP' | 'skillTechniqueXP'>)[] = [
    'relativeStrengthXP',
    'muscularEnduranceXP',
    'balanceControlXP',
    'jointMobilityXP',
    'bodyTensionXP',
    'skillTechniqueXP',
  ];

  const totalXP = axes.reduce((sum, axis) => sum + (profile[axis] || 0), 0);
  const averageXP = totalXP / axes.length;

  return getLevelFromXP(averageXP);
}

/**
 * Update a single axis with XP
 * Returns updated profile with recalculated level and visual value
 */
export function updateAxisXP(
  profile: HexagonProfileWithXP,
  axis: HexagonAxis,
  xpToAdd: number
): HexagonProfileWithXP {
  const xpKey = `${axis}XP` as keyof HexagonProfileWithXP;
  const levelKey = `${axis}Level` as keyof HexagonProfileWithXP;

  const currentXP = (profile[xpKey] as number) || 0;
  const newXP = currentXP + xpToAdd;

  const newLevel = getLevelFromXP(newXP);
  const newVisualValue = getVisualValueFromXP(newXP, newLevel);

  return {
    ...profile,
    [axis]: newVisualValue,
    [xpKey]: newXP,
    [levelKey]: newLevel,
  };
}

/**
 * Initialize a hexagon profile with default values
 */
export function initializeHexagonProfile(
  initialXP: Partial<Record<HexagonAxis, number>> = {}
): HexagonProfileWithXP {
  const axes: HexagonAxis[] = [
    'relativeStrength',
    'muscularEndurance',
    'balanceControl',
    'jointMobility',
    'bodyTension',
    'skillTechnique',
  ];

  let profile: Partial<HexagonProfileWithXP> = {};

  axes.forEach(axis => {
    const xp = initialXP[axis] || 0;
    const level = getLevelFromXP(xp);
    const visualValue = getVisualValueFromXP(xp, level);

    profile[axis] = visualValue;
    profile[`${axis}XP` as keyof HexagonProfileWithXP] = xp;
    profile[`${axis}Level` as keyof HexagonProfileWithXP] = level;
  });

  return profile as HexagonProfileWithXP;
}

/**
 * Get XP required to reach next level
 */
export function getXPToNextLevel(currentXP: number): number {
  const currentLevel = getLevelFromXP(currentXP);

  if (currentLevel === 'ELITE') {
    return 0; // Already at max level
  }

  const levelOrder: ProgressionLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'];
  const currentIndex = levelOrder.indexOf(currentLevel);
  const nextLevel = levelOrder[currentIndex + 1];

  return XP_THRESHOLDS[nextLevel].min - currentXP;
}

/**
 * Format XP display
 */
export function formatXP(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
}

/**
 * Get level color (for UI)
 */
export function getLevelColor(level: ProgressionLevel): string {
  const colors: Record<ProgressionLevel, string> = {
    BEGINNER: 'text-slate-600',
    INTERMEDIATE: 'text-blue-600',
    ADVANCED: 'text-purple-600',
    ELITE: 'text-amber-600',
  };
  return colors[level];
}

/**
 * Get level badge background color (for UI)
 */
export function getLevelBadgeColor(level: ProgressionLevel): string {
  const colors: Record<ProgressionLevel, string> = {
    BEGINNER: 'bg-slate-100 border-slate-300',
    INTERMEDIATE: 'bg-blue-100 border-blue-300',
    ADVANCED: 'bg-purple-100 border-purple-300',
    ELITE: 'bg-amber-100 border-amber-300',
  };
  return colors[level];
}
