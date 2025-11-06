"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type Exercise = {
  id: string;
  name: string;
  reps?: number;
  durationSec?: number;
};

export default function TrainingSessionPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Fetch generated training plan based on goal/level
        const res = await fetch('/api/training/plan?goal=strength&level=BEGINNER&durationMin=30');
        if (res.ok) {
          const data = await res.json();
          const ex: Exercise[] = [
            ...data.plan.warmup,
            ...data.plan.main,
            ...data.plan.finisher,
          ];
          setExercises(ex);
          return;
        }
      } catch {
        // Fallback demo plan
        setExercises([
          { id: 'warmup_jumping_jacks', name: 'Jumping Jacks', durationSec: 60 },
          { id: 'push_standard', name: 'Flexiones Completas', reps: 12 },
          { id: 'core_plank', name: 'Plancha', durationSec: 45 },
        ]);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const current = exercises[currentIndex];
    if (!current) return;
    if (current.durationSec) setTimeLeft(current.durationSec);
    else setTimeLeft(null);
  }, [currentIndex, exercises]);

  useEffect(() => {
    if (timeLeft == null) return;
    const t = setInterval(() => {
      setTimeLeft((v) => (v && v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const next = () => {
    // Log current exercise to evolve hexagon profile
    if (current) {
      const payload: any = { name: current.name };
      if (current.reps) payload.reps = current.reps;
      if (current.durationSec) payload.durationSec = current.durationSec;
      fetch('/api/training/log-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }
    if (currentIndex + 1 >= exercises.length) {
      setCompleted(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const current = exercises[currentIndex];
  const percent = exercises.length ? Math.round(((currentIndex) / exercises.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Training Session</CardTitle>
            <CardDescription>Follow the plan and complete each exercise.</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={percent} className="mb-4" />
            {!completed && current && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Exercise {currentIndex + 1} of {exercises.length}</div>
                  <h3 className="text-2xl font-semibold">{current.name}</h3>
                </div>
                {current.reps && (
                  <div className="text-lg">Reps: {current.reps}</div>
                )}
                {current.durationSec && (
                  <div className="text-lg">Time left: {timeLeft}s</div>
                )}
                <div className="flex gap-2">
                  <Button onClick={next}>Next</Button>
                </div>
              </div>
            )}

            {completed && (
              <div className="space-y-4 text-center">
                <h3 className="text-2xl font-semibold">Session Complete</h3>
                <p className="text-muted-foreground">Great job! Your progress has been recorded.</p>
                <Button onClick={() => { setCompleted(false); setCurrentIndex(0); }}>Restart</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}