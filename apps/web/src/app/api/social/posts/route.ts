import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema for creating a post
const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  images: z.array(z.string().url()).max(10).optional(),
  videoUrl: z.string().url().optional(),
  type: z.enum(['GENERAL', 'WORKOUT_SHARE', 'PROGRESS_UPDATE', 'ACHIEVEMENT', 'QUESTION', 'TIP', 'MOTIVATION', 'CHALLENGE']).default('GENERAL'),
  workoutId: z.string().optional(),
  achievement: z.string().optional(), // JSON string
});

// GET - Get feed posts (own + friends)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const filter = searchParams.get('filter') || 'all'; // all, friends, own

    // Get user's friends
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

    // Build where clause based on filter
    let whereClause: any = { isPublic: true };

    if (filter === 'friends') {
      whereClause.userId = { in: friendIds };
    } else if (filter === 'own') {
      whereClause.userId = session.user.id;
    } else if (filter === 'all') {
      whereClause.userId = { in: [...friendIds, session.user.id] };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
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
        likes: {
          where: { userId: session.user.id },
          select: { id: true },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Add isLiked flag
    const postsWithLikeStatus = posts.map(post => ({
      ...post,
      isLiked: post.likes.length > 0,
      likes: undefined, // Remove the likes array
      images: post.images ? JSON.parse(post.images) : [],
      achievement: post.achievement ? JSON.parse(post.achievement) : null,
    }));

    return NextResponse.json({
      success: true,
      posts: postsWithLikeStatus,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST - Create a new post
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

    const validation = createPostSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    const { content, images, videoUrl, type, workoutId, achievement } = validation.data;

    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        content,
        images: images ? JSON.stringify(images) : null,
        videoUrl,
        type,
        workoutId,
        achievement,
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
    });

    // Update user stats
    await prisma.userStats.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        postsCount: 1,
      },
      update: {
        postsCount: { increment: 1 },
      },
    });

    // Create activity feed items for friends
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
          type: 'FRIEND_POST',
          description: `${session.user.username || 'A friend'} created a new post`,
          relatedUserId: session.user.id,
          relatedPostId: post.id,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        images: images || [],
        achievement: achievement ? JSON.parse(achievement) : null,
      },
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
