import {
  STANDARD_MATCH_LEVEL,
  STANDARD_STAT_POINT_BUDGET,
} from "../../combat/standard-build";
import { combatContent } from "../../content/initial-content";
import { resolveImagePath } from "../../assets/registry";
import { renderClassWheel } from "../components/class-wheel";
import { formatClass } from "../format";

export interface QuickFightScreenModel {
  playerIds: readonly string[];
  enemyIds: readonly string[];
  difficultyOptions: string;
}

export function renderQuickFightScreen(model: QuickFightScreenModel): string {
  const player = combatContent.characters[model.playerIds[0]!]!;
  const enemy = combatContent.characters[model.enemyIds[0]!]!;
  const characterOptions = (
    selectedId: string | undefined,
    optional: boolean,
  ): string =>
    `${optional ? '<option value="">Empty slot</option>' : ""}${Object.values(
      combatContent.characters,
    )
      .map(
        (character) =>
          `<option value="${character.id}" ${
            character.id === selectedId ? "selected" : ""
          }>${character.name} · ${formatClass(character.classId)}</option>`,
      )
      .join("")}`;
  const lineupControls = (
    side: "Player" | "Enemy",
    selectedIds: readonly string[],
  ): string => `
    <div class="quick-slot-list">
      ${[0, 1, 2]
        .map(
          (index) => `
            <label class="quick-slot">
              <span>${index === 0 ? "Active Relic" : `Bench ${index}`}</span>
              <select name="quick${side}.${index}">
                ${characterOptions(selectedIds[index], index > 0)}
              </select>
            </label>
          `,
        )
        .join("")}
    </div>
  `;
  return `
    <section class="quick-setup" aria-labelledby="quick-title">
      <div class="quick-heading">
        <button class="text-button" data-command="main-menu">← Main Menu</button>
        <h1 id="quick-title">Build a Quick Fight.</h1>
        <p>
          Standard rules: every Relic is Level ${STANDARD_MATCH_LEVEL}, has the
          same ${STANDARD_STAT_POINT_BUDGET}-point allocation budget, Stock
          Moves, and no Patch. Results never change Story progress.
        </p>
      </div>
      <div class="quick-versus">
        <article class="quick-pick">
          <span>Your Lineup · ${model.playerIds.length}/3</span>
          ${lineupControls("Player", model.playerIds)}
          <img src="${resolveImagePath(player.portraitAssetId)}" data-asset-id="${player.portraitAssetId}" alt="" />
          <strong>${player.name}</strong>
          <small>${formatClass(player.classId)} · Standard L${STANDARD_MATCH_LEVEL}</small>
        </article>
        <span class="versus-stamp" aria-hidden="true">VS</span>
        <article class="quick-pick is-enemy">
          <span>Opponent Lineup · ${model.enemyIds.length}/3</span>
          ${lineupControls("Enemy", model.enemyIds)}
          <img src="${resolveImagePath(enemy.portraitAssetId)}" data-asset-id="${enemy.portraitAssetId}" alt="" />
          <strong>${enemy.name}</strong>
          <small>${formatClass(enemy.classId)} · Standard L${STANDARD_MATCH_LEVEL}</small>
        </article>
      </div>
      ${renderClassWheel()}
      <div class="quick-footer">
        <label>
          <span>Difficulty</span>
          <select name="difficulty">${model.difficultyOptions}</select>
        </label>
        <button class="primary-action" data-command="start-quick-battle">
          Start Quick Fight <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  `;
}
