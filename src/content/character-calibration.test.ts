import { describe, expect, it } from "vitest";
import { combatContent } from "./initial-content";
import { characterCalibrations } from "./character-calibration";

describe("character calibration authoring contract", () => {
  it("requires every playable Character to have one reference equivalent", () => {
    expect(
      characterCalibrations.map(({ characterId }) => characterId).sort(),
    ).toEqual(Object.keys(combatContent.characters).sort());
  });

  it("does not silently reuse one reference Character for two fighters", () => {
    const references = characterCalibrations.map(
      ({ referenceGameCharacter }) => referenceGameCharacter,
    );
    expect(new Set(references).size).toBe(references.length);
  });

  it("records a complete three-decision loop and explicit adaptation", () => {
    for (const calibration of characterCalibrations) {
      expect(calibration.decisionLoop).toHaveLength(3);
      expect(calibration.decisionLoop.every(Boolean)).toBe(true);
      expect(calibration.adaptation.length).toBeGreaterThan(20);
    }
  });
});
