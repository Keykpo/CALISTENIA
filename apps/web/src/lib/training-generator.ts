/**
 * Dynamic Training Session Generator
 *
 * Generates personalized workout sessions based on:
 * - Skill branch (HANDSTAND, PLANCHE, etc.)
 * - User's current level (BEGINNER, INTERMEDIATE, ADVANCED, ELITE)
 * - Training duration (10-120 minutes)
 *
 * The generator dynamically adapts the workout structure to fit any duration:
 * - Short sessions (10-30 min): Focus on core skill work only
 * - Medium sessions (40-70 min): Skill + supporting strength + light conditioning
 * - Long sessions (80-120 min): Comprehensive training with all phases
 */

import { MasteryGoal, DifficultyLevel, getProgressionForLevel } from './fig-level-progressions';

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  holdTime?: number; // in seconds
  restTime: number; // in seconds
  description: string;
}

export interface SessionPhase {
  phase: string;
  minutes: number;
  exercises: Exercise[];
}

export interface TrainingSessionData {
  skillBranch: MasteryGoal;
  userLevel: DifficultyLevel;
  duration: number;
  phases: SessionPhase[];
  totalExercises: number;
}

interface PhaseAllocation {
  warmup: number;
  skill: number;
  strength: number;
  conditioning?: number;
  cooldown: number;
  stretch: number;
}

/**
 * Calculate phase allocation based on duration
 */
function calculatePhaseAllocation(duration: number): PhaseAllocation {
  // For very short sessions (10-30 min), skip conditioning
  if (duration <= 30) {
    return {
      warmup: Math.round(duration * 0.08),
      skill: Math.round(duration * 0.55),
      strength: Math.round(duration * 0.20),
      cooldown: Math.round(duration * 0.08),
      stretch: Math.round(duration * 0.09),
    };
  }

  // Standard allocation for 31-120 min
  return {
    warmup: Math.round(duration * 0.08),
    skill: Math.round(duration * 0.40),
    strength: Math.round(duration * 0.25),
    conditioning: Math.round(duration * 0.12),
    cooldown: Math.round(duration * 0.08),
    stretch: Math.round(duration * 0.07),
  };
}

/**
 * Calculate exercise count per phase based on duration
 */
function calculateExerciseCount(duration: number, phase: string): number {
  const baseCounts: Record<string, number> = {
    warmup: Math.max(1, Math.ceil(duration / 20)),
    skill: Math.max(2, Math.ceil(duration / 12)),
    strength: Math.max(2, Math.ceil(duration / 15)),
    conditioning: Math.max(2, Math.ceil(duration / 20)),
    cooldown: Math.max(1, Math.ceil(duration / 30)),
    stretch: Math.max(2, Math.ceil(duration / 25)),
  };

  return baseCounts[phase] || 3;
}

/**
 * Get duration category label
 */
export function getDurationCategory(duration: number): {
  label: string;
  icon: string;
  description: string;
} {
  if (duration <= 20) {
    return {
      label: 'Quick Session',
      icon: '⚡',
      description: 'Core exercises only',
    };
  }
  if (duration <= 40) {
    return {
      label: 'Standard Session',
      icon: '🎯',
      description: 'Skill + light strength work',
    };
  }
  if (duration <= 70) {
    return {
      label: 'Extended Session',
      icon: '💪',
      description: 'Full progression + conditioning',
    };
  }
  return {
    label: 'Intense Session',
    icon: '🔥',
    description: 'Complete training + advanced work',
  };
}

/**
 * Generate warmup exercises based on skill branch
 */
function generateWarmupExercises(
  skillBranch: MasteryGoal,
  count: number
): Exercise[] {
  const exercises: Exercise[] = [];

  // Always include general warmup
  exercises.push({
    name: 'Joint Rotations',
    reps: 10,
    restTime: 0,
    description: 'Wrist, shoulder, hip circles - 10 reps each direction',
  });

  if (count >= 2) {
    // Add skill-specific warmup
    if (['HANDSTAND', 'RINGS_HANDSTAND', 'PRESS_HANDSTAND', 'STRAIGHT_ARM_PRESS'].includes(skillBranch)) {
      exercises.push({
        name: 'Wrist Preparation',
        reps: 15,
        restTime: 30,
        description: 'Wrist push-ups and stretches to prep for hand balancing',
      });
    } else if (['PLANCHE', 'FRONT_LEVER', 'BACK_LEVER'].includes(skillBranch)) {
      exercises.push({
        name: 'Scapular Activation',
        reps: 12,
        restTime: 30,
        description: 'Scapular pull-ups and push-ups for shoulder stability',
      });
    } else {
      exercises.push({
        name: 'Light Cardio',
        holdTime: 120,
        restTime: 30,
        description: 'Jumping jacks or light jogging in place',
      });
    }
  }

  if (count >= 3) {
    exercises.push({
      name: 'Dynamic Stretching',
      reps: 10,
      restTime: 30,
      description: 'Leg swings, arm circles, torso twists',
    });
  }

  if (count >= 4) {
    exercises.push({
      name: 'Hollow Body Hold',
      holdTime: 20,
      restTime: 30,
      description: 'Core activation and body tension practice',
    });
  }

  return exercises.slice(0, count);
}

/**
 * Generate skill-specific exercises based on progression
 */
function generateSkillExercises(
  skillBranch: MasteryGoal,
  userLevel: DifficultyLevel,
  count: number
): Exercise[] {
  const progression = getProgressionForLevel(skillBranch, userLevel);
  const exercises: Exercise[] = [];

  if (!progression) {
    // Fallback exercises
    return [{
      name: `${skillBranch} Practice`,
      sets: 3,
      reps: 5,
      restTime: 120,
      description: 'Work on your current progression level',
    }];
  }

  // Generate exercises based on the progression description
  const skillName = skillBranch.replace(/_/g, ' ').toLowerCase();
  const levelDescriptor = progression.description.split('-')[0].trim();

  // Primary skill exercise
  exercises.push({
    name: `${levelDescriptor}`,
    sets: Math.min(3 + Math.floor(count / 3), 6),
    holdTime: userLevel === 'BEGINNER' ? 10 : userLevel === 'INTERMEDIATE' ? 20 : 30,
    restTime: 90,
    description: progression.description,
  });

  if (count >= 2) {
    // Add volume work
    exercises.push({
      name: `${levelDescriptor} - Volume Sets`,
      sets: 4,
      reps: 3,
      restTime: 60,
      description: `Multiple sets with reduced hold time for volume`,
    });
  }

  if (count >= 3) {
    // Add progression work (easier variation for volume)
    exercises.push({
      name: `Regression Practice`,
      sets: 3,
      reps: 5,
      restTime: 60,
      description: 'Easier variation for additional volume and technique refinement',
    });
  }

  if (count >= 4) {
    // Add advanced work (harder variation)
    exercises.push({
      name: `Progression Challenge`,
      sets: 2,
      reps: 3,
      restTime: 120,
      description: 'Work toward next level progression',
    });
  }

  if (count >= 5) {
    // Add dynamic transitions
    exercises.push({
      name: `${skillName} Transitions`,
      sets: 3,
      reps: 4,
      restTime: 90,
      description: 'Entry and exit drills for the skill',
    });
  }

  if (count >= 6) {
    // Add endurance holds
    exercises.push({
      name: `Endurance Hold`,
      sets: 3,
      holdTime: userLevel === 'ELITE' ? 45 : 30,
      restTime: 120,
      description: 'Extended holds at current level for endurance',
    });
  }

  return exercises.slice(0, count);
}

/**
 * Generate strength exercises based on skill branch
 */
function generateStrengthExercises(
  skillBranch: MasteryGoal,
  userLevel: DifficultyLevel,
  count: number
): Exercise[] {
  const exercises: Exercise[] = [];

  // Determine primary strength movement based on skill
  if (['HANDSTAND', 'RINGS_HANDSTAND', 'PRESS_HANDSTAND', 'HANDSTAND_PUSHUP'].includes(skillBranch)) {
    exercises.push({
      name: 'Pike Push-ups',
      sets: 4,
      reps: userLevel === 'BEGINNER' ? 8 : 12,
      restTime: 90,
      description: 'Build overhead pressing strength',
    });
  } else if (['PLANCHE', 'DIPS', 'RING_DIPS'].includes(skillBranch)) {
    exercises.push({
      name: 'Parallel Bar Dips',
      sets: 4,
      reps: userLevel === 'BEGINNER' ? 6 : 10,
      restTime: 90,
      description: 'Build pushing strength and shoulder stability',
    });
  } else if (['FRONT_LEVER', 'BACK_LEVER', 'PULL_UPS', 'ONE_ARM_PULL_UP', 'MUSCLE_UP'].includes(skillBranch)) {
    exercises.push({
      name: 'Pull-ups',
      sets: 4,
      reps: userLevel === 'BEGINNER' ? 5 : 8,
      restTime: 90,
      description: 'Build pulling strength',
    });
  } else if (skillBranch === 'PISTOL_SQUAT') {
    exercises.push({
      name: 'Bulgarian Split Squats',
      sets: 4,
      reps: 10,
      restTime: 60,
      description: 'Build single-leg strength',
    });
  } else {
    exercises.push({
      name: 'Push-ups',
      sets: 4,
      reps: 12,
      restTime: 60,
      description: 'General pushing strength',
    });
  }

  if (count >= 2) {
    // Add secondary strength
    exercises.push({
      name: 'Rows',
      sets: 3,
      reps: 10,
      restTime: 60,
      description: 'Horizontal pulling for balanced development',
    });
  }

  if (count >= 3) {
    // Add core work
    exercises.push({
      name: 'Hanging Leg Raises',
      sets: 3,
      reps: 8,
      restTime: 60,
      description: 'Core strength for body control',
    });
  }

  if (count >= 4) {
    // Add accessory work
    exercises.push({
      name: 'Plank Hold',
      sets: 3,
      holdTime: 45,
      restTime: 45,
      description: 'Core stability and body tension',
    });
  }

  if (count >= 5) {
    exercises.push({
      name: 'Scapular Strength',
      sets: 3,
      reps: 12,
      restTime: 45,
      description: 'Scapular push-ups or pull-ups for shoulder health',
    });
  }

  return exercises.slice(0, count);
}

/**
 * Generate conditioning exercises
 */
function generateConditioningExercises(count: number): Exercise[] {
  const exercises: Exercise[] = [
    {
      name: 'Burpees',
      sets: 3,
      reps: 10,
      restTime: 60,
      description: 'Full body conditioning',
    },
  ];

  if (count >= 2) {
    exercises.push({
      name: 'Jump Squats',
      sets: 3,
      reps: 15,
      restTime: 60,
      description: 'Explosive leg power',
    });
  }

  if (count >= 3) {
    exercises.push({
      name: 'Mountain Climbers',
      sets: 3,
      reps: 20,
      restTime: 45,
      description: 'Core and cardio conditioning',
    });
  }

  return exercises.slice(0, count);
}

/**
 * Generate cooldown exercises
 */
function generateCooldownExercises(count: number): Exercise[] {
  const exercises: Exercise[] = [
    {
      name: 'Light Cardio',
      holdTime: 120,
      restTime: 0,
      description: 'Walking or very light jogging to bring heart rate down',
    },
  ];

  if (count >= 2) {
    exercises.push({
      name: 'Deep Breathing',
      reps: 10,
      restTime: 0,
      description: 'Deep belly breaths for recovery',
    });
  }

  return exercises.slice(0, count);
}

/**
 * Generate stretch exercises
 */
function generateStretchExercises(
  skillBranch: MasteryGoal,
  count: number
): Exercise[] {
  const exercises: Exercise[] = [];

  if (['HANDSTAND', 'RINGS_HANDSTAND', 'PRESS_HANDSTAND'].includes(skillBranch)) {
    exercises.push({
      name: 'Wrist Stretch',
      holdTime: 30,
      restTime: 0,
      description: 'Gentle wrist stretches in all directions',
    });
  } else {
    exercises.push({
      name: 'Shoulder Stretch',
      holdTime: 30,
      restTime: 0,
      description: 'Shoulder and chest stretches',
    });
  }

  if (count >= 2) {
    exercises.push({
      name: 'Hip Flexor Stretch',
      holdTime: 30,
      restTime: 0,
      description: 'Lunge position hip flexor stretch each side',
    });
  }

  if (count >= 3) {
    exercises.push({
      name: 'Hamstring Stretch',
      holdTime: 30,
      restTime: 0,
      description: 'Forward fold or seated hamstring stretch',
    });
  }

  if (count >= 4) {
    exercises.push({
      name: 'Spinal Twist',
      holdTime: 30,
      restTime: 0,
      description: 'Seated or lying spinal twist each side',
    });
  }

  return exercises.slice(0, count);
}

/**
 * Generate a complete training session
 */
export function generateTrainingSession(
  skillBranch: MasteryGoal,
  userLevel: DifficultyLevel,
  duration: number
): TrainingSessionData {
  const allocation = calculatePhaseAllocation(duration);
  const phases: SessionPhase[] = [];

  // Warmup
  phases.push({
    phase: 'Warmup',
    minutes: allocation.warmup,
    exercises: generateWarmupExercises(
      skillBranch,
      calculateExerciseCount(duration, 'warmup')
    ),
  });

  // Skill work (primary focus)
  phases.push({
    phase: 'Skill Practice',
    minutes: allocation.skill,
    exercises: generateSkillExercises(
      skillBranch,
      userLevel,
      calculateExerciseCount(duration, 'skill')
    ),
  });

  // Strength work
  phases.push({
    phase: 'Strength Training',
    minutes: allocation.strength,
    exercises: generateStrengthExercises(
      skillBranch,
      userLevel,
      calculateExerciseCount(duration, 'strength')
    ),
  });

  // Conditioning (only for longer sessions)
  if (allocation.conditioning) {
    phases.push({
      phase: 'Conditioning',
      minutes: allocation.conditioning,
      exercises: generateConditioningExercises(
        calculateExerciseCount(duration, 'conditioning')
      ),
    });
  }

  // Cooldown
  phases.push({
    phase: 'Cooldown',
    minutes: allocation.cooldown,
    exercises: generateCooldownExercises(
      calculateExerciseCount(duration, 'cooldown')
    ),
  });

  // Stretching
  phases.push({
    phase: 'Stretching',
    minutes: allocation.stretch,
    exercises: generateStretchExercises(
      skillBranch,
      calculateExerciseCount(duration, 'stretch')
    ),
  });

  const totalExercises = phases.reduce(
    (sum, phase) => sum + phase.exercises.length,
    0
  );

  return {
    skillBranch,
    userLevel,
    duration,
    phases,
    totalExercises,
  };
}
