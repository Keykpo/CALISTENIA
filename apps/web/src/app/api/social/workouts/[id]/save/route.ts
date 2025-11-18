import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Save a shared workout
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

    // Check if already saved
    const existing = await prisma.sharedWorkoutSave.findUnique({
      where: {
        workoutId_userId: {
          workoutId,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already saved' }, { status: 400 });
    }

    // Save and increment counter
    await prisma.$transaction([
      prisma.sharedWorkoutSave.create({
        data: {
          workoutId,
          userId: session.user.id,
        },
      }),
      prisma.sharedWorkout.update({
        where: { id: workoutId },
        data: { savesCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving workout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save workout' },
      { status: 500 }
    );
  }
}

// DELETE - Unsave a shared workout
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
      prisma.sharedWorkoutSave.delete({
        where: {
          workoutId_userId: {
            workoutId,
            userId: session.user.id,
          },
        },
      }),
      prisma.sharedWorkout.update({
        where: { id: workoutId },
        data: { savesCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsaving workout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsave workout' },
      { status: 500 }
    );
  }
}
