'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';

interface ExerciseFormData {
  name: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  calories: number;
  muscleGroups: string[];
  equipment: string[];
  instructions: string[];
  thumbnailUrl: string;
}

const CATEGORIES = [
  { value: 'strength', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibilidad' },
  { value: 'balance', label: 'Equilibrio' },
  { value: 'endurance', label: 'Resistencia' },
];

const DIFFICULTIES = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

const MUSCLE_GROUPS = [
  'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Abdominales',
  'Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Pantorrillas', 'Core',
  'Antebrazos', 'Trapecio', 'Dorsales', 'Oblicuos'
];

const EQUIPMENT_OPTIONS = [
  'Sin equipo', 'Mancuernas', 'Barra', 'Kettlebell', 'Banda elástica',
  'Pelota de ejercicio', 'Colchoneta', 'Barra de dominadas', 'TRX',
  'Cuerda de saltar', 'Banco', 'Máquina de cable'
];

export default function NewExercisePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newMuscleGroup, setNewMuscleGroup] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [newInstruction, setNewInstruction] = useState('');

  const [formData, setFormData] = useState<ExerciseFormData>({
    name: '',
    description: '',
    category: '',
    difficulty: '',
    duration: 0,
    calories: 0,
    muscleGroups: [],
    equipment: [],
    instructions: [],
    thumbnailUrl: '',
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  const handleInputChange = (field: keyof ExerciseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addMuscleGroup = (muscleGroup: string) => {
    if (muscleGroup && !formData.muscleGroups.includes(muscleGroup)) {
      setFormData(prev => ({
        ...prev,
        muscleGroups: [...prev.muscleGroups, muscleGroup]
      }));
    }
  };

  const removeMuscleGroup = (muscleGroup: string) => {
    setFormData(prev => ({
      ...prev,
      muscleGroups: prev.muscleGroups.filter(mg => mg !== muscleGroup)
    }));
  };

  const addEquipment = (equipment: string) => {
    if (equipment && !formData.equipment.includes(equipment)) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, equipment]
      }));
    }
  };

  const removeEquipment = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter(eq => eq !== equipment)
    }));
  };

  const addInstruction = () => {
    if (newInstruction.trim()) {
      setFormData(prev => ({
        ...prev,
        instructions: [...prev.instructions, newInstruction.trim()]
      }));
      setNewInstruction('');
    }
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al crear el ejercicio');
      }

      router.push('/admin/exercises');
    } catch (error) {
      console.error('Error:', error);
      setError('Error al crear el ejercicio. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Crear Nuevo Ejercicio</h1>
          <p className="text-muted-foreground mt-2">
            Completa la información del ejercicio
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Datos principales del ejercicio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Ejercicio *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Flexiones de pecho"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl">URL de Imagen</Label>
                <Input
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe el ejercicio y sus beneficios..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Dificultad *</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => handleInputChange('difficulty', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((difficulty) => (
                      <SelectItem key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duración (minutos) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration || ''}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  placeholder="30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calories">Calorías Estimadas *</Label>
                <Input
                  id="calories"
                  type="number"
                  min="1"
                  value={formData.calories || ''}
                  onChange={(e) => handleInputChange('calories', parseInt(e.target.value) || 0)}
                  placeholder="150"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grupos Musculares</CardTitle>
            <CardDescription>
              Selecciona los grupos musculares que trabaja este ejercicio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((muscle) => (
                <Button
                  key={muscle}
                  type="button"
                  variant={formData.muscleGroups.includes(muscle) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (formData.muscleGroups.includes(muscle)) {
                      removeMuscleGroup(muscle);
                    } else {
                      addMuscleGroup(muscle);
                    }
                  }}
                >
                  {muscle}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newMuscleGroup}
                onChange={(e) => setNewMuscleGroup(e.target.value)}
                placeholder="Agregar grupo muscular personalizado"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMuscleGroup(newMuscleGroup);
                    setNewMuscleGroup('');
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  addMuscleGroup(newMuscleGroup);
                  setNewMuscleGroup('');
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.muscleGroups.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.muscleGroups.map((muscle) => (
                  <Badge key={muscle} variant="secondary" className="flex items-center gap-1">
                    {muscle}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeMuscleGroup(muscle)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipamiento</CardTitle>
            <CardDescription>
              Selecciona el equipamiento necesario para este ejercicio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <Button
                  key={equipment}
                  type="button"
                  variant={formData.equipment.includes(equipment) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (formData.equipment.includes(equipment)) {
                      removeEquipment(equipment);
                    } else {
                      addEquipment(equipment);
                    }
                  }}
                >
                  {equipment}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                placeholder="Agregar equipamiento personalizado"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addEquipment(newEquipment);
                    setNewEquipment('');
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  addEquipment(newEquipment);
                  setNewEquipment('');
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.equipment.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.equipment.map((equipment) => (
                  <Badge key={equipment} variant="secondary" className="flex items-center gap-1">
                    {equipment}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeEquipment(equipment)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
            <CardDescription>
              Agrega las instrucciones paso a paso para realizar el ejercicio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                placeholder="Escribe una instrucción..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addInstruction();
                  }
                }}
              />
              <Button type="button" onClick={addInstruction}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.instructions.length > 0 && (
              <div className="space-y-2">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <span className="font-medium text-sm">{index + 1}.</span>
                    <span className="flex-1">{instruction}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInstruction(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Ejercicio'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}