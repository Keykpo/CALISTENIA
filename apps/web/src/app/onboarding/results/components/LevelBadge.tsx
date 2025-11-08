'use client';

import { Card } from '@/components/ui/card';
import { Trophy, Award, Star, Crown } from 'lucide-react';

type FitnessLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

interface LevelBadgeProps {
  level: FitnessLevel;
  percentage?: number; // Optional percentage for progress bar
}

const levelConfig: Record<FitnessLevel, {
  label: string;
  description: string;
  icon: typeof Trophy;
  gradient: string;
  textColor: string;
}> = {
  BEGINNER: {
    label: 'Beginner',
    description: 'Starting your calisthenics journey with foundational movements',
    icon: Trophy,
    gradient: 'from-green-400 to-emerald-600',
    textColor: 'text-green-700',
  },
  INTERMEDIATE: {
    label: 'Intermediate',
    description: 'Building strength and mastering core exercises',
    icon: Award,
    gradient: 'from-blue-400 to-blue-600',
    textColor: 'text-blue-700',
  },
  ADVANCED: {
    label: 'Advanced',
    description: 'Pushing limits with advanced skills and techniques',
    icon: Star,
    gradient: 'from-purple-400 to-purple-600',
    textColor: 'text-purple-700',
  },
  ELITE: {
    label: 'Elite',
    description: 'Mastering the most challenging calisthenics movements',
    icon: Crown,
    gradient: 'from-amber-400 to-orange-600',
    textColor: 'text-amber-700',
  },
};

export default function LevelBadge({ level, percentage }: LevelBadgeProps) {
  const config = levelConfig[level];
  const Icon = config.icon;

  // Calculate percentage if not provided (fallback for backward compatibility)
  const displayPercentage = percentage !== undefined
    ? percentage
    : level === 'BEGINNER' ? 25 : level === 'INTERMEDIATE' ? 50 : level === 'ADVANCED' ? 75 : 100;

  return (
    <Card className="p-6 relative overflow-hidden">
      {/* Background gradient effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-10`}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-16 h-16 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-600 font-medium">Your Calisthenics Level</p>
            <h2 className={`text-3xl font-bold ${config.textColor}`}>
              {config.label}
            </h2>
          </div>
        </div>

        <p className="text-slate-700 leading-relaxed">
          {config.description}
        </p>

        {/* Level indicator */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-1000 ease-out`}
              style={{
                width: `${Math.min(displayPercentage, 100)}%`,
              }}
            />
          </div>
          <span className="text-xs font-medium text-slate-600">
            {Math.round(displayPercentage)}%
          </span>
        </div>
      </div>
    </Card>
  );
}
