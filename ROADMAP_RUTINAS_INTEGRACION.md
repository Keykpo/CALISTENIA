# 🗺️ ROADMAP: INTEGRACIÓN RUTINAS_POR_NIVEL + V3

**Fecha de Creación**: 2025-11-15
**Estado**: En Progreso
**Objetivo**: Integrar el contenido detallado de RUTINAS_POR_NIVEL con el motor automatizado de V3

---

## 📋 RESUMEN EJECUTIVO

### ¿Qué vamos a hacer?

Integrar lo mejor de ambos sistemas:
- ✅ **Motor V3**: Generación automática, skill gating, integración con assessment
- ✅ **RUTINAS_POR_NIVEL**: Calentamientos detallados, descripciones de forma, 15 subniveles

### ¿Por qué?

- V3 es excelente para automatización pero tiene calentamientos básicos
- RUTINAS_POR_NIVEL tiene contenido pedagógico excepcional pero es manual
- Juntos = Sistema de clase mundial 🏆

---

## 🎯 FASES DE IMPLEMENTACIÓN

### FASE 1: MEJORAS INMEDIATAS ⚡ (1-2 semanas)

**Prioridad**: 🔴 CRÍTICO
**Duración Estimada**: 1-2 semanas
**Impacto**: Alto - Prevención de lesiones y mejor experiencia

#### 1.1 Implementar Calentamientos Detallados

**Archivos a Crear**:
- `apps/web/src/lib/warmup-protocols.ts` - Protocolos de calentamiento
- `apps/web/src/types/warmup.ts` - Tipos TypeScript
- `apps/web/src/components/warmup/WarmupProtocolDisplay.tsx` - UI para mostrar calentamientos

**Contenido de `warmup-protocols.ts`**:
```typescript
export const WRIST_WARMUP_PROTOCOL = {
  id: 'wrist-warmup',
  name: 'Calentamiento de Muñecas',
  duration: 7, // minutos
  mandatory: ['PUSH', 'HANDSTAND', 'PLANCHE'], // Tipos de sesión donde es obligatorio
  exercises: [
    {
      name: 'Círculos de Muñeca',
      duration: 30, // segundos cada dirección
      instructions: [
        'Manos entrelazadas',
        'Círculos amplios, lentos',
        'Ambas direcciones (horario y antihorario)'
      ]
    },
    {
      name: 'Inclinaciones de Palma (Palm Rocks)',
      reps: 15-20,
      instructions: [
        'Manos en el suelo, palmas hacia abajo',
        'Dedos hacia atrás (hacia ti)',
        'Inclinar peso hacia atrás, sentir estiramiento',
        'Mantener 2 segundos, soltar'
      ]
    },
    // ... 5 ejercicios más del protocolo
  ]
};

export const SHOULDER_WARMUP_PROTOCOL = {
  id: 'shoulder-warmup',
  name: 'Calentamiento de Hombros',
  duration: 8, // minutos
  mandatory: ['ALL'], // Obligatorio para todas las sesiones
  exercises: [
    // 10 ejercicios del protocolo
  ]
};

export const SCAPULAR_ACTIVATION_PROTOCOL = {
  id: 'scapular-activation',
  name: 'Activación Escapular',
  duration: 5,
  mandatory: ['PULL', 'PUSH'],
  exercises: [
    // 3 ejercicios del protocolo
  ]
};

// Función para determinar qué protocolos usar según el tipo de sesión
export function getRequiredWarmupProtocols(
  sessionType: SessionType,
  stage: TrainingStage
): WarmupProtocol[] {
  const protocols: WarmupProtocol[] = [];

  // Siempre incluir calentamiento de hombros
  protocols.push(SHOULDER_WARMUP_PROTOCOL);

  // Si es sesión de PUSH, incluir muñecas
  if (sessionType === 'PUSH' || sessionType === 'FULL_BODY') {
    protocols.push(WRIST_WARMUP_PROTOCOL);
  }

  // Si es PULL o PUSH, incluir activación escapular
  if (sessionType === 'PULL' || sessionType === 'PUSH') {
    protocols.push(SCAPULAR_ACTIVATION_PROTOCOL);
  }

  // Para stages avanzados, incluir protocolos específicos
  if (stage === 'STAGE_4') {
    // Protocolos específicos de habilidades
  }

  return protocols;
}
```

**Integración en V3**:
```typescript
// En apps/web/src/lib/routine-generator-v3.ts

import { getRequiredWarmupProtocols } from './warmup-protocols';

export function generateRoutineV3(userProfile: UserProfile): Routine {
  // ... código existente ...

  // Determinar tipo de sesión
  const sessionType = determineSessionType(phase);

  // Obtener protocolos de calentamiento
  const warmupProtocols = getRequiredWarmupProtocols(
    sessionType,
    userProfile.trainingStage
  );

  // Incluir en la rutina
  return {
    warmup: warmupProtocols,
    skillWork: skillPhase,
    supportWork: supportPhase,
    strengthWork: strengthPhase,
    cooldown: getCooldownProtocol(sessionType)
  };
}
```

**Criterio de Éxito**:
- ✅ Todas las rutinas generadas incluyen calentamientos detallados
- ✅ Calentamientos son específicos al tipo de sesión
- ✅ UI muestra instrucciones claras de cada ejercicio
- ✅ Duración total de calentamiento: 10-20 min según nivel

---

#### 1.2 Crear Base de Datos de Ejercicios Detallados

**Archivos a Crear**:
- `apps/web/src/data/exercise-database.json` - Base de datos completa
- `apps/web/src/lib/exercise-library.ts` - Librería para acceder a ejercicios
- `apps/web/src/components/exercise/ExerciseDetailCard.tsx` - UI para mostrar detalles

**Estructura de `exercise-database.json`**:
```json
{
  "exercises": [
    {
      "id": "incline-push-ups",
      "name": "Incline Push-ups",
      "category": "PUSH",
      "level": "BEGINNER",
      "targetMuscles": ["Chest", "Triceps", "Anterior Deltoids"],
      "form": {
        "description": "Push-up variation with hands elevated on a surface",
        "setup": [
          "Superficie a 40-60cm de altura",
          "Manos a ancho de hombros",
          "Cuerpo en línea recta desde cabeza hasta talones"
        ],
        "execution": [
          "Baja en 2 segundos manteniendo hollow body",
          "Pecho casi toca la superficie",
          "Sube explosivamente",
          "Protracción escapular completa arriba"
        ],
        "commonMistakes": [
          "Cadera caída o elevada",
          "Codos demasiado abiertos (>45°)",
          "No completar rango de movimiento",
          "Falta de protracción escapular"
        ]
      },
      "progression": {
        "easier": "Wall Push-ups",
        "harder": "Regular Push-ups",
        "byWeek": [
          {
            "week": "1-2",
            "adjustment": "Altura mayor (60cm)",
            "targetReps": "8-12"
          },
          {
            "week": "3-4",
            "adjustment": "Altura media (50cm)",
            "targetReps": "10-15"
          },
          {
            "week": "5+",
            "adjustment": "Reducir altura si puedes hacer 15+ reps",
            "targetReps": "15+"
          }
        ]
      },
      "coachTips": [
        "Enfócate en la calidad, no la cantidad",
        "Mantén core activado todo el tiempo",
        "Si sientes dolor en hombros, reduce altura",
        "Dejar 2-3 reps en el tanque en niveles beginner"
      ],
      "equipment": ["Bench", "Box", "Parallel bars"],
      "videoUrl": null,
      "imageUrl": null
    }
    // ... más ejercicios
  ]
}
```

**Script para Parsear RUTINAS_POR_NIVEL**:
```javascript
// scripts/parse-rutinas-exercises.js

const fs = require('fs');
const path = require('path');

// Leer todos los archivos .md en RUTINAS_POR_NIVEL
// Extraer ejercicios con sus descripciones
// Generar exercise-database.json

function parseRoutineFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const exercises = [];

  // Regex para encontrar secciones de ejercicios
  const exercisePattern = /#### \d+\. (.+?)\n([\s\S]+?)(?=####|\n## |\n---)/g;

  let match;
  while ((match = exercisePattern.exec(content)) !== null) {
    const name = match[1].trim();
    const body = match[2];

    // Extraer series, reps, forma, etc.
    const exercise = {
      name,
      // ... parsear body
    };

    exercises.push(exercise);
  }

  return exercises;
}

// Ejecutar script
const allExercises = [];
// Leer todos los archivos de RUTINAS_POR_NIVEL
// Consolidar en exercise-database.json
```

**Integración en V3**:
```typescript
// En apps/web/src/lib/routine-generator-v3.ts

import { getExerciseDetails } from './exercise-library';

function selectExercise(category: string, level: TrainingStage): Exercise {
  const exerciseId = 'incline-push-ups'; // Lógica de selección
  const details = getExerciseDetails(exerciseId);

  return {
    id: exerciseId,
    name: details.name,
    sets: 4,
    reps: 10,
    rest: 120,
    form: details.form, // ← Incluir detalles de forma
    coachTips: details.coachTips,
    progression: details.progression
  };
}
```

**Criterio de Éxito**:
- ✅ Base de datos con 100+ ejercicios detallados
- ✅ Cada ejercicio tiene: forma correcta, errores comunes, coach tips, progresiones
- ✅ UI muestra detalles cuando usuario toca un ejercicio
- ✅ Ejercicios se pueden filtrar por nivel, categoría, equipo

---

#### 1.3 Agregar Enfriamientos Específicos

**Archivo a Crear**:
- `apps/web/src/lib/cooldown-protocols.ts`

**Contenido**:
```typescript
export const STANDARD_COOLDOWN = {
  id: 'standard-cooldown',
  name: 'Enfriamiento Estándar',
  duration: 10, // minutos
  phases: [
    {
      name: 'Estiramientos Estáticos',
      duration: 5,
      exercises: [
        {
          name: 'Estiramiento de Pecho',
          duration: 45, // segundos cada lado
          instructions: ['Brazo en marco de puerta 90°', 'Rotar cuerpo hacia afuera']
        },
        {
          name: 'Estiramiento de Hombros',
          duration: 45,
          instructions: ['Brazo cruzado sobre el cuerpo', 'Presionar con otro brazo']
        },
        // ... más estiramientos
      ]
    },
    {
      name: 'Respiración y Relajación',
      duration: 3,
      exercises: [
        {
          name: 'Respiración Profunda',
          duration: 180,
          instructions: [
            'Acostado boca arriba',
            'Inhalar 4 segundos, exhalar 6 segundos',
            'Relajar todos los músculos'
          ]
        }
      ]
    }
  ]
};

export function getCooldownProtocol(sessionType: SessionType): CooldownProtocol {
  // Devolver protocolo específico según sesión
  return STANDARD_COOLDOWN;
}
```

**Criterio de Éxito**:
- ✅ Todas las rutinas incluyen cooldown de 5-10 min
- ✅ Enfriamientos son específicos al tipo de sesión
- ✅ UI muestra instrucciones de estiramientos

---

### FASE 2: INTEGRACIÓN PROFUNDA 🔧 (3-4 semanas)

**Prioridad**: 🟡 IMPORTANTE
**Duración Estimada**: 3-4 semanas
**Impacto**: Medio-Alto - Mejor granularidad y progresión

#### 2.1 Subdividir Etapas en Subniveles

**Objetivo**: Pasar de 3 etapas a 15 subniveles

**Modificaciones en Schema**:
```prisma
// En prisma/schema.prisma

model User {
  // ... campos existentes ...

  trainingStage  String  @default("STAGE_1_2") // Mantener para compatibilidad
  trainingSubLevel String? // NUEVO: D_MINUS, D, D_PLUS, C_MINUS, etc.
}
```

**Archivo a Crear**:
- `apps/web/src/lib/sublevel-system.ts`

**Contenido**:
```typescript
export type SubLevel =
  | 'D_MINUS' | 'D' | 'D_PLUS'        // BEGINNER
  | 'C_MINUS' | 'C' | 'C_PLUS'        // NOVICE
  | 'B_MINUS' | 'B' | 'B_PLUS'        // INTERMEDIATE
  | 'A_MINUS' | 'A' | 'A_PLUS'        // ADVANCED
  | 'S_MINUS' | 'S' | 'S_PLUS';       // EXPERT

export function determineSubLevel(metrics: UserMetrics): SubLevel {
  const { pullUpsMax, dipsMax, weightedPullUps, weightedDips } = metrics;
  const bodyWeightKg = metrics.bodyWeight || 75;

  // EXPERT (S)
  if (pullUpsMax >= 35 && dipsMax >= 45) {
    if (pullUpsMax >= 50) return 'S_PLUS';
    if (pullUpsMax >= 40) return 'S';
    return 'S_MINUS';
  }

  // ADVANCED (A)
  if (pullUpsMax >= 25 && dipsMax >= 35) {
    const wpPercent = weightedPullUps / bodyWeightKg;
    const wdPercent = weightedDips / bodyWeightKg;

    if (wpPercent >= 0.35 || wdPercent >= 0.50) return 'A_PLUS';
    if (wpPercent >= 0.30 || wdPercent >= 0.45) return 'A';
    return 'A_MINUS';
  }

  // INTERMEDIATE (B)
  if (pullUpsMax >= 15 && dipsMax >= 20) {
    const wpPercent = weightedPullUps / bodyWeightKg;
    const wdPercent = weightedDips / bodyWeightKg;

    if (wpPercent >= 0.25 || wdPercent >= 0.40) return 'B_PLUS';
    if (wpPercent >= 0.20 || wdPercent >= 0.30) return 'B';
    return 'B_MINUS';
  }

  // NOVICE (C)
  if (pullUpsMax >= 5 && dipsMax >= 8) {
    if (pullUpsMax >= 12 && dipsMax >= 15) return 'C_PLUS';
    if (pullUpsMax >= 8 && dipsMax >= 12) return 'C';
    return 'C_MINUS';
  }

  // BEGINNER (D)
  if (pullUpsMax >= 1) {
    if (pullUpsMax >= 5 && dipsMax >= 5) return 'D_PLUS';
    if (pullUpsMax >= 3) return 'D';
  }

  return 'D_MINUS';
}

export function getStageFromSubLevel(subLevel: SubLevel): TrainingStage {
  if (subLevel.startsWith('D') || subLevel.startsWith('C')) return 'STAGE_1_2';
  if (subLevel.startsWith('B')) return 'STAGE_3';
  if (subLevel.startsWith('A') || subLevel.startsWith('S')) return 'STAGE_4';
  return 'STAGE_1_2';
}
```

**Modificación en Assessment API**:
```typescript
// En apps/web/src/app/api/assessment/fig-initial/route.ts

import { determineSubLevel } from '@/lib/sublevel-system';

// Después de calcular métricas
const subLevel = determineSubLevel({
  pullUpsMax,
  dipsMax,
  pushUpsMax,
  weightedPullUps: weightedPullUpsKg,
  weightedDips: weightedDipsKg,
  bodyWeight: 75 // O del perfil
});

await prisma.user.update({
  where: { id: userId },
  data: {
    // ... campos existentes ...
    trainingSubLevel: subLevel
  }
});
```

**Modificación en V3 Generator**:
```typescript
// En apps/web/src/lib/routine-generator-v3.ts

export function generateRoutineV3(userProfile: UserProfile): Routine {
  const subLevel = userProfile.trainingSubLevel || determineSubLevel(userProfile);
  const stage = getStageFromSubLevel(subLevel);

  // Usar subLevel para ajustes más granulares
  const exercises = selectExercisesForSubLevel(subLevel);

  // ... resto de generación
}

function selectExercisesForSubLevel(subLevel: SubLevel): Exercise[] {
  // Selección más específica basada en subnivel
  switch (subLevel) {
    case 'D_MINUS':
      // Ejercicios muy básicos: Negativas, asistidas
      break;
    case 'D':
      // Ejercicios básicos: Incline push-ups, assisted pull-ups
      break;
    case 'D_PLUS':
      // Progresiones: Regular push-ups, primeros pull-ups
      break;
    // ... etc para cada subnivel
  }
}
```

**Criterio de Éxito**:
- ✅ Assessment determina subnivel preciso
- ✅ V3 genera rutinas específicas para cada subnivel
- ✅ UI muestra subnivel al usuario (ej: "Nivel C+ - Novice Plus")
- ✅ Progresión más gradual entre niveles

---

#### 2.2 Sistema de Progresión Semanal

**Archivo a Crear**:
- `apps/web/src/lib/weekly-progression.ts`

**Contenido**:
```typescript
export interface WeeklyProgressionPlan {
  weekNumber: number; // 1-12
  adjustments: {
    intensity?: number; // % de ajuste
    volume?: number; // % de ajuste
    skillFocus?: string[];
  };
  expectedProgress: string;
}

export function getWeeklyProgression(
  subLevel: SubLevel,
  weekNumber: number
): WeeklyProgressionPlan {
  // Mesociclo de 4 semanas: 3 progresión + 1 deload
  const weekInCycle = ((weekNumber - 1) % 4) + 1;

  if (weekInCycle === 4) {
    // Semana de deload
    return {
      weekNumber,
      adjustments: {
        intensity: 0.7, // 70% intensidad
        volume: 0.6     // 60% volumen
      },
      expectedProgress: 'Deload week - Recuperación activa'
    };
  }

  // Progresión lineal semanas 1-3
  return {
    weekNumber,
    adjustments: {
      intensity: 1.0 + (weekInCycle - 1) * 0.05, // +5% por semana
      volume: 1.0
    },
    expectedProgress: `Semana ${weekInCycle} de progresión`
  };
}
```

**Modificación en Schema**:
```prisma
model User {
  // ... campos existentes ...

  currentWeek Int @default(1)
  programStartDate DateTime?
}
```

**Integración en V3**:
```typescript
export function generateRoutineV3(userProfile: UserProfile): Routine {
  const weekNumber = userProfile.currentWeek || 1;
  const progression = getWeeklyProgression(userProfile.trainingSubLevel, weekNumber);

  // Aplicar ajustes de progresión
  const exercises = baseExercises.map(ex => ({
    ...ex,
    sets: Math.round(ex.sets * (progression.adjustments.volume || 1)),
    rest: weekNumber === 4 ? ex.rest + 30 : ex.rest // Más descanso en deload
  }));

  return {
    weekNumber,
    progressionNote: progression.expectedProgress,
    // ... resto de rutina
  };
}
```

**Criterio de Éxito**:
- ✅ Sistema trackea semana actual del usuario
- ✅ Ajusta automáticamente intensidad/volumen
- ✅ Deload week cada 4 semanas
- ✅ UI muestra en qué semana está el usuario

---

#### 2.3 Importar Splits de RUTINAS_POR_NIVEL

**Archivo a Crear**:
- `apps/web/src/lib/training-splits.ts`

**Contenido**:
```typescript
export type SplitOption = '3_DAY' | '4_DAY' | '5_DAY' | '6_DAY';

export interface TrainingSplit {
  id: SplitOption;
  name: string;
  daysPerWeek: number;
  schedule: DaySchedule[];
  bestFor: SubLevel[];
}

export const TRAINING_SPLITS: Record<SplitOption, TrainingSplit> = {
  '3_DAY': {
    id: '3_DAY',
    name: 'Full Body 3 días',
    daysPerWeek: 3,
    schedule: [
      { day: 1, type: 'FULL_BODY', name: 'Día A - Push Focus' },
      { day: 2, type: 'REST', name: 'Descanso' },
      { day: 3, type: 'FULL_BODY', name: 'Día B - Pull Focus' },
      { day: 4, type: 'REST', name: 'Descanso' },
      { day: 5, type: 'FULL_BODY', name: 'Día C - Legs + Skills' },
      { day: 6, type: 'REST', name: 'Descanso' },
      { day: 7, type: 'REST', name: 'Descanso' }
    ],
    bestFor: ['D_MINUS', 'D', 'D_PLUS']
  },
  '4_DAY': {
    id: '4_DAY',
    name: 'Upper/Lower 4 días',
    daysPerWeek: 4,
    schedule: [
      { day: 1, type: 'PUSH', name: 'Push' },
      { day: 2, type: 'PULL', name: 'Pull' },
      { day: 3, type: 'REST', name: 'Descanso' },
      { day: 4, type: 'LEGS', name: 'Legs' },
      { day: 5, type: 'SKILLS', name: 'Skills' },
      { day: 6, type: 'REST', name: 'Descanso' },
      { day: 7, type: 'REST', name: 'Descanso' }
    ],
    bestFor: ['C_MINUS', 'C', 'C_PLUS']
  },
  '5_DAY': {
    id: '5_DAY',
    name: 'Push/Pull/Legs/Skills 5 días',
    daysPerWeek: 5,
    schedule: [
      { day: 1, type: 'PUSH', name: 'Weighted Push' },
      { day: 2, type: 'PULL', name: 'Weighted Pull' },
      { day: 3, type: 'REST', name: 'Descanso' },
      { day: 4, type: 'SKILLS', name: 'Skills + Light Weighted' },
      { day: 5, type: 'LEGS', name: 'Legs + Core' },
      { day: 6, type: 'FULL_BODY', name: 'Volume Day' },
      { day: 7, type: 'REST', name: 'Descanso' }
    ],
    bestFor: ['B_MINUS', 'B', 'B_PLUS']
  },
  '6_DAY': {
    id: '6_DAY',
    name: 'Especialización 6 días',
    daysPerWeek: 6,
    schedule: [
      { day: 1, type: 'PUSH', name: 'Max Strength Push' },
      { day: 2, type: 'PULL', name: 'Max Strength Pull' },
      { day: 3, type: 'SKILLS', name: 'Planche Specialization' },
      { day: 4, type: 'REST', name: 'Descanso Activo' },
      { day: 5, type: 'SKILLS', name: 'Front Lever Specialization' },
      { day: 6, type: 'FULL_BODY', name: 'Volume + Muscle-up' },
      { day: 7, type: 'LEGS', name: 'Legs + Power' }
    ],
    bestFor: ['A_MINUS', 'A', 'A_PLUS', 'S_MINUS', 'S', 'S_PLUS']
  }
};

export function getRecommendedSplit(subLevel: SubLevel): SplitOption {
  for (const [key, split] of Object.entries(TRAINING_SPLITS)) {
    if (split.bestFor.includes(subLevel)) {
      return key as SplitOption;
    }
  }
  return '3_DAY';
}
```

**Modificación en Schema**:
```prisma
model User {
  // ... campos existentes ...

  preferredSplit String? // '3_DAY', '4_DAY', etc.
}
```

**Criterio de Éxito**:
- ✅ Usuario puede elegir split semanal
- ✅ Sistema recomienda split según subnivel
- ✅ Rutinas generadas siguen el split elegido
- ✅ UI muestra calendario semanal

---

### FASE 3: FEATURES AVANZADOS 🚀 (4-6 semanas)

**Prioridad**: 🟢 MEJORAS
**Duración Estimada**: 4-6 semanas
**Impacto**: Medio - UX mejorada

#### 3.1 Modo "Rutina Completa"

**Objetivo**: Mostrar rutina estilo RUTINAS_POR_NIVEL con todo detallado

**Archivo a Crear**:
- `apps/web/src/components/routine/CompleteRoutineView.tsx`

**Contenido**:
```typescript
export function CompleteRoutineView({ routine }: { routine: Routine }) {
  return (
    <div className="complete-routine">
      <Section title="CALENTAMIENTO" duration={routine.warmup.totalDuration}>
        {routine.warmup.protocols.map(protocol => (
          <ProtocolSection key={protocol.id} protocol={protocol}>
            {protocol.exercises.map(ex => (
              <ExerciseDetail
                name={ex.name}
                duration={ex.duration}
                reps={ex.reps}
                instructions={ex.instructions}
              />
            ))}
          </ProtocolSection>
        ))}
      </Section>

      <Section title="TRABAJO PRINCIPAL">
        <SubSection title="Skill Work">
          {routine.skillWork.exercises.map(ex => (
            <ExerciseDetailCard exercise={ex} showFormTips showProgression />
          ))}
        </SubSection>

        <SubSection title="Support Work">
          {/* Similar */}
        </SubSection>

        <SubSection title="Strength Work">
          {/* Similar */}
        </SubSection>
      </Section>

      <Section title="ENFRIAMIENTO" duration={routine.cooldown.duration}>
        {/* Cooldown detallado */}
      </Section>
    </div>
  );
}
```

**Criterio de Éxito**:
- ✅ Vista completa con todas las secciones
- ✅ Cada ejercicio muestra forma, tips, progresiones
- ✅ Se puede imprimir o exportar PDF
- ✅ Toggle entre vista simple y completa

---

#### 3.2 Sistema de Variantes

**Objetivo**: Ofrecer variantes según equipo disponible

**Archivo a Crear**:
- `apps/web/src/lib/exercise-variants.ts`

**Contenido**:
```typescript
export interface ExerciseVariant {
  id: string;
  name: string;
  equipment: string[];
  difficulty: 'easier' | 'same' | 'harder';
  substitutionScore: number; // 0-1, qué tan buena es la sustitución
}

export const EXERCISE_VARIANTS: Record<string, ExerciseVariant[]> = {
  'weighted-dips': [
    {
      id: 'dumbbell-dips',
      name: 'Dips con Mancuerna',
      equipment: ['dumbbell', 'parallel-bars'],
      difficulty: 'same',
      substitutionScore: 1.0
    },
    {
      id: 'weighted-vest-dips',
      name: 'Dips con Chaleco',
      equipment: ['weighted-vest', 'parallel-bars'],
      difficulty: 'same',
      substitutionScore: 0.95
    },
    {
      id: 'band-assisted-dips',
      name: 'Dips con Banda de Asistencia',
      equipment: ['resistance-band', 'parallel-bars'],
      difficulty: 'easier',
      substitutionScore: 0.7
    }
  ],
  // ... más ejercicios
};

export function findBestVariant(
  exerciseId: string,
  availableEquipment: string[]
): ExerciseVariant | null {
  const variants = EXERCISE_VARIANTS[exerciseId] || [];

  return variants
    .filter(v => v.equipment.every(eq => availableEquipment.includes(eq)))
    .sort((a, b) => b.substitutionScore - a.substitutionScore)[0] || null;
}
```

**Modificación en Schema**:
```prisma
model User {
  // ... campos existentes ...

  availableEquipment String[] // ['pull-up-bar', 'dip-bars', 'dumbbells', etc.]
}
```

**Integración en V3**:
```typescript
export function generateRoutineV3(userProfile: UserProfile): Routine {
  const baseExercises = selectExercises(userProfile);

  // Reemplazar con variantes según equipo
  const exercises = baseExercises.map(ex => {
    if (!hasRequiredEquipment(ex, userProfile.availableEquipment)) {
      const variant = findBestVariant(ex.id, userProfile.availableEquipment);
      return variant ? { ...ex, ...variant } : ex;
    }
    return ex;
  });

  return { exercises, /* ... */ };
}
```

**Criterio de Éxito**:
- ✅ Usuario puede especificar equipo disponible
- ✅ Rutinas se adaptan automáticamente
- ✅ UI muestra variantes disponibles
- ✅ Sistema prefiere variantes con mejor puntuación

---

#### 3.3 Tracking Avanzado

**Objetivo**: Avisar cuando usuario está listo para subir de nivel

**Archivo a Crear**:
- `apps/web/src/lib/progression-tracker.ts`

**Contenido**:
```typescript
export interface ProgressionCheckpoint {
  metric: string;
  current: number;
  target: number;
  progress: number; // 0-1
  achieved: boolean;
}

export function checkProgressionReadiness(
  userProfile: UserProfile,
  currentSubLevel: SubLevel
): {
  ready: boolean;
  nextSubLevel: SubLevel;
  checkpoints: ProgressionCheckpoint[];
} {
  const nextSubLevel = getNextSubLevel(currentSubLevel);
  const requirements = getRequirementsForSubLevel(nextSubLevel);

  const checkpoints = requirements.map(req => ({
    metric: req.name,
    current: userProfile[req.field],
    target: req.value,
    progress: userProfile[req.field] / req.value,
    achieved: userProfile[req.field] >= req.value
  }));

  const ready = checkpoints.every(cp => cp.achieved);

  return { ready, nextSubLevel, checkpoints };
}

export function getNextSubLevel(current: SubLevel): SubLevel {
  const order: SubLevel[] = [
    'D_MINUS', 'D', 'D_PLUS',
    'C_MINUS', 'C', 'C_PLUS',
    'B_MINUS', 'B', 'B_PLUS',
    'A_MINUS', 'A', 'A_PLUS',
    'S_MINUS', 'S', 'S_PLUS'
  ];

  const currentIndex = order.indexOf(current);
  return order[currentIndex + 1] || current;
}
```

**UI Component**:
```typescript
export function ProgressionTracker({ userProfile }: Props) {
  const check = checkProgressionReadiness(
    userProfile,
    userProfile.trainingSubLevel
  );

  if (check.ready) {
    return (
      <Alert type="success">
        <h3>🎉 ¡Listo para subir de nivel!</h3>
        <p>Has cumplido todos los requisitos para {check.nextSubLevel}</p>
        <Button onClick={handleLevelUp}>Subir a {check.nextSubLevel}</Button>
      </Alert>
    );
  }

  return (
    <ProgressCard>
      <h3>Progreso hacia {check.nextSubLevel}</h3>
      {check.checkpoints.map(cp => (
        <ProgressBar
          key={cp.metric}
          label={cp.metric}
          current={cp.current}
          target={cp.target}
          progress={cp.progress}
        />
      ))}
    </ProgressCard>
  );
}
```

**Criterio de Éxito**:
- ✅ Dashboard muestra progreso hacia siguiente nivel
- ✅ Notificación cuando usuario está listo
- ✅ Puede revisar requisitos faltantes
- ✅ Histórico de subidas de nivel

---

## 📊 MÉTRICAS DE ÉXITO

### Fase 1
- ✅ 100% de rutinas con calentamientos detallados
- ✅ 100+ ejercicios en base de datos con forma completa
- ✅ Reducción de quejas sobre lesiones

### Fase 2
- ✅ 15 subniveles implementados
- ✅ Progresión semanal automática funcionando
- ✅ Usuario puede elegir split y se respeta

### Fase 3
- ✅ Vista completa disponible y usada por >50% usuarios
- ✅ Sistema de variantes reduce "no tengo equipo" en 80%
- ✅ Tracking avanzado aumenta retención

---

## 🎯 PRIORIDADES

### Hacer PRIMERO (Crítico)
1. Calentamientos detallados
2. Base de datos de ejercicios
3. Enfriamientos específicos

### Hacer DESPUÉS (Importante)
4. Sistema de subniveles
5. Progresión semanal
6. Splits flexibles

### Hacer AL FINAL (Nice-to-have)
7. Modo rutina completa
8. Sistema de variantes
9. Tracking avanzado

---

## ⏱️ TIMELINE ESTIMADO

```
Semana 1-2:  Fase 1.1 - Calentamientos ⚡
Semana 2-3:  Fase 1.2 - Base de datos ejercicios ⚡
Semana 3-4:  Fase 1.3 - Enfriamientos ⚡

             [CHECKPOINT 1: Fase 1 completa]

Semana 5-6:  Fase 2.1 - Subniveles 🔧
Semana 7-8:  Fase 2.2 - Progresión semanal 🔧
Semana 9-10: Fase 2.3 - Splits 🔧

             [CHECKPOINT 2: Fase 2 completa]

Semana 11-12: Fase 3.1 - Vista completa 🚀
Semana 13-14: Fase 3.2 - Variantes 🚀
Semana 15-16: Fase 3.3 - Tracking avanzado 🚀

             [CHECKPOINT 3: Integración completa]
```

**Total**: 16 semanas (~4 meses)

---

## 📝 NOTAS DE IMPLEMENTACIÓN

### Orden de Desarrollo
1. Backend primero (types, logic, database)
2. API routes después
3. UI components al final
4. Testing continuo

### Testing
- Unit tests para cada helper function
- Integration tests para assessment + V3
- Manual testing de UI

### Documentación
- Actualizar README con cada fase
- Documentar nuevas APIs
- Crear guías de usuario

---

## ✅ CHECKLIST DE PROGRESO

### Fase 1: Mejoras Inmediatas
- [ ] 1.1 Calentamientos detallados
  - [ ] Crear warmup-protocols.ts
  - [ ] Integrar en V3
  - [ ] UI para mostrar protocolos
  - [ ] Testing
- [ ] 1.2 Base de datos de ejercicios
  - [ ] Script parser
  - [ ] exercise-database.json
  - [ ] exercise-library.ts
  - [ ] ExerciseDetailCard UI
  - [ ] Testing
- [ ] 1.3 Enfriamientos específicos
  - [ ] Crear cooldown-protocols.ts
  - [ ] Integrar en V3
  - [ ] UI
  - [ ] Testing

### Fase 2: Integración Profunda
- [ ] 2.1 Subniveles
  - [ ] Schema update
  - [ ] sublevel-system.ts
  - [ ] Integrar en assessment
  - [ ] Integrar en V3
  - [ ] UI updates
  - [ ] Testing
- [ ] 2.2 Progresión semanal
  - [ ] weekly-progression.ts
  - [ ] Schema update
  - [ ] Integrar en V3
  - [ ] UI
  - [ ] Testing
- [ ] 2.3 Splits
  - [ ] training-splits.ts
  - [ ] Schema update
  - [ ] UI para selección
  - [ ] Integrar en V3
  - [ ] Testing

### Fase 3: Features Avanzados
- [ ] 3.1 Vista completa
  - [ ] CompleteRoutineView component
  - [ ] Export PDF functionality
  - [ ] Testing
- [ ] 3.2 Variantes
  - [ ] exercise-variants.ts
  - [ ] Schema update
  - [ ] Equipment selection UI
  - [ ] Integrar en V3
  - [ ] Testing
- [ ] 3.3 Tracking avanzado
  - [ ] progression-tracker.ts
  - [ ] ProgressionTracker UI
  - [ ] Notification system
  - [ ] Testing

---

## 🚀 LISTO PARA EMPEZAR

**Siguiente paso**: Implementar Fase 1.1 - Calentamientos Detallados

**Comando para empezar**:
```bash
# Crear archivos necesarios
touch apps/web/src/lib/warmup-protocols.ts
touch apps/web/src/types/warmup.ts
touch apps/web/src/components/warmup/WarmupProtocolDisplay.tsx
```

---

**Última actualización**: 2025-11-15
**Estado**: Roadmap completo, listo para implementación
**Siguiente acción**: Fase 1.1 - Calentamientos
