// Merge howTo, muscleGroups, equipment from exercises_for_guides.json into exercises.json
// Matching primarily by id; fallback by normalized name

const fs = require('fs');
const path = require('path');

function norm(s) {
  return String(s || '').trim().toLowerCase();
}

function readJson(p) {
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

function run() {
  const root = path.resolve(__dirname, '..');
  const publicDir = path.join(root, 'public');
  const basePath = path.join(publicDir, 'exercises.json');
  const guidesPath = path.join(publicDir, 'exercises_for_guides.json');

  if (!fs.existsSync(basePath)) {
    console.error('No existe exercises.json en', basePath);
    process.exit(1);
  }
  if (!fs.existsSync(guidesPath)) {
    console.error('No existe exercises_for_guides.json en', guidesPath);
    process.exit(1);
  }

  const base = readJson(basePath);
  const guides = readJson(guidesPath);

  const byId = new Map();
  const byName = new Map();

  for (const g of guides) {
    if (g && (g.id || g.name)) {
      if (g.id) byId.set(String(g.id), g);
      if (g.name) byName.set(norm(g.name), g);
    }
  }

  let updated = 0;
  const merged = base.map((ex) => {
    const keyId = ex.id != null ? String(ex.id) : null;
    const keyName = ex.name ? norm(ex.name) : null;

    const candidate = (keyId && byId.get(keyId)) || (keyName && byName.get(keyName)) || null;
    if (!candidate) return ex;

    const next = { ...ex };

    // Only override when candidate has content
    if (candidate.howTo && String(candidate.howTo).trim().length > 0) {
      next.howTo = String(candidate.howTo).trim();
    }
    if (Array.isArray(candidate.muscleGroups) && candidate.muscleGroups.length > 0) {
      next.muscleGroups = candidate.muscleGroups.map(String);
    }
    if (Array.isArray(candidate.equipment) && candidate.equipment.length > 0) {
      next.equipment = candidate.equipment.map(String);
    }

    updated += 1;
    return next;
  });

  const backupPath = path.join(publicDir, `exercises.backup.${Date.now()}.json`);
  writeJson(backupPath, base);
  writeJson(basePath, merged);

  console.log(`Merge completado: ${updated} ejercicios actualizados de ${base.length}.`);
  console.log('Backup creado en:', backupPath);
}

run();