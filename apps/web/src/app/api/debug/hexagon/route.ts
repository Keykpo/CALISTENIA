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

// GET - Check hexagon status
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { hexagonProfile: true },
    });

    return NextResponse.json({
      userId,
      hasUser: !!user,
      hasHexagon: !!user?.hexagonProfile,
      hexagon: user?.hexagonProfile || null,
      fitnessLevel: user?.fitnessLevel,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Force create hexagon for ADVANCED user
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Initialize hexagon with ADVANCED level (264k XP mid-point)
    const advancedXP = 264000;
    const initialXP = {
      relativeStrength: advancedXP,
      muscularEndurance: advancedXP,
      balanceControl: advancedXP,
      jointMobility: advancedXP,
      bodyTension: advancedXP,
      skillTechnique: advancedXP,
    };

    const hexagonProfile = initializeHexagonProfile(initialXP);

    // Check if hexagon exists
    const existing = await prisma.hexagonProfile.findUnique({
      where: { userId },
    });

    let result;
    if (existing) {
      // Update
      result = await prisma.hexagonProfile.update({
        where: { userId },
        data: {
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
    } else {
      // Create
      result = await prisma.hexagonProfile.create({
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
    }

    return NextResponse.json({
      success: true,
      action: existing ? 'updated' : 'created',
      hexagon: result,
    });
  } catch (error: any) {
    console.error('Error creating hexagon:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
