'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  Trophy,
  Lock,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Activity,
  Flame,
  Zap,
  RefreshCw,
  Clock,
  TrendingUp,
  Star,
  Calendar,
  AlertTriangle,
  Circle,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Award,
  Sparkles
} from 'lucide-react';
import {
  FIG_PROGRESSIONS,
  DifficultyLevel,
  SkillProgression
} from '@/lib/fig-level-progressions';
import AssessmentDialog from '@/components/AssessmentDialog';
import DurationSelectionDialog from '@/components/DurationSelectionDialog';
import TrainingSessionView from '@/components/TrainingSessionView';
import { toast } from 'react-hot-toast';

interface FigLevelSkillPathProps {
  userId: string;
  userSkillProgress: Record<string, DifficultyLevel>; // { "HANDSTAND": "INTERMEDIATE", "PLANCHE": "BEGINNER", ... }
  onProgressUpdate?: () => void;
}

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  BEGINNER: 'bg-green-100 text-green-800 border-green-300',
  INTERMEDIATE: 'bg-blue-100 text-blue-800 border-blue-300',
  ADVANCED: 'bg-purple-100 text-purple-800 border-purple-300',
  ELITE: 'bg-red-100 text-red-800 border-red-300',
};

const CATEGORY_ICONS: Record<string, any> = {
  BALANCE: Activity,
  STRENGTH: Dumbbell,
  SKILL_STATIC: Target,
  CORE: Flame,
};

const CATEGORY_NAMES: Record<string, string> = {
  BALANCE: 'Balance & Handstands',
  STRENGTH: 'Strength & Power',
  SKILL_STATIC: 'Static Holds',
  CORE: 'Core & Conditioning',
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  BALANCE: 'from-blue-500 to-indigo-600',
  STRENGTH: 'from-red-500 to-pink-600',
  SKILL_STATIC: 'from-purple-500 to-purple-700',
  CORE: 'from-orange-500 to-red-600',
};

// Estimated weeks per level (based on training age)
const ESTIMATED_WEEKS: Record<DifficultyLevel, number> = {
  BEGINNER: 4,
  INTERMEDIATE: 8,
  ADVANCED: 16,
  ELITE: 24,
};

export default function FigLevelSkillPath({
  userId,
  userSkillProgress,
  onProgressUpdate
}: FigLevelSkillPathProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('BALANCE');
  const [viewMode, setViewMode] = useState<'compact' | 'grid'>('grid');

  // Group progressions by category
  const progressionsByCategory = FIG_PROGRESSIONS.reduce((acc, prog) => {
    if (!acc[prog.category]) acc[prog.category] = [];
    acc[prog.category].push(prog);
    return acc;
  }, {} as Record<string, SkillProgression[]>);

  const categories = Object.keys(progressionsByCategory);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">FIG Level Skill Path</h2>
          <p className="text-slate-600 mt-1">
            Progress through official calisthenics progressions based on FIG standards
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === 'compact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('compact')}
          >
            Compact
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category] || Target;
            return (
              <TabsTrigger key={category} value={category} className="gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{CATEGORY_NAMES[category] || category}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
              {progressionsByCategory[category].map((progression) => {
                const branchLevel = userSkillProgress[progression.goal] || 'BEGINNER';
                const hasCompletedAssessment = progression.goal in userSkillProgress;
                return (
                  <ProgressionCard
                    key={progression.goal}
                    progression={progression}
                    userLevel={branchLevel}
                    userId={userId}
                    hasCompletedAssessment={hasCompletedAssessment}
                    onProgressUpdate={onProgressUpdate}
                    viewMode={viewMode}
                  />
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface ProgressionCardProps {
  progression: SkillProgression;
  userLevel: DifficultyLevel;
  userId: string;
  hasCompletedAssessment: boolean;
  onProgressUpdate?: () => void;
  viewMode: 'compact' | 'grid';
}

function ProgressionCard({
  progression,
  userLevel,
  userId,
  hasCompletedAssessment,
  onProgressUpdate,
  viewMode
}: ProgressionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showDurationSelect, setShowDurationSelect] = useState(false);
  const [showTrainingSession, setShowTrainingSession] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [goalLevel, setGoalLevel] = useState<DifficultyLevel | null>(null);

  // Check if user has done assessment for this branch
  React.useEffect(() => {
    setHasAssessment(hasCompletedAssessment);
  }, [hasCompletedAssessment]);

  const handleTrainNowClick = () => {
    // If no assessment data exists, show assessment
    if (!hasAssessment) {
      setShowAssessment(true);
    } else {
      // Has assessment, show duration selection
      setShowDurationSelect(true);
    }
  };

  const handleAssessmentComplete = async (level: string, score: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/skill-progress/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          skillBranch: progression.goal,
          currentLevel: level,
          assessmentScore: score,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Assessment complete! You're at ${level} level in ${progression.name}.`);
        setShowAssessment(false);
        setHasAssessment(true);

        // Refresh the parent component to update UI
        if (onProgressUpdate) {
          onProgressUpdate();
        }

        // Show duration selection
        setShowDurationSelect(true);

        // ✨ Automatically recalculate hexagon after assessment
        try {
          console.log('[FIG_ASSESSMENT] Auto-recalculating hexagon after assessment');
          const hexagonResponse = await fetch('/api/hexagon/recalculate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId,
            },
          });

          if (hexagonResponse.ok) {
            const hexagonData = await hexagonResponse.json();
            console.log('[FIG_ASSESSMENT] Hexagon recalculated:', hexagonData);
            toast.success('Your skill hexagon has been updated!', { duration: 3000 });
          } else {
            console.warn('[FIG_ASSESSMENT] Failed to auto-recalculate hexagon');
          }
        } catch (hexError) {
          console.error('[FIG_ASSESSMENT] Error auto-recalculating hexagon:', hexError);
          // Don't show error to user, hexagon can be recalculated manually
        }
      } else {
        toast.error('Failed to save assessment');
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTraining = async (duration: number) => {
    if (!userId || !userLevel) {
      console.error('[FIG_TRAINING] Missing userId or userLevel:', { userId, userLevel });
      toast.error('Missing user data. Please try refreshing the page.');
      return;
    }

    setIsLoading(true);
    try {
      const requestData = {
        userId,
        skillBranch: progression.goal,
        userLevel: userLevel,
        duration,
      };

      console.log('[FIG_TRAINING] Starting session with:', requestData);

      const response = await fetch('/api/training-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('[FIG_TRAINING] Response:', { status: response.status, data });

      if (data.success) {
        setCurrentSession(data.session);
        setShowDurationSelect(false);
        setShowTrainingSession(true);
        toast.success('Training session started!');
      } else {
        console.error('[FIG_TRAINING] Failed to start session:', data);
        toast.error(data.error || 'Failed to start training session');
      }
    } catch (error) {
      console.error('[FIG_TRAINING] Error starting training:', error);
      toast.error('Failed to start training session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionComplete = () => {
    setShowTrainingSession(false);
    setCurrentSession(null);

    // Refresh progress
    if (onProgressUpdate) {
      onProgressUpdate();
    }

    toast.success('🎉 Great job! Keep up the good work!');
  };

  const handleSetGoal = (level: DifficultyLevel) => {
    setGoalLevel(level);
    toast.success(`Goal set: Unlock ${level} level in ${progression.name}!`);
  };

  // Find user's current step
  const userStepIndex = progression.steps.findIndex(step => step.level === userLevel);
  const currentStep = userStepIndex >= 0 ? progression.steps[userStepIndex] : null;
  const nextStep = userStepIndex < progression.steps.length - 1 ? progression.steps[userStepIndex + 1] : null;
  const progressPercentage = currentStep
    ? ((userStepIndex + 1) / progression.steps.length) * 100
    : 0;

  // Calculate estimated weeks to next level
  const weeksToNext = nextStep ? ESTIMATED_WEEKS[nextStep.level] : 0;

  // Mock stats (these would come from API in real implementation)
  const stats = {
    timeInvested: 12,
    sessionsCompleted: 8,
    streak: 3,
  };

  // Get step status
  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'next' | 'locked' => {
    if (stepIndex < userStepIndex) return 'completed';
    if (stepIndex === userStepIndex) return 'current';
    if (stepIndex === userStepIndex + 1) return 'next';
    return 'locked';
  };

  // Get prerequisites for next level
  const getPrerequisites = () => {
    if (!nextStep) return [];

    const prereqs = [
      {
        id: 1,
        description: `Complete ${currentStep?.level} level exercises consistently`,
        completed: stats.sessionsCompleted >= 5,
      },
      {
        id: 2,
        description: `Hold for ${nextStep.level === 'INTERMEDIATE' ? '15s' : nextStep.level === 'ADVANCED' ? '10s' : '5s'}`,
        completed: false,
      },
      {
        id: 3,
        description: `Demonstrate proper form and control`,
        completed: false,
      },
    ];

    return prereqs;
  };

  const Icon = CATEGORY_ICONS[progression.category] || Target;

  // Compact mode
  if (viewMode === 'compact' && !expanded) {
    return (
      <>
        <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => setExpanded(true)}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${CATEGORY_GRADIENTS[progression.category]} flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 truncate">{progression.name}</h3>
                  <Badge className={`${DIFFICULTY_COLORS[userLevel]} text-xs`}>
                    {userLevel}
                  </Badge>
                </div>
                <Progress value={progressPercentage} className="h-1.5" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={(e) => { e.stopPropagation(); handleTrainNowClick(); }}>
                  <Zap className="w-4 h-4" />
                </Button>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AssessmentDialog
          open={showAssessment}
          onOpenChange={setShowAssessment}
          skillBranch={progression.goal}
          skillName={progression.name}
          onComplete={handleAssessmentComplete}
        />

        <DurationSelectionDialog
          open={showDurationSelect}
          onOpenChange={setShowDurationSelect}
          skillName={progression.name}
          userLevel={userLevel}
          onStartTraining={handleStartTraining}
        />

        {currentSession && (
          <TrainingSessionView
            open={showTrainingSession}
            onOpenChange={setShowTrainingSession}
            sessionId={currentSession.id}
            sessionData={currentSession}
            xpAwarded={currentSession.xpAwarded || 0}
            onComplete={handleSessionComplete}
          />
        )}
      </>
    );
  }

  // Grid/Expanded mode
  return (
    <>
      <Card className="hover:shadow-xl transition-all">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${CATEGORY_GRADIENTS[progression.category]}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{progression.name}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {CATEGORY_NAMES[progression.category]}
                </CardDescription>
              </div>
            </div>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Stats - NEW */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900">{stats.timeInvested}h</p>
              <p className="text-xs text-slate-600">Time</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Dumbbell className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900">{stats.sessionsCompleted}</p>
              <p className="text-xs text-slate-600">Sessions</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-900">~{weeksToNext}w</p>
              <p className="text-xs text-slate-600">To Next</p>
            </div>
          </div>

          {/* Streak - NEW Gamification */}
          {stats.streak > 0 && (
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <Flame className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-semibold text-orange-900">
                  {stats.streak} Day Streak! 🔥
                </p>
                <p className="text-xs text-orange-700">
                  Keep training to maintain your momentum
                </p>
              </div>
            </div>
          )}

          {/* Current Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Overall Progress</span>
              <span className="font-semibold">
                {userStepIndex + 1} / {progression.steps.length} levels
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2.5" />
          </div>

          {/* Current Step */}
          {currentStep && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Your Current Level</span>
              </div>
              <Badge className={`${DIFFICULTY_COLORS[currentStep.level]} border text-xs mb-2`}>
                {currentStep.level}
              </Badge>
              <p className="text-xs text-slate-700">{currentStep.description}</p>
            </div>
          )}

          {/* Next Milestone - NEW */}
          {nextStep && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Next Milestone
                </h4>
                <Badge className="bg-purple-600 text-white">
                  ~{weeksToNext} weeks
                </Badge>
              </div>

              <Badge className={`${DIFFICULTY_COLORS[nextStep.level]} text-xs mb-2`}>
                {nextStep.level}
              </Badge>
              <p className="text-sm text-purple-700 mb-3">
                {nextStep.description}
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleSetGoal(nextStep.level)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Set as Goal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setExpanded(!expanded)}
                  size="sm"
                  className="flex-1"
                >
                  View Roadmap
                </Button>
              </div>
            </div>
          )}

          {/* Prerequisites - NEW */}
          {nextStep && expanded && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 mb-2">
                    Prerequisites for {nextStep.level}
                  </h4>
                  <ul className="space-y-1.5 text-sm text-amber-800">
                    {getPrerequisites().map(prereq => (
                      <li key={prereq.id} className="flex items-center gap-2">
                        {prereq.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        )}
                        <span className={prereq.completed ? 'line-through text-amber-600' : ''}>
                          {prereq.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Roadmap - NEW */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full justify-between hover:bg-slate-100"
          >
            <span className="text-sm font-medium">
              {expanded ? 'Hide' : 'Show'} Full Progression Path
            </span>
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {expanded && (
            <div className="relative pl-8 space-y-4 pt-2">
              {/* Vertical timeline line */}
              <div className="absolute left-3 top-6 bottom-6 w-0.5 bg-gradient-to-b from-green-400 via-blue-400 via-purple-400 to-red-400 opacity-30" />

              {progression.steps.map((step, index) => {
                const status = getStepStatus(index);

                return (
                  <div key={step.level} className="relative">
                    {/* Dot indicator */}
                    <div className={`absolute -left-8 w-6 h-6 rounded-full border-4 flex items-center justify-center
                      ${status === 'completed' ? 'bg-green-500 border-green-200' : ''}
                      ${status === 'current' ? 'bg-blue-500 border-blue-200 animate-pulse' : ''}
                      ${status === 'next' ? 'bg-purple-300 border-purple-200' : ''}
                      ${status === 'locked' ? 'bg-gray-300 border-gray-200' : ''}
                    `}>
                      {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      {status === 'current' && <Target className="w-3.5 h-3.5 text-white" />}
                      {status === 'next' && <Star className="w-3.5 h-3.5 text-purple-700" />}
                      {status === 'locked' && <Lock className="w-3.5 h-3.5 text-gray-500" />}
                    </div>

                    {/* Step card */}
                    <div className={`p-3 rounded-lg border transition-all
                      ${status === 'current' ? 'bg-blue-50 border-blue-300 shadow-md' : ''}
                      ${status === 'completed' ? 'bg-green-50 border-green-200' : ''}
                      ${status === 'next' ? 'bg-purple-50 border-purple-200' : ''}
                      ${status === 'locked' ? 'bg-slate-50 border-slate-200 opacity-60' : ''}
                    `}>
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-xs ${DIFFICULTY_COLORS[step.level]}`}
                            >
                              {step.level}
                            </Badge>
                            {status === 'current' && (
                              <Badge variant="secondary" className="text-xs">
                                You are here
                              </Badge>
                            )}
                            {status === 'next' && (
                              <Badge className="bg-purple-600 text-white text-xs">
                                Next goal
                              </Badge>
                            )}
                            {status === 'completed' && (
                              <Badge className="bg-green-600 text-white text-xs">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 mb-2">{step.description}</p>

                          {/* Time estimate */}
                          {status !== 'completed' && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>~{ESTIMATED_WEEKS[step.level]} weeks to master</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons - NEW Re-assessment + Train */}
          <div className="mt-4 pt-4 border-t space-y-2">
            {hasAssessment ? (
              <>
                <div className="flex gap-2">
                  <Button
                    onClick={handleTrainNowClick}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {isLoading ? 'Loading...' : 'Train Now'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowAssessment(true)}
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                  <Badge className={`${DIFFICULTY_COLORS[userLevel]} text-xs py-0`}>
                    {userLevel}
                  </Badge>
                  <span>•</span>
                  <span>Feel stronger? Re-assess to unlock higher levels</span>
                </div>
              </>
            ) : (
              <>
                <Button
                  onClick={handleTrainNowClick}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  <Target className="w-4 h-4 mr-2" />
                  {isLoading ? 'Loading...' : 'Start Assessment'}
                </Button>
                <p className="text-xs text-center text-slate-500">
                  Complete a quick assessment to unlock personalized training
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AssessmentDialog
        open={showAssessment}
        onOpenChange={setShowAssessment}
        skillBranch={progression.goal}
        skillName={progression.name}
        onComplete={handleAssessmentComplete}
      />

      <DurationSelectionDialog
        open={showDurationSelect}
        onOpenChange={setShowDurationSelect}
        skillName={progression.name}
        userLevel={userLevel}
        onStartTraining={handleStartTraining}
      />

      {currentSession && (
        <TrainingSessionView
          open={showTrainingSession}
          onOpenChange={setShowTrainingSession}
          sessionId={currentSession.id}
          sessionData={currentSession}
          xpAwarded={currentSession.xpAwarded || 0}
          onComplete={handleSessionComplete}
        />
      )}
    </>
  );
}
