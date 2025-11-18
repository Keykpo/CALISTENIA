import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const sendMessageSchema = z.object({
  recipientId: z.string(),
  content: z.string().min(1).max(2000),
});

// GET - Get conversations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: session.user.id },
          { participant2Id: session.user.id },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        participant2: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            content: true,
            createdAt: true,
            isRead: true,
            senderId: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: session.user.id },
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Map to get the other participant
    const conversationsWithPartner = conversations.map(conv => {
      const partner =
        conv.participant1Id === session.user.id
          ? conv.participant2
          : conv.participant1;

      return {
        id: conv.id,
        partner,
        lastMessage: conv.messages[0] || null,
        unreadCount: conv._count.messages,
        lastMessageAt: conv.lastMessageAt,
      };
    });

    return NextResponse.json({
      success: true,
      conversations: conversationsWithPartner,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST - Send a message
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

    const validation = sendMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    const { recipientId, content } = validation.data;

    if (recipientId === session.user.id) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true },
    });

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Find or create conversation
    // Always order IDs consistently to avoid duplicates
    const [smallerId, largerId] =
      session.user.id < recipientId
        ? [session.user.id, recipientId]
        : [recipientId, session.user.id];

    let conversation = await prisma.conversation.findFirst({
      where: {
        participant1Id: smallerId,
        participant2Id: largerId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: smallerId,
          participant2Id: largerId,
        },
      });
    }

    // Create message and update conversation
    const message = await prisma.directMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        content,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'MESSAGE_RECEIVED',
        title: 'New Message',
        message: `${session.user.username || 'Someone'} sent you a message`,
        actorId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
