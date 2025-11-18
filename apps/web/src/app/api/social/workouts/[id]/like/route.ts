import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Like a shared workout
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workoutId = params.id;

    // Check if already liked
    const existing = await prisma.sharedWorkoutLike.findUnique({
      where: {
        workoutId_userId: {
          workoutId,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already liked' }, { status: 400 });
    }

    // Like and increment counter
    await prisma.$transaction([
      prisma.sharedWorkoutLike.create({
        data: {
          workoutId,
          userId: session.user.id,
        },
      }),
      prisma.sharedWorkout.update({
        where: { id: workoutId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error liking workout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to like workout' },
      { status: 500 }
    );
  }
}

// DELETE - Unlike a shared workout
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workoutId = params.id;

    await prisma.$transaction([
      prisma.sharedWorkoutLike.delete({
        where: {
          workoutId_userId: {
            workoutId,
            userId: session.user.id,
          },
        },
      }),
      prisma.sharedWorkout.update({
        where: { id: workoutId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unliking workout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unlike workout' },
      { status: 500 }
    );
  }
}
