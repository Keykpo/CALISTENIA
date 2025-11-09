'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FigOnboardingAssessment, { FigAssessmentResult } from '@/components/onboarding/FigOnboardingAssessment';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Loader2 } from 'lucide-react';

export default function AssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleComplete = async (assessments: FigAssessmentResult[]) => {
    try {
      setSubmitting(true);

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
        // Use window.location.href for hard reload to update JWT token
        const redirectPath = data.redirectTo || '/dashboard';
        window.location.href = redirectPath;
      } else {
        const error = await res.json();
        console.error('Error submitting FIG assessment:', error);
        alert('Error al guardar la evaluación. Por favor intenta de nuevo.');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting FIG assessment:', error);
      alert('Error al guardar la evaluación. Por favor intenta de nuevo.');
      setSubmitting(false);
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

  if (submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Card className="max-w-md">
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Procesando tu evaluación...
            </h3>
            <p className="text-slate-600">
              Estamos analizando tus respuestas y creando tu perfil personalizado
            </p>
          </CardContent>
        </Card>
      </div>
    );
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
