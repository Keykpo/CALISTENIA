import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateRoutine, RoutineConfig } from '@/lib/routine-generator';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

async function getUserId(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id as string;
  } catch {}
  const { searchParams } = new URL(req.url);
  const qp = searchParams.get('userId');
  if (qp) return qp;
  const headerUser = req.headers.get('x-user-id');
  if (headerUser) return headerUser;
  return null;
}

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
    const {
      goal = 'balanced',
      daysPerWeek = 3,
      minutesPerSession = 45,
      equipment = ['NONE'],
    } = body;

    // Obtener usuario con hexágono para adaptar rutina
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

    const level = user.fitnessLevel || 'BEGINNER';
    const hexProfile = user.hexagonProfile;

    // Construir configuración de rutina
    const config: RoutineConfig = {
      userId,
      level,
      goal,
      daysPerWeek: Math.min(Math.max(daysPerWeek, 2), 7),
      minutesPerSession: Math.min(Math.max(minutesPerSession, 20), 120),
      equipment,
      weakPoints: hexProfile
        ? {
            relativeStrength: hexProfile.relativeStrength,
            muscularEndurance: hexProfile.muscularEndurance,
            balanceControl: hexProfile.balanceControl,
            jointMobility: hexProfile.jointMobility,
            bodyTension: hexProfile.bodyTension,
            skillTechnique: hexProfile.skillTechnique,
          }
        : undefined,
    };

    // Generar rutina personalizada
    const routine = generateRoutine(config);

    return NextResponse.json({
      success: true,
      routine,
      config: {
        level,
        goal,
        daysPerWeek: config.daysPerWeek,
        minutesPerSession: config.minutesPerSession,
      },
    });
  } catch (e: any) {
    console.error('[API] /api/routines/generate error:', e);
    return NextResponse.json(
      { success: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
