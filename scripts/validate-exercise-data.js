/**
 * Exercise Data Validation Script
 *
 * Validates that all exercises have:
 * - Required fields according to Prisma schema
 * - Valid enums for category, difficulty, rank
 * - Proper data types
 * - Consistency between difficulty and rank
 */

const fs = require('fs');
const path = require('path');

const EXERCISES_PATH = path.join(__dirname, '../apps/web/src/data/exercises.json');

// Valid enum values from Prisma schema
const VALID_CATEGORIES = [
  'PUSH', 'PULL', 'CORE', 'SKILL_STATIC', 'LEGS', 'CARDIO',
  'BALANCE', 'MOBILITY', 'FLEXIBILITY', 'WARM_UP', 'COOL_DOWN'
];

const VALID_DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'];
const VALID_RANKS = ['D', 'C', 'B', 'A', 'S'];

// Rank-Difficulty mapping validation
const RANK_DIFFICULTY_MAP = {
  'D': ['BEGINNER'],
  'C': ['BEGINNER', 'INTERMEDIATE'],
  'B': ['INTERMEDIATE', 'ADVANCED'],
  'A': ['ADVANCED', 'ELITE'],
  'S': ['ELITE']
};

function validateExercise(exercise, index) {
  const errors = [];
  const warnings = [];

  // Required fields check
  if (!exercise.id) errors.push(`Missing id`);
  if (!exercise.name) errors.push(`Missing name`);
  if (!exercise.category) errors.push(`Missing category`);
  if (!exercise.difficulty) errors.push(`Missing difficulty`);

  // Category validation
  if (exercise.category && !VALID_CATEGORIES.includes(exercise.category)) {
    errors.push(`Invalid category: ${exercise.category}`);
  }

  // Difficulty validation
  if (exercise.difficulty && !VALID_DIFFICULTIES.includes(exercise.difficulty)) {
    errors.push(`Invalid difficulty: ${exercise.difficulty}`);
  }

  // Rank validation
  if (exercise.rank) {
    if (!VALID_RANKS.includes(exercise.rank)) {
      errors.push(`Invalid rank: ${exercise.rank}`);
    } else if (exercise.difficulty) {
      // Check rank-difficulty consistency
      const validDifficulties = RANK_DIFFICULTY_MAP[exercise.rank];
      if (!validDifficulties.includes(exercise.difficulty)) {
        warnings.push(
          `Rank ${exercise.rank} with difficulty ${exercise.difficulty} may be inconsistent. ` +
          `Expected difficulties: ${validDifficulties.join(', ')}`
        );
      }
    }
  } else {
    warnings.push(`Missing rank field`);
  }

  // Array fields validation
  if (exercise.muscleGroups && !Array.isArray(exercise.muscleGroups)) {
    errors.push(`muscleGroups must be an array`);
  }
  if (exercise.equipment && !Array.isArray(exercise.equipment)) {
    errors.push(`equipment must be an array`);
  }
  if (exercise.instructions && !Array.isArray(exercise.instructions)) {
    errors.push(`instructions must be an array`);
  }

  // Data type validation
  if (exercise.expReward !== undefined && typeof exercise.expReward !== 'number') {
    errors.push(`expReward must be a number`);
  }
  if (exercise.coinsReward !== undefined && typeof exercise.coinsReward !== 'number') {
    errors.push(`coinsReward must be a number`);
  }

  return { errors, warnings };
}

function validateAllExercises() {
  console.log('🔍 Starting exercise data validation...\n');

  // Read exercises.json
  const exercisesData = fs.readFileSync(EXERCISES_PATH, 'utf-8');
  const exercises = JSON.parse(exercisesData);

  console.log(`📊 Found ${exercises.length} exercises to validate\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  const exercisesWithErrors = [];
  const exercisesWithWarnings = [];

  // Validate each exercise
  exercises.forEach((exercise, index) => {
    const { errors, warnings } = validateExercise(exercise, index);

    if (errors.length > 0) {
      totalErrors += errors.length;
      exercisesWithErrors.push({
        index,
        id: exercise.id,
        name: exercise.name,
        errors
      });
    }

    if (warnings.length > 0) {
      totalWarnings += warnings.length;
      exercisesWithWarnings.push({
        index,
        id: exercise.id,
        name: exercise.name,
        warnings
      });
    }
  });

  // Report results
  console.log('=' .repeat(60));
  console.log('VALIDATION RESULTS');
  console.log('=' .repeat(60));

  if (totalErrors === 0) {
    console.log('\n✅ No errors found! All exercises have valid required fields.');
  } else {
    console.log(`\n❌ Found ${totalErrors} errors in ${exercisesWithErrors.length} exercises:`);
    exercisesWithErrors.forEach(({ id, name, errors }) => {
      console.log(`\n  [${id}] ${name}:`);
      errors.forEach(error => console.log(`    - ${error}`));
    });
  }

  if (totalWarnings === 0) {
    console.log('\n✅ No warnings.');
  } else {
    console.log(`\n⚠️  Found ${totalWarnings} warnings in ${exercisesWithWarnings.length} exercises:`);
    exercisesWithWarnings.slice(0, 10).forEach(({ id, name, warnings }) => {
      console.log(`\n  [${id}] ${name}:`);
      warnings.forEach(warning => console.log(`    - ${warning}`));
    });
    if (exercisesWithWarnings.length > 10) {
      console.log(`\n  ... and ${exercisesWithWarnings.length - 10} more exercises with warnings`);
    }
  }

  // Statistics
  console.log('\n' + '='.repeat(60));
  console.log('STATISTICS');
  console.log('='.repeat(60));

  const stats = {
    byDifficulty: {},
    byRank: {},
    byCategory: {}
  };

  exercises.forEach(exercise => {
    // By difficulty
    if (exercise.difficulty) {
      stats.byDifficulty[exercise.difficulty] =
        (stats.byDifficulty[exercise.difficulty] || 0) + 1;
    }

    // By rank
    if (exercise.rank) {
      stats.byRank[exercise.rank] = (stats.byRank[exercise.rank] || 0) + 1;
    }

    // By category
    if (exercise.category) {
      stats.byCategory[exercise.category] =
        (stats.byCategory[exercise.category] || 0) + 1;
    }
  });

  console.log('\n📈 Distribution by Difficulty:');
  Object.entries(stats.byDifficulty).sort().forEach(([diff, count]) => {
    const percentage = ((count / exercises.length) * 100).toFixed(1);
    console.log(`  ${diff.padEnd(15)} : ${count.toString().padStart(3)} (${percentage}%)`);
  });

  console.log('\n🏆 Distribution by Rank:');
  Object.entries(stats.byRank).sort().forEach(([rank, count]) => {
    const percentage = ((count / exercises.length) * 100).toFixed(1);
    console.log(`  Rank ${rank.padEnd(11)} : ${count.toString().padStart(3)} (${percentage}%)`);
  });

  console.log('\n📂 Distribution by Category:');
  Object.entries(stats.byCategory).sort().forEach(([cat, count]) => {
    const percentage = ((count / exercises.length) * 100).toFixed(1);
    console.log(`  ${cat.padEnd(15)} : ${count.toString().padStart(3)} (${percentage}%)`);
  });

  console.log('\n' + '='.repeat(60));

  // Exit code
  if (totalErrors > 0) {
    console.log('\n❌ Validation failed with errors.');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('\n⚠️  Validation passed with warnings.');
    process.exit(0);
  } else {
    console.log('\n✅ Validation passed successfully!');
    process.exit(0);
  }
}

// Run validation
try {
  validateAllExercises();
} catch (error) {
  console.error('\n❌ Validation script failed:', error);
  process.exit(1);
}
