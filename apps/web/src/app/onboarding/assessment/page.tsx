'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FigOnboardingAssessment from '@/components/onboarding/FigOnboardingAssessment';
import { Trophy } from 'lucide-react';
import {
  AssessmentStep1Data,
  AssessmentStep2Data,
  AssessmentStep3Data,
  AssessmentStep4Data,
  DifficultyLevel,
} from '@/lib/assessment-d-s-logic';

export default function AssessmentPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleComplete = async (result: {
    level: DifficultyLevel;
    step1: AssessmentStep1Data;
    step2: AssessmentStep2Data;
    step3: AssessmentStep3Data;
    step4?: AssessmentStep4Data;
  }) => {
    try {
      console.log('[ASSESSMENT_DEBUG] Starting assessment submission...');
      console.log('[ASSESSMENT_DEBUG] User ID:', session?.user?.id);
      console.log('[ASSESSMENT_DEBUG] Result data:', JSON.stringify(result, null, 2));

      const res = await fetch('/api/assessment/fig-initial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session?.user?.id as string,
        },
        body: JSON.stringify(result),
      });

      console.log('[ASSESSMENT_DEBUG] Response status:', res.status);
      console.log('[ASSESSMENT_DEBUG] Response ok:', res.ok);

      if (res.ok) {
        const data = await res.json();
        console.log('[ASSESSMENT] ✅ Success! Assessment saved:', {
          assignedLevel: data.assignedLevel,
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
        const errorText = await res.text();
        console.error('[ASSESSMENT_DEBUG] ❌ Request failed!');
        console.error('[ASSESSMENT_DEBUG] Status:', res.status);
        console.error('[ASSESSMENT_DEBUG] Status Text:', res.statusText);
        console.error('[ASSESSMENT_DEBUG] Error response:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { rawError: errorText };
        }

        console.error('[ASSESSMENT_DEBUG] Parsed error:', errorData);
        alert(`Error saving assessment: ${errorData.error || errorData.message || 'Unknown error'}. Please try again.`);
      }
    } catch (error) {
      console.error('[ASSESSMENT_DEBUG] ❌ Exception occurred!');
      console.error('[ASSESSMENT_DEBUG] Exception:', error);
      if (error instanceof Error) {
        console.error('[ASSESSMENT_DEBUG] Error message:', error.message);
        console.error('[ASSESSMENT_DEBUG] Error stack:', error.stack);
      }
      alert('Error saving assessment. Please try again.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
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
            FIG Skills Assessment
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Assess your current level in fundamental calisthenics skills
            to create your hexagonal profile and personalized training plan.
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
            This assessment takes approximately 5 minutes. Be honest with your
            answers to get the best results.
          </p>
        </div>
      </div>
    </div>
  );
}
