import {
  STANDARD_MATCH_LEVEL,
  STANDARD_STAT_POINT_BUDGET,
} from "../../combat/standard-build";
import { combatContent } from "../../content/initial-content";
import {
  resolveImageObjectPosition,
  resolveImagePath,
} from "../../assets/registry";
import {
  renderCharacterTraits,
  renderTraitSynergy,
} from "../components/trait-synergy";
import { formatLabel } from "../format";

export interface QuickFightScreenModel {
  playerIds: readonly string[];
  enemyIds: readonly string[];
  playerAccessoryId: string;
  enemyAccessoryId: string;
  difficultyOptions: string;
}

export function renderQuickFightScreen(model: QuickFightScreenModel): string {
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
  const lineupStage = (
    side: "Your" | "Opponent",
    selectedIds: readonly string[],
  ): string => {
    const characters = selectedIds
      .map((id) => combatContent.characters[id])
      .filter((character) => character !== undefined);
    return `
      <div
        class="quick-lineup-stage"
        data-lineup-count="${characters.length}"
        aria-label="${side} selected Lineup"
      >
        ${characters
          .map(
            (character, index) => `
              <article class="quick-lineup-member">
                <img
                  src="${resolveImagePath(character.portraitAssetId)}"
                  data-asset-id="${character.portraitAssetId}"
                  style="object-position: ${resolveImageObjectPosition(character.portraitAssetId)}"
                  alt=""
                />
                <div>
                  <strong>${character.name}</strong>
                  <small>${index === 0 ? "Starts" : `Bench ${index}`} · ${formatLabel(character.typeId)} · Level ${STANDARD_MATCH_LEVEL}</small>
                  <span class="trait-chip-row">${renderCharacterTraits(character)}</span>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    `;
  };
  const accessoryControl = (
    name: "quickPlayerAccessory" | "quickEnemyAccessory",
    selectedId: string,
  ): string => {
    const selectedAccessory = combatContent.accessories[selectedId];
    return `
    <label class="quick-accessory">
      <span>Accessory</span>
      <span class="quick-accessory-preview">
        ${
          selectedAccessory
            ? `<img src="${resolveImagePath(selectedAccessory.imageAssetId)}" data-asset-id="${selectedAccessory.imageAssetId}" alt="" />`
            : '<span class="quick-accessory-empty" aria-hidden="true">—</span>'
        }
        <span>
          <strong>${selectedAccessory?.name ?? "No Accessory"}</strong>
          <small class="quick-accessory-effect">${selectedAccessory?.description ?? ""}</small>
        </span>
      </span>
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
    </label>
  `;
  };
  return `
    <section class="quick-setup" data-fight-setup aria-labelledby="quick-title">
      <div class="quick-heading">
        <button class="text-button" data-command="main-menu">← Main Menu</button>
        <h1 id="quick-title">Choose the Lineups.</h1>
        <div class="quick-rule-strip" aria-label="Standard fight rules">
          <strong>Standard fight</strong>
          <span>Level ${STANDARD_MATCH_LEVEL}</span>
          <span>${STANDARD_STAT_POINT_BUDGET} equal stat points</span>
          <span>Stock Moves</span>
          <span>No Modifications</span>
          <span>No Story rewards</span>
        </div>
      </div>
      <div class="quick-versus">
        <article class="quick-pick">
          <span class="quick-side-label">Your Lineup · ${model.playerIds.length}/3</span>
          ${lineupStage("Your", model.playerIds)}
          ${lineupControls("Player", model.playerIds)}
          ${accessoryControl("quickPlayerAccessory", model.playerAccessoryId)}
          ${renderTraitSynergy([...model.playerIds])}
        </article>
        <span class="versus-stamp" aria-hidden="true">VS</span>
        <article class="quick-pick is-enemy">
          <span class="quick-side-label">Opponent Lineup · ${model.enemyIds.length}/3</span>
          ${lineupStage("Opponent", model.enemyIds)}
          ${lineupControls("Enemy", model.enemyIds)}
          ${accessoryControl("quickEnemyAccessory", model.enemyAccessoryId)}
          ${renderTraitSynergy([...model.enemyIds])}
        </article>
      </div>
      <div class="quick-footer">
        <label>
          <span>Difficulty</span>
          <select name="difficulty">${model.difficultyOptions}</select>
        </label>
        <button class="primary-action" data-command="start-quick-battle">
          Confirm Lineups · Start Fight <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  `;
}
