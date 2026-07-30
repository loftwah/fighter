export const routeIds = [
  "menu",
  "story",
  "lineup",
  "battle",
  "collection",
  "store",
  "missions",
  "quick",
  "tournament",
  "achievements",
  "profile",
  "settings",
  "dev",
] as const;

export type Route = (typeof routeIds)[number];

export const sessionModes = [
  "menu",
  "story",
  "quick",
  "tournament",
  "dev",
] as const;

export type SessionMode = (typeof sessionModes)[number];

export type ScreenFamily =
  "global" | "story" | "quick" | "tournament" | "development" | "battle";

export interface RouteDefinition {
  id: Route;
  label: string;
  family: ScreenFamily;
  allowedSessions: readonly SessionMode[];
  shell: "global" | "story" | "battle" | "contextual";
}

export const routeDefinitions = {
  menu: {
    id: "menu",
    label: "Main Menu",
    family: "global",
    allowedSessions: sessionModes,
    shell: "global",
  },
  achievements: {
    id: "achievements",
    label: "Achievements",
    family: "global",
    allowedSessions: sessionModes,
    shell: "global",
  },
  profile: {
    id: "profile",
    label: "Profile",
    family: "global",
    allowedSessions: sessionModes,
    shell: "global",
  },
  settings: {
    id: "settings",
    label: "Settings",
    family: "global",
    allowedSessions: sessionModes,
    shell: "global",
  },
  story: {
    id: "story",
    label: "Story",
    family: "story",
    allowedSessions: ["story"],
    shell: "story",
  },
  lineup: {
    id: "lineup",
    label: "Lineup",
    family: "story",
    allowedSessions: ["story"],
    shell: "story",
  },
  collection: {
    id: "collection",
    label: "Collection",
    family: "story",
    allowedSessions: ["story"],
    shell: "story",
  },
  store: {
    id: "store",
    label: "Store",
    family: "story",
    allowedSessions: ["story"],
    shell: "story",
  },
  missions: {
    id: "missions",
    label: "Missions",
    family: "story",
    allowedSessions: ["story"],
    shell: "story",
  },
  quick: {
    id: "quick",
    label: "Quick Fight",
    family: "quick",
    allowedSessions: ["quick"],
    shell: "global",
  },
  tournament: {
    id: "tournament",
    label: "Tournament",
    family: "tournament",
    allowedSessions: ["story", "tournament"],
    shell: "contextual",
  },
  dev: {
    id: "dev",
    label: "Developer Lab",
    family: "development",
    allowedSessions: ["dev"],
    shell: "global",
  },
  battle: {
    id: "battle",
    label: "Battle",
    family: "battle",
    allowedSessions: ["story", "quick", "tournament", "dev"],
    shell: "battle",
  },
} as const satisfies Record<Route, RouteDefinition>;

export const globalNavigationRoutes = [
  "menu",
  "achievements",
  "profile",
  "settings",
] as const satisfies readonly Route[];

export const storyNavigationRoutes = [
  "story",
  "lineup",
  "collection",
  "store",
  "missions",
] as const satisfies readonly Route[];

export function isRouteAvailableInSession(
  route: Route,
  sessionMode: SessionMode,
  devToolsEnabled: boolean,
): boolean {
  if (route === "dev" && !devToolsEnabled) {
    return false;
  }
  const allowedSessions: readonly SessionMode[] =
    routeDefinitions[route].allowedSessions;
  return allowedSessions.includes(sessionMode);
}

export function usesStoryShell(
  route: Route,
  sessionMode: SessionMode,
): boolean {
  const shell = routeDefinitions[route].shell;
  return (
    shell === "story" || (shell === "contextual" && sessionMode === "story")
  );
}

export function showsModeTools(
  route: Route,
  sessionMode: SessionMode,
): boolean {
  return (
    sessionMode !== "menu" &&
    routeDefinitions[route].family !== "global" &&
    routeDefinitions[route].family !== "battle"
  );
}
