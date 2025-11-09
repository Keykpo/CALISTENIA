import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { initializeHexagonProfile, type HexagonAxis } from '@/lib/hexagon-progression';

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
    PUSH: z.number(),
    PULL: z.number(),
    CORE: z.number(),
    BALANCE: z.number(),
    STATIC: z.number(),
    MOBILITY: z.number(),
    ENDURANCE: z.number(),
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
    // Scores from assessment are already on 0-10 scale
    const scoreAverages = {
      relativeStrength: (data.scores.PUSH + data.scores.PULL) / 2,
      muscularEndurance: (data.scores.CORE + data.scores.ENDURANCE) / 2,
      balanceControl: (data.scores.BALANCE + data.scores.STATIC) / 2,
      jointMobility: (data.scores.MOBILITY + data.scores.BALANCE) / 2,
      bodyTension: (data.scores.CORE + data.scores.STATIC) / 2,
      skillTechnique: (data.scores.STATIC + data.scores.BALANCE) / 2,
    };

    // Calculate initial XP based on assessment scores and overall level
    // Uses mid-point of each level range to represent realistic 3-year progression
    const levelToBaseXP: Record<string, number> = {
      BEGINNER: 24000,      // Mid-point of BEGINNER range (0-48,000 XP)
      INTERMEDIATE: 96000,  // Mid-point of INTERMEDIATE range (48,000-144,000 XP)
      ADVANCED: 264000,     // Mid-point of ADVANCED range (144,000-384,000 XP)
      EXPERT: 500000,       // Well into ELITE range (384,000+ XP)
    };

    const baseXP = levelToBaseXP[data.overallLevel] || 24000; // Default to BEGINNER mid-point

    // Calculate XP for each axis based on its score relative to the base
    const initialXP: Partial<Record<HexagonAxis, number>> = {};
    Object.entries(scoreAverages).forEach(([axis, score]) => {
      // Convert 0-10 score to XP multiplier (0.5 to 1.5 range)
      const multiplier = 0.5 + (score / 10);
      initialXP[axis as HexagonAxis] = Math.round(baseXP * multiplier);
    });

    // Initialize complete hexagon profile with XP
    const hexagonProfile = initializeHexagonProfile(initialXP);

    // Update or create hexagon profile with full XP data
    if (user.hexagonProfile) {
      await prisma.hexagonProfile.update({
        where: { userId },
        data: {
          // Visual values (0-10)
          relativeStrength: hexagonProfile.relativeStrength,
          muscularEndurance: hexagonProfile.muscularEndurance,
          balanceControl: hexagonProfile.balanceControl,
          jointMobility: hexagonProfile.jointMobility,
          bodyTension: hexagonProfile.bodyTension,
          skillTechnique: hexagonProfile.skillTechnique,
          // XP values
          relativeStrengthXP: hexagonProfile.relativeStrengthXP,
          muscularEnduranceXP: hexagonProfile.muscularEnduranceXP,
          balanceControlXP: hexagonProfile.balanceControlXP,
          jointMobilityXP: hexagonProfile.jointMobilityXP,
          bodyTensionXP: hexagonProfile.bodyTensionXP,
          skillTechniqueXP: hexagonProfile.skillTechniqueXP,
          // Level values
          relativeStrengthLevel: hexagonProfile.relativeStrengthLevel,
          muscularEnduranceLevel: hexagonProfile.muscularEnduranceLevel,
          balanceControlLevel: hexagonProfile.balanceControlLevel,
          jointMobilityLevel: hexagonProfile.jointMobilityLevel,
          bodyTensionLevel: hexagonProfile.bodyTensionLevel,
          skillTechniqueLevel: hexagonProfile.skillTechniqueLevel,
        },
      });
    } else {
      await prisma.hexagonProfile.create({
        data: {
          userId,
          // Visual values (0-10)
          relativeStrength: hexagonProfile.relativeStrength,
          muscularEndurance: hexagonProfile.muscularEndurance,
          balanceControl: hexagonProfile.balanceControl,
          jointMobility: hexagonProfile.jointMobility,
          bodyTension: hexagonProfile.bodyTension,
          skillTechnique: hexagonProfile.skillTechnique,
          // XP values
          relativeStrengthXP: hexagonProfile.relativeStrengthXP,
          muscularEnduranceXP: hexagonProfile.muscularEnduranceXP,
          balanceControlXP: hexagonProfile.balanceControlXP,
          jointMobilityXP: hexagonProfile.jointMobilityXP,
          bodyTensionXP: hexagonProfile.bodyTensionXP,
          skillTechniqueXP: hexagonProfile.skillTechniqueXP,
          // Level values
          relativeStrengthLevel: hexagonProfile.relativeStrengthLevel,
          muscularEnduranceLevel: hexagonProfile.muscularEnduranceLevel,
          balanceControlLevel: hexagonProfile.balanceControlLevel,
          jointMobilityLevel: hexagonProfile.jointMobilityLevel,
          bodyTensionLevel: hexagonProfile.bodyTensionLevel,
          skillTechniqueLevel: hexagonProfile.skillTechniqueLevel,
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
        hexagonProfile: hexagonProfile,
        goal: data.goal,
        branchScores: data.scores,
        suggestedStrength,
        initialXP, // Include initial XP for debugging/reference
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
