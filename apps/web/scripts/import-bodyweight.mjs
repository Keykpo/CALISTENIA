import fs from 'fs';
import path from 'path';

// Paths
const CURRENT_PATH = 'c://Users//FRAN//cp//calisthenics-platform//apps//web//public//exercises.json';
const BODYWEIGHT_PATH = 'c://Users//FRAN//cp//exercisedb-api-main//media//bodyweight_exercises.json';

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, data) => fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');

const normalize = (s) => String(s || '')
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-');

const toTitle = (s) => String(s || '')
  .split(/\s+/)
  .map(w => w.charAt(0).toUpperCase() + w.slice(1))
  .join(' ');

// Map body parts to our categories (uppercase, consistent with UI filters)
const categoryMap = (bodyParts = []) => {
  const parts = (bodyParts || []).map(p => p.toLowerCase());
  if (parts.includes('waist') || parts.includes('abs') || parts.includes('core')) return 'CORE';
  if (parts.includes('cardio')) return 'CARDIO';
  // Default for strength-oriented movements
  return 'STRENGTH';
};

// Map equipments to our style
const equipmentMap = (equipments = []) => {
  const eq = (equipments || []).map(e => e.toLowerCase());
  if (eq.length === 0) return ['NONE'];
  return eq.map(e => {
    if (e.includes('body weight')) return 'NONE';
    if (e.includes('pull up') || e.includes('pull-up') || e.includes('bar')) return 'PULL_UP_BAR';
    if (e.includes('bench')) return 'BENCH';
    if (e.includes('rings')) return 'RINGS';
    if (e.includes('parallette')) return 'PARALLETTES';
    if (e.includes('trx') || e.includes('suspension')) return 'TRX';
    return e.replace(/\s+/g, '_').toUpperCase();
  });
};

const difficultyFromName = (name) => {
  const n = String(name || '').toLowerCase();
  if (/(planche|one arm|handstand|muscle up|levers?)/.test(n)) return 'ADVANCED';
  if (/(archer|clap|explosive|pistol|shrimp)/.test(n)) return 'INTERMEDIATE';
  if (/(stretch|tilt|crunch|plank)/.test(n)) return 'BEGINNER';
  return 'NOVICE';
};

const defaultRewards = (difficulty) => {
  const map = {
    BEGINNER: { exp: 10, coins: 5 },
    NOVICE: { exp: 12, coins: 6 },
    INTERMEDIATE: { exp: 18, coins: 9 },
    ADVANCED: { exp: 25, coins: 12 },
    EXPERT: { exp: 35, coins: 18 },
  };
  return map[difficulty] || map.NOVICE;
};

function convertBodyweightItem(item) {
  const name = toTitle(item.name || '');
  const cat = categoryMap(item.bodyParts);
  const diff = difficultyFromName(name);
  const rewards = defaultRewards(diff);
  const muscles = Array.from(new Set([...(item.targetMuscles || []), ...(item.secondaryMuscles || [])]))
    .filter(Boolean)
    .map(toTitle);

  return {
    id: normalize(name),
    name,
    description: item.instructions?.[0] ? String(item.instructions[0]).replace(/^Step:\d+\s*/i, '') : '',
    category: cat,
    difficulty: diff,
    unit: 'reps',
    muscleGroups: muscles,
    equipment: equipmentMap(item.equipments),
    expReward: rewards.exp,
    coinsReward: rewards.coins,
    howTo: Array.isArray(item.instructions) ? item.instructions.join('\n') : '',
    gifUrl: item.gifUrl || null,
    thumbnailUrl: item.gifUrl || null,
    videoUrl: null,
  };
}

function mergeWithPriority(current, imported) {
  const byNameCurr = new Map(current.map(x => [normalize(x.name), x]));
  const result = [...current];

  for (const imp of imported) {
    const key = normalize(imp.name);
    const existing = byNameCurr.get(key);
    if (existing) {
      // Keep existing id to preserve references; overwrite fields with imported priority
      const merged = {
        ...existing,
        name: imp.name,
        description: imp.description,
        category: imp.category,
        difficulty: imp.difficulty,
        unit: imp.unit,
        muscleGroups: imp.muscleGroups,
        equipment: imp.equipment,
        expReward: imp.expReward,
        coinsReward: imp.coinsReward,
        howTo: imp.howTo,
        gifUrl: imp.gifUrl,
        thumbnailUrl: imp.thumbnailUrl,
        videoUrl: imp.videoUrl,
      };
      const idx = result.findIndex(x => normalize(x.name) === key);
      if (idx !== -1) result[idx] = merged;
    } else {
      // New entry; ensure unique id
      let newId = imp.id;
      const ids = new Set(result.map(x => x.id));
      let counter = 1;
      while (ids.has(newId)) {
        newId = `${imp.id}-${counter++}`;
      }
      result.push({ ...imp, id: newId });
    }
  }

  // Sort for consistency
  result.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  return result;
}

function main() {
  const current = readJson(CURRENT_PATH);
  const bodyweight = readJson(BODYWEIGHT_PATH);

  const imported = bodyweight.map(convertBodyweightItem);

  const merged = mergeWithPriority(current, imported);

  const backupName = `exercises.backup.before_bodyweight.${Date.now()}.json`;
  const backupPath = path.join(path.dirname(CURRENT_PATH), backupName);
  writeJson(backupPath, current);
  writeJson(CURRENT_PATH, merged);

  const stats = (arr) => ({
    count: arr.length,
    withGif: arr.filter((x) => x.gifUrl && String(x.gifUrl).trim()).length,
    withHowTo: arr.filter((x) => x.howTo && String(x.howTo).trim()).length,
  });

  console.log('Imported count:', imported.length);
  console.log('Backup written:', backupPath);
  console.log('Merged stats:', stats(merged));
}

main();