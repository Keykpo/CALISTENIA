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
  Plus, 
  Minus, 
  Coffee,
  Clock,
  SkipForward
} from 'lucide-react';

interface RestTimerProps {
  initialDuration?: number; // in seconds
  onComplete?: () => void;
  onSkip?: () => void;
  onStop?: () => void;
  nextExerciseName?: string;
}

export default function RestTimer({ 
  initialDuration = 60, 
  onComplete, 
  onSkip, 
  onStop,
  nextExerciseName 
}: RestTimerProps) {
  const [duration, setDuration] = useState(initialDuration);
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
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
  }, [isRunning, isPaused, timeRemaining, onComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    setIsCompleted(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(duration);
    setIsCompleted(false);
    onStop?.();
  };

  const handleSkip = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(0);
    setIsCompleted(true);
    onSkip?.();
  };

  const adjustTime = (seconds: number) => {
    if (!isRunning) {
      const newDuration = Math.max(10, duration + seconds);
      setDuration(newDuration);
      setTimeRemaining(newDuration);
    } else {
      const newTime = Math.max(0, timeRemaining + seconds);
      setTimeRemaining(newTime);
    }
  };

  const getProgressPercentage = () => {
    return ((duration - timeRemaining) / duration) * 100;
  };

  const getTimeColor = () => {
    const percentage = (timeRemaining / duration) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Coffee className="h-6 w-6" />
          Tiempo de Descanso
        </CardTitle>
        {nextExerciseName && (
          <CardDescription>
            Siguiente: {nextExerciseName}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center space-y-4">
          <div className={`text-6xl font-mono font-bold ${getTimeColor()}`}>
            {formatTime(timeRemaining)}
          </div>
          <Progress value={getProgressPercentage()} className="h-3" />
        </div>

        {/* Duration Adjustment */}
        {!isRunning && !isCompleted && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustTime(-15)}
              disabled={duration <= 15}
            >
              <Minus className="h-4 w-4" />
              15s
            </Button>
            
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Clock className="h-4 w-4" />
              {formatTime(duration)}
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustTime(15)}
            >
              <Plus className="h-4 w-4" />
              15s
            </Button>
          </div>
        )}

        {/* Quick Time Adjustments During Rest */}
        {isRunning && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustTime(-10)}
              disabled={timeRemaining <= 10}
            >
              -10s
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustTime(10)}
            >
              +10s
            </Button>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-2">
          {!isRunning ? (
            <Button onClick={handleStart} size="lg" className="px-8">
              <Play className="mr-2 h-5 w-5" />
              Iniciar Descanso
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
            onClick={handleStop}
            disabled={!isRunning && !isPaused}
          >
            <Square className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isCompleted}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Preset Times */}
        {!isRunning && !isCompleted && (
          <div className="grid grid-cols-4 gap-2">
            {[30, 60, 90, 120].map((seconds) => (
              <Button
                key={seconds}
                variant="outline"
                size="sm"
                onClick={() => {
                  setDuration(seconds);
                  setTimeRemaining(seconds);
                }}
                className={duration === seconds ? 'bg-primary text-primary-foreground' : ''}
              >
                {seconds}s
              </Button>
            ))}
          </div>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Coffee className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-blue-800">¡Descanso Completado!</h3>
            <p className="text-blue-600 text-sm">
              Listo para el siguiente ejercicio
            </p>
          </div>
        )}

        {/* Tips */}
        {!isRunning && !isCompleted && (
          <div className="text-center text-sm text-muted-foreground">
            <p>💡 Ajusta el tiempo según tu nivel de fatiga</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}