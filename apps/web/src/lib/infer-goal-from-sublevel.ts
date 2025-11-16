/**
 * ============================================================================
 * GOAL INFERENCE FROM SUBLEVEL
 * ============================================================================
 *
 * Automatically determines the most appropriate training goal based on
 * user's current sublevel and training stage.
 *
 * This simplifies the onboarding flow for new users who don't know
 * what goal to choose.
 *
 * ============================================================================
 */

import type { SubLevel } from './sublevel-system';

export type TrainingGoalType =
  | 'health'         // General health and fitness
  | 'strength'       // Build basic strength
  | 'muscle_mass'    // Hypertrophy/muscle building
  | 'skill_mastery'  // Advanced calisthenics skills
  | 'endurance'      // Cardiovascular endurance
  | 'weight_loss';   // Fat loss and body composition

export interface InferredGoal {
  goalType: TrainingGoalType;
  description: string;
  focusArea?: string;
  rationale: string;
}

/**
 * Infer the most appropriate training goal from user's sublevel
 *
 * LOGIC:
 * - D levels (Beginner): Focus on general health and basic movement patterns
 * - C levels (Novice): Build fundamental strength
 * - B levels (Intermediate): Muscle mass and strength development
 * - A/S levels (Advanced/Expert): Skill mastery and advanced techniques
 */
export function inferGoalFromSubLevel(subLevel: SubLevel | null): InferredGoal {
  if (!subLevel) {
    // No sublevel - assume complete beginner
    return {
      goalType: 'health',
      description: 'Maintain an active and healthy lifestyle',
      rationale: 'Starting with general health for beginners',
    };
  }

  const levelPrefix = subLevel.charAt(0); // D, C, B, A, or S

  switch (levelPrefix) {
    case 'D':
      // BEGINNER (D-, D, D+)
      // Goal: Build healthy habits and basic movement capacity
      return {
        goalType: 'health',
        description: 'Build healthy movement habits and general fitness',
        rationale: 'Beginner level - focus on consistency and proper form',
      };

    case 'C':
      // NOVICE (C-, C, C+)
      // Goal: Develop fundamental strength
      return {
        goalType: 'strength',
        description: 'Develop fundamental strength and power',
        rationale: 'Novice level - building strength foundation',
      };

    case 'B':
      // INTERMEDIATE (B-, B, B+)
      // Goal: Muscle mass and hypertrophy
      return {
        goalType: 'muscle_mass',
        description: 'Build muscle mass and improve body composition',
        rationale: 'Intermediate level - hypertrophy and muscle development',
      };

    case 'A':
      // ADVANCED (A-, A, A+)
      // Goal: Skill mastery
      return {
        goalType: 'skill_mastery',
        description: 'Master advanced calisthenics skills',
        rationale: 'Advanced level - focus on skill development',
      };

    case 'S':
      // EXPERT (S-, S, S+)
      // Goal: Elite skill mastery and refinement
      return {
        goalType: 'skill_mastery',
        description: 'Perfect elite-level calisthenics skills',
        rationale: 'Expert level - mastering the most advanced skills',
      };

    default:
      // Fallback
      return {
        goalType: 'health',
        description: 'Maintain an active and healthy lifestyle',
        rationale: 'Default goal for general fitness',
      };
  }
}

/**
 * Infer goal from user metrics (when sublevel is not available)
 */
export function inferGoalFromMetrics(pullUps: number, dips: number): InferredGoal {
  // Use same logic as determineSubLevel but simplified
  if (pullUps === 0 && dips < 5) {
    return inferGoalFromSubLevel('D_MINUS');
  } else if (pullUps < 4) {
    return inferGoalFromSubLevel('D');
  } else if (pullUps < 8) {
    return inferGoalFromSubLevel('D_PLUS');
  } else if (pullUps < 11) {
    return inferGoalFromSubLevel('C_MINUS');
  } else if (pullUps < 15) {
    return inferGoalFromSubLevel('C');
  } else if (pullUps < 20) {
    return inferGoalFromSubLevel('C_PLUS');
  } else if (pullUps < 25) {
    return inferGoalFromSubLevel('B_MINUS');
  } else if (pullUps < 30) {
    return inferGoalFromSubLevel('B');
  } else if (pullUps < 35) {
    return inferGoalFromSubLevel('B_PLUS');
  } else if (pullUps < 40) {
    return inferGoalFromSubLevel('A_MINUS');
  } else if (pullUps < 45) {
    return inferGoalFromSubLevel('A');
  } else if (pullUps < 50) {
    return inferGoalFromSubLevel('A_PLUS');
  } else if (pullUps < 60) {
    return inferGoalFromSubLevel('S_MINUS');
  } else if (pullUps < 70) {
    return inferGoalFromSubLevel('S');
  } else {
    return inferGoalFromSubLevel('S_PLUS');
  }
}

/**
 * Get user-friendly explanation for the inferred goal
 */
export function getGoalExplanation(goal: InferredGoal): string {
  const explanations: Record<TrainingGoalType, string> = {
    health: '🌱 Perfect for building consistency and learning proper form. Your workouts will focus on balanced, sustainable fitness.',
    strength: '💪 Your workouts will emphasize fundamental strength development with progressive overload.',
    muscle_mass: '🔥 Your routines will optimize for muscle growth with higher volume and hypertrophy protocols.',
    skill_mastery: '⭐ Your training will include advanced skill progressions and technique refinement.',
    endurance: '🏃 Your workouts will focus on cardiovascular and muscular endurance.',
    weight_loss: '📉 Your routines will emphasize calorie burn and metabolic conditioning.',
  };

  return explanations[goal.goalType] || 'Your workouts will be personalized to your level.';
}
