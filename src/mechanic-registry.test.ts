import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const registry = JSON.parse(
  readFileSync(
    new URL(
      "../v2-brief/reference-game-mechanic-registry-v2.json",
      import.meta.url,
    ),
    "utf8",
  ),
) as {
  dispositionValues: string[];
  proofColumns: string[];
  mechanics: Array<{
    id: string;
    internalRequirement: string;
    disposition: string;
    targetMilestone: string;
    implementationState: string;
    rationale: string;
    proof?: Record<string, string | null>;
  }>;
};

const dispositions = [
  "ADOPT",
  "ADAPT",
  "REPLACE",
  "DEFER",
  "REJECT",
  "RESEARCH",
];

describe("V2 mechanic coverage registry", () => {
  it("gives every preserved research row exactly one supported disposition", () => {
    expect(registry.dispositionValues).toEqual(dispositions);
    expect(registry.mechanics).toHaveLength(117);
    expect(
      new Set(registry.mechanics.map((mechanic) => mechanic.id)).size,
    ).toBe(registry.mechanics.length);

    for (const mechanic of registry.mechanics) {
      expect(dispositions, mechanic.id).toContain(mechanic.disposition);
      expect(mechanic.internalRequirement, mechanic.id).toBeTruthy();
      expect(mechanic.internalRequirement, mechanic.id).not.toMatch(
        /\b(?:figures?|actions?|bars?|chips?|mods?|repaints?|coins?)\b/i,
      );
      expect(mechanic.targetMilestone, mechanic.id).toBeTruthy();
      expect(mechanic.implementationState, mechanic.id).toBeTruthy();
      expect(mechanic.rationale, mechanic.id).toBeTruthy();
    }
  });

  it("tracks every required proof column for adopted and adapted mechanics", () => {
    for (const mechanic of registry.mechanics) {
      if (!["ADOPT", "ADAPT"].includes(mechanic.disposition)) continue;
      expect(mechanic.proof, mechanic.id).toBeDefined();
      expect(Object.keys(mechanic.proof ?? {}), mechanic.id).toEqual(
        registry.proofColumns,
      );
      for (const value of Object.values(mechanic.proof ?? {})) {
        expect(value === null || value.trim().length > 0, mechanic.id).toBe(
          true,
        );
      }
    }
  });

  it("records mechanic-specific proof and leaves unavailable evidence null", () => {
    const exhaustion = registry.mechanics.find(
      (mechanic) => mechanic.id === "accessory.tournament_once",
    )!;
    expect(exhaustion.proof).toMatchObject({
      authoritativeRule: "docs/game-design.md#tournament-mode",
      schemaContentVocabulary:
        "src/persistence/save.ts#TournamentRunData.exhaustedAccessoryIds",
      saveMigrationImpact:
        "src/persistence/save.ts#tournamentRunSchema.exhaustedAccessoryIds",
      fixedSeedPlayableScenario: null,
      localDiagnosticEvidence: null,
    });

    const transformation = registry.mechanics.find(
      (mechanic) => mechanic.id === "action.transform",
    )!;
    expect(transformation.implementationState).toBe("planned");
    expect(transformation.proof?.deterministicDomainImplementation).toBeNull();
    expect(transformation.proof?.automatedTests).toBeNull();
  });

  it("keeps uncertain exact values honest instead of marking them implemented", () => {
    const uncertain = registry.mechanics.filter(
      (mechanic) => mechanic.disposition === "RESEARCH",
    );
    expect(uncertain.map((mechanic) => mechanic.id)).toEqual([
      "team.priority",
      "economy.transparent_mystery",
    ]);
    expect(
      uncertain.every(
        (mechanic) => mechanic.implementationState === "research",
      ),
    ).toBe(true);
  });
});
