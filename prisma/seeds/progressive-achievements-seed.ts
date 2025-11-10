/**
 * Progressive Achievements Seed
 * Sistema de logros progresivos alineado con FIG
 *
 * Cada achievement tiene 4 tiers: BEGINNER → INTERMEDIATE → ADVANCED → ELITE
 * El progreso es ACUMULATIVO y nunca se reinicia
 */

import { PrismaClient, AchievementCategory, AchievementType, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

interface TierConfig {
  tier: number;
  name: string;
  level: Difficulty;
  target: number;
  xpReward: number;
  coinsReward: number;
  color: string;
}

// Standard FIG tier configuration with colors
const STANDARD_TIERS: TierConfig[] = [
  {
    tier: 1,
    name: 'Beginner',
    level: 'BEGINNER',
    target: 0, // Overridden by achievement
    xpReward: 100,
    coinsReward: 50,
    color: '#10b981', // green-500
  },
  {
    tier: 2,
    name: 'Intermediate',
    level: 'INTERMEDIATE',
    target: 0,
    xpReward: 250,
    coinsReward: 100,
    color: '#3b82f6', // blue-500
  },
  {
    tier: 3,
    name: 'Advanced',
    level: 'ADVANCED',
    target: 0,
    xpReward: 500,
    coinsReward: 200,
    color: '#8b5cf6', // purple-500
  },
  {
    tier: 4,
    name: 'Elite',
    level: 'ELITE',
    target: 0,
    xpReward: 1000,
    coinsReward: 500,
    color: '#f59e0b', // amber-500
  },
];

interface AchievementConfig {
  key: string;
  name: string;
  description: string;
  category: AchievementCategory;
  type: AchievementType;
  iconUrl?: string;
  tierTargets: [number, number, number, number]; // Targets para los 4 tiers
  unit: string;
}

// ================================
// DEFINICIÓN DE ACHIEVEMENTS
// ================================

const PROGRESSIVE_ACHIEVEMENTS: AchievementConfig[] = [
  // ==========================================
  // ROUTINE COMPLETION
  // ==========================================
  {
    key: 'routine_completions',
    name: 'Routine Master',
    description: 'Complete training routines to master your progression',
    category: 'ROUTINE_COMPLETION',
    type: 'CUMULATIVE',
    iconUrl: '🎯',
    tierTargets: [10, 25, 50, 100],
    unit: 'routines',
  },

  // ==========================================
  // CONSISTENCY / STREAKS
  // ==========================================
  {
    key: 'daily_streak',
    name: 'Unstoppable Streak',
    description: 'Maintain your daily training streak without fail',
    category: 'CONSISTENCY',
    type: 'STREAK',
    iconUrl: '🔥',
    tierTargets: [7, 30, 90, 365],
    unit: 'consecutive days',
  },
  {
    key: 'total_training_days',
    name: 'Constant Warrior',
    description: 'Total training days (not necessarily consecutive)',
    category: 'CONSISTENCY',
    type: 'CUMULATIVE',
    iconUrl: '💪',
    tierTargets: [30, 100, 300, 1000],
    unit: 'days',
  },

  // ==========================================
  // SKILLS MASTERY - GENERAL
  // ==========================================
  {
    key: 'total_skills_completed',
    name: 'Skill Collector',
    description: 'Complete calisthenics skills from all categories',
    category: 'SKILL_MASTERY',
    type: 'CUMULATIVE',
    iconUrl: '⭐',
    tierTargets: [10, 25, 50, 100],
    unit: 'skills',
  },

  // ==========================================
  // FIG CATEGORY: BALANCE
  // ==========================================
  {
    key: 'balance_skills_completed',
    name: 'Balance Master',
    description: 'Master handstands and balance skills',
    category: 'BALANCE',
    type: 'CATEGORY',
    iconUrl: '⚖️',
    tierTargets: [5, 10, 20, 35],
    unit: 'balance skills',
  },
  {
    key: 'handstand_hold_time',
    name: 'Handstand King',
    description: 'Accumulated time holding handstand',
    category: 'BALANCE',
    type: 'CUMULATIVE',
    iconUrl: '🤸',
    tierTargets: [60, 300, 900, 3600], // 1min, 5min, 15min, 1hour
    unit: 'seconds',
  },

  // ==========================================
  // FIG CATEGORY: STRENGTH
  // ==========================================
  {
    key: 'strength_skills_completed',
    name: 'Strength Titan',
    description: 'Complete pure strength exercises: pull-ups, dips, muscle-ups',
    category: 'STRENGTH',
    type: 'CATEGORY',
    iconUrl: '💪',
    tierTargets: [5, 15, 30, 50],
    unit: 'strength skills',
  },
  {
    key: 'pull_ups_total',
    name: 'Pull-up Master',
    description: 'Total pull-ups performed in your lifetime',
    category: 'STRENGTH',
    type: 'CUMULATIVE',
    iconUrl: '🦾',
    tierTargets: [100, 500, 1500, 5000],
    unit: 'pull-ups',
  },
  {
    key: 'dips_total',
    name: 'Dip King',
    description: 'Total dips performed',
    category: 'STRENGTH',
    type: 'CUMULATIVE',
    iconUrl: '💥',
    tierTargets: [100, 500, 1500, 5000],
    unit: 'dips',
  },

  // ==========================================
  // FIG CATEGORY: STATIC HOLDS
  // ==========================================
  {
    key: 'static_skills_completed',
    name: 'Static Holds Master',
    description: 'Master static positions: planche, front lever, back lever',
    category: 'STATIC_HOLDS',
    type: 'CATEGORY',
    iconUrl: '🎯',
    tierTargets: [3, 8, 15, 25],
    unit: 'static skills',
  },
  {
    key: 'planche_hold_time',
    name: 'Planche Champion',
    description: 'Accumulated time holding planche (all progressions)',
    category: 'STATIC_HOLDS',
    type: 'CUMULATIVE',
    iconUrl: '🛡️',
    tierTargets: [30, 120, 300, 900], // 30s, 2min, 5min, 15min
    unit: 'seconds',
  },
  {
    key: 'front_lever_hold_time',
    name: 'Front Lever Master',
    description: 'Accumulated time in front lever',
    category: 'STATIC_HOLDS',
    type: 'CUMULATIVE',
    iconUrl: '🦅',
    tierTargets: [30, 120, 300, 900],
    unit: 'seconds',
  },

  // ==========================================
  // FIG CATEGORY: CORE
  // ==========================================
  {
    key: 'core_skills_completed',
    name: 'Iron Core',
    description: 'Complete core and conditioning exercises',
    category: 'CORE',
    type: 'CATEGORY',
    iconUrl: '🔥',
    tierTargets: [5, 12, 25, 40],
    unit: 'core skills',
  },
  {
    key: 'plank_hold_time',
    name: 'Plank Master',
    description: 'Accumulated time in plank',
    category: 'CORE',
    type: 'CUMULATIVE',
    iconUrl: '⏱️',
    tierTargets: [300, 1200, 3600, 10800], // 5min, 20min, 1h, 3h
    unit: 'seconds',
  },

  // ==========================================
  // HEXAGON GROWTH - Axis Progress
  // ==========================================
  {
    key: 'balance_axis_xp',
    name: 'Balance Specialist',
    description: 'Earn XP in the Balance axis of the hexagon',
    category: 'HEXAGON_GROWTH',
    type: 'CUMULATIVE',
    iconUrl: '⚖️',
    tierTargets: [5000, 15000, 40000, 100000],
    unit: 'balance XP',
  },
  {
    key: 'strength_axis_xp',
    name: 'Strength Specialist',
    description: 'Earn XP in the Strength axis of the hexagon',
    category: 'HEXAGON_GROWTH',
    type: 'CUMULATIVE',
    iconUrl: '💪',
    tierTargets: [5000, 15000, 40000, 100000],
    unit: 'strength XP',
  },
  {
    key: 'static_holds_axis_xp',
    name: 'Static Holds Specialist',
    description: 'Earn XP in the Static Holds axis of the hexagon',
    category: 'HEXAGON_GROWTH',
    type: 'CUMULATIVE',
    iconUrl: '🎯',
    tierTargets: [5000, 15000, 40000, 100000],
    unit: 'static holds XP',
  },
  {
    key: 'core_axis_xp',
    name: 'Core Specialist',
    description: 'Earn XP in the Core axis of the hexagon',
    category: 'HEXAGON_GROWTH',
    type: 'CUMULATIVE',
    iconUrl: '🔥',
    tierTargets: [5000, 15000, 40000, 100000],
    unit: 'core XP',
  },
  {
    key: 'endurance_axis_xp',
    name: 'Endurance Specialist',
    description: 'Earn XP in the Endurance axis of the hexagon',
    category: 'HEXAGON_GROWTH',
    type: 'CUMULATIVE',
    iconUrl: '⚡',
    tierTargets: [5000, 15000, 40000, 100000],
    unit: 'endurance XP',
  },
  {
    key: 'mobility_axis_xp',
    name: 'Mobility Specialist',
    description: 'Earn XP in the Mobility axis of the hexagon',
    category: 'HEXAGON_GROWTH',
    type: 'CUMULATIVE',
    iconUrl: '🤸',
    tierTargets: [5000, 15000, 40000, 100000],
    unit: 'mobility XP',
  },

  // ==========================================
  // LEVEL MILESTONES
  // ==========================================
  {
    key: 'user_level_milestone',
    name: 'Unstoppable Ascent',
    description: 'Reach higher and higher levels in your calisthenics journey',
    category: 'LEVEL_MILESTONE',
    type: 'MILESTONE',
    iconUrl: '🏆',
    tierTargets: [10, 25, 50, 100],
    unit: 'level',
  },

  // ==========================================
  // OVERALL PROGRESS
  // ==========================================
  {
    key: 'total_xp_earned',
    name: 'XP Hunter',
    description: 'Earn total XP across all your activities',
    category: 'OVERALL_PROGRESS',
    type: 'CUMULATIVE',
    iconUrl: '✨',
    tierTargets: [10000, 50000, 150000, 500000],
    unit: 'XP',
  },
  {
    key: 'virtual_coins_earned',
    name: 'Treasure Hoarder',
    description: 'Earn virtual coins by completing challenges',
    category: 'OVERALL_PROGRESS',
    type: 'CUMULATIVE',
    iconUrl: '💰',
    tierTargets: [1000, 5000, 15000, 50000],
    unit: 'coins',
  },
];

// ================================
// SEED FUNCTION
// ================================

async function seedProgressiveAchievements() {
  console.log('🌱 Seeding Progressive Achievements...');

  for (const config of PROGRESSIVE_ACHIEVEMENTS) {
    console.log(`\n📌 Creating: ${config.name} (${config.key})`);

    // Create Achievement
    const achievement = await prisma.achievement.create({
      data: {
        key: config.key,
        name: config.name,
        description: config.description,
        category: config.category,
        type: config.type,
        iconUrl: config.iconUrl || null,
        isActive: true,
      },
    });

    // Create Tiers
    for (let i = 0; i < 4; i++) {
      const tierTemplate = STANDARD_TIERS[i];
      if (!tierTemplate) continue;

      const target = config.tierTargets[i];
      if (target === undefined) continue;

      await prisma.achievementTier.create({
        data: {
          achievementId: achievement.id,
          tier: tierTemplate.tier,
          name: tierTemplate.name,
          level: tierTemplate.level,
          target,
          unit: config.unit,
          xpReward: tierTemplate.xpReward,
          coinsReward: tierTemplate.coinsReward,
          color: tierTemplate.color,
        },
      });

      console.log(
        `  ✓ Tier ${i + 1}: ${tierTemplate.name} (${target} ${config.unit}) - ${tierTemplate.color}`
      );
    }
  }

  console.log('\n✅ Progressive Achievements seeded successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   - ${PROGRESSIVE_ACHIEVEMENTS.length} achievements created`);
  console.log(`   - ${PROGRESSIVE_ACHIEVEMENTS.length * 4} tiers created`);
  console.log(`   - Each achievement has 4 progressive tiers (BEGINNER → ELITE)`);
}

// Run seed
seedProgressiveAchievements()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
