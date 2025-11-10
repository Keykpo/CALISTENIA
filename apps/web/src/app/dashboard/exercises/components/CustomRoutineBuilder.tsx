'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Save, X } from 'lucide-react';
import { Exercise } from './exercise-utils';
import exercisesData from '@/data/exercises.json';

interface RoutineExercise {
  exerciseId: string;
  sets?: number;
  reps?: number;
  holdTime?: number; // seconds
  restTime: number; // seconds
  order: number;
}

interface Routine {
  name: string;
  description: string;
  difficulty: string;
  exercises: RoutineExercise[];
}

export default function CustomRoutineBuilder() {
  const [routine, setRoutine] = useState<Routine>({
    name: '',
    description: '',
    difficulty: 'BEGINNER',
    exercises: [],
  });

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [newExercise, setNewExercise] = useState<Partial<RoutineExercise>>({
    sets: 3,
    reps: 10,
    restTime: 60,
    order: routine.exercises.length,
  });

  const exercises = exercisesData as Exercise[];

  const handleAddExercise = () => {
    if (!selectedExerciseId) return;

    const exercise = exercises.find(ex => ex.id === selectedExerciseId);
    if (!exercise) return;

    const routineEx: RoutineExercise = {
      exerciseId: selectedExerciseId,
      sets: newExercise.sets || 3,
      reps: exercise.unit === 'reps' ? (newExercise.reps || 10) : undefined,
      holdTime: exercise.unit === 'seconds' ? (newExercise.holdTime || 30) : undefined,
      restTime: newExercise.restTime || 60,
      order: routine.exercises.length,
    };

    setRoutine(prev => ({
      ...prev,
      exercises: [...prev.exercises, routineEx],
    }));

    setIsAdding(false);
    setSelectedExerciseId('');
    setNewExercise({ sets: 3, reps: 10, restTime: 60, order: routine.exercises.length + 1 });
  };

  const handleRemoveExercise = (index: number) => {
    setRoutine(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const handleSaveRoutine = async () => {
    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routine),
      });

      if (response.ok) {
        alert('Routine saved successfully!');
        // Reset form
        setRoutine({
          name: '',
          description: '',
          difficulty: 'BEGINNER',
          exercises: [],
        });
      } else {
        alert('Failed to save routine');
      }
    } catch (error) {
      console.error('Error saving routine:', error);
      alert('Error saving routine');
    }
  };

  const estimatedDuration = routine.exercises.reduce((total, ex) => {
    const exerciseTime = (ex.sets || 0) * ((ex.reps || ex.holdTime || 30) + ex.restTime);
    return total + exerciseTime / 60;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Routine Info */}
      <Card>
        <CardHeader>
          <CardTitle>Routine Information</CardTitle>
          <CardDescription>Give your routine a name and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Routine Name</Label>
            <Input
              placeholder="e.g., Morning Push Workout"
              value={routine.name}
              onChange={(e) => setRoutine(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Describe your routine..."
              value={routine.description}
              onChange={(e) => setRoutine(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <Label>Difficulty Level</Label>
            <Select
              value={routine.difficulty}
              onValueChange={(value) => setRoutine(prev => ({ ...prev, difficulty: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
                <SelectItem value="ELITE">Elite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{routine.exercises.length} exercises</span>
            <span>•</span>
            <span>~{Math.round(estimatedDuration)} min</span>
          </div>
        </CardContent>
      </Card>

      {/* Exercises List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exercises</CardTitle>
              <CardDescription>Add and organize your exercises</CardDescription>
            </div>
            <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add Exercise Form */}
          {isAdding && (
            <Card className="border-2 border-primary">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Select Exercise</Label>
                  <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an exercise..." />
                    </SelectTrigger>
                    <SelectContent>
                      {exercises.slice(0, 50).map((ex) => (
                        <SelectItem key={ex.id} value={ex.id}>
                          {ex.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedExerciseId && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Sets</Label>
                        <Input
                          type="number"
                          min="1"
                          value={newExercise.sets}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, sets: parseInt(e.target.value) }))}
                        />
                      </div>
                      {exercises.find(ex => ex.id === selectedExerciseId)?.unit === 'reps' ? (
                        <div>
                          <Label>Reps</Label>
                          <Input
                            type="number"
                            min="1"
                            value={newExercise.reps}
                            onChange={(e) => setNewExercise(prev => ({ ...prev, reps: parseInt(e.target.value) }))}
                          />
                        </div>
                      ) : (
                        <div>
                          <Label>Hold (sec)</Label>
                          <Input
                            type="number"
                            min="1"
                            value={newExercise.holdTime}
                            onChange={(e) => setNewExercise(prev => ({ ...prev, holdTime: parseInt(e.target.value) }))}
                          />
                        </div>
                      )}
                      <div>
                        <Label>Rest (sec)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={newExercise.restTime}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, restTime: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleAddExercise} className="flex-1">
                        Add to Routine
                      </Button>
                      <Button variant="outline" onClick={() => setIsAdding(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Exercise List */}
          {routine.exercises.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No exercises added yet. Click "Add Exercise" to start building your routine.</p>
            </div>
          ) : (
            routine.exercises.map((ex, index) => {
              const exercise = exercises.find(e => e.id === ex.exerciseId);
              if (!exercise) return null;

              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{exercise.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{ex.sets} sets</Badge>
                          {ex.reps && <Badge variant="outline">{ex.reps} reps</Badge>}
                          {ex.holdTime && <Badge variant="outline">{ex.holdTime}s hold</Badge>}
                          <Badge variant="secondary">{ex.restTime}s rest</Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveExercise(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {routine.exercises.length > 0 && (
        <Button
          onClick={handleSaveRoutine}
          className="w-full"
          size="lg"
          disabled={!routine.name}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Routine
        </Button>
      )}
    </div>
  );
}
