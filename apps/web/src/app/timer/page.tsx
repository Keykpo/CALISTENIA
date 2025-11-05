'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkoutTimer from '@/components/timer/WorkoutTimer';
import RestTimer from '@/components/timer/RestTimer';
import IntervalTimer from '@/components/timer/IntervalTimer';
import { Timer, Zap, Coffee, Target } from 'lucide-react';

// Sample data for demonstration
const sampleExercises = [
  {
    id: '1',
    name: 'Flexiones',
    duration: 1, // 1 minute for demo
    description: 'Flexiones de pecho tradicionales',
    instructions: [
      'Colócate en posición de plancha',
      'Baja el pecho hasta casi tocar el suelo',
      'Empuja hacia arriba hasta la posición inicial',
      'Mantén el core activado durante todo el movimiento'
    ]
  },
  {
    id: '2',
    name: 'Sentadillas',
    duration: 1, // 1 minute for demo
    description: 'Sentadillas con peso corporal',
    instructions: [
      'Párate con los pies separados al ancho de los hombros',
      'Baja como si fueras a sentarte en una silla',
      'Mantén el pecho erguido y las rodillas alineadas',
      'Regresa a la posición inicial'
    ]
  },
  {
    id: '3',
    name: 'Plancha',
    duration: 1, // 1 minute for demo
    description: 'Plancha isométrica para core',
    instructions: [
      'Colócate en posición de plancha sobre los antebrazos',
      'Mantén el cuerpo en línea recta',
      'Activa el core y los glúteos',
      'Respira de manera controlada'
    ]
  }
];

export default function TimerPage() {
  const { data: session, status } = useSession();
  const [activeTimer, setActiveTimer] = useState<string | null>(null);

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sistema de Temporizadores</h1>
        <p className="text-muted-foreground">
          Herramientas de cronometraje para tus entrenamientos de calistenia
        </p>
      </div>

      <Tabs defaultValue="workout" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workout" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Entrenamiento
          </TabsTrigger>
          <TabsTrigger value="rest" className="flex items-center gap-2">
            <Coffee className="h-4 w-4" />
            Descanso
          </TabsTrigger>
          <TabsTrigger value="interval" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Intervalos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Temporizador de Entrenamiento
              </CardTitle>
              <CardDescription>
                Cronometra cada ejercicio de tu rutina con transiciones automáticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {sampleExercises.map((exercise, index) => (
                    <Badge key={exercise.id} variant="outline">
                      {index + 1}. {exercise.name} ({exercise.duration}min)
                    </Badge>
                  ))}
                </div>
                
                <WorkoutTimer
                  exercises={sampleExercises}
                  onComplete={() => {
                    console.log('Workout completed!');
                    setActiveTimer(null);
                  }}
                  onStop={() => {
                    console.log('Workout stopped!');
                    setActiveTimer(null);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rest" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="h-5 w-5" />
                Temporizador de Descanso
              </CardTitle>
              <CardDescription>
                Controla tus períodos de descanso entre ejercicios o series
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold">Características:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Tiempos preestablecidos (30s, 60s, 90s, 120s)</li>
                    <li>• Ajuste manual de duración</li>
                    <li>• Modificación durante el descanso</li>
                    <li>• Opción de saltar descanso</li>
                  </ul>
                </div>
                
                <RestTimer
                  initialDuration={60}
                  nextExerciseName="Sentadillas"
                  onComplete={() => {
                    console.log('Rest completed!');
                  }}
                  onSkip={() => {
                    console.log('Rest skipped!');
                  }}
                  onStop={() => {
                    console.log('Rest stopped!');
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interval" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Temporizador de Intervalos
              </CardTitle>
              <CardDescription>
                Entrenamientos HIIT con períodos de trabajo y descanso alternados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Zap className="h-5 w-5 text-red-600" />
                      <span className="font-semibold text-red-800">Trabajo</span>
                    </div>
                    <p className="text-2xl font-mono text-red-600">00:45</p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Coffee className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Descanso</span>
                    </div>
                    <p className="text-2xl font-mono text-blue-600">00:15</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Rondas</span>
                    </div>
                    <p className="text-2xl font-mono text-green-600">8</p>
                  </div>
                </div>
                
                <IntervalTimer
                  workDuration={45}
                  restDuration={15}
                  rounds={8}
                  exerciseName="Burpees HIIT"
                  onComplete={() => {
                    console.log('Interval workout completed!');
                  }}
                  onStop={() => {
                    console.log('Interval workout stopped!');
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>💡 Consejos de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-semibold mb-2">Temporizador de Entrenamiento</h4>
              <p className="text-sm text-muted-foreground">
                Ideal para rutinas estructuradas donde cada ejercicio tiene una duración específica.
                Perfecto para principiantes que necesitan guía temporal.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Temporizador de Descanso</h4>
              <p className="text-sm text-muted-foreground">
                Úsalo entre series o ejercicios para mantener descansos consistentes.
                Ajusta según tu nivel de fatiga y objetivos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Temporizador de Intervalos</h4>
              <p className="text-sm text-muted-foreground">
                Perfecto para entrenamientos HIIT, Tabata o cualquier rutina que alterne
                intensidad alta y baja.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}