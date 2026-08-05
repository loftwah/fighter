import type {
  ActionPosition,
  ActionTier,
  Difficulty,
  StatBlock,
} from "../combat/types";
import { tournamentDefinitions } from "../tournaments/catalog";
import { z } from "zod";

export interface Preferences {
  difficulty: Difficulty;
  pauseKeyMode: "hold" | "toggle";
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
  actionPositions: Partial<Record<string, ActionPosition>>;
  actionTiers: Record<string, ActionTier>;
  equippedPatchId: string | null;
}

export interface TournamentCaseBuild {
  characterId: string;
  instanceId: string;
  level: number;
  statBonuses: StatBlock;
  actionIds: [string, string, string];
  actionPositions?: Partial<Record<string, ActionPosition>>;
  actionTiers: Record<string, ActionTier>;
  interruptionResistance: number;
  equippedPatchId: string | null;
}

export interface TournamentRunData {
  tournamentId: string;
  origin: "story" | "standalone";
  roundIndex: 0 | 1 | 2;
  phase: "ready" | "interlude";
  caseBuilds: TournamentCaseBuild[];
  deployedInstanceIds: string[];
  healthRatios: Record<string, number>;
  activeInstanceId: string | null;
  nextRoundChargeBonus: number;
  selectedDrop: "front-print-repair" | "case-repair" | "hot-start" | null;
  exhaustedAccessoryIds: string[];
}

export interface QuickFightRecord {
  fightsPlayed: number;
  wins: number;
  losses: number;
  lastSeed: number | null;
  lastPlayerCharacterIds: string[];
  lastOpponentCharacterIds: string[];
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
  quickFightRecord: QuickFightRecord;
  tournamentRun: TournamentRunData | null;
  standaloneTournamentRun: TournamentRunData | null;
  tournamentTrophyIds: string[];
  revealedRivalIds: string[];
  updatedAt: string;
}

const preferencesKey = "riot-relics.preferences.v1";
const saveIndexKey = "riot-relics.save-index.v1";
const slotKey = (slot: number): string => `riot-relics.save.v2.${slot}`;
const legacySlotKey = (slot: number): string => `riot-relics.save.v1.${slot}`;
const storageWarningKey = "riot-relics.storage-warning.v1";
const storageRecoveryTargetKey = "riot-relics.storage-recovery-target.v1";

const legacyCharacterIds: Record<string, string> = {
  "character.mara-vex": "character.viking",
  "character.knuckle-tax": "character.ned-kelly",
  "character.zipwire": "character.tux",
  "character.velvet-hex": "character.moses",
  "character.gutter-grin": "character.humpty",
  "character.scrapjack": "character.grim-reaper",
};

const legacyActionIds: Record<string, string> = {
  "action.mara-vex.invoice-breaker": "action.viking.axe-first",
  "action.mara-vex.red-tape": "action.viking.shield-bash",
  "action.mara-vex.hostile-takeover": "action.viking.berserker-oath",
  "action.knuckle-tax.late-fee": "action.ned-kelly.warning-shot",
  "action.knuckle-tax.audit-wall": "action.ned-kelly.iron-outlaw",
  "action.knuckle-tax.asset-freeze": "action.ned-kelly.last-stand",
  "action.zipwire.jump-start": "action.tux.ping",
  "action.zipwire.brownout": "action.tux.root-access",
  "action.zipwire.full-tilt": "action.tux.kernel-panic",
  "action.velvet-hex.soft-landing": "action.moses.staff-tap",
  "action.velvet-hex.bad-omen": "action.moses.part-the-strip",
  "action.velvet-hex.curtain-call": "action.moses.safe-passage",
  "action.gutter-grin.sucker-sticker": "action.humpty.egg-on-your-face",
  "action.gutter-grin.false-bottom": "action.humpty.shell-game",
  "action.gutter-grin.last-laugh": "action.humpty.great-fall",
  "action.scrapjack.bin-kick": "action.grim-reaper.cold-touch",
  "action.scrapjack.loose-screws": "action.grim-reaper.deaths-shadow",
  "action.scrapjack.hard-rubbish": "action.grim-reaper.final-harvest",
};

const legacyTournamentBadgeIds: Record<string, string> = {
  "badge.cheap-seats-champion": "trophy.wrong-door-cup",
};

const preferencesSchema = z.object({
  difficulty: z.enum(["easy", "normal", "hard", "brutal"]),
  pauseKeyMode: z.enum(["hold", "toggle"]),
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
  actionPositions: z
    .record(
      z.string(),
      z.enum(["1L", "1", "1H", "2L", "2", "2H", "3L", "3", "3H"]),
    )
    .default({}),
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
  actionPositions: z
    .record(
      z.string(),
      z.enum(["1L", "1", "1H", "2L", "2", "2H", "3L", "3", "3H"]),
    )
    .default({}),
  actionTiers: z.record(z.string(), z.enum(["stock", "gold", "platinum"])),
  interruptionResistance: z.number().min(0).max(1),
  equippedPatchId: z.string().min(1).nullable(),
});

const tournamentRunSchema = z
  .object({
    tournamentId: z
      .string()
      .min(1)
      .refine((id) => tournamentDefinitions[id] !== undefined),
    origin: z.enum(["story", "standalone"]).default("story"),
    roundIndex: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    phase: z.enum(["ready", "interlude"]),
    // Accept retired eight-slot v2 snapshots so migration can trim them safely.
    caseBuilds: z.array(tournamentCaseBuildSchema).max(8).default([]),
    deployedInstanceIds: z.array(z.string().min(1)).max(3).default([]),
    healthRatios: z.record(z.string(), z.number().min(0).max(1)),
    activeInstanceId: z.string().min(1).nullable().default(null),
    nextRoundChargeBonus: z.number().min(0).max(100),
    selectedDrop: z
      .enum(["front-print-repair", "case-repair", "hot-start"])
      .nullable()
      .default(null),
    exhaustedAccessoryIds: z.array(z.string().min(1)).default([]),
  })
  .nullable();

const quickFightRecordSchema = z.object({
  fightsPlayed: z.number().int().nonnegative(),
  wins: z.number().int().nonnegative(),
  losses: z.number().int().nonnegative(),
  lastSeed: z.number().int().nonnegative().nullable(),
  lastPlayerCharacterIds: z.array(z.string().min(1)).max(3),
  lastOpponentCharacterIds: z.array(z.string().min(1)).max(3),
});

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
  quickFightRecord: quickFightRecordSchema,
  tournamentRun: tournamentRunSchema.default(null),
  standaloneTournamentRun: tournamentRunSchema.default(null),
  tournamentTrophyIds: z.array(z.string().min(1)).default([]),
  revealedRivalIds: z.array(z.string().min(1)).default([]),
  updatedAt: z.string(),
});

export const defaultPreferences: Preferences = {
  difficulty: "normal",
  pauseKeyMode: "hold",
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
    actionPositions: {},
    actionTiers: {},
    equippedPatchId: null,
  };
}

export function createDefaultSave(slot: 1 | 2 | 3): SaveData {
  return {
    schemaVersion: 2,
    slot,
    playerName: "Player",
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
    quickFightRecord: {
      fightsPlayed: 0,
      wins: 0,
      losses: 0,
      lastSeed: null,
      lastPlayerCharacterIds: [],
      lastOpponentCharacterIds: [],
    },
    tournamentRun: null,
    standaloneTournamentRun: null,
    tournamentTrophyIds: [],
    revealedRivalIds: [],
    updatedAt: new Date(0).toISOString(),
  };
}

function migrateRosterIds(sourceSave: SaveData): {
  save: SaveData;
  changed: boolean;
} {
  const save = structuredClone(sourceSave);
  let changed = false;
  const characterId = (id: string): string => {
    const migrated = legacyCharacterIds[id] ?? id;
    changed ||= migrated !== id;
    return migrated;
  };
  const actionId = (id: string): string => {
    const migrated = legacyActionIds[id] ?? id;
    changed ||= migrated !== id;
    return migrated;
  };
  const actionTiers = (
    tiers: Record<string, ActionTier>,
  ): Record<string, ActionTier> =>
    Object.fromEntries(
      Object.entries(tiers).map(([id, tier]) => [actionId(id), tier]),
    );
  const actionPositions = (
    positions: Partial<Record<string, ActionPosition>>,
  ): Partial<Record<string, ActionPosition>> =>
    Object.fromEntries(
      Object.entries(positions).map(([id, position]) => [
        actionId(id),
        position,
      ]),
    );

  for (const owned of save.collection) {
    owned.characterId = characterId(owned.characterId);
    owned.actionOrder = owned.actionOrder.map(actionId);
    owned.actionPositions = actionPositions(owned.actionPositions);
    owned.actionTiers = actionTiers(owned.actionTiers);
  }
  save.lossesTo = save.lossesTo.map(characterId);
  save.revealedRivalIds = save.revealedRivalIds.map(characterId);
  save.quickFightRecord.lastPlayerCharacterIds =
    save.quickFightRecord.lastPlayerCharacterIds.map(characterId);
  save.quickFightRecord.lastOpponentCharacterIds =
    save.quickFightRecord.lastOpponentCharacterIds.map(characterId);

  for (const run of [save.tournamentRun, save.standaloneTournamentRun]) {
    if (!run) {
      continue;
    }
    for (const build of run.caseBuilds) {
      build.characterId = characterId(build.characterId);
      build.actionIds = build.actionIds.map(actionId) as [
        string,
        string,
        string,
      ];
      build.actionPositions = actionPositions(build.actionPositions ?? {});
      build.actionTiers = actionTiers(build.actionTiers);
    }
    const uniqueCaseBuilds = Array.from(
      new Map(
        run.caseBuilds.map((build) => [build.instanceId, build] as const),
      ).values(),
    );
    if (uniqueCaseBuilds.length !== run.caseBuilds.length) {
      run.caseBuilds = uniqueCaseBuilds;
      changed = true;
    }
    if (run.caseBuilds.length > 6) {
      run.caseBuilds = run.caseBuilds.slice(0, 6);
      changed = true;
    }
    for (const build of run.caseBuilds) {
      if (run.healthRatios[build.instanceId] === undefined) {
        run.healthRatios[build.instanceId] = 1;
        changed = true;
      }
    }
    const rosterIds = new Set(run.caseBuilds.map((build) => build.instanceId));
    for (const instanceId of Object.keys(run.healthRatios)) {
      if (!rosterIds.has(instanceId)) {
        delete run.healthRatios[instanceId];
        changed = true;
      }
    }
    const livingIds = run.caseBuilds
      .filter((build) => (run.healthRatios[build.instanceId] ?? 1) > 0)
      .map((build) => build.instanceId);
    const livingIdSet = new Set(livingIds);
    const validDeployment = Array.from(
      new Set(
        run.deployedInstanceIds.filter(
          (instanceId) =>
            rosterIds.has(instanceId) && livingIdSet.has(instanceId),
        ),
      ),
    ).slice(0, 3);
    const deployedInstanceIds =
      validDeployment.length > 0 ? validDeployment : livingIds.slice(0, 3);
    if (deployedInstanceIds.join("|") !== run.deployedInstanceIds.join("|")) {
      run.deployedInstanceIds = deployedInstanceIds;
      changed = true;
    }
    const activeInstanceId = run.activeInstanceId;
    if (!activeInstanceId || !deployedInstanceIds.includes(activeInstanceId)) {
      const repairedActiveInstanceId = deployedInstanceIds[0] ?? null;
      if (repairedActiveInstanceId !== activeInstanceId) {
        run.activeInstanceId = repairedActiveInstanceId;
        changed = true;
      }
    }
  }
  return { save, changed };
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

function migrateTournamentTrophyInput(source: Record<string, unknown>): {
  input: Record<string, unknown>;
  changed: boolean;
} {
  const legacyBadges = source.tournamentBadges;
  if (!Array.isArray(legacyBadges)) {
    return { input: source, changed: false };
  }
  const currentTrophies = Array.isArray(source.tournamentTrophyIds)
    ? source.tournamentTrophyIds.filter(
        (id): id is string => typeof id === "string" && id.length > 0,
      )
    : [];
  const migratedBadges = legacyBadges
    .filter((id): id is string => typeof id === "string" && id.length > 0)
    .flatMap((id) => {
      const trophyId = legacyTournamentBadgeIds[id];
      return trophyId ? [trophyId] : [];
    });
  return {
    input: {
      ...source,
      tournamentTrophyIds: [
        ...new Set([...currentTrophies, ...migratedBadges]),
      ],
    },
    changed: true,
  };
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
  const trophyMigration = migrateTournamentTrophyInput(
    loaded as Record<string, unknown>,
  );
  const candidate = saveSchema.safeParse({
    ...fallback,
    ...trophyMigration.input,
  });
  if (candidate.success && candidate.data.slot === slot) {
    const migrated = migrateRosterIds(candidate.data);
    if (migrated.changed || trophyMigration.changed) {
      storage.setItem(key, JSON.stringify(migrated.save));
    }
    return migrated.save;
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
  const trophyMigration = migrateTournamentTrophyInput(loaded);
  const migrated = saveSchema.safeParse({
    ...createDefaultSave(slot),
    ...trophyMigration.input,
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
  const rosterMigration = migrateRosterIds(migrated.data);
  storage.setItem(slotKey(slot), JSON.stringify(rosterMigration.save));
  return rosterMigration.save;
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
