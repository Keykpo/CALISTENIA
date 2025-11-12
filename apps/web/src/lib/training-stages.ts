/**
 * Training Stages System
 *
 * Based on Overcoming Gravity 2 and D-S Assessment System
 * Determines user's training stage and appropriate training methodology
 */

export type UserStage = 'STAGE_1' | 'STAGE_2' | 'STAGE_3' | 'STAGE_4';
export type TrainingMode = 'FAILURE' | 'BUFFER';

export interface StageInfo {
  stage: UserStage;
  name: string;
  description: string;
  entryRequirement: string;
  trainingFocus: string[];
  primaryMode: TrainingMode;
  usesWeights: boolean;
  usesSkills: boolean;
  recommendedSplit: string[];
}

export const STAGE_DEFINITIONS: Record<UserStage, StageInfo> = {
  STAGE_1: {
    stage: 'STAGE_1',
    name: 'Foundation',
    description: 'Building fundamental strength - cannot perform basic exercises',
    entryRequirement: 'Cannot do 1 pull-up or 1 dip',
    trainingFocus: ['Push fundamentals', 'Pull fundamentals', 'Core basics'],
    primaryMode: 'FAILURE',
    usesWeights: false,
    usesSkills: false,
    recommendedSplit: ['Push', 'Legs', 'Pull', 'Rest', 'Push', 'Pull', 'Rest'],
  },
  STAGE_2: {
    stage: 'STAGE_2',
    name: 'Consolidation',
    description: 'Developing work capacity and introducing basic skills',
    entryRequirement: '1-12 pull-ups, 1-15 dips',
    trainingFocus: ['Push/Pull volume', 'Legs', 'Core', 'Intro Handstand'],
    primaryMode: 'FAILURE',
    usesWeights: false,
    usesSkills: true, // Only intro skills like wall handstand
    recommendedSplit: ['Push', 'Legs', 'Pull', 'Rest', 'Push', 'Pull', 'Rest'],
  },
  STAGE_3: {
    stage: 'STAGE_3',
    name: 'Weighted Strength',
    description: 'Building elite strength foundation with weighted calisthenics',
    entryRequirement: '12+ pull-ups, 15+ dips',
    trainingFocus: ['Weighted pull-ups/dips', 'Legs', 'Skill support strength'],
    primaryMode: 'FAILURE',
    usesWeights: true,
    usesSkills: true, // Intro advanced skills
    recommendedSplit: ['Weighted Push', 'Legs', 'Weighted Pull', 'Rest', 'Weighted Push', 'Weighted Pull', 'Rest'],
  },
  STAGE_4: {
    stage: 'STAGE_4',
    name: 'Elite Specialization',
    description: 'Skill mastery with dual-mode training (skills + weighted strength)',
    entryRequirement: '10+ pull-ups +25% BW, 10+ dips +40% BW',
    trainingFocus: ['Skill specialization', 'Weighted maintenance', 'Advanced skills'],
    primaryMode: 'BUFFER', // For skills, FAILURE for strength
    usesWeights: true,
    usesSkills: true,
    recommendedSplit: ['Skills + Weighted', 'Legs', 'Skills + Weighted', 'Rest', 'Skills Only', 'Skills Only', 'Rest'],
  },
};

/**
 * Skill Gating Requirements
 * Prevents users from attempting skills they're not ready for (injury prevention)
 */
export interface SkillGate {
  skillName: string;
  minStage: UserStage;
  requirements: {
    pullUps?: number;
    dips?: number;
    weightedPullUps?: { reps: number; weight: number }; // weight as % of bodyweight
    weightedDips?: { reps: number; weight: number };
    prerequisiteSkills?: string[];
  };
  reason: string;
}

export const SKILL_GATES: SkillGate[] = [
  {
    skillName: 'Full Planche',
    minStage: 'STAGE_3',
    requirements: {
      dips: 15,
      weightedDips: { reps: 10, weight: 40 }, // 10 dips @ +40% BW
    },
    reason: 'Planche requires massive pushing strength. Risk of shoulder/wrist injury without proper foundation.',
  },
  {
    skillName: 'Tuck Planche',
    minStage: 'STAGE_2',
    requirements: {
      dips: 10,
    },
    reason: 'Even tuck planche requires significant pushing strength.',
  },
  {
    skillName: 'Full Front Lever',
    minStage: 'STAGE_3',
    requirements: {
      pullUps: 12,
      weightedPullUps: { reps: 8, weight: 25 },
    },
    reason: 'Front lever requires elite pulling strength. Risk of bicep tendon injury without foundation.',
  },
  {
    skillName: 'Tuck Front Lever',
    minStage: 'STAGE_2',
    requirements: {
      pullUps: 8,
    },
    reason: 'Tuck front lever requires good scapular control and pulling strength.',
  },
  {
    skillName: 'One-Arm Pull-up',
    minStage: 'STAGE_3',
    requirements: {
      pullUps: 15,
      weightedPullUps: { reps: 10, weight: 50 },
    },
    reason: 'OAP requires massive pulling strength. Can achieve with either high reps OR weighted pull-ups.',
  },
  {
    skillName: 'Muscle-up',
    minStage: 'STAGE_3',
    requirements: {
      pullUps: 10,
      dips: 10,
      weightedPullUps: { reps: 10, weight: 25 },
      weightedDips: { reps: 10, weight: 40 },
    },
    reason: 'Muscle-up requires explosive pulling and strong transition. Risk of shoulder injury without strength.',
  },
  {
    skillName: 'Freestanding Handstand Push-up',
    minStage: 'STAGE_3',
    requirements: {
      dips: 15,
    },
    reason: 'HSPU requires excellent overhead pressing strength and balance.',
  },
];

/**
 * Calculate user's training stage based on hexagon profile
 */
export function calculateUserStage(hexagonProfile: {
  strengthLevel: string;
  strengthXP: number;
  balanceLevel: string;
  staticHoldsLevel: string;
}): UserStage {
  const { strengthLevel, strengthXP } = hexagonProfile;

  // Stage is primarily determined by strength level (pull-ups, dips capacity)
  // These map to the hexagon strength axis levels

  switch (strengthLevel) {
    case 'BEGINNER':
      // BEGINNER = Cannot do 1 pull-up/dip (D rank: 0-2.5 visual)
      return 'STAGE_1';

    case 'INTERMEDIATE':
      // INTERMEDIATE = 1-12 pull-ups, 1-15 dips (C-B ranks: 2.5-7.5 visual)
      // Sub-divide based on XP
      if (strengthXP < 144000) {
        // C rank: 48k-144k XP
        return 'STAGE_2';
      } else {
        // B rank: 144k-384k XP (12+ pull-ups)
        return 'STAGE_3';
      }

    case 'ADVANCED':
      // ADVANCED = Strong foundation, ready for weighted work (B-A ranks: 5.0-9.0 visual)
      if (strengthXP < 384000) {
        // Still in B rank
        return 'STAGE_3';
      } else {
        // A rank: 384k+ XP (elite strength with weights)
        return 'STAGE_4';
      }

    case 'ELITE':
      // ELITE = Mastery level (A-S ranks: 7.5-10.0 visual)
      return 'STAGE_4';

    default:
      // Default to STAGE_1 (safest)
      return 'STAGE_1';
  }
}

/**
 * Check if user is ready for a specific skill
 */
export function checkSkillReadiness(
  skillName: string,
  userStage: UserStage,
  userStats: {
    pullUps?: number;
    dips?: number;
    weightedPullUpsPercent?: number; // Max % of BW added
    weightedDipsPercent?: number;
  }
): { ready: boolean; reason: string; requirements?: SkillGate['requirements'] } {
  const gate = SKILL_GATES.find(g =>
    skillName.toLowerCase().includes(g.skillName.toLowerCase())
  );

  if (!gate) {
    // No gate defined, allow
    return { ready: true, reason: 'No restrictions' };
  }

  // Check stage requirement
  const stageOrder: UserStage[] = ['STAGE_1', 'STAGE_2', 'STAGE_3', 'STAGE_4'];
  if (stageOrder.indexOf(userStage) < stageOrder.indexOf(gate.minStage)) {
    return {
      ready: false,
      reason: `Requires ${gate.minStage}. ${gate.reason}`,
      requirements: gate.requirements,
    };
  }

  // Check specific requirements
  if (gate.requirements.pullUps && (!userStats.pullUps || userStats.pullUps < gate.requirements.pullUps)) {
    return {
      ready: false,
      reason: `Requires ${gate.requirements.pullUps}+ pull-ups. Currently: ${userStats.pullUps || 0}`,
      requirements: gate.requirements,
    };
  }

  if (gate.requirements.dips && (!userStats.dips || userStats.dips < gate.requirements.dips)) {
    return {
      ready: false,
      reason: `Requires ${gate.requirements.dips}+ dips. Currently: ${userStats.dips || 0}`,
      requirements: gate.requirements,
    };
  }

  if (gate.requirements.weightedPullUps) {
    const required = gate.requirements.weightedPullUps;
    if (!userStats.weightedPullUpsPercent || userStats.weightedPullUpsPercent < required.weight) {
      return {
        ready: false,
        reason: `Requires ${required.reps} pull-ups @ +${required.weight}% BW`,
        requirements: gate.requirements,
      };
    }
  }

  if (gate.requirements.weightedDips) {
    const required = gate.requirements.weightedDips;
    if (!userStats.weightedDipsPercent || userStats.weightedDipsPercent < required.weight) {
      return {
        ready: false,
        reason: `Requires ${required.reps} dips @ +${required.weight}% BW`,
        requirements: gate.requirements,
      };
    }
  }

  return { ready: true, reason: 'All requirements met' };
}

/**
 * Get recommended training mode for a given exercise category and stage
 */
export function getTrainingMode(
  exerciseCategory: string,
  userStage: UserStage
): { mode: TrainingMode; sets: number; repsInReserve: number; restSeconds: number; notes: string } {
  const isSkill = ['SKILL_STATIC', 'BALANCE'].includes(exerciseCategory);

  if (userStage === 'STAGE_4' && isSkill) {
    // Stage 4 skills: Mode 1 (Buffer) - Quality practice
    return {
      mode: 'BUFFER',
      sets: 6,
      repsInReserve: 3,
      restSeconds: 210,
      notes: 'Quality practice - stay fresh, focus on perfect form. Never train to failure.',
    };
  }

  // All other cases: Mode 2 (Failure) - Strength building
  const stage3Plus = ['STAGE_3', 'STAGE_4'].includes(userStage);

  return {
    mode: 'FAILURE',
    sets: stage3Plus ? 5 : 4,
    repsInReserve: 1,
    restSeconds: stage3Plus ? 105 : 75,
    notes: 'Push hard - build strength and muscle. Train to or near failure.',
  };
}
