'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LevelAssessment from '@/components/LevelAssessment'
import { AssessmentResult } from '@/data/levelAssessment'

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(false)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  const handleAssessmentComplete = async (result: AssessmentResult) => {
    try {
      // Actualizar el nivel del usuario en la base de datos
      const response = await fetch('/api/user/fitness-level', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fitnessLevel: result.level,
          recommendedExercises: result.recommendedExercises,
        }),
      })

      if (response.ok) {
        setIsCompleted(true)
        // Redirigir al dashboard después de 3 segundos
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        console.error('Error updating fitness level')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Evaluación Completada!</h2>
            <p className="text-gray-600">
              Tu nivel de fitness ha sido establecido. Serás redirigido al dashboard en unos segundos.
            </p>
          </div>
          <div className="animate-pulse">
            <div className="h-2 bg-blue-200 rounded-full">
              <div className="h-2 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Bienvenido a Calisthenics Platform!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Para personalizar tu experiencia y recomendarte los ejercicios más adecuados, 
              necesitamos conocer tu nivel actual de fitness. Esta evaluación tomará solo unos minutos.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <LevelAssessment onComplete={handleAssessmentComplete} />
          </div>
        </div>
      </div>
    </div>
  )
}