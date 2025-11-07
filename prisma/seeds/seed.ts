import { PrismaClient } from '@prisma/client';
import { skillsFromExercises, skillCounts } from './skills-from-exercises';
import { allAchievements } from './achievements-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // ==========================================
    // SEED SKILLS
    // ==========================================
    console.log('📚 Seeding skills from exercises...');
    console.log(`Total skills to seed: ${skillCounts.total}`);
    console.log(`  - Advanced: ${skillCounts.advanced}`);
    console.log(`  - Expert: ${skillCounts.expert}`);
    console.log('By branch:');
    skillCounts.byBranch.forEach(({ branch, count }) => {
      console.log(`  - ${branch}: ${count}`);
    });
    console.log('');

    // Step 1: Create all skills without prerequisites first
    console.log('Creating skills...');
    const createdSkills: Record<string, string> = {}; // Map skill name to ID

    for (const skillData of skillsFromExercises) {
      const { prerequisiteNames, ...skillDataWithoutPrereqs } = skillData;

      try {
        const skill = await prisma.skill.upsert({
          where: { name: skillData.name },
          update: skillDataWithoutPrereqs,
          create: skillDataWithoutPrereqs,
        });

        createdSkills[skill.name] = skill.id;
        console.log(`  ✓ ${skill.name} (${skill.branch}, ${skill.difficulty})`);
      } catch (error) {
        console.error(`  ✗ Failed to create skill: ${skillData.name}`, error);
      }
    }

    console.log(`\n✅ Created ${Object.keys(createdSkills).length} skills\n`);

    // Step 2: Create prerequisite relationships
    console.log('Creating prerequisite relationships...');
    let prerequisiteCount = 0;

    for (const skillData of skillsFromExercises) {
      if (!skillData.prerequisiteNames || skillData.prerequisiteNames.length === 0) {
        continue;
      }

      const skillId = createdSkills[skillData.name];
      if (!skillId) {
        console.warn(`  ⚠ Skill not found: ${skillData.name}`);
        continue;
      }

      for (const prereqName of skillData.prerequisiteNames) {
        const prereqId = createdSkills[prereqName];

        if (!prereqId) {
          console.warn(`  ⚠ Prerequisite not found: ${prereqName} for ${skillData.name}`);
          continue;
        }

        try {
          await prisma.skillPrerequisite.upsert({
            where: {
              skillId_prerequisiteId: {
                skillId,
                prerequisiteId: prereqId,
              },
            },
            update: {},
            create: {
              skillId,
              prerequisiteId: prereqId,
            },
          });

          prerequisiteCount++;
          console.log(`  ✓ ${skillData.name} → ${prereqName}`);
        } catch (error) {
          console.error(`  ✗ Failed to create prerequisite: ${skillData.name} → ${prereqName}`, error);
        }
      }
    }

    console.log(`\n✅ Created ${prerequisiteCount} prerequisite relationships\n`);

    // ==========================================
    // SEED ACHIEVEMENTS
    // ==========================================
    console.log('🏆 Seeding achievements...');

    let achievementCount = 0;
    for (const achievementData of allAchievements) {
      try {
        await prisma.achievement.upsert({
          where: { name: achievementData.name },
          update: achievementData,
          create: achievementData,
        });

        achievementCount++;
        console.log(`  ✓ ${achievementData.name} (${achievementData.rarity})`);
      } catch (error) {
        console.error(`  ✗ Failed to create achievement: ${achievementData.name}`, error);
      }
    }

    console.log(`\n✅ Created ${achievementCount} achievements\n`);

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('📊 Seeding Summary:');
    console.log(`  Skills: ${Object.keys(createdSkills).length}`);
    console.log(`  Prerequisites: ${prerequisiteCount}`);
    console.log(`  Achievements: ${achievementCount}`);
    console.log('\n✨ Database seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

