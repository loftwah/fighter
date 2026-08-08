import { describe, expect, it } from "vitest";
import { createStandardBuild } from "../combat/standard-build";
import { combatContent } from "../content/initial-content";
import { tournamentDefinition } from "../tournaments/catalog";
import {
  createTournamentRun,
  type TournamentRosterBuild,
} from "../tournaments/runner";
import {
  createDefaultPlayerProfile,
  createDefaultSave,
  loadPlayerProfile,
  savePlayerProfile,
  saveTournamentVictory,
} from "./save";

class MemoryStorage implements Storage {
  readonly #values = new Map<string, string>();
  get length() {
    return this.#values.size;
  }
  clear() {
    this.#values.clear();
  }
  getItem(key: string) {
    return this.#values.get(key) ?? null;
  }
  key(index: number) {
    return [...this.#values.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.#values.delete(key);
  }
  setItem(key: string, value: string) {
    this.#values.set(key, value);
  }
}

function rosterBuild(): TournamentRosterBuild {
  const character = combatContent.characters["character.viking"]!;
  const build = createStandardBuild(character, "player", 0);
  return {
    characterId: character.id,
    instanceId: "custom.roster.viking.1",
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

describe("Tournament run persistence", () => {
  it("records the exact resolved variant Trophy under its base Tournament", () => {
    const storage = new MemoryStorage();
    const save = createDefaultSave(1);
    save.tournamentTrophyIds = ["trophy.generic.gold-cup"];
    saveTournamentVictory(
      storage,
      save,
      "tournament.cheap-seats",
      "standalone",
      "story.first-run",
      "trophy.generic.gold-cup",
    );

    const ownership = loadPlayerProfile(storage, 1).tournamentTrophies;
    expect(Object.keys(ownership)).toEqual(["tournament.cheap-seats"]);
    expect(ownership["tournament.cheap-seats"]).toMatchObject({
      trophyId: "trophy.generic.gold-cup",
      provenance: [expect.objectContaining({ source: "standalone" })],
    });
  });

  it("round-trips additive runner state, including custom run identity and overrides", () => {
    const storage = new MemoryStorage();
    const profile = createDefaultPlayerProfile(1);
    const run = createTournamentRun({
      definition: tournamentDefinition("tournament.cheap-seats"),
      roster: [rosterBuild()],
      defaults: { difficulty: "brutal", timeLimitMs: 75_000 },
      fightOverrides: { "round-1": { playerStartingCharge: 20 } },
      deploymentAccessoryId: "accessory.field-kit",
    });
    profile.customTournamentDefinitions.push({
      id: "tournament.custom.persistence-proof",
      name: "Persistence Proof",
      trophyId: "trophy.generic.gold-cup",
      nodes: [
        {
          id: "fight-1",
          kind: "fight",
          label: "Proof fight",
          opponentCharacterIds: ["character.moses"],
        },
      ],
      createdAt: profile.updatedAt,
      updatedAt: profile.updatedAt,
    });
    profile.standaloneTournamentRun = {
      ...run,
      tournamentId: "tournament.custom.persistence-proof",
      definitionKind: "custom",
      roundIndex: 7,
      pendingNextFightEffects: [
        {
          kind: "starting-status",
          side: "opponent",
          target: "active",
          status: "stun",
          durationMs: 900,
          magnitude: 1,
        },
      ],
    };
    savePlayerProfile(storage, 1, profile);

    expect(loadPlayerProfile(storage, 1).standaloneTournamentRun).toMatchObject(
      {
        tournamentId: "tournament.custom.persistence-proof",
        definitionKind: "custom",
        definitionTrophyId: "trophy.wrong-door-cup",
        deploymentAccessoryId: "accessory.field-kit",
        runSettings: {
          defaults: { difficulty: "brutal", timeLimitMs: 75_000 },
          fightOverrides: { "round-1": { playerStartingCharge: 20 } },
        },
        roundIndex: 7,
        pendingNextFightEffects: [
          expect.objectContaining({ kind: "starting-status", status: "stun" }),
        ],
      },
    );
  });

  it("preserves an explicit interlude cursor while migrating a v2 save into v3", () => {
    const storage = new MemoryStorage();
    const legacy = createDefaultSave(1);
    legacy.standaloneTournamentRun = {
      ...createTournamentRun({
        definition: tournamentDefinition("tournament.cheap-seats"),
        roster: [rosterBuild()],
      }),
      currentNodeId: "recovery-1",
      roundIndex: 1,
      phase: "interlude",
    };
    storage.setItem("riot-relics.save.v2.1", JSON.stringify(legacy));

    expect(loadPlayerProfile(storage, 1).standaloneTournamentRun).toMatchObject(
      {
        currentNodeId: "recovery-1",
        roundIndex: 1,
        phase: "interlude",
      },
    );
  });
});
