/**
 * Warmup Protocol Type Definitions
 * Based on RUTINAS_POR_NIVEL detailed warmup protocols
 */

export type SessionType =
  | 'PUSH'
  | 'PULL'
  | 'LEGS'
  | 'SKILLS'
  | 'FULL_BODY'
  | 'HANDSTAND'
  | 'PLANCHE'
  | 'FRONT_LEVER'
  | 'WEIGHTED';

export type WarmupLevel = 'BEGINNER' | 'NOVICE' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface WarmupExercise {
  name: string;
  duration?: number; // seconds
  reps?: number | string; // Can be "10-15" or just 10
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
}

export interface WarmupProtocol {
  id: string;
  name: string;
  duration: number; // total minutes
  mandatory: SessionType[] | ['ALL']; // Which session types require this
  description: string;
  exercises: WarmupExercise[];
  levelVariation?: {
    beginner: string[]; // Exercise IDs to include for beginners
    intermediate: string[]; // Exercise IDs for intermediate
    advanced: string[]; // Exercise IDs for advanced/expert
  };
}

export interface CooldownExercise {
  name: string;
  duration: number; // seconds
  instructions: string[];
  targetMuscles: string[];
}

export interface CooldownPhase {
  name: string;
  duration: number; // minutes
  exercises: CooldownExercise[];
}

export interface CooldownProtocol {
  id: string;
  name: string;
  totalDuration: number; // minutes
  phases: CooldownPhase[];
  specificTo?: SessionType;
}

export interface CompleteWarmup {
  protocols: WarmupProtocol[];
  totalDuration: number;
  sessionType: SessionType;
  level: WarmupLevel;
}
