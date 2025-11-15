/**
 * Fix Invalid Exercise Categories in Database
 *
 * This script finds and fixes exercises with invalid categories
 * that don't match the Prisma schema enums
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Valid categories from Prisma schema
const VALID_CATEGORIES = [
  'PUSH', 'PULL', 'CORE', 'SKILL_STATIC', 'LEGS', 'CARDIO',
  'BALANCE', 'MOBILITY', 'FLEXIBILITY', 'WARM_UP', 'COOL_DOWN'
];

// Category mapping for common invalid values
const CATEGORY_MAPPING = {
  'STRENGTH': 'PUSH', // Default strength exercises to PUSH
  'UPPER_BODY': 'PUSH',
  'LOWER_BODY': 'LEGS',
  'ABS': 'CORE',
  'STRETCHING': 'FLEXIBILITY'
};

async function fixInvalidCategories() {
  console.log('🔧 Starting category fix...\n');

  try {
    // Get all exercises (using $queryRawUnsafe to bypass Prisma enum validation)
    const exercises = await prisma.$queryRaw`SELECT * FROM exercises`;

    console.log(`📊 Found ${exercises.length} exercises in database\n`);

    let fixedCount = 0;
    const invalidExercises = [];

    for (const exercise of exercises) {
      const category = exercise.category;

      // Check if category is valid
      if (!VALID_CATEGORIES.includes(category)) {
        invalidExercises.push({
          id: exercise.id,
          name: exercise.name,
          oldCategory: category
        });

        // Determine new category
        let newCategory = CATEGORY_MAPPING[category] || 'PUSH'; // Default to PUSH

        console.log(`🔄 [${exercise.id}] ${exercise.name}`);
        console.log(`   ${category} → ${newCategory}`);

        // Update using raw SQL to bypass Prisma validation
        await prisma.$executeRaw`
          UPDATE exercises
          SET category = ${newCategory}
          WHERE id = ${exercise.id}
        `;

        fixedCount++;
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} exercises with invalid categories`);

    if (fixedCount === 0) {
      console.log('\n✨ No invalid categories found. Database is clean!');
    } else {
      console.log('\n📋 Summary of fixes:');
      const categoryChanges = {};
      invalidExercises.forEach(ex => {
        const change = `${ex.oldCategory} → ${CATEGORY_MAPPING[ex.oldCategory] || 'PUSH'}`;
        categoryChanges[change] = (categoryChanges[change] || 0) + 1;
      });

      Object.entries(categoryChanges).forEach(([change, count]) => {
        console.log(`  ${change}: ${count} exercises`);
      });
    }

  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixInvalidCategories()
  .then(() => {
    console.log('\n✅ Category fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
