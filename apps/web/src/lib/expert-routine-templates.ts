/**
 * EXPERT ROUTINE TEMPLATES
 *
 * Based on "El Ecosistema de la Calistenia" PDF - Professional Training Architecture
 *
 * Core Principles:
 * - MODE 1 (Buffer): Quality practice for skills (stay 2-3 reps from failure)
 * - MODE 2 (Failure): Strength building (train to or near failure)
 * - Stage 1-2: 100% Mode 2, NO skills
 * - Stage 3-4: Bifurcated training (Mode 1 skills + Mode 2 strength)
 * - Mandatory joint-specific warmups BEFORE every session
 */

export type TrainingMode = 'BUFFER' | 'FAILURE';
export type UserStage = 'STAGE_1' | 'STAGE_2' | 'STAGE_3' | 'STAGE_4';
export type SessionType = 'PUSH' | 'PULL' | 'LEGS' | 'SKILLS_PUSH' | 'SKILLS_PULL' | 'FULL_BODY';

/**
 * SESSION ANATOMY (5 SECTIONS)
 * From PDF Part IV-C: "Anatomía de una Sesión de Etapa 4"
 */
export interface ExpertRoutineSection {
  section: 'WARMUP' | 'SKILL_PRACTICE' | 'SKILL_SUPPORT' | 'FUNDAMENTAL_STRENGTH' | 'COOLDOWN';
  duration: number; // minutes
  exercises: Array<{
    name: string;
    sets: number;
    repsOrTime: number | string;
    rest: number;
    mode: TrainingMode;
    notes: string;
  }>;
  purpose: string;
}

export interface ExpertRoutine {
  stage: UserStage;
  sessionType: SessionType;
  totalDuration: number;
  sections: ExpertRoutineSection[];
  philosophy: string;
}

/**
 * MANDATORY JOINT-SPECIFIC WARMUPS
 * From PDF Part I-C: "Acondicionamiento de Tejidos"
 */
export const WRIST_WARMUP_PROTOCOL = {
  exercises: [
    {
      name: 'Wrist Circles',
      repsOrTime: '10 each direction',
      notes: 'Mandatory before any push training - wrists are most injury-prone'
    },
    {
      name: 'Wrist Flexion Tilts',
      repsOrTime: '10 reps',
      notes: 'Palm down, fingers back, lean back'
    },
    {
      name: 'Palm Push-ups',
      repsOrTime: '8 reps',
      notes: 'Lift palm leaving fingers on floor - strengthening'
    },
    {
      name: 'Finger Push-ups',
      repsOrTime: '8 reps',
      notes: 'Lift fingers leaving palm on floor'
    }
  ],
  duration: 5,
  purpose: 'Prevent wrist injuries in Planche/Handstand training'
};

export const SHOULDER_WARMUP_PROTOCOL = {
  exercises: [
    {
      name: 'Shoulder Rotations',
      repsOrTime: '10 each direction',
      notes: 'Full range of motion'
    },
    {
      name: 'Arm Circles with Band',
      repsOrTime: '10 each direction',
      notes: 'Use resistance band or stick'
    },
    {
      name: 'Scapula Pull-ups',
      repsOrTime: '8 reps',
      notes: 'Activation: Depression and retraction practice'
    },
    {
      name: 'Scapula Push-ups',
      repsOrTime: '8 reps',
      notes: 'Activation: Protraction practice'
    }
  ],
  duration: 5,
  purpose: 'Scapular control is neurological command center for upper body'
};

/**
 * STAGE 1: FOUNDATION (BEGINNER)
 *
 * Entry Requirement: Cannot do pull-ups or dips unassisted
 * Focus: Master Pillars 1 & 2 (Push and Pull fundamentals)
 * Philosophy: "Reps till failure" (Mode 2) to build base capacity
 * NO SKILLS PHASE - Only strength fundamentals
 */
export const STAGE_1_PUSH_DAY: ExpertRoutine = {
  stage: 'STAGE_1',
  sessionType: 'PUSH',
  totalDuration: 45,
  philosophy: '100% Mode 2 (Failure) - Building the motor. NO skills yet.',
  sections: [
    {
      section: 'WARMUP',
      duration: 10,
      purpose: 'Joint preparation and injury prevention',
      exercises: [
        ...WRIST_WARMUP_PROTOCOL.exercises.map(e => ({
          ...e,
          sets: 2,
          repsOrTime: e.repsOrTime,
          rest: 30,
          mode: 'BUFFER' as TrainingMode,
          notes: e.notes
        })),
        ...SHOULDER_WARMUP_PROTOCOL.exercises.slice(0, 2).map(e => ({
          ...e,
          sets: 2,
          repsOrTime: e.repsOrTime,
          rest: 30,
          mode: 'BUFFER' as TrainingMode,
          notes: e.notes
        }))
      ]
    },
    {
      section: 'FUNDAMENTAL_STRENGTH',
      duration: 30,
      purpose: 'Build push strength capacity (Mode 2 - to failure)',
      exercises: [
        {
          name: 'Incline Push-ups',
          sets: 3,
          repsOrTime: 'To failure',
          rest: 90,
          mode: 'FAILURE',
          notes: 'Use high bar/surface. Go until you cannot do one more rep with good form.'
        },
        {
          name: 'Negative Dips',
          sets: 3,
          repsOrTime: '5 slow',
          rest: 120,
          mode: 'FAILURE',
          notes: '5 second descent. Use assistance to get to top, then control the descent.'
        },
        {
          name: 'Plank Hold',
          sets: 3,
          repsOrTime: '30-45s',
          rest: 60,
          mode: 'FAILURE',
          notes: 'Hollow body position. Hold until form breaks.'
        },
        {
          name: 'Scapula Push-ups',
          sets: 3,
          repsOrTime: '12 reps',
          rest: 60,
          mode: 'FAILURE',
          notes: 'Learn protraction - essential for future Planche'
        }
      ]
    },
    {
      section: 'COOLDOWN',
      duration: 5,
      purpose: 'Recovery and flexibility',
      exercises: [
        {
          name: 'Chest Doorway Stretch',
          sets: 2,
          repsOrTime: '45s each side',
          rest: 30,
          mode: 'BUFFER',
          notes: 'Static stretching. Breathe deeply.'
        },
        {
          name: 'Shoulder Circles',
          sets: 2,
          repsOrTime: '10 each direction',
          rest: 0,
          mode: 'BUFFER',
          notes: 'Gentle mobility to finish'
        }
      ]
    }
  ]
};

export const STAGE_1_PULL_DAY: ExpertRoutine = {
  stage: 'STAGE_1',
  sessionType: 'PULL',
  totalDuration: 45,
  philosophy: '100% Mode 2 (Failure) - Building the motor. NO skills yet.',
  sections: [
    {
      section: 'WARMUP',
      duration: 10,
      purpose: 'Joint preparation and injury prevention',
      exercises: [
        ...SHOULDER_WARMUP_PROTOCOL.exercises.map(e => ({
          ...e,
          sets: 2,
          repsOrTime: e.repsOrTime,
          rest: 30,
          mode: 'BUFFER' as TrainingMode,
          notes: e.notes
        }))
      ]
    },
    {
      section: 'FUNDAMENTAL_STRENGTH',
      duration: 30,
      purpose: 'Build pull strength capacity (Mode 2 - to failure)',
      exercises: [
        {
          name: 'Negative Pull-ups',
          sets: 3,
          repsOrTime: '5 slow',
          rest: 120,
          mode: 'FAILURE',
          notes: '5-8 second descent. Use box to get to top, then control the descent. Most important exercise for beginners.'
        },
        {
          name: 'Assisted Pull-ups (Band)',
          sets: 3,
          repsOrTime: 'To failure',
          rest: 120,
          mode: 'FAILURE',
          notes: 'Use band assistance. Go until you cannot do one more rep.'
        },
        {
          name: 'Dead Hang',
          sets: 3,
          repsOrTime: '20-30s',
          rest: 90,
          mode: 'FAILURE',
          notes: 'Build grip and tendon strength. Shoulders active (depressed).'
        },
        {
          name: 'Scapula Pulls',
          sets: 3,
          repsOrTime: '10 reps',
          rest: 60,
          mode: 'FAILURE',
          notes: 'Learn depression and retraction. Foundation for all pulling.'
        }
      ]
    },
    {
      section: 'COOLDOWN',
      duration: 5,
      purpose: 'Recovery and flexibility',
      exercises: [
        {
          name: 'Hanging Shoulder Stretch',
          sets: 2,
          repsOrTime: '30s',
          rest: 30,
          mode: 'BUFFER',
          notes: 'Gentle hang, let shoulders relax'
        },
        {
          name: 'Lat Stretch',
          sets: 2,
          repsOrTime: '45s each side',
          rest: 0,
          mode: 'BUFFER',
          notes: 'Reach overhead and lean to side'
        }
      ]
    }
  ]
};

/**
 * STAGE 4: ELITE (SKILL SPECIALIZATION)
 *
 * Entry Requirement: Elite weighted strength (10+ pull-ups +25% BW, 10+ dips +40% BW)
 * Focus: BIFURCATED TRAINING - Skills (Mode 1) + Weighted Strength (Mode 2)
 * Philosophy: "Quality practice" for skills, "brutal strength" for fundamentals
 */
export const STAGE_4_SKILLS_PUSH_WEIGHTED: ExpertRoutine = {
  stage: 'STAGE_4',
  sessionType: 'SKILLS_PUSH',
  totalDuration: 70,
  philosophy: 'Bifurcated: Skills (Mode 1 buffer) + Weighted Strength (Mode 2 failure)',
  sections: [
    {
      section: 'WARMUP',
      duration: 10,
      purpose: 'MANDATORY joint-specific prep for Planche work',
      exercises: [
        {
          name: 'Wrist Mobility Complex',
          sets: 1,
          repsOrTime: '5 min',
          rest: 0,
          mode: 'BUFFER',
          notes: 'MANDATORY: Circles, tilts, palm/finger push-ups. Wrists are most injury-prone joint.'
        },
        {
          name: 'Scapula Protraction Activation',
          sets: 3,
          repsOrTime: '10 reps',
          rest: 30,
          mode: 'BUFFER',
          notes: 'Scapula push-ups. Essential for Planche - activate serratus anterior.'
        },
        {
          name: 'Planche Leans (warmup)',
          sets: 2,
          repsOrTime: '15s',
          rest: 60,
          mode: 'BUFFER',
          notes: 'Light leans to prepare nervous system for skill work'
        }
      ]
    },
    {
      section: 'SKILL_PRACTICE',
      duration: 25,
      purpose: 'Motor learning (neurological) - Mode 1 with BUFFER',
      exercises: [
        {
          name: 'Straddle Planche Hold Practice',
          sets: 6,
          repsOrTime: '5-10s',
          rest: 180,
          mode: 'BUFFER',
          notes: 'MODE 1: Stay 2-3 reps from failure. Fresh nervous system = better learning. Focus on perfect protraction and body line.'
        },
        {
          name: 'Handstand Balance Practice',
          sets: 5,
          repsOrTime: '30s',
          rest: 180,
          mode: 'BUFFER',
          notes: 'MODE 1: Quality over quantity. Stop when balance degrades. Accumulate perfect reps.'
        }
      ]
    },
    {
      section: 'SKILL_SUPPORT',
      duration: 15,
      purpose: 'Specific skill strength (Mode 2 - near failure)',
      exercises: [
        {
          name: 'Pseudo Planche Push-ups',
          sets: 3,
          repsOrTime: '8-12 reps',
          rest: 120,
          mode: 'FAILURE',
          notes: 'MODE 2: Most specific Planche builder. Lean forward maximally, train hard.'
        },
        {
          name: 'Pike Push-ups (elevated)',
          sets: 3,
          repsOrTime: '10-12 reps',
          rest: 90,
          mode: 'FAILURE',
          notes: 'Building shoulder strength for HSPU path'
        }
      ]
    },
    {
      section: 'FUNDAMENTAL_STRENGTH',
      duration: 15,
      purpose: 'Maintain/build brute strength - Mode 2 (to failure)',
      exercises: [
        {
          name: 'Weighted Dips',
          sets: 3,
          repsOrTime: '8-10 reps',
          rest: 180,
          mode: 'FAILURE',
          notes: 'MODE 2: +40% bodyweight. This is your motor. Push to near failure.'
        },
        {
          name: 'Dumbbell Bench Press',
          sets: 2,
          repsOrTime: '8-10 reps',
          rest: 120,
          mode: 'FAILURE',
          notes: 'Optional hybrid exercise for maximum hypertrophy'
        }
      ]
    },
    {
      section: 'COOLDOWN',
      duration: 5,
      purpose: 'Recovery and flexibility',
      exercises: [
        {
          name: 'Wrist Stretches',
          sets: 2,
          repsOrTime: '60s',
          rest: 0,
          mode: 'BUFFER',
          notes: 'MANDATORY after Planche work. Prevent chronic injury.'
        },
        {
          name: 'Chest and Shoulder Stretches',
          sets: 2,
          repsOrTime: '45s each',
          rest: 30,
          mode: 'BUFFER',
          notes: 'Static stretching, deep breathing'
        }
      ]
    }
  ]
};

export const STAGE_4_SKILLS_PULL_WEIGHTED: ExpertRoutine = {
  stage: 'STAGE_4',
  sessionType: 'SKILLS_PULL',
  totalDuration: 70,
  philosophy: 'Bifurcated: Skills (Mode 1 buffer) + Weighted Strength (Mode 2 failure)',
  sections: [
    {
      section: 'WARMUP',
      duration: 10,
      purpose: 'Joint-specific prep for Front Lever work',
      exercises: [
        {
          name: 'Shoulder Mobility Complex',
          sets: 1,
          repsOrTime: '5 min',
          rest: 0,
          mode: 'BUFFER',
          notes: 'Rotations, arm circles, doorway stretch. Prepare shoulders for lever stress.'
        },
        {
          name: 'Scapula Depression Activation',
          sets: 3,
          repsOrTime: '10 reps',
          rest: 30,
          mode: 'BUFFER',
          notes: 'Scapula pull-ups. Create "active shoulders" position - critical for levers.'
        },
        {
          name: 'German Hang',
          sets: 2,
          repsOrTime: '15s',
          rest: 60,
          mode: 'BUFFER',
          notes: 'Prep shoulder extension ROM for front lever'
        }
      ]
    },
    {
      section: 'SKILL_PRACTICE',
      duration: 25,
      purpose: 'Motor learning (neurological) - Mode 1 with BUFFER',
      exercises: [
        {
          name: 'Straddle Front Lever Hold Practice',
          sets: 6,
          repsOrTime: '8-12s',
          rest: 180,
          mode: 'BUFFER',
          notes: 'MODE 1: Stay fresh. 6 sets of quality practice beats 3 sets to failure. Lats + core tension.'
        },
        {
          name: 'One-Arm Pull-up Progressions',
          sets: 5,
          repsOrTime: '3-5 reps each',
          rest: 180,
          mode: 'BUFFER',
          notes: 'MODE 1: Archer pull-ups or assisted OAP. Perfect form, no failure.'
        }
      ]
    },
    {
      section: 'SKILL_SUPPORT',
      duration: 15,
      purpose: 'Specific skill strength (Mode 2)',
      exercises: [
        {
          name: 'Front Lever Raises (Tuck)',
          sets: 3,
          repsOrTime: '8-10 reps',
          rest: 120,
          mode: 'FAILURE',
          notes: 'Dynamic lever work - builds specific pulling strength'
        },
        {
          name: 'Dragon Flags',
          sets: 3,
          repsOrTime: '5 reps',
          rest: 90,
          mode: 'FAILURE',
          notes: 'Core anti-extension - necessary for front lever'
        }
      ]
    },
    {
      section: 'FUNDAMENTAL_STRENGTH',
      duration: 15,
      purpose: 'Maintain/build brute strength - Mode 2 (to failure)',
      exercises: [
        {
          name: 'Weighted Pull-ups',
          sets: 3,
          repsOrTime: '8-10 reps',
          rest: 180,
          mode: 'FAILURE',
          notes: 'MODE 2: +25-30% bodyweight. Your strength foundation. Push hard.'
        },
        {
          name: 'Barbell Rows (optional)',
          sets: 2,
          repsOrTime: '8-10 reps',
          rest: 120,
          mode: 'FAILURE',
          notes: 'Hybrid exercise for maximum back thickness'
        }
      ]
    },
    {
      section: 'COOLDOWN',
      duration: 5,
      purpose: 'Recovery and flexibility',
      exercises: [
        {
          name: 'Hanging Decompression',
          sets: 1,
          repsOrTime: '60s',
          rest: 0,
          mode: 'BUFFER',
          notes: 'Let spine decompress, shoulders relax'
        },
        {
          name: 'Lat and Shoulder Stretches',
          sets: 2,
          repsOrTime: '45s each',
          rest: 30,
          mode: 'BUFFER',
          notes: 'Static stretching, deep breathing'
        }
      ]
    }
  ]
};

/**
 * STAGE 2: INTERMEDIATE (CONSOLIDATION)
 *
 * Entry Requirement: Can do 1-12 pull-ups and 1-15 dips
 * Focus: Increase volume on Pillars 1 & 2, introduce Legs and Core, intro Handstand (wall)
 * Philosophy: Continue "reps till failure" to maximize strength
 * Still NO advanced skills - only wall handstand intro
 */
export const STAGE_2_PUSH_DAY: ExpertRoutine = {
  stage: 'STAGE_2',
  sessionType: 'PUSH',
  totalDuration: 50,
  philosophy: 'Mode 2 (Failure) with higher volume. Introduce wall handstand for balance.',
  sections: [
    {
      section: 'WARMUP',
      duration: 10,
      purpose: 'Joint preparation',
      exercises: [
        {
          name: 'Wrist Mobility',
          sets: 2,
          repsOrTime: '5 min total',
          rest: 0,
          mode: 'BUFFER',
          notes: 'Full wrist warmup protocol - mandatory'
        },
        {
          name: 'Shoulder Activation',
          sets: 2,
          repsOrTime: '8 reps each',
          rest: 30,
          mode: 'BUFFER',
          notes: 'Scapula push-ups and circles'
        }
      ]
    },
    {
      section: 'FUNDAMENTAL_STRENGTH',
      duration: 35,
      purpose: 'Increase volume on push fundamentals (Mode 2)',
      exercises: [
        {
          name: 'Regular Push-ups',
          sets: 4,
          repsOrTime: 'To failure (8-15)',
          rest: 90,
          mode: 'FAILURE',
          notes: 'Full range, hollow body form. Train to failure.'
        },
        {
          name: 'Parallel Bar Dips',
          sets: 4,
          repsOrTime: 'To failure (4-12)',
          rest: 120,
          mode: 'FAILURE',
          notes: 'Full range. Shoulders depressed. If need band assist, use it.'
        },
        {
          name: 'Diamond Push-ups',
          sets: 3,
          repsOrTime: '8-12 reps',
          rest: 90,
          mode: 'FAILURE',
          notes: 'Tricep emphasis'
        },
        {
          name: 'Wall Handstand Hold (chest to wall)',
          sets: 3,
          repsOrTime: '30-45s',
          rest: 120,
          mode: 'BUFFER',
          notes: 'Introduction to inversion. Teaches correct hollow body line and shoulder alignment.'
        },
        {
          name: 'Plank to Failure',
          sets: 3,
          repsOrTime: '45-60s',
          rest: 60,
          mode: 'FAILURE',
          notes: 'Core endurance'
        }
      ]
    },
    {
      section: 'COOLDOWN',
      duration: 5,
      purpose: 'Recovery',
      exercises: [
        {
          name: 'Chest and Shoulder Stretches',
          sets: 2,
          repsOrTime: '60s',
          rest: 0,
          mode: 'BUFFER',
          notes: 'Static stretching'
        }
      ]
    }
  ]
};

export const STAGE_2_PULL_DAY: ExpertRoutine = {
  stage: 'STAGE_2',
  sessionType: 'PULL',
  totalDuration: 50,
  philosophy: 'Mode 2 (Failure) with higher volume. Master clean pull-ups.',
  sections: [
    {
      section: 'WARMUP',
      duration: 10,
      purpose: 'Joint preparation',
      exercises: [
        {
          name: 'Shoulder Mobility and Activation',
          sets: 2,
          repsOrTime: '5 min total',
          rest: 0,
          mode: 'BUFFER',
          notes: 'Scapula pulls, circles, activation'
        }
      ]
    },
    {
      section: 'FUNDAMENTAL_STRENGTH',
      duration: 35,
      purpose: 'Increase volume on pull fundamentals (Mode 2)',
      exercises: [
        {
          name: 'Pull-ups (Clean Form)',
          sets: 4,
          repsOrTime: 'To failure (5-12)',
          rest: 150,
          mode: 'FAILURE',
          notes: 'Supinated or pronated grip. Full range. Train to failure.'
        },
        {
          name: 'Chin-ups',
          sets: 3,
          repsOrTime: 'To failure (5-10)',
          rest: 120,
          mode: 'FAILURE',
          notes: 'Bicep emphasis variant'
        },
        {
          name: 'Aussie Pull-ups (Horizontal Rows)',
          sets: 4,
          repsOrTime: '12-15 reps',
          rest: 90,
          mode: 'FAILURE',
          notes: 'Pull to chest. Scapular retraction at top.'
        },
        {
          name: 'L-Hang (bent legs)',
          sets: 3,
          repsOrTime: '15-30s',
          rest: 90,
          mode: 'FAILURE',
          notes: 'Introduction to L-sit path. Bent legs for now.'
        },
        {
          name: 'Dead Hang',
          sets: 2,
          repsOrTime: '45-60s',
          rest: 90,
          mode: 'FAILURE',
          notes: 'Build grip endurance'
        }
      ]
    },
    {
      section: 'COOLDOWN',
      duration: 5,
      purpose: 'Recovery',
      exercises: [
        {
          name: 'Lat and Shoulder Stretches',
          sets: 2,
          repsOrTime: '60s',
          rest: 0,
          mode: 'BUFFER',
          notes: 'Static stretching'
        }
      ]
    }
  ]
};

export const STAGE_2_LEGS_DAY: ExpertRoutine = {
  stage: 'STAGE_2',
  sessionType: 'LEGS',
  totalDuration: 40,
  philosophy: 'Mode 2 (Failure). Build unilateral leg strength.',
  sections: [
    {
      section: 'WARMUP',
      duration: 8,
      purpose: 'Lower body preparation',
      exercises: [
        {
          name: 'Leg Swings and Hip Circles',
          sets: 2,
          repsOrTime: '10 each',
          rest: 0,
          mode: 'BUFFER',
          notes: 'Dynamic mobility'
        },
        {
          name: 'Bodyweight Squats',
          sets: 2,
          repsOrTime: '15 reps',
          rest: 30,
          mode: 'BUFFER',
          notes: 'Warmup sets'
        }
      ]
    },
    {
      section: 'FUNDAMENTAL_STRENGTH',
      duration: 27,
      purpose: 'Build leg strength (Mode 2)',
      exercises: [
        {
          name: 'Bodyweight Squats',
          sets: 4,
          repsOrTime: '20-40 reps',
          rest: 90,
          mode: 'FAILURE',
          notes: 'High volume to build capacity'
        },
        {
          name: 'Bulgarian Split Squats',
          sets: 3,
          repsOrTime: '12-15 each leg',
          rest: 90,
          mode: 'FAILURE',
          notes: 'Unilateral strength - progression to pistol squat'
        },
        {
          name: 'Lunges',
          sets: 3,
          repsOrTime: '12 each leg',
          rest: 60,
          mode: 'FAILURE',
          notes: 'Walking or stationary'
        },
        {
          name: 'Glute Bridges',
          sets: 3,
          repsOrTime: '15-20 reps',
          rest: 60,
          mode: 'FAILURE',
          notes: 'Posterior chain activation'
        }
      ]
    },
    {
      section: 'COOLDOWN',
      duration: 5,
      purpose: 'Recovery',
      exercises: [
        {
          name: 'Quad and Hamstring Stretches',
          sets: 2,
          repsOrTime: '60s each',
          rest: 0,
          mode: 'BUFFER',
          notes: 'Static stretching'
        }
      ]
    }
  ]
};

/**
 * STAGE 3: ADVANCED (WEIGHTED STRENGTH)
 *
 * Entry Requirement: Can do 12+ pull-ups and 15+ dips
 * Focus: INTRODUCE WEIGHTED CALISTHENICS - The "secret" to unlocking elite skills
 * Philosophy: Weighted work (Mode 2) + Introduction to skills (Mode 1)
 * This is the bridge to elite training
 */
export const STAGE_3_WEIGHTED_PUSH: ExpertRoutine = {
  stage: 'STAGE_3',
  sessionType: 'PUSH',
  totalDuration: 60,
  philosophy: 'Weighted strength (Mode 2) is the secret. Start introducing skill practice (Mode 1).',
  sections: [
    {
      section: 'WARMUP',
      duration: 12,
      purpose: 'Thorough joint prep for weighted work',
      exercises: [
        {
          name: 'Wrist Prep Protocol',
          sets: 1,
          repsOrTime: '5 min',
          rest: 0,
          mode: 'BUFFER',
          notes: 'Full protocol - critical for upcoming planche work'
        },
        {
          name: 'Shoulder Mobility and Activation',
          sets: 3,
          repsOrTime: '10 reps',
          rest: 30,
          mode: 'BUFFER',
          notes: 'Scapula push-ups, circles, band dislocations'
        }
      ]
    },
    {
      section: 'SKILL_PRACTICE',
      duration: 15,
      purpose: 'Introduction to skills (Mode 1 - buffer)',
      exercises: [
        {
          name: 'Planche Leans',
          sets: 5,
          repsOrTime: '15s',
          rest: 120,
          mode: 'BUFFER',
          notes: 'MODE 1: Foundation of planche. Focus on protraction and forward lean. Stay fresh.'
        },
        {
          name: 'Frog Stand Practice',
          sets: 4,
          repsOrTime: '20-30s',
          rest: 90,
          mode: 'BUFFER',
          notes: 'MODE 1: Balance on hands skill. Quality practice.'
        }
      ]
    },
    {
      section: 'FUNDAMENTAL_STRENGTH',
      duration: 28,
      purpose: 'Weighted strength - THE KEY to elite skills (Mode 2)',
      exercises: [
        {
          name: 'Weighted Dips',
          sets: 4,
          repsOrTime: '8-12 reps',
          rest: 180,
          mode: 'FAILURE',
          notes: 'MODE 2: Start with +10-15% bodyweight. THIS is your motor. Work up to +40% for elite skills.'
        },
        {
          name: 'Weighted Push-ups (vest or band)',
          sets: 3,
          repsOrTime: '10-15 reps',
          rest: 120,
          mode: 'FAILURE',
          notes: 'Adding external load to push-ups'
        },
        {
          name: 'Pike Push-ups (elevated)',
          sets: 3,
          repsOrTime: '10-12 reps',
          rest: 90,
          mode: 'FAILURE',
          notes: 'Vertical pushing strength for HSPU path'
        },
        {
          name: 'Tuck L-Sit',
          sets: 3,
          repsOrTime: '20-30s',
          rest: 90,
          mode: 'FAILURE',
          notes: 'Core compression strength'
        }
      ]
    },
    {
      section: 'COOLDOWN',
      duration: 5,
      purpose: 'Recovery',
      exercises: [
        {
          name: 'Wrist and Shoulder Stretches',
          sets: 2,
          repsOrTime: '60s',
          rest: 0,
          mode: 'BUFFER',
          notes: 'MANDATORY wrist cooldown after planche work'
        }
      ]
    }
  ]
};

export const STAGE_3_WEIGHTED_PULL: ExpertRoutine = {
  stage: 'STAGE_3',
  sessionType: 'PULL',
  totalDuration: 60,
  philosophy: 'Weighted pull strength is foundation for OAP and levers. Introduce skill practice.',
  sections: [
    {
      section: 'WARMUP',
      duration: 10,
      purpose: 'Joint prep for weighted pulling',
      exercises: [
        {
          name: 'Shoulder Mobility Complex',
          sets: 1,
          repsOrTime: '5 min',
          rest: 0,
          mode: 'BUFFER',
          notes: 'Full shoulder warmup'
        },
        {
          name: 'Scapula Activation',
          sets: 3,
          repsOrTime: '10 reps',
          rest: 30,
          mode: 'BUFFER',
          notes: 'Scapula pulls - create active shoulder position'
        }
      ]
    },
    {
      section: 'SKILL_PRACTICE',
      duration: 15,
      purpose: 'Introduction to lever skills (Mode 1)',
      exercises: [
        {
          name: 'Tuck Front Lever Hold',
          sets: 5,
          repsOrTime: '10-15s',
          rest: 150,
          mode: 'BUFFER',
          notes: 'MODE 1: First static lever position. Focus on hollow body and lat engagement.'
        },
        {
          name: 'Skin the Cat',
          sets: 4,
          repsOrTime: '5 reps',
          rest: 90,
          mode: 'BUFFER',
          notes: 'Shoulder mobility and lever prep'
        }
      ]
    },
    {
      section: 'FUNDAMENTAL_STRENGTH',
      duration: 30,
      purpose: 'Weighted pull strength - Foundation for OAP (Mode 2)',
      exercises: [
        {
          name: 'Weighted Pull-ups',
          sets: 4,
          repsOrTime: '8-12 reps',
          rest: 180,
          mode: 'FAILURE',
          notes: 'MODE 2: Start +10-15% BW. Goal: 10+ reps with +25% BW for one-arm pull-up.'
        },
        {
          name: 'Archer Pull-ups',
          sets: 3,
          repsOrTime: '6-8 each side',
          rest: 120,
          mode: 'FAILURE',
          notes: 'Unilateral strength progression'
        },
        {
          name: 'L-Sit Pull-ups',
          sets: 3,
          repsOrTime: '5-8 reps',
          rest: 120,
          mode: 'FAILURE',
          notes: 'Combined skill - pull + core tension'
        },
        {
          name: 'Dragon Flag Negatives',
          sets: 3,
          repsOrTime: '5 slow reps',
          rest: 90,
          mode: 'FAILURE',
          notes: 'Core anti-extension for front lever'
        }
      ]
    },
    {
      section: 'COOLDOWN',
      duration: 5,
      purpose: 'Recovery',
      exercises: [
        {
          name: 'Lat and Shoulder Stretches',
          sets: 2,
          repsOrTime: '60s',
          rest: 0,
          mode: 'BUFFER',
          notes: 'Deep stretching'
        }
      ]
    }
  ]
};

/**
 * ROUTINE TEMPLATES REGISTRY
 */
export const EXPERT_ROUTINE_TEMPLATES: Record<string, ExpertRoutine> = {
  // STAGE 1
  'STAGE_1_PUSH': STAGE_1_PUSH_DAY,
  'STAGE_1_PULL': STAGE_1_PULL_DAY,

  // STAGE 2
  'STAGE_2_PUSH': STAGE_2_PUSH_DAY,
  'STAGE_2_PULL': STAGE_2_PULL_DAY,
  'STAGE_2_LEGS': STAGE_2_LEGS_DAY,

  // STAGE 3
  'STAGE_3_WEIGHTED_PUSH': STAGE_3_WEIGHTED_PUSH,
  'STAGE_3_WEIGHTED_PULL': STAGE_3_WEIGHTED_PULL,
  'STAGE_3_LEGS': STAGE_2_LEGS_DAY, // Can reuse Stage 2 legs or add weight

  // STAGE 4
  'STAGE_4_SKILLS_PUSH_WEIGHTED': STAGE_4_SKILLS_PUSH_WEIGHTED,
  'STAGE_4_SKILLS_PULL_WEIGHTED': STAGE_4_SKILLS_PULL_WEIGHTED,
};

/**
 * WEEKLY SPLITS BY STAGE
 * From PDF Part IV-B: "Plantillas de Entrenamiento Semanal"
 */
export const WEEKLY_SPLITS = {
  STAGE_1_2: {
    pattern: ['PUSH', 'LEGS', 'PULL', 'REST', 'PUSH', 'PULL', 'REST'],
    description: 'Focus: Build fundamental strength capacity (Mode 2 only)'
  },
  STAGE_3: {
    pattern: ['WEIGHTED_PUSH', 'LEGS', 'WEIGHTED_PULL', 'REST', 'WEIGHTED_PUSH', 'WEIGHTED_PULL', 'REST'],
    description: 'Focus: Weighted calisthenics - the secret to unlocking elite skills'
  },
  STAGE_4: {
    pattern: ['SKILLS_PUSH_WEIGHTED', 'LEGS', 'SKILLS_PULL_WEIGHTED', 'REST', 'SKILLS_PUSH', 'SKILLS_PULL', 'REST'],
    description: 'Focus: Bifurcated training - Skills (Mode 1) + Weighted (Mode 2)'
  },
  STAGE_4_ALTERNATIVE: {
    pattern: ['HIGH_VOL_PUSH_PULL_SKILLS', 'REST', 'HIGH_VOL_LEGS', 'REST', 'HIGH_VOL_SKILLS_HYBRID', 'REST', 'REST'],
    description: 'Alternative high-volume split for elite athletes'
  }
};

/**
 * SKILL GATING REQUIREMENTS
 * From PDF Part VI - "Desbloqueo de Habilidades Basado en Requisitos Previos"
 *
 * Skills must be "locked" until prerequisite strength is met
 */
export const SKILL_GATING = {
  PLANCHE_PATH: {
    requiredStage: 'STAGE_3',
    requiredStrength: {
      dips: 15,
      pushUps: 30
    },
    reason: 'Starting before Stage 3 is a recipe for wrist injury'
  },
  FRONT_LEVER_PATH: {
    requiredStage: 'STAGE_3',
    requiredStrength: {
      pullUps: 12,
      deadHang: 60 // seconds
    },
    reason: 'Need strong lats and grip foundation'
  },
  ONE_ARM_PULLUP_PATH: {
    requiredStage: 'STAGE_3',
    requiredStrength: {
      pullUps: 15,
      weightedPullUps: 5 // reps with +20kg
    },
    reason: 'Need absolute pulling strength base'
  },
  MUSCLE_UP_PATH: {
    requiredStage: 'STAGE_3',
    requiredStrength: {
      pullUps: 12,
      dips: 15,
      explosivePullUps: 5 // chest to bar
    },
    reason: 'Need explosive pulling power and dip strength for transition'
  },
  HANDSTAND_PUSHUP_PATH: {
    requiredStage: 'STAGE_2',
    requiredStrength: {
      pikePushUps: 10,
      handstandHold: 30 // seconds
    },
    reason: 'Need shoulder strength and balance foundation'
  }
};
