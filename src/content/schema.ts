import { z } from "zod";
import { imageAssets, presentationAssets } from "../assets/registry";
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
  }),
  z.object({
    kind: z.literal("heal"),
    target,
    power: z.number().positive(),
  }),
  z.object({
    kind: z.literal("stun"),
    target,
    durationMs: z.number().int().positive(),
    chance: z.number().min(0).max(1),
  }),
  z.object({
    kind: z.literal("modifyAttack"),
    target,
    magnitude: z.number(),
    durationMs: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal("modifyDefence"),
    target,
    magnitude: z.number(),
    durationMs: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal("bar"),
    target: z.enum(["allies", "enemies"]),
    amount: z.number(),
  }),
  z.object({
    kind: z.literal("shield"),
    target,
    amount: z.number().positive(),
    durationMs: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal("cleanse"),
    target,
  }),
]);

export const actionSchema = z.object({
  id,
  name: z.string().min(2),
  description: z.string().min(4),
  position: z.enum(["1L", "1", "1H", "2L", "2", "2H", "3L", "3", "3H"]),
  chargeMs: z.number().int().nonnegative(),
  effects: z.array(effectSchema).min(1),
  presentationId: id,
  audioId: id,
});

export const characterSchema = z.object({
  id,
  name: z.string().min(2),
  classId: z.enum([
    "impact",
    "feral",
    "guile",
    "circuit",
    "hex",
    "guard",
    "neutral",
  ]),
  factionId: id,
  level: z.number().int().min(1).max(25),
  baseStats: z.object({
    health: z.number().positive(),
    power: z.number().nonnegative(),
    evasion: z.number().nonnegative(),
    fortune: z.number().nonnegative(),
    tempo: z.number().nonnegative(),
  }),
  actionIds: z.tuple([id, id, id]),
  portraitAssetId: id,
  idleAssetIds: z.tuple([id, id]),
  musicId: id,
});

export function validateContent(
  actions: unknown[],
  characters: unknown[],
): void {
  const parsedActions = z.array(actionSchema).parse(actions);
  const parsedCharacters = z.array(characterSchema).parse(characters);
  const actionIds = new Set(parsedActions.map((action) => action.id));
  const musicIds = new Set(musicTracks.map((track) => track.id));
  const duplicateActions = parsedActions.filter(
    (action, index) =>
      parsedActions.findIndex((candidate) => candidate.id === action.id) !==
      index,
  );
  if (duplicateActions.length > 0) {
    throw new Error(`Duplicate action ID: ${duplicateActions[0]?.id}`);
  }
  for (const action of parsedActions) {
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
    for (const assetId of [
      character.portraitAssetId,
      ...character.idleAssetIds,
    ]) {
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
