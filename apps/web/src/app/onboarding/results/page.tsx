'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  Loader2,
  Sparkles,
  Trophy,
  Target,
  TrendingUp,
  Zap,
  CheckCircle2,
  Star,
  Flame
} from 'lucide-react';
import UnifiedHexagon from '@/components/UnifiedHexagon';
import {
  migrateToUnifiedHexagon,
  calculateUnifiedOverallLevel,
  getUnifiedLevelProgress,
  type UnifiedHexagonProfile,
  type UnifiedFitnessLevel,
} from '@/lib/unified-hexagon-system';

interface UserData {
  fitnessLevel: UnifiedFitnessLevel;
  levelProgress: number;
  hexagonProfile: UnifiedHexagonProfile;
  totalXP: number;
}

const LEVEL_DESCRIPTIONS: Record<UnifiedFitnessLevel, { title: string; description: string; color: string; bgColor: string }> = {
  BEGINNER: {
    title: '🌱 Beginner',
    description: "You're starting your calisthenics journey. Every great athlete started here!",
    color: 'text-green-700',
    bgColor: 'bg-green-100 border-green-300'
  },
  INTERMEDIATE: {
    title: '⚡ Intermediate',
    description: "You've built a solid foundation. Time to push your limits.",
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 border-blue-300'
  },
  ADVANCED: {
    title: '🔥 Advanced',
    description: "Your mastery is impressive. You're among the best.",
    color: 'text-orange-700',
    bgColor: 'bg-orange-100 border-orange-300'
  },
  ELITE: {
    title: '👑 Elite',
    description: "You've reached the highest level. You're a calisthenics master.",
    color: 'text-purple-700',
    bgColor: 'bg-purple-100 border-purple-300'
  }
};

const AXIS_NAMES = {
  balance: 'Balance & Control',
  strength: 'Relative Strength',
  staticHolds: 'Static Holds',
  core: 'Core & Tension',
  endurance: 'Muscular Endurance',
  mobility: 'Joint Mobility'
};

const AXIS_ICONS = {
  balance: '🤸',
  strength: '💪',
  staticHolds: '🧘',
  core: '🔥',
  endurance: '⚡',
  mobility: '🌀'
};

export default function OnboardingResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.id) {
      fetchUserData();
      // Show confetti animation
      setTimeout(() => setShowConfetti(true), 500);
    }
  }, [status, session, router]);

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

        console.log('[ONBOARDING_RESULTS] Fetched user profile data:', {
          hasHexagonProfile: !!data.hexagonProfile,
          hexagonProfile: data.hexagonProfile
        });

        const unifiedProfile = migrateToUnifiedHexagon(data.hexagonProfile);

        console.log('[ONBOARDING_RESULTS] Unified hexagon profile after migration:', unifiedProfile);

        const calculatedLevel = calculateUnifiedOverallLevel(unifiedProfile);

        const averageXP = (
          (unifiedProfile.balanceXP || 0) +
          (unifiedProfile.strengthXP || 0) +
          (unifiedProfile.staticHoldsXP || 0) +
          (unifiedProfile.coreXP || 0) +
          (unifiedProfile.enduranceXP || 0) +
          (unifiedProfile.mobilityXP || 0)
        ) / 6;

        const levelProgress = getUnifiedLevelProgress(averageXP);

        setUserData({
          fitnessLevel: calculatedLevel,
          levelProgress,
          hexagonProfile: unifiedProfile,
          totalXP: Math.round(averageXP),
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      const defaultProfile = migrateToUnifiedHexagon(null);
      setUserData({
        fitnessLevel: 'BEGINNER',
        levelProgress: 0,
        hexagonProfile: defaultProfile,
        totalXP: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-6" />
          <p className="text-xl text-white font-medium">Analyzing your results...</p>
          <p className="text-sm text-blue-200 mt-2">Creating your personalized profile</p>
        </div>
      </div>
    );
  }

  if (!session?.user || !userData) {
    return null;
  }

  const levelInfo = LEVEL_DESCRIPTIONS[userData.fitnessLevel];
  const axisEntries = Object.entries(AXIS_NAMES) as [keyof typeof AXIS_NAMES, string][];

  // Get strongest and weakest axis
  const axisValues = axisEntries.map(([key]) => ({
    name: key,
    displayName: AXIS_NAMES[key],
    level: userData.hexagonProfile[`${key}Level` as keyof UnifiedHexagonProfile] as UnifiedFitnessLevel,
    xp: userData.hexagonProfile[`${key}XP` as keyof UnifiedHexagonProfile] as number,
    icon: AXIS_ICONS[key]
  }));

  const sortedByXP = [...axisValues].sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const strongestAxis = sortedByXP[0];
  const weakestAxis = sortedByXP[sortedByXP.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-2xl mb-6 animate-bounce-slow">
            <Trophy className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
            Assessment Complete!
          </h1>

          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Your FIG skills profile has been created. Discover your strengths and areas for improvement.
          </p>

          {/* Level Badge */}
          <div className={`inline-block px-8 py-4 rounded-2xl border-2 ${levelInfo.bgColor} backdrop-blur-sm shadow-xl`}>
            <div className="flex items-center gap-3">
              <Sparkles className={`w-6 h-6 ${levelInfo.color}`} />
              <div className="text-left">
                <p className="text-sm font-medium text-slate-600">Your Current Level</p>
                <p className={`text-2xl font-black ${levelInfo.color}`}>{levelInfo.title}</p>
              </div>
              <Sparkles className={`w-6 h-6 ${levelInfo.color}`} />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Hexagon Visualization */}
          <div className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm border-2 border-blue-200 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-slate-900">
                  Your Hexagon Profile
                </CardTitle>
                <p className="text-center text-slate-600 text-sm">
                  Each axis represents a fundamental physical ability
                </p>
              </CardHeader>
              <CardContent>
                <UnifiedHexagon
                  profile={userData.hexagonProfile}
                  showCard={false}
                  animated={true}
                  size={450}
                  showRanks={true}
                  showAxisDetails={false}
                />
              </CardContent>
            </Card>

            {/* XP and Progress */}
            <Card className="bg-white/95 backdrop-blur-sm border-2 border-purple-200 shadow-2xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-slate-900">Total Experience</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {userData.totalXP.toLocaleString()} XP
                  </span>
                </div>

                <Progress value={userData.levelProgress} className="h-3 mb-2" />

                <p className="text-sm text-slate-600 text-center">
                  {userData.levelProgress}% progress in your current level
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats and Details */}
          <div className="space-y-6">
            {/* Level Description */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-2xl">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-black text-slate-900 mb-3">
                    {levelInfo.title}
                  </h3>
                  <p className="text-lg text-slate-700">
                    {levelInfo.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/80 rounded-xl p-4 text-center border border-blue-200">
                    <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">6</p>
                    <p className="text-xs text-slate-600">Areas Assessed</p>
                  </div>

                  <div className="bg-white/80 rounded-xl p-4 text-center border border-purple-200">
                    <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{userData.fitnessLevel}</p>
                    <p className="text-xs text-slate-600">Overall Level</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths and Weaknesses */}
            <Card className="bg-white/95 backdrop-blur-sm border-2 border-green-200 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Your Main Strength
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-300">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{strongestAxis.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-green-900">{strongestAxis.displayName}</p>
                      <p className="text-sm text-green-700">Level {strongestAxis.level}</p>
                    </div>
                    <Badge className="bg-green-600 text-white">
                      {Math.round(strongestAxis.xp).toLocaleString()} XP
                    </Badge>
                  </div>
                  <p className="text-xs text-green-800">
                    Excellent work! This is your most developed area.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-2 border-amber-200 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-500" />
                  Area of Opportunity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-300">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{weakestAxis.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-amber-900">{weakestAxis.displayName}</p>
                      <p className="text-sm text-amber-700">Level {weakestAxis.level}</p>
                    </div>
                    <Badge className="bg-amber-600 text-white">
                      {Math.round(weakestAxis.xp).toLocaleString()} XP
                    </Badge>
                  </div>
                  <p className="text-xs text-amber-800">
                    Focus on this area for more balanced development.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* All Axes Summary */}
            <Card className="bg-white/95 backdrop-blur-sm border-2 border-slate-200 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Summary by Axis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {axisValues.map((axis) => (
                  <div key={axis.name} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-2xl">{axis.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{axis.displayName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress
                          value={getUnifiedLevelProgress(axis.xp)}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
                          {axis.level}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
                      {Math.round(axis.xp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps Section */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-700 border-0 shadow-2xl mb-8">
          <CardContent className="pt-8 pb-8">
            <div className="text-center text-white mb-6">
              <h2 className="text-3xl font-black mb-3">What's Next?</h2>
              <p className="text-lg text-blue-100">
                Your personalized training plan is ready
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <CheckCircle2 className="w-10 h-10 text-green-300 mx-auto mb-3" />
                <p className="font-semibold text-white mb-1">Personalized Plan</p>
                <p className="text-sm text-blue-100">Exercises adapted to your level</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <Target className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
                <p className="font-semibold text-white mb-1">Daily Missions</p>
                <p className="text-sm text-blue-100">Clear objectives every day</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <Trophy className="w-10 h-10 text-orange-300 mx-auto mb-3" />
                <p className="font-semibold text-white mb-1">Level Up</p>
                <p className="text-sm text-blue-100">Earn XP and unlock achievements</p>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={handleContinue}
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Go to My Dashboard
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer tip */}
        <div className="text-center text-blue-200 text-sm">
          <p>💡 Tip: You can reassess your skills anytime from your profile</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
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
    </div>
  );
}
