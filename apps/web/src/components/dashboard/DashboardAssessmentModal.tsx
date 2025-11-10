'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  Star,
  Flame,
  ArrowRight,
  Loader2
} from 'lucide-react';
import FigOnboardingAssessment, { type FigAssessmentResult } from '@/components/onboarding/FigOnboardingAssessment';
import UnifiedHexagon from '@/components/UnifiedHexagon';
import {
  migrateToUnifiedHexagon,
  calculateUnifiedOverallLevel,
  type UnifiedFitnessLevel,
  type UnifiedHexagonProfile,
} from '@/lib/unified-hexagon-system';

interface DashboardAssessmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onComplete: () => void;
}

const LEVEL_INFO: Record<UnifiedFitnessLevel, { title: string; color: string; gradient: string; icon: string }> = {
  BEGINNER: {
    title: '🌱 Beginner',
    color: 'text-green-700',
    gradient: 'from-green-500 to-emerald-600',
    icon: '🌱'
  },
  INTERMEDIATE: {
    title: '⚡ Intermediate',
    color: 'text-blue-700',
    gradient: 'from-blue-500 to-indigo-600',
    icon: '⚡'
  },
  ADVANCED: {
    title: '🔥 Advanced',
    color: 'text-orange-700',
    gradient: 'from-orange-500 to-red-600',
    icon: '🔥'
  },
  ELITE: {
    title: '👑 Elite',
    color: 'text-purple-700',
    gradient: 'from-purple-500 to-pink-600',
    icon: '👑'
  }
};

export default function DashboardAssessmentModal({
  open,
  onOpenChange,
  userId,
  onComplete,
}: DashboardAssessmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState<{
    hexagonProfile: UnifiedHexagonProfile;
    fitnessLevel: UnifiedFitnessLevel;
  } | null>(null);

  const handleAssessmentComplete = async (assessments: FigAssessmentResult[]) => {
    try {
      setIsSubmitting(true);

      console.log('[DASHBOARD_ASSESSMENT] Submitting assessments...', { assessments });

      const res = await fetch('/api/assessment/fig-initial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ assessments }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[DASHBOARD_ASSESSMENT] ✅ Success!', data);

        // Create unified profile from the response
        const hexagonProfile = migrateToUnifiedHexagon({
          balanceControl: data.hexagonProfile.balance,
          relativeStrength: data.hexagonProfile.strength,
          skillTechnique: data.hexagonProfile.staticHolds,
          bodyTension: data.hexagonProfile.core,
          muscularEndurance: data.hexagonProfile.endurance,
          jointMobility: data.hexagonProfile.mobility,
          // We'll use default XP values since they're already calculated
          balanceControlXP: 0,
          relativeStrengthXP: 0,
          skillTechniqueXP: 0,
          bodyTensionXP: 0,
          muscularEnduranceXP: 0,
          jointMobilityXP: 0,
        });

        const fitnessLevel = data.overallLevel as UnifiedFitnessLevel;

        setResultsData({
          hexagonProfile,
          fitnessLevel,
        });

        setShowResults(true);
        setIsSubmitting(false);

        // Wait a bit before triggering the dashboard refresh
        setTimeout(() => {
          onComplete();
        }, 500);
      } else {
        const error = await res.json();
        console.error('[DASHBOARD_ASSESSMENT] Error:', error);
        alert('Error al guardar la evaluación. Por favor intenta de nuevo.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('[DASHBOARD_ASSESSMENT] Error:', error);
      alert('Error al guardar la evaluación. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (showResults) {
      // Close and refresh
      setShowResults(false);
      setResultsData(null);
      onOpenChange(false);
      onComplete();
    } else {
      // Just close
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {!showResults ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </div>
              <DialogTitle className="text-2xl text-center">
                Completa tu Evaluación de Habilidades
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                Responde algunas preguntas sobre tus habilidades actuales para crear tu perfil hexagonal
                y plan de entrenamiento personalizado. Toma solo 5 minutos.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              {isSubmitting ? (
                <Card className="border-2 border-blue-200">
                  <CardContent className="pt-12 pb-12 text-center">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Procesando tus resultados...
                    </h3>
                    <p className="text-slate-600">
                      Creando tu perfil hexagonal personalizado
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <FigOnboardingAssessment
                  onComplete={handleAssessmentComplete}
                  userId={userId}
                />
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4 animate-bounce-slow">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Star className="w-10 h-10 text-white" fill="currentColor" />
                </div>
              </div>
              <DialogTitle className="text-3xl text-center font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ¡Evaluación Completada! 🎉
              </DialogTitle>
              <DialogDescription className="text-center text-lg">
                Tu perfil hexagonal ha sido creado exitosamente
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              {/* Level Badge */}
              {resultsData && (
                <div className="text-center">
                  <div className={`inline-block px-8 py-4 rounded-2xl bg-gradient-to-br ${LEVEL_INFO[resultsData.fitnessLevel].gradient} shadow-xl`}>
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-white" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-white/80">Tu Nivel Actual</p>
                        <p className="text-2xl font-black text-white">
                          {LEVEL_INFO[resultsData.fitnessLevel].title}
                        </p>
                      </div>
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Hexagon Visualization */}
              {resultsData && (
                <Card className="border-2 border-blue-200 shadow-lg">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold text-center text-slate-900 mb-4">
                      Tu Perfil Hexagonal
                    </h3>
                    <div className="flex justify-center">
                      <UnifiedHexagon
                        profile={resultsData.hexagonProfile}
                        showCard={false}
                        animated={true}
                        size={400}
                        showRanks={true}
                        showAxisDetails={false}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Next Steps */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                <CardContent className="pt-6 pb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">
                    ¿Qué sigue?
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-white/80 rounded-lg">
                      <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-900">Misiones Diarias</p>
                      <p className="text-xs text-slate-600">Personalizadas</p>
                    </div>
                    <div className="text-center p-3 bg-white/80 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-900">Entrenamientos</p>
                      <p className="text-xs text-slate-600">A tu nivel</p>
                    </div>
                    <div className="text-center p-3 bg-white/80 rounded-lg">
                      <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-900">Gana XP</p>
                      <p className="text-xs text-slate-600">Y sube de nivel</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Close Button */}
              <div className="text-center">
                <Button
                  onClick={handleClose}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-10 py-6 text-lg shadow-xl"
                >
                  Ver Mi Dashboard
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </Dialog>
  );
}
