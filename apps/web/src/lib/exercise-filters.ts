/**
 * Exercise Filtering Utilities for D-S System
 *
 * Provides functions to filter exercises by:
 * - D-S Rank (D, C, B, A, S)
 * - Difficulty Level (BEGINNER, INTERMEDIATE, ADVANCED, ELITE)
 * - Equipment availability
 * - Category
 * - User's current level
 */

import { Rank, Difficulty, ExerciseCategory } from '@prisma/client';

/**
 * Exercise type for filtering
 */
export interface FilterableExercise {
  id: string;
  name: string;
  rank: Rank | null;
  difficulty: Difficulty;
  category: ExerciseCategory;
  equipment: string; // JSON string
  description?: string | null;
  muscleGroups?: string; // JSON string
}

/**
 * Rank progression order for filtering
 */
const RANK_ORDER: Rank[] = ['D', 'C', 'B', 'A', 'S'];

/**
 * Get numeric value for rank comparison
 */
function getRankValue(rank: Rank | null): number {
  if (!rank) return 0;
  return RANK_ORDER.indexOf(rank);
}

/**
 * Filter exercises by specific D-S rank
 */
export function filterByRank(
  exercises: FilterableExercise[],
  rank: Rank
): FilterableExercise[] {
  return exercises.filter((ex) => ex.rank === rank);
}

/**
 * Filter exercises by multiple ranks
 */
export function filterByRanks(
  exercises: FilterableExercise[],
  ranks: Rank[]
): FilterableExercise[] {
  return exercises.filter((ex) => ex.rank && ranks.includes(ex.rank));
}

/**
 * Filter exercises up to a maximum rank (inclusive)
 * Example: maxRank='B' returns D, C, and B exercises
 */
export function filterByMaxRank(
  exercises: FilterableExercise[],
  maxRank: Rank
): FilterableExercise[] {
  const maxValue = getRankValue(maxRank);
  return exercises.filter((ex) => {
    const value = getRankValue(ex.rank);
    return value <= maxValue;
  });
}

/**
 * Filter exercises by minimum rank
 * Example: minRank='B' returns B, A, and S exercises
 */
export function filterByMinRank(
  exercises: FilterableExercise[],
  minRank: Rank
): FilterableExercise[] {
  const minValue = getRankValue(minRank);
  return exercises.filter((ex) => {
    const value = getRankValue(ex.rank);
    return value >= minValue;
  });
}

/**
 * Filter exercises by rank range (inclusive)
 */
export function filterByRankRange(
  exercises: FilterableExercise[],
  minRank: Rank,
  maxRank: Rank
): FilterableExercise[] {
  const minValue = getRankValue(minRank);
  const maxValue = getRankValue(maxRank);
  return exercises.filter((ex) => {
    const value = getRankValue(ex.rank);
    return value >= minValue && value <= maxValue;
  });
}

/**
 * Filter exercises by difficulty level
 */
export function filterByDifficulty(
  exercises: FilterableExercise[],
  difficulty: Difficulty
): FilterableExercise[] {
  return exercises.filter((ex) => ex.difficulty === difficulty);
}

/**
 * Filter exercises by category
 */
export function filterByCategory(
  exercises: FilterableExercise[],
  category: ExerciseCategory
): FilterableExercise[] {
  return exercises.filter((ex) => ex.category === category);
}

/**
 * Filter exercises by available equipment
 * @param availableEquipment Array of equipment strings (e.g., ['PULL_UP_BAR', 'RINGS'])
 */
export function filterByEquipment(
  exercises: FilterableExercise[],
  availableEquipment: string[]
): FilterableExercise[] {
  return exercises.filter((ex) => {
    try {
      const required = JSON.parse(ex.equipment) as string[];
      // Exercise is doable if all required equipment is available, or if it needs no equipment
      return required.every(
        (eq) => eq === 'NONE' || availableEquipment.includes(eq)
      );
    } catch {
      return false;
    }
  });
}

/**
 * Get recommended exercises for user's current level
 * Returns exercises at user's level and one level below/above
 */
export function getRecommendedExercises(
  exercises: FilterableExercise[],
  userRank: Rank
): FilterableExercise[] {
  const userValue = getRankValue(userRank);

  return exercises.filter((ex) => {
    const value = getRankValue(ex.rank);
    // Include exercises from one level below to one level above
    return Math.abs(value - userValue) <= 1;
  });
}

/**
 * Get progression path exercises for a user
 * Returns exercises at user's level and next level up
 */
export function getProgressionExercises(
  exercises: FilterableExercise[],
  userRank: Rank
): FilterableExercise[] {
  const userValue = getRankValue(userRank);
  const nextValue = Math.min(userValue + 1, RANK_ORDER.length - 1);

  return exercises.filter((ex) => {
    const value = getRankValue(ex.rank);
    return value === userValue || value === nextValue;
  });
}

/**
 * Get foundational exercises (D and C ranks)
 */
export function getFoundationalExercises(
  exercises: FilterableExercise[]
): FilterableExercise[] {
  return filterByRanks(exercises, ['D', 'C']);
}

/**
 * Get intermediate exercises (B rank)
 */
export function getIntermediateExercises(
  exercises: FilterableExercise[]
): FilterableExercise[] {
  return filterByRank(exercises, 'B');
}

/**
 * Get advanced exercises (A and S ranks)
 */
export function getAdvancedExercises(
  exercises: FilterableExercise[]
): FilterableExercise[] {
  return filterByRanks(exercises, ['A', 'S']);
}

/**
 * Search exercises by name
 */
export function searchExercises(
  exercises: FilterableExercise[],
  query: string
): FilterableExercise[] {
  const lowercaseQuery = query.toLowerCase();
  return exercises.filter((ex) =>
    ex.name.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Sort exercises by rank (ascending: D to S)
 */
export function sortByRankAsc(
  exercises: FilterableExercise[]
): FilterableExercise[] {
  return [...exercises].sort(
    (a, b) => getRankValue(a.rank) - getRankValue(b.rank)
  );
}

/**
 * Sort exercises by rank (descending: S to D)
 */
export function sortByRankDesc(
  exercises: FilterableExercise[]
): FilterableExercise[] {
  return [...exercises].sort(
    (a, b) => getRankValue(b.rank) - getRankValue(a.rank)
  );
}

/**
 * Comprehensive filter options
 */
export interface ExerciseFilterOptions {
  rank?: Rank;
  ranks?: Rank[];
  minRank?: Rank;
  maxRank?: Rank;
  difficulty?: Difficulty;
  category?: ExerciseCategory;
  equipment?: string[];
  search?: string;
}

/**
 * Apply multiple filters at once
 */
export function filterExercises(
  exercises: FilterableExercise[],
  options: ExerciseFilterOptions
): FilterableExercise[] {
  let filtered = exercises;

  // Filter by specific rank
  if (options.rank) {
    filtered = filterByRank(filtered, options.rank);
  }

  // Filter by multiple ranks
  if (options.ranks && options.ranks.length > 0) {
    filtered = filterByRanks(filtered, options.ranks);
  }

  // Filter by rank range
  if (options.minRank && options.maxRank) {
    filtered = filterByRankRange(filtered, options.minRank, options.maxRank);
  } else if (options.minRank) {
    filtered = filterByMinRank(filtered, options.minRank);
  } else if (options.maxRank) {
    filtered = filterByMaxRank(filtered, options.maxRank);
  }

  // Filter by difficulty
  if (options.difficulty) {
    filtered = filterByDifficulty(filtered, options.difficulty);
  }

  // Filter by category
  if (options.category) {
    filtered = filterByCategory(filtered, options.category);
  }

  // Filter by equipment
  if (options.equipment && options.equipment.length > 0) {
    filtered = filterByEquipment(filtered, options.equipment);
  }

  // Search by name
  if (options.search) {
    filtered = searchExercises(filtered, options.search);
  }

  return filtered;
}

/**
 * Group exercises by rank
 */
export function groupByRank(
  exercises: FilterableExercise[]
): Record<string, FilterableExercise[]> {
  const grouped: Record<string, FilterableExercise[]> = {
    D: [],
    C: [],
    B: [],
    A: [],
    S: [],
  };

  exercises.forEach((ex) => {
    if (ex.rank) {
      grouped[ex.rank].push(ex);
    }
  });

  return grouped;
}

/**
 * Group exercises by difficulty
 */
export function groupByDifficulty(
  exercises: FilterableExercise[]
): Record<Difficulty, FilterableExercise[]> {
  const grouped: Record<Difficulty, FilterableExercise[]> = {
    BEGINNER: [],
    INTERMEDIATE: [],
    ADVANCED: [],
    ELITE: [],
  };

  exercises.forEach((ex) => {
    grouped[ex.difficulty].push(ex);
  });

  return grouped;
}

/**
 * Group exercises by category
 */
export function groupByCategory(
  exercises: FilterableExercise[]
): Record<string, FilterableExercise[]> {
  const grouped: Record<string, FilterableExercise[]> = {};

  exercises.forEach((ex) => {
    if (!grouped[ex.category]) {
      grouped[ex.category] = [];
    }
    grouped[ex.category].push(ex);
  });

  return grouped;
}

/**
 * Get statistics about exercise distribution
 */
export interface ExerciseStats {
  total: number;
  byRank: Record<string, number>;
  byDifficulty: Record<string, number>;
  byCategory: Record<string, number>;
}

export function getExerciseStats(
  exercises: FilterableExercise[]
): ExerciseStats {
  const stats: ExerciseStats = {
    total: exercises.length,
    byRank: { D: 0, C: 0, B: 0, A: 0, S: 0 },
    byDifficulty: {
      BEGINNER: 0,
      INTERMEDIATE: 0,
      ADVANCED: 0,
      ELITE: 0,
    },
    byCategory: {},
  };

  exercises.forEach((ex) => {
    // Count by rank
    if (ex.rank) {
      stats.byRank[ex.rank]++;
    }

    // Count by difficulty
    stats.byDifficulty[ex.difficulty]++;

    // Count by category
    const cat = ex.category;
    stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
  });

  return stats;
}
