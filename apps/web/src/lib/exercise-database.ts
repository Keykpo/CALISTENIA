/**
 * Exercise Database Utility
 *
 * Provides exercise details (instructions, GIFs) from the exercises database
 */

export interface ExerciseDetails {
  exerciseId: string;
  name: string;
  gifUrl: string;
  localGifPath: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

interface ExerciseDatabaseEntry {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

let exerciseDatabase: ExerciseDatabaseEntry[] | null = null;

/**
 * Load exercises database from public folder
 */
async function loadExerciseDatabase(): Promise<ExerciseDatabaseEntry[]> {
  if (exerciseDatabase) {
    return exerciseDatabase;
  }

  try {
    const response = await fetch('/ejerciciosgifs/exercises.json');
    if (!response.ok) {
      console.error('[EXERCISE_DB] Failed to load exercises:', response.status);
      return [];
    }

    exerciseDatabase = await response.json();
    console.log('[EXERCISE_DB] Loaded', exerciseDatabase?.length || 0, 'exercises');
    return exerciseDatabase || [];
  } catch (error) {
    console.error('[EXERCISE_DB] Error loading exercises:', error);
    return [];
  }
}

/**
 * Normalize exercise name for matching
 */
function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeExerciseName(str1);
  const norm2 = normalizeExerciseName(str2);

  // Exact match
  if (norm1 === norm2) return 1.0;

  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return 0.9;
  }

  // Word-based matching
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');

  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);

  return commonWords.length / totalWords;
}

/**
 * Manual mapping for common calisthenics exercises that might not match exactly
 */
const MANUAL_EXERCISE_MAPPING: Record<string, string> = {
  // Push exercises
  'push-ups': 'push-up',
  'pushups': 'push-up',
  'diamond push-ups': 'diamond push-up',
  'pike push-ups': 'pike push-up',
  'decline push-ups': 'decline push-up',

  // Pull exercises
  'pull-ups': 'pull-up',
  'pullups': 'pull-up',
  'chin-ups': 'chin-up',
  'chinups': 'chin-up',
  'australian pull-ups': 'australian pull up',
  'inverted rows': 'inverted row',

  // Legs
  'squats': 'squat',
  'bodyweight squats': 'squat',
  'pistol squats': 'pistol squat',
  'lunges': 'lunge',
  'bulgarian split squats': 'bulgarian split squat',

  // Core
  'planks': 'plank',
  'plank hold': 'plank',
  'side planks': 'side plank',
  'hanging leg raises': 'hanging leg raise',
  'l-sit hold': 'l sit',
  'dragon flag': 'dragon flag',

  // Dips
  'dips': 'dip',
  'parallel bar dips': 'dip',
  'ring dips': 'ring dip',

  // Skills
  'handstand hold': 'handstand',
  'handstand push-ups': 'handstand push-up',
  'l-sit': 'l sit',
  'front lever': 'front lever',
  'back lever': 'back lever',
  'planche hold': 'planche',

  // Mobility
  'wrist circles': 'wrist circles',
  'shoulder rotations': 'shoulder circles',
  'arm circles': 'arm circles',
  'leg swings': 'leg swings',
  'cat-cow stretch': 'cat cow yoga pose',
  'downward dog': 'downward facing dog',

  // Weighted
  'weighted pull-ups': 'weighted pull up',
  'weighted dips': 'weighted dip',
  'weighted push-ups': 'weighted push up',
};

/**
 * Find exercise details by name
 */
export async function findExerciseByName(exerciseName: string): Promise<ExerciseDetails | null> {
  const database = await loadExerciseDatabase();

  if (!database || database.length === 0) {
    console.warn('[EXERCISE_DB] Database not loaded');
    return null;
  }

  // Try manual mapping first
  const normalizedInput = normalizeExerciseName(exerciseName);
  const mappedName = MANUAL_EXERCISE_MAPPING[normalizedInput];

  if (mappedName) {
    const exactMatch = database.find(ex => normalizeExerciseName(ex.name) === normalizeExerciseName(mappedName));
    if (exactMatch) {
      return convertToExerciseDetails(exactMatch);
    }
  }

  // Try exact match
  const exactMatch = database.find(ex => normalizeExerciseName(ex.name) === normalizedInput);
  if (exactMatch) {
    return convertToExerciseDetails(exactMatch);
  }

  // Try fuzzy matching
  const matches = database.map(ex => ({
    exercise: ex,
    score: calculateSimilarity(exerciseName, ex.name)
  })).filter(m => m.score > 0.6) // Only matches with >60% similarity
    .sort((a, b) => b.score - a.score);

  if (matches.length > 0) {
    console.log(`[EXERCISE_DB] Found match for "${exerciseName}": "${matches[0].exercise.name}" (score: ${matches[0].score.toFixed(2)})`);
    return convertToExerciseDetails(matches[0].exercise);
  }

  console.warn(`[EXERCISE_DB] No match found for: "${exerciseName}"`);
  return null;
}

/**
 * Convert database entry to ExerciseDetails with local GIF path
 */
function convertToExerciseDetails(entry: ExerciseDatabaseEntry): ExerciseDetails {
  // Extract GIF filename from URL
  const gifFilename = entry.gifUrl.split('/').pop() || '';

  return {
    exerciseId: entry.exerciseId,
    name: entry.name,
    gifUrl: entry.gifUrl,
    localGifPath: `/ejerciciosgifs/media/${gifFilename}`,
    targetMuscles: entry.targetMuscles,
    bodyParts: entry.bodyParts,
    equipments: entry.equipments,
    secondaryMuscles: entry.secondaryMuscles,
    instructions: entry.instructions,
  };
}

/**
 * Batch find exercises by names (useful for routine generation)
 */
export async function findExercisesByNames(exerciseNames: string[]): Promise<Map<string, ExerciseDetails | null>> {
  const results = new Map<string, ExerciseDetails | null>();

  for (const name of exerciseNames) {
    const details = await findExerciseByName(name);
    results.set(name, details);
  }

  return results;
}

/**
 * Preload exercise database (call this on app initialization)
 */
export async function preloadExerciseDatabase(): Promise<void> {
  await loadExerciseDatabase();
}
