import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function getUserId(req: NextRequest) {
  const headerUser = req.headers.get('x-user-id');
  if (headerUser) return headerUser;
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Fetch all achievements
    const allAchievements = await prisma.achievement.findMany({
      orderBy: [
        { rarity: 'asc' },
        { points: 'asc' },
      ],
    });

    // Fetch user's unlocked achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
    });

    // Map to create a complete picture
    const achievements = allAchievements.map((achievement: any) => {
      const userAchievement = userAchievements.find(
        (ua: any) => ua.achievementId === achievement.id
      );

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        type: achievement.type,
        target: achievement.target,
        unit: achievement.unit,
        points: achievement.points,
        rarity: achievement.rarity,
        iconUrl: achievement.iconUrl,
        isUnlocked: !!userAchievement,
        progress: userAchievement?.progress || 0,
        unlockedAt: userAchievement?.unlockedAt?.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      achievements,
      stats: {
        total: achievements.length,
        unlocked: achievements.filter((a: any) => a.isUnlocked).length,
        points: achievements
          .filter((a: any) => a.isUnlocked)
          .reduce((sum: number, a: any) => sum + a.points, 0),
      },
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
