'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Coins, CheckCircle2, Calendar, Flame, Target } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  xpReward: number;
  coinsReward: number;
  weekStart: string;
  weekEnd: string;
  userProgress: number;
  isCompleted: boolean;
  completedAt: string | null;
}

const CHALLENGE_TYPE_ICONS: Record<string, any> = {
  TOTAL_EXERCISES: Target,
  TRAINING_SESSIONS: Flame,
  SPECIFIC_SKILL: Trophy,
  XP_TARGET: Trophy,
  STREAK_MAINTAIN: Flame,
  CUSTOM: Target,
};

export default function WeeklyChallengesDisplay() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [weekStart, setWeekStart] = useState<string>('');
  const [weekEnd, setWeekEnd] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges');
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges || []);
        setWeekStart(data.weekStart);
        setWeekEnd(data.weekEnd);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = challenges.filter(c => c.isCompleted).length;
  const progressPercent = challenges.length > 0 ? (completedCount / challenges.length) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">Loading challenges...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Flame className="h-6 w-6 text-orange-600" />
                Weekly Challenges
              </CardTitle>
              <CardDescription className="text-base">
                Complete challenges to earn rewards and level up faster
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week Timeline */}
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {new Date(weekStart).toLocaleDateString()} - {new Date(weekEnd).toLocaleDateString()}
            </span>
          </div>

          {/* Overall Progress */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Weekly Progress</span>
              <Badge variant={progressPercent === 100 ? 'default' : 'secondary'}>
                {completedCount}/{challenges.length}
              </Badge>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {progressPercent === 100
                ? '🎉 All challenges completed! Amazing work!'
                : `${Math.round(progressPercent)}% complete - Keep pushing!`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Challenges List */}
      <div className="space-y-4">
        {challenges.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-semibold mb-2">No Challenges This Week</p>
              <p className="text-muted-foreground">
                New challenges will be available soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          challenges.map((challenge) => {
            const Icon = CHALLENGE_TYPE_ICONS[challenge.type] || Target;
            const progress = Math.min((challenge.userProgress / challenge.target) * 100, 100);

            return (
              <Card
                key={challenge.id}
                className={`hover:shadow-md transition-all ${
                  challenge.isCompleted ? 'border-2 border-green-500 bg-green-50' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {challenge.title}
                            {challenge.isCompleted && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                          </CardTitle>
                          <CardDescription>{challenge.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                          {challenge.userProgress} / {challenge.target}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Rewards */}
                    <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        <span className="font-semibold text-yellow-900">
                          +{challenge.xpReward} XP
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-amber-600" />
                        <span className="font-semibold text-amber-900">
                          +{challenge.coinsReward} Coins
                        </span>
                      </div>
                    </div>

                    {/* Completed Badge */}
                    {challenge.isCompleted && challenge.completedAt && (
                      <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-green-800">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="font-semibold">
                            Completed on {new Date(challenge.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Challenge Type Badge */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{challenge.type.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
