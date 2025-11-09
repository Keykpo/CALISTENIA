/**
 * Unified Hexagon System
 *
 * New simplified 6-axis hexagon system aligned with FIG categories
 *
 * AXES:
 * 1. balance      - Balance & Handstands (FIG: BALANCE)
 * 2. strength     - Strength & Power (FIG: STRENGTH)
 * 3. staticHolds  - Static Holds (FIG: SKILL_STATIC)
 * 4. core         - Core & Conditioning (FIG: CORE)
 * 5. endurance    - Endurance (transversal)
 * 6. mobility     - Mobility & Flexibility (transversal)
 */

export type UnifiedHexagonAxis =
  | 'balance'
  | 'strength'
  | 'staticHolds'
  | 'core'
  | 'endurance'
  | 'mobility';

export type UnifiedProgressionLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

/**
 * XP thresholds for each level (Realistic 3-year progression)
 * Matches existing system for continuity
 *
 * BEGINNER:     0 - 48,000 XP (~6 months)
 * INTERMEDIATE: 48,000 - 144,000 XP (~1 year)
 * ADVANCED:     144,000 - 384,000 XP (~2 years)
 * ELITE:        384,000+ XP (~3+ years)
 */
export const UNIFIED_XP_THRESHOLDS: Record<UnifiedProgressionLevel, { min: number; max: number }> = {
  BEGINNER: { min: 0, max: 48000 },
  INTERMEDIATE: { min: 48000, max: 144000 },
  ADVANCED: { min: 144000, max: 384000 },
  ELITE: { min: 384000, max: Infinity },
};

/**
 * Axis metadata for display
 */
export interface UnifiedAxisMetadata {
  key: UnifiedHexagonAxis;
  displayName: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
}

export const UNIFIED_AXIS_METADATA: Record<UnifiedHexagonAxis, UnifiedAxisMetadata> = {
  balance: {
    key: 'balance',
    displayName: 'Balance & Handstands',
    shortName: 'Balance',
    icon: '⚖️',
    color: '#3b82f6', // blue-500
    description: 'Your ability to control inverted positions and maintain balance',
  },
  strength: {
    key: 'strength',
    displayName: 'Strength & Power',
    shortName: 'Strength',
    icon: '💪',
    color: '#ef4444', // red-500
    description: 'Your raw pulling and pushing power',
  },
  staticHolds: {
    key: 'staticHolds',
    displayName: 'Static Holds',
    shortName: 'Static Holds',
    icon: '🎯',
    color: '#8b5cf6', // purple-500
    description: 'Your ability to hold advanced static positions like planche and levers',
  },
  core: {
    key: 'core',
    displayName: 'Core & Conditioning',
    shortName: 'Core',
    icon: '🔥',
    color: '#f59e0b', // amber-500
    description: 'Your core strength and overall body control',
  },
  endurance: {
    key: 'endurance',
    displayName: 'Muscular Endurance',
    shortName: 'Endurance',
    icon: '⚡',
    color: '#10b981', // green-500
    description: 'Your ability to perform exercises for extended periods',
  },
  mobility: {
    key: 'mobility',
    displayName: 'Joint Mobility',
    shortName: 'Mobility',
    icon: '🤸',
    color: '#06b6d4', // cyan-500
    description: 'Your flexibility and range of motion',
  },
};

/**
 * Extended Hexagon Profile with XP tracking
 */
export interface UnifiedHexagonProfile {
  // Visual values (0-10 scale)
  balance: number;
  strength: number;
  staticHolds: number;
  core: number;
  endurance: number;
  mobility: number;

  // XP values
  balanceXP: number;
  strengthXP: number;
  staticHoldsXP: number;
  coreXP: number;
  enduranceXP: number;
  mobilityXP: number;

  // Level values
  balanceLevel: UnifiedProgressionLevel;
  strengthLevel: UnifiedProgressionLevel;
  staticHoldsLevel: UnifiedProgressionLevel;
  coreLevel: UnifiedProgressionLevel;
  enduranceLevel: UnifiedProgressionLevel;
  mobilityLevel: UnifiedProgressionLevel;
}

/**
 * Calculate level from XP
 */
export function getUnifiedLevelFromXP(xp: number): UnifiedProgressionLevel {
  if (xp >= UNIFIED_XP_THRESHOLDS.ELITE.min) return 'ELITE';
  if (xp >= UNIFIED_XP_THRESHOLDS.ADVANCED.min) return 'ADVANCED';
  if (xp >= UNIFIED_XP_THRESHOLDS.INTERMEDIATE.min) return 'INTERMEDIATE';
  return 'BEGINNER';
}

/**
 * Calculate visual value (0-10) from XP and level
 *
 * Each level spans 2.5 points on the visual scale:
 * BEGINNER:     0.0 - 2.5
 * INTERMEDIATE: 2.5 - 5.0
 * ADVANCED:     5.0 - 7.5
 * ELITE:        7.5 - 10.0
 */
export function getUnifiedVisualValueFromXP(xp: number, level: UnifiedProgressionLevel): number {
  const thresholds = UNIFIED_XP_THRESHOLDS[level];
  const levelStart = thresholds.min;
  const levelEnd = thresholds.max === Infinity ? 1000000 : thresholds.max;

  const progressInLevel = (xp - levelStart) / (levelEnd - levelStart);
  const clampedProgress = Math.max(0, Math.min(1, progressInLevel));

  // Each level = 2.5 points on visual scale
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
 * Calculate overall level from MODE (most frequent) of axis levels
 * If there's a tie, uses the higher level
 */
export function calculateUnifiedOverallLevel(profile: Partial<UnifiedHexagonProfile>): UnifiedProgressionLevel {
  const levelAxes: (keyof Pick<UnifiedHexagonProfile,
    'balanceLevel' | 'strengthLevel' | 'staticHoldsLevel' |
    'coreLevel' | 'enduranceLevel' | 'mobilityLevel'>)[] = [
    'balanceLevel',
    'strengthLevel',
    'staticHoldsLevel',
    'coreLevel',
    'enduranceLevel',
    'mobilityLevel',
  ];

  // Get all level values
  const levels = levelAxes.map(axis => profile[axis] || 'BEGINNER');

  // Count frequency of each level
  const levelCounts: Record<string, number> = {};
  levels.forEach(level => {
    levelCounts[level] = (levelCounts[level] || 0) + 1;
  });

  // Find the mode (most frequent level)
  let maxCount = 0;
  let modeLevels: UnifiedProgressionLevel[] = [];

  Object.entries(levelCounts).forEach(([level, count]) => {
    if (count > maxCount) {
      maxCount = count;
      modeLevels = [level as UnifiedProgressionLevel];
    } else if (count === maxCount) {
      modeLevels.push(level as UnifiedProgressionLevel);
    }
  });

  // If there's a tie, return the highest level
  const levelOrder: UnifiedProgressionLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'];
  modeLevels.sort((a, b) => levelOrder.indexOf(b) - levelOrder.indexOf(a));

  return modeLevels[0] || 'BEGINNER';
}

/**
 * Update a single axis with XP
 * Returns updated profile with recalculated level and visual value
 */
export function updateUnifiedAxisXP(
  profile: UnifiedHexagonProfile,
  axis: UnifiedHexagonAxis,
  xpToAdd: number
): UnifiedHexagonProfile {
  const xpKey = `${axis}XP` as keyof UnifiedHexagonProfile;
  const levelKey = `${axis}Level` as keyof UnifiedHexagonProfile;

  const currentXP = (profile[xpKey] as number) || 0;
  const newXP = currentXP + xpToAdd;

  const newLevel = getUnifiedLevelFromXP(newXP);
  const newVisualValue = getUnifiedVisualValueFromXP(newXP, newLevel);

  return {
    ...profile,
    [axis]: newVisualValue,
    [xpKey]: newXP,
    [levelKey]: newLevel,
  };
}

/**
 * Initialize a unified hexagon profile with default values
 */
export function initializeUnifiedHexagonProfile(
  initialXP: Partial<Record<UnifiedHexagonAxis, number>> = {}
): UnifiedHexagonProfile {
  const axes: UnifiedHexagonAxis[] = [
    'balance',
    'strength',
    'staticHolds',
    'core',
    'endurance',
    'mobility',
  ];

  const profile: any = {};

  axes.forEach(axis => {
    const xp = initialXP[axis] || 0;
    const level = getUnifiedLevelFromXP(xp);
    const visualValue = getUnifiedVisualValueFromXP(xp, level);

    profile[axis] = visualValue;
    profile[`${axis}XP`] = xp;
    profile[`${axis}Level`] = level;
  });

  return profile as UnifiedHexagonProfile;
}

/**
 * Get XP required to reach next level
 */
export function getUnifiedXPToNextLevel(currentXP: number): number {
  const currentLevel = getUnifiedLevelFromXP(currentXP);

  if (currentLevel === 'ELITE') {
    return 0; // Already at max level
  }

  const levelOrder: UnifiedProgressionLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'];
  const currentIndex = levelOrder.indexOf(currentLevel);
  const nextLevel = levelOrder[currentIndex + 1];

  return UNIFIED_XP_THRESHOLDS[nextLevel].min - currentXP;
}

/**
 * Get level progress percentage within current level
 */
export function getUnifiedLevelProgress(xp: number): number {
  const level = getUnifiedLevelFromXP(xp);
  const thresholds = UNIFIED_XP_THRESHOLDS[level];

  const levelStart = thresholds.min;
  const levelEnd = thresholds.max === Infinity ? 1000000 : thresholds.max;

  const progress = ((xp - levelStart) / (levelEnd - levelStart)) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

/**
 * Format XP display
 */
export function formatUnifiedXP(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
}

/**
 * Get level color (for UI)
 */
export function getUnifiedLevelColor(level: UnifiedProgressionLevel): string {
  const colors: Record<UnifiedProgressionLevel, string> = {
    BEGINNER: 'text-green-600',
    INTERMEDIATE: 'text-blue-600',
    ADVANCED: 'text-purple-600',
    ELITE: 'text-amber-600',
  };
  return colors[level];
}

/**
 * Get level badge background color (for UI)
 */
export function getUnifiedLevelBadgeColor(level: UnifiedProgressionLevel): string {
  const colors: Record<UnifiedProgressionLevel, string> = {
    BEGINNER: 'bg-green-100 border-green-300 text-green-800',
    INTERMEDIATE: 'bg-blue-100 border-blue-300 text-blue-800',
    ADVANCED: 'bg-purple-100 border-purple-300 text-purple-800',
    ELITE: 'bg-amber-100 border-amber-300 text-amber-800',
  };
  return colors[level];
}

/**
 * Get axis color for visualization
 */
export function getUnifiedAxisColor(axis: UnifiedHexagonAxis): string {
  return UNIFIED_AXIS_METADATA[axis].color;
}

/**
 * Get all axes
 */
export function getAllUnifiedAxes(): UnifiedHexagonAxis[] {
  return ['balance', 'strength', 'staticHolds', 'core', 'endurance', 'mobility'];
}

/**
 * Migrate old hexagon profile to unified system
 * Maps old axis names to new simplified names
 */
export interface OldHexagonProfile {
  relativeStrength?: number;
  muscularEndurance?: number;
  balanceControl?: number;
  jointMobility?: number;
  bodyTension?: number;
  skillTechnique?: number;
  relativeStrengthXP?: number;
  muscularEnduranceXP?: number;
  balanceControlXP?: number;
  jointMobilityXP?: number;
  bodyTensionXP?: number;
  skillTechniqueXP?: number;
  relativeStrengthLevel?: string;
  muscularEnduranceLevel?: string;
  balanceControlLevel?: string;
  jointMobilityLevel?: string;
  bodyTensionLevel?: string;
  skillTechniqueLevel?: string;
}

export function migrateToUnifiedHexagon(oldProfile: OldHexagonProfile | null | undefined): UnifiedHexagonProfile {
  // Handle null/undefined profile by returning default profile
  if (!oldProfile) {
    return initializeUnifiedHexagonProfile();
  }

  return {
    // Visual values
    balance: oldProfile.balanceControl || 0,
    strength: oldProfile.relativeStrength || 0,
    staticHolds: oldProfile.skillTechnique || 0,
    core: oldProfile.bodyTension || 0,
    endurance: oldProfile.muscularEndurance || 0,
    mobility: oldProfile.jointMobility || 0,

    // XP values
    balanceXP: oldProfile.balanceControlXP || 0,
    strengthXP: oldProfile.relativeStrengthXP || 0,
    staticHoldsXP: oldProfile.skillTechniqueXP || 0,
    coreXP: oldProfile.bodyTensionXP || 0,
    enduranceXP: oldProfile.muscularEnduranceXP || 0,
    mobilityXP: oldProfile.jointMobilityXP || 0,

    // Level values
    balanceLevel: (oldProfile.balanceControlLevel as UnifiedProgressionLevel) || 'BEGINNER',
    strengthLevel: (oldProfile.relativeStrengthLevel as UnifiedProgressionLevel) || 'BEGINNER',
    staticHoldsLevel: (oldProfile.skillTechniqueLevel as UnifiedProgressionLevel) || 'BEGINNER',
    coreLevel: (oldProfile.bodyTensionLevel as UnifiedProgressionLevel) || 'BEGINNER',
    enduranceLevel: (oldProfile.muscularEnduranceLevel as UnifiedProgressionLevel) || 'BEGINNER',
    mobilityLevel: (oldProfile.jointMobilityLevel as UnifiedProgressionLevel) || 'BEGINNER',
  };
}
