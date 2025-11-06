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
import HexagonRadar from '@/components/HexagonRadar';

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
  const [hexProfile, setHexProfile] = useState<null | {
    relativeStrength: number;
    muscularEndurance: number;
    balanceControl: number;
    jointMobility: number;
    bodyTension: number;
    skillTechnique: number;
  }>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
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
      // Load hexagon profile
      fetchHexagonProfile();
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
                    <AvatarImage src={session.user?.image || ''} />
                    <AvatarFallback className="text-xl font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {greeting}, {session.user?.name || 'User'}!
                    </h2>
                    <p className="text-gray-600">
                      Welcome to your calisthenics dashboard
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge variant="secondary">
                        <User className="h-3 w-3 mr-1" />
                        {session.user?.username || 'No username'}
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
                    Workouts Completed
                  </CardTitle>
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    +0% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Time
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0h</div>
                  <p className="text-xs text-muted-foreground">
                    Accumulated training time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Streak
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    consecutive days
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
                  <div className="text-2xl font-bold">0</div>
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
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      Start your first workout!
                    </p>
                    <p className="text-sm">
                      When you complete workouts, your progress and stats will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Goals Section */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Your Goals</CardTitle>
                  <CardDescription>
                    Define and track your fitness goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      You have no defined goals
                    </p>
                    <p className="text-sm mb-4">
                      Set specific goals to stay motivated and track progress.
                    </p>
                    <Button variant="black">
                      <Target className="h-4 w-4 mr-2" />
                      Set Goals
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
                <AchievementPanel userId={session?.user?.id} />
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