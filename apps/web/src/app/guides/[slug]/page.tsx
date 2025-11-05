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

function toTitle(slug: string) {
  const words = slug.split('-').filter(Boolean);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function norm(s: string) { return s.trim().toLowerCase(); }
function slugify(s: string) { return norm(s).replace(/[^a-z0-9]+/g, '-'); }

const rankByDifficulty: Record<Difficulty, string> = {
  BEGINNER: 'F',
  INTERMEDIATE: 'D',
  ADVANCED: 'A',
  EXPERT: 'S',
};

export default function GuidePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
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
        console.error('Error cargando guía', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const current = useMemo(() => {
    const target = skills.find(s => slugify(s.name) === slug);
    return target;
  }, [skills, slug]);

  const title = current ? current.name : toTitle(slug);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/exercises" className="text-sm text-sky-700 hover:text-sky-800">← Volver a ejercicios</Link>
        <Link href="/guides/handstand-a-una-mano" className="text-sm text-sky-700 hover:text-sky-800">Ver guía del skillpath completo</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Guía: {title}</h1>
      {current && (
        <p className="mt-2 text-sm text-muted-foreground">Dificultad aproximada: {rankByDifficulty[current.difficulty]}</p>
      )}

      <div className="mt-6 space-y-6">
        <section>
          <h2 className="text-lg font-semibold">Descripción</h2>
          {loading && <p className="mt-1 text-sm text-gray-700">Cargando…</p>}
          {!loading && current?.description ? (
            <p className="mt-1 text-sm text-gray-700">{current.description.replace(/^Descripción:\s*/i, '')}</p>
          ) : (!loading && (
            <p className="mt-1 text-sm text-gray-700">Sin descripción en el documento. Próximamente ampliaremos esta guía.</p>
          ))}
        </section>
        <section>
          <h2 className="text-lg font-semibold">Prerequisitos</h2>
          {current?.prerequisites?.length ? (
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
              {current.prerequisites.map(p => (
                <li key={p.id}>
                  <Link href={`/guides/${slugify(p.name)}`} className="text-sky-700 hover:text-sky-800">{p.name}</Link>
                  <span className="ml-2 text-gray-500">(nivel {rankByDifficulty[p.difficulty]})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-gray-700">Sin prerequisitos listados; revisa el árbol para progresión sugerida.</p>
          )}
        </section>
        <section>
          <h2 className="text-lg font-semibold">Demandas fisiológicas</h2>
          {current?.physioDemand ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">Fuerza {current.physioDemand.fuerza}%</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">Resistencia {current.physioDemand.resistencia}%</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">Equilibrio {current.physioDemand.equilibrio}%</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">Control {current.physioDemand.control}%</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">Movilidad {current.physioDemand.movilidad}%</span>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-700">No se encontraron porcentajes en el documento para esta habilidad.</p>
          )}
        </section>
      </div>
    </div>
  );
}