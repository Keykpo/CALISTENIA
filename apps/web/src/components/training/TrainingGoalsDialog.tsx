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
import { Card } from '@/components/ui/card';
import { Clock, Zap } from 'lucide-react';

interface TrainingGoalsDialogProps {
  open: boolean;
  onComplete: (duration: number) => void;
  defaultDuration?: number; // 🆕 Pre-select last used duration
}

// Simplified - only duration is needed now
// Goal will be inferred automatically from user's sublevel
export interface TrainingGoal {
  duration: number; // in minutes
}

// Simplified duration options - only thing we ask now
const DURATION_OPTIONS = [
  {
    value: 20,
    label: '20 minutes',
    description: 'Quick and focused session',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    value: 30,
    label: '30 minutes',
    description: 'Balanced workout - great for beginners',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    value: 45,
    label: '45 minutes',
    description: 'Complete session with warm-up and cool-down',
    icon: Clock,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    value: 60,
    label: '1 hour',
    description: 'Intensive training - recommended',
    icon: Clock,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    value: 90,
    label: '1.5 hours',
    description: 'Extended session for advanced athletes',
    icon: Clock,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  {
    value: 120,
    label: '2 hours',
    description: 'Maximum duration for expert training',
    icon: Clock,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
  },
];

export function TrainingGoalsDialog({ open, onComplete, defaultDuration = 60 }: TrainingGoalsDialogProps) {
  const [selectedDuration, setSelectedDuration] = useState<number>(defaultDuration); // 🆕 Use last duration or default to 60min

  const handleComplete = () => {
    // Simply return the selected duration
    // The parent component will infer the goal automatically
    onComplete(selectedDuration);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            How much time do you have for workouts?
          </DialogTitle>
          <DialogDescription>
            Select your preferred workout duration. We'll automatically personalize your training goals based on your current level.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup
            value={selectedDuration.toString()}
            onValueChange={(v) => setSelectedDuration(parseInt(v))}
          >
            <div className="grid gap-3">
              {DURATION_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <label key={option.value} htmlFor={`duration-${option.value}`} className="cursor-pointer">
                    <Card
                      className={`p-4 transition-all ${
                        selectedDuration === option.value
                          ? `${option.bgColor} border-2 ${option.borderColor}`
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value={option.value.toString()} id={`duration-${option.value}`} />
                        <div className={`p-2 rounded-lg ${option.bgColor}`}>
                          <Icon className={`w-5 h-5 ${option.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{option.label}</h3>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </div>
                    </Card>
                  </label>
                );
              })}
            </div>
          </RadioGroup>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-900">
              <strong>✨ Smart Goal Selection:</strong> Your training goals will be automatically determined based on your current fitness level. No need to guess!
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleComplete} size="lg" className="px-8">
              Start Training
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
