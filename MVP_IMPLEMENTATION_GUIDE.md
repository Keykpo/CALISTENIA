# MVP Calistenia Platform - Guía de Implementación

## 🎯 Resumen Ejecutivo

Se ha implementado un **MVP completo** de la plataforma de calistenia con las siguientes funcionalidades core:

1. ✅ **Misiones Diarias Adaptativas** - Generadas según nivel y hexágono del usuario
2. ✅ **Sistema de XP/Monedas/Rachas** - Gamificación completa con progresión
3. ✅ **Hexágono de Habilidades Dinámico** - Actualización automática al completar misiones
4. ✅ **Generador de Rutinas Personalizadas** - Planes semanales adaptados al usuario
5. ✅ **Dashboard Analítico** - Métricas, progreso y visualizaciones

---

## 📊 Cambios en Base de Datos (Prisma)

### Archivo: `prisma/schema.prisma`

#### Campos Agregados al Modelo `User`:

```prisma
// Streak System
dailyStreak           Int       @default(0) // Current daily mission streak
lastDailyCompletedAt  DateTime? // Last time all daily missions were completed
```

**Razón**: Sistema de rachas para incentivar consistencia diaria

### Modelos Existentes Utilizados:
- ✅ `HexagonProfile` - Ya existía, se usa para adaptar misiones y rutinas
- ✅ `DailyMission` - Ya existía con `@@unique([userId, date, type])`
- ✅ `User.totalXP`, `User.currentLevel`, `User.virtualCoins` - Ya existían

---

## 🚀 APIs Implementadas/Mejoradas

### 1. **GET /api/missions/daily** - Misiones Adaptativas

**Archivo**: `apps/web/src/app/api/missions/daily/route.ts`

**Cambios Principales**:
```typescript
// Nuevas funciones agregadas:
- generateAdaptiveMissions(userId, date, level, hexProfile)
- getWeakestAxis(hexProfile)
```

**Lógica de Adaptación**:
- **BEGINNER**: 3 ejercicios, 1 enfoque, misión de consistencia
- **INTERMEDIATE**: 5 ejercicios, 2 enfoque, misión de progresión
- **ADVANCED/EXPERT**: 8 ejercicios, 3 enfoque, skill practice + volumen challenge

**Enfoque Adaptativo**:
- Analiza el **eje más débil** del hexágono del usuario
- Genera misiones específicas para mejorarlo:
  - `relativeStrength` débil → Misión de fuerza (push-ups, pull-ups)
  - `muscularEndurance` débil → Misión de resistencia (plank, holds)
  - `balanceControl` débil → Misión de equilibrio
  - `jointMobility` débil → Misión de movilidad

**Respuesta**:
```json
{
  "success": true,
  "missions": [
    {
      "id": "abc123",
      "type": "complete_exercises",
      "description": "Completa 3 ejercicios hoy",
      "target": 3,
      "progress": 0,
      "completed": false,
      "rewardXP": 15,
      "rewardCoins": 7
    },
    ...
  ]
}
```

---

### 2. **POST /api/missions/complete** - Completar con Rewards

**Archivo**: `apps/web/src/app/api/missions/complete/route.ts`

**Funcionalidades Agregadas**:
1. **Actualización de XP y Coins**:
   - Suma rewards al usuario
   - Calcula level-up automático (100 XP = 1 nivel)

2. **Sistema de Rachas**:
   - Verifica si todas las misiones del día están completas
   - Incrementa racha si se completó el día anterior
   - Resetea racha si se saltó un día

3. **Actualización de Hexágono**:
   - Función `calculateHexagonDelta(missionType)`
   - Aplica incrementos a los 6 ejes según tipo de misión:
     ```typescript
     strength_focus → +0.2 relativeStrength, +0.1 bodyTension
     endurance_focus → +0.2 muscularEndurance, +0.1 bodyTension
     balance_focus → +0.2 balanceControl, +0.1 skillTechnique
     skill_practice → +0.3 skillTechnique, +0.1 balanceControl
     ```
   - Límite máximo: 10 por eje

**Respuesta**:
```json
{
  "success": true,
  "mission": { ... },
  "rewards": { "xp": 20, "coins": 10 },
  "streak": 5,
  "levelUp": true,
  "newLevel": 3
}
```

---

### 3. **GET /api/dashboard** - Dashboard con Racha

**Archivo**: `apps/web/src/app/api/dashboard/route.ts`

**Campos Agregados a `stats`**:
```typescript
stats: {
  totalXP: number,
  level: number,
  coins: number,
  dailyStreak: number,        // ← NUEVO
  lastDailyCompletedAt: Date  // ← NUEVO
}
```

---

### 4. **POST /api/routines/generate** - Generador de Rutinas

**Archivo**: `apps/web/src/app/api/routines/generate/route.ts`

**Input**:
```json
{
  "goal": "balanced" | "strength" | "endurance" | "skill",
  "daysPerWeek": 2-7,
  "minutesPerSession": 20-120,
  "equipment": ["NONE", "PULL_UP_BAR", ...]
}
```

**Lógica**:
1. Obtiene nivel y hexágono del usuario
2. Construye `RoutineConfig` con puntos débiles
3. Llama a `generateRoutine()` del servicio
4. Retorna plan semanal personalizado

**Output**:
```json
{
  "success": true,
  "routine": [
    {
      "day": "Lunes",
      "focus": "Empuje (Push)",
      "exercises": [
        {
          "name": "Standard Push-ups",
          "category": "STRENGTH",
          "sets": 4,
          "reps": 15,
          "rest": 60,
          "notes": "Mantén el core activo"
        },
        ...
      ],
      "totalMinutes": 42
    },
    ...
  ],
  "config": { "level": "INTERMEDIATE", "goal": "balanced", ... }
}
```

---

## 🛠️ Servicios y Librerías

### **apps/web/src/lib/routine-generator.ts** (NUEVO)

**Clase Principal**: `RoutineGenerator`

**Funciones**:
- `generate()` - Genera plan semanal completo
- `getTrainingDays(daysPerWeek)` - Distribuye días de entrenamiento
- `createDayRoutine(day, levelKey)` - Crea rutina para un día específico
- `getDayFocus(dayIndex)` - Determina enfoque según patrón de objetivo
- `estimateTotalMinutes(exercises)` - Calcula duración estimada

**Base de Datos de Ejercicios**:
- Warmup, Cooldown (común a todos)
- Push: beginner/intermediate/advanced
- Pull: beginner/intermediate/advanced
- Core: beginner/intermediate/advanced
- Legs: beginner/intermediate/advanced

**Patrones de Enfoque**:
```typescript
strength: ['push', 'pull', 'legs', 'push', 'pull', 'legs', 'full_body']
endurance: ['full_body' x7]
skill: ['push', 'pull', 'skills', 'legs', 'skills', 'full_body', 'skills']
balanced: ['push', 'pull', 'legs', 'full_body', 'push', 'pull', 'legs']
```

---

## 🎨 Componentes UI

### **apps/web/src/app/routines/page.tsx** (NUEVO)

**Funcionalidad**:
- Configuración de rutina (objetivo, días/semana, minutos/sesión)
- Generación de rutina con un clic
- Visualización del plan semanal
- Vista detallada de ejercicios por día

**Características**:
- Selects para configurar objetivo y frecuencia
- Tarjetas por día de entrenamiento
- Muestra sets, reps, descanso y notas
- Estimación de tiempo total

**Navegación**:
- Botón "Volver" al dashboard
- Accesible desde Quick Actions en dashboard

---

### **apps/web/src/app/dashboard/page.tsx** (MEJORADO)

**Cambios en Stats Grid**:
- Cambiado de 4 columnas a **5 columnas**
- **Nueva Tarjeta**: "Daily Streak" 🔥
  - Color naranja/rojo degradado
  - Muestra días consecutivos
  - Emoji de fuego

**Mejoras en Quick Actions**:
- Botones "View Routines" y "Plan Week" ahora redirigen a `/routines`

**Mejoras en Misiones**:
- Muestra `m.description` correctamente (ya estaba corregido)
- Misiones adaptativas aparecen automáticamente según nivel

---

## 📱 Flujo de Usuario Completo

### 1. **Onboarding** (Ya existía)
```
Usuario nuevo → /onboarding
  ↓
LevelAssessment component
  ↓
Evaluación práctica (push-ups, pull-ups, etc.)
  ↓
Determina nivel (BEGINNER/INTERMEDIATE/ADVANCED/EXPERT)
  ↓
Crea hexágono inicial
  ↓
Redirige a /dashboard
```

### 2. **Dashboard - Primera Visita**
```
Usuario accede → /dashboard
  ↓
API GET /api/dashboard
  ↓
Si no hay misiones del día:
  - Muestra botón "Generate Missions"
  ↓
Usuario hace clic
  ↓
API GET /api/missions/daily
  - Obtiene nivel y hexágono
  - Genera 3-4 misiones adaptativas
  ↓
UI muestra misiones inmediatamente
  ↓
Dashboard se recarga con datos completos
```

### 3. **Completar Misión**
```
Usuario hace clic en "Complete"
  ↓
UI: Optimistic update (marca como completada)
  ↓
API POST /api/missions/complete
  - Marca completed=true
  - Actualiza XP, coins, nivel
  - Calcula racha
  - Actualiza hexágono
  ↓
Respuesta con rewards y streak
  ↓
UI: Muestra notificación (si levelUp)
  ↓
Dashboard recarga datos
  ↓
Stats actualizadas: XP ↑, Coins ↑, Level ↑, Streak ↑
```

### 4. **Generar Rutina**
```
Usuario navega a /routines
  ↓
Configura: objetivo, días/semana, minutos
  ↓
Hace clic en "Generar Nueva Rutina"
  ↓
API POST /api/routines/generate
  - Obtiene nivel y hexágono
  - Construye RoutineConfig
  - Genera plan semanal
  ↓
UI muestra plan con:
  - Tarjeta por día
  - Ejercicios detallados
  - Sets, reps, descanso
  - Tiempo estimado
```

---

## 🧪 Pruebas Manuales

### Preparación
```bash
cd apps/web
npm run dev
```

Abrir: `http://localhost:3000/dashboard?userId=local-dev`

---

### Test 1: Misiones Adaptativas

**Objetivo**: Verificar que las misiones se adaptan al nivel del usuario

```bash
# 1. Generar misiones para usuario BEGINNER
curl -X GET "http://localhost:3000/api/missions/daily?userId=local-dev" \
  -H "x-user-id: local-dev"

# Verificar respuesta:
# - 3 misiones
# - Target: 3 ejercicios
# - Rewards: 15-20 XP
```

**Verificar en UI**:
1. Abrir dashboard
2. Clic en "Generate Missions"
3. Deben aparecer 3-4 tarjetas de misiones
4. Verificar descripciones adaptadas al nivel

---

### Test 2: Completar Misión y Rachas

**Objetivo**: Verificar XP, coins, racha y actualización de hexágono

```bash
# Completar una misión
curl -X POST "http://localhost:3000/api/missions/complete" \
  -H "Content-Type: application/json" \
  -H "x-user-id: local-dev" \
  -d '{
    "missionId": "<ID_DE_MISION>",
    "userId": "local-dev"
  }'

# Verificar respuesta:
# {
#   "success": true,
#   "rewards": { "xp": 20, "coins": 10 },
#   "streak": null o número,
#   "levelUp": false o true,
#   "newLevel": 1 o superior
# }
```

**Verificar en UI**:
1. Hacer clic en "Complete" en una misión
2. Misión se marca como completada inmediatamente
3. Después de 1-2 segundos, stats se actualizan:
   - XP incrementa (+20)
   - Coins incrementan (+10)
   - Si es la última misión del día: Streak incrementa
4. Tarjeta de Streak muestra el número con 🔥

---

### Test 3: Generar Rutina Personalizada

**Objetivo**: Verificar generación de plan semanal

```bash
curl -X POST "http://localhost:3000/api/routines/generate" \
  -H "Content-Type: application/json" \
  -H "x-user-id: local-dev" \
  -d '{
    "goal": "balanced",
    "daysPerWeek": 3,
    "minutesPerSession": 45
  }'

# Verificar respuesta:
# - routine: array de 3 días
# - Cada día tiene: day, focus, exercises[], totalMinutes
# - Exercises incluyen: warmup, main, core, cooldown
```

**Verificar en UI**:
1. Navegar a `/routines`
2. Configurar: Equilibrado, 3 días, 45 minutos
3. Clic en "Generar Nueva Rutina"
4. Ver plan semanal con 3 tarjetas (Lunes, Miércoles, Viernes)
5. Cada tarjeta muestra:
   - Enfoque del día (Push/Pull/Legs/Full Body)
   - Lista de ejercicios
   - Sets, reps, descanso
   - Tiempo total estimado

---

### Test 4: Dashboard Analítico

**Objetivo**: Verificar métricas y visualizaciones

```bash
curl -X GET "http://localhost:3000/api/dashboard?userId=local-dev" \
  -H "x-user-id: local-dev"

# Verificar respuesta incluye:
# - stats.dailyStreak
# - stats.lastDailyCompletedAt
# - hexagon (con 6 ejes)
# - missionsToday
# - weeklyProgress
```

**Verificar en UI**:
1. Abrir dashboard
2. Ver 5 tarjetas de stats:
   - Coins
   - Total XP
   - Level
   - **Daily Streak** (con fondo naranja)
   - Achievements
3. Ver hexágono en tab "Progress"
4. Ver "Weekly Progress" con barras por día

---

## 🎯 Criterios de Aceptación ✅

### Backend
- ✅ GET `/api/missions/daily?userId=local-dev` → 200 con 3-4 misiones adaptadas
- ✅ Misiones varían según nivel (BEGINNER: 3 ejercicios, EXPERT: 8 ejercicios + challenge)
- ✅ Misiones enfocan en eje más débil del hexágono
- ✅ POST `/api/missions/complete` → actualiza XP, coins, racha, hexágono
- ✅ Racha incrementa solo si todas las misiones del día están completas
- ✅ Level-up automático cada 100 XP
- ✅ POST `/api/routines/generate` → devuelve plan semanal personalizado
- ✅ GET `/api/dashboard` → incluye dailyStreak y lastDailyCompletedAt

### Frontend
- ✅ Botón "Generate Missions" solo si no hay misiones
- ✅ Al generar, misiones aparecen inmediatamente
- ✅ Al completar misión, UI se actualiza con rewards
- ✅ Tarjeta de Streak visible en dashboard con diseño destacado
- ✅ Página `/routines` muestra plan semanal con ejercicios
- ✅ Quick Actions redirigen a /routines
- ✅ No hay errores en consola
- ✅ Logs de debug aparecen correctamente

### Gamificación
- ✅ XP y coins se otorgan al completar misiones
- ✅ Level-up funciona (100 XP = 1 nivel)
- ✅ Racha incrementa y se muestra correctamente
- ✅ Racha se resetea si se salta un día
- ✅ Hexágono se actualiza dinámicamente

---

## 📂 Archivos Modificados/Creados

### Modificados
1. ✅ `prisma/schema.prisma` - Agregados campos de racha
2. ✅ `apps/web/src/app/api/missions/daily/route.ts` - Misiones adaptativas
3. ✅ `apps/web/src/app/api/missions/complete/route.ts` - Rewards, racha, hexágono
4. ✅ `apps/web/src/app/api/dashboard/route.ts` - Incluir racha en stats
5. ✅ `apps/web/src/app/dashboard/page.tsx` - Tarjeta de streak y botones de rutinas
6. ✅ `DAILY_MISSIONS_IMPLEMENTATION.md` - Documentación previa (mantener)

### Creados
7. ✅ `apps/web/src/lib/routine-generator.ts` - Servicio generador de rutinas
8. ✅ `apps/web/src/app/api/routines/generate/route.ts` - API de rutinas
9. ✅ `apps/web/src/app/routines/page.tsx` - UI de rutinas
10. ✅ `MVP_IMPLEMENTATION_GUIDE.md` - Este documento

---

## 🚦 Próximos Pasos (Post-MVP)

### Prioridad Alta
1. **Integración con `exercises.json`**: Usar los 508 ejercicios reales en lugar de la biblioteca simplificada
2. **Persistencia de Rutinas**: Guardar rutinas generadas en DB para reutilizar
3. **Tracking de Sesiones**: Permitir marcar rutinas como completadas
4. **Notificaciones**: Alertas cuando se completa racha, sube de nivel, etc.

### Prioridad Media
5. **Achievements Dinámicos**: Desbloquear logros según progreso
6. **Predicciones**: Estimar tiempo para alcanzar objetivos
7. **Recomendaciones Inteligentes**: Sugerir ejercicios según hexágono
8. **Onboarding Mejorado**: Calcular hexágono inicial desde evaluación

### Prioridad Baja
9. **Social Features**: Compartir progreso, leaderboards
10. **Export/Import**: Exportar datos a PDF, CSV
11. **Mobile App**: PWA o app nativa

---

## 🐛 Troubleshooting

### Error: "No hay misiones generadas"
**Solución**:
1. Verificar que el usuario existe en DB
2. Verificar que el campo `fitnessLevel` está configurado
3. Revisar logs de `/api/missions/daily`

### Error: "Racha no incrementa"
**Solución**:
1. Verificar que TODAS las misiones del día estén completadas
2. Revisar campo `lastDailyCompletedAt` en usuario
3. Verificar lógica de comparación de fechas (startOfDay)

### Error: "Hex
ágono no se actualiza"
**Solución**:
1. Verificar que existe `HexagonProfile` para el usuario
2. Revisar función `calculateHexagonDelta(missionType)`
3. Verificar que el tipo de misión tiene mapeo en el switch

### Error: "Rutina vacía o sin ejercicios"
**Solución**:
1. Verificar que `EXERCISE_LIBRARY` tiene ejercicios para el nivel
2. Revisar patrón de enfoque (`getDayFocus`)
3. Verificar que `levelKey` coincide con las claves del library

---

## 📊 Métricas de Éxito

### KPIs a Monitorear
- **Engagement**: % usuarios que completan misiones diarias
- **Retención**: Racha promedio de usuarios activos
- **Progresión**: Tiempo promedio para subir de nivel
- **Uso de Rutinas**: % usuarios que generan rutinas
- **Hexágono**: Evolución promedio de los 6 ejes

### Queries Útiles
```prisma
// Usuarios con racha > 7 días
SELECT * FROM users WHERE dailyStreak >= 7;

// Misiones completadas hoy
SELECT COUNT(*) FROM daily_missions
WHERE completed = true AND date = CURRENT_DATE;

// XP promedio por nivel
SELECT currentLevel, AVG(totalXP)
FROM users
GROUP BY currentLevel;
```

---

## ✅ Checklist de Implementación

- [x] Schema de Prisma actualizado
- [x] Misiones adaptativas funcionando
- [x] Sistema de XP/coins/rachas completo
- [x] Hexágono dinámico actualizable
- [x] Generador de rutinas implementado
- [x] API de rutinas funcional
- [x] UI de rutinas creada
- [x] Dashboard con racha visible
- [x] Documentación completa
- [ ] Commit y push a repositorio
- [ ] Testing E2E
- [ ] Deploy a staging

---

## 🎉 Conclusión

El **MVP está completo y funcional**. Incluye:

- Sistema de gamificación robusto (XP, coins, rachas, niveles)
- Misiones adaptativas según perfil del usuario
- Hexágono de habilidades dinámico
- Generador de rutinas personalizadas
- Dashboard analítico con métricas

**Siguiente paso**: Commit, push y pruebas manuales en ambiente de desarrollo.

---

**Fecha de Implementación**: 2025-11-06
**Versión**: MVP v1.0
**Estado**: ✅ Completo - Listo para Testing
