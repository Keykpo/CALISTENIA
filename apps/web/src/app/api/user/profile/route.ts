import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  fitnessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  hasCompletedAssessment: z.boolean().optional(),
  assessmentDate: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
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

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch user profile with hexagon profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        fitnessLevel: true,
        hasCompletedAssessment: true,
        assessmentDate: true,
        hexagonProfile: {
          select: {
            // Visual values (0-10)
            relativeStrength: true,
            muscularEndurance: true,
            balanceControl: true,
            jointMobility: true,
            bodyTension: true,
            skillTechnique: true,
            // XP values (required for calculations)
            relativeStrengthXP: true,
            muscularEnduranceXP: true,
            balanceControlXP: true,
            jointMobilityXP: true,
            bodyTensionXP: true,
            skillTechniqueXP: true,
            // Level values (required for mode calculation)
            relativeStrengthLevel: true,
            muscularEnduranceLevel: true,
            balanceControlLevel: true,
            jointMobilityLevel: true,
            bodyTensionLevel: true,
            skillTechniqueLevel: true,
          },
        },
        goals: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...user,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...data,
        assessmentDate: data.assessmentDate ? new Date(data.assessmentDate) : undefined,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        fitnessLevel: true,
        hasCompletedAssessment: true,
        assessmentDate: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Error updating profile' },
      { status: 500 }
    );
  }
}
