'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Unlock, Star, Trophy, Target, Coins, Zap, Crown, Award, Sword, Shield, Users } from 'lucide-react';
import SkillConnections from './SkillConnections';
import AchievementSystem from './AchievementSystem';
import ProgressCharts from './ProgressCharts';
import Leaderboards from './Leaderboards';
import '../styles/skill-tree-animations.css';
import { useSkillActions } from '@/hooks/useSkillActions';

interface Skill {
  id: string;
  name: string;
  description: string;
  branch: 'EMPUJE' | 'TRACCION' | 'CORE' | 'EQUILIBRIO' | 'TREN_INFERIOR' | 'ESTATICOS' | 'CALENTAMIENTO';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  requiredReps: number | null;
  requiredDuration: number | null;
  requiredDays: number;
  strengthRequired: number;
  strengthGained: number;
  xpReward: number;
  coinReward: number;
  prerequisites?: Skill[];
}

interface UserSkill {
  id: string;
  skillId: string;
  userId: string;
  isCompleted: boolean;
  isUnlocked: boolean;
  currentSets: number;
  currentReps: number;
  currentDuration: number;
  daysCompleted: number;
  completionProgress: number;
  canUnlock: boolean;
  completedAt?: string;
  unlockedAt?: string;
  skill: Skill;
}

interface UserInfo {
  totalXP: number;
  currentLevel: number;
  virtualCoins: number;
  totalStrength: number;
  levelInfo?: {
    currentLevel: number;
    currentLevelInfo: { level: number; title: string };
    nextLevelInfo?: { level: number; title: string };
    progressToNext: number;
    xpInCurrentLevel: number;
    xpNeededForNext: number;
  };
}

interface SkillTreeProps {
  userId?: string;
}

const difficultyColors = {
  BEGINNER: 'bg-green-100 text-green-800 border-green-200',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ADVANCED: 'bg-orange-100 text-orange-800 border-orange-200',
  EXPERT: 'bg-red-100 text-red-800 border-red-200',
};

// Difficulty rank mapping (fallback by difficulty) and overrides by skill name
const rankByDifficulty: Record<Skill['difficulty'], string> = {
  BEGINNER: 'F',
  INTERMEDIATE: 'D',
  ADVANCED: 'A',
  EXPERT: 'S',
};

const normalizeName = (name: string) => name.trim().toLowerCase();

const rankOverrideByName: Record<string, string> = {
  // Push
  [normalizeName('Flexión a una mano')]: 'S',
  [normalizeName('One-Arm Push-Up')]: 'S',
  [normalizeName('Fondos en barras paralelas')]: 'B',
  [normalizeName('Flexiones diamante')]: 'D',
  [normalizeName('Flexiones estándar')]: 'F+',
  [normalizeName('Flexiones de rodillas')]: 'F',
  // Pull
  [normalizeName('Dominadas australianas')]: 'F',
  [normalizeName('Remo invertido')]: 'F',
  [normalizeName('Dominadas asistidas')]: 'E',
  [normalizeName('Dominada libre')]: 'D+',
  [normalizeName('Dominadas avanzadas')]: 'C',
  [normalizeName('Muscle-Up con banda')]: 'A',
  [normalizeName('Muscle-Up')]: 'S',
  [normalizeName('Muscle-Up (sin asistencia)')]: 'S',
  // Core
  [normalizeName('Plancha abdominal')]: 'F',
  [normalizeName('Hollow hold')]: 'E',
  [normalizeName('Elevaciones de rodillas colgado')]: 'D',
  [normalizeName('Elevaciones de piernas (Toes to Bar)')]: 'B',
  [normalizeName('L-sit')]: 'A',
  [normalizeName('Dragon Flag')]: 'S',
  // Balance / Handstands
  [normalizeName('Postura del Cuervo')]: 'F',
  [normalizeName('Pino asistido contra la pared')]: 'D',
  [normalizeName('Pino libre')]: 'A',
  [normalizeName('Caminata en pino')]: 'A+',
  [normalizeName('Flexiones en pino')]: 'S',
  // Lower Body
  [normalizeName('Sentadilla básica')]: 'F',
  [normalizeName('Zancadas')]: 'E',
  [normalizeName('Sentadilla búlgara')]: 'D+',
  [normalizeName('Pistol Squat')]: 'A',
  [normalizeName('Salto al cajón')]: 'B',
  // Statics - Planche
  [normalizeName('Lean Planche')]: 'C',
  [normalizeName('Tuck Planche')]: 'A',
  [normalizeName('Advanced Tuck Planche')]: 'A+',
  [normalizeName('Straddle Planche')]: 'S',
  [normalizeName('Planche Completa')]: 'S+',
  [normalizeName('Full Planche')]: 'S+',
  // Statics - Front Lever
  [normalizeName('Tuck Front Lever')]: 'C',
  [normalizeName('Advanced Tuck Front Lever')]: 'A',
  [normalizeName('One Leg Front Lever')]: 'A+',
  [normalizeName('Straddle Front Lever')]: 'S',
  [normalizeName('Front Lever completo')]: 'S+',
  [normalizeName('Full Front Lever')]: 'S+',
};

const rankColors: Record<string, string> = {
  'F': 'border-gray-300 text-gray-700',
  'F+': 'border-gray-300 text-gray-700',
  'E': 'border-teal-300 text-teal-700',
  'D': 'border-amber-300 text-amber-700',
  'D+': 'border-amber-300 text-amber-700',
  'C': 'border-blue-300 text-blue-700',
  'B': 'border-indigo-300 text-indigo-700',
  'A': 'border-violet-300 text-violet-700',
  'A+': 'border-violet-400 text-violet-800',
  'S': 'border-red-300 text-red-700',
  'S+': 'border-purple-400 text-purple-700',
};

const getSkillRank = (skill: Skill) => rankOverrideByName[normalizeName(skill.name)] ?? rankByDifficulty[skill.difficulty] ?? '?';

const branchColors = {
  CALENTAMIENTO: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
  EMPUJE: 'bg-red-50 border-red-200 hover:bg-red-100',
  TRACCION: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  CORE: 'bg-green-50 border-green-200 hover:bg-green-100',
  EQUILIBRIO: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
  TREN_INFERIOR: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
  ESTATICOS: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
};

const branchIcons = {
  CALENTAMIENTO: '🤸',
  EMPUJE: '💪',
  TRACCION: '🔥',
  CORE: '⚡',
  EQUILIBRIO: '🎪',
  TREN_INFERIOR: '🦵',
  ESTATICOS: '🗿',
};

const branchNames = {
  CALENTAMIENTO: 'Calentamiento',
  EMPUJE: 'Empuje',
  TRACCION: 'Tracción',
  CORE: 'Core',
  EQUILIBRIO: 'Equilibrio',
  TREN_INFERIOR: 'Tren Inferior',
  ESTATICOS: 'Estáticos',
};

export default function SkillTree({ userId }: SkillTreeProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'skills' | 'achievements' | 'progress'>('skills');
  const [particles, setParticles] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Skill actions hook
  const { unlockSkill, completeSkill, isLoading: isSkillActionLoading } = useSkillActions({
    onSkillUpdated: () => {
      fetchUserSkills();
      fetchUserInfo();
    },
  });
  
  // Mock data for achievements and progress (in real app, fetch from API)
  const [userStats, setUserStats] = useState({
    completedSkills: userSkills.filter(us => us.isCompleted).length,
    totalStreak: 15,
    maxStreak: 25,
    branchProgress: {
      EMPUJE: 60,
      TRACCION: 40,
      CORE: 80,
      EQUILIBRIO: 30,
      TREN_INFERIOR: 50,
      ESTATICOS: 20,
    },
    totalXP: userInfo?.totalXP || 0,
    daysActive: 45,
    fastestCompletion: 2,
  });

  const [progressData, setProgressData] = useState([
    { date: '2024-01-01', xp: 100, skillsCompleted: 2, strength: 10, streak: 1 },
    { date: '2024-01-02', xp: 250, skillsCompleted: 4, strength: 15, streak: 2 },
    { date: '2024-01-03', xp: 400, skillsCompleted: 6, strength: 22, streak: 3 },
    { date: '2024-01-04', xp: 600, skillsCompleted: 8, strength: 30, streak: 4 },
    { date: '2024-01-05', xp: 850, skillsCompleted: 12, strength: 38, streak: 5 },
  ]);

  const [branchStats, setBranchStats] = useState([
    { branch: 'EMPUJE', name: 'Empuje', icon: '💪', color: '#ef4444', completed: 12, total: 20, averageTime: 5, strengthGained: 45, xpEarned: 1200 },
    { branch: 'TRACCION', name: 'Tracción', icon: '🔥', color: '#3b82f6', completed: 8, total: 20, averageTime: 6, strengthGained: 35, xpEarned: 800 },
    { branch: 'CORE', name: 'Core', icon: '⚡', color: '#10b981', completed: 16, total: 20, averageTime: 4, strengthGained: 40, xpEarned: 1600 },
    { branch: 'EQUILIBRIO', name: 'Equilibrio', icon: '🎪', color: '#8b5cf6', completed: 6, total: 20, averageTime: 8, strengthGained: 25, xpEarned: 600 },
    { branch: 'TREN_INFERIOR', name: 'Tren Inferior', icon: '🦵', color: '#f59e0b', completed: 10, total: 20, averageTime: 7, strengthGained: 50, xpEarned: 1000 },
    { branch: 'ESTATICOS', name: 'Estáticos', icon: '🗿', color: '#6b7280', completed: 4, total: 20, averageTime: 12, strengthGained: 30, xpEarned: 400 },
  ]);

  useEffect(() => {
    fetchSkills();
    if (userId) {
      fetchUserSkills();
      fetchUserInfo();
    }
  }, [userId]);

  // Mock data para demostración
  const mockSkills: Skill[] = [
    {
      id: '1',
      name: 'Flexiones básicas',
      description: 'Flexiones de pecho tradicionales',
      branch: 'EMPUJE',
      difficulty: 'BEGINNER',
      requiredSets: 3,
      requiredReps: 10,
      requiredDuration: 0,
      requiredDays: 7,
      strengthRequired: 0,
      strengthGained: 5,
      xpReward: 100,
      coinReward: 10,
    },
    {
      id: '2',
      name: 'Flexiones diamante',
      description: 'Flexiones con las manos en forma de diamante',
      branch: 'EMPUJE',
      difficulty: 'INTERMEDIATE',
      requiredSets: 3,
      requiredReps: 8,
      requiredDuration: 0,
      requiredDays: 10,
      strengthRequired: 5,
      strengthGained: 8,
      xpReward: 200,
      coinReward: 20,
    },
    {
      id: '3',
      name: 'Dominadas',
      description: 'Dominadas básicas en barra',
      branch: 'TRACCION',
      difficulty: 'INTERMEDIATE',
      requiredSets: 3,
      requiredReps: 5,
      requiredDuration: 0,
      requiredDays: 14,
      strengthRequired: 0,
      strengthGained: 10,
      xpReward: 250,
      coinReward: 25,
    },
    {
      id: '4',
      name: 'Plancha',
      description: 'Mantener posición de plancha',
      branch: 'CORE',
      difficulty: 'BEGINNER',
      requiredSets: 3,
      requiredReps: 1,
      requiredDuration: 30,
      requiredDays: 7,
      strengthRequired: 0,
      strengthGained: 6,
      xpReward: 150,
      coinReward: 15,
    },
    {
      id: '5',
      name: 'Sentadillas',
      description: 'Sentadillas básicas',
      branch: 'TREN_INFERIOR',
      difficulty: 'BEGINNER',
      requiredSets: 3,
      requiredReps: 15,
      requiredDuration: 0,
      requiredDays: 7,
      strengthRequired: 0,
      strengthGained: 7,
      xpReward: 120,
      coinReward: 12,
    },
    {
      id: '6',
      name: 'Handstand',
      description: 'Parada de manos contra la pared',
      branch: 'EQUILIBRIO',
      difficulty: 'ADVANCED',
      requiredSets: 3,
      requiredReps: 1,
      requiredDuration: 15,
      requiredDays: 21,
      strengthRequired: 15,
      strengthGained: 12,
      xpReward: 400,
      coinReward: 40,
    },
  ];

  const mockUserSkills: UserSkill[] = [
    {
      id: 'us1',
      skillId: '1',
      userId: userId || 'demo',
      isCompleted: true,
      isUnlocked: true,
      currentSets: 3,
      currentReps: 10,
      currentDuration: 0,
      daysCompleted: 7,
      completionProgress: 100,
      canUnlock: false,
      completedAt: new Date().toISOString(),
      unlockedAt: new Date().toISOString(),
      skill: mockSkills[0],
    },
    {
      id: 'us2',
      skillId: '2',
      userId: userId || 'demo',
      isCompleted: false,
      isUnlocked: true,
      currentSets: 2,
      currentReps: 6,
      currentDuration: 0,
      daysCompleted: 5,
      completionProgress: 65,
      canUnlock: false,
      unlockedAt: new Date().toISOString(),
      skill: mockSkills[1],
    },
    {
      id: 'us3',
      skillId: '3',
      userId: userId || 'demo',
      isCompleted: false,
      isUnlocked: false,
      currentSets: 0,
      currentReps: 0,
      currentDuration: 0,
      daysCompleted: 0,
      completionProgress: 0,
      canUnlock: true,
      skill: mockSkills[2],
    },
    {
      id: 'us4',
      skillId: '4',
      userId: userId || 'demo',
      isCompleted: true,
      isUnlocked: true,
      currentSets: 3,
      currentReps: 1,
      currentDuration: 30,
      daysCompleted: 7,
      completionProgress: 100,
      canUnlock: false,
      completedAt: new Date().toISOString(),
      unlockedAt: new Date().toISOString(),
      skill: mockSkills[3],
    },
    {
      id: 'us5',
      skillId: '5',
      userId: userId || 'demo',
      isCompleted: false,
      isUnlocked: true,
      currentSets: 2,
      currentReps: 12,
      currentDuration: 0,
      daysCompleted: 4,
      completionProgress: 45,
      canUnlock: false,
      unlockedAt: new Date().toISOString(),
      skill: mockSkills[4],
    },
    {
      id: 'us6',
      skillId: '6',
      userId: userId || 'demo',
      isCompleted: false,
      isUnlocked: false,
      currentSets: 0,
      currentReps: 0,
      currentDuration: 0,
      daysCompleted: 0,
      completionProgress: 0,
      canUnlock: false,
      skill: mockSkills[5],
    },
  ];

  const mockUserInfo: UserInfo = {
    totalXP: 570,
    currentLevel: 3,
    virtualCoins: 67,
    totalStrength: 36,
    levelInfo: {
      currentLevel: 3,
      currentLevelInfo: { level: 3, title: 'Atleta Novato' },
      nextLevelInfo: { level: 4, title: 'Guerrero en Entrenamiento' },
      progressToNext: 70,
      xpInCurrentLevel: 570,
      xpNeededForNext: 1000,
    },
  };

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      if (response.ok) {
        const data = await response.json();
        setSkills(data.skills);
      } else {
        console.error('Error fetching skills');
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const fetchUserSkills = async () => {
    try {
      const response = await fetch('/api/user/skills');
      if (response.ok) {
        const data = await response.json();
        setUserSkills(data.skills || []);
        setUserInfo(data.userInfo || null);
      } else {
        console.error('Error fetching user skills');
      }
    } catch (error) {
      console.error('Error fetching user skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    setUserInfo(mockUserInfo);
  };

  const getUserSkill = (skillId: string): UserSkill | undefined => {
    return userSkills.find(us => us.skillId === skillId);
  };

  const calculateProgress = (userSkill: UserSkill): number => {
    return userSkill.completionProgress || 0;
  };

  // Particle effects
  const createParticles = (x: number, y: number) => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: `particle-${Date.now()}-${i}`,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
    }));
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 2000);
  };

  const handleUnlockSkill = async (skillId: string, skillName: string) => {
    const success = await unlockSkill(skillId, skillName);
    
    if (success) {
      // Create particle effect
      const skillElement = document.querySelector(`[data-skill-id="${skillId}"]`);
      if (skillElement) {
        const rect = skillElement.getBoundingClientRect();
        createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
        
        // Add unlock animation class
        skillElement.classList.add('skill-unlock-animation');
        setTimeout(() => {
          skillElement.classList.remove('skill-unlock-animation');
        }, 1000);
      }
    }
  };

  const handleCompleteSkill = async (
    skillId: string,
    skillName: string,
    rewards: { xp: number; coins: number; strength: number }
  ) => {
    const success = await completeSkill(skillId, skillName, rewards);
    
    if (success) {
      // Create completion particle effect
      const skillElement = document.querySelector(`[data-skill-id="${skillId}"]`);
      if (skillElement) {
        const rect = skillElement.getBoundingClientRect();
        createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
        
        // Add completion animation class
        skillElement.classList.add('skill-complete-animation');
        setTimeout(() => {
          skillElement.classList.remove('skill-complete-animation');
        }, 1000);
      }
    }
  };

  // Update user stats when userSkills change
  useEffect(() => {
    setUserStats(prev => ({
      ...prev,
      completedSkills: userSkills.filter(us => us.isCompleted).length,
      totalXP: userInfo?.totalXP || 0,
    }));
  }, [userSkills, userInfo]);

  const filteredSkills = selectedBranch === 'all' 
    ? skills 
    : skills.filter(skill => skill.branch === selectedBranch);

  const branches = Object.keys(branchNames) as Array<keyof typeof branchNames>;

  // Orden y agrupación por rama para el layout tipo lanes
  const branchLanesOrder: Array<keyof typeof branchNames> = [
    'EMPUJE', 'TRACCION', 'CORE', 'EQUILIBRIO', 'TREN_INFERIOR'
  ];

  const groupedByBranch: Record<string, Skill[]> = branchLanesOrder.reduce((acc, b) => {
    acc[b] = filteredSkills.filter(s => s.branch === b);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={containerRef}>
      {/* Particles Container */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle-effect"
            style={{
              left: particle.x,
              top: particle.y,
            }}
          />
        ))}
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Sword className="h-4 w-4" />
            Árbol de Habilidades
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Logros
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
          <TabsTrigger value="leaderboards" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clasificaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-6">
          {/* User Info Header */}
          {userInfo && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 level-progress-animation">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Crown className="h-6 w-6 text-yellow-600" />
                      <div>
                        <h3 className="text-lg font-bold">Nivel {userInfo.currentLevel}</h3>
                        <p className="text-sm text-gray-600">
                          {userInfo.levelInfo?.currentLevelInfo?.title || 'Aventurero'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Zap className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">{userInfo.totalXP} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="h-5 w-5 text-yellow-600" />
                        <span className="font-semibold">{userInfo.virtualCoins}</span>
                      </div>
                    </div>
                  </div>
                  {userInfo.levelInfo && userInfo.levelInfo.nextLevelInfo && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Progreso al Nivel {userInfo.levelInfo.nextLevelInfo.level}
                      </p>
                      <div className="w-32">
                        <Progress value={userInfo.levelInfo.progressToNext} className="h-2 progress-bar-animated" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {userInfo.levelInfo.xpNeededForNext} XP restante
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Branch Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedBranch === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedBranch('all')}
              className="branch-filter-button"
            >
              Todas las Ramas
            </Button>
            {branches.map(branch => (
              <Button
                key={branch}
                variant={selectedBranch === branch ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedBranch(branch)}
                className="flex items-center gap-2 branch-filter-button"
              >
                <span>{branchIcons[branch]}</span>
                {branchNames[branch]}
              </Button>
            ))}
          </div>

          {/* Skill Connections */}
          <SkillConnections 
            skills={filteredSkills} 
            userSkills={userSkills} 
            containerRef={containerRef}
          />
          {/* Skill Lanes */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {branchLanesOrder.map((lane) => (
              <div key={lane} className="space-y-4">
                <div className="text-sm font-semibold text-gray-700 px-1">{branchNames[lane]}</div>
                {(groupedByBranch[lane] && groupedByBranch[lane].length > 0) ? (
                  groupedByBranch[lane].map((skill) => {
                    const userSkill = getUserSkill(skill.id);
                    const progress = userSkill ? calculateProgress(userSkill) : 0;
                    const canUnlock = userSkill?.canUnlock || false;
                    const isUnlocked = userSkill?.isUnlocked || false;
                    const isCompleted = userSkill?.isCompleted || false;
                    const unmetPrereqs = (skill.prerequisites || []).filter(p => {
                      const us = getUserSkill(p.id);
                      return !us || !us.isUnlocked;
                    });
                    const lockTooltip = unmetPrereqs.length > 0
                      ? `Necesitas desbloquear: ${unmetPrereqs.map(p => p.name).join(', ')}`
                      : (canUnlock ? 'Listo para desbloquear' : 'Sin requisitos');

                    return (
                      <Card
                        key={skill.id}
                        data-skill-id={skill.id}
                        className={`relative transition-all duration-200 hover:shadow-md skill-card ${
                          isCompleted ? 'skill-completed' : 
                          isUnlocked ? 'skill-unlocked' : 
                          canUnlock ? 'skill-can-unlock' : 'skill-locked'
                        } ${branchColors[skill.branch] || 'bg-gray-50 border-gray-200'}`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                              <span className="text-xl">{branchIcons[skill.branch]}</span>
                              <div className="flex items-center gap-2">
                                {isCompleted ? (
                                  <Trophy className="h-4 w-4 text-green-600" />
                                ) : isUnlocked ? (
                                  <Unlock className="h-4 w-4 text-blue-600" />
                                ) : canUnlock ? (
                                  <Target className="h-4 w-4 text-orange-600" />
                                ) : (
                                  <Lock className="h-4 w-4 text-gray-400" title={lockTooltip} aria-label={lockTooltip} />
                                )}
                                <span>{skill.name}</span>
                              </div>
                            </CardTitle>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          {userSkill && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Progreso</span>
                                <span>{Math.round(progress)}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}

                          {userId && (
                            <div className="pt-1">
                              {isCompleted ? (
                                <div className="flex items-center gap-1 text-green-600 text-xs">
                                  <Trophy className="h-3 w-3" />
                                  <span className="font-medium">Completado</span>
                                </div>
                              ) : isUnlocked ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCompleteSkill(
                                    skill.id,
                                    skill.name,
                                    { xp: skill.xpReward, coins: skill.coinReward, strength: skill.strengthGained }
                                  )}
                                  disabled={isSkillActionLoading}
                                  className="w-full"
                                >
                                  <Target className="h-4 w-4 mr-1" />
                                  {isSkillActionLoading ? 'Completando...' : 'Completar'}
                                </Button>
                              ) : canUnlock ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleUnlockSkill(skill.id, skill.name)}
                                  disabled={isSkillActionLoading}
                                  className="w-full"
                                >
                                  <Unlock className="h-4 w-4 mr-1" />
                                  {isSkillActionLoading ? 'Desbloqueando...' : 'Desbloquear'}
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" disabled className="w-full opacity-50" title={lockTooltip} aria-label={lockTooltip}>
                                  <Lock className="h-4 w-4 mr-1" />
                                  Bloqueado
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-xs text-gray-400">Sin habilidades en esta rama</div>
                )}
              </div>
            ))}
          </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron habilidades en esta rama.
        </div>
      )}

          {/* Begin Training Session Button */}
          <div className="flex justify-center">
            <Button className="mt-2" variant="default">Comenzar sesión de entrenamiento</Button>
          </div>
    </TabsContent>

    <TabsContent value="achievements">
      <AchievementSystem 
        userStats={userStats}
        userSkills={userSkills}
        skills={skills}
      />
    </TabsContent>

    <TabsContent value="progress">
      <ProgressCharts 
        progressData={progressData}
        branchStats={branchStats}
        userInfo={userInfo}
      />
    </TabsContent>

    <TabsContent value="leaderboards">
      <Leaderboards currentUserId={userId} />
    </TabsContent>
  </Tabs>
</div>
  );
}