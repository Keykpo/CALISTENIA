import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createGoalSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  estimatedWeeks: z.number().optional(),
  skillName: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createGoalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: validation.error },
        { status: 400 }
      );
    }

    const { name, description, difficulty, estimatedWeeks, skillName } = validation.data;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Find target skill if skillName provided
    let targetSkillId = null;
    if (skillName) {
      const skill = await prisma.skill.findFirst({
        where: { name: skillName },
      });
      targetSkillId = skill?.id || null;
    }

    // Create training goal
    const goal = await prisma.trainingGoal.create({
      data: {
        userId: user.id,
        name,
        description,
        difficulty,
        estimatedWeeks,
        targetSkillId,
        isActive: true,
        progress: 0,
      },
    });

    // Set as primary goal if user doesn't have one
    if (!user.primaryGoalId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { primaryGoalId: goal.id },
      });
    }

    return NextResponse.json({
      success: true,
      goal,
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear objetivo' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        trainingGoals: {
          where: { isActive: true },
          include: {
            targetSkill: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        primaryGoal: {
          include: {
            targetSkill: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      goals: user.trainingGoals,
      primaryGoal: user.primaryGoal,
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener objetivos' },
      { status: 500 }
    );
  }
}
