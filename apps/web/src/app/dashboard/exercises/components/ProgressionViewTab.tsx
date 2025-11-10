'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, CheckCircle2, PlayCircle, Book } from 'lucide-react';
import { FIG_PROGRESSIONS, type MasteryGoal } from '@/lib/fig-level-progressions';
import exercisesData from '@/data/exercises.json';
import { Exercise } from './exercise-utils';
import ProgressionExerciseCard from './ProgressionExerciseCard';

interface ProgressionViewTabProps {
  selectedSkill: MasteryGoal | null;
  userCurrentLevel: string;
  onBack: () => void;
  onStartTraining: (skillBranch: MasteryGoal, level: string) => void;
}

const LEVEL_COLORS = {
  BEGINNER: 'bg-blue-500',
  INTERMEDIATE: 'bg-yellow-500',
  ADVANCED: 'bg-orange-500',
  ELITE: 'bg-purple-600',
};

export default function ProgressionViewTab({
  selectedSkill,
  userCurrentLevel,
  onBack,
  onStartTraining,
}: ProgressionViewTabProps) {
  // Helper function to find exercises by ID
  const findExercisesByIds = (exerciseIds: string[]): Exercise[] => {
    const exercises = exercisesData as Exercise[];
    return exerciseIds
      .map(id => exercises.find(ex => ex.id === id))
      .filter((ex): ex is Exercise => ex !== undefined);
  };

  if (!selectedSkill) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-muted-foreground mb-4">Select a skill from the Skill Paths tab to view its progression</p>
        <Button onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Skill Paths
        </Button>
      </div>
    );
  }

  const progression = FIG_PROGRESSIONS.find(p => p.goal === selectedSkill);
  if (!progression) return null;

  const currentLevelIndex = progression.steps.findIndex(s => s.level === userCurrentLevel);

  return (
    <div className="space-y-8">
      {/* Header with Back Button */}
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Skill Paths
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">{progression.name}</h2>
            <p className="text-muted-foreground">
              Complete each level to unlock the next stage of your progression
            </p>
          </div>
          <Badge className="text-lg px-4 py-2">
            {progression.category}
          </Badge>
        </div>
      </div>

      {/* Current Level Badge */}
      <Card className="border-2 border-primary">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className={`${LEVEL_COLORS[userCurrentLevel as keyof typeof LEVEL_COLORS]} text-white px-4 py-2 rounded-lg font-bold`}>
              {userCurrentLevel}
            </div>
            <div>
              <p className="font-semibold">Your Current Level</p>
              <p className="text-sm text-muted-foreground">Keep training to unlock advanced levels</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progression Steps */}
      <div className="space-y-6">
        {progression.steps.map((step, index) => {
          const isCompleted = index < currentLevelIndex;
          const isCurrent = index === currentLevelIndex;
          const isLocked = index > currentLevelIndex;

          return (
            <Card
              key={step.level}
              className={`
                ${isCurrent ? 'border-2 border-primary shadow-lg' : ''}
                ${isLocked ? 'opacity-60' : ''}
              `}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {isCompleted && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                    {isCurrent && <PlayCircle className="h-6 w-6 text-primary" />}
                    {isLocked && <Lock className="h-6 w-6 text-muted-foreground" />}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{step.level}</CardTitle>
                        {isCurrent && <Badge variant="default">Current</Badge>}
                        {isCompleted && <Badge variant="outline" className="border-green-500 text-green-500">Completed</Badge>}
                        {isLocked && <Badge variant="outline">Locked</Badge>}
                      </div>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Key Exercises with GIFs */}
                  <div>
                    <p className="text-sm font-semibold mb-3">Key Exercises:</p>
                    <div className="space-y-2">
                      {(() => {
                        const exercises = findExercisesByIds(step.exerciseIds);
                        if (exercises.length > 0) {
                          return exercises.map((exercise) => (
                            <ProgressionExerciseCard key={exercise.id} exercise={exercise} />
                          ));
                        } else {
                          return (
                            <div className="bg-muted p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Exercise details will be available soon for:
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {step.exerciseIds.map((exerciseId) => (
                                  <Badge key={exerciseId} variant="secondary">
                                    {exerciseId.replace(/-/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isLocked && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => onStartTraining(selectedSkill, step.level)}
                        disabled={isCompleted}
                        className="flex-1"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        {isCompleted ? 'Completed' : isCurrent ? 'Start Training' : 'Train This Level'}
                      </Button>
                      <Button variant="outline">
                        <Book className="h-4 w-4 mr-2" />
                        View Guide
                      </Button>
                    </div>
                  )}

                  {isLocked && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Complete {progression.steps[index - 1]?.level} level to unlock this progression
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
