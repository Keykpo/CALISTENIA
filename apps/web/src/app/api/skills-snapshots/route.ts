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
    // Create directory and file if missing
    const dir = path.dirname(storePath);
    try { await fs.mkdir(dir, { recursive: true }); } catch {}
    await fs.writeFile(storePath, JSON.stringify({} as Store, null, 2), 'utf-8');
    return {} as Store;
  }
}

async function saveStore(store: Store) {
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId') || 'anon';
  const store = await ensureStore();
  const snapshots = store[userId] || [];
  return new Response(JSON.stringify({ snapshots }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId: string = body.userId || 'anon';
    const snapshot: Snapshot = body.snapshot;
    if (!snapshot || typeof snapshot.ts !== 'number' || !snapshot.stars) {
      return new Response(JSON.stringify({ error: 'Invalid snapshot payload' }), { status: 400 });
    }
    const store = await ensureStore();
    store[userId] = store[userId] || [];
    store[userId].push(snapshot);
    // Limit to last 200 snapshots to avoid huge file
    if (store[userId].length > 200) {
      store[userId] = store[userId].slice(-200);
    }
    await saveStore(store);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const userId: string = body.userId || 'anon';
    const ts: number = body.ts;
    if (typeof ts !== 'number') {
      return new Response(JSON.stringify({ error: 'Invalid ts' }), { status: 400 });
    }
    const store = await ensureStore();
    const list = store[userId] || [];
    const next = list.filter((s) => s.ts !== ts);
    store[userId] = next;
    await saveStore(store);
    return new Response(JSON.stringify({ ok: true, count: next.length }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}