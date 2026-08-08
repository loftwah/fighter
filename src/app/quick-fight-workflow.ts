import type {
  ActionTier,
  CharacterDefinition,
  CombatantBuild,
  Difficulty,
  StatBlock,
} from "../combat/types";
import { combatContent, quickFightDefaults } from "../content/initial-content";
import { patches } from "../progression/patches";
import {
  createResolvedMatchConfiguration,
  type ResolvedMatchConfiguration,
} from "./match-configuration";
import {
  confirmFightWorkflow,
  createFightWorkflowDraft,
  setFightWorkflowBuild,
  type ConfirmedFightWorkflow,
  type FightWorkflowDraft,
  type FightWorkflowIssue,
  type FightWorkflowSettingField,
  type FightWorkflowSide,
} from "./fight-workflow";
import { buildWithModificationEffect } from "./modification-build";

export const QUICK_FIGHT_COPY_COUNT = 3;
export const QUICK_FIGHT_MAX_LEVEL = 25;

export const QUICK_FIGHT_FULL_POWER_STATS: StatBlock = Object.freeze({
  health: 5,
  power: 5,
  evasion: 5,
  fortune: 5,
  tempo: 4,
});

const quickEditableSettings = [
  "difficulty",
  "timeLimit",
  "startingCharge",
  "builds",
  "seed",
] as const satisfies readonly FightWorkflowSettingField[];

export interface QuickFightPresetDefinition {
  readonly id: "quick.full-power" | "quick.hot-start" | "quick.custom";
  readonly name: string;
  readonly summary: string;
  readonly rule: string;
  readonly kind: "preset" | "custom";
  readonly settings: "required";
  readonly editableSettings: readonly FightWorkflowSettingField[];
  readonly defaults: {
    readonly timeLimitMs: number;
    readonly playerStartingCharge: number;
    readonly opponentStartingCharge: number;
  };
}

export const quickFightPresets = [
  {
    id: "quick.full-power",
    name: "Full Power",
    summary: "Everything unlocked. Every fighter at their best.",
    rule: "Everything unlocked. Every fighter at their best.",
    kind: "preset",
    settings: "required",
    editableSettings: quickEditableSettings,
    defaults: {
      timeLimitMs: 120_000,
      playerStartingCharge: 25,
      opponentStartingCharge: 25,
    },
  },
  {
    id: "quick.hot-start",
    name: "Hot Start",
    summary: "Big Moves are ready almost immediately.",
    rule: "Big Moves are ready almost immediately.",
    kind: "preset",
    settings: "required",
    editableSettings: quickEditableSettings,
    defaults: {
      timeLimitMs: 90_000,
      playerStartingCharge: 75,
      opponentStartingCharge: 75,
    },
  },
  {
    id: "quick.custom",
    name: "Custom",
    summary: "Uses the settings shown below.",
    rule: "Uses the settings shown below.",
    kind: "custom",
    settings: "required",
    editableSettings: quickEditableSettings,
    defaults: {
      timeLimitMs: 120_000,
      playerStartingCharge: 25,
      opponentStartingCharge: 25,
    },
  },
] as const satisfies readonly QuickFightPresetDefinition[];

export type QuickFightPresetId = (typeof quickFightPresets)[number]["id"];

export function quickFightPreset(id: string): QuickFightPresetDefinition {
  const preset = quickFightPresets.find((candidate) => candidate.id === id);
  if (!preset) throw new Error(`Quick Fight preset ${id} is not registered`);
  return preset;
}

function eligibleFighters(side: FightWorkflowSide) {
  return Object.values(combatContent.characters).flatMap((character) =>
    Array.from({ length: QUICK_FIGHT_COPY_COUNT }, (_, copyIndex) => {
      const instanceId = `sandbox.${side}.${character.id}.${copyIndex + 1}`;
      return {
        instanceId,
        characterId: character.id,
        build: fullPowerBuild(character, instanceId),
      };
    }),
  );
}

function fullPowerBuild(
  character: CharacterDefinition,
  instanceId: string,
): CombatantBuild {
  return {
    instanceId,
    level: QUICK_FIGHT_MAX_LEVEL,
    statBonuses: { ...QUICK_FIGHT_FULL_POWER_STATS },
    actionIds: [...character.actionIds] as [string, string, string],
    actionPositions: {},
    actionTiers: Object.fromEntries(
      character.actionIds.map((actionId) => [actionId, "platinum"]),
    ),
    interruptionResistance: 0,
    equippedPatchId: null,
  };
}

export function createQuickFightWorkflow(
  presetId: QuickFightPresetId = "quick.full-power",
  preferredDifficulty: Difficulty = "normal",
): FightWorkflowDraft {
  const preset = quickFightPreset(presetId);
  const playerEligibleFighters = eligibleFighters("player");
  const opponentEligibleFighters = eligibleFighters("opponent");
  const playerInstanceId = playerEligibleFighters.find(
    (fighter) => fighter.characterId === quickFightDefaults.playerIds[0],
  )!.instanceId;
  const opponentInstanceId = opponentEligibleFighters.find(
    (fighter) => fighter.characterId === quickFightDefaults.enemyIds[0],
  )!.instanceId;
  const builds = Object.fromEntries(
    [...playerEligibleFighters, ...opponentEligibleFighters].map((fighter) => [
      fighter.instanceId,
      fighter.build,
    ]),
  );

  return createFightWorkflowDraft({
    id: `${preset.id}.${Date.now()}`,
    policy: {
      mode: "quick",
      player: { locked: false, eligibleFighters: playerEligibleFighters },
      opponent: { locked: false, eligibleFighters: opponentEligibleFighters },
      settings: preset.settings,
      editableSettings: preset.editableSettings,
    },
    player: {
      instanceIds: [playerInstanceId],
      starterInstanceId: playerInstanceId,
      accessoryId: quickFightDefaults.playerAccessoryId,
    },
    opponent: {
      instanceIds: [opponentInstanceId],
      starterInstanceId: opponentInstanceId,
      accessoryId: quickFightDefaults.enemyAccessoryId,
    },
    settings: {
      presetId: preset.id,
      difficulty: preferredDifficulty,
      timeLimitMs: preset.defaults.timeLimitMs,
      playerStartingCharge: preset.defaults.playerStartingCharge,
      opponentStartingCharge: preset.defaults.opponentStartingCharge,
      seed: quickFightDefaults.seed,
      builds,
    },
  });
}

/**
 * Applies a value preset without changing either prepared Lineup. Custom is a
 * label for the current values, so selecting it never resets the draft.
 */
export function applyQuickFightPreset(
  draft: FightWorkflowDraft,
  presetId: QuickFightPresetId,
): FightWorkflowDraft {
  if (draft.mode !== "quick") {
    throw new Error("Quick Fight presets only apply to Quick Fight drafts");
  }
  const preset = quickFightPreset(presetId);
  const settings =
    preset.id === "quick.custom"
      ? { ...draft.settings, presetId: preset.id }
      : {
          ...draft.settings,
          presetId: preset.id,
          timeLimitMs: preset.defaults.timeLimitMs,
          playerStartingCharge: preset.defaults.playerStartingCharge,
          opponentStartingCharge: preset.defaults.opponentStartingCharge,
          builds: Object.fromEntries(
            (["player", "opponent"] as const).flatMap((side) =>
              draft.policy[side].eligibleFighters.map((fighter) => {
                const character = combatContent.characters[fighter.characterId];
                if (!character) {
                  throw new Error(
                    `Missing Quick Fight fighter: ${fighter.characterId}`,
                  );
                }
                return [
                  fighter.instanceId,
                  fullPowerBuild(character, fighter.instanceId),
                ];
              }),
            ),
          ),
        };
  return createFightWorkflowDraft({
    id: draft.id,
    policy: draft.policy,
    player: draft.selections.player,
    opponent: draft.selections.opponent,
    settings,
    step: draft.step,
  });
}

export function markQuickFightCustom(
  draft: FightWorkflowDraft,
): FightWorkflowDraft {
  return applyQuickFightPreset(draft, "quick.custom");
}

export interface ResolvedQuickFightWorkflow {
  readonly snapshot: ConfirmedFightWorkflow;
  readonly match: ResolvedMatchConfiguration;
  readonly playerCharacterIds: readonly string[];
  readonly opponentCharacterIds: readonly string[];
}

export interface QuickFightWorkflowLaunchResult {
  readonly resolved: ResolvedQuickFightWorkflow | null;
  readonly issues: readonly FightWorkflowIssue[];
}

function orderedInstanceIds(
  draft: FightWorkflowDraft,
  side: FightWorkflowSide,
) {
  const selection = draft.selections[side];
  return [
    selection.starterInstanceId!,
    ...selection.instanceIds.filter(
      (instanceId) => instanceId !== selection.starterInstanceId,
    ),
  ];
}

export function resolveQuickFightWorkflow(
  draft: FightWorkflowDraft,
  confirmationId = `lineup.${draft.id}`,
): QuickFightWorkflowLaunchResult {
  const confirmation = confirmFightWorkflow(draft, confirmationId);
  if (!confirmation.snapshot) {
    return { resolved: null, issues: confirmation.issues };
  }
  const snapshot = confirmation.snapshot;
  const fighterByInstanceId = new Map(
    [
      ...draft.policy.player.eligibleFighters,
      ...draft.policy.opponent.eligibleFighters,
    ].map((fighter) => [fighter.instanceId, fighter]),
  );
  const resolveSide = (side: FightWorkflowSide) => ({
    fighters: orderedInstanceIds(draft, side).map((instanceId) => {
      const fighter = fighterByInstanceId.get(instanceId);
      const build = draft.settings.builds[instanceId] ?? fighter?.build;
      if (!fighter || !build) {
        throw new Error(
          `Confirmed Quick Fight instance is not eligible: ${instanceId}`,
        );
      }
      return {
        instanceId,
        characterId: fighter.characterId,
        build: buildWithModificationEffect(build),
      };
    }),
    accessoryId: draft.selections[side].accessoryId,
    startingCharge:
      side === "player"
        ? draft.settings.playerStartingCharge
        : draft.settings.opponentStartingCharge,
  });
  const match = createResolvedMatchConfiguration(
    {
      id: confirmationId,
      mode: "quick",
      presetId: draft.settings.presetId,
      difficulty: draft.settings.difficulty,
      timeLimitMs: draft.settings.timeLimitMs,
      seed: draft.settings.seed,
      player: resolveSide("player"),
      opponent: resolveSide("opponent"),
    },
    combatContent,
  );
  return {
    resolved: Object.freeze({
      snapshot,
      match,
      playerCharacterIds: Object.freeze(
        match.player.fighters.map((fighter) => fighter.characterId),
      ),
      opponentCharacterIds: Object.freeze(
        match.opponent.fighters.map((fighter) => fighter.characterId),
      ),
    }),
    issues: Object.freeze([]),
  };
}

export function launchQuickFightWorkflow(
  draft: FightWorkflowDraft,
  launch: (resolved: ResolvedQuickFightWorkflow) => void,
): QuickFightWorkflowLaunchResult {
  const result = resolveQuickFightWorkflow(draft);
  if (result.resolved) launch(result.resolved);
  return result;
}

const buildStats: readonly (keyof StatBlock)[] = [
  "health",
  "power",
  "evasion",
  "fortune",
  "tempo",
];

function quickBuild(
  draft: FightWorkflowDraft,
  instanceId: string,
): CombatantBuild {
  const build = draft.settings.builds[instanceId];
  if (!build) throw new Error(`Missing Quick Fight build: ${instanceId}`);
  return build;
}

function applyBuild(
  draft: FightWorkflowDraft,
  instanceId: string,
  build: CombatantBuild,
): FightWorkflowDraft {
  const transition = setFightWorkflowBuild(draft, instanceId, build);
  if (transition.issues[0]) throw new Error(transition.issues[0].message);
  return markQuickFightCustom(transition.draft);
}

export function adjustQuickFightBuildLevel(
  draft: FightWorkflowDraft,
  instanceId: string,
  delta: -1 | 1,
): FightWorkflowDraft {
  const build = quickBuild(draft, instanceId);
  const level = Math.max(1, Math.min(25, (build.level ?? 1) + delta));
  const statBonuses = { ...build.statBonuses };
  let spent = buildStats.reduce(
    (sum, stat) => sum + (statBonuses[stat] ?? 0),
    0,
  );
  const budget = level - 1;
  for (const stat of [...buildStats].reverse()) {
    while (spent > budget && (statBonuses[stat] ?? 0) > 0) {
      statBonuses[stat] = (statBonuses[stat] ?? 0) - 1;
      spent -= 1;
    }
  }
  const fighter = [
    ...draft.policy.player.eligibleFighters,
    ...draft.policy.opponent.eligibleFighters,
  ].find((candidate) => candidate.instanceId === instanceId);
  const character = fighter
    ? combatContent.characters[fighter.characterId]
    : undefined;
  if (!character) throw new Error(`Missing Quick Fight fighter: ${instanceId}`);
  return applyBuild(draft, instanceId, {
    ...build,
    level,
    statBonuses,
    equippedPatchId: level < 5 ? null : build.equippedPatchId,
    actionIds:
      level < 10
        ? ([...character.actionIds] as [string, string, string])
        : build.actionIds,
    actionPositions: level < 10 ? {} : build.actionPositions,
    actionTiers:
      level < 10
        ? Object.fromEntries(
            character.actionIds.map((actionId) => [actionId, "stock"]),
          )
        : build.actionTiers,
  });
}

export function adjustQuickFightBuildStat(
  draft: FightWorkflowDraft,
  instanceId: string,
  stat: keyof StatBlock,
  delta: -1 | 1,
): FightWorkflowDraft {
  const build = quickBuild(draft, instanceId);
  const statBonuses = { ...build.statBonuses };
  const spent = buildStats.reduce(
    (sum, key) => sum + (statBonuses[key] ?? 0),
    0,
  );
  const next = (statBonuses[stat] ?? 0) + delta;
  if (next < 0 || (delta > 0 && spent >= (build.level ?? 1) - 1)) return draft;
  statBonuses[stat] = next;
  return applyBuild(draft, instanceId, { ...build, statBonuses });
}

export function moveQuickFightBuildAction(
  draft: FightWorkflowDraft,
  instanceId: string,
  actionId: string,
  direction: -1 | 1,
): FightWorkflowDraft {
  const build = quickBuild(draft, instanceId);
  if ((build.level ?? 1) < 10) {
    throw new Error("Move ordering unlocks at level 10");
  }
  const actionIds = [...(build.actionIds ?? [])] as [string, string, string];
  const current = actionIds.indexOf(actionId);
  const target = current + direction;
  if (current < 0 || target < 0 || target >= actionIds.length) return draft;
  [actionIds[current], actionIds[target]] = [
    actionIds[target]!,
    actionIds[current]!,
  ];
  return applyBuild(draft, instanceId, { ...build, actionIds });
}

export function cycleQuickFightBuildTier(
  draft: FightWorkflowDraft,
  instanceId: string,
  actionId: string,
): FightWorkflowDraft {
  const build = quickBuild(draft, instanceId);
  if ((build.level ?? 1) < 10) {
    throw new Error("Move enhancement unlocks at level 10");
  }
  const tiers: readonly ActionTier[] = ["stock", "gold", "platinum"];
  const current = build.actionTiers?.[actionId] ?? "stock";
  const next = tiers[(tiers.indexOf(current) + 1) % tiers.length]!;
  return applyBuild(draft, instanceId, {
    ...build,
    actionTiers: { ...build.actionTiers, [actionId]: next },
  });
}

export function setQuickFightBuildPatch(
  draft: FightWorkflowDraft,
  instanceId: string,
  patchId: string | null,
): FightWorkflowDraft {
  if (patchId && !patches.some((patch) => patch.id === patchId)) {
    throw new Error(`Unknown Modification: ${patchId}`);
  }
  const build = quickBuild(draft, instanceId);
  if (patchId && (build.level ?? 1) < 5) {
    throw new Error("Modification slots unlock at level 5");
  }
  return applyBuild(draft, instanceId, { ...build, equippedPatchId: patchId });
}
