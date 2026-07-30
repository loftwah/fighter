import { nextRandom } from "../combat/rng";
import { musicTracks, type MusicTrack } from "./registry";

export type MusicContext = "main" | "wandering" | "battle";

export interface MusicSelection {
  context: MusicContext;
  seed: number;
  characterIds?: readonly string[];
  currentTrackId?: string;
}

export function musicSeed(...parts: readonly (number | string)[]): number {
  return parts
    .flatMap((part) => String(part).split(""))
    .reduce(
      (seed, character) =>
        Math.imul(seed ^ character.charCodeAt(0), 16_777_619) >>> 0,
      2_166_136_261,
    );
}

export function musicWeight(
  track: MusicTrack,
  context: MusicContext,
  characterIds: readonly string[] = [],
): number {
  if (track.role === "character") {
    const matchesBattle = track.characterId
      ? characterIds.includes(track.characterId)
      : false;
    return context === "battle" && matchesBattle ? 9 : 1;
  }
  if (track.role === "battle") {
    return context === "battle" ? 8 : 1;
  }
  if (track.role === "wandering") {
    return context === "wandering" ? 10 : context === "main" ? 4 : 2;
  }
  if (track.role === "main") {
    return context === "main" ? 12 : context === "wandering" ? 3 : 1;
  }
  return context === "wandering" ? 4 : context === "battle" ? 3 : 2;
}

export function selectMusicTrack(selection: MusicSelection): MusicTrack {
  const alternatives = musicTracks.filter(
    (track) => track.id !== selection.currentTrackId,
  );
  const candidates = alternatives.length > 0 ? alternatives : musicTracks;
  const weighted = candidates.map((track) => ({
    track,
    weight: musicWeight(track, selection.context, selection.characterIds ?? []),
  }));
  const totalWeight = weighted.reduce(
    (total, candidate) => total + candidate.weight,
    0,
  );
  let roll = nextRandom(selection.seed >>> 0).value * totalWeight;
  for (const candidate of weighted) {
    roll -= candidate.weight;
    if (roll < 0) {
      return candidate.track;
    }
  }
  return weighted.at(-1)?.track ?? musicTracks[0]!;
}
