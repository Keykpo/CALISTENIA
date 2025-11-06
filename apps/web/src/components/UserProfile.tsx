'use client';

import React, { useState, useEffect } from 'react';
import SkillsHexagon, { HexagonValues } from '@/components/SkillsHexagon';
import Sparkline from '@/components/Sparkline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Zap, 
  Coins, 
  Crown, 
  Trophy, 
  Target, 
  Calendar,
  TrendingUp,
  Star,
  Award
} from 'lucide-react';
import { RankDS, rankDSToValue } from '@/lib/rank';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  xp: number;
  currentLevel: number;
  virtualCoins: number;
  createdAt: string;
}

interface LevelInfo {
  currentLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressToNext: number;
  xpNeededForNext: number;
  levelTitle: string;
  nextLevelTitle: string;
}

interface SkillStats {
  totalSkills: number;
  completedSkills: number;
  completionRate: number;
  branchProgress: {
    [branch: string]: {
      completed: number;
      total: number;
      rate: number;
    };
  };
}

interface AchievementStats {
  total: number;
  unlocked: number;
  completed: number;
  completionRate: number;
}

interface UserProfileProps {
  userId?: string;
}

const branchNames = {
  EMPUJE: 'Empuje',
  TRACCION: 'Tracción',
  CORE: 'Core',
  EQUILIBRIO: 'Equilibrio',
  TREN_INFERIOR: 'Tren Inferior',
  ESTATICOS: 'Estáticos',
};

const branchColors = {
  EMPUJE: 'from-red-500 to-red-600',
  TRACCION: 'from-blue-500 to-blue-600',
  CORE: 'from-green-500 to-green-600',
  EQUILIBRIO: 'from-purple-500 to-purple-600',
  TREN_INFERIOR: 'from-orange-500 to-orange-600',
  ESTATICOS: 'from-gray-500 to-gray-600',
};

export default function UserProfile({ userId }: UserProfileProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [skillStats, setSkillStats] = useState<SkillStats | null>(null);
  const [achievementStats, setAchievementStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hexagonValues, setHexagonValues] = useState<HexagonValues | null>(null);
  // Estados: estrellas (0-5) y rangos (F-S con subniveles -, +) para comparar visualmente
  const [hexStars, setHexStars] = useState<{[k in keyof HexagonValues]: number}>(() => {
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
  const RANKS_DS: RankDS[] = ['D','C','B','A','S'];
  const [hexRanks, setHexRanks] = useState<{[k in keyof HexagonValues]: RankDS}>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('skillsHexagonRanks');
      if (saved) {
        try {
          const raw = JSON.parse(saved) as {[k in keyof HexagonValues]: string};
          const toDS = (v: string): RankDS => {
            const m = String(v).match(/[DCBAS]/);
            return (m ? (m[0] as RankDS) : 'C');
          };
          return {
            fuerzaRelativa: toDS(raw.fuerzaRelativa),
            resistenciaMuscular: toDS(raw.resistenciaMuscular),
            controlEquilibrio: toDS(raw.controlEquilibrio),
            movilidadArticular: toDS(raw.movilidadArticular),
            tensionCorporal: toDS(raw.tensionCorporal),
            tecnica: toDS(raw.tecnica),
          } as {[k in keyof HexagonValues]: RankDS};
        } catch {}
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
    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('skillsHexagonStars', JSON.stringify(hexStars));
    }
  }, [hexStars]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('skillsHexagonRanks', JSON.stringify(hexRanks));
    }
  }, [hexRanks]);

  // Mapear a valores 0-100 para el hexágono
  const starToValue = (n: number) => Math.max(0, Math.min(5, n)) * 20;
  const hexValuesFromStars: HexagonValues = {
    fuerzaRelativa: starToValue(hexStars.fuerzaRelativa),
    resistenciaMuscular: starToValue(hexStars.resistenciaMuscular),
    controlEquilibrio: starToValue(hexStars.controlEquilibrio),
    movilidadArticular: starToValue(hexStars.movilidadArticular),
    tensionCorporal: starToValue(hexStars.tensionCorporal),
    tecnica: starToValue(hexStars.tecnica),
  };
  const hexValuesFromRanks: HexagonValues = {
    fuerzaRelativa: rankDSToValue(hexRanks.fuerzaRelativa),
    resistenciaMuscular: rankDSToValue(hexRanks.resistenciaMuscular),
    controlEquilibrio: rankDSToValue(hexRanks.controlEquilibrio),
    movilidadArticular: rankDSToValue(hexRanks.movilidadArticular),
    tensionCorporal: rankDSToValue(hexRanks.tensionCorporal),
    tecnica: rankDSToValue(hexRanks.tecnica),
  };

  // Comparación por fecha: snapshots en localStorage
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
  const [persistServer, setPersistServer] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const v = window.localStorage.getItem('skillsHexagonPersistServer');
      if (v) return v === 'true';
    }
    return false;
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('skillsHexagonPersistServer', String(persistServer));
    }
  }, [persistServer]);
  const saveSnapshot = () => {
    const snap: Snapshot = { ts: Date.now(), stars: hexStars };
    const next = [snap, ...snapshots].slice(0, 50);
    setSnapshots(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('skillsHexagonSnapshots', JSON.stringify(next));
    }
    if (persistServer) {
      try {
        fetch('/api/skills-snapshots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'anon', snapshot: snap })
        });
      } catch {}
    }
  };
  const getSnapshotByAgeDays = (days: number): Snapshot | undefined => {
    const targetTs = Date.now() - days * 24 * 60 * 60 * 1000;
    // Elegir el snapshot más cercano antes de esa fecha
    return snapshots
      .filter(s => s.ts <= targetTs)
      .sort((a,b) => b.ts - a.ts)[0];
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
  const hexValuesFromSnapshot: HexagonValues | null = snapshotForAge ? {
    fuerzaRelativa: starToValue(snapshotForAge.stars.fuerzaRelativa),
    resistenciaMuscular: starToValue(snapshotForAge.stars.resistenciaMuscular),
    controlEquilibrio: starToValue(snapshotForAge.stars.controlEquilibrio),
    movilidadArticular: starToValue(snapshotForAge.stars.movilidadArticular),
    tensionCorporal: starToValue(snapshotForAge.stars.tensionCorporal),
    tecnica: starToValue(snapshotForAge.stars.tecnica),
  } : null;

  // Percentiles por eje basados en la base del servidor
  type AxisPercentile = { above: number; top: number };
  const [percentiles, setPercentiles] = useState<{[k in keyof HexagonValues]?: AxisPercentile}>({});
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/skills-percentiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stars: hexStars })
        });
        const data = await res.json();
        if (data && data.percentiles) {
          setPercentiles(data.percentiles);
        }
      } catch {}
    })();
  }, [hexStars]);

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
    }, 60 * 60 * 1000); // comprobar cada hora
    return () => clearInterval(interval);
  }, [autoSnapshot, lastAutoSnapshotTs, snapshots, hexStars]);

  useEffect(() => {
    if (!persistServer) return;
    (async () => {
      try {
        const res = await fetch('/api/skills-snapshots?userId=anon');
        const data = await res.json();
        if (Array.isArray(data.snapshots)) {
          setSnapshots((prev) => {
            const merged = [...data.snapshots, ...prev].sort((a,b)=>b.ts-a.ts).slice(0,50);
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('skillsHexagonSnapshots', JSON.stringify(merged));
            }
            return merged;
          });
        }
      } catch {}
    })();
  }, [persistServer]);
  // Eliminada la escala personalizada de subniveles; DS usa valores representativos fijos.

  const fetchUserProfile = async () => {
    try {
      // Fetch user level info
      const levelResponse = await fetch('/api/user/level');
      if (levelResponse.ok) {
        const levelData = await levelResponse.json();
        const apiUser = levelData.user || levelData.userInfo || null;
        const apiStats = levelData.stats || levelData.skillStats || null;
        const li = levelData.levelInfo || {};

        // Mapear la forma del backend a la esperada por el componente
        if (apiUser) {
          setUserInfo({
            id: String(userId || ''),
            name: '',
            email: '',
            xp: apiUser.totalXP ?? 0,
            currentLevel: apiUser.currentLevel ?? (li?.currentLevel ?? 1),
            virtualCoins: apiUser.virtualCoins ?? 0,
            createdAt: '',
          });
        }

        if (li) {
          setLevelInfo({
            currentLevel: li.currentLevel ?? 1,
            currentLevelXp: li.xpInCurrentLevel ?? (li.currentLevelInfo?.requiredXP ?? 0),
            nextLevelXp: li.nextLevelInfo?.requiredXP ?? (li.xpInCurrentLevel ?? 0),
            progressToNext: li.progressToNext ?? 0,
            xpNeededForNext: li.xpNeededForNext ?? 0,
            levelTitle: li.currentLevelInfo?.title ?? '',
            nextLevelTitle: li.nextLevelInfo?.title ?? '',
          });
        }

        if (apiStats) {
          setSkillStats({
            totalSkills: apiStats.totalSkills ?? 0,
            completedSkills: apiStats.completedSkills ?? 0,
            completionRate: apiStats.completionRate ?? 0,
            branchProgress: apiStats.branchProgress ?? {},
          });
        }
      }

      // Fetch hexagon computed from exercise sessions
      try {
        const hexRes = await fetch('/api/user/skills-hexagon?rangeDays=60');
        if (hexRes.ok) {
          const hexData = await hexRes.json();
          if (hexData?.values) {
            setHexagonValues(hexData.values as HexagonValues);
            // sincronizar estrellas locales con valores calculados
            const v = hexData.values as HexagonValues;
            const toStars = (x: number) => Math.max(0, Math.min(5, Math.round(x / 20)));
            setHexStars({
              fuerzaRelativa: toStars(v.fuerzaRelativa),
              resistenciaMuscular: toStars(v.resistenciaMuscular),
              controlEquilibrio: toStars(v.controlEquilibrio),
              movilidadArticular: toStars(v.movilidadArticular),
              tensionCorporal: toStars(v.tensionCorporal),
              tecnica: toStars(v.tecnica),
            });
          }
        }
      } catch (e) {
        console.warn('Fallo al obtener hexágono desde sesiones, uso valores locales.', e);
      }

      // Fetch achievement stats
      const achievementResponse = await fetch('/api/user/achievements');
      if (achievementResponse.ok) {
        const achievementData = await achievementResponse.json();
        setAchievementStats(achievementData.stats);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getAccountAge = () => {
    if (!userInfo?.createdAt) return '';
    const created = new Date(userInfo.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} días`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userInfo || !levelInfo || !skillStats) {
    return (
      <div className="text-center py-8 text-gray-500">
        Error al cargar el perfil del usuario.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{userInfo.name}</h1>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Nivel {levelInfo.currentLevel}
                </Badge>
              </div>
              <p className="text-gray-600 mb-3">{userInfo.email}</p>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Miembro desde hace {getAccountAge()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{levelInfo.levelTitle}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-blue-600">
                    <Zap className="h-5 w-5" />
                    <span className="text-2xl font-bold">{userInfo.xp.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-600">XP Total</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Coins className="h-5 w-5" />
                    <span className="text-2xl font-bold">{userInfo.virtualCoins.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-600">Monedas</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="skills">Habilidades</TabsTrigger>
          <TabsTrigger value="achievements">Logros</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Progreso de Nivel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">
                    Nivel {levelInfo.currentLevel} - {levelInfo.levelTitle}
                  </p>
                  <p className="text-sm text-gray-600">
                    Siguiente: {levelInfo.nextLevelTitle}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {levelInfo.currentLevelXp.toLocaleString()} / {levelInfo.nextLevelXp.toLocaleString()} XP
                  </p>
                  <p className="text-xs text-gray-500">
                    {levelInfo.xpNeededForNext.toLocaleString()} XP restante
                  </p>
                </div>
              </div>
              <Progress value={levelInfo.progressToNext} className="h-3" />
              <p className="text-center text-sm text-gray-600">
                {Math.round(levelInfo.progressToNext)}% hacia el siguiente nivel
              </p>
            </CardContent>
          </Card>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{skillStats.completedSkills}</div>
                <p className="text-sm text-gray-600">Habilidades Completadas</p>
                <p className="text-xs text-gray-500">
                  de {skillStats.totalSkills} totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {achievementStats ? achievementStats.unlocked : 0}
                </div>
                <p className="text-sm text-gray-600">Logros Desbloqueados</p>
                <p className="text-xs text-gray-500">
                  de {achievementStats ? achievementStats.total : 0} totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {Math.round(skillStats.completionRate)}%
                </div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-xs text-gray-500">Skills</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          {/* Skills Hexagon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-indigo-600" />
                Skills Hexagon (Calisthenics)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-center">
                  {compareMode === 'rank' ? (
                    <SkillsHexagon
                      values={hexagonValues ?? hexValuesFromStars}
                      secondaryValues={{
                        fuerzaRelativa: rankDSToValue(hexRanks.fuerzaRelativa),
                        resistenciaMuscular: rankDSToValue(hexRanks.resistenciaMuscular),
                        controlEquilibrio: rankDSToValue(hexRanks.controlEquilibrio),
                        movilidadArticular: rankDSToValue(hexRanks.movilidadArticular),
                        tensionCorporal: rankDSToValue(hexRanks.tensionCorporal),
                        tecnica: rankDSToValue(hexRanks.tecnica),
                      }}
                      size={360}
                      gridLevels={5}
                      primaryColor="#6366F1"
                      secondaryColor="#F59E0B"
                    />
                  ) : (
                    <SkillsHexagon
                      values={hexagonValues ?? hexValuesFromStars}
                      secondaryValues={hexValuesFromSnapshot || undefined}
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
                        Rangos D–S
                      </button>
                      <button
                        className={`px-3 py-1 rounded text-sm ${compareMode==='time'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}
                        onClick={() => setCompareMode('time')}
                      >
                        Por fecha
                      </button>
                    </div>
                  </div>
                  {([
                    ['fuerzaRelativa', 'Fuerza relativa'],
                    ['resistenciaMuscular', 'Resistencia muscular'],
                    ['controlEquilibrio', 'Control y equilibrio'],
                    ['movilidadArticular', 'Movilidad articular'],
                    ['tensionCorporal', 'Tensión corporal / core'],
                    ['tecnica', 'Técnica / Habilidad específica'],
                  ] as [keyof HexagonValues, string][]).map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{label}</span>
                        <div className="flex items-center gap-2">
                          {/* Estrellas (0-5) */}
                          {[1,2,3,4,5].map((s) => (
                            <button
                              key={s}
                              onClick={() => setHexStars((prev) => ({ ...prev, [key]: s }))}
                              className="p-0.5"
                              aria-label={`Estrellas ${s}`}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill={hexStars[key] >= s ? '#FDE047' : 'none'} stroke="#FDE047" strokeWidth="1.5">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            </button>
                          ))}
                          {compareMode === 'rank' ? (
                            <select
                              value={hexRanks[key]}
                              onChange={(e) => setHexRanks((prev) => ({ ...prev, [key]: e.target.value as RankDS }))}
                              className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300"
                              aria-label="Rango D-S"
                            >
                              {RANKS_DS.map((r) => (
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
                              <label className="text-[10px] text-gray-500 ml-2 flex items-center gap-1">
                                <input type="checkbox" checked={persistServer} onChange={(e)=>setPersistServer(e.target.checked)} />
                                Persistir en servidor
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {compareMode === 'rank'
                          ? 'Comparación: Estrellas vs Rango D–S'
                          : (snapshotForAge
                            ? `Comparación: Hoy vs ${selectedAge === 'custom' ? (selectedDate || 'fecha personalizada') : (selectedAge === '7d' ? 'hace 7 días' : selectedAge === '1m' ? 'hace 1 mes' : 'hace 1 año')}`
                            : (selectedAge === 'custom' ? 'No hay snapshot para esa fecha seleccionada' : 'No hay snapshot guardado para esa fecha'))}
                      </div>
                      {percentiles[key] && (
                        <div className="text-[11px] text-indigo-700">
                          Estás por encima del {Math.round(percentiles[key]!.above)}% de usuarios en {label}. Top {Math.round(percentiles[key]!.top)}%.
                        </div>
                      )}
                      {/* Sparkline historial por eje (estrellas) */}
                      <div className="mt-1">
                        <Sparkline values={snapshots.map(s => s.stars[key])} max={5} width={140} height={28} color="#9CA3AF" />
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500">
                    Ajusta estrellas y selecciona comparar por rango (F–S con -, +) o por fecha guardando snapshots y eligiendo "hace 7 días, 1 mes, 1 año" o una fecha personalizada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branch Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Progreso por Rama
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(skillStats.branchProgress).map(([branch, progress]) => (
                <div key={branch} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {branchNames[branch as keyof typeof branchNames] || branch}
                    </span>
                    <span className="text-sm text-gray-600">
                      {progress.completed} / {progress.total}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={progress.rate} className="h-2" />
                    <div 
                      className={`absolute inset-0 bg-gradient-to-r ${
                        branchColors[branch as keyof typeof branchColors] || 'from-gray-400 to-gray-500'
                      } rounded-full opacity-80`}
                      style={{ width: `${progress.rate}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-right">
                    {Math.round(progress.rate)}% completado
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {achievementStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Resumen de Logros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {achievementStats.total}
                    </div>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {achievementStats.unlocked}
                    </div>
                    <p className="text-sm text-gray-600">Desbloqueados</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {achievementStats.completed}
                    </div>
                    <p className="text-sm text-gray-600">Completados</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(achievementStats.completionRate)}%
                    </div>
                    <p className="text-sm text-gray-600">Tasa</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={achievementStats.completionRate} className="h-3" />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}