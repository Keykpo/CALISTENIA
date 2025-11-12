/**
 * STREAK SYSTEM
 *
 * Manages user workout streaks with:
 * - Daily streak tracking based on consecutive workout days
 * - Streak bonuses for XP and Coins
 * - Milestone achievements
 * - Longest streak tracking
 */

import prisma from './prisma';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: Date | null;
  nextMilestone: StreakMilestone | null;
  currentBonus: number; // Percentage bonus
  daysUntilStreakLoss: number;
}

export interface StreakMilestone {
  days: number;
  name: string;
  description: string;
  bonusPercent: number; // Additional XP/Coins bonus
  icon: string;
  color: string;
}

/**
 * Streak Milestones
 * Each milestone grants an additional permanent bonus while streak is maintained
 */
export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 3,
    name: 'Getting Started',
    description: '3 days in a row!',
    bonusPercent: 5,
    icon: '🔥',
    color: 'orange',
  },
  {
    days: 7,
    name: 'Weekly Warrior',
    description: 'One full week!',
    bonusPercent: 10,
    icon: '⚡',
    color: 'yellow',
  },
  {
    days: 14,
    name: 'Two Week Champion',
    description: 'Two weeks strong!',
    bonusPercent: 15,
    icon: '💪',
    color: 'blue',
  },
  {
    days: 30,
    name: 'Monthly Master',
    description: 'A full month of dedication!',
    bonusPercent: 20,
    icon: '🏆',
    color: 'purple',
  },
  {
    days: 60,
    name: 'Unstoppable',
    description: 'Two months of consistency!',
    bonusPercent: 25,
    icon: '👑',
    color: 'gold',
  },
  {
    days: 100,
    name: 'Century Club',
    description: '100 days! Legendary!',
    bonusPercent: 30,
    icon: '💎',
    color: 'diamond',
  },
  {
    days: 365,
    name: 'Year of Excellence',
    description: 'A full year! Ultimate dedication!',
    bonusPercent: 50,
    icon: '🌟',
    color: 'rainbow',
  },
];

/**
 * Get the current streak bonus percentage based on streak length
 */
export function getStreakBonus(streakDays: number): number {
  // Find the highest milestone reached
  const milestonesReached = STREAK_MILESTONES.filter(m => streakDays >= m.days);

  if (milestonesReached.length === 0) {
    return 0; // No milestone reached yet
  }

  // Return the bonus from the highest milestone
  const highestMilestone = milestonesReached[milestonesReached.length - 1];
  return highestMilestone.bonusPercent;
}

/**
 * Get the next milestone to reach
 */
export function getNextMilestone(streakDays: number): StreakMilestone | null {
  const nextMilestone = STREAK_MILESTONES.find(m => streakDays < m.days);
  return nextMilestone || null;
}

/**
 * Get the current milestone (last reached)
 */
export function getCurrentMilestone(streakDays: number): StreakMilestone | null {
  const milestonesReached = STREAK_MILESTONES.filter(m => streakDays >= m.days);

  if (milestonesReached.length === 0) {
    return null;
  }

  return milestonesReached[milestonesReached.length - 1];
}

/**
 * Apply streak bonus to XP and Coins
 */
export function applyStreakBonus(baseXP: number, baseCoins: number, streakDays: number): {
  xp: number;
  coins: number;
  bonusPercent: number;
} {
  const bonusPercent = getStreakBonus(streakDays);

  if (bonusPercent === 0) {
    return { xp: baseXP, coins: baseCoins, bonusPercent: 0 };
  }

  const multiplier = 1 + (bonusPercent / 100);

  return {
    xp: Math.round(baseXP * multiplier),
    coins: Math.round(baseCoins * multiplier),
    bonusPercent,
  };
}

/**
 * Calculate streak based on workout history
 * A streak is maintained if there's a workout within the last 2 days
 * (allows for 1 rest day without breaking the streak)
 */
export async function calculateStreak(userId: string): Promise<StreakData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all completed workout sessions ordered by date descending
  const workoutSessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      completedAt: { not: null },
    },
    orderBy: {
      completedAt: 'desc',
    },
    select: {
      completedAt: true,
    },
  });

  if (workoutSessions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: null,
      nextMilestone: STREAK_MILESTONES[0],
      currentBonus: 0,
      daysUntilStreakLoss: 0,
    };
  }

  // Get unique workout days (remove duplicates on same day)
  const workoutDays = [...new Set(
    workoutSessions.map(session => {
      const date = new Date(session.completedAt!);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  )].sort((a, b) => b - a); // Sort descending

  const lastWorkoutDate = new Date(workoutDays[0]);

  // Check if last workout was within the last 2 days (allows 1 rest day)
  const daysSinceLastWorkout = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceLastWorkout > 1) {
    // Streak is broken (more than 1 day without workout)
    return {
      currentStreak: 0,
      longestStreak: await calculateLongestStreak(workoutDays),
      lastWorkoutDate,
      nextMilestone: STREAK_MILESTONES[0],
      currentBonus: 0,
      daysUntilStreakLoss: 0,
    };
  }

  // Calculate current streak
  let currentStreak = 1;
  let currentDay = lastWorkoutDate.getTime();

  for (let i = 1; i < workoutDays.length; i++) {
    const prevDay = workoutDays[i];
    const dayDiff = Math.floor((currentDay - prevDay) / (1000 * 60 * 60 * 24));

    // If gap is 1 or 2 days (allowing 1 rest day), continue streak
    if (dayDiff <= 2) {
      currentStreak++;
      currentDay = prevDay;
    } else {
      break; // Streak broken
    }
  }

  const longestStreak = Math.max(currentStreak, await calculateLongestStreak(workoutDays));
  const daysUntilStreakLoss = daysSinceLastWorkout === 0 ? 2 : 1;

  return {
    currentStreak,
    longestStreak,
    lastWorkoutDate,
    nextMilestone: getNextMilestone(currentStreak),
    currentBonus: getStreakBonus(currentStreak),
    daysUntilStreakLoss,
  };
}

/**
 * Calculate the longest streak from workout days
 */
async function calculateLongestStreak(workoutDays: number[]): Promise<number> {
  if (workoutDays.length === 0) return 0;

  let longestStreak = 1;
  let currentStreakCount = 1;
  let currentDay = workoutDays[0];

  for (let i = 1; i < workoutDays.length; i++) {
    const prevDay = workoutDays[i];
    const dayDiff = Math.floor((currentDay - prevDay) / (1000 * 60 * 60 * 24));

    if (dayDiff <= 2) {
      currentStreakCount++;
      longestStreak = Math.max(longestStreak, currentStreakCount);
    } else {
      currentStreakCount = 1;
    }

    currentDay = prevDay;
  }

  return longestStreak;
}

/**
 * Update user's streak after completing a workout
 */
export async function updateStreakAfterWorkout(userId: string): Promise<StreakData> {
  const streakData = await calculateStreak(userId);

  // Update user's streak in database
  await prisma.user.update({
    where: { id: userId },
    data: {
      dailyStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      lastDailyCompletedAt: new Date(),
    },
  });

  // Check if user reached a new milestone
  const currentMilestone = getCurrentMilestone(streakData.currentStreak);

  if (currentMilestone) {
    // Check if this milestone was just reached (current streak equals milestone days)
    if (streakData.currentStreak === currentMilestone.days) {
      // Award milestone achievement
      await awardMilestoneAchievement(userId, currentMilestone);
    }
  }

  return streakData;
}

/**
 * Award a milestone achievement to the user
 */
async function awardMilestoneAchievement(userId: string, milestone: StreakMilestone): Promise<void> {
  try {
    // Check if achievement exists for this milestone
    const achievementKey = `STREAK_${milestone.days}_DAYS`;

    let achievement = await prisma.achievement.findUnique({
      where: { key: achievementKey },
    });

    // Create achievement if it doesn't exist
    if (!achievement) {
      achievement = await prisma.achievement.create({
        data: {
          key: achievementKey,
          name: milestone.name,
          description: milestone.description,
          category: 'STREAK',
          requiredCount: milestone.days,
          rewardXP: milestone.bonusPercent * 100, // Bonus XP for reaching milestone
          rewardCoins: milestone.bonusPercent * 50,
          icon: milestone.icon,
        },
      });
    }

    // Award achievement to user if not already awarded
    const existingUserAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (!existingUserAchievement) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress: milestone.days,
          completed: true,
          completedAt: new Date(),
        },
      });

      // Award bonus XP and Coins for reaching milestone
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXP: { increment: achievement.rewardXP },
          virtualCoins: { increment: achievement.rewardCoins },
        },
      });

      console.log(`[STREAK] 🎉 User ${userId} reached milestone: ${milestone.name}!`);
    }
  } catch (error) {
    console.error('[STREAK] Error awarding milestone achievement:', error);
  }
}

/**
 * Get user's current streak data
 */
export async function getUserStreakData(userId: string): Promise<StreakData> {
  return await calculateStreak(userId);
}

/**
 * Get all milestones with user's progress
 */
export async function getUserMilestones(userId: string): Promise<Array<StreakMilestone & { reached: boolean; current: boolean }>> {
  const streakData = await calculateStreak(userId);

  return STREAK_MILESTONES.map(milestone => ({
    ...milestone,
    reached: streakData.currentStreak >= milestone.days,
    current: streakData.currentStreak === milestone.days,
  }));
}
