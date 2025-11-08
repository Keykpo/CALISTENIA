'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Target,
  Flame,
  Zap,
  TrendingUp,
  Calendar,
  Award,
  User as UserIcon,
  TreePine
} from 'lucide-react';

// Components
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import DailyMissionsPanel from '@/components/dashboard/DailyMissionsPanel';
import SkillTreeView from '@/components/dashboard/SkillTreeView';
import AchievementsView from '@/components/dashboard/AchievementsView';
import ProfileView from '@/components/dashboard/ProfileView';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Fetch user data and dashboard stats
  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session?.user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'x-user-id': session?.user?.id as string,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUserData(data);

        // Check if user needs to complete assessment
        if (!data.user?.fitnessLevel) {
          router.push('/onboarding/assessment');
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Hello, {session.user.name || 'Athlete'} 👋
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-lg font-bold text-blue-600">
                  <Zap className="w-5 h-5" />
                  {userData?.stats?.level || 1}
                </div>
                <div className="text-xs text-slate-600">Level</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-lg font-bold text-purple-600">
                  <Trophy className="w-5 h-5" />
                  {userData?.stats?.totalXP || 0}
                </div>
                <div className="text-xs text-slate-600">XP</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-lg font-bold text-amber-600">
                  <Award className="w-5 h-5" />
                  {userData?.stats?.coins || 0}
                </div>
                <div className="text-xs text-slate-600">Coins</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-lg font-bold text-orange-600">
                  <Flame className="w-5 h-5" />
                  {userData?.stats?.dailyStreak || 0}
                </div>
                <div className="text-xs text-slate-600">Streak</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-white shadow-sm">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="missions" className="gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Missions</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-2">
              <TreePine className="w-4 h-4" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview
              userData={userData}
              onRefresh={fetchDashboardData}
            />
          </TabsContent>

          {/* Missions Tab */}
          <TabsContent value="missions" className="space-y-6">
            <DailyMissionsPanel
              userId={session.user.id as string}
              onMissionComplete={fetchDashboardData}
            />
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <SkillTreeView userId={session.user.id as string} />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <AchievementsView userId={session.user.id as string} />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <ProfileView
              userId={session.user.id as string}
              userData={userData}
              onUpdate={fetchDashboardData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
