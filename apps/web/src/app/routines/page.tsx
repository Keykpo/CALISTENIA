'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Calendar, Clock, Target, ArrowLeft } from 'lucide-react';

type RoutineExercise = {
  name: string;
  category: string;
  sets: number;
  reps?: number;
  duration?: number;
  rest: number;
  notes?: string;
};

type WorkoutRoutine = {
  day: string;
  focus: string;
  exercises: RoutineExercise[];
  totalMinutes: number;
};

export default function RoutinesPage() {
  const isProd = process.env.NODE_ENV === 'production';
  const sessionHook = isProd ? useSession() : { data: null, status: 'unauthenticated' as const };
  const session = sessionHook.data as any;
  const searchParams = useSearchParams();
  const router = useRouter();
  const computedUserId = (session?.user?.id as string) || (searchParams?.get('userId') || 'local-dev');

  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    goal: 'balanced',
    daysPerWeek: 3,
    minutesPerSession: 45,
  });

  const generateRoutine = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/routines/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': computedUserId,
        },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.routine) {
          setRoutines(data.routine);
        }
      }
    } catch (e) {
      console.error('[Routines] Error generating routine:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRoutine();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Plan de Entrenamiento</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Configuration Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configurar Rutina</CardTitle>
            <CardDescription>Personaliza tu plan de entrenamiento semanal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Objetivo</label>
                <Select
                  value={config.goal}
                  onValueChange={(value) => setConfig({ ...config, goal: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Equilibrado</SelectItem>
                    <SelectItem value="strength">Fuerza</SelectItem>
                    <SelectItem value="endurance">Resistencia</SelectItem>
                    <SelectItem value="skill">Habilidades</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Días por semana</label>
                <Select
                  value={config.daysPerWeek.toString()}
                  onValueChange={(value) =>
                    setConfig({ ...config, daysPerWeek: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} días
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Minutos por sesión</label>
                <Select
                  value={config.minutesPerSession.toString()}
                  onValueChange={(value) =>
                    setConfig({ ...config, minutesPerSession: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="mt-4"
              onClick={generateRoutine}
              disabled={loading}
              variant="black"
            >
              <Target className="h-4 w-4 mr-2" />
              {loading ? 'Generando...' : 'Generar Nueva Rutina'}
            </Button>
          </CardContent>
        </Card>

        {/* Weekly Routine */}
        {routines.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Plan Semanal</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{routines.length} días de entrenamiento</span>
              </div>
            </div>

            {routines.map((routine, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{routine.day}</CardTitle>
                      <CardDescription>{routine.focus}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {routine.totalMinutes} min
                      </Badge>
                      <Badge variant="secondary">
                        <Dumbbell className="h-3 w-3 mr-1" />
                        {routine.exercises.length} ejercicios
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {routine.exercises.map((exercise, exIdx) => (
                      <div
                        key={exIdx}
                        className="flex items-start justify-between border-b pb-3 last:border-0"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {exercise.category}
                            {exercise.notes && ` • ${exercise.notes}`}
                          </div>
                        </div>
                        <div className="text-sm text-right ml-4">
                          <div className="font-medium">
                            {exercise.sets} sets ×{' '}
                            {exercise.reps
                              ? `${exercise.reps} reps`
                              : `${exercise.duration}s`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Descanso: {exercise.rest}s
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Dumbbell className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {loading ? 'Generando tu rutina personalizada...' : 'No hay rutinas generadas'}
            </p>
            <p className="text-sm text-gray-600">
              {loading
                ? 'Esto tomará solo unos segundos'
                : 'Haz clic en "Generar Nueva Rutina" para empezar'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
