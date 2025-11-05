import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// PUT - Actualizar progreso específico de una habilidad (para entrenamientos)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { skillId, incrementSets, incrementReps, incrementDuration, incrementDays } = body;

    if (!skillId) {
      return NextResponse.json(
        { error: 'ID de habilidad requerido' },
        { status: 400 }
      );
    }

    // Verificar que la habilidad existe
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      return NextResponse.json(
        { error: 'Habilidad no encontrada' },
        { status: 404 }
      );
    }

    // Obtener el progreso actual del usuario
    const currentUserSkill = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId: session.user.id,
          skillId: skillId,
        },
      },
    });

    if (!currentUserSkill) {
      return NextResponse.json(
        { error: 'El usuario no tiene esta habilidad registrada' },
        { status: 404 }
      );
    }

    // Calcular nuevos valores incrementales
    const newSets = Math.min(
      (currentUserSkill.currentSets || 0) + (incrementSets || 0),
      skill.requiredSets || Number.MAX_SAFE_INTEGER
    );
    
    const newReps = Math.min(
      (currentUserSkill.currentReps || 0) + (incrementReps || 0),
      skill.requiredReps || Number.MAX_SAFE_INTEGER
    );
    
    const newDuration = Math.min(
      (currentUserSkill.currentDuration || 0) + (incrementDuration || 0),
      skill.requiredDuration || Number.MAX_SAFE_INTEGER
    );
    
    const newDays = Math.min(
      (currentUserSkill.daysCompleted || 0) + (incrementDays || 0),
      skill.requiredDays || Number.MAX_SAFE_INTEGER
    );

    // Calcular progreso
    let totalProgress = 0;
    let requirements = 0;

    if (skill.requiredSets > 0) {
      totalProgress += Math.min(newSets / skill.requiredSets, 1) * 100;
      requirements++;
    }

    if (skill.requiredReps > 0) {
      totalProgress += Math.min(newReps / skill.requiredReps, 1) * 100;
      requirements++;
    }

    if (skill.requiredDuration > 0) {
      totalProgress += Math.min(newDuration / skill.requiredDuration, 1) * 100;
      requirements++;
    }

    if (skill.requiredDays > 0) {
      totalProgress += Math.min(newDays / skill.requiredDays, 1) * 100;
      requirements++;
    }

    const progress = requirements > 0 ? totalProgress / requirements : 0;

    // Verificar si se completó la misión
    const isCompleted = (
      (skill.requiredSets === 0 || newSets >= skill.requiredSets) &&
      (skill.requiredReps === 0 || newReps >= skill.requiredReps) &&
      (skill.requiredDuration === 0 || newDuration >= skill.requiredDuration) &&
      (skill.requiredDays === 0 || newDays >= skill.requiredDays)
    );

    const wasAlreadyCompleted = currentUserSkill.isCompleted || false;
    const shouldGrantRewards = isCompleted && !wasAlreadyCompleted;

    // Actualizar el progreso
    const updatedUserSkill = await prisma.userSkill.update({
      where: {
        userId_skillId: {
          userId: session.user.id,
          skillId: skillId,
        },
      },
      data: {
        currentSets: newSets,
        currentReps: newReps,
        currentDuration: newDuration,
        daysCompleted: newDays,
        completionProgress: progress,
        isCompleted,
        completedAt: isCompleted && !wasAlreadyCompleted ? new Date() : currentUserSkill.completedAt,
      },
      include: {
        skill: true,
      },
    });

    // Otorgar recompensas si se completó por primera vez
    if (shouldGrantRewards && (skill.xpReward > 0 || skill.coinReward > 0 || skill.strengthGained > 0)) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalXP: {
            increment: skill.xpReward,
          },
          virtualCoins: {
            increment: skill.coinReward,
          },
          totalStrength: {
            increment: skill.strengthGained,
          },
        },
      });
    }

    // Obtener información actualizada del usuario
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        totalXP: true,
        currentLevel: true,
        virtualCoins: true,
        totalStrength: true,
      },
    });

    return NextResponse.json({
      userSkill: updatedUserSkill,
      userInfo: updatedUser,
      rewardsGranted: shouldGrantRewards ? {
        xp: skill.xpReward,
        coins: skill.coinReward,
        strength: skill.strengthGained,
      } : null,
      progressUpdate: {
        sets: { previous: currentUserSkill.currentSets || 0, current: newSets },
        reps: { previous: currentUserSkill.currentReps || 0, current: newReps },
        duration: { previous: currentUserSkill.currentDuration || 0, current: newDuration },
        days: { previous: currentUserSkill.daysCompleted || 0, current: newDays },
        progress: { previous: currentUserSkill.completionProgress || 0, current: progress },
      },
    });
  } catch (error) {
    console.error('Error al actualizar progreso de habilidad:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}