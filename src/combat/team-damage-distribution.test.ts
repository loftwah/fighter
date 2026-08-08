import { describe, expect, it } from "vitest";
import { combatContent } from "../content/initial-content";
import {
  createBattle,
  predictedTeamDamagePool,
  requestAction,
  tickBattle,
} from "./engine";
import { createStandardBuild } from "./standard-build";

function sampleDistribution(targetCount: 1 | 2 | 3, seed: number) {
  const tux = combatContent.characters["character.tux"]!;
  const viking = combatContent.characters["character.viking"]!;
  let state = createBattle(
    {
      playerCharacterIds: [tux.id],
      playerBuilds: [createStandardBuild(tux, "player", 0)],
      enemyCharacterIds: Array.from({ length: targetCount }, () => viking.id),
      enemyBuilds: Array.from({ length: targetCount }, (_, index) =>
        createStandardBuild(viking, "enemy", index),
      ),
      playerStartingBar: 100,
      seed,
      difficulty: "normal",
    },
    combatContent,
  ).state;
  state.player.squad[0]!.stats.fortune = 0;
  for (const target of state.enemy.squad) target.stats.evasion = 0;
  let transition = requestAction(
    state,
    "player",
    "action.tux.kernel-panic",
    combatContent,
  );
  const events = [...transition.events];
  state = transition.state;
  while (state.pendingActions.player) {
    transition = tickBattle(state, 250, combatContent);
    state = transition.state;
    events.push(...transition.events);
  }
  const amounts = state.enemy.squad.map((target) =>
    events
      .filter(
        (event) =>
          event.type === "damageApplied" &&
          event.actionId === "action.tux.kernel-panic" &&
          event.targetId === target.instanceId,
      )
      .map((event) => event.amount ?? 0),
  );
  return amounts;
}

describe("all-enemy damage distribution", () => {
  it("previews the same pre-target pool for one, two or three mixed targets", () => {
    const tux = combatContent.characters["character.tux"]!;
    const targetIds = [
      "character.viking",
      "character.humpty",
      "character.moses",
    ];
    const pools = ([1, 2, 3] as const).map((targetCount) => {
      const selectedTargets = targetIds.slice(0, targetCount);
      const state = createBattle(
        {
          playerCharacterIds: [tux.id],
          playerBuilds: [createStandardBuild(tux, "player", 0)],
          enemyCharacterIds: selectedTargets,
          enemyBuilds: selectedTargets.map((characterId, index) =>
            createStandardBuild(
              combatContent.characters[characterId]!,
              "enemy",
              index,
            ),
          ),
          seed: 7,
          difficulty: "normal",
        },
        combatContent,
      ).state;
      return predictedTeamDamagePool(
        state,
        "player",
        "action.tux.kernel-panic",
        combatContent,
      );
    });

    expect(pools).toEqual([pools[0], pools[0], pools[0]]);
  });

  it.each([1, 2, 3] as const)(
    "gives %i living target(s) one independently resolved share per hit",
    (targetCount) => {
      const samples = Array.from({ length: 60 }, (_, index) =>
        sampleDistribution(targetCount, 8_000 + index),
      );
      expect(samples.every((sample) => sample.length === targetCount)).toBe(
        true,
      );
      expect(
        samples.every((sample) => sample.every((hits) => hits.length === 3)),
      ).toBe(true);

      const targetMeans = Array.from(
        { length: targetCount },
        (_, target) =>
          samples.reduce(
            (total, sample) =>
              total + sample[target]!.reduce((sum, amount) => sum + amount, 0),
            0,
          ) / samples.length,
      );
      const oneTargetMean =
        Array.from({ length: 60 }, (_, index) =>
          sampleDistribution(1, 8_000 + index)[0]!.reduce(
            (sum, amount) => sum + amount,
            0,
          ),
        ).reduce((total, amount) => total + amount, 0) / 60;

      // Each of the three hits rounds after its pool is split, so a target may
      // differ by at most half a point per hit from the unrounded share.
      for (const mean of targetMeans) {
        expect(
          Math.abs(mean - oneTargetMean / targetCount),
        ).toBeLessThanOrEqual(1.5);
      }
      expect(
        Math.abs(
          targetMeans.reduce((total, mean) => total + mean, 0) - oneTargetMean,
        ),
      ).toBeLessThanOrEqual(1.5 * targetCount);
    },
  );
});
