import { describe, expect, it } from "vitest";
import { combatContent } from "../content/initial-content";
import type { BattleEvent } from "../combat/types";
import { createBattle } from "../combat/engine";
import { teamDamageReceipts } from "./team-damage-receipts";

function timingFor(events: readonly BattleEvent[]) {
  return {
    impactDelayForEvent(eventIndex: number): number {
      const event = events[eventIndex];
      if (!event || event.periodic) return 0;
      if (event.type !== "damageApplied" && event.type !== "characterDodged") {
        return 850;
      }
      const precedingHitCount = events
        .slice(0, eventIndex)
        .filter(
          (candidate) =>
            !candidate.periodic &&
            (candidate.type === "damageApplied" ||
              candidate.type === "characterDodged"),
        ).length;
      return 850 + precedingHitCount * 180;
    },
  };
}

describe("team-damage receipts", () => {
  it("keeps all three members and aggregates each member's multi-hit damage", () => {
    const before = createBattle(
      {
        playerCharacterIds: ["character.tux"],
        enemyCharacterIds: [
          "character.viking",
          "character.humpty",
          "character.moses",
        ],
        seed: 4,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const after = structuredClone(before);
    const targets = after.enemy.squad;
    targets[0]!.currentHealth -= 12;
    targets[1]!.currentHealth -= 10;
    targets[2]!.currentHealth -= 8;
    const damage = [4, 4, 4, 5, 5, 4, 4].map((amount, index) => ({
      id: index + 2,
      type: "damageApplied" as const,
      side: "player" as const,
      actionId: "action.tux.kernel-panic",
      targetId: targets[index < 3 ? 0 : index < 5 ? 1 : 2]!.instanceId,
      amount,
    }));
    const events: BattleEvent[] = [
      { id: 0, type: "actionStarted", side: "player" },
      { id: 1, type: "actionCharged", side: "player" },
      ...damage,
    ];

    expect(
      teamDamageReceipts(
        events,
        before,
        after,
        combatContent,
        timingFor(events),
      ),
    ).toEqual([
      expect.objectContaining({ targetId: targets[0]!.instanceId, amount: 12 }),
      expect.objectContaining({ targetId: targets[1]!.instanceId, amount: 10 }),
      expect.objectContaining({ targetId: targets[2]!.instanceId, amount: 8 }),
    ]);
  });

  it("models enemy-to-player receipts for the active fighter and both bench members", () => {
    const before = createBattle(
      {
        playerCharacterIds: [
          "character.viking",
          "character.humpty",
          "character.moses",
        ],
        enemyCharacterIds: ["character.tux"],
        seed: 9,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const after = structuredClone(before);
    const amounts = [after.player.squad[0]!.currentHealth, 10, 8];
    for (const [index, target] of after.player.squad.entries()) {
      target.currentHealth -= amounts[index]!;
    }
    after.player.activeIndex = 1;
    const events: BattleEvent[] = [
      { id: 0, type: "actionStarted", side: "enemy" },
      { id: 1, type: "actionCharged", side: "enemy" },
      ...after.player.squad.map((target, index) => ({
        id: index + 2,
        type: "damageApplied" as const,
        side: "enemy" as const,
        actionId: "action.tux.kernel-panic",
        targetId: target.instanceId,
        amount: amounts[index],
      })),
    ];

    const receipts = teamDamageReceipts(
      events,
      before,
      after,
      combatContent,
      timingFor(events),
    );

    expect(receipts).toHaveLength(3);
    expect(receipts[0]).toMatchObject({
      targetId: after.player.squad[0]!.instanceId,
      side: "player",
      amount: amounts[0],
      currentHealth: 0,
      impactDelayMs: 850,
      wasActiveBefore: true,
    });
  });

  it("keeps a visible receipt for every target when one member dodges", () => {
    const before = createBattle(
      {
        playerCharacterIds: ["character.tux"],
        enemyCharacterIds: [
          "character.viking",
          "character.humpty",
          "character.moses",
        ],
        seed: 12,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const after = structuredClone(before);
    after.enemy.squad[0]!.currentHealth -= 12;
    after.enemy.squad[2]!.currentHealth -= 8;
    const events: BattleEvent[] = [
      { id: 0, type: "actionStarted", side: "player" },
      { id: 1, type: "actionCharged", side: "player" },
      {
        id: 2,
        type: "damageApplied",
        side: "player",
        actionId: "action.tux.kernel-panic",
        targetId: after.enemy.squad[0]!.instanceId,
        amount: 12,
      },
      {
        id: 3,
        type: "characterDodged",
        side: "enemy",
        actionId: "action.tux.kernel-panic",
        targetId: after.enemy.squad[1]!.instanceId,
      },
      {
        id: 4,
        type: "damageApplied",
        side: "player",
        actionId: "action.tux.kernel-panic",
        targetId: after.enemy.squad[2]!.instanceId,
        amount: 8,
      },
    ];

    expect(
      teamDamageReceipts(
        events,
        before,
        after,
        combatContent,
        timingFor(events),
      ),
    ).toEqual([
      expect.objectContaining({
        targetId: after.enemy.squad[0]!.instanceId,
        outcome: "damage",
        amount: 12,
        impactDelayMs: 850,
      }),
      expect.objectContaining({
        targetId: after.enemy.squad[1]!.instanceId,
        outcome: "dodge",
        amount: 0,
        impactDelayMs: 1030,
        previousHealth: after.enemy.squad[1]!.currentHealth,
        currentHealth: after.enemy.squad[1]!.currentHealth,
      }),
      expect.objectContaining({
        targetId: after.enemy.squad[2]!.instanceId,
        outcome: "damage",
        amount: 8,
        impactDelayMs: 1210,
      }),
    ]);
  });

  it("shows aggregate multi-hit damage on the target's final hit beat", () => {
    const before = createBattle(
      {
        playerCharacterIds: ["character.tux"],
        enemyCharacterIds: ["character.viking"],
        seed: 4,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const after = structuredClone(before);
    after.enemy.squad[0]!.currentHealth -= 12;
    const events: BattleEvent[] = [
      { id: 0, type: "actionStarted", side: "player" },
      { id: 1, type: "actionCharged", side: "player" },
      ...[4, 4, 4].map((amount, index) => ({
        id: index + 2,
        type: "damageApplied" as const,
        side: "player" as const,
        actionId: "action.tux.kernel-panic",
        targetId: after.enemy.squad[0]!.instanceId,
        amount,
      })),
    ];

    expect(
      teamDamageReceipts(
        events,
        before,
        after,
        combatContent,
        timingFor(events),
      )[0],
    ).toMatchObject({ amount: 12, impactDelayMs: 1210 });
  });

  it("lands aggregate damage on a same-target final dodged hit", () => {
    const before = createBattle(
      {
        playerCharacterIds: ["character.tux"],
        enemyCharacterIds: ["character.viking"],
        seed: 14,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const after = structuredClone(before);
    after.enemy.squad[0]!.currentHealth -= 8;
    const targetId = after.enemy.squad[0]!.instanceId;
    const events: BattleEvent[] = [
      { id: 0, type: "actionStarted", side: "player" },
      { id: 1, type: "actionCharged", side: "player" },
      {
        id: 2,
        type: "damageApplied",
        side: "player",
        actionId: "action.tux.kernel-panic",
        targetId,
        amount: 4,
      },
      {
        id: 3,
        type: "damageApplied",
        side: "player",
        actionId: "action.tux.kernel-panic",
        targetId,
        amount: 4,
      },
      {
        id: 4,
        type: "characterDodged",
        side: "enemy",
        actionId: "action.tux.kernel-panic",
        targetId,
      },
    ];

    expect(
      teamDamageReceipts(
        events,
        before,
        after,
        combatContent,
        timingFor(events),
      )[0],
    ).toMatchObject({ outcome: "damage", amount: 8, impactDelayMs: 1210 });
  });

  it("distinguishes an absorbed hit from a dodge", () => {
    const before = createBattle(
      {
        playerCharacterIds: ["character.tux"],
        enemyCharacterIds: ["character.viking"],
        seed: 2,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const after = structuredClone(before);
    const targetId = after.enemy.squad[0]!.instanceId;
    const events: BattleEvent[] = [
      { id: 0, type: "actionStarted", side: "player" },
      { id: 1, type: "actionCharged", side: "player" },
      {
        id: 2,
        type: "damageApplied",
        side: "player",
        actionId: "action.tux.kernel-panic",
        targetId,
        amount: 0,
      },
    ];

    expect(
      teamDamageReceipts(
        events,
        before,
        after,
        combatContent,
        timingFor(events),
      )[0],
    ).toMatchObject({ targetId, outcome: "damage", amount: 0 });
  });

  it("shows every dodge-only target at the shared arena impact beat", () => {
    const before = createBattle(
      {
        playerCharacterIds: ["character.tux"],
        enemyCharacterIds: [
          "character.viking",
          "character.humpty",
          "character.moses",
        ],
        seed: 3,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const after = structuredClone(before);
    const events: BattleEvent[] = [
      { id: 0, type: "actionStarted", side: "player" },
      { id: 1, type: "actionCharged", side: "player" },
      ...after.enemy.squad.map((target, index) => ({
        id: index + 2,
        type: "characterDodged" as const,
        side: "enemy" as const,
        actionId: "action.tux.kernel-panic",
        targetId: target.instanceId,
      })),
    ];

    expect(
      teamDamageReceipts(
        events,
        before,
        after,
        combatContent,
        timingFor(events),
      ).map((receipt) => receipt.impactDelayMs),
    ).toEqual([850, 1030, 1210]);
  });
});
