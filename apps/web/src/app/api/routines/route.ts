import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/routines - Get all user's routines
export async function GET(request: NextRequest) {
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

    const routines = await prisma.customRoutine.findMany({
      where: { userId: user.id },
      orderBy: [
        { isFavorite: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    // Parse exercises JSON
    const parsedRoutines = routines.map(routine => ({
      ...routine,
      exercises: JSON.parse(routine.exercises),
    }));

    return NextResponse.json({
      success: true,
      routines: parsedRoutines,
    });
  } catch (error) {
    console.error('Error fetching routines:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch routines' },
      { status: 500 }
    );
  }
}

// POST /api/routines - Create new routine
export async function POST(request: NextRequest) {
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
    const { name, description, difficulty, exercises } = body;

    // Calculate estimated duration
    const estimatedDuration = exercises.reduce((total: number, ex: any) => {
      const exerciseTime = (ex.sets || 0) * ((ex.reps || ex.holdTime || 30) + ex.restTime);
      return total + exerciseTime / 60;
    }, 0);

    const routine = await prisma.customRoutine.create({
      data: {
        userId: user.id,
        name,
        description: description || '',
        difficulty,
        exercises: JSON.stringify(exercises),
        estimatedDuration: Math.round(estimatedDuration),
      },
    });

    return NextResponse.json({
      success: true,
      routine: {
        ...routine,
        exercises: JSON.parse(routine.exercises),
      },
    });
  } catch (error) {
    console.error('Error creating routine:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create routine' },
      { status: 500 }
    );
  }
}
