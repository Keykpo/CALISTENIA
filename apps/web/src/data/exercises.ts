export interface Exercise {
  id: string
  name: string
  level: 'principiante' | 'intermedio' | 'avanzado'
  family: 'empujes' | 'tracciones' | 'core' | 'equilibrio' | 'tren_inferior' | 'estaticos' | 'dinamicos'
  description: string
  progressions: Progression[]
  technicalTips: string[]
  prerequisites?: string[]
}

export interface Progression {
  step: number
  name: string
  description: string
  timeUnderTension: string
  reps?: string
  sets?: number
  holdTime?: string
}

export const exercises: Exercise[] = [
  // EMPUJES - FLEXIONES Y PROGRESIONES
  {
    id: 'wall-push-up',
    name: 'Flexiones de Pared',
    level: 'principiante',
    family: 'empujes',
    description: 'Flexión básica contra la pared para desarrollar fuerza inicial en pecho, hombros y tríceps.',
    progressions: [
      {
        step: 1,
        name: 'Flexión de pared básica',
        description: 'Brazos extendidos contra la pared, cuerpo recto',
        timeUnderTension: '2 segundos bajada, 1 segundo pausa, 1 segundo subida',
        reps: '10-15',
        sets: 3
      }
    ],
    technicalTips: [
      'Mantén el cuerpo completamente recto',
      'Coloca las manos a la altura del pecho',
      'Controla el movimiento en ambas fases'
    ]
  },
  {
    id: 'incline-push-up',
    name: 'Flexiones Inclinadas',
    level: 'principiante',
    family: 'empujes',
    description: 'Flexiones con manos elevadas para reducir la carga y progresar hacia flexiones completas.',
    progressions: [
      {
        step: 1,
        name: 'Flexión en banco alto',
        description: 'Manos en superficie de 60-80cm de altura',
        timeUnderTension: '2 segundos bajada, 1 segundo pausa, 1 segundo subida',
        reps: '8-12',
        sets: 3
      },
      {
        step: 2,
        name: 'Flexión en banco medio',
        description: 'Manos en superficie de 40-60cm de altura',
        timeUnderTension: '2 segundos bajada, 1 segundo pausa, 1 segundo subida',
        reps: '10-15',
        sets: 3
      },
      {
        step: 3,
        name: 'Flexión en banco bajo',
        description: 'Manos en superficie de 20-40cm de altura',
        timeUnderTension: '3 segundos bajada, 1 segundo pausa, 1 segundo subida',
        reps: '12-20',
        sets: 3
      }
    ],
    technicalTips: [
      'Progresa gradualmente reduciendo la altura',
      'Mantén la línea corporal recta',
      'Baja hasta que el pecho toque la superficie'
    ],
    prerequisites: ['wall-push-up']
  },
  {
    id: 'knee-push-up',
    name: 'Flexiones de Rodillas',
    level: 'principiante',
    family: 'empujes',
    description: 'Flexiones apoyando las rodillas para reducir la carga corporal.',
    progressions: [
      {
        step: 1,
        name: 'Flexión de rodillas básica',
        description: 'Rodillas apoyadas, cuerpo recto desde rodillas hasta cabeza',
        timeUnderTension: '2 segundos bajada, 1 segundo pausa, 1 segundo subida',
        reps: '8-15',
        sets: 3
      },
      {
        step: 2,
        name: 'Flexión de rodillas lenta',
        description: 'Mismo ejercicio con mayor control temporal',
        timeUnderTension: '3 segundos bajada, 2 segundos pausa, 2 segundos subida',
        reps: '6-12',
        sets: 3
      }
    ],
    technicalTips: [
      'Mantén las caderas alineadas',
      'No arquees la espalda baja',
      'Baja hasta que el pecho casi toque el suelo'
    ],
    prerequisites: ['incline-push-up']
  },
  {
    id: 'standard-push-up',
    name: 'Flexiones Estándar',
    level: 'intermedio',
    family: 'empujes',
    description: 'Flexión completa con cuerpo recto, ejercicio fundamental de empuje.',
    progressions: [
      {
        step: 1,
        name: 'Flexión estándar básica',
        description: 'Cuerpo completamente recto, manos a la altura del pecho',
        timeUnderTension: '2 segundos bajada, 1 segundo pausa, 1 segundo subida',
        reps: '5-12',
        sets: 3
      },
      {
        step: 2,
        name: 'Flexión estándar controlada',
        description: 'Mayor control y tiempo bajo tensión',
        timeUnderTension: '3 segundos bajada, 2 segundos pausa, 2 segundos subida',
        reps: '8-15',
        sets: 3
      },
      {
        step: 3,
        name: 'Flexión estándar de volumen',
        description: 'Enfoque en mayor cantidad de repeticiones',
        timeUnderTension: '1 segundo bajada, 1 segundo subida',
        reps: '15-25',
        sets: 3
      }
    ],
    technicalTips: [
      'Mantén el core activado durante todo el movimiento',
      'Los codos deben formar un ángulo de 45° con el torso',
      'Baja hasta que el pecho toque el suelo'
    ],
    prerequisites: ['knee-push-up']
  },
  {
    id: 'diamond-push-up',
    name: 'Flexiones Diamante',
    level: 'intermedio',
    family: 'empujes',
    description: 'Flexiones con manos formando un diamante, enfoque en tríceps.',
    progressions: [
      {
        step: 1,
        name: 'Flexión diamante básica',
        description: 'Manos formando diamante bajo el pecho',
        timeUnderTension: '2 segundos bajada, 1 segundo pausa, 1 segundo subida',
        reps: '3-8',
        sets: 3
      },
      {
        step: 2,
        name: 'Flexión diamante controlada',
        description: 'Mayor control temporal y profundidad',
        timeUnderTension: '3 segundos bajada, 2 segundos pausa, 2 segundos subida',
        reps: '5-12',
        sets: 3
      }
    ],
    technicalTips: [
      'Forma un diamante perfecto con los dedos índice y pulgares',
      'Mantén los codos cerca del cuerpo',
      'Baja hasta que el pecho toque las manos'
    ],
    prerequisites: ['standard-push-up']
  },
  {
    id: 'archer-push-up',
    name: 'Flexiones Arquero',
    level: 'avanzado',
    family: 'empujes',
    description: 'Flexión unilateral alternando el peso entre ambos brazos.',
    progressions: [
      {
        step: 1,
        name: 'Flexión arquero asistida',
        description: 'Apoyo parcial en el brazo extendido',
        timeUnderTension: '3 segundos bajada, 1 segundo pausa, 2 segundos subida',
        reps: '3-6 por lado',
        sets: 3
      },
      {
        step: 2,
        name: 'Flexión arquero completa',
        description: 'Peso completo en un brazo, el otro extendido',
        timeUnderTension: '3 segundos bajada, 2 segundos pausa, 2 segundos subida',
        reps: '5-10 por lado',
        sets: 3
      }
    ],
    technicalTips: [
      'El brazo trabajador debe estar perpendicular al suelo',
      'El brazo extendido solo proporciona equilibrio',
      'Alterna entre ambos lados de manera equilibrada'
    ],
    prerequisites: ['diamond-push-up']
  },
  {
    id: 'one-arm-push-up',
    name: 'Flexiones a Una Mano',
    level: 'avanzado',
    family: 'empujes',
    description: 'Flexión completa usando solo un brazo, máximo nivel de dificultad.',
    progressions: [
      {
        step: 1,
        name: 'Flexión una mano elevada',
        description: 'Pies elevados para reducir carga',
        timeUnderTension: '3 segundos bajada, 1 segundo pausa, 2 segundos subida',
        reps: '1-3 por lado',
        sets: 3
      },
      {
        step: 2,
        name: 'Flexión una mano completa',
        description: 'Flexión completa con un solo brazo',
        timeUnderTension: '4 segundos bajada, 2 segundos pausa, 3 segundos subida',
        reps: '1-5 por lado',
        sets: 3
      }
    ],
    technicalTips: [
      'Coloca los pies más separados para mayor estabilidad',
      'El brazo libre debe ir detrás de la espalda',
      'Mantén el cuerpo completamente recto'
    ],
    prerequisites: ['archer-push-up']
  },

  // EMPUJES - FONDOS
  {
    id: 'bench-dips',
    name: 'Fondos en Banco',
    level: 'principiante',
    family: 'empujes',
    description: 'Fondos básicos usando un banco o superficie elevada.',
    progressions: [
      {
        step: 1,
        name: 'Fondos banco con pies apoyados',
        description: 'Pies en el suelo, rodillas flexionadas',
        timeUnderTension: '2 segundos bajada, 1 segundo pausa, 1 segundo subida',
        reps: '8-15',
        sets: 3
      },
      {
        step: 2,
        name: 'Fondos banco pies extendidos',
        description: 'Piernas extendidas, mayor dificultad',
        timeUnderTension: '2 segundos bajada, 1 segundo pausa, 1 segundo subida',
        reps: '10-20',
        sets: 3
      }
    ],
    technicalTips: [
      'Baja hasta que los codos formen 90°',
      'Mantén el torso erguido',
      'No uses las piernas para impulsarte'
    ]
  },
  {
    id: 'parallel-bar-dips',
    name: 'Fondos en Paralelas',
    level: 'intermedio',
    family: 'empujes',
    description: 'Fondos completos en barras paralelas, ejercicio fundamental de empuje vertical.',
    progressions: [
      {
        step: 1,
        name: 'Fondos asistidos',
        description: 'Con ayuda de banda elástica o apoyo de pies',
        timeUnderTension: '2 segundos bajada, 1 segundo pausa, 1 segundo subida',
        reps: '5-10',
        sets: 3
      },
      {
        step: 2,
        name: 'Fondos completos',
        description: 'Fondos sin asistencia',
        timeUnderTension: '2 segundos bajada, 1 segundo pausa, 1 segundo subida',
        reps: '8-15',
        sets: 3
      },
      {
        step: 3,
        name: 'Fondos profundos',
        description: 'Mayor rango de movimiento',
        timeUnderTension: '3 segundos bajada, 2 segundos pausa, 2 segundos subida',
        reps: '10-20',
        sets: 3
      }
    ],
    technicalTips: [
      'Mantén el cuerpo ligeramente inclinado hacia adelante',
      'Baja hasta que los hombros estén por debajo de los codos',
      'Activa el core para mantener estabilidad'
    ],
    prerequisites: ['bench-dips']
  },

  // TRACCIONES
  {
    id: 'dead-hang',
    name: 'Colgado Pasivo',
    level: 'principiante',
    family: 'tracciones',
    description: 'Colgado básico para desarrollar fuerza de agarre y preparar para dominadas.',
    progressions: [
      {
        step: 1,
        name: 'Colgado básico',
        description: 'Colgado con brazos completamente extendidos',
        timeUnderTension: 'Mantener posición',
        holdTime: '10-30 segundos',
        sets: 3
      },
      {
        step: 2,
        name: 'Colgado prolongado',
        description: 'Aumentar tiempo de colgado',
        timeUnderTension: 'Mantener posición',
        holdTime: '30-60 segundos',
        sets: 3
      }
    ],
    technicalTips: [
      'Agarre firme con todos los dedos',
      'Hombros ligeramente activados',
      'Cuerpo relajado pero controlado'
    ]
  },
  {
    id: 'assisted-pull-up',
    name: 'Dominadas Asistidas',
    level: 'principiante',
    family: 'tracciones',
    description: 'Dominadas con asistencia para desarrollar la fuerza necesaria.',
    progressions: [
      {
        step: 1,
        name: 'Dominada con banda gruesa',
        description: 'Máxima asistencia con banda elástica',
        timeUnderTension: '2 segundos subida, 3 segundos bajada',
        reps: '5-10',
        sets: 3
      },
      {
        step: 2,
        name: 'Dominada con banda media',
        description: 'Asistencia moderada',
        timeUnderTension: '2 segundos subida, 3 segundos bajada',
        reps: '6-12',
        sets: 3
      },
      {
        step: 3,
        name: 'Dominada con banda ligera',
        description: 'Mínima asistencia',
        timeUnderTension: '2 segundos subida, 3 segundos bajada',
        reps: '8-15',
        sets: 3
      }
    ],
    technicalTips: [
      'Mantén el core activado',
      'Sube hasta que la barbilla pase la barra',
      'Controla la bajada completamente'
    ],
    prerequisites: ['dead-hang']
  },
  {
    id: 'negative-pull-up',
    name: 'Dominadas Negativas',
    level: 'principiante',
    family: 'tracciones',
    description: 'Enfoque en la fase excéntrica de la dominada.',
    progressions: [
      {
        step: 1,
        name: 'Negativa básica',
        description: 'Saltar a posición alta y bajar controlado',
        timeUnderTension: '3-5 segundos bajada',
        reps: '3-6',
        sets: 3
      },
      {
        step: 2,
        name: 'Negativa lenta',
        description: 'Mayor control temporal en la bajada',
        timeUnderTension: '5-8 segundos bajada',
        reps: '5-8',
        sets: 3
      }
    ],
    technicalTips: [
      'Comienza con barbilla sobre la barra',
      'Baja de forma completamente controlada',
      'Extiende los brazos completamente al final'
    ],
    prerequisites: ['dead-hang']
  },
  {
    id: 'pull-up',
    name: 'Dominadas',
    level: 'intermedio',
    family: 'tracciones',
    description: 'Dominada completa, ejercicio fundamental de tracción vertical.',
    progressions: [
      {
        step: 1,
        name: 'Primera dominada',
        description: 'Lograr la primera dominada completa',
        timeUnderTension: '2 segundos subida, 2 segundos bajada',
        reps: '1-3',
        sets: 3
      },
      {
        step: 2,
        name: 'Dominadas múltiples',
        description: 'Aumentar el número de repeticiones',
        timeUnderTension: '2 segundos subida, 2 segundos bajada',
        reps: '3-8',
        sets: 3
      },
      {
        step: 3,
        name: 'Dominadas de volumen',
        description: 'Enfoque en mayor cantidad',
        timeUnderTension: '1 segundo subida, 2 segundos bajada',
        reps: '8-15',
        sets: 3
      }
    ],
    technicalTips: [
      'Agarre pronado, manos separadas al ancho de hombros',
      'Sube hasta que la barbilla pase la barra',
      'Mantén el cuerpo recto sin balancearse'
    ],
    prerequisites: ['negative-pull-up', 'assisted-pull-up']
  },
  {
    id: 'chin-up',
    name: 'Dominadas Supinas',
    level: 'intermedio',
    family: 'tracciones',
    description: 'Dominadas con agarre supino, mayor activación de bíceps.',
    progressions: [
      {
        step: 1,
        name: 'Dominada supina básica',
        description: 'Agarre supino, palmas hacia ti',
        timeUnderTension: '2 segundos subida, 2 segundos bajada',
        reps: '3-8',
        sets: 3
      },
      {
        step: 2,
        name: 'Dominada supina controlada',
        description: 'Mayor control y tiempo bajo tensión',
        timeUnderTension: '3 segundos subida, 3 segundos bajada',
        reps: '5-12',
        sets: 3
      }
    ],
    technicalTips: [
      'Agarre supino, manos al ancho de hombros',
      'Enfócate en activar los bíceps',
      'Mantén los codos cerca del cuerpo'
    ],
    prerequisites: ['pull-up']
  },
  {
    id: 'wide-grip-pull-up',
    name: 'Dominadas Agarre Ancho',
    level: 'avanzado',
    family: 'tracciones',
    description: 'Dominadas con agarre amplio, mayor activación del dorsal.',
    progressions: [
      {
        step: 1,
        name: 'Dominada agarre ancho básica',
        description: 'Manos separadas 1.5 veces el ancho de hombros',
        timeUnderTension: '2 segundos subida, 3 segundos bajada',
        reps: '2-6',
        sets: 3
      },
      {
        step: 2,
        name: 'Dominada agarre ancho al pecho',
        description: 'Subir hasta tocar el pecho con la barra',
        timeUnderTension: '3 segundos subida, 3 segundos bajada',
        reps: '3-8',
        sets: 3
      }
    ],
    technicalTips: [
      'Agarre más amplio que el ancho de hombros',
      'Enfócate en juntar los omóplatos',
      'Sube el pecho hacia la barra'
    ],
    prerequisites: ['pull-up']
  },
  {
    id: 'one-arm-pull-up',
    name: 'Dominada a Una Mano',
    level: 'avanzado',
    family: 'tracciones',
    description: 'Dominada completa usando solo un brazo, máximo nivel de dificultad.',
    progressions: [
      {
        step: 1,
        name: 'Dominada una mano asistida',
        description: 'Una mano en la barra, otra asiste con toalla',
        timeUnderTension: '3 segundos subida, 4 segundos bajada',
        reps: '1-3 por lado',
        sets: 3
      },
      {
        step: 2,
        name: 'Dominada una mano completa',
        description: 'Dominada completa con un solo brazo',
        timeUnderTension: '4 segundos subida, 5 segundos bajada',
        reps: '1-3 por lado',
        sets: 3
      }
    ],
    technicalTips: [
      'Desarrolla primero fuerza excéntrica',
      'Usa el core para evitar rotación',
      'Practica colgado a una mano primero'
    ],
    prerequisites: ['wide-grip-pull-up']
  },

  // CORE
  {
    id: 'plank',
    name: 'Plancha',
    level: 'principiante',
    family: 'core',
    description: 'Ejercicio isométrico fundamental para el core.',
    progressions: [
      {
        step: 1,
        name: 'Plancha básica',
        description: 'Posición de plancha sobre antebrazos',
        timeUnderTension: 'Mantener posición',
        holdTime: '20-60 segundos',
        sets: 3
      },
      {
        step: 2,
        name: 'Plancha extendida',
        description: 'Aumentar tiempo de mantenimiento',
        timeUnderTension: 'Mantener posición',
        holdTime: '60-120 segundos',
        sets: 3
      }
    ],
    technicalTips: [
      'Cuerpo completamente recto',
      'Core activado durante todo el ejercicio',
      'Respiración controlada'
    ]
  },
  {
    id: 'side-plank',
    name: 'Plancha Lateral',
    level: 'principiante',
    family: 'core',
    description: 'Plancha lateral para trabajar oblicuos y estabilidad lateral.',
    progressions: [
      {
        step: 1,
        name: 'Plancha lateral básica',
        description: 'Apoyo en antebrazo lateral',
        timeUnderTension: 'Mantener posición',
        holdTime: '15-45 segundos por lado',
        sets: 3
      },
      {
        step: 2,
        name: 'Plancha lateral extendida',
        description: 'Mayor tiempo de mantenimiento',
        timeUnderTension: 'Mantener posición',
        holdTime: '45-90 segundos por lado',
        sets: 3
      }
    ],
    technicalTips: [
      'Cuerpo en línea recta lateral',
      'Cadera elevada',
      'Mirada al frente'
    ]
  },
  {
    id: 'hollow-body',
    name: 'Hollow Body',
    level: 'intermedio',
    family: 'core',
    description: 'Posición hueca fundamental para gimnasia y calistenia.',
    progressions: [
      {
        step: 1,
        name: 'Hollow body básico',
        description: 'Posición hueca con rodillas flexionadas',
        timeUnderTension: 'Mantener posición',
        holdTime: '15-30 segundos',
        sets: 3
      },
      {
        step: 2,
        name: 'Hollow body piernas extendidas',
        description: 'Piernas completamente extendidas',
        timeUnderTension: 'Mantener posición',
        holdTime: '20-45 segundos',
        sets: 3
      },
      {
        step: 3,
        name: 'Hollow body rocks',
        description: 'Balanceo en posición hollow',
        timeUnderTension: 'Movimiento controlado',
        reps: '10-20',
        sets: 3
      }
    ],
    technicalTips: [
      'Espalda baja pegada al suelo',
      'Hombros y piernas elevados',
      'Core completamente contraído'
    ]
  },
  {
    id: 'l-sit',
    name: 'L-Sit',
    level: 'avanzado',
    family: 'core',
    description: 'Posición en L, ejercicio avanzado de core y fuerza de brazos.',
    progressions: [
      {
        step: 1,
        name: 'L-sit tucked',
        description: 'Rodillas al pecho, brazos extendidos',
        timeUnderTension: 'Mantener posición',
        holdTime: '5-15 segundos',
        sets: 3
      },
      {
        step: 2,
        name: 'L-sit una pierna',
        description: 'Una pierna extendida, otra flexionada',
        timeUnderTension: 'Mantener posición',
        holdTime: '5-15 segundos por lado',
        sets: 3
      },
      {
        step: 3,
        name: 'L-sit completo',
        description: 'Ambas piernas extendidas horizontalmente',
        timeUnderTension: 'Mantener posición',
        holdTime: '5-30 segundos',
        sets: 3
      }
    ],
    technicalTips: [
      'Brazos completamente extendidos',
      'Hombros deprimidos',
      'Piernas paralelas al suelo'
    ],
    prerequisites: ['hollow-body']
  },

  // EQUILIBRIO/INVERTIDOS
  {
    id: 'wall-handstand',
    name: 'Pino Contra Pared',
    level: 'principiante',
    family: 'equilibrio',
    description: 'Pino asistido contra la pared para desarrollar fuerza y equilibrio.',
    progressions: [
      {
        step: 1,
        name: 'Chest to wall',
        description: 'Pecho hacia la pared, caminar pies hacia arriba',
        timeUnderTension: 'Mantener posición',
        holdTime: '10-30 segundos',
        sets: 3
      },
      {
        step: 2,
        name: 'Back to wall',
        description: 'Espalda hacia la pared, equilibrio asistido',
        timeUnderTension: 'Mantener posición',
        holdTime: '15-45 segundos',
        sets: 3
      }
    ],
    technicalTips: [
      'Manos separadas al ancho de hombros',
      'Dedos separados para mejor agarre',
      'Core activado y cuerpo recto'
    ]
  },
  {
    id: 'crow-pose',
    name: 'Postura del Cuervo',
    level: 'intermedio',
    family: 'equilibrio',
    description: 'Equilibrio sobre las manos con rodillas apoyadas en los brazos.',
    progressions: [
      {
        step: 1,
        name: 'Crow pose básico',
        description: 'Equilibrio con rodillas en los codos',
        timeUnderTension: 'Mantener posición',
        holdTime: '5-15 segundos',
        sets: 3
      },
      {
        step: 2,
        name: 'Crow pose extendido',
        description: 'Mayor tiempo de mantenimiento',
        timeUnderTension: 'Mantener posición',
        holdTime: '15-30 segundos',
        sets: 3
      }
    ],
    technicalTips: [
      'Peso hacia adelante sobre las manos',
      'Rodillas firmemente apoyadas en los brazos',
      'Mirada hacia adelante'
    ]
  },
  {
    id: 'freestanding-handstand',
    name: 'Pino Libre',
    level: 'avanzado',
    family: 'equilibrio',
    description: 'Pino sin apoyo, equilibrio completo sobre las manos.',
    progressions: [
      {
        step: 1,
        name: 'Kick up practice',
        description: 'Práctica de subida al pino',
        timeUnderTension: 'Intentos controlados',
        reps: '5-10 intentos',
        sets: 3
      },
      {
        step: 2,
        name: 'Pino libre básico',
        description: 'Mantener equilibrio sin apoyo',
        timeUnderTension: 'Mantener posición',
        holdTime: '5-15 segundos',
        sets: 3
      },
      {
        step: 3,
        name: 'Pino libre extendido',
        description: 'Mayor tiempo y control',
        timeUnderTension: 'Mantener posición',
        holdTime: '15-60 segundos',
        sets: 3
      }
    ],
    technicalTips: [
      'Equilibrio con los dedos',
      'Core fuertemente activado',
      'Correcciones mínimas y constantes'
    ],
    prerequisites: ['wall-handstand', 'crow-pose']
  },

  // TREN INFERIOR
  {
    id: 'bodyweight-squat',
    name: 'Sentadilla',
    level: 'principiante',
    family: 'tren_inferior',
    description: 'Sentadilla básica con peso corporal.',
    progressions: [
      {
        step: 1,
        name: 'Sentadilla básica',
        description: 'Sentadilla completa con peso corporal',
        timeUnderTension: '2 segundos bajada, 1 segundo pausa, 1 segundo subida',
        reps: '10-20',
        sets: 3
      },
      {
        step: 2,
        name: 'Sentadilla lenta',
        description: 'Mayor control temporal',
        timeUnderTension: '3 segundos bajada, 2 segundos pausa, 2 segundos subida',
        reps: '8-15',
        sets: 3
      }
    ],
    technicalTips: [
      'Pies separados al ancho de hombros',
      'Baja hasta que los muslos estén paralelos al suelo',
      'Mantén el pecho erguido'
    ]
  },
  {
    id: 'single-leg-squat-assisted',
    name: 'Sentadilla a Una Pierna Asistida',
    level: 'intermedio',
    family: 'tren_inferior',
    description: 'Progresión hacia la pistol squat con asistencia.',
    progressions: [
      {
        step: 1,
        name: 'Sentadilla una pierna con apoyo',
        description: 'Usando TRX o apoyo de manos',
        timeUnderTension: '3 segundos bajada, 1 segundo pausa, 2 segundos subida',
        reps: '3-8 por pierna',
        sets: 3
      },
      {
        step: 2,
        name: 'Sentadilla una pierna en cajón',
        description: 'Sentadilla en superficie elevada',
        timeUnderTension: '3 segundos bajada, 1 segundo pausa, 2 segundos subida',
        reps: '5-10 por pierna',
        sets: 3
      }
    ],
    technicalTips: [
      'Pierna libre extendida al frente',
      'Baja controladamente',
      'Mantén el equilibrio durante todo el movimiento'
    ],
    prerequisites: ['bodyweight-squat']
  },
  {
    id: 'pistol-squat',
    name: 'Pistol Squat',
    level: 'avanzado',
    family: 'tren_inferior',
    description: 'Sentadilla completa a una pierna, ejercicio avanzado de fuerza y equilibrio.',
    progressions: [
      {
        step: 1,
        name: 'Pistol squat negativa',
        description: 'Solo la fase excéntrica controlada',
        timeUnderTension: '5 segundos bajada',
        reps: '3-6 por pierna',
        sets: 3
      },
      {
        step: 2,
        name: 'Pistol squat completa',
        description: 'Movimiento completo sin asistencia',
        timeUnderTension: '3 segundos bajada, 1 segundo pausa, 2 segundos subida',
        reps: '1-5 por pierna',
        sets: 3
      }
    ],
    technicalTips: [
      'Pierna libre completamente extendida',
      'Baja hasta que el glúteo toque el talón',
      'Mantén el torso erguido'
    ],
    prerequisites: ['single-leg-squat-assisted']
  },

  // ELEMENTOS ESTÁTICOS
  {
    id: 'tuck-planche',
    name: 'Planche Tucked',
    level: 'intermedio',
    family: 'estaticos',
    description: 'Posición de planche con rodillas al pecho.',
    progressions: [
      {
        step: 1,
        name: 'Planche lean',
        description: 'Inclinación hacia adelante en posición de flexión',
        timeUnderTension: 'Mantener posición',
        holdTime: '10-30 segundos',
        sets: 3
      },
      {
        step: 2,
        name: 'Tuck planche',
        description: 'Rodillas al pecho, pies despegados del suelo',
        timeUnderTension: 'Mantener posición',
        holdTime: '5-15 segundos',
        sets: 3
      }
    ],
    technicalTips: [
      'Peso completamente sobre las manos',
      'Hombros por delante de las muñecas',
      'Core fuertemente contraído'
    ],
    prerequisites: ['crow-pose']
  },
  {
    id: 'advanced-tuck-planche',
    name: 'Planche Tucked Avanzada',
    level: 'avanzado',
    family: 'estaticos',
    description: 'Progresión hacia planche completa.',
    progressions: [
      {
        step: 1,
        name: 'Advanced tuck planche',
        description: 'Rodillas más separadas del pecho',
        timeUnderTension: 'Mantener posición',
        holdTime: '5-15 segundos',
        sets: 3
      },
      {
        step: 2,
        name: 'Straddle planche',
        description: 'Piernas separadas horizontalmente',
        timeUnderTension: 'Mantener posición',
        holdTime: '3-10 segundos',
        sets: 3
      }
    ],
    technicalTips: [
      'Progresión gradual en la extensión de piernas',
      'Mantén la altura de las caderas',
      'Fuerza constante en muñecas y hombros'
    ],
    prerequisites: ['tuck-planche']
  },
  {
    id: 'full-planche',
    name: 'Planche Completa',
    level: 'avanzado',
    family: 'estaticos',
    description: 'Planche con piernas completamente extendidas.',
    progressions: [
      {
        step: 1,
        name: 'Planche completa',
        description: 'Cuerpo completamente horizontal',
        timeUnderTension: 'Mantener posición',
        holdTime: '2-10 segundos',
        sets: 3
      }
    ],
    technicalTips: [
      'Cuerpo completamente recto y horizontal',
      'Máxima activación de todo el cuerpo',
      'Respiración controlada'
    ],
    prerequisites: ['advanced-tuck-planche']
  },
  {
    id: 'tuck-front-lever',
    name: 'Front Lever Tucked',
    level: 'intermedio',
    family: 'estaticos',
    description: 'Front lever con rodillas al pecho.',
    progressions: [
      {
        step: 1,
        name: 'Front lever negativas',
        description: 'Bajar controladamente desde posición invertida',
        timeUnderTension: '3-5 segundos bajada',
        reps: '3-6',
        sets: 3
      },
      {
        step: 2,
        name: 'Tuck front lever',
        description: 'Posición horizontal con rodillas al pecho',
        timeUnderTension: 'Mantener posición',
        holdTime: '5-15 segundos',
        sets: 3
      }
    ],
    technicalTips: [
      'Brazos completamente extendidos',
      'Hombros deprimidos',
      'Core fuertemente activado'
    ],
    prerequisites: ['pull-up', 'hollow-body']
  },
  {
    id: 'advanced-front-lever',
    name: 'Front Lever Avanzado',
    level: 'avanzado',
    family: 'estaticos',
    description: 'Progresiones avanzadas del front lever.',
    progressions: [
      {
        step: 1,
        name: 'Advanced tuck front lever',
        description: 'Rodillas más alejadas del pecho',
        timeUnderTension: 'Mantener posición',
        holdTime: '5-15 segundos',
        sets: 3
      },
      {
        step: 2,
        name: 'Straddle front lever',
        description: 'Piernas separadas horizontalmente',
        timeUnderTension: 'Mantener posición',
        holdTime: '3-10 segundos',
        sets: 3
      },
      {
        step: 3,
        name: 'Full front lever',
        description: 'Cuerpo completamente extendido horizontal',
        timeUnderTension: 'Mantener posición',
        holdTime: '2-8 segundos',
        sets: 3
      }
    ],
    technicalTips: [
      'Progresión gradual en extensión',
      'Mantén la altura del cuerpo',
      'Activación constante del dorsal'
    ],
    prerequisites: ['tuck-front-lever']
  },
  {
    id: 'back-lever',
    name: 'Back Lever',
    level: 'avanzado',
    family: 'estaticos',
    description: 'Posición horizontal invertida colgando de la barra.',
    progressions: [
      {
        step: 1,
        name: 'German hang',
        description: 'Colgado con brazos por detrás del cuerpo',
        timeUnderTension: 'Mantener posición',
        holdTime: '10-30 segundos',
        sets: 3
      },
      {
        step: 2,
        name: 'Back lever tucked',
        description: 'Back lever con rodillas al pecho',
        timeUnderTension: 'Mantener posición',
        holdTime: '5-15 segundos',
        sets: 3
      },
      {
        step: 3,
        name: 'Back lever completo',
        description: 'Cuerpo completamente extendido',
        timeUnderTension: 'Mantener posición',
        holdTime: '3-10 segundos',
        sets: 3
      }
    ],
    technicalTips: [
      'Flexibilidad de hombros fundamental',
      'Progresión muy gradual',
      'Calentamiento exhaustivo necesario'
    ],
    prerequisites: ['pull-up', 'dead-hang']
  },

  // ELEMENTOS DINÁMICOS
  {
    id: 'muscle-up-progression',
    name: 'Progresión Muscle-Up',
    level: 'intermedio',
    family: 'dinamicos',
    description: 'Progresiones hacia el muscle-up completo.',
    progressions: [
      {
        step: 1,
        name: 'High pull-ups',
        description: 'Dominadas hasta el pecho',
        timeUnderTension: '2 segundos subida, 3 segundos bajada',
        reps: '3-8',
        sets: 3
      },
      {
        step: 2,
        name: 'Muscle-up negativas',
        description: 'Solo la fase excéntrica del muscle-up',
        timeUnderTension: '3-5 segundos bajada',
        reps: '3-6',
        sets: 3
      },
      {
        step: 3,
        name: 'Muscle-up asistido',
        description: 'Con banda elástica o impulso mínimo',
        timeUnderTension: 'Movimiento explosivo controlado',
        reps: '1-5',
        sets: 3
      }
    ],
    technicalTips: [
      'Desarrolla primero fuerza en dominadas altas',
      'Practica la transición sobre la barra',
      'Combina tracción y empuje en un movimiento fluido'
    ],
    prerequisites: ['pull-up', 'parallel-bar-dips']
  },
  {
    id: 'muscle-up',
    name: 'Muscle-Up',
    level: 'avanzado',
    family: 'dinamicos',
    description: 'Muscle-up completo, combinación de dominada y fondo.',
    progressions: [
      {
        step: 1,
        name: 'Muscle-up completo',
        description: 'Movimiento completo sin asistencia',
        timeUnderTension: 'Explosivo subida, controlado bajada',
        reps: '1-5',
        sets: 3
      },
      {
        step: 2,
        name: 'Muscle-up múltiples',
        description: 'Repeticiones consecutivas',
        timeUnderTension: 'Movimiento fluido',
        reps: '3-8',
        sets: 3
      }
    ],
    technicalTips: [
      'Movimiento explosivo en la subida',
      'Transición rápida sobre la barra',
      'Combina kipping mínimo con fuerza pura'
    ],
    prerequisites: ['muscle-up-progression']
  }
]

export const exerciseFamilies = {
  empujes: 'Empujes',
  tracciones: 'Tracciones', 
  core: 'Core',
  equilibrio: 'Equilibrio/Invertidos',
  tren_inferior: 'Tren Inferior',
  estaticos: 'Elementos Estáticos',
  dinamicos: 'Elementos Dinámicos'
} as const

export const exerciseLevels = {
  principiante: 'Principiante',
  intermedio: 'Intermedio', 
  avanzado: 'Avanzado'
} as const