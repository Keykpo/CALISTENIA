'use client';

import type { SessionPhase, TrainingMode } from '@/lib/routine-generator-v3';

interface RoutinePhaseDisplayProps {
  phase: SessionPhase;
}

export function RoutinePhaseDisplay({ phase }: RoutinePhaseDisplayProps) {
  return (
    <div className="mb-6 border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{phase.name}</h3>
        <span className="text-sm text-gray-500">{phase.duration} min</span>
      </div>

      <p className="text-sm text-gray-600 mb-3">{phase.purpose}</p>

      {phase.mode && (
        <div className="mb-3">
          {phase.mode === 'MODE_1_SKILL' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              🎯 Mode 1: Skill Practice (WITH BUFFER)
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              💪 Mode 2: Strength Building (TO FAILURE)
            </span>
          )}
        </div>
      )}

      <div className="space-y-3">
        {phase.exercises.map((exercise, idx) => (
          <div key={idx} className="bg-gray-50 rounded p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{exercise.name}</span>
              {exercise.masteryGoal && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {exercise.masteryGoal}
                </span>
              )}
            </div>

            <div className="text-sm text-gray-600 mt-1">
              {exercise.sets} sets × {exercise.reps ? `${exercise.reps} reps` : `${exercise.duration}s hold`}
              {' • '}
              {exercise.rest}s rest
            </div>

            {exercise.buffer && (
              <div className="text-xs text-purple-600 mt-1 italic flex items-start gap-1">
                <span>⚠️</span>
                <span>{exercise.buffer}</span>
              </div>
            )}

            {exercise.targetIntensity && (
              <div className="text-xs text-red-600 mt-1 font-medium">
                🎯 {exercise.targetIntensity}
              </div>
            )}

            {exercise.coachTips && exercise.coachTips.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 flex items-start gap-1">
                <span>💡</span>
                <span>{exercise.coachTips[0]}</span>
              </div>
            )}

            {exercise.notes && (
              <div className="mt-2 text-xs text-gray-500 italic">
                {exercise.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
