import type {
  ActionTier,
  CharacterDefinition,
  CombatantBuild,
  StatBlock,
} from "../combat/types";
import type { OwnedCharacter } from "../persistence/save";

export type PatchEffect =
  | { kind: "openingCharge"; amount: number }
  | { kind: "interruptionResistance"; chance: number }
  | { kind: "stat"; stat: keyof StatBlock; amount: number };

export interface PatchDefinition {
  id: string;
  name: string;
  description: string;
  effect: PatchEffect;
}

export const patches: PatchDefinition[] = [
  {
    id: "patch.hot-start",
    name: "Hot Start",
    description: "Add 18 opening Charge to the shared Strip.",
    effect: { kind: "openingCharge", amount: 18 },
  },
  {
    id: "patch.no-flinch",
    name: "No Flinch",
    description:
      "Gain a 50% seeded chance for a charging Move to resist interruption.",
    effect: { kind: "interruptionResistance", chance: 0.5 },
  },
  {
    id: "patch.heavy-ink",
    name: "Heavy Ink",
    description: "Add 3 effective Power.",
    effect: { kind: "stat", stat: "power", amount: 3 },
  },
  {
    id: "patch.lucky-misprint",
    name: "Lucky Misprint",
    description: "Add 4 effective Fortune.",
    effect: { kind: "stat", stat: "fortune", amount: 4 },
  },
];

export function findPatch(patchId: string | null): PatchDefinition | null {
  return patches.find((patch) => patch.id === patchId) ?? null;
}

function resolvedActionOrder(
  owned: OwnedCharacter,
  definition: CharacterDefinition,
): [string, string, string] {
  const authored = new Set(definition.actionIds);
  if (
    owned.actionOrder.length === 3 &&
    new Set(owned.actionOrder).size === 3 &&
    owned.actionOrder.every((actionId) => authored.has(actionId))
  ) {
    return owned.actionOrder as [string, string, string];
  }
  return definition.actionIds;
}

export function buildForOwnedCharacter(
  owned: OwnedCharacter,
  definition: CharacterDefinition,
): CombatantBuild {
  if (owned.characterId !== definition.id) {
    throw new Error(
      `Owned instance ${owned.instanceId} does not match ${definition.id}`,
    );
  }
  const statBonuses = { ...owned.statAllocations };
  let interruptionResistance = 0;
  const patch = findPatch(owned.equippedPatchId);
  if (patch?.effect.kind === "stat") {
    statBonuses[patch.effect.stat] += patch.effect.amount;
  }
  if (patch?.effect.kind === "interruptionResistance") {
    interruptionResistance = patch.effect.chance;
  }
  const actionIds = resolvedActionOrder(owned, definition);
  const actionTiers = Object.fromEntries(
    actionIds.map((actionId) => [
      actionId,
      owned.actionTiers[actionId] ?? ("stock" satisfies ActionTier),
    ]),
  );
  return {
    instanceId: owned.instanceId,
    level: owned.level,
    statBonuses,
    actionIds,
    actionTiers,
    interruptionResistance,
    equippedPatchId: owned.equippedPatchId,
  };
}

export function openingChargeBonus(builds: CombatantBuild[]): number {
  return builds.reduce((total, build) => {
    const patch = findPatch(build.equippedPatchId ?? null);
    return patch?.effect.kind === "openingCharge"
      ? total + patch.effect.amount
      : total;
  }, 0);
}

export function equipPatch(
  collection: OwnedCharacter[],
  ownedPatchIds: string[],
  instanceId: string,
  patchId: string | null,
): OwnedCharacter[] {
  const selected = collection.find((entry) => entry.instanceId === instanceId);
  if (!selected) {
    throw new Error(`Unknown owned Relic: ${instanceId}`);
  }
  if (selected.level < 5 && patchId) {
    throw new Error("Patch slots unlock at level 5");
  }
  if (patchId && !ownedPatchIds.includes(patchId)) {
    throw new Error(`Patch is not owned: ${patchId}`);
  }
  return collection.map((entry) => ({
    ...entry,
    equippedPatchId:
      entry.instanceId === instanceId
        ? patchId
        : entry.equippedPatchId === patchId
          ? null
          : entry.equippedPatchId,
  }));
}
