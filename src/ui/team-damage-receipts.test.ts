import { describe, expect, it } from "vitest";
import { combatContent } from "../content/initial-content";
import type { BattleEvent } from "../combat/types";
import { createBattle } from "../combat/engine";
import { teamDamageReceipts } from "./team-damage-receipts";

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
      teamDamageReceipts(events, before, after, combatContent, {
        firstImpactDelayMs: 850,
        damageStaggerMs: 180,
      }),
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

    const receipts = teamDamageReceipts(events, before, after, combatContent, {
      firstImpactDelayMs: 850,
      damageStaggerMs: 180,
    });

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
});
