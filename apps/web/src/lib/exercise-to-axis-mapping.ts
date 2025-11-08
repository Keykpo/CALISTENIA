/**
 * Exercise to Hexagon Axis Mapping
 *
 * This file maps exercise categories and specific exercises to hexagon axes.
 * Used to determine which axis receives XP when an exercise is completed.
 */

import { type HexagonAxis } from './hexagon-progression';

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
export const CATEGORY_TO_PRIMARY_AXIS: Record<ExerciseCategory, HexagonAxis> = {
  PUSH: 'relativeStrength',          // Push-ups, Dips → Strength
  PULL: 'relativeStrength',          // Pull-ups, Rows → Strength
  CORE: 'bodyTension',               // Planks, L-sits → Body Tension
  BALANCE: 'balanceControl',         // Handstands → Balance
  LOWER_BODY: 'muscularEndurance',   // Squats, Pistols → Endurance
  LEGS: 'muscularEndurance',         // Leg exercises → Endurance
  STATICS: 'bodyTension',            // Planche, Lever → Body Tension
  WARM_UP: 'jointMobility',          // Mobility work → Joint Mobility
  CARDIO: 'muscularEndurance',       // Cardio → Endurance
  FLEXIBILITY: 'jointMobility',      // Stretching → Joint Mobility
};

/**
 * Map exercise categories to secondary axes (smaller XP contribution)
 */
export const CATEGORY_TO_SECONDARY_AXIS: Partial<Record<ExerciseCategory, HexagonAxis[]>> = {
  PUSH: ['skillTechnique'],          // Also improves technique
  PULL: ['skillTechnique'],          // Also improves technique
  BALANCE: ['skillTechnique', 'bodyTension'], // Balance needs tension control
  STATICS: ['balanceControl', 'skillTechnique'], // Static holds need balance + technique
  CORE: ['balanceControl'],          // Core work improves balance
};

/**
 * XP rewards based on exercise difficulty
 */
export const XP_BY_DIFFICULTY: Record<string, { primary: number; secondary: number }> = {
  BEGINNER: { primary: 25, secondary: 10 },
  INTERMEDIATE: { primary: 50, secondary: 20 },
  ADVANCED: { primary: 100, secondary: 40 },
  ELITE: { primary: 200, secondary: 80 },
};

/**
 * Get XP rewards for completing an exercise
 * Returns object with axes and XP amounts
 */
export function getExerciseXPRewards(
  category: ExerciseCategory,
  difficulty: string
): Record<HexagonAxis, number> {
  const primaryAxis = CATEGORY_TO_PRIMARY_AXIS[category];
  const secondaryAxes = CATEGORY_TO_SECONDARY_AXIS[category] || [];
  const xpValues = XP_BY_DIFFICULTY[difficulty] || XP_BY_DIFFICULTY.BEGINNER;

  const rewards: Partial<Record<HexagonAxis, number>> = {
    [primaryAxis]: xpValues.primary,
  };

  // Add secondary XP
  secondaryAxes.forEach(axis => {
    rewards[axis] = (rewards[axis] || 0) + xpValues.secondary;
  });

  return rewards as Record<HexagonAxis, number>;
}

/**
 * Mission types targeting specific axes
 */
export interface AxisMission {
  id: string;
  targetAxis: HexagonAxis;
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
export const AXIS_MISSIONS: Record<HexagonAxis, AxisMission[]> = {
  relativeStrength: [
    {
      id: 'rel-str-beginner-pushups',
      targetAxis: 'relativeStrength',
      requiredLevel: 'BEGINNER',
      description: 'Complete 15 push-ups',
      exerciseCategory: 'PUSH',
      target: 15,
      targetUnit: 'reps',
      rewardXP: 50,
      rewardCoins: 10,
    },
    {
      id: 'rel-str-beginner-pullups',
      targetAxis: 'relativeStrength',
      requiredLevel: 'BEGINNER',
      description: 'Complete 5 assisted pull-ups',
      exerciseCategory: 'PULL',
      target: 5,
      targetUnit: 'reps',
      rewardXP: 50,
      rewardCoins: 10,
    },
    {
      id: 'rel-str-intermediate-pullups',
      targetAxis: 'relativeStrength',
      requiredLevel: 'INTERMEDIATE',
      description: 'Complete 10 pull-ups',
      exerciseCategory: 'PULL',
      target: 10,
      targetUnit: 'reps',
      rewardXP: 100,
      rewardCoins: 20,
    },
    {
      id: 'rel-str-advanced-dips',
      targetAxis: 'relativeStrength',
      requiredLevel: 'ADVANCED',
      description: 'Complete 20 dips',
      exerciseCategory: 'PUSH',
      target: 20,
      targetUnit: 'reps',
      rewardXP: 150,
      rewardCoins: 30,
    },
  ],

  muscularEndurance: [
    {
      id: 'mus-end-beginner-squats',
      targetAxis: 'muscularEndurance',
      requiredLevel: 'BEGINNER',
      description: 'Complete 30 bodyweight squats',
      exerciseCategory: 'LOWER_BODY',
      target: 30,
      targetUnit: 'reps',
      rewardXP: 50,
      rewardCoins: 10,
    },
    {
      id: 'mus-end-intermediate-lunges',
      targetAxis: 'muscularEndurance',
      requiredLevel: 'INTERMEDIATE',
      description: 'Complete 40 walking lunges',
      exerciseCategory: 'LEGS',
      target: 40,
      targetUnit: 'reps',
      rewardXP: 100,
      rewardCoins: 20,
    },
    {
      id: 'mus-end-advanced-pistols',
      targetAxis: 'muscularEndurance',
      requiredLevel: 'ADVANCED',
      description: 'Complete 10 pistol squats per leg',
      exerciseCategory: 'LOWER_BODY',
      target: 20,
      targetUnit: 'reps',
      rewardXP: 150,
      rewardCoins: 30,
    },
  ],

  balanceControl: [
    {
      id: 'bal-ctrl-beginner-wall-hs',
      targetAxis: 'balanceControl',
      requiredLevel: 'BEGINNER',
      description: 'Hold wall handstand for 60 seconds total',
      exerciseCategory: 'BALANCE',
      target: 60,
      targetUnit: 'seconds',
      rewardXP: 50,
      rewardCoins: 10,
    },
    {
      id: 'bal-ctrl-intermediate-crow',
      targetAxis: 'balanceControl',
      requiredLevel: 'INTERMEDIATE',
      description: 'Hold crow pose for 30 seconds',
      exerciseCategory: 'BALANCE',
      target: 30,
      targetUnit: 'seconds',
      rewardXP: 100,
      rewardCoins: 20,
    },
    {
      id: 'bal-ctrl-advanced-freestanding-hs',
      targetAxis: 'balanceControl',
      requiredLevel: 'ADVANCED',
      description: 'Hold freestanding handstand for 10 seconds',
      exerciseCategory: 'BALANCE',
      target: 10,
      targetUnit: 'seconds',
      rewardXP: 150,
      rewardCoins: 30,
    },
  ],

  jointMobility: [
    {
      id: 'joint-mob-beginner-shoulder',
      targetAxis: 'jointMobility',
      requiredLevel: 'BEGINNER',
      description: 'Complete 5 minutes of shoulder mobility work',
      exerciseCategory: 'WARM_UP',
      target: 300,
      targetUnit: 'seconds',
      rewardXP: 50,
      rewardCoins: 10,
    },
    {
      id: 'joint-mob-intermediate-full-routine',
      targetAxis: 'jointMobility',
      requiredLevel: 'INTERMEDIATE',
      description: 'Complete full mobility routine (10 exercises)',
      exerciseCategory: 'FLEXIBILITY',
      target: 10,
      targetUnit: 'count',
      rewardXP: 100,
      rewardCoins: 20,
    },
    {
      id: 'joint-mob-advanced-bridges',
      targetAxis: 'jointMobility',
      requiredLevel: 'ADVANCED',
      description: 'Hold bridge position for 60 seconds',
      exerciseCategory: 'FLEXIBILITY',
      target: 60,
      targetUnit: 'seconds',
      rewardXP: 150,
      rewardCoins: 30,
    },
  ],

  bodyTension: [
    {
      id: 'body-ten-beginner-plank',
      targetAxis: 'bodyTension',
      requiredLevel: 'BEGINNER',
      description: 'Hold plank for 90 seconds total',
      exerciseCategory: 'CORE',
      target: 90,
      targetUnit: 'seconds',
      rewardXP: 50,
      rewardCoins: 10,
    },
    {
      id: 'body-ten-intermediate-lsit',
      targetAxis: 'bodyTension',
      requiredLevel: 'INTERMEDIATE',
      description: 'Hold L-sit for 20 seconds',
      exerciseCategory: 'CORE',
      target: 20,
      targetUnit: 'seconds',
      rewardXP: 100,
      rewardCoins: 20,
    },
    {
      id: 'body-ten-advanced-frontlever',
      targetAxis: 'bodyTension',
      requiredLevel: 'ADVANCED',
      description: 'Hold front lever progression for 15 seconds',
      exerciseCategory: 'STATICS',
      target: 15,
      targetUnit: 'seconds',
      rewardXP: 150,
      rewardCoins: 30,
    },
  ],

  skillTechnique: [
    {
      id: 'skill-tech-beginner-form',
      targetAxis: 'skillTechnique',
      requiredLevel: 'BEGINNER',
      description: 'Practice 3 different exercises with perfect form',
      exerciseCategory: 'PUSH',
      target: 3,
      targetUnit: 'count',
      rewardXP: 50,
      rewardCoins: 10,
    },
    {
      id: 'skill-tech-intermediate-muscleup-prog',
      targetAxis: 'skillTechnique',
      requiredLevel: 'INTERMEDIATE',
      description: 'Practice muscle-up progressions (5 sets)',
      exerciseCategory: 'PULL',
      target: 5,
      targetUnit: 'count',
      rewardXP: 100,
      rewardCoins: 20,
    },
    {
      id: 'skill-tech-advanced-combo',
      targetAxis: 'skillTechnique',
      requiredLevel: 'ADVANCED',
      description: 'Complete 3 advanced skill combinations',
      exerciseCategory: 'STATICS',
      target: 3,
      targetUnit: 'count',
      rewardXP: 150,
      rewardCoins: 30,
    },
  ],
};

/**
 * Get missions for a specific axis and level
 */
export function getMissionsForAxisAndLevel(
  axis: HexagonAxis,
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'
): AxisMission[] {
  return AXIS_MISSIONS[axis].filter(mission => mission.requiredLevel === level);
}

/**
 * Get random daily missions based on user's hexagon levels
 * Returns missions that target the weakest axes to encourage balanced development
 */
export function generateDailyMissions(
  hexagonLevels: Record<HexagonAxis, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'>,
  count: number = 3
): AxisMission[] {
  // Sort axes by level (weakest first) to encourage balanced growth
  const axesByLevel = (Object.keys(hexagonLevels) as HexagonAxis[]).sort((a, b) => {
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
      targetAxis: 'balanceControl',
      requiredLevel: 'BEGINNER',
      description: 'Hold wall handstand for 30 seconds total',
      exerciseCategory: 'BALANCE',
      target: 30,
      targetUnit: 'seconds',
      rewardXP: 60,
      rewardCoins: 15,
      goal: 'handstand',
    },
    {
      id: 'handstand-intermediate-holds',
      targetAxis: 'balanceControl',
      requiredLevel: 'INTERMEDIATE',
      description: 'Hold freestanding handstand 3 x 10 seconds',
      exerciseCategory: 'BALANCE',
      target: 30,
      targetUnit: 'seconds',
      rewardXP: 120,
      rewardCoins: 30,
      goal: 'handstand',
    },
    {
      id: 'handstand-advanced-holds',
      targetAxis: 'balanceControl',
      requiredLevel: 'ADVANCED',
      description: 'Hold freestanding handstand 5 x 15 seconds',
      exerciseCategory: 'BALANCE',
      target: 75,
      targetUnit: 'seconds',
      rewardXP: 180,
      rewardCoins: 45,
      goal: 'handstand',
    },
  ],

  strength: [
    {
      id: 'strength-beginner-pushups',
      targetAxis: 'relativeStrength',
      requiredLevel: 'BEGINNER',
      description: 'Complete 15 push-ups',
      exerciseCategory: 'PUSH',
      target: 15,
      targetUnit: 'reps',
      rewardXP: 60,
      rewardCoins: 15,
      goal: 'strength',
    },
    {
      id: 'strength-intermediate-pullups',
      targetAxis: 'relativeStrength',
      requiredLevel: 'INTERMEDIATE',
      description: 'Complete 10 pull-ups',
      exerciseCategory: 'PULL',
      target: 10,
      targetUnit: 'reps',
      rewardXP: 120,
      rewardCoins: 30,
      goal: 'strength',
    },
    {
      id: 'strength-advanced-combo',
      targetAxis: 'relativeStrength',
      requiredLevel: 'ADVANCED',
      description: 'Complete 15 dips + 12 pull-ups',
      exerciseCategory: 'PUSH',
      target: 27,
      targetUnit: 'reps',
      rewardXP: 180,
      rewardCoins: 45,
      goal: 'strength',
    },
  ],

  front_lever: [
    {
      id: 'frontlever-beginner-tuck',
      targetAxis: 'bodyTension',
      requiredLevel: 'BEGINNER',
      description: 'Hold tuck front lever for 15 seconds',
      exerciseCategory: 'STATICS',
      target: 15,
      targetUnit: 'seconds',
      rewardXP: 60,
      rewardCoins: 15,
      goal: 'front_lever',
    },
    {
      id: 'frontlever-intermediate-adv-tuck',
      targetAxis: 'bodyTension',
      requiredLevel: 'INTERMEDIATE',
      description: 'Hold advanced tuck front lever 3 x 10s',
      exerciseCategory: 'STATICS',
      target: 30,
      targetUnit: 'seconds',
      rewardXP: 120,
      rewardCoins: 30,
      goal: 'front_lever',
    },
    {
      id: 'frontlever-advanced-one-leg',
      targetAxis: 'bodyTension',
      requiredLevel: 'ADVANCED',
      description: 'Hold one-leg front lever 5 x 8 seconds',
      exerciseCategory: 'STATICS',
      target: 40,
      targetUnit: 'seconds',
      rewardXP: 180,
      rewardCoins: 45,
      goal: 'front_lever',
    },
  ],

  planche: [
    {
      id: 'planche-beginner-lean',
      targetAxis: 'bodyTension',
      requiredLevel: 'BEGINNER',
      description: 'Hold planche lean for 30 seconds',
      exerciseCategory: 'STATICS',
      target: 30,
      targetUnit: 'seconds',
      rewardXP: 60,
      rewardCoins: 15,
      goal: 'planche',
    },
    {
      id: 'planche-intermediate-tuck',
      targetAxis: 'bodyTension',
      requiredLevel: 'INTERMEDIATE',
      description: 'Hold tuck planche 4 x 10 seconds',
      exerciseCategory: 'STATICS',
      target: 40,
      targetUnit: 'seconds',
      rewardXP: 120,
      rewardCoins: 30,
      goal: 'planche',
    },
    {
      id: 'planche-advanced-adv-tuck',
      targetAxis: 'bodyTension',
      requiredLevel: 'ADVANCED',
      description: 'Hold advanced tuck planche 5 x 8s',
      exerciseCategory: 'STATICS',
      target: 40,
      targetUnit: 'seconds',
      rewardXP: 180,
      rewardCoins: 45,
      goal: 'planche',
    },
  ],

  general: [
    {
      id: 'general-beginner-basic',
      targetAxis: 'muscularEndurance',
      requiredLevel: 'BEGINNER',
      description: 'Complete 20 squats + 10 push-ups',
      exerciseCategory: 'LOWER_BODY',
      target: 30,
      targetUnit: 'reps',
      rewardXP: 60,
      rewardCoins: 15,
      goal: 'general',
    },
    {
      id: 'general-intermediate-circuit',
      targetAxis: 'muscularEndurance',
      requiredLevel: 'INTERMEDIATE',
      description: 'Complete full-body circuit (3 rounds)',
      exerciseCategory: 'CARDIO',
      target: 3,
      targetUnit: 'count',
      rewardXP: 120,
      rewardCoins: 30,
      goal: 'general',
    },
    {
      id: 'general-advanced-hiit',
      targetAxis: 'muscularEndurance',
      requiredLevel: 'ADVANCED',
      description: 'Complete 20 min HIIT workout',
      exerciseCategory: 'CARDIO',
      target: 1200,
      targetUnit: 'seconds',
      rewardXP: 180,
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
  hexagonLevels: Record<HexagonAxis, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'>,
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
  const axesByLevel = (Object.keys(hexagonLevels) as HexagonAxis[]).sort((a, b) => {
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
      targetAxis: 'jointMobility',
      requiredLevel: 'BEGINNER',
      description: 'Stay hydrated during workout',
      exerciseCategory: 'WARM_UP',
      target: 1,
      targetUnit: 'count',
      rewardXP: 10,
      rewardCoins: 5,
    },
    {
      id: 'bonus-stretching',
      targetAxis: 'jointMobility',
      requiredLevel: 'BEGINNER',
      description: 'Complete 5-minute stretching routine',
      exerciseCategory: 'FLEXIBILITY',
      target: 300,
      targetUnit: 'seconds',
      rewardXP: 30,
      rewardCoins: 10,
    },
    {
      id: 'bonus-recovery',
      targetAxis: 'jointMobility',
      requiredLevel: 'BEGINNER',
      description: 'Take a recovery walk (15 minutes)',
      exerciseCategory: 'CARDIO',
      target: 900,
      targetUnit: 'seconds',
      rewardXP: 25,
      rewardCoins: 8,
    },
  ];

  if (missions.length < count) {
    const randomBonus = bonusMissions[Math.floor(Math.random() * bonusMissions.length)];
    missions.push(randomBonus);
  }

  return missions.slice(0, count);
}
