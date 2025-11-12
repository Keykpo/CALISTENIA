'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Dumbbell, Flame, TrendingUp } from 'lucide-react';

interface QuickStats {
  totalWorkouts: number;
  currentStreak: number;
  totalXP: number;
  weeklyWorkouts: number;
}

export function TrainingQuickStats() {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch total workouts
      const workoutsRes = await fetch('/api/training/workout-sessions?status=COMPLETED');
      const workoutsData = await workoutsRes.json();
      const totalWorkouts = workoutsData.sessions?.length || 0;

      // Calculate weekly workouts (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyWorkouts = workoutsData.sessions?.filter((s: any) =>
        new Date(s.completedAt) >= weekAgo
      ).length || 0;

      // Fetch user stats for XP and streak
      const userRes = await fetch('/api/user/profile');
      const userData = await userRes.json();

      setStats({
        totalWorkouts,
        currentStreak: userData.user?.dailyStreak || 0,
        totalXP: userData.user?.totalXP || 0,
        weeklyWorkouts,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statsCards = [
    {
      title: 'Total Workouts',
      value: stats.totalWorkouts,
      icon: Dumbbell,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Total XP',
      value: stats.totalXP.toLocaleString(),
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'This Week',
      value: stats.weeklyWorkouts,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
