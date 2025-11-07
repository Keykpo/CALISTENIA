import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // En producción, deshabilitar por seguridad si no está gestionado por backend dedicado
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Endpoint no disponible en producción" },
      { status: 404 }
    );
  }

  try {
    const json = await req.json();
    const data = registerSchema.parse(json);

    // Verificar si el usuario ya existe
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 }
      );
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Crear usuario con campos requeridos por el esquema
    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        username: (data.username ?? data.email.split("@")[0]).toLowerCase(),
        password: hashedPassword,
        // Para permitir login de desarrollo inmediato
        emailVerified: new Date(),
        // Campos requeridos
        goals: JSON.stringify([]),
        // Valores por defecto del sistema RPG ya definidos en el esquema
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

    return NextResponse.json(
      { message: "Usuario creado exitosamente", user },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: err.errors },
        { status: 400 }
      );
    }
    // Prisma error de única clave
    if ((err as any)?.code === "P2002") {
      return NextResponse.json(
        { error: "Usuario ya existe" },
        { status: 409 }
      );
    }
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
