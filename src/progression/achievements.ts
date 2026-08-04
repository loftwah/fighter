import type { SaveData } from "../persistence/save";

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  target: number;
  progress: (save: SaveData) => number;
}

export interface AchievementProgress extends AchievementDefinition {
  current: number;
  complete: boolean;
}

export const achievements: AchievementDefinition[] = [
  {
    id: "achievement.first-print",
    name: "First Print",
    description: "Add the first Character to a Collection.",
    target: 1,
    progress: (save) => save.collection.length,
  },
  {
    id: "achievement.drawer-space",
    name: "Drawer Space",
    description: "Own three Characters in one Player profile.",
    target: 3,
    progress: (save) => save.collection.length,
  },
  {
    id: "achievement.invoice-denied",
    name: "History Settled",
    description: "Clear the History Disagrees story fight.",
    target: 1,
    progress: (save) =>
      save.clearedNodeIds.includes("story.first-run.02") ? 1 : 0,
  },
  {
    id: "achievement.paid-in-full",
    name: "Paid in Full",
    description: "Claim a Mission reward.",
    target: 1,
    progress: (save) => save.claimedMissionIds.length,
  },
  {
    id: "achievement.cheap-seat",
    name: "Wrong Door Champion",
    description: "Collect a Tournament Trophy.",
    target: 1,
    progress: (save) => save.tournamentTrophyIds.length,
  },
  {
    id: "achievement.first-run",
    name: "This Explained Nothing",
    description: "Complete the First Run story.",
    target: 1,
    progress: (save) =>
      save.clearedNodeIds.includes("story.first-run.07") ? 1 : 0,
  },
];

export function evaluateAchievements(save: SaveData): AchievementProgress[] {
  return achievements.map((achievement) => {
    const current = Math.min(
      achievement.target,
      Math.max(0, Math.floor(achievement.progress(save))),
    );
    return {
      ...achievement,
      current,
      complete: current >= achievement.target,
    };
  });
}
