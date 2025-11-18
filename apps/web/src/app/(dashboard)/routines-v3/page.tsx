'use client';

import { useState, useEffect } from 'react';
import { RoutinePhaseDisplay } from '@/components/routine-phase-display';
import type { WorkoutRoutine, TrainingStage } from '@/lib/routine-generator-v3';

export default function RoutinesV3Page() {
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetchRoutines();
  }, []);

  async function fetchRoutines() {
    try {
      setLoading(true);
      setError(null);

      // UPDATED: Using new unified endpoint
      const response = await fetch('/api/routines/generate', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch routines');
      }

      const data = await response.json();

      // Handle both daily and weekly routines
      if (data.mode === 'weekly') {
        setRoutines(data.routine.dailyRoutines);
        setConfig(data.metadata);
      } else {
        // If it's daily, wrap it in an array for consistency
        setRoutines([data.routine]);
        setConfig(data.metadata);
      }
    } catch (err: any) {
      console.error('Error fetching routines:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function regenerateRoutines() {
    try {
      setLoading(true);
      setError(null);

      // UPDATED: Using new unified endpoint with mode=weekly
      const response = await fetch('/api/routines/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'weekly',
          daysPerWeek: 3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate routines');
      }

      const data = await response.json();

      // Extract daily routines from weekly routine
      if (data.routine.dailyRoutines) {
        setRoutines(data.routine.dailyRoutines);
      }
      setConfig(data.metadata);
    } catch (err: any) {
      console.error('Error generating routines:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const getStageLabel = (stage: TrainingStage) => {
    switch (stage) {
      case 'STAGE_1_2':
        return '🏗️ Foundation Building';
      case 'STAGE_3':
        return '💪 Advanced Weighted';
      case 'STAGE_4':
        return '🎯 Elite Skills + Weighted';
      default:
        return stage;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating your training routine...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchRoutines}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your V3 Training Routine
        </h1>
        <p className="text-gray-600">
          Expert calisthenics progression following Mode 1 (Skills) + Mode 2 (Strength) methodology
        </p>
      </div>

      {config && (
        <div className="mb-6 flex items-center gap-4">
          <span className={`
            px-4 py-2 rounded-full text-sm font-medium
            ${config.stage === 'STAGE_1_2' ? 'bg-green-100 text-green-800' : ''}
            ${config.stage === 'STAGE_3' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${config.stage === 'STAGE_4' ? 'bg-purple-100 text-purple-800' : ''}
          `}>
            {getStageLabel(config.stage)}
          </span>
          <span className="text-sm text-gray-600">Level: {config.level}</span>
          {config.masteryGoals && config.masteryGoals.length > 0 && (
            <span className="text-sm text-gray-600">
              Goals: {config.masteryGoals.join(', ')}
            </span>
          )}
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={regenerateRoutines}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Regenerate Routine
        </button>
      </div>

      {routines.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">No routines generated yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {routines.map((routine, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {routine.day} - {routine.sessionType.replace(/_/g, ' ')}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {routine.totalMinutes} minutes • Stage: {routine.stage}
                  </p>
                </div>
              </div>

              {/* Educational notes */}
              {routine.notes && routine.notes.length > 0 && (
                <div className="mb-6 space-y-2">
                  {routine.notes.map((note, nIdx) => (
                    <div key={nIdx} className="p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
                      {note}
                    </div>
                  ))}
                </div>
              )}

              {/* Display phases */}
              <div>
                {routine.phases.map((phase, pIdx) => (
                  <RoutinePhaseDisplay key={pIdx} phase={phase} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
