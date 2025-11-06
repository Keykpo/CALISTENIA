# Calisthenics Platform — Roadmap

## Visión general
- Plataforma de calistenia con árbol de habilidades (RPG), entrenamientos, progreso y gamificación.
- Monorepo con `apps/web` (Next.js), `prisma` (SQLite por defecto), y paquetes compartidos.

## Estado actual
- Autenticación: Google OAuth y credenciales con NextAuth; falta envío de email en “forgot password”.
- Ejercicios: API `GET/POST /api/exercises` con soporte de nueva escala `rank` (D, C, B, A, S) y compatibilidad con `difficulty`.
- Dashboard: gating por Assessment; `TODO` para navegación a `/training/session`.
- Prisma: esquema amplio (usuarios, ejercicios, sesiones, cursos, comunidad, logros, suscripciones, skills, goals).
- Seed: datos del árbol de habilidades y ejercicios en `prisma/seed.ts` (limpieza + carga).

## Próximos hitos (S1)
- Entrenamiento: crear página `/training/session` y flujo básico (selección de workout, timer, registro rápido).
- Forgot password: configurar SMTP y enviar email con token; crear página `/auth/reset-password` para consumo del token.
- Assessment: completar flujo y persistencia de objetivos (crear/actualizar en `/api/user/goals`).
- Rank UI: mostrar `rank` en tarjetas/listas de ejercicios y filtros UI coherentes con API.

## Autenticación y Cuenta
- Añadir variables SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` en `.env.local`.
- Implementar envío con `nodemailer` en `apps/web/src/lib/email.ts` y usarlo en `api/auth/forgot-password`.
- Crear `GET /api/auth/validate-reset-token` y `POST /api/auth/reset-password`.
- Opcional: verificación de email en sign-up con token y template.

## Entrenamiento y Sesiones
- Ruta `/training/session`: UI con lista de ejercicios del workout, timer por ejercicio/descanso, marcar completado.
- API `POST /api/workout-sessions` para iniciar sesión; `PATCH /api/workout-sessions/:id` para progreso y finalización.
- Persistir `SessionExercise` al iniciar (copiar parámetros del `Workout`).
- Métricas: duración total, calorías, notas; sumar `totalXP` y `totalStrength` según reglas de skills al completar.

## Árbol de Habilidades (RPG)
- UI Skill Tree: componentes horizontales/verticales con ramas (calentamiento, empuje, tracción, core, equilibrio, movilidad).
- Completar relaciones: `SkillPrerequisite`, `ExerciseSkill`, y progreso de `UserSkill`.
- Reglas: desbloqueos y XP/monedas al completar requisitos (reps/días/duración), reflejado en `totalStrength` y `currentLevel`.

## Datos y Prisma
- Confirmar coherencia `rank` vs `difficulty` en `Exercise` (migración si se requiere consolidar).
- Revisar `seed.ts`: asegurar que `instructions`, `muscleGroups`, `equipment` respetan JSON strings compatibles con SQLite.
- Añadir seeds de `Workout` y `WorkoutExercise` básicos (principiante/intermedio) para pruebas de sesión.

## Frontend Web
- Filtros de ejercicios por `rank` y `muscleGroups` en páginas de catálogo.
- Admin: páginas en `/admin/exercises` y `/admin/workouts` para CRUD (ya hay bases parciales).
- Dashboard: tarjeta de “Siguiente objetivo” y acceso directo a skill objetivo.
- Componentes: mejorar gráficos en `ProgressCharts` y rankings en `Leaderboards`.

## Infra y DevEx
- Scripts: `db:seed`, `db:reset`, `dev:web`, `dev:api` centralizados en `package.json` raíz.
- Entorno: `.env.local.example` incluir SMTP y `DATABASE_URL` coherente (SQLite/PostgreSQL según despliegue).
- Turbo: revisar `turbo.json` para caché y pipeline de build.

## QA y Testing
- Tests de API para `exercises`, `workouts`, `auth` (reset password) con Jest en `apps/api` si aplica.
- Pruebas e2e básicas con Playwright para registro/login/forgot/reset y flujo de entrenamiento.
- Validaciones UI: formularios (`zod`) y mensajes consistentes en español.

## Entregables rápidos (prioridad)
1) Envío de email “forgot password” + página de reset.
2) Página `/training/session` funcional con timer y marcado de ejercicios.
3) Filtros y visualización de `rank` en catálogo de ejercicios.
4) Seeds de workouts de ejemplo para pruebas end-to-end.