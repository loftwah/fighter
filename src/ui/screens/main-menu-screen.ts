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
          Grow a collection in Story, build any matchup in Quick Fight, or
          survive three rounds in Tournament.
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
                Build both Lineups and fight immediately. Nothing here changes
                your Story collection or progress.
              </p>
              <button class="secondary-action" data-command="enter-quick">
                ${storyComplete ? "Open end-game sandbox" : "Set up Quick Fight"}
                <span aria-hidden="true">→</span>
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
      <footer class="main-menu-profile">
        <div>
          <strong>${escapeHtml(model.save.playerName)}</strong>
          <span>Profile ${model.save.slot} · ${model.save.collection.length} owned Character${
            model.save.collection.length === 1 ? "" : "s"
          } · ${model.save.tournamentTrophyIds.length} ${
            model.save.tournamentTrophyIds.length === 1 ? "Trophy" : "Trophies"
          }</span>
        </div>
      </footer>
    </section>
  `;
}
