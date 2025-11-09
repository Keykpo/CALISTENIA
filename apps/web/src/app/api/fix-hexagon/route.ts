import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { initializeHexagonProfile } from '@/lib/hexagon-progression';

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

// This endpoint ensures hexagon exists for the current user
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔧 Fix endpoint - userId:', userId);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { hexagonProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('🔧 User found, has hexagon:', !!user.hexagonProfile);

    // If hexagon already exists, return it
    if (user.hexagonProfile) {
      return NextResponse.json({
        success: true,
        message: 'Hexagon already exists',
        hexagon: user.hexagonProfile,
      });
    }

    // Create hexagon based on user's fitness level
    const fitnessLevel = user.fitnessLevel || 'BEGINNER';
    const levelToBaseXP: Record<string, number> = {
      BEGINNER: 24000,
      INTERMEDIATE: 96000,
      ADVANCED: 264000,
      EXPERT: 500000,
    };

    const baseXP = levelToBaseXP[fitnessLevel] || 24000;

    const initialXP = {
      relativeStrength: baseXP,
      muscularEndurance: baseXP,
      balanceControl: baseXP,
      jointMobility: baseXP,
      bodyTension: baseXP,
      skillTechnique: baseXP,
    };

    const hexagonProfile = initializeHexagonProfile(initialXP);

    // Create hexagon
    const created = await prisma.hexagonProfile.create({
      data: {
        userId,
        relativeStrength: hexagonProfile.relativeStrength,
        muscularEndurance: hexagonProfile.muscularEndurance,
        balanceControl: hexagonProfile.balanceControl,
        jointMobility: hexagonProfile.jointMobility,
        bodyTension: hexagonProfile.bodyTension,
        skillTechnique: hexagonProfile.skillTechnique,
        relativeStrengthXP: hexagonProfile.relativeStrengthXP,
        muscularEnduranceXP: hexagonProfile.muscularEnduranceXP,
        balanceControlXP: hexagonProfile.balanceControlXP,
        jointMobilityXP: hexagonProfile.jointMobilityXP,
        bodyTensionXP: hexagonProfile.bodyTensionXP,
        skillTechniqueXP: hexagonProfile.skillTechniqueXP,
        relativeStrengthLevel: hexagonProfile.relativeStrengthLevel,
        muscularEnduranceLevel: hexagonProfile.muscularEnduranceLevel,
        balanceControlLevel: hexagonProfile.balanceControlLevel,
        jointMobilityLevel: hexagonProfile.jointMobilityLevel,
        bodyTensionLevel: hexagonProfile.bodyTensionLevel,
        skillTechniqueLevel: hexagonProfile.skillTechniqueLevel,
      },
    });

    console.log('✅ Hexagon created for userId:', userId);

    return NextResponse.json({
      success: true,
      message: 'Hexagon created successfully',
      hexagon: created,
    });
  } catch (error: any) {
    console.error('❌ Error in fix endpoint:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
