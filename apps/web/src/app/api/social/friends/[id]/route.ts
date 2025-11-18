import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT - Accept/reject friend request
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const friendshipId = params.id;

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { action } = body; // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        requester: {
          select: { id: true, username: true },
        },
      },
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }

    // Only the addressee can accept/reject
    if (friendship.addresseeId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (friendship.status !== 'PENDING') {
      return NextResponse.json({ error: 'Friend request already processed' }, { status: 400 });
    }

    if (action === 'accept') {
      // Accept friend request
      const updatedFriendship = await prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: 'ACCEPTED' },
      });

      // Update both users' stats
      await prisma.$transaction([
        prisma.userStats.upsert({
          where: { userId: session.user.id },
          create: { userId: session.user.id, friendsCount: 1 },
          update: { friendsCount: { increment: 1 } },
        }),
        prisma.userStats.upsert({
          where: { userId: friendship.requesterId },
          create: { userId: friendship.requesterId, friendsCount: 1 },
          update: { friendsCount: { increment: 1 } },
        }),
      ]);

      // Create notification for requester
      await prisma.notification.create({
        data: {
          userId: friendship.requesterId,
          type: 'FRIEND_ACCEPTED',
          title: 'Friend Request Accepted',
          message: `${session.user.username || 'Someone'} accepted your friend request`,
          actorId: session.user.id,
        },
      });

      // Create activity feed items
      await prisma.$transaction([
        prisma.activityFeedItem.create({
          data: {
            userId: session.user.id,
            type: 'FRIEND_JOINED',
            description: `You are now friends with ${friendship.requester.username}`,
            relatedUserId: friendship.requesterId,
          },
        }),
        prisma.activityFeedItem.create({
          data: {
            userId: friendship.requesterId,
            type: 'FRIEND_JOINED',
            description: `You are now friends with ${session.user.username}`,
            relatedUserId: session.user.id,
          },
        }),
      ]);

      return NextResponse.json({ success: true, friendship: updatedFriendship });
    } else {
      // Reject friend request (delete it)
      await prisma.friendship.delete({
        where: { id: friendshipId },
      });

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error processing friend request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process friend request' },
      { status: 500 }
    );
  }
}

// DELETE - Remove friend/cancel friend request
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const friendshipId = params.id;

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }

    // Only participants can delete
    if (friendship.requesterId !== session.user.id && friendship.addresseeId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If friendship was accepted, update stats
    if (friendship.status === 'ACCEPTED') {
      await prisma.$transaction([
        prisma.userStats.upsert({
          where: { userId: friendship.requesterId },
          create: { userId: friendship.requesterId, friendsCount: 0 },
          update: { friendsCount: { decrement: 1 } },
        }),
        prisma.userStats.upsert({
          where: { userId: friendship.addresseeId },
          create: { userId: friendship.addresseeId, friendsCount: 0 },
          update: { friendsCount: { decrement: 1 } },
        }),
      ]);
    }

    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove friend' },
      { status: 500 }
    );
  }
}
