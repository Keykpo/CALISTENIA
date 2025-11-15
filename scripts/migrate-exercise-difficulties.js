/**
 * Migration Script: Update exercise difficulties
 *
 * Changes:
 * - NOVICE → BEGINNER
 * - EXPERT → ELITE
 *
 * Also adds a 'rank' field to each exercise based on difficulty
 */

const fs = require('fs');
const path = require('path');

const EXERCISES_PATH = path.join(__dirname, '../apps/web/src/data/exercises.json');

// Difficulty mapping
const DIFFICULTY_MAP = {
  'NOVICE': 'BEGINNER',
  'EXPERT': 'ELITE',
  // These remain the same
  'BEGINNER': 'BEGINNER',
  'INTERMEDIATE': 'INTERMEDIATE',
  'ADVANCED': 'ADVANCED',
  'ELITE': 'ELITE'
};

// Rank assignment based on difficulty
// This is a simplified mapping - can be refined later
const DIFFICULTY_TO_RANK = {
  'BEGINNER': 'D',
  'INTERMEDIATE': 'C',
  'ADVANCED': 'B',
  'ELITE': 'A'
};

function migrateExercises() {
  console.log('🚀 Starting exercise migration...\n');

  // Read exercises.json
  console.log('📖 Reading exercises.json...');
  const exercisesData = fs.readFileSync(EXERCISES_PATH, 'utf-8');
  const exercises = JSON.parse(exercisesData);

  console.log(`Found ${exercises.length} exercises\n`);

  // Track changes
  let noviceCount = 0;
  let expertCount = 0;
  let ranksAdded = 0;

  // Migrate each exercise
  const migratedExercises = exercises.map(exercise => {
    const oldDifficulty = exercise.difficulty;
    const newDifficulty = DIFFICULTY_MAP[oldDifficulty] || oldDifficulty;

    // Track changes
    if (oldDifficulty === 'NOVICE') {
      noviceCount++;
      console.log(`✓ [${exercise.id}] ${exercise.name}: NOVICE → BEGINNER`);
    }
    if (oldDifficulty === 'EXPERT') {
      expertCount++;
      console.log(`✓ [${exercise.id}] ${exercise.name}: EXPERT → ELITE`);
    }

    // Add rank field if it doesn't exist
    let rank = exercise.rank;
    if (!rank) {
      rank = DIFFICULTY_TO_RANK[newDifficulty] || 'C';
      ranksAdded++;
    }

    return {
      ...exercise,
      difficulty: newDifficulty,
      rank: rank
    };
  });

  console.log('\n📊 Migration Summary:');
  console.log(`  - NOVICE → BEGINNER: ${noviceCount} exercises`);
  console.log(`  - EXPERT → ELITE: ${expertCount} exercises`);
  console.log(`  - Ranks added: ${ranksAdded} exercises`);

  // Write back to file
  console.log('\n💾 Writing updated exercises.json...');
  fs.writeFileSync(
    EXERCISES_PATH,
    JSON.stringify(migratedExercises, null, 2),
    'utf-8'
  );

  console.log('\n✅ Migration completed successfully!');

  // Show difficulty distribution
  const difficultyCount = {};
  migratedExercises.forEach(ex => {
    difficultyCount[ex.difficulty] = (difficultyCount[ex.difficulty] || 0) + 1;
  });

  console.log('\n📈 Final Difficulty Distribution:');
  Object.entries(difficultyCount).forEach(([diff, count]) => {
    console.log(`  - ${diff}: ${count} exercises`);
  });

  // Show rank distribution
  const rankCount = {};
  migratedExercises.forEach(ex => {
    rankCount[ex.rank] = (rankCount[ex.rank] || 0) + 1;
  });

  console.log('\n🏆 Final Rank Distribution:');
  Object.entries(rankCount).forEach(([rank, count]) => {
    console.log(`  - Rank ${rank}: ${count} exercises`);
  });
}

// Run migration
try {
  migrateExercises();
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
