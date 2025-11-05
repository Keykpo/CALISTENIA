'use client'

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Minus, 
  Timer, 
  Trophy, 
  Crown,
  TrendingUp,
  Users
} from "lucide-react"

interface ExerciseTimerProps {
  exerciseName: string
  exerciseType: 'reps' | 'time' // repeticiones o tiempo
  onComplete: (result: { count: number; time: number }) => void
  onUpgrade?: () => void
}

// Datos simulados de ranking (en una app real vendría de la base de datos)
const rankingData = {
  'flexiones': [
    { range: [0, 10], level: 'principiante', percentile: 20 },
    { range: [11, 25], level: 'intermedio', percentile: 50 },
    { range: [26, 40], level: 'avanzado', percentile: 80 },
    { range: [41, Infinity], level: 'experto', percentile: 95 }
  ],
  'sentadillas': [
    { range: [0, 15], level: 'principiante', percentile: 25 },
    { range: [16, 35], level: 'intermedio', percentile: 55 },
    { range: [36, 60], level: 'avanzado', percentile: 85 },
    { range: [61, Infinity], level: 'experto', percentile: 95 }
  ],
  'plancha': [
    { range: [0, 30], level: 'principiante', percentile: 30 },
    { range: [31, 60], level: 'intermedio', percentile: 60 },
    { range: [61, 120], level: 'avanzado', percentile: 85 },
    { range: [121, Infinity], level: 'experto', percentile: 95 }
  ]
}

export function ExerciseTimer({ exerciseName, exerciseType, onComplete, onUpgrade }: ExerciseTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [count, setCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsRunning(true)
    setIsFinished(false)
    setShowResults(false)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = () => {
    setIsRunning(false)
    setIsFinished(true)
    setShowResults(true)
    onComplete({ count, time })
  }

  const handleReset = () => {
    setIsRunning(false)
    setTime(0)
    setCount(0)
    setIsFinished(false)
    setShowResults(false)
  }

  const incrementCount = () => {
    setCount(prev => prev + 1)
  }

  const decrementCount = () => {
    setCount(prev => Math.max(0, prev - 1))
  }

  const getRanking = () => {
    const exerciseKey = exerciseName.toLowerCase()
    const data = rankingData[exerciseKey as keyof typeof rankingData]
    
    if (!data) return null

    const value = exerciseType === 'reps' ? count : time
    const ranking = data.find(rank => value >= rank.range[0] && value <= rank.range[1])
    
    return ranking
  }

  const ranking = getRanking()

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'principiante': return 'bg-yellow-100 text-yellow-800'
      case 'intermedio': return 'bg-blue-100 text-blue-800'
      case 'avanzado': return 'bg-green-100 text-green-800'
      case 'experto': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Timer className="h-5 w-5" />
          {exerciseName}
        </CardTitle>
        <CardDescription>
          {exerciseType === 'reps' 
            ? '¿Cuántas repeticiones puedes hacer?' 
            : '¿Cuánto tiempo puedes mantenerlo?'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!showResults ? (
          <>
            {/* Temporizador */}
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatTime(time)}
              </div>
              <div className="text-sm text-gray-500">Tiempo transcurrido</div>
            </div>

            {/* Contador de repeticiones (solo para ejercicios de reps) */}
            {exerciseType === 'reps' && (
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-green-600">
                  {count}
                </div>
                <div className="text-sm text-gray-500 mb-4">Repeticiones</div>
                
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={decrementCount}
                    disabled={count === 0 || !isRunning}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    onClick={incrementCount}
                    disabled={!isRunning}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Controles */}
            <div className="flex justify-center gap-3">
              {!isRunning ? (
                <Button onClick={handleStart} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Play className="h-5 w-5 mr-2" />
                  {time === 0 ? 'Comenzar' : 'Continuar'}
                </Button>
              ) : (
                <Button onClick={handlePause} variant="outline" size="lg">
                  <Pause className="h-5 w-5 mr-2" />
                  Pausar
                </Button>
              )}
              
              <Button onClick={handleStop} variant="outline" size="lg">
                <Square className="h-5 w-5 mr-2" />
                Terminar
              </Button>
              
              {time > 0 && (
                <Button onClick={handleReset} variant="ghost" size="lg">
                  Reiniciar
                </Button>
              )}
            </div>
          </>
        ) : (
          /* Resultados y Ranking */
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">¡Excelente trabajo!</div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {exerciseType === 'reps' ? count : formatTime(time)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {exerciseType === 'reps' ? 'Repeticiones' : 'Tiempo'}
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatTime(time)}
                  </div>
                  <div className="text-sm text-gray-600">Duración total</div>
                </div>
              </div>
            </div>

            {/* Ranking */}
            {ranking && (
              <div className="space-y-4">
                <div className="text-center">
                  <Badge className={`${getLevelColor(ranking.level)} text-lg px-4 py-2`}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Nivel {ranking.level.charAt(0).toUpperCase() + ranking.level.slice(1)}
                  </Badge>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Tu rendimiento</span>
                  </div>
                  <div className="text-center mb-3">
                    <span className="text-2xl font-bold text-blue-600">{ranking.percentile}%</span>
                    <div className="text-sm text-gray-600">
                      Hiciste más que el {ranking.percentile}% de los usuarios registrados
                    </div>
                  </div>
                  <Progress value={ranking.percentile} className="mb-2" />
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    Basado en +10,000 entrenamientos registrados
                  </div>
                </div>

                {/* Call to Action para suscripción */}
                {ranking.level !== 'experto' && onUpgrade && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-center space-y-3">
                      <Crown className="h-8 w-8 text-purple-600 mx-auto" />
                      <div>
                        <h3 className="font-semibold text-purple-800">¡Mejora tus habilidades!</h3>
                        <p className="text-sm text-purple-600">
                          Accede a rutinas personalizadas y entrenamientos avanzados
                        </p>
                      </div>
                      <Button 
                        onClick={onUpgrade}
                        className="bg-purple-600 hover:bg-purple-700 w-full"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Ver Planes Premium
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Intentar de nuevo
              </Button>
              <Button 
                onClick={() => setShowResults(false)} 
                variant="ghost" 
                className="flex-1"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}