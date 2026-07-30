import {
  showsModeTools,
  usesStoryShell,
  type Route,
  type SessionMode,
} from "../../app/routes";
import type { Preferences, SaveData } from "../../persistence/save";
import { escapeHtml } from "../format";
import { ICONS } from "../icons";

export interface AppShellModel {
  route: Route;
  sessionMode: SessionMode;
  save: SaveData;
  preferences: Preferences;
  difficultyOptions: string;
  devToolsEnabled: boolean;
  lockedRoutes: ReadonlySet<Route>;
}

export function renderAppHeader(model: AppShellModel): string {
  const storyNavigation = usesStoryShell(model.route, model.sessionMode);
  const showPlayTools = showsModeTools(model.route, model.sessionMode);
  return `
    <header class="top-rail">
      <button class="wordmark" data-command="main-menu" aria-label="Riot Relics Main Menu">
        <span>RIOT</span><span>RELICS</span>
      </button>
      <nav class="primary-nav ${
        storyNavigation ? "is-story-nav" : "is-global-nav"
      }" aria-label="${storyNavigation ? "Story Mode" : "Global"}">
        ${
          storyNavigation
            ? `
              ${renderNavButton(model, "story", "Story", ICONS.story)}
              ${renderNavButton(model, "lineup", "Lineup", ICONS.quick)}
              ${renderNavButton(model, "collection", "Collection", ICONS.collection)}
              ${renderNavButton(model, "store", "Store", ICONS.store)}
              ${renderNavButton(model, "missions", "Missions", ICONS.missions)}
            `
            : `
              ${renderNavButton(model, "menu", "Main Menu", ICONS.story)}
              ${renderNavButton(model, "achievements", "Achievements", ICONS.achievements)}
              ${renderNavButton(model, "profile", "Profile", ICONS.profile)}
              ${renderNavButton(model, "settings", "Settings", ICONS.settings)}
            `
        }
      </nav>
      <div class="rail-tools">
        ${
          storyNavigation
            ? `
              <span class="stamp-counter" aria-label="${model.save.stamps} Stamps">
                <span aria-hidden="true">★</span>${model.save.stamps}
              </span>
            `
            : `<span class="collector-chip">${escapeHtml(model.save.playerName)}</span>`
        }
        ${
          showPlayTools
            ? `
              <label class="difficulty-control">
                <span>Difficulty</span>
                <select name="difficulty">${model.difficultyOptions}</select>
              </label>
            `
            : ""
        }
        ${
          model.devToolsEnabled
            ? `<button class="dev-rail-button ${
                model.route === "dev" ? "is-active" : ""
              }" data-command="enter-dev">DEV LAB</button>`
            : ""
        }
        <button
          class="icon-button"
          data-command="toggle-music"
          aria-label="${
            model.preferences.musicPlaybackEnabled
              ? "Turn music off"
              : "Turn music on"
          }"
          aria-pressed="${model.preferences.musicPlaybackEnabled}"
        >
          ${ICONS.music}
        </button>
        ${
          showPlayTools
            ? '<button class="exit-mode-button" data-command="main-menu">Exit game</button>'
            : ""
        }
      </div>
    </header>
  `;
}

export function renderMobileNavigation(model: AppShellModel): string {
  if (model.route === "battle") {
    return "";
  }
  const storyNavigation = usesStoryShell(model.route, model.sessionMode);
  return `
    <nav class="mobile-nav" aria-label="Game">
      ${
        storyNavigation
          ? `
            ${renderNavButton(model, "story", "Story", ICONS.story)}
            ${renderNavButton(model, "lineup", "Lineup", ICONS.quick)}
            ${renderNavButton(model, "collection", "Relics", ICONS.collection)}
            ${renderNavButton(model, "store", "Store", ICONS.store)}
            ${renderNavButton(model, "missions", "Missions", ICONS.missions)}
            <button class="nav-control" data-command="main-menu">
              ${ICONS.settings}<span>Menu</span>
            </button>
          `
          : `
            ${renderNavButton(model, "menu", "Menu", ICONS.story)}
            ${renderNavButton(model, "achievements", "Awards", ICONS.achievements)}
            ${renderNavButton(model, "profile", "Profile", ICONS.profile)}
            ${renderNavButton(model, "settings", "Settings", ICONS.settings)}
          `
      }
    </nav>
  `;
}

function renderNavButton(
  model: AppShellModel,
  route: Route,
  label: string,
  icon: string,
): string {
  const locked = model.lockedRoutes.has(route);
  return `
    <button
      class="nav-control ${model.route === route ? "is-active" : ""}"
      data-route="${route}"
      ${model.route === route ? 'aria-current="page"' : ""}
      ${locked ? `disabled aria-label="${label} locked"` : ""}
    >
      ${icon}<span>${label}</span>
    </button>
  `;
}
