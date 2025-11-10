import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH /api/routines/[id] - Update routine
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const routineId = params.id;

    // Verify ownership
    const existingRoutine = await prisma.customRoutine.findUnique({
      where: { id: routineId },
    });

    if (!existingRoutine || existingRoutine.userId !== user.id) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    const routine = await prisma.customRoutine.update({
      where: { id: routineId },
      data: body,
    });

    return NextResponse.json({
      success: true,
      routine: {
        ...routine,
        exercises: JSON.parse(routine.exercises),
      },
    });
  } catch (error) {
    console.error('Error updating routine:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update routine' },
      { status: 500 }
    );
  }
}

// DELETE /api/routines/[id] - Delete routine
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const routineId = params.id;

    // Verify ownership
    const existingRoutine = await prisma.customRoutine.findUnique({
      where: { id: routineId },
    });

    if (!existingRoutine || existingRoutine.userId !== user.id) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 });
    }

    await prisma.customRoutine.delete({
      where: { id: routineId },
    });

    return NextResponse.json({
      success: true,
      message: 'Routine deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting routine:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete routine' },
      { status: 500 }
    );
  }
}
