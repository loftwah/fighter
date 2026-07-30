import { STANDARD_MATCH_LEVEL } from "../../combat/standard-build";
import { combatContent } from "../../content/initial-content";
import type { SaveData, TournamentRunData } from "../../persistence/save";
import {
  cheapSeatsEncounter,
  cheapSeatsEncounters,
} from "../../tournaments/cheap-seats";
import type { SessionMode } from "../../app/routes";
import { renderLockedFeature } from "../components/locked-feature";
import { escapeHtml } from "../format";

export interface TournamentScreenModel {
  save: SaveData;
  sessionMode: SessionMode;
  run: TournamentRunData | null;
  locked: boolean;
}

export function renderTournamentScreen(model: TournamentScreenModel): string {
  if (model.locked) {
    return renderLockedFeature(
      "tournament-title",
      "The Cheap Seats Cup",
      "Clear the two-Relic qualifier to earn a place in the bracket.",
    );
  }
  const champion = model.save.tournamentBadges.includes(
    "badge.cheap-seats-champion",
  );
  const encounter = cheapSeatsEncounter(model.run?.roundIndex ?? 0);
  const caseEntries = Object.entries(model.run?.healthRatios ?? {});
  const caseStatus =
    caseEntries.length > 0
      ? caseEntries
          .map(([instanceId, ratio]) => {
            const owned = model.save.collection.find(
              (entry) => entry.instanceId === instanceId,
            );
            const character = owned
              ? combatContent.characters[owned.characterId]
              : Object.values(combatContent.characters).find((candidate) =>
                  instanceId.includes(candidate.id),
                );
            return `<span><strong>${escapeHtml(character?.name ?? "Case Relic")}</strong>${Math.round(ratio * 100)}% Case health</span>`;
          })
          .join("")
      : "<span><strong>Fresh Case</strong>Full health at the opening bell</span>";
  const controls =
    model.run?.phase === "interlude"
      ? `
        <div class="cup-drops" aria-label="Choose an interstitial drop">
          <button data-command="cup-drop" data-drop="front-print-repair">
            <strong>Front Print Repair</strong>
            Heal the Relic that ended the prior round active by 45%.
          </button>
          <button data-command="cup-drop" data-drop="case-repair">
            <strong>Case Repair</strong>
            Heal the Case by 18% and revive one defeated Relic at 35%.
          </button>
          <button data-command="cup-drop" data-drop="hot-start">
            <strong>Hot Start</strong>
            Begin the next round with another 18 Charge.
          </button>
        </div>
      `
      : `
        <button class="primary-action" data-command="start-tournament">
          ${model.run ? `Enter Round ${encounter.roundIndex + 1}` : "Open Case · Enter Round 1"}
          <span aria-hidden="true">→</span>
        </button>
      `;
  return `
    <section class="tournament-poster" aria-labelledby="tournament-title">
      <div class="tournament-art"></div>
      <div class="tournament-copy">
        <button class="text-button" ${
          model.sessionMode === "story"
            ? 'data-route="story"'
            : 'data-command="main-menu"'
        }>
          ← ${model.sessionMode === "story" ? "Back to Story" : "Main Menu"}
        </button>
        ${champion ? '<span class="cup-badge">★ Cheap Seats Champion</span>' : ""}
        <h1 id="tournament-title">The Cheap Seats Cup</h1>
        <p>
          ${
            model.run?.phase === "interlude"
              ? `Round ${model.run.roundIndex} is stamped. Choose one drop before ${escapeHtml(encounter.title)}.`
              : `Round ${encounter.roundIndex + 1} · ${escapeHtml(encounter.title)} — ${escapeHtml(encounter.subtitle)}`
          }
        </p>
        <div class="bracket">
          ${cheapSeatsEncounters
            .map(
              (round) => `
                <span class="${
                  model.run && round.roundIndex < model.run.roundIndex
                    ? "is-cleared"
                    : round.roundIndex === (model.run?.roundIndex ?? 0)
                      ? "is-current"
                      : ""
                }">
                  Round ${round.roundIndex + 1}<br />
                  <strong>${escapeHtml(round.title)}</strong>
                </span>
              `,
            )
            .join("")}
        </div>
        <div class="case-health">${caseStatus}</div>
        ${controls}
        <small>
          ${
            model.sessionMode === "story"
              ? "This Story Case locks owned and authored-loan builds."
              : `Standalone Case Relics use the Level ${STANDARD_MATCH_LEVEL} Standard Build.`
          }
          Case health, defeats, chosen drops, and the current round persist in
          this ${
            model.sessionMode === "story" ? "Story game" : "Tournament game"
          }. Equipped Patches stay locked for the run.${
            champion ? " Opening a new Case replays the full bracket." : ""
          }
        </small>
      </div>
    </section>
  `;
}
