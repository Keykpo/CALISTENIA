import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllAchievementsProgress } from '@/lib/progressive-achievements';

/**
 * GET /api/achievements/progress
 * Get all achievements with user's progress
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const achievements = await getAllAchievementsProgress(session.user.id);

    return NextResponse.json({
      success: true,
      achievements,
      total: achievements.length,
    });
  } catch (error) {
    console.error('Error fetching achievements progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements progress' },
      { status: 500 }
    );
  }
}
