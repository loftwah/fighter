import { describe, expect, it } from "vitest";
import {
  createBattle,
  predictedBaseDamage,
  requestAction,
  tickBattle,
} from "./engine";
import { combatContent } from "../content/initial-content";

describe("combat simulation slices", () => {
  it("keeps a status effective through the slice in which it expires", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.tux"],
        enemyCharacterIds: ["character.tux"],
        playerStartingBar: 100,
        seed: 74,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const source = state.player.squad[0]!;
    source.statuses.push({
      id: "test.attack.exact-slice",
      kind: "attack",
      magnitude: 1,
      remainingMs: 250,
    });
    const actionId = "action.tux.root-access";
    const baseDamage = predictedBaseDamage(
      state,
      "player",
      actionId,
      combatContent,
    );
    state = requestAction(state, "player", actionId, combatContent).state;
    state.pendingActions.player!.remainingMs = 250;

    const resolved = tickBattle(state, 250, combatContent);
    const damage = resolved.events.find(
      (event) => event.type === "damageApplied" && event.actionId === actionId,
    );
    const expiry = resolved.events.find(
      (event) => event.type === "statusRemoved" && event.message === "attack",
    );

    expect(damage?.amount).toBeGreaterThan(baseDamage * 1.5);
    expect(damage!.id).toBeLessThan(expiry!.id);
    expect(resolved.state.player.squad[0]!.statuses).not.toContainEqual(
      expect.objectContaining({ id: "test.attack.exact-slice" }),
    );
  });
});
