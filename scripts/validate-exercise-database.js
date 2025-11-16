/**
 * EXERCISE DATABASE VALIDATION SCRIPT
 *
 * Validates:
 * 1. All simulated exercises exist in database
 * 2. Difficulty levels match tier requirements
 * 3. Required categories are present for each tier
 * 4. No missing progressions
 */

const fs = require('fs');
const path = require('path');

console.log('\n📋 EXERCISE DATABASE VALIDATION\n');
console.log('='.repeat(100));

// Load exercise database
const dbPath = path.join(__dirname, '../apps/web/src/data/exercise-database.json');
let exerciseDB;

try {
  const rawData = fs.readFileSync(dbPath, 'utf8');
  exerciseDB = JSON.parse(rawData);
  console.log(`\n✅ Loaded exercise database: ${exerciseDB.exercises.length} exercises`);
  console.log(`   Version: ${exerciseDB.version}`);
  console.log(`   Last Updated: ${exerciseDB.lastUpdated}\n`);
} catch (error) {
  console.error('❌ ERROR: Could not load exercise database:', error.message);
  process.exit(1);
}

// ==========================================
// REQUIRED EXERCISES BY TIER
// ==========================================

const REQUIRED_EXERCISES_BY_TIER = {
  D: {
    tier: 'BEGINNER',
    requiredExercises: [
      { name: 'Assisted Pull-ups', category: 'PULL', searchTerms: ['assisted pull', 'band pull'] },
      { name: 'Regular Push-ups', category: 'PUSH', searchTerms: ['regular push', 'push-up', 'pushup'] },
      { name: 'Incline Push-ups', category: 'PUSH', searchTerms: ['incline push'] },
      { name: 'Bodyweight Squats', category: 'LEGS', searchTerms: ['bodyweight squat', 'air squat', 'squat'] },
      { name: 'Incline Rows', category: 'PULL', searchTerms: ['incline row', 'horizontal row'] },
      { name: 'Plank Hold', category: 'CORE', searchTerms: ['plank'] },
    ],
  },
  C: {
    tier: 'NOVICE',
    requiredExercises: [
      { name: 'Pull-ups', category: 'PULL', searchTerms: ['pull-up', 'pullup'] },
      { name: 'Diamond Push-ups', category: 'PUSH', searchTerms: ['diamond push'] },
      { name: 'Pike Push-ups', category: 'PUSH', searchTerms: ['pike push'] },
      { name: 'Horizontal Rows', category: 'PULL', searchTerms: ['horizontal row', 'inverted row'] },
      { name: 'L-sit Progressions', category: 'CORE', searchTerms: ['l-sit', 'l sit', 'tuck l-sit'] },
      { name: 'Dips', category: 'PUSH', searchTerms: ['dip', 'parallel bar dip'] },
    ],
  },
  B: {
    tier: 'INTERMEDIATE',
    requiredExercises: [
      { name: 'Weighted Pull-ups', category: 'PULL', searchTerms: ['weighted pull'] },
      { name: 'Weighted Dips', category: 'PUSH', searchTerms: ['weighted dip'] },
      { name: 'Archer Push-ups', category: 'PUSH', searchTerms: ['archer push'] },
      { name: 'Tuck Planche', category: 'SKILL_STATIC', searchTerms: ['tuck planche'] },
      { name: 'Front Lever Tuck', category: 'SKILL_STATIC', searchTerms: ['tuck front lever', 'front lever tuck'] },
      { name: 'Pistol Squat Progressions', category: 'LEGS', searchTerms: ['pistol squat'] },
      { name: 'Handstand Hold', category: 'BALANCE', searchTerms: ['handstand hold', 'wall handstand'] },
    ],
  },
  A: {
    tier: 'ADVANCED',
    requiredExercises: [
      { name: 'Advanced Tuck Planche', category: 'SKILL_STATIC', searchTerms: ['advanced tuck planche', 'adv tuck planche'] },
      { name: 'Front Lever', category: 'SKILL_STATIC', searchTerms: ['front lever'] },
      { name: 'One-Arm Push-up Progressions', category: 'PUSH', searchTerms: ['one arm push', 'one-arm push'] },
      { name: 'Dragon Flags', category: 'CORE', searchTerms: ['dragon flag'] },
      { name: 'Handstand Push-ups', category: 'PUSH', searchTerms: ['handstand push-up', 'hspu'] },
      { name: 'Muscle-ups', category: 'PULL', searchTerms: ['muscle-up', 'muscle up'] },
    ],
  },
  S: {
    tier: 'ELITE',
    requiredExercises: [
      { name: 'Full Planche', category: 'SKILL_STATIC', searchTerms: ['full planche', 'planche hold'] },
      { name: 'One-Arm Pull-ups', category: 'PULL', searchTerms: ['one arm pull-up', 'one-arm pull'] },
      { name: 'Maltese', category: 'SKILL_STATIC', searchTerms: ['maltese'] },
      { name: 'Human Flag', category: 'SKILL_STATIC', searchTerms: ['human flag', 'flag hold'] },
      { name: 'Iron Cross', category: 'SKILL_STATIC', searchTerms: ['iron cross'] },
      { name: 'Freestanding HSPU', category: 'PUSH', searchTerms: ['freestanding handstand push', 'free hspu'] },
    ],
  },
};

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

function searchExercise(searchTerms, category = null) {
  return exerciseDB.exercises.find(ex => {
    const nameMatch = searchTerms.some(term =>
      ex.name.toLowerCase().includes(term.toLowerCase())
    );

    const categoryMatch = category ? ex.category === category : true;

    return nameMatch && categoryMatch;
  });
}

function validateTierExercises(tier, requiredExercises) {
  const results = {
    tier,
    found: [],
    missing: [],
    wrongDifficulty: [],
  };

  requiredExercises.forEach(req => {
    const exercise = searchExercise(req.searchTerms, req.category);

    if (exercise) {
      results.found.push({
        name: req.name,
        actualName: exercise.name,
        difficulty: exercise.difficulty,
        category: exercise.category,
      });

      // Check if difficulty matches tier (rough validation)
      const expectedDifficulty = tier === 'D' ? 'BEGINNER' :
                                tier === 'C' ? ['BEGINNER', 'INTERMEDIATE'] :
                                tier === 'B' ? 'INTERMEDIATE' :
                                tier === 'A' ? 'ADVANCED' : 'ELITE';

      if (Array.isArray(expectedDifficulty)) {
        if (!expectedDifficulty.includes(exercise.difficulty)) {
          results.wrongDifficulty.push({
            name: exercise.name,
            expected: expectedDifficulty.join(' or '),
            actual: exercise.difficulty,
          });
        }
      } else {
        if (exercise.difficulty !== expectedDifficulty &&
            !(tier === 'S' && exercise.difficulty === 'ADVANCED')) {
          results.wrongDifficulty.push({
            name: exercise.name,
            expected: expectedDifficulty,
            actual: exercise.difficulty,
          });
        }
      }
    } else {
      results.missing.push(req.name);
    }
  });

  return results;
}

// ==========================================
// RUN VALIDATION
// ==========================================

console.log('\n🔍 VALIDATING REQUIRED EXERCISES BY TIER\n');

let totalFound = 0;
let totalMissing = 0;
let totalWrongDifficulty = 0;

Object.entries(REQUIRED_EXERCISES_BY_TIER).forEach(([tier, data]) => {
  console.log(`\n🏆 TIER ${tier} (${data.tier}):`);
  console.log('-'.repeat(100));

  const results = validateTierExercises(tier, data.requiredExercises);

  console.log(`\n  ✅ Found: ${results.found.length}/${data.requiredExercises.length}`);
  results.found.forEach(ex => {
    console.log(`     • ${ex.actualName} (${ex.difficulty}, ${ex.category})`);
  });

  if (results.missing.length > 0) {
    console.log(`\n  ❌ Missing: ${results.missing.length}`);
    results.missing.forEach(name => {
      console.log(`     • ${name}`);
    });
  }

  if (results.wrongDifficulty.length > 0) {
    console.log(`\n  ⚠️  Wrong Difficulty: ${results.wrongDifficulty.length}`);
    results.wrongDifficulty.forEach(ex => {
      console.log(`     • ${ex.name}: Expected ${ex.expected}, Got ${ex.actual}`);
    });
  }

  totalFound += results.found.length;
  totalMissing += results.missing.length;
  totalWrongDifficulty += results.wrongDifficulty.length;
});

// ==========================================
// CATEGORY DISTRIBUTION
// ==========================================

console.log('\n\n📊 CATEGORY DISTRIBUTION\n');
console.log('-'.repeat(100));

const categoryCount = {};
exerciseDB.exercises.forEach(ex => {
  categoryCount[ex.category] = (categoryCount[ex.category] || 0) + 1;
});

Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  const bar = '█'.repeat(Math.floor(count / 2));
  console.log(`  ${cat.padEnd(20)} | ${String(count).padStart(3)} | ${bar}`);
});

// ==========================================
// DIFFICULTY DISTRIBUTION
// ==========================================

console.log('\n\n📈 DIFFICULTY DISTRIBUTION\n');
console.log('-'.repeat(100));

const difficultyCount = {
  BEGINNER: 0,
  INTERMEDIATE: 0,
  ADVANCED: 0,
  ELITE: 0,
};

exerciseDB.exercises.forEach(ex => {
  if (difficultyCount.hasOwnProperty(ex.difficulty)) {
    difficultyCount[ex.difficulty]++;
  }
});

Object.entries(difficultyCount).forEach(([diff, count]) => {
  const percentage = ((count / exerciseDB.exercises.length) * 100).toFixed(1);
  const bar = '█'.repeat(Math.floor(count / 3));
  console.log(`  ${diff.padEnd(15)} | ${String(count).padStart(3)} (${String(percentage).padStart(5)}%) | ${bar}`);
});

// ==========================================
// SUMMARY
// ==========================================

console.log('\n\n' + '='.repeat(100));
console.log('\n📋 VALIDATION SUMMARY\n');

const totalRequired = Object.values(REQUIRED_EXERCISES_BY_TIER)
  .reduce((sum, tier) => sum + tier.requiredExercises.length, 0);

console.log(`Total Required Exercises: ${totalRequired}`);
console.log(`  ✅ Found: ${totalFound} (${((totalFound/totalRequired)*100).toFixed(1)}%)`);
console.log(`  ❌ Missing: ${totalMissing} (${((totalMissing/totalRequired)*100).toFixed(1)}%)`);
console.log(`  ⚠️  Wrong Difficulty: ${totalWrongDifficulty} (${((totalWrongDifficulty/totalRequired)*100).toFixed(1)}%)`);

console.log(`\nTotal Exercises in Database: ${exerciseDB.exercises.length}`);
console.log(`  Coverage: ${((totalFound/totalRequired)*100).toFixed(1)}% of required exercises`);

// ==========================================
// FINAL VERDICT
// ==========================================

console.log('\n' + '='.repeat(100));

if (totalMissing === 0 && totalWrongDifficulty === 0) {
  console.log('\n✅ VALIDATION PASSED - All required exercises found with correct difficulties!\n');
} else if (totalMissing === 0 && totalWrongDifficulty > 0) {
  console.log('\n⚠️  VALIDATION WARNING - All exercises found but some have incorrect difficulties\n');
} else {
  console.log('\n❌ VALIDATION FAILED - Missing required exercises\n');
  console.log('💡 RECOMMENDATIONS:');
  console.log('   1. Add missing exercises to exercise-database.json');
  console.log('   2. Verify difficulty levels match tier requirements');
  console.log('   3. Re-run validation after updates\n');
}

console.log('='.repeat(100) + '\n');
