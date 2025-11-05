'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Award, Target, Clock, Calendar, Zap, Coins } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: {
    type: string;
    count?: number;
    branch?: string;
    level?: number;
  };
  rewards: {
    xp: number;
    coins: number;
  };
  icon: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  unlockedAt?: string;
  resetType?: string;
}

interface AchievementStats {
  total: number;
  unlocked: number;
  completed: number;
  completionRate: number;
}

interface AchievementPanelProps {
  userId?: string;
}

const categoryIcons = {
  skillMaster: Trophy,
  branchMaster: Star,
  levelAchievements: Award,
  dailyMissions: Target,
};

const categoryNames = {
  skillMaster: 'Maestro de Habilidades',
  branchMaster: 'Maestro de Ramas',
  levelAchievements: 'Logros de Nivel',
  dailyMissions: 'Misiones Diarias',
};

export default function AchievementPanel({ userId }: AchievementPanelProps) {
  const [achievements, setAchievements] = useState<{
    skillMaster: Achievement[];
    branchMaster: Achievement[];
    levelAchievements: Achievement[];
    dailyMissions: Achievement[];
  }>({
    skillMaster: [],
    branchMaster: [],
    levelAchievements: [],
    dailyMissions: [],
  });
  const [stats, setStats] = useState<AchievementStats>({
    total: 0,
    unlocked: 0,
    completed: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (userId) {
      fetchAchievements();
    }
  }, [userId]);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/user/achievements');
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewAchievements = async () => {
    try {
      const response = await fetch('/api/user/achievements', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.newlyUnlocked.length > 0) {
          // Show notification or toast for new achievements
          console.log('New achievements unlocked:', data.newlyUnlocked);
          fetchAchievements(); // Refresh the list
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const getAllAchievements = () => {
    return [
      ...achievements.skillMaster,
      ...achievements.branchMaster,
      ...achievements.levelAchievements,
      ...achievements.dailyMissions,
    ];
  };

  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') {
      return getAllAchievements();
    }
    return achievements[selectedCategory as keyof typeof achievements] || [];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div>
                <h2 className="text-2xl font-bold">Logros y Misiones</h2>
                <p className="text-gray-600">
                  {stats.unlocked} de {stats.total} logros desbloqueados
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-600">
                {Math.round(stats.completionRate)}%
              </div>
              <p className="text-sm text-gray-600">Completado</p>
              <div className="w-32 mt-2">
                <Progress value={stats.completionRate} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          Todos los Logros
        </Button>
        {Object.entries(categoryNames).map(([key, name]) => {
          const IconComponent = categoryIcons[key as keyof typeof categoryIcons];
          return (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className="flex items-center gap-2"
            >
              <IconComponent className="h-4 w-4" />
              {name}
            </Button>
          );
        })}
      </div>

      {/* Check for New Achievements Button */}
      <div className="flex justify-center">
        <Button
          onClick={checkForNewAchievements}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Target className="h-4 w-4" />
          Verificar Nuevos Logros
        </Button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredAchievements().map((achievement) => (
          <Card
            key={achievement.id}
            className={`relative transition-all duration-200 hover:shadow-lg ${
              achievement.isUnlocked
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 ring-2 ring-yellow-400'
                : achievement.isCompleted
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                : 'bg-gray-50 border-gray-200 opacity-75'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      {achievement.title}
                      {achievement.isUnlocked && (
                        <Trophy className="h-4 w-4 text-yellow-600" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Requirement */}
              <div className="text-sm">
                <span className="font-medium text-gray-700">Requisito: </span>
                <span className="text-gray-600">
                  {achievement.requirement.type === 'skills_completed' && 
                    `Completa ${achievement.requirement.count} habilidades`}
                  {achievement.requirement.type === 'branch_completed' && 
                    `Completa todas las habilidades de ${achievement.requirement.branch}`}
                  {achievement.requirement.type === 'level_reached' && 
                    `Alcanza el nivel ${achievement.requirement.level}`}
                  {achievement.requirement.type === 'daily_skills' && 
                    `Completa ${achievement.requirement.count} habilidad(es) hoy`}
                  {achievement.requirement.type === 'weekly_skills' && 
                    `Completa ${achievement.requirement.count} habilidades esta semana`}
                </span>
              </div>

              {/* Rewards */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">+{achievement.rewards.xp} XP</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">+{achievement.rewards.coins}</span>
                </div>
              </div>

              {/* Status */}
              <div className="pt-2">
                {achievement.isUnlocked ? (
                  <div className="flex items-center justify-between">
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      ¡Desbloqueado!
                    </Badge>
                    {achievement.unlockedAt && (
                      <span className="text-xs text-gray-500">
                        {formatDate(achievement.unlockedAt)}
                      </span>
                    )}
                  </div>
                ) : achievement.isCompleted ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Completado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-600">
                    Bloqueado
                  </Badge>
                )}
              </div>

              {/* Reset Type for Missions */}
              {achievement.resetType && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {achievement.resetType === 'daily' ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <Calendar className="h-3 w-3" />
                  )}
                  <span>
                    Se reinicia {achievement.resetType === 'daily' ? 'diariamente' : 'semanalmente'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {getFilteredAchievements().length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron logros en esta categoría.
        </div>
      )}
    </div>
  );
}