'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Play, BookOpen, Trophy, Coins } from 'lucide-react';
import { Exercise } from './exercise-utils';

interface ProgressionExerciseCardProps {
  exercise: Exercise;
}

export default function ProgressionExerciseCard({ exercise }: ProgressionExerciseCardProps) {
  const [showGif, setShowGif] = useState(false);

  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* GIF Preview */}
          {exercise.gifUrl && (
            <div
              className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden cursor-pointer flex-shrink-0 group"
              onClick={() => setShowGif(!showGif)}
            >
              {showGif ? (
                <img
                  src={exercise.gifUrl}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1 truncate">{exercise.name}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {exercise.description}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="secondary" className="text-xs">
                {exercise.unit === 'reps' ? 'Reps' : 'Hold Time'}
              </Badge>
              <span className="text-muted-foreground flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {exercise.expReward}
              </span>
            </div>
          </div>

          {/* View Details Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="flex-shrink-0">
                <BookOpen className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{exercise.name}</DialogTitle>
                <DialogDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{exercise.category}</Badge>
                    <Badge variant="outline">{exercise.difficulty || 'N/A'}</Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* GIF */}
                {exercise.gifUrl && (
                  <div className="w-full">
                    <h3 className="font-semibold text-lg mb-2">Exercise Demo</h3>
                    <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                      <img
                        src={exercise.gifUrl}
                        alt={exercise.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-muted-foreground">{exercise.description}</p>
                </div>

                {/* Rewards */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Rewards</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold">{exercise.expReward} EXP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-amber-500" />
                      <span className="font-semibold">{exercise.coinsReward} Coins</span>
                    </div>
                  </div>
                </div>

                {/* Muscle Groups & Equipment */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Muscle Groups</h3>
                    <div className="flex flex-wrap gap-2">
                      {exercise.muscleGroups.map((muscle) => (
                        <Badge key={muscle} variant="secondary">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Equipment</h3>
                    <div className="flex flex-wrap gap-2">
                      {exercise.equipment.map((equip) => (
                        <Badge key={equip} variant="outline">
                          {equip === 'NONE' ? 'No Equipment' : equip.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">How To Perform</h3>
                  {exercise.instructions && exercise.instructions.length > 0 ? (
                    <div className="bg-muted p-4 rounded-lg">
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        {exercise.instructions.map((step, idx) => (
                          <li key={idx} className="text-muted-foreground">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : exercise.howTo ? (
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground space-y-2">
                        {exercise.howTo.split('\n').map((line, idx) => (
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
                {(exercise as any).coachingTip && (
                  <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 rounded">
                    <h3 className="font-semibold text-lg mb-2 text-blue-900 dark:text-blue-100">
                      💡 Coaching Tip
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {(exercise as any).coachingTip}
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
