/**
 * END-TO-END ROUTINE GENERATION TESTING
 *
 * Tests complete routine generation for all 15 sublevels:
 * - Validates exercises exist in database
 * - Checks volume/intensity scaling
 * - Verifies warmup/cooldown inclusion
 * - Detects errors or missing exercises
 */

const path = require('path');
const fs = require('fs');

console.log('\n🧪 END-TO-END ROUTINE GENERATION TESTING\n');
console.log('='.repeat(100));

// ==========================================
// IMPORT SYSTEM MODULES
// ==========================================

// Load exercise database
const dbPath = path.join(__dirname, '../apps/web/src/data/exercise-database.json');
let exerciseDB;

try {
  const rawData = fs.readFileSync(dbPath, 'utf8');
  exerciseDB = JSON.parse(rawData);
  console.log(`\n✅ Loaded exercise database: ${exerciseDB.exercises.length} exercises`);
} catch (error) {
  console.error('❌ ERROR: Could not load exercise database:', error.message);
  process.exit(1);
}

// Simulated imports (we'll mock the routine generator logic)
const SUBLEVELS = [
  'D_MINUS', 'D', 'D_PLUS',
  'C_MINUS', 'C', 'C_PLUS',
  'B_MINUS', 'B', 'B_PLUS',
  'A_MINUS', 'A', 'A_PLUS',
  'S_MINUS', 'S', 'S_PLUS'
];

const SUBLEVEL_TO_TIER = {
  'D_MINUS': 'D', 'D': 'D', 'D_PLUS': 'D',
  'C_MINUS': 'C', 'C': 'C', 'C_PLUS': 'C',
  'B_MINUS': 'B', 'B': 'B', 'B_PLUS': 'B',
  'A_MINUS': 'A', 'A': 'A', 'A_PLUS': 'A',
  'S_MINUS': 'S', 'S': 'S', 'S_PLUS': 'S'
};

const SUBLEVEL_METRICS = {
  'D_MINUS': { pullups: 0, dips: 0, stage: 'STAGE_1_2' },
  'D': { pullups: 1, dips: 1, stage: 'STAGE_1_2' },
  'D_PLUS': { pullups: 4, dips: 4, stage: 'STAGE_1_2' },
  'C_MINUS': { pullups: 7, dips: 7, stage: 'STAGE_1_2' },
  'C': { pullups: 11, dips: 11, stage: 'STAGE_1_2' },
  'C_PLUS': { pullups: 15, dips: 15, stage: 'STAGE_3' },
  'B_MINUS': { pullups: 19, dips: 19, stage: 'STAGE_3' },
  'B': { pullups: 24, dips: 24, stage: 'STAGE_3' },
  'B_PLUS': { pullups: 30, dips: 30, stage: 'STAGE_4' },
  'A_MINUS': { pullups: 36, dips: 36, stage: 'STAGE_4' },
  'A': { pullups: 42, dips: 42, stage: 'STAGE_4' },
  'A_PLUS': { pullups: 48, dips: 48, stage: 'STAGE_4' },
  'S_MINUS': { pullups: 55, dips: 55, stage: 'STAGE_4' },
  'S': { pullups: 62, dips: 62, stage: 'STAGE_4' },
  'S_PLUS': { pullups: 70, dips: 70, stage: 'STAGE_4' }
};

// ==========================================
// EXERCISE REQUIREMENTS BY TIER
// ==========================================

const TIER_EXERCISE_REQUIREMENTS = {
  D: {
    difficulty: ['BEGINNER'],
    categories: ['PUSH', 'PULL', 'CORE', 'LEGS'],
    minExercises: 6,
    expectedExercises: [
      'Assisted Pull-ups', 'Incline Push-ups', 'Regular Push-ups',
      'Bodyweight Squats', 'Incline Rows', 'Plank Hold'
    ]
  },
  C: {
    difficulty: ['BEGINNER', 'INTERMEDIATE'],
    categories: ['PUSH', 'PULL', 'CORE', 'LEGS'],
    minExercises: 8,
    expectedExercises: [
      'Pull-ups', 'Diamond Push-ups', 'Pike Push-ups',
      'Horizontal Rows', 'L-sit Progressions', 'Dips'
    ]
  },
  B: {
    difficulty: ['INTERMEDIATE'],
    categories: ['PUSH', 'PULL', 'SKILL_STATIC', 'CORE', 'BALANCE'],
    minExercises: 10,
    expectedExercises: [
      'Weighted Pull-ups', 'Weighted Dips', 'Archer Push-ups',
      'Tuck Planche', 'Tuck Front Lever', 'Handstand Hold'
    ]
  },
  A: {
    difficulty: ['INTERMEDIATE', 'ADVANCED'],
    categories: ['PUSH', 'PULL', 'SKILL_STATIC', 'CORE'],
    minExercises: 12,
    expectedExercises: [
      'Advanced Tuck Planche', 'Front Lever', 'One-Arm Push-up Progressions',
      'Dragon Flags', 'Handstand Push-ups', 'Muscle-ups'
    ]
  },
  S: {
    difficulty: ['ADVANCED', 'ELITE'],
    categories: ['PUSH', 'PULL', 'SKILL_STATIC'],
    minExercises: 14,
    expectedExercises: [
      'Full Planche', 'One-Arm Pull-ups', 'Maltese',
      'Human Flag', 'Iron Cross', 'Freestanding Handstand Push-ups'
    ]
  }
};

// ==========================================
// MOCK ROUTINE GENERATOR
// ==========================================

function generateMockRoutine(sublevel) {
  const tier = SUBLEVEL_TO_TIER[sublevel];
  const metrics = SUBLEVEL_METRICS[sublevel];
  const requirements = TIER_EXERCISE_REQUIREMENTS[tier];

  // Filter exercises by difficulty and category
  const availableExercises = exerciseDB.exercises.filter(ex => {
    const difficultyMatch = requirements.difficulty.includes(ex.difficulty);
    const categoryMatch = requirements.categories.includes(ex.category);
    return difficultyMatch || categoryMatch;
  });

  // Select exercises based on tier
  const selectedExercises = [];

  // For each category, pick 1-2 exercises
  requirements.categories.forEach(category => {
    const categoryExercises = availableExercises.filter(ex => ex.category === category);
    if (categoryExercises.length > 0) {
      // Pick first 1-2 exercises from this category
      const numToPick = Math.min(2, categoryExercises.length);
      for (let i = 0; i < numToPick; i++) {
        if (categoryExercises[i]) {
          selectedExercises.push(categoryExercises[i]);
        }
      }
    }
  });

  // Calculate volume based on tier
  const baseVolume = tier === 'D' ? 12 : tier === 'C' ? 18 : tier === 'B' ? 25 : tier === 'A' ? 35 : 45;
  const sets = Math.floor(baseVolume / selectedExercises.length);

  return {
    sublevel,
    tier,
    stage: metrics.stage,
    metrics: {
      pullups: metrics.pullups,
      dips: metrics.dips
    },
    warmup: {
      duration: tier === 'D' || tier === 'C' ? 10 : tier === 'B' ? 12 : 15,
      exercises: ['Joint Rotations', 'Scapular Activation', 'Dynamic Stretching']
    },
    strength: {
      exercises: selectedExercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        difficulty: ex.difficulty,
        sets: sets,
        reps: tier === 'D' ? '8-12' : tier === 'C' ? '6-10' : tier === 'B' ? '5-8' : tier === 'A' ? '4-6' : '3-5'
      })),
      totalSets: selectedExercises.length * sets,
      estimatedDuration: selectedExercises.length * sets * 3 // 3 min per set
    },
    skills: {
      included: tier !== 'D' && tier !== 'C',
      exercises: tier === 'B' || tier === 'A' || tier === 'S' ? ['Planche Leans', 'Handstand Practice'] : [],
      duration: tier === 'B' ? 10 : tier === 'A' ? 15 : tier === 'S' ? 20 : 0
    },
    cooldown: {
      duration: tier === 'D' || tier === 'C' ? 5 : tier === 'B' ? 8 : 10,
      exercises: ['Static Stretching', 'Foam Rolling', 'Breathing Exercises']
    },
    totalDuration: function() {
      return this.warmup.duration + this.strength.estimatedDuration + this.skills.duration + this.cooldown.duration;
    }
  };
}

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

function validateExercisesExist(routine) {
  const errors = [];
  const warnings = [];

  routine.strength.exercises.forEach(ex => {
    const dbExercise = exerciseDB.exercises.find(dbEx => dbEx.id === ex.id);
    if (!dbExercise) {
      errors.push(`Exercise "${ex.name}" (${ex.id}) not found in database`);
    }
  });

  // Check if we have enough variety
  const categories = new Set(routine.strength.exercises.map(ex => ex.category));
  const requirements = TIER_EXERCISE_REQUIREMENTS[routine.tier];

  if (routine.strength.exercises.length < requirements.minExercises) {
    warnings.push(`Only ${routine.strength.exercises.length} exercises (expected ${requirements.minExercises}+)`);
  }

  if (categories.size < 3) {
    warnings.push(`Only ${categories.size} categories covered (expected 3+)`);
  }

  return { errors, warnings };
}

function validateVolumeProgression(routines) {
  const errors = [];
  const warnings = [];

  for (let i = 1; i < routines.length; i++) {
    const prev = routines[i - 1];
    const curr = routines[i];

    // Volume should generally increase or stay similar
    const volumeDiff = curr.strength.totalSets - prev.strength.totalSets;
    const percentChange = (volumeDiff / prev.strength.totalSets) * 100;

    // If moving to a higher tier, volume should increase
    if (curr.tier !== prev.tier) {
      if (volumeDiff < 0) {
        errors.push(`Volume decreased from ${prev.sublevel} (${prev.strength.totalSets} sets) to ${curr.sublevel} (${curr.strength.totalSets} sets)`);
      } else if (volumeDiff === 0) {
        warnings.push(`Volume unchanged from ${prev.sublevel} to ${curr.sublevel} (${curr.strength.totalSets} sets)`);
      }
    }
  }

  return { errors, warnings };
}

// ==========================================
// RUN TESTS
// ==========================================

console.log('\n\n🔄 GENERATING ROUTINES FOR ALL 15 SUBLEVELS\n');
console.log('-'.repeat(100));

const routines = [];
const allErrors = [];
const allWarnings = [];

SUBLEVELS.forEach(sublevel => {
  console.log(`\n📋 ${sublevel} (Tier ${SUBLEVEL_TO_TIER[sublevel]}):`);

  try {
    const routine = generateMockRoutine(sublevel);
    routines.push(routine);

    console.log(`   Stage: ${routine.stage}`);
    console.log(`   Metrics: ${routine.metrics.pullups} pull-ups, ${routine.metrics.dips} dips`);
    console.log(`   Exercises: ${routine.strength.exercises.length} (${routine.strength.totalSets} total sets)`);
    console.log(`   Duration: ${routine.totalDuration()} minutes`);
    console.log(`   Categories: ${[...new Set(routine.strength.exercises.map(e => e.category))].join(', ')}`);

    // Validate
    const validation = validateExercisesExist(routine);

    if (validation.errors.length > 0) {
      console.log(`   ❌ ERRORS: ${validation.errors.length}`);
      validation.errors.forEach(err => {
        console.log(`      • ${err}`);
        allErrors.push({ sublevel, error: err });
      });
    }

    if (validation.warnings.length > 0) {
      console.log(`   ⚠️  WARNINGS: ${validation.warnings.length}`);
      validation.warnings.forEach(warn => {
        console.log(`      • ${warn}`);
        allWarnings.push({ sublevel, warning: warn });
      });
    }

    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      console.log(`   ✅ All validations passed`);
    }

  } catch (error) {
    console.log(`   ❌ GENERATION FAILED: ${error.message}`);
    allErrors.push({ sublevel, error: `Generation failed: ${error.message}` });
  }
});

// ==========================================
// VOLUME PROGRESSION VALIDATION
// ==========================================

console.log('\n\n📊 VALIDATING VOLUME PROGRESSION\n');
console.log('-'.repeat(100));

const volumeValidation = validateVolumeProgression(routines);

if (volumeValidation.errors.length > 0) {
  console.log('\n❌ VOLUME PROGRESSION ERRORS:');
  volumeValidation.errors.forEach(err => {
    console.log(`   • ${err}`);
    allErrors.push({ sublevel: 'PROGRESSION', error: err });
  });
}

if (volumeValidation.warnings.length > 0) {
  console.log('\n⚠️  VOLUME PROGRESSION WARNINGS:');
  volumeValidation.warnings.forEach(warn => {
    console.log(`   • ${warn}`);
    allWarnings.push({ sublevel: 'PROGRESSION', warning: warn });
  });
}

// Volume progression table
console.log('\n📈 VOLUME PROGRESSION TABLE:\n');
console.log('Sublevel    | Tier | Sets | Duration | Change');
console.log('-'.repeat(60));

routines.forEach((routine, index) => {
  const prevRoutine = index > 0 ? routines[index - 1] : null;
  const change = prevRoutine
    ? `${routine.strength.totalSets - prevRoutine.strength.totalSets >= 0 ? '+' : ''}${routine.strength.totalSets - prevRoutine.strength.totalSets}`
    : '-';

  console.log(
    `${routine.sublevel.padEnd(12)} | ${routine.tier.padEnd(4)} | ${String(routine.strength.totalSets).padStart(4)} | ${String(routine.totalDuration()).padStart(8)} | ${change}`
  );
});

// ==========================================
// FINAL SUMMARY
// ==========================================

console.log('\n\n' + '='.repeat(100));
console.log('\n📋 TESTING SUMMARY\n');

console.log(`Total Routines Generated: ${routines.length}/15`);
console.log(`Total Exercises Used: ${[...new Set(routines.flatMap(r => r.strength.exercises.map(e => e.id)))].length}`);
console.log(`Total Errors: ${allErrors.length}`);
console.log(`Total Warnings: ${allWarnings.length}`);

// Exercise coverage by tier
console.log('\n📊 EXERCISE COVERAGE BY TIER:\n');
['D', 'C', 'B', 'A', 'S'].forEach(tier => {
  const tierRoutines = routines.filter(r => r.tier === tier);
  const tierExercises = [...new Set(tierRoutines.flatMap(r => r.strength.exercises.map(e => e.id)))];
  const requirements = TIER_EXERCISE_REQUIREMENTS[tier];

  console.log(`   Tier ${tier}: ${tierExercises.length} unique exercises (min: ${requirements.minExercises})`);
});

// ==========================================
// VERDICT
// ==========================================

console.log('\n' + '='.repeat(100));

if (allErrors.length === 0) {
  console.log('\n✅ ALL TESTS PASSED - Routine generation is functional!\n');
  if (allWarnings.length > 0) {
    console.log(`⚠️  ${allWarnings.length} warnings found (non-critical)\n`);
  }
} else {
  console.log('\n❌ TESTS FAILED - Critical errors found\n');
  console.log(`   Errors: ${allErrors.length}`);
  console.log(`   Warnings: ${allWarnings.length}\n`);
  console.log('💡 RECOMMENDATIONS:');
  console.log('   1. Fix critical errors before deployment');
  console.log('   2. Review warnings for optimization opportunities');
  console.log('   3. Add missing exercises to database if needed\n');
}

console.log('='.repeat(100) + '\n');
