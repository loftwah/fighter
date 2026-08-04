import { missions, storyNodes } from "../../content/initial-content";
import type { SaveData } from "../../persistence/save";
import {
  firstRunCompletionStatus,
  FIRST_RUN_ENDING_REWARD,
  FIRST_RUN_REQUIRED_MISSION_IDS,
  FIRST_RUN_REQUIRED_TROPHY_IDS,
} from "../../story/first-run";
import { firstRunStoryPanel } from "../../story/first-run-panels";
import { tournamentTrophies } from "../../tournaments/catalog";
import { escapeHtml } from "../format";

export function renderStoryScreen(save: SaveData): string {
  const cleared = new Set(save.clearedNodeIds);
  const firstRunComplete = cleared.has("story.first-run.07");
  const atEnding = save.currentNodeId === "story.first-run.07";
  const completion = firstRunCompletionStatus(save);
  const baseProgress = firstRunStoryPanel(save.currentNodeId);
  const progress =
    atEnding && firstRunComplete
      ? {
          title: "First Run: complete.",
          copy: "The impossible bracket is finished, its Trophy is in your cabinet, and Ned Kelly remains available as a rival. Quick Fight is now the open-ended sandbox.",
          speaker: "VIKING",
          line: "Good tournament. Still no idea who invited us.",
          action: "First Run complete",
        }
      : atEnding && !completion.ready
        ? {
            title: "The bracket is not the whole story.",
            copy: "First Run finishes when every required Mission and Tournament is complete. Nothing expires; return to the remaining work whenever you like.",
            speaker: "TUX",
            line: "The final condition is an AND, not an enthusiastic suggestion.",
            action:
              completion.incompleteMissionIds.length > 0
                ? "Finish remaining Missions"
                : "Win the remaining Tournament",
          }
        : baseProgress;
  const endingButtonAttribute =
    atEnding && !firstRunComplete && !completion.ready
      ? completion.incompleteMissionIds.length > 0
        ? 'data-route="missions"'
        : 'data-route="tournament"'
      : 'data-command="continue-story"';
  const completionItems = [
    ...FIRST_RUN_REQUIRED_MISSION_IDS.map((missionId) => {
      const mission = missions.find((candidate) => candidate.id === missionId);
      if (!mission) {
        return "";
      }
      const complete =
        save.claimedMissionIds.includes(mission.id) ||
        (save.missionProgress[mission.id] ?? 0) >= mission.target;
      return `<li class="${complete ? "is-complete" : ""}"><span>${complete ? "✓" : "○"}</span><strong>Mission · ${escapeHtml(mission.name)}</strong></li>`;
    }),
    ...FIRST_RUN_REQUIRED_TROPHY_IDS.map((trophyId) => {
      const trophy = tournamentTrophies[trophyId];
      const complete = save.tournamentTrophyIds.includes(trophyId);
      return `<li class="${complete ? "is-complete" : ""}"><span>${complete ? "✓" : "○"}</span><strong>Tournament · ${escapeHtml(trophy?.name ?? trophyId)}</strong></li>`;
    }),
  ].join("");
  return `
    <section class="story-board" aria-labelledby="story-title">
      <div class="story-art" role="img" aria-label="An impossible tournament invitation"></div>
      <div class="story-copy">
        <p class="story-label">Main story · First Run</p>
        <h1 id="story-title">${escapeHtml(progress.title)}</h1>
        <p>${escapeHtml(progress.copy)}</p>
        <div class="dialogue-line">
          <span class="speaker-stamp">${escapeHtml(progress.speaker)}</span>
          <q>${escapeHtml(progress.line)}</q>
        </div>
        <button
          class="primary-action"
          ${endingButtonAttribute}
          ${atEnding && firstRunComplete ? "disabled" : ""}
        >
          ${escapeHtml(progress.action)} <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
    ${
      atEnding
        ? `
          <aside class="ending-reward-panel ${
            firstRunComplete ? "is-claimed" : ""
          }" aria-label="First Run ending reward">
            <span>${firstRunComplete ? "ARCHIVED" : "ENDING REWARD"}</span>
            <ul class="story-completion-list" aria-label="Story completion requirements">
              ${completionItems}
            </ul>
            <div>
              <strong>★ ${FIRST_RUN_ENDING_REWARD} Stamps</strong>
              <strong>Rival file · Ned Kelly</strong>
              <strong>Trophy · Wrong Door Cup</strong>
            </div>
            ${
              firstRunComplete
                ? `
                  <button class="primary-action" data-command="enter-quick">
                    Open end-game Quick Fight <span aria-hidden="true">→</span>
                  </button>
                `
                : ""
            }
          </aside>
        `
        : ""
    }
    <section class="node-strip" aria-labelledby="path-title">
      <div class="section-heading">
        <h2 id="path-title">Eight stops through one impossible bracket.</h2>
        <p>Cleared nodes remain replayable. Locked nodes preview what comes next.</p>
      </div>
      <ol class="story-path">
        ${storyNodes
          .map((node) => {
            const isAvailable =
              cleared.has(node.id) || node.id === save.currentNodeId;
            const isCleared = cleared.has(node.id);
            return `
              <li class="story-node ${isCleared ? "is-cleared" : ""} ${
                isAvailable ? "" : "is-locked"
              }">
                <span class="node-index">${node.index}</span>
                <span class="node-kind">${node.type}</span>
                <strong>${node.title}</strong>
                <span>${node.summary}</span>
                <span class="node-state">${
                  isCleared ? "Cleared" : isAvailable ? "Available" : "Locked"
                }</span>
              </li>
            `;
          })
          .join("")}
      </ol>
    </section>
  `;
}
