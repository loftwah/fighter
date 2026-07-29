import type {
  BattleCommand,
  BattleEvent,
  BattleOutcome,
  BattleState,
  Difficulty,
  Side,
  Transition,
} from "./types";

export interface BattleReportParticipant {
  side: Side;
  instanceId: string;
  characterId: string;
  level: number;
  actionIds: [string, string, string];
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

export interface BattleReport {
  schemaVersion: 1;
  mode: "story" | "tournament" | "quick";
  encounterId: string;
  seed: number;
  difficulty: Difficulty;
  difficultyChanges: BattleReportDifficultyChange[];
  participants: BattleReportParticipant[];
  decisions: BattleReportDecision[];
  events: BattleEvent[];
  outcome: BattleOutcome | null;
  elapsedMs: number;
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
    schemaVersion: 1,
    mode: context.mode,
    encounterId: context.encounterId,
    seed: state.seed,
    difficulty: state.difficulty,
    difficultyChanges: [],
    participants: (["player", "enemy"] as const).flatMap((side) =>
      state[side].squad.map((combatant) => ({
        side,
        instanceId: combatant.instanceId,
        characterId: combatant.characterId,
        level: combatant.level,
        actionIds: [...combatant.actionIds],
        equippedPatchId: combatant.equippedPatchId,
      })),
    ),
    decisions: [],
    events: structuredClone(events),
    outcome: null,
    elapsedMs: 0,
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

export function appendBattleTransition(
  report: BattleReport,
  transition: Transition,
): BattleReport {
  return {
    ...report,
    events: [...report.events, ...structuredClone(transition.events)],
    elapsedMs: transition.state.elapsedMs,
    outcome:
      transition.state.outcome === "active" ? null : transition.state.outcome,
  };
}
