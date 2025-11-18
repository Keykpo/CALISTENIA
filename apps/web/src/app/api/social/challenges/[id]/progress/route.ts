import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateProgressSchema = z.object({
  progress: z.number().int().min(0),
});

// PUT - Update challenge progress
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const challengeId = params.id;

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = updateProgressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    const { progress } = validation.data;

    // Get challenge
    const challenge = await prisma.friendChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Check if user is participant
    const participation = await prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId: session.user.id,
        },
      },
    });

    if (!participation) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
    }

    // Update progress
    const isCompleted = progress >= challenge.goal;
    const now = new Date();

    const updated = await prisma.challengeParticipant.update({
      where: {
        challengeId_userId: {
          challengeId,
          userId: session.user.id,
        },
      },
      data: {
        progress,
        isCompleted,
        ...(isCompleted && !participation.isCompleted ? { completedAt: now } : {}),
      },
    });

    // If just completed, award XP and coins
    if (isCompleted && !participation.isCompleted) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalXP: { increment: challenge.xpReward },
          virtualCoins: { increment: challenge.coinsReward },
        },
      });

      // Create activity for friends
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: session.user.id, status: 'ACCEPTED' },
            { addresseeId: session.user.id, status: 'ACCEPTED' },
          ],
        },
      });

      const friendIds = friendships.map(f =>
        f.requesterId === session.user.id ? f.addresseeId : f.requesterId
      );

      if (friendIds.length > 0) {
        await prisma.activityFeedItem.createMany({
          data: friendIds.map(friendId => ({
            userId: friendId,
            type: 'CHALLENGE_UPDATE',
            description: `${session.user.username || 'A friend'} completed challenge: ${challenge.title}`,
            relatedUserId: session.user.id,
            metadata: JSON.stringify({ challengeId: challenge.id }),
          })),
        });
      }
    }

    // Check if all participants completed to close challenge
    const allParticipants = await prisma.challengeParticipant.findMany({
      where: { challengeId },
    });

    const allCompleted = allParticipants.every(p => p.isCompleted);

    if (allCompleted && challenge.status === 'ACTIVE') {
      // Calculate rankings
      const sortedParticipants = allParticipants.sort((a, b) => {
        if (b.progress !== a.progress) {
          return b.progress - a.progress;
        }
        // Earlier completion wins ties
        return (a.completedAt?.getTime() || 0) - (b.completedAt?.getTime() || 0);
      });

      // Update rankings
      for (let i = 0; i < sortedParticipants.length; i++) {
        await prisma.challengeParticipant.update({
          where: { id: sortedParticipants[i].id },
          data: { rank: i + 1 },
        });
      }

      // Mark challenge as completed
      await prisma.friendChallenge.update({
        where: { id: challengeId },
        data: { status: 'COMPLETED' },
      });
    }

    return NextResponse.json({ success: true, participation: updated });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
