import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Load exercises from JSON file
function loadExercises() {
  const filePath = path.join(__dirname, '..', '..', 'database', 'exercises_biomech_modified.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

// Define the 9 Achievement Chains with 5 levels each
const achievementChains = [
  {
    chainName: 'Push-up Chain',
    type: 'EXERCISE_MASTERY' as const,
    levels: [
      {
        level: 1,
        name: 'Push-up Chain: Level 1',
        description: 'Complete 20 push-ups with proper form',
        target: 20,
        unit: 'reps',
        points: 50,
        rarity: 'NOVICE' as const,
        exerciseIds: ['push-up', 'knee-push-up', 'incline-push-up'],
      },
      {
        level: 2,
        name: 'Push-up Chain: Level 2',
        description: 'Complete 50 push-ups with proper form',
        target: 50,
        unit: 'reps',
        points: 100,
        rarity: 'INTERMEDIATE' as const,
        exerciseIds: ['push-up', 'wide-push-up', 'diamond-push-up'],
      },
      {
        level: 3,
        name: 'Push-up Chain: Level 3',
        description: 'Complete 100 push-ups in a single session',
        target: 100,
        unit: 'reps',
        points: 200,
        rarity: 'ADVANCED' as const,
        exerciseIds: ['push-up', 'archer-push-up', 'pseudo-planche-push-up'],
      },
      {
        level: 4,
        name: 'Push-up Chain: Level 4',
        description: 'Complete 20 one-arm push-ups (each arm)',
        target: 20,
        unit: 'reps',
        points: 400,
        rarity: 'EXPERT' as const,
        exerciseIds: ['one-arm-push-up', 'archer-push-up'],
      },
      {
        level: 5,
        name: 'Push-up Chain: Level 5',
        description: 'Master 10 planche push-ups',
        target: 10,
        unit: 'reps',
        points: 1000,
        rarity: 'LEGENDARY' as const,
        exerciseIds: ['planche-push-up', 'skill_planche_pushup'],
      },
    ],
  },
  {
    chainName: 'Pull-up Chain',
    type: 'EXERCISE_MASTERY' as const,
    levels: [
      {
        level: 1,
        name: 'Pull-up Chain: Level 1',
        description: 'Complete 5 pull-ups with proper form',
        target: 5,
        unit: 'reps',
        points: 50,
        rarity: 'NOVICE' as const,
        exerciseIds: ['pull-up', 'assisted-pull-up', 'negative-pull-up'],
      },
      {
        level: 2,
        name: 'Pull-up Chain: Level 2',
        description: 'Complete 15 pull-ups with proper form',
        target: 15,
        unit: 'reps',
        points: 100,
        rarity: 'INTERMEDIATE' as const,
        exerciseIds: ['pull-up', 'wide-grip-pull-up', 'chin-up'],
      },
      {
        level: 3,
        name: 'Pull-up Chain: Level 3',
        description: 'Complete 30 pull-ups in a single session',
        target: 30,
        unit: 'reps',
        points: 200,
        rarity: 'ADVANCED' as const,
        exerciseIds: ['pull-up', 'l-sit-pull-up', 'typewriter-pull-up'],
      },
      {
        level: 4,
        name: 'Pull-up Chain: Level 4',
        description: 'Complete 10 one-arm pull-ups (each arm)',
        target: 10,
        unit: 'reps',
        points: 400,
        rarity: 'EXPERT' as const,
        exerciseIds: ['one-arm-pull-up', 'assisted-one-arm-pull-up'],
      },
      {
        level: 5,
        name: 'Pull-up Chain: Level 5',
        description: 'Master 5 muscle-ups',
        target: 5,
        unit: 'reps',
        points: 1000,
        rarity: 'LEGENDARY' as const,
        exerciseIds: ['muscle-up', 'skill_muscle_up'],
      },
    ],
  },
  {
    chainName: 'Dips Chain',
    type: 'EXERCISE_MASTERY' as const,
    levels: [
      {
        level: 1,
        name: 'Dips Chain: Level 1',
        description: 'Complete 10 parallel bar dips',
        target: 10,
        unit: 'reps',
        points: 50,
        rarity: 'NOVICE' as const,
        exerciseIds: ['dip', 'assisted-dip', 'bench-dip'],
      },
      {
        level: 2,
        name: 'Dips Chain: Level 2',
        description: 'Complete 25 parallel bar dips',
        target: 25,
        unit: 'reps',
        points: 100,
        rarity: 'INTERMEDIATE' as const,
        exerciseIds: ['dip', 'weighted-dip', 'ring-dip'],
      },
      {
        level: 3,
        name: 'Dips Chain: Level 3',
        description: 'Complete 50 dips in a single session',
        target: 50,
        unit: 'reps',
        points: 200,
        rarity: 'ADVANCED' as const,
        exerciseIds: ['dip', 'korean-dip', 'impossible-dip'],
      },
      {
        level: 4,
        name: 'Dips Chain: Level 4',
        description: 'Complete 20 weighted dips (+20kg)',
        target: 20,
        unit: 'reps',
        points: 400,
        rarity: 'EXPERT' as const,
        exerciseIds: ['weighted-dip', 'ring-dip'],
      },
      {
        level: 5,
        name: 'Dips Chain: Level 5',
        description: 'Master 10 Russian dips',
        target: 10,
        unit: 'reps',
        points: 1000,
        rarity: 'LEGENDARY' as const,
        exerciseIds: ['russian-dip', 'impossible-dip'],
      },
    ],
  },
  {
    chainName: 'Legs Chain',
    type: 'EXERCISE_MASTERY' as const,
    levels: [
      {
        level: 1,
        name: 'Legs Chain: Level 1',
        description: 'Complete 30 squats with proper form',
        target: 30,
        unit: 'reps',
        points: 50,
        rarity: 'NOVICE' as const,
        exerciseIds: ['squat', 'bodyweight-squat', 'box-squat'],
      },
      {
        level: 2,
        name: 'Legs Chain: Level 2',
        description: 'Complete 50 jump squats',
        target: 50,
        unit: 'reps',
        points: 100,
        rarity: 'INTERMEDIATE' as const,
        exerciseIds: ['jump-squat', 'squat', 'jump'],
      },
      {
        level: 3,
        name: 'Legs Chain: Level 3',
        description: 'Complete 20 single-leg squats (each leg)',
        target: 20,
        unit: 'reps',
        points: 200,
        rarity: 'ADVANCED' as const,
        exerciseIds: ['pistol-squat', 'single-leg-squat', 'assisted-pistol-squat'],
      },
      {
        level: 4,
        name: 'Legs Chain: Level 4',
        description: 'Complete 30 pistol squats (each leg)',
        target: 30,
        unit: 'reps',
        points: 400,
        rarity: 'EXPERT' as const,
        exerciseIds: ['pistol-squat', 'skill_pistol_squat'],
      },
      {
        level: 5,
        name: 'Legs Chain: Level 5',
        description: 'Master 10 shrimp squats (each leg)',
        target: 10,
        unit: 'reps',
        points: 1000,
        rarity: 'LEGENDARY' as const,
        exerciseIds: ['shrimp-squat', 'skill_shrimp_squat'],
      },
    ],
  },
  {
    chainName: 'Core Chain',
    type: 'EXERCISE_MASTERY' as const,
    levels: [
      {
        level: 1,
        name: 'Core Chain: Level 1',
        description: 'Hold a plank for 60 seconds',
        target: 60,
        unit: 'seconds',
        points: 50,
        rarity: 'NOVICE' as const,
        exerciseIds: ['plank', 'elbow-plank', 'high-plank'],
      },
      {
        level: 2,
        name: 'Core Chain: Level 2',
        description: 'Hold a plank for 2 minutes',
        target: 120,
        unit: 'seconds',
        points: 100,
        rarity: 'INTERMEDIATE' as const,
        exerciseIds: ['plank', 'side-plank', 'plank-shoulder-tap'],
      },
      {
        level: 3,
        name: 'Core Chain: Level 3',
        description: 'Hold an L-sit for 30 seconds',
        target: 30,
        unit: 'seconds',
        points: 200,
        rarity: 'ADVANCED' as const,
        exerciseIds: ['l-sit', 'skill_l-sit', 'tuck-l-sit'],
      },
      {
        level: 4,
        name: 'Core Chain: Level 4',
        description: 'Hold an L-sit for 60 seconds',
        target: 60,
        unit: 'seconds',
        points: 400,
        rarity: 'EXPERT' as const,
        exerciseIds: ['l-sit', 'skill_l-sit', 'v-sit'],
      },
      {
        level: 5,
        name: 'Core Chain: Level 5',
        description: 'Complete 5 dragon flags',
        target: 5,
        unit: 'reps',
        points: 1000,
        rarity: 'LEGENDARY' as const,
        exerciseIds: ['dragon-flag', 'skill_dragon_flag'],
      },
    ],
  },
  {
    chainName: 'Front Lever Chain',
    type: 'EXERCISE_MASTERY' as const,
    levels: [
      {
        level: 1,
        name: 'Front Lever Chain: Level 1',
        description: 'Hold a tuck front lever for 10 seconds',
        target: 10,
        unit: 'seconds',
        points: 100,
        rarity: 'NOVICE' as const,
        exerciseIds: ['skill_front_lever_tuck', 'tuck-front-lever'],
      },
      {
        level: 2,
        name: 'Front Lever Chain: Level 2',
        description: 'Hold an advanced tuck front lever for 10 seconds',
        target: 10,
        unit: 'seconds',
        points: 200,
        rarity: 'INTERMEDIATE' as const,
        exerciseIds: ['skill_front_lever_adv_tuck', 'advanced-tuck-front-lever'],
      },
      {
        level: 3,
        name: 'Front Lever Chain: Level 3',
        description: 'Hold a one-leg front lever for 10 seconds',
        target: 10,
        unit: 'seconds',
        points: 400,
        rarity: 'ADVANCED' as const,
        exerciseIds: ['skill_front_lever_one_leg', 'one-leg-front-lever'],
      },
      {
        level: 4,
        name: 'Front Lever Chain: Level 4',
        description: 'Hold a straddle front lever for 10 seconds',
        target: 10,
        unit: 'seconds',
        points: 600,
        rarity: 'EXPERT' as const,
        exerciseIds: ['skill_front_lever_straddle', 'straddle-front-lever'],
      },
      {
        level: 5,
        name: 'Front Lever Chain: Level 5',
        description: 'Hold a full front lever for 10 seconds',
        target: 10,
        unit: 'seconds',
        points: 1500,
        rarity: 'LEGENDARY' as const,
        exerciseIds: ['skill_front_lever', 'front-lever'],
      },
    ],
  },
  {
    chainName: 'Planche Chain',
    type: 'EXERCISE_MASTERY' as const,
    levels: [
      {
        level: 1,
        name: 'Planche Chain: Level 1',
        description: 'Hold a tuck planche for 10 seconds',
        target: 10,
        unit: 'seconds',
        points: 100,
        rarity: 'NOVICE' as const,
        exerciseIds: ['skill_planche_tuck', 'tuck-planche'],
      },
      {
        level: 2,
        name: 'Planche Chain: Level 2',
        description: 'Hold an advanced tuck planche for 10 seconds',
        target: 10,
        unit: 'seconds',
        points: 200,
        rarity: 'INTERMEDIATE' as const,
        exerciseIds: ['skill_planche_adv_tuck', 'advanced-tuck-planche'],
      },
      {
        level: 3,
        name: 'Planche Chain: Level 3',
        description: 'Hold a one-leg planche for 10 seconds',
        target: 10,
        unit: 'seconds',
        points: 400,
        rarity: 'ADVANCED' as const,
        exerciseIds: ['skill_planche_one_leg', 'one-leg-planche'],
      },
      {
        level: 4,
        name: 'Planche Chain: Level 4',
        description: 'Hold a straddle planche for 10 seconds',
        target: 10,
        unit: 'seconds',
        points: 600,
        rarity: 'EXPERT' as const,
        exerciseIds: ['skill_planche_straddle', 'straddle-planche'],
      },
      {
        level: 5,
        name: 'Planche Chain: Level 5',
        description: 'Hold a full planche for 10 seconds',
        target: 10,
        unit: 'seconds',
        points: 1500,
        rarity: 'LEGENDARY' as const,
        exerciseIds: ['skill_planche', 'planche'],
      },
    ],
  },
  {
    chainName: 'Handstand Chain',
    type: 'EXERCISE_MASTERY' as const,
    levels: [
      {
        level: 1,
        name: 'Handstand Chain: Level 1',
        description: 'Hold a wall handstand for 30 seconds',
        target: 30,
        unit: 'seconds',
        points: 50,
        rarity: 'NOVICE' as const,
        exerciseIds: ['wall-handstand', 'skill_handstand_wall'],
      },
      {
        level: 2,
        name: 'Handstand Chain: Level 2',
        description: 'Hold a wall handstand for 60 seconds',
        target: 60,
        unit: 'seconds',
        points: 100,
        rarity: 'INTERMEDIATE' as const,
        exerciseIds: ['wall-handstand', 'skill_handstand_wall'],
      },
      {
        level: 3,
        name: 'Handstand Chain: Level 3',
        description: 'Hold a freestanding handstand for 15 seconds',
        target: 15,
        unit: 'seconds',
        points: 300,
        rarity: 'ADVANCED' as const,
        exerciseIds: ['handstand', 'skill_handstand'],
      },
      {
        level: 4,
        name: 'Handstand Chain: Level 4',
        description: 'Hold a freestanding handstand for 30 seconds',
        target: 30,
        unit: 'seconds',
        points: 500,
        rarity: 'EXPERT' as const,
        exerciseIds: ['handstand', 'skill_handstand'],
      },
      {
        level: 5,
        name: 'Handstand Chain: Level 5',
        description: 'Complete 10 handstand push-ups',
        target: 10,
        unit: 'reps',
        points: 1200,
        rarity: 'LEGENDARY' as const,
        exerciseIds: ['handstand-push-up', 'skill_handstand_pushup'],
      },
    ],
  },
  {
    chainName: 'Wellness Chain',
    type: 'WORKOUT_COUNT' as const,
    levels: [
      {
        level: 1,
        name: 'Wellness Chain: Level 1',
        description: 'Complete 7 consecutive days of training',
        target: 7,
        unit: 'days',
        points: 50,
        rarity: 'NOVICE' as const,
        exerciseIds: [],
      },
      {
        level: 2,
        name: 'Wellness Chain: Level 2',
        description: 'Complete 30 consecutive days of training',
        target: 30,
        unit: 'days',
        points: 150,
        rarity: 'INTERMEDIATE' as const,
        exerciseIds: [],
      },
      {
        level: 3,
        name: 'Wellness Chain: Level 3',
        description: 'Complete 90 consecutive days of training',
        target: 90,
        unit: 'days',
        points: 400,
        rarity: 'ADVANCED' as const,
        exerciseIds: [],
      },
      {
        level: 4,
        name: 'Wellness Chain: Level 4',
        description: 'Complete 180 consecutive days of training',
        target: 180,
        unit: 'days',
        points: 800,
        rarity: 'EXPERT' as const,
        exerciseIds: [],
      },
      {
        level: 5,
        name: 'Wellness Chain: Level 5',
        description: 'Complete 365 consecutive days of training',
        target: 365,
        unit: 'days',
        points: 2000,
        rarity: 'LEGENDARY' as const,
        exerciseIds: [],
      },
    ],
  },
];

async function main() {
  console.log('🏆 Seeding Achievement Chains...');

  // Load exercises to verify IDs exist
  const exercises = loadExercises();
  const exerciseIds = new Set(exercises.map((ex: any) => ex.id));

  // Clean existing achievements
  console.log('  Cleaning existing achievements...');
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();

  let totalCreated = 0;

  // Create all chains
  for (const chain of achievementChains) {
    console.log(`\n  Creating ${chain.chainName}...`);

    const createdAchievements: any[] = [];

    // Create all achievements in the chain first
    for (const level of chain.levels) {
      // Verify exercise IDs exist (skip validation for Wellness chain)
      if (level.exerciseIds.length > 0) {
        const missingIds = level.exerciseIds.filter((id) => !exerciseIds.has(id));
        if (missingIds.length > 0) {
          console.warn(`    ⚠️  Warning: Exercise IDs not found: ${missingIds.join(', ')}`);
        }
      }

      const achievement = await prisma.achievement.create({
        data: {
          name: level.name,
          description: level.description,
          type: chain.type,
          target: level.target,
          unit: level.unit,
          level: level.level,
          chainName: chain.chainName,
          points: level.points,
          rarity: level.rarity,
        },
      });

      createdAchievements.push(achievement);
      console.log(`    ✓ Level ${level.level}: ${level.name}`);
      totalCreated++;
    }

    // Link achievements in chain
    for (let i = 0; i < createdAchievements.length - 1; i++) {
      const currentAchievement = createdAchievements[i];
      const nextAchievement = createdAchievements[i + 1];

      await prisma.achievement.update({
        where: { id: currentAchievement.id },
        data: {
          unlocksAchievementId: nextAchievement.id,
        },
      });

      console.log(`    🔗 Linked Level ${i + 1} → Level ${i + 2}`);
    }
  }

  console.log(`\n✅ Successfully created ${totalCreated} achievements across ${achievementChains.length} chains!`);
  console.log('\n📊 Summary:');
  for (const chain of achievementChains) {
    console.log(`  • ${chain.chainName}: ${chain.levels.length} levels`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding achievement chains:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
