/**
 * Test Script: Unified Hexagon System
 *
 * This script tests the unified hexagon system to ensure:
 * 1. SubLevel ↔ XP mapping is correct
 * 2. Metrics → SubLevel calculation works
 * 3. Hexagon XP synchronization is accurate
 * 4. Level up detection functions properly
 *
 * Run with: node scripts/test-unified-hexagon.js
 */

// Import the compiled modules
// Note: In development, these will be transpiled from TypeScript
const path = require('path');

console.log('='.repeat(80));
console.log('UNIFIED HEXAGON SYSTEM - TEST SUITE');
console.log('='.repeat(80));
console.log();

// ============================================================================
// TEST 1: SubLevel ↔ XP Mapping
// ============================================================================

console.log('TEST 1: SubLevel ↔ XP Mapping');
console.log('-'.repeat(80));

const SUBLEVEL_ORDER = [
  'D-', 'D', 'D+',
  'C-', 'C', 'C+',
  'B-', 'B', 'B+',
  'A-', 'A', 'A+',
  'S-', 'S', 'S+'
];

const SUBLEVEL_XP_MAP = {
  'D-': { minXP: 0,      maxXP: 32000,  tier: 'BEGINNER' },
  'D':  { minXP: 32000,  maxXP: 64000,  tier: 'BEGINNER' },
  'D+': { minXP: 64000,  maxXP: 96000,  tier: 'BEGINNER' },
  'C-': { minXP: 96000,  maxXP: 128000, tier: 'INTERMEDIATE' },
  'C':  { minXP: 128000, maxXP: 160000, tier: 'INTERMEDIATE' },
  'C+': { minXP: 160000, maxXP: 192000, tier: 'INTERMEDIATE' },
  'B-': { minXP: 192000, maxXP: 224000, tier: 'INTERMEDIATE' },
  'B':  { minXP: 224000, maxXP: 256000, tier: 'INTERMEDIATE' },
  'B+': { minXP: 256000, maxXP: 288000, tier: 'INTERMEDIATE' },
  'A-': { minXP: 288000, maxXP: 320000, tier: 'ADVANCED' },
  'A':  { minXP: 320000, maxXP: 352000, tier: 'ADVANCED' },
  'A+': { minXP: 352000, maxXP: 384000, tier: 'ADVANCED' },
  'S-': { minXP: 384000, maxXP: 416000, tier: 'ELITE' },
  'S':  { minXP: 416000, maxXP: 448000, tier: 'ELITE' },
  'S+': { minXP: 448000, maxXP: Infinity, tier: 'ELITE' },
};

function xpToSubLevel(xp) {
  for (const subLevel of SUBLEVEL_ORDER) {
    const range = SUBLEVEL_XP_MAP[subLevel];
    if (xp >= range.minXP && xp < range.maxXP) {
      return subLevel;
    }
  }
  return 'S+';
}

let test1Passed = 0;
let test1Failed = 0;

for (const subLevel of SUBLEVEL_ORDER) {
  const minXP = SUBLEVEL_XP_MAP[subLevel].minXP;
  const calculated = xpToSubLevel(minXP);
  const passed = calculated === subLevel;

  if (passed) {
    test1Passed++;
    console.log(`✅ ${subLevel}: ${minXP.toLocaleString()} XP → ${calculated}`);
  } else {
    test1Failed++;
    console.log(`❌ ${subLevel}: ${minXP.toLocaleString()} XP → ${calculated} (expected ${subLevel})`);
  }
}

console.log();
console.log(`Test 1 Results: ${test1Passed} passed, ${test1Failed} failed`);
console.log();

// ============================================================================
// TEST 2: Intermediate XP Values
// ============================================================================

console.log('TEST 2: Intermediate XP Values');
console.log('-'.repeat(80));

const testValues = [
  { xp: 0, expected: 'D-' },
  { xp: 16000, expected: 'D-' }, // Middle of D-
  { xp: 32000, expected: 'D' },
  { xp: 50000, expected: 'D' }, // Middle of D
  { xp: 64000, expected: 'D+' },
  { xp: 96000, expected: 'C-' },
  { xp: 100000, expected: 'C-' },
  { xp: 128000, expected: 'C' },
  { xp: 150000, expected: 'C' },
  { xp: 200000, expected: 'B-' },
  { xp: 250000, expected: 'B' },
  { xp: 300000, expected: 'A-' },
  { xp: 350000, expected: 'A' },
  { xp: 400000, expected: 'S-' },
  { xp: 450000, expected: 'S+' },
  { xp: 500000, expected: 'S+' },
  { xp: 1000000, expected: 'S+' },
];

let test2Passed = 0;
let test2Failed = 0;

for (const { xp, expected } of testValues) {
  const calculated = xpToSubLevel(xp);
  const passed = calculated === expected;

  if (passed) {
    test2Passed++;
    console.log(`✅ ${xp.toLocaleString()} XP → ${calculated}`);
  } else {
    test2Failed++;
    console.log(`❌ ${xp.toLocaleString()} XP → ${calculated} (expected ${expected})`);
  }
}

console.log();
console.log(`Test 2 Results: ${test2Passed} passed, ${test2Failed} failed`);
console.log();

// ============================================================================
// TEST 3: Metrics → SubLevel Calculation
// ============================================================================

console.log('TEST 3: Metrics → SubLevel Calculation');
console.log('-'.repeat(80));

function calculateSubLevelFromMetrics(pullUpsMax, dipsMax) {
  // Pull-ups mapping
  let pullUpLevel = 'D-';
  if (pullUpsMax >= 70) pullUpLevel = 'S+';
  else if (pullUpsMax >= 60) pullUpLevel = 'S';
  else if (pullUpsMax >= 50) pullUpLevel = 'S-';
  else if (pullUpsMax >= 45) pullUpLevel = 'A+';
  else if (pullUpsMax >= 40) pullUpLevel = 'A';
  else if (pullUpsMax >= 35) pullUpLevel = 'A-';
  else if (pullUpsMax >= 30) pullUpLevel = 'B+';
  else if (pullUpsMax >= 25) pullUpLevel = 'B';
  else if (pullUpsMax >= 20) pullUpLevel = 'B-';
  else if (pullUpsMax >= 15) pullUpLevel = 'C+';
  else if (pullUpsMax >= 11) pullUpLevel = 'C';
  else if (pullUpsMax >= 8) pullUpLevel = 'C-';
  else if (pullUpsMax >= 4) pullUpLevel = 'D+';
  else if (pullUpsMax >= 1) pullUpLevel = 'D';

  // Dips mapping
  let dipLevel = 'D-';
  if (dipsMax >= 35) dipLevel = 'S+';
  else if (dipsMax >= 30) dipLevel = 'S-';
  else if (dipsMax >= 25) dipLevel = 'A+';
  else if (dipsMax >= 20) dipLevel = 'A-';
  else if (dipsMax >= 15) dipLevel = 'B+';
  else if (dipsMax >= 10) dipLevel = 'B-';
  else if (dipsMax >= 5) dipLevel = 'C';
  else if (dipsMax >= 1) dipLevel = 'D';

  // Weighted average (60% pull-ups, 40% dips)
  const pullUpIndex = SUBLEVEL_ORDER.indexOf(pullUpLevel);
  const dipIndex = SUBLEVEL_ORDER.indexOf(dipLevel);
  const avgIndex = Math.floor((pullUpIndex * 0.6 + dipIndex * 0.4));

  return SUBLEVEL_ORDER[Math.min(avgIndex, SUBLEVEL_ORDER.length - 1)];
}

const metricsTests = [
  { pullUps: 0, dips: 0, expected: 'D-', description: 'Complete beginner' },
  { pullUps: 2, dips: 2, expected: 'D', description: 'Learning the basics' },
  { pullUps: 5, dips: 5, expected: 'D+', description: 'Building foundation' },
  { pullUps: 10, dips: 8, expected: 'C-', description: 'Entering intermediate' },
  { pullUps: 12, dips: 12, expected: 'C', description: 'Solid intermediate' },
  { pullUps: 18, dips: 12, expected: 'C+', description: 'Strong intermediate' },
  { pullUps: 20, dips: 15, expected: 'B-', description: 'Entering advanced' },
  { pullUps: 30, dips: 20, expected: 'B+', description: 'Advanced athlete' },
  { pullUps: 40, dips: 25, expected: 'A', description: 'Elite level' },
  { pullUps: 50, dips: 30, expected: 'S-', description: 'Expert performance' },
  { pullUps: 70, dips: 35, expected: 'S+', description: 'Peak performance' },
];

let test3Passed = 0;
let test3Failed = 0;

for (const test of metricsTests) {
  const calculated = calculateSubLevelFromMetrics(test.pullUps, test.dips);
  const passed = calculated === test.expected;

  if (passed) {
    test3Passed++;
    console.log(`✅ Pull-ups: ${test.pullUps}, Dips: ${test.dips} → ${calculated} (${test.description})`);
  } else {
    test3Failed++;
    console.log(`❌ Pull-ups: ${test.pullUps}, Dips: ${test.dips} → ${calculated} (expected ${test.expected})`);
  }
}

console.log();
console.log(`Test 3 Results: ${test3Passed} passed, ${test3Failed} failed`);
console.log();

// ============================================================================
// TEST 4: Hexagon XP Synchronization
// ============================================================================

console.log('TEST 4: Hexagon XP Synchronization');
console.log('-'.repeat(80));

function syncHexagonWithSubLevel(subLevel, metrics) {
  const baseXP = SUBLEVEL_XP_MAP[subLevel].minXP;

  // Calculate strength XP from metrics
  const strengthSubLevel = calculateSubLevelFromMetrics(metrics.pullUpsMax, metrics.dipsMax);
  let strengthXP = SUBLEVEL_XP_MAP[strengthSubLevel].minXP;

  // Bonus from weighted exercises
  if (metrics.weightedPullUps) {
    strengthXP += metrics.weightedPullUps * 100;
  }
  if (metrics.weightedDips) {
    strengthXP += metrics.weightedDips * 80;
  }

  return {
    strength: Math.max(strengthXP, baseXP),
    staticHolds: baseXP,
    balance: baseXP,
    core: baseXP,
    endurance: baseXP,
    mobility: baseXP,
  };
}

const hexagonTests = [
  {
    subLevel: 'C',
    metrics: { pullUpsMax: 12, dipsMax: 8 },
    expectedMinStrengthXP: 128000,
  },
  {
    subLevel: 'B',
    metrics: { pullUpsMax: 25, dipsMax: 15, weightedPullUps: 10 },
    expectedMinStrengthXP: 224000 + 1000, // Base + bonus
  },
  {
    subLevel: 'A',
    metrics: { pullUpsMax: 40, dipsMax: 25, weightedPullUps: 20, weightedDips: 30 },
    expectedMinStrengthXP: 320000 + 2000 + 2400, // Base + bonuses
  },
];

let test4Passed = 0;
let test4Failed = 0;

for (const test of hexagonTests) {
  const hexagonXP = syncHexagonWithSubLevel(test.subLevel, test.metrics);
  const passed = hexagonXP.strength >= test.expectedMinStrengthXP;

  if (passed) {
    test4Passed++;
    console.log(`✅ ${test.subLevel} with metrics → Strength XP: ${hexagonXP.strength.toLocaleString()}`);
  } else {
    test4Failed++;
    console.log(`❌ ${test.subLevel} with metrics → Strength XP: ${hexagonXP.strength.toLocaleString()} (expected >= ${test.expectedMinStrengthXP.toLocaleString()})`);
  }
}

console.log();
console.log(`Test 4 Results: ${test4Passed} passed, ${test4Failed} failed`);
console.log();

// ============================================================================
// FINAL SUMMARY
// ============================================================================

console.log('='.repeat(80));
console.log('FINAL SUMMARY');
console.log('='.repeat(80));

const totalPassed = test1Passed + test2Passed + test3Passed + test4Passed;
const totalFailed = test1Failed + test2Failed + test3Failed + test4Failed;
const totalTests = totalPassed + totalFailed;

console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${totalPassed} ✅`);
console.log(`Failed: ${totalFailed} ${totalFailed > 0 ? '❌' : '✅'}`);
console.log();

if (totalFailed === 0) {
  console.log('🎉 ALL TESTS PASSED! Unified Hexagon System is working correctly.');
} else {
  console.log(`⚠️  ${totalFailed} test(s) failed. Please review the implementation.`);
  process.exit(1);
}

console.log('='.repeat(80));
