import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

export const runtime = 'nodejs';

const TrainingGoalSchema = z.object({
  primary: z.string(),
  focusArea: z.string().optional(),
  targetSkill: z.string().optional(), // For skill_mastery goal
  description: z.string(),
  duration: z.number().int().min(10).max(180).optional(), // 10 min to 3 hours
});

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
 * GET /api/training/goals
 *
 * Check if user has training goals set
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

    // Check if user has any training goals
    const goal = await prisma.trainingGoal.findFirst({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      hasGoals: !!goal,
      goal: goal || null,
    });
  } catch (error: any) {
    console.error('[TRAINING_GOALS] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch training goals',
        message: error?.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/training/goals
 *
 * Save training goals for the user
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = TrainingGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { primary, focusArea, targetSkill, description, duration } = parsed.data;

    // Deactivate previous goals
    await prisma.trainingGoal.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Create new goal
    const goal = await prisma.trainingGoal.create({
      data: {
        userId,
        goalType: primary,
        targetArea: focusArea || null,
        name: targetSkill || null, // Store target skill in name field
        description,
        preferredDuration: duration || 60, // Default to 60 minutes
        isActive: true,
      },
    });

    console.log(`[TRAINING_GOALS] Saved goals for user ${userId}: ${primary}${focusArea ? ` (${focusArea})` : ''}${targetSkill ? ` - ${targetSkill}` : ''}`);

    return NextResponse.json({
      success: true,
      goal,
      message: 'Training goals saved successfully',
    });
  } catch (error: any) {
    console.error('[TRAINING_GOALS] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save training goals',
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
