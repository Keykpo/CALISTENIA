'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Crown, Zap, Target, Users, TrendingUp, Calendar } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  username: string;
  avatar?: string;
  totalXP: number;
  currentLevel: number;
  completedSkills: number;
  totalStrength: number;
  virtualCoins: number;
  streak: number;
  rank: number;
  isCurrentUser?: boolean;
}

interface BranchLeaderboard {
  branch: string;
  users: LeaderboardUser[];
}

interface LeaderboardsProps {
  currentUserId?: string;
}

const branchNames = {
  PUSH: 'Push',
  PULL: 'Pull',
  CORE: 'Core',
  BALANCE: 'Balance',
  LOWER_BODY: 'Lower Body',
  STATICS: 'Statics',
};

const branchIcons = {
  PUSH: '💪',
  PULL: '🔥',
  CORE: '⚡',
  BALANCE: '🎪',
  LOWER_BODY: '🦵',
  STATICS: '🗿',
};

export default function Leaderboards({ currentUserId }: LeaderboardsProps) {
  const [activeTab, setActiveTab] = useState('global');
  const [timeRange, setTimeRange] = useState('all-time');
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardUser[]>([]);
  const [branchLeaderboards, setBranchLeaderboards] = useState<BranchLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - En producción esto vendría de la API
  useEffect(() => {
    const mockGlobalData: LeaderboardUser[] = [
      {
        id: '1',
        username: 'CalisthenicsPro',
        avatar: '/avatars/user1.jpg',
        totalXP: 15420,
        currentLevel: 25,
        completedSkills: 87,
        totalStrength: 245,
        virtualCoins: 3200,
        streak: 45,
        rank: 1,
      },
      {
        id: '2',
        username: 'StrengthMaster',
        avatar: '/avatars/user2.jpg',
        totalXP: 14890,
        currentLevel: 24,
        completedSkills: 82,
        totalStrength: 238,
        virtualCoins: 2980,
        streak: 32,
        rank: 2,
      },
      {
        id: '3',
        username: 'FlexibilityKing',
        avatar: '/avatars/user3.jpg',
        totalXP: 13750,
        currentLevel: 22,
        completedSkills: 76,
        totalStrength: 220,
        virtualCoins: 2650,
        streak: 28,
        rank: 3,
      },
      {
        id: currentUserId || '4',
        username: 'You',
        totalXP: 8420,
        currentLevel: 15,
        completedSkills: 45,
        totalStrength: 156,
        virtualCoins: 1240,
        streak: 12,
        rank: 15,
        isCurrentUser: true,
      },
    ];

    const mockBranchData: BranchLeaderboard[] = [
      {
        branch: 'PUSH',
        users: mockGlobalData.slice(0, 10),
      },
      {
        branch: 'PULL',
        users: [...mockGlobalData].sort(() => Math.random() - 0.5).slice(0, 10),
      },
      {
        branch: 'CORE',
        users: [...mockGlobalData].sort(() => Math.random() - 0.5).slice(0, 10),
      },
    ];

    setGlobalLeaderboard(mockGlobalData);
    setBranchLeaderboards(mockBranchData);
    setLoading(false);
  }, [currentUserId]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank <= 10) return 'bg-gradient-to-r from-blue-400 to-blue-600';
    if (rank <= 50) return 'bg-gradient-to-r from-green-400 to-green-600';
    return 'bg-gradient-to-r from-gray-400 to-gray-600';
  };

  const LeaderboardCard = ({ user, showBranch = false }: { user: LeaderboardUser; showBranch?: boolean }) => (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      user.isCurrentUser ? 'ring-2 ring-blue-400 bg-blue-50' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white ${getRankBadgeColor(user.rank)}`}>
              {user.rank <= 3 ? getRankIcon(user.rank) : <span className="text-xs font-bold">#{user.rank}</span>}
            </div>
            
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div>
              <h4 className="font-semibold text-sm">{user.username}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Level {user.currentLevel}</span>
                <span>•</span>
                <span>{user.completedSkills} skills</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm font-semibold">
              <Zap className="h-4 w-4 text-blue-500" />
              <span>{user.totalXP.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>{user.totalStrength}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{user.streak} days</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Leaderboards
          </h2>
          <p className="text-gray-600">Compete with other calisthenics athletes</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={timeRange === 'all-time' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('all-time')}
          >
            All Time
          </Button>
          <Button
            variant={timeRange === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('monthly')}
          >
            <Calendar className="h-4 w-4 mr-1" />
            This Month
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Global
          </TabsTrigger>
          <TabsTrigger value="branches" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            By Branch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Global Ranking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {globalLeaderboard.map((user) => (
                <LeaderboardCard key={user.id} user={user} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches" className="space-y-6">
          {branchLeaderboards.map((branchData) => (
            <Card key={branchData.branch}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">{branchIcons[branchData.branch as keyof typeof branchIcons]}</span>
                  {branchNames[branchData.branch as keyof typeof branchNames]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {branchData.users.slice(0, 5).map((user) => (
                  <LeaderboardCard key={`${branchData.branch}-${user.id}`} user={user} />
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* User's Position Summary */}
      {currentUserId && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Your Position
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">#15</div>
                <div className="text-sm text-gray-600">Global Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">8,420</div>
                <div className="text-sm text-gray-600">Total XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">45</div>
                <div className="text-sm text-gray-600">Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">12</div>
                <div className="text-sm text-gray-600">Streak (days)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}