"use client";

import SkillPathHorizontal from './SkillPathHorizontal';

export default function CircularSkillTree({ userId }: { userId?: string }) {
  return <SkillPathHorizontal userId={userId} />;
}
