const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const skills = await prisma.skill.count();
    const achievements = await prisma.achievement.count();
    const prerequisites = await prisma.skillPrerequisite.count();

    console.log('Skills:', skills);
    console.log('Achievements:', achievements);
    console.log('Prerequisites:', prerequisites);

    const sampleSkills = await prisma.skill.findMany({
      take: 5,
      orderBy: { id: 'asc' },
      select: { id: true, name: true },
    });
    console.log('Sample skills:', sampleSkills);
  } catch (e) {
    console.error('Error:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
