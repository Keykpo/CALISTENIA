'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';

interface DurationSelectorButtonProps {
  currentDuration: number;
  onDurationChange: (duration: number) => void;
}

const DURATION_OPTIONS = [
  { value: 20, label: '20 minutos', description: 'Sesión rápida y enfocada' },
  { value: 30, label: '30 minutos', description: 'Entrenamiento balanceado' },
  { value: 45, label: '45 minutos', description: 'Sesión completa' },
  { value: 60, label: '1 hora', description: 'Entrenamiento intensivo' },
  { value: 90, label: '1.5 horas', description: 'Sesión extendida' },
  { value: 120, label: '2 horas', description: 'Entrenamiento avanzado' },
];

export function DurationSelectorButton({ currentDuration, onDurationChange }: DurationSelectorButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(currentDuration);
  const [saving, setSaving] = useState(false);

  const currentOption = DURATION_OPTIONS.find(opt => opt.value === currentDuration);

  const handleSave = async () => {
    if (selectedDuration === currentDuration) {
      setOpen(false);
      return;
    }

    setSaving(true);
    try {
      // Update duration in backend
      const response = await fetch('/api/training/goals/duration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: selectedDuration }),
      });

      const data = await response.json();

      if (data.success) {
        onDurationChange(selectedDuration);
        toast.success('Duración actualizada. Tu próxima rutina se adaptará automáticamente.');
        setOpen(false);
      } else {
        toast.error('Error al actualizar la duración');
      }
    } catch (error) {
      console.error('Error updating duration:', error);
      toast.error('Error al actualizar la duración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Clock className="w-4 h-4" />
        <span className="hidden sm:inline">{currentOption?.label || `${currentDuration} min`}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Tiempo de Entrenamiento</DialogTitle>
            <DialogDescription>
              Cambia la duración de tus entrenamientos. La rutina se adaptará automáticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <RadioGroup
              value={selectedDuration.toString()}
              onValueChange={(v) => setSelectedDuration(parseInt(v))}
            >
              <div className="grid gap-3">
                {DURATION_OPTIONS.map((option) => (
                  <label key={option.value} htmlFor={`dur-${option.value}`} className="cursor-pointer">
                    <Card
                      className={`p-4 transition-all ${
                        selectedDuration === option.value
                          ? 'bg-blue-50 border-2 border-blue-300'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value={option.value.toString()} id={`dur-${option.value}`} />
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
              <Button
                onClick={() => setOpen(false)}
                variant="outline"
                size="lg"
                className="flex-1"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                size="lg"
                className="flex-1"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar y Aplicar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
