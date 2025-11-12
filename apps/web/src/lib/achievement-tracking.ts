/**
 * ACHIEVEMENT TRACKING SYSTEM
 *
 * Automatically tracks user progress and awards achievements
 */

import prisma from './prisma';

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  completed: boolean;
  justCompleted?: boolean;
}

export interface AchievementUpdate {
  achieved: AchievementProgress[];
  unlockedNext: Array<{
    id: string;
    name: string;
    chainName: string;
  }>;
}

/**
 * Initialize level 1 achievement for a chain if user doesn't have any
 */
async function ensureLevel1Achievement(userId: string, achievements: any[]) {
  if (achievements.length === 0) return;

  // Find level 1 achievement
  const level1 = achievements.find(a => a.level === 1);
  if (!level1) return;

  // Check if user already has this achievement
  const existing = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId,
        achievementId: level1.id,
      },
    },
  });

  // Create it if it doesn't exist
  if (!existing) {
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: level1.id,
        progress: 0,
        completed: false,
        completedAt: null,
      },
    });
  }
}

/**
 * Track workout completion achievements
 */
export async function trackWorkoutCompletion(userId: string): Promise<AchievementUpdate> {
  // Get total completed workouts
  const totalWorkouts = await prisma.workoutSession.count({
    where: {
      userId,
      status: 'COMPLETED',
    },
  });

  // Find workout-related achievements
  const achievements = await prisma.achievement.findMany({
    where: {
      type: 'WORKOUT_COUNT',
    },
    orderBy: {
      target: 'asc',
    },
  });

  // Ensure user has level 1 achievement initialized
  await ensureLevel1Achievement(userId, achievements);

  return await updateAchievementProgress(userId, achievements, totalWorkouts);
}

/**
 * Track XP milestones
 */
export async function trackXPMilestone(userId: string): Promise<AchievementUpdate> {
  // Get user's total XP
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalXP: true },
  });

  const totalXP = user?.totalXP || 0;

  // Find XP-related achievements
  const achievements = await prisma.achievement.findMany({
    where: {
      type: 'PROGRESS_MILESTONE',
    },
    orderBy: {
      target: 'asc',
    },
  });

  // Ensure user has level 1 achievement initialized
  await ensureLevel1Achievement(userId, achievements);

  return await updateAchievementProgress(userId, achievements, totalXP);
}

/**
 * Track exercise mastery (push-ups, pull-ups, core, balance)
 */
export async function trackExerciseMastery(
  userId: string,
  exerciseCategory: string,
  amount: number
): Promise<AchievementUpdate> {
  // Map exercise categories to achievement chain names
  const categoryToChain: Record<string, string> = {
    'PUSH': 'Push-Up Master',
    'PULL': 'Pull-Up Warrior',
    'CORE': 'Core Champion',
    'BALANCE': 'Balance Master',
  };

  const chainName = categoryToChain[exerciseCategory];
  if (!chainName) {
    return { achieved: [], unlockedNext: [] };
  }

  // Get or create exercise counter
  let counter = await prisma.exerciseCounter.findUnique({
    where: {
      userId_category: {
        userId,
        category: exerciseCategory,
      },
    },
  });

  if (!counter) {
    counter = await prisma.exerciseCounter.create({
      data: {
        userId,
        category: exerciseCategory,
        count: 0,
      },
    });
  }

  // Update counter
  const newCount = counter.count + amount;
  await prisma.exerciseCounter.update({
    where: {
      userId_category: {
        userId,
        category: exerciseCategory,
      },
    },
    data: {
      count: newCount,
    },
  });

  // Find achievements for this chain
  const achievements = await prisma.achievement.findMany({
    where: {
      chainName,
      type: 'EXERCISE_MASTERY',
    },
    orderBy: {
      target: 'asc',
    },
  });

  // Ensure user has level 1 achievement initialized
  await ensureLevel1Achievement(userId, achievements);

  return await updateAchievementProgress(userId, achievements, newCount);
}

/**
 * Core function to update achievement progress
 */
async function updateAchievementProgress(
  userId: string,
  achievements: any[],
  currentValue: number
): Promise<AchievementUpdate> {
  const achieved: AchievementProgress[] = [];
  const unlockedNext: Array<{ id: string; name: string; chainName: string }> = [];

  for (const achievement of achievements) {
    const target = achievement.target || 0;
    const progress = Math.min(currentValue, target);
    const isCompleted = currentValue >= target;

    // Get or create user achievement
    let userAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (!userAchievement) {
      // Create new user achievement
      userAchievement = await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress,
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      });

      if (isCompleted) {
        // Award XP and Coins
        await prisma.user.update({
          where: { id: userId },
          data: {
            totalXP: { increment: achievement.points },
            virtualCoins: { increment: Math.floor(achievement.points / 10) },
          },
        });

        achieved.push({
          achievementId: achievement.id,
          progress,
          completed: true,
          justCompleted: true,
        });

        // Check if there's a next level to unlock
        const nextLevel = achievements.find(
          a => a.chainName === achievement.chainName && a.level === achievement.level + 1
        );

        if (nextLevel) {
          // Create UserAchievement for the next level so it appears in UI
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: nextLevel.id,
              progress: Math.min(currentValue, nextLevel.target || 0),
              completed: false,
              completedAt: null,
            },
          });

          unlockedNext.push({
            id: nextLevel.id,
            name: nextLevel.name,
            chainName: nextLevel.chainName,
          });
        }
      }
    } else if (!userAchievement.completed && isCompleted) {
      // Achievement just completed
      await prisma.userAchievement.update({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
        data: {
          progress,
          completed: true,
          completedAt: new Date(),
        },
      });

      // Award XP and Coins
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXP: { increment: achievement.points },
          virtualCoins: { increment: Math.floor(achievement.points / 10) },
        },
      });

      achieved.push({
        achievementId: achievement.id,
        progress,
        completed: true,
        justCompleted: true,
      });

      // Check if there's a next level to unlock
      const nextLevel = achievements.find(
        a => a.chainName === achievement.chainName && a.level === achievement.level + 1
      );

      if (nextLevel) {
        // Check if next level already exists for this user
        const nextUserAch = await prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: nextLevel.id,
            },
          },
        });

        // Create it if it doesn't exist
        if (!nextUserAch) {
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: nextLevel.id,
              progress: Math.min(currentValue, nextLevel.target || 0),
              completed: false,
              completedAt: null,
            },
          });
        }

        unlockedNext.push({
          id: nextLevel.id,
          name: nextLevel.name,
          chainName: nextLevel.chainName,
        });
      }
    } else if (!userAchievement.completed) {
      // Update progress only
      await prisma.userAchievement.update({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
        data: {
          progress,
        },
      });

      achieved.push({
        achievementId: achievement.id,
        progress,
        completed: false,
      });
    }
  }

  return { achieved, unlockedNext };
}

/**
 * Get all achievement updates for a user after completing a workout
 */
export async function trackAllWorkoutAchievements(
  userId: string,
  exercisesCompleted: Array<{ category: string; reps?: number; time?: number }>
): Promise<AchievementUpdate> {
  const allUpdates: AchievementUpdate = {
    achieved: [],
    unlockedNext: [],
  };

  // Track workout completion
  const workoutUpdate = await trackWorkoutCompletion(userId);
  allUpdates.achieved.push(...workoutUpdate.achieved);
  allUpdates.unlockedNext.push(...workoutUpdate.unlockedNext);

  // Track XP milestone
  const xpUpdate = await trackXPMilestone(userId);
  allUpdates.achieved.push(...xpUpdate.achieved);
  allUpdates.unlockedNext.push(...xpUpdate.unlockedNext);

  // Track exercise mastery for each category
  const categoryTotals: Record<string, number> = {};

  exercisesCompleted.forEach(ex => {
    const category = ex.category?.toUpperCase();
    if (!category) return;

    // Map categories
    let trackingCategory = category;
    if (category === 'PUSH_MOVEMENTS' || category === 'PUSH') trackingCategory = 'PUSH';
    if (category === 'PULL_MOVEMENTS' || category === 'PULL') trackingCategory = 'PULL';
    if (category === 'CORE_STRENGTH' || category === 'CORE') trackingCategory = 'CORE';
    if (category === 'BALANCE') trackingCategory = 'BALANCE';

    if (['PUSH', 'PULL', 'CORE', 'BALANCE'].includes(trackingCategory)) {
      const amount = ex.reps || (ex.time ? 1 : 0); // For time-based, count as 1 rep equivalent
      categoryTotals[trackingCategory] = (categoryTotals[trackingCategory] || 0) + amount;
    }
  });

  // Track each category
  for (const [category, total] of Object.entries(categoryTotals)) {
    const masteryUpdate = await trackExerciseMastery(userId, category, total);
    allUpdates.achieved.push(...masteryUpdate.achieved);
    allUpdates.unlockedNext.push(...masteryUpdate.unlockedNext);
  }

  return allUpdates;
}
