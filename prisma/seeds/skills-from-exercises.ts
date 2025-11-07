import exercisesAS from '../../database/exercises_AS_only.json';

// Helper function to map difficulty from exercises to skill difficulty
function mapDifficulty(difficulty: string): 'ADVANCED' | 'EXPERT' {
  if (difficulty.includes('S (')) return 'EXPERT';
  if (difficulty.includes('A (')) return 'ADVANCED';
  return 'ADVANCED'; // fallback
}

// Helper function to determine skill branch based on exercise characteristics
function determineBranch(exercise: any): 'EMPUJE' | 'TRACCION' | 'CORE' | 'EQUILIBRIO' | 'TREN_INFERIOR' | 'ESTATICOS' | 'CALENTAMIENTO' {
  const category = exercise.category;
  const muscles = exercise.muscleGroups || [];

  // Static skills branch
  if (category === 'SKILL_STATIC') {
    return 'ESTATICOS';
  }

  // Core-focused exercises
  if (category === 'CORE' ||
      muscles.some((m: string) => m.includes('CORE') || m.includes('Abs') || m.includes('HIP_FLEXORS'))) {
    // Check if it's actually a lever/planche (should go to ESTATICOS)
    if (exercise.name.toLowerCase().includes('planche') ||
        exercise.name.toLowerCase().includes('lever')) {
      return 'ESTATICOS';
    }
    return 'CORE';
  }

  // Pull/Back exercises
  if (muscles.some((m: string) =>
    m.includes('Lats') || m.includes('BACK') || m.includes('Upper Back')) &&
    !muscles.some((m: string) => m.includes('Pectorals') || m.includes('CHEST'))) {
    return 'TRACCION';
  }

  // Push/Chest exercises
  if (muscles.some((m: string) =>
    m.includes('Pectorals') || m.includes('CHEST') || m.includes('Triceps') || m.includes('TRICEPS')) &&
    !muscles.some((m: string) => m.includes('Lats') || m.includes('BACK'))) {
    return 'EMPUJE';
  }

  // Mixed push-pull (like muscle up)
  if (muscles.some((m: string) => m.includes('Lats') || m.includes('BACK')) &&
      muscles.some((m: string) => m.includes('Pectorals') || m.includes('CHEST'))) {
    return 'TRACCION'; // Muscle-ups are primarily pull
  }

  return 'ESTATICOS'; // Default fallback
}

// Helper function to map exercise category to SkillCategory
function mapSkillCategory(exercise: any): 'BASIC_MOVEMENTS' | 'PUSH_MOVEMENTS' | 'PULL_MOVEMENTS' | 'CORE_STRENGTH' | 'LEG_STRENGTH' | 'FLEXIBILITY' | 'BALANCE' | 'ADVANCED_SKILLS' | 'DYNAMIC_MOVEMENTS' | 'STATIC_ELEMENTS' {
  const category = exercise.category;
  const branch = determineBranch(exercise);

  if (category === 'SKILL_STATIC') {
    return 'STATIC_ELEMENTS';
  }

  if (category === 'CORE') {
    return 'CORE_STRENGTH';
  }

  if (branch === 'EMPUJE') {
    return 'PUSH_MOVEMENTS';
  }

  if (branch === 'TRACCION') {
    return 'PULL_MOVEMENTS';
  }

  if (branch === 'CORE') {
    return 'CORE_STRENGTH';
  }

  return 'ADVANCED_SKILLS';
}

// Helper to calculate strength requirements based on difficulty
function getStrengthRequirements(difficulty: string) {
  const isExpert = difficulty.includes('S (');
  return {
    requiredStrength: isExpert ? 75 : 55,
    strengthRequired: isExpert ? 40 : 25,
    strengthGained: isExpert ? 12 : 8,
  };
}

// Define prerequisite chains
const prerequisiteMap: Record<string, string[]> = {
  // Front Lever Progression
  'Advanced Tuck Front Lever': ['Tuck Front Lever'],
  'Front Lever (Una Pierna)': ['Advanced Tuck Front Lever'],
  'Straddle Front Lever': ['Front Lever (Una Pierna)'],
  'Full Front Lever': ['Straddle Front Lever'],

  // Back Lever Progression
  'Advanced Tuck Back Lever': ['Tuck Back Lever'],
  'Back Lever (Una Pierna)': ['Advanced Tuck Back Lever'],
  'Straddle Back Lever': ['Back Lever (Una Pierna)'],
  'Full Back Lever': ['Straddle Back Lever'],

  // Planche Progression
  'Planche Lean': ['Tuck Planche'],
  'Advanced Tuck Planche': ['Tuck Planche'],
  'Frog Planche': ['Advanced Tuck Planche'],
  'Straddle Planche': ['Frog Planche'],
  'Full Planche': ['Straddle Planche'],

  // Push-up Progression
  'Archer Push Up': [],
  'Plyo Push Up': ['Archer Push Up'],
  'Superman Push-up': ['Plyo Push Up'],
  'Flexiones Pseudo Planche': ['Superman Push-up'],
  'Full Planche Push-up': ['Flexiones Pseudo Planche', 'Full Planche'],
  'Stretched Full Planche Push-up': ['Full Planche Push-up'],

  // Pull-up Progression
  'Archer Pull Up': [],
  'L-Sit Pull-Ups': ['Archer Pull Up', 'L-Sit'],
  'Standing Archer': ['Archer Pull Up'],

  // Muscle Up Progression
  'Negative Muscle Up': ['L-Sit Pull-Ups'],
  'Muscle Up (Final Integration)': ['Negative Muscle Up'],
  'Muscle Up': ['Negative Muscle Up'],
  'Kipping Muscle Up': ['Muscle Up'],
  'Kipping Muscle Up With Triple': ['Kipping Muscle Up'],

  // L-Sit Progression
  'Tuck L-Sit': [],
  'L-Sit (Una Pierna)': ['Tuck L-Sit'],
  'L-Sit': ['L-Sit (Una Pierna)'],
  'L-sit On Floor': ['L-Sit'],
  'L-Sit en Suelo': ['L-Sit'],
  'L-Sit en Paralelas': ['L-Sit'],

  // V-Sit Progression
  'V-Sit': ['L-Sit'],
  'V-sit On Floor': ['L-Sit'],

  // Other exercises
  'Front Lever': ['Full Front Lever'],
  'Front Lever Reps': ['Front Front Lever'],
  'Back Lever': ['Full Back Lever'],
  'Lean Planche': ['Planche Lean'],
  'Handstand Push-up': ['Flexiones Pseudo Planche'],
  'Remos en Tuck Front Lever': ['Tuck Front Lever'],
};

// Build skills from exercises
export const skillsFromExercises = exercisesAS.map((exercise, index) => {
  const difficulty = mapDifficulty(exercise.difficulty);
  const branch = determineBranch(exercise);
  const category = mapSkillCategory(exercise);
  const strengthReqs = getStrengthRequirements(exercise.difficulty);

  return {
    name: exercise.name,
    description: exercise.description || `Advanced calisthenics skill: ${exercise.name}`,
    category,
    difficulty,
    branch,
    // Progression requirements (set to 0 for now, can be customized later)
    requiredStrength: 0,
    requiredEndurance: 0,
    requiredFlexibility: 0,
    requiredBalance: 0,
    // Strength system
    strengthRequired: strengthReqs.strengthRequired,
    strengthGained: strengthReqs.strengthGained,
    // RPG rewards
    xpReward: exercise.expReward || (difficulty === 'EXPERT' ? 38 : 26),
    coinReward: exercise.coinsReward || (difficulty === 'EXPERT' ? 19 : 13),
    order: index + 1,
    // Quest requirements
    requiredReps: exercise.unit === 'seconds' ? undefined : 5, // 5 reps for dynamic exercises
    requiredDuration: exercise.unit === 'seconds' ? 10 : undefined, // 10 seconds for static holds
    requiredDays: difficulty === 'EXPERT' ? 5 : 3,
    // Visual (using thumbnailUrl as imageUrl if available)
    iconUrl: exercise.thumbnailUrl || undefined,
    imageUrl: exercise.thumbnailUrl || undefined,
    // Prerequisite names (will be resolved to IDs during seeding)
    prerequisiteNames: prerequisiteMap[exercise.name] || [],
  };
});

export type SkillSeed = typeof skillsFromExercises[0];

// Group skills by branch for easier debugging
export const skillsByBranch = skillsFromExercises.reduce((acc, skill) => {
  if (!acc[skill.branch]) acc[skill.branch] = [];
  acc[skill.branch].push(skill);
  return acc;
}, {} as Record<string, typeof skillsFromExercises>);

// Export count by difficulty
export const skillCounts = {
  total: skillsFromExercises.length,
  advanced: skillsFromExercises.filter(s => s.difficulty === 'ADVANCED').length,
  expert: skillsFromExercises.filter(s => s.difficulty === 'EXPERT').length,
  byBranch: Object.entries(skillsByBranch).map(([branch, skills]) => ({
    branch,
    count: skills.length,
  })),
};
