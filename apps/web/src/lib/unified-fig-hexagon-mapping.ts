/**
 * Unified FIG to Hexagon Mapping
 *
 * Maps FIG Mastery Goals to the new unified hexagon axes
 *
 * Direct mappings (FIG categories → Hexagon axes):
 * - BALANCE (FIG) → balance
 * - STRENGTH (FIG) → strength
 * - SKILL_STATIC (FIG) → staticHolds
 * - CORE (FIG) → core
 *
 * Transversal axes (calculated from all exercises):
 * - endurance (based on volume/time across all exercises)
 * - mobility (based on flexibility/ROM requirements)
 */

import { MasteryGoal } from './fig-level-progressions';
import { UnifiedHexagonAxis } from './unified-hexagon-system';

/**
 * Primary mapping: Each FIG skill → Primary hexagon axis
 */
export const UNIFIED_SKILL_TO_HEXAGON_MAP: Record<MasteryGoal, UnifiedHexagonAxis> = {
  // ===== BALANCE SKILLS → balance axis =====
  HANDSTAND: 'balance',
  RINGS_HANDSTAND: 'balance',
  PRESS_HANDSTAND: 'balance',
  STRAIGHT_ARM_PRESS: 'balance',

  // ===== STATIC HOLDS → staticHolds axis =====
  PLANCHE: 'staticHolds',
  FRONT_LEVER: 'staticHolds',
  BACK_LEVER: 'staticHolds',
  IRON_CROSS: 'staticHolds',
  L_SIT_MANNA: 'staticHolds',
  FLAG: 'staticHolds',

  // ===== STRENGTH SKILLS → strength axis =====
  PULL_UPS: 'strength',
  ONE_ARM_PULL_UP: 'strength',
  HANDSTAND_PUSHUP: 'strength',
  DIPS: 'strength',
  RING_DIPS: 'strength',
  MUSCLE_UP: 'strength',
  PISTOL_SQUAT: 'strength',

  // ===== CORE SKILLS → core axis =====
  AB_WHEEL: 'core',
};

/**
 * Secondary mappings: Skills that contribute to multiple axes
 * Format: { skill: { primaryAxis: weight, secondaryAxis: weight } }
 *
 * Weights should sum to 1.0 for each skill
 */
export const UNIFIED_SKILL_MULTI_AXIS_CONTRIBUTIONS: Record<
  MasteryGoal,
  Partial<Record<UnifiedHexagonAxis, number>>
> = {
  // Handstand skills also require core stability
  HANDSTAND: {
    balance: 0.7,
    core: 0.2,
    mobility: 0.1,
  },
  RINGS_HANDSTAND: {
    balance: 0.6,
    core: 0.3,
    strength: 0.1,
  },
  PRESS_HANDSTAND: {
    balance: 0.5,
    core: 0.3,
    strength: 0.2,
  },
  STRAIGHT_ARM_PRESS: {
    balance: 0.4,
    strength: 0.3,
    core: 0.2,
    staticHolds: 0.1,
  },

  // Static holds require significant strength
  PLANCHE: {
    staticHolds: 0.6,
    strength: 0.3,
    core: 0.1,
  },
  FRONT_LEVER: {
    staticHolds: 0.6,
    strength: 0.3,
    core: 0.1,
  },
  BACK_LEVER: {
    staticHolds: 0.5,
    strength: 0.3,
    mobility: 0.2,
  },
  IRON_CROSS: {
    staticHolds: 0.6,
    strength: 0.4,
  },
  L_SIT_MANNA: {
    staticHolds: 0.5,
    core: 0.3,
    mobility: 0.2,
  },
  FLAG: {
    staticHolds: 0.5,
    core: 0.3,
    strength: 0.2,
  },

  // Pull-ups and variations
  PULL_UPS: {
    strength: 0.7,
    endurance: 0.3,
  },
  ONE_ARM_PULL_UP: {
    strength: 0.9,
    core: 0.1,
  },
  MUSCLE_UP: {
    strength: 0.7,
    staticHolds: 0.2,
    core: 0.1,
  },

  // Push exercises
  HANDSTAND_PUSHUP: {
    strength: 0.6,
    balance: 0.3,
    core: 0.1,
  },
  DIPS: {
    strength: 0.7,
    endurance: 0.3,
  },
  RING_DIPS: {
    strength: 0.6,
    core: 0.3,
    balance: 0.1,
  },

  // Lower body
  PISTOL_SQUAT: {
    strength: 0.6,
    balance: 0.3,
    mobility: 0.1,
  },

  // Core
  AB_WHEEL: {
    core: 0.8,
    strength: 0.2,
  },
};

/**
 * Get primary hexagon axis for a skill
 */
export function getUnifiedPrimaryAxis(skill: MasteryGoal): UnifiedHexagonAxis {
  return UNIFIED_SKILL_TO_HEXAGON_MAP[skill];
}

/**
 * Get all axis contributions for a skill
 * Returns weights for XP distribution
 */
export function getUnifiedAxisContributions(
  skill: MasteryGoal
): Partial<Record<UnifiedHexagonAxis, number>> {
  // Return multi-axis contributions if defined
  if (UNIFIED_SKILL_MULTI_AXIS_CONTRIBUTIONS[skill]) {
    return UNIFIED_SKILL_MULTI_AXIS_CONTRIBUTIONS[skill];
  }

  // Otherwise, 100% to primary axis
  const primaryAxis = getUnifiedPrimaryAxis(skill);
  return {
    [primaryAxis]: 1.0,
  };
}

/**
 * Calculate XP distribution across hexagon axes for a completed exercise
 *
 * @param skill - The FIG mastery goal being trained
 * @param totalXP - Total XP earned for the exercise
 * @param duration - Duration in minutes (for endurance calculation)
 * @param includeEndurance - Whether to add endurance bonus
 * @returns Object with XP distribution per axis
 */
export function distributeUnifiedXPAcrossAxes(
  skill: MasteryGoal,
  totalXP: number,
  options: {
    duration?: number;
    includeEndurance?: boolean;
  } = {}
): Partial<Record<UnifiedHexagonAxis, number>> {
  const { duration = 0, includeEndurance = true } = options;

  // Get base contributions
  const contributions = getUnifiedAxisContributions(skill);
  const distribution: Partial<Record<UnifiedHexagonAxis, number>> = {};

  // Distribute base XP according to contributions
  Object.entries(contributions).forEach(([axis, weight]) => {
    distribution[axis as UnifiedHexagonAxis] = totalXP * weight;
  });

  // Add endurance bonus if duration is significant (> 5 minutes)
  if (includeEndurance && duration > 5) {
    const enduranceBonus = Math.min(totalXP * 0.2, duration * 10); // Cap at 20% of base XP or 10 XP per minute
    distribution.endurance = (distribution.endurance || 0) + enduranceBonus;
  }

  return distribution;
}

/**
 * Map FIG assessment level to XP for hexagon initialization
 *
 * Used when user completes FIG assessments and we need to initialize
 * their hexagon profile based on their current skill levels
 */
export function mapFigLevelToXP(level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'): number {
  const xpMap = {
    BEGINNER: 24000, // Middle of BEGINNER range (0-48k)
    INTERMEDIATE: 96000, // Middle of INTERMEDIATE range (48k-144k)
    ADVANCED: 264000, // Middle of ADVANCED range (144k-384k)
    ELITE: 500000, // Well into ELITE range (384k+)
  };
  return xpMap[level];
}

/**
 * Recalculate hexagon profile from FIG assessments
 *
 * Takes all user skill assessments and calculates hexagon axis XP
 *
 * @param assessments - Array of { skill: MasteryGoal, level: string }
 * @returns UnifiedHexagonProfile with calculated XP per axis
 */
export function recalculateHexagonFromFigAssessments(
  assessments: Array<{ skill: MasteryGoal; level: string }>
): Partial<Record<UnifiedHexagonAxis, number>> {
  const axisXP: Partial<Record<UnifiedHexagonAxis, number>> = {
    balance: 0,
    strength: 0,
    staticHolds: 0,
    core: 0,
    endurance: 0,
    mobility: 0,
  };

  const axisCounts: Partial<Record<UnifiedHexagonAxis, number>> = {
    balance: 0,
    strength: 0,
    staticHolds: 0,
    core: 0,
    endurance: 0,
    mobility: 0,
  };

  // For each assessment, distribute XP to relevant axes
  assessments.forEach(({ skill, level }) => {
    const normalizedLevel = level.toUpperCase() as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
    const baseXP = mapFigLevelToXP(normalizedLevel);

    const contributions = getUnifiedAxisContributions(skill);

    Object.entries(contributions).forEach(([axis, weight]) => {
      const axisKey = axis as UnifiedHexagonAxis;
      axisXP[axisKey] = (axisXP[axisKey] || 0) + baseXP * weight;
      axisCounts[axisKey] = (axisCounts[axisKey] || 0) + weight;
    });
  });

  // Average XP per axis (to avoid inflating XP with many assessments)
  const finalXP: Partial<Record<UnifiedHexagonAxis, number>> = {};
  Object.entries(axisXP).forEach(([axis, xp]) => {
    const axisKey = axis as UnifiedHexagonAxis;
    const count = axisCounts[axisKey] || 1;
    finalXP[axisKey] = Math.round(xp / Math.max(count, 1));
  });

  return finalXP;
}

/**
 * Get display name for unified hexagon axis
 */
export function getUnifiedAxisDisplayName(axis: UnifiedHexagonAxis): string {
  const displayNames: Record<UnifiedHexagonAxis, string> = {
    balance: 'Balance & Handstands',
    strength: 'Strength & Power',
    staticHolds: 'Static Holds',
    core: 'Core & Conditioning',
    endurance: 'Muscular Endurance',
    mobility: 'Joint Mobility',
  };
  return displayNames[axis];
}

/**
 * Get short name for unified hexagon axis
 */
export function getUnifiedAxisShortName(axis: UnifiedHexagonAxis): string {
  const shortNames: Record<UnifiedHexagonAxis, string> = {
    balance: 'Balance',
    strength: 'Strength',
    staticHolds: 'Static Holds',
    core: 'Core',
    endurance: 'Endurance',
    mobility: 'Mobility',
  };
  return shortNames[axis];
}
