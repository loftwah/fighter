import { describe, expect, it } from "vitest";
import { combatContent } from "../content/initial-content";
import {
  chooseAiCommand,
  createBattle,
  forfeitBattle,
  requestAccessory,
  requestAction,
  requestPickup,
  requestSwitch,
  tickBattle,
} from "./engine";
import { createStandardBuild } from "./standard-build";
import type { BattleCommand, BattleEvent, BattleState, Side } from "./types";

const characterIds = Object.keys(combatContent.characters);

function applyCommand(
  state: BattleState,
  side: Side,
  command: BattleCommand,
): { state: BattleState; events: BattleEvent[] } {
  switch (command.kind) {
    case "action":
      return requestAction(state, side, command.actionId, combatContent);
    case "switch":
      return requestSwitch(state, side, command.targetIndex);
    case "accessory":
      return requestAccessory(state, side, combatContent);
    case "pickup":
      return requestPickup(state, side, command.pickupId);
    case "forfeit":
      return forfeitBattle(state, side);
  }
}

describe("launch roster Standard matchups", () => {
  it("keeps every ordered one-on-one matchup playable and deterministic", () => {
    const failures: string[] = [];

    for (const [playerIndex, playerId] of characterIds.entries()) {
      for (const [enemyIndex, enemyId] of characterIds.entries()) {
        const playerDefinition = combatContent.characters[playerId];
        const enemyDefinition = combatContent.characters[enemyId];
        if (!playerDefinition || !enemyDefinition) {
          throw new Error("Matchup references an unknown Character");
        }
        const createState = () =>
          createBattle(
            {
              playerCharacterIds: [playerId],
              playerBuilds: [
                createStandardBuild(playerDefinition, "player", 0),
              ],
              enemyCharacterIds: [enemyId],
              enemyBuilds: [createStandardBuild(enemyDefinition, "enemy", 0)],
              seed: 10_000 + playerIndex * 100 + enemyIndex,
              difficulty: "hard",
            },
            combatContent,
          ).state;

        const run = () => {
          let state = createState();
          const actionCounts: Record<Side, number> = { player: 0, enemy: 0 };
          let rejected = false;

          for (
            let elapsed = 0;
            elapsed < 90_000 && state.outcome === "active";
            elapsed += 250
          ) {
            for (const side of ["player", "enemy"] as const) {
              const command = chooseAiCommand(state, combatContent, side);
              if (!command) {
                continue;
              }
              const transition = applyCommand(state, side, command);
              state = transition.state;
              actionCounts[side] += transition.events.filter(
                (event) => event.type === "actionStarted",
              ).length;
              rejected ||= transition.events.some(
                (event) => event.type === "commandRejected",
              );
            }
            state = tickBattle(state, 250, combatContent).state;
          }
          return { state, actionCounts, rejected };
        };

        const first = run();
        const second = run();
        const label = `${playerId} vs ${enemyId}`;
        if (
          first.state.outcome === "active" ||
          first.actionCounts.player === 0 ||
          first.actionCounts.enemy === 0 ||
          first.rejected ||
          second.state.outcome !== first.state.outcome ||
          second.state.player.squad[0]!.currentHealth !==
            first.state.player.squad[0]!.currentHealth ||
          second.state.enemy.squad[0]!.currentHealth !==
            first.state.enemy.squad[0]!.currentHealth
        ) {
          failures.push(label);
        }
      }
    }

    expect(failures).toEqual([]);
  });
});
