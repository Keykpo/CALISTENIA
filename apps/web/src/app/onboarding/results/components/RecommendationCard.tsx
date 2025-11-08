'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Target, TrendingUp } from 'lucide-react';

interface Exercise {
  name: string;
  difficulty: string;
  category: string;
  description?: string;
}

interface RecommendationCardProps {
  exercise: Exercise;
  index: number;
}

const categoryIcons: Record<string, typeof Dumbbell> = {
  push: Dumbbell,
  pull: Target,
  legs: TrendingUp,
  core: Target,
  default: Dumbbell,
};

const difficultyColors: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-blue-100 text-blue-700',
  ADVANCED: 'bg-purple-100 text-purple-700',
  EXPERT: 'bg-amber-100 text-amber-700',
};

export default function RecommendationCard({ exercise, index }: RecommendationCardProps) {
  const Icon = categoryIcons[exercise.category?.toLowerCase()] || categoryIcons.default;
  const difficultyColor = difficultyColors[exercise.difficulty] || difficultyColors.BEGINNER;

  return (
    <Card
      className="p-4 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500"
      style={{
        animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-slate-900 leading-tight">
              {exercise.name}
            </h4>
            <Badge variant="secondary" className={difficultyColor}>
              {exercise.difficulty}
            </Badge>
          </div>

          {exercise.description && (
            <p className="text-sm text-slate-600 leading-relaxed">
              {exercise.description}
            </p>
          )}

          {exercise.category && (
            <div className="mt-2">
              <span className="text-xs text-slate-500 font-medium">
                Category: {exercise.category}
              </span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Card>
  );
}
