import type { BattleReport } from "../../combat/report";
import type { Side } from "../../combat/types";
import { combatContent } from "../../content/initial-content";
import {
  devBattleScenarios,
  type DevBattleScenario,
  type DevMoveTier,
} from "../../dev/scenarios";
import type { SaveData } from "../../persistence/save";
import { patches } from "../../progression/patches";
import { escapeHtml, formatClass } from "../format";

export interface DevLabScreenModel {
  save: SaveData;
  draft: DevBattleScenario;
  recentBattleReports: readonly BattleReport[];
}

function renderCharacterOptions(selectedId: string, optional: boolean): string {
  const options = Object.values(combatContent.characters)
    .map(
      (character) =>
        `<option value="${character.id}" ${
          character.id === selectedId ? "selected" : ""
        }>${character.name} · ${formatClass(character.classId)}</option>`,
    )
    .join("");

  return `${optional ? '<option value="">Empty slot</option>' : ""}${options}`;
}

function renderLineupFields(side: Side, draft: DevBattleScenario): string {
  const ids =
    side === "player" ? draft.playerCharacterIds : draft.enemyCharacterIds;

  return [0, 1, 2]
    .map((index) => {
      const selectedId = ids[index] ?? "";
      return `
        <label class="dev-lineup-slot">
          <span>${index + 1}</span>
          <select
            name="dev-${side}-${index}"
            data-dev-field="${side}Character.${index}"
            aria-label="${side === "player" ? "Player" : "Enemy"} Relic ${index + 1}"
          >
            ${renderCharacterOptions(selectedId, index > 0)}
          </select>
        </label>
      `;
    })
    .join("");
}

function renderTierOptions(selected: DevMoveTier): string {
  return (
    [
      ["normal", "Normal · base outline"],
      ["tier1", "Tier 1 · silver outline"],
      ["tier2", "Tier 2 · gold outline"],
    ] as const
  )
    .map(
      ([value, label]) =>
        `<option value="${value}" ${
          selected === value ? "selected" : ""
        }>${label}</option>`,
    )
    .join("");
}

function renderPatchOptions(selectedId: string | null): string {
  return [
    '<option value="">No Patch</option>',
    ...patches.map(
      (patch) =>
        `<option value="${patch.id}" ${
          selectedId === patch.id ? "selected" : ""
        }>${escapeHtml(patch.name)} · ${escapeHtml(patch.description)}</option>`,
    ),
  ].join("");
}

export function renderDevLabScreen({
  save,
  draft,
  recentBattleReports,
}: DevLabScreenModel): string {
  const recentReport = recentBattleReports[0];

  return `
    <!--
    THESIS: Development is a fight switchboard, not an admin dashboard.
    OWN-WORLD: Indigo drawer board, chalk scenario tickets, tomato actions, acid-yellow selection, hard registration borders.
    STORY: Pick a known test or compose one, prove it is isolated, then start paused or live with diagnostics beside the work.
    FIRST VIEWPORT: Six launch tickets lead; the Lineup composer fills the centre; a narrow diagnostic ledger stays at right; launch actions close the bottom edge.
    FORM: Fight Switchboard, grounded structure six, staged as threshold relay; seed ef4be0e0.
    FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
    -->
    <section class="dev-lab" aria-labelledby="dev-lab-title">
      <header class="dev-lab-heading">
        <div>
          <button class="text-button" data-command="main-menu">← Main Menu</button>
          <h1 id="dev-lab-title">Developer Lab</h1>
          <p>
            Isolated sandbox. Development fights never change Story,
            progression, Missions, rewards, or tournament runs.
          </p>
        </div>
        <div class="dev-environment-stamp">
          <span>Environment</span>
          <strong>Development</strong>
          <small>Local state · deterministic combat</small>
        </div>
      </header>

      <section class="dev-switchboard" aria-labelledby="dev-presets-title">
        <div class="dev-section-title">
          <h2 id="dev-presets-title">Fight Switchboard</h2>
          <span>One-click scenarios</span>
        </div>
        <div class="dev-preset-grid">
          ${devBattleScenarios
            .map(
              (preset) => `
                <button
                  class="dev-preset-ticket"
                  data-command="start-dev-scenario"
                  data-scenario-id="${preset.id}"
                >
                  <strong>${preset.name}</strong>
                  <span>${preset.description}</span>
                  <small>${preset.playerCharacterIds.length}v${preset.enemyCharacterIds.length} · ${
                    preset.startPaused ? "Starts paused" : "Starts live"
                  }</small>
                </button>
              `,
            )
            .join("")}
        </div>
      </section>

      <div class="dev-workbench">
        <section class="dev-composer" aria-labelledby="dev-composer-title">
          <div class="dev-section-title">
            <h2 id="dev-composer-title">Custom Fight Composer</h2>
            <span>Build a deterministic sandbox</span>
          </div>
          <div class="dev-versus-builder">
            <fieldset>
              <legend>Your Lineup</legend>
              ${renderLineupFields("player", draft)}
            </fieldset>
            <span class="dev-versus-mark" aria-hidden="true">VS</span>
            <fieldset>
              <legend>Enemy Lineup</legend>
              ${renderLineupFields("enemy", draft)}
            </fieldset>
          </div>
          <div class="dev-config-grid">
            <label>
              <span>Player level</span>
              <input type="number" min="1" max="25" value="${
                draft.playerLevel
              }" data-dev-field="playerLevel" />
            </label>
            <label>
              <span>Enemy level</span>
              <input type="number" min="1" max="25" value="${
                draft.enemyLevel
              }" data-dev-field="enemyLevel" />
            </label>
            <label>
              <span>Player Moves</span>
              <select data-dev-field="playerTier">
                ${renderTierOptions(draft.playerTier)}
              </select>
            </label>
            <label>
              <span>Enemy Moves</span>
              <select data-dev-field="enemyTier">
                ${renderTierOptions(draft.enemyTier)}
              </select>
            </label>
            <label>
              <span>Player Patch</span>
              <select data-dev-field="playerPatchId">
                ${renderPatchOptions(draft.playerPatchId)}
              </select>
            </label>
            <label>
              <span>Enemy Patch</span>
              <select data-dev-field="enemyPatchId">
                ${renderPatchOptions(draft.enemyPatchId)}
              </select>
            </label>
            <label>
              <span>Player Charge</span>
              <input type="number" min="0" max="100" value="${
                draft.playerStartingBar
              }" data-dev-field="playerStartingBar" />
            </label>
            <label>
              <span>Enemy Charge</span>
              <input type="number" min="0" max="100" value="${
                draft.enemyStartingBar
              }" data-dev-field="enemyStartingBar" />
            </label>
            <label>
              <span>Player health · %</span>
              <input type="number" min="1" max="100" value="${
                draft.playerHealthRatio * 100
              }" data-dev-field="playerHealthPercent" />
            </label>
            <label>
              <span>Enemy health · %</span>
              <input type="number" min="1" max="100" value="${
                draft.enemyHealthRatio * 100
              }" data-dev-field="enemyHealthPercent" />
            </label>
            <label>
              <span>Difficulty</span>
              <select data-dev-field="devDifficulty">
                ${(["easy", "normal", "hard", "brutal"] as const)
                  .map(
                    (difficulty) =>
                      `<option value="${difficulty}" ${
                        draft.difficulty === difficulty ? "selected" : ""
                      }>${formatClass(difficulty)}</option>`,
                  )
                  .join("")}
              </select>
            </label>
            <label>
              <span>Time limit · seconds</span>
              <input type="number" min="1" max="600" value="${
                draft.timeLimitMs / 1000
              }" data-dev-field="timeLimitSeconds" />
            </label>
            <label class="dev-seed-field">
              <span>Seed</span>
              <input type="number" min="0" value="${
                draft.seed
              }" data-dev-field="seed" />
            </label>
          </div>
          <div class="dev-launch-actions">
            <button
              class="primary-action"
              data-command="start-dev-custom"
              data-paused="true"
            >Start Paused</button>
            <button
              class="secondary-action"
              data-command="start-dev-custom"
              data-paused="false"
            >Start Live</button>
          </div>
        </section>

        <aside class="dev-ledger" aria-labelledby="dev-ledger-title">
          <div class="dev-section-title">
            <h2 id="dev-ledger-title">Diagnostics</h2>
          </div>
          <dl>
            <div><dt>Profile</dt><dd>${escapeHtml(save.playerName)} · slot ${
              save.slot
            }</dd></div>
            <div><dt>Content</dt><dd>${
              Object.keys(combatContent.characters).length
            } Relics · ${Object.keys(combatContent.actions).length} Moves</dd></div>
            <div><dt>Recent reports</dt><dd>${
              recentBattleReports.length
            } this session</dd></div>
            <div><dt>Last fight</dt><dd>${
              recentReport
                ? `${escapeHtml(recentReport.encounterId)} · ${recentReport.outcome ?? "active"}`
                : "Run a fight to generate a report"
            }</dd></div>
          </dl>
          <div class="dev-convenience">
            <h3>Convenience</h3>
            <button data-command="dev-grant-collection">Grant all Relics + Patches</button>
            <button data-command="dev-grant-stamps" data-amount="500">Add 500 Stamps</button>
            <button data-command="dev-unlock-story">Unlock First Run views</button>
            <button data-command="download-profile-data">Export profile JSON</button>
            <button
              data-command="download-battle-report"
              ${recentReport ? "" : "disabled"}
            >Export last battle report</button>
          </div>
        </aside>
      </div>
    </section>
  `;
}
