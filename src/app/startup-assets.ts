import type { StartupStage } from "../ui/screens/startup-screen";

const MODE_ART_ASSETS = [
  ["--art-story", "image.story.first-run"],
  ["--art-tournament", "image.tournament.cheap-seats"],
] as const;

export function modeArtAssetsForStartupStage(
  stage: StartupStage,
): readonly (readonly [string, string])[] {
  return stage === "ready" ? MODE_ART_ASSETS : [];
}
