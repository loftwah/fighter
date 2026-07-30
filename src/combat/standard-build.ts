import type { CharacterDefinition, CombatantBuild, StatBlock } from "./types";

export const STANDARD_MATCH_LEVEL = 10;
export const STANDARD_STAT_POINT_BUDGET = STANDARD_MATCH_LEVEL - 1;

export const STANDARD_STAT_ALLOCATIONS: StatBlock = {
  health: 2,
  power: 2,
  evasion: 2,
  fortune: 2,
  tempo: 1,
};

export function createStandardBuild(
  definition: CharacterDefinition,
  side: "player" | "enemy",
  index: number,
): CombatantBuild {
  return {
    instanceId: `standard.${side}.${index}.${definition.id}`,
    level: STANDARD_MATCH_LEVEL,
    statBonuses: { ...STANDARD_STAT_ALLOCATIONS },
    actionIds: definition.actionIds,
    actionTiers: Object.fromEntries(
      definition.actionIds.map((actionId) => [actionId, "stock"]),
    ),
    interruptionResistance: 0,
    equippedPatchId: null,
  };
}
