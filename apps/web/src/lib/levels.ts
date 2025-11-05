/**
 * Sistema de niveles y gamificación
 */

export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  rewards?: {
    coins?: number;
    unlocks?: string[];
  };
}

export const LEVELS: LevelInfo[] = [
  { 
    level: 1, 
    title: 'Novato', 
    minXP: 0, 
    maxXP: 100 
  },
  { 
    level: 2, 
    title: 'Aprendiz', 
    minXP: 100, 
    maxXP: 250, 
    rewards: { coins: 50 } 
  },
  { 
    level: 3, 
    title: 'Atleta Novato', 
    minXP: 250, 
    maxXP: 500, 
    rewards: { coins: 75 } 
  },
  { 
    level: 4, 
    title: 'Guerrero en Entrenamiento', 
    minXP: 500, 
    maxXP: 1000, 
    rewards: { coins: 100 } 
  },
  { 
    level: 5, 
    title: 'Atleta Intermedio', 
    minXP: 1000, 
    maxXP: 2000, 
    rewards: { coins: 150, unlocks: ['advanced_workouts'] } 
  },
  { 
    level: 6, 
    title: 'Veterano', 
    minXP: 2000, 
    maxXP: 3500, 
    rewards: { coins: 200 } 
  },
  { 
    level: 7, 
    title: 'Experto', 
    minXP: 3500, 
    maxXP: 5500, 
    rewards: { coins: 300 } 
  },
  { 
    level: 8, 
    title: 'Maestro', 
    minXP: 5500, 
    maxXP: 8000, 
    rewards: { coins: 400 } 
  },
  { 
    level: 9, 
    title: 'Gran Maestro', 
    minXP: 8000, 
    maxXP: 12000, 
    rewards: { coins: 600 } 
  },
  { 
    level: 10, 
    title: 'Leyenda', 
    minXP: 12000, 
    maxXP: 17000, 
    rewards: { coins: 1000 } 
  },
  { 
    level: 11, 
    title: 'Semidiós', 
    minXP: 17000, 
    maxXP: 25000, 
    rewards: { coins: 1500 } 
  },
  { 
    level: 12, 
    title: 'Dios del Olimpo', 
    minXP: 25000, 
    maxXP: Infinity, 
    rewards: { coins: 2500 } 
  },
];

/**
 * Calcula el nivel actual y progreso basado en XP total
 */
export function calculateLevel(totalXP: number) {
  let currentLevelInfo = LEVELS[0];
  let nextLevelInfo: LevelInfo | null = null;
  
  // Encontrar nivel actual
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].minXP) {
      currentLevelInfo = LEVELS[i];
      nextLevelInfo = i < LEVELS.length - 1 ? LEVELS[i + 1] : null;
      break;
    }
  }
  
  const xpInCurrentLevel = totalXP - currentLevelInfo.minXP;
  const xpNeededForNext = nextLevelInfo 
    ? nextLevelInfo.minXP - totalXP 
    : 0;
  const progressToNext = nextLevelInfo
    ? Math.min((xpInCurrentLevel / (nextLevelInfo.minXP - currentLevelInfo.minXP)) * 100, 100)
    : 100;
  
  return {
    currentLevel: currentLevelInfo.level,
    currentLevelInfo,
    nextLevelInfo,
    progressToNext: Math.round(progressToNext),
    xpInCurrentLevel,
    xpNeededForNext,
  };
}

/**
 * Obtiene información de un nivel específico
 */
export function getLevelByNumber(level: number): LevelInfo | null {
  return LEVELS.find(l => l.level === level) || null;
}

/**
 * Verifica si el usuario subió de nivel y retorna las recompensas
 */
export function checkLevelUp(oldLevel: number, newXP: number): {
  leveledUp: boolean;
  newLevel: number;
  rewards?: LevelInfo['rewards'];
} {
  const { currentLevel, currentLevelInfo } = calculateLevel(newXP);
  
  if (currentLevel > oldLevel) {
    return {
      leveledUp: true,
      newLevel: currentLevel,
      rewards: currentLevelInfo.rewards,
    };
  }
  
  return {
    leveledUp: false,
    newLevel: oldLevel,
  };
}
