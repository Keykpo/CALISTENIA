const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking database connection...');

  try {
    // Try to connect and run a simple query
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // Try to query users table
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count: ${userCount}`);

    console.log('\n✨ Database is ready to use!');
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.log('\n💡 The database will be created automatically when you first try to register a user.');
  } finally {
    await prisma.$disconnect();
  }
}

main();
