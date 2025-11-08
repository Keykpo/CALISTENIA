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
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { achievementId } = body;

    if (!achievementId) {
      return NextResponse.json(
        { success: false, error: 'achievementId es requerido' },
        { status: 400 }
      );
    }

    // Get the achievement
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      return NextResponse.json(
        { success: false, error: 'Logro no encontrado' },
        { status: 404 }
      );
    }

    // Check if user already has this achievement
    let userAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
    });

    if (!userAchievement) {
      // Create user achievement if it doesn't exist
      userAchievement = await prisma.userAchievement.create({
        data: {
          userId,
          achievementId,
          progress: 0,
          completed: false,
        },
      });
    }

    if (userAchievement.completed) {
      return NextResponse.json({
        success: false,
        error: 'This achievement has already been completed',
        alreadyCompleted: true,
      });
    }

    // Mark achievement as completed
    const completedAchievement = await prisma.userAchievement.update({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
      data: {
        completed: true,
        completedAt: new Date(),
        progress: achievement.target || 100,
      },
    });

    // Award points to user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      const newXP = (user.totalXP ?? 0) + achievement.points;
      const newCoins = (user.virtualCoins ?? 0) + Math.floor(achievement.points / 10);
      const newLevel = Math.floor(newXP / 100) + 1;

      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXP: newXP,
          virtualCoins: newCoins,
          currentLevel: newLevel,
        },
      });
    }

    // Check if this achievement unlocks another one
    let unlockedAchievement = null;
    if (achievement.unlocksAchievementId) {
      // Get the next achievement in the chain
      const nextAchievement = await prisma.achievement.findUnique({
        where: { id: achievement.unlocksAchievementId },
      });

      if (nextAchievement) {
        // Check if user already has this achievement
        const existingNext = await prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: nextAchievement.id,
            },
          },
        });

        if (!existingNext) {
          // Create the next achievement for the user (unlocked but not completed)
          unlockedAchievement = await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: nextAchievement.id,
              progress: 0,
              completed: false,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Achievement completed! +${achievement.points} XP`,
      achievement: completedAchievement,
      rewards: {
        xp: achievement.points,
        coins: Math.floor(achievement.points / 10),
      },
      unlockedNext: unlockedAchievement ? {
        id: achievement.unlocksAchievementId,
        message: '¡Nuevo logro desbloqueado en la cadena!',
      } : null,
    });
  } catch (error: any) {
    console.error('Error completing achievement:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al completar el logro' },
      { status: 500 }
    );
  }
}
