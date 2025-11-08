'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dumbbell,
  Clock,
  Target,
  ArrowLeft,
  Flame,
  Heart,
  Loader2,
  Play,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  unit: string;
  muscleGroups: string[];
  equipment: string[];
  howTo: string;
  coachingTip?: string;
}

interface RoutineExercise {
  exercise: Exercise;
  sets: number;
  repsOrDuration: string;
  restSeconds: number;
  notes?: string;
}

interface Routine {
  name: string;
  description: string;
  goal: string;
  difficulty: string;
  durationMinutes: number;
  exercises: RoutineExercise[];
  warmupExercises: RoutineExercise[];
  cooldownExercises: RoutineExercise[];
}

interface RoutineResponse {
  success: boolean;
  routine: Routine;
  userProfile: {
    fitnessLevel: string;
    goal: string;
    weakestBranches: string[];
  };
}

export default function RoutinesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      generateRoutine();
    }
  }, [status, session, router]);

  const generateRoutine = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/routines/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session?.user?.id as string,
        },
      });

      const data: RoutineResponse = await res.json();

      if (!res.ok) {
        if (data.error === 'Debes completar la evaluación de nivel primero') {
          router.push('/onboarding/assessment');
          return;
        }
        throw new Error(data.error || 'Failed to generate routine');
      }

      if (data.success && data.routine) {
        setRoutine(data.routine);
        setUserProfile(data.userProfile);
      }
    } catch (e: any) {
      console.error('[Routines] Error generating routine:', e);
      setError(e.message || 'Failed to generate your personalized routine');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      BEGINNER: 'bg-green-100 text-green-700 border-green-300',
      INTERMEDIATE: 'bg-blue-100 text-blue-700 border-blue-300',
      ADVANCED: 'bg-purple-100 text-purple-700 border-purple-300',
      EXPERT: 'bg-amber-100 text-amber-700 border-amber-300',
    };
    return colors[difficulty] || 'bg-slate-100 text-slate-700';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CARDIO':
        return <Heart className="w-4 h-4" />;
      case 'STRENGTH':
        return <Dumbbell className="w-4 h-4" />;
      case 'CORE':
        return <Target className="w-4 h-4" />;
      default:
        return <Flame className="w-4 h-4" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-slate-600">Generating your personalized workout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={generateRoutine} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!routine) {
    return null;
  }

  const allExercises = [
    ...routine.warmupExercises,
    ...routine.exercises,
    ...routine.cooldownExercises,
  ];
  const totalExercises = allExercises.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <Button onClick={generateRoutine} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New Routine
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Routine Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Your Personalized Workout</h1>
              <p className="text-slate-600">{routine.description}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge className={`${getDifficultyColor(routine.difficulty)} border`}>
              {routine.difficulty}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {routine.durationMinutes} min
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {totalExercises} exercises
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Goal: {routine.goal.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Warmup Section */}
        {routine.warmupExercises.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="bg-orange-50">
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <Flame className="w-5 h-5" />
                Warm-Up
              </CardTitle>
              <CardDescription>Prepare your body for the workout</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {routine.warmupExercises.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryIcon(item.exercise.category)}
                          <h4 className="font-semibold text-slate-900">{item.exercise.name}</h4>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{item.exercise.description}</p>
                        {item.notes && (
                          <p className="text-xs text-slate-500 italic">{item.notes}</p>
                        )}
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="font-semibold text-sm">
                          {item.sets} × {item.repsOrDuration}
                        </div>
                        <div className="text-xs text-slate-600">
                          Rest: {item.restSeconds}s
                        </div>
                      </div>
                    </div>
                    {idx < routine.warmupExercises.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Workout Section */}
        <Card className="mb-6">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Dumbbell className="w-5 h-5" />
              Main Workout
            </CardTitle>
            <CardDescription>Your primary strength and skill exercises</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {routine.exercises.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-slate-900">{item.exercise.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.exercise.category}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {item.exercise.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-2 ml-10">{item.exercise.description}</p>
                      {item.exercise.coachingTip && (
                        <div className="ml-10 mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-xs text-amber-900">
                            <strong>💡 Tip:</strong> {item.exercise.coachingTip}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="font-bold text-lg text-blue-600">
                        {item.sets} sets
                      </div>
                      <div className="text-sm text-slate-700">
                        {item.repsOrDuration}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Rest: {item.restSeconds}s
                      </div>
                    </div>
                  </div>
                  {idx < routine.exercises.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cooldown Section */}
        {routine.cooldownExercises.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Heart className="w-5 h-5" />
                Cool Down
              </CardTitle>
              <CardDescription>Recovery and stretching</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {routine.cooldownExercises.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">{item.exercise.name}</h4>
                        <p className="text-sm text-slate-600">{item.exercise.description}</p>
                        {item.notes && (
                          <p className="text-xs text-slate-500 italic mt-1">{item.notes}</p>
                        )}
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="font-semibold text-sm">
                          {item.repsOrDuration}
                        </div>
                      </div>
                    </div>
                    {idx < routine.cooldownExercises.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="flex-1"
          >
            Save for Later
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Workout
          </Button>
        </div>
      </main>
    </div>
  );
}
