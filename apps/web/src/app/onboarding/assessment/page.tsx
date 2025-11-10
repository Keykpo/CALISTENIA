'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FigOnboardingAssessment, { FigAssessmentResult } from '@/components/onboarding/FigOnboardingAssessment';
import { Trophy } from 'lucide-react';

export default function AssessmentPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleComplete = async (assessments: FigAssessmentResult[]) => {
    try {
      const res = await fetch('/api/assessment/fig-initial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session?.user?.id as string,
        },
        body: JSON.stringify({ assessments }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[ASSESSMENT] ✅ Success! Assessment saved:', {
          assessmentsSaved: data.assessmentsSaved,
          overallLevel: data.overallLevel,
          hexagonVerified: data._debug?.verified,
          hexagonId: data._debug?.hexagonId,
        });

        // CRITICAL: Update the session to refresh JWT token with hasCompletedAssessment = true
        // This prevents the middleware redirect loop
        await update();

        // Increased delay to ensure:
        // 1. Session/JWT token is fully updated
        // 2. Database has committed the transaction
        // 3. All indexes are updated
        console.log('[ASSESSMENT] Waiting for data persistence...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Use window.location.href for hard reload to update JWT token
        const redirectPath = data.redirectTo || '/onboarding/results';
        console.log('[ASSESSMENT] Redirecting to:', redirectPath);
        window.location.href = redirectPath;
      } else {
        const error = await res.json();
        console.error('Error submitting FIG assessment:', error);
        alert('Error al guardar la evaluación. Por favor intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error submitting FIG assessment:', error);
      alert('Error al guardar la evaluación. Por favor intenta de nuevo.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Evaluación de Habilidades FIG
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Evalúa tu nivel actual en las habilidades fundamentales de calistenia
            para crear tu perfil hexagonal y plan de entrenamiento personalizado.
          </p>
        </div>

        {/* FIG Assessment Component */}
        <FigOnboardingAssessment
          onComplete={handleComplete}
          userId={session.user.id as string}
        />

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            Esta evaluación toma aproximadamente 5 minutos. Sé honesto con tus
            respuestas para obtener los mejores resultados.
          </p>
        </div>
      </div>
    </div>
  );
}
