export interface MusicTrack {
  id: string;
  title: string;
  path: string;
}

export const musicTracks: MusicTrack[] = [
  { id: "music.cant-tell", title: "Can't Tell", path: "/music/cant-tell.mp3" },
  { id: "music.mirrors", title: "Mirrors", path: "/music/mirrors.mp3" },
  {
    id: "music.no-control",
    title: "No Control",
    path: "/music/no-control.mp3",
  },
  { id: "music.obsessed", title: "Obsessed", path: "/music/obsessed.mp3" },
  {
    id: "music.red-thread",
    title: "Red Thread",
    path: "/music/red-thread.mp3",
  },
  {
    id: "music.soft-static-halo",
    title: "Soft Static Halo",
    path: "/music/soft-static-halo.mp3",
  },
  {
    id: "music.weather-outside",
    title: "Weather Outside",
    path: "/music/weather-outside.mp3",
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
  return musicTracks.find((track) => track.id === id) ?? musicTracks[0]!;
}
