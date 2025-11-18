import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().optional(),
});

// GET - Get comments for a post
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const postId = params.id;

    const comments = await prisma.postComment.findMany({
      where: {
        postId,
        parentId: null, // Only top-level comments
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
        replies: {
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
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST - Create a comment
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

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = createCommentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    const { content, parentId } = validation.data;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Create comment and update count
    const [comment] = await prisma.$transaction([
      prisma.postComment.create({
        data: {
          postId,
          userId: session.user.id,
          content,
          parentId,
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
      prisma.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    // Create notification for post owner (if not own post)
    if (post.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: parentId ? 'COMMENT_REPLY' : 'POST_COMMENT',
          title: parentId ? 'New Reply' : 'New Comment',
          message: `${session.user.username || 'Someone'} ${parentId ? 'replied to' : 'commented on'} your post`,
          actorId: session.user.id,
          postId,
          commentId: comment.id,
        },
      });
    }

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
