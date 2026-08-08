import {
  resolveImageObjectPosition,
  resolveImagePath,
} from "../../assets/registry";
import { escapeHtml } from "../format";
import { ICONS } from "../icons";

export type FighterSelectMode = "quick" | "story" | "tournament";
export type FighterSelectSideId = "player" | "opponent";
export type FighterSelectSlotId = "starter" | "bench-1" | "bench-2";

export interface FighterSelectInstance {
  /** A unique copy of a Character. Duplicate Character IDs are intentional. */
  instanceId: string;
  characterId: string;
  name: string;
  portraitAssetId: string;
  typeLabel: string;
  traitLabels?: readonly string[];
  statusLabels?: readonly string[];
  availability?:
    "available" | "selected" | "forced" | "loaned" | "defeated" | "unavailable";
  unavailableReason?: string;
  healthPercent?: number;
}

export interface FighterSelectSlot {
  id: FighterSelectSlotId;
  label: "Starter" | "Bench 1" | "Bench 2";
  fighter?: FighterSelectInstance;
  locked?: boolean;
}

export interface FighterSelectLineup {
  label: string;
  slots: readonly FighterSelectSlot[];
  locked?: boolean;
  accessory?: FighterSelectLineupAccessory;
}

export interface FighterSelectAccessoryOption {
  id: string;
  name: string;
  description: string;
  imageAssetId: string;
  available?: boolean;
  unavailableReason?: string;
}

export interface FighterSelectLineupAccessory {
  selectedId: string | null;
  options: readonly FighterSelectAccessoryOption[];
  locked?: boolean;
  status?: string;
}

export interface FighterSelectNavigation {
  parentLabel: string;
  parentCommand: string;
  mainMenuCommand?: string;
}

export interface FighterSelectPagination {
  page: number;
  pageCount: number;
  rangeStart: number;
  rangeEnd: number;
  total: number;
}

export interface FighterSelectScreenModel {
  mode: FighterSelectMode;
  title: string;
  titleId?: string;
  context?: string;
  activeSide: FighterSelectSideId;
  canEditOpponent: boolean;
  player: FighterSelectLineup;
  opponent: FighterSelectLineup;
  /** Only the current page is rendered. The controller owns search and paging. */
  catalogue: readonly FighterSelectInstance[];
  pagination: FighterSelectPagination;
  searchQuery?: string;
  activeFilterLabel?: string;
  targetSlot?: {
    side: FighterSelectSideId;
    slotId: FighterSelectSlotId;
  };
  /** The controller owns which Lineup's bounded Accessory tray is open. */
  accessorySide?: FighterSelectSideId;
  navigation: FighterSelectNavigation;
  continueCommand: string;
  continueDisabled?: boolean;
}

const CHEVRON_LEFT = ICONS.chevronLeft;
const CHEVRON_RIGHT = ICONS.chevronRight;
const DRAG_HANDLE = ICONS.drag;
const REMOVE_ICON = ICONS.remove;
const PLUS_ICON = ICONS.plus;
const SEARCH_ICON = ICONS.search;

const availabilityLabel: Record<
  NonNullable<FighterSelectInstance["availability"]>,
  string
> = {
  available: "Available",
  selected: "Selected",
  forced: "Required",
  loaned: "Loan fighter",
  defeated: "Defeated",
  unavailable: "Unavailable",
};

function boundedPercent(value: number | undefined): number | undefined {
  return value === undefined ? undefined : Math.max(0, Math.min(100, value));
}

function renderPortrait(fighter: FighterSelectInstance): string {
  return `<img
    src="${resolveImagePath(fighter.portraitAssetId)}"
    data-asset-id="${escapeHtml(fighter.portraitAssetId)}"
    style="object-position: ${resolveImageObjectPosition(fighter.portraitAssetId)}"
    alt=""
  />`;
}

function renderAccessoryArt(
  accessory: FighterSelectAccessoryOption | undefined,
): string {
  return accessory
    ? `<img
        src="${resolveImagePath(accessory.imageAssetId)}"
        data-asset-id="${escapeHtml(accessory.imageAssetId)}"
        alt=""
      />`
    : `<span aria-hidden="true">${REMOVE_ICON}</span>`;
}

function selectedAccessory(
  accessory: FighterSelectLineupAccessory,
): FighterSelectAccessoryOption | undefined {
  return accessory.options.find((option) => option.id === accessory.selectedId);
}

function renderLineupAccessory(
  sideId: FighterSelectSideId,
  lineup: FighterSelectLineup,
  open: boolean,
  editable: boolean,
): string {
  const accessory = lineup.accessory;
  if (!accessory) return "";
  const selected = selectedAccessory(accessory);
  const locked = Boolean(lineup.locked || accessory.locked || !editable);
  const name =
    selected?.name ??
    (accessory.selectedId ? "Unavailable Accessory" : "No Accessory");
  const description =
    selected?.description ??
    (accessory.selectedId
      ? "This saved Accessory is no longer available."
      : "This Lineup will enter the fight without one.");
  const content = `
    <span class="fighter-lineup-accessory-art">${renderAccessoryArt(selected)}</span>
    <span class="fighter-lineup-accessory-copy">
      <small>Lineup Accessory${accessory.status ? ` · ${escapeHtml(accessory.status)}` : ""}</small>
      <strong>${escapeHtml(name)}</strong>
      <span>${escapeHtml(description)}</span>
    </span>
    ${locked ? '<span class="fighter-lineup-accessory-state">Locked</span>' : `<span class="fighter-lineup-accessory-state">${open ? "Choosing" : "Change"}</span>`}
  `;

  return locked
    ? `<div class="fighter-lineup-accessory is-locked" data-lineup-accessory data-side="${sideId}">${content}</div>`
    : `<button
        type="button"
        class="fighter-lineup-accessory"
        data-lineup-accessory
        data-command="open-lineup-accessories"
        data-side="${sideId}"
        aria-expanded="${open}"
        ${open ? `aria-controls="fighter-${sideId}-accessory-tray"` : ""}
        aria-label="Choose an Accessory for ${escapeHtml(lineup.label)}. Currently ${escapeHtml(name)}."
      >${content}</button>`;
}

function renderAccessoryTray(model: FighterSelectScreenModel): string {
  const sideId = model.accessorySide;
  if (!sideId) return "";
  const lineup = sideId === "player" ? model.player : model.opponent;
  const accessory = lineup.accessory;
  const locked = Boolean(
    lineup.locked ||
    accessory?.locked ||
    (sideId === "opponent" && !model.canEditOpponent),
  );
  if (!accessory || locked) return "";

  const options: readonly (FighterSelectAccessoryOption | null)[] = [
    null,
    ...accessory.options,
  ];
  return `
    <section
      class="fighter-accessory-tray ${sideId === "opponent" ? "is-opponent" : "is-player"}"
      id="fighter-${sideId}-accessory-tray"
      data-accessory-tray
      data-side="${sideId}"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fighter-${sideId}-accessory-title"
    >
      <header>
        <div>
          <h2 id="fighter-${sideId}-accessory-title">${escapeHtml(lineup.label)} Accessory</h2>
          <p>Choose one for this Lineup.</p>
        </div>
        <button
          type="button"
          data-command="close-lineup-accessories"
          data-side="${sideId}"
          aria-label="Close ${escapeHtml(lineup.label)} Accessory tray"
        >${REMOVE_ICON}</button>
      </header>
      <div class="fighter-accessory-options" role="group" aria-label="Available Accessories">
        ${options
          .map((option) => {
            const id = option?.id ?? "";
            const name = option?.name ?? "No Accessory";
            const description =
              option?.description ??
              "Enter the fight without a Lineup Accessory.";
            const available = option?.available !== false;
            const selected = accessory.selectedId === (option?.id ?? null);
            return `<button
              type="button"
              class="fighter-accessory-option"
              data-command="set-lineup-accessory"
              data-side="${sideId}"
              data-accessory-id="${escapeHtml(id)}"
              aria-label="${escapeHtml(`${name}. ${available ? description : (option?.unavailableReason ?? "Unavailable")}`)}"
              aria-pressed="${selected}"
              ${available ? "" : "disabled"}
            >
              <span class="fighter-accessory-option-art">${renderAccessoryArt(option ?? undefined)}</span>
              <strong>${escapeHtml(name)}</strong>
              ${available ? "" : `<small>${escapeHtml(option?.unavailableReason ?? "Unavailable")}</small>`}
            </button>`;
          })
          .join("")}
      </div>
    </section>`;
}

function renderHealth(fighter: FighterSelectInstance): string {
  const health = boundedPercent(fighter.healthPercent);
  return health === undefined
    ? ""
    : `<span
        class="fighter-select-health"
        role="meter"
        aria-label="${escapeHtml(fighter.name)} current Health"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${Math.round(health)}"
      ><i style="--fighter-health:${health / 100}"></i></span>`;
}

function renderCatalogueFighter(fighter: FighterSelectInstance): string {
  const availability = fighter.availability ?? "available";
  const unavailable =
    availability === "defeated" || availability === "unavailable";
  const statusLabels = [
    ...(availability === "available" ? [] : [availabilityLabel[availability]]),
    ...(fighter.statusLabels ?? []),
  ];
  const actionLabel = unavailable
    ? `${fighter.name}: ${fighter.unavailableReason ?? availabilityLabel[availability]}`
    : `Add ${fighter.name} to the active Lineup`;

  return `
    <button
      type="button"
      class="fighter-cartridge is-${availability}"
      data-command="select-fighter"
      data-instance-id="${escapeHtml(fighter.instanceId)}"
      data-character-id="${escapeHtml(fighter.characterId)}"
      data-fighter-drag="catalogue"
      draggable="${!unavailable}"
      aria-label="${escapeHtml(actionLabel)}"
      aria-pressed="${availability === "selected" || availability === "forced"}"
      ${unavailable ? "disabled" : ""}
    >
      <span class="fighter-cartridge-art">
        ${renderPortrait(fighter)}
        ${renderHealth(fighter)}
      </span>
      <span class="fighter-cartridge-copy">
        <strong>${escapeHtml(fighter.name)}</strong>
        <small>${escapeHtml(fighter.typeLabel)}</small>
      </span>
      ${
        statusLabels.length > 0
          ? `<span class="fighter-cartridge-status">${statusLabels
              .map((label) => `<span>${escapeHtml(label)}</span>`)
              .join("")}</span>`
          : ""
      }
    </button>`;
}

function renderSelectedSlot(
  sideId: FighterSelectSideId,
  slot: FighterSelectSlot,
  slotIndex: number,
  selectedCount: number,
  lineupLocked: boolean,
  targeted: boolean,
): string {
  const locked = lineupLocked || Boolean(slot.locked);
  if (!slot.fighter) {
    return `
      <button
        type="button"
        class="fighter-dock-slot is-empty ${targeted ? "is-targeted" : ""}"
        data-command="target-fighter-slot"
        data-fighter-slot-target
        data-side="${sideId}"
        data-slot="${slot.id}"
        data-slot-index="${slotIndex}"
        aria-pressed="${targeted}"
        aria-label="Add a fighter to ${slot.label} in ${sideId === "player" ? "Your Lineup" : "Opponent Lineup"}"
        ${locked ? "disabled" : ""}
      >
        <span class="fighter-dock-role">${slot.label}</span>
        <span class="fighter-dock-empty">${PLUS_ICON}<strong>Add fighter</strong></span>
      </button>`;
  }

  const fighter = slot.fighter;
  return `
    <article
      class="fighter-dock-slot ${slot.id === "starter" ? "is-starter" : ""} ${targeted ? "is-targeted" : ""}"
      data-fighter-drag="selected"
      data-fighter-slot-target
      data-instance-id="${escapeHtml(fighter.instanceId)}"
      data-side="${sideId}"
      data-slot="${slot.id}"
      data-slot-index="${slotIndex}"
      draggable="${!locked}"
    >
      <span class="fighter-dock-role">${slot.label}</span>
      <button
        type="button"
        class="fighter-dock-target"
        data-command="target-fighter-slot"
        data-side="${sideId}"
        data-slot="${slot.id}"
        data-slot-index="${slotIndex}"
        aria-pressed="${targeted}"
        aria-label="Replace ${escapeHtml(fighter.name)} in ${slot.label}"
        ${locked ? "disabled" : ""}
      >
        <span class="fighter-dock-art">${renderPortrait(fighter)}${renderHealth(fighter)}</span>
        <span class="fighter-dock-copy">
          <strong>${escapeHtml(fighter.name)}</strong>
          <small>${escapeHtml(fighter.typeLabel)}</small>
        </span>
      </button>
      ${
        locked
          ? '<span class="fighter-dock-lock">Locked</span>'
          : `<span class="fighter-dock-controls">
              <span class="fighter-dock-grip" aria-hidden="true">${DRAG_HANDLE}</span>
              <button
                type="button"
                data-command="move-fighter"
                data-instance-id="${escapeHtml(fighter.instanceId)}"
                data-side="${sideId}"
                data-direction="-1"
                aria-label="Move ${escapeHtml(fighter.name)} earlier"
                ${slotIndex === 0 ? "disabled" : ""}
              >${CHEVRON_LEFT}</button>
              <button
                type="button"
                data-command="move-fighter"
                data-instance-id="${escapeHtml(fighter.instanceId)}"
                data-side="${sideId}"
                data-direction="1"
                aria-label="Move ${escapeHtml(fighter.name)} later"
                ${slotIndex >= selectedCount - 1 ? "disabled" : ""}
              >${CHEVRON_RIGHT}</button>
              <button
                type="button"
                data-command="remove-fighter"
                data-instance-id="${escapeHtml(fighter.instanceId)}"
                data-side="${sideId}"
                data-slot="${slot.id}"
                aria-label="Remove ${escapeHtml(fighter.name)} from ${slot.label}"
              >Remove</button>
            </span>`
      }
    </article>`;
}

function renderLineupDock(
  sideId: FighterSelectSideId,
  lineup: FighterSelectLineup,
  active: boolean,
  targetSlot: FighterSelectScreenModel["targetSlot"],
  accessoryOpen: boolean,
  accessoryEditable: boolean,
): string {
  const selectedCount = lineup.slots.filter((slot) => slot.fighter).length;
  const header = lineup.locked
    ? `<div class="fighter-lineup-target is-locked">
        <span class="fighter-lineup-name" id="fighter-${sideId}-lineup">${escapeHtml(lineup.label)}</span>
        <span>Locked</span>
      </div>`
    : `<button
        type="button"
        class="fighter-lineup-target"
        data-command="target-fighter-side"
        data-side="${sideId}"
        aria-pressed="${active}"
      >
        <span class="fighter-lineup-name" id="fighter-${sideId}-lineup">${escapeHtml(lineup.label)}</span>
      </button>`;
  return `
    <section
      class="fighter-lineup-dock ${sideId === "opponent" ? "is-opponent" : "is-player"} ${active ? "is-active" : ""}"
      data-lineup-side="${sideId}"
      aria-labelledby="fighter-${sideId}-lineup"
    >
      <header>${header}</header>
      <div class="fighter-dock-slots">
        ${lineup.slots
          .map((slot, slotIndex) =>
            renderSelectedSlot(
              sideId,
              slot,
              slotIndex,
              selectedCount,
              Boolean(lineup.locked),
              targetSlot?.side === sideId && targetSlot.slotId === slot.id,
            ),
          )
          .join("")}
      </div>
      ${renderLineupAccessory(sideId, lineup, accessoryOpen, accessoryEditable)}
    </section>`;
}

function renderPagination(pagination: FighterSelectPagination): string {
  const page = Math.max(1, pagination.page);
  const pageCount = Math.max(1, pagination.pageCount);
  if (pageCount <= 1) return "";
  const dotPages = Array.from(
    new Set(
      pageCount <= 7
        ? Array.from({ length: pageCount }, (_, index) => index + 1)
        : [1, page - 1, page, page + 1, pageCount],
    ),
  ).filter((dotPage) => dotPage >= 1 && dotPage <= pageCount);
  return `
    <nav class="fighter-pagination" aria-label="Fighter catalogue pages">
      <button
        type="button"
        data-command="previous-fighter-page"
        aria-label="Previous fighter page"
        ${page <= 1 ? "disabled" : ""}
      >${CHEVRON_LEFT}</button>
      <span class="fighter-page-position" aria-live="polite">${page}/${pageCount}</span>
      <span class="fighter-page-dots" aria-label="Choose a fighter page">
        ${dotPages
          .map(
            (dotPage) => `<button
              type="button"
              data-command="go-to-fighter-page"
              data-page="${dotPage}"
              aria-label="Page ${dotPage}"
              aria-current="${dotPage === page ? "page" : "false"}"
            ></button>`,
          )
          .join("")}
      </span>
      <button
        type="button"
        data-command="next-fighter-page"
        aria-label="Next fighter page"
        ${page >= pageCount ? "disabled" : ""}
      >${CHEVRON_RIGHT}</button>
    </nav>`;
}

function renderTargetActions(model: FighterSelectScreenModel): string {
  if (!model.targetSlot) return "";
  const lineup =
    model.targetSlot.side === "player" ? model.player : model.opponent;
  const slotIndex = lineup.slots.findIndex(
    (slot) => slot.id === model.targetSlot?.slotId,
  );
  const slot = lineup.slots[slotIndex];
  if (!slot?.fighter || lineup.locked) return "";
  const selectedCount = lineup.slots.filter((entry) => entry.fighter).length;
  return `<div class="fighter-target-actions" aria-label="Reorder ${escapeHtml(slot.fighter.name)}">
    <button
      type="button"
      data-command="move-fighter"
      data-instance-id="${escapeHtml(slot.fighter.instanceId)}"
      data-side="${model.targetSlot.side}"
      data-direction="-1"
      aria-label="Move ${escapeHtml(slot.fighter.name)} earlier"
      ${slotIndex === 0 ? "disabled" : ""}
    >${CHEVRON_LEFT}</button>
    <button
      type="button"
      data-command="move-fighter"
      data-instance-id="${escapeHtml(slot.fighter.instanceId)}"
      data-side="${model.targetSlot.side}"
      data-direction="1"
      aria-label="Move ${escapeHtml(slot.fighter.name)} later"
      ${slotIndex >= selectedCount - 1 ? "disabled" : ""}
    >${CHEVRON_RIGHT}</button>
    <button
      type="button"
      data-command="remove-fighter"
      data-instance-id="${escapeHtml(slot.fighter.instanceId)}"
      data-side="${model.targetSlot.side}"
      data-slot="${slot.id}"
      aria-label="Remove ${escapeHtml(slot.fighter.name)}"
    >${REMOVE_ICON}</button>
  </div>`;
}

function fighterTargetPrompt(model: FighterSelectScreenModel): string | null {
  if (!model.targetSlot) return null;
  const lineup =
    model.targetSlot.side === "player" ? model.player : model.opponent;
  const slot = lineup.slots.find(
    (entry) => entry.id === model.targetSlot?.slotId,
  );
  return slot ? `Choose a fighter for ${slot.label} in ${lineup.label}.` : null;
}

export function renderFighterSelectScreen(
  model: FighterSelectScreenModel,
): string {
  const titleId = model.titleId ?? "fighter-select-title";
  const targetPrompt = fighterTargetPrompt(model);
  return `
    <section
      class="fighter-select fighter-select--${model.mode}"
      data-fighter-select
      data-active-side="${model.activeSide}"
      data-can-edit-opponent="${model.canEditOpponent}"
      aria-labelledby="${escapeHtml(titleId)}"
    >
      <header class="fighter-select-header">
        <button
          type="button"
          class="fighter-select-parent ${model.navigation.mainMenuCommand ? "" : "is-main-menu"}"
          data-command="${escapeHtml(model.navigation.parentCommand)}"
          aria-label="Return to ${escapeHtml(model.navigation.parentLabel)}"
        >${CHEVRON_LEFT}<span>${escapeHtml(model.navigation.parentLabel)}</span></button>
        <div>
          <h1 id="${escapeHtml(titleId)}">${escapeHtml(model.title)}</h1>
          ${model.context ? `<p>${escapeHtml(model.context)}</p>` : ""}
        </div>
        ${
          model.navigation.mainMenuCommand
            ? `<button
                type="button"
                class="fighter-select-main-menu"
                data-command="${escapeHtml(model.navigation.mainMenuCommand)}"
              >Main Menu</button>`
            : ""
        }
      </header>

      <div class="fighter-select-workbench">
        <section
          class="fighter-catalogue ${targetPrompt ? "is-targeting" : ""}"
          aria-labelledby="fighter-catalogue-title"
        >
          <div class="fighter-catalogue-tools">
            <h2 id="fighter-catalogue-title">Fighters</h2>
            <p
              class="fighter-target-prompt ${targetPrompt ? "is-active" : ""}"
              role="status"
              aria-live="polite"
            >${targetPrompt ? escapeHtml(targetPrompt) : "Choose a fighter."}</p>
            <form role="search" data-fighter-search>
              <label>
                <span class="sr-only">Search fighters</span>
                <input
                  type="search"
                  name="fighterSearch"
                  value="${escapeHtml(model.searchQuery ?? "")}"
                  placeholder="Search fighters"
                  autocomplete="off"
                />
              </label>
              <button type="submit" data-command="search-fighters" aria-label="Search fighters">
                ${SEARCH_ICON}
              </button>
              <button type="button" data-command="open-fighter-filters">
                ${escapeHtml(model.activeFilterLabel ?? "Filters")}
              </button>
            </form>
          </div>
          <div class="fighter-grid" aria-label="Fighter catalogue">
            ${
              model.catalogue.length > 0
                ? model.catalogue.map(renderCatalogueFighter).join("")
                : '<p class="fighter-grid-empty">No fighters match this search. Clear the search or change the filters.</p>'
            }
          </div>
          ${renderPagination(model.pagination)}
        </section>

        <aside class="fighter-selection-docks" aria-label="Selected Lineups">
          ${renderLineupDock(
            "player",
            model.player,
            model.activeSide === "player",
            model.targetSlot,
            model.accessorySide === "player",
            true,
          )}
          ${renderLineupDock(
            "opponent",
            model.opponent,
            model.activeSide === "opponent",
            model.targetSlot,
            model.accessorySide === "opponent",
            model.canEditOpponent,
          )}
        </aside>
        ${renderAccessoryTray(model)}
      </div>

      <footer class="fighter-select-actions">
        ${renderTargetActions(model)}
        <button
          type="button"
          class="primary-action"
          data-command="${escapeHtml(model.continueCommand)}"
          ${model.continueDisabled ? "disabled" : ""}
        >Continue ${CHEVRON_RIGHT}</button>
      </footer>
    </section>`;
}
