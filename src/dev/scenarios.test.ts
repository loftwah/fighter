import { describe, expect, it } from "vitest";
import { createBattle } from "../combat/engine";
import { combatContent } from "../content/initial-content";
import {
  actionTierForDevTier,
  applyDevStartingHealth,
  devBattleScenarios,
  devBattleScenarioSchema,
  devBuildsForSide,
} from "./scenarios";

describe("development battle scenarios", () => {
  it("keeps every preset valid, deterministic, and within supported lineup sizes", () => {
    const ids = new Set<string>();

    for (const scenario of devBattleScenarios) {
      expect(devBattleScenarioSchema.parse(scenario)).toEqual(scenario);
      expect(scenario.playerCharacterIds.length).toBeGreaterThanOrEqual(1);
      expect(scenario.playerCharacterIds.length).toBeLessThanOrEqual(3);
      expect(scenario.enemyCharacterIds.length).toBeGreaterThanOrEqual(1);
      expect(scenario.enemyCharacterIds.length).toBeLessThanOrEqual(3);
      expect(ids.has(scenario.id)).toBe(false);
      ids.add(scenario.id);
    }
  });

  it("maps the player-facing rings to the persisted combat tiers", () => {
    expect(actionTierForDevTier("normal")).toBe("stock");
    expect(actionTierForDevTier("tier1")).toBe("gold");
    expect(actionTierForDevTier("tier2")).toBe("platinum");
  });

  it("builds authored Moves at the selected tier and applies starting health ratios", () => {
    const scenario = {
      ...structuredClone(devBattleScenarios[3]),
      playerTier: "tier2" as const,
      playerPatchId: "patch.heavy-ink",
      playerHealthRatio: 0.5,
    };
    const playerBuilds = devBuildsForSide(scenario, "player");
    const created = createBattle(
      {
        playerCharacterIds: scenario.playerCharacterIds,
        playerBuilds,
        enemyCharacterIds: scenario.enemyCharacterIds,
        enemyBuilds: devBuildsForSide(scenario, "enemy"),
        playerStartingBar: scenario.playerStartingBar,
        enemyStartingBar: scenario.enemyStartingBar,
        seed: scenario.seed,
        difficulty: scenario.difficulty,
        timeLimitMs: scenario.timeLimitMs,
      },
      combatContent,
    );
    const state = applyDevStartingHealth(created.state, scenario);

    expect(Object.values(state.player.squad[0]!.actionTiers)).toEqual([
      "platinum",
      "platinum",
      "platinum",
    ]);
    expect(playerBuilds[0]).toMatchObject({
      equippedPatchId: "patch.heavy-ink",
      statBonuses: { power: 3 },
    });
    expect(state.player.squad[0]!.currentHealth).toBe(
      Math.round(state.player.squad[0]!.maxHealth * 0.5),
    );
    expect(state.player.bar).toBe(scenario.playerStartingBar);
    expect(state.seed).toBe(scenario.seed);
  });
});
