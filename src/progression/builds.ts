import type {
  ActionDefinition,
  ActionPosition,
  ActionTier,
  CharacterDefinition,
  StatBlock,
} from "../combat/types";
import { actionPositionForSlot } from "../combat/rules";
import type { OwnedCharacter } from "../persistence/save";

export const ALLOCATABLE_STATS = [
  "health",
  "power",
  "evasion",
  "fortune",
  "tempo",
] as const satisfies readonly (keyof StatBlock)[];

export function resolvedActionOrder(
  owned: OwnedCharacter,
  definition: CharacterDefinition,
): [string, string, string] {
  const authored = new Set(definition.actionIds);
  if (
    owned.actionOrder.length === 3 &&
    new Set(owned.actionOrder).size === 3 &&
    owned.actionOrder.every((actionId) => authored.has(actionId))
  ) {
    return [...owned.actionOrder] as [string, string, string];
  }
  return [...definition.actionIds];
}

export function resolvedActionPosition(
  owned: OwnedCharacter,
  definition: CharacterDefinition,
  action: ActionDefinition,
): ActionPosition {
  const slotIndex = resolvedActionOrder(owned, definition).indexOf(action.id);
  if (slotIndex < 0) {
    throw new Error(`Move ${action.id} does not belong to ${definition.id}`);
  }
  const configured = owned.actionPositions[action.id];
  if (configured?.startsWith(String(slotIndex + 1))) {
    return configured;
  }
  return actionPositionForSlot(action.position, slotIndex);
}

function selectedOwnedCharacter(
  collection: OwnedCharacter[],
  instanceId: string,
): OwnedCharacter {
  const selected = collection.find((entry) => entry.instanceId === instanceId);
  if (!selected) {
    throw new Error(`Unknown owned Character: ${instanceId}`);
  }
  return selected;
}

export function adjustStatAllocation(
  collection: OwnedCharacter[],
  instanceId: string,
  stat: keyof StatBlock,
  delta: -1 | 1,
): OwnedCharacter[] {
  const selected = selectedOwnedCharacter(collection, instanceId);
  if (!ALLOCATABLE_STATS.includes(stat)) {
    throw new Error(`Unknown allocatable stat: ${stat}`);
  }
  if (delta > 0 && selected.unspentStatPoints < 1) {
    throw new Error("No unspent stat points remain");
  }
  if (delta < 0 && selected.statAllocations[stat] < 1) {
    throw new Error(`No ${stat} points are allocated`);
  }

  return collection.map((entry) =>
    entry.instanceId === instanceId
      ? {
          ...entry,
          unspentStatPoints: entry.unspentStatPoints - delta,
          statAllocations: {
            ...entry.statAllocations,
            [stat]: entry.statAllocations[stat] + delta,
          },
        }
      : entry,
  );
}

export function moveOwnedAction(
  collection: OwnedCharacter[],
  instanceId: string,
  definition: CharacterDefinition,
  actionId: string,
  direction: -1 | 1,
): OwnedCharacter[] {
  const selected = selectedOwnedCharacter(collection, instanceId);
  if (selected.characterId !== definition.id) {
    throw new Error(
      `Owned instance ${instanceId} does not match ${definition.id}`,
    );
  }
  if (selected.level < 10) {
    throw new Error("Move ordering unlocks at level 10");
  }
  const order = resolvedActionOrder(selected, definition);
  const fromIndex = order.indexOf(actionId);
  const toIndex = fromIndex + direction;
  if (fromIndex < 0 || toIndex < 0 || toIndex >= order.length) {
    throw new Error("That Move cannot be moved farther");
  }
  [order[fromIndex], order[toIndex]] = [order[toIndex]!, order[fromIndex]!];
  const actionPositions = { ...selected.actionPositions };
  for (const [index, orderedActionId] of order.entries()) {
    const configured = actionPositions[orderedActionId];
    if (!configured) {
      continue;
    }
    actionPositions[orderedActionId] =
      `${index + 1}${configured.slice(1)}` as ActionPosition;
  }

  return collection.map((entry) =>
    entry.instanceId === instanceId
      ? { ...entry, actionOrder: [...order], actionPositions }
      : entry,
  );
}

export function setOwnedActionPosition(
  collection: OwnedCharacter[],
  instanceId: string,
  definition: CharacterDefinition,
  actionId: string,
  position: ActionPosition,
): OwnedCharacter[] {
  const selected = selectedOwnedCharacter(collection, instanceId);
  if (selected.characterId !== definition.id) {
    throw new Error(
      `Owned instance ${instanceId} does not match ${definition.id}`,
    );
  }
  if (selected.level < 10) {
    throw new Error("Move positioning unlocks at level 10");
  }
  const slotIndex = resolvedActionOrder(selected, definition).indexOf(actionId);
  if (slotIndex < 0) {
    throw new Error("That Move does not belong to this Character");
  }
  if (!position.startsWith(String(slotIndex + 1))) {
    throw new Error(`That Move must remain in Charge band ${slotIndex + 1}`);
  }
  return collection.map((entry) =>
    entry.instanceId === instanceId
      ? {
          ...entry,
          actionPositions: {
            ...entry.actionPositions,
            [actionId]: position,
          },
        }
      : entry,
  );
}

const NEXT_TIER: Record<ActionTier, ActionTier | null> = {
  stock: "gold",
  gold: "platinum",
  platinum: null,
};

export function enhanceOwnedAction(
  collection: OwnedCharacter[],
  instanceId: string,
  definition: CharacterDefinition,
  actionId: string,
  donorInstanceId: string,
): OwnedCharacter[] {
  const selected = selectedOwnedCharacter(collection, instanceId);
  const donor = selectedOwnedCharacter(collection, donorInstanceId);
  if (selected.instanceId === donor.instanceId) {
    throw new Error("A Character cannot enhance itself");
  }
  if (
    selected.characterId !== definition.id ||
    donor.characterId !== definition.id
  ) {
    throw new Error("Move enhancement requires a matching duplicate");
  }
  if (selected.level < 10) {
    throw new Error("Move enhancement unlocks at level 10");
  }
  if (!definition.actionIds.includes(actionId)) {
    throw new Error("That Move does not belong to this Character");
  }
  const currentTier = selected.actionTiers[actionId] ?? "stock";
  const nextTier = NEXT_TIER[currentTier];
  if (!nextTier) {
    throw new Error("That Move is already at its maximum tier");
  }

  return collection
    .filter((entry) => entry.instanceId !== donorInstanceId)
    .map((entry) =>
      entry.instanceId === instanceId
        ? {
            ...entry,
            actionTiers: {
              ...entry.actionTiers,
              [actionId]: nextTier,
            },
          }
        : entry,
    );
}
