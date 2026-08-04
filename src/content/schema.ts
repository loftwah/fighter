import { z } from "zod";
import {
  imageAssets,
  presentationAssets,
  videoAssets,
} from "../assets/registry";
import { audioAssets, musicTracks } from "../audio/registry";

const id = z.string().regex(/^[a-z]+(?:[.-][a-z0-9]+)+$/);

const target = z.enum([
  "self",
  "activeAlly",
  "allAllies",
  "activeEnemy",
  "allEnemies",
]);

const effectSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("damage"),
    target,
    power: z.number().positive(),
    hits: z.number().int().positive().optional(),
    undodgeable: z.boolean().optional(),
    shieldPiercing: z.boolean().optional(),
    lifeStealRatio: z.number().min(0).max(1).optional(),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("heal"),
    target,
    power: z.number().positive(),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("damageOverTime"),
    target,
    power: z.number().positive(),
    durationMs: z.number().int().positive(),
    intervalMs: z.number().int().positive(),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("healOverTime"),
    target,
    power: z.number().positive(),
    durationMs: z.number().int().positive(),
    intervalMs: z.number().int().positive(),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("stun"),
    target,
    durationMs: z.number().int().positive(),
    chance: z.number().min(0).max(1),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("modifyAttack"),
    target,
    magnitude: z.number(),
    durationMs: z.number().int().positive(),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("empowerNextMove"),
    target,
    magnitude: z.number().positive(),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("modifyDefence"),
    target,
    magnitude: z.number(),
    durationMs: z.number().int().positive(),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("modifyEvasion"),
    target,
    magnitude: z.number(),
    durationMs: z.number().int().positive(),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("modifyFortune"),
    target,
    magnitude: z.number(),
    durationMs: z.number().int().positive(),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("switchLock"),
    target,
    durationMs: z.number().int().positive(),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("reflectDamage"),
    target,
    ratio: z.number().positive().max(1),
    durationMs: z.number().int().positive(),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("counterOnDodge"),
    target,
    power: z.number().positive(),
    durationMs: z.number().int().positive(),
    uses: z.number().int().positive().max(9).optional(),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("bar"),
    target: z.enum(["allies", "enemies"]),
    amount: z.number(),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("modifyChargeRate"),
    target: z.enum(["allies", "enemies"]),
    multiplier: z.number().min(0).max(3),
    durationMs: z.number().int().positive(),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("shield"),
    target,
    amount: z.number().positive(),
    durationMs: z.number().int().positive(),
    requiresHit: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("cleanse"),
    target,
    requiresHit: z.boolean().optional(),
  }),
]);

const accessoryEffectSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("bar"),
    target: z.enum(["allies", "enemies"]),
    amount: z.number(),
  }),
  z.object({
    kind: z.literal("modifyChargeRate"),
    target: z.enum(["allies", "enemies"]),
    multiplier: z.number().min(0).max(3),
    durationMs: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal("heal"),
    target: z.literal("allies"),
    amount: z.number().positive(),
  }),
  z.object({
    kind: z.literal("shield"),
    target: z.literal("allies"),
    amount: z.number().positive(),
    durationMs: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal("blockMove"),
    target: z.literal("enemies"),
    slotIndex: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    durationMs: z.number().int().positive(),
  }),
]);

export const accessorySchema = z.object({
  id,
  name: z.string().min(2),
  description: z.string().min(4),
  imageAssetId: id,
  effects: z.array(accessoryEffectSchema).min(1),
});

export const actionSchema = z
  .object({
    id,
    name: z.string().min(2),
    description: z.string().min(4),
    category: z.enum([
      "attack",
      "teamAttack",
      "stun",
      "teamStun",
      "support",
      "teamSupport",
      "strip",
      "special",
    ]),
    position: z.enum(["1L", "1", "1H", "2L", "2", "2H", "3L", "3", "3H"]),
    chargeMs: z.number().int().nonnegative(),
    interruptionPolicy: z.literal("spend").optional(),
    effects: z.array(effectSchema).min(1),
    tierProperties: z
      .object({
        gold: z
          .object({
            undodgeable: z.boolean().optional(),
            shieldPiercing: z.boolean().optional(),
          })
          .optional(),
        platinum: z
          .object({
            undodgeable: z.boolean().optional(),
            shieldPiercing: z.boolean().optional(),
          })
          .optional(),
      })
      .optional(),
    presentationId: id,
    audioId: id,
  })
  .superRefine((action, context) => {
    if (action.chargeMs > 0 && action.interruptionPolicy !== "spend") {
      context.addIssue({
        code: "custom",
        path: ["interruptionPolicy"],
        message:
          "A charged Move must declare how interruption handles spent Charge",
      });
    }
  });

export const characterSchema = z.object({
  id,
  name: z.string().min(2),
  lore: z.string().min(12),
  typeId: z.enum([
    "brawler",
    "sharpshooter",
    "arcane",
    "tech",
    "beast",
    "oddball",
    "typeless",
  ]),
  traitIds: z
    .array(z.enum(["hero", "villain", "monster", "mythic", "historic", "icon"]))
    .max(2)
    .refine((traits) => new Set(traits).size === traits.length, {
      message: "Character traits must be unique",
    }),
  level: z.number().int().min(1).max(25),
  baseStats: z.object({
    health: z.number().positive(),
    power: z.number().nonnegative(),
    evasion: z.number().nonnegative(),
    fortune: z.number().nonnegative(),
    tempo: z.number().nonnegative(),
  }),
  actionIds: z
    .tuple([id, id, id])
    .refine((actionIds) => new Set(actionIds).size === actionIds.length, {
      message: "Character Moves must be unique",
    }),
  portraitAssetId: id,
  idleAssetIds: z.tuple([id, id]),
  reactionAssetId: id.optional(),
  musicId: id,
});

export const characterProvenanceSchema = z.object({
  characterId: id,
  sourceKind: z.enum([
    "public-domain-fiction",
    "historical-figure",
    "historical-archetype",
    "religious-mythological",
    "open-source-culture",
    "parody",
    "original",
  ]),
  rightsStatus: z.enum([
    "development-review",
    "approved-for-distribution",
    "private-only",
  ]),
  rightsNote: z.string().min(24),
});

const startupBeatBase = {
  id,
  eyebrow: z.string().min(1).optional(),
  title: z.string().min(1),
  body: z.string().min(1).optional(),
  durationMs: z.number().int().min(250).max(60_000),
};

export const startupBeatSchema = z.discriminatedUnion("kind", [
  z.object({
    ...startupBeatBase,
    kind: z.literal("text"),
  }),
  z.object({
    ...startupBeatBase,
    kind: z.literal("image"),
    imageAssetId: id,
    portraitImageAssetId: id.optional(),
    imageAlt: z.string(),
  }),
  z.object({
    ...startupBeatBase,
    kind: z.literal("video"),
    videoAssetId: id,
    posterImageAssetId: id,
  }),
]);

export function validateStartupContent(beats: unknown[]): void {
  const parsed = z.array(startupBeatSchema).parse(beats);
  for (const beat of parsed) {
    if (beat.kind === "image" && !imageAssets[beat.imageAssetId]) {
      throw new Error(`${beat.id} references missing ${beat.imageAssetId}`);
    }
    if (
      beat.kind === "image" &&
      beat.portraitImageAssetId &&
      !imageAssets[beat.portraitImageAssetId]
    ) {
      throw new Error(
        `${beat.id} references missing ${beat.portraitImageAssetId}`,
      );
    }
    if (beat.kind === "video") {
      if (!videoAssets[beat.videoAssetId]) {
        throw new Error(`${beat.id} references missing ${beat.videoAssetId}`);
      }
      if (!imageAssets[beat.posterImageAssetId]) {
        throw new Error(
          `${beat.id} references missing ${beat.posterImageAssetId}`,
        );
      }
    }
  }
}

export function validateContent(
  actions: unknown[],
  characters: unknown[],
  accessories: unknown[] = [],
): void {
  const parsedActions = z.array(actionSchema).parse(actions);
  const parsedCharacters = z.array(characterSchema).parse(characters);
  const parsedAccessories = z.array(accessorySchema).parse(accessories);
  const actionIds = new Set(parsedActions.map((action) => action.id));
  const actionById = new Map(
    parsedActions.map((action) => [action.id, action]),
  );
  const musicIds = new Set(musicTracks.map((track) => track.id));
  const duplicateActions = parsedActions.filter(
    (action, index) =>
      parsedActions.findIndex((candidate) => candidate.id === action.id) !==
      index,
  );
  if (duplicateActions.length > 0) {
    throw new Error(`Duplicate action ID: ${duplicateActions[0]?.id}`);
  }
  const accessoryIds = new Set<string>();
  for (const accessory of parsedAccessories) {
    if (accessoryIds.has(accessory.id)) {
      throw new Error(`Duplicate Accessory ID: ${accessory.id}`);
    }
    accessoryIds.add(accessory.id);
  }
  for (const action of parsedActions) {
    let hasPrecedingDamage = false;
    for (const effect of action.effects) {
      if (
        (effect.kind === "damageOverTime" || effect.kind === "healOverTime") &&
        effect.intervalMs > effect.durationMs
      ) {
        throw new Error(
          `${action.id} has a periodic interval longer than its duration`,
        );
      }
      if (effect.requiresHit && !hasPrecedingDamage) {
        throw new Error(
          `${action.id} has a hit-gated effect before any damage effect`,
        );
      }
      if (effect.kind === "damage") {
        hasPrecedingDamage = true;
      }
    }
    if (!presentationAssets[action.presentationId]) {
      throw new Error(
        `${action.id} references missing ${action.presentationId}`,
      );
    }
    if (!audioAssets[action.audioId]) {
      throw new Error(`${action.id} references missing ${action.audioId}`);
    }
  }

  const characterIds = new Set<string>();
  for (const character of parsedCharacters) {
    if (characterIds.has(character.id)) {
      throw new Error(`Duplicate character ID: ${character.id}`);
    }
    characterIds.add(character.id);
    for (const actionId of character.actionIds) {
      if (!actionIds.has(actionId)) {
        throw new Error(`${character.id} references missing ${actionId}`);
      }
    }
    if (
      !character.actionIds.some((actionId) =>
        actionById
          .get(actionId)
          ?.effects.some((effect) => effect.kind === "damage"),
      )
    ) {
      throw new Error(
        `${character.id} needs at least one damaging Move for solo battles`,
      );
    }
    for (const assetId of [
      character.portraitAssetId,
      ...character.idleAssetIds,
      character.reactionAssetId,
    ]) {
      if (!assetId) {
        continue;
      }
      if (!imageAssets[assetId]) {
        throw new Error(`${character.id} references missing ${assetId}`);
      }
    }
    if (!musicIds.has(character.musicId)) {
      throw new Error(
        `${character.id} references missing ${character.musicId}`,
      );
    }
  }
}
