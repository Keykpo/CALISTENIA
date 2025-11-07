import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

async function resolveUserId(req: NextRequest) {
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

// Definición de logros y misiones
const ACHIEVEMENTS = {
  // Logros de habilidades completadas
  skillMaster: [
    {
      id: 'first_skill',
      title: 'Primer Paso',
      description: 'Completa tu primera habilidad',
      requirement: { type: 'skills_completed', count: 1 },
      rewards: { xp: 50, coins: 25 },
      icon: '🎯',
    },
    {
      id: 'skill_collector',
      title: 'Coleccionista',
      description: 'Completa 5 habilidades',
      requirement: { type: 'skills_completed', count: 5 },
      rewards: { xp: 150, coins: 75 },
      icon: '📚',
    },
    {
      id: 'skill_expert',
      title: 'Experto en Habilidades',
      description: 'Completa 15 habilidades',
      requirement: { type: 'skills_completed', count: 15 },
      rewards: { xp: 300, coins: 150 },
      icon: '🏆',
    },
    {
      id: 'skill_master',
      title: 'Maestro de Habilidades',
      description: 'Completa 25 habilidades',
      requirement: { type: 'skills_completed', count: 25 },
      rewards: { xp: 500, coins: 250 },
      icon: '👑',
    },
  ],
  
  // Logros por ramas específicas
  branchMaster: [
    {
      id: 'push_master',
      title: 'Maestro del Empuje',
      description: 'Completa todas las habilidades de EMPUJE',
      requirement: { type: 'branch_completed', branch: 'EMPUJE' },
      rewards: { xp: 200, coins: 100 },
      icon: '💪',
    },
    {
      id: 'pull_master',
      title: 'Maestro de la Tracción',
      description: 'Completa todas las habilidades de TRACCION',
      requirement: { type: 'branch_completed', branch: 'TRACCION' },
      rewards: { xp: 200, coins: 100 },
      icon: '🔥',
    },
    {
      id: 'core_master',
      title: 'Maestro del Core',
      description: 'Completa todas las habilidades de CORE',
      requirement: { type: 'branch_completed', branch: 'CORE' },
      rewards: { xp: 200, coins: 100 },
      icon: '⚡',
    },
    {
      id: 'balance_master',
      title: 'Maestro del Equilibrio',
      description: 'Completa todas las habilidades de EQUILIBRIO',
      requirement: { type: 'branch_completed', branch: 'EQUILIBRIO' },
      rewards: { xp: 200, coins: 100 },
      icon: '🎪',
    },
    {
      id: 'static_master',
      title: 'Maestro de Estáticos',
      description: 'Completa todas las habilidades de ESTATICOS',
      requirement: { type: 'branch_completed', branch: 'ESTATICOS' },
      rewards: { xp: 200, coins: 100 },
      icon: '🗿',
    },
  ],

  // Logros de nivel
  levelAchievements: [
    {
      id: 'level_5',
      title: 'Competente',
      description: 'Alcanza el nivel 5',
      requirement: { type: 'level_reached', level: 5 },
      rewards: { xp: 100, coins: 50 },
      icon: '⭐',
    },
    {
      id: 'level_10',
      title: 'Maestro',
      description: 'Alcanza el nivel 10',
      requirement: { type: 'level_reached', level: 10 },
      rewards: { xp: 250, coins: 125 },
      icon: '🌟',
    },
    {
      id: 'level_15',
      title: 'Leyenda',
      description: 'Alcanza el nivel 15',
      requirement: { type: 'level_reached', level: 15 },
      rewards: { xp: 500, coins: 250 },
      icon: '✨',
    },
  ],

  // Misiones diarias/semanales
  dailyMissions: [
    {
      id: 'daily_workout',
      title: 'Entrenamiento Diario',
      description: 'Completa al menos 1 habilidad hoy',
      requirement: { type: 'daily_skills', count: 1 },
      rewards: { xp: 25, coins: 10 },
      icon: '📅',
      resetType: 'daily',
    },
    {
      id: 'weekly_warrior',
      title: 'Guerrero Semanal',
      description: 'Completa 5 habilidades esta semana',
      requirement: { type: 'weekly_skills', count: 5 },
      rewards: { xp: 100, coins: 50 },
      icon: '🗓️',
      resetType: 'weekly',
    },
  ],
};

// Función para verificar si un logro está completado
async function checkAchievementCompletion(userId: string, achievement: any) {
  const { requirement } = achievement;

  switch (requirement.type) {
    case 'skills_completed':
      const completedSkills = await prisma.userSkill.count({
        where: {
          userId,
          isCompleted: true,
        },
      });
      return completedSkills >= requirement.count;

    case 'branch_completed':
      const branchSkills = await prisma.skill.count({
        where: { branch: requirement.branch },
      });
      const completedBranchSkills = await prisma.userSkill.count({
        where: {
          userId,
          isCompleted: true,
          skill: { branch: requirement.branch },
        },
      });
      return branchSkills > 0 && completedBranchSkills >= branchSkills;

    case 'level_reached':
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { currentLevel: true },
      });
      return (user?.currentLevel || 1) >= requirement.level;

    case 'daily_skills':
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dailyCompleted = await prisma.userSkill.count({
        where: {
          userId,
          isCompleted: true,
          completedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });
      return dailyCompleted >= requirement.count;

    case 'weekly_skills':
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weeklyCompleted = await prisma.userSkill.count({
        where: {
          userId,
          isCompleted: true,
          completedAt: {
            gte: weekStart,
            lt: weekEnd,
          },
        },
      });
      return weeklyCompleted >= requirement.count;

    default:
      return false;
  }
}

// GET - Obtener logros y misiones del usuario
export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Ensure dev user exists when using fallback id
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@dev.local`,
            username: userId,
            goals: '[]',
            totalXP: 0,
            currentLevel: 1,
            virtualCoins: 0,
            totalStrength: 0,
          },
        });
      } catch {}
    }

    // Obtener logros ya desbloqueados
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
    });

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

    // Combinar todos los logros
    const allAchievements = [
      ...ACHIEVEMENTS.skillMaster,
      ...ACHIEVEMENTS.branchMaster,
      ...ACHIEVEMENTS.levelAchievements,
      ...ACHIEVEMENTS.dailyMissions,
    ];

    // Verificar el estado de cada logro
    const achievementsWithStatus = await Promise.all(
      allAchievements.map(async (achievement) => {
        const isUnlocked = unlockedIds.has(achievement.id);
        const isCompleted = isUnlocked || await checkAchievementCompletion(userId, achievement);
        return {
          ...achievement,
          isUnlocked,
          isCompleted,
          unlockedAt: userAchievements.find(ua => ua.achievementId === achievement.id)?.unlockedAt,
        };
      })
    );

    // Separar por categorías
    const categorizedAchievements = {
      skillMaster: achievementsWithStatus.filter(a => ACHIEVEMENTS.skillMaster.some(sm => sm.id === a.id)),
      branchMaster: achievementsWithStatus.filter(a => ACHIEVEMENTS.branchMaster.some(bm => bm.id === a.id)),
      levelAchievements: achievementsWithStatus.filter(a => ACHIEVEMENTS.levelAchievements.some(la => la.id === a.id)),
      dailyMissions: achievementsWithStatus.filter(a => ACHIEVEMENTS.dailyMissions.some(dm => dm.id === a.id)),
    };

    // Estadísticas generales
    const totalAchievements = allAchievements.length;
    const unlockedAchievements = achievementsWithStatus.filter(a => a.isUnlocked).length;
    const completedAchievements = achievementsWithStatus.filter(a => a.isCompleted).length;

    return NextResponse.json({
      achievements: categorizedAchievements,
      stats: {
        total: totalAchievements,
        unlocked: unlockedAchievements,
        completed: completedAchievements,
        completionRate: totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error al obtener logros:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Verificar y desbloquear logros automáticamente
export async function POST(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener logros ya desbloqueados
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
    });

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

    // Combinar todos los logros
    const allAchievements = [
      ...ACHIEVEMENTS.skillMaster,
      ...ACHIEVEMENTS.branchMaster,
      ...ACHIEVEMENTS.levelAchievements,
      ...ACHIEVEMENTS.dailyMissions,
    ];

    const newlyUnlocked = [];
    let totalXPReward = 0;
    let totalCoinsReward = 0;

    // Verificar logros no desbloqueados
    for (const achievement of allAchievements) {
      if (!unlockedIds.has(achievement.id)) {
        const isCompleted = await checkAchievementCompletion(userId, achievement);
        if (isCompleted) {
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
              unlockedAt: new Date(),
            },
          });
          newlyUnlocked.push(achievement);
          totalXPReward += achievement.rewards.xp;
          totalCoinsReward += achievement.rewards.coins;
        }
      }
    }

    // Otorgar recompensas si hay logros nuevos
    if (newlyUnlocked.length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXP: { increment: totalXPReward },
          virtualCoins: { increment: totalCoinsReward },
        },
      });
    }

    return NextResponse.json({
      newlyUnlocked,
      rewards: {
        xp: totalXPReward,
        coins: totalCoinsReward,
      },
      message: newlyUnlocked.length > 0 
        ? `¡Felicidades! Has desbloqueado ${newlyUnlocked.length} logro(s) nuevo(s).`
        : 'No hay nuevos logros desbloqueados.',
    });
  } catch (error) {
    console.error('Error al verificar logros:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}