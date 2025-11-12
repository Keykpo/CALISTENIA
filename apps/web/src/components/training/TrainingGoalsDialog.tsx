'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Target,
  TrendingDown,
  Zap,
  Dumbbell,
  FlameKindling,
  Users,
  Heart,
  Mountain,
  Clock,
} from 'lucide-react';

interface TrainingGoalsDialogProps {
  open: boolean;
  onComplete: (goal: TrainingGoal) => void;
}

export interface TrainingGoal {
  primary: string;
  focusArea?: string;
  targetSkill?: string; // For skill mastery goals
  description: string;
  duration: number; // in minutes
}

const TRAINING_GOALS = [
  {
    id: 'strength',
    name: 'Build Strength',
    description: 'Develop maximum strength and power',
    icon: Dumbbell,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    id: 'weight_loss',
    name: 'Lose Weight',
    description: 'Burn fat and improve body composition',
    icon: TrendingDown,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'endurance',
    name: 'Build Endurance',
    description: 'Improve cardiovascular and muscular endurance',
    icon: FlameKindling,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'muscle_mass',
    name: 'Build Muscle',
    description: 'Hypertrophy and muscle growth',
    icon: Mountain,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'skill_mastery',
    name: 'Skill Mastery',
    description: 'Master a specific calisthenics skill',
    icon: Target,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    id: 'health',
    name: 'General Health',
    description: 'Maintain an active and healthy lifestyle',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
];

const SKILL_BRANCHES = [
  {
    id: 'push',
    name: 'Push Training',
    description: 'Push-ups, dips, planche',
    icon: Zap,
  },
  {
    id: 'pull',
    name: 'Pull Training',
    description: 'Pull-ups, front lever, muscle-ups',
    icon: Target,
  },
  {
    id: 'core',
    name: 'Core Training',
    description: 'L-sit, dragon flag, hollow body',
    icon: FlameKindling,
  },
  {
    id: 'balance',
    name: 'Balance Training',
    description: 'Handstand, handstand push-up',
    icon: Users,
  },
];

// FIG Level Skills for Skill Mastery goal
const FIG_SKILLS = [
  { id: 'HANDSTAND', name: 'Handstand Mastery', category: 'Balance', icon: Target },
  { id: 'PRESS_HANDSTAND', name: 'Press to Handstand', category: 'Strength', icon: Dumbbell },
  { id: 'RINGS_HANDSTAND', name: 'Rings Handstand', category: 'Balance', icon: Target },
  { id: 'ONE_ARM_PULL_UP', name: 'One Arm Pull Up', category: 'Strength', icon: Dumbbell },
  { id: 'FRONT_LEVER', name: 'Front Lever', category: 'Strength', icon: Dumbbell },
  { id: 'BACK_LEVER', name: 'Back Lever', category: 'Strength', icon: Dumbbell },
  { id: 'PLANCHE', name: 'Planche', category: 'Strength', icon: Dumbbell },
  { id: 'IRON_CROSS', name: 'Iron Cross', category: 'Strength', icon: Dumbbell },
  { id: 'MUSCLE_UP', name: 'Muscle Up', category: 'Strength', icon: Dumbbell },
  { id: 'L_SIT_MANNA', name: 'L-Sit to Manna', category: 'Core', icon: FlameKindling },
  { id: 'HANDSTAND_PUSHUP', name: 'Handstand Push-up', category: 'Strength', icon: Dumbbell },
  { id: 'FLAG', name: 'Human Flag', category: 'Core', icon: FlameKindling },
];

const DURATION_OPTIONS = [
  { value: 20, label: '20 minutes', description: 'Quick and focused session' },
  { value: 30, label: '30 minutes', description: 'Balanced workout' },
  { value: 45, label: '45 minutes', description: 'Complete session' },
  { value: 60, label: '1 hour', description: 'Intensive training' },
  { value: 90, label: '1.5 hours', description: 'Extended session' },
  { value: 120, label: '2 hours', description: 'Advanced training' },
];

export function TrainingGoalsDialog({ open, onComplete }: TrainingGoalsDialogProps) {
  const [step, setStep] = useState<'goal' | 'duration' | 'skill' | 'branch'>('goal');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // Default 1 hour
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [showBranchSelection, setShowBranchSelection] = useState(false);

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
  };

  const handleContinueFromGoal = () => {
    const goal = TRAINING_GOALS.find((g) => g.id === selectedGoal);
    if (!goal) return;

    // Move to duration selection
    setStep('duration');
  };

  const handleContinueFromDuration = () => {
    // If skill_mastery, go to skill selection
    if (selectedGoal === 'skill_mastery') {
      setStep('skill');
    } else {
      // Otherwise, go to branch selection
      setShowBranchSelection(true);
      setStep('branch');
    }
  };

  const handleSkillSelect = () => {
    const goal = TRAINING_GOALS.find((g) => g.id === selectedGoal);
    const skill = FIG_SKILLS.find((s) => s.id === selectedSkill);

    if (!goal || !skill) return;

    onComplete({
      primary: selectedGoal,
      targetSkill: selectedSkill,
      description: `Master ${skill.name}`,
      duration: selectedDuration,
    });
  };

  const handleSkipBranch = () => {
    const goal = TRAINING_GOALS.find((g) => g.id === selectedGoal);
    if (!goal) return;

    onComplete({
      primary: selectedGoal,
      description: goal.description,
      duration: selectedDuration,
    });
  };

  const handleBranchSelect = () => {
    const goal = TRAINING_GOALS.find((g) => g.id === selectedGoal);
    const branch = SKILL_BRANCHES.find((b) => b.id === selectedBranch);

    if (!goal) return;

    onComplete({
      primary: selectedGoal,
      focusArea: selectedBranch,
      description: `${goal.description} - Focus on ${branch?.name || 'general'}`,
      duration: selectedDuration,
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === 'goal' && 'What is your main goal?'}
            {step === 'duration' && 'How much time do you have today?'}
            {step === 'skill' && 'Which skill do you want to master?'}
            {step === 'branch' && 'Want to focus on a specific area?'}
          </DialogTitle>
          <DialogDescription>
            {step === 'goal' && 'Select your main training goal. This will help us personalize your daily routines.'}
            {step === 'duration' && 'Select the duration of your workouts. You can change this anytime.'}
            {step === 'skill' && 'Choose a FIG Level skill to work towards. Your routines will include progressions for this skill.'}
            {step === 'branch' && 'Optional: Choose a calisthenics area to focus your training'}
          </DialogDescription>
        </DialogHeader>

        {step === 'goal' && (
          <div className="space-y-4 py-4">
            <RadioGroup value={selectedGoal} onValueChange={handleGoalSelect}>
              <div className="grid gap-4">
                {TRAINING_GOALS.map((goal) => {
                  const Icon = goal.icon;
                  return (
                    <label key={goal.id} htmlFor={goal.id} className="cursor-pointer">
                      <Card
                        className={`p-4 transition-all ${
                          selectedGoal === goal.id
                            ? `${goal.bgColor} border-2 ${goal.borderColor}`
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <RadioGroupItem value={goal.id} id={goal.id} className="mt-1" />
                          <div className={`p-3 rounded-full ${goal.bgColor}`}>
                            <Icon className={`w-6 h-6 ${goal.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{goal.name}</h3>
                            <p className="text-sm text-gray-600">{goal.description}</p>
                          </div>
                        </div>
                      </Card>
                    </label>
                  );
                })}
              </div>
            </RadioGroup>

            <div className="flex justify-end pt-4">
              <Button onClick={handleContinueFromGoal} disabled={!selectedGoal} size="lg">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'duration' && (
          <div className="space-y-4 py-4">
            <RadioGroup
              value={selectedDuration.toString()}
              onValueChange={(v) => setSelectedDuration(parseInt(v))}
            >
              <div className="grid gap-3">
                {DURATION_OPTIONS.map((option) => (
                  <label key={option.value} htmlFor={`duration-${option.value}`} className="cursor-pointer">
                    <Card
                      className={`p-4 transition-all ${
                        selectedDuration === option.value
                          ? 'bg-blue-50 border-2 border-blue-300'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value={option.value.toString()} id={`duration-${option.value}`} />
                        <Clock className="w-6 h-6 text-blue-600" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{option.label}</h3>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </div>
                    </Card>
                  </label>
                ))}
              </div>
            </RadioGroup>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setStep('goal')} variant="outline" size="lg" className="flex-1">
                Back
              </Button>
              <Button onClick={handleContinueFromDuration} size="lg" className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'skill' && (
          <div className="space-y-4 py-4">
            <RadioGroup value={selectedSkill} onValueChange={setSelectedSkill}>
              <div className="grid gap-3">
                {FIG_SKILLS.map((skill) => {
                  const Icon = skill.icon;
                  return (
                    <label key={skill.id} htmlFor={skill.id} className="cursor-pointer">
                      <Card
                        className={`p-4 transition-all ${
                          selectedSkill === skill.id
                            ? 'bg-indigo-50 border-2 border-indigo-300'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <RadioGroupItem value={skill.id} id={skill.id} />
                          <Icon className="w-6 h-6 text-indigo-600" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{skill.name}</h3>
                            <p className="text-sm text-gray-600">{skill.category}</p>
                          </div>
                        </div>
                      </Card>
                    </label>
                  );
                })}
              </div>
            </RadioGroup>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setStep('duration')} variant="outline" size="lg" className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSkillSelect}
                disabled={!selectedSkill}
                size="lg"
                className="flex-1"
              >
                Confirm Skill
              </Button>
            </div>
          </div>
        )}

        {step === 'branch' && (
          <div className="space-y-4 py-4">
            <RadioGroup value={selectedBranch} onValueChange={setSelectedBranch}>
              <div className="grid gap-3">
                {SKILL_BRANCHES.map((branch) => {
                  const Icon = branch.icon;
                  return (
                    <label key={branch.id} htmlFor={branch.id} className="cursor-pointer">
                      <Card
                        className={`p-4 transition-all ${
                          selectedBranch === branch.id
                            ? 'bg-blue-50 border-2 border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <RadioGroupItem value={branch.id} id={branch.id} />
                          <Icon className="w-5 h-5 text-blue-600" />
                          <div className="flex-1">
                            <h3 className="font-semibold">{branch.name}</h3>
                            <p className="text-sm text-gray-600">{branch.description}</p>
                          </div>
                        </div>
                      </Card>
                    </label>
                  );
                })}
              </div>
            </RadioGroup>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSkipBranch} variant="outline" size="lg" className="flex-1">
                No, general focus
              </Button>
              <Button
                onClick={handleBranchSelect}
                disabled={!selectedBranch}
                size="lg"
                className="flex-1"
              >
                Confirm Focus
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
