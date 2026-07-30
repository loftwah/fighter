import { describe, expect, it } from "vitest";
import {
  createBattle,
  forfeitBattle,
  requestAction,
  requestSwitch,
  tickBattle,
} from "./engine";
import {
  appendBattleTick,
  appendBattleTransition,
  createBattleReport,
  recordBattleDebugAction,
  recordBattleDecision,
} from "./report";
import { replayBattleReport } from "./replay";
import { combatContent } from "../content/initial-content";

describe("battle replay", () => {
  it("reproduces target-locked commands and deterministic simulation", () => {
    const created = createBattle(
      {
        playerCharacterIds: ["character.tux", "character.humpty"],
        enemyCharacterIds: ["character.viking"],
        enemyStartingBar: 100,
        seed: 8_801,
        difficulty: "normal",
        timeLimitMs: 10_000,
      },
      combatContent,
    );
    let state = created.state;
    let report = createBattleReport(state, created.events, {
      mode: "quick",
      encounterId: "replay.target-lock",
    });

    const enemyCommand = {
      kind: "action" as const,
      actionId: "action.viking.shield-bash",
    };
    report = recordBattleDecision(report, state, "enemy", enemyCommand);
    let transition = requestAction(
      state,
      "enemy",
      enemyCommand.actionId,
      combatContent,
    );
    state = transition.state;
    report = appendBattleTransition(report, transition);

    const playerCommand = { kind: "switch" as const, targetIndex: 1 };
    report = recordBattleDecision(report, state, "player", playerCommand);
    transition = requestSwitch(state, "player", playerCommand.targetIndex);
    state = transition.state;
    report = appendBattleTransition(report, transition);

    const frameDeltas = Array.from({ length: 84 }, (_, index) =>
      index % 2 === 0 ? 16 : 8,
    );
    for (const deltaMs of frameDeltas) {
      transition = tickBattle(state, deltaMs, combatContent);
      state = transition.state;
      report = appendBattleTick(report, deltaMs, transition);
    }

    const replayed = replayBattleReport(report, combatContent);

    expect(replayed.state).toEqual(state);
    expect(replayed.events).toEqual(report.events);
  });

  it("rejects reports containing direct development state edits", () => {
    const created = createBattle(
      {
        playerCharacterIds: ["character.tux"],
        enemyCharacterIds: ["character.viking"],
        seed: 8_802,
        difficulty: "normal",
      },
      combatContent,
    );
    const report = createBattleReport(created.state, created.events, {
      mode: "dev",
      encounterId: "replay.debug",
    });
    report.debugActions.push({
      elapsedMs: 0,
      action: "addCharge",
      side: "player",
      amount: 25,
    });

    expect(() => replayBattleReport(report, combatContent)).toThrow(
      "not replayable",
    );
  });

  it("replays an explicitly recorded forfeit", () => {
    const created = createBattle(
      {
        playerCharacterIds: ["character.tux"],
        enemyCharacterIds: ["character.viking"],
        seed: 8_803,
        difficulty: "normal",
      },
      combatContent,
    );
    let report = createBattleReport(created.state, created.events, {
      mode: "tournament",
      encounterId: "replay.forfeit",
    });
    report = recordBattleDecision(report, created.state, "player", {
      kind: "forfeit",
    });
    const transition = forfeitBattle(created.state, "player");
    report = appendBattleTransition(report, transition);

    const replayed = replayBattleReport(report, combatContent);

    expect(replayed.state).toEqual(transition.state);
    expect(replayed.events).toEqual(report.events);
  });

  it("ignores pause metadata that does not edit simulation state", () => {
    const created = createBattle(
      {
        playerCharacterIds: ["character.tux"],
        enemyCharacterIds: ["character.viking"],
        seed: 8_804,
        difficulty: "normal",
      },
      combatContent,
    );
    let report = createBattleReport(created.state, created.events, {
      mode: "quick",
      encounterId: "replay.pause",
    });
    report = recordBattleDebugAction(report, created.state, {
      action: "pause",
    });
    report = recordBattleDebugAction(report, created.state, {
      action: "resume",
    });
    const transition = tickBattle(created.state, 16, combatContent);
    report = appendBattleTick(report, 16, transition);

    const replayed = replayBattleReport(report, combatContent);

    expect(replayed.state).toEqual(transition.state);
    expect(replayed.events).toEqual(report.events);
  });
});
