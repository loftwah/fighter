import { describe, expect, it } from "vitest";
import {
  defaultDevExperiments,
  experimentRegistry,
  loadDevExperiments,
  saveDevExperiments,
} from "./experiments";

class MemoryStorage {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("development experiment registry", () => {
  it("separates cosmetic presentation from interaction and gameplay effects", () => {
    expect(
      Object.fromEntries(
        experimentRegistry.map((experiment) => [
          experiment.id,
          experiment.effectClass,
        ]),
      ),
    ).toEqual({
      "battle.interaction-shell": "interaction-critical",
      "battle.presentation-style": "cosmetic",
      "battle.presentation-lock": "presentation-active",
      "battle.rules": "gameplay-active",
    });
    expect(
      experimentRegistry.filter((experiment) => experiment.settingsVisible),
    ).toHaveLength(1);
  });

  it("persists the visual style and permits a browser query override", () => {
    const storage = new MemoryStorage();
    expect(loadDevExperiments(storage)).toEqual(defaultDevExperiments);

    saveDevExperiments(storage, {
      battlePresentationStyle: "comic-panels",
    });
    expect(loadDevExperiments(storage).battlePresentationStyle).toBe(
      "comic-panels",
    );
    expect(
      loadDevExperiments(
        storage,
        "?experiment.battlePresentationStyle=kinetic-print",
      ).battlePresentationStyle,
    ).toBe("kinetic-print");
  });

  it("falls back safely when local experiment data is invalid", () => {
    const storage = new MemoryStorage();
    storage.setItem("loftwah.fighter.dev-experiments.v1", "not-json");
    expect(loadDevExperiments(storage)).toEqual(defaultDevExperiments);
  });
});
