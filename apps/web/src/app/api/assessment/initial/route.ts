import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import { z } from 'zod';

const HexagonSchema = z.object({
  relativeStrength: z.number().min(0).max(10),
  muscularEndurance: z.number().min(0).max(10),
  balanceControl: z.number().min(0).max(10),
  jointMobility: z.number().min(0).max(10),
  bodyTension: z.number().min(0).max(10),
  skillTechnique: z.number().min(0).max(10),
});

function computeFitnessLevel(avg: number) {
  if (avg < 2.5) return 'BEGINNER';
  if (avg < 4.0) return 'NOVICE';
  if (avg < 6.0) return 'INTERMEDIATE';
  if (avg < 8.0) return 'ADVANCED';
  return 'ELITE';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = HexagonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid assessment data', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const values = parsed.data;
    const avg = (
      values.relativeStrength +
      values.muscularEndurance +
      values.balanceControl +
      values.jointMobility +
      values.bodyTension +
      values.skillTechnique
    ) / 6;
    const fitnessLevel = computeFitnessLevel(avg);

    const session = await getServerSession(authOptions as any);
    let saved = null as any;

    if (session?.user?.id) {
      // Upsert hexagon profile for user
      saved = await prisma.hexagonProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          ...values,
        },
        update: {
          ...values,
        },
      });

      // Mark assessment completed and update fitness level
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          hasCompletedAssessment: true,
          assessmentDate: new Date(),
          fitnessLevel,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      hexagon: values,
      fitnessLevel,
      saved: Boolean(saved),
    });
  } catch (error) {
    console.error('Assessment POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process assessment' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const profile = await prisma.hexagonProfile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      ok: true,
      profile,
    });
  } catch (error) {
    console.error('Assessment GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment profile' },
      { status: 500 }
    );
  }
}