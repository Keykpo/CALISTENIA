#!/usr/bin/env node

/**
 * EXERCISE VALIDATION SCRIPT
 *
 * Validates exercises.json to ensure all exercises have required fields
 * and meet quality standards for use in routine generation.
 *
 * Usage:
 *   node scripts/validate-exercises.js
 */

const fs = require('fs');
const path = require('path');

// Import validation functions (need to transpile or use dynamic import)
const exercisesPath = path.join(__dirname, '../apps/web/src/data/exercises.json');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function validateExercise(exercise) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!exercise.id) errors.push('Missing required field: id');
  if (!exercise.name) errors.push('Missing required field: name');
  if (!exercise.category) errors.push('Missing required field: category');
  if (!exercise.difficulty) errors.push('Missing required field: difficulty');
  if (!exercise.unit) errors.push('Missing required field: unit');
  if (!exercise.equipment || !Array.isArray(exercise.equipment)) {
    errors.push('Missing or invalid field: equipment (must be array)');
  }

  // Recommended fields
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

function validateExerciseDatabase(exercises) {
  const stats = {
    total: exercises.length,
    byCategory: {},
    byDifficulty: {},
    missingFields: [],
    validationIssues: 0,
  };

  const invalidExercises = [];
  const missingFieldsSet = new Set();

  exercises.forEach(exercise => {
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

function printReport(validation) {
  const { stats, invalidExercises } = validation;

  console.log('');
  console.log(colors.cyan + '═══════════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.cyan + '     EXERCISE DATABASE VALIDATION REPORT' + colors.reset);
  console.log(colors.cyan + '═══════════════════════════════════════════════════════════' + colors.reset);
  console.log('');

  // Overall stats
  console.log(colors.blue + '📊 Overall Statistics:' + colors.reset);
  console.log(`   Total Exercises: ${stats.total}`);
  console.log(`   Valid Exercises: ${colors.green}${stats.total - stats.validationIssues}${colors.reset}`);

  if (stats.validationIssues > 0) {
    console.log(`   Invalid Exercises: ${colors.red}${stats.validationIssues}${colors.reset}`);
  } else {
    console.log(`   Invalid Exercises: ${colors.green}0${colors.reset} ✅`);
  }
  console.log('');

  // Categories
  console.log(colors.blue + '📁 Categories:' + colors.reset);
  Object.entries(stats.byCategory)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`   ${category.padEnd(20)}: ${count}`);
    });
  console.log('');

  // Difficulties
  console.log(colors.blue + '⭐ Difficulties:' + colors.reset);
  Object.entries(stats.byDifficulty)
    .sort(([, a], [, b]) => b - a)
    .forEach(([difficulty, count]) => {
      console.log(`   ${difficulty.padEnd(20)}: ${count}`);
    });
  console.log('');

  // Missing fields
  if (stats.missingFields.length > 0) {
    console.log(colors.yellow + '⚠️  Missing Required Fields:' + colors.reset);
    stats.missingFields.forEach(field => {
      console.log(`   - ${field}`);
    });
    console.log('');
  }

  // Invalid exercises
  if (invalidExercises.length > 0) {
    console.log(colors.red + '❌ Invalid Exercises:' + colors.reset);
    invalidExercises.slice(0, 10).forEach(({ exercise, validation }) => {
      console.log(`   ${colors.yellow}${exercise.name || exercise.id || 'Unknown'}:${colors.reset}`);
      validation.errors.forEach(error => {
        console.log(`      ${colors.red}ERROR:${colors.reset} ${error}`);
      });
    });

    if (invalidExercises.length > 10) {
      console.log(`   ... and ${colors.yellow}${invalidExercises.length - 10} more${colors.reset}`);
    }
    console.log('');
  }

  console.log(colors.cyan + '═══════════════════════════════════════════════════════════' + colors.reset);

  // Final verdict
  if (validation.isValid) {
    console.log(colors.green + '✅ VALIDATION PASSED - All exercises are valid!' + colors.reset);
  } else {
    console.log(colors.red + '❌ VALIDATION FAILED - Please fix the errors above' + colors.reset);
  }
  console.log(colors.cyan + '═══════════════════════════════════════════════════════════' + colors.reset);
  console.log('');
}

// Main execution
try {
  console.log(colors.cyan + '\n🔍 Loading exercises from: ' + exercisesPath + colors.reset);

  if (!fs.existsSync(exercisesPath)) {
    console.error(colors.red + `\n❌ Error: exercises.json not found at ${exercisesPath}` + colors.reset);
    process.exit(1);
  }

  const exercisesData = fs.readFileSync(exercisesPath, 'utf8');
  const exercises = JSON.parse(exercisesData);

  console.log(colors.green + `✅ Loaded ${exercises.length} exercises\n` + colors.reset);

  const validation = validateExerciseDatabase(exercises);
  printReport(validation);

  // Exit with appropriate code
  process.exit(validation.isValid ? 0 : 1);

} catch (error) {
  console.error(colors.red + '\n❌ Error running validation:' + colors.reset);
  console.error(error);
  process.exit(1);
}
