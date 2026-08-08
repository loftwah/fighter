import { describe, expect, it } from "vitest";
import type { BattleEvent } from "../combat/types";
import {
  aiDecisionReady,
  BATTLE_COUNTDOWN,
  battleEventImpactDelay,
  battlePresentationDuration,
  battlePresentationStateCommitDelay,
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

  it("commits visible battle state on the authored impact beat", () => {
    expect(
      battlePresentationStateCommitDelay(
        events("actionStarted", "actionCharged", "damageApplied"),
      ),
    ).toBe(850);
    expect(
      battlePresentationStateCommitDelay(
        events("actionCharged", "damageApplied", "damageApplied"),
      ),
    ).toBe(700);
  });

  it("uses one impact policy for mixed damage and dodge outcomes", () => {
    const mixed = events(
      "actionStarted",
      "actionCharged",
      "damageApplied",
      "characterDodged",
      "damageApplied",
    );
    expect(battleEventImpactDelay(mixed, 2)).toBe(850);
    expect(battleEventImpactDelay(mixed, 3)).toBe(1030);
    expect(battleEventImpactDelay(mixed, 4)).toBe(1210);
    expect(battlePresentationStateCommitDelay(mixed)).toBe(1210);
    expect(battlePresentationDuration(mixed)).toBeGreaterThanOrEqual(2030);
  });

  it("keeps defeat and dodge reactions after their triggering hit outcomes", () => {
    const defeatedAfterMixedHits = events(
      "actionStarted",
      "actionCharged",
      "damageApplied",
      "characterDodged",
      "characterDodged",
      "characterDefeated",
    );
    expect(battleEventImpactDelay(defeatedAfterMixedHits, 4)).toBe(1210);
    expect(battleEventImpactDelay(defeatedAfterMixedHits, 5)).toBe(1390);

    const dodgeCounter = events(
      "actionStarted",
      "actionCharged",
      "characterDodged",
      "reactionTriggered",
      "damageApplied",
    );
    expect(battleEventImpactDelay(dodgeCounter, 2)).toBe(850);
    expect(battleEventImpactDelay(dodgeCounter, 3)).toBe(1030);
    expect(battleEventImpactDelay(dodgeCounter, 4)).toBe(1030);
  });

  it("does not defer state when there is no blocking impact", () => {
    expect(battlePresentationStateCommitDelay(events("barChanged"))).toBe(0);
    expect(
      battlePresentationStateCommitDelay(
        events("accessoryActivated", "healingApplied"),
      ),
    ).toBe(0);
    expect(
      battlePresentationStateCommitDelay([
        { id: 1, type: "damageApplied", amount: 3, periodic: true },
      ]),
    ).toBe(0);
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
