import type { ActionTier, Difficulty, StatBlock } from "../combat/types";
import { z } from "zod";

export interface Preferences {
  difficulty: Difficulty;
  musicVolume: number;
  sfxVolume: number;
  dialogueVolume: number;
  musicPlaybackEnabled: boolean;
  musicMuted: boolean;
  sfxMuted: boolean;
  dialogueMuted: boolean;
  reducedMotion: boolean;
}

export interface OwnedCharacter {
  instanceId: string;
  characterId: string;
  level: number;
  xp: number;
  unspentStatPoints: number;
  statAllocations: StatBlock;
  actionOrder: string[];
  actionTiers: Record<string, ActionTier>;
  equippedPatchId: string | null;
}

export interface TournamentCaseBuild {
  characterId: string;
  instanceId: string;
  level: number;
  statBonuses: StatBlock;
  actionIds: [string, string, string];
  actionTiers: Record<string, ActionTier>;
  interruptionResistance: number;
  equippedPatchId: string | null;
}

export interface TournamentRunData {
  tournamentId: "tournament.cheap-seats";
  origin: "story" | "standalone";
  roundIndex: 0 | 1 | 2;
  phase: "ready" | "interlude";
  caseBuilds: TournamentCaseBuild[];
  healthRatios: Record<string, number>;
  activeInstanceId: string | null;
  nextRoundChargeBonus: number;
  selectedDrop: "front-print-repair" | "case-repair" | "hot-start" | null;
}

export interface SaveData {
  schemaVersion: 2;
  slot: 1 | 2 | 3;
  playerName: string;
  stamps: number;
  currentNodeId: string;
  clearedNodeIds: string[];
  collection: OwnedCharacter[];
  ownedPatches: string[];
  missionProgress: Record<string, number>;
  claimedMissionIds: string[];
  lossesTo: string[];
  tournamentRun: TournamentRunData | null;
  standaloneTournamentRun: TournamentRunData | null;
  tournamentBadges: string[];
  revealedRivalIds: string[];
  updatedAt: string;
}

const preferencesKey = "riot-relics.preferences.v1";
const saveIndexKey = "riot-relics.save-index.v1";
const slotKey = (slot: number): string => `riot-relics.save.v2.${slot}`;
const legacySlotKey = (slot: number): string => `riot-relics.save.v1.${slot}`;
const storageWarningKey = "riot-relics.storage-warning.v1";
const storageRecoveryTargetKey = "riot-relics.storage-recovery-target.v1";

const preferencesSchema = z.object({
  difficulty: z.enum(["easy", "normal", "hard", "brutal"]),
  musicVolume: z.number().min(0).max(1),
  sfxVolume: z.number().min(0).max(1),
  dialogueVolume: z.number().min(0).max(1),
  musicPlaybackEnabled: z.boolean(),
  musicMuted: z.boolean(),
  sfxMuted: z.boolean(),
  dialogueMuted: z.boolean(),
  reducedMotion: z.boolean(),
});

const ownedCharacterSchema = z.object({
  instanceId: z.string().min(1),
  characterId: z.string().min(1),
  level: z.number().int().min(1).max(25),
  xp: z.number().int().nonnegative(),
  unspentStatPoints: z.number().int().nonnegative(),
  statAllocations: z
    .object({
      health: z.number().int().nonnegative(),
      power: z.number().int().nonnegative(),
      evasion: z.number().int().nonnegative(),
      fortune: z.number().int().nonnegative(),
      tempo: z.number().int().nonnegative(),
    })
    .default({
      health: 0,
      power: 0,
      evasion: 0,
      fortune: 0,
      tempo: 0,
    }),
  actionOrder: z.array(z.string().min(1)).max(3).default([]),
  actionTiers: z
    .record(z.string(), z.enum(["stock", "gold", "platinum"]))
    .default({}),
  equippedPatchId: z.string().min(1).nullable().default(null),
});

const statBlockSchema = z.object({
  health: z.number().int(),
  power: z.number().int(),
  evasion: z.number().int(),
  fortune: z.number().int(),
  tempo: z.number().int(),
});

const tournamentCaseBuildSchema = z.object({
  characterId: z.string().min(1),
  instanceId: z.string().min(1),
  level: z.number().int().min(1).max(25),
  statBonuses: statBlockSchema,
  actionIds: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
  actionTiers: z.record(z.string(), z.enum(["stock", "gold", "platinum"])),
  interruptionResistance: z.number().min(0).max(1),
  equippedPatchId: z.string().min(1).nullable(),
});

const tournamentRunSchema = z
  .object({
    tournamentId: z.literal("tournament.cheap-seats"),
    origin: z.enum(["story", "standalone"]).default("story"),
    roundIndex: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    phase: z.enum(["ready", "interlude"]),
    caseBuilds: z.array(tournamentCaseBuildSchema).max(8).default([]),
    healthRatios: z.record(z.string(), z.number().min(0).max(1)),
    activeInstanceId: z.string().min(1).nullable().default(null),
    nextRoundChargeBonus: z.number().min(0).max(100),
    selectedDrop: z
      .enum(["front-print-repair", "case-repair", "hot-start"])
      .nullable()
      .default(null),
  })
  .nullable();

const saveSchema = z.object({
  schemaVersion: z.literal(2),
  slot: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  playerName: z.string().min(1).max(80),
  stamps: z.number().int().nonnegative(),
  currentNodeId: z.string().min(1),
  clearedNodeIds: z.array(z.string().min(1)),
  collection: z.array(ownedCharacterSchema),
  ownedPatches: z.array(z.string().min(1)),
  missionProgress: z.record(z.string(), z.number().int().nonnegative()),
  claimedMissionIds: z.array(z.string().min(1)),
  lossesTo: z.array(z.string().min(1)),
  tournamentRun: tournamentRunSchema.default(null),
  standaloneTournamentRun: tournamentRunSchema.default(null),
  tournamentBadges: z.array(z.string().min(1)).default([]),
  revealedRivalIds: z.array(z.string().min(1)).default([]),
  updatedAt: z.string(),
});

export const defaultPreferences: Preferences = {
  difficulty: "normal",
  musicVolume: 0.5,
  sfxVolume: 0.75,
  dialogueVolume: 0.8,
  musicPlaybackEnabled: false,
  musicMuted: false,
  sfxMuted: false,
  dialogueMuted: false,
  reducedMotion: false,
};

export function createOwnedCharacter(
  instanceId: string,
  characterId: string,
  level: number,
): OwnedCharacter {
  return {
    instanceId,
    characterId,
    level,
    xp: 0,
    unspentStatPoints: 0,
    statAllocations: {
      health: 0,
      power: 0,
      evasion: 0,
      fortune: 0,
      tempo: 0,
    },
    actionOrder: [],
    actionTiers: {},
    equippedPatchId: null,
  };
}

export function createDefaultSave(slot: 1 | 2 | 3): SaveData {
  return {
    schemaVersion: 2,
    slot,
    playerName: "Collector",
    stamps: 80,
    currentNodeId: "story.first-run.00",
    clearedNodeIds: [],
    collection: [],
    ownedPatches: [],
    missionProgress: {
      "mission.fresh-ink": 0,
      "mission.invoice-denied": 0,
      "mission.print-it-personal": 0,
    },
    claimedMissionIds: [],
    lossesTo: [],
    tournamentRun: null,
    standaloneTournamentRun: null,
    tournamentBadges: [],
    revealedRivalIds: [],
    updatedAt: new Date(0).toISOString(),
  };
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

function preserveCorruptValue(
  storage: Storage,
  key: string,
  raw: string,
  message: string,
): void {
  try {
    storage.setItem(`${key}.corrupt.${new Date().toISOString()}`, raw);
    storage.setItem(storageWarningKey, message);
    storage.setItem(storageRecoveryTargetKey, key);
  } catch {
    // A full or unavailable storage backend must not prevent safe defaults.
  }
}

export function loadPreferences(storage: Storage): Preferences {
  const raw = storage.getItem(preferencesKey);
  if (!raw) {
    return { ...defaultPreferences };
  }
  const parsed = parseJson(raw);
  if (typeof parsed !== "object" || parsed === null) {
    preserveCorruptValue(
      storage,
      preferencesKey,
      raw,
      "Invalid preferences were replaced with safe defaults; the original value was preserved.",
    );
    return { ...defaultPreferences };
  }
  const candidate = preferencesSchema.safeParse({
    ...defaultPreferences,
    ...parsed,
  });
  if (candidate.success) {
    return candidate.data;
  }
  preserveCorruptValue(
    storage,
    preferencesKey,
    raw,
    "Invalid preferences were replaced with safe defaults; the original value was preserved.",
  );
  return { ...defaultPreferences };
}

export function savePreferences(
  storage: Storage,
  preferences: Preferences,
): void {
  storage.setItem(
    preferencesKey,
    JSON.stringify(preferencesSchema.parse(preferences)),
  );
}

export function loadActiveSaveSlot(storage: Storage): 1 | 2 | 3 {
  const raw = storage.getItem(saveIndexKey);
  if (!raw) {
    return 1;
  }
  const parsed = z
    .object({
      activeSlot: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    })
    .safeParse(parseJson(raw));
  if (parsed.success) {
    return parsed.data.activeSlot;
  }
  preserveCorruptValue(
    storage,
    saveIndexKey,
    raw,
    "The save-slot index was invalid and reset to slot 1; the original value was preserved.",
  );
  return 1;
}

export function saveActiveSaveSlot(
  storage: Storage,
  activeSlot: 1 | 2 | 3,
): void {
  storage.setItem(saveIndexKey, JSON.stringify({ activeSlot }));
}

export function loadSave(storage: Storage, slot: 1 | 2 | 3): SaveData {
  const fallback = createDefaultSave(slot);
  const key = slotKey(slot);
  const raw = storage.getItem(key);
  if (!raw) {
    const legacyRaw = storage.getItem(legacySlotKey(slot));
    if (legacyRaw) {
      const migrated = migrateLegacySave(storage, slot, legacyRaw);
      if (migrated) {
        return migrated;
      }
    }
    return fallback;
  }
  const loaded = parseJson(raw);
  if (typeof loaded !== "object" || loaded === null) {
    preserveCorruptValue(
      storage,
      key,
      raw,
      `Save slot ${slot} was invalid and opened with safe defaults; the original value was preserved.`,
    );
    return fallback;
  }
  const candidate = saveSchema.safeParse({
    ...fallback,
    ...loaded,
  });
  if (candidate.success && candidate.data.slot === slot) {
    return candidate.data;
  }
  preserveCorruptValue(
    storage,
    key,
    raw,
    `Save slot ${slot} was invalid and opened with safe defaults; the original value was preserved.`,
  );
  return fallback;
}

function migrateLegacySave(
  storage: Storage,
  slot: 1 | 2 | 3,
  raw: string,
): SaveData | null {
  const loaded = parseJson(raw);
  if (
    typeof loaded !== "object" ||
    loaded === null ||
    !("schemaVersion" in loaded) ||
    loaded.schemaVersion !== 1
  ) {
    preserveCorruptValue(
      storage,
      legacySlotKey(slot),
      raw,
      `Legacy save slot ${slot} could not be migrated and was preserved.`,
    );
    return null;
  }
  const migrated = saveSchema.safeParse({
    ...createDefaultSave(slot),
    ...loaded,
    schemaVersion: 2,
    slot,
  });
  if (!migrated.success) {
    preserveCorruptValue(
      storage,
      legacySlotKey(slot),
      raw,
      `Legacy save slot ${slot} could not be migrated and was preserved.`,
    );
    return null;
  }
  storage.setItem(slotKey(slot), JSON.stringify(migrated.data));
  return migrated.data;
}

export function saveSlot(storage: Storage, save: SaveData): SaveData {
  const updated = saveSchema.parse({
    ...save,
    updatedAt: new Date().toISOString(),
  });
  storage.setItem(slotKey(save.slot), JSON.stringify(updated));
  return updated;
}

export function loadStorageWarning(storage: Storage): string | null {
  return storage.getItem(storageWarningKey);
}

export function clearStorageWarning(storage: Storage): void {
  storage.removeItem(storageWarningKey);
  storage.removeItem(storageRecoveryTargetKey);
}

export function acceptSafeDefaults(
  storage: Storage,
  activeSlot: 1 | 2 | 3,
): { preferences: Preferences; save: SaveData } {
  const target = storage.getItem(storageRecoveryTargetKey);
  if (target === preferencesKey) {
    savePreferences(storage, defaultPreferences);
  } else if (target === saveIndexKey) {
    saveActiveSaveSlot(storage, activeSlot);
  } else if (target) {
    const slotMatch = target?.match(/riot-relics\.save\.v[12]\.([123])$/);
    const recoveredSlot = Number(slotMatch?.[1]);
    if (recoveredSlot === 1 || recoveredSlot === 2 || recoveredSlot === 3) {
      saveSlot(storage, createDefaultSave(recoveredSlot));
    }
  }
  clearStorageWarning(storage);
  return {
    preferences: loadPreferences(storage),
    save: loadSave(storage, activeSlot),
  };
}

export function collectCorruptBackups(
  storage: Storage,
): Record<string, string> {
  const backups: Record<string, string> = {};
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.includes(".corrupt.")) {
      backups[key] = storage.getItem(key) ?? "";
    }
  }
  return backups;
}
