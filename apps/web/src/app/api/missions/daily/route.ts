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