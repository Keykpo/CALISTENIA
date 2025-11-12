'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipForward, Check } from 'lucide-react';

interface ExerciseTimerProps {
  exerciseName: string;
  sets: number;
  repsOrTime: number;
  unit: 'reps' | 'time';
  restBetweenSets: number;
  currentSet: number;
  gifUrl?: string;
  instructions?: string[];
  description?: string;
  isLastExercise?: boolean;
  onSetComplete: (setNumber: number, actualReps?: number, actualTime?: number) => void;
  onExerciseComplete: () => void;
  onSkip: () => void;
}

type TimerState = 'work' | 'rest' | 'paused' | 'complete';

export function ExerciseTimer({
  exerciseName,
  sets,
  repsOrTime,
  unit,
  restBetweenSets,
  currentSet,
  gifUrl,
  instructions,
  description,
  isLastExercise,
  onSetComplete,
  onExerciseComplete,
  onSkip,
}: ExerciseTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>('work');
  const [timeRemaining, setTimeRemaining] = useState(unit === 'time' ? repsOrTime : restBetweenSets);
  const [completedSets, setCompletedSets] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Reset timer state when exercise changes
  useEffect(() => {
    setTimerState('work');
    setCompletedSets(0);
    setIsRunning(false);
    setTimeRemaining(unit === 'time' ? repsOrTime : restBetweenSets);
  }, [exerciseName, unit, repsOrTime, restBetweenSets]);

  // Timer countdown effect
  useEffect(() => {
    if (!isRunning || timerState === 'complete') return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer finished
          if (timerState === 'work') {
            // Work period ended
            const newSetNumber = completedSets + 1;
            setCompletedSets(newSetNumber);
            onSetComplete(newSetNumber, undefined, unit === 'time' ? repsOrTime : undefined);

            if (newSetNumber >= sets) {
              // All sets completed
              setTimerState('complete');
              setIsRunning(false);
              return 0;
            } else {
              // Move to rest
              setTimerState('rest');
              return restBetweenSets;
            }
          } else if (timerState === 'rest') {
            // Rest period ended
            setTimerState('work');
            return unit === 'time' ? repsOrTime : restBetweenSets;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timerState, completedSets, sets, repsOrTime, unit, restBetweenSets, onSetComplete]);

  const handleStart = () => {
    setIsRunning(true);
    if (timerState === 'paused') {
      setTimerState('work');
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    setTimerState('paused');
  };

  const handleCompleteSet = () => {
    const newSetNumber = completedSets + 1;
    setCompletedSets(newSetNumber);
    onSetComplete(newSetNumber, unit === 'reps' ? repsOrTime : undefined, undefined);

    if (newSetNumber >= sets) {
      // All sets completed - show completion state
      setTimerState('complete');
      setIsRunning(false);
      // Note: Don't call onExerciseComplete() here - let user click the button
    } else {
      setTimerState('rest');
      setTimeRemaining(restBetweenSets);
    }
  };

  const handleCompleteExercise = () => {
    console.log('[EXERCISE_TIMER] Complete exercise clicked, isLastExercise:', isLastExercise);
    onExerciseComplete();
  };

  const progressPercent = ((completedSets / sets) * 100);

  return (
    <Card className="border-2 border-blue-200">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Exercise Name */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{exerciseName}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {unit === 'reps' ? `${repsOrTime} reps` : `${repsOrTime}s hold`} × {sets} sets
            </p>
            {description && (
              <p className="text-sm text-gray-500 mt-2">{description}</p>
            )}
          </div>

          {/* Exercise GIF */}
          {gifUrl && (
            <div className="flex justify-center bg-gray-50 rounded-lg p-4">
              <img
                src={gifUrl}
                alt={exerciseName}
                className="max-w-full h-auto max-h-64 rounded-lg"
                loading="lazy"
              />
            </div>
          )}

          {/* Instructions (collapsible) */}
          {instructions && instructions.length > 0 && (
            <details className="bg-blue-50 rounded-lg p-4">
              <summary className="cursor-pointer font-semibold text-blue-900 hover:text-blue-700">
                📋 How to Perform
              </summary>
              <ol className="list-decimal list-inside space-y-1 mt-3 text-sm text-gray-700">
                {instructions.map((step, idx) => (
                  <li key={idx}>{step.replace(/^Step:\d+\s*/, '')}</li>
                ))}
              </ol>
            </details>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Set {completedSets + 1} of {sets}</span>
              <span>{Math.round(progressPercent)}% complete</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Timer Display */}
          {timerState !== 'complete' && (
            <div className="text-center">
              <div className={`text-6xl font-bold ${
                timerState === 'work' ? 'text-blue-600' :
                timerState === 'rest' ? 'text-green-600' :
                'text-gray-400'
              }`}>
                {unit === 'time' && timerState === 'work' ? (
                  <>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</>
                ) : timerState === 'rest' ? (
                  <>{timeRemaining}s</>
                ) : (
                  <span className="text-4xl">{unit === 'reps' ? `${repsOrTime} reps` : 'Ready'}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {timerState === 'work' ? (unit === 'time' ? 'Hold time' : 'Complete the reps') :
                 timerState === 'rest' ? 'Rest period' :
                 'Paused'}
              </p>
            </div>
          )}

          {/* Complete State */}
          {timerState === 'complete' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h4 className="text-2xl font-bold text-green-600">Exercise Complete!</h4>
              <p className="text-gray-600 mt-2">{sets} sets completed</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3">
            {timerState !== 'complete' ? (
              <>
                {unit === 'time' ? (
                  // Time-based exercise controls
                  <>
                    {!isRunning ? (
                      <Button onClick={handleStart} className="flex-1" size="lg">
                        <Play className="w-5 h-5 mr-2" />
                        Start
                      </Button>
                    ) : (
                      <Button onClick={handlePause} variant="outline" className="flex-1" size="lg">
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </Button>
                    )}
                  </>
                ) : (
                  // Rep-based exercise controls
                  <Button onClick={handleCompleteSet} className="flex-1" size="lg">
                    <Check className="w-5 h-5 mr-2" />
                    Complete Set
                  </Button>
                )}
                <Button onClick={onSkip} variant="outline" size="lg">
                  <SkipForward className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Button onClick={handleCompleteExercise} className="flex-1" size="lg">
                {isLastExercise ? 'Finish Workout' : 'Next Exercise'}
              </Button>
            )}
          </div>

          {/* Rest Timer Info */}
          {timerState === 'rest' && (
            <div className="text-center text-sm text-gray-600">
              <p>Take a breather! Rest for {restBetweenSets}s before the next set.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
