import { describe, expect, it } from "vitest";
import { combatContent } from "../content/initial-content";
import { createOwnedCharacter } from "../persistence/save";
import {
  adjustStatAllocation,
  enhanceOwnedAction,
  moveOwnedAction,
  resolvedActionOrder,
  resolvedActionPosition,
  setOwnedActionPosition,
} from "./builds";

describe("owned Character build management", () => {
  const viking = combatContent.characters["character.viking"]!;

  it("allocates and freely reclaims earned stat points", () => {
    const owned = {
      ...createOwnedCharacter("viking-a", viking.id, 10),
      unspentStatPoints: 2,
    };
    const allocated = adjustStatAllocation(
      [owned],
      owned.instanceId,
      "power",
      1,
    );
    expect(allocated[0]!.statAllocations.power).toBe(1);
    expect(allocated[0]!.unspentStatPoints).toBe(1);

    const reclaimed = adjustStatAllocation(
      allocated,
      owned.instanceId,
      "power",
      -1,
    );
    expect(reclaimed[0]!.statAllocations.power).toBe(0);
    expect(reclaimed[0]!.unspentStatPoints).toBe(2);
  });

  it("moves an authored Move into a different Charge band at level 10", () => {
    const owned = createOwnedCharacter("viking-a", viking.id, 10);
    owned.actionOrder = [...viking.actionIds];
    const originalOrder = [...owned.actionOrder];
    const moved = moveOwnedAction(
      [owned],
      owned.instanceId,
      viking,
      viking.actionIds[1],
      -1,
    );

    expect(resolvedActionOrder(moved[0]!, viking)).toEqual([
      viking.actionIds[1],
      viking.actionIds[0],
      viking.actionIds[2],
    ]);
    expect(owned.actionOrder).toEqual(originalOrder);
  });

  it("selects low, centre, or high within the Move's current band", () => {
    const owned = createOwnedCharacter("viking-a", viking.id, 10);
    const action = combatContent.actions[viking.actionIds[0]]!;
    const positioned = setOwnedActionPosition(
      [owned],
      owned.instanceId,
      viking,
      action.id,
      "1H",
    );

    expect(resolvedActionPosition(positioned[0]!, viking, action)).toBe("1H");
    expect(() =>
      setOwnedActionPosition(
        positioned,
        owned.instanceId,
        viking,
        action.id,
        "2H",
      ),
    ).toThrow("must remain in Charge band 1");
  });

  it("preserves a chosen edge when a Move changes bands", () => {
    const owned = createOwnedCharacter("viking-a", viking.id, 10);
    const action = combatContent.actions[viking.actionIds[0]]!;
    const positioned = setOwnedActionPosition(
      [owned],
      owned.instanceId,
      viking,
      action.id,
      "1H",
    );
    const moved = moveOwnedAction(
      positioned,
      owned.instanceId,
      viking,
      action.id,
      1,
    );

    expect(resolvedActionPosition(moved[0]!, viking, action)).toBe("2H");
  });

  it("consumes a matching duplicate to enhance one Move permanently", () => {
    const selected = createOwnedCharacter("viking-a", viking.id, 10);
    const donor = createOwnedCharacter("viking-b", viking.id, 3);
    const enhanced = enhanceOwnedAction(
      [selected, donor],
      selected.instanceId,
      viking,
      viking.actionIds[0],
      donor.instanceId,
    );

    expect(enhanced).toHaveLength(1);
    expect(enhanced[0]!.actionTiers[viking.actionIds[0]]).toBe("gold");
  });

  it("rejects enhancement with a different Character", () => {
    const selected = createOwnedCharacter("viking-a", viking.id, 10);
    const donor = createOwnedCharacter("tux-a", "character.tux", 10);

    expect(() =>
      enhanceOwnedAction(
        [selected, donor],
        selected.instanceId,
        viking,
        viking.actionIds[0],
        donor.instanceId,
      ),
    ).toThrow("matching duplicate");
  });
});
