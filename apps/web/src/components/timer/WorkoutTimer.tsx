'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack, 
  Timer, 
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  duration: number;
  description?: string;
  instructions?: string[];
}

interface WorkoutTimerProps {
  exercises: Exercise[];
  onComplete?: () => void;
  onStop?: () => void;
}

export default function WorkoutTimer({ exercises, onComplete, onStop }: WorkoutTimerProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const totalWorkoutTime = exercises.reduce((sum, ex) => sum + ex.duration, 0);

  useEffect(() => {
    if (exercises.length > 0 && !isRunning) {
      setTimeRemaining(exercises[0].duration * 60); // Convert minutes to seconds
    }
  }, [exercises]);

  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Exercise completed
            if (currentExerciseIndex < exercises.length - 1) {
              // Move to next exercise
              const nextIndex = currentExerciseIndex + 1;
              setCurrentExerciseIndex(nextIndex);
              return exercises[nextIndex].duration * 60;
            } else {
              // Workout completed
              setIsRunning(false);
              setIsCompleted(true);
              onComplete?.();
              return 0;
            }
          }
          return prev - 1;
        });
        
        setTotalElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeRemaining, currentExerciseIndex, exercises, onComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  const handlePause = () => {
    setIsPaused(true);
    pausedTimeRef.current = Date.now();
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentExerciseIndex(0);
    setTimeRemaining(exercises[0]?.duration * 60 || 0);
    setTotalElapsedTime(0);
    setIsCompleted(false);
    onStop?.();
  };

  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setTimeRemaining(exercises[nextIndex].duration * 60);
    }
  };

  const handlePrevious = () => {
    if (currentExerciseIndex > 0) {
      const prevIndex = currentExerciseIndex - 1;
      setCurrentExerciseIndex(prevIndex);
      setTimeRemaining(exercises[prevIndex].duration * 60);
    }
  };

  const getProgressPercentage = () => {
    if (!currentExercise) return 0;
    const exerciseDuration = currentExercise.duration * 60;
    return ((exerciseDuration - timeRemaining) / exerciseDuration) * 100;
  };

  const getOverallProgress = () => {
    const completedExercises = currentExerciseIndex;
    const currentProgress = getProgressPercentage() / 100;
    return ((completedExercises + currentProgress) / totalExercises) * 100;
  };

  if (!currentExercise) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No hay ejercicios disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Timer className="h-6 w-6" />
          Temporizador de Entrenamiento
        </CardTitle>
        <CardDescription>
          Ejercicio {currentExerciseIndex + 1} de {totalExercises}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progreso General</span>
            <span>{Math.round(getOverallProgress())}%</span>
          </div>
          <Progress value={getOverallProgress()} className="h-2" />
        </div>

        {/* Current Exercise Info */}
        <div className="text-center space-y-4">
          <div>
            <h3 className="text-2xl font-bold">{currentExercise.name}</h3>
            {currentExercise.description && (
              <p className="text-muted-foreground mt-2">{currentExercise.description}</p>
            )}
          </div>

          {/* Timer Display */}
          <div className="space-y-2">
            <div className="text-6xl font-mono font-bold text-primary">
              {formatTime(timeRemaining)}
            </div>
            <Progress value={getProgressPercentage()} className="h-3" />
          </div>

          {/* Exercise Status */}
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {currentExercise.duration} min
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(totalElapsedTime)} transcurrido
            </Badge>
          </div>
        </div>

        {/* Instructions */}
        {currentExercise.instructions && currentExercise.instructions.length > 0 && (
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Instrucciones:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {currentExercise.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentExerciseIndex === 0 || isRunning}
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          {!isRunning ? (
            <Button onClick={handleStart} size="lg" className="px-8">
              <Play className="mr-2 h-5 w-5" />
              Iniciar
            </Button>
          ) : isPaused ? (
            <Button onClick={handleResume} size="lg" className="px-8">
              <Play className="mr-2 h-5 w-5" />
              Reanudar
            </Button>
          ) : (
            <Button onClick={handlePause} size="lg" className="px-8" variant="secondary">
              <Pause className="mr-2 h-5 w-5" />
              Pausar
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleStop}
            disabled={!isRunning && !isPaused}
          >
            <Square className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentExerciseIndex === exercises.length - 1 || isRunning}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Completion Message */}
        {isCompleted && (
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-800">¡Entrenamiento Completado!</h3>
            <p className="text-green-600">
              Tiempo total: {formatTime(totalElapsedTime)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}