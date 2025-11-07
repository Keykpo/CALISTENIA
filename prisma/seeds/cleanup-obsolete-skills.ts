import { PrismaClient } from '@prisma/client';
import { skillsFromExercises } from './skills-from-exercises-en';

const prisma = new PrismaClient();

async function main() {
  console.log('ðŸ§¹ Starting cleanup of obsolete skills...');

  const keepNames = new Set(skillsFromExercises.map(s => s.name));
  const allSkills = await prisma.skill.findMany({ select: { id: true, name: true } });
  const obsolete = allSkills.filter(s => !keepNames.has(s.name));

  console.log(`Total skills in DB: ${allSkills.length}`);
  console.log(`Skills to keep: ${keepNames.size}`);
  console.log(`Obsolete skills to delete: ${obsolete.length}`);

  let deleted = 0;
  for (const s of obsolete) {
    try {
      await prisma.skill.delete({ where: { id: s.id } });
      deleted++;
      console.log(`  âœ“ Deleted: ${s.name}`);
    } catch (e) {
      console.error(`  âœ— Failed to delete ${s.name}:`, e);
    }
  }

  console.log(`\nâœ… Cleanup complete. Deleted ${deleted} obsolete skills.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });