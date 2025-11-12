import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAchievements() {
  console.log('🏆 Seeding achievements...');

  // Limpiar achievements existentes
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();

  // ================================
  // ACHIEVEMENT CHAINS
  // ================================

  /**
   * CHAIN 1: Push-Up Master
   * Focus: Push-up exercises
   */
  const pushUpChain = [
    {
      key: 'PUSHUP_BEGINNER',
      name: 'Push-Up Initiate',
      description: 'Complete 50 push-ups in total',
      category: 'PUSH',
      type: 'EXERCISE_MASTERY',
      requiredCount: 50,
      rewardXP: 300,
      rewardCoins: 30,
      rarity: 'NOVICE',
      level: 1,
      chainName: 'Push-Up Master',
      icon: '💪',
    },
    {
      key: 'PUSHUP_INTERMEDIATE',
      name: 'Push-Up Enthusiast',
      description: 'Complete 200 push-ups in total',
      category: 'PUSH',
      type: 'EXERCISE_MASTERY',
      requiredCount: 200,
      rewardXP: 600,
      rewardCoins: 60,
      rarity: 'INTERMEDIATE',
      level: 2,
      chainName: 'Push-Up Master',
      icon: '💪',
    },
    {
      key: 'PUSHUP_ADVANCED',
      name: 'Push-Up Expert',
      description: 'Complete 500 push-ups in total',
      category: 'PUSH',
      type: 'EXERCISE_MASTERY',
      requiredCount: 500,
      rewardXP: 1000,
      rewardCoins: 100,
      rarity: 'ADVANCED',
      level: 3,
      chainName: 'Push-Up Master',
      icon: '💪',
    },
    {
      key: 'PUSHUP_MASTER',
      name: 'Push-Up Master',
      description: 'Complete 1000 push-ups in total',
      category: 'PUSH',
      type: 'EXERCISE_MASTERY',
      requiredCount: 1000,
      rewardXP: 2000,
      rewardCoins: 200,
      rarity: 'ELITE',
      level: 4,
      chainName: 'Push-Up Master',
      icon: '💪',
    },
    {
      key: 'PUSHUP_LEGEND',
      name: 'Push-Up Legend',
      description: 'Complete 2500 push-ups in total',
      category: 'PUSH',
      type: 'EXERCISE_MASTERY',
      requiredCount: 2500,
      rewardXP: 5000,
      rewardCoins: 500,
      rarity: 'ELITE',
      level: 5,
      chainName: 'Push-Up Master',
      icon: '💪',
    },
  ];

  /**
   * CHAIN 2: Pull-Up Warrior
   * Focus: Pull-up exercises
   */
  const pullUpChain = [
    {
      key: 'PULLUP_BEGINNER',
      name: 'Pull-Up Starter',
      description: 'Complete 25 pull-ups in total',
      category: 'PULL',
      type: 'EXERCISE_MASTERY',
      requiredCount: 25,
      rewardXP: 400,
      rewardCoins: 40,
      rarity: 'NOVICE',
      level: 1,
      chainName: 'Pull-Up Warrior',
      icon: '🏋️',
    },
    {
      key: 'PULLUP_INTERMEDIATE',
      name: 'Pull-Up Practitioner',
      description: 'Complete 100 pull-ups in total',
      category: 'PULL',
      type: 'EXERCISE_MASTERY',
      requiredCount: 100,
      rewardXP: 800,
      rewardCoins: 80,
      rarity: 'INTERMEDIATE',
      level: 2,
      chainName: 'Pull-Up Warrior',
      icon: '🏋️',
    },
    {
      key: 'PULLUP_ADVANCED',
      name: 'Pull-Up Champion',
      description: 'Complete 300 pull-ups in total',
      category: 'PULL',
      type: 'EXERCISE_MASTERY',
      requiredCount: 300,
      rewardXP: 1500,
      rewardCoins: 150,
      rarity: 'ADVANCED',
      level: 3,
      chainName: 'Pull-Up Warrior',
      icon: '🏋️',
    },
    {
      key: 'PULLUP_MASTER',
      name: 'Pull-Up Warrior',
      description: 'Complete 750 pull-ups in total',
      category: 'PULL',
      type: 'EXERCISE_MASTERY',
      requiredCount: 750,
      rewardXP: 3000,
      rewardCoins: 300,
      rarity: 'ELITE',
      level: 4,
      chainName: 'Pull-Up Warrior',
      icon: '🏋️',
    },
  ];

  /**
   * CHAIN 3: Core Champion
   * Focus: Core exercises
   */
  const coreChain = [
    {
      key: 'CORE_BEGINNER',
      name: 'Core Awakening',
      description: 'Hold plank for 3 minutes total',
      category: 'CORE',
      type: 'EXERCISE_MASTERY',
      requiredCount: 180, // seconds
      rewardXP: 250,
      rewardCoins: 25,
      rarity: 'NOVICE',
      level: 1,
      chainName: 'Core Champion',
      icon: '🔥',
    },
    {
      key: 'CORE_INTERMEDIATE',
      name: 'Core Builder',
      description: 'Hold plank for 10 minutes total',
      category: 'CORE',
      type: 'EXERCISE_MASTERY',
      requiredCount: 600,
      rewardXP: 500,
      rewardCoins: 50,
      rarity: 'INTERMEDIATE',
      level: 2,
      chainName: 'Core Champion',
      icon: '🔥',
    },
    {
      key: 'CORE_ADVANCED',
      name: 'Core Champion',
      description: 'Hold plank for 30 minutes total',
      category: 'CORE',
      type: 'EXERCISE_MASTERY',
      requiredCount: 1800,
      rewardXP: 1200,
      rewardCoins: 120,
      rarity: 'ADVANCED',
      level: 3,
      chainName: 'Core Champion',
      icon: '🔥',
    },
  ];

  /**
   * CHAIN 4: Workout Consistency
   * Focus: Total workouts completed
   */
  const workoutChain = [
    {
      key: 'WORKOUT_BEGINNER',
      name: 'First Steps',
      description: 'Complete 5 workout sessions',
      category: 'CONSISTENCY',
      type: 'WORKOUT_COUNT',
      requiredCount: 5,
      rewardXP: 300,
      rewardCoins: 30,
      rarity: 'NOVICE',
      level: 1,
      chainName: 'Workout Consistency',
      icon: '🎯',
    },
    {
      key: 'WORKOUT_INTERMEDIATE',
      name: 'Building Habits',
      description: 'Complete 25 workout sessions',
      category: 'CONSISTENCY',
      type: 'WORKOUT_COUNT',
      requiredCount: 25,
      rewardXP: 700,
      rewardCoins: 70,
      rarity: 'INTERMEDIATE',
      level: 2,
      chainName: 'Workout Consistency',
      icon: '🎯',
    },
    {
      key: 'WORKOUT_ADVANCED',
      name: 'Dedicated Athlete',
      description: 'Complete 50 workout sessions',
      category: 'CONSISTENCY',
      type: 'WORKOUT_COUNT',
      requiredCount: 50,
      rewardXP: 1500,
      rewardCoins: 150,
      rarity: 'ADVANCED',
      level: 3,
      chainName: 'Workout Consistency',
      icon: '🎯',
    },
    {
      key: 'WORKOUT_EXPERT',
      name: 'Training Master',
      description: 'Complete 100 workout sessions',
      category: 'CONSISTENCY',
      type: 'WORKOUT_COUNT',
      requiredCount: 100,
      rewardXP: 3000,
      rewardCoins: 300,
      rarity: 'ELITE',
      level: 4,
      chainName: 'Workout Consistency',
      icon: '🎯',
    },
    {
      key: 'WORKOUT_LEGEND',
      name: 'Lifetime Athlete',
      description: 'Complete 250 workout sessions',
      category: 'CONSISTENCY',
      type: 'WORKOUT_COUNT',
      requiredCount: 250,
      rewardXP: 7500,
      rewardCoins: 750,
      rarity: 'ELITE',
      level: 5,
      chainName: 'Workout Consistency',
      icon: '🎯',
    },
  ];

  /**
   * CHAIN 5: XP Collector
   * Focus: Total XP earned
   */
  const xpChain = [
    {
      key: 'XP_BEGINNER',
      name: 'XP Collector',
      description: 'Earn 5,000 total XP',
      category: 'XP',
      type: 'PROGRESS_MILESTONE',
      requiredCount: 5000,
      rewardXP: 500,
      rewardCoins: 50,
      rarity: 'NOVICE',
      level: 1,
      chainName: 'XP Collector',
      icon: '⭐',
    },
    {
      key: 'XP_INTERMEDIATE',
      name: 'XP Hunter',
      description: 'Earn 25,000 total XP',
      category: 'XP',
      type: 'PROGRESS_MILESTONE',
      requiredCount: 25000,
      rewardXP: 1000,
      rewardCoins: 100,
      rarity: 'INTERMEDIATE',
      level: 2,
      chainName: 'XP Collector',
      icon: '⭐',
    },
    {
      key: 'XP_ADVANCED',
      name: 'XP Master',
      description: 'Earn 100,000 total XP',
      category: 'XP',
      type: 'PROGRESS_MILESTONE',
      requiredCount: 100000,
      rewardXP: 2500,
      rewardCoins: 250,
      rarity: 'ADVANCED',
      level: 3,
      chainName: 'XP Collector',
      icon: '⭐',
    },
    {
      key: 'XP_EXPERT',
      name: 'XP Champion',
      description: 'Earn 250,000 total XP',
      category: 'XP',
      type: 'PROGRESS_MILESTONE',
      requiredCount: 250000,
      rewardXP: 5000,
      rewardCoins: 500,
      rarity: 'ELITE',
      level: 4,
      chainName: 'XP Collector',
      icon: '⭐',
    },
  ];

  /**
   * CHAIN 6: Balance Master
   * Focus: Balance exercises
   */
  const balanceChain = [
    {
      key: 'BALANCE_BEGINNER',
      name: 'Finding Balance',
      description: 'Hold handstand for 1 minute total',
      category: 'BALANCE',
      type: 'EXERCISE_MASTERY',
      requiredCount: 60,
      rewardXP: 400,
      rewardCoins: 40,
      rarity: 'NOVICE',
      level: 1,
      chainName: 'Balance Master',
      icon: '🤸',
    },
    {
      key: 'BALANCE_INTERMEDIATE',
      name: 'Balance Practitioner',
      description: 'Hold handstand for 5 minutes total',
      category: 'BALANCE',
      type: 'EXERCISE_MASTERY',
      requiredCount: 300,
      rewardXP: 900,
      rewardCoins: 90,
      rarity: 'INTERMEDIATE',
      level: 2,
      chainName: 'Balance Master',
      icon: '🤸',
    },
    {
      key: 'BALANCE_ADVANCED',
      name: 'Balance Master',
      description: 'Hold handstand for 15 minutes total',
      category: 'BALANCE',
      type: 'EXERCISE_MASTERY',
      requiredCount: 900,
      rewardXP: 2000,
      rewardCoins: 200,
      rarity: 'ADVANCED',
      level: 3,
      chainName: 'Balance Master',
      icon: '🤸',
    },
  ];

  // Combine all chains
  const allAchievements = [
    ...pushUpChain,
    ...pullUpChain,
    ...coreChain,
    ...workoutChain,
    ...xpChain,
    ...balanceChain,
  ];

  // Create achievements
  for (const achievement of allAchievements) {
    const { key, category, requiredCount, rewardXP, rewardCoins, icon, ...rest } = achievement;
    await prisma.achievement.create({
      data: {
        name: rest.name,
        description: rest.description,
        type: rest.type,
        target: requiredCount,
        level: rest.level,
        chainName: rest.chainName,
        iconUrl: icon,
        points: rewardXP,
        rarity: rest.rarity,
      },
    });
  }

  console.log(`✅ Created ${allAchievements.length} achievements in ${new Set(allAchievements.map(a => a.chainName)).size} chains`);
  console.log('Achievement chains:');
  [...new Set(allAchievements.map(a => a.chainName))].forEach(chain => {
    const count = allAchievements.filter(a => a.chainName === chain).length;
    console.log(`  - ${chain}: ${count} levels`);
  });
}

async function main() {
  await seedAchievements();
  console.log('🎉 Achievement seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding achievements:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
