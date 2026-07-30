# Application and screen structure audit

Status: completed architecture review and refactor baseline.

This audit answers two separate questions:

1. Do the accepted screens form a coherent product?
2. Can the codebase add and change those screens without turning the
   application controller into the interface?

The answer is now yes, with the explicitly planned product gaps listed below.

## Screen model

The product has four presentation scopes:

| Scope            | Screens and substates                                                                                           | Persistent owner                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Entry and global | Intro/Splash, honest Loading, Main Menu, Profile/Saves, Settings, Achievements, storage recovery, Developer Lab | global Preferences plus selected profile |
| Story            | Story Home, Character Selection, Collection/Lore, Store, Missions, Story Tournament, ending                     | selected SaveData                        |
| Standalone modes | Quick Fight setup and standalone Tournament lobby/interludes                                                    | session draft or tournament run          |
| Match            | shared Battle, countdown, pause, development inspector, victory/defeat result                                   | seeded BattleState and BattleReport      |

This avoids creating a separate battle implementation per mode. Story, Quick
Fight, Tournament, and development scenarios construct a match; the same
combat engine, battle screen, pause behaviour, and report handle it.

## Screen-by-screen decisions

| Requested surface         | Decision and current status                                                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intro / Splash hook       | Implemented as ordered data. A beat can be text, a registered image, or registered video. It is not a route and can be skipped.                                                  |
| Loading / waiting         | Implemented for startup and honest battle construction. It never fakes indefinite progress.                                                                                      |
| Main Menu                 | Implemented as the explicit mode launcher. Merely rendering it starts no mode or music.                                                                                          |
| Settings                  | Implemented globally. Difficulty preference, reduced motion, and independent music/SFX/dialogue controls are not copied into profiles.                                           |
| Profile / saves           | Implemented with three local profiles, identity, record summary, and export. Profile progression is separate from global preferences.                                            |
| Developer page            | Implemented only in development builds. Presets and custom fights are deterministic and cannot award or mutate progression.                                                      |
| Quick Fight               | Implemented for one-to-three Relics per side using Standard Builds and global difficulty. Custom rules and Accessories remain planned.                                           |
| Tournament                | Implemented as a separate persisted Case with Standard Builds, carried health, interludes, and results. Story can orchestrate the same tournament rules with Story-owned builds. |
| Story Mode                | Implemented as a progression orchestrator around shared screens and combat.                                                                                                      |
| Story Shop                | Implemented and Story-gated.                                                                                                                                                     |
| Character points/upgrades | Data persistence and battle consumption are present. Direct allocation, reorder, and tier-up UI remains partial.                                                                 |
| Modifications             | Per-Relic reusable Patches are implemented. Shared team Accessories remain planned.                                                                                              |
| Collection and lore       | Implemented with revealed/locked lore and independent owned copies.                                                                                                              |
| Achievements              | Implemented as derived profile facts, avoiding duplicated persisted state.                                                                                                       |
| Pause Menu                | Implemented as a blocking battle overlay. It freezes simulation and player/AI commands while retaining the match.                                                                |
| Character selection       | Story confirmation and Quick 1–3 selection are implemented with the visible class wheel. Fully editable Story selection is partial.                                              |
| Accessory selection       | Planned. It should be one reusable setup component governed by mode policy, not three bespoke screens.                                                                           |
| Main game                 | Implemented as one shared battle route with DOM controls and a Phaser arena adapter.                                                                                             |
| Victory / Defeat          | Implemented as two verdicts over one shared result/report model. They are battle substates, not duplicate screens.                                                               |

## Architecture changes made

The earlier product model was sound, but presentation ownership was not.
`App.ts` contained routing, persistence, orchestration, and nearly every screen's
HTML, while one 5,923-line stylesheet mixed every generation of the interface.

The refactor established:

- an exhaustive typed route/session manifest in `src/app/routes.ts`;
- pure screen renderers under `src/ui/screens/`;
- reusable semantic fragments under `src/ui/components/`;
- global and Story chrome under `src/ui/shell/`;
- authored story panel content under `src/story/`;
- ordered purpose-named stylesheet modules under `src/ui/styles/`;
- enforced domain/Phaser and UI/controller import boundaries in ESLint;
- route completeness and renderer contract tests.

`App` remains the composition root. It owns browser events, navigation,
storage writes, downloads, mode transitions, audio intent, and the live battle
session. It no longer owns ordinary screen markup.

## Current directory contract

```text
src/
├── app/
│   ├── App.ts                 composition root and live battle session
│   ├── routes.ts              route/session/shell manifest
│   └── routes.test.ts
├── combat/                    framework-free deterministic rules
├── content/                   validated authored data
├── game/                      Phaser adapter and presentation
├── persistence/              Preferences and SaveData schemas
├── story/                     story progression and authored panels
├── tournaments/               tournament run orchestration
└── ui/
    ├── components/            reusable semantic fragments
    ├── screens/               pure route/full-screen renderers
    ├── shell/                 navigation and app chrome
    └── styles/                ordered cascade modules
```

Mode-specific rules belong in their domain/orchestration folder. Reusable
selection controls belong in `ui/components`; mode policy is passed into them.
Content additions stay as data. A new character, Move, story node, mission,
offer, or tournament round must not add an `App` branch or Phaser renderer.

## Remaining product work

These are understood gaps, not missing architecture:

1. Define the team Accessory domain contract and reusable selection component.
2. Finish editable Story selection, point allocation, Move reorder, and tier-up
   controls.
3. Add optional custom match rules to Quick Fight and standalone Tournament
   without weakening their Standard Build defaults.
4. Extract the live battle-session controller from `App` after those match
   configuration contracts settle. Doing it now would only move unstable
   orchestration into another large class.

## Verification and audit disposition

- The full `mise run check` quality gate passes, including 81 tests, content
  validation, type checking, lint, formatting, and production build.
- A real-browser smoke pass verified Intro → Main Menu → Settings → Quick Fight
  setup → countdown → active battle → blocking Pause → Developer Lab.
- The battle timer and Charge remain unchanged while paused, and the same flow
  remains operable at a 390 × 844 viewport.
- The interface detector's hard-edge/side-border warnings are intentionally not
  applied: they conflict with `DESIGN.md`'s registered print borders and would
  erase the approved visual language. Its off-ramp font-size and literal-colour
  advisories are accepted visual-system consolidation work, not screen
  architecture defects.
- The production build still reports Phaser's dynamically loaded game chunk
  above Vite's generic 500 kB warning threshold. Phaser is already kept out of
  the launcher bundle; further engine chunk work is a performance task rather
  than a screen-ownership change.

## Acceptance rules for future screens

A screen is complete only when:

- its route or battle substate is declared and owned;
- it has one primary job and clear exits;
- its state owner and persistence lifetime are explicit;
- the renderer is pure and consumes an explicit model;
- commands return to the application controller through semantic DOM controls;
- keyboard, touch size, labels, focus, and reduced motion are covered;
- tests prove route availability and the renderer's minimum contract;
- visual rules extend the correct style module rather than adding a late global
  override.
