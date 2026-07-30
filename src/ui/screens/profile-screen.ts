import type { SaveData } from "../../persistence/save";
import { evaluateAchievements } from "../../progression/achievements";
import { escapeHtml } from "../format";

export function renderProfileScreen(save: SaveData): string {
  const storyClears = save.clearedNodeIds.length;
  const achievementProgress = evaluateAchievements(save);
  const completedAchievements = achievementProgress.filter(
    (achievement) => achievement.complete,
  ).length;
  return `
    <section class="profile-sheet" aria-labelledby="profile-title">
      <div class="section-heading">
        <button class="text-button" data-command="main-menu">← Main Menu</button>
        <h1 id="profile-title">Player Profile</h1>
        <p>
          Identity and progression live here. Audio, accessibility, and local
          data controls live separately in Settings.
        </p>
      </div>
      <div class="profile-layout">
        <fieldset class="profile-identity">
          <legend>Identity</legend>
          <label>
            <span>Player name</span>
            <input name="playerName" value="${escapeHtml(save.playerName)}" />
          </label>
          <label>
            <span>Local profile</span>
            <select name="profileSlot">
              ${([1, 2, 3] as const)
                .map(
                  (slot) =>
                    `<option value="${slot}" ${
                      save.slot === slot ? "selected" : ""
                    }>Player profile ${slot}</option>`,
                )
                .join("")}
            </select>
          </label>
          <small>
            Three local profiles are available in this prototype. Switching
            profiles never changes your global Settings.
          </small>
        </fieldset>
        <section class="profile-record" aria-labelledby="profile-record-title">
          <h2 id="profile-record-title">${escapeHtml(save.playerName)}'s progress</h2>
          <dl>
            <div><dt>Story nodes cleared</dt><dd>${storyClears}/8</dd></div>
            <div><dt>Owned Characters</dt><dd>${save.collection.length}</dd></div>
            <div><dt>Stamps</dt><dd>${save.stamps}</dd></div>
            <div><dt>Tournament badges</dt><dd>${save.tournamentBadges.length}</dd></div>
            <div><dt>Achievements</dt><dd>${completedAchievements}/${achievementProgress.length}</dd></div>
          </dl>
          <button class="secondary-action" data-route="achievements">
            Open Achievements
          </button>
          <button class="primary-action" data-command="enter-story">
            ${storyClears > 0 ? "Continue this Story" : "Start this Story"}
            <span aria-hidden="true">→</span>
          </button>
        </section>
      </div>
    </section>
  `;
}
