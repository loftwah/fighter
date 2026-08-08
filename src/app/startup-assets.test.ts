import { describe, expect, it } from "vitest";
import { modeArtAssetsForStartupStage } from "./startup-assets";

describe("startup asset boundary", () => {
  it("defers mode art until the application launcher is ready", () => {
    expect(modeArtAssetsForStartupStage("intro")).toEqual([]);
    expect(modeArtAssetsForStartupStage("loading")).toEqual([]);
    expect(modeArtAssetsForStartupStage("ready")).toEqual([
      ["--art-story", "image.story.first-run"],
      ["--art-tournament", "image.tournament.cheap-seats"],
    ]);
  });
});
