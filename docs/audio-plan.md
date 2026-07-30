# Audio plan

## Current stage

The eighteen supplied MP3 files are the only non-silent audio. They form one
inclusive curated pool: a track's role changes its selection weight without
preventing it from appearing in another context.

```text
main/global screens → strongly favour the main theme
between-fight screens → strongly favour Wandering Around
battle → favour Battle 1–3 and themes belonging to present Characters
all contexts → retain a positive chance for every registered track
```

Selection is seeded, reproducible for the same inputs, and excludes the current
track when alternatives exist. The selected track loops until the context
changes. Music never starts or resumes if the player has turned playback off.

Run `mise run assets:music` after changing the source catalogue. The task copies
the Unicode source names in `music/` to stable ASCII paths in `public/music/`
without rewriting unchanged files.

SFX and dialogue logical assets resolve through independent runtime channels to
short silent WAV files. Action events already call the SFX channel; dialogue
has the same category-aware playback contract ready for authored lines. This
lets integration, volume controls, and asset replacement work without
ElevenLabs credentials or spend.

## Music IDs

```text
music.main-theme
music.wandering-around
music.battle-1
music.battle-2
music.battle-3
music.character.tux
music.character.humpty
music.character.moses
music.character.viking
music.character.ned-kelly
music.character.grim-reaper
music.cant-tell
music.mirrors
music.no-control
music.obsessed
music.red-thread
music.soft-static-halo
music.weather-outside
```

## Future ElevenLabs contract

Dialogue metadata will include stable ID, character ID, text, subtitle, voice ID, emotion, energy, pace, pronunciation notes, candidate files, approval status, and output path.

SFX metadata will include stable ID, description, duration target, loop behavior, direction, candidate files, approval status, loudness target, and output path.

Safety rules:

- no API call in install, build, test, dev, or validation;
- explicit generation command only;
- dry-run manifest before billable work;
- per-run item and cost caps;
- never overwrite approved output;
- credentials only through ignored environment files;
- trim, normalise, and validate after generation;
- preserve silent fallback files.
