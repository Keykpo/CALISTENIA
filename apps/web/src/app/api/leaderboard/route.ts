import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to get current week start/end
function getCurrentWeekBounds() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday

  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

// GET /api/leaderboard?type=global|skill&skillBranch=HANDSTAND
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'global';
    const skillBranch = searchParams.get('skillBranch');

    const { weekStart, weekEnd } = getCurrentWeekBounds();

    if (type === 'skill' && skillBranch) {
      // Get skill-specific leaderboard
      const entries = await prisma.leaderboardEntry.findMany({
        where: {
          skillBranch,
          weekStart,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: [
          { rank: 'asc' },
          { score: 'desc' },
        ],
        take: 100,
      });

      // Get current user's rank if authenticated
      const session = await getServerSession();
      let currentUserEntry = null;

      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });

        if (user) {
          currentUserEntry = await prisma.leaderboardEntry.findFirst({
            where: {
              userId: user.id,
              skillBranch,
              weekStart,
            },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        type: 'skill',
        skillBranch,
        entries,
        currentUserEntry,
        weekStart,
        weekEnd,
      });
    }

    // Get global leaderboard
    const entries = await prisma.globalLeaderboardEntry.findMany({
      where: {
        weekStart,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            currentLevel: true,
          },
        },
      },
      orderBy: [
        { rank: 'asc' },
        { totalXP: 'desc' },
      ],
      take: 100,
    });

    // Get current user's rank if authenticated
    const session = await getServerSession();
    let currentUserEntry = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        currentUserEntry = await prisma.globalLeaderboardEntry.findFirst({
          where: {
            userId: user.id,
            weekStart,
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                currentLevel: true,
              },
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      type: 'global',
      entries,
      currentUserEntry,
      weekStart,
      weekEnd,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

// POST /api/leaderboard/update - Update leaderboard entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { skillBranch, type } = body;

    const { weekStart, weekEnd } = getCurrentWeekBounds();

    if (type === 'skill' && skillBranch) {
      // Get user's skill progress
      const skillProgress = await prisma.userSkillProgress.findFirst({
        where: {
          userId: user.id,
          skillBranch,
        },
      });

      if (!skillProgress) {
        return NextResponse.json({ error: 'Skill progress not found' }, { status: 404 });
      }

      // Calculate score: level * 1000 + sessions + (XP / 10)
      const levelScore = {
        BEGINNER: 1,
        INTERMEDIATE: 2,
        ADVANCED: 3,
        ELITE: 4,
      }[skillProgress.currentLevel] || 1;

      const score =
        levelScore * 1000 +
        skillProgress.sessionsCompleted +
        Math.floor(skillProgress.totalXPEarned / 10);

      // Upsert leaderboard entry
      const entry = await prisma.leaderboardEntry.upsert({
        where: {
          userId_skillBranch_weekStart: {
            userId: user.id,
            skillBranch,
            weekStart,
          },
        },
        create: {
          userId: user.id,
          skillBranch,
          score,
          weekStart,
          weekEnd,
        },
        update: {
          score,
        },
      });

      // Recalculate ranks for this skill branch
      const allEntries = await prisma.leaderboardEntry.findMany({
        where: {
          skillBranch,
          weekStart,
        },
        orderBy: { score: 'desc' },
      });

      // Update ranks
      for (let i = 0; i < allEntries.length; i++) {
        await prisma.leaderboardEntry.update({
          where: { id: allEntries[i].id },
          data: { rank: i + 1 },
        });
      }

      return NextResponse.json({
        success: true,
        entry,
      });
    }

    // Update global leaderboard
    const entry = await prisma.globalLeaderboardEntry.upsert({
      where: {
        userId_weekStart: {
          userId: user.id,
          weekStart,
        },
      },
      create: {
        userId: user.id,
        totalXP: user.totalXP,
        weekStart,
        weekEnd,
      },
      update: {
        totalXP: user.totalXP,
      },
    });

    // Recalculate ranks
    const allEntries = await prisma.globalLeaderboardEntry.findMany({
      where: { weekStart },
      orderBy: { totalXP: 'desc' },
    });

    for (let i = 0; i < allEntries.length; i++) {
      await prisma.globalLeaderboardEntry.update({
        where: { id: allEntries[i].id },
        data: { rank: i + 1 },
      });
    }

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update leaderboard' },
      { status: 500 }
    );
  }
}
