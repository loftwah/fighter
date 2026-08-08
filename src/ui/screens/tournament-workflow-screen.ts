import type { Difficulty } from "../../combat/types";
import { combatContent } from "../../content/initial-content";
import type { TournamentRunData } from "../../persistence/save";
import type {
  TournamentRosterCandidate,
  TournamentSettingsDraft,
} from "../../app/tournament-workflow";
import {
  resolveImageObjectPosition,
  resolveImagePath,
} from "../../assets/registry";
import {
  tournamentDefinition,
  tournamentTrophy,
} from "../../tournaments/catalog";
import { patches } from "../../progression/patches";
import { escapeHtml, formatLabel } from "../format";
import { ICONS } from "../icons";

const difficultyOptions: readonly Difficulty[] = [
  "easy",
  "normal",
  "hard",
  "brutal",
];

export interface TournamentChoiceScreenModel {
  tournamentId: string;
  run: TournamentRunData | null;
  trophyCollected: boolean;
  result?: { title: string; message: string } | null;
}

export interface TournamentRosterScreenModel {
  tournamentId: string;
  catalogue: readonly TournamentRosterCandidate[];
  selectedCatalogue: readonly TournamentRosterCandidate[];
  selectedInstanceIds: readonly string[];
  page: number;
  pageCount: number;
  buildInstanceId: string | null;
}

export interface TournamentSettingsScreenModel {
  tournamentId: string;
  settings: TournamentSettingsDraft;
  customVariant: boolean;
}

function workflowHeader(
  title: string,
  summary: string,
  parentCommand: string,
  parentLabel: string,
): string {
  return `<header class="tournament-workflow-header">
    <nav aria-label="Tournament navigation">
      <button type="button" data-command="${parentCommand}">${ICONS.chevronLeft}<span>${escapeHtml(parentLabel)}</span></button>
      ${parentCommand === "main-menu" ? "" : `<button type="button" data-command="main-menu">${ICONS.home}<span>Main Menu</span></button>`}
    </nav>
    <div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(summary)}</p></div>
  </header>`;
}

function bracket(tournamentId: string, currentRound = 0): string {
  const tournament = tournamentDefinition(tournamentId);
  return `<ol class="tournament-choice-bracket" aria-label="Tournament fights">
    ${tournament.rounds
      .map(
        (
          round,
        ) => `<li class="${round.roundIndex < currentRound ? "is-cleared" : round.roundIndex === currentRound ? "is-current" : ""}">
          <span>Round ${round.roundIndex + 1}</span>
          <strong>${escapeHtml(round.title)}</strong>
        </li>`,
      )
      .join("")}
  </ol>`;
}

export function renderTournamentChoiceScreen(
  model: TournamentChoiceScreenModel,
): string {
  const tournament = tournamentDefinition(model.tournamentId);
  const trophy = tournamentTrophy(tournament.id);
  const run = model.run;
  const livingCount = run
    ? Object.values(run.healthRatios).filter((health) => health > 0).length
    : 0;
  return `<section class="tournament-workflow tournament-choice" data-tournament-stage="choice">
    ${workflowHeader(
      "Tournament Choice",
      "Pick a Cup or continue the run you left open.",
      "main-menu",
      "Main Menu",
    )}
    <div class="tournament-choice-scroll">
      ${model.result ? `<aside class="tournament-choice-result" role="status"><span>Tournament Result</span><strong>${escapeHtml(model.result.title)}</strong><p>${escapeHtml(model.result.message)}</p></aside>` : ""}
      <article class="tournament-choice-cassette">
        <div class="tournament-choice-arena">
          <img src="${resolveImagePath(tournament.imageAssetId)}" data-asset-id="${tournament.imageAssetId}" style="object-position:${resolveImageObjectPosition(tournament.imageAssetId)}" alt="${escapeHtml(tournament.imageAlt)}" />
        </div>
        <div class="tournament-choice-identity">
          <figure>
            <img src="${resolveImagePath(trophy.imageAssetId)}" data-asset-id="${trophy.imageAssetId}" alt="${escapeHtml(trophy.imageAlt)}" />
            <figcaption><span>${model.trophyCollected ? "Trophy collected" : "Winner's Trophy"}</span><strong>${escapeHtml(trophy.name)}</strong></figcaption>
          </figure>
          <div><h2>${escapeHtml(tournament.name)}</h2><p>${tournament.rounds.length} fights · Health carries · One registered Trophy</p></div>
        </div>
        ${bracket(tournament.id, run?.roundIndex ?? 0)}
        <div class="tournament-choice-actions">
          ${
            run
              ? `<button type="button" class="primary-action" data-command="resume-tournament">Resume Round ${run.roundIndex + 1} ${ICONS.chevronRight}</button>
                 <p><strong>${livingCount} of ${run.caseBuilds.length} still standing</strong><span>Both sides keep their current Health.</span></p>`
              : `<button type="button" class="primary-action" data-command="new-tournament">Choose this Cup ${ICONS.chevronRight}</button>
                 <p><strong>Fresh run</strong><span>Build and lock a Roster of up to six.</span></p>`
          }
          ${run ? '<button type="button" class="secondary-action" data-command="new-tournament">Start new run</button>' : ""}
        </div>
      </article>
      <aside class="tournament-builder-locked" aria-label="Custom Tournament Builder availability">
        <span aria-hidden="true">${ICONS.lock}</span><strong>Custom Builder</strong><span>Coming in V2.1</span>
      </aside>
    </div>
  </section>`;
}

function copyLabel(instanceId: string): string {
  const match = instanceId.match(/\.(\d+)$/);
  return match ? `Copy ${match[1]}` : "Sandbox copy";
}

const buildStats = ["health", "power", "evasion", "fortune", "tempo"] as const;

function tournamentBuildEditor(editor: TournamentRosterCandidate): string {
  const character = combatContent.characters[editor.characterId]!;
  const spent = buildStats.reduce(
    (sum, stat) => sum + editor.statBonuses[stat],
    0,
  );
  const budget = editor.level - 1;
  return `<section class="tournament-build-editor" aria-label="Configure ${escapeHtml(character.name)} build">
    <div class="tournament-build-heading"><div><h3>${escapeHtml(character.name)} Build</h3><p>Build changes lock for the complete run.</p></div><div class="tournament-level-stepper"><span>Level</span><button type="button" data-command="adjust-tournament-build-level" data-instance-id="${escapeHtml(editor.instanceId)}" data-delta="-1" aria-label="Decrease level">${ICONS.minus}</button><strong>${editor.level}</strong><button type="button" data-command="adjust-tournament-build-level" data-instance-id="${escapeHtml(editor.instanceId)}" data-delta="1" aria-label="Increase level">${ICONS.plus}</button></div></div>
    <fieldset class="tournament-build-stats"><legend>Stats · ${spent}/${budget} points</legend>${buildStats.map((stat) => `<div><span>${formatLabel(stat)}</span><button type="button" data-command="adjust-tournament-build-stat" data-instance-id="${escapeHtml(editor.instanceId)}" data-stat="${stat}" data-delta="-1" aria-label="Decrease ${stat}" ${editor.statBonuses[stat] <= 0 ? "disabled" : ""}>${ICONS.minus}</button><strong>${editor.statBonuses[stat]}</strong><button type="button" data-command="adjust-tournament-build-stat" data-instance-id="${escapeHtml(editor.instanceId)}" data-stat="${stat}" data-delta="1" aria-label="Increase ${stat}" ${spent >= budget ? "disabled" : ""}>${ICONS.plus}</button></div>`).join("")}</fieldset>
    <fieldset class="tournament-build-moves"><legend>Move order &amp; enhancement ${editor.level < 10 ? "· unlocks at level 10" : ""}</legend>${editor.actionIds
      .map((actionId, index) => {
        const action = combatContent.actions[actionId]!;
        const tier = editor.actionTiers[actionId] ?? "stock";
        return `<div><span>${index + 1}</span><strong>${escapeHtml(action.name)}</strong><button type="button" data-command="move-tournament-build-action" data-instance-id="${escapeHtml(editor.instanceId)}" data-action-id="${actionId}" data-direction="-1" aria-label="Move ${escapeHtml(action.name)} earlier" ${editor.level < 10 || index === 0 ? "disabled" : ""}>${ICONS.chevronLeft}</button><button type="button" data-command="move-tournament-build-action" data-instance-id="${escapeHtml(editor.instanceId)}" data-action-id="${actionId}" data-direction="1" aria-label="Move ${escapeHtml(action.name)} later" ${editor.level < 10 || index === editor.actionIds.length - 1 ? "disabled" : ""}>${ICONS.chevronRight}</button><button type="button" data-command="cycle-tournament-build-tier" data-instance-id="${escapeHtml(editor.instanceId)}" data-action-id="${actionId}" ${editor.level < 10 ? "disabled" : ""}>${formatLabel(tier)}</button></div>`;
      })
      .join("")}</fieldset>
    <fieldset class="tournament-build-patches"><legend>Modification ${editor.level < 5 ? "· unlocks at level 5" : ""}</legend><button type="button" data-command="set-tournament-build-patch" data-instance-id="${escapeHtml(editor.instanceId)}" data-patch-id="" aria-pressed="${editor.equippedPatchId === null}" ${editor.level < 5 ? "disabled" : ""}>None</button>${patches.map((patch) => `<button type="button" data-command="set-tournament-build-patch" data-instance-id="${escapeHtml(editor.instanceId)}" data-patch-id="${patch.id}" aria-pressed="${editor.equippedPatchId === patch.id}" ${editor.level < 5 ? "disabled" : ""}>${escapeHtml(patch.name)}</button>`).join("")}</fieldset>
  </section>`;
}

export function renderTournamentRosterScreen(
  model: TournamentRosterScreenModel,
): string {
  const selected = model.selectedInstanceIds
    .map((id) =>
      model.selectedCatalogue.find((candidate) => candidate.instanceId === id),
    )
    .filter((candidate): candidate is TournamentRosterCandidate =>
      Boolean(candidate),
    );
  const editor =
    selected.find(
      (candidate) => candidate.instanceId === model.buildInstanceId,
    ) ?? selected[0];
  return `<section class="tournament-workflow tournament-roster" data-tournament-stage="roster">
    ${workflowHeader(
      "Tournament Roster",
      "Configure and lock up to six unique Character instances.",
      "back-to-tournament-choice",
      "Tournament Choice",
    )}
    <div class="tournament-roster-stage">
      <section class="tournament-roster-catalogue" aria-labelledby="tournament-catalogue-title">
        <header><h2 id="tournament-catalogue-title">Sandbox Catalogue</h2><p>${model.page}/${Math.max(1, model.pageCount)}</p></header>
        <div class="tournament-roster-grid">
          ${model.catalogue
            .map((candidate) => {
              const character =
                combatContent.characters[candidate.characterId]!;
              const active = model.selectedInstanceIds.includes(
                candidate.instanceId,
              );
              return `<button type="button" data-command="toggle-tournament-roster" data-instance-id="${escapeHtml(candidate.instanceId)}" aria-pressed="${active}" ${!active && selected.length >= 6 ? "disabled" : ""}>
                <span class="tournament-roster-art"><img src="${resolveImagePath(character.portraitAssetId)}" data-asset-id="${character.portraitAssetId}" style="object-position:${resolveImageObjectPosition(character.portraitAssetId)}" alt=""/><i>${active ? "Selected" : copyLabel(candidate.instanceId)}</i></span>
                <span><strong>${escapeHtml(character.name)}</strong><small>${escapeHtml(formatLabel(character.typeId))} · ${copyLabel(candidate.instanceId)}</small></span>
              </button>`;
            })
            .join("")}
        </div>
        <nav aria-label="Tournament catalogue pages">
          <button type="button" data-command="previous-tournament-roster-page" ${model.page <= 1 ? "disabled" : ""}>${ICONS.chevronLeft}<span>Previous</span></button>
          <strong>${model.page}/${Math.max(1, model.pageCount)}</strong>
          <button type="button" data-command="next-tournament-roster-page" ${model.page >= model.pageCount ? "disabled" : ""}><span>Next</span>${ICONS.chevronRight}</button>
        </nav>
      </section>
      <aside class="tournament-roster-locker" aria-label="Selected Tournament Roster">
        <header><h2>Roster Tray</h2><strong>${selected.length}/6</strong></header>
        <div>${
          selected.length > 0
            ? selected
                .map((candidate, index) => {
                  const character =
                    combatContent.characters[candidate.characterId]!;
                  return `<button type="button" data-command="configure-tournament-build" data-instance-id="${escapeHtml(candidate.instanceId)}" aria-pressed="${candidate.instanceId === editor?.instanceId}"><span>${index + 1}</span><img src="${resolveImagePath(character.portraitAssetId)}" alt=""/><strong>${escapeHtml(character.name)}</strong><small>Level ${candidate.level}</small></button>`;
                })
                .join("")
            : "<p>Choose at least one Character from the catalogue.</p>"
        }</div>
        ${editor ? tournamentBuildEditor(editor) : ""}
      </aside>
    </div>
    <footer><p><strong>${selected.length} Character${selected.length === 1 ? "" : "s"} ready</strong><span>Multiple copies may use the same Character definition.</span></p><button type="button" class="primary-action" data-command="continue-tournament-settings" ${selected.length === 0 ? "disabled" : ""}>Tournament Settings ${ICONS.chevronRight}</button></footer>
  </section>`;
}

function choiceStrip(
  command: string,
  current: number,
  values: readonly number[],
  suffix = "",
): string {
  return `<div class="tournament-setting-choices">${values.map((value) => `<button type="button" data-command="${command}" data-value="${value}" aria-pressed="${current === value}">${suffix === " sec" ? value / 1000 : value}${suffix}</button>`).join("")}</div>`;
}

function fightOverrideRow(
  label: string,
  command: string,
  nodeId: string,
  current: number | null,
  values: readonly number[],
  format: (value: number) => string = String,
): string {
  return `<div class="tournament-override-row"><span>${label}</span><div class="tournament-setting-choices"><button type="button" data-command="${command}" data-node-id="${nodeId}" data-value="" aria-pressed="${current === null}">Run default</button>${values.map((value) => `<button type="button" data-command="${command}" data-node-id="${nodeId}" data-value="${value}" aria-pressed="${current === value}">${format(value)}</button>`).join("")}</div></div>`;
}

export function renderTournamentSettingsScreen(
  model: TournamentSettingsScreenModel,
): string {
  const tournament = tournamentDefinition(model.tournamentId);
  return `<section class="tournament-workflow tournament-settings" data-tournament-stage="settings">
    ${workflowHeader(
      "Tournament Settings",
      "Set run-wide defaults and any explicit fight overrides.",
      "back-to-tournament-roster",
      "Tournament Roster",
    )}
    <div class="tournament-settings-stage">
      <section class="tournament-settings-ledger">
        <header><h2>${model.customVariant ? "Custom run variant" : "Preset defaults"}</h2><p>${model.customVariant ? "The registered preset remains unchanged." : "These values come from The Wrong Door Cup."}</p></header>
        <article><div><h3>Difficulty</h3><p>How quickly opponents answer.</p></div><div class="tournament-setting-choices">${difficultyOptions.map((difficulty) => `<button type="button" data-command="set-tournament-difficulty" data-value="${difficulty}" aria-pressed="${model.settings.difficulty === difficulty}">${formatLabel(difficulty)}</button>`).join("")}</div></article>
        <article><div><h3>Fight Clock</h3><p>Default for every fight unless overridden.</p></div>${choiceStrip("set-tournament-time", model.settings.timeLimitMs, [60_000, 90_000, 120_000, 180_000], " sec")}</article>
        <article><div><h3>Your Opening Charge</h3><p>Applied before declared interlude effects.</p></div>${choiceStrip("set-tournament-charge", model.settings.playerStartingCharge, [0, 25, 50, 75], "")}</article>
        <article><div><h3>Opponent Opening Charge</h3><p>Default for authored opponent Squads.</p></div>${choiceStrip("set-tournament-opponent-charge", model.settings.opponentStartingCharge, [0, 25, 50, 75], "")}</article>
      </section>
      <aside class="tournament-overrides">
        <header><h2>Fight Overrides</h2><p>Leave a value on Run default or declare it for this fight.</p></header>
        ${tournament.nodes
          .filter((node) => node.kind === "fight")
          .map((node, index) => {
            const override = model.settings.fightOverrides[node.id] ?? {};
            return `<section><div><span>Fight ${index + 1}</span><strong>${escapeHtml(node.enemySquadName)}</strong></div>${fightOverrideRow("Fight Clock", "set-tournament-fight-time", node.id, override.timeLimitMs ?? null, [60_000, 90_000, 120_000, 180_000], (value) => `${value / 1000}s`)}${fightOverrideRow("Your Charge", "set-tournament-fight-charge", node.id, override.playerStartingCharge ?? null, [25, 50, 75])}${fightOverrideRow("Opponent Charge", "set-tournament-fight-opponent-charge", node.id, override.opponentStartingCharge ?? null, [25, 50, 75])}</section>`;
          })
          .join("")}
      </aside>
    </div>
    <footer><p><strong>${model.customVariant ? "Custom variant" : "Registered preset"}</strong><span>Accessories are chosen with each deployment.</span></p><button type="button" class="primary-action" data-command="lock-tournament-roster">Lock Roster &amp; Prepare Lineup ${ICONS.chevronRight}</button></footer>
  </section>`;
}
