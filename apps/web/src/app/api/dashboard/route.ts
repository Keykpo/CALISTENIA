import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import prisma from '@/lib/prisma';
import { getDailyMissions, saveDailyMissions, DevMission } from '@/lib/dev-missions-store';
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

  try {
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

    // En desarrollo: si Prisma NO devuelve misiones, usa store en memoria.
    // Si Prisma SÍ devuelve, sincroniza el store con esas misiones para evitar estados divergentes.
    if (process.env.NODE_ENV === 'development') {
      const devMissions = getDailyMissions(userId);
      if (!missionsToday || missionsToday.length === 0) {
        if (devMissions && devMissions.length) {
          missionsToday = devMissions as any;
        }
      } else {
        // Prisma trae misiones: mantenemos el store alineado con la verdad actual
        try {
          saveDailyMissions(userId, missionsToday as any);
        } catch {}
      }
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
        dailyStreak: user?.dailyStreak ?? 0,
        lastDailyCompletedAt: user?.lastDailyCompletedAt,
      },
      hexagon: hex ?? null,
      recentWorkouts,
      missionsToday,
      recentAchievements,
      weeklyProgress: counts,
    });
  } catch (e: any) {
    // Fallback completo en desarrollo si Prisma falla: usar store en memoria
    if (process.env.NODE_ENV === 'development') {
      const today = startOfDay(new Date());
      let missionsToday = getDailyMissions(userId) as any;
      if (!missionsToday || missionsToday.length === 0) {
        const baseId = `dev-${new Date().toISOString()}`;
        const fallback: DevMission[] = [
          {
            id: `${baseId}-1`, userId, date: today, type: 'complete_exercises',
            description: 'Completa 3 ejercicios hoy', target: 3, progress: 0, completed: false, rewardXP: 20, rewardCoins: 10,
          },
          {
            id: `${baseId}-2`, userId, date: today, type: 'core_focus',
            description: 'Incluye 1 ejercicio de CORE', target: 1, progress: 0, completed: false, rewardXP: 15, rewardCoins: 5,
          },
          {
            id: `${baseId}-3`, userId, date: today, type: 'hydration',
            description: 'Hidrátate durante el entrenamiento', target: null, progress: 0, completed: false, rewardXP: 5, rewardCoins: 0,
          },
        ];
        saveDailyMissions(userId, fallback);
        missionsToday = fallback as any;
      }
      return NextResponse.json({
        success: true,
        stats: { totalXP: 0, level: 1, coins: 0 },
        hexagon: null,
        recentWorkouts: [],
        missionsToday,
        recentAchievements: [],
        weeklyProgress: {},
        note: 'dev-fallback',
      });
    }
    return NextResponse.json({ success: false, error: String(e?.message || e) }, { status: 500 });
  }
}