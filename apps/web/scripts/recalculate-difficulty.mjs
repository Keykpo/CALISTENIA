import fs from 'fs';
import path from 'path';

const CURRENT_PATH = 'c://Users//FRAN//cp//calisthenics-platform//apps//web//public//exercises.json';

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, data) => fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');

const norm = (s) => String(s || '')
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

// Keyword sets in EN/ES to classify difficulty logically
const KW = {
  EXPERT: [
    'planche', 'full planche', 'human flag', 'bandera humana',
    'one arm pull-up', 'dominada a una mano',
    'handstand push-up', 'flexion vertical',
    'muscle up', 'v-sit', 'back lever', 'lever full', 'full lever'
  ],
  ADVANCED: [
    'front lever', 'advanced tuck', 'superman push-up', 'dragon squat',
    'explosive', 'plyo', 'clap push-up', 'archer', 'l-sit', 'pike press'
  ],
  INTERMEDIATE: [
    'pistol squat', 'shrimp squat', 'diamond push-up', 'dip', 'pull-up',
    'remo', 'inverted row', 'ring', 'rings', 'parallette', 'paralelas',
    'handstand', 'parada de manos', 'tuck front lever', 'elevaciones colgado'
  ],
  BEGINNER: [
    'plank', 'plancha', 'crunch', 'reverse crunch', 'pelvic tilt', 'stretch',
    'incline push-up', 'push-up knee', 'flexion rodillas', 'asistido', 'assisted',
    'bench', 'al banco', 'wall', 'pared'
  ],
};

const classifyDifficulty = (name) => {
  const n = norm(name);
  const hit = (arr) => arr.some(k => n.includes(k));
  if (hit(KW.EXPERT)) return 'EXPERT';
  if (hit(KW.ADVANCED)) return 'ADVANCED';
  if (hit(KW.INTERMEDIATE)) return 'INTERMEDIATE';
  if (hit(KW.BEGINNER)) return 'BEGINNER';
  // Default: NOVICE for movimientos generales sin palabras clave
  return 'NOVICE';
};

// Rewards scaled logically by difficulty tier
const rewardsByDifficulty = {
  BEGINNER: { exp: 8, coins: 4 },
  NOVICE: { exp: 12, coins: 6 },
  INTERMEDIATE: { exp: 18, coins: 9 },
  ADVANCED: { exp: 26, coins: 13 },
  EXPERT: { exp: 38, coins: 19 },
};

function recalc(ex) {
  const difficulty = classifyDifficulty(ex.name);
  const rewards = rewardsByDifficulty[difficulty] || rewardsByDifficulty.NOVICE;
  return {
    ...ex,
    difficulty,
    expReward: rewards.exp,
    coinsReward: rewards.coins,
  };
}

function main() {
  const data = readJson(CURRENT_PATH);

  const updated = data.map(recalc);

  // Stats before writing
  const countBy = (arr, key) => arr.reduce((acc, x) => {
    const k = x[key];
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const backupName = `exercises.backup.before_recalc.${Date.now()}.json`;
  const backupPath = path.join(path.dirname(CURRENT_PATH), backupName);
  writeJson(backupPath, data);
  writeJson(CURRENT_PATH, updated);

  console.log('Backup written:', backupPath);
  console.log('Difficulties:', countBy(updated, 'difficulty'));
  console.log('Sample rewards:', {
    BEGINNER: rewardsByDifficulty.BEGINNER,
    NOVICE: rewardsByDifficulty.NOVICE,
    INTERMEDIATE: rewardsByDifficulty.INTERMEDIATE,
    ADVANCED: rewardsByDifficulty.ADVANCED,
    EXPERT: rewardsByDifficulty.EXPERT,
  });
  console.log('Total exercises:', updated.length);
}

main();