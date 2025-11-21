/**
 * Workout to Hexagon Synchronization System
 *
 * This module bridges the workout completion system with the unified hexagon XP system.
 * It calculates proper XP rewards based on exercises completed and updates both
 * visual values and XP fields in the hexagon profile.
 */

import prisma from '@/lib/prisma';
import {
  migrateToUnifiedHexagon,
  updateUnifiedAxisXP,
  getUnifiedAxisVisualField,
  getUnifiedAxisXPField,
  getUnifiedAxisLevelField,
  type UnifiedHexagonAxis,
  type UnifiedHexagonProfile,
} from './unified-hexagon-system';
import {
  CATEGORY_TO_PRIMARY_AXIS,
  CATEGORY_TO_SECONDARY_AXIS,
  XP_BY_DIFFICULTY,
  type ExerciseCategory,
} from './exercise-to-axis-mapping';

/**
 * Detect exercise category from name
 */
export function detectExerciseCategory(exerciseName: string): ExerciseCategory {
  const name = exerciseName.toLowerCase();

  // Pull exercises
  if (/dominada|pull|row|jalón|chin/.test(name)) {
    return 'PULL';
  }

  // Push exercises
  if (/flexion|push|fondos|dip|press/.test(name)) {
    return 'PUSH';
  }

  // Static holds
  if (/lever|planche|l-sit|v-sit|flag|maltese/.test(name)) {
    return 'STATICS';
  }

  // Balance exercises
  if (/handstand|pino|equilibrio|balance|crow|frog/.test(name)) {
    return 'BALANCE';
  }

  // Core exercises
  if (/plancha|plank|hollow|core|abdominal|crunch|sit-up/.test(name)) {
    return 'CORE';
  }

  // Lower body
  if (/sentadilla|squat|pistol|lunge|estocada|step|leg/.test(name)) {
    return 'LOWER_BODY';
  }

  // Flexibility/Mobility
  if (/estiramiento|stretch|movilidad|split|bridge|puente|pnf|yoga/.test(name)) {
    return 'FLEXIBILITY';
  }

  // Cardio
  if (/cardio|interval|tempo|fartlek|emom|circuit|burpee|jump/.test(name)) {
    return 'CARDIO';
  }

  // Warm-up
  if (/calentamiento|warm|movilidad|circulos|rotación/.test(name)) {
    return 'WARM_UP';
  }

  // Default to PUSH as most common
  return 'PUSH';
}

/**
 * Calculate XP rewards for a completed exercise
 */
export function calculateExerciseXPRewards(
  exerciseName: string,
  difficulty: string,
  sets: number = 1
): Partial<Record<UnifiedHexagonAxis, number>> {
  const category = detectExerciseCategory(exerciseName);
  const primaryAxis = CATEGORY_TO_PRIMARY_AXIS[category];
  const secondaryAxes = CATEGORY_TO_SECONDARY_AXIS[category] || [];
  const xpValues = XP_BY_DIFFICULTY[difficulty.toUpperCase()] || XP_BY_DIFFICULTY.BEGINNER;

  const rewards: Partial<Record<UnifiedHexagonAxis, number>> = {
    [primaryAxis]: Math.round(xpValues.primary * sets),
  };

  // Add secondary XP (reduced amount)
  secondaryAxes.forEach(axis => {
    rewards[axis] = (rewards[axis] || 0) + Math.round(xpValues.secondary * sets);
  });

  return rewards;
}

/**
 * Interface for exercise completion data
 */
export interface CompletedExerciseData {
  name: string;
  sets?: number;
  reps?: string;
  durationSec?: number;
  category?: ExerciseCategory;
}

/**
 * Update hexagon profile with XP from completed workout
 * Returns updated profile and details about XP gains
 */
export async function syncWorkoutToHexagon(
  userId: string,
  exercises: CompletedExerciseData[],
  difficulty: string
): Promise<{
  success: boolean;
  totalXPGained: number;
  axisXPGains: Partial<Record<UnifiedHexagonAxis, number>>;
  updatedProfile: any;
  levelUps: { axis: UnifiedHexagonAxis; oldLevel: string; newLevel: string }[];
}> {
  // Get or create hexagon profile
  let hexProfile = await prisma.hexagonProfile.findUnique({
    where: { userId },
  });

  if (!hexProfile) {
    hexProfile = await prisma.hexagonProfile.create({
      data: {
        userId,
        relativeStrength: 0,
        muscularEndurance: 0,
        balanceControl: 0,
        jointMobility: 0,
        bodyTension: 0,
        skillTechnique: 0,
        relativeStrengthXP: 0,
        muscularEnduranceXP: 0,
        balanceControlXP: 0,
        jointMobilityXP: 0,
        bodyTensionXP: 0,
        skillTechniqueXP: 0,
      },
    });
  }

  // Migrate to unified profile
  let unifiedProfile = migrateToUnifiedHexagon(hexProfile);
  const oldLevels: Record<UnifiedHexagonAxis, string> = {
    balance: unifiedProfile.balanceLevel,
    strength: unifiedProfile.strengthLevel,
    staticHolds: unifiedProfile.staticHoldsLevel,
    core: unifiedProfile.coreLevel,
    endurance: unifiedProfile.enduranceLevel,
    mobility: unifiedProfile.mobilityLevel,
  };

  // Aggregate XP from all exercises
  const totalXPGains: Partial<Record<UnifiedHexagonAxis, number>> = {};

  for (const exercise of exercises) {
    const rewards = calculateExerciseXPRewards(
      exercise.name,
      difficulty,
      exercise.sets || 1
    );

    // Add to totals
    for (const [axis, xp] of Object.entries(rewards)) {
      totalXPGains[axis as UnifiedHexagonAxis] =
        (totalXPGains[axis as UnifiedHexagonAxis] || 0) + (xp || 0);
    }
  }

  // Apply XP to unified profile
  const dbUpdates: Record<string, any> = {};

  for (const [axis, xp] of Object.entries(totalXPGains)) {
    if (xp && xp > 0) {
      unifiedProfile = updateUnifiedAxisXP(
        unifiedProfile,
        axis as UnifiedHexagonAxis,
        xp
      );

      // Prepare database updates
      const visualField = getUnifiedAxisVisualField(axis as UnifiedHexagonAxis);
      const xpField = getUnifiedAxisXPField(axis as UnifiedHexagonAxis);
      const levelField = getUnifiedAxisLevelField(axis as UnifiedHexagonAxis);

      dbUpdates[visualField] = unifiedProfile[axis as keyof UnifiedHexagonProfile];
      dbUpdates[xpField] = unifiedProfile[`${axis}XP` as keyof UnifiedHexagonProfile];
      dbUpdates[levelField] = unifiedProfile[`${axis}Level` as keyof UnifiedHexagonProfile];
    }
  }

  // Save to database
  const savedProfile = await prisma.hexagonProfile.update({
    where: { userId },
    data: dbUpdates,
  });

  // Detect level ups
  const levelUps: { axis: UnifiedHexagonAxis; oldLevel: string; newLevel: string }[] = [];
  const axes: UnifiedHexagonAxis[] = ['balance', 'strength', 'staticHolds', 'core', 'endurance', 'mobility'];

  for (const axis of axes) {
    const newLevel = unifiedProfile[`${axis}Level` as keyof UnifiedHexagonProfile] as string;
    if (oldLevels[axis] !== newLevel) {
      levelUps.push({
        axis,
        oldLevel: oldLevels[axis],
        newLevel,
      });
    }
  }

  // Calculate total XP gained
  const totalXPGained = Object.values(totalXPGains).reduce((sum, xp) => sum + (xp || 0), 0);

  return {
    success: true,
    totalXPGained,
    axisXPGains: totalXPGains,
    updatedProfile: savedProfile,
    levelUps,
  };
}

/**
 * Quick sync for a single exercise completion
 */
export async function syncSingleExercise(
  userId: string,
  exerciseName: string,
  difficulty: string,
  sets: number = 1
): Promise<{
  success: boolean;
  xpGained: Partial<Record<UnifiedHexagonAxis, number>>;
}> {
  const result = await syncWorkoutToHexagon(userId, [{ name: exerciseName, sets }], difficulty);

  return {
    success: result.success,
    xpGained: result.axisXPGains,
  };
}

/**
 * Get user's current hexagon progress summary
 */
export async function getHexagonProgressSummary(userId: string): Promise<{
  profile: UnifiedHexagonProfile | null;
  weakestAxis: UnifiedHexagonAxis | null;
  strongestAxis: UnifiedHexagonAxis | null;
  overallLevel: string;
  nextMilestone: { axis: UnifiedHexagonAxis; xpNeeded: number } | null;
}> {
  const hexProfile = await prisma.hexagonProfile.findUnique({
    where: { userId },
  });

  if (!hexProfile) {
    return {
      profile: null,
      weakestAxis: null,
      strongestAxis: null,
      overallLevel: 'BEGINNER',
      nextMilestone: null,
    };
  }

  const unifiedProfile = migrateToUnifiedHexagon(hexProfile);
  const axes: UnifiedHexagonAxis[] = ['balance', 'strength', 'staticHolds', 'core', 'endurance', 'mobility'];

  // Find weakest and strongest by XP
  let weakestAxis: UnifiedHexagonAxis = 'balance';
  let strongestAxis: UnifiedHexagonAxis = 'balance';
  let minXP = unifiedProfile.balanceXP;
  let maxXP = unifiedProfile.balanceXP;

  for (const axis of axes) {
    const xp = unifiedProfile[`${axis}XP` as keyof UnifiedHexagonProfile] as number;
    if (xp < minXP) {
      minXP = xp;
      weakestAxis = axis;
    }
    if (xp > maxXP) {
      maxXP = xp;
      strongestAxis = axis;
    }
  }

  // Calculate overall level (mode of all levels)
  const levelCounts: Record<string, number> = {};
  for (const axis of axes) {
    const level = unifiedProfile[`${axis}Level` as keyof UnifiedHexagonProfile] as string;
    levelCounts[level] = (levelCounts[level] || 0) + 1;
  }

  let overallLevel = 'BEGINNER';
  let maxCount = 0;
  for (const [level, count] of Object.entries(levelCounts)) {
    if (count > maxCount) {
      maxCount = count;
      overallLevel = level;
    }
  }

  // Find next milestone (closest level up)
  const levelThresholds = {
    BEGINNER: 48000,
    INTERMEDIATE: 144000,
    ADVANCED: 384000,
    ELITE: Infinity,
  };

  let nextMilestone: { axis: UnifiedHexagonAxis; xpNeeded: number } | null = null;
  let minXPNeeded = Infinity;

  for (const axis of axes) {
    const currentXP = unifiedProfile[`${axis}XP` as keyof UnifiedHexagonProfile] as number;
    const currentLevel = unifiedProfile[`${axis}Level` as keyof UnifiedHexagonProfile] as string;

    if (currentLevel !== 'ELITE') {
      const threshold = levelThresholds[currentLevel as keyof typeof levelThresholds];
      const xpNeeded = threshold - currentXP;

      if (xpNeeded < minXPNeeded) {
        minXPNeeded = xpNeeded;
        nextMilestone = { axis, xpNeeded };
      }
    }
  }

  return {
    profile: unifiedProfile,
    weakestAxis,
    strongestAxis,
    overallLevel,
    nextMilestone,
  };
}
