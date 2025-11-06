'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, Medal } from 'lucide-react'

type MissionType = 'easy' | 'medium' | 'hard'

interface DailyMission {
  id: string
  title: string
  description: string
  type: MissionType
  xpReward: number
  coinsReward: number
  progress: number
  target: number
  completed: boolean
  exerciseKey?: string
}

const typeConfig: Record<MissionType, { color: string; label: string }> = {
  easy: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Easy' },
  medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Medium' },
  hard: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Hard' },
}

function pickRewards(t: MissionType) {
  return t === 'easy'
    ? { xp: 25, coins: 10 }
    : t === 'medium'
    ? { xp: 60, coins: 25 }
    : { xp: 120, coins: 50 }
}

function useQuestionnaireRecommended(): string[] {
  const [list, setList] = useState<string[]>([])
  useEffect(() => {
    try {
      const raw = localStorage.getItem('recommendedExercises')
      if (raw) {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr)) setList(arr)
        return
      }
      // Fallback: derivar recomendaciones a partir de estrellas del hexágono
      const starsRaw = localStorage.getItem('skillsHexagonStars')
      if (starsRaw) {
        const stars = JSON.parse(starsRaw) as Record<string, number>
        // Elegir 3 ejercicios base según debilidad principal
        const entries = Object.entries(stars)
        entries.sort((a,b) => (a[1] as number) - (b[1] as number))
        const weakest = entries.slice(0, 3).map(e => e[0])
        const mapAxisToExercise: Record<string, string> = {
          fuerzaRelativa: 'push_standard',
          resistenciaMuscular: 'burpees',
          controlEquilibrio: 'wall_handstand',
          movilidadArticular: 'hip_mobility_flow',
          tensionCorporal: 'hollow_hold',
          tecnica: 'tuck_fl',
        }
        const picks = weakest.map(axis => mapAxisToExercise[axis] || 'plank_standard')
        setList(picks)
        return
      }
    } catch {}
  }, [])
  return list
}

function suggestedMissions(recommended: string[]): DailyMission[] {
  const base: DailyMission[] = [
    {
      id: 'm_pushups',
      title: 'Push-ups of the day',
      description: 'Complete 30 push-ups in 3 sets',
      type: 'easy',
      ...pickRewards('easy'),
      xpReward: pickRewards('easy').xp,
      coinsReward: pickRewards('easy').coins,
      progress: 0,
      target: 30,
      completed: false,
      exerciseKey: 'push_standard',
    },
    {
      id: 'm_pullups',
      title: 'Controlled pull-ups',
      description: 'Accumulate 20 strict pull-ups',
      type: 'medium',
      xpReward: pickRewards('medium').xp,
      coinsReward: pickRewards('medium').coins,
      progress: 0,
      target: 20,
      completed: false,
      exerciseKey: 'pull_standard',
    },
    {
      id: 'm_core',
      title: 'Plank and core',
      description: 'Hold a total of 3 minutes of plank',
      type: 'hard',
      xpReward: pickRewards('hard').xp,
      coinsReward: pickRewards('hard').coins,
      progress: 0,
      target: 180,
      completed: false,
      exerciseKey: 'plank_standard',
    },
  ]

  // Si hay recomendados del cuestionario, reemplazar objetivos por 3 relacionados
  if (recommended && recommended.length) {
    const picks = recommended.slice(0, 3)
    return base.map((m, i) => ({
      ...m,
      id: `${m.id}_${i}`,
      title: `Misión: ${picks[i] || m.title}`,
      description: `Completa el ejercicio recomendado: ${picks[i] || m.exerciseKey}`,
      exerciseKey: picks[i] || m.exerciseKey,
    }))
  }
  return base
}

export default function MissionsPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const recommended = useQuestionnaireRecommended()
  const [missions, setMissions] = useState<DailyMission[]>([])
  const [xp, setXp] = useState<number>(0)
  const [coins, setCoins] = useState<number>(0)
  const [weakestAxis, setWeakestAxis] = useState<string | null>(null)
  const [percentiles, setPercentiles] = useState<Record<string, number> | null>(null)
  const [rerollCost] = useState<number>(20)
  const [rerollUsedToday, setRerollUsedToday] = useState<boolean>(false)
  const [streak, setStreak] = useState<number>(0)

  // mapa ejercicio -> eje del hexágono
  const exerciseToAxis: Record<string, string> = {
    push_standard: 'fuerzaRelativa',
    burpees: 'resistenciaMuscular',
    wall_handstand: 'controlEquilibrio',
    hip_mobility_flow: 'movilidadArticular',
    hollow_hold: 'tensionCorporal',
    tuck_fl: 'tecnica',
    plank_standard: 'tensionCorporal',
  }

  // cargar estado
  useEffect(() => {
    if (!mounted) return
    try {
      const raw = localStorage.getItem('cp_missions_today')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setMissions(parsed)
      } else {
        setMissions(suggestedMissions(recommended))
      }
      setXp(parseInt(localStorage.getItem('cp_exp') || '0', 10) || 0)
      setCoins(parseInt(localStorage.getItem('cp_coins') || '0', 10) || 0)
      const rerollDate = localStorage.getItem('cp_missions_reroll_date')
      const today = new Date().toISOString().slice(0,10)
      setRerollUsedToday(rerollDate === today)
      const lastComplete = localStorage.getItem('cp_missions_last_completed')
      const streakRaw = localStorage.getItem('cp_missions_streak')
      const currentStreak = parseInt(streakRaw || '0', 10) || 0
      const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString().slice(0,10)
      if (lastComplete === today) {
        setStreak(currentStreak)
      } else if (lastComplete === yesterday) {
        setStreak(currentStreak)
      } else {
        setStreak(lastComplete ? 0 : currentStreak)
      }
    } catch {
      setMissions(suggestedMissions(recommended))
    }
  }, [mounted, recommended])

  // persistir
  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem('cp_missions_today', JSON.stringify(missions))
      localStorage.setItem('cp_exp', String(xp))
      localStorage.setItem('cp_coins', String(coins))
    } catch {}
  }, [missions, xp, coins, mounted])

  // obtener percentiles del hexágono para determinar eje más débil
  useEffect(() => {
    if (!mounted) return
    try {
      const starsRaw = localStorage.getItem('skillsHexagonStars')
      if (!starsRaw) return
      const stars = JSON.parse(starsRaw)
      fetch('/api/skills-percentiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars }),
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (!data || !data.percentiles) return
          const percent: Record<string, number> = data.percentiles
          setPercentiles(percent)
          const entries: Array<[string, number]> = Object.entries(percent)
          if (!entries.length) return
          entries.sort((a,b) => a[1] - b[1])
          setWeakestAxis(entries[0][0])
        })
        .catch(() => {})
    } catch {}
  }, [mounted])

  const incrementMission = (id: string, amount = 1) => {
    setMissions(prev => {
      const next = prev.map(m => {
        if (m.id !== id) return m
        const newProgress = Math.min(m.target, m.progress + amount)
        const completed = !m.completed && newProgress >= m.target
        return { ...m, progress: newProgress, completed: completed ? true : m.completed }
      })
      const justCompleted = next.find(m => m.id === id && m.completed && m.progress === m.target)
      if (justCompleted) {
        const baseXp = justCompleted.xpReward
        let bonus = 0
        const axis = justCompleted.exerciseKey ? exerciseToAxis[justCompleted.exerciseKey] : null
        if (weakestAxis && axis && weakestAxis === axis) {
          const p = percentiles && axis ? percentiles[axis] : null
          // Escala de bonus por percentil: <5% +30, <15% +20, <30% +10
          if (typeof p === 'number') {
            if (p < 5) bonus = 30
            else if (p < 15) bonus = 20
            else if (p < 30) bonus = 10
            else bonus = 0
          } else {
            bonus = 15
          }
        }
        setXp(x => x + baseXp + bonus)
        setCoins(c => c + justCompleted.coinsReward)
        // actualizar racha diaria
        const today = new Date().toISOString().slice(0,10)
        const lastComplete = localStorage.getItem('cp_missions_last_completed')
        let nextStreak = streak
        if (lastComplete !== today) {
          const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString().slice(0,10)
          nextStreak = lastComplete === yesterday ? streak + 1 : 1
          setStreak(nextStreak)
          try {
            localStorage.setItem('cp_missions_last_completed', today)
            localStorage.setItem('cp_missions_streak', String(nextStreak))
          } catch {}
          // bonus por racha: 3 días +5 monedas, 7 días +20 XP
          if (nextStreak >= 7) {
            setXp(x => x + 20)
          } else if (nextStreak >= 3) {
            setCoins(c => c + 5)
          }
        }
      }
      return next
    })
  }

  const resetDay = () => {
    const fresh = suggestedMissions(recommended)
    setMissions(fresh)
  }

  const handleReroll = () => {
    if (rerollUsedToday) return
    if (coins < rerollCost) return
    const fresh = suggestedMissions(recommended)
    setMissions(fresh)
    setCoins(c => c - rerollCost)
    const today = new Date().toISOString().slice(0,10)
    try {
      localStorage.setItem('cp_missions_reroll_date', today)
    } catch {}
    setRerollUsedToday(true)
  }

  const progressPct = (m: DailyMission) => Math.round((m.progress / m.target) * 100)
  const isTimeBased = (m: DailyMission) => m.target >= 120 // heurística simple

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [timerRunningId, setTimerRunningId] = useState<string | null>(null)

  const startTimer = (m: DailyMission) => {
    if (!isTimeBased(m)) return
    if (timerRunningId) return
    setTimerRunningId(m.id)
    timerRef.current = setInterval(() => {
      setMissions(prev => prev.map(x => {
        if (x.id !== m.id) return x
        const np = Math.min(x.target, x.progress + 1)
        const completed = !x.completed && np >= x.target
        return { ...x, progress: np, completed: completed ? true : x.completed }
      }))
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    setTimerRunningId(null)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Missions</h1>
            <p className="text-gray-600">Complete quick tasks to earn XP and coins.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">{xp} XP</span>
            </div>
            <div className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold">{coins}</span>
            </div>
            <div className="text-sm text-gray-700">Streak: {streak} days 🔥</div>
            <Button variant="outline" onClick={handleReroll} disabled={rerollUsedToday || coins < rerollCost}>
              Reroll (-{rerollCost})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {missions.map((m) => (
            <Card key={m.id} className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{m.title}</CardTitle>
                  <span className={`text-xs px-2 py-1 rounded border ${typeConfig[m.type].color}`}>{typeConfig[m.type].label}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{m.description}</p>
                {weakestAxis && m.exerciseKey && exerciseToAxis[m.exerciseKey] === weakestAxis && (
                  <div className="mb-2 text-xs text-purple-700">
                    {(() => {
                      const axis = exerciseToAxis[m.exerciseKey!]
                      const p = percentiles && axis ? percentiles[axis] : null
                      let b = 15
                      if (typeof p === 'number') {
                        if (p < 5) b = 30
                        else if (p < 15) b = 20
                        else if (p < 30) b = 10
                        else b = 0
                      }
                      return b > 0 ? `Low percentile bonus (${p ?? '–'}%): +${b} XP` : 'No percentile bonus'
                    })()}
                  </div>
                )}

                <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                  <div
                    className={`h-2 rounded-full ${m.completed ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
                    style={{ width: `${progressPct(m)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span>Progress: {m.progress}/{m.target}</span>
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" /> +{m.xpReward} XP
                    <Medal className="w-4 h-4 text-yellow-600" /> +{m.coinsReward}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {isTimeBased(m) ? (
                    <>
                      <Button onClick={() => startTimer(m)} disabled={m.completed || !!timerRunningId}>Start timer</Button>
                      <Button variant="secondary" onClick={stopTimer} disabled={!timerRunningId}>Stop</Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => incrementMission(m.id, 1)} disabled={m.completed}>+1</Button>
                      <Button onClick={() => incrementMission(m.id, 5)} disabled={m.completed}>+5</Button>
                      <Button onClick={() => incrementMission(m.id, Math.ceil(m.target / 3))} disabled={m.completed}>
                        Advance (+{Math.ceil(m.target / 3)})
                      </Button>
                      <Button variant="secondary" onClick={() => incrementMission(m.id, m.target)} disabled={m.completed}>
                        Complete
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="outline" onClick={resetDay}>Regenerate missions</Button>
          <Button onClick={() => window.location.assign('/training')}>Go to Training</Button>
        </div>
      </div>
    </div>
  )
}