import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import { z } from 'zod';
import {
  getRewardsFromName,
  type ExerciseReward,
  inferCategoryFromName,
  inferDifficultyFromName,
} from '@/lib/exercise-rewards';
import {
  updateUnifiedAxisXP,
  migrateToUnifiedHexagon,
  getUnifiedAxisXPField,
  getUnifiedAxisLevelField,
  getUnifiedAxisVisualField,
  type UnifiedHexagonAxis,
} from '@/lib/unified-hexagon-system';

const LogSchema = z.object({
  name: z.string().min(2),
  reps: z.number().int().min(0).optional(),
  durationSec: z.number().int().min(0).optional(),
  category: z.string().optional(), // Optional category override
  difficulty: z.string().optional(), // Optional difficulty override
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = LogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 });
    }

    const { name, reps = 0, durationSec = 0, category, difficulty } = parsed.data;

    console.log('[LOG_EXERCISE] Logging exercise:', { name, reps, durationSec, category, difficulty });

    // Get exercise rewards using new system
    const rewards: ExerciseReward = category && difficulty
      ? getRewardsFromName(name, 1.0) // If both provided, use them
      : getRewardsFromName(name, 1.0); // Otherwise infer from name

    console.log('[LOG_EXERCISE] Calculated rewards:', rewards);

    // Get or create hexagon profile
    let hexProfile = await prisma.hexagonProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!hexProfile) {
      hexProfile = await prisma.hexagonProfile.create({
        data: {
          userId: session.user.id,
          relativeStrength: 0,
          muscularEndurance: 0,
          balanceControl: 0,
          jointMobility: 0,
          bodyTension: 0,
          skillTechnique: 0,
          relativeStrengthXP: 0,
          muscularEnduranceXP: 0,
          balanceControlXP: 0,
          jointMobilityXP: 0,
          bodyTensionXP: 0,
          skillTechniqueXP: 0,
        },
      });
    }

    // Migrate to unified profile
    let updatedProfile = migrateToUnifiedHexagon(hexProfile);

    // Apply XP rewards to each axis
    const hexagonUpdates: Record<string, any> = {};

    for (const [axis, xp] of Object.entries(rewards.hexagonXP)) {
      if (xp && xp > 0) {
        updatedProfile = updateUnifiedAxisXP(updatedProfile, axis as UnifiedHexagonAxis, xp);

        // Get database field names
        const visualField = getUnifiedAxisVisualField(axis as UnifiedHexagonAxis);
        const xpField = getUnifiedAxisXPField(axis as UnifiedHexagonAxis);
        const levelField = getUnifiedAxisLevelField(axis as UnifiedHexagonAxis);

        hexagonUpdates[visualField] = updatedProfile[axis as keyof typeof updatedProfile];
        hexagonUpdates[xpField] = updatedProfile[`${axis}XP` as keyof typeof updatedProfile];
        hexagonUpdates[levelField] = updatedProfile[`${axis}Level` as keyof typeof updatedProfile];
      }
    }

    // Save hexagon updates
    const updatedHexagon = await prisma.hexagonProfile.update({
      where: { userId: session.user.id },
      data: hexagonUpdates,
    });

    // Update user's total XP and coins
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalXP: { increment: rewards.totalXP },
        virtualCoins: { increment: rewards.coins },
      },
    });

    console.log('[LOG_EXERCISE] ✅ Exercise logged successfully:', {
      userId: session.user.id,
      xpGained: rewards.totalXP,
      coinsGained: rewards.coins,
      axesUpdated: Object.keys(rewards.hexagonXP),
    });

    return NextResponse.json({
      ok: true,
      hexagon: updatedHexagon,
      xpGain: rewards.totalXP,
      coinsGain: rewards.coins,
      rewards: rewards,
      user: {
        totalXP: updatedUser.totalXP,
        virtualCoins: updatedUser.virtualCoins,
      },
    });
  } catch (error) {
    console.error('[LOG_EXERCISE] Error:', error);
    return NextResponse.json({ error: 'Failed to log exercise' }, { status: 500 });
  }
}