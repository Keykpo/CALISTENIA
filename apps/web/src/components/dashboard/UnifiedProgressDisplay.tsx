'use client';

import { SubLevel } from '@/lib/sublevel-to-xp';
import {
  sublevelToXPRange,
  getSubLevelProgress,
  getNextSubLevel,
  getXPToNextSubLevel,
  sublevelToTier,
  getTierColor,
  getSubLevelDescription,
  formatXP,
} from '@/lib/sublevel-to-xp';
import { TrendingUp, Target, Award } from 'lucide-react';

interface UnifiedProgressDisplayProps {
  subLevel: SubLevel;
  currentXP: number; // Strength XP from hexagon (can use any axis)
  className?: string;
}

/**
 * Unified Progress Display Component
 *
 * Shows user's current sublevel, tier, progress within level, and XP to next level
 * This is the single source of truth for user progression display
 */
export function UnifiedProgressDisplay({
  subLevel,
  currentXP,
  className = '',
}: UnifiedProgressDisplayProps) {
  const range = sublevelToXPRange(subLevel);
  const progress = getSubLevelProgress(currentXP, subLevel);
  const nextLevel = getNextSubLevel(subLevel);
  const xpToNext = getXPToNextSubLevel(currentXP, subLevel);
  const tier = sublevelToTier(subLevel);
  const tierColors = getTierColor(tier);
  const description = getSubLevelDescription(subLevel);

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-bold">{subLevel}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${tierColors.bg} ${tierColors.text} ${tierColors.border} border`}>
              {tier}
            </span>
          </div>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Current XP</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatXP(currentXP)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{formatXP(range.minXP)}</span>
          <span className="font-semibold">{progress.toFixed(1)}%</span>
          <span>{range.maxXP === Infinity ? '∞' : formatXP(range.maxXP)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
          <div
            className={`h-5 rounded-full transition-all duration-500 ease-out ${
              tier === 'BEGINNER'
                ? 'bg-gradient-to-r from-green-400 to-green-600'
                : tier === 'INTERMEDIATE'
                ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                : tier === 'ADVANCED'
                ? 'bg-gradient-to-r from-purple-400 to-purple-600'
                : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
            }`}
            style={{ width: `${progress}%` }}
          >
            <div className="w-full h-full bg-gradient-to-t from-black/10 to-transparent" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {/* Tier Level */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Award className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <p className="text-xs text-gray-500 uppercase tracking-wide">Tier Level</p>
          <p className="text-lg font-bold text-gray-900">
            {range.tierLevel} of {tier === 'BEGINNER' ? '3' : tier === 'INTERMEDIATE' ? '6' : '3'}
          </p>
        </div>

        {/* Next Level */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Target className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <p className="text-xs text-gray-500 uppercase tracking-wide">Next Level</p>
          <p className="text-lg font-bold text-gray-900">
            {nextLevel || 'MAX'}
          </p>
        </div>

        {/* XP Needed */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <p className="text-xs text-gray-500 uppercase tracking-wide">XP Needed</p>
          <p className="text-lg font-bold text-gray-900">
            {nextLevel ? formatXP(xpToNext) : '—'}
          </p>
        </div>
      </div>

      {/* Next Level Info */}
      {nextLevel && (
        <div className={`mt-6 p-4 rounded-lg ${tierColors.bg} ${tierColors.border} border-2`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${tierColors.text}`}>
                Next: {nextLevel}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {getSubLevelDescription(nextLevel)}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${tierColors.text}`}>
                {formatXP(xpToNext)}
              </p>
              <p className="text-xs text-gray-600">to level up</p>
            </div>
          </div>
        </div>
      )}

      {/* Max Level Badge */}
      {!nextLevel && (
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400">
          <div className="flex items-center justify-center gap-2">
            <Award className="w-6 h-6 text-yellow-600" />
            <p className="text-lg font-bold text-yellow-900">
              🏆 Maximum Level Achieved!
            </p>
          </div>
          <p className="text-sm text-yellow-700 text-center mt-2">
            You've reached peak performance. Continue training to maintain and refine your skills!
          </p>
        </div>
      )}
    </div>
  );
}
