import type { SessionMode } from "../../app/routes";
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
import {
  renderFightSetupAccessory,
  renderFightSetupFrame,
  renderFightSetupRules,
  type FightSetupMember,
} from "../components/fight-setup";
import { renderLockedFeature } from "../components/locked-feature";
import { renderTraitSynergy } from "../components/trait-synergy";
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
  const effectiveStarterInstanceId =
    starterInstanceId ?? deployedInstanceIds[0] ?? null;
  const selectedCount = deployedInstanceIds.length;
  const caseEntries = caseBuilds.map(
    (build) => [build, model.run?.healthRatios[build.instanceId] ?? 1] as const,
  );
  const caseStatus =
    caseEntries.length > 0
      ? caseEntries
          .map(([build, ratio]) => {
            const character = combatContent.characters[build.characterId];
            return `<span><strong>${escapeHtml(character?.name ?? "Roster Character")}</strong>${Math.round(ratio * 100)}% roster Health</span>`;
          })
          .join("")
      : "<span><strong>Fresh Roster</strong>Full Health at the opening bell</span>";
  const rosterControls =
    model.run?.phase === "interlude" || caseBuilds.length === 0
      ? ""
      : `
        <fieldset class="cup-roster-selector">
          <legend>Choose this round's Lineup</legend>
          <p>${selectedCount} / 3 deployed. Choose one starter; undeployed Roster members still receive support XP.</p>
          <div>
            ${caseBuilds
              .map((build) => {
                const character = combatContent.characters[build.characterId];
                if (!character) return "";
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
  const dropControls = `
    <div class="cup-drops" aria-label="Choose a between-round drop">
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
  `;
  const playerMembers: FightSetupMember[] = deployedInstanceIds
    .map((instanceId): FightSetupMember | null => {
      const build = caseBuilds.find(
        (candidate) => candidate.instanceId === instanceId,
      );
      if (!build) return null;
      const ratio = model.run?.healthRatios[instanceId] ?? 1;
      return {
        characterId: build.characterId,
        slotLabel:
          instanceId === effectiveStarterInstanceId ? "Starts" : "Deployed",
        detail: `${Math.round(ratio * 100)}% carried Health`,
        healthPercent: ratio * 100,
        defeated: ratio <= 0,
      };
    })
    .filter((member): member is FightSetupMember => member !== null);
  const enemyMembers = encounter.enemyCharacterIds.map(
    (characterId, index): FightSetupMember => ({
      characterId,
      slotLabel: index === 0 ? "Starts" : `Bench ${index}`,
      detail: `${formatLabel(combatContent.characters[characterId]!.typeId)} · Round rival`,
    }),
  );
  const playerAccessoryAvailable = !model.run?.exhaustedAccessoryIds.includes(
    "accessory.press-pass",
  );
  const interlude = model.run?.phase === "interlude";

  return renderFightSetupFrame({
    mode: "tournament",
    titleId: "tournament-title",
    title: tournament.name,
    summary: interlude
      ? `Round ${model.run!.roundIndex} is stamped. Choose one recovery before ${encounter.title}.`
      : `Round ${encounter.roundIndex + 1}: ${encounter.title} — ${encounter.subtitle}`,
    backControl: `<button class="text-button" ${
      model.sessionMode === "story"
        ? 'data-route="story"'
        : 'data-command="main-menu"'
    }>← ${model.sessionMode === "story" ? "Back to Story" : "Main Menu"}</button>`,
    rulesHtml: renderFightSetupRules("Tournament round", [
      `Round ${encounter.roundIndex + 1} of ${tournament.rounds.length}`,
      `Roster ${selectedCount} / 3 deployed`,
      "Health carries between rounds",
      "One-use Accessories",
    ]),
    contextHtml: `
      <aside class="fight-event" aria-label="Tournament progress">
        <img
          class="tournament-art"
          src="${resolveImagePath(tournament.imageAssetId)}"
          data-asset-id="${tournament.imageAssetId}"
          style="object-position: ${resolveImageObjectPosition(tournament.imageAssetId)}"
          alt="${escapeHtml(tournament.imageAlt)}"
        />
        <div class="fight-event-copy">
          ${champion ? '<span class="cup-status-stamp">★ Trophy collected</span>' : ""}
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
        </div>
      </aside>
    `,
    player: {
      label: "Your Lineup",
      countLabel: `${playerMembers.length} deployed`,
      members:
        playerMembers.length > 0
          ? playerMembers
          : [
              {
                slotLabel: "Not locked",
                detail: "Choose the Roster below",
              },
            ],
      accessoryHtml: renderFightSetupAccessory(
        playerAccessoryAvailable ? "accessory.press-pass" : undefined,
        { status: playerAccessoryAvailable ? "Available" : "Already used" },
      ),
      synergyHtml: renderTraitSynergy(
        playerMembers.flatMap((member) =>
          member.characterId ? [member.characterId] : [],
        ),
      ),
    },
    enemy: {
      label: "Round Rivals",
      countLabel: `${enemyMembers.length} revealed`,
      members: enemyMembers,
      accessoryHtml: renderFightSetupAccessory("accessory.dead-air", {
        status: "Opponent",
      }),
      synergyHtml: renderTraitSynergy(encounter.enemyCharacterIds),
      enemy: true,
    },
    selectionHtml: `
      <section class="fight-selection" aria-label="Tournament preparation">
        <div class="case-health">${caseStatus}</div>
        ${interlude ? dropControls : rosterControls}
      </section>
    `,
    footerHtml: `
      <strong>${interlude ? "Choose one drop to continue." : `${selectedCount} Character${selectedCount === 1 ? "" : "s"} ready for Round ${encounter.roundIndex + 1}.`}</strong>
      <span>${
        model.sessionMode === "story"
          ? "Story Roster uses owned and authored-loan builds."
          : `Standalone Roster uses Level ${STANDARD_MATCH_LEVEL} Standard Builds.`
      }
      </span>
    `,
    actionHtml: interlude
      ? '<span class="fight-confirmation-wait">Choose a drop above</span>'
      : `
        <button class="primary-action" data-command="start-tournament">
          ${model.run ? `Confirm Lineup · Enter Round ${encounter.roundIndex + 1}` : "Confirm Lineup · Lock Roster · Enter Round 1"}
          <span aria-hidden="true">→</span>
        </button>
      `,
  });
}
