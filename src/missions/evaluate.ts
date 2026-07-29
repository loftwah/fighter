export type MissionEvent =
  | { type: "collectionChanged"; distinctCharacterCount: number }
  | { type: "battleEnded"; won: boolean; opponentCharacterIds: string[] }
  | {
      type: "vengeanceResolved";
      opponentCharacterId: string;
      previouslyLost: boolean;
      won: boolean;
    };

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
        event.opponentCharacterIds.includes("character.knuckle-tax")
        ? Math.max(current, 1)
        : current;
    case "mission.print-it-personal":
      return event.type === "vengeanceResolved" &&
        event.won &&
        event.previouslyLost
        ? Math.max(current, 1)
        : current;
    default:
      return current;
  }
}
