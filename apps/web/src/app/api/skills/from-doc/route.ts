import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';

type Branch = 'EMPUJE' | 'TRACCION' | 'CORE' | 'EQUILIBRIO' | 'TREN_INFERIOR' | 'ESTATICOS';

type PhysioDemand = {
  fuerza: number;
  resistencia: number;
  equilibrio: number;
  control: number; // control corporal
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

const DOC_PATH = 'C\\\\Users\\FRAN\\cp\\ARBOLDEHABILIDADES.txt';

const normalize = (s: string) => s.trim().toLowerCase();
const slug = (s: string) => normalize(s).replace(/[^a-z0-9]+/g, '-');

const rankToDifficulty = (r: string): SkillOut['difficulty'] => {
  const rr = r.toUpperCase();
  if (rr === 'F' || rr === 'F+') return 'BEGINNER';
  if (rr === 'E' || rr === 'D' || rr === 'D+') return 'INTERMEDIATE';
  if (rr === 'C' || rr === 'B' || rr === 'A' || rr === 'A+') return 'ADVANCED';
  if (rr === 'S' || rr === 'S+') return 'EXPERT';
  return 'BEGINNER';
};

const headingToBranch = (line: string): Branch | null => {
  const l = line.toLowerCase();
  if (l.includes('empuje')) return 'EMPUJE';
  if (l.includes('tracción') || l.includes('traccion')) return 'TRACCION';
  if (l.includes('core')) return 'CORE';
  if (l.includes('piernas')) return 'TREN_INFERIOR';
  if (l.includes('equilibrio') || l.includes('invertidos')) return 'EQUILIBRIO';
  if (l.includes('estáticos') || l.includes('estaticos') || l.includes('planche') || l.includes('front lever')) return 'ESTATICOS';
  return null;
};

const parseDemand = (text: string): PhysioDemand | undefined => {
  const fuerzaAreaMatch = text.match(/Fuerza\s*\(([^)]+)\)\s*(\d+)%/i);
  const fuerzaSimpleMatch = text.match(/Fuerza[^%]*?(\d+)%/i);
  const resistenciaMatch = text.match(/Resistencia[^%]*?(\d+)%/i);
  const equilibrioMatch = text.match(/Equilibrio[^%]*?(\d+)%/i);
  const controlMatch = text.match(/Control(?:\s*corporal)?[^%]*?(\d+)%/i);
  const movilidadMatch = text.match(/Movilidad[^%]*?(\d+)%/i);
  const fuerza = fuerzaAreaMatch ? parseInt(fuerzaAreaMatch[2], 10) : fuerzaSimpleMatch ? parseInt(fuerzaSimpleMatch[1], 10) : undefined;
  const fuerzaArea = fuerzaAreaMatch ? fuerzaAreaMatch[1] : undefined;
  const resistencia = resistenciaMatch ? parseInt(resistenciaMatch[1], 10) : undefined;
  const equilibrio = equilibrioMatch ? parseInt(equilibrioMatch[1], 10) : undefined;
  const control = controlMatch ? parseInt(controlMatch[1], 10) : undefined;
  const movilidad = movilidadMatch ? parseInt(movilidadMatch[1], 10) : undefined;
  if ([fuerza, resistencia, equilibrio, control, movilidad].some(v => typeof v === 'number')) {
    return {
      fuerza: fuerza ?? 0,
      resistencia: resistencia ?? 0,
      equilibrio: equilibrio ?? 0,
      control: control ?? 0,
      movilidad: movilidad ?? 0,
      fuerzaArea,
    };
  }
  return undefined;
};

export async function GET(_req: NextRequest) {
  try {
    const raw = await fs.readFile(DOC_PATH, 'utf8');
    const lines = raw.split(/\r?\n/);
    let currentBranch: Branch | null = null;
    type TempSkill = {
      id: string;
      name: string;
      description?: string;
      branch: Branch;
      difficulty: SkillOut['difficulty'];
      prereqNames: string[];
      physioDemand?: PhysioDemand;
    };
    const skills: TempSkill[] = [];

    // First pass: parse sections and skills
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const b = headingToBranch(line);
      if (b) {
        currentBranch = b;
        continue;
      }

      // Match: Rango X – Nombre: Descripción ...
      const m = line.match(/^Rango\s+([A-Z]\+?)\s+[–-]\s+(.+?)(?::|\s-\s|$)/);
      if (m && currentBranch) {
        const rank = m[1];
        const name = m[2].trim();
        const descriptionParts: string[] = [];
        let j = i + 1;
        let demandText: string | null = null;
        let prereqText: string | null = null;
        while (j < lines.length) {
          const ln = lines[j].trim();
          if (!ln) { j++; continue; }
          if (/^Rango\s+[A-Z]/i.test(ln) || headingToBranch(ln)) break; // next skill or heading
          if (/^Demanda\s+fisiológica:/i.test(ln)) {
            demandText = ln;
          } else if (/^Requisitos\s+previos:/i.test(ln)) {
            prereqText = ln;
          } else {
            descriptionParts.push(ln);
          }
          j++;
        }

        const demand = demandText ? parseDemand(demandText) : undefined;
        const prereqNames: string[] = [];
        if (prereqText) {
          const pr = prereqText.replace(/^Requisitos\s+previos:\s*/i, '');
          const candidates = pr
            .split(/[,;\.]/)
            .map(x => x.trim())
            .filter(x => x.length > 0);
          // Heuristic: pick capitalized words segments as names
          for (const seg of candidates) {
            // keep phrases that look like exercise names (contain a verbo or known keywords)
            if (/flexiones|fondos|dominadas|remo|sentadilla|zancadas|pistol|l-sit|v-sit|dragon|pino|planche|front\s+lever|hollow|plank|toes\s+to\s+bar/i.test(seg)) {
              prereqNames.push(seg.replace(/aproximadamente|al menos|idealmente|con buena técnica|controlado|sólidas|capaz de|negativas|asistidas/gi, '').trim());
            }
          }
        }

        skills.push({
          id: `doc-${slug(name)}`,
          name,
          description: descriptionParts.join(' '),
          branch: currentBranch,
          difficulty: rankToDifficulty(rank),
          prereqNames,
          physioDemand: demand,
        });
      }
    }

    // Second pass: link prerequisites by name
    const byName = new Map<string, TempSkill>();
    skills.forEach(s => byName.set(normalize(s.name), s));
    const out: SkillOut[] = skills.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      branch: s.branch,
      difficulty: s.difficulty,
      physioDemand: s.physioDemand,
      prerequisites: s.prereqNames
        .map(n => byName.get(normalize(n)))
        .filter(Boolean)
        .map(ps => ({ id: ps!.id, name: ps!.name, branch: ps!.branch, difficulty: ps!.difficulty })),
    }));

    return NextResponse.json({ success: true, skills: out, total: out.length });
  } catch (err) {
    console.error('Error al parsear ARBOLDEHABILIDADES.txt:', err);
    return NextResponse.json({ error: 'No se pudo leer el documento de habilidades' }, { status: 500 });
  }
}