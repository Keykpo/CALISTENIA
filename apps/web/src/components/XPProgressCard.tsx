'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap } from 'lucide-react';
import { getLevelFromXP, XP_THRESHOLDS, type ProgressionLevel, type HexagonAxis } from '@/lib/hexagon-progression';

interface XPProgressCardProps {
  axis: HexagonAxis;
  currentXP: number;
  axisLabel: string;
  showDetails?: boolean;
  compact?: boolean;
}

const AXIS_LABELS: Record<HexagonAxis, string> = {
  relativeStrength: 'Relative Strength',
  muscularEndurance: 'Muscular Endurance',
  balanceControl: 'Balance & Control',
  jointMobility: 'Joint Mobility',
  bodyTension: 'Body Tension',
  skillTechnique: 'Skill Technique',
};

const LEVEL_COLORS: Record<ProgressionLevel, { bg: string; text: string; border: string }> = {
  BEGINNER: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  INTERMEDIATE: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  ADVANCED: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  ELITE: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
};

export default function XPProgressCard({
  axis,
  currentXP,
  axisLabel,
  showDetails = true,
  compact = false
}: XPProgressCardProps) {
  const currentLevel = getLevelFromXP(currentXP);
  const levelThresholds = XP_THRESHOLDS[currentLevel];

  // Calculate progress within current level
  const xpInCurrentLevel = currentXP - levelThresholds.min;
  const xpNeededForLevel = levelThresholds.max === Infinity
    ? 100000 // For ELITE, show progress out of 100k as arbitrary cap
    : levelThresholds.max - levelThresholds.min;

  const progressPercentage = Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100);

  // Next level info
  const levels: ProgressionLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'];
  const currentLevelIndex = levels.indexOf(currentLevel);
  const nextLevel = currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : null;
  const xpToNextLevel = nextLevel ? XP_THRESHOLDS[nextLevel].min - currentXP : 0;

  const levelStyle = LEVEL_COLORS[currentLevel];

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">{axisLabel}</span>
          <Badge
            variant="outline"
            className={`${levelStyle.bg} ${levelStyle.text} ${levelStyle.border}`}
          >
            {currentLevel}
          </Badge>
        </div>
        <div className="space-y-1">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-slate-600">
            <span>{currentXP.toLocaleString()} XP</span>
            {nextLevel && (
              <span className="text-slate-500">
                {xpToNextLevel.toLocaleString()} to {nextLevel}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{axisLabel || AXIS_LABELS[axis]}</CardTitle>
          <Badge
            variant="outline"
            className={`${levelStyle.bg} ${levelStyle.text} ${levelStyle.border} font-bold`}
          >
            {currentLevel}
          </Badge>
        </div>
        {showDetails && (
          <CardDescription>
            {currentXP.toLocaleString()} / {levelThresholds.max === Infinity ? '∞' : levelThresholds.max.toLocaleString()} XP
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="font-semibold text-blue-600">{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {showDetails && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-slate-600">
                <Zap className="w-3 h-3" />
                <span>Current XP</span>
              </div>
              <div className="font-semibold text-slate-900">
                {currentXP.toLocaleString()}
              </div>
            </div>

            {nextLevel && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-slate-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>To {nextLevel}</span>
                </div>
                <div className="font-semibold text-blue-600">
                  {xpToNextLevel.toLocaleString()} XP
                </div>
              </div>
            )}
          </div>
        )}

        {!nextLevel && currentLevel === 'ELITE' && showDetails && (
          <div className="text-center py-2">
            <p className="text-sm font-semibold text-amber-600">
              🏆 Maximum Level Reached!
            </p>
            <p className="text-xs text-slate-600 mt-1">
              You've achieved ELITE status in this skill
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
