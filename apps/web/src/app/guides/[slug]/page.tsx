"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

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

type Exercise = {
  id: string | number;
  name: string;
  difficulty?: string;
  howTo?: string;
  muscleGroups?: string[];
  equipment?: string[];
  youtubeId?: string;
  youtubeUrl?: string;
  gifUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string | null;
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

// Manejo de imagen con fallback (endpoint interno → externo → placeholder)
function GuideImage({ exercise, title }: { exercise: Exercise; title: string }) {
  const internalSrc = `/api/exercise-gif/${String(exercise.id)}`;
  const [src, setSrc] = useState<string>(internalSrc);

  useEffect(() => {
    setSrc(internalSrc);
  }, [internalSrc]);

  const handleError = () => {
    // Si el endpoint interno no responde, usar un placeholder neutral
    setSrc('/placeholder-exercise.svg');
  };

  return (
    <img
      src={src}
      alt={`Imagen de ${title}`}
      className="absolute top-0 left-0 w-full h-full object-contain"
      onError={handleError}
      loading="lazy"
    />
  );
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);

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

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const res = await fetch('/exercises.json', { cache: 'no-store' });
        const data = await res.json();
        const items: Exercise[] = Array.isArray(data) ? data : [];
        setExercises(items);
      } catch (e) {
        console.error('Error cargando exercises.json', e);
      } finally {
        setLoadingExercises(false);
      }
    };
    loadExercises();
  }, []);

  const current = useMemo(() => {
    const target = skills.find(s => slugify(s.name) === slug);
    return target;
  }, [skills, slug]);

  const currentExercise = useMemo(() => {
    const target = exercises.find(ex => slugify(ex.name) === slug);
    return target || null;
  }, [exercises, slug]);

  const title = current ? current.name : toTitle(slug);

  function getYoutubeEmbedUrl(ex?: Exercise | null) {
    if (!ex) return null;
    if (ex.youtubeId) return `https://www.youtube.com/embed/${ex.youtubeId}`;
    if (ex.youtubeUrl) {
      const mId = ex.youtubeUrl.match(/[?&]v=([^&#]+)/)?.[1]
        || ex.youtubeUrl.match(/youtu\.be\/([^?&#]+)/)?.[1]
        || ex.youtubeUrl.match(/youtube\.com\/shorts\/([^?&#]+)/)?.[1];
      if (mId) return `https://www.youtube.com/embed/${mId}`;
    }
    return null;
  }

  const embedUrl = getYoutubeEmbedUrl(currentExercise);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/exercises" className="text-sm text-sky-700 hover:text-sky-800">← Volver a ejercicios</Link>
        <Link href="/guides/handstand-a-una-mano" className="text-sm text-sky-700 hover:text-sky-800">Ver guía del skillpath completo</Link>
      </div>

      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Guía: {title}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          {current && (
            <Badge>{`Nivel ${rankByDifficulty[current.difficulty]}`}</Badge>
          )}
          {!current && currentExercise?.difficulty && (
            <Badge variant="secondary">{`Dificultad: ${String(currentExercise.difficulty)}`}</Badge>
          )}
        </div>
      </div>

      {/* Demo / Media */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Demo</h2>
        {embedUrl ? (
          <div className="relative w-full overflow-hidden rounded-lg bg-black pb-[56.25%]">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl}
              title={`Video de ${title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : currentExercise?.videoUrl ? (
          <div className="relative w-full overflow-hidden rounded-lg bg-black pb-[56.25%]">
            <video
              className="absolute top-0 left-0 w-full h-full"
              src={String(currentExercise.videoUrl)}
              controls
              poster={currentExercise.thumbnailUrl || currentExercise.gifUrl}
            />
          </div>
        ) : currentExercise ? (
          <div className="relative w-full overflow-hidden rounded-lg pb-[56.25%]">
            <GuideImage exercise={currentExercise} title={title} />
          </div>
        ) : (
          <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
            Próximamente agregaremos el demo de esta guía.
          </div>
        )}
      </section>

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
          <h2 className="text-lg font-semibold">Cómo realizarlo</h2>
          {loadingExercises && <p className="mt-1 text-sm text-gray-700">Cargando…</p>}
          {!loadingExercises && currentExercise?.howTo ? (
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{currentExercise.howTo}</p>
          ) : (!loadingExercises && (
            <p className="mt-1 text-sm text-gray-700">Aún no hay guía detallada. Añadiremos instrucciones específicas pronto.</p>
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
              <Badge variant="secondary">Fuerza {current.physioDemand.fuerza}%</Badge>
              <Badge variant="secondary">Resistencia {current.physioDemand.resistencia}%</Badge>
              <Badge variant="secondary">Equilibrio {current.physioDemand.equilibrio}%</Badge>
              <Badge variant="secondary">Control {current.physioDemand.control}%</Badge>
              <Badge variant="secondary">Movilidad {current.physioDemand.movilidad}%</Badge>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-700">No se encontraron porcentajes en el documento para esta habilidad.</p>
          )}
        </section>
        <section>
          <h2 className="text-lg font-semibold">Grupos musculares</h2>
          {loadingExercises && <p className="mt-1 text-sm text-gray-700">Cargando…</p>}
          {!loadingExercises && currentExercise?.muscleGroups?.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {currentExercise.muscleGroups.map((m, i) => (
                <Badge key={`${m}-${i}`} variant="secondary">{m}</Badge>
              ))}
            </div>
          ) : (!loadingExercises && (
            <p className="mt-1 text-sm text-gray-700">No hay grupos musculares especificados.</p>
          ))}
        </section>
        <section>
          <h2 className="text-lg font-semibold">Equipamiento</h2>
          {loadingExercises && <p className="mt-1 text-sm text-gray-700">Cargando…</p>}
          {!loadingExercises && currentExercise?.equipment?.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {currentExercise.equipment.map((e, i) => (
                <Badge key={`${e}-${i}`} variant="outline">{e}</Badge>
              ))}
            </div>
          ) : (!loadingExercises && (
            <p className="mt-1 text-sm text-gray-700">No se requiere equipamiento o no especificado.</p>
          ))}
        </section>
      </div>
    </div>
  );
}