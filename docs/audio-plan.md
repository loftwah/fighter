# Audio plan

## Current stage

The seven supplied MP3 files are the only non-silent audio. They form a single curated pool and can be associated with menu, story, tournament, battle, victory, or characters.

SFX and dialogue logical assets resolve through independent runtime channels to
short silent WAV files. Action events already call the SFX channel; dialogue
has the same category-aware playback contract ready for authored lines. This
lets integration, volume controls, and asset replacement work without
ElevenLabs credentials or spend.

## Music IDs

```text
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
