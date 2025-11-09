import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

const assessmentSchema = z.object({
  userId: z.string(),
  skillBranch: z.string(),
  currentLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE']),
  assessmentScore: z.number().min(0).max(9),
});

/**
 * POST /api/skill-progress/assessment
 * Save or update assessment results for a skill branch
 */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = assessmentSchema.parse(json);

    console.log('[ASSESSMENT] Saving:', data);

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
          currentLevel: data.currentLevel,
          assessmentScore: data.assessmentScore,
          assessmentDate: new Date(),
        },
      });

      console.log('[ASSESSMENT] Updated:', progress.id);
    } else {
      // Create new progress
      progress = await prisma.userSkillProgress.create({
        data: {
          userId: data.userId,
          skillBranch: data.skillBranch,
          currentLevel: data.currentLevel,
          assessmentScore: data.assessmentScore,
          assessmentDate: new Date(),
        },
      });

      console.log('[ASSESSMENT] Created:', progress.id);
    }

    return NextResponse.json(
      {
        success: true,
        progress,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[ASSESSMENT] Error:', err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid data',
          details: err.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: err?.message,
      },
      { status: 500 }
    );
  }
}
