import { describe, expect, it } from "vitest";
import {
  enemyHudPresentation,
  isPointNearRect,
  shouldReleaseEnemyHudForceCompact,
} from "./enemy-hud";

describe("enemy HUD proximity", () => {
  const rect = { left: 100, right: 300, top: 80, bottom: 220 };

  it("includes the console and the configured approach zone", () => {
    expect(isPointNearRect(180, 140, rect, 64)).toBe(true);
    expect(isPointNearRect(50, 140, rect, 64)).toBe(true);
    expect(isPointNearRect(180, 24, rect, 64)).toBe(true);
  });

  it("excludes points outside the approach zone", () => {
    expect(isPointNearRect(35, 140, rect, 64)).toBe(false);
    expect(isPointNearRect(180, 285, rect, 64)).toBe(false);
  });
});

describe("enemy HUD presentation", () => {
  it("lets an explicit reduce override retained focus and proximity", () => {
    expect(
      enemyHudPresentation({
        focused: true,
        forceCompact: true,
        nearby: true,
        pinned: false,
      }),
    ).toEqual({
      action: "View",
      ariaLabel: "Expand opponent HUD",
      expanded: false,
    });
  });

  it("does not rearm proximity while the Reduce control retains focus", () => {
    expect(
      shouldReleaseEnemyHudForceCompact({
        forceCompact: true,
        pointerHasLeft: true,
        toggleFocused: true,
      }),
    ).toBe(false);
  });
});
