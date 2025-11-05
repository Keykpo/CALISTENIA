import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Falta el parámetro id' }, { status: 400 });
    }

    // Upstreams a probar: CloudFront directo por HTTPS y proxies HTTPS
    const upstreams: string[] = [
      `https://d205bpvrqc9yn1.cloudfront.net/${id}.gif`,
      // Proxy público de imágenes (images.weserv.nl)
      `https://images.weserv.nl/?url=d205bpvrqc9yn1.cloudfront.net/${id}.gif`,
      `https://wsrv.nl/?url=d205bpvrqc9yn1.cloudfront.net/${id}.gif`,
    ];

    let lastErr: any = null;
    for (const url of upstreams) {
      try {
        console.log(`🔁 Proxy intentando: ${url}`);
        const res = await fetch(url, {
          headers: {
            'Accept': 'image/*,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (GifProxy/1.0)'
          },
        });
        if (!res.ok) {
          lastErr = new Error(`Status ${res.status}`);
          console.warn(`❌ Proxy fallo (${res.status}) en ${url}`);
          continue;
        }
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('image')) {
          lastErr = new Error(`Content-Type inesperado: ${ct}`);
          console.warn(`⚠️ Proxy tipo inesperado (${ct}) en ${url}`);
          continue;
        }
        const ab = await res.arrayBuffer();
        const buf = Buffer.from(ab);
        console.log(`✅ Proxy éxito: ${url}`);
        return new NextResponse(buf, {
          headers: {
            'Content-Type': ct.includes('gif') ? 'image/gif' : 'application/octet-stream',
            'Cache-Control': 'public, max-age=60', // proxy no persiste; breve caché de respuesta
          },
        });
      } catch (e) {
        lastErr = e;
        console.warn(`⚠️ Proxy error en ${url}: ${String(e)}`);
        continue;
      }
    }

    return NextResponse.json(
      { error: 'Proxy no pudo obtener el GIF', details: String(lastErr ?? '') },
      { status: 502 }
    );
  } catch (err: any) {
    console.error('Error en gif-proxy route:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: err?.message ?? 'unknown' },
      { status: 500 }
    );
  }
}