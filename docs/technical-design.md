# Technical design

## Runtime

- Node.js 22
- pnpm 11
- TypeScript
- Vite
- Phaser 3
- Vitest
- ESLint and Prettier
- `mise` as the only documented command entry

## Application boundary

The application is a desktop-first responsive web game. It opens on a global
launcher and only constructs a Story, Quick Fight, or Tournament view context
after an explicit player action. Semantic DOM renders contextual navigation,
profile/settings surfaces, story copy, roster controls, action buttons, and
accessibility state. Phaser renders the arena, Kinetic Print imagery, two-frame
swaps, camera motion, particles, impact effects, and cut-ins.

The DOM and Phaser layers share a controller. They do not share mutable view state directly.

```text
content definitions
       ↓
pure domain engine ──→ semantic events ──→ Phaser presentation
       │                         └───────→ DOM status/a11y
       ↓
battle report ──→ rewards, missions, progression, autosave
```

## Module rules

```text
src/
├── app/           DOM application shell and screen routing
├── assets/        stable logical asset registries
├── audio/         music/SFX/dialogue resolution and settings
├── combat/        deterministic battle types, reducers, calculations, AI
├── content/       authored definitions and validation
├── dev/           development-only scenario definitions and lab helpers
├── economy/       rewards and currency
├── game/          Phaser scenes and event presentation
├── missions/      generic mission evaluation
├── persistence/   preferences, save slots, schema
├── progression/   XP, levels, allocation, tiers, Patches
├── story/         authored encounter configuration and node progression
├── store/         rotation, purchase, sale
├── tournaments/   run state and interstitials
└── ui/            semantic components/helpers
```

`combat`, `economy`, `missions`, `progression`, `story`, `store`, and
`tournaments` must not import Phaser, browser globals, wall-clock time, or
unseeded randomness.

## Determinism

- Domain transitions accept explicit `nowMs`, `deltaMs`, and seeded RNG state.
- The simulation uses fixed logical steps where replay accuracy matters.
- Random calls are ordered and documented.
- A battle report records seed, initial content IDs, player decisions, major events, and outcome.
- Reports also retain exact participant instance IDs, levels, Move order, and
  equipped Patch IDs so rewards and missions never have to infer a build from
  display names.
- Difficulty changes made during a live fight are appended to the report with
  elapsed time and both values; the initial difficulty remains immutable.
- Presentation timing may interpolate but cannot decide gameplay.

## Combat API

Core commands:

```ts
createBattle(input): BattleState
tickBattle(state, deltaMs): Transition
requestAction(state, side, actionId): Transition
requestSwitch(state, side, characterId): Transition
forfeitBattle(state, side): Transition
chooseAiCommand(state, difficulty): BattleCommand | null
```

The application controller assigns `human` or `ai` ownership per side outside
the domain engine. The engine command API remains side-agnostic. Pausing is
also an application/runtime concern: a paused controller does not call
`tickBattle` or AI selection, and pauses Phaser scene time without modifying the
deterministic battle state.

Every transition returns a new state plus semantic events. Events include:

```text
battleStarted, barChanged, characterSwitched, actionStarted,
actionCharged, actionInterrupted, damageApplied, healingApplied,
statusApplied, statusRemoved, characterDodged, criticalHit,
characterDefeated, battleEnded
```

## Content

Authored content is TypeScript data validated by Zod during development and tests. Stable IDs are namespaced strings. Display names are never used as foreign keys.

Adding content should require:

1. a definition;
2. referenced registered assets;
3. validation;
4. optionally an authored balance test.

No new Phaser scene is required for a new story, tournament, Relic, or Move.

Development scenarios follow the same data rule. `src/dev/` owns validated
scenario definitions made only from stable content IDs and explicit starting
state. Launching a development scenario creates a non-progressing battle report
with mode `dev`; debug state changes are labelled in the report and cannot flow
into rewards, missions, Story, or tournament persistence.

## Persistence

- Preferences key: `riot-relics.preferences.v1`
- Save index key: `riot-relics.save-index.v1`
- Slot keys: `riot-relics.save.v2.<slot>`
- Legacy `riot-relics.save.v1.<slot>` snapshots migrate once into v2 and
  remain preserved for rollback.
- Preferences and progression are separate.
- Writes use a complete validated snapshot.
- Owned Relic entries persist level/XP, stat allocations, Move order/tiers, and
  one optional equipped Patch ID. Older v2 entries receive compatible defaults
  during validation.
- Save slots persist the active Cheap Seats round, locked instance/build
  snapshot, exact Case health ratios, ending active instance, selected
  interlude drop, pending opening-Charge bonus, champion badges, and revealed
  rivals. A loss clears the run snapshot so retry starts at Round 1. Older v2
  entries receive empty compatible defaults.
- Corrupt data falls back safely and is surfaced to the player; it is not silently overwritten before export/debug information is offered.
- Accepting safe defaults writes only the affected validated document, retains
  the preserved corrupt backup, and does not repeat the warning on reload.

## Audio

Logical IDs resolve through a registry:

```text
logical ID → approved/custom asset → silent category placeholder
```

Music is copied into Vite’s public directory at setup time and registered by stable ID. Browser autoplay rules require the first user gesture before playback. Settings expose independent music, SFX, and dialogue volume/mute.

## Asset fallback

```text
approved specific asset
→ character fallback
→ template fallback
→ generic Kinetic Print placeholder
```

Missing art must not crash a scene. Approved generated assets are never overwritten silently.

## Responsive model

- Design target: 16:9 desktop, with a central safe canvas and side rails.
- Wide screens may expand information rails; the arena maintains a controlled aspect.
- Narrow layouts stack roster rails around the arena and keep actions reachable.
- A portrait-specific battle composition remains a future decision.
- CSS safe-area variables are supported even before mobile packaging.

## Testing

- Calculation unit tests: costs, multipliers, class wheel, tiers, seeded variance.
- Reducer tests: bar fill, action execution, switching, interruption, defeat, timeout.
- AI tests: never selects unavailable actions; difficulty remains valid.
- Mission/reward/store/save tests.
- Content registry validation.
- Build and typecheck.
- Browser smoke flow: new save → gated story → battle → store/missions →
  qualifier → three-round Cup/interludes → ending reward → persisted state.
- Browser control regression: a Move control keeps identity and keyboard focus
  while Charge changes, Escape pauses/resumes the simulation, and the
  development inspector cannot advance progression.

## Deployment boundary

This stage builds a static web bundle and requires no backend. Cloudflare Workers/Pages, PWA support, telemetry, cloud saves, and Capacitor are future ADRs.
