'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  Trophy,
  Lock,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Activity,
  Flame
} from 'lucide-react';
import {
  FIG_PROGRESSIONS,
  DifficultyLevel,
  MasteryGoal,
  SkillProgression
} from '@/lib/fig-level-progressions';

interface FigLevelSkillPathProps {
  userLevel: DifficultyLevel;
  userId?: string;
}

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  BEGINNER: 'bg-green-100 text-green-800 border-green-300',
  INTERMEDIATE: 'bg-blue-100 text-blue-800 border-blue-300',
  ADVANCED: 'bg-purple-100 text-purple-800 border-purple-300',
  ELITE: 'bg-red-100 text-red-800 border-red-300',
};

const CATEGORY_ICONS: Record<string, any> = {
  BALANCE: Activity,
  STRENGTH: Dumbbell,
  SKILL_STATIC: Target,
  CORE: Flame,
};

const CATEGORY_NAMES: Record<string, string> = {
  BALANCE: 'Balance & Handstands',
  STRENGTH: 'Strength & Power',
  SKILL_STATIC: 'Static Holds',
  CORE: 'Core & Conditioning',
};

export default function FigLevelSkillPath({ userLevel, userId }: FigLevelSkillPathProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('BALANCE');

  // Group progressions by category
  const progressionsByCategory = FIG_PROGRESSIONS.reduce((acc, prog) => {
    if (!acc[prog.category]) acc[prog.category] = [];
    acc[prog.category].push(prog);
    return acc;
  }, {} as Record<string, SkillProgression[]>);

  const categories = Object.keys(progressionsByCategory);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">FIG Level Skill Path</h2>
        <p className="text-slate-600 mt-1">
          Progress through official calisthenics progressions based on FIG standards
        </p>
      </div>

      {/* User Level Badge */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600">Your Current Level:</span>
        <Badge className={`${DIFFICULTY_COLORS[userLevel]} border text-sm px-3 py-1`}>
          {userLevel}
        </Badge>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category] || Target;
            return (
              <TabsTrigger key={category} value={category} className="gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{CATEGORY_NAMES[category] || category}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {progressionsByCategory[category].map((progression) => (
                <ProgressionCard
                  key={progression.goal}
                  progression={progression}
                  userLevel={userLevel}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface ProgressionCardProps {
  progression: SkillProgression;
  userLevel: DifficultyLevel;
}

function ProgressionCard({ progression, userLevel }: ProgressionCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Find user's current step
  const userStepIndex = progression.steps.findIndex(step => step.level === userLevel);
  const currentStep = userStepIndex >= 0 ? progression.steps[userStepIndex] : null;
  const progressPercentage = currentStep
    ? ((userStepIndex + 1) / progression.steps.length) * 100
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{progression.name}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {CATEGORY_NAMES[progression.category]}
            </CardDescription>
          </div>
          <Trophy className="w-5 h-5 text-amber-500" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Progress</span>
            <span className="font-semibold">
              {userStepIndex + 1} / {progression.steps.length} levels
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Current Step */}
        {currentStep && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Your Current Level</span>
            </div>
            <Badge className={`${DIFFICULTY_COLORS[currentStep.level]} border text-xs mb-2`}>
              {currentStep.level}
            </Badge>
            <p className="text-xs text-slate-700">{currentStep.description}</p>
          </div>
        )}

        {/* All Steps */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full justify-between"
        >
          <span className="text-sm">
            {expanded ? 'Hide' : 'Show'} Full Progression
          </span>
          <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </Button>

        {expanded && (
          <div className="space-y-2 border-t pt-4">
            {progression.steps.map((step, index) => {
              const isCurrentLevel = step.level === userLevel;
              const isCompleted = index < userStepIndex;
              const isLocked = index > userStepIndex;

              return (
                <div
                  key={step.level}
                  className={`p-3 rounded-lg border ${
                    isCurrentLevel
                      ? 'bg-blue-50 border-blue-300'
                      : isCompleted
                      ? 'bg-green-50 border-green-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4 text-slate-400 mt-0.5" />
                    ) : (
                      <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${DIFFICULTY_COLORS[step.level]}`}
                        >
                          {step.level}
                        </Badge>
                        {isCurrentLevel && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-700">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
