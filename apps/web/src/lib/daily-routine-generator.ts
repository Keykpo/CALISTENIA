/**
 * EXPERT DAILY ROUTINE GENERATOR v3.0
 *
 * Uses professional expert routine templates from "El Ecosistema de la Calistenia" PDF
 * Maintains XP rewards per hexagon category + account XP + coins
 *
 * Based on Overcoming Gravity 2 (OG2) methodology and D-S Assessment System
 */

import type { MasteryGoal } from './fig-level-progressions';
import type { UnifiedHexagonAxis } from './unified-hexagon-system';
import {
  type UserStage,
  type TrainingMode,
  calculateUserStage,
} from './training-stages';
import {
  EXPERT_ROUTINE_TEMPLATES,
  type ExpertRoutine,
  type ExpertRoutineSection,
} from './expert-routine-templates';

export type RoutineDuration = '15min' | '30min' | '45min' | '60min';
export type EquipmentType = 'NONE' | 'PULL_UP_BAR' | 'RINGS' | 'PARALLEL_BARS' | 'RESISTANCE_BANDS';

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: string;
  difficulty: string;
  unit: 'reps' | 'time' | 'distance';
  muscleGroups?: string[];
  equipment: string[];
  expReward?: number;
  coinsReward?: number;
  gifUrl?: string;
  howTo?: string;
  instructions?: string[];
  thumbnailUrl?: string;
  videoUrl?: string | null;
}

export interface RoutineExercise {
  exercise: Exercise;
  sets: number;
  repsOrTime: number; // Reps if unit='reps', seconds if unit='time'
  restBetweenSets: number; // seconds
  trainingMode: TrainingMode; // BUFFER (Mode 1) or FAILURE (Mode 2)
  repsInReserve?: number; // For BUFFER mode: stay 2-3 reps from failure
  notes?: string;
  // NEW: Hexagon category for XP tracking
  hexagonCategory?: UnifiedHexagonAxis;
}

export interface DailyRoutinePhase {
  phase: 'WARMUP' | 'SKILL_PRACTICE' | 'STRENGTH' | 'COOLDOWN';
  duration: number; // estimated minutes
  exercises: RoutineExercise[];
}

export interface DailyRoutine {
  id: string;
  userId: string;
  date: Date;
  totalDuration: number; // minutes
  phases: DailyRoutinePhase[];
  focusAreas: UnifiedHexagonAxis[]; // Primary axes targeted
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
  stage: UserStage; // Training stage (determines workout structure)
  estimatedXP: number;
  estimatedCoins: number;
  // NEW: XP breakdown per hexagon axis
  xpPerAxis?: Partial<Record<UnifiedHexagonAxis, number>>;
}

export interface GenerateRoutineParams {
  userId: string;

  // User's current levels
  figLevels: Partial<Record<MasteryGoal, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'>>;
  hexagonLevels: Record<UnifiedHexagonAxis, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'>;

  // Hexagon XP values (needed for stage calculation)
  hexagonXP?: Partial<Record<UnifiedHexagonAxis, number>>;

  // User preferences
  goals: string[]; // e.g., ['strength', 'skills', 'endurance']
  equipment: EquipmentType[];
  duration: RoutineDuration;

  // Optional: force focus on specific areas
  focusAreas?: UnifiedHexagonAxis[];

  // Optional: target specific skill for skill mastery goal
  targetSkill?: MasteryGoal;

  // Optional: user stats for skill gating
  userStats?: {
    pullUps?: number;
    dips?: number;
    weightedPullUpsPercent?: number;
    weightedDipsPercent?: number;
  };

  // DEV ONLY: Force a specific day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  forceDay?: number;
}

/**
 * Map expert exercise names to hexagon axes for XP tracking
 */
const EXERCISE_NAME_TO_AXIS_MAP: Record<string, UnifiedHexagonAxis> = {
  // Balance exercises
  'Handstand Hold': 'balance',
  'Wall Handstand Hold': 'balance',
  'Frog Stand': 'balance',
  'Crow Pose': 'balance',
  'Tuck Planche': 'balance',
  'Straddle Planche': 'balance',
  'Full Planche': 'balance',
  'Planche Leans': 'balance',
  'Handstand Push-ups': 'balance',

  // Strength exercises (Push)
  'Push-ups': 'strength',
  'Incline Push-ups': 'strength',
  'Decline Push-ups': 'strength',
  'Diamond Push-ups': 'strength',
  'Archer Push-ups': 'strength',
  'Pseudo Planche Push-ups': 'strength',
  'Pike Push-ups': 'strength',
  'Pike Push-ups (elevated)': 'strength',
  'Dips': 'strength',
  'Negative Dips': 'strength',
  'Weighted Dips': 'strength',
  'Weighted Push-ups': 'strength',
  'Weighted Push-ups (vest or band)': 'strength',

  // Strength exercises (Pull)
  'Pull-ups': 'strength',
  'Chin-ups': 'strength',
  'Negative Pull-ups': 'strength',
  'Assisted Pull-ups': 'strength',
  'Weighted Pull-ups': 'strength',
  'Archer Pull-ups': 'strength',
  'L-Sit Pull-ups': 'strength',
  'Explosive Pull-ups': 'strength',

  // Static Holds / Skill Technique
  'Tuck Front Lever Hold': 'staticHolds',
  'Front Lever Hold': 'staticHolds',
  'Back Lever Hold': 'staticHolds',
  'L-Sit Hold': 'staticHolds',
  'Tuck L-Sit': 'staticHolds',
  'V-Sit Hold': 'staticHolds',
  'Human Flag': 'staticHolds',
  'Planche Hold': 'staticHolds',
  'Dead Hang': 'staticHolds',
  'German Hang': 'staticHolds',
  'Skin the Cat': 'staticHolds',

  // Core / Body Tension
  'Plank Hold': 'core',
  'Side Plank': 'core',
  'Hollow Body Hold': 'core',
  'Arch Hold': 'core',
  'Dragon Flag': 'core',
  'Dragon Flag Negatives': 'core',
  'Leg Raises': 'core',
  'Hanging Leg Raises': 'core',
  'Windshield Wipers': 'core',
  'Ab Wheel Rollout': 'core',

  // Endurance
  'Burpees': 'endurance',
  'Mountain Climbers': 'endurance',
  'Jump Squats': 'endurance',
  'High Knees': 'endurance',
  'Jumping Jacks': 'endurance',

  // Mobility / Warmup (use balance as default for warmups)
  'Wrist Circles': 'mobility',
  'Wrist Flexion Tilts': 'mobility',
  'Palm Push-ups': 'mobility',
  'Finger Push-ups': 'mobility',
  'Shoulder Rotations': 'mobility',
  'Arm Circles': 'mobility',
  'Arm Circles with Band': 'mobility',
  'Scapula Pull-ups': 'mobility',
  'Scapula Push-ups': 'mobility',
  'Scapular Pulls': 'mobility',
  'Scapula Activation': 'mobility',
  'Shoulder Mobility Complex': 'mobility',
  'Cat-Cow Stretch': 'mobility',
  'Wrist and Shoulder Stretches': 'mobility',
  'Lat and Shoulder Stretches': 'mobility',
  'Hip Flexor Stretch': 'mobility',
  'Hamstring Stretch': 'mobility',
  'Quad Stretch': 'mobility',

  // Legs (map to endurance for now, or we could add a 'legs' axis)
  'Squats': 'endurance',
  'Pistol Squats': 'endurance',
  'Bulgarian Split Squats': 'endurance',
  'Nordic Curls': 'endurance',
  'Calf Raises': 'endurance',
};

/**
 * Map exercise name to hexagon axis with fuzzy matching
 */
function mapExerciseToAxis(exerciseName: string): UnifiedHexagonAxis {
  // Exact match
  if (EXERCISE_NAME_TO_AXIS_MAP[exerciseName]) {
    return EXERCISE_NAME_TO_AXIS_MAP[exerciseName];
  }

  // Fuzzy match - check if exercise name contains keywords
  const nameLower = exerciseName.toLowerCase();

  // Balance keywords
  if (nameLower.includes('handstand') || nameLower.includes('planche') ||
      nameLower.includes('frog stand') || nameLower.includes('crow')) {
    return 'balance';
  }

  // Strength keywords (push)
  if (nameLower.includes('push-up') || nameLower.includes('pushup') ||
      nameLower.includes('dip') || nameLower.includes('bench')) {
    return 'strength';
  }

  // Strength keywords (pull)
  if (nameLower.includes('pull-up') || nameLower.includes('pullup') ||
      nameLower.includes('chin-up') || nameLower.includes('chinup') ||
      nameLower.includes('row')) {
    return 'strength';
  }

  // Static holds
  if (nameLower.includes('lever') || nameLower.includes('l-sit') ||
      nameLower.includes('hang') || nameLower.includes('hold')) {
    return 'staticHolds';
  }

  // Core
  if (nameLower.includes('plank') || nameLower.includes('hollow') ||
      nameLower.includes('dragon flag') || nameLower.includes('leg raise') ||
      nameLower.includes('core') || nameLower.includes('abs')) {
    return 'core';
  }

  // Endurance
  if (nameLower.includes('burpee') || nameLower.includes('jump') ||
      nameLower.includes('squat') || nameLower.includes('run') ||
      nameLower.includes('cardio')) {
    return 'endurance';
  }

  // Mobility/Warmup
  if (nameLower.includes('stretch') || nameLower.includes('mobility') ||
      nameLower.includes('wrist') || nameLower.includes('shoulder rotation') ||
      nameLower.includes('scapula')) {
    return 'mobility';
  }

  // Default to strength
  return 'strength';
}

/**
 * Create a generic Exercise object from expert template exercise
 */
function createExerciseFromTemplate(
  exerciseName: string,
  repsOrTime: number | string,
  mode: TrainingMode,
  hexagonAxis: UnifiedHexagonAxis
): Exercise {
  // Base XP and coins depend on hexagon axis and mode
  const baseXP = mode === 'FAILURE' ? 60 : 50; // Mode 2 gives more XP
  const baseCoins = mode === 'FAILURE' ? 6 : 5;

  // Determine unit based on repsOrTime format
  const unit: 'reps' | 'time' =
    typeof repsOrTime === 'string' &&
    (repsOrTime.includes('s') || repsOrTime.includes('sec') || repsOrTime.includes('min'))
      ? 'time'
      : 'reps';

  return {
    id: `expert-${exerciseName.toLowerCase().replace(/\s+/g, '-')}`,
    name: exerciseName,
    description: `Expert template exercise: ${exerciseName}`,
    category: hexagonAxis.toUpperCase(),
    difficulty: 'INTERMEDIATE', // Default, could be determined by stage
    unit,
    muscleGroups: [],
    equipment: ['NONE'],
    expReward: baseXP,
    coinsReward: baseCoins,
  };
}

/**
 * Parse repsOrTime string to number
 * Examples: "10 reps", "30s", "To failure", "8-12 reps"
 */
function parseRepsOrTime(repsOrTime: number | string): number {
  if (typeof repsOrTime === 'number') return repsOrTime;

  const str = repsOrTime.toString().toLowerCase();

  // Handle "to failure" - use 10 as default
  if (str.includes('failure')) return 10;

  // Handle time: "30s", "60s", "5 min"
  if (str.includes('min')) {
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1]) * 60 : 30;
  }
  if (str.includes('s') || str.includes('sec')) {
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1]) : 30;
  }

  // Handle ranges: "8-12", "10-15"
  const rangeMatch = str.match(/(\d+)-(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1]);
    const max = parseInt(rangeMatch[2]);
    return Math.floor((min + max) / 2); // Use average
  }

  // Handle "each direction", "each side"
  if (str.includes('each')) {
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1]) * 2 : 10; // Double it
  }

  // Extract first number
  const match = str.match(/(\d+)/);
  return match ? parseInt(match[1]) : 10;
}

/**
 * Convert expert template section to DailyRoutinePhase
 */
function convertExpertSectionToPhase(
  section: ExpertRoutineSection,
  allExercises: Exercise[]
): DailyRoutinePhase {
  const phaseMap: Record<string, 'WARMUP' | 'SKILL_PRACTICE' | 'STRENGTH' | 'COOLDOWN'> = {
    'WARMUP': 'WARMUP',
    'SKILL_PRACTICE': 'SKILL_PRACTICE',
    'SKILL_SUPPORT': 'STRENGTH', // Map SKILL_SUPPORT to STRENGTH phase
    'FUNDAMENTAL_STRENGTH': 'STRENGTH',
    'COOLDOWN': 'COOLDOWN',
  };

  const routineExercises: RoutineExercise[] = section.exercises.map(templateEx => {
    const hexagonAxis = mapExerciseToAxis(templateEx.name);

    // Try to find matching exercise in database
    let exercise = allExercises.find(ex =>
      ex.name.toLowerCase() === templateEx.name.toLowerCase()
    );

    // If not found, create generic exercise
    if (!exercise) {
      exercise = createExerciseFromTemplate(
        templateEx.name,
        templateEx.repsOrTime,
        templateEx.mode,
        hexagonAxis
      );
    }

    const parsedRepsOrTime = parseRepsOrTime(templateEx.repsOrTime);

    return {
      exercise,
      sets: templateEx.sets,
      repsOrTime: parsedRepsOrTime,
      restBetweenSets: templateEx.rest,
      trainingMode: templateEx.mode as TrainingMode,
      repsInReserve: templateEx.mode === 'BUFFER' ? 3 : undefined,
      notes: templateEx.notes,
      hexagonCategory: hexagonAxis,
    };
  });

  return {
    phase: phaseMap[section.section] || 'STRENGTH',
    duration: section.duration,
    exercises: routineExercises,
  };
}

/**
 * Calculate total XP, coins, and XP per hexagon axis
 */
function calculateRoutineRewards(phases: DailyRoutinePhase[]): {
  xp: number;
  coins: number;
  xpPerAxis: Partial<Record<UnifiedHexagonAxis, number>>;
} {
  let totalXP = 0;
  let totalCoins = 0;
  const xpPerAxis: Partial<Record<UnifiedHexagonAxis, number>> = {};

  phases.forEach(phase => {
    phase.exercises.forEach(({ exercise, sets, repsOrTime, hexagonCategory }) => {
      const baseXP = exercise.expReward || 50;
      const baseCoins = exercise.coinsReward || 5;

      // Volume factor based on sets and reps/time
      const volumeFactor = sets * (repsOrTime / 10);
      const exerciseXP = baseXP * volumeFactor;
      const exerciseCoins = baseCoins * volumeFactor;

      totalXP += exerciseXP;
      totalCoins += exerciseCoins;

      // Track XP per hexagon axis
      if (hexagonCategory) {
        xpPerAxis[hexagonCategory] = (xpPerAxis[hexagonCategory] || 0) + exerciseXP;
      }
    });
  });

  return {
    xp: Math.round(totalXP),
    coins: Math.round(totalCoins),
    xpPerAxis,
  };
}

/**
 * Determine session type based on day of week
 * Following the weekly splits from expert templates
 */
function getSessionTypeForDay(stage: UserStage, dayOfWeek: number): string {
  // dayOfWeek: 0 = Sunday, 1 = Monday, etc.

  const weeklyPatterns: Record<UserStage, string[]> = {
    STAGE_1: [
      'PUSH',      // Sunday
      'PULL',      // Monday
      'PUSH',      // Tuesday
      'REST',      // Wednesday
      'PULL',      // Thursday
      'PUSH',      // Friday
      'REST',      // Saturday
    ],
    STAGE_2: [
      'PUSH',      // Sunday
      'LEGS',      // Monday
      'PULL',      // Tuesday
      'REST',      // Wednesday
      'PUSH',      // Thursday
      'PULL',      // Friday
      'REST',      // Saturday
    ],
    STAGE_3: [
      'WEIGHTED_PUSH',  // Sunday
      'LEGS',           // Monday
      'WEIGHTED_PULL',  // Tuesday
      'REST',           // Wednesday
      'WEIGHTED_PUSH',  // Thursday
      'WEIGHTED_PULL',  // Friday
      'REST',           // Saturday
    ],
    STAGE_4: [
      'SKILLS_PUSH_WEIGHTED',  // Sunday
      'LEGS',                  // Monday
      'SKILLS_PULL_WEIGHTED',  // Tuesday
      'REST',                  // Wednesday
      'SKILLS_PUSH_ONLY',      // Thursday (not yet implemented)
      'SKILLS_PULL_ONLY',      // Friday (not yet implemented)
      'REST',                  // Saturday
    ],
  };

  const pattern = weeklyPatterns[stage] || weeklyPatterns.STAGE_1;
  const sessionType = pattern[dayOfWeek];

  // For STAGE_4 "only skills" days, fallback to weighted for now
  if (sessionType === 'SKILLS_PUSH_ONLY') return 'SKILLS_PUSH_WEIGHTED';
  if (sessionType === 'SKILLS_PULL_ONLY') return 'SKILLS_PULL_WEIGHTED';

  return sessionType;
}

/**
 * Get focus areas based on expert routine
 */
function getFocusAreasFromRoutine(routine: ExpertRoutine): UnifiedHexagonAxis[] {
  const axes = new Set<UnifiedHexagonAxis>();

  routine.sections.forEach(section => {
    section.exercises.forEach(ex => {
      const axis = mapExerciseToAxis(ex.name);
      axes.add(axis);
    });
  });

  return Array.from(axes).slice(0, 3); // Return top 3 axes
}

/**
 * MAIN FUNCTION: Generate daily routine using expert templates
 */
export function generateDailyRoutine(
  params: GenerateRoutineParams,
  allExercises: Exercise[]
): DailyRoutine {
  const {
    userId,
    hexagonLevels,
    hexagonXP,
    forceDay,
  } = params;

  // STEP 1: Calculate user's training stage
  const stage = calculateUserStage({
    strengthLevel: hexagonLevels.strength,
    strengthXP: hexagonXP?.strength || 0,
    balanceLevel: hexagonLevels.balance,
    staticHoldsLevel: hexagonLevels.staticHolds,
  });

  console.log('[EXPERT_ROUTINE] ===== EXPERT TEMPLATE ROUTINE GENERATION =====');
  console.log('[EXPERT_ROUTINE] User Stage:', stage);
  console.log('[EXPERT_ROUTINE] Hexagon Levels:', hexagonLevels);
  console.log('[EXPERT_ROUTINE] Hexagon XP:', hexagonXP);

  // STEP 2: Determine session type based on day of week
  const today = new Date();
  const dayOfWeek = forceDay !== undefined ? forceDay : today.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const sessionType = getSessionTypeForDay(stage, dayOfWeek);

  if (forceDay !== undefined) {
    console.log('[EXPERT_ROUTINE] 🔧 DEV MODE: Forcing day to:', dayNames[dayOfWeek], `(${dayOfWeek})`);
  } else {
    console.log('[EXPERT_ROUTINE] Today is:', dayNames[dayOfWeek], `(${dayOfWeek})`);
  }
  console.log('[EXPERT_ROUTINE] Session type for', stage, 'on', dayNames[dayOfWeek], ':', sessionType);

  // Handle REST days
  if (sessionType === 'REST') {
    console.log('[EXPERT_ROUTINE] REST day - generating light mobility routine');

    // Create a simple rest day routine
    const restPhase: DailyRoutinePhase = {
      phase: 'WARMUP',
      duration: 15,
      exercises: [
        {
          exercise: createExerciseFromTemplate('Rest Day Mobility', '15 min', 'BUFFER', 'mobility'),
          sets: 1,
          repsOrTime: 900, // 15 minutes
          restBetweenSets: 0,
          trainingMode: 'BUFFER',
          notes: 'Light mobility work, stretching, or active recovery',
          hexagonCategory: 'mobility',
        },
      ],
    };

    return {
      id: `routine-${userId}-${Date.now()}`,
      userId,
      date: new Date(),
      totalDuration: 15,
      phases: [restPhase],
      focusAreas: ['mobility'],
      difficulty: 'BEGINNER',
      stage,
      estimatedXP: 50,
      estimatedCoins: 5,
      xpPerAxis: { mobility: 50 },
    };
  }

  // STEP 3: Get expert template
  const templateKey = `${stage}_${sessionType}`;
  console.log('[EXPERT_ROUTINE] Looking for template with key:', templateKey);
  console.log('[EXPERT_ROUTINE] Available templates:', Object.keys(EXPERT_ROUTINE_TEMPLATES));

  const expertTemplate = EXPERT_ROUTINE_TEMPLATES[templateKey];

  if (!expertTemplate) {
    console.error('[EXPERT_ROUTINE] ❌ No template found for:', templateKey);
    console.error('[EXPERT_ROUTINE] This is a problem! Template should exist.');

    // Fallback to STAGE_1_PUSH
    const fallbackTemplate = EXPERT_ROUTINE_TEMPLATES['STAGE_1_PUSH'];
    const fallbackPhases = fallbackTemplate.sections.map(section =>
      convertExpertSectionToPhase(section, allExercises)
    );
    const rewards = calculateRoutineRewards(fallbackPhases);

    return {
      id: `routine-${userId}-${Date.now()}`,
      userId,
      date: new Date(),
      totalDuration: fallbackTemplate.totalDuration,
      phases: fallbackPhases,
      focusAreas: getFocusAreasFromRoutine(fallbackTemplate),
      difficulty: 'BEGINNER',
      stage,
      estimatedXP: rewards.xp,
      estimatedCoins: rewards.coins,
      xpPerAxis: rewards.xpPerAxis,
    };
  }

  console.log('[EXPERT_ROUTINE] ✅ Found template:', templateKey);
  console.log('[EXPERT_ROUTINE] Template info:', {
    stage: expertTemplate.stage,
    sessionType: expertTemplate.sessionType,
    totalDuration: expertTemplate.totalDuration,
    sectionsCount: expertTemplate.sections.length
  });
  console.log('[EXPERT_ROUTINE] Philosophy:', expertTemplate.philosophy);

  // STEP 4: Convert expert template to DailyRoutine format
  const phases = expertTemplate.sections.map(section =>
    convertExpertSectionToPhase(section, allExercises)
  );

  // STEP 5: Calculate rewards
  const rewards = calculateRoutineRewards(phases);

  console.log('[EXPERT_ROUTINE] Total XP:', rewards.xp, '| Total Coins:', rewards.coins);
  console.log('[EXPERT_ROUTINE] XP per axis:', rewards.xpPerAxis);

  // STEP 6: Determine overall difficulty
  const overallDifficulty = determineOverallDifficulty(hexagonLevels);

  return {
    id: `routine-${userId}-${Date.now()}`,
    userId,
    date: new Date(),
    totalDuration: expertTemplate.totalDuration,
    phases,
    focusAreas: getFocusAreasFromRoutine(expertTemplate),
    difficulty: overallDifficulty,
    stage,
    estimatedXP: rewards.xp,
    estimatedCoins: rewards.coins,
    xpPerAxis: rewards.xpPerAxis,
  };
}

/**
 * Determine user's overall difficulty level based on hexagon
 */
function determineOverallDifficulty(
  hexagonLevels: Record<UnifiedHexagonAxis, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'>
): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE' {
  const levelCounts = { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0, ELITE: 0 };

  Object.values(hexagonLevels).forEach(level => {
    levelCounts[level]++;
  });

  // Return the most common level
  if (levelCounts.ELITE >= 3) return 'ELITE';
  if (levelCounts.ADVANCED >= 3) return 'ADVANCED';
  if (levelCounts.INTERMEDIATE >= 3) return 'INTERMEDIATE';
  return 'BEGINNER';
}
