import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const createWorkoutSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  duration: z.number().optional(),
  calories: z.number().optional(),
  imageUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  isPublic: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
  exercises: z.array(z.object({
    exerciseId: z.string(),
    order: z.number(),
    sets: z.number().optional(),
    reps: z.number().optional(),
    duration: z.number().optional(),
    restTime: z.number().optional(),
    weight: z.number().optional(),
    notes: z.string().optional(),
  })),
});

// GET - Obtener todos los entrenamientos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const limit = searchParams.get('limit');

    const where: any = {};
    if (category) where.category = category;
    if (level) where.level = level;

    const workouts = await prisma.workout.findMany({
      where,
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            sessions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Error al obtener entrenamientos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo entrenamiento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createWorkoutSchema.parse(body);

    // Verificar que todos los ejercicios existen
    const exerciseIds = validatedData.exercises.map(e => e.exerciseId);
    const existingExercises = await prisma.exercise.findMany({
      where: {
        id: {
          in: exerciseIds,
        },
      },
    });

    if (existingExercises.length !== exerciseIds.length) {
      return NextResponse.json(
        { error: 'Algunos ejercicios no existen' },
        { status: 400 }
      );
    }

    // Crear el entrenamiento con sus ejercicios
    const workout = await prisma.workout.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        difficulty: validatedData.difficulty,
        duration: validatedData.duration,
        calories: validatedData.calories,
        imageUrl: validatedData.imageUrl,
        thumbnailUrl: validatedData.thumbnailUrl,
        isPublic: validatedData.isPublic,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : JSON.stringify([]),
        exercises: {
          create: validatedData.exercises.map(exercise => ({
            exerciseId: exercise.exerciseId,
            order: exercise.order,
            sets: exercise.sets,
            reps: exercise.reps,
            duration: exercise.duration,
            restTime: exercise.restTime,
            weight: exercise.weight,
            notes: exercise.notes,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error('Error al crear entrenamiento:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}