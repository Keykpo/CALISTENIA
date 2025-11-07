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
  // EMPUJE (Push)
  {
    id: 'push_pushups',
    branch: 'EMPUJE',
    question: '¿Cuántas flexiones (push-ups) consecutivas puedes hacer con buena forma?',
    options: [
      { value: '0', label: '0-5 flexiones', score: 1 },
      { value: '5', label: '6-15 flexiones', score: 2 },
      { value: '15', label: '16-30 flexiones', score: 3 },
      { value: '30', label: '30+ flexiones', score: 4 },
    ],
  },
  {
    id: 'push_dips',
    branch: 'EMPUJE',
    question: '¿Puedes hacer dips (fondos en paralelas)?',
    options: [
      { value: 'no', label: 'No puedo hacer ninguno', score: 1 },
      { value: 'assisted', label: 'Solo con ayuda/banda', score: 2 },
      { value: 'few', label: '1-10 repeticiones', score: 3 },
      { value: 'many', label: '10+ repeticiones', score: 4 },
    ],
  },
  // TRACCION (Pull)
  {
    id: 'pull_pullups',
    branch: 'TRACCION',
    question: '¿Cuántas dominadas (pull-ups) consecutivas puedes hacer?',
    options: [
      { value: '0', label: 'No puedo hacer ninguna', score: 1 },
      { value: 'assisted', label: 'Solo con ayuda/banda', score: 2 },
      { value: 'few', label: '1-5 dominadas', score: 3 },
      { value: 'many', label: '6+ dominadas', score: 4 },
    ],
  },
  {
    id: 'pull_rows',
    branch: 'TRACCION',
    question: '¿Puedes hacer remos horizontales (rows)?',
    options: [
      { value: 'no', label: 'No puedo hacerlos', score: 1 },
      { value: 'few', label: '1-10 repeticiones', score: 2 },
      { value: 'moderate', label: '11-20 repeticiones', score: 3 },
      { value: 'many', label: '20+ repeticiones', score: 4 },
    ],
  },
  // CORE
  {
    id: 'core_plank',
    branch: 'CORE',
    question: '¿Cuánto tiempo puedes mantener una plancha (plank) con buena forma?',
    options: [
      { value: '0', label: 'Menos de 30 segundos', score: 1 },
      { value: '30', label: '30-60 segundos', score: 2 },
      { value: '60', label: '60-90 segundos', score: 3 },
      { value: '90', label: '90+ segundos', score: 4 },
    ],
  },
  {
    id: 'core_leg_raises',
    branch: 'CORE',
    question: '¿Puedes hacer elevaciones de piernas colgado (hanging leg raises)?',
    options: [
      { value: 'no', label: 'No puedo hacerlas', score: 1 },
      { value: 'knee', label: 'Solo con rodillas dobladas', score: 2 },
      { value: 'few', label: 'Piernas rectas, 1-5 reps', score: 3 },
      { value: 'many', label: 'Piernas rectas, 6+ reps', score: 4 },
    ],
  },
  // EQUILIBRIO (Balance)
  {
    id: 'balance_handstand',
    branch: 'EQUILIBRIO',
    question: '¿Puedes hacer un handstand (parada de manos)?',
    options: [
      { value: 'no', label: 'No puedo hacerlo', score: 1 },
      { value: 'wall', label: 'Solo contra la pared', score: 2 },
      { value: 'freestanding_short', label: 'Sin pared, menos de 10s', score: 3 },
      { value: 'freestanding_long', label: 'Sin pared, 10+ segundos', score: 4 },
    ],
  },
  {
    id: 'balance_lsit',
    branch: 'EQUILIBRIO',
    question: '¿Puedes hacer un L-sit?',
    options: [
      { value: 'no', label: 'No puedo levantarme del suelo', score: 1 },
      { value: 'tuck', label: 'Solo tuck L-sit (rodillas dobladas)', score: 2 },
      { value: 'short', label: 'L-sit completo, menos de 10s', score: 3 },
      { value: 'long', label: 'L-sit completo, 10+ segundos', score: 4 },
    ],
  },
  // TREN INFERIOR (Lower Body)
  {
    id: 'legs_squats',
    branch: 'TREN_INFERIOR',
    question: '¿Cuántas sentadillas (squats) consecutivas puedes hacer?',
    options: [
      { value: '0', label: '0-10 sentadillas', score: 1 },
      { value: '10', label: '11-25 sentadillas', score: 2 },
      { value: '25', label: '26-50 sentadillas', score: 3 },
      { value: '50', label: '50+ sentadillas', score: 4 },
    ],
  },
  {
    id: 'legs_pistol',
    branch: 'TREN_INFERIOR',
    question: '¿Puedes hacer sentadillas a una pierna (pistol squats)?',
    options: [
      { value: 'no', label: 'No puedo hacerlas', score: 1 },
      { value: 'assisted', label: 'Solo con ayuda', score: 2 },
      { value: 'few', label: '1-3 por pierna', score: 3 },
      { value: 'many', label: '4+ por pierna', score: 4 },
    ],
  },
  // ESTATICOS (Statics/Skills)
  {
    id: 'static_front_lever',
    branch: 'ESTATICOS',
    question: '¿Puedes hacer un front lever o alguna progresión?',
    options: [
      { value: 'no', label: 'No puedo hacer ninguna progresión', score: 1 },
      { value: 'tuck', label: 'Tuck front lever (rodillas al pecho)', score: 2 },
      { value: 'advanced_tuck', label: 'Advanced tuck o one leg', score: 3 },
      { value: 'full', label: 'Front lever completo', score: 4 },
    ],
  },
  {
    id: 'static_planche',
    branch: 'ESTATICOS',
    question: '¿Puedes hacer un planche o alguna progresión?',
    options: [
      { value: 'no', label: 'No puedo hacer ninguna progresión', score: 1 },
      { value: 'tuck', label: 'Tuck planche', score: 2 },
      { value: 'advanced_tuck', label: 'Advanced tuck o straddle', score: 3 },
      { value: 'full', label: 'Full planche', score: 4 },
    ],
  },
];

const GOAL_OPTIONS = [
  { value: 'strength', label: 'Ganar Fuerza General', icon: '💪' },
  { value: 'muscle', label: 'Ganar Masa Muscular', icon: '🏋️' },
  { value: 'fat_loss', label: 'Perder Grasa', icon: '🔥' },
  { value: 'front_lever', label: 'Lograr Front Lever', icon: '🦅' },
  { value: 'planche', label: 'Lograr Planche', icon: '🕊️' },
  { value: 'handstand', label: 'Dominar Handstand', icon: '🤸' },
  { value: 'muscle_up', label: 'Lograr Muscle-Up', icon: '⚡' },
  { value: 'general', label: 'Fitness General', icon: '✨' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Principiante (0-6 meses)', score: 1 },
  { value: 'intermediate', label: 'Intermedio (6 meses - 2 años)', score: 2 },
  { value: 'advanced', label: 'Avanzado (2+ años)', score: 3 },
  { value: 'expert', label: 'Experto (5+ años)', score: 4 },
];

const AVAILABILITY_OPTIONS = [
  { value: '2-3', label: '2-3 días por semana', multiplier: 0.7 },
  { value: '4-5', label: '4-5 días por semana', multiplier: 1.0 },
  { value: '6-7', label: '6-7 días por semana', multiplier: 1.2 },
];

interface AssessmentFormProps {
  onComplete: (results: AssessmentResults) => void;
  userId: string;
}

export interface AssessmentResults {
  userId: string;
  answers: Record<string, string>;
  scores: {
    EMPUJE: number;
    TRACCION: number;
    CORE: number;
    EQUILIBRIO: number;
    TREN_INFERIOR: number;
    ESTATICOS: number;
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
      EMPUJE: 0,
      TRACCION: 0,
      CORE: 0,
      EQUILIBRIO: 0,
      TREN_INFERIOR: 0,
      ESTATICOS: 0,
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

    // Normalize scores (divide by number of questions per branch)
    const questionCounts = {
      EMPUJE: 2,
      TRACCION: 2,
      CORE: 2,
      EQUILIBRIO: 2,
      TREN_INFERIOR: 2,
      ESTATICOS: 2,
    };

    Object.keys(scores).forEach((branch) => {
      const key = branch as keyof typeof scores;
      scores[key] = scores[key] / questionCounts[key];
    });

    return scores;
  };

  const determineOverallLevel = (
    scores: Record<string, number>,
    exp: string
  ): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' => {
    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;

    // Adjust based on experience
    const expScore = EXPERIENCE_OPTIONS.find((e) => e.value === exp)?.score || 1;
    const adjustedScore = (avgScore + expScore) / 2;

    if (adjustedScore <= 1.5) return 'BEGINNER';
    if (adjustedScore <= 2.5) return 'INTERMEDIATE';
    if (adjustedScore <= 3.5) return 'ADVANCED';
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
              <span className="text-sm font-medium text-blue-600">
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
              <span className="text-sm font-medium text-blue-600">
                OBJETIVO PRINCIPAL
              </span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">
              ¿Cuál es tu objetivo principal?
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
              <span className="text-sm font-medium text-blue-600">
                EXPERIENCIA
              </span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">
              ¿Cuánta experiencia tienes con calistenia?
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
              <span className="text-sm font-medium text-blue-600">
                DISPONIBILIDAD
              </span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">
              ¿Cuántos días a la semana puedes entrenar?
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
              <CardTitle>Evaluación de Nivel</CardTitle>
              <CardDescription>
                Paso {step + 1} de {totalSteps}
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
              Anterior
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {step === totalSteps - 1 ? (
                <>
                  Completar
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Siguiente
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
