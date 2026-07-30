# Untitled crossover battler

This is a local-first, real-time team fighter prototype built around an absurd,
extensible crossover roster. Collect duplicate Characters, arrange a
three-Character Lineup, spend two persistent team Charge Strips, switch active
Characters, and clear authored story or tournament fights. `Riot Relics`
survives only as a development codename in migration-safe storage identifiers.

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
  one-time champion badge;
- owned-instance combat builds with free stat reallocation, Move ordering,
  matching-copy Move enhancement, exact participant XP, four equipable
  Modifications, atomic store purchases, deterministic battle reports, and
  durable corrupt-save recovery;
- generated opaque framed-shot artwork for the first arena, story, tournament,
  store, and legacy prototype fighters, plus procedural opaque fallback panels
  for the accepted six-Character launch roster, with
  metadata-aware masking, cropping, crossfades, and panel choreography;
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
- `public/assets/audio/` — silent SFX/dialogue placeholders
- `public/music/` — supplied soundtrack with stable filenames
- `music/` — user-supplied soundtrack sources; sync with `mise run assets:music`
- `docs/game-design.md` — authoritative game design
- `docs/technical-design.md` — architecture and system boundaries
- `docs/teeny-titans-functional-audit.md` — reference-game screen and mode audit
- `docs/teeny-titans-battle-parity.md` — source-backed combat capability matrix
- `docs/view-inventory.md` — authoritative map of global and per-mode views
- `docs/implementation-plan.md` — staged delivery plan and remaining scope

`PRODUCT.md` records the product contract and `DESIGN.md` records the final
visual system once the finish review is complete.
