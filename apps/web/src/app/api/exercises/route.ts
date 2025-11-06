import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

// Normalization helpers for new 5-level rank scale (D, C, B, A, S)
const normalizeIncomingRank = (r?: string) => {
  const rr = (r || '').toUpperCase();
  if (rr === 'F' || rr === 'E') return 'D'; // legacy -> D
  if (["D","C","B","A","S"].includes(rr)) return rr;
  return undefined;
};

// Map rank to legacy Difficulty for backward compatibility when needed
const rankToDifficultyNormalized = (r?: string) => {
  const rr = (r || '').toUpperCase();
  if (rr === 'S') return 'EXPERT';
  if (rr === 'A' || rr === 'B') return 'ADVANCED';
  if (rr === 'C') return 'INTERMEDIATE';
  if (rr === 'D') return 'BEGINNER';
  return undefined;
};

const createExerciseSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  instructions: z.array(z.string()).min(1, 'Las instrucciones son requeridas'),
  category: z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'BALANCE', 'ENDURANCE', 'MOBILITY', 'WARM_UP', 'COOL_DOWN']),
  // Accept legacy difficulty or new rank. We'll convert rank -> difficulty.
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  rank: z.enum(['F','E','D','C','B','A','S']).optional(),
  muscleGroups: z.array(z.enum(['CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'CORE', 'LEGS', 'GLUTES', 'FULL_BODY'])),
  equipment: z.array(z.enum(['NONE', 'PULL_UP_BAR', 'RESISTANCE_BANDS', 'DUMBBELLS', 'KETTLEBELL', 'YOGA_MAT', 'FOAM_ROLLER', 'MEDICINE_BALL'])).optional(),
  duration: z.number().optional(),
  calories: z.number().optional(),
  videoUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
});

// GET - Obtener todos los ejercicios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const rank = searchParams.get('rank');
    const muscleGroup = searchParams.get('muscleGroup');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');

    const andFilters: any[] = [];
    
    if (category) andFilters.push({ category });
    // Difficulty filter (legacy)
    if (difficulty) andFilters.push({ difficulty });
    // Rank filter: prefer rank column, fallback to mapped difficulty
    else if (rank) {
      const normalized = normalizeIncomingRank(rank);
      if (normalized) {
        const d = rankToDifficultyNormalized(normalized);
        const orRankDiff = [ { rank: normalized } ];
        if (d) orRankDiff.push({ difficulty: d });
        andFilters.push({ OR: orRankDiff });
      }
    }
    if (muscleGroup) {
      andFilters.push({
        muscleGroups: {
          has: muscleGroup,
        }
      });
    }
    if (search) {
      andFilters.push({
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
          { category: { contains: search } },
        ]
      });
    }

    const exercises = await prisma.exercise.findMany({
      where: andFilters.length ? { AND: andFilters } : {},
      orderBy: {
        name: 'asc',
      },
      take: limit ? parseInt(limit) : undefined,
    });

    // Parse JSON fields for frontend consumption
    const exercisesWithParsedFields = exercises.map(exercise => ({
      ...exercise,
      instructions: JSON.parse(exercise.instructions),
      muscleGroups: JSON.parse(exercise.muscleGroups),
      equipment: JSON.parse(exercise.equipment),
    }));

    return NextResponse.json(exercisesWithParsedFields);
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo ejercicio
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
    const validatedData = createExerciseSchema.parse(body);

    // Determine fields to persist
    const normalizedRank = normalizeIncomingRank(validatedData.rank);
    const finalDifficulty = validatedData.difficulty ?? rankToDifficultyNormalized(normalizedRank);
    if (!finalDifficulty && !normalizedRank) {
      return NextResponse.json(
        { error: 'Debe especificar "difficulty" o "rank" válido' },
        { status: 400 }
      );
    }

    // Verificar que no existe un ejercicio con el mismo nombre
    const existingExercise = await prisma.exercise.findFirst({
      where: {
        name: {
          equals: validatedData.name,
        },
      },
    });

    if (existingExercise) {
      return NextResponse.json(
        { error: 'Ya existe un ejercicio con ese nombre' },
        { status: 400 }
      );
    }

    const exercise = await prisma.exercise.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        instructions: JSON.stringify(validatedData.instructions),
        category: validatedData.category,
        difficulty: finalDifficulty as any,
        // Persist rank when provided (normalized), otherwise omit
        ...(normalizedRank ? { rank: normalizedRank as any } : {}),
        muscleGroups: JSON.stringify(validatedData.muscleGroups),
        equipment: validatedData.equipment ? JSON.stringify(validatedData.equipment) : JSON.stringify([]),
        duration: validatedData.duration,
        calories: validatedData.calories,
        videoUrl: validatedData.videoUrl,
        imageUrl: validatedData.imageUrl,
        thumbnailUrl: validatedData.thumbnailUrl,
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Error al crear ejercicio:', error);
    
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