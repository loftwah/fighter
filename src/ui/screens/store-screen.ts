import type { SaveData } from "../../persistence/save";
import { findPatch } from "../../progression/patches";
import type { StoreOffer } from "../../store/catalog";
import { renderLockedFeature } from "../components/locked-feature";
import { escapeHtml } from "../format";

export interface StoreScreenModel {
  save: SaveData;
  offers: readonly StoreOffer[];
  locked: boolean;
}

export function renderStoreScreen(model: StoreScreenModel): string {
  if (model.locked) {
    return renderLockedFeature(
      "store-title",
      "Lost Property",
      "Clear History Disagrees to reveal rotating Characters and Modifications.",
    );
  }
  const ownedIds = new Set(
    model.save.collection.map((entry) => entry.characterId),
  );
  const ownedPatches = new Set(model.save.ownedPatches);
  return `
    <section class="store-counter" aria-labelledby="store-title">
      ${
        model.save.currentNodeId === "story.first-run.03"
          ? `
            <aside class="story-unlock-slip">
              <div>
                <span>First Run · Node 03</span>
                <strong>Rotating stock revealed</strong>
                <p>Inspect today's four labels. Buying is optional; the mission board is already being pinned up.</p>
              </div>
              <button class="primary-action" data-command="advance-story-node">
                Read the mission slips <span aria-hidden="true">→</span>
              </button>
            </aside>
          `
          : ""
      }
      <div class="store-scene">
        <div>
          <h1 id="store-title">Lost Property</h1>
          <p>
            Prices rotate with the current selection. Favourites will
            eventually pin revealed stock; for now, today's four offers are
            the whole list.
          </p>
        </div>
        <span class="store-balance">★ ${model.save.stamps} Stamps</span>
      </div>
      <div class="offer-rack">
        ${model.offers
          .map((offer, index) =>
            renderOfferLabel(
              model.save,
              offer,
              index,
              offer.kind === "character"
                ? ownedIds.has(offer.itemId)
                : ownedPatches.has(offer.itemId),
            ),
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderOfferLabel(
  save: SaveData,
  offer: StoreOffer,
  index: number,
  alreadyOwned: boolean,
): string {
  const canAfford = save.stamps >= offer.price;
  const canBuy = canAfford && !(offer.kind === "patch" && alreadyOwned);
  return `
    <article class="offer-label tone-${index % 3}">
      <div>
        <span>${offer.rarity} · ${
          offer.kind === "patch" ? "modification" : offer.kind
        }</span>
        <h2>${offer.name}</h2>
        <p>${
          offer.kind === "character"
            ? `Arrives at level ${offer.level}. ${
                alreadyOwned ? "Another independent copy." : "New shelf entry."
              }`
            : escapeHtml(
                findPatch(offer.itemId)?.description ??
                  "Reusable. One equipped Character at a time.",
              )
        }</p>
      </div>
      <button
        data-command="buy-offer"
        data-offer-id="${offer.id}"
        ${canBuy ? "" : "disabled"}
      >
        <span>★ ${offer.price}</span>
        ${
          offer.kind === "patch" && alreadyOwned
            ? "Already on shelf"
            : canAfford
              ? "Buy label"
              : "Need more Stamps"
        }
      </button>
    </article>
  `;
}
