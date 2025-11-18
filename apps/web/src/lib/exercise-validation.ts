/**
 * EXERCISE VALIDATION UTILITY
 *
 * Provides validation and safety checks for exercises used in routines.
 * Ensures all exercises have required fields and meet quality standards.
 */

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: string;
  difficulty: string;
  unit: string;
  muscleGroups?: string[];
  equipment: string[];
  expReward?: number;
  coinsReward?: number;
  instructions?: string[];
  gifUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExerciseStats {
  total: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
  missingFields: string[];
  validationIssues: number;
}

/**
 * Validate a single exercise
 */
export function validateExercise(exercise: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!exercise.id) errors.push('Missing required field: id');
  if (!exercise.name) errors.push('Missing required field: name');
  if (!exercise.category) errors.push('Missing required field: category');
  if (!exercise.difficulty) errors.push('Missing required field: difficulty');
  if (!exercise.unit) errors.push('Missing required field: unit');
  if (!exercise.equipment || !Array.isArray(exercise.equipment)) {
    errors.push('Missing or invalid field: equipment (must be array)');
  }

  // Recommended fields (warnings)
  if (!exercise.description) warnings.push('Missing recommended field: description');
  if (!exercise.expReward) warnings.push('Missing recommended field: expReward');
  if (!exercise.coinsReward) warnings.push('Missing recommended field: coinsReward');
  if (!exercise.instructions || !Array.isArray(exercise.instructions) || exercise.instructions.length === 0) {
    warnings.push('Missing or empty instructions');
  }
  if (!exercise.gifUrl && !exercise.thumbnailUrl && !exercise.videoUrl) {
    warnings.push('No visual media (gif, thumbnail, or video)');
  }

  // Validate category values
  const validCategories = ['PUSH', 'PULL', 'LEGS', 'CORE', 'WARM_UP', 'COOL_DOWN', 'FLEXIBILITY', 'CARDIO', 'BALANCE', 'SKILL_STATIC'];
  if (exercise.category && !validCategories.includes(exercise.category)) {
    warnings.push(`Unusual category: ${exercise.category}. Expected one of: ${validCategories.join(', ')}`);
  }

  // Validate difficulty values
  const validDifficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'];
  if (exercise.difficulty && !validDifficulties.includes(exercise.difficulty)) {
    errors.push(`Invalid difficulty: ${exercise.difficulty}. Must be one of: ${validDifficulties.join(', ')}`);
  }

  // Validate unit values
  const validUnits = ['reps', 'seconds', 'time', 'distance'];
  if (exercise.unit && !validUnits.includes(exercise.unit)) {
    errors.push(`Invalid unit: ${exercise.unit}. Must be one of: ${validUnits.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate entire exercise database
 */
export function validateExerciseDatabase(exercises: any[]): {
  isValid: boolean;
  stats: ExerciseStats;
  invalidExercises: Array<{ exercise: any; validation: ValidationResult }>;
} {
  const stats: ExerciseStats = {
    total: exercises.length,
    byCategory: {},
    byDifficulty: {},
    missingFields: [],
    validationIssues: 0,
  };

  const invalidExercises: Array<{ exercise: any; validation: ValidationResult }> = [];
  const missingFieldsSet = new Set<string>();

  exercises.forEach(exercise => {
    // Validate
    const validation = validateExercise(exercise);

    if (!validation.valid) {
      invalidExercises.push({ exercise, validation });
      stats.validationIssues++;
    }

    // Track missing fields
    validation.errors.forEach(error => {
      if (error.startsWith('Missing required field:')) {
        const field = error.split(':')[1].trim();
        missingFieldsSet.add(field);
      }
    });

    // Count by category
    if (exercise.category) {
      stats.byCategory[exercise.category] = (stats.byCategory[exercise.category] || 0) + 1;
    }

    // Count by difficulty
    if (exercise.difficulty) {
      stats.byDifficulty[exercise.difficulty] = (stats.byDifficulty[exercise.difficulty] || 0) + 1;
    }
  });

  stats.missingFields = Array.from(missingFieldsSet);

  return {
    isValid: invalidExercises.length === 0,
    stats,
    invalidExercises,
  };
}

/**
 * Find exercises by category with validation
 */
export function findExercisesByCategory(
  exercises: Exercise[],
  category: string,
  options?: {
    difficulty?: string;
    equipment?: string[];
    limit?: number;
    validateFirst?: boolean;
  }
): Exercise[] {
  const { difficulty, equipment, limit, validateFirst = true } = options || {};

  // Filter exercises
  let filtered = exercises.filter(ex => {
    // Category match (case-insensitive)
    if (ex.category.toUpperCase() !== category.toUpperCase()) return false;

    // Difficulty match (if specified)
    if (difficulty && ex.difficulty !== difficulty) return false;

    // Equipment match (if specified)
    if (equipment && equipment.length > 0) {
      const hasRequiredEquipment = ex.equipment.some(eq =>
        equipment.includes(eq) || eq === 'NONE'
      );
      if (!hasRequiredEquipment) return false;
    }

    // Validate if requested
    if (validateFirst) {
      const validation = validateExercise(ex);
      if (!validation.valid) {
        console.warn(`[EXERCISE_VALIDATION] Invalid exercise skipped: ${ex.name}`, validation.errors);
        return false;
      }
    }

    return true;
  });

  // Apply limit
  if (limit && limit > 0) {
    filtered = filtered.slice(0, limit);
  }

  return filtered;
}

/**
 * Find exercise by ID or name
 */
export function findExercise(
  exercises: Exercise[],
  idOrName: string,
  options?: {
    fuzzyMatch?: boolean;
    validateFirst?: boolean;
  }
): Exercise | null {
  const { fuzzyMatch = false, validateFirst = true } = options || {};

  // Try exact ID match first
  let exercise = exercises.find(ex => ex.id === idOrName);

  // Try exact name match
  if (!exercise) {
    exercise = exercises.find(ex => ex.name.toLowerCase() === idOrName.toLowerCase());
  }

  // Try fuzzy match if enabled
  if (!exercise && fuzzyMatch) {
    exercise = exercises.find(ex =>
      ex.name.toLowerCase().includes(idOrName.toLowerCase()) ||
      ex.id.toLowerCase().includes(idOrName.toLowerCase())
    );
  }

  // Validate if requested
  if (exercise && validateFirst) {
    const validation = validateExercise(exercise);
    if (!validation.valid) {
      console.warn(`[EXERCISE_VALIDATION] Found exercise but invalid: ${exercise.name}`, validation.errors);
      return null;
    }
  }

  return exercise || null;
}

/**
 * Get exercise statistics for debugging/monitoring
 */
export function getExerciseStats(exercises: Exercise[]): ExerciseStats {
  const validation = validateExerciseDatabase(exercises);
  return validation.stats;
}

/**
 * Create a validation report
 */
export function createValidationReport(exercises: Exercise[]): string {
  const validation = validateExerciseDatabase(exercises);
  const { stats, invalidExercises } = validation;

  let report = '===== EXERCISE DATABASE VALIDATION REPORT =====\n\n';
  report += `Total Exercises: ${stats.total}\n`;
  report += `Valid Exercises: ${stats.total - stats.validationIssues}\n`;
  report += `Invalid Exercises: ${stats.validationIssues}\n\n`;

  report += 'Categories:\n';
  Object.entries(stats.byCategory)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, count]) => {
      report += `  ${category}: ${count}\n`;
    });

  report += '\nDifficulties:\n';
  Object.entries(stats.byDifficulty)
    .sort(([, a], [, b]) => b - a)
    .forEach(([difficulty, count]) => {
      report += `  ${difficulty}: ${count}\n`;
    });

  if (stats.missingFields.length > 0) {
    report += '\nMissing Required Fields:\n';
    stats.missingFields.forEach(field => {
      report += `  - ${field}\n`;
    });
  }

  if (invalidExercises.length > 0) {
    report += '\nInvalid Exercises:\n';
    invalidExercises.slice(0, 10).forEach(({ exercise, validation }) => {
      report += `  - ${exercise.name || exercise.id || 'Unknown'}:\n`;
      validation.errors.forEach(error => {
        report += `      ERROR: ${error}\n`;
      });
    });

    if (invalidExercises.length > 10) {
      report += `  ... and ${invalidExercises.length - 10} more\n`;
    }
  }

  report += '\n==============================================\n';

  return report;
}
