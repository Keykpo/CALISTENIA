'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Dumbbell, Play, Trash2, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomRoutineBuilder from './CustomRoutineBuilder';

interface SavedRoutine {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  exercises: any[];
  estimatedDuration: number;
  timesUsed: number;
  isFavorite: boolean;
}

export default function CustomRoutinesTab() {
  const [savedRoutines, setSavedRoutines] = useState<SavedRoutine[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'create'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const response = await fetch('/api/routines');
      if (response.ok) {
        const data = await response.json();
        setSavedRoutines(data.routines || []);
      }
    } catch (error) {
      console.error('Error fetching routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!confirm('Are you sure you want to delete this routine?')) return;

    try {
      const response = await fetch(`/api/routines/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedRoutines(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Error deleting routine:', error);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const routine = savedRoutines.find(r => r.id === id);
      if (!routine) return;

      const response = await fetch(`/api/routines/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFavorite: !routine.isFavorite,
        }),
      });

      if (response.ok) {
        setSavedRoutines(prev =>
          prev.map(r =>
            r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
          )
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (activeView === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setActiveView('list')}>
            ← Back to Routines
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Create Custom Routine</h2>
            <p className="text-muted-foreground">Build your personalized workout</p>
          </div>
        </div>
        <CustomRoutineBuilder />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Custom Routines</h2>
          <p className="text-muted-foreground">
            Create and manage your personalized workout routines
          </p>
        </div>
        <Button onClick={() => setActiveView('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Routine
        </Button>
      </div>

      {/* Saved Routines */}
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">Loading routines...</div>
          </CardContent>
        </Card>
      ) : savedRoutines.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Routines Yet</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Start building your first custom routine by selecting exercises and configuring sets, reps, and rest times.
              </p>
              <Button onClick={() => setActiveView('create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Routine
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRoutines.map((routine) => (
            <Card key={routine.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{routine.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {routine.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleFavorite(routine.id)}
                    className={routine.isFavorite ? 'text-yellow-500' : ''}
                  >
                    <Star className={`h-5 w-5 ${routine.isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge>{routine.difficulty}</Badge>
                    <Badge variant="outline">{routine.exercises.length} exercises</Badge>
                    <Badge variant="secondary">~{routine.estimatedDuration} min</Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Used {routine.timesUsed} times
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" className="w-full">
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleDeleteRoutine(routine.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
