import { storyNodes } from "../../content/initial-content";
import type { SaveData } from "../../persistence/save";
import { FIRST_RUN_ENDING_REWARD } from "../../story/first-run";
import { firstRunStoryPanel } from "../../story/first-run-panels";
import { escapeHtml } from "../format";

export function renderStoryScreen(save: SaveData): string {
  const cleared = new Set(save.clearedNodeIds);
  const firstRunComplete = cleared.has("story.first-run.07");
  const baseProgress = firstRunStoryPanel(save.currentNodeId);
  const progress =
    save.currentNodeId === "story.first-run.07" && firstRunComplete
      ? {
          title: "First Run: complete.",
          copy: "The impossible bracket is finished, the champion badge is recorded, and Ned Kelly remains available as a rival.",
          speaker: "VIKING",
          line: "Good tournament. Still no idea who invited us.",
          action: "First Run complete",
        }
      : baseProgress;
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
          data-command="continue-story"
          ${
            save.currentNodeId === "story.first-run.07" && firstRunComplete
              ? "disabled"
              : ""
          }
        >
          ${escapeHtml(progress.action)} <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
    ${
      save.currentNodeId === "story.first-run.07"
        ? `
          <aside class="ending-reward-panel ${
            firstRunComplete ? "is-claimed" : ""
          }" aria-label="First Run ending reward">
            <span>${firstRunComplete ? "ARCHIVED" : "ENDING REWARD"}</span>
            <div>
              <strong>★ ${FIRST_RUN_ENDING_REWARD} Stamps</strong>
              <strong>Rival file · Ned Kelly</strong>
              <strong>Badge · Wrong Door Champion</strong>
            </div>
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
