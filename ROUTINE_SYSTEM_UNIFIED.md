# Sistema de Rutinas Unificado - Guía de Migración

**Fecha:** 2025-01-18
**Versión:** 1.0
**Estado:** ✅ Implementado

---

## 📋 Resumen Ejecutivo

Se ha implementado un **Sistema de Rutinas Unificado** que reemplaza los sistemas antiguos (V3 y Daily) con una solución más robusta, consistente y mantenible.

### Antes (Problemas)
- ❌ Dos sistemas paralelos confusos (V3 y Daily)
- ❌ Cálculo de stage inconsistente
- ❌ Peso corporal hardcodeado (75kg para todos)
- ❌ User stats calculados de formas diferentes
- ❌ Ejercicios sin validación
- ❌ Persistencia inconsistente en DB

### Ahora (Soluciones)
- ✅ **Un solo sistema unificado** con dos modos (daily/weekly)
- ✅ **Cálculo de stage unificado** (`calculateUnifiedStage`)
- ✅ **User stats consistentes** (`getUserStats`)
- ✅ **Peso corporal real del usuario** (campo `weight`)
- ✅ **Validación completa de ejercicios**
- ✅ **Persistencia unificada** (DailyRoutine + WeeklyRoutine models)

---

## 🎯 Componentes del Sistema Unificado

### 1. **Cálculo de Training Stage Unificado**

**Archivo:** `/apps/web/src/lib/training-stages.ts`

```typescript
import { calculateUnifiedStage, type UnifiedStageParams } from '@/lib/training-stages';

const stageParams: UnifiedStageParams = {
  // Opción 1: Métricas directas (preferido)
  pullUpsMax: 15,
  dipsMax: 20,
  bodyWeight: 75,
  weightedPullUps: 20, // kg adicionales
  weightedDips: 30,

  // Opción 2: Hexagon profile (fallback)
  strengthLevel: 'ADVANCED',
  strengthXP: 400000,
};

const stage = calculateUnifiedStage(stageParams);
// Retorna: 'STAGE_1' | 'STAGE_2' | 'STAGE_3' | 'STAGE_4'
```

**Ventajas:**
- Acepta métricas directas o hexagon profile
- Prioriza métricas directas (más precisas)
- Usa peso corporal real del usuario
- Consistente en toda la app

---

### 2. **User Stats Unificados**

**Archivo:** `/apps/web/src/lib/user-stats.ts`

```typescript
import { getUserStats } from '@/lib/user-stats';

const userStats = await getUserStats(prisma, userId, {
  preferUserModel: true,      // Preferir campos del User model
  includeLogAnalysis: true,   // Incluir análisis de workout logs
  maxLogAgeDays: 90,           // Logs de los últimos 90 días
});

// Retorna:
{
  pullUpsMax: 15,
  dipsMax: 20,
  pushUpsMax: 30,
  weightedPullUps: 20,        // kg
  weightedDips: 30,           // kg
  bodyWeight: 75,             // kg real del usuario
  height: 175,                // cm
  weightedPullUpsPercent: 26.67, // %
  weightedDipsPercent: 40,    // %
  source: 'hybrid',           // 'user_model' | 'workout_logs' | 'hybrid'
  lastUpdated: Date
}
```

**Fuentes de datos:**
1. User model (campos directos)
2. ManualExerciseLog (histórico)
3. Híbrido (mejor de ambos)

---

### 3. **Generación de Rutinas**

**Archivo:** `/apps/web/src/lib/daily-routine-generator.ts`

#### Rutina Diaria

```typescript
import { generateDailyRoutine } from '@/lib/daily-routine-generator';

const routine = generateDailyRoutine(params, allExercises);
// Retorna: DailyRoutine con fases, ejercicios, XP, etc.
```

#### Rutina Semanal (NUEVO ✨)

```typescript
import { generateWeeklyRoutine } from '@/lib/daily-routine-generator';

const weeklyRoutine = generateWeeklyRoutine(
  {
    ...params,
    daysPerWeek: 4, // 2-6 días
  },
  allExercises
);

// Retorna: WeeklyRoutine con:
// - dailyRoutines: DailyRoutine[] (uno por cada día de entrenamiento)
// - totalEstimatedXP: number
// - totalEstimatedCoins: number
// - weeklyFocusAreas: UnifiedHexagonAxis[]
// - notes: string[]
```

---

### 4. **API Endpoint Unificado**

**Nuevo Endpoint:** `/api/routines/generate`
**Reemplaza:**
- ❌ `/api/routines/generate-v3` (deprecated)
- ❌ `/api/training/generate-daily-routine` (deprecated)

#### POST /api/routines/generate

```typescript
// Rutina diaria
const response = await fetch('/api/routines/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'daily',
    duration: '30min',
    focusAreas: ['strength', 'balance'],
  }),
});

// Rutina semanal
const response = await fetch('/api/routines/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'weekly',
    daysPerWeek: 4,
  }),
});
```

**Response:**
```json
{
  "success": true,
  "mode": "weekly",
  "routine": { /* WeeklyRoutine object */ },
  "metadata": {
    "stage": "STAGE_3",
    "userStats": {
      "pullUps": 15,
      "dips": 20,
      "bodyWeight": 75,
      "source": "hybrid"
    }
  }
}
```

---

### 5. **Validación de Ejercicios**

**Archivo:** `/apps/web/src/lib/exercise-validation.ts`

```typescript
import {
  validateExerciseDatabase,
  findExercisesByCategory,
  createValidationReport,
} from '@/lib/exercise-validation';

// Validar base de datos completa
const validation = validateExerciseDatabase(exercises);
console.log(validation.stats);
console.log(validation.invalidExercises);

// Buscar ejercicios con validación
const exercises = findExercisesByCategory(allExercises, 'PUSH', {
  difficulty: 'INTERMEDIATE',
  equipment: ['PULL_UP_BAR'],
  limit: 5,
  validateFirst: true, // Solo retorna ejercicios válidos
});

// Generar reporte
const report = createValidationReport(allExercises);
console.log(report);
```

---

### 6. **Modelos de Base de Datos**

#### WeeklyRoutine (NUEVO ✨)

```prisma
model WeeklyRoutine {
  id     String @id @default(cuid())
  userId String

  weekStartDate       DateTime
  stage               String // STAGE_1, STAGE_2, STAGE_3, STAGE_4
  difficulty          String
  daysPerWeek         Int

  totalEstimatedXP    Int
  totalEstimatedCoins Int
  weeklyFocusAreas    String // JSON
  notes               String // JSON
  routine             String // JSON

  completed   Boolean   @default(false)
  completedAt DateTime?

  dailyRoutines DailyRoutine[]
  user          User           @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### DailyRoutine (ACTUALIZADO)

```prisma
model DailyRoutine {
  // ... campos existentes ...

  // NUEVO: Link opcional a rutina semanal
  weeklyRoutineId String?
  weeklyRoutine   WeeklyRoutine? @relation(...)
}
```

---

## 🔄 Guía de Migración

### Para Desarrolladores

#### 1. Actualizar imports

**Antes:**
```typescript
import { determineTrainingStage } from '@/lib/routine-generator-v3';
import { calculateUserStage } from '@/lib/training-stages';
```

**Ahora:**
```typescript
import { calculateUnifiedStage } from '@/lib/training-stages';
```

#### 2. Actualizar llamadas API

**Antes:**
```typescript
// V3
const res = await fetch('/api/routines/generate-v3', { ... });

// Daily
const res = await fetch('/api/training/generate-daily-routine', { ... });
```

**Ahora:**
```typescript
const res = await fetch('/api/routines/generate', {
  method: 'POST',
  body: JSON.stringify({
    mode: 'daily', // o 'weekly'
    // ... params
  }),
});
```

#### 3. Actualizar cálculos de stage

**Antes:**
```typescript
const stage = determineTrainingStage({
  pullUpsMax: 15,
  dipsMax: 20,
  // ... pero peso corporal era hardcoded a 75kg
});
```

**Ahora:**
```typescript
const userStats = await getUserStats(prisma, userId);
const stage = calculateUnifiedStage({
  pullUpsMax: userStats.pullUpsMax,
  dipsMax: userStats.dipsMax,
  bodyWeight: userStats.bodyWeight, // ✅ Peso real
  weightedPullUps: userStats.weightedPullUps,
  weightedDips: userStats.weightedDips,
});
```

---

### Para Frontend

#### Migración de componentes

**Buscar y reemplazar:**
```bash
# Buscar usos del API antiguo
grep -r "generate-v3" apps/web/src
grep -r "generate-daily-routine" apps/web/src

# Reemplazar con nuevo endpoint
# /api/routines/generate
```

**Ejemplo de migración:**

**Antes:**
```typescript
const { data } = await fetch('/api/routines/generate-v3', {
  method: 'POST',
  body: JSON.stringify({
    daysPerWeek: 4,
    minutesPerSession: 60,
  }),
});
```

**Ahora:**
```typescript
const { data } = await fetch('/api/routines/generate', {
  method: 'POST',
  body: JSON.stringify({
    mode: 'weekly',
    daysPerWeek: 4,
  }),
});
```

---

## 🗑️ Endpoints Deprecated

### ❌ `/api/routines/generate-v3`
- **Estado:** Deprecated
- **Reemplazar con:** `/api/routines/generate?mode=weekly`
- **Mantener hasta:** 2025-03-01 (2 meses)
- **Acción:** Agregar warning logs

### ❌ `/api/training/generate-daily-routine`
- **Estado:** Deprecated
- **Reemplazar con:** `/api/routines/generate?mode=daily`
- **Mantener hasta:** 2025-03-01 (2 meses)
- **Acción:** Agregar warning logs

---

## 📊 Comparación de Sistemas

| Feature | V3 (OLD) | Daily (OLD) | Unified (NEW) |
|---------|----------|-------------|---------------|
| Rutinas diarias | ❌ | ✅ | ✅ |
| Rutinas semanales | ✅ | ❌ | ✅ |
| Cálculo de stage | Inconsistente | Inconsistente | ✅ Unificado |
| Peso corporal | ❌ Hardcoded 75kg | ❌ Hardcoded | ✅ Del usuario |
| User stats | Campos del User | Workout logs | ✅ Híbrido |
| Validación ejercicios | ❌ | ❌ | ✅ |
| Persistencia DB | ❌ No guardaba | ✅ DailyRoutine | ✅ Ambos |
| Expert templates | ❌ | ✅ | ✅ |
| Gating system | ✅ | ✅ | ✅ Mejorado |

---

## 🎓 Mejores Prácticas

### 1. Usar getUserStats para todas las métricas

```typescript
// ❌ NO hacer
const pullUps = user.pullUpsMax || 0;

// ✅ SÍ hacer
const userStats = await getUserStats(prisma, userId);
const pullUps = userStats.pullUpsMax;
```

### 2. Usar calculateUnifiedStage para stage

```typescript
// ❌ NO hacer
const stage = user.pullUpsMax >= 12 ? 'STAGE_3' : 'STAGE_2';

// ✅ SÍ hacer
const stage = calculateUnifiedStage({
  pullUpsMax: userStats.pullUpsMax,
  dipsMax: userStats.dipsMax,
  bodyWeight: userStats.bodyWeight,
});
```

### 3. Validar ejercicios antes de usar

```typescript
// ✅ Validación automática
const exercises = findExercisesByCategory(allExercises, 'PUSH', {
  validateFirst: true,
});
```

### 4. Usar el endpoint unificado

```typescript
// ✅ Endpoint único para todo
fetch('/api/routines/generate', {
  body: JSON.stringify({ mode: 'daily' | 'weekly' }),
});
```

---

## 🧪 Testing

### Ejecutar migraciones

```bash
# 1. Formatear schema
npx prisma format

# 2. Generar migración
npx prisma migrate dev --name add_weekly_routines

# 3. Generar cliente
npx prisma generate
```

### Probar endpoints

```bash
# Rutina diaria
curl -X POST http://localhost:3000/api/routines/generate \
  -H "Content-Type: application/json" \
  -d '{"mode":"daily","duration":"30min"}'

# Rutina semanal
curl -X POST http://localhost:3000/api/routines/generate \
  -H "Content-Type: application/json" \
  -d '{"mode":"weekly","daysPerWeek":4}'
```

---

## 📝 Checklist de Migración

### Backend
- [x] ✅ Función unificada de stage calculation
- [x] ✅ Utilidad de user stats
- [x] ✅ Generador de rutinas semanales
- [x] ✅ Endpoint API unificado
- [x] ✅ Validación de ejercicios
- [x] ✅ Modelo WeeklyRoutine en Prisma
- [ ] ⏳ Ejecutar migración de DB
- [ ] ⏳ Agregar warnings a endpoints deprecated
- [ ] ⏳ Tests unitarios

### Frontend
- [ ] ⏳ Actualizar llamadas API
- [ ] ⏳ Probar generación diaria
- [ ] ⏳ Probar generación semanal
- [ ] ⏳ UI para rutinas semanales
- [ ] ⏳ Tests E2E

### Documentación
- [x] ✅ Guía de migración
- [ ] ⏳ Actualizar README
- [ ] ⏳ Ejemplos de uso

---

## 🚀 Próximos Pasos

1. **Ejecutar migración de Prisma:**
   ```bash
   npx prisma migrate dev --name add_weekly_routines
   ```

2. **Actualizar frontend** para usar nuevo endpoint

3. **Agregar deprecation warnings** a endpoints antiguos:
   ```typescript
   console.warn('[DEPRECATED] /api/routines/generate-v3 is deprecated. Use /api/routines/generate with mode=weekly');
   ```

4. **Testing exhaustivo:**
   - Tests unitarios para cada función
   - Tests de integración para endpoints
   - Tests E2E para flujos completos

5. **Monitoreo:**
   - Logs de uso de endpoints deprecated
   - Métricas de generación de rutinas
   - Errores y warnings

---

## 📞 Soporte

**¿Preguntas?** Revisar:
- Archivo: `/apps/web/src/lib/training-stages.ts`
- Archivo: `/apps/web/src/lib/user-stats.ts`
- Archivo: `/apps/web/src/lib/daily-routine-generator.ts`
- Archivo: `/apps/web/src/app/api/routines/generate/route.ts`

---

**Autor:** Claude (Anthropic)
**Fecha:** 2025-01-18
**Versión del Sistema:** Unified v1.0
