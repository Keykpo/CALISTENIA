// DS Rank utilities shared across the web app
// Rank scale aligned with exercises: D(beginner) → S(elite)

export type RankDS = 'D' | 'C' | 'B' | 'A' | 'S';

// Map a 0–100 value to DS rank bands
export const valueToRankDS = (value: number): RankDS => {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  if (v < 25) return 'D';
  if (v < 45) return 'C';
  if (v < 65) return 'B';
  if (v < 85) return 'A';
  return 'S';
};

// Representative value for each DS rank on 0–100 scale
export const rankDSToValue = (rank: RankDS): number => {
  switch (rank) {
    case 'D': return 20;
    case 'C': return 40;
    case 'B': return 60;
    case 'A': return 80;
    case 'S': return 100;
    default: return 60;
  }
};

// User-friendly difficulty label for DS ranks
export const difficultyLabelForRankDS = (rank: RankDS): string => {
  const map: Record<RankDS, string> = {
    D: 'Beginner',
    C: 'Novice',
    B: 'Intermediate',
    A: 'Advanced',
    S: 'Elite',
  };
  return map[rank];
};

// Compute overall DS rank from hexagon values
import type { HexagonValues } from '@/components/SkillsHexagon';
export const overallRankFromHexagon = (values: HexagonValues): RankDS => {
  const avg = (
    values.fuerzaRelativa +
    values.resistenciaMuscular +
    values.controlEquilibrio +
    values.movilidadArticular +
    values.tensionCorporal +
    values.tecnica
  ) / 6;
  return valueToRankDS(avg);
};