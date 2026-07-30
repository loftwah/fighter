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

The application is a desktop-first responsive web game. It can render a
data-driven, skippable startup sequence and genuine waiting state before opening
the global launcher. It only constructs a Story, Quick Fight, or Tournament
view context after an explicit player action. Semantic DOM renders contextual navigation,
profile/settings surfaces, story copy, roster controls, action buttons, and
accessibility state. Phaser renders the arena, Kinetic Print imagery, two-frame
swaps, camera motion, particles, impact effects, and cut-ins.

The DOM and Phaser layers share the battle-session controller in `app/App.ts`.
They do not share mutable view state directly. Outside a live fight, screen
renderers are pure functions of explicit view models and do not import the
application controller.

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
├── app/           application controller and typed route/session manifest
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
└── ui/
    ├── components/ reusable semantic markup
    ├── screens/    pure full-screen renderers
    ├── shell/      global and Story navigation chrome
    └── styles/     ordered, purpose-named cascade modules
```

`combat`, `economy`, `missions`, `progression`, `story`, `store`, and
`tournaments` must not import Phaser, browser globals, wall-clock time, or
unseeded randomness.

ESLint enforces the Phaser/import side of this boundary for domain modules and
prevents `ui/` from importing Phaser or the application controller.

## Screen and state ownership

`src/app/routes.ts` is the exhaustive route manifest. Every route declares its
screen family, allowed session contexts, and shell behaviour. Mode-specific
tool visibility derives from the current session and route family. Navigation
gates derive from the same data; a new route is not complete until the manifest
and its tests cover it.

```text
startup content ──→ startup renderer
route manifest ───→ app shell ──→ screen renderer(view model)
                                  │
                                  └── data-command / data-route
                                                ↓
                                     App controller mutation
```

Screen renderers may read domain/content selectors and persistence types. They
must not write storage, start timers, attach listeners, instantiate Phaser, or
import `App`. `App` owns navigation, event delegation, preference/save writes,
mode orchestration, downloads, and the live battle session. `game/` owns Phaser
adapters and consumes semantic battle state/events.

State has one owner:

| State                                                  | Owner                     | Lifetime                                |
| ------------------------------------------------------ | ------------------------- | --------------------------------------- |
| Audio, difficulty preference, reduced motion           | global Preferences        | all profiles                            |
| Identity, collection, Story, missions, store, upgrades | selected SaveData profile | persisted profile                       |
| Quick Fight setup                                      | Quick session             | until leaving/reconfiguring Quick Fight |
| Tournament Case and carried health                     | tournament run            | persisted until the run resolves/resets |
| Seeded combat and report                               | battle engine/session     | one match                               |
| Pause, countdown, presentation lock, open overlays     | battle-session controller | one mounted battle                      |

Victory and defeat are result states over the same battle route and shared
report model, not separate combat implementations. Pause and the development
inspector are blocking overlays over that route, not navigation destinations.

The stylesheet entry point contains imports only. Ordered style modules preserve
the intentional cascade while separating foundations, progression screens,
battle layers, responsive rules, development tools, mode setup, and entry
states.

## Session and match composition

Story, Quick Fight, and Tournament are orchestration contexts around one combat
engine, not separate battle implementations.

```text
Profile ──→ Mode Session ──→ Match Configuration ──→ Battle
                                      │                  │
                                      └─ rules/builds    └─ Battle Report
                                                              │
                                                              ▼
                                                    mode-owned consequences
```

A match configuration owns Lineups, Combatant Builds, difficulty, deterministic
seed, optional authored rules, and presentation identity. Global Settings supply
accessibility/audio and a preferred difficulty; the mode may constrain the match
without copying settings state.

`src/combat/standard-build.ts` is the single Standard Build constructor for
non-Story defaults. Quick Fight and standalone Tournament must call it instead
of inferring builds from authored character levels or the active Story profile.
Story encounters continue to use owned builds or explicit loan builds.

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
the domain engine. The engine command API remains side-agnostic. Pausing,
pre-fight countdown, and presentation locks are application/runtime concerns:
while any is active, the controller does not call `tickBattle` or AI selection.
User pause also pauses Phaser scene time; countdown and presentation locks keep
Phaser running so their authored motion can complete without modifying the
deterministic battle state.

Presentation-lock durations are fixed from semantic event types in a pure
timing module. Phaser consumes the same events and duration but does not decide
gameplay timing. Reduced motion changes how the interval is rendered, not how
long the combat controller remains locked.

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

`src/content/startup-content.ts` is an ordered union of text, image, and video
beats. Media uses logical asset IDs and content validation; arbitrary HTML is
not startup content. Adding a startup beat does not add an application route.

Achievements are evaluated from the selected validated save by pure progression
code. They are not separately persisted while the source profile facts can
derive them.

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

- Design target: a full-viewport 16:9 desktop stage with edge-pinned controls
  and a safe central action field.
- Wide screens enlarge the fighter stills and breathing room while health,
  Lineups, timer, Pause, and the integrated Move-and-Charge control remain
  attached to the stage edges.
- Portrait battle layouts use an authored asymmetric composition: the opponent
  occupies the upper-right field, the player occupies the lower-left field,
  Lineup portraits remain on the edges, and the Charge control spans the
  reachable lower edge.
- Responsive changes happen in semantic DOM/CSS and `BattleScene.layout()`;
  combat rules and presentation-lock durations do not vary by viewport.
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
