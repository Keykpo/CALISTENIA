'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import SkillHexagon from '@/components/SkillHexagon';
import LevelBadge from './components/LevelBadge';
import RecommendationCard from './components/RecommendationCard';
import { calculateOverallLevel, getLevelProgress, type HexagonProfileWithXP } from '@/lib/hexagon-progression';

// Note: FitnessLevel is now imported from hexagon-progression (BEGINNER | INTERMEDIATE | ADVANCED | ELITE)

interface HexagonProfile {
  relativeStrength: number;
  muscularEndurance: number;
  balanceControl: number;
  jointMobility: number;
  bodyTension: number;
  skillTechnique: number;
}

interface Exercise {
  name: string;
  difficulty: string;
  category: string;
  description?: string;
}

interface UserData {
  fitnessLevel: FitnessLevel;
  levelProgress: number; // Progress percentage within current level
  hexagonProfile: HexagonProfile;
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

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        headers: {
          'x-user-id': session?.user?.id as string,
        },
      });

      if (res.ok) {
        const data = await res.json();

        // Calculate level from hexagon (SINGLE SOURCE OF TRUTH)
        const hexProfile = data.hexagonProfile || {
          relativeStrength: 5,
          muscularEndurance: 5,
          balanceControl: 5,
          jointMobility: 5,
          bodyTension: 5,
          skillTechnique: 5,
          relativeStrengthXP: 0,
          muscularEnduranceXP: 0,
          balanceControlXP: 0,
          jointMobilityXP: 0,
          bodyTensionXP: 0,
          skillTechniqueXP: 0,
        };

        const calculatedLevel = calculateOverallLevel(hexProfile as HexagonProfileWithXP);

        // Calculate average XP across all axes
        const averageXP = (
          (hexProfile.relativeStrengthXP || 0) +
          (hexProfile.muscularEnduranceXP || 0) +
          (hexProfile.balanceControlXP || 0) +
          (hexProfile.jointMobilityXP || 0) +
          (hexProfile.bodyTensionXP || 0) +
          (hexProfile.skillTechniqueXP || 0)
        ) / 6;

        const levelProgress = getLevelProgress(averageXP);

        // Set user data with hexagon profile
        setUserData({
          fitnessLevel: calculatedLevel as FitnessLevel,
          levelProgress,
          hexagonProfile: hexProfile,
          recommendations: getRecommendations(calculatedLevel as FitnessLevel),
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Set default data if fetch fails
      setUserData({
        fitnessLevel: 'BEGINNER',
        levelProgress: 0,
        hexagonProfile: {
          relativeStrength: 0,
          muscularEndurance: 0,
          balanceControl: 0,
          jointMobility: 0,
          bodyTension: 0,
          skillTechnique: 0,
        },
        recommendations: getRecommendations('BEGINNER'),
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = (level: FitnessLevel): Exercise[] => {
    const recommendations: Record<FitnessLevel, Exercise[]> = {
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
    // Redirect to routines page to see personalized workout plan
    router.push('/routines');
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your results...</p>
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
            This is Your Level!
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Based on your assessment, we've created a personalized profile to guide your calisthenics journey.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Hexagon */}
          <div>
            <SkillHexagon
              profile={userData.hexagonProfile}
              showCard={true}
              animated={true}
              title="Your Skill Hexagon"
              description="This hexagon shows your current skill levels across 6 key calisthenics dimensions."
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
                What's Next?
              </h3>
              <div className="space-y-3 text-slate-700">
                <p>
                  ✓ Your personalized workout plan is ready
                </p>
                <p>
                  ✓ Track your progress with daily missions
                </p>
                <p>
                  ✓ Unlock achievements as you improve
                </p>
                <p>
                  ✓ Level up your skills with guided progressions
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Recommended Exercises */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Recommended Exercises to Start
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
            Continue with My Personalized Plan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
