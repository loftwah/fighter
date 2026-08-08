import { z } from "zod";
import type {
  ActionTier,
  BattleState,
  CombatantBuild,
  Difficulty,
  Side,
} from "../combat/types";
import { createStandardBuild } from "../combat/standard-build";
import { combatContent, quickFightDefaults } from "../content/initial-content";
import { findPatch, patches } from "../progression/patches";

export type BattleControllerKind = "human-local" | "ai";
export type DevMoveTier = "normal" | "tier1" | "tier2";

export interface DevBattleScenario {
  id: string;
  name: string;
  description: string;
  playerCharacterIds: string[];
  enemyCharacterIds: string[];
  playerLevel: number;
  enemyLevel: number;
  playerTier: DevMoveTier;
  enemyTier: DevMoveTier;
  playerPatchId: string | null;
  enemyPatchId: string | null;
  playerAccessoryId?: string | null;
  enemyAccessoryId?: string | null;
  playerStartingBar: number;
  enemyStartingBar: number;
  playerHealthRatio: number;
  enemyHealthRatio: number;
  playerStartingEmpowerStacks?: number;
  playerStartingAttackModifier?: number;
  seed: number;
  difficulty: Difficulty;
  timeLimitMs: number;
  startPaused: boolean;
  standardBuild?: boolean;
  controllers: Record<Side, BattleControllerKind>;
}

const characterIdSchema = z
  .string()
  .min(1)
  .refine((id) => Boolean(combatContent.characters[id]), {
    message: "Unknown Character ID",
  });
const patchIdSchema = z
  .string()
  .min(1)
  .refine((id) => patches.some((patch) => patch.id === id), {
    message: "Unknown Modification ID",
  })
  .nullable();
const accessoryIdSchema = z
  .string()
  .min(1)
  .refine((id) => Boolean(combatContent.accessories[id]), {
    message: "Unknown Accessory ID",
  })
  .nullable()
  .optional();

export const devBattleScenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  playerCharacterIds: z.array(characterIdSchema).min(1).max(3),
  enemyCharacterIds: z.array(characterIdSchema).min(1).max(3),
  playerLevel: z.number().int().min(1).max(25),
  enemyLevel: z.number().int().min(1).max(25),
  playerTier: z.enum(["normal", "tier1", "tier2"]),
  enemyTier: z.enum(["normal", "tier1", "tier2"]),
  playerPatchId: patchIdSchema,
  enemyPatchId: patchIdSchema,
  playerAccessoryId: accessoryIdSchema,
  enemyAccessoryId: accessoryIdSchema,
  playerStartingBar: z.number().min(0).max(100),
  enemyStartingBar: z.number().min(0).max(100),
  playerHealthRatio: z.number().min(0.01).max(1),
  enemyHealthRatio: z.number().min(0.01).max(1),
  playerStartingEmpowerStacks: z.number().int().min(0).max(4).optional(),
  playerStartingAttackModifier: z.number().min(-0.9).max(1).optional(),
  seed: z.number().int().min(0),
  difficulty: z.enum(["easy", "normal", "hard", "brutal"]),
  timeLimitMs: z.number().int().min(1_000).max(600_000),
  startPaused: z.boolean(),
  standardBuild: z.boolean().optional(),
  controllers: z.object({
    player: z.enum(["human-local", "ai"]),
    enemy: z.enum(["human-local", "ai"]),
  }),
});

const scenario = (value: DevBattleScenario): DevBattleScenario =>
  devBattleScenarioSchema.parse(value);

export const devBattleScenarios = [
  scenario({
    id: "v2.viking-acceptance",
    name: "V2 Viking Acceptance",
    description:
      "The fixed-seed first Quick Fight: bank Power, land the axe, then commit the finisher.",
    playerCharacterIds: [...quickFightDefaults.playerIds],
    enemyCharacterIds: [...quickFightDefaults.enemyIds],
    playerLevel: 10,
    enemyLevel: 10,
    playerTier: "normal",
    enemyTier: "normal",
    playerPatchId: null,
    enemyPatchId: null,
    playerAccessoryId: quickFightDefaults.playerAccessoryId,
    enemyAccessoryId: quickFightDefaults.enemyAccessoryId,
    playerStartingBar: 0,
    enemyStartingBar: 0,
    playerHealthRatio: 1,
    enemyHealthRatio: 1,
    seed: quickFightDefaults.seed,
    difficulty: "normal",
    timeLimitMs: 90_000,
    startPaused: false,
    standardBuild: true,
    controllers: { player: "human-local", enemy: "ai" },
  }),
  scenario({
    id: "dev.neutral-1v1",
    name: "Neutral 1v1",
    description: "A clean stock matchup for checking the base Charge loop.",
    playerCharacterIds: ["character.tux"],
    enemyCharacterIds: ["character.tux"],
    playerLevel: 7,
    enemyLevel: 7,
    playerTier: "normal",
    enemyTier: "normal",
    playerPatchId: null,
    enemyPatchId: null,
    playerAccessoryId: null,
    enemyAccessoryId: null,
    playerStartingBar: 0,
    enemyStartingBar: 0,
    playerHealthRatio: 1,
    enemyHealthRatio: 1,
    seed: 20_261_101,
    difficulty: "normal",
    timeLimitMs: 90_000,
    startPaused: false,
    controllers: { player: "human-local", enemy: "ai" },
  }),
  scenario({
    id: "dev.interrupt-window",
    name: "Interrupt Window",
    description:
      "Both sides open charged so wind-up and interruption are immediate.",
    playerCharacterIds: ["character.viking"],
    enemyCharacterIds: ["character.ned-kelly"],
    playerLevel: 10,
    enemyLevel: 10,
    playerTier: "normal",
    enemyTier: "normal",
    playerPatchId: null,
    enemyPatchId: null,
    playerStartingBar: 60,
    enemyStartingBar: 100,
    playerHealthRatio: 1,
    enemyHealthRatio: 1,
    seed: 20_261_102,
    difficulty: "hard",
    timeLimitMs: 45_000,
    startPaused: true,
    controllers: { player: "human-local", enemy: "ai" },
  }),
  scenario({
    id: "dev.switching-3v3",
    name: "Switching 3v3",
    description:
      "Full Lineups for switching, defeat order, and shared Charge checks.",
    playerCharacterIds: [
      "character.viking",
      "character.tux",
      "character.moses",
    ],
    enemyCharacterIds: [
      "character.ned-kelly",
      "character.grim-reaper",
      "character.humpty",
    ],
    playerLevel: 10,
    enemyLevel: 10,
    playerTier: "normal",
    enemyTier: "normal",
    playerPatchId: null,
    enemyPatchId: null,
    playerStartingBar: 50,
    enemyStartingBar: 35,
    playerHealthRatio: 1,
    enemyHealthRatio: 1,
    seed: 20_261_103,
    difficulty: "normal",
    timeLimitMs: 90_000,
    startPaused: true,
    controllers: { player: "human-local", enemy: "ai" },
  }),
  scenario({
    id: "dev.team-damage-1v3",
    name: "Team Damage 1v3",
    description:
      "A ready Tux barrage against three idle targets for split-damage presentation checks.",
    playerCharacterIds: ["character.tux"],
    enemyCharacterIds: [
      "character.viking",
      "character.humpty",
      "character.moses",
    ],
    playerLevel: 10,
    enemyLevel: 10,
    playerTier: "normal",
    enemyTier: "normal",
    playerPatchId: null,
    enemyPatchId: null,
    playerAccessoryId: null,
    enemyAccessoryId: null,
    playerStartingBar: 100,
    enemyStartingBar: 0,
    playerHealthRatio: 1,
    enemyHealthRatio: 1,
    seed: 20_261_109,
    difficulty: "normal",
    timeLimitMs: 90_000,
    startPaused: true,
    controllers: { player: "human-local", enemy: "human-local" },
  }),
  scenario({
    id: "dev.status-stack",
    name: "Status Stack",
    description:
      "Control, shields, healing, and cleanse are available immediately.",
    playerCharacterIds: ["character.moses", "character.viking"],
    enemyCharacterIds: ["character.ned-kelly", "character.grim-reaper"],
    playerLevel: 10,
    enemyLevel: 10,
    playerTier: "tier1",
    enemyTier: "tier1",
    playerPatchId: "patch.no-flinch",
    enemyPatchId: null,
    playerStartingBar: 100,
    enemyStartingBar: 100,
    playerHealthRatio: 0.65,
    enemyHealthRatio: 0.65,
    seed: 20_261_104,
    difficulty: "normal",
    timeLimitMs: 60_000,
    startPaused: true,
    controllers: { player: "human-local", enemy: "ai" },
  }),
  scenario({
    id: "dev.boosted-attacks",
    name: "Boosted Attacks",
    description:
      "Two banked Battle Boast stacks with no usable attack, for boosted prediction and affordability checks.",
    playerCharacterIds: ["character.viking"],
    enemyCharacterIds: ["character.grim-reaper"],
    playerLevel: 10,
    enemyLevel: 10,
    playerTier: "normal",
    enemyTier: "normal",
    playerPatchId: null,
    enemyPatchId: null,
    playerAccessoryId: null,
    enemyAccessoryId: null,
    playerStartingBar: 0,
    enemyStartingBar: 0,
    playerHealthRatio: 1,
    enemyHealthRatio: 1,
    playerStartingEmpowerStacks: 2,
    seed: 20_261_107,
    difficulty: "normal",
    timeLimitMs: 90_000,
    startPaused: true,
    controllers: { player: "human-local", enemy: "ai" },
  }),
  scenario({
    id: "dev.reduced-attacks",
    name: "Reduced Attacks",
    description:
      "A visible Power reduction across both attacks, including an unaffordable finisher.",
    playerCharacterIds: ["character.viking"],
    enemyCharacterIds: ["character.grim-reaper"],
    playerLevel: 10,
    enemyLevel: 10,
    playerTier: "normal",
    enemyTier: "normal",
    playerPatchId: null,
    enemyPatchId: null,
    playerAccessoryId: null,
    enemyAccessoryId: null,
    playerStartingBar: 40,
    enemyStartingBar: 0,
    playerHealthRatio: 1,
    enemyHealthRatio: 1,
    playerStartingAttackModifier: -0.25,
    seed: 20_261_108,
    difficulty: "normal",
    timeLimitMs: 90_000,
    startPaused: true,
    controllers: { player: "human-local", enemy: "ai" },
  }),
  scenario({
    id: "dev.timeout",
    name: "Timeout",
    description: "A five-second near-tie for timeout and result verification.",
    playerCharacterIds: ["character.viking"],
    enemyCharacterIds: ["character.tux"],
    playerLevel: 7,
    enemyLevel: 7,
    playerTier: "normal",
    enemyTier: "normal",
    playerPatchId: null,
    enemyPatchId: null,
    playerStartingBar: 0,
    enemyStartingBar: 0,
    playerHealthRatio: 0.72,
    enemyHealthRatio: 0.7,
    seed: 20_261_105,
    difficulty: "easy",
    timeLimitMs: 5_000,
    startPaused: true,
    controllers: { player: "human-local", enemy: "ai" },
  }),
  scenario({
    id: "dev.cup-round-2",
    name: "Cup Round 2",
    description:
      "A carried-damage tournament-shaped fight without progression.",
    playerCharacterIds: [
      "character.viking",
      "character.tux",
      "character.moses",
    ],
    enemyCharacterIds: ["character.humpty", "character.grim-reaper"],
    playerLevel: 9,
    enemyLevel: 9,
    playerTier: "tier1",
    enemyTier: "normal",
    playerPatchId: "patch.heavy-ink",
    enemyPatchId: null,
    playerStartingBar: 40,
    enemyStartingBar: 25,
    playerHealthRatio: 0.62,
    enemyHealthRatio: 0.84,
    seed: 20_261_106,
    difficulty: "normal",
    timeLimitMs: 90_000,
    startPaused: true,
    controllers: { player: "human-local", enemy: "ai" },
  }),
] as const satisfies readonly DevBattleScenario[];

export const defaultDevScenario: DevBattleScenario = structuredClone(
  devBattleScenarios.find((scenario) => scenario.id === "dev.neutral-1v1")!,
);

export function actionTierForDevTier(tier: DevMoveTier): ActionTier {
  return {
    normal: "stock",
    tier1: "gold",
    tier2: "platinum",
  }[tier] as ActionTier;
}

export function devBuildsForSide(
  scenarioDefinition: DevBattleScenario,
  side: Side,
): CombatantBuild[] {
  const characterIds =
    side === "player"
      ? scenarioDefinition.playerCharacterIds
      : scenarioDefinition.enemyCharacterIds;
  const level =
    side === "player"
      ? scenarioDefinition.playerLevel
      : scenarioDefinition.enemyLevel;
  const tier = actionTierForDevTier(
    side === "player"
      ? scenarioDefinition.playerTier
      : scenarioDefinition.enemyTier,
  );
  const patchId =
    side === "player"
      ? scenarioDefinition.playerPatchId
      : scenarioDefinition.enemyPatchId;
  const patch = findPatch(patchId);
  const interruptionResistance =
    patch?.effect.kind === "interruptionResistance"
      ? patch.effect.chance
      : undefined;

  return characterIds.map((characterId, index) => {
    const definition = combatContent.characters[characterId];
    if (!definition) {
      throw new Error(`Missing development Character: ${characterId}`);
    }
    const standardBuild = scenarioDefinition.standardBuild
      ? createStandardBuild(definition, side, index)
      : null;
    const statBonuses = { ...standardBuild?.statBonuses };
    if (patch?.effect.kind === "stat") {
      statBonuses[patch.effect.stat] =
        (statBonuses[patch.effect.stat] ?? 0) + patch.effect.amount;
    }
    return {
      instanceId: `dev.${scenarioDefinition.id}.${side}.${index}.${characterId}`,
      level: standardBuild?.level ?? level,
      actionIds: definition.actionIds,
      actionTiers: Object.fromEntries(
        definition.actionIds.map((actionId) => [actionId, tier]),
      ),
      statBonuses:
        Object.keys(statBonuses).length > 0 ? statBonuses : undefined,
      interruptionResistance:
        interruptionResistance ?? standardBuild?.interruptionResistance,
      equippedPatchId: patchId,
    };
  });
}

export function applyDevScenarioState(
  sourceState: BattleState,
  scenarioDefinition: DevBattleScenario,
): BattleState {
  const state = structuredClone(sourceState);
  for (const side of ["player", "enemy"] as const) {
    const ratio =
      side === "player"
        ? scenarioDefinition.playerHealthRatio
        : scenarioDefinition.enemyHealthRatio;
    for (const combatant of state[side].squad) {
      combatant.currentHealth = Math.max(
        1,
        Math.round(combatant.maxHealth * ratio),
      );
    }
  }
  const player = state.player.squad[state.player.activeIndex];
  if (player) {
    const durationMs = state.timeLimitMs + 1_000;
    for (
      let stack = 0;
      stack < (scenarioDefinition.playerStartingEmpowerStacks ?? 0);
      stack += 1
    ) {
      player.statuses.push({
        id: `dev.${scenarioDefinition.id}.empower.${stack}`,
        kind: "empower",
        magnitude: 0.28,
        remainingMs: durationMs,
        sourceId: player.instanceId,
        sourceSide: "player",
        actionId: "action.viking.shield-bash",
      });
    }
    if (scenarioDefinition.playerStartingAttackModifier) {
      player.statuses.push({
        id: `dev.${scenarioDefinition.id}.attack`,
        kind: "attack",
        magnitude: scenarioDefinition.playerStartingAttackModifier,
        remainingMs: durationMs,
      });
    }
  }
  return state;
}

export function findDevScenario(id: string): DevBattleScenario | null {
  return devBattleScenarios.find((candidate) => candidate.id === id) ?? null;
}

export function validateDevScenario(
  value: DevBattleScenario,
): DevBattleScenario {
  return devBattleScenarioSchema.parse(value);
}
