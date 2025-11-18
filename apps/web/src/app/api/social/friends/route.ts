import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get friends list
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ACCEPTED'; // ACCEPTED, PENDING, BLOCKED

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: session.user.id },
          { addresseeId: session.user.id },
        ],
        status,
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            fitnessLevel: true,
          },
        },
        addressee: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            fitnessLevel: true,
          },
        },
      },
    });

    // Map to get the friend (not the current user)
    const friends = friendships.map(friendship => {
      const isSender = friendship.requesterId === session.user.id;
      const friend = isSender ? friendship.addressee : friendship.requester;

      return {
        friendshipId: friendship.id,
        friend,
        status: friendship.status,
        createdAt: friendship.createdAt,
        isSender,
      };
    });

    return NextResponse.json({ success: true, friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch friends' },
      { status: 500 }
    );
  }
}

// POST - Send friend request
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

    const { userId: targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID required' }, { status: 400 });
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: 'Cannot friend yourself' }, { status: 400 });
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, username: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, addresseeId: targetUserId },
          { requesterId: targetUserId, addresseeId: session.user.id },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json(
        { error: 'Friend request already exists' },
        { status: 400 }
      );
    }

    // Create friend request
    const friendship = await prisma.friendship.create({
      data: {
        requesterId: session.user.id,
        addresseeId: targetUserId,
        status: 'PENDING',
      },
    });

    // Create notification for target user
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'FRIEND_REQUEST',
        title: 'New Friend Request',
        message: `${session.user.username || 'Someone'} sent you a friend request`,
        actorId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, friendship });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send friend request' },
      { status: 500 }
    );
  }
}
