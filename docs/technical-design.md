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

The application is a mobile-first responsive web game with a deliberate
16-inch MacBook Pro desktop reference. `fighter.loftwah.com` is the canonical
production hostname; repository notation remains `loftwah/fighter`. It can render a
data-driven, skippable startup sequence and genuine waiting state before opening
the global launcher. Intro stages have no automatic advance; the application
only schedules the short Main Menu handoff after an explicit advance or skip.
It only constructs a Story, Quick Fight, or Tournament view context after an
explicit player action. Semantic DOM renders contextual navigation,
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

| State                                                                                                                                              | Owner                                                | Lifetime                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Audio, difficulty, pause-key mode, reduced motion                                                                                                  | global Preferences                                   | all profiles                                          |
| Identity, Quick history, custom Tournaments, global Trophy/Story-award archives, Story Save index                                                  | selected Player Profile                              | persisted profile                                     |
| Collection, duplicates, XP/levels/builds, currency, Modifications, Accessories, Store, Missions, active Story Squad, Story progress/local Trophies | one Story Save                                       | until that Story Save is explicitly restarted/deleted |
| Quick Fight Character pool, prepared Lineups, sandbox builds, selected preset values, and fight-rule draft                                         | Quick session draft                                  | until leaving/reconfiguring Quick Fight               |
| Tournament definition                                                                                                                              | preset content or Player custom-Tournament catalogue | preset version or until custom deletion               |
| Tournament Roster, persistent player/opponent Health, current node, pending effects                                                                | Tournament run                                       | until victory, complete defeat, or forfeit            |
| Seeded combat and report                                                                                                                           | battle engine/session                                | one match                                             |
| Pause, countdown, presentation lock, open overlays                                                                                                 | battle-session controller                            | one mounted battle                                    |

Victory and defeat are result states over the same battle route and shared
report model, not separate combat implementations. Pause and the development
inspector are blocking overlays over that route, not navigation destinations.

The stylesheet entry point contains imports only. Ordered style modules preserve
the intentional cascade while separating foundations, progression screens,
battle layers, responsive rules, development tools, mode setup, and entry
states.

## Session and match composition

Story, Quick Fight, Tournament, and Fight Lab are orchestration contexts around
one combat engine, not separate battle implementations. Fight Lab is a
production-safe, progression-neutral adapter rather than a fourth progression
mode. Development-only inspectors and mutation controls sit behind a separate
compile-time capability boundary.

```text
Profile ──→ Mode Session ──→ Match Draft ──→ Validated Match Configuration
                                                                  │
Fight Lab ──────→ Validated Lab Scenario Draft ──────────────┘
                                                                  ▼
                                                          Combat Engine
                                                    Transition { state, events }
                                                                  │
                                                                  ▼
                                                           Battle Report
                                                                  │
                                                                  ▼
                                                    mode-owned consequences
```

A resolved match configuration is an immutable snapshot and carries Lineups,
Combatant Builds, one optional team Accessory per side, difficulty,
deterministic seed, optional authored rules, and presentation identity. Carrying
an Accessory in this final data structure does not make it a Fight Setting: its
draft owner is the Lineup preparation stage. Global Settings supply
accessibility/audio and a preferred difficulty; the mode may constrain the
match without copying settings state.

The current resolver records the effective clock, opening Charge, seed,
difficulty, both ordered instance/Character pairs, their complete builds, and
both team Accessories. `App.startBattle` consumes that snapshot through
`battleInputForMatch`; it must not rebuild player-facing participants from App
fields or reread Global Settings. Story encounter settings and Tournament
defaults/per-fight overrides resolve through the same contract before Battle.

Match launch is a process with separate draft editors and one final boundary:

```text
mode-owned eligible pool and build state
  → Character Select and Lineup preparation
  → Fight Settings when the mode permits edits
  → read-only Review Fight confirmation
  → validated match configuration
```

Character Select and Lineup preparation own participating instance IDs, order,
starter, and the optional team Accessory. Fight Settings owns only permitted
sandbox builds, difficulty, clock, opening Charge, deterministic seed, and
other encounter-rule edits. The final `data-fight-setup` surface implements
**Review Fight** and owns no editable combat configuration: it renders the
resolved match and records the player's single confirmation. Quick Fight
supplies temporary sandbox instances, Story resolves owned and authored-loan
builds, and Tournament resolves deployment and carried Health. This is one
interaction contract rather than three battle engines.

There is no public “start a battle” route. A player-facing battle may be
constructed only when all of the following are true:

1. an explicit Story, Quick Fight, or Tournament session owns the request;
2. the mode has produced a complete match draft according to its policy;
3. the player has confirmed the shared Review Fight boundary; and
4. the draft resolves to a validated match configuration before arena loading.

A mode may lock or pre-fill choices, but it may not bypass confirmation or
validation. Quick Fight always enters Character Select. Its preset is a compact
control inside Quick Fight Settings; selecting it updates related draft values
in place and never navigates to another screen. Story selects an authored node
before Character Select offers eligible active Squad members. Tournament
chooses a definition, registers or resumes its locked Roster, resolves global
defaults and per-fight overrides, then offers living members for the round.
Tournament interludes resolve before the same current or next fight returns to
Lineup preparation and Review Fight.

The accepted per-mode state machines, ownership matrix, and Parent/Main Menu
behaviour are maintained in
[`docs/match-launch-flows.md`](match-launch-flows.md). Implementations may model
setup stages as typed substates of a coarse route, but each transition and exit
must remain explicit and exhaustive.

Every rendered non-Battle stage receives two navigation destinations from its
owning workflow: `parent` and `mainMenu`. The screen must not infer Parent from
browser history. The live battle session retains the owning workflow return
target so Pause can offer both `Quit Fight to Parent` and `Quit to Main Menu`.
Quit confirmation resolves any mode consequence before navigation; in
particular, Tournament code must not restore a pre-fight Health snapshot or
silently turn a quit into a free retry. Restart and Tournament forfeit remain
separate commands.

A Quick preset is a registered value patch, not a route or screen model. Applying
one produces a new draft whose affected controls immediately reflect the
result. A later edit to an affected value derives the `Custom` state without
losing the draft. The player-facing **Full Power** default uses a dedicated
max-sandbox build factory; deterministic Level 10 Standard Builds remain
calibration fixtures for tests, authored encounters, or Fight Lab and must
not leak into the default Quick launch copy. A preset may provide default
Accessory IDs, but those values are applied to and subsequently edited through
the corresponding Lineup draft.

Fight Lab may deliberately bypass the player-facing Review Fight screen so
named scenarios can start quickly, but it does not bypass the configuration
resolver. Its adapter must produce the same validated gameplay input, classify
the report as `dev`, disable progression/rewards/achievements, and expose any
override provenance. A malformed scenario fails before Phaser or the combat
engine is created.

The framework-free combat engine currently accepts `CreateBattleInput` plus
validated `CombatContent` and returns a `Transition` containing the next
`BattleState` and semantic `BattleEvent` values. Later commands and ticks keep
the same transition shape. The battle-session layer builds the versioned
`BattleReport` from those transitions and gives the completed report to the
owning mode. The engine never reads routes, profiles, browser storage, rewards,
missions, Story progress, or Tournament persistence; mode consequence code
never invents combat outcomes that are absent from the report.

The typed `ResolvedBattleConfiguration` target and eligibility matrix are
specified in `docs/v2-continuation-programme.md`. Until that resolver is fully
extracted, `App.startBattle` is an implementation seam to remove, not permission
to add another mode-specific battle branch.

`src/ui/battle-guidance.ts` derives visible decision and presentation copy from
current runtime state. It does not alter combat: the application supplies
Charge, pending/stunned/blocked state, available Move thresholds, and the
semantic event side. The renderer uses the result for stable `CHARGING`,
`YOUR MOVE`, `OPPONENT READY`, side-specific presentation, and recovery cues.
Both sides receive a visible console-attached readiness marker. Waiting values
and opponent readiness are not live-announced continuously; entering or
expanding the player's ready state is.
Countdown and Move cut-ins announce through their visible assertive status
regions only, without duplicating the same copy through the shell announcer.

`renderBattleScreen` groups each side's semantic Health readout and Charge
Strip inside a single combat-console boundary. The bounded fight-event feed is
the final element in the player console, immediately after the player Charge
meter. `src/ui/battle-bench.ts` renders the native Lineup `details` disclosure
from `CombatantState`, action content, positions, and tiers. These are
presentation-only projections; neither module changes combat state or imports
Phaser.

The Gate 1 interaction shell uses one rail-first CSS grid as its spatial
contract. Opponent console, arena, player console, and both Lineup rails are
siblings with reserved tracks; Phaser is mounted only inside the arena track.
Move buttons are flow-layout semantic controls with separate exact-cost anchor
ticks over the Charge meter. Accessory, pickups, and fight feed therefore do
not need competing absolute offsets or `z-index` escalation. Short-landscape
Pause uses a compact three-column blocking sheet and a 44-pixel Pause target,
while result sheets retain safe internal scrolling. Active statuses remain in
the Health readouts as compact labelled stamps at the short-landscape reference;
they are not removed to make the layout fit. The player Accessory also retains
a minimum 44-pixel target in portrait and short landscape.

`src/dev/experiments.ts` is the typed development experiment boundary. Each
entry declares `interaction-critical`, `presentation-active`, `cosmetic`, or
`gameplay-active`, plus whether it may affect a Battle Report and whether it is
visible in Settings. Only cosmetic Battle presentation style is currently
selectable there. Its local versioned storage and query-string override are
development conveniences; neither enters saves, match configuration, combat
commands, or reports. `BattleScene` receives the chosen cosmetic style after
the engine snapshot already exists.

`ActionDefinition.category` is required authored content. The closed
`MoveCategory` vocabulary and all player-facing labels live in
`src/ui/move-category-key.ts`; battle controls, Lineup disclosures, tooltips,
assistive labels, and the Pause key consume that same metadata. Renderers must
not infer a category from an effect array because hybrid Moves still need one
stable primary reading.

Charged Moves also declare `interruptionPolicy`. The launch schema currently
accepts only `spend`: Charge is spent on commitment and is not refunded after an
interruption. Adding a refund, staged, or action-specific policy requires a new
closed schema value, deterministic engine handling, UI copy, and tests in the
same change.

`src/combat/standard-build.ts` is the single even-build calibration constructor.
Authored encounters, tests, Fight Lab, and Tournament definitions may use
it when they explicitly request Standard Builds. Player-facing Quick Fight uses
a separate Full Power sandbox constructor for its default and never infers
builds from authored Character levels or the active Story profile. Standalone
Tournament builds come from the chosen definition or configured Roster; Story
encounters continue to use owned builds or explicit loan builds.

`src/combat/quick-fight-seed.ts` derives the stable seed from both Lineups and
Accessories. The default Gate 1 configuration is
`v2.viking-acceptance`/`3844240869`; the matching Fight Lab preset and
headless diagnostic use the same content IDs rather than maintaining a second
fight definition.

The diagnostic controller prioritises collectable player Drops, then a fully
charged Accessory, then the declared Viking Move sequence. Browser acceptance
must exercise those same choices through the semantic controls; it cannot
substitute a headless report for responsive operability.

`src/ui/battle-result-explanation.ts` derives the decisive Move, leading damage
sources, Type edge, random-event count, and player decision count from the
versioned Battle Report. It may omit unavailable evidence but cannot invent a
cause. This same report remains the export and replay source.

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
  unsupported direct development-override state edits are rejected rather than falsely
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
User pause also pauses Phaser scene time. Escape always toggles pause; the
persisted P-key preference resolves keydown/keyup into either hold-to-pause or
press-to-toggle commands before the application controller changes runtime
state. Countdown and presentation locks keep Phaser running so their authored
motion can complete without modifying the deterministic battle state.

Presentation-lock durations are fixed from semantic event types in a pure
timing module. Phaser consumes the same events and duration but does not decide
gameplay timing. The calibrated baselines are 2.1 seconds for an instant Move,
1.8 seconds for a charged impact, 1.6 seconds for an Accessory, and 2.6 seconds
for a defeat, with extra time for multiple hits. Reduced motion changes how the
interval is rendered, not how long the combat controller remains locked. A
semantic DOM status names the acting Character and Move throughout the lock.
The AI decision clock is held at the current frame throughout the lock, so the
configured reaction delay starts again when presentation releases instead of
silently elapsing behind the animation. The current Easy/Normal/Hard/Brutal
windows are 1800/1400/900/600 ms. `teamChargePerSecond` is the shared pure
calculation used by both simulation and semantic rate readouts, preventing the
displayed race from drifting from the engine.

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

`TournamentDefinition` owns its presentation image, accessible alternative
text, and complete ordered round definitions, and references one required
`TournamentTrophyDefinition`. The Tournament screen derives its arena, title,
round copy, bracket, and Trophy from that active definition. The Trophy owns a
stable ID, display metadata, logical image asset ID, alternative text, and a
generic/custom flag. Registration fails when either asset or the Trophy
relationship cannot resolve. Story completion definitions reference durable
Mission and Trophy IDs; the ending guard derives completion from the selected
save rather than trusting the current Story node.

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
records all six as owner-approved for the current V2 web playground. Each note
retains its specific review triggers, and V2.1 does not inherit that approval
for new Characters or materially changed art.

Content validation rejects periodic intervals longer than their status duration
and hit-gated effects that appear before any damage effect in the same ordered
Move.

`src/content/startup-content.ts` is an ordered union of text, image, and video
beats. Media uses logical asset IDs and content validation; arbitrary HTML is
not startup content. Adding a startup beat does not add an application route.

Achievements are evaluated from the selected validated save by pure progression
code. They are not separately persisted while the source profile facts can
derive them.

Fight Lab scenarios follow the same data rule. `src/dev/` retains the internal
module name and owns validated scenario definitions made only from stable
content IDs and explicit starting state. Launching a Lab scenario creates a
non-progressing battle report with internal mode `dev`; development-only debug
state changes are labelled in the report and cannot flow into rewards, missions,
Story, or tournament persistence.

## Persistence

Persisted `PlayerProfileData` schema v3 is the storage-agnostic Profile with
nested Story Saves introduced by Foundation Packet F00. The current application
still consumes a validated `SaveData` v2 compatibility view while its screens
are migrated one at a time; new writes own the schema-v3 Profile rather than
writing progression back into the flat legacy document. The persisted shape
separates:

```text
PlayerProfileData
├─ identity and global records
├─ Quick Fight history
├─ custom Tournament definitions
├─ global Tournament Trophy records keyed by Tournament ID
├─ global Story completion awards keyed by Story ID
├─ standalone Tournament run
└─ storySaves[storyId]
   └─ StorySaveData
      ├─ collection/builds/economy/Store/Missions
      ├─ active Story Squad (maximum six)
      ├─ Story progress and local Tournament Trophy records
      └─ optional active Story Tournament run
```

The application uses the same profile contract for a guest stored in browser
storage and a later authenticated/cloud-synchronised player. Authentication is
an adapter and never becomes the owner of combat, Story, or Tournament rules.

The v2-to-v3 migration preserves the current flat progression fields inside
the `story.first-run` Story Save, retains Quick Fight history and the
standalone run globally, and converts each old Trophy ID into a global record.
Because the old schema did not retain Trophy provenance, a Trophy required by
the migrated First Run completion state receives a conservative
`legacy-imported` Story-local record so migration cannot revoke completion.
The old snapshot remains available for rollback/recovery.

Fresh local profiles use the editable preset identities Headliner, Contender,
and Wildcard. Loading an otherwise valid profile whose untouched name is the
retired exact value `Player` updates only that name to its slot preset and
persists identity-preset marker version 1. The marker makes this a one-time
migration, so a later explicit rename to `Player` and every other custom name
remain preserved.

- The original development namespace remains in storage keys solely to preserve
  existing local profiles. It is not product identity.
- Preferences key: `riot-relics.preferences.v1`
- Save index key: `riot-relics.save-index.v1`
- Player Profile keys: `riot-relics.profile.v3.<slot>`
- Slot keys: `riot-relics.save.v2.<slot>`
- Pre-profile migration backup: `riot-relics.save.v2.<slot>.pre-profile-v3`
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
- Tournament runs persist their definition ID, current node, locked
  instance/build snapshot, exact player Roster and current opponent Squad Health
  and defeat state, deployed Lineup/starter, pending interstitial effects, and
  used Accessories. A non-victory returns to Lineup while any player Roster
  member lives; only complete defeat, victory, or confirmed forfeit closes the
  run.
- Tournament runs persist `exhaustedAccessoryIds`. A player-side Accessory
  activation adds its stable ID once; later rounds omit that Accessory. A fresh
  or restarted run begins with an empty exhaustion list.
- Save slots persist a progression-neutral Quick Fight record containing fights,
  wins, losses, last seed, and last Lineup IDs. Older compatible V2 snapshots
  receive zeroed counts and empty Lineups without a schema-number bump.
- Existing v2 snapshots that contain `tournamentBadges` are additively
  normalised into `tournamentTrophyIds`; the retired Cheap Seats champion badge
  maps to `trophy.wrong-door-cup`. Unknown old values are ignored and valid
  current Trophy IDs are de-duplicated. The save schema number remains v2
  because the reader already owns explicit compatible v2 normalisation.
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
- UI values, labels, controls, status marks, timed speed lines, flashes,
  particles, panel borders, and other changing information remain code-native.
  Static illustrative arcs, debris, or reaction marks may live inside a
  purpose-specific authored plate;
- generated UI text is not relied upon;
- every authored bitmap declares the text and mirroring policy from
  `docs/art-brief-template.md`; gameplay plates use `none`, while an image with
  deliberate fixed promotional copy uses `authored-copy` and `mirror_policy:
never`;
- runtime renderers never suppress a required semantic label because similar
  wording appears in an image. Accidental image text makes the asset
  non-compliant and must be removed or regenerated;
- both directional battle-idle base frames are preloaded for the current
  encounter; canonical selection/profile portraits are not substituted for
  battle idle A;
  reaction sheets and Move plates are loaded only for the two active
  Characters and become eligible for release when they leave the active pair.
  Eviction is deferred while either persistent `FramedShot` crossfade layer
  still references the texture; a later presentation pass retries once the
  outgoing layer has moved to active-character art. A large installed roster
  must not become one initial download or decode burst, and responsive layout
  must never observe a destroyed texture.

Generation is an offline authoring dependency, not a runtime dependency. The
game remains playable with registered fallbacks when a specialised reaction or
Move frame does not exist.

The six-Character launch package is rebuilt with
`mise run assets:launch-roster`. Reviewed sources live under
`.impeccable/review/visual-direction-v2/production-sources/`, directional idle
sources under `.impeccable/review/visual-direction-v2/directional-battle-sources/`,
and Accessory sources under
`.impeccable/review/visual-direction-v2/accessory-sources/`, and Modification
sources under `.impeccable/review/visual-direction-v2/modification-sources/`;
runtime outputs
live under `public/assets/generated/launch-roster/`. The task normalises 4:5
Character plates, 3:2 reaction sheets, and 16:9 cut-ins/environments, forces
opaque palette PNG output, and refuses to replace an existing production
package unless the author explicitly passes `--force`.
The framed-shot metadata contract records `textPolicy` and `mirrorPolicy`.
Content validation requires launch battle idles to be right-facing,
`side-aware`, and text-free; authored-copy plates can never be mirrored.
`src/assets/launch-art-contract.json` is the shared coverage inventory consumed
by the offline builder, runtime registry and tests. It freezes the seven-image
minimum for each V2.1 Character and requires every V2 Accessory and Modification
to resolve to registered opaque square art.
All sources and destination state are preflighted before conversion. The task
builds and validates a complete sibling staging directory, then promotes the
package with same-filesystem renames and rollback of the previous package if
promotion fails.

Tournament Trophy art follows the same offline, opaque, atomic production
contract. `mise run assets:trophies` builds registered 1:1 Trophy images from
reviewed sources under
`.impeccable/review/visual-direction-v2/trophy-sources/` into
`public/assets/generated/trophies/`; it refuses to overwrite the accepted set
without `--force`. `docs/trophy-art-production.md` records source IDs and
prompts.

Every launch Move owns a non-null Character-specific presentation asset. Every
launch Character owns a reaction sheet with the fixed order
`hurt, dodge, stunned / defeated, victory, tense`. When a battle ends, the
winner and loser settle onto their victory and defeated reaction cells behind
the semantic result sheet. The startup hook registers separate landscape and
portrait ensemble assets and selects them with semantic `<picture>` markup.
Phaser image requests traverse the same logical image fallback chain as DOM
images. Story and Tournament CSS backgrounds are probed and advanced through
that chain on load failure.

## Responsive model

- Tier 1 targets: current mobile browsers in portrait and landscape and the
  16-inch MacBook Pro desktop reference. Other current desktops and tablets are
  Tier 2; older or unusual browsers are best effort.
- The desktop model is a full-viewport 16:9 stage with edge-pinned controls and
  a safe central action field.
- Wide screens enlarge the fighter stills and breathing room while health,
  Lineups, timer, Pause, and the integrated Move-and-Charge control remain
  attached to the stage edges.
- Portrait battle layouts use an authored asymmetric composition: the opponent
  console owns the upper band, the player console owns the reachable lower
  band, Lineup portraits remain on the edges, and Phaser composes asymmetric
  fighter art only inside the arena between them.
- Short mobile landscape uses the same regions in compressed rows. Its Move
  controls remain at least 44 CSS pixels high, Pause actions remain visible in
  the first viewport, and a longer result explanation scrolls inside its
  blocking result surface rather than extending the Battle document.
- Lineup attack disclosures are native `details` elements. Their touch-sized
  summaries sit over the compact portrait ticket at narrow widths so they do
  not intrude into either Charge track.
- Responsive changes happen in semantic DOM/CSS and `BattleScene.layout()`;
  combat rules and presentation-lock durations do not vary by viewport.
- CSS safe-area variables are supported even before mobile packaging.

## Testing

- A test must name the stable contract and its beneficiary. Confidence, not
  test count, is the goal; duplicate or brittle tests are challenged rather
  than accumulated.
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
- Gate 1 responsive geometry regression checks the critical Battle regions at
  `390 × 844`, `844 × 390`, and `1728 × 1117`: the document does not scroll,
  every region stays in bounds, and non-nested consoles, Lineups, Moves,
  Accessory, Pause, and fight feed do not intersect. The short-landscape case
  also asserts visible labelled statuses and 44-pixel Pause/Accessory targets.
- Roster-switch presentation regression advances through defeats, resizes the
  live Phaser arena after outgoing rich art becomes inactive, and rejects any
  texture or `FramedShot.applyFraming` error.
- `mise run layout:audit` opens the production Main Menu at `390 × 844`,
  `844 × 390`, and `1728 × 1117`, rejects document scrolling or off-viewport
  mode actions, and keeps every launch action at least 44 CSS pixels high.
- Every release slice receives bounded gameplay, UX, visual, performance,
  accessibility, and production-readiness passes. Fixed-seed scenarios and
  replayable reports are preferred evidence because defects remain inspectable,
  traceable, and reproducible.

## Deployment boundary

V2 builds a static web bundle and requires no backend. Deterministic battle
reports and local diagnostics provide current observability.

The staged platform boundary is:

- V2: responsive static website and local profiles;
- V2.1: web app manifest, service worker, update UX, and selective PWA caching;
- V2.2: Cloudflare Workers Static Assets and API adapters, reviewed identity,
  cloud-save storage, conflict handling, and account support operations;
- V2.3: reproducible Capacitor-based iOS and Android development shells and
  physical-device proof unless a measured prototype justifies another
  thin-container approach; public store distribution follows when the product
  and developer memberships are ready;
- Deferred multiplayer, if separately approved: a server-authoritative,
  versioned match adapter with a Worker gateway and one Durable
  Object/WebSocket coordinator per match.

This ordering is authoritative in `docs/release-roadmap.md`. Each stage still
requires its own ADR for data ownership, privacy, retention, security,
observability, cost, migration, and failure behaviour before implementation.

The combat engine, content schemas, and save migrations cannot import or depend
on Cloudflare or Capacitor. Web, PWA, Worker, and native integrations sit behind
application adapters. Native packaging produces distinct signed iOS and Android
artefacts, but it must not create separate gameplay or content implementations.
V2–V2.3 preserve explicit seeds, serialisable side-agnostic commands,
controller ownership outside the domain, versioned reports, and deterministic
replay; they do not add a remote controller or speculative match service.
`docs/multiplayer-seam.md` preserves optional protocol, timing, trust, delivery,
and failure-test research. It is not a committed milestone.

GitHub Actions is the release-automation boundary: pull requests and main run
the repository quality gate, reviewed static artefacts are promoted without an
untracked rebuild, and accepted versions are tied to annotated tags and GitHub
Releases. Deployment, signing, and store credentials live only in protected
milestone-owned environments. No native signing secret or multiplayer backend
secret is required for V2.

The complete static output contains the music and public asset trees, so its
size is not an initial-transfer measurement. Production builds run
`scripts/verify-production-build.mjs`, reject public source maps and an eager
Phaser script, and print both total artefact bytes and the initial HTML's
raw/gzip code measurements. A Rollup module-graph guard fails if Phaser or the
battle renderer enters any static entry import, including when chunk filenames
change or Rollup merges modules. The 2026-08-08 production build measured
172,192,552 static bytes with zero source maps; its initial JS and CSS measured
815,192 raw bytes and 183,985 gzip bytes.

A local production-preview baseline at `390 × 844` originally measured
2,591,025 encoded bytes across nine landing resources. Deferring Main Menu art
and selecting one responsive intro backdrop reduced the repeatable cold intro
to 854,741 encoded bytes, a 67.0% reduction. The automated
`mise run performance:audit` guard caps this boundary at 1 MB and rejects eager
Phaser, audio, Story/Tournament art, or the unused intro orientation.
Starting the default Viking-versus-Grim-Reaper 1v1 requested a further
5,912,216 encoded bytes across fourteen resources: the 340,199-byte encoded
Phaser chunk and only that encounter's arena, Move, idle, and reaction images.
These figures establish browser-driven transfer observations; they do not
set the physical-device budget or prove frame pacing, decoded image memory, or
thermal behaviour. V2.1 must use selective application-shell and content-pack
caching rather than pre-caching the complete library.

## Product-line evolution boundary

`docs/platform-direction.md` records a possible future in which the fighter is
one maintained gameplay capability used by multiple products. That direction
does not describe the current architecture. The current build still owns one
public identity, one direct TypeScript content package, First Run-specific
application and migration code, and one application release version.

Future proofs must preserve these constraints:

- Generation and research are offline authoring activities. A released game
  cannot require an AI provider to boot or play.
- Product-specific identity, content, policy, and provider adapters cannot enter
  deterministic combat rules.
- Stable logical IDs and explicit migrations remain mandatory. A re-theme may
  not rewrite old saves or reuse another product's storage namespace casually.
- Public product builds must not share mutable runtime state, content, assets,
  or canonical metadata accidentally.
- Rights, source, prompt, model, approval, and commercial-use metadata remain
  outside pure combat definitions while still participating in release
  validation.
- Provider credentials and billable generation actions remain explicit,
  protected authoring concerns.
- A remote content path, if accepted later, requires versioning, integrity,
  fallback, rollback, privacy, and offline behaviour before it can replace
  bundled content.
- A second gameplay capability must not be forced through fighter-shaped
  abstractions. It should first be implemented for a concrete product and then
  compared with the combat engine.

The first radical re-theme must record a change inventory before extracting a
product contract. The second independently releasable product must then prove
the minimum boundary. Only after at least two active products consume central
updates can the project define fleet compatibility, support windows, automated
uplift, or repository topology from evidence.

The current `2.0.0` application version is not yet a platform API guarantee.
Any later semantic compatibility contract must identify the independently
versioned concerns—such as runtime behaviour, content schema, save schema,
product content, or platform shell—and provide tests and migrations for each
claim.
