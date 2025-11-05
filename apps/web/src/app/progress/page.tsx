'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Trophy, 
  Activity,
  Clock,
  Flame,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Award,
  Star,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface WorkoutStats {
  totalWorkouts: number;
  totalMinutes: number;
  totalCalories: number;
  currentStreak: number;
  longestStreak: number;
  averageWorkoutTime: number;
  favoriteCategory: string;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface ProgressData {
  date: string;
  workouts: number;
  minutes: number;
  calories: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'workouts' | 'time' | 'streak' | 'skills';
}

interface SkillProgress {
  skill: string;
  level: number;
  maxLevel: number;
  progress: number;
  category: string;
}

// Sample data
const sampleStats: WorkoutStats = {
  totalWorkouts: 127,
  totalMinutes: 3840,
  totalCalories: 15680,
  currentStreak: 12,
  longestStreak: 28,
  averageWorkoutTime: 30,
  favoriteCategory: 'Fuerza Superior',
  weeklyGoal: 5,
  weeklyProgress: 3
};

const sampleProgressData: ProgressData[] = [
  { date: '2024-01-01', workouts: 4, minutes: 120, calories: 480 },
  { date: '2024-01-08', workouts: 5, minutes: 150, calories: 600 },
  { date: '2024-01-15', workouts: 3, minutes: 90, calories: 360 },
  { date: '2024-01-22', workouts: 6, minutes: 180, calories: 720 },
  { date: '2024-01-29', workouts: 4, minutes: 120, calories: 480 },
  { date: '2024-02-05', workouts: 5, minutes: 150, calories: 600 },
  { date: '2024-02-12', workouts: 7, minutes: 210, calories: 840 },
  { date: '2024-02-19', workouts: 4, minutes: 120, calories: 480 },
  { date: '2024-02-26', workouts: 5, minutes: 150, calories: 600 },
  { date: '2024-03-05', workouts: 6, minutes: 180, calories: 720 },
  { date: '2024-03-12', workouts: 3, minutes: 90, calories: 360 },
  { date: '2024-03-19', workouts: 5, minutes: 150, calories: 600 }
];

const sampleAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Primera Semana',
    description: 'Completa tu primera semana de entrenamientos',
    icon: '🎯',
    unlockedAt: '2024-01-07',
    category: 'workouts'
  },
  {
    id: '2',
    title: 'Racha de Fuego',
    description: 'Entrena 7 días consecutivos',
    icon: '🔥',
    unlockedAt: '2024-01-14',
    category: 'streak'
  },
  {
    id: '3',
    title: 'Centurión',
    description: 'Completa 100 entrenamientos',
    icon: '💯',
    unlockedAt: '2024-02-28',
    category: 'workouts'
  },
  {
    id: '4',
    title: 'Maratonista',
    description: 'Acumula 50 horas de entrenamiento',
    icon: '⏰',
    unlockedAt: '2024-03-10',
    category: 'time'
  },
  {
    id: '5',
    title: 'Maestro de Flexiones',
    description: 'Domina las flexiones avanzadas',
    icon: '💪',
    unlockedAt: '2024-03-15',
    category: 'skills'
  }
];

const sampleSkills: SkillProgress[] = [
  { skill: 'Flexiones', level: 8, maxLevel: 10, progress: 80, category: 'Fuerza Superior' },
  { skill: 'Dominadas', level: 6, maxLevel: 10, progress: 60, category: 'Fuerza Superior' },
  { skill: 'Sentadillas', level: 9, maxLevel: 10, progress: 90, category: 'Fuerza Inferior' },
  { skill: 'Plancha', level: 7, maxLevel: 10, progress: 70, category: 'Core' },
  { skill: 'Handstand', level: 3, maxLevel: 10, progress: 30, category: 'Equilibrio' },
  { skill: 'Muscle-up', level: 2, maxLevel: 10, progress: 20, category: 'Fuerza Combinada' }
];

export default function ProgressPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<WorkoutStats>(sampleStats);
  const [progressData, setProgressData] = useState<ProgressData[]>(sampleProgressData);
  const [achievements, setAchievements] = useState<Achievement[]>(sampleAchievements);
  const [skills, setSkills] = useState<SkillProgress[]>(sampleSkills);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando progreso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect('/auth/signin');
  }

  const getChangeIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    } else if (current < previous) {
      return <ArrowDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workouts': return <Target className="h-5 w-5" />;
      case 'time': return <Clock className="h-5 w-5" />;
      case 'streak': return <Flame className="h-5 w-5" />;
      case 'skills': return <Zap className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mi Progreso</h1>
        <p className="text-muted-foreground">
          Seguimiento detallado de tu evolución en calistenia
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entrenamientos</p>
                <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  {getChangeIndicator(stats.totalWorkouts, 120)}
                  <span>+7 esta semana</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiempo Total</p>
                <p className="text-2xl font-bold">{Math.round(stats.totalMinutes / 60)}h</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  {getChangeIndicator(stats.totalMinutes, 3600)}
                  <span>+4h esta semana</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Calorías</p>
                <p className="text-2xl font-bold">{stats.totalCalories.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  {getChangeIndicator(stats.totalCalories, 15000)}
                  <span>+680 esta semana</span>
                </div>
              </div>
              <Flame className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Racha Actual</p>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  <span>Máx: {stats.longestStreak} días</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goal Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Meta Semanal
          </CardTitle>
          <CardDescription>
            Progreso hacia tu objetivo de {stats.weeklyGoal} entrenamientos por semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {stats.weeklyProgress} de {stats.weeklyGoal} entrenamientos
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}%
              </span>
            </div>
            <Progress value={(stats.weeklyProgress / stats.weeklyGoal) * 100} />
            <p className="text-sm text-muted-foreground">
              {stats.weeklyGoal - stats.weeklyProgress > 0 
                ? `Te faltan ${stats.weeklyGoal - stats.weeklyProgress} entrenamientos para completar tu meta`
                : '¡Felicidades! Has completado tu meta semanal'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="skills">Habilidades</TabsTrigger>
          <TabsTrigger value="achievements">Logros</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Tus últimos entrenamientos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { date: 'Hoy', workout: 'Fuerza Superior', duration: 35, calories: 280 },
                    { date: 'Ayer', workout: 'Core Intensivo', duration: 25, calories: 200 },
                    { date: '2 días', workout: 'Piernas y Glúteos', duration: 40, calories: 320 },
                    { date: '3 días', workout: 'Flexibilidad', duration: 20, calories: 120 },
                    { date: '4 días', workout: 'HIIT Calistenia', duration: 30, calories: 300 }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{activity.workout}</p>
                          <p className="text-sm text-muted-foreground">{activity.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{activity.duration}min</p>
                        <p className="text-sm text-muted-foreground">{activity.calories} cal</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personal Records */}
            <Card>
              <CardHeader>
                <CardTitle>Récords Personales</CardTitle>
                <CardDescription>Tus mejores marcas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { exercise: 'Flexiones consecutivas', record: '45', date: '15 Mar 2024' },
                    { exercise: 'Plancha (tiempo)', record: '2:30', date: '12 Mar 2024' },
                    { exercise: 'Dominadas consecutivas', record: '12', date: '10 Mar 2024' },
                    { exercise: 'Sentadillas consecutivas', record: '100', date: '8 Mar 2024' },
                    { exercise: 'Entrenamiento más largo', record: '65min', date: '5 Mar 2024' }
                  ].map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{record.exercise}</p>
                        <p className="text-sm text-muted-foreground">{record.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{record.record}</p>
                        <Trophy className="h-4 w-4 text-yellow-500 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="mt-6">
          <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('week')}
              >
                Semana
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('month')}
              >
                Mes
              </Button>
              <Button
                variant={selectedPeriod === 'year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('year')}
              >
                Año
              </Button>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workouts Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Entrenamientos por Semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2 p-4">
                    {progressData.slice(-8).map((data, index) => (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <div 
                          className="bg-blue-500 rounded-t-sm min-w-[20px] transition-all hover:bg-blue-600"
                          style={{ height: `${(data.workouts / 7) * 200}px` }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {new Date(data.date).toLocaleDateString('es', { day: '2-digit', month: '2-digit' })}
                        </span>
                        <span className="text-xs font-medium">{data.workouts}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Calories Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Calorías Quemadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2 p-4">
                    {progressData.slice(-8).map((data, index) => (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <div 
                          className="bg-orange-500 rounded-t-sm min-w-[20px] transition-all hover:bg-orange-600"
                          style={{ height: `${(data.calories / 1000) * 200}px` }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {new Date(data.date).toLocaleDateString('es', { day: '2-digit', month: '2-digit' })}
                        </span>
                        <span className="text-xs font-medium">{data.calories}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Distribución por Categoría
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { category: 'Fuerza Superior', percentage: 35, color: 'bg-blue-500' },
                      { category: 'Core', percentage: 25, color: 'bg-green-500' },
                      { category: 'Fuerza Inferior', percentage: 20, color: 'bg-yellow-500' },
                      { category: 'Cardio', percentage: 15, color: 'bg-red-500' },
                      { category: 'Flexibilidad', percentage: 5, color: 'bg-purple-500' }
                    ].map((item) => (
                      <div key={item.category} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${item.color}`} />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{item.category}</span>
                            <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Resumen Mensual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-blue-600">23</p>
                        <p className="text-sm text-muted-foreground">Entrenamientos</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-green-600">12h</p>
                        <p className="text-sm text-muted-foreground">Tiempo total</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-orange-600">2,840</p>
                        <p className="text-sm text-muted-foreground">Calorías</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-purple-600">31min</p>
                        <p className="text-sm text-muted-foreground">Promedio</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.map((skill) => (
              <Card key={skill.skill}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{skill.skill}</CardTitle>
                    <Badge variant="outline">{skill.category}</Badge>
                  </div>
                  <CardDescription>
                    Nivel {skill.level} de {skill.maxLevel}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={skill.progress} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progreso: {skill.progress}%</span>
                      <span>
                        {skill.level < skill.maxLevel 
                          ? `${100 - skill.progress}% para siguiente nivel`
                          : 'Nivel máximo alcanzado'
                        }
                      </span>
                    </div>
                    {skill.level < skill.maxLevel && (
                      <Button variant="outline" size="sm" className="w-full">
                        Ver ejercicios para mejorar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(achievement.category)}
                        <span className="text-xs text-muted-foreground">
                          Desbloqueado el {new Date(achievement.unlockedAt).toLocaleDateString('es')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Locked Achievements */}
            {[
              { title: 'Súper Racha', description: 'Entrena 30 días consecutivos', icon: '🔥' },
              { title: 'Velocista', description: 'Completa un entrenamiento en menos de 15 minutos', icon: '⚡' },
              { title: 'Resistencia', description: 'Entrena por más de 90 minutos', icon: '🏃' }
            ].map((locked, index) => (
              <Card key={`locked-${index}`} className="relative overflow-hidden opacity-60">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl grayscale">{locked.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{locked.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {locked.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Bloqueado
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}