import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ApiError } from '../utils/errors';
import { logger } from '../config/logger';

// Validation target types
type ValidationTarget = 'body' | 'query' | 'params' | 'headers';

// Validation options
interface ValidationOptions {
  stripUnknown?: boolean;
  allowUnknown?: boolean;
  abortEarly?: boolean;
}

/**
 * Generic validation middleware factory
 */
export const validate = (
  schema: ZodSchema,
  target: ValidationTarget = 'body',
  options: ValidationOptions = {}
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[target];
      
      // Parse and validate data
      const result = schema.safeParse(data);
      
      if (!result.success) {
        const errors = formatZodErrors(result.error);
        logger.warn('Validation failed:', {
          target,
          errors,
          data: target === 'body' ? req.body : data,
        });
        
        throw new ApiError(400, 'Validation failed', { errors });
      }

      // Replace the original data with validated data
      req[target] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema: ZodSchema, options?: ValidationOptions) => {
  return validate(schema, 'body', options);
};

/**
 * Validate query parameters
 */
export const validateQuery = (schema: ZodSchema, options?: ValidationOptions) => {
  return validate(schema, 'query', options);
};

/**
 * Validate route parameters
 */
export const validateParams = (schema: ZodSchema, options?: ValidationOptions) => {
  return validate(schema, 'params', options);
};

/**
 * Validate headers
 */
export const validateHeaders = (schema: ZodSchema, options?: ValidationOptions) => {
  return validate(schema, 'headers', options);
};

/**
 * Format Zod validation errors
 */
const formatZodErrors = (error: ZodError) => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
    received: err.code === 'invalid_type' ? (err as any).received : undefined,
    expected: err.code === 'invalid_type' ? (err as any).expected : undefined,
  }));
};

// Common validation schemas
export const commonSchemas = {
  // ID validation
  id: z.string().uuid('Invalid ID format'),
  
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),

  // Search
  search: z.object({
    q: z.string().min(1).max(100).optional(),
    category: z.string().optional(),
    tags: z.string().optional(),
  }),

  // Date range
  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }).refine(
    (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  ),

  // File upload
  fileUpload: z.object({
    filename: z.string().min(1).max(255),
    mimetype: z.string().min(1),
    size: z.number().int().min(1).max(10 * 1024 * 1024), // 10MB max
  }),
};

// User validation schemas
export const userSchemas = {
  register: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    firstName: z.string().min(1).max(50).trim(),
    lastName: z.string().min(1).max(50).trim(),
    dateOfBirth: z.coerce.date().max(new Date(), 'Date of birth cannot be in the future'),
    acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  }),

  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),

  updateProfile: z.object({
    firstName: z.string().min(1).max(50).trim().optional(),
    lastName: z.string().min(1).max(50).trim().optional(),
    bio: z.string().max(500).trim().optional(),
    location: z.string().max(100).trim().optional(),
    website: z.string().url().optional().or(z.literal('')),
    isPublic: z.boolean().optional(),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    confirmPassword: z.string(),
  }).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  ),

  forgotPassword: z.object({
    email: z.string().email('Invalid email format'),
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    confirmPassword: z.string(),
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  ),
};

// Workout validation schemas
export const workoutSchemas = {
  create: z.object({
    name: z.string().min(1).max(100).trim(),
    description: z.string().max(1000).trim().optional(),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    duration: z.number().int().min(1).max(300), // 1-300 minutes
    category: z.string().min(1).max(50).trim(),
    tags: z.array(z.string().min(1).max(30).trim()).max(10).optional(),
    isPublic: z.boolean().default(false),
    exercises: z.array(z.object({
      exerciseId: z.string().uuid(),
      order: z.number().int().min(1),
      sets: z.number().int().min(1).max(10),
      reps: z.number().int().min(1).max(1000).optional(),
      duration: z.number().int().min(1).max(3600).optional(), // seconds
      restTime: z.number().int().min(0).max(600).optional(), // seconds
      weight: z.number().min(0).max(1000).optional(), // kg
      notes: z.string().max(200).trim().optional(),
    })).min(1).max(20),
  }),

  update: z.object({
    name: z.string().min(1).max(100).trim().optional(),
    description: z.string().max(1000).trim().optional(),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    duration: z.number().int().min(1).max(300).optional(),
    category: z.string().min(1).max(50).trim().optional(),
    tags: z.array(z.string().min(1).max(30).trim()).max(10).optional(),
    isPublic: z.boolean().optional(),
  }),

  startSession: z.object({
    workoutId: z.string().uuid(),
    notes: z.string().max(500).trim().optional(),
  }),

  updateSession: z.object({
    status: z.enum(['IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
    notes: z.string().max(500).trim().optional(),
    exercises: z.array(z.object({
      exerciseId: z.string().uuid(),
      sets: z.array(z.object({
        reps: z.number().int().min(0).max(1000).optional(),
        weight: z.number().min(0).max(1000).optional(),
        duration: z.number().int().min(0).max(3600).optional(),
        completed: z.boolean(),
      })),
    })).optional(),
  }),
};

// Course validation schemas
export const courseSchemas = {
  create: z.object({
    title: z.string().min(1).max(200).trim(),
    description: z.string().min(1).max(2000).trim(),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    category: z.string().min(1).max(50).trim(),
    tags: z.array(z.string().min(1).max(30).trim()).max(10).optional(),
    price: z.number().min(0).max(999.99).optional(),
    isPremium: z.boolean().default(false),
    isPublished: z.boolean().default(false),
    estimatedDuration: z.number().int().min(1).max(10080), // minutes, max 1 week
  }),

  createLesson: z.object({
    title: z.string().min(1).max(200).trim(),
    description: z.string().max(1000).trim().optional(),
    content: z.string().min(1).max(10000).trim(),
    order: z.number().int().min(1),
    duration: z.number().int().min(1).max(1440), // minutes, max 24 hours
    videoUrl: z.string().url().optional(),
    resources: z.array(z.object({
      name: z.string().min(1).max(100).trim(),
      url: z.string().url(),
      type: z.enum(['PDF', 'VIDEO', 'AUDIO', 'LINK', 'OTHER']),
    })).max(10).optional(),
  }),
};

// Community validation schemas
export const communitySchemas = {
  createPost: z.object({
    title: z.string().min(1).max(200).trim(),
    content: z.string().min(1).max(2000).trim(),
    category: z.string().min(1).max(50).trim(),
    tags: z.array(z.string().min(1).max(30).trim()).max(10).optional(),
    isPublic: z.boolean().default(true),
  }),

  updatePost: z.object({
    title: z.string().min(1).max(200).trim().optional(),
    content: z.string().min(1).max(2000).trim().optional(),
    category: z.string().min(1).max(50).trim().optional(),
    tags: z.array(z.string().min(1).max(30).trim()).max(10).optional(),
    isPublic: z.boolean().optional(),
  }),

  createComment: z.object({
    content: z.string().min(1).max(500).trim(),
    parentId: z.string().uuid().optional(),
  }),

  updateComment: z.object({
    content: z.string().min(1).max(500).trim(),
  }),
};

// Progress validation schemas
export const progressSchemas = {
  create: z.object({
    date: z.coerce.date().max(new Date(), 'Date cannot be in the future'),
    weight: z.number().min(20).max(500).optional(), // kg
    bodyFat: z.number().min(1).max(50).optional(), // percentage
    muscleMass: z.number().min(10).max(200).optional(), // kg
    measurements: z.object({
      chest: z.number().min(50).max(200).optional(), // cm
      waist: z.number().min(50).max(200).optional(),
      hips: z.number().min(50).max(200).optional(),
      biceps: z.number().min(15).max(60).optional(),
      thighs: z.number().min(30).max(100).optional(),
    }).optional(),
    notes: z.string().max(500).trim().optional(),
    photos: z.array(z.string().url()).max(5).optional(),
  }),

  update: z.object({
    weight: z.number().min(20).max(500).optional(),
    bodyFat: z.number().min(1).max(50).optional(),
    muscleMass: z.number().min(10).max(200).optional(),
    measurements: z.object({
      chest: z.number().min(50).max(200).optional(),
      waist: z.number().min(50).max(200).optional(),
      hips: z.number().min(50).max(200).optional(),
      biceps: z.number().min(15).max(60).optional(),
      thighs: z.number().min(30).max(100).optional(),
    }).optional(),
    notes: z.string().max(500).trim().optional(),
    photos: z.array(z.string().url()).max(5).optional(),
  }),
};