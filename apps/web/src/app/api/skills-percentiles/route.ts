import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

type Stars = {
  fuerzaRelativa: number;
  resistenciaMuscular: number;
  controlEquilibrio: number;
  movilidadArticular: number;
  tensionCorporal: number;
  tecnica: number;
};

type Snapshot = { ts: number; stars: Stars };
type Store = Record<string, Snapshot[]>; // userId -> snapshots

const storePath = path.join(process.cwd(), '../../database/skills_snapshots.json');

async function ensureStore(): Promise<Store> {
  try {
    const data = await fs.readFile(storePath, 'utf-8');
    return JSON.parse(data) as Store;
  } catch (e) {
    const dir = path.dirname(storePath);
    try { await fs.mkdir(dir, { recursive: true }); } catch {}
    await fs.writeFile(storePath, JSON.stringify({} as Store, null, 2), 'utf-8');
    return {} as Store;
  }
}

function latestSnapshot(snaps: Snapshot[]): Snapshot | null {
  if (!snaps || snaps.length === 0) return null;
  return snaps.reduce((acc, s) => (acc.ts > s.ts ? acc : s));
}

function buildDistributions(store: Store) {
  const dist = {
    fuerzaRelativa: [] as number[],
    resistenciaMuscular: [] as number[],
    controlEquilibrio: [] as number[],
    movilidadArticular: [] as number[],
    tensionCorporal: [] as number[],
    tecnica: [] as number[],
  };
  for (const snaps of Object.values(store)) {
    const latest = latestSnapshot(snaps);
    if (!latest) continue;
    dist.fuerzaRelativa.push(latest.stars.fuerzaRelativa || 0);
    dist.resistenciaMuscular.push(latest.stars.resistenciaMuscular || 0);
    dist.controlEquilibrio.push(latest.stars.controlEquilibrio || 0);
    dist.movilidadArticular.push(latest.stars.movilidadArticular || 0);
    dist.tensionCorporal.push(latest.stars.tensionCorporal || 0);
    dist.tecnica.push(latest.stars.tecnica || 0);
  }
  return dist;
}

function percentileInfo(value: number, values: number[]) {
  const N = values.length;
  if (N === 0) return { above: 0, top: 0 };
  const countLess = values.filter((v) => v < value).length;
  const above = Math.round((countLess / N) * 100);
  const top = Math.max(0, Math.min(100, 100 - above));
  return { above, top };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId') || 'anon';
  const store = await ensureStore();
  const snaps = store[userId] || [];
  const latest = latestSnapshot(snaps);
  const distributions = buildDistributions(store);

  if (!latest) {
    return new Response(
      JSON.stringify({ error: 'No snapshot for user', distributions }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const percentiles = {
    fuerzaRelativa: percentileInfo(latest.stars.fuerzaRelativa, distributions.fuerzaRelativa),
    resistenciaMuscular: percentileInfo(latest.stars.resistenciaMuscular, distributions.resistenciaMuscular),
    controlEquilibrio: percentileInfo(latest.stars.controlEquilibrio, distributions.controlEquilibrio),
    movilidadArticular: percentileInfo(latest.stars.movilidadArticular, distributions.movilidadArticular),
    tensionCorporal: percentileInfo(latest.stars.tensionCorporal, distributions.tensionCorporal),
    tecnica: percentileInfo(latest.stars.tecnica, distributions.tecnica),
  };
  return new Response(
    JSON.stringify({ percentiles, distributions }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = await ensureStore();
    const distributions = buildDistributions(store);
    const stars: Stars | undefined = body.stars;
    if (!stars) {
      return new Response(JSON.stringify({ error: 'Missing stars payload' }), { status: 400 });
    }
    const percentiles = {
      fuerzaRelativa: percentileInfo(stars.fuerzaRelativa, distributions.fuerzaRelativa),
      resistenciaMuscular: percentileInfo(stars.resistenciaMuscular, distributions.resistenciaMuscular),
      controlEquilibrio: percentileInfo(stars.controlEquilibrio, distributions.controlEquilibrio),
      movilidadArticular: percentileInfo(stars.movilidadArticular, distributions.movilidadArticular),
      tensionCorporal: percentileInfo(stars.tensionCorporal, distributions.tensionCorporal),
      tecnica: percentileInfo(stars.tecnica, distributions.tecnica),
    };
    return new Response(
      JSON.stringify({ percentiles }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}