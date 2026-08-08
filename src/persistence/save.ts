import type {
  ActionPosition,
  ActionTier,
  Difficulty,
  StatBlock,
} from "../combat/types";
import {
  tournamentDefinitions,
  tournamentTrophies,
  type TournamentMatchSettings,
} from "../tournaments/catalog";
import type {
  TournamentRosterBuild,
  TournamentRunState,
} from "../tournaments/runner";
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

export type TournamentCaseBuild = TournamentRosterBuild;
/** Compatibility view for the three-fight V2 preset controller. */
export type TournamentRunData = TournamentRunState;

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
  storyTournamentTrophyIds: string[];
  revealedRivalIds: string[];
  updatedAt: string;
}

export interface TournamentTrophyProvenanceRecord {
  source: "standalone" | "story" | "legacy-imported";
  storyId: string | null;
  awardedAt: string;
}

export interface TournamentTrophyOwnershipRecord {
  tournamentId: string;
  trophyId: string;
  firstAwardedAt: string;
  provenance: TournamentTrophyProvenanceRecord[];
}

export interface StoryTournamentTrophyRecord {
  tournamentId: string;
  trophyId: string;
  provenance: "story" | "legacy-imported";
  awardedAt: string;
}

export interface StoryCompletionAwardRecord {
  storyId: string;
  awardId: string;
  awardedAt: string;
}

export interface StorySaveData {
  storyId: string;
  saveId: string;
  stamps: number;
  currentNodeId: string;
  clearedNodeIds: string[];
  collection: OwnedCharacter[];
  ownedPatches: string[];
  activeSquadInstanceIds: string[];
  missionProgress: Record<string, number>;
  claimedMissionIds: string[];
  lossesTo: string[];
  tournamentRun: TournamentRunData | null;
  tournamentTrophies: StoryTournamentTrophyRecord[];
  revealedRivalIds: string[];
  updatedAt: string;
}

export interface CustomTournamentNodeData {
  id: string;
  kind:
    | "fight"
    | "content"
    | "chance"
    | "recovery"
    | "reward"
    | "next-fight-effect";
  label: string;
  opponentCharacterIds: string[];
  seed?: number;
  matchSettings?: Partial<TournamentMatchSettings>;
}

export interface CustomTournamentDefinitionData {
  id: string;
  name: string;
  trophyId: string;
  imageAssetId?: string;
  imageAlt?: string;
  matchDefaults?: TournamentMatchSettings;
  nodes: CustomTournamentNodeData[];
  createdAt: string;
  updatedAt: string;
}

export interface PlayerProfileData {
  schemaVersion: 3;
  profileId: string;
  identityPresetVersion: 0 | 1;
  playerName: string;
  quickFightRecord: QuickFightRecord;
  customTournamentDefinitions: CustomTournamentDefinitionData[];
  standaloneTournamentRun: TournamentRunData | null;
  tournamentTrophies: Record<string, TournamentTrophyOwnershipRecord>;
  storyCompletionAwards: Record<string, StoryCompletionAwardRecord>;
  storySaves: Record<string, StorySaveData>;
  updatedAt: string;
}

const preferencesKey = "riot-relics.preferences.v1";
const saveIndexKey = "riot-relics.save-index.v1";
const slotKey = (slot: number): string => `riot-relics.save.v2.${slot}`;
const profileKey = (slot: number): string => `riot-relics.profile.v3.${slot}`;
const profileMigrationBackupKey = (slot: number): string =>
  `riot-relics.save.v2.${slot}.pre-profile-v3`;
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

const tournamentMatchSettingsSchema = z.object({
  difficulty: z.enum(["easy", "normal", "hard", "brutal"]).optional(),
  timeLimitMs: z.number().int().min(30_000).max(300_000),
  playerStartingCharge: z.number().min(0).max(100),
  opponentStartingCharge: z.number().min(0).max(100),
  playerAccessoryId: z.string().min(1).nullable(),
  opponentAccessoryId: z.string().min(1).nullable(),
});

const partialTournamentMatchSettingsSchema =
  tournamentMatchSettingsSchema.partial();

const tournamentPendingEffectSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("heal-active"),
    amount: z.number().positive().max(1),
  }),
  z.object({
    kind: z.literal("heal-roster"),
    amount: z.number().positive().max(1),
  }),
  z.object({
    kind: z.literal("revive-one"),
    healthRatio: z.number().positive().max(1),
  }),
  z.object({
    kind: z.literal("opening-charge"),
    side: z.enum(["player", "opponent"]),
    amount: z.number().positive().max(100),
  }),
  z.object({
    kind: z.literal("starting-status"),
    side: z.enum(["player", "opponent"]),
    target: z.enum(["active", "all"]),
    status: z.enum([
      "stun",
      "attack",
      "defence",
      "evasion",
      "fortune",
      "switchLock",
    ]),
    durationMs: z.number().int().positive(),
    magnitude: z.number().nonnegative(),
  }),
  z.object({
    kind: z.literal("temporary-stat"),
    side: z.enum(["player", "opponent"]),
    target: z.enum(["active", "all"]),
    stat: z.enum(["health", "power", "evasion", "fortune", "tempo"]),
    amount: z
      .number()
      .finite()
      .refine((amount) => amount !== 0),
  }),
]);

const tournamentRunSchema = z
  .object({
    tournamentId: z.string().min(1),
    definitionKind: z.enum(["preset", "variant", "custom"]).optional(),
    baseTournamentId: z.string().min(1).nullable().optional(),
    definitionTrophyId: z.string().min(1).optional(),
    origin: z.enum(["story", "standalone"]).default("story"),
    currentNodeId: z.string().min(1).default("legacy-round"),
    roundIndex: z.number().int().nonnegative(),
    phase: z.enum(["ready", "interlude"]),
    // Accept retired eight-slot v2 snapshots so migration can trim them safely.
    caseBuilds: z.array(tournamentCaseBuildSchema).max(8).default([]),
    deployedInstanceIds: z.array(z.string().min(1)).max(3).default([]),
    healthRatios: z.record(z.string(), z.number().min(0).max(1)),
    opponentHealthRatios: z
      .record(z.string(), z.number().min(0).max(1))
      .default({}),
    activeInstanceId: z.string().min(1).nullable().default(null),
    deploymentAccessoryId: z.string().min(1).nullable().default(null),
    runSettings: z
      .object({
        defaults: tournamentMatchSettingsSchema,
        fightOverrides: z.record(
          z.string(),
          partialTournamentMatchSettingsSchema,
        ),
      })
      .optional(),
    nextRoundChargeBonus: z.number().min(0).max(100),
    opponentNextRoundChargeBonus: z.number().min(0).max(100).default(0),
    pendingNextFightEffects: z.array(tournamentPendingEffectSchema).default([]),
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
  storyTournamentTrophyIds: z.array(z.string().min(1)).default([]),
  revealedRivalIds: z.array(z.string().min(1)).default([]),
  updatedAt: z.string(),
});

const trophyProvenanceSchema = z.object({
  source: z.enum(["standalone", "story", "legacy-imported"]),
  storyId: z.string().min(1).nullable(),
  awardedAt: z.string(),
});

const tournamentTrophyOwnershipSchema = z.object({
  tournamentId: z.string().min(1),
  trophyId: z.string().min(1),
  firstAwardedAt: z.string(),
  provenance: z.array(trophyProvenanceSchema),
});

const storyTournamentTrophySchema = z.object({
  tournamentId: z.string().min(1),
  trophyId: z.string().min(1),
  provenance: z.enum(["story", "legacy-imported"]),
  awardedAt: z.string(),
});

const storyCompletionAwardSchema = z.object({
  storyId: z.string().min(1),
  awardId: z.string().min(1),
  awardedAt: z.string(),
});

const storySaveSchema = z.object({
  storyId: z.string().min(1),
  saveId: z.string().min(1),
  stamps: z.number().int().nonnegative(),
  currentNodeId: z.string().min(1),
  clearedNodeIds: z.array(z.string().min(1)),
  collection: z.array(ownedCharacterSchema),
  ownedPatches: z.array(z.string().min(1)),
  activeSquadInstanceIds: z.array(z.string().min(1)).max(6).default([]),
  missionProgress: z.record(z.string(), z.number().int().nonnegative()),
  claimedMissionIds: z.array(z.string().min(1)),
  lossesTo: z.array(z.string().min(1)),
  tournamentRun: tournamentRunSchema.default(null),
  tournamentTrophies: z.array(storyTournamentTrophySchema).default([]),
  revealedRivalIds: z.array(z.string().min(1)).default([]),
  updatedAt: z.string(),
});

const customTournamentNodeSchema = z.object({
  id: z.string().min(1),
  kind: z.enum([
    "fight",
    "content",
    "chance",
    "recovery",
    "reward",
    "next-fight-effect",
  ]),
  label: z.string().min(1).max(120),
  opponentCharacterIds: z.array(z.string().min(1)).max(3).default([]),
  seed: z.number().int().optional(),
  matchSettings: z
    .object({
      timeLimitMs: z.number().int().min(30_000).max(300_000).optional(),
      playerStartingCharge: z.number().min(0).max(100).optional(),
      opponentStartingCharge: z.number().min(0).max(100).optional(),
      playerAccessoryId: z.string().min(1).nullable().optional(),
      opponentAccessoryId: z.string().min(1).nullable().optional(),
    })
    .optional(),
});

const customTournamentDefinitionSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1).max(80),
    trophyId: z.string().min(1),
    imageAssetId: z.string().min(1).optional(),
    imageAlt: z.string().min(1).optional(),
    matchDefaults: z
      .object({
        timeLimitMs: z.number().int().min(30_000).max(300_000),
        playerStartingCharge: z.number().min(0).max(100),
        opponentStartingCharge: z.number().min(0).max(100),
        playerAccessoryId: z.string().min(1).nullable(),
        opponentAccessoryId: z.string().min(1).nullable(),
      })
      .optional(),
    nodes: z.array(customTournamentNodeSchema).min(1),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .refine(
    (definition) =>
      definition.nodes.some((node) => node.kind === "fight") &&
      definition.nodes
        .filter((node) => node.kind === "fight")
        .every((node) => node.opponentCharacterIds.length > 0),
    "A custom Tournament requires at least one fight with an opponent Squad",
  )
  .refine(
    (definition) => tournamentTrophies[definition.trophyId]?.generic === true,
    "A custom Tournament must use a registered generic Trophy",
  );

const playerProfileSchema = z.object({
  schemaVersion: z.literal(3),
  profileId: z.string().min(1),
  identityPresetVersion: z.union([z.literal(0), z.literal(1)]).default(0),
  playerName: z.string().min(1).max(80),
  quickFightRecord: quickFightRecordSchema,
  customTournamentDefinitions: z
    .array(customTournamentDefinitionSchema)
    .default([]),
  standaloneTournamentRun: tournamentRunSchema.default(null),
  tournamentTrophies: z
    .record(z.string(), tournamentTrophyOwnershipSchema)
    .default({}),
  storyCompletionAwards: z
    .record(z.string(), storyCompletionAwardSchema)
    .default({}),
  storySaves: z.record(z.string(), storySaveSchema),
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
    playerName: defaultPlayerName(slot),
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
    storyTournamentTrophyIds: [],
    revealedRivalIds: [],
    updatedAt: new Date(0).toISOString(),
  };
}

const DEFAULT_PLAYER_NAMES = {
  1: "Headliner",
  2: "Contender",
  3: "Wildcard",
} as const;

export function defaultPlayerName(slot: 1 | 2 | 3): string {
  return DEFAULT_PLAYER_NAMES[slot];
}

function tournamentIdForTrophyId(trophyId: string): string {
  return (
    Object.values(tournamentDefinitions).find(
      (definition) => definition.trophyId === trophyId,
    )?.id ?? `legacy-trophy.${trophyId}`
  );
}

function storySaveFromLegacy(save: SaveData): StorySaveData {
  const hasFirstRunTournamentCompletion =
    save.currentNodeId === "story.first-run.07" ||
    save.clearedNodeIds.includes("story.first-run.06") ||
    save.clearedNodeIds.includes("story.first-run.07");
  const storyTrophyIds = new Set(save.storyTournamentTrophyIds);
  if (hasFirstRunTournamentCompletion) {
    for (const trophyId of save.tournamentTrophyIds) {
      storyTrophyIds.add(trophyId);
    }
  }
  return {
    storyId: "story.first-run",
    saveId: "story.first-run",
    stamps: save.stamps,
    currentNodeId: save.currentNodeId,
    clearedNodeIds: [...save.clearedNodeIds],
    collection: structuredClone(save.collection),
    ownedPatches: [...save.ownedPatches],
    activeSquadInstanceIds: save.collection
      .slice(0, 6)
      .map((owned) => owned.instanceId),
    missionProgress: { ...save.missionProgress },
    claimedMissionIds: [...save.claimedMissionIds],
    lossesTo: [...save.lossesTo],
    tournamentRun: structuredClone(save.tournamentRun),
    tournamentTrophies: [...storyTrophyIds].map((trophyId) => ({
      tournamentId: tournamentIdForTrophyId(trophyId),
      trophyId,
      provenance: "legacy-imported",
      awardedAt: save.updatedAt,
    })),
    revealedRivalIds: [...save.revealedRivalIds],
    updatedAt: save.updatedAt,
  };
}

export function recordTournamentTrophyOwnership(
  sourceProfile: PlayerProfileData,
  input: {
    tournamentId: string;
    trophyId: string;
    source: "standalone" | "story" | "legacy-imported";
    storyId?: string;
    awardedAt: string;
  },
): PlayerProfileData {
  const profile = structuredClone(sourceProfile);
  const existing = profile.tournamentTrophies[input.tournamentId];
  const storyId = input.source === "story" ? (input.storyId ?? null) : null;
  const alreadyRecorded = existing?.provenance.some(
    (record) => record.source === input.source && record.storyId === storyId,
  );
  profile.tournamentTrophies[input.tournamentId] = {
    tournamentId: input.tournamentId,
    trophyId: input.trophyId,
    firstAwardedAt: existing?.firstAwardedAt ?? input.awardedAt,
    provenance: [
      ...(existing?.provenance ?? []),
      ...(alreadyRecorded
        ? []
        : [
            {
              source: input.source,
              storyId,
              awardedAt: input.awardedAt,
            },
          ]),
    ],
  };
  if (input.source === "story" && storyId) {
    const storySave = profile.storySaves[storyId];
    if (
      storySave &&
      !storySave.tournamentTrophies.some(
        (record) => record.tournamentId === input.tournamentId,
      )
    ) {
      storySave.tournamentTrophies.push({
        tournamentId: input.tournamentId,
        trophyId: input.trophyId,
        provenance: "story",
        awardedAt: input.awardedAt,
      });
    }
  }
  profile.updatedAt = input.awardedAt;
  return profile;
}

function profileFromLegacySave(save: SaveData): PlayerProfileData {
  const storySave = storySaveFromLegacy(save);
  let profile: PlayerProfileData = {
    schemaVersion: 3,
    profileId: `profile.local.${save.slot}`,
    identityPresetVersion: 1,
    playerName:
      save.playerName === "Player"
        ? defaultPlayerName(save.slot)
        : save.playerName,
    quickFightRecord: structuredClone(save.quickFightRecord),
    customTournamentDefinitions: [],
    standaloneTournamentRun: structuredClone(save.standaloneTournamentRun),
    tournamentTrophies: {},
    storyCompletionAwards: {},
    storySaves: { [storySave.storyId]: storySave },
    updatedAt: save.updatedAt,
  };
  for (const trophyId of save.tournamentTrophyIds) {
    profile = recordTournamentTrophyOwnership(profile, {
      tournamentId: tournamentIdForTrophyId(trophyId),
      trophyId,
      source: "legacy-imported",
      awardedAt: save.updatedAt,
    });
  }
  if (save.clearedNodeIds.includes("story.first-run.07")) {
    profile.storyCompletionAwards["story.first-run"] = {
      storyId: "story.first-run",
      awardId: "story-award.first-run",
      awardedAt: save.updatedAt,
    };
  }
  return playerProfileSchema.parse(profile);
}

export function createDefaultPlayerProfile(slot: 1 | 2 | 3): PlayerProfileData {
  return profileFromLegacySave(createDefaultSave(slot));
}

function firstRunSaveView(
  profile: PlayerProfileData,
  slot: 1 | 2 | 3,
): SaveData {
  const storySave =
    profile.storySaves["story.first-run"] ??
    storySaveFromLegacy(createDefaultSave(slot));
  return saveSchema.parse({
    schemaVersion: 2,
    slot,
    playerName: profile.playerName,
    stamps: storySave.stamps,
    currentNodeId: storySave.currentNodeId,
    clearedNodeIds: storySave.clearedNodeIds,
    collection: storySave.collection,
    ownedPatches: storySave.ownedPatches,
    missionProgress: storySave.missionProgress,
    claimedMissionIds: storySave.claimedMissionIds,
    lossesTo: storySave.lossesTo,
    quickFightRecord: profile.quickFightRecord,
    tournamentRun: storySave.tournamentRun,
    standaloneTournamentRun: profile.standaloneTournamentRun,
    tournamentTrophyIds: Object.values(profile.tournamentTrophies).map(
      (record) => record.trophyId,
    ),
    storyTournamentTrophyIds: storySave.tournamentTrophies.map(
      (record) => record.trophyId,
    ),
    revealedRivalIds: storySave.revealedRivalIds,
    updatedAt: profile.updatedAt,
  });
}

function applyFirstRunSaveView(
  sourceProfile: PlayerProfileData,
  save: SaveData,
): PlayerProfileData {
  let profile = structuredClone(sourceProfile);
  profile.playerName = save.playerName;
  profile.quickFightRecord = structuredClone(save.quickFightRecord);
  profile.standaloneTournamentRun = structuredClone(
    save.standaloneTournamentRun,
  );
  profile.storySaves["story.first-run"] = {
    ...(profile.storySaves["story.first-run"] ?? storySaveFromLegacy(save)),
    storyId: "story.first-run",
    saveId: "story.first-run",
    stamps: save.stamps,
    currentNodeId: save.currentNodeId,
    clearedNodeIds: [...save.clearedNodeIds],
    collection: structuredClone(save.collection),
    ownedPatches: [...save.ownedPatches],
    activeSquadInstanceIds: (
      profile.storySaves["story.first-run"]?.activeSquadInstanceIds ??
      save.collection.map((owned) => owned.instanceId)
    )
      .filter((instanceId) =>
        save.collection.some((owned) => owned.instanceId === instanceId),
      )
      .slice(0, 6),
    missionProgress: { ...save.missionProgress },
    claimedMissionIds: [...save.claimedMissionIds],
    lossesTo: [...save.lossesTo],
    tournamentRun: structuredClone(save.tournamentRun),
    tournamentTrophies:
      profile.storySaves["story.first-run"]?.tournamentTrophies ?? [],
    revealedRivalIds: [...save.revealedRivalIds],
    updatedAt: save.updatedAt,
  };
  for (const trophyId of save.tournamentTrophyIds) {
    const storySource = save.storyTournamentTrophyIds.includes(trophyId);
    profile = recordTournamentTrophyOwnership(profile, {
      tournamentId: tournamentIdForTrophyId(trophyId),
      trophyId,
      source: storySource ? "story" : "standalone",
      storyId: storySource ? "story.first-run" : undefined,
      awardedAt: save.updatedAt,
    });
  }
  if (save.clearedNodeIds.includes("story.first-run.07")) {
    profile.storyCompletionAwards["story.first-run"] ??= {
      storyId: "story.first-run",
      awardId: "story-award.first-run",
      awardedAt: save.updatedAt,
    };
  }
  profile.updatedAt = save.updatedAt;
  return playerProfileSchema.parse(profile);
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
    const synthesisedNodeId = `round-${run.roundIndex + 1}`;
    if (
      !run.currentNodeId ||
      run.currentNodeId === "legacy-round" ||
      run.currentNodeId === "current-round"
    ) {
      run.currentNodeId = synthesisedNodeId;
      changed = true;
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

function loadLegacySave(storage: Storage, slot: 1 | 2 | 3): SaveData {
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

export function loadPlayerProfile(
  storage: Storage,
  slot: 1 | 2 | 3,
): PlayerProfileData {
  const key = profileKey(slot);
  const raw = storage.getItem(key);
  if (raw) {
    const candidate = playerProfileSchema.safeParse(parseJson(raw));
    if (
      candidate.success &&
      candidate.data.profileId === `profile.local.${slot}`
    ) {
      if (candidate.data.identityPresetVersion === 0) {
        const migrated = {
          ...candidate.data,
          identityPresetVersion: 1 as const,
          playerName:
            candidate.data.playerName === "Player"
              ? defaultPlayerName(slot)
              : candidate.data.playerName,
        };
        storage.setItem(key, JSON.stringify(migrated));
        return migrated;
      }
      return candidate.data;
    }
    preserveCorruptValue(
      storage,
      key,
      raw,
      `Player Profile ${slot} was invalid and opened from the preserved legacy save or safe defaults; the original value was preserved.`,
    );
  }

  const legacyRaw = storage.getItem(slotKey(slot));
  if (legacyRaw && !storage.getItem(profileMigrationBackupKey(slot))) {
    storage.setItem(profileMigrationBackupKey(slot), legacyRaw);
  }
  const profile = profileFromLegacySave(loadLegacySave(storage, slot));
  storage.setItem(key, JSON.stringify(profile));
  return profile;
}

export function savePlayerProfile(
  storage: Storage,
  slot: 1 | 2 | 3,
  sourceProfile: PlayerProfileData,
): PlayerProfileData {
  const profile = playerProfileSchema.parse({
    ...sourceProfile,
    profileId: `profile.local.${slot}`,
  }) as PlayerProfileData;
  storage.setItem(profileKey(slot), JSON.stringify(profile));
  return profile;
}

export function loadSave(storage: Storage, slot: 1 | 2 | 3): SaveData {
  return firstRunSaveView(loadPlayerProfile(storage, slot), slot);
}

export function saveSlot(storage: Storage, save: SaveData): SaveData {
  const updated = saveSchema.parse({
    ...save,
    updatedAt: new Date().toISOString(),
  });
  const profile = applyFirstRunSaveView(
    loadPlayerProfile(storage, save.slot),
    updated,
  );
  return firstRunSaveView(
    savePlayerProfile(storage, save.slot, profile),
    save.slot,
  );
}

export function saveTournamentVictory(
  storage: Storage,
  sourceSave: SaveData,
  tournamentId: string,
  source: "story" | "standalone",
  storyId = "story.first-run",
  resolvedTrophyId?: string,
): SaveData {
  const definition = tournamentDefinitions[tournamentId];
  if (!definition) {
    throw new Error(`Tournament ${tournamentId} is not registered`);
  }
  const trophyId = resolvedTrophyId ?? definition.trophyId;
  if (!tournamentTrophies[trophyId]) {
    throw new Error(`Tournament ${tournamentId} has no registered Trophy`);
  }
  const updated = saveSchema.parse({
    ...sourceSave,
    updatedAt: new Date().toISOString(),
  });
  // The resolved victory below owns this Trophy explicitly. Exclude its
  // compatibility-array projection from legacy inference during the same write.
  const sourceWithoutResolvedTrophy = {
    ...updated,
    tournamentTrophyIds: updated.tournamentTrophyIds.filter(
      (ownedTrophyId) => ownedTrophyId !== trophyId,
    ),
  };
  let profile = applyFirstRunSaveView(
    loadPlayerProfile(storage, updated.slot),
    sourceWithoutResolvedTrophy,
  );
  profile = recordTournamentTrophyOwnership(profile, {
    tournamentId,
    trophyId,
    source,
    storyId: source === "story" ? storyId : undefined,
    awardedAt: updated.updatedAt,
  });
  return firstRunSaveView(
    savePlayerProfile(storage, updated.slot, profile),
    updated.slot,
  );
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
    const slotMatch = target?.match(
      /riot-relics\.(?:save\.v[12]|profile\.v3)\.([123])$/,
    );
    const recoveredSlot = Number(slotMatch?.[1]);
    if (recoveredSlot === 1 || recoveredSlot === 2 || recoveredSlot === 3) {
      savePlayerProfile(
        storage,
        recoveredSlot,
        createDefaultPlayerProfile(recoveredSlot),
      );
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
