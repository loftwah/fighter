import {
  resolveImageObjectPosition,
  resolveImagePath,
} from "../../assets/registry";
import { combatContent } from "../../content/initial-content";
import { escapeHtml, formatLabel } from "../format";
import { ICONS } from "../icons";
import { renderCharacterTraits } from "./trait-synergy";

export interface FightSetupMember {
  characterId?: string;
  slotLabel: string;
  detail: string;
  control?: {
    label: string;
    name: string;
    options: string;
  };
  healthPercent?: number;
  defeated?: boolean;
}

export interface FightSetupSide {
  label: string;
  countLabel: string;
  members: readonly FightSetupMember[];
  accessoryHtml: string;
  synergyHtml: string;
  enemy?: boolean;
}

export interface FightSetupFrame {
  mode: "quick" | "story" | "tournament";
  titleId: string;
  title: string;
  summary: string;
  backControl: string;
  rulesHtml: string;
  player: FightSetupSide;
  enemy: FightSetupSide;
  contextHtml?: string;
  selectionHtml?: string;
  footerHtml: string;
  actionHtml: string;
}

export function renderFightSetupRules(
  label: string,
  rules: readonly string[],
): string {
  return `
    <div class="fight-rules" aria-label="${escapeHtml(label)}">
      <strong>${escapeHtml(label)}</strong>
      ${rules.map((rule) => `<span>${escapeHtml(rule)}</span>`).join("")}
    </div>
  `;
}

export function renderFightSetupAccessory(
  accessoryId: string | undefined,
  options: {
    selectName?: string;
    status?: string;
  } = {},
): string {
  const accessory = accessoryId
    ? combatContent.accessories[accessoryId]
    : undefined;
  const accessoryOptions = Object.values(combatContent.accessories)
    .map(
      (candidate) =>
        `<option value="${candidate.id}" ${candidate.id === accessoryId ? "selected" : ""}>${escapeHtml(candidate.name)}</option>`,
    )
    .join("");
  const image = accessory
    ? `<img src="${resolveImagePath(accessory.imageAssetId)}" data-asset-id="${accessory.imageAssetId}" alt="" />`
    : '<span class="fight-accessory-empty" aria-hidden="true">—</span>';
  const content = `
    <span class="fight-accessory-art">${image}</span>
    <span class="fight-accessory-copy">
      <small>Accessory${options.status ? ` · ${escapeHtml(options.status)}` : ""}</small>
      <strong>${escapeHtml(accessory?.name ?? "No Accessory")}</strong>
      <span>${escapeHtml(accessory?.description ?? "No battle effect equipped.")}</span>
    </span>
  `;
  return options.selectName
    ? `
      <label class="fight-accessory">
        ${content}
        <span class="sr-only">Choose Accessory</span>
        <select name="${options.selectName}">${accessoryOptions}</select>
      </label>
    `
    : `<div class="fight-accessory">${content}</div>`;
}

export function renderFightSetupSide(side: FightSetupSide): string {
  return `
    <article class="fight-team ${side.enemy ? "is-enemy" : "is-player"}">
      <header class="fight-team-heading">
        <h2>${escapeHtml(side.label)}</h2>
        <span>${escapeHtml(side.countLabel)}</span>
      </header>
      <div class="fight-team-lineup" data-lineup-count="${side.members.length}">
        ${side.members.map(renderFightSetupMember).join("")}
      </div>
      <div class="fight-team-loadout">
        ${side.accessoryHtml}
        ${side.synergyHtml}
      </div>
    </article>
  `;
}

export function renderFightSetupFrame(model: FightSetupFrame): string {
  return `
    <!--
      THESIS: One fight desk owns every pre-fight decision; the mode changes the evidence, never the hierarchy.
      OWN-WORLD: Indigo fight board, chalk selection stock, hard registration borders, yellow starters and tomato opposition.
      STORY: Read the encounter, verify both Lineups, inspect their loadouts, then commit through one confirmation rail.
      FIRST VIEWPORT: Match title and rules cap a two-sided portrait marquee; setup controls follow without hiding either team.
      FORM: Shared collector match sheet, first structural direction, staged as a physical bout contract; seed key: established-surface-direct.
      FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
    -->
    <section
      class="fight-setup fight-setup--${model.mode}"
      data-fight-setup
      aria-labelledby="${model.titleId}"
    >
      <header class="fight-setup-header">
        ${model.backControl}
        <div class="fight-setup-title">
          <h1 id="${model.titleId}">${escapeHtml(model.title)}</h1>
          <p>${escapeHtml(model.summary)}</p>
        </div>
        ${model.rulesHtml}
      </header>
      <div class="fight-setup-body">
        ${model.contextHtml ?? ""}
        <div class="fight-matchup">
          ${renderFightSetupSide(model.player)}
          <div class="fight-versus" aria-label="versus"><span>VS</span></div>
          ${renderFightSetupSide(model.enemy)}
        </div>
        ${model.selectionHtml ?? ""}
      </div>
      <footer class="fight-confirmation">
        <div class="fight-confirmation-copy">${model.footerHtml}</div>
        ${model.actionHtml}
      </footer>
    </section>
  `;
}

function renderFightSetupMember(member: FightSetupMember): string {
  const character = member.characterId
    ? combatContent.characters[member.characterId]
    : undefined;
  const healthPercent = Math.max(
    0,
    Math.min(100, Math.round(member.healthPercent ?? 100)),
  );
  return `
    <article class="fight-member ${member.defeated ? "is-defeated" : ""} ${character ? "" : "is-empty"}">
      <div class="fight-member-art ${character ? `is-${character.typeId}` : ""}">
        ${
          character
            ? `<img
                src="${resolveImagePath(character.portraitAssetId)}"
                data-asset-id="${character.portraitAssetId}"
                style="object-position: ${resolveImageObjectPosition(character.portraitAssetId)}"
                alt=""
              />`
            : `<span aria-hidden="true">${ICONS.plus}</span>`
        }
        <span class="fight-member-slot">${escapeHtml(member.slotLabel)}</span>
        ${
          member.healthPercent === undefined
            ? ""
            : `<span class="fight-member-health" role="meter" aria-label="${escapeHtml(character?.name ?? "Empty slot")} carried Health" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${healthPercent}"><i style="--health-scale:${healthPercent / 100}"></i></span>`
        }
      </div>
      <div class="fight-member-copy">
        <strong>${escapeHtml(character?.name ?? "Open slot")}</strong>
        <small>${escapeHtml(member.detail)}</small>
        <span class="trait-chip-row">${character ? renderCharacterTraits(character) : '<span class="trait-chip is-muted">Optional</span>'}</span>
      </div>
      ${
        member.control
          ? `<label class="fight-member-control">
              <span>${escapeHtml(member.control.label)}</span>
              <select name="${member.control.name}">${member.control.options}</select>
            </label>`
          : `<span class="fight-member-type">${character ? formatLabel(character.typeId) : "Empty"}</span>`
      }
    </article>
  `;
}
