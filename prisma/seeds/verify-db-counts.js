const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('DATABASE_URL =', process.env.DATABASE_URL);

    // List tables to diagnose schema state
    const tables = await prisma.$queryRawUnsafe(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
    );
    console.log('Tables in dev.db:', tables.map(t => t.name));

    const skills = await prisma.skill.count();
    const achievements = await prisma.achievement.count();
    const prerequisites = await prisma.skillPrerequisite.count();

    console.log('Skills:', skills);
    console.log('Achievements:', achievements);
    console.log('Prerequisites:', prerequisites);

    const sampleSkills = await prisma.skill.findMany({
      take: 5,
      orderBy: { id: 'asc' },
      select: { id: true, name: true, branch: true },
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
