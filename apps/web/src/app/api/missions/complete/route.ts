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
      return NextResponse.json({ success: true, alreadyCompleted: true, rewardXP: 0, rewardCoins: 0 });
    }

    const target = mission.target ?? progress ?? 1;
    const updated = await prisma.dailyMission.update({
      where: { id: missionIdStr },
      data: { progress: target, completed: true },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXP: (user.totalXP ?? 0) + updated.rewardXP,
          virtualCoins: (user.virtualCoins ?? 0) + updated.rewardCoins,
        },
      });
    }
    // En desarrollo, sincroniza también el store en memoria para evitar estados divergentes en el dashboard
    if (process.env.NODE_ENV === 'development') {
      try {
        completeMissionById(missionIdStr);
      } catch {}
    }

    return NextResponse.json({ success: true, rewardXP: updated.rewardXP, rewardCoins: updated.rewardCoins });
  } catch (e: any) {
    // Fallback en desarrollo: completar misión en el store en memoria
    if (process.env.NODE_ENV === 'development') {
      const completed = completeMissionById(missionIdStr);
      if (completed) {
        const info = getMissionById(missionIdStr);
        const rewardXP = info?.mission.rewardXP ?? 0;
        const rewardCoins = info?.mission.rewardCoins ?? 0;
        return NextResponse.json({ success: true, devFallback: true, rewardXP, rewardCoins });
      }
      return NextResponse.json({ success: false, error: 'Dev: misión no encontrada en memoria' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: String(e?.message || e) }, { status: 500 });
  }
}