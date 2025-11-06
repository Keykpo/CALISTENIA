import fs from 'fs';

type Exercise = {
  id: string;
  name: string;
  description?: string;
  category: 'WARM_UP' | 'STRENGTH' | 'BALANCE' | 'MOBILITY' | string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | string;
  muscleGroups?: string[];
  equipment?: string[];
};

type PlanExercise = {
  id: string;
  name: string;
  reps?: number;
  durationSec?: number;
};

type Plan = {
  warmup: PlanExercise[];
  main: PlanExercise[];
  finisher: PlanExercise[];
};

function loadExercises(): Exercise[] {
  const defaultPath = 'C:/Users/FRAN/cp/exercises.json';
  const path = process.env.EXERCISES_PATH || defaultPath;
  try {
    const raw = fs.readFileSync(path, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read exercises.json at', path, e);
    return [];
  }
}

function pick<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && a.length > 0; i++) {
    const idx = Math.floor(Math.random() * a.length);
    out.push(a.splice(idx, 1)[0]);
  }
  return out;
}

function defaultPrescription(diff: Exercise['difficulty']) {
  switch (diff) {
    case 'BEGINNER':
      return { reps: 8, durationSec: 30 };
    case 'INTERMEDIATE':
      return { reps: 12, durationSec: 45 };
    case 'ADVANCED':
      return { reps: 15, durationSec: 60 };
    default:
      return { reps: 10, durationSec: 40 };
  }
}

export function generatePlan({
  goal = 'strength',
  level = 'BEGINNER',
  equipment = 'NONE',
  durationMin = 30,
}: {
  goal?: 'strength' | 'endurance' | 'mobility' | 'balance' | 'technique';
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | string;
  equipment?: string;
  durationMin?: number;
}): Plan {
  const all = loadExercises();
  const bodyweight = all.filter((e) => !e.equipment || e.equipment.includes('NONE'));
  const warmups = bodyweight.filter((e) => e.category === 'WARM_UP');
  const strength = bodyweight.filter((e) => e.category === 'STRENGTH');
  const balance = bodyweight.filter((e) => e.category === 'BALANCE');
  const mobility = bodyweight.filter((e) => e.category === 'MOBILITY');

  const targetCount = durationMin >= 40 ? 4 : 3;

  const warmupPick = pick(warmups, 2).map((e) => ({ id: e.id, name: e.name, durationSec: defaultPrescription(level as any).durationSec }));

  let pool: Exercise[] = [];
  switch (goal) {
    case 'strength':
      pool = strength;
      break;
    case 'endurance':
      // Use strength variants and some warmups as cardio
      pool = strength.concat(warmups);
      break;
    case 'mobility':
      pool = mobility.length ? mobility : warmups;
      break;
    case 'balance':
    case 'technique':
      pool = balance.concat(strength);
      break;
    default:
      pool = strength;
  }

  const mainPick = pick(pool, targetCount).map((e) => {
    const p = defaultPrescription(e.difficulty);
    const isIsometric = /plancha|plank|hold|handstand|isométrico/i.test(e.name);
    return {
      id: e.id,
      name: e.name,
      reps: isIsometric ? undefined : p.reps,
      durationSec: isIsometric ? p.durationSec : undefined,
    };
  });

  const finisherPool = goal === 'strength' ? balance : strength;
  const finisherPick = pick(finisherPool, 1).map((e) => {
    const p = defaultPrescription(e.difficulty);
    return { id: e.id, name: e.name, durationSec: p.durationSec };
  });

  return {
    warmup: warmupPick,
    main: mainPick,
    finisher: finisherPick,
  };
}