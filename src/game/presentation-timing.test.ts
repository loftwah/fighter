import { describe, expect, it } from "vitest";
import type { BattleEvent } from "../combat/types";
import {
  aiDecisionReady,
  BATTLE_COUNTDOWN,
  battlePresentationDuration,
  holdAiDecisionClock,
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
    ).toBeGreaterThanOrEqual(2_000);
  });

  it("locks charge-up starts and later resolution independently", () => {
    expect(battlePresentationDuration(events("actionStarted"))).toBe(900);
    expect(
      battlePresentationDuration(events("actionCharged", "damageApplied")),
    ).toBeGreaterThanOrEqual(1_700);
  });

  it("keeps a multi-hit presentation locked through its final visual", () => {
    const duration = battlePresentationDuration(
      events(
        "actionStarted",
        "actionCharged",
        "damageApplied",
        "damageApplied",
        "damageApplied",
      ),
    );
    const finalDamageEndsAt = 850 + 2 * 180 + 820;
    expect(duration).toBeGreaterThanOrEqual(finalDamageEndsAt);
  });

  it("does not pause ordinary Charge updates", () => {
    expect(battlePresentationDuration(events("barChanged"))).toBe(0);
  });

  it("restarts the AI comprehension window after a presentation lock", () => {
    const releasedAt = holdAiDecisionClock(5_000);

    expect(aiDecisionReady(releasedAt, 5_849, 850)).toBe(false);
    expect(aiDecisionReady(releasedAt, 5_850, 850)).toBe(true);
  });

  it("does not turn periodic health ticks into invisible attack pauses", () => {
    expect(
      battlePresentationDuration([
        {
          id: 1,
          type: "damageApplied",
          amount: 3,
          periodic: true,
        },
        {
          id: 2,
          type: "healingApplied",
          amount: 3,
          periodic: true,
        },
      ]),
    ).toBe(0);
  });

  it("keeps a reaction word and its damage inside the presentation lock", () => {
    expect(
      battlePresentationDuration([
        { id: 1, type: "characterDodged" },
        {
          id: 2,
          type: "reactionTriggered",
          reactionKind: "counter",
        },
        {
          id: 3,
          type: "damageApplied",
          amount: 9,
          reactionKind: "counter",
        },
      ]),
    ).toBeGreaterThanOrEqual(1_700);
  });

  it("locks an Accessory activation as its own battle action", () => {
    expect(
      battlePresentationDuration(events("accessoryActivated", "statusApplied")),
    ).toBeGreaterThanOrEqual(1_400);
  });
});
