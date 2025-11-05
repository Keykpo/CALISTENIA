"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Target, Calendar, CheckCircle } from 'lucide-react'

interface TrainingConfigurationProps {
  fitnessLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  onConfigurationComplete?: (config: TrainingConfig) => void
}

interface TrainingConfig {
  recommendedFrequency: number
  userPreferredFrequency: number
  weeklyGoal: string
  adaptedPlan: string
}

const getRecommendations = (level: string) => {
  switch (level) {
    case 'BEGINNER':
      return {
        frequency: 3,
        description: 'Para principiantes, recomendamos 3 sesiones por semana para permitir una recuperación adecuada.',
        benefits: ['Desarrollo de fuerza base', 'Aprendizaje de técnica', 'Prevención de lesiones']
      }
    case 'INTERMEDIATE':
      return {
        frequency: 4,
        description: 'En nivel intermedio, 4 sesiones semanales optimizan el progreso sin sobreentrenamiento.',
        benefits: ['Progresión constante', 'Variedad de ejercicios', 'Mejora de resistencia']
      }
    case 'ADVANCED':
      return {
        frequency: 5,
        description: 'Los atletas avanzados pueden entrenar 5-6 veces por semana con periodización adecuada.',
        benefits: ['Especialización avanzada', 'Máximo rendimiento', 'Técnicas complejas']
      }
    default:
      return {
        frequency: 3,
        description: 'Recomendación general de 3 sesiones por semana.',
        benefits: ['Desarrollo equilibrado']
      }
  }
}

const getAdaptedPlan = (recommended: number, preferred: number, level: string) => {
  const difference = preferred - recommended
  
  if (difference === 0) {
    return `Perfecto! Tu frecuencia elegida coincide con nuestra recomendación para nivel ${level.toLowerCase()}.`
  } else if (difference > 0) {
    return `Has elegido entrenar más frecuentemente. Aseguraremos que incluyas días de recuperación activa y variemos la intensidad.`
  } else {
    return `Has elegido una frecuencia menor. Optimizaremos cada sesión para maximizar los resultados en menos entrenamientos.`
  }
}

export default function TrainingConfiguration({ fitnessLevel, onConfigurationComplete }: TrainingConfigurationProps) {
  const [userFrequency, setUserFrequency] = useState<number | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  
  const recommendations = getRecommendations(fitnessLevel)
  
  const handleFrequencySelect = (frequency: string) => {
    setUserFrequency(parseInt(frequency))
  }
  
  const handleConfirmConfiguration = () => {
    if (userFrequency) {
      const config: TrainingConfig = {
        recommendedFrequency: recommendations.frequency,
        userPreferredFrequency: userFrequency,
        weeklyGoal: `${userFrequency} entrenamientos por semana`,
        adaptedPlan: getAdaptedPlan(recommendations.frequency, userFrequency, fitnessLevel)
      }
      
      setIsConfigured(true)
      onConfigurationComplete?.(config)
    }
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Configuración de Entrenamiento
        </CardTitle>
        <CardDescription>
          Personaliza tu frecuencia de entrenamiento basada en tu nivel y objetivos
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recomendación basada en nivel */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-blue-900">
              Recomendación para nivel {fitnessLevel.toLowerCase()}
            </h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {recommendations.frequency} días/semana
            </Badge>
          </div>
          <p className="text-blue-800 text-sm mb-3">
            {recommendations.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {recommendations.benefits.map((benefit, index) => (
              <Badge key={index} variant="outline" className="text-xs border-blue-300 text-blue-700">
                {benefit}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Selector de frecuencia del usuario */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            ¿Cuántas veces por semana prefieres entrenar?
          </label>
          <Select onValueChange={handleFrequencySelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona tu frecuencia preferida" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 días por semana</SelectItem>
              <SelectItem value="3">3 días por semana</SelectItem>
              <SelectItem value="4">4 días por semana</SelectItem>
              <SelectItem value="5">5 días por semana</SelectItem>
              <SelectItem value="6">6 días por semana</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Plan adaptado */}
        {userFrequency && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <h3 className="font-semibold text-green-900">Tu Plan Adaptado</h3>
            </div>
            <p className="text-green-800 text-sm">
              {getAdaptedPlan(recommendations.frequency, userFrequency, fitnessLevel)}
            </p>
          </div>
        )}
        
        {/* Botón de confirmación */}
        {userFrequency && !isConfigured && (
          <Button 
            onClick={handleConfirmConfiguration}
            className="w-full"
            size="lg"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirmar Configuración
          </Button>
        )}
        
        {/* Estado configurado */}
        {isConfigured && (
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-900 mb-1">¡Configuración Completada!</h3>
            <p className="text-green-800 text-sm">
              Tu objetivo semanal: {userFrequency} entrenamientos por semana
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}