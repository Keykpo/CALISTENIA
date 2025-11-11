/**
 * SEED: Ejercicios clasificados con Sistema D-S
 *
 * Este seed crea/actualiza ejercicios de calistenia con la clasificación D-S
 * usando los datos de exercises_D_C_reclassified.json y exercises_BAS_reclassified.json
 */

import { PrismaClient, Rank, ExerciseCategory, Difficulty } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Mapeo D-S → Difficulty (unified)
const DS_TO_DIFFICULTY: Record<string, Difficulty> = {
  'D': 'BEGINNER',
  'C': 'INTERMEDIATE',
  'B': 'ADVANCED',
  'A': 'ELITE',
  'S': 'ELITE',
};

// Mapeo D-S → Rank
const DS_TO_RANK: Record<string, Rank> = {
  'D': 'D',
  'D (Beginner)': 'D',
  'C': 'C',
  'C (Novice)': 'C',
  'B': 'B',
  'B (Intermediate)': 'B',
  'B+ (Intermediate+)': 'B',
  'B+ (Advanced)': 'B',
  'A': 'A',
  'A- (Advanced)': 'A',
  'A (Advanced)': 'A',
  'A+ (Advanced+)': 'A',
  'S': 'S',
  'S- (Expert)': 'S',
  'S (Expert)': 'S',
  'S+ (Expert+)': 'S',
};

// Mapeo category string → ExerciseCategory
const CATEGORY_MAP: Record<string, ExerciseCategory> = {
  'STRENGTH': 'STRENGTH',
  'SKILL_STATIC': 'STRENGTH',
  'CORE': 'STRENGTH',
  'BALANCE': 'STRENGTH',
  'MOBILITY': 'FLEXIBILITY',
};

interface ExerciseData {
  name: string;
  description?: string;
  category?: string;
  difficulty: string;
  unit?: string;
  muscleGroups?: string[];
  equipment?: string[];
  expReward?: number;
  coinsReward?: number;
  howTo?: string;
  gifUrl?: string | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  coachingTip?: string;
  id?: string;
  figLevel?: string;
  axis?: string;
  secondaryAxis?: string;
  sets?: string;
  xpReward?: number;
  note?: string;
}

async function main() {
  console.log('🌱 Starting D-S Exercise Seed...');

  // 1. Load JSON files
  const exercisesBasPath = path.join(__dirname, '../../DIFICULTAD COHERENTE/exercises_BAS_reclassified.json');

  if (!fs.existsSync(exercisesBasPath)) {
    console.error(`❌ File not found: ${exercisesBasPath}`);
    return;
  }

  const exercisesBasData: ExerciseData[] = JSON.parse(fs.readFileSync(exercisesBasPath, 'utf-8'));

  console.log(`📄 Loaded ${exercisesBasData.length} exercises from exercises_BAS_reclassified.json`);

  // 2. Process and upsert exercises
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const exercise of exercisesBasData) {
    // Skip metadata/comment objects
    if (!exercise.name) {
      skipped++;
      continue;
    }

    try {
      const difficulty = exercise.difficulty || 'B (Intermediate)';
      const rank = DS_TO_RANK[difficulty] || 'B';
      const difficultyEnum = DS_TO_DIFFICULTY[rank] || 'INTERMEDIATE';
      const category = CATEGORY_MAP[exercise.category || 'STRENGTH'] || 'STRENGTH';

      const exerciseData = {
        name: exercise.name,
        description: exercise.description || exercise.coachingTip || `${exercise.name} - ${difficulty}`,
        instructions: exercise.howTo || JSON.stringify([`Perform ${exercise.name}`]),
        category: category,
        difficulty: difficultyEnum,
        rank: rank,
        muscleGroups: JSON.stringify(exercise.muscleGroups || []),
        equipment: JSON.stringify(exercise.equipment || ['NONE']),
        videoUrl: exercise.videoUrl,
        imageUrl: exercise.gifUrl,
        thumbnailUrl: exercise.thumbnailUrl || exercise.gifUrl,
        duration: null,
        calories: null,
      };

      // Upsert by name (unique constraint)
      const result = await prisma.exercise.upsert({
        where: { name: exercise.name },
        create: exerciseData,
        update: {
          description: exerciseData.description,
          instructions: exerciseData.instructions,
          category: exerciseData.category,
          difficulty: exerciseData.difficulty,
          rank: exerciseData.rank,
          muscleGroups: exerciseData.muscleGroups,
          equipment: exerciseData.equipment,
          videoUrl: exerciseData.videoUrl,
          imageUrl: exerciseData.imageUrl,
          thumbnailUrl: exerciseData.thumbnailUrl,
        },
      });

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        created++;
      } else {
        updated++;
      }

      console.log(`✅ ${rank} | ${exercise.name}`);

    } catch (error) {
      console.error(`❌ Error processing ${exercise.name}:`, error);
      skipped++;
    }
  }

  console.log('\n📊 Seed Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📦 Total processed: ${created + updated + skipped}`);
  console.log('\n✨ D-S Exercise Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
