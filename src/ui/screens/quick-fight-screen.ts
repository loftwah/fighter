import {
  STANDARD_MATCH_LEVEL,
  STANDARD_STAT_POINT_BUDGET,
} from "../../combat/standard-build";
import { combatContent } from "../../content/initial-content";
import {
  renderFightSetupAccessory,
  renderFightSetupFrame,
  renderFightSetupRules,
  type FightSetupMember,
} from "../components/fight-setup";
import { renderTraitSynergy } from "../components/trait-synergy";
import { escapeHtml, formatLabel } from "../format";

export interface QuickFightScreenModel {
  playerIds: readonly string[];
  enemyIds: readonly string[];
  playerAccessoryId: string;
  enemyAccessoryId: string;
  difficultyOptions: string;
}

export function renderQuickFightScreen(model: QuickFightScreenModel): string {
  const characterOptions = (
    selectedIds: readonly string[],
    selectedId: string | undefined,
    optional: boolean,
  ): string =>
    `${optional ? '<option value="">Leave slot open</option>' : ""}${Object.values(
      combatContent.characters,
    )
      .map((character) => {
        const traitLabel =
          character.traitIds.length > 0
            ? character.traitIds.map(formatLabel).join("/")
            : "No Trait";
        const alreadySelected =
          character.id !== selectedId && selectedIds.includes(character.id);
        return `<option value="${character.id}" ${
          character.id === selectedId ? "selected" : ""
        } ${alreadySelected ? "disabled" : ""}>${escapeHtml(character.name)} · ${formatLabel(character.typeId)} · ${traitLabel}</option>`;
      })
      .join("")}`;

  const lineupMembers = (
    side: "Player" | "Enemy",
    selectedIds: readonly string[],
  ): FightSetupMember[] =>
    [0, 1, 2].map((index) => {
      const characterId = selectedIds[index];
      return {
        characterId,
        slotLabel: index === 0 ? "Starts" : `Bench ${index}`,
        detail: characterId
          ? `${formatLabel(combatContent.characters[characterId]!.typeId)} · Level ${STANDARD_MATCH_LEVEL}`
          : "Optional bench position",
        control: {
          label: index === 0 ? "Starting Character" : `Bench ${index}`,
          name: `quick${side}.${index}`,
          options: characterOptions(selectedIds, characterId, index > 0),
        },
      };
    });

  return renderFightSetupFrame({
    mode: "quick",
    titleId: "quick-title",
    title: "Set the match.",
    summary:
      "Build both sides, check the matchup, then take the same Lineups straight into battle.",
    backControl:
      '<button class="text-button" data-command="main-menu">← Main Menu</button>',
    rulesHtml: renderFightSetupRules("Standard fight", [
      `Level ${STANDARD_MATCH_LEVEL}`,
      `${STANDARD_STAT_POINT_BUDGET} equal stat points`,
      "Stock Moves",
      "No Modifications",
      "No Story rewards",
    ]),
    player: {
      label: "Your Lineup",
      countLabel: `${model.playerIds.length} / 3 selected`,
      members: lineupMembers("Player", model.playerIds),
      accessoryHtml: renderFightSetupAccessory(model.playerAccessoryId, {
        selectName: "quickPlayerAccessory",
      }),
      synergyHtml: renderTraitSynergy([...model.playerIds]),
    },
    enemy: {
      label: "Opponent Lineup",
      countLabel: `${model.enemyIds.length} / 3 selected`,
      members: lineupMembers("Enemy", model.enemyIds),
      accessoryHtml: renderFightSetupAccessory(model.enemyAccessoryId, {
        selectName: "quickEnemyAccessory",
      }),
      synergyHtml: renderTraitSynergy([...model.enemyIds]),
      enemy: true,
    },
    footerHtml: `
      <strong>Ready when the matchup looks right.</strong>
      <label class="fight-difficulty">
        <span>Difficulty</span>
        <select name="difficulty">${model.difficultyOptions}</select>
      </label>
    `,
    actionHtml: `
      <button class="primary-action" data-command="start-quick-battle">
        Confirm Lineups · Start Fight <span aria-hidden="true">→</span>
      </button>
    `,
  });
}
