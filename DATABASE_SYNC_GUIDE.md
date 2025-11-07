# 🔧 Guía de Sincronización de Base de Datos

## Problema: Error P2022 - Columna no existe

Si encuentras el error:
```
P2022: The column `dailyStreak` does not exist in the current database
```

Esto significa que tu base de datos SQLite no está sincronizada con el schema de Prisma.

## ✅ Solución Rápida (Recomendada)

### Opción 1: Usar el Script Automático

```bash
# Desde el directorio raíz del proyecto
./scripts/sync-database.sh
```

Este script:
- ✅ Genera el Prisma Client
- ✅ Sincroniza la base de datos con el schema
- ✅ Maneja problemas de red comunes
- ✅ Proporciona mensajes claros de error

### Opción 2: Comando Manual

```bash
# Detener el servidor de desarrollo si está corriendo (Ctrl+C)

# Sincronizar schema con la base de datos
npx prisma db push --accept-data-loss

# Reiniciar el servidor
npm run dev
```

### Opción 3: Reset Completo de Base de Datos

**⚠️ ADVERTENCIA: Esto borrará todos los datos**

```bash
# 1. Detener el servidor
# Ctrl+C

# 2. Eliminar la base de datos existente
rm prisma/dev.db
rm prisma/dev.db-journal  # Si existe

# 3. Crear nueva base de datos con schema actualizado
npx prisma db push

# 4. (Opcional) Ejecutar seeds para datos de prueba
npm run db:seed

# 5. Reiniciar el servidor
npm run dev
```

## 🔍 Verificar que la Sincronización Funcionó

Después de sincronizar, intenta registrar un usuario:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "username": "test",
    ...
  }
}
```

## 🐛 Solución de Problemas

### Error: "Failed to fetch engine"

Este error ocurre por restricciones de red. Soluciones:

1. **Usar binarios existentes:**
   ```bash
   PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma db push
   ```

2. **Trabajar offline:**
   ```bash
   # Añadir a .env.local
   PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
   ```

### Error: "Database is locked"

La base de datos está siendo usada por otro proceso:

1. Detén el servidor de desarrollo
2. Cierra cualquier herramienta de DB (DB Browser, etc.)
3. Intenta de nuevo

### Error: "Permission denied"

```bash
# Verificar permisos del archivo
ls -la prisma/dev.db

# Dar permisos si es necesario
chmod 664 prisma/dev.db
```

## 📋 Campos del Schema de Usuario

El modelo User en `schema.prisma` incluye estos campos RPG:

```prisma
model User {
  // ... otros campos ...

  // Campos RPG con defaults
  totalXP       Int @default(0)
  currentLevel  Int @default(1)
  virtualCoins  Int @default(0)
  totalStrength Int @default(0)
  dailyStreak   Int @default(0)  // ← Este causaba el error P2022

  // ... más campos ...
}
```

Todos estos campos tienen valores por defecto (`@default`), pero la base de datos debe ser sincronizada para que las columnas existan físicamente.

## 🎯 Prevención Futura

Para evitar este problema en el futuro:

1. **Siempre ejecuta `npx prisma db push` después de:**
   - Modificar `schema.prisma`
   - Hacer `git pull` con cambios en el schema
   - Cambiar de rama con cambios en el schema

2. **Añade a tu workflow:**
   ```bash
   # En package.json, agrega a scripts:
   "db:sync": "prisma db push --accept-data-loss",
   "db:reset": "prisma migrate reset --force"
   ```

3. **Configura un hook de pre-commit (opcional):**
   ```bash
   # .husky/pre-commit
   npx prisma validate
   ```

## ✅ Estado Actual del Código

El endpoint `/api/auth/register` ahora incluye:

1. ✅ Manejo específico del error P2022
2. ✅ Mensaje claro con solución
3. ✅ Todos los campos RPG establecidos explícitamente
4. ✅ Logging detallado para debugging

Si sigues viendo el error P2022 después de sincronizar, por favor:
1. Verifica que `prisma/dev.db` existe
2. Verifica que el servidor se reinició después de sincronizar
3. Revisa los logs del servidor para más detalles

## 📞 Necesitas más ayuda?

Si ninguna de estas soluciones funciona, proporciona:
1. El comando exacto que ejecutaste
2. El error completo (incluyendo stack trace)
3. El resultado de: `npx prisma --version`
4. El resultado de: `ls -la prisma/`
