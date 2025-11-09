/**
 * Skill Branch to Hexagon Category Mapping
 *
 * Maps each FIG skill branch to its corresponding hexagon category
 * for XP reward distribution.
 *
 * Hexagon Categories from HexagonProfile:
 * - balanceControl (balance)
 * - relativeStrength (strength)
 * - skillTechnique (static_holds)
 * - bodyTension (core)
 * - muscularEndurance (endurance)
 * - jointMobility (mobility)
 */

import { MasteryGoal } from './fig-level-progressions';

export type HexagonCategory =
  | 'balanceControl'
  | 'relativeStrength'
  | 'skillTechnique'
  | 'bodyTension'
  | 'muscularEndurance'
  | 'jointMobility';

/**
 * Map skill branches to hexagon categories
 */
export const SKILL_TO_HEXAGON_MAP: Record<MasteryGoal, HexagonCategory> = {
  // Balance skills
  HANDSTAND: 'balanceControl',
  RINGS_HANDSTAND: 'balanceControl',
  PRESS_HANDSTAND: 'balanceControl',
  STRAIGHT_ARM_PRESS: 'balanceControl',

  // Static holds skills
  PLANCHE: 'skillTechnique',
  FRONT_LEVER: 'skillTechnique',
  BACK_LEVER: 'skillTechnique',
  IRON_CROSS: 'skillTechnique',
  L_SIT_MANNA: 'skillTechnique',
  FLAG: 'skillTechnique',

  // Strength skills
  PULL_UPS: 'relativeStrength',
  ONE_ARM_PULL_UP: 'relativeStrength',
  HANDSTAND_PUSHUP: 'relativeStrength',
  DIPS: 'relativeStrength',
  RING_DIPS: 'relativeStrength',
  MUSCLE_UP: 'relativeStrength',
  PISTOL_SQUAT: 'relativeStrength',

  // Core skills
  AB_WHEEL: 'bodyTension',
};

/**
 * Get hexagon category for a skill branch
 */
export function getHexagonCategory(skillBranch: MasteryGoal): HexagonCategory {
  return SKILL_TO_HEXAGON_MAP[skillBranch];
}

/**
 * Get display name for hexagon category
 */
export function getHexagonCategoryDisplayName(category: HexagonCategory): string {
  const displayNames: Record<HexagonCategory, string> = {
    balanceControl: 'Balance & Control',
    relativeStrength: 'Relative Strength',
    skillTechnique: 'Skill & Technique',
    bodyTension: 'Body Tension & Core',
    muscularEndurance: 'Muscular Endurance',
    jointMobility: 'Joint Mobility',
  };

  return displayNames[category];
}

/**
 * Get XP field name for hexagon category
 */
export function getHexagonXPField(category: HexagonCategory): string {
  return `${category}XP`;
}

/**
 * Get level field name for hexagon category
 */
export function getHexagonLevelField(category: HexagonCategory): string {
  return `${category}Level`;
}
