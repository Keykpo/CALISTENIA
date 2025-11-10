'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Lock, CheckCircle2, TrendingUp, Dumbbell } from 'lucide-react';
import { FIG_PROGRESSIONS, type MasteryGoal } from '@/lib/fig-level-progressions';

interface SkillPathsTabProps {
  userSkillProgress: Record<string, { currentLevel: string; sessionsCompleted: number }>;
  onSelectSkill: (skill: MasteryGoal) => void;
}

const CATEGORY_COLORS = {
  BALANCE: 'bg-blue-500',
  STRENGTH: 'bg-red-500',
  SKILL_STATIC: 'bg-purple-500',
  CORE: 'bg-green-500',
};

const CATEGORY_ICONS = {
  BALANCE: '🤸',
  STRENGTH: '💪',
  SKILL_STATIC: '🧘',
  CORE: '🔥',
};

export default function SkillPathsTab({ userSkillProgress, onSelectSkill }: SkillPathsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProgressions = selectedCategory === 'all'
    ? FIG_PROGRESSIONS
    : FIG_PROGRESSIONS.filter(p => p.category === selectedCategory);

  const categories = Array.from(new Set(FIG_PROGRESSIONS.map(p => p.category)));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Skill Branches</h2>
        <p className="text-muted-foreground">
          Master 18 calisthenics skills from beginner to elite level. Each branch tracks your progress through 4 levels.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All Skills ({FIG_PROGRESSIONS.length})
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]} {category} ({FIG_PROGRESSIONS.filter(p => p.category === category).length})
          </Button>
        ))}
      </div>

      {/* Skill Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProgressions.map((progression) => {
          const progress = userSkillProgress[progression.goal] || { currentLevel: 'BEGINNER', sessionsCompleted: 0 };
          const currentStepIndex = progression.steps.findIndex(s => s.level === progress.currentLevel);
          const progressPercent = ((currentStepIndex + 1) / progression.steps.length) * 100;

          return (
            <Card
              key={progression.goal}
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => onSelectSkill(progression.goal)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{CATEGORY_ICONS[progression.category as keyof typeof CATEGORY_ICONS]}</span>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {progression.name}
                      </CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${CATEGORY_COLORS[progression.category as keyof typeof CATEGORY_COLORS]} text-white`}>
                        {progression.category}
                      </Badge>
                      <Badge variant="outline">
                        {progress.currentLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${CATEGORY_COLORS[progression.category as keyof typeof CATEGORY_COLORS]}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Current Step */}
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Current Step:</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {progression.steps[currentStepIndex]?.description || 'Start your journey'}
                    </p>
                  </div>

                  {/* Sessions Completed */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Sessions</span>
                    </div>
                    <span className="font-semibold">{progress.sessionsCompleted}</span>
                  </div>

                  {/* View Button */}
                  <Button className="w-full" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Progression Path
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
