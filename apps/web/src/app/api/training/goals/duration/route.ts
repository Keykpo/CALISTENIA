import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

export const runtime = 'nodejs';

const DurationSchema = z.object({
  duration: z.number().int().min(10).max(180), // 10 min to 3 hours
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
 * PUT /api/training/goals/duration
 *
 * Update only the preferred duration for the active training goal
 */
export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = DurationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid duration', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { duration } = parsed.data;

    // Update the active goal's duration
    const updated = await prisma.trainingGoal.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        preferredDuration: duration,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { success: false, error: 'No active training goal found' },
        { status: 404 }
      );
    }

    console.log(`[TRAINING_DURATION] Updated duration for user ${userId}: ${duration} minutes`);

    return NextResponse.json({
      success: true,
      duration,
      message: 'Duration updated successfully',
    });
  } catch (error: any) {
    console.error('[TRAINING_DURATION] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update duration',
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
