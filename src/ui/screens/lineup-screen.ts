import { resolveImagePath } from "../../assets/registry";
import { combatContent } from "../../content/initial-content";
import type { Difficulty } from "../../combat/types";
import type { SaveData } from "../../persistence/save";
import { firstRunEncounter } from "../../story/first-run";
import {
  renderCharacterTraits,
  renderTraitSynergy,
} from "../components/trait-synergy";
import { renderTypeWheel } from "../components/type-wheel";
import { formatLabel } from "../format";

export interface LineupScreenModel {
  save: SaveData;
  difficulty: Difficulty;
}

export function renderLineupScreen(model: LineupScreenModel): string {
  const encounter = firstRunEncounter(model.save.currentNodeId);
  const lineup = encounter.playerCharacterIds;
  return `
    <section class="lineup-workbench" aria-labelledby="lineup-title">
      <div class="lineup-heading">
        <button class="text-button" data-route="story">← Back to story</button>
        <h1 id="lineup-title">${
          encounter.nodeId === "story.first-run.05"
            ? "Two characters. One shared Strip."
            : "Build the impossible Lineup."
        }</h1>
        <p>
          ${
            encounter.nodeId === "story.first-run.05"
              ? "Tux and Humpty activate Icon. Moses and Grim Reaper activate Mythic. Both pairs are supplied as Story loans when needed."
              : "Story loaners are marked in yellow. Your Charge Strip belongs to the Lineup and survives every switch."
          }
        </p>
      </div>
      <div class="match-sheet">
        <div class="lineup-side">
          <h2>Your Lineup</h2>
          ${lineup
            .map((id) =>
              renderLineupRelic(
                model.save,
                id,
                !model.save.collection.some(
                  (entry) => entry.characterId === id,
                ),
              ),
            )
            .join("")}
          ${renderTraitSynergy(lineup)}
        </div>
        <div class="versus-stamp" aria-label="versus">VS</div>
        <div class="lineup-side is-enemy">
          <h2>Opposing Lineup</h2>
          ${encounter.enemyCharacterIds
            .map((id) => renderLineupRelic(model.save, id, false))
            .join("")}
          ${renderTraitSynergy(encounter.enemyCharacterIds)}
          <div class="type-wheel-mini">${renderTypeWheel()}</div>
        </div>
      </div>
      <div class="lineup-footer">
        <div>
          <span>Node ${encounter.index} · ${encounter.title}</span>
          <strong>${formatLabel(model.difficulty)}</strong>
        </div>
        <button class="primary-action" data-command="start-battle">
          Tear into battle <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  `;
}

function renderLineupRelic(
  save: SaveData,
  characterId: string,
  loaned: boolean,
): string {
  const character = combatContent.characters[characterId]!;
  const owned = save.collection.find(
    (entry) => entry.characterId === characterId,
  );
  const level = owned?.level ?? character.level;
  return `
    <article class="lineup-ticket">
      <div class="ticket-portrait is-${character.typeId}">
        <img src="${resolveImagePath(character.portraitAssetId)}" data-asset-id="${character.portraitAssetId}" alt="" />
      </div>
      <div>
        <span class="type-mark">${formatLabel(character.typeId)}</span>
        <h3>${character.name}</h3>
        <p>Level ${level} · ${owned ? "Owned build" : loaned ? "Story loan" : "Ready"}</p>
        <div class="trait-chip-row">${renderCharacterTraits(character)}</div>
      </div>
      <span class="ticket-notch" aria-hidden="true"></span>
    </article>
  `;
}
