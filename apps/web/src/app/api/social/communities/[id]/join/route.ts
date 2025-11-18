import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Join a community
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const communityId = params.id;

    // Check if community exists and is public
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    if (!community.isPublic) {
      return NextResponse.json({ error: 'Community is private' }, { status: 403 });
    }

    // Check if already member
    const existingMembership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId: session.user.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 });
    }

    // Join community
    await prisma.$transaction([
      prisma.communityMember.create({
        data: {
          communityId,
          userId: session.user.id,
          role: 'MEMBER',
        },
      }),
      prisma.community.update({
        where: { id: communityId },
        data: { membersCount: { increment: 1 } },
      }),
    ]);

    // Notify community admins
    const admins = await prisma.communityMember.findMany({
      where: {
        communityId,
        role: 'ADMIN',
      },
      select: { userId: true },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.userId,
          type: 'GROUP_INVITE',
          title: 'New Member',
          message: `${session.user.username || 'Someone'} joined ${community.name}`,
          actorId: session.user.id,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error joining community:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to join community' },
      { status: 500 }
    );
  }
}

// DELETE - Leave a community
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const communityId = params.id;

    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member' }, { status: 400 });
    }

    // Cannot leave if you're the creator
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (community?.creatorId === session.user.id) {
      return NextResponse.json(
        { error: 'Creator cannot leave. Transfer ownership or delete community.' },
        { status: 400 }
      );
    }

    // Leave community
    await prisma.$transaction([
      prisma.communityMember.delete({
        where: {
          communityId_userId: {
            communityId,
            userId: session.user.id,
          },
        },
      }),
      prisma.community.update({
        where: { id: communityId },
        data: { membersCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving community:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to leave community' },
      { status: 500 }
    );
  }
}
