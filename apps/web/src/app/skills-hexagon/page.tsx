'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SkillsHexagon, { HexagonValues } from '@/components/SkillsHexagon';
import Sparkline from '@/components/Sparkline';

export default function SkillsHexagonPreviewPage() {
  // Estados para estrellas y rangos (con subniveles) y comparación por fecha
  const [stars, setStars] = useState<{[k in keyof HexagonValues]: number}>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('skillsHexagonStars');
      if (saved) {
        try { return JSON.parse(saved) as {[k in keyof HexagonValues]: number}; } catch {}
      }
    }
    return {
      fuerzaRelativa: 3,
      resistenciaMuscular: 3,
      controlEquilibrio: 3,
      movilidadArticular: 3,
      tensionCorporal: 3,
      tecnica: 3,
    };
  });
  type RankPM = 'F-'|'F'|'F+'|'E-'|'E'|'E+'|'D-'|'D'|'D+'|'C-'|'C'|'C+'|'B-'|'B'|'B+'|'A-'|'A'|'A+'|'S-'|'S'|'S+';
  const RANKS_PM: RankPM[] = ['F-','F','F+','E-','E','E+','D-','D','D+','C-','C','C+','B-','B','B+','A-','A','A+','S-','S','S+'];
  const [ranks, setRanks] = useState<{[k in keyof HexagonValues]: RankPM}>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('skillsHexagonRanks');
      if (saved) {
        try { return JSON.parse(saved) as {[k in keyof HexagonValues]: RankPM}; } catch {}
      }
    }
    return {
      fuerzaRelativa: 'C',
      resistenciaMuscular: 'C',
      controlEquilibrio: 'C',
      movilidadArticular: 'C',
      tensionCorporal: 'C',
      tecnica: 'C',
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('skillsHexagonStars', JSON.stringify(stars));
    }
  }, [stars]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('skillsHexagonRanks', JSON.stringify(ranks));
    }
  }, [ranks]);

  const starToValue = (n: number) => Math.max(0, Math.min(5, n)) * 20;
  // Escala personalizada para rangos F–S
  const [scaleBase, setScaleBase] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const v = window.localStorage.getItem('skillsHexagonScaleBase');
      if (v) return Number(v);
    }
    return 10;
  });
  const [scaleStep, setScaleStep] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const v = window.localStorage.getItem('skillsHexagonScaleStep');
      if (v) return Number(v);
    }
    return 5;
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('skillsHexagonScaleBase', String(scaleBase));
      window.localStorage.setItem('skillsHexagonScaleStep', String(scaleStep));
    }
  }, [scaleBase, scaleStep]);
  const rankToValuePM = (r: RankPM) => {
    const idx = RANKS_PM.indexOf(r);
    if (idx === -1) return 0;
    return Math.min(100, Math.max(0, scaleBase + idx * scaleStep));
  };
  const valuesFromStars: HexagonValues = {
    fuerzaRelativa: starToValue(stars.fuerzaRelativa),
    resistenciaMuscular: starToValue(stars.resistenciaMuscular),
    controlEquilibrio: starToValue(stars.controlEquilibrio),
    movilidadArticular: starToValue(stars.movilidadArticular),
    tensionCorporal: starToValue(stars.tensionCorporal),
    tecnica: starToValue(stars.tecnica),
  };
  const valuesFromRanks: HexagonValues = {
    fuerzaRelativa: rankToValuePM(ranks.fuerzaRelativa),
    resistenciaMuscular: rankToValuePM(ranks.resistenciaMuscular),
    controlEquilibrio: rankToValuePM(ranks.controlEquilibrio),
    movilidadArticular: rankToValuePM(ranks.movilidadArticular),
    tensionCorporal: rankToValuePM(ranks.tensionCorporal),
    tecnica: rankToValuePM(ranks.tecnica),
  };

  // Snapshots para comparar por fecha
  type Snapshot = { ts: number; stars: {[k in keyof HexagonValues]: number} };
  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem('skillsHexagonSnapshots');
      if (raw) {
        try { return JSON.parse(raw) as Snapshot[]; } catch {}
      }
    }
    return [];
  });
  const saveSnapshot = () => {
    const snap: Snapshot = { ts: Date.now(), stars };
    const next = [snap, ...snapshots].slice(0, 50);
    setSnapshots(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('skillsHexagonSnapshots', JSON.stringify(next));
    }
  };
  const getSnapshotByAgeDays = (days: number): Snapshot | undefined => {
    const targetTs = Date.now() - days * 24 * 60 * 60 * 1000;
    return snapshots.filter(s => s.ts <= targetTs).sort((a,b) => b.ts - a.ts)[0];
  };
  const [compareMode, setCompareMode] = useState<'rank'|'time'>('rank');
  const [selectedAge, setSelectedAge] = useState<'7d'|'1m'|'1y'|'custom'>('7d');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const ageDaysMap = { '7d': 7, '1m': 30, '1y': 365 } as const;
  const getSnapshotByDate = (dateStr: string): Snapshot | undefined => {
    if (!dateStr) return undefined;
    const targetTs = new Date(dateStr).getTime();
    if (Number.isNaN(targetTs)) return undefined;
    return snapshots.filter(s => s.ts <= targetTs).sort((a,b) => b.ts - a.ts)[0];
  };
  const snapshotForAge = selectedAge === 'custom'
    ? getSnapshotByDate(selectedDate)
    : getSnapshotByAgeDays(ageDaysMap[selectedAge]);
  const valuesFromSnapshot: HexagonValues | null = snapshotForAge ? {
    fuerzaRelativa: starToValue(snapshotForAge.stars.fuerzaRelativa),
    resistenciaMuscular: starToValue(snapshotForAge.stars.resistenciaMuscular),
    controlEquilibrio: starToValue(snapshotForAge.stars.controlEquilibrio),
    movilidadArticular: starToValue(snapshotForAge.stars.movilidadArticular),
    tensionCorporal: starToValue(snapshotForAge.stars.tensionCorporal),
    tecnica: starToValue(snapshotForAge.stars.tecnica),
  } : null;

  // Auto-snapshots: diario/semanal
  const [autoSnapshot, setAutoSnapshot] = useState<'off'|'daily'|'weekly'|'monthly'>(() => {
    if (typeof window !== 'undefined') {
      const v = window.localStorage.getItem('skillsHexagonAutoSnapshot');
      if (v === 'daily' || v === 'weekly' || v === 'monthly') return v as 'daily'|'weekly'|'monthly';
    }
    return 'off';
  });
  const [lastAutoSnapshotTs, setLastAutoSnapshotTs] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const v = window.localStorage.getItem('skillsHexagonLastAutoSnapshot');
      if (v) return Number(v);
    }
    return 0;
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('skillsHexagonAutoSnapshot', autoSnapshot);
    }
  }, [autoSnapshot]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoSnapshot === 'off') return;
      const now = Date.now();
      const threshold = autoSnapshot === 'daily' ? 24*60*60*1000 : autoSnapshot === 'weekly' ? 7*24*60*60*1000 : 30*24*60*60*1000;
      if (now - lastAutoSnapshotTs >= threshold) {
        saveSnapshot();
        setLastAutoSnapshotTs(now);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('skillsHexagonLastAutoSnapshot', String(now));
        }
      }
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoSnapshot, lastAutoSnapshotTs, snapshots, stars]);

  const inputs: [keyof HexagonValues, string][] = [
    ['fuerzaRelativa', 'Fuerza relativa'],
    ['resistenciaMuscular', 'Resistencia muscular'],
    ['controlEquilibrio', 'Control y equilibrio'],
    ['movilidadArticular', 'Movilidad articular'],
    ['tensionCorporal', 'Tensión corporal / core'],
    ['tecnica', 'Técnica / Habilidad específica'],
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Hexágono de Habilidades – Vista previa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-center">
                {compareMode === 'rank' ? (
                  <SkillsHexagon
                    values={valuesFromStars}
                    secondaryValues={valuesFromRanks}
                    size={360}
                    gridLevels={5}
                    primaryColor="#6366F1"
                    secondaryColor="#F59E0B"
                  />
                ) : (
                  <SkillsHexagon
                    values={valuesFromStars}
                    secondaryValues={valuesFromSnapshot || undefined}
                    size={360}
                    gridLevels={5}
                    primaryColor="#6366F1"
                    secondaryColor="#22C55E"
                  />
                )}
              </div>
              <div className="space-y-4">
                {/* Selector de modo de comparación */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">Comparación:</span>
                  <div className="flex gap-2">
                    <button
                      className={`px-3 py-1 rounded text-sm ${compareMode==='rank'?'bg-indigo-100 text-indigo-700':'bg-gray-100 text-gray-700'}`}
                      onClick={() => setCompareMode('rank')}
                    >
                      Rangos F–S
                    </button>
                    <button
                      className={`px-3 py-1 rounded text-sm ${compareMode==='time'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}
                      onClick={() => setCompareMode('time')}
                    >
                      Por fecha
                    </button>
                  </div>
                </div>
                {compareMode === 'rank' && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600">Escala:</span>
                    <label className="text-xs text-gray-600">Base
                      <input type="number" min={0} max={50} value={scaleBase} onChange={(e)=>setScaleBase(Number(e.target.value))} className="ml-1 w-16 bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs" />
                    </label>
                    <label className="text-xs text-gray-600">Paso
                      <input type="number" min={1} max={20} value={scaleStep} onChange={(e)=>setScaleStep(Number(e.target.value))} className="ml-1 w-16 bg-gray-100 border border-gray-300 rounded px-2 py-1 text-xs" />
                    </label>
                    <button onClick={() => { setScaleBase(0); setScaleStep(Math.round(100 / (RANKS_PM.length - 1))); }} className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 border border-indigo-300">Preset F-→0 / S+→100</button>
                  </div>
                )}
                {inputs.map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{label}</span>
                      <div className="flex items-center gap-2">
                        {[1,2,3,4,5].map((s) => (
                          <button
                            key={s}
                            onClick={() => setStars((prev) => ({ ...prev, [key]: s }))}
                            className="p-0.5"
                            aria-label={`Estrellas ${s}`}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={stars[key] >= s ? '#FDE047' : 'none'} stroke="#FDE047" strokeWidth="1.5">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          </button>
                        ))}
                        {compareMode === 'rank' ? (
                          <select
                            value={ranks[key]}
                            onChange={(e) => setRanks((prev) => ({ ...prev, [key]: e.target.value as RankPM }))}
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300"
                            aria-label="Rango F-S con subniveles"
                          >
                            {RANKS_PM.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedAge}
                              onChange={(e) => setSelectedAge(e.target.value as '7d'|'1m'|'1y'|'custom')}
                              className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300"
                              aria-label="Elegir antigüedad"
                            >
                              <option value="7d">Hace 7 días</option>
                              <option value="1m">Hace 1 mes</option>
                              <option value="1y">Hace 1 año</option>
                              <option value="custom">Personalizado…</option>
                            </select>
                            {selectedAge === 'custom' && (
                              <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300"
                                aria-label="Elegir fecha personalizada"
                              />
                            )}
                            <button
                              onClick={saveSnapshot}
                              className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 border border-green-300"
                            >
                              Guardar snapshot
                            </button>
                            <span className="text-[10px] text-gray-500">Auto-snapshot:</span>
                            <select
                              value={autoSnapshot}
                              onChange={(e)=>setAutoSnapshot(e.target.value as 'off'|'daily'|'weekly'|'monthly')}
                              className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300"
                            >
                              <option value="off">Off</option>
                              <option value="daily">Diario</option>
                              <option value="weekly">Semanal</option>
                              <option value="monthly">Mensual</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {compareMode === 'rank'
                        ? 'Comparación: Estrellas vs Rango F–S (con subniveles)'
                        : (snapshotForAge
                          ? `Comparación: Hoy vs ${selectedAge === 'custom' ? (selectedDate || 'fecha personalizada') : (selectedAge === '7d' ? 'hace 7 días' : selectedAge === '1m' ? 'hace 1 mes' : 'hace 1 año')}`
                          : (selectedAge === 'custom' ? 'No hay snapshot para esa fecha seleccionada' : 'No hay snapshot guardado para esa fecha'))}
                    </div>
                    <div className="mt-1">
                      <Sparkline values={snapshots.map(s => s.stars[key])} max={5} width={140} height={28} color="#9CA3AF" />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500">
                  Ajusta estrellas y elige comparar por rango (F–S con -, +) o por fecha. Guarda snapshots para comparar "hace 7 días, 1 mes, 1 año" o selecciona una fecha personalizada.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}