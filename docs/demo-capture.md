# Gameplay demo capture

This document describes the reproducible real-game capture pipeline used for
product evidence, demonstrations, and social sharing. It depends on the
player-facing flow in [Game design](game-design.md) and the browser architecture
in [Technical design](technical-design.md).

The task records the running application at `1920 × 1080`, follows real Story,
Tournament, and Quick Fight flows, enables music intent in the browser, and
plays the battle through semantic DOM controls. Capture metadata records the
opening, Main Menu, Story, Tournament choice/Roster, fighter selection, Fight
Settings, Review Fight, Battle, and result chapter offsets. Tournament evidence
also records its mixed Roster, Settings, and locked deployment states.

Run it through the pinned toolchain:

```sh
mise run install
mise run demo:capture
```

The install task provisions the pinned Node, pnpm and FFmpeg versions, both
JavaScript dependency sets, Playwright Chromium, and Remotion's Headless Chrome.

The task starts a local Vite server when one is not already available. Set
`FIGHTER_DEMO_URL` to reuse another local server, or set
`FIGHTER_DEMO_BATTLE_MS` to change the default 65-second battle window. The
capture fails rather than silently omitting the result when that window expires.

Generated files are ignored working evidence under `output/video/`:

- `raw/loftwah-fighter-gameplay-1080p.webm` is the clean browser recording.
- `loftwah-fighter-gameplay-1080p.mp4` is the H.264/AAC shareable delivery file.
- `loftwah-fighter-gameplay-1080p.json` records dimensions, duration, size,
  soundtrack choices, and any browser console errors.

Playwright video recording does not include browser audio. This is deliberate:
the capture observes every registered MP3 transition requested by the running
game, then FFmpeg mixes those exact files at their recorded request times against
the clean browser recording. Missing menu or battle observations fail the task;
there are no guessed soundtrack fallbacks. FFmpeg writes a fast-start,
`yuv420p` MP4 suitable for common social and messaging platforms. A measured
two-pass mix targets `−16 LUFS` with a `−1.5 dB` true-peak ceiling so the music
remains audible without clipping.

## Branded trailer

The unembellished capture remains the product-evidence source. Render the
separate, editable Remotion trailer after a successful capture:

```sh
mise run demo:trailer
```

This stages the ignored capture under `video/public/generated/` and selects two
deliberate cues from the registered soundtrack: Pocket-Sized Chaos for the
menu/Story/setup movement and Bar's Almost Full for battle. The opening title is
silent and the two cues crossfade once rather than replaying every short route
transition observed during capture. The local project typefaces are compiled
into the Remotion bundle through Fontsource. The current showcase uses hard-cut
chapter cards, clean full-frame footage, and narrow protected caption bands.
Large copy never sits over active controls, Move cut-ins, or the result. Opening
and closing cards name `fighter.loftwah.com`. FFmpeg then normalises the rendered
mix for social playback.

The capture keeps recording for at least 60 seconds and requires a real result.
The render task derives its minimum source duration from the latest authored
trim (currently about 68.3 seconds) and validates every chapter anchor against
the capture metadata, so timing drift fails clearly instead of silently replacing
the final Victory hold with combat or exhausted footage.

The final delivery is
`output/video/loftwah-fighter-showcase-1080p.mp4`. The editable source lives in
`video/src/Composition.tsx` and `video/src/showcase/`; the staged media and
rendered video remain ignored.
Run `mise run video:check` to lint and type-check the video project independently.
For audio-only iteration after a successful render, set
`FIGHTER_TRAILER_REUSE_RENDER=1` when running `mise run demo:trailer`.

## Latest verified output

The 2026-08-09 recapture used the corrected real game at `1920 × 1080` and
reached its result with zero browser console errors. The authentic gameplay
export is 69.48 seconds (`SHA-256
1afb10bfa32f703298d302a60f0a72203b98be19c94650fccf96c1455234aa4d`). The
edited showcase is 50.218 seconds (`SHA-256
d2f425cfa8966bcb440568e286f7ad925fbb63e3f56eb8eb1b4946b8ffb90f78`). Both
are H.264/AAC, `yuv420p`, and 30 frames per second. Battle recalibration moved
the real result chapter to 64.761 seconds; the showcase result source anchor is
therefore frame 1943, leaving more than one second of verified source after the
3.5-second result hold.
