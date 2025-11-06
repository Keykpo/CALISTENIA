import fs from 'fs';
import path from 'path';

// Absolute paths to ensure reliability in this environment
const CURRENT_PATH = 'c://Users//FRAN//cp//calisthenics-platform//apps//web//public//exercises.json';
const UPDATED_PATH = 'c://Users//FRAN//cp//exercisedb-api-main//media//exercises_COMPLETE_updated.json';

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, data) => fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');

const normalizeName = (name) =>
  String(name || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-');

const mergeArrays = (a = [], b = []) => Array.from(new Set([...(a || []), ...(b || [])])).filter(Boolean);

function mergeEntry(curr = {}, upd = {}) {
  // Prefer updated values when present; otherwise keep current
  const merged = {
    id: upd.id ?? curr.id,
    name: upd.name ?? curr.name,
    description: upd.description ?? curr.description ?? '',
    category: upd.category ?? curr.category,
    difficulty: upd.difficulty ?? curr.difficulty,
    unit: upd.unit ?? curr.unit,
    muscleGroups: mergeArrays(curr.muscleGroups, upd.muscleGroups),
    equipment: mergeArrays(curr.equipment, upd.equipment),
    expReward: upd.expReward ?? curr.expReward ?? curr.exp ?? null,
    coinsReward: upd.coinsReward ?? curr.coinsReward ?? curr.coins ?? null,
    howTo: upd.howTo ?? curr.howTo ?? '',
    gifUrl: upd.gifUrl ?? curr.gifUrl ?? null,
    thumbnailUrl: upd.thumbnailUrl ?? curr.thumbnailUrl ?? upd.gifUrl ?? null,
    videoUrl: upd.videoUrl ?? curr.videoUrl ?? null,
  };
  return merged;
}

function main() {
  const current = readJson(CURRENT_PATH);
  const updated = readJson(UPDATED_PATH);

  const byIdCurr = new Map(current.map((x) => [x.id, x]));
  const byNameCurr = new Map(current.map((x) => [normalizeName(x.name), x]));
  const byIdUpd = new Map(updated.map((x) => [x.id, x]));
  const byNameUpd = new Map(updated.map((x) => [normalizeName(x.name), x]));

  const allKeys = new Set([
    ...current.map((x) => x.id || normalizeName(x.name)),
    ...updated.map((x) => x.id || normalizeName(x.name)),
  ]);

  const merged = [];

  for (const key of allKeys) {
    // Try to fetch by id; if not present, fallback to name
    const curr = byIdCurr.get(key) || byNameCurr.get(key) || null;
    const upd = byIdUpd.get(key) || byNameUpd.get(key) || null;

    if (curr && upd) {
      merged.push(mergeEntry(curr, upd));
    } else if (upd) {
      merged.push(mergeEntry({}, upd));
    } else if (curr) {
      merged.push(mergeEntry(curr, {}));
    }
  }

  // Sort for consistency
  merged.sort((a, b) => String(a.name).localeCompare(String(b.name)));

  // Backup current
  const backupName = `exercises.backup.${Date.now()}.json`;
  const backupPath = path.join(path.dirname(CURRENT_PATH), backupName);
  writeJson(backupPath, current);

  // Write merged to current path
  writeJson(CURRENT_PATH, merged);

  const stats = (arr) => ({
    count: arr.length,
    withGif: arr.filter((x) => x.gifUrl && String(x.gifUrl).trim()).length,
    withHowTo: arr.filter((x) => x.howTo && String(x.howTo).trim()).length,
  });

  console.log('Backup written:', backupPath);
  console.log('Merged stats:', stats(merged));
}

main();