import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createCommunityPostSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(1).max(5000),
  images: z.array(z.string().url()).max(10).optional(),
});

// GET - Get community posts
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const communityId = params.id;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check if user is member (for private communities)
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    if (!community.isPublic && session?.user?.id) {
      const membership = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId,
            userId: session.user.id,
          },
        },
      });

      if (!membership) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const posts = await prisma.communityPost.findMany({
      where: { communityId },
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    // Parse images
    const postsWithImages = posts.map(post => ({
      ...post,
      images: post.images ? JSON.parse(post.images) : [],
    }));

    return NextResponse.json({
      success: true,
      posts: postsWithImages,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST - Create community post
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

    // Check if user is member
    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Must be a member to post' }, { status: 403 });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = createCommunityPostSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    const { title, content, images } = validation.data;

    // Create post and update community count
    const [post] = await prisma.$transaction([
      prisma.communityPost.create({
        data: {
          communityId,
          userId: session.user.id,
          title,
          content,
          images: images ? JSON.stringify(images) : null,
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
      }),
      prisma.community.update({
        where: { id: communityId },
        data: { postsCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        images: images || [],
      },
    });
  } catch (error) {
    console.error('Error creating community post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
