import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { saveDailyMissions, DevMission } from '@/lib/dev-missions-store';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
export const runtime = 'nodejs';

async function getUserId(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id as string;
  } catch {}
  const { searchParams } = new URL(req.url);
  const qp = searchParams.get('userId');
  if (qp) return qp;
  const headerUser = req.headers.get('x-user-id');
  if (headerUser) return headerUser;
  return null;
}

function startOfDay(d: Date) { const dt = new Date(d); dt.setHours(0,0,0,0); return dt; }

// Genera misiones adaptativas según nivel y hexágono del usuario
function generateAdaptiveMissions(
  userId: string,
  date: Date,
  level: string,
  hexProfile: any
) {
  const missions: any[] = [];

  // Misión 1: Ejercicios base (adaptar cantidad según nivel)
  const exerciseTarget = level === 'BEGINNER' ? 3 : level === 'INTERMEDIATE' ? 5 : 8;
  missions.push({
    userId,
    date,
    type: 'complete_exercises',
    description: `Completa ${exerciseTarget} ejercicios hoy`,
    target: exerciseTarget,
    rewardXP: exerciseTarget * 5,
    rewardCoins: Math.floor(exerciseTarget * 2.5),
  });

  // Misión 2: Enfoque adaptativo según hexágono (debilidad más baja)
  let focusType = 'core_focus';
  let focusDesc = 'Incluye 1 ejercicio de CORE';
  if (hexProfile) {
    const weakestAxis = getWeakestAxis(hexProfile);
    if (weakestAxis === 'relativeStrength') {
      focusType = 'strength_focus';
      focusDesc = 'Trabaja ejercicios de fuerza (push-ups, pull-ups)';
    } else if (weakestAxis === 'muscularEndurance') {
      focusType = 'endurance_focus';
      focusDesc = 'Realiza ejercicios de resistencia (plank, hold)';
    } else if (weakestAxis === 'balanceControl') {
      focusType = 'balance_focus';
      focusDesc = 'Practica ejercicios de equilibrio';
    } else if (weakestAxis === 'jointMobility') {
      focusType = 'mobility_focus';
      focusDesc = 'Incluye estiramientos y movilidad';
    }
  }
  missions.push({
    userId,
    date,
    type: focusType,
    description: focusDesc,
    target: level === 'BEGINNER' ? 1 : level === 'INTERMEDIATE' ? 2 : 3,
    rewardXP: level === 'BEGINNER' ? 15 : level === 'INTERMEDIATE' ? 25 : 40,
    rewardCoins: level === 'BEGINNER' ? 5 : level === 'INTERMEDIATE' ? 10 : 15,
  });

  // Misión 3: Progresión o técnica según nivel
  if (level === 'BEGINNER') {
    missions.push({
      userId,
      date,
      type: 'consistency',
      description: 'Mantén buena forma en todos los ejercicios',
      target: null,
      rewardXP: 10,
      rewardCoins: 5,
    });
  } else if (level === 'INTERMEDIATE') {
    missions.push({
      userId,
      date,
      type: 'progression',
      description: 'Aumenta reps o intensidad en 1 ejercicio',
      target: 1,
      rewardXP: 20,
      rewardCoins: 10,
    });
  } else {
    missions.push({
      userId,
      date,
      type: 'skill_practice',
      description: 'Practica una progresión avanzada (handstand, planche, etc.)',
      target: 1,
      rewardXP: 50,
      rewardCoins: 20,
    });
  }

  // Misión 4: Bonus si es nivel avanzado
  if (level === 'EXPERT' || level === 'ADVANCED') {
    missions.push({
      userId,
      date,
      type: 'volume_challenge',
      description: 'Completa al menos 100 reps totales hoy',
      target: 100,
      rewardXP: 30,
      rewardCoins: 15,
    });
  }

  return missions;
}

// Encuentra el eje más débil del hexágono
function getWeakestAxis(hexProfile: any): string {
  const axes = {
    relativeStrength: hexProfile.relativeStrength ?? 0,
    muscularEndurance: hexProfile.muscularEndurance ?? 0,
    balanceControl: hexProfile.balanceControl ?? 0,
    jointMobility: hexProfile.jointMobility ?? 0,
    bodyTension: hexProfile.bodyTension ?? 0,
    skillTechnique: hexProfile.skillTechnique ?? 0,
  };

  let weakest = 'relativeStrength';
  let minValue = axes.relativeStrength;

  for (const [key, value] of Object.entries(axes)) {
    if (value < minValue) {
      minValue = value;
      weakest = key;
    }
  }

  return weakest;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Usuario no autenticado' }, { status: 401 });
    }

    // Ensure the user exists in dev/local mode (header fallback)
    // This avoids foreign key errors when creating missions for a stub user
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      try {
        await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@dev.local`,
            username: userId,
            goals: '[]',
          },
        });
      } catch (e) {
        // If user creation fails (e.g., duplicate email), continue gracefully
      }
    }

    const today = startOfDay(new Date());
    const existing = await prisma.dailyMission.findMany({
      where: { userId, date: today },
      orderBy: { createdAt: 'asc' },
    });

    if (existing.length === 0) {
      // Obtener nivel y hexágono del usuario para adaptar misiones
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { hexagonProfile: true },
      });

      const level = user?.fitnessLevel || 'BEGINNER';
      const hexProfile = user?.hexagonProfile;

      // Generar misiones adaptativas según nivel
      const adaptiveMissions = generateAdaptiveMissions(userId, today, level, hexProfile);

      await prisma.dailyMission.createMany({
        data: adaptiveMissions,
        skipDuplicates: true,
      });
    }

    const missions = await prisma.dailyMission.findMany({ where: { userId, date: today } });
    return NextResponse.json({ success: true, missions });
  } catch (e: any) {
    // Fallback en desarrollo: devolver misiones en memoria para no bloquear el UI
    if (process.env.NODE_ENV === 'development') {
      const today = startOfDay(new Date());
      const userId = await getUserId(req); // intentar recuperar userId también en fallback
      const baseId = `dev-${new Date().toISOString()}`;
      const fallbackMissions: DevMission[] = [
        {
          id: `${baseId}-1`,
          userId: userId || 'local-dev',
          date: today,
          type: 'complete_exercises',
          description: 'Completa 3 ejercicios hoy',
          target: 3,
          progress: 0,
          completed: false,
          rewardXP: 20,
          rewardCoins: 10,
        },
        {
          id: `${baseId}-2`,
          userId: userId || 'local-dev',
          date: today,
          type: 'core_focus',
          description: 'Incluye 1 ejercicio de CORE',
          target: 1,
          progress: 0,
          completed: false,
          rewardXP: 15,
          rewardCoins: 5,
        },
        {
          id: `${baseId}-3`,
          userId: userId || 'local-dev',
          date: today,
          type: 'hydration',
          description: 'Hidrátate durante el entrenamiento',
          target: null,
          progress: 0,
          completed: false,
          rewardXP: 5,
          rewardCoins: 0,
        },
      ];
      // Persistir en el store en memoria para permitir "Complete" durante desarrollo.
      if (userId) {
        saveDailyMissions(userId, fallbackMissions);
      }
      return NextResponse.json({ success: true, missions: fallbackMissions, note: 'dev-fallback' });
    }
    return NextResponse.json({ success: false, error: String(e?.message || e) }, { status: 500 });
  }
}