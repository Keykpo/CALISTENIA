'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Zap,
  Award,
  Flame,
  Target,
  Calendar,
  Activity,
  RefreshCw,
  Dumbbell,
  Play,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Trophy
} from 'lucide-react';
import { useState, useEffect } from 'react';
import UnifiedHexagon from '../UnifiedHexagon';
import XPProgressCard from '../XPProgressCard';
import DashboardAssessmentModal from './DashboardAssessmentModal';
import Link from 'next/link';
import { migrateToUnifiedHexagon, calculateUnifiedOverallLevel, getUnifiedLevelProgress, type OldHexagonProfile, type UnifiedFitnessLevel } from '@/lib/unified-hexagon-system';
import BadgesDisplay from '../badges/BadgesDisplay';
import LeaderboardDisplay from '../leaderboard/LeaderboardDisplay';
import WeeklyChallengesDisplay from '../challenges/WeeklyChallengesDisplay';
import SkillProgressChart from '../progress/SkillProgressChart';

interface DashboardOverviewProps {
  userData: any;
  onRefresh: () => void;
  userId: string;
}

const LEVEL_INFO: Record<UnifiedFitnessLevel, { color: string; bgColor: string; gradient: string }> = {
  BEGINNER: {
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    gradient: 'from-green-500 to-emerald-600'
  },
  INTERMEDIATE: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    gradient: 'from-blue-500 to-indigo-600'
  },
  ADVANCED: {
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    gradient: 'from-orange-500 to-red-600'
  },
  ELITE: {
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    gradient: 'from-purple-500 to-pink-600'
  }
};

export default function DashboardOverview({ userData, onRefresh, userId }: DashboardOverviewProps) {
  const [autoRefreshCount, setAutoRefreshCount] = useState(0);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  const stats = userData?.stats || {
    totalXP: 0,
    level: 1,
    coins: 0,
    dailyStreak: 0,
    totalStrength: 0
  };

  const missions = userData?.missionsToday || [];
  const completedMissions = missions.filter((m: any) => m.completed).length;
  const totalMissions = missions.length;
  const missionProgress = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

  // Hexagon data
  const hexProfile = userData?.hexagon as OldHexagonProfile | null;
  const unifiedProfile = migrateToUnifiedHexagon(hexProfile);

  // Auto-refresh if hexagon data is missing or empty but user has completed assessment
  // This helps recover from any race conditions
  useEffect(() => {
    const hasCompletedAssessment = userData?.user?.hasCompletedAssessment;
    const hasHexagonData = hexProfile && (
      hexProfile.balanceControl > 0 ||
      hexProfile.relativeStrength > 0 ||
      hexProfile.skillTechnique > 0 ||
      hexProfile.bodyTension > 0 ||
      hexProfile.muscularEndurance > 0 ||
      hexProfile.jointMobility > 0
    );

    console.log('[DASHBOARD_OVERVIEW] Auto-refresh check:', {
      hasCompletedAssessment,
      hasHexagonData,
      autoRefreshCount,
      hexProfile,
    });

    // If user completed assessment but hexagon is empty/missing, auto-refresh up to 4 times
    if (hasCompletedAssessment && !hasHexagonData && autoRefreshCount < 4) {
      console.log(`[DASHBOARD_OVERVIEW] 🔄 Auto-refreshing dashboard (attempt ${autoRefreshCount + 1}/4)...`);

      const delay = autoRefreshCount === 0 ? 500 : 2000; // First try fast, then slower

      setTimeout(() => {
        console.log(`[DASHBOARD_OVERVIEW] Executing refresh attempt ${autoRefreshCount + 1}...`);
        setAutoRefreshCount(prev => prev + 1);
        onRefresh();
      }, delay);
    }
  }, [userData, hexProfile, autoRefreshCount, onRefresh]);

  // Use calculated fitness level from hexagon, fallback to DB value if hexagon is missing
  const calculatedLevel = calculateUnifiedOverallLevel(unifiedProfile);
  const dbFitnessLevel = userData?.user?.fitnessLevel as UnifiedFitnessLevel | null;
  const fitnessLevel = hexProfile ? calculatedLevel : (dbFitnessLevel || 'BEGINNER');
  const levelInfo = LEVEL_INFO[fitnessLevel];

  // Calculate average XP
  const averageXP = (
    (unifiedProfile.balanceXP || 0) +
    (unifiedProfile.strengthXP || 0) +
    (unifiedProfile.staticHoldsXP || 0) +
    (unifiedProfile.coreXP || 0) +
    (unifiedProfile.enduranceXP || 0) +
    (unifiedProfile.mobilityXP || 0)
  ) / 6;

  const levelProgress = getUnifiedLevelProgress(averageXP);

  console.log('[DASHBOARD_OVERVIEW] 🔍 Hexagon Data Debug:', {
    '1_hasHexProfile': !!hexProfile,
    '2_hexProfileRaw': hexProfile,
    '3_visualValues': hexProfile ? {
      balanceControl: hexProfile.balanceControl,
      relativeStrength: hexProfile.relativeStrength,
      skillTechnique: hexProfile.skillTechnique,
      bodyTension: hexProfile.bodyTension,
      muscularEndurance: hexProfile.muscularEndurance,
      jointMobility: hexProfile.jointMobility,
    } : null,
    '4_xpValues': hexProfile ? {
      balanceControlXP: hexProfile.balanceControlXP,
      relativeStrengthXP: hexProfile.relativeStrengthXP,
      skillTechniqueXP: hexProfile.skillTechniqueXP,
      bodyTensionXP: hexProfile.bodyTensionXP,
      muscularEnduranceXP: hexProfile.muscularEnduranceXP,
      jointMobilityXP: hexProfile.jointMobilityXP,
    } : null,
    '5_afterMigration': {
      balance: unifiedProfile.balance,
      strength: unifiedProfile.strength,
      staticHolds: unifiedProfile.staticHolds,
      core: unifiedProfile.core,
      endurance: unifiedProfile.endurance,
      mobility: unifiedProfile.mobility,
      balanceXP: unifiedProfile.balanceXP,
      strengthXP: unifiedProfile.strengthXP,
    },
    '6_levels': {
      calculatedFromHexagon: calculatedLevel,
      dbFitnessLevel: dbFitnessLevel,
      finalFitnessLevel: fitnessLevel,
      usingFallback: !hexProfile,
    },
    '7_progress': {
      averageXP,
      levelProgress,
    },
  });

  const handleAssessmentComplete = () => {
    console.log('[DASHBOARD_OVERVIEW] Assessment complete callback triggered, refreshing dashboard...');
    // Reset auto-refresh counter to allow new attempts
    setAutoRefreshCount(0);
    // Trigger immediate refresh
    onRefresh();
  };

  // Check if hexagon has any data (not just exists but actually has values)
  const hasHexagonData = hexProfile && (
    hexProfile.balanceControl > 0 ||
    hexProfile.relativeStrength > 0 ||
    hexProfile.skillTechnique > 0 ||
    hexProfile.bodyTension > 0 ||
    hexProfile.muscularEndurance > 0 ||
    hexProfile.jointMobility > 0
  );

  console.log('[DASHBOARD_OVERVIEW] CTA Visibility Check:', {
    hasHexagonData,
    hexProfile,
    hasCompletedAssessment: userData?.user?.hasCompletedAssessment,
    shouldShowCTA: !hasHexagonData,
  });

  // If no hexagon profile exists OR hexagon is empty, show attractive CTA
  // We check for actual data, not just dbFitnessLevel, because user might have
  // a default BEGINNER level from registration without completing assessment
  if (!hasHexagonData) {
    return (
      <>
        <DashboardAssessmentModal
          open={showAssessmentModal}
          onOpenChange={setShowAssessmentModal}
          userId={userId}
          onComplete={handleAssessmentComplete}
        />

        <div className="space-y-6">
          {/* Hero CTA Card */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden relative">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <CardContent className="pt-12 pb-12 relative z-10">
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full shadow-2xl mb-6 animate-bounce-slow">
                  <Target className="w-12 h-12 text-white" />
                </div>

                <h2 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-lg">
                  Discover Your Skill Level!
                </h2>

                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Complete a brief 5-minute assessment to create your personalized hexagon profile
                  and unlock a training plan adapted to your level.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <Sparkles className="w-10 h-10 text-yellow-300 mx-auto mb-2" />
                    <p className="font-semibold text-white mb-1">Personalized Profile</p>
                    <p className="text-sm text-blue-100">Unique skills hexagon</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <Target className="w-10 h-10 text-green-300 mx-auto mb-2" />
                    <p className="font-semibold text-white mb-1">Daily Missions</p>
                    <p className="text-sm text-blue-100">Adapted to your level</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <TrendingUp className="w-10 h-10 text-orange-300 mx-auto mb-2" />
                    <p className="font-semibold text-white mb-1">Clear Progression</p>
                    <p className="text-sm text-blue-100">Level up gradually</p>
                  </div>
                </div>

                <Button
                  onClick={() => setShowAssessmentModal(true)}
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-10 py-7 text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
                >
                  <Trophy className="w-6 h-6 mr-2" />
                  Start Assessment
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>

                <p className="text-sm text-blue-200 mt-4">
                  ⏱️ Just 5 minutes • 📊 6 skills • 🎯 100% personalized
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview of what they'll get */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Hexagon Profile
                </CardTitle>
                <CardDescription>
                  Visualize your 6 key skill areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-12 h-12 text-blue-600" />
                    </div>
                    <p className="text-sm text-slate-600">Your personalized hexagon</p>
                    <p className="text-xs text-slate-500 mt-1">will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Missions & Objectives
                </CardTitle>
                <CardDescription>
                  Daily challenges based on your results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Strength Mission</p>
                      <p className="text-xs text-slate-600">Adapted to your current level</p>
                    </div>
                    <Badge className="bg-purple-600">+300 XP</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Balance Mission</p>
                      <p className="text-xs text-slate-600">Improve your weaknesses</p>
                    </div>
                    <Badge className="bg-blue-600">+250 XP</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Core Mission</p>
                      <p className="text-xs text-slate-600">Strengthen your center</p>
                    </div>
                    <Badge className="bg-green-600">+200 XP</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
      </>
    );
  }

  return (
    <div className="space-y-6">

      {/* Hero Card - Level and Progress */}
      <Card className={`bg-gradient-to-br ${levelInfo.gradient} text-white border-0 shadow-xl overflow-hidden relative`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

        <CardContent className="pt-8 pb-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Level Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Star className="w-7 h-7 text-white" fill="currentColor" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Current Level</p>
                  <h2 className="text-3xl font-black">{fitnessLevel}</h2>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="opacity-90">Progress to next level</span>
                  <span className="font-bold">{Math.round(levelProgress)}%</span>
                </div>
                <Progress value={levelProgress} className="h-3 bg-white/20" />
                <p className="text-xs opacity-75">
                  {Math.round(averageXP).toLocaleString()} XP average across all skills
                </p>
              </div>

              <div className="flex gap-3">
                <Link href="/routines" className="flex-1">
                  <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30">
                    <Play className="w-4 h-4 mr-2" />
                    Start Workout
                  </Button>
                </Link>
                <Link href="/onboarding/assessment" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent hover:bg-white/10 border-white/30 text-white">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reassess Skills
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 opacity-80" />
                  <span className="text-xs opacity-75">Level</span>
                </div>
                <p className="text-2xl font-bold">{stats.level}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 opacity-80" />
                  <span className="text-xs opacity-75">Coins</span>
                </div>
                <p className="text-2xl font-bold">{stats.coins}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 opacity-80" />
                  <span className="text-xs opacity-75">Streak</span>
                </div>
                <p className="text-2xl font-bold">{stats.dailyStreak}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 opacity-80" />
                  <span className="text-xs opacity-75">Total XP</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalXP}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hexagon Profile - Full Size */}
        <Card className="shadow-lg border-2 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Your Hexagon Profile</CardTitle>
                <CardDescription className="text-base">
                  Each axis represents a fundamental physical ability
                </CardDescription>
              </div>
              <Activity className="h-6 w-6 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <UnifiedHexagon
                profile={unifiedProfile}
                showCard={false}
                animated={true}
                size={450}
                showRanks={true}
                showAxisDetails={false}
              />
            </div>
            <div className="text-center">
              <Link href="/onboarding/results">
                <Button variant="outline" className="px-6">
                  View Detailed Analysis & Insights
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Daily Missions */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Today's Missions</CardTitle>
                <CardDescription>
                  Complete to earn XP and maintain your streak
                </CardDescription>
              </div>
              <Target className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-slate-700">
                  Daily Progress
                </span>
                <Badge variant={missionProgress === 100 ? "default" : "secondary"}>
                  {completedMissions}/{totalMissions}
                </Badge>
              </div>
              <Progress value={missionProgress} className="h-3" />
              <p className="text-xs text-slate-600 mt-2">
                {missionProgress === 100
                  ? '🎉 All missions completed! Great work!'
                  : `${Math.round(missionProgress)}% complete - Keep going!`}
              </p>
            </div>

            {/* Mission List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {missions.length > 0 ? (
                missions.slice(0, 5).map((mission: any) => (
                  <div
                    key={mission.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                      mission.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      mission.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-slate-300'
                    }`}>
                      {mission.completed && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${mission.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {mission.description}
                      </p>
                      {mission.target && (
                        <p className="text-xs text-slate-600 mt-1">
                          Progress: {mission.progress || 0} / {mission.target}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-xs">
                        +{mission.rewardXP} XP
                      </Badge>
                      {mission.rewardCoins > 0 && (
                        <Badge variant="outline" className="text-xs text-amber-700">
                          +{mission.rewardCoins} 🪙
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Target className="w-16 h-16 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No missions available</p>
                  <p className="text-sm mt-1">Check back tomorrow for new challenges</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={onRefresh}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              )}
            </div>

            {missions.length > 5 && (
              <div className="text-center pt-2">
                <Link href="/dashboard?tab=missions">
                  <Button variant="link" size="sm">
                    View all missions ({missions.length})
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Access to Exercises */}
        <Card className="shadow-lg border-2 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-blue-600" />
                  Exercises Menu
                </CardTitle>
                <CardDescription>
                  Master skills, explore exercises, and build custom routines
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                <Target className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-semibold text-sm mb-1">Skill Paths</h4>
                <p className="text-xs text-muted-foreground">18 calisthenics progressions</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-semibold text-sm mb-1">Progressions</h4>
                <p className="text-xs text-muted-foreground">Track your journey</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                <Dumbbell className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-semibold text-sm mb-1">Exercise Gallery</h4>
                <p className="text-xs text-muted-foreground">500+ exercises with GIFs</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                <Star className="h-8 w-8 text-orange-600 mb-2" />
                <h4 className="font-semibold text-sm mb-1">Custom Routines</h4>
                <p className="text-xs text-muted-foreground">Build your workouts</p>
              </div>
            </div>
            <Link href="/dashboard/exercises" className="block">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Dumbbell className="w-4 h-4 mr-2" />
                Explore Exercises
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Skill Progression XP Cards */}
      {hexProfile && (
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-xl">Skill Progression</CardTitle>
            <CardDescription>
              Track your XP progress across all hexagon axes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <XPProgressCard
                axis="strength"
                currentXP={unifiedProfile.strengthXP}
                compact={true}
              />
              <XPProgressCard
                axis="endurance"
                currentXP={unifiedProfile.enduranceXP}
                compact={true}
              />
              <XPProgressCard
                axis="balance"
                currentXP={unifiedProfile.balanceXP}
                compact={true}
              />
              <XPProgressCard
                axis="mobility"
                currentXP={unifiedProfile.mobilityXP}
                compact={true}
              />
              <XPProgressCard
                axis="core"
                currentXP={unifiedProfile.coreXP}
                compact={true}
              />
              <XPProgressCard
                axis="staticHolds"
                currentXP={unifiedProfile.staticHoldsXP}
                compact={true}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions & Weekly Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>
              Jump into your training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/routines">
                <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-blue-50 hover:border-blue-300 transition-all">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Dumbbell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900">Start Workout</div>
                    <div className="text-xs text-slate-600">Access your personalized routine</div>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto text-slate-400" />
                </Button>
              </Link>

              <Link href="/dashboard?tab=missions">
                <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-purple-50 hover:border-purple-300 transition-all">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900">View All Missions</div>
                    <div className="text-xs text-slate-600">See daily and weekly challenges</div>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto text-slate-400" />
                </Button>
              </Link>

              <Link href="/dashboard?tab=achievements">
                <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-amber-50 hover:border-amber-300 transition-all">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900">Achievements</div>
                    <div className="text-xs text-slate-600">View your unlocked badges</div>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto text-slate-400" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Weekly Activity</CardTitle>
                <CardDescription>
                  Your training consistency this week
                </CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                // TODO: Replace with real workout data from weeklyProgress
                const hasActivity = userData?.weeklyProgress?.[date.toISOString().slice(0, 10)] > 0;
                const isToday = i === 6;

                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-full aspect-square rounded-lg transition-all ${
                        hasActivity
                          ? 'bg-green-500 shadow-lg'
                          : isToday
                          ? 'bg-blue-200 border-2 border-blue-400 border-dashed'
                          : 'bg-slate-200'
                      }`}
                      title={hasActivity ? 'Workout completed' : 'No activity'}
                    />
                    <span className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-slate-600'}`}>
                      {dayName}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Active</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-slate-200 rounded"></div>
                <span>Rest</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-200 border-2 border-blue-400 border-dashed rounded"></div>
                <span>Today</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Challenges */}
      <WeeklyChallengesDisplay />

      {/* Badges and Leaderboard */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BadgesDisplay />
        <LeaderboardDisplay />
      </div>

      {/* Progress Chart */}
      <SkillProgressChart />
    </div>
  );
}
