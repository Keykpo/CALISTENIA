import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const shareWorkoutSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  exercises: z.string(), // JSON string
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE']),
  isPublic: z.boolean().default(true),
});

// GET - Get shared workouts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'trending'; // trending, friends, own, saved
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let whereClause: any = { isPublic: true };

    if (filter === 'own' && session?.user?.id) {
      whereClause.userId = session.user.id;
    } else if (filter === 'friends' && session?.user?.id) {
      // Get friend IDs
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

      whereClause.userId = { in: friendIds };
    } else if (filter === 'saved' && session?.user?.id) {
      // Get saved workouts
      const saved = await prisma.sharedWorkoutSave.findMany({
        where: { userId: session.user.id },
        select: { workoutId: true },
      });

      whereClause.id = { in: saved.map(s => s.workoutId) };
    }

    const workouts = await prisma.sharedWorkout.findMany({
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
        _count: {
          select: {
            likes: true,
            saves: true,
          },
        },
      },
      orderBy:
        filter === 'trending'
          ? [
              { likesCount: 'desc' },
              { savesCount: 'desc' },
              { completedCount: 'desc' },
            ]
          : { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Check if user liked/saved (if authenticated)
    let workoutsWithUserData = workouts;
    if (session?.user?.id) {
      const userLikes = await prisma.sharedWorkoutLike.findMany({
        where: {
          userId: session.user.id,
          workoutId: { in: workouts.map(w => w.id) },
        },
        select: { workoutId: true },
      });

      const userSaves = await prisma.sharedWorkoutSave.findMany({
        where: {
          userId: session.user.id,
          workoutId: { in: workouts.map(w => w.id) },
        },
        select: { workoutId: true },
      });

      const likedSet = new Set(userLikes.map(l => l.workoutId));
      const savedSet = new Set(userSaves.map(s => s.workoutId));

      workoutsWithUserData = workouts.map(workout => ({
        ...workout,
        isLiked: likedSet.has(workout.id),
        isSaved: savedSet.has(workout.id),
        exercises: JSON.parse(workout.exercises),
      }));
    }

    return NextResponse.json({
      success: true,
      workouts: workoutsWithUserData,
      hasMore: workouts.length === limit,
    });
  } catch (error) {
    console.error('Error fetching shared workouts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
}

// POST - Share a workout
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

    const validation = shareWorkoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    const { name, description, exercises, difficulty, isPublic } = validation.data;

    const workout = await prisma.sharedWorkout.create({
      data: {
        userId: session.user.id,
        name,
        description,
        exercises,
        difficulty,
        isPublic,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Create activity for friends if public
    if (isPublic) {
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
            type: 'TRENDING_WORKOUT',
            description: `${session.user.username || 'A friend'} shared a new workout: ${name}`,
            relatedUserId: session.user.id,
            relatedWorkoutId: workout.id,
          })),
        });
      }
    }

    return NextResponse.json({
      success: true,
      workout: {
        ...workout,
        exercises: JSON.parse(exercises),
      },
    });
  } catch (error) {
    console.error('Error sharing workout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to share workout' },
      { status: 500 }
    );
  }
}
