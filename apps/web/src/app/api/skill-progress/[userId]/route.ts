import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/skill-progress/[userId]
 * Get all skill progress for a specific user
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get all progress for this user
    const progress = await prisma.userSkillProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(progress, { status: 200 });
  } catch (err: any) {
    console.error('[SKILL_PROGRESS_BY_USER] GET Error:', err);

    return NextResponse.json(
      { error: 'Internal server error', message: err?.message },
      { status: 500 }
    );
  }
}
