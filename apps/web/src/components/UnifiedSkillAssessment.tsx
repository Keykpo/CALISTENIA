'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Activity,
  Loader2,
} from 'lucide-react';
import UnifiedHexagon from './UnifiedHexagon';
import {
  UnifiedHexagonProfile,
  calculateUnifiedOverallLevel,
  getUnifiedLevelBadgeColor,
  UNIFIED_AXIS_METADATA,
  getAllUnifiedAxes,
  getUnifiedLevelProgress,
} from '@/lib/unified-hexagon-system';

interface UnifiedSkillAssessmentProps {
  userId: string;
  hexagonProfile: UnifiedHexagonProfile | null;
  onUpdate?: () => void;
}

export default function UnifiedSkillAssessment({
  userId,
  hexagonProfile,
  onUpdate,
}: UnifiedSkillAssessmentProps) {
  const router = useRouter();
  const [isRecalculating, setIsRecalculating] = useState(false);

  console.log('[UNIFIED_SKILL_ASSESSMENT] Props received:', {
    userId,
    hasHexagonProfile: !!hexagonProfile,
    hexagonProfileKeys: hexagonProfile ? Object.keys(hexagonProfile) : null,
    hexagonProfileSample: hexagonProfile ? {
      balance: hexagonProfile.balance,
      strength: hexagonProfile.strength,
      balanceXP: hexagonProfile.balanceXP,
      strengthXP: hexagonProfile.strengthXP,
    } : null,
  });

  const handleRecalculate = async () => {
    try {
      setIsRecalculating(true);

      // Call API to recalculate hexagon from FIG assessments
      const res = await fetch('/api/hexagon/recalculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
      });

      if (res.ok) {
        // Refresh data
        if (onUpdate) {
          onUpdate();
        }
      } else {
        console.error('Failed to recalculate hexagon');
      }
    } catch (error) {
      console.error('Error recalculating hexagon:', error);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleRetakeAssessments = () => {
    // Navigate to FIG Skill Path where assessments can be taken
    router.push('/dashboard?tab=skills');
  };

  // Calculate overall level and stats
  const overallLevel = hexagonProfile
    ? calculateUnifiedOverallLevel(hexagonProfile)
    : 'BEGINNER';
  const levelBadgeColor = getUnifiedLevelBadgeColor(overallLevel);

  const axes = getAllUnifiedAxes();
  const axisBreakdown = axes.map(axis => {
    const metadata = UNIFIED_AXIS_METADATA[axis];
    const value = hexagonProfile?.[axis] || 0;
    const xp = hexagonProfile?.[`${axis}XP`] || 0;
    const level = hexagonProfile?.[`${axis}Level`] || 'BEGINNER';
    const progress = getUnifiedLevelProgress(xp);

    return {
      axis,
      displayName: metadata.displayName,
      shortName: metadata.shortName,
      icon: metadata.icon,
      color: metadata.color,
      value,
      level,
      progress,
    };
  });

  // Calculate average score
  const averageScore = hexagonProfile
    ? axes.reduce((sum, axis) => sum + (hexagonProfile[axis] || 0), 0) / 6
    : 0;

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="w-6 h-6 text-indigo-600" />
              Skill Assessment
            </CardTitle>
            <CardDescription className="mt-1">
              Your calisthenics skill profile and level
            </CardDescription>
          </div>
          <Badge variant="outline" className={`text-base px-4 py-2 ${levelBadgeColor}`}>
            {overallLevel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Hexagon Visualization */}
        {hexagonProfile ? (
          <UnifiedHexagon
            profile={hexagonProfile}
            showCard={false}
            animated={true}
            size={400}
            showRanks={true}
            showAxisDetails={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Activity className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No skill profile available</p>
            <p className="text-xs mt-1">Complete the assessment to generate your hexagon</p>
          </div>
        )}

        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-1">Average Score</p>
            <p className="text-2xl font-bold text-indigo-600">
              {averageScore.toFixed(1)}<span className="text-sm text-slate-500">/10</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-1">Overall Level</p>
            <Badge variant="outline" className={`text-lg px-3 py-1 ${levelBadgeColor}`}>
              {overallLevel}
            </Badge>
          </div>
        </div>

        {/* Axis Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-slate-600" />
            <h4 className="text-sm font-semibold text-slate-700">Detailed Breakdown</h4>
          </div>
          {axisBreakdown.map((item) => (
            <div key={item.axis} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <span className="text-base">{item.icon}</span>
                  {item.shortName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    {item.value.toFixed(1)}/10
                  </span>
                  <Badge
                    variant="outline"
                    className={getUnifiedLevelBadgeColor(item.level as any)}
                  >
                    {item.level}
                  </Badge>
                </div>
              </div>
              <Progress value={item.progress} className="h-2" />
              <p className="text-xs text-slate-500">
                {item.progress}% through {item.level} level
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <Button
            onClick={handleRecalculate}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={isRecalculating}
          >
            {isRecalculating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Recalculating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Recalculate from FIG Assessments
              </>
            )}
          </Button>

          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-900">
              <p className="font-semibold mb-1">Before retaking assessments:</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                <li>Your hexagon will be recalculated</li>
                <li>Training recommendations will update</li>
                <li>Progress history is preserved</li>
              </ul>
            </div>
          </div>

          <Button
            onClick={handleRetakeAssessments}
            className="w-full"
            variant="outline"
          >
            <Target className="w-4 h-4 mr-2" />
            Retake FIG Skill Assessments
          </Button>

          <p className="text-xs text-slate-600 text-center leading-relaxed">
            {averageScore === 0 ? (
              <>
                <strong>No FIG assessments found.</strong> Complete skill assessments in the FIG Level Skill Path to build your hexagon profile.
              </>
            ) : (
              <>
                Retake assessments if your fitness level has significantly changed or if you want to update your skill profile.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
