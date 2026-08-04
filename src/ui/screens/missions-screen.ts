import { missions } from "../../content/initial-content";
import type { SaveData } from "../../persistence/save";
import { renderLockedFeature } from "../components/locked-feature";

export function renderMissionsScreen(save: SaveData, locked: boolean): string {
  if (locked) {
    return renderLockedFeature(
      "missions-title",
      "Mission Board",
      "Inspect Lost Property in Node 03 to reveal these missions.",
    );
  }
  return `
    <section class="mission-board" aria-labelledby="missions-title">
      ${
        save.currentNodeId === "story.first-run.04"
          ? `
            <aside class="story-unlock-slip">
              <div>
                <span>First Run · Node 04</span>
                <strong>Three missions unlocked</strong>
                <p>Progress is semantic: losses can count actions, but win objectives still require a win.</p>
              </div>
              <button class="primary-action" data-command="advance-story-node">
                Set the Qualifier Lineup <span aria-hidden="true">→</span>
              </button>
            </aside>
          `
          : ""
      }
      <div class="section-heading">
        <h1 id="missions-title">Reasons to make it personal.</h1>
        <p>
          Action objectives can progress on a loss. Win objectives remain
          stubbornly interested in winning.
        </p>
      </div>
      <div class="mission-list">
        ${missions
          .map((mission) => {
            const claimed = save.claimedMissionIds.includes(mission.id);
            const progress = claimed
              ? mission.target
              : Math.min(mission.target, save.missionProgress[mission.id] ?? 0);
            const complete = claimed || progress >= mission.target;
            return `
              <article class="mission-slip ${complete ? "is-complete" : ""}">
                <span class="mission-check" aria-hidden="true">${
                  complete ? "✓" : "×"
                }</span>
                <div>
                  <h2>${mission.name}</h2>
                  <p>${mission.description}</p>
                </div>
                <div class="mission-progress">
                  <strong>${progress}/${mission.target}</strong>
                  ${
                    claimed
                      ? `<span>Paid · ★ ${mission.rewardStamps}</span>`
                      : complete
                        ? `<button data-command="claim-mission" data-mission-id="${mission.id}">Claim ★ ${mission.rewardStamps}</button>`
                        : `<span>★ ${mission.rewardStamps}</span>`
                  }
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}
