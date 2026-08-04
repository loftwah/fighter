export interface QuickFightSeedInput {
  playerIds: readonly string[];
  enemyIds: readonly string[];
  playerAccessoryId: string;
  enemyAccessoryId: string;
}

export function quickFightSeed(input: QuickFightSeedInput): number {
  return [
    ...input.playerIds,
    input.playerAccessoryId,
    "versus",
    ...input.enemyIds,
    input.enemyAccessoryId,
  ]
    .join(".")
    .split("")
    .reduce(
      (seed, character) =>
        Math.imul(seed ^ character.charCodeAt(0), 16_777_619) >>> 0,
      2_026_100,
    );
}
