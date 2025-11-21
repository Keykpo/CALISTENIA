# Plan de Refactorización

Este documento describe el plan para refactorizar los archivos más grandes del proyecto.

## Archivos Prioritarios

| Archivo | Líneas | Prioridad | Estrategia |
|---------|--------|-----------|------------|
| FigOnboardingAssessment.tsx | 1432 | ALTA | Dividir en componentes y hooks |
| expert-routine-templates.ts | 1155 | MEDIA | Mover a base de datos |
| exercises.ts | 1170 | MEDIA | Ya está en JSON, considerar eliminar |
| routine-generator-v3.ts | 982 | MEDIA | Extraer helpers a módulos |
| training/page.tsx | 942 | ALTA | Dividir en componentes |
| WorkoutSessionTracker.tsx | 865 | MEDIA | Extraer estado a hooks |
| DashboardOverview.tsx | 814 | MEDIA | Dividir en widgets |

---

## 1. FigOnboardingAssessment.tsx (1432 líneas)

### Estado Actual
- Componente monolítico con todo el flujo de onboarding
- Múltiples estados, formularios, y lógica de negocio mezclados
- Difícil de testear y mantener

### Plan de Refactorización

#### Paso 1: Extraer tipos e interfaces
Crear `apps/web/src/types/onboarding.ts`:
```typescript
// Todos los tipos relacionados con onboarding
export interface AssessmentStep { ... }
export interface ExerciseResult { ... }
export interface HexagonInitialValues { ... }
```

#### Paso 2: Extraer constantes
Crear `apps/web/src/lib/onboarding-constants.ts`:
```typescript
export const ASSESSMENT_STEPS = [...]
export const DIFFICULTY_LEVELS = {...}
export const EXERCISE_RANKINGS = {...}
```

#### Paso 3: Crear hooks personalizados
Crear `apps/web/src/hooks/useOnboarding.ts`:
```typescript
export function useOnboardingFlow() {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState({});
  // ... lógica de navegación
}

export function useAssessmentTimer() {
  // ... lógica de timer
}

export function useExerciseRecording() {
  // ... lógica de grabación
}
```

#### Paso 4: Dividir en componentes
```
components/onboarding/
├── FigOnboardingAssessment.tsx (orquestador)
├── steps/
│   ├── WelcomeStep.tsx
│   ├── GoalsStep.tsx
│   ├── ExerciseTestStep.tsx
│   ├── ResultsStep.tsx
│   └── CompletionStep.tsx
├── shared/
│   ├── ExerciseTimer.tsx
│   ├── RankSelector.tsx
│   └── ProgressIndicator.tsx
```

### Resultado Esperado
- Archivo principal: ~200 líneas (orquestador)
- 5-7 componentes de ~100-200 líneas cada uno
- 2-3 hooks de ~50-100 líneas
- Mejor testabilidad y mantenibilidad

---

## 2. training/page.tsx (942 líneas)

### Plan de Refactorización

#### Extraer componentes:
- `TrainingHeader.tsx` - Navegación y título
- `RoutineSelector.tsx` - Selección de rutina
- `ExerciseList.tsx` - Lista de ejercicios
- `WorkoutControls.tsx` - Botones de control
- `TrainingStats.tsx` - Estadísticas

#### Crear hooks:
- `useTrainingSession()` - Estado de la sesión
- `useRoutineSelection()` - Selección de rutina

---

## 3. DashboardOverview.tsx (814 líneas)

### Plan de Refactorización

#### Dividir en widgets:
```
components/dashboard/
├── DashboardOverview.tsx (contenedor)
├── widgets/
│   ├── HexagonWidget.tsx
│   ├── MissionsWidget.tsx
│   ├── StatsWidget.tsx
│   ├── StreakWidget.tsx
│   └── RecentActivityWidget.tsx
```

---

## 4. WorkoutSessionTracker.tsx (865 líneas)

### Plan de Refactorización

#### Extraer:
- `ExerciseCard.tsx` - Card individual de ejercicio
- `SetTracker.tsx` - Seguimiento de sets
- `RestTimer.tsx` - Timer de descanso
- `useWorkoutSession()` - Hook para estado de sesión

---

## Prioridades de Implementación

### Fase 1 (Inmediato)
1. Extraer constantes de FigOnboardingAssessment
2. Crear tipos compartidos para onboarding

### Fase 2 (Corto plazo)
1. Crear hooks para onboarding
2. Dividir FigOnboardingAssessment en componentes

### Fase 3 (Mediano plazo)
1. Refactorizar training/page.tsx
2. Refactorizar DashboardOverview.tsx

### Fase 4 (Largo plazo)
1. Refactorizar WorkoutSessionTracker
2. Mover templates a base de datos

---

## Guías de Estilo

### Tamaño máximo de archivos
- Componentes: 200-300 líneas máximo
- Hooks: 100 líneas máximo
- Utilidades: 150 líneas máximo

### Estructura de componentes
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Constants
// 4. Helper functions
// 5. Component
// 6. Exports
```

### Nombres de archivos
- Componentes: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase con prefijo use (`useAuth.ts`)
- Utilidades: kebab-case (`date-helpers.ts`)
- Tipos: kebab-case (`user-types.ts`)

---

## Métricas de Éxito

Después de refactorizar:
- [ ] Ningún archivo > 400 líneas
- [ ] Cobertura de tests > 60%
- [ ] Tiempo de build reducido
- [ ] Mejor score en lighthouse

---

## Notas Adicionales

- Hacer refactorizaciones incrementales
- Testear cada cambio antes de continuar
- No mezclar refactorización con nuevas features
- Documentar cambios en los PRs
