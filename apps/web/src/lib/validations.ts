import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  firstName: z.string().min(1, 'El nombre es requerido').max(50),
  lastName: z.string().max(50).optional(),
  username: z.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(20)
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
});

// ============================================
// SKILL SCHEMAS
// ============================================

export const updateSkillSchema = z.object({
  skillId: z.string().cuid('ID de skill inválido'),
  currentSets: z.number().int().min(0).max(1000).optional(),
  currentReps: z.number().int().min(0).max(10000).optional(),
  currentDuration: z.number().int().min(0).max(86400).optional(), // Max 24 horas
  daysCompleted: z.number().int().min(0).max(365).optional(), // Max 1 año
  // Legacy support para atributos
  strengthLevel: z.number().int().min(0).max(100).optional(),
  enduranceLevel: z.number().int().min(0).max(100).optional(),
  flexibilityLevel: z.number().int().min(0).max(100).optional(),
  balanceLevel: z.number().int().min(0).max(100).optional(),
});

export const unlockSkillSchema = z.object({
  skillId: z.string().cuid('ID de skill inválido').optional(),
  branch: z.string().optional(),
});

// ============================================
// PROFILE SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().max(50).optional(),
  username: z.string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, guiones y guion bajo')
    .optional(),
  bio: z.string().max(500).optional(),
  height: z.number().min(100).max(250).optional(), // cm
  weight: z.number().min(20).max(300).optional(), // kg
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  fitnessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
});

// ============================================
// WORKOUT SCHEMAS
// ============================================

export const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  duration: z.number().int().min(0).max(300).optional(), // minutos
  tags: z.array(z.string()).optional(),
  exercises: z.array(z.object({
    exerciseId: z.string().cuid(),
    order: z.number().int().min(0),
    sets: z.number().int().min(0).max(100).optional(),
    reps: z.number().int().min(0).max(1000).optional(),
    duration: z.number().int().min(0).max(3600).optional(),
    restTime: z.number().int().min(0).max(600).optional(),
    weight: z.number().min(0).max(500).optional(),
    notes: z.string().max(200).optional(),
  })).optional(),
});

// ============================================
// EXERCISE SCHEMAS
// ============================================

export const createExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  instructions: z.string().optional(),
  category: z.enum([
    'STRENGTH',
    'CARDIO',
    'FLEXIBILITY',
    'BALANCE',
    'ENDURANCE',
    'MOBILITY',
    'WARM_UP',
    'COOL_DOWN'
  ]),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  muscleGroups: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  videoUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
});
