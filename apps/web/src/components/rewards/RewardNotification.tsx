'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Award, TrendingUp, Sparkles } from 'lucide-react';
import type { ExerciseReward } from '@/lib/exercise-rewards';

interface RewardNotificationProps {
  reward: ExerciseReward;
  exerciseName: string;
  show: boolean;
  onClose?: () => void;
  autoHideDuration?: number; // milliseconds
}

/**
 * Animated notification component that displays exercise rewards
 * Shows XP gained for each hexagon axis, total XP, and coins
 *
 * Usage:
 * ```tsx
 * <RewardNotification
 *   reward={rewardData}
 *   exerciseName="Push-ups"
 *   show={showReward}
 *   onClose={() => setShowReward(false)}
 *   autoHideDuration={3000}
 * />
 * ```
 */
export default function RewardNotification({
  reward,
  exerciseName,
  show,
  onClose,
  autoHideDuration = 3000,
}: RewardNotificationProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);

    if (show && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [show, autoHideDuration, onClose]);

  if (!visible) return null;

  // Map axis names to display labels and colors
  const axisDisplay: Record<string, { label: string; color: string; icon: string }> = {
    balance: { label: 'Balance', color: 'bg-blue-500', icon: '⚖️' },
    strength: { label: 'Strength', color: 'bg-red-500', icon: '💪' },
    staticHolds: { label: 'Static Holds', color: 'bg-purple-500', icon: '🎯' },
    core: { label: 'Core', color: 'bg-orange-500', icon: '🔥' },
    endurance: { label: 'Endurance', color: 'bg-green-500', icon: '⚡' },
    mobility: { label: 'Mobility', color: 'bg-cyan-500', icon: '🧘' },
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <Card className="w-80 bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-amber-400 shadow-2xl">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="text-white font-bold">Rewards Earned!</h3>
            </div>
            <button
              onClick={() => {
                setVisible(false);
                onClose?.();
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Exercise Name */}
          <p className="text-slate-300 text-sm mb-4">
            <strong className="text-white">{exerciseName}</strong>
            <Badge variant="outline" className="ml-2 text-xs border-amber-400 text-amber-400">
              {reward.difficulty}
            </Badge>
          </p>

          {/* Hexagon XP Breakdown */}
          <div className="space-y-2 mb-4">
            <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold">
              Hexagon Progress
            </p>
            {Object.entries(reward.hexagonXP).map(([axis, xp]) => {
              const axisInfo = axisDisplay[axis];
              if (!axisInfo || !xp) return null;

              return (
                <div key={axis} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${axisInfo.color}`} />
                    <span className="text-slate-200 text-sm">
                      {axisInfo.icon} {axisInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 font-bold text-sm">
                      +{xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Rewards */}
          <div className="pt-3 border-t border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-white font-semibold">Total XP</span>
              </div>
              <span className="text-purple-400 font-bold text-lg">
                +{reward.totalXP.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="text-white font-semibold">Coins</span>
              </div>
              <span className="text-amber-400 font-bold text-lg">
                +{reward.coins.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Encouraging Message */}
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-center text-slate-400 text-xs italic">
              Keep up the great work! 🚀
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Example usage in a component:
 *
 * ```tsx
 * const [showReward, setShowReward] = useState(false);
 * const [rewardData, setRewardData] = useState<ExerciseReward | null>(null);
 *
 * async function logExercise(name: string, reps: number) {
 *   const res = await fetch('/api/training/log-exercise', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ name, reps }),
 *   });
 *
 *   const data = await res.json();
 *
 *   if (data.ok && data.rewards) {
 *     setRewardData(data.rewards);
 *     setShowReward(true);
 *   }
 * }
 *
 * return (
 *   <>
 *     <button onClick={() => logExercise('Push-ups', 15)}>
 *       Complete Exercise
 *     </button>
 *
 *     {rewardData && (
 *       <RewardNotification
 *         reward={rewardData}
 *         exerciseName="Push-ups"
 *         show={showReward}
 *         onClose={() => setShowReward(false)}
 *       />
 *     )}
 *   </>
 * );
 * ```
 */
