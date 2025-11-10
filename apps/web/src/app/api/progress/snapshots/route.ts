import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/progress/snapshots - Get progress snapshots for a specific skill
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

    // Get skill branch from query params
    const { searchParams } = new URL(request.url);
    const skillBranch = searchParams.get('skillBranch');

    if (!skillBranch) {
      return NextResponse.json({ error: 'skillBranch parameter required' }, { status: 400 });
    }

    // Get all progress snapshots for this user and skill
    const snapshots = await prisma.skillProgressSnapshot.findMany({
      where: {
        userId: user.id,
        skillBranch,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      snapshots,
    });
  } catch (error) {
    console.error('Error fetching progress snapshots:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress snapshots' },
      { status: 500 }
    );
  }
}

// POST /api/progress/snapshots - Create a new progress snapshot
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
    const { skillBranch, level, sessions, totalXP } = body;

    if (!skillBranch || !level) {
      return NextResponse.json(
        { error: 'skillBranch and level are required' },
        { status: 400 }
      );
    }

    // Create a new snapshot
    const snapshot = await prisma.skillProgressSnapshot.create({
      data: {
        userId: user.id,
        skillBranch,
        level,
        sessions: sessions || 0,
        totalXP: totalXP || 0,
        date: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      snapshot,
    });
  } catch (error) {
    console.error('Error creating progress snapshot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create progress snapshot' },
      { status: 500 }
    );
  }
}
