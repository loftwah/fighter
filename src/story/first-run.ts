import type { SaveData } from "../persistence/save";

export type FirstRunBattleNodeId = "story.first-run.02" | "story.first-run.05";

export interface FirstRunEncounter {
  nodeId: FirstRunBattleNodeId;
  index: "02" | "05";
  title: string;
  railLabel: string;
  playerCharacterIds: string[];
  enemyCharacterIds: string[];
  seed: number;
  nextNodeId: "story.first-run.03" | "story.first-run.06";
  victoryTitle: string;
  victoryCopy: string;
}

export const FIRST_RUN_ENDING_REWARD = 180;

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
    title: "Tax Due",
    railLabel: "FIRST RUN · TAX DUE",
    playerCharacterIds: [
      "character.mara-vex",
      "character.zipwire",
      "character.velvet-hex",
    ],
    enemyCharacterIds: [
      "character.knuckle-tax",
      "character.scrapjack",
      "character.gutter-grin",
    ],
    seed: 20_260_729,
    nextNodeId: "story.first-run.03",
    victoryTitle: "The invoice is cancelled.",
    victoryCopy: "The Backroom Counter is now open on this save.",
  },
  "story.first-run.05": {
    nodeId: "story.first-run.05",
    index: "05",
    title: "Qualifier Stamp",
    railLabel: "FIRST RUN · QUALIFIER STAMP",
    playerCharacterIds: ["character.mara-vex", "character.zipwire"],
    enemyCharacterIds: ["character.scrapjack", "character.gutter-grin"],
    seed: 20_260_805,
    nextNodeId: "story.first-run.06",
    victoryTitle: "The qualifier takes the ink.",
    victoryCopy: "The Cheap Seats Cup is unlocked on this save.",
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

export function claimFirstRunEnding(sourceSave: SaveData): {
  claimed: boolean;
  save: SaveData;
} {
  if (sourceSave.clearedNodeIds.includes("story.first-run.07")) {
    return { claimed: false, save: sourceSave };
  }
  const save = structuredClone(sourceSave);
  save.stamps += FIRST_RUN_ENDING_REWARD;
  save.clearedNodeIds.push("story.first-run.07");
  save.currentNodeId = "story.first-run.07";
  if (!save.revealedRivalIds.includes("character.knuckle-tax")) {
    save.revealedRivalIds.push("character.knuckle-tax");
  }
  return { claimed: true, save };
}
