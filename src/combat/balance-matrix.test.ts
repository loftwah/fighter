import { describe, expect, it } from "vitest";
import { combatContent } from "../content/initial-content";
import {
  measureLaunchMoveBalance,
  measureRosterMatchups,
} from "./balance-matrix";
import { DAMAGE_TIER_MULTIPLIERS, TIER_MULTIPLIERS } from "./rules";

const seeds = [101, 211, 307, 401, 503, 601, 701, 809, 907, 1_009];

function reportMoveMatrix(
  build: "standard" | "fullPower",
  matrix: ReturnType<typeof measureLaunchMoveBalance>,
): void {
  if (process.env.BALANCE_MATRIX_REPORT !== "1") return;
  console.table(
    matrix.map((row) => ({
      build,
      action: row.actionId,
      band: row.band,
      health: `${(row.meanHealthRatio * 100).toFixed(1)}%`,
      movesToWin: row.cleanMovesToVictory,
      events: `${row.directEventCount} direct + ${row.periodicEventCount} periodic`,
    })),
  );
}

describe("seeded launch-roster damage calibration", () => {
  it("pins authored pools and keeps damage tiers separate from utility tiers", () => {
    expect(DAMAGE_TIER_MULTIPLIERS).toEqual({
      stock: 1,
      gold: 1.05,
      platinum: 1.08,
    });
    expect(TIER_MULTIPLIERS).toEqual({
      stock: 1,
      gold: 1.16,
      platinum: 1.34,
    });
    expect(
      [
        "action.tux.root-access",
        "action.tux.kernel-panic",
        "action.moses.part-the-strip",
        "action.viking.berserker-oath",
        "action.ned-kelly.warning-shot",
      ].map((actionId) =>
        combatContent.actions[actionId]!.effects.find(
          (effect) => effect.kind === "damage",
        ),
      ),
    ).toMatchObject([
      { power: 17 },
      { power: 5, hits: 3 },
      { power: 18 },
      { power: 20 },
      { power: 13 },
    ]);
  });

  it("keeps neutral Standard Moves inside their clean-hit damage budgets", () => {
    const matrix = measureLaunchMoveBalance(combatContent, "standard", seeds);
    reportMoveMatrix("standard", matrix);
    const bands = {
      small: [0.1, 0.14],
      middle: [0.19, 0.26],
      big: [0.29, 0.36],
    } as const;

    const failures = matrix
      .filter(
        (row) =>
          row.meanHealthRatio < bands[row.band][0] ||
          row.meanHealthRatio > bands[row.band][1],
      )
      .map(
        (row) =>
          `${row.actionId} ${row.band} ${(row.meanHealthRatio * 100).toFixed(1)}% / ${row.cleanMovesToVictory} hits`,
      );
    expect(failures).toEqual([]);
  });

  it("keeps mirrored Full Power Moves strong without routine two-hit fights", () => {
    const matrix = measureLaunchMoveBalance(combatContent, "fullPower", seeds);
    reportMoveMatrix("fullPower", matrix);
    const maximums = { small: 0.17, middle: 0.3, big: 0.42 } as const;

    const failures = matrix
      .filter(
        (row) =>
          row.meanHealthRatio > maximums[row.band] ||
          row.cleanMovesToVictory < 3,
      )
      .map(
        (row) =>
          `${row.actionId} ${row.band} ${(row.meanHealthRatio * 100).toFixed(1)}% / ${row.cleanMovesToVictory} hits`,
      );
    expect(failures).toEqual([]);
  });

  it("counts multi-hit and periodic output as complete Move damage", () => {
    const matrix = measureLaunchMoveBalance(combatContent, "standard", seeds);
    expect(
      matrix.find((row) => row.actionId === "action.tux.kernel-panic"),
    ).toMatchObject({ directEventCount: 3, periodicEventCount: 0 });
    expect(
      matrix.find((row) => row.actionId === "action.grim-reaper.final-harvest"),
    ).toMatchObject({ directEventCount: 1, periodicEventCount: 2 });
  });

  it("keeps a transparent result spread for every ordered roster matchup", () => {
    const matchupSeeds = [2_003, 3_007, 4_009];
    const expectedTimeouts = {
      standard: [
        "character.humpty vs character.humpty:3",
        "character.humpty vs character.moses:3",
        "character.humpty vs character.ned-kelly:3",
        "character.moses vs character.humpty:3",
        "character.moses vs character.moses:3",
        "character.ned-kelly vs character.humpty:3",
      ],
      fullPower: [
        "character.humpty vs character.humpty:3",
        "character.humpty vs character.moses:3",
        "character.humpty vs character.viking:2",
        "character.humpty vs character.ned-kelly:3",
        "character.moses vs character.humpty:3",
        "character.moses vs character.moses:3",
        "character.viking vs character.humpty:1",
        "character.ned-kelly vs character.humpty:3",
      ],
    } as const;
    for (const build of ["standard", "fullPower"] as const) {
      const matrix = measureRosterMatchups(combatContent, build, matchupSeeds);
      expect(matrix).toHaveLength(36);
      expect(matrix.every((row) => row.outcomes.length === 3)).toBe(true);
      expect(
        matrix.every(
          (row) =>
            row.playerMoveCounts.every((count) => count > 0) &&
            row.enemyMoveCounts.every((count) => count > 0),
        ),
      ).toBe(true);
      expect(
        matrix
          .filter((row) => row.timeoutCount > 0)
          .map(
            (row) => `${row.playerId} vs ${row.enemyId}:${row.timeoutCount}`,
          ),
      ).toEqual(expectedTimeouts[build]);
      expect(
        Math.min(...matrix.flatMap((row) => row.durationsMs)),
      ).toBeGreaterThanOrEqual(6_000);

      if (build === "fullPower") {
        const damagingMirrors = [
          "character.tux",
          "character.viking",
          "character.ned-kelly",
          "character.grim-reaper",
        ].map((characterId) =>
          matrix.find(
            (row) =>
              row.playerId === characterId && row.enemyId === characterId,
          ),
        );
        expect(damagingMirrors.every(Boolean)).toBe(true);
        for (const row of damagingMirrors) {
          expect(row).toBeDefined();
          for (const [index, durationMs] of row!.durationsMs.entries()) {
            expect(durationMs).toBeGreaterThanOrEqual(6_000);
            expect(
              row!.playerMoveCounts[index]! + row!.enemyMoveCounts[index]!,
            ).toBeGreaterThanOrEqual(6);
            expect(
              row!.playerDamageEvents[index]! + row!.enemyDamageEvents[index]!,
            ).toBeGreaterThanOrEqual(3);
          }
        }
      }
      if (process.env.BALANCE_MATRIX_REPORT === "1") {
        console.table(
          matrix.map((row) => ({
            build,
            matchup: `${row.playerId} vs ${row.enemyId}`,
            results: row.outcomes.join("/"),
            duration: `${Math.min(...row.durationsMs) / 1_000}-${Math.max(...row.durationsMs) / 1_000}s`,
            timeouts: row.timeoutCount,
            moves: `${Math.min(...row.playerMoveCounts)}-${Math.max(...row.playerMoveCounts)} / ${Math.min(...row.enemyMoveCounts)}-${Math.max(...row.enemyMoveCounts)}`,
            damageEvents: `${Math.min(...row.playerDamageEvents)}-${Math.max(...row.playerDamageEvents)} / ${Math.min(...row.enemyDamageEvents)}-${Math.max(...row.enemyDamageEvents)}`,
          })),
        );
      }
    }
  });
});
