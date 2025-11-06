export type DevMission = {
  id: string;
  userId: string;
  date: Date;
  type: string;
  description: string;
  target: number | null;
  progress: number;
  completed: boolean;
  rewardXP: number;
  rewardCoins: number;
};

const store = new Map<string, DevMission[]>();

export function saveDailyMissions(userId: string, missions: DevMission[]) {
  store.set(userId, missions);
}

export function getDailyMissions(userId: string): DevMission[] | undefined {
  return store.get(userId);
}

export function getMissionById(
  missionId: string
): { userId: string; mission: DevMission } | null {
  for (const [uid, missions] of store.entries()) {
    const m = missions.find((mm) => mm.id === missionId);
    if (m) return { userId: uid, mission: m };
  }
  return null;
}

export function completeMissionById(missionId: string): DevMission | null {
  for (const [, missions] of store.entries()) {
    const m = missions.find((mm) => mm.id === missionId);
    if (m) {
      m.completed = true;
      m.progress = m.target ?? 1;
      return m;
    }
  }
  return null;
}