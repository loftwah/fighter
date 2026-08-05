import { describe, expect, it } from "vitest";
import {
  MOVE_CATEGORY_DETAILS,
  moveCategoryDetail,
  renderMoveCategoryKey,
} from "./move-category-key";

describe("Move category key", () => {
  it("provides a labelled, colour-independent entry for every Move category", () => {
    const markup = renderMoveCategoryKey();

    expect(markup).toContain("Move bands");
    expect(markup).toContain("Inner band");
    expect(markup).toContain("Outer band");
    expect(markup).toContain("On touch, hold a Move for details.");
    for (const detail of Object.values(MOVE_CATEGORY_DETAILS)) {
      expect(markup).toContain(detail.label);
      expect(markup).toContain(`>${detail.marker}</i>`);
      expect(markup).toContain(detail.description);
      expect(markup).toContain(`data-move-category="${detail.id}"`);
    }
  });

  it("returns stable player-facing detail for one Move category", () => {
    expect(moveCategoryDetail("teamAttack")).toEqual({
      id: "teamAttack",
      label: "Team attack",
      shortLabel: "Team hit",
      marker: "ALL",
      description: "Damages the opposing Lineup.",
    });
  });
});
