import { describe, expect, it } from "vitest";
import {
  chooseAiCommand,
  createBattle,
  predictedDamage,
  requestAction,
  requestSwitch,
  tickBattle,
} from "./combat/engine";
import type { BattleEvent } from "./combat/types";
import {
  classMultiplier,
  POSITION_RULES,
  sideForInstance,
} from "./combat/rules";
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
import {
  buildForOwnedCharacter,
  equipPatch,
  openingChargeBonus,
} from "./progression/patches";
import {
  acceptSafeDefaults,
  createDefaultSave,
  createOwnedCharacter,
  defaultPreferences,
  loadActiveSaveSlot,
  loadPreferences,
  loadSave,
  loadStorageWarning,
  savePreferences,
  saveActiveSaveSlot,
  saveSlot,
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
  createCheapSeatsRun,
  lockCheapSeatsCase,
  recordCheapSeatsResult,
  recordCheapSeatsVictory,
  restoreCaseHealth,
} from "./tournament/cheap-seats";

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
      createOwnedCharacter("owned.mara-vex.1", "character.mara-vex", 7),
    ).toMatchObject({
      instanceId: "owned.mara-vex.1",
      characterId: "character.mara-vex",
      level: 7,
    });
  });

  it("claims the First Run ending reward exactly once", () => {
    const save = createDefaultSave(1);
    save.currentNodeId = "story.first-run.07";
    const first = claimFirstRunEnding(save);
    expect(first.claimed).toBe(true);
    expect(first.save.stamps).toBe(save.stamps + FIRST_RUN_ENDING_REWARD);
    expect(first.save.clearedNodeIds).toContain("story.first-run.07");
    expect(first.save.revealedRivalIds).toContain("character.knuckle-tax");

    const duplicate = claimFirstRunEnding(first.save);
    expect(duplicate.claimed).toBe(false);
    expect(duplicate.save.stamps).toBe(first.save.stamps);
  });

  it("carries a tournament Case through an interlude and authored next round", () => {
    const run = createCheapSeatsRun();
    const created = createBattle(
      {
        playerCharacterIds: [
          "character.mara-vex",
          "character.zipwire",
          "character.velvet-hex",
        ],
        enemyCharacterIds: ["character.velvet-hex"],
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
          "character.mara-vex",
          "character.zipwire",
          "character.velvet-hex",
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

  it("marks the third Cheap Seats victory complete", () => {
    const state = createBattle(
      {
        playerCharacterIds: ["character.mara-vex"],
        enemyCharacterIds: ["character.knuckle-tax"],
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

  it("ends a Cheap Seats run on any lost round", () => {
    const state = createBattle(
      {
        playerCharacterIds: ["character.mara-vex"],
        enemyCharacterIds: ["character.knuckle-tax"],
        seed: cheapSeatsEncounter(1).seed,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const result = recordCheapSeatsResult(
      { ...createCheapSeatsRun(), roundIndex: 1 },
      state,
      false,
    );
    expect(result).toEqual({ status: "lost", run: null });
  });

  it("locks the exact Case roster and migrates legacy loaner health", () => {
    const build = {
      characterId: "character.zipwire",
      instanceId: "owned.character.zipwire.new",
      level: 8,
      statBonuses: {
        health: 0,
        power: 0,
        evasion: 0,
        fortune: 0,
        tempo: 0,
      },
      actionIds: combatContent.characters["character.zipwire"]!.actionIds,
      actionTiers: {},
      interruptionResistance: 0,
      equippedPatchId: null,
    };
    const legacy = {
      ...createCheapSeatsRun(),
      roundIndex: 1 as const,
      phase: "interlude" as const,
      healthRatios: {
        "loaner.0.character.zipwire": 0.42,
      },
      activeInstanceId: null,
    };
    const locked = lockCheapSeatsCase(legacy, [build]);
    build.level = 25;

    expect(locked.caseBuilds[0]).toMatchObject({
      instanceId: "owned.character.zipwire.new",
      level: 8,
    });
    expect(locked.healthRatios["owned.character.zipwire.new"]).toBe(0.42);
    expect(locked.healthRatios["loaner.0.character.zipwire"]).toBeUndefined();
    expect(locked.activeInstanceId).toBe("owned.character.zipwire.new");

    const activeRepair = applyCheapSeatsDrop(
      lockCheapSeatsCase(legacy, [build]),
      "front-print-repair",
    );
    expect(
      activeRepair.healthRatios["owned.character.zipwire.new"],
    ).toBeCloseTo(0.87);

    const caseRepair = applyCheapSeatsDrop(
      lockCheapSeatsCase(legacy, [build]),
      "case-repair",
    );
    expect(caseRepair.healthRatios["owned.character.zipwire.new"]).toBeCloseTo(
      0.6,
    );
    expect(
      caseRepair.healthRatios["loaner.0.character.zipwire"],
    ).toBeUndefined();
  });

  it("repairs and restores the Relic that ended the prior round active", () => {
    const state = createBattle(
      {
        playerCharacterIds: [
          "character.mara-vex",
          "character.zipwire",
          "character.velvet-hex",
        ],
        enemyCharacterIds: ["character.knuckle-tax"],
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
            "character.mara-vex",
            "character.zipwire",
            "character.velvet-hex",
          ],
          enemyCharacterIds: ["character.gutter-grin"],
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

  it("forms a circular six-class wheel with neutral fallback", () => {
    expect(classMultiplier("impact", "feral")).toBe(1.2);
    expect(classMultiplier("feral", "impact")).toBe(0.82);
    expect(classMultiplier("impact", "neutral")).toBe(1);
  });

  it("makes later action positions costlier and stronger", () => {
    expect(POSITION_RULES["1L"].cost).toBeLessThan(POSITION_RULES["3H"].cost);
    expect(POSITION_RULES["1L"].multiplier).toBeLessThan(
      POSITION_RULES["3H"].multiplier,
    );
  });

  it("keeps the team Charge Strip when switching", () => {
    const created = createBattle(
      {
        playerCharacterIds: ["character.mara-vex", "character.zipwire"],
        enemyCharacterIds: ["character.knuckle-tax"],
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

  it("applies a saved character build instead of the authored base level", () => {
    const baseline = createBattle(
      {
        playerCharacterIds: ["character.mara-vex"],
        enemyCharacterIds: ["character.knuckle-tax"],
        seed: 42,
        difficulty: "normal",
      },
      combatContent,
    ).state.player.squad[0]!;
    const progressed = createBattle(
      {
        playerCharacterIds: ["character.mara-vex"],
        playerBuilds: [
          {
            instanceId: "owned.mara-vex.1",
            level: 20,
          },
        ],
        enemyCharacterIds: ["character.knuckle-tax"],
        seed: 42,
        difficulty: "normal",
      },
      combatContent,
    ).state.player.squad[0]!;

    expect(progressed.instanceId).toBe("owned.mara-vex.1");
    expect(progressed.level).toBe(20);
    expect(progressed.maxHealth).toBeGreaterThan(baseline.maxHealth);
  });

  it("keeps opaque owned-instance IDs on the player side", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.mara-vex"],
        playerBuilds: [{ instanceId: "owned.mara-vex.1" }],
        enemyCharacterIds: ["character.knuckle-tax"],
        seed: 42,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.bar = 100;
    const started = requestAction(
      state,
      "player",
      "action.mara-vex.hostile-takeover",
      combatContent,
    );
    state = started.state;
    const events = [...started.events];
    for (let elapsed = 0; elapsed < 1_250; elapsed += 250) {
      const transition = tickBattle(state, 250, combatContent);
      state = transition.state;
      events.push(...transition.events);
    }
    const selfBuff = events.find(
      (event) =>
        event.type === "statusApplied" && event.targetId === "owned.mara-vex.1",
    );

    expect(sideForInstance(state, "owned.mara-vex.1")).toBe("player");
    expect(selfBuff?.side).toBe("player");
  });

  it("cleanses owned player instances without relying on ID prefixes", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.velvet-hex"],
        playerBuilds: [{ instanceId: "owned.velvet-hex.1" }],
        enemyCharacterIds: ["character.knuckle-tax"],
        seed: 43,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.squad[0]!.statuses.push({
      id: "test.attack-down",
      kind: "attack",
      magnitude: -0.2,
      remainingMs: 5_000,
    });
    state.player.bar = 100;
    state = requestAction(
      state,
      "player",
      "action.velvet-hex.curtain-call",
      combatContent,
    ).state;
    const events = [];
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
    expect(state.player.squad[0]!.statuses).toHaveLength(0);
  });

  it("applies equipped Patch effects to an owned-instance build", () => {
    const owned = createOwnedCharacter(
      "owned.mara-vex.1",
      "character.mara-vex",
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
      "character.mara-vex",
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
    let state = createBattle(
      {
        playerCharacterIds: ["character.mara-vex"],
        playerBuilds: [
          {
            instanceId: "owned.mara-vex.1",
            interruptionResistance: 1,
          },
        ],
        enemyCharacterIds: ["character.knuckle-tax"],
        seed: 42,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.bar = 100;
    state.enemy.bar = 100;
    state = requestAction(
      state,
      "player",
      "action.mara-vex.red-tape",
      combatContent,
    ).state;
    const hit = requestAction(
      state,
      "enemy",
      "action.knuckle-tax.late-fee",
      combatContent,
    );
    expect(
      hit.events.some((event) => event.type === "interruptionResisted"),
    ).toBe(true);
    expect(hit.state.pendingActions.player?.actionId).toBe(
      "action.mara-vex.red-tape",
    );
  });

  it("marks enemy debuffs and stuns against opaque owned IDs as player events", () => {
    let debuffState = createBattle(
      {
        playerCharacterIds: ["character.mara-vex"],
        playerBuilds: [{ instanceId: "owned.mara-vex.1" }],
        enemyCharacterIds: ["character.velvet-hex"],
        seed: 44,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    debuffState.enemy.bar = 100;
    debuffState = requestAction(
      debuffState,
      "enemy",
      "action.velvet-hex.bad-omen",
      combatContent,
    ).state;
    const debuffEvents: BattleEvent[] = [];
    for (let elapsed = 0; elapsed < 500; elapsed += 250) {
      const transition = tickBattle(debuffState, 250, combatContent);
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
    const stunEffect = guaranteedStunContent.actions[
      "action.knuckle-tax.asset-freeze"
    ]!.effects.find((effect) => effect.kind === "stun");
    if (!stunEffect || stunEffect.kind !== "stun") {
      throw new Error("Asset Freeze must contain a stun effect");
    }
    stunEffect.chance = 1;
    let stunState = createBattle(
      {
        playerCharacterIds: ["character.mara-vex"],
        playerBuilds: [{ instanceId: "owned.mara-vex.1" }],
        enemyCharacterIds: ["character.knuckle-tax"],
        seed: 45,
        difficulty: "normal",
      },
      guaranteedStunContent,
    ).state;
    stunState.enemy.bar = 100;
    stunState = requestAction(
      stunState,
      "enemy",
      "action.knuckle-tax.asset-freeze",
      guaranteedStunContent,
    ).state;
    const stunEvents: BattleEvent[] = [];
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
          playerCharacterIds: ["character.mara-vex"],
          enemyCharacterIds: ["character.knuckle-tax"],
          seed: 818,
          difficulty: "normal",
        },
        combatContent,
      ).state;
      state.player.bar = 100;
      state = requestAction(
        state,
        "player",
        "action.mara-vex.hostile-takeover",
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
        playerCharacterIds: ["character.mara-vex"],
        playerBuilds: [{ instanceId: "owned.mara-vex.1", level: 9 }],
        enemyCharacterIds: ["character.knuckle-tax"],
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
      actionId: "action.mara-vex.invoice-breaker",
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
        "action.mara-vex.invoice-breaker": "stock",
      },
    });
    expect(report.schemaVersion).toBe(2);
    expect(report.initialState.seed).toBe(818);
    expect(report.debugActions).toEqual([
      { action: "step", amount: 100, elapsedMs: 0 },
    ]);
    expect(report.decisions[0]?.command).toEqual({
      kind: "action",
      actionId: "action.mara-vex.invoice-breaker",
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
        playerCharacterIds: ["character.mara-vex"],
        enemyCharacterIds: ["character.knuckle-tax"],
        seed: 1,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    expect(
      predictedDamage(
        state,
        "player",
        "action.mara-vex.invoice-breaker",
        combatContent,
      ),
    ).toBeGreaterThan(0);
  });

  it("distributes team damage instead of multiplying its authored pool", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.zipwire"],
        enemyCharacterIds: [
          "character.knuckle-tax",
          "character.scrapjack",
          "character.gutter-grin",
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
      "action.zipwire.full-tilt",
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
    expect(before - after).toBeLessThan(45);
  });

  it("reserves Charge acceleration for a three-copy Echo Lineup", () => {
    const mixed = createBattle(
      {
        playerCharacterIds: [
          "character.mara-vex",
          "character.zipwire",
          "character.velvet-hex",
        ],
        enemyCharacterIds: ["character.knuckle-tax"],
        seed: 8,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    const echo = createBattle(
      {
        playerCharacterIds: [
          "character.mara-vex",
          "character.mara-vex",
          "character.mara-vex",
        ],
        enemyCharacterIds: ["character.knuckle-tax"],
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

  it("does not resolve a charged Move beyond the timer", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.mara-vex"],
        enemyCharacterIds: ["character.knuckle-tax"],
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
      "action.mara-vex.red-tape",
      combatContent,
    ).state;
    state = tickBattle(state, 250, combatContent).state;
    expect(state.enemy.squad[0]!.currentHealth).toBe(enemyHealth);
    expect(state.outcome).not.toBe("active");
  });

  it("interrupts a charging Move when its source takes damage", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.mara-vex"],
        enemyCharacterIds: ["character.knuckle-tax"],
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
      "action.knuckle-tax.asset-freeze",
      combatContent,
    ).state;
    expect(state.pendingActions.enemy).toBeDefined();
    const interrupted = requestAction(
      state,
      "player",
      "action.mara-vex.invoice-breaker",
      combatContent,
    );
    expect(interrupted.state.pendingActions.enemy).toBeUndefined();
    expect(
      interrupted.events.some((event) => event.type === "actionInterrupted"),
    ).toBe(true);
  });

  it("automatically switches to the next living Relic", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.mara-vex"],
        enemyCharacterIds: ["character.knuckle-tax", "character.scrapjack"],
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
      "action.mara-vex.invoice-breaker",
      combatContent,
    ).state;
    expect(state.enemy.activeIndex).toBe(1);
    expect(state.outcome).toBe("active");
  });

  it("emits removals when a cleanse clears negative statuses", () => {
    let state = createBattle(
      {
        playerCharacterIds: ["character.velvet-hex"],
        enemyCharacterIds: ["character.knuckle-tax"],
        seed: 73,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.bar = 100;
    state.player.squad[0]!.statuses.push({
      id: "status.test",
      kind: "attack",
      magnitude: -0.2,
      remainingMs: 5_000,
    });
    state = requestAction(
      state,
      "player",
      "action.velvet-hex.curtain-call",
      combatContent,
    ).state;
    const events: Array<{ type: string }> = [];
    for (let elapsed = 0; elapsed < 1_250; elapsed += 250) {
      const transition = tickBattle(state, 250, combatContent);
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
        playerCharacterIds: ["character.mara-vex"],
        enemyCharacterIds: ["character.knuckle-tax"],
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

  it("only completes win missions from matching semantic reports", () => {
    expect(
      evaluateMissionProgress("mission.invoice-denied", 0, {
        type: "battleEnded",
        won: false,
        opponentCharacterIds: ["character.knuckle-tax"],
      }),
    ).toBe(0);
    expect(
      evaluateMissionProgress("mission.invoice-denied", 0, {
        type: "battleEnded",
        won: true,
        opponentCharacterIds: ["character.knuckle-tax"],
      }),
    ).toBe(1);
    expect(
      evaluateMissionProgress("mission.print-it-personal", 0, {
        type: "vengeanceResolved",
        opponentCharacterId: "character.knuckle-tax",
        previouslyLost: true,
        won: true,
      }),
    ).toBe(1);
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
      (offer) => offer.id === "offer.zipwire",
    )!;
    const purchasedCharacter = purchaseOffer(
      save,
      characterOffer,
      "owned.character.zipwire.test",
    );
    expect(purchasedCharacter.ok).toBe(true);
    if (!purchasedCharacter.ok) {
      return;
    }
    expect(save.stamps).toBe(500);
    expect(purchasedCharacter.save.stamps).toBe(500 - characterOffer.price);
    expect(
      purchasedCharacter.save.collection.some(
        (entry) => entry.instanceId === "owned.character.zipwire.test",
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

  it("defaults older valid preferences to music off until the player opts in", () => {
    const storage = new MemoryStorage();
    const {
      musicPlaybackEnabled: _removedPlaybackIntent,
      ...olderPreferences
    } = defaultPreferences;
    void _removedPlaybackIntent;
    storage.setItem(
      "riot-relics.preferences.v1",
      JSON.stringify(olderPreferences),
    );

    expect(loadPreferences(storage).musicPlaybackEnabled).toBe(false);
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
    storage.setItem(
      "riot-relics.save.v1.3",
      JSON.stringify({
        ...createDefaultSave(3),
        schemaVersion: 1,
        stamps: 321,
        ownedPatches: undefined,
        claimedMissionIds: undefined,
      }),
    );
    const migrated = loadSave(storage, 3);
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.stamps).toBe(321);
    expect(migrated.ownedPatches).toEqual([]);
    expect(migrated.claimedMissionIds).toEqual([]);
    expect(storage.getItem("riot-relics.save.v2.3")).not.toBeNull();
  });
});
