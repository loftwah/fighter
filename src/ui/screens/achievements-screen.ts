import type { SaveData } from "../../persistence/save";
import { evaluateAchievements } from "../../progression/achievements";
import { escapeHtml } from "../format";
import { ICONS } from "../icons";

export function renderAchievementsScreen(save: SaveData): string {
  const progress = evaluateAchievements(save);
  const complete = progress.filter(
    (achievement) => achievement.complete,
  ).length;
  return `
    <section class="achievements-sheet" aria-labelledby="achievements-title">
      <div class="section-heading">
        <button class="text-button" data-command="main-menu">${ICONS.arrowLeft}<span>Main Menu</span></button>
        <p class="eyebrow">Player record · ${complete}/${progress.length}</p>
        <h1 id="achievements-title">Achievements</h1>
        <p>
          Awards are derived from the selected local profile, so earlier
          progress is recognised automatically.
        </p>
      </div>
      <div class="achievement-list">
        ${progress
          .map(
            (achievement, index) => `
              <article class="achievement-ticket ${
                achievement.complete ? "is-complete" : ""
              }">
                <span class="achievement-number">${String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p class="eyebrow">${achievement.complete ? "Unlocked" : "In progress"}</p>
                  <h2>${escapeHtml(achievement.name)}</h2>
                  <p>${escapeHtml(achievement.description)}</p>
                </div>
                <strong aria-label="${achievement.current} of ${achievement.target}">
                  ${achievement.complete ? "STAMPED" : `${achievement.current}/${achievement.target}`}
                </strong>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}
