/**
 * Detailed Warmup Protocols
 * Imported from RUTINAS_POR_NIVEL/CALENTAMIENTOS/PROTOCOLOS_CALENTAMIENTO.md
 *
 * CRITICAL IMPORTANCE: Warmup is NOT optional in calisthenics.
 * Wrists, elbows, and shoulders are extremely vulnerable.
 * An injury can set back months of progress.
 *
 * Golden Rule: Never train without at least 10 minutes of warmup.
 */

import type {
  WarmupProtocol,
  SessionType,
  WarmupLevel,
  CompleteWarmup,
} from '@/types/warmup';

// ============================================================================
// PROTOCOL 1: WRIST WARMUP (OBLIGATORIO PARA PUSH)
// ============================================================================

export const WRIST_WARMUP_PROTOCOL: WarmupProtocol = {
  id: 'wrist-warmup',
  name: 'Calentamiento de Muñecas',
  duration: 7, // minutes
  mandatory: ['PUSH', 'HANDSTAND', 'PLANCHE'],
  description:
    'Protocolo obligatorio antes de CUALQUIER sesión de empuje (push-ups, dips, handstand, planche)',
  exercises: [
    {
      name: 'Círculos de Muñeca',
      duration: 30, // seconds each direction
      instructions: [
        'Manos entrelazadas',
        'Círculos amplios, lentos',
        'Ambas direcciones (horario y antihorario)',
      ],
    },
    {
      name: 'Inclinaciones de Palma (Palm Rocks)',
      reps: '15-20',
      instructions: [
        'Manos en el suelo, palmas hacia abajo',
        'Dedos hacia atrás (hacia ti)',
        'Inclinar peso hacia atrás, sentir estiramiento en muñecas',
        'Mantener 2 segundos, soltar',
      ],
    },
    {
      name: 'Elevaciones de Muñeca (Wrist Lifts)',
      reps: '10-15',
      instructions: [
        'Manos en el suelo, palmas hacia abajo',
        'Mantener dedos en el suelo',
        'Levantar solo las palmas',
        'Bajar controlado',
      ],
    },
    {
      name: 'Palm Push-ups',
      reps: 10,
      instructions: [
        'Posición de plancha',
        'Dedos en el suelo',
        'Levantar palmas del suelo (peso en dedos)',
        'Bajar palmas',
      ],
    },
    {
      name: 'Finger Push-ups (Activación)',
      reps: 10,
      instructions: [
        'Posición de plancha',
        'Palmas en el suelo',
        'Levantar dedos del suelo',
        'Bajar dedos',
      ],
    },
    {
      name: 'Wrist Push-ups',
      reps: '8-12',
      instructions: [
        'Posición de plancha',
        'Flexionar muñecas llevando peso hacia adelante',
        'Extender muñecas volviendo atrás',
        'Movimiento pequeño pero intenso',
      ],
    },
    {
      name: 'Knuckle Rotations (Avanzado)',
      reps: '10 cada dirección',
      instructions: [
        'Puños en el suelo',
        'Rotar muñecas en círculos pequeños',
        'Preparación para entrenamiento en nudillos',
      ],
    },
  ],
  levelVariation: {
    beginner: [
      'Círculos de Muñeca',
      'Inclinaciones de Palma (Palm Rocks)',
      'Elevaciones de Muñeca (Wrist Lifts)',
      'Palm Push-ups',
      'Finger Push-ups (Activación)',
    ],
    intermediate: [
      'Círculos de Muñeca',
      'Inclinaciones de Palma (Palm Rocks)',
      'Elevaciones de Muñeca (Wrist Lifts)',
      'Palm Push-ups',
      'Finger Push-ups (Activación)',
      'Wrist Push-ups',
    ],
    advanced: [
      'Círculos de Muñeca',
      'Inclinaciones de Palma (Palm Rocks)',
      'Elevaciones de Muñeca (Wrist Lifts)',
      'Palm Push-ups',
      'Finger Push-ups (Activación)',
      'Wrist Push-ups',
      'Knuckle Rotations (Avanzado)',
    ],
  },
};

// ============================================================================
// PROTOCOL 2: SHOULDER WARMUP (OBLIGATORIO PARA PULL Y PUSH)
// ============================================================================

export const SHOULDER_WARMUP_PROTOCOL: WarmupProtocol = {
  id: 'shoulder-warmup',
  name: 'Calentamiento de Hombros',
  duration: 8, // minutes
  mandatory: ['ALL'],
  description: 'Obligatorio antes de TODAS las sesiones',
  exercises: [
    {
      name: 'Rotaciones de Hombros',
      reps: '20 adelante, 20 atrás',
      instructions: [
        'Círculos amplios',
        'Lentos y controlados',
        'Rango completo de movimiento',
      ],
    },
    {
      name: 'Círculos de Brazos',
      reps: '15 cada dirección',
      instructions: [
        'Brazos extendidos a los lados',
        'Círculos grandes',
        'Adelante y atrás',
      ],
    },
    {
      name: 'Arm Swings (Brazos Cruzados)',
      reps: 20,
      instructions: [
        'Brazos extendidos al frente',
        'Abrir y cerrar cruzando',
        'Dinámico y rítmico',
      ],
    },
    {
      name: 'Doorway Stretch (Estiramiento en Marco de Puerta)',
      duration: 45, // seconds each side
      instructions: [
        'Brazo en marco de puerta (90°)',
        'Rotar cuerpo hacia afuera',
        'Sentir estiramiento en pecho y hombro frontal',
      ],
    },
    {
      name: 'Band Dislocations (Con Banda o Palo)',
      reps: '15-20',
      instructions: [
        'Agarre amplio en banda o palo',
        'Pasar banda desde frente hasta atrás sobre la cabeza',
        'Brazos rectos todo el tiempo',
        'Si es muy difícil, aumentar ancho de agarre',
      ],
    },
    {
      name: 'Downward Dog to Cobra Flow',
      reps: '8-10',
      instructions: [
        'Posición Downward Dog (V invertida)',
        'Fluir hacia Cobra (pecho hacia adelante y arriba)',
        'Movimiento suave y continuo',
        'Respiración profunda',
      ],
    },
    {
      name: 'Wall Slides',
      reps: '12-15',
      instructions: [
        'Espalda contra pared',
        'Brazos en W position',
        'Deslizar brazos hacia arriba (Y position)',
        'Mantener espalda y brazos contra pared',
      ],
    },
  ],
  levelVariation: {
    beginner: [
      'Rotaciones de Hombros',
      'Círculos de Brazos',
      'Arm Swings (Brazos Cruzados)',
      'Doorway Stretch (Estiramiento en Marco de Puerta)',
      'Band Dislocations (Con Banda o Palo)',
    ],
    intermediate: [
      'Rotaciones de Hombros',
      'Círculos de Brazos',
      'Arm Swings (Brazos Cruzados)',
      'Doorway Stretch (Estiramiento en Marco de Puerta)',
      'Band Dislocations (Con Banda o Palo)',
      'Downward Dog to Cobra Flow',
    ],
    advanced: [
      'Rotaciones de Hombros',
      'Círculos de Brazos',
      'Arm Swings (Brazos Cruzados)',
      'Doorway Stretch (Estiramiento en Marco de Puerta)',
      'Band Dislocations (Con Banda o Palo)',
      'Downward Dog to Cobra Flow',
      'Wall Slides',
    ],
  },
};

// ============================================================================
// PROTOCOL 3: SCAPULAR ACTIVATION (ESENCIAL)
// ============================================================================

export const SCAPULAR_ACTIVATION_PROTOCOL: WarmupProtocol = {
  id: 'scapular-activation',
  name: 'Activación Escapular',
  duration: 5, // minutes
  mandatory: ['PULL', 'PUSH'],
  description: 'Esencial antes de sesiones de pull y push',
  exercises: [
    {
      name: 'Scapula Push-ups',
      reps: '12-15',
      instructions: [
        'Posición de plancha, brazos rectos',
        'Juntar escápulas (retracción) - pecho baja ligeramente',
        'Separar escápulas (protracción) - pecho sube',
        'NO doblar codos',
      ],
    },
    {
      name: 'Scapula Pull-ups (o Scapula Shrugs)',
      reps: '10-12',
      instructions: [
        'Colgado de barra, brazos rectos',
        'Deprimir escápulas (hombros lejos de orejas)',
        'Relajar escápulas (hombros suben)',
        'NO doblar codos',
      ],
    },
    {
      name: 'Band Pull-aparts',
      reps: '15-20',
      instructions: [
        'Banda elástica al frente, brazos extendidos',
        'Separar banda llevando brazos hacia afuera',
        'Retracción escapular máxima',
        'Control en regreso',
      ],
    },
  ],
};

// ============================================================================
// PROTOCOL 4: LEG AND HIP WARMUP
// ============================================================================

export const LEG_HIP_WARMUP_PROTOCOL: WarmupProtocol = {
  id: 'leg-hip-warmup',
  name: 'Calentamiento de Piernas y Cadera',
  duration: 7, // minutes
  mandatory: ['LEGS'],
  description: 'Antes de sesiones de piernas',
  exercises: [
    {
      name: 'Hip Circles (Círculos de Cadera)',
      reps: '15 cada dirección',
      instructions: [
        'Manos en cintura',
        'Círculos amplios con cadera',
        'Ambas direcciones',
      ],
    },
    {
      name: 'Leg Swings (Balanceo de Piernas)',
      reps: '15 cada pierna',
      instructions: [
        'Adelante/atrás: Pierna swing hacia adelante y atrás',
        'Lateral: Pierna swing de lado a lado',
        'Control y amplitud progresiva',
      ],
    },
    {
      name: 'Deep Squat Hold (Sostén en Sentadilla Profunda)',
      duration: 60, // seconds
      instructions: [
        'Sentadilla profunda (culo casi en el suelo)',
        'Codos empujan rodillas hacia afuera',
        'Pecho arriba, talones en el suelo',
        'Estirar aductores y caderas',
      ],
    },
    {
      name: 'Ankle Circles (Círculos de Tobillo)',
      reps: '15 cada dirección, cada pie',
      instructions: [
        'Pie elevado del suelo',
        'Rotar tobillo en círculos',
        'Ambas direcciones',
      ],
    },
    {
      name: 'Walking Lunges (Zancadas Caminando)',
      reps: '10-12 cada pierna',
      instructions: [
        'Zancada profunda hacia adelante',
        'Rodilla trasera casi toca suelo',
        'Empujar con talón delantero para avanzar',
        'Dinámico, preparación muscular',
      ],
    },
    {
      name: 'Glute Bridges (Puentes de Glúteos)',
      reps: '15-20',
      instructions: [
        'Acostado boca arriba, pies en el suelo',
        'Elevar cadera hacia arriba',
        'Apretar glúteos arriba',
        'Activación de cadena posterior',
      ],
    },
  ],
};

// ============================================================================
// PROTOCOL 5: GENERAL WARMUP (FULL BODY)
// ============================================================================

export const GENERAL_WARMUP_PROTOCOL: WarmupProtocol = {
  id: 'general-warmup',
  name: 'Calentamiento General',
  duration: 12, // minutes
  mandatory: ['FULL_BODY'],
  description: 'Al inicio de cualquier sesión completa',
  exercises: [
    // FASE 1: ACTIVACIÓN CARDIO (3 min)
    {
      name: 'Jumping Jacks',
      duration: 30,
      instructions: ['Saltos con brazos arriba y piernas abiertas', 'Ritmo constante'],
    },
    {
      name: 'High Knees',
      duration: 30,
      instructions: ['Rodillas arriba hacia el pecho', 'Rápido y dinámico'],
    },
    {
      name: 'Butt Kicks',
      duration: 30,
      instructions: ['Talones hacia glúteos', 'Mantener ritmo'],
    },
    {
      name: 'Arm Circles',
      duration: 30,
      instructions: ['Círculos amplios con los brazos', 'Adelante y atrás'],
    },
    {
      name: 'Jump Rope (real o simulado)',
      duration: 60,
      instructions: ['Saltar la cuerda o simular el movimiento', 'Mantener ritmo constante'],
    },

    // FASE 2: MOVILIDAD DINÁMICA (5 min)
    {
      name: 'Cat-Cow Stretch',
      reps: 10,
      instructions: [
        'Posición cuadrúpeda',
        'Alternar entre arquear y redondear espalda',
        'Movimiento fluido',
      ],
    },
    {
      name: "World's Greatest Stretch",
      reps: '5 cada lado',
      instructions: [
        'Zancada profunda',
        'Codo hacia el suelo',
        'Rotar hacia arriba',
        'Estiramiento completo',
      ],
    },
    {
      name: 'Inchworms',
      reps: 8,
      instructions: [
        'De pie, bajar manos al suelo',
        'Caminar con manos hacia plancha',
        'Caminar con pies hacia manos',
        'Regresar a posición de pie',
      ],
    },
    {
      name: 'Hip Openers',
      reps: '10 cada lado',
      instructions: [
        'Posición cuadrúpeda',
        'Levantar rodilla hacia el lado',
        'Círculos con la rodilla',
        'Abrir cadera',
      ],
    },
    {
      name: 'Torso Rotations',
      reps: '15 cada dirección',
      instructions: [
        'De pie, manos en la cabeza',
        'Rotar torso',
        'Cadera estable',
        'Movimiento controlado',
      ],
    },

    // FASE 3: ACTIVACIÓN ESPECÍFICA (3-4 min)
    {
      name: 'Scapula Push-ups',
      reps: 12,
      instructions: [
        'Posición de plancha',
        'Protracción y retracción escapular',
        'Brazos rectos',
      ],
    },
    {
      name: 'Scapula Pull-ups',
      reps: 10,
      instructions: [
        'Colgado de barra',
        'Depresión escapular',
        'Brazos rectos',
      ],
    },
    {
      name: 'Hollow Body Hold',
      duration: 20, // seconds
      instructions: [
        'Acostado boca arriba',
        'Zona lumbar pegada al suelo',
        'Piernas y hombros elevados',
        'Core activado',
      ],
    },
    {
      name: 'Plank Hold',
      duration: 30,
      instructions: [
        'Posición de plancha',
        'Cuerpo en línea recta',
        'Core y glúteos activados',
      ],
    },
    {
      name: 'Dead Hang',
      duration: 30,
      instructions: [
        'Colgado de barra',
        'Brazos rectos',
        'Hombros deprimidos',
        'Preparación para pull work',
      ],
    },
  ],
};

// ============================================================================
// SPECIFIC SKILL PROTOCOLS
// ============================================================================

export const HANDSTAND_SPECIFIC_WARMUP: WarmupProtocol = {
  id: 'handstand-specific',
  name: 'Calentamiento Específico para Handstand',
  duration: 15, // minutes
  mandatory: ['HANDSTAND'],
  description: 'Protocolo completo antes de práctica de handstand',
  exercises: [
    // First: Complete wrist warmup (7 min)
    // Then: Shoulder warmup (5 min)
    // Then: Handstand specific (3 min)
    {
      name: 'Wall Walks',
      reps: 3,
      instructions: [
        'Comenzar en posición de plancha con pies en pared',
        'Caminar pies hacia arriba mientras manos se acercan',
        'Llegar a posición de handstand contra pared',
        'Bajar controlado',
      ],
    },
    {
      name: 'Shoulder Taps (Plank)',
      reps: '10 cada lado',
      instructions: [
        'Posición de plancha',
        'Tocar hombro opuesto con mano',
        'Mantener cadera estable',
        'Alternar lados',
      ],
    },
    {
      name: 'Hollow Body Hold',
      duration: 20,
      instructions: [
        'Acostado boca arriba',
        'Zona lumbar pegada',
        'Forma de banana',
        'Preparación para línea de handstand',
      ],
    },
    {
      name: 'Wall Handstand Hold',
      duration: 30, // x 2 sets
      instructions: [
        'Handstand contra pared',
        'Cuerpo recto',
        'Hombros empujados',
        'Dedos activos',
        'Hacer 2 series',
      ],
    },
  ],
};

export const PLANCHE_SPECIFIC_WARMUP: WarmupProtocol = {
  id: 'planche-specific',
  name: 'Calentamiento Específico para Planche',
  duration: 18, // minutes
  mandatory: ['PLANCHE'],
  description: 'Protocolo completo antes de práctica de planche',
  exercises: [
    // First: Complete wrist warmup (7 min)
    // Then: Shoulder warmup (5 min)
    // Then: Planche specific (6 min)
    {
      name: 'Scapula Push-ups (Protracción Enfoque)',
      reps: 15,
      instructions: [
        'Posición de plancha',
        'Enfoque en protracción máxima',
        'Hombros hacia adelante',
        'Preparación para planche lean',
      ],
    },
    {
      name: 'PPPU (Ligero)',
      reps: '10 x 2 sets',
      instructions: [
        'Pseudo planche push-ups',
        'Manos a altura de cadera',
        'Inclinación ligera (50%)',
        'Calentar articulaciones',
      ],
    },
    {
      name: 'Planche Leans (50% intensidad)',
      duration: 10, // seconds x 3 sets
      instructions: [
        'Posición de plancha',
        'Inclinar hacia adelante',
        'Solo 50% del lean máximo',
        '3 series de 10 segundos',
      ],
    },
    {
      name: 'Tuck Planche (50% tiempo máximo)',
      duration: 10, // seconds x 3 sets
      instructions: [
        'Tuck planche hold',
        'Solo 50% del tiempo máximo',
        'Calentar sin fatigarse',
        '3 series de 10 segundos',
      ],
    },
  ],
};

export const FRONT_LEVER_SPECIFIC_WARMUP: WarmupProtocol = {
  id: 'front-lever-specific',
  name: 'Calentamiento Específico para Front Lever',
  duration: 15, // minutes
  mandatory: ['FRONT_LEVER'],
  description: 'Protocolo completo antes de práctica de front lever',
  exercises: [
    // First: Shoulder warmup (6 min)
    // Then: Scapular activation (3 min)
    // Then: Front Lever specific (6 min)
    {
      name: 'Scapula Pull-ups (Depresión Enfoque)',
      reps: 15,
      instructions: [
        'Colgado de barra',
        'Enfoque en depresión escapular',
        'Hombros lejos de orejas',
        'Preparación para FL',
      ],
    },
    {
      name: 'Skin the Cat',
      reps: 5,
      instructions: [
        'Colgado de barra',
        'Llevar rodillas al pecho',
        'Rotar hacia atrás',
        'Movilidad de hombros',
      ],
    },
    {
      name: 'Tuck FL (50% tiempo máximo)',
      duration: 10, // seconds x 3 sets
      instructions: [
        'Tuck front lever hold',
        'Solo 50% del tiempo máximo',
        'Calentar sin fatigarse',
        '3 series de 10 segundos',
      ],
    },
    {
      name: 'Australian Pull-ups',
      reps: '10 x 2 sets',
      instructions: [
        'Barra a altura de cintura',
        'Cuerpo horizontal',
        'Pull-ups horizontales',
        '2 series de 10',
      ],
    },
  ],
};

export const WEIGHTED_SPECIFIC_WARMUP: WarmupProtocol = {
  id: 'weighted-specific',
  name: 'Calentamiento para Weighted Calisthenics',
  duration: 20, // minutes (including ramp-up sets)
  mandatory: ['WEIGHTED'],
  description: 'Protocolo completo antes de trabajo con lastre',
  exercises: [
    // First: General warmup (8 min)
    // Then: Ramp-up sets (12 min)
    {
      name: 'Ejercicio objetivo sin peso',
      reps: '10-12 x 1 set',
      instructions: [
        'Realizar ejercicio objetivo sin peso',
        'Enfoque en forma perfecta',
        'Activación neuromuscular',
      ],
    },
    {
      name: '30% del peso target',
      reps: '8 x 1 set',
      instructions: [
        'Agregar 30% del peso objetivo',
        'Mantener forma perfecta',
        'Preparar articulaciones',
      ],
    },
    {
      name: '50% del peso target',
      reps: '6 x 1 set',
      instructions: [
        'Agregar 50% del peso objetivo',
        'Velocidad controlada',
        'Calentar tendones',
      ],
    },
    {
      name: '70% del peso target',
      reps: '3-4 x 1 set',
      instructions: [
        'Agregar 70% del peso objetivo',
        'Última serie de aproximación',
        'Listo para trabajar al 100%',
      ],
    },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get required warmup protocols based on session type and level
 */
export function getRequiredWarmupProtocols(
  sessionType: SessionType,
  level: WarmupLevel = 'BEGINNER'
): WarmupProtocol[] {
  const protocols: WarmupProtocol[] = [];

  // Determine base protocols
  switch (sessionType) {
    case 'FULL_BODY':
      protocols.push(GENERAL_WARMUP_PROTOCOL);
      protocols.push(SHOULDER_WARMUP_PROTOCOL);
      protocols.push(WRIST_WARMUP_PROTOCOL);
      protocols.push(SCAPULAR_ACTIVATION_PROTOCOL);
      break;

    case 'PUSH':
      protocols.push(SHOULDER_WARMUP_PROTOCOL);
      protocols.push(WRIST_WARMUP_PROTOCOL);
      protocols.push(SCAPULAR_ACTIVATION_PROTOCOL);
      break;

    case 'PULL':
      protocols.push(SHOULDER_WARMUP_PROTOCOL);
      protocols.push(SCAPULAR_ACTIVATION_PROTOCOL);
      break;

    case 'LEGS':
      protocols.push(LEG_HIP_WARMUP_PROTOCOL);
      protocols.push(SHOULDER_WARMUP_PROTOCOL); // Light shoulder work still needed
      break;

    case 'SKILLS':
      protocols.push(SHOULDER_WARMUP_PROTOCOL);
      protocols.push(WRIST_WARMUP_PROTOCOL);
      protocols.push(SCAPULAR_ACTIVATION_PROTOCOL);
      break;

    case 'HANDSTAND':
      protocols.push(WRIST_WARMUP_PROTOCOL);
      protocols.push(SHOULDER_WARMUP_PROTOCOL);
      protocols.push(HANDSTAND_SPECIFIC_WARMUP);
      break;

    case 'PLANCHE':
      protocols.push(WRIST_WARMUP_PROTOCOL);
      protocols.push(SHOULDER_WARMUP_PROTOCOL);
      protocols.push(PLANCHE_SPECIFIC_WARMUP);
      break;

    case 'FRONT_LEVER':
      protocols.push(SHOULDER_WARMUP_PROTOCOL);
      protocols.push(SCAPULAR_ACTIVATION_PROTOCOL);
      protocols.push(FRONT_LEVER_SPECIFIC_WARMUP);
      break;

    case 'WEIGHTED':
      protocols.push(GENERAL_WARMUP_PROTOCOL);
      protocols.push(WEIGHTED_SPECIFIC_WARMUP);
      break;

    default:
      // Default: full body warmup
      protocols.push(GENERAL_WARMUP_PROTOCOL);
  }

  // Filter exercises based on level
  return protocols.map((protocol) => filterProtocolByLevel(protocol, level));
}

/**
 * Filter protocol exercises based on user level
 */
function filterProtocolByLevel(
  protocol: WarmupProtocol,
  level: WarmupLevel
): WarmupProtocol {
  if (!protocol.levelVariation) {
    return protocol;
  }

  let exerciseNames: string[] = [];

  switch (level) {
    case 'BEGINNER':
    case 'NOVICE':
      exerciseNames = protocol.levelVariation.beginner;
      break;
    case 'INTERMEDIATE':
      exerciseNames = protocol.levelVariation.intermediate;
      break;
    case 'ADVANCED':
    case 'EXPERT':
      exerciseNames = protocol.levelVariation.advanced;
      break;
  }

  const filteredExercises = protocol.exercises.filter((ex) =>
    exerciseNames.includes(ex.name)
  );

  return {
    ...protocol,
    exercises: filteredExercises.length > 0 ? filteredExercises : protocol.exercises,
  };
}

/**
 * Get total warmup duration
 */
export function getTotalWarmupDuration(protocols: WarmupProtocol[]): number {
  return protocols.reduce((total, protocol) => total + protocol.duration, 0);
}

/**
 * Generate complete warmup structure
 */
export function generateCompleteWarmup(
  sessionType: SessionType,
  level: WarmupLevel = 'BEGINNER'
): CompleteWarmup {
  const protocols = getRequiredWarmupProtocols(sessionType, level);
  const totalDuration = getTotalWarmupDuration(protocols);

  return {
    protocols,
    totalDuration,
    sessionType,
    level,
  };
}

/**
 * Get warmup level from training stage
 */
export function getWarmupLevelFromStage(stage: string): WarmupLevel {
  if (stage === 'STAGE_1_2') return 'BEGINNER';
  if (stage === 'STAGE_3') return 'INTERMEDIATE';
  if (stage === 'STAGE_4') return 'ADVANCED';
  return 'BEGINNER';
}

/**
 * Determine session type from routine phase
 */
export function determineSessionType(phases: any): SessionType {
  // Logic to determine session type based on routine phases
  // This will be implemented when integrating with V3

  // For now, return FULL_BODY as default
  return 'FULL_BODY';
}
