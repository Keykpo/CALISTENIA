'use client';

import { useState, useMemo } from 'react';
import exercises from '@/data/exercises.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, Target, Star, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Exercise,
  rankFromDifficulty,
  normalizeRank,
  getUserRankFromFitnessLevel,
} from './exercise-utils';
import ExerciseCard from './ExerciseCard';

interface ExerciseGalleryTabProps {
  userFitnessLevel: string;
  favorites: Set<string>;
  completed: Set<string>;
  onToggleFavorite: (id: string) => void;
  onToggleCompleted: (id: string) => void;
}

export default function ExerciseGalleryTab({
  userFitnessLevel,
  favorites,
  completed,
  onToggleFavorite,
  onToggleCompleted,
}: ExerciseGalleryTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<string>('all');

  const filteredExercises = useMemo(() => {
    return (exercises as Exercise[])
      .map((e) => ({
        ...e,
        rank: e.rank ?? rankFromDifficulty(e.difficulty),
      }))
      .filter((exercise) => {
        const matchesSearch = exercise.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const effectiveRank = normalizeRank(exercise.rank);
        const matchesRank = selectedRank === 'all' || effectiveRank === selectedRank;
        const matchesCategory =
          selectedCategory === 'all' || exercise.category === selectedCategory;

        // View filters
        let matchesView = true;
        if (selectedView === 'recommended') {
          const userRank = getUserRankFromFitnessLevel(userFitnessLevel);
          matchesView = effectiveRank === userRank || effectiveRank === normalizeRank('C');
        } else if (selectedView === 'favorites') {
          matchesView = favorites.has(exercise.id);
        } else if (selectedView === 'completed') {
          matchesView = completed.has(exercise.id);
        } else if (selectedView === 'not-completed') {
          matchesView = !completed.has(exercise.id);
        }

        return matchesSearch && matchesRank && matchesCategory && matchesView;
      });
  }, [searchTerm, selectedRank, selectedCategory, selectedView, favorites, completed, userFitnessLevel]);

  const stats = useMemo(() => {
    const normalized = (exercises as Exercise[])
      .map((e) => normalizeRank(e.rank ?? rankFromDifficulty(e.difficulty)))
      .filter(Boolean) as NonNullable<Exercise['rank']>[];
    const count = (r: NonNullable<Exercise['rank']>) => normalized.filter((x) => x === r).length;

    const completedByRank = (r: NonNullable<Exercise['rank']>) =>
      (exercises as Exercise[])
        .filter(e => normalizeRank(e.rank ?? rankFromDifficulty(e.difficulty)) === r)
        .filter(e => completed.has(e.id))
        .length;

    return {
      total: normalized.length,
      completed: completed.size,
      favorites: favorites.size,
      D: count('D'),
      C: count('C'),
      B: count('B'),
      A: count('A'),
      S: count('S'),
      completedD: completedByRank('D'),
      completedC: completedByRank('C'),
      completedB: completedByRank('B'),
      completedA: completedByRank('A'),
      completedS: completedByRank('S'),
    };
  }, [completed, favorites]);

  return (
    <div className="space-y-8">
      {/* Personal Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="p-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">of {stats.total} completed</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">D</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-blue-500">{stats.completedD}/{stats.D}</p>
            <p className="text-xs text-muted-foreground">Beginner</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">C</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-yellow-500">{stats.completedC}/{stats.C}</p>
            <p className="text-xs text-muted-foreground">Novice</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">B</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-orange-500">{stats.completedB}/{stats.B}</p>
            <p className="text-xs text-muted-foreground">Intermediate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">A</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-red-500">{stats.completedA}/{stats.A}</p>
            <p className="text-xs text-muted-foreground">Advanced</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">S</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-purple-600">{stats.completedS}/{stats.S}</p>
            <p className="text-xs text-muted-foreground">Expert</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick View Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="recommended">
            <TrendingUp className="h-4 w-4 mr-2" />
            For You
          </TabsTrigger>
          <TabsTrigger value="not-completed">
            To Complete
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Star className="h-4 w-4 mr-2" />
            Favorites ({stats.favorites})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <Check className="h-4 w-4 mr-2" />
            Completed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Exercise name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rank</label>
              <Select value={selectedRank} onValueChange={setSelectedRank}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="D">D (Beginner)</SelectItem>
                  <SelectItem value="C">C (Novice)</SelectItem>
                  <SelectItem value="B">B (Intermediate)</SelectItem>
                  <SelectItem value="A">A (Advanced)</SelectItem>
                  <SelectItem value="S">S (Expert)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="STRENGTH">Strength</SelectItem>
                  <SelectItem value="CORE">Core</SelectItem>
                  <SelectItem value="CARDIO">Cardio</SelectItem>
                  <SelectItem value="BALANCE">Balance</SelectItem>
                  <SelectItem value="SKILL_STATIC">Static Skill</SelectItem>
                  <SelectItem value="WARM_UP">Warm-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div>
        <p className="text-sm text-muted-foreground">
          Showing {filteredExercises.length} of {exercises.length} exercises
        </p>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            isCompleted={completed.has(exercise.id)}
            isFavorite={favorites.has(exercise.id)}
            onToggleCompleted={() => onToggleCompleted(exercise.id)}
            onToggleFavorite={() => onToggleFavorite(exercise.id)}
          />
        ))}
      </div>

      {/* No results */}
      {filteredExercises.length === 0 && (
        <Card className="mt-8">
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              No exercises found with the selected filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
