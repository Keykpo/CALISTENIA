# 🌟 Sistema Social Completo - Plataforma de Fitness

## 📋 Descripción General

Se ha implementado un sistema social completo para la plataforma de fitness, incluyendo:

- ✅ Feed Social con posts, fotos y videos
- ✅ Sistema de Amigos/Seguidores
- ✅ Likes y Comentarios
- ✅ Notificaciones en tiempo real
- ✅ Mensajería Directa (DMs)
- ✅ Activity Feed (actividades de amigos)
- 🔄 Comunidades/Grupos (schema listo, APIs pendientes)
- 🔄 Desafíos entre Amigos (schema listo, APIs pendientes)
- 🔄 Compartir Entrenamientos (schema listo, APIs pendientes)

## 🗄️ Modelos de Base de Datos

### Modelos Principales

```prisma
- Post (posts sociales)
- PostLike (likes en posts)
- PostComment (comentarios)
- PostShare (compartir posts)
- Friendship (relaciones de amistad)
- Notification (notificaciones)
- Conversation (conversaciones)
- DirectMessage (mensajes directos)
- Community (comunidades)
- FriendChallenge (desafíos)
- SharedWorkout (entrenamientos compartidos)
- ActivityFeedItem (feed de actividades)
- UserStats (estadísticas sociales)
```

## 📡 API Routes Implementadas

### 1. Posts/Feed Social

#### GET `/api/social/posts`
Obtiene el feed de posts (propios + amigos)

**Query Params:**
- `limit` (default: 20)
- `offset` (default: 0)
- `filter`: `all` | `friends` | `own`

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": "...",
      "userId": "...",
      "content": "Mi primer post",
      "images": ["url1", "url2"],
      "videoUrl": null,
      "type": "GENERAL",
      "likesCount": 10,
      "commentsCount": 5,
      "sharesCount": 2,
      "isLiked": true,
      "user": {
        "id": "...",
        "username": "user1",
        "avatar": "..."
      },
      "createdAt": "..."
    }
  ],
  "hasMore": true
}
```

#### POST `/api/social/posts`
Crea un nuevo post

**Body:**
```json
{
  "content": "¡Completé mi primera muscle-up!",
  "images": ["url1", "url2"],
  "videoUrl": "https://...",
  "type": "ACHIEVEMENT",
  "workoutId": "...",
  "achievement": "{\"type\": \"muscle_up\", \"count\": 1}"
}
```

**Tipos de Posts:**
- `GENERAL`: Post general
- `WORKOUT_SHARE`: Compartir un entrenamiento
- `PROGRESS_UPDATE`: Actualización de progreso
- `ACHIEVEMENT`: Logro alcanzado
- `QUESTION`: Pregunta
- `TIP`: Consejo/tip
- `MOTIVATION`: Post motivacional
- `CHALLENGE`: Anuncio de desafío

### 2. Likes en Posts

#### POST `/api/social/posts/[id]/like`
Dale like a un post

**Response:**
```json
{
  "success": true
}
```

#### DELETE `/api/social/posts/[id]/like`
Quita el like de un post

### 3. Comentarios

#### GET `/api/social/posts/[id]/comments`
Obtiene comentarios de un post

**Response:**
```json
{
  "success": true,
  "comments": [
    {
      "id": "...",
      "postId": "...",
      "userId": "...",
      "content": "¡Increíble progreso!",
      "user": {
        "username": "user1",
        "avatar": "..."
      },
      "replies": [
        {
          "id": "...",
          "content": "Gracias!",
          "user": {...}
        }
      ],
      "createdAt": "..."
    }
  ]
}
```

#### POST `/api/social/posts/[id]/comments`
Crea un comentario

**Body:**
```json
{
  "content": "¡Excelente trabajo!",
  "parentId": "..." // Opcional, para respuestas
}
```

### 4. Sistema de Amigos

#### GET `/api/social/friends`
Obtiene lista de amigos

**Query Params:**
- `status`: `ACCEPTED` | `PENDING` | `BLOCKED`

**Response:**
```json
{
  "success": true,
  "friends": [
    {
      "friendshipId": "...",
      "friend": {
        "id": "...",
        "username": "user2",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "...",
        "fitnessLevel": "INTERMEDIATE"
      },
      "status": "ACCEPTED",
      "createdAt": "...",
      "isSender": false
    }
  ]
}
```

#### POST `/api/social/friends`
Envía solicitud de amistad

**Body:**
```json
{
  "userId": "target-user-id"
}
```

#### PUT `/api/social/friends/[id]`
Acepta o rechaza solicitud de amistad

**Body:**
```json
{
  "action": "accept" // o "reject"
}
```

#### DELETE `/api/social/friends/[id]`
Elimina amigo o cancela solicitud

### 5. Notificaciones

#### GET `/api/social/notifications`
Obtiene notificaciones

**Query Params:**
- `limit` (default: 50)
- `unreadOnly`: `true` | `false`

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "...",
      "type": "POST_LIKE",
      "title": "New Like",
      "message": "user1 liked your post",
      "isRead": false,
      "actorId": "...",
      "postId": "...",
      "createdAt": "..."
    }
  ],
  "unreadCount": 5
}
```

**Tipos de Notificaciones:**
- `FRIEND_REQUEST`: Solicitud de amistad
- `FRIEND_ACCEPTED`: Solicitud aceptada
- `POST_LIKE`: Like en post
- `POST_COMMENT`: Comentario en post
- `COMMENT_REPLY`: Respuesta a comentario
- `POST_SHARE`: Post compartido
- `CHALLENGE_INVITE`: Invitación a desafío
- `CHALLENGE_COMPLETED`: Desafío completado
- `WORKOUT_MILESTONE`: Hito alcanzado
- `ACHIEVEMENT_EARNED`: Logro obtenido
- `MESSAGE_RECEIVED`: Mensaje recibido
- `GROUP_INVITE`: Invitación a grupo
- `MENTION`: Mención en post/comentario

#### PUT `/api/social/notifications`
Marca notificaciones como leídas

**Body:**
```json
{
  "notificationIds": ["id1", "id2"], // Específicas
  "markAll": true // O marca todas
}
```

#### DELETE `/api/social/notifications`
Elimina notificaciones

**Query Params:**
- `id`: ID específica
- `all=true`: Todas las leídas

### 6. Mensajes Directos

#### GET `/api/social/messages`
Obtiene conversaciones

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "...",
      "partner": {
        "id": "...",
        "username": "user2",
        "avatar": "..."
      },
      "lastMessage": {
        "content": "Hola!",
        "createdAt": "...",
        "isRead": true
      },
      "unreadCount": 3,
      "lastMessageAt": "..."
    }
  ]
}
```

#### POST `/api/social/messages`
Envía un mensaje

**Body:**
```json
{
  "recipientId": "user-id",
  "content": "Hola! ¿Cómo estás?"
}
```

#### GET `/api/social/messages/[conversationId]`
Obtiene mensajes de una conversación

**Query Params:**
- `limit` (default: 50)
- `offset` (default: 0)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "...",
      "content": "Hola!",
      "senderId": "...",
      "sender": {
        "username": "user1",
        "avatar": "..."
      },
      "isRead": true,
      "createdAt": "..."
    }
  ],
  "hasMore": false
}
```

### 7. Activity Feed

#### GET `/api/social/feed`
Obtiene feed de actividades de amigos

**Query Params:**
- `limit` (default: 30)
- `offset` (default: 0)

**Response:**
```json
{
  "success": true,
  "activities": [
    {
      "id": "...",
      "type": "FRIEND_WORKOUT",
      "description": "user1 completed a workout",
      "relatedUser": {
        "username": "user1",
        "avatar": "..."
      },
      "relatedPost": null,
      "relatedWorkout": {
        "id": "...",
        "name": "Upper Body Blast",
        "difficulty": "ADVANCED"
      },
      "metadata": {...},
      "createdAt": "..."
    }
  ],
  "hasMore": true
}
```

**Tipos de Actividades:**
- `FRIEND_WORKOUT`: Amigo completó entrenamiento
- `FRIEND_ACHIEVEMENT`: Amigo obtuvo logro
- `FRIEND_MILESTONE`: Amigo alcanzó hito
- `FRIEND_POST`: Amigo creó post
- `FRIEND_JOINED`: Nuevo amigo
- `CHALLENGE_UPDATE`: Actualización de desafío
- `COMMUNITY_POST`: Post en comunidad
- `TRENDING_WORKOUT`: Entrenamiento trending

## 🚀 Próximos Pasos

### APIs Pendientes (Schema ya creado):

1. **Comunidades/Grupos**
   - Crear comunidad
   - Unirse/salir de comunidad
   - Posts en comunidad
   - Moderar comunidad

2. **Desafíos entre Amigos**
   - Crear desafío
   - Invitar amigos
   - Actualizar progreso
   - Ver leaderboard del desafío

3. **Compartir Entrenamientos**
   - Publicar entrenamiento
   - Guardar entrenamiento de otros
   - Ver entrenamientos trending
   - Completar entrenamiento compartido

### UI Components a Crear:

1. **Feed Social Component**
   - Infinite scroll
   - Like/Comment buttons
   - Share modal
   - Image/video preview

2. **Friends List Component**
   - Lista de amigos
   - Solicitudes pendientes
   - Buscar usuarios
   - Perfil de usuario

3. **Notifications Panel**
   - Dropdown con notificaciones
   - Badge de contador
   - Mark as read functionality

4. **Direct Messages Component**
   - Lista de conversaciones
   - Chat interface
   - Real-time updates (considerar WebSockets)

5. **Activity Feed Component**
   - Timeline de actividades
   - Filtros por tipo
   - Enlace a contenido relacionado

## 🎨 Ejemplo de Uso en Frontend

```typescript
// Obtener feed de posts
const response = await fetch('/api/social/posts?filter=all&limit=20');
const { posts, hasMore } = await response.json();

// Crear un post
const newPost = await fetch('/api/social/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: '¡Logré mi primera handstand!',
    type: 'ACHIEVEMENT',
    images: ['https://...']
  })
});

// Dar like
await fetch(`/api/social/posts/${postId}/like`, { method: 'POST' });

// Comentar
await fetch(`/api/social/posts/${postId}/comments`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: '¡Increíble!' })
});

// Enviar mensaje
await fetch('/api/social/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientId: 'user-id',
    content: 'Hola! ¿Entrenas hoy?'
  })
});
```

## 🔧 Configuración Necesaria

### 1. Ejecutar Migración de Prisma

```bash
npx prisma db push
npx prisma generate
```

### 2. Inicializar UserStats para usuarios existentes

Crear un script de migración para agregar UserStats a usuarios existentes:

```typescript
// scripts/init-user-stats.ts
const users = await prisma.user.findMany();
for (const user of users) {
  await prisma.userStats.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {}
  });
}
```

### 3. Configurar Uploads de Imágenes/Videos

Las APIs aceptan URLs de imágenes/videos. Necesitarás configurar:
- Servicio de almacenamiento (AWS S3, Cloudinary, etc.)
- API route para upload de archivos
- Client-side upload component

## 📊 Métricas y Estadísticas

El modelo `UserStats` rastrea:
- Número de amigos
- Posts creados
- Likes recibidos
- Total de entrenamientos
- Racha actual
- Racha más larga
- Ranking global
- Ranking entre amigos

Actualiza automáticamente cuando:
- Se acepta una amistad
- Se crea un post
- Se recibe un like
- Se completa un entrenamiento

## 🔐 Seguridad

Todas las rutas:
✅ Verifican autenticación con NextAuth
✅ Validan datos con Zod
✅ Protegen contra inyección SQL (Prisma)
✅ Validan permisos de usuario

## 💡 Tips de Implementación

1. **Optimistic UI**: Actualiza el UI antes de la respuesta del servidor
2. **Infinite Scroll**: Usa `offset` y `limit` para paginación
3. **Real-time**: Considera WebSockets para notificaciones/mensajes en tiempo real
4. **Caching**: Usa SWR o React Query para cache de datos
5. **Image Optimization**: Usa Next.js Image component para optimizar imágenes

---

¡Sistema social listo para usar! 🎉
