# LOFTWAH FIGHTER

**LOFTWAH FIGHTER** is a local-first, real-time squad battler for the browser.
Collect Characters, arrange a one-to-three-Character Lineup, read both teams'
Charge Strips, commit a Move at the right moment, and clear authored Story or
Tournament fights. The repository remains `loftwah/fighter`; the canonical
public home is `fighter.loftwah.com`, and the first intended release is V2.

- [Documentation hub](docs/README.md)
- [V2 release specification](docs/v2-release-spec.md)
- [Release roadmap](docs/release-roadmap.md)
- [Long-term platform direction](docs/platform-direction.md)
- [V2 source and archive ledger](docs/v2-source-ledger.md)
- [Brand, domain, landing page, and promotional art](docs/brand-and-site.md)

The current vertical slice includes:

- an explicit Main Menu with separately startable Story Mode, Quick Fight, and
  standalone Tournament sessions;
- a playable seeded battle engine with Combat Type matchups, Team Trait
  synergies, smooth Charge strips, a `3 → 2 → 1 → FIGHT` lockout, charge-up
  attacks, cinematic simulation pauses, interactive battle pickups,
  Accessories, interruptions, statuses, dodges, critical hits, switching, AI,
  and a 90-second timer;
- Story-scoped Lineup, Collection, Store, and Missions views; sandbox Quick
  Fight setup; standalone Tournament; separate Profile and Settings views; and
  three local Player profiles;
- a complete persisted First Run path through nodes `00`–`07`, including the
  Backroom Counter reveal, mission-board unlock, two authored story fights,
  ending reward, and rival reveal;
- a three-round Wrong Door Cup with a six-Character Roster, one-to-three
  Character deployment, an explicit starter, reserve XP, carried Tournament
  Roster health, revive/heal/Charge interludes, a roster/build snapshot,
  loss-to-Round-1 reset, exact round reports, repeatable completion purse, and
  one-time illustrated Wrong Door Cup Trophy displayed in the Profile Trophy
  cabinet;
- a First Run completion contract requiring all three Missions and the Wrong
  Door Cup Trophy, after which Quick Fight is the unrestricted end-game
  sandbox;
- owned-instance combat builds with free stat reallocation, Move ordering,
  matching-copy Move enhancement, exact participant XP, four equipable
  Modifications, atomic store purchases, deterministic battle reports, and
  durable corrupt-save recovery;
- a complete opaque framed-shot art package for all six launch Characters:
  canonical and two-frame idle plates, six-state reactions, all eighteen
  character-specific Move cut-ins, matching arena/story/tournament scenes, and
  responsive intro ensembles, with metadata-aware masking, cropping,
  crossfades, and panel choreography;
- all eighteen supplied tracks in one seeded, purpose-aware soundtrack with
  weighted main, wandering, battle, and Character-theme moments, plus valid
  silent WAV placeholders for sound effects and dialogue until ElevenLabs
  production is connected;
- responsive desktop/mobile UI and reduced-motion/audio preferences.

## Runtime

The project pins Node 22 and pnpm 11.17.0 through
[mise](https://mise.jdx.dev/).

```sh
mise install
mise run install
mise run dev
```

Vite serves the game at the URL shown in the terminal, normally
`http://127.0.0.1:4173`.

## Quality gate

```sh
mise run check
```

This runs formatting, ESLint, strict TypeScript, domain tests, authored-content
validation, and a production build.

`.github/workflows/check.yml` runs the same pinned `mise` gate for pull
requests, `main`, and manual release-candidate checks, then retains the exact
`dist/` build as a short-lived GitHub Actions artefact. Accepted version tags
and GitHub Releases are created only at an approved release gate.

## Project map

- `src/combat/` — pure deterministic combat domain and rules
- `src/content/` — typed authored characters, actions, story, and missions
- `src/app/` — application controller and typed route/session manifest
- `src/game/` — Phaser battle presentation and opaque framed-shot choreography
- `src/persistence/` — validated versioned local profiles and preferences
- `src/progression/` — levels, owned-instance loadouts, and Modification effects
- `src/store/` — deterministic rotation and atomic purchases
- `src/story/` — authored First Run encounter configuration and progression
- `src/tournaments/` — tournament rounds, carried-health, and interlude domain
- `src/ui/` — pure semantic screen renderers, shell, components, and ordered styles
- `public/assets/generated/` — approved first-slice artwork
- `.impeccable/review/visual-direction-v2/production-sources/` — reviewed
  launch-art sources; build them with `mise run assets:launch-roster`
- `.impeccable/review/visual-direction-v2/trophy-sources/` — reviewed Trophy
  sources; build them with `mise run assets:trophies`
- `public/assets/audio/` — silent SFX/dialogue placeholders
- `public/music/` — supplied soundtrack with stable filenames
- `music/` — user-supplied soundtrack sources; sync with `mise run assets:music`
- `docs/game-design.md` — authoritative game design
- `docs/technical-design.md` — architecture and system boundaries
- `docs/reference-game-functional-audit.md` — reference-game screen and mode audit
- `docs/reference-game-battle-parity.md` — source-backed combat capability matrix
- `docs/view-inventory.md` — authoritative map of global and per-mode views
- `docs/implementation-plan.md` — archived pre-V2 delivery history

`PRODUCT.md` records the product contract and `DESIGN.md` records the final
visual system once the finish review is complete.
