import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import exercisesData from '@/data/exercises.json';

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

/**
 * GET /api/training/debug
 *
 * Debug endpoint to check user's training setup
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        debug: {
          hasSession: false,
          hasHeaderUserId: false,
        },
      });
    }

    // Fetch user with all relevant relations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hexagonProfile: true,
        skillProgress: true,
        trainingGoals: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        debug: {
          userId,
          userExists: false,
        },
      });
    }

    // Check exercises data
    const exercises = exercisesData as any[];
    const exerciseCategories = new Set(exercises.map(e => e.category));
    const exerciseDifficulties = new Set(exercises.map(e => e.difficulty));

    // Parse user goals
    let userGoals = [];
    try {
      userGoals = user.goals ? JSON.parse(user.goals as string) : [];
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      debug: {
        userId: user.id,
        email: user.email,
        username: user.username,
        hasCompletedAssessment: user.hasCompletedAssessment,

        hexagonProfile: user.hexagonProfile ? {
          hasProfile: true,
          relativeStrengthLevel: user.hexagonProfile.relativeStrengthLevel,
          muscularEnduranceLevel: user.hexagonProfile.muscularEnduranceLevel,
          balanceControlLevel: user.hexagonProfile.balanceControlLevel,
          jointMobilityLevel: user.hexagonProfile.jointMobilityLevel,
          bodyTensionLevel: user.hexagonProfile.bodyTensionLevel,
          skillTechniqueLevel: user.hexagonProfile.skillTechniqueLevel,
        } : {
          hasProfile: false,
          message: 'No hexagon profile found - will use BEGINNER defaults',
        },

        trainingGoals: user.trainingGoals.length > 0 ? {
          hasGoals: true,
          activeGoal: {
            goalType: user.trainingGoals[0].goalType,
            targetArea: user.trainingGoals[0].targetArea,
            preferredDuration: user.trainingGoals[0].preferredDuration,
            name: user.trainingGoals[0].name,
          },
        } : {
          hasGoals: false,
          message: 'No training goals set - using defaults',
        },

        skillProgress: {
          count: user.skillProgress.length,
          branches: user.skillProgress.map(sp => ({
            branch: sp.skillBranch,
            level: sp.currentLevel,
          })),
        },

        userGoals: userGoals,

        exercises: {
          total: exercises.length,
          categories: Array.from(exerciseCategories),
          difficulties: Array.from(exerciseDifficulties),
          sampleExercise: exercises[0] ? {
            id: exercises[0].id,
            name: exercises[0].name,
            category: exercises[0].category,
            difficulty: exercises[0].difficulty,
            equipment: exercises[0].equipment,
          } : null,
        },
      },
    });
  } catch (error: any) {
    console.error('[DEBUG] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      message: error?.message,
      stack: error?.stack,
    });
  }
}
