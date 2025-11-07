import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

async function getUserId(req: NextRequest) {
  const headerUser = req.headers.get('x-user-id');
  if (headerUser) return headerUser;

  const { searchParams } = new URL(req.url);
  const qp = searchParams.get('userId');
  if (qp) return qp;

  return null;
}

/**
 * GET /api/skills
 * Obtiene todas las skills con sus prerequisitos y progreso del usuario
 * Filtros opcionales: branch, difficulty
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get('branch');
    const difficulty = searchParams.get('difficulty');

    // Construir filtros
    const where: any = {};
    if (branch) where.branch = branch;
    if (difficulty) where.difficulty = difficulty;

    const skills = await prisma.skill.findMany({
      where,
      include: {
        prerequisites: {
          include: {
            prerequisite: {
              select: {
                id: true,
                name: true,
                difficulty: true,
                branch: true,
                order: true,
              },
            },
          },
        },
      },
      orderBy: [
        { branch: 'asc' },
        { order: 'asc' },
      ],
    });

    // Si hay userId, traer el progreso del usuario
    let userSkills: any[] = [];
    if (userId) {
      userSkills = await prisma.userSkill.findMany({
        where: { userId },
      });
    }

    // Transformar para frontend - aplanar prerequisites y agregar info del usuario
    const skillsWithUserData = skills.map(skill => {
      const userSkill = userSkills.find(us => us.skillId === skill.id);

      return {
        ...skill,
        prerequisites: skill.prerequisites.map(p => p.prerequisite),
        isUnlocked: userSkill?.isUnlocked || false,
        userProgress: userSkill ? {
          currentReps: userSkill.currentReps,
          currentDuration: userSkill.currentDuration,
          daysCompleted: userSkill.daysCompleted,
          completionProgress: userSkill.completionProgress,
        } : undefined,
      };
    });

    // Fallback: si la BD está vacía, leer desde public/skills.json
    if (skills.length === 0) {
      try {
        const publicJsonPath = path.join(process.cwd(), 'public', 'skills.json');
        const raw = fs.readFileSync(publicJsonPath, 'utf-8');
        const parsed = JSON.parse(raw);
        const arr: any[] = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.skills) ? parsed.skills : []);

        const normalizeBranch = (b: string) => (b === 'PIERNAS' ? 'TREN_INFERIOR' : b);
        let normalized = arr.map((s) => ({
          ...s,
          branch: normalizeBranch(String(s.branch)),
          prerequisites: Array.isArray(s.prerequisites) ? s.prerequisites : [],
          isUnlocked: false,
        }));

        if (branch) normalized = normalized.filter((s) => String(s.branch) === branch);
        if (difficulty) normalized = normalized.filter((s) => String(s.difficulty) === difficulty);

        return NextResponse.json({
          success: true,
          skills: normalized,
          total: normalized.length,
          source: 'public-json',
          filters: {
            branch,
            difficulty,
          },
        });
      } catch (e) {
        console.warn('Fallback public/skills.json no disponible:', e);
      }
    }

    return NextResponse.json({
      success: true,
      skills: skillsWithUserData,
      total: skills.length,
      filters: {
        branch,
        difficulty,
      },
    });
  } catch (error) {
    console.error('Error al obtener skills:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
