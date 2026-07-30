import {
  STANDARD_MATCH_LEVEL,
  STANDARD_STAT_POINT_BUDGET,
} from "../../combat/standard-build";
import { combatContent } from "../../content/initial-content";
import { resolveImagePath } from "../../assets/registry";
import {
  renderCharacterTraits,
  renderTraitSynergy,
} from "../components/trait-synergy";
import { renderTypeWheel } from "../components/type-wheel";
import { formatLabel } from "../format";

export interface QuickFightScreenModel {
  playerIds: readonly string[];
  enemyIds: readonly string[];
  playerAccessoryId: string;
  enemyAccessoryId: string;
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
      .map((character) => {
        const traitLabel =
          character.traitIds.length > 0
            ? character.traitIds.map(formatLabel).join("/")
            : "No Trait";
        return `<option value="${character.id}" ${
          character.id === selectedId ? "selected" : ""
        }>${character.name} · ${formatLabel(character.typeId)} · ${traitLabel}</option>`;
      })
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
              <span>${index === 0 ? "Active Character" : `Bench ${index}`}</span>
              <select name="quick${side}.${index}">
                ${characterOptions(selectedIds[index], index > 0)}
              </select>
            </label>
          `,
        )
        .join("")}
    </div>
  `;
  const accessoryControl = (
    name: "quickPlayerAccessory" | "quickEnemyAccessory",
    selectedId: string,
  ): string => {
    const selectedAccessory = combatContent.accessories[selectedId];
    return `
    <label class="quick-accessory">
      <span>Team Accessory</span>
      <select name="${name}">
        ${Object.values(combatContent.accessories)
          .map(
            (accessory) =>
              `<option value="${accessory.id}" ${
                accessory.id === selectedId ? "selected" : ""
              }>${accessory.name}</option>`,
          )
          .join("")}
      </select>
      <small>${selectedAccessory?.description ?? ""}</small>
    </label>
  `;
  };
  return `
    <section class="quick-setup" aria-labelledby="quick-title">
      <div class="quick-heading">
        <button class="text-button" data-command="main-menu">← Main Menu</button>
        <h1 id="quick-title">Build a Quick Fight.</h1>
        <p>
          Standard rules: every Character is Level ${STANDARD_MATCH_LEVEL}, has the
          same ${STANDARD_STAT_POINT_BUDGET}-point allocation budget, Stock
          Moves, and no Modification. Trait score 2 activates a bonus; score 3
          upgrades it. Results never change Story progress.
        </p>
      </div>
      <div class="quick-versus">
        <article class="quick-pick">
          <span>Your Lineup · ${model.playerIds.length}/3</span>
          ${lineupControls("Player", model.playerIds)}
          ${accessoryControl("quickPlayerAccessory", model.playerAccessoryId)}
          <img src="${resolveImagePath(player.portraitAssetId)}" data-asset-id="${player.portraitAssetId}" alt="" />
          <strong>${player.name}</strong>
          <small>${formatLabel(player.typeId)} · Standard L${STANDARD_MATCH_LEVEL}</small>
          <div class="trait-chip-row">${renderCharacterTraits(player)}</div>
          ${renderTraitSynergy([...model.playerIds])}
        </article>
        <span class="versus-stamp" aria-hidden="true">VS</span>
        <article class="quick-pick is-enemy">
          <span>Opponent Lineup · ${model.enemyIds.length}/3</span>
          ${lineupControls("Enemy", model.enemyIds)}
          ${accessoryControl("quickEnemyAccessory", model.enemyAccessoryId)}
          <img src="${resolveImagePath(enemy.portraitAssetId)}" data-asset-id="${enemy.portraitAssetId}" alt="" />
          <strong>${enemy.name}</strong>
          <small>${formatLabel(enemy.typeId)} · Standard L${STANDARD_MATCH_LEVEL}</small>
          <div class="trait-chip-row">${renderCharacterTraits(enemy)}</div>
          ${renderTraitSynergy([...model.enemyIds])}
        </article>
      </div>
      ${renderTypeWheel()}
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
