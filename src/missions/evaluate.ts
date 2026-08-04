export type MissionEvent =
  | { type: "collectionChanged"; distinctCharacterCount: number }
  | { type: "battleEnded"; won: boolean; opponentCharacterIds: string[] }
  | { type: "storyBattleEnded"; won: boolean };

export function evaluateMissionProgress(
  missionId: string,
  current: number,
  event: MissionEvent,
): number {
  switch (missionId) {
    case "mission.fresh-ink":
      return event.type === "collectionChanged"
        ? Math.max(current, event.distinctCharacterCount)
        : current;
    case "mission.invoice-denied":
      return event.type === "battleEnded" &&
        event.won &&
        event.opponentCharacterIds.includes("character.ned-kelly")
        ? Math.max(current, 1)
        : current;
    case "mission.print-it-personal":
      return event.type === "storyBattleEnded" && event.won
        ? Math.min(2, current + 1)
        : current;
    default:
      return current;
  }
}
