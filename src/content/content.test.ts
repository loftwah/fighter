import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { imageAssets, presentationAssets } from "../assets/registry";
import { audioAssets, musicTracks } from "../audio/registry";
import { COMBAT_TYPE_WHEEL } from "../combat/rules";
import { quickFightSeed } from "../combat/quick-fight-seed";
import type { ActionDefinition } from "../combat/types";
import {
  accessories,
  actions,
  characters,
  quickFightDefaults,
  storyNodes,
} from "./initial-content";
import { launchCharacterProvenance } from "./character-provenance";
import { startupSequence } from "./startup-content";
import {
  firstRunStoryDefinition,
  validateStoryDefinition,
} from "../story/contracts";
import {
  characterProvenanceSchema,
  validateContent,
  validateStartupContent,
} from "./schema";

describe("authored content", () => {
  it("validates First Run as ordered Level steps with a fight, preset Tournament, and completion award", () => {
    expect(validateStoryDefinition(firstRunStoryDefinition)).toEqual(
      firstRunStoryDefinition,
    );
  });

  it("validates every initial Character and Move reference", () => {
    expect(() =>
      validateContent(actions, characters, accessories),
    ).not.toThrow();
  });

  it("gives every launch Move one explicit tactical category", () => {
    expect(
      actions.every((action) =>
        [
          "attack",
          "teamAttack",
          "stun",
          "teamStun",
          "support",
          "teamSupport",
          "strip",
          "special",
        ].includes(action.category),
      ),
    ).toBe(true);
    expect(new Set(actions.map((action) => action.category))).toEqual(
      new Set([
        "attack",
        "teamAttack",
        "stun",
        "support",
        "teamSupport",
        "strip",
        "special",
      ]),
    );
  });

  it("makes every charged launch Move declare its interruption spend policy", () => {
    expect(
      actions
        .filter((action) => action.chargeMs > 0)
        .every((action) => action.interruptionPolicy === "spend"),
    ).toBe(true);
  });

  it("ships the accepted 6×6×6 launch roster contract", () => {
    expect(characters).toHaveLength(6);
    expect(characters.map((character) => character.id)).toEqual([
      "character.tux",
      "character.humpty",
      "character.moses",
      "character.viking",
      "character.ned-kelly",
      "character.grim-reaper",
    ]);
    expect(new Set(characters.map((character) => character.typeId))).toEqual(
      new Set(COMBAT_TYPE_WHEEL),
    );
    expect(
      Object.fromEntries(
        characters.map((character) => [
          character.name,
          {
            type: character.typeId,
            traits: character.traitIds,
          },
        ]),
      ),
    ).toEqual({
      Tux: { type: "tech", traits: ["icon"] },
      "Humpty Dumpty": { type: "oddball", traits: ["icon"] },
      Moses: { type: "arcane", traits: ["hero", "mythic"] },
      Viking: { type: "brawler", traits: ["historic"] },
      "Ned Kelly": {
        type: "sharpshooter",
        traits: ["hero", "historic"],
      },
      "Grim Reaper": {
        type: "beast",
        traits: ["monster", "mythic"],
      },
    });
  });

  it("makes Viking the accessible launch benchmark", () => {
    expect(quickFightDefaults.playerIds[0]).toBe("character.viking");
    expect(quickFightDefaults.enemyIds).toEqual(["character.grim-reaper"]);
    expect(quickFightSeed(quickFightDefaults)).toBe(quickFightDefaults.seed);

    const viking = characters.find(
      (character) => character.id === "character.viking",
    );
    expect(viking?.actionIds).toEqual([
      "action.viking.shield-bash",
      "action.viking.axe-first",
      "action.viking.berserker-oath",
    ]);

    const battleBoast = actions.find(
      (action) => action.id === "action.viking.shield-bash",
    );
    expect(battleBoast).toMatchObject({
      name: "Battle Boast",
      category: "support",
      position: "1L",
      effects: [
        {
          kind: "empowerNextMove",
          target: "self",
          magnitude: 0.4,
        },
      ],
    });

    const returningAxe = actions.find(
      (action) => action.id === "action.viking.axe-first",
    );
    expect(returningAxe).toMatchObject({
      position: "2L",
      tierProperties: {
        gold: { undodgeable: true },
      },
    });

    const finisher = actions.find(
      (action) => action.id === "action.viking.berserker-oath",
    );
    expect(finisher).toMatchObject({
      category: "attack",
      position: "3L",
    });
    expect(finisher?.effects.some((effect) => effect.kind === "stun")).toBe(
      true,
    );
    expect(
      finisher?.effects.find((effect) => effect.kind === "stun"),
    ).toMatchObject({
      chance: 0.72,
      requiresHit: true,
    });
    expect(finisher?.effects.some((effect) => effect.kind === "damage")).toBe(
      true,
    );
  });

  it("tracks an approved V2 playground record for every launch Character", () => {
    const validatedProvenance = launchCharacterProvenance.map((entry) =>
      characterProvenanceSchema.parse(entry),
    );
    expect(validatedProvenance).toHaveLength(characters.length);
    expect(
      new Set(launchCharacterProvenance.map((entry) => entry.characterId)),
    ).toEqual(new Set(characters.map((character) => character.id)));
    expect(
      validatedProvenance.every(
        (entry) => entry.rightsStatus === "approved-for-distribution",
      ),
    ).toBe(true);
    expect(
      validatedProvenance.every((entry) =>
        entry.rightsNote.includes("current V2 web playground"),
      ),
    ).toBe(true);
  });

  it("ships a complete production-art package for every launch Character", () => {
    for (const character of characters) {
      expect(
        imageAssets[character.portraitAssetId]?.path,
        `${character.id} canonical art`,
      ).toContain("/assets/generated/launch-roster/");
      for (const assetId of character.idleAssetIds) {
        expect(
          imageAssets[assetId]?.path,
          `${character.id} idle art`,
        ).toContain("/assets/generated/launch-roster/");
        expect(imageAssets[assetId]?.framedShot).toMatchObject({
          shotRole: "character-idle",
          facing: "right",
          mirrorPolicy: "side-aware",
          textPolicy: "none",
        });
      }
      const reactionAssetId = character.reactionAssetId;
      expect(reactionAssetId, `${character.id} reaction binding`).toBeTruthy();
      if (!reactionAssetId) continue;
      expect(
        imageAssets[reactionAssetId]?.path,
        `${character.id} reaction art`,
      ).toContain("/assets/generated/launch-roster/");

      for (const actionId of character.actionIds) {
        const action = actions.find((candidate) => candidate.id === actionId)!;
        expect(
          presentationAssets[action.presentationId]?.path,
          `${action.id} Move cut-in`,
        ).toContain("/assets/generated/launch-roster/");
      }
    }

    for (const accessory of accessories) {
      expect(imageAssets[accessory.imageAssetId]?.path, accessory.id).toContain(
        "/assets/generated/launch-roster/accessories/",
      );
      expect(imageAssets[accessory.imageAssetId]?.framedShot).toMatchObject({
        shotRole: "accessory",
        mirrorPolicy: "never",
        textPolicy: "none",
      });
    }
  });

  it("registers one purpose-specific theme for every launch Character", () => {
    expect(musicTracks).toHaveLength(18);
    expect(new Set(musicTracks.map((track) => track.id)).size).toBe(
      musicTracks.length,
    );
    expect(new Set(musicTracks.map((track) => track.path)).size).toBe(
      musicTracks.length,
    );
    const characterThemes = musicTracks.filter(
      (track) => track.role === "character",
    );
    expect(characterThemes).toHaveLength(characters.length);
    for (const character of characters) {
      expect(
        characterThemes.find((track) => track.characterId === character.id)?.id,
      ).toBe(character.musicId);
    }
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

    const malformedCharacters = structuredClone(characters) as unknown[];
    malformedCharacters[0] = {
      ...(malformedCharacters[0] as object),
      portraitAssetId: "image.missing.canonical",
    };
    expect(() => validateContent(actions, malformedCharacters)).toThrow(
      "references missing image.missing.canonical",
    );

    malformedCharacters[0] = {
      ...characters[0]!,
      reactionAssetId: "image.missing.reactions",
    };
    expect(() => validateContent(actions, malformedCharacters)).toThrow(
      "references missing image.missing.reactions",
    );
  });

  it("rejects duplicate Moves and invalid Trait sets on a Character", () => {
    const duplicateMoves = structuredClone(characters);
    duplicateMoves[0]!.actionIds = [
      duplicateMoves[0]!.actionIds[0],
      duplicateMoves[0]!.actionIds[0],
      duplicateMoves[0]!.actionIds[2],
    ];
    expect(() => validateContent(actions, duplicateMoves, accessories)).toThrow(
      "Character Moves must be unique",
    );

    const duplicateTraits = structuredClone(characters) as unknown[];
    duplicateTraits[0] = {
      ...characters[0]!,
      traitIds: ["icon", "icon"],
    };
    expect(() =>
      validateContent(actions, duplicateTraits, accessories),
    ).toThrow("Character traits must be unique");

    const tooManyTraits = structuredClone(characters) as unknown[];
    tooManyTraits[0] = {
      ...characters[0]!,
      traitIds: ["icon", "hero", "historic"],
    };
    expect(() =>
      validateContent(actions, tooManyTraits, accessories),
    ).toThrow();
  });

  it("rejects impossible periodic and hit-gated effect ordering", () => {
    const invalidPeriodic = structuredClone(actions) as ActionDefinition[];
    const damageOverTime = invalidPeriodic
      .flatMap((action) => action.effects)
      .find((effect) => effect.kind === "damageOverTime");
    if (!damageOverTime || damageOverTime.kind !== "damageOverTime") {
      throw new Error("Initial content needs a periodic damage effect");
    }
    damageOverTime.intervalMs = damageOverTime.durationMs + 1;
    expect(() =>
      validateContent(invalidPeriodic, characters, accessories),
    ).toThrow("periodic interval longer than its duration");

    const invalidHitGate = structuredClone(actions) as ActionDefinition[];
    invalidHitGate[0]!.effects = [
      {
        kind: "stun",
        target: "activeEnemy",
        durationMs: 500,
        chance: 1,
        requiresHit: true,
      },
      ...invalidHitGate[0]!.effects,
    ];
    expect(() =>
      validateContent(invalidHitGate, characters, accessories),
    ).toThrow("hit-gated effect before any damage effect");
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
