import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Usuario no autenticado' }, { status: 401 });
  }

  const { missionId, progress } = await req.json();
  if (!missionId) {
    return NextResponse.json({ success: false, error: 'missionId requerido' }, { status: 400 });
  }

  const mission = await prisma.dailyMission.findUnique({ where: { id: missionId } });
  if (!mission || mission.userId !== userId) {
    return NextResponse.json({ success: false, error: 'Misión no encontrada' }, { status: 404 });
  }

  if (mission.completed) {
    return NextResponse.json({ success: true, alreadyCompleted: true, rewardXP: 0, rewardCoins: 0 });
  }

  const target = mission.target ?? progress ?? 1;
  const updated = await prisma.dailyMission.update({
    where: { id: missionId },
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

  return NextResponse.json({ success: true, rewardXP: updated.rewardXP, rewardCoins: updated.rewardCoins });
}