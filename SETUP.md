# 🚀 Guía de Configuración - Plataforma de Calistenia

## 🔧 Configuración Inicial

### 1. Variables de Entorno

El archivo `.env.local` ya está configurado en `apps/web/.env.local` con:

- **DATABASE_URL**: Ruta a la base de datos SQLite
- **NEXTAUTH_URL**: URL de la aplicación
- **NEXTAUTH_SECRET**: Clave secreta para NextAuth

### 2. Crear la Base de Datos

**IMPORTANTE**: Debido a restricciones de red en GitHub Codespaces, necesitas ejecutar esto **localmente**:

```bash
# Generar el cliente de Prisma
npx prisma generate

# Crear y aplicar el schema a la base de datos
npx prisma db push
```

Esto creará:
- Archivo de base de datos: `prisma/dev.db`
- Todas las tablas necesarias según el schema

### 3. Poblar la Base de Datos (Opcional)

Para agregar skills y achievements iniciales:

```bash
# Ejecutar el seeding
npm run db:seed
```

Esto agregará:
- ✅ 45 skills avanzadas (Rank A y S)
- ✅ 70+ achievements
- ✅ Relaciones de prerequisitos entre skills

### 4. Iniciar el Servidor

```bash
# Desde la raíz del proyecto
npm run dev

# O desde apps/web
cd apps/web
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

---

## 🐛 Solución de Problemas

### Problema: Error de Registro - "Error interno del servidor"

**Causas comunes:**

1. **Base de datos no creada**
   ```bash
   # Solución
   npx prisma db push
   ```

2. **Prisma Client no generado**
   ```bash
   # Solución
   npx prisma generate
   ```

3. **Archivo .env faltante**
   - Verifica que existe `apps/web/.env.local`
   - Verifica que `DATABASE_URL` apunta a `file:../../prisma/dev.db`

### Problema: "Failed to fetch the engine file" (403 Forbidden)

Este error ocurre en GitHub Codespaces debido a restricciones de red.

**Solución:**
1. Clona el repositorio localmente
2. Ejecuta `npx prisma generate` y `npx prisma db push` localmente
3. Sube los archivos generados:
   - `prisma/dev.db` (la base de datos)
   - `node_modules/.prisma/client/` (cliente generado)

### Problema: Next.js dice que está desactualizado

**Solución:**
```bash
npm install next@latest
```

O ignora el warning - Next.js 14.2.33 funciona correctamente.

---

## 📝 Verificar que Todo Funciona

### 1. Verificar Base de Datos

```bash
# Abrir Prisma Studio para inspeccionar la BD
npx prisma studio
```

Verifica que existan las tablas:
- `users`
- `skills`
- `achievements`
- Y todas las demás

### 2. Probar Registro de Usuario

1. Navega a: `http://localhost:3000/auth/register`
2. Completa el formulario:
   - Nombre: Test
   - Email: test@example.com
   - Contraseña: 123456
3. Haz clic en "Crear Cuenta"

**Resultado esperado:**
- ✅ "¡Cuenta creada exitosamente!"
- ✅ Redirección automática al dashboard
- ✅ Usuario visible en Prisma Studio

### 3. Verificar Dashboard

Después del registro, deberías ver:
- Estadísticas del usuario (Level, XP, Coins, etc.)
- Misiones diarias
- Progreso del hexágono
- Lista de skills disponibles

---

## 🔐 Configuración de Autenticación

### NextAuth

El proyecto usa NextAuth v4 con:
- **Provider**: Credentials (email/password)
- **Adapter**: Prisma
- **Session**: JWT

### Agregar Otros Providers (Opcional)

Para agregar Google OAuth:

1. Obtén credenciales en [Google Cloud Console](https://console.cloud.google.com)
2. Agrega a `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=tu-client-id
   GOOGLE_CLIENT_SECRET=tu-client-secret
   ```
3. Descomenta el provider de Google en `apps/web/src/app/api/auth/[...nextauth]/route.ts`

---

## 📧 Configuración de Email (Opcional)

Para habilitar "Olvidé mi contraseña":

1. Configura SMTP en `.env.local`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=tu-app-password
   SMTP_FROM="Calistenia <no-reply@calistenia.com>"
   ```

2. Para Gmail, necesitas una "App Password":
   - Ve a: https://myaccount.google.com/apppasswords
   - Genera una contraseña para la app
   - Úsala en `SMTP_PASS`

---

## 🚀 Despliegue en Producción

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Agrega las variables de entorno:
   ```
   DATABASE_URL=<tu-base-de-datos-produccion>
   NEXTAUTH_URL=<tu-dominio>
   NEXTAUTH_SECRET=<genera-uno-seguro>
   ```
3. Despliega

**IMPORTANTE**: Para producción, usa PostgreSQL o MySQL en lugar de SQLite.

### Cambiar a PostgreSQL

1. Actualiza `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Actualiza `DATABASE_URL` en `.env.local`:
   ```
   DATABASE_URL="postgresql://user:pass@host:5432/dbname"
   ```

3. Aplica migraciones:
   ```bash
   npx prisma migrate dev
   ```

---

## 📚 Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de NextAuth](https://next-auth.js.org)
- [Documentación de Next.js 14](https://nextjs.org/docs)
- [Roadmap del Proyecto](./ROADMAP_COMPLETO.md)
- [Guía de Seeding](./prisma/seeds/README.md)

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras problemas:

1. Revisa los logs del servidor:
   ```bash
   tail -f /tmp/nextjs.log
   ```

2. Verifica la conexión de Prisma:
   ```bash
   npx prisma db pull
   ```

3. Regenera el cliente:
   ```bash
   rm -rf node_modules/.prisma
   npx prisma generate
   ```

4. Abre un issue en GitHub con:
   - Descripción del problema
   - Logs de error
   - Pasos para reproducir
