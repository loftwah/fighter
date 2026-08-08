import { createStandardBuild } from "../combat/standard-build";
import type {
  ActionTier,
  CombatantBuild,
  Difficulty,
  StatBlock,
} from "../combat/types";
import { combatContent } from "../content/initial-content";
import type { TournamentCaseBuild } from "../persistence/save";
import { patches } from "../progression/patches";
import { tournamentDefinition } from "../tournaments/catalog";

export type TournamentWorkflowStage =
  "choice" | "roster" | "settings" | "deployment";

export interface TournamentFightOverrideDraft {
  readonly timeLimitMs?: number;
  readonly playerStartingCharge?: number;
  readonly opponentStartingCharge?: number;
}

export interface TournamentSettingsDraft {
  readonly difficulty: Difficulty;
  readonly timeLimitMs: number;
  readonly playerStartingCharge: number;
  readonly opponentStartingCharge: number;
  readonly fightOverrides: Readonly<
    Record<string, TournamentFightOverrideDraft>
  >;
}

export interface TournamentRosterCandidate extends TournamentCaseBuild {
  readonly portraitAssetId: string;
}

export interface TournamentWorkflowDraft {
  readonly tournamentId: string;
  readonly stage: TournamentWorkflowStage;
  readonly catalogue: readonly TournamentRosterCandidate[];
  readonly rosterInstanceIds: readonly string[];
  readonly builds: Readonly<Record<string, TournamentCaseBuild>>;
  readonly settings: TournamentSettingsDraft;
  readonly customVariant: boolean;
}

const SANDBOX_COPIES_PER_CHARACTER = 6;
const BUILD_STATS = [
  "health",
  "power",
  "evasion",
  "fortune",
  "tempo",
] as const satisfies readonly (keyof StatBlock)[];

function freezeBuild(build: TournamentCaseBuild): TournamentCaseBuild {
  return Object.freeze({
    ...build,
    statBonuses: Object.freeze({ ...build.statBonuses }),
    actionIds: Object.freeze([...build.actionIds]) as unknown as [
      string,
      string,
      string,
    ],
    actionPositions: Object.freeze({ ...build.actionPositions }),
    actionTiers: Object.freeze({ ...build.actionTiers }),
  });
}

function tournamentBuild(
  characterId: string,
  copyIndex: number,
): TournamentRosterCandidate {
  const character = combatContent.characters[characterId];
  if (!character)
    throw new Error(`Unknown Tournament Character ${characterId}`);
  const instanceId = `tournament.sandbox.${characterId}.${copyIndex + 1}`;
  const standard = createStandardBuild(character, "player", copyIndex);
  return Object.freeze({
    ...freezeBuild({
      ...standard,
      instanceId,
      characterId,
      level: standard.level ?? character.level,
      statBonuses: {
        health: standard.statBonuses?.health ?? 0,
        power: standard.statBonuses?.power ?? 0,
        evasion: standard.statBonuses?.evasion ?? 0,
        fortune: standard.statBonuses?.fortune ?? 0,
        tempo: standard.statBonuses?.tempo ?? 0,
      },
      actionIds: [...character.actionIds],
      actionPositions: { ...standard.actionPositions },
      actionTiers: Object.fromEntries(
        character.actionIds.map((actionId) => [
          actionId,
          standard.actionTiers?.[actionId] ?? "stock",
        ]),
      ),
      interruptionResistance: standard.interruptionResistance ?? 0,
      equippedPatchId: standard.equippedPatchId ?? null,
    }),
    portraitAssetId: character.portraitAssetId,
  });
}

export function tournamentSandboxCatalogue(): readonly TournamentRosterCandidate[] {
  return Object.freeze(
    Object.keys(combatContent.characters).flatMap((characterId) =>
      Array.from({ length: SANDBOX_COPIES_PER_CHARACTER }, (_, copyIndex) =>
        tournamentBuild(characterId, copyIndex),
      ),
    ),
  );
}

function freezeDraft(source: TournamentWorkflowDraft): TournamentWorkflowDraft {
  return Object.freeze({
    ...source,
    catalogue: Object.freeze([...source.catalogue]),
    rosterInstanceIds: Object.freeze([...source.rosterInstanceIds]),
    builds: Object.freeze(
      Object.fromEntries(
        Object.entries(source.builds).map(([id, build]) => [
          id,
          freezeBuild(build),
        ]),
      ),
    ),
    settings: Object.freeze({
      ...source.settings,
      fightOverrides: Object.freeze(
        Object.fromEntries(
          Object.entries(source.settings.fightOverrides).map(([id, value]) => [
            id,
            Object.freeze({ ...value }),
          ]),
        ),
      ),
    }),
  });
}

export function createTournamentWorkflow(
  preferredDifficulty: Difficulty,
  tournamentId = "tournament.cheap-seats",
): TournamentWorkflowDraft {
  const definition = tournamentDefinition(tournamentId);
  const catalogue = tournamentSandboxCatalogue();
  return freezeDraft({
    tournamentId,
    stage: "choice",
    catalogue,
    rosterInstanceIds: [],
    builds: Object.fromEntries(
      catalogue.map((candidate) => [candidate.instanceId, candidate]),
    ),
    settings: {
      difficulty: definition.matchDefaults.difficulty ?? preferredDifficulty,
      timeLimitMs: definition.matchDefaults.timeLimitMs,
      playerStartingCharge: definition.matchDefaults.playerStartingCharge,
      opponentStartingCharge: definition.matchDefaults.opponentStartingCharge,
      fightOverrides: {},
    },
    customVariant: false,
  });
}

export function enterTournamentStage(
  draft: TournamentWorkflowDraft,
  stage: TournamentWorkflowStage,
): TournamentWorkflowDraft {
  if (stage === "settings" && draft.rosterInstanceIds.length === 0) {
    throw new Error(
      "Choose at least one Character before Tournament Settings.",
    );
  }
  return freezeDraft({ ...draft, stage });
}

export function toggleTournamentRosterInstance(
  draft: TournamentWorkflowDraft,
  instanceId: string,
): TournamentWorkflowDraft {
  if (
    !draft.catalogue.some((candidate) => candidate.instanceId === instanceId)
  ) {
    throw new Error(
      "That Character instance is not in the Tournament catalogue.",
    );
  }
  const selected = draft.rosterInstanceIds.includes(instanceId);
  if (!selected && draft.rosterInstanceIds.length >= 6) {
    throw new Error("A Tournament Roster can contain up to six Characters.");
  }
  const rosterInstanceIds = selected
    ? draft.rosterInstanceIds.filter((id) => id !== instanceId)
    : [...draft.rosterInstanceIds, instanceId];
  return freezeDraft({ ...draft, rosterInstanceIds });
}

export function setTournamentBuildLevel(
  draft: TournamentWorkflowDraft,
  instanceId: string,
  level: number,
): TournamentWorkflowDraft {
  if (!draft.rosterInstanceIds.includes(instanceId)) {
    throw new Error("Only a selected Roster Character can be configured.");
  }
  const current = draft.builds[instanceId];
  if (!current) throw new Error("Tournament build is missing.");
  const boundedLevel = Math.max(1, Math.min(25, Math.round(level)));
  const statBonuses = { ...current.statBonuses };
  let spent = BUILD_STATS.reduce((sum, stat) => sum + statBonuses[stat], 0);
  const budget = boundedLevel - 1;
  for (const stat of [...BUILD_STATS].reverse()) {
    while (spent > budget && statBonuses[stat] > 0) {
      statBonuses[stat] -= 1;
      spent -= 1;
    }
  }
  const next: TournamentCaseBuild = {
    ...current,
    level: boundedLevel,
    statBonuses,
    equippedPatchId: boundedLevel >= 5 ? current.equippedPatchId : null,
    actionTiers:
      boundedLevel >= 10
        ? current.actionTiers
        : Object.fromEntries(current.actionIds.map((id) => [id, "stock"])),
    actionPositions: boundedLevel >= 10 ? current.actionPositions : {},
  };
  return freezeDraft({
    ...draft,
    builds: { ...draft.builds, [instanceId]: next },
  });
}

function editableTournamentBuild(
  draft: TournamentWorkflowDraft,
  instanceId: string,
): TournamentCaseBuild {
  if (!draft.rosterInstanceIds.includes(instanceId)) {
    throw new Error("Only a selected Roster Character can be configured.");
  }
  const build = draft.builds[instanceId];
  if (!build) throw new Error("Tournament build is missing.");
  return build;
}

function replaceTournamentBuild(
  draft: TournamentWorkflowDraft,
  instanceId: string,
  build: TournamentCaseBuild,
): TournamentWorkflowDraft {
  return freezeDraft({
    ...draft,
    builds: { ...draft.builds, [instanceId]: build },
  });
}

export function adjustTournamentBuildStat(
  draft: TournamentWorkflowDraft,
  instanceId: string,
  stat: keyof StatBlock,
  delta: -1 | 1,
): TournamentWorkflowDraft {
  if (!BUILD_STATS.includes(stat)) throw new Error("Unknown build stat.");
  const build = editableTournamentBuild(draft, instanceId);
  const spent = BUILD_STATS.reduce(
    (sum, key) => sum + build.statBonuses[key],
    0,
  );
  const next = build.statBonuses[stat] + delta;
  if (next < 0 || (delta > 0 && spent >= build.level - 1)) return draft;
  return replaceTournamentBuild(draft, instanceId, {
    ...build,
    statBonuses: { ...build.statBonuses, [stat]: next },
  });
}

export function moveTournamentBuildAction(
  draft: TournamentWorkflowDraft,
  instanceId: string,
  actionId: string,
  direction: -1 | 1,
): TournamentWorkflowDraft {
  const build = editableTournamentBuild(draft, instanceId);
  if (build.level < 10) throw new Error("Move ordering unlocks at level 10.");
  const actionIds = [...build.actionIds] as [string, string, string];
  const current = actionIds.indexOf(actionId);
  const target = current + direction;
  if (current < 0 || target < 0 || target >= actionIds.length) return draft;
  [actionIds[current], actionIds[target]] = [
    actionIds[target]!,
    actionIds[current]!,
  ];
  return replaceTournamentBuild(draft, instanceId, { ...build, actionIds });
}

export function cycleTournamentBuildTier(
  draft: TournamentWorkflowDraft,
  instanceId: string,
  actionId: string,
): TournamentWorkflowDraft {
  const build = editableTournamentBuild(draft, instanceId);
  if (build.level < 10)
    throw new Error("Move enhancement unlocks at level 10.");
  if (!build.actionIds.includes(actionId))
    throw new Error("Unknown build Move.");
  const tiers: readonly ActionTier[] = ["stock", "gold", "platinum"];
  const current = build.actionTiers[actionId] ?? "stock";
  const next = tiers[(tiers.indexOf(current) + 1) % tiers.length]!;
  return replaceTournamentBuild(draft, instanceId, {
    ...build,
    actionTiers: { ...build.actionTiers, [actionId]: next },
  });
}

export function setTournamentBuildPatch(
  draft: TournamentWorkflowDraft,
  instanceId: string,
  patchId: string | null,
): TournamentWorkflowDraft {
  const build = editableTournamentBuild(draft, instanceId);
  if (patchId && !patches.some((patch) => patch.id === patchId)) {
    throw new Error(`Unknown Modification: ${patchId}`);
  }
  if (patchId && build.level < 5) {
    throw new Error("Modification slots unlock at level 5.");
  }
  return replaceTournamentBuild(draft, instanceId, {
    ...build,
    equippedPatchId: patchId,
  });
}

export function setTournamentDefault(
  draft: TournamentWorkflowDraft,
  field:
    | "difficulty"
    | "timeLimitMs"
    | "playerStartingCharge"
    | "opponentStartingCharge",
  value: Difficulty | number,
): TournamentWorkflowDraft {
  const definition = tournamentDefinition(draft.tournamentId);
  const settings = { ...draft.settings, [field]: value };
  const customVariant =
    settings.difficulty !==
      (definition.matchDefaults.difficulty ?? draft.settings.difficulty) ||
    settings.timeLimitMs !== definition.matchDefaults.timeLimitMs ||
    settings.playerStartingCharge !==
      definition.matchDefaults.playerStartingCharge ||
    settings.opponentStartingCharge !==
      definition.matchDefaults.opponentStartingCharge ||
    Object.keys(settings.fightOverrides).length > 0;
  return freezeDraft({ ...draft, settings, customVariant });
}

export function setTournamentFightOverride(
  draft: TournamentWorkflowDraft,
  nodeId: string,
  field: "timeLimitMs" | "playerStartingCharge" | "opponentStartingCharge",
  value: number | null,
): TournamentWorkflowDraft {
  const current = { ...(draft.settings.fightOverrides[nodeId] ?? {}) };
  if (value === null) delete current[field];
  else current[field] = value;
  const fightOverrides = { ...draft.settings.fightOverrides };
  if (Object.keys(current).length === 0) delete fightOverrides[nodeId];
  else fightOverrides[nodeId] = current;
  return freezeDraft({
    ...draft,
    settings: { ...draft.settings, fightOverrides },
    customVariant:
      Object.keys(fightOverrides).length > 0 || draft.customVariant,
  });
}

export function lockedTournamentRoster(
  draft: TournamentWorkflowDraft,
): TournamentCaseBuild[] {
  if (
    draft.rosterInstanceIds.length < 1 ||
    draft.rosterInstanceIds.length > 6
  ) {
    throw new Error("Lock one to six unique Character instances.");
  }
  return draft.rosterInstanceIds.map((instanceId) => {
    const build = draft.builds[instanceId];
    if (!build) throw new Error("A selected Tournament build is missing.");
    return structuredClone(build);
  });
}

export function combatantBuildForTournament(
  build: TournamentCaseBuild,
): CombatantBuild {
  return structuredClone(build);
}
