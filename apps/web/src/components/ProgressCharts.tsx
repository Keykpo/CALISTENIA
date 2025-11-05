'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Zap, 
  Award, 
  BarChart3, 
  PieChart, 
  Activity,
  Clock,
  Flame
} from 'lucide-react';

interface ProgressData {
  date: string;
  xp: number;
  skillsCompleted: number;
  strength: number;
  streak: number;
}

interface BranchStats {
  branch: string;
  name: string;
  icon: string;
  color: string;
  completed: number;
  total: number;
  averageTime: number;
  strengthGained: number;
  xpEarned: number;
}

interface ProgressChartsProps {
  userId?: string;
  progressData: ProgressData[];
  branchStats: BranchStats[];
  totalStats: {
    totalXP: number;
    totalSkills: number;
    currentStreak: number;
    maxStreak: number;
    averageSessionTime: number;
    totalTrainingDays: number;
  };
}

export default function ProgressCharts({ 
  userId, 
  progressData, 
  branchStats, 
  totalStats 
}: ProgressChartsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeChart, setActiveChart] = useState<'xp' | 'skills' | 'strength'>('xp');

  const filterDataByTimeRange = (data: ProgressData[]) => {
    const now = new Date();
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : selectedTimeRange === '90d' ? 90 : 365;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return data.filter(item => new Date(item.date) >= cutoffDate);
  };

  const getChartData = () => {
    const filteredData = filterDataByTimeRange(progressData);
    return filteredData.map((item, index) => ({
      ...item,
      x: index,
      label: new Date(item.date).toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      }),
    }));
  };

  const calculateTrend = (data: ProgressData[], field: keyof ProgressData) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-7);
    const older = data.slice(-14, -7);
    
    const recentAvg = recent.reduce((sum, item) => sum + (item[field] as number), 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + (item[field] as number), 0) / older.length;
    
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  };

  const SimpleLineChart = ({ data, field, color }: { data: any[], field: string, color: string }) => {
    const maxValue = Math.max(...data.map(d => d[field]));
    const minValue = Math.min(...data.map(d => d[field]));
    const range = maxValue - minValue || 1;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d[field] - minValue) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative h-32 w-full">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${field}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.1 }} />
            </linearGradient>
          </defs>
          
          {/* Area under curve */}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill={`url(#gradient-${field})`}
          />
          
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d[field] - minValue) / range) * 100;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="0.8"
                fill={color}
                className="drop-shadow-sm"
              />
            );
          })}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
          <span>{maxValue}</span>
          <span>{Math.round((maxValue + minValue) / 2)}</span>
          <span>{minValue}</span>
        </div>
      </div>
    );
  };

  const BranchProgressChart = ({ stats }: { stats: BranchStats[] }) => {
    const maxTotal = Math.max(...stats.map(s => s.total));
    
    return (
      <div className="space-y-4">
        {stats.map((stat) => {
          const percentage = (stat.completed / stat.total) * 100;
          return (
            <div key={stat.branch} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{stat.icon}</span>
                  <span className="font-medium text-sm">{stat.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {stat.completed}/{stat.total}
                </div>
              </div>
              
              <div className="relative">
                <Progress value={percentage} className="h-3" />
                <div 
                  className="absolute top-0 left-0 h-3 rounded-full opacity-20"
                  style={{ 
                    backgroundColor: stat.color,
                    width: `${percentage}%`
                  }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Fuerza: +{stat.strengthGained}</span>
                <span>XP: {stat.xpEarned}</span>
                <span>Tiempo promedio: {stat.averageTime}d</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    color = 'text-blue-600' 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    trend?: number;
    color?: string;
  }) => (
    <Card className="stat-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-2 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
        
        {trend !== undefined && (
          <div className="mt-2 flex items-center">
            <TrendingUp className={`w-4 h-4 mr-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% vs semana anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const chartData = getChartData();
  const xpTrend = calculateTrend(progressData, 'xp');
  const skillsTrend = calculateTrend(progressData, 'skillsCompleted');
  const strengthTrend = calculateTrend(progressData, 'strength');

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="XP Total"
          value={totalStats.totalXP.toLocaleString()}
          icon={Zap}
          trend={xpTrend}
          color="text-blue-600"
        />
        <StatCard
          title="Habilidades Completadas"
          value={totalStats.totalSkills}
          icon={Target}
          trend={skillsTrend}
          color="text-green-600"
        />
        <StatCard
          title="Racha Actual"
          value={totalStats.currentStreak}
          subtitle={`Máxima: ${totalStats.maxStreak} días`}
          icon={Flame}
          color="text-orange-600"
        />
        <StatCard
          title="Días de Entrenamiento"
          value={totalStats.totalTrainingDays}
          subtitle={`Promedio: ${totalStats.averageSessionTime}min/sesión`}
          icon={Calendar}
          color="text-purple-600"
        />
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">Progreso Temporal</TabsTrigger>
          <TabsTrigger value="branches">Progreso por Rama</TabsTrigger>
          <TabsTrigger value="analysis">Análisis Detallado</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Progreso en el Tiempo</span>
                </CardTitle>
                
                <div className="flex space-x-2">
                  {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                    <Button
                      key={range}
                      variant={selectedTimeRange === range ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimeRange(range)}
                    >
                      {range === 'all' ? 'Todo' : range}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  {(['xp', 'skills', 'strength'] as const).map((chart) => (
                    <Button
                      key={chart}
                      variant={activeChart === chart ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveChart(chart)}
                    >
                      {chart === 'xp' ? 'XP' : chart === 'skills' ? 'Habilidades' : 'Fuerza'}
                    </Button>
                  ))}
                </div>
                
                <div className="pl-8">
                  <SimpleLineChart
                    data={chartData}
                    field={activeChart}
                    color={
                      activeChart === 'xp' ? '#3b82f6' :
                      activeChart === 'skills' ? '#10b981' : '#f59e0b'
                    }
                  />
                </div>
                
                <div className="flex justify-between text-sm text-gray-500 pl-8">
                  {chartData.length > 0 && (
                    <>
                      <span>{chartData[0].label}</span>
                      <span>{chartData[chartData.length - 1].label}</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5" />
                <span>Progreso por Rama</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BranchProgressChart stats={branchStats} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Análisis de Rendimiento</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Consistencia de entrenamiento</span>
                    <Badge variant="outline">
                      {totalStats.currentStreak > 7 ? 'Excelente' : 
                       totalStats.currentStreak > 3 ? 'Buena' : 'Mejorable'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Velocidad de progreso</span>
                    <Badge variant="outline">
                      {skillsTrend > 10 ? 'Rápida' : 
                       skillsTrend > 0 ? 'Moderada' : 'Lenta'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ganancia de fuerza</span>
                    <Badge variant="outline">
                      {strengthTrend > 5 ? 'Alta' : 
                       strengthTrend > 0 ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Estadísticas de Tiempo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tiempo promedio por habilidad</span>
                    <span className="font-medium">
                      {branchStats.reduce((sum, s) => sum + s.averageTime, 0) / branchStats.length || 0} días
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rama más rápida</span>
                    <span className="font-medium">
                      {branchStats.reduce((min, s) => s.averageTime < min.averageTime ? s : min, branchStats[0])?.name || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Eficiencia XP/día</span>
                    <span className="font-medium">
                      {Math.round(totalStats.totalXP / Math.max(totalStats.totalTrainingDays, 1))} XP/día
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <style jsx>{`
        .stat-card {
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}