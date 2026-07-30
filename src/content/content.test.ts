import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { imageAssets, presentationAssets } from "../assets/registry";
import { audioAssets, musicTracks } from "../audio/registry";
import { actions, characters, storyNodes } from "./initial-content";
import { startupSequence } from "./startup-content";
import { validateContent, validateStartupContent } from "./schema";

describe("authored content", () => {
  it("validates every initial Relic and Move reference", () => {
    expect(() => validateContent(actions, characters)).not.toThrow();
  });

  it("validates every startup beat and registered media reference", () => {
    expect(() => validateStartupContent(startupSequence)).not.toThrow();
  });

  it("keeps story node indices and links coherent", () => {
    expect(storyNodes.map((node) => node.index)).toEqual([
      "00",
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
    ]);
    const ids = new Set(storyNodes.map((node) => node.id));
    for (const node of storyNodes) {
      expect(node.next === null || ids.has(node.next)).toBe(true);
    }
  });

  it("rejects incomplete effects and missing logical assets", () => {
    const malformedActions = structuredClone(actions) as unknown[];
    malformedActions[0] = {
      ...(malformedActions[0] as object),
      effects: [{ kind: "damage", target: "activeEnemy" }],
    };
    expect(() => validateContent(malformedActions, characters)).toThrow();

    const malformedCharacters = structuredClone(characters);
    malformedCharacters[0] = {
      ...malformedCharacters[0]!,
      portraitAssetId: "image.missing.canonical",
    };
    expect(() => validateContent(actions, malformedCharacters)).toThrow(
      "references missing image.missing.canonical",
    );
  });

  it("ships every registered physical asset", () => {
    const publicPaths = [
      ...Object.values(imageAssets).map((asset) => asset.path),
      ...Object.values(presentationAssets)
        .map((asset) => asset.path)
        .filter((path): path is string => path !== null),
      ...Object.values(audioAssets).map((asset) => asset.path),
      ...musicTracks.map((track) => track.path),
    ].filter((path) => path.startsWith("/"));
    for (const publicPath of new Set(publicPaths)) {
      expect(
        existsSync(join(process.cwd(), "public", publicPath)),
        `missing public asset ${publicPath}`,
      ).toBe(true);
    }
  });
});
