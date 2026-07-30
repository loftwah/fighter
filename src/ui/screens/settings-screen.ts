import type { Preferences } from "../../persistence/save";

export interface SettingsScreenModel {
  preferences: Preferences;
  difficultyOptions: string;
}

export function renderSettingsScreen(model: SettingsScreenModel): string {
  return `
    <section class="settings-sheet" aria-labelledby="settings-title">
      <div class="section-heading">
        <button class="text-button" data-command="main-menu">← Main Menu</button>
        <h1 id="settings-title">Settings</h1>
        <p>
          These preferences apply to every game type and every Collector
          profile. Identity and progression are managed from Profile.
        </p>
      </div>
      <div class="settings-columns">
        <fieldset>
          <legend>Play and accessibility</legend>
          <label>
            <span>Difficulty</span>
            <select name="difficulty">${model.difficultyOptions}</select>
          </label>
          <label class="toggle-row">
            <span>
              <strong>Reduced motion</strong>
              <small>Preserves state changes without shake, cut-in travel, or bob.</small>
            </span>
            <input type="checkbox" name="reducedMotion" ${
              model.preferences.reducedMotion ? "checked" : ""
            } />
          </label>
          <label class="toggle-row">
            <span>
              <strong>Music playback</strong>
              <small>
                Off stays off across menus, battles, reloads, and profiles.
              </small>
            </span>
            <input type="checkbox" name="musicPlaybackEnabled" ${
              model.preferences.musicPlaybackEnabled ? "checked" : ""
            } />
          </label>
        </fieldset>
        <fieldset>
          <legend>Audio</legend>
          ${renderVolumeControl(model.preferences, "music", "Music")}
          ${renderVolumeControl(model.preferences, "sfx", "Sound effects")}
          ${renderVolumeControl(model.preferences, "dialogue", "Dialogue")}
          <p class="settings-note">
            SFX and dialogue currently resolve to valid silent placeholders.
            The controls and logical IDs are ready for ElevenLabs output.
          </p>
        </fieldset>
        <fieldset class="data-settings">
          <legend>Local data</legend>
          <p>
            Progress is stored in this browser. Export the selected Collector
            profile and global preferences as readable JSON.
          </p>
          <button class="secondary-action" data-command="download-profile-data">
            Export current profile
          </button>
          <button class="text-button" data-route="profile">
            Manage Collector profiles
          </button>
        </fieldset>
      </div>
    </section>
  `;
}

function renderVolumeControl(
  preferences: Preferences,
  category: "music" | "sfx" | "dialogue",
  label: string,
): string {
  const value = preferences[`${category}Volume`];
  const muted = preferences[`${category}Muted`];
  return `
    <div class="volume-row">
      <label for="${category}-volume">${label}</label>
      <input
        id="${category}-volume"
        type="range"
        name="${category}Volume"
        min="0"
        max="1"
        step="0.05"
        value="${value}"
      />
      <output for="${category}-volume">${Math.round(value * 100)}%</output>
      <label class="mute-control">
        <input type="checkbox" name="${category}Muted" ${muted ? "checked" : ""} />
        Mute
      </label>
    </div>
  `;
}
