/**
 * Cooldown Protocols
 * Imported from RUTINAS_POR_NIVEL/CALENTAMIENTOS/PROTOCOLOS_CALENTAMIENTO.md
 *
 * El enfriamiento es tan importante como el calentamiento para:
 * - Reducir tensión muscular
 * - Prevenir rigidez post-entrenamiento
 * - Facilitar recuperación
 * - Transición del estado de entrenamiento
 *
 * Duración: 5-10 minutos al final de CADA sesión
 */

import type { CooldownProtocol, SessionType } from '@/types/warmup';

// ============================================================================
// STANDARD COOLDOWN (All sessions)
// ============================================================================

export const STANDARD_COOLDOWN: CooldownProtocol = {
  id: 'standard-cooldown',
  name: 'Enfriamiento Estándar',
  totalDuration: 10, // minutes
  phases: [
    {
      name: 'Estiramientos Estáticos',
      duration: 5, // minutes
      exercises: [
        {
          name: 'Estiramiento de Pecho',
          duration: 45, // seconds each side
          instructions: [
            'Brazo en marco de puerta o pared a 90°',
            'Rotar cuerpo hacia afuera',
            'Sentir estiramiento en pecho',
            'Mantener 45 segundos cada lado',
          ],
          targetMuscles: ['Pecho', 'Deltoides anterior'],
        },
        {
          name: 'Estiramiento de Hombros',
          duration: 45, // seconds each side
          instructions: [
            'Brazo cruzado sobre el cuerpo',
            'Presionar con otro brazo hacia el pecho',
            'Sentir estiramiento en hombro',
            'Mantener 45 segundos cada lado',
          ],
          targetMuscles: ['Deltoides', 'Manguito rotador'],
        },
        {
          name: 'Estiramiento de Tríceps',
          duration: 30, // seconds each arm
          instructions: [
            'Brazo arriba y doblado hacia atrás',
            'Empujar codo con otra mano',
            'Sentir estiramiento en tríceps',
            '30 segundos cada brazo',
          ],
          targetMuscles: ['Tríceps'],
        },
        {
          name: 'Estiramiento de Bíceps',
          duration: 30, // seconds each arm
          instructions: [
            'Brazo extendido hacia atrás con palma hacia arriba',
            'Apoyar en pared o puerta',
            'Rotar cuerpo hacia afuera',
            '30 segundos cada brazo',
          ],
          targetMuscles: ['Bíceps'],
        },
        {
          name: "Estiramiento de Espalda - Child's Pose",
          duration: 60,
          instructions: [
            'Arrodillado, sentarse sobre talones',
            'Extender brazos hacia adelante',
            'Frente al suelo',
            'Relajar completamente',
            'Respiración profunda',
          ],
          targetMuscles: ['Dorsales', 'Espalda baja', 'Hombros'],
        },
      ],
    },
    {
      name: 'Respiración y Relajación',
      duration: 3, // minutes
      exercises: [
        {
          name: 'Respiración Profunda',
          duration: 180,
          instructions: [
            'Acostado boca arriba o sentado cómodamente',
            'Inhalar profundamente por nariz (4 segundos)',
            'Exhalar completamente por boca (6 segundos)',
            'Relajar todos los músculos',
            'Mindfulness: enfocar en la respiración',
          ],
          targetMuscles: ['Diafragma'],
        },
      ],
    },
  ],
};

// ============================================================================
// PUSH SESSION COOLDOWN
// ============================================================================

export const PUSH_COOLDOWN: CooldownProtocol = {
  id: 'push-cooldown',
  name: 'Enfriamiento para Sesión de Push',
  totalDuration: 10,
  specificTo: 'PUSH',
  phases: [
    {
      name: 'Estiramientos Específicos de Push',
      duration: 6,
      exercises: [
        {
          name: 'Estiramiento de Pecho (Énfasis)',
          duration: 60, // seconds each side
          instructions: [
            'Brazo en marco de puerta',
            'Variar ángulo: arriba, medio, abajo',
            'Rotar cuerpo',
            '60 segundos cada lado',
          ],
          targetMuscles: ['Pecho', 'Deltoides anterior'],
        },
        {
          name: 'Estiramiento de Tríceps Profundo',
          duration: 45, // seconds each arm
          instructions: [
            'Brazo arriba y doblado',
            'Empujar codo suavemente',
            'Inclinarse ligeramente hacia el lado',
            '45 segundos cada brazo',
          ],
          targetMuscles: ['Tríceps'],
        },
        {
          name: 'Estiramiento de Muñecas',
          duration: 30,
          instructions: [
            'Manos en el suelo, palmas hacia abajo',
            'Dedos hacia ti',
            'Inclinarse hacia atrás suavemente',
            'Sentir estiramiento en muñecas y antebrazos',
          ],
          targetMuscles: ['Antebrazos', 'Muñecas'],
        },
        {
          name: 'Estiramiento de Hombros',
          duration: 45, // seconds each side
          instructions: [
            'Brazo cruzado',
            'Presionar hacia el pecho',
            '45 segundos cada lado',
          ],
          targetMuscles: ['Deltoides', 'Manguito rotador'],
        },
        {
          name: "Child's Pose",
          duration: 60,
          instructions: [
            'Arrodillado',
            'Brazos extendidos hacia adelante',
            'Relajar completamente',
          ],
          targetMuscles: ['Dorsales', 'Hombros', 'Espalda'],
        },
      ],
    },
    {
      name: 'Relajación',
      duration: 4,
      exercises: [
        {
          name: 'Respiración Profunda',
          duration: 240,
          instructions: [
            'Acostado boca arriba',
            'Inhalar 4 segundos, exhalar 6 segundos',
            'Relajar pecho, hombros, brazos',
          ],
          targetMuscles: ['Diafragma'],
        },
      ],
    },
  ],
};

// ============================================================================
// PULL SESSION COOLDOWN
// ============================================================================

export const PULL_COOLDOWN: CooldownProtocol = {
  id: 'pull-cooldown',
  name: 'Enfriamiento para Sesión de Pull',
  totalDuration: 10,
  specificTo: 'PULL',
  phases: [
    {
      name: 'Estiramientos Específicos de Pull',
      duration: 6,
      exercises: [
        {
          name: 'Estiramiento de Dorsales',
          duration: 60, // seconds each side
          instructions: [
            'Agarrar con una mano algo fijo (barra, poste)',
            'Sentarse hacia atrás, brazo extendido',
            'Sentir estiramiento en dorsal',
            '60 segundos cada lado',
          ],
          targetMuscles: ['Dorsales'],
        },
        {
          name: 'Estiramiento de Bíceps',
          duration: 45, // seconds each arm
          instructions: [
            'Brazo extendido hacia atrás, palma arriba',
            'Apoyar en pared',
            'Rotar cuerpo hacia afuera',
            '45 segundos cada brazo',
          ],
          targetMuscles: ['Bíceps'],
        },
        {
          name: 'Estiramiento de Hombros Posterior',
          duration: 45, // seconds each side
          instructions: [
            'Brazo cruzado sobre el cuerpo',
            'Presionar con otro brazo',
            'Enfoque en hombro posterior',
            '45 segundos cada lado',
          ],
          targetMuscles: ['Deltoides posterior', 'Manguito rotador'],
        },
        {
          name: 'Estiramiento de Antebrazos',
          duration: 30, // seconds each side
          instructions: [
            'Brazo extendido hacia adelante',
            'Doblar muñeca hacia abajo',
            'Empujar con otra mano',
            '30 segundos cada lado',
          ],
          targetMuscles: ['Antebrazos'],
        },
        {
          name: "Child's Pose con Énfasis Lateral",
          duration: 60,
          instructions: [
            'Child\'s pose',
            'Caminar manos hacia un lado',
            'Sentir estiramiento en dorsal opuesto',
            '30 segundos cada lado',
          ],
          targetMuscles: ['Dorsales', 'Oblicuos'],
        },
      ],
    },
    {
      name: 'Relajación',
      duration: 4,
      exercises: [
        {
          name: 'Respiración Profunda',
          duration: 240,
          instructions: [
            'Acostado boca arriba',
            'Inhalar 4 segundos, exhalar 6 segundos',
            'Relajar espalda, brazos, hombros',
          ],
          targetMuscles: ['Diafragma'],
        },
      ],
    },
  ],
};

// ============================================================================
// LEGS SESSION COOLDOWN
// ============================================================================

export const LEGS_COOLDOWN: CooldownProtocol = {
  id: 'legs-cooldown',
  name: 'Enfriamiento para Sesión de Piernas',
  totalDuration: 12,
  specificTo: 'LEGS',
  phases: [
    {
      name: 'Estiramientos Específicos de Piernas',
      duration: 8,
      exercises: [
        {
          name: 'Estiramiento de Cuádriceps',
          duration: 45, // seconds each leg
          instructions: [
            'De pie, agarrar tobillo',
            'Llevar talón hacia glúteo',
            'Mantener rodillas juntas',
            '45 segundos cada pierna',
          ],
          targetMuscles: ['Cuádriceps'],
        },
        {
          name: 'Estiramiento de Isquiotibiales',
          duration: 60, // seconds each leg
          instructions: [
            'Sentado, una pierna extendida',
            'Inclinarse hacia adelante',
            'Mantener espalda recta',
            '60 segundos cada pierna',
          ],
          targetMuscles: ['Isquiotibiales'],
        },
        {
          name: 'Estiramiento de Glúteos',
          duration: 45, // seconds each side
          instructions: [
            'Acostado boca arriba',
            'Rodilla hacia pecho opuesto',
            'Presionar con manos',
            '45 segundos cada lado',
          ],
          targetMuscles: ['Glúteos'],
        },
        {
          name: 'Estiramiento de Aductores',
          duration: 60,
          instructions: [
            'Sentado, plantas de pies juntas',
            'Rodillas hacia afuera',
            'Presionar suavemente con codos',
            'Inclinarse hacia adelante',
          ],
          targetMuscles: ['Aductores'],
        },
        {
          name: 'Estiramiento de Pantorrillas',
          duration: 45, // seconds each leg
          instructions: [
            'Posición de lunge',
            'Pierna trasera recta, talón en suelo',
            'Empujar cadera hacia adelante',
            '45 segundos cada pierna',
          ],
          targetMuscles: ['Pantorrillas', 'Sóleo'],
        },
        {
          name: 'Estiramiento de Psoas',
          duration: 45, // seconds each side
          instructions: [
            'Posición de lunge profunda',
            'Rodilla trasera en suelo',
            'Empujar cadera hacia adelante',
            '45 segundos cada lado',
          ],
          targetMuscles: ['Psoas', 'Flexores de cadera'],
        },
      ],
    },
    {
      name: 'Relajación',
      duration: 4,
      exercises: [
        {
          name: 'Respiración Profunda',
          duration: 240,
          instructions: [
            'Acostado boca arriba',
            'Piernas extendidas o dobladas cómodamente',
            'Inhalar 4 segundos, exhalar 6 segundos',
            'Relajar todas las piernas',
          ],
          targetMuscles: ['Diafragma'],
        },
      ],
    },
  ],
};

// ============================================================================
// SKILLS SESSION COOLDOWN
// ============================================================================

export const SKILLS_COOLDOWN: CooldownProtocol = {
  id: 'skills-cooldown',
  name: 'Enfriamiento para Sesión de Skills',
  totalDuration: 10,
  specificTo: 'SKILLS',
  phases: [
    {
      name: 'Estiramientos para Skills',
      duration: 6,
      exercises: [
        {
          name: 'Estiramiento de Muñecas (Obligatorio)',
          duration: 60,
          instructions: [
            'Manos en el suelo, palmas hacia abajo',
            'Dedos hacia ti',
            'Inclinarse hacia atrás',
            'Relajar muñecas después de trabajo intenso',
          ],
          targetMuscles: ['Muñecas', 'Antebrazos'],
        },
        {
          name: 'Estiramiento de Hombros 360°',
          duration: 60, // 20 seconds each position
          instructions: [
            'Estiramiento frontal: 20s',
            'Estiramiento lateral: 20s cada lado',
            'Estiramiento posterior: 20s',
            'Cobertura completa de hombros',
          ],
          targetMuscles: ['Deltoides', 'Manguito rotador'],
        },
        {
          name: 'Estiramiento de Pecho y Dorsales',
          duration: 90, // 45s each
          instructions: [
            'Pecho: Brazo en marco de puerta (45s cada lado)',
            'Dorsales: Agarrar barra y sentarse atrás (45s)',
            'Ambos grupos trabajados en skills',
          ],
          targetMuscles: ['Pecho', 'Dorsales'],
        },
        {
          name: "Child's Pose",
          duration: 60,
          instructions: [
            'Posición de descanso',
            'Relajar completamente',
            'Respiración profunda',
          ],
          targetMuscles: ['Espalda completa', 'Hombros'],
        },
      ],
    },
    {
      name: 'Relajación',
      duration: 4,
      exercises: [
        {
          name: 'Respiración y Visualización',
          duration: 240,
          instructions: [
            'Acostado boca arriba',
            'Respiración profunda',
            'Visualizar las skills logradas',
            'Transición mental del estado de práctica',
          ],
          targetMuscles: ['Diafragma'],
        },
      ],
    },
  ],
};

// ============================================================================
// FULL BODY COOLDOWN
// ============================================================================

export const FULL_BODY_COOLDOWN: CooldownProtocol = {
  id: 'full-body-cooldown',
  name: 'Enfriamiento Full Body',
  totalDuration: 12,
  specificTo: 'FULL_BODY',
  phases: [
    {
      name: 'Estiramientos Full Body',
      duration: 8,
      exercises: [
        {
          name: 'Estiramiento de Pecho',
          duration: 45, // seconds each side
          instructions: ['Brazo en marco de puerta', 'Rotar cuerpo', '45s cada lado'],
          targetMuscles: ['Pecho'],
        },
        {
          name: 'Estiramiento de Dorsales',
          duration: 45, // seconds each side
          instructions: [
            'Agarrar barra o poste',
            'Sentarse hacia atrás',
            '45s cada lado',
          ],
          targetMuscles: ['Dorsales'],
        },
        {
          name: 'Estiramiento de Hombros',
          duration: 30, // seconds each side
          instructions: ['Brazo cruzado', 'Presionar hacia pecho', '30s cada lado'],
          targetMuscles: ['Hombros'],
        },
        {
          name: 'Estiramiento de Tríceps',
          duration: 30, // seconds each arm
          instructions: ['Brazo arriba y doblado', 'Empujar codo', '30s cada brazo'],
          targetMuscles: ['Tríceps'],
        },
        {
          name: 'Estiramiento de Bíceps',
          duration: 30, // seconds each arm
          instructions: [
            'Brazo extendido atrás',
            'Palma arriba en pared',
            '30s cada brazo',
          ],
          targetMuscles: ['Bíceps'],
        },
        {
          name: 'Estiramiento de Cuádriceps',
          duration: 30, // seconds each leg
          instructions: ['Talón hacia glúteo', '30s cada pierna'],
          targetMuscles: ['Cuádriceps'],
        },
        {
          name: 'Estiramiento de Isquiotibiales',
          duration: 45, // seconds each leg
          instructions: ['Sentado, inclinarse hacia adelante', '45s cada pierna'],
          targetMuscles: ['Isquiotibiales'],
        },
        {
          name: "Child's Pose",
          duration: 60,
          instructions: ['Posición de descanso', 'Relajar completamente'],
          targetMuscles: ['Espalda', 'Hombros'],
        },
      ],
    },
    {
      name: 'Relajación Final',
      duration: 4,
      exercises: [
        {
          name: 'Respiración Profunda',
          duration: 240,
          instructions: [
            'Acostado boca arriba',
            'Respiración 4-6 (inhalar-exhalar)',
            'Relajación muscular progresiva',
            'Transición completa del estado de entrenamiento',
          ],
          targetMuscles: ['Diafragma'],
        },
      ],
    },
  ],
};

// ============================================================================
// OPTIONAL: FOAM ROLLING PROTOCOL
// ============================================================================

export const FOAM_ROLLING_PROTOCOL: CooldownProtocol = {
  id: 'foam-rolling',
  name: 'Foam Rolling (Opcional)',
  totalDuration: 10,
  phases: [
    {
      name: 'Foam Rolling',
      duration: 10,
      exercises: [
        {
          name: 'Foam Rolling Espalda Alta',
          duration: 120,
          instructions: [
            'Rodar foam roller en espalda alta',
            'Pausar en puntos tensos',
            'Respirar profundamente',
          ],
          targetMuscles: ['Trapecios', 'Romboides'],
        },
        {
          name: 'Foam Rolling Dorsales',
          duration: 120,
          instructions: [
            'Acostado de lado',
            'Rodar foam roller en dorsales',
            'Pausar en puntos tensos',
          ],
          targetMuscles: ['Dorsales'],
        },
        {
          name: 'Foam Rolling Piernas (si trabajaste)',
          duration: 360,
          instructions: [
            'Cuádriceps: 60s cada pierna',
            'Isquiotibiales: 60s cada pierna',
            'Pantorrillas: 60s cada pierna',
            'IT Band: 60s cada pierna (si necesario)',
          ],
          targetMuscles: ['Piernas completas'],
        },
      ],
    },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get appropriate cooldown protocol based on session type
 */
export function getCooldownProtocol(sessionType: SessionType): CooldownProtocol {
  switch (sessionType) {
    case 'PUSH':
    case 'HANDSTAND':
    case 'PLANCHE':
      return PUSH_COOLDOWN;

    case 'PULL':
    case 'FRONT_LEVER':
      return PULL_COOLDOWN;

    case 'LEGS':
      return LEGS_COOLDOWN;

    case 'SKILLS':
      return SKILLS_COOLDOWN;

    case 'FULL_BODY':
    case 'WEIGHTED':
      return FULL_BODY_COOLDOWN;

    default:
      return STANDARD_COOLDOWN;
  }
}

/**
 * Get total cooldown duration
 */
export function getTotalCooldownDuration(protocol: CooldownProtocol): number {
  return protocol.totalDuration;
}

/**
 * Check if warmup was adequate based on duration
 */
export interface WarmupAdequacy {
  adequate: boolean;
  message: string;
  warningLevel: 'none' | 'warning' | 'critical';
}

export function checkWarmupAdequacy(
  warmupDuration: number,
  level: string
): WarmupAdequacy {
  const minimumDurations: Record<string, number> = {
    STAGE_1_2: 10, // BEGINNER/NOVICE: 10 min
    STAGE_3: 15, // INTERMEDIATE: 15 min
    STAGE_4: 18, // ADVANCED/EXPERT: 18 min
  };

  const requiredDuration = minimumDurations[level] || 10;

  if (warmupDuration >= requiredDuration) {
    return {
      adequate: true,
      message: '✅ Calentamiento adecuado',
      warningLevel: 'none',
    };
  }

  if (warmupDuration >= requiredDuration * 0.7) {
    return {
      adequate: false,
      message: `⚠️ Calentamiento corto. Recomendado: ${requiredDuration} min`,
      warningLevel: 'warning',
    };
  }

  return {
    adequate: false,
    message: `❌ Calentamiento insuficiente. Mínimo: ${requiredDuration} min`,
    warningLevel: 'critical',
  };
}
