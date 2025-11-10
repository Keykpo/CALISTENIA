'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock, Check } from 'lucide-react';

interface AchievementTier {
  tier: number;
  name: string;
  level: string;
  target: number;
  unit: string | null;
  xpReward: number;
  coinsReward: number;
  color: string;
}

interface ProgressiveAchievementCardProps {
  achievement: {
    id: string;
    key: string;
    name: string;
    description: string;
    category: string;
    type: string;
    iconUrl: string | null;
    currentValue: number;
    currentTier: number;
    currentTierData: AchievementTier | null;
    nextTier: AchievementTier | null;
    progressToNextTier: number;
    isComplete: boolean;
    tiers: AchievementTier[];
    completedAt: {
      tier1: Date | null;
      tier2: Date | null;
      tier3: Date | null;
      tier4: Date | null;
    };
  };
}

export function ProgressiveAchievementCard({ achievement }: ProgressiveAchievementCardProps) {
  const {
    name,
    description,
    iconUrl,
    currentValue,
    currentTier,
    nextTier,
    progressToNextTier,
    isComplete,
    tiers,
    completedAt,
  } = achievement;

  // Get the color for the current or next tier
  const displayColor = currentTier > 0
    ? tiers[currentTier - 1]?.color || '#10b981'
    : nextTier?.color || '#10b981';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-3xl">{iconUrl || '🏆'}</div>
            <div className="flex-1">
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription className="text-sm mt-1">{description}</CardDescription>
            </div>
          </div>
          {currentTier > 0 && (
            <Trophy className="h-5 w-5 flex-shrink-0" style={{ color: displayColor }} />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Progress: <span className="font-medium text-foreground">{Math.round(currentValue)}</span>
              {nextTier && (
                <span className="text-muted-foreground"> / {nextTier.target} {nextTier.unit}</span>
              )}
            </span>
            {!isComplete && nextTier && (
              <span className="font-medium">{Math.round(progressToNextTier)}%</span>
            )}
          </div>

          {!isComplete && nextTier && (
            <Progress
              value={progressToNextTier}
              className="h-2"
              style={{
                ['--progress-background' as any]: displayColor,
              }}
            />
          )}
        </div>

        {/* Tier Badges */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tiers.map((tier) => {
            const isUnlocked = currentTier >= tier.tier;
            const completionDate = (completedAt as any)[`tier${tier.tier}`];

            return (
              <div
                key={tier.tier}
                className={`relative rounded-lg border-2 p-3 text-center transition-all ${
                  isUnlocked
                    ? 'border-current shadow-sm'
                    : 'border-gray-200 opacity-50'
                }`}
                style={{
                  borderColor: isUnlocked ? tier.color : undefined,
                  backgroundColor: isUnlocked ? `${tier.color}10` : undefined,
                }}
              >
                {/* Tier Number Badge */}
                <div
                  className="mx-auto w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mb-1"
                  style={{ backgroundColor: tier.color }}
                >
                  {isUnlocked ? <Check className="h-4 w-4" /> : <Lock className="h-3 w-3" />}
                </div>

                {/* Tier Name */}
                <div className="text-xs font-medium" style={{ color: isUnlocked ? tier.color : undefined }}>
                  {tier.name}
                </div>

                {/* Target */}
                <div className="text-xs text-muted-foreground mt-1">
                  {tier.target} {tier.unit}
                </div>

                {/* Checkmark for completed */}
                {isUnlocked && (
                  <div className="absolute -top-1 -right-1">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: tier.color }}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Next Tier Info */}
        {!isComplete && nextTier && (
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Next Tier: {nextTier.name}</span>
              <Badge style={{ backgroundColor: nextTier.color, color: 'white' }}>
                Tier {nextTier.tier}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round(nextTier.target - currentValue)} more {nextTier.unit} to unlock
            </div>
            <div className="text-xs text-muted-foreground">
              Rewards: +{nextTier.xpReward} XP, +{nextTier.coinsReward} coins
            </div>
          </div>
        )}

        {/* Completed Message */}
        {isComplete && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-3 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-medium">All Tiers Completed!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
