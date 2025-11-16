/**
 * MIGRATE EXERCISE DATABASE FORMAT
 *
 * Migrates old exercise format to new format:
 * - Moves form.breathing to root level breathing {pattern, tips}
 * - Adds primaryGoal based on category
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 MIGRATING EXERCISE DATABASE FORMAT\n');
console.log('='.repeat(100));

const dbPath = path.join(__dirname, '../apps/web/src/data/exercise-database.json');
let exerciseDB;

try {
  const rawData = fs.readFileSync(dbPath, 'utf8');
  exerciseDB = JSON.parse(rawData);
  console.log(`\n✅ Loaded: ${exerciseDB.exercises.length} exercises\n`);
} catch (error) {
  console.error('❌ ERROR:', error.message);
  process.exit(1);
}

// ==========================================
// MIGRATION LOGIC
// ==========================================

function getPrimaryGoalFromCategory(category, difficulty) {
  const goalMap = {
    'PUSH': 'STRENGTH',
    'PULL': 'STRENGTH',
    'LEGS': 'STRENGTH',
    'CORE': 'STRENGTH',
    'SKILL_STATIC': 'MASTERY',
    'SKILL_DYNAMIC': 'MASTERY',
    'BALANCE': 'MASTERY',
    'CARDIO': 'ENDURANCE'
  };

  return goalMap[category] || 'STRENGTH';
}

function migrateBreathing(exercise) {
  // If already has root-level breathing with pattern, skip
  if (exercise.breathing && exercise.breathing.pattern) {
    return exercise.breathing;
  }

  // If has form.breathing, migrate it
  if (exercise.form && exercise.form.breathing) {
    const oldBreathing = exercise.form.breathing;

    // Convert array format to object format
    if (Array.isArray(oldBreathing)) {
      return {
        pattern: oldBreathing.join(', '),
        tips: [
          `Mantén ritmo constante`,
          `No contengas la respiración`,
          `Exhalar en esfuerzo, inhalar en recuperación`
        ]
      };
    }

    return oldBreathing;
  }

  // Default breathing pattern based on category
  const category = exercise.category;
  if (category === 'PUSH' || category === 'PULL') {
    return {
      pattern: 'Inhalar en descenso/relajación, exhalar en esfuerzo',
      tips: [
        'Exhalar explosivamente en fase concéntrica',
        'Respiración controlada en excéntrica',
        'No contener respiración prolongadamente'
      ]
    };
  } else if (category === 'SKILL_STATIC') {
    return {
      pattern: 'Respiración superficial y controlada durante el hold',
      tips: [
        'Respiraciones cortas y shallow',
        'Mantener tensión corporal constante',
        'No contener completamente la respiración'
      ]
    };
  } else if (category === 'CORE') {
    return {
      pattern: 'Exhalar durante contracción, inhalar durante extensión',
      tips: [
        'Mantener presión intra-abdominal',
        'Respiración rítmica y controlada',
        'Exhalar en esfuerzo máximo'
      ]
    };
  }

  return {
    pattern: 'Respiración natural y controlada',
    tips: [
      'Mantén ritmo constante',
      'No contengas la respiración'
    ]
  };
}

// ==========================================
// PERFORM MIGRATION
// ==========================================

let migrated = 0;
let skipped = 0;

exerciseDB.exercises = exerciseDB.exercises.map(exercise => {
  let needsMigration = false;

  // Add primaryGoal if missing
  if (!exercise.primaryGoal) {
    exercise.primaryGoal = getPrimaryGoalFromCategory(exercise.category, exercise.difficulty);
    needsMigration = true;
  }

  // Migrate breathing
  const newBreathing = migrateBreathing(exercise);
  if (!exercise.breathing || !exercise.breathing.pattern) {
    exercise.breathing = newBreathing;
    needsMigration = true;

    // Remove form.breathing if it exists
    if (exercise.form && exercise.form.breathing) {
      delete exercise.form.breathing;
    }
  }

  if (needsMigration) {
    console.log(`✅ Migrated: ${exercise.name}`);
    migrated++;
  } else {
    skipped++;
  }

  return exercise;
});

// ==========================================
// SAVE UPDATED DATABASE
// ==========================================

console.log(`\n📊 Migration complete:`);
console.log(`   Migrated: ${migrated}`);
console.log(`   Skipped: ${skipped}`);

try {
  fs.writeFileSync(
    dbPath,
    JSON.stringify(exerciseDB, null, 2),
    'utf8'
  );
  console.log(`\n✅ Saved updated database to: ${dbPath}\n`);
} catch (error) {
  console.error(`\n❌ Error saving database: ${error.message}\n`);
  process.exit(1);
}

console.log('='.repeat(100) + '\n');
console.log('💡 Next step: Run validation again');
console.log('   node scripts/test-real-generator.js\n');
