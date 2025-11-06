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
        // Fetch a simple session plan (fallback to demo data)
        const res = await fetch('/api/workouts?limit=1');
        if (res.ok) {
          // Minimal demo plan
          setExercises([
            { id: '1', name: 'Jumping Jacks', durationSec: 60 },
            { id: '2', name: 'Push-ups', reps: 12 },
            { id: '3', name: 'Plank', durationSec: 45 },
          ]);
        } else {
          setExercises([
            { id: '1', name: 'Squats', reps: 15 },
            { id: '2', name: 'Pull-ups (assisted)', reps: 8 },
            { id: '3', name: 'Hollow Hold', durationSec: 30 },
          ]);
        }
      } catch {
        setExercises([
          { id: '1', name: 'Squats', reps: 15 },
          { id: '2', name: 'Pull-ups (assisted)', reps: 8 },
          { id: '3', name: 'Hollow Hold', durationSec: 30 },
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