import { describe, expect, it } from "vitest";
import type { BattleState } from "../../combat/types";
import {
  activeSideForPresentationTarget,
  presentationActionSide,
} from "./targeting";

const state = {
  player: {
    activeIndex: 1,
    squad: [{ instanceId: "player.bench" }, { instanceId: "player.active" }],
  },
  enemy: {
    activeIndex: 0,
    squad: [{ instanceId: "enemy.active" }, { instanceId: "enemy.bench" }],
  },
} as BattleState;

describe("active presentation targets", () => {
  it.each([
    ["player.active", "player"],
    ["enemy.active", "enemy"],
  ] as const)("maps %s to its visible active panel", (instanceId, side) => {
    expect(activeSideForPresentationTarget(state, instanceId)).toBe(side);
  });

  it.each(["player.bench", "enemy.bench", "missing", undefined])(
    "does not misrepresent non-active target %s",
    (instanceId) => {
      expect(activeSideForPresentationTarget(state, instanceId)).toBeNull();
    },
  );

  it("skips a defeated bench target rather than fading the active panel", () => {
    expect(activeSideForPresentationTarget(state, "enemy.bench")).toBeNull();
  });
});

describe("presentation action side", () => {
  it("ignores earlier bar events when an enemy charged Move resolves", () => {
    expect(
      presentationActionSide([
        {
          id: 1,
          type: "barChanged",
          side: "player",
          amount: 48,
        },
        {
          id: 2,
          type: "barChanged",
          side: "enemy",
          amount: 31,
        },
        {
          id: 3,
          type: "actionCharged",
          side: "enemy",
          actionId: "action.enemy.example",
        },
      ]),
    ).toBe("enemy");
  });
});
