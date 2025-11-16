# HEXÁGONO REWORK - ESTRATEGIA COMPLETA DE UNIFICACIÓN

**Fecha:** 2025-11-15
**Estado:** IMPLEMENTACIÓN EN PROGRESO
**Objetivo:** Unificar el sistema de hexágono con los 15 sublevels como única fuente de verdad

---

## 🎯 PROBLEMA IDENTIFICADO

### Situación Actual
Tenemos **3 sistemas paralelos** que NO están sincronizados:

1. **Sistema de Hexágono (XP-based)**
   - 4 niveles: BEGINNER, INTERMEDIATE, ADVANCED, ELITE
   - Basado en XP acumulado
   - Umbrales muy amplios (100k-300k por nivel)

2. **Sistema de Sublevels (Metrics-based)**
   - 15 sublevels granulares: D-, D, D+, C-, C, C+, B-, B, B+, A-, A, A+, S-, S, S+
   - Basado en rendimiento real (pull-ups, dips, weighted exercises)
   - Implementado en `assessment-d-s-logic.ts`

3. **Sistema V3 STAGES**
   - 15 stages basados en pull-ups/dips
   - Implementado en `routine-generator-v3.ts`
   - Similar a sublevels pero independiente

### Problema Principal
Un usuario puede:
- Ganar 50,000 XP en el hexágono
- Subir de sublevel D- → C
- Pero seguir mostrando "BEGINNER" en el hexágono
- **Resultado:** Progresión invisible y frustración del usuario

---

## 🎯 SOLUCIÓN: UNIFICACIÓN TOTAL

### Concepto Central
**El SUBLEVEL es la única fuente de verdad**

Todo lo demás se deriva del sublevel:
- Hexágono XP se calcula desde sublevel
- Rutinas se generan desde sublevel
- UI muestra progresión desde sublevel

### Mapeo: 15 Sublevels → XP

Cada sublevel representa aproximadamente **32,000 XP de progresión**:

```
D-  →       0 -  32,000 XP  (BEGINNER Tier 1)
D   →  32,000 -  64,000 XP  (BEGINNER Tier 2)
D+  →  64,000 -  96,000 XP  (BEGINNER Tier 3)

C-  →  96,000 - 128,000 XP  (INTERMEDIATE Tier 1)
C   → 128,000 - 160,000 XP  (INTERMEDIATE Tier 2)
C+  → 160,000 - 192,000 XP  (INTERMEDIATE Tier 3)

B-  → 192,000 - 224,000 XP  (INTERMEDIATE Tier 4)
B   → 224,000 - 256,000 XP  (INTERMEDIATE Tier 5)
B+  → 256,000 - 288,000 XP  (INTERMEDIATE Tier 6)

A-  → 288,000 - 320,000 XP  (ADVANCED Tier 1)
A   → 320,000 - 352,000 XP  (ADVANCED Tier 2)
A+  → 352,000 - 384,000 XP  (ADVANCED Tier 3)

S-  → 384,000 - 416,000 XP  (ELITE Tier 1)
S   → 416,000 - 448,000 XP  (ELITE Tier 2)
S+  → 448,000+         XP  (ELITE Tier 3 - unlimited)
```

### Agrupación Visual (Hexágono UI)

Para mantener visualización simple:
- **BEGINNER:** D-, D, D+ (0-96k XP)
- **INTERMEDIATE:** C-, C, C+, B-, B, B+ (96k-288k XP)
- **ADVANCED:** A-, A, A+ (288k-384k XP)
- **ELITE:** S-, S, S+ (384k+ XP)

---

## 🔧 IMPLEMENTACIÓN - FASE 1: UNIFICACIÓN

### Archivo 1: `apps/web/src/lib/sublevel-to-xp.ts` (NUEVO)

**Propósito:** Funciones de conversión bidireccional entre sublevel y XP

```typescript
export type SubLevel =
  | 'D-' | 'D' | 'D+'
  | 'C-' | 'C' | 'C+'
  | 'B-' | 'B' | 'B+'
  | 'A-' | 'A' | 'A+'
  | 'S-' | 'S' | 'S+';

export type HexagonTier = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

export interface SubLevelXPRange {
  subLevel: SubLevel;
  minXP: number;
  maxXP: number;
  tier: HexagonTier;
  tierLevel: number; // 1-6 within tier
}

// Mapeo completo de 15 sublevels a rangos XP
export const SUBLEVEL_XP_MAP: Record<SubLevel, SubLevelXPRange> = {
  'D-': { subLevel: 'D-', minXP: 0,      maxXP: 32000,  tier: 'BEGINNER', tierLevel: 1 },
  'D':  { subLevel: 'D',  minXP: 32000,  maxXP: 64000,  tier: 'BEGINNER', tierLevel: 2 },
  'D+': { subLevel: 'D+', minXP: 64000,  maxXP: 96000,  tier: 'BEGINNER', tierLevel: 3 },

  'C-': { subLevel: 'C-', minXP: 96000,  maxXP: 128000, tier: 'INTERMEDIATE', tierLevel: 1 },
  'C':  { subLevel: 'C',  minXP: 128000, maxXP: 160000, tier: 'INTERMEDIATE', tierLevel: 2 },
  'C+': { subLevel: 'C+', minXP: 160000, maxXP: 192000, tier: 'INTERMEDIATE', tierLevel: 3 },

  'B-': { subLevel: 'B-', minXP: 192000, maxXP: 224000, tier: 'INTERMEDIATE', tierLevel: 4 },
  'B':  { subLevel: 'B',  minXP: 224000, maxXP: 256000, tier: 'INTERMEDIATE', tierLevel: 5 },
  'B+': { subLevel: 'B+', minXP: 256000, maxXP: 288000, tier: 'INTERMEDIATE', tierLevel: 6 },

  'A-': { subLevel: 'A-', minXP: 288000, maxXP: 320000, tier: 'ADVANCED', tierLevel: 1 },
  'A':  { subLevel: 'A',  minXP: 320000, maxXP: 352000, tier: 'ADVANCED', tierLevel: 2 },
  'A+': { subLevel: 'A+', minXP: 352000, maxXP: 384000, tier: 'ADVANCED', tierLevel: 3 },

  'S-': { subLevel: 'S-', minXP: 384000, maxXP: 416000, tier: 'ELITE', tierLevel: 1 },
  'S':  { subLevel: 'S',  minXP: 416000, maxXP: 448000, tier: 'ELITE', tierLevel: 2 },
  'S+': { subLevel: 'S+', minXP: 448000, maxXP: Infinity, tier: 'ELITE', tierLevel: 3 },
};

// Orden de sublevels para progresión
export const SUBLEVEL_ORDER: SubLevel[] = [
  'D-', 'D', 'D+',
  'C-', 'C', 'C+',
  'B-', 'B', 'B+',
  'A-', 'A', 'A+',
  'S-', 'S', 'S+'
];

/**
 * Convierte un sublevel a su XP mínimo correspondiente
 */
export function sublevelToMinXP(subLevel: SubLevel | null): number {
  if (!subLevel) return 0;
  return SUBLEVEL_XP_MAP[subLevel].minXP;
}

/**
 * Convierte un sublevel a su rango XP completo
 */
export function sublevelToXPRange(subLevel: SubLevel | null): SubLevelXPRange {
  if (!subLevel) return SUBLEVEL_XP_MAP['D-'];
  return SUBLEVEL_XP_MAP[subLevel];
}

/**
 * Convierte XP a sublevel correspondiente
 */
export function xpToSubLevel(xp: number): SubLevel {
  for (const subLevel of SUBLEVEL_ORDER) {
    const range = SUBLEVEL_XP_MAP[subLevel];
    if (xp >= range.minXP && xp < range.maxXP) {
      return subLevel;
    }
  }
  return 'S+'; // Max level
}

/**
 * Obtiene el tier del hexágono desde sublevel
 */
export function sublevelToTier(subLevel: SubLevel | null): HexagonTier {
  if (!subLevel) return 'BEGINNER';
  return SUBLEVEL_XP_MAP[subLevel].tier;
}

/**
 * Obtiene todos los sublevels dentro de un tier
 */
export function getSublevelsInTier(tier: HexagonTier): SubLevel[] {
  return SUBLEVEL_ORDER.filter(sl => SUBLEVEL_XP_MAP[sl].tier === tier);
}

/**
 * Calcula progreso dentro del sublevel actual (0-100%)
 */
export function getSubLevelProgress(currentXP: number, subLevel: SubLevel): number {
  const range = SUBLEVEL_XP_MAP[subLevel];
  if (range.maxXP === Infinity) return 100; // S+ es infinito

  const progress = ((currentXP - range.minXP) / (range.maxXP - range.minXP)) * 100;
  return Math.max(0, Math.min(100, progress));
}

/**
 * Obtiene el siguiente sublevel
 */
export function getNextSubLevel(current: SubLevel): SubLevel | null {
  const currentIndex = SUBLEVEL_ORDER.indexOf(current);
  if (currentIndex === -1 || currentIndex === SUBLEVEL_ORDER.length - 1) {
    return null; // Ya está en S+
  }
  return SUBLEVEL_ORDER[currentIndex + 1];
}

/**
 * Calcula XP necesario para siguiente sublevel
 */
export function getXPToNextSubLevel(currentXP: number, currentSubLevel: SubLevel): number {
  const nextLevel = getNextSubLevel(currentSubLevel);
  if (!nextLevel) return 0; // Ya está en max

  const nextRange = SUBLEVEL_XP_MAP[nextLevel];
  return Math.max(0, nextRange.minXP - currentXP);
}
```

---

### Archivo 2: `apps/web/src/lib/hexagon-unified.ts` (NUEVO)

**Propósito:** Sincronizar XP del hexágono con métricas de rendimiento reales

```typescript
import { SubLevel } from './sublevel-to-xp';
import { sublevelToMinXP, xpToSubLevel, SUBLEVEL_XP_MAP } from './sublevel-to-xp';

export interface PerformanceMetrics {
  pullUpsMax: number;
  dipsMax: number;
  weightedPullUps?: number;
  weightedDips?: number;
  pushUpsMax?: number;
  squatsMax?: number;
  plankSeconds?: number;
}

export interface HexagonXP {
  strength: number;
  staticHolds: number;
  balance: number;
  core: number;
  endurance: number;
  mobility: number;
}

/**
 * Calcula el sublevel basado en métricas de rendimiento
 * (Usa la lógica existente de assessment-d-s-logic.ts)
 */
export function calculateSubLevelFromMetrics(metrics: PerformanceMetrics): SubLevel {
  const { pullUpsMax, dipsMax } = metrics;

  // Pull-ups mapping (15 rangos granulares)
  let pullUpLevel: SubLevel = 'D-';
  if (pullUpsMax >= 70) pullUpLevel = 'S+';
  else if (pullUpsMax >= 60) pullUpLevel = 'S';
  else if (pullUpsMax >= 50) pullUpLevel = 'S-';
  else if (pullUpsMax >= 45) pullUpLevel = 'A+';
  else if (pullUpsMax >= 40) pullUpLevel = 'A';
  else if (pullUpsMax >= 35) pullUpLevel = 'A-';
  else if (pullUpsMax >= 30) pullUpLevel = 'B+';
  else if (pullUpsMax >= 25) pullUpLevel = 'B';
  else if (pullUpsMax >= 20) pullUpLevel = 'B-';
  else if (pullUpsMax >= 15) pullUpLevel = 'C+';
  else if (pullUpsMax >= 11) pullUpLevel = 'C';
  else if (pullUpsMax >= 8) pullUpLevel = 'C-';
  else if (pullUpsMax >= 4) pullUpLevel = 'D+';
  else if (pullUpsMax >= 1) pullUpLevel = 'D';

  // Dips mapping (9 rangos granulares)
  let dipLevel: SubLevel = 'D-';
  if (dipsMax >= 35) dipLevel = 'S+';
  else if (dipsMax >= 30) dipLevel = 'S-';
  else if (dipsMax >= 25) dipLevel = 'A+';
  else if (dipsMax >= 20) dipLevel = 'A-';
  else if (dipsMax >= 15) dipLevel = 'B+';
  else if (dipsMax >= 10) dipLevel = 'B-';
  else if (dipsMax >= 5) dipLevel = 'C';
  else if (dipsMax >= 1) dipLevel = 'D';

  // Promedio ponderado (pull-ups tiene más peso)
  const pullUpIndex = SUBLEVEL_ORDER.indexOf(pullUpLevel);
  const dipIndex = SUBLEVEL_ORDER.indexOf(dipLevel);
  const avgIndex = Math.floor((pullUpIndex * 0.6 + dipIndex * 0.4));

  return SUBLEVEL_ORDER[Math.min(avgIndex, SUBLEVEL_ORDER.length - 1)];
}

/**
 * FUNCIÓN PRINCIPAL: Sincroniza el hexágono XP con el sublevel del usuario
 *
 * Esta es la función que se debe llamar cuando:
 * 1. Usuario completa el assessment inicial
 * 2. Usuario completa un workout y mejora sus métricas
 * 3. Usuario sube de sublevel
 */
export function syncHexagonWithSubLevel(
  currentSubLevel: SubLevel,
  performanceMetrics: PerformanceMetrics
): HexagonXP {
  // Base XP: mínimo del sublevel actual
  const baseXP = sublevelToMinXP(currentSubLevel);

  // Strength axis: directamente desde pull-ups y dips
  const strengthXP = calculateStrengthXP(performanceMetrics, baseXP);

  // Otros ejes: promedian hacia el base XP (placeholder por ahora)
  // TODO: En FASE 2, cada eje tendrá su propio cálculo basado en métricas específicas

  return {
    strength: strengthXP,
    staticHolds: baseXP, // TODO: calcular desde handstand, L-sit, planche progress
    balance: baseXP,     // TODO: calcular desde balance exercises
    core: baseXP,        // TODO: calcular desde hollow holds, dragon flags, etc
    endurance: baseXP,   // TODO: calcular desde circuit performance
    mobility: baseXP,    // TODO: calcular desde ROM tests
  };
}

/**
 * Calcula XP del eje Strength basado en pull-ups y dips
 */
function calculateStrengthXP(metrics: PerformanceMetrics, baseXP: number): number {
  const { pullUpsMax, dipsMax, weightedPullUps, weightedDips } = metrics;

  // Calcula sublevel desde métricas de strength
  const strengthSubLevel = calculateSubLevelFromMetrics(metrics);
  let strengthXP = sublevelToMinXP(strengthSubLevel);

  // Bonus XP por weighted exercises (progresión dentro del sublevel)
  if (weightedPullUps && weightedPullUps > 0) {
    strengthXP += weightedPullUps * 100; // +100 XP por cada kg
  }
  if (weightedDips && weightedDips > 0) {
    strengthXP += weightedDips * 100;
  }

  return Math.max(strengthXP, baseXP);
}

/**
 * Verifica si el usuario subió de sublevel
 */
export function checkSubLevelUp(
  oldMetrics: PerformanceMetrics,
  newMetrics: PerformanceMetrics
): { leveledUp: boolean; oldLevel: SubLevel; newLevel: SubLevel } {
  const oldLevel = calculateSubLevelFromMetrics(oldMetrics);
  const newLevel = calculateSubLevelFromMetrics(newMetrics);

  return {
    leveledUp: oldLevel !== newLevel,
    oldLevel,
    newLevel,
  };
}
```

---

## 🔧 IMPLEMENTACIÓN - FASE 2: INTEGRACIÓN

### Archivo 3: Actualizar `apps/web/src/app/api/assessment/fig-initial/route.ts`

**Cambios necesarios:**

```typescript
import { calculateSubLevelFromMetrics, syncHexagonWithSubLevel } from '@/lib/hexagon-unified';
import { sublevelToTier } from '@/lib/sublevel-to-xp';

// En el POST handler, después de calcular el sublevel:

const subLevel = calculateFinalSubLevel(step2Data, step1Data);

// 🆕 NUEVO: Calcular hexagon XP desde sublevel
const performanceMetrics = {
  pullUpsMax: step2Data.pullUps,
  dipsMax: step2Data.dips,
  weightedPullUps: step2Data.weightedPullUps,
  weightedDips: step2Data.weightedDips,
  pushUpsMax: step2Data.pushUps,
  squatsMax: step2Data.squats,
  plankSeconds: step2Data.plankTime,
};

const hexagonXP = syncHexagonWithSubLevel(subLevel, performanceMetrics);
const hexagonTier = sublevelToTier(subLevel);

// Guardar en la base de datos
await prisma.user.update({
  where: { id: session.user.id },
  data: {
    // ... datos existentes
    trainingSubLevel: subLevel,

    // 🆕 Hexagon sincronizado
    hexagonStrengthXP: hexagonXP.strength,
    hexagonStaticHoldsXP: hexagonXP.staticHolds,
    hexagonBalanceXP: hexagonXP.balance,
    hexagonCoreXP: hexagonXP.core,
    hexagonEnduranceXP: hexagonXP.endurance,
    hexagonMobilityXP: hexagonXP.mobility,

    // 🆕 Tier calculado
    // hexagonLevel: hexagonTier, // Si tienes este campo
  },
});
```

---

### Archivo 4: Actualizar `apps/web/src/app/api/workouts/complete/route.ts`

**Propósito:** Cuando el usuario completa un workout, actualizar sublevel y hexagon si mejoró

```typescript
import { checkSubLevelUp, syncHexagonWithSubLevel } from '@/lib/hexagon-unified';

// Después de que el usuario completa un workout:

// 1. Obtener métricas antiguas
const oldMetrics = {
  pullUpsMax: user.pullUpsMax,
  dipsMax: user.dipsMax,
  weightedPullUps: user.weightedPullUps,
  weightedDips: user.weightedDips,
};

// 2. Obtener nuevas métricas (del workout completado)
const newMetrics = {
  pullUpsMax: Math.max(user.pullUpsMax, workoutData.pullUpsAchieved),
  dipsMax: Math.max(user.dipsMax, workoutData.dipsAchieved),
  weightedPullUps: Math.max(user.weightedPullUps || 0, workoutData.weightedPullUpsAchieved || 0),
  weightedDips: Math.max(user.weightedDips || 0, workoutData.weightedDipsAchieved || 0),
};

// 3. Verificar si subió de nivel
const levelCheck = checkSubLevelUp(oldMetrics, newMetrics);

if (levelCheck.leveledUp) {
  console.log(`🎉 LEVEL UP! ${levelCheck.oldLevel} → ${levelCheck.newLevel}`);

  // Sincronizar hexagon
  const newHexagonXP = syncHexagonWithSubLevel(levelCheck.newLevel, newMetrics);

  // Actualizar usuario
  await prisma.user.update({
    where: { id: userId },
    data: {
      trainingSubLevel: levelCheck.newLevel,
      pullUpsMax: newMetrics.pullUpsMax,
      dipsMax: newMetrics.dipsMax,
      weightedPullUps: newMetrics.weightedPullUps,
      weightedDips: newMetrics.weightedDips,

      // Actualizar hexagon
      hexagonStrengthXP: newHexagonXP.strength,
      hexagonStaticHoldsXP: newHexagonXP.staticHolds,
      hexagonBalanceXP: newHexagonXP.balance,
      hexagonCoreXP: newHexagonXP.core,
      hexagonEnduranceXP: newHexagonXP.endurance,
      hexagonMobilityXP: newHexagonXP.mobility,
    },
  });

  // TODO: Mostrar notificación de level up al usuario
}
```

---

## 🔧 IMPLEMENTACIÓN - FASE 3: UI

### Componente: `apps/web/src/components/dashboard/UnifiedProgressDisplay.tsx` (NUEVO)

**Propósito:** Mostrar progresión unificada al usuario

```typescript
'use client';

import { SubLevel } from '@/lib/sublevel-to-xp';
import {
  sublevelToXPRange,
  getSubLevelProgress,
  getNextSubLevel,
  getXPToNextSubLevel,
  sublevelToTier
} from '@/lib/sublevel-to-xp';

interface UnifiedProgressDisplayProps {
  subLevel: SubLevel;
  currentXP: number; // Strength XP del hexágono
}

export function UnifiedProgressDisplay({ subLevel, currentXP }: UnifiedProgressDisplayProps) {
  const range = sublevelToXPRange(subLevel);
  const progress = getSubLevelProgress(currentXP, subLevel);
  const nextLevel = getNextSubLevel(subLevel);
  const xpToNext = getXPToNextSubLevel(currentXP, subLevel);
  const tier = sublevelToTier(subLevel);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold">{subLevel}</h3>
          <p className="text-sm text-gray-600">{tier}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Current XP</p>
          <p className="text-lg font-semibold">{currentXP.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>{range.minXP.toLocaleString()} XP</span>
        <span>{progress.toFixed(1)}%</span>
        <span>{range.maxXP === Infinity ? '∞' : range.maxXP.toLocaleString()} XP</span>
      </div>

      {nextLevel && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm">
            <strong>{xpToNext.toLocaleString()} XP</strong> to reach <strong>{nextLevel}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 MIGRACIÓN DE DATOS EXISTENTES

### Script: `scripts/migrate-hexagon-to-unified.ts`

**Propósito:** Migrar usuarios existentes al sistema unificado

```typescript
import { PrismaClient } from '@prisma/client';
import { calculateSubLevelFromMetrics, syncHexagonWithSubLevel } from '../apps/web/src/lib/hexagon-unified';

const prisma = new PrismaClient();

async function migrateExistingUsers() {
  console.log('🔄 Starting hexagon unification migration...');

  const users = await prisma.user.findMany({
    where: {
      pullUpsMax: { not: null },
      dipsMax: { not: null },
    },
  });

  console.log(`Found ${users.length} users to migrate`);

  for (const user of users) {
    try {
      // Calcular sublevel desde métricas actuales
      const metrics = {
        pullUpsMax: user.pullUpsMax || 0,
        dipsMax: user.dipsMax || 0,
        weightedPullUps: user.weightedPullUps || undefined,
        weightedDips: user.weightedDips || undefined,
      };

      const subLevel = calculateSubLevelFromMetrics(metrics);
      const hexagonXP = syncHexagonWithSubLevel(subLevel, metrics);

      // Actualizar usuario
      await prisma.user.update({
        where: { id: user.id },
        data: {
          trainingSubLevel: subLevel,
          hexagonStrengthXP: hexagonXP.strength,
          hexagonStaticHoldsXP: hexagonXP.staticHolds,
          hexagonBalanceXP: hexagonXP.balance,
          hexagonCoreXP: hexagonXP.core,
          hexagonEnduranceXP: hexagonXP.endurance,
          hexagonMobilityXP: hexagonXP.mobility,
        },
      });

      console.log(`✅ Migrated user ${user.id}: ${subLevel} (${hexagonXP.strength} XP)`);
    } catch (error) {
      console.error(`❌ Error migrating user ${user.id}:`, error);
    }
  }

  console.log('✅ Migration complete!');
}

migrateExistingUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 🧪 TESTING

### Test 1: Verificar mapeo XP → SubLevel

```typescript
// scripts/test-sublevel-xp-mapping.ts

import { xpToSubLevel, sublevelToMinXP, SUBLEVEL_ORDER } from '../apps/web/src/lib/sublevel-to-xp';

console.log('Testing SubLevel ↔ XP mapping...\n');

// Test cada sublevel
for (const subLevel of SUBLEVEL_ORDER) {
  const minXP = sublevelToMinXP(subLevel);
  const calculatedLevel = xpToSubLevel(minXP);

  console.log(`${subLevel}: ${minXP} XP → ${calculatedLevel} ${subLevel === calculatedLevel ? '✅' : '❌'}`);
}

// Test valores intermedios
console.log('\nTesting intermediate XP values...');
const testValues = [
  { xp: 0, expected: 'D-' },
  { xp: 16000, expected: 'D-' },
  { xp: 32000, expected: 'D' },
  { xp: 50000, expected: 'D' },
  { xp: 100000, expected: 'C-' },
  { xp: 200000, expected: 'B-' },
  { xp: 300000, expected: 'A-' },
  { xp: 400000, expected: 'S-' },
  { xp: 500000, expected: 'S+' },
];

for (const { xp, expected } of testValues) {
  const calculated = xpToSubLevel(xp);
  console.log(`${xp} XP → ${calculated} ${calculated === expected ? '✅' : '❌ (expected ' + expected + ')'}`);
}
```

### Test 2: Verificar sincronización hexagon

```typescript
// scripts/test-hexagon-sync.ts

import { syncHexagonWithSubLevel } from '../apps/web/src/lib/hexagon-unified';

console.log('Testing hexagon synchronization...\n');

const testCases = [
  {
    name: 'Complete beginner',
    subLevel: 'D-',
    metrics: { pullUpsMax: 0, dipsMax: 0 },
  },
  {
    name: 'Intermediate athlete',
    subLevel: 'C+',
    metrics: { pullUpsMax: 18, dipsMax: 12 },
  },
  {
    name: 'Advanced with weighted',
    subLevel: 'A',
    metrics: {
      pullUpsMax: 40,
      dipsMax: 25,
      weightedPullUps: 20,
      weightedDips: 30
    },
  },
];

for (const testCase of testCases) {
  console.log(`\nTest: ${testCase.name}`);
  console.log(`SubLevel: ${testCase.subLevel}`);
  console.log(`Metrics:`, testCase.metrics);

  const hexagonXP = syncHexagonWithSubLevel(testCase.subLevel as any, testCase.metrics);
  console.log('Hexagon XP:', hexagonXP);
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### FASE 1: Core System ✅
- [ ] Crear `apps/web/src/lib/sublevel-to-xp.ts`
- [ ] Crear `apps/web/src/lib/hexagon-unified.ts`
- [ ] Ejecutar tests de mapeo
- [ ] Verificar que no hay gaps en rangos XP

### FASE 2: Integration
- [ ] Actualizar `apps/web/src/app/api/assessment/fig-initial/route.ts`
- [ ] Actualizar `apps/web/src/app/api/workouts/complete/route.ts`
- [ ] Crear script de migración `scripts/migrate-hexagon-to-unified.ts`
- [ ] Ejecutar migración en desarrollo

### FASE 3: UI
- [ ] Crear `apps/web/src/components/dashboard/UnifiedProgressDisplay.tsx`
- [ ] Actualizar dashboard para mostrar sublevel + progreso
- [ ] Actualizar hexagon visual para mostrar tier + sublevel
- [ ] Añadir notificación de "Level Up" cuando sube de sublevel

### FASE 4: Testing
- [ ] Test end-to-end del assessment
- [ ] Test de progresión después de workout
- [ ] Test de level up notification
- [ ] Verificar que XP se sincroniza correctamente

---

## 🎯 RESULTADO ESPERADO

Después de esta implementación:

1. **Una sola fuente de verdad:** El SUBLEVEL determina todo
2. **Progresión visible:** Cada mejora en pull-ups/dips se refleja en XP y sublevel
3. **Hexágono sincronizado:** XP del hexágono = nivel real del usuario
4. **15 niveles granulares:** Cada ~32k XP el usuario sube de sublevel
5. **UI clara:** Usuario ve su sublevel actual, progreso %, y XP hasta siguiente nivel

### Ejemplo de flujo completo:

```
Usuario completa assessment:
- Pull-ups: 12
- Dips: 8

Sistema calcula:
→ SubLevel: C
→ Hexagon Strength XP: 128,000 (mínimo de C)
→ Tier: INTERMEDIATE

Usuario entrena 4 semanas y mejora:
- Pull-ups: 12 → 16
- Dips: 8 → 12

Sistema detecta:
→ SubLevel: C → C+
→ Hexagon Strength XP: 128,000 → 160,000
→ Muestra notificación: "🎉 Level Up! C → C+"

Dashboard muestra:
- Current Level: C+
- Progress: 0% (acaba de subir)
- XP: 160,000 / 192,000
- Next Level: B- (32,000 XP away)
```

---

## 🔄 COMPATIBILIDAD CON SISTEMAS EXISTENTES

### V3 Routine Generator
- ✅ Ya usa sublevels
- ✅ No requiere cambios

### Weekly Progression
- ✅ Ya usa sublevels
- ✅ No requiere cambios

### Training Splits
- ✅ Basado en training frequency
- ✅ No requiere cambios

### Daily Routine Generator
- ✅ Ya usa equipment filtering
- ✅ No requiere cambios

### Assessment Flow
- ⚠️ Requiere actualización para sincronizar hexagon
- 📝 Ver FASE 2 arriba

---

## 📚 REFERENCIAS

- `apps/web/src/lib/assessment-d-s-logic.ts` - Lógica de cálculo de sublevels
- `apps/web/src/lib/routine-generator-v3.ts` - Sistema V3 con 15 stages
- `apps/web/src/lib/weekly-progression.ts` - Progresión mesociclo 4 semanas
- `ANALISIS_HEXAGONO_VS_SISTEMAS.md` - Análisis del problema original
- `ASSESSMENT_ANALYSIS_Y_MEJORAS.md` - Mejoras del assessment

---

**Fecha de creación:** 2025-11-15
**Última actualización:** 2025-11-15
**Estado:** READY FOR IMPLEMENTATION
