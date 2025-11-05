'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Search, 
  Filter,
  Play,
  Lock,
  CheckCircle,
  Trophy,
  Target
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in weeks
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  price: number;
  thumbnail: string;
  instructor: string;
  category: string;
  isEnrolled: boolean;
  progress?: number; // 0-100
  tags: string[];
}

// Sample courses data
const sampleCourses: Course[] = [
  {
    id: '1',
    title: 'Fundamentos de Calistenia',
    description: 'Aprende los movimientos básicos y construye una base sólida para tu entrenamiento de calistenia.',
    level: 'beginner',
    duration: 8,
    lessonsCount: 24,
    studentsCount: 1250,
    rating: 4.8,
    price: 49.99,
    thumbnail: '/api/placeholder/400/250',
    instructor: 'Carlos Mendez',
    category: 'Básico',
    isEnrolled: true,
    progress: 65,
    tags: ['flexiones', 'dominadas', 'sentadillas', 'plancha']
  },
  {
    id: '2',
    title: 'Dominadas: De Cero a Héroe',
    description: 'Programa completo para dominar las dominadas desde nivel principiante hasta variaciones avanzadas.',
    level: 'intermediate',
    duration: 12,
    lessonsCount: 36,
    studentsCount: 890,
    rating: 4.9,
    price: 79.99,
    thumbnail: '/api/placeholder/400/250',
    instructor: 'Ana Rodriguez',
    category: 'Fuerza Superior',
    isEnrolled: false,
    tags: ['dominadas', 'fuerza', 'espalda', 'bíceps']
  },
  {
    id: '3',
    title: 'Handstand Mastery',
    description: 'Aprende a hacer el pino perfecto con progresiones sistemáticas y ejercicios específicos.',
    level: 'advanced',
    duration: 16,
    lessonsCount: 48,
    studentsCount: 567,
    rating: 4.7,
    price: 99.99,
    thumbnail: '/api/placeholder/400/250',
    instructor: 'Miguel Santos',
    category: 'Equilibrio',
    isEnrolled: true,
    progress: 25,
    tags: ['handstand', 'equilibrio', 'core', 'hombros']
  },
  {
    id: '4',
    title: 'Muscle-Up Progression',
    description: 'Desarrolla la fuerza y técnica necesaria para realizar muscle-ups perfectos.',
    level: 'advanced',
    duration: 10,
    lessonsCount: 30,
    studentsCount: 423,
    rating: 4.6,
    price: 89.99,
    thumbnail: '/api/placeholder/400/250',
    instructor: 'David Lopez',
    category: 'Fuerza Combinada',
    isEnrolled: false,
    tags: ['muscle-up', 'transición', 'fuerza', 'técnica']
  },
  {
    id: '5',
    title: 'Flexibilidad y Movilidad',
    description: 'Mejora tu rango de movimiento y previene lesiones con rutinas de flexibilidad específicas.',
    level: 'beginner',
    duration: 6,
    lessonsCount: 18,
    studentsCount: 1100,
    rating: 4.5,
    price: 39.99,
    thumbnail: '/api/placeholder/400/250',
    instructor: 'Laura Martinez',
    category: 'Movilidad',
    isEnrolled: true,
    progress: 90,
    tags: ['flexibilidad', 'movilidad', 'estiramiento', 'recuperación']
  },
  {
    id: '6',
    title: 'Calistenia Femenina',
    description: 'Programa especializado diseñado específicamente para mujeres que quieren dominar la calistenia.',
    level: 'intermediate',
    duration: 14,
    lessonsCount: 42,
    studentsCount: 678,
    rating: 4.8,
    price: 69.99,
    thumbnail: '/api/placeholder/400/250',
    instructor: 'Sofia Herrera',
    category: 'Especializado',
    isEnrolled: false,
    tags: ['femenino', 'fuerza', 'técnica', 'progresión']
  }
];

export default function CoursesPage() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(sampleCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando cursos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect('/auth/signin');
  }

  // Filter courses based on search and filters
  useEffect(() => {
    let filtered = courses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Enrolled filter
    if (showEnrolledOnly) {
      filtered = filtered.filter(course => course.isEnrolled);
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedLevel, selectedCategory, showEnrolledOnly, courses]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return level;
    }
  };

  const categories = [...new Set(courses.map(course => course.category))];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cursos de Calistenia</h1>
        <p className="text-muted-foreground">
          Desarrolla tus habilidades con nuestros cursos estructurados y progresivos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{courses.length}</p>
            <p className="text-sm text-muted-foreground">Cursos Disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{courses.reduce((sum, course) => sum + course.studentsCount, 0).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Estudiantes Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{courses.filter(c => c.isEnrolled).length}</p>
            <p className="text-sm text-muted-foreground">Mis Cursos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {Math.round(courses.filter(c => c.isEnrolled && c.progress).reduce((sum, c) => sum + (c.progress || 0), 0) / courses.filter(c => c.isEnrolled && c.progress).length) || 0}%
            </p>
            <p className="text-sm text-muted-foreground">Progreso Promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos los niveles</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Enrolled Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enrolled"
                checked={showEnrolledOnly}
                onChange={(e) => setShowEnrolledOnly(e.target.checked)}
                className="rounded border-input"
              />
              <label htmlFor="enrolled" className="text-sm">Solo mis cursos</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-white opacity-50" />
              </div>
              {course.isEnrolled && (
                <Badge className="absolute top-2 right-2 bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Inscrito
                </Badge>
              )}
              <Badge className={`absolute top-2 left-2 ${getLevelColor(course.level)}`}>
                {getLevelText(course.level)}
              </Badge>
            </div>

            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {course.rating}
                </div>
              </div>
              <CardDescription className="line-clamp-3">
                {course.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress Bar (if enrolled) */}
              {course.isEnrolled && course.progress !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Course Info */}
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration} semanas
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {course.lessonsCount} lecciones
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.studentsCount.toLocaleString()} estudiantes
                </div>
                <div className="font-semibold text-primary">
                  ${course.price}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {course.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {course.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{course.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Instructor */}
              <p className="text-sm text-muted-foreground">
                Instructor: <span className="font-medium">{course.instructor}</span>
              </p>

              {/* Action Button */}
              <Button 
                className="w-full" 
                variant={course.isEnrolled ? "outline" : "default"}
              >
                {course.isEnrolled ? (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Continuar Curso
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Inscribirse
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron cursos</h3>
          <p className="text-muted-foreground">
            Intenta ajustar tus filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
}