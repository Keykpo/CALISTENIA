import exercisesAS from '../../database/exercises_AS_only.json';

function translateNameToEnglish(name: string): string {
  const map: Record<string, string> = {
    'Flexiones Pseudo Planche': 'Pseudo Planche Push-up',
    'Archer Push Up': 'Archer Push-ups',
    'Archer Pull Up': 'Archer Pull-ups',
    'L-Sit en Suelo': 'L-Sit on Floor',
    'L-sit On Floor': 'L-Sit on Floor',
    'L-Sit en Paralelas': 'L-Sit on Parallel Bars',
    'Front Lever (Una Pierna)': 'Front Lever (One Leg)',
    'Back Lever (Una Pierna)': 'Back Lever (One Leg)',
    'Remos en Tuck Front Lever': 'Tuck Front Lever Rows',
    'Círculos de Brazos': 'Arm Circles',
    'Rotaciones de Muñecas': 'Wrist Rotations',
    'Gato-Camello': 'Cat-Cow',
    'Estiramiento de Hombros': 'Shoulder Stretch',
    'Plyo Push Up': 'Plyometric Push-up',
    'V-sit On Floor': 'V-Sit on Floor',
  };
  return map[name] ?? name;
}

function mapDifficulty(difficulty: string): 'ADVANCED' | 'EXPERT' {
  if (difficulty.includes('S (')) return 'EXPERT';
  if (difficulty.includes('A (')) return 'ADVANCED';
  return 'ADVANCED';
}

function determineBranch(exercise: any): 'EMPUJE' | 'TRACCION' | 'CORE' | 'EQUILIBRIO' | 'TREN_INFERIOR' | 'ESTATICOS' | 'CALENTAMIENTO' {
  const category = exercise.category;
  const muscles = exercise.muscleGroups || [];
  if (category === 'SKILL_STATIC') return 'ESTATICOS';
  if (category === 'CORE' || muscles.some((m: string) => m.includes('CORE') || m.includes('Abs') || m.includes('HIP_FLEXORS'))) {
    if (exercise.name.toLowerCase().includes('planche') || exercise.name.toLowerCase().includes('lever')) {
      return 'ESTATICOS';
    }
    return 'CORE';
  }
  if (muscles.some((m: string) => m.includes('Lats') || m.includes('BACK') || m.includes('Upper Back')) && !muscles.some((m: string) => m.includes('Pectorals') || m.includes('CHEST'))) {
    return 'TRACCION';
  }
  if (muscles.some((m: string) => m.includes('Pectorals') || m.includes('CHEST') || m.includes('Triceps') || m.includes('TRICEPS')) && !muscles.some((m: string) => m.includes('Lats') || m.includes('BACK'))) {
    return 'EMPUJE';
  }
  if (muscles.some((m: string) => m.includes('Lats') || m.includes('BACK')) && muscles.some((m: string) => m.includes('Pectorals') || m.includes('CHEST'))) {
    return 'TRACCION';
  }
  return 'ESTATICOS';
}

function mapSkillCategory(exercise: any): 'BASIC_MOVEMENTS' | 'PUSH_MOVEMENTS' | 'PULL_MOVEMENTS' | 'CORE_STRENGTH' | 'LEG_STRENGTH' | 'FLEXIBILITY' | 'BALANCE' | 'ADVANCED_SKILLS' | 'DYNAMIC_MOVEMENTS' | 'STATIC_ELEMENTS' {
  const category = exercise.category;
  const branch = determineBranch(exercise);
  if (category === 'SKILL_STATIC') return 'STATIC_ELEMENTS';
  if (category === 'CORE') return 'CORE_STRENGTH';
  if (branch === 'EMPUJE') return 'PUSH_MOVEMENTS';
  if (branch === 'TRACCION') return 'PULL_MOVEMENTS';
  if (branch === 'CORE') return 'CORE_STRENGTH';
  return 'ADVANCED_SKILLS';
}

function getStrengthRequirements(difficulty: string) {
  const isExpert = difficulty.includes('S (');
  return {
    requiredStrength: isExpert ? 75 : 55,
    strengthRequired: isExpert ? 40 : 25,
    strengthGained: isExpert ? 12 : 8,
  };
}

const prerequisiteMap: Record<string, string[]> = {
  'Advanced Tuck Front Lever': ['Tuck Front Lever'],
  'Front Lever (One Leg)': ['Advanced Tuck Front Lever'],
  'Straddle Front Lever': ['Front Lever (One Leg)'],
  'Full Front Lever': ['Straddle Front Lever'],

  'Advanced Tuck Back Lever': ['Tuck Back Lever'],
  'Back Lever (One Leg)': ['Advanced Tuck Back Lever'],
  'Straddle Back Lever': ['Back Lever (One Leg)'],
  'Full Back Lever': ['Straddle Back Lever'],

  'Planche Lean': ['Tuck Planche'],
  'Advanced Tuck Planche': ['Tuck Planche'],
  'Frog Planche': ['Advanced Tuck Planche'],
  'Straddle Planche': ['Frog Planche'],
  'Full Planche': ['Straddle Planche'],

  'Archer Push-ups': [],
  'Plyometric Push-up': ['Archer Push-ups'],
  'Superman Push-up': ['Plyometric Push-up'],
  'Pseudo Planche Push-up': ['Superman Push-up'],
  'Full Planche Push-up': ['Pseudo Planche Push-up', 'Full Planche'],
  'Stretched Full Planche Push-up': ['Full Planche Push-up'],

  'Archer Pull-ups': [],
  'L-sit Pull-ups': ['Archer Pull-ups', 'L-Sit'],
  'Standing Archer': ['Archer Pull-ups'],

  'Negative Muscle Up': ['L-sit Pull-ups'],
  'Muscle Up (Final Integration)': ['Negative Muscle Up'],
  'Muscle Up': ['Negative Muscle Up'],
  'Kipping Muscle Up': ['Muscle Up'],
  'Kipping Muscle Up With Triple': ['Kipping Muscle Up'],

  'Tuck L-Sit': [],
  'L-Sit (One Leg)': ['Tuck L-Sit'],
  'L-Sit': ['L-Sit (One Leg)'],
  'L-Sit on Floor': ['L-Sit'],
  'L-Sit on Parallel Bars': ['L-Sit'],

  'V-Sit': ['L-Sit'],
  'V-Sit on Floor': ['L-Sit'],

  'Front Lever': ['Full Front Lever'],
  'Front Lever Reps': ['Full Front Lever'],
  'Back Lever': ['Full Back Lever'],
  'Handstand Push-up': ['Pseudo Planche Push-up'],
  'Tuck Front Lever Rows': ['Tuck Front Lever'],
};

export const skillsFromExercises = exercisesAS.map((exercise, index) => {
  const difficulty = mapDifficulty(exercise.difficulty);
  const branch = determineBranch(exercise);
  const category = mapSkillCategory(exercise);
  const strengthReqs = getStrengthRequirements(exercise.difficulty);
  const englishName = translateNameToEnglish(exercise.name);

  return {
    name: englishName,
    description: exercise.description || `Advanced calisthenics skill: ${englishName}`,
    category,
    difficulty,
    branch,
    requiredStrength: 0,
    requiredEndurance: 0,
    requiredFlexibility: 0,
    requiredBalance: 0,
    strengthRequired: strengthReqs.strengthRequired,
    strengthGained: strengthReqs.strengthGained,
    xpReward: exercise.expReward || (difficulty === 'EXPERT' ? 38 : 26),
    coinReward: exercise.coinsReward || (difficulty === 'EXPERT' ? 19 : 13),
    order: index + 1,
    requiredReps: exercise.unit === 'seconds' ? undefined : 5,
    requiredDuration: exercise.unit === 'seconds' ? 10 : undefined,
    requiredDays: difficulty === 'EXPERT' ? 5 : 3,
    iconUrl: exercise.thumbnailUrl || undefined,
    imageUrl: exercise.thumbnailUrl || undefined,
    prerequisiteNames: (prerequisiteMap[englishName] || prerequisiteMap[exercise.name] || []).map(translateNameToEnglish),
  };
});

export type SkillSeed = typeof skillsFromExercises[0];

export const skillsByBranch = skillsFromExercises.reduce((acc, skill) => {
  if (!acc[skill.branch]) acc[skill.branch] = [];
  acc[skill.branch].push(skill);
  return acc;
}, {} as Record<string, typeof skillsFromExercises>);

export const skillCounts = {
  total: skillsFromExercises.length,
  advanced: skillsFromExercises.filter(s => s.difficulty === 'ADVANCED').length,
  expert: skillsFromExercises.filter(s => s.difficulty === 'EXPERT').length,
  byBranch: Object.entries(skillsByBranch).map(([branch, skills]) => ({
    branch,
    count: skills.length,
  })),
};
