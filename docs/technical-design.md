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
accessibility state. Phaser renders the arena, kinetic panel imagery, two-frame
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
├── progression/   XP, levels, allocation, tiers, Modifications
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
| Tournament Roster and carried health                   | tournament run            | persisted until the run resolves/resets |
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

A match configuration owns Lineups, Combatant Builds, one optional team
Accessory per side, difficulty, deterministic seed, optional authored rules,
and presentation identity. Global Settings supply accessibility/audio and a
preferred difficulty; the mode may constrain the match without copying settings
state.

`src/combat/standard-build.ts` is the single Standard Build constructor for
non-Story defaults. Quick Fight and standalone Tournament must call it instead
of inferring builds from authored character levels or the active Story profile.
Story encounters continue to use owned builds or explicit loan builds.

`src/progression/builds.ts` owns immutable per-copy build edits: stat
allocation/reclamation, validated three-Move ordering, independent
Low/Centre/High selection inside each occupied band, and matching-duplicate Move
enhancement. UI renderers only emit semantic commands; `App` applies the pure
transition, enforces the active-Tournament lock, persists the result, and
rerenders. Existing v2 saves receive an empty `actionPositions` map as an
explicit additive migration; authored positions remain the fallback.

## Determinism

- Domain transitions accept explicit `nowMs`, `deltaMs`, and seeded RNG state.
- Reports record every accepted simulation delta in order. Replay uses those
  exact deltas rather than inventing a different frame cadence.
- Random calls are ordered and documented. Combat outcomes and battle drops use
  separate deterministic streams derived from the explicit match seed so
  adding or tuning a drop cannot perturb dodge, critical, or status results.
- A battle report records seed, initial content IDs, accepted human and AI
  decisions (including forfeits), major events, and outcome.
- `src/combat/replay.ts` advances the recorded initial snapshot through the
  original simulation deltas, reapplies each timestamped side-agnostic command,
  and verifies the same deterministic state/event stream. Pause/resume metadata
  is harmless because it does not advance simulation time. Reports containing
  unsupported direct Developer Lab state edits are rejected rather than falsely
  presented as authoritative replays.
- Reports also retain exact participant instance IDs, levels, Move order, and
  equipped Modification IDs so rewards and missions never have to infer a build from
  display names.
- Difficulty changes made during a live fight are appended to the report with
  elapsed time and both values; the initial difficulty remains immutable.
- Presentation timing may interpolate but cannot decide gameplay.
- A pending Move captures stable target instance IDs when it commits. Charge
  completion resolves those IDs rather than asking the current UI who is active,
  so switching cannot redirect an already committed Move.

## Combat API

Core commands:

```ts
createBattle(input): BattleState
tickBattle(state, deltaMs): Transition
requestAction(state, side, actionId): Transition
requestSwitch(state, side, characterId): Transition
forfeitBattle(state, side): Transition
requestAccessory(state, side, content): Transition
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
gameplay timing. The calibrated baselines are 2.1 seconds for an instant Move,
1.8 seconds for a charged impact, 1.6 seconds for an Accessory, and 2.6 seconds
for a defeat, with extra time for multiple hits. Reduced motion changes how the
interval is rendered, not how long the combat controller remains locked. A
semantic DOM status names the acting Character and Move throughout the lock.
The AI decision clock is held at the current frame throughout the lock, so the
configured reaction delay starts again when presentation releases instead of
silently elapsing behind the animation.

Periodic health events carry explicit provenance and do not create a new
presentation lock. This prevents damage-over-time and regeneration from
silently stretching simulation time, including when the affected Character is on
the bench. The Phaser layer may show a compact float for an active target
without influencing input timing. A resulting defeat remains a normal blocking
presentation event.

Each Move resolution owns a transient, non-persisted FIFO reaction queue.
Dodge and post-shield damage capture eligible reaction statuses at trigger
time. The queue drains only after all declared hits and effects complete.
Reaction damage uses locked instance IDs, is terminal for damage/dodge
reactions, and can switch either side after deferred defeat emission. This
ordering prevents retroactive grants, truncated multi-hit Moves, and recursive
reflection.

Every transition returns a new state plus semantic events. Events include:

```text
battleStarted, barChanged, accessoryCharged, accessoryActivated,
pickupDropped, pickupCollected, pickupExpired,
characterSwitched, actionStarted,
actionCharged, actionInterrupted, damageApplied, healingApplied,
reactionTriggered, statusApplied, statusRemoved, characterDodged, criticalHit,
characterDefeated, battleEnded
```

`damageApplied` and `healingApplied` may be marked `periodic`; zero-value
regeneration is not emitted.

Reaction events use `actionId` for the triggering Move, `reactionId` for the
Move that granted the reaction status, and `triggerEventId` for the exact
damage/dodge event that queued it.

## Content

Authored content is TypeScript data validated by Zod during development and tests. Stable IDs are namespaced strings. Display names are never used as foreign keys.

Adding content should require:

1. a definition;
2. referenced registered assets;
3. validation;
4. optionally an authored balance test.

No new Phaser scene is required for a new story, tournament, Character, Move,
or Accessory.

Accessories are stable content definitions composed from reusable effects.
The launch vocabulary includes fixed Charge movement, timed Charge-rate
changes, whole-team healing, whole-team shielding, and timed Move-slot blocks.
Move-slot blocking is a team status keyed by slot index so it follows the
shared bar layout when the active Character switches; it is never encoded as a
character-specific branch.

Battle pickups are transient combat state, not progression inventory. A
successful damaging Move may advance the separate drop RNG and create a
side-owned, expiring Battery, Repair, or Surge. `requestPickup` is a normal
side-agnostic battle command used by semantic DOM buttons and AI alike.

`CharacterDefinition` carries one `typeId` and zero to two `traitIds`.
`CombatType` is a closed matchup vocabulary plus `typeless`; `CharacterTrait`
is a separate closed team-building vocabulary. Content does not encode
character-specific synergy branches. The combat rules module derives fractional
Trait scores and their typed bonus record from the deployed definitions before
building combatants.

Rights and source metadata do not belong in the pure combat definition.
`src/content/character-provenance.ts` is the validated external manifest keyed
by Character ID. Public roster packaging must reject missing records and any
record not explicitly marked `approved-for-distribution`; the launch prototype
keeps all six records at `development-review`.

Content validation rejects periodic intervals longer than their status duration
and hit-gated effects that appear before any damage effect in the same ordered
Move.

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
- Retired launch-roster IDs inside otherwise valid v2 snapshots migrate in
  place through an explicit content-ID map. Character IDs, Move order/tiers,
  losses, rival reveals, and locked tournament builds are migrated together.
  Owned instance IDs remain stable so persisted health-ratio keys still refer
  to the same copies.
- Existing v2 Tournament snapshots receive an explicit deployment migration:
  invalid/missing deployment IDs are removed, an empty deployment defaults to
  the first three locked builds, and missing reserve Health starts at full.
  `deployedInstanceIds` then persists independently from the six-build Roster.
- Preferences and progression are separate.
- Writes use a complete validated snapshot.
- Owned Character entries persist level/XP, stat allocations, Move order,
  per-Move band positions, Move tiers, and one optional equipped Modification
  ID. Older v2 entries receive compatible defaults during validation.
- Save slots persist the active Cheap Seats round, locked instance/build
  snapshot, exact Tournament Roster health ratios, ending active instance, selected
  interlude drop, pending opening-Charge bonus, champion badges, and revealed
  rivals. A loss clears the run snapshot so retry starts at Round 1. Older v2
  entries receive empty compatible defaults.
- Retired eight-entry Tournament snapshots are accepted only for migration and
  deterministically trimmed to the first six unique registered instances. New
  Tournament registration rejects more than six.
- Corrupt data falls back safely and is surfaced to the player; it is not silently overwritten before export/debug information is offered.
- Accepting safe defaults writes only the affected validated document, retains
  the preserved corrupt backup, and does not repeat the warning on reload.

## Audio

Logical IDs resolve through a registry:

```text
logical ID → approved/custom asset → silent category placeholder
```

Music is synced from `music/` into stable, ASCII-only Vite public paths by
`mise run assets:music` and registered by logical ID. Runtime selection is a
pure weighted function of an explicit seed, music context, present Character
IDs, and the current track; every registered track retains a positive weight in
every context. The application changes context only at meaningful boundaries
(global shell, between-fight screens, or battle) and loops the selected track
inside that context. Browser autoplay rules still require a player gesture.
Settings expose independent music, SFX, and dialogue volume/mute, and a route
change never opts a player back into music they turned off.

## Asset fallback

```text
approved specific asset
→ character fallback
→ template fallback
→ generic kinetic-panel placeholder
```

Missing art must not crash a scene. Approved generated assets are never overwritten silently.

Generated bitmap assets use an **opaque framed-shot contract**:

- source files are complete rectangles or squares; alpha transparency is never
  required;
- registry metadata declares the frame class, focal point, safe crop, facing,
  and intended shot role;
- character frames may contain simple authored background fields because they
  are presented as visible panels rather than composited sprites;
- Phaser/CSS may crop, clip, mask, stack, tint, translate, scale, rotate, or
  replace complete frames;
- UI values, labels, controls, status marks, speed lines, flashes, particles,
  panel borders, and other changing information remain code-native;
- generated UI text is not relied upon;
- only the current encounter's required art and near-future presentation frames
  are preloaded. A large installed roster must not become one initial download
  or decode burst.

Generation is an offline authoring dependency, not a runtime dependency. The
game remains playable with registered fallbacks when a specialised reaction or
Move frame does not exist.

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

- Calculation unit tests: costs, multipliers, Type wheel, Trait scoring and
  bonuses, tiers, seeded variance.
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
