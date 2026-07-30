import { resolveImagePath } from "../../assets/registry";
import { combatContent } from "../../content/initial-content";
import type { Difficulty } from "../../combat/types";
import type { SaveData } from "../../persistence/save";
import { firstRunEncounter } from "../../story/first-run";
import { renderClassWheel } from "../components/class-wheel";
import { formatClass } from "../format";

export interface LineupScreenModel {
  save: SaveData;
  difficulty: Difficulty;
}

export function renderLineupScreen(model: LineupScreenModel): string {
  const encounter = firstRunEncounter(model.save.currentNodeId);
  const lineup = encounter.playerCharacterIds;
  const factionCounts = new Map<string, number>();
  for (const id of lineup) {
    const factionId = combatContent.characters[id]!.factionId;
    factionCounts.set(factionId, (factionCounts.get(factionId) ?? 0) + 1);
  }
  const synergyCount = Math.max(...factionCounts.values());
  return `
    <section class="lineup-workbench" aria-labelledby="lineup-title">
      <div class="lineup-heading">
        <button class="text-button" data-route="story">← Back to story</button>
        <h1 id="lineup-title">${
          encounter.nodeId === "story.first-run.05"
            ? "Two prints. One shared strip."
            : "Pull three. Print one."
        }</h1>
        <p>
          ${
            encounter.nodeId === "story.first-run.05"
              ? "Qualifier rules require two Relics. Zipwire is supplied as a story loan when you do not own a copy."
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
          <div class="synergy-ticket">
            <span>Free Shelf ×${synergyCount}</span>
            <strong>${
              synergyCount >= 3
                ? "+2 Vitality · +2 Power"
                : synergyCount >= 2
                  ? "+2 Vitality"
                  : "No active synergy"
            }</strong>
          </div>
        </div>
        <div class="versus-stamp" aria-label="versus">VS</div>
        <div class="lineup-side is-enemy">
          <h2>The Ledger</h2>
          ${encounter.enemyCharacterIds
            .map((id) => renderLineupRelic(model.save, id, false))
            .join("")}
          <div class="class-wheel-mini">${renderClassWheel()}</div>
        </div>
      </div>
      <div class="lineup-footer">
        <div>
          <span>Node ${encounter.index} · ${encounter.title}</span>
          <strong>${formatClass(model.difficulty)}</strong>
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
      <div class="ticket-portrait is-${character.classId}">
        <img src="${resolveImagePath(character.portraitAssetId)}" data-asset-id="${character.portraitAssetId}" alt="" />
      </div>
      <div>
        <span class="class-mark">${formatClass(character.classId)}</span>
        <h3>${character.name}</h3>
        <p>Level ${level} · ${owned ? "Owned build" : loaned ? "Story loan" : "Ready"}</p>
      </div>
      <span class="ticket-notch" aria-hidden="true"></span>
    </article>
  `;
}
