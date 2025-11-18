import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get leaderboard
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'global'; // global, friends
    const limit = parseInt(searchParams.get('limit') || '50');

    if (type === 'friends' && !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userIds: string[] = [];

    if (type === 'friends' && session?.user?.id) {
      // Get friend IDs
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: session.user.id, status: 'ACCEPTED' },
            { addresseeId: session.user.id, status: 'ACCEPTED' },
          ],
        },
      });

      userIds = [
        session.user.id,
        ...friendships.map(f =>
          f.requesterId === session.user.id ? f.addresseeId : f.requesterId
        ),
      ];
    }

    // Get top users by total XP
    const users = await prisma.user.findMany({
      where: type === 'friends' ? { id: { in: userIds } } : {},
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        totalXP: true,
        currentLevel: true,
        dailyStreak: true,
      },
      orderBy: { totalXP: 'desc' },
      take: limit,
    });

    // Get user stats for additional info
    const userStatsMap = await prisma.userStats.findMany({
      where: { userId: { in: users.map(u => u.id) } },
    });

    const statsMap = new Map(userStatsMap.map(s => [s.userId, s]));

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
      totalXP: user.totalXP,
      currentLevel: user.currentLevel,
      dailyStreak: user.dailyStreak,
      stats: statsMap.get(user.id) || null,
      isCurrentUser: user.id === session?.user?.id,
    }));

    // Get current user's rank if not in top list
    let currentUserRank = null;
    if (session?.user?.id && !leaderboard.find(entry => entry.isCurrentUser)) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { totalXP: true },
      });

      if (currentUser) {
        const usersAbove = await prisma.user.count({
          where: {
            totalXP: { gt: currentUser.totalXP },
            ...(type === 'friends' ? { id: { in: userIds } } : {}),
          },
        });

        currentUserRank = usersAbove + 1;
      }
    }

    return NextResponse.json({
      success: true,
      leaderboard,
      currentUserRank,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
