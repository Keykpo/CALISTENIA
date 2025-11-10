/**
 * Exercise Difficulty Migration Script
 *
 * 1. Migrates old difficulty values to new unified system:
 *    - NOVICE → BEGINNER
 *    - EXPERT → ELITE
 *
 * 2. Corrects unrealistic difficulties based on exercise names and categories
 */

const fs = require('fs');
const path = require('path');

const EXERCISES_PATH = path.join(__dirname, '../src/data/exercises.json');

// Load exercises
const exercises = JSON.parse(fs.readFileSync(EXERCISES_PATH, 'utf-8'));

console.log(`📊 Loaded ${exercises.length} exercises`);
console.log('\n🔍 Starting difficulty migration and correction...\n');

let migratedCount = 0;
let correctedCount = 0;

// Difficulty adjustment rules based on exercise names/categories
const DIFFICULTY_RULES = {
  // BEGINNER exercises (foundational)
  BEGINNER: [
    // Basic planks and holds
    /\bplank\b(?!.*to.*push)/i,
    /\bwall.*handstand\b/i,
    /\bknee.*push.*up\b/i,
    /\bassisted.*pull.*up\b/i,
    /\bnegative\b/i,
    /\bjump.*pull.*up\b/i,
    /\bscapular\b/i,
    /\bhollow.*body\b/i,
    /\barch.*body\b/i,
    /\bsupport.*hold\b(?!.*ring)/i,
    /\bskin.*the.*cat\b/i,
    /\btuck.*back.*lever\b(?!.*advanced)/i,
    /\btuck.*front.*lever\b(?!.*advanced)/i,
    /\btuck.*l-sit\b/i,
    /\bfrog.*stand\b/i,
    /\bfrog.*planche\b/i,
    /\bbench.*dip\b/i,
    /\bincline.*push.*up\b/i,
    /\bparallel.*squat\b/i,
    /\bbox.*squat\b/i,
  ],

  // INTERMEDIATE exercises
  INTERMEDIATE: [
    /\bpull.*up\b(?!.*one.*arm)(?!.*weighted)/i,
    /\bdip\b(?!.*one.*arm)(?!.*weighted)(?!.*ring)/i,
    /\bpush.*up\b(?!.*one.*arm)(?!.*weighted)(?!.*planche)/i,
    /\bl-sit\b(?!.*manna)(?!.*v-sit)/i,
    /\bstraddle.*l-sit\b/i,
    /\badvanced.*tuck.*back.*lever\b/i,
    /\badvanced.*tuck.*front.*lever\b/i,
    /\btuck.*planche\b(?!.*advanced)/i,
    /\bfull.*squat\b(?!.*pistol)/i,
    /\bdeep.*squat\b/i,
    /\barcher.*pull.*up\b/i,
    /\bring.*support\b/i,
    /\bab.*wheel.*knee/i,
  ],

  // ADVANCED exercises
  ADVANCED: [
    /\badvanced.*tuck.*planche\b/i,
    /\bstraddle.*back.*lever\b/i,
    /\bstraddle.*front.*lever\b/i,
    /\bfull.*back.*lever\b/i,
    /\bfull.*front.*lever\b/i,
    /\bstraddle.*planche\b/i,
    /\bfreestanding.*handstand\b/i,
    /\bfree.*handstand\b/i,
    /\bpistol.*squat\b(?!.*weighted)/i,
    /\bone.*leg.*squat\b(?!.*weighted)/i,
    /\bstrict.*muscle.*up\b/i,
    /\bab.*wheel\b(?!.*knee)/i,
    /\bstanding.*ab.*wheel\b/i,
    /\bhandstand.*push.*up\b(?!.*ring)/i,
    /\bfreestanding.*handstand.*push/i,
    /\bring.*dip\b(?!.*rto)/i,
    /\b75.*deg.*v-sit\b/i,
    /\b100.*deg.*v-sit\b/i,
  ],

  // ELITE exercises (mastery level)
  ELITE: [
    /\bfull.*planche\b(?!.*tuck)/i,
    /\biron.*cross\b/i,
    /\bmaltese\b/i,
    /\bone.*arm.*pull.*up\b/i,
    /\bone.*arm.*chin.*up\b/i,
    /\bone.*arm.*handstand\b/i,
    /\bone.*arm.*push.*up\b/i,
    /\bone.*arm.*dip\b/i,
    /\bweighted.*one.*arm/i,
    /\bmanna\b/i,
    /\b120.*deg.*v-sit\b/i,
    /\bfront.*lever.*to.*inverted\b/i,
    /\bcircle.*front.*lever\b/i,
    /\bplanche.*push.*up\b/i,
    /\bfull.*planche.*push/i,
    /\brto.*90\b/i,
    /\bmaltese.*dip/i,
    /\bone.*arm.*ab.*wheel\b/i,
    /\b2x.*bw.*pistol\b/i,
    /\bweighted.*pistol.*squat\b/i,
    /\bfull.*flag\b/i,
    /\bhuman.*flag\b(?!.*tuck)/i,
  ],
};

// Process each exercise
exercises.forEach((exercise, index) => {
  const oldDifficulty = exercise.difficulty;
  let newDifficulty = oldDifficulty;

  // Step 1: Migrate old values to new system
  if (oldDifficulty === 'NOVICE') {
    newDifficulty = 'BEGINNER';
    migratedCount++;
  } else if (oldDifficulty === 'EXPERT') {
    newDifficulty = 'ELITE';
    migratedCount++;
  }

  // Step 2: Check for unrealistic difficulties based on exercise name/category
  const exerciseName = exercise.name.toLowerCase();
  const exerciseId = exercise.id.toLowerCase();
  const searchText = `${exerciseName} ${exerciseId}`;

  // Check each difficulty level rules
  for (const [targetDifficulty, patterns] of Object.entries(DIFFICULTY_RULES)) {
    for (const pattern of patterns) {
      if (pattern.test(searchText)) {
        // If current difficulty doesn't match the rule, correct it
        if (newDifficulty !== targetDifficulty) {
          console.log(`🔧 Correcting: "${exercise.name}"`);
          console.log(`   ${newDifficulty} → ${targetDifficulty} (matched pattern: ${pattern.source.substring(0, 50)}...)`);
          newDifficulty = targetDifficulty;
          correctedCount++;
          break;
        }
      }
    }
  }

  // Update the exercise
  exercise.difficulty = newDifficulty;
});

// Summary
console.log('\n✅ Migration Complete!');
console.log(`\n📈 Statistics:`);
console.log(`   - Migrated (NOVICE→BEGINNER, EXPERT→ELITE): ${migratedCount}`);
console.log(`   - Corrected (unrealistic difficulties): ${correctedCount}`);
console.log(`   - Total changes: ${migratedCount + correctedCount}`);

// New distribution
const newDistribution = {};
exercises.forEach(e => {
  newDistribution[e.difficulty] = (newDistribution[e.difficulty] || 0) + 1;
});

console.log(`\n📊 New Difficulty Distribution:`);
Object.entries(newDistribution)
  .sort((a, b) => {
    const order = { BEGINNER: 0, INTERMEDIATE: 1, ADVANCED: 2, ELITE: 3 };
    return order[a[0]] - order[b[0]];
  })
  .forEach(([difficulty, count]) => {
    console.log(`   ${difficulty}: ${count}`);
  });

// Save the updated exercises
fs.writeFileSync(EXERCISES_PATH, JSON.stringify(exercises, null, 2), 'utf-8');
console.log(`\n💾 Saved updated exercises to: ${EXERCISES_PATH}`);
console.log('\n🎉 Done!');
