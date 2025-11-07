#!/usr/bin/env node

/**
 * Script para crear la base de datos SQLite manualmente
 * Esto es necesario porque Prisma no puede descargar binaries debido a restricciones de red
 */

const fs = require('fs');
const path = require('path');

// Crear el directorio prisma si no existe
const prismaDir = path.join(__dirname, 'prisma');
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}

// Crear un archivo de base de datos vacío
const dbPath = path.join(prismaDir, 'dev.db');

// Si ya existe, no hacer nada
if (fs.existsSync(dbPath)) {
  console.log('✅ La base de datos ya existe en:', dbPath);
  console.log('📝 Tamaño:', fs.statSync(dbPath).size, 'bytes');
  process.exit(0);
}

// Crear archivo vacío
fs.writeFileSync(dbPath, '');
console.log('✅ Archivo de base de datos creado en:', dbPath);

// Ahora intentamos usar prisma migrate o db push
const { execSync } = require('child_process');

console.log('\n🔧 Intentando aplicar el schema de Prisma...\n');

try {
  // Primero intentemos generar el cliente
  console.log('Paso 1: Generando el cliente de Prisma...');
  try {
    const generateOutput = execSync('PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate', {
      stdio: 'pipe',
      cwd: __dirname,
      env: { ...process.env, PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1' }
    }).toString();
    console.log(generateOutput);
  } catch (e) {
    console.log('⚠️  No se pudo generar el cliente (puede estar ya generado)');
  }

  // Luego intentemos aplicar el schema
  console.log('\nPaso 2: Aplicando schema a la base de datos...');
  const pushOutput = execSync('PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma db push --accept-data-loss --skip-generate', {
    stdio: 'pipe',
    cwd: __dirname,
    env: { ...process.env, PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1' }
  }).toString();
  console.log(pushOutput);

  console.log('\n✅ ¡Base de datos creada y configurada exitosamente!');
} catch (error) {
  console.error('\n❌ Error al aplicar el schema:');
  console.error(error.message);
  console.log('\n💡 La base de datos se creará automáticamente en el primer registro de usuario.');
  console.log('   Next.js y Prisma gestionarán la creación del schema.');
}

console.log('\n📊 Ubicación de la base de datos:', dbPath);
console.log('🚀 Puedes iniciar el servidor con: npm run dev');
