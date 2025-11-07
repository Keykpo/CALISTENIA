'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Crown, Star, Award, Zap, Target, Flame, Shield, Sword, Medal } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'BRANCH_MASTER' | 'STREAK' | 'SPEED' | 'DEDICATION' | 'EXPLORER' | 'LEGEND';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  requirement: {
    type: string;
    value: number;
    branch?: string;
  };
  reward: {
    xp: number;
    coins: number;
    title?: string;
  };
  unlockedAt?: string;
  progress: number;
  isUnlocked: boolean;
}

interface UserStats {
  completedSkills: number;
  totalStreak: number;
  maxStreak: number;
  branchProgress: Record<string, number>;
  totalXP: number;
  daysActive: number;
  fastestCompletion: number;
}

interface AchievementSystemProps {
  userStats: UserStats;
  onAchievementUnlock?: (achievement: Achievement) => void;
}

const achievementIcons = {
  BRANCH_MASTER: Crown,
  STREAK: Flame,
  SPEED: Zap,
  DEDICATION: Shield,
  EXPLORER: Target,
  LEGEND: Trophy,
};

const rarityColors = {
  COMMON: 'bg-gray-100 text-gray-800 border-gray-300',
  RARE: 'bg-blue-100 text-blue-800 border-blue-300',
  EPIC: 'bg-purple-100 text-purple-800 border-purple-300',
  LEGENDARY: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

const rarityGlow = {
  COMMON: 'shadow-gray-200',
  RARE: 'shadow-blue-200',
  EPIC: 'shadow-purple-200',
  LEGENDARY: 'shadow-yellow-200',
};

export default function AchievementSystem({ userStats, onAchievementUnlock }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  const defaultAchievements: Achievement[] = [
    // Branch Master Achievements
    {
      id: 'empuje_master',
      name: 'Maestro del Empuje',
      description: 'Completa todas las habilidades de la rama Empuje',
      icon: '💪',
      type: 'BRANCH_MASTER',
      rarity: 'EPIC',
      requirement: { type: 'BRANCH_COMPLETE', value: 100, branch: 'EMPUJE' },
      reward: { xp: 500, coins: 200, title: 'Maestro del Empuje' },
      progress: 0,
      isUnlocked: false,
    },
    {
      id: 'traccion_master',
      name: 'Señor de la Tracción',
      description: 'Completa todas las habilidades de la rama Tracción',
      icon: '🔥',
      type: 'BRANCH_MASTER',
      rarity: 'EPIC',
      requirement: { type: 'BRANCH_COMPLETE', value: 100, branch: 'TRACCION' },
      reward: { xp: 500, coins: 200, title: 'Señor de la Tracción' },
      progress: 0,
      isUnlocked: false,
    },
    {
      id: 'core_master',
      name: 'Núcleo de Acero',
      description: 'Completa todas las habilidades de la rama Core',
      icon: '⚡',
      type: 'BRANCH_MASTER',
      rarity: 'EPIC',
      requirement: { type: 'BRANCH_COMPLETE', value: 100, branch: 'CORE' },
      reward: { xp: 500, coins: 200, title: 'Núcleo de Acero' },
      progress: 0,
      isUnlocked: false,
    },
    
    // Streak Achievements
    {
      id: 'streak_7',
      name: 'Semana Perfecta',
      description: 'Entrena 7 días consecutivos',
      icon: '🔥',
      type: 'STREAK',
      rarity: 'COMMON',
      requirement: { type: 'STREAK', value: 7 },
      reward: { xp: 100, coins: 50 },
      progress: 0,
      isUnlocked: false,
    },
    {
      id: 'streak_30',
      name: 'Mes Imparable',
      description: 'Entrena 30 días consecutivos',
      icon: '🔥',
      type: 'STREAK',
      rarity: 'RARE',
      requirement: { type: 'STREAK', value: 30 },
      reward: { xp: 300, coins: 150, title: 'Imparable' },
      progress: 0,
      isUnlocked: false,
    },
    {
      id: 'streak_100',
      name: 'Centurión',
      description: 'Entrena 100 días consecutivos',
      icon: '🔥',
      type: 'STREAK',
      rarity: 'LEGENDARY',
      requirement: { type: 'STREAK', value: 100 },
      reward: { xp: 1000, coins: 500, title: 'Centurión' },
      progress: 0,
      isUnlocked: false,
    },

    // Speed Achievements
    {
      id: 'speed_demon',
      name: 'Demonio de la Velocidad',
      description: 'Completa una habilidad en menos de 3 días',
      icon: '⚡',
      type: 'SPEED',
      rarity: 'RARE',
      requirement: { type: 'FAST_COMPLETION', value: 3 },
      reward: { xp: 200, coins: 100 },
      progress: 0,
      isUnlocked: false,
    },

    // Dedication Achievements
    {
      id: 'dedication_50',
      name: 'Guerrero Dedicado',
      description: 'Completa 50 habilidades',
      icon: '🛡️',
      type: 'DEDICATION',
      rarity: 'RARE',
      requirement: { type: 'SKILLS_COMPLETED', value: 50 },
      reward: { xp: 400, coins: 200, title: 'Guerrero' },
      progress: 0,
      isUnlocked: false,
    },
    {
      id: 'dedication_100',
      name: 'Leyenda Viviente',
      description: 'Completa 100 habilidades',
      icon: '👑',
      type: 'LEGEND',
      rarity: 'LEGENDARY',
      requirement: { type: 'SKILLS_COMPLETED', value: 100 },
      reward: { xp: 1000, coins: 1000, title: 'Leyenda Viviente' },
      progress: 0,
      isUnlocked: false,
    },

    // Explorer Achievements
    {
      id: 'explorer',
      name: 'Explorador',
      description: 'Desbloquea al menos una habilidad de cada rama',
      icon: '🎯',
      type: 'EXPLORER',
      rarity: 'COMMON',
      requirement: { type: 'ALL_BRANCHES', value: 6 },
      reward: { xp: 150, coins: 75 },
      progress: 0,
      isUnlocked: false,
    },
  ];

  const calculateProgress = (achievement: Achievement): number => {
    switch (achievement.requirement.type) {
      case 'BRANCH_COMPLETE':
        const branchProgress = userStats.branchProgress[achievement.requirement.branch!] || 0;
        return Math.min(branchProgress, achievement.requirement.value);
      
      case 'STREAK':
        return Math.min(userStats.maxStreak, achievement.requirement.value);
      
      case 'SKILLS_COMPLETED':
        return Math.min(userStats.completedSkills, achievement.requirement.value);
      
      case 'FAST_COMPLETION':
        return userStats.fastestCompletion <= achievement.requirement.value ? achievement.requirement.value : 0;
      
      case 'ALL_BRANCHES':
        const branchesWithProgress = Object.values(userStats.branchProgress).filter(progress => progress > 0).length;
        return Math.min(branchesWithProgress, achievement.requirement.value);
      
      default:
        return 0;
    }
  };

  const checkForNewAchievements = () => {
    const updatedAchievements = achievements.map(achievement => {
      const progress = calculateProgress(achievement);
      const wasUnlocked = achievement.isUnlocked;
      const isNowUnlocked = progress >= achievement.requirement.value;
      
      if (!wasUnlocked && isNowUnlocked) {
        setNewlyUnlocked(prev => [...prev, { ...achievement, isUnlocked: true, progress }]);
        onAchievementUnlock?.({ ...achievement, isUnlocked: true, progress });
      }
      
      return {
        ...achievement,
        progress,
        isUnlocked: isNowUnlocked,
        unlockedAt: isNowUnlocked && !wasUnlocked ? new Date().toISOString() : achievement.unlockedAt,
      };
    });
    
    setAchievements(updatedAchievements);
  };

  const showAchievementNotification = () => {
    if (newlyUnlocked.length > 0) {
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        setNewlyUnlocked([]);
      }, 5000);
    }
  };

  useEffect(() => {
    setAchievements(defaultAchievements);
  }, []);

  useEffect(() => {
    checkForNewAchievements();
  }, [userStats]);

  useEffect(() => {
    showAchievementNotification();
  }, [newlyUnlocked]);

  const getProgressPercentage = (achievement: Achievement): number => {
    return (achievement.progress / achievement.requirement.value) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Achievement Notification */}
      {showNotification && newlyUnlocked.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {newlyUnlocked.map((achievement) => (
            <Card key={achievement.id} className="achievement-notification bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <h4 className="font-bold">¡Logro Desbloqueado!</h4>
                    <p className="text-sm opacity-90">{achievement.name}</p>
                  </div>
                  <Trophy className="w-6 h-6 ml-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const IconComponent = achievementIcons[achievement.type] || Trophy;
          const progressPercentage = getProgressPercentage(achievement);
          
          return (
            <Card
              key={achievement.id}
              className={`achievement-card transition-all duration-300 ${
                achievement.isUnlocked
                  ? `${rarityGlow[achievement.rarity]} shadow-lg scale-105`
                  : 'opacity-75 hover:opacity-90'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${achievement.isUnlocked ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                      <IconComponent className={`w-5 h-5 ${achievement.isUnlocked ? 'text-yellow-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{achievement.name}</CardTitle>
                      <Badge className={`text-xs ${rarityColors[achievement.rarity]}`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-2xl">{achievement.icon}</div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progreso</span>
                    <span>{achievement.progress}/{achievement.requirement.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        achievement.isUnlocked
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                          : 'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
                
                {/* Rewards */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center">
                      <Zap className="w-3 h-3 mr-1 text-blue-500" />
                      {achievement.reward.xp} XP
                    </span>
                    <span className="flex items-center">
                      <Medal className="w-3 h-3 mr-1 text-yellow-500" />
                      {achievement.reward.coins}
                    </span>
                  </div>
                  {achievement.reward.title && (
                    <Badge variant="outline" className="text-xs">
                      {achievement.reward.title}
                    </Badge>
                  )}
                </div>
                
                {achievement.isUnlocked && achievement.unlockedAt && (
                  <div className="mt-2 text-xs text-gray-500">
                    Desbloqueado: {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <style jsx>{`
        .achievement-card {
          position: relative;
          overflow: hidden;
        }
        
        .achievement-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
        }
        
        .achievement-card:hover::before {
          left: 100%;
        }
        
        .achievement-notification {
          animation: slideInRight 0.5s ease-out, pulse 2s infinite 0.5s;
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}