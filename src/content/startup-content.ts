export interface StartupBeatBase {
  id: string;
  eyebrow?: string;
  title: string;
  body?: string;
  durationMs: number;
}

export interface StartupTextBeat extends StartupBeatBase {
  kind: "text";
}

export interface StartupImageBeat extends StartupBeatBase {
  kind: "image";
  imageAssetId: string;
  imageAlt: string;
}

export interface StartupVideoBeat extends StartupBeatBase {
  kind: "video";
  videoAssetId: string;
  posterImageAssetId: string;
}

export type StartupBeat = StartupTextBeat | StartupImageBeat | StartupVideoBeat;

/**
 * Data-driven pre-game sequence. Add, remove, or reorder text, image, and
 * registered-video beats without changing the App shell.
 */
export const startupSequence: StartupBeat[] = [
  {
    id: "startup.wrong-door",
    kind: "image",
    eyebrow: "An impossible crossover",
    title: "Everybody got the same invitation.",
    body: "Build a Lineup. Pick a fight. Do not ask how any of this works.",
    imageAssetId: "image.story.first-run",
    imageAlt: "Six incompatible fighters called to the same tournament.",
    durationMs: 2_600,
  },
];
