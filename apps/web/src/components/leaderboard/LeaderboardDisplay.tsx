'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, Medal, Crown, TrendingUp, Star } from 'lucide-react';
import { FIG_PROGRESSIONS } from '@/lib/fig-level-progressions';

interface LeaderboardEntry {
  id: string;
  user: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    currentLevel?: number;
  };
  score?: number;
  totalXP?: number;
  rank: number;
}

const RANK_ICONS = [
  { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-100' },
  { icon: Medal, color: 'text-amber-700', bg: 'bg-amber-100' },
];

export default function LeaderboardDisplay() {
  const [leaderboardType, setLeaderboardType] = useState<'global' | 'skill'>('global');
  const [selectedSkill, setSelectedSkill] = useState('HANDSTAND');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardType, selectedSkill]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: leaderboardType,
        ...(leaderboardType === 'skill' && { skillBranch: selectedSkill }),
      });

      const response = await fetch(`/api/leaderboard?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
        setCurrentUserEntry(data.currentUserEntry || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (user: LeaderboardEntry['user']) => {
    if (user.username) return user.username;
    if (user.firstName) return `${user.firstName} ${user.lastName || ''}`.trim();
    return 'Anonymous';
  };

  const getUserInitials = (user: LeaderboardEntry['user']) => {
    if (user.username) return user.username.substring(0, 2).toUpperCase();
    if (user.firstName) {
      const initials = `${user.firstName[0]}${user.lastName?.[0] || ''}`;
      return initials.toUpperCase();
    }
    return 'AN';
  };

  const renderEntry = (entry: LeaderboardEntry, index: number) => {
    const isTopThree = index < 3;
    const RankIcon = isTopThree ? RANK_ICONS[index].icon : TrendingUp;
    const iconColor = isTopThree ? RANK_ICONS[index].color : 'text-muted-foreground';
    const bgColor = isTopThree ? RANK_ICONS[index].bg : 'bg-muted';
    const isCurrentUser = currentUserEntry?.user.id === entry.user.id;

    return (
      <div
        key={entry.id}
        className={`flex items-center gap-4 p-4 rounded-lg ${
          isCurrentUser ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white'
        } hover:shadow-md transition-shadow`}
      >
        {/* Rank */}
        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${bgColor}`}>
          {isTopThree ? (
            <RankIcon className={`h-6 w-6 ${iconColor}`} />
          ) : (
            <span className="font-bold text-lg">{entry.rank}</span>
          )}
        </div>

        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarImage src={entry.user.avatar || undefined} />
          <AvatarFallback>{getUserInitials(entry.user)}</AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex-1">
          <p className="font-semibold flex items-center gap-2">
            {getUserDisplayName(entry.user)}
            {isCurrentUser && <Badge variant="default">You</Badge>}
          </p>
          {entry.user.currentLevel && (
            <p className="text-sm text-muted-foreground">Level {entry.user.currentLevel}</p>
          )}
        </div>

        {/* Score/XP */}
        <div className="text-right">
          {leaderboardType === 'global' ? (
            <>
              <p className="font-bold text-lg text-purple-600">{entry.totalXP?.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </>
          ) : (
            <>
              <p className="font-bold text-lg text-blue-600">{entry.score?.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">Loading leaderboard...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                Leaderboard
              </CardTitle>
              <CardDescription>Compete with others and climb the ranks</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Type Selector */}
      <Tabs value={leaderboardType} onValueChange={(val) => setLeaderboardType(val as 'global' | 'skill')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global">Global Rankings</TabsTrigger>
          <TabsTrigger value="skill">Skill Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-6 space-y-4">
          {/* Current User Position */}
          {currentUserEntry && (
            <Card className="border-2 border-blue-500">
              <CardHeader>
                <CardTitle className="text-lg">Your Position</CardTitle>
              </CardHeader>
              <CardContent>
                {renderEntry(currentUserEntry, currentUserEntry.rank - 1)}
              </CardContent>
            </Card>
          )}

          {/* Top Rankings */}
          <Card>
            <CardHeader>
              <CardTitle>Top 100 Athletes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {entries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No rankings available yet</p>
                </div>
              ) : (
                entries.map((entry, index) => renderEntry(entry, index))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skill" className="mt-6 space-y-4">
          {/* Skill Selector */}
          <Card>
            <CardContent className="pt-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Skill</label>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIG_PROGRESSIONS.map((prog) => (
                      <SelectItem key={prog.goal} value={prog.goal}>
                        {prog.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Current User Position */}
          {currentUserEntry && (
            <Card className="border-2 border-blue-500">
              <CardHeader>
                <CardTitle className="text-lg">Your Position</CardTitle>
              </CardHeader>
              <CardContent>
                {renderEntry(currentUserEntry, currentUserEntry.rank - 1)}
              </CardContent>
            </Card>
          )}

          {/* Top Rankings */}
          <Card>
            <CardHeader>
              <CardTitle>
                Top 100 for {FIG_PROGRESSIONS.find(p => p.goal === selectedSkill)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {entries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No rankings available yet for this skill</p>
                </div>
              ) : (
                entries.map((entry, index) => renderEntry(entry, index))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
