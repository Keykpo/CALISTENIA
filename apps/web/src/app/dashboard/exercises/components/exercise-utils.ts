export type Exercise = {
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

export const rankFromDifficulty = (d?: string): Exercise['rank'] => {
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

export const rankColors: Record<NonNullable<Exercise['rank']>, string> = {
  F: 'bg-green-500',
  E: 'bg-teal-500',
  D: 'bg-blue-500',
  C: 'bg-yellow-500',
  B: 'bg-orange-500',
  A: 'bg-red-500',
  S: 'bg-purple-600',
};

export const rankLabels: Record<NonNullable<Exercise['rank']>, string> = {
  F: 'Beginner',
  E: 'Beginner',
  D: 'Beginner',
  C: 'Novice',
  B: 'Intermediate',
  A: 'Advanced',
  S: 'Expert',
};

export const normalizeRank = (r?: Exercise['rank']): Exercise['rank'] | undefined => {
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

export const formatRank = (rank?: Exercise['rank'], difficulty?: string): string => {
  const raw = (rank ?? rankFromDifficulty(difficulty)) as Exercise['rank'] | undefined;
  const normalized = normalizeRank(raw) as NonNullable<Exercise['rank']> | undefined;
  return normalized ? `${normalized} (${rankLabels[normalized] ?? normalized})` : 'Unknown';
};

export const getRankColorClass = (rank?: Exercise['rank'], difficulty?: string): string => {
  const raw = (rank ?? rankFromDifficulty(difficulty)) as Exercise['rank'] | undefined;
  const normalized = normalizeRank(raw) as NonNullable<Exercise['rank']> | undefined;
  return normalized ? `${rankColors[normalized]} text-white` : 'bg-gray-500 text-white';
};

export const categoryLabels = {
  STRENGTH: 'Strength',
  CORE: 'Core',
  BALANCE: 'Balance',
  SKILL_STATIC: 'Static Skill',
  WARM_UP: 'Warm-up',
  CARDIO: 'Cardio',
};

export const getUserRankFromFitnessLevel = (fitnessLevel: string): Exercise['rank'] => {
  switch (fitnessLevel) {
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
