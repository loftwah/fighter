import { describe, expect, it } from "vitest";
import { createBattle } from "../combat/engine";
import { createStandardBuild } from "../combat/standard-build";
import { combatContent } from "../content/initial-content";
import {
  createTournamentVariant,
  tournamentDefinition,
  type TournamentDefinition,
} from "./catalog";
import {
  createTournamentRun,
  effectiveTournamentFightSettings,
  exhaustTournamentAccessory,
  forfeitTournamentRun,
  recordTournamentBattleResult,
  resolveTournamentInterlude,
  restartTournamentRun,
  selectTournamentDeployment,
  tournamentVictoryProjection,
  type TournamentRosterBuild,
} from "./runner";

const definition = tournamentDefinition("tournament.cheap-seats");

function rosterBuild(
  characterId: string,
  index: number,
): TournamentRosterBuild {
  const character = combatContent.characters[characterId]!;
  const build = createStandardBuild(character, "player", index);
  return {
    characterId,
    instanceId: `tournament.roster.${index}.${characterId}`,
    level: build.level!,
    statBonuses: {
      health: build.statBonuses?.health ?? 0,
      power: build.statBonuses?.power ?? 0,
      evasion: build.statBonuses?.evasion ?? 0,
      fortune: build.statBonuses?.fortune ?? 0,
      tempo: build.statBonuses?.tempo ?? 0,
    },
    actionIds: build.actionIds!,
    actionPositions: build.actionPositions,
    actionTiers: Object.fromEntries(
      build.actionIds!.map((id) => [id, build.actionTiers?.[id] ?? "stock"]),
    ),
    interruptionResistance: build.interruptionResistance ?? 0,
    equippedPatchId: build.equippedPatchId ?? null,
  };
}

const roster = [
  rosterBuild("character.viking", 0),
  rosterBuild("character.viking", 1),
  rosterBuild("character.tux", 2),
  rosterBuild("character.moses", 3),
];

describe("definition-driven Tournament runner", () => {
  it("locks unique instances, persists settings and validates living deployment", () => {
    const run = createTournamentRun({
      definition,
      roster,
      defaults: { difficulty: "hard", timeLimitMs: 90_000 },
      fightOverrides: { "round-2": { playerStartingCharge: 25 } },
    });
    expect(run.caseBuilds).toHaveLength(4);
    expect(
      run.caseBuilds.slice(0, 2).map((build) => build.characterId),
    ).toEqual(["character.viking", "character.viking"]);
    expect(
      effectiveTournamentFightSettings(definition, run, "round-2"),
    ).toMatchObject({
      difficulty: "hard",
      timeLimitMs: 90_000,
      playerStartingCharge: 25,
    });
    const carried = {
      ...run,
      healthRatios: { ...run.healthRatios, [roster[0]!.instanceId]: 0 },
    };
    expect(() =>
      selectTournamentDeployment(
        carried,
        [roster[0]!.instanceId],
        roster[0]!.instanceId,
      ),
    ).toThrow("living");
    const selected = selectTournamentDeployment(
      carried,
      [roster[2]!.instanceId, roster[1]!.instanceId],
      roster[1]!.instanceId,
      "accessory.field-kit",
    );
    expect(selected.deployedInstanceIds).toEqual([
      roster[2]!.instanceId,
      roster[1]!.instanceId,
    ]);
    expect(selected.activeInstanceId).toBe(roster[1]!.instanceId);
    expect(selected.deploymentAccessoryId).toBe("accessory.field-kit");
    expect(() =>
      selectTournamentDeployment(
        exhaustTournamentAccessory(selected, "accessory.field-kit"),
        [roster[1]!.instanceId],
        roster[1]!.instanceId,
        "accessory.field-kit",
      ),
    ).toThrow("exhausted");
  });

  it("carries both sides after a loss and only loses when the full Roster is down", () => {
    let run = createTournamentRun({ definition, roster });
    run = selectTournamentDeployment(
      run,
      [roster[0]!.instanceId],
      roster[0]!.instanceId,
    );
    const created = createBattle(
      {
        playerCharacterIds: [roster[0]!.characterId],
        playerBuilds: [roster[0]!],
        enemyCharacterIds: ["character.moses"],
        seed: 7,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    created.player.squad[0]!.currentHealth = 0;
    created.enemy.squad[0]!.currentHealth = Math.round(
      created.enemy.squad[0]!.maxHealth * 0.4,
    );
    const result = recordTournamentBattleResult(
      definition,
      run,
      created,
      false,
    );
    expect(result.status).toBe("redeploy");
    if (result.status !== "redeploy") return;
    expect(result.run.healthRatios[roster[0]!.instanceId]).toBe(0);
    expect(Object.values(result.run.opponentHealthRatios)[0]).toBeCloseTo(0.4);
    const allDown = structuredClone(result.run);
    for (const build of allDown.caseBuilds)
      allDown.healthRatios[build.instanceId] = 0;
    expect(
      recordTournamentBattleResult(definition, allDown, created, false),
    ).toEqual({
      status: "lost",
      reason: "roster-defeated",
    });
  });

  it("advances ordered nodes, applies declared recovery, and projects one Trophy", () => {
    const run = createTournamentRun({ definition, roster });
    const state = createBattle(
      {
        playerCharacterIds: run.deployedInstanceIds.map(
          (id) =>
            run.caseBuilds.find((build) => build.instanceId === id)!
              .characterId,
        ),
        playerBuilds: run.deployedInstanceIds.map((id) =>
          run.caseBuilds.find((build) => build.instanceId === id)!,
        ),
        enemyCharacterIds: ["character.moses"],
        seed: 8,
        difficulty: "normal",
      },
      combatContent,
    ).state;
    state.player.squad[0]!.currentHealth = Math.round(
      state.player.squad[0]!.maxHealth * 0.5,
    );
    const won = recordTournamentBattleResult(definition, run, state, true);
    expect(won.status).toBe("continue");
    if (won.status !== "continue") return;
    expect(won.run).toMatchObject({
      currentNodeId: "recovery-1",
      phase: "interlude",
      roundIndex: 1,
    });
    const next = resolveTournamentInterlude(definition, won.run, "hot-start");
    expect(next).toMatchObject({
      currentNodeId: "round-2",
      phase: "ready",
      nextRoundChargeBonus: 18,
    });
    expect(forfeitTournamentRun()).toEqual({
      status: "forfeited",
      reason: "forfeit",
    });
    expect(
      restartTournamentRun(definition, next).exhaustedAccessoryIds,
    ).toEqual([]);
    expect(tournamentVictoryProjection(definition, [])).toEqual({
      tournamentId: definition.id,
      trophyId: "trophy.wrong-door-cup",
      awarded: true,
    });
    expect(
      tournamentVictoryProjection(definition, [definition.id]).awarded,
    ).toBe(false);
    const variant = createTournamentVariant(definition.id, {
      id: "tournament.variant.generic-trophy",
      trophyId: "trophy.generic.gold-cup",
    });
    expect(tournamentVictoryProjection(variant, [])).toEqual({
      tournamentId: definition.id,
      trophyId: "trophy.generic.gold-cup",
      awarded: true,
    });
  });

  it("auto-resolves declared non-choice nodes and completes after a final effect", () => {
    const fights = definition.nodes.filter((node) => node.kind === "fight");
    const automaticDefinition: TournamentDefinition = {
      ...structuredClone(definition),
      id: "tournament.custom.automatic-nodes",
      kind: "custom",
      nodes: [
        fights[0]!,
        {
          id: "content-1",
          kind: "content",
          contentId: "content.automatic",
          effects: [{ kind: "opening-charge", side: "player", amount: 12 }],
        },
        fights[1]!,
        {
          id: "reward-final",
          kind: "reward",
          contentId: "reward.automatic",
          effects: [{ kind: "heal-roster", amount: 0.1 }],
        },
      ],
    };
    const run = createTournamentRun({
      definition: automaticDefinition,
      roster,
    });
    const state = createBattle(
      {
        playerCharacterIds: [roster[0]!.characterId],
        playerBuilds: [roster[0]!],
        enemyCharacterIds: ["character.moses"],
        seed: 9,
        difficulty: "normal",
      },
      combatContent,
    ).state;

    const advanced = recordTournamentBattleResult(
      automaticDefinition,
      run,
      state,
      true,
    );
    expect(advanced.status).toBe("continue");
    if (advanced.status !== "continue") return;
    expect(advanced.run).toMatchObject({
      currentNodeId: fights[1]!.id,
      phase: "ready",
      nextRoundChargeBonus: 12,
    });

    const completed = recordTournamentBattleResult(
      automaticDefinition,
      advanced.run,
      state,
      true,
    );
    expect(completed).toMatchObject({
      status: "complete",
      tournamentId: automaticDefinition.id,
      trophyId: automaticDefinition.trophyId,
    });
  });
});
