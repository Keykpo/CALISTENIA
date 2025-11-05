'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, User, TrendingUp } from 'lucide-react'

interface ExerciseRecord {
  exerciseName: string
  type: 'time' | 'reps' // tiempo en segundos o repeticiones
  value: number // segundos o repeticiones
  date: string
}

interface UserRanking {
  id: string
  name: string
  email: string
  totalScore: number
  skillLevels: {
    empujes: number
    tracciones: number
    core: number
    equilibrio: number
    tren_inferior: number
    estaticos: number
    dinamicos: number
  }
  exerciseRecords: ExerciseRecord[] // Nuevos registros de ejercicios
  rank: number
  unlockedSkills: number
}

interface RankingProps {
  currentUserId?: string
}

export default function Ranking({ currentUserId }: RankingProps) {
  const [rankings, setRankings] = useState<UserRanking[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<UserRanking | null>(null)
  const [loading, setLoading] = useState(true)

  // Función para calcular puntos de ejercicios individuales
  const calculateExercisePoints = (records: ExerciseRecord[]): number => {
    if (!records || records.length === 0) return 0
    
    // Agrupar por ejercicio y calcular promedio
    const exerciseGroups: { [key: string]: number[] } = {}
    
    records.forEach(record => {
      if (!exerciseGroups[record.exerciseName]) {
        exerciseGroups[record.exerciseName] = []
      }
      // 1 segundo = 1000 puntos, 1 repetición = 1000 puntos
      const points = record.value * 1000
      exerciseGroups[record.exerciseName].push(points)
    })
    
    // Calcular promedio por ejercicio y sumar todos
    let totalPoints = 0
    Object.values(exerciseGroups).forEach(points => {
      const average = points.reduce((sum, p) => sum + p, 0) / points.length
      totalPoints += average
    })
    
    return Math.round(totalPoints)
  }

  // Función para calcular el puntaje total basado en habilidades y ejercicios
  const calculateTotalScore = (
    skillLevels: UserRanking['skillLevels'], 
    exerciseRecords: ExerciseRecord[] = []
  ): number => {
    // Puntos por habilidades (sistema anterior)
    const skillWeights = {
      empujes: 1.2,      // Peso mayor para empujes
      tracciones: 1.3,   // Peso mayor para tracciones (más difícil)
      core: 1.1,         // Core importante
      equilibrio: 1.4,   // Equilibrio muy valorado (más difícil)
      tren_inferior: 1.0, // Peso base
      estaticos: 1.5,    // Movimientos estáticos muy valorados
      dinamicos: 1.6     // Movimientos dinámicos más valorados
    }

    let skillScore = 0
    Object.entries(skillLevels).forEach(([skill, level]) => {
      const weight = skillWeights[skill as keyof typeof skillWeights] || 1
      skillScore += level * weight * 1000 // Multiplicamos por 1000 para equiparar con ejercicios
    })

    // Puntos por ejercicios (nuevo sistema)
    const exerciseScore = calculateExercisePoints(exerciseRecords)
    
    // Combinar ambos sistemas
    const totalScore = skillScore + exerciseScore
    
    return Math.round(totalScore * 10) / 10
  }

  // Generar datos de ejemplo para el ranking
  useEffect(() => {
    const generateMockRankings = () => {
      const mockUsers: Omit<UserRanking, 'rank' | 'totalScore'>[] = [
        {
          id: '1',
          name: 'Carlos Mendoza',
          email: 'carlos@example.com',
          skillLevels: { empujes: 8, tracciones: 7, core: 9, equilibrio: 6, tren_inferior: 7, estaticos: 5, dinamicos: 4 },
          exerciseRecords: [
            { exerciseName: 'Flexiones', type: 'reps', value: 50, date: '2024-01-15' },
            { exerciseName: 'Plancha', type: 'time', value: 120, date: '2024-01-15' },
            { exerciseName: 'Dominadas', type: 'reps', value: 15, date: '2024-01-14' },
            { exerciseName: 'Flexiones', type: 'reps', value: 45, date: '2024-01-14' }
          ],
          unlockedSkills: 15
        },
        {
          id: '2',
          name: 'Ana García',
          email: 'ana@example.com',
          skillLevels: { empujes: 6, tracciones: 8, core: 7, equilibrio: 9, tren_inferior: 6, estaticos: 7, dinamicos: 6 },
          exerciseRecords: [
            { exerciseName: 'Dominadas', type: 'reps', value: 20, date: '2024-01-15' },
            { exerciseName: 'Plancha lateral', type: 'time', value: 90, date: '2024-01-15' },
            { exerciseName: 'Sentadillas', type: 'reps', value: 100, date: '2024-01-14' }
          ],
          unlockedSkills: 18
        },
        {
          id: '3',
          name: 'Miguel Torres',
          email: 'miguel@example.com',
          skillLevels: { empujes: 9, tracciones: 6, core: 8, equilibrio: 5, tren_inferior: 8, estaticos: 6, dinamicos: 7 },
          exerciseRecords: [
            { exerciseName: 'Flexiones diamante', type: 'reps', value: 30, date: '2024-01-15' },
            { exerciseName: 'L-sit', type: 'time', value: 45, date: '2024-01-15' },
            { exerciseName: 'Burpees', type: 'reps', value: 25, date: '2024-01-14' }
          ],
          unlockedSkills: 16
        },
        {
          id: '4',
          name: 'Laura Ruiz',
          email: 'laura@example.com',
          skillLevels: { empujes: 5, tracciones: 9, core: 6, equilibrio: 8, tren_inferior: 5, estaticos: 8, dinamicos: 5 },
          exerciseRecords: [
            { exerciseName: 'Muscle-ups', type: 'reps', value: 8, date: '2024-01-15' },
            { exerciseName: 'Handstand', type: 'time', value: 60, date: '2024-01-15' },
            { exerciseName: 'Pistol squats', type: 'reps', value: 12, date: '2024-01-14' }
          ],
          unlockedSkills: 14
        },
        {
          id: '5',
          name: 'David López',
          email: 'david@example.com',
          skillLevels: { empujes: 7, tracciones: 5, core: 8, equilibrio: 7, tren_inferior: 9, estaticos: 4, dinamicos: 8 },
          exerciseRecords: [
            { exerciseName: 'Saltos de caja', type: 'reps', value: 40, date: '2024-01-15' },
            { exerciseName: 'Plancha', type: 'time', value: 180, date: '2024-01-15' },
            { exerciseName: 'Flexiones archer', type: 'reps', value: 10, date: '2024-01-14' }
          ],
          unlockedSkills: 17
        },
        {
          id: 'current',
          name: 'Tu Perfil',
          email: 'tu@example.com',
          skillLevels: { empujes: 2, tracciones: 1, core: 3, equilibrio: 1, tren_inferior: 2, estaticos: 0, dinamicos: 0 },
          exerciseRecords: [
            { exerciseName: 'Flexiones', type: 'reps', value: 10, date: '2024-01-15' },
            { exerciseName: 'Plancha', type: 'time', value: 30, date: '2024-01-15' },
            { exerciseName: 'Sentadillas', type: 'reps', value: 20, date: '2024-01-14' }
          ],
          unlockedSkills: 8
        }
      ]

      // Calcular puntajes y ordenar
      const usersWithScores = mockUsers.map(user => ({
        ...user,
        totalScore: calculateTotalScore(user.skillLevels, user.exerciseRecords)
      })).sort((a, b) => b.totalScore - a.totalScore)

      // Asignar rankings
      const rankedUsers = usersWithScores.map((user, index) => ({
        ...user,
        rank: index + 1
      }))

      setRankings(rankedUsers)
      
      // Encontrar el usuario actual
      const currentUser = rankedUsers.find(user => user.id === 'current')
      setCurrentUserRank(currentUser || null)
      
      setLoading(false)
    }

    generateMockRankings()
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
    if (rank <= 10) return 'bg-gradient-to-r from-blue-400 to-blue-600'
    if (rank <= 25) return 'bg-gradient-to-r from-green-400 to-green-600'
    return 'bg-gradient-to-r from-gray-400 to-gray-600'
  }

  const getSkillCategoryName = (skill: string) => {
    const names = {
      empujes: 'Empujes',
      tracciones: 'Tracciones',
      core: 'Core',
      equilibrio: 'Equilibrio',
      tren_inferior: 'Tren Inferior',
      estaticos: 'Estáticos',
      dinamicos: 'Dinámicos'
    }
    return names[skill as keyof typeof names] || skill
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tu Posición Actual */}
      {currentUserRank && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Tu Posición Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                  {getRankIcon(currentUserRank.rank)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{currentUserRank.name}</h3>
                  <p className="text-sm text-gray-600">
                    Posición #{currentUserRank.rank} • {currentUserRank.totalScore} puntos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${getRankBadgeColor(currentUserRank.rank)} text-white`}>
                  Rank #{currentUserRank.rank}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">
                  {currentUserRank.unlockedSkills} habilidades desbloqueadas
                </p>
              </div>
            </div>
            
            {/* Desglose de habilidades y ejercicios del usuario actual */}
            <div className="mt-4 space-y-3">
              {/* Habilidades */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Habilidades por Categoría</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(currentUserRank.skillLevels).map(([skill, level]) => (
                    <div key={skill} className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-gray-600">{getSkillCategoryName(skill)}</p>
                      <p className="font-bold text-blue-600">{level}/10</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Ejercicios recientes */}
              {currentUserRank.exerciseRecords && currentUserRank.exerciseRecords.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Ejercicios Recientes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentUserRank.exerciseRecords.slice(0, 4).map((record, index) => (
                      <div key={index} className="text-center p-2 bg-white rounded border">
                        <p className="text-xs text-gray-600">{record.exerciseName}</p>
                        <p className="font-bold text-green-600">
                          {record.value} {record.type === 'time' ? 'seg' : 'reps'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {record.value * 1000} pts
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ranking Global
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rankings.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  user.id === 'current' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border">
                    {getRankIcon(user.rank)}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${user.id === 'current' ? 'text-blue-700' : ''}`}>
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {user.totalScore} puntos • {user.unlockedSkills} habilidades
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Top 3 skills */}
                  <div className="hidden md:flex gap-2">
                    {Object.entries(user.skillLevels)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([skill, level]) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {getSkillCategoryName(skill)}: {level}
                        </Badge>
                      ))}
                  </div>
                  
                  <Badge className={`${getRankBadgeColor(user.rank)} text-white`}>
                    #{user.rank}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Información del Sistema de Puntuación */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Puntuación Actualizado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sistema de Habilidades */}
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">Puntos por Habilidades:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Dinámicos:</span>
                  <span className="font-medium">Nivel × 1.6 × 1000</span>
                </div>
                <div className="flex justify-between">
                  <span>Estáticos:</span>
                  <span className="font-medium">Nivel × 1.5 × 1000</span>
                </div>
                <div className="flex justify-between">
                  <span>Equilibrio:</span>
                  <span className="font-medium">Nivel × 1.4 × 1000</span>
                </div>
                <div className="flex justify-between">
                  <span>Tracciones:</span>
                  <span className="font-medium">Nivel × 1.3 × 1000</span>
                </div>
                <div className="flex justify-between">
                  <span>Empujes:</span>
                  <span className="font-medium">Nivel × 1.2 × 1000</span>
                </div>
                <div className="flex justify-between">
                  <span>Core:</span>
                  <span className="font-medium">Nivel × 1.1 × 1000</span>
                </div>
                <div className="flex justify-between">
                  <span>Tren Inferior:</span>
                  <span className="font-medium">Nivel × 1.0 × 1000</span>
                </div>
              </div>
            </div>
            
            {/* Sistema de Ejercicios */}
            <div>
              <h4 className="font-semibold mb-3 text-green-600">Puntos por Ejercicios:</h4>
              <div className="space-y-2 text-sm">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">1 Repetición:</span>
                    <span className="font-bold text-green-600">1,000 puntos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">1 Segundo:</span>
                    <span className="font-bold text-green-600">1,000 puntos</span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  <p>• Se calcula el promedio por ejercicio</p>
                  <p>• Se suman todos los promedios</p>
                  <p>• Ejemplos:</p>
                  <p className="ml-2">- 50 flexiones = 50,000 pts</p>
                  <p className="ml-2">- 120 seg plancha = 120,000 pts</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              🏆 Puntaje Total = Puntos por Habilidades + Puntos por Ejercicios
            </p>
            <p className="text-xs text-blue-600 mt-1">
              El ranking se actualiza automáticamente basado en tu progreso en ambas categorías.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}