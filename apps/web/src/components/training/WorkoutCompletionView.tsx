'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Coins,
  Target,
  Flame,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Home,
  Award,
} from 'lucide-react';

interface Rewards {
  totalXP: number;
  totalCoins: number;
  hexagonXP: Record<string, number>;
  hexagonImprovement?: Record<string, number>;
  baseXP?: number;
  baseCoins?: number;
  streakBonus?: number;
}

interface StreakInfo {
  current: number;
  longest: number;
  bonus: number;
  nextMilestone: {
    days: number;
    name: string;
    description: string;
    bonusPercent: number;
    icon: string;
  } | null;
}

interface AchievementInfo {
  completed: Array<{
    achievementId: string;
    progress: number;
    completed: boolean;
    justCompleted?: boolean;
  }>;
  progress: Array<{
    achievementId: string;
    progress: number;
    completed: boolean;
  }>;
  unlockedNext: Array<{
    id: string;
    name: string;
    chainName: string;
  }>;
}

interface WorkoutCompletionViewProps {
  rewards: Rewards;
  streakInfo: StreakInfo | null;
  achievements?: AchievementInfo;
  onContinueTraining: () => void;
  onFinishDay: () => void;
}

const HEXAGON_AXIS_NAMES: Record<string, string> = {
  balance: 'Balance',
  strength: 'Strength',
  staticHolds: 'Static Holds',
  core: 'Core',
  endurance: 'Endurance',
  mobility: 'Mobility',
  // Legacy names for backwards compatibility
  relativeStrength: 'Relative Strength',
  muscularEndurance: 'Muscular Endurance',
  balanceControl: 'Balance Control',
  jointMobility: 'Joint Mobility',
  bodyTension: 'Body Tension',
  skillTechnique: 'Skill Technique',
};

export function WorkoutCompletionView({
  rewards,
  streakInfo,
  achievements,
  onContinueTraining,
  onFinishDay,
}: WorkoutCompletionViewProps) {
  const [showDetails, setShowDetails] = useState(false);

  const completedAchievements = achievements?.completed?.filter((a) => a.justCompleted) || [];
  const unlockedNext = achievements?.unlockedNext || [];

  return (
    <div className="space-y-6">
      {/* Main Completion Card */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <Trophy className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-5xl text-green-600 font-bold">
            Congratulations! Day {streakInfo?.current || 1} Complete
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Excellent work. You've earned great rewards.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Rewards - Always Visible */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border-2 border-yellow-200">
              <Trophy className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium mb-1">Total XP</p>
              <p className="text-4xl font-black text-yellow-600">
                +{rewards.totalXP.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border-2 border-yellow-200">
              <Coins className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium mb-1">Coins</p>
              <p className="text-4xl font-black text-yellow-500">+{rewards.totalCoins}</p>
            </div>
          </div>

          {/* Streak Info */}
          {streakInfo && streakInfo.current > 0 && (
            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-5 border-2 border-orange-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Flame className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Racha Actual</p>
                    <p className="text-4xl font-black text-orange-600">
                      {streakInfo.current} {streakInfo.current === 1 ? 'día' : 'días'}
                    </p>
                  </div>
                </div>
                {streakInfo.bonus > 0 && (
                  <div className="text-right bg-white/60 rounded-lg px-4 py-2">
                    <p className="text-xs text-gray-700 font-medium">Bonus Activo</p>
                    <p className="text-3xl font-bold text-orange-600">+{streakInfo.bonus}%</p>
                  </div>
                )}
              </div>
              {streakInfo.nextMilestone && (
                <div className="bg-white/60 rounded-lg p-3 text-center mt-3">
                  <p className="text-sm text-gray-700">
                    {streakInfo.nextMilestone.days - streakInfo.current} días más para{' '}
                    <span className="font-bold">{streakInfo.nextMilestone.name}</span>{' '}
                    {streakInfo.nextMilestone.icon}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Achievements Completed */}
          {completedAchievements.length > 0 && (
            <div className="bg-purple-50 rounded-xl p-5 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-purple-900">
                  ¡{completedAchievements.length} Achievement{completedAchievements.length > 1 ? 's' : ''} Completado{completedAchievements.length > 1 ? 's' : ''}!
                </h3>
              </div>
              {unlockedNext.length > 0 && (
                <p className="text-sm text-purple-700">
                  Desbloqueaste {unlockedNext.length} nuevo{unlockedNext.length > 1 ? 's' : ''} nivel{unlockedNext.length > 1 ? 'es' : ''}
                </p>
              )}
            </div>
          )}

          {/* Toggle Details Button */}
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {showDetails ? (
              <>
                <ChevronUp className="w-5 h-5 mr-2" />
                Ocultar Detalles
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5 mr-2" />
                Ver Progresos de Hoy
              </>
            )}
          </Button>

          {/* Detailed Progress - Collapsible */}
          {showDetails && (
            <div className="space-y-4 border-t-2 pt-4">
              {/* Rewards Breakdown */}
              {rewards.streakBonus && rewards.streakBonus > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300">
                  <h4 className="font-semibold mb-3 text-gray-900">Desglose de Recompensas</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Recompensas Base:</span>
                      <span className="font-medium">
                        +{rewards.baseXP} XP, +{rewards.baseCoins} Coins
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-700 font-medium">
                        Bonus de Racha (+{rewards.streakBonus}%):
                      </span>
                      <span className="font-bold text-orange-600">
                        +{(rewards.totalXP || 0) - (rewards.baseXP || 0)} XP, +
                        {(rewards.totalCoins || 0) - (rewards.baseCoins || 0)} Coins
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Hexagon XP Breakdown */}
              <div className="bg-white rounded-lg p-5 border-2 border-blue-200">
                <h4 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Progreso del Hexágono
                </h4>
                <div className="space-y-3">
                  {Object.entries(rewards.hexagonXP).map(([axis, xp]) => {
                    const totalXP = xp || 0;
                    const maxXP = Math.max(...Object.values(rewards.hexagonXP));
                    const percentage = maxXP > 0 ? (totalXP / maxXP) * 100 : 0;
                    const improvementPercent = rewards.hexagonImprovement?.[axis] || 0;

                    return (
                      <div key={axis}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {HEXAGON_AXIS_NAMES[axis] || axis}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-blue-600">+{totalXP} XP</span>
                            {improvementPercent > 0 && (
                              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                                +{improvementPercent.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Achievements Progress */}
              {achievements && achievements.progress.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                  <h4 className="font-semibold mb-3 text-gray-900">
                    Progreso de Achievements
                  </h4>
                  <p className="text-sm text-gray-600">
                    {achievements.progress.length} achievement{achievements.progress.length > 1 ? 's' : ''} en progreso
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t-2">
            <Button onClick={onContinueTraining} size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-14">
              <Dumbbell className="w-6 h-6 mr-2" />
              Voy a seguir haciendo ejercicios
            </Button>
            <Button
              onClick={onFinishDay}
              variant="outline"
              size="lg"
              className="w-full text-lg h-14"
            >
              <Home className="w-6 h-6 mr-2" />
              Parar por hoy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
