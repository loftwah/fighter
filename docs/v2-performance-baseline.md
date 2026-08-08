# V2 performance baseline

Status: **LOCAL PRODUCTION-PREVIEW EVIDENCE — PHYSICAL DEVICE OPEN**

Measured: 2026-08-09

## Reproduce

Run:

```sh
mise run performance:audit
```

The command builds production, starts a temporary Vite preview on an ephemeral
localhost port, opens a fresh cache-disabled Chromium context at `390 × 844`,
and emits the navigation/resource measurements as JSON. It fails if the cold
intro exceeds 1,000,000 encoded bytes or requests Phaser, audio, Story art,
Tournament art, or both intro orientations. It then enters Main Menu and proves
the deferred Story and Tournament art still load where they are visible.

The 1 MB ceiling is a CI regression guard, not the final physical-device budget.
`width × height × 4` is a decoded RGBA estimate, not measured GPU residency.

## Before and after

| Cold `390 × 844` intro           |                    Before |               After |                   Change |
| -------------------------------- | ------------------------: | ------------------: | -----------------------: |
| Encoded transfer                 |               2,591,025 B |           854,741 B |    −1,736,284 B / −67.0% |
| Intro images requested           |      Portrait + landscape |       Portrait only | One orientation deferred |
| Story/Tournament images          |            Both requested |   Neither requested | Deferred until Main Menu |
| Approximate decoded startup PNGs | 20.2 MiB across four PNGs | 5.0 MiB for one PNG |               About −75% |

The automated after observation comprised the document, initial application
JavaScript and CSS, portrait intro PNG, and two fonts. Phaser and audio remained
absent. Entering Main Menu then requested `story.png` and `tournament.png`, so
the reduction does not remove visible launcher art or weaken the fallback path.

## Still open

- Physical iPhone 14 time to interactive, frame pacing, decoded memory, thermal,
  background/resume, and representative 20-minute session evidence.
- Physical 16-inch 2024 MacBook Pro confirmation.
- First-battle decoded-memory reduction. The existing production observation
  shows encounter-specific loading, but its large opaque battle PNGs remain the
  next measured optimisation target.
