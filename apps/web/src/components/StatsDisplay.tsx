'use client';

import { Zap, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatsDisplayProps {
  xp?: number;
  coins?: number;
  level?: number;
  variant?: 'default' | 'compact' | 'large';
  showLabels?: boolean;
  className?: string;
}

export default function StatsDisplay({
  xp = 0,
  coins = 0,
  level,
  variant = 'default',
  showLabels = true,
  className = ''
}: StatsDisplayProps) {

  const sizeClasses = {
    compact: {
      container: 'gap-2',
      icon: 'w-3 h-3',
      text: 'text-xs',
      badge: 'px-2 py-0.5'
    },
    default: {
      container: 'gap-3',
      icon: 'w-4 h-4',
      text: 'text-sm',
      badge: 'px-3 py-1'
    },
    large: {
      container: 'gap-4',
      icon: 'w-5 h-5',
      text: 'text-base',
      badge: 'px-4 py-2'
    }
  };

  const sizes = sizeClasses[variant];

  return (
    <div className={`flex items-center ${sizes.container} ${className}`}>
      {level !== undefined && (
        <Badge
          variant="outline"
          className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 font-bold ${sizes.badge}`}
        >
          <span className={sizes.text}>Lv {level}</span>
        </Badge>
      )}

      {xp !== undefined && (
        <Badge
          variant="outline"
          className={`bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 text-purple-700 ${sizes.badge}`}
        >
          <div className="flex items-center gap-1.5">
            <Zap className={`${sizes.icon} fill-purple-500 text-purple-500`} />
            {showLabels && <span className={`${sizes.text} font-medium`}>XP:</span>}
            <span className={`${sizes.text} font-bold`}>{xp.toLocaleString()}</span>
          </div>
        </Badge>
      )}

      {coins !== undefined && (
        <Badge
          variant="outline"
          className={`bg-gradient-to-r from-amber-50 to-yellow-100 border-amber-200 text-amber-700 ${sizes.badge}`}
        >
          <div className="flex items-center gap-1.5">
            <Award className={`${sizes.icon} fill-amber-500 text-amber-500`} />
            {showLabels && <span className={`${sizes.text} font-medium`}>Coins:</span>}
            <span className={`${sizes.text} font-bold`}>{coins.toLocaleString()}</span>
          </div>
        </Badge>
      )}
    </div>
  );
}
