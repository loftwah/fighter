import { describe, expect, it } from "vitest";
import { imageAssets } from "../assets/registry";
import {
  awardTournamentTrophy,
  awardTournamentDefinitionTrophy,
  createTournamentVariant,
  genericTournamentTrophies,
  resolveTournamentDefinition,
  resolveTournamentRunDefinition,
  tournamentDefinitionList,
  tournamentDefinitionFromPersisted,
  tournamentFightDefinition,
  tournamentTrophies,
  tournamentTrophyList,
  validateTournamentDefinition,
} from "./catalog";

describe("Tournament Trophy catalogue", () => {
  it("validates preset nodes, opponent Squads, seeds, and mandatory Trophy", () => {
    const definition = tournamentDefinitionList[0]!;
    expect(validateTournamentDefinition(definition)).toBe(definition);
    expect(definition.kind).toBe("preset");
    expect(
      definition.nodes.filter((node) => node.kind === "fight"),
    ).toHaveLength(3);
  });

  it("resolves one authoritative fight node with merged Tournament defaults", () => {
    const resolved = tournamentFightDefinition(
      "tournament.cheap-seats",
      "round-2",
    );
    expect(resolved.node.enemyCharacterIds).toEqual([
      "character.humpty",
      "character.grim-reaper",
    ]);
    expect(resolved.node.seed).toBe(20_260_907);
    expect(resolved.settings).toEqual({
      timeLimitMs: 120_000,
      playerStartingCharge: 0,
      opponentStartingCharge: 0,
      playerAccessoryId: "accessory.press-pass",
      opponentAccessoryId: "accessory.dead-air",
    });
  });

  it("gives every Tournament one registered, non-generic Trophy", () => {
    for (const tournament of tournamentDefinitionList) {
      const trophy = tournamentTrophies[tournament.trophyId];
      expect(trophy, tournament.id).toBeDefined();
      expect(trophy?.generic, tournament.id).toBe(false);
      expect(imageAssets[trophy!.imageAssetId], trophy?.id).toBeDefined();
      expect(
        imageAssets[tournament.imageAssetId],
        `${tournament.id} presentation`,
      ).toBeDefined();
    }
    expect(
      new Set(tournamentDefinitionList.map(({ trophyId }) => trophyId)).size,
    ).toBe(tournamentDefinitionList.length);
  });

  it("provides distinct registered Trophy art for custom Tournaments", () => {
    expect(genericTournamentTrophies).toHaveLength(3);
    expect(new Set(genericTournamentTrophies.map(({ id }) => id)).size).toBe(3);
    for (const trophy of genericTournamentTrophies) {
      expect(imageAssets[trophy.imageAssetId], trophy.id).toBeDefined();
    }
    expect(
      new Set(genericTournamentTrophies.map(({ imageAssetId }) => imageAssetId))
        .size,
    ).toBe(genericTournamentTrophies.length);
    expect(new Set(tournamentTrophyList.map(({ id }) => id)).size).toBe(
      tournamentTrophyList.length,
    );
  });

  it("awards a Tournament Trophy once while allowing repeat wins", () => {
    const first = awardTournamentTrophy([], "tournament.cheap-seats");
    expect(first).toEqual({
      trophyIds: ["trophy.wrong-door-cup"],
      trophyId: "trophy.wrong-door-cup",
      awarded: true,
    });
    expect(
      awardTournamentTrophy(first.trophyIds, "tournament.cheap-seats"),
    ).toEqual({
      trophyIds: ["trophy.wrong-door-cup"],
      trophyId: "trophy.wrong-door-cup",
      awarded: false,
    });
  });

  it("keeps registered presets deeply immutable and creates isolated variants", () => {
    const preset = tournamentDefinitionList[0]!;
    expect(Object.isFrozen(preset)).toBe(true);
    expect(Object.isFrozen(preset.nodes)).toBe(true);
    expect(Object.isFrozen(preset.nodes[0])).toBe(true);

    const variant = createTournamentVariant(preset.id, {
      id: "tournament.variant.wrong-door-fast",
      matchDefaults: { timeLimitMs: 60_000 },
      fightOverrides: { "round-2": { playerStartingCharge: 25 } },
    });

    expect(variant.kind).toBe("variant");
    expect(variant.baseTournamentId).toBe(preset.id);
    expect(variant.matchDefaults.timeLimitMs).toBe(60_000);
    expect(
      variant.nodes.find(
        (
          node,
        ): node is Extract<(typeof variant.nodes)[number], { kind: "fight" }> =>
          node.id === "round-2" && node.kind === "fight",
      )?.matchSettings,
    ).toMatchObject({ playerStartingCharge: 25 });
    expect(preset.matchDefaults.timeLimitMs).toBe(120_000);
    expect(Object.isFrozen(variant)).toBe(true);
    expect(
      resolveTournamentDefinition(variant.id, { [variant.id]: variant }),
    ).toEqual(variant);
    expect(
      resolveTournamentRunDefinition({
        tournamentId: variant.id,
        definitionKind: "variant",
        baseTournamentId: preset.id,
        definitionTrophyId: "trophy.generic.gold-cup",
        runSettings: {
          defaults: variant.matchDefaults,
          fightOverrides: { "round-2": { playerStartingCharge: 25 } },
        },
      }),
    ).toMatchObject({
      baseTournamentId: preset.id,
      trophyId: "trophy.generic.gold-cup",
    });
  });

  it("awards the Trophy declared by a persisted custom definition", () => {
    const preset = tournamentDefinitionList[0]!;
    const custom = validateTournamentDefinition({
      ...structuredClone(preset),
      id: "tournament.custom.catalogue-proof",
      kind: "custom",
      baseTournamentId: undefined,
      trophyId: "trophy.generic.silver-tower",
    });
    expect(awardTournamentDefinitionTrophy([], custom)).toEqual({
      trophyIds: ["trophy.generic.silver-tower"],
      trophyId: "trophy.generic.silver-tower",
      awarded: true,
    });
    const persisted = tournamentDefinitionFromPersisted({
      id: "tournament.custom.persisted-map",
      name: "Persisted Map Cup",
      trophyId: "trophy.generic.gold-cup",
      imageAssetId: preset.imageAssetId,
      imageAlt: "A custom Tournament arena.",
      matchDefaults: preset.matchDefaults,
      nodes: [
        {
          id: "fight-1",
          kind: "fight",
          label: "Opening fight",
          opponentCharacterIds: ["character.moses"],
          seed: 41,
        },
      ],
    });
    expect(
      resolveTournamentDefinition(persisted.id, { [persisted.id]: persisted }),
    ).toEqual(persisted);
  });
});
