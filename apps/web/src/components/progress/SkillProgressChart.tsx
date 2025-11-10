'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, Calendar, Award } from 'lucide-react';
import { FIG_PROGRESSIONS } from '@/lib/fig-level-progressions';

interface ProgressSnapshot {
  id: string;
  skillBranch: string;
  level: string;
  sessions: number;
  totalXP: number;
  date: string;
}

const LEVEL_COLORS = {
  BEGINNER: '#3b82f6',
  INTERMEDIATE: '#eab308',
  ADVANCED: '#f97316',
  ELITE: '#a855f7',
};

export default function SkillProgressChart() {
  const [selectedSkill, setSelectedSkill] = useState('HANDSTAND');
  const [snapshots, setSnapshots] = useState<ProgressSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressSnapshots();
  }, [selectedSkill]);

  const fetchProgressSnapshots = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/progress/snapshots?skillBranch=${selectedSkill}`);
      if (response.ok) {
        const data = await response.json();
        setSnapshots(data.snapshots || []);
      }
    } catch (error) {
      console.error('Error fetching progress snapshots:', error);
      // For now, show empty state
      setSnapshots([]);
    } finally {
      setLoading(false);
    }
  };

  const maxSessions = Math.max(...snapshots.map(s => s.sessions), 1);
  const maxXP = Math.max(...snapshots.map(s => s.totalXP), 1);

  const renderBarChart = () => {
    if (snapshots.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No progress data available yet</p>
          <p className="text-sm mt-2">Complete training sessions to see your progress!</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* XP Progress */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="h-4 w-4" />
            XP Progress Over Time
          </h3>
          <div className="space-y-2">
            {snapshots.map((snapshot, index) => {
              const barWidth = (snapshot.totalXP / maxXP) * 100;
              return (
                <div key={snapshot.id} className="group">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground w-24">
                      {new Date(snapshot.date).toLocaleDateString()}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ backgroundColor: LEVEL_COLORS[snapshot.level as keyof typeof LEVEL_COLORS] + '20' }}
                    >
                      {snapshot.level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: LEVEL_COLORS[snapshot.level as keyof typeof LEVEL_COLORS],
                        }}
                      >
                        {barWidth > 20 && (
                          <span className="text-white text-xs font-semibold">
                            {snapshot.totalXP} XP
                          </span>
                        )}
                      </div>
                    </div>
                    {barWidth <= 20 && (
                      <span className="text-xs font-semibold text-muted-foreground w-16">
                        {snapshot.totalXP} XP
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sessions Progress */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Training Sessions
          </h3>
          <div className="space-y-2">
            {snapshots.map((snapshot) => {
              const barWidth = (snapshot.sessions / maxSessions) * 100;
              return (
                <div key={snapshot.id + '-sessions'}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground w-24">
                      {new Date(snapshot.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${barWidth}%` }}
                      >
                        {barWidth > 20 && (
                          <span className="text-white text-xs font-semibold">
                            {snapshot.sessions} sessions
                          </span>
                        )}
                      </div>
                    </div>
                    {barWidth <= 20 && (
                      <span className="text-xs font-semibold text-muted-foreground w-24">
                        {snapshot.sessions} sessions
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {snapshots[snapshots.length - 1]?.sessions || 0}
            </p>
            <p className="text-xs text-muted-foreground">Total Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {snapshots[snapshots.length - 1]?.totalXP || 0}
            </p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {snapshots[snapshots.length - 1]?.level || 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">Current Level</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Progress Tracking
            </CardTitle>
            <CardDescription>Visualize your skill development over time</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skill Selector */}
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

        {/* Chart */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading progress data...</div>
        ) : (
          renderBarChart()
        )}
      </CardContent>
    </Card>
  );
}
