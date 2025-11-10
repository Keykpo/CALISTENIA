/**
 * Progressive Achievements System - Cumulative & Never Resetting
 *
 * This system handles achievements with multiple tiers that:
 * 1. Never reset (progress is cumulative)
 * 2. Change color/rarity as you progress
 * 3. Align with FIG level system (BEGINNER → INTERMEDIATE → ADVANCED → ELITE)
 * 4. A single achievement evolves through tiers instead of separate achievements
 *
 * Example: "Routine Master"
 *   - Tier 1 (BEGINNER): 10 routines → Green badge
 *   - Tier 2 (INTERMEDIATE): 25 routines → Blue badge
 *   - Tier 3 (ADVANCED): 50 routines → Purple badge
 *   - Tier 4 (ELITE): 100 routines → Gold badge
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TierUnlocked {
  tier: number;
  name: string;
  level: string;
  xpReward: number;
  coinsReward: number;
  color: string;
}

interface AchievementUpdateResult {
  previousValue: number;
  newValue: number;
  previousTier: number;
  newTier: number;
  tiersUnlocked: TierUnlocked[];
  totalXPEarned: number;
  totalCoinsEarned: number;
}

/**
 * Update achievement progress (CUMULATIVE - never resets)
 *
 * @param userId - User ID
 * @param achievementKey - Achievement key (e.g., 'routine_completions')
 * @param incrementBy - Amount to increment (default: 1)
 * @returns Result with tiers unlocked and rewards
 */
export async function updateAchievementProgress(
  userId: string,
  achievementKey: string,
  incrementBy: number = 1
): Promise<AchievementUpdateResult> {
  // 1. Get achievement and all its tiers
  const achievement = await prisma.achievement.findUnique({
    where: { key: achievementKey },
    include: {
      tiers: {
        orderBy: { tier: 'asc' },
      },
    },
  });

  if (!achievement) {
    throw new Error(`Achievement with key "${achievementKey}" not found`);
  }

  // 2. Get or create user achievement progress
  let userAchievement = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId,
        achievementId: achievement.id,
      },
    },
  });

  if (!userAchievement) {
    userAchievement = await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
        currentValue: 0,
        currentTier: 0,
      },
    });
  }

  // 3. Calculate new value (CUMULATIVE)
  const previousValue = userAchievement.currentValue;
  const newValue = previousValue + incrementBy;
  const previousTier = userAchievement.currentTier;

  // 4. Check which new tiers were unlocked
  const tiersUnlocked: TierUnlocked[] = [];
  let newTier = previousTier;
  let totalXPEarned = 0;
  let totalCoinsEarned = 0;

  for (const tier of achievement.tiers) {
    // Skip already unlocked tiers
    if (tier.tier <= previousTier) continue;

    // Check if this tier is now unlocked
    if (newValue >= tier.target) {
      newTier = tier.tier;
      tiersUnlocked.push({
        tier: tier.tier,
        name: tier.name,
        level: tier.level,
        xpReward: tier.xpReward,
        coinsReward: tier.coinsReward,
        color: tier.color,
      });
      totalXPEarned += tier.xpReward;
      totalCoinsEarned += tier.coinsReward;
    } else {
      // Tiers are ordered, so stop checking once we find one not unlocked
      break;
    }
  }

  // 5. Update user achievement progress
  const updateData: any = {
    currentValue: newValue,
    currentTier: newTier,
    lastUpdated: new Date(),
  };

  // Mark tier completion timestamps
  for (const unlockedTier of tiersUnlocked) {
    const tierField = `tier${unlockedTier.tier}CompletedAt` as keyof typeof updateData;
    updateData[tierField] = new Date();
  }

  await prisma.userAchievement.update({
    where: { id: userAchievement.id },
    data: updateData,
  });

  // 6. Award rewards to user if any tiers were unlocked
  if (tiersUnlocked.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalXP: { increment: totalXPEarned },
        virtualCoins: { increment: totalCoinsEarned },
      },
    });
  }

  return {
    previousValue,
    newValue,
    previousTier,
    newTier,
    tiersUnlocked,
    totalXPEarned,
    totalCoinsEarned,
  };
}

/**
 * Set achievement progress to a specific value (useful for syncing)
 *
 * @param userId - User ID
 * @param achievementKey - Achievement key
 * @param newValue - New absolute value
 */
export async function setAchievementProgress(
  userId: string,
  achievementKey: string,
  newValue: number
): Promise<AchievementUpdateResult> {
  // Get current value
  const achievement = await prisma.achievement.findUnique({
    where: { key: achievementKey },
  });

  if (!achievement) {
    throw new Error(`Achievement with key "${achievementKey}" not found`);
  }

  const userAchievement = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId,
        achievementId: achievement.id,
      },
    },
  });

  const currentValue = userAchievement?.currentValue || 0;
  const difference = newValue - currentValue;

  // If difference is positive, update; otherwise do nothing
  if (difference > 0) {
    return updateAchievementProgress(userId, achievementKey, difference);
  }

  // No change
  return {
    previousValue: currentValue,
    newValue: currentValue,
    previousTier: userAchievement?.currentTier || 0,
    newTier: userAchievement?.currentTier || 0,
    tiersUnlocked: [],
    totalXPEarned: 0,
    totalCoinsEarned: 0,
  };
}

/**
 * Get user's progress for a specific achievement
 */
export async function getAchievementProgress(userId: string, achievementKey: string) {
  const achievement = await prisma.achievement.findUnique({
    where: { key: achievementKey },
    include: {
      tiers: {
        orderBy: { tier: 'asc' },
      },
    },
  });

  if (!achievement) {
    return null;
  }

  const userAchievement = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId,
        achievementId: achievement.id,
      },
    },
  });

  const currentValue = userAchievement?.currentValue || 0;
  const currentTier = userAchievement?.currentTier || 0;

  // Find next tier to unlock
  const nextTier = achievement.tiers.find((t) => t.tier > currentTier);
  const currentTierData = achievement.tiers.find((t) => t.tier === currentTier);

  return {
    achievement: {
      id: achievement.id,
      key: achievement.key,
      name: achievement.name,
      description: achievement.description,
      category: achievement.category,
      type: achievement.type,
      iconUrl: achievement.iconUrl,
    },
    progress: {
      currentValue,
      currentTier,
      currentTierData: currentTierData || null,
      nextTier: nextTier || null,
      progressToNextTier: nextTier
        ? Math.min(100, (currentValue / nextTier.target) * 100)
        : 100,
      isComplete: !nextTier, // All tiers unlocked
    },
    tiers: achievement.tiers,
    completedAt: {
      tier1: userAchievement?.tier1CompletedAt || null,
      tier2: userAchievement?.tier2CompletedAt || null,
      tier3: userAchievement?.tier3CompletedAt || null,
      tier4: userAchievement?.tier4CompletedAt || null,
    },
  };
}

/**
 * Get all achievements for a user with their progress
 */
export async function getAllAchievementsProgress(userId: string) {
  const achievements = await prisma.achievement.findMany({
    where: { isActive: true },
    include: {
      tiers: {
        orderBy: { tier: 'asc' },
      },
      userAchievements: {
        where: { userId },
      },
    },
    orderBy: { order: 'asc' },
  });

  return achievements.map((achievement) => {
    const userAchievement = achievement.userAchievements[0];
    const currentValue = userAchievement?.currentValue || 0;
    const currentTier = userAchievement?.currentTier || 0;

    const nextTier = achievement.tiers.find((t) => t.tier > currentTier);
    const currentTierData = achievement.tiers.find((t) => t.tier === currentTier);

    return {
      id: achievement.id,
      key: achievement.key,
      name: achievement.name,
      description: achievement.description,
      category: achievement.category,
      type: achievement.type,
      iconUrl: achievement.iconUrl,
      currentValue,
      currentTier,
      currentTierData: currentTierData || null,
      nextTier: nextTier || null,
      progressToNextTier: nextTier
        ? Math.min(100, (currentValue / nextTier.target) * 100)
        : 100,
      isComplete: !nextTier,
      tiers: achievement.tiers,
      completedAt: {
        tier1: userAchievement?.tier1CompletedAt || null,
        tier2: userAchievement?.tier2CompletedAt || null,
        tier3: userAchievement?.tier3CompletedAt || null,
        tier4: userAchievement?.tier4CompletedAt || null,
      },
    };
  });
}

/**
 * Helper: Update routine completion achievement
 */
export async function trackRoutineCompletion(userId: string) {
  return updateAchievementProgress(userId, 'routine_completions', 1);
}

/**
 * Helper: Update daily streak achievement
 */
export async function trackDailyStreak(userId: string, currentStreak: number) {
  return setAchievementProgress(userId, 'daily_streak', currentStreak);
}

/**
 * Helper: Update total training days
 */
export async function trackTotalTrainingDays(userId: string) {
  return updateAchievementProgress(userId, 'total_training_days', 1);
}

/**
 * Helper: Update skill completion achievement
 */
export async function trackSkillCompletion(userId: string, skillCategory: string) {
  // Update total skills
  await updateAchievementProgress(userId, 'total_skills_completed', 1);

  // Update category-specific achievement
  const categoryMap: Record<string, string> = {
    BALANCE: 'balance_skills_completed',
    STRENGTH: 'strength_skills_completed',
    SKILL_STATIC: 'static_skills_completed',
    CORE: 'core_skills_completed',
  };

  const achievementKey = categoryMap[skillCategory];
  if (achievementKey) {
    await updateAchievementProgress(userId, achievementKey, 1);
  }
}

/**
 * Helper: Update hexagon axis XP achievement
 */
export async function trackHexagonAxisXP(
  userId: string,
  axis: 'balance' | 'strength' | 'staticHolds' | 'core' | 'endurance' | 'mobility',
  xpGained: number
) {
  const axisMap = {
    balance: 'balance_axis_xp',
    strength: 'strength_axis_xp',
    staticHolds: 'static_holds_axis_xp',
    core: 'core_axis_xp',
    endurance: 'endurance_axis_xp',
    mobility: 'mobility_axis_xp',
  };

  const achievementKey = axisMap[axis];
  return updateAchievementProgress(userId, achievementKey, xpGained);
}

/**
 * Helper: Update user level milestone
 */
export async function trackUserLevel(userId: string, currentLevel: number) {
  return setAchievementProgress(userId, 'user_level_milestone', currentLevel);
}

/**
 * Helper: Update total XP earned
 */
export async function trackTotalXP(userId: string, totalXP: number) {
  return setAchievementProgress(userId, 'total_xp_earned', totalXP);
}

/**
 * Helper: Update virtual coins earned
 */
export async function trackVirtualCoins(userId: string, totalCoins: number) {
  return setAchievementProgress(userId, 'virtual_coins_earned', totalCoins);
}
