import {
  forfeitBattle,
  requestAction,
  requestAccessory,
  requestPickup,
  requestSwitch,
  tickBattle,
} from "./engine";
import type { BattleReport, BattleReportDecision } from "./report";
import type {
  BattleEvent,
  BattleState,
  CombatContent,
  Transition,
} from "./types";

export interface BattleReplayResult {
  state: BattleState;
  events: BattleEvent[];
}

function applyDecision(
  state: BattleState,
  decision: BattleReportDecision,
  content: CombatContent,
): Transition {
  switch (decision.command.kind) {
    case "action":
      return requestAction(
        state,
        decision.side,
        decision.command.actionId,
        content,
      );
    case "switch":
      return requestSwitch(state, decision.side, decision.command.targetIndex);
    case "accessory":
      return requestAccessory(state, decision.side, content);
    case "pickup":
      return requestPickup(state, decision.side, decision.command.pickupId);
    case "forfeit":
      return forfeitBattle(state, decision.side);
  }
}

function advanceTo(
  sourceState: BattleState,
  targetElapsedMs: number,
  content: CombatContent,
  ticks: BattleReport["ticks"],
  startingTickIndex: number,
): BattleReplayResult & { tickIndex: number } {
  let state = sourceState;
  const events: BattleEvent[] = [];
  let tickIndex = startingTickIndex;
  while (state.elapsedMs < targetElapsedMs && state.outcome === "active") {
    const tick = ticks[tickIndex];
    if (!tick) {
      throw new Error(
        `Replay is missing a simulation tick before ${targetElapsedMs} ms`,
      );
    }
    if (Math.abs(tick.elapsedMs - state.elapsedMs) > 0.001) {
      throw new Error(
        `Replay tick ${tick.sequence} starts at ${tick.elapsedMs} ms, expected ${state.elapsedMs} ms`,
      );
    }
    const transition = tickBattle(state, tick.deltaMs, content);
    state = transition.state;
    events.push(...transition.events);
    tickIndex += 1;
    if (state.elapsedMs > targetElapsedMs + 0.001) {
      throw new Error(
        `Replay tick ${tick.sequence} crossed decision boundary ${targetElapsedMs} ms`,
      );
    }
  }
  return { state, events, tickIndex };
}

export function replayBattleReport(
  report: BattleReport,
  content: CombatContent,
): BattleReplayResult {
  if (report.debugActions.some((action) => action.action === "addCharge")) {
    throw new Error(
      "Development reports with direct state edits are not replayable",
    );
  }

  let state = structuredClone(report.initialState);
  const events: BattleEvent[] = [
    ...report.events.filter((event) => event.type === "battleStarted"),
  ];
  const difficultyChanges = [...report.difficultyChanges].sort(
    (left, right) => left.elapsedMs - right.elapsedMs,
  );
  const decisions = [...report.decisions].sort(
    (left, right) =>
      left.elapsedMs - right.elapsedMs || left.sequence - right.sequence,
  );
  let difficultyIndex = 0;
  let tickIndex = 0;

  for (const decision of decisions) {
    while (
      difficultyChanges[difficultyIndex] &&
      difficultyChanges[difficultyIndex]!.elapsedMs <= decision.elapsedMs
    ) {
      const change = difficultyChanges[difficultyIndex]!;
      const advanced = advanceTo(
        state,
        change.elapsedMs,
        content,
        report.ticks,
        tickIndex,
      );
      state = advanced.state;
      events.push(...advanced.events);
      tickIndex = advanced.tickIndex;
      state = { ...state, difficulty: change.to };
      difficultyIndex += 1;
    }
    const advanced = advanceTo(
      state,
      decision.elapsedMs,
      content,
      report.ticks,
      tickIndex,
    );
    state = advanced.state;
    events.push(...advanced.events);
    tickIndex = advanced.tickIndex;
    const transition = applyDecision(state, decision, content);
    state = transition.state;
    events.push(...transition.events);
  }

  while (difficultyChanges[difficultyIndex]) {
    const change = difficultyChanges[difficultyIndex]!;
    const advanced = advanceTo(
      state,
      change.elapsedMs,
      content,
      report.ticks,
      tickIndex,
    );
    state = advanced.state;
    events.push(...advanced.events);
    tickIndex = advanced.tickIndex;
    state = { ...state, difficulty: change.to };
    difficultyIndex += 1;
  }

  const advanced = advanceTo(
    state,
    report.elapsedMs,
    content,
    report.ticks,
    tickIndex,
  );
  return {
    state: advanced.state,
    events: [...events, ...advanced.events],
  };
}
