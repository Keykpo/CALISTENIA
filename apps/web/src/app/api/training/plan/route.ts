import { NextResponse } from 'next/server';
import { generatePlan } from '@/lib/routine';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const goal = (url.searchParams.get('goal') || 'strength') as any;
    const level = (url.searchParams.get('level') || 'BEGINNER') as any;
    const durationMin = parseInt(url.searchParams.get('durationMin') || '30', 10);

    const plan = generatePlan({ goal, level, durationMin });
    return NextResponse.json({ ok: true, plan });
  } catch (error) {
    console.error('plan GET error:', error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}