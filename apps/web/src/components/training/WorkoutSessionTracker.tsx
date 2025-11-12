'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ExerciseTimer } from './ExerciseTimer';
import { RewardNotification } from '@/components/rewards/RewardNotification';
import { TrainingGoalsDialog, type TrainingGoal } from './TrainingGoalsDialog';
import { WorkoutCompletionView } from './WorkoutCompletionView';
import { DurationSelectorButton } from './DurationSelectorButton';
import { ErrorDiagnostic } from './ErrorDiagnostic';
import { ExerciseDetailCard } from './ExerciseDetailCard';
import { findExercisesByNames, type ExerciseDetails } from '@/lib/exercise-database';
import {
  Dumbbell,
  Flame,
  Target,
  Clock,
  Trophy,
  Coins,
  CheckCircle,
  PlayCircle,
  RefreshCw
} from 'lucide-react';
import type { DailyRoutine } from '@/lib/daily-routine-generator';

interface WorkoutSession {
  id: string;
  startedAt: Date;
  routine: DailyRoutine;
  currentPhaseIndex: number;
  currentExerciseIndex: number;
  progress: {
    phases: Array<{
      phaseIndex: number;
      phase: string;
      exercises: Array<{
        exerciseIndex: number;
        exerciseId: string;
        exerciseName: string;
        completed: boolean;
        sets: number;
        completedSets: number;
        repsOrTime: number;
        actualReps: number[];
        actualTimes: number[];
      }>;
    }>;
  };
}

interface Rewards {
  totalXP: number;
  totalCoins: number;
  hexagonXP: Record<string, number>;
  baseXP?: number;
  baseCoins?: number;
  streakBonus?: number;
}

interface StreakInfo {
  current: number;
  longest: number;
  bonus: number;
  nextMilestone: {
    days: number;
    name: string;
    description: string;
    bonusPercent: number;
    icon: string;
  } | null;
}

type ViewState = 'overview' | 'active' | 'completed';

// Get difficulty badge color based on level
const getDifficultyColor = (difficulty: string): string => {
  const level = difficulty.toUpperCase();
  switch (level) {
    case 'BEGINNER':
      return 'bg-green-500 text-white hover:bg-green-600';
    case 'INTERMEDIATE':
      return 'bg-blue-500 text-white hover:bg-blue-600';
    case 'ADVANCED':
      return 'bg-purple-500 text-white hover:bg-purple-600';
    case 'ELITE':
      return 'bg-amber-500 text-white hover:bg-amber-600';
    default:
      return 'bg-gray-500 text-white hover:bg-gray-600';
  }
};

export function WorkoutSessionTracker() {
  const [routine, setRoutine] = useState<DailyRoutine | null>(null);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [viewState, setViewState] = useState<ViewState>('overview');
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [achievementData, setAchievementData] = useState<any>(null);
  // DEV ONLY: Force day of week
  const [devForceDay, setDevForceDay] = useState<number | null>(null);
  const isDevelopment = process.env.NODE_ENV === 'development';
  const [showRewards, setShowRewards] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [hasSetGoals, setHasSetGoals] = useState(false);
  const [preferredDuration, setPreferredDuration] = useState<number>(60);
  // Exercise details from database
  const [exerciseDetailsMap, setExerciseDetailsMap] = useState<Map<string, ExerciseDetails | null>>(new Map());

  // Fetch daily routine on mount
  useEffect(() => {
    checkTrainingGoals();
  }, []);

  const checkTrainingGoals = async () => {
    try {
      // Check if user has training goals set
      const response = await fetch('/api/training/goals');
      const data = await response.json();

      if (data.hasGoals) {
        setHasSetGoals(true);
        if (data.goal?.preferredDuration) {
          setPreferredDuration(data.goal.preferredDuration);
        }
        fetchDailyRoutine();
      } else {
        // Show goals dialog on first visit
        setShowGoalsDialog(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking goals:', error);
      // If error, just fetch routine anyway
      fetchDailyRoutine();
    }
  };

  const handleDurationChange = (newDuration: number) => {
    setPreferredDuration(newDuration);
    // Regenerate routine with new duration
    fetchDailyRoutine();
  };

  const handleGoalsComplete = async (goal: TrainingGoal) => {
    try {
      // Save training goals
      await fetch('/api/training/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });

      setHasSetGoals(true);
      setShowGoalsDialog(false);
      fetchDailyRoutine();
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const fetchExerciseDetails = async (routine: DailyRoutine) => {
    try {
      // Collect all unique exercise names from the routine
      const exerciseNames = new Set<string>();
      routine.phases.forEach(phase => {
        phase.exercises.forEach(ex => {
          exerciseNames.add(ex.exercise.name);
        });
      });

      console.log('[EXERCISE_DB] Fetching details for', exerciseNames.size, 'exercises');

      // Fetch exercise details from database
      const detailsMap = await findExercisesByNames(Array.from(exerciseNames));
      setExerciseDetailsMap(detailsMap);

      console.log('[EXERCISE_DB] Loaded details for', detailsMap.size, 'exercises');
    } catch (error) {
      console.error('[EXERCISE_DB] Error fetching exercise details:', error);
    }
  };

  const fetchDailyRoutine = async () => {
    try {
      setLoading(true);
      setError(null);

      // Include forceDay in request if in dev mode and set
      const requestBody = devForceDay !== null ? { forceDay: devForceDay } : {};

      const response = await fetch('/api/training/generate-daily-routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();

      if (data.success) {
        setRoutine(data.routine);
        // Fetch exercise details from database
        await fetchExerciseDetails(data.routine);
      } else {
        // If routine generation failed, try to initialize profile and retry
        if (data.error === 'User not found' || data.error === 'Failed to generate routine') {
          console.log('[WORKOUT] Attempting to initialize profile...');

          try {
            const initResponse = await fetch('/api/training/initialize-profile', {
              method: 'POST',
            });
            const initData = await initResponse.json();

            if (initData.success) {
              console.log('[WORKOUT] Profile initialized, retrying routine generation...');
              // Retry fetching routine
              const retryResponse = await fetch('/api/training/generate-daily-routine');
              const retryData = await retryResponse.json();

              if (retryData.success) {
                setRoutine(retryData.routine);
                // Fetch exercise details from database
                await fetchExerciseDetails(retryData.routine);
                return;
              }
            }
          } catch (initError) {
            console.error('[WORKOUT] Failed to initialize profile:', initError);
          }
        }

        setError(data.error || 'Failed to generate routine');
      }
    } catch (error) {
      console.error('Error fetching routine:', error);
      setError('Failed to load workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startWorkoutSession = async () => {
    if (!routine) return;

    setLoading(true);
    try {
      const response = await fetch('/api/training/start-workout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routine }),
      });

      const data = await response.json();

      if (data.success) {
        setSession(data.session);
        setViewState('active');
        console.log('[WORKOUT] Session started successfully:', data.session.id);
      } else {
        console.error('[WORKOUT] Failed to start session:', data.error);
        setError(data.error || 'Failed to start workout session');
      }
    } catch (error) {
      console.error('[WORKOUT] Error starting session:', error);
      setError('Failed to start workout session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentExercise = () => {
    if (!session) {
      console.log('[WORKOUT] getCurrentExercise: No session');
      return null;
    }

    if (!session.progress || !session.routine) {
      console.log('[WORKOUT] getCurrentExercise: Session missing progress or routine', {
        hasProgress: !!session.progress,
        hasRoutine: !!session.routine,
      });
      return null;
    }

    console.log('[WORKOUT] getCurrentExercise:', {
      currentPhaseIndex: session.currentPhaseIndex,
      currentExerciseIndex: session.currentExerciseIndex,
      totalPhases: session.progress?.phases?.length,
    });

    const currentPhase = session.progress.phases[session.currentPhaseIndex];
    if (!currentPhase) {
      console.log('[WORKOUT] getCurrentExercise: No current phase');
      return null;
    }

    const currentEx = currentPhase.exercises[session.currentExerciseIndex];
    const routinePhase = session.routine.phases[session.currentPhaseIndex];
    const routineEx = routinePhase?.exercises[session.currentExerciseIndex];

    if (!currentEx || !routineEx) {
      console.log('[WORKOUT] getCurrentExercise: Missing exercise data', {
        hasCurrentEx: !!currentEx,
        hasRoutineEx: !!routineEx,
      });
      return null;
    }

    console.log('[WORKOUT] getCurrentExercise: Found exercise:', routineEx.exercise.name);

    return {
      progress: currentEx,
      routine: routineEx,
      phase: currentPhase.phase,
    };
  };

  const completeExercise = async (phaseIndex: number, exerciseIndex: number, reps?: number, time?: number) => {
    if (!session) return;

    try {
      const response = await fetch('/api/training/update-workout-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          action: 'complete_exercise',
          data: { phaseIndex, exerciseIndex, reps, time },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // API now returns session with parsed routine and progress
        setSession(data.session);
      }
    } catch (error) {
      console.error('Error completing exercise:', error);
    }
  };

  const moveToNextExercise = async () => {
    if (!session || !session.progress || !session.progress.phases) {
      console.error('[WORKOUT] moveToNextExercise: Invalid session state');
      return;
    }

    const currentPhase = session.progress.phases[session.currentPhaseIndex];
    const nextExerciseIndex = session.currentExerciseIndex + 1;

    if (nextExerciseIndex >= currentPhase.exercises.length) {
      // Move to next phase
      const nextPhaseIndex = session.currentPhaseIndex + 1;

      if (nextPhaseIndex >= session.progress.phases.length) {
        // All phases completed
        await completeSession();
        return;
      }

      // Update to first exercise of next phase
      await updateProgress(nextPhaseIndex, 0);
    } else {
      // Move to next exercise in current phase
      await updateProgress(session.currentPhaseIndex, nextExerciseIndex);
    }
  };

  const updateProgress = async (phaseIndex: number, exerciseIndex: number) => {
    if (!session) return;

    try {
      const response = await fetch('/api/training/update-workout-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          action: 'update_progress',
          data: { phaseIndex, exerciseIndex },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // API now returns session with parsed routine and progress
        setSession(data.session);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const completeSession = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/training/update-workout-session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          action: 'complete_session',
          data: {},
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRewards(data.rewards);
        setStreakInfo(data.streak);
        setAchievementData(data.achievements);
        setViewState('completed');
        setShowRewards(false); // Don't show old reward notification
      }
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const handleContinueTraining = () => {
    // Navigate to manual exercise log
    window.location.href = '/activity?tab=log';
  };

  const handleFinishDay = () => {
    // Navigate to dashboard
    window.location.href = '/dashboard';
  };

  const resetWorkout = () => {
    setSession(null);
    setRewards(null);
    setViewState('overview');
    setShowRewards(false);
    fetchDailyRoutine();
  };

  const handleSetComplete = (setNumber: number, reps?: number, time?: number) => {
    // Track set completion (could be logged for analytics)
    console.log(`Set ${setNumber} completed`, { reps, time });
  };

  const handleExerciseComplete = async () => {
    console.log('[WORKOUT] handleExerciseComplete called');
    if (!session) {
      console.log('[WORKOUT] No session, returning');
      return;
    }

    const current = getCurrentExercise();
    if (!current) {
      console.log('[WORKOUT] No current exercise, returning');
      return;
    }

    // Check if this is the last exercise
    const isLastExercise =
      session.currentPhaseIndex === session.routine.phases.length - 1 &&
      session.currentExerciseIndex === session.routine.phases[session.currentPhaseIndex].exercises.length - 1;

    console.log('[WORKOUT] Exercise completion:', {
      isLastExercise,
      currentPhaseIndex: session.currentPhaseIndex,
      currentExerciseIndex: session.currentExerciseIndex,
      totalPhases: session.routine.phases.length,
      exercisesInCurrentPhase: session.routine.phases[session.currentPhaseIndex].exercises.length,
    });

    // Mark exercise as completed
    console.log('[WORKOUT] Marking exercise as completed...');
    await completeExercise(
      session.currentPhaseIndex,
      session.currentExerciseIndex,
      current.routine.exercise.unit === 'reps' ? current.routine.repsOrTime : undefined,
      current.routine.exercise.unit === 'time' ? current.routine.repsOrTime : undefined
    );

    // If this was the last exercise, complete the session
    if (isLastExercise) {
      console.log('[WORKOUT] Last exercise - completing session...');
      await completeSession();
    } else {
      console.log('[WORKOUT] Not last exercise - moving to next...');
      // Otherwise, move to next exercise
      await moveToNextExercise();
    }
  };

  const handleSkipExercise = async () => {
    await moveToNextExercise();
  };

  console.log('[WORKOUT] Render state:', {
    loading,
    viewState,
    hasRoutine: !!routine,
    hasSession: !!session,
    hasError: !!error
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Overview View
  if (viewState === 'overview' && routine) {
    const totalExercises = routine.phases.reduce((sum, phase) => sum + phase.exercises.length, 0);

    return (
      <div className="space-y-6">
        {/* Routine Header */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">Today's Workout</CardTitle>
                <CardDescription className="text-base mt-2">
                  {new Date(routine.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <DurationSelectorButton
                  currentDuration={preferredDuration}
                  onDurationChange={handleDurationChange}
                />
                <Badge className={`text-lg px-4 py-2 ${getDifficultyColor(routine.difficulty)}`}>
                  {routine.difficulty}
                </Badge>
              </div>
            </div>

            {/* DEV ONLY: Day Selector */}
            {isDevelopment && (
              <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">🔧 DEV MODE: Force Day</p>
                    <p className="text-xs text-yellow-700">Selecciona un día para probar diferentes rutinas</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={devForceDay ?? new Date().getDay()}
                      onChange={(e) => {
                        const day = parseInt(e.target.value);
                        setDevForceDay(day);
                        fetchDailyRoutine(); // Refetch with new day
                      }}
                      className="px-3 py-2 border-2 border-yellow-400 rounded-lg bg-white font-medium"
                    >
                      <option value={0}>Domingo (PUSH)</option>
                      <option value={1}>Lunes (LEGS)</option>
                      <option value={2}>Martes (PULL)</option>
                      <option value={3}>Miércoles (REST)</option>
                      <option value={4}>Jueves (PUSH)</option>
                      <option value={5}>Viernes (PULL)</option>
                      <option value={6}>Sábado (REST)</option>
                    </select>
                    {devForceDay !== null && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDevForceDay(null);
                          fetchDailyRoutine(); // Reset to real day
                        }}
                        className="border-yellow-400 text-yellow-800"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-bold">{routine.totalDuration} min</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Exercises</p>
                  <p className="font-bold">{totalExercises}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Est. XP</p>
                  <p className="font-bold">{routine.estimatedXP.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Est. Coins</p>
                  <p className="font-bold">{routine.estimatedCoins}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-700 mb-2">Focus Areas:</p>
              <div className="flex flex-wrap gap-2">
                {routine.focusAreas.map((area) => (
                  <Badge key={area} variant="outline" className="capitalize">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phases Overview */}
        {routine.phases.map((phase, phaseIndex) => (
          <Card key={phaseIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5" />
                {phase.phase.replace('_', ' ')}
                <Badge variant="secondary" className="ml-auto">
                  {phase.duration} min
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {phase.exercises.map((ex, exIndex) => (
                  <ExerciseDetailCard
                    key={exIndex}
                    exerciseName={ex.exercise.name}
                    sets={ex.sets}
                    repsOrTime={ex.repsOrTime}
                    rest={ex.restBetweenSets}
                    unit={ex.exercise.unit}
                    difficulty={ex.exercise.difficulty}
                    trainingMode={ex.trainingMode}
                    notes={ex.notes}
                    details={exerciseDetailsMap.get(ex.exercise.name) || null}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Start Button */}
        <div className="flex justify-center">
          <Button
            onClick={startWorkoutSession}
            size="lg"
            className="text-lg px-8 py-6"
          >
            <PlayCircle className="w-6 h-6 mr-2" />
            Start Workout
          </Button>
        </div>
      </div>
    );
  }

  // Active Workout View
  if (viewState === 'active' && session) {
    const current = getCurrentExercise();
    if (!current) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error Loading Exercise</CardTitle>
            <CardDescription>
              Could not load the current exercise. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={resetWorkout} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Workout
            </Button>
            <div className="mt-4 p-4 bg-white rounded text-xs">
              <p className="font-semibold mb-2">Debug Info:</p>
              <pre>{JSON.stringify({
                sessionId: session.id,
                currentPhaseIndex: session.currentPhaseIndex,
                currentExerciseIndex: session.currentExerciseIndex,
                totalPhases: session.progress?.phases?.length,
              }, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      );
    }

    const totalExercises = session.routine.phases.reduce((sum, p) => sum + p.exercises.length, 0);
    const completedExercises = session.progress.phases.reduce(
      (sum, p) => sum + p.exercises.filter(e => e.completed).length,
      0
    );
    const progressPercent = (completedExercises / totalExercises) * 100;

    return (
      <div className="space-y-6">
        {/* Overall Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm text-gray-600">
                {completedExercises} / {totalExercises} exercises
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </CardContent>
        </Card>

        {/* Current Phase */}
        <div className="text-center">
          <Badge className="text-base px-4 py-2">
            {current.phase.replace('_', ' ')}
          </Badge>
        </div>

        {/* Exercise Timer */}
        <ExerciseTimer
          exerciseName={current.routine.exercise.name}
          sets={current.routine.sets}
          repsOrTime={current.routine.repsOrTime}
          unit={current.routine.exercise.unit}
          restBetweenSets={current.routine.restBetweenSets}
          currentSet={current.progress.completedSets}
          gifUrl={current.routine.exercise.gifUrl}
          instructions={current.routine.exercise.instructions}
          description={current.routine.exercise.description}
          isLastExercise={
            session.currentPhaseIndex === session.routine.phases.length - 1 &&
            session.currentExerciseIndex === session.routine.phases[session.currentPhaseIndex].exercises.length - 1
          }
          onSetComplete={handleSetComplete}
          onExerciseComplete={handleExerciseComplete}
          onSkip={handleSkipExercise}
        />
      </div>
    );
  }

  // Completed View
  if (viewState === 'completed' && rewards) {
    return (
      <>
        <TrainingGoalsDialog open={showGoalsDialog} onComplete={handleGoalsComplete} />
        <WorkoutCompletionView
          rewards={rewards}
          streakInfo={streakInfo}
          achievements={achievementData}
          onContinueTraining={handleContinueTraining}
          onFinishDay={handleFinishDay}
        />
      </>
    );
  }

  // Empty or Error State
  return (
    <div className="space-y-6">
      <TrainingGoalsDialog open={showGoalsDialog} onComplete={handleGoalsComplete} />
      <Card className="border-2 border-gray-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <Dumbbell className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {error ? 'Unable to Load Workout' : 'No Workout Available'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {error || 'Complete your assessment first to get personalized daily workouts'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <>
              <Button onClick={fetchDailyRoutine} className="w-full" size="lg">
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
              <ErrorDiagnostic />
            </>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full"
                size="lg"
              >
                Complete Assessment
              </Button>
              <p className="text-sm text-center text-gray-600">
                Or log exercises manually
              </p>
              <Button
                onClick={() => window.location.href = '/activity?tab=log'}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Dumbbell className="w-5 h-5 mr-2" />
                Log Manual Exercise
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p>Complete the fitness assessment to get personalized workouts</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p>New workouts are generated daily based on your progress</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p>Track manual exercises in the Activity page to earn XP and achievements</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
