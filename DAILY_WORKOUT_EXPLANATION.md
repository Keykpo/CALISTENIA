# 🏋️ Explicación del Sistema Daily Workout

## 🔄 Flujo Completo

```
1. Usuario visita: /training/daily-workout
   ↓
2. WorkoutSessionTracker se monta
   ↓
3. Llama a: GET /api/training/generate-daily-routine
   ↓
4. API verifica si existe rutina de HOY en DB
   ↓
5. Si NO existe → Genera nueva rutina:
   - Obtiene perfil del usuario (hexagon + skills + equipment)
   - Calcula Training Stage (STAGE_1, STAGE_2, STAGE_3, STAGE_4)
   - Determina día de la semana (0-6)
   - Busca template: `{STAGE}_{SESSION_TYPE}`
   - Convierte template a rutina
   - Calcula XP y coins
   - Guarda en DB
   ↓
6. Devuelve rutina al frontend
   ↓
7. WorkoutSessionTracker muestra los ejercicios
```

---

## 🎯 Cálculo del Training Stage

El sistema calcula tu **Stage** basándose en tus niveles de hexágono:

```typescript
function calculateUserStage(data):
  strengthLevel = hexagonLevels.strength
  strengthXP = hexagonXP.strength
  balanceLevel = hexagonLevels.balance
  staticHoldsLevel = hexagonLevels.staticHolds

  // Lógica de decisión:
  if (balanceLevel === 'ELITE' || staticHoldsLevel === 'ELITE'):
    return 'STAGE_4'

  if (strengthLevel === 'ADVANCED' || strengthLevel === 'ELITE'):
    return 'STAGE_3'

  if (strengthLevel === 'INTERMEDIATE'):
    return 'STAGE_2'

  return 'STAGE_1'
```

### Tu Perfil Actual:

Según los logs, tu perfil es:
- **Strength**: INTERMEDIATE (2.94/10)
- **Balance**: INTERMEDIATE (2.68/10)
- **StaticHolds**: INTERMEDIATE (2.55/10)

**Tu Stage calculado**: `STAGE_2` (Intermedio)

---

## 📅 Patrones Semanales

Cada Stage tiene un patrón diferente de días:

### STAGE_1 (Principiante):
```
Domingo (0)  → PUSH
Lunes (1)    → PULL
Martes (2)   → PUSH
Miércoles (3)→ REST
Jueves (4)   → PULL
Viernes (5)  → PUSH
Sábado (6)   → REST
```

### STAGE_2 (Intermedio - TU STAGE):
```
Domingo (0)  → PUSH
Lunes (1)    → LEGS
Martes (2)   → PULL
Miércoles (3)→ REST  ← Solo "Rest Day Mobility"
Jueves (4)   → PUSH
Viernes (5)  → PULL
Sábado (6)   → REST  ← Solo "Rest Day Mobility"
```

### STAGE_3 (Avanzado):
```
Domingo (0)  → WEIGHTED_PUSH
Lunes (1)    → LEGS
Martes (2)   → WEIGHTED_PULL
Miércoles (3)→ REST
Jueves (4)   → WEIGHTED_PUSH
Viernes (5)  → WEIGHTED_PULL
Sábado (6)   → REST
```

---

## 🛌 Días REST

Cuando el sistema detecta un día REST:

```typescript
if (sessionType === 'REST') {
  return {
    totalDuration: 15,
    phases: [{
      phase: "WARMUP",
      duration: 15,
      exercises: [{
        name: "Rest Day Mobility",
        sets: 1,
        repsOrTime: 900, // 15 minutos
        notes: "Light mobility work, stretching, or active recovery"
      }]
    }],
    estimatedXP: 50,
    estimatedCoins: 5
  }
}
```

**Esto es CORRECTO** - Los días REST solo deben tener movilidad ligera.

---

## 🔍 Por Qué Solo Ves "Rest Day Mobility"

Hay **3 posibles razones**:

### 1. **Hoy es día REST (Miércoles o Sábado)**
   - **Solución**: Espera hasta mañana o cambia la fecha del sistema para probar

### 2. **El template no existe**
   - El sistema busca: `STAGE_2_PUSH`, `STAGE_2_PULL`, `STAGE_2_LEGS`
   - Si no encuentra el template, cae en fallback
   - **Problema**: Faltan templates en `expert-routine-templates.ts`

### 3. **Error en la búsqueda del template**
   - El código busca el template por clave: `{STAGE}_{SESSION_TYPE}`
   - Si la clave no coincide exactamente, no lo encuentra

---

## 🐛 Debug: Cómo Identificar el Problema

### Paso 1: Ver los logs en consola

Abre la consola del navegador (F12) y busca estos logs:

```
[EXPERT_ROUTINE] ===== EXPERT TEMPLATE ROUTINE GENERATION =====
[EXPERT_ROUTINE] User Stage: STAGE_X
[EXPERT_ROUTINE] Day of week: X | Session type: PUSH/PULL/LEGS/REST
```

### Paso 2: Ver los logs del servidor

En la terminal donde corre `npm run dev`, busca:

```
[GENERATE_ROUTINE] Generating routine for user: ...
[GENERATE_ROUTINE] User found: ...
[GENERATE_ROUTINE] ✅ Routine generated: ...
```

### Paso 3: Si NO ves los logs [EXPERT_ROUTINE]

Significa que:
- La API no se está llamando
- O el generador no se está ejecutando

---

## 🔧 Solución Temporal: Force Logs

Voy a agregar más logs de debug al generador para ver exactamente qué está pasando.

---

## ✅ Lo Que DEBERÍA Pasar

Si hoy es **lunes** y eres **STAGE_2**:

1. Sistema detecta: `dayOfWeek = 1` (lunes)
2. Busca patrón para STAGE_2: `pattern[1] = 'LEGS'`
3. Busca template: `STAGE_2_LEGS`
4. Genera rutina de piernas con:
   - WARMUP (10 min)
   - FUNDAMENTAL_STRENGTH (35 min) - Sentadillas, Pistol Squats, etc.
   - COOLDOWN (5 min)
5. Calcula XP y coins
6. Muestra rutina en el frontend

---

## 📊 Verificación Rápida

### ¿Qué día es hoy?

JavaScript usa: `new Date().getDay()`
- 0 = Domingo
- 1 = Lunes
- 2 = Martes
- 3 = Miércoles ← REST
- 4 = Jueves
- 5 = Viernes
- 6 = Sábado ← REST

### Si hoy es miércoles o sábado:

**ES CORRECTO** que solo veas "Rest Day Mobility". Los días REST son para recuperación, no entrenamiento intenso.

---

## 🚀 Próximos Pasos

1. **Verifica qué día es hoy**: Si es REST day, espera hasta mañana
2. **Revisa los logs**: F12 en el navegador y busca `[EXPERT_ROUTINE]`
3. **Prueba en otro día**: Cambia la fecha del sistema si es REST day
4. **Revisa templates**: Ver si existen todos los templates necesarios

Voy a agregar más logs ahora para ayudar a debuggear...
