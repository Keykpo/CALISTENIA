'use client';

import FigLevelSkillPath from '../FigLevelSkillPath';
import { DifficultyLevel } from '@/lib/fig-level-progressions';

interface SkillTreeViewProps {
  userId: string;
  userLevel?: DifficultyLevel;
}

export default function SkillTreeView({ userId, userLevel = 'BEGINNER' }: SkillTreeViewProps) {
  return (
    <div className="w-full">
      <FigLevelSkillPath userLevel={userLevel} userId={userId} />
    </div>
  );
}
