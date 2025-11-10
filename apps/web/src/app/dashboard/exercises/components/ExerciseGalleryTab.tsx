'use client';

import { useState, useMemo } from 'react';
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
import { Trophy, Coins, Clock, Repeat, Star, Check, Plus, TrendingUp, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Exercise,
  rankFromDifficulty,
  normalizeRank,
  formatRank,
  getRankColorClass,
  categoryLabels,
  getUserRankFromFitnessLevel,
} from './exercise-utils';

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
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

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
                    onClick={() => onToggleFavorite(exercise.id)}
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
                      onClick={() => onToggleCompleted(exercise.id)}
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
