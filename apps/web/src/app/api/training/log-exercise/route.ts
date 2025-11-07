import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import { z } from 'zod';

const LogSchema = z.object({
  name: z.string().min(2),
  reps: z.number().int().min(0).optional(),
  durationSec: z.number().int().min(0).optional(),
});

function clamp01to10(v: number) {
  return Math.max(0, Math.min(10, v));
}

function computeIncrements({ name, reps = 0, durationSec = 0 }: { name: string; reps?: number; durationSec?: number }) {
  const n = name.toLowerCase();
  const inc = {
    relativeStrength: 0,
    muscularEndurance: 0,
    balanceControl: 0,
    jointMobility: 0,
    bodyTension: 0,
    skillTechnique: 0.05, // small baseline improvement per exercise
  };

  // Strength-oriented
  if (/(push|pull|squat|dip|press|row)/.test(n)) {
    inc.relativeStrength += Math.min(0.5, reps * 0.03) + Math.min(0.4, durationSec * 0.005);
  }

  // Endurance-oriented
  if (/(jumping jacks|burpee|run|cardio|mountain climber|high knees)/.test(n)) {
    inc.muscularEndurance += Math.min(0.6, (reps || durationSec / 5) * 0.02);
  }

  // Core tension / static holds
  if (/(plank|hollow|l-sit|dragon flag|hold|bridge)/.test(n)) {
    inc.bodyTension += Math.min(0.6, durationSec * 0.01) + Math.min(0.3, reps * 0.02);
  }

  // Balance & control (handstand, pistols, balance)
  if (/(handstand|pistol|balance|arabesque|tuck|crow)/.test(n)) {
    inc.balanceControl += Math.min(0.5, durationSec * 0.01) + Math.min(0.4, reps * 0.02);
  }

  // Mobility
  if (/(mobility|stretch|flexibility|hip opener|thoracic|shoulder dislocate)/.test(n)) {
    inc.jointMobility += Math.min(0.5, durationSec * 0.01) + Math.min(0.3, reps * 0.02);
  }

  // Technique emphasis (skills)
  if (/(muscle up|front lever|back lever|planche|human flag)/.test(n)) {
    inc.skillTechnique += Math.min(0.6, durationSec * 0.01) + Math.min(0.4, reps * 0.02);
  }

  return inc;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = LogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 });
    }

    const inc = computeIncrements(parsed.data);

    // Fetch existing hexagon profile or create defaults
    const current = await prisma.hexagonProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        relativeStrength: 0,
        muscularEndurance: 0,
        balanceControl: 0,
        jointMobility: 0,
        bodyTension: 0,
        skillTechnique: 0,
      },
      update: {},
    });

    const updated = await prisma.hexagonProfile.update({
      where: { userId: session.user.id },
      data: {
        relativeStrength: clamp01to10(current.relativeStrength + inc.relativeStrength),
        muscularEndurance: clamp01to10(current.muscularEndurance + inc.muscularEndurance),
        balanceControl: clamp01to10(current.balanceControl + inc.balanceControl),
        jointMobility: clamp01to10(current.jointMobility + inc.jointMobility),
        bodyTension: clamp01to10(current.bodyTension + inc.bodyTension),
        skillTechnique: clamp01to10(current.skillTechnique + inc.skillTechnique),
      },
    });

    // Basic XP update: reps and time contribute
    const xpGain = Math.round((parsed.data.reps || 0) * 2 + (parsed.data.durationSec || 0) * 0.5);
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalXP: { increment: xpGain },
        totalStrength: { increment: Math.round((parsed.data.reps || 0) * 0.5 + (parsed.data.durationSec || 0) * 0.2) },
      },
    });

    return NextResponse.json({ ok: true, hexagon: updated, xpGain });
  } catch (error) {
    console.error('log-exercise error:', error);
    return NextResponse.json({ error: 'Failed to log exercise' }, { status: 500 });
  }
}