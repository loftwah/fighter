import { describe, expect, it } from "vitest";
import {
  battleDecisionAnnouncement,
  battleDecisionGuidance,
  battlePresentationGuidance,
  opponentDecisionGuidance,
} from "./battle-guidance";

const baseInput = {
  battleReady: true,
  paused: false,
  presenting: false,
  outcomeActive: true,
  activeCharacterName: "Tux",
  bar: 20,
  pendingMoveName: null,
  stunned: false,
};

const moves = [
  { key: 1, name: "Ping", cost: 32, blocked: false },
  { key: 2, name: "Root Access", cost: 50, blocked: false },
  { key: 3, name: "Kernel Panic", cost: 82, blocked: false },
];

describe("battle guidance", () => {
  it.each([
    {
      name: "pre-fight",
      input: { battleReady: false },
      expected: {
        state: "standby",
        title: "GET READY",
        detail: "Charge starts after FIGHT",
      },
    },
    {
      name: "paused",
      input: { paused: true },
      expected: {
        state: "paused",
        title: "PAUSED",
        detail: "Resume when you are ready",
      },
    },
    {
      name: "presentation",
      input: { presenting: true, pendingMoveName: "Ping" },
      expected: {
        state: "watch",
        title: "WATCH THE MOVE",
        detail: "Controls return after the hit",
      },
    },
    {
      name: "pending Move",
      input: { pendingMoveName: "Root Access" },
      expected: {
        state: "charging",
        title: "MOVE CHARGING",
        detail: "Root Access is winding up",
      },
    },
    {
      name: "stunned",
      input: { stunned: true },
      expected: {
        state: "blocked",
        title: "STUNNED",
        detail: "Tux must recover",
      },
    },
    {
      name: "ended",
      input: { outcomeActive: false },
      expected: {
        state: "ended",
        title: "FIGHT OVER",
        detail: "Review the result",
      },
    },
  ])("explains the $name state", ({ input, expected }) => {
    expect(
      battleDecisionGuidance({
        ...baseInput,
        ...input,
        moves,
      }),
    ).toEqual(expected);
  });

  it("explains the next Charge threshold while no Move is ready", () => {
    expect(
      battleDecisionGuidance({
        ...baseInput,
        moves,
      }),
    ).toEqual({
      state: "waiting",
      title: "CHARGING",
      detail: "Ping ready in 12 Charge",
    });
  });

  it("gives one unmistakable instruction when Moves are ready", () => {
    expect(
      battleDecisionGuidance({
        ...baseInput,
        bar: 82,
        moves,
      }),
    ).toEqual({
      state: "ready",
      title: "YOUR MOVE",
      detail: "Press 1, 2, or 3 · 3 Moves ready",
    });
  });

  it("only names the keys whose Moves are currently ready", () => {
    expect(
      battleDecisionGuidance({
        ...baseInput,
        bar: 50,
        moves,
      }),
    ).toEqual({
      state: "ready",
      title: "YOUR MOVE",
      detail: "Press 1 or 2 · 2 Moves ready",
    });
  });

  it("replaces stale readiness announcements at presentation and fight end", () => {
    expect(
      battleDecisionAnnouncement({
        state: "watch",
        title: "WATCH THE MOVE",
        detail: "Controls return after the hit",
      }),
    ).toBe("WATCH THE MOVE. Controls return after the hit.");
    expect(
      battleDecisionAnnouncement({
        state: "ended",
        title: "FIGHT OVER",
        detail: "Review the result",
      }),
    ).toBe("FIGHT OVER. Review the result.");
    expect(
      battleDecisionAnnouncement({
        state: "waiting",
        title: "CHARGING",
        detail: "Ping ready in 12 Charge",
      }),
    ).toBeNull();
  });

  it("gives the opponent a matching ready marker", () => {
    expect(
      opponentDecisionGuidance({
        ...baseInput,
        activeCharacterName: "Grim Reaper",
        bar: 50,
        moves,
      }),
    ).toEqual({
      state: "ready",
      title: "OPPONENT READY",
      detail: "2 Moves available",
    });
  });

  it("shows the opponent's next threshold before a Move is ready", () => {
    expect(
      opponentDecisionGuidance({
        ...baseInput,
        activeCharacterName: "Grim Reaper",
        moves,
      }),
    ).toEqual({
      state: "waiting",
      title: "OPPONENT CHARGING",
      detail: "Ping in 12 Charge",
    });
  });

  it.each([
    {
      name: "pre-fight",
      input: { battleReady: false },
      expected: {
        state: "standby",
        title: "OPPONENT",
        detail: "Waiting for FIGHT",
      },
    },
    {
      name: "paused",
      input: { paused: true },
      expected: {
        state: "paused",
        title: "OPPONENT PAUSED",
        detail: "Simulation stopped",
      },
    },
    {
      name: "presentation",
      input: { presenting: true, pendingMoveName: "Ping" },
      expected: {
        state: "watch",
        title: "WATCH OPPONENT",
        detail: "Move resolving",
      },
    },
    {
      name: "pending Move",
      input: { pendingMoveName: "Root Access" },
      expected: {
        state: "charging",
        title: "OPPONENT MOVE",
        detail: "Root Access winding up",
      },
    },
    {
      name: "stunned",
      input: { stunned: true },
      expected: {
        state: "blocked",
        title: "OPPONENT STUNNED",
        detail: "Grim Reaper must recover",
      },
    },
    {
      name: "ended",
      input: { outcomeActive: false },
      expected: {
        state: "ended",
        title: "FIGHT OVER",
        detail: "Result decided",
      },
    },
  ])("explains the opponent $name state", ({ input, expected }) => {
    expect(
      opponentDecisionGuidance({
        ...baseInput,
        ...input,
        activeCharacterName: "Grim Reaper",
        moves,
      }),
    ).toEqual(expected);
  });

  it("explains when every opponent Move is blocked", () => {
    expect(
      opponentDecisionGuidance({
        ...baseInput,
        activeCharacterName: "Grim Reaper",
        moves: moves.map((move) => ({ ...move, blocked: true })),
      }),
    ).toEqual({
      state: "blocked",
      title: "OPPONENT BLOCKED",
      detail: "Effects prevent every Move",
    });
  });

  it("explains when every Move is blocked", () => {
    expect(
      battleDecisionGuidance({
        ...baseInput,
        moves: moves.map((move) => ({ ...move, blocked: true })),
      }),
    ).toEqual({
      state: "blocked",
      title: "MOVES BLOCKED",
      detail: "Wait for the effect to clear",
    });
  });

  it("identifies the acting side even in a mirrored matchup", () => {
    expect(
      battlePresentationGuidance({
        side: "enemy",
        characterName: "Tux",
        moveName: "Ping",
        kind: "move",
      }),
    ).toEqual({
      side: "enemy",
      title: "OPPONENT MOVE",
      detail: "Tux · Ping",
      instruction: "WATCH · controls return after the hit",
    });
  });

  it.each([
    {
      side: "player" as const,
      kind: "accessory" as const,
      title: "YOUR ACCESSORY",
      detail: "Press Pass",
    },
    {
      side: "neutral" as const,
      kind: "move" as const,
      title: "MOVE IN PROGRESS",
      detail: "Tux · Ping",
    },
  ])(
    "labels $side $kind presentations without relying on art",
    ({ side, kind, title, detail }) => {
      expect(
        battlePresentationGuidance({
          side,
          characterName: "Tux",
          moveName: kind === "move" ? "Ping" : "Press Pass",
          kind,
        }),
      ).toEqual({
        side,
        title,
        detail,
        instruction: "WATCH · controls return after the hit",
      });
    },
  );
});
