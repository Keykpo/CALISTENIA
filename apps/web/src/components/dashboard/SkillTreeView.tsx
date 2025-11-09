'use client';

import { useEffect, useState } from 'react';
import FigLevelSkillPath from '../FigLevelSkillPath';
import { DifficultyLevel } from '@/lib/fig-level-progressions';

interface SkillTreeViewProps {
  userId: string;
}

export default function SkillTreeView({ userId }: SkillTreeViewProps) {
  const [userSkillProgress, setUserSkillProgress] = useState<Record<string, DifficultyLevel>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserSkillProgress();
  }, [userId]);

  const fetchUserSkillProgress = async () => {
    try {
      const res = await fetch(`/api/skill-progress/${userId}`);
      if (res.ok) {
        const data = await res.json();
        // Convert array to object: { "HANDSTAND": "INTERMEDIATE", "PLANCHE": "BEGINNER", ... }
        const progressMap = data.reduce((acc: Record<string, DifficultyLevel>, item: any) => {
          acc[item.skillBranch] = item.currentLevel as DifficultyLevel;
          return acc;
        }, {});
        setUserSkillProgress(progressMap);
      }
    } catch (error) {
      console.error('Error fetching user skill progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-slate-600">Loading your skill progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <FigLevelSkillPath 
        userId={userId} 
        userSkillProgress={userSkillProgress}
        onProgressUpdate={fetchUserSkillProgress}
      />
    </div>
  );
}
