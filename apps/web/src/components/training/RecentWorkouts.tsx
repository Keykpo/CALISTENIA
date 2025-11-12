'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trophy, Coins, Flame, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WorkoutSession {
  id: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  actualXP?: number;
  actualCoins?: number;
  routine: any;
}

export function RecentWorkouts() {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentWorkouts();
  }, []);

  const fetchRecentWorkouts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/training/workout-sessions?limit=5&status=COMPLETED');
      const data = await response.json();

      if (data.success) {
        setWorkouts(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching recent workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-gray-500 py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (workouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Workouts
          </CardTitle>
          <CardDescription>Your completed workouts will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-gray-500 py-8">
            <p>No workouts completed yet.</p>
            <p className="mt-2">Start your first workout today!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Recent Workouts
        </CardTitle>
        <CardDescription>Your last {workouts.length} completed sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workouts.map((workout) => {
            const routine = typeof workout.routine === 'string'
              ? JSON.parse(workout.routine)
              : workout.routine;

            return (
              <div
                key={workout.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {routine?.difficulty || 'Daily'} Workout
                    </p>
                    <p className="text-sm text-gray-600">
                      {workout.completedAt && formatDistanceToNow(new Date(workout.completedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  {workout.actualXP && (
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-700">
                        +{workout.actualXP.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {workout.actualCoins && (
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-yellow-600">
                        +{workout.actualCoins}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
