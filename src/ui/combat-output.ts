import type {
  ActionDefinition,
  BattleEvent,
  StatusState,
} from "../combat/types";
import { formatLabel } from "./format";

const effectLabels: Partial<
  Record<ActionDefinition["effects"][number]["kind"], string>
> = {
  heal: "Heal",
  damageOverTime: "DoT",
  healOverTime: "Regen",
  stun: "Stun",
  modifyAttack: "Power",
  modifyDefence: "Defence",
  modifyEvasion: "Evasion",
  modifyFortune: "Fortune",
  switchLock: "Switch lock",
  reflectDamage: "Reflect",
  counterOnDodge: "Counter",
  bar: "Charge",
  modifyChargeRate: "Charge rate",
  shield: "Shield",
  cleanse: "Cleanse",
};

export function actionOutputSummary(
  action: ActionDefinition,
  damageEstimate: number,
  effectMultiplier = 1,
): string {
  const outputs = new Set<string>();
  if (damageEstimate > 0) {
    outputs.add(`Attack · Hit ${damageEstimate}`);
  }

  for (const effect of action.effects) {
    if (effect.kind === "damage") {
      continue;
    }
    if (effect.kind === "empowerNextMove") {
      outputs.add(
        `Power +${Math.round(effect.magnitude * effectMultiplier * 100)}% · stacks`,
      );
      continue;
    }
    if (effect.kind === "stun") {
      outputs.add(
        `Stun ${Math.round(effect.chance * 100)}% · ${((effect.durationMs * effectMultiplier) / 1_000).toFixed(1)}s`,
      );
      continue;
    }
    outputs.add(effectLabels[effect.kind] ?? formatLabel(effect.kind));
  }

  const reactionPriority = new Map([
    ["Counter", 0],
    ["Reflect", 0],
  ]);
  return [...outputs]
    .sort(
      (left, right) =>
        (reactionPriority.get(left) ?? 1) - (reactionPriority.get(right) ?? 1),
    )
    .join(" + ");
}

export interface MoveSealOutput {
  value: string;
  label: string;
  tone: "boosted" | "reduced" | "neutral";
  delta: string | null;
}

export interface ActionResolutionFeedback {
  label: "CRITICAL HIT" | "HIT" | "MISS" | "POWER UP" | "RECOVER" | "EFFECT";
  detail: string;
  tone: "critical" | "hit" | "miss" | "support";
}

export function actionResolutionFeedback(
  action: ActionDefinition,
  events: readonly BattleEvent[],
): ActionResolutionFeedback | null {
  const actionEvents = events.filter(
    (event) => !event.actionId || event.actionId === action.id,
  );
  const damage = actionEvents
    .filter(
      (event) =>
        event.type === "damageApplied" &&
        !event.periodic &&
        !event.reactionKind,
    )
    .reduce((total, event) => total + (event.amount ?? 0), 0);
  const landed = actionEvents.some(
    (event) =>
      event.type === "damageApplied" && !event.periodic && !event.reactionKind,
  );
  const dodged = actionEvents.some((event) => event.type === "characterDodged");
  const critical = actionEvents.some((event) => event.type === "criticalHit");
  const isAttack = action.effects.some((effect) => effect.kind === "damage");

  if (critical && landed) {
    return {
      label: "CRITICAL HIT",
      detail: `${damage} DAMAGE`,
      tone: "critical",
    };
  }
  if (landed) {
    return { label: "HIT", detail: `${damage} DAMAGE`, tone: "hit" };
  }
  if (dodged) {
    return { label: "MISS", detail: "DODGED", tone: "miss" };
  }
  if (isAttack) {
    return null;
  }
  if (
    action.effects.some(
      (effect) =>
        effect.kind === "empowerNextMove" || effect.kind === "modifyAttack",
    )
  ) {
    return { label: "POWER UP", detail: "NEXT ATTACK", tone: "support" };
  }
  if (
    action.effects.some(
      (effect) => effect.kind === "heal" || effect.kind === "healOverTime",
    )
  ) {
    return { label: "RECOVER", detail: "HEALTH UP", tone: "support" };
  }
  return { label: "EFFECT", detail: "APPLIED", tone: "support" };
}

export function moveSealOutput(
  action: ActionDefinition,
  damageEstimate: number,
  baseDamageEstimate: number,
  chargeCost: number,
  effectMultiplier = 1,
): MoveSealOutput {
  if (damageEstimate > 0) {
    const tone =
      damageEstimate > baseDamageEstimate
        ? "boosted"
        : damageEstimate < baseDamageEstimate
          ? "reduced"
          : "neutral";
    return {
      value: String(damageEstimate),
      label: `Hit${tone === "boosted" ? " ↑" : tone === "reduced" ? " ↓" : ""} · ${chargeCost}C`,
      tone,
      delta:
        tone === "boosted"
          ? `+${damageEstimate - baseDamageEstimate}`
          : tone === "reduced"
            ? `−${baseDamageEstimate - damageEstimate}`
            : null,
    };
  }

  const empower = action.effects.find(
    (effect) => effect.kind === "empowerNextMove",
  );
  if (empower?.kind === "empowerNextMove") {
    return {
      value: `+${Math.round(empower.magnitude * effectMultiplier * 100)}%`,
      label: `Power · ${chargeCost}C`,
      tone: "neutral",
      delta: null,
    };
  }

  return {
    value: String(chargeCost),
    label: "Charge",
    tone: "neutral",
    delta: null,
  };
}

export function empowerStatusSummary(
  statuses: readonly StatusState[],
): { label: string; description: string } | null {
  const stacks = statuses.filter((status) => status.kind === "empower");
  if (stacks.length === 0) {
    return null;
  }
  const power = Math.round(
    stacks.reduce((total, stack) => total + stack.magnitude, 0) * 100,
  );
  return {
    label: `Power ×${stacks.length} · +${power}% next attack`,
    description: `${stacks.length} Power ${stacks.length === 1 ? "stack" : "stacks"} banked. The next attack gains ${power} percent Power.`,
  };
}
