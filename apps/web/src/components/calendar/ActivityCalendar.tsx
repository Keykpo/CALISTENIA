'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Flame, CheckCircle2 } from 'lucide-react';

interface WorkoutDay {
  date: string; // ISO date string
  workoutCount: number;
  totalXP: number;
  totalCoins: number;
  completed: boolean;
}

interface ActivityCalendarProps {
  userId: string;
}

export function ActivityCalendar({ userId }: ActivityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activityData, setActivityData] = useState<Record<string, WorkoutDay>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);

  useEffect(() => {
    fetchActivityData();
  }, [userId, currentDate]);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch(
        `/api/activity/calendar?userId=${userId}&year=${year}&month=${month}`
      );

      if (response.ok) {
        const data = await response.json();
        setActivityData(data.activity || {});
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    return { daysInMonth, startingDayOfWeek };
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getActivityLevel = (workoutCount: number): string => {
    if (workoutCount === 0) return 'none';
    if (workoutCount === 1) return 'low';
    if (workoutCount === 2) return 'medium';
    return 'high';
  };

  const getActivityColor = (level: string): string => {
    switch (level) {
      case 'none':
        return 'bg-gray-100';
      case 'low':
        return 'bg-green-200';
      case 'medium':
        return 'bg-green-400';
      case 'high':
        return 'bg-green-600';
      default:
        return 'bg-gray-100';
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isCurrentMonth =
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();
  const today = new Date().getDate();

  // Calculate stats for the month
  const monthStats = Object.values(activityData).reduce(
    (acc, day) => ({
      totalWorkouts: acc.totalWorkouts + day.workoutCount,
      totalXP: acc.totalXP + day.totalXP,
      totalCoins: acc.totalCoins + day.totalCoins,
      daysActive: day.workoutCount > 0 ? acc.daysActive + 1 : acc.daysActive,
    }),
    { totalWorkouts: 0, totalXP: 0, totalCoins: 0, daysActive: 0 }
  );

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Activity Calendar
            </CardTitle>
            <CardDescription>
              Track your workout consistency over time
            </CardDescription>
          </div>
          <Button onClick={handleToday} variant="outline" size="sm">
            Today
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button onClick={handlePreviousMonth} variant="outline" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-xl font-bold">{monthName}</h3>
          <Button onClick={handleNextMonth} variant="outline" size="icon">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Month Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-gray-600 mb-1">Days Active</p>
            <p className="text-2xl font-bold text-blue-600">{monthStats.daysActive}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Workouts</p>
            <p className="text-2xl font-bold text-green-600">{monthStats.totalWorkouts}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <p className="text-xs text-gray-600 mb-1">XP Earned</p>
            <p className="text-2xl font-bold text-purple-600">{monthStats.totalXP.toLocaleString()}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <p className="text-xs text-gray-600 mb-1">Coins</p>
            <p className="text-2xl font-bold text-yellow-600">{monthStats.totalCoins}</p>
          </div>
        </div>

        {/* Calendar Grid */}
        <div>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dateStr = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day
              ).toISOString().split('T')[0];

              const dayData = activityData[dateStr];
              const activityLevel = getActivityLevel(dayData?.workoutCount || 0);
              const isToday = isCurrentMonth && day === today;
              const isFuture = new Date(dateStr) > new Date();

              return (
                <button
                  key={day}
                  onClick={() => dayData && setSelectedDay(dayData)}
                  disabled={isFuture}
                  className={`
                    aspect-square rounded-lg border-2 transition-all relative
                    ${isFuture ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                    ${isToday ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
                    ${getActivityColor(activityLevel)}
                    ${dayData ? 'hover:ring-2 hover:ring-blue-300' : ''}
                  `}
                >
                  <div className="flex flex-col items-center justify-center h-full p-1">
                    <span className={`text-sm font-semibold ${
                      activityLevel === 'medium' || activityLevel === 'high' ? 'text-white' : 'text-gray-700'
                    }`}>
                      {day}
                    </span>
                    {dayData && dayData.workoutCount > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <CheckCircle2 className={`w-3 h-3 ${
                          activityLevel === 'medium' || activityLevel === 'high' ? 'text-white' : 'text-green-600'
                        }`} />
                        {dayData.workoutCount > 1 && (
                          <span className={`text-xs font-bold ${
                            activityLevel === 'medium' || activityLevel === 'high' ? 'text-white' : 'text-green-600'
                          }`}>
                            ×{dayData.workoutCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <span className="text-xs font-medium">Less</span>
          <div className="flex gap-1">
            <div className="w-6 h-6 rounded bg-gray-100 border border-gray-200"></div>
            <div className="w-6 h-6 rounded bg-green-200 border border-gray-200"></div>
            <div className="w-6 h-6 rounded bg-green-400 border border-gray-200"></div>
            <div className="w-6 h-6 rounded bg-green-600 border border-gray-200"></div>
          </div>
          <span className="text-xs font-medium">More</span>
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">
                  {new Date(selectedDay.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {selectedDay.workoutCount} {selectedDay.workoutCount === 1 ? 'Workout' : 'Workouts'}
                </p>
              </div>
              <Button
                onClick={() => setSelectedDay(null)}
                variant="ghost"
                size="sm"
              >
                ×
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-xs text-gray-600">XP Earned</p>
                <p className="text-xl font-bold text-purple-600">+{selectedDay.totalXP.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-xs text-gray-600">Coins Earned</p>
                <p className="text-xl font-bold text-yellow-600">+{selectedDay.totalCoins}</p>
              </div>
            </div>
          </div>
        )}

        {/* Motivational Message */}
        {monthStats.daysActive === 0 && (
          <div className="text-center py-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <Flame className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-900 mb-2">No Activity This Month Yet</p>
            <p className="text-sm text-gray-600">
              Start your first workout today and build consistency!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
