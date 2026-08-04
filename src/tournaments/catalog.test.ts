import { describe, expect, it } from "vitest";
import { imageAssets } from "../assets/registry";
import {
  awardTournamentTrophy,
  genericTournamentTrophies,
  tournamentDefinitionList,
  tournamentTrophies,
  tournamentTrophyList,
} from "./catalog";

describe("Tournament Trophy catalogue", () => {
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
});
