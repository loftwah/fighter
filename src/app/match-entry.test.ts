import { describe, expect, it } from "vitest";
import { validateBattleLaunchRequest } from "./match-entry";
import { combatContent } from "../content/initial-content";
import { createStandardBuild } from "../combat/standard-build";
import { createResolvedMatchConfiguration } from "./match-configuration";
import type { LineupConfirmation } from "./match-entry";

const lineup = {
  id: "lineup.confirmed.current",
  playerInstanceIds: ["player.instance.1"],
  playerStarterInstanceId: "player.instance.1",
  opponentInstanceIds: ["opponent.instance.1"],
  playerAccessoryId: null,
  opponentAccessoryId: null,
};

function matchFor(
  source: LineupConfirmation,
  mode: "quick" | "story" | "tournament" = "quick",
  presetId: string | null = null,
  matchId = mode === "tournament"
    ? "match.tournament.cheap-seats.round-1"
    : "match.confirmed.current",
) {
  const viking = combatContent.characters["character.viking"]!;
  const grim = combatContent.characters["character.grim-reaper"]!;
  const orderedPlayerIds = [
    source.playerStarterInstanceId,
    ...source.playerInstanceIds.filter(
      (instanceId) => instanceId !== source.playerStarterInstanceId,
    ),
  ];
  return createResolvedMatchConfiguration(
    {
      id: matchId,
      mode,
      presetId,
      difficulty: "normal",
      timeLimitMs: 90_000,
      seed: 1,
      player: {
        fighters: orderedPlayerIds.map((instanceId, index) => ({
          instanceId,
          characterId: viking.id,
          build: {
            ...createStandardBuild(viking, "player", index),
            instanceId,
          },
        })),
        accessoryId: source.playerAccessoryId,
        startingCharge: 0,
      },
      opponent: {
        fighters: source.opponentInstanceIds.map((instanceId, index) => ({
          instanceId,
          characterId: grim.id,
          build: { ...createStandardBuild(grim, "enemy", index), instanceId },
        })),
        accessoryId: source.opponentAccessoryId,
        startingCharge: 0,
      },
    },
    combatContent,
  );
}

describe("validated Battle launch boundary", () => {
  it.each([
    {
      kind: "story" as const,
      storyId: "story.first-run",
      encounterId: "story.first-run.02",
      lineup,
      match: matchFor(lineup, "story"),
      reportMode: "story",
    },
    {
      kind: "quick" as const,
      draftId: "quick.custom.current",
      lineup,
      match: matchFor(lineup),
      reportMode: "quick",
    },
    {
      kind: "tournament" as const,
      tournamentId: "tournament.cheap-seats",
      origin: "standalone" as const,
      nodeId: "round-1",
      lineup,
      match: matchFor(lineup, "tournament"),
      reportMode: "tournament",
    },
    {
      kind: "development" as const,
      scenarioId: "dev.viking-acceptance",
      bypass: "validated-dev-scenario" as const,
      reportMode: "dev",
    },
  ])("accepts a validated $kind entry", ({ reportMode, ...request }) => {
    expect(validateBattleLaunchRequest(request).reportMode).toBe(reportMode);
  });

  it("rejects a player-facing launch without Lineup confirmation", () => {
    expect(() =>
      validateBattleLaunchRequest({
        kind: "quick",
        draftId: "quick.custom.current",
        lineup: { ...lineup, id: "" },
        match: matchFor(lineup),
      }),
    ).toThrow("validated Lineup confirmation");
  });

  it("rejects a resolved match owned by another mode", () => {
    expect(() =>
      validateBattleLaunchRequest({
        kind: "story",
        storyId: "story.first-run",
        encounterId: "story.first-run.02",
        lineup,
        match: matchFor(lineup, "quick"),
      }),
    ).toThrow("cannot launch as story");
  });

  it("rejects a Story encounter owned by another Story", () => {
    expect(() =>
      validateBattleLaunchRequest({
        kind: "story",
        storyId: "story.first-run",
        encounterId: "story.somewhere-else.02",
        lineup,
        match: matchFor(lineup, "story"),
      }),
    ).toThrow("does not belong to the active Story");
  });

  it("rejects an unregistered Tournament", () => {
    expect(() =>
      validateBattleLaunchRequest({
        kind: "tournament",
        tournamentId: "tournament.missing",
        origin: "standalone",
        nodeId: "round-1",
        lineup,
        match: matchFor(lineup, "tournament"),
      }),
    ).toThrow("is not registered");
  });

  it("accepts an isolated variant whose reviewed match names its registered base", () => {
    expect(
      validateBattleLaunchRequest({
        kind: "tournament",
        tournamentId: "tournament.cheap-seats.variant.test",
        origin: "standalone",
        nodeId: "round-1",
        lineup,
        match: matchFor(
          lineup,
          "tournament",
          "tournament.cheap-seats",
          "match.tournament.cheap-seats.variant.test.round-1",
        ),
      }).reportMode,
    ).toBe("tournament");
  });

  it("rejects arbitrary variant identity despite a registered base preset", () => {
    expect(() =>
      validateBattleLaunchRequest({
        kind: "tournament",
        tournamentId: "tournament.arbitrary",
        origin: "standalone",
        nodeId: "round-1",
        lineup,
        match: matchFor(
          lineup,
          "tournament",
          "tournament.cheap-seats",
          "match.tournament.arbitrary.round-1",
        ),
      }),
    ).toThrow("is not registered");
  });

  it("rejects a reviewed match from another Tournament node", () => {
    expect(() =>
      validateBattleLaunchRequest({
        kind: "tournament",
        tournamentId: "tournament.cheap-seats",
        origin: "standalone",
        nodeId: "round-2",
        lineup,
        match: matchFor(lineup, "tournament"),
      }),
    ).toThrow("does not belong to the active Tournament node");
  });

  it("rejects a starter outside the confirmed player Lineup", () => {
    expect(() =>
      validateBattleLaunchRequest({
        kind: "quick",
        draftId: "quick.custom.current",
        lineup: {
          ...lineup,
          playerStarterInstanceId: "player.instance.missing",
        },
        match: matchFor(lineup),
      }),
    ).toThrow("starter must belong");
  });

  it("normalises the explicit player starter to Battle slot zero", () => {
    const reorderedLineup = {
      ...lineup,
      playerInstanceIds: [
        "player.instance.1",
        "player.instance.2",
        "player.instance.3",
      ],
      playerStarterInstanceId: "player.instance.3",
    };
    const validated = validateBattleLaunchRequest({
      kind: "quick",
      draftId: "quick.custom.current",
      lineup: reorderedLineup,
      match: matchFor(reorderedLineup),
    });

    expect(validated.request.kind).toBe("quick");
    if (validated.request.kind !== "quick") return;
    expect(validated.request.lineup.playerInstanceIds).toEqual([
      "player.instance.3",
      "player.instance.1",
      "player.instance.2",
    ]);
  });
});
