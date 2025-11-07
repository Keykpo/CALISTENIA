'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Zap,
  Award,
  Flame,
  Target,
  Calendar,
  Activity,
  RefreshCw
} from 'lucide-react';
import HexagonRadar from '../HexagonRadar';

interface DashboardOverviewProps {
  userData: any;
  onRefresh: () => void;
}

export default function DashboardOverview({ userData, onRefresh }: DashboardOverviewProps) {
  const stats = userData?.stats || {
    totalXP: 0,
    level: 1,
    coins: 0,
    dailyStreak: 0,
    totalStrength: 0
  };

  const missions = userData?.missionsToday || [];
  const completedMissions = missions.filter((m: any) => m.completed).length;
  const totalMissions = missions.length;
  const missionProgress = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

  // Calculate XP progress to next level
  const currentLevelXP = (stats.level - 1) * 100;
  const nextLevelXP = stats.level * 100;
  const xpInCurrentLevel = stats.totalXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const levelProgress = (xpInCurrentLevel / xpNeededForLevel) * 100;

  // Hexagon data
  const hexagonData = userData?.hexagon || {
    relativeStrength: 0,
    muscularEndurance: 0,
    balanceControl: 0,
    jointMobility: 0,
    bodyTension: 0,
    skillTechnique: 0
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Level Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Zap className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.level}</div>
            <div className="mt-3">
              <Progress value={levelProgress} className="h-2 bg-blue-300" />
              <p className="text-xs mt-1 opacity-90">
                {xpInCurrentLevel} / {xpNeededForLevel} XP
              </p>
            </div>
          </CardContent>
        </Card>

        {/* XP Card */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Experiencia</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalXP}</div>
            <p className="text-xs mt-1 opacity-90">
              +{Math.floor(xpInCurrentLevel / 10) || 0} hoy
            </p>
          </CardContent>
        </Card>

        {/* Coins Card */}
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monedas</CardTitle>
            <Award className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.coins}</div>
            <p className="text-xs mt-1 opacity-90">
              Canjea en la tienda
            </p>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Racha Diaria</CardTitle>
            <Flame className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.dailyStreak}</div>
            <p className="text-xs mt-1 opacity-90">
              {stats.dailyStreak > 0 ? '¡Sigue así!' : 'Completa misiones hoy'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hexagon Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Perfil de Habilidades</CardTitle>
                <CardDescription>
                  Tu hexágono se actualiza al completar misiones
                </CardDescription>
              </div>
              <Activity className="h-5 w-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <HexagonRadar values={hexagonData} size={300} />
            </div>
          </CardContent>
        </Card>

        {/* Daily Missions Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Misiones de Hoy</CardTitle>
                <CardDescription>
                  Completa todas para aumentar tu racha
                </CardDescription>
              </div>
              <Target className="h-5 w-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">
                  {completedMissions} de {totalMissions} completadas
                </span>
                <span className="font-medium text-blue-600">
                  {Math.round(missionProgress)}%
                </span>
              </div>
              <Progress value={missionProgress} className="h-3" />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {missions.length > 0 ? (
                missions.map((mission: any) => (
                  <div
                    key={mission.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      mission.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          mission.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-slate-300'
                        }`}
                      >
                        {mission.completed && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span className={mission.completed ? 'line-through text-slate-500' : ''}>
                        {mission.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-purple-600 font-medium">
                        +{mission.rewardXP} XP
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No hay misiones disponibles</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={onRefresh}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Progreso Semanal</CardTitle>
              <CardDescription>
                Tu actividad en los últimos 7 días
              </CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-slate-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
              const activity = Math.random() > 0.5; // TODO: Replace with real data

              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-full aspect-square rounded-lg ${
                      activity ? 'bg-green-500' : 'bg-slate-200'
                    }`}
                  />
                  <span className="text-xs text-slate-600 capitalize">
                    {dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
