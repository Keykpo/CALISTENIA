import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createChallengeSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  type: z.enum(['EXERCISE_COUNT', 'WORKOUT_SESSIONS', 'TIME_BASED', 'DISTANCE', 'STREAK', 'CUSTOM']),
  goal: z.number().int().min(1),
  metric: z.string().max(50),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isPublic: z.boolean().default(false),
  xpReward: z.number().int().min(0).default(0),
  coinsReward: z.number().int().min(0).default(0),
  participantIds: z.array(z.string()).optional(),
});

// GET - Get challenges (own + invited)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // all, active, completed, created
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get challenges where user is participant or creator
    const participations = await prisma.challengeParticipant.findMany({
      where: { userId: session.user.id },
      select: { challengeId: true },
    });

    const challengeIds = participations.map(p => p.challengeId);

    let whereClause: any = {
      OR: [
        { id: { in: challengeIds } },
        { creatorId: session.user.id },
      ],
    };

    if (filter === 'active') {
      whereClause.status = 'ACTIVE';
      whereClause.endDate = { gte: new Date() };
    } else if (filter === 'completed') {
      whereClause.OR = [
        { status: 'COMPLETED' },
        { endDate: { lt: new Date() } },
      ];
    } else if (filter === 'created') {
      whereClause = { creatorId: session.user.id };
    }

    const challenges = await prisma.friendChallenge.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { progress: 'desc' },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Add user's participation data
    const challengesWithUserData = challenges.map(challenge => {
      const userParticipation = challenge.participants.find(
        p => p.userId === session.user.id
      );

      return {
        ...challenge,
        userProgress: userParticipation?.progress || 0,
        userIsCompleted: userParticipation?.isCompleted || false,
        userRank: userParticipation?.rank || null,
      };
    });

    return NextResponse.json({
      success: true,
      challenges: challengesWithUserData,
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

// POST - Create a challenge
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = createChallengeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      type,
      goal,
      metric,
      startDate,
      endDate,
      isPublic,
      xpReward,
      coinsReward,
      participantIds,
    } = validation.data;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    // Create challenge and add participants
    const challenge = await prisma.$transaction(async (tx) => {
      const newChallenge = await tx.friendChallenge.create({
        data: {
          creatorId: session.user.id,
          title,
          description,
          type,
          goal,
          metric,
          startDate: start,
          endDate: end,
          isPublic,
          xpReward,
          coinsReward,
        },
      });

      // Add creator as participant
      await tx.challengeParticipant.create({
        data: {
          challengeId: newChallenge.id,
          userId: session.user.id,
        },
      });

      // Add invited participants
      if (participantIds && participantIds.length > 0) {
        await tx.challengeParticipant.createMany({
          data: participantIds
            .filter(id => id !== session.user.id)
            .map(userId => ({
              challengeId: newChallenge.id,
              userId,
            })),
        });

        // Create notifications for invited users
        await tx.notification.createMany({
          data: participantIds
            .filter(id => id !== session.user.id)
            .map(userId => ({
              userId,
              type: 'CHALLENGE_INVITE',
              title: 'Challenge Invitation',
              message: `${session.user.username || 'Someone'} invited you to a challenge: ${title}`,
              actorId: session.user.id,
              challengeId: newChallenge.id,
            })),
        });
      }

      return newChallenge;
    });

    return NextResponse.json({ success: true, challenge });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
}
