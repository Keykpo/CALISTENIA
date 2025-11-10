import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/badges - Get user's badges
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

    // Get user's badges with badge details
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: user.id },
      include: {
        badge: true,
      },
      orderBy: [
        { isCompleted: 'desc' },
        { earnedAt: 'desc' },
      ],
    });

    // Get available badges user doesn't have yet
    const allBadges = await prisma.badge.findMany();
    const userBadgeIds = userBadges.map(ub => ub.badgeId);
    const availableBadges = allBadges.filter(b => !userBadgeIds.includes(b.id));

    return NextResponse.json({
      success: true,
      userBadges: userBadges.map(ub => ({
        ...ub,
        requirement: JSON.parse(ub.badge.requirement),
      })),
      availableBadges: availableBadges.map(b => ({
        ...b,
        requirement: JSON.parse(b.requirement),
      })),
      stats: {
        total: userBadges.length,
        completed: userBadges.filter(ub => ub.isCompleted).length,
        inProgress: userBadges.filter(ub => !ub.isCompleted).length,
      },
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

// POST /api/badges/claim - Claim/award a badge to user
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
    const { badgeId, progress } = body;

    // Check if badge exists
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
    });

    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    // Check if user already has this badge
    const existingUserBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId: user.id,
          badgeId,
        },
      },
    });

    if (existingUserBadge) {
      // Update progress
      const updated = await prisma.userBadge.update({
        where: { id: existingUserBadge.id },
        data: {
          progress,
          isCompleted: progress >= 100,
        },
      });

      // Award rewards if completed
      if (updated.isCompleted && !existingUserBadge.isCompleted) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            totalXP: { increment: badge.xpReward },
            virtualCoins: { increment: badge.coinsReward },
          },
        });

        return NextResponse.json({
          success: true,
          userBadge: updated,
          newlyCompleted: true,
          rewards: {
            xp: badge.xpReward,
            coins: badge.coinsReward,
          },
        });
      }

      return NextResponse.json({
        success: true,
        userBadge: updated,
        newlyCompleted: false,
      });
    }

    // Create new user badge
    const userBadge = await prisma.userBadge.create({
      data: {
        userId: user.id,
        badgeId,
        progress: progress || 0,
        isCompleted: progress >= 100,
      },
    });

    // Award rewards if completed immediately
    if (userBadge.isCompleted) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalXP: { increment: badge.xpReward },
          virtualCoins: { increment: badge.coinsReward },
        },
      });

      return NextResponse.json({
        success: true,
        userBadge,
        newlyCompleted: true,
        rewards: {
          xp: badge.xpReward,
          coins: badge.coinsReward,
        },
      });
    }

    return NextResponse.json({
      success: true,
      userBadge,
      newlyCompleted: false,
    });
  } catch (error) {
    console.error('Error claiming badge:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to claim badge' },
      { status: 500 }
    );
  }
}
