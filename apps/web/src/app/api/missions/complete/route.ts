import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { completeMissionById, getMissionById } from '@/lib/dev-missions-store';
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

// Calcula el delta del hexágono según el tipo de misión
function calculateHexagonDelta(missionType: string) {
  const delta = {
    relativeStrength: 0,
    muscularEndurance: 0,
    balanceControl: 0,
    jointMobility: 0,
    bodyTension: 0,
    skillTechnique: 0,
  };

  switch (missionType) {
    case 'complete_exercises':
      delta.skillTechnique = 0.1;
      delta.muscularEndurance = 0.05;
      break;
    case 'strength_focus':
    case 'core_focus':
      delta.relativeStrength = 0.2;
      delta.bodyTension = 0.1;
      break;
    case 'endurance_focus':
      delta.muscularEndurance = 0.2;
      delta.bodyTension = 0.1;
      break;
    case 'balance_focus':
      delta.balanceControl = 0.2;
      delta.skillTechnique = 0.1;
      break;
    case 'mobility_focus':
      delta.jointMobility = 0.2;
      delta.balanceControl = 0.05;
      break;
    case 'skill_practice':
      delta.skillTechnique = 0.3;
      delta.balanceControl = 0.1;
      break;
    case 'volume_challenge':
      delta.muscularEndurance = 0.3;
      delta.relativeStrength = 0.1;
      break;
    default:
      delta.skillTechnique = 0.05;
  }

  return delta;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const bodyUserId = (body?.userId as string) || null;
  const userId = bodyUserId || (await getUserId(req));
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Usuario no autenticado' }, { status: 401 });
  }

  const { missionId, progress } = body || {};
  const missionIdStr = missionId ? String(missionId) : '';
  if (!missionIdStr) {
    return NextResponse.json({ success: false, error: 'missionId requerido' }, { status: 400 });
  }

  try {
    const mission = await prisma.dailyMission.findUnique({ where: { id: missionIdStr } });
    if (!mission || mission.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Misión no encontrada' }, { status: 404 });
    }

    if (mission.completed) {
      return NextResponse.json({ success: true, alreadyCompleted: true, rewardXP: 0, rewardCoins: 0, streak: null });
    }

    const target = mission.target ?? progress ?? 1;
    const updated = await prisma.dailyMission.update({
      where: { id: missionIdStr },
      data: { progress: target, completed: true },
    });

    // Obtener usuario y hexágono
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { hexagonProfile: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Actualizar XP, coins y nivel
    const newXP = (user.totalXP ?? 0) + updated.rewardXP;
    const newCoins = (user.virtualCoins ?? 0) + updated.rewardCoins;
    const newLevel = Math.floor(newXP / 100) + 1; // 100 XP por nivel

    // Verificar si todas las misiones del día están completas para actualizar racha
    const today = startOfDay(new Date());
    const allMissionsToday = await prisma.dailyMission.findMany({
      where: { userId, date: today },
    });
    const allCompleted = allMissionsToday.every((m) => m.id === missionIdStr || m.completed);

    let newStreak = user.dailyStreak ?? 0;
    let lastCompleted = user.lastDailyCompletedAt;

    if (allCompleted) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastCompletedDay = lastCompleted ? startOfDay(new Date(lastCompleted)) : null;

      if (!lastCompletedDay || lastCompletedDay.getTime() === yesterday.getTime()) {
        // Continuamos la racha
        newStreak += 1;
      } else if (lastCompletedDay.getTime() === today.getTime()) {
        // Ya completamos hoy, mantener racha
        newStreak = user.dailyStreak ?? 1;
      } else {
        // Se rompió la racha
        newStreak = 1;
      }
      lastCompleted = today;
    }

    // Actualizar hexágono si existe
    if (user.hexagonProfile) {
      const delta = calculateHexagonDelta(mission.type);
      await prisma.hexagonProfile.update({
        where: { userId },
        data: {
          relativeStrength: Math.min(10, (user.hexagonProfile.relativeStrength ?? 0) + delta.relativeStrength),
          muscularEndurance: Math.min(10, (user.hexagonProfile.muscularEndurance ?? 0) + delta.muscularEndurance),
          balanceControl: Math.min(10, (user.hexagonProfile.balanceControl ?? 0) + delta.balanceControl),
          jointMobility: Math.min(10, (user.hexagonProfile.jointMobility ?? 0) + delta.jointMobility),
          bodyTension: Math.min(10, (user.hexagonProfile.bodyTension ?? 0) + delta.bodyTension),
          skillTechnique: Math.min(10, (user.hexagonProfile.skillTechnique ?? 0) + delta.skillTechnique),
        },
      });
    }

    // Actualizar usuario
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalXP: newXP,
        virtualCoins: newCoins,
        currentLevel: newLevel,
        dailyStreak: newStreak,
        lastDailyCompletedAt: lastCompleted,
      },
    });

    // En desarrollo, sincroniza también el store en memoria
    if (process.env.NODE_ENV === 'development') {
      try {
        completeMissionById(missionIdStr);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      mission: updated,
      rewards: { xp: updated.rewardXP, coins: updated.rewardCoins },
      streak: allCompleted ? newStreak : null,
      levelUp: newLevel > (user.currentLevel ?? 1),
      newLevel,
    });
  } catch (e: any) {
    // Fallback en desarrollo: completar misión en el store en memoria
    if (process.env.NODE_ENV === 'development') {
      const completed = completeMissionById(missionIdStr);
      if (completed) {
        const info = getMissionById(missionIdStr);
        const rewardXP = info?.mission.rewardXP ?? 0;
        const rewardCoins = info?.mission.rewardCoins ?? 0;
        return NextResponse.json({
          success: true,
          devFallback: true,
          rewards: { xp: rewardXP, coins: rewardCoins },
          streak: null,
        });
      }
      return NextResponse.json({ success: false, error: 'Dev: misión no encontrada en memoria' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: String(e?.message || e) }, { status: 500 });
  }
}