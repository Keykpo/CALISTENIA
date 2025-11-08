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

/**
 * Get active achievements for the user
 * Returns only the current active achievement for each chain
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    // Get all user achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
    });

    // Get all achievements to find chains
    const allAchievements = await prisma.achievement.findMany({
      orderBy: [
        { chainName: 'asc' },
        { level: 'asc' },
      ],
    });

    // Group achievements by chain
    const chainMap = new Map<string, any[]>();
    for (const achievement of allAchievements) {
      if (!achievement.chainName) continue;

      if (!chainMap.has(achievement.chainName)) {
        chainMap.set(achievement.chainName, []);
      }
      chainMap.get(achievement.chainName)!.push(achievement);
    }

    // For each chain, find the active achievement for the user
    const activeAchievements: any[] = [];

    for (const [chainName, chainAchievements] of chainMap.entries()) {
      // Sort by level to ensure proper order
      const sortedChain = chainAchievements.sort((a, b) => a.level - b.level);

      // Find the first incomplete achievement in the chain
      let foundActive = false;
      for (const achievement of sortedChain) {
        const userAch = userAchievements.find(
          (ua) => ua.achievementId === achievement.id
        );

        // If user hasn't started this achievement yet, and it's level 1, it's active
        if (!userAch && achievement.level === 1) {
          activeAchievements.push({
            achievement,
            userAchievement: null, // Not started yet
            chainName,
            isActive: true,
          });
          foundActive = true;
          break;
        }

        // If user has this achievement but hasn't completed it, it's active
        if (userAch && !userAch.completed) {
          activeAchievements.push({
            achievement,
            userAchievement: userAch,
            chainName,
            isActive: true,
          });
          foundActive = true;
          break;
        }

        // If user completed this achievement, check if there's a next one
        if (userAch && userAch.completed) {
          // This is completed, continue to next level
          continue;
        }
      }

      // If all achievements in chain are completed, mark the last one as completed
      if (!foundActive && sortedChain.length > 0) {
        const lastAchievement = sortedChain[sortedChain.length - 1];
        const lastUserAch = userAchievements.find(
          (ua) => ua.achievementId === lastAchievement.id
        );

        if (lastUserAch && lastUserAch.completed) {
          activeAchievements.push({
            achievement: lastAchievement,
            userAchievement: lastUserAch,
            chainName,
            isActive: false, // Chain completed
            chainCompleted: true,
          });
        }
      }
    }

    // Get stats
    const totalAchievements = allAchievements.length;
    const completedAchievements = userAchievements.filter((ua) => ua.completed).length;
    const completionPercentage = totalAchievements > 0
      ? (completedAchievements / totalAchievements) * 100
      : 0;

    return NextResponse.json({
      success: true,
      activeAchievements,
      stats: {
        total: totalAchievements,
        completed: completedAchievements,
        completionPercentage: Math.round(completionPercentage),
        chainsCount: chainMap.size,
      },
    });
  } catch (error: any) {
    console.error('Error fetching active achievements:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al obtener logros activos' },
      { status: 500 }
    );
  }
}
