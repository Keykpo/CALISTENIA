'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SkillPathReference from '@/components/SkillPathReference';
import AchievementPanel from '@/components/AchievementPanel';
import UserProfile from '@/components/UserProfile';
import { 
  User, 
  Activity, 
  Target, 
  Calendar, 
  TrendingUp, 
  Settings,
  LogOut,
  Dumbbell,
  Trophy,
  Clock,
  Edit3,
  Save,
  X,
  TreePine,
  Award
} from 'lucide-react';
import AssessmentModal from '@/components/AssessmentModal';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [activeTab, setActiveTab] = useState<string>(() => {
    const t = searchParams?.get('tab');
    if (t === 'dashboard' || t === 'profile' || t === 'skills' || t === 'achievements' || t === 'progress') {
      return t;
    }
    return 'dashboard';
  });
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    height: '',
    weight: '',
    gender: '',
    age: '',
    bodyFat: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Buenos días');
    } else if (hour < 18) {
      setGreeting('Buenas tardes');
    } else {
      setGreeting('Buenas noches');
    }

    // Initialize profile data from session
    if (session?.user) {
      setProfileData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }));
      
      // Check if user has completed assessment
      checkAssessmentStatus();
    }
  }, [status, router, session]);

  const checkAssessmentStatus = async () => {
    try {
      const response = await fetch('/api/user/goals');
      if (response.ok) {
        const data = await response.json();
        setHasCompletedAssessment(data.goals && data.goals.length > 0);
      }
    } catch (error) {
      console.error('Error checking assessment:', error);
    }
  };

  const handleStartTraining = () => {
    if (!hasCompletedAssessment) {
      setShowAssessment(true);
    } else {
      // TODO: Navigate to training session
      router.push('/training/session');
    }
  };

  const handleAssessmentComplete = () => {
    setHasCompletedAssessment(true);
    checkAssessmentStatus();
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleSave = () => {
    // Validate required fields
    if (!profileData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    // Validate height (100-250 cm)
    if (profileData.height && (parseInt(profileData.height) < 100 || parseInt(profileData.height) > 250)) {
      alert('La altura debe estar entre 100 y 250 cm');
      return;
    }

    // Validate weight (20-300 kg)
    if (profileData.weight && (parseInt(profileData.weight) < 20 || parseInt(profileData.weight) > 300)) {
      alert('El peso debe estar entre 20 y 300 kg');
      return;
    }

    // Validate age (10-120 years)
    if (profileData.age && (parseInt(profileData.age) < 10 || parseInt(profileData.age) > 120)) {
      alert('La edad debe estar entre 10 y 120 años');
      return;
    }

    // Validate body fat (0-50%)
    if (profileData.bodyFat && (parseFloat(profileData.bodyFat) < 0 || parseFloat(profileData.bodyFat) > 50)) {
      alert('El porcentaje de grasa corporal debe estar entre 0 y 50%');
      return;
    }

    // Here you would typically save to your backend
    console.log('Saving profile data:', profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userInitials = session.user?.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : (session.user?.email?.[0]?.toUpperCase() || 'U');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Calisthenics Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={session.user?.image || ''} />
                    <AvatarFallback className="text-xl font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {greeting}, {session.user?.name || 'Usuario'}!
                    </h2>
                    <p className="text-gray-600">
                      Bienvenido a tu dashboard de calistenia
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge variant="secondary">
                        <User className="h-3 w-3 mr-1" />
                        {session.user?.username || 'Sin username'}
                      </Badge>
                      <Badge variant="outline">
                        Nivel: Principiante
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </>
                  )}
                </Button>
                {isEditing && (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="skills">Árbol de Habilidades</TabsTrigger>
            <TabsTrigger value="achievements">Logros</TabsTrigger>
            <TabsTrigger value="progress">Progreso</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Entrenamientos Completados
                  </CardTitle>
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    +0% desde el mes pasado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tiempo Total
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0h</div>
                  <p className="text-xs text-muted-foreground">
                    Tiempo de entrenamiento acumulado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Racha Actual
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    días consecutivos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Logros
                  </CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    logros desbloqueados
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                  <CardDescription>
                    Comienza tu entrenamiento o explora contenido
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    size="lg"
                    onClick={handleStartTraining}
                  >
                    <Activity className="h-5 w-5 mr-3" />
                    Iniciar Entrenamiento
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Target className="h-5 w-5 mr-3" />
                    Ver Rutinas
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Calendar className="h-5 w-5 mr-3" />
                    Planificar Semana
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>
                    Tu progreso y entrenamientos recientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      ¡Comienza tu primer entrenamiento!
                    </p>
                    <p className="text-sm">
                      Cuando completes entrenamientos, aparecerán aquí tu progreso y estadísticas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Goals Section */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Tus Objetivos</CardTitle>
                  <CardDescription>
                    Define y sigue tus metas de fitness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      No tienes objetivos definidos
                    </p>
                    <p className="text-sm mb-4">
                      Establece metas específicas para mantener tu motivación y seguir tu progreso.
                    </p>
                    <Button>
                      <Target className="h-4 w-4 mr-2" />
                      Definir Objetivos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <UserProfile userId={session?.user?.id} />
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TreePine className="h-5 w-5 mr-2" />
                  Árbol de Habilidades
                </CardTitle>
                <CardDescription>
                  Desbloquea nuevas habilidades completando ejercicios y cumpliendo requisitos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Reemplazado: eliminamos el árbol de habilidades y mostramos layout estático */}
                <SkillPathReference />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Logros y Misiones
                </CardTitle>
                <CardDescription>
                  Completa desafíos y desbloquea logros para ganar recompensas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AchievementPanel userId={session?.user?.id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progreso de Atributos</CardTitle>
                  <CardDescription>
                    Tu desarrollo en las diferentes áreas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Fuerza</span>
                      <span className="text-sm text-gray-500">0/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Resistencia</span>
                      <span className="text-sm text-gray-500">0/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Flexibilidad</span>
                      <span className="text-sm text-gray-500">0/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Equilibrio</span>
                      <span className="text-sm text-gray-500">0/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas Generales</CardTitle>
                  <CardDescription>
                    Resumen de tu actividad
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Habilidades desbloqueadas</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ejercicios completados</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tiempo total entrenando</span>
                    <Badge variant="secondary">0h 0m</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Racha más larga</span>
                    <Badge variant="secondary">0 días</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Assessment Modal */}
      <AssessmentModal 
        isOpen={showAssessment}
        onClose={() => setShowAssessment(false)}
        onComplete={handleAssessmentComplete}
      />
    </div>
  );
}