# 🔄 Guía de Migración: Routine Generator V2 → V3

## 📋 Resumen Ejecutivo

Esta guía proporciona los pasos necesarios para reemplazar el sistema actual (V2) con el nuevo sistema (V3) que sigue fielmente la guía de progresión experta de calistenia.

**Tiempo estimado**: 2-3 horas
**Complejidad**: Media
**Riesgo de ruptura**: Bajo (con las migraciones proporcionadas)

---

## 🎯 Objetivos de la Migración

1. ✅ Implementar Modo 1 (habilidades con búfer) vs Modo 2 (fuerza al fallo)
2. ✅ Corregir bug de categorías ('STRENGTH' → 'PUSH'/'PULL')
3. ✅ Implementar calentamiento específico por tipo de sesión
4. ✅ Agregar sistema de gating para prevenir lesiones
5. ✅ Implementar splits correctos por etapa de entrenamiento
6. ✅ Estructura de sesión pedagógicamente correcta

---

## 📂 Archivos Afectados

### Archivos Nuevos
```
apps/web/src/lib/routine-generator-v3.ts        (NUEVO - Sistema completo)
ROUTINE_GENERATOR_V3_GUIDE.md                   (NUEVO - Documentación)
MIGRATION_V2_TO_V3.md                           (NUEVO - Esta guía)
scripts/test-routine-generator-v3.js            (NUEVO - Tests)
```

### Archivos a Modificar
```
apps/api/src/routes/routines.ts                 (Cambiar import)
apps/web/src/app/(dashboard)/routines/page.tsx  (Actualizar UI)
apps/web/src/components/routine-display.tsx     (Mostrar fases)
```

### Archivos a Deprecar (NO BORRAR todavía)
```
apps/web/src/lib/routine-generator-v2.ts        (Marcar como deprecated)
```

---

## 🔧 PASO 1: Actualizar Backend API

### 1.1 Modificar `apps/api/src/routes/routines.ts`

**ANTES (V2):**
```typescript
import { generateRoutineV2, RoutineConfig } from '../lib/routine-generator-v2';

router.post('/generate', async (req, res) => {
  const config: RoutineConfig = {
    userId: req.user.id,
    level: req.user.fitnessLevel,
    goal: req.body.goal,
    daysPerWeek: req.body.daysPerWeek,
    // ...
  };

  const routines = generateRoutineV2(config, exercises);
  res.json(routines);
});
```

**DESPUÉS (V3):**
```typescript
import { generateRoutineV3, RoutineConfig, determineTrainingStage } from '../lib/routine-generator-v3';

router.post('/generate', async (req, res) => {
  const config: RoutineConfig = {
    userId: req.user.id,
    level: req.user.difficultyLevel, // D, C, B, A, S
    stage: determineTrainingStage({
      pullUpsMax: req.user.pullUpsMax,
      dipsMax: req.user.dipsMax,
      weightedPullUps: req.user.weightedPullUps,
      weightedDips: req.user.weightedDips,
    }),
    daysPerWeek: req.body.daysPerWeek,
    minutesPerSession: req.body.minutesPerSession,
    equipment: req.user.equipment,

    // NEW: Strength metrics for gating
    pullUpsMax: req.user.pullUpsMax,
    dipsMax: req.user.dipsMax,
    pushUpsMax: req.user.pushUpsMax,
    weightedPullUps: req.user.weightedPullUps,
    weightedDips: req.user.weightedDips,

    // NEW: Mastery goals from user profile
    masteryGoals: req.user.masteryGoals,
  };

  const routines = generateRoutineV3(config, exercises);
  res.json(routines);
});
```

### 1.2 Agregar Campos al Modelo User

**Agregar a `prisma/schema.prisma`:**
```prisma
model User {
  // ... campos existentes

  // NEW: Strength metrics for gating system
  pullUpsMax        Int?
  dipsMax           Int?
  pushUpsMax        Int?
  weightedPullUps   Float? // kg added
  weightedDips      Float? // kg added

  // NEW: Selected mastery goals
  masteryGoals      String? // JSON array of MasteryGoal
}
```

**Ejecutar migración:**
```bash
npx prisma migrate dev --name add-strength-metrics
npx prisma generate
```

---

## 🎨 PASO 2: Actualizar Frontend UI

### 2.1 Actualizar Componente de Rutinas

**Crear `apps/web/src/components/routine-phase-display.tsx`:**
```typescript
import { SessionPhase, TrainingMode } from '@/lib/routine-generator-v3';

interface RoutinePhaseDisplayProps {
  phase: SessionPhase;
}

export function RoutinePhaseDisplay({ phase }: RoutinePhaseDisplayProps) {
  return (
    <div className="mb-6 border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{phase.name}</h3>
        <span className="text-sm text-gray-500">{phase.duration} min</span>
      </div>

      <p className="text-sm text-gray-600 mb-3">{phase.purpose}</p>

      {phase.mode && (
        <div className="mb-3">
          {phase.mode === 'MODE_1_SKILL' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              🎯 Mode 1: Skill Practice (WITH BUFFER)
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              💪 Mode 2: Strength Building (TO FAILURE)
            </span>
          )}
        </div>
      )}

      <div className="space-y-3">
        {phase.exercises.map((exercise, idx) => (
          <div key={idx} className="bg-gray-50 rounded p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{exercise.name}</span>
              {exercise.masteryGoal && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {exercise.masteryGoal}
                </span>
              )}
            </div>

            <div className="text-sm text-gray-600 mt-1">
              {exercise.sets} sets × {exercise.reps ? `${exercise.reps} reps` : `${exercise.duration}s hold`}
              {' • '}
              {exercise.rest}s rest
            </div>

            {exercise.buffer && (
              <div className="text-xs text-purple-600 mt-1 italic">
                ⚠️ {exercise.buffer}
              </div>
            )}

            {exercise.targetIntensity && (
              <div className="text-xs text-red-600 mt-1 font-medium">
                🎯 {exercise.targetIntensity}
              </div>
            )}

            {exercise.coachTips && exercise.coachTips.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                💡 {exercise.coachTips[0]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2.2 Actualizar Página de Rutinas

**`apps/web/src/app/(dashboard)/routines/page.tsx`:**
```typescript
import { RoutinePhaseDisplay } from '@/components/routine-phase-display';

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);

  // ... fetch logic

  return (
    <div>
      <h1>Your Training Routine</h1>

      {routines.map((routine, idx) => (
        <div key={idx} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2>{routine.day} - {routine.sessionType}</h2>
            <span className="text-sm text-gray-500">
              {routine.totalMinutes} minutes
            </span>
          </div>

          {/* NEW: Show training stage badge */}
          <div className="mb-4">
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${routine.stage === 'STAGE_1_2' ? 'bg-green-100 text-green-800' : ''}
              ${routine.stage === 'STAGE_3' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${routine.stage === 'STAGE_4' ? 'bg-purple-100 text-purple-800' : ''}
            `}>
              {routine.stage === 'STAGE_1_2' && '🏗️ Foundation Building'}
              {routine.stage === 'STAGE_3' && '💪 Advanced Weighted'}
              {routine.stage === 'STAGE_4' && '🎯 Elite Skills + Weighted'}
            </span>
          </div>

          {/* NEW: Show educational notes */}
          {routine.notes.map((note, nIdx) => (
            <div key={nIdx} className="mb-4 p-3 bg-blue-50 rounded text-sm">
              {note}
            </div>
          ))}

          {/* NEW: Display phases instead of flat exercises */}
          {routine.phases.map((phase, pIdx) => (
            <RoutinePhaseDisplay key={pIdx} phase={phase} />
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔐 PASO 3: Agregar Gating System UI

### 3.1 Crear Componente de Gating Status

**`apps/web/src/components/skill-gating-status.tsx`:**
```typescript
import { SkillGatingSystem, RoutineConfig } from '@/lib/routine-generator-v3';

export function SkillGatingStatus({ userConfig }: { userConfig: RoutineConfig }) {
  const skills = [
    { name: 'Planche', check: SkillGatingSystem.canAccessPlanchePath, requirement: '15+ Dips' },
    { name: 'Front Lever', check: SkillGatingSystem.canAccessFrontLeverPath, requirement: '8+ Pull-ups' },
    { name: 'One-Arm Pull-up', check: SkillGatingSystem.canAccessOneArmPullUpPath, requirement: '15+ Pull-ups' },
    { name: 'HSPU', check: SkillGatingSystem.canAccessHandstandPushUpPath, requirement: '20+ Push-ups' },
    { name: 'Muscle-up', check: SkillGatingSystem.canAccessMuscleUpPath, requirement: '10+ Pull-ups & Dips' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Skill Path Access</h3>
      <div className="space-y-3">
        {skills.map((skill) => {
          const unlocked = skill.check(userConfig);
          return (
            <div key={skill.name} className="flex items-center justify-between">
              <div>
                <span className="font-medium">{skill.name}</span>
                <span className="text-xs text-gray-500 ml-2">({skill.requirement})</span>
              </div>
              {unlocked ? (
                <span className="text-green-600">✅ Unlocked</span>
              ) : (
                <span className="text-gray-400">🔒 Locked</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 📊 PASO 4: Migración de Datos Existentes

### 4.1 Script de Migración de Usuarios

**`scripts/migrate-user-data-v3.js`:**
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateUsers() {
  console.log('🔄 Migrating users to V3 schema...\n');

  const users = await prisma.user.findMany();

  for (const user of users) {
    // Estimate strength metrics from fitness level if not set
    let pullUpsMax = user.pullUpsMax;
    let dipsMax = user.dipsMax;
    let pushUpsMax = user.pushUpsMax;

    if (!pullUpsMax) {
      pullUpsMax = estimatePullUps(user.fitnessLevel);
    }
    if (!dipsMax) {
      dipsMax = estimateDips(user.fitnessLevel);
    }
    if (!pushUpsMax) {
      pushUpsMax = estimatePushUps(user.fitnessLevel);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        pullUpsMax,
        dipsMax,
        pushUpsMax,
        weightedPullUps: 0,
        weightedDips: 0,
        masteryGoals: JSON.stringify([]), // Empty initially
      },
    });

    console.log(`✅ Migrated user ${user.id}`);
  }

  console.log('\n✅ Migration complete!');
}

function estimatePullUps(fitnessLevel) {
  const mapping = {
    'BEGINNER': 3,
    'INTERMEDIATE': 8,
    'ADVANCED': 15,
    'ELITE': 20,
  };
  return mapping[fitnessLevel] || 5;
}

function estimateDips(fitnessLevel) {
  const mapping = {
    'BEGINNER': 0,
    'INTERMEDIATE': 5,
    'ADVANCED': 12,
    'ELITE': 18,
  };
  return mapping[fitnessLevel] || 3;
}

function estimatePushUps(fitnessLevel) {
  const mapping = {
    'BEGINNER': 10,
    'INTERMEDIATE': 20,
    'ADVANCED': 35,
    'ELITE': 50,
  };
  return mapping[fitnessLevel] || 15;
}

migrateUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Ejecutar:**
```bash
node scripts/migrate-user-data-v3.js
```

---

## ✅ PASO 5: Testing y Validación

### 5.1 Ejecutar Test Suite

```bash
node scripts/test-routine-generator-v3.js
```

**Verificar que todos los tests pasen:**
- ✅ Stage 1-2 generation
- ✅ Stage 3 weighted work
- ✅ Stage 4 bifurcated training
- ✅ Gating system
- ✅ Warm-up specificity

### 5.2 Test Manual en Desarrollo

1. Crear 3 usuarios de prueba:
   - Beginner (5 pull-ups, 0 dips)
   - Advanced (15 pull-ups, 18 dips)
   - Elite (18 pull-ups con +20kg, 20 dips con +30kg)

2. Generar rutinas para cada uno

3. Verificar:
   - ✅ Beginner: Solo Modo 2, sin skills
   - ✅ Advanced: Weighted work
   - ✅ Elite: Fases correctas (Skills + Weighted)
   - ✅ Gating: Beginner no puede acceder a Planche

---

## 🚨 PASO 6: Despliegue Gradual

### Opción A: Feature Flag (Recomendado)

```typescript
// En la API
const USE_V3_GENERATOR = process.env.USE_V3_GENERATOR === 'true';

router.post('/generate', async (req, res) => {
  const routines = USE_V3_GENERATOR
    ? generateRoutineV3(config, exercises)
    : generateRoutineV2(config, exercises);

  res.json(routines);
});
```

**Rollout:**
1. Semana 1: 10% de usuarios (feature flag)
2. Semana 2: 50% de usuarios
3. Semana 3: 100% de usuarios
4. Semana 4: Eliminar V2

### Opción B: Despliegue Completo

Si prefieres hacer el cambio de una vez:
1. Backup de base de datos
2. Ejecutar migración de usuarios
3. Desplegar con V3
4. Monitorear errores

---

## 📝 PASO 7: Documentación para Usuarios

### 7.1 Notificación In-App

```
🎉 ¡Sistema de Rutinas Mejorado!

Hemos actualizado nuestro sistema de generación de rutinas basándonos en
principios de entrenamiento expertos de calistenia.

Nuevas características:
✅ Entrenamiento dual: Habilidades (práctica de calidad) + Fuerza (al fallo)
✅ Calentamiento específico para prevenir lesiones
✅ Progresión por etapas de entrenamiento
✅ Sistema de desbloqueo de habilidades avanzadas

📚 Lee nuestra guía completa: [Link]
```

### 7.2 Tutorial Interactivo

Mostrar tooltips la primera vez que el usuario ve:
- Badge de "Mode 1" → Explicar práctica con búfer
- Badge de "Mode 2" → Explicar entrenamiento al fallo
- Skill bloqueada → Explicar requisitos previos

---

## 🐛 Troubleshooting

### Problema 1: "Cannot read property 'phases' of undefined"
**Solución**: Actualizar UI para manejar tanto formato V2 (exercises[]) como V3 (phases[])

```typescript
{routine.phases ? (
  // V3 format
  routine.phases.map(phase => <RoutinePhaseDisplay phase={phase} />)
) : (
  // V2 fallback
  routine.exercises.map(ex => <ExerciseDisplay exercise={ex} />)
)}
```

### Problema 2: Usuarios sin métricas de fuerza
**Solución**: El script de migración estima valores iniciales basados en fitnessLevel

### Problema 3: Gating demasiado restrictivo
**Solución**: Ajustar thresholds en `SkillGatingSystem` si es necesario

---

## 📊 Métricas de Éxito

Monitorear después del despliegue:
- ✅ Tasa de error de generación de rutinas
- ✅ Engagement con nuevas fases
- ✅ Comprensión de Modo 1 vs Modo 2 (surveys)
- ✅ Reducción de lesiones reportadas

---

## 🎯 Checklist Final

- [ ] V3 implementado y testeado
- [ ] Migración de schema ejecutada
- [ ] Migración de datos de usuarios ejecutada
- [ ] UI actualizada para mostrar fases
- [ ] Componente de gating agregado
- [ ] Tests pasando
- [ ] Documentación actualizada
- [ ] Feature flag configurado (opcional)
- [ ] Backup de base de datos creado
- [ ] Notificación a usuarios preparada
- [ ] Monitoreo configurado

---

## 📚 Recursos Adicionales

- **Guía de Usuario V3**: `ROUTINE_GENERATOR_V3_GUIDE.md`
- **Tests**: `scripts/test-routine-generator-v3.js`
- **Código Fuente**: `apps/web/src/lib/routine-generator-v3.ts`
- **Guía de Progresión Original**: `GUIA PROGRESION EJERCICIOS/Calistenia_ Guía de Progresión y Aplicación.pdf`

---

## ✅ Conclusión

Siguiendo esta guía, habrás migrado exitosamente de V2 a V3, implementando un sistema de generación de rutinas pedagógicamente correcto que:

1. ✅ Previene lesiones con gating y calentamiento específico
2. ✅ Optimiza aprendizaje motor con Modo 1
3. ✅ Maximiza ganancia de fuerza con Modo 2
4. ✅ Educa al usuario sobre el "por qué" de su entrenamiento

**¡El nuevo sistema sigue fielmente la guía de progresión experta de calistenia!** 🎉
