import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import prisma from '@/lib/prisma';
import { getDailyMissions, saveDailyMissions, DevMission } from '@/lib/dev-missions-store';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  generateGoalBasedDailyMissions,
} from '@/lib/exercise-to-axis-mapping';
import { type UnifiedHexagonAxis, migrateToUnifiedHexagon } from '@/lib/unified-hexagon-system';

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
  if (!userId) return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });

  try {
    // Ensure dev user exists when using header/query fallback
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hexagonProfile: true,
      },
    });
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
        // Refetch with hexagonProfile after creation
        user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            hexagonProfile: true,
          },
        });
      } catch (e) {
        // continue if creation collides with existing email/username
        user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            hexagonProfile: true,
          },
        });
      }
    }

    // Extract hexagon profile from user data
    const hex = user?.hexagonProfile ?? null;

    console.log('[DASHBOARD_API] User data retrieved:', {
      userId,
      userExists: !!user,
      userFields: user ? Object.keys(user) : null,
      hasHexagonProfile: !!user?.hexagonProfile,
      hexagonProfileFields: user?.hexagonProfile ? Object.keys(user.hexagonProfile) : null,
      hexagonProfileData: user?.hexagonProfile,
    });

    const recentWorkouts = await prisma.workoutHistory.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 5,
    });

    const today = startOfDay(new Date());
    let missionsToday = await prisma.dailyMission.findMany({ where: { userId, date: today }, orderBy: { createdAt: 'asc' } });
    if (missionsToday.length === 0) {
      try {
        // Check if missions already exist before creating (SQLite doesn't support skipDuplicates)
        const existingMissions = await prisma.dailyMission.findFirst({
          where: { userId, date: today }
        });

        if (!existingMissions) {
          // Parse user's primary goal from goals JSON
          const goals = user?.goals ? JSON.parse(user.goals as string) : [];
          const primaryGoal = Array.isArray(goals) && goals.length > 0 ? goals[0] : 'general';

          // Extract hexagon levels from profile (migrate to unified)
          const unifiedProfile = migrateToUnifiedHexagon(hex);
          const hexagonLevels: Record<UnifiedHexagonAxis, 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'> = {
            balance: unifiedProfile.balanceLevel,
            strength: unifiedProfile.strengthLevel,
            staticHolds: unifiedProfile.staticHoldsLevel,
            core: unifiedProfile.coreLevel,
            endurance: unifiedProfile.enduranceLevel,
            mobility: unifiedProfile.mobilityLevel,
          };

          // Generate 5 goal-based missions
          const axisMissions = generateGoalBasedDailyMissions(primaryGoal, hexagonLevels, 5);

          // Convert AxisMission[] to database format
          const missionsToCreate = axisMissions.map((mission) => ({
            userId,
            date: today,
            type: mission.id,
            description: mission.description,
            target: mission.target || null,
            rewardXP: mission.rewardXP,
            rewardCoins: mission.rewardCoins,
            progress: 0,
            completed: false,
          }));

          await prisma.dailyMission.createMany({
            data: missionsToCreate,
          });
        }
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

    // Check if user has completed assessment (read from user.hasCompletedAssessment field)
    const hasCompletedAssessment = user?.hasCompletedAssessment || false;

    console.log('[DASHBOARD] 🔍 Hexagon Profile Data Debug:', {
      '1_userId': userId,
      '2_hasHexProfile': !!hex,
      '3_hexProfileFull': hex,
      '4_visualValues': hex ? {
        balanceControl: hex.balanceControl,
        relativeStrength: hex.relativeStrength,
        skillTechnique: hex.skillTechnique,
        bodyTension: hex.bodyTension,
        muscularEndurance: hex.muscularEndurance,
        jointMobility: hex.jointMobility,
      } : null,
      '5_xpValues': hex ? {
        balanceControlXP: hex.balanceControlXP,
        relativeStrengthXP: hex.relativeStrengthXP,
        skillTechniqueXP: hex.skillTechniqueXP,
        bodyTensionXP: hex.bodyTensionXP,
        muscularEnduranceXP: hex.muscularEnduranceXP,
        jointMobilityXP: hex.jointMobilityXP,
      } : null,
      '6_levelValues': hex ? {
        balanceControlLevel: hex.balanceControlLevel,
        relativeStrengthLevel: hex.relativeStrengthLevel,
        skillTechniqueLevel: hex.skillTechniqueLevel,
        bodyTensionLevel: hex.bodyTensionLevel,
        muscularEnduranceLevel: hex.muscularEnduranceLevel,
        jointMobilityLevel: hex.jointMobilityLevel,
      } : null,
      '7_userHasCompletedAssessment': user?.hasCompletedAssessment,
      '8_userFitnessLevel': user?.fitnessLevel,
    });

    // Double-check: Query hexagon directly to verify it exists
    if (!hex && user?.id) {
      const directHexQuery = await prisma.hexagonProfile.findUnique({
        where: { userId: user.id },
      });
      console.log('[DASHBOARD] ⚠️ Direct hexagon query result (hex was null):', {
        found: !!directHexQuery,
        data: directHexQuery,
      });
    }

    console.log('[DASHBOARD] About to return response with hexagon:', {
      hexagonIsNull: hex === null,
      hexagonIsUndefined: hex === undefined,
      willReturnNull: !hex,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        username: user?.username,
        height: user?.height,
        weight: user?.weight,
        fitnessLevel: user?.fitnessLevel,
        gender: user?.gender,
        createdAt: user?.createdAt,
        hasCompletedAssessment: hasCompletedAssessment,
      },
      stats: {
        totalXP: user?.totalXP ?? 0,
        level: user?.currentLevel ?? 1,
        coins: user?.virtualCoins ?? 0,
        dailyStreak: user?.dailyStreak ?? 0,
        totalStrength: user?.totalStrength ?? 0,
        lastDailyCompletedAt: user?.lastDailyCompletedAt,
      },
      hexagon: hex ?? null,
      recentWorkouts,
      missionsToday,
      recentAchievements,
      weeklyProgress: counts,
    });

    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (e: any) {
    // Fallback en desarrollo si Prisma falla: intentar obtener usuario de DB primero
    if (process.env.NODE_ENV === 'development') {
      try {
        // Intentar leer usuario de DB aunque haya fallado la consulta principal
        const fallbackUser = await prisma.user.findUnique({ where: { id: userId } });

        const today = startOfDay(new Date());
        let missionsToday = getDailyMissions(userId) as any;
        if (!missionsToday || missionsToday.length === 0) {
          const baseId = `dev-${new Date().toISOString()}`;
          const fallback: DevMission[] = [
            {
              id: `${baseId}-1`, userId, date: today, type: 'complete_exercises',
              description: 'Complete 5 exercises today', target: 5, progress: 0, completed: false, rewardXP: 300, rewardCoins: 150,
            },
            {
              id: `${baseId}-2`, userId, date: today, type: 'core_focus',
              description: 'Include 2 CORE exercises', target: 2, progress: 0, completed: false, rewardXP: 250, rewardCoins: 100,
            },
            {
              id: `${baseId}-3`, userId, date: today, type: 'strength_focus',
              description: 'Work on strength exercises', target: 2, progress: 0, completed: false, rewardXP: 250, rewardCoins: 100,
            },
            {
              id: `${baseId}-4`, userId, date: today, type: 'balance_focus',
              description: 'Practice balance exercises', target: 1, progress: 0, completed: false, rewardXP: 200, rewardCoins: 80,
            },
            {
              id: `${baseId}-5`, userId, date: today, type: 'progression',
              description: 'Increase intensity in 1 exercise', target: 1, progress: 0, completed: false, rewardXP: 350, rewardCoins: 150,
            },
          ];
          saveDailyMissions(userId, fallback);
          missionsToday = fallback as any;
        }

        return NextResponse.json({
          success: true,
          user: fallbackUser ? {
            id: fallbackUser.id,
            email: fallbackUser.email,
            firstName: fallbackUser.firstName,
            lastName: fallbackUser.lastName,
            username: fallbackUser.username,
            fitnessLevel: fallbackUser.fitnessLevel,
          } : null,
          stats: {
            totalXP: fallbackUser?.totalXP ?? 0,
            level: fallbackUser?.currentLevel ?? 1,
            coins: fallbackUser?.virtualCoins ?? 0,
            dailyStreak: fallbackUser?.dailyStreak ?? 0,
            totalStrength: fallbackUser?.totalStrength ?? 0,
          },
          hexagon: null,
          recentWorkouts: [],
          missionsToday,
          recentAchievements: [],
          weeklyProgress: {},
          note: 'dev-fallback-with-user-stats',
        });
      } catch (fallbackError) {
        // Si incluso el fallback falla, devolver valores por defecto
        return NextResponse.json({
          success: true,
          stats: { totalXP: 0, level: 1, coins: 0, dailyStreak: 0, totalStrength: 0 },
          hexagon: null,
          recentWorkouts: [],
          missionsToday: [],
          recentAchievements: [],
          weeklyProgress: {},
          note: 'dev-fallback-minimal',
        });
      }
    }
    return NextResponse.json({ success: false, error: String(e?.message || e) }, { status: 500 });
  }
}