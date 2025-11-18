import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get community details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const communityId = params.id;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        members: {
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user is member
    let isMember = false;
    let userRole = null;
    if (session?.user?.id) {
      const membership = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId,
            userId: session.user.id,
          },
        },
      });
      isMember = !!membership;
      userRole = membership?.role || null;
    }

    return NextResponse.json({
      success: true,
      community: {
        ...community,
        isMember,
        userRole,
      },
    });
  } catch (error) {
    console.error('Error fetching community:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch community' },
      { status: 500 }
    );
  }
}

// PUT - Update community (admins only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const communityId = params.id;

    // Check if user is admin
    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || membership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { name, description, imageUrl, coverImage, isPublic } = body;

    const updated = await prisma.community.update({
      where: { id: communityId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(coverImage !== undefined && { coverImage }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return NextResponse.json({ success: true, community: updated });
  } catch (error) {
    console.error('Error updating community:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update community' },
      { status: 500 }
    );
  }
}

// DELETE - Delete community (creator only)
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

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    if (community.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.community.delete({
      where: { id: communityId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting community:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete community' },
      { status: 500 }
    );
  }
}
