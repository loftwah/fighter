import type {
  FightWorkflowDraft,
  FightWorkflowSettingField,
} from "../../app/fight-workflow";
import {
  quickFightPresets,
  type QuickFightPresetDefinition,
} from "../../app/quick-fight-workflow";
import type { StatBlock } from "../../combat/types";
import { combatContent } from "../../content/initial-content";
import { patches } from "../../progression/patches";
import { resolveImagePath } from "../../assets/registry";
import { escapeHtml, formatLabel } from "../format";
import { ICONS } from "../icons";

export type MatchSettingsSection = "rules" | "builds";
export type MatchBuildSection = "stats" | "moves" | "modification";

export interface MatchSettingsScreenModel {
  draft: FightWorkflowDraft;
  preset: QuickFightPresetDefinition;
  section: MatchSettingsSection;
  selectedBuildInstanceId: string | null;
  buildSection?: MatchBuildSection;
  parentLabel: string;
  parentCommand: string;
  mainMenuCommand?: string;
}

const difficulties = ["easy", "normal", "hard", "brutal"] as const;
const statKeys: readonly (keyof StatBlock)[] = [
  "health",
  "power",
  "evasion",
  "fortune",
  "tempo",
];

function playerFacingStatLabel(stat: keyof StatBlock): string {
  return stat === "health" ? "Vitality" : formatLabel(stat);
}

function editable(
  model: MatchSettingsScreenModel,
  field: FightWorkflowSettingField,
) {
  return (
    model.draft.policy.mode === "quick" &&
    model.draft.policy.editableSettings.includes(field)
  );
}

function selectedFighters(model: MatchSettingsScreenModel) {
  return (["player", "opponent"] as const).flatMap((side) => {
    const selected = model.draft.selections[side];
    const ordered = selected.starterInstanceId
      ? [
          selected.starterInstanceId,
          ...selected.instanceIds.filter(
            (id) => id !== selected.starterInstanceId,
          ),
        ]
      : [...selected.instanceIds];
    return ordered.map((instanceId) => {
      const eligible = model.draft.policy[side].eligibleFighters.find(
        (fighter) => fighter.instanceId === instanceId,
      )!;
      return {
        side,
        instanceId,
        character: combatContent.characters[eligible.characterId]!,
      };
    });
  });
}

function optionButton(
  command: string,
  label: string,
  selected: boolean,
  data: string,
  disabled = false,
) {
  return `<button type="button" data-command="${command}" ${data} aria-pressed="${selected}" ${disabled ? "disabled" : ""}>${escapeHtml(label)}</button>`;
}

function renderRules(model: MatchSettingsScreenModel): string {
  const settings = model.draft.settings;
  return `<div class="match-settings-rules" data-match-settings-panel="rules">
    <section class="match-preset-row">
      <header><h2>Preset</h2><p>Pick a starting point. Every value below updates immediately.</p></header>
      <label class="match-preset-select">
        <span class="sr-only">Quick Fight preset</span>
        <select name="quickPreset">
          ${quickFightPresets
            .map(
              (preset) =>
                `<option value="${preset.id}" ${settings.presetId === preset.id ? "selected" : ""}>${escapeHtml(preset.name)}</option>`,
            )
            .join("")}
        </select>
        <small>${escapeHtml(model.preset.summary)}</small>
      </label>
    </section>
    <section>
      <header><h2>Difficulty</h2><p>How quickly the opponent reads the fight and answers back.</p></header>
      <div class="match-choice-strip">
        ${difficulties.map((difficulty) => optionButton("set-match-difficulty", formatLabel(difficulty), settings.difficulty === difficulty, `data-value="${difficulty}"`, !editable(model, "difficulty"))).join("")}
      </div>
    </section>
    <section>
      <header><h2>Fight Clock</h2><p>How long the fight can run.</p></header>
      <div class="match-choice-strip">
        ${[60, 90, 120, 180].map((seconds) => optionButton("set-match-time", `${seconds} sec`, settings.timeLimitMs === seconds * 1000, `data-value="${seconds * 1000}"`, !editable(model, "timeLimit"))).join("")}
      </div>
    </section>
    ${(["player", "opponent"] as const)
      .map((side) => {
        const value =
          side === "player"
            ? settings.playerStartingCharge
            : settings.opponentStartingCharge;
        return `<section><header><h2>${side === "player" ? "Your" : "Opponent"} Opening Charge</h2><p>How close this Lineup starts to its first big Move.</p></header><div class="match-choice-strip">${[0, 25, 50, 75, 100].map((charge) => optionButton("set-match-charge", String(charge), value === charge, `data-side="${side}" data-value="${charge}"`, !editable(model, "startingCharge"))).join("")}</div></section>`;
      })
      .join("")}
    <section class="match-seed"><header><h2>Match Pattern</h2><p>Shuffle the behind-the-scenes events for a different rematch.</p></header><button type="button" data-command="reroll-match-seed" ${editable(model, "seed") ? "" : "disabled"}>${ICONS.shuffle}<span>Shuffle pattern</span></button></section>
  </div>`;
}

function renderBuilds(model: MatchSettingsScreenModel): string {
  const fighters = selectedFighters(model);
  const selected =
    fighters.find(
      (fighter) => fighter.instanceId === model.selectedBuildInstanceId,
    ) ?? fighters[0];
  if (!selected) return "";
  const build =
    model.draft.settings.builds[selected.instanceId] ??
    model.draft.policy[selected.side].eligibleFighters.find(
      (fighter) => fighter.instanceId === selected.instanceId,
    )?.build ??
    {};
  const stats = build.statBonuses ?? {};
  const spent = statKeys.reduce((sum, stat) => sum + (stats[stat] ?? 0), 0);
  const level = build.level ?? selected.character.level;
  const budget = Math.max(0, level - 1);
  const actionIds = build.actionIds ?? selected.character.actionIds;
  const canEdit = editable(model, "builds");
  const modificationsUnlocked = level >= 5;
  const moveEditingUnlocked = level >= 10;
  const moveGateId = `move-gate-${selected.instanceId}`;
  const modificationGateId = `modification-gate-${selected.instanceId}`;
  return `<div class="match-settings-builds" data-match-settings-panel="builds">
    <nav class="match-build-fighters" aria-label="Choose a fighter build">
      ${fighters.map((fighter) => `<button type="button" data-command="select-match-build" data-instance-id="${escapeHtml(fighter.instanceId)}" aria-label="Edit ${escapeHtml(fighter.character.name)} build, ${fighter.side === "player" ? "your team" : "opponent"}" aria-pressed="${fighter.instanceId === selected.instanceId}"><span class="match-build-fighter-art"><img src="${resolveImagePath(fighter.character.portraitAssetId)}" alt=""/></span><span>${escapeHtml(fighter.character.name)}</span><small>${fighter.side === "player" ? "Your team" : "Opponent"}</small></button>`).join("")}
    </nav>
    <article class="match-build-editor" data-build-section="${model.buildSection ?? "stats"}">
      <header><div><h2>${escapeHtml(selected.character.name)}</h2><p>${canEdit ? "Sandbox build" : "This preset keeps every build even."}</p></div><div class="match-level-control"><span>Level</span><button type="button" data-command="adjust-match-level" data-instance-id="${escapeHtml(selected.instanceId)}" data-delta="-1" aria-label="Decrease ${escapeHtml(selected.character.name)} level" ${canEdit ? "" : "disabled"}>${ICONS.minus}</button><strong>${level}</strong><button type="button" data-command="adjust-match-level" data-instance-id="${escapeHtml(selected.instanceId)}" data-delta="1" aria-label="Increase ${escapeHtml(selected.character.name)} level" ${canEdit ? "" : "disabled"}>${ICONS.plus}</button></div></header>
      <nav class="match-build-mobile-tabs" aria-label="Build editor sections">${(["stats", "moves", "modification"] as const).map((section) => `<button type="button" data-command="show-match-build-section" data-section="${section}" aria-pressed="${(model.buildSection ?? "stats") === section}">${escapeHtml(formatLabel(section))}</button>`).join("")}</nav>
      <div class="match-build-body">
        <section class="match-stat-board"><h3>Stats <span>${spent}/${budget} points</span></h3>${statKeys.map((stat) => `<div><span>${escapeHtml(playerFacingStatLabel(stat))}</span><button type="button" data-command="adjust-match-stat" data-instance-id="${escapeHtml(selected.instanceId)}" data-stat="${stat}" data-delta="-1" aria-label="Decrease ${escapeHtml(selected.character.name)} ${escapeHtml(playerFacingStatLabel(stat))}" ${canEdit ? "" : "disabled"}>${ICONS.minus}</button><strong>${stats[stat] ?? 0}</strong><button type="button" data-command="adjust-match-stat" data-instance-id="${escapeHtml(selected.instanceId)}" data-stat="${stat}" data-delta="1" aria-label="Increase ${escapeHtml(selected.character.name)} ${escapeHtml(playerFacingStatLabel(stat))}" ${canEdit ? "" : "disabled"}>${ICONS.plus}</button></div>`).join("")}</section>
        <section class="match-move-board"><h3>Moves <span id="${escapeHtml(moveGateId)}">${moveEditingUnlocked ? "Order · tier" : "Reordering and tier upgrades unlock at Level 10"}</span></h3>${actionIds
          .map((actionId, index) => {
            const action = combatContent.actions[actionId]!;
            const tier = build.actionTiers?.[actionId] ?? "stock";
            return `<div><b>${index + 1}</b><span><strong>${escapeHtml(action.name)}</strong><small>${escapeHtml(formatLabel(action.category))}</small></span><button type="button" data-command="move-match-action" data-instance-id="${escapeHtml(selected.instanceId)}" data-action-id="${escapeHtml(actionId)}" data-direction="-1" aria-label="Move ${escapeHtml(action.name)} earlier" aria-describedby="${escapeHtml(moveGateId)}" ${canEdit && moveEditingUnlocked && index > 0 ? "" : "disabled"}>${ICONS.chevronLeft}</button><button type="button" data-command="move-match-action" data-instance-id="${escapeHtml(selected.instanceId)}" data-action-id="${escapeHtml(actionId)}" data-direction="1" aria-label="Move ${escapeHtml(action.name)} later" aria-describedby="${escapeHtml(moveGateId)}" ${canEdit && moveEditingUnlocked && index < 2 ? "" : "disabled"}>${ICONS.chevronRight}</button><button type="button" class="match-tier" data-command="cycle-match-tier" data-instance-id="${escapeHtml(selected.instanceId)}" data-action-id="${escapeHtml(actionId)}" aria-describedby="${escapeHtml(moveGateId)}" ${canEdit && moveEditingUnlocked ? "" : "disabled"}>${escapeHtml(formatLabel(tier))}</button></div>`;
          })
          .join("")}</section>
        <section class="match-mod-board"><h3>Modification <span id="${escapeHtml(modificationGateId)}">${modificationsUnlocked ? "Choose one" : "Unlocks at Level 5"}</span></h3><div>${[{ id: null, name: "None", imageAssetId: null }, ...patches].map((patch) => `<button type="button" data-command="set-match-patch" data-instance-id="${escapeHtml(selected.instanceId)}" data-patch-id="${patch.id ?? ""}" aria-pressed="${(build.equippedPatchId ?? null) === patch.id}" aria-describedby="${escapeHtml(modificationGateId)}" ${canEdit && modificationsUnlocked ? "" : "disabled"}>${patch.imageAssetId ? `<img src="${resolveImagePath(patch.imageAssetId)}" alt=""/>` : "—"}<span>${escapeHtml(patch.name)}</span></button>`).join("")}</div></section>
      </div>
    </article>
  </div>`;
}

export function renderMatchSettingsScreen(
  model: MatchSettingsScreenModel,
): string {
  return `<section class="match-settings" data-match-settings aria-labelledby="match-settings-title">
    <header class="match-settings-header"><nav aria-label="Quick Fight navigation"><button type="button" data-command="${escapeHtml(model.parentCommand)}" class="match-back">${ICONS.chevronLeft}<span>${escapeHtml(model.parentLabel)}</span></button>${model.mainMenuCommand ? `<button type="button" data-command="${escapeHtml(model.mainMenuCommand)}" class="match-main-menu">${ICONS.home}<span>Main Menu</span></button>` : ""}</nav><div><h1 id="match-settings-title">Quick Fight Settings</h1><p>Choose how this fight plays.</p></div></header>
    <nav class="match-settings-tabs" aria-label="Quick Fight Settings sections">${(["rules", "builds"] as const).map((section) => `<button type="button" data-command="show-match-settings-section" data-section="${section}" aria-pressed="${model.section === section}">${section === "rules" ? ICONS.sliders : ICONS.quick}<span>${escapeHtml(formatLabel(section))}</span></button>`).join("")}</nav>
    <div class="match-settings-stage">${model.section === "rules" ? renderRules(model) : renderBuilds(model)}</div>
    <footer><p><strong>${escapeHtml(model.preset.name)}</strong><span>${escapeHtml(model.preset.summary)}</span></p><button type="button" class="primary-action" data-command="review-quick-fight">Review Fight ${ICONS.chevronRight}</button></footer>
  </section>`;
}
