# 📊 ANÁLISIS: Hexágono vs Sistemas Implementados

## 🎯 Resumen Ejecutivo

**VEREDICTO:** El hexágono actual está **DESALINEADO** con los nuevos sistemas (Sublevels, V3, RUTINAS_POR_NIVEL). Necesita actualizaciones para aprovechar la granularidad de 15 sublevels.

---

## 📋 Estado Actual del Hexágono

### **Ejes (6 axes)** ✅ BIEN
```typescript
1. balance      - Balance & Handstands
2. strength     - Strength & Power (Pull-ups, Dips, Weighted)
3. staticHolds  - Static Holds (Planche, Front Lever, etc.)
4. core         - Core & Conditioning
5. endurance    - Muscular Endurance
6. mobility     - Joint Mobility
```
**Estado:** ✅ Los ejes están bien definidos y alineados con RUTINAS_POR_NIVEL.

---

### **Niveles (4 levels)** ⚠️ PROBLEMA
```typescript
BEGINNER:     0 - 48,000 XP (~6 meses)
INTERMEDIATE: 48,000 - 144,000 XP (~1 año)
ADVANCED:     144,000 - 384,000 XP (~2 años)
ELITE:        384,000+ XP (~3+ años)
```

**PROBLEMA:** Solo 4 niveles, pero ahora tenemos:
- **15 sublevels** (D-, D, D+, C-, C, C+, B-, B, B+, A-, A, A+, S-, S, S+)
- **5 categorías principales** (D, C, B, A, S)

**Mapeo actual (INCONSISTENTE):**
```
BEGINNER     → D (1 sublevel)
INTERMEDIATE → C (1 sublevel)
ADVANCED     → B (1 sublevel)
ELITE        → A + S (2 sublevels)
```

**Mapeo esperado (CONSISTENTE):**
```
BEGINNER     → D-, D, D+     (3 sublevels)
INTERMEDIATE → C-, C, C+     (3 sublevels)
ADVANCED     → B-, B, B+     (3 sublevels)
ELITE        → A-, A, A+, S-, S, S+ (6 sublevels)
```

---

### **Sistema de XP** ⚠️ PROBLEMA

**Umbrales fijos:**
```typescript
BEGINNER:     0 - 48,000 XP
INTERMEDIATE: 48,000 - 144,000 XP (diferencia: 96,000)
ADVANCED:     144,000 - 384,000 XP (diferencia: 240,000)
ELITE:        384,000+ XP (infinito)
```

**PROBLEMA:** Los saltos de XP son enormes y no reflejan la progresión gradual de 15 sublevels.

**Propuesta mejorada:**
```typescript
// Cada sublevel = ~32,000 XP (progresión más suave)
D-:  0 - 32,000 XP
D:   32,000 - 64,000 XP
D+:  64,000 - 96,000 XP
C-:  96,000 - 128,000 XP
C:   128,000 - 160,000 XP
C+:  160,000 - 192,000 XP
B-:  192,000 - 224,000 XP
B:   224,000 - 256,000 XP
B+:  256,000 - 288,000 XP
A-:  288,000 - 320,000 XP
A:   320,000 - 352,000 XP
A+:  352,000 - 384,000 XP
S-:  384,000 - 416,000 XP
S:   416,000 - 448,000 XP
S+:  448,000+ XP
```

---

## 🔗 Comparación con Otros Sistemas

### 1. **Sublevel System (sublevel-system.ts)** ❌ NO CONECTADO

**Sublevel system determina nivel basándose en:**
```typescript
- pullUpsMax (0 - 70+)
- dipsMax (0 - 80+)
- weightedPullUps (0 - 41.25kg+)
- weightedDips (0 - 37.5kg+)
```

**Hexágono determina nivel basándose en:**
```typescript
- strengthXP (0 - 700,000+)
```

**PROBLEMA:**
- Sublevel usa **métricas concretas** (pull-ups, kg)
- Hexágono usa **XP abstracto**
- **NO están sincronizados**

**Ejemplo de desconexión:**
```
Usuario puede hacer:
- 30 pull-ups → Sublevel B+
- Pero hexagon strengthXP = 50,000 → INTERMEDIATE (equivale a C)

INCONSISTENCIA: ¿Es B+ o C?
```

---

### 2. **Progression Tracker (progression-tracker.ts)** ❌ NO CONECTADO

**Progression Tracker tiene requirements específicos:**
```typescript
D_MINUS: { pullUps: 0, dips: 0 }
D:       { pullUps: 1, dips: 5 }
D_PLUS:  { pullUps: 4, dips: 10 }
C_MINUS: { pullUps: 8, dips: 15 }
C:       { pullUps: 11, dips: 20 }
// ... hasta S_PLUS
```

**Hexágono NO usa estos requirements.**

**PROBLEMA:** El hexágono no sabe cuándo el usuario está listo para subir de sublevel.

---

### 3. **Weekly Progression (weekly-progression.ts)** ⚠️ PARCIALMENTE CONECTADO

**Weekly Progression ajusta:**
```typescript
Week 1: 100% intensity, 100% volume
Week 2: 105% intensity, 100% volume
Week 3: 110% intensity, 100% volume
Week 4: 70% intensity, 60% volume (deload)
```

**Hexágono NO refleja:**
- Progresión semanal dentro del nivel
- Ciclos de mesocycle
- Deload weeks

**PROPUESTA:** Añadir campo `weeklyProgressMultiplier` al hexágono.

---

### 4. **Routine Generator V3 (routine-generator-v3.ts)** ⚠️ USA HEXÁGONO INCORRECTAMENTE

**V3 usa:**
```typescript
- pullUpsMax, dipsMax → Determina STAGE (1-2, 3, 4)
- Hexagon levels → Selecciona ejercicios
```

**PROBLEMA:** V3 ignora sublevels y usa sus propios STAGES:
```
STAGE_1_2: 0-11 pull-ups
STAGE_3:   12+ pull-ups AND 15+ dips
STAGE_4:   weighted work
```

**Mapeo actual (INCONSISTENTE):**
```
Hexagon INTERMEDIATE → ¿Qué STAGE es?
```

---

## 🚨 Problemas Críticos Identificados

### **PROBLEMA 1: Múltiples "Fuentes de Verdad"** ❌ CRÍTICO

Actualmente tenemos **3 sistemas paralelos** que determinan el nivel del usuario:

1. **Hexagon System:** 4 niveles (BEGINNER → ELITE) basados en XP
2. **Sublevel System:** 15 sublevels (D- → S+) basados en métricas concretas
3. **V3 STAGES:** 3 stages (1-2, 3, 4) basados en pull-ups/dips

**Resultado:** Inconsistencias donde un usuario puede ser:
- INTERMEDIATE en hexágono
- B- en sublevel
- STAGE_3 en V3

**¿Cuál es el correcto?** 🤷

---

### **PROBLEMA 2: Hexágono NO refleja granularidad de 15 sublevels** ⚠️ IMPORTANTE

**Visual actual (4 segmentos):**
```
[BEGINNER] [INTERMEDIATE] [ADVANCED] [ELITE]
   0-2.5      2.5-5.0        5.0-7.5    7.5-10
```

**Visual necesario (15 segmentos):**
```
[D-][D][D+][C-][C][C+][B-][B][B+][A-][A][A+][S-][S][S+]
```

**Escala visual 0-10 con 15 sublevels:**
```
0.0-0.67  → D-
0.67-1.33 → D
1.33-2.0  → D+
2.0-2.67  → C-
2.67-3.33 → C
3.33-4.0  → C+
4.0-4.67  → B-
4.67-5.33 → B
5.33-6.0  → B+
6.0-6.67  → A-
6.67-7.33 → A
7.33-8.0  → A+
8.0-8.67  → S-
8.67-9.33 → S
9.33-10.0 → S+
```

---

### **PROBLEMA 3: XP calculation NO usa métricas concretas** ⚠️ IMPORTANTE

**Sistema actual de XP:**
```typescript
// En exercise-rewards.ts
baseXP = difficulty === 'ELITE' ? 500 : 300
// + bonuses
```

**Sistema esperado:**
```typescript
// Basado en performance real
if (exercise === 'Pull-ups' && reps === 30) {
  // 30 pull-ups → B+
  strengthXP = calculateXPForSubLevel('B_PLUS');
}
```

**PROBLEMA:** El XP se otorga por completar ejercicios, **NO** por performance real.

---

## ✅ Propuesta de Solución

### **FASE 1: Unificar Sistemas (CRÍTICO)**

#### 1.1. **Establecer Sublevel como "Fuente de Verdad"**

```typescript
// unified-hexagon-system.ts

export type DetailedSubLevel =
  | 'D_MINUS' | 'D' | 'D_PLUS'
  | 'C_MINUS' | 'C' | 'C_PLUS'
  | 'B_MINUS' | 'B' | 'B_PLUS'
  | 'A_MINUS' | 'A' | 'A_PLUS'
  | 'S_MINUS' | 'S' | 'S_PLUS';

export function mapSubLevelToXPRange(sublevel: DetailedSubLevel): { min: number; max: number } {
  const ranges: Record<DetailedSubLevel, { min: number; max: number }> = {
    D_MINUS: { min: 0, max: 32000 },
    D:       { min: 32000, max: 64000 },
    D_PLUS:  { min: 64000, max: 96000 },
    C_MINUS: { min: 96000, max: 128000 },
    C:       { min: 128000, max: 160000 },
    C_PLUS:  { min: 160000, max: 192000 },
    B_MINUS: { min: 192000, max: 224000 },
    B:       { min: 224000, max: 256000 },
    B_PLUS:  { min: 256000, max: 288000 },
    A_MINUS: { min: 288000, max: 320000 },
    A:       { min: 320000, max: 352000 },
    A_PLUS:  { min: 352000, max: 384000 },
    S_MINUS: { min: 384000, max: 416000 },
    S:       { min: 416000, max: 448000 },
    S_PLUS:  { min: 448000, max: Infinity },
  };
  return ranges[sublevel];
}

export function getSubLevelFromXP(xp: number): DetailedSubLevel {
  if (xp < 32000) return 'D_MINUS';
  if (xp < 64000) return 'D';
  if (xp < 96000) return 'D_PLUS';
  if (xp < 128000) return 'C_MINUS';
  if (xp < 160000) return 'C';
  if (xp < 192000) return 'C_PLUS';
  if (xp < 224000) return 'B_MINUS';
  if (xp < 256000) return 'B';
  if (xp < 288000) return 'B_PLUS';
  if (xp < 320000) return 'A_MINUS';
  if (xp < 352000) return 'A';
  if (xp < 384000) return 'A_PLUS';
  if (xp < 416000) return 'S_MINUS';
  if (xp < 448000) return 'S';
  return 'S_PLUS';
}
```

#### 1.2. **Sincronizar Hexagon Strength con Sublevel System**

```typescript
// Al actualizar strengthXP, sincronizar con sublevel
export function updateStrengthXPFromMetrics(
  profile: UnifiedHexagonProfile,
  pullUpsMax: number,
  dipsMax: number,
  weightedPullUps: number
): UnifiedHexagonProfile {
  // Determinar sublevel basándose en métricas (sublevel-system.ts)
  const sublevel = determineSubLevel({
    pullUpsMax,
    dipsMax,
    bodyWeight: 75, // default
    weightedPullUps,
  });

  // Mapear sublevel a XP
  const xpRange = mapSubLevelToXPRange(sublevel);
  const targetXP = (xpRange.min + xpRange.max) / 2; // Punto medio del rango

  // Actualizar hexágono con XP correspondiente
  const newLevel = getSubLevelFromXP(targetXP);
  const newVisualValue = getVisualValueFromSubLevel(newLevel);

  return {
    ...profile,
    strength: newVisualValue,
    strengthXP: targetXP,
    strengthLevel: mapSubLevelToUnifiedLevel(sublevel),
  };
}
```

---

### **FASE 2: Actualizar Visual Scale (IMPORTANTE)**

#### 2.1. **Escala Visual de 15 segmentos**

```typescript
export function getVisualValueFromSubLevel(sublevel: DetailedSubLevel): number {
  const mapping: Record<DetailedSubLevel, number> = {
    D_MINUS: 0.33,
    D:       1.0,
    D_PLUS:  1.67,
    C_MINUS: 2.33,
    C:       3.0,
    C_PLUS:  3.67,
    B_MINUS: 4.33,
    B:       5.0,
    B_PLUS:  5.67,
    A_MINUS: 6.33,
    A:       7.0,
    A_PLUS:  7.67,
    S_MINUS: 8.33,
    S:       9.0,
    S_PLUS:  9.67,
  };
  return mapping[sublevel];
}
```

#### 2.2. **Actualizar componente UnifiedHexagon.tsx**

```tsx
// Mostrar sublevel en vez de solo nivel
<div className="text-center">
  <div className="text-2xl font-bold">{getSubLevelLabel(sublevel)}</div>
  <div className="text-sm text-gray-500">{mapSubLevelToUnifiedLevel(sublevel)}</div>
</div>

// Ejemplo:
// B+
// ADVANCED
```

---

### **FASE 3: Conectar con Progression Tracker (IMPORTANTE)**

#### 3.1. **Usar requirements de progression-tracker**

```typescript
// Al calcular readiness, sincronizar con hexágono
export function checkProgressionReadiness(
  userMetrics: UserMetrics,
  currentSubLevel: SubLevel,
  weeksAtCurrentLevel: number
): ProgressionReadiness {
  // ... lógica existente ...

  // 🆕 NUEVO: Actualizar hexágono si está listo
  if (ready) {
    const nextSubLevel = getNextSubLevel(currentSubLevel);
    if (nextSubLevel) {
      // Trigger hexagon update to next sublevel
      const newXPRange = mapSubLevelToXPRange(nextSubLevel);
      const targetXP = (newXPRange.min + newXPRange.max) / 2;

      // Actualizar en DB
      await updateHexagonStrengthXP(userId, targetXP);
    }
  }

  return { ready, currentSubLevel, nextSubLevel, ... };
}
```

---

### **FASE 4: Integrar Weekly Progression (OPCIONAL)**

#### 4.1. **Añadir multiplicador semanal al hexágono**

```typescript
export interface ExtendedHexagonProfile extends UnifiedHexagonProfile {
  // Nuevos campos para tracking de mesocycles
  currentWeek: number;
  weeklyProgressionMultiplier: number; // 0.7 (deload) - 1.1 (peak)
  lastDeloadWeek: number;
}

export function applyWeeklyProgressionToHexagon(
  profile: ExtendedHexagonProfile,
  weekNumber: number
): ExtendedHexagonProfile {
  const progression = getWeeklyProgression(profile.strengthLevel, weekNumber);

  return {
    ...profile,
    currentWeek: weekNumber,
    weeklyProgressionMultiplier: progression.adjustments.intensity,
  };
}
```

---

## 📊 Impacto de las Mejoras

### **SIN mejoras (estado actual):**
- ❌ 3 sistemas paralelos sin conexión
- ❌ Hexágono con 4 niveles genéricos
- ❌ No refleja progresión de 15 sublevels
- ❌ XP no basado en performance real
- ⚠️ Usuario confundido: "¿Soy INTERMEDIATE o B-?"

### **CON mejoras:**
- ✅ 1 sistema unificado (Sublevel = fuente de verdad)
- ✅ Hexágono con 15 segmentos granulares
- ✅ XP sincronizado con métricas concretas
- ✅ Progresión clara y consistente
- ✅ Usuario sabe exactamente dónde está: "Soy B- (ADVANCED)"

---

## 🎯 Plan de Implementación Recomendado

### **Prioridad CRÍTICA (implementar YA):**
1. ✅ Mapear 15 sublevels a XP ranges
2. ✅ Sincronizar strengthXP con determineSubLevel()
3. ✅ Actualizar visual scale 0-10 con 15 segmentos

### **Prioridad ALTA (implementar esta semana):**
4. ✅ Conectar progression-tracker con hexagon updates
5. ✅ Actualizar UI para mostrar sublevel + unified level

### **Prioridad MEDIA (implementar cuando sea posible):**
6. ⏳ Integrar weekly progression multipliers
7. ⏳ Añadir mesocycle tracking al hexágono

---

## 📁 Archivos a Modificar

1. **`apps/web/src/lib/unified-hexagon-system.ts`**
   - Añadir `DetailedSubLevel` type
   - Añadir `mapSubLevelToXPRange()`
   - Añadir `getSubLevelFromXP()`
   - Añadir `updateStrengthXPFromMetrics()`

2. **`apps/web/src/lib/sublevel-system.ts`**
   - Exportar `determineSubLevel` para uso en hexágono
   - Añadir función `syncSubLevelWithHexagon()`

3. **`apps/web/src/lib/progression-tracker.ts`**
   - Añadir hook para actualizar hexágono cuando `ready === true`

4. **`apps/web/src/components/UnifiedHexagon.tsx`**
   - Mostrar sublevel label (ej: "B+")
   - Mostrar unified level debajo (ej: "ADVANCED")
   - Actualizar escala visual a 15 segmentos

5. **`apps/web/src/app/api/training/complete-workout/route.ts`**
   - Al completar workout, sincronizar métricas → sublevel → hexagon XP

---

## 🔗 Conclusión

El hexágono actual está **funcional** pero **desconectado** de los nuevos sistemas granulares (15 sublevels, V3, RUTINAS_POR_NIVEL).

**Recomendación:** Implementar **FASE 1** (unificación) de inmediato para evitar confusión del usuario y aprovechar la granularidad de los 15 sublevels que ya tenemos implementados.

**Esfuerzo estimado:**
- Fase 1: 4-6 horas
- Fase 2: 2-3 horas
- Fase 3: 3-4 horas
- **Total: ~10-13 horas**

**Beneficio:** Sistema completamente unificado y consistente donde el usuario tiene **una sola fuente de verdad** para su nivel.
