import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const CACHE_DIR = path.join(process.cwd(), 'public', 'cached-gifs');
const MAP_PATH = path.join(process.cwd(), 'public', 'exercise-gif-map.json');

function ensureDirs() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function spanishToEnglishQuery(name: string) {
  const dict: Record<string, string> = {
    'hombros': 'shoulders',
    'espalda': 'back',
    'pecho': 'chest',
    'brazos': 'arms',
    'antebrazos': 'forearms',
    'piernas': 'legs',
    'cuadriceps': 'quadriceps',
    'isquiotibiales': 'hamstrings',
    'gluteos': 'glutes',
    'abdominales': 'abs',
    'core': 'core',
    'cadera': 'hips',
    'gemelos': 'calves',
    'trapecio': 'traps',
    'deltoides': 'deltoids',
    'estiramiento': 'stretch',
    'dinamico': 'dynamic',
    'dinámico': 'dynamic',
    'estatico': 'static',
    'estático': 'static',
    'movilidad': 'mobility',
    'calentamiento': 'warm up',
    'saltos': 'jumps',
    'rotaciones': 'rotations',
    'circulos': 'circles',
    'sentadilla': 'squat',
    'flexiones': 'push up',
    'dominadas': 'pull up',
    'fondos': 'dip',
    'plancha': 'plank'
  };
  const clean = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/[^a-z\s]/g, ' ');
  const tokens = clean.split(/\s+/).filter(Boolean);
  const translated = tokens.map((t) => dict[t] ?? t);
  return translated.join(' ');
}

function slugToEnglishQuery(internalId: string) {
  const dict: Record<string, string> = {
    'push': 'push up',
    'diamond': 'diamond',
    'decline': 'decline',
    'pseudo': 'pseudo planche push-up',
    'archer': 'archer',
    'typewriter': 'typewriter push-up',
    'pliometric': 'plyometric push-up',
    'pike': 'pike push-up',
    'hspu': 'handstand push-up',
    'freestanding': 'freestanding',
    'wall': 'wall',
    'dips': 'dip',
    'bench': 'bench dip',
    'parallel': 'parallel bar dip',
    'ring': 'ring dip',
    'negatives': 'negative',
    'assisted': 'assisted',
    'row': 'row',
    'vertical': 'vertical row',
    'incline': 'incline row',
    'horizontal': 'horizontal row',
    'wide': 'wide grip',
    'tuck': 'tuck',
    'front': 'front',
    'lever': 'lever',
    'pull': 'pull-up',
    'dead': 'dead hang',
    'hang': 'hang',
    'scapular': 'scapular',
    'negative': 'negative',
    'assisted_band': 'assisted band',
    'standard': 'standard',
    'wide_grip': 'wide grip',
    'l_sit': 'l-sit',
    'one_arm': 'one arm',
    'squat': 'squat',
    'jump': 'jump',
    'lunge': 'lunge',
    'reverse': 'reverse',
    'walking': 'walking',
    'calf': 'calf raise',
    'raise': 'raise',
    'double': 'double',
    'single': 'single',
    'glute': 'glute bridge',
    'bridge': 'bridge',
    'plank': 'plank',
    'side': 'side plank',
    'hollow': 'hollow body hold',
    'rock': 'rock',
    'leg': 'leg raise',
    'bent': 'bent knee',
    'knee': 'knee',
    'straight': 'straight',
    'hanging': 'hanging',
    'toes': 'toes to bar',
    'dragon': 'dragon flag',
    'flag': 'flag',
    'v_sit': 'v sit',
    'manna': 'manna',
    'burpee': 'burpee',
    'mountain': 'mountain climber',
    'climber': 'climber',
    'jumping': 'jumping jack',
    'jack': 'jack',
    'high': 'high knees',
    'knees': 'knees',
    'active': 'active hang',
    'planche': 'planche',
    'maltese': 'maltese',
    'back': 'back lever',
  };
  const tokens = internalId.toLowerCase().split(/[_\-\s]+/).filter(Boolean);
  const translated = tokens.map((t) => dict[t] ?? t);
  return Array.from(new Set(translated)).join(' ');
}

function readExercisesList(): any[] {
  // Preferir una copia en public si existe; si no, usar ruta raíz conocida
  const publicPath = path.join(process.cwd(), 'public', 'exercises.json');
  const rootPath = 'C:\\Users\\FRAN\\cp\\exercises.json';
  const srcPath = fs.existsSync(publicPath) ? publicPath : rootPath;
  const raw = fs.readFileSync(srcPath, 'utf-8');
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}

export async function GET(request: NextRequest) {
  try {
    ensureDirs();
    const url = new URL(request.url);
    const origin = url.origin;
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? 50), 1), 200);
    const offset = Math.max(Number(url.searchParams.get('offset') ?? 0), 0);
    const dryRun = url.searchParams.get('dry') === '1';

    const all = readExercisesList();
    const slice = all.slice(offset, offset + limit);

    const localBase = process.env.EXERCISEDB_LOCAL_BASE_URL || 'http://localhost:3333/api/v1';

    const map: Record<string, { exerciseId?: string; gifUrl?: string; matchedName?: string }> =
      fs.existsSync(MAP_PATH) ? JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8')) : {};

    const results: any[] = [];

    async function resolveGifUrlById(exerciseId: string | undefined): Promise<string | undefined> {
      if (!exerciseId) return undefined;
      // 1) Intentar API local por ID
      try {
        const localRes = await fetch(`${localBase}/exercises/${exerciseId}`, { headers: { Accept: 'application/json' } });
        if (localRes.ok) {
          const json = await localRes.json();
          const localGif: string | undefined = json?.data?.gifUrl || json?.gifUrl;
          if (localGif) return localGif;
        }
      } catch {}
      // 2) exercisedb.dev
      try {
        const edbRes = await fetch(`https://v1.exercisedb.dev/api/v1/exercises/exercise/${exerciseId}`);
        if (edbRes.ok) {
          const edbData = await edbRes.json();
          const gifUrlsObj = edbData?.gifUrls as Record<string, string> | undefined;
          const preferredRes = ['720p', '480p', '360p', '1080p'];
          const fromGifUrls = gifUrlsObj ? preferredRes.map((r) => gifUrlsObj[r]).find(Boolean) : undefined;
          const gifUrl = fromGifUrls || edbData?.gifUrl || edbData?.image || (Array.isArray(edbData?.images) ? edbData.images[0]?.url : undefined);
          if (gifUrl) return gifUrl;
        }
      } catch {}
      // 3) RapidAPI
      try {
        const rapidHost = process.env.EXERCISEDB_RAPIDAPI_HOST || 'exercisedb.p.rapidapi.com';
        const rapidKey = process.env.RAPIDAPI_KEY;
        if (rapidKey) {
          const response = await fetch(`https://${rapidHost}/exercises/exercise/${exerciseId}`, {
            headers: { 'X-RapidAPI-Key': rapidKey, 'X-RapidAPI-Host': rapidHost },
          });
          if (response.ok) {
            const exerciseData = await response.json();
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
            if (gifUrl) return gifUrl;
          }
        }
      } catch {}
      // 4) Fallback estático conocido
      try {
        const staticUrl = `https://static.exercisedb.dev/media/${exerciseId}.gif`;
        const probe = await fetch(staticUrl, { headers: { Accept: 'image/*,*/*;q=0.8' } });
        if (probe.ok && (probe.headers.get('content-type') || '').includes('image')) return staticUrl;
      } catch {}
      return undefined;
    }

    for (const item of slice) {
      const internalId: string = item?.id;
      const name: string = item?.name;
      if (!internalId || !name) continue;

      const queryName = spanishToEnglishQuery(name);
      const querySlug = slugToEnglishQuery(internalId);
      const queries = [queryName, querySlug].filter((q) => q && q.length > 0);
      let candidates: any[] = [];
      for (const q of queries) {
        const searchUrl = `${localBase}/exercises/search?q=${encodeURIComponent(q)}&threshold=0.3&limit=8`;
        const searchRes = await fetch(searchUrl);
        if (searchRes.ok) {
          const searchJson = await searchRes.json();
          const data: any[] = Array.isArray(searchJson?.data) ? searchJson.data : [];
          candidates = candidates.concat(data);
        }
      }
      // Quitar duplicados por exerciseId y priorizar los que tengan gifUrl
      const seen = new Set<string>();
      candidates = candidates.filter((c) => {
        const id = c?.exerciseId;
        if (!id) return false;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      }).sort((a, b) => Number(!!b?.gifUrl) - Number(!!a?.gifUrl));

      const best = candidates[0];
      if (!best) {
        results.push({ id: internalId, name, matched: null });
        continue;
      }

      const exerciseId: string | undefined = best?.exerciseId;
      let gifUrl: string | undefined = best?.gifUrl;
      const matchedName: string | undefined = best?.name;

      map[internalId] = { exerciseId, gifUrl, matchedName };

      if (!dryRun) {
        // Resolver gifUrl con fallback si hiciera falta
        if (!gifUrl) gifUrl = await resolveGifUrlById(exerciseId);
        if (gifUrl) {
          const gifRes = await fetch(gifUrl, { headers: { Accept: 'image/*,*/*;q=0.8' } });
          if (gifRes.ok && (gifRes.headers.get('content-type') || '').includes('image')) {
            const buf = await gifRes.arrayBuffer();
            fs.writeFileSync(path.join(CACHE_DIR, `${internalId}.gif`), Buffer.from(buf));
            // Actualizar map con gifUrl final
            map[internalId] = { exerciseId, gifUrl, matchedName };
            results.push({ id: internalId, exerciseId, matchedName, cached: true });
          } else {
            results.push({ id: internalId, exerciseId, matchedName, cached: false, status: gifRes.status });
          }
        } else {
          results.push({ id: internalId, exerciseId, matchedName, cached: false });
        }
      } else {
        results.push({ id: internalId, exerciseId, matchedName, cached: false });
      }
    }

    // Guardar mapping
    fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2), 'utf-8');

    // Resumen
    const cachedCount = results.filter((r) => r.cached).length;
    return NextResponse.json(
      { processed: slice.length, offset, limit, cached: cachedCount, details: results },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to build gif map', message: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}