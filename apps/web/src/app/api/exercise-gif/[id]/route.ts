import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Fuerza runtime Node.js (evita edge runtime) para compatibilidad con fs
export const runtime = 'nodejs';

// En producción/serverless (p.ej. Vercel) el sistema de archivos es de solo lectura,
// pero se permite escribir en /tmp. Usamos /tmp para cachear GIFs allí.
const isServerless = process.env.VERCEL === '1' || process.env.CF_PAGES === '1' || process.env.NODE_ENV === 'production';
const CACHE_DIR = isServerless
  ? path.join(os.tmpdir(), 'cached-gifs')
  : path.join(process.cwd(), 'public', 'cached-gifs');
const MAP_PATH = path.join(process.cwd(), 'public', 'exercise-gif-map.json');
const EXERCISES_JSON_PATH = path.join(process.cwd(), 'public', 'exercises.json');
const EXERCISES_COMPLETE_CANDIDATES = [
  process.env.COMPLETE_MEDIA_PATH,
  'C:/Users/FRAN/cp/exercisedb-api-main/media/exercises_COMPLETE_with_GIFS_FINAL_1.json',
  'C:/Users/FRAN/cp/exercises_COMPLETE_with_media.json',
].filter(Boolean) as string[];
// Directorio local con GIFs provistos por el usuario
const LOCAL_MEDIA_DIR = 'C:\\Users\\FRAN\\cp\\exercisedb-api-main\\media';
const USAGE_DIR = path.join(process.cwd(), 'public', 'server-store');
const USAGE_FILE = path.join(USAGE_DIR, 'rapidapi_usage.json');
const PLACEHOLDER_PATH = path.join(process.cwd(), 'public', 'placeholder-exercise.gif');

try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch {}

try {
  if (!fs.existsSync(USAGE_DIR)) {
    fs.mkdirSync(USAGE_DIR, { recursive: true });
  }
} catch {}

type UsageStore = {
  monthKey: string; // e.g. '2025-11'
  count: number; // total RapidAPI calls this month
};

function currentMonthKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function readUsage(limit = 500): UsageStore & { remaining: number } {
  try {
    if (!fs.existsSync(USAGE_FILE)) {
      const initial = { monthKey: currentMonthKey(), count: 0 };
      fs.writeFileSync(USAGE_FILE, JSON.stringify(initial, null, 2));
      return { ...initial, remaining: limit };
    }
    const raw = fs.readFileSync(USAGE_FILE, 'utf-8');
    const parsed: UsageStore = JSON.parse(raw);
    const key = currentMonthKey();
    if (parsed.monthKey !== key) {
      const reset = { monthKey: key, count: 0 };
      fs.writeFileSync(USAGE_FILE, JSON.stringify(reset, null, 2));
      return { ...reset, remaining: limit };
    }
    return { ...parsed, remaining: Math.max(limit - parsed.count, 0) };
  } catch (e) {
    // En caso de error, asumir contador vacío para no bloquear indebidamente
    const fallback = { monthKey: currentMonthKey(), count: 0 };
    try {
      fs.writeFileSync(USAGE_FILE, JSON.stringify(fallback, null, 2));
    } catch {}
    return { ...fallback, remaining: limit };
  }
}

function incrementUsage(limit = 500): { ok: boolean; store: UsageStore & { remaining: number } } {
  const store = readUsage(limit);
  if (store.count >= limit) {
    return { ok: false, store };
  }
  const next = { monthKey: store.monthKey, count: store.count + 1 };
  try {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(next, null, 2));
  } catch {}
  return { ok: true, store: { ...next, remaining: Math.max(limit - next.count, 0) } };
}

function serveGifFile(filePath: string) {
  try {
    const buf = fs.readFileSync(filePath);
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'image/gif',
        // Incluir s-maxage para permitir cache CDN (Vercel/Cloudflare)
        'Cache-Control': 'public, max-age=31536000, s-maxage=86400, immutable',
      },
    });
  } catch (e) {
    return new NextResponse('GIF not available', { status: 404 });
  }
}

function safeWriteCache(filePath: string, data: Buffer) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, data);
  } catch (e) {
    console.warn(`⚠️ No se pudo escribir en cache (${filePath}): ${String(e)}`);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const exerciseId = params.id;
  const cachedFilePath = path.join(CACHE_DIR, `${exerciseId}.gif`);
  
  // Verificar cache
  if (fs.existsSync(cachedFilePath)) {
    console.log(`✅ Cache HIT: ${exerciseId}`);
    return serveGifFile(cachedFilePath);
  }

  // Intentar usar mapping previo (id interno -> exerciseId/gifUrl)
  try {
    if (fs.existsSync(MAP_PATH)) {
      const map = JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8')) as Record<string, { exerciseId?: string; gifUrl?: string }>;
      const mapped = map[exerciseId];
      if (mapped) {
        // Priorizar gifUrl directo si existe en el mapping
        if (mapped.gifUrl) {
          console.log(`🗺️ Usando gifUrl del mapping para ${exerciseId}`);
          const gifResponse = await fetch(mapped.gifUrl, { headers: { Accept: 'image/*,*/*;q=0.8' } });
          if (gifResponse.ok && (gifResponse.headers.get('content-type') || '').includes('image')) {
            const gifBuffer = await gifResponse.arrayBuffer();
            safeWriteCache(cachedFilePath, Buffer.from(gifBuffer));
            console.log(`💾 Guardado en cache (mapping.gifUrl): ${exerciseId}`);
            return new NextResponse(gifBuffer, {
              headers: {
                'Content-Type': 'image/gif',
                'Cache-Control': 'public, max-age=31536000, s-maxage=86400, immutable',
              },
            });
          }
        }
        // Si no hay gifUrl, intentar con exerciseId mapeado en API local
        if (mapped.exerciseId) {
          try {
            const localBase = process.env.EXERCISEDB_LOCAL_BASE_URL || 'http://localhost:3333/api/v1';
            const localUrl = `${localBase}/exercises/${mapped.exerciseId}`;
            console.log(`🗺️ Buscando via mapping.exerciseId en API local: ${localUrl}`);
            const localRes = await fetch(localUrl, { headers: { Accept: 'application/json' } });
            if (localRes.ok) {
              const json = await localRes.json();
              const gifUrl: string | undefined = json?.data?.gifUrl || json?.gifUrl;
              if (gifUrl) {
                const gifResponse = await fetch(gifUrl, { headers: { Accept: 'image/*,*/*;q=0.8' } });
                if (gifResponse.ok && (gifResponse.headers.get('content-type') || '').includes('image')) {
                  const gifBuffer = await gifResponse.arrayBuffer();
                  safeWriteCache(cachedFilePath, Buffer.from(gifBuffer));
                  console.log(`💾 Guardado en cache (mapping.exerciseId): ${exerciseId}`);
                  return new NextResponse(gifBuffer, {
                    headers: {
                      'Content-Type': 'image/gif',
                      'Cache-Control': 'public, max-age=31536000, s-maxage=86400, immutable',
                    },
                  });
                }
              }
            }
          } catch (e) {
            console.warn(`⚠️ Falló mapping.exerciseId para ${exerciseId}: ${String(e)}`);
          }
        }
      }
    }
  } catch (e) {
    console.warn(`⚠️ No se pudo leer mapping: ${String(e)}`);
  }

  // Intentar usar exercises.json (id interno -> gifUrl) como fallback directo
  try {
    if (fs.existsSync(EXERCISES_JSON_PATH)) {
      const arr = JSON.parse(fs.readFileSync(EXERCISES_JSON_PATH, 'utf-8')) as Array<any>;
      const item = Array.isArray(arr) ? arr.find((x) => String(x?.id) === exerciseId) : null;
      const gifUrl: string | undefined = item?.gifUrl || item?.thumbnailUrl || item?.imageUrl;
      if (gifUrl) {
        console.log(`📚 Usando gifUrl desde exercises.json para ${exerciseId}: ${gifUrl}`);
        // Intentar resolver localmente si el gifUrl proviene de exercisedb.io/dev
        try {
          const tokenMatch = gifUrl.match(/(?:\/image\/|\/media\/)([A-Za-z0-9]+)(?:\.gif)?$/);
          const token = tokenMatch ? tokenMatch[1] : undefined;
          if (token) {
            const localCandidate = path.join(LOCAL_MEDIA_DIR, `${token}.gif`);
            if (fs.existsSync(localCandidate)) {
              console.log(`🖼️ Sirviendo archivo local por token: ${localCandidate}`);
              const buf = fs.readFileSync(localCandidate);
              // Cachear bajo id interno
              safeWriteCache(cachedFilePath, buf);
              return new NextResponse(buf, {
                headers: {
                  'Content-Type': 'image/gif',
                  'Cache-Control': 'public, max-age=31536000, s-maxage=86400, immutable',
                },
              });
            }
          }
        } catch (e) {
          console.warn(`⚠️ Falló intento de servir local por token para ${exerciseId}: ${String(e)}`);
        }

        // Si no hay archivo local, intentar descargar remota
        const gifResponse = await fetch(gifUrl, { headers: { Accept: 'image/*,*/*;q=0.8' } });
        if (gifResponse.ok && (gifResponse.headers.get('content-type') || '').includes('image')) {
          const gifBuffer = await gifResponse.arrayBuffer();
          safeWriteCache(cachedFilePath, Buffer.from(gifBuffer));
          console.log(`💾 Guardado en cache (exercises.json): ${exerciseId}`);
          return new NextResponse(gifBuffer, {
            headers: {
              'Content-Type': 'image/gif',
              'Cache-Control': 'public, max-age=31536000, s-maxage=86400, immutable',
            },
          });
        }
      }
    }
  } catch (e) {
    console.warn(`⚠️ Falló fallback exercises.json para ${exerciseId}: ${String(e)}`);
  }

  // Fallback adicional: usar exercises_COMPLETE_with_* JSON (fuera de apps/web) para resolver token y servir local
  try {
    const completePath = EXERCISES_COMPLETE_CANDIDATES.find((p) => {
      try { return p && fs.existsSync(p); } catch { return false; }
    });
    if (completePath) {
      console.log(`📘 Leyendo media completa desde: ${completePath}`);
      const arr = JSON.parse(fs.readFileSync(completePath, 'utf-8')) as Array<any>;
      const item = Array.isArray(arr) ? arr.find((x) => String(x?.id) === exerciseId) : null;
      const gifUrl: string | undefined = item?.gifUrl || item?.thumbnailUrl || item?.imageUrl;
      if (gifUrl) {
        console.log(`📘 Usando gifUrl desde exercises_COMPLETE_with_media.json para ${exerciseId}: ${gifUrl}`);
        const tokenMatch = gifUrl.match(/(?:\/image\/|\/media\/)([A-Za-z0-9-]+)(?:\.gif)?$/);
        const token = tokenMatch ? tokenMatch[1] : undefined;
        if (token) {
          const localCandidate = path.join(LOCAL_MEDIA_DIR, `${token}.gif`);
          if (fs.existsSync(localCandidate)) {
            const buf = fs.readFileSync(localCandidate);
            safeWriteCache(cachedFilePath, buf);
            console.log(`💾 Cacheado desde local (complete.json+token): ${exerciseId} -> ${token}.gif`);
            return new NextResponse(buf, {
              headers: {
                'Content-Type': 'image/gif',
                'Cache-Control': 'public, max-age=31536000, s-maxage=86400, immutable',
              },
            });
          }
        }
        // Si no hay token local, intentar descarga remota
        const gifResponse = await fetch(gifUrl, { headers: { Accept: 'image/*,*/*;q=0.8' } });
        if (gifResponse.ok && (gifResponse.headers.get('content-type') || '').includes('image')) {
          const gifBuffer = await gifResponse.arrayBuffer();
          safeWriteCache(cachedFilePath, Buffer.from(gifBuffer));
          console.log(`💾 Guardado en cache (complete.json remoto): ${exerciseId}`);
          return new NextResponse(gifBuffer, {
            headers: {
              'Content-Type': 'image/gif',
              'Cache-Control': 'public, max-age=31536000, s-maxage=86400, immutable',
            },
          });
        }
      }
    }
  } catch (e) {
    console.warn(`⚠️ Falló fallback exercises_COMPLETE_with_media.json para ${exerciseId}: ${String(e)}`);
  }

  // 0) Intentar API local (exercisedb-api-main) primero si está disponible
  try {
    const localBase = process.env.EXERCISEDB_LOCAL_BASE_URL || 'http://localhost:3333/api/v1';
    const localUrl = `${localBase}/exercises/${exerciseId}`;
    console.log(`🏠 Buscando gifUrl en API local: ${localUrl}`);
    const localRes = await fetch(localUrl, { headers: { Accept: 'application/json' } });
    if (localRes.ok) {
      const json = await localRes.json();
      const gifUrl: string | undefined = json?.data?.gifUrl || json?.gifUrl;
      if (gifUrl) {
        console.log(`📍 GIF URL (local): ${gifUrl}`);
        const gifResponse = await fetch(gifUrl, { headers: { Accept: 'image/*,*/*;q=0.8' } });
        if (gifResponse.ok) {
          const contentType = gifResponse.headers.get('content-type') || '';
          if (contentType.includes('image')) {
            const gifBuffer = await gifResponse.arrayBuffer();
            safeWriteCache(cachedFilePath, Buffer.from(gifBuffer));
            console.log(`💾 Guardado en cache (local): ${exerciseId}`);
            return new NextResponse(gifBuffer, {
              headers: {
                'Content-Type': 'image/gif',
                'Cache-Control': 'public, max-age=31536000, s-maxage=86400, immutable',
              },
            });
          }
        }
      }
    } else {
      console.warn(`⚠️ API local respondió ${localRes.status}`);
    }
  } catch (e) {
    console.warn(`⚠️ Falló API local para ${exerciseId}: ${String(e)}`);
  }

  // 1) Intentar primero exercisedb.dev (open API) sin consumir presupuesto
  try {
    console.log(`🔎 Buscando gifUrl en exercisedb.dev para ${exerciseId}`);
    const edbRes = await fetch(`https://v1.exercisedb.dev/api/v1/exercises/exercise/${exerciseId}`);
    if (edbRes.ok) {
      const edbData = await edbRes.json();
      const gifUrlsObj = edbData?.gifUrls as Record<string, string> | undefined;
      const preferredRes = ['720p', '480p', '360p', '1080p'];
      const fromGifUrls = gifUrlsObj ? preferredRes.map((r) => gifUrlsObj[r]).find(Boolean) : undefined;
      const gifUrl = fromGifUrls || edbData?.gifUrl || edbData?.image || (Array.isArray(edbData?.images) ? edbData.images[0]?.url : undefined);
      if (gifUrl) {
        console.log(`📍 GIF URL (exercisedb.dev): ${gifUrl}`);
        const gifResponse = await fetch(gifUrl, { headers: { Accept: 'image/*,*/*;q=0.8' } });
        if (gifResponse.ok) {
          const contentType = gifResponse.headers.get('content-type') || '';
          if (contentType.includes('image')) {
            const gifBuffer = await gifResponse.arrayBuffer();
            safeWriteCache(cachedFilePath, Buffer.from(gifBuffer));
            console.log(`💾 Guardado en cache (exercisedb.dev): ${exerciseId}`);
            return new NextResponse(gifBuffer, {
              headers: {
                'Content-Type': 'image/gif',
                'Cache-Control': 'public, max-age=31536000, s-maxage=86400, immutable',
              },
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn(`⚠️ Falló exercisedb.dev para ${exerciseId}: ${String(e)}`);
  }

  // 2) Si exercisedb no devolvió gifUrl, usar RapidAPI con guardado de presupuesto
  const limit = Number(process.env.RAPIDAPI_MONTHLY_LIMIT ?? 500);
  const preInc = incrementUsage(limit);
  if (!preInc.ok) {
    console.warn(`🚫 Límite mensual alcanzado (${limit}). Sirviendo placeholder para ${exerciseId}`);
    if (fs.existsSync(PLACEHOLDER_PATH)) {
      return serveGifFile(PLACEHOLDER_PATH);
    }
    return NextResponse.json(
      { error: 'Monthly RapidAPI limit reached', limit, monthKey: preInc.store.monthKey },
      { status: 429 }
    );
  }

  console.log(`⬇️ Descargando de RapidAPI: ${exerciseId} (restantes: ${preInc.store.remaining})`);
  
  try {
    // PASO 1: Obtener información del ejercicio usando RapidAPI
    const rapidHost = process.env.EXERCISEDB_RAPIDAPI_HOST || 'exercisedb.p.rapidapi.com';
    const exerciseResponse = await fetch(
      `https://${rapidHost}/exercises/exercise/${exerciseId}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': rapidHost
        }
      }
    );
    
    if (!exerciseResponse.ok) {
      const errText = await exerciseResponse.text().catch(() => '');
      throw new Error(`RapidAPI error: ${exerciseResponse.status} ${errText}`);
    }
    
    const exerciseData = await exerciseResponse.json();
    
    // Soportar variantes de estructura: objeto, array, campos image/images
    let gifUrl: string | undefined;
    if (Array.isArray(exerciseData)) {
      const item = exerciseData[0];
      const gifUrlsObj = item?.gifUrls as Record<string, string> | undefined;
      const preferredRes = ['720p', '480p', '360p', '1080p'];
      const fromGifUrls = gifUrlsObj ? preferredRes.map((r) => gifUrlsObj[r]).find(Boolean) : undefined;
      gifUrl = fromGifUrls || item?.gifUrl || item?.image || (Array.isArray(item?.images) ? item.images[0]?.url : undefined);
    } else {
      const gifUrlsObj = exerciseData?.gifUrls as Record<string, string> | undefined;
      const preferredRes = ['720p', '480p', '360p', '1080p'];
      const fromGifUrls = gifUrlsObj ? preferredRes.map((r) => gifUrlsObj[r]).find(Boolean) : undefined;
      gifUrl = fromGifUrls || exerciseData?.gifUrl || exerciseData?.image || (Array.isArray(exerciseData?.images) ? exerciseData.images[0]?.url : undefined);
    }

    if (!gifUrl) {
      console.warn('⚪ No se encontró gifUrl en RapidAPI, sirviendo placeholder');
      if (fs.existsSync(PLACEHOLDER_PATH)) {
        return serveGifFile(PLACEHOLDER_PATH);
      }
      return new NextResponse('GIF URL not found', { status: 404 });
    }
    
    console.log(`📍 GIF URL encontrada: ${gifUrl}`);
    
    // PASO 2: Descargar el GIF directamente desde la URL proporcionada por la API
    const gifResponse = await fetch(gifUrl, {
      headers: {
        Accept: 'image/*,*/*;q=0.8',
      },
    });
    
    if (!gifResponse.ok) {
      throw new Error(`Error descargando GIF: ${gifResponse.status}`);
    }
    
    const contentType = gifResponse.headers.get('content-type') || '';
    if (!contentType.includes('image')) {
      throw new Error(`Tipo de contenido inesperado: ${contentType}`);
    }
    const gifBuffer = await gifResponse.arrayBuffer();
    
    // PASO 3: Guardar en cache
    safeWriteCache(cachedFilePath, Buffer.from(gifBuffer));
    console.log(`💾 Guardado en cache: ${exerciseId}`);
    
    return new NextResponse(gifBuffer, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'public, max-age=31536000, s-maxage=86400, immutable',
      },
    });
    
  } catch (error) {
    console.error('❌ Error completo:', error);
    // En caso de error, intentar servir placeholder para que "se vea algo"
    if (fs.existsSync(PLACEHOLDER_PATH)) {
      console.log('🟠 Error al obtener GIF, sirviendo placeholder');
      return serveGifFile(PLACEHOLDER_PATH);
    }
    return new NextResponse(
      JSON.stringify({
        error: 'Error fetching GIF',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}