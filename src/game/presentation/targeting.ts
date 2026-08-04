import type { BattleEvent, BattleState, Side } from "../../combat/types";

export function presentationActionEvent(
  events: BattleEvent[],
): BattleEvent | null {
  return (
    events.find(
      (event) => event.type === "actionCharged" && Boolean(event.actionId),
    ) ?? null
  );
}

export function presentationActionSide(events: BattleEvent[]): Side | null {
  const actionEvent = events.find(
    (event) => event.type === "actionStarted" || event.type === "actionCharged",
  );
  return actionEvent?.side ?? null;
}

/**
 * Presentation panels show active combatants only. Returning null for a bench
 * target is preferable to making the visible active fighter recoil for damage
 * that was actually applied elsewhere in the Lineup.
 */
export function activeSideForPresentationTarget(
  state: BattleState,
  instanceId: string | undefined,
): Side | null {
  if (!instanceId) {
    return null;
  }
  for (const side of ["player", "enemy"] as const) {
    const team = state[side];
    if (team.squad[team.activeIndex]?.instanceId === instanceId) {
      return side;
    }
  }
  return null;
}
