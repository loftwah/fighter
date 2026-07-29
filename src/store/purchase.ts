import { evaluateMissionProgress } from "../missions/evaluate";
import { createOwnedCharacter, type SaveData } from "../persistence/save";
import type { StoreOffer } from "./catalog";

export type PurchaseResult =
  | { ok: true; save: SaveData }
  | {
      ok: false;
      reason: "insufficientStamps" | "alreadyOwned" | "missingInstanceId";
    };

export function purchaseOffer(
  sourceSave: SaveData,
  offer: StoreOffer,
  characterInstanceId?: string,
): PurchaseResult {
  if (sourceSave.stamps < offer.price) {
    return { ok: false, reason: "insufficientStamps" };
  }
  if (
    offer.kind === "patch" &&
    sourceSave.ownedPatches.includes(offer.itemId)
  ) {
    return { ok: false, reason: "alreadyOwned" };
  }
  if (offer.kind === "character" && !characterInstanceId) {
    return { ok: false, reason: "missingInstanceId" };
  }

  const save = structuredClone(sourceSave);
  save.stamps -= offer.price;
  if (offer.kind === "character") {
    save.collection.push(
      createOwnedCharacter(
        characterInstanceId!,
        offer.itemId,
        offer.level ?? 2,
      ),
    );
    save.missionProgress["mission.fresh-ink"] = evaluateMissionProgress(
      "mission.fresh-ink",
      save.missionProgress["mission.fresh-ink"] ?? 0,
      {
        type: "collectionChanged",
        distinctCharacterCount: new Set(
          save.collection.map((entry) => entry.characterId),
        ).size,
      },
    );
  } else {
    save.ownedPatches.push(offer.itemId);
  }
  return { ok: true, save };
}
