import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to get current week bounds
function getCurrentWeekBounds() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

// GET /api/challenges - Get active weekly challenges
export async function GET(request: NextRequest) {
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

    const { weekStart, weekEnd } = getCurrentWeekBounds();

    // Get active challenges for this week
    const challenges = await prisma.weeklyChallenge.findMany({
      where: {
        weekStart,
        isActive: true,
      },
    });

    // Get user's progress on each challenge
    const challengeProgress = await prisma.userChallengeProgress.findMany({
      where: {
        userId: user.id,
        challengeId: { in: challenges.map(c => c.id) },
      },
    });

    // Combine challenges with user progress
    const challengesWithProgress = challenges.map(challenge => {
      const progress = challengeProgress.find(p => p.challengeId === challenge.id);
      return {
        ...challenge,
        userProgress: progress?.progress || 0,
        isCompleted: progress?.isCompleted || false,
        completedAt: progress?.completedAt || null,
      };
    });

    return NextResponse.json({
      success: true,
      challenges: challengesWithProgress,
      weekStart,
      weekEnd,
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

// POST /api/challenges/progress - Update challenge progress
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
    const { challengeId, progress } = body;

    // Get challenge
    const challenge = await prisma.weeklyChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Check if completed
    const isCompleted = progress >= challenge.target;

    // Upsert user progress
    const userProgress = await prisma.userChallengeProgress.upsert({
      where: {
        userId_challengeId: {
          userId: user.id,
          challengeId,
        },
      },
      create: {
        userId: user.id,
        challengeId,
        progress,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        progress,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Award rewards if newly completed
    if (isCompleted) {
      const existingProgress = await prisma.userChallengeProgress.findUnique({
        where: {
          userId_challengeId: {
            userId: user.id,
            challengeId,
          },
        },
      });

      const wasAlreadyCompleted = existingProgress?.isCompleted;

      if (!wasAlreadyCompleted) {
        // Award XP and coins
        await prisma.user.update({
          where: { id: user.id },
          data: {
            totalXP: { increment: challenge.xpReward },
            virtualCoins: { increment: challenge.coinsReward },
          },
        });

        return NextResponse.json({
          success: true,
          userProgress,
          newlyCompleted: true,
          rewards: {
            xp: challenge.xpReward,
            coins: challenge.coinsReward,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      userProgress,
      newlyCompleted: false,
    });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update challenge progress' },
      { status: 500 }
    );
  }
}
