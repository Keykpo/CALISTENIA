'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Clock, 
  Users, 
  Target,
  Loader2 
} from 'lucide-react';

interface Workout {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: number;
  category: string;
  imageUrl?: string;
  exercises: { id: string }[];
  createdAt: string;
}

export default function AdminWorkoutsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    fetchWorkouts();
  }, [session, status, router]);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts');
      if (!response.ok) throw new Error('Error al cargar entrenamientos');
      
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los entrenamientos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este entrenamiento?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar entrenamiento');

      setWorkouts(workouts.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error:', error);
      setError('Error al eliminar el entrenamiento');
    }
  };

  const filteredWorkouts = workouts.filter(workout =>
    workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'principiante': return 'bg-green-100 text-green-800';
      case 'intermedio': return 'bg-yellow-100 text-yellow-800';
      case 'avanzado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Administrar Entrenamientos</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona todos los entrenamientos de la plataforma
          </p>
        </div>
        <Button onClick={() => router.push('/admin/workouts/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Entrenamiento
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar entrenamientos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredWorkouts.map((workout) => (
          <Card key={workout.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{workout.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {workout.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/workouts/${workout.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(workout.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={getLevelColor(workout.level)}>
                    {workout.level}
                  </Badge>
                  <Badge variant="outline">
                    {workout.category}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {workout.duration} min
                  </div>
                  <div className="flex items-center">
                    <Target className="mr-1 h-4 w-4" />
                    {workout.exercises.length} ejercicios
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Creado: {new Date(workout.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWorkouts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay entrenamientos</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No se encontraron entrenamientos con ese criterio' : 'Comienza creando tu primer entrenamiento'}
          </p>
          {!searchTerm && (
            <Button onClick={() => router.push('/admin/workouts/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Entrenamiento
            </Button>
          )}
        </div>
      )}
    </div>
  );
}