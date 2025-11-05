'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Lock, Play } from 'lucide-react';

type Branch = 'EMPUJE' | 'TRACCION' | 'PULL' | 'CORE' | 'EQUILIBRIO' | 'TREN_INFERIOR' | 'ESTATICOS';

interface Skill {
  id: string;
  name: string;
  description?: string;
  branch: Branch;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  prerequisites?: Skill[];
}

interface UserSkill {
  id: string;
  skillId: string;
  userId: string;
  isCompleted: boolean;
  isUnlocked: boolean;
  completionProgress: number;
}

interface SkillPathProps {
  userId?: string;
}

const branchLabels: Record<Exclude<Branch, 'PULL'>, string> = {
  EMPUJE: 'Push',
  TRACCION: 'Tracción',
  CORE: 'Core',
  EQUILIBRIO: 'Balance',
  TREN_INFERIOR: 'Lower Body',
  ESTATICOS: 'Statics',
};

const displayOrder: (keyof typeof branchLabels)[] = [
  'EMPUJE',
  'TRACCION',
  'CORE',
  'EQUILIBRIO',
  'TREN_INFERIOR',
  'ESTATICOS',
];

function SkillCard({ skill, status }: { skill: Skill; status?: UserSkill }) {
  const isCompleted = status?.isCompleted;
  const isUnlocked = status?.isUnlocked;
  const progress = Math.round(status?.completionProgress ?? 0);

  return (
    <Card
      className="min-w-[200px] bg-white border shadow-sm hover:shadow-md transition-shadow"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-muted-foreground">{skill.branch}</div>
            <div className="font-semibold text-gray-900">{skill.name}</div>
          </div>
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          ) : isUnlocked ? (
            <Badge variant="outline" className="text-sky-600 border-sky-300">Unlocked</Badge>
          ) : (
            <Lock className="h-5 w-5 text-gray-400" />
          )}
        </div>
        {isUnlocked && !isCompleted && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <div className="mt-1 text-xs text-muted-foreground">{progress}%</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SkillPath({ userId }: SkillPathProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const sRes = await fetch('/api/skills?includePrerequisites=true');
        const sData = await sRes.json();
        setSkills(Array.isArray(sData) ? sData : sData.skills || []);

        if (userId) {
          const uRes = await fetch('/api/user/skills');
          const uData = await uRes.json();
          setUserSkills(uData.skills || uData.skillsWithProgress || uData || []);
        }
      } catch (e) {
        console.error('SkillPath load error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const byBranch = useMemo(() => {
    const acc: Record<string, Skill[]> = {};
    for (const s of skills) {
      acc[s.branch] = acc[s.branch] || [];
      acc[s.branch].push(s);
    }
    for (const key of Object.keys(acc)) {
      acc[key] = acc[key].sort((a, b) => {
        const al = a.prerequisites?.length || 0;
        const bl = b.prerequisites?.length || 0;
        if (al !== bl) return al - bl;
        return a.name.localeCompare(b.name);
      });
    }
    return acc;
  }, [skills]);

  const statusBySkillId = useMemo(() => {
    const m = new Map<string, UserSkill>();
    for (const us of userSkills) m.set(us.skillId, us);
    return m;
  }, [userSkills]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Calisthenics Skill Path</h2>
        <p className="text-sm text-muted-foreground">Visualiza tu progreso y ruta de desbloqueo</p>
      </div>

      <div className="flex flex-wrap gap-6 mb-6">
        {displayOrder.map((br) => (
          <div key={br} className="text-sm text-muted-foreground">
            {branchLabels[br]}
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {displayOrder.map((br) => {
          const laneSkills = byBranch[br] || [];
          if (laneSkills.length === 0) return null;
          return (
            <div key={br} className="relative">
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                {laneSkills.map((skill, idx) => (
                  <React.Fragment key={skill.id}>
                    <SkillCard skill={skill} status={statusBySkillId.get(skill.id)} />
                    {idx < laneSkills.length - 1 && (
                      <div className="flex-1 h-0.5 min-w-[40px] bg-sky-300/60" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <Button size="lg" className="bg-sky-600 hover:bg-sky-700">
          <Play className="h-4 w-4 mr-2" />
          Begin Training Session
        </Button>
      </div>
    </div>
  );
}
