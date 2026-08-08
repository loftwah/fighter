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

export function battleEventImpactDelay(
  events: readonly BattleEvent[],
  eventIndex: number,
): number {
  const event = events[eventIndex];
  if (!event || event.periodic) return 0;
  const impactDelay = battlePresentationImpactDelay(events);
  const followsHitSequence =
    event.type === "reactionTriggered" || event.type === "characterDefeated";
  if (
    event.type !== "damageApplied" &&
    event.type !== "characterDodged" &&
    !followsHitSequence
  ) {
    return impactDelay;
  }
  const precedingHitCount = events
    .slice(0, eventIndex)
    .filter(
      (candidate) =>
        !candidate.periodic &&
        (candidate.type === "damageApplied" ||
          candidate.type === "characterDodged"),
    ).length;
  return impactDelay + precedingHitCount * DAMAGE_STAGGER_MS;
}

function finalHitImpactDelay(events: readonly BattleEvent[]): number {
  let finalHitIndex = -1;
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (
      event &&
      !event.periodic &&
      (event.type === "damageApplied" || event.type === "characterDodged")
    ) {
      finalHitIndex = index;
      break;
    }
  }
  return finalHitIndex >= 0
    ? battleEventImpactDelay(events, finalHitIndex)
    : battlePresentationImpactDelay(events);
}

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
  const finalHitDelay = finalHitImpactDelay(presentationEvents);
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
    return Math.max(2_600, finalHitDelay + DAMAGE_STAGGER_MS + 1_200);
  }

  if (hasStarted && hasResolved) {
    return Math.max(2_100, hasImpact ? finalHitDelay + IMPACT_VISUAL_MS : 0);
  }

  if (hasStarted) {
    return 900;
  }

  if (hasResolved || hasImpact) {
    return Math.max(1_800, finalHitDelay + IMPACT_VISUAL_MS);
  }

  if (types.has("characterSwitched")) {
    return 650;
  }

  return 0;
}

export function battlePresentationImpactDelay(
  events: readonly BattleEvent[],
): number {
  const types = new Set(
    events.filter((event) => !event.periodic).map((event) => event.type),
  );
  return types.has("actionStarted") && types.has("actionCharged")
    ? INSTANT_MOVE_IMPACT_DELAY_MS
    : types.has("actionCharged")
      ? CHARGED_MOVE_IMPACT_DELAY_MS
      : REACTION_IMPACT_DELAY_MS;
}

export function battlePresentationStateCommitDelay(
  events: BattleEvent[],
): number {
  const presentationEvents = events.filter((event) => !event.periodic);
  const types = new Set(presentationEvents.map((event) => event.type));
  const damageCount = presentationEvents.filter(
    (event) => event.type === "damageApplied",
  ).length;
  const changesVisibleState =
    damageCount > 0 ||
    types.has("healingApplied") ||
    types.has("characterDefeated");
  if (!changesVisibleState) {
    return 0;
  }
  if (types.has("accessoryActivated")) {
    return 0;
  }

  return finalHitImpactDelay(presentationEvents);
}
