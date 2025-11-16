/**
 * SUBLEVEL TO XP MAPPING SYSTEM
 *
 * This module provides bidirectional conversion between:
 * - 15 granular sublevels (D-, D, D+, C-, C, C+, B-, B, B+, A-, A, A+, S-, S, S+)
 * - XP ranges (~32,000 XP per sublevel)
 * - 4 visual tiers (BEGINNER, INTERMEDIATE, ADVANCED, ELITE)
 *
 * Purpose: Unify the hexagon system with performance-based sublevels
 * See: HEXAGONO_REWORK_STRATEGY.md for full documentation
 */

export type SubLevel =
  | 'D-' | 'D' | 'D+'
  | 'C-' | 'C' | 'C+'
  | 'B-' | 'B' | 'B+'
  | 'A-' | 'A' | 'A+'
  | 'S-' | 'S' | 'S+';

export type HexagonTier = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

export interface SubLevelXPRange {
  subLevel: SubLevel;
  minXP: number;
  maxXP: number;
  tier: HexagonTier;
  tierLevel: number; // 1-6 within tier
}

/**
 * Complete mapping of 15 sublevels to XP ranges
 * Each sublevel represents ~32,000 XP of progression
 */
export const SUBLEVEL_XP_MAP: Record<SubLevel, SubLevelXPRange> = {
  // BEGINNER TIER (D levels)
  'D-': { subLevel: 'D-', minXP: 0,      maxXP: 32000,  tier: 'BEGINNER', tierLevel: 1 },
  'D':  { subLevel: 'D',  minXP: 32000,  maxXP: 64000,  tier: 'BEGINNER', tierLevel: 2 },
  'D+': { subLevel: 'D+', minXP: 64000,  maxXP: 96000,  tier: 'BEGINNER', tierLevel: 3 },

  // INTERMEDIATE TIER (C and B levels)
  'C-': { subLevel: 'C-', minXP: 96000,  maxXP: 128000, tier: 'INTERMEDIATE', tierLevel: 1 },
  'C':  { subLevel: 'C',  minXP: 128000, maxXP: 160000, tier: 'INTERMEDIATE', tierLevel: 2 },
  'C+': { subLevel: 'C+', minXP: 160000, maxXP: 192000, tier: 'INTERMEDIATE', tierLevel: 3 },
  'B-': { subLevel: 'B-', minXP: 192000, maxXP: 224000, tier: 'INTERMEDIATE', tierLevel: 4 },
  'B':  { subLevel: 'B',  minXP: 224000, maxXP: 256000, tier: 'INTERMEDIATE', tierLevel: 5 },
  'B+': { subLevel: 'B+', minXP: 256000, maxXP: 288000, tier: 'INTERMEDIATE', tierLevel: 6 },

  // ADVANCED TIER (A levels)
  'A-': { subLevel: 'A-', minXP: 288000, maxXP: 320000, tier: 'ADVANCED', tierLevel: 1 },
  'A':  { subLevel: 'A',  minXP: 320000, maxXP: 352000, tier: 'ADVANCED', tierLevel: 2 },
  'A+': { subLevel: 'A+', minXP: 352000, maxXP: 384000, tier: 'ADVANCED', tierLevel: 3 },

  // ELITE TIER (S levels)
  'S-': { subLevel: 'S-', minXP: 384000, maxXP: 416000, tier: 'ELITE', tierLevel: 1 },
  'S':  { subLevel: 'S',  minXP: 416000, maxXP: 448000, tier: 'ELITE', tierLevel: 2 },
  'S+': { subLevel: 'S+', minXP: 448000, maxXP: Infinity, tier: 'ELITE', tierLevel: 3 },
};

/**
 * Ordered list of sublevels for progression tracking
 */
export const SUBLEVEL_ORDER: SubLevel[] = [
  'D-', 'D', 'D+',
  'C-', 'C', 'C+',
  'B-', 'B', 'B+',
  'A-', 'A', 'A+',
  'S-', 'S', 'S+'
];

/**
 * Tier XP ranges for visual grouping
 */
export const TIER_XP_RANGES: Record<HexagonTier, { min: number; max: number }> = {
  BEGINNER: { min: 0, max: 96000 },
  INTERMEDIATE: { min: 96000, max: 288000 },
  ADVANCED: { min: 288000, max: 384000 },
  ELITE: { min: 384000, max: Infinity },
};

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

/**
 * Converts a sublevel to its minimum XP value
 *
 * @example
 * sublevelToMinXP('C') // => 128000
 * sublevelToMinXP('S+') // => 448000
 */
export function sublevelToMinXP(subLevel: SubLevel | null): number {
  if (!subLevel) return 0;
  return SUBLEVEL_XP_MAP[subLevel].minXP;
}

/**
 * Converts a sublevel to its complete XP range information
 *
 * @example
 * sublevelToXPRange('C') // => { subLevel: 'C', minXP: 128000, maxXP: 160000, ... }
 */
export function sublevelToXPRange(subLevel: SubLevel | null): SubLevelXPRange {
  if (!subLevel) return SUBLEVEL_XP_MAP['D-'];
  return SUBLEVEL_XP_MAP[subLevel];
}

/**
 * Converts XP to the corresponding sublevel
 *
 * @example
 * xpToSubLevel(0) // => 'D-'
 * xpToSubLevel(150000) // => 'C+'
 * xpToSubLevel(500000) // => 'S+'
 */
export function xpToSubLevel(xp: number): SubLevel {
  for (const subLevel of SUBLEVEL_ORDER) {
    const range = SUBLEVEL_XP_MAP[subLevel];
    if (xp >= range.minXP && xp < range.maxXP) {
      return subLevel;
    }
  }
  return 'S+'; // Max level for any XP above 448k
}

/**
 * Gets the hexagon tier (visual grouping) for a sublevel
 *
 * @example
 * sublevelToTier('D+') // => 'BEGINNER'
 * sublevelToTier('C') // => 'INTERMEDIATE'
 * sublevelToTier('A+') // => 'ADVANCED'
 */
export function sublevelToTier(subLevel: SubLevel | null): HexagonTier {
  if (!subLevel) return 'BEGINNER';
  return SUBLEVEL_XP_MAP[subLevel].tier;
}

/**
 * Gets all sublevels within a specific tier
 *
 * @example
 * getSublevelsInTier('BEGINNER') // => ['D-', 'D', 'D+']
 * getSublevelsInTier('INTERMEDIATE') // => ['C-', 'C', 'C+', 'B-', 'B', 'B+']
 */
export function getSublevelsInTier(tier: HexagonTier): SubLevel[] {
  return SUBLEVEL_ORDER.filter(sl => SUBLEVEL_XP_MAP[sl].tier === tier);
}

/**
 * Converts XP to tier
 *
 * @example
 * xpToTier(50000) // => 'BEGINNER'
 * xpToTier(200000) // => 'INTERMEDIATE'
 */
export function xpToTier(xp: number): HexagonTier {
  const subLevel = xpToSubLevel(xp);
  return sublevelToTier(subLevel);
}

// ============================================================================
// PROGRESSION FUNCTIONS
// ============================================================================

/**
 * Calculates progress within the current sublevel (0-100%)
 *
 * @example
 * getSubLevelProgress(140000, 'C') // => 37.5% (12k into 32k range)
 * getSubLevelProgress(160000, 'C') // => 100% (at max)
 */
export function getSubLevelProgress(currentXP: number, subLevel: SubLevel): number {
  const range = SUBLEVEL_XP_MAP[subLevel];

  // S+ is infinite, always show as 100% once achieved
  if (range.maxXP === Infinity) return 100;

  const progress = ((currentXP - range.minXP) / (range.maxXP - range.minXP)) * 100;
  return Math.max(0, Math.min(100, progress));
}

/**
 * Gets the next sublevel in the progression order
 * Returns null if already at max level (S+)
 *
 * @example
 * getNextSubLevel('D') // => 'D+'
 * getNextSubLevel('C+') // => 'B-'
 * getNextSubLevel('S+') // => null
 */
export function getNextSubLevel(current: SubLevel): SubLevel | null {
  const currentIndex = SUBLEVEL_ORDER.indexOf(current);
  if (currentIndex === -1 || currentIndex === SUBLEVEL_ORDER.length - 1) {
    return null; // Already at S+
  }
  return SUBLEVEL_ORDER[currentIndex + 1];
}

/**
 * Gets the previous sublevel in the progression order
 * Returns null if already at min level (D-)
 *
 * @example
 * getPreviousSubLevel('D') // => 'D-'
 * getPreviousSubLevel('D-') // => null
 */
export function getPreviousSubLevel(current: SubLevel): SubLevel | null {
  const currentIndex = SUBLEVEL_ORDER.indexOf(current);
  if (currentIndex <= 0) {
    return null; // Already at D-
  }
  return SUBLEVEL_ORDER[currentIndex - 1];
}

/**
 * Calculates XP needed to reach the next sublevel
 *
 * @example
 * getXPToNextSubLevel(140000, 'C') // => 20000 (need 160k to reach C+)
 * getXPToNextSubLevel(450000, 'S+') // => 0 (already at max)
 */
export function getXPToNextSubLevel(currentXP: number, currentSubLevel: SubLevel): number {
  const nextLevel = getNextSubLevel(currentSubLevel);
  if (!nextLevel) return 0; // Already at max

  const nextRange = SUBLEVEL_XP_MAP[nextLevel];
  return Math.max(0, nextRange.minXP - currentXP);
}

/**
 * Calculates progress within the entire tier (0-100%)
 *
 * @example
 * // BEGINNER tier is 0-96k, user has 50k XP at level D+
 * getTierProgress(50000, 'BEGINNER') // => ~52%
 */
export function getTierProgress(currentXP: number, tier: HexagonTier): number {
  const range = TIER_XP_RANGES[tier];

  // ELITE tier is infinite
  if (range.max === Infinity) {
    // Show progress based on how far into ELITE they are
    // Assume 500k+ is "complete"
    const progress = Math.min(100, ((currentXP - range.min) / 112000) * 100);
    return Math.max(0, progress);
  }

  const progress = ((currentXP - range.min) / (range.max - range.min)) * 100;
  return Math.max(0, Math.min(100, progress));
}

// ============================================================================
// COMPARISON FUNCTIONS
// ============================================================================

/**
 * Compares two sublevels
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 *
 * @example
 * compareSubLevels('D', 'C') // => -1 (D is lower than C)
 * compareSubLevels('A+', 'A-') // => 1 (A+ is higher than A-)
 */
export function compareSubLevels(a: SubLevel, b: SubLevel): number {
  const indexA = SUBLEVEL_ORDER.indexOf(a);
  const indexB = SUBLEVEL_ORDER.indexOf(b);

  if (indexA < indexB) return -1;
  if (indexA > indexB) return 1;
  return 0;
}

/**
 * Checks if a sublevel is within a specific tier
 *
 * @example
 * isSubLevelInTier('C+', 'INTERMEDIATE') // => true
 * isSubLevelInTier('A-', 'BEGINNER') // => false
 */
export function isSubLevelInTier(subLevel: SubLevel, tier: HexagonTier): boolean {
  return SUBLEVEL_XP_MAP[subLevel].tier === tier;
}

/**
 * Gets the number of levels between two sublevels
 *
 * @example
 * getLevelsDifference('D-', 'D+') // => 2
 * getLevelsDifference('C', 'B+') // => 4
 */
export function getLevelsDifference(from: SubLevel, to: SubLevel): number {
  const indexFrom = SUBLEVEL_ORDER.indexOf(from);
  const indexTo = SUBLEVEL_ORDER.indexOf(to);
  return Math.abs(indexTo - indexFrom);
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Gets a human-readable description of a sublevel
 */
export function getSubLevelDescription(subLevel: SubLevel): string {
  const descriptions: Record<SubLevel, string> = {
    'D-': 'Starting your calisthenics journey',
    'D': 'Building foundational strength',
    'D+': 'Progressing through the basics',

    'C-': 'Developing solid fundamentals',
    'C': 'Intermediate strength building',
    'C+': 'Strong fundamental base',

    'B-': 'Advanced strength development',
    'B': 'Well-rounded athlete',
    'B+': 'Approaching advanced skills',

    'A-': 'Advanced calisthenics athlete',
    'A': 'Mastering complex movements',
    'A+': 'Elite level performance',

    'S-': 'Expert level mastery',
    'S': 'World-class performance',
    'S+': 'Peak human performance',
  };

  return descriptions[subLevel];
}

/**
 * Gets a color scheme for a tier
 */
export function getTierColor(tier: HexagonTier): {
  bg: string;
  border: string;
  text: string;
} {
  const colors: Record<HexagonTier, { bg: string; border: string; text: string }> = {
    BEGINNER: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-700',
    },
    INTERMEDIATE: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-700',
    },
    ADVANCED: {
      bg: 'bg-purple-50',
      border: 'border-purple-500',
      text: 'text-purple-700',
    },
    ELITE: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-700',
    },
  };

  return colors[tier];
}

/**
 * Formats XP for display
 *
 * @example
 * formatXP(128000) // => '128,000 XP'
 * formatXP(450000) // => '450,000 XP'
 */
export function formatXP(xp: number): string {
  return `${xp.toLocaleString()} XP`;
}
