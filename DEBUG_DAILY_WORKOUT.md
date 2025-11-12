# 🐛 Debug: Por Qué Solo Ves "Rest Day Mobility"

## ✅ He Agregado Logs de Debug

Acabo de agregar más logs al sistema para identificar el problema. Ahora verás estos mensajes en la **consola del servidor** (terminal):

```
[EXPERT_ROUTINE] ===== EXPERT TEMPLATE ROUTINE GENERATION =====
[EXPERT_ROUTINE] User Stage: STAGE_2
[EXPERT_ROUTINE] Hexagon Levels: { balance: 'INTERMEDIATE', strength: 'INTERMEDIATE', ... }
[EXPERT_ROUTINE] Hexagon XP: { balance: 55000, strength: 65000, ... }
[EXPERT_ROUTINE] Today is: Tuesday (2)
[EXPERT_ROUTINE] Session type for STAGE_2 on Tuesday : PULL
[EXPERT_ROUTINE] Looking for template with key: STAGE_2_PULL
[EXPERT_ROUTINE] Available templates: [...]
[EXPERT_ROUTINE] ✅ Found template: STAGE_2_PULL
[EXPERT_ROUTINE] Template info: { stage: 'STAGE_2', sessionType: 'PULL', ... }
[EXPERT_ROUTINE] Philosophy: Build pull strength...
```

---

## 🔍 Cómo Verificar el Problema

### Paso 1: Abre la App

Navega a: `http://localhost:3000/training/daily-workout`

### Paso 2: Abre la Consola del Navegador

- **Chrome/Edge**: Presiona `F12` o `Ctrl + Shift + I`
- **Firefox**: Presiona `F12`

### Paso 3: Revisa la Terminal del Servidor

Mira la terminal donde está corriendo `npm run dev`

### Paso 4: Busca los Logs

Busca mensajes que empiecen con `[EXPERT_ROUTINE]`

---

## 📊 Posibles Escenarios

### Escenario 1: HOY ES DÍA REST ✅ (CORRECTO)

**Si ves estos logs:**
```
[EXPERT_ROUTINE] Today is: Wednesday (3)
[EXPERT_ROUTINE] Session type for STAGE_2 on Wednesday : REST
[EXPERT_ROUTINE] REST day - generating light mobility routine
```

**Significado**: ¡TODO ESTÁ BIEN! Los días REST (miércoles y sábado) solo deben tener movilidad ligera.

**Solución**: Espera hasta mañana o cambia la fecha del sistema para probar:

```javascript
// En la consola del navegador:
Date.prototype.getDay = function() { return 1; } // Forzar que sea lunes
location.reload();
```

---

### Escenario 2: NO SE ENCUENTRA EL TEMPLATE ❌

**Si ves estos logs:**
```
[EXPERT_ROUTINE] Session type for STAGE_2 on Monday : LEGS
[EXPERT_ROUTINE] Looking for template with key: STAGE_2_LEGS
[EXPERT_ROUTINE] ❌ No template found for: STAGE_2_LEGS
```

**Problema**: El template no existe o no está registrado correctamente.

**Solución**: Verificar que el template existe en `expert-routine-templates.ts`

---

### Escenario 3: NO SE EJECUTA EL GENERADOR ❌

**Si NO ves NINGÚN log `[EXPERT_ROUTINE]`:**

**Problema**: La API no está llamando al generador, o hay un error antes.

**Busca logs de:**
```
[GENERATE_ROUTINE] Generating routine for user: ...
[GENERATE_ROUTINE] User found: ...
```

**Posibles causas:**
1. El usuario no está autenticado
2. El usuario no tiene hexagon profile
3. Error en la lectura de la base de datos
4. Error en exercises.json

---

## 🛠️ Testing Manual

### Forzar un día específico

Puedes forzar que el sistema piense que es un día específico:

1. Abre la consola del navegador (F12)
2. Ejecuta este código:

```javascript
// Forzar que sea LUNES (día 1)
Date.prototype.getDay = function() { return 1; }
location.reload();
```

**Días disponibles:**
- 0 = Domingo → PUSH
- 1 = Lunes → LEGS
- 2 = Martes → PULL
- 3 = Miércoles → REST
- 4 = Jueves → PUSH
- 5 = Viernes → PULL
- 6 = Sábado → REST

### Verificar tu Stage

En la consola del servidor, busca:

```
[EXPERT_ROUTINE] User Stage: STAGE_X
```

Tu Stage actual debería ser `STAGE_2` (Intermedio).

---

## 📋 Checklist de Verificación

- [ ] ¿Qué día es hoy? (Verifica si es REST)
- [ ] ¿Ves los logs `[EXPERT_ROUTINE]` en la terminal?
- [ ] ¿Qué Stage calculó el sistema?
- [ ] ¿Qué Session Type determinó?
- [ ] ¿Encontró el template correspondiente?
- [ ] ¿Hay errores en la conversión del template?

---

## 🎯 Próximos Pasos

1. **Refresca la página**: `http://localhost:3000/training/daily-workout`
2. **Revisa los logs**: Terminal del servidor y consola del navegador
3. **Comparte los logs**: Si ves el problema, compárteme los logs completos
4. **Prueba otro día**: Usa el código JavaScript para forzar otro día

---

## 📞 Información para Debug

Cuando me compartas el problema, incluye:

1. **Día actual**: ¿Qué día de la semana es hoy?
2. **Logs del servidor**: Copia todos los logs `[EXPERT_ROUTINE]`
3. **Logs del navegador**: Copia errores de la consola (F12)
4. **Foto de pantalla**: Qué estás viendo en la UI

Con esta información, puedo identificar exactamente dónde está el problema.

---

## ✨ ¿Qué Debería Ver Si Todo Funciona?

Si todo funciona correctamente y NO es día REST, deberías ver:

1. **En el servidor:**
```
[EXPERT_ROUTINE] ===== EXPERT TEMPLATE ROUTINE GENERATION =====
[EXPERT_ROUTINE] User Stage: STAGE_2
[EXPERT_ROUTINE] Today is: Monday (1)
[EXPERT_ROUTINE] Session type for STAGE_2 on Monday : LEGS
[EXPERT_ROUTINE] Looking for template with key: STAGE_2_LEGS
[EXPERT_ROUTINE] ✅ Found template: STAGE_2_LEGS
[EXPERT_ROUTINE] Philosophy: Build leg strength with pistol squats...
[EXPERT_ROUTINE] Total XP: 1500 | Total Coins: 150
[EXPERT_ROUTINE] XP per axis: { mobility: 200, strength: 1100, core: 200 }
```

2. **En la UI:**
- Múltiples ejercicios organizados en secciones
- WARMUP (10 min)
- FUNDAMENTAL_STRENGTH (35 min)
- COOLDOWN (5 min)
- XP estimado: ~1500
- Coins estimados: ~150

---

## 🚨 Si Sigue Sin Funcionar

Si después de revisar todo sigue mostrando solo "Rest Day Mobility" en días que NO son REST, hay un problema más profundo que necesitamos investigar juntos.

Compárteme:
1. Los logs completos
2. El día actual
3. Tu Stage calculado
4. Screenshots de lo que ves

¡Vamos a resolverlo! 💪
