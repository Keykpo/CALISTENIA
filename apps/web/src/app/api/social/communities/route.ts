import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createCommunitySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  imageUrl: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  isPublic: z.boolean().default(true),
});

// GET - Get communities (all public or user's communities)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // all, joined, owned
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let whereClause: any = {};

    if (filter === 'joined' && session?.user?.id) {
      // Communities user is a member of
      const memberships = await prisma.communityMember.findMany({
        where: { userId: session.user.id },
        select: { communityId: true },
      });
      whereClause.id = { in: memberships.map(m => m.communityId) };
    } else if (filter === 'owned' && session?.user?.id) {
      whereClause.creatorId = session.user.id;
    } else {
      // All public communities
      whereClause.isPublic = true;
    }

    const communities = await prisma.community.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
      orderBy: { membersCount: 'desc' },
      take: limit,
      skip: offset,
    });

    // Check if user is member (if authenticated)
    let communitiesWithMembership = communities;
    if (session?.user?.id) {
      const userMemberships = await prisma.communityMember.findMany({
        where: {
          userId: session.user.id,
          communityId: { in: communities.map(c => c.id) },
        },
        select: { communityId: true, role: true },
      });

      const membershipMap = new Map(
        userMemberships.map(m => [m.communityId, m.role])
      );

      communitiesWithMembership = communities.map(community => ({
        ...community,
        isMember: membershipMap.has(community.id),
        userRole: membershipMap.get(community.id) || null,
      }));
    }

    return NextResponse.json({
      success: true,
      communities: communitiesWithMembership,
      hasMore: communities.length === limit,
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}

// POST - Create a community
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

    const validation = createCommunitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    const { name, description, imageUrl, coverImage, isPublic } = validation.data;

    // Create community and auto-join creator as admin
    const community = await prisma.$transaction(async (tx) => {
      const newCommunity = await tx.community.create({
        data: {
          name,
          description,
          imageUrl,
          coverImage,
          isPublic,
          creatorId: session.user.id,
          membersCount: 1,
        },
      });

      // Add creator as admin member
      await tx.communityMember.create({
        data: {
          communityId: newCommunity.id,
          userId: session.user.id,
          role: 'ADMIN',
        },
      });

      return newCommunity;
    });

    return NextResponse.json({ success: true, community });
  } catch (error) {
    console.error('Error creating community:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create community' },
      { status: 500 }
    );
  }
}
