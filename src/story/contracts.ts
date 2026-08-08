import { tournamentDefinitions } from "../tournaments/catalog";

export type StoryStepDefinition =
  | { id: string; kind: "content"; contentId: string }
  | { id: string; kind: "grant"; rewardIds: string[] }
  | { id: string; kind: "fight"; encounterId: string }
  | { id: string; kind: "tournament"; tournamentId: string }
  | { id: string; kind: "choice"; choiceId: string }
  | { id: string; kind: "store"; storeId: string }
  | { id: string; kind: "mission"; missionId: string }
  | { id: string; kind: "completion"; awardId: string };

export interface StoryLevelDefinition {
  id: string;
  title: string;
  steps: StoryStepDefinition[];
}

export interface StoryDefinition {
  id: string;
  title: string;
  completionAwardId: string;
  levels: StoryLevelDefinition[];
}

function requireUniqueIds(ids: string[], label: string): void {
  if (new Set(ids).size !== ids.length) {
    throw new Error(`${label} IDs must be unique`);
  }
}

export function validateStoryDefinition(
  sourceDefinition: StoryDefinition,
): StoryDefinition {
  const definition = structuredClone(sourceDefinition);
  if (!definition.id.trim() || !definition.title.trim()) {
    throw new Error("A Story requires an ID and title");
  }
  if (!definition.completionAwardId.trim()) {
    throw new Error("A Story requires one completion award");
  }
  if (definition.levels.length === 0) {
    throw new Error("A Story requires at least one Level");
  }
  requireUniqueIds(
    definition.levels.map((level) => level.id),
    "Story Level",
  );
  const steps = definition.levels.flatMap((level) => {
    if (!level.id.trim() || !level.title.trim() || level.steps.length === 0) {
      throw new Error("Every Story Level requires an ID, title, and step");
    }
    return level.steps;
  });
  requireUniqueIds(
    steps.map((step) => step.id),
    "Story step",
  );
  if (!steps.some((step) => step.kind === "fight")) {
    throw new Error("A Story requires at least one standard fight step");
  }
  const tournamentSteps = steps.filter(
    (step): step is Extract<StoryStepDefinition, { kind: "tournament" }> =>
      step.kind === "tournament",
  );
  if (tournamentSteps.length === 0) {
    throw new Error("A Story requires at least one preset Tournament step");
  }
  for (const step of tournamentSteps) {
    if (!tournamentDefinitions[step.tournamentId]) {
      throw new Error(
        `Story Tournament ${step.tournamentId} is not a registered preset`,
      );
    }
  }
  if (
    !steps.some(
      (step) =>
        step.kind === "completion" &&
        step.awardId === definition.completionAwardId,
    )
  ) {
    throw new Error(
      "A Story completion step must grant its declared completion award",
    );
  }
  return definition;
}

export const firstRunStoryDefinition = validateStoryDefinition({
  id: "story.first-run",
  title: "First Run",
  completionAwardId: "story-award.first-run",
  levels: [
    {
      id: "story.first-run.level-1",
      title: "Open the Drawer",
      steps: [
        {
          id: "story.first-run.step-opening-content",
          kind: "content",
          contentId: "story.first-run.00",
        },
        {
          id: "story.first-run.step-opening-grant",
          kind: "grant",
          rewardIds: ["character.viking"],
        },
        {
          id: "story.first-run.step-qualifier-one",
          kind: "fight",
          encounterId: "story.first-run.02",
        },
      ],
    },
    {
      id: "story.first-run.level-2",
      title: "Wrong Door Qualifier",
      steps: [
        {
          id: "story.first-run.step-store",
          kind: "store",
          storeId: "store.first-run",
        },
        {
          id: "story.first-run.step-missions",
          kind: "mission",
          missionId: "mission.print-it-personal",
        },
        {
          id: "story.first-run.step-qualifier-two",
          kind: "fight",
          encounterId: "story.first-run.05",
        },
        {
          id: "story.first-run.step-wrong-door-cup",
          kind: "tournament",
          tournamentId: "tournament.cheap-seats",
        },
        {
          id: "story.first-run.step-complete",
          kind: "completion",
          awardId: "story-award.first-run",
        },
      ],
    },
  ],
});
