'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Medal,
  Crown,
  User,
  TrendingUp,
  Zap,
  Target,
  Award,
  Filter,
  Calendar,
  Flame,
  Timer
} from 'lucide-react';

// Modern FIG Level system alignment
type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

type SkillBranch = 'PUSH' | 'PULL' | 'CORE' | 'BALANCE' | 'STATICS';

type Timeframe = 'all-time' | 'monthly' | 'weekly';

interface BranchProgress {
  branch: SkillBranch;
  completedSkills: number;
  totalSkills: number;
  currentLevel: DifficultyLevel;
  strengthPoints: number;
}

interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  type: 'reps' | 'time' | 'weight';
  value: number;
  unit: string;
  achievedAt: string;
}

interface UserRanking {
  id: string;
  username: string;
  avatar?: string;

  // Core stats
  totalScore: number;
  totalXP: number;
  currentLevel: number;
  completedSkills: number;

  // Branch progress
  branchProgress: BranchProgress[];

  // Personal records (for PR tab)
  personalRecords?: PersonalRecord[];

  // Ranking
  rank: number;
  isCurrentUser?: boolean;
}

interface RankingProps {
  currentUserId?: string;
}

const BRANCH_NAMES: Record<SkillBranch, string> = {
  PUSH: 'Push',
  PULL: 'Pull',
  CORE: 'Core',
  BALANCE: 'Balance',
  STATICS: 'Statics',
};

const BRANCH_ICONS: Record<SkillBranch, string> = {
  PUSH: '💪',
  PULL: '🔥',
  CORE: '⚡',
  BALANCE: '🎪',
  STATICS: '🗿',
};

const BRANCH_COLORS: Record<SkillBranch, string> = {
  PUSH: 'bg-red-100 text-red-800 border-red-300',
  PULL: 'bg-blue-100 text-blue-800 border-blue-300',
  CORE: 'bg-green-100 text-green-800 border-green-300',
  BALANCE: 'bg-purple-100 text-purple-800 border-purple-300',
  STATICS: 'bg-gray-100 text-gray-800 border-gray-300',
};

const LEVEL_POINTS: Record<DifficultyLevel, number> = {
  BEGINNER: 100,
  INTERMEDIATE: 300,
  ADVANCED: 600,
  ELITE: 1000,
};

export default function Ranking({ currentUserId = 'current' }: RankingProps) {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<SkillBranch | 'ALL'>('ALL');
  const [timeframe, setTimeframe] = useState<Timeframe>('all-time');
  const [activeTab, setActiveTab] = useState<'rankings' | 'records'>('rankings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, [selectedBranch, timeframe]);

  const fetchRankings = async () => {
    setLoading(true);

    // TODO: Replace with actual API call
    // Example API endpoints:
    // GET /api/rankings?branch=${selectedBranch}&timeframe=${timeframe}
    // GET /api/rankings/personal-records?exerciseId=${exerciseId}

    /*
    try {
      const response = await fetch(
        `/api/rankings?branch=${selectedBranch}&timeframe=${timeframe}&userId=${currentUserId}`
      );
      const data = await response.json();
      setRankings(data.rankings);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    }
    */

    // Mock data for demonstration
    const mockRankings: UserRanking[] = generateMockRankings();
    setRankings(mockRankings);
    setLoading(false);
  };

  const generateMockRankings = (): UserRanking[] => {
    const users = [
      {
        id: '1',
        username: 'AthleteX',
        totalXP: 15420,
        currentLevel: 25,
        completedSkills: 87,
        branchProgress: [
          { branch: 'PUSH' as SkillBranch, completedSkills: 20, totalSkills: 25, currentLevel: 'ADVANCED' as DifficultyLevel, strengthPoints: 45 },
          { branch: 'PULL' as SkillBranch, completedSkills: 18, totalSkills: 25, currentLevel: 'ADVANCED' as DifficultyLevel, strengthPoints: 42 },
          { branch: 'CORE' as SkillBranch, completedSkills: 15, totalSkills: 20, currentLevel: 'INTERMEDIATE' as DifficultyLevel, strengthPoints: 30 },
          { branch: 'BALANCE' as SkillBranch, completedSkills: 22, totalSkills: 25, currentLevel: 'ELITE' as DifficultyLevel, strengthPoints: 55 },
          { branch: 'STATICS' as SkillBranch, completedSkills: 12, totalSkills: 25, currentLevel: 'ADVANCED' as DifficultyLevel, strengthPoints: 38 },
        ],
        personalRecords: [
          { exerciseId: '1', exerciseName: 'Handstand Hold', type: 'time', value: 120, unit: 'seconds', achievedAt: '2024-01-15' },
          { exerciseId: '2', exerciseName: 'Pull-ups', type: 'reps', value: 25, unit: 'reps', achievedAt: '2024-01-14' },
          { exerciseId: '3', exerciseName: 'Planche Hold', type: 'time', value: 45, unit: 'seconds', achievedAt: '2024-01-10' },
        ]
      },
      {
        id: '2',
        username: 'IronMike',
        totalXP: 14890,
        currentLevel: 24,
        completedSkills: 82,
        branchProgress: [
          { branch: 'PUSH' as SkillBranch, completedSkills: 22, totalSkills: 25, currentLevel: 'ELITE' as DifficultyLevel, strengthPoints: 60 },
          { branch: 'PULL' as SkillBranch, completedSkills: 16, totalSkills: 25, currentLevel: 'INTERMEDIATE' as DifficultyLevel, strengthPoints: 35 },
          { branch: 'CORE' as SkillBranch, completedSkills: 18, totalSkills: 20, currentLevel: 'ADVANCED' as DifficultyLevel, strengthPoints: 42 },
          { branch: 'BALANCE' as SkillBranch, completedSkills: 14, totalSkills: 25, currentLevel: 'INTERMEDIATE' as DifficultyLevel, strengthPoints: 28 },
          { branch: 'STATICS' as SkillBranch, completedSkills: 12, totalSkills: 25, currentLevel: 'INTERMEDIATE' as DifficultyLevel, strengthPoints: 30 },
        ],
        personalRecords: [
          { exerciseId: '1', exerciseName: 'Handstand Hold', type: 'time', value: 90, unit: 'seconds', achievedAt: '2024-01-12' },
          { exerciseId: '2', exerciseName: 'Pull-ups', type: 'reps', value: 22, unit: 'reps', achievedAt: '2024-01-11' },
          { exerciseId: '4', exerciseName: 'Dips', type: 'reps', value: 35, unit: 'reps', achievedAt: '2024-01-10' },
        ]
      },
      {
        id: '3',
        username: 'FlexQueen',
        totalXP: 13750,
        currentLevel: 22,
        completedSkills: 76,
        branchProgress: [
          { branch: 'PUSH' as SkillBranch, completedSkills: 15, totalSkills: 25, currentLevel: 'INTERMEDIATE' as DifficultyLevel, strengthPoints: 32 },
          { branch: 'PULL' as SkillBranch, completedSkills: 14, totalSkills: 25, currentLevel: 'INTERMEDIATE' as DifficultyLevel, strengthPoints: 30 },
          { branch: 'CORE' as SkillBranch, completedSkills: 20, totalSkills: 20, currentLevel: 'ELITE' as DifficultyLevel, strengthPoints: 65 },
          { branch: 'BALANCE' as SkillBranch, completedSkills: 18, totalSkills: 25, currentLevel: 'ADVANCED' as DifficultyLevel, strengthPoints: 45 },
          { branch: 'STATICS' as SkillBranch, completedSkills: 9, totalSkills: 25, currentLevel: 'BEGINNER' as DifficultyLevel, strengthPoints: 18 },
        ],
        personalRecords: [
          { exerciseId: '3', exerciseName: 'Planche Hold', type: 'time', value: 38, unit: 'seconds', achievedAt: '2024-01-13' },
          { exerciseId: '5', exerciseName: 'Front Lever', type: 'time', value: 25, unit: 'seconds', achievedAt: '2024-01-08' },
        ]
      },
      {
        id: currentUserId,
        username: 'You',
        totalXP: 8420,
        currentLevel: 15,
        completedSkills: 45,
        branchProgress: [
          { branch: 'PUSH' as SkillBranch, completedSkills: 10, totalSkills: 25, currentLevel: 'INTERMEDIATE' as DifficultyLevel, strengthPoints: 25 },
          { branch: 'PULL' as SkillBranch, completedSkills: 8, totalSkills: 25, currentLevel: 'BEGINNER' as DifficultyLevel, strengthPoints: 15 },
          { branch: 'CORE' as SkillBranch, completedSkills: 12, totalSkills: 20, currentLevel: 'INTERMEDIATE' as DifficultyLevel, strengthPoints: 28 },
          { branch: 'BALANCE' as SkillBranch, completedSkills: 7, totalSkills: 25, currentLevel: 'BEGINNER' as DifficultyLevel, strengthPoints: 12 },
          { branch: 'STATICS' as SkillBranch, completedSkills: 8, totalSkills: 25, currentLevel: 'BEGINNER' as DifficultyLevel, strengthPoints: 16 },
        ],
        personalRecords: [
          { exerciseId: '1', exerciseName: 'Handstand Hold', type: 'time', value: 30, unit: 'seconds', achievedAt: '2024-01-15' },
          { exerciseId: '2', exerciseName: 'Pull-ups', type: 'reps', value: 12, unit: 'reps', achievedAt: '2024-01-14' },
        ],
        isCurrentUser: true
      },
    ];

    // Calculate total scores based on branch progress
    const usersWithScores = users.map(user => {
      const totalScore = user.branchProgress.reduce((sum, branch) => {
        const levelPoints = LEVEL_POINTS[branch.currentLevel];
        const completionBonus = (branch.completedSkills / branch.totalSkills) * 500;
        return sum + branch.strengthPoints + levelPoints + completionBonus;
      }, 0);

      return {
        ...user,
        totalScore: Math.round(totalScore),
      };
    });

    // Sort by total score and assign ranks
    const sorted = usersWithScores.sort((a, b) => b.totalScore - a.totalScore);
    return sorted.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500 animate-pulse" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white animate-gradient';
    if (rank <= 10) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    if (rank <= 25) return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
    return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
  };

  const currentUserRank = rankings.find(r => r.isCurrentUser);

  const filteredRankings = selectedBranch === 'ALL'
    ? rankings
    : rankings.map(user => {
        const branchData = user.branchProgress.find(b => b.branch === selectedBranch);
        return {
          ...user,
          totalScore: branchData ? branchData.strengthPoints : 0,
        };
      }).sort((a, b) => b.totalScore - a.totalScore)
        .map((user, index) => ({ ...user, rank: index + 1 }));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Tabs: Rankings vs Personal Records */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rankings" className="gap-2">
            <Trophy className="h-4 w-4" />
            Rankings
          </TabsTrigger>
          <TabsTrigger value="records" className="gap-2">
            <Flame className="h-4 w-4" />
            Personal Records
          </TabsTrigger>
        </TabsList>

        {/* RANKINGS TAB */}
        <TabsContent value="rankings" className="space-y-6 animate-fadeIn">
          {/* Current User Position Card */}
          {currentUserRank && (
            <Card className="border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Your Current Position
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {timeframe === 'all-time' ? 'All Time' : timeframe === 'monthly' ? 'This Month' : 'This Week'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg">
                      {getRankIcon(currentUserRank.rank)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{currentUserRank.username}</h3>
                      <p className="text-gray-600">
                        Rank #{currentUserRank.rank} • {currentUserRank.totalScore.toLocaleString()} points
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getRankBadgeColor(currentUserRank.rank)}>
                      Rank #{currentUserRank.rank}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      Level {currentUserRank.currentLevel} • {currentUserRank.completedSkills} skills
                    </p>
                  </div>
                </div>

                {/* Branch Progress Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                  {currentUserRank.branchProgress.map(branch => (
                    <div key={branch.branch} className="text-center p-3 bg-white rounded-lg border-2 shadow-sm transition-transform hover:scale-105">
                      <div className="text-2xl mb-1">{BRANCH_ICONS[branch.branch]}</div>
                      <p className="text-xs font-semibold text-gray-700">{BRANCH_NAMES[branch.branch]}</p>
                      <Badge className={`mt-1 text-xs ${BRANCH_COLORS[branch.branch]}`}>
                        {branch.currentLevel}
                      </Badge>
                      <p className="text-sm font-bold text-blue-600 mt-1">
                        {branch.completedSkills}/{branch.totalSkills}
                      </p>
                      <Progress
                        value={(branch.completedSkills / branch.totalSkills) * 100}
                        className="h-1 mt-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeframe + Branch Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
                {/* Timeframe Selector */}
                <div className="flex gap-2">
                  <Button
                    variant={timeframe === 'all-time' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeframe('all-time')}
                  >
                    All Time
                  </Button>
                  <Button
                    variant={timeframe === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeframe('monthly')}
                    className="gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Monthly
                  </Button>
                  <Button
                    variant={timeframe === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeframe('weekly')}
                  >
                    Weekly
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Branch Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedBranch === 'ALL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBranch('ALL')}
                >
                  All Categories
                </Button>
                {(Object.keys(BRANCH_NAMES) as SkillBranch[]).map(branch => (
                  <Button
                    key={branch}
                    variant={selectedBranch === branch ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedBranch(branch)}
                    className="gap-2"
                  >
                    <span>{BRANCH_ICONS[branch]}</span>
                    {BRANCH_NAMES[branch]}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rankings Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {selectedBranch === 'ALL' ? 'Global Rankings' : `${BRANCH_NAMES[selectedBranch]} Rankings`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredRankings.map((user, index) => {
                  const branchData = selectedBranch !== 'ALL'
                    ? user.branchProgress.find(b => b.branch === selectedBranch)
                    : null;

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md animate-slideIn ${
                        user.isCurrentUser
                          ? 'bg-blue-50 border-blue-300 shadow-md'
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                          {getRankIcon(user.rank)}
                        </div>
                        <div>
                          <h3 className={`font-semibold text-lg ${user.isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>
                            {user.username}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Zap className="h-4 w-4 text-purple-500" />
                              <span>{user.totalXP.toLocaleString()} XP</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4 text-green-500" />
                              <span>{user.completedSkills} skills</span>
                            </div>
                            {branchData && (
                              <>
                                <span>•</span>
                                <Badge className={`text-xs ${BRANCH_COLORS[selectedBranch as SkillBranch]}`}>
                                  {branchData.currentLevel}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <p className="text-2xl font-bold text-gray-900">
                            {user.totalScore.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                        <Badge className={getRankBadgeColor(user.rank)}>
                          #{user.rank}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Scoring System Info */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                How Rankings Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">Points by Level:</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>ELITE Level:</span>
                      <span className="font-bold text-red-600">1,000 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ADVANCED Level:</span>
                      <span className="font-bold text-purple-600">600 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>INTERMEDIATE Level:</span>
                      <span className="font-bold text-blue-600">300 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>BEGINNER Level:</span>
                      <span className="font-bold text-green-600">100 pts</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">Additional Bonuses:</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div>✓ Strength points from completed skills</div>
                    <div>✓ Completion bonus (up to 500 pts per branch)</div>
                    <div>✓ Total XP accumulation</div>
                    <div className="mt-3 p-2 bg-purple-100 rounded text-xs">
                      💡 Focus on completing skills to climb the ranks faster!
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PERSONAL RECORDS TAB */}
        <TabsContent value="records" className="space-y-6 animate-fadeIn">
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-6 w-6 text-orange-600" />
                Personal Records Leaderboard
              </CardTitle>
              <CardDescription>
                Compare your best performances in specific exercises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Example: Handstand Hold Rankings */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    🤸 Handstand Hold <Badge variant="outline">Time</Badge>
                  </h4>
                  <div className="space-y-2">
                    {rankings
                      .filter(u => u.personalRecords?.some(pr => pr.exerciseName === 'Handstand Hold'))
                      .sort((a, b) => {
                        const aRecord = a.personalRecords?.find(pr => pr.exerciseName === 'Handstand Hold');
                        const bRecord = b.personalRecords?.find(pr => pr.exerciseName === 'Handstand Hold');
                        return (bRecord?.value || 0) - (aRecord?.value || 0);
                      })
                      .map((user, index) => {
                        const record = user.personalRecords?.find(pr => pr.exerciseName === 'Handstand Hold');
                        if (!record) return null;

                        return (
                          <div
                            key={user.id}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                              user.isCurrentUser
                                ? 'bg-blue-50 border-blue-300'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center font-bold text-sm">
                                #{index + 1}
                              </div>
                              <div>
                                <p className={`font-semibold ${user.isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>
                                  {user.username}
                                </p>
                                <p className="text-xs text-gray-500">
                                  <Timer className="h-3 w-3 inline mr-1" />
                                  {new Date(record.achievedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-orange-600">
                                {record.value}s
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Example: Pull-ups Rankings */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    🔥 Pull-ups <Badge variant="outline">Reps</Badge>
                  </h4>
                  <div className="space-y-2">
                    {rankings
                      .filter(u => u.personalRecords?.some(pr => pr.exerciseName === 'Pull-ups'))
                      .sort((a, b) => {
                        const aRecord = a.personalRecords?.find(pr => pr.exerciseName === 'Pull-ups');
                        const bRecord = b.personalRecords?.find(pr => pr.exerciseName === 'Pull-ups');
                        return (bRecord?.value || 0) - (aRecord?.value || 0);
                      })
                      .map((user, index) => {
                        const record = user.personalRecords?.find(pr => pr.exerciseName === 'Pull-ups');
                        if (!record) return null;

                        return (
                          <div
                            key={user.id}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                              user.isCurrentUser
                                ? 'bg-blue-50 border-blue-300'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center font-bold text-sm">
                                #{index + 1}
                              </div>
                              <div>
                                <p className={`font-semibold ${user.isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>
                                  {user.username}
                                </p>
                                <p className="text-xs text-gray-500">
                                  <Timer className="h-3 w-3 inline mr-1" />
                                  {new Date(record.achievedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-blue-600">
                                {record.value} reps
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Info Card */}
                <Card className="bg-orange-100 border-orange-300">
                  <CardContent className="p-4">
                    <p className="text-sm text-orange-900">
                      💡 <strong>Tip:</strong> Personal Records are updated automatically when you log new exercises.
                      Keep training to climb these leaderboards!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add keyframe animations via inline style */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}
