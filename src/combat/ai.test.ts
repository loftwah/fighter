import { describe, expect, it } from "vitest";
import {
  chooseAiCommand,
  createBattle,
  requestAction,
  tickBattle,
} from "./engine";
import { combatContent } from "../content/initial-content";
import { createStandardBuild } from "./standard-build";

function standardDuel(playerId: string, enemyId: string) {
  return createBattle(
    {
      playerCharacterIds: [playerId],
      playerBuilds: [
        createStandardBuild(combatContent.characters[playerId]!, "player", 0),
      ],
      enemyCharacterIds: [enemyId],
      enemyBuilds: [
        createStandardBuild(combatContent.characters[enemyId]!, "enemy", 0),
      ],
      seed: 8_204,
      difficulty: "hard",
    },
    combatContent,
  ).state;
}

describe("combat AI", () => {
  it("banks Viking Power once, then saves enough Charge for an attack", () => {
    let state = standardDuel("character.humpty", "character.viking");
    state.enemy.bar = 18;

    const setup = chooseAiCommand(state, combatContent, "enemy");
    expect(setup).toEqual({
      kind: "action",
      actionId: "action.viking.shield-bash",
    });
    state = requestAction(
      state,
      "enemy",
      "action.viking.shield-bash",
      combatContent,
    ).state;

    state.enemy.bar = 39;
    expect(chooseAiCommand(state, combatContent, "enemy")).toBeNull();

    state.enemy.bar = 40;
    expect(chooseAiCommand(state, combatContent, "enemy")).toEqual({
      kind: "action",
      actionId: "action.viking.axe-first",
    });
  });

  it("uses the same legal command evaluator for the player side", () => {
    const state = standardDuel("character.tux", "character.humpty");
    state.player.bar = 32;

    expect(chooseAiCommand(state, combatContent, "player")).toEqual({
      kind: "action",
      actionId: "action.tux.ping",
    });
  });

  it("uses Grim's form once, then banks for whole-Lineup pressure", () => {
    let state = standardDuel("character.viking", "character.grim-reaper");
    state.enemy.bar = 40;
    expect(
      requestAction(
        state,
        "enemy",
        "action.grim-reaper.deaths-shadow",
        combatContent,
      ).events,
    ).toContainEqual(expect.objectContaining({ type: "commandRejected" }));

    state.enemy.bar = 18;

    expect(chooseAiCommand(state, combatContent)).toEqual({
      kind: "action",
      actionId: "action.grim-reaper.cold-touch",
    });
    state = requestAction(
      state,
      "enemy",
      "action.grim-reaper.cold-touch",
      combatContent,
    ).state;

    state.enemy.bar = 40;
    expect(chooseAiCommand(state, combatContent)).toEqual({
      kind: "action",
      actionId: "action.grim-reaper.deaths-shadow",
    });
    state = requestAction(
      state,
      "enemy",
      "action.grim-reaper.deaths-shadow",
      combatContent,
    ).state;
    state = tickBattle(state, 250, combatContent).state;
    state = tickBattle(state, 50, combatContent).state;

    state.enemy.bar = 69;
    expect(chooseAiCommand(state, combatContent)).toBeNull();

    state.enemy.bar = 70;
    expect(chooseAiCommand(state, combatContent)).toEqual({
      kind: "action",
      actionId: "action.grim-reaper.final-harvest",
    });
  });
});
