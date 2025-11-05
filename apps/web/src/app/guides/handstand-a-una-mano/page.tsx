"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Branch = 'EMPUJE' | 'TRACCION' | 'CORE' | 'EQUILIBRIO' | 'TREN_INFERIOR' | 'ESTATICOS';
type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

type PhysioDemand = {
  fuerza: number;
  resistencia: number;
  equilibrio: number;
  control: number;
  movilidad: number;
  fuerzaArea?: string;
};

type Skill = {
  id: string;
  name: string;
  description?: string;
  branch: Branch;
  difficulty: Difficulty;
  prerequisites: Array<{ id: string; name: string; branch: Branch; difficulty: Difficulty }>;
  physioDemand?: PhysioDemand;
};

function norm(s: string) { return s.trim().toLowerCase(); }
function slugify(s: string) { return norm(s).replace(/[^a-z0-9]+/g, '-'); }

const rankByDifficulty: Record<Difficulty, string> = {
  BEGINNER: 'F',
  INTERMEDIATE: 'D',
  ADVANCED: 'A',
  EXPERT: 'S',
};

export default function HandstandSkillpathGuide() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/skills/from-doc/handstand', { cache: 'no-store' });
        const data = await res.json();
        const items: Skill[] = Array.isArray(data) ? data : data.skills || [];
        setSkills(items);
      } catch (e) {
        console.error('Error cargando skillpath handstand', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const ordered = useMemo(() => {
    // El API ya entrega secuencia, pero por seguridad ordenamos por prerequisito único
    const byId = new Map(skills.map(s => [s.id, s] as const));
    // heurística simple: contar prereqs
    return [...skills].sort((a, b) => (a.prerequisites?.length || 0) - (b.prerequisites?.length || 0));
  }, [skills]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <Link href="/exercises" className="text-sm text-sky-700 hover:text-sky-800">← Volver a ejercicios</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Skillpath completo: Handstand a una mano</h1>
      <p className="mt-2 text-sm text-muted-foreground">Guía paso a paso para alcanzar la parada de manos a una mano.</p>

      {loading && <p className="mt-6 text-sm text-gray-700">Cargando…</p>}

      {!loading && (
        <div className="mt-6 space-y-6">
          {ordered.map((s, idx) => (
            <div key={s.id} className="rounded-lg border p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">{s.name}</h2>
                <span className="text-xs text-gray-500">Nivel {rankByDifficulty[s.difficulty]}</span>
              </div>
              {s.description && (
                <p className="mt-2 text-sm text-gray-700">{s.description.replace(/^Descripción:\s*/i, '')}</p>
              )}
              {s.physioDemand && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Fuerza {s.physioDemand.fuerza}%</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Resistencia {s.physioDemand.resistencia}%</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Equilibrio {s.physioDemand.equilibrio}%</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Control {s.physioDemand.control}%</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Movilidad {s.physioDemand.movilidad}%</span>
                </div>
              )}
              <div className="mt-3">
                <Link href={`/guides/${slugify(s.name)}`} className="text-sm text-sky-700 hover:text-sky-800">Ver guía de esta etapa</Link>
              </div>
              {idx < ordered.length - 1 && (
                <div className="mt-4 border-t pt-2 text-xs text-gray-500">→ Continúa con: {ordered[idx+1].name}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}