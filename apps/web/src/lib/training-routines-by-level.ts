/**
 * Training Routines by FIG Level System
 *
 * Este archivo define rutinas de entrenamiento estructuradas para cada nivel de dificultad
 * basado en el PDF "Guía de Progresión" y el sistema FIG Level existente.
 *
 * Filosofía:
 * - BEGINNER/INTERMEDIATE: Modo 2 (Fuerza al fallo) - Construcción de base
 * - ADVANCED/ELITE: Modo 1 (Habilidad con buffer) + Modo 2 (Fuerza con lastre)
 */

import { DifficultyLevel, MasteryGoal } from './fig-level-progressions';

export type TrainingMode = 'MODE_1_SKILL' | 'MODE_2_STRENGTH';
export type SessionPhase = 'WARMUP' | 'SKILL_PRACTICE' | 'SUPPORT_STRENGTH' | 'FUNDAMENTAL_STRENGTH' | 'COOLDOWN';

export interface ExerciseBlock {
  phase: SessionPhase;
  duration: number; // minutos
  mode: TrainingMode;
  exercises: {
    exerciseId: string;
    sets: number;
    reps?: number; // para dinámicos
    holdTime?: number; // para isométricos (segundos)
    restBetweenSets: number; // segundos
    notes: string;
  }[];
}

export interface TrainingRoutine {
  level: DifficultyLevel;
  skillBranch: MasteryGoal;
  totalDuration: number; // minutos
  description: string;
  phases: ExerciseBlock[];
  weeklyFrequency: number; // veces por semana recomendadas
}

/**
 * Rutinas de entrenamiento específicas por nivel y skill branch
 */
export const TRAINING_ROUTINES: Record<DifficultyLevel, Partial<Record<MasteryGoal, TrainingRoutine>>> = {

  // ===== NIVEL BEGINNER =====
  // Filosofía: 100% Modo 2 (Construcción de fuerza base hasta el fallo)
  BEGINNER: {
    HANDSTAND: {
      level: 'BEGINNER',
      skillBranch: 'HANDSTAND',
      totalDuration: 45,
      description: 'Construcción de fuerza de hombros y acondicionamiento de muñecas para handstand',
      weeklyFrequency: 3,
      phases: [
        {
          phase: 'WARMUP',
          duration: 10,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'wrist-circles',
              sets: 3,
              reps: 10,
              restBetweenSets: 30,
              notes: 'Círculos de muñeca en ambas direcciones. OBLIGATORIO antes de entrenamiento de handstand.'
            },
            {
              exerciseId: 'shoulder-circles',
              sets: 2,
              reps: 10,
              restBetweenSets: 30,
              notes: 'Activación de hombros y movilidad'
            },
            {
              exerciseId: 'scapula-push-ups',
              sets: 2,
              reps: 10,
              restBetweenSets: 30,
              notes: 'Activación escapular - protracción y retracción'
            }
          ]
        },
        {
          phase: 'FUNDAMENTAL_STRENGTH',
          duration: 30,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'wall-handstand',
              sets: 4,
              holdTime: 20,
              restBetweenSets: 90,
              notes: 'Wall HS (espalda a la pared). Acumular tiempo bajo tensión. Mantener forma hollow body.'
            },
            {
              exerciseId: 'pike-push-ups',
              sets: 4,
              reps: 12,
              restBetweenSets: 90,
              notes: 'Construcción de fuerza de hombros. REPS HASTA EL FALLO.'
            },
            {
              exerciseId: 'plank-hold',
              sets: 3,
              holdTime: 30,
              restBetweenSets: 60,
              notes: 'Core y estabilidad de línea corporal'
            }
          ]
        },
        {
          phase: 'COOLDOWN',
          duration: 5,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'doorway-stretch',
              sets: 2,
              holdTime: 30,
              restBetweenSets: 30,
              notes: 'Estiramiento de pecho y hombros'
            },
            {
              exerciseId: 'wrist-stretch',
              sets: 2,
              holdTime: 30,
              restBetweenSets: 30,
              notes: 'Estiramiento de muñecas - palma arriba y palma abajo'
            }
          ]
        }
      ]
    },

    PLANCHE: {
      level: 'BEGINNER',
      skillBranch: 'PLANCHE',
      totalDuration: 50,
      description: 'Fundamentos de fuerza de empuje y acondicionamiento para planche',
      weeklyFrequency: 3,
      phases: [
        {
          phase: 'WARMUP',
          duration: 10,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'wrist-circles',
              sets: 3,
              reps: 10,
              restBetweenSets: 30,
              notes: 'OBLIGATORIO - Las muñecas son el punto más vulnerable en planche'
            },
            {
              exerciseId: 'wrist-push-ups',
              sets: 2,
              reps: 8,
              restBetweenSets: 45,
              notes: 'Fortalecimiento específico de muñecas'
            },
            {
              exerciseId: 'scapula-push-ups',
              sets: 3,
              reps: 10,
              restBetweenSets: 30,
              notes: 'Aprender protracción escapular (clave para planche)'
            }
          ]
        },
        {
          phase: 'FUNDAMENTAL_STRENGTH',
          duration: 35,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'frog-stand',
              sets: 5,
              holdTime: 20,
              restBetweenSets: 90,
              notes: 'Base del equilibrio sobre manos con brazos flexionados'
            },
            {
              exerciseId: 'push-ups',
              sets: 4,
              reps: 15,
              restBetweenSets: 90,
              notes: 'Construcción de fuerza base. REPS HASTA EL FALLO. Mantener protracción en top.'
            },
            {
              exerciseId: 'parallel-bar-dips',
              sets: 4,
              reps: 10,
              restBetweenSets: 120,
              notes: 'Si no puedes hacer dips completos, usa negativas o asistidos'
            },
            {
              exerciseId: 'plank-hold',
              sets: 3,
              holdTime: 40,
              restBetweenSets: 60,
              notes: 'Hollow body plank - compresión anterior'
            }
          ]
        },
        {
          phase: 'COOLDOWN',
          duration: 5,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'shoulder-stretch',
              sets: 2,
              holdTime: 30,
              restBetweenSets: 30,
              notes: 'Estiramiento de hombros'
            }
          ]
        }
      ]
    },

    PULL_UPS: {
      level: 'BEGINNER',
      skillBranch: 'PULL_UPS',
      totalDuration: 40,
      description: 'Construcción de fuerza de tracción base',
      weeklyFrequency: 3,
      phases: [
        {
          phase: 'WARMUP',
          duration: 8,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'arm-circles',
              sets: 2,
              reps: 10,
              restBetweenSets: 30,
              notes: 'Movilidad de hombros'
            },
            {
              exerciseId: 'scapula-pull-ups',
              sets: 3,
              reps: 10,
              restBetweenSets: 30,
              notes: 'Activación de dorsales y depresión escapular'
            }
          ]
        },
        {
          phase: 'FUNDAMENTAL_STRENGTH',
          duration: 27,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'negative-pull-ups',
              sets: 5,
              reps: 5,
              restBetweenSets: 120,
              notes: 'Fase excéntrica (bajar lento en 5 segundos). MÉTODO CLAVE PARA PRINCIPIANTES.'
            },
            {
              exerciseId: 'assisted-pull-ups',
              sets: 4,
              reps: 8,
              restBetweenSets: 90,
              notes: 'Con banda o pies asistidos. REPS HASTA EL FALLO.'
            },
            {
              exerciseId: 'aussie-pull-ups',
              sets: 4,
              reps: 12,
              restBetweenSets: 90,
              notes: 'Remo horizontal - construcción de fuerza de espalda'
            }
          ]
        },
        {
          phase: 'COOLDOWN',
          duration: 5,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'dead-hang',
              sets: 2,
              holdTime: 30,
              restBetweenSets: 60,
              notes: 'Acondicionamiento de tendones y agarre'
            }
          ]
        }
      ]
    }
  },

  // ===== NIVEL INTERMEDIATE =====
  // Filosofía: Continuar Modo 2, aumentar volumen, introducir más complejidad
  INTERMEDIATE: {
    PLANCHE: {
      level: 'INTERMEDIATE',
      skillBranch: 'PLANCHE',
      totalDuration: 55,
      description: 'Primeras progresiones de planche + construcción de fuerza específica',
      weeklyFrequency: 3,
      phases: [
        {
          phase: 'WARMUP',
          duration: 12,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'wrist-mobility-sequence',
              sets: 1,
              reps: 1,
              restBetweenSets: 0,
              notes: 'Secuencia completa: círculos, inclinaciones, elevaciones, palm/finger push-ups'
            },
            {
              exerciseId: 'scapula-push-ups',
              sets: 3,
              reps: 12,
              restBetweenSets: 30,
              notes: 'Enfocarse en máxima protracción'
            }
          ]
        },
        {
          phase: 'SKILL_PRACTICE',
          duration: 15,
          mode: 'MODE_1_SKILL',
          exercises: [
            {
              exerciseId: 'planche-lean',
              sets: 5,
              holdTime: 15,
              restBetweenSets: 90,
              notes: 'Inclinación de planche. Introducir el patrón motor. NO IR AL FALLO.'
            },
            {
              exerciseId: 'tuck-planche',
              sets: 5,
              holdTime: 10,
              restBetweenSets: 120,
              notes: 'Primera posición donde los pies dejan el suelo. Mantener margen (buffer).'
            }
          ]
        },
        {
          phase: 'SUPPORT_STRENGTH',
          duration: 18,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'pseudo-planche-push-ups',
              sets: 4,
              reps: 10,
              restBetweenSets: 120,
              notes: 'Constructor de fuerza más específico para planche. Inclinar torso adelante.'
            },
            {
              exerciseId: 'diamond-push-ups',
              sets: 3,
              reps: 15,
              restBetweenSets: 90,
              notes: 'Construcción de fuerza de tríceps'
            }
          ]
        },
        {
          phase: 'FUNDAMENTAL_STRENGTH',
          duration: 10,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'parallel-bar-dips',
              sets: 3,
              reps: 12,
              restBetweenSets: 90,
              notes: 'Mantener depresión escapular'
            }
          ]
        }
      ]
    },

    FRONT_LEVER: {
      level: 'INTERMEDIATE',
      skillBranch: 'FRONT_LEVER',
      totalDuration: 50,
      description: 'Progresiones de front lever + fuerza de dorsal',
      weeklyFrequency: 3,
      phases: [
        {
          phase: 'WARMUP',
          duration: 10,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'shoulder-mobility',
              sets: 2,
              reps: 10,
              restBetweenSets: 30,
              notes: 'Rotaciones y círculos'
            },
            {
              exerciseId: 'scapula-pull-ups',
              sets: 3,
              reps: 10,
              restBetweenSets: 30,
              notes: 'Activación de dorsales'
            }
          ]
        },
        {
          phase: 'SKILL_PRACTICE',
          duration: 15,
          mode: 'MODE_1_SKILL',
          exercises: [
            {
              exerciseId: 'tuck-front-lever',
              sets: 5,
              holdTime: 15,
              restBetweenSets: 120,
              notes: 'Mantener espalda plana, evitar redondeo. NO al fallo.'
            },
            {
              exerciseId: 'skill_front_lever_adv_tuck',
              sets: 4,
              holdTime: 8,
              restBetweenSets: 120,
              notes: 'Progresión con muslos a 90 grados del torso'
            }
          ]
        },
        {
          phase: 'SUPPORT_STRENGTH',
          duration: 15,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'front-lever-raises',
              sets: 4,
              reps: 8,
              restBetweenSets: 120,
              notes: 'Dinámico - desde dead hang a tuck lever'
            },
            {
              exerciseId: 'dragon-flag-progression',
              sets: 3,
              reps: 5,
              restBetweenSets: 120,
              notes: 'Core anti-extensión necesario para FL'
            }
          ]
        },
        {
          phase: 'FUNDAMENTAL_STRENGTH',
          duration: 10,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'pull-ups',
              sets: 3,
              reps: 10,
              restBetweenSets: 90,
              notes: 'Construcción de fuerza base de tracción'
            }
          ]
        }
      ]
    }
  },

  // ===== NIVEL ADVANCED =====
  // Filosofía: Bifurcación del entrenamiento - Skills (Modo 1) + Weighted (Modo 2)
  ADVANCED: {
    PLANCHE: {
      level: 'ADVANCED',
      skillBranch: 'PLANCHE',
      totalDuration: 70,
      description: 'Progresiones avanzadas de planche + entrenamiento con lastre',
      weeklyFrequency: 4,
      phases: [
        {
          phase: 'WARMUP',
          duration: 15,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'comprehensive-wrist-prep',
              sets: 1,
              reps: 1,
              restBetweenSets: 0,
              notes: 'Protocolo completo de muñecas (10-15 min) - NO NEGOCIABLE'
            }
          ]
        },
        {
          phase: 'SKILL_PRACTICE',
          duration: 25,
          mode: 'MODE_1_SKILL',
          exercises: [
            {
              exerciseId: 'skill_planche_adv_tuck',
              sets: 6,
              holdTime: 12,
              restBetweenSets: 150,
              notes: 'Advanced tuck - espalda plana, rodillas alejadas. MANTENER BUFFER (2-3 reps en reserva).'
            },
            {
              exerciseId: 'straddle-planche',
              sets: 5,
              holdTime: 6,
              restBetweenSets: 180,
              notes: 'Piernas en straddle. Práctica de calidad, no cantidad.'
            }
          ]
        },
        {
          phase: 'SUPPORT_STRENGTH',
          duration: 15,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'tuck-planche-push-ups',
              sets: 4,
              reps: 8,
              restBetweenSets: 150,
              notes: 'Dinámico - mantener posición tuck durante push-ups'
            },
            {
              exerciseId: 'pseudo-planche-push-ups',
              sets: 3,
              reps: 12,
              restBetweenSets: 120,
              notes: 'Máxima inclinación adelante'
            }
          ]
        },
        {
          phase: 'FUNDAMENTAL_STRENGTH',
          duration: 15,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'weighted-dips',
              sets: 4,
              reps: 8,
              restBetweenSets: 150,
              notes: 'Con lastre (+20-30% peso corporal). CLAVE para desbloquear skills de élite.'
            },
            {
              exerciseId: 'handstand-push-ups',
              sets: 3,
              reps: 8,
              restBetweenSets: 120,
              notes: 'Fuerza general de hombro'
            }
          ]
        }
      ]
    },

    ONE_ARM_PULL_UP: {
      level: 'ADVANCED',
      skillBranch: 'ONE_ARM_PULL_UP',
      totalDuration: 65,
      description: 'Progresiones unilaterales + fuerza máxima con lastre',
      weeklyFrequency: 3,
      phases: [
        {
          phase: 'WARMUP',
          duration: 10,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'band-pull-aparts',
              sets: 3,
              reps: 15,
              restBetweenSets: 30,
              notes: 'Activación de retractores escapulares'
            },
            {
              exerciseId: 'scapula-pull-ups',
              sets: 3,
              reps: 12,
              restBetweenSets: 30,
              notes: 'Depresión escapular'
            }
          ]
        },
        {
          phase: 'SKILL_PRACTICE',
          duration: 25,
          mode: 'MODE_1_SKILL',
          exercises: [
            {
              exerciseId: 'archer-pull-ups',
              sets: 5,
              reps: 6,
              restBetweenSets: 150,
              notes: 'Por lado. Un brazo trabaja, otro asiste. BUFFER de 1-2 reps.'
            },
            {
              exerciseId: 'assisted-one-arm-pull-up',
              sets: 5,
              reps: 3,
              restBetweenSets: 180,
              notes: 'Con toalla o agarre de muñeca. Asistencia mínima.'
            },
            {
              exerciseId: 'one-arm-negatives',
              sets: 4,
              reps: 3,
              restBetweenSets: 180,
              notes: 'Bajar en 5-8 segundos controlado'
            }
          ]
        },
        {
          phase: 'SUPPORT_STRENGTH',
          duration: 10,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'typewriter-pull-ups',
              sets: 3,
              reps: 8,
              restBetweenSets: 120,
              notes: 'Deslizarse lado a lado en top'
            }
          ]
        },
        {
          phase: 'FUNDAMENTAL_STRENGTH',
          duration: 20,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'weighted-pull-ups',
              sets: 4,
              reps: 6,
              restBetweenSets: 180,
              notes: 'Con +25-35% peso corporal. EL SECRETO para desbloquear OAP.'
            },
            {
              exerciseId: 'one-arm-hangs',
              sets: 3,
              holdTime: 15,
              restBetweenSets: 120,
              notes: 'Acondicionamiento de tendones y grip unilateral'
            }
          ]
        }
      ]
    }
  },

  // ===== NIVEL ELITE =====
  // Filosofía: Especialización en habilidad + mantenimiento de fuerza máxima
  ELITE: {
    PLANCHE: {
      level: 'ELITE',
      skillBranch: 'PLANCHE',
      totalDuration: 75,
      description: 'Full planche y variaciones dinámicas',
      weeklyFrequency: 5,
      phases: [
        {
          phase: 'WARMUP',
          duration: 15,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'comprehensive-joint-prep',
              sets: 1,
              reps: 1,
              restBetweenSets: 0,
              notes: 'Muñecas + hombros + escapular - protocolo completo'
            }
          ]
        },
        {
          phase: 'SKILL_PRACTICE',
          duration: 30,
          mode: 'MODE_1_SKILL',
          exercises: [
            {
              exerciseId: 'straddle-planche',
              sets: 6,
              holdTime: 15,
              restBetweenSets: 180,
              notes: 'Perfeccionar forma. SIEMPRE mantener buffer de 3-5s.'
            },
            {
              exerciseId: 'full-planche',
              sets: 6,
              holdTime: 8,
              restBetweenSets: 240,
              notes: 'Meta final. Acumular tiempo bajo tensión con calidad.'
            },
            {
              exerciseId: 'planche-push-ups',
              sets: 4,
              reps: 3,
              restBetweenSets: 180,
              notes: 'Variación dinámica para desarrollo'
            }
          ]
        },
        {
          phase: 'SUPPORT_STRENGTH',
          duration: 15,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'planche-to-handstand',
              sets: 3,
              reps: 5,
              restBetweenSets: 180,
              notes: 'Transición dinámica entre skills'
            }
          ]
        },
        {
          phase: 'FUNDAMENTAL_STRENGTH',
          duration: 15,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'weighted-dips',
              sets: 3,
              reps: 6,
              restBetweenSets: 180,
              notes: 'Con +40-50% BW. Mantenimiento de fuerza máxima.'
            },
            {
              exerciseId: 'weighted-hspu',
              sets: 3,
              reps: 5,
              restBetweenSets: 150,
              notes: 'HSPU con lastre para fuerza vertical'
            }
          ]
        }
      ]
    },

    ONE_ARM_PULL_UP: {
      level: 'ELITE',
      skillBranch: 'ONE_ARM_PULL_UP',
      totalDuration: 60,
      description: 'OAP consistente y variaciones con lastre',
      weeklyFrequency: 3,
      phases: [
        {
          phase: 'WARMUP',
          duration: 10,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'pull-warmup-protocol',
              sets: 1,
              reps: 1,
              restBetweenSets: 0,
              notes: 'Protocolo de calentamiento para tracción'
            }
          ]
        },
        {
          phase: 'SKILL_PRACTICE',
          duration: 30,
          mode: 'MODE_1_SKILL',
          exercises: [
            {
              exerciseId: 'one-arm-pull-up',
              sets: 8,
              reps: 3,
              restBetweenSets: 240,
              notes: 'Por brazo. Máxima calidad técnica. BUFFER de 1 rep.'
            },
            {
              exerciseId: 'weighted-one-arm-pull-up',
              sets: 4,
              reps: 1,
              restBetweenSets: 300,
              notes: 'Con +5-10kg. Progresión más allá del OAP.'
            }
          ]
        },
        {
          phase: 'FUNDAMENTAL_STRENGTH',
          duration: 20,
          mode: 'MODE_2_STRENGTH',
          exercises: [
            {
              exerciseId: 'weighted-pull-ups',
              sets: 3,
              reps: 5,
              restBetweenSets: 180,
              notes: 'Con +40-50% BW. Mantenimiento de fuerza absoluta.'
            },
            {
              exerciseId: 'l-sit-pull-ups',
              sets: 3,
              reps: 8,
              restBetweenSets: 150,
              notes: 'Integración de core + tracción'
            }
          ]
        }
      ]
    }
  }
};

/**
 * Obtener rutina recomendada según nivel y skill branch
 */
export function getRecommendedRoutine(
  level: DifficultyLevel,
  skillBranch: MasteryGoal
): TrainingRoutine | null {
  const levelRoutines = TRAINING_ROUTINES[level];
  if (!levelRoutines) return null;

  return levelRoutines[skillBranch] || null;
}

/**
 * Calcular duración total de una rutina
 */
export function calculateTotalDuration(routine: TrainingRoutine): number {
  return routine.phases.reduce((total, phase) => total + phase.duration, 0);
}

/**
 * Obtener todas las rutinas disponibles para un nivel
 */
export function getRoutinesByLevel(level: DifficultyLevel): TrainingRoutine[] {
  const levelRoutines = TRAINING_ROUTINES[level];
  if (!levelRoutines) return [];

  return Object.values(levelRoutines).filter((r): r is TrainingRoutine => r !== undefined);
}

/**
 * Validar que una rutina sea apropiada para el nivel del usuario
 */
export function isRoutineAppropriate(
  routine: TrainingRoutine,
  userLevel: DifficultyLevel
): boolean {
  const levelOrder: DifficultyLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'];
  const routineLevelIndex = levelOrder.indexOf(routine.level);
  const userLevelIndex = levelOrder.indexOf(userLevel);

  // Usuario puede hacer rutinas de su nivel o inferiores, pero no superiores
  return userLevelIndex >= routineLevelIndex;
}
