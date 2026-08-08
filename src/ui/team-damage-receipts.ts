import type {
  BattleEvent,
  BattleState,
  CombatContent,
  Side,
} from "../combat/types";

export interface TeamDamageReceiptTiming {
  firstImpactDelayMs: number;
  damageStaggerMs: number;
}

export interface TeamDamageReceipt {
  targetId: string;
  side: Side;
  characterName: string;
  characterTypeId: string;
  wasActiveBefore: boolean;
  amount: number;
  previousHealth: number;
  currentHealth: number;
  maximumHealth: number;
  impactDelayMs: number;
}

function combatantFor(state: BattleState, instanceId: string) {
  return [...state.player.squad, ...state.enemy.squad].find(
    (combatant) => combatant.instanceId === instanceId,
  );
}

export function teamDamageReceipts(
  events: readonly BattleEvent[],
  before: BattleState | null,
  after: BattleState,
  content: CombatContent,
  timing: TeamDamageReceiptTiming,
): TeamDamageReceipt[] {
  if (!before) return [];
  const damageEvents = events.filter((event) => {
    if (
      event.type !== "damageApplied" ||
      !event.targetId ||
      !event.actionId ||
      event.message === "healthCost" ||
      event.reactionKind
    ) {
      return false;
    }
    return content.actions[event.actionId]?.effects.some(
      (effect) =>
        (effect.kind === "damage" || effect.kind === "damageOverTime") &&
        effect.target === "allEnemies",
    );
  });
  const grouped = new Map<
    string,
    { amount: number; firstDamageIndex: number }
  >();
  for (const [damageIndex, event] of damageEvents.entries()) {
    const existing = grouped.get(event.targetId!);
    grouped.set(event.targetId!, {
      amount: (existing?.amount ?? 0) + (event.amount ?? 0),
      firstDamageIndex: existing?.firstDamageIndex ?? damageIndex,
    });
  }
  return [...grouped.entries()].flatMap(([targetId, damage]) => {
    const previous = combatantFor(before, targetId);
    const current = combatantFor(after, targetId);
    if (!previous || !current) return [];
    return [
      {
        targetId,
        side: current.side,
        characterName:
          content.characters[current.characterId]?.name ?? "Character",
        characterTypeId:
          content.characters[current.characterId]?.typeId ?? "unknown",
        wasActiveBefore:
          before[previous.side].squad[before[previous.side].activeIndex]
            ?.instanceId === previous.instanceId,
        amount: damage.amount,
        previousHealth: previous.currentHealth,
        currentHealth: current.currentHealth,
        maximumHealth: current.maxHealth,
        impactDelayMs: damageEvents[damage.firstDamageIndex]?.periodic
          ? 0
          : timing.firstImpactDelayMs +
            damage.firstDamageIndex * timing.damageStaggerMs,
      },
    ];
  });
}
