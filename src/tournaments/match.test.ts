import { describe, expect, it } from "vitest";
import { battleInputForMatch } from "../app/match-configuration";
import { createBattle } from "../combat/engine";
import { createStandardBuild } from "../combat/standard-build";
import { combatContent } from "../content/initial-content";
import { tournamentDefinition, type TournamentDefinition } from "./catalog";
import {
  applyTournamentMatchInitialHealth,
  resolveTournamentMatch,
} from "./match";
import {
  createTournamentRun,
  resolveTournamentInterlude,
  selectTournamentDeployment,
  type TournamentRosterBuild,
} from "./runner";

function build(characterId: string, index: number): TournamentRosterBuild {
  const character = combatContent.characters[characterId]!;
  const source = createStandardBuild(character, "player", index);
  return {
    characterId,
    instanceId: `roster.${index}.${characterId}`,
    level: source.level!,
    statBonuses: {
      health: source.statBonuses?.health ?? 0,
      power: source.statBonuses?.power ?? 0,
      evasion: source.statBonuses?.evasion ?? 0,
      fortune: source.statBonuses?.fortune ?? 0,
      tempo: source.statBonuses?.tempo ?? 0,
    },
    actionIds: source.actionIds!,
    actionPositions: source.actionPositions,
    actionTiers: Object.fromEntries(
      source.actionIds!.map((id) => [id, source.actionTiers?.[id] ?? "stock"]),
    ),
    interruptionResistance: source.interruptionResistance ?? 0,
    equippedPatchId: source.equippedPatchId ?? null,
  };
}

describe("Tournament immutable match resolution", () => {
  it("reviews exact order, starter, Accessory, overrides and bilateral carried Health", () => {
    const definition = tournamentDefinition("tournament.cheap-seats");
    const roster = [build("character.viking", 0), build("character.tux", 1)];
    let run = createTournamentRun({
      definition,
      roster,
      defaults: { difficulty: "hard", timeLimitMs: 75_000 },
      fightOverrides: { "round-1": { playerStartingCharge: 12 } },
    });
    run.healthRatios[roster[1]!.instanceId] = 0.6;
    run.opponentHealthRatios["enemy.moses"] = 0.4;
    run = selectTournamentDeployment(
      run,
      [roster[0]!.instanceId, roster[1]!.instanceId],
      roster[1]!.instanceId,
      "accessory.field-kit",
    );
    const resolved = resolveTournamentMatch({
      definition,
      run,
      content: combatContent,
      preferredDifficulty: "normal",
      opponentInstanceIds: ["enemy.moses"],
    });
    expect(Object.isFrozen(resolved.match)).toBe(true);
    expect(resolved.match).toMatchObject({
      difficulty: "hard",
      timeLimitMs: 75_000,
      player: { accessoryId: "accessory.field-kit", startingCharge: 17 },
    });
    expect(
      resolved.match.player.fighters.map((fighter) => fighter.instanceId),
    ).toEqual([roster[1]!.instanceId, roster[0]!.instanceId]);
    expect(resolved.match.player.fighters[0]!.initialHealthRatio).toBe(0.6);
    expect(resolved.match.opponent.fighters[0]!.initialHealthRatio).toBe(0.4);

    const created = createBattle(
      battleInputForMatch(resolved.match),
      combatContent,
    ).state;
    const carried = applyTournamentMatchInitialHealth(created, resolved.match);
    expect(carried.player.squad[0]!.currentHealth).toBe(
      Math.round(carried.player.squad[0]!.maxHealth * 0.6),
    );
    expect(carried.enemy.squad[0]!.currentHealth).toBe(
      Math.round(carried.enemy.squad[0]!.maxHealth * 0.4),
    );
  });

  it("carries declared opponent stun and temporary stats into the immutable match", () => {
    const preset = tournamentDefinition("tournament.cheap-seats");
    const definition: TournamentDefinition = {
      ...preset,
      id: "tournament.variant.effect-proof",
      kind: "variant",
      baseTournamentId: preset.id,
      nodes: preset.nodes.map((node) =>
        node.id === "recovery-1" && node.kind === "recovery"
          ? {
              ...node,
              choiceIds: [...node.choiceIds, "ambush"],
              choices: [
                ...(node.choices ?? []),
                {
                  id: "ambush",
                  label: "Ambush the next opponent",
                  effects: [
                    {
                      kind: "starting-status",
                      side: "opponent",
                      target: "active",
                      status: "stun",
                      durationMs: 1_200,
                      magnitude: 1,
                    },
                    {
                      kind: "temporary-stat",
                      side: "opponent",
                      target: "all",
                      stat: "power",
                      amount: -3,
                    },
                  ],
                },
              ],
            }
          : node,
      ),
    };
    const roster = [build("character.viking", 0)];
    const interlude = {
      ...createTournamentRun({ definition, roster }),
      currentNodeId: "recovery-1",
      roundIndex: 1,
      phase: "interlude" as const,
    };
    const run = resolveTournamentInterlude(definition, interlude, "ambush");
    expect(run.pendingNextFightEffects).toHaveLength(2);

    const resolved = resolveTournamentMatch({
      definition,
      run,
      content: combatContent,
      preferredDifficulty: "normal",
    });
    expect(resolved.match.opponent.fighters[0]).toMatchObject({
      build: { statBonuses: { power: -1 } },
      initialStatuses: [{ kind: "stun", durationMs: 1_200, magnitude: 1 }],
    });
    const state = applyTournamentMatchInitialHealth(
      createBattle(battleInputForMatch(resolved.match), combatContent).state,
      resolved.match,
    );
    expect(state.enemy.squad[0]!.statuses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "stun", remainingMs: 1_200 }),
      ]),
    );
  });
});
