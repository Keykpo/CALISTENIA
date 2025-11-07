// Seeds de Achievements (60+ achievements)
// Categorías: Skill Mastery, Branch Completion, Level Milestones, Daily Missions, XP & Strength, Special

import { AchievementType, AchievementRarity } from '@prisma/client';

export type AchievementSeed = {
  name: string;
  description: string;
  type: AchievementType;
  target?: number;
  unit?: string;
  points: number;
  rarity: AchievementRarity;
  iconUrl?: string;
};

// ======================
// SKILL MASTERY (20)
// ======================

export const skillMasteryAchievements: AchievementSeed[] = [
  {
    name: 'Push Initiate',
    description: 'Completa tu primera skill de empuje',
    type: 'EXERCISE_MASTERY',
    target: 1,
    unit: 'push skills',
    points: 10,
    rarity: 'COMMON',
  },
  {
    name: 'Push Warrior',
    description: 'Completa 5 skills de empuje',
    type: 'EXERCISE_MASTERY',
    target: 5,
    unit: 'push skills',
    points: 25,
    rarity: 'UNCOMMON',
  },
  {
    name: 'Push Master',
    description: 'Completa 10 skills de empuje',
    type: 'EXERCISE_MASTERY',
    target: 10,
    unit: 'push skills',
    points: 50,
    rarity: 'RARE',
  },
  {
    name: 'Push Legend',
    description: 'Completa todas las skills de empuje',
    type: 'EXERCISE_MASTERY',
    target: 100,
    unit: '% branch',
    points: 100,
    rarity: 'EPIC',
  },

  {
    name: 'Pull Initiate',
    description: 'Completa tu primera skill de tracción',
    type: 'EXERCISE_MASTERY',
    target: 1,
    unit: 'pull skills',
    points: 10,
    rarity: 'COMMON',
  },
  {
    name: 'Pull Warrior',
    description: 'Completa 5 skills de tracción',
    type: 'EXERCISE_MASTERY',
    target: 5,
    unit: 'pull skills',
    points: 25,
    rarity: 'UNCOMMON',
  },
  {
    name: 'Pull Master',
    description: 'Completa 10 skills de tracción',
    type: 'EXERCISE_MASTERY',
    target: 10,
    unit: 'pull skills',
    points: 50,
    rarity: 'RARE',
  },
  {
    name: 'Pull Legend',
    description: 'Completa todas las skills de tracción',
    type: 'EXERCISE_MASTERY',
    target: 100,
    unit: '% branch',
    points: 100,
    rarity: 'EPIC',
  },

  {
    name: 'Core Initiate',
    description: 'Completa tu primera skill de core',
    type: 'EXERCISE_MASTERY',
    target: 1,
    unit: 'core skills',
    points: 10,
    rarity: 'COMMON',
  },
  {
    name: 'Core Warrior',
    description: 'Completa 5 skills de core',
    type: 'EXERCISE_MASTERY',
    target: 5,
    unit: 'core skills',
    points: 25,
    rarity: 'UNCOMMON',
  },
  {
    name: 'Core God',
    description: 'Completa 10 skills de core',
    type: 'EXERCISE_MASTERY',
    target: 10,
    unit: 'core skills',
    points: 50,
    rarity: 'RARE',
  },

  {
    name: 'Balance Artist',
    description: 'Completa 10 skills de equilibrio',
    type: 'EXERCISE_MASTERY',
    target: 10,
    unit: 'balance skills',
    points: 50,
    rarity: 'RARE',
  },
  {
    name: 'Handstand Master',
    description: 'Domina el free handstand por 60 segundos',
    type: 'EXERCISE_MASTERY',
    target: 60,
    unit: 'seconds',
    points: 75,
    rarity: 'EPIC',
  },

  {
    name: 'Leg Legend',
    description: 'Completa 10 skills de tren inferior',
    type: 'EXERCISE_MASTERY',
    target: 10,
    unit: 'leg skills',
    points: 50,
    rarity: 'RARE',
  },

  {
    name: 'Static Master',
    description: 'Completa 5 skills estáticas',
    type: 'EXERCISE_MASTERY',
    target: 5,
    unit: 'static skills',
    points: 100,
    rarity: 'EPIC',
  },
  {
    name: 'Planche Achievement',
    description: 'Consigue el full planche',
    type: 'EXERCISE_MASTERY',
    target: 1,
    unit: 'planche',
    points: 150,
    rarity: 'LEGENDARY',
  },
  {
    name: 'Front Lever Achievement',
    description: 'Consigue el full front lever',
    type: 'EXERCISE_MASTERY',
    target: 1,
    unit: 'front lever',
    points: 150,
    rarity: 'LEGENDARY',
  },
  {
    name: 'Human Flag Achievement',
    description: 'Consigue la bandera humana',
    type: 'EXERCISE_MASTERY',
    target: 1,
    unit: 'flag',
    points: 150,
    rarity: 'LEGENDARY',
  },

  {
    name: 'Ultimate Calisthenic',
    description: 'Completa 50 skills en total',
    type: 'EXERCISE_MASTERY',
    target: 50,
    unit: 'total skills',
    points: 200,
    rarity: 'LEGENDARY',
  },

  {
    name: 'Calisthenics God',
    description: 'Completa todas las skills del juego',
    type: 'EXERCISE_MASTERY',
    target: 100,
    unit: '% complete',
    points: 500,
    rarity: 'LEGENDARY',
  },
];

// ======================
// BRANCH COMPLETION (7)
// ======================

export const branchCompletionAchievements: AchievementSeed[] = [
  {
    name: 'Push Branch Complete',
    description: 'Completa el 100% de la rama de empuje',
    type: 'PROGRESS_MILESTONE',
    target: 100,
    unit: '%',
    points: 100,
    rarity: 'EPIC',
  },
  {
    name: 'Pull Branch Complete',
    description: 'Completa el 100% de la rama de tracción',
    type: 'PROGRESS_MILESTONE',
    target: 100,
    unit: '%',
    points: 100,
    rarity: 'EPIC',
  },
  {
    name: 'Core Branch Complete',
    description: 'Completa el 100% de la rama de core',
    type: 'PROGRESS_MILESTONE',
    target: 100,
    unit: '%',
    points: 100,
    rarity: 'EPIC',
  },
  {
    name: 'Balance Branch Complete',
    description: 'Completa el 100% de la rama de equilibrio',
    type: 'PROGRESS_MILESTONE',
    target: 100,
    unit: '%',
    points: 100,
    rarity: 'EPIC',
  },
  {
    name: 'Legs Branch Complete',
    description: 'Completa el 100% de la rama de tren inferior',
    type: 'PROGRESS_MILESTONE',
    target: 100,
    unit: '%',
    points: 100,
    rarity: 'EPIC',
  },
  {
    name: 'Statics Branch Complete',
    description: 'Completa el 100% de la rama de estáticos',
    type: 'PROGRESS_MILESTONE',
    target: 100,
    unit: '%',
    points: 150,
    rarity: 'LEGENDARY',
  },
  {
    name: 'Grand Master',
    description: 'Completa todas las ramas al 100%',
    type: 'PROGRESS_MILESTONE',
    target: 100,
    unit: '% all branches',
    points: 1000,
    rarity: 'LEGENDARY',
  },
];

// ======================
// LEVEL MILESTONES (10)
// ======================

export const levelAchievements: AchievementSeed[] = [
  {
    name: 'Novice',
    description: 'Alcanza el nivel 5',
    type: 'PROGRESS_MILESTONE',
    target: 5,
    unit: 'level',
    points: 10,
    rarity: 'COMMON',
  },
  {
    name: 'Apprentice',
    description: 'Alcanza el nivel 10',
    type: 'PROGRESS_MILESTONE',
    target: 10,
    unit: 'level',
    points: 25,
    rarity: 'COMMON',
  },
  {
    name: 'Adept',
    description: 'Alcanza el nivel 15',
    type: 'PROGRESS_MILESTONE',
    target: 15,
    unit: 'level',
    points: 40,
    rarity: 'UNCOMMON',
  },
  {
    name: 'Expert',
    description: 'Alcanza el nivel 20',
    type: 'PROGRESS_MILESTONE',
    target: 20,
    unit: 'level',
    points: 60,
    rarity: 'UNCOMMON',
  },
  {
    name: 'Master',
    description: 'Alcanza el nivel 30',
    type: 'PROGRESS_MILESTONE',
    target: 30,
    unit: 'level',
    points: 100,
    rarity: 'RARE',
  },
  {
    name: 'Grandmaster',
    description: 'Alcanza el nivel 50',
    type: 'PROGRESS_MILESTONE',
    target: 50,
    unit: 'level',
    points: 200,
    rarity: 'EPIC',
  },
  {
    name: 'Legend',
    description: 'Alcanza el nivel 75',
    type: 'PROGRESS_MILESTONE',
    target: 75,
    unit: 'level',
    points: 350,
    rarity: 'EPIC',
  },
  {
    name: 'Mythic',
    description: 'Alcanza el nivel 100',
    type: 'PROGRESS_MILESTONE',
    target: 100,
    unit: 'level',
    points: 500,
    rarity: 'LEGENDARY',
  },
  {
    name: 'Demigod',
    description: 'Alcanza el nivel 150',
    type: 'PROGRESS_MILESTONE',
    target: 150,
    unit: 'level',
    points: 750,
    rarity: 'LEGENDARY',
  },
  {
    name: 'Immortal',
    description: 'Alcanza el nivel 200',
    type: 'PROGRESS_MILESTONE',
    target: 200,
    unit: 'level',
    points: 1000,
    rarity: 'LEGENDARY',
  },
];

// ======================
// DAILY MISSIONS (10)
// ======================

export const dailyMissionAchievements: AchievementSeed[] = [
  {
    name: 'First Mission',
    description: 'Completa tu primera misión diaria',
    type: 'PROGRESS_MILESTONE',
    target: 1,
    unit: 'missions',
    points: 5,
    rarity: 'COMMON',
  },
  {
    name: 'Consistency',
    description: 'Mantén una racha de 7 días',
    type: 'STREAK',
    target: 7,
    unit: 'days',
    points: 25,
    rarity: 'UNCOMMON',
  },
  {
    name: 'Dedicated',
    description: 'Mantén una racha de 14 días',
    type: 'STREAK',
    target: 14,
    unit: 'days',
    points: 50,
    rarity: 'RARE',
  },
  {
    name: 'Committed',
    description: 'Mantén una racha de 30 días',
    type: 'STREAK',
    target: 30,
    unit: 'days',
    points: 100,
    rarity: 'EPIC',
  },
  {
    name: 'Unstoppable',
    description: 'Mantén una racha de 60 días',
    type: 'STREAK',
    target: 60,
    unit: 'days',
    points: 200,
    rarity: 'EPIC',
  },
  {
    name: 'Legendary Streak',
    description: 'Mantén una racha de 100 días',
    type: 'STREAK',
    target: 100,
    unit: 'days',
    points: 500,
    rarity: 'LEGENDARY',
  },
  {
    name: 'Mission Master',
    description: 'Completa 50 misiones diarias',
    type: 'PROGRESS_MILESTONE',
    target: 50,
    unit: 'missions',
    points: 50,
    rarity: 'UNCOMMON',
  },
  {
    name: 'Mission Legend',
    description: 'Completa 100 misiones diarias',
    type: 'PROGRESS_MILESTONE',
    target: 100,
    unit: 'missions',
    points: 100,
    rarity: 'RARE',
  },
  {
    name: 'Mission God',
    description: 'Completa 500 misiones diarias',
    type: 'PROGRESS_MILESTONE',
    target: 500,
    unit: 'missions',
    points: 300,
    rarity: 'EPIC',
  },
  {
    name: 'Perfect Week',
    description: 'Completa todas las misiones 7 días seguidos',
    type: 'STREAK',
    target: 7,
    unit: 'perfect days',
    points: 75,
    rarity: 'RARE',
  },
];

// ======================
// XP & STRENGTH (8)
// ======================

export const xpStrengthAchievements: AchievementSeed[] = [
  {
    name: 'XP Hunter',
    description: 'Acumula 1,000 XP total',
    type: 'PROGRESS_MILESTONE',
    target: 1000,
    unit: 'XP',
    points: 20,
    rarity: 'COMMON',
  },
  {
    name: 'XP Warrior',
    description: 'Acumula 5,000 XP total',
    type: 'PROGRESS_MILESTONE',
    target: 5000,
    unit: 'XP',
    points: 50,
    rarity: 'UNCOMMON',
  },
  {
    name: 'XP Legend',
    description: 'Acumula 10,000 XP total',
    type: 'PROGRESS_MILESTONE',
    target: 10000,
    unit: 'XP',
    points: 100,
    rarity: 'RARE',
  },
  {
    name: 'XP God',
    description: 'Acumula 50,000 XP total',
    type: 'PROGRESS_MILESTONE',
    target: 50000,
    unit: 'XP',
    points: 250,
    rarity: 'EPIC',
  },

  {
    name: 'Strength Seeker',
    description: 'Acumula 50 puntos de fuerza',
    type: 'PROGRESS_MILESTONE',
    target: 50,
    unit: 'strength',
    points: 25,
    rarity: 'UNCOMMON',
  },
  {
    name: 'Strength Builder',
    description: 'Acumula 100 puntos de fuerza',
    type: 'PROGRESS_MILESTONE',
    target: 100,
    unit: 'strength',
    points: 50,
    rarity: 'RARE',
  },
  {
    name: 'Strength Master',
    description: 'Acumula 500 puntos de fuerza',
    type: 'PROGRESS_MILESTONE',
    target: 500,
    unit: 'strength',
    points: 200,
    rarity: 'EPIC',
  },
  {
    name: 'Ultimate Strength',
    description: 'Acumula 1000 puntos de fuerza',
    type: 'PROGRESS_MILESTONE',
    target: 1000,
    unit: 'strength',
    points: 500,
    rarity: 'LEGENDARY',
  },
];

// ======================
// SPECIAL EVENTS (10)
// ======================

export const specialAchievements: AchievementSeed[] = [
  {
    name: 'First Steps',
    description: 'Completa el onboarding',
    type: 'SPECIAL_EVENT',
    target: 1,
    unit: 'onboarding',
    points: 10,
    rarity: 'COMMON',
  },
  {
    name: 'Routine Creator',
    description: 'Genera tu primera rutina personalizada',
    type: 'SPECIAL_EVENT',
    target: 1,
    unit: 'routine',
    points: 15,
    rarity: 'COMMON',
  },
  {
    name: 'Social Butterfly',
    description: 'Haz tu primer post en la comunidad',
    type: 'COMMUNITY_ENGAGEMENT',
    target: 1,
    unit: 'post',
    points: 10,
    rarity: 'COMMON',
  },
  {
    name: 'Helpful',
    description: 'Da 10 likes a otros usuarios',
    type: 'COMMUNITY_ENGAGEMENT',
    target: 10,
    unit: 'likes',
    points: 15,
    rarity: 'COMMON',
  },
  {
    name: 'Community Leader',
    description: 'Recibe 100 likes en tus posts',
    type: 'COMMUNITY_ENGAGEMENT',
    target: 100,
    unit: 'likes received',
    points: 100,
    rarity: 'RARE',
  },
  {
    name: 'Commentator',
    description: 'Haz 50 comentarios en posts de otros',
    type: 'COMMUNITY_ENGAGEMENT',
    target: 50,
    unit: 'comments',
    points: 50,
    rarity: 'UNCOMMON',
  },
  {
    name: 'Course Starter',
    description: 'Inscríbete en tu primer curso',
    type: 'COURSE_COMPLETION',
    target: 1,
    unit: 'enrollment',
    points: 15,
    rarity: 'COMMON',
  },
  {
    name: 'Course Complete',
    description: 'Completa tu primer curso al 100%',
    type: 'COURSE_COMPLETION',
    target: 1,
    unit: 'course',
    points: 50,
    rarity: 'UNCOMMON',
  },
  {
    name: 'Lifetime Learner',
    description: 'Completa 5 cursos',
    type: 'COURSE_COMPLETION',
    target: 5,
    unit: 'courses',
    points: 150,
    rarity: 'RARE',
  },
  {
    name: 'Early Bird',
    description: 'Entrena antes de las 7am',
    type: 'SPECIAL_EVENT',
    target: 1,
    unit: 'early workout',
    points: 25,
    rarity: 'UNCOMMON',
  },
];

// ======================
// WORKOUT COUNT (5)
// ======================

export const workoutAchievements: AchievementSeed[] = [
  {
    name: 'First Workout',
    description: 'Completa tu primer workout',
    type: 'WORKOUT_COUNT',
    target: 1,
    unit: 'workouts',
    points: 10,
    rarity: 'COMMON',
  },
  {
    name: 'Workout Warrior',
    description: 'Completa 10 workouts',
    type: 'WORKOUT_COUNT',
    target: 10,
    unit: 'workouts',
    points: 30,
    rarity: 'UNCOMMON',
  },
  {
    name: 'Workout Beast',
    description: 'Completa 50 workouts',
    type: 'WORKOUT_COUNT',
    target: 50,
    unit: 'workouts',
    points: 75,
    rarity: 'RARE',
  },
  {
    name: 'Workout Legend',
    description: 'Completa 100 workouts',
    type: 'WORKOUT_COUNT',
    target: 100,
    unit: 'workouts',
    points: 150,
    rarity: 'EPIC',
  },
  {
    name: 'Workout God',
    description: 'Completa 500 workouts',
    type: 'WORKOUT_COUNT',
    target: 500,
    unit: 'workouts',
    points: 500,
    rarity: 'LEGENDARY',
  },
];

// Combinar todos los achievements
export const allAchievements: AchievementSeed[] = [
  ...skillMasteryAchievements,
  ...branchCompletionAchievements,
  ...levelAchievements,
  ...dailyMissionAchievements,
  ...xpStrengthAchievements,
  ...specialAchievements,
  ...workoutAchievements,
];

console.log(`Total achievements: ${allAchievements.length}`);
console.log(`- Skill Mastery: ${skillMasteryAchievements.length}`);
console.log(`- Branch Completion: ${branchCompletionAchievements.length}`);
console.log(`- Level Milestones: ${levelAchievements.length}`);
console.log(`- Daily Missions: ${dailyMissionAchievements.length}`);
console.log(`- XP & Strength: ${xpStrengthAchievements.length}`);
console.log(`- Special Events: ${specialAchievements.length}`);
console.log(`- Workout Count: ${workoutAchievements.length}`);
