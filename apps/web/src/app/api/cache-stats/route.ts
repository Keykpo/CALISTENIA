import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

const CACHE_DIR = path.join(process.cwd(), 'public', 'cached-gifs');

export async function GET() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      return NextResponse.json({ cached: 0, remaining: 500, files: [] });
    }

    const entries = fs.readdirSync(CACHE_DIR, { withFileTypes: true });
    const gifFiles = entries
      .filter((e) => e.isFile() && e.name.endsWith('.gif'))
      .map((e) => e.name.replace(/\.gif$/i, ''));

    const cached = gifFiles.length;
    const remaining = Math.max(500 - cached, 0);
    return NextResponse.json({ cached, remaining, files: gifFiles });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Error al leer estadísticas', message: err?.message ?? 'unknown' },
      { status: 500 }
    );
  }
}