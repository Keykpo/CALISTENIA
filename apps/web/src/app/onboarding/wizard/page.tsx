'use client'

import { useRouter } from 'next/navigation'
import QuestionnaireWizard, { QuestionnaireResult } from '@/components/QuestionnaireWizard'

export default function OnboardingWizardPage() {
  const router = useRouter()

  const handleComplete = async (result: QuestionnaireResult) => {
    try {
      // 1) Guardar estrellas del hexágono en localStorage para la vista de /skills-hexagon
      const clamp5 = (n: number) => Math.max(0, Math.min(5, n))
      const toStars = (v: number) => clamp5(Math.round(v / 2))
      const stars = {
        fuerzaRelativa: toStars(result.hexagon.fuerzaRelativa),
        resistenciaMuscular: toStars(result.hexagon.resistenciaMuscular),
        controlEquilibrio: toStars(result.hexagon.controlEquilibrio),
        movilidadArticular: toStars(result.hexagon.movilidadArticular),
        tensionCorporal: toStars(result.hexagon.tensionCorporal),
        tecnica: toStars(result.hexagon.tecnicaHabilidad),
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('skillsHexagonStars', JSON.stringify(stars))
      }

      // 2) Enviar snapshot al backend (persistencia básica basada en archivo)
      try {
        await fetch('/api/skills-snapshots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'anon', snapshot: { ts: Date.now(), stars } }),
        })
      } catch (e) {
        console.warn('No se pudo guardar snapshot:', e)
      }

      // 3) Intentar actualizar el nivel de fitness (si hay sesión)
      const mapLevel = (lvl: QuestionnaireResult['level']): 'BEGINNER'|'INTERMEDIATE'|'ADVANCED'|'EXPERT' => {
        switch (lvl) {
          case 'PRINCIPIANTE':
          case 'NOVATO':
            return 'BEGINNER'
          case 'INTERMEDIO':
            return 'INTERMEDIATE'
          case 'AVANZADO':
            return 'ADVANCED'
          case 'EXPERTO':
            return 'EXPERT'
        }
      }
      try {
        await fetch('/api/user/fitness-level', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fitnessLevel: mapLevel(result.level),
            recommendedExercises: result.recommendedExercises,
          }),
        })
        // Registrar assessment inicial (marca hasCompletedAssessment y assessmentDate)
        await fetch('/api/assessment/initial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fitnessLevel: mapLevel(result.level),
            hexagon: result.hexagon,
            recommendedExercises: result.recommendedExercises,
          }),
        })
      } catch (e) {
        // Silence errors (e.g., unauthenticated) in this demo flow
        console.info('Fitness level not updated (possible 401).')
      }
    } finally {
      router.push('/skills-hexagon')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cuestionario Inicial</h1>
            <p className="text-gray-600">Completa los pasos para personalizar tu experiencia.</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg">
            <QuestionnaireWizard onComplete={handleComplete} />
          </div>
        </div>
      </div>
    </div>
  )
}