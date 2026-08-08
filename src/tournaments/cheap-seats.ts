import type { BattleState } from "../combat/types";
import type {
  TournamentCaseBuild,
  TournamentRunData,
} from "../persistence/save";
import {
  tournamentDefinition,
  type TournamentRoundDefinition,
} from "./catalog";
import {
  TOURNAMENT_ROSTER_MAX,
  captureTournamentOpponentHealth,
  captureTournamentRosterHealth,
  createTournamentRun,
  exhaustTournamentAccessory,
  exhaustTournamentAccessoriesFromEvents,
  lockTournamentRoster,
  normaliseTournamentRun,
  recordTournamentBattleResult,
  resolveTournamentInterlude,
  selectTournamentDeployment,
} from "./runner";

export type CheapSeatsDrop = "front-print-repair" | "case-repair" | "hot-start";
export { TOURNAMENT_ROSTER_MAX } from "./runner";
export type CheapSeatsEncounter = TournamentRoundDefinition;

export const cheapSeatsPlayerIds = [
  "character.viking",
  "character.tux",
  "character.moses",
  "character.ned-kelly",
  "character.humpty",
  "character.grim-reaper",
] as const;

const cheapSeatsDefinition = tournamentDefinition("tournament.cheap-seats");
export const cheapSeatsEncounters = cheapSeatsDefinition.rounds;

export function createCheapSeatsRun(
  caseBuilds: TournamentCaseBuild[] = [],
  origin: "story" | "standalone" = "standalone",
  deployedInstanceIds: string[] = caseBuilds
    .slice(0, 3)
    .map((build) => build.instanceId),
): TournamentRunData {
  if (caseBuilds.length > TOURNAMENT_ROSTER_MAX) {
    throw new Error(
      `A Tournament Roster accepts at most ${TOURNAMENT_ROSTER_MAX} Characters`,
    );
  }
  return createTournamentRun({
    definition: cheapSeatsDefinition,
    roster: caseBuilds,
    origin,
    deployedInstanceIds,
    allowEmptyRoster: true,
  });
}

export { exhaustTournamentAccessory, exhaustTournamentAccessoriesFromEvents };

export function normaliseCheapSeatsRun(
  sourceRun: TournamentRunData,
): TournamentRunData {
  return normaliseTournamentRun(sourceRun);
}

export function selectCheapSeatsDeployment(
  sourceRun: TournamentRunData,
  deployedInstanceIds: string[],
  activeInstanceId: string | null,
): TournamentRunData {
  return selectTournamentDeployment(
    sourceRun,
    deployedInstanceIds,
    activeInstanceId,
  );
}

export function lockCheapSeatsCase(
  sourceRun: TournamentRunData,
  caseBuilds: TournamentCaseBuild[],
): TournamentRunData {
  if (sourceRun.caseBuilds.length > 0) {
    return normaliseTournamentRun(sourceRun);
  }
  const run = structuredClone(sourceRun);
  for (const [index, build] of caseBuilds.entries()) {
    const legacyLoanerId = `loaner.${index}.${build.characterId}`;
    if (
      run.healthRatios[build.instanceId] === undefined &&
      run.healthRatios[legacyLoanerId] !== undefined
    ) {
      run.healthRatios[build.instanceId] = run.healthRatios[legacyLoanerId]!;
    }
    if (run.activeInstanceId === legacyLoanerId) {
      run.activeInstanceId = build.instanceId;
    }
    delete run.healthRatios[legacyLoanerId];
  }
  return lockTournamentRoster(run, caseBuilds);
}

export function cheapSeatsEncounter(roundIndex: number): CheapSeatsEncounter {
  return (
    cheapSeatsEncounters[roundIndex] ??
    cheapSeatsEncounters[cheapSeatsEncounters.length - 1]!
  );
}

export const captureCaseHealth = captureTournamentRosterHealth;
export const captureOpponentHealth = captureTournamentOpponentHealth;

export function restoreCaseHealth(
  sourceState: BattleState,
  run: TournamentRunData,
): BattleState {
  const state = structuredClone(sourceState);
  for (const combatant of state.player.squad) {
    const ratio = run.healthRatios[combatant.instanceId];
    if (ratio !== undefined) {
      combatant.currentHealth = Math.round(combatant.maxHealth * ratio);
    }
  }
  for (const combatant of state.enemy.squad) {
    const ratio = run.opponentHealthRatios[combatant.instanceId];
    if (ratio !== undefined) {
      combatant.currentHealth = Math.round(combatant.maxHealth * ratio);
    }
  }
  const savedActive = state.player.squad.findIndex(
    (combatant) =>
      combatant.instanceId === run.activeInstanceId &&
      combatant.currentHealth > 0,
  );
  const firstLiving = state.player.squad.findIndex(
    (combatant) => combatant.currentHealth > 0,
  );
  if (savedActive >= 0) state.player.activeIndex = savedActive;
  else if (firstLiving >= 0) state.player.activeIndex = firstLiving;
  return state;
}

export function recordCheapSeatsVictory(
  run: TournamentRunData,
  state: BattleState,
):
  | { complete: true; healthRatios: Record<string, number> }
  | { complete: false; run: TournamentRunData } {
  const currentFightId = `round-${run.roundIndex + 1}`;
  const compatibleRun =
    run.currentNodeId === currentFightId
      ? run
      : { ...run, currentNodeId: currentFightId };
  const result = recordTournamentBattleResult(
    cheapSeatsDefinition,
    compatibleRun,
    state,
    true,
  );
  return result.status === "complete"
    ? { complete: true, healthRatios: result.healthRatios }
    : result.status === "continue"
      ? { complete: false, run: result.run }
      : { complete: true, healthRatios: { ...run.healthRatios } };
}

export function recordCheapSeatsResult(
  run: TournamentRunData,
  state: BattleState,
  won: boolean,
):
  | { status: "lost"; run: null }
  | { status: "redeploy"; run: TournamentRunData }
  | { status: "complete"; healthRatios: Record<string, number> }
  | { status: "continue"; run: TournamentRunData } {
  const currentFightId = `round-${run.roundIndex + 1}`;
  const compatibleRun =
    run.currentNodeId === currentFightId
      ? run
      : { ...run, currentNodeId: currentFightId };
  const result = recordTournamentBattleResult(
    cheapSeatsDefinition,
    compatibleRun,
    state,
    won,
  );
  if (result.status === "lost" || result.status === "forfeited") {
    return { status: "lost", run: null };
  }
  if (result.status === "complete") {
    return { status: "complete", healthRatios: result.healthRatios };
  }
  return result;
}

export function applyCheapSeatsDrop(
  run: TournamentRunData,
  drop: CheapSeatsDrop,
): TournamentRunData {
  const expectedInterludeId = `recovery-${Math.max(1, run.roundIndex)}`;
  const compatibleRun =
    run.phase === "interlude" && run.currentNodeId.startsWith("round-")
      ? { ...run, currentNodeId: expectedInterludeId }
      : run;
  return resolveTournamentInterlude(cheapSeatsDefinition, compatibleRun, drop);
}
