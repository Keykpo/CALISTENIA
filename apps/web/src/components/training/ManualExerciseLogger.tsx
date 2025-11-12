'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Trophy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ManualExerciseLoggerProps {
  onLogSuccess?: () => void;
}

export function ManualExerciseLogger({ onLogSuccess }: ManualExerciseLoggerProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'PUSH' | 'PULL' | 'CORE' | 'BALANCE'>('PUSH');
  const [reps, setReps] = useState<number | ''>('');
  const [duration, setDuration] = useState<number | ''>('');
  const [isLogging, setIsLogging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error('Please enter an exercise name');
      return;
    }

    if (!reps && !duration) {
      toast.error('Please enter either reps or duration');
      return;
    }

    setIsLogging(true);

    try {
      const response = await fetch('/api/training/log-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          reps: reps || undefined,
          durationSec: duration || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log exercise');
      }

      // Show success message
      const xpGained = data.xpGain || 0;
      const coinsGained = data.coinsGain || 0;
      const achievementsCompleted = data.achievements?.completed?.length || 0;

      let message = `Logged ${name}! +${xpGained} XP, +${coinsGained} coins`;
      if (achievementsCompleted > 0) {
        message += ` 🏆 ${achievementsCompleted} achievement${achievementsCompleted > 1 ? 's' : ''} completed!`;
      }

      toast.success(message);

      // Reset form
      setName('');
      setReps('');
      setDuration('');

      // Call success callback
      if (onLogSuccess) {
        onLogSuccess();
      }
    } catch (error: any) {
      console.error('Error logging exercise:', error);
      toast.error(error.message || 'Failed to log exercise');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-blue-600" />
          <CardTitle>Log Manual Exercise</CardTitle>
        </div>
        <CardDescription>
          Track exercises you do outside of daily workouts. Counts towards achievements!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Exercise Name</Label>
            <Input
              id="name"
              placeholder="e.g., Push-ups, Pull-ups, Plank"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLogging}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as any)} disabled={isLogging}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUSH">Push (Push-ups, Dips, etc.)</SelectItem>
                <SelectItem value="PULL">Pull (Pull-ups, Rows, etc.)</SelectItem>
                <SelectItem value="CORE">Core (Planks, Sit-ups, etc.)</SelectItem>
                <SelectItem value="BALANCE">Balance (Handstands, L-sits, etc.)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                type="number"
                min="0"
                placeholder="10"
                value={reps}
                onChange={(e) => setReps(e.target.value ? parseInt(e.target.value) : '')}
                disabled={isLogging}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                placeholder="60"
                value={duration}
                onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : '')}
                disabled={isLogging}
              />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Fill in either reps (for counting exercises) or duration (for time-based exercises like planks)
          </p>

          <Button type="submit" className="w-full" disabled={isLogging}>
            {isLogging ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging...
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4 mr-2" />
                Log Exercise
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
