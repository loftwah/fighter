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

export function battlePresentationDuration(events: BattleEvent[]): number {
  const types = new Set(events.map((event) => event.type));

  if (types.has("battleEnded") || types.has("characterDefeated")) {
    return 1_000;
  }

  if (types.has("actionStarted") && types.has("actionCharged")) {
    return 900;
  }

  if (types.has("actionStarted")) {
    return 620;
  }

  if (
    types.has("actionCharged") ||
    types.has("damageApplied") ||
    types.has("healingApplied") ||
    types.has("characterDodged") ||
    types.has("criticalHit") ||
    types.has("actionInterrupted") ||
    types.has("interruptionResisted") ||
    types.has("statusApplied")
  ) {
    return 720;
  }

  if (types.has("characterSwitched")) {
    return 340;
  }

  return 0;
}
