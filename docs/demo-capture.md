# Gameplay demo capture

This document describes the reproducible real-game capture pipeline used for
product evidence, demonstrations, and social sharing. It depends on the
player-facing flow in [Game design](game-design.md) and the browser architecture
in [Technical design](technical-design.md).

The task records the running application at `1920 × 1080`, follows real Story,
Tournament, and Quick Fight flows, enables music intent in the browser, and
plays the battle through semantic DOM controls. Capture metadata records the
opening, Main Menu, Story, Tournament choice/Roster, fighter selection, Fight
Settings, Review Fight, Battle, and result chapter offsets.

Run it through the pinned toolchain:

```sh
mise run install
mise run demo:capture
```

The install task provisions the pinned Node, pnpm and FFmpeg versions, both
JavaScript dependency sets, Playwright Chromium, and Remotion's Headless Chrome.

The task starts a local Vite server when one is not already available. Set
`FIGHTER_DEMO_URL` to reuse another local server, or set
`FIGHTER_DEMO_BATTLE_MS` to change the default 42-second battle window.

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

This stages the ignored capture and the soundtrack choices recorded in its
metadata under `video/public/generated/`. The local project typefaces are
compiled into the Remotion bundle through Fontsource. The current showcase uses
hard-cut chapter cards, clean full-frame footage, and narrow protected caption
bands. Large copy never sits over active controls, Move cut-ins, or the result.
FFmpeg then normalises the rendered mix for social playback.

The task refuses captures shorter than 50 seconds so every authored trailer
chapter has real source footage, including the final Victory hold.

The final delivery is
`output/video/loftwah-fighter-showcase-1080p.mp4`. The editable source lives in
`video/src/Composition.tsx` and `video/src/showcase/`; the staged media and
rendered video remain ignored.
Run `mise run video:check` to lint and type-check the video project independently.
For audio-only iteration after a successful render, set
`FIGHTER_TRAILER_REUSE_RENDER=1` when running `mise run demo:trailer`.
