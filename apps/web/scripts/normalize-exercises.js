const fs = require('fs');
const path = require('path');

// Extrae objetos individuales del texto, aunque el array global esté corrupto
function extractObjects(text) {
  // Aproximación basada en regex: cada bloque entre { ... }
  const s = text;
  const matches = s.match(/\{[^}]*\}/g);
  return matches || [];
}

function cleanObjectText(t) {
  let txt = t;
  // Quitar comas colgantes antes de cierre
  txt = txt.replace(/,\s*}/g, '}');
  txt = txt.replace(/,\s*]/g, ']');
  // Completar arrays vacíos mal escritos
  txt = txt.replace(/"muscleGroups"\s*:\s*,/g, '"muscleGroups": [],');
  txt = txt.replace(/"equipment"\s*:\s*,/g, '"equipment": [],');
  // Casos con salto de línea antes del cierre de objeto
  txt = txt.replace(/"muscleGroups"\s*:\s*\n\s*},/g, '"muscleGroups": [],\n  },');
  txt = txt.replace(/"muscleGroups"\s*:\s*\n\s*}/g, '"muscleGroups": []\n  }');
  txt = txt.replace(/"equipment"\s*:\s*\n\s*},/g, '"equipment": [],\n  },');
  txt = txt.replace(/"equipment"\s*:\s*\n\s*}/g, '"equipment": []\n  }');
  return txt;
}

function parseObject(objText) {
  const cleaned = cleanObjectText(objText);
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Segundo intento con limpiezas adicionales comunes
    const cleaned2 = cleaned
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/"muscleGroups"\s*:\s*(?=})/g, '"muscleGroups": []')
      .replace(/"equipment"\s*:\s*(?=})/g, '"equipment": []');
    try {
      return JSON.parse(cleaned2);
    } catch {
      return null;
    }
  }
}

function defaultMuscleGroups(id) {
  if (id.startsWith('push_') || id.startsWith('dips_') || id.startsWith('skill_planche')) {
    return ['PECHO', 'HOMBROS', 'TRICEPS'];
  }
  if (id.startsWith('row_') || id.startsWith('pull_') || id.includes('front_lever') || id.includes('back_lever')) {
    return ['ESPALDA', 'BICEPS'];
  }
  if (id.startsWith('squat_') || id.startsWith('curl_nordic')) {
    return ['PIERNAS', 'GLUTEOS'];
  }
  if (id.startsWith('core_')) {
    return ['CORE'];
  }
  if (id.startsWith('skill_')) {
    return ['HOMBROS', 'CORE'];
  }
  return ['CUERPO'];
}

function defaultEquipment(id) {
  if (id.includes('ring')) return ['RINGS'];
  if (id.includes('parallel') || id.includes('paralelas')) return ['PARALLEL_BARS'];
  if (id.startsWith('pull_') || id.startsWith('row_') || id.includes('bar')) return ['BAR'];
  if (id.startsWith('squat_') || id.startsWith('push_') || id.startsWith('core_') || id.startsWith('skill_planche')) return ['NONE'];
  return ['NONE'];
}

function rewardsForDifficulty(diff) {
  // Escala proporcional basada en tu JSON 2
  switch (diff) {
    case 'BEGINNER': return { expReward: 10, coinsReward: 1 };
    case 'NOVICE': return { expReward: 50, coinsReward: 5 };
    case 'INTERMEDIATE': return { expReward: 150, coinsReward: 20 };
    case 'ADVANCED': return { expReward: 300, coinsReward: 50 };
    case 'EXPERT': return { expReward: 1200, coinsReward: 250 };
    default: return { expReward: 50, coinsReward: 5 };
  }
}

function normalizeItem(ex) {
  const id = ex.id || 'unknown_' + Math.random().toString(36).slice(2,8);
  const muscleGroups = Array.isArray(ex.muscleGroups) ? ex.muscleGroups : defaultMuscleGroups(id);
  const equipment = Array.isArray(ex.equipment) ? ex.equipment : defaultEquipment(id);
  const rewards = rewardsForDifficulty(ex.difficulty);
  const expReward = typeof ex.exp === 'number' ? ex.exp : rewards.expReward;
  const coinsReward = typeof ex.coins === 'number' ? ex.coins : rewards.coinsReward;
  const category = ex.category || 'STRENGTH';
  const unit = ex.unit || ((category === 'WARM_UP' || category === 'BALANCE' || category === 'CORE' || category === 'SKILL_STATIC') ? 'time' : 'reps');
  return {
    id,
    name: ex.name || id,
    description: ex.description || '',
    category,
    difficulty: ex.difficulty || 'NOVICE',
    unit,
    muscleGroups,
    equipment,
    expReward,
    coinsReward,
  };
}

function main() {
  const sourcePath = path.resolve('C:/Users/FRAN/cp/EJERCICIOS COMPLETOS.json');
  const source2Path = path.resolve('C:/Users/FRAN/cp/EJERCICIOS COMPLETOS 2.json');
  const targetPath = path.resolve(__dirname, '../public/exercises.json');

  const raw = fs.readFileSync(sourcePath, 'utf8');
  const firstBrace = raw.indexOf('{');
  const braceCount = (raw.match(/\{/g) || []).length;
  const pieces = extractObjects(raw);
  const parsed1 = pieces.map(parseObject).filter(Boolean);
  // Cargar el segundo JSON (formato válido array)
  let parsed2 = [];
  try {
    const raw2 = fs.readFileSync(source2Path, 'utf8');
    const arr2 = JSON.parse(raw2);
    if (Array.isArray(arr2)) parsed2 = arr2;
  } catch (e) {
    // si no existe o está mal formado, continuar sin romper
  }
  const parsed = parsed1.concat(parsed2);

  // Normalizar y deduplicar por id
  const dedupMap = new Map();
  for (const ex of parsed) {
    const norm = normalizeItem(ex);
    dedupMap.set(norm.id, norm);
  }
  const result = Array.from(dedupMap.values());

  // Merge media from exercises_COMPLETE_with_media.json
  const mediaPath = path.resolve('C:/Users/FRAN/cp/exercises_COMPLETE_with_media.json');
  let media = [];
  if (fs.existsSync(mediaPath)) {
    try {
      media = JSON.parse(fs.readFileSync(mediaPath, 'utf8'));
    } catch (e) {
      console.warn('No se pudo parsear exercises_COMPLETE_with_media.json:', e.message);
      media = [];
    }
  } else {
    console.warn('No se encontró exercises_COMPLETE_with_media.json en', mediaPath);
  }

  const mediaById = new Map(media.map((m) => [m.id, m]));
  const merged = result.map((item) => {
    const m = mediaById.get(item.id);
    if (!m) return item;
    const updated = { ...item };
    if (m.gifUrl !== undefined) updated.gifUrl = m.gifUrl;
    if (m.thumbnailUrl !== undefined) updated.thumbnailUrl = m.thumbnailUrl;
    if (m.videoUrl !== undefined) updated.videoUrl = m.videoUrl; // puede ser null
    if ((!updated.howTo || String(updated.howTo).trim() === '') && typeof m.howTo === 'string') {
      updated.howTo = m.howTo;
    }
    if ((!updated.description || String(updated.description).trim() === '') && typeof m.description === 'string') {
      updated.description = m.description;
    }
    if (!Array.isArray(updated.muscleGroups) && Array.isArray(m.muscleGroups)) {
      updated.muscleGroups = m.muscleGroups;
    }
    if (!Array.isArray(updated.equipment) && Array.isArray(m.equipment)) {
      updated.equipment = m.equipment;
    }
    return updated;
  });

  // Append media-only exercises not present in normalized result
  const resultIds = new Set(result.map((e) => e.id));
  const additions = media.filter((m) => !resultIds.has(m.id));
  const finalOutput = [...merged, ...additions];

  fs.writeFileSync(targetPath, JSON.stringify(finalOutput, null, 2) + '\n', 'utf8');
  console.log(`Extraídos ${parsed.length} objetos (fuente1=${parsed1.length}, fuente2=${parsed2.length}); escritos ${finalOutput.length} (incluye merge de media) en ${targetPath}`);
  const logPath = path.resolve('C:/Users/FRAN/cp/normalize_log.txt');
  fs.writeFileSync(logPath, `firstBrace=${firstBrace}\nbraceCount=${braceCount}\npieces=${pieces.length}\nparsed1=${parsed1.length}\nparsed2=${parsed2.length}\nparsedTotal=${parsed.length}\nresult_before_merge=${result.length}\nfinalOutput=${finalOutput.length}\n`, 'utf8');
}

main();