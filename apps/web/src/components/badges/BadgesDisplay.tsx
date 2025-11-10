'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Lock, Award, Star, TrendingUp } from 'lucide-react';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  type: string;
  rarity: string;
  xpReward: number;
  coinsReward: number;
  requirement: any;
}

interface UserBadge {
  id: string;
  badge: BadgeData;
  progress: number;
  isCompleted: boolean;
  earnedAt: Date;
}

const RARITY_COLORS = {
  NOVICE: 'bg-gray-500',
  INTERMEDIATE: 'bg-blue-500',
  ADVANCED: 'bg-purple-500',
  ELITE: 'bg-orange-500',
  LEGENDARY: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500',
};

const RARITY_LABELS = {
  NOVICE: 'Novice',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  ELITE: 'Elite',
  LEGENDARY: 'Legendary',
};

export default function BadgesDisplay() {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<BadgeData[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/badges');
      if (response.ok) {
        const data = await response.json();
        setUserBadges(data.userBadges || []);
        setAvailableBadges(data.availableBadges || []);
        setStats(data.stats || { total: 0, completed: 0, inProgress: 0 });
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBadgeCard = (badge: BadgeData, userBadge?: UserBadge) => {
    const isCompleted = userBadge?.isCompleted || false;
    const progress = userBadge?.progress || 0;
    const isLocked = !userBadge;

    return (
      <Card
        key={badge.id}
        className={`hover:shadow-lg transition-all ${
          isCompleted ? 'border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50' : ''
        } ${isLocked ? 'opacity-60' : ''}`}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isCompleted ? (
                  <Trophy className="h-6 w-6 text-yellow-600" />
                ) : isLocked ? (
                  <Lock className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <Award className="h-6 w-6 text-blue-600" />
                )}
                <CardTitle className="text-lg">{badge.name}</CardTitle>
              </div>
              <CardDescription className="line-clamp-2">{badge.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Rarity Badge */}
            <div className="flex items-center gap-2">
              <Badge className={`${RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS]} text-white`}>
                {RARITY_LABELS[badge.rarity as keyof typeof RARITY_LABELS]}
              </Badge>
              <Badge variant="outline">{badge.type.replace(/_/g, ' ')}</Badge>
            </div>

            {/* Progress Bar */}
            {!isLocked && !isCompleted && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Completed Badge */}
            {isCompleted && userBadge && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-yellow-800">
                  <Star className="h-4 w-4" />
                  <span className="font-semibold">
                    Completed on {new Date(userBadge.earnedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            {/* Rewards */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-yellow-600">
                <Trophy className="h-4 w-4" />
                <span className="font-semibold">+{badge.xpReward} XP</span>
              </div>
              <div className="flex items-center gap-1 text-amber-600">
                <span className="font-semibold">+{badge.coinsReward} Coins</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">Loading badges...</div>
        </CardContent>
      </Card>
    );
  }

  const earnedBadges = userBadges.filter(ub => ub.isCompleted);
  const inProgressBadges = userBadges.filter(ub => !ub.isCompleted);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-3xl font-bold">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Earned</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-3xl font-bold">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-3xl font-bold">{availableBadges.length}</p>
              <p className="text-sm text-muted-foreground">Locked</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Tabs */}
      <Tabs defaultValue="earned">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earned">
            Earned ({earnedBadges.length})
          </TabsTrigger>
          <TabsTrigger value="progress">
            In Progress ({inProgressBadges.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Available ({availableBadges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="earned" className="mt-6">
          {earnedBadges.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-semibold mb-2">No Badges Earned Yet</p>
                <p className="text-muted-foreground">
                  Complete challenges and reach milestones to earn badges!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {earnedBadges.map((ub) => renderBadgeCard(ub.badge, ub))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          {inProgressBadges.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No badges in progress</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressBadges.map((ub) => renderBadgeCard(ub.badge, ub))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          {availableBadges.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">All badges claimed!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableBadges.map((badge) => renderBadgeCard(badge))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
