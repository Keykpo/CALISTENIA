import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Probar endpoints públicos de exercisedb.dev
    const endpoints = {
      byId: 'https://v1.exercisedb.dev/api/v1/exercises/exercise/0001',
      list: 'https://v1.exercisedb.dev/api/v1/exercises?limit=5',
      byBodyPart: 'https://v1.exercisedb.dev/api/v1/bodyparts/upper arms/exercises?limit=5',
    };

    const [idRes, listRes, bodyRes] = await Promise.all([
      fetch(endpoints.byId),
      fetch(endpoints.list),
      fetch(endpoints.byBodyPart),
    ]);

    const idJson = await idRes.json().catch(() => null);
    const listJson = await listRes.json().catch(() => null);
    const bodyJson = await bodyRes.json().catch(() => null);

    const idKeys = idJson && typeof idJson === 'object' ? Object.keys(idJson) : [];
    const bodySample = Array.isArray(bodyJson) && bodyJson.length > 0 ? bodyJson[0] : null;

    const listSample = Array.isArray(listJson) && listJson.length > 0 ? listJson[0] : null;

    return NextResponse.json({
      endpoints,
      byId: {
        status: idRes.status,
        hasGifUrl: !!idJson?.gifUrl,
        keys: idKeys,
        sample: idJson,
      },
      list: {
        status: listRes.status,
        isArray: Array.isArray(listJson),
        count: Array.isArray(listJson) ? listJson.length : 0,
        sampleKeys: listSample ? Object.keys(listSample) : [],
        sample: listSample,
        anyGifUrl: Array.isArray(listJson) ? listJson.some((e: any) => !!(e?.gifUrl || e?.gifUrls)) : false,
      },
      byBodyPart: {
        status: bodyRes.status,
        isArray: Array.isArray(bodyJson),
        count: Array.isArray(bodyJson) ? bodyJson.length : 0,
        sampleKeys: bodySample ? Object.keys(bodySample) : [],
        sample: bodySample,
        anyGifUrl: Array.isArray(bodyJson) ? bodyJson.some((e: any) => !!e?.gifUrl) : false,
      },
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to query exercisedb.dev', details: String(error) }, { status: 500 });
  }
}