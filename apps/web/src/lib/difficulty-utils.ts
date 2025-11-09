/**
 * Difficulty Mapping Utilities
 * 
 * Helper functions to convert between different difficulty representations
 * in the unified 4-tier system: BEGINNER, INTERMEDIATE, ADVANCED, ELITE
 */

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
export type Rank = 'D' | 'C' | 'B' | 'A' | 'S';

/**
 * Map Rank (D, C, B, A, S) to unified Difficulty
 */
export function rankToDifficulty(rank: Rank): Difficulty {
  const mapping: Record<Rank, Difficulty> = {
    D: 'BEGINNER',
    C: 'INTERMEDIATE',
    B: 'INTERMEDIATE',
    A: 'ADVANCED',
    S: 'ELITE',
  };
  return mapping[rank];
}

/**
 * Map Difficulty to suggested Rank (middle of range)
 */
export function difficultyToRank(difficulty: Difficulty): Rank {
  const mapping: Record<Difficulty, Rank> = {
    BEGINNER: 'D',
    INTERMEDIATE: 'B', // Middle of C-B range
    ADVANCED: 'A',
    ELITE: 'S',
  };
  return mapping[difficulty];
}

/**
 * Get numeric difficulty score (0-10 scale)
 * Useful for calculations and comparisons
 */
export function difficultyToScore(difficulty: Difficulty): number {
  const scores: Record<Difficulty, number> = {
    BEGINNER: 2,
    INTERMEDIATE: 5,
    ADVANCED: 8,
    ELITE: 10,
  };
  return scores[difficulty];
}

/**
 * Convert score (0-10) to Difficulty level
 */
export function scoreToDifficulty(score: number): Difficulty {
  if (score <= 3) return 'BEGINNER';
  if (score <= 6) return 'INTERMEDIATE';
  if (score <= 9) return 'ADVANCED';
  return 'ELITE';
}

/**
 * Get difficulty color for UI
 */
export function getDifficultyColor(difficulty: Difficulty): string {
  const colors: Record<Difficulty, string> = {
    BEGINNER: 'green',
    INTERMEDIATE: 'blue',
    ADVANCED: 'purple',
    ELITE: 'red',
  };
  return colors[difficulty];
}

/**
 * Get difficulty badge classes (Tailwind)
 */
export function getDifficultyClasses(difficulty: Difficulty): string {
  const classes: Record<Difficulty, string> = {
    BEGINNER: 'bg-green-100 text-green-800 border-green-300',
    INTERMEDIATE: 'bg-blue-100 text-blue-800 border-blue-300',
    ADVANCED: 'bg-purple-100 text-purple-800 border-purple-300',
    ELITE: 'bg-red-100 text-red-800 border-red-300',
  };
  return classes[difficulty];
}

/**
 * Legacy: Map old EXPERT to new ELITE
 * Use this to migrate old data
 */
export function migrateLegacyDifficulty(oldDifficulty: string): Difficulty {
  if (oldDifficulty === 'EXPERT') return 'ELITE';
  return oldDifficulty as Difficulty;
}

/**
 * Get all difficulty levels in order
 */
export const DIFFICULTY_LEVELS: Difficulty[] = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'ELITE',
];

/**
 * Get difficulty description
 */
export function getDifficultyDescription(difficulty: Difficulty): string {
  const descriptions: Record<Difficulty, string> = {
    BEGINNER: 'Fundamentals & basics - Building foundation',
    INTERMEDIATE: 'Building competency - Developing skills',
    ADVANCED: 'Proficient & skilled - Mastering techniques',
    ELITE: 'Mastery & expert level - Peak performance',
  };
  return descriptions[difficulty];
}
