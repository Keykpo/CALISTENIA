import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserStreakData } from '@/lib/streak-system';

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
 * GET /api/streaks
 * Returns the user's current streak data
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

    const streakData = await getUserStreakData(userId);

    return NextResponse.json({
      success: true,
      streak: streakData,
    });
  } catch (error: any) {
    console.error('[STREAKS_API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch streak data',
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
