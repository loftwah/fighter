# Riot Relics

Riot Relics is a local-first, real-time team fighter prototype built from the
project conversation and walkthrough brief. Collect duplicate fighters
(`Relics`), arrange a three-character `Lineup`, spend two persistent team
Charge bars, switch active fighters, and clear authored story or tournament
exhibitions.

The current vertical slice includes:

- an explicit Main Menu with separately startable Story Mode, Quick Fight, and
  standalone Tournament sessions;
- a playable seeded battle engine with class matchups, charge-up attacks,
  interruptions, statuses, dodges, critical hits, switching, AI, and a
  90-second timer;
- Story-scoped Lineup, Collection, Store, and Missions views; sandbox Quick
  Fight setup; standalone Tournament; separate Profile and Settings views; and
  three local Collector profiles;
- a complete persisted First Run path through nodes `00`–`07`, including the
  Backroom Counter reveal, mission-board unlock, two authored story fights,
  ending reward, and rival reveal;
- a three-round Cheap Seats Cup with carried Case health, revive/heal/Charge
  interludes, a roster/build snapshot, loss-to-Round-1 reset, exact round
  reports, repeatable completion purse, and one-time champion badge;
- owned-instance combat builds, exact participant XP, four equipable Patches,
  atomic store purchases, deterministic battle reports, and durable corrupt-save
  recovery;
- generated Kinetic Print artwork for the first arena, story, tournament,
  store, all six initial fighters, Mara Move cut-ins, and reactions;
- the supplied music catalogue, with valid silent WAV placeholders for sound
  effects and dialogue until ElevenLabs production is connected;
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
- `src/app/` — semantic application shell and navigation
- `src/game/` — Phaser battle presentation
- `src/persistence/` — validated versioned local profiles and preferences
- `src/progression/` — levels, owned-instance loadouts, and Patch effects
- `src/store/` — deterministic rotation and atomic purchases
- `src/story/` — authored First Run encounter configuration and progression
- `src/tournament/` — Cheap Seats round, Case-health, and interlude domain
- `public/assets/generated/` — approved first-slice artwork
- `public/assets/audio/` — silent SFX/dialogue placeholders
- `public/music/` — supplied soundtrack with stable filenames
- `docs/game-design.md` — authoritative game design
- `docs/technical-design.md` — architecture and system boundaries
- `docs/view-inventory.md` — authoritative map of global and per-mode views
- `docs/implementation-plan.md` — staged delivery plan and remaining scope

`PRODUCT.md` records the product contract and `DESIGN.md` records the final
visual system once the finish review is complete.
