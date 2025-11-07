'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Award,
  Star,
  Crown,
  Sparkles,
  Lock,
  RefreshCw,
  Target
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
  iconUrl?: string;
  isUnlocked?: boolean;
  progress?: number;
  unlockedAt?: string;
}

interface AchievementsViewProps {
  userId: string;
}

const RARITY_CONFIG = {
  COMMON: {
    color: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: Star,
    bgGradient: 'from-slate-50 to-slate-100',
  },
  UNCOMMON: {
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: Award,
    bgGradient: 'from-green-50 to-green-100',
  },
  RARE: {
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: Trophy,
    bgGradient: 'from-blue-50 to-blue-100',
  },
  EPIC: {
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

const TYPE_NAMES = {
  EXERCISE_MASTERY: 'Maestría de Ejercicios',
  WORKOUT_COUNT: 'Entrenamientos',
  STREAK: 'Rachas',
  PROGRESS_MILESTONE: 'Hitos de Progreso',
  COURSE_COMPLETION: 'Cursos',
  COMMUNITY_ENGAGEMENT: 'Comunidad',
  SPECIAL_EVENT: 'Eventos Especiales',
};

export default function AchievementsView({ userId }: AchievementsViewProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/achievements', {
        headers: { 'x-user-id': userId },
      });

      if (res.ok) {
        const data = await res.json();
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter achievements
  const filteredAchievements = achievements.filter(a => {
    if (filter === 'UNLOCKED') return a.isUnlocked;
    if (filter === 'LOCKED') return !a.isUnlocked;
    return true;
  });

  // Calculate stats
  const totalAchievements = achievements.length;
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalPoints = achievements
    .filter(a => a.isUnlocked)
    .reduce((sum, a) => sum + a.points, 0);
  const maxPoints = achievements.reduce((sum, a) => sum + a.points, 0);

  // Group by type
  const achievementsByType = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.type]) acc[achievement.type] = [];
    acc[achievement.type].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

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
              Logros Desbloqueados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">{unlockedCount}</span>
              <span className="text-slate-500">/ {totalAchievements}</span>
            </div>
            <Progress
              value={(unlockedCount / totalAchievements) * 100}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Puntos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-3xl font-bold text-amber-600">{totalPoints}</span>
              <span className="text-slate-500">/ {maxPoints}</span>
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
              {Math.round((unlockedCount / totalAchievements) * 100)}%
            </div>
            <Progress
              value={(unlockedCount / totalAchievements) * 100}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Tus Logros
              </CardTitle>
              <CardDescription>
                Desbloquea logros completando desafíos
              </CardDescription>
            </div>
            <Button onClick={fetchAchievements} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={filter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('ALL')}
            >
              Todos ({totalAchievements})
            </Button>
            <Button
              variant={filter === 'UNLOCKED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('UNLOCKED')}
            >
              Desbloqueados ({unlockedCount})
            </Button>
            <Button
              variant={filter === 'LOCKED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('LOCKED')}
            >
              Bloqueados ({totalAchievements - unlockedCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAchievements.length > 0 ? (
          filteredAchievements.map((achievement) => {
            const rarityConfig = RARITY_CONFIG[achievement.rarity as keyof typeof RARITY_CONFIG];
            const IconComponent = rarityConfig?.icon || Trophy;

            return (
              <Card
                key={achievement.id}
                className={`transition-all ${
                  achievement.isUnlocked
                    ? `bg-gradient-to-br ${rarityConfig?.bgGradient} hover:shadow-lg`
                    : 'opacity-60'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {achievement.isUnlocked ? (
                        <IconComponent className="w-6 h-6 text-amber-500" />
                      ) : (
                        <Lock className="w-6 h-6 text-slate-400" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{achievement.name}</CardTitle>
                      </div>
                    </div>
                    <Badge className={rarityConfig?.color}>
                      {achievement.rarity}
                    </Badge>
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

                  {/* Progress */}
                  {!achievement.isUnlocked && achievement.progress !== undefined && achievement.target && (
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>
                          {achievement.progress} / {achievement.target}
                        </span>
                        <span>
                          {Math.round((achievement.progress / achievement.target) * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={(achievement.progress / achievement.target) * 100}
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Points */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-amber-600">
                        {achievement.points} puntos
                      </span>
                    </div>

                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <span className="text-xs text-slate-500">
                        {new Date(achievement.unlockedAt).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <Trophy className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">
              {filter === 'UNLOCKED'
                ? 'Aún no has desbloqueado ningún logro'
                : filter === 'LOCKED'
                ? 'No hay logros bloqueados'
                : 'No hay logros disponibles'}
            </p>
            <Button onClick={fetchAchievements} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
