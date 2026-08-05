import {
  chooseAiCommand,
  createBattle,
  requestAccessory,
  requestAction,
  requestPickup,
  requestSwitch,
  tickBattle,
} from "../combat/engine";
import {
  appendBattleTick,
  appendBattleTransition,
  createBattleReport,
  recordBattleDecision,
  type BattleReport,
} from "../combat/report";
import { actionCostForCombatant, difficultyAiDelay } from "../combat/rules";
import { createStandardBuild } from "../combat/standard-build";
import type {
  BattleCommand,
  BattleState,
  Side,
  Transition,
} from "../combat/types";
import { combatContent, quickFightDefaults } from "../content/initial-content";
import {
  BATTLE_COUNTDOWN,
  battlePresentationDuration,
} from "../game/presentation-timing";

export interface V2AcceptanceMetrics {
  report: BattleReport;
  outcome: BattleState["outcome"];
  simulationDurationMs: number;
  estimatedPlayableDurationMs: number;
  firstPlayerDecisionMs: number | null;
  playerActionIds: string[];
  playerHealthRatio: number;
}

export interface V2AcceptanceOptions {
  playerDecisionDelayMs?: number;
}

const playerPlan = [
  "action.viking.shield-bash",
  "action.viking.axe-first",
  "action.viking.shield-bash",
  "action.viking.berserker-oath",
] as const;

function applyCommand(
  state: BattleState,
  side: Side,
  command: BattleCommand,
): Transition {
  switch (command.kind) {
    case "action":
      return requestAction(state, side, command.actionId, combatContent);
    case "switch":
      return requestSwitch(state, side, command.targetIndex);
    case "accessory":
      return requestAccessory(state, side, combatContent);
    case "pickup":
      return requestPickup(state, side, command.pickupId);
    case "forfeit":
      throw new Error("The V2 acceptance strategy never forfeits");
  }
}

function commandAccepted(transition: Transition): boolean {
  return !transition.events.some((event) => event.type === "commandRejected");
}

function playerCommand(
  state: BattleState,
  planIndex: number,
): BattleCommand | null {
  const pickup = state.pickups.find((candidate) => candidate.side === "player");
  if (pickup) return { kind: "pickup", pickupId: pickup.id };
  if (state.player.accessory?.charge === 100) return { kind: "accessory" };
  if (state.pendingActions.player) return null;

  const active = state.player.squad[state.player.activeIndex];
  if (!active) return null;
  const planned = playerPlan[planIndex];
  const actionId =
    planned ??
    (active.statuses.some((status) => status.kind === "empower")
      ? "action.viking.axe-first"
      : "action.viking.shield-bash");
  const action = combatContent.actions[actionId];
  if (!action) return null;
  const cost = actionCostForCombatant(active, action);
  return state.player.bar >= cost ? { kind: "action", actionId } : null;
}

export function runV2VikingAcceptanceFight(
  options: V2AcceptanceOptions = {},
): V2AcceptanceMetrics {
  const playerDecisionDelayMs = Math.max(
    0,
    Math.round(options.playerDecisionDelayMs ?? 0),
  );
  const created = createBattle(
    {
      playerCharacterIds: [...quickFightDefaults.playerIds],
      playerBuilds: quickFightDefaults.playerIds.map((characterId, index) =>
        createStandardBuild(
          combatContent.characters[characterId]!,
          "player",
          index,
        ),
      ),
      enemyCharacterIds: [...quickFightDefaults.enemyIds],
      enemyBuilds: quickFightDefaults.enemyIds.map((characterId, index) =>
        createStandardBuild(
          combatContent.characters[characterId]!,
          "enemy",
          index,
        ),
      ),
      playerAccessoryId: quickFightDefaults.playerAccessoryId,
      enemyAccessoryId: quickFightDefaults.enemyAccessoryId,
      seed: quickFightDefaults.seed,
      difficulty: "normal",
      timeLimitMs: 90_000,
    },
    combatContent,
  );
  let state = created.state;
  let report = createBattleReport(state, created.events, {
    mode: "quick",
    encounterId: "v2.viking-acceptance",
  });
  let presentationDurationMs = 0;
  let planIndex = 0;
  let firstPlayerDecisionMs: number | null = null;
  let nextAiDecisionMs = difficultyAiDelay("normal");
  let pendingPlayerCommandKey: string | null = null;
  let pendingPlayerCommandSinceMs = 0;

  const recordCommand = (side: Side, command: BattleCommand): boolean => {
    const transition = applyCommand(state, side, command);
    if (!commandAccepted(transition)) return false;
    report = recordBattleDecision(report, state, side, command);
    state = transition.state;
    report = appendBattleTransition(report, transition);
    const hold = battlePresentationDuration(transition.events);
    presentationDurationMs += hold;
    if (hold > 0) {
      nextAiDecisionMs = state.elapsedMs + difficultyAiDelay(state.difficulty);
    }
    return true;
  };

  while (state.outcome === "active") {
    const transition = tickBattle(state, 100, combatContent);
    state = transition.state;
    report = appendBattleTick(report, 100, transition);
    const hold = battlePresentationDuration(transition.events);
    presentationDurationMs += hold;
    if (hold > 0) {
      nextAiDecisionMs = state.elapsedMs + difficultyAiDelay(state.difficulty);
    }
    if (state.outcome !== "active") break;

    const nextPlayerCommand = playerCommand(state, planIndex);
    const nextPlayerCommandKey = nextPlayerCommand
      ? JSON.stringify(nextPlayerCommand)
      : null;
    if (nextPlayerCommandKey !== pendingPlayerCommandKey) {
      pendingPlayerCommandKey = nextPlayerCommandKey;
      pendingPlayerCommandSinceMs = state.elapsedMs;
    }
    const playerCommandReady =
      nextPlayerCommand &&
      state.elapsedMs - pendingPlayerCommandSinceMs >= playerDecisionDelayMs;
    if (playerCommandReady && recordCommand("player", nextPlayerCommand)) {
      if (firstPlayerDecisionMs === null) {
        firstPlayerDecisionMs = state.elapsedMs;
      }
      if (
        nextPlayerCommand.kind === "action" &&
        planIndex < playerPlan.length
      ) {
        planIndex += 1;
      }
      pendingPlayerCommandKey = null;
      pendingPlayerCommandSinceMs = state.elapsedMs;
    }

    if (state.elapsedMs >= nextAiDecisionMs && state.outcome === "active") {
      nextAiDecisionMs = state.elapsedMs + difficultyAiDelay(state.difficulty);
      const command = chooseAiCommand(state, combatContent);
      if (command) recordCommand("enemy", command);
    }
  }

  const player = state.player.squad[state.player.activeIndex]!;
  return {
    report,
    outcome: state.outcome,
    simulationDurationMs: state.elapsedMs,
    estimatedPlayableDurationMs:
      BATTLE_COUNTDOWN.reduce((total, beat) => total + beat.durationMs, 0) +
      state.elapsedMs +
      presentationDurationMs,
    firstPlayerDecisionMs,
    playerActionIds: report.decisions.flatMap((decision) =>
      decision.side === "player" && decision.command.kind === "action"
        ? [decision.command.actionId]
        : [],
    ),
    playerHealthRatio: player.currentHealth / player.maxHealth,
  };
}
