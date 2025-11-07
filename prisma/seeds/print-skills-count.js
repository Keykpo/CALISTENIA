const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const skills = await prisma.skill.count();
    console.log('Skills:', skills);
  } finally {
    await prisma.$disconnect();
  }
})();
