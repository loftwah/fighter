import {
  createResolvedMatchConfiguration,
  type ResolvedMatchConfiguration,
} from "../app/match-configuration";
import { createStandardBuild } from "../combat/standard-build";
import type {
  BattleState,
  CombatContent,
  CombatantBuild,
  Difficulty,
} from "../combat/types";
import type { TournamentDefinition } from "./catalog";
import {
  effectiveTournamentFightSettings,
  type TournamentRunState,
} from "./runner";

export interface ResolvedTournamentMatch {
  readonly nodeId: string;
  readonly match: ResolvedMatchConfiguration;
}

export function resolveTournamentMatch(input: {
  definition: TournamentDefinition;
  run: TournamentRunState;
  content: CombatContent;
  preferredDifficulty: Difficulty;
  opponentBuilds?: readonly CombatantBuild[];
  opponentInstanceIds?: readonly string[];
}): ResolvedTournamentMatch {
  const { definition, run, content } = input;
  if (run.tournamentId !== definition.id) {
    throw new Error(
      "Tournament run does not belong to the selected definition",
    );
  }
  if (run.phase !== "ready") {
    throw new Error("Resolve the current Tournament interlude before Battle");
  }
  const node = definition.nodes.find(
    (candidate) =>
      candidate.id === run.currentNodeId && candidate.kind === "fight",
  );
  if (!node || node.kind !== "fight") {
    throw new Error(`Tournament fight ${run.currentNodeId} is not registered`);
  }
  const settings = effectiveTournamentFightSettings(definition, run, node.id);
  const starterId = run.activeInstanceId ?? run.deployedInstanceIds[0];
  if (!starterId) throw new Error("Tournament deployment requires a starter");
  const orderedIds = [
    starterId,
    ...run.deployedInstanceIds.filter((id) => id !== starterId),
  ];
  let playerBuilds = orderedIds.map((instanceId) => {
    const build = run.caseBuilds.find(
      (candidate) => candidate.instanceId === instanceId,
    );
    if (!build || (run.healthRatios[instanceId] ?? 1) <= 0) {
      throw new Error(
        "Tournament deployment contains a defeated or unlocked instance",
      );
    }
    return build;
  });
  const opponentInstanceIds = node.enemyCharacterIds.map(
    (characterId, index) =>
      input.opponentInstanceIds?.[index] ??
      `tournament.${node.id}.opponent.${index}.${characterId}`,
  );
  let opponentBuilds = node.enemyCharacterIds.map((characterId, index) => {
    const supplied = input.opponentBuilds?.[index];
    if (supplied)
      return { ...supplied, instanceId: opponentInstanceIds[index] };
    const character = content.characters[characterId];
    if (!character)
      throw new Error(`Unknown Tournament opponent: ${characterId}`);
    return {
      ...createStandardBuild(character, "enemy", index),
      instanceId: opponentInstanceIds[index],
    };
  });
  const pendingEffects = run.pendingNextFightEffects ?? [];
  const applyTemporaryStats = <T extends CombatantBuild>(
    builds: readonly T[],
    side: "player" | "opponent",
  ): T[] =>
    builds.map((build, index) => {
      const statBonuses = { ...build.statBonuses };
      for (const effect of pendingEffects) {
        if (
          effect.kind === "temporary-stat" &&
          effect.side === side &&
          (effect.target === "all" || index === 0)
        ) {
          statBonuses[effect.stat] =
            (statBonuses[effect.stat] ?? 0) + effect.amount;
        }
      }
      return { ...build, statBonuses };
    });
  const initialStatuses = (side: "player" | "opponent", index: number) =>
    pendingEffects.flatMap((effect) =>
      effect.kind === "starting-status" &&
      effect.side === side &&
      (effect.target === "all" || index === 0)
        ? [
            {
              kind: effect.status,
              durationMs: effect.durationMs,
              magnitude: effect.magnitude,
            },
          ]
        : [],
    );
  playerBuilds = applyTemporaryStats(playerBuilds, "player");
  opponentBuilds = applyTemporaryStats(opponentBuilds, "opponent");
  const match = createResolvedMatchConfiguration(
    {
      id: `match.${definition.id}.${node.id}`,
      mode: "tournament",
      presetId: definition.baseTournamentId ?? definition.id,
      difficulty: settings.difficulty ?? input.preferredDifficulty,
      timeLimitMs: settings.timeLimitMs,
      seed: node.seed,
      player: {
        fighters: playerBuilds.map((build, index) => ({
          instanceId: build.instanceId,
          characterId: build.characterId,
          build,
          initialHealthRatio: run.healthRatios[build.instanceId] ?? 1,
          initialStatuses: initialStatuses("player", index),
        })),
        accessoryId: run.deploymentAccessoryId ?? null,
        startingCharge: Math.min(
          100,
          settings.playerStartingCharge + run.nextRoundChargeBonus,
        ),
      },
      opponent: {
        fighters: node.enemyCharacterIds.map((characterId, index) => ({
          instanceId: opponentInstanceIds[index]!,
          characterId,
          build: opponentBuilds[index]!,
          initialHealthRatio:
            run.opponentHealthRatios[opponentInstanceIds[index]!] ?? 1,
          initialStatuses: initialStatuses("opponent", index),
        })),
        accessoryId: settings.opponentAccessoryId,
        startingCharge: Math.min(
          100,
          settings.opponentStartingCharge +
            (run.opponentNextRoundChargeBonus ?? 0),
        ),
      },
    },
    content,
  );
  return Object.freeze({ nodeId: node.id, match });
}

/** Applies only the immutable Health snapshot already shown by Review Fight. */
export function applyTournamentMatchInitialState(
  sourceState: BattleState,
  match: ResolvedMatchConfiguration,
): BattleState {
  if (match.mode !== "tournament") {
    throw new Error("Only a Tournament match carries Tournament Health");
  }
  const state = structuredClone(sourceState);
  for (const [sideName, side] of [
    ["player", match.player],
    ["enemy", match.opponent],
  ] as const) {
    for (const combatant of state[sideName].squad) {
      const fighter = side.fighters.find(
        (candidate) => candidate.instanceId === combatant.instanceId,
      );
      if (!fighter)
        throw new Error(
          "Battle state does not match reviewed Tournament Lineups",
        );
      combatant.currentHealth = Math.round(
        combatant.maxHealth * (fighter.initialHealthRatio ?? 1),
      );
      combatant.statuses.push(
        ...(fighter.initialStatuses ?? []).map((status, index) => ({
          id: `tournament.opening.${combatant.instanceId}.${index}`,
          kind: status.kind,
          remainingMs: status.durationMs,
          magnitude: status.magnitude,
        })),
      );
    }
    const firstLiving = state[sideName].squad.findIndex(
      (combatant) => combatant.currentHealth > 0,
    );
    if (firstLiving >= 0) state[sideName].activeIndex = firstLiving;
  }
  return state;
}

export const applyTournamentMatchInitialHealth =
  applyTournamentMatchInitialState;
