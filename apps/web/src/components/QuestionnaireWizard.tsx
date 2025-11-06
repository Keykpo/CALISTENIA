'use client'

import React, { useMemo, useState } from 'react'

type Gender = 'male' | 'female' | 'other'
type Experience = 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert'
type Goal = 'muscle_up' | 'handstand' | 'front_lever' | 'lose_weight' | 'gain_muscle' | 'endurance'
type Equipment = 'none' | 'bar' | 'parallettes' | 'rings' | 'full'

export type UserLevel = 'PRINCIPIANTE' | 'NOVATO' | 'INTERMEDIO' | 'AVANZADO' | 'EXPERTO'

export interface HexagonProfile {
  fuerzaRelativa: number
  resistenciaMuscular: number
  controlEquilibrio: number
  movilidadArticular: number
  tensionCorporal: number
  tecnicaHabilidad: number
}

export interface QuestionnaireResult {
  level: UserLevel
  hexagon: HexagonProfile
  recommendedExercises: string[]
}

export interface QuestionnaireWizardProps {
  onComplete?: (result: QuestionnaireResult) => void
}

interface Answers {
  age?: number
  weight?: number
  height?: number
  gender?: Gender
  experience?: Experience
  pushups?: '0' | '1-5' | '6-10' | '11-20' | '20+' | 'test'
  pullups?: '0' | '1-3' | '4-7' | '8-12' | '12+' | 'test'
  dips?: '0' | '1-5' | '6-10' | '11-15' | '15+' | 'test'
  plank?: '<30s' | '30-60s' | '1-2min' | '2min+' | 'test'
  goal?: Goal
  days?: number
  minutes?: number
  equipment?: Equipment
}

const expScoreMap: Record<Experience, number> = {
  none: 0,
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
}

function calculateLevel(a: Answers): UserLevel {
  let score = 0
  if (a.experience) score += expScoreMap[a.experience]

  if (a.pushups === '20+') score += 2
  else if (a.pushups === '11-20') score += 1

  if (a.pullups === '12+') score += 2
  else if (a.pullups === '8-12') score += 1

  if (a.dips === '15+') score += 2
  else if (a.dips === '11-15') score += 1

  if (a.plank === '2min+') score += 2
  else if (a.plank === '1-2min') score += 1

  if (score >= 7) return 'EXPERTO'
  if (score >= 5) return 'AVANZADO'
  if (score >= 3) return 'INTERMEDIO'
  if (score >= 1) return 'NOVATO'
  return 'PRINCIPIANTE'
}

function calculateHexagon(a: Answers): HexagonProfile {
  const pushScore = a.pushups === '20+' ? 8 : a.pushups === '11-20' ? 6 : a.pushups === '6-10' ? 4 : 2
  const pullScore = a.pullups === '12+' ? 8 : a.pullups === '8-12' ? 6 : a.pullups === '4-7' ? 4 : 2
  const dipScore = a.dips === '15+' ? 8 : a.dips === '11-15' ? 6 : a.dips === '6-10' ? 4 : 2
  const plankScore = a.plank === '2min+' ? 8 : a.plank === '1-2min' ? 6 : a.plank === '30-60s' ? 4 : 2

  return {
    fuerzaRelativa: (pushScore + pullScore + dipScore) / 3,
    resistenciaMuscular: Math.round(((pushScore + plankScore) / 2) * 10) / 10,
    controlEquilibrio: a.goal === 'handstand' ? 4 : 3,
    movilidadArticular: 4,
    tensionCorporal: Math.round(((pullScore + plankScore) / 2) * 10) / 10,
    tecnicaHabilidad: a.experience === 'expert' ? 4 : 2,
  }
}

function recommendExercises(goal?: Goal): string[] {
  switch (goal) {
    case 'muscle_up':
      return ['pull_explosive', 'dips_deep', 'pull_high', 'muscle_up_negatives']
    case 'handstand':
      return ['pike_pushups', 'hollow_hold', 'wall_handstand', 'chest_to_wall']
    case 'front_lever':
      return ['tuck_fl', 'adv_tuck_fl', 'straddle_fl', 'dragon_flag']
    case 'lose_weight':
      return ['burpees', 'mountain_climbers', 'jumping_jacks']
    case 'gain_muscle':
      return ['weighted_dips', 'weighted_pullups', 'pistol_squats']
    case 'endurance':
      return ['circuit_training', 'emom_workouts', 'amrap_sessions']
    default:
      return ['push_standard', 'pull_standard', 'plank_standard']
  }
}

export default function QuestionnaireWizard({ onComplete }: QuestionnaireWizardProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [testing, setTesting] = useState<{ name: string; timer: number; counter: number } | null>(null)

  const canNext = useMemo(() => {
    if (step === 0) return Boolean(answers.age && answers.weight && answers.height && answers.gender && answers.experience)
    if (step === 1) return Boolean(answers.pushups && answers.pullups)
    if (step === 2) return Boolean(answers.dips && answers.plank)
    if (step === 3) return Boolean(answers.goal && answers.days && answers.minutes && answers.equipment)
    return true
  }, [step, answers])

  const result: QuestionnaireResult | null = useMemo(() => {
    if (step < 4) return null
    const level = calculateLevel(answers)
    const hexagon = calculateHexagon(answers)
    const recommendedExercises = recommendExercises(answers.goal)
    return { level, hexagon, recommendedExercises }
  }, [step, answers])

  const startTest = (name: string) => {
    setTesting({ name, timer: 0, counter: 0 })
    const start = Date.now()
    const interval = setInterval(() => {
      setTesting(prev => {
        if (!prev) return null
        const elapsed = Math.floor((Date.now() - start) / 1000)
        return { ...prev, timer: elapsed }
      })
    }, 1000)
    // Auto-stop after 120s
    setTimeout(() => clearInterval(interval), 120000)
  }

  const stopTest = () => setTesting(null)

  const setValue = (k: keyof Answers, v: any) => setAnswers(prev => ({ ...prev, [k]: v }))

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${((step + 1) / 5) * 100}%` }} />
        </div>
        <p className="text-sm text-gray-600 mt-2">Paso {step + 1} de 5</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        {step === 0 && (
          <>
            <h2 className="text-xl font-semibold">Información personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm">Edad
                <input type="number" min={10} max={120} value={answers.age ?? ''} onChange={e => setValue('age', Number(e.target.value))} className="w-full mt-1 border rounded p-2" />
              </label>
              <label className="text-sm">Peso (kg)
                <input type="number" min={20} max={300} value={answers.weight ?? ''} onChange={e => setValue('weight', Number(e.target.value))} className="w-full mt-1 border rounded p-2" />
              </label>
              <label className="text-sm">Altura (cm)
                <input type="number" min={100} max={250} value={answers.height ?? ''} onChange={e => setValue('height', Number(e.target.value))} className="w-full mt-1 border rounded p-2" />
              </label>
              <label className="text-sm">Género
                <select value={answers.gender ?? ''} onChange={e => setValue('gender', e.target.value as Gender)} className="w-full mt-1 border rounded p-2">
                  <option value="" disabled>Selecciona</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </label>
              <label className="text-sm md:col-span-2">Experiencia
                <select value={answers.experience ?? ''} onChange={e => setValue('experience', e.target.value as Experience)} className="w-full mt-1 border rounded p-2">
                  <option value="" disabled>Selecciona</option>
                  <option value="none">Nunca he practicado</option>
                  <option value="beginner">0-6 meses</option>
                  <option value="intermediate">6-12 meses</option>
                  <option value="advanced">1-2 años</option>
                  <option value="expert">Más de 2 años</option>
                </select>
              </label>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold">Evaluación de empuje y tirón</h2>
            <p className="text-sm text-gray-600">Puedes seleccionar una opción o hacer el test ahora.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm">Flexiones
                <select value={answers.pushups ?? ''} onChange={e => setValue('pushups', e.target.value as Answers['pushups'])} className="w-full mt-1 border rounded p-2">
                  <option value="" disabled>Selecciona</option>
                  <option value="0">0</option>
                  <option value="1-5">1-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-20">11-20</option>
                  <option value="20+">20+</option>
                  <option value="test">Probar ahora</option>
                </select>
              </label>
              <label className="text-sm">Dominadas
                <select value={answers.pullups ?? ''} onChange={e => setValue('pullups', e.target.value as Answers['pullups'])} className="w-full mt-1 border rounded p-2">
                  <option value="" disabled>Selecciona</option>
                  <option value="0">0</option>
                  <option value="1-3">1-3</option>
                  <option value="4-7">4-7</option>
                  <option value="8-12">8-12</option>
                  <option value="12+">12+</option>
                  <option value="test">Probar ahora</option>
                </select>
              </label>
            </div>
            {((answers.pushups === 'test') || (answers.pullups === 'test')) && (
              <div className="mt-3 p-3 bg-indigo-50 rounded">
                <p className="text-sm">Modo prueba: usa el contador y el timer.</p>
                {!testing ? (
                  <button onClick={() => startTest('test')} className="px-3 py-2 bg-indigo-600 text-white rounded">Iniciar</button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span>Tiempo: {testing.timer}s</span>
                    <span>Reps: {testing.counter}</span>
                    <button onClick={() => setTesting(prev => (prev ? { ...prev, counter: prev.counter + 1 } : prev))} className="px-2 py-1 bg-gray-200 rounded">+1</button>
                    <button onClick={stopTest} className="px-3 py-2 bg-gray-800 text-white rounded">Finalizar</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold">Evaluación de fondos y core</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm">Fondos (paralelas)
                <select value={answers.dips ?? ''} onChange={e => setValue('dips', e.target.value as Answers['dips'])} className="w-full mt-1 border rounded p-2">
                  <option value="" disabled>Selecciona</option>
                  <option value="0">0</option>
                  <option value="1-5">1-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-15">11-15</option>
                  <option value="15+">15+</option>
                  <option value="test">Probar ahora</option>
                </select>
              </label>
              <label className="text-sm">Plancha (isométrico)
                <select value={answers.plank ?? ''} onChange={e => setValue('plank', e.target.value as Answers['plank'])} className="w-full mt-1 border rounded p-2">
                  <option value="" disabled>Selecciona</option>
                  <option value="<30s">&lt;30s</option>
                  <option value="30-60s">30-60s</option>
                  <option value="1-2min">1-2min</option>
                  <option value="2min+">2min+</option>
                  <option value="test">Probar ahora</option>
                </select>
              </label>
            </div>
            {answers.plank === 'test' && (
              <div className="mt-3 p-3 bg-indigo-50 rounded">
                <p className="text-sm">Modo prueba: timer de isométrico.</p>
                {!testing ? (
                  <button onClick={() => startTest('plank')} className="px-3 py-2 bg-indigo-600 text-white rounded">Iniciar</button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span>Tiempo: {testing.timer}s</span>
                    <button onClick={stopTest} className="px-3 py-2 bg-gray-800 text-white rounded">Finalizar</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold">Objetivos y disponibilidad</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm">Objetivo principal
                <select value={answers.goal ?? ''} onChange={e => setValue('goal', e.target.value as Goal)} className="w-full mt-1 border rounded p-2">
                  <option value="" disabled>Selecciona</option>
                  <option value="muscle_up">Muscle Up</option>
                  <option value="handstand">Handstand</option>
                  <option value="front_lever">Front Lever</option>
                  <option value="lose_weight">Perder peso</option>
                  <option value="gain_muscle">Ganar músculo</option>
                  <option value="endurance">Mejorar resistencia</option>
                </select>
              </label>
              <label className="text-sm">Días por semana
                <input type="number" min={2} max={7} value={answers.days ?? ''} onChange={e => setValue('days', Number(e.target.value))} className="w-full mt-1 border rounded p-2" />
              </label>
              <label className="text-sm">Minutos por sesión
                <input type="number" min={20} max={90} value={answers.minutes ?? ''} onChange={e => setValue('minutes', Number(e.target.value))} className="w-full mt-1 border rounded p-2" />
              </label>
              <label className="text-sm">Equipamiento
                <select value={answers.equipment ?? ''} onChange={e => setValue('equipment', e.target.value as Equipment)} className="w-full mt-1 border rounded p-2">
                  <option value="" disabled>Selecciona</option>
                  <option value="none">Ninguno</option>
                  <option value="bar">Barra</option>
                  <option value="parallettes">Paralelas</option>
                  <option value="rings">Anillas</option>
                  <option value="full">Completo</option>
                </select>
              </label>
            </div>
          </>
        )}

        {step === 4 && result && (
          <>
            <h2 className="text-xl font-semibold">Resumen y confirmación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nivel inicial</p>
                <p className="text-2xl font-bold">{result.level}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Recomendados para empezar</p>
                <ul className="list-disc ml-5 text-sm">
                  {result.recommendedExercises.map(id => (
                    <li key={id}>{id}</li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-2">Perfil Hexagonal (0-10)</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(result.hexagon).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="w-40 capitalize">{k}</span>
                      <div className="flex-1 bg-gray-200 rounded h-2">
                        <div className="bg-green-600 h-2 rounded" style={{ width: `${(v/10)*100}%` }} />
                      </div>
                      <span className="w-10 text-right">{v.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded"
                onClick={() => onComplete?.(result)}
              >
                Confirmar (demo)
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button disabled={step===0} onClick={() => setStep(s => Math.max(0, s-1))} className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50">Atrás</button>
        <button disabled={!canNext} onClick={() => setStep(s => Math.min(4, s+1))} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">Siguiente</button>
      </div>
    </div>
  )
}