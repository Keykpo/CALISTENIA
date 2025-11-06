# 🗺️ ROADMAP COMPLETO - PLATAFORMA DE CALISTENIA

**Basado en análisis exhaustivo del código**
**Fecha**: 2025-11-06
**Estado Actual**: MVP Funcional (65% completo)
**Objetivo**: Aplicación production-ready en 16 semanas

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### ✅ Lo que YA tienes funcionando (65%)
1. **Sistema RPG completo**: XP, niveles, coins, rachas diarias
2. **Misiones adaptativas**: Generación inteligente según nivel y hexágono
3. **Hexágono dinámico**: 6 ejes que se actualizan automáticamente
4. **Generador de rutinas**: Planes semanales personalizados
5. **Autenticación robusta**: NextAuth con Google OAuth
6. **Onboarding completo**: Assessment inicial de 6 ejes
7. **Dashboard analítico**: Stats, progreso, visualizaciones

### ⚠️ Lo que está A MEDIAS (20%)
1. **Workout tracking**: Schema completo pero tracking incompleto
2. **Skills system**: Lógica implementada pero BD vacía
3. **Achievements**: UI completa pero sin achievements reales
4. **Progress tracking**: Básico, necesita mejoras
5. **Admin panel**: CRUD básico de ejercicios/workouts

### ❌ Lo que FALTA implementar (15%)
1. **Social features**: Feed, posts, likes, comments
2. **Courses**: Sistema de cursos vacío
3. **Payments**: Stripe no integrado
4. **Email service**: No configurado
5. **Notifications**: No existe
6. **Mobile app**: No existe

---

## 🎯 ROADMAP FASE POR FASE

---

## 📅 FASE 1: COMPLETAR MVP CORE (Semanas 1-3)
**Objetivo**: Base de datos poblada y features core 100% funcionales

### 1.1 Poblar Base de Datos ⚡ CRÍTICO
**Duración**: 1 semana
**Prioridad**: MÁXIMA

#### Tareas:
- [ ] **Skills Master Data**
  - Crear JSON/SQL con 50-100 skills organizadas por rama:
    - EMPUJE: Push-ups progresiones (Wall → Diamond → Archer → One-Arm)
    - TRACCION: Pull-ups progresiones (Scapular → Standard → Weighted → One-Arm)
    - CORE: Planks, L-sits, Dragon flags
    - EQUILIBRIO: Handstands progresiones
    - TREN_INFERIOR: Squats progresiones (Standard → Pistol → Shrimp)
    - ESTATICOS: Planche, Front Lever, Back Lever
    - CALENTAMIENTO: Movilidad y activación

  - Definir prerequisites entre skills:
    ```typescript
    Wall Push-up → Incline Push-up → Standard Push-up → Diamond
    ```

  - Asignar rewards por skill:
    - BEGINNER: 10-20 XP, 5-10 coins, 1-2 strength
    - INTERMEDIATE: 25-50 XP, 10-20 coins, 3-5 strength
    - ADVANCED: 60-100 XP, 25-40 coins, 6-10 strength
    - EXPERT: 120+ XP, 50+ coins, 12+ strength

  - Script de seed: `prisma/seeds/skills.ts`

  ```bash
  # Ejecutar seed
  npx prisma db seed
  ```

- [ ] **Achievements Master Data**
  - Crear 60+ achievements en categorías:

    **Skill Mastery** (20 achievements):
    - "Push Master": Completar 10 skills de empuje
    - "Pull Warrior": Completar 10 skills de tracción
    - "Core God": Completar 10 skills de core
    - "Balance Artist": Completar 10 skills de equilibrio
    - "Leg Legend": Completar 10 skills de tren inferior
    - "Static Master": Completar 5 skills estáticas
    - "Ultimate Calisthenic": Completar 50 skills totales

    **Branch Completion** (7 achievements):
    - "Push Branch Complete": 100% rama empuje
    - "Pull Branch Complete": 100% rama tracción
    - "Core Branch Complete": 100% rama core
    - "Balance Branch Complete": 100% rama equilibrio
    - "Legs Branch Complete": 100% rama tren inferior
    - "Statics Branch Complete": 100% rama estáticos
    - "Grand Master": Todas las ramas completas

    **Level Milestones** (10 achievements):
    - "Novice": Alcanzar nivel 5
    - "Apprentice": Nivel 10
    - "Adept": Nivel 15
    - "Expert": Nivel 20
    - "Master": Nivel 30
    - "Grandmaster": Nivel 50
    - "Legend": Nivel 75
    - "Mythic": Nivel 100

    **Daily Missions** (10 achievements):
    - "Consistency": 7 días de racha
    - "Dedicated": 14 días de racha
    - "Committed": 30 días de racha
    - "Unstoppable": 60 días de racha
    - "Legendary Streak": 100 días de racha
    - "Mission Master": 50 misiones completadas
    - "Mission Legend": 100 misiones
    - "Mission God": 500 misiones

    **XP & Strength** (8 achievements):
    - "XP Hunter": 1,000 XP total
    - "XP Warrior": 5,000 XP
    - "XP Legend": 10,000 XP
    - "Strength Seeker": 50 strength total
    - "Strength Builder": 100 strength
    - "Strength Master": 500 strength

    **Special Events** (5 achievements):
    - "First Steps": Completar onboarding
    - "Routine Creator": Generar primera rutina
    - "Social Butterfly": Hacer primer post
    - "Helpful": Dar 10 likes
    - "Community Leader": 100 likes recibidos

- [ ] **Courses Demo Content**
  - Crear 3-5 cursos de demostración:

    **Curso 1: "Fundamentos de Calistenia"** (BEGINNER)
    - 5 lecciones:
      1. Introducción a la calistenia
      2. Técnica correcta en push-ups
      3. Progresiones de pull-ups
      4. Core básico
      5. Planificación de entrenamiento

    **Curso 2: "Handstand Mastery"** (INTERMEDIATE)
    - 8 lecciones:
      1. Anatomía del handstand
      2. Acondicionamiento de muñecas
      3. Kick-up y balance
      4. Wall drills
      5. Free-standing handstand
      6. Handstand push-ups
      7. Press to handstand
      8. One-arm progressions

    **Curso 3: "Planche Progression"** (ADVANCED)
    - 10 lecciones progresivas

  - Incluir para cada lección:
    - Contenido en texto/markdown
    - URL de video (YouTube/Vimeo)
    - Duración estimada
    - Ejercicios prácticos

**Entregables**:
- ✅ BD con 50-100 skills funcionales
- ✅ 60+ achievements definidos
- ✅ 3-5 cursos demo con lecciones
- ✅ Scripts de seed documentados

---

### 1.2 Workout Tracking Completo 🏋️
**Duración**: 1 semana
**Prioridad**: ALTA

#### Problema Actual:
- WorkoutSession existe pero no se usa completamente
- No hay tracking real de ejercicios completados
- Hexágono no se actualiza desde workouts reales

#### Tareas:
- [ ] **API: Complete Workout Session**
  ```typescript
  // /api/workout/complete
  POST {
    sessionId: string,
    exercises: [
      { exerciseId, sets, reps, weight, duration, completed: boolean }
    ]
  }
  ```

  Lógica:
  1. Marcar sesión como COMPLETED
  2. Calcular XP total basado en:
     - Ejercicios completados
     - Dificultad de ejercicios
     - Consistencia (racha)
  3. Actualizar User: totalXP, virtualCoins, currentLevel
  4. Crear WorkoutHistory entry con hexagonDelta
  5. Actualizar HexagonProfile según ejercicios:
     - Push exercises → +relativeStrength, +bodyTension
     - Pull exercises → +relativeStrength, +skillTechnique
     - Core exercises → +bodyTension, +balanceControl
     - Flexibility → +jointMobility
     - Balance → +balanceControl, +skillTechnique
  6. Verificar achievements desbloqueados

- [ ] **UI: Active Training Session**
  ```
  /training/session/[id]
  ```

  Features:
  - Timer global de sesión
  - Lista de ejercicios del workout
  - Checkbox para marcar ejercicio completado
  - Input para sets/reps reales
  - Rest timer entre ejercicios
  - Botón "Complete Workout"
  - Progreso visual (X de Y ejercicios)
  - Estimación de tiempo restante

- [ ] **UI: Workout History**
  ```
  /workouts/history
  ```

  Mostrar:
  - Últimos 10 workouts completados
  - Fecha, duración, XP ganado
  - Ejercicios del workout
  - Hexagon delta aplicado
  - Gráfico de evolución

- [ ] **Background: Hexagon Recalculation**
  - Calcular hexágono desde historial de workouts
  - Actualizar automáticamente cada vez que se completa workout
  - Implementar `/api/user/skills-hexagon` para recalcular bajo demanda

**Entregables**:
- ✅ API /workout/complete funcional
- ✅ UI de sesión activa
- ✅ Historial de workouts
- ✅ Hexágono se actualiza desde workouts reales

---

### 1.3 Email Service Configurado 📧
**Duración**: 2-3 días
**Prioridad**: ALTA

#### Opciones:
1. **Resend** (Recomendado - Gratis hasta 3,000/mes)
2. SendGrid (Gratis hasta 100/día)
3. AWS SES (Pay as you go)

#### Tareas:
- [ ] Crear cuenta en Resend
- [ ] Obtener API key
- [ ] Agregar a `.env`:
  ```bash
  RESEND_API_KEY=re_xxx
  FROM_EMAIL=noreply@tucalistenia.com
  ```

- [ ] Implementar servicio de email: `/lib/email.ts`
  ```typescript
  import { Resend } from 'resend';

  const resend = new Resend(process.env.RESEND_API_KEY);

  export async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: 'Reset your password',
      html: `Click <a href="${resetUrl}">here</a> to reset your password.`
    });
  }

  export async function sendWelcomeEmail(email: string, name: string) { ... }
  export async function sendAchievementEmail(email: string, achievement: string) { ... }
  ```

- [ ] Actualizar `/api/auth/forgot-password` para enviar email real

- [ ] Templates de email (HTML):
  - Welcome email
  - Password reset
  - Achievement unlocked
  - Weekly summary
  - Streak reminder

**Entregables**:
- ✅ Servicio de email funcional
- ✅ Forgot password envía emails reales
- ✅ 5 templates básicos de email

---

## 📅 FASE 2: FEATURES PRODUCCIÓN (Semanas 4-7)
**Objetivo**: Features esenciales para lanzamiento público

### 2.1 Social Features 👥
**Duración**: 2 semanas
**Prioridad**: ALTA

#### 2.1.1 Feed de Posts
- [ ] **API: Posts CRUD**
  ```typescript
  GET  /api/posts          // Lista de posts (pagination)
  POST /api/posts          // Crear post
  GET  /api/posts/[id]     // Detalle de post
  PUT  /api/posts/[id]     // Editar post
  DELETE /api/posts/[id]   // Eliminar post
  ```

- [ ] **UI: Feed Page** (`/feed`)
  - Infinite scroll
  - Create post form (texto + imagen opcional)
  - Post card con:
    - Avatar y nombre de usuario
    - Timestamp
    - Contenido
    - Imagen (si hay)
    - Botones: Like, Comment, Share
    - Contador de likes y comments

- [ ] **API: Likes**
  ```typescript
  POST   /api/posts/[id]/like    // Toggle like
  GET    /api/posts/[id]/likes   // Lista de users que dieron like
  ```

- [ ] **API: Comments**
  ```typescript
  GET    /api/posts/[id]/comments
  POST   /api/posts/[id]/comments
  DELETE /api/comments/[id]
  ```

- [ ] **UI: Comments Section**
  - Lista de comments bajo cada post
  - Form para agregar comment
  - Mostrar autor y timestamp

#### 2.1.2 Leaderboard Funcional
- [ ] **API: Rankings**
  ```typescript
  GET /api/leaderboard?type=xp|level|streak|strength
  ```

  Queries:
  - Top 100 usuarios por XP total
  - Top 100 por nivel
  - Top 100 por racha actual
  - Top 100 por strength total

  Respuesta:
  ```json
  {
    "rankings": [
      {
        "rank": 1,
        "userId": "xxx",
        "username": "JohnDoe",
        "avatar": "url",
        "value": 15000,
        "change": "+5"  // cambio de posición desde ayer
      }
    ],
    "currentUser": {
      "rank": 42,
      "value": 5000
    }
  }
  ```

- [ ] **UI: Leaderboard Page** (`/leaderboard`)
  - Tabs: XP, Level, Streak, Strength
  - Lista top 100
  - Destacar posición del usuario actual
  - Avatar + username + stat
  - Badges especiales para top 3

**Entregables**:
- ✅ Feed funcional con posts, likes, comments
- ✅ Leaderboard con 4 categorías
- ✅ UI completa y responsive

---

### 2.2 Courses System 📚
**Duración**: 1.5 semanas
**Prioridad**: MEDIA-ALTA

#### 2.2.1 Course Library
- [ ] **UI: Courses Page** (`/courses`)
  - Grid de cursos disponibles
  - Filtros: dificultad, categoría
  - Card por curso:
    - Thumbnail
    - Título, descripción corta
    - Dificultad badge
    - Duración total
    - Progreso del usuario (si enrolled)
    - Botón "Enroll" o "Continue"

- [ ] **API: Course Enrollment**
  ```typescript
  POST /api/courses/[id]/enroll  // Inscribirse
  ```

#### 2.2.2 Course Detail
- [ ] **UI: Course Page** (`/courses/[id]`)
  - Header con info del curso
  - Lista de lecciones:
    - Número de lección
    - Título
    - Duración
    - Estado: Locked/Available/Completed
    - Icono de lock si tiene prerequisitos
  - Botón "Start Course" o "Continue"
  - Progreso visual (X% completado)

#### 2.2.3 Lesson Player
- [ ] **UI: Lesson Page** (`/courses/[courseId]/lessons/[lessonId]`)
  - Video player (YouTube/Vimeo embed)
  - Contenido de texto (markdown)
  - Botones: Previous, Next, Mark as Complete
  - Sidebar con lista de lecciones
  - Progreso del curso actualizado

- [ ] **API: Lesson Progress**
  ```typescript
  POST /api/courses/[courseId]/lessons/[lessonId]/complete
  ```

  Lógica:
  1. Marcar lesson como completada
  2. Actualizar watchTime
  3. Recalcular progreso del curso
  4. Si curso 100% → marcar CourseEnrollment.completedAt
  5. Otorgar XP/coins si aplica
  6. Verificar achievement "Course Completion"

**Entregables**:
- ✅ Biblioteca de cursos
- ✅ Enrollment system
- ✅ Video player funcional
- ✅ Progress tracking

---

### 2.3 Payments Integration 💳
**Duración**: 1 semana
**Prioridad**: MEDIA (si quieres monetizar)

#### Opciones de Planes:
- **FREE**: Acceso a features básicos
- **BASIC** ($9.99/mes): Rutinas personalizadas ilimitadas, cursos básicos
- **PREMIUM** ($19.99/mes): Todos los cursos, analytics avanzados, sin ads
- **ELITE** ($49.99/mes): Coaching 1-on-1, rutinas AI, early access

#### Tareas:
- [ ] **Configurar Stripe**
  - Crear cuenta en Stripe
  - Crear productos y precios
  - Obtener API keys (test y production)
  - Agregar a `.env`:
    ```bash
    STRIPE_SECRET_KEY=sk_test_xxx
    STRIPE_PUBLISHABLE_KEY=pk_test_xxx
    STRIPE_WEBHOOK_SECRET=whsec_xxx
    ```

- [ ] **API: Create Checkout Session**
  ```typescript
  POST /api/stripe/create-checkout-session
  {
    priceId: "price_xxx",  // Plan seleccionado
    userId: "xxx"
  }
  ```

  Respuesta:
  ```json
  { "sessionUrl": "https://checkout.stripe.com/..." }
  ```

- [ ] **API: Stripe Webhook**
  ```typescript
  POST /api/stripe/webhook
  ```

  Eventos a manejar:
  - `checkout.session.completed` → Crear Subscription en BD
  - `invoice.payment_succeeded` → Renovar subscription
  - `customer.subscription.updated` → Actualizar status
  - `customer.subscription.deleted` → Cancelar subscription

- [ ] **UI: Pricing Page Mejorada** (`/pricing`)
  - Grid de planes con features
  - Botón "Subscribe" → redirect a Stripe Checkout
  - Badge "Current Plan" si está subscrito

- [ ] **UI: Billing Management** (`/account/billing`)
  - Plan actual
  - Fecha de renovación
  - Método de pago
  - Botón "Cancel Subscription"
  - Historial de facturas

- [ ] **Middleware: Check Subscription**
  - Proteger rutas premium
  - Mostrar paywall si no tiene acceso

**Entregables**:
- ✅ Stripe checkout funcional
- ✅ Webhook handling
- ✅ Billing management UI
- ✅ Premium features protegidas

---

### 2.4 Progress Tracking Mejorado 📈
**Duración**: 3-4 días
**Prioridad**: MEDIA

#### Tareas:
- [ ] **UI: Progress Page** (`/progress`)
  - Tabs: Weight, Body Fat, Measurements, Performance, Photos

  **Weight Tab**:
  - Form para agregar entrada (peso + fecha)
  - Chart de línea con evolución
  - Goal setting (peso objetivo)
  - Predicción simple (regresión lineal)

  **Body Fat Tab**:
  - Form para % grasa corporal
  - Chart de evolución
  - Indicadores de rangos saludables

  **Measurements Tab**:
  - Inputs: cintura, pecho, brazos, piernas, etc.
  - Table con histórico
  - Comparación visual

  **Performance Tab**:
  - Records personales por ejercicio:
    - Max reps push-ups
    - Max pull-ups
    - Longest plank hold
  - Charts de mejora

  **Photos Tab**:
  - Upload de fotos de progreso
  - Gallery con before/after
  - Slider de comparación

- [ ] **API: Progress Entries**
  ```typescript
  POST /api/progress/entry
  GET  /api/progress/entries?type=WEIGHT&from=2025-01-01
  ```

- [ ] **API: Upload Photos**
  - Integración con Cloudinary/S3
  - Resize automático
  - Thumbnail generation

**Entregables**:
- ✅ Progress tracking completo
- ✅ Charts funcionales
- ✅ Photo uploads

---

## 📅 FASE 3: POLISH & ADVANCED (Semanas 8-11)
**Objetivo**: Features avanzadas y pulido de UX

### 3.1 Shop & Rewards System 🏪
**Duración**: 1.5 semanas
**Prioridad**: MEDIA

#### Conceptos:
- Los **coins** que ganas por misiones y workouts se pueden usar para comprar rewards

#### Tareas:
- [ ] **Definir Items/Rewards**

  **Cosmetics**:
  - Avatar frames (50-200 coins)
  - Badges especiales (100-500 coins)
  - Títulos personalizados (200-1000 coins)

  **Funcionales**:
  - XP Boost 2x (500 coins, 24h)
  - Misión extra del día (300 coins)
  - Unlock skill anticipado (1000 coins)
  - Custom workout creator (2000 coins)

  **Especiales**:
  - Coaching session 1-on-1 (5000 coins)
  - Custom meal plan (3000 coins)

- [ ] **Schema: ShopItem**
  ```prisma
  model ShopItem {
    id          String   @id @default(cuid())
    name        String
    description String
    category    String   // COSMETIC, FUNCTIONAL, SPECIAL
    price       Int      // en coins
    iconUrl     String?
    isAvailable Boolean  @default(true)

    purchases   Purchase[]
  }

  model Purchase {
    id        String   @id @default(cuid())
    userId    String
    itemId    String
    price     Int
    createdAt DateTime @default(now())

    user User     @relation(fields: [userId], references: [id])
    item ShopItem @relation(fields: [itemId], references: [id])
  }
  ```

- [ ] **API: Shop**
  ```typescript
  GET  /api/shop/items           // Lista de items
  POST /api/shop/purchase        // Comprar item
  GET  /api/shop/my-purchases    // Mis compras
  ```

- [ ] **UI: Shop Page** (`/shop`)
  - Tabs por categoría
  - Card por item:
    - Icono/imagen
    - Nombre, descripción
    - Precio en coins
    - Botón "Buy"
  - Mostrar coins actuales del usuario
  - Confirmación de compra
  - Animación al comprar

- [ ] **UI: Inventory** (`/profile/inventory`)
  - Items comprados
  - Items equipados (avatar frame, badge, título)
  - Botón "Equip/Unequip"

**Entregables**:
- ✅ Shop funcional con 20+ items
- ✅ Purchase system
- ✅ Inventory management

---

### 3.2 Advanced Analytics 📊
**Duración**: 1 semana
**Prioridad**: MEDIA

#### Tareas:
- [ ] **Dashboard Analytics Mejorado**

  **Predictive Analytics**:
  - "At this pace, you'll reach Level 20 in 30 days"
  - "If you maintain your streak, you'll unlock X achievement in 5 days"
  - Estimación de cuando alcanzarás goal weight

  **Insights**:
  - "You trained 4x this week, +20% vs last week"
  - "Your strongest axis is Balance (+15% this month)"
  - "You haven't trained legs in 7 days - time to focus!"

  **Recommendations**:
  - "Based on your hexagon, we recommend focusing on Mobility"
  - "Try the 'Handstand Mastery' course to improve Balance"
  - "Users like you often enjoy these workouts: [...]"

- [ ] **API: Analytics**
  ```typescript
  GET /api/analytics/insights?userId=xxx
  ```

  Response:
  ```json
  {
    "predictions": [
      { "metric": "level", "currentValue": 15, "targetValue": 20, "estimatedDays": 30 }
    ],
    "insights": [
      { "type": "improvement", "message": "...", "change": "+20%" }
    ],
    "recommendations": [
      { "type": "course", "title": "...", "reason": "..." }
    ]
  }
  ```

- [ ] **UI: Analytics Tab en Dashboard**
  - Section "Predictions"
  - Section "Insights"
  - Section "Recommendations"

**Entregables**:
- ✅ Predictive analytics básico
- ✅ Insights automáticos
- ✅ Recommendations engine

---

### 3.3 Notifications System 🔔
**Duración**: 1 semana
**Prioridad**: MEDIA-BAJA

#### Tipos de Notificaciones:
1. **In-App**: Banners/Toasts dentro de la app
2. **Email**: Resúmenes diarios/semanales
3. **Push** (futuro): Notificaciones móviles

#### Tareas:
- [ ] **Schema: Notification**
  ```prisma
  model Notification {
    id        String   @id @default(cuid())
    userId    String
    type      NotificationType
    title     String
    message   String
    actionUrl String?
    read      Boolean  @default(false)
    createdAt DateTime @default(now())

    user User @relation(fields: [userId], references: [id])
  }

  enum NotificationType {
    ACHIEVEMENT_UNLOCKED
    LEVEL_UP
    STREAK_MILESTONE
    NEW_COMMENT
    NEW_LIKE
    COURSE_AVAILABLE
    MISSION_REMINDER
  }
  ```

- [ ] **API: Notifications**
  ```typescript
  GET    /api/notifications           // Mis notificaciones
  POST   /api/notifications/[id]/read // Marcar como leída
  DELETE /api/notifications/[id]      // Eliminar
  POST   /api/notifications/read-all  // Marcar todas como leídas
  ```

- [ ] **UI: Notification Bell**
  - Icono de campana en header
  - Badge con número de no leídas
  - Dropdown con últimas 5 notificaciones
  - Link a "Ver todas"

- [ ] **UI: Notifications Page** (`/notifications`)
  - Lista completa de notificaciones
  - Tabs: All, Unread, Read
  - Agrupación por fecha
  - Acción según tipo (redirect a achievement, post, etc.)

- [ ] **Background Jobs**
  - Crear notificación cuando:
    - Achievement desbloqueado
    - Level up
    - Alguien comenta en tu post
    - Alguien le da like a tu post
    - Nueva misión disponible (7am diario)
    - Racha en peligro (23h sin completar)

- [ ] **Email Notifications** (usando Resend)
  - Weekly summary email (Lunes 9am):
    - Workouts completados
    - XP ganado
    - Achievements desbloqueados
    - Progreso del hexágono

  - Daily mission reminder (7am):
    - "Your daily missions are ready!"
    - Lista de misiones del día

**Entregables**:
- ✅ Sistema de notificaciones in-app
- ✅ Email notifications
- ✅ UI completa con bell dropdown

---

### 3.4 Admin Panel Completo 👨‍💼
**Duración**: 4-5 días
**Prioridad**: BAJA

#### Estado Actual:
Ya tienes CRUD básico de Exercises y Workouts, pero falta:

#### Tareas:
- [ ] **Roles de Usuario**
  - Agregar campo `role` a User: `USER | ADMIN | SUPER_ADMIN`
  - Middleware para proteger rutas `/admin/*`

- [ ] **Admin Dashboard** (`/admin`)
  - Overview con stats:
    - Total users
    - Users activos (último 7 días)
    - Workouts completados hoy
    - Revenue (si tienes subscriptions)
  - Charts de crecimiento

- [ ] **User Management** (`/admin/users`)
  - Tabla con todos los usuarios
  - Filtros: role, fitnessLevel, subscription
  - Search por email/username
  - Acciones:
    - Ver perfil completo
    - Ban/Unban
    - Cambiar role
    - Reset password
    - Eliminar usuario

- [ ] **Content Moderation** (`/admin/posts`)
  - Posts recientes
  - Filtro de reportados
  - Aprobar/Rechazar/Eliminar post

- [ ] **Skills Management** (`/admin/skills`)
  - CRUD completo de skills
  - Editar prerequisites
  - Cambiar rewards

- [ ] **Achievements Management** (`/admin/achievements`)
  - CRUD de achievements
  - Ver usuarios que lo desbloquearon

- [ ] **Courses Management** (`/admin/courses`)
  - CRUD de cursos y lecciones
  - Upload de videos
  - Publicar/Despublicar

**Entregables**:
- ✅ Admin dashboard funcional
- ✅ User management
- ✅ Content moderation
- ✅ Full CRUD de todo el contenido

---

## 📅 FASE 4: SCALE & MOBILE (Semanas 12-16+)
**Objetivo**: Escalabilidad y versión móvil

### 4.1 Database Migration 🗄️
**Duración**: 3-4 días
**Prioridad**: CRÍTICA para producción

#### Problema:
SQLite no es apropiado para producción (no soporta concurrencia, no escala)

#### Solución:
Migrar a **PostgreSQL**

#### Tareas:
- [ ] **Setup PostgreSQL**
  - Opción 1: Railway/Supabase (gratis para empezar)
  - Opción 2: AWS RDS
  - Opción 3: Vercel Postgres

- [ ] **Actualizar Prisma Schema**
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```

- [ ] **Migración de Datos**
  ```bash
  # Export from SQLite
  sqlite3 dev.db .dump > dump.sql

  # Transform to PostgreSQL format
  # Import to PostgreSQL
  psql $DATABASE_URL < dump_transformed.sql
  ```

- [ ] **Testing Exhaustivo**
  - Verificar todas las queries funcionan
  - Verificar índices están creados
  - Performance testing

**Entregables**:
- ✅ PostgreSQL en producción
- ✅ Datos migrados
- ✅ Schema optimizado con índices

---

### 4.2 Performance Optimization ⚡
**Duración**: 1 semana
**Prioridad**: ALTA

#### Tareas:
- [ ] **Caching con Redis**
  - Cachear responses frecuentes:
    - `/api/dashboard` (TTL: 5 min)
    - `/api/leaderboard` (TTL: 10 min)
    - `/api/courses` (TTL: 1 hora)

  - Invalidar cache cuando:
    - Usuario completa workout
    - Misión completada
    - Post creado

- [ ] **Database Optimization**
  - Crear índices:
    ```prisma
    @@index([userId, date])           // DailyMission
    @@index([userId, completed])      // WorkoutSession
    @@index([category, difficulty])   // Exercise
    ```

  - Eager loading con `include` para evitar N+1 queries

  - Pagination en todas las listas:
    ```typescript
    // /api/posts?page=1&limit=20
    const posts = await prisma.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
    ```

- [ ] **Image Optimization**
  - Usar Next.js Image component
  - Lazy loading
  - WebP format
  - CDN (Cloudinary/Vercel)

- [ ] **Code Splitting**
  - Dynamic imports para componentes pesados
  - Route-based splitting (ya lo hace Next.js)

- [ ] **API Rate Limiting**
  - Usar `upstash/ratelimit`
  - Límites por endpoint:
    - Auth: 5 req/min
    - API general: 100 req/min
    - Admin: sin límite

**Entregables**:
- ✅ Redis caching implementado
- ✅ DB optimizada con índices
- ✅ Pagination en listas
- ✅ Rate limiting activo

---

### 4.3 PWA (Progressive Web App) 📱
**Duración**: 3-4 días
**Prioridad**: MEDIA

#### Tareas:
- [ ] **Service Worker**
  - Offline support
  - Cache API responses
  - Background sync

- [ ] **Manifest.json**
  ```json
  {
    "name": "Calistenia Platform",
    "short_name": "Calistenia",
    "icons": [...],
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#2563eb"
  }
  ```

- [ ] **Install Prompt**
  - Banner "Add to Home Screen"
  - Instrucciones por SO

- [ ] **Push Notifications** (opcional)
  - Web Push API
  - Service worker notifications

**Entregables**:
- ✅ PWA instalable
- ✅ Offline support básico
- ✅ Push notifications (opcional)

---

### 4.4 Mobile App (React Native) 📱
**Duración**: 4+ semanas
**Prioridad**: BAJA (nice to have)

#### Opción 1: PWA (más fácil)
Ya está cubierto arriba

#### Opción 2: React Native (más nativo)

#### Setup:
```bash
npx react-native init CalisteniaApp
cd CalisteniaApp
```

#### Features Prioritarias:
1. **Auth** (login/register)
2. **Dashboard** (stats, misiones)
3. **Training Timer** (workout session)
4. **Progress Tracking** (weight, photos)
5. **Notifications** (push nativas)

#### No Prioritarias (usar web):
- Admin panel
- Courses (video player web)
- Social feed (web)

#### Tareas:
- [ ] Setup React Native project
- [ ] Shared API client con web
- [ ] Auth screens
- [ ] Dashboard screen
- [ ] Training timer screen
- [ ] Camera integration (progress photos)
- [ ] Push notifications setup
- [ ] App Store deployment (iOS)
- [ ] Play Store deployment (Android)

**Entregables**:
- ✅ App React Native funcional
- ✅ Published en App Store + Play Store

---

## 📅 FASE 5: ADVANCED FEATURES (Semanas 16+)

### 5.1 AI-Powered Features 🤖
**Duración**: 2-3 semanas
**Prioridad**: BAJA (innovación)

#### Tareas:
- [ ] **AI Routine Generator**
  - Usar OpenAI API
  - Input: nivel, goals, equipment, tiempo disponible, hexágono
  - Output: Rutina personalizada con explicaciones

- [ ] **Form Check con Computer Vision**
  - User graba video haciendo ejercicio
  - AI analiza forma y da feedback
  - Usa TensorFlow.js o OpenCV

- [ ] **Chatbot Coach**
  - Chat integrado en app
  - Responde preguntas sobre técnica
  - Da motivación y consejos

**Entregables**:
- ✅ AI routine generator
- ✅ Form check (beta)
- ✅ Chatbot coach

---

### 5.2 Integrations 🔗
**Duración**: 1-2 semanas
**Prioridad**: BAJA

#### Tareas:
- [ ] **Wearables Integration**
  - Apple Watch
  - Fitbit
  - Garmin

  Features:
  - Import workouts
  - Import heart rate data
  - Export workout plans

- [ ] **Apple Health / Google Fit**
  - Sync weight
  - Sync workouts
  - Sync body fat %

- [ ] **Strava Integration**
  - Share workouts a Strava
  - Import activities

**Entregables**:
- ✅ Wearables sync
- ✅ Health apps integration

---

## 🧪 TESTING & QA (Continuo)

### Cada Fase Debe Incluir:

#### Unit Tests
```bash
npm install --save-dev vitest @testing-library/react
```

Tests prioritarios:
- Utils functions (skill-utils, levels, rank)
- API handlers (misiones, workouts, achievements)
- Components críticos (Dashboard, MissionCard)

#### Integration Tests
- E2E con Playwright:
  ```bash
  npm install --save-dev @playwright/test
  ```

  Scenarios:
  - User onboarding flow
  - Complete daily mission
  - Generate routine
  - Complete workout

#### Manual QA Checklist
- [ ] Todas las páginas cargan sin errores
- [ ] Auth flow completo funciona
- [ ] Misiones se generan y completan
- [ ] Hexágono se actualiza correctamente
- [ ] Rutinas se generan
- [ ] Workouts se completan
- [ ] Payments funcionan (test mode)
- [ ] Emails se envían
- [ ] Mobile responsive
- [ ] Cross-browser (Chrome, Firefox, Safari)

---

## 🚀 DEPLOYMENT & DEVOPS

### Staging Environment
```bash
# Vercel staging
vercel --prod --scope staging
```

### Production Deployment
```bash
# Vercel production
vercel --prod
```

### Monitoring
- [ ] Setup Sentry (error tracking)
  ```bash
  npm install @sentry/nextjs
  ```

- [ ] Setup Vercel Analytics

- [ ] Setup Uptime Monitor (UptimeRobot)

### CI/CD
- [ ] GitHub Actions
  ```yaml
  # .github/workflows/ci.yml
  name: CI
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - run: npm ci
        - run: npm test
        - run: npm run build
  ```

---

## 📊 SUMMARY ROADMAP

| Fase | Duración | Prioridad | Features |
|------|----------|-----------|----------|
| **FASE 1: MVP Core** | 3 semanas | 🔴 CRÍTICA | Skills/Achievements BD, Workout tracking, Email |
| **FASE 2: Production** | 4 semanas | 🟠 ALTA | Social, Courses, Payments, Progress |
| **FASE 3: Polish** | 4 semanas | 🟡 MEDIA | Shop, Analytics, Notifications, Admin |
| **FASE 4: Scale** | 4 semanas | 🟢 MEDIA-BAJA | PostgreSQL, Performance, PWA, Mobile |
| **FASE 5: Advanced** | 4+ semanas | 🔵 BAJA | AI, Integrations |

**Total Estimado**: 16-20 semanas (4-5 meses) para versión production-ready completa

---

## 🎯 QUICK WINS (Hacer YA)

Si solo tienes **1 semana**, haz esto:

1. **Poblar BD con skills y achievements** (2 días)
2. **Configurar email service** (1 día)
3. **Completar workout tracking** (2 días)
4. **Testing manual exhaustivo** (2 días)

Esto te da un **MVP 100% funcional** listo para usuarios reales.

---

## 📋 NEXT STEPS INMEDIATOS

### Esta Semana:
1. ✅ Review este roadmap
2. ✅ Priorizar features según tu objetivo
3. ✅ Crear issues en GitHub para cada tarea
4. ✅ Empezar con FASE 1.1: Poblar BD

### Próxima Semana:
1. ✅ Completar FASE 1 (MVP Core)
2. ✅ Testing manual
3. ✅ Deploy a staging
4. ✅ Invitar beta testers

---

**¿Preguntas? ¿Necesitas ayuda implementando algo específico?**

Déjame saber y puedo ayudarte a implementar cualquiera de estas features paso a paso.
