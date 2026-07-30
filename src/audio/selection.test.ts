import { describe, expect, it } from "vitest";
import { findMusic, musicTracks } from "./registry";
import {
  musicSeed,
  musicWeight,
  selectMusicTrack,
  type MusicContext,
} from "./selection";

describe("purpose-aware music selection", () => {
  it("registers every supplied track and keeps all of them eligible", () => {
    expect(musicTracks).toHaveLength(18);
    for (const context of [
      "main",
      "wandering",
      "battle",
    ] satisfies MusicContext[]) {
      expect(
        musicTracks.every((track) => musicWeight(track, context) > 0),
      ).toBe(true);
    }
  });

  it("is deterministic for an explicit seed and avoids an immediate repeat", () => {
    const seed = musicSeed("battle", 20_260_906, "character.viking");
    const first = selectMusicTrack({
      context: "battle",
      seed,
      characterIds: ["character.viking"],
    });
    const repeated = selectMusicTrack({
      context: "battle",
      seed,
      characterIds: ["character.viking"],
    });
    const next = selectMusicTrack({
      context: "battle",
      seed,
      characterIds: ["character.viking"],
      currentTrackId: first.id,
    });

    expect(repeated.id).toBe(first.id);
    expect(next.id).not.toBe(first.id);
  });

  it("biases each context without turning the soundtrack into exclusive pools", () => {
    const main = findMusic("music.main-theme");
    const wandering = findMusic("music.wandering-around");
    const battle = findMusic("music.battle-1");
    const viking = findMusic("music.character.viking");
    const tux = findMusic("music.character.tux");

    expect(musicWeight(main, "main")).toBeGreaterThan(
      musicWeight(battle, "main"),
    );
    expect(musicWeight(wandering, "wandering")).toBeGreaterThan(
      musicWeight(main, "wandering"),
    );
    expect(musicWeight(battle, "battle")).toBeGreaterThan(
      musicWeight(main, "battle"),
    );
    expect(musicWeight(viking, "battle", ["character.viking"])).toBeGreaterThan(
      musicWeight(tux, "battle", ["character.viking"]),
    );
    expect(musicWeight(tux, "battle", ["character.viking"])).toBeGreaterThan(0);
  });
});
