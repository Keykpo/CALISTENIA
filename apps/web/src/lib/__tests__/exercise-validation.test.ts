/**
 * Unit tests for exercise validation
 */

import {
  validateExercise,
  validateExerciseDatabase,
  findExercisesByCategory,
  findExercise,
} from '../exercise-validation';

describe('validateExercise', () => {
  test('validates a complete valid exercise', () => {
    const exercise = {
      id: 'test-1',
      name: 'Test Exercise',
      description: 'A test exercise',
      category: 'PUSH',
      difficulty: 'INTERMEDIATE',
      unit: 'reps',
      muscleGroups: ['chest'],
      equipment: ['NONE'],
      expReward: 50,
      coinsReward: 5,
      instructions: ['Step 1', 'Step 2'],
      gifUrl: 'test.gif',
    };

    const result = validateExercise(exercise);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('catches missing required fields', () => {
    const exercise = {
      name: 'Test Exercise',
      // Missing: id, category, difficulty, unit, equipment
    };

    const result = validateExercise(exercise);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors).toContain('Missing required field: id');
    expect(result.errors).toContain('Missing required field: category');
  });

  test('warns about missing recommended fields', () => {
    const exercise = {
      id: 'test-1',
      name: 'Test Exercise',
      category: 'PUSH',
      difficulty: 'INTERMEDIATE',
      unit: 'reps',
      equipment: ['NONE'],
      // Missing: description, expReward, coinsReward, instructions
    };

    const result = validateExercise(exercise);
    expect(result.valid).toBe(true); // Still valid
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.includes('description'))).toBe(true);
  });

  test('validates difficulty values', () => {
    const exercise = {
      id: 'test-1',
      name: 'Test Exercise',
      category: 'PUSH',
      difficulty: 'INVALID_DIFFICULTY', // Invalid
      unit: 'reps',
      equipment: ['NONE'],
    };

    const result = validateExercise(exercise);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Invalid difficulty'))).toBe(true);
  });

  test('validates unit values', () => {
    const exercise = {
      id: 'test-1',
      name: 'Test Exercise',
      category: 'PUSH',
      difficulty: 'INTERMEDIATE',
      unit: 'invalid_unit', // Invalid
      equipment: ['NONE'],
    };

    const result = validateExercise(exercise);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Invalid unit'))).toBe(true);
  });

  test('warns about unusual categories', () => {
    const exercise = {
      id: 'test-1',
      name: 'Test Exercise',
      category: 'UNUSUAL_CATEGORY',
      difficulty: 'INTERMEDIATE',
      unit: 'reps',
      equipment: ['NONE'],
    };

    const result = validateExercise(exercise);
    expect(result.valid).toBe(true); // Not an error, just a warning
    expect(result.warnings.some(w => w.includes('Unusual category'))).toBe(true);
  });

  test('checks for visual media', () => {
    const exerciseWithoutMedia = {
      id: 'test-1',
      name: 'Test Exercise',
      category: 'PUSH',
      difficulty: 'INTERMEDIATE',
      unit: 'reps',
      equipment: ['NONE'],
      // No gifUrl, thumbnailUrl, or videoUrl
    };

    const result = validateExercise(exerciseWithoutMedia);
    expect(result.warnings.some(w => w.includes('No visual media'))).toBe(true);
  });
});

describe('validateExerciseDatabase', () => {
  test('validates database with all valid exercises', () => {
    const exercises = [
      {
        id: '1',
        name: 'Push-up',
        category: 'PUSH',
        difficulty: 'BEGINNER',
        unit: 'reps',
        equipment: ['NONE'],
      },
      {
        id: '2',
        name: 'Pull-up',
        category: 'PULL',
        difficulty: 'INTERMEDIATE',
        unit: 'reps',
        equipment: ['PULL_UP_BAR'],
      },
    ];

    const result = validateExerciseDatabase(exercises);
    expect(result.isValid).toBe(true);
    expect(result.stats.total).toBe(2);
    expect(result.invalidExercises).toHaveLength(0);
  });

  test('counts exercises by category', () => {
    const exercises = [
      { id: '1', name: 'Ex1', category: 'PUSH', difficulty: 'BEGINNER', unit: 'reps', equipment: ['NONE'] },
      { id: '2', name: 'Ex2', category: 'PUSH', difficulty: 'BEGINNER', unit: 'reps', equipment: ['NONE'] },
      { id: '3', name: 'Ex3', category: 'PULL', difficulty: 'BEGINNER', unit: 'reps', equipment: ['NONE'] },
    ];

    const result = validateExerciseDatabase(exercises);
    expect(result.stats.byCategory['PUSH']).toBe(2);
    expect(result.stats.byCategory['PULL']).toBe(1);
  });

  test('counts exercises by difficulty', () => {
    const exercises = [
      { id: '1', name: 'Ex1', category: 'PUSH', difficulty: 'BEGINNER', unit: 'reps', equipment: ['NONE'] },
      { id: '2', name: 'Ex2', category: 'PUSH', difficulty: 'INTERMEDIATE', unit: 'reps', equipment: ['NONE'] },
      { id: '3', name: 'Ex3', category: 'PULL', difficulty: 'INTERMEDIATE', unit: 'reps', equipment: ['NONE'] },
    ];

    const result = validateExerciseDatabase(exercises);
    expect(result.stats.byDifficulty['BEGINNER']).toBe(1);
    expect(result.stats.byDifficulty['INTERMEDIATE']).toBe(2);
  });

  test('tracks invalid exercises', () => {
    const exercises = [
      { id: '1', name: 'Valid', category: 'PUSH', difficulty: 'BEGINNER', unit: 'reps', equipment: ['NONE'] },
      { id: '2', name: 'Invalid', difficulty: 'BEGINNER', unit: 'reps', equipment: ['NONE'] }, // Missing category
    ];

    const result = validateExerciseDatabase(exercises);
    expect(result.isValid).toBe(false);
    expect(result.invalidExercises).toHaveLength(1);
    expect(result.stats.validationIssues).toBe(1);
  });
});

describe('findExercisesByCategory', () => {
  const mockExercises = [
    { id: '1', name: 'Push-up', category: 'PUSH', difficulty: 'BEGINNER', unit: 'reps', equipment: ['NONE'] },
    { id: '2', name: 'Pull-up', category: 'PULL', difficulty: 'INTERMEDIATE', unit: 'reps', equipment: ['PULL_UP_BAR'] },
    { id: '3', name: 'Dip', category: 'PUSH', difficulty: 'INTERMEDIATE', unit: 'reps', equipment: ['PARALLEL_BARS'] },
  ];

  test('finds exercises by category', () => {
    const result = findExercisesByCategory(mockExercises as any, 'PUSH');
    expect(result).toHaveLength(2);
    expect(result.every(ex => ex.category === 'PUSH')).toBe(true);
  });

  test('filters by difficulty', () => {
    const result = findExercisesByCategory(mockExercises as any, 'PUSH', {
      difficulty: 'BEGINNER',
    });
    expect(result).toHaveLength(1);
    expect(result[0].difficulty).toBe('BEGINNER');
  });

  test('filters by equipment', () => {
    const result = findExercisesByCategory(mockExercises as any, 'PUSH', {
      equipment: ['PARALLEL_BARS'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  test('limits results', () => {
    const result = findExercisesByCategory(mockExercises as any, 'PUSH', {
      limit: 1,
    });
    expect(result).toHaveLength(1);
  });

  test('skips invalid exercises when validateFirst=true', () => {
    const exercisesWithInvalid = [
      ...mockExercises,
      { id: '4', name: 'Invalid', category: 'PUSH', difficulty: 'INVALID', unit: 'reps', equipment: ['NONE'] },
    ];

    const result = findExercisesByCategory(exercisesWithInvalid as any, 'PUSH', {
      validateFirst: true,
    });
    expect(result).toHaveLength(2); // Should skip the invalid one
  });
});

describe('findExercise', () => {
  const mockExercises = [
    { id: 'push-up-1', name: 'Push-up', category: 'PUSH', difficulty: 'BEGINNER', unit: 'reps', equipment: ['NONE'] },
    { id: 'pull-up-1', name: 'Pull-up', category: 'PULL', difficulty: 'INTERMEDIATE', unit: 'reps', equipment: ['PULL_UP_BAR'] },
  ];

  test('finds exercise by exact ID', () => {
    const result = findExercise(mockExercises as any, 'push-up-1');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('push-up-1');
  });

  test('finds exercise by exact name', () => {
    const result = findExercise(mockExercises as any, 'Push-up');
    expect(result).not.toBeNull();
    expect(result?.name).toBe('Push-up');
  });

  test('finds exercise with fuzzy match', () => {
    const result = findExercise(mockExercises as any, 'push', {
      fuzzyMatch: true,
    });
    expect(result).not.toBeNull();
    expect(result?.name).toBe('Push-up');
  });

  test('returns null when not found', () => {
    const result = findExercise(mockExercises as any, 'nonexistent');
    expect(result).toBeNull();
  });

  test('validates exercise when validateFirst=true', () => {
    const invalidExercise = { id: 'invalid', name: 'Invalid', difficulty: 'WRONG', unit: 'reps' };
    const exercises = [...mockExercises, invalidExercise];

    const result = findExercise(exercises as any, 'invalid', {
      validateFirst: true,
    });
    expect(result).toBeNull(); // Should return null because exercise is invalid
  });
});
