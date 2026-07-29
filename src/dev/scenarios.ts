import { z } from "zod";
import type {
  ActionTier,
  BattleState,
  CombatantBuild,
  Difficulty,
  Side,
} from "../combat/types";
import { combatContent } from "../content/initial-content";
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
  playerStartingBar: number;
  enemyStartingBar: number;
  playerHealthRatio: number;
  enemyHealthRatio: number;
  seed: number;
  difficulty: Difficulty;
  timeLimitMs: number;
  startPaused: boolean;
  controllers: Record<Side, BattleControllerKind>;
}

const characterIdSchema = z
  .string()
  .min(1)
  .refine((id) => Boolean(combatContent.characters[id]), {
    message: "Unknown Relic ID",
  });
const patchIdSchema = z
  .string()
  .min(1)
  .refine((id) => patches.some((patch) => patch.id === id), {
    message: "Unknown Patch ID",
  })
  .nullable();

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
  playerStartingBar: z.number().min(0).max(100),
  enemyStartingBar: z.number().min(0).max(100),
  playerHealthRatio: z.number().min(0.01).max(1),
  enemyHealthRatio: z.number().min(0.01).max(1),
  seed: z.number().int().min(0),
  difficulty: z.enum(["easy", "normal", "hard", "brutal"]),
  timeLimitMs: z.number().int().min(1_000).max(600_000),
  startPaused: z.boolean(),
  controllers: z.object({
    player: z.enum(["human-local", "ai"]),
    enemy: z.enum(["human-local", "ai"]),
  }),
});

const scenario = (value: DevBattleScenario): DevBattleScenario =>
  devBattleScenarioSchema.parse(value);

export const devBattleScenarios = [
  scenario({
    id: "dev.neutral-1v1",
    name: "Neutral 1v1",
    description: "A clean stock matchup for checking the base Charge loop.",
    playerCharacterIds: ["character.mara-vex"],
    enemyCharacterIds: ["character.zipwire"],
    playerLevel: 7,
    enemyLevel: 7,
    playerTier: "normal",
    enemyTier: "normal",
    playerPatchId: null,
    enemyPatchId: null,
    playerStartingBar: 22,
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
    playerCharacterIds: ["character.mara-vex"],
    enemyCharacterIds: ["character.knuckle-tax"],
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
      "character.mara-vex",
      "character.zipwire",
      "character.velvet-hex",
    ],
    enemyCharacterIds: [
      "character.knuckle-tax",
      "character.scrapjack",
      "character.gutter-grin",
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
    id: "dev.status-stack",
    name: "Status Stack",
    description:
      "Control, shields, healing, and cleanse are available immediately.",
    playerCharacterIds: ["character.velvet-hex", "character.mara-vex"],
    enemyCharacterIds: ["character.knuckle-tax", "character.scrapjack"],
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
    id: "dev.timeout",
    name: "Timeout",
    description: "A five-second near-tie for timeout and result verification.",
    playerCharacterIds: ["character.mara-vex"],
    enemyCharacterIds: ["character.zipwire"],
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
      "character.mara-vex",
      "character.zipwire",
      "character.velvet-hex",
    ],
    enemyCharacterIds: ["character.gutter-grin", "character.scrapjack"],
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
  devBattleScenarios[0],
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
  const statBonuses =
    patch?.effect.kind === "stat"
      ? { [patch.effect.stat]: patch.effect.amount }
      : undefined;
  const interruptionResistance =
    patch?.effect.kind === "interruptionResistance"
      ? patch.effect.chance
      : undefined;

  return characterIds.map((characterId, index) => {
    const definition = combatContent.characters[characterId];
    if (!definition) {
      throw new Error(`Missing development Relic: ${characterId}`);
    }
    return {
      instanceId: `dev.${scenarioDefinition.id}.${side}.${index}.${characterId}`,
      level,
      actionIds: definition.actionIds,
      actionTiers: Object.fromEntries(
        definition.actionIds.map((actionId) => [actionId, tier]),
      ),
      statBonuses,
      interruptionResistance,
      equippedPatchId: patchId,
    };
  });
}

export function applyDevStartingHealth(
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
