import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const origin = url.origin; // Base de nuestra app (p.ej. http://localhost:3055)
    const limitParam = url.searchParams.get('limit');
    const limit = Math.min(Math.max(Number(limitParam ?? 10), 1), 50); // 1..50

    const localBase = process.env.EXERCISEDB_LOCAL_BASE_URL || 'http://localhost:3333/api/v1';
    const listUrl = `${localBase}/exercises?limit=${limit}`;

    // Obtener ejercicios de la API local
    const res = await fetch(listUrl, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        { error: 'No se pudo obtener la lista desde API local', status: res.status, details: text },
        { status: 502 }
      );
    }

    const payload = await res.json();
    const data = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    const ids: string[] = data.map((e: any) => e?.exerciseId).filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ warmed: 0, ids: [], message: 'No hay IDs para precargar' }, { status: 200 });
    }

    // Descargar y cachear GIFs llamando a nuestro propio endpoint
    const results = await Promise.allSettled(
      ids.map(async (id) => {
        const gifRes = await fetch(`${origin}/api/exercise-gif/${id}`);
        const ok = gifRes.ok && (gifRes.headers.get('content-type') || '').includes('image');
        const size = Number(gifRes.headers.get('content-length') || '0');
        return { id, status: gifRes.status, ok, size };
      })
    );

    const summary = results.map((r) => (r.status === 'fulfilled' ? r.value : { id: 'unknown', status: 0, ok: false, size: 0 }));
    const warmed = summary.filter((s) => s.ok && s.size > 0).length;

    return NextResponse.json({ warmed, attempted: ids.length, details: summary }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Fallo en warm-gifs', message: err?.message ?? String(err) }, { status: 500 });
  }
}