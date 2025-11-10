'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trophy, Coins, Clock, Repeat, Star, Check, Plus, BookOpen, Play } from 'lucide-react';
import { Exercise, formatRank, getRankColorClass, categoryLabels } from './exercise-utils';
import Image from 'next/image';

interface ExerciseCardProps {
  exercise: Exercise;
  isCompleted: boolean;
  isFavorite: boolean;
  onToggleCompleted: () => void;
  onToggleFavorite: () => void;
  onViewGuide?: () => void;
}

export default function ExerciseCard({
  exercise,
  isCompleted,
  isFavorite,
  onToggleCompleted,
  onToggleFavorite,
  onViewGuide,
}: ExerciseCardProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showGif, setShowGif] = useState(false);

  return (
    <Card className={`hover:shadow-lg transition-all ${isCompleted ? 'border-green-500' : ''} group`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {exercise.name}
              </CardTitle>
              {isCompleted && (
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className={getRankColorClass(exercise.rank, exercise.difficulty)}>
                {formatRank(exercise.rank, exercise.difficulty)}
              </Badge>
              <Badge variant="outline">
                {categoryLabels[exercise.category as keyof typeof categoryLabels] || exercise.category}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            className={isFavorite ? 'text-yellow-500' : ''}
          >
            <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <CardDescription className="line-clamp-2">{exercise.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* GIF Preview */}
          {exercise.gifUrl && (
            <div
              className="relative w-full h-48 bg-muted rounded-lg overflow-hidden cursor-pointer group/gif"
              onClick={() => setShowGif(!showGif)}
            >
              {showGif ? (
                <img
                  src={exercise.gifUrl}
                  alt={exercise.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-12 w-12 text-muted-foreground mx-auto mb-2 group-hover/gif:text-primary transition-colors" />
                    <p className="text-sm text-muted-foreground">Click to preview exercise</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rewards */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold">{exercise.expReward} EXP</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="font-semibold">{exercise.coinsReward} Coins</span>
            </div>
          </div>

          {/* Unit type */}
          <div className="flex items-center gap-2 text-sm">
            {exercise.unit === 'reps' ? (
              <Repeat className="w-4 h-4 text-blue-500" />
            ) : (
              <Clock className="w-4 h-4 text-purple-500" />
            )}
            <span>
              {exercise.unit === 'reps' ? 'Repetitions' : 'Time (seconds)'}
            </span>
          </div>

          {/* Muscle Groups */}
          <div className="flex flex-wrap gap-1">
            {exercise.muscleGroups.slice(0, 3).map((muscle) => (
              <Badge key={muscle} variant="secondary" className="text-xs">
                {muscle}
              </Badge>
            ))}
            {exercise.muscleGroups.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{exercise.muscleGroups.length - 3}
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={isCompleted ? "outline" : "default"}
              size="sm"
              onClick={onToggleCompleted}
              className="w-full"
            >
              {isCompleted ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Completed
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Complete
                </>
              )}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedExercise(exercise)}
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedExercise?.name}</DialogTitle>
                  <DialogDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className={getRankColorClass(selectedExercise?.rank, selectedExercise?.difficulty)}>
                        {formatRank(selectedExercise?.rank, selectedExercise?.difficulty)}
                      </Badge>
                      <Badge variant="outline">
                        {
                          categoryLabels[
                            selectedExercise?.category as keyof typeof categoryLabels
                          ] || selectedExercise?.category
                        }
                      </Badge>
                    </div>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* GIF */}
                  {selectedExercise?.gifUrl && (
                    <div className="w-full">
                      <h3 className="font-semibold text-lg mb-2">Exercise Demo</h3>
                      <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={selectedExercise.gifUrl}
                          alt={selectedExercise.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-muted-foreground">{selectedExercise?.description}</p>
                  </div>

                  {/* Rewards */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Rewards</h3>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold">{selectedExercise?.expReward} EXP</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold">
                          {selectedExercise?.coinsReward} Coins
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Muscle Groups & Equipment */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Muscle Groups</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedExercise?.muscleGroups.map((muscle) => (
                          <Badge key={muscle} variant="secondary">
                            {muscle}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Equipment</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedExercise?.equipment.map((equip) => (
                          <Badge key={equip} variant="outline">
                            {equip === 'NONE'
                              ? 'No Equipment'
                              : equip.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">How To Perform</h3>
                    {selectedExercise?.instructions && selectedExercise.instructions.length > 0 ? (
                      <div className="bg-muted p-4 rounded-lg">
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          {selectedExercise.instructions.map((step, idx) => (
                            <li key={idx} className="text-muted-foreground">{step}</li>
                          ))}
                        </ol>
                      </div>
                    ) : selectedExercise?.howTo ? (
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground space-y-2">
                          {selectedExercise.howTo.split('\n').map((line, idx) => (
                            <p key={idx}>{line}</p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          No instructions available yet for this exercise.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Coaching Tip */}
                  {(selectedExercise as any)?.coachingTip && (
                    <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 rounded">
                      <h3 className="font-semibold text-lg mb-2 text-blue-900 dark:text-blue-100">
                        💡 Coaching Tip
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {(selectedExercise as any).coachingTip}
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
