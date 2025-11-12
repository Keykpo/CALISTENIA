'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ExerciseDetails } from '@/lib/exercise-database';

interface ExerciseDetailCardProps {
  exerciseName: string;
  sets: number;
  repsOrTime: number | string;
  rest: number;
  unit: 'reps' | 'time' | 'distance';
  difficulty?: string;
  trainingMode?: string;
  notes?: string;
  details?: ExerciseDetails | null;
  isCompact?: boolean;
}

export function ExerciseDetailCard({
  exerciseName,
  sets,
  repsOrTime,
  rest,
  unit,
  difficulty,
  trainingMode,
  notes,
  details,
  isCompact = false,
}: ExerciseDetailCardProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Main Exercise Info */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* GIF Display */}
          {details?.localGifPath ? (
            <div className="flex-shrink-0">
              <img
                src={details.localGifPath}
                alt={exerciseName}
                className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                loading="lazy"
                onError={(e) => {
                  // Fallback to external URL if local fails
                  const img = e.target as HTMLImageElement;
                  if (details.gifUrl && img.src !== details.gifUrl) {
                    img.src = details.gifUrl;
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <span className="text-2xl">💪</span>
            </div>
          )}

          {/* Exercise Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 capitalize">
              {exerciseName}
            </h3>

            {/* Sets/Reps/Rest */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary" className="font-medium">
                {sets} sets
              </Badge>
              <span className="text-gray-400">×</span>
              <Badge variant="secondary" className="font-medium">
                {repsOrTime} {unit === 'time' ? 'sec' : unit === 'reps' ? 'reps' : unit}
              </Badge>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{rest}s rest</span>
            </div>

            {/* Difficulty & Mode */}
            <div className="mt-2 flex flex-wrap gap-2">
              {difficulty && (
                <Badge variant="outline" className="capitalize">
                  {difficulty}
                </Badge>
              )}
              {trainingMode && (
                <Badge
                  variant={trainingMode === 'BUFFER' ? 'secondary' : 'default'}
                  className="text-xs"
                >
                  {trainingMode === 'BUFFER' ? 'Mode 1 (Buffer)' : 'Mode 2 (Failure)'}
                </Badge>
              )}
            </div>

            {/* Notes */}
            {notes && (
              <p className="mt-2 text-sm text-gray-600 italic">
                {notes}
              </p>
            )}

            {/* Muscles Targeted (if available) */}
            {details && (details.targetMuscles.length > 0 || details.secondaryMuscles.length > 0) && (
              <div className="mt-2 text-xs text-gray-500">
                {details.targetMuscles.length > 0 && (
                  <span>
                    <strong>Target:</strong> {details.targetMuscles.join(', ')}
                  </span>
                )}
                {details.secondaryMuscles.length > 0 && (
                  <span className="ml-2">
                    <strong>Secondary:</strong> {details.secondaryMuscles.join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instructions Toggle Button */}
        {details && details.instructions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            <Info className="w-4 h-4 mr-2" />
            {showInstructions ? 'Hide' : 'Show'} Instructions
            {showInstructions ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        )}
      </div>

      {/* Expandable Instructions */}
      {showInstructions && details && details.instructions.length > 0 && (
        <div className="px-4 pb-4 pt-2 border-t bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">How to perform:</h4>
          <ol className="space-y-2 text-sm text-gray-700">
            {details.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="flex-1 pt-0.5">
                  {instruction.replace(/^Step:\d+\s*/i, '')}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
