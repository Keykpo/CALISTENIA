# 📊 ANÁLISIS DEL ASSESSMENT - Mejoras para V3 + RUTINAS_POR_NIVEL

## 🎯 Resumen Ejecutivo

El assessment actual (4 pasos) es **muy completo** pero le faltan **preguntas críticas** para aprovechar al máximo los sistemas de rutinas V3 + RUTINAS_POR_NIVEL que implementamos (sublevel system, weekly progression, training splits).

**Problemas principales:**
1. ❌ No pregunta **días disponibles** para entrenar → No podemos asignar training split automáticamente
2. ❌ No pregunta **experiencia de entrenamiento** → Difícil determinar sublevel preciso
3. ⚠️ Rangos de pull-ups/dips **poco granulares** → No diferencia entre D-, D, y D+ con precisión
4. ⚠️ No pregunta sobre **lesiones/limitaciones** → No podemos personalizar warmups

---

## 📋 Assessment Actual - Desglose Completo

### **STEP 1: Demographics & Goals** ✅ BIEN
- Age, height, weight, gender
- Goals (hasta 3): strength, skills, muscle, fat_loss, endurance, mobility, compete

**¿Qué usa V3?**
- ✅ Body weight → Cálculo de % BW para weighted work
- ✅ Goals → Inferencia automática de training goal (ya lo simplificamos)

**¿Qué falta?**
- ❌ **Training frequency:** ¿Cuántos días/semana puedes entrenar? (3/4/5/6/7)
- ❌ **Training experience:** ¿Cuánto tiempo llevas entrenando?
- ⚠️ **Session duration:** ¿Cuánto tiempo tienes por sesión? (ya lo preguntamos en goals dialog)

---

### **STEP 2: Equipment** ✅ BIEN
- Floor, pull-up bar, rings, parallel bars, resistance bands

**¿Qué usa V3?**
- ✅ Equipment → Selección de ejercicios según disponibilidad

**¿Qué falta?**
- Nada crítico. Está perfecto.

---

### **STEP 3: Fundamental Tests** ⚠️ MEJORAR GRANULARIDAD

#### Push Tests
- Push-ups: `0 / 1-5 / 6-10 / 11-20 / 21-30 / 31+`
- Dips: `0 / 1-3 / 4-8 / 9-15 / 16+`

#### Pull Tests
- Pull-ups: `0 / 1-3 / 4-8 / 9-15 / 16-25 / 26+`
- Dead hang: `0 / 1-15s / 16-30s / 31-60s / 60s+`

#### Core Tests
- Plank: `0-15s / 16-30s / 31-60s / 61-90s / 91s+`
- Hollow body: `0 / <10s / 10-20s / 20-30s / 30s+`
- L-sit attempt: `no / tuck / one_leg / full` 🆕

#### Legs Tests
- Squats: `0-10 / 11-20 / 21-40 / 41-60 / 61+`
- Pistol: `no / assisted / 1-3 / 4-8 / 9+`

#### Mobility Tests 🆕
- Shoulder mobility: `poor / average / good / excellent`
- Bridge: `no / partial / full`

#### Endurance Tests 🆕
- Max push-ups in 60s: `número exacto`
- Circuit endurance: `cannot_complete / long_breaks / short_breaks / no_breaks`

**¿Qué usa V3/RUTINAS_POR_NIVEL?**
- ✅ Pull-ups max → **CRÍTICO** para determinar sublevel
- ✅ Dips max → **CRÍTICO** para determinar sublevel
- ✅ Push-ups max → Usado en assessment
- ✅ Plank/Core → Determina si va a Step 4
- ⚠️ Dead hang, squats, mobility, endurance → Usado para hexagon XP pero no para sublevels

**¿Qué falta?**
- ❌ **Más granularidad en pull-ups:**
  - Actual: `0 / 1-3 / 4-8 / 9-15 / 16-25 / 26+` (6 rangos)
  - **Necesario:** `0 / 1 / 2-3 / 4-7 / 8-10 / 11-14 / 15-19 / 20-24 / 25-29 / 30-34 / 35-39 / 40+` (12 rangos)
  - **Razón:** Para diferenciar D-, D, D+, C-, C, C+, etc.

- ❌ **Más granularidad en dips:**
  - Actual: `0 / 1-3 / 4-8 / 9-15 / 16+` (5 rangos)
  - **Necesario:** `0 / 1-4 / 5-9 / 10-14 / 15-19 / 20-24 / 25-29 / 30+` (8 rangos)

- ⚠️ **Ejercicios de progresión intermedia:**
  - Scapular pulls (para quienes no pueden hacer pull-ups)
  - Australian rows / Ring rows
  - Negative pull-ups
  - Pike push-ups (progresión a HSPU)

---

### **STEP 4: Advanced Skills** ✅ MUY COMPLETO (condicional si pullUps≥5 && pushUps≥10 && plank≥30s)

#### Balance Skills
- Handstand: `no / wall_5-15s / wall_15-60s / freestanding_5-15s / freestanding_15s+`
- HSPU: `no / partial_wall / full_wall_1-5 / full_wall_6+ / freestanding`
- Crow Pose: `no / <10s / 10-30s / 30s+` 🆕

#### Static Holds
- Front Lever: `no / tuck_5-10s / adv_tuck / straddle / one_leg / full`
- Back Lever: `no / tuck / adv_tuck / straddle / full` 🆕
- Planche: `no / frog_tuck / adv_tuck / straddle / full`
- L-Sit: `no / tuck / bent_legs / full_10-20s / full_20s+`
- Ring Support: `no / shaky / stable_30s / stable_60s+_RTO` 🆕

#### Advanced Dynamics
- Muscle-up: `no / kipping / strict_1-3 / strict_4+`
- Archer Pull-up: `no / assisted / full_3-5 / full_6+`
- One-Arm Pull-up: `no / band_assisted / 1_rep / 2+_reps`
- Weighted Pull-ups: `no / +10-20lbs / +25-40lbs / +45lbs+` 🆕
- Weighted Dips: `no / +10-20lbs / +25-40lbs / +45lbs+` 🆕

#### Misc Advanced
- Human Flag: `no / tuck / adv_tuck / straddle / full` 🆕
- Ab Wheel: `no / knees_partial / knees_full / standing` 🆕

**¿Qué usa V3/RUTINAS_POR_NIVEL?**
- ✅ **Weighted Pull-ups/Dips** → **MUY IMPORTANTE** para determinar B+, A, S levels
  - B-: 7.5kg (~10% BW)
  - B: 15kg (~20% BW)
  - B+: 18.75kg (~25% BW)
  - A-: 22.5kg (~30% BW)
  - S+: 41.25kg (~55% BW)

- ✅ Handstand, Front Lever, Planche, etc. → Usado para FIG skill branches

**¿Qué falta?**
- Nada crítico. Step 4 es **excelente**.

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **NO PREGUNTA TRAINING FREQUENCY** ❌ CRÍTICO
```typescript
// RUTINAS_POR_NIVEL usa 4 training splits:
export const TRAINING_SPLITS = {
  '3_DAY': { daysPerWeek: 3, bestFor: ['D_MINUS', 'D', 'D_PLUS'] },
  '4_DAY': { daysPerWeek: 4, bestFor: ['C_MINUS', 'C', 'C_PLUS'] },
  '5_DAY': { daysPerWeek: 5, bestFor: ['B_MINUS', 'B', 'B_PLUS'] },
  '6_DAY': { daysPerWeek: 6, bestFor: ['A_MINUS', 'A', 'A_PLUS', 'S'] },
};
```

**Sin esta pregunta:** No podemos asignar automáticamente el split correcto.

**Solución:** Añadir en Step 1:
```
"¿Cuántos días por semana puedes entrenar?"
○ 3 días (lun/mié/vie)
○ 4 días (lun/mar/jue/vie)
○ 5 días (lun-vie)
○ 6 días (lun-sáb)
○ 7 días (todos los días)
```

---

### 2. **NO PREGUNTA TRAINING EXPERIENCE** ❌ CRÍTICO

```typescript
// Los sublevels tienen estimaciones de training age:
D_MINUS → "0-1 mes"
D → "1-3 meses"
D_PLUS → "3-6 meses"
C_MINUS → "6-9 meses"
// ...
S_PLUS → "5+ años"
```

**Problema:** Un principiante completo (0 pull-ups) va a D-, pero alguien con 0 pull-ups que entrena hace 2 años (tal vez viene de otro deporte) NO debería ir a D-.

**Solución:** Añadir en Step 1:
```
"¿Cuánto tiempo llevas entrenando calistenia o fitness en general?"
○ Nunca he entrenado / 0-3 meses
○ 3-6 meses
○ 6-12 meses
○ 1-2 años
○ 2-3 años
○ 3-5 años
○ 5+ años
```

**Uso:** Como **factor de ajuste** del sublevel calculado:
- Si entrenas 0-3 meses → sublevel calculado OK
- Si entrenas 1-2 años pero tienes métricas de D → probablemente D+ o C- (mejor técnica/consistencia)

---

### 3. **RANGOS DE PULL-UPS/DIPS POCO GRANULARES** ⚠️ IMPORTANTE

**Pull-ups actual:**
```
0 / 1-3 / 4-8 / 9-15 / 16-25 / 26+
```

**Sublevels necesitan:**
```
D_MINUS → 0 pull-ups
D → 1 pull-up
D_PLUS → 4 pull-ups
C_MINUS → 8 pull-ups
C → 11 pull-ups
C_PLUS → 15 pull-ups
B_MINUS → 20 pull-ups
B → 25 pull-ups
B_PLUS → 30 pull-ups
A_MINUS → 35 pull-ups
A → 40 pull-ups
A_PLUS → 45 pull-ups
S_MINUS → 50 pull-ups
S → 60 pull-ups
S_PLUS → 70 pull-ups
```

**Problema con rangos actuales:**
- `1-3` abarca D y D+ (no diferencia)
- `4-8` abarca D+ y C- (no diferencia)
- `9-15` abarca C-, C, C+ (no diferencia)

**Solución:** Cambiar a rangos más específicos:
```
○ 0 (no puedo hacer ninguno)
○ 1-3
○ 4-7
○ 8-10
○ 11-14
○ 15-19
○ 20-24
○ 25-29
○ 30-34
○ 35-39
○ 40-44
○ 45-49
○ 50-59
○ 60-69
○ 70+
```

**Lo mismo para dips:**
```
○ 0 (no puedo hacer ninguno)
○ 1-4
○ 5-9
○ 10-14
○ 15-19
○ 20-24
○ 25-29
○ 30-34
○ 35+
```

---

### 4. **NO PREGUNTA SOBRE LESIONES/LIMITACIONES** ⚠️ IMPORTANTE

**Warmup/Cooldown protocols necesitan saber:**
```typescript
export const WARMUP_PROTOCOLS = {
  BEGINNER: {
    mobilityFocus: ['wrists', 'shoulders', 'hips'],
    // ...
  }
};
```

**Sin esta info:** No podemos personalizar warmups para prevenir lesiones.

**Solución:** Añadir en Step 1:
```
"¿Tienes alguna lesión actual o zona problemática?"
□ Sin lesiones ni limitaciones
□ Muñecas (dolor/molestia)
□ Codos (dolor/molestia)
□ Hombros (dolor/molestia)
□ Espalda baja (dolor/molestia)
□ Rodillas (dolor/molestia)
□ Otra (especificar)
```

---

## ✅ PROPUESTA DE MEJORAS PRIORIZADAS

### 🔴 CRÍTICAS (implementar YA):

#### 1. **Añadir Training Frequency en Step 1**
```tsx
// Después de goals, antes de continuar a Step 2
<div className="space-y-2">
  <Label>How many days per week can you train? *</Label>
  <RadioGroup value={step1Data.trainingFrequency} ...>
    {[
      { value: 3, label: '3 days (Mon/Wed/Fri)', description: 'Good for beginners or busy schedules' },
      { value: 4, label: '4 days (Mon/Tue/Thu/Fri)', description: 'Balanced routine' },
      { value: 5, label: '5 days (Mon-Fri)', description: 'Intermediate commitment' },
      { value: 6, label: '6 days (Mon-Sat)', description: 'Advanced training' },
      { value: 7, label: '7 days (every day)', description: 'Elite athletes only' },
    ]}
  </RadioGroup>
</div>
```

**Guardar en DB:**
```typescript
preferredSplit: '3_DAY' | '4_DAY' | '5_DAY' | '6_DAY' // Ya existe en schema
```

---

#### 2. **Añadir Training Experience en Step 1**
```tsx
<div className="space-y-2">
  <Label>How long have you been training calisthenics/fitness? *</Label>
  <RadioGroup value={step1Data.trainingExperience} ...>
    {[
      { value: '0-3months', label: 'Complete beginner (0-3 months)' },
      { value: '3-6months', label: 'Novice (3-6 months)' },
      { value: '6-12months', label: 'Beginner (6-12 months)' },
      { value: '1-2years', label: 'Intermediate (1-2 years)' },
      { value: '2-3years', label: 'Advanced (2-3 years)' },
      { value: '3-5years', label: 'Very Advanced (3-5 years)' },
      { value: '5+years', label: 'Elite (5+ years)' },
    ]}
  </RadioGroup>
</div>
```

**Usar para ajuste:**
```typescript
// En assessment-d-s-logic.ts
export function determineSubLevelWithExperience(
  baseSubLevel: SubLevel,
  trainingExperience: string
): SubLevel {
  const experienceMonths = parseExperienceToMonths(trainingExperience);

  // Si tienes experiencia pero métricas bajas → probablemente técnica/consistency issue
  if (experienceMonths >= 12 && baseSubLevel.startsWith('D')) {
    // Upgrade D → D+ o C-
    return getNextSubLevel(baseSubLevel) || baseSubLevel;
  }

  return baseSubLevel;
}
```

---

#### 3. **Mejorar Granularidad de Pull-ups/Dips en Step 3**

**Pull-ups actual:**
```tsx
// ANTES (6 opciones)
{ label: '0 (Cannot do any)', value: 0 },
{ label: '1-5', value: 3 },
{ label: '6-10', value: 8 },
{ label: '11-20', value: 15 },
{ label: '21-30', value: 25 },
{ label: '31+', value: 35 },
```

**Pull-ups propuesto:**
```tsx
// DESPUÉS (15 opciones)
{ label: '0 (Cannot do any)', value: 0 },
{ label: '1-3', value: 2 },
{ label: '4-7', value: 5 },
{ label: '8-10', value: 9 },
{ label: '11-14', value: 12 },
{ label: '15-19', value: 17 },
{ label: '20-24', value: 22 },
{ label: '25-29', value: 27 },
{ label: '30-34', value: 32 },
{ label: '35-39', value: 37 },
{ label: '40-44', value: 42 },
{ label: '45-49', value: 47 },
{ label: '50-59', value: 54 },
{ label: '60-69', value: 64 },
{ label: '70+', value: 75 },
```

**Dips propuesto:**
```tsx
{ label: '0 (Cannot do any)', value: 0 },
{ label: '1-4', value: 2 },
{ label: '5-9', value: 7 },
{ label: '10-14', value: 12 },
{ label: '15-19', value: 17 },
{ label: '20-24', value: 22 },
{ label: '25-29', value: 27 },
{ label: '30+', value: 33 },
```

---

### 🟡 IMPORTANTES (implementar pronto):

#### 4. **Añadir Injuries/Limitations en Step 1**
```tsx
<div className="space-y-3">
  <Label>Do you have any current injuries or problem areas?</Label>
  <p className="text-xs text-slate-500">
    This helps us personalize your warm-up and avoid aggravating injuries
  </p>

  <div className="space-y-2">
    {[
      { key: 'none', label: '✅ No injuries or limitations' },
      { key: 'wrists', label: '🤕 Wrists (pain/discomfort)' },
      { key: 'elbows', label: '🤕 Elbows (pain/discomfort)' },
      { key: 'shoulders', label: '🤕 Shoulders (pain/discomfort)' },
      { key: 'lowerBack', label: '🤕 Lower back (pain/discomfort)' },
      { key: 'knees', label: '🤕 Knees (pain/discomfort)' },
    ].map(item => (
      <div key={item.key} className="flex items-center space-x-3">
        <Checkbox
          checked={step1Data.injuries?.includes(item.key)}
          onCheckedChange={(checked) => {
            // Handle injury selection
          }}
        />
        <Label>{item.label}</Label>
      </div>
    ))}
  </div>
</div>
```

**Guardar en DB:**
```typescript
injuries: string; // JSON array: ['wrists', 'shoulders', ...]
```

---

#### 5. **Añadir Ejercicios de Progresión en Step 3**

Para usuarios con 0 pull-ups, preguntar:
```tsx
{step3Data.pullUps === 0 && (
  <div className="space-y-2 mt-4 p-4 bg-blue-50 rounded-lg">
    <Label>Can you do any of these PULL-UP alternatives?</Label>
    <RadioGroup value={step3Data.pullUpAlternative}>
      <RadioGroupItem value="none" label="None of these" />
      <RadioGroupItem value="scapular_pulls" label="Scapular pulls (shoulder blade movement)" />
      <RadioGroupItem value="dead_hang_20s" label="Dead hang 20s+" />
      <RadioGroupItem value="australian_rows" label="Australian rows (low bar)" />
      <RadioGroupItem value="negative_pullups" label="Negative pull-ups (jump up, slow down)" />
    </RadioGroup>
  </div>
)}
```

---

### 🟢 OPCIONALES (nice to have):

#### 6. **Simplificar Step 4 con tabs**
Actualmente hay 15 preguntas en una lista larga. Agrupar por categorías:

```tsx
<Tabs>
  <TabsList>
    <TabsTrigger>Balance</TabsTrigger>
    <TabsTrigger>Static Holds</TabsTrigger>
    <TabsTrigger>Dynamics</TabsTrigger>
    <TabsTrigger>Weighted</TabsTrigger>
  </TabsList>

  <TabsContent value="balance">
    {/* Handstand, HSPU, Crow Pose */}
  </TabsContent>

  <TabsContent value="static">
    {/* Front Lever, Back Lever, Planche, L-Sit, Ring Support */}
  </TabsContent>

  // etc...
</Tabs>
```

---

#### 7. **Añadir visualización de nivel en tiempo real**
```tsx
// Mientras el usuario completa Step 3, mostrar estimación:
<Card className="bg-green-50">
  <CardContent className="p-4">
    <p className="text-sm font-medium text-green-800">
      Estimated Level: <Badge>C</Badge>
    </p>
    <p className="text-xs text-green-700 mt-1">
      Based on your current answers. Complete the assessment for final level.
    </p>
  </CardContent>
</Card>
```

---

## 📊 IMPACTO DE LAS MEJORAS

### Sin mejoras:
- ❌ No podemos asignar training split automáticamente
- ❌ Sublevel determinado solo por métricas (ignora experiencia)
- ⚠️ Baja precisión en niveles D, C, B (rangos muy amplios)
- ⚠️ Warmups genéricos (no personalizados a lesiones)

### Con mejoras:
- ✅ Training split asignado automáticamente (3/4/5/6 días)
- ✅ Sublevel considera experiencia + métricas → más preciso
- ✅ Diferenciación precisa entre D-, D, D+, etc.
- ✅ Warmups personalizados según lesiones del usuario
- ✅ Mejor experiencia de onboarding (usuarios entienden por qué les preguntamos)

---

## 🎯 PLAN DE IMPLEMENTACIÓN

### Fase 1 (CRÍTICA): Training Frequency + Experience
1. Modificar `AssessmentStep1Data` en `assessment-d-s-logic.ts`
2. Añadir campos en `FigOnboardingAssessment.tsx` Step 1
3. Guardar en DB (`preferredSplit`, `trainingExperience`)
4. Usar en `routine-generator-v3.ts` para auto-select split

**Tiempo estimado:** 2-3 horas

### Fase 2 (IMPORTANTE): Granularidad Pull-ups/Dips
1. Modificar rangos en `FigOnboardingAssessment.tsx` Step 3
2. Ajustar `calculateBaseLevelFromStep3()` para usar nuevos rangos
3. Actualizar `determineSubLevel()` en `sublevel-system.ts`

**Tiempo estimado:** 1-2 horas

### Fase 3 (IMPORTANTE): Injuries/Limitations
1. Añadir campos en Step 1
2. Guardar en DB
3. Usar en `warmup-protocols.ts` para personalizar warmups

**Tiempo estimado:** 2 horas

### Fase 4 (OPCIONAL): Ejercicios de progresión + UI improvements
1. Añadir preguntas condicionales en Step 3
2. Tabs en Step 4
3. Visualización en tiempo real

**Tiempo estimado:** 3-4 horas

---

## 🔗 ARCHIVOS A MODIFICAR

### Assessment Logic:
- `apps/web/src/lib/assessment-d-s-logic.ts` - Añadir training experience logic
- `apps/web/src/lib/sublevel-system.ts` - Integrar con experience

### Components:
- `apps/web/src/components/onboarding/FigOnboardingAssessment.tsx` - Añadir preguntas

### API:
- `apps/web/src/app/api/assessment/fig-initial/route.ts` - Guardar nuevos campos

### Database:
- `prisma/schema.prisma` - Añadir campos si necesario:
  ```prisma
  model User {
    // ...
    trainingExperience String? // "0-3months", "1-2years", etc.
    injuries String? // JSON array
    preferredSplit String? // Ya existe
    trainingSubLevel String? // Ya existe
  }
  ```

---

## 📝 CONCLUSIÓN

El assessment actual es **muy bueno** pero necesita estas 3 mejoras **críticas**:

1. ✅ Preguntar **training frequency** (días/semana)
2. ✅ Preguntar **training experience** (tiempo entrenando)
3. ✅ Mejorar **granularidad** de pull-ups/dips

Con estas mejoras, podremos aprovechar al 100% los sistemas V3 + RUTINAS_POR_NIVEL que implementamos.

**Recomendación:** Implementar Fase 1 (frequency + experience) **esta semana**. Es lo mínimo necesario para que el sistema funcione correctamente.
