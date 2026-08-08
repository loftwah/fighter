# LOFTWAH FIGHTER video

This isolated Remotion project owns editable promotional compositions. It does
not replace the authentic application capture or introduce video-only gameplay.

From the repository root:

```sh
mise run install
mise run demo:capture
mise run demo:trailer
```

The showcase task stages the latest ignored gameplay capture and its exact
recorded soundtrack choices. League Gothic and Atkinson Hyperlegible are
compiled into the composition through their local Fontsource packages. The task
then renders and loudness-normalises a `1920 × 1080`, H.264/AAC MP4 at
`output/video/loftwah-fighter-showcase-1080p.mp4`.

`LoftwahFighterShowcase` is the current human-language edit. It uses dedicated
chapter cards, clean full-frame gameplay, and protected caption bands rather
than placing large promotional copy over active controls or Move presentation.
The earlier `LoftwahFighterTrailer` composition remains available as retained
editing history.

For an interactive edit preview, first run `mise run demo:trailer` so the ignored
staged assets exist, then run:

```sh
cd video
mise exec -- pnpm dev
```

Run `mise run video:check` from the repository root after changing the
composition. Keep staged media under `video/public/generated/` and renders under
`video/out/`; both locations are ignored.
