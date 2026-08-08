import type { SessionMode } from "../../app/routes";
import {
  resolveImageObjectPosition,
  resolveImagePath,
} from "../../assets/registry";
import { combatContent } from "../../content/initial-content";
import type {
  SaveData,
  TournamentCaseBuild,
  TournamentRunData,
} from "../../persistence/save";
import {
  resolveTournamentRunDefinition,
  tournamentDefinition,
  tournamentTrophies,
} from "../../tournaments/catalog";
import { effectiveTournamentFightSettings } from "../../tournaments/runner";
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
  accessoryId?: string | null;
  locked: boolean;
}

export function renderTournamentScreen(model: TournamentScreenModel): string {
  const tournamentId =
    model.run?.tournamentId ?? model.tournamentId ?? "tournament.cheap-seats";
  const tournament = model.run
    ? resolveTournamentRunDefinition(model.run)
    : tournamentDefinition(tournamentId);
  if (model.locked) {
    return renderLockedFeature(
      "tournament-title",
      tournament.name,
      "Clear the two-Character qualifier to earn a place in the bracket.",
    );
  }
  const trophy = tournamentTrophies[tournament.trophyId];
  if (!trophy) {
    throw new Error(`Tournament ${tournament.id} has no registered Trophy.`);
  }
  const champion = model.save.tournamentTrophyIds.includes(trophy.id);
  const fightNodes = tournament.nodes.filter((node) => node.kind === "fight");
  const currentNodeIndex = model.run
    ? tournament.nodes.findIndex((node) => node.id === model.run!.currentNodeId)
    : -1;
  const currentNode =
    currentNodeIndex >= 0 ? tournament.nodes[currentNodeIndex] : fightNodes[0];
  const fightNode =
    currentNode?.kind === "fight"
      ? currentNode
      : (tournament.nodes
          .slice(Math.max(0, currentNodeIndex + 1))
          .find((node) => node.kind === "fight") ?? fightNodes[0]);
  if (!fightNode || fightNode.kind !== "fight") {
    throw new Error(`Tournament ${tournament.id} has no fight to prepare.`);
  }
  const fightIndex = Math.max(0, fightNodes.indexOf(fightNode));
  const encounter = tournament.rounds[fightIndex] ?? tournament.rounds[0]!;
  const effectiveSettings = model.run
    ? effectiveTournamentFightSettings(tournament, model.run, fightNode.id)
    : { ...tournament.matchDefaults, ...fightNode.matchSettings };
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
                    <span class="cup-roster-order">
                      <button type="button" data-command="move-tournament-deployment" data-instance-id="${build.instanceId}" data-direction="-1" aria-label="Move ${escapeHtml(character.name)} earlier" ${!selected || deployedInstanceIds.indexOf(build.instanceId) <= 0 ? "disabled" : ""}>←</button>
                      <button type="button" data-command="move-tournament-deployment" data-instance-id="${build.instanceId}" data-direction="1" aria-label="Move ${escapeHtml(character.name)} later" ${!selected || deployedInstanceIds.indexOf(build.instanceId) >= deployedInstanceIds.length - 1 ? "disabled" : ""}>→</button>
                    </span>
                  </article>
                `;
              })
              .join("")}
          </div>
        </fieldset>
      `;
  const interludeChoices =
    currentNode?.kind === "recovery"
      ? (currentNode.choices ??
        currentNode.choiceIds.map((id) => ({
          id,
          label: formatLabel(id),
          effects: [],
        })))
      : [];
  const dropControls = `
    <div class="cup-drops" aria-label="Choose a between-round drop">
      ${interludeChoices
        .map(
          (
            choice,
          ) => `<button data-command="tournament-interlude-choice" data-choice-id="${escapeHtml(choice.id)}">
        <strong>${escapeHtml(choice.label)}</strong>
        ${escapeHtml(choice.effects.map((effect) => formatLabel(effect.kind)).join(" · ") || "Continue to the next fight")}
      </button>`,
        )
        .join("")}
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
  const enemyMembers = fightNode.enemyCharacterIds.map(
    (characterId, index): FightSetupMember => {
      const instanceId = `tournament.${fightNode.id}.opponent.${index}.${characterId}`;
      const ratio = model.run?.opponentHealthRatios[instanceId] ?? 1;
      return {
        characterId,
        slotLabel: index === 0 ? "Starts" : `Bench ${index}`,
        detail: `${formatLabel(combatContent.characters[characterId]!.typeId)} · ${Math.round(ratio * 100)}% current Health`,
        healthPercent: ratio * 100,
        defeated: ratio <= 0,
      };
    },
  );
  const interlude = model.run?.phase === "interlude";
  const playerAccessoryAvailable = !model.run?.exhaustedAccessoryIds.includes(
    model.accessoryId ?? "accessory.press-pass",
  );
  const selectedAccessoryId = playerAccessoryAvailable
    ? (model.accessoryId ?? "accessory.press-pass")
    : null;
  const accessoryControls = interlude
    ? ""
    : `<fieldset class="cup-accessory-selector"><legend>Choose this deployment's Accessory</legend><div>
      <button type="button" data-command="select-tournament-accessory" data-accessory-id="" aria-pressed="${selectedAccessoryId === null}"><span aria-hidden="true">—</span><strong>No Accessory</strong></button>
      ${Object.values(combatContent.accessories)
        .map((accessory) => {
          const exhausted = Boolean(
            model.run?.exhaustedAccessoryIds.includes(accessory.id),
          );
          return `<button type="button" data-command="select-tournament-accessory" data-accessory-id="${accessory.id}" aria-pressed="${selectedAccessoryId === accessory.id}" ${exhausted ? "disabled" : ""}><img src="${resolveImagePath(accessory.imageAssetId)}" data-asset-id="${accessory.imageAssetId}" alt=""/><strong>${escapeHtml(accessory.name)}</strong><small>${exhausted ? "Used this run" : "Available"}</small></button>`;
        })
        .join("")}
    </div></fieldset>`;
  return renderFightSetupFrame({
    mode: "tournament",
    titleId: "tournament-title",
    title: tournament.name,
    summary: interlude
      ? `Round ${model.run!.roundIndex} is stamped. Choose one recovery before ${encounter.title}.`
      : `Round ${encounter.roundIndex + 1}: ${encounter.title} — ${encounter.subtitle}`,
    backControl: `<span class="fight-setup-exits"><button class="text-button" ${
      model.sessionMode === "story"
        ? 'data-route="story"'
        : 'data-command="back-to-tournament-choice"'
    }>← ${model.sessionMode === "story" ? "Back to Story" : "Tournament Choice"}</button><button class="text-button" data-command="main-menu">Main Menu</button></span>`,
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
        selectedAccessoryId ?? undefined,
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
      accessoryHtml: renderFightSetupAccessory(
        effectiveSettings.opponentAccessoryId ?? undefined,
        {
          status: "Opponent",
        },
      ),
      synergyHtml: renderTraitSynergy(fightNode.enemyCharacterIds),
      enemy: true,
    },
    selectionHtml: `
      <section class="fight-selection" aria-label="Tournament preparation">
        <div class="case-health">${caseStatus}</div>
        ${interlude ? dropControls : rosterControls}
        ${accessoryControls}
      </section>
    `,
    footerHtml: `
      <strong>${interlude ? "Choose one drop to continue." : `${selectedCount} Character${selectedCount === 1 ? "" : "s"} ready for Round ${encounter.roundIndex + 1}.`}</strong>
      <span>${
        model.sessionMode === "story"
          ? "Story Roster uses owned and authored-loan builds."
          : "Locked builds and carried Health persist for the complete run."
      }
      </span>
    `,
    actionHtml: interlude
      ? '<span class="fight-confirmation-wait">Choose a drop above</span>'
      : `
        <div class="tournament-confirmation-actions">
        ${
          model.run
            ? '<button class="secondary-action" data-command="forfeit-tournament">Forfeit Tournament</button>'
            : ""
        }
        <button class="primary-action" data-command="start-tournament">
          ${model.run ? `Confirm Lineup · Enter Round ${encounter.roundIndex + 1}` : "Confirm Lineup · Lock Roster · Enter Round 1"}
          <span aria-hidden="true">→</span>
        </button>
        </div>
      `,
  });
}
