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

// Internal hexagon rules (English, non-visible):
// Lower axis values should raise the probability of selecting exercises that train that axis.
// Axes: relativeStrength, endurance, bodyTension, balanceControl, mobility, skillTechnique.
type Hexagon = {
  relativeStrength: number; // 0–100
  endurance: number; // 0–100
  bodyTension: number; // 0–100
  balanceControl: number; // 0–100
  mobility: number; // 0–100
  skillTechnique: number; // 0–100
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

function defaultPrescription(diff: Exercise['difficulty'], fitnessLevel = 50, week = 1) {
  const base = (() => {
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
  })();
  const levelFactor = 0.8 + Math.min(Math.max(fitnessLevel, 0), 100) / 200; // ~0.8–1.3
  const weekFactor = 1 + Math.min(Math.max(week - 1, 0), 8) * 0.05; // +5% per week up to +40%
  return {
    reps: Math.round((base.reps || 10) * levelFactor * weekFactor),
    durationSec: Math.round((base.durationSec || 40) * levelFactor * weekFactor),
  };
}

function axisSignals(e: Exercise) {
  const name = e.name.toLowerCase();
  const isIsometric = /plancha|plank|hold|handstand|lever|hollow|arch/i.test(e.name);
  const isHandstand = /handstand|pino/i.test(e.name);
  const isMobilityName = /mobility|stretch|flexibility|estir/i.test(name);
  const mg = (e.muscleGroups || []).map((m) => m.toUpperCase());
  const hasCore = mg.includes('CORE') || mg.includes('ABS') || mg.includes('OBLIQUES');
  const isPush = mg.includes('CHEST') || mg.includes('TRICEPS') || mg.includes('SHOULDERS');
  const isPull = mg.includes('BACK') || mg.includes('BICEPS') || mg.includes('LATS');

  const signals = {
    relativeStrength: 0,
    endurance: 0,
    bodyTension: 0,
    balanceControl: 0,
    mobility: 0,
    skillTechnique: 0.2, // Small technique bonus on all exercises
  } as Record<keyof Hexagon, number>;

  if (e.category === 'STRENGTH') signals.relativeStrength = 1.0;
  if (e.category === 'WARM_UP') {
    signals.endurance = Math.max(signals.endurance, 0.5);
    signals.mobility = Math.max(signals.mobility, 0.3);
  }
  if (e.category === 'MOBILITY' || isMobilityName) signals.mobility = Math.max(signals.mobility, 1.0);
  if (e.category === 'BALANCE') signals.balanceControl = Math.max(signals.balanceControl, 1.0);
  if (isIsometric) signals.bodyTension = Math.max(signals.bodyTension, 1.0);
  if (isHandstand) {
    signals.balanceControl = Math.max(signals.balanceControl, 0.8);
    signals.bodyTension = Math.max(signals.bodyTension, 0.4);
    signals.skillTechnique = Math.max(signals.skillTechnique, 0.4);
  }
  if (hasCore) signals.bodyTension = Math.max(signals.bodyTension, 0.8);
  if (isPush || isPull) signals.relativeStrength = Math.max(signals.relativeStrength, 0.8);
  return signals;
}

function computeWeight(e: Exercise, hex?: Hexagon) {
  const s = axisSignals(e);
  if (!hex) return Object.values(s).reduce((a, b) => a + b, 0);
  const deficit = {
    relativeStrength: 100 - hex.relativeStrength,
    endurance: 100 - hex.endurance,
    bodyTension: 100 - hex.bodyTension,
    balanceControl: 100 - hex.balanceControl,
    mobility: 100 - hex.mobility,
    skillTechnique: 100 - hex.skillTechnique,
  };
  // Weighted dot product: higher deficits amplify selection weight
  const score =
    s.relativeStrength * deficit.relativeStrength +
    s.endurance * deficit.endurance +
    s.bodyTension * deficit.bodyTension +
    s.balanceControl * deficit.balanceControl +
    s.mobility * deficit.mobility +
    s.skillTechnique * deficit.skillTechnique;
  return score;
}

function weightedPick(pool: Exercise[], n: number, hex?: Hexagon) {
  const sorted = [...pool].sort((a, b) => computeWeight(b, hex) - computeWeight(a, hex));
  const out: Exercise[] = [];
  const seenNames = new Set<string>();
  for (const e of sorted) {
    if (out.length >= n) break;
    if (seenNames.has(e.name.toLowerCase())) continue;
    out.push(e);
    seenNames.add(e.name.toLowerCase());
  }
  if (out.length < n) {
    // pad with random if not enough
    const remaining = pool.filter((e) => !seenNames.has(e.name.toLowerCase()));
    out.push(...pick(remaining, Math.max(0, n - out.length)));
  }
  return out.slice(0, n);
}

export function generatePlan({
  goal = 'strength',
  level = 'BEGINNER',
  equipment = 'NONE',
  durationMin = 30,
  hexagon,
  fitnessLevel = 50,
  week = 1,
}: {
  goal?: 'strength' | 'endurance' | 'mobility' | 'balance' | 'technique';
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | string;
  equipment?: string;
  durationMin?: number;
  hexagon?: Hexagon;
  fitnessLevel?: number;
  week?: number;
}): Plan {
  const all = loadExercises();
  const bodyweight = all.filter((e) => !e.equipment || e.equipment.includes('NONE'));
  const warmups = bodyweight.filter((e) => e.category === 'WARM_UP');
  const strength = bodyweight.filter((e) => e.category === 'STRENGTH');
  const balance = bodyweight.filter((e) => e.category === 'BALANCE');
  const mobility = bodyweight.filter((e) => e.category === 'MOBILITY');

  const targetCount = durationMin >= 40 ? 4 : 3;

  const warmupPick = weightedPick(warmups, 2, hexagon).map((e) => ({ id: e.id, name: e.name, durationSec: defaultPrescription(e.difficulty, fitnessLevel, week).durationSec }));

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

  const mainPick = weightedPick(pool, targetCount, hexagon).map((e) => {
    const p = defaultPrescription(e.difficulty, fitnessLevel, week);
    const isIsometric = /plancha|plank|hold|handstand|isométrico/i.test(e.name);
    return {
      id: e.id,
      name: e.name,
      reps: isIsometric ? undefined : p.reps,
      durationSec: isIsometric ? p.durationSec : undefined,
    };
  });

  const finisherPool = goal === 'strength' ? balance : strength;
  const finisherPick = weightedPick(finisherPool, 1, hexagon).map((e) => {
    const p = defaultPrescription(e.difficulty, fitnessLevel, week);
    return { id: e.id, name: e.name, durationSec: p.durationSec };
  });

  return {
    warmup: warmupPick,
    main: mainPick,
    finisher: finisherPick,
  };
}