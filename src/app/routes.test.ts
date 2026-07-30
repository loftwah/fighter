import { describe, expect, it } from "vitest";
import {
  globalNavigationRoutes,
  isRouteAvailableInSession,
  routeDefinitions,
  routeIds,
  showsModeTools,
  storyNavigationRoutes,
  usesStoryShell,
} from "./routes";

describe("application route manifest", () => {
  it("defines every route exactly once", () => {
    expect(Object.keys(routeDefinitions).sort()).toEqual([...routeIds].sort());
    expect(
      Object.values(routeDefinitions)
        .map((definition) => definition.id)
        .sort(),
    ).toEqual([...routeIds].sort());
    for (const [route, definition] of Object.entries(routeDefinitions)) {
      expect(definition.id).toBe(route);
    }
  });

  it("keeps global and Story navigation disjoint", () => {
    expect(
      globalNavigationRoutes.filter((route) =>
        storyNavigationRoutes.includes(
          route as (typeof storyNavigationRoutes)[number],
        ),
      ),
    ).toEqual([]);
  });

  it("enforces mode ownership without blocking global utility screens", () => {
    expect(isRouteAvailableInSession("quick", "quick", true)).toBe(true);
    expect(isRouteAvailableInSession("quick", "story", true)).toBe(false);
    expect(isRouteAvailableInSession("store", "story", true)).toBe(true);
    expect(isRouteAvailableInSession("store", "tournament", true)).toBe(false);
    expect(isRouteAvailableInSession("achievements", "story", true)).toBe(true);
  });

  it("selects shell and mode tools from route metadata", () => {
    expect(usesStoryShell("tournament", "story")).toBe(true);
    expect(usesStoryShell("tournament", "tournament")).toBe(false);
    expect(usesStoryShell("achievements", "story")).toBe(false);
    expect(showsModeTools("quick", "quick")).toBe(true);
    expect(showsModeTools("profile", "quick")).toBe(false);
  });
});
