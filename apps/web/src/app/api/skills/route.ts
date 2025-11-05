import { NextRequest, NextResponse } from 'next/server';
// Evitar inicializar Prisma al cargar el módulo; haremos import dinámico dentro del handler.
// Esto previene errores cuando @prisma/client aún no está generado.
import fs from 'fs';
import path from 'path';

/**
 * GET /api/skills
 * Obtiene todas las skills con sus prerequisitos
 * Filtros opcionales: branch, difficulty
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get('branch');
    const difficulty = searchParams.get('difficulty');
    let prisma: any = null;
    try {
      // Import dinámico seguro: si falla, seguimos con fallback a JSON público
      prisma = (await import('@/lib/prisma')).prisma;
    } catch (_) {
      prisma = null;
    }
    
    // Construir filtros
    const where: any = {};
    if (branch) where.branch = branch;
    if (difficulty) where.difficulty = difficulty;

    const skills = prisma ? await prisma.skill.findMany({
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
    }) : [];

    // Transformar para frontend - aplanar prerequisites
    const skillsWithPrerequisites = skills.map(skill => ({
      ...skill,
      prerequisites: skill.prerequisites.map(p => p.prerequisite),
    }));

    // Fallback: si la BD está vacía, leer desde public/skills.json
    if (skillsWithPrerequisites.length === 0) {
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
        // Si falla el fallback, continuamos devolviendo la respuesta original
      }
    }

    return NextResponse.json({
      success: true,
      skills: skillsWithPrerequisites,
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
