import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Configuración del sistema de niveles
const LEVEL_CONFIG = {
  // XP requerido para cada nivel (acumulativo)
  levels: [
    { level: 1, requiredXP: 0, title: 'Novato' },
    { level: 2, requiredXP: 100, title: 'Principiante' },
    { level: 3, requiredXP: 250, title: 'Aprendiz' },
    { level: 4, requiredXP: 450, title: 'Practicante' },
    { level: 5, requiredXP: 700, title: 'Competente' },
    { level: 6, requiredXP: 1000, title: 'Experimentado' },
    { level: 7, requiredXP: 1350, title: 'Avanzado' },
    { level: 8, requiredXP: 1750, title: 'Experto' },
    { level: 9, requiredXP: 2200, title: 'Veterano' },
    { level: 10, requiredXP: 2700, title: 'Maestro' },
    { level: 11, requiredXP: 3250, title: 'Gran Maestro' },
    { level: 12, requiredXP: 3850, title: 'Élite' },
    { level: 13, requiredXP: 4500, title: 'Campeón' },
    { level: 14, requiredXP: 5200, title: 'Leyenda' },
    { level: 15, requiredXP: 6000, title: 'Mítico' },
  ],
  // Recompensas por subir de nivel
  levelUpRewards: {
    coins: 50, // Monedas base por nivel
    bonusMultiplier: 1.2, // Multiplicador que aumenta con cada nivel
  },
};

function calculateLevel(totalXP: number) {
  let currentLevel = 1;
  let nextLevelXP = 0;
  let currentLevelXP = 0;

  for (let i = LEVEL_CONFIG.levels.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_CONFIG.levels[i].requiredXP) {
      currentLevel = LEVEL_CONFIG.levels[i].level;
      currentLevelXP = LEVEL_CONFIG.levels[i].requiredXP;
      
      // Encontrar el siguiente nivel
      if (i < LEVEL_CONFIG.levels.length - 1) {
        nextLevelXP = LEVEL_CONFIG.levels[i + 1].requiredXP;
      } else {
        nextLevelXP = totalXP; // Nivel máximo alcanzado
      }
      break;
    }
  }

  const progressToNext = nextLevelXP > currentLevelXP 
    ? ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    : 100;

  return {
    currentLevel,
    currentLevelInfo: LEVEL_CONFIG.levels.find(l => l.level === currentLevel),
    nextLevelInfo: LEVEL_CONFIG.levels.find(l => l.level === currentLevel + 1),
    progressToNext: Math.min(progressToNext, 100),
    xpInCurrentLevel: totalXP - currentLevelXP,
    xpNeededForNext: Math.max(nextLevelXP - totalXP, 0),
  };
}

// GET - Obtener información de nivel del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        totalXP: true,
        currentLevel: true,
        virtualCoins: true,
      },
    });

    // Fallback: si el usuario no existe (p.ej. DB reseteada), devolver valores por defecto
    const userSafe = user ?? {
      totalXP: 0,
      currentLevel: 1,
      virtualCoins: 0,
    };

    const levelInfo = calculateLevel(userSafe.totalXP || 0);

    // Obtener estadísticas adicionales
    const skillStats = await prisma.userSkill.groupBy({
      by: ['isCompleted'],
      where: {
        userId: session.user.id,
      },
      _count: {
        id: true,
      },
    });

    const completedSkills = skillStats.find(s => s.isCompleted)?._count.id || 0;
    const totalSkills = skillStats.reduce((sum, s) => sum + s._count.id, 0);

    return NextResponse.json({
      user: {
        totalXP: userSafe.totalXP || 0,
        currentLevel: userSafe.currentLevel || 1,
        virtualCoins: userSafe.virtualCoins || 0,
      },
      levelInfo,
      stats: {
        completedSkills,
        totalSkills,
        completionRate: totalSkills > 0 ? (completedSkills / totalSkills) * 100 : 0,
      },
      levelConfig: LEVEL_CONFIG.levels,
    });
  } catch (error) {
    console.error('Error al obtener información de nivel:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Actualizar nivel del usuario (llamado automáticamente cuando se gana XP)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        totalXP: true,
        currentLevel: true,
        virtualCoins: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const levelInfo = calculateLevel(user.totalXP || 0);
    const newLevel = levelInfo.currentLevel;
    const oldLevel = user.currentLevel || 1;

    let levelUpRewards = null;

    // Si subió de nivel, otorgar recompensas
    if (newLevel > oldLevel) {
      const levelsGained = newLevel - oldLevel;
      const coinsReward = Math.floor(
        LEVEL_CONFIG.levelUpRewards.coins * 
        Math.pow(LEVEL_CONFIG.levelUpRewards.bonusMultiplier, newLevel - 1) * 
        levelsGained
      );

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          currentLevel: newLevel,
          virtualCoins: {
            increment: coinsReward,
          },
        },
      });

      levelUpRewards = {
        levelsGained,
        coinsEarned: coinsReward,
        newLevel,
        oldLevel,
      };
    } else {
      // Solo actualizar el nivel si es necesario
      if (user.currentLevel !== newLevel) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            currentLevel: newLevel,
          },
        });
      }
    }

    return NextResponse.json({
      levelInfo,
      levelUpRewards,
      updated: newLevel !== oldLevel,
    });
  } catch (error) {
    console.error('Error al actualizar nivel del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}