/**
 * ============================================================================
 * WEEKLY PROGRESSION SYSTEM
 * ============================================================================
 *
 * Implements periodization and progressive overload with mesocycle structure.
 *
 * PHILOSOPHY:
 * - 4-week mesocycles: 3 weeks progressive overload + 1 week deload
 * - Auto-adjust intensity and volume based on week number
 * - Prevent overtraining with planned deload weeks
 *
 * Based on: RUTINAS_POR_NIVEL weekly progression guidelines
 * ============================================================================
 */

import type { SubLevel } from './sublevel-system';

// ==========================================
// TYPES
// ==========================================

export interface WeeklyProgressionPlan {
  weekNumber: number; // Absolute week number (1-52)
  weekInCycle: number; // Week within current mesocycle (1-4)
  cycleNumber: number; // Which mesocycle (1, 2, 3...)
  isDeloadWeek: boolean;

  adjustments: {
    intensity: number; // Multiplier (0.7-1.15)
    volume: number; // Multiplier (0.6-1.0)
    restTime: number; // Multiplier (1.0-1.5)
  };

  expectedProgress: string;
  recommendations: string[];
}

export interface UserProgressionState {
  trainingSubLevel: SubLevel;
  currentWeek: number;
  programStartDate: Date;
  lastDeloadWeek?: number;
}

// ==========================================
// MESOCYCLE SYSTEM (4-week blocks)
// ==========================================

/**
 * Get weekly progression plan for a specific week
 *
 * MESOCYCLE STRUCTURE:
 * - Week 1: Base (100% intensity, 100% volume)
 * - Week 2: Progress (+5% intensity)
 * - Week 3: Peak (+10% intensity)
 * - Week 4: Deload (70% intensity, 60% volume, +50% rest)
 */
export function getWeeklyProgression(
  subLevel: SubLevel,
  weekNumber: number
): WeeklyProgressionPlan {
  // Calculate mesocycle info
  const cycleNumber = Math.ceil(weekNumber / 4);
  const weekInCycle = ((weekNumber - 1) % 4) + 1;
  const isDeloadWeek = weekInCycle === 4;

  if (isDeloadWeek) {
    return {
      weekNumber,
      weekInCycle,
      cycleNumber,
      isDeloadWeek: true,
      adjustments: {
        intensity: 0.7, // 70% intensity
        volume: 0.6, // 60% volume (fewer sets/reps)
        restTime: 1.5, // +50% rest between sets
      },
      expectedProgress: 'Deload Week - Active Recovery',
      recommendations: [
        '💤 Focus on recovery and adaptation',
        '✅ Complete all sets with perfect form',
        '❌ Do NOT push to failure',
        '🧘 Extra stretching and mobility work',
        '💪 Your body is adapting and getting stronger',
      ],
    };
  }

  // Progressive overload weeks (1-3)
  const intensityBoost = (weekInCycle - 1) * 0.05; // 0%, 5%, 10%

  return {
    weekNumber,
    weekInCycle,
    cycleNumber,
    isDeloadWeek: false,
    adjustments: {
      intensity: 1.0 + intensityBoost,
      volume: 1.0, // Keep volume constant
      restTime: 1.0, // Standard rest
    },
    expectedProgress: getProgressDescription(weekInCycle),
    recommendations: getRecommendations(weekInCycle, subLevel),
  };
}

/**
 * Get progress description for progressive overload weeks
 */
function getProgressDescription(weekInCycle: number): string {
  switch (weekInCycle) {
    case 1:
      return 'Week 1: Foundation - Establish baseline';
    case 2:
      return 'Week 2: Progress - +5% intensity push';
    case 3:
      return 'Week 3: Peak - +10% intensity, max effort';
    default:
      return 'Active training week';
  }
}

/**
 * Get specific recommendations based on week and sublevel
 */
function getRecommendations(weekInCycle: number, subLevel: SubLevel): string[] {
  const baseRecommendations: Record<number, string[]> = {
    1: [
      '🎯 Focus on perfect form and technique',
      '📊 Track your performance - this is your baseline',
      '💪 Build momentum gradually',
      '✅ Complete all prescribed sets',
    ],
    2: [
      '📈 Push slightly harder than last week',
      '💪 Aim for +1-2 reps or +5-10 seconds on holds',
      '🔥 Increase intensity but maintain form',
      '⚡ You should feel challenged but not destroyed',
    ],
    3: [
      '🏆 Peak week - maximum effort',
      '💪 Push close to failure on final sets',
      '📊 This week reveals your progress',
      '🔥 Give it everything - deload is next week',
    ],
  };

  const recommendations = baseRecommendations[weekInCycle] || [];

  // Add sublevel-specific advice
  if (subLevel.startsWith('D') || subLevel.startsWith('C')) {
    recommendations.push('🌱 Consistency is key at this stage');
  } else if (subLevel.startsWith('B')) {
    recommendations.push('🔥 Add weight when you hit top of rep range');
  } else if (subLevel.startsWith('A') || subLevel.startsWith('S')) {
    recommendations.push('⭐ Balance skill work (Mode 1) and strength (Mode 2)');
  }

  return recommendations;
}

// ==========================================
// VOLUME & INTENSITY ADJUSTMENTS
// ==========================================

/**
 * Apply progression adjustments to exercise sets/reps
 */
export function applyProgressionToExercise(
  baseSets: number,
  baseReps: number | undefined,
  baseDuration: number | undefined,
  progression: WeeklyProgressionPlan
): {
  sets: number;
  reps?: number;
  duration?: number;
} {
  const { intensity, volume } = progression.adjustments;

  // For deload: reduce volume (sets) and intensity (reps/duration)
  if (progression.isDeloadWeek) {
    return {
      sets: Math.max(1, Math.round(baseSets * volume)),
      reps: baseReps ? Math.max(1, Math.round(baseReps * intensity)) : undefined,
      duration: baseDuration ? Math.max(5, Math.round(baseDuration * intensity)) : undefined,
    };
  }

  // For progressive overload: keep sets, increase reps/duration
  return {
    sets: baseSets,
    reps: baseReps ? Math.round(baseReps * intensity) : undefined,
    duration: baseDuration ? Math.round(baseDuration * intensity) : undefined,
  };
}

/**
 * Apply progression adjustment to rest time
 */
export function applyProgressionToRest(
  baseRest: number,
  progression: WeeklyProgressionPlan
): number {
  return Math.round(baseRest * progression.adjustments.restTime);
}

// ==========================================
// PROGRESSION STATE MANAGEMENT
// ==========================================

/**
 * Calculate current week number from program start date
 */
export function calculateCurrentWeek(programStartDate: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - programStartDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.ceil(diffDays / 7);

  return weekNumber;
}

/**
 * Check if it's time for user to advance to next sublevel
 *
 * Criteria:
 * - Completed at least 8 weeks (2 mesocycles) at current sublevel
 * - Consistent performance improvements
 * - Meets strength requirements for next level
 */
export function shouldAdvanceToNextLevel(
  userState: UserProgressionState,
  performanceImprovement: number // % improvement over starting metrics
): {
  shouldAdvance: boolean;
  reason: string;
  weeksAtCurrentLevel: number;
} {
  const weeksAtCurrentLevel = userState.currentWeek;

  // Minimum time requirement: 2 mesocycles (8 weeks)
  if (weeksAtCurrentLevel < 8) {
    return {
      shouldAdvance: false,
      reason: `Need ${8 - weeksAtCurrentLevel} more weeks at current level (minimum 8 weeks)`,
      weeksAtCurrentLevel,
    };
  }

  // Performance improvement threshold
  const requiredImprovement = getRequiredImprovementForLevel(userState.trainingSubLevel);

  if (performanceImprovement < requiredImprovement) {
    return {
      shouldAdvance: false,
      reason: `Need ${(requiredImprovement - performanceImprovement).toFixed(1)}% more improvement (${requiredImprovement}% required)`,
      weeksAtCurrentLevel,
    };
  }

  // Ready to advance!
  return {
    shouldAdvance: true,
    reason: '🎉 Consistent progress demonstrated - ready to advance!',
    weeksAtCurrentLevel,
  };
}

/**
 * Get required performance improvement % for each sublevel
 */
function getRequiredImprovementForLevel(subLevel: SubLevel): number {
  // D levels: 20-30% improvement (fast beginner gains)
  if (subLevel.startsWith('D')) return 20;

  // C levels: 15-20% improvement (still good gains)
  if (subLevel.startsWith('C')) return 15;

  // B levels: 10-15% improvement (intermediate gains)
  if (subLevel.startsWith('B')) return 10;

  // A levels: 5-10% improvement (advanced gains slow down)
  if (subLevel.startsWith('A')) return 5;

  // S levels: 3-5% improvement (elite gains are small)
  return 3;
}

// ==========================================
// MESOCYCLE SUMMARY
// ==========================================

/**
 * Get summary for completed mesocycle
 */
export function getMesocycleSummary(
  cycleNumber: number,
  startWeek: number,
  endWeek: number
): {
  cycleNumber: number;
  weeks: number[];
  expectedOutcome: string;
  keyFocus: string[];
} {
  const weeks = [startWeek, startWeek + 1, startWeek + 2, startWeek + 3];

  return {
    cycleNumber,
    weeks,
    expectedOutcome: 'Strength increase + adaptation + recovery',
    keyFocus: [
      'Week 1: Establish baseline with perfect form',
      'Week 2: Progressive overload (+5%)',
      'Week 3: Peak performance (+10%)',
      'Week 4: Deload and recovery',
    ],
  };
}

/**
 * Get next deload week number
 */
export function getNextDeloadWeek(currentWeek: number): number {
  const weekInCycle = ((currentWeek - 1) % 4) + 1;
  const weeksUntilDeload = 4 - weekInCycle;
  return currentWeek + weeksUntilDeload;
}

/**
 * Check if user should take unplanned deload
 *
 * Indicators:
 * - Performance declining for 2+ weeks
 * - Excessive fatigue
 * - Joint pain
 */
export function shouldTakeUnplannedDeload(
  recentPerformanceTrend: number[] // Last 3 weeks performance scores (0-100)
): {
  shouldDeload: boolean;
  reason: string;
} {
  if (recentPerformanceTrend.length < 2) {
    return { shouldDeload: false, reason: 'Insufficient data' };
  }

  // Check for declining trend
  const isDeclining = recentPerformanceTrend.every(
    (score, idx) => idx === 0 || score < recentPerformanceTrend[idx - 1]
  );

  if (isDeclining && recentPerformanceTrend.length >= 2) {
    return {
      shouldDeload: true,
      reason: '⚠️ Performance declining - take extra recovery week',
    };
  }

  // Check for very low performance (< 60%)
  const recentAverage =
    recentPerformanceTrend.reduce((a, b) => a + b, 0) / recentPerformanceTrend.length;

  if (recentAverage < 60) {
    return {
      shouldDeload: true,
      reason: '⚠️ Performance consistently low - extra recovery needed',
    };
  }

  return { shouldDeload: false, reason: 'Performance on track' };
}

// ==========================================
// DISPLAY HELPERS
// ==========================================

/**
 * Get user-friendly week description
 */
export function getWeekDescription(progression: WeeklyProgressionPlan): string {
  if (progression.isDeloadWeek) {
    return `💤 Week ${progression.weekNumber} (Deload) - Recovery & Adaptation`;
  }

  const intensity = Math.round((progression.adjustments.intensity - 1) * 100);
  return `💪 Week ${progression.weekNumber} (${progression.weekInCycle}/4) - ${intensity > 0 ? '+' : ''}${intensity}% Intensity`;
}

/**
 * Get progress bar representation
 */
export function getWeekProgressBar(progression: WeeklyProgressionPlan): string {
  const bars = ['▱', '▱', '▱', '▱'];
  for (let i = 0; i < progression.weekInCycle; i++) {
    bars[i] = progression.isDeloadWeek && i === 3 ? '💤' : '▰';
  }
  return bars.join(' ');
}
