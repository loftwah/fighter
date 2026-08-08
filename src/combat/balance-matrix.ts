import type {
  ActionDefinition,
  BattleEvent,
  BattleState,
  CombatantBuild,
  CombatContent,
  Side,
  StatBlock,
} from "./types";
import {
  chooseAiCommand,
  createBattle,
  forfeitBattle,
  requestAction,
  requestAccessory,
  requestPickup,
  requestSwitch,
  tickBattle,
} from "./engine";
import { createStandardBuild } from "./standard-build";

export type BalanceBuild = "standard" | "fullPower";
export type DamageBand = "small" | "middle" | "big";

export interface MoveBalanceMeasurement {
  actionId: string;
  characterId: string;
  build: BalanceBuild;
  band: DamageBand;
  meanDamage: number;
  meanHealthRatio: number;
  cleanMovesToVictory: number;
  minimumHealthRatio: number;
  maximumHealthRatio: number;
  directEventCount: number;
  periodicEventCount: number;
}

export interface RosterMatchupMeasurement {
  playerId: string;
  enemyId: string;
  build: BalanceBuild;
  seeds: readonly number[];
  outcomes: BattleState["outcome"][];
  durationsMs: number[];
  timeoutCount: number;
  playerMoveCounts: number[];
  enemyMoveCounts: number[];
  playerDamageEvents: number[];
  enemyDamageEvents: number[];
}

const FULL_POWER_LEVEL = 25;
const FULL_POWER_STATS: StatBlock = {
  health: 5,
  power: 5,
  evasion: 5,
  fortune: 5,
  tempo: 4,
};

function damageBand(action: ActionDefinition): DamageBand {
  if (action.position.startsWith("1")) return "small";
  if (action.position.startsWith("2")) return "middle";
  return "big";
}

function buildFor(
  content: CombatContent,
  characterId: string,
  side: Side,
  build: BalanceBuild,
): CombatantBuild {
  const character = content.characters[characterId];
  if (!character) throw new Error(`Unknown Character ${characterId}`);
  if (build === "standard") return createStandardBuild(character, side, 0);
  return {
    instanceId: `balance.${build}.${side}.${characterId}`,
    level: FULL_POWER_LEVEL,
    statBonuses: { ...FULL_POWER_STATS },
    actionIds: character.actionIds,
    actionTiers: Object.fromEntries(
      character.actionIds.map((actionId) => [actionId, "platinum"]),
    ),
    interruptionResistance: 0,
    equippedPatchId: null,
  };
}

function resolveActionAndPeriodic(
  state: BattleState,
  actionId: string,
  content: CombatContent,
): { state: BattleState; events: BattleEvent[] } {
  let transition = requestAction(state, "player", actionId, content);
  let next = transition.state;
  const events = [...transition.events];
  for (let guard = 0; guard < 80; guard += 1) {
    const pending = Boolean(next.pendingActions.player);
    const periodic = next.enemy.squad.some((combatant) =>
      combatant.statuses.some(
        (status) =>
          status.actionId === actionId && status.kind === "damageOverTime",
      ),
    );
    if (!pending && !periodic) break;
    transition = tickBattle(next, 250, content);
    next = transition.state;
    events.push(...transition.events);
  }
  return { state: next, events };
}

export function measureLaunchMoveBalance(
  content: CombatContent,
  build: BalanceBuild,
  seeds: readonly number[],
): MoveBalanceMeasurement[] {
  const measurements: MoveBalanceMeasurement[] = [];
  for (const character of Object.values(content.characters)) {
    for (const actionId of character.actionIds) {
      const action = content.actions[actionId];
      if (
        !action ||
        !action.effects.some(
          (effect) =>
            effect.kind === "damage" || effect.kind === "damageOverTime",
        )
      ) {
        continue;
      }
      const samples = seeds.map((seed) => {
        const created = createBattle(
          {
            playerCharacterIds: [character.id],
            playerBuilds: [buildFor(content, character.id, "player", build)],
            enemyCharacterIds: [character.id],
            enemyBuilds: [buildFor(content, character.id, "enemy", build)],
            playerStartingBar: 100,
            enemyStartingBar: 0,
            seed,
            difficulty: "normal",
          },
          content,
        ).state;
        created.player.squad[0]!.stats.fortune = 0;
        created.enemy.squad[0]!.stats.evasion = 0;
        const maximumHealth = created.enemy.squad[0]!.maxHealth;
        const resolved = resolveActionAndPeriodic(created, action.id, content);
        const damageEvents = resolved.events.filter(
          (event) =>
            event.type === "damageApplied" &&
            event.actionId === action.id &&
            event.targetId === created.enemy.squad[0]!.instanceId &&
            event.message !== "healthCost" &&
            !event.reactionKind,
        );
        const damage = damageEvents.reduce(
          (total, event) => total + (event.amount ?? 0),
          0,
        );
        return { damage, maximumHealth, damageEvents };
      });
      const meanDamage =
        samples.reduce((total, sample) => total + sample.damage, 0) /
        samples.length;
      const meanHealth =
        samples.reduce((total, sample) => total + sample.maximumHealth, 0) /
        samples.length;
      const ratios = samples.map(
        (sample) => sample.damage / sample.maximumHealth,
      );
      measurements.push({
        actionId: action.id,
        characterId: character.id,
        build,
        band: damageBand(action),
        meanDamage,
        meanHealthRatio: meanDamage / meanHealth,
        cleanMovesToVictory:
          meanDamage > 0 ? Math.ceil(meanHealth / meanDamage) : Infinity,
        minimumHealthRatio: Math.min(...ratios),
        maximumHealthRatio: Math.max(...ratios),
        directEventCount: samples[0]!.damageEvents.filter(
          (event) => !event.periodic,
        ).length,
        periodicEventCount: samples[0]!.damageEvents.filter(
          (event) => event.periodic,
        ).length,
      });
    }
  }
  return measurements;
}

function applyAiCommand(
  state: BattleState,
  side: Side,
  content: CombatContent,
): { state: BattleState; events: BattleEvent[] } {
  const command = chooseAiCommand(state, content, side);
  if (!command) return { state, events: [] };
  switch (command.kind) {
    case "action":
      return requestAction(state, side, command.actionId, content);
    case "switch":
      return requestSwitch(state, side, command.targetIndex);
    case "accessory":
      return requestAccessory(state, side, content);
    case "pickup":
      return requestPickup(state, side, command.pickupId);
    case "forfeit":
      return forfeitBattle(state, side);
  }
}

export function measureRosterMatchups(
  content: CombatContent,
  build: BalanceBuild,
  seeds: readonly number[],
): RosterMatchupMeasurement[] {
  const characterIds = Object.keys(content.characters);
  return characterIds.flatMap((playerId) =>
    characterIds.map((enemyId) => {
      const runs = seeds.map((seed) => {
        let state = createBattle(
          {
            playerCharacterIds: [playerId],
            playerBuilds: [buildFor(content, playerId, "player", build)],
            enemyCharacterIds: [enemyId],
            enemyBuilds: [buildFor(content, enemyId, "enemy", build)],
            seed,
            difficulty: "normal",
            timeLimitMs: 120_000,
          },
          content,
        ).state;
        const events: BattleEvent[] = [];
        while (state.outcome === "active") {
          for (const side of ["player", "enemy"] as const) {
            const transition = applyAiCommand(state, side, content);
            state = transition.state;
            events.push(...transition.events);
          }
          const transition = tickBattle(state, 250, content);
          state = transition.state;
          events.push(...transition.events);
        }
        const moveCount = (side: Side) =>
          events.filter(
            (event) => event.type === "actionStarted" && event.side === side,
          ).length;
        const damageEventCount = (side: Side) =>
          events.filter(
            (event) =>
              event.type === "damageApplied" &&
              event.side === side &&
              event.message !== "healthCost" &&
              !event.reactionKind,
          ).length;
        return {
          state,
          playerMoveCount: moveCount("player"),
          enemyMoveCount: moveCount("enemy"),
          playerDamageEvents: damageEventCount("player"),
          enemyDamageEvents: damageEventCount("enemy"),
        };
      });
      return {
        playerId,
        enemyId,
        build,
        seeds,
        outcomes: runs.map((run) => run.state.outcome),
        durationsMs: runs.map((run) => run.state.elapsedMs),
        timeoutCount: runs.filter(
          (run) => run.state.elapsedMs >= run.state.timeLimitMs,
        ).length,
        playerMoveCounts: runs.map((run) => run.playerMoveCount),
        enemyMoveCounts: runs.map((run) => run.enemyMoveCount),
        playerDamageEvents: runs.map((run) => run.playerDamageEvents),
        enemyDamageEvents: runs.map((run) => run.enemyDamageEvents),
      };
    }),
  );
}
