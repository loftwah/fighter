import type {
  ActionPosition,
  ActionTier,
  BattleCommand,
  BattleEvent,
  BattleOutcome,
  BattleState,
  Difficulty,
  Side,
  StatBlock,
  Transition,
} from "./types";

export interface BattleReportParticipant {
  side: Side;
  instanceId: string;
  characterId: string;
  level: number;
  actionIds: [string, string, string];
  actionPositions: Partial<Record<string, ActionPosition>>;
  actionTiers: Record<string, ActionTier>;
  stats: StatBlock;
  equippedPatchId: string | null;
}

export interface BattleReportDecision {
  sequence: number;
  elapsedMs: number;
  side: Side;
  sourceInstanceId: string;
  command: BattleCommand;
}

export interface BattleReportDifficultyChange {
  elapsedMs: number;
  from: Difficulty;
  to: Difficulty;
}

export interface BattleReportTick {
  sequence: number;
  elapsedMs: number;
  deltaMs: number;
}

export interface BattleReportDebugAction {
  elapsedMs: number;
  action: "addCharge" | "step" | "pause" | "resume" | "copyState";
  side?: Side;
  amount?: number;
}

export interface BattleReport {
  schemaVersion: 2;
  mode: "story" | "tournament" | "quick" | "dev";
  encounterId: string;
  seed: number;
  difficulty: Difficulty;
  difficultyChanges: BattleReportDifficultyChange[];
  ticks: BattleReportTick[];
  participants: BattleReportParticipant[];
  decisions: BattleReportDecision[];
  debugActions: BattleReportDebugAction[];
  events: BattleEvent[];
  outcome: BattleOutcome | null;
  elapsedMs: number;
  initialState: BattleState;
}

export function createBattleReport(
  state: BattleState,
  events: BattleEvent[],
  context: {
    mode: BattleReport["mode"];
    encounterId: string;
  },
): BattleReport {
  return {
    schemaVersion: 2,
    mode: context.mode,
    encounterId: context.encounterId,
    seed: state.seed,
    difficulty: state.difficulty,
    difficultyChanges: [],
    ticks: [],
    participants: (["player", "enemy"] as const).flatMap((side) =>
      state[side].squad.map((combatant) => ({
        side,
        instanceId: combatant.instanceId,
        characterId: combatant.characterId,
        level: combatant.level,
        actionIds: [...combatant.actionIds],
        actionPositions: { ...combatant.actionPositions },
        actionTiers: { ...combatant.actionTiers },
        stats: { ...combatant.stats },
        equippedPatchId: combatant.equippedPatchId,
      })),
    ),
    decisions: [],
    debugActions: [],
    events: structuredClone(events),
    outcome: null,
    elapsedMs: 0,
    initialState: structuredClone(state),
  };
}

export function recordBattleDifficultyChange(
  report: BattleReport,
  state: BattleState,
  difficulty: Difficulty,
): BattleReport {
  if (state.difficulty === difficulty) {
    return report;
  }
  return {
    ...report,
    difficultyChanges: [
      ...report.difficultyChanges,
      {
        elapsedMs: state.elapsedMs,
        from: state.difficulty,
        to: difficulty,
      },
    ],
  };
}

export function recordBattleDecision(
  report: BattleReport,
  state: BattleState,
  side: Side,
  command: BattleCommand,
): BattleReport {
  const source = state[side].squad[state[side].activeIndex];
  if (!source) {
    return report;
  }
  return {
    ...report,
    decisions: [
      ...report.decisions,
      {
        sequence: report.decisions.length + 1,
        elapsedMs: state.elapsedMs,
        side,
        sourceInstanceId: source.instanceId,
        command: structuredClone(command),
      },
    ],
  };
}

export function recordBattleDebugAction(
  report: BattleReport,
  state: BattleState,
  action: Omit<BattleReportDebugAction, "elapsedMs">,
): BattleReport {
  return {
    ...report,
    debugActions: [
      ...report.debugActions,
      { ...structuredClone(action), elapsedMs: state.elapsedMs },
    ],
  };
}

export function appendBattleTick(
  report: BattleReport,
  deltaMs: number,
  transition: Transition,
): BattleReport {
  return appendBattleTransition(
    {
      ...report,
      ticks: [
        ...report.ticks,
        {
          sequence: report.ticks.length + 1,
          elapsedMs: report.elapsedMs,
          deltaMs,
        },
      ],
    },
    transition,
  );
}

export function appendBattleTransition(
  report: BattleReport,
  transition: Transition,
): BattleReport {
  return {
    ...report,
    events:
      transition.events.length > 0
        ? [...report.events, ...structuredClone(transition.events)]
        : report.events,
    elapsedMs: transition.state.elapsedMs,
    outcome:
      transition.state.outcome === "active" ? null : transition.state.outcome,
  };
}
