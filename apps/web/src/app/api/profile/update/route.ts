import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().max(50).optional(),
  height: z.string().or(z.number()).optional(),
  weight: z.string().or(z.number()).optional(),
  fitnessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
});

async function getUserId(req: NextRequest) {
  const headerUser = req.headers.get('x-user-id');
  if (headerUser) return headerUser;
  return null;
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Convert string numbers to actual numbers for height and weight
    const updateData: any = { ...validatedData };
    if (updateData.height) {
      updateData.height = parseFloat(updateData.height.toString());
    }
    if (updateData.weight) {
      updateData.weight = parseFloat(updateData.weight.toString());
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        height: true,
        weight: true,
        fitnessLevel: true,
        gender: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
