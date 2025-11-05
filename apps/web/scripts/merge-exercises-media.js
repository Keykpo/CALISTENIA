const fs = require('fs');
const path = require('path');

function findCompleteJson() {
  const candidates = [
    process.env.COMPLETE_MEDIA_PATH,
    'C:/Users/FRAN/cp/exercisedb-api-main/media/exercises_COMPLETE_with_GIFS_FINAL_1.json',
    'C:/Users/FRAN/cp/exercises_COMPLETE_with_media.json',
  ].filter(Boolean);
  for (const p of candidates) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch {}
  }
  return null;
}

function readJson(p) {
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function run() {
  const root = path.resolve(__dirname, '..');
  const publicDir = path.join(root, 'public');
  const exercisesPath = path.join(publicDir, 'exercises.json');

  if (!fs.existsSync(exercisesPath)) {
    console.error('No existe exercises.json en', exercisesPath);
    process.exit(1);
  }

  const completePath = findCompleteJson();
  if (!completePath) {
    console.error('No se encontró JSON final de media. Defina COMPLETE_MEDIA_PATH o coloque el archivo en media/.');
    process.exit(1);
  }
  console.log('Usando media desde:', completePath);

  const base = readJson(exercisesPath);
  const media = readJson(completePath);
  const byId = new Map(Array.isArray(media) ? media.map((m) => [String(m.id), m]) : []);

  let updated = 0;
  const merged = base.map((ex) => {
    const m = byId.get(String(ex.id));
    if (!m) return ex;
    const next = { ...ex };
    // Copiar campos de media si existen en el JSON final
    if (m.gifUrl !== undefined) next.gifUrl = m.gifUrl;
    if (m.thumbnailUrl !== undefined) next.thumbnailUrl = m.thumbnailUrl;
    if (m.videoUrl !== undefined) next.videoUrl = m.videoUrl; // puede ser null
    // Completar contenido si falta
    if ((!next.howTo || String(next.howTo).trim() === '') && typeof m.howTo === 'string') next.howTo = m.howTo;
    if ((!next.description || String(next.description).trim() === '') && typeof m.description === 'string') next.description = m.description;
    if (!Array.isArray(next.muscleGroups) && Array.isArray(m.muscleGroups)) next.muscleGroups = m.muscleGroups;
    if (!Array.isArray(next.equipment) && Array.isArray(m.equipment)) next.equipment = m.equipment;
    updated += 1;
    return next;
  });

  // Respaldar y escribir
  const backupPath = path.join(publicDir, `exercises.backup.${Date.now()}.json`);
  writeJson(backupPath, base);
  writeJson(exercisesPath, merged);

  console.log(`Merge completado: ${updated} ejercicios actualizados de ${base.length}.`);
  console.log('Backup creado en:', backupPath);
}

run();