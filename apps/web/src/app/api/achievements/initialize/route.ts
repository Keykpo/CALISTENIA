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
  const headerUser = req.headers.get('x-user-id');
  if (headerUser) return headerUser;
  return null;
}

/**
 * POST /api/achievements/initialize
 *
 * Initialize or repair user achievements by:
 * 1. Creating level 1 achievements for all chains the user hasn't started
 * 2. Creating the next level for chains where user completed the previous level
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get all achievements grouped by chain
    const allAchievements = await prisma.achievement.findMany({
      orderBy: [
        { chainName: 'asc' },
        { level: 'asc' },
      ],
    });

    // Get user's current achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
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

    let created = 0;
    const operations: string[] = [];

    // For each chain, ensure proper progression
    for (const [chainName, chainAchievements] of chainMap.entries()) {
      const sortedChain = chainAchievements.sort((a, b) => a.level - b.level);

      // Find user's achievements in this chain
      const userChainAchs = userAchievements.filter(
        ua => ua.achievement.chainName === chainName
      );

      if (userChainAchs.length === 0) {
        // User hasn't started this chain, create level 1
        const level1 = sortedChain[0];
        if (level1) {
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: level1.id,
              progress: 0,
              completed: false,
              completedAt: null,
            },
          });
          created++;
          operations.push(`Created ${chainName} Level 1`);
        }
      } else {
        // Find the highest completed level
        const completedLevels = userChainAchs
          .filter(ua => ua.completed)
          .map(ua => ua.achievement.level)
          .sort((a, b) => b - a);

        if (completedLevels.length > 0) {
          const highestCompleted = completedLevels[0];
          const nextLevel = sortedChain.find(a => a.level === highestCompleted + 1);

          if (nextLevel) {
            // Check if next level already exists
            const hasNextLevel = userChainAchs.some(
              ua => ua.achievement.level === nextLevel.level
            );

            if (!hasNextLevel) {
              // Create the next level
              await prisma.userAchievement.create({
                data: {
                  userId,
                  achievementId: nextLevel.id,
                  progress: 0,
                  completed: false,
                  completedAt: null,
                },
              });
              created++;
              operations.push(`Created ${chainName} Level ${nextLevel.level}`);
            }
          }
        }
      }
    }

    console.log(`[INITIALIZE_ACHIEVEMENTS] Created ${created} achievements for user ${userId}`);

    return NextResponse.json({
      success: true,
      created,
      operations,
      message: `Initialized ${created} achievements successfully`,
    });
  } catch (error: any) {
    console.error('[INITIALIZE_ACHIEVEMENTS] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize achievements',
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
