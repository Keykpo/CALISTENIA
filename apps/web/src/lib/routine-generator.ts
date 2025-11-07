// Generador de rutinas personalizadas para calistenia

export type RoutineConfig = {
  userId: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  goal: 'strength' | 'endurance' | 'skill' | 'balanced';
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: string[]; // ['NONE', 'PULL_UP_BAR', etc.]
  weakPoints?: {
    relativeStrength?: number;
    muscularEndurance?: number;
    balanceControl?: number;
    jointMobility?: number;
    bodyTension?: number;
    skillTechnique?: number;
  };
};

export type WorkoutRoutine = {
  day: string;
  focus: string;
  exercises: RoutineExercise[];
  totalMinutes: number;
};

export type RoutineExercise = {
  name: string;
  category: string;
  sets: number;
  reps?: number;
  duration?: number; // seconds
  rest: number; // seconds
  notes?: string;
};

// Base de ejercicios simplificada (en producción vendría de exercises.json)
const EXERCISE_LIBRARY: Record<string, RoutineExercise[]> = {
  warmup: [
    {
      name: 'Jumping Jacks',
      category: 'WARM_UP',
      sets: 1,
      duration: 60,
      rest: 0,
      notes: 'Movilidad general',
    },
    {
      name: 'Arm Circles',
      category: 'WARM_UP',
      sets: 2,
      reps: 10,
      rest: 10,
      notes: 'Cada dirección',
    },
    {
      name: 'Wrist Rotations',
      category: 'WARM_UP',
      sets: 2,
      reps: 10,
      rest: 10,
    },
  ],
  push_beginner: [
    {
      name: 'Wall Push-ups',
      category: 'STRENGTH',
      sets: 3,
      reps: 10,
      rest: 60,
      notes: 'Mantén el core activo',
    },
    {
      name: 'Incline Push-ups',
      category: 'STRENGTH',
      sets: 3,
      reps: 8,
      rest: 60,
    },
    {
      name: 'Knee Push-ups',
      category: 'STRENGTH',
      sets: 3,
      reps: 10,
      rest: 60,
    },
  ],
  push_intermediate: [
    {
      name: 'Standard Push-ups',
      category: 'STRENGTH',
      sets: 4,
      reps: 15,
      rest: 60,
    },
    {
      name: 'Wide Push-ups',
      category: 'STRENGTH',
      sets: 3,
      reps: 12,
      rest: 60,
    },
    {
      name: 'Diamond Push-ups',
      category: 'STRENGTH',
      sets: 3,
      reps: 8,
      rest: 60,
    },
  ],
  push_advanced: [
    {
      name: 'Archer Push-ups',
      category: 'STRENGTH',
      sets: 4,
      reps: 8,
      rest: 90,
      notes: 'Cada lado',
    },
    {
      name: 'Pseudo Planche Push-ups',
      category: 'STRENGTH',
      sets: 3,
      reps: 6,
      rest: 90,
    },
    {
      name: 'Explosive Push-ups',
      category: 'STRENGTH',
      sets: 3,
      reps: 5,
      rest: 90,
    },
  ],
  pull_beginner: [
    {
      name: 'Australian Pull-ups',
      category: 'STRENGTH',
      sets: 3,
      reps: 8,
      rest: 60,
      notes: 'Barra baja',
    },
    {
      name: 'Scapular Pull-ups',
      category: 'STRENGTH',
      sets: 3,
      reps: 10,
      rest: 60,
    },
    {
      name: 'Dead Hang',
      category: 'STRENGTH',
      sets: 3,
      duration: 20,
      rest: 60,
    },
  ],
  pull_intermediate: [
    {
      name: 'Pull-ups',
      category: 'STRENGTH',
      sets: 4,
      reps: 8,
      rest: 90,
    },
    {
      name: 'Chin-ups',
      category: 'STRENGTH',
      sets: 3,
      reps: 10,
      rest: 90,
    },
    {
      name: 'Wide Grip Pull-ups',
      category: 'STRENGTH',
      sets: 3,
      reps: 6,
      rest: 90,
    },
  ],
  pull_advanced: [
    {
      name: 'Archer Pull-ups',
      category: 'STRENGTH',
      sets: 4,
      reps: 6,
      rest: 120,
    },
    {
      name: 'L-sit Pull-ups',
      category: 'STRENGTH',
      sets: 3,
      reps: 5,
      rest: 120,
    },
    {
      name: 'Muscle-up Progressions',
      category: 'STRENGTH',
      sets: 3,
      reps: 3,
      rest: 120,
    },
  ],
  core_beginner: [
    {
      name: 'Plank',
      category: 'CORE',
      sets: 3,
      duration: 30,
      rest: 30,
    },
    {
      name: 'Crunches',
      category: 'CORE',
      sets: 3,
      reps: 15,
      rest: 30,
    },
    {
      name: 'Leg Raises (Bent Knee)',
      category: 'CORE',
      sets: 3,
      reps: 10,
      rest: 30,
    },
  ],
  core_intermediate: [
    {
      name: 'Plank',
      category: 'CORE',
      sets: 3,
      duration: 60,
      rest: 45,
    },
    {
      name: 'Hanging Knee Raises',
      category: 'CORE',
      sets: 3,
      reps: 12,
      rest: 60,
    },
    {
      name: 'Russian Twists',
      category: 'CORE',
      sets: 3,
      reps: 20,
      rest: 45,
    },
  ],
  core_advanced: [
    {
      name: 'Dragon Flag Progressions',
      category: 'CORE',
      sets: 3,
      reps: 5,
      rest: 90,
    },
    {
      name: 'Hanging Leg Raises',
      category: 'CORE',
      sets: 4,
      reps: 10,
      rest: 60,
    },
    {
      name: 'L-sit Hold',
      category: 'CORE',
      sets: 3,
      duration: 20,
      rest: 60,
    },
  ],
  legs_beginner: [
    {
      name: 'Squats',
      category: 'LEG_STRENGTH',
      sets: 3,
      reps: 15,
      rest: 60,
    },
    {
      name: 'Lunges',
      category: 'LEG_STRENGTH',
      sets: 3,
      reps: 10,
      rest: 60,
      notes: 'Cada pierna',
    },
    {
      name: 'Calf Raises',
      category: 'LEG_STRENGTH',
      sets: 3,
      reps: 20,
      rest: 45,
    },
  ],
  legs_intermediate: [
    {
      name: 'Jump Squats',
      category: 'LEG_STRENGTH',
      sets: 3,
      reps: 12,
      rest: 60,
    },
    {
      name: 'Bulgarian Split Squats',
      category: 'LEG_STRENGTH',
      sets: 3,
      reps: 10,
      rest: 60,
      notes: 'Cada pierna',
    },
    {
      name: 'Single Leg Calf Raises',
      category: 'LEG_STRENGTH',
      sets: 3,
      reps: 15,
      rest: 45,
      notes: 'Cada pierna',
    },
  ],
  legs_advanced: [
    {
      name: 'Pistol Squat Progressions',
      category: 'LEG_STRENGTH',
      sets: 3,
      reps: 5,
      rest: 90,
      notes: 'Cada pierna',
    },
    {
      name: 'Shrimp Squats',
      category: 'LEG_STRENGTH',
      sets: 3,
      reps: 6,
      rest: 90,
      notes: 'Cada pierna',
    },
    {
      name: 'Explosive Lunges',
      category: 'LEG_STRENGTH',
      sets: 3,
      reps: 10,
      rest: 60,
    },
  ],
  cooldown: [
    {
      name: 'Child Pose',
      category: 'COOL_DOWN',
      sets: 1,
      duration: 60,
      rest: 0,
    },
    {
      name: 'Standing Quad Stretch',
      category: 'COOL_DOWN',
      sets: 2,
      duration: 30,
      rest: 10,
      notes: 'Cada pierna',
    },
    {
      name: 'Hamstring Stretch',
      category: 'COOL_DOWN',
      sets: 2,
      duration: 30,
      rest: 10,
    },
  ],
};

export class RoutineGenerator {
  private config: RoutineConfig;

  constructor(config: RoutineConfig) {
    this.config = config;
  }

  generate(): WorkoutRoutine[] {
    const routines: WorkoutRoutine[] = [];
    const levelKey = this.config.level.toLowerCase();

    // Determinar días de entrenamiento según frecuencia
    const trainingDays = this.getTrainingDays(this.config.daysPerWeek);

    for (const day of trainingDays) {
      const routine = this.createDayRoutine(day, levelKey);
      routines.push(routine);
    }

    return routines;
  }

  private getTrainingDays(daysPerWeek: number): string[] {
    const allDays = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];

    const patterns: Record<number, string[]> = {
      2: ['Lunes', 'Jueves'],
      3: ['Lunes', 'Miércoles', 'Viernes'],
      4: ['Lunes', 'Martes', 'Jueves', 'Viernes'],
      5: ['Lunes', 'Martes', 'Miércoles', 'Viernes', 'Sábado'],
      6: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      7: allDays,
    };

    return patterns[daysPerWeek] || patterns[3];
  }

  private createDayRoutine(day: string, levelKey: string): WorkoutRoutine {
    const exercises: RoutineExercise[] = [];

    // Siempre empezar con warmup
    exercises.push(...EXERCISE_LIBRARY.warmup);

    // Determinar enfoque del día según patrón
    const dayIndex = [
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
      'domingo',
    ].indexOf(day.toLowerCase());
    const focus = this.getDayFocus(dayIndex);

    // Agregar ejercicios principales según enfoque y nivel
    switch (focus) {
      case 'push':
        exercises.push(...this.getExercises(`push_${levelKey}`));
        exercises.push(...this.getExercises(`core_${levelKey}`, 2));
        break;
      case 'pull':
        exercises.push(...this.getExercises(`pull_${levelKey}`));
        exercises.push(...this.getExercises(`core_${levelKey}`, 2));
        break;
      case 'legs':
        exercises.push(...this.getExercises(`legs_${levelKey}`));
        exercises.push(...this.getExercises(`core_${levelKey}`, 2));
        break;
      case 'full_body':
        exercises.push(...this.getExercises(`push_${levelKey}`, 1));
        exercises.push(...this.getExercises(`pull_${levelKey}`, 1));
        exercises.push(...this.getExercises(`core_${levelKey}`, 2));
        break;
      case 'skills':
        exercises.push(...this.getExercises(`push_${levelKey}`, 1));
        exercises.push(...this.getExercises(`pull_${levelKey}`, 1));
        exercises.push(...this.getExercises(`core_${levelKey}`, 1));
        break;
    }

    // Siempre terminar con cooldown
    exercises.push(...EXERCISE_LIBRARY.cooldown);

    // Calcular tiempo total estimado
    const totalMinutes = this.estimateTotalMinutes(exercises);

    return {
      day,
      focus: this.getFocusLabel(focus),
      exercises,
      totalMinutes,
    };
  }

  private getDayFocus(dayIndex: number): string {
    const patterns: Record<string, string[]> = {
      strength: ['push', 'pull', 'legs', 'push', 'pull', 'legs', 'full_body'],
      endurance: [
        'full_body',
        'full_body',
        'full_body',
        'full_body',
        'full_body',
        'full_body',
        'full_body',
      ],
      skill: ['push', 'pull', 'skills', 'legs', 'skills', 'full_body', 'skills'],
      balanced: ['push', 'pull', 'legs', 'full_body', 'push', 'pull', 'legs'],
    };

    const pattern = patterns[this.config.goal] || patterns.balanced;
    return pattern[dayIndex % pattern.length];
  }

  private getFocusLabel(focus: string): string {
    const labels: Record<string, string> = {
      push: 'Empuje (Push)',
      pull: 'Tracción (Pull)',
      legs: 'Tren Inferior',
      full_body: 'Cuerpo Completo',
      skills: 'Habilidades Avanzadas',
    };
    return labels[focus] || 'General';
  }

  private getExercises(key: string, limit?: number): RoutineExercise[] {
    const exercises = EXERCISE_LIBRARY[key] || [];
    return limit ? exercises.slice(0, limit) : exercises;
  }

  private estimateTotalMinutes(exercises: RoutineExercise[]): number {
    let totalSeconds = 0;

    for (const ex of exercises) {
      const sets = ex.sets || 1;
      const workTime = ex.duration || (ex.reps ? ex.reps * 2 : 30); // 2 seg por rep
      const restTime = ex.rest || 0;
      totalSeconds += sets * (workTime + restTime);
    }

    return Math.ceil(totalSeconds / 60);
  }
}

// Función helper para generar rutina
export function generateRoutine(config: RoutineConfig): WorkoutRoutine[] {
  const generator = new RoutineGenerator(config);
  return generator.generate();
}
