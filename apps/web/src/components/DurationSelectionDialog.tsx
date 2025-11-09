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
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Clock } from 'lucide-react';
import { DifficultyLevel } from '@/lib/fig-level-progressions';
import { calculateXP } from '@/lib/xp-calculator';
import { getDurationCategory } from '@/lib/training-generator';

interface DurationSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillName: string;
  userLevel: DifficultyLevel;
  onStartTraining: (duration: number) => void;
}

const QUICK_SELECT_DURATIONS = [20, 30, 45, 60, 90, 120];

export default function DurationSelectionDialog({
  open,
  onOpenChange,
  skillName,
  userLevel,
  onStartTraining,
}: DurationSelectionDialogProps) {
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [isStarting, setIsStarting] = useState(false);

  const handleSliderChange = (value: number[]) => {
    setSelectedDuration(value[0]);
  };

  const handleQuickSelect = (duration: number) => {
    setSelectedDuration(duration);
  };

  const handleStartTraining = async () => {
    setIsStarting(true);
    await onStartTraining(selectedDuration);
    setIsStarting(false);
  };

  const category = getDurationCategory(selectedDuration);
  const estimatedXP = calculateXP(selectedDuration, userLevel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Choose Your Training Duration
          </DialogTitle>
          <DialogDescription>
            Select how long you want to train for {skillName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Main duration display */}
          <div className="text-center">
            <div className="text-7xl font-bold text-blue-600 mb-2">
              {selectedDuration}
            </div>
            <div className="text-2xl text-slate-600">minutes</div>
          </div>

          {/* Slider */}
          <div className="px-2">
            <Slider
              min={10}
              max={120}
              step={10}
              value={[selectedDuration]}
              onValueChange={handleSliderChange}
              className="mb-6"
            />
            <div className="flex justify-between text-xs text-slate-500 px-1">
              <span>10 min</span>
              <span>60 min</span>
              <span>120 min</span>
            </div>
          </div>

          {/* Quick select buttons */}
          <div>
            <p className="text-sm text-slate-600 mb-3">Quick Select:</p>
            <div className="grid grid-cols-6 gap-2">
              {QUICK_SELECT_DURATIONS.map((duration) => (
                <Button
                  key={duration}
                  variant={selectedDuration === duration ? 'default' : 'outline'}
                  onClick={() => handleQuickSelect(duration)}
                  className="text-sm"
                >
                  {duration}
                </Button>
              ))}
            </div>
          </div>

          {/* Training info card */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{category.icon}</div>
                  <div>
                    <p className="font-bold text-lg text-slate-900">
                      {category.label}
                    </p>
                    <p className="text-sm text-slate-600">
                      {category.description}
                    </p>
                  </div>
                </div>
                <Badge className="text-lg px-4 py-2 bg-blue-600">
                  +{estimatedXP} XP
                </Badge>
              </div>

              {/* Session breakdown */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  What's included:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span>Skill-specific practice</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span>Strength training</span>
                  </div>
                  {selectedDuration > 30 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <span>Conditioning work</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span>Warm-up & cooldown</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start button */}
          <Button
            onClick={handleStartTraining}
            className="w-full h-14 text-lg"
            disabled={isStarting}
          >
            {isStarting ? 'Starting Training...' : 'Start Training'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
