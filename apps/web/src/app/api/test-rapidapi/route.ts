import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    };

    // Probar 3 ejercicios individuales
    const testIds = ['0001', '0002', '0009'];
    const results: any[] = [];

    for (const id of testIds) {
      try {
        const response = await fetch(
          `https://exercisedb.p.rapidapi.com/exercises/exercise/${id}`,
          options as RequestInit
        );

        const data = await response.json();

        results.push({
          id,
          status: response.status,
          hasGifUrl: !!data?.gifUrl,
          gifUrl: data?.gifUrl || null,
          name: data?.name || null,
          allKeys: Object.keys(data || {}),
          fullData: data,
        });
      } catch (error: any) {
        results.push({
          id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json(
      {
        message: 'Probando endpoints INDIVIDUALES por ID',
        apiKey: process.env.RAPIDAPI_KEY ? 'Configurada ✓' : 'Falta ✗',
        results,
        conclusion: results[0]?.hasGifUrl
          ? '✅ ÉXITO: El endpoint individual SÍ devuelve gifUrl'
          : '❌ PROBLEMA: El endpoint individual tampoco devuelve gifUrl - necesitamos otra estrategia',
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}