import type { LineupConfirmation } from "./match-entry";
import type { CombatantBuild, Difficulty } from "../combat/types";

export const fightWorkflowModes = ["quick", "story", "tournament"] as const;
export type FightWorkflowMode = (typeof fightWorkflowModes)[number];

export const fightWorkflowSides = ["player", "opponent"] as const;
export type FightWorkflowSide = (typeof fightWorkflowSides)[number];

export const fightWorkflowSteps = ["fighters", "settings", "confirm"] as const;
export type FightWorkflowStep = (typeof fightWorkflowSteps)[number];

export type FightWorkflowSettingsPolicy = "required" | "optional" | "locked";

export const fightWorkflowSettingFields = [
  "difficulty",
  "timeLimit",
  "startingCharge",
  "builds",
  "seed",
] as const;
export type FightWorkflowSettingField =
  (typeof fightWorkflowSettingFields)[number];

export interface FightWorkflowFighter {
  readonly instanceId: string;
  readonly characterId: string;
  readonly build?: CombatantBuild;
}

interface FightWorkflowSidePolicyBase {
  readonly eligibleFighters: readonly FightWorkflowFighter[];
}

export interface EditableFightWorkflowSidePolicy extends FightWorkflowSidePolicyBase {
  readonly locked: false;
}

export interface LockedFightWorkflowSidePolicy extends FightWorkflowSidePolicyBase {
  readonly locked: true;
  readonly requiredSelection: FightWorkflowSelection;
}

export type FightWorkflowSidePolicy =
  EditableFightWorkflowSidePolicy | LockedFightWorkflowSidePolicy;

interface QuickFightWorkflowPolicy {
  readonly mode: "quick";
  readonly player: FightWorkflowSidePolicy;
  readonly opponent: FightWorkflowSidePolicy;
  readonly settings: FightWorkflowSettingsPolicy;
  readonly editableSettings: readonly FightWorkflowSettingField[];
}

interface AuthoredFightWorkflowPolicy {
  readonly mode: "story" | "tournament";
  readonly player: FightWorkflowSidePolicy;
  readonly opponent: LockedFightWorkflowSidePolicy;
  readonly settings: "locked";
}

export type FightWorkflowPolicy =
  QuickFightWorkflowPolicy | AuthoredFightWorkflowPolicy;

export interface FightWorkflowSelection {
  readonly instanceIds: readonly string[];
  readonly starterInstanceId: string | null;
  /** Team equipment belongs to the prepared Lineup, not Match Settings. */
  readonly accessoryId: string | null;
}

export interface FightWorkflowSettings {
  readonly presetId: string | null;
  readonly difficulty: Difficulty;
  readonly timeLimitMs: number;
  readonly playerStartingCharge: number;
  readonly opponentStartingCharge: number;
  readonly seed: number;
  readonly builds: Readonly<Record<string, CombatantBuild>>;
}

export interface FightWorkflowDraft {
  readonly id: string;
  readonly mode: FightWorkflowMode;
  readonly step: FightWorkflowStep;
  readonly policy: FightWorkflowPolicy;
  readonly selections: Readonly<
    Record<FightWorkflowSide, FightWorkflowSelection>
  >;
  readonly settings: FightWorkflowSettings;
}

export interface CreateFightWorkflowDraftInput {
  readonly id: string;
  readonly policy: FightWorkflowPolicy;
  readonly player?: Partial<FightWorkflowSelection>;
  readonly opponent?: Partial<FightWorkflowSelection>;
  readonly settings?: Partial<FightWorkflowSettings>;
  readonly step?: FightWorkflowStep;
}

export const fightWorkflowIssueCodes = [
  "draft-id-required",
  "lineup-empty",
  "lineup-full",
  "duplicate-instance",
  "instance-used-by-other-side",
  "ineligible-instance",
  "starter-required",
  "starter-not-selected",
  "locked-side",
  "locked-selection-mismatch",
  "fighters-step-required",
  "settings-step-unavailable",
  "confirmation-step-required",
  "workflow-complete",
  "confirmation-id-required",
  "setting-locked",
  "invalid-setting",
  "build-instance-ineligible",
] as const;

export type FightWorkflowIssueCode = (typeof fightWorkflowIssueCodes)[number];

export interface FightWorkflowIssue {
  readonly code: FightWorkflowIssueCode;
  readonly message: string;
  readonly side?: FightWorkflowSide;
  readonly instanceId?: string;
}

export interface FightWorkflowTransition {
  readonly draft: FightWorkflowDraft;
  readonly issues: readonly FightWorkflowIssue[];
}

export interface ConfirmedFightWorkflow {
  readonly id: string;
  readonly draftId: string;
  readonly mode: FightWorkflowMode;
  readonly player: FightWorkflowSelection;
  readonly opponent: FightWorkflowSelection;
  readonly settings: FightWorkflowSettings;
  readonly lineup: LineupConfirmation;
}

export interface FightWorkflowConfirmationResult {
  readonly snapshot: ConfirmedFightWorkflow | null;
  readonly issues: readonly FightWorkflowIssue[];
}

const sideLabels: Record<FightWorkflowSide, string> = {
  player: "Your Lineup",
  opponent: "Opponent Lineup",
};

function freezeFighter(
  source: FightWorkflowFighter,
): Readonly<FightWorkflowFighter> {
  return Object.freeze({
    instanceId: source.instanceId,
    characterId: source.characterId,
    build: source.build
      ? freezeBuild(source.build, source.instanceId)
      : undefined,
  });
}

function freezeBuild(
  source: CombatantBuild,
  instanceId = source.instanceId,
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
    statBonuses: Object.freeze({ ...source.statBonuses }),
    actionIds,
    actionPositions: Object.freeze({ ...source.actionPositions }),
    actionTiers: Object.freeze({ ...source.actionTiers }),
  });
}

function freezeSidePolicy(
  source: FightWorkflowSidePolicy,
): FightWorkflowSidePolicy {
  const eligibleFighters = Object.freeze(
    source.eligibleFighters.map(freezeFighter),
  );
  if (!source.locked) {
    return Object.freeze({ locked: false, eligibleFighters });
  }

  const requiredSelection = freezeSelection(source.requiredSelection);
  const eligibleIds = new Set(
    eligibleFighters.map((fighter) => fighter.instanceId),
  );
  if (
    requiredSelection.instanceIds.length < 1 ||
    requiredSelection.instanceIds.length > 3 ||
    new Set(requiredSelection.instanceIds).size !==
      requiredSelection.instanceIds.length ||
    requiredSelection.instanceIds.some(
      (instanceId) => !eligibleIds.has(instanceId),
    ) ||
    !requiredSelection.starterInstanceId ||
    !requiredSelection.instanceIds.includes(requiredSelection.starterInstanceId)
  ) {
    throw new Error(
      "A locked side requires one to three eligible fighters and a selected starter",
    );
  }
  return Object.freeze({
    locked: true,
    eligibleFighters,
    requiredSelection,
  });
}

function freezePolicy(source: FightWorkflowPolicy): FightWorkflowPolicy {
  const player = freezeSidePolicy(source.player);
  const opponent = freezeSidePolicy(source.opponent);
  const eligibleInstanceIds = [
    ...player.eligibleFighters,
    ...opponent.eligibleFighters,
  ].map((fighter) => fighter.instanceId);

  for (const side of fightWorkflowSides) {
    const policy = side === "player" ? player : opponent;
    if (
      policy.eligibleFighters.some(
        (fighter) =>
          !fighter.instanceId.trim() ||
          fighter.instanceId !== fighter.instanceId.trim() ||
          !fighter.characterId.trim() ||
          fighter.characterId !== fighter.characterId.trim(),
      )
    ) {
      throw new Error(`${sideLabels[side]} eligibility requires stable IDs`);
    }
  }
  if (new Set(eligibleInstanceIds).size !== eligibleInstanceIds.length) {
    throw new Error("Eligible fighter instance IDs must be globally unique");
  }
  if (
    source.mode !== "quick" &&
    (!opponent.locked || source.settings !== "locked")
  ) {
    throw new Error(
      "Story and Tournament own the opponent and Match Settings policy",
    );
  }

  if (source.mode === "quick") {
    if (
      source.editableSettings.some(
        (field) => !fightWorkflowSettingFields.includes(field),
      )
    ) {
      throw new Error("Quick Fight exposes an unknown Match Setting field");
    }
    return Object.freeze({
      mode: source.mode,
      player,
      opponent,
      settings: source.settings,
      editableSettings: Object.freeze([...source.editableSettings]),
    });
  }
  return Object.freeze({
    mode: source.mode,
    player,
    opponent: opponent as LockedFightWorkflowSidePolicy,
    settings: "locked" as const,
  });
}

function freezeSelection(
  source?: Partial<FightWorkflowSelection>,
): FightWorkflowSelection {
  return Object.freeze({
    instanceIds: Object.freeze([...(source?.instanceIds ?? [])]),
    starterInstanceId: source?.starterInstanceId ?? null,
    accessoryId: source?.accessoryId?.trim() || null,
  });
}

function freezeSettings(
  source?: Partial<FightWorkflowSettings>,
): FightWorkflowSettings {
  const builds = Object.fromEntries(
    Object.entries(source?.builds ?? {}).map(([instanceId, build]) => [
      instanceId,
      freezeBuild(build, instanceId),
    ]),
  );
  return Object.freeze({
    presetId: source?.presetId?.trim() || null,
    difficulty: source?.difficulty ?? "normal",
    timeLimitMs: source?.timeLimitMs ?? 90_000,
    playerStartingCharge: source?.playerStartingCharge ?? 0,
    opponentStartingCharge: source?.opponentStartingCharge ?? 0,
    seed: source?.seed ?? 1,
    builds: Object.freeze(builds),
  });
}

function freezeDraft(source: {
  id: string;
  mode: FightWorkflowMode;
  step: FightWorkflowStep;
  policy: FightWorkflowPolicy;
  selections: Record<FightWorkflowSide, FightWorkflowSelection>;
  settings: FightWorkflowSettings;
}): FightWorkflowDraft {
  return Object.freeze({
    id: source.id,
    mode: source.mode,
    step: source.step,
    policy: source.policy,
    selections: Object.freeze({
      player: freezeSelection(source.selections.player),
      opponent: freezeSelection(source.selections.opponent),
    }),
    settings: freezeSettings(source.settings),
  });
}

export function createFightWorkflowDraft(
  input: CreateFightWorkflowDraftInput,
): FightWorkflowDraft {
  const policy = freezePolicy(input.policy);
  const selectionFor = (
    side: FightWorkflowSide,
    supplied: Partial<FightWorkflowSelection> | undefined,
  ): FightWorkflowSelection => {
    const sideRule = policy[side];
    if (!sideRule.locked) return freezeSelection(supplied);
    if (supplied) {
      const candidate = freezeSelection(supplied);
      if (
        candidate.starterInstanceId !==
          sideRule.requiredSelection.starterInstanceId ||
        candidate.accessoryId !== sideRule.requiredSelection.accessoryId ||
        candidate.instanceIds.length !==
          sideRule.requiredSelection.instanceIds.length ||
        candidate.instanceIds.some(
          (instanceId, index) =>
            instanceId !== sideRule.requiredSelection.instanceIds[index],
        )
      ) {
        throw new Error(
          `${sideLabels[side]} does not match its locked composition`,
        );
      }
    }
    return freezeSelection(sideRule.requiredSelection);
  };
  const draft = freezeDraft({
    id: input.id.trim(),
    mode: policy.mode,
    step: input.step ?? "fighters",
    policy,
    selections: {
      player: selectionFor("player", input.player),
      opponent: selectionFor("opponent", input.opponent),
    },
    settings: freezeSettings(input.settings),
  });
  if (draft.step === "settings" && policy.settings === "locked") {
    throw new Error("This mode does not expose editable Match Settings");
  }
  if (draft.step !== "fighters") {
    const issues = validateFightWorkflowDraft(draft);
    if (issues.length > 0) {
      throw new Error(
        `A ${draft.step} Fight Workflow draft must contain a complete match: ${issues[0]?.message}`,
      );
    }
  }
  return draft;
}

function issue(
  code: FightWorkflowIssueCode,
  message: string,
  details: Pick<FightWorkflowIssue, "side" | "instanceId"> = {},
): FightWorkflowIssue {
  return Object.freeze({ code, message, ...details });
}

function unchanged(
  draft: FightWorkflowDraft,
  workflowIssue: FightWorkflowIssue,
): FightWorkflowTransition {
  return Object.freeze({
    draft,
    issues: Object.freeze([workflowIssue]),
  });
}

function changed(draft: FightWorkflowDraft): FightWorkflowTransition {
  return Object.freeze({ draft, issues: Object.freeze([]) });
}

function sidePolicy(
  draft: FightWorkflowDraft,
  side: FightWorkflowSide,
): FightWorkflowSidePolicy {
  return draft.policy[side];
}

function replaceSelection(
  draft: FightWorkflowDraft,
  side: FightWorkflowSide,
  selection: FightWorkflowSelection,
): FightWorkflowDraft {
  return freezeDraft({
    ...draft,
    selections: {
      ...draft.selections,
      [side]: selection,
    },
  });
}

function editingIssue(
  draft: FightWorkflowDraft,
  side: FightWorkflowSide,
): FightWorkflowIssue | null {
  if (draft.step !== "fighters") {
    return issue(
      "fighters-step-required",
      "Return to Fighter Select before changing a Lineup.",
      { side },
    );
  }
  if (sidePolicy(draft, side).locked) {
    return issue(
      "locked-side",
      `${sideLabels[side]} is locked for this fight.`,
      { side },
    );
  }
  return null;
}

export function addFightWorkflowFighter(
  draft: FightWorkflowDraft,
  side: FightWorkflowSide,
  instanceId: string,
): FightWorkflowTransition {
  const blocked = editingIssue(draft, side);
  if (blocked) return unchanged(draft, blocked);

  const candidate = instanceId.trim();
  const selection = draft.selections[side];
  if (
    !sidePolicy(draft, side).eligibleFighters.some(
      (fighter) => fighter.instanceId === candidate,
    )
  ) {
    return unchanged(
      draft,
      issue(
        "ineligible-instance",
        `That fighter is not available for ${sideLabels[side]}.`,
        { side, instanceId: candidate },
      ),
    );
  }
  if (selection.instanceIds.includes(candidate)) {
    return unchanged(
      draft,
      issue(
        "duplicate-instance",
        `That fighter instance is already in ${sideLabels[side]}.`,
        { side, instanceId: candidate },
      ),
    );
  }
  const otherSide: FightWorkflowSide =
    side === "player" ? "opponent" : "player";
  if (draft.selections[otherSide].instanceIds.includes(candidate)) {
    return unchanged(
      draft,
      issue(
        "instance-used-by-other-side",
        "The same fighter instance cannot fight on both sides.",
        { side, instanceId: candidate },
      ),
    );
  }
  if (selection.instanceIds.length >= 3) {
    return unchanged(
      draft,
      issue(
        "lineup-full",
        `${sideLabels[side]} can contain up to three fighters.`,
        {
          side,
          instanceId: candidate,
        },
      ),
    );
  }

  const instanceIds = [...selection.instanceIds, candidate];
  return changed(
    replaceSelection(
      draft,
      side,
      freezeSelection({
        ...selection,
        instanceIds,
        starterInstanceId: selection.starterInstanceId ?? candidate,
      }),
    ),
  );
}

export function removeFightWorkflowFighter(
  draft: FightWorkflowDraft,
  side: FightWorkflowSide,
  instanceId: string,
): FightWorkflowTransition {
  const blocked = editingIssue(draft, side);
  if (blocked) return unchanged(draft, blocked);

  const candidate = instanceId.trim();
  const selection = draft.selections[side];
  if (!selection.instanceIds.includes(candidate)) {
    return unchanged(
      draft,
      issue(
        "ineligible-instance",
        `That fighter is not selected for ${sideLabels[side]}.`,
        { side, instanceId: candidate },
      ),
    );
  }
  const instanceIds = selection.instanceIds.filter(
    (selectedId) => selectedId !== candidate,
  );
  return changed(
    replaceSelection(
      draft,
      side,
      freezeSelection({
        ...selection,
        instanceIds,
        starterInstanceId:
          selection.starterInstanceId === candidate
            ? (instanceIds[0] ?? null)
            : selection.starterInstanceId,
      }),
    ),
  );
}

export function setFightWorkflowStarter(
  draft: FightWorkflowDraft,
  side: FightWorkflowSide,
  instanceId: string,
): FightWorkflowTransition {
  const blocked = editingIssue(draft, side);
  if (blocked) return unchanged(draft, blocked);

  const candidate = instanceId.trim();
  if (!draft.selections[side].instanceIds.includes(candidate)) {
    return unchanged(
      draft,
      issue(
        "starter-not-selected",
        `Choose a selected fighter to start for ${sideLabels[side]}.`,
        { side, instanceId: candidate },
      ),
    );
  }
  return changed(
    replaceSelection(
      draft,
      side,
      freezeSelection({
        ...draft.selections[side],
        starterInstanceId: candidate,
      }),
    ),
  );
}

export function reorderFightWorkflowFighter(
  draft: FightWorkflowDraft,
  side: FightWorkflowSide,
  instanceId: string,
  targetIndex: number,
): FightWorkflowTransition {
  const blocked = editingIssue(draft, side);
  if (blocked) return unchanged(draft, blocked);

  const candidate = instanceId.trim();
  const selection = draft.selections[side];
  if (!selection.instanceIds.includes(candidate)) {
    return unchanged(
      draft,
      issue(
        "starter-not-selected",
        `Choose a fighter in ${sideLabels[side]} before changing its position.`,
        { side, instanceId: candidate },
      ),
    );
  }
  const orderedIds = selection.starterInstanceId
    ? [
        selection.starterInstanceId,
        ...selection.instanceIds.filter(
          (selectedId) => selectedId !== selection.starterInstanceId,
        ),
      ]
    : [...selection.instanceIds];
  const remainingIds = orderedIds.filter(
    (selectedId) => selectedId !== candidate,
  );
  const boundedIndex = Math.max(
    0,
    Math.min(Math.trunc(targetIndex), remainingIds.length),
  );
  remainingIds.splice(boundedIndex, 0, candidate);

  return changed(
    replaceSelection(
      draft,
      side,
      freezeSelection({
        ...selection,
        instanceIds: remainingIds,
        starterInstanceId: remainingIds[0] ?? null,
      }),
    ),
  );
}

export function validateFightWorkflowDraft(
  draft: FightWorkflowDraft,
): readonly FightWorkflowIssue[] {
  const issues: FightWorkflowIssue[] = [];
  if (!draft.id.trim()) {
    issues.push(
      issue("draft-id-required", "This fight draft is missing its identity."),
    );
  }

  for (const side of fightWorkflowSides) {
    const selection = draft.selections[side];
    const eligibleIds = new Set(
      sidePolicy(draft, side).eligibleFighters.map(
        (fighter) => fighter.instanceId,
      ),
    );
    const rule = sidePolicy(draft, side);
    if (selection.instanceIds.length < 1) {
      issues.push(
        issue(
          "lineup-empty",
          `Choose at least one fighter for ${sideLabels[side]}.`,
          { side },
        ),
      );
    } else if (selection.instanceIds.length > 3) {
      issues.push(
        issue(
          "lineup-full",
          `${sideLabels[side]} can contain up to three fighters.`,
          { side },
        ),
      );
    }
    if (new Set(selection.instanceIds).size !== selection.instanceIds.length) {
      issues.push(
        issue(
          "duplicate-instance",
          `${sideLabels[side]} contains the same fighter instance more than once.`,
          { side },
        ),
      );
    }
    if (
      rule.locked &&
      (selection.starterInstanceId !==
        rule.requiredSelection.starterInstanceId ||
        selection.accessoryId !== rule.requiredSelection.accessoryId ||
        selection.instanceIds.length !==
          rule.requiredSelection.instanceIds.length ||
        selection.instanceIds.some(
          (instanceId, index) =>
            instanceId !== rule.requiredSelection.instanceIds[index],
        ))
    ) {
      issues.push(
        issue(
          "locked-selection-mismatch",
          `${sideLabels[side]} does not match the authored Lineup.`,
          { side },
        ),
      );
    }
    for (const instanceId of selection.instanceIds) {
      if (!instanceId.trim() || !eligibleIds.has(instanceId)) {
        issues.push(
          issue(
            "ineligible-instance",
            `A selected fighter is not available for ${sideLabels[side]}.`,
            { side, instanceId },
          ),
        );
      }
    }
    if (selection.instanceIds.length > 0) {
      if (!selection.starterInstanceId) {
        issues.push(
          issue(
            "starter-required",
            `Choose a starter for ${sideLabels[side]}.`,
            { side },
          ),
        );
      } else if (!selection.instanceIds.includes(selection.starterInstanceId)) {
        issues.push(
          issue(
            "starter-not-selected",
            `The starter for ${sideLabels[side]} must be in that Lineup.`,
            { side, instanceId: selection.starterInstanceId },
          ),
        );
      }
    }
  }

  const opponentIds = new Set(draft.selections.opponent.instanceIds);
  for (const instanceId of draft.selections.player.instanceIds) {
    if (opponentIds.has(instanceId)) {
      issues.push(
        issue(
          "instance-used-by-other-side",
          "The same fighter instance cannot fight on both sides.",
          { instanceId },
        ),
      );
    }
  }
  if (
    !Number.isInteger(draft.settings.timeLimitMs) ||
    draft.settings.timeLimitMs < 30_000 ||
    draft.settings.timeLimitMs > 300_000 ||
    !Number.isInteger(draft.settings.seed) ||
    draft.settings.playerStartingCharge < 0 ||
    draft.settings.playerStartingCharge > 100 ||
    draft.settings.opponentStartingCharge < 0 ||
    draft.settings.opponentStartingCharge > 100
  ) {
    issues.push(
      issue(
        "invalid-setting",
        "Match Settings contain a value outside the supported range.",
      ),
    );
  }
  return Object.freeze(issues);
}

function withStep(
  draft: FightWorkflowDraft,
  step: FightWorkflowStep,
): FightWorkflowDraft {
  return freezeDraft({ ...draft, step, selections: { ...draft.selections } });
}

export function advanceFightWorkflow(
  draft: FightWorkflowDraft,
): FightWorkflowTransition {
  if (draft.step === "confirm") {
    return unchanged(
      draft,
      issue("workflow-complete", "This fight is ready for confirmation."),
    );
  }
  if (draft.step === "fighters") {
    const issues = validateFightWorkflowDraft(draft);
    if (issues.length > 0) return Object.freeze({ draft, issues });
    return changed(
      withStep(
        draft,
        draft.policy.settings === "required" ? "settings" : "confirm",
      ),
    );
  }
  const issues = validateFightWorkflowDraft(draft);
  if (issues.length > 0) return Object.freeze({ draft, issues });
  return changed(withStep(draft, "confirm"));
}

export function retreatFightWorkflow(
  draft: FightWorkflowDraft,
): FightWorkflowTransition {
  if (draft.step === "fighters") {
    return unchanged(
      draft,
      issue(
        "fighters-step-required",
        "Fighter Select is the first setup step.",
      ),
    );
  }
  if (draft.step === "settings") {
    return changed(withStep(draft, "fighters"));
  }
  return changed(
    withStep(
      draft,
      draft.policy.settings === "required" ? "settings" : "fighters",
    ),
  );
}

export function openFightWorkflowSettings(
  draft: FightWorkflowDraft,
): FightWorkflowTransition {
  if (draft.policy.settings === "locked") {
    return unchanged(
      draft,
      issue(
        "settings-step-unavailable",
        "Match Settings are owned by this fight and cannot be changed.",
      ),
    );
  }
  const issues = validateFightWorkflowDraft(draft);
  if (issues.length > 0) return Object.freeze({ draft, issues });
  return changed(withStep(draft, "settings"));
}

function replaceSettings(
  draft: FightWorkflowDraft,
  settings: FightWorkflowSettings,
): FightWorkflowDraft {
  return freezeDraft({
    ...draft,
    selections: { ...draft.selections },
    settings,
  });
}

function settingsEditingIssue(
  draft: FightWorkflowDraft,
  field: FightWorkflowSettingField,
): FightWorkflowIssue | null {
  if (
    draft.mode !== "quick" ||
    draft.policy.settings === "locked" ||
    !draft.policy.editableSettings.includes(field)
  ) {
    return issue(
      "setting-locked",
      "That setting is fixed by this match preset.",
    );
  }
  return null;
}

export function setFightWorkflowRule(
  draft: FightWorkflowDraft,
  field:
    | "difficulty"
    | "timeLimitMs"
    | "playerStartingCharge"
    | "opponentStartingCharge"
    | "seed",
  value: Difficulty | number,
): FightWorkflowTransition {
  const policyField: FightWorkflowSettingField =
    field === "timeLimitMs"
      ? "timeLimit"
      : field === "playerStartingCharge" || field === "opponentStartingCharge"
        ? "startingCharge"
        : field;
  const blocked = settingsEditingIssue(draft, policyField);
  if (blocked) return unchanged(draft, blocked);
  const next = freezeSettings({ ...draft.settings, [field]: value });
  const candidate = replaceSettings(draft, next);
  const invalid = validateFightWorkflowDraft(candidate).find(
    (entry) => entry.code === "invalid-setting",
  );
  return invalid ? unchanged(draft, invalid) : changed(candidate);
}

export function setFightWorkflowLineupAccessory(
  draft: FightWorkflowDraft,
  side: FightWorkflowSide,
  accessoryId: string | null,
): FightWorkflowTransition {
  const blocked = editingIssue(draft, side);
  if (blocked) return unchanged(draft, blocked);
  return changed(
    replaceSelection(
      draft,
      side,
      freezeSelection({
        ...draft.selections[side],
        accessoryId,
      }),
    ),
  );
}

export function setFightWorkflowBuild(
  draft: FightWorkflowDraft,
  instanceId: string,
  build: CombatantBuild,
): FightWorkflowTransition {
  const blocked = settingsEditingIssue(draft, "builds");
  if (blocked) return unchanged(draft, blocked);
  const candidate = instanceId.trim();
  const eligible = [
    ...draft.policy.player.eligibleFighters,
    ...draft.policy.opponent.eligibleFighters,
  ].some((fighter) => fighter.instanceId === candidate);
  if (!eligible) {
    return unchanged(
      draft,
      issue(
        "build-instance-ineligible",
        "That fighter is not available in this match.",
        { instanceId: candidate },
      ),
    );
  }
  return changed(
    replaceSettings(
      draft,
      freezeSettings({
        ...draft.settings,
        builds: { ...draft.settings.builds, [candidate]: build },
      }),
    ),
  );
}

export function confirmFightWorkflow(
  draft: FightWorkflowDraft,
  confirmationId: string,
): FightWorkflowConfirmationResult {
  const issues = [...validateFightWorkflowDraft(draft)];
  if (draft.step !== "confirm") {
    issues.push(
      issue(
        "confirmation-step-required",
        "Review the complete Fight Setup before starting the fight.",
      ),
    );
  }
  const id = confirmationId.trim();
  if (!id) {
    issues.push(
      issue(
        "confirmation-id-required",
        "The Fight Setup confirmation is missing its identity.",
      ),
    );
  }
  if (issues.length > 0) {
    return Object.freeze({
      snapshot: null,
      issues: Object.freeze(issues),
    });
  }

  const player = freezeSelection(draft.selections.player);
  const opponent = freezeSelection(draft.selections.opponent);
  const playerInstanceIds = [
    player.starterInstanceId!,
    ...player.instanceIds.filter(
      (instanceId) => instanceId !== player.starterInstanceId,
    ),
  ];
  const opponentInstanceIds = [
    opponent.starterInstanceId!,
    ...opponent.instanceIds.filter(
      (instanceId) => instanceId !== opponent.starterInstanceId,
    ),
  ];
  const settings = freezeSettings(draft.settings);
  const lineup: LineupConfirmation = {
    id,
    playerInstanceIds,
    playerStarterInstanceId: player.starterInstanceId!,
    opponentInstanceIds,
    playerAccessoryId: player.accessoryId,
    opponentAccessoryId: opponent.accessoryId,
  };
  Object.freeze(lineup.playerInstanceIds);
  Object.freeze(lineup.opponentInstanceIds);
  Object.freeze(lineup);
  const snapshot: ConfirmedFightWorkflow = Object.freeze({
    id,
    draftId: draft.id,
    mode: draft.mode,
    player,
    opponent,
    settings,
    lineup,
  });
  return Object.freeze({ snapshot, issues: Object.freeze([]) });
}
