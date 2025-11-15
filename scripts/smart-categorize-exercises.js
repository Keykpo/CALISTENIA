/**
 * Smart Exercise Categorization
 *
 * Intelligently categorizes exercises based on their names
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Smart categorization rules based on exercise names
const CATEGORIZATION_RULES = {
  // Static Skills
  SKILL_STATIC: [
    'planche', 'lever', 'l-sit', 'v-sit', 'frog stand', 'front lever',
    'back lever', 'tuck front', 'tuck back', 'straddle front', 'straddle back',
    'full front', 'full back', 'straddle planche', 'full planche',
    'tuck planche', 'advanced tuck', 'frog planche'
  ],

  // Pull exercises
  PULL: [
    'pull-up', 'pull up', 'pullup', 'chin-up', 'chin up', 'chinup',
    'row', 'muscle-up', 'muscle up'
  ],

  // Push exercises
  PUSH: [
    'push-up', 'push up', 'pushup', 'dip', 'dips', 'handstand push'
  ],

  // Legs
  LEGS: [
    'squat', 'lunge', 'pistol', 'leg'
  ],

  // Core
  CORE: [
    'core', 'ab', 'crunch', 'sit-up'
  ]
};

function determineCategory(exerciseName) {
  const nameLower = exerciseName.toLowerCase();

  // Check each category's keywords
  for (const [category, keywords] of Object.entries(CATEGORIZATION_RULES)) {
    if (keywords.some(keyword => nameLower.includes(keyword))) {
      return category;
    }
  }

  // Default to PUSH if no match found
  return 'PUSH';
}

async function smartCategorize() {
  console.log('🧠 Starting smart categorization...\n');

  try {
    // Get all exercises with PUSH category (the ones we just set)
    const exercises = await prisma.$queryRaw`
      SELECT id, name, category FROM exercises WHERE category = 'PUSH'
    `;

    console.log(`📊 Found ${exercises.length} exercises to recategorize\n`);

    let changedCount = 0;
    const changes = {};

    for (const exercise of exercises) {
      const newCategory = determineCategory(exercise.name);

      if (newCategory !== 'PUSH') {
        console.log(`🔄 [${exercise.id.substring(0, 8)}...] ${exercise.name}`);
        console.log(`   PUSH → ${newCategory}`);

        await prisma.$executeRaw`
          UPDATE exercises
          SET category = ${newCategory}
          WHERE id = ${exercise.id}
        `;

        changes[newCategory] = (changes[newCategory] || 0) + 1;
        changedCount++;
      }
    }

    console.log(`\n✅ Recategorized ${changedCount} exercises`);

    if (changedCount > 0) {
      console.log('\n📊 New category distribution:');
      Object.entries(changes).sort().forEach(([category, count]) => {
        console.log(`  ${category.padEnd(15)}: ${count} exercises`);
      });
    }

    // Show final counts
    console.log('\n📈 Final category counts:');
    const finalCounts = await prisma.$queryRaw`
      SELECT category, COUNT(*) as count
      FROM exercises
      GROUP BY category
      ORDER BY count DESC
    `;

    finalCounts.forEach(row => {
      console.log(`  ${row.category.padEnd(15)}: ${row.count}`);
    });

  } catch (error) {
    console.error('❌ Smart categorization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

smartCategorize()
  .then(() => {
    console.log('\n✅ Smart categorization completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
