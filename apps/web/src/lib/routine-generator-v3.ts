/**
 * ============================================================================
 * ADVANCED ROUTINE GENERATOR V3
 * ============================================================================
 *
 * Based on expert calisthenics progression guide principles:
 *
 * CRITICAL PHILOSOPHY:
 * - Mode 1 (Skill Acquisition): Practice with BUFFER, avoid failure
 * - Mode 2 (Foundation Building): Train to or near failure
 *
 * PROGRESSION STAGES:
 * - Stage 1-2 (Beginner/Intermediate): 100% Mode 2 (building base strength)
 * - Stage 3 (Advanced): Weighted calisthenics (Mode 2)
 * - Stage 4 (Elite): Bifurcated training (Mode 1 Skills + Mode 2 Weighted)
 *
 * ============================================================================
 */

import {
  FIG_PROGRESSIONS,
  DifficultyLevel,
  MasteryGoal,
  getProgressionForLevel,
} from './fig-level-progressions';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type TrainingStage = 'STAGE_1_2' | 'STAGE_3' | 'STAGE_4';
export type TrainingMode = 'MODE_1_SKILL' | 'MODE_2_STRENGTH';
export type SessionType = 'PUSH' | 'PULL' | 'LEGS' | 'SKILLS_PUSH' | 'SKILLS_PULL' | 'FULL_BODY';

export interface RoutineConfig {
  userId: string;
  level: DifficultyLevel; // D, C, B, A, S
  stage: TrainingStage; // Determined from level and strength metrics
  masteryGoals?: MasteryGoal[];
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: string[];

  // Strength metrics for gating
  pullUpsMax?: number;
  dipsMax?: number;
  pushUpsMax?: number;
  weightedPullUps?: number; // kg added
  weightedDips?: number; // kg added

  // Weak points for personalization
  weakPoints?: {
    relativeStrength?: number;
    muscularEndurance?: number;
    balanceControl?: number;
    jointMobility?: number;
    bodyTension?: number;
    skillTechnique?: number;
  };
}

export interface WorkoutRoutine {
  day: string;
  sessionType: SessionType;
  stage: TrainingStage;
  phases: SessionPhase[];
  totalMinutes: number;
  notes: string[];
}

export interface SessionPhase {
  name: string;
  purpose: string;
  duration: number; // minutes
  exercises: RoutineExercise[];
  mode?: TrainingMode;
}

export interface RoutineExercise {
  id: string;
  name: string;
  category: string;
  difficulty: DifficultyLevel;
  mode: TrainingMode;

  // Volume prescription
  sets: number;
  reps?: number;
  duration?: number; // seconds for isometric holds
  rest: number; // seconds

  // Mode 1 specific
  buffer?: string; // e.g., "Leave 2-3 seconds in the tank"

  // Mode 2 specific
  targetIntensity?: string; // e.g., "To failure", "Near failure (1-2 RIR)"

  notes?: string;
  masteryGoal?: MasteryGoal;
  coachTips?: string[];
}

export interface DatabaseExercise {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: DifficultyLevel;
  rank?: 'D' | 'C' | 'B' | 'A' | 'S';
  unit: string;
  muscleGroups: string[];
  equipment: string[];
  expReward: number;
  coinsReward: number;
  instructions: string[];
  gifUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string | null;
}

// ==========================================
// GATING SYSTEM (Prevent Injuries)
// ==========================================

/**
 * Determines if user meets prerequisites for specific skill paths
 */
export class SkillGatingSystem {
  static canAccessPlanchePath(config: RoutineConfig): boolean {
    // Planche path requires Stage 3+ (15+ Dips)
    return config.stage !== 'STAGE_1_2' && (config.dipsMax ?? 0) >= 15;
  }

  static canAccessFrontLeverPath(config: RoutineConfig): boolean {
    // Front Lever requires 8+ pull-ups
    return (config.pullUpsMax ?? 0) >= 8;
  }

  static canAccessOneArmPullUpPath(config: RoutineConfig): boolean {
    // OAP requires 15-20 clean pull-ups
    return (config.pullUpsMax ?? 0) >= 15;
  }

  static canAccessHandstandPushUpPath(config: RoutineConfig): boolean {
    // HSPU requires mastery of Pike Push-ups (approximated by 20+ push-ups)
    return (config.pushUpsMax ?? 0) >= 20;
  }

  static canAccessMuscleUpPath(config: RoutineConfig): boolean {
    // Muscle-up requires weighted pull-ups OR 10+ pull-ups + 10+ dips
    const hasWeightedStrength = (config.weightedPullUps ?? 0) > 0;
    const hasBaseStrength = (config.pullUpsMax ?? 0) >= 10 && (config.dipsMax ?? 0) >= 10;
    return hasWeightedStrength || hasBaseStrength;
  }

  static getAccessibleMasteryGoals(config: RoutineConfig): MasteryGoal[] {
    const accessible: MasteryGoal[] = [];

    if (this.canAccessPlanchePath(config)) accessible.push('PLANCHE');
    if (this.canAccessFrontLeverPath(config)) accessible.push('FRONT_LEVER');
    if (this.canAccessOneArmPullUpPath(config)) accessible.push('ONE_ARM_PULLUP');
    if (this.canAccessHandstandPushUpPath(config)) accessible.push('HANDSTAND_PUSHUP');
    if (this.canAccessMuscleUpPath(config)) accessible.push('MUSCLE_UP');

    // Always accessible
    accessible.push('HANDSTAND'); // Basic balance work

    return accessible;
  }
}

// ==========================================
// STAGE DETERMINATION
// ==========================================

export function determineTrainingStage(config: RoutineConfig): TrainingStage {
  const pullUps = config.pullUpsMax ?? 0;
  const dips = config.dipsMax ?? 0;

  // Stage 4: Elite (Weighted calisthenics + Skills)
  // Requirement: 10+ pull-ups with +25% BW OR 10+ dips with +40% BW
  const bodyWeightKg = 75; // Average, should come from user profile
  const weightedPullUpStrength = (config.weightedPullUps ?? 0) / bodyWeightKg;
  const weightedDipStrength = (config.weightedDips ?? 0) / bodyWeightKg;

  if (weightedPullUpStrength >= 0.25 || weightedDipStrength >= 0.40) {
    return 'STAGE_4';
  }

  // Stage 3: Advanced (Introduction to weighted work)
  // Requirement: 12+ pull-ups AND 15+ dips
  if (pullUps >= 12 && dips >= 15) {
    return 'STAGE_3';
  }

  // Stage 1-2: Beginner/Intermediate (Building base)
  return 'STAGE_1_2';
}

// ==========================================
// MAIN ROUTINE GENERATOR
// ==========================================

export class RoutineGeneratorV3 {
  private config: RoutineConfig;
  private exerciseDatabase: DatabaseExercise[];

  constructor(config: RoutineConfig, exerciseDatabase: DatabaseExercise[]) {
    this.config = {
      ...config,
      stage: determineTrainingStage(config),
    };
    this.exerciseDatabase = exerciseDatabase;
  }

  /**
   * Generate complete weekly routine
   */
  generate(): WorkoutRoutine[] {
    const routines: WorkoutRoutine[] = [];
    const split = this.getWeeklySplit();

    for (let i = 0; i < split.length; i++) {
      const sessionType = split[i];
      if (sessionType === 'REST') continue;

      const routine = this.createSessionRoutine(sessionType, i);
      routines.push(routine);
    }

    return routines;
  }

  /**
   * Get weekly split based on stage
   */
  private getWeeklySplit(): (SessionType | 'REST')[] {
    const daysPerWeek = this.config.daysPerWeek;

    // STAGE 1-2: Push/Pull/Legs split (Mode 2 only)
    if (this.config.stage === 'STAGE_1_2') {
      const basePattern: (SessionType | 'REST')[] = ['PUSH', 'LEGS', 'PULL', 'REST', 'PUSH', 'PULL', 'REST'];
      return basePattern.slice(0, daysPerWeek + Math.ceil((7 - daysPerWeek) / 2));
    }

    // STAGE 3: Weighted Push/Pull/Legs split (Mode 2 with added weight)
    if (this.config.stage === 'STAGE_3') {
      const basePattern: (SessionType | 'REST')[] = ['PUSH', 'LEGS', 'PULL', 'REST', 'PUSH', 'PULL', 'REST'];
      return basePattern.slice(0, daysPerWeek + Math.ceil((7 - daysPerWeek) / 2));
    }

    // STAGE 4: Skills + Weighted bifurcation (Mode 1 + Mode 2)
    const basePattern: (SessionType | 'REST')[] = [
      'SKILLS_PUSH',
      'LEGS',
      'SKILLS_PULL',
      'REST',
      'SKILLS_PUSH',
      'SKILLS_PULL',
      'REST'
    ];
    return basePattern.slice(0, daysPerWeek + Math.ceil((7 - daysPerWeek) / 2));
  }

  /**
   * Create a complete session routine
   */
  private createSessionRoutine(sessionType: SessionType, dayIndex: number): WorkoutRoutine {
    const phases: SessionPhase[] = [];
    const notes: string[] = [];

    // PHASE 1: WARM-UP (Mandatory, specific to session type)
    phases.push(this.createWarmUpPhase(sessionType));

    // PHASE 2-5: Depends on stage
    if (this.config.stage === 'STAGE_4') {
      // Elite bifurcated training
      phases.push(...this.createStage4Phases(sessionType, dayIndex));
      notes.push('🎯 Elite Training: Skills practiced with buffer (Mode 1), Strength trained to failure (Mode 2)');
    } else if (this.config.stage === 'STAGE_3') {
      // Weighted strength training
      phases.push(...this.createStage3Phases(sessionType));
      notes.push('💪 Advanced Training: Focus on weighted calisthenics to build maximum strength');
    } else {
      // Foundation building
      phases.push(...this.createStage1_2Phases(sessionType));
      notes.push('🏗️ Foundation Building: Train to failure to build base strength and muscle');
    }

    // PHASE FINAL: COOL-DOWN
    phases.push(this.createCoolDownPhase());

    const totalMinutes = phases.reduce((sum, phase) => sum + phase.duration, 0);

    return {
      day: this.getDayName(dayIndex),
      sessionType,
      stage: this.config.stage,
      phases,
      totalMinutes,
      notes,
    };
  }

  // ==========================================
  // PHASE BUILDERS
  // ==========================================

  /**
   * PHASE 1: Warm-up (Specific to session type)
   */
  private createWarmUpPhase(sessionType: SessionType): SessionPhase {
    const exercises: RoutineExercise[] = [];
    let purpose = '';

    // WRIST WARM-UP (Mandatory before PUSH sessions)
    if (sessionType === 'PUSH' || sessionType === 'SKILLS_PUSH') {
      purpose = 'Wrist & Shoulder Preparation (CRITICAL for injury prevention)';

      // Wrist mobility
      exercises.push({
        id: 'warmup-wrist-circles',
        name: 'Wrist Circles',
        category: 'WARM_UP',
        difficulty: 'BEGINNER',
        mode: 'MODE_2_STRENGTH',
        sets: 2,
        duration: 30,
        rest: 15,
        notes: 'Both directions, full range of motion',
      });

      exercises.push({
        id: 'warmup-wrist-rocks',
        name: 'Wrist Rocks (Palms Down)',
        category: 'WARM_UP',
        difficulty: 'BEGINNER',
        mode: 'MODE_2_STRENGTH',
        sets: 2,
        duration: 30,
        rest: 15,
        notes: 'Lean back gently to stretch wrist',
      });

      // Shoulder mobility & scapular activation
      exercises.push({
        id: 'warmup-scapula-pushups',
        name: 'Scapula Push-ups',
        category: 'WARM_UP',
        difficulty: 'BEGINNER',
        mode: 'MODE_2_STRENGTH',
        sets: 2,
        reps: 10,
        rest: 30,
        notes: 'Protraction and retraction, keep arms straight',
        coachTips: ['Focus on scapular movement, not arm bending', 'This activates serratus anterior'],
      });
    }

    // SHOULDER WARM-UP (Mandatory before PULL sessions)
    else if (sessionType === 'PULL' || sessionType === 'SKILLS_PULL') {
      purpose = 'Shoulder & Scapula Preparation';

      exercises.push({
        id: 'warmup-arm-circles',
        name: 'Arm Circles',
        category: 'WARM_UP',
        difficulty: 'BEGINNER',
        mode: 'MODE_2_STRENGTH',
        sets: 2,
        duration: 30,
        rest: 15,
        notes: 'Forward and backward, gradually increasing range',
      });

      exercises.push({
        id: 'warmup-scapula-pullups',
        name: 'Scapula Pull-ups',
        category: 'WARM_UP',
        difficulty: 'BEGINNER',
        mode: 'MODE_2_STRENGTH',
        sets: 2,
        reps: 8,
        rest: 30,
        notes: 'Depression and elevation, arms stay straight',
        coachTips: ['Pull shoulder blades down, then release', 'This is the "active shoulder" position'],
      });

      exercises.push({
        id: 'warmup-dead-hang',
        name: 'Dead Hang',
        category: 'WARM_UP',
        difficulty: 'BEGINNER',
        mode: 'MODE_2_STRENGTH',
        sets: 1,
        duration: 30,
        rest: 30,
        notes: 'Decompress spine, breathe deeply',
      });
    }

    // GENERAL WARM-UP (Legs and Full Body)
    else {
      purpose = 'General Mobility & Activation';

      const generalWarmup = this.exerciseDatabase.filter(
        ex => ex.category === 'WARM_UP' && ex.difficulty === 'BEGINNER'
      ).slice(0, 3);

      generalWarmup.forEach(ex => {
        exercises.push({
          id: ex.id,
          name: ex.name,
          category: ex.category,
          difficulty: ex.difficulty,
          mode: 'MODE_2_STRENGTH',
          sets: 1,
          duration: 45,
          rest: 15,
        });
      });
    }

    return {
      name: 'Warm-Up',
      purpose,
      duration: 10,
      exercises,
    };
  }

  /**
   * Create phases for STAGE 1-2 (Foundation Building)
   */
  private createStage1_2Phases(sessionType: SessionType): SessionPhase[] {
    const phases: SessionPhase[] = [];

    // MAIN WORK: Fundamental exercises to FAILURE (Mode 2)
    const mainExercises = this.getFoundationalExercises(sessionType);

    phases.push({
      name: 'Foundation Strength Work',
      purpose: 'Build base strength and muscle mass - TRAIN TO FAILURE',
      duration: 35,
      mode: 'MODE_2_STRENGTH',
      exercises: mainExercises.map(ex => ({
        ...ex,
        mode: 'MODE_2_STRENGTH',
        targetIntensity: 'To failure',
        coachTips: [
          'Push each set to muscular failure',
          'This builds the "motor" needed for advanced skills',
        ],
      })),
    });

    // ACCESSORY: Core work
    const coreExercises = this.getCoreExercises();

    phases.push({
      name: 'Core & Stability',
      purpose: 'Build anti-extension strength',
      duration: 15,
      mode: 'MODE_2_STRENGTH',
      exercises: coreExercises,
    });

    return phases;
  }

  /**
   * Create phases for STAGE 3 (Weighted Calisthenics)
   */
  private createStage3Phases(sessionType: SessionType): SessionPhase[] {
    const phases: SessionPhase[] = [];

    // MAIN WORK: Weighted exercises (Mode 2)
    const weightedExercises = this.getWeightedExercises(sessionType);

    phases.push({
      name: 'Weighted Strength Work',
      purpose: 'Build maximum strength with added weight - This unlocks elite skills',
      duration: 30,
      mode: 'MODE_2_STRENGTH',
      exercises: weightedExercises.map(ex => ({
        ...ex,
        mode: 'MODE_2_STRENGTH',
        targetIntensity: 'Near failure (1-2 RIR)',
        notes: 'Add weight progressively: +2.5kg when you can do 3x10',
        coachTips: [
          'Weighted calisthenics is the SECRET to unlocking advanced skills',
          'A strong weighted pull-up translates to muscle-ups and OAP',
        ],
      })),
    });

    // ACCESSORY: Volume work
    const accessoryExercises = this.getAccessoryExercises(sessionType);

    phases.push({
      name: 'Accessory Volume',
      purpose: 'Additional muscle building work',
      duration: 20,
      mode: 'MODE_2_STRENGTH',
      exercises: accessoryExercises,
    });

    return phases;
  }

  /**
   * Create phases for STAGE 4 (Skills + Weighted - Bifurcated Training)
   */
  private createStage4Phases(sessionType: SessionType, dayIndex: number): SessionPhase[] {
    const phases: SessionPhase[] = [];

    // PHASE 2: SKILL PRACTICE (Mode 1 - WITH BUFFER)
    const skillExercises = this.getSkillPracticeExercises(sessionType, dayIndex);

    if (skillExercises.length > 0) {
      phases.push({
        name: 'Skill Acquisition Practice',
        purpose: 'Neural learning - Practice quality over quantity - AVOID FAILURE',
        duration: 25,
        mode: 'MODE_1_SKILL',
        exercises: skillExercises.map(ex => ({
          ...ex,
          mode: 'MODE_1_SKILL',
          buffer: 'Leave 2-3 seconds in the tank',
          coachTips: [
            'STOP before failure - this preserves nervous system freshness',
            'More sets of perfect practice > fewer sets to failure',
            'Gymnasts avoid failure to train more frequently',
          ],
        })),
      });
    }

    // PHASE 3: SKILL SUPPORT STRENGTH (Mode 2 - Near Failure)
    const supportExercises = this.getSkillSupportExercises(sessionType);

    if (supportExercises.length > 0) {
      phases.push({
        name: 'Skill-Specific Strength',
        purpose: 'Build strength specific to your skill goals',
        duration: 15,
        mode: 'MODE_2_STRENGTH',
        exercises: supportExercises.map(ex => ({
          ...ex,
          mode: 'MODE_2_STRENGTH',
          targetIntensity: 'Near failure (1-2 RIR)',
        })),
      });
    }

    // PHASE 4: FUNDAMENTAL STRENGTH (Mode 2 - To Failure)
    const fundamentalExercises = this.getFundamentalStrengthExercises(sessionType);

    phases.push({
      name: 'Fundamental Strength Maintenance',
      purpose: 'Maintain and build the "motor" - Weighted work',
      duration: 20,
      mode: 'MODE_2_STRENGTH',
      exercises: fundamentalExercises.map(ex => ({
        ...ex,
        mode: 'MODE_2_STRENGTH',
        targetIntensity: 'To failure',
        coachTips: [
          'This maintains your strength base while you learn skills',
        ],
      })),
    });

    return phases;
  }

  /**
   * PHASE FINAL: Cool-down
   */
  private createCoolDownPhase(): SessionPhase {
    const cooldownExercises = this.exerciseDatabase
      .filter(ex => ex.category === 'FLEXIBILITY' || ex.category === 'COOL_DOWN')
      .slice(0, 3);

    const exercises: RoutineExercise[] = cooldownExercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      difficulty: ex.difficulty,
      mode: 'MODE_2_STRENGTH',
      sets: 1,
      duration: 30,
      rest: 10,
      notes: 'Hold and breathe deeply, static stretching',
    }));

    return {
      name: 'Cool-Down & Flexibility',
      purpose: 'Recovery and flexibility work',
      duration: 5,
      exercises,
    };
  }

  // ==========================================
  // EXERCISE SELECTORS
  // ==========================================

  /**
   * Get foundational exercises for Stage 1-2
   */
  private getFoundationalExercises(sessionType: SessionType): RoutineExercise[] {
    const exercises: RoutineExercise[] = [];
    let category = '';

    switch (sessionType) {
      case 'PUSH':
        category = 'PUSH';
        break;
      case 'PULL':
        category = 'PULL';
        break;
      case 'LEGS':
        category = 'LEGS';
        break;
      case 'FULL_BODY':
        // Mix of push and pull
        const pushEx = this.findAppropriateExercises('PUSH', 2);
        const pullEx = this.findAppropriateExercises('PULL', 2);
        return [...pushEx, ...pullEx].map(ex => this.mapToRoutineExercise(ex, 'MODE_2_STRENGTH'));
    }

    const dbExercises = this.findAppropriateExercises(category, 4);
    return dbExercises.map(ex => this.mapToRoutineExercise(ex, 'MODE_2_STRENGTH'));
  }

  /**
   * Get weighted exercises for Stage 3
   */
  private getWeightedExercises(sessionType: SessionType): RoutineExercise[] {
    // For weighted work, we prioritize compound movements
    const exercises: RoutineExercise[] = [];

    if (sessionType === 'PUSH') {
      // Weighted Dips is king for push
      exercises.push({
        id: 'weighted-dips',
        name: 'Weighted Dips',
        category: 'PUSH',
        difficulty: 'ADVANCED',
        mode: 'MODE_2_STRENGTH',
        sets: 4,
        reps: 8,
        rest: 180,
        notes: 'Use dip belt or weight vest. Add weight when you can do 3x10',
      });
    }

    if (sessionType === 'PULL') {
      // Weighted Pull-ups is king for pull
      exercises.push({
        id: 'weighted-pullups',
        name: 'Weighted Pull-ups',
        category: 'PULL',
        difficulty: 'ADVANCED',
        mode: 'MODE_2_STRENGTH',
        sets: 4,
        reps: 8,
        rest: 180,
        notes: 'Use dip belt or weight vest. This unlocks muscle-ups and OAP',
      });
    }

    // Fill rest with appropriate exercises
    const category = sessionType === 'PUSH' ? 'PUSH' : sessionType === 'PULL' ? 'PULL' : 'LEGS';
    const additional = this.findAppropriateExercises(category, 2);
    exercises.push(...additional.map(ex => this.mapToRoutineExercise(ex, 'MODE_2_STRENGTH')));

    return exercises;
  }

  /**
   * Get skill practice exercises for Stage 4 (Mode 1)
   */
  private getSkillPracticeExercises(sessionType: SessionType, dayIndex: number): RoutineExercise[] {
    const exercises: RoutineExercise[] = [];

    if (!this.config.masteryGoals || this.config.masteryGoals.length === 0) {
      return [];
    }

    // Filter accessible goals based on prerequisites
    const accessibleGoals = SkillGatingSystem.getAccessibleMasteryGoals(this.config);
    const userGoals = this.config.masteryGoals.filter(g => accessibleGoals.includes(g));

    if (userGoals.length === 0) return [];

    // Rotate through goals
    const goalIndex = dayIndex % userGoals.length;
    const currentGoal = userGoals[goalIndex];

    // Get progression for user's level
    const progression = getProgressionForLevel(currentGoal, this.config.level);

    if (!progression) return [];

    // Find exercises for this progression
    for (const exerciseId of progression.exerciseIds.slice(0, 2)) {
      const dbEx = this.exerciseDatabase.find(ex =>
        ex.id === exerciseId || ex.name.toLowerCase().includes(exerciseId.toLowerCase())
      );

      if (dbEx) {
        exercises.push({
          id: dbEx.id,
          name: dbEx.name,
          category: dbEx.category,
          difficulty: dbEx.difficulty,
          mode: 'MODE_1_SKILL',
          sets: 5, // More sets for skill practice
          duration: dbEx.unit === 'seconds' ? this.getSkillHoldDuration(dbEx.difficulty) : undefined,
          reps: dbEx.unit === 'reps' ? this.getSkillReps(dbEx.difficulty) : undefined,
          rest: 120, // Longer rest for neural recovery
          buffer: 'Stop 2-3 reps/seconds before failure',
          masteryGoal: currentGoal,
          coachTips: [
            `${currentGoal} progression: ${progression.description}`,
            'Focus on perfect form, not maximum effort',
          ],
        });
      }
    }

    return exercises;
  }

  /**
   * Get skill support exercises (Pseudo Planche Push-ups, etc.)
   */
  private getSkillSupportExercises(sessionType: SessionType): RoutineExercise[] {
    // These are dynamic exercises that build strength for specific skills
    const exercises: RoutineExercise[] = [];

    if (sessionType === 'SKILLS_PUSH' || sessionType === 'PUSH') {
      // Pseudo Planche Push-ups for Planche
      const pppu = this.exerciseDatabase.find(ex =>
        ex.name.toLowerCase().includes('pseudo planche') ||
        ex.name.toLowerCase().includes('planche push')
      );

      if (pppu) {
        exercises.push(this.mapToRoutineExercise(pppu, 'MODE_2_STRENGTH'));
      }

      // Pike Push-ups for HSPU
      const pikePushup = this.exerciseDatabase.find(ex =>
        ex.name.toLowerCase().includes('pike push')
      );

      if (pikePushup) {
        exercises.push(this.mapToRoutineExercise(pikePushup, 'MODE_2_STRENGTH'));
      }
    }

    if (sessionType === 'SKILLS_PULL' || sessionType === 'PULL') {
      // Archer Pull-ups for OAP
      const archerPullup = this.exerciseDatabase.find(ex =>
        ex.name.toLowerCase().includes('archer pull')
      );

      if (archerPullup) {
        exercises.push(this.mapToRoutineExercise(archerPullup, 'MODE_2_STRENGTH'));
      }
    }

    return exercises.slice(0, 2);
  }

  /**
   * Get fundamental strength exercises for Stage 4
   */
  private getFundamentalStrengthExercises(sessionType: SessionType): RoutineExercise[] {
    // Same as weighted exercises
    return this.getWeightedExercises(sessionType);
  }

  /**
   * Get core exercises
   */
  private getCoreExercises(): RoutineExercise[] {
    const coreExs = this.findAppropriateExercises('CORE', 2);
    return coreExs.map(ex => this.mapToRoutineExercise(ex, 'MODE_2_STRENGTH'));
  }

  /**
   * Get accessory exercises
   */
  private getAccessoryExercises(sessionType: SessionType): RoutineExercise[] {
    const category = sessionType === 'PUSH' ? 'PUSH' : sessionType === 'PULL' ? 'PULL' : 'CORE';
    const exercises = this.findAppropriateExercises(category, 2);
    return exercises.map(ex => this.mapToRoutineExercise(ex, 'MODE_2_STRENGTH'));
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Find appropriate exercises from database
   */
  private findAppropriateExercises(category: string, count: number): DatabaseExercise[] {
    const filtered = this.exerciseDatabase.filter(ex => {
      // Match category
      if (ex.category !== category) return false;

      // Check difficulty is appropriate (within 1 level)
      if (!this.isAppropriateLevel(ex.difficulty)) return false;

      // Check equipment
      if (!this.hasRequiredEquipment(ex.equipment)) return false;

      return true;
    });

    // Shuffle and take
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Map database exercise to routine exercise
   */
  private mapToRoutineExercise(dbEx: DatabaseExercise, mode: TrainingMode): RoutineExercise {
    const sets = this.getSetsForMode(mode, dbEx.difficulty);
    const reps = dbEx.unit === 'reps' ? this.getRepsForMode(mode, dbEx.difficulty) : undefined;
    const duration = dbEx.unit === 'seconds' ? this.getDurationForMode(mode, dbEx.difficulty) : undefined;
    const rest = this.getRestForMode(mode, dbEx.difficulty);

    return {
      id: dbEx.id,
      name: dbEx.name,
      category: dbEx.category,
      difficulty: dbEx.difficulty,
      mode,
      sets,
      reps,
      duration,
      rest,
    };
  }

  /**
   * Check if difficulty is appropriate for user
   */
  private isAppropriateLevel(exerciseDifficulty: DifficultyLevel): boolean {
    const levels: DifficultyLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'];
    const userLevelIndex = levels.indexOf(this.config.level);
    const exerciseLevelIndex = levels.indexOf(exerciseDifficulty);

    // Include exercises at user's level and one level below/above
    return Math.abs(userLevelIndex - exerciseLevelIndex) <= 1;
  }

  /**
   * Check equipment availability
   */
  private hasRequiredEquipment(required: string[]): boolean {
    if (required.includes('NONE') || required.length === 0) return true;
    return required.some(eq => this.config.equipment.includes(eq));
  }

  /**
   * Get sets based on mode
   */
  private getSetsForMode(mode: TrainingMode, difficulty: DifficultyLevel): number {
    if (mode === 'MODE_1_SKILL') {
      // More sets for skill practice (5-6 sets)
      return 5;
    } else {
      // Mode 2: Fewer sets to failure (3-4 sets)
      return difficulty === 'ELITE' ? 4 : 3;
    }
  }

  /**
   * Get reps based on mode
   */
  private getRepsForMode(mode: TrainingMode, difficulty: DifficultyLevel): number {
    if (mode === 'MODE_1_SKILL') {
      // Skill practice: Lower reps with buffer
      return difficulty === 'BEGINNER' ? 5 : 3;
    } else {
      // Strength: To failure
      switch (difficulty) {
        case 'BEGINNER': return 12;
        case 'INTERMEDIATE': return 10;
        case 'ADVANCED': return 8;
        case 'ELITE': return 6;
        default: return 10;
      }
    }
  }

  /**
   * Get duration based on mode (for isometric holds)
   */
  private getDurationForMode(mode: TrainingMode, difficulty: DifficultyLevel): number {
    if (mode === 'MODE_1_SKILL') {
      // Skill holds: Shorter with buffer
      return this.getSkillHoldDuration(difficulty);
    } else {
      // Strength holds: To failure
      switch (difficulty) {
        case 'BEGINNER': return 30;
        case 'INTERMEDIATE': return 40;
        case 'ADVANCED': return 50;
        case 'ELITE': return 60;
        default: return 40;
      }
    }
  }

  /**
   * Get skill-specific hold duration
   */
  private getSkillHoldDuration(difficulty: DifficultyLevel): number {
    // For skills, we want 5-15 second holds with buffer
    switch (difficulty) {
      case 'BEGINNER': return 10;
      case 'INTERMEDIATE': return 8;
      case 'ADVANCED': return 6;
      case 'ELITE': return 5;
      default: return 8;
    }
  }

  /**
   * Get skill-specific reps
   */
  private getSkillReps(difficulty: DifficultyLevel): number {
    // Lower reps for skill practice
    return difficulty === 'BEGINNER' ? 5 : 3;
  }

  /**
   * Get rest based on mode
   */
  private getRestForMode(mode: TrainingMode, difficulty: DifficultyLevel): number {
    if (mode === 'MODE_1_SKILL') {
      // Longer rest for neural recovery (90-180s)
      return 120;
    } else {
      // Standard rest for strength (60-180s)
      switch (difficulty) {
        case 'BEGINNER': return 60;
        case 'INTERMEDIATE': return 90;
        case 'ADVANCED': return 120;
        case 'ELITE': return 180;
        default: return 90;
      }
    }
  }

  /**
   * Get day name
   */
  private getDayName(index: number): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[index] || `Day ${index + 1}`;
  }
}

/**
 * Helper function to generate routine
 */
export function generateRoutineV3(
  config: RoutineConfig,
  exerciseDatabase: DatabaseExercise[]
): WorkoutRoutine[] {
  const generator = new RoutineGeneratorV3(config, exerciseDatabase);
  return generator.generate();
}
