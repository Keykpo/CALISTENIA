'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import toast from 'react-hot-toast';
import {
  Target,
  CheckCircle2,
  Circle,
  Zap,
  Award,
  RefreshCw,
  Flame,
  TrendingUp,
  Coins
} from 'lucide-react';

interface Mission {
  id: string;
  type: string;
  description: string;
  target: number | null;
  progress: number;
  completed: boolean;
  rewardXP: number;
  rewardCoins: number;
}

interface DailyMissionsPanelProps {
  userId: string;
  onMissionComplete?: () => void;
}

export default function DailyMissionsPanel({ userId, onMissionComplete }: DailyMissionsPanelProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMissions();
  }, [userId]);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/missions/daily', {
        headers: { 'x-user-id': userId },
      });

      if (res.ok) {
        const data = await res.json();
        setMissions(data.missions || []);
      }
    } catch (error) {
      console.error('Error fetching missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeMission = async (missionId: string) => {
    try {
      setCompleting(missionId);
      const res = await fetch('/api/missions/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ missionId, userId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Update local state
          setMissions(prev =>
            prev.map(m =>
              m.id === missionId
                ? { ...m, completed: true, progress: m.target || 1 }
                : m
            )
          );

          // Show success toast
          toast.success(`¡Misión completada! +${data.rewards?.xp || 0} XP y +${data.rewards?.coins || 0} monedas`);

          // Notify parent
          onMissionComplete?.();
        }
      }
    } catch (error) {
      console.error('Error completing mission:', error);
      toast.error("No se pudo completar la misión");
    } finally {
      setCompleting(null);
    }
  };

  const refreshMissions = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/missions/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMissions(data.missions || []);
        toast.success(data.message || "¡Misiones actualizadas exitosamente!");

        // Notify parent to refresh coins
        onMissionComplete?.();
      } else {
        toast.error(data.error || "No se pudieron generar nuevas misiones");
      }
    } catch (error) {
      console.error('Error refreshing missions:', error);
      toast.error("No se pudo refrescar las misiones");
    } finally {
      setRefreshing(false);
    }
  };

  const completedCount = missions.filter(m => m.completed).length;
  const totalCount = missions.length;
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const totalXP = missions.reduce((sum, m) => sum + (m.completed ? m.rewardXP : 0), 0);
  const totalCoins = missions.reduce((sum, m) => sum + (m.completed ? m.rewardCoins : 0), 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-slate-600 mt-3">Cargando misiones...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Progreso del Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{completedCount}</span>
              <span className="text-slate-500">/ {totalCount}</span>
            </div>
            <Progress value={overallProgress} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              XP Ganado Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              <span className="text-3xl font-bold text-purple-600">{totalXP}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Monedas Ganadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-3xl font-bold text-amber-600">{totalCoins}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Misiones de Hoy
              </CardTitle>
              <CardDescription>
                Completa todas las misiones para mantener tu racha diaria
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshMissions}
              disabled={refreshing || loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <Coins className="w-4 h-4" />
              <span>3</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {missions.length > 0 ? (
            <div className="space-y-4">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    mission.completed
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Status Icon */}
                      <div className="mt-1">
                        {mission.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      {/* Mission Content */}
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${
                            mission.completed ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {mission.description}
                        </h4>

                        {/* Progress Bar */}
                        {mission.target && !mission.completed && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-slate-600 mb-1">
                              <span>
                                {mission.progress} / {mission.target}
                              </span>
                              <span>
                                {Math.round((mission.progress / mission.target) * 100)}%
                              </span>
                            </div>
                            <Progress
                              value={(mission.progress / mission.target) * 100}
                              className="h-2"
                            />
                          </div>
                        )}

                        {/* Rewards */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-sm">
                            <Zap className="w-4 h-4 text-purple-500" />
                            <span className="font-medium text-purple-600">
                              +{mission.rewardXP} XP
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Award className="w-4 h-4 text-amber-500" />
                            <span className="font-medium text-amber-600">
                              +{mission.rewardCoins} monedas
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Complete Button */}
                    {!mission.completed && (
                      <Button
                        onClick={() => completeMission(mission.id)}
                        disabled={completing === mission.id}
                        className="whitespace-nowrap"
                      >
                        {completing === mission.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Completando...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Completar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-4">No hay misiones disponibles hoy</p>
              <Button onClick={refreshMissions} variant="outline" disabled={refreshing} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Generar Misiones
                <Coins className="w-4 h-4 ml-2" />
                <span>3</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Complete Message */}
      {completedCount === totalCount && totalCount > 0 && (
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="py-6">
            <div className="text-center">
              <Flame className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-2">
                ¡Todas las misiones completadas!
              </h3>
              <p className="text-green-100 mb-4">
                Has ganado {totalXP} XP y {totalCoins} monedas hoy
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Tu racha diaria ha aumentado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
