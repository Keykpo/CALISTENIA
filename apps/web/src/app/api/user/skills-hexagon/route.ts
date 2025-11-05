import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, Difficulty, ExerciseCategory } from '@prisma/client';

const prisma = new PrismaClient();

type HexagonValues = {
  fuerzaRelativa: number;
  resistenciaMuscular: number;
  controlEquilibrio: number;
  movilidadArticular: number;
  tensionCorporal: number;
  tecnica: number;
};

const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  BEGINNER: 1.0,
  INTERMEDIATE: 1.2,
  ADVANCED: 1.5,
  EXPERT: 1.8,
};

const NORMALIZATION_TARGET: HexagonValues = {
  fuerzaRelativa: 500,
  resistenciaMuscular: 800,
  controlEquilibrio: 300,
  movilidadArticular: 300,
  tensionCorporal: 400,
  tecnica: 250,
};

function clamp100(n: number) { return Math.max(0, Math.min(100, Math.round(n))); }

function addCoreHeuristics(name?: string) {
  if (!name) return 0;
  const k = name.toLowerCase();
  const coreNames = ['plank', 'plancha', 'hollow', 'l-sit', 'lsit', 'dragon flag'];
  return coreNames.some(t => k.includes(t)) ? 0.25 : 0;
}

function addBalanceHeuristics(name?: string) {
  if (!name) return 0;
  const k = name.toLowerCase();
  const balNames = ['handstand', 'pino', 'equilibrio', 'balance'];
  return balNames.some(t => k.includes(t)) ? 0.25 : 0;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rangeDays = Number(searchParams.get('rangeDays') || 60);
    const since = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000);

    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId: session.user.id,
        startTime: { gte: since },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    // Load dynamic normalization targets from DB (fallback to defaults)
    const normalizationTarget: HexagonValues = { ...NORMALIZATION_TARGET };
    try {
      const calibrations = await prisma.skillsCalibration.findMany();
      for (const c of calibrations) {
        const axis = c.axis as keyof HexagonValues;
        if (axis in normalizationTarget && typeof c.targetValue === 'number') {
          normalizationTarget[axis] = c.targetValue;
        }
      }
    } catch (e) {
      // If calibration table is missing or error occurs, continue with defaults
      console.warn('Calibration fetch failed, using defaults:', e);
    }

    // Raw accumulators
    const raw = {
      fuerzaRelativa: 0,
      resistenciaMuscular: 0,
      controlEquilibrio: 0,
      movilidadArticular: 0,
      tensionCorporal: 0,
      tecnica: 0,
    } as Record<keyof HexagonValues, number>;

    let exercisesCount = 0;

    for (const s of sessions) {
      for (const se of s.exercises) {
        const ex = se.exercise;
        if (!ex) continue;
        exercisesCount++;

        const difficultyWeight = DIFFICULTY_WEIGHT[ex.difficulty as Difficulty] || 1.0;
        const completedFactor = se.completed ? 1.0 : 0.7;

        const sets = se.sets ?? 1;
        const reps = se.reps ?? 0;
        const duration = se.duration ?? 0; // seconds
        const weight = se.weight ?? 0; // kg

        // Convert duration to a reps-like equivalent (approximation)
        const durationEquivalent = Math.round(duration / 30); // ~ one rep per 30s
        const baseVolume = sets * (reps + durationEquivalent);
        const weightFactor = weight > 0 ? Math.min(2, 1 + weight / 50) : 1; // mild boost for external load
        const base = baseVolume * difficultyWeight * completedFactor * weightFactor;

        // Category mapping to axes
        switch (ex.category as ExerciseCategory) {
          case 'STRENGTH':
            raw.fuerzaRelativa += base;
            raw.tecnica += base * 0.15 * (difficultyWeight - 0.9);
            break;
          case 'ENDURANCE':
            raw.resistenciaMuscular += base * 1.1;
            break;
          case 'CARDIO':
            raw.resistenciaMuscular += base;
            break;
          case 'FLEXIBILITY':
            raw.movilidadArticular += base;
            break;
          case 'MOBILITY':
          case 'WARM_UP':
          case 'COOL_DOWN':
            raw.movilidadArticular += base * 0.7;
            break;
          case 'BALANCE':
            raw.controlEquilibrio += base * 1.2;
            raw.tecnica += base * 0.2;
            break;
          default:
            // FULL_BODY or others not explicitly covered
            raw.fuerzaRelativa += base * 0.6;
            raw.resistenciaMuscular += base * 0.4;
            break;
        }

        // Muscle group influence for core/tension corporal
        try {
          const mg = JSON.parse(ex.muscleGroups || '[]') as string[];
          if (Array.isArray(mg)) {
            const hasCore = mg.some(m => ['CORE', 'ABS', 'OBLIQUES'].includes(String(m).toUpperCase()));
            if (hasCore) raw.tensionCorporal += base * 1.1;
          }
        } catch {}

        // Name heuristics for core/balance
        raw.tensionCorporal += base * addCoreHeuristics(ex.name);
        raw.controlEquilibrio += base * addBalanceHeuristics(ex.name);

        // Technique: reward advanced/expert execution regardless of category
        if (ex.difficulty === 'ADVANCED' || ex.difficulty === 'EXPERT') {
          raw.tecnica += base * 0.35;
        }
      }
    }

    const values: HexagonValues = {
      fuerzaRelativa: clamp100((raw.fuerzaRelativa / normalizationTarget.fuerzaRelativa) * 100),
      resistenciaMuscular: clamp100((raw.resistenciaMuscular / normalizationTarget.resistenciaMuscular) * 100),
      controlEquilibrio: clamp100((raw.controlEquilibrio / normalizationTarget.controlEquilibrio) * 100),
      movilidadArticular: clamp100((raw.movilidadArticular / normalizationTarget.movilidadArticular) * 100),
      tensionCorporal: clamp100((raw.tensionCorporal / normalizationTarget.tensionCorporal) * 100),
      tecnica: clamp100((raw.tecnica / normalizationTarget.tecnica) * 100),
    };

    return NextResponse.json({
      values,
      meta: {
        rangeDays,
        sessionsCount: sessions.length,
        exercisesCount,
        raw,
        normalizationTarget,
      },
    });
  } catch (error) {
    console.error('Error calculating skills hexagon:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}