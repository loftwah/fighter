import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  accessories,
  characters,
  combatContent,
} from "../content/initial-content";
import { patches } from "../progression/patches";
import launchArtContract from "./launch-art-contract.json";
import { imageAssets, presentationAssets } from "./registry";

const physicalAssetExists = (path: string | null | undefined): boolean =>
  Boolean(
    path?.startsWith("/assets/") &&
    existsSync(join(process.cwd(), "public", path)),
  );

describe("V2 launch-art coverage contract", () => {
  it("covers the complete six-Character and eighteen-Move matrix", () => {
    expect(launchArtContract.characters).toHaveLength(6);
    expect(
      launchArtContract.characters.flatMap(({ moves }) => moves),
    ).toHaveLength(18);
    expect(new Set(launchArtContract.characters.map(({ id }) => id))).toEqual(
      new Set(characters.map(({ id }) => id)),
    );

    for (const entry of launchArtContract.characters) {
      const character = combatContent.characters[entry.id];
      expect(character, entry.id).toBeDefined();
      expect(entry.moves).toHaveLength(3);
      expect(character?.idleAssetIds).toHaveLength(2);
      for (const imageAssetId of [
        character?.portraitAssetId,
        ...(character?.idleAssetIds ?? []),
        character?.reactionAssetId,
      ]) {
        expect(
          physicalAssetExists(imageAssets[imageAssetId ?? ""]?.path),
          imageAssetId,
        ).toBe(true);
      }
      for (const move of entry.moves) {
        const presentationId = `presentation.${entry.slug}.${move}`;
        expect(
          physicalAssetExists(presentationAssets[presentationId]?.path),
          presentationId,
        ).toBe(true);
      }
    }
  });

  it("covers every V2 Accessory and Modification with registered square art", () => {
    expect(new Set(launchArtContract.accessories.map(({ id }) => id))).toEqual(
      new Set(accessories.map(({ id }) => id)),
    );
    expect(
      new Set(launchArtContract.modifications.map(({ id }) => id)),
    ).toEqual(new Set(patches.map(({ id }) => id)));

    for (const item of [...accessories, ...patches]) {
      const asset = imageAssets[item.imageAssetId];
      expect(physicalAssetExists(asset?.path), item.id).toBe(true);
      expect(asset?.framedShot).toMatchObject({
        frameClass: "square",
        mirrorPolicy: "never",
        textPolicy: "none",
      });
    }
  });

  it("freezes the reusable V2.1 Character artwork template", () => {
    expect(launchArtContract.futureCharacterRequiredRoles).toEqual([
      "canonical",
      "idle-a",
      "idle-b",
      "reactions",
      "move-1",
      "move-2",
      "move-3",
    ]);
    expect(launchArtContract.reactionStates).toEqual([
      "hurt",
      "dodge",
      "stunned",
      "defeated",
      "victory",
      "tense",
    ]);
  });
});
