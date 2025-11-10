'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import exercises from '@/data/exercises.json';
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
import { Trophy, Coins, Clock, Repeat, Star, Check, Plus, TrendingUp, Dumbbell, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Exercise = {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty?: string;
  rank?: 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
  unit: string;
  muscleGroups: string[];
  equipment: string[];
  expReward: number;
  coinsReward: number;
  howTo?: string;
  gifUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string | null;
  instructions?: string[];
};

const rankFromDifficulty = (d?: string): Exercise['rank'] => {
  if (!d) return undefined;
  const raw = d.trim();
  const upper = raw.toUpperCase();

  const mLetter = upper.match(/^\s*([F|E|D|C|B|A|S])\b/);
  if (mLetter) {
    const letter = mLetter[1] as Exercise['rank'];
    return letter;
  }

  const mParen = upper.match(/\(([^)]+)\)/);
  const desc = (mParen?.[1] || upper).trim();

  switch (desc) {
    case 'BEGINNER':
      return 'D';
    case 'NOVICE':
      return 'C';
    case 'INTERMEDIATE':
      return 'B';
    case 'ADVANCED':
      return 'A';
    case 'EXPERT':
      return 'S';
    default:
      return undefined;
  }
};

const rankColors: Record<NonNullable<Exercise['rank']>, string> = {
  F: 'bg-green-500',
  E: 'bg-teal-500',
  D: 'bg-blue-500',
  C: 'bg-yellow-500',
  B: 'bg-orange-500',
  A: 'bg-red-500',
  S: 'bg-purple-600',
};

const rankLabels: Record<NonNullable<Exercise['rank']>, string> = {
  F: 'Beginner',
  E: 'Beginner',
  D: 'Beginner',
  C: 'Novice',
  B: 'Intermediate',
  A: 'Advanced',
  S: 'Expert',
};

const normalizeRank = (r?: Exercise['rank']): Exercise['rank'] | undefined => {
  switch (r) {
    case 'F':
    case 'E':
      return 'D';
    case 'D':
    case 'C':
    case 'B':
    case 'A':
    case 'S':
      return r;
    default:
      return r;
  }
};

const formatRank = (rank?: Exercise['rank'], difficulty?: string): string => {
  const raw = (rank ?? rankFromDifficulty(difficulty)) as Exercise['rank'] | undefined;
  const normalized = normalizeRank(raw) as NonNullable<Exercise['rank']> | undefined;
  return normalized ? `${normalized} (${rankLabels[normalized] ?? normalized})` : 'Unknown';
};

const getRankColorClass = (rank?: Exercise['rank'], difficulty?: string): string => {
  const raw = (rank ?? rankFromDifficulty(difficulty)) as Exercise['rank'] | undefined;
  const normalized = normalizeRank(raw) as NonNullable<Exercise['rank']> | undefined;
  return normalized ? `${rankColors[normalized]} text-white` : 'bg-gray-500 text-white';
};

const categoryLabels = {
  STRENGTH: 'Strength',
  CORE: 'Core',
  BALANCE: 'Balance',
  SKILL_STATIC: 'Static Skill',
  WARM_UP: 'Warm-up',
  CARDIO: 'Cardio',
};

export default function DashboardExercisesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [userFitnessLevel, setUserFitnessLevel] = useState<string>('BEGINNER');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      if (!session?.user?.id) return;

      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();

        if (data.user?.fitnessLevel) {
          setUserFitnessLevel(data.user.fitnessLevel);
        }

        // TODO: Fetch user's favorites and completed exercises from API
        // For now using localStorage as fallback
        const storedFavorites = localStorage.getItem('exercise-favorites');
        const storedCompleted = localStorage.getItem('exercise-completed');

        if (storedFavorites) {
          setFavorites(new Set(JSON.parse(storedFavorites)));
        }
        if (storedCompleted) {
          setCompleted(new Set(JSON.parse(storedCompleted)));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    fetchUserData();
  }, [session]);

  // Map fitness level to rank
  const getUserRank = (): Exercise['rank'] => {
    switch (userFitnessLevel) {
      case 'BEGINNER':
        return 'D';
      case 'INTERMEDIATE':
        return 'B';
      case 'ADVANCED':
        return 'A';
      case 'ELITE':
        return 'S';
      default:
        return 'D';
    }
  };

  const toggleFavorite = (exerciseId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(exerciseId)) {
      newFavorites.delete(exerciseId);
    } else {
      newFavorites.add(exerciseId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('exercise-favorites', JSON.stringify(Array.from(newFavorites)));
  };

  const toggleCompleted = (exerciseId: string) => {
    const newCompleted = new Set(completed);
    if (newCompleted.has(exerciseId)) {
      newCompleted.delete(exerciseId);
    } else {
      newCompleted.add(exerciseId);
    }
    setCompleted(newCompleted);
    localStorage.setItem('exercise-completed', JSON.stringify(Array.from(newCompleted)));
  };

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
          const userRank = getUserRank();
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
  }, [searchTerm, selectedRank, selectedCategory, selectedView, favorites, completed]);

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
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Dumbbell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Exercise Library</h1>
        </div>
        <p className="text-muted-foreground">
          Explore {exercises.length} exercises and track your progress
        </p>
      </div>

      {/* Personal Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
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
      <Tabs value={selectedView} onValueChange={setSelectedView} className="mb-6">
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
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredExercises.length} of {exercises.length} exercises
        </p>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => {
          const isCompleted = completed.has(exercise.id);
          const isFavorite = favorites.has(exercise.id);

          return (
            <Card key={exercise.id} className={`hover:shadow-lg transition-shadow ${isCompleted ? 'border-green-500' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      {isCompleted && (
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className={getRankColorClass(exercise.rank, exercise.difficulty)}>
                        {formatRank(exercise.rank, exercise.difficulty)}
                      </Badge>
                      <Badge variant="outline">
                        {categoryLabels[exercise.category as keyof typeof categoryLabels]}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(exercise.id)}
                    className={isFavorite ? 'text-yellow-500' : ''}
                  >
                    <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
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
                      onClick={() => toggleCompleted(exercise.id)}
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
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                                  ]
                                }
                              </Badge>
                            </div>
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 mt-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Description</h3>
                            <p className="text-muted-foreground">{selectedExercise?.description}</p>
                          </div>

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
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      const slug = exercise.name
                        .trim()
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-');
                      router.push(`/guides/${slug}`);
                    }}
                  >
                    View Full Guide →
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
