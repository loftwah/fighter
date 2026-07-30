export type MusicRole =
  "general" | "main" | "battle" | "wandering" | "character";

export interface MusicTrack {
  id: string;
  title: string;
  path: string;
  role: MusicRole;
  characterId?: string;
}

export const musicTracks: MusicTrack[] = [
  {
    id: "music.main-theme",
    title: "Pocket-Sized Chaos",
    path: "/music/main-theme-pocket-sized-chaos.mp3",
    role: "main",
  },
  {
    id: "music.wandering-around",
    title: "Wandering Around",
    path: "/music/wandering-around.mp3",
    role: "wandering",
  },
  {
    id: "music.battle-1",
    title: "Tiny Trouble",
    path: "/music/battle-1-tiny-trouble.mp3",
    role: "battle",
  },
  {
    id: "music.battle-2",
    title: "Bar's Almost Full",
    path: "/music/battle-2-bars-almost-full.mp3",
    role: "battle",
  },
  {
    id: "music.battle-3",
    title: "Final Round Freakout",
    path: "/music/battle-3-final-round-freakout.mp3",
    role: "battle",
  },
  {
    id: "music.character.tux",
    title: "Root Access",
    path: "/music/tux-root-access.mp3",
    role: "character",
    characterId: "character.tux",
  },
  {
    id: "music.character.humpty",
    title: "Cracked But Dangerous",
    path: "/music/humpty-dumpty-cracked-but-dangerous.mp3",
    role: "character",
    characterId: "character.humpty",
  },
  {
    id: "music.character.moses",
    title: "Part the Dancefloor",
    path: "/music/moses-part-the-dancefloor.mp3",
    role: "character",
    characterId: "character.moses",
  },
  {
    id: "music.character.viking",
    title: "Small Axe, Big Problem",
    path: "/music/viking-small-axe-big-problem.mp3",
    role: "character",
    characterId: "character.viking",
  },
  {
    id: "music.character.ned-kelly",
    title: "Iron Head",
    path: "/music/ned-kelly-iron-head.mp3",
    role: "character",
    characterId: "character.ned-kelly",
  },
  {
    id: "music.character.grim-reaper",
    title: "Clocked Out",
    path: "/music/grim-reaper-clocked-out.mp3",
    role: "character",
    characterId: "character.grim-reaper",
  },
  {
    id: "music.cant-tell",
    title: "Can't Tell",
    path: "/music/cant-tell.mp3",
    role: "general",
  },
  {
    id: "music.mirrors",
    title: "Mirrors",
    path: "/music/mirrors.mp3",
    role: "general",
  },
  {
    id: "music.no-control",
    title: "No Control",
    path: "/music/no-control.mp3",
    role: "general",
  },
  {
    id: "music.obsessed",
    title: "Obsessed",
    path: "/music/obsessed.mp3",
    role: "general",
  },
  {
    id: "music.red-thread",
    title: "Red Thread",
    path: "/music/red-thread.mp3",
    role: "general",
  },
  {
    id: "music.soft-static-halo",
    title: "Soft Static Halo",
    path: "/music/soft-static-halo.mp3",
    role: "general",
  },
  {
    id: "music.weather-outside",
    title: "Weather Outside",
    path: "/music/weather-outside.mp3",
    role: "general",
  },
];

export const silentAudio = {
  sfx: "/assets/audio/sfx/silence.wav",
  dialogue: "/assets/audio/dialogue/silence.wav",
} as const;

export const audioAssets: Record<
  string,
  { id: string; category: "sfx" | "dialogue"; path: string }
> = Object.fromEntries(
  [
    "sfx.action.quick",
    "sfx.action.control",
    "sfx.action.finisher",
    "sfx.action.guard",
    "sfx.action.heal",
  ].map((id) => [id, { id, category: "sfx" as const, path: silentAudio.sfx }]),
);

export function resolveAudioPath(
  id: string,
  category: "sfx" | "dialogue",
): string {
  return audioAssets[id]?.path ?? silentAudio[category];
}

export function findMusic(id: string): MusicTrack {
  return (
    musicTracks.find((track) => track.id === id) ??
    musicTracks.find((track) => track.id === "music.main-theme") ??
    musicTracks[0]!
  );
}
