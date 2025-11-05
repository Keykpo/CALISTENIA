import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateWorkoutSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  description: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  duration: z.number().optional(),
  calories: z.number().optional(),
  imageUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  isPublic: z.boolean().optional(),
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
  })).optional(),
});

// GET - Obtener entrenamiento específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workout = await prisma.workout.findUnique({
      where: { id: params.id },
      include: {
        exercises: {
          include: {
            exercise: true,
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
    });

    if (!workout) {
      return NextResponse.json(
        { error: 'Entrenamiento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error al obtener entrenamiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar entrenamiento
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateWorkoutSchema.parse(body);

    // Verificar que el entrenamiento existe
    const existingWorkout = await prisma.workout.findUnique({
      where: { id: params.id },
    });

    if (!existingWorkout) {
      return NextResponse.json(
        { error: 'Entrenamiento no encontrado' },
        { status: 404 }
      );
    }

    // Si se actualizan los ejercicios, verificar que existen
    if (validatedData.exercises) {
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

      // Eliminar ejercicios existentes y crear los nuevos
      await prisma.workoutExercise.deleteMany({
        where: { workoutId: params.id },
      });
    }

    // Actualizar el entrenamiento
    const workout = await prisma.workout.update({
      where: { id: params.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.difficulty && { difficulty: validatedData.difficulty }),
        ...(validatedData.duration !== undefined && { duration: validatedData.duration }),
        ...(validatedData.calories !== undefined && { calories: validatedData.calories }),
        ...(validatedData.imageUrl !== undefined && { imageUrl: validatedData.imageUrl }),
        ...(validatedData.thumbnailUrl !== undefined && { thumbnailUrl: validatedData.thumbnailUrl }),
        ...(validatedData.isPublic !== undefined && { isPublic: validatedData.isPublic }),
        ...(validatedData.tags && { tags: JSON.stringify(validatedData.tags) }),
        ...(validatedData.exercises && {
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
        }),
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error al actualizar entrenamiento:', error);
    
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

// DELETE - Eliminar entrenamiento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que el entrenamiento existe
    const existingWorkout = await prisma.workout.findUnique({
      where: { id: params.id },
    });

    if (!existingWorkout) {
      return NextResponse.json(
        { error: 'Entrenamiento no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el entrenamiento (esto también eliminará los ejercicios relacionados por cascada)
    await prisma.workout.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Entrenamiento eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar entrenamiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}