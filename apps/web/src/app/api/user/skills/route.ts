import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-middleware';
import { 
  calculateMissionProgress, 
  isSkillComplete,
  checkSkillPrerequisites,
} from '@/lib/skill-utils';
import { updateSkillSchema } from '@/lib/validations';
import { calculateLevel } from '@/lib/levels';

/**
 * GET /api/user/skills
 * Obtiene todas las skills del usuario con su progreso
 */
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        totalXP: true,
        currentLevel: true,
        virtualCoins: true,
        totalStrength: true,
      },
    });
    // Fallback: si el usuario no existe (p.ej. DB reseteada), continuar con valores por defecto
    const userSafe = user ?? {
      totalXP: 0,
      currentLevel: 1,
      virtualCoins: 0,
      totalStrength: 0,
    };

    const userSkills = await prisma.userSkill.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        skill: {
          include: {
            prerequisites: {
              include: {
                prerequisite: {
                  select: {
                    id: true,
                    name: true,
                    difficulty: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { skill: { branch: 'asc' } },
        { skill: { order: 'asc' } },
      ],
    });

    const skillsWithProgress = await Promise.all(
      userSkills.map(async (userSkill) => {
        const currentProgress = {
          sets: userSkill.currentSets,
          reps: userSkill.currentReps,
          duration: userSkill.currentDuration,
          days: userSkill.daysCompleted,
        };

        let progress = 0;
        try {
          progress = calculateMissionProgress(currentProgress, {
            requiredSets: userSkill.skill.requiredSets,
            requiredReps: userSkill.skill.requiredReps,
            requiredDuration: userSkill.skill.requiredDuration,
            requiredDays: userSkill.skill.requiredDays,
          });
        } catch (e) {
          progress = 0;
        }

        const { canUnlock } = await checkSkillPrerequisites(
          session.user.id,
          userSkill.skillId
        );
        
        return {
          ...userSkill,
          completionProgress: progress,
          canUnlock,
          skill: {
            ...userSkill.skill,
            prerequisites: userSkill.skill.prerequisites.map(p => p.prerequisite),
          },
        };
      })
    );

    const levelInfo = calculateLevel(userSafe.totalXP || 0);

    return NextResponse.json({
      success: true,
      userInfo: {
        ...userSafe,
        levelInfo,
      },
      skills: skillsWithProgress,
      total: skillsWithProgress.length,
    });
  } catch (error) {
    console.error('Error al obtener habilidades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/skills
 * TODAS LAS CORRECCIONES CRÍTICAS APLICADAS:
 * - Validación con Zod
 * - Cálculo de progreso corregido
 * - Verificación de completitud correcta
 * - Transacciones para atomicidad
 * - Recompensas otorgadas correctamente (incluyendo totalStrength)
 */
export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;
    
    const body = await request.json();
    const validationResult = updateSkillSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    const userId = session.user.id;
    
    const skill = await prisma.skill.findUnique({
      where: { id: data.skillId },
    });

    if (!skill) {
      return NextResponse.json(
        { error: 'Habilidad no encontrada' },
        { status: 404 }
      );
    }

    const { canUnlock, missingPrerequisites } = await checkSkillPrerequisites(
      userId,
      data.skillId
    );
    
    if (!canUnlock) {
      return NextResponse.json(
        { 
          error: 'No se cumplen los prerequisitos',
          missingPrerequisites 
        },
        { status: 403 }
      );
    }

    const existingUserSkill = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId: data.skillId,
        },
      },
    });

    const currentProgress = {
      sets: data.currentSets ?? 0,
      reps: data.currentReps ?? 0,
      duration: data.currentDuration ?? 0,
      days: data.daysCompleted ?? 0,
    };

    let completionProgress: number;
    try {
      completionProgress = calculateMissionProgress(currentProgress, {
        requiredSets: skill.requiredSets ?? undefined,
        requiredReps: skill.requiredReps ?? undefined,
        requiredDuration: skill.requiredDuration ?? undefined,
        requiredDays: skill.requiredDays,
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Error al calcular progreso' },
        { status: 400 }
      );
    }

    const completed = isSkillComplete(currentProgress, {
      requiredSets: skill.requiredSets ?? undefined,
      requiredReps: skill.requiredReps ?? undefined,
      requiredDuration: skill.requiredDuration ?? undefined,
      requiredDays: skill.requiredDays,
    });

    const wasAlreadyCompleted = existingUserSkill?.isCompleted || false;
    const shouldGrantRewards = completed && !wasAlreadyCompleted;

    // FIX: Usar transacción para atomicidad
    const result = await prisma.$transaction(async (tx) => {
      const userSkill = await tx.userSkill.upsert({
        where: {
          userId_skillId: {
            userId,
            skillId: data.skillId,
          },
        },
        update: {
          currentSets: currentProgress.sets,
          currentReps: currentProgress.reps,
          currentDuration: currentProgress.duration,
          daysCompleted: currentProgress.days,
          completionProgress,
          isCompleted: completed,
          completedAt: completed && !wasAlreadyCompleted ? new Date() : existingUserSkill?.completedAt,
          strengthLevel: data.strengthLevel ?? existingUserSkill?.strengthLevel ?? 0,
          enduranceLevel: data.enduranceLevel ?? existingUserSkill?.enduranceLevel ?? 0,
          flexibilityLevel: data.flexibilityLevel ?? existingUserSkill?.flexibilityLevel ?? 0,
          balanceLevel: data.balanceLevel ?? existingUserSkill?.balanceLevel ?? 0,
        },
        create: {
          userId,
          skillId: data.skillId,
          currentSets: currentProgress.sets,
          currentReps: currentProgress.reps,
          currentDuration: currentProgress.duration,
          daysCompleted: currentProgress.days,
          completionProgress,
          isCompleted: completed,
          completedAt: completed ? new Date() : null,
          isUnlocked: true,
          unlockedAt: new Date(),
          strengthLevel: data.strengthLevel ?? 0,
          enduranceLevel: data.enduranceLevel ?? 0,
          flexibilityLevel: data.flexibilityLevel ?? 0,
          balanceLevel: data.balanceLevel ?? 0,
        },
        include: {
          skill: true,
        },
      });

      // FIX CRÍTICO: Paréntesis correctos Y actualizar totalStrength
      let updatedUser = null;
      if (shouldGrantRewards && (skill.xpReward > 0 || skill.coinReward > 0)) {
        updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            totalXP: { increment: skill.xpReward },
            virtualCoins: { increment: skill.coinReward },
            totalStrength: { increment: skill.strengthGained || 0 }, // FIX CRÍTICO
          },
          select: {
            totalXP: true,
            currentLevel: true,
            virtualCoins: true,
            totalStrength: true,
          },
        });
      } else {
        updatedUser = await tx.user.findUnique({
          where: { id: userId },
          select: {
            totalXP: true,
            currentLevel: true,
            virtualCoins: true,
            totalStrength: true,
          },
        });
      }

      return { userSkill, updatedUser };
    });

    return NextResponse.json({
      success: true,
      userSkill: result.userSkill,
      userInfo: result.updatedUser,
      rewardsGranted: shouldGrantRewards ? {
        xp: skill.xpReward,
        coins: skill.coinReward,
        strength: skill.strengthGained || 0,
      } : null,
    });

  } catch (error) {
    console.error('Error al actualizar habilidad:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}