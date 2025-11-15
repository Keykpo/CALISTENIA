import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import {
  apiSuccess,
  apiValidationError,
  apiConflict,
  apiBadRequest,
  apiInternalError,
} from "@/lib/api-response";

export const runtime = "nodejs";

/**
 * Returns default fields for user creation
 * Includes a fallback mechanism for P2022 errors (missing columns)
 */
async function getDefaultUserFields() {
  const defaults: Record<string, any> = {};

  // Try to set all RPG fields with defaults
  // If a field doesn't exist in DB (P2022 error), it will be caught in the main handler
  const fieldsToTry = {
    totalXP: 0,
    currentLevel: 1,
    virtualCoins: 0,
    totalStrength: 0,
    dailyStreak: 0,
    fitnessLevel: 'BEGINNER',
    isActive: true,
  };

  // For now, return all fields. If any fail, they'll be caught by error handler
  return fieldsToTry;
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data = registerSchema.parse(json);

    console.log('[REGISTER] Starting registration for:', data.email);

    // Verificar si el usuario ya existe
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, email: true },
    });

    if (existing) {
      console.log('[REGISTER] User already exists:', data.email);
      return apiConflict("El email ya está registrado");
    }

    // Generate username from email if not provided, ensure uniqueness
    let username = data.username || data.email.split("@")[0];
    username = username.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    // If username exists, append random number
    if (existingUsername) {
      const randomSuffix = Math.floor(Math.random() * 10000);
      username = username + '_' + randomSuffix;
    }

    console.log('[REGISTER] Generated username:', username);

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);
    console.log('[REGISTER] Password hashed successfully');

    // Crear usuario con todos los campos necesarios
    // Nota: Campos con @default en schema.prisma no necesitan especificarse
    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        username,
        password: hashedPassword,
        emailVerified: new Date(), // Auto-verify for development
        goals: JSON.stringify([]), // Required field
        // Los siguientes campos tienen defaults en schema pero los especificamos
        // para mayor claridad y para evitar problemas de sincronización
        ...(await getDefaultUserFields()),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        createdAt: true,
      },
    });

    console.log('[REGISTER] User created successfully:', user.id);

    return apiSuccess(
      { user, redirectTo: '/dashboard' },
      "Usuario creado exitosamente",
      201
    );
  } catch (err: any) {
    console.error('[REGISTER] Error:', err);

    // Zod validation errors
    if (err.name === 'ZodError') {
      return apiValidationError(err);
    }

    // Prisma unique constraint error
    if (err?.code === "P2002") {
      const target = err?.meta?.target;
      const message = target?.includes('email')
        ? "El email ya está registrado"
        : "El nombre de usuario ya existe";
      return apiConflict(message);
    }

    // Prisma errors
    if (err?.code === "P2003") {
      return apiBadRequest("Error de referencia en la base de datos");
    }

    if (err?.code === "P2000") {
      return apiBadRequest("Valor demasiado largo para uno de los campos");
    }

    if (err?.code === "P2022") {
      const columnName = err?.meta?.column;
      console.error('[REGISTER] Database schema out of sync. Missing column:', columnName);
      return apiInternalError(
        new Error(`La columna '${columnName}' no existe en la base de datos. Ejecuta: npx prisma db push`)
      );
    }

    // Generic error handler
    return apiInternalError(err);
  }
}
