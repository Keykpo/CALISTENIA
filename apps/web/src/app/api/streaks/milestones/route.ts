import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserMilestones } from '@/lib/streak-system';

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
 * GET /api/streaks/milestones
 * Returns all streak milestones with user's progress
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

    const milestones = await getUserMilestones(userId);

    return NextResponse.json({
      success: true,
      milestones,
    });
  } catch (error: any) {
    console.error('[STREAKS_MILESTONES_API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch milestones',
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
