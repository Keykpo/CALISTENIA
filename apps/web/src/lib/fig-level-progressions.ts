/**
 * FIG Level Chart - Official Calisthenics Progression System
 *
 * This file defines the standardized progression paths for major calisthenics skills
 * based on the FIG (Fédération Internationale de Gymnastique) difficulty levels.
 *
 * Difficulty Levels:
 * - BEGINNER: Basic skills, foundational movements
 * - INTERMEDIATE: B-Level skills, solid fundamentals
 * - ADVANCED: A-Level skills, advanced techniques
 * - ELITE: Elite/S-Level skills, mastery movements
 */

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

export type MasteryGoal =
  | 'HANDSTAND'
  | 'RINGS_HANDSTAND'
  | 'PRESS_HANDSTAND'
  | 'STRAIGHT_ARM_PRESS'
  | 'L_SIT_MANNA'
  | 'BACK_LEVER'
  | 'FRONT_LEVER'
  | 'PULL_UPS'
  | 'ONE_ARM_PULL_UP'
  | 'IRON_CROSS'
  | 'PLANCHE'
  | 'HANDSTAND_PUSHUP'
  | 'DIPS'
  | 'RING_DIPS'
  | 'MUSCLE_UP'
  | 'FLAG'
  | 'AB_WHEEL'
  | 'PISTOL_SQUAT';

export interface ProgressionStep {
  level: DifficultyLevel;
  exerciseIds: string[]; // IDs from exercises database
  description: string;
}

export interface SkillProgression {
  goal: MasteryGoal;
  name: string;
  category: string;
  steps: ProgressionStep[];
}

/**
 * FIG Level Chart Progressions
 * Each progression follows the exact sequence from the official FIG charts
 */
export const FIG_PROGRESSIONS: SkillProgression[] = [
  // 🤸 HANDSTAND PROGRESSIONS
  {
    goal: 'HANDSTAND',
    name: 'Handstand Mastery',
    category: 'BALANCE',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['wall-handstand', 'chest-to-wall-handstand'],
        description: 'Wall HS - Build shoulder strength and body awareness against wall'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['free-handstand', 'freestanding-handstand'],
        description: 'Free HS - Freestanding handstand with balance control'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['handstand-variations', 'tenting-handstand', 'one-arm-handstand-progressions'],
        description: 'Different Handstand for One-Arm Progressions - Weight shifts, tenting'
      },
      {
        level: 'ELITE',
        exerciseIds: ['one-arm-handstand', 'oahs'],
        description: 'One-Arm HS - Full single-arm handstand balance'
      }
    ]
  },
  {
    goal: 'RINGS_HANDSTAND',
    name: 'Rings Handstand',
    category: 'BALANCE',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['ring-support-hold'],
        description: 'R Shld Std - Ring shoulder stand, basic ring stability'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['ring-strap-handstand'],
        description: 'R Strap HS - Handstand on rings with straps for assistance'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['ring-handstand'],
        description: 'RHS - Full ring handstand'
      },
      {
        level: 'ELITE',
        exerciseIds: ['ring-handstand-elevated'],
        description: 'R HS EL HS - Elevated ring handstand variations'
      }
    ]
  },
  {
    goal: 'PRESS_HANDSTAND',
    name: 'Press to Handstand',
    category: 'STRENGTH',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['bent-arm-bent-body-press'],
        description: 'BA BB Press - Bent arm, bent body press fundamentals'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['l-sit-press', 'compression-straddle-press'],
        description: 'L-Sit BA BB Press, CR SB Press - L-sit press and compression work'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['handstand-elevated'],
        description: 'HS EL HS - Handstand to elevated handstand transitions'
      },
      {
        level: 'ELITE',
        exerciseIds: ['dip-straddle-to-handstand'],
        description: 'PB Dip SB to HS - Parallel bar dip to straddle handstand'
      }
    ]
  },
  {
    goal: 'STRAIGHT_ARM_PRESS',
    name: 'Straight Arm Press to Handstand',
    category: 'STRENGTH',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['wall-straight-press-eccentric'],
        description: 'Wall Str Press Ecc - Eccentric straight arm press against wall'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['straight-press', 'pike-standard-press'],
        description: 'Str/Pike Std Press - Straight and pike press to handstand'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['l-sit-straight-press', 'straddle-l-straight-press'],
        description: 'L-Sit/Str-L Str Press - L-sit to straight arm press'
      },
      {
        level: 'ELITE',
        exerciseIds: ['ring-straight-arm-l-sit-press'],
        description: 'RSA L-Sit Str Press - Ring straight arm L-sit press'
      }
    ]
  },
  {
    goal: 'L_SIT_MANNA',
    name: 'L-Sit to Manna Progression',
    category: 'SKILL_STATIC',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['tuck-l-sit'],
        description: 'Tuck L-Sit - Knees tucked, foundational compression'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['l-sit', 'straddle-l-sit'],
        description: 'L-Sit, Straddle L-Sit - Full L-sit and straddle variation'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['75-deg-v-sit', '100-deg-v-sit', '120-deg-v-sit'],
        description: '75°/100°/120° V-Sit - Progressive V-sit angles'
      },
      {
        level: 'ELITE',
        exerciseIds: ['manna'],
        description: 'Manna - Full manna position, ultimate compression'
      }
    ]
  },

  // 🦾 PULLING PROGRESSIONS
  {
    goal: 'BACK_LEVER',
    name: 'Back Lever Progression',
    category: 'SKILL_STATIC',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['skin-the-cat', 'tuck-back-lever'],
        description: 'Skin the Cat, Tuck BL - Shoulder mobility and tuck back lever'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['skill_back_lever_adv_tuck', 'straddle-back-lever'],
        description: 'Adv Tuck BL, Straddle BL - Advanced tuck and straddle positions'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['skill_back_lever_full', 'back-lever-pullout'],
        description: 'Full BL, BL Pullout - Full back lever and dynamic pullout'
      },
      {
        level: 'ELITE',
        exerciseIds: ['circle-front-lever'],
        description: 'Circle FL - Circle to front lever, dynamic skill'
      }
    ]
  },
  {
    goal: 'FRONT_LEVER',
    name: 'Front Lever Progression',
    category: 'SKILL_STATIC',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['tuck-front-lever'],
        description: 'Tuck FL - Tuck front lever, foundational position'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['skill_front_lever_adv_tuck'],
        description: 'Adv Tuck FL - Advanced tuck front lever'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['straddle-front-lever', 'skill_front_lever_full'],
        description: 'Straddle FL, Full FL - Straddle and full front lever'
      },
      {
        level: 'ELITE',
        exerciseIds: ['front-lever-to-inverted'],
        description: 'FL to Inverted - Front lever to inverted hang transition'
      }
    ]
  },
  {
    goal: 'PULL_UPS',
    name: 'Weighted Pull-up Progression',
    category: 'STRENGTH',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['assisted-pull-ups', 'negative-pull-ups', 'jump-pull-ups'],
        description: 'Jump Pull-ups - Assisted and jump variations'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['pull-ups', 'l-pull-ups'],
        description: 'Bar Pull-ups, L-Pull-ups - Standard and L-sit pull-ups'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['ring-wide-l-pull-ups'],
        description: 'R Wide L-Pull-ups - Ring wide grip L-sit pull-ups'
      },
      {
        level: 'ELITE',
        exerciseIds: ['l-slap-abs-pull-up'],
        description: 'L-Slap Abs - L-sit pull-up to bar slap abs (1.78x BW equivalent)'
      }
    ]
  },
  {
    goal: 'ONE_ARM_PULL_UP',
    name: 'One-Arm Pull-up',
    category: 'STRENGTH',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['assisted-one-arm-pull-up', 'archer-pull-ups'],
        description: 'Archer progressions and assisted variations'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['one-arm-pull-up-eccentric', 'negative-one-arm-pull-up'],
        description: 'OAC Eccentric - One-arm chin-up negative phase'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['one-arm-pull-up', 'one-arm-chin-up'],
        description: 'OAC - Full one-arm chin-up'
      },
      {
        level: 'ELITE',
        exerciseIds: ['weighted-one-arm-pull-up'],
        description: 'OAC+25 lbs - Weighted one-arm pull-up'
      }
    ]
  },
  {
    goal: 'IRON_CROSS',
    name: 'Iron Cross',
    category: 'SKILL_STATIC',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['ring-support-hold', 'ring-turned-out-support'],
        description: 'Ring support and basic stability work'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['cross-progressions', 'low-cross', 'band-assisted-cross'],
        description: 'Cross Progressions - Assisted cross and low variations'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['iron-cross-hold', 'cross-to-back-lever'],
        description: 'Iron Cross Hold, Cross to Back Lever - Static hold and transitions'
      },
      {
        level: 'ELITE',
        exerciseIds: ['iron-cross-pullout'],
        description: 'Iron Cross Pullouts - Dynamic cross pullouts'
      }
    ]
  },

  // 🛡️ PUSHING PROGRESSIONS
  {
    goal: 'PLANCHE',
    name: 'Planche Progression',
    category: 'SKILL_STATIC',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['frog-stand', 'frog-planche'],
        description: 'Frog Stand - Crow pose and basic balance'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['tuck-planche'],
        description: 'Tuck PL - Tuck planche position'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['skill_planche_adv_tuck'],
        description: 'Adv Tuck PL - Advanced tuck planche'
      },
      {
        level: 'ELITE',
        exerciseIds: ['skill_planche_full', 'full-planche'],
        description: 'Full PL - Full planche hold'
      }
    ]
  },
  {
    goal: 'HANDSTAND_PUSHUP',
    name: 'Handstand Push-up',
    category: 'STRENGTH',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['pike-headstand-push-up'],
        description: 'Pike He SPU - Pike headstand push-ups'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['wall-handstand-push-up-eccentric'],
        description: 'Wall HeSPU Ecc - Wall handstand push-up eccentrics'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['skill_hspu_freestanding', 'freestanding-handstand-push-up'],
        description: 'Free HeSPU - Freestanding handstand push-up'
      },
      {
        level: 'ELITE',
        exerciseIds: ['full-planche-push-up'],
        description: 'Full PL PU - Full planche push-up'
      }
    ]
  },
  {
    goal: 'DIPS',
    name: 'Parallel Bar Dips',
    category: 'STRENGTH',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['parallel-bar-dip-eccentric', 'bench-dips'],
        description: 'PB Dips Ecc, PB Dips - Eccentric and full dips'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['l-dips', 'l-sit-dips'],
        description: 'L-Dips - Dips with L-sit position'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['45-degree-dips'],
        description: '45° Dips - Lean forward dips, planche preparation'
      },
      {
        level: 'ELITE',
        exerciseIds: ['one-arm-dips'],
        description: 'One-Arm Dips - Single arm dip'
      }
    ]
  },
  {
    goal: 'RING_DIPS',
    name: 'Ring Dips',
    category: 'STRENGTH',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['ring-support-hold'],
        description: 'Support Hold - Ring top support position'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['ring-dip-eccentric', 'ring-dips'],
        description: 'R Dips Ecc, R Dips - Eccentric and full ring dips'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['rto-45-degree-dips'],
        description: 'RTO 45° Dips - Rings turned out 45° lean dips'
      },
      {
        level: 'ELITE',
        exerciseIds: ['rto-90-dips', 'maltese-dips'],
        description: 'RTO 90+88° Dips - Extreme RTO dips, near maltese'
      }
    ]
  },

  // 🔗 MISCELLANEOUS PROGRESSIONS
  {
    goal: 'MUSCLE_UP',
    name: 'Muscle-up Progression',
    category: 'STRENGTH',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['kipping-muscle-up', 'assisted-muscle-up'],
        description: 'Muscle-ups, Kipping MU - Kipping and momentum-based variations'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['strict-bar-muscle-up'],
        description: 'Strict Bar MU - Strict bar muscle-up, no kip'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['wide-muscle-up', 'no-false-grip-muscle-up'],
        description: 'Wide / No FG MU - Wide grip and no false grip variations'
      },
      {
        level: 'ELITE',
        exerciseIds: ['one-arm-straight-muscle-up'],
        description: 'OA Straight MU - One-arm straight bar muscle-up'
      }
    ]
  },
  {
    goal: 'FLAG',
    name: 'Human Flag',
    category: 'SKILL_STATIC',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['tuck-flag'],
        description: 'Tuck Flag - Tucked position flag'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['advanced-tuck-flag'],
        description: 'Adv Tuck Flag - Advanced tuck with extended legs'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['straddle-flag'],
        description: 'Straddle Flag - Legs in straddle position'
      },
      {
        level: 'ELITE',
        exerciseIds: ['full-flag', 'human-flag'],
        description: 'Full Flag - Full human flag, legs together'
      }
    ]
  },
  {
    goal: 'AB_WHEEL',
    name: 'Ab Wheel Rollout',
    category: 'CORE',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['plank-hold'],
        description: '25s Plank - Basic plank endurance'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['ab-wheel-knees'],
        description: 'Knees Ab Wheel - Ab wheel from knees'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['ab-wheel-full', 'standing-ab-wheel'],
        description: 'Full Ab Wheel - Standing ab wheel rollout'
      },
      {
        level: 'ELITE',
        exerciseIds: ['one-arm-ab-wheel'],
        description: 'OA Ab Wheel - One-arm ab wheel rollout'
      }
    ]
  },
  {
    goal: 'PISTOL_SQUAT',
    name: 'Pistol Squat',
    category: 'STRENGTH',
    steps: [
      {
        level: 'BEGINNER',
        exerciseIds: ['parallel-squat', 'box-squat'],
        description: 'Parallel Squat - Two-leg squat to parallel'
      },
      {
        level: 'INTERMEDIATE',
        exerciseIds: ['full-squat', 'deep-squat'],
        description: 'Full Squat - Full depth two-leg squat'
      },
      {
        level: 'ADVANCED',
        exerciseIds: ['pistol-squat', 'one-leg-squat'],
        description: 'Pistol - Full single-leg squat'
      },
      {
        level: 'ELITE',
        exerciseIds: ['weighted-pistol-squat'],
        description: '2x BW Pistol - Pistol squat with double bodyweight'
      }
    ]
  }
];

/**
 * Get the appropriate exercise progression based on user's skill level
 * @param goal - The mastery goal the user is working toward
 * @param currentLevel - The user's current skill level (BEGINNER, INTERMEDIATE, ADVANCED, ELITE)
 * @returns The progression step with exercise IDs for the current level
 */
export function getProgressionForLevel(
  goal: MasteryGoal,
  currentLevel: DifficultyLevel
): ProgressionStep | null {
  const progression = FIG_PROGRESSIONS.find(p => p.goal === goal);
  if (!progression) return null;

  return progression.steps.find(step => step.level === currentLevel) || null;
}

/**
 * Get the next progression level for a given goal
 * @param goal - The mastery goal
 * @param currentLevel - Current difficulty level
 * @returns The next level in progression, or null if at max
 */
export function getNextProgressionLevel(
  goal: MasteryGoal,
  currentLevel: DifficultyLevel
): DifficultyLevel | null {
  const levels: DifficultyLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'];
  const currentIndex = levels.indexOf(currentLevel);

  if (currentIndex === -1 || currentIndex >= levels.length - 1) {
    return null;
  }

  return levels[currentIndex + 1];
}

/**
 * Get all progressions for a specific category
 * @param category - Exercise category (BALANCE, STRENGTH, etc.)
 * @returns Array of progressions in that category
 */
export function getProgressionsByCategory(category: string): SkillProgression[] {
  return FIG_PROGRESSIONS.filter(p => p.category === category);
}

/**
 * Map old difficulty levels to new standardized levels
 * According to user requirements:
 * - D (Beginner) → BEGINNER
 * - C (Novice) + B (Intermediate) → INTERMEDIATE
 * - A (Advanced) → ADVANCED
 * - S (Expert) → ELITE
 */
export function mapOldDifficultyToNew(oldDifficulty: string): DifficultyLevel {
  const normalized = oldDifficulty.toUpperCase();

  if (normalized.includes('D') || normalized.includes('BEGINNER')) {
    return 'BEGINNER';
  }
  if (normalized.includes('C') || normalized.includes('NOVICE') ||
      normalized.includes('B') || normalized.includes('INTERMEDIATE')) {
    return 'INTERMEDIATE';
  }
  if (normalized.includes('A') || normalized.includes('ADVANCED')) {
    return 'ADVANCED';
  }
  if (normalized.includes('S') || normalized.includes('EXPERT') || normalized.includes('ELITE')) {
    return 'ELITE';
  }

  // Default to intermediate if unknown
  return 'INTERMEDIATE';
}
