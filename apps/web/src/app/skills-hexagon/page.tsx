'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { HexagonValues } from '@/components/SkillsHexagon';
const SkillsHexagon = dynamic(() => import('@/components/SkillsHexagon'), { ssr: false });
import Sparkline from '@/components/Sparkline';
import { overallRankFromHexagon, valueToRankDS, difficultyLabelForRankDS } from '@/lib/rank';

export default function SkillsHexagonPreviewPage() {
  const { data: session } = useSession();
  const effectiveUserId = session?.user?.id || 'anon';
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const envPrefix = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  const makeKey = (name: string) => `${envPrefix}:${name}:${effectiveUserId}`;
  // Levels state (beginner, novice, intermediate, advanced, expert)
  type Level = 'beginner'|'novice'|'intermediate'|'advanced'|'expert';
  const LEVELS: Level[] = ['beginner','novice','intermediate','advanced','expert'];
  const [levels, setLevels] = useState<{[k in keyof HexagonValues]: Level}>(() => {
    if (typeof window !== 'undefined') {
      const keyed = window.localStorage.getItem(`${envPrefix}:skillsHexagonLevels:${effectiveUserId}`);
      const saved = keyed ?? window.localStorage.getItem('skillsHexagonLevels');
      if (saved) {
        try { return JSON.parse(saved) as {[k in keyof HexagonValues]: Level}; } catch {}
      }
    }
    return {
      fuerzaRelativa: 'intermediate',
      resistenciaMuscular: 'intermediate',
      controlEquilibrio: 'intermediate',
      movilidadArticular: 'intermediate',
      tensionCorporal: 'intermediate',
      tecnica: 'intermediate',
    };
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(makeKey('skillsHexagonLevels'), JSON.stringify(levels));
    }
  }, [levels, effectiveUserId]);

  // Load values per user when session changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Cargar niveles por usuario; migrar desde estrellas o rangos F–S si existen
    try {
      const rawLevels = window.localStorage.getItem(makeKey('skillsHexagonLevels'))
        ?? window.localStorage.getItem('skillsHexagonLevels');
      if (rawLevels) {
        const parsed = JSON.parse(rawLevels) as {[k in keyof HexagonValues]: Level};
        setLevels((prev) => ({ ...prev, ...parsed }));
      } else {
        const rawStars = window.localStorage.getItem(makeKey('skillsHexagonStars'))
          ?? window.localStorage.getItem('skillsHexagonStars');
        if (rawStars) {
          const st = JSON.parse(rawStars) as {[k in keyof HexagonValues]: number};
          const mapStar = (n: number): Level => n <= 1 ? 'beginner' : n === 2 ? 'novice' : n === 3 ? 'intermediate' : n === 4 ? 'advanced' : 'expert';
          const lv = Object.fromEntries(Object.entries(st).map(([k,v]) => [k, mapStar(Number(v))])) as {[k in keyof HexagonValues]: Level};
          setLevels((prev) => ({ ...prev, ...lv }));
        } else {
          const rawRanks = window.localStorage.getItem(makeKey('skillsHexagonRanks'))
            ?? window.localStorage.getItem('skillsHexagonRanks');
          if (rawRanks) {
            const rk = JSON.parse(rawRanks) as {[k in keyof HexagonValues]: string};
            const RANKS_PM = ['F-','F','F+','E-','E','E+','D-','D','D+','C-','C','C+','B-','B','B+','A-','A','A+','S-','S','S+'] as const;
            const toLevel = (r: string): Level => {
              const idx = RANKS_PM.indexOf(r as any);
              if (idx < 0) return 'intermediate';
              return idx <= 3 ? 'beginner' : idx <= 7 ? 'novice' : idx <= 11 ? 'intermediate' : idx <= 15 ? 'advanced' : 'expert';
            };
            const lv = Object.fromEntries(Object.entries(rk).map(([k,v]) => [k, toLevel(String(v))])) as {[k in keyof HexagonValues]: Level};
            setLevels((prev) => ({ ...prev, ...lv }));
          }
        }
      }
    } catch {}
    try {
      const rawSnaps = window.localStorage.getItem(makeKey('skillsHexagonSnapshots'))
        ?? window.localStorage.getItem('skillsHexagonSnapshots');
      if (rawSnaps) {
        const parsed = JSON.parse(rawSnaps) as Snapshot[];
        setSnapshots(parsed);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId]);

  const levelToValue = (lvl: Level) => lvl === 'beginner' ? 20 : lvl === 'novice' ? 40 : lvl === 'intermediate' ? 60 : lvl === 'advanced' ? 80 : 100;
  const valuesFromLevels: HexagonValues = {
    fuerzaRelativa: levelToValue(levels.fuerzaRelativa),
    resistenciaMuscular: levelToValue(levels.resistenciaMuscular),
    controlEquilibrio: levelToValue(levels.controlEquilibrio),
    movilidadArticular: levelToValue(levels.movilidadArticular),
    tensionCorporal: levelToValue(levels.tensionCorporal),
    tecnica: levelToValue(levels.tecnica),
  };

  // Overall user rank (DS) based on average of the six axes
  const overallRank = overallRankFromHexagon(valuesFromLevels);
  const overallLabel = difficultyLabelForRankDS(overallRank);

  // Snapshots to compare by date (levels)
  type Snapshot = { ts: number; levels: {[k in keyof HexagonValues]: Level} };
  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(makeKey('skillsHexagonSnapshots'))
        ?? window.localStorage.getItem('skillsHexagonSnapshots');
      if (raw) {
        try {
          const arr = JSON.parse(raw) as any[];
          const mapStar = (n: number): Level => n <= 1 ? 'beginner' : n === 2 ? 'novice' : n === 3 ? 'intermediate' : n === 4 ? 'advanced' : 'expert';
          const normalized = arr.map((s) => (
            s && typeof s.ts === 'number' && s.levels ? s as Snapshot
            : s && typeof s.ts === 'number' && s.stars ? { ts: s.ts, levels: Object.fromEntries(Object.entries(s.stars).map(([k,v]) => [k, mapStar(Number(v))])) } as Snapshot
            : null
          )).filter(Boolean) as Snapshot[];
          return normalized;
        } catch {}
      }
    }
    return [];
  });
  const saveSnapshot = () => {
    const snap: Snapshot = { ts: Date.now(), levels };
    const next = [snap, ...snapshots].slice(0, 50);
    setSnapshots(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(makeKey('skillsHexagonSnapshots'), JSON.stringify(next));
    }
    // Also persist to backend for cross-platform sync
    try {
      fetch('/api/skills-snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: effectiveUserId, snapshot: snap }),
      }).catch(() => {});
    } catch {}
  };
  // On mount, try to load server snapshots and merge with local
  useEffect(() => {
    let cancelled = false;
    const loadServerSnapshots = async () => {
      try {
        const res = await fetch(`/api/skills-snapshots?userId=${encodeURIComponent(effectiveUserId)}`);
        if (!res.ok) return;
        const data = await res.json();
        const serverSnapsRaw: any[] = Array.isArray(data?.snapshots) ? data.snapshots : [];
        if (!serverSnapsRaw.length) return;
        const mapStar = (n: number): Level => n <= 1 ? 'beginner' : n === 2 ? 'novice' : n === 3 ? 'intermediate' : n === 4 ? 'advanced' : 'expert';
        const normalize = (s: any): Snapshot | null => {
          if (!s || typeof s.ts !== 'number') return null;
          if (s.levels) return { ts: s.ts, levels: s.levels as {[k in keyof HexagonValues]: Level} };
          if (s.stars) return { ts: s.ts, levels: Object.fromEntries(Object.entries(s.stars).map(([k,v]) => [k, mapStar(Number(v))])) as {[k in keyof HexagonValues]: Level} };
          return null;
        };
        const serverSnaps = serverSnapsRaw.map(normalize).filter(Boolean) as Snapshot[];
        const byTs = new Map<number, Snapshot>();
        [...serverSnaps, ...snapshots].forEach((s) => {
          if (s && typeof s.ts === 'number' && s.levels) {
            byTs.set(s.ts, s);
          }
        });
        const merged = Array.from(byTs.values()).sort((a,b) => b.ts - a.ts).slice(0, 200);
        if (!cancelled) {
          setSnapshots(merged);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(makeKey('skillsHexagonSnapshots'), JSON.stringify(merged));
          }
        }
      } catch {}
    };
    loadServerSnapshots();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);
  const getSnapshotByAgeDays = (days: number): Snapshot | undefined => {
    const targetTs = Date.now() - days * 24 * 60 * 60 * 1000;
    return snapshots.filter(s => s.ts <= targetTs).sort((a,b) => b.ts - a.ts)[0];
  };
  // Single mode: compare by date
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
    fuerzaRelativa: levelToValue(snapshotForAge.levels.fuerzaRelativa),
    resistenciaMuscular: levelToValue(snapshotForAge.levels.resistenciaMuscular),
    controlEquilibrio: levelToValue(snapshotForAge.levels.controlEquilibrio),
    movilidadArticular: levelToValue(snapshotForAge.levels.movilidadArticular),
    tensionCorporal: levelToValue(snapshotForAge.levels.tensionCorporal),
    tecnica: levelToValue(snapshotForAge.levels.tecnica),
  } : null;

  // User percentiles compared to the global distribution
  type AxisPercentile = { above: number; top: number };
  const [percentiles, setPercentiles] = useState<{[k in keyof HexagonValues]?: AxisPercentile}>({});
  const levelToStars = (lvl: Level) => lvl === 'beginner' ? 1 : lvl === 'novice' ? 2 : lvl === 'intermediate' ? 3 : lvl === 'advanced' ? 4 : 5;
  useEffect(() => {
    (async () => {
      try {
        const stars = {
          fuerzaRelativa: levelToStars(levels.fuerzaRelativa),
          resistenciaMuscular: levelToStars(levels.resistenciaMuscular),
          controlEquilibrio: levelToStars(levels.controlEquilibrio),
          movilidadArticular: levelToStars(levels.movilidadArticular),
          tensionCorporal: levelToStars(levels.tensionCorporal),
          tecnica: levelToStars(levels.tecnica),
        };
        const res = await fetch('/api/skills-percentiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stars })
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.percentiles) {
          setPercentiles(data.percentiles);
        }
      } catch {}
    })();
  }, [levels]);

  // Auto-snapshots: daily/weekly
  const [autoSnapshot, setAutoSnapshot] = useState<'off'|'daily'|'weekly'|'monthly'>(() => {
    if (typeof window !== 'undefined') {
      const v = window.localStorage.getItem(makeKey('skillsHexagonAutoSnapshot'))
        ?? window.localStorage.getItem('skillsHexagonAutoSnapshot');
      if (v === 'daily' || v === 'weekly' || v === 'monthly') return v as 'daily'|'weekly'|'monthly';
    }
    return 'off';
  });
  const [lastAutoSnapshotTs, setLastAutoSnapshotTs] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const v = window.localStorage.getItem(makeKey('skillsHexagonLastAutoSnapshot'))
        ?? window.localStorage.getItem('skillsHexagonLastAutoSnapshot');
      if (v) return Number(v);
    }
    return 0;
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(makeKey('skillsHexagonAutoSnapshot'), autoSnapshot);
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
          window.localStorage.setItem(makeKey('skillsHexagonLastAutoSnapshot'), String(now));
        }
      }
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoSnapshot, lastAutoSnapshotTs, snapshots, levels]);

  // Range selector and pagination for snapshots
  const DAY_MS = 24 * 60 * 60 * 1000;
  const [range, setRange] = useState<'7d'|'30d'|'90d'|'all'>('30d');
  const rangeDaysMap2 = { '7d': 7, '30d': 30, '90d': 90, 'all': Infinity } as const;
  const nowTs = Date.now();
  const filteredSnapshots = snapshots
    .filter(s => range === 'all' ? true : (nowTs - s.ts) <= rangeDaysMap2[range] * DAY_MS)
    .sort((a,b) => b.ts - a.ts);
  const pageSize = 10;
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(filteredSnapshots.length / pageSize));
  const pageItems = filteredSnapshots.slice(page * pageSize, (page + 1) * pageSize);
  useEffect(() => { setPage(0); }, [range, effectiveUserId, snapshots.length]);

  // Acciones sobre snapshots
  const revertSnapshot = (ts: number) => {
    const s = snapshots.find(sn => sn.ts === ts);
    if (!s) return;
    setLevels(s.levels);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(makeKey('skillsHexagonLevels'), JSON.stringify(s.levels));
    }
  };
  const deleteSnapshot = async (ts: number) => {
    const next = snapshots.filter(sn => sn.ts !== ts);
    setSnapshots(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(makeKey('skillsHexagonSnapshots'), JSON.stringify(next));
    }
    try {
      await fetch('/api/skills-snapshots', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: effectiveUserId, ts }),
      });
    } catch {}
  };

  const inputs: [keyof HexagonValues, string][] = [
    ['fuerzaRelativa', 'Relative strength'],
    ['resistenciaMuscular', 'Muscular endurance'],
    ['controlEquilibrio', 'Control & balance'],
    ['movilidadArticular', 'Joint mobility'],
    ['tensionCorporal', 'Body tension / core'],
    ['tecnica', 'Technique / specific skill'],
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Skills Hexagon – Preview</CardTitle>
            <CardDescription>
              Overall Rank: {overallRank} ({overallLabel})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Percentiles panel per axis */}
            {mounted && (
              <div className="bg-white/70 border border-gray-200 rounded-lg p-3" suppressHydrationWarning>
                <div className="text-sm font-medium text-gray-700 mb-2">Percentile comparison</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {inputs.map(([key, label]) => {
                    const p = percentiles[key];
                    return (
                      <div key={`pct-${String(key)}`} className="flex items-center justify-between text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1">
                        <span className="text-gray-700 truncate pr-2">{label}</span>
                        <span className="text-gray-600">
                          {p ? (
                            <>
                              ↑ {p.above}% • top {p.top}%
                            </>
                          ) : (
                            '—'
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-[11px] text-gray-500">Based on your current rank (D–S) converted to stars (1–5) compared to the user distribution.</div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-center">
                <SkillsHexagon
                  values={valuesFromLevels}
                  secondaryValues={valuesFromSnapshot || undefined}
                  size={360}
                  gridLevels={5}
                  primaryColor="#6366F1"
                  secondaryColor="#22C55E"
                />
              </div>
              <div className="space-y-4">
                {mounted && inputs.map(([key, label]) => (
                  <div key={key} className="space-y-2" suppressHydrationWarning>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{label}</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={levels[key]}
                          onChange={(e) => setLevels((prev) => ({ ...prev, [key]: e.target.value as Level }))}
                          className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300"
                          aria-label="Nivel"
                        >
                          <option value="beginner">D (Beginner)</option>
                          <option value="novice">C (Novice)</option>
                          <option value="intermediate">B (Intermediate)</option>
                          <option value="advanced">A (Advanced)</option>
                          <option value="expert">S (Expert)</option>
                        </select>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedAge}
                            onChange={(e) => setSelectedAge(e.target.value as '7d'|'1m'|'1y'|'custom')}
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300"
                          aria-label="Choose age range"
                        >
                          <option value="7d">7 days ago</option>
                          <option value="1m">1 month ago</option>
                          <option value="1y">1 year ago</option>
                          <option value="custom">Custom…</option>
                        </select>
                        {selectedAge === 'custom' && (
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300"
                            aria-label="Choose custom date"
                          />
                        )}
                        <button
                          onClick={saveSnapshot}
                          className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 border border-green-300"
                          >
                            Save snapshot
                          </button>
                          <span className="text-[10px] text-gray-500">Auto-snapshot:</span>
                          <select
                            value={autoSnapshot}
                            onChange={(e)=>setAutoSnapshot(e.target.value as 'off'|'daily'|'weekly'|'monthly')}
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300"
                          >
                            <option value="off">Off</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {snapshotForAge
                        ? `Compare: Current levels vs ${selectedAge === 'custom' ? (selectedDate || 'custom date') : (selectedAge === '7d' ? '7 days ago' : selectedAge === '1m' ? '1 month ago' : '1 year ago')}`
                        : (selectedAge === 'custom' ? 'No snapshot for selected date' : 'No snapshot saved for that date')}
                    </div>
                    <div className="mt-1">
                      <Sparkline values={snapshots.map(s => (['beginner','novice','intermediate','advanced','expert'].indexOf(s.levels[key]) + 1))} max={5} width={140} height={28} color="#9CA3AF" />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500">
                  Adjust levels and compare by date. Save snapshots to compare "7 days ago, 1 month ago, 1 year ago" or choose a custom date.
                </p>
                {/* Lista de snapshots con rango y paginación */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Range:</span>
                    <select
                      value={range}
                      onChange={(e)=>setRange(e.target.value as '7d'|'30d'|'90d'|'all')}
                      className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="all">All</option>
                    </select>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={()=>setPage(p=>Math.max(0, p-1))}
                        disabled={page<=0}
                        className={`text-xs px-2 py-1 rounded border ${page<=0?'bg-gray-100 text-gray-400 border-gray-200':'bg-gray-100 text-gray-700 border-gray-300'}`}
                      >
                        Prev
                      </button>
                      <span className="text-[11px] text-gray-600">Page {page+1} of {totalPages}</span>
                      <button
                        onClick={()=>setPage(p=>Math.min(totalPages-1, p+1))}
                        disabled={page>=totalPages-1}
                        className={`text-xs px-2 py-1 rounded border ${page>=totalPages-1?'bg-gray-100 text-gray-400 border-gray-200':'bg-gray-100 text-gray-700 border-gray-300'}`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                  <ul className="text-xs text-gray-700 bg-white/60 rounded border border-gray-200 divide-y">
                    {pageItems.length === 0 && (
                      <li className="p-2 text-gray-500">No snapshots in this range.</li>
                    )}
                    {pageItems.map((s) => (
                      <li key={s.ts} className="p-2 flex items-center gap-3">
                        <span className="text-gray-600 w-48 truncate">{new Date(s.ts).toLocaleString()}</span>
                        <span className="font-mono text-[11px] text-gray-800 flex-1">
                          FR:{s.levels.fuerzaRelativa} RM:{s.levels.resistenciaMuscular} CE:{s.levels.controlEquilibrio} MA:{s.levels.movilidadArticular} TC:{s.levels.tensionCorporal} TE:{s.levels.tecnica}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => revertSnapshot(s.ts)}
                            className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 border border-indigo-300"
                          >
                            Revert
                          </button>
                          <button
                            onClick={() => deleteSnapshot(s.ts)}
                            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 border border-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}