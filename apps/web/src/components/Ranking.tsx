'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Filter
} from 'lucide-react';

// Modern FIG Level system alignment
type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

type SkillBranch = 'PUSH' | 'PULL' | 'CORE' | 'BALANCE' | 'STATICS';

interface BranchProgress {
  branch: SkillBranch;
  completedSkills: number;
  totalSkills: number;
  currentLevel: DifficultyLevel;
  strengthPoints: number;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, [selectedBranch]);

  const fetchRankings = async () => {
    setLoading(true);

    // TODO: Replace with actual API call
    // const response = await fetch(`/api/rankings?branch=${selectedBranch}`);
    // const data = await response.json();

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
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
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
      {/* Current User Position Card */}
      {currentUserRank && (
        <Card className="border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Your Current Position
            </CardTitle>
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
                <div key={branch.branch} className="text-center p-3 bg-white rounded-lg border-2 shadow-sm">
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

      {/* Branch Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter by Category
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
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
            {filteredRankings.map((user) => {
              const branchData = selectedBranch !== 'ALL'
                ? user.branchProgress.find(b => b.branch === selectedBranch)
                : null;

              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    user.isCurrentUser
                      ? 'bg-blue-50 border-blue-300 shadow-md'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
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
    </div>
  );
}
