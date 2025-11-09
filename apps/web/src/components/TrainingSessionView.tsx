'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  Circle,
  Clock,
  Trophy,
  Flame,
  Target,
  Dumbbell,
  Wind,
  Sparkles
} from 'lucide-react';
import { TrainingSessionData, SessionPhase, Exercise } from '@/lib/training-generator';
import { toast } from 'react-hot-toast';

interface TrainingSessionViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  sessionData: TrainingSessionData;
  xpAwarded: number;
  onComplete: () => void;
}

const PHASE_ICONS: Record<string, any> = {
  'Warmup': Wind,
  'Skill Practice': Target,
  'Strength Training': Dumbbell,
  'Conditioning': Flame,
  'Cooldown': Wind,
  'Stretching': Sparkles,
};

export default function TrainingSessionView({
  open,
  onOpenChange,
  sessionId,
  sessionData,
  xpAwarded,
  onComplete,
}: TrainingSessionViewProps) {
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [isCompleting, setIsCompleting] = useState(false);

  // Calculate total exercises
  const totalExercises = sessionData.phases.reduce(
    (sum, phase) => sum + phase.exercises.length,
    0
  );

  const completionPercentage = (completedExercises.size / totalExercises) * 100;

  const toggleExercise = async (exerciseIndex: number) => {
    const newCompleted = new Set(completedExercises);

    if (newCompleted.has(exerciseIndex)) {
      newCompleted.delete(exerciseIndex);
    } else {
      newCompleted.add(exerciseIndex);
    }

    setCompletedExercises(newCompleted);

    // Update in database
    try {
      await fetch('/api/training-session/exercise', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          exerciseIndex,
          completed: newCompleted.has(exerciseIndex),
        }),
      });
    } catch (error) {
      console.error('Error updating exercise:', error);
      toast.error('Failed to update exercise');
    }
  };

  const handleCompleteSession = async () => {
    if (completedExercises.size < totalExercises) {
      const confirmed = window.confirm(
        `You've only completed ${completedExercises.size} out of ${totalExercises} exercises. Complete session anyway?`
      );
      if (!confirmed) return;
    }

    setIsCompleting(true);

    try {
      const response = await fetch('/api/training-session/complete', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete session');
      }

      toast.success(`Session complete! +${xpAwarded} XP earned!`);
      onComplete();
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
    } finally {
      setIsCompleting(false);
    }
  };

  let exerciseIndex = 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            {sessionData.duration} Minute Training Session
          </DialogTitle>
          <DialogDescription>
            {sessionData.skillBranch.replace(/_/g, ' ')} - {sessionData.userLevel} Level
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Progress */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Overall Progress</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {completedExercises.size} / {totalExercises}
                  </p>
                  <p className="text-sm text-slate-600">exercises completed</p>
                </div>
                <Badge className="text-lg px-4 py-2 bg-blue-600">
                  <Trophy className="w-4 h-4 mr-1 inline" />
                  +{xpAwarded} XP
                </Badge>
              </div>
              <Progress value={completionPercentage} className="h-3" />
            </CardContent>
          </Card>

          {/* Phases */}
          {sessionData.phases.map((phase, phaseIdx) => {
            const PhaseIcon = PHASE_ICONS[phase.phase] || Target;

            return (
              <div key={phaseIdx}>
                <div className="flex items-center gap-3 mb-4">
                  <PhaseIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">{phase.phase}</h3>
                  <Badge variant="outline" className="text-xs">
                    {phase.minutes} min
                  </Badge>
                </div>

                <div className="space-y-3 ml-8">
                  {phase.exercises.map((exercise, exIdx) => {
                    const currentExerciseIndex = exerciseIndex++;
                    const isCompleted = completedExercises.has(currentExerciseIndex);

                    return (
                      <Card
                        key={exIdx}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isCompleted ? 'bg-green-50 border-green-300' : 'border-slate-200'
                        }`}
                        onClick={() => toggleExercise(currentExerciseIndex)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className="font-semibold text-slate-900">
                                    {exercise.name}
                                  </h4>
                                  <p className="text-sm text-slate-600 mt-1">
                                    {exercise.description}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2 shrink-0">
                                  {exercise.sets && (
                                    <Badge variant="outline" className="text-xs">
                                      {exercise.sets} sets
                                    </Badge>
                                  )}
                                  {exercise.reps && (
                                    <Badge variant="outline" className="text-xs">
                                      {exercise.reps} reps
                                    </Badge>
                                  )}
                                  {exercise.holdTime && (
                                    <Badge variant="outline" className="text-xs">
                                      {exercise.holdTime}s hold
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs bg-slate-100">
                                    {exercise.restTime}s rest
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {phaseIdx < sessionData.phases.length - 1 && (
                  <Separator className="my-6" />
                )}
              </div>
            );
          })}

          {/* Complete button */}
          <div className="sticky bottom-0 bg-white pt-6 pb-2 border-t">
            <Button
              onClick={handleCompleteSession}
              className="w-full h-14 text-lg"
              disabled={isCompleting}
            >
              {isCompleting ? 'Completing...' : `Complete Session & Earn ${xpAwarded} XP`}
            </Button>
            <p className="text-xs text-center text-slate-500 mt-2">
              Click exercises to mark them as complete
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
