'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  ChevronLeft,
  Trophy,
  CheckCircle2,
  Activity,
  Dumbbell,
  Target as TargetIcon,
  Flame,
} from 'lucide-react';
import { SKILL_ASSESSMENTS, calculateLevelFromScore, type AssessmentQuestion } from '@/lib/skill-assessments';
import { MasteryGoal } from '@/lib/fig-level-progressions';

interface FigOnboardingAssessmentProps {
  onComplete: (assessments: FigAssessmentResult[]) => void;
  userId: string;
}

export interface FigAssessmentResult {
  skill: MasteryGoal;
  score: number;
  level: string;
}

// Select representative skills for initial onboarding
const ONBOARDING_SKILLS: MasteryGoal[] = [
  'HANDSTAND',      // Balance
  'PULL_UPS',       // Strength (Pull)
  'DIPS',           // Strength (Push)
  'PLANCHE',        // Static Holds
  'AB_WHEEL',       // Core
  'PISTOL_SQUAT',   // Lower Body
];

const SKILL_ICONS: Record<string, any> = {
  HANDSTAND: Activity,
  PULL_UPS: Dumbbell,
  DIPS: Dumbbell,
  PLANCHE: TargetIcon,
  AB_WHEEL: Flame,
  PISTOL_SQUAT: Activity,
};

const SKILL_DISPLAY_NAMES: Record<MasteryGoal, string> = {
  HANDSTAND: 'Handstand',
  PULL_UPS: 'Pull-ups',
  DIPS: 'Dips',
  PLANCHE: 'Planche',
  AB_WHEEL: 'Core (Ab Wheel)',
  PISTOL_SQUAT: 'Pistol Squats',
  RINGS_HANDSTAND: 'Rings Handstand',
  PRESS_HANDSTAND: 'Press Handstand',
  STRAIGHT_ARM_PRESS: 'Straight Arm Press',
  L_SIT_MANNA: 'L-sit / Manna',
  BACK_LEVER: 'Back Lever',
  FRONT_LEVER: 'Front Lever',
  ONE_ARM_PULL_UP: 'One-Arm Pull-up',
  IRON_CROSS: 'Iron Cross',
  HANDSTAND_PUSHUP: 'Handstand Push-up',
  RING_DIPS: 'Ring Dips',
  MUSCLE_UP: 'Muscle-up',
  FLAG: 'Human Flag',
};

export default function FigOnboardingAssessment({
  onComplete,
  userId,
}: FigOnboardingAssessmentProps) {
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<number, number>>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentSkill = ONBOARDING_SKILLS[currentSkillIndex];
  const skillQuestions = SKILL_ASSESSMENTS[currentSkill];
  const currentQuestion = skillQuestions[currentQuestionIndex];

  const totalSkills = ONBOARDING_SKILLS.length;
  const questionsPerSkill = 3;
  const totalQuestions = totalSkills * questionsPerSkill;
  const answeredQuestions = Object.keys(answers).reduce((count, skill) => {
    return count + Object.keys(answers[skill] || {}).length;
  }, 0);
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswerSelect = (points: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentSkill]: {
        ...(prev[currentSkill] || {}),
        [currentQuestionIndex]: points,
      },
    }));
  };

  const handleNext = () => {
    // Check if all questions for current skill are answered
    const skillAnswers = answers[currentSkill] || {};
    const isSkillComplete = Object.keys(skillAnswers).length === 3;

    if (currentQuestionIndex < skillQuestions.length - 1) {
      // Move to next question in current skill
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentSkillIndex < ONBOARDING_SKILLS.length - 1) {
      // Move to next skill
      setCurrentSkillIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      // All done - calculate results
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentSkillIndex > 0) {
      setCurrentSkillIndex(prev => prev - 1);
      setCurrentQuestionIndex(2); // Last question of previous skill
    }
  };

  const handleComplete = () => {
    const assessmentResults: FigAssessmentResult[] = [];

    ONBOARDING_SKILLS.forEach(skill => {
      const skillAnswers = answers[skill] || {};
      const totalScore = Object.values(skillAnswers).reduce((sum, points) => sum + points, 0);
      const level = calculateLevelFromScore(totalScore);

      assessmentResults.push({
        skill,
        score: totalScore,
        level,
      });
    });

    setIsCompleted(true);
    onComplete(assessmentResults);
  };

  const currentAnswer = answers[currentSkill]?.[currentQuestionIndex];
  const canProceed = currentAnswer !== undefined;
  const isLastQuestion = currentSkillIndex === ONBOARDING_SKILLS.length - 1 &&
    currentQuestionIndex === skillQuestions.length - 1;

  const Icon = SKILL_ICONS[currentSkill] || Trophy;

  if (isCompleted) {
    return (
      <Card className="max-w-2xl mx-auto border-green-200 bg-green-50/30">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Assessment Complete!
          </h2>
          <p className="text-slate-600 mb-6">
            Processing your results and creating your personalized training plan...
          </p>
          <div className="animate-pulse flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm text-slate-600">
          <span>Skill {currentSkillIndex + 1} of {totalSkills}: {SKILL_DISPLAY_NAMES[currentSkill]}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-3" />
        <p className="text-xs text-slate-500 text-center">
          Question {currentQuestionIndex + 1} of 3 for this skill
        </p>
      </div>

      {/* Question Card */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <Icon className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl text-slate-900">
                {SKILL_DISPLAY_NAMES[currentSkill]}
              </CardTitle>
              <CardDescription className="text-sm">
                Question {currentQuestionIndex + 1} of 3
              </CardDescription>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200">
            <p className="text-base font-medium text-slate-800 leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <RadioGroup
            value={currentAnswer?.toString()}
            onValueChange={(val) => handleAnswerSelect(parseInt(val))}
          >
            {currentQuestion.options.map((option, idx) => (
              <div
                key={idx}
                className={`
                  flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer
                  ${currentAnswer === option.points
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }
                `}
              >
                <RadioGroupItem value={option.points.toString()} id={`option-${idx}`} />
                <Label
                  htmlFor={`option-${idx}`}
                  className="flex-1 cursor-pointer font-medium text-slate-700"
                >
                  {option.text}
                </Label>
                <Badge variant="outline" className="text-xs">
                  {option.points} {option.points === 1 ? 'pt' : 'pts'}
                </Badge>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentSkillIndex === 0 && currentQuestionIndex === 0}
          className="min-w-[120px]"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="text-sm text-slate-500 text-center">
          {answeredQuestions} of {totalQuestions} questions answered
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
        >
          {isLastQuestion ? (
            <>
              Complete
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Helpful Tip */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-slate-700">
            <strong className="text-blue-700">💡 Tip:</strong> Be honest with your current abilities.
            This helps us create the perfect training plan for you. You can always reassess later as you progress!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
