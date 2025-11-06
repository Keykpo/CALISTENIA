import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔎 Listing exercises with rank S to split into A/S...');

  const elite = await prisma.exercise.findMany({
    where: { rank: 'S' as any },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, description: true, difficulty: true, category: true }
  });

  const output = elite.map(e => ({
    id: e.id,
    name: e.name,
    difficulty: e.difficulty,
    category: e.category,
    proposed: 'A' // change to 'S' for truly elite after manual review
  }));

  console.log(JSON.stringify({ count: output.length, candidates: output }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});