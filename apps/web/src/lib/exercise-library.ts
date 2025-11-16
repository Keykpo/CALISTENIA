/**
 * ============================================================================
 * EXERCISE LIBRARY - Detailed Exercise Database Access
 * ============================================================================
 *
 * Provides access to detailed exercise information from RUTINAS_POR_NIVEL.
 *
 * Features:
 * - Detailed form instructions
 * - Common mistakes and coach tips
 * - Weekly progressions
 * - Exercise variants
 *
 * Based on: RUTINAS_POR_NIVEL exercise descriptions
 * ============================================================================
 */

import exerciseDatabase from '@/data/exercise-database.json';

// ==========================================
// TYPES
// ==========================================

export interface ExerciseForm {
  setup: string[];
  execution: string[];
  breathing: string[];
}

export interface ExerciseProgression {
  easier: string;
  harder: string;
  byWeek: {
    week: string;
    adjustment: string;
    targetReps: string;
    notes: string;
  }[];
}

export interface ExerciseVariant {
  name: string;
  difficulty: 'EASIER' | 'SAME' | 'HARDER';
  equipment: string[];
  when: string;
}

export interface DetailedExercise {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  difficulty: string;
  targetMuscles: string[];
  equipment: string[];
  form: ExerciseForm;
  commonMistakes: string[];
  coachTips: string[];
  progression: ExerciseProgression;
  variants: ExerciseVariant[];
}

export interface ExerciseDatabase {
  version: string;
  lastUpdated: string;
  exercises: DetailedExercise[];
}

// ==========================================
// DATABASE ACCESS
// ==========================================

/**
 * Get the full exercise database
 */
export function getExerciseDatabase(): ExerciseDatabase {
  return exerciseDatabase as ExerciseDatabase;
}

/**
 * Get exercise by ID
 */
export function getExerciseById(id: string): DetailedExercise | null {
  const db = getExerciseDatabase();
  return db.exercises.find((ex) => ex.id === id) || null;
}

/**
 * Get exercises by category
 */
export function getExercisesByCategory(category: string): DetailedExercise[] {
  const db = getExerciseDatabase();
  return db.exercises.filter((ex) => ex.category === category);
}

/**
 * Get exercises by difficulty
 */
export function getExercisesByDifficulty(difficulty: string): DetailedExercise[] {
  const db = getExerciseDatabase();
  return db.exercises.filter((ex) => ex.difficulty === difficulty);
}

/**
 * Get exercises by equipment available
 */
export function getExercisesByEquipment(availableEquipment: string[]): DetailedExercise[] {
  const db = getExerciseDatabase();
  return db.exercises.filter((ex) => {
    // Check if user has all required equipment for this exercise
    return ex.equipment.every((reqEquip) =>
      availableEquipment.some((avail) =>
        reqEquip.toLowerCase().includes(avail.toLowerCase()) ||
        avail.toLowerCase().includes(reqEquip.toLowerCase())
      )
    );
  });
}

/**
 * Search exercises by name or description
 */
export function searchExercises(query: string): DetailedExercise[] {
  const db = getExerciseDatabase();
  const lowerQuery = query.toLowerCase();

  return db.exercises.filter((ex) => {
    return (
      ex.name.toLowerCase().includes(lowerQuery) ||
      ex.category.toLowerCase().includes(lowerQuery) ||
      ex.subCategory.toLowerCase().includes(lowerQuery) ||
      ex.targetMuscles.some((muscle) => muscle.toLowerCase().includes(lowerQuery))
    );
  });
}

// ==========================================
// EXERCISE DETAILS
// ==========================================

/**
 * Get form instructions for an exercise
 */
export function getExerciseForm(exerciseId: string): ExerciseForm | null {
  const exercise = getExerciseById(exerciseId);
  return exercise?.form || null;
}

/**
 * Get common mistakes for an exercise
 */
export function getCommonMistakes(exerciseId: string): string[] {
  const exercise = getExerciseById(exerciseId);
  return exercise?.commonMistakes || [];
}

/**
 * Get coach tips for an exercise
 */
export function getCoachTips(exerciseId: string): string[] {
  const exercise = getExerciseById(exerciseId);
  return exercise?.coachTips || [];
}

/**
 * Get progression path for an exercise
 */
export function getExerciseProgression(exerciseId: string): ExerciseProgression | null {
  const exercise = getExerciseById(exerciseId);
  return exercise?.progression || null;
}

/**
 * Get variants for an exercise
 */
export function getExerciseVariants(exerciseId: string): ExerciseVariant[] {
  const exercise = getExerciseById(exerciseId);
  return exercise?.variants || [];
}

// ==========================================
// PROGRESSION HELPERS
// ==========================================

/**
 * Get easier version of an exercise
 */
export function getEasierVersion(exerciseId: string): DetailedExercise | null {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return null;

  const easierName = exercise.progression.easier;
  return searchExercises(easierName)[0] || null;
}

/**
 * Get harder version of an exercise
 */
export function getHarderVersion(exerciseId: string): DetailedExercise | null {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return null;

  const harderName = exercise.progression.harder;
  return searchExercises(harderName)[0] || null;
}

/**
 * Get progression for specific week
 */
export function getWeeklyProgression(
  exerciseId: string,
  weekNumber: number
): {
  week: string;
  adjustment: string;
  targetReps: string;
  notes: string;
} | null {
  const progression = getExerciseProgression(exerciseId);
  if (!progression) return null;

  // Find matching week range
  for (const weekProg of progression.byWeek) {
    const [start, end] = weekProg.week.split('-').map((w) => {
      if (w.includes('+')) return parseInt(w);
      return parseInt(w);
    });

    if (end === undefined) {
      // "5+" format
      if (weekNumber >= start) return weekProg;
    } else {
      // "1-4" format
      if (weekNumber >= start && weekNumber <= end) return weekProg;
    }
  }

  // Default to last progression if nothing matches
  return progression.byWeek[progression.byWeek.length - 1] || null;
}

// ==========================================
// FILTERING & SORTING
// ==========================================

/**
 * Get exercises filtered by multiple criteria
 */
export function filterExercises(filters: {
  category?: string;
  difficulty?: string;
  equipment?: string[];
  targetMuscle?: string;
}): DetailedExercise[] {
  let exercises = getExerciseDatabase().exercises;

  if (filters.category) {
    exercises = exercises.filter((ex) => ex.category === filters.category);
  }

  if (filters.difficulty) {
    exercises = exercises.filter((ex) => ex.difficulty === filters.difficulty);
  }

  if (filters.equipment && filters.equipment.length > 0) {
    exercises = exercises.filter((ex) =>
      ex.equipment.every((reqEquip) =>
        filters.equipment!.some((avail) =>
          reqEquip.toLowerCase().includes(avail.toLowerCase()) ||
          avail.toLowerCase().includes(reqEquip.toLowerCase())
        )
      )
    );
  }

  if (filters.targetMuscle) {
    exercises = exercises.filter((ex) =>
      ex.targetMuscles.some((muscle) =>
        muscle.toLowerCase().includes(filters.targetMuscle!.toLowerCase())
      )
    );
  }

  return exercises;
}

/**
 * Sort exercises by difficulty
 */
export function sortByDifficulty(exercises: DetailedExercise[]): DetailedExercise[] {
  const difficultyOrder = ['BEGINNER', 'NOVICE', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

  return [...exercises].sort((a, b) => {
    const aIndex = difficultyOrder.indexOf(a.difficulty);
    const bIndex = difficultyOrder.indexOf(b.difficulty);
    return aIndex - bIndex;
  });
}

// ==========================================
// DISPLAY HELPERS
// ==========================================

/**
 * Get exercise summary for display
 */
export function getExerciseSummary(exerciseId: string): string {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return '';

  const muscles = exercise.targetMuscles.join(', ');
  const equipment = exercise.equipment.join(' or ');

  return `${exercise.name} (${exercise.difficulty}) - Targets: ${muscles}. Equipment: ${equipment}`;
}

/**
 * Get formatted form instructions
 */
export function getFormattedFormInstructions(exerciseId: string): string {
  const form = getExerciseForm(exerciseId);
  if (!form) return '';

  let formatted = '📋 SETUP:\n';
  form.setup.forEach((step, idx) => {
    formatted += `  ${idx + 1}. ${step}\n`;
  });

  formatted += '\n🏋️ EXECUTION:\n';
  form.execution.forEach((step, idx) => {
    formatted += `  ${idx + 1}. ${step}\n`;
  });

  formatted += '\n💨 BREATHING:\n';
  form.breathing.forEach((step, idx) => {
    formatted += `  ${idx + 1}. ${step}\n`;
  });

  return formatted;
}

/**
 * Get formatted coach tips
 */
export function getFormattedCoachTips(exerciseId: string): string {
  const tips = getCoachTips(exerciseId);
  if (!tips.length) return '';

  let formatted = '💡 COACH TIPS:\n';
  tips.forEach((tip, idx) => {
    formatted += `  ${idx + 1}. ${tip}\n`;
  });

  return formatted;
}

/**
 * Get formatted common mistakes
 */
export function getFormattedCommonMistakes(exerciseId: string): string {
  const mistakes = getCommonMistakes(exerciseId);
  if (!mistakes.length) return '';

  let formatted = '⚠️ COMMON MISTAKES:\n';
  mistakes.forEach((mistake, idx) => {
    formatted += `  ${idx + 1}. ${mistake}\n`;
  });

  return formatted;
}

// ==========================================
// STATISTICS
// ==========================================

/**
 * Get database statistics
 */
export function getDatabaseStats(): {
  totalExercises: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
  averageVariantsPerExercise: number;
} {
  const db = getExerciseDatabase();

  const byCategory: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  let totalVariants = 0;

  db.exercises.forEach((ex) => {
    // Count by category
    byCategory[ex.category] = (byCategory[ex.category] || 0) + 1;

    // Count by difficulty
    byDifficulty[ex.difficulty] = (byDifficulty[ex.difficulty] || 0) + 1;

    // Count variants
    totalVariants += ex.variants.length;
  });

  return {
    totalExercises: db.exercises.length,
    byCategory,
    byDifficulty,
    averageVariantsPerExercise: totalVariants / db.exercises.length,
  };
}

/**
 * Check if exercise database is loaded
 */
export function isDatabaseLoaded(): boolean {
  try {
    const db = getExerciseDatabase();
    return db.exercises.length > 0;
  } catch {
    return false;
  }
}
