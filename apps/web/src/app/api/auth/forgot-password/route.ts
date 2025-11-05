import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { z } from 'zod';

const prisma = new PrismaClient();

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = forgotPasswordSchema.parse(body);
    
    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    // Por seguridad, siempre devolvemos éxito, incluso si el usuario no existe
    if (!user) {
      return NextResponse.json(
        { message: 'Si el email existe, recibirás un enlace de recuperación' },
        { status: 200 }
      );
    }
    
    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora
    
    // Guardar token en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });
    
    // TODO: Enviar email con el token
    // Por ahora, solo logueamos el token para desarrollo
    console.log(`Reset token for ${user.email}: ${resetToken}`);
    console.log(`Reset URL: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`);
    
    return NextResponse.json(
      { message: 'Si el email existe, recibirás un enlace de recuperación' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error en forgot password:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}