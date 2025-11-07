'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import toast from 'react-hot-toast';
import {
  Trophy,
  Award,
  Star,
  Crown,
  Sparkles,
  Lock,
  RefreshCw,
  Target,
  CheckCircle,
  Link as LinkIcon
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  target?: number;
  unit?: string;
  points: number;
  rarity: string;
  level?: number;
  chainName?: string;
  iconUrl?: string;
  isUnlocked?: boolean;
  progress?: number;
  unlockedAt?: string;
}

interface ActiveAchievement {
  achievement: Achievement;
  userAchievement: {
    id: string;
    progress: number;
    completed: boolean;
    completedAt?: string;
  } | null;
  chainName: string;
  isActive: boolean;
  chainCompleted?: boolean;
}

interface AchievementsViewProps {
  userId: string;
}

const RARITY_CONFIG = {
  NOVICE: {
    color: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: Star,
    bgGradient: 'from-slate-50 to-slate-100',
  },
  INTERMEDIATE: {
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: Award,
    bgGradient: 'from-green-50 to-green-100',
  },
  ADVANCED: {
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: Trophy,
    bgGradient: 'from-blue-50 to-blue-100',
  },
  EXPERT: {
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: Sparkles,
    bgGradient: 'from-purple-50 to-purple-100',
  },
  LEGENDARY: {
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Crown,
    bgGradient: 'from-amber-50 to-amber-100',
  },
};

export default function AchievementsView({ userId }: AchievementsViewProps) {
  const [activeAchievements, setActiveAchievements] = useState<ActiveAchievement[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveAchievements();
  }, [userId]);

  const fetchActiveAchievements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/achievements/active', {
        headers: { 'x-user-id': userId },
      });

      if (res.ok) {
        const data = await res.json();
        setActiveAchievements(data.activeAchievements || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching active achievements:', error);
      toast.error('Error al cargar los logros');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAchievement = async (achievementId: string) => {
    try {
      setCompleting(achievementId);
      const res = await fetch('/api/achievements/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ achievementId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || '¡Logro completado!');

        if (data.unlockedNext) {
          toast.success('🎉 ' + data.unlockedNext.message, { duration: 5000 });
        }

        // Refresh achievements
        await fetchActiveAchievements();
      } else {
        toast.error(data.error || 'Error al completar el logro');
      }
    } catch (error) {
      console.error('Error completing achievement:', error);
      toast.error('Error al completar el logro');
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-slate-600 mt-3">Cargando logros...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Logros Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">{stats?.completed || 0}</span>
              <span className="text-slate-500">/ {stats?.total || 0}</span>
            </div>
            <Progress
              value={stats?.completionPercentage || 0}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Cadenas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <LinkIcon className="w-5 h-5 text-blue-500" />
              <span className="text-3xl font-bold text-blue-600">
                {activeAchievements.filter(a => a.isActive).length}
              </span>
              <span className="text-slate-500">/ {stats?.chainsCount || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Progreso Global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats?.completionPercentage || 0}%
            </div>
            <Progress
              value={stats?.completionPercentage || 0}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Active Achievements Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Cadenas de Logros Activas
              </CardTitle>
              <CardDescription>
                Completa logros manualmente para desbloquear el siguiente nivel
              </CardDescription>
            </div>
            <Button onClick={fetchActiveAchievements} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Active Achievements Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeAchievements.length > 0 ? (
          activeAchievements.map((activeAch) => {
            const achievement = activeAch.achievement;
            const rarityConfig = RARITY_CONFIG[achievement.rarity as keyof typeof RARITY_CONFIG];
            const IconComponent = rarityConfig?.icon || Trophy;
            const isCompleted = activeAch.userAchievement?.completed || false;
            const chainCompleted = activeAch.chainCompleted || false;

            return (
              <Card
                key={achievement.id}
                className={`transition-all ${
                  chainCompleted
                    ? `bg-gradient-to-br ${rarityConfig?.bgGradient} border-2 border-green-400`
                    : isCompleted
                    ? `bg-gradient-to-br ${rarityConfig?.bgGradient} opacity-75`
                    : `bg-gradient-to-br ${rarityConfig?.bgGradient} hover:shadow-lg`
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {chainCompleted ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-slate-400" />
                        ) : (
                          <IconComponent className="w-6 h-6 text-amber-500" />
                        )}
                        <Badge className={rarityConfig?.color} variant="outline">
                          Level {achievement.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{achievement.name}</CardTitle>
                      <p className="text-xs text-slate-500 mt-1">{activeAch.chainName}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">
                    {achievement.description}
                  </p>

                  {/* Target */}
                  {achievement.target && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Target className="w-4 h-4" />
                      <span>
                        Objetivo: {achievement.target} {achievement.unit}
                      </span>
                    </div>
                  )}

                  {/* Rewards */}
                  <div className="flex items-center gap-2 py-2 border-t">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-amber-600">
                      +{achievement.points} XP
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-medium text-amber-600">
                      +{Math.floor(achievement.points / 10)} Coins
                    </span>
                  </div>

                  {/* Action Button */}
                  {chainCompleted ? (
                    <div className="flex items-center justify-center p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-700">
                        ¡Cadena Completada!
                      </span>
                    </div>
                  ) : isCompleted ? (
                    <div className="flex items-center justify-center p-3 bg-slate-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-slate-400 mr-2" />
                      <span className="text-slate-500">Completado</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleCompleteAchievement(achievement.id)}
                      disabled={completing === achievement.id}
                      className="w-full"
                      size="lg"
                    >
                      {completing === achievement.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Completando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marcar como Completado
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <Trophy className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">
              No hay logros activos disponibles
            </p>
            <Button onClick={fetchActiveAchievements} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
