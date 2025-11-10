'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ProgressiveAchievementCard } from '@/components/ProgressiveAchievementCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trophy } from 'lucide-react';

interface AchievementData {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  type: string;
  iconUrl: string | null;
  currentValue: number;
  currentTier: number;
  currentTierData: any | null;
  nextTier: any | null;
  progressToNextTier: number;
  isComplete: boolean;
  tiers: any[];
  completedAt: {
    tier1: Date | null;
    tier2: Date | null;
    tier3: Date | null;
    tier4: Date | null;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  ROUTINE_COMPLETION: 'Routines',
  CONSISTENCY: 'Consistency',
  SKILL_MASTERY: 'Skills',
  BALANCE: 'Balance',
  STRENGTH: 'Strength',
  STATIC_HOLDS: 'Static Holds',
  CORE: 'Core',
  HEXAGON_GROWTH: 'Hexagon Growth',
  LEVEL_MILESTONE: 'Levels',
  OVERALL_PROGRESS: 'Overall',
};

export default function AchievementsPage() {
  const { data: session } = useSession();
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function fetchAchievements() {
      if (!session?.user) return;

      try {
        const response = await fetch('/api/achievements/progress');
        const data = await response.json();

        if (data.success) {
          setAchievements(data.achievements);
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAchievements();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(achievements.map(a => a.category)))];

  // Filter achievements by category
  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  // Calculate stats
  const totalAchievements = achievements.length;
  const completedAchievements = achievements.filter(a => a.isComplete).length;
  const totalTiersUnlocked = achievements.reduce((sum, a) => sum + a.currentTier, 0);
  const totalTiers = achievements.length * 4;

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Achievements</h1>
        </div>
        <p className="text-muted-foreground">
          Track your progress through progressive achievement tiers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Achievements Completed</div>
          <div className="text-2xl font-bold mt-1">
            {completedAchievements} <span className="text-base text-muted-foreground">/ {totalAchievements}</span>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Tiers Unlocked</div>
          <div className="text-2xl font-bold mt-1">
            {totalTiersUnlocked} <span className="text-base text-muted-foreground">/ {totalTiers}</span>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Completion Rate</div>
          <div className="text-2xl font-bold mt-1">
            {Math.round((totalTiersUnlocked / totalTiers) * 100)}%
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-2">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-sm">
              {category === 'all' ? 'All' : CATEGORY_LABELS[category] || category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No achievements found in this category
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAchievements.map((achievement) => (
                <ProgressiveAchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
