import { describe, expect, it } from "vitest";
import { createBattle } from "../combat/engine";
import { createBattleReport } from "../combat/report";
import { combatContent } from "../content/initial-content";
import {
  explainBattleResult,
  renderBattleResultExplanation,
} from "./battle-result-explanation";

describe("battle result explanation", () => {
  it("names the decisive Move, Type edge, damage evidence, and luck", () => {
    const created = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.grim-reaper"],
        seed: 3_844_240_869,
        difficulty: "normal",
      },
      combatContent,
    );
    const report = createBattleReport(created.state, created.events, {
      mode: "quick",
      encounterId: "v2.viking-acceptance",
    });
    const playerId = report.participants.find(
      (participant) => participant.side === "player",
    )!.instanceId;
    const enemyId = report.participants.find(
      (participant) => participant.side === "enemy",
    )!.instanceId;
    report.outcome = "playerWon";
    report.decisions.push({
      sequence: 1,
      elapsedMs: 2_600,
      side: "player",
      sourceInstanceId: playerId,
      command: { kind: "action", actionId: "action.viking.axe-first" },
    });
    report.events.push(
      {
        id: 2,
        type: "damageApplied",
        side: "player",
        sourceId: playerId,
        targetId: enemyId,
        actionId: "action.viking.axe-first",
        amount: 31,
      },
      {
        id: 3,
        type: "criticalHit",
        side: "player",
        sourceId: playerId,
        targetId: enemyId,
        actionId: "action.viking.berserker-oath",
      },
      {
        id: 4,
        type: "damageApplied",
        side: "player",
        sourceId: playerId,
        targetId: enemyId,
        actionId: "action.viking.berserker-oath",
        amount: 64,
      },
      { id: 5, type: "characterDefeated", side: "enemy", targetId: enemyId },
      { id: 6, type: "characterDefeated", side: "player", targetId: playerId },
      { id: 7, type: "battleEnded", side: "player" },
    );

    const explanation = explainBattleResult(report, combatContent);
    expect(explanation.heading).toBe("How you won");
    expect(explanation.decisiveMoment).toContain("Berserker Oath");
    expect(explanation.evidence.join(" ")).toContain("Brawler");
    expect(explanation.evidence.join(" ")).toContain("1 critical hit");
    expect(renderBattleResultExplanation(report, combatContent)).toContain(
      "You used 1 Move and switched 0 times.",
    );
  });

  it("does not invent a luck explanation when no random event occurred", () => {
    const created = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.grim-reaper"],
        seed: 1,
        difficulty: "normal",
      },
      combatContent,
    );
    const report = createBattleReport(created.state, created.events, {
      mode: "quick",
      encounterId: "explanation.no-luck",
    });
    report.outcome = "enemyWon";

    expect(explainBattleResult(report, combatContent).evidence).toContain(
      "No critical hits or dodges swung the fight.",
    );
  });

  it("does not call earlier damage the final hit when time decides the fight", () => {
    const created = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.grim-reaper"],
        seed: 2,
        difficulty: "normal",
      },
      combatContent,
    );
    const report = createBattleReport(created.state, created.events, {
      mode: "quick",
      encounterId: "explanation.timeout",
    });
    const playerId = report.participants.find(
      (participant) => participant.side === "player",
    )!.instanceId;
    const enemyId = report.participants.find(
      (participant) => participant.side === "enemy",
    )!.instanceId;
    report.outcome = "playerWon";
    report.elapsedMs = report.initialState.timeLimitMs;
    report.events.push(
      {
        id: 2,
        type: "damageApplied",
        side: "player",
        sourceId: playerId,
        targetId: enemyId,
        actionId: "action.viking.axe-first",
        amount: 10,
      },
      {
        id: 3,
        type: "battleEnded",
        side: "player",
        message: "playerWon",
      },
    );

    expect(explainBattleResult(report, combatContent).decisiveMoment).toBe(
      "The clock ran out. Remaining Health decided the winner.",
    );
  });

  it("uses neutral copy when simultaneous defeats have no proven finishing hit", () => {
    const created = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.grim-reaper"],
        seed: 3,
        difficulty: "normal",
      },
      combatContent,
    );
    const report = createBattleReport(created.state, created.events, {
      mode: "quick",
      encounterId: "explanation.simultaneous-defeat",
    });
    const playerId = report.participants.find(
      (participant) => participant.side === "player",
    )!.instanceId;
    const enemyId = report.participants.find(
      (participant) => participant.side === "enemy",
    )!.instanceId;
    report.outcome = "playerWon";
    report.events.push(
      { id: 2, type: "characterDefeated", side: "enemy", targetId: enemyId },
      { id: 3, type: "characterDefeated", side: "player", targetId: playerId },
      { id: 4, type: "battleEnded", side: "player" },
    );

    expect(explainBattleResult(report, combatContent).decisiveMoment).toBe(
      "No single blow decided the ending.",
    );
  });
});
