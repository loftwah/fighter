import type {
  ActionPosition,
  ActionTier,
  BattleState,
  CharacterClass,
  CombatantState,
  Difficulty,
  Side,
} from "./types";

export const POSITION_RULES: Record<
  ActionPosition,
  { cost: number; multiplier: number }
> = {
  "1L": { cost: 18, multiplier: 0.72 },
  "1": { cost: 25, multiplier: 0.82 },
  "1H": { cost: 32, multiplier: 0.92 },
  "2L": { cost: 43, multiplier: 0.94 },
  "2": { cost: 50, multiplier: 1 },
  "2H": { cost: 57, multiplier: 1.08 },
  "3L": { cost: 68, multiplier: 1.12 },
  "3": { cost: 75, multiplier: 1.22 },
  "3H": { cost: 82, multiplier: 1.34 },
};

export const TIER_MULTIPLIERS: Record<ActionTier, number> = {
  stock: 1,
  gold: 1.16,
  platinum: 1.34,
};

const CLASS_ADVANTAGE: Partial<Record<CharacterClass, CharacterClass>> = {
  impact: "feral",
  feral: "guile",
  guile: "circuit",
  circuit: "hex",
  hex: "guard",
  guard: "impact",
};

export function classMultiplier(
  attacker: CharacterClass,
  defender: CharacterClass,
): number {
  if (attacker === "neutral" || defender === "neutral") {
    return 1;
  }

  if (CLASS_ADVANTAGE[attacker] === defender) {
    return 1.2;
  }

  if (CLASS_ADVANTAGE[defender] === attacker) {
    return 0.82;
  }

  return 1;
}

export function difficultyAiDelay(difficulty: Difficulty): number {
  return {
    easy: 1300,
    normal: 850,
    hard: 520,
    brutal: 320,
  }[difficulty];
}

export function isAlive(combatant: CombatantState): boolean {
  return combatant.currentHealth > 0;
}

export function sideForInstance(
  state: BattleState,
  instanceId: string | undefined,
): Side | null {
  if (!instanceId) {
    return null;
  }
  const combatant = [...state.player.squad, ...state.enemy.squad].find(
    (candidate) => candidate.instanceId === instanceId,
  );
  return combatant?.side ?? null;
}

export function statusMagnitude(
  combatant: CombatantState,
  kind: "attack" | "defence" | "shield",
): number {
  return combatant.statuses
    .filter((status) => status.kind === kind)
    .reduce((total, status) => total + status.magnitude, 0);
}

export function hasStatus(
  combatant: CombatantState,
  kind: "stun" | "switchLock",
): boolean {
  return combatant.statuses.some((status) => status.kind === kind);
}
