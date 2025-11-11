'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  User,
  Dumbbell,
  Activity,
  Target,
  Info,
} from 'lucide-react';
import {
  AssessmentStep1Data,
  AssessmentStep2Data,
  AssessmentStep3Data,
  AssessmentStep4Data,
  DifficultyLevel,
  shouldShowStep4,
} from '@/lib/assessment-d-s-logic';

interface FigOnboardingAssessmentProps {
  onComplete: (result: {
    level: DifficultyLevel;
    step1: AssessmentStep1Data;
    step2: AssessmentStep2Data;
    step3: AssessmentStep3Data;
    step4?: AssessmentStep4Data;
  }) => void;
  userId: string;
}

type AssessmentStep = 1 | 2 | 3 | 4 | 'results';

const GOAL_OPTIONS = [
  { id: 'strength', label: '💪 Build general strength', icon: '💪' },
  { id: 'skills', label: '🤸 Learn skills (Handstand, Planche, Front Lever)', icon: '🤸' },
  { id: 'muscle', label: '💪 Gain muscle mass', icon: '💪' },
  { id: 'fat_loss', label: '🔥 Lose fat / Get defined', icon: '🔥' },
  { id: 'endurance', label: '⚡ Improve endurance', icon: '⚡' },
  { id: 'mobility', label: '🧘 Flexibility and mobility', icon: '🧘' },
  { id: 'compete', label: '🏆 Compete in calisthenics', icon: '🏆' },
];

export default function FigOnboardingAssessment({
  onComplete,
  userId,
}: FigOnboardingAssessmentProps) {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>(1);

  // Step 1: Demographics & Goals
  const [step1Data, setStep1Data] = useState<Partial<AssessmentStep1Data>>({
    age: undefined,
    height: undefined,
    weight: undefined,
    gender: 'prefer_not_to_say',
    goals: [],
  });

  // Step 2: Equipment
  const [step2Data, setStep2Data] = useState<AssessmentStep2Data>({
    equipment: {
      floor: true,
      pullUpBar: false,
      rings: false,
      parallelBars: false,
      resistanceBands: false,
    },
  });

  // Step 3: Fundamental Tests
  const [step3Data, setStep3Data] = useState<Partial<AssessmentStep3Data>>({
    pushUps: undefined,
    dips: undefined,
    pullUps: undefined,
    deadHangTime: undefined,
    plankTime: undefined,
    hollowBodyHold: undefined,
    squats: undefined,
    pistolSquat: 'no',
  });

  // Step 4: Advanced Skills (conditional)
  const [step4Data, setStep4Data] = useState<Partial<AssessmentStep4Data>>({
    handstand: 'no',
    handstandPushUp: 'no',
    frontLever: 'no',
    planche: 'no',
    lSit: 'no',
    muscleUp: 'no',
    archerPullUp: 'no',
    oneArmPullUp: 'no',
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Step validation
  const isStep1Valid = () => {
    return (
      step1Data.age !== undefined &&
      step1Data.height !== undefined &&
      step1Data.weight !== undefined &&
      step1Data.goals && step1Data.goals.length > 0
    );
  };

  const isStep2Valid = () => {
    return Object.values(step2Data.equipment).some(v => v === true);
  };

  const isStep3Valid = () => {
    return (
      step3Data.pushUps !== undefined &&
      step3Data.dips !== undefined &&
      step3Data.pullUps !== undefined &&
      step3Data.deadHangTime !== undefined &&
      step3Data.plankTime !== undefined &&
      step3Data.hollowBodyHold !== undefined &&
      step3Data.squats !== undefined &&
      step3Data.pistolSquat !== undefined
    );
  };

  const handleNext = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && isStep2Valid()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && isStep3Valid()) {
      // Check if we should show Step 4
      const showStep4 = shouldShowStep4(step3Data as AssessmentStep3Data);
      if (showStep4) {
        setCurrentStep(4);
      } else {
        handleComplete();
      }
    } else if (currentStep === 4) {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1 && currentStep !== 'results') {
      setCurrentStep((prev) => (prev as number - 1) as AssessmentStep);
    }
  };

  const handleComplete = () => {
    // Validate step1 data
    if (!step1Data.age || !step1Data.height || !step1Data.weight || !step1Data.goals || step1Data.goals.length === 0) {
      console.error('[D-S_ASSESSMENT] Step 1 data incomplete:', step1Data);
      alert('Please complete all required fields in Step 1');
      return;
    }

    // Validate step3 data
    if (
      step3Data.pushUps === undefined ||
      step3Data.dips === undefined ||
      step3Data.pullUps === undefined ||
      step3Data.deadHangTime === undefined ||
      step3Data.plankTime === undefined ||
      step3Data.hollowBodyHold === undefined ||
      step3Data.squats === undefined ||
      !step3Data.pistolSquat
    ) {
      console.error('[D-S_ASSESSMENT] Step 3 data incomplete:', step3Data);
      alert('Please complete all required fields in Step 3');
      return;
    }

    const result = {
      level: 'D' as DifficultyLevel, // Will be calculated on backend
      step1: {
        age: step1Data.age,
        height: step1Data.height,
        weight: step1Data.weight,
        gender: step1Data.gender || 'prefer_not_to_say',
        goals: step1Data.goals,
      } as AssessmentStep1Data,
      step2: step2Data,
      step3: {
        pushUps: step3Data.pushUps,
        dips: step3Data.dips,
        pullUps: step3Data.pullUps,
        deadHangTime: step3Data.deadHangTime,
        plankTime: step3Data.plankTime,
        hollowBodyHold: step3Data.hollowBodyHold,
        squats: step3Data.squats,
        pistolSquat: step3Data.pistolSquat,
      } as AssessmentStep3Data,
      step4: currentStep === 4 ? (step4Data as AssessmentStep4Data) : undefined,
    };

    console.log('[D-S_ASSESSMENT] Completing with data:', JSON.stringify(result, null, 2));
    onComplete(result);
  };

  const toggleGoal = (goalId: string) => {
    setStep1Data(prev => {
      const currentGoals = prev.goals || [];
      const hasGoal = currentGoals.includes(goalId);

      if (hasGoal) {
        return { ...prev, goals: currentGoals.filter(g => g !== goalId) };
      } else if (currentGoals.length < 3) {
        return { ...prev, goals: [...currentGoals, goalId] };
      }
      return prev;
    });
  };

  // Render different steps
  const renderStep1 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">About You</CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="13"
                max="100"
                placeholder="25"
                value={step1Data.age || ''}
                onChange={(e) => setStep1Data(prev => ({ ...prev, age: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                value={step1Data.gender}
                onChange={(e) => setStep1Data(prev => ({
                  ...prev,
                  gender: e.target.value as AssessmentStep1Data['gender']
                }))}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm) *</Label>
              <Input
                id="height"
                type="number"
                min="100"
                max="250"
                placeholder="175"
                value={step1Data.height || ''}
                onChange={(e) => setStep1Data(prev => ({ ...prev, height: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                min="30"
                max="200"
                placeholder="70"
                value={step1Data.weight || ''}
                onChange={(e) => setStep1Data(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Primary Goals (select up to 3) *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {GOAL_OPTIONS.map(goal => (
                <div
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`
                    flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${(step1Data.goals || []).includes(goal.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                    }
                  `}
                >
                  <Checkbox
                    checked={(step1Data.goals || []).includes(goal.id)}
                    onCheckedChange={() => toggleGoal(goal.id)}
                  />
                  <Label className="cursor-pointer flex-1 select-none">
                    {goal.label}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Selected: {step1Data.goals?.length || 0} / 3
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Available Equipment</CardTitle>
            <CardDescription>What equipment do you have access to?</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          { key: 'floor', label: '✅ Floor / Ground (bodyweight exercises)' },
          { key: 'pullUpBar', label: '🏋️ Pull-up Bar' },
          { key: 'rings', label: '⭕ Gymnastic Rings' },
          { key: 'parallelBars', label: '⚖️ Parallel Bars / Dip Station' },
          { key: 'resistanceBands', label: '💪 Resistance Bands' },
        ].map(item => (
          <div
            key={item.key}
            onClick={() => setStep2Data(prev => ({
              equipment: {
                ...prev.equipment,
                [item.key]: !prev.equipment[item.key as keyof typeof prev.equipment],
              },
            }))}
            className={`
              flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all
              ${step2Data.equipment[item.key as keyof typeof step2Data.equipment]
                ? 'border-green-500 bg-green-50'
                : 'border-slate-200 hover:border-green-300'
              }
            `}
          >
            <Checkbox
              checked={step2Data.equipment[item.key as keyof typeof step2Data.equipment]}
              onCheckedChange={() => {}}
            />
            <Label className="cursor-pointer flex-1 select-none font-medium">
              {item.label}
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card className="border-2 border-orange-200">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Fundamental Strength Test</CardTitle>
              <CardDescription>Be honest - this determines your starting point</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Push Tests */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="text-lg">💪</span> PUSH Test
            </h3>

            <div className="space-y-2">
              <Label>How many PUSH-UPS (regular) can you do in a row? *</Label>
              <RadioGroup
                value={step3Data.pushUps?.toString()}
                onValueChange={(val) => setStep3Data(prev => ({ ...prev, pushUps: parseInt(val) }))}
              >
                {[
                  { label: '0 (Cannot do any)', value: 0 },
                  { label: '1-5', value: 3 },
                  { label: '6-10', value: 8 },
                  { label: '11-20', value: 15 },
                  { label: '21-30', value: 25 },
                  { label: '31+', value: 35 },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    onClick={() => setStep3Data(prev => ({ ...prev, pushUps: option.value }))}
                  >
                    <RadioGroupItem value={option.value.toString()} id={`pushups-${option.value}`} />
                    <Label htmlFor={`pushups-${option.value}`} className="cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>How many DIPS (on bars) can you do? *</Label>
              <RadioGroup
                value={step3Data.dips?.toString()}
                onValueChange={(val) => setStep3Data(prev => ({ ...prev, dips: parseInt(val) }))}
              >
                {[
                  { label: '0 (Cannot do any)', value: 0 },
                  { label: '1-3', value: 2 },
                  { label: '4-8', value: 6 },
                  { label: '9-15', value: 12 },
                  { label: '16+', value: 18 },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    onClick={() => setStep3Data(prev => ({ ...prev, dips: option.value }))}
                  >
                    <RadioGroupItem value={option.value.toString()} id={`dips-${option.value}`} />
                    <Label htmlFor={`dips-${option.value}`} className="cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Pull Tests */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="text-lg">🎯</span> PULL Test
            </h3>

            <div className="space-y-2">
              <Label>How many PULL-UPS can you do in a row? *</Label>
              <RadioGroup
                value={step3Data.pullUps?.toString()}
                onValueChange={(val) => setStep3Data(prev => ({ ...prev, pullUps: parseInt(val) }))}
              >
                {[
                  { label: '0 (Cannot do any)', value: 0 },
                  { label: '1-3', value: 2 },
                  { label: '4-8', value: 6 },
                  { label: '9-15', value: 12 },
                  { label: '16-25', value: 20 },
                  { label: '26+', value: 28 },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    onClick={() => setStep3Data(prev => ({ ...prev, pullUps: option.value }))}
                  >
                    <RadioGroupItem value={option.value.toString()} id={`pullups-${option.value}`} />
                    <Label htmlFor={`pullups-${option.value}`} className="cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>How long can you DEAD HANG on a bar? *</Label>
              <RadioGroup
                value={step3Data.deadHangTime?.toString()}
                onValueChange={(val) => setStep3Data(prev => ({ ...prev, deadHangTime: parseInt(val) }))}
              >
                {[
                  { label: '0s (Cannot hold)', value: 0 },
                  { label: '1-15s', value: 10 },
                  { label: '16-30s', value: 23 },
                  { label: '31-60s', value: 45 },
                  { label: '60s+', value: 70 },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    onClick={() => setStep3Data(prev => ({ ...prev, deadHangTime: option.value }))}
                  >
                    <RadioGroupItem value={option.value.toString()} id={`deadhang-${option.value}`} />
                    <Label htmlFor={`deadhang-${option.value}`} className="cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Core Tests */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="text-lg">🔥</span> CORE Test
            </h3>

            <div className="space-y-2">
              <Label>How long can you hold a PLANK? *</Label>
              <RadioGroup
                value={step3Data.plankTime?.toString()}
                onValueChange={(val) => setStep3Data(prev => ({ ...prev, plankTime: parseInt(val) }))}
              >
                {[
                  { label: '0-15s', value: 10 },
                  { label: '16-30s', value: 23 },
                  { label: '31-60s', value: 45 },
                  { label: '61-90s', value: 75 },
                  { label: '91s+', value: 100 },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    onClick={() => setStep3Data(prev => ({ ...prev, plankTime: option.value }))}
                  >
                    <RadioGroupItem value={option.value.toString()} id={`plank-${option.value}`} />
                    <Label htmlFor={`plank-${option.value}`} className="cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Can you do a HOLLOW BODY HOLD? *</Label>
              <RadioGroup
                value={step3Data.hollowBodyHold?.toString()}
                onValueChange={(val) => setStep3Data(prev => ({ ...prev, hollowBodyHold: parseInt(val) }))}
              >
                {[
                  { label: "I don't know what that is", value: 0 },
                  { label: 'Yes, but less than 10s', value: 5 },
                  { label: 'Yes, 10-20s', value: 15 },
                  { label: 'Yes, 20-30s', value: 25 },
                  { label: 'Yes, 30s+', value: 35 },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    onClick={() => setStep3Data(prev => ({ ...prev, hollowBodyHold: option.value }))}
                  >
                    <RadioGroupItem value={option.value.toString()} id={`hollow-${option.value}`} />
                    <Label htmlFor={`hollow-${option.value}`} className="cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Legs Tests */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="text-lg">🦵</span> LEGS Test
            </h3>

            <div className="space-y-2">
              <Label>How many BODYWEIGHT SQUATS can you do in a row? *</Label>
              <RadioGroup
                value={step3Data.squats?.toString()}
                onValueChange={(val) => setStep3Data(prev => ({ ...prev, squats: parseInt(val) }))}
              >
                {[
                  { label: '0-10', value: 5 },
                  { label: '11-20', value: 15 },
                  { label: '21-40', value: 30 },
                  { label: '41-60', value: 50 },
                  { label: '61+', value: 70 },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    onClick={() => setStep3Data(prev => ({ ...prev, squats: option.value }))}
                  >
                    <RadioGroupItem value={option.value.toString()} id={`squats-${option.value}`} />
                    <Label htmlFor={`squats-${option.value}`} className="cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Can you do a PISTOL SQUAT (single-leg squat)? *</Label>
              <RadioGroup
                value={step3Data.pistolSquat}
                onValueChange={(val) => setStep3Data(prev => ({
                  ...prev,
                  pistolSquat: val as AssessmentStep3Data['pistolSquat']
                }))}
              >
                {[
                  { label: 'No', value: 'no' },
                  { label: 'Assisted (with support)', value: 'assisted' },
                  { label: 'Yes, 1-3 per leg', value: '1-3' },
                  { label: 'Yes, 4-8 per leg', value: '4-8' },
                  { label: 'Yes, 9+ per leg', value: '9+' },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    onClick={() => setStep3Data(prev => ({
                      ...prev,
                      pistolSquat: option.value as AssessmentStep3Data['pistolSquat']
                    }))}
                  >
                    <RadioGroupItem value={option.value} id={`pistol-${option.value}`} />
                    <Label htmlFor={`pistol-${option.value}`} className="cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-slate-700 flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-blue-700">💡 Important:</strong> Answer honestly! If you show good strength here,
              we'll ask about advanced skills next. Otherwise, we'll create a beginner-friendly plan.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Advanced Skills Test</CardTitle>
              <CardDescription>You showed great strength! Let's check your skills</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Handstand */}
          <div className="space-y-2">
            <Label>Can you hold a HANDSTAND? *</Label>
            <RadioGroup
              value={step4Data.handstand}
              onValueChange={(val) => setStep4Data(prev => ({
                ...prev,
                handstand: val as AssessmentStep4Data['handstand']
              }))}
            >
              {[
                { label: 'No', value: 'no' },
                { label: 'Against the wall (5-15s)', value: 'wall_5-15s' },
                { label: 'Against the wall (15-60s)', value: 'wall_15-60s' },
                { label: 'Freestanding (5-15s)', value: 'freestanding_5-15s' },
                { label: 'Freestanding (15s+)', value: 'freestanding_15s+' },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                  onClick={() => setStep4Data(prev => ({
                    ...prev,
                    handstand: option.value as AssessmentStep4Data['handstand']
                  }))}
                >
                  <RadioGroupItem value={option.value} id={`hs-${option.value}`} />
                  <Label htmlFor={`hs-${option.value}`} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Front Lever */}
          <div className="space-y-2 pt-4 border-t">
            <Label>Can you hold a FRONT LEVER? *</Label>
            <RadioGroup
              value={step4Data.frontLever}
              onValueChange={(val) => setStep4Data(prev => ({
                ...prev,
                frontLever: val as AssessmentStep4Data['frontLever']
              }))}
            >
              {[
                { label: "No / Don't know what it is", value: 'no' },
                { label: 'Tuck Front Lever (5-10s)', value: 'tuck_5-10s' },
                { label: 'Advanced Tuck Front Lever (5-10s)', value: 'adv_tuck_5-10s' },
                { label: 'Straddle Front Lever (3-8s)', value: 'straddle_3-8s' },
                { label: 'One-Leg Front Lever (3-8s)', value: 'one_leg_3-8s' },
                { label: 'Full Front Lever (3s+)', value: 'full_3s+' },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                  onClick={() => setStep4Data(prev => ({
                    ...prev,
                    frontLever: option.value as AssessmentStep4Data['frontLever']
                  }))}
                >
                  <RadioGroupItem value={option.value} id={`fl-${option.value}`} />
                  <Label htmlFor={`fl-${option.value}`} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Planche */}
          <div className="space-y-2 pt-4 border-t">
            <Label>Can you hold a PLANCHE? *</Label>
            <RadioGroup
              value={step4Data.planche}
              onValueChange={(val) => setStep4Data(prev => ({
                ...prev,
                planche: val as AssessmentStep4Data['planche']
              }))}
            >
              {[
                { label: "No / Don't know what it is", value: 'no' },
                { label: 'Frog Stand / Tuck Planche (5-10s)', value: 'frog_tuck_5-10s' },
                { label: 'Advanced Tuck Planche (5-10s)', value: 'adv_tuck_5-10s' },
                { label: 'Straddle Planche (3-8s)', value: 'straddle_3-8s' },
                { label: 'Full Planche (3s+)', value: 'full_3s+' },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                  onClick={() => setStep4Data(prev => ({
                    ...prev,
                    planche: option.value as AssessmentStep4Data['planche']
                  }))}
                >
                  <RadioGroupItem value={option.value} id={`pl-${option.value}`} />
                  <Label htmlFor={`pl-${option.value}`} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* L-Sit */}
          <div className="space-y-2 pt-4 border-t">
            <Label>Can you hold an L-SIT? *</Label>
            <RadioGroup
              value={step4Data.lSit}
              onValueChange={(val) => setStep4Data(prev => ({
                ...prev,
                lSit: val as AssessmentStep4Data['lSit']
              }))}
            >
              {[
                { label: 'No', value: 'no' },
                { label: 'Tuck L-Sit (10-20s)', value: 'tuck_10-20s' },
                { label: 'L-Sit with bent legs (10-20s)', value: 'bent_legs_10-20s' },
                { label: 'Full L-Sit (10-20s)', value: 'full_10-20s' },
                { label: 'Full L-Sit 20s+ or V-Sit', value: 'full_20s+_or_vsit' },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                  onClick={() => setStep4Data(prev => ({
                    ...prev,
                    lSit: option.value as AssessmentStep4Data['lSit']
                  }))}
                >
                  <RadioGroupItem value={option.value} id={`lsit-${option.value}`} />
                  <Label htmlFor={`lsit-${option.value}`} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Muscle-up */}
          <div className="space-y-2 pt-4 border-t">
            <Label>Can you do a MUSCLE-UP? *</Label>
            <RadioGroup
              value={step4Data.muscleUp}
              onValueChange={(val) => setStep4Data(prev => ({
                ...prev,
                muscleUp: val as AssessmentStep4Data['muscleUp']
              }))}
            >
              {[
                { label: 'No', value: 'no' },
                { label: 'With kipping (momentum)', value: 'kipping' },
                { label: 'Strict (clean, 1-3 reps)', value: 'strict_1-3' },
                { label: 'Strict (clean, 4+ reps)', value: 'strict_4+' },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                  onClick={() => setStep4Data(prev => ({
                    ...prev,
                    muscleUp: option.value as AssessmentStep4Data['muscleUp']
                  }))}
                >
                  <RadioGroupItem value={option.value} id={`mu-${option.value}`} />
                  <Label htmlFor={`mu-${option.value}`} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Archer Pull-up */}
          <div className="space-y-2 pt-4 border-t">
            <Label>Can you do ARCHER PULL-UPS? *</Label>
            <RadioGroup
              value={step4Data.archerPullUp}
              onValueChange={(val) => setStep4Data(prev => ({
                ...prev,
                archerPullUp: val as AssessmentStep4Data['archerPullUp']
              }))}
            >
              {[
                { label: 'No', value: 'no' },
                { label: 'Assisted', value: 'assisted' },
                { label: 'Full (3-5 each side)', value: 'full_3-5_each' },
                { label: 'Full (6+ each side)', value: 'full_6+_each' },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                  onClick={() => setStep4Data(prev => ({
                    ...prev,
                    archerPullUp: option.value as AssessmentStep4Data['archerPullUp']
                  }))}
                >
                  <RadioGroupItem value={option.value} id={`archer-${option.value}`} />
                  <Label htmlFor={`archer-${option.value}`} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* One-Arm Pull-up */}
          <div className="space-y-2 pt-4 border-t">
            <Label>Can you do a ONE-ARM PULL-UP? *</Label>
            <RadioGroup
              value={step4Data.oneArmPullUp}
              onValueChange={(val) => setStep4Data(prev => ({
                ...prev,
                oneArmPullUp: val as AssessmentStep4Data['oneArmPullUp']
              }))}
            >
              {[
                { label: 'No', value: 'no' },
                { label: 'With band assistance', value: 'band_assisted' },
                { label: 'Yes, 1 clean rep', value: '1_rep_clean' },
                { label: 'Yes, 2+ reps', value: '2+_reps' },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                  onClick={() => setStep4Data(prev => ({
                    ...prev,
                    oneArmPullUp: option.value as AssessmentStep4Data['oneArmPullUp']
                  }))}
                >
                  <RadioGroupItem value={option.value} id={`oap-${option.value}`} />
                  <Label htmlFor={`oap-${option.value}`} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* HSPU */}
          <div className="space-y-2 pt-4 border-t">
            <Label>Can you do HANDSTAND PUSH-UPS? *</Label>
            <RadioGroup
              value={step4Data.handstandPushUp}
              onValueChange={(val) => setStep4Data(prev => ({
                ...prev,
                handstandPushUp: val as AssessmentStep4Data['handstandPushUp']
              }))}
            >
              {[
                { label: 'No', value: 'no' },
                { label: 'With wall, partial range', value: 'partial_wall' },
                { label: 'With wall, full range (1-5 reps)', value: 'full_wall_1-5' },
                { label: 'With wall, full range (6+ reps)', value: 'full_wall_6+' },
                { label: 'Freestanding', value: 'freestanding' },
              ].map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                  onClick={() => setStep4Data(prev => ({
                    ...prev,
                    handstandPushUp: option.value as AssessmentStep4Data['handstandPushUp']
                  }))}
                >
                  <RadioGroupItem value={option.value} id={`hspu-${option.value}`} />
                  <Label htmlFor={`hspu-${option.value}`} className="cursor-pointer flex-1">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-purple-50/50 border-purple-200">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-slate-700 flex items-start gap-2">
            <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-purple-700">🎯 Almost done!</strong> These advanced skills help us fine-tune
              your training plan and give you the most accurate starting point.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm text-slate-600">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Render current step */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}

      {/* Navigation */}
      <div className="flex justify-between items-center gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="min-w-[120px]"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={
            (currentStep === 1 && !isStep1Valid()) ||
            (currentStep === 2 && !isStep2Valid()) ||
            (currentStep === 3 && !isStep3Valid())
          }
          className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
        >
          {currentStep === 3 && !shouldShowStep4(step3Data as AssessmentStep3Data) ? (
            <>
              Complete
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </>
          ) : currentStep === 4 ? (
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
    </div>
  );
}
