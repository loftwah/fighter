import {
  resolveImageObjectPosition,
  resolveImagePath,
} from "../../assets/registry";
import { combatContent } from "../../content/initial-content";
import type { BattleResultExplanation } from "../battle-result-explanation";
import { escapeHtml, formatLabel } from "../format";

export type BattleResultMode = "quick" | "story" | "tournament" | "dev";

export interface BattleResultReward {
  label: string;
  value: string;
}

export interface BattleResultAction {
  command: string;
  label: string;
}

export interface BattleResultScreenModel {
  mode: BattleResultMode;
  won: boolean;
  title: string;
  message: string;
  featuredCharacterId: string;
  explanation?: BattleResultExplanation;
  /** Quick Fight and Dev Lab deliberately omit rewards. */
  rewards?: readonly BattleResultReward[];
  actions: {
    retry?: BattleResultAction;
    parent: BattleResultAction;
    mainMenu: BattleResultAction;
    exportReport?: BattleResultAction;
    parentIsPrimary?: boolean;
  };
}

function renderEvidence(explanation: BattleResultExplanation | undefined) {
  if (!explanation) return "";
  return `
    <section class="battle-result-evidence" aria-labelledby="battle-result-evidence-title">
      <h3 id="battle-result-evidence-title">${escapeHtml(explanation.heading)}</h3>
      <p>${escapeHtml(explanation.decisiveMoment)}</p>
      <ul>
        ${explanation.evidence
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("")}
      </ul>
    </section>
  `;
}

function renderRewards(rewards: readonly BattleResultReward[] | undefined) {
  if (!rewards?.length) return "";
  return `
    <section class="battle-result-rewards" aria-label="Fight rewards">
      ${rewards
        .map(
          (reward) => `
            <div>
              <span>${escapeHtml(reward.label)}</span>
              <strong>${escapeHtml(reward.value)}</strong>
            </div>
          `,
        )
        .join("")}
    </section>
  `;
}

export function renderBattleResultScreen(
  model: BattleResultScreenModel,
): string {
  const featured = combatContent.characters[model.featuredCharacterId];
  if (!featured) {
    throw new Error(
      `Unknown featured result Character ${model.featuredCharacterId}`,
    );
  }
  const primaryAction = model.actions.parentIsPrimary ? "parent" : "retry";

  return `
    <!--
      THESIS: The last hit resolves into a full-screen fight poster, never a debug summary or dashboard card.
      OWN-WORLD: Frozen arena, oversized spot-ink verdict, one dominant Character plate, torn evidence ticket, and a hard action rail.
      STORY: Read the outcome, understand what decided it, then rematch or leave with one deliberate action.
      FIRST VIEWPORT: Verdict spans the top; the winning side anchors the left; evidence occupies the right; every exit remains visible below.
      FORM: Saturday-night result poster, established battle surface extension; seed key: result-poster-01.
      FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
    -->
    <div
      class="battle-result-scene ${model.won ? "is-win" : "is-loss"}"
      data-battle-result-mode="${model.mode}"
      data-battle-result-outcome="${model.won ? "victory" : "defeat"}"
    >
      <div class="battle-result-verdict" aria-hidden="true">
        <span>${model.won ? "Victory" : "Defeat"}</span>
      </div>
      <figure class="battle-result-fighter" aria-label="${escapeHtml(featured.name)}, ${model.won ? "winner" : "featured fighter"}">
        <img
          src="${resolveImagePath(featured.portraitAssetId)}"
          data-asset-id="${featured.portraitAssetId}"
          style="object-position:${resolveImageObjectPosition(featured.portraitAssetId)}"
          alt=""
        />
        <figcaption>
          <strong>${escapeHtml(featured.name)}</strong>
          <span>${escapeHtml(formatLabel(featured.typeId))}</span>
        </figcaption>
      </figure>
      <section class="battle-result-copy" aria-labelledby="battle-result-title">
        <header>
          <h2 id="battle-result-title">${escapeHtml(model.title)}</h2>
          <p>${escapeHtml(model.message)}</p>
        </header>
        ${renderRewards(model.mode === "quick" || model.mode === "dev" ? undefined : model.rewards)}
        ${renderEvidence(model.explanation)}
      </section>
      <footer class="battle-result-footer">
        <div class="battle-result-actions">
          ${
            model.actions.retry
              ? `<button class="${primaryAction === "retry" ? "primary-action" : "secondary-action"}" data-command="${escapeHtml(model.actions.retry.command)}">${escapeHtml(model.actions.retry.label)}</button>`
              : ""
          }
          <button class="${primaryAction === "parent" ? "primary-action" : "secondary-action"}" data-command="${escapeHtml(model.actions.parent.command)}">${escapeHtml(model.actions.parent.label)}</button>
          <button class="secondary-action" data-command="${escapeHtml(model.actions.mainMenu.command)}">${escapeHtml(model.actions.mainMenu.label)}</button>
        </div>
        ${
          model.actions.exportReport
            ? `<button class="battle-result-export" data-command="${escapeHtml(model.actions.exportReport.command)}">${escapeHtml(model.actions.exportReport.label)}</button>`
            : ""
        }
      </footer>
    </div>
  `;
}
