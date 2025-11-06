import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
function addDays(d: Date, days: number) { const dt = new Date(d); dt.setDate(dt.getDate()+days); return dt; }

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ success: false, error: 'Usuario no autenticado' }, { status: 401 });

  // Ensure dev user exists when using header/query fallback
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@dev.local`,
          username: userId,
          goals: '[]',
        },
      });
    } catch (e) {
      // continue if creation collides with existing email/username
      user = await prisma.user.findUnique({ where: { id: userId } });
    }
  }
  const hex = await prisma.hexagonProfile.findUnique({ where: { userId } });
  const recentWorkouts = await prisma.workoutHistory.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
    take: 5,
  });

  const today = startOfDay(new Date());
  let missionsToday = await prisma.dailyMission.findMany({ where: { userId, date: today }, orderBy: { createdAt: 'asc' } });
  if (missionsToday.length === 0) {
    try {
      await prisma.dailyMission.createMany({
        data: [
          {
            userId,
            date: today,
            type: 'complete_exercises',
            description: 'Completa 3 ejercicios hoy',
            target: 3,
            rewardXP: 20,
            rewardCoins: 10,
          },
          {
            userId,
            date: today,
            type: 'core_focus',
            description: 'Incluye 1 ejercicio de CORE',
            target: 1,
            rewardXP: 15,
            rewardCoins: 5,
          },
          {
            userId,
            date: today,
            type: 'hydration',
            description: 'Hidrátate durante el entrenamiento',
            target: null,
            rewardXP: 5,
            rewardCoins: 0,
          },
        ],
        skipDuplicates: true,
      });
    } catch (e) {
      // ignore insertion error in dev
    }
    missionsToday = await prisma.dailyMission.findMany({ where: { userId, date: today }, orderBy: { createdAt: 'asc' } });
  }

  const recentAchievements = await prisma.userAchievement.findMany({
    where: { userId, completed: true },
    orderBy: { completedAt: 'desc' },
    take: 5,
    include: { achievement: true },
  });

  // Weekly progress: count workouts per day for last 7 days
  const weekStart = startOfDay(addDays(new Date(), -6));
  const weekWorkouts = await prisma.workoutHistory.findMany({
    where: { userId, completedAt: { gte: weekStart } },
  });
  const counts: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    counts[startOfDay(addDays(new Date(), -i)).toISOString().slice(0,10)] = 0;
  }
  for (const w of weekWorkouts) {
    const k = startOfDay(new Date(w.completedAt)).toISOString().slice(0,10);
    counts[k] = (counts[k] ?? 0) + 1;
  }

  return NextResponse.json({
    success: true,
    stats: {
      totalXP: user?.totalXP ?? 0,
      level: user?.currentLevel ?? 1,
      coins: user?.virtualCoins ?? 0,
    },
    hexagon: hex ?? null,
    recentWorkouts,
    missionsToday,
    recentAchievements,
    weeklyProgress: counts,
  });
}