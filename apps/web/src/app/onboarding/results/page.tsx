'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import UnifiedHexagon from '@/components/UnifiedHexagon';
import LevelBadge from './components/LevelBadge';
import RecommendationCard from './components/RecommendationCard';
import {
  migrateToUnifiedHexagon,
  calculateUnifiedOverallLevel,
  getUnifiedLevelProgress,
  type UnifiedHexagonProfile,
  type UnifiedFitnessLevel,
} from '@/lib/unified-hexagon-system';

interface Exercise {
  name: string;
  difficulty: string;
  category: string;
  description?: string;
}

interface UserData {
  fitnessLevel: UnifiedFitnessLevel;
  levelProgress: number; // Progress percentage within current level
  hexagonProfile: UnifiedHexagonProfile;
  recommendations: Exercise[];
}

export default function OnboardingResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      fetchUserData();
    }
  }, [status, session, router]);

  // Auto-refresh when page gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user?.id) {
        fetchUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session?.user?.id]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`/api/user/profile?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'x-user-id': session?.user?.id as string,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });

      if (res.ok) {
        const data = await res.json();

        // Migrate to unified hexagon system
        const unifiedProfile = migrateToUnifiedHexagon(data.hexagonProfile);

        // Calculate level from unified hexagon (SINGLE SOURCE OF TRUTH)
        const calculatedLevel = calculateUnifiedOverallLevel(unifiedProfile);

        // Calculate average XP across all unified axes
        const averageXP = (
          (unifiedProfile.balanceXP || 0) +
          (unifiedProfile.strengthXP || 0) +
          (unifiedProfile.staticHoldsXP || 0) +
          (unifiedProfile.coreXP || 0) +
          (unifiedProfile.enduranceXP || 0) +
          (unifiedProfile.mobilityXP || 0)
        ) / 6;

        const levelProgress = getUnifiedLevelProgress(averageXP);

        // Set user data with unified hexagon profile
        setUserData({
          fitnessLevel: calculatedLevel,
          levelProgress,
          hexagonProfile: unifiedProfile,
          recommendations: getRecommendations(calculatedLevel),
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Set default data if fetch fails
      const defaultProfile = migrateToUnifiedHexagon(null);
      setUserData({
        fitnessLevel: 'BEGINNER',
        levelProgress: 0,
        hexagonProfile: defaultProfile,
        recommendations: getRecommendations('BEGINNER'),
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = (level: UnifiedFitnessLevel): Exercise[] => {
    const recommendations: Record<UnifiedFitnessLevel, Exercise[]> = {
      BEGINNER: [
        {
          name: 'Wall Push-ups',
          difficulty: 'BEGINNER',
          category: 'Push',
          description: 'Build foundational pushing strength with wall push-ups',
        },
        {
          name: 'Assisted Pull-ups',
          difficulty: 'BEGINNER',
          category: 'Pull',
          description: 'Develop pulling strength with resistance band assistance',
        },
        {
          name: 'Bodyweight Squats',
          difficulty: 'BEGINNER',
          category: 'Legs',
          description: 'Master basic squat form and leg strength',
        },
        {
          name: 'Plank Hold',
          difficulty: 'BEGINNER',
          category: 'Core',
          description: 'Build core stability with static holds',
        },
      ],
      INTERMEDIATE: [
        {
          name: 'Standard Push-ups',
          difficulty: 'INTERMEDIATE',
          category: 'Push',
          description: 'Progress to full push-ups with proper form',
        },
        {
          name: 'Negative Pull-ups',
          difficulty: 'INTERMEDIATE',
          category: 'Pull',
          description: 'Build strength through controlled lowering',
        },
        {
          name: 'Pistol Squat Progressions',
          difficulty: 'INTERMEDIATE',
          category: 'Legs',
          description: 'Work towards single-leg squats',
        },
        {
          name: 'L-Sit Progressions',
          difficulty: 'INTERMEDIATE',
          category: 'Core',
          description: 'Develop advanced core strength',
        },
        {
          name: 'Dips',
          difficulty: 'INTERMEDIATE',
          category: 'Push',
          description: 'Build tricep and chest strength',
        },
      ],
      ADVANCED: [
        {
          name: 'One-Arm Push-up Progressions',
          difficulty: 'ADVANCED',
          category: 'Push',
          description: 'Work towards unilateral pushing strength',
        },
        {
          name: 'Muscle-up Progressions',
          difficulty: 'ADVANCED',
          category: 'Pull',
          description: 'Combine pulling and pushing into one movement',
        },
        {
          name: 'Pistol Squats',
          difficulty: 'ADVANCED',
          category: 'Legs',
          description: 'Master single-leg strength and balance',
        },
        {
          name: 'Front Lever Progressions',
          difficulty: 'ADVANCED',
          category: 'Core',
          description: 'Develop horizontal body control',
        },
        {
          name: 'Handstand Push-ups',
          difficulty: 'ADVANCED',
          category: 'Push',
          description: 'Build vertical pushing strength',
        },
      ],
      ELITE: [
        {
          name: 'Planche Progressions',
          difficulty: 'ELITE',
          category: 'Push',
          description: 'Master advanced straight-arm pushing',
        },
        {
          name: 'One-Arm Pull-ups',
          difficulty: 'ELITE',
          category: 'Pull',
          description: 'Achieve elite unilateral pulling strength',
        },
        {
          name: 'Front Lever',
          difficulty: 'ELITE',
          category: 'Core',
          description: 'Hold perfect horizontal body position',
        },
        {
          name: 'Freestanding Handstand',
          difficulty: 'ELITE',
          category: 'Push',
          description: 'Master balance and control in handstand',
        },
        {
          name: 'Human Flag',
          difficulty: 'ELITE',
          category: 'Core',
          description: 'Achieve lateral body control',
        },
      ],
    };

    return recommendations[level] || recommendations.BEGINNER;
  };

  const handleContinue = () => {
    // Redirect to dashboard to see personalized plan
    router.push('/dashboard');
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando tus resultados...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || !userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            ¡Tu Perfil de Habilidades FIG!
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Basado en tu evaluación FIG, hemos creado tu perfil hexagonal personalizado
            que guiará tu progreso en calistenia.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Unified Hexagon */}
          <div>
            <UnifiedHexagon
              profile={userData.hexagonProfile}
              showCard={true}
              animated={true}
              size={450}
              showRanks={true}
              showAxisDetails={true}
            />
          </div>

          {/* Right Column - Level Badge and Summary */}
          <div className="space-y-6">
            <LevelBadge
              level={userData.fitnessLevel}
              percentage={userData.levelProgress}
            />

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                ¿Qué sigue ahora?
              </h3>
              <div className="space-y-3 text-slate-700">
                <p>
                  ✓ Tu plan de entrenamiento personalizado está listo
                </p>
                <p>
                  ✓ Sigue tu progreso con misiones diarias
                </p>
                <p>
                  ✓ Desbloquea logros mientras mejoras
                </p>
                <p>
                  ✓ Sube de nivel con progresiones guiadas del sistema FIG
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Recommended Exercises */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Ejercicios Recomendados para Empezar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userData.recommendations.slice(0, 5).map((exercise, index) => (
              <RecommendationCard
                key={index}
                exercise={exercise}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Continuar con Mi Plan Personalizado
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
