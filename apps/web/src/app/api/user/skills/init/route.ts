import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

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

    // Get first skill (should be "Círculos de Brazos" with strengthRequired: 0)
    const firstSkill = await prisma.skill.findFirst({
      where: {
        strengthRequired: 0,
      },
      orderBy: {
        order: 'asc',
      },
    });

    if (!firstSkill) {
      return NextResponse.json(
        { success: false, error: 'No se encontró skill inicial' },
        { status: 404 }
      );
    }

    // Check if user already has this skill
    const existingUserSkill = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId: user.id,
          skillId: firstSkill.id,
        },
      },
    });

    if (existingUserSkill) {
      return NextResponse.json({
        success: true,
        message: 'Usuario ya tiene la skill inicial',
        userSkill: existingUserSkill,
      });
    }

    // Create initial user skill (unlocked but not completed)
    const userSkill = await prisma.userSkill.create({
      data: {
        userId: user.id,
        skillId: firstSkill.id,
        isUnlocked: true,
        unlockedAt: new Date(),
        isCompleted: false,
        currentSets: 0,
        currentReps: 0,
        currentDuration: 0,
        daysCompleted: 0,
        completionProgress: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Skill inicial desbloqueada',
      userSkill,
    });
  } catch (error) {
    console.error('Error initializing user skills:', error);
    return NextResponse.json(
      { success: false, error: 'Error al inicializar skills' },
      { status: 500 }
    );
  }
}
