import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';

type Branch = 'EMPUJE' | 'TRACCION' | 'CORE' | 'EQUILIBRIO' | 'TREN_INFERIOR' | 'ESTATICOS';

type PhysioDemand = {
  fuerza: number;
  resistencia: number;
  equilibrio: number;
  control: number;
  movilidad: number;
  fuerzaArea?: string;
};

type SkillOut = {
  id: string;
  name: string;
  description?: string;
  branch: Branch;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  prerequisites: Array<Pick<SkillOut, 'id'|'name'|'branch'|'difficulty'>>;
  physioDemand?: PhysioDemand;
};

// Ruta absoluta en Windows debe escapar correctamente las barras invertidas
const DOC_PATH = 'C:\\Users\\FRAN\\cp\\ARBOLDEHABILIDADESHANDSTAND.txt';

const normalize = (s: string) => s.trim().toLowerCase();
const slug = (s: string) => normalize(s).replace(/[^a-z0-9]+/g, '-');

function mapNivelToDifficulty(nivel: string): SkillOut['difficulty'] {
  const n = nivel.trim().toUpperCase();
  // Mapeo básico por letra de nivel (F→BEGINNER, E/D→INTERMEDIATE, C/B→ADVANCED, A→EXPERT)
  if (n.startsWith('F')) return 'BEGINNER';
  if (n.startsWith('E') || n.startsWith('D')) return 'INTERMEDIATE';
  if (n.startsWith('C') || n.startsWith('B')) return 'ADVANCED';
  return 'EXPERT';
}

export async function GET(_req: NextRequest) {
  try {
    const raw = await fs.readFile(DOC_PATH, 'utf8');
    const lines = raw.split(/\r?\n/);

    type TempSkill = {
      id: string;
      name: string;
      description?: string;
      branch: Branch;
      difficulty: SkillOut['difficulty'];
      physioDemand?: PhysioDemand;
    };

    const skills: TempSkill[] = [];
    const nameOrder: string[] = [];

    // Regexp: "Nombre (Nivel X – ...)"
    const titleRegex = /^(.*?)\s*\(\s*Nivel\s+([A-Z])\b.*\)/i;
    let currentTitle: { name: string; nivel: string } | null = null;
    let currentDesc: string[] = [];
    let currentDemand: PhysioDemand | undefined = undefined;

    const flushCurrent = () => {
      if (currentTitle) {
        const name = currentTitle.name.trim();
        const id = `handstand-${slug(name)}`;
        const difficulty = mapNivelToDifficulty(currentTitle.nivel);
        skills.push({ id, name, description: currentDesc.join('\n').trim(), branch: 'EQUILIBRIO', difficulty, physioDemand: currentDemand });
        nameOrder.push(name);
      }
      currentTitle = null;
      currentDesc = [];
      currentDemand = undefined;
    };

    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i].trim();
      if (!ln) continue;
      const m = ln.match(titleRegex);
      if (m) {
        // Nueva sección de ejercicio
        flushCurrent();
        currentTitle = { name: m[1].trim(), nivel: m[2].trim().toUpperCase() };
        continue;
      }
      if (currentTitle) {
        // Capturar descripción breve (primer bloque de "Descripción:" hasta la próxima sección)
        if (/^Descripción:/i.test(ln)) {
          currentDesc.push(ln);
        } else if (/^Demandas\s+fisiológicas:/i.test(ln)) {
          // Parsear porcentajes: Fuerza X%, Equilibrio Y%, Control corporal Z%, Resistencia W%, Movilidad V%
          const fuerza = /Fuerza\s+(\d+)\s*%/i.exec(ln)?.[1];
          const equilibrio = /Equilibrio\s+(\d+)\s*%/i.exec(ln)?.[1];
          const control = /Control\s*(?:corporal)?\s+(\d+)\s*%/i.exec(ln)?.[1];
          const resistencia = /Resistencia\s+(\d+)\s*%/i.exec(ln)?.[1];
          const movilidad = /Movilidad\s+(\d+)\s*%/i.exec(ln)?.[1];
          currentDemand = {
            fuerza: fuerza ? parseInt(fuerza, 10) : 0,
            equilibrio: equilibrio ? parseInt(equilibrio, 10) : 0,
            control: control ? parseInt(control, 10) : 0,
            resistencia: resistencia ? parseInt(resistencia, 10) : 0,
            movilidad: movilidad ? parseInt(movilidad, 10) : 0,
          };
        } else if (currentDesc.length > 0 && !/^Requisitos\s+previos:/i.test(ln)) {
          currentDesc.push(ln);
        }
      }
    }
    // Volcar el último
    flushCurrent();

    // Construir prerequisitos como cadena secuencial
    const byName = new Map<string, TempSkill>();
    for (const s of skills) byName.set(normalize(s.name), s);

    const out: SkillOut[] = skills.map((s, idx) => {
      const prereqNames: string[] = [];
      if (idx > 0) prereqNames.push(nameOrder[idx - 1]);
      const prereqs = prereqNames
        .map(n => byName.get(normalize(n)))
        .filter(Boolean)
        .map(ps => ({ id: ps!.id, name: ps!.name, branch: ps!.branch, difficulty: ps!.difficulty }));
      return {
        id: s.id,
        name: s.name,
        description: s.description,
        branch: s.branch,
        difficulty: s.difficulty,
        prerequisites: prereqs,
        physioDemand: s.physioDemand,
      };
    });

    return NextResponse.json({ success: true, skills: out, total: out.length });
  } catch (err) {
    console.error('Error al parsear ARBOLDEHABILIDADESHANDSTAND.txt:', err);
    return NextResponse.json({ error: 'No se pudo leer el documento de handstand' }, { status: 500 });
  }
}