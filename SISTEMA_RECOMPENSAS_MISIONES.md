# Sistema de Recompensas y Misiones Diarias

## 📋 Resumen General

El sistema de recompensas y misiones diarias está completamente implementado e integrado con:
- **Misiones diarias** generadas dinámicamente según objetivos del usuario
- **Recompensas XP/Coins** por cada ejercicio completado
- **XP del Hexágono** actualizado automáticamente por eje correspondiente
- **Progresión de niveles** en los 6 ejes del hexágono

---

## 🎯 Componentes del Sistema

### 1. **Misiones Diarias**

#### Generación Automática
Las misiones se generan diariamente basándose en:
- **Objetivo principal del usuario** (goals del assessment)
- **Nivel actual en cada eje del hexágono**
- **Ejes más débiles** (prioriza mejora)

#### Tipos de Misiones (5 por día)
1. **2 Misiones específicas del objetivo** - Alineadas con tu goal (ej: "Build Strength", "Learn Skills")
2. **2 Misiones para ejes débiles** - Enfocadas en tus áreas con menor nivel
3. **1 Misión bonus** - Siempre alcanzable (ej: "Stay hydrated")

#### Recompensas por Misión
- **XP**: 200-350 XP según dificultad
- **Coins**: 80-150 coins según dificultad

#### Ubicación en código:
- **UI**: `apps/web/src/components/dashboard/DailyMissionsPanel.tsx`
- **API GET**: `/api/missions/daily` → Obtiene misiones del día
- **API POST**: `/api/missions/complete` → Completa una misión
- **API POST**: `/api/missions/refresh` → Refresca misiones (cuesta 3 coins)
- **Lógica**: `apps/web/src/lib/exercise-to-axis-mapping.ts` → `generateGoalBasedDailyMissions()`

---

### 2. **Sistema de Recompensas por Ejercicio**

#### Recompensas Automáticas
Cada vez que un usuario completa un ejercicio, **automáticamente recibe**:

1. **XP del Hexágono** (distribuido por ejes)
   - **Eje Principal**: Mayor cantidad de XP
   - **Ejes Secundarios**: Menor cantidad de XP

2. **XP Total** (user.totalXP)
   - Suma de todo el XP del hexágono

3. **Virtual Coins** (user.virtualCoins)
   - Fórmula: **1 coin por cada 10 XP**

#### Tabla de Recompensas XP por Dificultad

| Dificultad | XP Eje Principal | XP Ejes Secundarios |
|------------|------------------|---------------------|
| BEGINNER   | 250              | 100                 |
| INTERMEDIATE | 500            | 200                 |
| ADVANCED   | 1000             | 400                 |
| ELITE      | 2000             | 800                 |

#### Ejemplo Práctico:
```
Ejercicio: Diamond Push-ups (PUSH, INTERMEDIATE)
Recompensas:
  - Hexágono XP:
    * strength: 500 XP (eje principal)
    * staticHolds: 200 XP (eje secundario)
  - Total XP: 700 XP
  - Coins: 70 coins
```

#### Ubicación en código:
- **Sistema de Recompensas**: `apps/web/src/lib/exercise-rewards.ts`
- **API POST**: `/api/training/log-exercise` → Registra ejercicio y da recompensas
- **Mapeo Categorías → Ejes**: `apps/web/src/lib/exercise-to-axis-mapping.ts`

---

### 3. **Mapeo Ejercicios → Ejes del Hexágono**

#### Categorías de Ejercicios y Ejes Principales

| Categoría | Eje Principal | Ejes Secundarios |
|-----------|---------------|------------------|
| PUSH      | strength      | staticHolds      |
| PULL      | strength      | staticHolds      |
| CORE      | core          | balance          |
| BALANCE   | balance       | staticHolds, core |
| STATICS   | staticHolds   | balance, core    |
| LOWER_BODY | endurance    | -                |
| LEGS      | endurance     | -                |
| WARM_UP   | mobility      | -                |
| CARDIO    | endurance     | -                |
| FLEXIBILITY | mobility    | -                |

---

## 🔄 Flujos Completos

### Flujo 1: Completar un Ejercicio

```
Usuario completa ejercicio (ej: "Pull-ups x12")
    ↓
POST /api/training/log-exercise
    { name: "Pull-ups", reps: 12 }
    ↓
Sistema identifica:
    - Categoría: PULL
    - Dificultad: INTERMEDIATE (inferido del nombre)
    ↓
Calcula recompensas:
    - strength XP: 500
    - staticHolds XP: 200
    - Total XP: 700
    - Coins: 70
    ↓
Actualiza BD:
    1. hexagonProfile:
       - strengthXP += 500
       - staticHoldsXP += 200
       - Recalcula strengthLevel y staticHoldsLevel
    2. user:
       - totalXP += 700
       - virtualCoins += 70
    ↓
Retorna recompensas al usuario
```

### Flujo 2: Completar una Sesión de Entrenamiento

```
Usuario termina sesión de FIG Skill Path (ej: Handstand - BEGINNER)
    ↓
PUT /api/training-session/complete
    { sessionId: "..." }
    ↓
Sistema obtiene:
    - skillBranch: "HANDSTAND"
    - xpAwarded: 300 (pre-calculado al crear sesión)
    ↓
Convierte skillBranch a eje del hexágono:
    HANDSTAND → balance
    ↓
Actualiza BD:
    1. trainingSession:
       - status: COMPLETED
       - completedAt: now()
    2. userSkillProgress:
       - sessionsCompleted++
       - totalXPEarned += 300
    3. hexagonProfile:
       - balanceXP += 300
       - Recalcula balanceLevel
    4. user:
       - totalXP += 300
    ↓
Retorna confirmación
```

### Flujo 3: Completar Misión Diaria

```
Usuario hace clic en "Complete" en misión
    ↓
POST /api/missions/complete
    { missionId: "...", userId: "..." }
    ↓
Sistema verifica:
    - Misión existe y no está completada
    - Usuario es el propietario
    ↓
Actualiza BD:
    1. dailyMission:
       - completed: true
       - progress: target
    2. user:
       - totalXP += rewardXP (200-350)
       - virtualCoins += rewardCoins (80-150)
    ↓
Retorna recompensas
```

---

## 📊 Sistema de Niveles del Hexágono

### Umbrales de XP por Nivel

| Nivel | XP Mínimo | XP Máximo | Visual (0-10) |
|-------|-----------|-----------|---------------|
| BEGINNER | 0 | 48,000 | 0 - 2.5 |
| INTERMEDIATE | 48,000 | 144,000 | 2.5 - 5.0 |
| ADVANCED | 144,000 | 384,000 | 5.0 - 7.5 |
| ELITE | 384,000+ | ∞ | 7.5 - 10.0 |

### Progresión de Niveles
El sistema **automáticamente** sube de nivel cuando acumulas suficiente XP:
- XP < 48k → BEGINNER
- 48k ≤ XP < 144k → INTERMEDIATE
- 144k ≤ XP < 384k → ADVANCED
- XP ≥ 384k → ELITE

---

## 🎮 Uso para el Usuario

### Cómo Ganar XP y Coins

#### 1. Completar Ejercicios
```typescript
// Desde cualquier parte de la app
POST /api/training/log-exercise
{
  name: "Push-ups",
  reps: 20,
  // Opcional: category, difficulty
}
```

#### 2. Completar Sesiones de FIG Skill Path
```typescript
// Al terminar una sesión de entrenamiento
PUT /api/training-session/complete
{
  sessionId: "session-id-here"
}
```

#### 3. Completar Misiones Diarias
- Abre el panel de Misiones Diarias
- Completa las actividades
- Haz clic en "Complete"

### Dashboard de Misiones
Muestra en tiempo real:
- **Progreso del día**: X/5 misiones completadas
- **XP ganado hoy**: Total acumulado
- **Coins ganados**: Total acumulado
- **Estado de cada misión**: Pendiente / En progreso / Completada

---

## 🛠️ Archivos Clave

### Sistema de Recompensas
- `apps/web/src/lib/exercise-rewards.ts` - Sistema centralizado de recompensas
- `apps/web/src/lib/exercise-to-axis-mapping.ts` - Mapeo categorías → ejes

### API Endpoints
- `apps/web/src/app/api/training/log-exercise/route.ts` - Registrar ejercicio
- `apps/web/src/app/api/training-session/complete/route.ts` - Completar sesión
- `apps/web/src/app/api/missions/daily/route.ts` - Obtener misiones
- `apps/web/src/app/api/missions/complete/route.ts` - Completar misión
- `apps/web/src/app/api/missions/refresh/route.ts` - Refrescar misiones
- `apps/web/src/app/api/hexagon/add-xp/route.ts` - Añadir XP a hexágono

### UI Components
- `apps/web/src/components/dashboard/DailyMissionsPanel.tsx` - Panel de misiones

---

## 🔧 Mejoras Futuras (Opcional)

### Ideas para Expandir el Sistema

1. **Multiplicador de Rendimiento**
   - Si el usuario supera las expectativas → bonus XP
   - Ya implementado en `exercise-rewards.ts` (`calculatePerformanceMultiplier`)

2. **Streaks (Rachas)**
   - Bonus por completar todas las misiones X días seguidos
   - Campo `dailyStreak` ya existe en User model

3. **Misiones Semanales**
   - Misiones más largas con mayores recompensas
   - Similar a `dailyMission` pero con `weeklyMission` table

4. **Logros/Achievements**
   - Ya existe sistema base en `/api/achievements`
   - Expandir con más logros relacionados a misiones

5. **Leaderboards por XP Ganado**
   - Ya existe `/api/leaderboard`
   - Añadir ranking por XP diario/semanal

---

## ✅ Testing

### Probar el Sistema

#### 1. Probar Recompensas de Ejercicio
```bash
curl -X POST http://localhost:3000/api/training/log-exercise \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "name": "Push-ups",
    "reps": 15
  }'
```

**Resultado esperado:**
- Usuario recibe ~375 XP total
- ~38 coins
- XP se añade al eje `strength`

#### 2. Probar Misiones Diarias
```bash
# Obtener misiones del día
curl http://localhost:3000/api/missions/daily \
  -H "x-user-id: YOUR_USER_ID"

# Completar misión
curl -X POST http://localhost:3000/api/missions/complete \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "missionId": "MISSION_ID_HERE",
    "userId": "YOUR_USER_ID"
  }'
```

#### 3. Verificar Hexágono
```bash
# Ver perfil del hexágono
curl http://localhost:3000/api/user/profile \
  -H "x-user-id: YOUR_USER_ID"
```

---

## 📝 Resumen Ejecutivo

### ✅ Sistema Implementado
- ✅ Misiones diarias dinámicas (basadas en objetivos y nivel)
- ✅ Recompensas XP/Coins por ejercicio
- ✅ XP del hexágono por eje correspondiente
- ✅ Sistema de niveles BEGINNER → ELITE
- ✅ UI completa para misiones
- ✅ APIs funcionales

### 🎯 Cómo Funciona (TL;DR)
1. Usuario hace ejercicio → Recibe XP en eje del hexágono + Coins
2. Usuario completa misión → Recibe XP total + Coins
3. XP acumulado → Sube nivel automáticamente
4. Misiones se regeneran cada día según perfil del usuario

### 💰 Economía del Sistema
- **1 ejercicio BEGINNER** = ~250 XP + ~25 coins
- **1 ejercicio INTERMEDIATE** = ~500 XP + ~50 coins
- **1 ejercicio ADVANCED** = ~1000 XP + ~100 coins
- **1 ejercicio ELITE** = ~2000 XP + ~200 coins
- **1 misión completada** = 200-350 XP + 80-150 coins
- **Refrescar misiones** = -3 coins

### 🚀 Próximos Pasos
El sistema está **completamente funcional**. Para probarlo:
1. Completa un ejercicio usando `/api/training/log-exercise`
2. Verifica tus recompensas en el dashboard
3. Completa misiones diarias en `DailyMissionsPanel`
4. Observa tu progreso en el hexágono

---

*Última actualización: 2025-01-11*
