import { NextResponse } from 'next/server';
import { generatePlan } from '@/lib/routine';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const goal = (url.searchParams.get('goal') || 'strength') as any;
    const level = (url.searchParams.get('level') || 'BEGINNER') as any;
    const durationMin = parseInt(url.searchParams.get('durationMin') || '30', 10);
    const hexagon = {
      relativeStrength: Number(url.searchParams.get('rs') || 60),
      endurance: Number(url.searchParams.get('en') || 60),
      bodyTension: Number(url.searchParams.get('bt') || 60),
      balanceControl: Number(url.searchParams.get('bc') || 60),
      mobility: Number(url.searchParams.get('mb') || 60),
      skillTechnique: Number(url.searchParams.get('st') || 60),
    };
    const fitnessLevelParam = Number(url.searchParams.get('fl') || 50);
    const week = Number(url.searchParams.get('week') || 1);
    const userId = url.searchParams.get('userId');

    let fitnessLevel = fitnessLevelParam;
    let hex = hexagon;

    if (userId) {
      try {
        const profile = await prisma.hexagonProfile.findUnique({ where: { userId } });
        if (profile) {
          fitnessLevel = profile.fitnessLevel ?? fitnessLevelParam;
          hex = {
            relativeStrength: profile.relativeStrength ?? hexagon.relativeStrength,
            endurance: profile.endurance ?? hexagon.endurance,
            bodyTension: profile.bodyTension ?? hexagon.bodyTension,
            balanceControl: profile.balanceControl ?? hexagon.balanceControl,
            mobility: profile.mobility ?? hexagon.mobility,
            skillTechnique: profile.skillTechnique ?? hexagon.skillTechnique,
          };
        }
      } catch (e) {
        // ignore DB error, fallback to params
      }
    }

    const plan = generatePlan({ goal, level, durationMin, hexagon: hex, fitnessLevel, week });
    return NextResponse.json({ ok: true, plan });
  } catch (error) {
    console.error('plan GET error:', error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}