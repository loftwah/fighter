import { describe, expect, it } from "vitest";
import type { BattleEvent } from "../combat/types";
import {
  BATTLE_COUNTDOWN,
  battlePresentationDuration,
} from "./presentation-timing";

const events = (...types: BattleEvent["type"][]): BattleEvent[] =>
  types.map((type, id) => ({ id, type }));

describe("battle presentation timing", () => {
  it("uses an explicit 3, 2, 1, FIGHT countdown", () => {
    expect(BATTLE_COUNTDOWN.map((beat) => beat.label)).toEqual([
      "3",
      "2",
      "1",
      "FIGHT",
    ]);
    expect(
      BATTLE_COUNTDOWN.reduce((total, beat) => total + beat.durationMs, 0),
    ).toBeGreaterThanOrEqual(2_400);
  });

  it("locks instant Move presentation through its impact", () => {
    expect(
      battlePresentationDuration(
        events("actionStarted", "actionCharged", "damageApplied"),
      ),
    ).toBe(900);
  });

  it("locks charge-up starts and later resolution independently", () => {
    expect(battlePresentationDuration(events("actionStarted"))).toBe(620);
    expect(
      battlePresentationDuration(events("actionCharged", "damageApplied")),
    ).toBe(720);
  });

  it("does not pause ordinary Charge updates", () => {
    expect(battlePresentationDuration(events("barChanged"))).toBe(0);
  });
});
