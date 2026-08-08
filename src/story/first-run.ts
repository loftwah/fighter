import { missions } from "../content/initial-content";
import type { SaveData } from "../persistence/save";
import {
  tournamentDefinitions,
  type TournamentMatchSettings,
} from "../tournaments/catalog";

export type FirstRunBattleNodeId = "story.first-run.02" | "story.first-run.05";

export interface FirstRunEncounter {
  nodeId: FirstRunBattleNodeId;
  index: "02" | "05";
  title: string;
  railLabel: string;
  playerCharacterIds: string[];
  enemyCharacterIds: string[];
  seed: number;
  matchSettings: TournamentMatchSettings;
  nextNodeId: "story.first-run.03" | "story.first-run.06";
  victoryTitle: string;
  victoryCopy: string;
}

export const FIRST_RUN_ENDING_REWARD = 180;
export const FIRST_RUN_REQUIRED_MISSION_IDS = [
  "mission.fresh-ink",
  "mission.invoice-denied",
  "mission.print-it-personal",
] as const;
export const FIRST_RUN_REQUIRED_TROPHY_IDS = [
  tournamentDefinitions["tournament.cheap-seats"]!.trophyId,
];

export interface FirstRunCompletionStatus {
  ready: boolean;
  incompleteMissionIds: string[];
  missingTrophyIds: string[];
}

const firstRunNodeIds = [
  "story.first-run.00",
  "story.first-run.01",
  "story.first-run.02",
  "story.first-run.03",
  "story.first-run.04",
  "story.first-run.05",
  "story.first-run.06",
  "story.first-run.07",
] as const;

const encounters: Record<FirstRunBattleNodeId, FirstRunEncounter> = {
  "story.first-run.02": {
    nodeId: "story.first-run.02",
    index: "02",
    title: "History Disagrees",
    railLabel: "FIRST RUN · HISTORY DISAGREES",
    playerCharacterIds: [
      "character.viking",
      "character.tux",
      "character.moses",
    ],
    enemyCharacterIds: [
      "character.ned-kelly",
      "character.grim-reaper",
      "character.humpty",
    ],
    seed: 20_260_729,
    matchSettings: {
      timeLimitMs: 120_000,
      playerStartingCharge: 0,
      opponentStartingCharge: 0,
      playerAccessoryId: "accessory.press-pass",
      opponentAccessoryId: "accessory.dead-air",
    },
    nextNodeId: "story.first-run.03",
    victoryTitle: "History remains unresolved.",
    victoryCopy: "Lost Property is now open on this save.",
  },
  "story.first-run.05": {
    nodeId: "story.first-run.05",
    index: "05",
    title: "Open Source Backup",
    railLabel: "FIRST RUN · OPEN SOURCE BACKUP",
    playerCharacterIds: ["character.tux", "character.humpty"],
    enemyCharacterIds: ["character.moses", "character.grim-reaper"],
    seed: 20_260_805,
    matchSettings: {
      timeLimitMs: 120_000,
      playerStartingCharge: 0,
      opponentStartingCharge: 0,
      playerAccessoryId: "accessory.press-pass",
      opponentAccessoryId: "accessory.dead-air",
    },
    nextNodeId: "story.first-run.06",
    victoryTitle: "The impossible team works.",
    victoryCopy: "The Wrong Door Cup is unlocked on this save.",
  },
};

export function firstRunEncounter(nodeId: string): FirstRunEncounter {
  return encounters[
    nodeId === "story.first-run.05"
      ? "story.first-run.05"
      : "story.first-run.02"
  ];
}

export function reconcileFirstRunClears(
  currentNodeId: string,
  clearedNodeIds: string[],
): string[] {
  const currentIndex = firstRunNodeIds.indexOf(
    currentNodeId as (typeof firstRunNodeIds)[number],
  );
  if (currentIndex <= 0) {
    return clearedNodeIds;
  }
  return [
    ...new Set([...clearedNodeIds, ...firstRunNodeIds.slice(0, currentIndex)]),
  ];
}

export function isFirstRunNodeReached(
  currentNodeId: string,
  clearedNodeIds: string[],
  targetNodeId: string,
): boolean {
  if (clearedNodeIds.includes(targetNodeId)) {
    return true;
  }
  const currentIndex = firstRunNodeIds.indexOf(
    currentNodeId as (typeof firstRunNodeIds)[number],
  );
  const targetIndex = firstRunNodeIds.indexOf(
    targetNodeId as (typeof firstRunNodeIds)[number],
  );
  return currentIndex >= 0 && targetIndex >= 0 && currentIndex >= targetIndex;
}

export function firstRunCompletionStatus(
  save: SaveData,
): FirstRunCompletionStatus {
  const incompleteMissionIds = FIRST_RUN_REQUIRED_MISSION_IDS.filter(
    (missionId) => {
      if (save.claimedMissionIds.includes(missionId)) {
        return false;
      }
      const mission = missions.find((candidate) => candidate.id === missionId);
      return (
        !mission || (save.missionProgress[missionId] ?? 0) < mission.target
      );
    },
  );
  const missingTrophyIds = FIRST_RUN_REQUIRED_TROPHY_IDS.filter(
    (trophyId) => !save.storyTournamentTrophyIds.includes(trophyId),
  );
  return {
    ready: incompleteMissionIds.length === 0 && missingTrophyIds.length === 0,
    incompleteMissionIds,
    missingTrophyIds,
  };
}

export function claimFirstRunEnding(sourceSave: SaveData): {
  claimed: boolean;
  save: SaveData;
  blockedBy: FirstRunCompletionStatus | null;
} {
  if (sourceSave.clearedNodeIds.includes("story.first-run.07")) {
    return { claimed: false, save: sourceSave, blockedBy: null };
  }
  if (sourceSave.currentNodeId !== "story.first-run.07") {
    return { claimed: false, save: sourceSave, blockedBy: null };
  }
  const completion = firstRunCompletionStatus(sourceSave);
  if (!completion.ready) {
    return { claimed: false, save: sourceSave, blockedBy: completion };
  }
  const save = structuredClone(sourceSave);
  save.stamps += FIRST_RUN_ENDING_REWARD;
  save.clearedNodeIds.push("story.first-run.07");
  save.currentNodeId = "story.first-run.07";
  if (!save.revealedRivalIds.includes("character.ned-kelly")) {
    save.revealedRivalIds.push("character.ned-kelly");
  }
  return { claimed: true, save, blockedBy: null };
}
