import { describe, expect, it } from "vitest";
import { combatContent } from "../content/initial-content";
import { createBattle, requestAction, tickBattle } from "./engine";
import { actionTierProperties } from "./rules";
import { createStandardBuild } from "./standard-build";
import type {
  ActionDefinition,
  ActionTier,
  BattleEvent,
  BattleState,
  Side,
} from "./types";

function action(actionId: string): ActionDefinition {
  const definition = combatContent.actions[actionId];
  expect(definition, `${actionId} must exist`).toBeDefined();
  return definition!;
}

function build(characterId: string, side: Side, tier: ActionTier) {
  const definition = combatContent.characters[characterId]!;
  const standard = createStandardBuild(definition, side, 0);
  return {
    ...standard,
    actionTiers: Object.fromEntries(
      definition.actionIds.map((actionId) => [actionId, tier]),
    ),
  };
}

function duel(
  playerId: string,
  enemyId: string,
  playerTier: ActionTier = "stock",
  enemyTier: ActionTier = "stock",
  seed = 41,
): BattleState {
  return createBattle(
    {
      playerCharacterIds: [playerId],
      playerBuilds: [build(playerId, "player", playerTier)],
      enemyCharacterIds: [enemyId],
      enemyBuilds: [build(enemyId, "enemy", enemyTier)],
      playerStartingBar: 100,
      enemyStartingBar: 100,
      seed,
      difficulty: "normal",
    },
    combatContent,
  ).state;
}

function resolveMove(
  sourceState: BattleState,
  side: Side,
  actionId: string,
): { state: BattleState; events: BattleEvent[] } {
  let transition = requestAction(sourceState, side, actionId, combatContent);
  const events = [...transition.events];
  let state = transition.state;
  let guard = 0;
  while (state.pendingActions[side] && guard < 20) {
    transition = tickBattle(state, 250, combatContent);
    state = transition.state;
    events.push(...transition.events);
    guard += 1;
  }
  expect(state.pendingActions[side]).toBeUndefined();
  return { state, events };
}

describe("launch roster calibration", () => {
  it("locks every launch kit's authored Tier 1 and Tier 2 signature", () => {
    expect(
      actionTierProperties(action("action.tux.ping"), "platinum"),
    ).toMatchObject({
      additionalEffects: [{ kind: "bar", target: "allies", amount: 12 }],
    });
    expect(
      actionTierProperties(action("action.tux.root-access"), "platinum"),
    ).toMatchObject({
      additionalEffects: [
        { kind: "blockMove", slotIndex: 1, durationMs: 3_500 },
      ],
    });
    expect(
      actionTierProperties(action("action.tux.kernel-panic"), "platinum"),
    ).toMatchObject({
      additionalEffects: [{ kind: "barPercent", ratio: -0.12 }],
    });

    expect(
      actionTierProperties(
        action("action.humpty.egg-on-your-face"),
        "platinum",
      ),
    ).toMatchObject({ shieldEndHealPower: 12 });
    expect(
      actionTierProperties(action("action.humpty.shell-game"), "platinum"),
    ).toMatchObject({
      additionalEffects: [{ kind: "randomBoon" }],
    });
    expect(
      actionTierProperties(action("action.humpty.great-fall"), "platinum"),
    ).toMatchObject({
      reflectionStun: { chance: 1, durationMs: 700 },
    });

    expect(
      actionTierProperties(action("action.moses.staff-tap"), "gold"),
    ).toMatchObject({ instantChargeChance: 0.35 });
    expect(
      actionTierProperties(action("action.moses.staff-tap"), "platinum"),
    ).toMatchObject({ instantChargeChance: 0.55 });
    expect(
      actionTierProperties(action("action.moses.part-the-strip"), "platinum"),
    ).toMatchObject({
      additionalEffects: [{ kind: "stun", durationMs: 650 }],
    });
    expect(
      actionTierProperties(action("action.moses.safe-passage"), "platinum"),
    ).toMatchObject({
      additionalEffects: [
        { kind: "blockMove", slotIndex: "all", durationMs: 4_000 },
      ],
    });

    expect(
      actionTierProperties(action("action.viking.axe-first"), "platinum"),
    ).toMatchObject({ undodgeable: true });

    expect(
      actionTierProperties(action("action.ned-kelly.warning-shot"), "gold"),
    ).toMatchObject({ instantChargeChance: 0.35 });
    expect(
      actionTierProperties(action("action.ned-kelly.warning-shot"), "platinum"),
    ).toMatchObject({ instantChargeChance: 0.55 });
    expect(
      actionTierProperties(action("action.ned-kelly.iron-outlaw"), "platinum"),
    ).toMatchObject({
      additionalEffects: [{ kind: "heal", target: "allAllies", power: 8 }],
    });
    expect(
      actionTierProperties(action("action.ned-kelly.last-stand"), "platinum"),
    ).toMatchObject({
      additionalEffects: [
        { kind: "modifyAttack", target: "allAllies", magnitude: 0.18 },
      ],
    });

    const deathsShadow = action("action.grim-reaper.deaths-shadow");
    expect(deathsShadow.requiredFormId).toBe("form.grim-reaper.beast");
    expect(
      actionTierProperties(action("action.grim-reaper.cold-touch"), "platinum"),
    ).toMatchObject({ cost: 0 });
    expect(actionTierProperties(deathsShadow, "platinum")).toMatchObject({
      additionalEffects: [{ kind: "modifyAttack", magnitude: 0.1 }],
    });
    expect(
      actionTierProperties(
        action("action.grim-reaper.final-harvest"),
        "platinum",
      ),
    ).toMatchObject({
      additionalEffects: [
        { kind: "stun", target: "allEnemies", durationMs: 850 },
      ],
    });
  });

  it("gives Tux a non-lethal Health-for-Charge battery", () => {
    const state = duel("character.tux", "character.viking");
    state.player.bar = 18;
    const beforeHealth = state.player.squad[0]!.currentHealth;

    const resolved = resolveMove(state, "player", "action.tux.ping");

    expect(resolved.state.player.squad[0]!.currentHealth).toBe(
      beforeHealth - 14,
    );
    expect(resolved.state.player.bar).toBeGreaterThan(29);
  });

  it("lets Grim's upgraded form change be free and bounded", () => {
    const state = duel("character.grim-reaper", "character.viking", "gold");
    state.player.bar = 0;

    const resolved = resolveMove(
      state,
      "player",
      "action.grim-reaper.cold-touch",
    );
    const form = resolved.state.player.squad[0]!.statuses.find(
      (status) => status.kind === "form",
    );

    expect(resolved.events).not.toContainEqual(
      expect.objectContaining({ type: "commandRejected" }),
    );
    expect(form).toMatchObject({
      formId: "form.grim-reaper.beast",
      remainingMs: 30_000,
    });

    const refreshed = resolveMove(
      resolved.state,
      "player",
      "action.grim-reaper.cold-touch",
    );
    expect(
      refreshed.state.player.squad[0]!.statuses.filter(
        (status) =>
          status.actionId === "action.grim-reaper.cold-touch" &&
          (status.kind === "form" || status.kind === "defence"),
      ),
    ).toHaveLength(2);
  });

  it("heals Humpty when a Tier 1 shield expires", () => {
    let state = duel("character.humpty", "character.viking", "gold");
    const humpty = state.player.squad[0]!;
    humpty.currentHealth -= 30;
    state = resolveMove(
      state,
      "player",
      "action.humpty.egg-on-your-face",
    ).state;
    const beforeExpiry = state.player.squad[0]!.currentHealth;
    state.player.squad[0]!.statuses.find(
      (status) => status.kind === "shield",
    )!.remainingMs = 250;

    const expired = tickBattle(state, 250, combatContent);

    expect(expired.state.player.squad[0]!.currentHealth).toBeGreaterThan(
      beforeExpiry,
    );
    expect(expired.events).toContainEqual(
      expect.objectContaining({
        type: "healingApplied",
        actionId: "action.humpty.egg-on-your-face",
      }),
    );
  });

  it("keeps seeded surprise boons reproducible", () => {
    const first = resolveMove(
      duel("character.humpty", "character.viking", "gold", "stock", 92),
      "player",
      "action.humpty.shell-game",
    );
    const second = resolveMove(
      duel("character.humpty", "character.viking", "gold", "stock", 92),
      "player",
      "action.humpty.shell-game",
    );

    expect(second).toEqual(first);
  });

  it("lets Moses disable the complete opposing Move kit", () => {
    const resolved = resolveMove(
      duel("character.moses", "character.viking"),
      "player",
      "action.moses.safe-passage",
    );

    expect(resolved.state.enemy.statuses).toContainEqual(
      expect.objectContaining({ kind: "moveBlock", slotIndex: "all" }),
    );
    for (const actionId of resolved.state.enemy.squad[0]!.actionIds) {
      expect(
        requestAction(resolved.state, "enemy", actionId, combatContent).events,
      ).toContainEqual(expect.objectContaining({ type: "commandRejected" }));
    }
  });

  it("gives Ned team recovery and team acceleration", () => {
    const state = duel("character.ned-kelly", "character.viking", "platinum");
    state.player.squad[0]!.currentHealth -= 25;
    const healed = resolveMove(state, "player", "action.ned-kelly.iron-outlaw");
    expect(healed.state.player.squad[0]!.currentHealth).toBeGreaterThan(
      state.player.squad[0]!.currentHealth,
    );

    healed.state.player.bar = 100;
    const accelerated = resolveMove(
      healed.state,
      "player",
      "action.ned-kelly.last-stand",
    );
    expect(accelerated.state.player.statuses).toContainEqual(
      expect.objectContaining({ kind: "chargeRate", multiplier: 1.35 }),
    );
    expect(accelerated.state.player.squad[0]!.statuses).toContainEqual(
      expect.objectContaining({ kind: "attack" }),
    );
  });

  it("makes Tux's barrage multi-hit and percentage-based", () => {
    const state = duel("character.tux", "character.viking");
    state.enemy.bar = 80;
    state.enemy.squad[0]!.stats.evasion = 0;

    const resolved = resolveMove(state, "player", "action.tux.kernel-panic");
    const hits = resolved.events.filter(
      (event) =>
        event.type === "damageApplied" &&
        event.actionId === "action.tux.kernel-panic",
    );

    expect(hits).toHaveLength(3);
    expect(resolved.state.enemy.bar).toBeLessThan(70);
  });

  it("adds the Tier 2 reactive stun to Humpty's reflection", () => {
    let state = duel(
      "character.humpty",
      "character.ned-kelly",
      "platinum",
      "stock",
      17,
    );
    state = resolveMove(state, "player", "action.humpty.great-fall").state;
    const reflected = resolveMove(
      state,
      "enemy",
      "action.ned-kelly.warning-shot",
    );

    expect(reflected.events).toContainEqual(
      expect.objectContaining({
        type: "reactionTriggered",
        reactionKind: "reflection",
      }),
    );
    expect(reflected.state.enemy.squad[0]!.statuses).toContainEqual(
      expect.objectContaining({ kind: "stun" }),
    );
  });
});
