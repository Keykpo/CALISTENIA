'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StreakDisplay } from '@/components/streaks/StreakDisplay';
import { ActivityCalendar } from '@/components/calendar/ActivityCalendar';
import { ManualExerciseLogger } from '@/components/training/ManualExerciseLogger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Calendar, Dumbbell } from 'lucide-react';

export default function ActivityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Activity</h1>
            <p className="text-lg text-gray-600">
              Track your consistency and build powerful streaks
            </p>
          </div>

          <Tabs defaultValue="streak" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid bg-white shadow-sm">
              <TabsTrigger value="streak" className="gap-2">
                <Flame className="w-4 h-4" />
                <span>Streaks</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="log" className="gap-2">
                <Dumbbell className="w-4 h-4" />
                <span>Log Exercise</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="streak" className="space-y-6">
              <StreakDisplay userId={session.user.id as string} />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <ActivityCalendar userId={session.user.id as string} />
            </TabsContent>

            <TabsContent value="log" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <ManualExerciseLogger />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
