/**
 * HEXAGON UNIFIED SYSTEM
 *
 * This module synchronizes hexagon XP with actual performance metrics.
 * It provides the "single source of truth" integration between:
 * - Performance metrics (pull-ups, dips, weighted exercises, etc.)
 * - SubLevels (D- through S+)
 * - Hexagon XP (6 axes: strength, staticHolds, balance, core, endurance, mobility)
 *
 * Key Principle: SubLevel is calculated from metrics, then XP is derived from SubLevel
 *
 * See: HEXAGONO_REWORK_STRATEGY.md for full documentation
 */

import { SubLevel, SUBLEVEL_ORDER } from './sublevel-to-xp';
import { sublevelToMinXP, xpToSubLevel } from './sublevel-to-xp';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PerformanceMetrics {
  // Primary metrics (required)
  pullUpsMax: number;
  dipsMax: number;

  // Secondary metrics (optional)
  weightedPullUps?: number; // kg
  weightedDips?: number; // kg
  pushUpsMax?: number;
  squatsMax?: number;
  plankSeconds?: number;

  // Advanced metrics (optional)
  handstandSeconds?: number;
  lSitSeconds?: number;
  frontLeverSeconds?: number;
  backLeverSeconds?: number;
  plancheSeconds?: number;
  muscleUpMax?: number;
}

export interface HexagonXP {
  strength: number;
  staticHolds: number;
  balance: number;
  core: number;
  endurance: number;
  mobility: number;
}

export interface SubLevelUpResult {
  leveledUp: boolean;
  oldLevel: SubLevel;
  newLevel: SubLevel;
  xpGained: number;
}

// ============================================================================
// SUBLEVEL CALCULATION FROM METRICS
// ============================================================================

/**
 * Calculates the user's sublevel based on their performance metrics
 *
 * This is the PRIMARY function for determining user level.
 * Uses granular ranges for pull-ups (15 ranges) and dips (9 ranges)
 *
 * @param metrics - User's current performance metrics
 * @returns SubLevel (D- through S+)
 *
 * @example
 * calculateSubLevelFromMetrics({ pullUpsMax: 12, dipsMax: 8 }) // => 'C'
 * calculateSubLevelFromMetrics({ pullUpsMax: 40, dipsMax: 25 }) // => 'A'
 */
export function calculateSubLevelFromMetrics(metrics: PerformanceMetrics): SubLevel {
  const { pullUpsMax, dipsMax } = metrics;

  // ==========================================
  // PULL-UPS MAPPING (15 granular ranges)
  // ==========================================
  let pullUpLevel: SubLevel = 'D-';

  if (pullUpsMax >= 70) pullUpLevel = 'S+';
  else if (pullUpsMax >= 60) pullUpLevel = 'S';
  else if (pullUpsMax >= 50) pullUpLevel = 'S-';
  else if (pullUpsMax >= 45) pullUpLevel = 'A+';
  else if (pullUpsMax >= 40) pullUpLevel = 'A';
  else if (pullUpsMax >= 35) pullUpLevel = 'A-';
  else if (pullUpsMax >= 30) pullUpLevel = 'B+';
  else if (pullUpsMax >= 25) pullUpLevel = 'B';
  else if (pullUpsMax >= 20) pullUpLevel = 'B-';
  else if (pullUpsMax >= 15) pullUpLevel = 'C+';
  else if (pullUpsMax >= 11) pullUpLevel = 'C';
  else if (pullUpsMax >= 8) pullUpLevel = 'C-';
  else if (pullUpsMax >= 4) pullUpLevel = 'D+';
  else if (pullUpsMax >= 1) pullUpLevel = 'D';

  // ==========================================
  // DIPS MAPPING (9 granular ranges)
  // ==========================================
  let dipLevel: SubLevel = 'D-';

  if (dipsMax >= 35) dipLevel = 'S+';
  else if (dipsMax >= 30) dipLevel = 'S-';
  else if (dipsMax >= 25) dipLevel = 'A+';
  else if (dipsMax >= 20) dipLevel = 'A-';
  else if (dipsMax >= 15) dipLevel = 'B+';
  else if (dipsMax >= 10) dipLevel = 'B-';
  else if (dipsMax >= 5) dipLevel = 'C';
  else if (dipsMax >= 1) dipLevel = 'D';

  // ==========================================
  // WEIGHTED BONUS (boost within current level)
  // ==========================================
  // If user can do weighted pull-ups/dips, they might be stronger than their bodyweight reps suggest
  let weightedBonus = 0;

  if (metrics.weightedPullUps && metrics.weightedPullUps > 0) {
    // Each 10kg of weighted pull-ups = approximately +1 sublevel
    weightedBonus += Math.floor(metrics.weightedPullUps / 10);
  }

  if (metrics.weightedDips && metrics.weightedDips > 0) {
    // Each 15kg of weighted dips = approximately +1 sublevel
    weightedBonus += Math.floor(metrics.weightedDips / 15);
  }

  // ==========================================
  // FINAL CALCULATION (weighted average)
  // ==========================================
  // Pull-ups are weighted more heavily (60%) than dips (40%)
  const pullUpIndex = SUBLEVEL_ORDER.indexOf(pullUpLevel);
  const dipIndex = SUBLEVEL_ORDER.indexOf(dipLevel);

  const avgIndex = Math.floor((pullUpIndex * 0.6 + dipIndex * 0.4));
  const finalIndex = Math.min(avgIndex + weightedBonus, SUBLEVEL_ORDER.length - 1);

  return SUBLEVEL_ORDER[finalIndex];
}

// ============================================================================
// HEXAGON XP SYNCHRONIZATION
// ============================================================================

/**
 * MAIN FUNCTION: Synchronizes hexagon XP with user's sublevel
 *
 * This function should be called whenever:
 * 1. User completes initial assessment
 * 2. User completes a workout and updates their metrics
 * 3. User manually updates their performance data
 *
 * @param currentSubLevel - User's current sublevel (from calculateSubLevelFromMetrics or DB)
 * @param performanceMetrics - User's current performance metrics
 * @returns HexagonXP object with all 6 axes
 *
 * @example
 * const subLevel = calculateSubLevelFromMetrics(metrics);
 * const hexagonXP = syncHexagonWithSubLevel(subLevel, metrics);
 * // hexagonXP = { strength: 128000, staticHolds: 128000, ... }
 */
export function syncHexagonWithSubLevel(
  currentSubLevel: SubLevel,
  performanceMetrics: PerformanceMetrics
): HexagonXP {
  // Base XP for all axes: minimum XP of current sublevel
  const baseXP = sublevelToMinXP(currentSubLevel);

  // ==========================================
  // STRENGTH AXIS (specialized calculation)
  // ==========================================
  const strengthXP = calculateStrengthXP(performanceMetrics, baseXP);

  // ==========================================
  // STATIC HOLDS AXIS (specialized calculation)
  // ==========================================
  const staticHoldsXP = calculateStaticHoldsXP(performanceMetrics, baseXP);

  // ==========================================
  // OTHER AXES (use base XP for now)
  // ==========================================
  // TODO: FASE 2 - Implement specialized calculations for each axis
  // For now, all non-specialized axes use baseXP

  return {
    strength: strengthXP,
    staticHolds: staticHoldsXP,
    balance: baseXP,     // TODO: Calculate from balance exercises
    core: baseXP,        // TODO: Calculate from core exercises (hollow holds, dragon flags, etc)
    endurance: baseXP,   // TODO: Calculate from circuit performance, AMRAP, time under tension
    mobility: baseXP,    // TODO: Calculate from ROM tests, flexibility benchmarks
  };
}

/**
 * Calculates Strength axis XP based on pull-ups, dips, and weighted variants
 */
function calculateStrengthXP(metrics: PerformanceMetrics, baseXP: number): number {
  // Calculate sublevel specifically from strength metrics
  const strengthSubLevel = calculateSubLevelFromMetrics({
    pullUpsMax: metrics.pullUpsMax,
    dipsMax: metrics.dipsMax,
    weightedPullUps: metrics.weightedPullUps,
    weightedDips: metrics.weightedDips,
  });

  let strengthXP = sublevelToMinXP(strengthSubLevel);

  // ==========================================
  // BONUS XP: Weighted exercises progression within sublevel
  // ==========================================
  // This allows users to gain XP between sublevels

  if (metrics.weightedPullUps && metrics.weightedPullUps > 0) {
    // +100 XP per kg of weighted pull-ups
    strengthXP += metrics.weightedPullUps * 100;
  }

  if (metrics.weightedDips && metrics.weightedDips > 0) {
    // +80 XP per kg of weighted dips (slightly less valuable than pull-ups)
    strengthXP += metrics.weightedDips * 80;
  }

  // Muscle-ups bonus
  if (metrics.muscleUpMax && metrics.muscleUpMax > 0) {
    // +500 XP per muscle-up (they're hard!)
    strengthXP += metrics.muscleUpMax * 500;
  }

  // Ensure we don't go below baseXP
  return Math.max(strengthXP, baseXP);
}

/**
 * Calculates Static Holds axis XP based on handstand, L-sit, levers, planche
 */
function calculateStaticHoldsXP(metrics: PerformanceMetrics, baseXP: number): number {
  let staticXP = baseXP;

  // Handstand hold
  if (metrics.handstandSeconds && metrics.handstandSeconds > 0) {
    // +200 XP per second of handstand
    staticXP += metrics.handstandSeconds * 200;
  }

  // L-sit hold
  if (metrics.lSitSeconds && metrics.lSitSeconds > 0) {
    // +300 XP per second of L-sit
    staticXP += metrics.lSitSeconds * 300;
  }

  // Front lever
  if (metrics.frontLeverSeconds && metrics.frontLeverSeconds > 0) {
    // +500 XP per second of front lever (elite skill)
    staticXP += metrics.frontLeverSeconds * 500;
  }

  // Back lever
  if (metrics.backLeverSeconds && metrics.backLeverSeconds > 0) {
    // +400 XP per second of back lever
    staticXP += metrics.backLeverSeconds * 400;
  }

  // Planche
  if (metrics.plancheSeconds && metrics.plancheSeconds > 0) {
    // +800 XP per second of planche (most elite skill)
    staticXP += metrics.plancheSeconds * 800;
  }

  return Math.max(staticXP, baseXP);
}

// ============================================================================
// LEVEL UP DETECTION
// ============================================================================

/**
 * Checks if user leveled up by comparing old and new metrics
 *
 * @param oldMetrics - Previous performance metrics
 * @param newMetrics - Current performance metrics
 * @returns SubLevelUpResult with leveledUp flag and details
 *
 * @example
 * const result = checkSubLevelUp(oldMetrics, newMetrics);
 * if (result.leveledUp) {
 *   console.log(`Level up! ${result.oldLevel} → ${result.newLevel}`);
 *   // Show celebration UI
 * }
 */
export function checkSubLevelUp(
  oldMetrics: PerformanceMetrics,
  newMetrics: PerformanceMetrics
): SubLevelUpResult {
  const oldLevel = calculateSubLevelFromMetrics(oldMetrics);
  const newLevel = calculateSubLevelFromMetrics(newMetrics);

  const oldXP = sublevelToMinXP(oldLevel);
  const newXP = sublevelToMinXP(newLevel);

  return {
    leveledUp: oldLevel !== newLevel,
    oldLevel,
    newLevel,
    xpGained: newXP - oldXP,
  };
}

/**
 * Checks if user should level up based on XP threshold crossing
 * (Alternative method when we track XP directly)
 */
export function checkXPLevelUp(oldXP: number, newXP: number): SubLevelUpResult {
  const oldLevel = xpToSubLevel(oldXP);
  const newLevel = xpToSubLevel(newXP);

  return {
    leveledUp: oldLevel !== newLevel,
    oldLevel,
    newLevel,
    xpGained: newXP - oldXP,
  };
}

// ============================================================================
// PERFORMANCE COMPARISON HELPERS
// ============================================================================

/**
 * Checks if user improved in any metric
 */
export function hasImproved(
  oldMetrics: PerformanceMetrics,
  newMetrics: PerformanceMetrics
): boolean {
  return (
    newMetrics.pullUpsMax > oldMetrics.pullUpsMax ||
    newMetrics.dipsMax > oldMetrics.dipsMax ||
    (newMetrics.weightedPullUps || 0) > (oldMetrics.weightedPullUps || 0) ||
    (newMetrics.weightedDips || 0) > (oldMetrics.weightedDips || 0) ||
    (newMetrics.pushUpsMax || 0) > (oldMetrics.pushUpsMax || 0) ||
    (newMetrics.squatsMax || 0) > (oldMetrics.squatsMax || 0) ||
    (newMetrics.plankSeconds || 0) > (oldMetrics.plankSeconds || 0)
  );
}

/**
 * Gets a list of metrics that improved
 */
export function getImprovedMetrics(
  oldMetrics: PerformanceMetrics,
  newMetrics: PerformanceMetrics
): string[] {
  const improved: string[] = [];

  if (newMetrics.pullUpsMax > oldMetrics.pullUpsMax) {
    improved.push(`Pull-ups: ${oldMetrics.pullUpsMax} → ${newMetrics.pullUpsMax}`);
  }

  if (newMetrics.dipsMax > oldMetrics.dipsMax) {
    improved.push(`Dips: ${oldMetrics.dipsMax} → ${newMetrics.dipsMax}`);
  }

  if ((newMetrics.weightedPullUps || 0) > (oldMetrics.weightedPullUps || 0)) {
    improved.push(`Weighted Pull-ups: ${oldMetrics.weightedPullUps || 0}kg → ${newMetrics.weightedPullUps}kg`);
  }

  if ((newMetrics.weightedDips || 0) > (oldMetrics.weightedDips || 0)) {
    improved.push(`Weighted Dips: ${oldMetrics.weightedDips || 0}kg → ${newMetrics.weightedDips}kg`);
  }

  if ((newMetrics.pushUpsMax || 0) > (oldMetrics.pushUpsMax || 0)) {
    improved.push(`Push-ups: ${oldMetrics.pushUpsMax || 0} → ${newMetrics.pushUpsMax}`);
  }

  if ((newMetrics.squatsMax || 0) > (oldMetrics.squatsMax || 0)) {
    improved.push(`Squats: ${oldMetrics.squatsMax || 0} → ${newMetrics.squatsMax}`);
  }

  if ((newMetrics.plankSeconds || 0) > (oldMetrics.plankSeconds || 0)) {
    improved.push(`Plank: ${oldMetrics.plankSeconds || 0}s → ${newMetrics.plankSeconds}s`);
  }

  return improved;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates that performance metrics are reasonable
 */
export function validateMetrics(metrics: PerformanceMetrics): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Pull-ups validation
  if (metrics.pullUpsMax < 0 || metrics.pullUpsMax > 200) {
    errors.push('Pull-ups must be between 0 and 200');
  }

  // Dips validation
  if (metrics.dipsMax < 0 || metrics.dipsMax > 200) {
    errors.push('Dips must be between 0 and 200');
  }

  // Weighted validation
  if (metrics.weightedPullUps && metrics.weightedPullUps < 0) {
    errors.push('Weighted pull-ups cannot be negative');
  }

  if (metrics.weightedDips && metrics.weightedDips < 0) {
    errors.push('Weighted dips cannot be negative');
  }

  // Logical validation: can't do weighted if you can't do bodyweight
  if (metrics.weightedPullUps && metrics.weightedPullUps > 0 && metrics.pullUpsMax === 0) {
    errors.push('Cannot have weighted pull-ups without bodyweight pull-ups');
  }

  if (metrics.weightedDips && metrics.weightedDips > 0 && metrics.dipsMax === 0) {
    errors.push('Cannot have weighted dips without bodyweight dips');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Ensures metrics are within valid ranges (auto-corrects)
 */
export function sanitizeMetrics(metrics: PerformanceMetrics): PerformanceMetrics {
  return {
    pullUpsMax: Math.max(0, Math.min(200, metrics.pullUpsMax)),
    dipsMax: Math.max(0, Math.min(200, metrics.dipsMax)),
    weightedPullUps: metrics.weightedPullUps ? Math.max(0, metrics.weightedPullUps) : undefined,
    weightedDips: metrics.weightedDips ? Math.max(0, metrics.weightedDips) : undefined,
    pushUpsMax: metrics.pushUpsMax ? Math.max(0, Math.min(500, metrics.pushUpsMax)) : undefined,
    squatsMax: metrics.squatsMax ? Math.max(0, Math.min(500, metrics.squatsMax)) : undefined,
    plankSeconds: metrics.plankSeconds ? Math.max(0, Math.min(1800, metrics.plankSeconds)) : undefined,
    handstandSeconds: metrics.handstandSeconds ? Math.max(0, Math.min(600, metrics.handstandSeconds)) : undefined,
    lSitSeconds: metrics.lSitSeconds ? Math.max(0, Math.min(600, metrics.lSitSeconds)) : undefined,
    frontLeverSeconds: metrics.frontLeverSeconds ? Math.max(0, Math.min(300, metrics.frontLeverSeconds)) : undefined,
    backLeverSeconds: metrics.backLeverSeconds ? Math.max(0, Math.min(300, metrics.backLeverSeconds)) : undefined,
    plancheSeconds: metrics.plancheSeconds ? Math.max(0, Math.min(300, metrics.plancheSeconds)) : undefined,
    muscleUpMax: metrics.muscleUpMax ? Math.max(0, Math.min(100, metrics.muscleUpMax)) : undefined,
  };
}
