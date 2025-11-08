import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
 * Reset hexagon profile to default values (all 0 XP, BEGINNER levels)
 *
 * POST /api/hexagon/reset
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
    }

    // Reset hexagon profile to defaults
    await prisma.hexagonProfile.update({
      where: { userId },
      data: {
        // Visual values (0-10)
        relativeStrength: 0,
        muscularEndurance: 0,
        balanceControl: 0,
        jointMobility: 0,
        bodyTension: 0,
        skillTechnique: 0,

        // XP values
        relativeStrengthXP: 0,
        muscularEnduranceXP: 0,
        balanceControlXP: 0,
        jointMobilityXP: 0,
        bodyTensionXP: 0,
        skillTechniqueXP: 0,

        // Level strings
        relativeStrengthLevel: 'BEGINNER',
        muscularEnduranceLevel: 'BEGINNER',
        balanceControlLevel: 'BEGINNER',
        jointMobilityLevel: 'BEGINNER',
        bodyTensionLevel: 'BEGINNER',
        skillTechniqueLevel: 'BEGINNER',
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Hexagon profile reset to default values'
    });

  } catch (error: any) {
    console.error('Error resetting hexagon:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
