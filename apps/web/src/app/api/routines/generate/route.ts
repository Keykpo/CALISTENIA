import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calculateUnifiedOverallLevel, migrateToUnifiedHexagon } from '@/lib/unified-hexagon-system';
import * as fs from 'fs';
import * as path from 'path';

export const runtime = 'nodejs';

async function getUserId(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id as string;
  } catch {}
  const headerUser = req.headers.get('x-user-id');
  if (headerUser) return headerUser;
  return null;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  unit: string;
  muscleGroups: string[];
  equipment: string[];
  expReward: number;
  coinsReward: number;
  howTo: string;
  gifUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string | null;
  coachingTip?: string;
}

interface RoutineExercise {
  exercise: Exercise;
  sets: number;
  repsOrDuration: string;
  restSeconds: number;
  notes?: string;
}

interface Routine {
  name: string;
  description: string;
  goal: string;
  difficulty: string;
  durationMinutes: number;
  exercises: RoutineExercise[];
  warmupExercises: RoutineExercise[];
  cooldownExercises: RoutineExercise[];
}

// Load exercises from JSON file
function loadExercises(): Exercise[] {
  const filePath = path.join(process.cwd(), '..', '..', 'database', 'exercises_biomech_modified.json');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error loading exercises:', error);
    return [];
  }
}

// Map fitness level to NEW difficulty levels (FIG Chart standardization)
const DIFFICULTY_BY_LEVEL: Record<string, string[]> = {
  BEGINNER: ['BEGINNER', 'INTERMEDIATE'],
  INTERMEDIATE: ['INTERMEDIATE', 'BEGINNER'],
  ADVANCED: ['INTERMEDIATE', 'ADVANCED'],
  ELITE: ['ADVANCED', 'ELITE'],
  // Legacy support
  EXPERT: ['ADVANCED', 'ELITE'],
};

// Map goal to category focus
const CATEGORY_BY_GOAL: Record<string, { primary: string[]; secondary: string[] }> = {
  strength: {
    primary: ['STRENGTH'],
    secondary: ['CORE', 'SKILL_STATIC'],
  },
  muscle: {
    primary: ['STRENGTH'],
    secondary: ['CORE'],
  },
  fat_loss: {
    primary: ['CARDIO', 'STRENGTH'],
    secondary: ['CORE'],
  },
  front_lever: {
    primary: ['SKILL_STATIC'],
    secondary: ['STRENGTH', 'CORE'],
  },
  planche: {
    primary: ['SKILL_STATIC'],
    secondary: ['STRENGTH', 'CORE'],
  },
  handstand: {
    primary: ['BALANCE', 'SKILL_STATIC'],
    secondary: ['STRENGTH', 'CORE'],
  },
  muscle_up: {
    primary: ['STRENGTH', 'SKILL_STATIC'],
    secondary: ['CORE'],
  },
  general: {
    primary: ['STRENGTH', 'CORE'],
    secondary: ['CARDIO', 'BALANCE'],
  },
};

// Filter exercises for specific skills
const SKILL_KEYWORDS: Record<string, string[]> = {
  front_lever: ['front lever', 'tuck front', 'lever pull', 'front pull'],
  planche: ['planche', 'tuck planche', 'pseudo planche', 'planche push'],
  handstand: ['handstand', 'hand stand', 'wall handstand', 'freestanding'],
  muscle_up: ['muscle up', 'muscle-up', 'false grip', 'transition'],
};

function generateRoutine(
  exercises: Exercise[],
  fitnessLevel: string,
  goal: string,
  availability: string,
  hexagonProfile: any,
  weakestBranches: string[]
): Routine {
  const allowedDifficulties = DIFFICULTY_BY_LEVEL[fitnessLevel] || ['D (Beginner)', 'C (Novice)'];
  const categoryFocus = CATEGORY_BY_GOAL[goal] || CATEGORY_BY_GOAL.general;

  // Filter exercises by difficulty
  const availableExercises = exercises.filter((ex) =>
    allowedDifficulties.includes(ex.difficulty)
  );

  // Separate by category
  const warmupPool = availableExercises.filter((ex) =>
    ex.category === 'CARDIO' && ex.difficulty === allowedDifficulties[0]
  );

  const primaryPool = availableExercises.filter((ex) =>
    categoryFocus?.primary.includes(ex.category)
  );

  const secondaryPool = availableExercises.filter((ex) =>
    categoryFocus?.secondary.includes(ex.category)
  );

  // If goal is skill-specific, filter for that skill
  if (SKILL_KEYWORDS[goal]) {
    const keywords = SKILL_KEYWORDS[goal];
    const skillExercises = primaryPool.filter((ex) =>
      keywords.some((kw) => ex.name.toLowerCase().includes(kw))
    );

    // Prioritize skill exercises
    if (skillExercises.length > 0) {
      // Put skill exercises first
      const otherExercises = primaryPool.filter((ex) =>
        !keywords.some((kw) => ex.name.toLowerCase().includes(kw))
      );
      primaryPool.length = 0;
      primaryPool.push(...skillExercises, ...otherExercises);
    }
  }

  // Select exercises
  const selectedWarmup = selectRandomExercises(warmupPool, 2);
  const selectedPrimary = selectRandomExercises(primaryPool, 4);
  const selectedSecondary = selectRandomExercises(secondaryPool, 2);
  const selectedCooldown = selectRandomExercises(warmupPool, 1);

  // Determine sets and reps based on goal and level
  const getSetsAndReps = (exercise: Exercise, isPrimary: boolean): { sets: number; repsOrDuration: string; rest: number } => {
    const baseRest = fitnessLevel === 'BEGINNER' ? 90 : fitnessLevel === 'INTERMEDIATE' ? 60 : 45;

    if (exercise.unit === 'seconds') {
      // Time-based exercises
      const duration = fitnessLevel === 'BEGINNER' ? '15-20s' : fitnessLevel === 'INTERMEDIATE' ? '20-30s' : '30-45s';
      return {
        sets: isPrimary ? 3 : 2,
        repsOrDuration: duration,
        rest: baseRest,
      };
    } else {
      // Rep-based exercises
      let reps = '8-12';
      if (goal === 'strength') {
        reps = fitnessLevel === 'BEGINNER' ? '5-8' : '4-6';
      } else if (goal === 'muscle') {
        reps = fitnessLevel === 'BEGINNER' ? '8-12' : '8-15';
      } else if (goal === 'fat_loss') {
        reps = '12-15';
      }

      return {
        sets: isPrimary ? 3 : 2,
        repsOrDuration: reps,
        rest: baseRest,
      };
    }
  };

  const warmupExercises: RoutineExercise[] = selectedWarmup.map((ex) => ({
    exercise: ex,
    sets: 1,
    repsOrDuration: '30s',
    restSeconds: 30,
    notes: 'Focus on mobility and increasing body temperature',
  }));

  const mainExercises: RoutineExercise[] = [
    ...selectedPrimary.map((ex) => {
      const config = getSetsAndReps(ex, true);
      return {
        exercise: ex,
        sets: config.sets,
        repsOrDuration: config.repsOrDuration,
        restSeconds: config.rest,
      };
    }),
    ...selectedSecondary.map((ex) => {
      const config = getSetsAndReps(ex, false);
      return {
        exercise: ex,
        sets: config.sets,
        repsOrDuration: config.repsOrDuration,
        restSeconds: config.rest,
      };
    }),
  ];

  const cooldownExercises: RoutineExercise[] = selectedCooldown.map((ex) => ({
    exercise: ex,
    sets: 1,
    repsOrDuration: '2-3 min',
    restSeconds: 0,
    notes: 'Cool down and gentle stretching',
  }));

  // Calculate total duration
  const warmupTime = warmupExercises.reduce(
    (total, ex) => total + ex.sets * 0.5 + ex.restSeconds / 60,
    0
  );
  const mainTime = mainExercises.reduce(
    (total, ex) => total + ex.sets * 1 + (ex.sets - 1) * (ex.restSeconds / 60),
    0
  );
  const cooldownTime = 3;
  const totalDuration = Math.ceil(warmupTime + mainTime + cooldownTime);

  // Generate routine name and description
  const goalNames: Record<string, string> = {
    strength: 'General Strength',
    muscle: 'Hypertrophy',
    fat_loss: 'Fat Loss',
    front_lever: 'Front Lever',
    planche: 'Planche',
    handstand: 'Handstand',
    muscle_up: 'Muscle-Up',
    general: 'Fitness General',
  };

  const routineName = `Routine for ${goalNames[goal] || 'Entrenamiento'} - ${fitnessLevel}`;
  const description = `Personalized routine focused on ${goalNames[goal]?.toLowerCase() || 'general fitness'} for ${fitnessLevel.toLowerCase()}. Based on your assessment and skill profile.`;

  return {
    name: routineName,
    description,
    goal,
    difficulty: fitnessLevel,
    durationMinutes: totalDuration,
    warmupExercises,
    exercises: mainExercises,
    cooldownExercises,
  };
}

function selectRandomExercises(pool: Exercise[], count: number): Exercise[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getWeakestBranches(hexagonProfile: any): string[] {
  const branches = [
    { name: 'EMPUJE', value: hexagonProfile.relativeStrength },
    { name: 'TRACCION', value: hexagonProfile.muscularEndurance },
    { name: 'CORE', value: hexagonProfile.bodyTension },
    { name: 'EQUILIBRIO', value: hexagonProfile.balanceControl },
    { name: 'ESTATICOS', value: hexagonProfile.skillTechnique },
  ];

  branches.sort((a, b) => a.value - b.value);
  return branches.slice(0, 2).map((b) => b.name);
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { hexagonProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has hexagon profile
    if (!user.hexagonProfile) {
      return NextResponse.json(
        {
          success: false,
          error: 'You must complete the level assessment first',
          redirectTo: '/onboarding/assessment',
        },
        { status: 400 }
      );
    }

    // Calculate fitness level from hexagon, fallback to DB value
    const unifiedProfile = migrateToUnifiedHexagon(user.hexagonProfile);
    const calculatedLevel = calculateUnifiedOverallLevel(unifiedProfile);
    const fitnessLevel = user.hexagonProfile ? calculatedLevel : (user.fitnessLevel || 'BEGINNER');

    // Parse goals
    const goals = user.goals ? JSON.parse(user.goals as string) : [];
    const primaryGoal = Array.isArray(goals) && goals.length > 0 ? goals[0] : 'general';

    // Get availability from query params or use default
    const { searchParams } = new URL(req.url);
    const availability = searchParams.get('availability') || '4-5';

    // Load exercises
    const exercises = loadExercises();

    if (exercises.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Could not load exercises' },
        { status: 500 }
      );
    }

    // Get weakest branches from hexagon
    const weakestBranches = user.hexagonProfile
      ? getWeakestBranches(user.hexagonProfile)
      : [];

    // Generate routine using fitness level (with DB fallback)
    const routine = generateRoutine(
      exercises,
      fitnessLevel,
      primaryGoal,
      availability,
      user.hexagonProfile,
      weakestBranches
    );

    return NextResponse.json({
      success: true,
      routine,
      userProfile: {
        fitnessLevel: fitnessLevel,
        goal: primaryGoal,
        weakestBranches,
      },
    });
  } catch (error: any) {
    console.error('Error generating routine:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error generating routine' },
      { status: 500 }
    );
  }
}
