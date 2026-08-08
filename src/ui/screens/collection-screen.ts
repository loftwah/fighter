import {
  resolveImageObjectPosition,
  resolveImagePath,
} from "../../assets/registry";
import { actionTierProperties, POSITION_RULES } from "../../combat/rules";
import type { ActionPosition, ActionTier, StatBlock } from "../../combat/types";
import { combatContent } from "../../content/initial-content";
import type { SaveData } from "../../persistence/save";
import {
  ALLOCATABLE_STATS,
  resolvedActionOrder,
  resolvedActionPosition,
} from "../../progression/builds";
import { findPatch } from "../../progression/patches";
import { renderCharacterTraits } from "../components/trait-synergy";
import { escapeHtml, formatLabel } from "../format";
import { ICONS } from "../icons";

const statLabel: Record<keyof StatBlock, string> = {
  health: "Vitality",
  power: "Power",
  evasion: "Evasion",
  fortune: "Fortune",
  tempo: "Tempo",
};

const tierLabel: Record<ActionTier, string> = {
  stock: "Normal",
  gold: "Tier 1",
  platinum: "Tier 2",
};

export function renderCollectionScreen(save: SaveData): string {
  const ownedIds = new Set(save.collection.map((entry) => entry.characterId));
  const buildLocked = Boolean(
    save.tournamentRun || save.standaloneTournamentRun,
  );
  return `
    <section class="collection-wall" aria-labelledby="collection-title">
      <div class="section-heading">
        <p class="eyebrow">Collection & lore</p>
        <h1 id="collection-title">Your shelf has opinions.</h1>
        <p>
          Owned copies keep independent levels, Move tiers, allocations, and
          Modifications. Exact duplicates are legal. Taste is not guaranteed.
        </p>
      </div>
      <div class="collection-grid">
        ${Object.values(combatContent.characters)
          .map((character) => {
            const ownedCopies = save.collection.filter(
              (entry) => entry.characterId === character.id,
            );
            const owned = ownedIds.has(character.id);
            return `
              <article class="relic-box ${owned ? "" : "is-locked"}">
                <div class="box-art">
                  <img
                    src="${resolveImagePath(character.portraitAssetId)}"
                    data-asset-id="${character.portraitAssetId}"
                    style="object-position: ${resolveImageObjectPosition(character.portraitAssetId)}"
                    alt=""
                  />
                </div>
                <div class="box-label">
                  <span>${formatLabel(character.typeId)}</span>
                  <div class="trait-chip-row">${renderCharacterTraits(character)}</div>
                  <h2>${owned ? character.name : "Unrevealed Character"}</h2>
                  <p>${
                    owned
                      ? `Owned ×${ownedCopies.length} · ${ownedCopies
                          .map((entry) => `L${entry.level}`)
                          .join(" / ")}`
                      : "Reveal this Character through Story or the Store."
                  }</p>
                  <p class="relic-lore">${
                    owned
                      ? escapeHtml(character.lore)
                      : "Lore file sealed until this Character is revealed."
                  }</p>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
      <section class="patch-shelf" aria-labelledby="patch-shelf-title">
        <h2 id="patch-shelf-title">Modifications</h2>
        <p>
          One Modification per owned Character from level 5. Reusable means
          moving it here removes it from its previous wearer.
        </p>
        <div class="patch-inventory">
          ${
            save.ownedPatches.length > 0
              ? save.ownedPatches
                  .map((patchId) => {
                    const patch = findPatch(patchId);
                    return `
                      <span>
                        ${
                          patch
                            ? `<img src="${resolveImagePath(patch.imageAssetId)}" data-asset-id="${patch.imageAssetId}" alt="" />`
                            : ""
                        }
                        <strong>${escapeHtml(patch?.name ?? patchId)}</strong>
                        ${escapeHtml(patch?.description ?? "Unknown Modification")}
                      </span>
                    `;
                  })
                  .join("")
              : "<p>No Modifications owned yet. The Store rotates them in.</p>"
          }
        </div>
        <div class="owned-build-list">
          ${save.collection
            .map((owned) => {
              const character = combatContent.characters[owned.characterId];
              if (!character) {
                return "";
              }
              const patch = findPatch(owned.equippedPatchId);
              const unlocked = owned.level >= 5;
              const order = resolvedActionOrder(owned, character);
              const matchingDonors = save.collection.filter(
                (candidate) =>
                  candidate.characterId === owned.characterId &&
                  candidate.instanceId !== owned.instanceId,
              );
              return `
                <article class="owned-build-ticket">
                  <div class="build-ticket-heading">
                    <span>${formatLabel(character.typeId)} · ${owned.instanceId}</span>
                    <h3>${character.name} · Level ${owned.level}</h3>
                    <p>${owned.xp} XP · ${owned.unspentStatPoints} unspent stat points</p>
                  </div>
                  <label class="patch-control">
                    <span>${
                      buildLocked
                        ? "Build locked during an active Tournament"
                        : unlocked
                          ? "Equipped Modification"
                          : "Modification slot unlocks at level 5"
                    }</span>
                    <select
                      name="equippedPatch"
                      data-instance-id="${owned.instanceId}"
                      ${
                        unlocked && !buildLocked && save.ownedPatches.length > 0
                          ? ""
                          : "disabled"
                      }
                    >
                      <option value="">No Modification</option>
                      ${save.ownedPatches
                        .map(
                          (patchId) =>
                            `<option value="${patchId}" ${
                              owned.equippedPatchId === patchId
                                ? "selected"
                                : ""
                            }>${escapeHtml(findPatch(patchId)?.name ?? patchId)}</option>`,
                        )
                        .join("")}
                    </select>
                  </label>
                  <small class="patch-description">${escapeHtml(
                    patch?.description ?? "No build modifier equipped.",
                  )}</small>
                  <section class="stat-editor" aria-label="${escapeHtml(character.name)} stat allocation">
                    <div class="build-editor-heading">
                      <h4>Stat points</h4>
                      <span>${owned.unspentStatPoints} available</span>
                    </div>
                    <div class="stat-allocation-grid">
                      ${ALLOCATABLE_STATS.map((stat) => {
                        const amount = owned.statAllocations[stat];
                        return `
                          <div class="stat-stepper">
                            <span>${statLabel[stat]}</span>
                            <button
                              type="button"
                              data-command="adjust-build-stat"
                              data-instance-id="${owned.instanceId}"
                              data-stat="${stat}"
                              data-delta="-1"
                              aria-label="Remove one ${statLabel[stat]} point from ${escapeHtml(character.name)}"
                              ${buildLocked || amount < 1 ? "disabled" : ""}
                            >${ICONS.minus}</button>
                            <output aria-label="${statLabel[stat]} allocated points">${amount}</output>
                            <button
                              type="button"
                              data-command="adjust-build-stat"
                              data-instance-id="${owned.instanceId}"
                              data-stat="${stat}"
                              data-delta="1"
                              aria-label="Add one ${statLabel[stat]} point to ${escapeHtml(character.name)}"
                              ${
                                buildLocked || owned.unspentStatPoints < 1
                                  ? "disabled"
                                  : ""
                              }
                            >${ICONS.plus}</button>
                          </div>
                        `;
                      }).join("")}
                    </div>
                  </section>
                  <section class="move-build-editor" aria-label="${escapeHtml(character.name)} Move build">
                    <div class="build-editor-heading">
                      <h4>Move order & enhancement</h4>
                      <span>${
                        buildLocked
                          ? "Locked for Tournament"
                          : owned.level >= 10
                            ? "Unlocked"
                            : `Unlocks at level 10 · ${10 - owned.level} level${
                                10 - owned.level === 1 ? "" : "s"
                              } to go`
                      }</span>
                    </div>
                    <ol>
                      ${order
                        .map((actionId, index) => {
                          const action = combatContent.actions[actionId]!;
                          const tier = owned.actionTiers[actionId] ?? "stock";
                          const position = resolvedActionPosition(
                            owned,
                            character,
                            action,
                          );
                          const cost =
                            actionTierProperties(action, tier).cost ??
                            POSITION_RULES[position].cost;
                          const band = index + 1;
                          const positionOptions = [
                            `${band}L`,
                            `${band}`,
                            `${band}H`,
                          ] as ActionPosition[];
                          return `
                            <li class="move-build-row">
                              <span class="move-order-number">${index + 1}</span>
                              <div class="move-build-copy">
                                <strong>${escapeHtml(action.name)}</strong>
                                <small>${position} · ${cost} Charge · ${tierLabel[tier]}</small>
                              </div>
                              <label class="move-position-control">
                                <span class="sr-only">Position for ${escapeHtml(action.name)}</span>
                                <select
                                  name="movePosition"
                                  data-instance-id="${owned.instanceId}"
                                  data-action-id="${actionId}"
                                  aria-label="Position for ${escapeHtml(action.name)}"
                                  ${buildLocked || owned.level < 10 ? "disabled" : ""}
                                >
                                  ${positionOptions
                                    .map((candidate) => {
                                      const rule = POSITION_RULES[candidate];
                                      const edge = candidate.endsWith("L")
                                        ? "Earlier"
                                        : candidate.endsWith("H")
                                          ? "Later"
                                          : "Centre";
                                      return `<option value="${candidate}" ${
                                        candidate === position ? "selected" : ""
                                      }>${edge} · ${rule.cost} Charge · ×${rule.multiplier.toFixed(2)}</option>`;
                                    })
                                    .join("")}
                                </select>
                              </label>
                              <div class="move-order-controls" aria-label="Reorder ${escapeHtml(action.name)}">
                                <button
                                  type="button"
                                  data-command="move-build-action"
                                  data-instance-id="${owned.instanceId}"
                                  data-action-id="${actionId}"
                                  data-direction="-1"
                                  aria-label="Move ${escapeHtml(action.name)} earlier"
                                  ${
                                    buildLocked ||
                                    owned.level < 10 ||
                                    index === 0
                                      ? "disabled"
                                      : ""
                                  }
                                >${ICONS.chevronLeft}</button>
                                <button
                                  type="button"
                                  data-command="move-build-action"
                                  data-instance-id="${owned.instanceId}"
                                  data-action-id="${actionId}"
                                  data-direction="1"
                                  aria-label="Move ${escapeHtml(action.name)} later"
                                  ${
                                    buildLocked ||
                                    owned.level < 10 ||
                                    index === order.length - 1
                                      ? "disabled"
                                      : ""
                                  }
                                >${ICONS.chevronRight}</button>
                              </div>
                              <div class="move-enhance-controls">
                                ${
                                  tier === "platinum"
                                    ? "<strong>Maximum tier</strong>"
                                    : `
                                      <label>
                                        <span class="sr-only">Duplicate to consume for ${escapeHtml(action.name)}</span>
                                        <select
                                          name="moveDonor"
                                          aria-label="Matching duplicate for ${escapeHtml(action.name)}"
                                          ${
                                            buildLocked ||
                                            owned.level < 10 ||
                                            matchingDonors.length === 0
                                              ? "disabled"
                                              : ""
                                          }
                                        >
                                          <option value="">Choose duplicate</option>
                                          ${matchingDonors
                                            .map(
                                              (donor) =>
                                                `<option value="${donor.instanceId}">${donor.instanceId} · L${donor.level}</option>`,
                                            )
                                            .join("")}
                                        </select>
                                      </label>
                                      <button
                                        type="button"
                                        data-command="enhance-build-action"
                                        data-instance-id="${owned.instanceId}"
                                        data-action-id="${actionId}"
                                        ${
                                          buildLocked ||
                                          owned.level < 10 ||
                                          matchingDonors.length === 0
                                            ? "disabled"
                                            : ""
                                        }
                                      >Enhance to ${tier === "stock" ? "Tier 1" : "Tier 2"}</button>
                                    `
                                }
                              </div>
                            </li>
                          `;
                        })
                        .join("")}
                    </ol>
                    <p class="build-editor-note">
                      Moving a Move changes its Charge band. Earlier, centre,
                      and later positions tune its exact threshold and output.
                      Enhancement permanently consumes the selected matching copy.
                    </p>
                  </section>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
    </section>
  `;
}
