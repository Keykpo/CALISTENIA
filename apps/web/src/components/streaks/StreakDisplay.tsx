'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Trophy, TrendingUp, Award, Sparkles } from 'lucide-react';
import type { StreakData, StreakMilestone } from '@/lib/streak-system';

interface StreakDisplayProps {
  userId: string;
  compact?: boolean;
}

export function StreakDisplay({ userId, compact = false }: StreakDisplayProps) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [milestones, setMilestones] = useState<Array<StreakMilestone & { reached: boolean; current: boolean }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakData();
  }, [userId]);

  const fetchStreakData = async () => {
    try {
      const [streakRes, milestonesRes] = await Promise.all([
        fetch(`/api/streaks?userId=${userId}`),
        fetch(`/api/streaks/milestones?userId=${userId}`),
      ]);

      if (streakRes.ok) {
        const data = await streakRes.json();
        setStreakData(data.streak);
      }

      if (milestonesRes.ok) {
        const data = await milestonesRes.json();
        setMilestones(data.milestones);
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={compact ? '' : 'shadow-lg border-2'}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading streak data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!streakData) return null;

  const progressToNextMilestone = streakData.nextMilestone
    ? (streakData.currentStreak / streakData.nextMilestone.days) * 100
    : 100;

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
        <div className="flex items-center gap-2">
          <Flame className={`w-8 h-8 ${streakData.currentStreak > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`} />
          <div>
            <p className="text-2xl font-bold text-orange-600">{streakData.currentStreak}</p>
            <p className="text-xs text-gray-600">day streak</p>
          </div>
        </div>

        {streakData.currentBonus > 0 && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            +{streakData.currentBonus}% bonus
          </Badge>
        )}

        {streakData.nextMilestone && (
          <div className="flex-1 ml-4">
            <p className="text-xs text-gray-600 mb-1">
              {streakData.nextMilestone.days - streakData.currentStreak} days to {streakData.nextMilestone.name}
            </p>
            <Progress value={progressToNextMilestone} className="h-2" />
          </div>
        )}
      </div>
    );
  }

  const currentMilestone = milestones.filter(m => m.reached).pop();

  return (
    <Card className="shadow-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Flame className={`w-6 h-6 ${streakData.currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
              Workout Streak
            </CardTitle>
            <CardDescription>
              Keep training daily to maintain your streak and earn bonuses!
            </CardDescription>
          </div>
          {streakData.currentBonus > 0 && (
            <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
              <Sparkles className="w-4 h-4 mr-1" />
              +{streakData.currentBonus}% Bonus
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Streak Display */}
        <div className="bg-white rounded-xl p-6 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-orange-600">
                  {streakData.currentStreak}
                </span>
                <span className="text-xl text-gray-600">
                  {streakData.currentStreak === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600">Longest Streak</p>
              <div className="flex items-baseline gap-2 justify-end">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="text-3xl font-bold text-gray-700">
                  {streakData.longestStreak}
                </span>
              </div>
            </div>
          </div>

          {streakData.currentStreak > 0 && (
            <div className="text-center text-sm text-orange-600 bg-orange-100 rounded-lg py-2">
              <Flame className="w-4 h-4 inline mr-1" />
              {streakData.daysUntilStreakLoss === 1
                ? "Train today to keep your streak!"
                : `${streakData.daysUntilStreakLoss} days until streak resets`
              }
            </div>
          )}
        </div>

        {/* Current Milestone */}
        {currentMilestone && (
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 border-2 border-yellow-300">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{currentMilestone.icon}</div>
              <div className="flex-1">
                <p className="font-bold text-lg text-gray-900">{currentMilestone.name}</p>
                <p className="text-sm text-gray-700">{currentMilestone.description}</p>
              </div>
              <Badge className="bg-yellow-500 text-white">Active</Badge>
            </div>
          </div>
        )}

        {/* Progress to Next Milestone */}
        {streakData.nextMilestone && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">
                Next: {streakData.nextMilestone.name}
              </p>
              <p className="text-sm text-gray-600">
                {streakData.currentStreak} / {streakData.nextMilestone.days} days
              </p>
            </div>
            <Progress value={progressToNextMilestone} className="h-3 mb-2" />
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{streakData.nextMilestone.days - streakData.currentStreak} days to go</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                +{streakData.nextMilestone.bonusPercent}% bonus when reached
              </span>
            </div>
          </div>
        )}

        {/* Milestones Grid */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5" />
            All Milestones
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.days}
                className={`p-3 rounded-lg border-2 transition-all ${
                  milestone.reached
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-1 filter grayscale-0">
                    {milestone.icon}
                  </div>
                  <p className={`text-xs font-semibold ${milestone.reached ? 'text-green-700' : 'text-gray-600'}`}>
                    {milestone.days} days
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{milestone.name}</p>
                  {milestone.reached && (
                    <Badge variant="outline" className="mt-2 text-xs bg-green-100 text-green-700 border-green-300">
                      +{milestone.bonusPercent}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Message */}
        {streakData.currentStreak === 0 && (
          <div className="text-center py-6 bg-blue-50 rounded-lg border-2 border-blue-200">
            <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-900 mb-2">Start Your Streak Today!</p>
            <p className="text-sm text-gray-600">
              Complete a workout to begin building your streak and earning bonuses.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
