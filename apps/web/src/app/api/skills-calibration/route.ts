import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type HexagonAxis =
  | 'fuerzaRelativa'
  | 'resistenciaMuscular'
  | 'controlEquilibrio'
  | 'movilidadArticular'
  | 'tensionCorporal'
  | 'tecnica';

const DEFAULT_TARGETS: Record<HexagonAxis, number> = {
  fuerzaRelativa: 500,
  resistenciaMuscular: 800,
  controlEquilibrio: 300,
  movilidadArticular: 300,
  tensionCorporal: 400,
  tecnica: 250,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const axisParam = searchParams.get('axis') as HexagonAxis | null;

    if (axisParam) {
      const record = await prisma.skillsCalibration.findUnique({
        where: { axis: axisParam },
      });

      const payload = {
        axis: axisParam,
        targetValue: record?.targetValue ?? DEFAULT_TARGETS[axisParam],
        percentiles: {
          p25: record?.p25 ?? null,
          p50: record?.p50 ?? null,
          p75: record?.p75 ?? null,
          p90: record?.p90 ?? null,
        },
        samples: record?.samples ?? 0,
        updatedAt: record?.updatedAt ?? null,
        source: record ? 'db' : 'default',
      };
      return NextResponse.json(payload);
    }

    const records = await prisma.skillsCalibration.findMany();
    const byAxis = new Map(records.map((r) => [r.axis as HexagonAxis, r]));

    const payload = (Object.keys(DEFAULT_TARGETS) as HexagonAxis[]).map((axis) => {
      const r = byAxis.get(axis);
      return {
        axis,
        targetValue: r?.targetValue ?? DEFAULT_TARGETS[axis],
        percentiles: {
          p25: r?.p25 ?? null,
          p50: r?.p50 ?? null,
          p75: r?.p75 ?? null,
          p90: r?.p90 ?? null,
        },
        samples: r?.samples ?? 0,
        updatedAt: r?.updatedAt ?? null,
        source: r ? 'db' : 'default',
      };
    });

    return NextResponse.json({ calibrations: payload });
  } catch (err) {
    console.error('GET /api/skills-calibration error:', err);
    return NextResponse.json({ error: 'Failed to load skills calibration' }, { status: 500 });
  }
}