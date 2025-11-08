/**
 * Advanced Routine Generator v2
 *
 * This version integrates with:
 * - FIG Level Chart progressions
 * - Real exercises database
 * - Mastery Goals selection
 * - Personalized progression based on user skill level
 */

import {
  FIG_PROGRESSIONS,
  DifficultyLevel,
  MasteryGoal,
  getProgressionForLevel,
  getNextProgressionLevel,
} from './fig-level-progressions';

export type RoutineConfig = {
  userId: string;
  level: DifficultyLevel; // Updated to use DifficultyLevel from FIG Chart
  goal: 'strength' | 'endurance' | 'skill' | 'balanced';
  masteryGoals?: MasteryGoal[]; // NEW: User can select specific skills to work toward
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
  masteryGoalsFocus?: string[]; // NEW: Which mastery goals are trained this day
};

export type RoutineExercise = {
  id: string; // NEW: Exercise ID for database lookup
  name: string;
  category: string;
  difficulty: DifficultyLevel; // NEW: FIG Level difficulty
  sets: number;
  reps?: number;
  duration?: number; // seconds
  rest: number; // seconds
  notes?: string;
  masteryGoal?: MasteryGoal; // NEW: If this exercise is part of a progression
};

// Exercise from database
export interface DatabaseExercise {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: DifficultyLevel;
  unit: string;
  muscleGroups: string[];
  equipment: string[];
  expReward: number;
  coinsReward: number;
  howTo: string;
  gifUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string | null;
}

export class RoutineGeneratorV2 {
  private config: RoutineConfig;
  private exerciseDatabase: DatabaseExercise[];

  constructor(config: RoutineConfig, exerciseDatabase: DatabaseExercise[]) {
    this.config = config;
    this.exerciseDatabase = exerciseDatabase;
  }

  /**
   * Generate complete workout routine based on user configuration
   */
  generate(): WorkoutRoutine[] {
    const routines: WorkoutRoutine[] = [];
    const trainingDays = this.getTrainingDays(this.config.daysPerWeek);

    for (let i = 0; i < trainingDays.length; i++) {
      const day = trainingDays[i];
      const routine = this.createDayRoutine(day, i);
      routines.push(routine);
    }

    return routines;
  }

  /**
   * Create workout routine for a specific day
   */
  private createDayRoutine(day: string, dayIndex: number): WorkoutRoutine {
    const exercises: RoutineExercise[] = [];
    const masteryGoalsFocus: string[] = [];

    // 1. WARM-UP
    exercises.push(...this.getWarmupExercises());

    // 2. MASTERY GOAL WORK (if specified)
    if (this.config.masteryGoals && this.config.masteryGoals.length > 0) {
      const goalExercises = this.getMasteryGoalExercises(dayIndex);
      exercises.push(...goalExercises);
      masteryGoalsFocus.push(
        ...goalExercises
          .filter(ex => ex.masteryGoal)
          .map(ex => ex.masteryGoal!)
      );
    }

    // 3. MAIN WORK based on focus
    const focus = this.getDayFocus(dayIndex);
    exercises.push(...this.getMainExercises(focus));

    // 4. ACCESSORY/CORE WORK
    exercises.push(...this.getAccessoryExercises(focus));

    // 5. COOL-DOWN
    exercises.push(...this.getCooldownExercises());

    // Calculate total time
    const totalMinutes = this.estimateTotalMinutes(exercises);

    return {
      day,
      focus: this.getFocusLabel(focus),
      exercises,
      totalMinutes,
      masteryGoalsFocus: masteryGoalsFocus.length > 0 ? masteryGoalsFocus : undefined,
    };
  }

  /**
   * Get exercises for user's mastery goals based on FIG progressions
   */
  private getMasteryGoalExercises(dayIndex: number): RoutineExercise[] {
    if (!this.config.masteryGoals || this.config.masteryGoals.length === 0) {
      return [];
    }

    const exercises: RoutineExercise[] = [];

    // Rotate through mastery goals across different days
    const goalIndex = dayIndex % this.config.masteryGoals.length;
    const currentGoal = this.config.masteryGoals[goalIndex];

    // Get progression for user's current level
    const progression = getProgressionForLevel(currentGoal, this.config.level);

    if (progression) {
      // Find exercises in database matching this progression
      for (const exerciseId of progression.exerciseIds) {
        const dbExercise = this.findExerciseById(exerciseId);

        if (dbExercise) {
          exercises.push({
            id: dbExercise.id,
            name: dbExercise.name,
            category: dbExercise.category,
            difficulty: dbExercise.difficulty,
            sets: this.getSetsForDifficulty(dbExercise.difficulty),
            reps: dbExercise.unit === 'reps' ? this.getRepsForDifficulty(dbExercise.difficulty) : undefined,
            duration: dbExercise.unit === 'seconds' ? this.getDurationForDifficulty(dbExercise.difficulty) : undefined,
            rest: this.getRestForDifficulty(dbExercise.difficulty),
            notes: `${currentGoal} progression - ${progression.description}`,
            masteryGoal: currentGoal,
          });
        } else {
          // Try fuzzy name matching as fallback
          const fuzzyMatch = this.findExerciseByName(exerciseId);
          if (fuzzyMatch) {
            exercises.push({
              id: fuzzyMatch.id,
              name: fuzzyMatch.name,
              category: fuzzyMatch.category,
              difficulty: fuzzyMatch.difficulty,
              sets: this.getSetsForDifficulty(fuzzyMatch.difficulty),
              reps: fuzzyMatch.unit === 'reps' ? this.getRepsForDifficulty(fuzzyMatch.difficulty) : undefined,
              duration: fuzzyMatch.unit === 'seconds' ? this.getDurationForDifficulty(fuzzyMatch.difficulty) : undefined,
              rest: this.getRestForDifficulty(fuzzyMatch.difficulty),
              notes: `${currentGoal} progression - ${progression.description}`,
              masteryGoal: currentGoal,
            });
          }
        }
      }
    }

    return exercises.slice(0, 2); // Limit to 2 mastery exercises per session
  }

  /**
   * Get warm-up exercises
   */
  private getWarmupExercises(): RoutineExercise[] {
    const warmupExercises = this.exerciseDatabase.filter(
      ex => ex.category === 'WARM_UP' && ex.difficulty === 'BEGINNER'
    );

    return this.selectRandomExercises(warmupExercises, 3).map(ex => ({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      difficulty: ex.difficulty,
      sets: 1,
      duration: 45,
      rest: 15,
      notes: 'General mobility and activation',
    }));
  }

  /**
   * Get main exercises based on day focus
   */
  private getMainExercises(focus: string): RoutineExercise[] {
    let category: string;
    let count: number;

    switch (focus) {
      case 'push':
        category = 'STRENGTH';
        count = 4;
        break;
      case 'pull':
        category = 'STRENGTH';
        count = 4;
        break;
      case 'legs':
        category = 'LEG_STRENGTH';
        count = 4;
        break;
      case 'full_body':
        category = 'STRENGTH';
        count = 6;
        break;
      case 'skills':
        category = 'SKILL_STATIC';
        count = 3;
        break;
      default:
        category = 'STRENGTH';
        count = 4;
    }

    // Get exercises matching user level and category
    const matchingExercises = this.exerciseDatabase.filter(
      ex =>
        ex.category === category &&
        this.isAppropriateLevel(ex.difficulty) &&
        this.hasRequiredEquipment(ex.equipment)
    );

    // For push/pull, filter by movement pattern
    let filtered = matchingExercises;
    if (focus === 'push') {
      filtered = matchingExercises.filter(ex =>
        ex.name.toLowerCase().includes('push') ||
        ex.name.toLowerCase().includes('dip') ||
        ex.name.toLowerCase().includes('press')
      );
    } else if (focus === 'pull') {
      filtered = matchingExercises.filter(ex =>
        ex.name.toLowerCase().includes('pull') ||
        ex.name.toLowerCase().includes('row') ||
        ex.name.toLowerCase().includes('chin')
      );
    }

    return this.selectRandomExercises(filtered, count).map(ex => ({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      difficulty: ex.difficulty,
      sets: this.getSetsForDifficulty(ex.difficulty),
      reps: ex.unit === 'reps' ? this.getRepsForDifficulty(ex.difficulty) : undefined,
      duration: ex.unit === 'seconds' ? this.getDurationForDifficulty(ex.difficulty) : undefined,
      rest: this.getRestForDifficulty(ex.difficulty),
    }));
  }

  /**
   * Get accessory/core exercises
   */
  private getAccessoryExercises(focus: string): RoutineExercise[] {
    const coreExercises = this.exerciseDatabase.filter(
      ex =>
        ex.category === 'CORE' &&
        this.isAppropriateLevel(ex.difficulty) &&
        this.hasRequiredEquipment(ex.equipment)
    );

    return this.selectRandomExercises(coreExercises, 2).map(ex => ({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      difficulty: ex.difficulty,
      sets: 3,
      reps: ex.unit === 'reps' ? 12 : undefined,
      duration: ex.unit === 'seconds' ? 30 : undefined,
      rest: 45,
    }));
  }

  /**
   * Get cool-down exercises
   */
  private getCooldownExercises(): RoutineExercise[] {
    const cooldownExercises = this.exerciseDatabase.filter(
      ex => ex.category === 'COOL_DOWN'
    );

    return this.selectRandomExercises(cooldownExercises, 3).map(ex => ({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      difficulty: ex.difficulty,
      sets: 1,
      duration: 30,
      rest: 10,
      notes: 'Hold and breathe deeply',
    }));
  }

  /**
   * Helper: Find exercise by exact ID
   */
  private findExerciseById(id: string): DatabaseExercise | undefined {
    return this.exerciseDatabase.find(ex => ex.id === id);
  }

  /**
   * Helper: Find exercise by name (fuzzy match)
   */
  private findExerciseByName(searchName: string): DatabaseExercise | undefined {
    const normalized = searchName.toLowerCase().replace(/[-_]/g, ' ');
    return this.exerciseDatabase.find(ex => {
      const exName = ex.name.toLowerCase().replace(/[-_]/g, ' ');
      return exName.includes(normalized) || normalized.includes(exName);
    });
  }

  /**
   * Helper: Check if exercise difficulty is appropriate for user
   */
  private isAppropriateLevel(exerciseDifficulty: DifficultyLevel): boolean {
    const levels: DifficultyLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'];
    const userLevelIndex = levels.indexOf(this.config.level);
    const exerciseLevelIndex = levels.indexOf(exerciseDifficulty);

    // Include exercises at user's level and one level below/above
    return Math.abs(userLevelIndex - exerciseLevelIndex) <= 1;
  }

  /**
   * Helper: Check if user has required equipment
   */
  private hasRequiredEquipment(requiredEquipment: string[]): boolean {
    if (requiredEquipment.includes('NONE') || requiredEquipment.length === 0) {
      return true;
    }
    return requiredEquipment.some(eq => this.config.equipment.includes(eq));
  }

  /**
   * Helper: Select random exercises from pool
   */
  private selectRandomExercises(
    pool: DatabaseExercise[],
    count: number
  ): DatabaseExercise[] {
    if (pool.length <= count) return pool;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Helper: Get sets based on difficulty
   */
  private getSetsForDifficulty(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'BEGINNER': return 3;
      case 'INTERMEDIATE': return 4;
      case 'ADVANCED': return 4;
      case 'ELITE': return 5;
      default: return 3;
    }
  }

  /**
   * Helper: Get reps based on difficulty
   */
  private getRepsForDifficulty(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'BEGINNER': return 10;
      case 'INTERMEDIATE': return 8;
      case 'ADVANCED': return 6;
      case 'ELITE': return 5;
      default: return 8;
    }
  }

  /**
   * Helper: Get duration (seconds) based on difficulty
   */
  private getDurationForDifficulty(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'BEGINNER': return 20;
      case 'INTERMEDIATE': return 30;
      case 'ADVANCED': return 40;
      case 'ELITE': return 50;
      default: return 30;
    }
  }

  /**
   * Helper: Get rest time based on difficulty
   */
  private getRestForDifficulty(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'BEGINNER': return 60;
      case 'INTERMEDIATE': return 90;
      case 'ADVANCED': return 120;
      case 'ELITE': return 180;
      default: return 90;
    }
  }

  /**
   * Get training days based on frequency
   */
  private getTrainingDays(daysPerWeek: number): string[] {
    const patterns: Record<number, string[]> = {
      2: ['Monday', 'Thursday'],
      3: ['Monday', 'Wednesday', 'Friday'],
      4: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      5: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'],
      6: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      7: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    };

    return patterns[daysPerWeek] || patterns[3];
  }

  /**
   * Get focus for a specific day
   */
  private getDayFocus(dayIndex: number): string {
    const patterns: Record<string, string[]> = {
      strength: ['push', 'pull', 'legs', 'push', 'pull', 'legs', 'full_body'],
      endurance: ['full_body', 'full_body', 'full_body', 'full_body', 'full_body', 'full_body', 'full_body'],
      skill: ['push', 'pull', 'skills', 'legs', 'skills', 'full_body', 'skills'],
      balanced: ['push', 'pull', 'legs', 'full_body', 'push', 'pull', 'legs'],
    };

    const pattern = patterns[this.config.goal] || patterns.balanced;
    return pattern[dayIndex % pattern.length];
  }

  /**
   * Get human-readable focus label
   */
  private getFocusLabel(focus: string): string {
    const labels: Record<string, string> = {
      push: 'Push',
      pull: 'Pull',
      legs: 'Legs',
      full_body: 'Full Body',
      skills: 'Advanced Skills',
    };
    return labels[focus] || 'General';
  }

  /**
   * Estimate total workout time in minutes
   */
  private estimateTotalMinutes(exercises: RoutineExercise[]): number {
    let totalSeconds = 0;

    for (const ex of exercises) {
      const sets = ex.sets || 1;
      const workTime = ex.duration || (ex.reps ? ex.reps * 2 : 30);
      const restTime = ex.rest || 0;
      totalSeconds += sets * (workTime + restTime);
    }

    return Math.ceil(totalSeconds / 60);
  }
}

/**
 * Helper function to generate routine with exercise database
 */
export function generateRoutineV2(
  config: RoutineConfig,
  exerciseDatabase: DatabaseExercise[]
): WorkoutRoutine[] {
  const generator = new RoutineGeneratorV2(config, exerciseDatabase);
  return generator.generate();
}
