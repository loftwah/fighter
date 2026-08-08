import type {
  ActionDefinition,
  ActionEffect,
  ActionPosition,
  ActionTier,
  ActionTierProperties,
  BattleState,
  CharacterDefinition,
  CharacterTrait,
  CombatType,
  CombatantState,
  Difficulty,
  Side,
  TeamState,
  TraitBonusRecord,
  TraitScoreRecord,
} from "./types";

export const POSITION_RULES: Record<
  ActionPosition,
  { cost: number; multiplier: number }
> = {
  "1L": { cost: 18, multiplier: 0.7 },
  "1": { cost: 25, multiplier: 0.8 },
  "1H": { cost: 32, multiplier: 0.9 },
  "2L": { cost: 40, multiplier: 1 },
  "2": { cost: 50, multiplier: 1.15 },
  "2H": { cost: 60, multiplier: 1.3 },
  "3L": { cost: 70, multiplier: 1.5 },
  "3": { cost: 82, multiplier: 1.75 },
  "3H": { cost: 95, multiplier: 2 },
};

export const TIER_MULTIPLIERS: Record<ActionTier, number> = {
  stock: 1,
  gold: 1.16,
  platinum: 1.34,
};

export const DAMAGE_TIER_MULTIPLIERS: Record<ActionTier, number> = {
  stock: 1,
  gold: 1.05,
  platinum: 1.08,
};

export function actionTierProperties(
  action: ActionDefinition,
  tier: ActionTier,
): ActionTierProperties {
  if (tier === "stock") {
    return {};
  }
  if (tier === "gold") {
    return { ...action.tierProperties?.gold };
  }
  const gold = action.tierProperties?.gold;
  const platinum = action.tierProperties?.platinum;
  return {
    ...gold,
    ...platinum,
    additionalEffects: [
      ...(gold?.additionalEffects ?? []),
      ...(platinum?.additionalEffects ?? []),
    ],
  };
}

export function actionEffectsForCombatant(
  combatant: CombatantState,
  action: ActionDefinition,
): ActionEffect[] {
  const tier = combatant.actionTiers[action.id] ?? "stock";
  return [
    ...action.effects,
    ...(actionTierProperties(action, tier).additionalEffects ?? []),
  ];
}

export function actionCostForCombatant(
  combatant: CombatantState,
  action: ActionDefinition,
): number {
  const tier = combatant.actionTiers[action.id] ?? "stock";
  return (
    actionTierProperties(action, tier).cost ??
    POSITION_RULES[actionPositionForCombatant(combatant, action)].cost
  );
}

export function actionChargeMsForCombatant(
  combatant: CombatantState,
  action: ActionDefinition,
): number {
  const tier = combatant.actionTiers[action.id] ?? "stock";
  return actionTierProperties(action, tier).chargeMs ?? action.chargeMs;
}

export function actionFormRequirementMet(
  combatant: CombatantState,
  action: ActionDefinition,
): boolean {
  return (
    !action.requiredFormId ||
    combatant.statuses.some(
      (status) =>
        status.kind === "form" && status.formId === action.requiredFormId,
    )
  );
}

export function actionPositionForSlot(
  authoredPosition: ActionPosition,
  slotIndex: number,
): ActionPosition {
  const band = Math.max(0, Math.min(2, Math.floor(slotIndex))) + 1;
  const offset = authoredPosition.endsWith("L")
    ? "L"
    : authoredPosition.endsWith("H")
      ? "H"
      : "";
  return `${band}${offset}` as ActionPosition;
}

export function actionPositionForCombatant(
  combatant: CombatantState,
  action: ActionDefinition,
): ActionPosition {
  const slotIndex = combatant.actionIds.indexOf(action.id);
  if (slotIndex < 0) {
    throw new Error(
      `Move ${action.id} does not belong to ${combatant.instanceId}`,
    );
  }
  const configured = combatant.actionPositions[action.id];
  if (configured?.startsWith(String(slotIndex + 1))) {
    return configured;
  }
  return actionPositionForSlot(action.position, slotIndex);
}

export const BASE_CHARGE_PER_SECOND = 5;
export const TEMPO_CHARGE_PER_SECOND = 0.4;
export const CHARGE_PACING_MULTIPLIER = 0.9;

export function chargePerSecond(tempo: number, echoBonus = false): number {
  const base = BASE_CHARGE_PER_SECOND + tempo * TEMPO_CHARGE_PER_SECOND;
  return base * CHARGE_PACING_MULTIPLIER * (echoBonus ? 1.08 : 1);
}

export function teamChargePerSecond(team: TeamState): number {
  const active = team.squad[team.activeIndex];
  if (!active || hasStatus(active, "stun")) {
    return 0;
  }
  const statusMultiplier = team.statuses
    .filter((status) => status.kind === "chargeRate")
    .reduce((multiplier, status) => multiplier * status.multiplier, 1);
  return (
    chargePerSecond(active.stats.tempo, team.echoChargeBonus) *
    (1 + team.traitBonuses.mythic) *
    statusMultiplier
  );
}

export const COMBAT_TYPE_WHEEL = [
  "brawler",
  "beast",
  "oddball",
  "arcane",
  "sharpshooter",
  "tech",
] as const satisfies readonly CombatType[];

export const CHARACTER_TRAITS = [
  "hero",
  "villain",
  "monster",
  "mythic",
  "historic",
  "icon",
] as const satisfies readonly CharacterTrait[];

const TYPE_ADVANTAGE: Partial<Record<CombatType, CombatType>> = {
  brawler: "beast",
  beast: "oddball",
  oddball: "arcane",
  arcane: "sharpshooter",
  sharpshooter: "tech",
  tech: "brawler",
};

export function typeMultiplier(
  attacker: CombatType,
  defender: CombatType,
): number {
  if (attacker === "typeless" || defender === "typeless") {
    return 1;
  }

  if (TYPE_ADVANTAGE[attacker] === defender) {
    return 1.25;
  }

  if (TYPE_ADVANTAGE[defender] === attacker) {
    return 0.8;
  }

  return 1;
}

function emptyTraitScores(): TraitScoreRecord {
  return Object.fromEntries(
    CHARACTER_TRAITS.map((trait) => [trait, 0]),
  ) as TraitScoreRecord;
}

export function traitSynergy(definitions: CharacterDefinition[]): {
  scores: TraitScoreRecord;
  bonuses: TraitBonusRecord;
} {
  const scores = emptyTraitScores();
  for (const definition of definitions) {
    if (definition.traitIds.length === 1) {
      scores[definition.traitIds[0]] += 1;
      continue;
    }
    if (definition.traitIds.length !== 2) {
      continue;
    }
    scores[definition.traitIds[0]] += 0.5;
    scores[definition.traitIds[1]] += 0.5;
  }

  const bonuses: TraitBonusRecord = {
    hero: scores.hero * 3,
    villain: scores.villain,
    monster: scores.monster,
    mythic: scores.mythic * 0.04,
    historic: Math.min(20, scores.historic * 5),
    icon: scores.icon * 2,
  };
  return { scores, bonuses };
}

export function historicOpeningCharge(bonuses: TraitBonusRecord): number {
  return bonuses.historic;
}

export function monsterDamageMultiplier(bonuses: TraitBonusRecord): number {
  return 1 - bonuses.monster * 0.025;
}

export function difficultyAiDelay(difficulty: Difficulty): number {
  return {
    easy: 1_800,
    normal: 1_400,
    hard: 900,
    brutal: 600,
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
  kind:
    | "attack"
    | "defence"
    | "evasion"
    | "fortune"
    | "shield"
    | "reflection"
    | "dodgeCounter"
    | "empower"
    | "form",
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
