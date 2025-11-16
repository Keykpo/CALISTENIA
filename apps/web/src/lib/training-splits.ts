/**
 * ============================================================================
 * TRAINING SPLITS SYSTEM
 * ============================================================================
 *
 * Provides flexible weekly training splits adapted from RUTINAS_POR_NIVEL.
 *
 * OPTIONS:
 * - 3-Day: Full body, best for beginners (D-levels)
 * - 4-Day: Upper/Lower split, good for novice (C-levels)
 * - 5-Day: Push/Pull/Legs + Skills, intermediate (B-levels)
 * - 6-Day: Specialization split, advanced (A/S-levels)
 *
 * Based on: RUTINAS_POR_NIVEL split recommendations
 * ============================================================================
 */

import type { SubLevel } from './sublevel-system';
import type { SessionType } from './routine-generator-v3';

// ==========================================
// TYPES
// ==========================================

export type SplitOption = '3_DAY' | '4_DAY' | '5_DAY' | '6_DAY';

export interface DaySchedule {
  dayOfWeek: number; // 1-7 (Monday-Sunday)
  dayName: string;
  sessionType: SessionType | 'REST';
  sessionName: string;
  description?: string;
}

export interface TrainingSplit {
  id: SplitOption;
  name: string;
  daysPerWeek: number;
  restDays: number;
  schedule: DaySchedule[];
  bestFor: SubLevel[];
  description: string;
  benefits: string[];
  considerations: string[];
}

// ==========================================
// SPLIT DEFINITIONS
// ==========================================

export const TRAINING_SPLITS: Record<SplitOption, TrainingSplit> = {
  /**
   * 3-DAY SPLIT: Full Body
   * Best for: Beginners (D-levels)
   * Focus: Learning movements, building base
   */
  '3_DAY': {
    id: '3_DAY',
    name: 'Full Body 3 días/semana',
    daysPerWeek: 3,
    restDays: 4,
    schedule: [
      {
        dayOfWeek: 1,
        dayName: 'Lunes',
        sessionType: 'FULL_BODY',
        sessionName: 'Día A - Push Focus',
        description: 'Full body con énfasis en empuje',
      },
      {
        dayOfWeek: 2,
        dayName: 'Martes',
        sessionType: 'REST',
        sessionName: 'Descanso',
      },
      {
        dayOfWeek: 3,
        dayName: 'Miércoles',
        sessionType: 'FULL_BODY',
        sessionName: 'Día B - Pull Focus',
        description: 'Full body con énfasis en tracción',
      },
      {
        dayOfWeek: 4,
        dayName: 'Jueves',
        sessionType: 'REST',
        sessionName: 'Descanso',
      },
      {
        dayOfWeek: 5,
        dayName: 'Viernes',
        sessionType: 'FULL_BODY',
        sessionName: 'Día C - Legs + Skills',
        description: 'Piernas y práctica de habilidades',
      },
      {
        dayOfWeek: 6,
        dayName: 'Sábado',
        sessionType: 'REST',
        sessionName: 'Descanso',
      },
      {
        dayOfWeek: 7,
        dayName: 'Domingo',
        sessionType: 'REST',
        sessionName: 'Descanso',
      },
    ],
    bestFor: ['D_MINUS', 'D', 'D_PLUS'],
    description:
      'Split de cuerpo completo 3 días por semana. Ideal para principiantes que están aprendiendo los movimientos fundamentales.',
    benefits: [
      '✅ Máxima recuperación entre sesiones',
      '✅ Práctica frecuente de movimientos básicos',
      '✅ Bajo riesgo de sobreentrenamiento',
      '✅ Perfecto para aprender técnica',
    ],
    considerations: [
      '⚠️ Volumen limitado por sesión',
      '⚠️ No ideal para avanzados',
    ],
  },

  /**
   * 4-DAY SPLIT: Upper/Lower
   * Best for: Novice (C-levels)
   * Focus: Increased volume, better recovery
   */
  '4_DAY': {
    id: '4_DAY',
    name: 'Upper/Lower 4 días/semana',
    daysPerWeek: 4,
    restDays: 3,
    schedule: [
      {
        dayOfWeek: 1,
        dayName: 'Lunes',
        sessionType: 'PUSH',
        sessionName: 'Upper A - Push',
        description: 'Tren superior - Empuje',
      },
      {
        dayOfWeek: 2,
        dayName: 'Martes',
        sessionType: 'LEGS',
        sessionName: 'Lower A - Legs',
        description: 'Tren inferior - Piernas',
      },
      {
        dayOfWeek: 3,
        dayName: 'Miércoles',
        sessionType: 'REST',
        sessionName: 'Descanso',
      },
      {
        dayOfWeek: 4,
        dayName: 'Jueves',
        sessionType: 'PULL',
        sessionName: 'Upper B - Pull',
        description: 'Tren superior - Tracción',
      },
      {
        dayOfWeek: 5,
        dayName: 'Viernes',
        sessionType: 'FULL_BODY',
        sessionName: 'Skills + Core',
        description: 'Habilidades y core',
      },
      {
        dayOfWeek: 6,
        dayName: 'Sábado',
        sessionType: 'REST',
        sessionName: 'Descanso',
      },
      {
        dayOfWeek: 7,
        dayName: 'Domingo',
        sessionType: 'REST',
        sessionName: 'Descanso',
      },
    ],
    bestFor: ['C_MINUS', 'C', 'C_PLUS'],
    description:
      'Split upper/lower 4 días por semana. Permite mayor volumen por grupo muscular con buena recuperación.',
    benefits: [
      '✅ Más volumen que 3-day split',
      '✅ Buena separación Push/Pull',
      '✅ Recuperación adecuada',
      '✅ Introducción a splits más avanzados',
    ],
    considerations: [
      '⚠️ Requiere 4 días de compromiso semanal',
      '⚠️ Puede ser intenso para principiantes',
    ],
  },

  /**
   * 5-DAY SPLIT: Push/Pull/Legs + Skills
   * Best for: Intermediate (B-levels)
   * Focus: Weighted work, skill introduction
   */
  '5_DAY': {
    id: '5_DAY',
    name: 'Push/Pull/Legs 5 días/semana',
    daysPerWeek: 5,
    restDays: 2,
    schedule: [
      {
        dayOfWeek: 1,
        dayName: 'Lunes',
        sessionType: 'PUSH',
        sessionName: 'Weighted Push',
        description: 'Empuje con peso',
      },
      {
        dayOfWeek: 2,
        dayName: 'Martes',
        sessionType: 'PULL',
        sessionName: 'Weighted Pull',
        description: 'Tracción con peso',
      },
      {
        dayOfWeek: 3,
        dayName: 'Miércoles',
        sessionType: 'REST',
        sessionName: 'Descanso',
      },
      {
        dayOfWeek: 4,
        dayName: 'Jueves',
        sessionType: 'LEGS',
        sessionName: 'Legs + Core',
        description: 'Piernas y core intenso',
      },
      {
        dayOfWeek: 5,
        dayName: 'Viernes',
        sessionType: 'SKILLS_PUSH',
        sessionName: 'Skills Push',
        description: 'Habilidades de empuje (planche, HSPU)',
      },
      {
        dayOfWeek: 6,
        dayName: 'Sábado',
        sessionType: 'SKILLS_PULL',
        sessionName: 'Skills Pull',
        description: 'Habilidades de tracción (front lever, OAP)',
      },
      {
        dayOfWeek: 7,
        dayName: 'Domingo',
        sessionType: 'REST',
        sessionName: 'Descanso',
      },
    ],
    bestFor: ['B_MINUS', 'B', 'B_PLUS'],
    description:
      'Split PPL 5 días con introducción a trabajo con peso y habilidades. Para intermedios con buena base.',
    benefits: [
      '✅ Alto volumen de entrenamiento',
      '✅ Trabajo con peso específico',
      '✅ Introducción a habilidades avanzadas',
      '✅ Separación óptima de grupos musculares',
    ],
    considerations: [
      '⚠️ Alta demanda de tiempo (5 días/semana)',
      '⚠️ Requiere buena capacidad de recuperación',
      '⚠️ No recomendado sin base sólida',
    ],
  },

  /**
   * 6-DAY SPLIT: Specialization
   * Best for: Advanced/Expert (A/S-levels)
   * Focus: Bifurcated training (Mode 1 + Mode 2)
   */
  '6_DAY': {
    id: '6_DAY',
    name: 'Especialización 6 días/semana',
    daysPerWeek: 6,
    restDays: 1,
    schedule: [
      {
        dayOfWeek: 1,
        dayName: 'Lunes',
        sessionType: 'PUSH',
        sessionName: 'Max Strength Push',
        description: 'Fuerza máxima - Empuje pesado',
      },
      {
        dayOfWeek: 2,
        dayName: 'Martes',
        sessionType: 'PULL',
        sessionName: 'Max Strength Pull',
        description: 'Fuerza máxima - Tracción pesada',
      },
      {
        dayOfWeek: 3,
        dayName: 'Miércoles',
        sessionType: 'SKILLS_PUSH',
        sessionName: 'Planche Specialization',
        description: 'Especialización en planche (Mode 1)',
      },
      {
        dayOfWeek: 4,
        dayName: 'Jueves',
        sessionType: 'REST',
        sessionName: 'Descanso Activo',
        description: 'Movilidad y recuperación',
      },
      {
        dayOfWeek: 5,
        dayName: 'Viernes',
        sessionType: 'SKILLS_PULL',
        sessionName: 'Front Lever Specialization',
        description: 'Especialización en front lever (Mode 1)',
      },
      {
        dayOfWeek: 6,
        dayName: 'Sábado',
        sessionType: 'FULL_BODY',
        sessionName: 'Volume + Muscle-up',
        description: 'Volumen y dinámicos',
      },
      {
        dayOfWeek: 7,
        dayName: 'Domingo',
        sessionType: 'LEGS',
        sessionName: 'Legs + Power',
        description: 'Piernas y potencia',
      },
    ],
    bestFor: ['A_MINUS', 'A', 'A_PLUS', 'S_MINUS', 'S', 'S_PLUS'],
    description:
      'Split de especialización 6 días. Bifurcación Mode 1 (skills) y Mode 2 (fuerza máxima). Para atletas avanzados.',
    benefits: [
      '✅ Máximo volumen de entrenamiento',
      '✅ Especialización en habilidades avanzadas',
      '✅ Entrenamiento bifurcado óptimo',
      '✅ Progreso máximo en fuerza y skills',
    ],
    considerations: [
      '⚠️ Requiere excelente capacidad de recuperación',
      '⚠️ Alto riesgo de sobreentrenamiento si no se gestiona bien',
      '⚠️ Solo para atletas avanzados (A/S levels)',
      '⚠️ Necesita nutrición y sueño óptimos',
    ],
  },
};

// ==========================================
// SPLIT SELECTION
// ==========================================

/**
 * Get recommended split based on user's sublevel
 */
export function getRecommendedSplit(subLevel: SubLevel): SplitOption {
  const splitInfo = Object.values(TRAINING_SPLITS).find((split) =>
    split.bestFor.includes(subLevel)
  );

  return splitInfo?.id || '3_DAY';
}

/**
 * Check if user can handle a specific split
 */
export function canHandleSplit(subLevel: SubLevel, splitOption: SplitOption): {
  canHandle: boolean;
  reason: string;
} {
  const split = TRAINING_SPLITS[splitOption];
  const subLevelRanks = {
    D_MINUS: 1,
    D: 2,
    D_PLUS: 3,
    C_MINUS: 4,
    C: 5,
    C_PLUS: 6,
    B_MINUS: 7,
    B: 8,
    B_PLUS: 9,
    A_MINUS: 10,
    A: 11,
    A_PLUS: 12,
    S_MINUS: 13,
    S: 14,
    S_PLUS: 15,
  };

  const userRank = subLevelRanks[subLevel];
  const minRequiredRank = Math.min(...split.bestFor.map((sl) => subLevelRanks[sl]));

  if (userRank >= minRequiredRank) {
    return {
      canHandle: true,
      reason: '✅ Tu nivel es adecuado para este split',
    };
  }

  if (userRank < minRequiredRank - 3) {
    return {
      canHandle: false,
      reason: '❌ Este split es demasiado avanzado. Construye más base primero.',
    };
  }

  return {
    canHandle: true,
    reason: '⚠️ Puedes intentarlo, pero monitorea tu recuperación cuidadosamente.',
  };
}

/**
 * Get all available splits for user's level
 */
export function getAvailableSplits(subLevel: SubLevel): {
  recommended: TrainingSplit;
  alternatives: TrainingSplit[];
  tooAdvanced: TrainingSplit[];
} {
  const recommended = TRAINING_SPLITS[getRecommendedSplit(subLevel)];
  const allSplits = Object.values(TRAINING_SPLITS);

  const alternatives: TrainingSplit[] = [];
  const tooAdvanced: TrainingSplit[] = [];

  allSplits.forEach((split) => {
    const canHandle = canHandleSplit(subLevel, split.id);

    if (split.id === recommended.id) {
      // Skip recommended
      return;
    }

    if (canHandle.canHandle) {
      alternatives.push(split);
    } else {
      tooAdvanced.push(split);
    }
  });

  return {
    recommended,
    alternatives,
    tooAdvanced,
  };
}

// ==========================================
// SCHEDULE HELPERS
// ==========================================

/**
 * Get schedule for a specific day of week
 */
export function getScheduleForDay(
  splitOption: SplitOption,
  dayOfWeek: number
): DaySchedule | null {
  const split = TRAINING_SPLITS[splitOption];
  return split.schedule.find((s) => s.dayOfWeek === dayOfWeek) || null;
}

/**
 * Get all training days (non-rest) from schedule
 */
export function getTrainingDays(splitOption: SplitOption): DaySchedule[] {
  const split = TRAINING_SPLITS[splitOption];
  return split.schedule.filter((day) => day.sessionType !== 'REST');
}

/**
 * Get all rest days from schedule
 */
export function getRestDays(splitOption: SplitOption): DaySchedule[] {
  const split = TRAINING_SPLITS[splitOption];
  return split.schedule.filter((day) => day.sessionType === 'REST');
}

/**
 * Get next training day from today
 */
export function getNextTrainingDay(
  splitOption: SplitOption,
  currentDayOfWeek: number
): DaySchedule | null {
  const split = TRAINING_SPLITS[splitOption];
  const trainingDays = getTrainingDays(splitOption);

  // Find next training day after current day
  let nextDay = trainingDays.find((day) => day.dayOfWeek > currentDayOfWeek);

  // If no training day found after current day, wrap to start of week
  if (!nextDay) {
    nextDay = trainingDays[0];
  }

  return nextDay || null;
}

// ==========================================
// DISPLAY HELPERS
// ==========================================

/**
 * Get user-friendly split description
 */
export function getSplitDescription(splitOption: SplitOption): string {
  const split = TRAINING_SPLITS[splitOption];
  return `${split.name} - ${split.daysPerWeek} días de entrenamiento, ${split.restDays} días de descanso`;
}

/**
 * Get split emoji based on intensity
 */
export function getSplitEmoji(splitOption: SplitOption): string {
  const emojiMap: Record<SplitOption, string> = {
    '3_DAY': '🌱',
    '4_DAY': '💪',
    '5_DAY': '🔥',
    '6_DAY': '🏆',
  };

  return emojiMap[splitOption];
}

/**
 * Get weekly calendar view
 */
export function getWeeklyCalendar(splitOption: SplitOption): string {
  const split = TRAINING_SPLITS[splitOption];
  const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return split.schedule
    .map((day, idx) => {
      const initial = dayNames[idx];
      const icon = day.sessionType === 'REST' ? '💤' : '💪';
      return `${initial}${icon}`;
    })
    .join(' ');
}
