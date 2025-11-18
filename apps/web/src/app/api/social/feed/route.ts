import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get activity feed (friend activities)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');

    const activities = await prisma.activityFeedItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Get related user data for activities
    const activitiesWithDetails = await Promise.all(
      activities.map(async (activity) => {
        let relatedUser = null;
        let relatedPost = null;
        let relatedWorkout = null;

        if (activity.relatedUserId) {
          relatedUser = await prisma.user.findUnique({
            where: { id: activity.relatedUserId },
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          });
        }

        if (activity.relatedPostId) {
          relatedPost = await prisma.post.findUnique({
            where: { id: activity.relatedPostId },
            select: {
              id: true,
              content: true,
              type: true,
            },
          });
        }

        if (activity.relatedWorkoutId) {
          relatedWorkout = await prisma.sharedWorkout.findUnique({
            where: { id: activity.relatedWorkoutId },
            select: {
              id: true,
              name: true,
              difficulty: true,
            },
          });
        }

        return {
          ...activity,
          relatedUser,
          relatedPost,
          relatedWorkout,
          metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      activities: activitiesWithDetails,
      hasMore: activities.length === limit,
    });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}
