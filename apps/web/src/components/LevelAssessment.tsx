'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, ArrowRight, ArrowLeft, Target, TrendingUp } from 'lucide-react'
import { assessmentQuestions, calculateAssessmentResult, type AssessmentResult } from '@/data/levelAssessment'

interface LevelAssessmentProps {
  onComplete: (result: AssessmentResult) => void
  onSkip?: () => void
}

export default function LevelAssessment({ onComplete, onSkip }: LevelAssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [result, setResult] = useState<AssessmentResult | null>(null)

  const currentQuestion = assessmentQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100
  const isLastQuestion = currentQuestionIndex === assessmentQuestions.length - 1

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      // Calcular resultado
      const assessmentResult = calculateAssessmentResult(answers)
      setResult(assessmentResult)
      setIsCompleted(true)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    if (result) {
      onComplete(result)
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      empujes: '💪',
      tracciones: '🏋️',
      core: '🎯',
      tren_inferior: '🦵',
      equilibrio: '⚖️'
    }
    return icons[category as keyof typeof icons] || '💪'
  }

  const getCategoryName = (category: string) => {
    const names = {
      empujes: 'Empujes',
      tracciones: 'Tracciones',
      core: 'Core',
      tren_inferior: 'Tren Inferior',
      equilibrio: 'Equilibrio'
    }
    return names[category as keyof typeof names] || category
  }

  const getLevelColor = (level: string) => {
    const colors = {
      principiante: 'text-green-600 bg-green-50',
      intermedio: 'text-blue-600 bg-blue-50',
      avanzado: 'text-purple-600 bg-purple-50'
    }
    return colors[level as keyof typeof colors] || 'text-gray-600 bg-gray-50'
  }

  if (isCompleted && result) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              ¡Evaluación Completada!
            </CardTitle>
            <CardDescription className="text-green-700">
              Hemos determinado tu nivel actual de calistenia
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Resultado Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Tu Nivel Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getLevelColor(result.level)}`}>
                {result.level.charAt(0).toUpperCase() + result.level.slice(1)}
              </div>
              <p className="mt-4 text-gray-600">
                Puntuación total: <span className="font-semibold">{result.totalScore}/4.0</span>
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Basado en tus respuestas, este es el nivel más adecuado para comenzar tu entrenamiento.
              </p>
            </CardContent>
          </Card>

          {/* Puntuaciones por Categoría */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Análisis por Categorías
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(result.categoryScores).map(([category, score]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <span>{getCategoryIcon(category)}</span>
                      {getCategoryName(category)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round(score * 10) / 10}/4.0
                    </span>
                  </div>
                  <Progress value={(score / 4) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Ejercicios Recomendados */}
        {result.recommendedExercises.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ejercicios Recomendados para Empezar</CardTitle>
              <CardDescription>
                Basado en tu evaluación, estos ejercicios son ideales para tu nivel actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.recommendedExercises.slice(0, 6).map((exerciseId, index) => (
                  <div
                    key={exerciseId}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="text-sm font-medium text-gray-800">
                      {exerciseId.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-4">
          <Button onClick={handleComplete} size="lg" className="px-8">
            Continuar con mi Nivel
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {onSkip && (
            <Button variant="outline" onClick={onSkip} size="lg">
              Saltar por Ahora
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Conoce tu Nivel
        </h1>
        <p className="text-gray-600">
          Responde estas preguntas para personalizar tu experiencia de entrenamiento
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Pregunta {currentQuestionIndex + 1} de {assessmentQuestions.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(progress)}% completado
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg">
                {getCategoryIcon(currentQuestion.category)}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg">
                {getCategoryName(currentQuestion.category)}
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-base font-medium text-gray-900">
            {currentQuestion.question}
          </CardDescription>
          {currentQuestion.description && (
            <p className="text-sm text-gray-600 mt-2">
              {currentQuestion.description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label 
                  htmlFor={option.value}
                  className="flex-1 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {onSkip && (
            <Button variant="ghost" onClick={onSkip}>
              Saltar Evaluación
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
          >
            {isLastQuestion ? 'Ver Resultado' : 'Siguiente'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}