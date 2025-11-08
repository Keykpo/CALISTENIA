import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  updateAxisXP,
  type HexagonAxis,
  type HexagonProfileWithXP,
} from '@/lib/hexagon-progression';

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
 * POST /api/hexagon/add-xp
 * Add XP to specific hexagon axis
 *
 * Body: {
 *   axis: 'relativeStrength' | 'muscularEndurance' | etc.
 *   xp: number
 * }
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
    const { axis, xp } = body;

    if (!axis || typeof xp !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters: axis and xp required' },
        { status: 400 }
      );
    }

    const validAxes: HexagonAxis[] = [
      'relativeStrength',
      'muscularEndurance',
      'balanceControl',
      'jointMobility',
      'bodyTension',
      'skillTechnique',
    ];

    if (!validAxes.includes(axis)) {
      return NextResponse.json(
        { success: false, error: `Invalid axis: ${axis}` },
        { status: 400 }
      );
    }

    // Get or create hexagon profile
    let hexProfile = await prisma.hexagonProfile.findUnique({
      where: { userId },
    });

    if (!hexProfile) {
      // Create default hexagon profile
      hexProfile = await prisma.hexagonProfile.create({
        data: {
          userId,
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

    // Update XP using utility function
    const updatedProfile = updateAxisXP(hexProfile as HexagonProfileWithXP, axis, xp);

    // Save to database
    const saved = await prisma.hexagonProfile.update({
      where: { userId },
      data: {
        [axis]: updatedProfile[axis],
        [`${axis}XP`]: updatedProfile[`${axis}XP` as keyof HexagonProfileWithXP],
        [`${axis}Level`]: updatedProfile[`${axis}Level` as keyof HexagonProfileWithXP],
      },
    });

    return NextResponse.json({
      success: true,
      axis,
      xpAdded: xp,
      newXP: updatedProfile[`${axis}XP` as keyof HexagonProfileWithXP],
      newLevel: updatedProfile[`${axis}Level` as keyof HexagonProfileWithXP],
      newValue: updatedProfile[axis],
      profile: saved,
    });
  } catch (error: any) {
    console.error('Error adding hexagon XP:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error adding XP' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hexagon/add-xp-batch
 * Add XP to multiple axes at once
 *
 * Body: {
 *   xpRewards: { [axis: string]: number }
 * }
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
    const { xpRewards } = body;

    if (!xpRewards || typeof xpRewards !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters: xpRewards object required' },
        { status: 400 }
      );
    }

    // Get or create hexagon profile
    let hexProfile = await prisma.hexagonProfile.findUnique({
      where: { userId },
    });

    if (!hexProfile) {
      hexProfile = await prisma.hexagonProfile.create({
        data: {
          userId,
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

    let updatedProfile = hexProfile as HexagonProfileWithXP;

    // Apply all XP rewards
    const updates: Record<string, any> = {};
    const axesUpdated: { axis: string; xp: number; newLevel: string }[] = [];

    for (const [axis, xp] of Object.entries(xpRewards)) {
      if (typeof xp === 'number' && xp > 0) {
        updatedProfile = updateAxisXP(updatedProfile, axis as HexagonAxis, xp);

        updates[axis] = updatedProfile[axis as keyof HexagonProfileWithXP];
        updates[`${axis}XP`] = updatedProfile[`${axis}XP` as keyof HexagonProfileWithXP];
        updates[`${axis}Level`] = updatedProfile[`${axis}Level` as keyof HexagonProfileWithXP];

        axesUpdated.push({
          axis,
          xp,
          newLevel: String(updatedProfile[`${axis}Level` as keyof HexagonProfileWithXP]),
        });
      }
    }

    // Save all updates to database
    const saved = await prisma.hexagonProfile.update({
      where: { userId },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      axesUpdated,
      profile: saved,
    });
  } catch (error: any) {
    console.error('Error adding hexagon XP batch:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error adding XP' },
      { status: 500 }
    );
  }
}
