/**
 * Exercise to Hexagon Axis Mapping
 *
 * This file maps exercise categories and specific exercises to hexagon axes.
 * Used to determine which axis receives XP when an exercise is completed.
 */

import { type UnifiedHexagonAxis } from './unified-hexagon-system';

/**
 * Exercise categories from exercises_biomech_modified.json
 */
export type ExerciseCategory =
  | 'PUSH'
  | 'PULL'
  | 'CORE'
  | 'BALANCE'
  | 'LOWER_BODY'
  | 'STATICS'
  | 'WARM_UP'
  | 'LEGS'
  | 'CARDIO'
  | 'FLEXIBILITY';

/**
 * Map exercise categories to primary hexagon axis
 * Each exercise primarily trains ONE axis, but may contribute to others secondarily
 */
export const CATEGORY_TO_PRIMARY_AXIS: Record<ExerciseCategory, UnifiedHexagonAxis> = {
  PUSH: 'strength',          // Push-ups, Dips → Strength
  PULL: 'strength',          // Pull-ups, Rows → Strength
  CORE: 'core',              // Planks, L-sits → Core
  BALANCE: 'balance',        // Handstands → Balance
  LOWER_BODY: 'endurance',   // Squats, Pistols → Endurance
  LEGS: 'endurance',         // Leg exercises → Endurance
  STATICS: 'staticHolds',    // Planche, Lever → Static Holds
  WARM_UP: 'mobility',       // Mobility work → Joint Mobility
  CARDIO: 'endurance',       // Cardio → Endurance
  FLEXIBILITY: 'mobility',   // Stretching → Joint Mobility
};

/**
 * Map exercise categories to secondary axes (smaller XP contribution)
 */
export const CATEGORY_TO_SECONDARY_AXIS: Partial<Record<ExerciseCategory, UnifiedHexagonAxis[]>> = {
  PUSH: ['staticHolds'],           // Also improves technique
  PULL: ['staticHolds'],           // Also improves technique
  BALANCE: ['staticHolds', 'core'], // Balance needs core control
  STATICS: ['balance', 'core'],    // Static holds need balance + core
  CORE: ['balance'],               // Core work improves balance
};

/**
 * XP rewards based on exercise difficulty (10x multiplier for realistic progression)
 */
export const XP_BY_DIFFICULTY: Record<string, { primary: number; secondary: number }> = {
  BEGINNER: { primary: 250, secondary: 100 },
  INTERMEDIATE: { primary: 500, secondary: 200 },
  ADVANCED: { primary: 1000, secondary: 400 },
  ELITE: { primary: 2000, secondary: 800 },
};

/**
 * Get XP rewards for completing an exercise
 * Returns object with axes and XP amounts
 */
export function getExerciseXPRewards(
  category: ExerciseCategory,
  difficulty: string
): Partial<Record<UnifiedHexagonAxis, number>> {
  const primaryAxis = CATEGORY_TO_PRIMARY_AXIS[category];
  const secondaryAxes = CATEGORY_TO_SECONDARY_AXIS[category] || [];
  const xpValues = XP_BY_DIFFICULTY[difficulty] || XP_BY_DIFFICULTY.BEGINNER;

  const rewards: Partial<Record<UnifiedHexagonAxis, number>> = {
    [primaryAxis]: xpValues.primary,
  };

  // Add secondary XP
  secondaryAxes.forEach(axis => {
    rewards[axis] = (rewards[axis] || 0) + xpValues.secondary;
  });

  return rewards;
}

/**
 * Mission types targeting specific axes
 */
export interface AxisMission {
  id: string;
  targetAxis: UnifiedHexagonAxis;
  requiredLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
  description: string;
  exerciseCategory: ExerciseCategory;
  target: number; // reps, time in seconds, or count
  targetUnit: 'reps' | 'seconds' | 'count';
  rewardXP: number;
  rewardCoins: number;
}

/**
 * Mission pool organized by axis and level
 * These missions are designed to target specific hexagon axes
 */
export const AXIS_MISSIONS: Record<UnifiedHexagonAxis, AxisMission[]> = {
  strength: [
    {
      id: 'rel-str-beginner-pushups',
      targetAxis: 'strength',
      requiredLevel: 'BEGINNER',
      description: 'Complete 15 push-ups',
      exerciseCategory: 'PUSH',
      target: 15,
      targetUnit: 'reps',
      rewardXP: 500,
      rewardCoins: 100,
    },
    {
      id: 'rel-str-beginner-pullups',
      targetAxis: 'strength',
      requiredLevel: 'BEGINNER',
      description: 'Complete 5 assisted pull-ups',
      exerciseCategory: 'PULL',
      target: 5,
      targetUnit: 'reps',
      rewardXP: 500,
      rewardCoins: 100,
    },
    {
      id: 'rel-str-intermediate-pullups',
      targetAxis: 'strength',
      requiredLevel: 'INTERMEDIATE',
      description: 'Complete 10 pull-ups',
      exerciseCategory: 'PULL',
      target: 10,
      targetUnit: 'reps',
      rewardXP: 1000,
      rewardCoins: 200,
    },
    {
      id: 'rel-str-advanced-dips',
      targetAxis: 'strength',
      requiredLevel: 'ADVANCED',
      description: 'Complete 20 dips',
      exerciseCategory: 'PUSH',
      target: 20,
      targetUnit: 'reps',
      rewardXP: 1500,
      rewardCoins: 300,
    },
  ],

  muscularEndurance: [
    {
      id: 'mus-end-beginner-squats',
      targetAxis: 'endurance',
      requiredLevel: 'BEGINNER',
      description: 'Complete 30 bodyweight squats',
      exerciseCategory: 'LOWER_BODY',
      target: 30,
      targetUnit: 'reps',
      rewardXP: 500,
      rewardCoins: 100,
    },
    {
      id: 'mus-end-intermediate-lunges',
      targetAxis: 'endurance',
      requiredLevel: 'INTERMEDIATE',
      description: 'Complete 40 walking lunges',
      exerciseCategory: 'LEGS',
      target: 40,
      targetUnit: 'reps',
      rewardXP: 1000,
      rewardCoins: 200,
    },
    {
      id: 'mus-end-advanced-pistols',
      targetAxis: 'endurance',
      requiredLevel: 'ADVANCED',
      description: 'Complete 10 pistol squats per leg',
      exerciseCategory: 'LOWER_BODY',
      target: 20,
      targetUnit: 'reps',
      rewardXP: 1500,
      rewardCoins: 300,
    },
  ],

  balanceControl: [
    {
      id: 'bal-ctrl-beginner-wall-hs',
      targetAxis: 'balance',
      requiredLevel: 'BEGINNER',
      description: 'Hold wall handstand for 60 seconds total',
      exerciseCategory: 'BALANCE',
      target: 60,
      targetUnit: 'seconds',
      rewardXP: 500,
      rewardCoins: 100,
    },
    {
      id: 'bal-ctrl-intermediate-crow',
      targetAxis: 'balance',
      requiredLevel: 'INTERMEDIATE',
      description: 'Hold crow pose for 30 seconds',
      exerciseCategory: 'BALANCE',
      target: 30,
      targetUnit: 'seconds',
      rewardXP: 1000,
      rewardCoins: 200,
    },
    {
      id: 'bal-ctrl-advanced-freestanding-hs',
      targetAxis: 'balance',
      requiredLevel: 'ADVANCED',
      description: 'Hold freestanding handstand for 10 seconds',
      exerciseCategory: 'BALANCE',
      target: 10,
      targetUnit: 'seconds',
      rewardXP: 1500,
      rewardCoins: 300,
    },
  ],

  jointMobility: [
    {
      id: 'joint-mob-beginner-shoulder',
      targetAxis: 'mobility',
      requiredLevel: 'BEGINNER',
      description: 'Complete 5 minutes of shoulder mobility work',
      exerciseCategory: 'WARM_UP',
      target: 300,
      targetUnit: 'seconds',
      rewardXP: 500,
      rewardCoins: 100,
    },
    {
      id: 'joint-mob-intermediate-full-routine',
      targetAxis: 'mobility',
      requiredLevel: 'INTERMEDIATE',
      description: 'Complete full mobility routine (10 exercises)',
      exerciseCategory: 'FLEXIBILITY',
      target: 10,
      targetUnit: 'count',
      rewardXP: 1000,
      rewardCoins: 200,
    },
    {
      id: 'joint-mob-advanced-bridges',
      targetAxis: 'mobility',
      requiredLevel: 'ADVANCED',
      description: 'Hold bridge position for 60 seconds',
      exerciseCategory: 'FLEXIBILITY',
      target: 60,
      targetUnit: 'seconds',
      rewardXP: 1500,
      rewardCoins: 300,
    },
  ],

  bodyTension: [
    {
      id: 'body-ten-beginner-plank',
      targetAxis: 'core',
      requiredLevel: 'BEGINNER',
      description: 'Hold plank for 90 seconds total',
      exerciseCategory: 'CORE',
      target: 90,
      targetUnit: 'seconds',
      rewardXP: 500,
      rewardCoins: 100,
    },
    {
      id: 'body-ten-intermediate-lsit',
      targetAxis: 'core',
      requiredLevel: 'INTERMEDIATE',
      description: 'Hold L-sit for 20 seconds',
      exerciseCategory: 'CORE',
      target: 20,
      targetUnit: 'seconds',
      rewardXP: 1000,
      rewardCoins: 200,
    },
    {
      id: 'body-ten-advanced-frontlever',
      targetAxis: 'core',
      requiredLevel: 'ADVANCED',
      description: 'Hold front lever progression for 15 seconds',
      exerciseCategory: 'STATICS',
      target: 15,
      targetUnit: 'seconds',
      rewardXP: 1500,
      rewardCoins: 300,
    },
  ],

  skillTechnique: [
    {
      id: 'skill-tech-beginner-form',
      targetAxis: 'staticHolds',
      requiredLevel: 'BEGINNER',
      description: 'Practice 3 different exercises with perfect form',
      exerciseCategory: 'PUSH',
      target: 3,
      targetUnit: 'count',
      rewardXP: 500,
      rewardCoins: 100,
    },
    {
      id: 'skill-tech-intermediate-muscleup-prog',
      targetAxis: 'staticHolds',
      requiredLevel: 'INTERMEDIATE',
      description: 'Practice muscle-up progressions (5 sets)',
      exerciseCategory: 'PULL',
      target: 5,
      targetUnit: 'count',
      rewardXP: 1000,
      rewardCoins: 200,
    },
    {
      id: 'skill-tech-advanced-combo',
      targetAxis: 'staticHolds',
      requiredLevel: 'ADVANCED',
      description: 'Complete 3 advanced skill combinations',
      exerciseCategory: 'STATICS',
      target: 3,
      targetUnit: 'count',
      rewardXP: 1500,
      rewardCoins: 300,
    },
  ],
};

/**
 * Get missions for a specific axis and level
 */
export function getMissionsForAxisAndLevel(
  axis: UnifiedHexagonAxis,
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'
): AxisMission[] {
  return AXIS_MISSIONS[axis].filter(mission => mission.requiredLevel === level);
}

/**
 * Get random daily missions based on user's hexagon levels
 * Returns missions that target the weakest axes to encourage balanced development
 */
export function generateDailyMissions(
  hexagonLevels: Record<UnifiedHexagonAxis, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'>,
  count: number = 3
): AxisMission[] {
  // Sort axes by level (weakest first) to encourage balanced growth
  const axesByLevel = (Object.keys(hexagonLevels) as UnifiedHexagonAxis[]).sort((a, b) => {
    const levelOrder = { BEGINNER: 0, INTERMEDIATE: 1, ADVANCED: 2, ELITE: 3 };
    return levelOrder[hexagonLevels[a]] - levelOrder[hexagonLevels[b]];
  });

  const missions: AxisMission[] = [];
  let axisIndex = 0;

  // Pick missions from weakest axes
  while (missions.length < count && axisIndex < axesByLevel.length) {
    const axis = axesByLevel[axisIndex];
    const level = hexagonLevels[axis];
    const availableMissions = getMissionsForAxisAndLevel(axis, level);

    if (availableMissions.length > 0) {
      // Pick random mission for this axis
      const randomMission = availableMissions[Math.floor(Math.random() * availableMissions.length)];
      missions.push(randomMission);
    }

    axisIndex++;
  }

  return missions;
}

/**
 * Goal-specific missions
 * Missions tailored to user's training goal
 */
export interface GoalMission extends AxisMission {
  goal: string; // handstand, strength, front_lever, etc.
}

export const GOAL_SPECIFIC_MISSIONS: Record<string, GoalMission[]> = {
  handstand: [
    {
      id: 'handstand-beginner-wall',
      targetAxis: 'balance',
      requiredLevel: 'BEGINNER',
      description: 'Hold wall handstand for 30 seconds total',
      exerciseCategory: 'BALANCE',
      target: 30,
      targetUnit: 'seconds',
      rewardXP: 600,
      rewardCoins: 150,
      goal: 'handstand',
    },
    {
      id: 'handstand-intermediate-holds',
      targetAxis: 'balance',
      requiredLevel: 'INTERMEDIATE',
      description: 'Hold freestanding handstand 3 x 10 seconds',
      exerciseCategory: 'BALANCE',
      target: 30,
      targetUnit: 'seconds',
      rewardXP: 1200,
      rewardCoins: 300,
      goal: 'handstand',
    },
    {
      id: 'handstand-advanced-holds',
      targetAxis: 'balance',
      requiredLevel: 'ADVANCED',
      description: 'Hold freestanding handstand 5 x 15 seconds',
      exerciseCategory: 'BALANCE',
      target: 75,
      targetUnit: 'seconds',
      rewardXP: 1800,
      rewardCoins: 45,
      goal: 'handstand',
    },
  ],

  strength: [
    {
      id: 'strength-beginner-pushups',
      targetAxis: 'strength',
      requiredLevel: 'BEGINNER',
      description: 'Complete 15 push-ups',
      exerciseCategory: 'PUSH',
      target: 15,
      targetUnit: 'reps',
      rewardXP: 600,
      rewardCoins: 150,
      goal: 'strength',
    },
    {
      id: 'strength-intermediate-pullups',
      targetAxis: 'strength',
      requiredLevel: 'INTERMEDIATE',
      description: 'Complete 10 pull-ups',
      exerciseCategory: 'PULL',
      target: 10,
      targetUnit: 'reps',
      rewardXP: 1200,
      rewardCoins: 300,
      goal: 'strength',
    },
    {
      id: 'strength-advanced-combo',
      targetAxis: 'strength',
      requiredLevel: 'ADVANCED',
      description: 'Complete 15 dips + 12 pull-ups',
      exerciseCategory: 'PUSH',
      target: 27,
      targetUnit: 'reps',
      rewardXP: 1800,
      rewardCoins: 45,
      goal: 'strength',
    },
  ],

  front_lever: [
    {
      id: 'frontlever-beginner-tuck',
      targetAxis: 'core',
      requiredLevel: 'BEGINNER',
      description: 'Hold tuck front lever for 15 seconds',
      exerciseCategory: 'STATICS',
      target: 15,
      targetUnit: 'seconds',
      rewardXP: 600,
      rewardCoins: 150,
      goal: 'front_lever',
    },
    {
      id: 'frontlever-intermediate-adv-tuck',
      targetAxis: 'core',
      requiredLevel: 'INTERMEDIATE',
      description: 'Hold advanced tuck front lever 3 x 10s',
      exerciseCategory: 'STATICS',
      target: 30,
      targetUnit: 'seconds',
      rewardXP: 1200,
      rewardCoins: 300,
      goal: 'front_lever',
    },
    {
      id: 'frontlever-advanced-one-leg',
      targetAxis: 'core',
      requiredLevel: 'ADVANCED',
      description: 'Hold one-leg front lever 5 x 8 seconds',
      exerciseCategory: 'STATICS',
      target: 40,
      targetUnit: 'seconds',
      rewardXP: 1800,
      rewardCoins: 45,
      goal: 'front_lever',
    },
  ],

  planche: [
    {
      id: 'planche-beginner-lean',
      targetAxis: 'core',
      requiredLevel: 'BEGINNER',
      description: 'Hold planche lean for 30 seconds',
      exerciseCategory: 'STATICS',
      target: 30,
      targetUnit: 'seconds',
      rewardXP: 600,
      rewardCoins: 150,
      goal: 'planche',
    },
    {
      id: 'planche-intermediate-tuck',
      targetAxis: 'core',
      requiredLevel: 'INTERMEDIATE',
      description: 'Hold tuck planche 4 x 10 seconds',
      exerciseCategory: 'STATICS',
      target: 40,
      targetUnit: 'seconds',
      rewardXP: 1200,
      rewardCoins: 300,
      goal: 'planche',
    },
    {
      id: 'planche-advanced-adv-tuck',
      targetAxis: 'core',
      requiredLevel: 'ADVANCED',
      description: 'Hold advanced tuck planche 5 x 8s',
      exerciseCategory: 'STATICS',
      target: 40,
      targetUnit: 'seconds',
      rewardXP: 1800,
      rewardCoins: 45,
      goal: 'planche',
    },
  ],

  general: [
    {
      id: 'general-beginner-basic',
      targetAxis: 'endurance',
      requiredLevel: 'BEGINNER',
      description: 'Complete 20 squats + 10 push-ups',
      exerciseCategory: 'LOWER_BODY',
      target: 30,
      targetUnit: 'reps',
      rewardXP: 600,
      rewardCoins: 150,
      goal: 'general',
    },
    {
      id: 'general-intermediate-circuit',
      targetAxis: 'endurance',
      requiredLevel: 'INTERMEDIATE',
      description: 'Complete full-body circuit (3 rounds)',
      exerciseCategory: 'CARDIO',
      target: 3,
      targetUnit: 'count',
      rewardXP: 1200,
      rewardCoins: 300,
      goal: 'general',
    },
    {
      id: 'general-advanced-hiit',
      targetAxis: 'endurance',
      requiredLevel: 'ADVANCED',
      description: 'Complete 20 min HIIT workout',
      exerciseCategory: 'CARDIO',
      target: 1200,
      targetUnit: 'seconds',
      rewardXP: 1800,
      rewardCoins: 45,
      goal: 'general',
    },
  ],
};

/**
 * Generate 5 daily missions based on user goal and hexagon levels
 *
 * Distribution:
 * - 2 missions focused on user's goal
 * - 2 missions targeting weakest axes
 * - 1 bonus mission (streak, recovery, etc.)
 */
export function generateGoalBasedDailyMissions(
  userGoal: string,
  hexagonLevels: Record<UnifiedHexagonAxis, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'>,
  count: number = 5
): AxisMission[] {
  const missions: AxisMission[] = [];

  // Normalize goal name
  const goalKey = userGoal.toLowerCase().replace(/[_\s]/g, '_');
  const goalMissions = GOAL_SPECIFIC_MISSIONS[goalKey] || GOAL_SPECIFIC_MISSIONS['general'];

  // 1. Add 2 goal-specific missions
  const userLevel = Object.values(hexagonLevels)[0] || 'BEGINNER'; // Use first axis as reference
  const availableGoalMissions = goalMissions.filter(m => m.requiredLevel === userLevel);

  if (availableGoalMissions.length > 0) {
    // Pick 2 random goal missions
    const shuffled = [...availableGoalMissions].sort(() => Math.random() - 0.5);
    missions.push(...shuffled.slice(0, Math.min(2, shuffled.length)));
  }

  // 2. Add 2 missions for weakest axes
  const axesByLevel = (Object.keys(hexagonLevels) as UnifiedHexagonAxis[]).sort((a, b) => {
    const levelOrder = { BEGINNER: 0, INTERMEDIATE: 1, ADVANCED: 2, ELITE: 3 };
    return levelOrder[hexagonLevels[a]] - levelOrder[hexagonLevels[b]];
  });

  for (let i = 0; i < 2 && missions.length < 4; i++) {
    const axis = axesByLevel[i];
    if (!axis) break;

    const level = hexagonLevels[axis];
    const axisMissions = getMissionsForAxisAndLevel(axis, level);

    if (axisMissions.length > 0) {
      // Pick random mission for this axis
      const randomMission = axisMissions[Math.floor(Math.random() * axisMissions.length)];
      // Avoid duplicates
      if (!missions.find(m => m.id === randomMission.id)) {
        missions.push(randomMission);
      }
    }
  }

  // 3. Add 1 bonus mission (always available)
  const bonusMissions: AxisMission[] = [
    {
      id: 'bonus-hydration',
      targetAxis: 'mobility',
      requiredLevel: 'BEGINNER',
      description: 'Stay hydrated during workout',
      exerciseCategory: 'WARM_UP',
      target: 1,
      targetUnit: 'count',
      rewardXP: 1000,
      rewardCoins: 500,
    },
    {
      id: 'bonus-stretching',
      targetAxis: 'mobility',
      requiredLevel: 'BEGINNER',
      description: 'Complete 5-minute stretching routine',
      exerciseCategory: 'FLEXIBILITY',
      target: 300,
      targetUnit: 'seconds',
      rewardXP: 300,
      rewardCoins: 100,
    },
    {
      id: 'bonus-recovery',
      targetAxis: 'mobility',
      requiredLevel: 'BEGINNER',
      description: 'Take a recovery walk (15 minutes)',
      exerciseCategory: 'CARDIO',
      target: 900,
      targetUnit: 'seconds',
      rewardXP: 250,
      rewardCoins: 80,
    },
  ];

  if (missions.length < count) {
    const randomBonus = bonusMissions[Math.floor(Math.random() * bonusMissions.length)];
    missions.push(randomBonus);
  }

  return missions.slice(0, count);
}
