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
  RotateCcw,
  Zap,
  Coffee,
  Timer,
  Target,
  Clock
} from 'lucide-react';

interface IntervalTimerProps {
  workDuration: number; // seconds
  restDuration: number; // seconds
  rounds: number;
  onComplete?: () => void;
  onStop?: () => void;
  exerciseName?: string;
}

type Phase = 'work' | 'rest' | 'completed';

export default function IntervalTimer({ 
  workDuration, 
  restDuration, 
  rounds, 
  onComplete, 
  onStop,
  exerciseName = 'Ejercicio de Intervalos'
}: IntervalTimerProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPhase, setCurrentPhase] = useState<Phase>('work');
  const [timeRemaining, setTimeRemaining] = useState(workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalWorkoutTime = (workDuration + restDuration) * rounds - restDuration; // No rest after last round

  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Phase completed
            if (currentPhase === 'work') {
              // Switch to rest (unless it's the last round)
              if (currentRound < rounds) {
                setCurrentPhase('rest');
                return restDuration;
              } else {
                // Workout completed
                setCurrentPhase('completed');
                setIsRunning(false);
                onComplete?.();
                return 0;
              }
            } else {
              // Rest completed, move to next round
              setCurrentRound(prev => prev + 1);
              setCurrentPhase('work');
              return workDuration;
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
  }, [isRunning, isPaused, timeRemaining, currentPhase, currentRound, rounds, workDuration, restDuration, onComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
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
    setCurrentRound(1);
    setCurrentPhase('work');
    setTimeRemaining(workDuration);
    setTotalElapsedTime(0);
    onStop?.();
  };

  const handleReset = () => {
    handleStop();
  };

  const getPhaseProgress = () => {
    const phaseDuration = currentPhase === 'work' ? workDuration : restDuration;
    return ((phaseDuration - timeRemaining) / phaseDuration) * 100;
  };

  const getOverallProgress = () => {
    const completedRounds = currentRound - 1;
    const currentRoundProgress = currentPhase === 'work' 
      ? getPhaseProgress() / 100 
      : 1 + (getPhaseProgress() / 100);
    
    return ((completedRounds + (currentRoundProgress / 2)) / rounds) * 100;
  };

  const getPhaseColor = () => {
    if (currentPhase === 'work') return 'text-red-600';
    if (currentPhase === 'rest') return 'text-blue-600';
    return 'text-green-600';
  };

  const getPhaseIcon = () => {
    if (currentPhase === 'work') return <Zap className="h-6 w-6 text-red-600" />;
    if (currentPhase === 'rest') return <Coffee className="h-6 w-6 text-blue-600" />;
    return <Target className="h-6 w-6 text-green-600" />;
  };

  const getPhaseText = () => {
    if (currentPhase === 'work') return 'TRABAJO';
    if (currentPhase === 'rest') return 'DESCANSO';
    return 'COMPLETADO';
  };

  const getBackgroundColor = () => {
    if (currentPhase === 'work') return 'bg-red-50 border-red-200';
    if (currentPhase === 'rest') return 'bg-blue-50 border-blue-200';
    return 'bg-green-50 border-green-200';
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto transition-colors ${getBackgroundColor()}`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Timer className="h-6 w-6" />
          {exerciseName}
        </CardTitle>
        <CardDescription>
          Entrenamiento por Intervalos - Ronda {currentRound} de {rounds}
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

        {/* Current Phase */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            {getPhaseIcon()}
            <h2 className={`text-3xl font-bold ${getPhaseColor()}`}>
              {getPhaseText()}
            </h2>
          </div>

          {/* Timer Display */}
          <div className="space-y-2">
            <div className={`text-6xl font-mono font-bold ${getPhaseColor()}`}>
              {formatTime(timeRemaining)}
            </div>
            <Progress 
              value={getPhaseProgress()} 
              className={`h-4 ${currentPhase === 'work' ? '[&>div]:bg-red-500' : '[&>div]:bg-blue-500'}`} 
            />
          </div>

          {/* Round Info */}
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Ronda {currentRound}/{rounds}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(totalElapsedTime)} total
            </Badge>
          </div>
        </div>

        {/* Phase Schedule */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 rounded-lg bg-red-100 border border-red-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-red-600" />
              <span className="font-semibold text-red-800">Trabajo</span>
            </div>
            <p className="text-red-600 font-mono">{formatTime(workDuration)}</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-100 border border-blue-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coffee className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-800">Descanso</span>
            </div>
            <p className="text-blue-600 font-mono">{formatTime(restDuration)}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
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
            onClick={handleStop}
            disabled={!isRunning && !isPaused}
          >
            <Square className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Completion Message */}
        {currentPhase === 'completed' && (
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Target className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-800">¡Entrenamiento Completado!</h3>
            <p className="text-green-600">
              {rounds} rondas completadas en {formatTime(totalElapsedTime)}
            </p>
          </div>
        )}

        {/* Next Phase Preview */}
        {isRunning && currentPhase !== 'completed' && (
          <div className="text-center text-sm text-muted-foreground">
            {currentPhase === 'work' && currentRound < rounds && (
              <p>Siguiente: Descanso ({formatTime(restDuration)})</p>
            )}
            {currentPhase === 'rest' && (
              <p>Siguiente: Trabajo - Ronda {currentRound + 1} ({formatTime(workDuration)})</p>
            )}
            {currentPhase === 'work' && currentRound === rounds && (
              <p>¡Última ronda! 💪</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}