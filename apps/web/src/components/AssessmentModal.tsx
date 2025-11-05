'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Target, Zap, Trophy, Rocket } from 'lucide-react';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const goals = [
  {
    id: 'tuck_planche',
    name: 'Tuck Planche',
    description: 'Dominar la plancha con rodillas al pecho',
    difficulty: 'INTERMEDIATE',
    estimatedWeeks: 12,
    icon: '🦸',
    skillName: 'Tuck Planche',
  },
  {
    id: 'handstand',
    name: 'Parada de Manos',
    description: 'Mantener el equilibrio en posición vertical',
    difficulty: 'INTERMEDIATE',
    estimatedWeeks: 8,
    icon: '🤸',
    skillName: 'Parada de Manos Libre',
  },
  {
    id: 'muscle_up',
    name: 'Muscle-Up',
    description: 'Combinar dominada y fondo en un solo movimiento',
    difficulty: 'ADVANCED',
    estimatedWeeks: 16,
    icon: '💪',
    skillName: 'Muscle-Up Completo',
  },
  {
    id: 'front_lever',
    name: 'Front Lever',
    description: 'Mantener el cuerpo horizontal colgado de barra',
    difficulty: 'ADVANCED',
    estimatedWeeks: 20,
    icon: '🏋️',
    skillName: 'Full Front Lever',
  },
  {
    id: 'one_arm_pushup',
    name: 'Flexión a Una Mano',
    description: 'Realizar flexiones con un solo brazo',
    difficulty: 'ADVANCED',
    estimatedWeeks: 14,
    icon: '🔥',
    skillName: 'Flexiones a Una Mano',
  },
  {
    id: 'general_strength',
    name: 'Fuerza General',
    description: 'Mejorar fuerza y condición física general',
    difficulty: 'BEGINNER',
    estimatedWeeks: 8,
    icon: '⚡',
    skillName: null,
  },
];

const fitnessLevels = [
  {
    value: 'BEGINNER',
    label: 'Principiante',
    description: 'Puedo hacer 0-5 flexiones',
  },
  {
    value: 'INTERMEDIATE',
    label: 'Intermedio',
    description: 'Puedo hacer 6-15 flexiones',
  },
  {
    value: 'ADVANCED',
    label: 'Avanzado',
    description: 'Puedo hacer 16-30 flexiones',
  },
  {
    value: 'EXPERT',
    label: 'Experto',
    description: 'Puedo hacer 30+ flexiones',
  },
];

export default function AssessmentModal({ isOpen, onClose, onComplete }: AssessmentModalProps) {
  const [step, setStep] = useState(1);
  const [fitnessLevel, setFitnessLevel] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fitnessLevel || !selectedGoal) {
      toast.error('Por favor completa todos los pasos');
      return;
    }

    setIsLoading(true);

    try {
      // Save fitness level
      const levelResponse = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fitnessLevel,
          hasCompletedAssessment: true,
          assessmentDate: new Date().toISOString(),
        }),
      });

      if (!levelResponse.ok) {
        throw new Error('Error al guardar nivel de fitness');
      }

      // Create training goal
      const goal = goals.find(g => g.id === selectedGoal);
      const goalResponse = await fetch('/api/user/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: goal?.name,
          description: goal?.description,
          difficulty: goal?.difficulty,
          estimatedWeeks: goal?.estimatedWeeks,
          skillName: goal?.skillName,
        }),
      });

      if (!goalResponse.ok) {
        throw new Error('Error al crear objetivo');
      }

      toast.success('¡Evaluación completada!', {
        description: 'Hemos creado un plan de entrenamiento personalizado para ti',
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar la evaluación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Rocket className="h-6 w-6 text-blue-600" />
            Evaluación Inicial
          </DialogTitle>
          <DialogDescription>
            Paso {step} de 2 - Ayúdanos a personalizar tu entrenamiento
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                ¿Cuál es tu nivel actual?
              </h3>
              <RadioGroup value={fitnessLevel} onValueChange={setFitnessLevel}>
                <div className="grid gap-3">
                  {fitnessLevels.map((level) => (
                    <Label
                      key={level.value}
                      htmlFor={level.value}
                      className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                        fitnessLevel === level.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <RadioGroupItem value={level.value} id={level.value} />
                      <div className="flex-1">
                        <div className="font-medium">{level.label}</div>
                        <div className="text-sm text-gray-500">{level.description}</div>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={() => setStep(2)} disabled={!fitnessLevel}>
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                ¿Cuál es tu objetivo principal?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((goal) => (
                  <Card
                    key={goal.id}
                    className={`cursor-pointer transition-all ${
                      selectedGoal === goal.id
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedGoal(goal.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{goal.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold">{goal.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {goal.difficulty}
                            </span>
                            <span>~{goal.estimatedWeeks} semanas</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Atrás
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedGoal || isLoading}
                >
                  {isLoading ? 'Guardando...' : 'Completar Evaluación'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
