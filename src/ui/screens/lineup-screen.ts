import type { Difficulty } from "../../combat/types";
import { combatContent } from "../../content/initial-content";
import type { SaveData } from "../../persistence/save";
import { firstRunEncounter } from "../../story/first-run";
import {
  renderFightSetupAccessory,
  renderFightSetupFrame,
  renderFightSetupRules,
  type FightSetupMember,
} from "../components/fight-setup";
import { renderTraitSynergy } from "../components/trait-synergy";
import { formatLabel } from "../format";
import { ICONS } from "../icons";

export interface LineupScreenModel {
  save: SaveData;
  difficulty: Difficulty;
}

export function renderLineupScreen(model: LineupScreenModel): string {
  const encounter = firstRunEncounter(model.save.currentNodeId);
  const playerMembers = encounter.playerCharacterIds.map(
    (characterId, index): FightSetupMember => {
      const character = combatContent.characters[characterId]!;
      const owned = model.save.collection.find(
        (entry) => entry.characterId === characterId,
      );
      return {
        characterId,
        slotLabel: index === 0 ? "Starts" : `Bench ${index}`,
        detail: `Level ${owned?.level ?? character.level} · ${owned ? "Owned build" : "Story loan"}`,
      };
    },
  );
  const enemyMembers = encounter.enemyCharacterIds.map(
    (characterId, index): FightSetupMember => ({
      characterId,
      slotLabel: index === 0 ? "Starts" : `Bench ${index}`,
      detail: `${formatLabel(combatContent.characters[characterId]!.typeId)} · Story rival`,
    }),
  );
  const summary =
    encounter.nodeId === "story.first-run.05"
      ? "Two paired Lineups share one Charge Strip each. Trait bonuses are active on both sides."
      : "Story loans fill any missing collection slots. Your Lineup keeps its owned builds and earns Story rewards.";

  return renderFightSetupFrame({
    mode: "story",
    titleId: "lineup-title",
    title: encounter.title,
    summary,
    backControl: `<button class="text-button" data-route="story">${ICONS.arrowLeft}<span>Back to Story</span></button>`,
    rulesHtml: renderFightSetupRules("Story encounter", [
      `Node ${encounter.index}`,
      formatLabel(model.difficulty),
      "Owned and loan builds",
      "Story rewards active",
    ]),
    player: {
      label: "Your Lineup",
      countLabel: `${playerMembers.length} deployed`,
      members: playerMembers,
      accessoryHtml: renderFightSetupAccessory("accessory.press-pass", {
        status: "Equipped",
      }),
      synergyHtml: renderTraitSynergy(encounter.playerCharacterIds),
    },
    enemy: {
      label: "Opposing Lineup",
      countLabel: `${enemyMembers.length} revealed`,
      members: enemyMembers,
      accessoryHtml: renderFightSetupAccessory("accessory.dead-air", {
        status: "Opponent",
      }),
      synergyHtml: renderTraitSynergy(encounter.enemyCharacterIds),
      enemy: true,
    },
    footerHtml: `
      <strong>Node ${encounter.index} · ${encounter.title}</strong>
      <span>${formatLabel(model.difficulty)} difficulty · victory advances First Run</span>
    `,
    actionHtml: `
      <button class="primary-action" data-command="start-battle">
        Confirm Lineup · Start Fight ${ICONS.arrowRight}
      </button>
    `,
  });
}
