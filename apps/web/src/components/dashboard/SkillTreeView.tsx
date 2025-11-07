'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TreePine,
  Lock,
  Unlock,
  Zap,
  Award,
  TrendingUp,
  Target,
  RefreshCw
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  branch: string;
  xpReward: number;
  coinReward: number;
  strengthRequired: number;
  strengthGained: number;
  requiredReps?: number;
  requiredDuration?: number;
  requiredDays: number;
  prerequisites: any[];
  isUnlocked: boolean;
  userProgress?: {
    currentReps: number;
    currentDuration: number;
    daysCompleted: number;
    completionProgress: number;
  };
}

interface SkillTreeViewProps {
  userId: string;
}

const BRANCH_INFO = {
  EMPUJE: { name: 'Empuje', color: 'blue', icon: '💪' },
  TRACCION: { name: 'Tracción', color: 'green', icon: '🏋️' },
  CORE: { name: 'Core', color: 'purple', icon: '🔥' },
  EQUILIBRIO: { name: 'Equilibrio', color: 'yellow', icon: '⚖️' },
  TREN_INFERIOR: { name: 'Tren Inferior', color: 'red', icon: '🦵' },
  ESTATICOS: { name: 'Estáticos', color: 'indigo', icon: '🧘' },
  CALENTAMIENTO: { name: 'Calentamiento', color: 'orange', icon: '🔆' },
};

const DIFFICULTY_COLORS = {
  BEGINNER: 'bg-green-100 text-green-800 border-green-300',
  INTERMEDIATE: 'bg-blue-100 text-blue-800 border-blue-300',
  ADVANCED: 'bg-purple-100 text-purple-800 border-purple-300',
  EXPERT: 'bg-red-100 text-red-800 border-red-300',
};

export default function SkillTreeView({ userId }: SkillTreeViewProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');

  useEffect(() => {
    fetchSkills();
  }, [userId]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/skills', {
        headers: { 'x-user-id': userId },
      });

      if (res.ok) {
        const data = await res.json();
        setSkills(data.skills || []);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group skills by branch
  const skillsByBranch = skills.reduce((acc, skill) => {
    if (!acc[skill.branch]) acc[skill.branch] = [];
    acc[skill.branch].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Filter skills
  const filteredSkills = selectedBranch === 'ALL'
    ? skills
    : skillsByBranch[selectedBranch] || [];

  // Calculate stats
  const totalSkills = skills.length;
  const unlockedSkills = skills.filter(s => s.isUnlocked).length;
  const completedSkills = skills.filter(s => s.userProgress?.completionProgress === 100).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-slate-600 mt-3">Cargando árbol de habilidades...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total de Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSkills}</div>
            <p className="text-xs text-slate-500 mt-1">
              Skills disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Desbloqueadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">{unlockedSkills}</span>
              <span className="text-slate-500">/ {totalSkills}</span>
            </div>
            <Progress
              value={(unlockedSkills / totalSkills) * 100}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">{completedSkills}</span>
              <span className="text-slate-500">/ {unlockedSkills}</span>
            </div>
            <Progress
              value={unlockedSkills > 0 ? (completedSkills / unlockedSkills) * 100 : 0}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Branch Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="w-5 h-5" />
            Ramas de Habilidades
          </CardTitle>
          <CardDescription>
            Explora y desbloquea habilidades en cada rama
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedBranch === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedBranch('ALL')}
            >
              Todas ({totalSkills})
            </Button>
            {Object.entries(BRANCH_INFO).map(([key, info]) => {
              const count = skillsByBranch[key]?.length || 0;
              return (
                <Button
                  key={key}
                  variant={selectedBranch === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBranch(key)}
                  className="gap-1"
                >
                  <span>{info.icon}</span>
                  <span>{info.name}</span>
                  <Badge variant="secondary" className="ml-1">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Skills List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSkills.length > 0 ? (
          filteredSkills.map((skill) => (
            <Card
              key={skill.id}
              className={`transition-all ${
                skill.isUnlocked ? 'hover:shadow-lg' : 'opacity-75'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {skill.isUnlocked ? (
                        <Unlock className="w-4 h-4 text-green-600" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-400" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {BRANCH_INFO[skill.branch as keyof typeof BRANCH_INFO]?.icon}{' '}
                        {BRANCH_INFO[skill.branch as keyof typeof BRANCH_INFO]?.name}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{skill.name}</CardTitle>
                  </div>
                  <Badge
                    className={DIFFICULTY_COLORS[skill.difficulty as keyof typeof DIFFICULTY_COLORS]}
                  >
                    {skill.difficulty}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600 line-clamp-2">
                  {skill.description}
                </p>

                {/* Requirements */}
                <div className="space-y-2 text-sm">
                  {skill.requiredReps && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Target className="w-4 h-4" />
                      <span>
                        {skill.requiredReps} reps x {skill.requiredDays} días
                      </span>
                    </div>
                  )}
                  {skill.requiredDuration && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Target className="w-4 h-4" />
                      <span>
                        {skill.requiredDuration}s x {skill.requiredDays} días
                      </span>
                    </div>
                  )}
                </div>

                {/* Rewards */}
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div className="flex items-center gap-1 text-sm">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className="font-medium text-purple-600">
                      +{skill.xpReward} XP
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-amber-600">
                      +{skill.coinReward}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-blue-600">
                      +{skill.strengthGained}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                {skill.isUnlocked && skill.userProgress && (
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Progreso</span>
                      <span>{Math.round(skill.userProgress.completionProgress)}%</span>
                    </div>
                    <Progress
                      value={skill.userProgress.completionProgress}
                      className="h-2"
                    />
                  </div>
                )}

                {/* Prerequisites */}
                {!skill.isUnlocked && skill.prerequisites.length > 0 && (
                  <div className="pt-2 text-xs text-slate-500">
                    <Lock className="w-3 h-3 inline mr-1" />
                    Requiere: {skill.prerequisites.map((p: any) => p.name).join(', ')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <TreePine className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">No hay skills en esta rama todavía</p>
            <Button onClick={fetchSkills} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
