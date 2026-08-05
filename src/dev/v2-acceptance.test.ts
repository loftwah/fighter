import { describe, expect, it } from "vitest";
import { replayBattleReport } from "../combat/replay";
import { combatContent, quickFightDefaults } from "../content/initial-content";
import { runV2VikingAcceptanceFight } from "./v2-acceptance";

describe("fixed-seed V2 Viking acceptance fight", () => {
  it("is a forgiving, replayable Normal Quick Fight that exercises Viking's loop", () => {
    const result = runV2VikingAcceptanceFight();

    expect(result.report.seed).toBe(quickFightDefaults.seed);
    expect(result.report.encounterId).toBe("v2.viking-acceptance");
    expect({
      outcome: result.outcome,
      firstPlayerDecisionMs: result.firstPlayerDecisionMs,
      simulationDurationMs: result.simulationDurationMs,
      estimatedPlayableDurationMs: result.estimatedPlayableDurationMs,
      playerActionIds: result.playerActionIds,
    }).toEqual({
      outcome: "playerWon",
      firstPlayerDecisionMs: 2_000,
      simulationDurationMs: 31_400,
      estimatedPlayableDurationMs: 57_870,
      playerActionIds: [
        "action.viking.shield-bash",
        "action.viking.axe-first",
        "action.viking.shield-bash",
        "action.viking.berserker-oath",
        "action.viking.axe-first",
        "action.viking.shield-bash",
        "action.viking.axe-first",
      ],
    });
    expect(result.playerHealthRatio).toBeCloseTo(0.4933, 4);

    const replay = replayBattleReport(result.report, combatContent);
    expect(replay.state.outcome).toBe(result.outcome);
    expect(replay.events).toEqual(result.report.events);
  });

  it("still wins on Normal when each player command has a human reaction delay", () => {
    const result = runV2VikingAcceptanceFight({
      playerDecisionDelayMs: 1_500,
    });

    expect(result.outcome).toBe("playerWon");
    expect(result.firstPlayerDecisionMs).toBe(3_500);
    expect(result.playerActionIds).toEqual([
      "action.viking.shield-bash",
      "action.viking.axe-first",
      "action.viking.shield-bash",
      "action.viking.berserker-oath",
      "action.viking.axe-first",
      "action.viking.shield-bash",
      "action.viking.axe-first",
    ]);
    expect(result.playerHealthRatio).toBeGreaterThan(0.2);
  });
});
