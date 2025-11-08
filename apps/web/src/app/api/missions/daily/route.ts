import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { saveDailyMissions, DevMission } from '@/lib/dev-missions-store';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  generateGoalBasedDailyMissions,
  type HexagonAxis,
  type AxisMission,
} from '@/lib/exercise-to-axis-mapping';
import { type HexagonProfileWithXP } from '@/lib/hexagon-progression';
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
      // Get user with hexagon profile to generate goal-based missions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { hexagonProfile: true },
      });

      // Parse user's primary goal from goals JSON
      const goals = user?.goals ? JSON.parse(user.goals as string) : [];
      const primaryGoal = Array.isArray(goals) && goals.length > 0 ? goals[0] : 'general';

      // Extract hexagon levels from profile
      const hexProfile = user?.hexagonProfile as HexagonProfileWithXP | null;
      const hexagonLevels: Record<HexagonAxis, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'> = {
        relativeStrength: (hexProfile?.relativeStrengthLevel || 'BEGINNER') as any,
        muscularEndurance: (hexProfile?.muscularEnduranceLevel || 'BEGINNER') as any,
        balanceControl: (hexProfile?.balanceControlLevel || 'BEGINNER') as any,
        jointMobility: (hexProfile?.jointMobilityLevel || 'BEGINNER') as any,
        bodyTension: (hexProfile?.bodyTensionLevel || 'BEGINNER') as any,
        skillTechnique: (hexProfile?.skillTechniqueLevel || 'BEGINNER') as any,
      };

      // Generate 5 goal-based missions
      const axisMissions = generateGoalBasedDailyMissions(primaryGoal, hexagonLevels, 5);

      // Convert AxisMission[] to database format
      const missionsToCreate = axisMissions.map((mission) => ({
        userId,
        date: today,
        type: mission.id, // Use mission ID as type
        description: mission.description,
        target: mission.target || null,
        rewardXP: mission.rewardXP,
        rewardCoins: mission.rewardCoins,
        progress: 0,
        completed: false,
      }));

      // SQLite doesn't support skipDuplicates, so we check first
      const existingCheck = await prisma.dailyMission.findFirst({
        where: { userId, date: today }
      });

      if (!existingCheck) {
        await prisma.dailyMission.createMany({
          data: missionsToCreate,
        });
      }
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
          description: 'Completa 5 ejercicios hoy',
          target: 5,
          progress: 0,
          completed: false,
          rewardXP: 30,
          rewardCoins: 15,
        },
        {
          id: `${baseId}-2`,
          userId: userId || 'local-dev',
          date: today,
          type: 'core_focus',
          description: 'Incluye 2 ejercicios de CORE',
          target: 2,
          progress: 0,
          completed: false,
          rewardXP: 25,
          rewardCoins: 10,
        },
        {
          id: `${baseId}-3`,
          userId: userId || 'local-dev',
          date: today,
          type: 'strength_focus',
          description: 'Trabaja ejercicios de fuerza',
          target: 2,
          progress: 0,
          completed: false,
          rewardXP: 25,
          rewardCoins: 10,
        },
        {
          id: `${baseId}-4`,
          userId: userId || 'local-dev',
          date: today,
          type: 'balance_focus',
          description: 'Practica ejercicios de equilibrio',
          target: 1,
          progress: 0,
          completed: false,
          rewardXP: 20,
          rewardCoins: 8,
        },
        {
          id: `${baseId}-5`,
          userId: userId || 'local-dev',
          date: today,
          type: 'progression',
          description: 'Aumenta intensidad en 1 ejercicio',
          target: 1,
          progress: 0,
          completed: false,
          rewardXP: 35,
          rewardCoins: 15,
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