'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import exercises from '../../../public/exercises.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trophy, Coins, Clock, Repeat } from 'lucide-react';

type Exercise = {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  unit: string;
  muscleGroups: string[];
  equipment: string[];
  expReward: number;
  coinsReward: number;
  howTo?: string;
  gifUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string | null;
};

const difficultyColors = {
  BEGINNER: 'bg-green-500',
  NOVICE: 'bg-blue-500',
  INTERMEDIATE: 'bg-yellow-500',
  ADVANCED: 'bg-orange-500',
  EXPERT: 'bg-red-500',
};

const difficultyLabels = {
  BEGINNER: 'Beginner',
  NOVICE: 'Novice',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
};

const categoryLabels = {
  STRENGTH: 'Strength',
  CORE: 'Core',
  BALANCE: 'Balance',
  SKILL_STATIC: 'Static Skill',
  WARM_UP: 'Warm-up',
};

export default function ExercisesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const filteredExercises = useMemo(() => {
    return (exercises as Exercise[]).filter((exercise) => {
      const matchesSearch = exercise.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDifficulty =
        selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
      const matchesCategory =
        selectedCategory === 'all' || exercise.category === selectedCategory;

      return matchesSearch && matchesDifficulty && matchesCategory;
    });
  }, [searchTerm, selectedDifficulty, selectedCategory]);

  const stats = useMemo(() => {
    return {
      total: exercises.length,
      beginner: exercises.filter((e: Exercise) => e.difficulty === 'BEGINNER').length,
      novice: exercises.filter((e: Exercise) => e.difficulty === 'NOVICE').length,
      intermediate: exercises.filter((e: Exercise) => e.difficulty === 'INTERMEDIATE').length,
      advanced: exercises.filter((e: Exercise) => e.difficulty === 'ADVANCED').length,
      expert: exercises.filter((e: Exercise) => e.difficulty === 'EXPERT').length,
    };
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Exercise Library</h1>
          <p className="text-muted-foreground">
            Explore the {exercises.length} available exercises and learn how to perform them
          </p>
        </div>
        <Button
          className="shrink-0"
          onClick={() => router.push('/dashboard')}
          variant="black"
        >
          Go to Dashboard
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Beginner</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-green-500">{stats.beginner}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Novice</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-blue-500">{stats.novice}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Intermediate</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-yellow-500">{stats.intermediate}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Advanced</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-orange-500">{stats.advanced}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Expert</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-red-500">{stats.expert}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
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
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="NOVICE">Novice</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="EXPERT">Expert</SelectItem>
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
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredExercises.length} of {exercises.length} exercises
        </p>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{exercise.name}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge
                      className={`${
                        difficultyColors[exercise.difficulty as keyof typeof difficultyColors]
                      } text-white`}
                    >
                      {difficultyLabels[exercise.difficulty as keyof typeof difficultyLabels]}
                    </Badge>
                    <Badge variant="outline">
                      {categoryLabels[exercise.category as keyof typeof categoryLabels]}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="line-clamp-2">{exercise.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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
                  {exercise.muscleGroups.map((muscle) => (
                    <Badge key={muscle} variant="secondary" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>

                {/* View Guide Button (modal) and Full Guide link */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="black" onClick={() => setSelectedExercise(exercise)}>
                      View Quick Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">{selectedExercise?.name}</DialogTitle>
                      <DialogDescription>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge
                            className={`${
                              difficultyColors[
                                selectedExercise?.difficulty as keyof typeof difficultyColors
                              ]
                            } text-white`}
                          >
                            {
                              difficultyLabels[
                                selectedExercise?.difficulty as keyof typeof difficultyLabels
                              ]
                            }
                          </Badge>
                          <Badge variant="outline">
                            {
                              categoryLabels[
                                selectedExercise?.category as keyof typeof categoryLabels
                              ]
                            }
                          </Badge>
                        </div>
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                      
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

                      {/* Type */}
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Measurement Type</h3>
                        <div className="flex items-center gap-2">
                          {selectedExercise?.unit === 'reps' ? (
                            <>
                              <Repeat className="w-5 h-5 text-blue-500" />
                              <span>By Repetitions</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-5 h-5 text-purple-500" />
                              <span>By Time (seconds)</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Muscle Groups */}
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

                      {/* Equipment */}
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

                      {/* Instructions */}
                      <div>
                        <h3 className="font-semibold text-lg mb-2">How To Perform</h3>
                        {selectedExercise?.instructions && selectedExercise.instructions.length > 0 ? (
                          <div className="bg-muted p-4 rounded-lg">
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                              {selectedExercise.instructions.map((step, idx) => (
                                <li key={idx} className="text-muted-foreground">{step}</li>
                              ))}
                            </ol>
                          </div>
                        ) : selectedExercise?.howTo ? (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {selectedExercise.howTo}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              No instructions available yet for this exercise.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="black"
                  className="w-full mt-2"
                  onClick={() => {
                    const slug = exercise.name
                      .trim()
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-');
                    router.push(`/guides/${slug}`);
                  }}
                >
                  {/* icon + label for better visual affordance */}
                  <span className="inline-flex items-center gap-2">
                    {/* Using an emoji as a lightweight icon to avoid new imports */}
                    <span role="img" aria-label="book">📘</span>
                    View Full Guide
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
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
