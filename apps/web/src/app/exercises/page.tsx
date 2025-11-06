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
  difficulty?: string; // legacy field from JSON
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
};

// Map legacy difficulty to a rank letter (approximate)
// Parse difficulty strings into rank letters.
// Supports formats like "D (Beginner)", "C (Novice)", and plain descriptors.
const rankFromDifficulty = (d?: string): Exercise['rank'] => {
  if (!d) return undefined;
  const raw = d.trim();
  const upper = raw.toUpperCase();

  // 1) Prefer leading rank letter (A/B/C/D/S/F/E)
  const mLetter = upper.match(/^\s*([F|E|D|C|B|A|S])\b/);
  if (mLetter) {
    const letter = mLetter[1] as Exercise['rank'];
    return letter;
  }

  // 2) If there is a descriptor in parentheses, use it
  const mParen = upper.match(/\(([^)]+)\)/);
  const desc = (mParen?.[1] || upper).trim();

  // 3) Map descriptors to ranks
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

// Etiquetas visibles por letra (letra + descripción en inglés)
const rankLabels: Record<NonNullable<Exercise['rank']>, string> = {
  F: 'Beginner',
  E: 'Beginner',
  D: 'Beginner',
  C: 'Novice',
  B: 'Intermediate',
  A: 'Advanced',
  S: 'Expert',
};

// Normaliza rangos: F/E→D, D→C, C→B
// Normaliza rangos: colapsa F/E ? D; mantiene el resto igual
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

// Formato de visualización: solo la letra del rango normalizado
const formatRank = (rank?: Exercise['rank'], difficulty?: string): string => {
  const raw = (rank ?? rankFromDifficulty(difficulty)) as Exercise['rank'] | undefined;
  const normalized = normalizeRank(raw) as NonNullable<Exercise['rank']> | undefined;
  return normalized ? `${normalized} (${rankLabels[normalized] ?? normalized})` : 'Unknown';
};

// Get badge color class for rank
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
};

export default function ExercisesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

        return matchesSearch && matchesRank && matchesCategory;
      });
  }, [searchTerm, selectedRank, selectedCategory]);

  const stats = useMemo(() => {
    const normalized = (exercises as Exercise[])
      .map((e) => normalizeRank(e.rank ?? rankFromDifficulty(e.difficulty)))
      .filter(Boolean) as NonNullable<Exercise['rank']>[];
    const count = (r: NonNullable<Exercise['rank']>) => normalized.filter((x) => x === r).length;
    return {
      total: normalized.length,
      D: count('D'),
      C: count('C'),
      B: count('B'),
      A: count('A'),
      S: count('S'),
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

      {/* Stats Cards by Rank (normalized to D → S) */}
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
            <CardTitle className="text-sm">D</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-blue-500">{stats.D}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">C</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-yellow-500">{stats.C}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">B</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-orange-500">{stats.B}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">A</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-red-500">{stats.A}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">S</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-purple-600">{stats.S}</p>
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
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{exercise.name}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={getRankColorClass(exercise.rank, exercise.difficulty)}>
                      {formatRank(exercise.rank, exercise.difficulty)}
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

