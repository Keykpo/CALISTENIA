import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

type DifficultyEn = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

interface CompletedExercise {
  name: string;
  sets?: number;
  reps?: string;
  durationSec?: number;
  rank?: 'D' | 'C' | 'B' | 'A' | 'S';
}

interface CompleteWorkoutBody {
  difficulty?: DifficultyEn | string;
  exercises?: CompletedExercise[];
  sessionId?: string;
}

const difficultyBaseXP: Record<DifficultyEn, number> = {
  BEGINNER: 10,
  INTERMEDIATE: 15,
  ADVANCED: 20,
  EXPERT: 25,
};

const rankMultiplier: Record<NonNullable<CompletedExercise['rank']>, number> = {
  D: 1.0,
  C: 1.1,
  B: 1.25,
  A: 1.5,
  S: 1.75,
};

function toDifficultyEn(input?: string): DifficultyEn {
  if (!input) return 'BEGINNER';
  const key = input.toUpperCase();
  if (['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(key)) {
    return key as DifficultyEn;
  }
  // Spanish mapping fallback
  const map: Record<string, DifficultyEn> = {
    PRINCIPIANTE: 'BEGINNER',
    NOVATO: 'INTERMEDIATE',
    INTERMEDIO: 'INTERMEDIATE',
    AVANZADO: 'ADVANCED',
    EXPERTO: 'EXPERT',
  };
  return map[key] ?? 'BEGINNER';
}

function computeXP(difficulty: DifficultyEn, exercises: CompletedExercise[]): number {
  const base = difficultyBaseXP[difficulty];
  let xp = 0;
  for (const ex of exercises) {
    const sets = ex.sets ?? 1;
    const mult = ex.rank ? rankMultiplier[ex.rank] : 1;
    xp += Math.round(base * sets * mult);
  }
  return xp;
}

function computeCoins(xp: number): number {
  return Math.round(xp / 5);
}

function detectSignals(exerciseName: string) {
  const name = exerciseName.toLowerCase();
  const isPull = /dominada|pull|row|jalón/.test(name);
  const isPush = /flexion|push|fondos|dip/.test(name);
  const isLeg = /sentadilla|squat|pistol|lunge|estocada|step/.test(name);
  const isIso = /plancha|plank|hold|isométrico|tuck|lever|l-sit/.test(name);
  const isBalance = /handstand|pino|equilibrio|balance/.test(name);
  const isMobility = /estiramiento|stretch|movilidad|split|bridge|puente|pnf/.test(name);
  const isEndurance = /cardio|interval|tempo|fartlek|emom|circuit/.test(name);

  return {
    relativeStrength: isPull || isPush || isLeg ? 1 : 0,
    muscularEndurance: isEndurance ? 1 : 0,
    balanceControl: isBalance ? 1 : 0,
    jointMobility: isMobility ? 1 : 0,
    bodyTension: isIso ? 1 : 0,
    skillTechnique: 0.2, // small baseline technique increment
  };
}

function deltaForDifficulty(difficulty: DifficultyEn): number {
  switch (difficulty) {
    case 'BEGINNER': return 0.25;
    case 'INTERMEDIATE': return 0.35;
    case 'ADVANCED': return 0.45;
    case 'EXPERT': return 0.6;
    default: return 0.3;
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

async function findOrCreateAchievement(params: {
  name: string;
  description: string;
  type: 'WORKOUT_COUNT' | 'STREAK' | 'PROGRESS_MILESTONE' | 'SPECIAL_EVENT' | 'EXERCISE_MASTERY' | 'COURSE_COMPLETION' | 'COMMUNITY_ENGAGEMENT';
  target?: number;
  unit?: string;
  points?: number;
}) {
  const existing = await prisma.achievement.findFirst({ where: { name: params.name } });
  if (existing) return existing;
  return prisma.achievement.create({
    data: {
      name: params.name,
      description: params.description,
      type: params.type,
      target: params.target,
      unit: params.unit,
      points: params.points ?? 0,
    },
  });
}

async function ensureUserAchievement(userId: string, achievementId: string, complete = true) {
  const ua = await prisma.userAchievement.findFirst({ where: { userId, achievementId } });
  if (ua) return ua;
  return prisma.userAchievement.create({
    data: {
      userId,
      achievementId,
      progress: 1,
      completed: complete,
      completedAt: complete ? new Date() : null,
    },
  });
}

function startOfDay(d: Date) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function addDays(d: Date, days: number) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + days);
  return dt;
}

async function getUserFromRequest(req: NextRequest) {
  // Try session first
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id as string;
  } catch {}

  // Fallbacks for local dev
  const { searchParams } = new URL(req.url);
  const qp = searchParams.get('userId');
  if (qp) return qp;
  const headerUser = req.headers.get('x-user-id');
  if (headerUser) return headerUser;
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const body = (await req.json()) as CompleteWorkoutBody;
    const difficulty = toDifficultyEn(body.difficulty);
    const exercises = Array.isArray(body.exercises) ? body.exercises : [];

    const baseXP = computeXP(difficulty, exercises);

    // Streak bonus: 10% if last workout within 36h and on previous/ same day
    let streakBonusPct = 0;
    if (userId) {
      // Count existing workouts (before saving this one)
      const previousCount = await prisma.workoutHistory.count({ where: { userId } });
      const last = await prisma.workoutHistory.findFirst({
        where: { userId },
        orderBy: { completedAt: 'desc' },
      });
      if (last) {
        const diffHours = (Date.now() - new Date(last.completedAt).getTime()) / 3600000;
        if (diffHours <= 36) streakBonusPct = 10;
      }
    }
    const xpEarned = Math.round(baseXP * (1 + streakBonusPct / 100));
    const coinsEarned = computeCoins(xpEarned);

    // Aggregate hexagon delta
    const perExerciseDelta = deltaForDifficulty(difficulty);
    const hexDelta = { relativeStrength: 0, muscularEndurance: 0, balanceControl: 0, jointMobility: 0, bodyTension: 0, skillTechnique: 0 };
    for (const ex of exercises) {
      const sig = detectSignals(ex.name);
      hexDelta.relativeStrength += sig.relativeStrength * perExerciseDelta;
      hexDelta.muscularEndurance += sig.muscularEndurance * perExerciseDelta;
      hexDelta.balanceControl += sig.balanceControl * perExerciseDelta;
      hexDelta.jointMobility += sig.jointMobility * perExerciseDelta;
      hexDelta.bodyTension += sig.bodyTension * perExerciseDelta;
      hexDelta.skillTechnique += sig.skillTechnique * 0.5; // half of difficulty delta baseline
    }

    let hexagonUpdate: any = null;

    if (userId) {
      // Ensure user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        // Load or create hexagon
        let hex = await prisma.hexagonProfile.findUnique({ where: { userId } });
        if (!hex) {
          hex = await prisma.hexagonProfile.create({
            data: {
              userId,
              relativeStrength: 0,
              muscularEndurance: 0,
              balanceControl: 0,
              jointMobility: 0,
              bodyTension: 0,
              skillTechnique: 0,
            },
          });
        }

        const level = user.currentLevel ?? 1;
        const maxAxis = clamp(6 + level, 0, 10); // cap increases with level, up to 10

        const updated = {
          relativeStrength: clamp(hex.relativeStrength + hexDelta.relativeStrength, 0, maxAxis),
          muscularEndurance: clamp(hex.muscularEndurance + hexDelta.muscularEndurance, 0, maxAxis),
          balanceControl: clamp(hex.balanceControl + hexDelta.balanceControl, 0, maxAxis),
          jointMobility: clamp(hex.jointMobility + hexDelta.jointMobility, 0, maxAxis),
          bodyTension: clamp(hex.bodyTension + hexDelta.bodyTension, 0, maxAxis),
          skillTechnique: clamp(hex.skillTechnique + hexDelta.skillTechnique, 0, maxAxis),
        };

        await prisma.hexagonProfile.update({
          where: { userId },
          data: updated,
        });

        // Update user RPG stats
        const newTotalXP = (user.totalXP ?? 0) + xpEarned;
        let newLevel = user.currentLevel ?? 1;
        // Level-up for each 500 XP
        newLevel = Math.max(newLevel, Math.floor(newTotalXP / 500) + 1);
        const newCoins = (user.virtualCoins ?? 0) + coinsEarned;

        await prisma.user.update({
          where: { id: userId },
          data: { totalXP: newTotalXP, currentLevel: newLevel, virtualCoins: newCoins },
        });

        // Save history
        await prisma.workoutHistory.create({
          data: {
            userId,
            sessionId: body.sessionId,
            difficulty,
            streakBonus: Math.round(streakBonusPct),
            xpEarned,
            coinsEarned,
            hexagonDelta: JSON.stringify(hexDelta),
            summary: JSON.stringify({ exercises }),
          },
        });

        hexagonUpdate = {
          before: {
            relativeStrength: hex.relativeStrength,
            muscularEndurance: hex.muscularEndurance,
            balanceControl: hex.balanceControl,
            jointMobility: hex.jointMobility,
            bodyTension: hex.bodyTension,
            skillTechnique: hex.skillTechnique,
          },
          delta: hexDelta,
          after: updated,
          maxAxis,
        };

        // Achievement: Primer Paso (first workout)
        if (previousCount === 0) {
          const a1 = await findOrCreateAchievement({
            name: 'Primer Paso',
            description: 'Completa tu primer entrenamiento.',
            type: 'WORKOUT_COUNT',
            target: 1,
            unit: 'workouts',
            points: 50,
          });
          await ensureUserAchievement(userId, a1.id, true);
        }

        // Achievement: Semana Consistente (7-day streak)
        // Check if user has workouts for each of the last 7 days including today
        const windowStart = startOfDay(addDays(new Date(), -6));
        const histories = await prisma.workoutHistory.findMany({
          where: { userId, completedAt: { gte: windowStart } },
          orderBy: { completedAt: 'desc' },
        });
        const daysSet = new Set<string>();
        for (const h of histories) {
          const d = startOfDay(new Date(h.completedAt)).toISOString().slice(0, 10);
          daysSet.add(d);
        }
        let allSeven = true;
        for (let i = 0; i < 7; i++) {
          const dayStr = startOfDay(addDays(new Date(), -i)).toISOString().slice(0, 10);
          if (!daysSet.has(dayStr)) { allSeven = false; break; }
        }
        if (allSeven) {
          const a2 = await findOrCreateAchievement({
            name: 'Semana Consistente',
            description: 'Entrena durante 7 días consecutivos.',
            type: 'STREAK',
            target: 7,
            unit: 'days',
            points: 100,
          });
          await ensureUserAchievement(userId, a2.id, true);
        }
      }
    }

    return NextResponse.json({
      success: true,
      xpEarned,
      coinsEarned,
      streakBonus: Math.round(streakBonusPct),
      hexagonUpdate,
    });
  } catch (error) {
    console.error('Error completing workout:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}