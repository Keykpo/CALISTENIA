import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
export const runtime = 'nodejs';

const REFRESH_COST = 3; // Cost in coins

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

function startOfDay(d: Date) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

// Genera nuevas misiones adaptativas según nivel y hexágono del usuario
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
    rewardXP: level === 'BEGINNER' ? 20 : level === 'INTERMEDIATE' ? 30 : 45,
    rewardCoins: level === 'BEGINNER' ? 8 : level === 'INTERMEDIATE' ? 12 : 18,
  });

  // Misión 3: Progresión o técnica según nivel
  if (level === 'BEGINNER') {
    missions.push({
      userId,
      date,
      type: 'consistency',
      description: 'Mantén buena forma en todos los ejercicios',
      target: null,
      rewardXP: 15,
      rewardCoins: 7,
    });
  } else if (level === 'INTERMEDIATE') {
    missions.push({
      userId,
      date,
      type: 'progression',
      description: 'Aumenta reps o intensidad en 1 ejercicio',
      target: 1,
      rewardXP: 25,
      rewardCoins: 12,
    });
  } else {
    missions.push({
      userId,
      date,
      type: 'skill_practice',
      description: 'Practica una progresión avanzada (handstand, planche, etc.)',
      target: 1,
      rewardXP: 50,
      rewardCoins: 25,
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

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    // Get user to check coins
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { hexagonProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Check if user has enough coins
    const currentCoins = user.virtualCoins ?? 0;
    if (currentCoins < REFRESH_COST) {
      return NextResponse.json(
        {
          success: false,
          error: `No tienes suficientes monedas. Necesitas ${REFRESH_COST} monedas.`,
          coinsNeeded: REFRESH_COST,
          coinsAvailable: currentCoins
        },
        { status: 400 }
      );
    }

    const today = startOfDay(new Date());

    // Delete existing missions for today (only incomplete ones)
    await prisma.dailyMission.deleteMany({
      where: {
        userId,
        date: today,
        completed: false
      },
    });

    // Generate new adaptive missions
    const level = user.fitnessLevel || 'BEGINNER';
    const hexProfile = user.hexagonProfile;
    const newMissions = generateAdaptiveMissions(userId, today, level, hexProfile);

    // Create new missions
    await prisma.dailyMission.createMany({
      data: newMissions,
    });

    // Deduct coins from user
    await prisma.user.update({
      where: { id: userId },
      data: {
        virtualCoins: currentCoins - REFRESH_COST,
      },
    });

    // Fetch the newly created missions
    const missions = await prisma.dailyMission.findMany({
      where: { userId, date: today },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      missions,
      coinsSpent: REFRESH_COST,
      coinsRemaining: currentCoins - REFRESH_COST,
      message: `Misiones refrescadas exitosamente. -${REFRESH_COST} monedas.`
    });

  } catch (e: any) {
    console.error('Error refreshing missions:', e);
    return NextResponse.json(
      { success: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
