import type { BattleState } from "../combat/types";

// Tournament orchestration remains separate from the shared combat engine.
import type {
  TournamentCaseBuild,
  TournamentRunData,
} from "../persistence/save";

export type CheapSeatsDrop = "front-print-repair" | "case-repair" | "hot-start";
export const TOURNAMENT_ROSTER_MAX = 6;

export interface CheapSeatsEncounter {
  roundIndex: 0 | 1 | 2;
  title: string;
  subtitle: string;
  enemyCharacterIds: string[];
  seed: number;
}

export const cheapSeatsPlayerIds = [
  "character.viking",
  "character.tux",
  "character.moses",
  "character.ned-kelly",
  "character.humpty",
  "character.grim-reaper",
] as const;

export const cheapSeatsEncounters: CheapSeatsEncounter[] = [
  {
    roundIndex: 0,
    title: "Miracle Warm-Up",
    subtitle: "Moses has read the rules and found several omissions.",
    enemyCharacterIds: ["character.moses"],
    seed: 20_260_906,
  },
  {
    roundIndex: 1,
    title: "Shell and Scythe",
    subtitle: "The nursery-rhyme egg has partnered with Death.",
    enemyCharacterIds: ["character.humpty", "character.grim-reaper"],
    seed: 20_260_907,
  },
  {
    roundIndex: 2,
    title: "The Wrong Door Final",
    subtitle: "Ned Kelly brought armour. Death brought a prior appointment.",
    enemyCharacterIds: ["character.ned-kelly", "character.grim-reaper"],
    seed: 20_260_908,
  },
];

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
  return normaliseCheapSeatsRun({
    tournamentId: "tournament.cheap-seats",
    origin,
    roundIndex: 0,
    phase: "ready",
    caseBuilds: structuredClone(caseBuilds),
    deployedInstanceIds: [...deployedInstanceIds],
    healthRatios: Object.fromEntries(
      caseBuilds.map((build) => [build.instanceId, 1]),
    ),
    activeInstanceId: deployedInstanceIds[0] ?? null,
    nextRoundChargeBonus: 0,
    selectedDrop: null,
  });
}

export function normaliseCheapSeatsRun(
  sourceRun: TournamentRunData,
): TournamentRunData {
  const run = structuredClone(sourceRun);
  run.caseBuilds = Array.from(
    new Map(
      run.caseBuilds.map((build) => [build.instanceId, build] as const),
    ).values(),
  ).slice(0, TOURNAMENT_ROSTER_MAX);
  if (run.caseBuilds.length === 0) {
    return run;
  }
  const rosterIds = new Set(run.caseBuilds.map((build) => build.instanceId));
  for (const instanceId of Object.keys(run.healthRatios)) {
    if (!rosterIds.has(instanceId)) {
      delete run.healthRatios[instanceId];
    }
  }
  for (const build of run.caseBuilds) {
    run.healthRatios[build.instanceId] ??= 1;
  }
  const livingIds = run.caseBuilds
    .filter((build) => (run.healthRatios[build.instanceId] ?? 1) > 0)
    .map((build) => build.instanceId);
  const livingIdSet = new Set(livingIds);
  run.deployedInstanceIds = Array.from(
    new Set(
      run.deployedInstanceIds.filter(
        (instanceId) =>
          rosterIds.has(instanceId) && livingIdSet.has(instanceId),
      ),
    ),
  ).slice(0, 3);
  if (run.deployedInstanceIds.length === 0) {
    run.deployedInstanceIds = livingIds.slice(0, 3);
  }
  if (
    !run.activeInstanceId ||
    !run.deployedInstanceIds.includes(run.activeInstanceId)
  ) {
    run.activeInstanceId = run.deployedInstanceIds[0] ?? null;
  }
  return run;
}

export function selectCheapSeatsDeployment(
  sourceRun: TournamentRunData,
  deployedInstanceIds: string[],
  activeInstanceId: string | null,
): TournamentRunData {
  if (sourceRun.phase !== "ready") {
    return sourceRun;
  }
  const livingIds = new Set(
    sourceRun.caseBuilds
      .filter((build) => (sourceRun.healthRatios[build.instanceId] ?? 1) > 0)
      .map((build) => build.instanceId),
  );
  const deployment = Array.from(
    new Set(
      deployedInstanceIds.filter((instanceId) => livingIds.has(instanceId)),
    ),
  ).slice(0, 3);
  if (deployment.length === 0) {
    throw new Error("Deploy at least one living Tournament Character");
  }
  return {
    ...sourceRun,
    deployedInstanceIds: deployment,
    activeInstanceId:
      activeInstanceId && deployment.includes(activeInstanceId)
        ? activeInstanceId
        : deployment[0]!,
  };
}

export function lockCheapSeatsCase(
  sourceRun: TournamentRunData,
  caseBuilds: TournamentCaseBuild[],
): TournamentRunData {
  if (sourceRun.caseBuilds.length > 0) {
    return normaliseCheapSeatsRun(sourceRun);
  }
  if (caseBuilds.length > TOURNAMENT_ROSTER_MAX) {
    throw new Error(
      `A Tournament Roster accepts at most ${TOURNAMENT_ROSTER_MAX} Characters`,
    );
  }
  const run = structuredClone(sourceRun);
  run.caseBuilds = structuredClone(caseBuilds);
  for (const [index, build] of caseBuilds.entries()) {
    const legacyLoanerId = `loaner.${index}.${build.characterId}`;
    const legacyRatio = run.healthRatios[legacyLoanerId];
    if (
      run.healthRatios[build.instanceId] === undefined &&
      legacyRatio !== undefined
    ) {
      run.healthRatios[build.instanceId] = legacyRatio;
    }
    if (run.activeInstanceId === legacyLoanerId) {
      run.activeInstanceId = build.instanceId;
    }
    if (legacyLoanerId !== build.instanceId) {
      delete run.healthRatios[legacyLoanerId];
    }
  }
  const lockedInstanceIds = new Set(
    run.caseBuilds.map((build) => build.instanceId),
  );
  for (const instanceId of Object.keys(run.healthRatios)) {
    if (!lockedInstanceIds.has(instanceId)) {
      delete run.healthRatios[instanceId];
    }
  }
  const activeRatio = run.activeInstanceId
    ? run.healthRatios[run.activeInstanceId]
    : undefined;
  if (
    !run.activeInstanceId ||
    !lockedInstanceIds.has(run.activeInstanceId) ||
    activeRatio === 0
  ) {
    run.activeInstanceId =
      run.caseBuilds.find(
        (build) => (run.healthRatios[build.instanceId] ?? 1) > 0,
      )?.instanceId ?? null;
  }
  return normaliseCheapSeatsRun(run);
}

export function cheapSeatsEncounter(roundIndex: number): CheapSeatsEncounter {
  return (
    cheapSeatsEncounters[roundIndex] ??
    cheapSeatsEncounters[cheapSeatsEncounters.length - 1]!
  );
}

export function captureCaseHealth(state: BattleState): Record<string, number> {
  return Object.fromEntries(
    state.player.squad.map((combatant) => [
      combatant.instanceId,
      Math.max(0, Math.min(1, combatant.currentHealth / combatant.maxHealth)),
    ]),
  );
}

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
  const savedActive = state.player.squad.findIndex(
    (combatant) =>
      combatant.instanceId === run.activeInstanceId &&
      combatant.currentHealth > 0,
  );
  if (savedActive >= 0) {
    state.player.activeIndex = savedActive;
  } else {
    const firstLiving = state.player.squad.findIndex(
      (combatant) => combatant.currentHealth > 0,
    );
    if (firstLiving >= 0) {
      state.player.activeIndex = firstLiving;
    }
  }
  return state;
}

export function recordCheapSeatsVictory(
  run: TournamentRunData,
  state: BattleState,
):
  | { complete: true; healthRatios: Record<string, number> }
  | { complete: false; run: TournamentRunData } {
  const healthRatios = {
    ...run.healthRatios,
    ...captureCaseHealth(state),
  };
  const activeInstanceId =
    state.player.squad[state.player.activeIndex]?.instanceId ?? null;
  if (run.roundIndex >= cheapSeatsEncounters.length - 1) {
    return { complete: true, healthRatios };
  }
  return {
    complete: false,
    run: normaliseCheapSeatsRun({
      ...run,
      roundIndex: (run.roundIndex + 1) as 1 | 2,
      phase: "interlude",
      healthRatios,
      activeInstanceId,
      nextRoundChargeBonus: 0,
      selectedDrop: null,
    }),
  };
}

export function recordCheapSeatsResult(
  run: TournamentRunData,
  state: BattleState,
  won: boolean,
):
  | { status: "lost"; run: null }
  | { status: "complete"; healthRatios: Record<string, number> }
  | { status: "continue"; run: TournamentRunData } {
  if (!won) {
    return { status: "lost", run: null };
  }
  const victory = recordCheapSeatsVictory(run, state);
  return victory.complete
    ? { status: "complete", healthRatios: victory.healthRatios }
    : { status: "continue", run: victory.run };
}

export function applyCheapSeatsDrop(
  run: TournamentRunData,
  drop: CheapSeatsDrop,
): TournamentRunData {
  if (run.phase !== "interlude") {
    return run;
  }
  const healthRatios = { ...run.healthRatios };
  if (drop === "front-print-repair") {
    const activeRatio = run.activeInstanceId
      ? healthRatios[run.activeInstanceId]
      : undefined;
    if (run.activeInstanceId && activeRatio !== undefined && activeRatio > 0) {
      healthRatios[run.activeInstanceId] = Math.min(1, activeRatio + 0.45);
    }
  }
  if (drop === "case-repair") {
    const defeated = Object.entries(healthRatios)
      .filter(([, ratio]) => ratio <= 0)
      .sort(([left], [right]) => left.localeCompare(right))[0];
    const revivedInstanceId = defeated?.[0];
    if (defeated) {
      healthRatios[defeated[0]] = 0.35;
    }
    for (const [instanceId, ratio] of Object.entries(healthRatios)) {
      if (ratio > 0 && instanceId !== revivedInstanceId) {
        healthRatios[instanceId] = Math.min(1, ratio + 0.18);
      }
    }
  }
  return normaliseCheapSeatsRun({
    ...run,
    phase: "ready",
    healthRatios,
    nextRoundChargeBonus: drop === "hot-start" ? 18 : 0,
    selectedDrop: drop,
  });
}
