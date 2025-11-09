import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { calculateLevelFromScore } from '@/lib/skill-assessments';

export const runtime = 'nodejs';

// Schema for saving assessment results
const assessmentSchema = z.object({
  userId: z.string(),
  skillBranch: z.string(),
  assessmentScore: z.number().min(0).max(9),
});

// Schema for getting user's progress
const progressQuerySchema = z.object({
  userId: z.string(),
  skillBranch: z.string().optional(),
});

/**
 * GET /api/skill-progress
 * Get user's skill progress (all branches or specific branch)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const skillBranch = searchParams.get('skillBranch');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const query = progressQuerySchema.parse({ userId, skillBranch });

    // Get progress for specific branch or all branches
    const where: any = { userId: query.userId };
    if (query.skillBranch) {
      where.skillBranch = query.skillBranch;
    }

    const progress = await prisma.userSkillProgress.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ progress }, { status: 200 });
  } catch (err: any) {
    console.error('[SKILL_PROGRESS] GET Error:', err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          details: err.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: err?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/skill-progress
 * Save assessment results and create/update skill progress
 */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = assessmentSchema.parse(json);

    console.log('[SKILL_PROGRESS] Saving assessment:', data);

    // Calculate level from score
    const currentLevel = calculateLevelFromScore(data.assessmentScore);

    // Check if progress already exists
    const existing = await prisma.userSkillProgress.findUnique({
      where: {
        userId_skillBranch: {
          userId: data.userId,
          skillBranch: data.skillBranch,
        },
      },
    });

    let progress;

    if (existing) {
      // Update existing progress
      progress = await prisma.userSkillProgress.update({
        where: {
          userId_skillBranch: {
            userId: data.userId,
            skillBranch: data.skillBranch,
          },
        },
        data: {
          currentLevel,
          assessmentScore: data.assessmentScore,
          assessmentDate: new Date(),
        },
      });

      console.log('[SKILL_PROGRESS] Updated existing progress:', progress.id);
    } else {
      // Create new progress
      progress = await prisma.userSkillProgress.create({
        data: {
          userId: data.userId,
          skillBranch: data.skillBranch,
          currentLevel,
          assessmentScore: data.assessmentScore,
          assessmentDate: new Date(),
        },
      });

      console.log('[SKILL_PROGRESS] Created new progress:', progress.id);
    }

    return NextResponse.json(
      {
        success: true,
        progress,
        level: currentLevel,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[SKILL_PROGRESS] POST Error:', err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid data',
          details: err.errors,
        },
        { status: 400 }
      );
    }

    // Prisma unique constraint error
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Progress record already exists for this skill' },
        { status: 409 }
      );
    }

    // Prisma foreign key error
    if (err?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid userId' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: err?.message,
        code: err?.code,
      },
      { status: 500 }
    );
  }
}
