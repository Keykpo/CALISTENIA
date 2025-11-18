import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Like a post
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: 'Already liked' },
        { status: 400 }
      );
    }

    // Create like and update count in a transaction
    await prisma.$transaction([
      prisma.postLike.create({
        data: {
          postId,
          userId: session.user.id,
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);

    // Create notification for post owner (if not own post)
    if (post.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'POST_LIKE',
          title: 'New Like',
          message: `${session.user.username || 'Someone'} liked your post`,
          actorId: session.user.id,
          postId,
        },
      });
    }

    // Update user stats
    if (post.userId !== session.user.id) {
      await prisma.userStats.upsert({
        where: { userId: post.userId },
        create: {
          userId: post.userId,
          likesReceived: 1,
        },
        update: {
          likesReceived: { increment: 1 },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to like post' },
      { status: 500 }
    );
  }
}

// DELETE - Unlike a post
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;

    // Check if liked
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id,
        },
      },
    });

    if (!existingLike) {
      return NextResponse.json({ error: 'Not liked' }, { status: 400 });
    }

    // Delete like and update count in a transaction
    await prisma.$transaction([
      prisma.postLike.delete({
        where: {
          postId_userId: {
            postId,
            userId: session.user.id,
          },
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unlike post' },
      { status: 500 }
    );
  }
}
