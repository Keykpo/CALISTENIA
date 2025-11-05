import { prisma } from './prisma';

export interface MissionProgress {
  sets: number;
  reps: number;
  duration: number;
  days: number;
}

export interface SkillRequirements {
  requiredSets?: number | null;
  requiredReps?: number | null;
  requiredDuration?: number | null;
  requiredDays?: number;
}

/**
 * Calcula el progreso de una misión basado en los requisitos
 * @returns Porcentaje de progreso (0-100)
 * @throws Error si la skill no tiene requisitos definidos
 */
export function calculateMissionProgress(
  current: MissionProgress,
  requirements: SkillRequirements
): number {
  const checks = [];
  
  if (requirements.requiredSets && requirements.requiredSets > 0) {
    checks.push({
      current: current.sets,
      required: requirements.requiredSets,
    });
  }
  
  if (requirements.requiredReps && requirements.requiredReps > 0) {
    checks.push({
      current: current.reps,
      required: requirements.requiredReps,
    });
  }
  
  if (requirements.requiredDuration && requirements.requiredDuration > 0) {
    checks.push({
      current: current.duration,
      required: requirements.requiredDuration,
    });
  }
  
  if (requirements.requiredDays && requirements.requiredDays > 0) {
    checks.push({
      current: current.days,
      required: requirements.requiredDays,
    });
  }
  
  if (checks.length === 0) {
    throw new Error('La habilidad no tiene requisitos definidos');
  }
  
  const totalProgress = checks.reduce((sum, check) => {
    const progress = Math.min(check.current / check.required, 1) * 100;
    return sum + progress;
  }, 0);
  
  return Math.round(totalProgress / checks.length);
}

/**
 * Verifica si una skill está completa
 */
export function isSkillComplete(
  current: MissionProgress,
  requirements: SkillRequirements
): boolean {
  const checks = [
    requirements.requiredSets ? current.sets >= requirements.requiredSets : true,
    requirements.requiredReps ? current.reps >= requirements.requiredReps : true,
    requirements.requiredDuration ? current.duration >= requirements.requiredDuration : true,
    requirements.requiredDays ? current.days >= requirements.requiredDays : true,
  ];
  
  // Verificar que al menos un requisito existe
  const hasRequirements = requirements.requiredSets || requirements.requiredReps || 
                          requirements.requiredDuration || requirements.requiredDays;
  
  if (!hasRequirements) {
    return false;
  }
  
  return checks.every(check => check === true);
}

/**
 * Verifica si se cumplen los prerequisitos de una skill
 */
export async function checkSkillPrerequisites(
  userId: string,
  skillId: string
): Promise<{ canUnlock: boolean; missingPrerequisites: string[] }> {
  const prerequisites = await prisma.skillPrerequisite.findMany({
    where: { skillId },
    include: {
      prerequisite: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (prerequisites.length === 0) {
    return { canUnlock: true, missingPrerequisites: [] };
  }

  const missingPrerequisites: string[] = [];

  for (const prereq of prerequisites) {
    const userSkill = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId: prereq.prerequisiteId,
        },
      },
    });

    if (!userSkill || !userSkill.isCompleted) {
      missingPrerequisites.push(prereq.prerequisite.name);
    }
  }

  return {
    canUnlock: missingPrerequisites.length === 0,
    missingPrerequisites,
  };
}

/**
 * Verifica si el usuario tiene suficiente fuerza para desbloquear una skill
 */
export async function checkStrengthRequirement(
  userId: string,
  requiredStrength: number
): Promise<{ sufficient: boolean; current: number; required: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalStrength: true },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return {
    sufficient: user.totalStrength >= requiredStrength,
    current: user.totalStrength,
    required: requiredStrength,
  };
}
