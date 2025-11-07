#!/bin/bash

# Script de configuración local para la Plataforma de Calistenia
# Ejecuta este script en tu máquina local para configurar todo automáticamente

set -e

echo "🚀 Configurando Plataforma de Calistenia..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar Node.js
echo "${BLUE}📦 Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "${YELLOW}⚠️  Node.js no encontrado. Por favor instala Node.js 18+ desde https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "${YELLOW}⚠️  Node.js $NODE_VERSION encontrado. Se requiere Node.js 18+${NC}"
    exit 1
fi

echo "${GREEN}✅ Node.js $(node -v) encontrado${NC}"
echo ""

# 2. Instalar dependencias
echo "${BLUE}📦 Instalando dependencias...${NC}"
npm install
echo "${GREEN}✅ Dependencias instaladas${NC}"
echo ""

# 3. Generar cliente de Prisma
echo "${BLUE}🔧 Generando cliente de Prisma...${NC}"
npx prisma generate
echo "${GREEN}✅ Cliente de Prisma generado${NC}"
echo ""

# 4. Crear base de datos
echo "${BLUE}💾 Creando base de datos SQLite...${NC}"
npx prisma db push --accept-data-loss
echo "${GREEN}✅ Base de datos creada${NC}"
echo ""

# 5. Poblar base de datos (opcional)
echo "${BLUE}🌱 ¿Deseas poblar la base de datos con skills y achievements? (s/n)${NC}"
read -r response
if [[ "$response" =~ ^([sS][iI]|[sS])$ ]]; then
    echo "${BLUE}🌱 Poblando base de datos...${NC}"
    npm run db:seed
    echo "${GREEN}✅ Base de datos poblada${NC}"
    echo ""
fi

# 6. Verificar archivos de configuración
echo "${BLUE}🔍 Verificando archivos de configuración...${NC}"

if [ ! -f "apps/web/.env.local" ]; then
    echo "${YELLOW}⚠️  Archivo .env.local no encontrado${NC}"
    echo "${BLUE}Creando .env.local desde ejemplo...${NC}"
    cp apps/web/.env.local.example apps/web/.env.local
    echo "${YELLOW}⚠️  IMPORTANTE: Edita apps/web/.env.local y actualiza:${NC}"
    echo "   - NEXTAUTH_SECRET (genera uno único)"
    echo "   - NEXTAUTH_URL (tu URL local, por defecto http://localhost:3000)"
else
    echo "${GREEN}✅ Archivo .env.local encontrado${NC}"
fi
echo ""

# 7. Instrucciones finales
echo "${GREEN}✅ ¡Configuración completa!${NC}"
echo ""
echo "${BLUE}📋 Próximos pasos:${NC}"
echo ""
echo "  1️⃣  Inicia el servidor de desarrollo:"
echo "     ${YELLOW}npm run dev${NC}"
echo ""
echo "  2️⃣  Abre tu navegador en:"
echo "     ${YELLOW}http://localhost:3000${NC}"
echo ""
echo "  3️⃣  Registra un usuario en:"
echo "     ${YELLOW}http://localhost:3000/auth/register${NC}"
echo ""
echo "  4️⃣  (Opcional) Inspecciona la base de datos:"
echo "     ${YELLOW}npx prisma studio${NC}"
echo ""
echo "${GREEN}🎉 ¡Listo para comenzar!${NC}"
echo ""
