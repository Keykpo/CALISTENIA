import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { fitnessLevel, recommendedExercises } = await request.json()

    if (!fitnessLevel) {
      return NextResponse.json(
        { error: 'Nivel de fitness requerido' },
        { status: 400 }
      )
    }

    // Validar que el nivel de fitness sea válido
    const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']
    if (!validLevels.includes(fitnessLevel)) {
      return NextResponse.json(
        { error: 'Nivel de fitness inválido' },
        { status: 400 }
      )
    }

    // Actualizar el perfil del usuario
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fitnessLevel: fitnessLevel,
        // Guardar los ejercicios recomendados como JSON si se proporcionan
        ...(recommendedExercises && {
          goals: JSON.stringify(recommendedExercises)
        })
      }
    })

    return NextResponse.json({
      message: 'Nivel de fitness actualizado correctamente',
      fitnessLevel: updatedUser.fitnessLevel
    })

  } catch (error) {
    console.error('Error updating fitness level:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        fitnessLevel: true,
        goals: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      fitnessLevel: user.fitnessLevel,
      recommendedExercises: user.goals ? JSON.parse(user.goals) : []
    })

  } catch (error) {
    console.error('Error getting fitness level:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}