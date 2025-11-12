const fs = require('fs');
const path = require('path');

// Read the DIFICULTAD COHERENTE exercises
const sourcePath = path.join(__dirname, '..', 'DIFICULTAD COHERENTE', 'exercises.json');
const sourceExercises = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));

console.log(`📚 Total exercises in source: ${sourceExercises.length}`);

// Filter only body weight exercises (calisthenics)
const bodyWeightExercises = sourceExercises.filter(ex =>
  ex.equipments.some(eq => eq.toLowerCase() === 'body weight')
);

console.log(`💪 Body weight exercises: ${bodyWeightExercises.length}`);

// Category mapping based on target muscles and body parts
function mapToCategory(exercise) {
  const targets = exercise.targetMuscles.map(m => m.toLowerCase());
  const parts = exercise.bodyParts.map(p => p.toLowerCase());
  const name = exercise.name.toLowerCase();

  // SKILL_STATIC - advanced static holds
  if (name.includes('planche') || name.includes('lever') || name.includes('l-sit') ||
      name.includes('front lever') || name.includes('back lever') || name.includes('handstand')) {
    return 'SKILL_STATIC';
  }

  // BALANCE - balance focused
  if (targets.includes('glutes') && targets.includes('abs') ||
      name.includes('balance') || name.includes('pistol') || name.includes('single leg')) {
    return 'BALANCE';
  }

  // CORE - abs, obliques, lower back
  if (targets.includes('abs') || targets.includes('obliques') ||
      parts.includes('waist') || name.includes('plank') || name.includes('crunch') ||
      name.includes('sit-up') || name.includes('hollow')) {
    return 'CORE';
  }

  // CARDIO - high intensity, explosive movements
  if (name.includes('burpee') || name.includes('jump') || name.includes('sprint') ||
      name.includes('mountain climber') || name.includes('high knee')) {
    return 'CARDIO';
  }

  // WARM_UP - stretches, mobility
  if (name.includes('stretch') || name.includes('mobility') || name.includes('warm') ||
      name.includes('roll') || name.includes('rotation')) {
    return 'WARM_UP';
  }

  // PUSH - pushing movements (chest, shoulders, triceps dominant)
  if (targets.includes('chest') || targets.includes('pectorals') ||
      targets.includes('triceps') || parts.includes('chest') ||
      name.includes('push') || name.includes('dip') ||
      (targets.includes('shoulders') && !name.includes('pull') && !name.includes('row'))) {
    return 'PUSH';
  }

  // PULL - pulling movements (back, lats, biceps, traps dominant)
  if (targets.includes('lats') || targets.includes('latissimus') ||
      targets.includes('back') || targets.includes('biceps') ||
      targets.includes('traps') || targets.includes('trapezius') ||
      parts.includes('back') || name.includes('pull') ||
      name.includes('chin') || name.includes('row')) {
    return 'PULL';
  }

  // Default to PUSH for remaining strength exercises
  return 'PUSH';
}

// Difficulty assignment based on exercise complexity
// Based on Overcoming Gravity 2 (OG2) FIG system and D-S ranks
function assignDifficulty(exercise) {
  const name = exercise.name.toLowerCase();
  const targets = exercise.targetMuscles.map(m => m.toLowerCase());

  // ===== EXPERT (S rank) - Elite/Master skills (FIG: Elite) =====
  // Full lever positions, one-arm variations, elite skills
  if (
    // Full levers and planches
    (name.includes('full') && (name.includes('front lever') || name.includes('back lever') || name.includes('planche'))) ||
    name.includes('straddle planche') ||
    name.includes('maltese') ||
    name.includes('iron cross') ||
    // One-arm skills
    name.includes('one arm pull') || name.includes('one-arm pull') ||
    name.includes('one arm chin') || name.includes('one-arm chin') ||
    name.includes('one arm push') || name.includes('one-arm push') ||
    // Elite handstand skills
    (name.includes('handstand') && name.includes('one arm')) ||
    (name.includes('handstand push') && !name.includes('pike') && !name.includes('wall')) ||
    // Muscle-up (strict, full ROM)
    (name.includes('muscle') && name.includes('up') && !name.includes('kipping')) ||
    name.includes('kipping muscle up') || // Even kipping MU is S rank
    // V-sit full
    (name.includes('v-sit') && !name.includes('tuck')) ||
    name.includes('manna')
  ) {
    return 'EXPERT';
  }

  // ===== ADVANCED (A rank) - Advanced skills (FIG: Advanced) =====
  // Straddle/one-leg levers, advanced tuck planche, weighted advanced exercises
  if (
    // Advanced lever progressions
    name.includes('straddle front lever') ||
    name.includes('straddle back lever') ||
    (name.includes('one leg') && name.includes('lever')) ||
    (name.includes('one-leg') && name.includes('lever')) ||
    name.includes('advanced tuck planche') ||
    name.includes('advanced tuck front lever') ||
    name.includes('advanced tuck back lever') ||
    // Advanced bodyweight skills
    (name.includes('archer') && (name.includes('pull') || name.includes('push'))) ||
    (name.includes('typewriter') && name.includes('pull')) ||
    // L-sit pull-ups and advanced core
    (name.includes('l-sit') && name.includes('pull')) ||
    (name.includes('front lever') && name.includes('row')) ||
    (name.includes('front lever') && name.includes('pull')) ||
    // Plyo and explosive (advanced level)
    (name.includes('clap') && (name.includes('pull') || name.includes('muscle'))) ||
    name.includes('plyo pull') ||
    // Weighted pistols
    (name.includes('pistol') && name.includes('weight')) ||
    // Dragon flags
    (name.includes('dragon') && !name.includes('negative')) ||
    // Advanced handstand variations
    (name.includes('handstand') && (name.includes('press') || name.includes('walk'))) ||
    // Human flag progressions
    name.includes('human flag')
  ) {
    return 'ADVANCED';
  }

  // ===== INTERMEDIATE (B rank) - Beginner/Intermediate (FIG: Beginner/Intermediate) =====
  // Tuck positions, ring work, weighted basics, pistol squats, clean pull-ups 10+
  if (
    // Tuck lever positions (first real skills)
    (name.includes('tuck') && (name.includes('front lever') || name.includes('back lever') || name.includes('planche'))) ||
    // L-sit (floor/parallettes) - first major skill
    (name.includes('l-sit') && !name.includes('pull') && !name.includes('tuck')) ||
    (name.includes('l sit') && !name.includes('pull') && !name.includes('tuck')) ||
    // Ring work (inherently harder)
    (name.includes('ring') && (name.includes('dip') || name.includes('push') || name.includes('row'))) ||
    // Weighted basic exercises
    (name.includes('weighted') && (name.includes('pull') || name.includes('dip') || name.includes('push'))) ||
    // Pistol squats (unweighted)
    (name.includes('pistol') && !name.includes('assisted') && !name.includes('weight')) ||
    // Nordic curls and advanced leg work
    name.includes('nordic') ||
    name.includes('shrimp squat') ||
    // Clean pull-ups/dips (higher volume indicator)
    (name.includes('wide') && name.includes('pull')) ||
    (name.includes('close') && name.includes('pull')) ||
    // Dragon flag negatives
    (name.includes('dragon') && name.includes('negative')) ||
    // Explosive basics
    (name.includes('explosive') || name.includes('jump')) && name.includes('push') ||
    (name.includes('clap') && name.includes('push')) ||
    // Handstand hold (wall-assisted but full position)
    (name.includes('handstand') && name.includes('hold') && !name.includes('one'))
  ) {
    return 'INTERMEDIATE';
  }

  // ===== NOVICE (C rank) - Basic skills (FIG: Basic) =====
  // Regular push-ups/pull-ups, basic dips, pike push-ups, basic holds
  if (
    // Regular pull-ups (5-10 reps range)
    (name.includes('pull') && name.includes('up') &&
     !name.includes('assisted') && !name.includes('negative') &&
     !name.includes('archer') && !name.includes('one') && !name.includes('weighted') &&
     !name.includes('wide') && !name.includes('lever')) ||
    (name.includes('chin') && name.includes('up') &&
     !name.includes('assisted') && !name.includes('negative') &&
     !name.includes('one')) ||
    // Regular push-ups and variations
    (name.includes('push') && name.includes('up') &&
     !name.includes('pike') && !name.includes('archer') &&
     !name.includes('one') && !name.includes('explosive') &&
     !name.includes('clap') && !name.includes('decline') &&
     !name.includes('ring') && !name.includes('planche')) ||
    name.includes('diamond push') ||
    // Pike push-ups (HSPU progression)
    (name.includes('pike') && name.includes('push')) ||
    // Basic dips
    (name.includes('dip') && !name.includes('ring') && !name.includes('weighted') &&
     !name.includes('assisted')) ||
    // Tuck L-sit (first skill progression)
    (name.includes('tuck') && name.includes('l-sit')) ||
    (name.includes('tuck') && name.includes('l sit')) ||
    // Frog stand and crow pose (first balancing skills)
    name.includes('frog stand') ||
    name.includes('crow pose') ||
    // Inverted row (horizontal pull)
    name.includes('inverted row') ||
    name.includes('australian pull') ||
    // Basic leg work
    (name.includes('lunge') && !name.includes('jump')) ||
    (name.includes('split squat') && !name.includes('jump')) ||
    // Hollow body hold (first core skill)
    name.includes('hollow body') ||
    // Headstand
    (name.includes('headstand') && !name.includes('press'))
  ) {
    return 'NOVICE';
  }

  // ===== BEGINNER (D rank) - Foundational (FIG: Foundational) =====
  // Wall variations, incline, knee, assisted, very basic holds
  if (
    // Wall exercises
    name.includes('wall push') ||
    name.includes('wall sit') ||
    (name.includes('wall') && name.includes('handstand')) ||
    // Incline/elevated (easier angles)
    (name.includes('incline') && (name.includes('push') || name.includes('row'))) ||
    name.includes('elevated') ||
    // Knee variations
    name.includes('knee push') ||
    name.includes('knee plank') ||
    // Assisted variations
    (name.includes('assisted') && (name.includes('pull') || name.includes('dip') || name.includes('pistol'))) ||
    name.includes('band assisted') ||
    // Negatives (eccentric training)
    (name.includes('negative') && (name.includes('pull') || name.includes('dip'))) ||
    // Basic hangs and holds
    (name.includes('dead hang') || name.includes('active hang')) ||
    (name.includes('scapular') && name.includes('pull')) ||
    // Basic planks
    (name.includes('plank') && !name.includes('side') && !name.includes('decline')) ||
    name.includes('side plank') ||
    // Very basic squats
    (name.includes('squat') && (name.includes('bodyweight') || name.includes('air'))) ||
    // Bridges (basic)
    (name.includes('bridge') && !name.includes('wheel'))
  ) {
    return 'BEGINNER';
  }

  // ===== DEFAULT CLASSIFICATION =====
  // If unclassified, try to infer from target muscles and exercise type

  // Cardio/warmup exercises default to NOVICE
  if (name.includes('jumping jack') || name.includes('jog') ||
      name.includes('march') || name.includes('skip') ||
      name.includes('butt kick') || name.includes('high knee')) {
    return 'NOVICE';
  }

  // Burpees and mountain climbers
  if (name.includes('burpee') || name.includes('mountain climber')) {
    return 'NOVICE';
  }

  // Stretches and mobility
  if (name.includes('stretch') || name.includes('mobility') ||
      name.includes('rotation') || name.includes('circle')) {
    return 'BEGINNER';
  }

  // Core exercises (abs, obliques) - default to NOVICE unless advanced
  if (targets.includes('abs') || targets.includes('obliques')) {
    if (name.includes('crunch') || name.includes('sit-up') ||
        name.includes('leg raise') || name.includes('knee raise')) {
      return 'NOVICE';
    }
  }

  // If still unclassified, default to NOVICE (safer than INTERMEDIATE)
  console.warn(`⚠️  Unclassified exercise: "${exercise.name}" - defaulting to NOVICE. Consider manual review.`);
  return 'NOVICE';
}

// Unit assignment - reps for most, time for holds/planks
function assignUnit(exercise) {
  const name = exercise.name.toLowerCase();

  if (name.includes('hold') || name.includes('plank') ||
      name.includes('static') || name.includes('hang') ||
      name.includes('l-sit') || name.includes('hollow body')) {
    return 'time';
  }

  return 'reps';
}

// Reward calculation based on difficulty
function calculateRewards(difficulty) {
  const rewardMap = {
    'BEGINNER': { exp: 8, coins: 4 },
    'NOVICE': { exp: 12, coins: 6 },
    'INTERMEDIATE': { exp: 18, coins: 9 },
    'ADVANCED': { exp: 28, coins: 14 },
    'EXPERT': { exp: 45, coins: 22 }
  };
  return rewardMap[difficulty] || rewardMap['INTERMEDIATE'];
}

// Map equipment from source to app format
function mapEquipment(sourceEquipments, exerciseName) {
  const equipment = [];
  const sourceLower = sourceEquipments.map(e => e.toLowerCase());
  const nameLower = exerciseName.toLowerCase();

  // Always include NONE for body weight exercises
  equipment.push('NONE');

  // Check source equipment field
  if (sourceLower.some(e => e.includes('pull') && e.includes('bar'))) {
    equipment.push('PULL_UP_BAR');
  }
  if (sourceLower.some(e => e.includes('ring'))) {
    equipment.push('RINGS');
  }
  if (sourceLower.some(e => e.includes('parallel') && e.includes('bar')) ||
      sourceLower.some(e => e.includes('dip') && e.includes('bar'))) {
    equipment.push('PARALLEL_BARS');
  }
  if (sourceLower.some(e => e.includes('band') || e.includes('resistance'))) {
    equipment.push('RESISTANCE_BANDS');
  }

  // Also check exercise name for equipment requirements
  // Pull-up bar exercises
  if (nameLower.includes('pull-up') || nameLower.includes('pull up') ||
      nameLower.includes('pullup') || nameLower.includes('chin-up') ||
      nameLower.includes('chin up') || nameLower.includes('chinup') ||
      (nameLower.includes('chin') && !nameLower.includes('reaching')) ||
      nameLower.includes('hanging') || nameLower.includes('muscle up') ||
      nameLower.includes('muscle-up')) {
    if (!equipment.includes('PULL_UP_BAR')) {
      equipment.push('PULL_UP_BAR');
    }
  }

  // Ring exercises
  if (nameLower.includes('ring')) {
    if (!equipment.includes('RINGS')) {
      equipment.push('RINGS');
    }
  }

  // Parallel bars / dip bar exercises
  if (nameLower.includes('dip') && !nameLower.includes('dipping')) {
    if (!equipment.includes('PARALLEL_BARS')) {
      equipment.push('PARALLEL_BARS');
    }
  }

  // Resistance band exercises
  if (nameLower.includes('band')) {
    if (!equipment.includes('RESISTANCE_BANDS')) {
      equipment.push('RESISTANCE_BANDS');
    }
  }

  return equipment;
}

// Transform exercises to app format
const transformedExercises = bodyWeightExercises.map(ex => {
  const category = mapToCategory(ex);
  const difficulty = assignDifficulty(ex);
  const unit = assignUnit(ex);
  const rewards = calculateRewards(difficulty);
  const equipment = mapEquipment(ex.equipments, ex.name);

  return {
    id: ex.exerciseId,
    name: ex.name,
    description: ex.instructions[0] || `Perform ${ex.name} exercise`,
    category: category,
    difficulty: difficulty,
    unit: unit,
    muscleGroups: [...ex.targetMuscles, ...ex.secondaryMuscles],
    equipment: equipment,
    expReward: rewards.exp,
    coinsReward: rewards.coins,
    instructions: ex.instructions,
    gifUrl: ex.gifUrl,
    thumbnailUrl: ex.gifUrl,
    videoUrl: null
  };
});

console.log(`\n📊 Category distribution:`);
const categoryCount = {};
transformedExercises.forEach(ex => {
  categoryCount[ex.category] = (categoryCount[ex.category] || 0) + 1;
});
console.log(categoryCount);

console.log(`\n📊 Difficulty distribution:`);
const difficultyCount = {};
transformedExercises.forEach(ex => {
  difficultyCount[ex.difficulty] = (difficultyCount[ex.difficulty] || 0) + 1;
});
console.log(difficultyCount);

// Save to apps/web/src/data/exercises.json
const targetPath = path.join(__dirname, '..', 'apps', 'web', 'src', 'data', 'exercises.json');
fs.writeFileSync(targetPath, JSON.stringify(transformedExercises, null, 2));

console.log(`\n✅ Migration complete!`);
console.log(`📝 Saved ${transformedExercises.length} exercises to ${targetPath}`);
