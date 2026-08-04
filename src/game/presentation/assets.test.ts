import { describe, expect, it } from "vitest";
import type { BattleState } from "../../combat/types";
import { combatContent } from "../../content/initial-content";
import { battleTexturePlan } from "./assets";

const snapshot = {
  player: {
    activeIndex: 0,
    squad: [
      { characterId: "character.tux" },
      { characterId: "character.viking" },
    ],
  },
  enemy: {
    activeIndex: 0,
    squad: [
      { characterId: "character.humpty" },
      { characterId: "character.grim-reaper" },
    ],
  },
} as BattleState;

describe("battle texture plan", () => {
  it("keeps seamless base frames for the encounter but rich art for active fighters only", () => {
    const plan = battleTexturePlan(snapshot, combatContent);

    expect(plan.baseImageIds).toEqual([
      "image.tux.idle.a",
      "image.tux.idle.b",
      "image.viking.idle.a",
      "image.viking.idle.b",
      "image.humpty.idle.a",
      "image.humpty.idle.b",
      "image.grim-reaper.idle.a",
      "image.grim-reaper.idle.b",
    ]);
    expect(plan.richImageIds).toEqual([
      "image.tux.reactions",
      "image.humpty.reactions",
    ]);
    expect(plan.presentationIds).toHaveLength(6);
    expect(plan.presentationIds).toContain("presentation.tux.kernel-panic");
    expect(plan.presentationIds).toContain(
      "presentation.humpty.egg-on-your-face",
    );
    expect(plan.baseImageIds).not.toContain("image.tux.canonical");
    expect(plan.presentationIds).not.toContain(
      "presentation.viking.berserker-oath",
    );
  });
});
