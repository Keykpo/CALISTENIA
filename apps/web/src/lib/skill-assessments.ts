/**
 * Skill Assessment Configuration
 *
 * This file contains assessment questions for each FIG skill branch.
 * Each skill has 3 questions that evaluate current ability.
 *
 * Scoring:
 * - 0-2 points = BEGINNER
 * - 3-5 points = INTERMEDIATE
 * - 6-7 points = ADVANCED
 * - 8-9 points = ELITE
 */

import { MasteryGoal, DifficultyLevel } from './fig-level-progressions';

export interface AssessmentOption {
  text: string;
  points: number;
}

export interface AssessmentQuestion {
  question: string;
  options: AssessmentOption[];
}

export type SkillAssessment = {
  [key in MasteryGoal]: AssessmentQuestion[];
};

export const SKILL_ASSESSMENTS: SkillAssessment = {
  HANDSTAND: [
    {
      question: "Can you hold a wall-assisted handstand?",
      options: [
        { text: "No, I cannot", points: 0 },
        { text: "Yes, 10-30 seconds", points: 1 },
        { text: "Yes, 30-60 seconds", points: 2 },
        { text: "Yes, 60+ seconds easily", points: 3 }
      ]
    },
    {
      question: "Can you hold a freestanding handstand?",
      options: [
        { text: "No, not at all", points: 0 },
        { text: "Yes, 3-10 seconds", points: 1 },
        { text: "Yes, 10-30 seconds", points: 2 },
        { text: "Yes, 30+ seconds", points: 3 }
      ]
    },
    {
      question: "Can you do handstand variations or transitions?",
      options: [
        { text: "No advanced variations", points: 0 },
        { text: "Can do basic kick-ups", points: 1 },
        { text: "Can do tuck/straddle entries", points: 2 },
        { text: "Can do weight shifts or one-arm progressions", points: 3 }
      ]
    }
  ],

  RINGS_HANDSTAND: [
    {
      question: "Can you hold a ring support position?",
      options: [
        { text: "No, cannot hold rings", points: 0 },
        { text: "Yes, 10-30 seconds", points: 1 },
        { text: "Yes, 30-60 seconds stable", points: 2 },
        { text: "Yes, 60+ seconds with full control", points: 3 }
      ]
    },
    {
      question: "Can you hold a handstand on rings with straps?",
      options: [
        { text: "No, not yet", points: 0 },
        { text: "Working on shoulder stand", points: 1 },
        { text: "Yes, with strap assistance", points: 2 },
        { text: "Yes, full ring handstand without straps", points: 3 }
      ]
    },
    {
      question: "How is your ring stability?",
      options: [
        { text: "Very shaky, basic support only", points: 0 },
        { text: "Moderate stability in support", points: 1 },
        { text: "Good stability, can hold handstand", points: 2 },
        { text: "Excellent control, can do variations", points: 3 }
      ]
    }
  ],

  PRESS_HANDSTAND: [
    {
      question: "Can you do a bent-arm, bent-body press to handstand?",
      options: [
        { text: "No, cannot press up", points: 0 },
        { text: "Can do partial press with lots of momentum", points: 1 },
        { text: "Yes, controlled press", points: 2 },
        { text: "Yes, easily with good form", points: 3 }
      ]
    },
    {
      question: "Can you do an L-sit press to handstand?",
      options: [
        { text: "No, not yet", points: 0 },
        { text: "Working on L-sit compressions", points: 1 },
        { text: "Yes, with some momentum", points: 2 },
        { text: "Yes, strict and controlled", points: 3 }
      ]
    },
    {
      question: "Can you do elevated handstand presses?",
      options: [
        { text: "No advanced presses", points: 0 },
        { text: "Can do basic straddle press", points: 1 },
        { text: "Can do elevated variations", points: 2 },
        { text: "Can do dip to straddle handstand", points: 3 }
      ]
    }
  ],

  STRAIGHT_ARM_PRESS: [
    {
      question: "Can you do an eccentric straight arm press?",
      options: [
        { text: "No, cannot control descent", points: 0 },
        { text: "Can do slow negatives with wall", points: 1 },
        { text: "Yes, controlled eccentrics", points: 2 },
        { text: "Yes, and can do concentric press", points: 3 }
      ]
    },
    {
      question: "Can you do a pike or straight press?",
      options: [
        { text: "No, not yet", points: 0 },
        { text: "Working on pike press partials", points: 1 },
        { text: "Yes, full pike press", points: 2 },
        { text: "Yes, straight or L-sit press", points: 3 }
      ]
    },
    {
      question: "Ring straight arm press ability?",
      options: [
        { text: "Cannot do on floor yet", points: 0 },
        { text: "Can do floor press", points: 1 },
        { text: "Working on ring press progressions", points: 2 },
        { text: "Can do ring straight arm press", points: 3 }
      ]
    }
  ],

  L_SIT_MANNA: [
    {
      question: "Can you hold a tuck L-sit?",
      options: [
        { text: "No, cannot lift hips", points: 0 },
        { text: "Yes, 5-15 seconds", points: 1 },
        { text: "Yes, 15-30 seconds", points: 2 },
        { text: "Yes, 30+ seconds easily", points: 3 }
      ]
    },
    {
      question: "Can you hold a full L-sit or straddle L?",
      options: [
        { text: "No, still working on tuck", points: 0 },
        { text: "Can do one leg extended", points: 1 },
        { text: "Yes, full L-sit 10-20s", points: 2 },
        { text: "Yes, L-sit or straddle 30+s", points: 3 }
      ]
    },
    {
      question: "Can you do V-sit progressions?",
      options: [
        { text: "No, L-sit is my limit", points: 0 },
        { text: "Can barely lift to 75°", points: 1 },
        { text: "Can hold 90-100° V-sit", points: 2 },
        { text: "Can do 120° V-sit or manna progressions", points: 3 }
      ]
    }
  ],

  BACK_LEVER: [
    {
      question: "Can you do skin the cat and tuck back lever?",
      options: [
        { text: "No, cannot invert", points: 0 },
        { text: "Yes, skin the cat", points: 1 },
        { text: "Yes, tuck back lever 5-10s", points: 2 },
        { text: "Yes, tuck 15+s stable", points: 3 }
      ]
    },
    {
      question: "Can you hold advanced tuck or straddle back lever?",
      options: [
        { text: "No, only basic tuck", points: 0 },
        { text: "Advanced tuck 5-10s", points: 1 },
        { text: "Straddle back lever 5-10s", points: 2 },
        { text: "Straddle 15+s or full BL", points: 3 }
      ]
    },
    {
      question: "Can you do back lever pullouts or circles?",
      options: [
        { text: "No dynamic work yet", points: 0 },
        { text: "Can do slow pullout from tuck", points: 1 },
        { text: "Can do full back lever pullout", points: 2 },
        { text: "Can do circles or front lever transitions", points: 3 }
      ]
    }
  ],

  FRONT_LEVER: [
    {
      question: "Can you hold a tuck front lever?",
      options: [
        { text: "No, cannot hold position", points: 0 },
        { text: "Yes, 3-10 seconds", points: 1 },
        { text: "Yes, 10-20 seconds", points: 2 },
        { text: "Yes, 20+ seconds clean", points: 3 }
      ]
    },
    {
      question: "Can you hold advanced tuck or straddle?",
      options: [
        { text: "No, only basic tuck", points: 0 },
        { text: "Advanced tuck 5-10s", points: 1 },
        { text: "Straddle 5-10s", points: 2 },
        { text: "Straddle 15+s clean", points: 3 }
      ]
    },
    {
      question: "Can you hold full front lever?",
      options: [
        { text: "No, working on progressions", points: 0 },
        { text: "Can hold 1-3 seconds", points: 1 },
        { text: "Yes, 5-10 seconds", points: 2 },
        { text: "Yes, 10+s or inverted transitions", points: 3 }
      ]
    }
  ],

  PULL_UPS: [
    {
      question: "How many strict pull-ups can you do?",
      options: [
        { text: "0-3 pull-ups", points: 0 },
        { text: "4-8 pull-ups", points: 1 },
        { text: "9-15 pull-ups", points: 2 },
        { text: "16+ pull-ups", points: 3 }
      ]
    },
    {
      question: "Can you do L-sit pull-ups?",
      options: [
        { text: "No, cannot do them", points: 0 },
        { text: "Yes, 1-3 reps", points: 1 },
        { text: "Yes, 4-8 reps", points: 2 },
        { text: "Yes, 9+ reps clean", points: 3 }
      ]
    },
    {
      question: "Can you do weighted pull-ups?",
      options: [
        { text: "No added weight", points: 0 },
        { text: "Yes, +10-20 lbs", points: 1 },
        { text: "Yes, +25-40 lbs", points: 2 },
        { text: "Yes, +45 lbs or bodyweight+", points: 3 }
      ]
    }
  ],

  ONE_ARM_PULL_UP: [
    {
      question: "Can you do archer pull-ups?",
      options: [
        { text: "No, not yet", points: 0 },
        { text: "Yes, 1-3 reps each side", points: 1 },
        { text: "Yes, 4-8 reps each side", points: 2 },
        { text: "Yes, 10+ reps clean", points: 3 }
      ]
    },
    {
      question: "Can you do one-arm negatives?",
      options: [
        { text: "No, cannot control descent", points: 0 },
        { text: "Yes, 3-5 second negatives", points: 1 },
        { text: "Yes, 5-10 second negatives", points: 2 },
        { text: "Yes, 10+ second slow negatives", points: 3 }
      ]
    },
    {
      question: "Can you do a full one-arm pull-up/chin-up?",
      options: [
        { text: "No, still working progressions", points: 0 },
        { text: "Can do assisted OAC", points: 1 },
        { text: "Yes, one-arm chin 1-2 reps", points: 2 },
        { text: "Yes, clean OAC 3+ reps or weighted", points: 3 }
      ]
    }
  ],

  IRON_CROSS: [
    {
      question: "How stable is your ring support hold?",
      options: [
        { text: "Cannot hold support 10s", points: 0 },
        { text: "Can hold 30-60s", points: 1 },
        { text: "Very stable 60+s with RTO", points: 2 },
        { text: "Perfect control, can do variations", points: 3 }
      ]
    },
    {
      question: "Can you do cross progressions?",
      options: [
        { text: "No, working on support", points: 0 },
        { text: "Can do low cross or band-assisted", points: 1 },
        { text: "Can hold partial cross", points: 2 },
        { text: "Yes, full iron cross hold", points: 3 }
      ]
    },
    {
      question: "Can you do cross pullouts or transitions?",
      options: [
        { text: "No dynamic work yet", points: 0 },
        { text: "Working on cross to back lever", points: 1 },
        { text: "Can do slow pullout", points: 2 },
        { text: "Yes, full pullouts or swings", points: 3 }
      ]
    }
  ],

  PLANCHE: [
    {
      question: "Can you hold a frog stand/tuck planche?",
      options: [
        { text: "No, cannot balance", points: 0 },
        { text: "Frog stand 10-20s", points: 1 },
        { text: "Tuck planche 5-10s", points: 2 },
        { text: "Tuck planche 15+s stable", points: 3 }
      ]
    },
    {
      question: "Can you hold advanced tuck planche?",
      options: [
        { text: "No, only basic tuck", points: 0 },
        { text: "Advanced tuck 3-5s", points: 1 },
        { text: "Advanced tuck 8-12s", points: 2 },
        { text: "Advanced tuck 15+s or straddle", points: 3 }
      ]
    },
    {
      question: "Can you hold full planche?",
      options: [
        { text: "No, working progressions", points: 0 },
        { text: "Straddle planche 5-10s", points: 1 },
        { text: "Full planche 2-5s", points: 2 },
        { text: "Full planche 5+s clean or pushups", points: 3 }
      ]
    }
  ],

  HANDSTAND_PUSHUP: [
    {
      question: "Can you do pike push-ups or headstand pushups?",
      options: [
        { text: "No, not yet", points: 0 },
        { text: "Yes, pike pushups 5-10 reps", points: 1 },
        { text: "Yes, headstand pushups 3-5 reps", points: 2 },
        { text: "Yes, headstand pushups 8+ reps", points: 3 }
      ]
    },
    {
      question: "Can you do wall handstand push-ups?",
      options: [
        { text: "No, cannot do them", points: 0 },
        { text: "Can do 1-3 reps", points: 1 },
        { text: "Can do 4-8 reps", points: 2 },
        { text: "Can do 10+ reps clean", points: 3 }
      ]
    },
    {
      question: "Can you do freestanding HSPU?",
      options: [
        { text: "No, only wall assisted", points: 0 },
        { text: "Working on freestanding control", points: 1 },
        { text: "Yes, 1-3 freestanding reps", points: 2 },
        { text: "Yes, 5+ clean or planche pushups", points: 3 }
      ]
    }
  ],

  DIPS: [
    {
      question: "How many parallel bar dips can you do?",
      options: [
        { text: "0-5 dips", points: 0 },
        { text: "6-12 dips", points: 1 },
        { text: "13-20 dips", points: 2 },
        { text: "21+ dips clean", points: 3 }
      ]
    },
    {
      question: "Can you do L-sit dips?",
      options: [
        { text: "No, not yet", points: 0 },
        { text: "Yes, 1-3 reps", points: 1 },
        { text: "Yes, 4-8 reps", points: 2 },
        { text: "Yes, 10+ reps or 45° dips", points: 3 }
      ]
    },
    {
      question: "Can you do weighted or one-arm dips?",
      options: [
        { text: "No added weight", points: 0 },
        { text: "Yes, +20-30 lbs", points: 1 },
        { text: "Yes, +40-60 lbs", points: 2 },
        { text: "Yes, +70 lbs or one-arm progressions", points: 3 }
      ]
    }
  ],

  RING_DIPS: [
    {
      question: "Can you hold ring support?",
      options: [
        { text: "No, very unstable", points: 0 },
        { text: "Yes, 15-30s", points: 1 },
        { text: "Yes, 45-60s stable", points: 2 },
        { text: "Yes, 60+s perfect control", points: 3 }
      ]
    },
    {
      question: "How many ring dips can you do?",
      options: [
        { text: "0-3 ring dips", points: 0 },
        { text: "4-8 ring dips", points: 1 },
        { text: "9-15 ring dips", points: 2 },
        { text: "16+ clean ring dips", points: 3 }
      ]
    },
    {
      question: "Can you do RTO (rings turned out) dips?",
      options: [
        { text: "No, regular dips only", points: 0 },
        { text: "Can do 45° RTO dips", points: 1 },
        { text: "Can do 90° RTO dips", points: 2 },
        { text: "Can do full RTO or maltese dips", points: 3 }
      ]
    }
  ],

  MUSCLE_UP: [
    {
      question: "Can you do a kipping or assisted muscle-up?",
      options: [
        { text: "No, cannot do muscle-ups", points: 0 },
        { text: "Yes, with lots of kip", points: 1 },
        { text: "Yes, minimal kip needed", points: 2 },
        { text: "Yes, multiple reps smooth", points: 3 }
      ]
    },
    {
      question: "Can you do strict bar muscle-ups?",
      options: [
        { text: "No, only kipping", points: 0 },
        { text: "Working on strict transition", points: 1 },
        { text: "Yes, 1-3 strict muscle-ups", points: 2 },
        { text: "Yes, 5+ strict muscle-ups", points: 3 }
      ]
    },
    {
      question: "Can you do wide or no-false-grip muscle-ups?",
      options: [
        { text: "No, regular grip only", points: 0 },
        { text: "Can do wide grip", points: 1 },
        { text: "Can do no false grip", points: 2 },
        { text: "Can do one-arm or explosive variations", points: 3 }
      ]
    }
  ],

  FLAG: [
    {
      question: "Can you hold a tuck flag?",
      options: [
        { text: "No, cannot hold", points: 0 },
        { text: "Yes, 3-8 seconds", points: 1 },
        { text: "Yes, 10-15 seconds", points: 2 },
        { text: "Yes, 20+ seconds stable", points: 3 }
      ]
    },
    {
      question: "Can you do advanced tuck or straddle flag?",
      options: [
        { text: "No, only tuck", points: 0 },
        { text: "Advanced tuck 5-10s", points: 1 },
        { text: "Straddle 5-10s", points: 2 },
        { text: "Straddle 15+s clean", points: 3 }
      ]
    },
    {
      question: "Can you hold full human flag?",
      options: [
        { text: "No, working progressions", points: 0 },
        { text: "Can hold 1-3 seconds", points: 1 },
        { text: "Yes, 5-10 seconds", points: 2 },
        { text: "Yes, 10+s both sides", points: 3 }
      ]
    }
  ],

  AB_WHEEL: [
    {
      question: "Can you hold a plank position?",
      options: [
        { text: "No, less than 10s", points: 0 },
        { text: "Yes, 30-60s", points: 1 },
        { text: "Yes, 60-90s", points: 2 },
        { text: "Yes, 2+ minutes easy", points: 3 }
      ]
    },
    {
      question: "Can you do ab wheel from knees?",
      options: [
        { text: "No, too difficult", points: 0 },
        { text: "Yes, 3-5 reps", points: 1 },
        { text: "Yes, 8-12 reps", points: 2 },
        { text: "Yes, 15+ reps full ROM", points: 3 }
      ]
    },
    {
      question: "Can you do standing ab wheel rollouts?",
      options: [
        { text: "No, only from knees", points: 0 },
        { text: "Can do partial rollouts", points: 1 },
        { text: "Yes, full rollouts 3-5 reps", points: 2 },
        { text: "Yes, 8+ reps or one-arm progressions", points: 3 }
      ]
    }
  ],

  PISTOL_SQUAT: [
    {
      question: "Can you do bodyweight squats?",
      options: [
        { text: "No, or only partial depth", points: 0 },
        { text: "Yes, parallel depth 10-15 reps", points: 1 },
        { text: "Yes, full depth 15-25 reps", points: 2 },
        { text: "Yes, 30+ reps ATG", points: 3 }
      ]
    },
    {
      question: "Can you do assisted pistol squats?",
      options: [
        { text: "No, cannot balance", points: 0 },
        { text: "Yes, holding support", points: 1 },
        { text: "Yes, minimal support needed", points: 2 },
        { text: "Yes, full pistol squats unassisted", points: 3 }
      ]
    },
    {
      question: "Can you do weighted pistol squats?",
      options: [
        { text: "No, bodyweight only", points: 0 },
        { text: "Can do 5-10 reps each leg", points: 1 },
        { text: "Yes, +10-25 lbs", points: 2 },
        { text: "Yes, +30 lbs or 2x bodyweight variations", points: 3 }
      ]
    }
  ]
};

/**
 * Calculate user's level based on total assessment score
 */
export function calculateLevelFromScore(totalScore: number): DifficultyLevel {
  if (totalScore <= 2) return 'BEGINNER';
  if (totalScore <= 5) return 'INTERMEDIATE';
  if (totalScore <= 7) return 'ADVANCED';
  return 'ELITE';
}

/**
 * Get maximum possible score for an assessment
 */
export function getMaxScore(): number {
  return 9; // 3 questions × 3 points max each
}
