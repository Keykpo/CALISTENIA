'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WorkoutSessionTracker } from '@/components/training/WorkoutSessionTracker';
import { TrainingQuickStats } from '@/components/training/TrainingQuickStats';
import { RecentWorkouts } from '@/components/training/RecentWorkouts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Hammer } from 'lucide-react';
import CustomRoutineBuilder from '@/app/dashboard/exercises/components/CustomRoutineBuilder';

export default function DailyWorkoutPage() {
  const [activeTab, setActiveTab] = useState<'generator' | 'custom'>('generator');

  const handleRoutineSaved = () => {
    // Optionally refresh or show success message
    alert('Routine saved successfully! You can start it from the Custom Routines section.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Daily Workout</h1>
            <p className="text-lg text-gray-600">
              Generate a personalized workout or build your own routine
            </p>
          </div>

          {/* Quick Stats */}
          <TrainingQuickStats />

          {/* Workout Tabs */}
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'generator' | 'custom')} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="generator" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Workout Generator
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Hammer className="w-4 h-4" />
                Build Your Own
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-8">
              {/* Main Workout Tracker */}
              <div className="max-w-4xl mx-auto">
                <WorkoutSessionTracker />
              </div>

              {/* Recent Workouts */}
              <RecentWorkouts />
            </TabsContent>

            <TabsContent value="custom" className="space-y-8">
              <div className="max-w-4xl mx-auto">
                <CustomRoutineBuilder onSave={handleRoutineSaved} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
