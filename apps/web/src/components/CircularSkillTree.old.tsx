'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lock, Unlock, Star, Trophy, Target, Coins, Zap, Crown, Award, Sword, Shield, Play } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description: string;
  branch: 'EMPUJE' | 'TRACCION' | 'CORE' | 'EQUILIBRIO' | 'TREN_INFERIOR' | 'ESTATICOS';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  requiredSets: number;
  requiredReps: number;
  requiredDuration: number;
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

interface CircularSkillTreeProps {
  userId?: string;
}

// Mapeo de ramas a nombres tematicos basados en la imagen
const branchThemes = {
  EMPUJE: 'Push Up Academy',
  TRACCION: 'Pull Up Dungeon', 
  CORE: 'Molten Core',
  EQUILIBRIO: 'Handstand Club',
  TREN_INFERIOR: 'Iron Squat Coalition',
  ESTATICOS: 'Levers University'
};

// Iconos SVG para cada rama temática
const BranchIcon = ({ branch, className = "w-6 h-6" }: { branch: string; className?: string }) => {
  const icons = {
    'Push Up Academy': (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
        <path d="M8 11h8v2H8z" fill="white"/>
      </svg>
    ),
    'Pull Up Dungeon': (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 2h12v2H6V2zm0 18h12v2H6v-2zM8 6h8v12H8V6z"/>
        <circle cx="12" cy="12" r="2" fill="white"/>
      </svg>
    ),
    'Dragon\'s Lair': (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path d="M8 8h8v8H8z" fill="white"/>
      </svg>
    ),
    'Handstand Club': (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    'Iron Squat Coalition': (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 12h20v2H2v-2zm2-6h16v2H4V6zm4-4h8v2H8V2zm0 16h8v2H8v-2z"/>
      </svg>
    ),
    'Planche Dojo': (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none"/>
      </svg>
    )
  };
  
  return icons[branch as keyof typeof icons] || (
    <div className={`${className} bg-gray-400 rounded-full flex items-center justify-center text-white font-bold`}>
      ?
    </div>
  );
};

export default function CircularSkillTree({ userId }: CircularSkillTreeProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    fetchSkills();
    if (userId) {
      fetchUserSkills();
      fetchUserInfo();
    }
  }, [userId]);

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills?includePrerequisites=true');
      if (response.ok) {
        const data = await response.json();
        // La API devuelve { success, skills, total, filters }
        setSkills(Array.isArray(data) ? data : (data.skills || []));
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const fetchUserSkills = async () => {
    try {
      const response = await fetch(`/api/user/skills`);
      if (response.ok) {
        const data = await response.json();
        // La API devuelve { skills: skillsWithProgress }
        setUserSkills(data.skills || data.skillsWithProgress || []);
        if (data.userInfo) {
          setUserInfo(data.userInfo);
        }
      }
    } catch (error) {
      console.error('Error fetching user skills:', error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/level');
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data.user);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  // Asegurar que el loading se desactiva cuando todas las cargas iniciales terminan
  useEffect(() => {
    const load = async () => {
      await fetchSkills();
      if (userId) {
        await Promise.all([fetchUserSkills(), fetchUserInfo()]);
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const getUserSkill = (skillId: string): UserSkill | undefined => {
    return userSkills.find(us => us.skillId === skillId);
  };

  const calculateProgress = (userSkill: UserSkill): number => {
    return userSkill.completionProgress || 0;
  };

  // Agrupar skills por rama
  const skillsByBranch = skills.reduce((acc, skill) => {
    if (!acc[skill.branch]) {
      acc[skill.branch] = [];
    }
    acc[skill.branch].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Calcular posiciones circulares para las ramas
  const branches = Object.keys(skillsByBranch);
  const branchPositions = branches.map((branch, index) => {
    const angle = (index * 360) / branches.length;
    const radius = 200; // Radio del circulo principal
    const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
    const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
    return { branch, x, y, angle };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-red-700">
      {/* Fondo con patrón */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:50px_50px]"></div>
      </div>

      {/* Contenedor principal centrado */}
      <div className="relative flex items-center justify-center w-full h-full">
        <svg width="600" height="600" className="absolute">
          {/* Líneas de conexión desde el centro */}
          {branchPositions.map(({ branch, x, y }) => (
            <line
              key={`line-${branch}`}
              x1="300"
              y1="300"
              x2={300 + x}
              y2={300 + y}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          ))}

          {/* Circulo exterior decorativo */}
          <circle
            cx="300"
            cy="300"
            r="220"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            strokeDasharray="10,5"
          />
        </svg>

        {/* Centro - Start Here */}
        <div className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          <div className="relative">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-400 transition-colors cursor-pointer">
              <div className="text-center">
                <Play className="w-8 h-8 text-white mx-auto mb-1" />
                <span className="text-white text-xs font-bold">START</span>
              </div>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <span className="text-white text-sm font-bold">Start Here</span>
            </div>
          </div>
        </div>

        {/* Ramas temáticas */}
        {branchPositions.map(({ branch, x, y, angle }) => {
          const themeName = branchThemes[branch as keyof typeof branchThemes];
          const branchSkills = skillsByBranch[branch] || [];
          const completedSkills = branchSkills.filter(skill => {
            const userSkill = getUserSkill(skill.id);
            return userSkill?.isCompleted;
          }).length;

          return (
            <div
              key={branch}
              className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
            >
              {/* Nodo principal de la rama */}
              <div 
                className="relative cursor-pointer group"
                onClick={() => setSelectedSkill(branchSkills[0])}
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110 animate-pulse-slow">
                  <BranchIcon branch={themeName} className="w-8 h-8 text-red-800" />
                </div>
                
                {/* Efecto de brillo */}
                <div className="absolute inset-0 w-16 h-16 bg-white rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-ping"></div>
                
                {/* Nombre de la rama */}
                <div 
                  className="absolute whitespace-nowrap text-white text-sm font-bold mt-2 drop-shadow-lg"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: '100%'
                  }}
                >
                  {themeName}
                </div>

                {/* Progreso de la rama */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="text-center">
                    <div className="text-white text-xs drop-shadow">
                      {completedSkills}/{branchSkills.length}
                    </div>
                    <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500 animate-pulse"
                        style={{ width: `${(completedSkills / branchSkills.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Skills secundarios de la rama */}
                {branchSkills.slice(1, 4).map((skill, skillIndex) => {
                  const userSkill = getUserSkill(skill.id);
                  const isCompleted = userSkill?.isCompleted;
                  const isUnlocked = userSkill?.isUnlocked;
                  const canUnlock = userSkill?.canUnlock;
                  
                  const skillAngle = angle + (skillIndex - 1) * 30;
                  const skillRadius = 60;
                  const skillX = Math.cos((skillAngle - 90) * Math.PI / 180) * skillRadius;
                  const skillY = Math.sin((skillAngle - 90) * Math.PI / 180) * skillRadius;

                  return (
                    <div
                      key={skill.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group/skill"
                      style={{
                        left: `calc(50% + ${skillX}px)`,
                        top: `calc(50% + ${skillY}px)`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSkill(skill);
                      }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 group-hover/skill:scale-125 ${
                        isCompleted 
                          ? 'bg-gradient-to-br from-green-400 to-green-500 text-white animate-bounce-slow' 
                          : isUnlocked 
                            ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white animate-pulse'
                            : canUnlock
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white animate-pulse-fast'
                              : 'bg-white/50 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <Trophy className="w-4 h-4" />
                        ) : isUnlocked ? (
                          <Unlock className="w-4 h-4" />
                        ) : canUnlock ? (
                          <Target className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                      
                      {/* Efecto de partículas para skills completados */}
                      {isCompleted && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-sparkle-1"></div>
                          <div className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-sparkle-2"></div>
                          <div className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-sparkle-3"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel de informacion del skill seleccionado */}
      {selectedSkill && (
        <div className="absolute top-4 right-4 w-80 z-30">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{selectedSkill.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSkill(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{selectedSkill.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Dificultad:</span>
                  <Badge className={`${
                    selectedSkill.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                    selectedSkill.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                    selectedSkill.difficulty === 'ADVANCED' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedSkill.difficulty}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Recompensa:</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-blue-600" />
                      {selectedSkill.xpReward}
                    </span>
                    <span className="flex items-center gap-1">
                      <Coins className="w-3 h-3 text-yellow-600" />
                      {selectedSkill.coinReward}
                    </span>
                  </div>
                </div>

                {selectedSkill.strengthRequired > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Fuerza requerida:</span>
                    <span className={userInfo && userInfo.totalStrength >= selectedSkill.strengthRequired ? 'text-green-600' : 'text-red-600'}>
                      {userInfo?.totalStrength || 0}/{selectedSkill.strengthRequired}
                    </span>
                  </div>
                )}

                {userId && (
                  <div className="pt-2">
                    {(() => {
                      const userSkill = getUserSkill(selectedSkill.id);
                      const progress = userSkill ? calculateProgress(userSkill) : 0;
                      
                      if (userSkill?.isCompleted) {
                        return (
                          <div className="flex items-center gap-2 text-green-600">
                            <Trophy className="w-4 h-4" />
                            <span className="text-sm font-medium">Completado!</span>
                          </div>
                        );
                      } else if (userSkill?.isUnlocked) {
                        return (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progreso</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        );
                      } else if (userSkill?.canUnlock) {
                        return (
                          <Button className="w-full" size="sm">
                            <Target className="w-4 h-4 mr-2" />
                            Desbloquear
                          </Button>
                        );
                      } else {
                        return (
                          <div className="text-center text-sm text-gray-500">
                            <Lock className="w-4 h-4 mx-auto mb-1" />
                            Bloqueado
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Informacion del usuario en la esquina superior izquierda */}
      {userInfo && (
        <div className="absolute top-4 left-4 z-30">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold">Nivel {userInfo.currentLevel}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-blue-600" />
                    {userInfo.totalXP}
                  </span>
                  <span className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-600" />
                    {userInfo.virtualCoins}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sword className="w-4 h-4 text-red-600" />
                    {userInfo.totalStrength}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Marca de agua en la esquina inferior derecha */}
      <div className="absolute bottom-4 right-4 text-white/50 text-xs font-bold transform rotate-12">
        SPORT IS MY LIFE
      </div>
    </div>
  );
}