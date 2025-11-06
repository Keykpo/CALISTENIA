import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { z } from 'zod';
import { sendMail } from '@/lib/email';

const prisma = new PrismaClient();

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = forgotPasswordSchema.parse(body);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    // For security, always return success even if user does not exist
    if (!user) {
      return NextResponse.json(
        { message: 'If the email exists, you will receive a recovery link' },
        { status: 200 }
      );
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora
    
    // Save token in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });
    
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    
    // Send email with the reset link
    await sendMail({
      to: user.email,
      subject: 'Reset your password',
      html: `
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour. If you did not request this, you can safely ignore this email.</p>
        <p>— Calisthenics Platform</p>
      `,
    });
    
    return NextResponse.json(
      { message: 'If the email exists, you will receive a recovery link' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Forgot password error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}