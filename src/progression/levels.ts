export const LEVEL_CAP = 25;

export function xpForNextLevel(level: number): number {
  if (level >= LEVEL_CAP) {
    return 0;
  }
  return 70 + level * 35;
}

export interface LevelProgress {
  level: number;
  xp: number;
  unspentStatPoints: number;
  levelsGained: number;
}

export function addXp(
  current: Omit<LevelProgress, "levelsGained">,
  amount: number,
): LevelProgress {
  let { level, xp, unspentStatPoints } = current;
  let levelsGained = 0;
  xp += Math.max(0, Math.floor(amount));

  while (level < LEVEL_CAP) {
    const needed = xpForNextLevel(level);
    if (xp < needed) {
      break;
    }
    xp -= needed;
    level += 1;
    levelsGained += 1;
    unspentStatPoints += 1;
  }

  if (level >= LEVEL_CAP) {
    xp = 0;
  }

  return { level, xp, unspentStatPoints, levelsGained };
}
