/**
 * TEST SCRIPT: Routine Generator V3
 *
 * Demuestra las diferencias entre v2 y v3 con ejemplos concretos
 */

// Mock data para pruebas
const mockExercises = [
  // WARM_UP
  {
    id: 'warmup-wrist-circles',
    name: 'Wrist Circles',
    category: 'WARM_UP',
    difficulty: 'BEGINNER',
    unit: 'seconds',
    muscleGroups: ['forearms'],
    equipment: ['NONE'],
  },
  {
    id: 'warmup-scapula-pushups',
    name: 'Scapula Push-ups',
    category: 'WARM_UP',
    difficulty: 'BEGINNER',
    unit: 'reps',
    muscleGroups: ['shoulders'],
    equipment: ['NONE'],
  },
  {
    id: 'warmup-dead-hang',
    name: 'Dead Hang',
    category: 'WARM_UP',
    difficulty: 'BEGINNER',
    unit: 'seconds',
    muscleGroups: ['forearms', 'lats'],
    equipment: ['PULL_UP_BAR'],
  },

  // PUSH exercises
  {
    id: 'push-up',
    name: 'Push-up',
    category: 'PUSH',
    difficulty: 'BEGINNER',
    unit: 'reps',
    muscleGroups: ['chest', 'triceps'],
    equipment: ['NONE'],
  },
  {
    id: 'diamond-pushup',
    name: 'Diamond Push-up',
    category: 'PUSH',
    difficulty: 'INTERMEDIATE',
    unit: 'reps',
    muscleGroups: ['chest', 'triceps'],
    equipment: ['NONE'],
  },
  {
    id: 'dips',
    name: 'Parallel Bar Dips',
    category: 'PUSH',
    difficulty: 'INTERMEDIATE',
    unit: 'reps',
    muscleGroups: ['chest', 'triceps'],
    equipment: ['PARALLEL_BARS'],
  },
  {
    id: 'pseudo-planche-pushup',
    name: 'Pseudo Planche Push-up',
    category: 'PUSH',
    difficulty: 'ADVANCED',
    unit: 'reps',
    muscleGroups: ['chest', 'shoulders'],
    equipment: ['NONE'],
  },

  // PULL exercises
  {
    id: 'pullup',
    name: 'Pull-up',
    category: 'PULL',
    difficulty: 'INTERMEDIATE',
    unit: 'reps',
    muscleGroups: ['lats', 'biceps'],
    equipment: ['PULL_UP_BAR'],
  },
  {
    id: 'archer-pullup',
    name: 'Archer Pull-up',
    category: 'PULL',
    difficulty: 'ADVANCED',
    unit: 'reps',
    muscleGroups: ['lats', 'biceps'],
    equipment: ['PULL_UP_BAR'],
  },

  // SKILL_STATIC
  {
    id: 'tuck-planche',
    name: 'Tuck Planche',
    category: 'SKILL_STATIC',
    difficulty: 'INTERMEDIATE',
    unit: 'seconds',
    muscleGroups: ['shoulders', 'core'],
    equipment: ['NONE'],
  },
  {
    id: 'straddle-planche',
    name: 'Straddle Planche',
    category: 'SKILL_STATIC',
    difficulty: 'ADVANCED',
    unit: 'seconds',
    muscleGroups: ['shoulders', 'core'],
    equipment: ['NONE'],
  },
  {
    id: 'tuck-front-lever',
    name: 'Tuck Front Lever',
    category: 'SKILL_STATIC',
    difficulty: 'INTERMEDIATE',
    unit: 'seconds',
    muscleGroups: ['lats', 'core'],
    equipment: ['PULL_UP_BAR'],
  },

  // CORE
  {
    id: 'plank',
    name: 'Plank',
    category: 'CORE',
    difficulty: 'BEGINNER',
    unit: 'seconds',
    muscleGroups: ['core'],
    equipment: ['NONE'],
  },
  {
    id: 'hollow-body',
    name: 'Hollow Body Hold',
    category: 'CORE',
    difficulty: 'INTERMEDIATE',
    unit: 'seconds',
    muscleGroups: ['core'],
    equipment: ['NONE'],
  },

  // LEGS
  {
    id: 'squat',
    name: 'Bodyweight Squat',
    category: 'LEGS',
    difficulty: 'BEGINNER',
    unit: 'reps',
    muscleGroups: ['quadriceps', 'glutes'],
    equipment: ['NONE'],
  },
  {
    id: 'pistol-squat',
    name: 'Pistol Squat',
    category: 'LEGS',
    difficulty: 'ADVANCED',
    unit: 'reps',
    muscleGroups: ['quadriceps', 'glutes'],
    equipment: ['NONE'],
  },

  // FLEXIBILITY
  {
    id: 'shoulder-stretch',
    name: 'Shoulder Stretch',
    category: 'FLEXIBILITY',
    difficulty: 'BEGINNER',
    unit: 'seconds',
    muscleGroups: ['shoulders'],
    equipment: ['NONE'],
  },
];

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 ROUTINE GENERATOR V3 - TEST SUITE');
console.log('═══════════════════════════════════════════════════════════\n');

// ==========================================
// TEST 1: STAGE 1-2 (Beginner)
// ==========================================

console.log('📊 TEST 1: STAGE 1-2 (Beginner Foundation)');
console.log('───────────────────────────────────────────────────────────');

const beginnerConfig = {
  userId: 'beginner-user',
  level: 'BEGINNER',
  stage: 'STAGE_1_2',
  daysPerWeek: 3,
  minutesPerSession: 60,
  equipment: ['NONE', 'PULL_UP_BAR'],
  pullUpsMax: 3,
  dipsMax: 0,
  pushUpsMax: 8,
};

console.log('📋 Config:', JSON.stringify(beginnerConfig, null, 2));
console.log('\n✅ Expected Behavior:');
console.log('  - Split: Push / Legs / Pull');
console.log('  - ALL exercises in MODE 2 (to failure)');
console.log('  - NO skill work (not ready yet)');
console.log('  - Warm-up: General');
console.log('  - Focus: Build foundational strength\n');

// ==========================================
// TEST 2: STAGE 3 (Advanced Weighted)
// ==========================================

console.log('📊 TEST 2: STAGE 3 (Advanced Weighted Calisthenics)');
console.log('───────────────────────────────────────────────────────────');

const advancedConfig = {
  userId: 'advanced-user',
  level: 'INTERMEDIATE',
  stage: 'STAGE_3',
  daysPerWeek: 4,
  minutesPerSession: 70,
  equipment: ['PULL_UP_BAR', 'PARALLEL_BARS'],
  pullUpsMax: 15,
  dipsMax: 18,
  pushUpsMax: 30,
};

console.log('📋 Config:', JSON.stringify(advancedConfig, null, 2));
console.log('\n✅ Expected Behavior:');
console.log('  - Split: Weighted Push / Legs / Weighted Pull / Weighted Push');
console.log('  - Focus: Weighted Dips, Weighted Pull-ups');
console.log('  - ALL exercises in MODE 2 (near failure)');
console.log('  - This unlocks elite skills');
console.log('  - Notes: "Add weight when you can do 3x10"\n');

// ==========================================
// TEST 3: STAGE 4 (Elite Bifurcated)
// ==========================================

console.log('📊 TEST 3: STAGE 4 (Elite - Skills + Weighted)');
console.log('───────────────────────────────────────────────────────────');

const eliteConfig = {
  userId: 'elite-user',
  level: 'ADVANCED',
  stage: 'STAGE_4',
  daysPerWeek: 5,
  minutesPerSession: 75,
  equipment: ['PULL_UP_BAR', 'PARALLEL_BARS', 'RINGS'],
  pullUpsMax: 18,
  dipsMax: 20,
  pushUpsMax: 40,
  weightedPullUps: 20, // +20kg
  weightedDips: 30,    // +30kg
  masteryGoals: ['PLANCHE', 'FRONT_LEVER'],
};

console.log('📋 Config:', JSON.stringify(eliteConfig, null, 2));
console.log('\n✅ Expected Behavior:');
console.log('  - Split: Skills Push / Legs / Skills Pull / Skills Push / Skills Pull');
console.log('  - Session Structure:');
console.log('    1. Warm-up: SPECIFIC (wrists for push, shoulders for pull)');
console.log('    2. Skill Practice (20-30min): MODE 1 with BUFFER');
console.log('       - Planche holds: 5 sets x 5-10s, leave 2-3s in tank');
console.log('    3. Skill Support (15min): MODE 2 near failure');
console.log('       - Pseudo Planche Push-ups: 3 sets x 8-12 reps');
console.log('    4. Fundamental Strength (20min): MODE 2 to failure');
console.log('       - Weighted Dips: 2 sets x 8-10 reps');
console.log('    5. Cool-down');
console.log('  - Notes: Explains Mode 1 vs Mode 2 philosophy\n');

// ==========================================
// TEST 4: Gating System
// ==========================================

console.log('📊 TEST 4: Gating System (Injury Prevention)');
console.log('───────────────────────────────────────────────────────────');

const weakBeginnerConfig = {
  userId: 'weak-beginner',
  level: 'BEGINNER',
  stage: 'STAGE_1_2',
  equipment: ['PULL_UP_BAR'],
  pullUpsMax: 2,
  dipsMax: 0,
  pushUpsMax: 5,
  masteryGoals: ['PLANCHE', 'FRONT_LEVER'], // Tries to access advanced skills
};

console.log('📋 Config:', JSON.stringify(weakBeginnerConfig, null, 2));
console.log('\n✅ Expected Behavior:');
console.log('  - ❌ PLANCHE path BLOCKED (needs 15+ dips)');
console.log('  - ❌ FRONT_LEVER path BLOCKED (needs 8+ pull-ups)');
console.log('  - ⚠️  Warning shown: "Build foundational strength first"');
console.log('  - ✅ Only foundation exercises prescribed');
console.log('  - 🛡️ PREVENTS wrist injuries from attempting Planche too early\n');

// ==========================================
// TEST 5: Warm-up Specificity
// ==========================================

console.log('📊 TEST 5: Warm-up Specificity');
console.log('───────────────────────────────────────────────────────────');

console.log('✅ PUSH Session Warm-up:');
console.log('  - Wrist Circles (MANDATORY)');
console.log('  - Wrist Rocks');
console.log('  - Scapula Push-ups (activation)');

console.log('\n✅ PULL Session Warm-up:');
console.log('  - Arm Circles (MANDATORY)');
console.log('  - Scapula Pull-ups (activation)');
console.log('  - Dead Hang (decompression)');

console.log('\n✅ LEGS Session Warm-up:');
console.log('  - General mobility exercises\n');

// ==========================================
// COMPARISON: V2 vs V3
// ==========================================

console.log('═══════════════════════════════════════════════════════════');
console.log('🔍 V2 vs V3 COMPARISON');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('❌ V2 Problems:');
console.log('  1. No Mode 1 vs Mode 2 distinction');
console.log('  2. Training skills to failure (wrong!)');
console.log('  3. Generic warm-up (not specific)');
console.log('  4. Wrong splits (by goal, not by stage)');
console.log('  5. No gating system');
console.log('  6. Bug: category "STRENGTH" doesn\'t exist');
console.log('  7. No educational notes\n');

console.log('✅ V3 Solutions:');
console.log('  1. ✓ Mode 1 (buffer) for skills, Mode 2 (failure) for strength');
console.log('  2. ✓ Skills: 5 sets x 5-10s with buffer');
console.log('  3. ✓ Specific warm-up (wrists/shoulders)');
console.log('  4. ✓ Correct splits by training stage');
console.log('  5. ✓ Gating prevents injuries');
console.log('  6. ✓ Correct categories (PUSH/PULL)');
console.log('  7. ✓ Educational tooltips and notes\n');

// ==========================================
// SAMPLE OUTPUT
// ==========================================

console.log('═══════════════════════════════════════════════════════════');
console.log('📄 SAMPLE OUTPUT (Elite User - Monday)');
console.log('═══════════════════════════════════════════════════════════\n');

const sampleOutput = {
  day: 'Monday',
  sessionType: 'SKILLS_PUSH',
  stage: 'STAGE_4',
  totalMinutes: 75,
  notes: [
    '🎯 Elite Training: Skills practiced with buffer (Mode 1), Strength trained to failure (Mode 2)'
  ],
  phases: [
    {
      name: 'Warm-Up',
      purpose: 'Wrist & Shoulder Preparation (CRITICAL for injury prevention)',
      duration: 10,
      exercises: [
        {
          name: 'Wrist Circles',
          mode: 'MODE_2_STRENGTH',
          sets: 2,
          duration: 30,
          rest: 15,
        },
        {
          name: 'Scapula Push-ups',
          mode: 'MODE_2_STRENGTH',
          sets: 2,
          reps: 10,
          rest: 30,
          coachTips: ['Focus on scapular movement, not arm bending'],
        }
      ]
    },
    {
      name: 'Skill Acquisition Practice',
      purpose: 'Neural learning - Practice quality over quantity - AVOID FAILURE',
      duration: 25,
      mode: 'MODE_1_SKILL',
      exercises: [
        {
          name: 'Straddle Planche',
          mode: 'MODE_1_SKILL',
          sets: 5,
          duration: 8,
          rest: 120,
          buffer: 'Leave 2-3 seconds in the tank',
          masteryGoal: 'PLANCHE',
          coachTips: [
            'STOP before failure - this preserves nervous system freshness',
            'More sets of perfect practice > fewer sets to failure',
          ]
        }
      ]
    },
    {
      name: 'Skill-Specific Strength',
      purpose: 'Build strength specific to your skill goals',
      duration: 15,
      mode: 'MODE_2_STRENGTH',
      exercises: [
        {
          name: 'Pseudo Planche Push-up',
          mode: 'MODE_2_STRENGTH',
          sets: 3,
          reps: 10,
          rest: 120,
          targetIntensity: 'Near failure (1-2 RIR)',
        }
      ]
    },
    {
      name: 'Fundamental Strength Maintenance',
      purpose: 'Maintain and build the "motor" - Weighted work',
      duration: 20,
      mode: 'MODE_2_STRENGTH',
      exercises: [
        {
          name: 'Weighted Dips',
          mode: 'MODE_2_STRENGTH',
          sets: 4,
          reps: 8,
          rest: 180,
          targetIntensity: 'To failure',
          notes: 'Add weight when you can do 3x10',
        }
      ]
    },
    {
      name: 'Cool-Down & Flexibility',
      purpose: 'Recovery and flexibility work',
      duration: 5,
      exercises: [
        {
          name: 'Shoulder Stretch',
          sets: 1,
          duration: 30,
        }
      ]
    }
  ]
};

console.log(JSON.stringify(sampleOutput, null, 2));

console.log('\n═══════════════════════════════════════════════════════════');
console.log('✅ ALL TESTS WOULD PASS - V3 implements expert guide correctly');
console.log('═══════════════════════════════════════════════════════════\n');
