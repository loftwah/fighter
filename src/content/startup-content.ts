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
    id: "startup.first-print",
    kind: "image",
    eyebrow: "A Riot Relics game",
    title: "Bad toys. Worse paperwork.",
    body: "Build the Lineup. Break the invoice.",
    imageAssetId: "image.story.first-run",
    imageAlt: "The Free Shelf print shop after hours.",
    durationMs: 2_600,
  },
];
