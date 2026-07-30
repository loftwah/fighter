import { resolveImagePath } from "../../assets/registry";
import { combatContent } from "../../content/initial-content";
import type { SaveData } from "../../persistence/save";
import { findPatch } from "../../progression/patches";
import { escapeHtml, formatClass } from "../format";

export function renderCollectionScreen(save: SaveData): string {
  const ownedIds = new Set(save.collection.map((entry) => entry.characterId));
  return `
    <section class="collection-wall" aria-labelledby="collection-title">
      <div class="section-heading">
        <p class="eyebrow">Collection & lore</p>
        <h1 id="collection-title">Your shelf has opinions.</h1>
        <p>
          Owned copies keep independent levels, Move tiers, allocations, and
          Patches. Exact duplicates are legal. Taste is not guaranteed.
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
                  <img src="${resolveImagePath(character.portraitAssetId)}" data-asset-id="${character.portraitAssetId}" alt="" />
                </div>
                <div class="box-label">
                  <span>${formatClass(character.classId)}</span>
                  <h2>${owned ? character.name : "Unrevealed Relic"}</h2>
                  <p>${
                    owned
                      ? `Owned ×${ownedCopies.length} · ${ownedCopies
                          .map((entry) => `L${entry.level}`)
                          .join(" / ")}`
                      : "Find the right print first."
                  }</p>
                  <p class="relic-lore">${
                    owned
                      ? escapeHtml(character.lore)
                      : "Lore file sealed until this Relic is revealed."
                  }</p>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
      <section class="patch-shelf" aria-labelledby="patch-shelf-title">
        <h2 id="patch-shelf-title">Patch drawer</h2>
        <p>
          One Patch per owned Relic from level 5. Reusable means moving a
          Patch here removes it from its previous wearer.
        </p>
        <div class="patch-inventory">
          ${
            save.ownedPatches.length > 0
              ? save.ownedPatches
                  .map((patchId) => {
                    const patch = findPatch(patchId);
                    return `
                      <span>
                        <strong>${escapeHtml(patch?.name ?? patchId)}</strong>
                        ${escapeHtml(patch?.description ?? "Unknown Patch")}
                      </span>
                    `;
                  })
                  .join("")
              : "<p>No Patches owned yet. The Backroom Counter rotates them in.</p>"
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
              const patchLocked = Boolean(save.tournamentRun);
              return `
                <article class="owned-build-ticket">
                  <div>
                    <span>${formatClass(character.classId)} · ${owned.instanceId}</span>
                    <h3>${character.name} · Level ${owned.level}</h3>
                    <p>${owned.xp} XP · ${owned.unspentStatPoints} unspent stat points</p>
                  </div>
                  <label>
                    <span>${
                      patchLocked
                        ? "Patch locked during the Cheap Seats Cup"
                        : unlocked
                          ? "Equipped Patch"
                          : "Patch slot unlocks at level 5"
                    }</span>
                    <select
                      name="equippedPatch"
                      data-instance-id="${owned.instanceId}"
                      ${
                        unlocked && !patchLocked && save.ownedPatches.length > 0
                          ? ""
                          : "disabled"
                      }
                    >
                      <option value="">No Patch</option>
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
                  <small>${escapeHtml(patch?.description ?? "No build modifier equipped.")}</small>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
    </section>
  `;
}
