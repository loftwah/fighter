import type {
  ActionPosition,
  ActionTier,
  BattleEvent,
  BattleState,
  StatBlock,
} from "../combat/types";
import {
  tournamentTrophies,
  type TournamentDefinition,
  type TournamentEffectDefinition,
  type TournamentMatchSettings,
  type TournamentNodeDefinition,
} from "./catalog";

export const TOURNAMENT_ROSTER_MAX = 6;

export interface TournamentRosterBuild {
  characterId: string;
  instanceId: string;
  level: number;
  statBonuses: StatBlock;
  actionIds: [string, string, string];
  actionPositions?: Partial<Record<string, ActionPosition>>;
  actionTiers: Record<string, ActionTier>;
  interruptionResistance: number;
  equippedPatchId: string | null;
}

export interface TournamentRunSettings {
  defaults: TournamentMatchSettings;
  fightOverrides: Record<string, Partial<TournamentMatchSettings>>;
}

export interface TournamentRunState {
  tournamentId: string;
  definitionKind?: "preset" | "variant" | "custom";
  baseTournamentId?: string | null;
  /** The Trophy declared by the exact definition selected for this run. */
  definitionTrophyId?: string;
  origin: "story" | "standalone";
  currentNodeId: string;
  /** Presentation index only; currentNodeId is the generic ordered-node cursor. */
  roundIndex: number;
  phase: "ready" | "interlude";
  caseBuilds: TournamentRosterBuild[];
  deployedInstanceIds: string[];
  healthRatios: Record<string, number>;
  opponentHealthRatios: Record<string, number>;
  activeInstanceId: string | null;
  deploymentAccessoryId?: string | null;
  runSettings?: TournamentRunSettings;
  nextRoundChargeBonus: number;
  opponentNextRoundChargeBonus?: number;
  pendingNextFightEffects?: TournamentEffectDefinition[];
  selectedDrop: "front-print-repair" | "case-repair" | "hot-start" | null;
  exhaustedAccessoryIds: string[];
}

export type TournamentTerminalResult =
  | { status: "lost"; reason: "roster-defeated" }
  | { status: "forfeited"; reason: "forfeit" }
  | {
      status: "complete";
      tournamentId: string;
      trophyId: string;
      healthRatios: Record<string, number>;
    };

export type TournamentBattleResult =
  | TournamentTerminalResult
  | { status: "redeploy" | "continue"; run: TournamentRunState };

const clampRatio = (value: number): number => Math.max(0, Math.min(1, value));
const clampCharge = (value: number): number =>
  Math.max(0, Math.min(100, value));

function trophyIdForDefinition(definition: TournamentDefinition): string {
  const trophy = tournamentTrophies[definition.trophyId];
  if (!trophy)
    throw new Error(`Tournament ${definition.id} has no registered Trophy`);
  return trophy.id;
}

function cloneSettings(source: TournamentRunSettings): TournamentRunSettings {
  return {
    defaults: { ...source.defaults },
    fightOverrides: Object.fromEntries(
      Object.entries(source.fightOverrides).map(([id, settings]) => [
        id,
        { ...settings },
      ]),
    ),
  };
}

export function tournamentRunSettings(
  definition: TournamentDefinition,
  defaults: Partial<TournamentMatchSettings> = {},
  fightOverrides: Readonly<
    Record<string, Partial<TournamentMatchSettings>>
  > = {},
): TournamentRunSettings {
  const defaultsWithoutDeploymentAccessory = {
    ...definition.matchDefaults,
    ...defaults,
    playerAccessoryId: null,
  };
  return cloneSettings({
    defaults: defaultsWithoutDeploymentAccessory,
    fightOverrides: Object.fromEntries(
      Object.entries(fightOverrides).map(([id, settings]) => {
        const rules = { ...settings };
        delete rules.playerAccessoryId;
        return [id, rules];
      }),
    ),
  });
}

export function effectiveTournamentFightSettings(
  definition: TournamentDefinition,
  run: TournamentRunState,
  nodeId = run.currentNodeId,
): TournamentMatchSettings {
  const node = definition.nodes.find(
    (
      candidate,
    ): candidate is Extract<TournamentNodeDefinition, { kind: "fight" }> =>
      candidate.id === nodeId && candidate.kind === "fight",
  );
  if (!node) throw new Error(`Tournament fight ${nodeId} is not registered`);
  const runSettings = run.runSettings ?? tournamentRunSettings(definition);
  return Object.freeze({
    ...runSettings.defaults,
    ...node.matchSettings,
    ...runSettings.fightOverrides[nodeId],
  });
}

function firstFight(definition: TournamentDefinition) {
  const nodeIndex = definition.nodes.findIndex((node) => node.kind === "fight");
  const node = definition.nodes[nodeIndex];
  if (!node || node.kind !== "fight") {
    throw new Error(`Tournament ${definition.id} requires at least one fight`);
  }
  return { node, nodeIndex };
}

function assertRoster(roster: readonly TournamentRosterBuild[]): void {
  if (roster.length < 1 || roster.length > TOURNAMENT_ROSTER_MAX) {
    throw new Error(
      `A Tournament Roster requires one to ${TOURNAMENT_ROSTER_MAX} Characters`,
    );
  }
  const instanceIds = roster.map((build) => build.instanceId.trim());
  if (
    instanceIds.some((id) => !id) ||
    new Set(instanceIds).size !== instanceIds.length
  ) {
    throw new Error("Tournament Roster instances must be non-empty and unique");
  }
}

export function createTournamentRun(input: {
  definition: TournamentDefinition;
  roster: readonly TournamentRosterBuild[];
  origin?: "story" | "standalone";
  deployedInstanceIds?: readonly string[];
  starterInstanceId?: string | null;
  deploymentAccessoryId?: string | null;
  defaults?: Partial<TournamentMatchSettings>;
  fightOverrides?: Readonly<Record<string, Partial<TournamentMatchSettings>>>;
  allowEmptyRoster?: boolean;
}): TournamentRunState {
  if (!(input.allowEmptyRoster && input.roster.length === 0)) {
    assertRoster(input.roster);
  }
  const { node } = firstFight(input.definition);
  const roster = structuredClone(input.roster) as TournamentRosterBuild[];
  const requestedDeployment =
    input.deployedInstanceIds ??
    roster.slice(0, 3).map((build) => build.instanceId);
  const run: TournamentRunState = {
    tournamentId: input.definition.id,
    definitionKind: input.definition.kind,
    baseTournamentId: input.definition.baseTournamentId ?? null,
    definitionTrophyId: input.definition.trophyId,
    origin: input.origin ?? "standalone",
    currentNodeId: node.id,
    roundIndex: 0,
    phase: "ready",
    caseBuilds: roster,
    deployedInstanceIds: [...requestedDeployment],
    healthRatios: Object.fromEntries(
      roster.map((build) => [build.instanceId, 1]),
    ),
    opponentHealthRatios: {},
    activeInstanceId: input.starterInstanceId ?? requestedDeployment[0] ?? null,
    deploymentAccessoryId: input.deploymentAccessoryId ?? null,
    runSettings: tournamentRunSettings(
      input.definition,
      input.defaults,
      input.fightOverrides,
    ),
    nextRoundChargeBonus: 0,
    opponentNextRoundChargeBonus: 0,
    pendingNextFightEffects: [],
    selectedDrop: null,
    exhaustedAccessoryIds: [],
  };
  return normaliseTournamentRun(run, input.allowEmptyRoster === true);
}

export function normaliseTournamentRun(
  sourceRun: TournamentRunState,
  allowEmptyRoster = true,
): TournamentRunState {
  const run = structuredClone(sourceRun);
  run.caseBuilds = Array.from(
    new Map(
      run.caseBuilds.map((build) => [build.instanceId, build] as const),
    ).values(),
  ).slice(0, TOURNAMENT_ROSTER_MAX);
  if (run.caseBuilds.length === 0) {
    if (!allowEmptyRoster) assertRoster(run.caseBuilds);
    return run;
  }
  const rosterIds = new Set(run.caseBuilds.map((build) => build.instanceId));
  for (const instanceId of Object.keys(run.healthRatios)) {
    if (!rosterIds.has(instanceId)) delete run.healthRatios[instanceId];
    else
      run.healthRatios[instanceId] = clampRatio(run.healthRatios[instanceId]!);
  }
  for (const build of run.caseBuilds) run.healthRatios[build.instanceId] ??= 1;
  const livingIds = run.caseBuilds
    .filter((build) => run.healthRatios[build.instanceId]! > 0)
    .map((build) => build.instanceId);
  const livingIdSet = new Set(livingIds);
  run.deployedInstanceIds = Array.from(
    new Set(run.deployedInstanceIds.filter((id) => livingIdSet.has(id))),
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
  run.exhaustedAccessoryIds = [...new Set(run.exhaustedAccessoryIds)];
  if (
    run.deploymentAccessoryId &&
    run.exhaustedAccessoryIds.includes(run.deploymentAccessoryId)
  ) {
    run.deploymentAccessoryId = null;
  }
  run.nextRoundChargeBonus = clampCharge(run.nextRoundChargeBonus);
  run.opponentNextRoundChargeBonus = clampCharge(
    run.opponentNextRoundChargeBonus ?? 0,
  );
  run.pendingNextFightEffects = structuredClone(
    run.pendingNextFightEffects ?? [],
  );
  return run;
}

export function lockTournamentRoster(
  sourceRun: TournamentRunState,
  roster: readonly TournamentRosterBuild[],
): TournamentRunState {
  if (sourceRun.caseBuilds.length > 0) return normaliseTournamentRun(sourceRun);
  assertRoster(roster);
  const run = structuredClone(sourceRun);
  run.caseBuilds = structuredClone(roster) as TournamentRosterBuild[];
  run.healthRatios = Object.fromEntries(
    roster.map((build) => [
      build.instanceId,
      run.healthRatios[build.instanceId] ?? 1,
    ]),
  );
  return normaliseTournamentRun(run, false);
}

export function selectTournamentDeployment(
  sourceRun: TournamentRunState,
  deployedInstanceIds: readonly string[],
  starterInstanceId: string | null,
  accessoryId: string | null = sourceRun.deploymentAccessoryId ?? null,
): TournamentRunState {
  if (sourceRun.phase !== "ready") return sourceRun;
  const livingIds = new Set(
    sourceRun.caseBuilds
      .filter((build) => (sourceRun.healthRatios[build.instanceId] ?? 1) > 0)
      .map((build) => build.instanceId),
  );
  if (
    deployedInstanceIds.length < 1 ||
    deployedInstanceIds.length > 3 ||
    new Set(deployedInstanceIds).size !== deployedInstanceIds.length ||
    deployedInstanceIds.some((id) => !livingIds.has(id))
  ) {
    throw new Error("Deploy one to three unique living Tournament Characters");
  }
  if (accessoryId && sourceRun.exhaustedAccessoryIds.includes(accessoryId)) {
    throw new Error("That Accessory is exhausted for this Tournament run");
  }
  const deployment = [...deployedInstanceIds];
  return {
    ...structuredClone(sourceRun),
    deployedInstanceIds: deployment,
    activeInstanceId:
      starterInstanceId && deployment.includes(starterInstanceId)
        ? starterInstanceId
        : deployment[0]!,
    deploymentAccessoryId: accessoryId,
  };
}

export function exhaustTournamentAccessory(
  sourceRun: TournamentRunState,
  accessoryId: string,
): TournamentRunState {
  const exhaustedAccessoryIds = [
    ...new Set([...sourceRun.exhaustedAccessoryIds, accessoryId]),
  ];
  return {
    ...structuredClone(sourceRun),
    exhaustedAccessoryIds,
    deploymentAccessoryId:
      sourceRun.deploymentAccessoryId === accessoryId
        ? null
        : (sourceRun.deploymentAccessoryId ?? null),
  };
}

export function exhaustTournamentAccessoriesFromEvents(
  sourceRun: TournamentRunState,
  events: readonly BattleEvent[],
): TournamentRunState {
  return events.reduce(
    (run, event) =>
      event.type === "accessoryActivated" &&
      event.side === "player" &&
      event.message
        ? exhaustTournamentAccessory(run, event.message)
        : run,
    sourceRun,
  );
}

function captureHealth(
  state: BattleState,
  side: "player" | "enemy",
): Record<string, number> {
  return Object.fromEntries(
    state[side].squad.map((combatant) => [
      combatant.instanceId,
      clampRatio(combatant.currentHealth / combatant.maxHealth),
    ]),
  );
}

export const captureTournamentRosterHealth = (state: BattleState) =>
  captureHealth(state, "player");
export const captureTournamentOpponentHealth = (state: BattleState) =>
  captureHealth(state, "enemy");

function nextNodeAfter(
  definition: TournamentDefinition,
  currentNodeId: string,
): TournamentNodeDefinition | null {
  const index = definition.nodes.findIndex((node) => node.id === currentNodeId);
  return index >= 0 ? (definition.nodes[index + 1] ?? null) : null;
}

function fightIndex(definition: TournamentDefinition, nodeId: string): number {
  return definition.nodes
    .filter((node) => node.kind === "fight")
    .findIndex((node) => node.id === nodeId);
}

function moveToNode(
  definition: TournamentDefinition,
  sourceRun: TournamentRunState,
  node: TournamentNodeDefinition,
): TournamentRunState {
  const run = structuredClone(sourceRun);
  run.currentNodeId = node.id;
  if (node.kind === "fight") {
    run.phase = "ready";
    run.roundIndex = Math.max(0, fightIndex(definition, node.id));
    run.opponentHealthRatios = {};
    run.deploymentAccessoryId = null;
  } else {
    run.phase = "interlude";
    const followingFight = definition.nodes
      .slice(
        definition.nodes.findIndex((candidate) => candidate.id === node.id) + 1,
      )
      .find((candidate) => candidate.kind === "fight");
    if (followingFight) {
      run.roundIndex = Math.max(0, fightIndex(definition, followingFight.id));
    }
  }
  return normaliseTournamentRun(run);
}

export function recordTournamentBattleResult(
  definition: TournamentDefinition,
  sourceRun: TournamentRunState,
  state: BattleState,
  won: boolean,
): TournamentBattleResult {
  const run = normaliseTournamentRun({
    ...structuredClone(sourceRun),
    healthRatios: {
      ...sourceRun.healthRatios,
      ...captureTournamentRosterHealth(state),
    },
    activeInstanceId:
      state.player.squad[state.player.activeIndex]?.instanceId ??
      sourceRun.activeInstanceId,
    nextRoundChargeBonus: 0,
    opponentNextRoundChargeBonus: 0,
    pendingNextFightEffects: [],
  });
  if (!won) {
    const survivors = run.caseBuilds.filter(
      (build) => (run.healthRatios[build.instanceId] ?? 1) > 0,
    );
    if (survivors.length === 0) {
      return { status: "lost", reason: "roster-defeated" };
    }
    return {
      status: "redeploy",
      run: normaliseTournamentRun({
        ...run,
        phase: "ready",
        opponentHealthRatios: {
          ...run.opponentHealthRatios,
          ...captureTournamentOpponentHealth(state),
        },
        deployedInstanceIds: survivors
          .slice(0, 3)
          .map((build) => build.instanceId),
        activeInstanceId: survivors[0]?.instanceId ?? null,
        deploymentAccessoryId: null,
        nextRoundChargeBonus: 0,
        opponentNextRoundChargeBonus: 0,
      }),
    };
  }
  const nextNode = nextNodeAfter(definition, run.currentNodeId);
  if (!nextNode) {
    return {
      status: "complete",
      tournamentId: definition.id,
      trophyId: trophyIdForDefinition(definition),
      healthRatios: run.healthRatios,
    };
  }
  const advanced = moveToNode(definition, run, nextNode);
  if (nextNode.kind !== "fight" && nextNode.kind !== "recovery") {
    return resolveTournamentInterludeResult(definition, advanced);
  }
  return { status: "continue", run: advanced };
}

function applyEffects(
  sourceRun: TournamentRunState,
  effects: readonly TournamentEffectDefinition[],
): TournamentRunState {
  const run = structuredClone(sourceRun);
  const revived = new Set<string>();
  for (const effect of effects) {
    if (effect.kind === "heal-active") {
      const id = run.activeInstanceId;
      if (id && (run.healthRatios[id] ?? 0) > 0) {
        run.healthRatios[id] = clampRatio(
          run.healthRatios[id]! + effect.amount,
        );
      }
    } else if (effect.kind === "revive-one") {
      const rosterInstanceIds =
        run.caseBuilds.length > 0
          ? run.caseBuilds.map((build) => build.instanceId)
          : Object.keys(run.healthRatios);
      const id = rosterInstanceIds
        .filter((instanceId) => (run.healthRatios[instanceId] ?? 1) <= 0)
        .sort()[0];
      if (id) {
        run.healthRatios[id] = clampRatio(effect.healthRatio);
        revived.add(id);
      }
    } else if (effect.kind === "heal-roster") {
      const rosterInstanceIds =
        run.caseBuilds.length > 0
          ? run.caseBuilds.map((build) => build.instanceId)
          : Object.keys(run.healthRatios);
      for (const instanceId of rosterInstanceIds) {
        const ratio = run.healthRatios[instanceId] ?? 1;
        if (ratio > 0 && !revived.has(instanceId)) {
          run.healthRatios[instanceId] = clampRatio(ratio + effect.amount);
        }
      }
    } else if (
      effect.kind === "starting-status" ||
      effect.kind === "temporary-stat"
    ) {
      run.pendingNextFightEffects = [
        ...(run.pendingNextFightEffects ?? []),
        structuredClone(effect),
      ];
    } else if (effect.side === "player") {
      run.nextRoundChargeBonus = clampCharge(
        run.nextRoundChargeBonus + effect.amount,
      );
    } else {
      run.opponentNextRoundChargeBonus = clampCharge(
        (run.opponentNextRoundChargeBonus ?? 0) + effect.amount,
      );
    }
  }
  return normaliseTournamentRun(run);
}

export function resolveTournamentInterlude(
  definition: TournamentDefinition,
  sourceRun: TournamentRunState,
  choiceId?: string,
): TournamentRunState {
  const result = resolveTournamentInterludeResult(
    definition,
    sourceRun,
    choiceId,
  );
  if (result.status === "complete") {
    throw new Error("Tournament completed while resolving the final interlude");
  }
  return result.run;
}

export function resolveTournamentInterludeResult(
  definition: TournamentDefinition,
  sourceRun: TournamentRunState,
  choiceId?: string,
):
  | { status: "continue"; run: TournamentRunState }
  | Extract<TournamentTerminalResult, { status: "complete" }> {
  if (sourceRun.phase !== "interlude") {
    return { status: "continue", run: sourceRun };
  }
  const node = definition.nodes.find(
    (candidate) => candidate.id === sourceRun.currentNodeId,
  );
  if (!node || node.kind === "fight") {
    throw new Error(
      `Tournament interlude ${sourceRun.currentNodeId} is not registered`,
    );
  }
  let run = structuredClone(sourceRun);
  if (node.kind === "recovery") {
    const choice = node.choices?.find((candidate) => candidate.id === choiceId);
    if (!choice)
      throw new Error("Choose a registered Tournament interlude option");
    run = applyEffects(run, choice.effects);
    if (
      choice.id === "front-print-repair" ||
      choice.id === "case-repair" ||
      choice.id === "hot-start"
    ) {
      run.selectedDrop = choice.id;
    }
  } else {
    run = applyEffects(run, node.effects ?? []);
  }
  let next = nextNodeAfter(definition, node.id);
  while (next && next.kind !== "fight" && next.kind !== "recovery") {
    run = applyEffects(run, "effects" in next ? (next.effects ?? []) : []);
    next = nextNodeAfter(definition, next.id);
  }
  if (!next) {
    return {
      status: "complete",
      tournamentId: definition.id,
      trophyId: trophyIdForDefinition(definition),
      healthRatios: run.healthRatios,
    };
  }
  return { status: "continue", run: moveToNode(definition, run, next) };
}

export function forfeitTournamentRun(): TournamentTerminalResult {
  return { status: "forfeited", reason: "forfeit" };
}

export function restartTournamentRun(
  definition: TournamentDefinition,
  sourceRun: TournamentRunState,
): TournamentRunState {
  return createTournamentRun({
    definition,
    roster: sourceRun.caseBuilds,
    origin: sourceRun.origin,
    deployedInstanceIds: sourceRun.caseBuilds
      .slice(0, 3)
      .map((build) => build.instanceId),
    defaults: sourceRun.runSettings?.defaults,
    fightOverrides: sourceRun.runSettings?.fightOverrides,
  });
}

export function tournamentVictoryProjection(
  definition: TournamentDefinition,
  ownedTournamentIds: readonly string[],
): { tournamentId: string; trophyId: string; awarded: boolean } {
  const tournamentId = definition.baseTournamentId ?? definition.id;
  return {
    tournamentId,
    trophyId: trophyIdForDefinition(definition),
    awarded: !ownedTournamentIds.includes(tournamentId),
  };
}
