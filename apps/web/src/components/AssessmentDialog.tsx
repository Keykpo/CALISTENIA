'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';
import { MasteryGoal } from '@/lib/fig-level-progressions';
import {
  SKILL_ASSESSMENTS,
  calculateLevelFromScore,
  getMaxScore,
} from '@/lib/skill-assessments';

interface AssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillBranch: MasteryGoal;
  skillName: string;
  onComplete: (level: string, score: number) => void;
}

export default function AssessmentDialog({
  open,
  onOpenChange,
  skillBranch,
  skillName,
  onComplete,
}: AssessmentDialogProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = SKILL_ASSESSMENTS[skillBranch];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleSelectAnswer = (points: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = points;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const totalScore = answers.reduce((sum, score) => sum + score, 0);
    const level = calculateLevelFromScore(totalScore);

    await onComplete(level, totalScore);

    // Reset for next time
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsSubmitting(false);
  };

  const canProceed = answers[currentQuestionIndex] !== undefined;
  const canSubmit = answers.length === totalQuestions && answers.every(a => a !== undefined);

  const selectedAnswer = answers[currentQuestionIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {skillName} Assessment
          </DialogTitle>
          <DialogDescription>
            Answer these {totalQuestions} questions to determine your current level
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-6">
                {currentQuestion.question}
              </h3>

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option.points;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(option.points)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-start gap-3 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{option.text}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {option.points} {option.points === 1 ? 'point' : 'points'}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
            >
              Back
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalQuestions }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx < currentQuestionIndex
                      ? 'bg-blue-600'
                      : idx === currentQuestionIndex
                      ? 'bg-blue-400'
                      : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
