# V2 continuation programme

Status: **EXECUTION HANDOFF — FOUNDATION PACKET F00 COMPLETE; SHARED LINEUP ACTIVE**

Prepared: 2026-08-01

This is the ordered continuation of the ratified V2 programme. It does not
replace the release specification, game design, technical design, implemented
visual system, alignment ledger, source ledger, or roadmap. Those authorities
continue to own their existing subjects.

## 0. Owner scope correction — 2026-08-07

The owner accepted the following foundation after playing and reviewing the
current application. It supersedes the older global-collection and
single-fight-loss assumptions, but must be reconciled into the owning
authorities, persistence/content schemas, migrations, and tests together in
Foundation Packet F00. F00 completed on 2026-08-07; no surrounding screen may
return to the old ownership model.

### Global Player and Story ownership

- A Player Profile is the storage-agnostic global identity. It is stored in the
  browser for a guest and may be synchronised by an optional account in V2.2.
- The Profile owns Quick Fight history, standalone Tournament records, custom
  Tournament definitions, the global Tournament Trophy cabinet, global Story
  completion awards, and the list of Story Saves.
- The Profile does not own Characters, Character levels, XP, currency,
  Modifications, Accessories, Store inventory, or Missions.
- One Story Save exists per Story definition in the first implementation. Many
  different Stories can be in progress concurrently. Supporting multiple
  parallel runs of the same Story remains an additive extension.
- Each Story Save owns its collection, duplicate Character instances, levels,
  XP, builds, currency, Modifications, Accessories, Store, Missions, active
  Story Squad, progress, and Story-local Tournament Trophy records.
- Deleting or restarting a Story Save removes those Story-owned facts. Trophies
  and Story completion awards already copied into the global Profile remain.

### Quick Fight

- Quick Fight has presets and a Custom Match path.
- It grants no Character ownership or progression. Both sides use temporary
  sandbox instances that may select any registered Character, including exact
  duplicates, and every supported level/build/customisation.
- A preset may enter the shared Lineup pre-filled. Custom Match uses a Match
  Builder before the same Lineup confirmation.

### Tournament definitions, runs, and Trophies

- Standalone Tournament Mode offers preset Tournaments and locally persisted
  custom Tournaments. Stories may reference preset Tournaments only.
- Every Tournament has a stable identity, name, one mandatory Trophy, at least
  one fight, one or more ordered nodes, and named opponent Squads containing
  one to three configured Characters.
- Nodes may represent fights, content, seeded chance, rewards, healing,
  team-wide healing, revival, next-fight Charge/status/stat effects, Store
  access, or other data-authored interstitials.
- A player begins a run with a locked Tournament Roster of at most six
  configured Character instances. Up to three living instances form each
  deployed Lineup. Player Roster Health and defeat state persist across the
  complete Tournament.
- When a deployed Lineup loses but at least one Tournament Roster member lives,
  the same fight remains current and the player receives another Lineup choice.
  The current opponent Squad's Health and defeat state also persist across
  these repeat deployments. A new opponent Squad starts from its authored
  initial state.
- The run is lost only when the complete player Tournament Roster is defeated
  or the player explicitly forfeits the Tournament. Forfeit ends the run after
  confirmation; it is not a way to preserve or rewind a pre-fight snapshot.
- Beating every required opponent Squad and resolving the remaining required
  nodes wins the Tournament.
- Preset Tournaments may use unique generated Trophies. Custom Tournaments must
  select a generic registered Trophy before they can be saved.
- Global Trophy ownership is de-duplicated by Tournament identity. A standalone
  win upserts it globally. A Story win records it in that Story Save and also
  upserts it globally. Deleting the Story Save removes only its local record.
- Deleting a custom Tournament removes its global Trophy record. Preset
  Tournament removal is a versioned content migration because Stories may
  reference it.

### Story definitions and ordinary fights

- A Story is an ordered set of Levels. A Level is an ordered sequence of
  content, grants/rewards, fights, preset Tournaments, choices, Store/Mission
  hooks, and completion steps rather than one mutually exclusive renderer type.
- Content can use text, registered images/slideshows/video, music, sound, and
  explicit player-controlled advance. Grants may occur before a fight so the
  item is available during selection.
- Every Story contains at least one ordinary fight, at least one preset
  Tournament, and one mandatory Story completion award that can enter the
  global Profile collection.
- A boss is an ordinary fight with authored rules, presentation, content, and
  rewards; it is not another combat engine or required node type.
- A Story Save may own any number of Character instances but has one active
  Story Squad of at most six. An ordinary fight deploys one to three from that
  Squad, starts both sides at full Health/resources, and does not carry Health
  to the next attempt or Level.
- Losing an ordinary Story fight keeps earned XP and requires another attempt.
  Winning resolves its ordered post-fight content/grants and advances according
  to the Level definition.
- Entering a Story Tournament confirms up to six eligible Story-owned or
  explicitly loaned instances, then locks that snapshot as the Tournament
  Roster and uses the common Tournament runner.

### Shared selection and battle boundary

`Fight Setup` is a process, not one overloaded screen:

```text
mode-owned eligible pool/build configuration
  → Fighter Select when a Lineup must be chosen
  → Match Settings when the mode permits edits
  → required read-only shared Fight Setup confirmation
  → validated match configuration
  → combat engine
  → Battle Report
  → mode-owned consequences
```

Fighter Select chooses one to three eligible instances, their order, and the
starter. Match Settings owns only permitted builds, team Accessories, music,
seed, and encounter rules. The final Fight Setup displays the resolved match
and confirms it once; it never decides ownership, build legality, Tournament
membership, or Story progression.

### Milestone allocation

| Milestone   | Revised allocation                                                                                                                                                                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V2          | Correct Profile/Story ownership and migration; one Story Save; one preset Tournament proving repeat deployments and Trophy projection; complete Quick Fight Standard/Custom setup; validated shared Lineup; current six-Character release and full application quality. |
| V2.1        | Twenty Characters; multiple publishable Stories and preset Tournaments; local custom Tournament builder; generic Trophy selection; richer content/chance/interstitial authoring; PWA and produced SFX.                                                                  |
| V2.2        | Optional accounts, guest linking, cloud synchronisation/conflict/recovery for the same local-first Profile, Story Saves, custom Tournaments, and archives.                                                                                                              |
| V2.3        | Thin native development shells, device integration, reproducible builds, and store-readiness evidence over the same domain/content/save contracts.                                                                                                                      |
| Multiplayer | No committed milestone. Preserve the optional seam research without scheduling implementation.                                                                                                                                                                          |

### Foundation Packet F00 — complete 2026-08-07

The completed atomic foundation packet:

1. reconcile `docs/game-design.md`, `docs/technical-design.md`,
   `docs/v2-release-spec.md`, `docs/view-inventory.md`, `PRODUCT.md`, and the
   alignment/source ledgers;
2. introduce the Player Profile, Story Save, Story definition/Level-step,
   Tournament definition/node/run, source-aware Trophy, sandbox build, and
   validated Lineup/match-draft schemas;
3. migrate the current V2 local save without silently losing the existing First
   Run collection, progress, Quick Fight history, active Tournament, or Trophy;
4. update mode orchestration and consequence tests before changing screen
   composition; and
5. retain the current playable battle and presentation output while the input
   ownership boundary changes around it.

F00 now persists schema-v3 Player Profiles with nested Story Saves and a
preserved v2 rollback snapshot, validates Story Level steps and Tournament
nodes, records source-aware Trophy provenance, carries both sides' Health across
Tournament redeployments, and rejects Battle launches without confirmed Lineup
or validated Developer Lab provenance. Shared Lineup is the active first visual
package. Launcher/header work waits because its destinations and navigation
should reflect the corrected mode model.

## 1. Reconciled starting point

The repository and current evidence agree on the following state:

- Gate 0 and Gate V2-01 are complete. All 44 questionnaire answers and all 117
  mechanic-registry rows are reconciled. Do not repeat that work or reopen the
  completed questionnaire.
- Gate V2-02 is accepted as the current Battle hold point. The owner confirmed
  on 2026-08-07 that gameplay is in a good place while surrounding application
  structure is corrected. `v2.viking-acceptance`, seed `3844240869`, remains
  the fixed regression candidate.
- The fixed benchmark remains Standard-build Viking versus Standard-build Grim
  Reaper on Normal with ordinary 90-second rules. Its semantic-control run wins
  with 65/147 Health remaining. Headless, replay, delayed-command and responsive
  browser evidence and owner feel acceptance now exist.
- Main Menu, navigation and Shared Fight Setup are implemented production
  surfaces but are not spatially approved. Each needs its own replacement,
  real-application screenshot-led batch.
- `CreateBattleInput` already carries starting Charge and time limit, while
  `DevBattleScenario` separately carries those values plus controllers and
  starting health. `App.startBattle` currently branches across Story, Quick
  Fight, Tournament and Developer Lab before calling the one combat engine.
- Battle Report schema v2 records the initial state, exact simulation deltas,
  commands, difficulty changes and debug actions. Replay uses those deltas and
  rejects direct development state edits. It does not yet record one resolved
  modifier/provenance contract.
- `src/dev/experiments.ts` is a typed presentation-experiment boundary, not a
  combat-modifier system. Development tools are compile-time exposed and the
  current inspector still has bespoke Charge-edit and stepping controls.
- The required foundation can therefore be added without choosing a Battle,
  launcher, navigation or setup composition. It improves determinism and test
  leverage while Dean playtests.

The highest-leverage work is now F00: correct ownership, persistence and entry
contracts without changing the accepted Battle behaviour. The typed encounter
modifier and explicit Dev Mode boundary in Packet M01 remain subsequent engine
work rather than the immediate handoff.

## 2. Decision boundary

### Owner checkpoints

Only these points require Dean before the dependent spatial or feel decision is
locked:

1. **Shared Lineup composition:** review the first dedicated replacement batch
   after F00 is complete and the mode-owned eligibility rules are executable.
2. **Main Menu composition:** review the dedicated replacement batch after it
   is built from real application screenshots.
3. **Navigation composition:** review its dedicated real-application batch.
4. **Existing non-Battle reviews:** review the Trophy family and choose the
   landing-page composition. These are not Gate V2-02 blockers.

### Autonomous work

Agents may complete the following without crossing an owner boundary:

- typed modifier schema, resolver, provenance, eligibility classification,
  report schema and replay support;
- explicit global Dev Mode off/on boundary and migration-safe local storage;
- deterministic tests, mode-construction tests and semantic automation hooks;
- assisted copies of development scenarios, clearly separated from official
  acceptance evidence;
- playtest intake and feedback reconciliation;
- evidence capture and genuinely different mock-up variants, provided no
  spatial variant is promoted into production before Dean sees it;
- defects, accessibility failures and resilience problems that do not encode a
  disputed spatial preference;
- content/progression, performance and release-proof preparation that does not
  claim a later gate or make broad UI decisions before its dependency passes.

## 3. Gate V2-02 playtest and feedback handling

### First observation

Dean's first playtest is open-ended target-user observation, not a
questionnaire. Give only the route needed to reach the candidate:

> Open Developer Lab, start V2 Viking Acceptance, and play naturally. Try
> whatever seems sensible. Mistakes, uncertainty and experimentation are useful.
> Send any notes, screenshots or recordings in whatever form is easiest.

Do not prescribe the four-Move benchmark sequence, teach the intended answer,
ask for ratings, or require comparison questions before play. The automated
sequence is regression evidence, not playtest instruction.

### Lightweight intake

Accept unstructured material first. The agent records missing context after
receipt using this optional wrapper; Dean need not complete it beforehand:

```text
Device/orientation: [if known]
Mode/scenario: [if known]
Presentation style: [if known]
What was happening: [short context added during reconciliation]
Observation: [Dean's original words, unchanged]
Evidence: [screenshot/recording path or none]
```

Preserve the raw note beside the interpreted item. Infer device, scenario,
style and moment from metadata or visible evidence when safe. Ask a follow-up
only when two materially different implementation directions remain plausible.

### Triage taxonomy

Each observation receives one primary class, optional secondary classes, an
evidence link, and a disposition:

| Class                      | Test for classification                                                                                                             | Typical response                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Gameplay/rules             | Would changing it alter legal commands, damage, Charge, AI, status, seed outcome, reward or failure?                                | Reproduce with a fixed seed; update game design, schema, engine and tests together if adopted.                  |
| Interaction-critical shell | Does it concern stable control location, reading order, focus, label, touch geometry or essential Health/Charge/Lineup information? | Reproduce at all three viewports; revise the shell only after separating defect from spatial preference.        |
| Presentation-active        | Does it concern a blocking lock, countdown, transition or timing that changes wall-clock feel while simulation is held?             | Measure simulation and wall time separately; test AI clocks and locks.                                          |
| Cosmetic presentation      | Does it concern crop, framing, wipe, shake, panel choreography or style without moving controls or changing a report?               | Compare through the existing style boundary; preserve identical combat/report evidence.                         |
| Accessibility/assist       | Does it concern keyboard, focus, motion, contrast, labels, touch, audio, comprehension support or forgiving completion?             | Treat barriers as defects; keep assist eligibility explicit and Story failure forgiving.                        |
| Defect                     | Does behaviour violate an authority, declared contract or reproducible expected state?                                              | Fix autonomously when the correction does not choose a disputed design direction.                               |
| Design preference          | Are multiple compliant outcomes possible, with the note expressing a preferred feel or composition?                                 | Prepare bounded alternatives or a recommendation; request Dean only if the choice changes direction materially. |

An item may be both, for example `interaction-critical + defect` or
`presentation-active + design preference`. Reconciliation must state the
authority, reproduction, proposed disposition and whether an owner decision is
actually necessary.

## 4. Shared Battle configuration contract

### 4.1 One vocabulary

Packet M01 should introduce one domain-owned `BattleModifierSet` (or an
equivalent name) and one resolver. It must not add a separate settings switch
for each mode.

The initial vocabulary is:

```ts
interface BattleModifierSet {
  simulationTimeScale?: 0 | 0.25 | 0.5 | 1 | 2 | 4;
  presentationTimeScale?: 0.5 | 0.75 | 1 | 1.5 | 2;
  playerChargeRateMultiplier?: number;
  opponentChargeRateMultiplier?: number;
  playerStartingCharge?: number;
  opponentStartingCharge?: number;
  passiveOpponent?: boolean;
  playerCannotBeDefeated?: boolean;
  opponentCannotBeDefeated?: boolean;
  battleTimerMs?: number;
}

type BattleModifierSource = "default" | "authored" | "player" | "developer";
```

The exact code may use closed per-field schemas rather than this illustrative
interface. Values must be bounded and validated: Charge `0..100`, positive
finite rate multipliers within an authored safety range, and a bounded timer.
`0` is legal only for simulation pause, not Charge rates, presentation speed or
timer duration.

The resolver accepts ordered source layers:

```text
production defaults
  → authored encounter modifiers
  → permitted player-selected custom rules
  → permitted developer overrides when Dev Mode is on
  → validated ResolvedBattleConfiguration
```

Each resolved field records its final value and winning source. The resolver
also records shadowed inputs for diagnostics, rejects a source that is not
permitted by the mode policy, and computes eligibility rather than leaving it
to reward call sites.

`ResolvedBattleConfiguration` should contain at least:

- mode and encounter ID;
- seed and controller ownership;
- resolved modifiers with per-field provenance;
- Dev Mode state and whether any developer override is active;
- progression, reward, achievement and release-acceptance eligibility;
- a stable ruleset fingerprint for reports and automation.

Mode orchestration resolves this object before `createBattle`. The engine
receives only gameplay values it owns; the application runtime receives
simulation/presentation pacing and controller ownership. Presentation speed
must never enter damage, Charge, AI selection or status calculations.

### 4.2 Eligibility matrix

| Run classification                                          | Progression                                        | Rewards                          | Achievements                                  | Release acceptance                                                              |
| ----------------------------------------------------------- | -------------------------------------------------- | -------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------- |
| Official authored Story/Tournament rule                     | Eligible                                           | Authored rewards                 | Eligible, subject to achievement rule         | Valid when the named acceptance scenario expects it                             |
| Standard Quick Fight                                        | No Story/Tournament mutation; profile history only | None                             | Non-progression records only                  | Valid for a named standard benchmark                                            |
| Player-custom Quick Fight                                   | Profile history marked custom                      | None                             | Custom-compatible records only                | Invalid                                                                         |
| Player-custom Tournament                                    | No official Tournament progression                 | No official Trophy, Stamps or XP | Custom-compatible records only                | Invalid                                                                         |
| Story accessibility/assist option explicitly approved later | Story progress remains eligible                    | Authored rewards remain eligible | Challenge achievements may opt out explicitly | Invalid for standard release benchmark; valid accessibility evidence when named |
| Any active developer override or direct debug action        | Ineligible                                         | None                             | None                                          | Invalid and visibly **ASSISTED / DEVELOPMENT**                                  |
| Cosmetic style or reduced motion only                       | Unchanged                                          | Unchanged                        | Unchanged                                     | Valid when the evidence names the style/preference                              |

There is no silent downgrade. Fight Setup shows custom or assisted state before
the fight. The result and exported report repeat it. Mode consequence code
consumes the resolver's eligibility result rather than reconstructing policy.

### 4.3 Time and replay semantics

- `BattleState.elapsedMs`, status durations, pending Move durations, timer and
  AI decision windows remain simulation milliseconds.
- Simulation scale controls how much simulation time enters the fixed-step
  accumulator per wall-clock interval. Paused scale enters no simulation tick.
  The report continues to record the exact accepted simulation deltas.
- Duration-based statuses therefore expire after the same simulation duration
  at every scale. Slow motion lasts longer in wall time; fast-forward lasts
  less. Pause freezes statuses, Charge, AI and the battle timer.
- Presentation scale changes only countdown, presentation-lock and cosmetic
  transition wall time. It must not change any simulation delta, command
  legality, RNG call or combat outcome.
- Player-facing production runs resolve all gameplay modifiers before combat.
  Developer simulation and presentation speeds may change while paused in the
  inspector. A versioned `runtimeModifierChanges` report stream records
  sequence, simulation timestamp, wall pacing value and source.
- Speed changes take effect only on a fixed-step boundary while presentation
  and AI clocks are coherently held. Never multiply accumulated timestamps or
  mutate recorded ticks retrospectively. Clear/rebase only the wall-clock
  accumulator and AI wall deadline; preserve simulation elapsed time.
- Replay reproduces combat from recorded simulation ticks and gameplay
  modifiers. Presentation playback consumes recorded presentation scale/events
  but cannot affect combat verification.

### 4.4 Dev Mode boundary

Add one explicit global **Dev Mode** toggle, default off. It is a local
preference separate from all Player profiles and production progression.

- Dev Mode off hides Developer Lab, development settings, the in-battle DEV
  control, inspector mutation controls, development grants and developer query
  overrides. Deep links to development routes return to a safe production
  route. Existing build-time development availability is necessary but no
  longer sufficient.
- Dev Mode on exposes the permitted typed modifiers in Settings, Developer Lab
  and the paused inspector. Every developer control says **Developer override**
  and every affected fight says **ASSISTED / NO PROGRESSION / NOT ACCEPTANCE**.
- Enabling Dev Mode may require a deliberate Settings action; it must not be
  enabled by loading a development scenario or query string.
- Turning Dev Mode off clears session overrides and exits development routes,
  but does not erase reports. It does not alter profile saves.
- Direct state edits should migrate onto typed modifiers or clearly versioned
  debug actions. Unsupported edits remain unreplayable and acceptance-invalid.

### 4.5 Mode-by-mode modifier policy

Legend used below: `pre` means before Battle only; `paused` means changeable
only from a blocking paused inspector; `encounter` means resets when the fight
ends; `preference` means the selected visual/accessibility preference persists.
All developer-controlled entries require Dev Mode on and invalidate progression,
rewards, achievements and release acceptance for that run, even when a row
would otherwise be eligible.

#### Quick Fight

Quick Fight is progression-neutral. Standard rules may be release evidence;
any player custom rule marks the profile history entry custom and invalidates
release acceptance.

| Modifier                    | Configurer and ordinary visibility                            | Change in Battle               | Eligibility and acceptance                                                   | Lifetime                               |
| --------------------------- | ------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------- | -------------------------------------- |
| Simulation scale            | Developer only; hidden ordinarily                             | Paused                         | No rewards/progression; invalid                                              | Encounter                              |
| Presentation speed          | Player accessibility preference; developer override labelled  | Player: pre; developer: paused | Profile history only; valid only when evidence names the non-standard pacing | Preference/player; encounter/developer |
| Player Charge rate          | Player in Advanced Custom Rules; developer                    | Pre                            | Profile history marked custom; invalid                                       | Encounter                              |
| Opponent Charge rate        | Player in Advanced Custom Rules; developer                    | Pre                            | Profile history marked custom; invalid                                       | Encounter                              |
| Player starting Charge      | Player in Advanced Custom Rules; developer                    | Pre                            | Profile history marked custom; invalid                                       | Encounter                              |
| Opponent starting Charge    | Player in Advanced Custom Rules; developer                    | Pre                            | Profile history marked custom; invalid                                       | Encounter                              |
| Passive Opponent            | Player custom practice rule; developer                        | Pre                            | Profile history marked custom; invalid                                       | Encounter                              |
| Player cannot be defeated   | Developer only; hidden ordinarily                             | Pre                            | Assisted; invalid                                                            | Encounter                              |
| Opponent cannot be defeated | Developer only; hidden ordinarily                             | Pre                            | Assisted; invalid                                                            | Encounter                              |
| Timer override              | Player custom rule within safe presets; developer exact value | Pre                            | Profile history marked custom; invalid                                       | Encounter                              |

#### Custom Tournament

Custom Tournament is a sandbox configuration, distinct from authored Wrong
Door Cup progression. It never grants official Trophy, Stamps, XP or Story
credit.

| Modifier                    | Configurer and ordinary visibility         | Change in Battle               | Eligibility and acceptance                         | Lifetime                               |
| --------------------------- | ------------------------------------------ | ------------------------------ | -------------------------------------------------- | -------------------------------------- |
| Simulation scale            | Developer only                             | Paused                         | No official progression/reward; invalid            | Encounter                              |
| Presentation speed          | Player accessibility preference; developer | Player: pre; developer: paused | Custom record only; invalid as standard acceptance | Preference/player; encounter/developer |
| Player Charge rate          | Player custom rule; developer              | Pre                            | Custom record only; invalid                        | Tournament ruleset, then reset         |
| Opponent Charge rate        | Player custom rule; developer              | Pre                            | Custom record only; invalid                        | Tournament ruleset, then reset         |
| Player starting Charge      | Player custom rule; developer              | Pre                            | Custom record only; invalid                        | Per round from ruleset, then reset     |
| Opponent starting Charge    | Player custom rule; developer              | Pre                            | Custom record only; invalid                        | Per round from ruleset, then reset     |
| Passive Opponent            | Player practice tournament; developer      | Pre                            | Custom record only; invalid                        | Tournament ruleset, then reset         |
| Player cannot be defeated   | Developer only                             | Pre                            | Assisted; invalid                                  | Encounter                              |
| Opponent cannot be defeated | Developer only                             | Pre                            | Assisted; invalid                                  | Encounter                              |
| Timer override              | Player safe presets; developer exact value | Pre                            | Custom record only; invalid                        | Tournament ruleset, then reset         |

#### Authored Tournament rounds

Authored values are official encounter rules. Ordinary players see a concise
Rules summary, not editing controls. Developer overrides always win only in an
assisted copy of the round.

| Modifier                    | Configurer and ordinary visibility                                                   | Change in Battle      | Eligibility and acceptance                                            | Lifetime                                    |
| --------------------------- | ------------------------------------------------------------------------------------ | --------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| Simulation scale            | Developer only                                                                       | Paused                | Assisted override invalid; official run otherwise eligible            | Encounter                                   |
| Presentation speed          | Author pacing or player accessibility preference; visible summary where non-standard | Pre; developer paused | Official rewards/progression remain; standard acceptance names pacing | Preference or encounter                     |
| Player Charge rate          | Author; developer override                                                           | Pre                   | Official rewards/progression eligible when authored                   | Encounter                                   |
| Opponent Charge rate        | Author; developer override                                                           | Pre                   | Official rewards/progression eligible when authored                   | Encounter                                   |
| Player starting Charge      | Author/interstitial; developer override                                              | Pre                   | Official rewards/progression eligible when authored                   | Encounter; carried interstitial is consumed |
| Opponent starting Charge    | Author; developer override                                                           | Pre                   | Official rewards/progression eligible when authored                   | Encounter                                   |
| Passive Opponent            | Author only for a declared special round; developer                                  | Pre                   | Eligible if authored and disclosed; assisted otherwise                | Encounter                                   |
| Player cannot be defeated   | Developer only                                                                       | Pre                   | Assisted; invalid                                                     | Encounter                                   |
| Opponent cannot be defeated | Developer only                                                                       | Pre                   | Assisted; invalid                                                     | Encounter                                   |
| Timer override              | Author; developer                                                                    | Pre                   | Official rewards/progression eligible when authored                   | Encounter                                   |

#### Story encounters

Story exposes authored rules and ordinary accessibility preferences. No
player-facing gameplay assist from this vocabulary is added until Gate V2-02
feedback establishes a need and the game-design rule is updated. If a future
cannot-be-defeated Story assist is approved, Story progress and authored rewards
remain available, challenge achievements opt out explicitly, and the report is
assisted rather than acceptance-valid.

| Modifier                    | Configurer and ordinary visibility                                          | Change in Battle      | Eligibility and acceptance                                        | Lifetime                |
| --------------------------- | --------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------- | ----------------------- |
| Simulation scale            | Developer only                                                              | Paused                | Assisted override invalid; official run otherwise eligible        | Encounter               |
| Presentation speed          | Author pacing or player accessibility preference; visible when non-standard | Pre; developer paused | Story progress/rewards eligible; standard acceptance names pacing | Preference or encounter |
| Player Charge rate          | Author; developer override                                                  | Pre                   | Eligible when authored; assisted when developer-set               | Encounter               |
| Opponent Charge rate        | Author; developer override                                                  | Pre                   | Eligible when authored; assisted when developer-set               | Encounter               |
| Player starting Charge      | Author; developer override                                                  | Pre                   | Eligible when authored; assisted when developer-set               | Encounter               |
| Opponent starting Charge    | Author; developer override                                                  | Pre                   | Eligible when authored; assisted when developer-set               | Encounter               |
| Passive Opponent            | Author for an explicitly taught encounter; developer                        | Pre                   | Eligible when authored/disclosed; assisted otherwise              | Encounter               |
| Player cannot be defeated   | Not exposed initially; developer only                                       | Pre                   | Assisted; no challenge achievements; invalid                      | Encounter               |
| Opponent cannot be defeated | Developer only                                                              | Pre                   | Assisted; invalid                                                 | Encounter               |
| Timer override              | Author; developer                                                           | Pre                   | Eligible when authored; assisted when developer-set               | Encounter               |

#### Developer Lab

Every control is visible only with Dev Mode on. No Developer Lab run changes
Story, Tournament, Missions, collection, Stamps or official achievements.

| Modifier                    | Configurer and visibility | Change in Battle | Eligibility and acceptance     | Lifetime  |
| --------------------------- | ------------------------- | ---------------- | ------------------------------ | --------- |
| Simulation scale            | Developer, explicit       | Paused           | No progression/reward; invalid | Encounter |
| Presentation speed          | Developer, explicit       | Paused           | No progression/reward; invalid | Encounter |
| Player Charge rate          | Developer, explicit       | Pre              | No progression/reward; invalid | Encounter |
| Opponent Charge rate        | Developer, explicit       | Pre              | No progression/reward; invalid | Encounter |
| Player starting Charge      | Developer, explicit       | Pre              | No progression/reward; invalid | Encounter |
| Opponent starting Charge    | Developer, explicit       | Pre              | No progression/reward; invalid | Encounter |
| Passive Opponent            | Developer, explicit       | Pre              | No progression/reward; invalid | Encounter |
| Player cannot be defeated   | Developer, explicit       | Pre              | No progression/reward; invalid | Encounter |
| Opponent cannot be defeated | Developer, explicit       | Pre              | No progression/reward; invalid | Encounter |
| Timer override              | Developer, explicit       | Pre              | No progression/reward; invalid | Encounter |

#### Fixed acceptance scenarios

The canonical scenario definition is immutable release evidence. Assisted
variants use distinct IDs and cannot replace its report.

| Modifier                    | Configurer and ordinary visibility                                                   | Change in Battle                         | Eligibility and acceptance        | Lifetime  |
| --------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------- | --------------------------------- | --------- |
| Simulation scale            | Canonical `1`; assisted developer copy only                                          | Never canonical; paused in assisted copy | Canonical valid; assisted invalid | Encounter |
| Presentation speed          | Canonical `1`; named style may vary cosmetically; assisted copy only for other speed | Never canonical                          | Canonical valid; assisted invalid | Encounter |
| Player Charge rate          | Canonical `1`; assisted developer copy only                                          | Never                                    | Canonical valid; assisted invalid | Encounter |
| Opponent Charge rate        | Canonical `1`; assisted developer copy only                                          | Never                                    | Canonical valid; assisted invalid | Encounter |
| Player starting Charge      | Canonical `0`; assisted developer copy only                                          | Never                                    | Canonical valid; assisted invalid | Encounter |
| Opponent starting Charge    | Canonical `0`; assisted developer copy only                                          | Never                                    | Canonical valid; assisted invalid | Encounter |
| Passive Opponent            | Canonical off; assisted developer copy only                                          | Never                                    | Canonical valid; assisted invalid | Encounter |
| Player cannot be defeated   | Canonical off; assisted developer copy only                                          | Never                                    | Canonical valid; assisted invalid | Encounter |
| Opponent cannot be defeated | Canonical off; assisted developer copy only                                          | Never                                    | Canonical valid; assisted invalid | Encounter |
| Timer override              | Canonical 90 seconds; assisted copy only                                             | Never                                    | Canonical valid; assisted invalid | Encounter |

The `v2.viking-acceptance` resolver test must assert its complete standard
fingerprint. A scenario carrying any non-canonical gameplay value, Dev Mode
override or debug state edit fails acceptance classification even if its
lineups, seed and outcome match.

### 4.6 Automation contract

Every exposed field uses stable semantic form controls and names such as
`battleModifier.playerStartingCharge`; presets use stable IDs; assisted status
is queryable through semantic text or `data-assistance-state`. Browser tests
must select options through those controls, not `evaluate` mutations or CSS
selectors tied to layout. A report download exposes the same resolved summary
shown before Battle.

## 5. Screenshot-led spatial batches

These batches may prepare evidence before Gate V2-02 returns, but Dean sees the
variants before any spatial direction is implemented. Each batch starts from
the running application and captures `390 × 844`, `844 × 390`, and
`1728 × 1117`.

### Batch U01 — Main Menu

- Consult `docs/v2-release-spec.md` sections 3.6 and 5, `docs/game-design.md`
  section 4, `docs/brand-and-site.md`, `DESIGN.md` spatial approval status and
  `docs/view-inventory.md`.
- Capture real states: fresh profile, resumable Story, completed Story/open
  Quick Fight, active standalone Tournament, storage warning, and Dev Mode
  off/on where it changes visibility.
- Produce at least three compositions that genuinely change hierarchy and
  spatial ownership, not palette: Story-led bill, equal mode selection, and a
  compact roster/session-led launcher are valid hypotheses.
- Show full responsive triptychs and note primary action, mode consequences,
  scroll, focus order and assets retained from the real app.
- Dean chooses, combines named parts or rejects the set before implementation.

### Batch U02 — navigation

- Use the real global and Story contexts. Capture global default, global active
  Profile/Settings, Story default, deep Story destination, compact bottom rail,
  long labels/focus, storage warning and battle return path.
- Produce at least three structures with different navigation ownership, while
  preserving global versus Story separation and an explicit Exit game action.
- Demonstrate keyboard order, active state, safe areas, label compression and
  all three target viewports.
- Dean approves a structure before shell CSS/markup is spatially replaced.

### Batch U03 — Shared Fight Setup

- Use real Quick Fight, Story loan/owned Lineup, Tournament deployment/carried
  Health, custom/assisted rules summary, invalid configuration and confirmation
  states.
- Show one-to-three Characters, empty optional slots, Accessories, Types,
  Traits, builds, opponent information permitted by the mode, seed/rules
  disclosure, eligibility and the primary confirmation action.
- Produce at least three genuinely different compositions: side-by-side bill,
  ordered Lineup rail, and staged confirm/review are candidate structures, not
  approvals.
- Cover keyboard/touch, error/focus movement, compact landscape, portrait and
  desktop. Dean sees the variants before implementation.

Generated copy and art in these studies are temporary supporting material.
Authoritative gameplay terms, truthful mode consequences and approved identity
remain dominant.

## 6. Ordered release-gate continuation

```text
V2-02 Battle understanding
  ├─ owner playtest → feedback reconciliation → Battle direction lock
  └─ autonomous modifier/report foundation and defect evidence
       ↓
V2-03 complete application flow
  ├─ Main Menu batch → owner choice → implementation
  ├─ navigation batch → owner choice → implementation
  ├─ Shared Fight Setup batch → owner choice → implementation
  └─ landing choice → landing implementation
       ↓
V2-04 content and progression
  ├─ six-kit capability gaps and calibration
  ├─ Story proof, Wrong Door Cup and mode isolation
  └─ validated content templates
       ↓
V2-05 target-device quality
       ↓
V2-06 measured performance
       ↓
V2-07 accessibility and resilience
       ↓
V2-08 release proof and freeze
```

This is a dependency order, not a ban on parallel preparation. While V2-02 is
open, agents may build M01–M03, capture U01–U03 source evidence, audit content
contracts, add non-spatial accessibility tests and establish performance
instrumentation. They may not lock Battle feel, implement an unreviewed spatial
variant, claim a later gate, or pull V2.1 breadth into V2.

Target-device, performance and accessibility work starts earlier as continuous
quality work, then receives its gate-wide proof after V2-03/V2-04 critical paths
stabilise. V2-08 alone freezes scope, accepted evidence, artefact and tag.

## 7. Bounded implementation packets

### M01 — typed modifier and Dev Mode foundation

- **Objective:** Add the validated modifier vocabulary, source resolver,
  eligibility result and explicit global Dev Mode boundary with production
  defaults unchanged.
- **Authorities:** release specification sections 3.3–3.6 and gates V2-02–04;
  game design sections 4–5, 12 and 14; technical design session composition,
  determinism, content, persistence and testing; specification alignment.
- **Likely surface:** new `src/combat/modifiers.ts`; `src/combat/types.ts`;
  `src/content/schema.ts`; `src/dev/scenarios.ts`; preferences adapter;
  `src/app/App.ts`; route/screen visibility selectors.
- **Tests/browser states:** schema bounds and source precedence; default
  fingerprint; each mode rejects forbidden sources; Dev Mode off/on route and
  control visibility; no-mutation default engine comparisons.
- **Evidence:** focused test output plus Settings/Main Menu/Developer Lab states
  with Dev Mode off and on at one narrow and one desktop viewport.
- **Owner decision:** none.
- **Completion:** all existing fights resolve the standard defaults; Dev Mode
  off removes developer-only controls; no reward code is yet duplicated.
- **Dependencies:** none beyond current Gate 1 implementation.
- **Before playtest:** yes; this is the next safe packet.

### M02 — versioned report, replay and acceptance classification

- **Objective:** Record resolved modifiers, provenance, Dev Mode, eligibility,
  fingerprint and permitted runtime speed changes in a new Battle Report schema;
  replay from those recorded facts.
- **Authorities:** technical-design determinism/report rules and release
  acceptance benchmark.
- **Likely surface:** `src/combat/report.ts`, `src/combat/replay.ts`, migration or
  reader compatibility, result/report download, `src/dev/v2-acceptance.ts`.
- **Tests/browser states:** schema v2 compatibility; schema v3 round-trip;
  replay with charge/timer/rate modifiers; visual-speed outcome invariance;
  assisted classification; canonical Viking fingerprint rejection tests.
- **Evidence:** canonical and assisted report excerpts with visibly different
  classification; unchanged four-Move benchmark metrics.
- **Owner decision:** none.
- **Completion:** playback consumes recorded modifiers and an assisted report
  cannot pass release acceptance.
- **Dependencies:** M01.
- **Before playtest:** yes.

### M03 — deterministic runtime pacing

- **Objective:** Implement fixed-step simulation scaling, pause/slow/fast
  runtime changes and independent presentation pacing without outcome drift.
- **Authorities:** game-design presentation classes; technical-design timing,
  AI and replay rules.
- **Likely surface:** battle loop in `App.ts`, presentation timing module,
  paused inspector, report runtime-change stream.
- **Tests/browser states:** status expiry at scales; AI window integrity;
  accumulator boundary changes; pause during pending Move/status; identical
  final report events across presentation speeds; semantic paused controls.
- **Evidence:** paired deterministic reports and browser capture of labelled
  paused inspector.
- **Owner decision:** none on capability; presentation-speed player exposure
  waits for playtest evidence if it changes product feel.
- **Completion:** mid-fight developer speed changes cannot corrupt timestamps,
  Charge, AI, locks or replay.
- **Dependencies:** M01–M02.
- **Before playtest:** yes, if isolated from the canonical candidate defaults.

### M04 — mode construction and authored modifier data

- **Objective:** Replace `App.startBattle` modifier branches with mode-owned
  configuration builders and validated authored encounter rules.
- **Authorities:** game-design mode rules; technical-design match composition;
  content schema; release mode isolation.
- **Likely surface:** Story encounter data, Tournament round data, Quick Fight
  session model, new configuration builders and construction tests.
- **Tests/browser states:** Story, authored Tournament, Quick Fight, custom
  Tournament, Developer Lab and acceptance builders; reward/eligibility matrix;
  rules summary model.
- **Evidence:** fixture table of resolved configurations and fingerprints.
- **Owner decision:** none for foundation; ordinary custom-rule exposure remains
  bounded by this programme.
- **Completion:** every mode reaches `createBattle` through the same resolver and
  consequence code consumes its eligibility result.
- **Dependencies:** M01–M02.
- **Before playtest:** yes.

### M05 — semantic modifier controls

- **Objective:** Expose only the permitted subsets in Developer Lab, Settings,
  paused inspector, Quick Fight custom rules and custom Tournament.
- **Authorities:** modifier policy above; semantic DOM and accessibility rules.
- **Likely surface:** pure screen models/renderers, App event delegation,
  settings, Developer Lab, Fight Setup rules summary.
- **Tests/browser states:** keyboard/touch selection, validation errors, Dev Mode
  off/on, standard/custom/assisted labels, report download.
- **Evidence:** screenshots at all three viewports once attached to the approved
  setup composition; DOM tests may precede it.
- **Owner decision:** setup placement waits for U03; control semantics do not.
- **Completion:** browser automation selects every permitted modifier without
  DOM injection and forbidden controls are absent.
- **Dependencies:** M01–M04; U03 for final spatial implementation.
- **Before playtest:** semantic model/tests yes; final spatial UI no.

### B01 — Gate V2-02 observation reconciliation

- **Objective:** Reproduce and triage Dean's raw feedback, fix unambiguous
  defects, and prepare only genuinely ambiguous decisions.
- **Authorities:** battle rules, technical timing, DESIGN Battle status and
  release Gate V2-02.
- **Likely surface:** depends on evidence; keep gameplay, interaction,
  presentation-active and cosmetic changes separate.
- **Tests/browser states:** fixed-seed reproduction and relevant states at all
  three viewports; physical phone recheck for material changes.
- **Evidence:** raw-note ledger, classification, before/after captures and
  report comparison.
- **Owner decision:** only unresolved direction or final Battle approval.
- **Completion:** every observation has a disposition and Gate V2-02 is either
  accepted or has one bounded revision packet.
- **Dependencies:** owner playtest.
- **Before playtest:** no.

### U01, U02 and U03 — real-application design batches

- **Objective:** Prepare the Main Menu, navigation and Shared Fight Setup
  batches specified in section 5.
- **Authorities:** release view contract, game design mode flow, technical route
  ownership, brand/site, DESIGN and view inventory.
- **Likely surface:** real app running state, browser capture harness, retained
  mock-up/evidence directories and batch documents; no production layout edits.
- **Tests/browser states:** every state and viewport named in section 5.
- **Evidence:** labelled responsive triptychs, measured state notes and variant
  rationale.
- **Owner decision:** required separately for each batch.
- **Completion:** Dean has reviewable, genuinely different real-app variants.
- **Dependencies:** none for evidence capture; U03 incorporates M04 rules
  summaries when available.
- **Before owner review:** F00 must complete first. Prepare Shared Lineup before
  Main Menu and navigation; request each review separately unless Dean asks to
  combine them.

### U04 — approved application shell implementation

- **Objective:** Implement the selected Main Menu, navigation and Shared Fight
  Setup directions as three inspectable slices.
- **Authorities:** each approved batch plus existing view and accessibility
  contracts.
- **Likely surface:** screen renderers, shell, route manifest and scoped style
  modules.
- **Tests/browser states:** full route/session matrix, empty/loading/error and
  recovery states, keyboard/touch, all target viewports.
- **Evidence:** before/after real screenshots and browser flow recording.
- **Owner decision:** batch choices required before each slice.
- **Completion:** production surfaces match the selected structures without
  treating previous layouts as approved.
- **Dependencies:** relevant U01/U02/U03 approval; M04–M05 for setup rules.
- **Before playtest:** no spatial implementation.

### C01 — six-kit capability and calibration closure

- **Objective:** Complete the remaining reusable launch-kit primitives and
  fixed-seed coverage without character-specific branches.
- **Authorities:** game design, launch-roster calibration, specification
  alignment and mechanic registry.
- **Likely surface:** content schema/data, combat reducers/AI, reports and
  targeted UI explanation.
- **Tests/browser states:** each primitive in engine, AI, counterplay, UI,
  replay and one fixed scenario.
- **Evidence:** registry proof columns and scenario/report package.
- **Owner decision:** only if a rule remains genuinely ambiguous after the
  accepted research disposition.
- **Completion:** all six roster calibration rows satisfy their release proof.
- **Dependencies:** Gate V2-02 direction for presentation; domain work may
  proceed earlier.
- **Before playtest:** domain contracts only.

### C02 — end-to-end Story, Tournament and progression proof

- **Objective:** Close First Run, Wrong Door Cup, Missions, Store, rewards,
  recovery, Trophy and mode-isolation paths.
- **Authorities:** release gates V2-03/V2-04 and game-design sections 8–11.
- **Likely surface:** Story/Tournament orchestration, persistence, economy,
  missions, results and recovery screens.
- **Tests/browser states:** clean profile through ending; every loss/retry;
  carried Health/Accessory exhaustion; no Quick/Dev reward leakage; save reload.
- **Evidence:** deterministic reports, save snapshots and complete browser flow.
- **Owner decision:** Trophy visual-family review is V2.1-template quality, not a
  blocker to functional V2 proof unless Dean identifies a V2 defect.
- **Completion:** Gate V2-04 contracts pass end to end.
- **Dependencies:** M04 and approved U04 setup/navigation.
- **Before playtest:** isolated domain checks yes; final flow no.

### C03 — content templates and registry closure

- **Objective:** Produce validated templates only for rules proven by C01/C02.
- **Authorities:** release content-factory contract, technical content rules and
  source ledger.
- **Likely surface:** authoring docs, schemas, registries, dry-run/preview tasks
  and mechanic proof rows.
- **Tests/browser states:** template validation, missing asset/fallback,
  provenance, AI compatibility and preview route.
- **Evidence:** one recreated representative structure per required template.
- **Owner decision:** none.
- **Completion:** ordinary content additions require no renderer or bespoke
  domain branch.
- **Dependencies:** C01–C02.
- **Before playtest:** audit only.

### Q01 — target-device, performance, accessibility and resilience closure

- **Objective:** Execute Gates V2-05–V2-07 over the stable critical path.
- **Authorities:** release gates, technical responsive/testing/deployment rules
  and DESIGN.
- **Likely surface:** loading boundaries, assets/audio, safe areas, focus,
  storage recovery and measured fixes.
- **Tests/browser states:** physical iPhone 14 portrait/landscape, 16-inch 2024
  MacBook Pro, automated reference viewports, 20-minute session, rotation,
  background/resume, text scaling, reduced motion and corrupt storage.
- **Evidence:** transfer/frame/decode baseline, device checklist, accessibility
  audit and recovery artefacts.
- **Owner decision:** physical-device feel confirmation where required.
- **Completion:** Gates V2-05, V2-06 and V2-07 each have measured evidence.
- **Dependencies:** stable V2-03/V2-04 critical path; instrumentation may start
  earlier.
- **Before playtest:** instrumentation and non-spatial audits yes.

### R01 — release proof and freeze

- **Objective:** Satisfy Gate V2-08 and freeze the accepted V2 artefact.
- **Authorities:** V2 release specification and roadmap.
- **Likely surface:** final documents, manifests, migrations, CI artefact,
  deployment and release notes.
- **Tests/browser states:** complete accepted matrix and production candidate.
- **Evidence:** passing `mise run check`, GitHub Actions artefact, candidate URL,
  accepted issues ledger, tag and GitHub Release.
- **Owner decision:** final release acceptance.
- **Completion:** status changes to release accepted/frozen and `v2.0.0` points
  at the reviewed artefact.
- **Dependencies:** every prior release gate.
- **Before playtest:** no.

## 8. Current owner in-tray audit

The repository contains three ready/current activities, with different release
weight:

1. **IN-007 Trophy-family review — ready, not a current V2 blocker.**
   Functional Trophy persistence is implemented. The review primarily locks a
   reusable V2.1 Tournament-art family unless it uncovers a V2 defect.
2. **IN-009 landing-page composition — ready, Gate V2-03 dependency.** The
   decision unblocks landing implementation and its social image.

IN-008 developer memberships waits until after V2.3. IN-010 is retired because
multiplayer has no committed milestone. IN-001 through IN-006, IN-011, and
IN-012 are complete. F00 is complete and no new owner question is required to
implement the Shared Lineup package.

## 9. Immediate handoff

Implement **Package 01 — Shared Lineup** against the completed F00 contracts.
Quick Fight may arrive pre-filled or fully editable, Story supplies only
eligible Story-owned/loaned instances, and Tournament supplies only living
members of its locked six. All three choose one to three, choose one starter,
show current build/Health/Accessory/rules evidence, and produce exactly one
validated Lineup confirmation before Battle.

At the end of each packet, update the owning authorities, schema, tests,
mechanic registry and trays together only where their facts changed. Run
`mise run check`; do not report a gate as passed from unit tests alone.
