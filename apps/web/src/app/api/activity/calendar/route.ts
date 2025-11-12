import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

async function getUserId(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id as string;
  } catch {}
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (userId) return userId;
  const headerUser = req.headers.get('x-user-id');
  if (headerUser) return headerUser;
  return null;
}

/**
 * GET /api/activity/calendar
 * Returns workout activity data for a specific month
 * Query params: userId, year, month
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
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, month, 0); // Last day of month
    endDate.setHours(23, 59, 59, 999);

    // Fetch all completed workout sessions for the month
    const workoutSessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        completedAt: true,
        actualXP: true,
        actualCoins: true,
      },
      orderBy: {
        completedAt: 'asc',
      },
    });

    // Group workouts by date
    const activityByDate: Record<string, {
      date: string;
      workoutCount: number;
      totalXP: number;
      totalCoins: number;
      completed: boolean;
    }> = {};

    workoutSessions.forEach(session => {
      if (!session.completedAt) return;

      const dateStr = session.completedAt.toISOString().split('T')[0];

      if (!activityByDate[dateStr]) {
        activityByDate[dateStr] = {
          date: dateStr,
          workoutCount: 0,
          totalXP: 0,
          totalCoins: 0,
          completed: true,
        };
      }

      activityByDate[dateStr].workoutCount++;
      activityByDate[dateStr].totalXP += session.actualXP || 0;
      activityByDate[dateStr].totalCoins += session.actualCoins || 0;
    });

    return NextResponse.json({
      success: true,
      activity: activityByDate,
      month: {
        year,
        month,
        totalWorkouts: workoutSessions.length,
        daysActive: Object.keys(activityByDate).length,
      },
    });
  } catch (error: any) {
    console.error('[ACTIVITY_CALENDAR_API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch activity data',
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
