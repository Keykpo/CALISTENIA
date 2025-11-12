import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

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
 * POST /api/training/initialize-profile
 *
 * Initialize or ensure hexagon profile exists for user
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hexagonProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // If hexagon profile already exists, return it
    if (user.hexagonProfile) {
      return NextResponse.json({
        success: true,
        message: 'Hexagon profile already exists',
        profile: user.hexagonProfile,
        created: false,
      });
    }

    // Create hexagon profile with default BEGINNER values
    const hexagonProfile = await prisma.hexagonProfile.create({
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
        relativeStrengthLevel: 'BEGINNER',
        muscularEnduranceLevel: 'BEGINNER',
        balanceControlLevel: 'BEGINNER',
        jointMobilityLevel: 'BEGINNER',
        bodyTensionLevel: 'BEGINNER',
        skillTechniqueLevel: 'BEGINNER',
      },
    });

    console.log('[INITIALIZE_PROFILE] Created hexagon profile for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Hexagon profile created successfully',
      profile: hexagonProfile,
      created: true,
    });
  } catch (error: any) {
    console.error('[INITIALIZE_PROFILE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize profile',
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
