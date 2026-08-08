import {
  resolveImageObjectPosition,
  resolveImagePath,
} from "../../assets/registry";
import type { SaveData } from "../../persistence/save";
import { evaluateAchievements } from "../../progression/achievements";
import { tournamentTrophies } from "../../tournaments/catalog";
import { escapeHtml } from "../format";
import { ICONS } from "../icons";

export function renderProfileScreen(save: SaveData): string {
  const storyClears = save.clearedNodeIds.length;
  const achievementProgress = evaluateAchievements(save);
  const completedAchievements = achievementProgress.filter(
    (achievement) => achievement.complete,
  ).length;
  const trophyCards =
    save.tournamentTrophyIds.length > 0
      ? save.tournamentTrophyIds
          .map((trophyId) => {
            const trophy = tournamentTrophies[trophyId];
            const imageAssetId =
              trophy?.imageAssetId ?? "image.trophy.generic.gold-cup";
            return `
              <article class="profile-trophy">
                <img
                  src="${resolveImagePath(imageAssetId)}"
                  data-asset-id="${imageAssetId}"
                  style="object-position: ${resolveImageObjectPosition(imageAssetId)}"
                  alt="${escapeHtml(trophy?.imageAlt ?? "A collected Tournament Trophy.")}"
                />
                <div>
                  <strong>${escapeHtml(trophy?.name ?? trophyId)}</strong>
                  <span>${escapeHtml(trophy?.description ?? "Collected from a completed Tournament.")}</span>
                </div>
              </article>
            `;
          })
          .join("")
      : `
        <p class="profile-trophy-empty">
          Win a Tournament to place its Trophy on this Profile.
        </p>
      `;
  return `
    <section class="profile-sheet" aria-labelledby="profile-title">
      <div class="section-heading">
        <button class="text-button" data-command="main-menu">${ICONS.arrowLeft}<span>Main Menu</span></button>
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
            <div><dt>Tournament Trophies</dt><dd>${save.tournamentTrophyIds.length}</dd></div>
            <div><dt>Achievements</dt><dd>${completedAchievements}/${achievementProgress.length}</dd></div>
            <div><dt>Quick Fights</dt><dd>${save.quickFightRecord.wins}–${save.quickFightRecord.losses}</dd></div>
          </dl>
          <button class="secondary-action" data-route="achievements">
            Open Achievements
          </button>
          <button class="primary-action" data-command="enter-story">
            ${storyClears > 0 ? "Continue this Story" : "Start this Story"}
            ${ICONS.arrowRight}
          </button>
        </section>
      </div>
      <section class="profile-trophy-cabinet" aria-labelledby="profile-trophies-title">
        <div>
          <span>Permanent Tournament record</span>
          <h2 id="profile-trophies-title">Trophy cabinet</h2>
        </div>
        <div class="profile-trophy-shelf">${trophyCards}</div>
      </section>
    </section>
  `;
}
