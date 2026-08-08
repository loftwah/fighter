import { describe, expect, it } from "vitest";
import { combatContent } from "../content/initial-content";
import { createStandardBuild } from "../combat/standard-build";
import { createBattle } from "../combat/engine";
import {
  battleInputForMatch,
  createResolvedMatchConfiguration,
} from "./match-configuration";

describe("resolved match configuration", () => {
  it("is an immutable, Battle-ready snapshot", () => {
    const viking = combatContent.characters["character.viking"]!;
    const grim = combatContent.characters["character.grim-reaper"]!;
    const match = createResolvedMatchConfiguration(
      {
        id: "quick.custom.1",
        mode: "quick",
        presetId: "quick.custom",
        difficulty: "hard",
        timeLimitMs: 120_000,
        seed: 42,
        player: {
          fighters: [
            {
              instanceId: "sandbox.player.viking.1",
              characterId: viking.id,
              build: createStandardBuild(viking, "player", 0),
            },
          ],
          accessoryId: "accessory.field-kit",
          startingCharge: 25,
        },
        opponent: {
          fighters: [
            {
              instanceId: "sandbox.opponent.grim.1",
              characterId: grim.id,
              build: createStandardBuild(grim, "enemy", 0),
            },
          ],
          accessoryId: null,
          startingCharge: 50,
        },
      },
      combatContent,
    );

    expect(Object.isFrozen(match)).toBe(true);
    expect(Object.isFrozen(match.player.fighters[0]!.build)).toBe(true);
    expect(Object.isFrozen(match.player.fighters[0]!.build.actionIds)).toBe(
      true,
    );
    expect(battleInputForMatch(match)).toMatchObject({
      playerCharacterIds: ["character.viking"],
      enemyCharacterIds: ["character.grim-reaper"],
      difficulty: "hard",
      timeLimitMs: 120_000,
      seed: 42,
      playerAccessoryId: "accessory.field-kit",
      enemyAccessoryId: undefined,
    });
  });

  it("stores capped effective opening Charge and passes it to Battle unchanged", () => {
    const viking = combatContent.characters["character.viking"]!;
    const grim = combatContent.characters["character.grim-reaper"]!;
    const playerBuild = {
      ...createStandardBuild(viking, "player", 0),
      equippedPatchId: "patch.hot-start",
    };
    const match = createResolvedMatchConfiguration(
      {
        id: "quick.hot.1",
        mode: "quick",
        difficulty: "normal",
        timeLimitMs: 90_000,
        seed: 7,
        player: {
          fighters: [
            {
              instanceId: "sandbox.player.viking.1",
              characterId: viking.id,
              build: playerBuild,
            },
          ],
          accessoryId: null,
          startingCharge: 90,
        },
        opponent: {
          fighters: [
            {
              instanceId: "sandbox.opponent.grim.1",
              characterId: grim.id,
              build: createStandardBuild(grim, "enemy", 0),
            },
          ],
          accessoryId: null,
          startingCharge: 0,
        },
      },
      combatContent,
    );
    const input = battleInputForMatch(match);

    expect(match.player.startingCharge).toBe(100);
    expect(input.playerStartingBar).toBe(100);
    expect(createBattle(input, combatContent).state.player.bar).toBe(100);
    expect(
      createResolvedMatchConfiguration(match, combatContent).player
        .startingCharge,
    ).toBe(100);
  });

  it("preserves the legacy CreateBattle opening-Charge contract", () => {
    const state = createBattle(
      {
        playerCharacterIds: ["character.viking"],
        enemyCharacterIds: ["character.grim-reaper"],
        playerStartingBar: 10,
        seed: 3,
        difficulty: "normal",
      },
      combatContent,
    ).state;

    expect(state.player.bar).toBe(15);
  });

  it("rejects a build that does not resolve to registered content", () => {
    const viking = combatContent.characters["character.viking"]!;
    expect(() =>
      createResolvedMatchConfiguration(
        {
          id: "bad",
          mode: "quick",
          difficulty: "normal",
          timeLimitMs: 90_000,
          seed: 1,
          player: {
            fighters: [
              {
                instanceId: "one",
                characterId: viking.id,
                build: { actionIds: ["missing", "missing", "missing"] },
              },
            ],
            accessoryId: null,
            startingCharge: 0,
          },
          opponent: {
            fighters: [
              {
                instanceId: "two",
                characterId: viking.id,
                build: createStandardBuild(viking, "enemy", 0),
              },
            ],
            accessoryId: null,
            startingCharge: 0,
          },
        },
        combatContent,
      ),
    ).toThrow("requires three registered Moves");
  });

  it("rejects locked build features below their level thresholds", () => {
    const viking = combatContent.characters["character.viking"]!;
    const grim = combatContent.characters["character.grim-reaper"]!;
    const input = {
      id: "bad-level-gate",
      mode: "quick" as const,
      difficulty: "normal" as const,
      timeLimitMs: 90_000,
      seed: 1,
      player: {
        fighters: [
          {
            instanceId: "one",
            characterId: viking.id,
            build: {
              ...createStandardBuild(viking, "player", 0),
              level: 4,
              equippedPatchId: "patch.no-flinch",
            },
          },
        ],
        accessoryId: null,
        startingCharge: 0,
      },
      opponent: {
        fighters: [
          {
            instanceId: "two",
            characterId: grim.id,
            build: createStandardBuild(grim, "enemy", 0),
          },
        ],
        accessoryId: null,
        startingCharge: 0,
      },
    };

    expect(() =>
      createResolvedMatchConfiguration(input, combatContent),
    ).toThrow("Modification slot unlocks at level 5");
    expect(() =>
      createResolvedMatchConfiguration(
        {
          ...input,
          player: {
            ...input.player,
            fighters: [
              {
                ...input.player.fighters[0]!,
                build: {
                  ...input.player.fighters[0]!.build,
                  level: 9,
                  equippedPatchId: null,
                  actionTiers: { [viking.actionIds[0]]: "gold" as const },
                },
              },
            ],
          },
        },
        combatContent,
      ),
    ).toThrow("Move customisation unlocks at level 10");
  });
});
