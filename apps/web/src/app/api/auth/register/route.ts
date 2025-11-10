import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
});

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
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 }
      );
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

    return NextResponse.json(
      {
        success: true,
        message: "Usuario creado exitosamente",
        user,
        redirectTo: '/dashboard'
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[REGISTER] Error:', err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: err.errors.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    // Prisma unique constraint error
    if (err?.code === "P2002") {
      const target = err?.meta?.target;
      return NextResponse.json(
        {
          error: target?.includes('email')
            ? "El email ya está registrado"
            : "El nombre de usuario ya existe"
        },
        { status: 409 }
      );
    }

    // Prisma foreign key constraint error
    if (err?.code === "P2003") {
      return NextResponse.json(
        { error: "Error de referencia en la base de datos" },
        { status: 400 }
      );
    }

    // Prisma field validation error
    if (err?.code === "P2000") {
      return NextResponse.json(
        { error: "Valor demasiado largo para uno de los campos" },
        { status: 400 }
      );
    }

    // Prisma column doesn't exist error (P2022)
    // This happens when schema is out of sync with database
    if (err?.code === "P2022") {
      const columnName = err?.meta?.column;
      console.error('[REGISTER] Database schema out of sync. Missing column:', columnName);

      return NextResponse.json(
        {
          error: "Error de configuración de base de datos",
          message: `La columna '${columnName}' no existe en la base de datos`,
          solution: "Ejecuta en la terminal: npx prisma db push --accept-data-loss",
          technicalDetails: {
            code: "P2022",
            column: columnName,
            suggestion: "La base de datos necesita ser sincronizada con el schema de Prisma"
          }
        },
        { status: 500 }
      );
    }

    // Show full error in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        {
          error: "Error interno del servidor",
          message: err?.message || String(err),
          code: err?.code,
          details: err?.meta
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
