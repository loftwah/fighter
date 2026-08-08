import type { CombatantBuild } from "../combat/types";
import { findPatch } from "../progression/patches";

/**
 * Materialise the equipped Quick Fight Modification into a Battle build.
 * Quick Fight drafts keep allocatable stats separate from Modification effects,
 * so changing a Modification never consumes or invents stat points.
 */
export function buildWithModificationEffect(
  source: CombatantBuild,
): CombatantBuild {
  const patch = findPatch(source.equippedPatchId ?? null);
  if (!patch || patch.effect.kind === "openingCharge") return source;
  if (patch.effect.kind === "interruptionResistance") {
    return {
      ...source,
      interruptionResistance: patch.effect.chance,
    };
  }
  return {
    ...source,
    statBonuses: {
      ...source.statBonuses,
      [patch.effect.stat]:
        (source.statBonuses?.[patch.effect.stat] ?? 0) + patch.effect.amount,
    },
  };
}
