/**
 * ============================================================================
 * PROGRESSION TRACKER - Advanced Progress Tracking
 * ============================================================================
 *
 * Tracks user progress and determines readiness to advance sublevels.
 *
 * Features:
 * - Progress tracking towards next sublevel
 * - Readiness alerts
 * - Requirement checking
 * - Performance trends
 *
 * Based on: RUTINAS_POR_NIVEL advancement criteria
 * ============================================================================
 */

import {
  getSubLevelInfo,
  getNextSubLevel,
  determineSubLevel,
  type SubLevel,
  type UserMetrics,
} from './sublevel-system';

import {
  shouldAdvanceToNextLevel,
  type UserProgressionState,
} from './weekly-progression';

// ==========================================
// TYPES
// ==========================================

export interface ProgressionCheckpoint {
  metric: string;
  displayName: string;
  current: number;
  target: number;
  progress: number; // 0-1 (percentage)
  achieved: boolean;
  unit: string; // 'reps', 'kg', '%', etc.
}

export interface ProgressionReadiness {
  ready: boolean;
  currentSubLevel: SubLevel;
  nextSubLevel: SubLevel | null;
  overallProgress: number; // 0-1
  checkpoints: ProgressionCheckpoint[];
  recommendations: string[];
  estimatedWeeksToReady: number;
}

export interface ProgressionHistory {
  date: Date;
  subLevel: SubLevel;
  metrics: UserMetrics;
  notes?: string;
}

// ==========================================
// REQUIREMENTS MAPPING
// ==========================================

/**
 * Get requirements for advancing to a specific sublevel
 */
export function getRequirementsForSubLevel(subLevel: SubLevel): {
  pullUps?: number;
  dips?: number;
  weightedPullUps?: number; // kg
  weightedDips?: number; // kg
  bodyWeightPercent?: number; // % for weighted
}[] {
  // Requirements map based on RUTINAS_POR_NIVEL
  const requirementsMap: Record<SubLevel, any> = {
    // BEGINNER (D)
    D_MINUS: [{ pullUps: 0, dips: 0 }],
    D: [{ pullUps: 1, dips: 5 }],
    D_PLUS: [{ pullUps: 4, dips: 10 }],

    // NOVICE (C)
    C_MINUS: [{ pullUps: 8, dips: 15 }],
    C: [{ pullUps: 11, dips: 20 }],
    C_PLUS: [{ pullUps: 15, dips: 25 }],

    // INTERMEDIATE (B)
    B_MINUS: [{ pullUps: 20, dips: 30, weightedPullUps: 7.5 }], // +10% BW ~7.5kg
    B: [{ pullUps: 25, dips: 35, weightedPullUps: 15 }], // +20% BW ~15kg
    B_PLUS: [{ pullUps: 30, dips: 40, weightedPullUps: 18.75 }], // +25% BW ~18.75kg

    // ADVANCED (A)
    A_MINUS: [{ pullUps: 35, dips: 45, weightedPullUps: 22.5 }], // +30% BW ~22.5kg
    A: [{ pullUps: 40, dips: 50, weightedPullUps: 26.25 }], // +35% BW ~26.25kg
    A_PLUS: [{ pullUps: 45, dips: 55, weightedPullUps: 30 }], // +40% BW ~30kg

    // EXPERT (S)
    S_MINUS: [{ pullUps: 50, dips: 60, weightedPullUps: 33.75 }], // +45% BW ~33.75kg
    S: [{ pullUps: 60, dips: 70, weightedPullUps: 37.5 }], // +50% BW ~37.5kg
    S_PLUS: [{ pullUps: 70, dips: 80, weightedPullUps: 41.25 }], // +55% BW ~41.25kg
  };

  return requirementsMap[subLevel] || [];
}

// ==========================================
// PROGRESSION READINESS
// ==========================================

/**
 * Check if user is ready to advance to next sublevel
 */
export function checkProgressionReadiness(
  userMetrics: UserMetrics,
  currentSubLevel: SubLevel,
  weeksAtCurrentLevel: number
): ProgressionReadiness {
  const nextSubLevel = getNextSubLevel(currentSubLevel);

  if (!nextSubLevel) {
    return {
      ready: false,
      currentSubLevel,
      nextSubLevel: null,
      overallProgress: 1.0,
      checkpoints: [],
      recommendations: ['🏆 You are at maximum level!'],
      estimatedWeeksToReady: 0,
    };
  }

  // Get requirements for next level
  const requirements = getRequirementsForSubLevel(nextSubLevel)[0];
  const checkpoints: ProgressionCheckpoint[] = [];

  // Check pull-ups
  if (requirements.pullUps !== undefined) {
    checkpoints.push({
      metric: 'pullUps',
      displayName: 'Pull-ups',
      current: userMetrics.pullUpsMax,
      target: requirements.pullUps,
      progress: Math.min(userMetrics.pullUpsMax / requirements.pullUps, 1),
      achieved: userMetrics.pullUpsMax >= requirements.pullUps,
      unit: 'reps',
    });
  }

  // Check dips
  if (requirements.dips !== undefined) {
    checkpoints.push({
      metric: 'dips',
      displayName: 'Dips',
      current: userMetrics.dipsMax,
      target: requirements.dips,
      progress: Math.min(userMetrics.dipsMax / requirements.dips, 1),
      achieved: userMetrics.dipsMax >= requirements.dips,
      unit: 'reps',
    });
  }

  // Check weighted pull-ups
  if (requirements.weightedPullUps !== undefined) {
    checkpoints.push({
      metric: 'weightedPullUps',
      displayName: 'Weighted Pull-ups',
      current: userMetrics.weightedPullUps,
      target: requirements.weightedPullUps,
      progress: Math.min(userMetrics.weightedPullUps / requirements.weightedPullUps, 1),
      achieved: userMetrics.weightedPullUps >= requirements.weightedPullUps,
      unit: 'kg',
    });
  }

  // Calculate overall progress
  const overallProgress =
    checkpoints.reduce((sum, cp) => sum + cp.progress, 0) / checkpoints.length;

  // Check time requirement
  const minWeeksRequired = 8; // Minimum 2 mesocycles
  const timeRequirementMet = weeksAtCurrentLevel >= minWeeksRequired;

  // All checkpoints achieved?
  const allCheckpointsAchieved = checkpoints.every((cp) => cp.achieved);

  // Ready to advance?
  const ready = allCheckpointsAchieved && timeRequirementMet;

  // Generate recommendations
  const recommendations = generateRecommendations(
    checkpoints,
    weeksAtCurrentLevel,
    minWeeksRequired,
    ready
  );

  // Estimate weeks to ready
  const estimatedWeeksToReady = ready
    ? 0
    : Math.max(
        minWeeksRequired - weeksAtCurrentLevel,
        estimateWeeksBasedOnProgress(overallProgress)
      );

  return {
    ready,
    currentSubLevel,
    nextSubLevel,
    overallProgress,
    checkpoints,
    recommendations,
    estimatedWeeksToReady,
  };
}

/**
 * Generate recommendations based on progress
 */
function generateRecommendations(
  checkpoints: ProgressionCheckpoint[],
  weeksAtLevel: number,
  minWeeks: number,
  ready: boolean
): string[] {
  const recommendations: string[] = [];

  if (ready) {
    recommendations.push('🎉 Congratulations! You are ready to advance!');
    recommendations.push('✅ All strength requirements met');
    recommendations.push(`✅ ${weeksAtLevel} weeks completed (minimum: ${minWeeks} weeks)`);
    recommendations.push('🚀 Consider re-assessment to officially advance');
    return recommendations;
  }

  // Time requirement
  if (weeksAtLevel < minWeeks) {
    const weeksRemaining = minWeeks - weeksAtLevel;
    recommendations.push(
      `⏳ Need ${weeksRemaining} more weeks (minimum ${minWeeks} weeks required)`
    );
  } else {
    recommendations.push(`✅ Time requirement met (${weeksAtLevel} weeks)`);
  }

  // Strength checkpoints
  const unachieved = checkpoints.filter((cp) => !cp.achieved);

  if (unachieved.length > 0) {
    recommendations.push(`\n💪 Work on these areas:`);

    unachieved.forEach((cp) => {
      const remaining = cp.target - cp.current;
      const percentComplete = Math.round(cp.progress * 100);
      recommendations.push(
        `  • ${cp.displayName}: ${remaining} more ${cp.unit} needed (${percentComplete}% complete)`
      );
    });
  }

  // Focus areas
  const lowestProgress = checkpoints.reduce((min, cp) => (cp.progress < min.progress ? cp : min));

  if (lowestProgress.progress < 0.5) {
    recommendations.push(
      `\n🎯 Primary focus: Improve ${lowestProgress.displayName} (weakest area)`
    );
  }

  return recommendations;
}

/**
 * Estimate weeks based on current progress
 */
function estimateWeeksBasedOnProgress(overallProgress: number): number {
  if (overallProgress >= 0.9) return 2;
  if (overallProgress >= 0.75) return 4;
  if (overallProgress >= 0.5) return 6;
  if (overallProgress >= 0.25) return 8;
  return 12;
}

// ==========================================
// PROGRESS TRENDS
// ==========================================

/**
 * Calculate performance improvement over time
 */
export function calculatePerformanceImprovement(
  initialMetrics: UserMetrics,
  currentMetrics: UserMetrics
): {
  pullUpsImprovement: number; // %
  dipsImprovement: number; // %
  weightedImprovement: number; // %
  overallImprovement: number; // %
} {
  const pullUpsImprovement =
    initialMetrics.pullUpsMax > 0
      ? ((currentMetrics.pullUpsMax - initialMetrics.pullUpsMax) / initialMetrics.pullUpsMax) *
        100
      : 0;

  const dipsImprovement =
    initialMetrics.dipsMax > 0
      ? ((currentMetrics.dipsMax - initialMetrics.dipsMax) / initialMetrics.dipsMax) * 100
      : 0;

  const weightedImprovement =
    initialMetrics.weightedPullUps > 0
      ? ((currentMetrics.weightedPullUps - initialMetrics.weightedPullUps) /
          initialMetrics.weightedPullUps) *
        100
      : 0;

  const overallImprovement = (pullUpsImprovement + dipsImprovement + weightedImprovement) / 3;

  return {
    pullUpsImprovement,
    dipsImprovement,
    weightedImprovement,
    overallImprovement,
  };
}

/**
 * Analyze performance trend (improving, plateauing, declining)
 */
export function analyzePerformanceTrend(
  history: ProgressionHistory[]
): 'IMPROVING' | 'PLATEAUING' | 'DECLINING' | 'INSUFFICIENT_DATA' {
  if (history.length < 3) return 'INSUFFICIENT_DATA';

  // Look at last 3 data points
  const recent = history.slice(-3);

  // Calculate trend in pull-ups (primary metric)
  const pullUpsTrend = recent.map((h) => h.metrics.pullUpsMax);

  const isImproving = pullUpsTrend.every((val, idx) => idx === 0 || val > pullUpsTrend[idx - 1]);

  const isDeclining = pullUpsTrend.every((val, idx) => idx === 0 || val < pullUpsTrend[idx - 1]);

  if (isImproving) return 'IMPROVING';
  if (isDeclining) return 'DECLINING';

  // Check if values are very similar (plateau)
  const maxDiff = Math.max(...pullUpsTrend) - Math.min(...pullUpsTrend);
  if (maxDiff <= 2) return 'PLATEAUING'; // Less than 2 reps change = plateau

  return 'PLATEAUING';
}

// ==========================================
// DISPLAY HELPERS
// ==========================================

/**
 * Get progress bar visual representation
 */
export function getProgressBar(progress: number, length: number = 20): string {
  const filled = Math.round(progress * length);
  const empty = length - filled;

  return '▰'.repeat(filled) + '▱'.repeat(empty);
}

/**
 * Get formatted progress summary
 */
export function getFormattedProgressSummary(readiness: ProgressionReadiness): string {
  let summary = '';

  summary += `📊 PROGRESSION STATUS\n`;
  summary += `=`.repeat(50) + '\n\n';

  summary += `Current Level: ${readiness.currentSubLevel}\n`;
  summary += `Next Level: ${readiness.nextSubLevel || 'MAX LEVEL'}\n`;
  summary += `Overall Progress: ${Math.round(readiness.overallProgress * 100)}%\n`;
  summary += `${getProgressBar(readiness.overallProgress)}\n\n`;

  if (readiness.checkpoints.length > 0) {
    summary += `Checkpoints:\n`;
    readiness.checkpoints.forEach((cp) => {
      const status = cp.achieved ? '✅' : '⏳';
      summary += `  ${status} ${cp.displayName}: ${cp.current}/${cp.target} ${cp.unit}\n`;
      summary += `     ${getProgressBar(cp.progress, 15)}\n`;
    });
    summary += '\n';
  }

  summary += `Recommendations:\n`;
  readiness.recommendations.forEach((rec) => {
    summary += `  ${rec}\n`;
  });

  if (readiness.estimatedWeeksToReady > 0) {
    summary += `\n⏱️  Estimated time to ready: ${readiness.estimatedWeeksToReady} weeks\n`;
  }

  return summary;
}

/**
 * Get achievement badge based on sublevel
 */
export function getAchievementBadge(subLevel: SubLevel): string {
  const badges: Record<string, string> = {
    D_MINUS: '🌱 Seedling',
    D: '🌱 Sprout',
    D_PLUS: '🌿 Growing',
    C_MINUS: '💪 Novice',
    C: '💪 Developing',
    C_PLUS: '💪 Strong',
    B_MINUS: '🔥 Intermediate',
    B: '🔥 Skilled',
    B_PLUS: '🔥 Proficient',
    A_MINUS: '⭐ Advanced',
    A: '⭐ Expert',
    A_PLUS: '⭐ Master',
    S_MINUS: '🏆 Elite',
    S: '🏆 Champion',
    S_PLUS: '👑 Legend',
  };

  return badges[subLevel] || '🎯 Athlete';
}
