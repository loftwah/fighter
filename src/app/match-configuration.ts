import { historicOpeningCharge, traitSynergy } from "../combat/rules";
import { findPatch, openingChargeBonus } from "../progression/patches";
import type {
  CombatantBuild,
  CombatContent,
  Difficulty,
  StatBlock,
} from "../combat/types";
import type { CreateBattleInput } from "../combat/engine";

export type MatchConfigurationMode =
  "quick" | "story" | "tournament" | "development";

export interface ResolvedMatchInitialStatus {
  readonly kind:
    "stun" | "attack" | "defence" | "evasion" | "fortune" | "switchLock";
  readonly durationMs: number;
  readonly magnitude: number;
}

export interface ResolvedMatchFighter {
  readonly instanceId: string;
  readonly characterId: string;
  readonly build: CombatantBuild;
  /** Exact carried Health reviewed before Battle, expressed as 0..1. */
  readonly initialHealthRatio?: number;
  readonly initialStatuses?: readonly ResolvedMatchInitialStatus[];
}

export interface ResolvedMatchSide {
  readonly fighters: readonly ResolvedMatchFighter[];
  readonly accessoryId: string | null;
  readonly startingCharge: number;
}

export interface ResolvedMatchConfiguration {
  readonly id: string;
  readonly mode: MatchConfigurationMode;
  readonly presetId: string | null;
  readonly difficulty: Difficulty;
  readonly timeLimitMs: number;
  readonly seed: number;
  readonly startingChargeIncludesBonuses: true;
  readonly player: ResolvedMatchSide;
  readonly opponent: ResolvedMatchSide;
}

export interface CreateResolvedMatchConfigurationInput {
  readonly id: string;
  readonly mode: MatchConfigurationMode;
  readonly presetId?: string | null;
  readonly difficulty: Difficulty;
  readonly timeLimitMs: number;
  readonly seed: number;
  readonly startingChargeIncludesBonuses?: boolean;
  readonly player: ResolvedMatchSide;
  readonly opponent: ResolvedMatchSide;
}

const emptyStats: StatBlock = {
  health: 0,
  power: 0,
  evasion: 0,
  fortune: 0,
  tempo: 0,
};

function freezeBuild(
  source: CombatantBuild,
  instanceId: string,
): CombatantBuild {
  const actionIds = source.actionIds
    ? (Object.freeze([...source.actionIds]) as unknown as [
        string,
        string,
        string,
      ])
    : undefined;
  return Object.freeze({
    ...source,
    instanceId,
    statBonuses: Object.freeze({ ...emptyStats, ...source.statBonuses }),
    actionIds,
    actionPositions: Object.freeze({ ...source.actionPositions }),
    actionTiers: Object.freeze({ ...source.actionTiers }),
  });
}

function freezeSide(source: ResolvedMatchSide): ResolvedMatchSide {
  return Object.freeze({
    fighters: Object.freeze(
      source.fighters.map((fighter) =>
        Object.freeze({
          instanceId: fighter.instanceId.trim(),
          characterId: fighter.characterId.trim(),
          build: freezeBuild(fighter.build, fighter.instanceId.trim()),
          initialHealthRatio: fighter.initialHealthRatio ?? 1,
          initialStatuses: Object.freeze(
            (fighter.initialStatuses ?? []).map((status) =>
              Object.freeze({ ...status }),
            ),
          ),
        }),
      ),
    ),
    accessoryId: source.accessoryId?.trim() || null,
    startingCharge: source.startingCharge,
  });
}

export function createResolvedMatchConfiguration(
  input: CreateResolvedMatchConfigurationInput,
  content: CombatContent,
): ResolvedMatchConfiguration {
  const candidate = Object.freeze({
    id: input.id.trim(),
    mode: input.mode,
    presetId: input.presetId?.trim() || null,
    difficulty: input.difficulty,
    timeLimitMs: input.timeLimitMs,
    seed: input.seed,
    startingChargeIncludesBonuses: input.startingChargeIncludesBonuses === true,
    player: freezeSide(input.player),
    opponent: freezeSide(input.opponent),
  });
  if (!candidate.id) throw new Error("A resolved match requires an ID");
  if (!Number.isInteger(candidate.seed)) {
    throw new Error("A resolved match requires an explicit integer seed");
  }
  if (
    !Number.isInteger(candidate.timeLimitMs) ||
    candidate.timeLimitMs < 30_000 ||
    candidate.timeLimitMs > 300_000
  ) {
    throw new Error("Match time must be between 30 and 300 seconds");
  }
  for (const [label, side] of [
    ["Player", candidate.player],
    ["Opponent", candidate.opponent],
  ] as const) {
    if (side.fighters.length < 1 || side.fighters.length > 3) {
      throw new Error(`${label} match side requires one to three fighters`);
    }
    if (
      new Set(side.fighters.map((fighter) => fighter.instanceId)).size !==
      side.fighters.length
    ) {
      throw new Error(`${label} fighter instances must be unique`);
    }
    if (side.startingCharge < 0 || side.startingCharge > 100) {
      throw new Error(`${label} starting Charge must be between 0 and 100`);
    }
    if (side.accessoryId && !content.accessories[side.accessoryId]) {
      throw new Error(`Unknown ${label} Accessory: ${side.accessoryId}`);
    }
    for (const fighter of side.fighters) {
      const initialHealthRatio = fighter.initialHealthRatio ?? 1;
      if (
        !Number.isFinite(initialHealthRatio) ||
        initialHealthRatio < 0 ||
        initialHealthRatio > 1
      ) {
        throw new Error(
          `${label} fighter carried Health must be between 0 and 1`,
        );
      }
      if (
        fighter.initialStatuses?.some(
          (status) =>
            !Number.isInteger(status.durationMs) ||
            status.durationMs <= 0 ||
            !Number.isFinite(status.magnitude) ||
            status.magnitude < 0,
        )
      ) {
        throw new Error(`${label} fighter has an invalid opening status`);
      }
      const character = content.characters[fighter.characterId];
      if (!character)
        throw new Error(`Unknown Character: ${fighter.characterId}`);
      if (
        (fighter.build.level ?? character.level) < 1 ||
        (fighter.build.level ?? character.level) > 25
      ) {
        throw new Error(`${character.name} level must be between 1 and 25`);
      }
      const actionIds = fighter.build.actionIds ?? character.actionIds;
      if (
        actionIds.length !== 3 ||
        actionIds.some((actionId) => !content.actions[actionId])
      ) {
        throw new Error(`${character.name} requires three registered Moves`);
      }
      const level = fighter.build.level ?? character.level;
      const patch = findPatch(fighter.build.equippedPatchId ?? null);
      if (fighter.build.equippedPatchId && !patch) {
        throw new Error(
          `Unknown ${label} Modification: ${fighter.build.equippedPatchId}`,
        );
      }
      if (patch && level < 5) {
        throw new Error(
          `${character.name} Modification slot unlocks at level 5`,
        );
      }
      const hasEnhancedMove = Object.values(
        fighter.build.actionTiers ?? {},
      ).some((tier) => tier !== "stock");
      const hasReorderedMoves = actionIds.some(
        (actionId, index) => actionId !== character.actionIds[index],
      );
      if (
        level < 10 &&
        (hasEnhancedMove ||
          hasReorderedMoves ||
          Object.keys(fighter.build.actionPositions ?? {}).length > 0)
      ) {
        throw new Error(
          `${character.name} Move customisation unlocks at level 10`,
        );
      }
    }
  }
  const allInstanceIds = [
    ...candidate.player.fighters,
    ...candidate.opponent.fighters,
  ].map((fighter) => fighter.instanceId);
  if (new Set(allInstanceIds).size !== allInstanceIds.length) {
    throw new Error("The same fighter instance cannot appear on both sides");
  }
  const effectiveSide = (side: ResolvedMatchSide): ResolvedMatchSide => {
    if (candidate.startingChargeIncludesBonuses) return side;
    const builds = [...side.fighters.map((fighter) => fighter.build)];
    const definitions = side.fighters.map(
      (fighter) => content.characters[fighter.characterId]!,
    );
    const startingCharge = Math.min(
      100,
      Math.max(
        0,
        side.startingCharge +
          openingChargeBonus(builds) +
          historicOpeningCharge(traitSynergy(definitions).bonuses),
      ),
    );
    return Object.freeze({ ...side, startingCharge });
  };
  const match: ResolvedMatchConfiguration = Object.freeze({
    ...candidate,
    startingChargeIncludesBonuses: true,
    player: effectiveSide(candidate.player),
    opponent: effectiveSide(candidate.opponent),
  });
  return match;
}

export function battleInputForMatch(
  match: ResolvedMatchConfiguration,
): CreateBattleInput {
  const playerBuilds = match.player.fighters.map((fighter) => fighter.build);
  const opponentBuilds = match.opponent.fighters.map(
    (fighter) => fighter.build,
  );
  return {
    playerCharacterIds: match.player.fighters.map(
      (fighter) => fighter.characterId,
    ),
    playerBuilds,
    enemyCharacterIds: match.opponent.fighters.map(
      (fighter) => fighter.characterId,
    ),
    enemyBuilds: opponentBuilds,
    playerStartingBar: match.player.startingCharge,
    enemyStartingBar: match.opponent.startingCharge,
    startingBarsIncludeTraitBonus: true,
    playerAccessoryId: match.player.accessoryId ?? undefined,
    enemyAccessoryId: match.opponent.accessoryId ?? undefined,
    seed: match.seed,
    difficulty: match.difficulty,
    timeLimitMs: match.timeLimitMs,
  };
}
