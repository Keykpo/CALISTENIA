const fs = require('fs');
const path = require('path');

function findCompleteJson() {
  const candidates = [
    process.env.COMPLETE_MEDIA_PATH,
    'C:/Users/FRAN/cp/exercisedb-api-main/media/exercises_COMPLETE_with_GIFS_FINAL_1.json',
    'C:/Users/FRAN/cp/exercises_COMPLETE_with_media.json',
  ].filter(Boolean);
  for (const p of candidates) {
    try { if (p && fs.existsSync(p)) return p; } catch {}
  }
  return null;
}

function readJson(p) {
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function tokenFromUrl(u) {
  if (!u || typeof u !== 'string') return null;
  const m = u.match(/(?:\/image\/|\/media\/)([A-Za-z0-9-]+)(?:\.gif)?$/);
  return m ? m[1] : null;
}

function run() {
  const root = path.resolve(__dirname, '..');
  const publicDir = path.join(root, 'public');
  const cacheDir = path.join(publicDir, 'cached-gifs');
  const mediaDir = 'C:/Users/FRAN/cp/exercisedb-api-main/media';
  const reportPath = path.resolve('C:/Users/FRAN/cp/precache-report.json');

  const completePath = findCompleteJson();
  if (!completePath) {
    console.error('No se encontró JSON final de media. Defina COMPLETE_MEDIA_PATH o coloque el archivo en media/.');
    process.exit(1);
  }
  console.log('Leyendo media desde:', completePath);
  const arr = readJson(completePath);
  ensureDir(cacheDir);

  const missing = [];
  let copied = 0;

  for (const item of Array.isArray(arr) ? arr : []) {
    const id = String(item.id);
    const url = item.gifUrl || item.thumbnailUrl || item.imageUrl;
    const token = tokenFromUrl(url);
    const dest = path.join(cacheDir, `${id}.gif`);
    if (fs.existsSync(dest)) {
      continue; // ya cacheado
    }
    if (!token) {
      missing.push({ id, reason: 'sin token', url });
      continue;
    }
    const src = path.join(mediaDir, `${token}.gif`);
    if (fs.existsSync(src)) {
      try {
        fs.copyFileSync(src, dest);
        copied += 1;
      } catch (e) {
        missing.push({ id, token, reason: 'error copiando', error: String(e) });
      }
    } else {
      missing.push({ id, token, reason: 'no existe local', url });
    }
  }

  fs.writeFileSync(reportPath, JSON.stringify({ copied, missing }, null, 2), 'utf8');
  console.log(`Precaching completado: ${copied} archivos copiados. Reporte en ${reportPath}`);
}

run();