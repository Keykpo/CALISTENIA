import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

async function getUserId(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id as string;
  } catch {}
  const headerUser = req.headers.get('x-user-id');
  if (headerUser) return headerUser;
  return null;
}

/**
 * GET /api/training/workout-sessions
 *
 * Get workout sessions for the current user
 * Query params:
 *   - status: ACTIVE | COMPLETED | CANCELLED (optional filter)
 *   - limit: number (default: 50)
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: limit,
    });

    // Parse JSON fields for each session
    const parsedSessions = sessions.map(session => ({
      ...session,
      routine: session.routine ? JSON.parse(session.routine as string) : null,
      progress: session.progress ? JSON.parse(session.progress as string) : null,
      completedExercises: session.completedExercises ? JSON.parse(session.completedExercises as string) : [],
    }));

    return NextResponse.json({
      success: true,
      sessions: parsedSessions,
      total: parsedSessions.length,
    });
  } catch (error: any) {
    console.error('[WORKOUT_SESSIONS] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch workout sessions',
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
