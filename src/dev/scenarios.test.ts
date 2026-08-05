import { describe, expect, it } from "vitest";
import {
  createBattle,
  predictedBaseDamage,
  predictedDamage,
} from "../combat/engine";
import { chargePerSecond, typeMultiplier } from "../combat/rules";
import { combatContent } from "../content/initial-content";
import {
  actionTierForDevTier,
  applyDevScenarioState,
  defaultDevScenario,
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

  it("keeps Neutral 1v1 genuinely neutral and starts from the base Charge loop", () => {
    const neutral = devBattleScenarios.find(
      (scenario) => scenario.id === "dev.neutral-1v1",
    )!;
    const player = combatContent.characters[neutral.playerCharacterIds[0]!]!;
    const enemy = combatContent.characters[neutral.enemyCharacterIds[0]!]!;

    const state = createBattle(
      {
        playerCharacterIds: neutral.playerCharacterIds,
        playerBuilds: devBuildsForSide(neutral, "player"),
        enemyCharacterIds: neutral.enemyCharacterIds,
        enemyBuilds: devBuildsForSide(neutral, "enemy"),
        playerStartingBar: neutral.playerStartingBar,
        enemyStartingBar: neutral.enemyStartingBar,
        playerAccessoryId: neutral.playerAccessoryId ?? undefined,
        enemyAccessoryId: neutral.enemyAccessoryId ?? undefined,
        seed: neutral.seed,
        difficulty: neutral.difficulty,
      },
      combatContent,
    ).state;

    expect(neutral.playerCharacterIds).toEqual(neutral.enemyCharacterIds);
    expect(typeMultiplier(player.typeId, enemy.typeId)).toBe(1);
    expect(typeMultiplier(enemy.typeId, player.typeId)).toBe(1);
    expect(neutral.playerStartingBar).toBe(0);
    expect(neutral.enemyStartingBar).toBe(0);
    expect(state.player.bar).toBe(0);
    expect(state.enemy.bar).toBe(0);
    expect(state.player.squad[0]!.stats).toEqual(state.enemy.squad[0]!.stats);
    expect(chargePerSecond(state.player.squad[0]!.stats.tempo)).toBe(
      chargePerSecond(state.enemy.squad[0]!.stats.tempo),
    );
    expect(state.player.accessory).toBeNull();
    expect(state.enemy.accessory).toBeNull();
    expect(defaultDevScenario.id).toBe("dev.neutral-1v1");
  });

  it("pins the V2 Viking acceptance fight to the default Quick Fight", () => {
    const acceptance = devBattleScenarios.find(
      (scenario) => scenario.id === "v2.viking-acceptance",
    )!;

    expect(acceptance).toMatchObject({
      playerCharacterIds: ["character.viking"],
      enemyCharacterIds: ["character.grim-reaper"],
      playerLevel: 10,
      enemyLevel: 10,
      difficulty: "normal",
      seed: 3_844_240_869,
      startPaused: false,
      standardBuild: true,
    });

    const playerBuild = devBuildsForSide(acceptance, "player")[0];
    const enemyBuild = devBuildsForSide(acceptance, "enemy")[0];
    expect(playerBuild?.statBonuses).toEqual({
      health: 2,
      power: 2,
      evasion: 2,
      fortune: 2,
      tempo: 1,
    });
    expect(enemyBuild?.statBonuses).toEqual(playerBuild?.statBonuses);
  });

  it("maps the player-facing rings to the persisted combat tiers", () => {
    expect(actionTierForDevTier("normal")).toBe("stock");
    expect(actionTierForDevTier("tier1")).toBe("gold");
    expect(actionTierForDevTier("tier2")).toBe("platinum");
  });

  it("builds authored Moves at the selected tier and applies starting health ratios", () => {
    const scenario = {
      ...structuredClone(
        devBattleScenarios.find(
          (candidate) => candidate.id === "dev.status-stack",
        )!,
      ),
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
    const state = applyDevScenarioState(created.state, scenario);

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

  it("provides deterministic boosted and reduced attack-preview states", () => {
    const stateFor = (id: string) => {
      const scenario = devBattleScenarios.find(
        (candidate) => candidate.id === id,
      )!;
      const created = createBattle(
        {
          playerCharacterIds: scenario.playerCharacterIds,
          playerBuilds: devBuildsForSide(scenario, "player"),
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
      return applyDevScenarioState(created.state, scenario);
    };
    const actionIds = [
      "action.viking.axe-first",
      "action.viking.berserker-oath",
    ];
    const boosted = stateFor("dev.boosted-attacks");
    const reduced = stateFor("dev.reduced-attacks");

    expect(
      boosted.player.squad[0]!.statuses.filter(
        (status) => status.kind === "empower",
      ),
    ).toHaveLength(2);
    for (const actionId of actionIds) {
      expect(
        predictedDamage(boosted, "player", actionId, combatContent),
      ).toBeGreaterThan(
        predictedBaseDamage(boosted, "player", actionId, combatContent),
      );
      expect(
        predictedDamage(reduced, "player", actionId, combatContent),
      ).toBeLessThan(
        predictedBaseDamage(reduced, "player", actionId, combatContent),
      );
    }
    expect(boosted.player.bar).toBeLessThan(40);
    expect(reduced.player.bar).toBeLessThan(70);
  });
});
