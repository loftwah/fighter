import { describe, expect, it } from "vitest";
import {
  chooseAiCommand,
  createBattle,
  forfeitBattle,
  predictedBaseDamage,
  predictedDamage,
  requestAction,
  requestAccessory,
  requestPickup,
  requestSwitch,
  tickBattle,
} from "./combat/engine";
import type { BattleEvent, CharacterTrait } from "./combat/types";
import {
  actionPositionForSlot,
  chargePerSecond,
  COMBAT_TYPE_WHEEL,
  difficultyAiDelay,
  traitSynergy,
  typeMultiplier,
  POSITION_RULES,
  sideForInstance,
} from "./combat/rules";
import {
  createStandardBuild,
  STANDARD_MATCH_LEVEL,
  STANDARD_STAT_ALLOCATIONS,
  STANDARD_STAT_POINT_BUDGET,
} from "./combat/standard-build";
import {
  appendBattleTransition,
  createBattleReport,
  recordBattleDecision,
  recordBattleDebugAction,
  recordBattleDifficultyChange,
} from "./combat/report";
import { combatContent } from "./content/initial-content";
import { calculateBattleReward } from "./economy/rewards";
import { addXp } from "./progression/levels";
import { evaluateAchievements } from "./progression/achievements";
import {
  buildForOwnedCharacter,
  equipPatch,
  openingChargeBonus,
} from "./progression/patches";
import {
  acceptSafeDefaults,
  createDefaultPlayerProfile,
  createDefaultSave,
  createOwnedCharacter,
  defaultPreferences,
  loadActiveSaveSlot,
  loadPreferences,
  loadPlayerProfile,
  loadSave,
  loadStorageWarning,
  recordTournamentTrophyOwnership,
  savePreferences,
  savePlayerProfile,
  saveActiveSaveSlot,
  saveSlot,
  saveTournamentVictory,
} from "./persistence/save";
import { evaluateMissionProgress } from "./missions/evaluate";
import { baseOffers, rotatingOffers } from "./store/catalog";
import { purchaseOffer } from "./store/purchase";
import {
  claimFirstRunEnding,
  FIRST_RUN_ENDING_REWARD,
  firstRunEncounter,
  isFirstRunNodeReached,
  reconcileFirstRunClears,
} from "./story/first-run";
import { loadFirstRunSave } from "./story/save";
import {
  applyCheapSeatsDrop,
  cheapSeatsEncounter,
  cheapSeatsPlayerIds,
  createCheapSeatsRun,
  exhaustTournamentAccessory,
  exhaustTournamentAccessoriesFromEvents,
  lockCheapSeatsCase,
  normaliseCheapSeatsRun,
  recordCheapSeatsResult,
  recordCheapSeatsVictory,
  restoreCaseHealth,
  selectCheapSeatsDeployment,
} from "./tournaments/cheap-seats";

class MemoryStorage implements Storage {
  readonly #values = new Map<string, string>();

  get length(): number {
    return this.#values.size;
  }

  clear(): void {
    this.#values.clear();
  }

  getItem(key: string): string | null {
    return this.#values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.#values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.#values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.#values.set(key, value);
  }
}

describe("combat rules", () => {
  it("gives non-Story modes one progression-neutral Standard Build contract", () => {
    const definition = combatContent.characters["character.viking"]!;
    const build = createStandardBuild(definition, "player", 0);

    expect(build).toMatchObject({
      instanceId: "standard.player.0.character.viking",
      level: STANDARD_MATCH_LEVEL,
      statBonuses: STANDARD_STAT_ALLOCATIONS,
      actionIds: definition.actionIds,
      interruptionResistance: 0,
      equippedPatchId: null,
    });
    expect(
      STANDARD_STAT_ALLOCATIONS.health +
        STANDARD_STAT_ALLOCATIONS.power +
        STANDARD_STAT_ALLOCATIONS.evasion +
        STANDARD_STAT_ALLOCATIONS.fortune +
        STANDARD_STAT_ALLOCATIONS.tempo,
    ).toBe(STANDARD_STAT_POINT_BUDGET);
    expect(Object.values(build.actionTiers ?? {})).toEqual([
      "stock",
      "stock",
      "stock",
    ]);
  });

  it("derives achievements retroactively without mutating save data", () => {
    const save = createDefaultSave(1);
    save.collection.push(
      createOwnedCharacter("owned.mara-vex.1", "character.viking", 7),
    );
    save.clearedNodeIds.push("story.first-run.02");
    const before = structuredClone(save);
    const progress = evaluateAchievements(save);

    expect(
      progress.find(
        (achievement) => achievement.id === "achievement.first-print",
      )?.complete,
    ).toBe(true);
    expect(
      progress.find(
        (achievement) => achievement.id === "achievement.invoice-denied",
      )?.complete,
    ).toBe(true);
    expect(
      progress.find((achievement) => achievement.id === "achievement.first-run")
        ?.complete,
    ).toBe(false);
    expect(save).toEqual(before);
  });

  it("authors a distinct two-Relic qualifier after the tutorial battle", () => {
    const tutorial = firstRunEncounter("story.first-run.02");
    const qualifier = firstRunEncounter("story.first-run.05");

    expect(tutorial.nodeId).toBe("story.first-run.02");
    expect(qualifier).toMatchObject({
      nodeId: "story.first-run.05",
      nextNodeId: "story.first-run.06",
    });
    expect(qualifier.playerCharacterIds).toHaveLength(2);
    expect(qualifier.enemyCharacterIds).toHaveLength(2);
    expect(qualifier.seed).not.toBe(tutorial.seed);
  });

  it("reconciles implied clears from saves written by the earlier slice", () => {
    expect(
      reconcileFirstRunClears("story.first-run.03", ["story.first-run.02"]),
    ).toEqual([
      "story.first-run.02",
      "story.first-run.00",
      "story.first-run.01",
    ]);
  });

  it("gates story features until their reveal node is reached", () => {
    expect(
      isFirstRunNodeReached(
        "story.first-run.02",
        ["story.first-run.00", "story.first-run.01"],
        "story.first-run.03",
      ),
    ).toBe(false);
    expect(
      isFirstRunNodeReached(
        "story.first-run.03",
        ["story.first-run.00", "story.first-run.01", "story.first-run.02"],
        "story.first-run.03",
      ),
    ).toBe(true);
    expect(
      isFirstRunNodeReached("story.first-run.05", [], "story.first-run.04"),
    ).toBe(true);
  });

  it("starts before the Node 01 Mara reward is granted", () => {
    const save = createDefaultSave(1);
    expect(save.collection).toEqual([]);
    expect(
      createOwnedCharacter("owned.mara-vex.1", "character.viking", 7),
    ).toMatchObject({
      instanceId: "owned.mara-vex.1",
      characterId: "character.viking",
      level: 7,
    });
  });

  it("claims the First Run ending reward exactly once", () => {
    const save = createDefaultSave(1);
    save.currentNodeId = "story.first-run.07";
    save.missionProgress["mission.fresh-ink"] = 2;
    save.missionProgress["mission.invoice-denied"] = 1;
    save.missionProgress["mission.print-it-personal"] = 2;
    save.tournamentTrophyIds.push("trophy.wrong-door-cup");
    save.storyTournamentTrophyIds.push("trophy.wrong-door-cup");
    const first = claimFirstRunEnding(save);
    expect(first.claimed).toBe(true);
    expect(first.save.stamps).toBe(save.stamps + FIRST_RUN_ENDING_REWARD);
    expect(first.save.clearedNodeIds).toContain("story.first-run.07");
    expect(first.save.revealedRivalIds).toContain("character.ned-kelly");

    const duplicate = claimFirstRunEnding(first.save);
    expect(duplicate.claimed).toBe(false);
    expect(duplicate.save.stamps).toBe(first.save.stamps);
  });

  it("blocks the First Run ending until every Mission and Trophy is complete", () => {
    const save = createDefaultSave(1);
    save.currentNodeId = "story.first-run.07";

    const ending = claimFirstRunEnding(save);

    expect(ending.claimed).toBe(false);
    expect(ending.blockedBy).toEqual({
      ready: false,
      incompleteMissionIds: [
        "mission.fresh-ink",
        "mission.invoice-denied",
        "mission.print-it-personal",
      ],
      missingTrophyIds: ["trophy.wrong-door-cup"],
    });
    expect(ending.save).toBe(save);
  });

  it("honours previously claimed Missions when evaluating Story completion", () => {
    const save = createDefaultSave(1);
    save.currentNodeId = "story.first-run.07";
    save.claimedMissionIds = [
      "mission.fresh-ink",
      "mission.invoice-denied",
      "mission.print-it-personal",
    ];
    save.storyTournamentTrophyIds = ["trophy.wrong-door-cup"];

    expect(claimFirstRunEnding(save).claimed).toBe(true);
  });

  it("cannot claim the First Run ending before reaching its ending node", () => {
    const save = createDefaultSave(1);
    save.claimedMissionIds = [
      "mission.fresh-ink",
      "mission.invoice-denied",
      "mission.print-it-personal",
    ];
    save.storyTournamentTrophyIds = ["trophy.wrong-door-cup"];

    expect(claimFirstRunEnding(save)).toEqual({
      claimed: false,
      save,
      blockedBy: null,
    });
  });

  it("carries a tournament Case through an interlude and authored next round", () => {
    const run = createCheapSeatsRun();
    const created = createBattle(
      {
        playerCharacterIds: [
          "character.viking",
          "character.tux",
          "character.moses",
        ],
        enemyCharacterIds: ["character.moses"],
        seed: cheapSeatsEncounter(0).seed,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    created.player.squad[0]!.currentHealth = Math.round(
      created.player.squad[0]!.maxHealth * 0.5,
    );
    created.player.squad[1]!.currentHealth = 0;

    const advanced = recordCheapSeatsVictory(run, created);
    expect(advanced.complete).toBe(false);
    if (advanced.complete) {
      return;
    }
    expect(advanced.run).toMatchObject({
      roundIndex: 1,
      phase: "interlude",
    });

    const repaired = applyCheapSeatsDrop(advanced.run, "case-repair");
    expect(repaired.phase).toBe("ready");
    expect(repaired.healthRatios[created.player.squad[1]!.instanceId]).toBe(
      0.35,
    );
    const nextState = createBattle(
      {
        playerCharacterIds: [
          "character.viking",
          "character.tux",
          "character.moses",
        ],
        enemyCharacterIds: cheapSeatsEncounter(1).enemyCharacterIds,
        seed: cheapSeatsEncounter(1).seed,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const restored = restoreCaseHealth(nextState, repaired);
    expect(restored.player.squad[0]!.currentHealth).toBeLessThan(
      restored.player.squad[0]!.maxHealth,
    );
    expect(restored.player.squad[1]!.currentHealth).toBeGreaterThan(0);
  });

  it("exhausts an activated Accessory for the rest of one Tournament run", () => {
    const exhausted = exhaustTournamentAccessoriesFromEvents(
      createCheapSeatsRun(),
      [
        {
          id: 1,
          type: "accessoryActivated",
          side: "enemy",
          message: "accessory.dead-air",
        },
        {
          id: 2,
          type: "accessoryActivated",
          side: "player",
          message: "accessory.press-pass",
        },
      ],
    );
    const repeated = exhaustTournamentAccessory(
      exhausted,
      "accessory.press-pass",
    );

    expect(repeated.exhaustedAccessoryIds).toEqual(["accessory.press-pass"]);

    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.moses"],
        seed: cheapSeatsEncounter(0).seed,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const advanced = recordCheapSeatsVictory(repeated, state);
    expect(advanced.complete).toBe(false);
    if (!advanced.complete) {
      expect(advanced.run.exhaustedAccessoryIds).toEqual([
        "accessory.press-pass",
      ]);
    }
  });

  it("marks the third Cheap Seats victory complete", () => {
    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: cheapSeatsEncounter(2).seed,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    expect(
      recordCheapSeatsVictory(
        {
          ...createCheapSeatsRun(),
          roundIndex: 2,
        },
        state,
      ).complete,
    ).toBe(true);
  });

  it("keeps standalone and Story tournament objects explicitly distinct", () => {
    expect(createCheapSeatsRun().origin).toBe("standalone");
    expect(createCheapSeatsRun([], "story").origin).toBe("story");
    const save = createDefaultSave(1);
    expect(save.tournamentRun).toBeNull();
    expect(save.standaloneTournamentRun).toBeNull();
  });

  it("locks six Tournament Roster Characters and deploys a chosen three", () => {
    const caseBuilds = cheapSeatsPlayerIds.map((characterId, index) => {
      const definition = combatContent.characters[characterId]!;
      const build = createStandardBuild(definition, "player", index);
      return {
        characterId,
        instanceId: build.instanceId!,
        level: build.level!,
        statBonuses: {
          health: build.statBonuses?.health ?? 0,
          power: build.statBonuses?.power ?? 0,
          evasion: build.statBonuses?.evasion ?? 0,
          fortune: build.statBonuses?.fortune ?? 0,
          tempo: build.statBonuses?.tempo ?? 0,
        },
        actionIds: build.actionIds!,
        actionTiers: Object.fromEntries(
          build.actionIds!.map((actionId) => [actionId, "stock" as const]),
        ),
        interruptionResistance: 0,
        equippedPatchId: null,
      };
    });
    const run = createCheapSeatsRun(caseBuilds);
    expect(run.caseBuilds).toHaveLength(6);
    expect(run.deployedInstanceIds).toEqual(
      caseBuilds.slice(0, 3).map((build) => build.instanceId),
    );
    expect(Object.keys(run.healthRatios)).toHaveLength(6);
    expect(() =>
      createCheapSeatsRun([
        ...caseBuilds,
        {
          ...caseBuilds[0]!,
          instanceId: `${caseBuilds[0]!.instanceId}.duplicate`,
        },
      ]),
    ).toThrow("at most 6 Characters");

    const selectedIds = caseBuilds.slice(3).map((build) => build.instanceId);
    const selected = selectCheapSeatsDeployment(
      run,
      selectedIds,
      selectedIds[2]!,
    );
    expect(selected.deployedInstanceIds).toEqual(selectedIds);
    expect(selected.activeInstanceId).toBe(selectedIds[2]);

    const state = createBattle(
      {
        playerCharacterIds: caseBuilds
          .slice(3)
          .map((build) => build.characterId),
        playerBuilds: caseBuilds.slice(3),
        enemyCharacterIds: ["character.moses"],
        seed: cheapSeatsEncounter(0).seed,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.squad[0]!.currentHealth = 1;
    const advanced = recordCheapSeatsVictory(selected, state);
    expect(advanced.complete).toBe(false);
    if (!advanced.complete) {
      expect(advanced.run.healthRatios[caseBuilds[0]!.instanceId]).toBe(1);
      expect(advanced.run.healthRatios[selectedIds[0]!]).toBeLessThan(1);
    }
  });

  it("repairs duplicate, defeated, and invalid Tournament deployments", () => {
    const caseBuilds = cheapSeatsPlayerIds.map((characterId, index) => {
      const definition = combatContent.characters[characterId]!;
      const build = createStandardBuild(definition, "player", index);
      return {
        characterId,
        instanceId: build.instanceId!,
        level: build.level!,
        statBonuses: {
          health: build.statBonuses?.health ?? 0,
          power: build.statBonuses?.power ?? 0,
          evasion: build.statBonuses?.evasion ?? 0,
          fortune: build.statBonuses?.fortune ?? 0,
          tempo: build.statBonuses?.tempo ?? 0,
        },
        actionIds: build.actionIds!,
        actionTiers: {},
        interruptionResistance: 0,
        equippedPatchId: null,
      };
    });
    const corrupted = createCheapSeatsRun(caseBuilds);
    corrupted.caseBuilds.push(structuredClone(caseBuilds[1]!));
    corrupted.healthRatios[caseBuilds[0]!.instanceId] = 0;
    corrupted.deployedInstanceIds = [
      caseBuilds[0]!.instanceId,
      caseBuilds[0]!.instanceId,
      caseBuilds[1]!.instanceId,
      caseBuilds[3]!.instanceId,
      "missing.instance",
    ];
    corrupted.activeInstanceId = caseBuilds[0]!.instanceId;

    const repaired = normaliseCheapSeatsRun(corrupted);

    expect(repaired.caseBuilds).toHaveLength(6);
    expect(repaired.deployedInstanceIds).toEqual([
      caseBuilds[1]!.instanceId,
      caseBuilds[3]!.instanceId,
    ]);
    expect(repaired.activeInstanceId).toBe(caseBuilds[1]!.instanceId);
  });

  it("repeats a lost fight while the Tournament Roster has survivors", () => {
    const caseBuilds = cheapSeatsPlayerIds
      .slice(0, 2)
      .map((characterId, index) => {
        const definition = combatContent.characters[characterId]!;
        const build = createStandardBuild(definition, "player", index);
        return {
          characterId,
          instanceId: build.instanceId!,
          level: build.level!,
          statBonuses: {
            health: 0,
            power: 0,
            evasion: 0,
            fortune: 0,
            tempo: 0,
          },
          actionIds: build.actionIds!,
          actionTiers: {},
          interruptionResistance: 0,
          equippedPatchId: null,
        };
      });
    const state = createBattle(
      {
        playerCharacterIds: [caseBuilds[0]!.characterId],
        playerBuilds: [caseBuilds[0]!],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: cheapSeatsEncounter(1).seed,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.squad[0]!.currentHealth = 0;
    state.enemy.squad[0]!.currentHealth = Math.round(
      state.enemy.squad[0]!.maxHealth * 0.4,
    );
    const result = recordCheapSeatsResult(
      { ...createCheapSeatsRun(caseBuilds), roundIndex: 1 },
      state,
      false,
    );
    expect(result.status).toBe("redeploy");
    if (result.status !== "redeploy") {
      return;
    }
    expect(result.run.deployedInstanceIds).toEqual([caseBuilds[1]!.instanceId]);
    expect(result.run.healthRatios[caseBuilds[0]!.instanceId]).toBe(0);
    expect(Object.values(result.run.opponentHealthRatios)[0]).toBeCloseTo(0.4);

    const repeated = restoreCaseHealth(
      createBattle(
        {
          playerCharacterIds: [caseBuilds[1]!.characterId],
          playerBuilds: [caseBuilds[1]!],
          enemyCharacterIds: ["character.ned-kelly"],
          seed: cheapSeatsEncounter(1).seed,
          difficulty: "normal",
        },
        combatContent,
      ).state,
      result.run,
    );
    expect(repeated.enemy.squad[0]!.currentHealth).toBeLessThan(
      repeated.enemy.squad[0]!.maxHealth,
    );
  });

  it("ends a Tournament only when every locked Roster member is defeated", () => {
    const definition = combatContent.characters["character.viking"]!;
    const build = createStandardBuild(definition, "player", 0);
    const caseBuild = {
      characterId: definition.id,
      instanceId: build.instanceId!,
      level: build.level!,
      statBonuses: {
        health: 0,
        power: 0,
        evasion: 0,
        fortune: 0,
        tempo: 0,
      },
      actionIds: build.actionIds!,
      actionTiers: {},
      interruptionResistance: 0,
      equippedPatchId: null,
    };
    const state = createBattle(
      {
        playerCharacterIds: [definition.id],
        playerBuilds: [caseBuild],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: cheapSeatsEncounter(0).seed,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.squad[0]!.currentHealth = 0;

    expect(
      recordCheapSeatsResult(createCheapSeatsRun([caseBuild]), state, false),
    ).toEqual({ status: "lost", run: null });
  });

  it("locks the exact Case roster and migrates legacy loaner health", () => {
    const build = {
      characterId: "character.tux",
      instanceId: "owned.character.tux.new",
      level: 8,
      statBonuses: {
        health: 0,
        power: 0,
        evasion: 0,
        fortune: 0,
        tempo: 0,
      },
      actionIds: combatContent.characters["character.tux"]!.actionIds,
      actionTiers: {},
      interruptionResistance: 0,
      equippedPatchId: null,
    };
    const legacy = {
      ...createCheapSeatsRun(),
      roundIndex: 1 as const,
      phase: "interlude" as const,
      healthRatios: {
        "loaner.0.character.tux": 0.42,
      },
      activeInstanceId: null,
    };
    const locked = lockCheapSeatsCase(legacy, [build]);
    build.level = 25;

    expect(locked.caseBuilds[0]).toMatchObject({
      instanceId: "owned.character.tux.new",
      level: 8,
    });
    expect(locked.healthRatios["owned.character.tux.new"]).toBe(0.42);
    expect(locked.healthRatios["loaner.0.character.tux"]).toBeUndefined();
    expect(locked.activeInstanceId).toBe("owned.character.tux.new");

    const activeRepair = applyCheapSeatsDrop(
      lockCheapSeatsCase(legacy, [build]),
      "front-print-repair",
    );
    expect(activeRepair.healthRatios["owned.character.tux.new"]).toBeCloseTo(
      0.87,
    );

    const caseRepair = applyCheapSeatsDrop(
      lockCheapSeatsCase(legacy, [build]),
      "case-repair",
    );
    expect(caseRepair.healthRatios["owned.character.tux.new"]).toBeCloseTo(0.6);
    expect(caseRepair.healthRatios["loaner.0.character.tux"]).toBeUndefined();
  });

  it("repairs and restores the Relic that ended the prior round active", () => {
    const state = createBattle(
      {
        playerCharacterIds: [
          "character.viking",
          "character.tux",
          "character.moses",
        ],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: cheapSeatsEncounter(0).seed,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.squad[0]!.currentHealth = Math.round(
      state.player.squad[0]!.maxHealth * 0.2,
    );
    state.player.squad[2]!.currentHealth = Math.round(
      state.player.squad[2]!.maxHealth * 0.5,
    );
    state.player.activeIndex = 2;
    const advanced = recordCheapSeatsVictory(createCheapSeatsRun(), state);
    expect(advanced.complete).toBe(false);
    if (advanced.complete) {
      return;
    }
    const repaired = applyCheapSeatsDrop(advanced.run, "front-print-repair");
    const maraId = state.player.squad[0]!.instanceId;
    const activeId = state.player.squad[2]!.instanceId;

    expect(repaired.healthRatios[maraId]).toBeCloseTo(0.2, 1);
    expect(repaired.healthRatios[activeId]).toBeCloseTo(0.95, 1);
    expect(repaired.selectedDrop).toBe("front-print-repair");

    const restored = restoreCaseHealth(
      createBattle(
        {
          playerCharacterIds: [
            "character.viking",
            "character.tux",
            "character.moses",
          ],
          enemyCharacterIds: ["character.humpty"],
          seed: cheapSeatsEncounter(1).seed,
          difficulty: "normal",
        },
        combatContent,
      ).state,
      repaired,
    );
    expect(restored.player.squad[restored.player.activeIndex]!.instanceId).toBe(
      activeId,
    );
  });

  it("forms a circular six-Type wheel with a typeless fallback", () => {
    for (const [index, type] of COMBAT_TYPE_WHEEL.entries()) {
      const defeatedType =
        COMBAT_TYPE_WHEEL[(index + 1) % COMBAT_TYPE_WHEEL.length]!;
      expect(typeMultiplier(type, defeatedType)).toBe(1.25);
      expect(typeMultiplier(defeatedType, type)).toBe(0.8);
      expect(typeMultiplier(type, "typeless")).toBe(1);
      expect(typeMultiplier("typeless", type)).toBe(1);
    }
    expect(typeMultiplier("typeless", "typeless")).toBe(1);
    expect(typeMultiplier("brawler", "tech")).toBe(0.8);
    expect(typeMultiplier("oddball", "arcane")).toBe(1.25);
    expect(typeMultiplier("sharpshooter", "tech")).toBe(1.25);
  });

  it("scores continuous single and half-strength dual Traits", () => {
    const icons = traitSynergy([
      combatContent.characters["character.tux"]!,
      combatContent.characters["character.humpty"]!,
    ]);
    expect(icons.scores.icon).toBe(2);
    expect(icons.bonuses.icon).toBe(4);

    const sharedHero = traitSynergy([
      combatContent.characters["character.moses"]!,
      combatContent.characters["character.ned-kelly"]!,
    ]);
    expect(sharedHero.scores.hero).toBe(1);
    expect(sharedHero.bonuses.hero).toBe(3);

    const split = traitSynergy([
      combatContent.characters["character.moses"]!,
      combatContent.characters["character.ned-kelly"]!,
      combatContent.characters["character.grim-reaper"]!,
    ]);
    expect(split.scores.hero).toBe(1);
    expect(split.scores.mythic).toBe(1);
    expect(split.bonuses.hero).toBe(3);
    expect(split.bonuses.mythic).toBe(0.04);

    const unmatchedDual = traitSynergy([
      combatContent.characters["character.moses"]!,
    ]);
    expect(unmatchedDual.scores.hero).toBe(0.5);
    expect(unmatchedDual.scores.mythic).toBe(0.5);

    const threeIcons = traitSynergy([
      combatContent.characters["character.tux"]!,
      combatContent.characters["character.humpty"]!,
      combatContent.characters["character.tux"]!,
    ]);
    expect(threeIcons.scores.icon).toBe(3);
    expect(threeIcons.bonuses.icon).toBe(6);

    expect(
      traitSynergy([
        combatContent.characters["character.grim-reaper"]!,
        combatContent.characters["character.ned-kelly"]!,
        combatContent.characters["character.moses"]!,
      ]),
    ).toEqual(split);
  });

  it("translates every stat and opening-Charge Trait bonus into battle state", () => {
    const battleWithTrait = (trait: CharacterTrait) => {
      const content = structuredClone(combatContent);
      content.characters["character.tux"]!.traitIds = [trait];
      content.characters["character.humpty"]!.traitIds = [trait];
      return createBattle(
        {
          playerCharacterIds: ["character.tux", "character.humpty"],
          enemyCharacterIds: ["character.viking"],
          seed: 73,
          difficulty: "normal",
        },
        content,
      ).state;
    };

    const hero = battleWithTrait("hero");
    const heroTux = hero.player.squad[0]!;
    const tux = combatContent.characters["character.tux"]!;
    expect(hero.player.traitBonuses.hero).toBe(6);
    expect(heroTux.stats.health).toBe(tux.baseStats.health + 6);
    expect(heroTux.maxHealth).toBe(
      Math.round(tux.baseStats.health * (1 + (tux.level - 1) * 0.035) + 6),
    );

    const villain = battleWithTrait("villain");
    expect(villain.player.squad[0]!.stats.power).toBe(tux.baseStats.power + 2);

    const mythic = battleWithTrait("mythic");
    expect(mythic.player.traitBonuses.mythic).toBe(0.08);
    expect(mythic.player.squad[0]!.stats.tempo).toBe(tux.baseStats.tempo);

    const historic = battleWithTrait("historic");
    expect(historic.player.bar).toBe(10);

    const icon = battleWithTrait("icon");
    expect(icon.player.squad[0]!.stats.fortune).toBe(tux.baseStats.fortune + 4);
  });

  it("applies the Monster Trait's damage resistance in resolved combat", () => {
    const monsterContent = structuredClone(combatContent);
    monsterContent.characters["character.tux"]!.traitIds = ["monster"];
    monsterContent.characters["character.humpty"]!.traitIds = ["monster"];

    const createDamage = (content: typeof combatContent): number => {
      const state = createBattle(
        {
          playerCharacterIds: ["character.viking"],
          enemyCharacterIds: ["character.tux", "character.humpty"],
          playerStartingBar: 100,
          seed: 74,
          difficulty: "normal",
        },
        content,
      ).state;
      const result = requestAction(
        state,
        "player",
        "action.viking.axe-first",
        content,
      );
      return result.events.find((event) => event.type === "damageApplied")!
        .amount!;
    };

    const normalDamage = createDamage(combatContent);
    const resistedDamage = createDamage(monsterContent);
    expect(resistedDamage).toBe(Math.max(1, Math.round(normalDamage * 0.95)));
  });

  it("makes later action positions costlier and stronger", () => {
    expect(POSITION_RULES["1L"].cost).toBeLessThan(POSITION_RULES["3H"].cost);
    expect(POSITION_RULES["1L"].multiplier).toBeLessThan(
      POSITION_RULES["3H"].multiplier,
    );
  });

  it("moves a reordered Move to its new Charge band while preserving its offset", () => {
    expect(actionPositionForSlot("3H", 0)).toBe("1H");
    expect(actionPositionForSlot("1L", 2)).toBe("3L");

    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        playerBuilds: [
          {
            actionIds: [
              "action.viking.berserker-oath",
              "action.viking.shield-bash",
              "action.viking.axe-first",
            ],
          },
        ],
        enemyCharacterIds: ["character.ned-kelly"],
        playerStartingBar: POSITION_RULES["1L"].cost,
        seed: 72,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const started = requestAction(
      state,
      "player",
      "action.viking.berserker-oath",
      combatContent,
    );

    expect(started.events.some((event) => event.type === "actionStarted")).toBe(
      true,
    );
    expect(started.state.player.bar).toBe(5);
  });

  it("scales a reordered utility Move to its new output band", () => {
    const utilityContent = structuredClone(combatContent);
    utilityContent.actions["action.ned-kelly.iron-outlaw"]!.effects = [
      { kind: "shield", target: "self", amount: 20, durationMs: 4_000 },
    ];
    const shieldForOrder = (
      actionIds:
        | [
            "action.ned-kelly.warning-shot",
            "action.ned-kelly.iron-outlaw",
            "action.ned-kelly.last-stand",
          ]
        | [
            "action.ned-kelly.iron-outlaw",
            "action.ned-kelly.warning-shot",
            "action.ned-kelly.last-stand",
          ],
    ) => {
      let state = createBattle(
        {
          playerCharacterIds: ["character.ned-kelly"],
          playerBuilds: [{ actionIds }],
          enemyCharacterIds: ["character.viking"],
          playerStartingBar: 100,
          seed: 96,
          difficulty: "normal",
        },
        utilityContent,
      ).state;
      state = requestAction(
        state,
        "player",
        "action.ned-kelly.iron-outlaw",
        utilityContent,
      ).state;
      return (
        state.player.squad[0]!.statuses.find(
          (status) => status.kind === "shield",
        )?.magnitude ?? 0
      );
    };

    const defaultShield = shieldForOrder([
      "action.ned-kelly.warning-shot",
      "action.ned-kelly.iron-outlaw",
      "action.ned-kelly.last-stand",
    ]);
    const earlierShield = shieldForOrder([
      "action.ned-kelly.iron-outlaw",
      "action.ned-kelly.warning-shot",
      "action.ned-kelly.last-stand",
    ]);
    expect(earlierShield).toBeLessThan(defaultShield);
  });

  it("keeps the team Charge Strip when switching", () => {
    const created = createBattle(
      {
        playerCharacterIds: ["character.viking", "character.tux"],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 42,
        difficulty: "normal",
      },
      combatContent,
    );
    const before = created.state.player.bar;
    const switched = requestSwitch(created.state, "player", 1);
    expect(switched.state.player.activeIndex).toBe(1);
    expect(switched.state.player.bar).toBe(before);
  });

  it("locks an active target when a charged Move commits", () => {
    const content = structuredClone(combatContent);
    content.characters["character.tux"]!.baseStats.evasion = 0;
    content.characters["character.humpty"]!.baseStats.evasion = 0;
    let state = createBattle(
      {
        playerCharacterIds: ["character.tux", "character.humpty"],
        enemyCharacterIds: ["character.viking"],
        enemyStartingBar: 100,
        seed: 5_041,
        difficulty: "normal",
      },
      content,
    ).state;
    const originalTarget = state.player.squad[0]!;
    const replacement = state.player.squad[1]!;
    const originalHealth = originalTarget.currentHealth;
    const replacementHealth = replacement.currentHealth;

    state = requestAction(
      state,
      "enemy",
      "action.viking.berserker-oath",
      content,
    ).state;
    state = requestSwitch(state, "player", 1).state;
    for (let elapsed = 0; elapsed < 750; elapsed += 250) {
      state = tickBattle(state, 250, content).state;
    }

    expect(state.player.activeIndex).toBe(1);
    expect(originalTarget.instanceId).not.toBe(replacement.instanceId);
    expect(state.player.squad[0]!.currentHealth).toBeLessThan(originalHealth);
    expect(state.player.squad[1]!.currentHealth).toBe(replacementHealth);
  });

  it("records a forfeit as a deterministic loss and clears pending Moves", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        playerStartingBar: 100,
        seed: 84,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state = requestAction(
      state,
      "player",
      "action.viking.shield-bash",
      combatContent,
    ).state;
    const forfeited = forfeitBattle(state, "player");

    expect(forfeited.state.outcome).toBe("enemyWon");
    expect(forfeited.state.pendingActions).toEqual({});
    expect(forfeited.events).toContainEqual(
      expect.objectContaining({
        type: "battleEnded",
        side: "enemy",
        message: "playerForfeited",
      }),
    );
  });

  it("charges and activates a team Accessory independently of the Charge Strip", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        playerAccessoryId: "accessory.press-pass",
        playerStartingBar: 100,
        seed: 87,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state = requestAction(
      state,
      "player",
      "action.viking.axe-first",
      combatContent,
    ).state;
    expect(state.player.accessory?.charge).toBeGreaterThan(0);

    state.player.accessory!.charge = 100;
    state.player.bar = 0;
    const activated = requestAccessory(state, "player", combatContent);
    expect(activated.state.player.bar).toBe(30);
    expect(activated.state.player.accessory?.charge).toBe(0);
    expect(
      activated.events.some((event) => event.type === "accessoryActivated"),
    ).toBe(true);
  });

  it("supports a separately charged Accessory that freezes the opposing Strip", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        playerAccessoryId: "accessory.dead-air",
        seed: 88,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.accessory!.charge = 100;
    state = requestAccessory(state, "player", combatContent).state;
    expect(state.enemy.statuses).toEqual([
      expect.objectContaining({
        kind: "chargeRate",
        multiplier: 0,
      }),
    ]);

    for (let elapsed = 0; elapsed < 2_000; elapsed += 250) {
      state = tickBattle(state, 250, combatContent).state;
    }
    expect(state.enemy.bar).toBe(2.5);
    for (let elapsed = 0; elapsed < 750; elapsed += 250) {
      state = tickBattle(state, 250, combatContent).state;
    }
    expect(state.enemy.bar).toBeGreaterThan(0);
  });

  it("supports team healing and shielding Accessories", () => {
    const healingState = createBattle(
      {
        playerCharacterIds: ["character.viking", "character.tux"],
        enemyCharacterIds: ["character.ned-kelly"],
        playerAccessoryId: "accessory.field-kit",
        seed: 188,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    healingState.player.squad[0]!.currentHealth -= 30;
    healingState.player.squad[1]!.currentHealth -= 10;
    healingState.player.accessory!.charge = 100;
    const healed = requestAccessory(healingState, "player", combatContent);
    expect(healed.state.player.squad[0]!.currentHealth).toBe(
      healingState.player.squad[0]!.currentHealth + 22,
    );
    expect(healed.state.player.squad[1]!.currentHealth).toBe(
      healingState.player.squad[1]!.maxHealth,
    );

    let shieldState = createBattle(
      {
        playerCharacterIds: ["character.viking", "character.tux"],
        enemyCharacterIds: ["character.ned-kelly"],
        playerAccessoryId: "accessory.ward-projector",
        seed: 189,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    shieldState.player.accessory!.charge = 100;
    shieldState = requestAccessory(shieldState, "player", combatContent).state;
    expect(
      shieldState.player.squad.every((combatant) =>
        combatant.statuses.some(
          (status) => status.kind === "shield" && status.magnitude === 18,
        ),
      ),
    ).toBe(true);
  });

  it("lets an Accessory temporarily block the opposing middle Move", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        playerAccessoryId: "accessory.slot-jammer",
        enemyStartingBar: 100,
        seed: 190,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.accessory!.charge = 100;
    state = requestAccessory(state, "player", combatContent).state;
    expect(
      requestAction(
        state,
        "enemy",
        "action.ned-kelly.iron-outlaw",
        combatContent,
      ).events,
    ).toContainEqual(
      expect.objectContaining({
        type: "commandRejected",
        message: "That Move slot is temporarily blocked.",
      }),
    );

    for (let elapsed = 0; elapsed < 4_000; elapsed += 250) {
      state = tickBattle(state, 250, combatContent).state;
    }
    expect(
      requestAction(
        state,
        "enemy",
        "action.ned-kelly.iron-outlaw",
        combatContent,
      ).events,
    ).toContainEqual(expect.objectContaining({ type: "actionStarted" }));
  });

  it("drops battle pickups from a separate deterministic RNG stream", () => {
    const run = (seed: number) => {
      const state = createBattle(
        {
          playerCharacterIds: ["character.viking"],
          enemyCharacterIds: ["character.ned-kelly"],
          playerAccessoryId: "accessory.press-pass",
          playerStartingBar: 100,
          seed,
          difficulty: "normal",
        },
        combatContent,
      ).state;
      return requestAction(
        state,
        "player",
        "action.viking.axe-first",
        combatContent,
      );
    };
    const seedWithDrop = Array.from(
      { length: 200 },
      (_, index) => index + 1,
    ).find((seed) =>
      run(seed).events.some((event) => event.type === "pickupDropped"),
    );

    expect(seedWithDrop).toBeDefined();
    const first = run(seedWithDrop!);
    const repeated = run(seedWithDrop!);
    expect(first.state.pickups).toEqual(repeated.state.pickups);
    expect(first.state.rngState).toBe(repeated.state.rngState);
  });

  it("collects battery, repair, and Charge pickups through one command", () => {
    const baseState = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        playerAccessoryId: "accessory.press-pass",
        seed: 191,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    baseState.player.squad[0]!.currentHealth -= 20;
    baseState.pickups = [
      {
        id: "pickup.player.battery",
        kind: "battery",
        side: "player",
        amount: 28,
        remainingMs: 7_000,
      },
      {
        id: "pickup.player.repair",
        kind: "repair",
        side: "player",
        amount: 16,
        remainingMs: 7_000,
      },
      {
        id: "pickup.player.surge",
        kind: "surge",
        side: "player",
        amount: 18,
        remainingMs: 7_000,
      },
    ];

    const battery = requestPickup(
      baseState,
      "player",
      "pickup.player.battery",
    ).state;
    expect(battery.player.accessory?.charge).toBe(28);
    const repair = requestPickup(
      battery,
      "player",
      "pickup.player.repair",
    ).state;
    expect(repair.player.squad[0]!.currentHealth).toBe(
      baseState.player.squad[0]!.currentHealth + 16,
    );
    const surge = requestPickup(repair, "player", "pickup.player.surge").state;
    expect(surge.player.bar).toBeGreaterThanOrEqual(18);
    expect(surge.pickups).toEqual([]);
  });

  it("expires ignored pickups and lets the AI collect useful ones", () => {
    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 192,
        difficulty: "hard",
      },
      combatContent,
    ).state;
    state.pickups = [
      {
        id: "pickup.enemy.surge",
        kind: "surge",
        side: "enemy",
        amount: 18,
        remainingMs: 250,
      },
    ];
    expect(chooseAiCommand(state, combatContent)).toEqual({
      kind: "pickup",
      pickupId: "pickup.enemy.surge",
    });
    const expired = tickBattle(state, 250, combatContent);
    expect(expired.state.pickups).toEqual([]);
    expect(expired.events).toContainEqual(
      expect.objectContaining({
        type: "pickupExpired",
        message: "surge",
      }),
    );
  });

  it("ticks authored damage-over-time and regeneration deterministically", () => {
    const periodicContent = structuredClone(combatContent);
    periodicContent.actions["action.humpty.great-fall"]!.chargeMs = 0;
    periodicContent.actions["action.humpty.great-fall"]!.effects = [
      { kind: "damage", target: "activeEnemy", power: 8 },
      {
        kind: "damageOverTime",
        target: "activeEnemy",
        power: 3,
        durationMs: 1_000,
        intervalMs: 250,
      },
    ];
    periodicContent.actions["action.moses.staff-tap"]!.chargeMs = 0;
    periodicContent.actions["action.moses.staff-tap"]!.effects = [
      { kind: "heal", target: "self", power: 8 },
      {
        kind: "healOverTime",
        target: "self",
        power: 3,
        durationMs: 1_000,
        intervalMs: 250,
      },
    ];
    let damageState = createBattle(
      {
        playerCharacterIds: ["character.humpty"],
        enemyCharacterIds: ["character.ned-kelly"],
        playerStartingBar: 100,
        seed: 90,
        difficulty: "normal",
      },
      periodicContent,
    ).state;
    damageState = requestAction(
      damageState,
      "player",
      "action.humpty.great-fall",
      periodicContent,
    ).state;
    const afterHit = damageState.enemy.squad[0]!.currentHealth;
    for (let elapsed = 0; elapsed < 1_000; elapsed += 250) {
      damageState = tickBattle(damageState, 250, periodicContent).state;
    }
    expect(damageState.enemy.squad[0]!.currentHealth).toBeLessThan(afterHit);

    let healState = createBattle(
      {
        playerCharacterIds: ["character.moses"],
        enemyCharacterIds: ["character.ned-kelly"],
        playerStartingBar: 100,
        seed: 91,
        difficulty: "normal",
      },
      periodicContent,
    ).state;
    healState.player.squad[0]!.currentHealth -= 30;
    healState = requestAction(
      healState,
      "player",
      "action.moses.staff-tap",
      periodicContent,
    ).state;
    const afterImmediateHeal = healState.player.squad[0]!.currentHealth;
    for (let elapsed = 0; elapsed < 1_000; elapsed += 250) {
      healState = tickBattle(healState, 250, periodicContent).state;
    }
    expect(healState.player.squad[0]!.currentHealth).toBeGreaterThan(
      afterImmediateHeal,
    );
  });

  it("catches up every periodic tick crossed by a simulation slice", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 92,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const target = state.enemy.squad[0]!;
    const before = target.currentHealth;
    target.statuses.push({
      id: "status.test-fast-dot",
      kind: "damageOverTime",
      magnitude: 2,
      remainingMs: 250,
      intervalMs: 100,
      nextTickMs: 100,
      sourceSide: "player",
    });
    state = tickBattle(state, 250, combatContent).state;

    expect(before - state.enemy.squad[0]!.currentHealth).toBe(4);
  });

  it("uses the explicit difficulty tie rule for a mutual wipe", () => {
    const run = (difficulty: "normal" | "brutal") => {
      const state = createBattle(
        {
          playerCharacterIds: ["character.viking"],
          enemyCharacterIds: ["character.ned-kelly"],
          seed: 102,
          difficulty,
        },
        combatContent,
      ).state;
      for (const combatant of [state.player.squad[0]!, state.enemy.squad[0]!]) {
        combatant.currentHealth = 1;
        combatant.statuses.push({
          id: `status.mutual-wipe.${combatant.side}`,
          kind: "damageOverTime",
          magnitude: 1,
          remainingMs: 100,
          intervalMs: 100,
          nextTickMs: 100,
        });
      }
      return tickBattle(state, 100, combatContent).state.outcome;
    };

    expect(run("normal")).toBe("playerWon");
    expect(run("brutal")).toBe("enemyWon");
  });

  it("applies a saved character build instead of the authored base level", () => {
    const baseline = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 42,
        difficulty: "normal",
      },
      combatContent,
    ).state.player.squad[0]!;
    const progressed = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        playerBuilds: [
          {
            instanceId: "owned.mara-vex.1",
            level: 20,
          },
        ],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 42,
        difficulty: "normal",
      },
      combatContent,
    ).state.player.squad[0]!;

    expect(progressed.instanceId).toBe("owned.mara-vex.1");
    expect(progressed.level).toBe(20);
    expect(progressed.maxHealth).toBeGreaterThan(baseline.maxHealth);
  });

  it("upgrades numeric utility effects as well as direct damage", () => {
    const utilityContent = structuredClone(combatContent);
    utilityContent.actions["action.ned-kelly.iron-outlaw"]!.effects = [
      { kind: "shield", target: "self", amount: 20, durationMs: 4_000 },
    ];
    const runShield = (tier: "stock" | "platinum") => {
      let state = createBattle(
        {
          playerCharacterIds: ["character.ned-kelly"],
          playerBuilds: [
            {
              actionTiers: {
                "action.ned-kelly.iron-outlaw": tier,
              },
            },
          ],
          enemyCharacterIds: ["character.viking"],
          playerStartingBar: 100,
          seed: 63,
          difficulty: "normal",
        },
        utilityContent,
      ).state;
      state = requestAction(
        state,
        "player",
        "action.ned-kelly.iron-outlaw",
        utilityContent,
      ).state;
      return state.player.squad[0]!.statuses.find(
        (status) => status.kind === "shield",
      )?.magnitude;
    };

    expect(runShield("platinum")).toBeGreaterThan(runShield("stock") ?? 0);
  });

  it("stacks next-Move Power and consumes every stack after one damaging Move", () => {
    const run = (stacks: number) => {
      let state = createBattle(
        {
          playerCharacterIds: ["character.viking"],
          enemyCharacterIds: ["character.ned-kelly"],
          playerStartingBar: 100,
          seed: 6_301,
          difficulty: "normal",
        },
        combatContent,
      ).state;
      const enemy = state.enemy.squad[0]!;
      enemy.stats.evasion = 0;
      enemy.maxHealth = 999;
      enemy.currentHealth = 999;

      for (let stack = 0; stack < stacks; stack += 1) {
        state = requestAction(
          state,
          "player",
          "action.viking.shield-bash",
          combatContent,
        ).state;
      }
      expect(
        state.player.squad[0]!.statuses.filter(
          (status) => status.kind === "empower",
        ),
      ).toHaveLength(stacks);

      const transition = requestAction(
        state,
        "player",
        "action.viking.axe-first",
        combatContent,
      );
      const damage = transition.events.find(
        (event) =>
          event.type === "damageApplied" &&
          event.actionId === "action.viking.axe-first",
      )?.amount;
      expect(
        transition.state.player.squad[0]!.statuses.some(
          (status) => status.kind === "empower",
        ),
      ).toBe(false);
      return damage ?? 0;
    };

    expect(run(1)).toBeGreaterThan(run(0));
    expect(run(2)).toBeGreaterThan(run(1));
  });

  it("previews the Power stack on both of Viking's attacks", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        playerStartingBar: 100,
        seed: 6_306,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const unbuffedAxe = predictedDamage(
      state,
      "player",
      "action.viking.axe-first",
      combatContent,
    );
    const unbuffedOath = predictedDamage(
      state,
      "player",
      "action.viking.berserker-oath",
      combatContent,
    );

    state = requestAction(
      state,
      "player",
      "action.viking.shield-bash",
      combatContent,
    ).state;
    const oneStackAxe = predictedDamage(
      state,
      "player",
      "action.viking.axe-first",
      combatContent,
    );
    const oneStackOath = predictedDamage(
      state,
      "player",
      "action.viking.berserker-oath",
      combatContent,
    );

    state = requestAction(
      state,
      "player",
      "action.viking.shield-bash",
      combatContent,
    ).state;

    expect(oneStackAxe).toBeGreaterThan(unbuffedAxe);
    expect(oneStackOath).toBeGreaterThan(unbuffedOath);
    expect(
      predictedBaseDamage(
        state,
        "player",
        "action.viking.axe-first",
        combatContent,
      ),
    ).toBe(unbuffedAxe);
    expect(
      predictedDamage(
        state,
        "player",
        "action.viking.axe-first",
        combatContent,
      ),
    ).toBeGreaterThan(oneStackAxe);
    expect(
      predictedDamage(
        state,
        "player",
        "action.viking.berserker-oath",
        combatContent,
      ),
    ).toBeGreaterThan(oneStackOath);
  });

  it("projects attack reductions below the unmodified Move value", () => {
    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.grim-reaper"],
        seed: 6_308,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const actionId = "action.viking.axe-first";
    const base = predictedBaseDamage(state, "player", actionId, combatContent);
    state.player.squad[0]!.statuses.push({
      id: "status.attack-down",
      kind: "attack",
      magnitude: -0.4,
      remainingMs: 4_000,
    });

    expect(
      predictedDamage(state, "player", actionId, combatContent),
    ).toBeLessThan(base);
    expect(predictedBaseDamage(state, "player", actionId, combatContent)).toBe(
      base,
    );
  });

  it("banks the advertised 28 percent Power in each Stock stack", () => {
    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        playerStartingBar: 100,
        seed: 6_307,
        difficulty: "normal",
      },
      combatContent,
    ).state;

    const empowered = requestAction(
      state,
      "player",
      "action.viking.shield-bash",
      combatContent,
    ).state;
    const stack = empowered.player.squad[0]!.statuses.find(
      (status) => status.kind === "empower",
    );

    expect(stack?.magnitude).toBeCloseTo(0.28, 5);
  });

  it("captures next-Move Power in a periodic damaging Move before consuming it", () => {
    const periodicMagnitude = (empowered: boolean) => {
      const content = structuredClone(combatContent);
      const axe = content.actions["action.viking.axe-first"]!;
      axe.effects = [
        {
          kind: "damageOverTime",
          target: "activeEnemy",
          power: 4,
          durationMs: 3_000,
          intervalMs: 1_000,
        },
      ];
      let state = createBattle(
        {
          playerCharacterIds: ["character.viking"],
          enemyCharacterIds: ["character.ned-kelly"],
          playerStartingBar: 100,
          seed: 6_305,
          difficulty: "normal",
        },
        content,
      ).state;
      if (empowered) {
        state = requestAction(
          state,
          "player",
          "action.viking.shield-bash",
          content,
        ).state;
      }
      state = requestAction(state, "player", axe.id, content).state;
      expect(
        state.player.squad[0]!.statuses.some(
          (status) => status.kind === "empower",
        ),
      ).toBe(false);
      return state.enemy.squad[0]!.statuses.find(
        (status) => status.kind === "damageOverTime",
      )?.magnitude;
    };

    expect(periodicMagnitude(true)).toBeGreaterThan(
      periodicMagnitude(false) ?? 0,
    );
  });

  it("unlocks the returning axe's undodgeable property at Tier 1", () => {
    const wasDodged = (seed: number, tier: "stock" | "gold") => {
      const state = createBattle(
        {
          playerCharacterIds: ["character.viking"],
          playerBuilds: [
            {
              actionTiers: {
                "action.viking.axe-first": tier,
              },
            },
          ],
          enemyCharacterIds: ["character.ned-kelly"],
          enemyBuilds: [{ statBonuses: { evasion: 100 } }],
          playerStartingBar: 100,
          seed,
          difficulty: "normal",
        },
        combatContent,
      ).state;
      return requestAction(
        state,
        "player",
        "action.viking.axe-first",
        combatContent,
      ).events.some((event) => event.type === "characterDodged");
    };

    const seeds = Array.from({ length: 32 }, (_, index) => index + 1);
    expect(seeds.some((seed) => wasDodged(seed, "stock"))).toBe(true);
    expect(seeds.some((seed) => wasDodged(seed, "gold"))).toBe(false);
  });

  it("improves Viking's Power stack and finisher stun through Move tiers", () => {
    const empowerMagnitude = (tier: "stock" | "platinum") => {
      const state = createBattle(
        {
          playerCharacterIds: ["character.viking"],
          playerBuilds: [
            {
              actionTiers: {
                "action.viking.shield-bash": tier,
              },
            },
          ],
          enemyCharacterIds: ["character.ned-kelly"],
          playerStartingBar: 100,
          seed: 6_302,
          difficulty: "normal",
        },
        combatContent,
      ).state;
      return requestAction(
        state,
        "player",
        "action.viking.shield-bash",
        combatContent,
      ).state.player.squad[0]!.statuses.find(
        (status) => status.kind === "empower",
      )?.magnitude;
    };
    const stunDuration = (tier: "stock" | "platinum") => {
      const content = structuredClone(combatContent);
      const finisher = content.actions["action.viking.berserker-oath"]!;
      finisher.chargeMs = 0;
      const stun = finisher.effects.find((effect) => effect.kind === "stun");
      if (!stun || stun.kind !== "stun") {
        throw new Error("Berserker Oath must stun");
      }
      stun.chance = 1;
      const state = createBattle(
        {
          playerCharacterIds: ["character.viking"],
          playerBuilds: [
            {
              actionTiers: {
                "action.viking.berserker-oath": tier,
              },
            },
          ],
          enemyCharacterIds: ["character.ned-kelly"],
          playerStartingBar: 100,
          seed: 6_303,
          difficulty: "normal",
        },
        content,
      ).state;
      state.enemy.squad[0]!.stats.evasion = 0;
      return requestAction(
        state,
        "player",
        finisher.id,
        content,
      ).state.enemy.squad[0]!.statuses.find((status) => status.kind === "stun")
        ?.remainingMs;
    };

    expect(empowerMagnitude("platinum")).toBeGreaterThan(
      empowerMagnitude("stock") ?? 0,
    );
    expect(stunDuration("platinum")).toBeGreaterThan(
      stunDuration("stock") ?? 0,
    );
  });

  it("shows Viking's finisher as his strongest unbuffed hit", () => {
    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 6_304,
        difficulty: "normal",
      },
      combatContent,
    ).state;

    expect(
      predictedDamage(
        state,
        "player",
        "action.viking.berserker-oath",
        combatContent,
      ),
    ).toBeGreaterThan(
      predictedDamage(
        state,
        "player",
        "action.viking.axe-first",
        combatContent,
      ),
    );
  });

  it("consumes shield pools and lets explicitly piercing hits bypass them", () => {
    const runHit = (shieldPiercing: boolean) => {
      const content = structuredClone(combatContent);
      const action = content.actions["action.viking.axe-first"]!;
      const damage = action.effects.find((effect) => effect.kind === "damage");
      if (!damage || damage.kind !== "damage") {
        throw new Error("Axe First must deal damage");
      }
      damage.shieldPiercing = shieldPiercing;
      let state = createBattle(
        {
          playerCharacterIds: ["character.ned-kelly"],
          enemyCharacterIds: ["character.viking"],
          enemyStartingBar: 100,
          seed: 93,
          difficulty: "normal",
        },
        content,
      ).state;
      const target = state.player.squad[0]!;
      target.stats.evasion = 0;
      target.statuses.push({
        id: "test.shield",
        kind: "shield",
        magnitude: 999,
        remainingMs: 5_000,
      });
      const before = target.currentHealth;
      const transition = requestAction(state, "enemy", action.id, content);
      state = transition.state;
      return {
        damage: before - state.player.squad[0]!.currentHealth,
        shield:
          state.player.squad[0]!.statuses.find(
            (status) => status.kind === "shield",
          )?.magnitude ?? 0,
      };
    };

    const absorbed = runHit(false);
    const pierced = runHit(true);
    expect(absorbed.damage).toBe(0);
    expect(absorbed.shield).toBeLessThan(999);
    expect(pierced.damage).toBeGreaterThan(0);
    expect(pierced.shield).toBe(999);
  });

  it("supports undodgeable lifesteal and authored switching locks", () => {
    const content = structuredClone(combatContent);
    const axeFirst = content.actions["action.viking.axe-first"]!;
    const damage = axeFirst.effects.find((effect) => effect.kind === "damage");
    if (!damage || damage.kind !== "damage") {
      throw new Error("Axe First must deal damage");
    }
    damage.undodgeable = true;
    damage.lifeStealRatio = 1;
    let state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly", "character.tux"],
        playerStartingBar: 100,
        seed: 94,
        difficulty: "normal",
      },
      content,
    ).state;
    state.player.squad[0]!.currentHealth -= 40;
    state.enemy.squad[0]!.stats.evasion = 100;
    const beforeHealth = state.player.squad[0]!.currentHealth;
    state = requestAction(state, "player", axeFirst.id, content).state;
    expect(state.enemy.squad[0]!.currentHealth).toBeLessThan(
      state.enemy.squad[0]!.maxHealth,
    );
    expect(state.player.squad[0]!.currentHealth).toBeGreaterThan(beforeHealth);

    const assetFreeze = content.actions["action.ned-kelly.last-stand"]!;
    assetFreeze.chargeMs = 0;
    assetFreeze.effects = [
      { kind: "damage", target: "activeEnemy", power: 8 },
      {
        kind: "switchLock",
        target: "activeEnemy",
        durationMs: 2_000,
        requiresHit: true,
      },
    ];
    state = createBattle(
      {
        playerCharacterIds: ["character.ned-kelly"],
        enemyCharacterIds: ["character.viking", "character.tux"],
        playerStartingBar: 100,
        seed: 95,
        difficulty: "normal",
      },
      content,
    ).state;
    state.enemy.squad[0]!.stats.evasion = 0;
    state = requestAction(state, "player", assetFreeze.id, content).state;
    expect(
      state.enemy.squad[0]!.statuses.some(
        (status) => status.kind === "switchLock",
      ),
    ).toBe(true);
    expect(
      requestSwitch(state, "enemy", 1).events.some(
        (event) => event.type === "commandRejected",
      ),
    ).toBe(true);
  });

  it("queues per-hit reflections until the authored Move is complete", () => {
    const content = structuredClone(combatContent);
    const finisher = content.actions["action.viking.berserker-oath"]!;
    finisher.chargeMs = 0;
    const damage = finisher.effects.find((effect) => effect.kind === "damage");
    if (!damage || damage.kind !== "damage") {
      throw new Error("Hostile Takeover must deal damage");
    }
    damage.hits = 3;
    damage.undodgeable = true;
    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.humpty"],
        playerStartingBar: 100,
        seed: 99,
        difficulty: "normal",
      },
      content,
    ).state;
    const player = state.player.squad[0]!;
    const enemy = state.enemy.squad[0]!;
    enemy.maxHealth = 999;
    enemy.currentHealth = 999;
    enemy.statuses.push(
      {
        id: "status.reflect-a",
        kind: "reflection",
        magnitude: 0.25,
        remainingMs: 5_000,
        actionId: "action.humpty.shell-game",
      },
      {
        id: "status.reflect-b",
        kind: "reflection",
        magnitude: 0.15,
        remainingMs: 5_000,
        actionId: "action.humpty.shell-game",
      },
    );
    player.statuses.push({
      id: "status.no-ping-pong",
      kind: "reflection",
      magnitude: 1,
      remainingMs: 5_000,
      actionId: "action.humpty.shell-game",
    });
    const transition = requestAction(state, "player", finisher.id, content);
    const directDamageIndices = transition.events
      .map((event, index) => ({ event, index }))
      .filter(
        ({ event }) => event.type === "damageApplied" && !event.reactionKind,
      )
      .map(({ index }) => index);
    const reactionIndices = transition.events
      .map((event, index) => ({ event, index }))
      .filter(({ event }) => event.type === "reactionTriggered")
      .map(({ index }) => index);
    const reactions = transition.events.filter(
      (event) => event.type === "reactionTriggered",
    );

    expect(directDamageIndices).toHaveLength(3);
    expect(reactions).toHaveLength(6);
    expect(Math.min(...reactionIndices)).toBeGreaterThan(
      Math.max(...directDamageIndices),
    );
    expect(reactions.every((event) => event.actionId === finisher.id)).toBe(
      true,
    );
    expect(
      reactions.every(
        (event) =>
          event.reactionId === "action.humpty.shell-game" &&
          typeof event.triggerEventId === "number",
      ),
    ).toBe(true);
    expect(
      transition.events.filter(
        (event) =>
          event.type === "reactionTriggered" &&
          event.sourceId === player.instanceId,
      ),
    ).toHaveLength(0);
  });

  it("reflects only post-shield damage and not a lethal incoming hit", () => {
    const content = structuredClone(combatContent);
    const action = content.actions["action.viking.axe-first"]!;
    const damage = action.effects.find((effect) => effect.kind === "damage");
    if (!damage || damage.kind !== "damage") {
      throw new Error("Axe First must deal damage");
    }
    damage.undodgeable = true;
    const createState = () =>
      createBattle(
        {
          playerCharacterIds: ["character.viking"],
          enemyCharacterIds: ["character.humpty"],
          playerStartingBar: 100,
          seed: 100,
          difficulty: "normal",
        },
        content,
      ).state;

    const shielded = createState();
    shielded.enemy.squad[0]!.statuses.push(
      {
        id: "status.full-shield",
        kind: "shield",
        magnitude: 999,
        remainingMs: 5_000,
      },
      {
        id: "status.reflect",
        kind: "reflection",
        magnitude: 1,
        remainingMs: 5_000,
      },
    );
    expect(
      requestAction(shielded, "player", action.id, content).events.some(
        (event) => event.type === "reactionTriggered",
      ),
    ).toBe(false);

    const lethal = createState();
    lethal.enemy.squad[0]!.currentHealth = 1;
    lethal.enemy.squad[0]!.statuses.push({
      id: "status.reflect",
      kind: "reflection",
      magnitude: 1,
      remainingMs: 5_000,
    });
    const lethalTransition = requestAction(
      lethal,
      "player",
      action.id,
      content,
    );
    expect(
      lethalTransition.events.some(
        (event) => event.type === "reactionTriggered",
      ),
    ).toBe(false);
    expect(
      lethalTransition.events.filter(
        (event) => event.type === "characterDefeated",
      ),
    ).toHaveLength(1);
  });

  it("does not let a later effect react retroactively to earlier damage", () => {
    const run = (grantFirst: boolean) => {
      const content = structuredClone(combatContent);
      const action = content.actions["action.viking.axe-first"]!;
      const damage = action.effects.find((effect) => effect.kind === "damage")!;
      const reflection = {
        kind: "reflectDamage" as const,
        target: "activeEnemy" as const,
        ratio: 1,
        durationMs: 5_000,
      };
      action.effects = grantFirst ? [reflection, damage] : [damage, reflection];
      const state = createBattle(
        {
          playerCharacterIds: ["character.viking"],
          enemyCharacterIds: ["character.ned-kelly"],
          playerStartingBar: 100,
          seed: 101,
          difficulty: "normal",
        },
        content,
      ).state;
      state.enemy.squad[0]!.stats.evasion = 0;
      const before = state.player.squad[0]!.currentHealth;
      const transition = requestAction(state, "player", action.id, content);
      return {
        reflected: before - transition.state.player.squad[0]!.currentHealth,
        events: transition.events,
      };
    };

    expect(run(false).reflected).toBe(0);
    expect(run(true).reflected).toBeGreaterThan(0);
  });

  it("allows a landed hit to grant a hit-gated reaction to the attacker", () => {
    const content = structuredClone(combatContent);
    const action = content.actions["action.humpty.egg-on-your-face"]!;
    action.effects = [
      {
        kind: "damage",
        target: "activeEnemy",
        power: 8,
        undodgeable: true,
      },
      {
        kind: "modifyEvasion",
        target: "self",
        magnitude: 8,
        durationMs: 2_000,
        requiresHit: true,
      },
      {
        kind: "counterOnDodge",
        target: "self",
        power: 8,
        durationMs: 2_000,
        uses: 1,
        requiresHit: true,
      },
    ];
    const state = createBattle(
      {
        playerCharacterIds: ["character.humpty"],
        enemyCharacterIds: ["character.ned-kelly"],
        playerStartingBar: 100,
        seed: 102,
        difficulty: "normal",
      },
      content,
    ).state;

    const transition = requestAction(state, "player", action.id, content);

    expect(transition.state.player.squad[0]!.statuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "evasion" }),
        expect.objectContaining({
          kind: "dodgeCounter",
          remainingTriggers: 1,
        }),
      ]),
    );
  });

  it("spends a dodge counter when queued and resolves it after a multi-hit", () => {
    const content = structuredClone(combatContent);
    const finisher = content.actions["action.viking.berserker-oath"]!;
    finisher.chargeMs = 0;
    const damage = finisher.effects.find((effect) => effect.kind === "damage");
    if (!damage || damage.kind !== "damage") {
      throw new Error("Hostile Takeover must deal damage");
    }
    damage.hits = 3;
    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.humpty"],
        playerStartingBar: 100,
        seed: 1,
        difficulty: "normal",
      },
      content,
    ).state;
    state.player.squad[0]!.currentHealth = 10;
    state.enemy.squad[0]!.stats.evasion = 100;
    state.enemy.squad[0]!.maxHealth = 999;
    state.enemy.squad[0]!.currentHealth = 999;
    state.enemy.squad[0]!.statuses.push({
      id: "status.one-counter",
      kind: "dodgeCounter",
      magnitude: 99,
      remainingMs: 5_000,
      remainingTriggers: 1,
      actionId: "action.humpty.egg-on-your-face",
    });
    const transition = requestAction(state, "player", finisher.id, content);
    const hitOutcomes = transition.events.filter(
      (event) =>
        event.type === "characterDodged" ||
        (event.type === "damageApplied" && !event.reactionKind),
    );
    const reactionIndex = transition.events.findIndex(
      (event) => event.type === "reactionTriggered",
    );
    const finalHitIndex = Math.max(
      ...transition.events
        .map((event, index) => ({ event, index }))
        .filter(
          ({ event }) =>
            event.type === "characterDodged" ||
            (event.type === "damageApplied" && !event.reactionKind),
        )
        .map(({ index }) => index),
    );

    expect(hitOutcomes).toHaveLength(3);
    expect(reactionIndex).toBeGreaterThan(finalHitIndex);
    expect(
      transition.state.enemy.squad[0]!.statuses.some(
        (status) => status.kind === "dodgeCounter",
      ),
    ).toBe(false);
    expect(transition.state.outcome).toBe("enemyWon");
    expect(
      transition.events.filter(
        (event) =>
          event.type === "characterDefeated" &&
          event.targetId === transition.state.player.squad[0]!.instanceId,
      ),
    ).toHaveLength(1);
  });

  it("keeps opaque owned-instance IDs on the player side", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        playerBuilds: [{ instanceId: "owned.mara-vex.1" }],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 42,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.bar = 100;
    const started = requestAction(
      state,
      "player",
      "action.viking.shield-bash",
      combatContent,
    );
    state = started.state;
    const events = [...started.events];
    const selfBuff = events.find(
      (event) =>
        event.type === "statusApplied" && event.targetId === "owned.mara-vex.1",
    );

    expect(sideForInstance(state, "owned.mara-vex.1")).toBe("player");
    expect(selfBuff?.side).toBe("player");
  });

  it("cleanses owned player instances without relying on ID prefixes", () => {
    const cleanseContent = structuredClone(combatContent);
    cleanseContent.actions["action.moses.safe-passage"]!.chargeMs = 0;
    cleanseContent.actions["action.moses.safe-passage"]!.effects = [
      { kind: "cleanse", target: "allAllies" },
    ];
    let state = createBattle(
      {
        playerCharacterIds: ["character.moses"],
        playerBuilds: [{ instanceId: "owned.velvet-hex.1" }],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 43,
        difficulty: "normal",
      },
      cleanseContent,
    ).state;
    state.player.squad[0]!.statuses.push({
      id: "test.attack-down",
      kind: "attack",
      magnitude: -0.2,
      remainingMs: 5_000,
    });
    state.player.squad[0]!.statuses.push(
      {
        id: "test.evasion-up",
        kind: "evasion",
        magnitude: 4,
        remainingMs: 5_000,
      },
      {
        id: "test.fortune-up",
        kind: "fortune",
        magnitude: 4,
        remainingMs: 5_000,
      },
    );
    state.player.bar = 100;
    const cleansed = requestAction(
      state,
      "player",
      "action.moses.safe-passage",
      cleanseContent,
    );
    state = cleansed.state;
    expect(
      state.player.squad[0]!.statuses.map((status) => status.kind),
    ).toEqual(expect.arrayContaining(["evasion", "fortune"]));
    const events = [...cleansed.events];
    for (let elapsed = 0; elapsed < 1_250; elapsed += 250) {
      const transition = tickBattle(state, 250, combatContent);
      state = transition.state;
      events.push(...transition.events);
    }
    const removed = events.find(
      (event) =>
        event.type === "statusRemoved" &&
        event.targetId === "owned.velvet-hex.1",
    );

    expect(removed?.side).toBe("player");
    expect(
      state.player.squad[0]!.statuses.map((status) => status.kind),
    ).toEqual(["evasion", "fortune"]);
  });

  it("applies equipped Patch effects to an owned-instance build", () => {
    const owned = createOwnedCharacter(
      "owned.mara-vex.1",
      "character.viking",
      7,
    );
    owned.equippedPatchId = "patch.heavy-ink";
    const definition = combatContent.characters[owned.characterId]!;
    const heavy = buildForOwnedCharacter(owned, definition);
    expect(heavy.statBonuses?.power).toBe(3);

    owned.equippedPatchId = "patch.hot-start";
    const hot = buildForOwnedCharacter(owned, definition);
    expect(openingChargeBonus([hot])).toBe(18);
  });

  it("keeps a reusable Patch equipped to only one owned Relic", () => {
    const first = createOwnedCharacter(
      "owned.mara-vex.1",
      "character.viking",
      7,
    );
    const second = {
      ...structuredClone(first),
      instanceId: "owned.mara-vex.2",
    };
    const equippedOnce = equipPatch(
      [first, second],
      ["patch.hot-start"],
      first.instanceId,
      "patch.hot-start",
    );
    const moved = equipPatch(
      equippedOnce,
      ["patch.hot-start"],
      second.instanceId,
      "patch.hot-start",
    );
    expect(moved[0]?.equippedPatchId).toBeNull();
    expect(moved[1]?.equippedPatchId).toBe("patch.hot-start");
  });

  it("uses seeded interruption resistance without cancelling the Move", () => {
    const interruptContent = structuredClone(combatContent);
    interruptContent.actions["action.ned-kelly.warning-shot"]!.chargeMs = 0;
    let state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        playerBuilds: [
          {
            instanceId: "owned.mara-vex.1",
            interruptionResistance: 1,
          },
        ],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 42,
        difficulty: "normal",
      },
      interruptContent,
    ).state;
    state.player.bar = 100;
    state.enemy.bar = 100;
    state = requestAction(
      state,
      "player",
      "action.viking.berserker-oath",
      interruptContent,
    ).state;
    const hit = requestAction(
      state,
      "enemy",
      "action.ned-kelly.warning-shot",
      interruptContent,
    );
    expect(
      hit.events.some((event) => event.type === "interruptionResisted"),
    ).toBe(true);
    expect(hit.state.pendingActions.player?.actionId).toBe(
      "action.viking.berserker-oath",
    );
  });

  it("marks enemy debuffs and stuns against opaque owned IDs as player events", () => {
    const debuffContent = structuredClone(combatContent);
    debuffContent.actions["action.moses.part-the-strip"]!.chargeMs = 0;
    debuffContent.actions["action.moses.part-the-strip"]!.effects = [
      {
        kind: "modifyAttack",
        target: "activeEnemy",
        magnitude: -0.2,
        durationMs: 2_000,
      },
    ];
    let debuffState = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        playerBuilds: [{ instanceId: "owned.mara-vex.1" }],
        enemyCharacterIds: ["character.moses"],
        seed: 44,
        difficulty: "normal",
      },
      debuffContent,
    ).state;
    debuffState.enemy.bar = 100;
    const debuffed = requestAction(
      debuffState,
      "enemy",
      "action.moses.part-the-strip",
      debuffContent,
    );
    debuffState = debuffed.state;
    const debuffEvents: BattleEvent[] = [...debuffed.events];
    for (let elapsed = 0; elapsed < 500; elapsed += 250) {
      const transition = tickBattle(debuffState, 250, debuffContent);
      debuffState = transition.state;
      debuffEvents.push(...transition.events);
    }
    expect(
      debuffEvents.find(
        (event) =>
          event.type === "statusApplied" &&
          event.targetId === "owned.mara-vex.1",
      )?.side,
    ).toBe("player");

    const guaranteedStunContent = structuredClone(combatContent);
    guaranteedStunContent.actions["action.ned-kelly.last-stand"]!.chargeMs = 0;
    guaranteedStunContent.actions["action.ned-kelly.last-stand"]!.effects = [
      { kind: "damage", target: "activeEnemy", power: 8 },
      {
        kind: "stun",
        target: "activeEnemy",
        durationMs: 650,
        chance: 1,
        requiresHit: true,
      },
    ];
    let stunState = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        playerBuilds: [{ instanceId: "owned.mara-vex.1" }],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 45,
        difficulty: "normal",
      },
      guaranteedStunContent,
    ).state;
    stunState.enemy.bar = 100;
    const stunned = requestAction(
      stunState,
      "enemy",
      "action.ned-kelly.last-stand",
      guaranteedStunContent,
    );
    stunState = stunned.state;
    const stunEvents: BattleEvent[] = [...stunned.events];
    for (let elapsed = 0; elapsed < 1_500; elapsed += 250) {
      const transition = tickBattle(stunState, 250, guaranteedStunContent);
      stunState = transition.state;
      stunEvents.push(...transition.events);
    }
    expect(
      stunEvents.find(
        (event) =>
          event.type === "statusApplied" &&
          event.message === "stun" &&
          event.targetId === "owned.mara-vex.1",
      )?.side,
    ).toBe("player");
  });

  it("produces the same result for the same seed and decisions", () => {
    const run = () => {
      let state = createBattle(
        {
          playerCharacterIds: ["character.viking"],
          enemyCharacterIds: ["character.ned-kelly"],
          seed: 818,
          difficulty: "normal",
        },
        combatContent,
      ).state;
      state.player.bar = 100;
      state = requestAction(
        state,
        "player",
        "action.viking.berserker-oath",
        combatContent,
      ).state;
      for (let elapsed = 0; elapsed < 1_250; elapsed += 250) {
        state = tickBattle(state, 250, combatContent).state;
      }
      return state.enemy.squad[0]?.currentHealth;
    };
    expect(run()).toBe(run());
  });

  it("records participants, decisions, events, and outcome in a battle report", () => {
    const created = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        playerBuilds: [{ instanceId: "owned.mara-vex.1", level: 9 }],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 818,
        difficulty: "normal",
      },
      combatContent,
    );
    let report = createBattleReport(created.state, created.events, {
      mode: "story",
      encounterId: "story.first-run.02",
    });
    report = recordBattleDecision(report, created.state, "player", {
      kind: "action",
      actionId: "action.viking.axe-first",
    });
    report = recordBattleDifficultyChange(report, created.state, "hard");
    report = recordBattleDebugAction(report, created.state, {
      action: "step",
      amount: 100,
    });
    const terminalState = structuredClone(created.state);
    terminalState.outcome = "playerWon";
    const transition = {
      state: terminalState,
      events: [
        {
          id: 1,
          type: "battleEnded" as const,
          side: "player" as const,
          message: "playerWon",
        },
      ],
    };
    report = appendBattleTransition(report, transition);

    expect(report.participants[0]).toMatchObject({
      instanceId: "owned.mara-vex.1",
      level: 9,
      actionTiers: {
        "action.viking.axe-first": "stock",
      },
    });
    expect(report.schemaVersion).toBe(2);
    expect(report.initialState.seed).toBe(818);
    expect(report.debugActions).toEqual([
      { action: "step", amount: 100, elapsedMs: 0 },
    ]);
    expect(report.decisions[0]?.command).toEqual({
      kind: "action",
      actionId: "action.viking.axe-first",
    });
    expect(report.events.map((event) => event.type)).toContain("battleEnded");
    expect(report.outcome).toBe("playerWon");
    expect(report.difficultyChanges).toEqual([
      { elapsedMs: 0, from: "normal", to: "hard" },
    ]);
  });

  it("reports a useful pre-random damage estimate", () => {
    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 1,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    expect(
      predictedDamage(
        state,
        "player",
        "action.viking.axe-first",
        combatContent,
      ),
    ).toBeGreaterThan(0);
  });

  it("distributes team damage instead of multiplying its authored pool", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.tux"],
        enemyCharacterIds: [
          "character.ned-kelly",
          "character.grim-reaper",
          "character.humpty",
        ],
        seed: 66,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.bar = 100;
    const before = state.enemy.squad.reduce(
      (sum, combatant) => sum + combatant.currentHealth,
      0,
    );
    state = requestAction(
      state,
      "player",
      "action.tux.kernel-panic",
      combatContent,
    ).state;
    for (let elapsed = 0; elapsed < 1_000; elapsed += 250) {
      state = tickBattle(state, 250, combatContent).state;
    }
    const after = state.enemy.squad.reduce(
      (sum, combatant) => sum + combatant.currentHealth,
      0,
    );
    expect(before - after).toBeGreaterThan(0);
    expect(before - after).toBeLessThan(60);
  });

  it("reserves Charge acceleration for a three-copy Echo Lineup", () => {
    const mixed = createBattle(
      {
        playerCharacterIds: [
          "character.viking",
          "character.tux",
          "character.moses",
        ],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 8,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const echo = createBattle(
      {
        playerCharacterIds: [
          "character.viking",
          "character.viking",
          "character.viking",
        ],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 8,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    expect(mixed.player.echoChargeBonus).toBe(false);
    expect(echo.player.echoChargeBonus).toBe(true);
    expect(
      tickBattle(echo, 250, combatContent).state.player.bar,
    ).toBeGreaterThan(tickBattle(mixed, 250, combatContent).state.player.bar);
  });

  it("uses a deliberate Charge cadence with meaningful Tempo separation", () => {
    expect(chargePerSecond(5)).toBe(6.3);
    expect(chargePerSecond(9)).toBeGreaterThan(chargePerSecond(3) * 1.2);
    expect(25 / chargePerSecond(5)).toBeCloseTo(3.97, 2);
    expect(100 / chargePerSecond(5)).toBeCloseTo(15.87, 2);
    expect(difficultyAiDelay("normal")).toBeGreaterThanOrEqual(1_400);

    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 808,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    expect(state.player.bar).toBe(5);
    expect(state.enemy.bar).toBe(2.5);

    const afterFiveSeconds = tickBattle(state, 250, combatContent).state;
    let advanced = afterFiveSeconds;
    for (let elapsed = 250; elapsed < 5_000; elapsed += 250) {
      advanced = tickBattle(advanced, 250, combatContent).state;
    }
    expect(advanced.player.bar).toBeCloseTo(36.5, 5);

    let quarterStepped = state;
    for (let quarter = 0; quarter < 4; quarter += 1) {
      quarterStepped = tickBattle(quarterStepped, 250, combatContent).state;
    }
    let frameStepped = state;
    for (let frame = 0; frame < 62; frame += 1) {
      frameStepped = tickBattle(frameStepped, 16, combatContent).state;
    }
    frameStepped = tickBattle(frameStepped, 8, combatContent).state;
    expect(frameStepped.player.bar).toBeCloseTo(quarterStepped.player.bar, 8);
  });

  it("pauses a side's Charge while its active Relic is stunned", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 86,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.squad[0]!.statuses.push({
      id: "status.test-stun",
      kind: "stun",
      remainingMs: 1_000,
      magnitude: 1,
    });
    for (let elapsed = 0; elapsed < 1_000; elapsed += 250) {
      state = tickBattle(state, 250, combatContent).state;
      expect(state.player.bar).toBe(5);
    }
    state = tickBattle(state, 250, combatContent).state;
    expect(state.player.bar).toBeGreaterThan(0);
  });

  it("does not resolve a charged Move beyond the timer", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 12,
        difficulty: "normal",
        timeLimitMs: 100,
      },
      combatContent,
    ).state;
    state.player.bar = 100;
    const enemyHealth = state.enemy.squad[0]!.currentHealth;
    state = requestAction(
      state,
      "player",
      "action.viking.shield-bash",
      combatContent,
    ).state;
    state = tickBattle(state, 250, combatContent).state;
    expect(state.enemy.squad[0]!.currentHealth).toBe(enemyHealth);
    expect(state.outcome).not.toBe("active");
  });

  it("interrupts a charging Move when its source takes damage", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 91,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.bar = 100;
    state.enemy.bar = 100;
    state = requestAction(
      state,
      "enemy",
      "action.ned-kelly.last-stand",
      combatContent,
    ).state;
    expect(state.pendingActions.enemy).toBeDefined();
    const interrupted = requestAction(
      state,
      "player",
      "action.viking.axe-first",
      combatContent,
    );
    expect(interrupted.state.pendingActions.enemy).toBeUndefined();
    expect(
      interrupted.events.some((event) => event.type === "actionInterrupted"),
    ).toBe(true);
  });

  it("does not apply a hit-gated status when the attack is dodged", () => {
    const guaranteedControl = structuredClone(combatContent);
    const redTape = guaranteedControl.actions["action.viking.berserker-oath"]!;
    redTape.chargeMs = 0;
    const stun = redTape.effects.find((effect) => effect.kind === "stun");
    if (!stun || stun.kind !== "stun") {
      throw new Error("Red Tape must contain a stun");
    }
    stun.chance = 1;
    let state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        enemyBuilds: [{ statBonuses: { evasion: 100 } }],
        playerStartingBar: 100,
        seed: 1,
        difficulty: "normal",
      },
      guaranteedControl,
    ).state;
    const transition = requestAction(
      state,
      "player",
      redTape.id,
      guaranteedControl,
    );
    state = transition.state;

    expect(
      transition.events.some((event) => event.type === "characterDodged"),
    ).toBe(true);
    expect(
      state.enemy.squad[0]!.statuses.some((status) => status.kind === "stun"),
    ).toBe(false);
  });

  it("automatically switches to the next living Relic", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly", "character.grim-reaper"],
        seed: 27,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.bar = 100;
    state.enemy.squad[0]!.currentHealth = 1;
    state = requestAction(
      state,
      "player",
      "action.viking.axe-first",
      combatContent,
    ).state;
    expect(state.enemy.activeIndex).toBe(1);
    expect(state.outcome).toBe("active");
  });

  it("emits removals when a cleanse clears negative statuses", () => {
    const cleanseContent = structuredClone(combatContent);
    cleanseContent.actions["action.moses.safe-passage"]!.chargeMs = 0;
    cleanseContent.actions["action.moses.safe-passage"]!.effects = [
      { kind: "cleanse", target: "allAllies" },
    ];
    let state = createBattle(
      {
        playerCharacterIds: ["character.moses"],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 73,
        difficulty: "normal",
      },
      cleanseContent,
    ).state;
    state.player.bar = 100;
    state.player.squad[0]!.statuses.push({
      id: "status.test",
      kind: "attack",
      magnitude: -0.2,
      remainingMs: 5_000,
    });
    const cleansed = requestAction(
      state,
      "player",
      "action.moses.safe-passage",
      cleanseContent,
    );
    state = cleansed.state;
    const events: Array<{ type: string }> = [...cleansed.events];
    for (let elapsed = 0; elapsed < 1_250; elapsed += 250) {
      const transition = tickBattle(state, 250, cleanseContent);
      state = transition.state;
      events.push(...transition.events);
    }
    expect(state.player.squad[0]!.statuses).toEqual([]);
    expect(events.some((event) => event.type === "statusRemoved")).toBe(true);
  });
});

describe("progression and rewards", () => {
  it("keeps difficulty progression-neutral", () => {
    const easy = calculateBattleReward({
      won: true,
      firstClear: false,
      opponentLevel: 6,
      difficulty: "easy",
    });
    const brutal = calculateBattleReward({
      won: true,
      firstClear: false,
      opponentLevel: 6,
      difficulty: "brutal",
    });
    expect(easy).toEqual(brutal);
  });

  it("grants partial rewards on a loss", () => {
    const win = calculateBattleReward({
      won: true,
      firstClear: false,
      opponentLevel: 6,
      difficulty: "normal",
    });
    const loss = calculateBattleReward({
      won: false,
      firstClear: false,
      opponentLevel: 6,
      difficulty: "normal",
    });
    expect(loss.xp).toBeGreaterThan(0);
    expect(loss.xp).toBeLessThan(win.xp);
  });

  it("can award multiple levels without losing XP", () => {
    const progress = addXp({ level: 1, xp: 0, unspentStatPoints: 0 }, 400);
    expect(progress.level).toBeGreaterThan(2);
    expect(progress.unspentStatPoints).toBe(progress.levelsGained);
  });
});

describe("AI, missions, and store", () => {
  it("keeps AI choices legal for empty and full Charge Strips", () => {
    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        seed: 33,
        difficulty: "hard",
      },
      combatContent,
    ).state;
    state.enemy.bar = 0;
    expect(chooseAiCommand(state, combatContent)).toBeNull();
    state.enemy.bar = 100;
    const command = chooseAiCommand(state, combatContent);
    expect(command?.kind).toBe("action");
    if (command?.kind === "action") {
      const action = combatContent.actions[command.actionId]!;
      expect(POSITION_RULES[action.position].cost).toBeLessThanOrEqual(
        state.enemy.bar,
      );
    }
  });

  it("lets the AI switch from a healthy pure support into affordable pressure", () => {
    const supportContent = structuredClone(combatContent);
    supportContent.actions["action.moses.part-the-strip"]!.effects =
      supportContent.actions["action.moses.part-the-strip"]!.effects.filter(
        (effect) => effect.kind !== "damage",
      );
    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.moses", "character.grim-reaper"],
        enemyStartingBar: 100,
        seed: 85,
        difficulty: "hard",
      },
      supportContent,
    ).state;

    expect(chooseAiCommand(state, supportContent)).toEqual({
      kind: "switch",
      targetIndex: 1,
    });
  });

  it("waits past a zero-value heal instead of trapping solo support in a loop", () => {
    const supportContent = structuredClone(combatContent);
    supportContent.actions["action.moses.staff-tap"]!.chargeMs = 0;
    supportContent.actions["action.moses.staff-tap"]!.effects = [
      { kind: "heal", target: "self", power: 18 },
    ];
    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.moses"],
        enemyStartingBar: 32,
        seed: 97,
        difficulty: "hard",
      },
      supportContent,
    ).state;

    expect(chooseAiCommand(state, supportContent)).toBeNull();
    state.enemy.bar = 50;
    expect(chooseAiCommand(state, supportContent)).toEqual({
      kind: "action",
      actionId: "action.moses.part-the-strip",
    });
  });

  it("lets the AI activate a ready team Accessory", () => {
    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        enemyAccessoryId: "accessory.dead-air",
        seed: 89,
        difficulty: "hard",
      },
      combatContent,
    ).state;
    state.enemy.accessory!.charge = 100;
    expect(chooseAiCommand(state, combatContent)).toEqual({
      kind: "accessory",
    });
  });

  it("holds a ready AI Accessory until its effect has value", () => {
    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.ned-kelly"],
        enemyAccessoryId: "accessory.press-pass",
        enemyStartingBar: 100,
        seed: 98,
        difficulty: "hard",
      },
      combatContent,
    ).state;
    state.enemy.accessory!.charge = 100;

    expect(chooseAiCommand(state, combatContent)).not.toEqual({
      kind: "accessory",
    });
  });

  it("only completes win missions from matching semantic reports", () => {
    expect(
      evaluateMissionProgress("mission.invoice-denied", 0, {
        type: "battleEnded",
        won: false,
        opponentCharacterIds: ["character.ned-kelly"],
      }),
    ).toBe(0);
    expect(
      evaluateMissionProgress("mission.invoice-denied", 0, {
        type: "battleEnded",
        won: true,
        opponentCharacterIds: ["character.ned-kelly"],
      }),
    ).toBe(1);
    expect(
      evaluateMissionProgress("mission.print-it-personal", 0, {
        type: "storyBattleEnded",
        won: true,
      }),
    ).toBe(1);
    expect(
      evaluateMissionProgress("mission.print-it-personal", 1, {
        type: "storyBattleEnded",
        won: true,
      }),
    ).toBe(2);
  });

  it("rotates four deterministic store labels", () => {
    const first = rotatingOffers("2026-07-29");
    expect(first).toEqual(rotatingOffers("2026-07-29"));
    expect(first).toHaveLength(4);
    expect(new Set(first.map((offer) => offer.id)).size).toBe(4);
    expect(first.every((offer) => baseOffers.includes(offer))).toBe(true);
  });

  it("purchases character copies atomically and refuses duplicate Patches", () => {
    const save = createDefaultSave(1);
    save.stamps = 500;
    const characterOffer = baseOffers.find(
      (offer) => offer.id === "offer.tux",
    )!;
    const purchasedCharacter = purchaseOffer(
      save,
      characterOffer,
      "owned.character.tux.test",
    );
    expect(purchasedCharacter.ok).toBe(true);
    if (!purchasedCharacter.ok) {
      return;
    }
    expect(save.stamps).toBe(500);
    expect(purchasedCharacter.save.stamps).toBe(500 - characterOffer.price);
    expect(
      purchasedCharacter.save.collection.some(
        (entry) => entry.instanceId === "owned.character.tux.test",
      ),
    ).toBe(true);

    const patchOffer = baseOffers.find(
      (offer) => offer.id === "offer.hot-start",
    )!;
    const purchasedPatch = purchaseOffer(purchasedCharacter.save, patchOffer);
    expect(purchasedPatch.ok).toBe(true);
    if (!purchasedPatch.ok) {
      return;
    }
    const duplicate = purchaseOffer(purchasedPatch.save, patchOffer);
    expect(duplicate).toEqual({ ok: false, reason: "alreadyOwned" });
    expect(purchasedPatch.save.stamps).toBe(
      purchasedCharacter.save.stamps - patchOffer.price,
    );
  });
});

describe("validated persistence", () => {
  it("migrates a flat v2 save into one profile with a nested First Run Story Save", () => {
    const storage = new MemoryStorage();
    const legacy = createDefaultSave(1);
    legacy.playerName = "Dean";
    legacy.stamps = 432;
    legacy.currentNodeId = "story.first-run.07";
    legacy.clearedNodeIds = ["story.first-run.06"];
    legacy.collection = [
      createOwnedCharacter(
        "owned.viking.profile-migration",
        "character.viking",
        9,
      ),
    ];
    legacy.quickFightRecord.wins = 4;
    legacy.tournamentTrophyIds = ["trophy.wrong-door-cup"];
    const rawLegacy = JSON.stringify(legacy);
    storage.setItem("riot-relics.save.v2.1", rawLegacy);

    const profile = loadPlayerProfile(storage, 1);

    expect(profile).toMatchObject({
      schemaVersion: 3,
      profileId: "profile.local.1",
      playerName: "Dean",
      quickFightRecord: { wins: 4 },
    });
    expect(profile.storySaves["story.first-run"]).toMatchObject({
      storyId: "story.first-run",
      stamps: 432,
      activeSquadInstanceIds: ["owned.viking.profile-migration"],
    });
    expect(profile.storySaves["story.first-run"]?.collection).toHaveLength(1);
    expect(profile.storySaves["story.first-run"]?.tournamentTrophies).toEqual([
      expect.objectContaining({
        tournamentId: "tournament.cheap-seats",
        trophyId: "trophy.wrong-door-cup",
        provenance: "legacy-imported",
      }),
    ]);
    expect(profile.tournamentTrophies["tournament.cheap-seats"]).toMatchObject({
      trophyId: "trophy.wrong-door-cup",
      provenance: [expect.objectContaining({ source: "legacy-imported" })],
    });
    expect(storage.getItem("riot-relics.profile.v3.1")).not.toBeNull();
    expect(storage.getItem("riot-relics.save.v2.1.pre-profile-v3")).toBe(
      rawLegacy,
    );
    expect(loadSave(storage, 1)).toMatchObject({
      playerName: "Dean",
      stamps: 432,
      storyTournamentTrophyIds: ["trophy.wrong-door-cup"],
    });
  });

  it("gives each untouched local profile a distinct preset identity", () => {
    expect(createDefaultSave(1).playerName).toBe("Headliner");
    expect(createDefaultSave(2).playerName).toBe("Contender");
    expect(createDefaultSave(3).playerName).toBe("Wildcard");
  });

  it("migrates the retired generic Player identity without replacing custom names", () => {
    const storage = new MemoryStorage();
    const generic = createDefaultPlayerProfile(2);
    generic.playerName = "Player";
    storage.setItem(
      "riot-relics.profile.v3.2",
      JSON.stringify({ ...generic, identityPresetVersion: undefined }),
    );
    const custom = createDefaultPlayerProfile(3);
    custom.playerName = "Dean";
    storage.setItem(
      "riot-relics.profile.v3.3",
      JSON.stringify({ ...custom, identityPresetVersion: undefined }),
    );

    expect(loadPlayerProfile(storage, 2).playerName).toBe("Contender");
    expect(loadPlayerProfile(storage, 3).playerName).toBe("Dean");
    const persisted = JSON.parse(
      storage.getItem("riot-relics.profile.v3.2") ?? "null",
    ) as unknown;
    expect(persisted).toMatchObject({
      playerName: "Contender",
      identityPresetVersion: 1,
    });

    const explicitlyRenamed = loadPlayerProfile(storage, 2);
    explicitlyRenamed.playerName = "Player";
    savePlayerProfile(storage, 2, explicitlyRenamed);
    expect(loadPlayerProfile(storage, 2).playerName).toBe("Player");
  });

  it("keeps standalone and Story Trophy provenance on one global ownership record", () => {
    const awardedAt = "2026-08-07T00:00:00.000Z";
    let profile = recordTournamentTrophyOwnership(
      createDefaultPlayerProfile(1),
      {
        tournamentId: "tournament.cheap-seats",
        trophyId: "trophy.wrong-door-cup",
        source: "standalone",
        awardedAt,
      },
    );
    profile = recordTournamentTrophyOwnership(profile, {
      tournamentId: "tournament.cheap-seats",
      trophyId: "trophy.wrong-door-cup",
      source: "story",
      storyId: "story.first-run",
      awardedAt,
    });

    expect(Object.keys(profile.tournamentTrophies)).toEqual([
      "tournament.cheap-seats",
    ]);
    expect(
      profile.tournamentTrophies["tournament.cheap-seats"]?.provenance,
    ).toEqual([
      { source: "standalone", storyId: null, awardedAt },
      { source: "story", storyId: "story.first-run", awardedAt },
    ]);
    expect(profile.storySaves["story.first-run"]?.tournamentTrophies).toEqual([
      {
        tournamentId: "tournament.cheap-seats",
        trophyId: "trophy.wrong-door-cup",
        provenance: "story",
        awardedAt,
      },
    ]);
  });

  it("records a later standalone win when Story already owns the same Trophy", () => {
    const storage = new MemoryStorage();
    const storyWin = loadSave(storage, 1);
    storyWin.tournamentTrophyIds = ["trophy.wrong-door-cup"];
    storyWin.storyTournamentTrophyIds = ["trophy.wrong-door-cup"];
    const savedStoryWin = saveTournamentVictory(
      storage,
      storyWin,
      "tournament.cheap-seats",
      "story",
    );
    saveTournamentVictory(
      storage,
      savedStoryWin,
      "tournament.cheap-seats",
      "standalone",
    );

    expect(
      loadPlayerProfile(storage, 1).tournamentTrophies[
        "tournament.cheap-seats"
      ]?.provenance.map(({ source }) => source),
    ).toEqual(["story", "standalone"]);
  });

  it("persists Story progression and global Quick Fight history to separate profile branches", () => {
    const storage = new MemoryStorage();
    const save = loadSave(storage, 2);
    save.stamps = 901;
    save.quickFightRecord.fightsPlayed = 12;
    saveSlot(storage, save);

    const profile = loadPlayerProfile(storage, 2);
    expect(profile.storySaves["story.first-run"]?.stamps).toBe(901);
    expect(profile.quickFightRecord.fightsPlayed).toBe(12);
    expect(profile.storySaves["story.first-run"]).not.toHaveProperty(
      "quickFightRecord",
    );
  });

  it("rejects a custom Tournament without a fight node", () => {
    const storage = new MemoryStorage();
    const profile = createDefaultPlayerProfile(1);
    profile.customTournamentDefinitions.push({
      id: "tournament.custom.no-fight",
      name: "No Fight Cup",
      trophyId: "trophy.generic.gold-cup",
      nodes: [
        {
          id: "node.content-only",
          kind: "content",
          label: "A very short speech",
          opponentCharacterIds: [],
        },
      ],
      createdAt: "2026-08-07T00:00:00.000Z",
      updatedAt: "2026-08-07T00:00:00.000Z",
    });

    expect(() => savePlayerProfile(storage, 1, profile)).toThrow(
      "A custom Tournament requires at least one fight",
    );
  });

  it("adds a profile-owned Quick Fight record to older compatible v2 saves", () => {
    const storage = new MemoryStorage();
    const olderSave = {
      ...createDefaultSave(1),
      quickFightRecord: undefined,
    };
    storage.setItem("riot-relics.save.v2.1", JSON.stringify(olderSave));

    expect(loadSave(storage, 1).quickFightRecord).toEqual({
      fightsPlayed: 0,
      wins: 0,
      losses: 0,
      lastSeed: null,
      lastPlayerCharacterIds: [],
      lastOpponentCharacterIds: [],
    });
  });

  it("keeps three save slots independent, including owned Patches", () => {
    const storage = new MemoryStorage();
    const slotTwo = createDefaultSave(2);
    slotTwo.stamps = 17;
    slotTwo.ownedPatches.push("patch.hot-start");
    saveSlot(storage, slotTwo);
    expect(loadSave(storage, 1).stamps).toBe(80);
    expect(loadSave(storage, 2).ownedPatches).toEqual(["patch.hot-start"]);
  });

  it("preserves corrupt local data and returns safe defaults", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      "riot-relics.preferences.v1",
      JSON.stringify({ musicVolume: "very loud" }),
    );
    expect(loadPreferences(storage)).toEqual(defaultPreferences);
    expect(loadStorageWarning(storage)).toContain("Invalid preferences");
    expect(
      [...Array(storage.length).keys()]
        .map((index) => storage.key(index))
        .some((key) => key?.includes(".corrupt.")),
    ).toBe(true);
  });

  it("persists accepted safe defaults for a corrupt active save", () => {
    const storage = new MemoryStorage();
    storage.setItem("riot-relics.save.v2.2", "{definitely-not-json");
    expect(loadSave(storage, 2)).toEqual(createDefaultSave(2));
    const backupCount = [...Array(storage.length).keys()].filter((index) =>
      storage.key(index)?.includes(".corrupt."),
    ).length;

    const recovered = acceptSafeDefaults(storage, 2);
    expect(recovered.save).toEqual(loadSave(storage, 2));
    expect(loadStorageWarning(storage)).toBeNull();
    expect(
      [...Array(storage.length).keys()].filter((index) =>
        storage.key(index)?.includes(".corrupt."),
      ).length,
    ).toBe(backupCount);
  });

  it.each([null, "unknown.legacy-target"])(
    "does not erase a valid save when a legacy warning has target %s",
    (target) => {
      const storage = new MemoryStorage();
      const validSave = createDefaultSave(1);
      validSave.stamps = 777;
      saveSlot(storage, validSave);
      storage.setItem(
        "riot-relics.storage-warning.v1",
        "An older build left this warning behind.",
      );
      if (target) {
        storage.setItem("riot-relics.storage-recovery-target.v1", target);
      }

      const recovered = acceptSafeDefaults(storage, 1);

      expect(recovered.save.stamps).toBe(777);
      expect(loadSave(storage, 1).stamps).toBe(777);
      expect(loadStorageWarning(storage)).toBeNull();
    },
  );

  it("round-trips the independent save-slot index", () => {
    const storage = new MemoryStorage();
    saveActiveSaveSlot(storage, 3);
    expect(loadActiveSaveSlot(storage)).toBe(3);
    savePreferences(storage, defaultPreferences);
    expect(loadPreferences(storage)).toEqual(defaultPreferences);
  });

  it("defaults older valid preferences to music off and hold-to-pause", () => {
    const storage = new MemoryStorage();
    const {
      musicPlaybackEnabled: _removedPlaybackIntent,
      pauseKeyMode: _removedPauseKeyMode,
      ...olderPreferences
    } = defaultPreferences;
    void _removedPlaybackIntent;
    void _removedPauseKeyMode;
    storage.setItem(
      "riot-relics.preferences.v1",
      JSON.stringify(olderPreferences),
    );

    expect(loadPreferences(storage).musicPlaybackEnabled).toBe(false);
    expect(loadPreferences(storage).pauseKeyMode).toBe("hold");
  });

  it("reconciles an earlier-build save when switching into its slot", () => {
    const storage = new MemoryStorage();
    const earlierBuildSave = createDefaultSave(2);
    earlierBuildSave.currentNodeId = "story.first-run.03";
    earlierBuildSave.clearedNodeIds = ["story.first-run.02"];
    saveSlot(storage, earlierBuildSave);

    const opened = loadFirstRunSave(storage, 2);

    expect(opened.clearedNodeIds).toEqual([
      "story.first-run.02",
      "story.first-run.00",
      "story.first-run.01",
    ]);
    expect(loadSave(storage, 2).clearedNodeIds).toEqual(opened.clearedNodeIds);
  });

  it("migrates a v1 save explicitly into the v2 slot key", () => {
    const storage = new MemoryStorage();
    const legacyOwned = createOwnedCharacter(
      "owned.prototype.v1",
      "character.zipwire",
      4,
    );
    legacyOwned.actionOrder = ["action.zipwire.full-tilt"];
    storage.setItem(
      "riot-relics.save.v1.3",
      JSON.stringify({
        ...createDefaultSave(3),
        schemaVersion: 1,
        stamps: 321,
        collection: [legacyOwned],
        ownedPatches: undefined,
        claimedMissionIds: undefined,
      }),
    );
    const migrated = loadSave(storage, 3);
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.stamps).toBe(321);
    expect(migrated.ownedPatches).toEqual([]);
    expect(migrated.claimedMissionIds).toEqual([]);
    expect(migrated.collection[0]).toEqual(
      expect.objectContaining({
        characterId: "character.tux",
        actionOrder: ["action.tux.kernel-panic"],
      }),
    );
    expect(storage.getItem("riot-relics.save.v2.3")).not.toBeNull();
  });

  it("migrates the retired Tournament champion badge into Trophy ownership", () => {
    const storage = new MemoryStorage();
    const legacy = {
      ...createDefaultSave(1),
      tournamentTrophyIds: undefined,
      tournamentBadges: [
        "badge.cheap-seats-champion",
        "badge.cheap-seats-champion",
      ],
    };
    storage.setItem("riot-relics.save.v2.1", JSON.stringify(legacy));

    const migrated = loadSave(storage, 1);

    expect(migrated.tournamentTrophyIds).toEqual(["trophy.wrong-door-cup"]);
    expect(storage.getItem("riot-relics.save.v2.1")).toContain(
      "tournamentTrophyIds",
    );
  });

  it("migrates retired prototype roster IDs in an existing v2 save", () => {
    const storage = new MemoryStorage();
    const legacy = createDefaultSave(1);
    const owned = createOwnedCharacter(
      "owned.prototype.1",
      "character.mara-vex",
      9,
    );
    owned.actionOrder = [
      "action.mara-vex.hostile-takeover",
      "action.mara-vex.red-tape",
      "action.mara-vex.invoice-breaker",
    ];
    owned.actionPositions["action.mara-vex.red-tape"] = "2H";
    owned.actionTiers["action.mara-vex.red-tape"] = "gold";
    legacy.collection = [owned];
    legacy.lossesTo = ["character.knuckle-tax"];
    legacy.revealedRivalIds = ["character.zipwire"];
    const retiredBuild = {
      characterId: "character.scrapjack",
      instanceId: "owned.prototype.run",
      level: 7,
      statBonuses: {
        health: 0,
        power: 0,
        evasion: 0,
        fortune: 0,
        tempo: 0,
      },
      actionIds: [
        "action.scrapjack.bin-kick",
        "action.scrapjack.loose-screws",
        "action.scrapjack.hard-rubbish",
      ] as [string, string, string],
      actionPositions: {
        "action.scrapjack.hard-rubbish": "3H" as const,
      },
      actionTiers: { "action.scrapjack.hard-rubbish": "platinum" as const },
      interruptionResistance: 0,
      equippedPatchId: null,
    };
    legacy.tournamentRun = createCheapSeatsRun([retiredBuild], "story");
    legacy.standaloneTournamentRun = createCheapSeatsRun([retiredBuild]);
    storage.setItem("riot-relics.save.v2.1", JSON.stringify(legacy));

    const migrated = loadSave(storage, 1);

    expect(migrated.collection[0]).toEqual(
      expect.objectContaining({
        characterId: "character.viking",
        actionOrder: [
          "action.viking.berserker-oath",
          "action.viking.shield-bash",
          "action.viking.axe-first",
        ],
        actionPositions: { "action.viking.shield-bash": "2H" },
        actionTiers: { "action.viking.shield-bash": "gold" },
      }),
    );
    expect(migrated.lossesTo).toEqual(["character.ned-kelly"]);
    expect(migrated.revealedRivalIds).toEqual(["character.tux"]);
    for (const run of [
      migrated.tournamentRun,
      migrated.standaloneTournamentRun,
    ]) {
      expect(run?.caseBuilds[0]).toEqual(
        expect.objectContaining({
          characterId: "character.grim-reaper",
          actionIds: [
            "action.grim-reaper.cold-touch",
            "action.grim-reaper.deaths-shadow",
            "action.grim-reaper.final-harvest",
          ],
          actionPositions: {
            "action.grim-reaper.final-harvest": "3H",
          },
          actionTiers: {
            "action.grim-reaper.final-harvest": "platinum",
          },
        }),
      );
    }
    expect(storage.getItem("riot-relics.save.v2.1")).toContain(
      "character.viking",
    );
  });

  it("repairs persisted Tournament deployment invariants while loading", () => {
    const storage = new MemoryStorage();
    const save = createDefaultSave(1);
    const caseBuilds = cheapSeatsPlayerIds
      .slice(0, 3)
      .map((characterId, index) => {
        const definition = combatContent.characters[characterId]!;
        const build = createStandardBuild(definition, "player", index);
        return {
          characterId,
          instanceId: build.instanceId!,
          level: build.level!,
          statBonuses: {
            health: build.statBonuses?.health ?? 0,
            power: build.statBonuses?.power ?? 0,
            evasion: build.statBonuses?.evasion ?? 0,
            fortune: build.statBonuses?.fortune ?? 0,
            tempo: build.statBonuses?.tempo ?? 0,
          },
          actionIds: build.actionIds!,
          actionTiers: {},
          interruptionResistance: 0,
          equippedPatchId: null,
        };
      });
    const run = createCheapSeatsRun(caseBuilds);
    run.healthRatios[caseBuilds[0]!.instanceId] = 0;
    run.healthRatios["retired.tournament.instance"] = 0.4;
    run.deployedInstanceIds = [
      caseBuilds[0]!.instanceId,
      caseBuilds[1]!.instanceId,
      caseBuilds[1]!.instanceId,
    ];
    run.activeInstanceId = caseBuilds[0]!.instanceId;
    save.standaloneTournamentRun = run;
    storage.setItem("riot-relics.save.v2.1", JSON.stringify(save));

    const loaded = loadSave(storage, 1);

    expect(loaded.standaloneTournamentRun?.deployedInstanceIds).toEqual([
      caseBuilds[1]!.instanceId,
    ]);
    expect(loaded.standaloneTournamentRun?.activeInstanceId).toBe(
      caseBuilds[1]!.instanceId,
    );
    expect(
      loaded.standaloneTournamentRun?.healthRatios[
        "retired.tournament.instance"
      ],
    ).toBeUndefined();
  });
});
