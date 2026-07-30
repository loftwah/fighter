import type { SaveData } from "../../persistence/save";
import { escapeHtml } from "../format";

export interface MainMenuScreenModel {
  save: SaveData;
  devToolsEnabled: boolean;
}

export function renderMainMenuScreen(model: MainMenuScreenModel): string {
  const storyStarted =
    model.save.clearedNodeIds.length > 0 ||
    model.save.collection.length > 0 ||
    model.save.currentNodeId !== "story.first-run.00";
  const storyComplete =
    model.save.clearedNodeIds.includes("story.first-run.07");
  const standaloneRun = model.save.standaloneTournamentRun;
  return `
    <section class="main-menu" aria-labelledby="main-menu-title">
      <div class="main-menu-intro">
        <h1 id="main-menu-title">Choose a game.</h1>
        <p>
          Nothing starts until you choose it. Story Mode keeps progression;
          Quick Fight is a sandbox; Tournament is a separate multi-round run.
        </p>
      </div>
      <div class="mode-launcher">
        <article class="mode-bill mode-story">
          <div class="mode-art mode-art-story" role="img" aria-label="An impossible tournament invitation"></div>
          <div class="mode-copy">
            <h2>Story Mode</h2>
            <p>
              Play First Run from dialogue to battles, Store, Missions, the
              story Cup, and the ending. This is where your collection grows.
            </p>
            <dl>
              <div><dt>Story</dt><dd>First Run</dd></div>
              <div><dt>Status</dt><dd>${
                storyComplete
                  ? "Complete"
                  : storyStarted
                    ? "In progress"
                    : "Not started"
              }</dd></div>
            </dl>
            <button class="primary-action" data-command="enter-story">
              ${
                storyComplete
                  ? "Open completed story"
                  : storyStarted
                    ? "Continue Story Mode"
                    : "Start New Story"
              }
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>
        <div class="mode-side-stack">
          <article class="mode-bill mode-quick">
            <div class="mode-copy">
              <h2>Quick Fight</h2>
              <p>
                Build two Lineups of one to three Standard Characters and fight
                immediately. No ownership, Story unlocks, Stamps, or XP are
                changed.
              </p>
              <button class="secondary-action" data-command="enter-quick">
                Set up Quick Fight <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
          <article class="mode-bill mode-tournament">
            <div class="mode-art mode-art-tournament" role="img" aria-label="The Wrong Door arena"></div>
            <div class="mode-copy">
              <h2>Tournament</h2>
              <p>
                Enter a standalone three-round Wrong Door Cup. Roster health
                and interlude choices persist until the run ends.
              </p>
              <button class="secondary-action" data-command="enter-tournament">
                ${
                  standaloneRun
                    ? `Resume Round ${standaloneRun.roundIndex + 1}`
                    : "Start Tournament"
                }
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        </div>
      </div>
      ${
        model.devToolsEnabled
          ? `
            <aside class="dev-launch-ticket" aria-label="Development tools">
              <div>
                <strong>Developer Lab</strong>
                <span>Launch isolated scenarios, inspect battles, and use local convenience tools.</span>
              </div>
              <button data-command="enter-dev">Open Dev Lab <span aria-hidden="true">→</span></button>
            </aside>
          `
          : ""
      }
      <footer class="main-menu-profile">
        <div>
          <strong>${escapeHtml(model.save.playerName)}</strong>
          <span>Profile ${model.save.slot} · ${model.save.collection.length} owned Character${
            model.save.collection.length === 1 ? "" : "s"
          } · ${model.save.tournamentBadges.length} badge${
            model.save.tournamentBadges.length === 1 ? "" : "s"
          }</span>
        </div>
        <button data-route="achievements">Achievements</button>
        <button data-route="profile">Manage Profile</button>
        <button data-route="settings">Settings</button>
      </footer>
    </section>
  `;
}
