import type { BattleEvent } from "../combat/types";

export interface CountdownBeat {
  label: "3" | "2" | "1" | "FIGHT";
  durationMs: number;
}

export const BATTLE_COUNTDOWN: readonly CountdownBeat[] = [
  { label: "3", durationMs: 650 },
  { label: "2", durationMs: 650 },
  { label: "1", durationMs: 650 },
  { label: "FIGHT", durationMs: 520 },
];

export const INSTANT_MOVE_IMPACT_DELAY_MS = 850;
export const CHARGED_MOVE_IMPACT_DELAY_MS = 520;
export const REACTION_IMPACT_DELAY_MS = 420;
export const DAMAGE_STAGGER_MS = 180;
export const IMPACT_VISUAL_MS = 820;

export function holdAiDecisionClock(now: number): number {
  return now;
}

export function aiDecisionReady(
  lastDecisionAt: number,
  now: number,
  delayMs: number,
): boolean {
  return now - lastDecisionAt >= delayMs;
}

export function battlePresentationDuration(events: BattleEvent[]): number {
  const presentationEvents = events.filter((event) => !event.periodic);
  const types = new Set(presentationEvents.map((event) => event.type));
  if (types.has("accessoryActivated")) {
    return 1_600;
  }
  const hasStarted = types.has("actionStarted");
  const hasResolved = types.has("actionCharged");
  const impactDelay =
    hasStarted && hasResolved
      ? INSTANT_MOVE_IMPACT_DELAY_MS
      : hasResolved
        ? CHARGED_MOVE_IMPACT_DELAY_MS
        : REACTION_IMPACT_DELAY_MS;
  const damageCount = presentationEvents.filter(
    (event) => event.type === "damageApplied",
  ).length;
  const hasImpact =
    damageCount > 0 ||
    types.has("healingApplied") ||
    types.has("characterDodged") ||
    types.has("criticalHit") ||
    types.has("reactionTriggered") ||
    types.has("actionInterrupted") ||
    types.has("interruptionResisted") ||
    types.has("statusApplied");

  if (types.has("battleEnded") || types.has("characterDefeated")) {
    return Math.max(
      2_600,
      impactDelay + damageCount * DAMAGE_STAGGER_MS + 1_200,
    );
  }

  if (hasStarted && hasResolved) {
    return Math.max(
      2_100,
      hasImpact
        ? impactDelay +
            Math.max(0, damageCount - 1) * DAMAGE_STAGGER_MS +
            IMPACT_VISUAL_MS
        : 0,
    );
  }

  if (hasStarted) {
    return 900;
  }

  if (hasResolved || hasImpact) {
    return Math.max(
      1_800,
      impactDelay +
        Math.max(0, damageCount - 1) * DAMAGE_STAGGER_MS +
        IMPACT_VISUAL_MS,
    );
  }

  if (types.has("characterSwitched")) {
    return 650;
  }

  return 0;
}
