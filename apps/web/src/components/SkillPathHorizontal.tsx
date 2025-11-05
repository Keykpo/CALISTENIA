'use client';

import React, { useEffect, useMemo, useState, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Lock, Play } from 'lucide-react';

type Branch = 'EMPUJE' | 'TRACCION' | 'PULL' | 'CORE' | 'EQUILIBRIO' | 'TREN_INFERIOR' | 'ESTATICOS';

interface Skill {
  id: string;
  name: string;
  description?: string;
  branch: Branch;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  prerequisites?: Skill[];
  physioDemand?: PhysioDemand;
}

interface PhysioDemand {
  fuerza: number; // porcentaje total de fuerza
  resistencia: number;
  equilibrio: number;
  control: number; // control corporal
  movilidad: number;
  fuerzaArea?: string; // detalle del área principal de fuerza (pecho/tríceps, dorsal/bíceps, core, piernas, etc.)
}

interface UserSkill {
  id: string;
  skillId: string;
  userId: string;
  isCompleted: boolean;
  isUnlocked: boolean;
  completionProgress: number;
}

interface SkillPathProps {
  userId?: string;
}

const branchLabels: Record<Exclude<Branch, 'PULL'>, string> = {
  EMPUJE: 'Push',
  TRACCION: 'Pull',
  CORE: 'Core',
  EQUILIBRIO: 'Balance',
  TREN_INFERIOR: 'Lower Body',
  ESTATICOS: 'Statics',
};

const displayOrder: (keyof typeof branchLabels)[] = [
  'EMPUJE',
  'TRACCION',
  'CORE',
  'EQUILIBRIO',
  'TREN_INFERIOR',
  'ESTATICOS',
];

// Difficulty rank mapping (fallback by difficulty) and overrides by skill name
const rankByDifficulty: Record<Skill['difficulty'], string> = {
  BEGINNER: 'F',
  INTERMEDIATE: 'D',
  ADVANCED: 'A',
  EXPERT: 'S',
};

const normalizeName = (name: string) => name.trim().toLowerCase();

const rankOverrideByName: Record<string, string> = {
  // Push
  [normalizeName('Flexión a una mano')]: 'S',
  [normalizeName('One-Arm Push-Up')]: 'S',
  [normalizeName('Fondos en barras paralelas')]: 'B',
  [normalizeName('Flexiones diamante')]: 'D',
  [normalizeName('Flexiones estándar')]: 'F+',
  [normalizeName('Flexiones de rodillas')]: 'F',
  // Pull
  [normalizeName('Dominadas australianas')]: 'F',
  [normalizeName('Remo invertido')]: 'F',
  [normalizeName('Dominadas asistidas')]: 'E',
  [normalizeName('Dominada libre')]: 'D+',
  [normalizeName('Dominadas avanzadas')]: 'C',
  [normalizeName('Muscle-Up con banda')]: 'A',
  [normalizeName('Muscle-Up')]: 'S',
  [normalizeName('Muscle-Up (sin asistencia)')]: 'S',
  [normalizeName('Muscle Up controlado')]: 'S',
  // Core
  [normalizeName('Plancha abdominal')]: 'F',
  [normalizeName('Hollow hold')]: 'E',
  [normalizeName('Elevaciones de rodillas colgado')]: 'D',
  [normalizeName('Elevaciones de piernas (Toes to Bar)')]: 'B',
  [normalizeName('L-sit')]: 'A',
  [normalizeName('Dragon Flag')]: 'S',
  // Balance / Handstands
  [normalizeName('Postura del Cuervo')]: 'F',
  [normalizeName('Pino asistido contra la pared')]: 'D',
  [normalizeName('Pino libre')]: 'A',
  [normalizeName('Caminata en pino')]: 'A+',
  [normalizeName('Flexiones en pino')]: 'S',
  // Lower Body
  [normalizeName('Sentadilla básica')]: 'F',
  [normalizeName('Zancadas')]: 'E',
  [normalizeName('Sentadilla búlgara')]: 'D+',
  [normalizeName('Pistol Squat')]: 'A',
  [normalizeName('Salto al cajón')]: 'B',
  // Statics - Planche
  [normalizeName('Lean Planche')]: 'C',
  [normalizeName('Tuck Planche')]: 'A',
  [normalizeName('Advanced Tuck Planche')]: 'A+',
  [normalizeName('Straddle Planche')]: 'S',
  [normalizeName('Planche Completa')]: 'S+',
  [normalizeName('Full Planche')]: 'S+',
  // Statics - Front Lever
  [normalizeName('Tuck Front Lever')]: 'C',
  [normalizeName('Advanced Tuck Front Lever')]: 'A',
  [normalizeName('One Leg Front Lever')]: 'A+',
  [normalizeName('Straddle Front Lever')]: 'S',
  [normalizeName('Front Lever completo')]: 'S+',
  [normalizeName('Full Front Lever')]: 'S+',
};

// Mapa de demanda fisiológica por ejercicio, basado en ARBOLDEHABILIDADES.txt
const physioDemandByName: Record<string, PhysioDemand> = {
  // Empuje
  [normalizeName('Flexiones en pared')]: { fuerza: 30, resistencia: 60, equilibrio: 0, control: 10, movilidad: 0, fuerzaArea: 'pecho/tríceps' },
  [normalizeName('Flexiones inclinadas')]: { fuerza: 40, resistencia: 50, equilibrio: 0, control: 10, movilidad: 0, fuerzaArea: 'pecho/tríceps' },
  [normalizeName('Flexiones regulares')]: { fuerza: 60, resistencia: 30, equilibrio: 0, control: 10, movilidad: 0, fuerzaArea: 'pecho/tríceps' },
  [normalizeName('Flexiones estándar')]: { fuerza: 60, resistencia: 30, equilibrio: 0, control: 10, movilidad: 0, fuerzaArea: 'pecho/tríceps' },
  [normalizeName('Flexiones diamante')]: { fuerza: 70, resistencia: 20, equilibrio: 0, control: 10, movilidad: 0, fuerzaArea: 'tríceps/pecho' },
  [normalizeName('Fondos en paralelas')]: { fuerza: 80, resistencia: 10, equilibrio: 0, control: 10, movilidad: 0, fuerzaArea: 'pecho/tríceps' },
  [normalizeName('Flexiones arqueras')]: { fuerza: 90, resistencia: 5, equilibrio: 0, control: 5, movilidad: 0, fuerzaArea: 'pecho/tríceps (unilateral)' },
  [normalizeName('Flexión a una mano (asistida/negativa)')]: { fuerza: 95, resistencia: 0, equilibrio: 0, control: 5, movilidad: 0, fuerzaArea: 'pecho/tríceps (unilateral)' },
  [normalizeName('Flexión a una mano completa')]: { fuerza: 100, resistencia: 0, equilibrio: 0, control: 0, movilidad: 0, fuerzaArea: 'pecho/tríceps (unilateral)' },
  [normalizeName('Flexión a una mano')]: { fuerza: 100, resistencia: 0, equilibrio: 0, control: 0, movilidad: 0, fuerzaArea: 'pecho/tríceps (unilateral)' },

  // Tracción
  [normalizeName('Remo invertido asistido (dominada australiana básica)')]: { fuerza: 30, resistencia: 50, equilibrio: 0, control: 20, movilidad: 0, fuerzaArea: 'espalda/bíceps' },
  [normalizeName('Dominadas australianas')]: { fuerza: 30, resistencia: 50, equilibrio: 0, control: 20, movilidad: 0, fuerzaArea: 'espalda/bíceps' },
  [normalizeName('Remo invertido horizontal')]: { fuerza: 50, resistencia: 30, equilibrio: 0, control: 20, movilidad: 0, fuerzaArea: 'espalda/bíceps' },
  [normalizeName('Remo invertido')]: { fuerza: 50, resistencia: 30, equilibrio: 0, control: 20, movilidad: 0, fuerzaArea: 'espalda/bíceps' },
  [normalizeName('Dominadas asistidas / negativas')]: { fuerza: 70, resistencia: 20, equilibrio: 0, control: 10, movilidad: 0, fuerzaArea: 'espalda/bíceps' },
  [normalizeName('Dominadas asistidas')]: { fuerza: 70, resistencia: 20, equilibrio: 0, control: 10, movilidad: 0, fuerzaArea: 'espalda/bíceps' },
  [normalizeName('Dominada completa (pronación)')]: { fuerza: 80, resistencia: 10, equilibrio: 0, control: 10, movilidad: 0, fuerzaArea: 'dorsal/bíceps' },
  [normalizeName('Dominada libre')]: { fuerza: 80, resistencia: 10, equilibrio: 0, control: 10, movilidad: 0, fuerzaArea: 'dorsal/bíceps' },
  [normalizeName('Dominadas arqueras')]: { fuerza: 90, resistencia: 5, equilibrio: 0, control: 5, movilidad: 0, fuerzaArea: 'espalda/bíceps (unilateral)' },
  [normalizeName('Dominada a un brazo asistida')]: { fuerza: 95, resistencia: 0, equilibrio: 0, control: 5, movilidad: 0, fuerzaArea: 'dorsal/bíceps (unilateral)' },
  [normalizeName('Dominada a un brazo (negativa)')]: { fuerza: 100, resistencia: 0, equilibrio: 0, control: 0, movilidad: 0, fuerzaArea: 'dorsal/bíceps (unilateral)' },
  [normalizeName('Dominada a una mano completa')]: { fuerza: 100, resistencia: 0, equilibrio: 0, control: 0, movilidad: 0, fuerzaArea: 'dorsal/bíceps (unilateral)' },
  [normalizeName('Muscle-Up con banda')]: { fuerza: 85, resistencia: 5, equilibrio: 0, control: 10, movilidad: 0, fuerzaArea: 'espalda/bíceps + empuje' },
  [normalizeName('Muscle Up controlado')]: { fuerza: 95, resistencia: 0, equilibrio: 0, control: 5, movilidad: 0, fuerzaArea: 'espalda/bíceps + empuje' },

  // Core
  [normalizeName('Plancha abdominal (plank)')]: { fuerza: 20, resistencia: 70, equilibrio: 0, control: 10, movilidad: 0, fuerzaArea: 'core' },
  [normalizeName('Plancha abdominal')]: { fuerza: 20, resistencia: 70, equilibrio: 0, control: 10, movilidad: 0, fuerzaArea: 'core' },
  [normalizeName('Hollow hold (posición hueca)')]: { fuerza: 30, resistencia: 50, equilibrio: 0, control: 20, movilidad: 0, fuerzaArea: 'core' },
  [normalizeName('Hollow hold')]: { fuerza: 30, resistencia: 50, equilibrio: 0, control: 20, movilidad: 0, fuerzaArea: 'core' },
  [normalizeName('Elevaciones de piernas tumbado')]: { fuerza: 40, resistencia: 40, equilibrio: 0, control: 20, movilidad: 0, fuerzaArea: 'abdomen' },
  [normalizeName('Elevaciones de rodillas colgado')]: { fuerza: 50, resistencia: 30, equilibrio: 0, control: 20, movilidad: 0, fuerzaArea: 'abdomen' },
  [normalizeName('Elevaciones de piernas colgado (piernas extendidas)')]: { fuerza: 70, resistencia: 10, equilibrio: 0, control: 20, movilidad: 0, fuerzaArea: 'abdomen/iliopsoas' },
  [normalizeName('Elevaciones de piernas (Toes to Bar)')]: { fuerza: 70, resistencia: 10, equilibrio: 0, control: 20, movilidad: 0, fuerzaArea: 'abdomen/iliopsoas' },
  [normalizeName('L-sit (fondos en “L”)')]: { fuerza: 60, resistencia: 20, equilibrio: 0, control: 15, movilidad: 5, fuerzaArea: 'core/flexores' },
  [normalizeName('L-sit')]: { fuerza: 60, resistencia: 20, equilibrio: 0, control: 15, movilidad: 5, fuerzaArea: 'core/flexores' },
  [normalizeName('V-sit')]: { fuerza: 70, resistencia: 0, equilibrio: 0, control: 20, movilidad: 10, fuerzaArea: 'core' },
  [normalizeName('Dragon flag')]: { fuerza: 80, resistencia: 0, equilibrio: 0, control: 20, movilidad: 0, fuerzaArea: 'core completo' },
  [normalizeName('Dragon Flag')]: { fuerza: 80, resistencia: 0, equilibrio: 0, control: 20, movilidad: 0, fuerzaArea: 'core completo' },

  // Piernas
  [normalizeName('Sentadilla asistida')]: { fuerza: 20, resistencia: 50, equilibrio: 10, control: 10, movilidad: 10, fuerzaArea: 'piernas' },
  [normalizeName('Sentadilla libre profunda')]: { fuerza: 40, resistencia: 40, equilibrio: 10, control: 5, movilidad: 5, fuerzaArea: 'piernas' },
  [normalizeName('Zancadas alternas (lunges)')]: { fuerza: 50, resistencia: 20, equilibrio: 20, control: 5, movilidad: 5, fuerzaArea: 'piernas/glúteos' },
  [normalizeName('Zancadas')]: { fuerza: 50, resistencia: 20, equilibrio: 20, control: 5, movilidad: 5, fuerzaArea: 'piernas/glúteos' },
  [normalizeName('Sentadilla búlgara')]: { fuerza: 60, resistencia: 10, equilibrio: 20, control: 5, movilidad: 5, fuerzaArea: 'cuádriceps/glúteos' },
  [normalizeName('Pistol squat asistida')]: { fuerza: 70, resistencia: 0, equilibrio: 20, control: 5, movilidad: 5, fuerzaArea: 'pierna (unilateral)' },
  [normalizeName('Pistol squat (sentadilla a una pierna)')]: { fuerza: 80, resistencia: 0, equilibrio: 15, control: 0, movilidad: 5, fuerzaArea: 'pierna (unilateral)' },
  [normalizeName('Pistol squat')]: { fuerza: 80, resistencia: 0, equilibrio: 15, control: 0, movilidad: 5, fuerzaArea: 'pierna (unilateral)' },
  [normalizeName('Pistol squat con salto')]: { fuerza: 70, resistencia: 0, equilibrio: 15, control: 0, movilidad: 15, fuerzaArea: 'pierna (unilateral)' },
  [normalizeName('Sentadilla dragón')]: { fuerza: 75, resistencia: 0, equilibrio: 15, control: 0, movilidad: 10, fuerzaArea: 'pierna (unilateral, alta movilidad)' },

  // Equilibrio / Invertidos
  [normalizeName('Postura del cuervo (crow pose)')]: { fuerza: 20, resistencia: 0, equilibrio: 60, control: 20, movilidad: 0, fuerzaArea: 'hombros/tríceps' },
  [normalizeName('Postura del Cuervo')]: { fuerza: 20, resistencia: 0, equilibrio: 60, control: 20, movilidad: 0, fuerzaArea: 'hombros/tríceps' },
  [normalizeName('Pino de cabeza asistido (Headstand)')]: { fuerza: 10, resistencia: 0, equilibrio: 70, control: 20, movilidad: 0, fuerzaArea: 'cuello/hombros' },
  [normalizeName('Pino asistido contra la pared')]: { fuerza: 10, resistencia: 0, equilibrio: 70, control: 20, movilidad: 0, fuerzaArea: 'hombros' },
  [normalizeName('Pino de cabeza libre (Headstand libre)')]: { fuerza: 15, resistencia: 0, equilibrio: 70, control: 15, movilidad: 0, fuerzaArea: 'hombros' },
  [normalizeName('Pino libre')]: { fuerza: 30, resistencia: 0, equilibrio: 60, control: 10, movilidad: 0, fuerzaArea: 'hombros' },
  [normalizeName('Caminata en pino')]: { fuerza: 40, resistencia: 0, equilibrio: 40, control: 20, movilidad: 0, fuerzaArea: 'hombros' },
  [normalizeName('Flexiones en pino')]: { fuerza: 80, resistencia: 0, equilibrio: 10, control: 10, movilidad: 0, fuerzaArea: 'hombros/tríceps' },
};

const rankColors: Record<string, string> = {
  'F': 'border-gray-300 text-gray-700',
  'F+': 'border-gray-300 text-gray-700',
  'E': 'border-teal-300 text-teal-700',
  'D': 'border-amber-300 text-amber-700',
  'D+': 'border-amber-300 text-amber-700',
  'C': 'border-blue-300 text-blue-700',
  'B': 'border-indigo-300 text-indigo-700',
  'A': 'border-violet-300 text-violet-700',
  'A+': 'border-violet-400 text-violet-800',
  'S': 'border-red-300 text-red-700',
  'S+': 'border-purple-400 text-purple-700',
};

const allRanks = ['F','F+','E','D','D+','C','B','A','A+','S','S+'] as const;
const getSkillRank = (skill: Skill) => rankOverrideByName[normalizeName(skill.name)] ?? rankByDifficulty[skill.difficulty] ?? '?';

function SkillCard({ skill, status, statusMap, onLayoutChange }: { skill: Skill; status?: UserSkill; statusMap?: Map<string, UserSkill>; onLayoutChange?: () => void }) {
  const isCompleted = status?.isCompleted;
  const isUnlocked = status?.isUnlocked;
  const progress = Math.round(status?.completionProgress ?? 0);
  const [showPrereqs, setShowPrereqs] = useState(false);
  const rank = rankOverrideByName[normalizeName(skill.name)] ?? rankByDifficulty[skill.difficulty] ?? '?';
  const rankClass = rankColors[rank] ?? 'border-gray-300 text-gray-700';

  return (
    <Card
      className={`min-w-[220px] rounded-md bg-white border ${
        isCompleted ? 'border-emerald-400' : isUnlocked ? 'border-sky-400' : 'border-gray-200'
      } shadow-sm hover:shadow-md transition-shadow`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground">{branchLabels[skill.branch as keyof typeof branchLabels]}</div>
            <div className="font-semibold text-gray-900">{skill.name}</div>
            <div className="mt-1">
              <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${rankClass}`}>Rank {rank}</Badge>
            </div>
            {skill.physioDemand && (
              <div className="mt-2 space-y-1">
                <div className="text-[10px] text-muted-foreground">Demanda fisiológica</div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                    {`Fuerza ${skill.physioDemand.fuerza}%`}{skill.physioDemand.fuerzaArea ? ` (${skill.physioDemand.fuerzaArea})` : ''}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">{`Resistencia ${skill.physioDemand.resistencia}%`}</Badge>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">{`Equilibrio ${skill.physioDemand.equilibrio}%`}</Badge>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">{`Control ${skill.physioDemand.control}%`}</Badge>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">{`Movilidad ${skill.physioDemand.movilidad}%`}</Badge>
                </div>
              </div>
            )}
            <div className="mt-3">
              <Link href={`/guides/${normalizeName(skill.name).replace(/[^a-z0-9]+/g, '-')}`} className="text-xs text-sky-700 hover:text-sky-800">
                Ver guía detallada
              </Link>
            </div>
          </div>
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          ) : isUnlocked ? (
            <Badge variant="outline" className="text-sky-700 border-sky-300">Unlocked</Badge>
          ) : (
            <button
              aria-label="View prerequisites to unlock"
              className="p-0.5 rounded hover:bg-muted"
              onClick={() => {
                setShowPrereqs((s) => !s);
                // notify parent to re-measure after layout change
                onLayoutChange?.();
              }}
            >
              <Lock className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </div>
        {showPrereqs && !isUnlocked && (
          <div className="mt-3 space-y-2">
            <div className="text-xs font-medium text-gray-700">Requirements to unlock</div>
            <div className="space-y-1">
              {(skill.prerequisites && skill.prerequisites.length > 0) ? (
                skill.prerequisites.map((p) => {
                  const ps = statusMap?.get(p.id);
                  const label = ps?.isCompleted
                    ? 'Completed'
                    : ps?.isUnlocked
                      ? 'Unlocked'
                      : 'Locked';
                  const variant = ps?.isCompleted
                    ? 'default'
                    : ps?.isUnlocked
                      ? 'secondary'
                      : 'outline' as const;
                  return (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-800">{p.name}</span>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-muted-foreground">No prerequisites</div>
              )}
            </div>
          </div>
        )}
        {isUnlocked && !isCompleted && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <div className="mt-1 text-xs text-muted-foreground">{progress}%</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SkillPathHorizontal({ userId }: SkillPathProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [handstandDocSkills, setHandstandDocSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [xp, setXp] = useState({ current: 0, total: 100, levelName: 'Novice', levelIndex: 1 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [positions, setPositions] = useState<Record<string, { x: number; y: number; w: number; h: number }>>({});
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [activeBranches, setActiveBranches] = useState<(keyof typeof branchLabels)[]>(displayOrder);
  const toggleBranch = (br: keyof typeof branchLabels) => {
    setActiveBranches((prev) => (prev.includes(br) ? prev.filter((b) => b !== br) : [...prev, br]));
  };
  const [activeRanks, setActiveRanks] = useState<string[]>([...allRanks]);
  const toggleRank = (r: string) => {
    setActiveRanks((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const sRes = await fetch('/api/skills?includePrerequisites=true');
        const sData = await sRes.json();
        const fetched = Array.isArray(sData) ? sData : sData.skills || [];

        // Cargar ejercicios adicionales desde el documento ARBOLDEHABILIDADES.txt
        let docSkills: Skill[] = [];
        try {
          const dRes = await fetch('/api/skills/from-doc');
          const dData = await dRes.json();
          docSkills = Array.isArray(dData) ? dData : dData.skills || [];
        } catch (e) {
          console.warn('No se pudieron cargar habilidades desde documento:', e);
        }
        try {
          const hRes = await fetch('/api/skills/from-doc/handstand');
          const hData = await hRes.json();
          const hand = Array.isArray(hData) ? hData : hData.skills || [];
          docSkills = [...docSkills, ...hand];
          // Guardar una copia separada para mostrar todo el handstand del documento explícitamente
          setHandstandDocSkills(hand as Skill[]);
        } catch (e) {
          console.warn('No se pudieron cargar habilidades de handstand:', e);
        }

        // Augment Pull (TRACCION) progression: Dominadas → Dominadas avanzadas → Muscle-Up con banda → Muscle Up controlado
        const normalize = (n: string) => n.trim().toLowerCase();
        const byName = new Map<string, Skill>();
        for (const s of fetched) byName.set(normalize(s.name), s);

        const ensure = (name: string, base: Partial<Skill>): Skill => {
          const key = normalize(name);
          const existing = byName.get(key);
          if (existing) return existing;
          const created: Skill = {
            id: `pull-dev-${key}`,
            name,
            description: base.description ?? undefined,
            branch: (base.branch as Branch) ?? 'TRACCION',
            difficulty: (base.difficulty as Skill['difficulty']) ?? 'INTERMEDIATE',
            prerequisites: [],
          };
          byName.set(key, created);
          fetched.push(created);
          return created;
        };

        const dominadas = ensure('Dominadas', { branch: 'TRACCION', difficulty: 'INTERMEDIATE' });
        const dominadasAvanzadas = ensure('Dominadas avanzadas', { branch: 'TRACCION', difficulty: 'ADVANCED' });
        const muscleUpBanda = ensure('Muscle-Up con banda', { branch: 'TRACCION', difficulty: 'ADVANCED' });
        const muscleUpControlado = ensure('Muscle Up controlado', { branch: 'TRACCION', difficulty: 'EXPERT' });

        const addPrereq = (skill: Skill, prereq: Skill) => {
          const list = skill.prerequisites ?? [];
          const exists = list.some(p => p.id === prereq.id);
          if (!exists) {
            skill.prerequisites = [...list, prereq];
          }
        };

        addPrereq(dominadasAvanzadas, dominadas);
        addPrereq(muscleUpBanda, dominadasAvanzadas);
        addPrereq(muscleUpControlado, muscleUpBanda);

        // Fusionar habilidades del documento con las de BD por nombre
        const merged: Skill[] = [...fetched];
        // reutilizar el mapa existente en lugar de redefinirlo
        byName.clear();
        for (const s of merged) byName.set(normalize(s.name), s);
        for (const ds of docSkills) {
          const key = normalize((ds as any).name ?? '');
          const existing = byName.get(key);
          if (existing) {
            // Añadir demanda fisiológica si está disponible
            const demandDoc = (ds as any).physioDemand;
            if (demandDoc && !existing.physioDemand) {
              (existing as any).physioDemand = demandDoc;
            }
            // Unir prerequisitos por nombre
            const prereqList: Skill[] = existing.prerequisites ?? [];
            const dsPrereqs: Skill[] = ((ds as any).prerequisites ?? []) as Skill[];
            for (const p of dsPrereqs) {
              const pe = byName.get(normalize(p.name));
              if (pe && !prereqList.some(x => x.id === pe.id)) {
                prereqList.push(pe);
              } else if (!pe) {
                // Si prereq no existe en BD, incorporar del doc
                const copy: Skill = {
                  id: (p as any).id ?? `doc-${normalize(p.name)}`,
                  name: p.name,
                  branch: (p as any).branch ?? existing.branch,
                  difficulty: (p as any).difficulty ?? existing.difficulty,
                  prerequisites: [],
                };
                merged.push(copy);
                byName.set(normalize(copy.name), copy);
                prereqList.push(copy);
              }
            }
            existing.prerequisites = prereqList;
          } else {
            // Incorporar habilidad del documento completa
            const copy: Skill = {
              id: (ds as any).id ?? `doc-${key}`,
              name: (ds as any).name,
              description: (ds as any).description,
              branch: (ds as any).branch ?? 'CORE',
              difficulty: (ds as any).difficulty ?? 'INTERMEDIATE',
              prerequisites: (((ds as any).prerequisites ?? []) as Skill[]).map((p: any) => ({
                id: p.id ?? `doc-${normalize(p.name)}`,
                name: p.name,
                branch: p.branch ?? ((ds as any).branch ?? 'CORE'),
                difficulty: p.difficulty ?? 'INTERMEDIATE',
                prerequisites: [],
              })),
            } as Skill;
            // Demanda fisiológica
            const demandDoc = (ds as any).physioDemand;
            if (demandDoc) (copy as any).physioDemand = demandDoc;
            merged.push(copy);
            byName.set(key, copy);
          }
        }

        // Asignar demandas fisiológicas desde mapa estático donde falten
        for (const s of merged) {
          if (!(s as any).physioDemand) {
            const demand = physioDemandByName[normalize(s.name)];
            if (demand) {
              (s as any).physioDemand = demand;
            }
          }
        }

        setSkills(merged);

        if (userId) {
          const uRes = await fetch('/api/user/skills');
          const uData = await uRes.json();
          setUserSkills(uData.skills || uData.skillsWithProgress || uData || []);
        }
      } catch (e) {
        console.error('SkillPathHorizontal load error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  useEffect(() => {
    const completed = userSkills.filter((us) => us.isCompleted).length;
    const current = completed * 10; // 10 XP per completed skill (placeholder)
    const levelIndex = current < 100 ? 1 : 2;
    const levelName = levelIndex === 1 ? 'Novice' : 'Intermediate';
    setXp({ current, total: 100, levelName, levelIndex });
  }, [userSkills]);

  // Re-measure when ranks filter changes to keep connectors aligned
  useEffect(() => {
    measure();
  }, [activeRanks]);

  const measure = () => {
    const container = containerRef.current;
    if (!container) return;

    // Use clientWidth/clientHeight and round values to avoid sub-pixel thrashing
    const cRect = container.getBoundingClientRect();
    const baseLeft = Math.round(cRect.left);
    const baseTop = Math.round(cRect.top);
    const width = Math.round(container.clientWidth);
    const height = Math.round(container.clientHeight);

    const next: Record<string, { x: number; y: number; w: number; h: number }> = {};
    nodeRefs.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      const x = Math.round(r.left) - baseLeft;
      const y = Math.round(r.top) - baseTop;
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      next[id] = { x, y, w, h };
    });

    const sizeChanged = canvasSize.width !== width || canvasSize.height !== height;
    const keysPrev = Object.keys(positions);
    const keysNext = Object.keys(next);
    let positionsChanged = keysPrev.length !== keysNext.length;
    if (!positionsChanged) {
      for (const id of keysNext) {
        const a = positions[id];
        const b = next[id];
        if (!a || !b || a.x !== b.x || a.y !== b.y || a.w !== b.w || a.h !== b.h) {
          positionsChanged = true;
          break;
        }
      }
    }

    if (positionsChanged) setPositions(next);
    if (sizeChanged) setCanvasSize({ width, height });
  };

  useLayoutEffect(() => {
    measure();
  }, [skills, userSkills, activeBranches]);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const byBranch = useMemo(() => {
    const acc: Record<string, Skill[]> = {};
    for (const s of skills) {
      acc[s.branch] = acc[s.branch] || [];
      acc[s.branch].push(s);
    }
    for (const key of Object.keys(acc)) {
      // Priorizar orden explícito si existe; de lo contrario usar rango y prerequisitos
      acc[key] = acc[key].sort((a, b) => {
        const ao = (a as any).order ?? null;
        const bo = (b as any).order ?? null;
        if (ao != null && bo != null && ao !== bo) return ao - bo;
        if (ao != null && bo == null) return -1;
        if (ao == null && bo != null) return 1;

        const ra = getSkillRank(a);
        const rb = getSkillRank(b);
        const ia = allRanks.indexOf(ra as typeof allRanks[number]);
        const ib = allRanks.indexOf(rb as typeof allRanks[number]);
        if (ia !== ib) return ia - ib;
        // Desempate: menos prerequisitos primero
        const al = a.prerequisites?.length || 0;
        const bl = b.prerequisites?.length || 0;
        if (al !== bl) return al - bl;
        // Último desempate: orden alfabético
        return a.name.localeCompare(b.name);
      });
    }
    return acc;
  }, [skills]);

  const statusBySkillId = useMemo(() => {
    const m = new Map<string, UserSkill>();
    for (const us of userSkills) m.set(us.skillId, us);
    return m;
  }, [userSkills]);

  // Compute connectors every render to keep hook order stable
  const connectors = useMemo(() => {
    const paths: { d: string; dashed: boolean }[] = [];
    const statusMap = statusBySkillId;
    for (const s of skills) {
      const prereqs = s.prerequisites || [];
      for (const p of prereqs) {
        const a = positions[p.id];
        const b = positions[s.id];
        if (!a || !b) continue;
        const startX = a.x + a.w;
        const startY = a.y + a.h / 2;
        const endX = b.x;
        const endY = b.y + b.h / 2;
        const dx = Math.max(40, Math.abs(endX - startX) / 3);
        const c1x = startX + dx;
        const c1y = startY;
        const c2x = endX - dx;
        const c2y = endY;
        const d = `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
        const dashed = !(statusMap.get(s.id)?.isUnlocked);
        paths.push({ d, dashed });
      }
    }
    return paths;
  }, [positions, skills, statusBySkillId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full mx-auto max-w-6xl relative">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-wide uppercase">Calisthenics Skill Path</h1>
        <div className="mt-1 text-sm text-muted-foreground">{`Level ${xp.levelIndex}: ${xp.levelName}`}</div>
        <div className="mt-3 flex items-center gap-3">
          <div className="text-xs text-muted-foreground">{`${xp.current} XP / ${xp.total} XP`}</div>
          <div className="flex-1 max-w-[320px]">
            <Progress value={(xp.current / xp.total) * 100} className="h-2" />
          </div>
        </div>
      </div>

      <svg className="absolute inset-0 pointer-events-none" width={canvasSize.width} height={canvasSize.height}>
        {connectors.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={p.dashed ? '#7dd3fc' : '#0ea5e9'}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={p.dashed ? '6 6' : '0'}
          />
        ))}
      </svg>

      <div className="mb-6">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto flex-wrap">
          {displayOrder.map((br) => (
            <Button
              key={br}
              onClick={() => toggleBranch(br)}
              variant={activeBranches.includes(br) ? 'default' : 'outline'}
              size="sm"
              className="rounded-full px-3 py-1 whitespace-nowrap"
            >
              {branchLabels[br]}
            </Button>
          ))}
        </div>
        {/* Rank Legend and Filters */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {allRanks.map((r) => (
              <Badge key={`legend-${r}`} variant="outline" className={`text-[10px] px-2 py-0.5 ${rankColors[r]}`}>Rank {r}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto flex-wrap">
            {allRanks.map((r) => (
              <Button
                key={`filter-${r}`}
                onClick={() => toggleRank(r)}
                variant={activeRanks.includes(r) ? 'default' : 'outline'}
                size="sm"
                className="rounded-full px-3 py-1"
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {displayOrder.map((br) => {
          const laneSkills = byBranch[br] || [];
          const laneSkillsFiltered = laneSkills.filter((s) => activeRanks.includes(getSkillRank(s)));
          if (laneSkills.length === 0) return null;
          if (!activeBranches.includes(br)) return null;
          return (
            <div key={br} className="relative">
              <div className="flex items-center gap-6 overflow-x-auto pb-2">
                {laneSkillsFiltered.map((skill, idx) => (
                  <React.Fragment key={skill.id}>
                    <div
                      ref={(el) => {
                        if (el) nodeRefs.current.set(skill.id, el);
                        else nodeRefs.current.delete(skill.id);
                      }}
                    >
                      <SkillCard
                        skill={skill}
                        status={statusBySkillId.get(skill.id)}
                        statusMap={statusBySkillId}
                        onLayoutChange={() => measure()}
                      />
                    </div>
                    {idx < laneSkillsFiltered.length - 1 && (
                      <div className="flex-1 h-[3px] min-w-[48px] bg-sky-300 rounded-full" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
        {/* Sección explícita para Handstand desde documento: asegura que el usuario vea TODAS las habilidades parseadas del .txt */}
        {handstandDocSkills.length > 0 && activeBranches.includes('EQUILIBRIO') && (
          <div className="relative">
            <div className="mb-2 text-sm font-semibold text-gray-800">Handstand (desde documento)</div>
            <div className="flex items-center gap-6 overflow-x-auto pb-2">
              {handstandDocSkills
                .filter((s) => activeRanks.includes(getSkillRank(s)))
                .sort((a, b) => {
                  const al = a.prerequisites?.length || 0;
                  const bl = b.prerequisites?.length || 0;
                  if (al !== bl) return al - bl;
                  const ra = allRanks.indexOf(getSkillRank(a) as typeof allRanks[number]);
                  const rb = allRanks.indexOf(getSkillRank(b) as typeof allRanks[number]);
                  if (ra !== rb) return ra - rb;
                  return a.name.localeCompare(b.name);
                })
                .map((skill, idx) => (
                  <React.Fragment key={`hs-doc-${skill.id}`}>
                    <div
                      ref={(el) => {
                        if (el) nodeRefs.current.set(skill.id, el);
                        else nodeRefs.current.delete(skill.id);
                      }}
                    >
                      <SkillCard
                        skill={skill}
                        status={statusBySkillId.get(skill.id)}
                        statusMap={statusBySkillId}
                        onLayoutChange={() => measure()}
                      />
                    </div>
                    {idx < handstandDocSkills.length - 1 && (
                      <div className="flex-1 h-[3px] min-w-[48px] bg-sky-300 rounded-full" />
                    )}
                  </React.Fragment>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 flex justify-center">
        <Button size="lg" className="bg-sky-600 hover:bg-sky-700">
          <Play className="h-4 w-4 mr-2" />
          Begin Training Session
        </Button>
      </div>
    </div>
  );
}