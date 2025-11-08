import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

export const runtime = 'nodejs';

async function getUserId(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id as string;
  } catch {}
  const headerUser = req.headers.get('x-user-id');
  if (headerUser) return headerUser;
  return null;
}

const assessmentSchema = z.object({
  userId: z.string(),
  answers: z.record(z.string()),
  scores: z.object({
    EMPUJE: z.number(),
    TRACCION: z.number(),
    CORE: z.number(),
    EQUILIBRIO: z.number(),
    TREN_INFERIOR: z.number(),
    ESTATICOS: z.number(),
  }),
  goal: z.string(),
  experience: z.string(),
  availability: z.string(),
  overallLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const data = assessmentSchema.parse(body);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { hexagonProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Calculate hexagon values based on scores
    // Scores are 1-4, we'll map them to 0-10 for the hexagon
    const mapScoreToHexagon = (score: number): number => {
      // Score 1 = 2.0, Score 2 = 4.0, Score 3 = 6.5, Score 4 = 9.0
      const mapping: Record<number, number> = {
        1: 2.0,
        1.5: 3.0,
        2: 4.0,
        2.5: 5.0,
        3: 6.5,
        3.5: 7.5,
        4: 9.0,
      };
      return mapping[score] || score * 2.25;
    };

    const hexagonValues = {
      relativeStrength: mapScoreToHexagon((data.scores.EMPUJE + data.scores.TRACCION) / 2),
      muscularEndurance: mapScoreToHexagon((data.scores.EMPUJE + data.scores.CORE) / 2),
      balanceControl: mapScoreToHexagon((data.scores.EQUILIBRIO + data.scores.CORE) / 2),
      jointMobility: mapScoreToHexagon((data.scores.TREN_INFERIOR + data.scores.EQUILIBRIO) / 2),
      bodyTension: mapScoreToHexagon((data.scores.CORE + data.scores.ESTATICOS) / 2),
      skillTechnique: mapScoreToHexagon((data.scores.ESTATICOS + data.scores.EQUILIBRIO) / 2),
    };

    // Update or create hexagon profile
    if (user.hexagonProfile) {
      await prisma.hexagonProfile.update({
        where: { userId },
        data: hexagonValues,
      });
    } else {
      await prisma.hexagonProfile.create({
        data: {
          userId,
          ...hexagonValues,
        },
      });
    }

    // Update user with fitness level and goal
    const currentGoals = user.goals ? JSON.parse(user.goals as string) : [];
    const updatedGoals = Array.isArray(currentGoals) ? currentGoals : [];

    // Add the new goal if not already present
    if (!updatedGoals.includes(data.goal)) {
      updatedGoals.push(data.goal);
    }

    // 🔥 INTERRUPTOR DEL BUCLE - Actualizar usuario con assessment completado
    await prisma.user.update({
      where: { id: userId },
      data: {
        fitnessLevel: data.overallLevel,
        goals: JSON.stringify(updatedGoals),
        hasCompletedAssessment: true,  // 🎯 INTERRUPTOR ACTIVADO
        assessmentDate: new Date(),    // Registro de cuándo completó
      },
    });

    // Store the assessment results for future reference
    // We'll store this as JSON in a metadata field or create a separate table
    // For now, let's create a simple assessment record
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS UserAssessment (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          answers TEXT NOT NULL,
          scores TEXT NOT NULL,
          goal TEXT NOT NULL,
          experience TEXT NOT NULL,
          availability TEXT NOT NULL,
          overallLevel TEXT NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
        )
      `;
    } catch (e) {
      // Table might already exist
    }

    // Insert assessment record
    const assessmentId = `assessment_${userId}_${Date.now()}`;
    try {
      await prisma.$executeRaw`
        INSERT INTO UserAssessment (id, userId, answers, scores, goal, experience, availability, overallLevel)
        VALUES (
          ${assessmentId},
          ${userId},
          ${JSON.stringify(data.answers)},
          ${JSON.stringify(data.scores)},
          ${data.goal},
          ${data.experience},
          ${data.availability},
          ${data.overallLevel}
        )
      `;
    } catch (e) {
      console.error('Error storing assessment:', e);
      // Non-critical, continue
    }

    // Calculate suggested starting strength for skills based on level
    const strengthByLevel: Record<string, number> = {
      BEGINNER: 5,
      INTERMEDIATE: 15,
      ADVANCED: 30,
      EXPERT: 50,
    };

    const suggestedStrength = strengthByLevel[data.overallLevel] || 5;

    return NextResponse.json({
      success: true,
      message: 'Evaluación completada exitosamente',
      redirectTo: '/onboarding/results',
      results: {
        fitnessLevel: data.overallLevel,
        hexagonProfile: hexagonValues,
        goal: data.goal,
        branchScores: data.scores,
        suggestedStrength,
      },
    });
  } catch (error: any) {
    console.error('Error processing assessment:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos de evaluación inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error?.message || 'Error al procesar la evaluación' },
      { status: 500 }
    );
  }
}
