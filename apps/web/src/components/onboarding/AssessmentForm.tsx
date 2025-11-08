'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import {
  ChevronRight,
  ChevronLeft,
  Target,
  Trophy,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface AssessmentQuestion {
  id: string;
  branch: string;
  question: string;
  options: {
    value: string;
    label: string;
    score: number;
  }[];
}

const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // PUSH (Relative Strength - Push)
  {
    id: 'push_pushups',
    branch: 'PUSH',
    question: 'How many consecutive push-ups can you perform with proper form?',
    options: [
      { value: '0-5', label: '0-5 push-ups', score: 1 },
      { value: '6-15', label: '6-15 push-ups', score: 2 },
      { value: '16-30', label: '16-30 push-ups', score: 3 },
      { value: '31-50', label: '31-50 push-ups', score: 4 },
      { value: '50+', label: '50+ push-ups', score: 5 },
    ],
  },
  {
    id: 'push_dips',
    branch: 'PUSH',
    question: 'What is your current level with dips (parallel bar dips)?',
    options: [
      { value: 'none', label: "I can't do any", score: 1 },
      { value: 'assisted', label: 'Only with assistance/band', score: 2 },
      { value: '1-10', label: '1-10 repetitions', score: 3 },
      { value: '11-20', label: '11-20 repetitions', score: 4 },
      { value: '20+', label: '20+ repetitions or weighted dips', score: 5 },
    ],
  },
  {
    id: 'push_hspu',
    branch: 'PUSH',
    question: 'Can you perform handstand push-ups?',
    options: [
      { value: 'no_wall', label: "Can't do wall handstand push-ups", score: 1 },
      { value: 'wall_partial', label: 'Wall HSPU with limited range', score: 2 },
      { value: 'wall_full', label: 'Wall HSPU full range of motion', score: 3 },
      { value: 'freestanding_few', label: 'Freestanding HSPU (1-3 reps)', score: 4 },
      { value: 'freestanding_many', label: 'Freestanding HSPU (4+ reps)', score: 5 },
    ],
  },
  // PULL (Relative Strength - Pull)
  {
    id: 'pull_pullups',
    branch: 'PULL',
    question: 'How many consecutive pull-ups can you perform?',
    options: [
      { value: 'none', label: "I can't do any", score: 1 },
      { value: 'assisted', label: 'Only with assistance/band', score: 2 },
      { value: '1-5', label: '1-5 pull-ups', score: 3 },
      { value: '6-15', label: '6-15 pull-ups', score: 4 },
      { value: '16+', label: '16+ pull-ups or weighted pull-ups', score: 5 },
    ],
  },
  {
    id: 'pull_muscle_up',
    branch: 'PULL',
    question: 'Can you perform muscle-ups on a bar?',
    options: [
      { value: 'no_negative', label: "Can't do negative muscle-ups", score: 1 },
      { value: 'negative', label: 'Only negative muscle-ups', score: 2 },
      { value: 'kipping', label: 'Kipping/explosive muscle-up (1-3)', score: 3 },
      { value: 'strict_few', label: 'Strict muscle-ups (1-3 reps)', score: 4 },
      { value: 'strict_many', label: 'Strict muscle-ups (4+ reps)', score: 5 },
    ],
  },
  {
    id: 'pull_one_arm',
    branch: 'PULL',
    question: 'What is your progress towards one-arm pull-ups?',
    options: [
      { value: 'no_progress', label: 'Haven\'t started training for it', score: 1 },
      { value: 'archer', label: 'Can do archer pull-ups', score: 2 },
      { value: 'assisted_oap', label: 'One-arm pull-ups with band/assistance', score: 3 },
      { value: 'oap_few', label: 'One-arm pull-up (1-2 reps per arm)', score: 4 },
      { value: 'oap_many', label: 'One-arm pull-ups (3+ reps per arm)', score: 5 },
    ],
  },
  // CORE (Muscular Endurance & Core)
  {
    id: 'core_plank',
    branch: 'CORE',
    question: 'How long can you hold a proper plank position?',
    options: [
      { value: '0-30', label: 'Less than 30 seconds', score: 1 },
      { value: '30-60', label: '30-60 seconds', score: 2 },
      { value: '60-90', label: '60-90 seconds', score: 3 },
      { value: '90-120', label: '90-120 seconds', score: 4 },
      { value: '120+', label: '2+ minutes', score: 5 },
    ],
  },
  {
    id: 'core_leg_raises',
    branch: 'CORE',
    question: 'What is your level with hanging leg raises?',
    options: [
      { value: 'knee_raises', label: 'Only knee raises', score: 1 },
      { value: 'leg_raises_few', label: 'Straight leg raises (1-5 reps)', score: 2 },
      { value: 'leg_raises_many', label: 'Straight leg raises (6-15 reps)', score: 3 },
      { value: 'toes_to_bar', label: 'Toes to bar (6+ reps)', score: 4 },
      { value: 'windshield_wipers', label: 'Windshield wipers or dragon flags', score: 5 },
    ],
  },
  {
    id: 'core_lsit',
    branch: 'CORE',
    question: 'Can you perform an L-sit?',
    options: [
      { value: 'no_lift', label: "Can't lift off the ground", score: 1 },
      { value: 'tuck', label: 'Tuck L-sit (less than 10s)', score: 2 },
      { value: 'one_leg', label: 'One-leg extended L-sit (10s+)', score: 3 },
      { value: 'full_short', label: 'Full L-sit (10-20s)', score: 4 },
      { value: 'full_long', label: 'Full L-sit (30s+) or V-sit', score: 5 },
    ],
  },
  // BALANCE (Balance & Control)
  {
    id: 'balance_handstand',
    branch: 'BALANCE',
    question: 'What is your handstand ability?',
    options: [
      { value: 'no_wall', label: "Can't hold wall handstand", score: 1 },
      { value: 'wall', label: 'Wall handstand (30s+)', score: 2 },
      { value: 'freestanding_short', label: 'Freestanding handstand (5-15s)', score: 3 },
      { value: 'freestanding_long', label: 'Freestanding handstand (30s+)', score: 4 },
      { value: 'freestanding_expert', label: 'Handstand walk or one-arm handstand progressions', score: 5 },
    ],
  },
  {
    id: 'balance_pistol',
    branch: 'BALANCE',
    question: 'Can you perform pistol squats (single-leg squats)?',
    options: [
      { value: 'assisted_both', label: 'Only with assistance on both hands', score: 1 },
      { value: 'assisted_one', label: 'With one-hand assistance', score: 2 },
      { value: 'free_few', label: 'Freestanding pistol squats (1-3 per leg)', score: 3 },
      { value: 'free_many', label: 'Freestanding pistol squats (5+ per leg)', score: 4 },
      { value: 'advanced', label: 'Weighted pistol squats or shrimp squats', score: 5 },
    ],
  },
  // STATIC SKILLS (Skill & Technique)
  {
    id: 'static_front_lever',
    branch: 'STATIC',
    question: 'What is your front lever progression level?',
    options: [
      { value: 'no_progress', label: 'No progression yet', score: 1 },
      { value: 'tuck', label: 'Tuck front lever (5s+)', score: 2 },
      { value: 'advanced_tuck', label: 'Advanced tuck or one-leg front lever (5s+)', score: 3 },
      { value: 'straddle', label: 'Straddle front lever (5s+)', score: 4 },
      { value: 'full', label: 'Full front lever (5s+)', score: 5 },
    ],
  },
  {
    id: 'static_planche',
    branch: 'STATIC',
    question: 'What is your planche progression level?',
    options: [
      { value: 'no_progress', label: 'No progression yet', score: 1 },
      { value: 'frog_stand', label: 'Frog stand or tuck planche (5s+)', score: 2 },
      { value: 'advanced_tuck', label: 'Advanced tuck planche (5s+)', score: 3 },
      { value: 'straddle', label: 'Straddle planche (5s+)', score: 4 },
      { value: 'full', label: 'Full planche (5s+)', score: 5 },
    ],
  },
  // MOBILITY
  {
    id: 'mobility_flexibility',
    branch: 'MOBILITY',
    question: 'What is your current flexibility and mobility level?',
    options: [
      { value: 'limited', label: 'Limited flexibility, struggle with basic stretches', score: 1 },
      { value: 'average', label: 'Average flexibility, can touch toes', score: 2 },
      { value: 'good', label: 'Good flexibility, comfortable in deep stretches', score: 3 },
      { value: 'very_good', label: 'Very good, can do bridge, pike compression', score: 4 },
      { value: 'excellent', label: 'Excellent, full splits, pancake, active flexibility', score: 5 },
    ],
  },
  // ENDURANCE
  {
    id: 'endurance_burpees',
    branch: 'ENDURANCE',
    question: 'How many burpees can you do in 2 minutes?',
    options: [
      { value: '0-10', label: '0-10 burpees', score: 1 },
      { value: '11-20', label: '11-20 burpees', score: 2 },
      { value: '21-30', label: '21-30 burpees', score: 3 },
      { value: '31-40', label: '31-40 burpees', score: 4 },
      { value: '40+', label: '40+ burpees', score: 5 },
    ],
  },
];

const GOAL_OPTIONS = [
  { value: 'strength', label: 'Build Overall Strength', icon: '💪' },
  { value: 'muscle', label: 'Gain Muscle Mass', icon: '🏋️' },
  { value: 'fat_loss', label: 'Lose Fat', icon: '🔥' },
  { value: 'front_lever', label: 'Achieve Front Lever', icon: '🦅' },
  { value: 'planche', label: 'Achieve Planche', icon: '🕊️' },
  { value: 'handstand', label: 'Master Handstand', icon: '🤸' },
  { value: 'muscle_up', label: 'Achieve Muscle-Up', icon: '⚡' },
  { value: 'general', label: 'General Fitness', icon: '✨' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner (0-6 months)', score: 1 },
  { value: 'intermediate', label: 'Intermediate (6 months - 2 years)', score: 2 },
  { value: 'advanced', label: 'Advanced (2-5 years)', score: 3 },
  { value: 'expert', label: 'Expert (5+ years)', score: 4 },
];

const AVAILABILITY_OPTIONS = [
  { value: '2-3', label: '2-3 days per week', multiplier: 0.7 },
  { value: '4-5', label: '4-5 days per week', multiplier: 1.0 },
  { value: '6-7', label: '6-7 days per week', multiplier: 1.2 },
];

interface AssessmentFormProps {
  onComplete: (results: AssessmentResults) => void;
  userId: string;
}

export interface AssessmentResults {
  userId: string;
  answers: Record<string, string>;
  scores: {
    PUSH: number;
    PULL: number;
    CORE: number;
    BALANCE: number;
    STATIC: number;
    MOBILITY: number;
    ENDURANCE: number;
  };
  goal: string;
  experience: string;
  availability: string;
  overallLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

export default function AssessmentForm({ onComplete, userId }: AssessmentFormProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [goal, setGoal] = useState<string>('');
  const [experience, setExperience] = useState<string>('');
  const [availability, setAvailability] = useState<string>('');

  const totalSteps = ASSESSMENT_QUESTIONS.length + 3; // questions + goal + experience + availability
  const progress = ((step + 1) / totalSteps) * 100;

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Calculate scores and submit
      const scores = calculateScores();
      const overallLevel = determineOverallLevel(scores, experience);

      const results: AssessmentResults = {
        userId,
        answers,
        scores,
        goal,
        experience,
        availability,
        overallLevel,
      };

      onComplete(results);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const calculateScores = () => {
    const scores = {
      PUSH: 0,
      PULL: 0,
      CORE: 0,
      BALANCE: 0,
      STATIC: 0,
      MOBILITY: 0,
      ENDURANCE: 0,
    };

    ASSESSMENT_QUESTIONS.forEach((q) => {
      const answer = answers[q.id];
      if (answer) {
        const option = q.options.find((o) => o.value === answer);
        if (option) {
          scores[q.branch as keyof typeof scores] += option.score;
        }
      }
    });

    // Normalize scores to 0-10 scale (divide by number of questions per branch, then multiply by 2)
    const questionCounts = {
      PUSH: 3,
      PULL: 3,
      CORE: 3,
      BALANCE: 2,
      STATIC: 2,
      MOBILITY: 1,
      ENDURANCE: 1,
    };

    Object.keys(scores).forEach((branch) => {
      const key = branch as keyof typeof scores;
      // Average score is 1-5, we convert to 0-10 scale
      scores[key] = (scores[key] / questionCounts[key]) * 2;
    });

    return scores;
  };

  const determineOverallLevel = (
    scores: Record<string, number>,
    exp: string
  ): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' => {
    // Calculate weighted average (prioritize push, pull, and core)
    const weights = {
      PUSH: 1.5,
      PULL: 1.5,
      CORE: 1.2,
      BALANCE: 1.0,
      STATIC: 1.0,
      MOBILITY: 0.8,
      ENDURANCE: 0.8,
    };

    let weightedSum = 0;
    let totalWeight = 0;

    Object.keys(scores).forEach((branch) => {
      const key = branch as keyof typeof scores;
      const weight = weights[key] || 1;
      weightedSum += scores[key] * weight;
      totalWeight += weight;
    });

    const avgScore = weightedSum / totalWeight; // This is on 0-10 scale

    // Adjust based on experience
    const expScore = EXPERIENCE_OPTIONS.find((e) => e.value === exp)?.score || 1;
    const expAdjustment = (expScore - 1) * 0.5; // 0 to 1.5 adjustment

    const finalScore = avgScore + expAdjustment;

    // Determine level based on final score (0-12 scale after experience adjustment)
    if (finalScore <= 3) return 'BEGINNER';
    if (finalScore <= 6) return 'INTERMEDIATE';
    if (finalScore <= 9) return 'ADVANCED';
    return 'EXPERT';
  };

  const canProceed = () => {
    if (step < ASSESSMENT_QUESTIONS.length) {
      return !!answers[ASSESSMENT_QUESTIONS[step].id];
    }
    if (step === ASSESSMENT_QUESTIONS.length) return !!goal;
    if (step === ASSESSMENT_QUESTIONS.length + 1) return !!experience;
    if (step === ASSESSMENT_QUESTIONS.length + 2) return !!availability;
    return false;
  };

  const renderStep = () => {
    // Question steps
    if (step < ASSESSMENT_QUESTIONS.length) {
      const question = ASSESSMENT_QUESTIONS[step];
      return (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-blue-600 uppercase">
                {question.branch}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">
              {question.question}
            </h3>
          </div>

          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={(value) => handleAnswer(question.id, value)}
          >
            <div className="space-y-3">
              {question.options.map((option) => (
                <div
                  key={option.value}
                  className={`relative flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${
                    answers[question.id] === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                  onClick={() => handleAnswer(question.id, option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer text-base"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      );
    }

    // Goal step
    if (step === ASSESSMENT_QUESTIONS.length) {
      return (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600 uppercase">
                Primary Goal
              </span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">
              What is your primary training goal?
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {GOAL_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={`relative flex flex-col items-center justify-center p-4 rounded-lg border cursor-pointer transition-all ${
                  goal === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
                onClick={() => setGoal(option.value)}
              >
                <span className="text-3xl mb-2">{option.icon}</span>
                <span className="text-sm font-medium text-center">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Experience step
    if (step === ASSESSMENT_QUESTIONS.length + 1) {
      return (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600 uppercase">
                Experience Level
              </span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">
              How much experience do you have with calisthenics?
            </h3>
          </div>

          <RadioGroup value={experience} onValueChange={setExperience}>
            <div className="space-y-3">
              {EXPERIENCE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`relative flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${
                    experience === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                  onClick={() => setExperience(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer text-base"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      );
    }

    // Availability step
    if (step === ASSESSMENT_QUESTIONS.length + 2) {
      return (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600 uppercase">
                Training Availability
              </span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">
              How many days per week can you train?
            </h3>
          </div>

          <RadioGroup value={availability} onValueChange={setAvailability}>
            <div className="space-y-3">
              {AVAILABILITY_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`relative flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${
                    availability === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                  onClick={() => setAvailability(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer text-base"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Level Assessment</CardTitle>
              <CardDescription>
                Step {step + 1} of {totalSteps}
              </CardDescription>
            </div>
            <div className="text-sm font-medium text-blue-600">
              {Math.round(progress)}%
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="pt-6">
          {renderStep()}

          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {step === totalSteps - 1 ? (
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
        </CardContent>
      </Card>
    </div>
  );
}
