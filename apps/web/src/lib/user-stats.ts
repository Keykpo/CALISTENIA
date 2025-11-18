/**
 * UNIFIED USER STATS UTILITY
 *
 * Provides consistent user performance metrics calculation across the entire app.
 * Combines data from multiple sources:
 * - User model (direct fields: pullUpsMax, dipsMax, etc.)
 * - ManualExerciseLog (workout history)
 * - HexagonProfile (XP and levels)
 *
 * This ensures both the V3 and Daily routine systems use the same metrics.
 */

import type { PrismaClient } from '@prisma/client';

export interface UserStats {
  // Core strength metrics
  pullUpsMax: number;
  dipsMax: number;
  pushUpsMax: number;

  // Weighted exercises (kg)
  weightedPullUps: number;
  weightedDips: number;

  // Body composition
  bodyWeight: number; // kg
  height: number; // cm

  // Weighted exercises as % of body weight (for stage calculation)
  weightedPullUpsPercent: number;
  weightedDipsPercent: number;

  // Data source metadata
  source: 'user_model' | 'workout_logs' | 'hybrid';
  lastUpdated?: Date;
}

export interface UserStatsOptions {
  /**
   * Prefer user model fields over workout logs
   * If false, will query workout logs for most recent data
   */
  preferUserModel?: boolean;

  /**
   * Include workout log analysis even if user model has data
   */
  includeLogAnalysis?: boolean;

  /**
   * Maximum age of workout logs to consider (in days)
   */
  maxLogAgeDays?: number;
}

/**
 * Get unified user stats from all available sources
 */
export async function getUserStats(
  prisma: PrismaClient,
  userId: string,
  options: UserStatsOptions = {}
): Promise<UserStats> {
  const {
    preferUserModel = true,
    includeLogAnalysis = false,
    maxLogAgeDays = 90,
  } = options;

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      pullUpsMax: true,
      dipsMax: true,
      pushUpsMax: true,
      weightedPullUps: true,
      weightedDips: true,
      weight: true,
      height: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const bodyWeight = user.weight ?? 75; // Default to 75kg

  // If user model has complete data and we prefer it, use that
  if (
    preferUserModel &&
    !includeLogAnalysis &&
    user.pullUpsMax !== null &&
    user.dipsMax !== null
  ) {
    return {
      pullUpsMax: user.pullUpsMax,
      dipsMax: user.dipsMax,
      pushUpsMax: user.pushUpsMax ?? 0,
      weightedPullUps: user.weightedPullUps ?? 0,
      weightedDips: user.weightedDips ?? 0,
      bodyWeight,
      height: user.height ?? 170,
      weightedPullUpsPercent: ((user.weightedPullUps ?? 0) / bodyWeight) * 100,
      weightedDipsPercent: ((user.weightedDips ?? 0) / bodyWeight) * 100,
      source: 'user_model',
      lastUpdated: user.updatedAt,
    };
  }

  // Query workout logs for historical data
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxLogAgeDays);

  const [pullUpLogs, dipLogs, pushUpLogs] = await Promise.all([
    // Pull-ups
    prisma.manualExerciseLog.findMany({
      where: {
        userId,
        createdAt: { gte: cutoffDate },
        OR: [
          { name: { contains: 'pull', mode: 'insensitive' } },
          { name: { contains: 'Pull', mode: 'insensitive' } },
        ],
      },
      orderBy: { reps: 'desc' },
      take: 1,
    }),
    // Dips
    prisma.manualExerciseLog.findMany({
      where: {
        userId,
        createdAt: { gte: cutoffDate },
        OR: [
          { name: { contains: 'dip', mode: 'insensitive' } },
          { name: { contains: 'Dip', mode: 'insensitive' } },
        ],
      },
      orderBy: { reps: 'desc' },
      take: 1,
    }),
    // Push-ups
    prisma.manualExerciseLog.findMany({
      where: {
        userId,
        createdAt: { gte: cutoffDate },
        OR: [
          { name: { contains: 'push', mode: 'insensitive' } },
          { name: { contains: 'Push', mode: 'insensitive' } },
        ],
      },
      orderBy: { reps: 'desc' },
      take: 1,
    }),
  ]);

  // Combine data from user model and logs (prefer higher values)
  const pullUpsMax = Math.max(user.pullUpsMax ?? 0, pullUpLogs[0]?.reps ?? 0);
  const dipsMax = Math.max(user.dipsMax ?? 0, dipLogs[0]?.reps ?? 0);
  const pushUpsMax = Math.max(user.pushUpsMax ?? 0, pushUpLogs[0]?.reps ?? 0);

  // For weighted exercises, prefer user model (logs don't track weight yet)
  const weightedPullUps = user.weightedPullUps ?? 0;
  const weightedDips = user.weightedDips ?? 0;

  const source = includeLogAnalysis || !preferUserModel ? 'hybrid' : 'workout_logs';

  return {
    pullUpsMax,
    dipsMax,
    pushUpsMax,
    weightedPullUps,
    weightedDips,
    bodyWeight,
    height: user.height ?? 170,
    weightedPullUpsPercent: (weightedPullUps / bodyWeight) * 100,
    weightedDipsPercent: (weightedDips / bodyWeight) * 100,
    source,
    lastUpdated: user.updatedAt,
  };
}

/**
 * Update user stats in the database
 * Should be called after completing workouts to keep metrics fresh
 */
export async function updateUserStats(
  prisma: PrismaClient,
  userId: string,
  stats: Partial<Pick<UserStats, 'pullUpsMax' | 'dipsMax' | 'pushUpsMax' | 'weightedPullUps' | 'weightedDips'>>
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      ...stats,
      updatedAt: new Date(),
    },
  });
}

/**
 * Calculate if user's stats have improved since last check
 * Useful for achievement/badge systems
 */
export async function hasStatsImproved(
  prisma: PrismaClient,
  userId: string,
  newStats: Partial<UserStats>
): Promise<{
  hasImproved: boolean;
  improvements: string[];
}> {
  const currentStats = await getUserStats(prisma, userId);
  const improvements: string[] = [];

  if ((newStats.pullUpsMax ?? 0) > currentStats.pullUpsMax) {
    improvements.push(`Pull-ups: ${currentStats.pullUpsMax} → ${newStats.pullUpsMax}`);
  }

  if ((newStats.dipsMax ?? 0) > currentStats.dipsMax) {
    improvements.push(`Dips: ${currentStats.dipsMax} → ${newStats.dipsMax}`);
  }

  if ((newStats.pushUpsMax ?? 0) > currentStats.pushUpsMax) {
    improvements.push(`Push-ups: ${currentStats.pushUpsMax} → ${newStats.pushUpsMax}`);
  }

  if ((newStats.weightedPullUps ?? 0) > currentStats.weightedPullUps) {
    improvements.push(
      `Weighted Pull-ups: +${currentStats.weightedPullUps}kg → +${newStats.weightedPullUps}kg`
    );
  }

  if ((newStats.weightedDips ?? 0) > currentStats.weightedDips) {
    improvements.push(
      `Weighted Dips: +${currentStats.weightedDips}kg → +${newStats.weightedDips}kg`
    );
  }

  return {
    hasImproved: improvements.length > 0,
    improvements,
  };
}

/**
 * Format stats for display
 */
export function formatUserStats(stats: UserStats): Record<string, string> {
  return {
    'Pull-ups': `${stats.pullUpsMax} reps${stats.weightedPullUps > 0 ? ` (+${stats.weightedPullUps}kg)` : ''}`,
    'Dips': `${stats.dipsMax} reps${stats.weightedDips > 0 ? ` (+${stats.weightedDips}kg)` : ''}`,
    'Push-ups': `${stats.pushUpsMax} reps`,
    'Body Weight': `${stats.bodyWeight}kg`,
    'Data Source': stats.source,
  };
}
