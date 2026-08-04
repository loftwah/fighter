import {
  resolveImageObjectPosition,
  resolveImagePath,
} from "../../assets/registry";
import { STANDARD_MATCH_LEVEL } from "../../combat/standard-build";
import { combatContent } from "../../content/initial-content";
import type {
  SaveData,
  TournamentCaseBuild,
  TournamentRunData,
} from "../../persistence/save";
import {
  tournamentDefinition,
  tournamentTrophy,
} from "../../tournaments/catalog";
import type { SessionMode } from "../../app/routes";
import { renderLockedFeature } from "../components/locked-feature";
import { escapeHtml, formatLabel } from "../format";

export interface TournamentScreenModel {
  save: SaveData;
  sessionMode: SessionMode;
  tournamentId?: string;
  run: TournamentRunData | null;
  caseBuilds?: TournamentCaseBuild[];
  deployedInstanceIds?: string[];
  starterInstanceId?: string | null;
  locked: boolean;
}

export function renderTournamentScreen(model: TournamentScreenModel): string {
  const tournamentId =
    model.run?.tournamentId ?? model.tournamentId ?? "tournament.cheap-seats";
  const tournament = tournamentDefinition(tournamentId);
  if (model.locked) {
    return renderLockedFeature(
      "tournament-title",
      tournament.name,
      "Clear the two-Character qualifier to earn a place in the bracket.",
    );
  }
  const trophy = tournamentTrophy(tournament.id);
  const champion = model.save.tournamentTrophyIds.includes(trophy.id);
  const encounter =
    tournament.rounds[model.run?.roundIndex ?? 0] ?? tournament.rounds[0]!;
  const caseBuilds = model.caseBuilds ?? model.run?.caseBuilds ?? [];
  const deployedInstanceIds =
    model.deployedInstanceIds ?? model.run?.deployedInstanceIds ?? [];
  const starterInstanceId =
    model.starterInstanceId ?? model.run?.activeInstanceId ?? null;
  const selectedCount = deployedInstanceIds.length;
  const caseEntries = caseBuilds.map(
    (build) => [build, model.run?.healthRatios[build.instanceId] ?? 1] as const,
  );
  const caseStatus =
    caseEntries.length > 0
      ? caseEntries
          .map(([build, ratio]) => {
            const character = combatContent.characters[build.characterId];
            return `<span><strong>${escapeHtml(character?.name ?? "Roster Character")}</strong>${Math.round(ratio * 100)}% roster health</span>`;
          })
          .join("")
      : "<span><strong>Fresh Roster</strong>Full health at the opening bell</span>";
  const rosterControls =
    model.run?.phase === "interlude" || caseBuilds.length === 0
      ? ""
      : `
        <fieldset class="cup-roster-selector">
          <legend>Deploy up to three · choose the starter</legend>
          <p>${selectedCount} / 3 deployed. The other Roster members receive support XP.</p>
          <div>
            ${caseBuilds
              .map((build) => {
                const character = combatContent.characters[build.characterId];
                if (!character) {
                  return "";
                }
                const healthRatio =
                  model.run?.healthRatios[build.instanceId] ?? 1;
                const defeated = healthRatio <= 0;
                const selected = deployedInstanceIds.includes(build.instanceId);
                const starter =
                  selected &&
                  (starterInstanceId === build.instanceId ||
                    (!starterInstanceId &&
                      deployedInstanceIds[0] === build.instanceId));
                return `
                  <article class="cup-roster-ticket ${selected ? "is-deployed" : ""} ${defeated ? "is-defeated" : ""}">
                    <img
                      src="${resolveImagePath(character.portraitAssetId)}"
                      data-asset-id="${character.portraitAssetId}"
                      style="object-position: ${resolveImageObjectPosition(character.portraitAssetId)}"
                      alt=""
                    />
                    <div>
                      <span>${formatLabel(character.typeId)} · ${Math.round(healthRatio * 100)}% Health</span>
                      <strong>${escapeHtml(character.name)}</strong>
                    </div>
                    <label>
                      <input
                        type="checkbox"
                        name="tournamentDeployment"
                        value="${build.instanceId}"
                        ${selected ? "checked" : ""}
                        ${
                          defeated ||
                          (!selected && selectedCount >= 3) ||
                          (selected && selectedCount <= 1)
                            ? "disabled"
                            : ""
                        }
                      />
                      Deploy
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="tournamentStarter"
                        value="${build.instanceId}"
                        ${starter ? "checked" : ""}
                        ${!selected || defeated ? "disabled" : ""}
                      />
                      Starts
                    </label>
                  </article>
                `;
              })
              .join("")}
          </div>
        </fieldset>
      `;
  const controls =
    model.run?.phase === "interlude"
      ? `
        <div class="cup-drops" aria-label="Choose an interstitial drop">
          <button data-command="cup-drop" data-drop="front-print-repair">
            <strong>Front-Line Repair</strong>
            Heal the Character that ended the prior round active by 45%.
          </button>
          <button data-command="cup-drop" data-drop="case-repair">
            <strong>Roster Repair</strong>
            Heal the Roster by 18% and revive one defeated Character at 35%.
          </button>
          <button data-command="cup-drop" data-drop="hot-start">
            <strong>Hot Start</strong>
            Begin the next round with another 18 Charge.
          </button>
        </div>
      `
      : `
        ${rosterControls}
        <button class="primary-action" data-command="start-tournament">
          ${model.run ? `Confirm Lineup · Enter Round ${encounter.roundIndex + 1}` : "Confirm Lineup · Lock Roster · Enter Round 1"}
          <span aria-hidden="true">→</span>
        </button>
      `;
  return `
    <section class="tournament-poster" data-fight-setup aria-labelledby="tournament-title">
      <img
        class="tournament-art"
        src="${resolveImagePath(tournament.imageAssetId)}"
        data-asset-id="${tournament.imageAssetId}"
        style="object-position: ${resolveImageObjectPosition(tournament.imageAssetId)}"
        alt="${escapeHtml(tournament.imageAlt)}"
      />
      <div class="tournament-copy">
        <button class="text-button" ${
          model.sessionMode === "story"
            ? 'data-route="story"'
            : 'data-command="main-menu"'
        }>
          ← ${model.sessionMode === "story" ? "Back to Story" : "Main Menu"}
        </button>
        ${champion ? '<span class="cup-status-stamp">★ Trophy collected</span>' : ""}
        <h1 id="tournament-title">${escapeHtml(tournament.name)}</h1>
        <figure class="cup-trophy-preview">
          <img
            src="${resolveImagePath(trophy.imageAssetId)}"
            data-asset-id="${trophy.imageAssetId}"
            style="object-position: ${resolveImageObjectPosition(trophy.imageAssetId)}"
            alt="${escapeHtml(trophy.imageAlt)}"
          />
          <figcaption>
            <span>${champion ? "On your Profile" : "Winner's Trophy"}</span>
            <strong>${escapeHtml(trophy.name)}</strong>
            <small>${escapeHtml(trophy.description)}</small>
          </figcaption>
        </figure>
        <p>
          ${
            model.run?.phase === "interlude"
              ? `Round ${model.run.roundIndex} is stamped. Choose one drop before ${escapeHtml(encounter.title)}.`
              : `Round ${encounter.roundIndex + 1} · ${escapeHtml(encounter.title)} — ${escapeHtml(encounter.subtitle)}`
          }
        </p>
        <div class="bracket">
          ${tournament.rounds
            .map(
              (round) => `
                <span class="${
                  model.run && round.roundIndex < model.run.roundIndex
                    ? "is-cleared"
                    : round.roundIndex === (model.run?.roundIndex ?? 0)
                      ? "is-current"
                      : ""
                }">
                  Round ${round.roundIndex + 1}<br />
                  <strong>${escapeHtml(round.title)}</strong>
                </span>
              `,
            )
            .join("")}
        </div>
        <div class="case-health">${caseStatus}</div>
        ${controls}
        <small>
          ${
            model.sessionMode === "story"
              ? "This Story Roster locks owned and authored-loan builds."
              : `Standalone Roster Characters use the Level ${STANDARD_MATCH_LEVEL} Standard Build.`
          }
          Roster health, defeats, chosen drops, and the current round persist in
          this ${
            model.sessionMode === "story" ? "Story game" : "Tournament game"
          }. Equipped Modifications stay locked for the run.${
            champion ? " Locking a new Roster replays the full bracket." : ""
          }
        </small>
      </div>
    </section>
  `;
}
