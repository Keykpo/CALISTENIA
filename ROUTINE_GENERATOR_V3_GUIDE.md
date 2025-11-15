# 🎯 Routine Generator V3 - Guía Completa

## 📚 Filosofía del Sistema

El nuevo generador V3 implementa fielmente los principios de la **Guía de Progresión Experta de Calistenia**, corrigiendo todos los desajustes del sistema anterior.

---

## 🔑 Conceptos Fundamentales

### **MODO 1: Adquisición de Habilidad (Práctica de Calidad)**
- **Objetivo**: Aprender habilidades neurológicamente complejas (Planche, Handstand, Levers)
- **Método**: Entrenamiento CON BÚFER - **EVITAR EL FALLO**
- **Justificación**: Al evitar el fallo, el sistema nervioso permanece fresco, permitiendo más series de práctica perfecta
- **Ejemplo**: Planche Straddle holds - 5 series de 5-10s, dejando 2-3s en el tanque

### **MODO 2: Construcción de Fundación (Fuerza/Hipertrofia)**
- **Objetivo**: Construir capacidad de fuerza base y masa muscular (el "motor")
- **Método**: Entrenamiento **AL FALLO** o cerca del fallo
- **Justificación**: Para movimientos fundamentales, llevar el músculo al fallo es un estímulo potente para fuerza e hipertrofia
- **Ejemplo**: Weighted Dips - 3 series de 8-10 reps hasta el fallo

---

## 📊 Progresión por Etapas

### **ETAPA 1-2: Fundación (Principiante/Intermedio)**
**Criterio de Entrada**:
- Incapaz de hacer pull-ups o dips sin asistencia
- **O** Puede hacer 1-12 pull-ups y 1-15 dips

**Enfoque del Programa**:
- ✅ 100% MODO 2 (Fallo)
- ✅ Dominar ejercicios fundamentales: Pull-ups, Dips, Push-ups
- ✅ Split: Push / Legs / Pull / Rest / Push / Pull / Rest

**Filosofía**: "Reps till failure" para construir capacidad base

---

### **ETAPA 3: Avanzado (Fuerza con Lastre)**
**Criterio de Entrada**:
- 12+ Pull-ups **Y** 15+ Dips

**Enfoque del Programa**:
- ✅ Introducir lastre (Weighted Calisthenics)
- ✅ Este es el "secreto" para desbloquear habilidades de élite
- ✅ Split: Weighted Push / Legs / Weighted Pull / Rest / Weighted Push / Weighted Pull / Rest

**Ejercicios Clave**: Weighted Dips, Weighted Pull-ups

---

### **ETAPA 4: Élite (Especialización en Habilidad)**
**Criterio de Entrada**:
- 10+ Pull-ups con +25% peso corporal **O** 10+ Dips con +40% peso corporal

**Enfoque del Programa**:
- ✅ **BIFURCACIÓN DEL ENTRENAMIENTO**
- ✅ Días de "Skills + Weighted" (Habilidades + Lastre)
- ✅ Practica Habilidades (Modo 1, con búfer) **Y** mantiene Fuerza (Modo 2, con lastre)

**Split**: Skills Push / Legs / Skills Pull / Rest / Skills Push / Skills Pull / Rest

---

## 🏗️ Estructura de Sesión (Etapa 4)

### FASE 1: Calentamiento (10-15 min) - OBLIGATORIO
**Específico según tipo de sesión:**

**Para sesiones PUSH:**
- ✅ Movilidad de Muñecas (Círculos, Inclinaciones, Elevaciones)
- ✅ Fortalecimiento: Palm Push-ups, Wrist Push-ups
- ✅ Activación Escapular: Scapula Push-ups

**Para sesiones PULL:**
- ✅ Movilidad de Hombros (Rotaciones, Círculos de brazos)
- ✅ Activación: Scapula Pull-ups
- ✅ Descompresión: Dead Hang

---

### FASE 2: Práctica de Habilidad (20-30 min) - **MODO 1**
**Objetivo**: Aprendizaje motor (neurológico)

**Ejemplos:**
- Handstand: 5 series de 30s
- Planche Straddle: 5 series de 5-10s

**⚠️ CRÍTICO**:
- Usar búfer (dejar 2-3 segundos/reps en el tanque)
- NO entrenar al fallo
- Más series de práctica perfecta > Menos series al fallo

---

### FASE 3: Fuerza de Soporte (15 min) - **MODO 2**
**Objetivo**: Fuerza específica de habilidad

**Ejemplos:**
- Pseudo Planche Push-ups: 3 series de 8-12 reps (cerca del fallo)
- Pike Push-ups: 3 series de 10-12 reps

---

### FASE 4: Fuerza Fundamental (20 min) - **MODO 2**
**Objetivo**: Fuerza bruta/hipertrofia

**Ejemplos:**
- Weighted Dips: 2 series de 8-10 reps (al fallo)
- Dumbbell Bench: 2 series de 8-10 reps

---

### FASE 5: Enfriamiento (5 min)
- Estiramientos estáticos
- Recuperación y flexibilidad

---

## 🚪 Sistema de Gating (Prevención de Lesiones)

**Vías de Habilidad BLOQUEADAS hasta cumplir requisitos:**

| Habilidad | Requisito Previo |
|-----------|-----------------|
| **Planche** | Etapa 3+ (15+ Dips sin lastre) |
| **Front Lever** | 8+ Pull-ups |
| **One-Arm Pull-up** | 15-20 Pull-ups limpios |
| **HSPU** | Dominar Pike Push-ups elevados (20+ push-ups) |
| **Muscle-up** | 10+ Pull-ups Y 10+ Dips **O** Weighted pull-ups |

**Justificación**: Empezar antes es receta para lesiones (especialmente muñecas para Planche).

---

## 💻 Uso del Código

### Ejemplo Básico (Etapa 1-2)

```typescript
import { generateRoutineV3, RoutineConfig } from './routine-generator-v3';
import exercisesData from './data/exercises.json';

const config: RoutineConfig = {
  userId: 'user123',
  level: 'BEGINNER',
  stage: 'STAGE_1_2', // Se determina automáticamente
  daysPerWeek: 3,
  minutesPerSession: 60,
  equipment: ['NONE', 'PULL_UP_BAR'],

  // Métricas de fuerza
  pullUpsMax: 5,
  dipsMax: 0,
  pushUpsMax: 15,
};

const routines = generateRoutineV3(config, exercisesData);

// routines[0] será:
// - Día: Monday
// - Tipo: PUSH
// - Fases: [Warm-Up, Foundation Strength, Core, Cool-Down]
// - Todos los ejercicios en MODO 2 (al fallo)
```

---

### Ejemplo Avanzado (Etapa 4)

```typescript
const config: RoutineConfig = {
  userId: 'elite-user',
  level: 'ADVANCED',
  stage: 'STAGE_4',
  daysPerWeek: 5,
  minutesPerSession: 70,
  equipment: ['PULL_UP_BAR', 'PARALLEL_BARS', 'RINGS'],

  // Métricas de fuerza para gating
  pullUpsMax: 18,
  dipsMax: 20,
  pushUpsMax: 40,
  weightedPullUps: 20, // +20kg
  weightedDips: 30,    // +30kg

  // Objetivos de maestría
  masteryGoals: ['PLANCHE', 'FRONT_LEVER', 'HANDSTAND'],
};

const routines = generateRoutineV3(config, exercisesData);

// routines[0] será:
// - Día: Monday
// - Tipo: SKILLS_PUSH
// - Fases: [
//     Warm-Up (muñecas + hombros),
//     Skill Practice (Planche - MODO 1 con búfer),
//     Skill Support (Pseudo Planche Push-ups - MODO 2),
//     Fundamental Strength (Weighted Dips - MODO 2),
//     Cool-Down
//   ]
```

---

## 🔍 Diferencias Clave vs V2

| Aspecto | V2 (Antiguo) | V3 (Nuevo) |
|---------|-------------|-----------|
| **Filosofía** | Todo genérico | Modo 1 vs Modo 2 |
| **Splits** | Por "goal" | Por etapa de entrenamiento |
| **Calentamiento** | Random genérico | Específico (muñecas/hombros) |
| **Habilidades** | Sin búfer | CON BÚFER (Modo 1) |
| **Gating** | ❌ No existe | ✅ Previene lesiones |
| **Estructura** | Genérica | Sigue guía experta |
| **Categorías** | ❌ Bug ('STRENGTH') | ✅ Correctas ('PUSH'/'PULL') |

---

## ⚠️ Cambios que Rompen Compatibilidad

1. **SessionType**: Ahora incluye 'SKILLS_PUSH' y 'SKILLS_PULL'
2. **WorkoutRoutine**: Ahora tiene `phases` en lugar de `exercises` plano
3. **RoutineExercise**: Incluye `mode`, `buffer`, `targetIntensity`
4. **Nuevo**: `SkillGatingSystem` para verificar acceso a habilidades

---

## 📈 Beneficios del Nuevo Sistema

1. ✅ **Previene lesiones** con gating y calentamiento específico
2. ✅ **Optimiza aprendizaje motor** con Modo 1 (búfer en habilidades)
3. ✅ **Maximiza fuerza** con Modo 2 (fallo en fundamentos)
4. ✅ **Progresión científica** por etapas
5. ✅ **Splits correctos** según nivel de entrenamiento
6. ✅ **Educativo** - Explica el "por qué" de cada ejercicio

---

## 🎓 Recursos Adicionales

- **Guía de Progresión Completa**: Ver `GUIA PROGRESION EJERCICIOS/Calistenia_ Guía de Progresión y Aplicación.pdf`
- **FIG Level Progressions**: Ver `fig-level-progressions.ts`
- **Assessment Logic**: Ver `assessment-d-s-logic.ts`

---

## 🚀 Próximos Pasos

1. ✅ Implementar en la API
2. ✅ Actualizar UI para mostrar fases
3. ✅ Agregar tooltips explicando Modo 1 vs Modo 2
4. ✅ Dashboard mostrando progreso en gating
5. ✅ Notificaciones cuando se desbloquean nuevas habilidades
