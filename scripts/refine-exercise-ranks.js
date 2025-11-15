/**
 * Refined Rank Assignment Script
 *
 * Assigns D/C/B/A/S ranks to exercises based on:
 * - Difficulty level (BEGINNER/INTERMEDIATE/ADVANCED/ELITE)
 * - Exercise name (detecting advanced skills)
 * - Muscle groups involved
 * - Equipment requirements
 */

const fs = require('fs');
const path = require('path');

const EXERCISES_PATH = path.join(__dirname, '../apps/web/src/data/exercises.json');

// Elite/S-tier skills (most difficult calisthenics moves)
const ELITE_SKILLS = [
  'full planche',
  'iron cross',
  'maltese',
  'victorian',
  'zanetti',
  'one arm chin-up',
  'one arm pull-up',
  'handstand push-up',
  'straddle planche',
  'stretched full planche'
];

// Advanced/A-tier skills
const ADVANCED_SKILLS = [
  'muscle up',
  'front lever',
  'back lever',
  'planche',
  'l-pull-up',
  'pistol squat',
  'one leg squat',
  'flag',
  'human flag',
  'hefesto'
];

// Intermediate/B-C tier indicators
const INTERMEDIATE_INDICATORS = [
  'decline',
  'advanced',
  'explosive',
  'plyometric',
  'one arm',
  'archer',
  'typewriter',
  'clapping',
  'superman',
  'elevated',
  'weighted'
];

// Beginner/D-C tier (simple movements)
const BEGINNER_INDICATORS = [
  'incline',
  'wall',
  'assisted',
  'modified',
  'knee',
  'kneeling',
  'supported',
  'partial'
];

function determineRank(exercise) {
  const name = exercise.name.toLowerCase();
  const difficulty = exercise.difficulty;

  // S Rank (Elite - Superhuman skills)
  if (difficulty === 'ELITE') {
    // Check if it's a true elite skill
    if (ELITE_SKILLS.some(skill => name.includes(skill))) {
      return 'S';
    }
    // Other ELITE exercises default to A rank
    return 'A';
  }

  // A Rank (Advanced - High-level skills)
  if (difficulty === 'ADVANCED') {
    // Check if it's a known advanced skill
    if (ADVANCED_SKILLS.some(skill => name.includes(skill))) {
      return 'A';
    }
    // Other ADVANCED exercises get B rank
    return 'B';
  }

  // B/C Rank (Intermediate)
  if (difficulty === 'INTERMEDIATE') {
    // Check for intermediate indicators
    if (INTERMEDIATE_INDICATORS.some(indicator => name.includes(indicator))) {
      return 'B';
    }
    // Default intermediate to C
    return 'C';
  }

  // D/C Rank (Beginner)
  if (difficulty === 'BEGINNER') {
    // Check if it's a beginner-friendly exercise
    if (BEGINNER_INDICATORS.some(indicator => name.includes(indicator))) {
      return 'D';
    }

    // Standard push/pull/core movements
    const standardMovements = ['push-up', 'pull-up', 'squat', 'lunge', 'plank', 'crunch', 'dip'];
    const isStandard = standardMovements.some(move => name.includes(move));

    // Check complexity by muscle groups
    const muscleGroupCount = exercise.muscleGroups ? exercise.muscleGroups.length : 0;

    // More muscle groups = slightly more advanced
    if (muscleGroupCount >= 4 && isStandard) {
      return 'C';
    }

    // Simple exercises or variations stay at D
    return 'D';
  }

  // Default fallback
  return 'C';
}

function refineRanks() {
  console.log('🎯 Starting rank refinement...\n');

  // Read exercises.json
  const exercisesData = fs.readFileSync(EXERCISES_PATH, 'utf-8');
  const exercises = JSON.parse(exercisesData);

  console.log(`Found ${exercises.length} exercises\n`);

  // Track changes
  const changes = { D: 0, C: 0, B: 0, A: 0, S: 0 };
  const previousRanks = {};

  // Refine ranks for each exercise
  const refinedExercises = exercises.map(exercise => {
    const oldRank = exercise.rank;
    const newRank = determineRank(exercise);

    if (oldRank !== newRank) {
      console.log(`📊 [${exercise.id}] ${exercise.name}`);
      console.log(`   ${oldRank} → ${newRank} (${exercise.difficulty})`);
    }

    previousRanks[oldRank] = (previousRanks[oldRank] || 0) + 1;
    changes[newRank]++;

    return {
      ...exercise,
      rank: newRank
    };
  });

  console.log('\n📊 Rank Distribution Summary:');
  console.log('\nBefore:');
  Object.entries(previousRanks).sort().forEach(([rank, count]) => {
    console.log(`  Rank ${rank}: ${count} exercises`);
  });

  console.log('\nAfter:');
  Object.entries(changes).sort().forEach(([rank, count]) => {
    console.log(`  Rank ${rank}: ${count} exercises`);
  });

  // Write back to file
  console.log('\n💾 Writing updated exercises.json...');
  fs.writeFileSync(
    EXERCISES_PATH,
    JSON.stringify(refinedExercises, null, 2),
    'utf-8'
  );

  console.log('\n✅ Rank refinement completed successfully!');

  // Show some examples
  console.log('\n📋 Sample S-Rank Exercises:');
  refinedExercises
    .filter(e => e.rank === 'S')
    .slice(0, 5)
    .forEach(e => console.log(`  - ${e.name} (${e.difficulty})`));

  console.log('\n📋 Sample A-Rank Exercises:');
  refinedExercises
    .filter(e => e.rank === 'A')
    .slice(0, 5)
    .forEach(e => console.log(`  - ${e.name} (${e.difficulty})`));

  console.log('\n📋 Sample B-Rank Exercises:');
  refinedExercises
    .filter(e => e.rank === 'B')
    .slice(0, 5)
    .forEach(e => console.log(`  - ${e.name} (${e.difficulty})`));
}

// Run refinement
try {
  refineRanks();
} catch (error) {
  console.error('❌ Rank refinement failed:', error);
  process.exit(1);
}
