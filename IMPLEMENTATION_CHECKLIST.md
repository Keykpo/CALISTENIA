# ✅ Checklist de Implementación - Sistema Unificado de Rutinas

**Estado Actual:** Backend completado, pendiente migración DB y tests

---

## 🔧 **Backend (Completado)**

- [x] ✅ Función unificada de stage calculation (`calculateUnifiedStage`)
- [x] ✅ Utilidad de user stats (`getUserStats`)
- [x] ✅ Generador de rutinas semanales (`generateWeeklyRoutine`)
- [x] ✅ Endpoint API unificado (`/api/routines/generate`)
- [x] ✅ Validación de ejercicios (`exercise-validation.ts`)
- [x] ✅ Modelo `WeeklyRoutine` en Prisma schema
- [x] ✅ Documentación completa (`ROUTINE_SYSTEM_UNIFIED.md`)
- [x] ✅ Código commiteado y pusheado

---

## 🗄️ **Base de Datos (Pendiente - HACER AHORA)**

### **Paso 1: Ejecutar migración**

```bash
cd /ruta/a/CALISTENIA
npx prisma generate
npx prisma migrate dev --name add_weekly_routines_and_unified_system
```

**Cambios que se aplicarán:**
- ✅ Crear tabla `WeeklyRoutine`
- ✅ Agregar campo `weeklyRoutineId` a `DailyRoutine`
- ✅ Crear relación entre `User` y `WeeklyRoutine`

### **Paso 2: Verificar migración**

```bash
# Ver las tablas
npx prisma studio

# O con SQLite
sqlite3 prisma/dev.db
.tables
.schema WeeklyRoutine
.quit
```

---

## 🧪 **Testing (Pendiente - HACER DESPUÉS DE MIGRACIÓN)**

### **1. Test del endpoint unificado**

```bash
# Iniciar servidor
npm run dev

# Terminal 2: Test rutina diaria
curl -X POST http://localhost:3000/api/routines/generate \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "mode": "daily",
    "duration": "30min",
    "focusAreas": ["strength", "balance"]
  }'

# Test rutina semanal
curl -X POST http://localhost:3000/api/routines/generate \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "mode": "weekly",
    "daysPerWeek": 4
  }'
```

**Verificar que retorna:**
- ✅ `success: true`
- ✅ `routine` con datos completos
- ✅ `metadata` con stage y userStats
- ✅ Para weekly: array de `dailyRoutines`

### **2. Test de stage calculation**

Crear archivo de test: `apps/web/src/lib/__tests__/training-stages.test.ts`

```typescript
import { calculateUnifiedStage } from '../training-stages';

describe('calculateUnifiedStage', () => {
  test('STAGE_1: beginner with no pull-ups or dips', () => {
    const stage = calculateUnifiedStage({
      pullUpsMax: 0,
      dipsMax: 0,
      bodyWeight: 75,
    });
    expect(stage).toBe('STAGE_1');
  });

  test('STAGE_2: can do 5 pull-ups', () => {
    const stage = calculateUnifiedStage({
      pullUpsMax: 5,
      dipsMax: 8,
      bodyWeight: 75,
    });
    expect(stage).toBe('STAGE_2');
  });

  test('STAGE_3: 12+ pull-ups and 15+ dips', () => {
    const stage = calculateUnifiedStage({
      pullUpsMax: 15,
      dipsMax: 20,
      bodyWeight: 75,
    });
    expect(stage).toBe('STAGE_3');
  });

  test('STAGE_4: weighted pull-ups with +25% BW', () => {
    const stage = calculateUnifiedStage({
      pullUpsMax: 15,
      dipsMax: 20,
      bodyWeight: 80,
      weightedPullUps: 20, // 25% of 80kg
    });
    expect(stage).toBe('STAGE_4');
  });

  test('uses correct body weight for calculations', () => {
    // 60kg user needs +15kg for 25% BW
    const stage1 = calculateUnifiedStage({
      pullUpsMax: 15,
      bodyWeight: 60,
      weightedPullUps: 15,
    });
    expect(stage1).toBe('STAGE_4');

    // 100kg user needs +25kg for 25% BW
    const stage2 = calculateUnifiedStage({
      pullUpsMax: 15,
      bodyWeight: 100,
      weightedPullUps: 25,
    });
    expect(stage2).toBe('STAGE_4');
  });
});
```

**Ejecutar:**
```bash
npm test training-stages
```

### **3. Test de user stats**

```bash
# Crear test: apps/web/src/lib/__tests__/user-stats.test.ts
npm test user-stats
```

### **4. Test de validación de ejercicios**

```bash
# Verificar que exercises.json tiene ejercicios válidos
node -e "
const exercises = require('./apps/web/src/data/exercises.json');
const { validateExerciseDatabase, createValidationReport } = require('./apps/web/src/lib/exercise-validation');

const validation = validateExerciseDatabase(exercises);
console.log('Total exercises:', validation.stats.total);
console.log('Invalid exercises:', validation.invalidExercises.length);

if (validation.invalidExercises.length > 0) {
  console.log('\\nFirst 5 invalid exercises:');
  validation.invalidExercises.slice(0, 5).forEach(({ exercise, validation }) => {
    console.log(\`  - \${exercise.name || exercise.id}:\`, validation.errors);
  });
}
"
```

---

## 🎨 **Frontend (Pendiente - OPCIONAL)**

### **1. Actualizar llamadas API existentes**

Buscar usos antiguos:
```bash
# Buscar endpoints deprecated
grep -r "generate-v3" apps/web/src/
grep -r "generate-daily-routine" apps/web/src/
```

Reemplazar con:
```typescript
// Antes
const res = await fetch('/api/routines/generate-v3', { ... });

// Ahora
const res = await fetch('/api/routines/generate', {
  method: 'POST',
  body: JSON.stringify({
    mode: 'weekly',
    daysPerWeek: 4,
  }),
});
```

### **2. Crear componente para rutinas semanales (OPCIONAL)**

```tsx
// apps/web/src/components/WeeklyRoutineDisplay.tsx
export function WeeklyRoutineDisplay({ routine }: { routine: WeeklyRoutine }) {
  return (
    <div className="space-y-4">
      <h2>Rutina Semanal - {routine.stage}</h2>
      <p>{routine.daysPerWeek} días por semana</p>

      {routine.dailyRoutines.map((daily, i) => (
        <DailyRoutineCard key={i} routine={daily} />
      ))}

      <div className="stats">
        <p>XP Total: {routine.totalEstimatedXP}</p>
        <p>Coins Total: {routine.totalEstimatedCoins}</p>
      </div>

      <div className="notes">
        {routine.notes.map((note, i) => (
          <p key={i}>{note}</p>
        ))}
      </div>
    </div>
  );
}
```

---

## 🚨 **Deprecation Warnings (Pendiente - HACER PRONTO)**

Agregar warnings a endpoints antiguos:

### **1. Actualizar `/api/routines/generate-v3/route.ts`**

```typescript
export async function POST(req: NextRequest) {
  console.warn('[DEPRECATED] /api/routines/generate-v3 is deprecated. Use /api/routines/generate with mode=weekly instead.');

  // ... código existente ...
}
```

### **2. Actualizar `/api/training/generate-daily-routine/route.ts`**

```typescript
export async function POST(req: NextRequest) {
  console.warn('[DEPRECATED] /api/training/generate-daily-routine is deprecated. Use /api/routines/generate with mode=daily instead.');

  // ... código existente ...
}
```

### **3. Agregar header de deprecación**

```typescript
return NextResponse.json(
  { success: true, ... },
  {
    headers: {
      'X-Deprecated': 'true',
      'X-Deprecated-Replacement': '/api/routines/generate',
    },
  }
);
```

---

## 📊 **Validación de Datos (Pendiente - HACER ANTES DE PRODUCCIÓN)**

### **1. Verificar exercises.json**

```bash
node scripts/validate-exercise-data.js

# O crear script:
# scripts/validate-exercises-for-routines.js
```

### **2. Verificar que usuarios tienen bodyWeight**

```sql
-- En Prisma Studio o SQLite
SELECT COUNT(*) FROM users WHERE weight IS NULL;

-- Si hay usuarios sin peso, actualizar:
UPDATE users SET weight = 75 WHERE weight IS NULL;
```

### **3. Verificar user stats**

```typescript
// Crear script: scripts/check-user-stats.ts
import { getUserStats } from '../apps/web/src/lib/user-stats';
import prisma from '../apps/web/src/lib/prisma';

async function checkStats() {
  const users = await prisma.user.findMany({ take: 10 });

  for (const user of users) {
    const stats = await getUserStats(prisma, user.id);
    console.log(`User ${user.id}:`, {
      pullUps: stats.pullUpsMax,
      dips: stats.dipsMax,
      bodyWeight: stats.bodyWeight,
      source: stats.source,
    });
  }
}

checkStats();
```

---

## 📚 **Documentación (Completado)**

- [x] ✅ Guía de migración: `ROUTINE_SYSTEM_UNIFIED.md`
- [x] ✅ Checklist de implementación: Este archivo
- [ ] ⏳ Actualizar README.md con info del nuevo sistema
- [ ] ⏳ Documentar en Notion/Wiki (si aplica)

---

## 🎯 **Orden de Ejecución Recomendado**

### **AHORA (Crítico):**
1. ✅ Ejecutar migración de Prisma
2. ✅ Verificar que DB tiene las tablas nuevas
3. ✅ Probar endpoint `/api/routines/generate` (daily y weekly)
4. ✅ Verificar que stage calculation funciona correctamente

### **PRONTO (Alta prioridad):**
5. ✅ Agregar deprecation warnings a endpoints viejos
6. ✅ Validar exercises.json
7. ✅ Crear tests unitarios
8. ✅ Verificar que usuarios tienen bodyWeight

### **DESPUÉS (Media prioridad):**
9. ⏳ Actualizar frontend para usar nuevo endpoint
10. ⏳ Crear UI para rutinas semanales
11. ⏳ Tests E2E

### **OPCIONAL (Baja prioridad):**
12. ⏳ Eliminar código V3 después de 2 meses
13. ⏳ Analytics de uso de nuevos endpoints
14. ⏳ Optimizaciones de performance

---

## ✅ **Criterios de Aceptación**

El sistema está listo para producción cuando:

- [x] ✅ Código implementado y commiteado
- [ ] ⏳ Migración de DB ejecutada sin errores
- [ ] ⏳ Endpoint `/api/routines/generate` retorna rutinas válidas
- [ ] ⏳ Stage calculation usa peso corporal real
- [ ] ⏳ User stats se calculan correctamente
- [ ] ⏳ Ejercicios se validan antes de agregar
- [ ] ⏳ Tests unitarios pasan
- [ ] ⏳ No hay errores en producción durante 1 semana
- [ ] ⏳ Endpoints deprecated tienen warnings

---

**Última actualización:** 2025-01-18
**Responsable:** Tú (el desarrollador)
**Ayuda:** Claude (yo) - disponible para preguntas
