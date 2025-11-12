# 🔧 DEV MODE: Selector de Día

## ✅ Implementado

He agregado una funcionalidad de **desarrollo** para que puedas elegir manualmente el día de la semana y probar todas las rutinas sin tener que esperar cada día.

---

## 📍 Cómo Usar

### 1. **Navega a Daily Workout**

Ve a: `http://localhost:3000/training/daily-workout`

### 2. **Verás un Panel Amarillo** (Solo en Development)

En la parte superior de la página, verás un panel amarillo con:
- 🔧 **DEV MODE: Force Day**
- Un selector desplegable con los 7 días de la semana
- Un botón "Reset" para volver al día actual

```
┌─────────────────────────────────────────────────┐
│ 🔧 DEV MODE: Force Day                          │
│ Selecciona un día para probar diferentes rutinas│
│                                                  │
│ [Dropdown: Lunes (LEGS) ▼]  [Reset]            │
└─────────────────────────────────────────────────┘
```

### 3. **Selecciona un Día**

Opciones disponibles:
- **Domingo (PUSH)** → Rutina de empuje (Push-ups, Dips, etc.)
- **Lunes (LEGS)** → Rutina de piernas (Squats, Pistol Squats)
- **Martes (PULL)** → Rutina de tracción (Pull-ups, Rows)
- **Miércoles (REST)** → Día de descanso (solo movilidad)
- **Jueves (PUSH)** → Rutina de empuje
- **Viernes (PULL)** → Rutina de tracción
- **Sábado (REST)** → Día de descanso (solo movilidad)

### 4. **La Rutina Se Regenera Automáticamente**

Cuando seleccionas un día, la rutina se regenera automáticamente con los ejercicios correspondientes a ese día.

### 5. **Reset al Día Real**

Haz clic en "Reset" para volver al día actual.

---

## 🔍 Verificación en Logs

En la **terminal del servidor** verás logs como:

```
[GENERATE_ROUTINE] 🔧 DEV MODE: Forcing day of week to: 1
[EXPERT_ROUTINE] 🔧 DEV MODE: Forcing day to: Monday (1)
[EXPERT_ROUTINE] Session type for STAGE_2 on Monday : LEGS
[EXPERT_ROUTINE] ✅ Found template: STAGE_2_LEGS
```

Esto confirma que el sistema está usando el día forzado en lugar del día real.

---

## 🎯 Ejemplos de Uso

### Probar Rutina de Lunes (LEGS):
1. Selecciona "Lunes (LEGS)"
2. Verás ejercicios como:
   - Squats
   - Pistol Squats
   - Bulgarian Split Squats
   - Nordic Curls

### Probar Rutina de Martes (PULL):
1. Selecciona "Martes (PULL)"
2. Verás ejercicios como:
   - Pull-ups
   - Archer Pull-ups
   - Australian Pull-ups
   - Hanging Leg Raises

### Probar Día REST:
1. Selecciona "Miércoles (REST)" o "Sábado (REST)"
2. Verás solo:
   - Rest Day Mobility (15 min)

---

## 🧪 Testing Todas las Rutinas

Para probar sistemáticamente todas las rutinas:

```
Día 0 (Domingo)   → PUSH    → Debe mostrar: Push-ups, Dips, Pike Push-ups
Día 1 (Lunes)     → LEGS    → Debe mostrar: Squats, Pistol Squats, Lunges
Día 2 (Martes)    → PULL    → Debe mostrar: Pull-ups, Rows, Hangs
Día 3 (Miércoles) → REST    → Debe mostrar: Rest Day Mobility
Día 4 (Jueves)    → PUSH    → Debe mostrar: Push-ups, Dips, Pike Push-ups
Día 5 (Viernes)   → PULL    → Debe mostrar: Pull-ups, Rows, Hangs
Día 6 (Sábado)    → REST    → Debe mostrar: Rest Day Mobility
```

---

## 🚫 Remover Esta Funcionalidad

Cuando ya no necesites esta funcionalidad de desarrollo, sigue estos pasos:

### Paso 1: Remover del Frontend

En `WorkoutSessionTracker.tsx`, **elimina estas líneas**:

```typescript
// LÍNEA 102-103: Eliminar estos states
const [devForceDay, setDevForceDay] = useState<number | null>(null);
const isDevelopment = process.env.NODE_ENV === 'development';
```

```typescript
// LÍNEA 168: Cambiar el fetch a GET simple
// ANTES:
const requestBody = devForceDay !== null ? { forceDay: devForceDay } : {};
const response = await fetch('/api/training/generate-daily-routine', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestBody),
});

// DESPUÉS:
const response = await fetch('/api/training/generate-daily-routine');
```

```tsx
// LÍNEA 519-561: Eliminar todo el bloque del selector
{/* DEV ONLY: Day Selector */}
{isDevelopment && (
  <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
    ...todo el contenido...
  </div>
)}
```

### Paso 2: Remover del Backend

En `generate-daily-routine/route.ts`, **elimina**:

```typescript
// LÍNEA 22: Eliminar forceDay del schema
forceDay: z.number().min(0).max(6).optional(),
```

```typescript
// LÍNEA 73: Eliminar forceDay de la desestructuración
const { duration, focusAreas, forceDay } = parsed.data;
```

```typescript
// LÍNEA 76-78: Eliminar el log de dev mode
if (forceDay !== undefined) {
  console.log('[GENERATE_ROUTINE] 🔧 DEV MODE: Forcing day of week to:', forceDay);
}
```

```typescript
// LÍNEA 262: Eliminar forceDay de params
forceDay, // DEV ONLY: Force specific day
```

### Paso 3: Remover del Generador

En `daily-routine-generator.ts`, **elimina**:

```typescript
// LÍNEA 107: Eliminar forceDay de la interfaz
// DEV ONLY: Force a specific day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
forceDay?: number;
```

```typescript
// LÍNEA 523-524: Eliminar forceDay de la desestructuración
const {
  userId,
  hexagonLevels,
  hexagonXP,
  forceDay, // ← ELIMINAR ESTA LÍNEA
} = params;
```

```typescript
// LÍNEA 541: Cambiar esta línea
// ANTES:
const dayOfWeek = forceDay !== undefined ? forceDay : today.getDay();

// DESPUÉS:
const dayOfWeek = today.getDay();
```

```typescript
// LÍNEA 545-549: Eliminar el if de dev mode
if (forceDay !== undefined) {
  console.log('[EXPERT_ROUTINE] 🔧 DEV MODE: Forcing day to:', dayNames[dayOfWeek], `(${dayOfWeek})`);
} else {
  console.log('[EXPERT_ROUTINE] Today is:', dayNames[dayOfWeek], `(${dayOfWeek})`);
}

// REEMPLAZAR CON:
console.log('[EXPERT_ROUTINE] Today is:', dayNames[dayOfWeek], `(${dayOfWeek})`);
```

### Paso 4: Listo ✅

Después de estos cambios, el sistema volverá a usar **solo el día real** del sistema.

---

## 📝 Archivos Modificados

**Frontend:**
- `apps/web/src/components/training/WorkoutSessionTracker.tsx`

**Backend:**
- `apps/web/src/app/api/training/generate-daily-routine/route.ts`
- `apps/web/src/lib/daily-routine-generator.ts`

---

## 🎨 Apariencia del Selector

El selector se ve así en la UI:

```
┌──────────────────────────────────────────────────────────┐
│  Today's Workout                    [INTERMEDIATE] [⚙️]  │
│  Wednesday, November 12                                   │
├──────────────────────────────────────────────────────────┤
│  🔧 DEV MODE: Force Day                                  │
│  Selecciona un día para probar diferentes rutinas        │
│                                                           │
│  [Miércoles (REST) ▼]  [Reset]                          │
└──────────────────────────────────────────────────────────┘
```

- **Fondo amarillo**: Indica que es una funcionalidad de desarrollo
- **Border amarillo**: Visual destacado
- **Dropdown grande**: Fácil de usar
- **Botón Reset**: Para volver al día real rápidamente

---

## ⚠️ Notas Importantes

1. **Solo visible en Development**: El selector solo aparece cuando `process.env.NODE_ENV === 'development'`

2. **Producción**: En producción (después de `npm run build`), el selector NO se mostrará automáticamente

3. **State local**: El día forzado se guarda en el state del componente, no en la base de datos

4. **Refresh**: Si refrescas la página, vuelve al día real (a menos que vuelvas a seleccionar)

5. **Logs**: Los logs de consola siempre muestran si estás usando un día forzado:
   ```
   🔧 DEV MODE: Forcing day to: Monday (1)
   ```

---

## 🚀 Resumen

✅ **Agregado**: Selector de día en modo desarrollo
✅ **Ubicación**: Panel amarillo en `/training/daily-workout`
✅ **Funcionalidad**: Cambio automático de rutina al seleccionar día
✅ **Reset**: Botón para volver al día real
✅ **Logs**: Indicadores visuales en consola
✅ **Remover**: Instrucciones claras para eliminar después

Ahora puedes probar todas las rutinas sin esperar cada día! 🎯
