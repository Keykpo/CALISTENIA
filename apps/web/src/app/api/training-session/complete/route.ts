import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  getUnifiedAxisXPField,
  getUnifiedAxisLevelField,
  getUnifiedLevelFromXP,
} from '@/lib/unified-hexagon-system';
import { getUnifiedPrimaryAxis } from '@/lib/unified-fig-hexagon-mapping';
import { MasteryGoal } from '@/lib/fig-level-progressions';

export const runtime = 'nodejs';

const completeSessionSchema = z.object({
  sessionId: z.string(),
});

/**
 * PUT /api/training-session/complete
 * Mark a training session as complete and award XP
 */
export async function PUT(req: NextRequest) {
  try {
    const json = await req.json();
    const data = completeSessionSchema.parse(json);

    console.log('[TRAINING_SESSION_COMPLETE] Completing session:', data.sessionId);

    // Get session
    const session = await prisma.trainingSession.findUnique({
      where: { id: data.sessionId },
      include: {
        user: {
          include: {
            hexagonProfile: true,
          },
        },
        userSkillProgress: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Session already completed' },
        { status: 400 }
      );
    }

    // Update session status
    const updatedSession = await prisma.trainingSession.update({
      where: { id: data.sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Update user skill progress
    await prisma.userSkillProgress.update({
      where: { id: session.userSkillProgressId },
      data: {
        sessionsCompleted: {
          increment: 1,
        },
        totalXPEarned: {
          increment: session.xpAwarded,
        },
      },
    });

    // Award XP to hexagon profile
    if (session.hexagonCategory) {
      // Convert skill branch to unified axis
      const skillBranch = session.hexagonCategory as MasteryGoal;
      const unifiedAxis = getUnifiedPrimaryAxis(skillBranch);

      // Get database field names for the unified axis
      const xpField = getUnifiedAxisXPField(unifiedAxis);
      const levelField = getUnifiedAxisLevelField(unifiedAxis);

      // Get or create hexagon profile
      let hexagonProfile = session.user.hexagonProfile;

      if (!hexagonProfile) {
        hexagonProfile = await prisma.hexagonProfile.create({
          data: {
            userId: session.userId,
          },
        });
      }

      // Get current XP
      const currentXP = (hexagonProfile as any)[xpField] || 0;
      const newXP = currentXP + session.xpAwarded;

      // Calculate new level
      const newLevel = getUnifiedLevelFromXP(newXP);

      // Update hexagon profile
      await prisma.hexagonProfile.update({
        where: { userId: session.userId },
        data: {
          [xpField]: newXP,
          [levelField]: newLevel,
        },
      });

      console.log(
        `[TRAINING_SESSION_COMPLETE] Awarded ${session.xpAwarded} XP to ${session.hexagonCategory}`
      );
      console.log(`[TRAINING_SESSION_COMPLETE] New XP: ${newXP}, Level: ${newLevel}`);
    }

    // Also update user's total XP
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        totalXP: {
          increment: session.xpAwarded,
        },
      },
    });

    console.log('[TRAINING_SESSION_COMPLETE] Session completed successfully');

    return NextResponse.json(
      {
        success: true,
        session: updatedSession,
        xpAwarded: session.xpAwarded,
        hexagonCategory: session.hexagonCategory,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[TRAINING_SESSION_COMPLETE] Error:', err);

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
        code: err?.code,
      },
      { status: 500 }
    );
  }
}
