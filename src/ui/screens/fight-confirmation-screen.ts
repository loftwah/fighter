import {
  resolveImageObjectPosition,
  resolveImagePath,
} from "../../assets/registry";
import { combatContent } from "../../content/initial-content";
import { escapeHtml, formatLabel } from "../format";
import { ICONS } from "../icons";

export type FightConfirmationMode = "quick" | "story" | "tournament";

export interface FightConfirmationMember {
  instanceId: string;
  characterId: string;
  position: "starter" | "bench";
  /** Only material deviations from the expected build belong here. */
  buildFacts?: readonly string[];
  health?: {
    current: number;
    maximum: number;
  };
  statuses?: readonly string[];
  defeated?: boolean;
}

export interface FightConfirmationTrait {
  label: string;
  effect?: string;
}

export interface FightConfirmationLineup {
  label: string;
  members: readonly FightConfirmationMember[];
  accessoryId: string | null;
  accessoryState?: string;
  traits?: readonly FightConfirmationTrait[];
}

export interface FightConfirmationFact {
  label: string;
  value: string;
  tone?: "neutral" | "warning";
}

export interface FightConfirmationScreenModel {
  mode: FightConfirmationMode;
  /** The real match identity: Quick Fight, encounter title, or Tournament round. */
  title: string;
  context?: string;
  difficulty: string;
  player: FightConfirmationLineup;
  opponent: FightConfirmationLineup;
  /** Authored objectives, custom deviations, carried-state consequences, etc. */
  decisionFacts?: readonly FightConfirmationFact[];
  matchSettingsAvailable?: boolean;
  commands?: {
    changeFighters?: string;
    matchSettings?: string;
    startFight?: string;
    parent?: string;
    parentLabel?: string;
    mainMenu?: string;
  };
}

function validateLineup(lineup: FightConfirmationLineup): void {
  if (lineup.members.length < 1 || lineup.members.length > 3) {
    throw new Error(
      `${lineup.label} must contain one to three resolved fighters`,
    );
  }
  if (
    lineup.members.some((member) => !member.instanceId.trim()) ||
    new Set(lineup.members.map((member) => member.instanceId)).size !==
      lineup.members.length
  ) {
    throw new Error(
      `${lineup.label} must contain non-empty, unique instance IDs`,
    );
  }
  if (
    lineup.members.filter((member) => member.position === "starter").length !==
    1
  ) {
    throw new Error(`${lineup.label} must identify exactly one starter`);
  }
  for (const member of lineup.members) {
    if (!combatContent.characters[member.characterId]) {
      throw new Error(`Unknown resolved Character ${member.characterId}`);
    }
  }
  if (lineup.accessoryId && !combatContent.accessories[lineup.accessoryId]) {
    throw new Error(`Unknown resolved Accessory ${lineup.accessoryId}`);
  }
}

function renderMember(
  member: FightConfirmationMember,
  benchIndex: number,
): string {
  const character = combatContent.characters[member.characterId]!;
  const isStarter = member.position === "starter";
  const health = member.health;
  const maximumHealth = health ? Math.max(1, health.maximum) : 1;
  const currentHealth = health
    ? Math.max(0, Math.min(maximumHealth, health.current))
    : 0;
  const healthPercent = Math.round((currentHealth / maximumHealth) * 100);
  const statuses = member.statuses ?? [];
  const buildFacts = member.buildFacts ?? [];

  return `
    <article
      class="fight-confirmation-member ${isStarter ? "is-starter" : "is-bench"} ${member.defeated ? "is-defeated" : ""}"
      data-instance-id="${escapeHtml(member.instanceId)}"
      data-lineup-position="${member.position}"
    >
      <div class="fight-confirmation-portrait">
        <img
          src="${resolveImagePath(character.portraitAssetId)}"
          data-asset-id="${character.portraitAssetId}"
          style="object-position:${resolveImageObjectPosition(character.portraitAssetId)}"
          alt=""
        />
        <strong class="fight-confirmation-position">${isStarter ? "Starter" : `Bench ${benchIndex}`}</strong>
        ${member.defeated ? '<span class="fight-confirmation-out">Defeated</span>' : ""}
      </div>
      <div class="fight-confirmation-member-copy">
        <div class="fight-confirmation-member-identity">
          <h3>${escapeHtml(character.name)}</h3>
          <p>${escapeHtml(formatLabel(character.typeId))}</p>
        </div>
        ${
          health
            ? `<div class="fight-confirmation-health">
                <span><strong>${currentHealth}</strong> / ${maximumHealth} Health</span>
                <span class="fight-confirmation-health-track" role="meter" aria-label="${escapeHtml(character.name)} Health" aria-valuemin="0" aria-valuemax="${maximumHealth}" aria-valuenow="${currentHealth}">
                  <i style="--fight-confirmation-health:${healthPercent}%"></i>
                </span>
              </div>`
            : ""
        }
        ${
          statuses.length > 0
            ? `<ul class="fight-confirmation-statuses" aria-label="${escapeHtml(character.name)} statuses">${statuses
                .map((status) => `<li>${escapeHtml(status)}</li>`)
                .join("")}</ul>`
            : ""
        }
        ${
          buildFacts.length > 0
            ? `<ul class="fight-confirmation-build-facts" aria-label="${escapeHtml(character.name)} build changes">${buildFacts
                .map((fact) => `<li>${escapeHtml(fact)}</li>`)
                .join("")}</ul>`
            : ""
        }
      </div>
    </article>
  `;
}

function renderAccessory(lineup: FightConfirmationLineup): string {
  const accessory = lineup.accessoryId
    ? combatContent.accessories[lineup.accessoryId]
    : undefined;
  return `
    <section class="fight-confirmation-accessory" aria-label="${escapeHtml(lineup.label)} Accessory">
      <div class="fight-confirmation-accessory-art">
        ${
          accessory
            ? `<img src="${resolveImagePath(accessory.imageAssetId)}" data-asset-id="${accessory.imageAssetId}" alt="" />`
            : '<span aria-hidden="true">—</span>'
        }
      </div>
      <div>
        <span>Lineup Accessory${lineup.accessoryState ? ` · ${escapeHtml(lineup.accessoryState)}` : ""}</span>
        <strong>${escapeHtml(accessory?.name ?? "No Accessory")}</strong>
        <p>${escapeHtml(accessory?.description ?? "No Lineup effect selected.")}</p>
      </div>
    </section>
  `;
}

function renderTraits(lineup: FightConfirmationLineup): string {
  const traits = lineup.traits ?? [];
  return `
    <section class="fight-confirmation-traits" aria-label="${escapeHtml(lineup.label)} Team Traits">
      <strong>Team Traits</strong>
      ${
        traits.length > 0
          ? `<ul>${traits
              .map(
                (trait) =>
                  `<li><span>${escapeHtml(trait.label)}</span>${trait.effect ? `<b>${escapeHtml(trait.effect)}</b>` : ""}</li>`,
              )
              .join("")}</ul>`
          : "<p>No active Team Trait bonus.</p>"
      }
    </section>
  `;
}

function renderLineup(lineup: FightConfirmationLineup, enemy: boolean): string {
  let benchIndex = 0;
  const ordered = [
    ...lineup.members.filter((member) => member.position === "starter"),
    ...lineup.members.filter((member) => member.position === "bench"),
  ];
  return `
    <section class="fight-confirmation-lineup ${enemy ? "is-opponent" : "is-player"}" aria-labelledby="${enemy ? "opponent" : "player"}-confirmation-lineup">
      <header>
        <h2 id="${enemy ? "opponent" : "player"}-confirmation-lineup">${escapeHtml(lineup.label)}</h2>
        <span>${lineup.members.length} fighter${lineup.members.length === 1 ? "" : "s"}</span>
      </header>
      <div class="fight-confirmation-roster" data-lineup-size="${lineup.members.length}">
        ${ordered
          .map((member) => {
            if (member.position === "bench") benchIndex += 1;
            return renderMember(member, benchIndex);
          })
          .join("")}
      </div>
      <div class="fight-confirmation-evidence">
        ${renderAccessory(lineup)}
        ${renderTraits(lineup)}
      </div>
    </section>
  `;
}

export function renderFightConfirmationScreen(
  model: FightConfirmationScreenModel,
): string {
  validateLineup(model.player);
  validateLineup(model.opponent);
  const facts = model.decisionFacts ?? [];
  const commands = {
    changeFighters: model.commands?.changeFighters ?? "change-fighters",
    matchSettings: model.commands?.matchSettings ?? "open-match-settings",
    startFight: model.commands?.startFight ?? "start-fight",
    parent: model.commands?.parent,
    mainMenu: model.commands?.mainMenu,
  };
  const matchIdentity = model.mode === "quick" ? "Quick Fight" : model.title;
  const supportingContext = model.mode === "quick" ? undefined : model.context;

  return `
    <!--
      THESIS: Review Fight is one torn face-off bill, not two dashboard cards or a renamed settings summary.
      OWN-WORLD: Deep indigo cabinet, overlapping blue and tomato bills, registered fighter art, chalk evidence rails, and one yellow fight ticket.
      STORY: Recognise the bout, verify both ordered Lineups and their loadouts, then pull the Start Fight ticket.
      FIRST VIEWPORT: REVIEW FIGHT crowns a single split arena; starters dominate, bench fighters tuck behind, evidence and actions form one shallow launch deck.
      FORM: Screenshot-informed Saturday-Night Fight Bill; chosen from two generated 1920×1080 probes; seed key: review-fight-split-bill.
      FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
    -->
    <section class="fight-setup-confirmation fight-confirmation--${model.mode}" data-fight-confirmation data-fight-confirmation-mode="${model.mode}" data-fight-setup aria-labelledby="fight-confirmation-title">
      <header class="fight-confirmation-heading">
        ${
          commands.parent || commands.mainMenu
            ? `<nav aria-label="Fight Setup navigation">${commands.parent ? `<button type="button" data-command="${escapeHtml(commands.parent)}" aria-label="Return to ${escapeHtml(model.commands?.parentLabel ?? "previous screen")}">${ICONS.chevronLeft}<span>${escapeHtml(model.commands?.parentLabel ?? "Back")}</span></button>` : ""}${commands.mainMenu ? `<button type="button" data-command="${escapeHtml(commands.mainMenu)}" aria-label="Return to Main Menu">${ICONS.home}<span>Main Menu</span></button>` : ""}</nav>`
            : ""
        }
        <div class="fight-confirmation-title-lockup">
          <h1 id="fight-confirmation-title">Review Fight</h1>
          <strong>${escapeHtml(matchIdentity)}</strong>
          ${supportingContext ? `<p>${escapeHtml(supportingContext)}</p>` : ""}
        </div>
        <p class="fight-confirmation-difficulty"><span>Difficulty</span><strong>${escapeHtml(formatLabel(model.difficulty))}</strong></p>
      </header>

      <div class="fight-confirmation-duel">
        ${renderLineup(model.player, false)}
        <div class="fight-confirmation-versus" aria-label="versus">VS</div>
        ${renderLineup(model.opponent, true)}
      </div>

      ${
        facts.length > 0
          ? `<aside class="fight-confirmation-facts" aria-label="Match facts that affect this fight"><ul>${facts
              .map(
                (fact) =>
                  `<li class="${fact.tone === "warning" ? "is-warning" : ""}"><span>${escapeHtml(fact.label)}</span><strong>${escapeHtml(fact.value)}</strong></li>`,
              )
              .join("")}</ul></aside>`
          : ""
      }

      <footer class="fight-confirmation-actions">
        <button type="button" class="fight-confirmation-action is-secondary" data-command="${escapeHtml(commands.changeFighters)}">${ICONS.quick}<span>Change Fighters</span></button>
        ${
          model.matchSettingsAvailable
            ? `<button type="button" class="fight-confirmation-action is-secondary" data-command="${escapeHtml(commands.matchSettings)}">${ICONS.sliders}<span>Match Settings</span></button>`
            : ""
        }
        <button type="button" class="fight-confirmation-action is-primary" data-command="${escapeHtml(commands.startFight)}"><span>Start Fight</span>${ICONS.chevronRight}</button>
      </footer>
    </section>
  `;
}
