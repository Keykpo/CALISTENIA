import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-middleware';

// POST - Intentar desbloquear habilidades disponibles
export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { branch } = body; // Opcional: desbloquear solo habilidades de una rama específica

    // Obtener información del usuario para verificar fuerza
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        totalStrength: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener todas las habilidades completadas del usuario
    const completedSkills = await prisma.userSkill.findMany({
      where: {
        userId: session.user.id,
        isCompleted: true,
      },
      select: {
        skillId: true,
      },
    });

    const completedSkillIds = completedSkills.map(us => us.skillId);

    // Obtener todas las habilidades que podrían desbloquearse
    const whereClause: any = {};
    if (branch) {
      whereClause.branch = branch;
    }

    const allSkills = await prisma.skill.findMany({
      where: whereClause,
      include: {
        prerequisites: {
          include: {
            prerequisite: true,
          },
        },
      },
      orderBy: [
        { branch: 'asc' },
        { order: 'asc' },
      ],
    });

    const unlockedSkills = [];
    const alreadyUnlockedSkills = [];

    for (const skill of allSkills) {
      // Verificar si ya tiene esta habilidad registrada
      const existingUserSkill = await prisma.userSkill.findUnique({
        where: {
          userId_skillId: {
            userId: session.user.id,
            skillId: skill.id,
          },
        },
      });

      // Si ya existe, saltar
      if (existingUserSkill) {
        alreadyUnlockedSkills.push(skill.name);
        continue;
      }

      // Verificar prerequisitos y fuerza requerida
      let canUnlock = true;
      
      // Verificar prerequisitos de habilidades
      if (skill.prerequisites.length > 0) {
        for (const prereq of skill.prerequisites) {
          if (!completedSkillIds.includes(prereq.prerequisiteId)) {
            canUnlock = false;
            break;
          }
        }
      }

      // Verificar fuerza requerida
      if (canUnlock && skill.strengthRequired && user.totalStrength < skill.strengthRequired) {
        canUnlock = false;
      }

      // Si puede desbloquearse, crear el registro
      if (canUnlock) {
        await prisma.userSkill.create({
          data: {
            userId: session.user.id,
            skillId: skill.id,
            currentSets: 0,
            currentReps: 0,
            currentDuration: 0,
            daysCompleted: 0,
            completionProgress: 0,
            isCompleted: false,
            strengthLevel: 0,
            enduranceLevel: 0,
            flexibilityLevel: 0,
            balanceLevel: 0,
          },
        });

        unlockedSkills.push({
          id: skill.id,
          name: skill.name,
          branch: skill.branch,
          difficulty: skill.difficulty,
          description: skill.description,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Se desbloquearon ${unlockedSkills.length} nuevas habilidades`,
      unlockedSkills,
      alreadyUnlocked: alreadyUnlockedSkills.length,
      totalProcessed: allSkills.length,
    });
  } catch (error) {
    console.error('Error al desbloquear habilidades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Obtener habilidades disponibles para desbloquear
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const branch = searchParams.get('branch');

    // Obtener información del usuario para verificar fuerza
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        totalStrength: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener habilidades completadas del usuario
    const completedSkills = await prisma.userSkill.findMany({
      where: {
        userId: session.user.id,
        isCompleted: true,
      },
      select: {
        skillId: true,
      },
    });

    const completedSkillIds = completedSkills.map(us => us.skillId);

    // Obtener habilidades ya registradas (desbloqueadas)
    const userSkills = await prisma.userSkill.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        skillId: true,
      },
    });

    const userSkillIds = userSkills.map(us => us.skillId);

    // Obtener todas las habilidades
    const whereClause: any = {
      id: {
        notIn: userSkillIds, // Excluir las ya desbloqueadas
      },
    };
    
    if (branch) {
      whereClause.branch = branch;
    }

    const availableSkills = await prisma.skill.findMany({
      where: whereClause,
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
      orderBy: [
        { branch: 'asc' },
        { order: 'asc' },
      ],
    });

    // Clasificar habilidades por disponibilidad
    const readyToUnlock = [];
    const needsPrerequisites = [];
    const needsStrength = [];

    for (const skill of availableSkills) {
      let canUnlock = true;
      const missingPrerequisites = [];
      let strengthInsufficient = false;

      // Verificar prerequisitos de habilidades
      if (skill.prerequisites.length > 0) {
        for (const prereq of skill.prerequisites) {
          if (!completedSkillIds.includes(prereq.prerequisiteId)) {
            canUnlock = false;
            missingPrerequisites.push(prereq.prerequisite);
          }
        }
      }

      // Verificar fuerza requerida
      if (skill.strengthRequired && user.totalStrength < skill.strengthRequired) {
        canUnlock = false;
        strengthInsufficient = true;
      }

      if (canUnlock) {
        readyToUnlock.push({
          ...skill,
          prerequisites: skill.prerequisites.map(p => p.prerequisite),
        });
      } else if (strengthInsufficient && missingPrerequisites.length === 0) {
        needsStrength.push({
          ...skill,
          prerequisites: skill.prerequisites.map(p => p.prerequisite),
          strengthRequired: skill.strengthRequired,
          userStrength: user.totalStrength,
        });
      } else {
        needsPrerequisites.push({
          ...skill,
          prerequisites: skill.prerequisites.map(p => p.prerequisite),
          missingPrerequisites,
          strengthRequired: skill.strengthRequired,
          userStrength: user.totalStrength,
        });
      }
    }

    return NextResponse.json({
      readyToUnlock,
      needsPrerequisites,
      needsStrength,
      summary: {
        readyCount: readyToUnlock.length,
        blockedByPrerequisites: needsPrerequisites.length,
        blockedByStrength: needsStrength.length,
        totalAvailable: availableSkills.length,
      },
    });
  } catch (error) {
    console.error('Error al obtener habilidades disponibles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}