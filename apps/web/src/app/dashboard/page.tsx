'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
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
import HexagonRadar from '@/components/HexagonRadar';

export default function DashboardPage() {
  const isProd = process.env.NODE_ENV === 'production';
  const sessionHook = isProd ? useSession() : { data: null, status: 'unauthenticated' as const };
  const session = sessionHook.data as any;
  const status = sessionHook.status as 'authenticated' | 'unauthenticated' | 'loading';
  const router = useRouter();
  const searchParams = useSearchParams();
  // Fallback userId for local dev when NextAuth is not available
  const computedUserId = (session?.user?.id as string) || (searchParams?.get('userId') || 'local-dev');
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
  const [hexProfile, setHexProfile] = useState<null | {
    relativeStrength: number;
    muscularEndurance: number;
    balanceControl: number;
    jointMobility: number;
    bodyTension: number;
    skillTechnique: number;
  }>(null);

  const [dashboard, setDashboard] = useState<null | {
    success: boolean;
    stats: { totalXP: number; level: number; coins: number };
    hexagon: any;
    recentWorkouts: any[];
    missionsToday: any[];
    recentAchievements: any[];
    weeklyProgress: Record<string, number>;
  }>(null);

  const [completingMissionId, setCompletingMissionId] = useState<string | null>(null);
  const [generatingMissions, setGeneratingMissions] = useState<boolean>(false);
  const [genInfo, setGenInfo] = useState<{ status?: string; detail?: string } | null>(null);
  const autoGenRef = useRef(false);
  const prevMissionRef = useRef<Record<string, { progress: number; completed: boolean }>>({});
  const initLoadRef = useRef(false);
  const reloadSeqRef = useRef(0);

  const reloadDashboard = async () => {
    try {
      const seq = ++reloadSeqRef.current;
      const res = await fetch(`/api/dashboard`, {
        headers: { 'x-user-id': computedUserId },
        cache: 'no-store',
      });
      const data = await res.json();
      // Ignora respuestas obsoletas si hubo múltiples reloads en carrera
      if (seq !== reloadSeqRef.current) return;
      if (data?.success) {
        setDashboard(data);
        if (data.hexagon) {
          setHexProfile({
            relativeStrength: data.hexagon.relativeStrength ?? 0,
            muscularEndurance: (data.hexagon.endurance ?? 0),
            balanceControl: data.hexagon.balanceControl ?? 0,
            jointMobility: (data.hexagon.mobility ?? 0),
            bodyTension: data.hexagon.bodyTension ?? 0,
            skillTechnique: data.hexagon.skillTechnique ?? 0,
          });
        }
      }
    } catch (e) {
      // ignore errores locales
    }
  };

  const completeMission = async (missionId: string) => {
    try {
      setCompletingMissionId(missionId);
      // Optimistic UI update: marcar como completada antes del fetch
      setDashboard(prev => {
        if (!prev) return prev;
        // Guarda estado previo para posible reversión
        const targetMission = (prev.missionsToday || []).find((m: any) => String(m.id) === String(missionId));
        if (targetMission) {
          prevMissionRef.current[String(missionId)] = {
            progress: targetMission.progress ?? 0,
            completed: !!targetMission.completed,
          };
        }
        const updated = (prev.missionsToday || []).map((m: any) =>
          m.id === missionId ? { ...m, completed: true, progress: m.target ?? 1 } : m
        );
        return { ...prev, missionsToday: updated };
      });
      const res = await fetch(`/api/missions/complete` , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': computedUserId },
        body: JSON.stringify({ missionId, userId: computedUserId })
      });
      // Procesa respuesta antes de refrescar
      if (res.ok) {
        const data = await res.json();
        console.log('[completeMission] response', { status: res.status, body: data });
        // Si el backend confirma completion, mantenemos estado y refrescamos
        if (data?.success) {
          await reloadDashboard();
        } else {
          // Si hubo error, revertimos el optimismo
          setDashboard(prev => {
            if (!prev) return prev;
            const prevState = prevMissionRef.current[String(missionId)];
            const updated = (prev.missionsToday || []).map((m: any) =>
              m.id === missionId ? { ...m, completed: prevState?.completed ?? false, progress: prevState?.progress ?? 0 } : m
            );
            return { ...prev, missionsToday: updated };
          });
        }
      } else {
        // Error HTTP: revertir optimismo
        setDashboard(prev => {
          if (!prev) return prev;
          const prevState = prevMissionRef.current[String(missionId)];
          const updated = (prev.missionsToday || []).map((m: any) =>
            m.id === missionId ? { ...m, completed: prevState?.completed ?? false, progress: prevState?.progress ?? 0 } : m
          );
          return { ...prev, missionsToday: updated };
        });
      }
    } catch (e) {
      // noop
    } finally {
      setCompletingMissionId(null);
    }
  };

  const generateMissions = async () => {
    try {
      setGeneratingMissions(true);
      setGenInfo({ status: 'start', detail: `userId=${computedUserId}` });
      console.log('[Dashboard] generateMissions:start', { userId: computedUserId });
      const res = await fetch(`/api/missions/daily?userId=${encodeURIComponent(computedUserId)}`, {
        headers: { 'x-user-id': computedUserId },
        cache: 'no-store',
      });
      console.log('[Dashboard] generateMissions:response', { ok: res.ok, status: res.status });
      setGenInfo({ status: res.ok ? 'ok' : 'error', detail: `status=${res.status}` });
      if (res.ok) {
        const data = await res.json();
        console.log('[Dashboard] generateMissions:data', { count: Array.isArray(data?.missions) ? data.missions.length : null });
        setGenInfo({ status: 'ok', detail: `count=${Array.isArray(data?.missions) ? data.missions.length : 'null'}` });
        if (data?.missions) {
          // Actualiza inmediatamente las misiones en UI para evitar condiciones de carrera
          setDashboard(prev => {
            const base = prev ?? {
              success: true,
              stats: { totalXP: 0, level: 1, coins: 0 },
              hexagon: null,
              recentWorkouts: [],
              missionsToday: [],
              recentAchievements: [],
              weeklyProgress: {},
            };
            return { ...base, missionsToday: data.missions };
          });
        }
      }
      // Luego refrescamos el dashboard completo
      await reloadDashboard();
    } catch (e) {
      console.error('[Dashboard] generateMissions:error', e);
      setGenInfo({ status: 'error', detail: String(e) });
    } finally {
      setGeneratingMissions(false);
      console.log('[Dashboard] generateMissions:end');
      setGenInfo(prev => ({ status: 'done', detail: prev?.detail }));
    }
  };

  useEffect(() => {
    // No redirección dura: permitir fallback local sin sesión
    if (initLoadRef.current) return;
    initLoadRef.current = true;

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }

    // Initialize profile data from session once
    if (session?.user) {
      setProfileData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }));
    }

    // Cargar datos del dashboard (con fallback de userId)
    reloadDashboard();

    // Solo auto-generar misiones en producción para evitar dobles ejecuciones en Strict Mode
    if (process.env.NODE_ENV === 'production') {
      if (!autoGenRef.current) {
        autoGenRef.current = true;
        generateMissions();
      }
    }

    // Estado de assessment (opcional para mostrar modales)
    checkAssessmentStatus();
    fetchHexagonProfile();
  }, [status]);

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
      // Redirect to initial assessment page
      router.push('/assessment');
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

  const fetchHexagonProfile = async () => {
    try {
      const res = await fetch('/api/assessment/initial');
      if (!res.ok) return;
      const data = await res.json();
      if (data?.profile) {
        setHexProfile({
          relativeStrength: data.profile.relativeStrength,
          muscularEndurance: data.profile.muscularEndurance,
          balanceControl: data.profile.balanceControl,
          jointMobility: data.profile.jointMobility,
          bodyTension: data.profile.bodyTension,
          skillTechnique: data.profile.skillTechnique,
        });
      }
    } catch (e) {
      // ignore
    }
  };

  const handleSave = () => {
    // Validate required fields
    if (!profileData.name.trim()) {
      alert('Name is required');
      return;
    }

    // Validate height (100-250 cm)
    if (profileData.height && (parseInt(profileData.height) < 100 || parseInt(profileData.height) > 250)) {
      alert('Height must be between 100 and 250 cm');
      return;
    }

    // Validate weight (20-300 kg)
    if (profileData.weight && (parseInt(profileData.weight) < 20 || parseInt(profileData.weight) > 300)) {
      alert('Weight must be between 20 and 300 kg');
      return;
    }

    // Validate age (10-120 years)
    if (profileData.age && (parseInt(profileData.age) < 10 || parseInt(profileData.age) > 120)) {
      alert('Age must be between 10 and 120 years');
      return;
    }

    // Validate body fat (0-50%)
    if (profileData.bodyFat && (parseFloat(profileData.bodyFat) < 0 || parseFloat(profileData.bodyFat) > 50)) {
      alert('Body fat percentage must be between 0 and 50%');
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

  if (status === 'loading' && !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const displayName = session?.user?.name || 'Guest';
  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : (session?.user?.email?.[0]?.toUpperCase() || 'U');

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
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
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
                    <AvatarImage src={session?.user?.image || ''} />
                    <AvatarFallback className="text-xl font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {greeting}, {displayName}!
                    </h2>
                    <p className="text-gray-600">
                      Welcome to your calisthenics dashboard
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge variant="secondary">
                        <User className="h-3 w-3 mr-1" />
                      {session?.user?.username || 'Invitado'}
                      </Badge>
                      <Badge variant="outline">
                        Level: Beginner
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
                  variant="black"
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
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
                    Cancel
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
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="skills">Skill Tree</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Coins
                  </CardTitle>
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard?.stats?.coins ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Virtual coins available
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total XP
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard?.stats?.totalXP ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Experience points
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Level
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard?.stats?.level ?? 1}</div>
                  <p className="text-xs text-muted-foreground">
                    Current level
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Achievements
                  </CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard?.recentAchievements?.length ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    achievements unlocked
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Start training or explore content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    size="lg"
                    onClick={handleStartTraining}
                    variant="black"
                  >
                    <Activity className="h-5 w-5 mr-3" />
                    Start Training
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Target className="h-5 w-5 mr-3" />
                    View Workouts
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Calendar className="h-5 w-5 mr-3" />
                    Plan Week
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent progress and workouts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboard?.recentWorkouts?.length ? (
                    <div className="space-y-3">
                      {dashboard.recentWorkouts.map((w: any) => (
                        <div key={w.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Workout #{w.id}</div>
                              <div className="text-xs text-muted-foreground">{new Date(w.completedAt).toLocaleString()}</div>
                            </div>
                          </div>
                          <Badge variant="secondary">+{w.totalXP ?? 0} XP</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">
                        Start your first workout!
                      </p>
                      <p className="text-sm">
                        When you complete workouts, your progress and stats will appear here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Goals Section */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Today’s Missions</CardTitle>
                  <CardDescription>
                    Complete missions to earn rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboard?.missionsToday?.length ? (
                    <div className="space-y-3">
                      {dashboard.missionsToday.map((m: any) => (
                        <div key={m.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <div className="font-medium">{m.title || 'Mission'}</div>
                            <div className="text-xs text-muted-foreground">Reward: {m.rewardXP ?? 0} XP, {m.rewardCoins ?? 0} coins</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={m.completed ? 'secondary' : 'outline'}>
                              {m.completed ? 'Completed' : `${m.progress ?? 0}/${m.target ?? 1}`}
                            </Badge>
                            <Button
                              size="sm"
                              variant="black"
                              disabled={!!m.completed || completingMissionId === m.id}
                              onClick={() => completeMission(String(m.id))}
                            >
                              {m.completed ? 'Completed' : (completingMissionId === m.id ? 'Completing...' : 'Complete')}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">
                        No missions yet for today
                      </p>
                      <p className="text-sm mb-4">
                        Come back after completing a training session.
                      </p>
                      <Button
                        variant="black"
                        onClick={() => {
                          try {
                            console.log('[Dashboard] Generate Missions click', { userId: computedUserId });
                            setGeneratingMissions(true);
                            // ejecutamos y luego el propio generateMissions hará el reset
                            generateMissions();
                          } catch (e) {
                            console.error('[Dashboard] Generate Missions error on click', e);
                            setGeneratingMissions(false);
                          }
                        }}
                        disabled={generatingMissions}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        {generatingMissions ? 'Generating...' : 'Generate Missions'}
                      </Button>
                      {genInfo?.status && (
                        <div className="mt-2 text-xs text-gray-500">
                          {`Status: ${genInfo.status}${genInfo.detail ? ` (${genInfo.detail})` : ''}`}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                  <CardDescription>
                    Workouts completed per day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboard?.weeklyProgress ? (
                    <div className="flex items-end gap-4">
                      {Object.entries(dashboard.weeklyProgress).map(([day, count]) => (
                        <div key={day} className="flex flex-col items-center">
                          <div className="text-xs text-muted-foreground mb-1">{day.slice(0,3)}</div>
                          <div className="w-6 h-24 bg-gray-200 rounded flex items-end overflow-hidden">
                            <div
                              className="bg-indigo-600 w-6"
                              style={{ height: `${Math.min(100, (Number(count) || 0) * 25)}%` }}
                            />
                          </div>
                          <div className="text-xs mt-1">{Number(count) || 0}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No weekly data yet.</div>
                  )}
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
                  Skill Tree
                </CardTitle>
                <CardDescription>
                  Unlock new skills by completing exercises and meeting requirements
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
                  Achievements & Quests
                </CardTitle>
                <CardDescription>
                  Complete challenges and unlock achievements to earn rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Pasamos userId con fallback local */}
                <AchievementPanel userId={computedUserId} />
                {dashboard?.recentAchievements?.length ? (
                  <div className="mt-6 space-y-2">
                    <div className="text-sm text-muted-foreground">Recent achievements</div>
                    {dashboard.recentAchievements.map((ua: any) => (
                      <div key={ua.id} className="flex items-center justify-between border-b pb-2">
                        <div className="font-medium">{ua.achievement?.name ?? 'Achievement'}</div>
                        <div className="text-xs text-muted-foreground">{ua.completedAt ? new Date(ua.completedAt).toLocaleString() : ''}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hexagon Profile</CardTitle>
                <CardDescription>
                  Your current calisthenics profile. Keep training to evolve it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hexProfile ? (
                  <HexagonRadar values={hexProfile} size={360} />
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p className="mb-3">No assessment data yet.</p>
                    <Button variant="black" onClick={() => router.push('/assessment')}>Complete Assessment</Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attribute Progress</CardTitle>
                  <CardDescription>
                    Your development across different areas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Strength</span>
                      <span className="text-sm text-gray-500">0/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Endurance</span>
                      <span className="text-sm text-gray-500">0/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Flexibility</span>
                      <span className="text-sm text-gray-500">0/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Balance</span>
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
                  <CardTitle>General Statistics</CardTitle>
                  <CardDescription>
                    Activity summary
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Skills unlocked</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Exercises completed</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total training time</span>
                    <Badge variant="secondary">0h 0m</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Longest streak</span>
                    <Badge variant="secondary">0 days</Badge>
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