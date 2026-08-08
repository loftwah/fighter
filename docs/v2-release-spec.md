# LOFTWAH FIGHTER V2 release specification

Status: **RATIFIED PROGRAMME CONTRACT — RELEASE NOT FROZEN**

Created: 2026-07-31

Target release: **V2** (`v2.0.0`)

This document owns the scope, release gates, and freeze conditions for V2.
`docs/game-design.md` continues to own detailed product rules,
`docs/technical-design.md` owns architecture, and `DESIGN.md` owns the
implemented visual system.

The owner questionnaire was reconciled on 2026-07-31. This contract is now
ratified for implementation. Ratification fixes the programme and decision
boundary; it does not claim that the release gates have passed or that V2 is
ready to tag.

## 1. V2 is the baseline

V2 is the first release we intend to treat as a complete product baseline,
rather than another prototype.

Everything that predates the ratified V2 specification becomes preserved
research, decision history, or implementation evidence. Archive status does not
mean deletion, concealment, or disuse. It means older material cannot silently
override the V2 authorities.

After V2 is accepted:

- V2 feature scope freezes;
- fixes, accessibility corrections, performance work, compatibility work, and
  documentation corrections may ship as `2.0.x`;
- new Characters, systems, modes, and content breadth target the next roadmap
  milestone;
- the accepted source, content manifests, schemas, migrations, tests, and
  release evidence are tagged together as `v2.0.0`;
- every older proposal remains traceable through
  `docs/v2-source-ledger.md`, `docs/specification-alignment.md`, and Git
  history.

## 2. Release promise

V2 is a polished, mobile-first responsive web game built around the initial six
Characters. A player can understand the battle, make deliberate decisions,
complete a satisfying fight-and-progression loop, and move through the
application without encountering prototype seams.

The owner-defined emotional result is deliberately plain:

> That was actually pretty fun.

The product evidence behind that reaction is:

> I understood the fight, my choices mattered, the Characters felt distinct,
> and I wanted one more battle.

## 3. Fixed V2 scope

### 3.1 Platforms

- V2 is a responsive website. It does not install a service worker and is not
  marketed as a PWA or native application.
- The design starts with the iPhone 14 portrait experience, supports iPhone 14
  landscape where it improves play, and expands deliberately to the 16-inch
  2024 MacBook Pro desktop reference.
- Current mobile Safari is the primary mobile browser. Current Safari and
  Chromium are the desktop references.
- Touch is first-class. Mouse and keyboard remain complete input methods.
- Combat rules, content, and presentation timing never fork by device.

### 3.2 Launch roster

V2 ships exactly the accepted initial six Characters:

1. Tux;
2. Humpty Dumpty;
3. Moses;
4. Viking;
5. Ned Kelly;
6. Grim Reaper.

Together they provide:

- all six normal Combat Types;
- three authored Moves each;
- readable Type and Team Trait identities;
- complete V2 artwork and provenance records;
- enough mechanical variety to prove the reusable combat vocabulary.

The six kits must also satisfy the role-by-role functional acceptance register
in `docs/launch-roster-calibration.md`. Viking is the default first owned and
Quick Fight Character and intentionally provides the forgiving leader
benchmark. A roster slot is not V2-complete merely because its Type, art, and
three Move IDs exist.

The release does not wait for a larger roster. The expansion from six to twenty
Characters belongs to V2.1.

### 3.3 Battle

V2 must make the shared battle system release-ready before it broadens:

- one deterministic combat engine serves every mode;
- Viking's stackable next-Move Power, upgraded undodgeable returning hit, and
  strongest hit-plus-stun loop is the first fixed functional benchmark;
- each side deploys one to three Characters with one active at a time;
- Health, Charge, readiness, available Moves, Lineup state, and recent events
  remain readable without searching the screen;
- damaging Move seals always show current attack points; Power and attack-down
  effects update every applicable seal immediately with distinct positive,
  negative, neutral, and reduced-motion-safe treatments;
- player and opponent consoles keep Health and Charge together;
- the player's Move-and-Charge field is the primary interaction surface and the
  opponent race remains almost as legible;
- all deployed Characters remain edge-visible with Health and inspectable Moves;
- Move category and upgrade tier use the independent labelled two-band system;
- the player receives enough decision time to understand what is available;
- defeat can be explained through the battle report and post-fight surface;
- Easy remains forgiving and Story progress is never difficulty-gated;
- fixed seeds make balance and presentation defects reproducible.

The researched product is a decision reference rather than a source of exact
recoverable constants. V2 therefore keeps the current measured baselines until
fixed-seed play provides better evidence: a middle-Tempo 25-Charge threshold in
about 4.0 seconds, post-presentation AI windows of 1.8/1.4/0.9/0.6 seconds from
Easy through Brutal, seeded bounded variance, and full loss evidence in the
Battle Report. `UNKNOWN EXACT` source timing or AI weights are never treated as
implemented facts.

The first acceptance fight is `v2.viking-acceptance`: Standard-build Viking
versus Standard-build Grim Reaper on Normal, with Second Wind versus Dead Air,
seed `3844240869`, and the ordinary 90-second limit. It is intentionally
favourable through Viking's Brawler-versus-Beast Type edge. The reference
script makes its first decision at 2.0 seconds, uses Battle Boast → Axe First →
Battle Boast → Berserker Oath → Axe First → Battle Boast → Axe First, wins
after 31.4 seconds of simulation and about 57.87 seconds including countdown
and presentation holds, finishes at about 49% Health, and records 170 landed
damage from Axe First. Under the fixed headless controller and 100-millisecond
tick schedule, Berserker Oath is dodged, so its reauthored pool does not
silently change that benchmark's duration or finishing Health.
Between those Moves, the reference controller collects any
available player Drop and activates Second Wind when fully charged. This is a
regression benchmark, not a claim that one scripted sequence is the only good
way to play. A second acceptance run waits 1.5 seconds after each player
command first becomes available; it must still win with the same seven-Move
policy and more than 20% Health. That delayed run is the minimum automated
evidence that Normal tolerates comprehension and reaction time rather than
requiring a zero-latency controller.

The benchmark passes Gate 1 only when the same policy can be completed through
the real semantic controls at the Tier 1 viewports and the result explanation
matches its Battle Report. A headless win alone is necessary deterministic
evidence, not player-facing acceptance. On 2026-08-08, the recalibrated
seven-Move policy completed at `390 × 844`, `844 × 390`, and `1728 × 1117`
through the semantic Move, Drop, and Accessory controls. The three exported
reports recorded the expected seed, player win, seven Moves, 170 Axe First
damage, two critical hits, no dodges, and 31.44–31.50 seconds of simulation.
In those real-control runs Berserker Oath was interrupted rather than dodged.
The explicit seed remains deterministic for a given input and tick schedule;
real browser input/tick cadence explains both that branch and the sub-0.1-second
duration spread from the fixed headless schedule. Each result poster showed the
decisive hit, both sides' leading damage, Type edge, random-event record, and
named Move counts with no page overflow. Owner feel playtesting remains open.

### 3.4 Modes

V2 proves the complete application and shared mode architecture without trying
to be the content-breadth release.

#### Quick Fight

Quick Fight is the primary repeatable V2 experience:

- all six Characters are available;
- the Main Menu enters Character Select directly; there is no separate Quick
  preset destination;
- Full Power is the default registered preset, Hot Start is the alternate
  registered preset, and Custom names the current manually edited values;
- exact duplicate Characters and every V2-supported level/build customisation
  are accepted by the Custom path;
- the shared Fighter Select chooses both Lineups without native Character
  dropdowns and owns one visual Accessory choice per Lineup;
- Quick Fight Settings contains one compact preset dropdown which updates its
  related visible rules and builds in place; all Quick drafts pass through this
  stage before Review Fight;
- both resolved Lineups pass through one read-only shared Fight Setup
  confirmation before Battle;
- sandbox builds are progression-neutral;
- supported Custom rules are clearly labelled;
- Full Power starts all fighters at Level 25 with the full V2 stat allocation
  and Platinum Moves; Hot Start keeps those builds and raises opening Charge;
- the effective Quick difficulty, clock, opening Charge, seed, team
  Accessories, and each selected sandbox build are captured in one immutable
  configuration which the Battle consumes without rereading Global Settings;
- fights do not mutate Story or Tournament progression;
- the selected Profile records Quick Fight fights, wins, losses, last seed,
  and the last two Lineups without granting progression rewards;
- a player can immediately rematch, change Lineups, or return to the launcher.

#### Story

V2 contains one short, coherent, end-to-end Story proof:

- authored dialogue or narration;
- Fight Setup;
- battle;
- result and reward;
- at least one progression, Store, Mission, choice, or Tournament transition;
- replay and forgiving recovery;
- persisted progress.
- one `story.first-run` Story Save owning its collection, builds, economy,
  Missions, Store, active Squad, progress, and Story-local Trophy records rather
  than placing those facts directly on the global Profile;
- ordered Level steps capable of composing content, grants, ordinary fights,
  the preset Tournament, and completion without a second combat engine;
- one registered Story completion award projected into the global Profile;
- a declared completion check requiring all three V2 Missions and the
  representative Tournament Trophy before the ending reward can be claimed;
- transition into the existing unrestricted Quick Fight sandbox after Story
  completion, without inventing a separate end-game mode.
- battles and Tournaments may be player-facing numbered levels; dialogue,
  rewards, hooks, choices, and other interstitial nodes retain stable internal
  IDs without being forced to display a level number.

This proves the Story engine, navigation, and content templates. V2.1 is the
first substantial Story-content release.

#### Tournament

V2 contains one complete representative Tournament:

- a locked roster of up to six;
- one-to-three deployed Characters per round;
- carried Health and defeat state;
- between-round decisions;
- repeat deployment against the same current opponent Squad while any locked
  player Roster member remains alive, with Health/defeat state preserved on
  both sides of that unfinished fight;
- complete-Roster defeat, confirmed forfeit, restart, victory, and reward;
- an activated Accessory is exhausted for the rest of that run;
- a unique registered Trophy with approved opaque artwork, de-duplicated in the
  selected Profile's global cabinet and also recorded in the First Run Story
  Save when won there;
- no reward leakage into development or Quick Fight.

This proves the Tournament system. V2.1 is the first substantial
Tournament-content release.

### 3.5 Progression and local data

V2 includes:

- three local Player profiles with distinct editable preset identities:
  Headliner, Contender, and Wildcard. The numeric profile slot remains visible
  for recovery, migration, and export;
- versioned, migration-safe local saves;
- autosave and corrupt-save recovery;
- a global Player/Profile boundary for identity, records, Story Save selection,
  Trophies, and Story awards, with Character ownership, XP, levels, economy,
  Store, Missions, stat allocation, Move ordering/positions/tiers, and
  Modifications nested in `story.first-run`;
- Stamps, rewards, a small Store, Missions, and Achievements sufficient to prove
  the complete loop;
- durable source-aware Tournament Trophy ownership, a global Profile cabinet,
  a Story-local cabinet, and one Story completion award;
- profile and battle-report export;
- explicit separation between preferences, Story progress, Quick Fight, and
  Tournament state.

V2 remains fully playable without an account or network API after its static
files have loaded.

### 3.6 Views and interaction contract

Every production-facing V2 view must have:

- one named purpose and an obvious primary action;
- known entry and exit paths;
- required, optional, empty, loading, and error states where applicable;
- deliberate iPhone portrait, iPhone landscape, and desktop composition;
- semantic controls, visible focus, touch-sized targets, and reduced-motion
  behaviour;
- no dead navigation, accidental game launch, hidden irreversible action, or
  unexplained locked state;
- consistent use of the global shell and mode-owned navigation.

The authoritative surface list is `docs/view-inventory.md`. Fight Lab is a
production-facing, progression-neutral power-user sandbox for named seeded
scenarios, custom one-to-three matchups, and report/profile export. Every Lab
fight is visibly marked `LAB FIGHT · NO PROGRESSION`. Development builds may
add inspectors, grants, unlocks, and direct simulation controls, but those
overrides remain separately labelled and unavailable in production.

### 3.7 Presentation and audio

V2 uses the accepted opaque rectangular and square artwork, two-frame swaps,
and Kinetic Panel Motion language.

V2 includes:

- complete approved production assets for the six Characters;
- responsive arena, Story, Tournament, and startup presentation;
- the current registered music library;
- independent music, SFX, and dialogue settings;
- silent fallback files for missing SFX and dialogue;
- no production dependency on transparent character art.

Produced SFX are a V2.1 requirement. Silent placeholders are acceptable in V2
only when the visible feedback completely explains the event.

### 3.8 Content factory

V2 must leave behind validated templates for at least:

- Character and provenance;
- three-Move kit and tactical categories;
- encounter and Lineup;
- Story node or short chapter;
- Tournament, Trophy, and interstitial;
- location/environment asset set.

An agent must be able to add content through validated data and registered
assets without adding a renderer or one-off combat branch.

Templates are produced only after their underlying rules and schemas survive
their owning implementation gate. This preserves the owner's instruction not
to freeze speculative templates before the product shape is understood.

## 4. Explicit V2 non-goals

These must not delay V2:

- more than six release Characters;
- a broad Story catalogue;
- a broad Tournament catalogue;
- produced dialogue;
- produced SFX;
- PWA installation or offline content-pack caching;
- accounts, cloud saves, remote telemetry, or a required backend;
- multiplayer;
- iOS or Android store packages;
- monetisation;
- open-world walking or map traversal;
- any renaming or rebrand beyond the accepted **LOFTWAH FIGHTER** public
  identity.

The relevant later requirements live in `docs/release-roadmap.md`.

## Gate 0 programme state — Reconcile

**Complete 2026-07-31.** This means the programme may proceed; it does not mean
any later release gate is complete.

- all 44 owner-questionnaire answers have an adoption, delegation, research,
  or deferral record below;
- all 117 preserved research mechanics have exactly one allowed disposition in
  `v2-brief/reference-game-mechanic-registry-v2.json`;
- the registry tracks the eleven required proof columns for every `ADOPT` and
  `ADAPT` row, uses mechanic-specific references where verified, and leaves
  missing proof visibly null;
- roadmap scope remains six Characters in V2 and twenty in V2.1, with
  multiplayer outside the committed V2–V2.3 programme;
- `v2.viking-acceptance` is the named fixed-seed Gate 1 benchmark;
- no `UNKNOWN EXACT` source value has been promoted into an authoritative
  constant;
- the game-first Battle and Shared Fight Setup candidate is implemented for
  owner playtest but is not yet a locked production direction; Main Menu and
  navigation remain explicitly unapproved production layouts with separate
  screenshot-led review gates.

The highest-risk remaining proof is player-facing Battle understanding on an
iPhone. Gate 0 recorded independently positioned Battle layers that overlapped
at the Tier 1 portrait viewport. The current candidate replaces the rail-first
dashboard with a full-screen arena, thin edge HUD, and dedicated matchup,
countdown, action, and result states. A two-defeat roster-switch regression
survives repeated arena resizes without invalidating an outgoing Phaser
texture. Gate V2-02 remains open until the owner confirms that the fight is
readable, forgiving, and satisfying in a physical-device playtest.

## 5. Release gates

V2 cannot be called complete because the features exist individually. It is
complete only when all gates pass together.

### Gate V2-01 — Decisions and traceability

- Questionnaire answers are reconciled into the authorities.
- Every unanswered V2 question is explicitly deferred or blocks ratification.
- Every reference-mechanic registry item has an adopted, adapted, deferred,
  rejected, already-covered, or unresolved status.
- No historical input directly overrides a newer accepted decision.

### Gate V2-02 — Battle understanding

- The owner approves at least one polished Quick Fight benchmark.
- Fixed-seed scenarios cover representative attack, stun, support, switching,
  Type, defeat, and comeback states.
- Both sides' Health, Charge, readiness, and Lineups remain readable.
- A player can identify why they won or lost from the result and report.
- Easy and Normal can be played without unexplained decision starvation.

### Gate V2-03 — Complete application flow

- `fighter.loftwah.com` presents LOFTWAH FIGHTER clearly, demonstrates a real
  gameplay decision, and reaches the launcher intentionally through one primary
  play action.
- Main Menu, Profile, Settings, Fight Lab, Quick Fight, Story, Tournament, Collection,
  Lineup, Store, Missions, Achievements, battle, result, pause, help/key, and
  recovery states connect correctly wherever their session permits them.
- No view relies on browser refresh, hidden developer controls, or prior local
  state to become usable.
- Page title, description, canonical URL, social preview metadata, favicon,
  no-script state, keyboard path, and reduced-motion behaviour are validated.

### Gate V2-04 — Content and progression

- All six Characters and eighteen Moves validate.
- The Quick Fight, Story proof, and Tournament proof complete end to end.
- First Run cannot complete until every V2 Mission and the Wrong Door Cup
  Tournament are complete; its collected Trophy persists on the Profile.
- Completed Story profiles can use the existing Quick Fight setup as the
  unrestricted end-game sandbox.
- Rewards, purchases, upgrades, missions, saves, replay, and mode isolation
  pass their contracts.
- Content templates can recreate the release structures without bespoke code.

On 2026-08-09 the owner approved the six current Character records for this V2
web playground. The approval is intentionally scoped: materially changed art,
commercial or merchandise use, and the V2.1 expansion to twenty Characters
trigger a fresh review. It is not a blocker for the present playground build.

### Gate V2-05 — Target-device quality

- The complete critical path is played on a physical iPhone 14 in portrait.
- Battle and every required setup/recovery surface are checked in landscape.
- The complete critical path is played on the 16-inch 2024 MacBook Pro.
- Automated reference widths include `390 × 844`, `844 × 390`, and a desktop
  viewport representative of the Mac's default scaled workspace.
- Safe areas, rotation, touch, keyboard, audio unlock, background/resume,
  reduced motion, and text scaling are explicitly checked.

### Gate V2-06 — Performance

- Main Menu does not download Phaser, the full music library, or the complete
  Character asset library before they are needed.
- Battle loads only the current encounter's working visual and audio set.
- Music streams or caches selectively; it is not an all-or-nothing startup
  payload.
- The physical iPhone 14 sustains responsive input and animation without
  repeatable thermal, memory, or audio failures during a representative
  20-minute session.
- The release records initial-route transfer, first battle transfer, time to
  interactive, battle frame pacing, and decoded image-memory observations.
- Source maps and unreferenced development assets are not shipped in the public
  production artefact unless a documented support need justifies them.

Exact numeric transfer and frame-pacing budgets are set after the first
instrumented device baseline; the absence of that baseline blocks V2 freeze.
The 2026-08-09 local production-preview observation records a cold `390 × 844`
intro transfer of 854,741 encoded bytes, down 67.0% from the original 2,591,025
bytes, with no Phaser, audio, Story/Tournament art, or unused landscape intro
request. `mise run performance:audit` enforces a conservative 1 MB regression
guard. The default 1v1 battle observation remains 5,912,216 encoded bytes, including the
340,199-byte encoded lazy Phaser chunk and encounter-specific images. The
production artefact verifier rejects source maps and an eager Phaser script.
This is browser instrumentation, not the still-required physical-device
baseline, frame-pacing evidence, decoded-memory observation, or final budget.

### Gate V2-07 — Accessibility and resilience

- Core operation works with touch and keyboard.
- Focus is visible and never trapped behind battle layers.
- Colour is never the only meaning carrier.
- Health, Charge, tier, Move category, readiness, and status remain labelled.
- Reduced motion preserves timing and meaning.
- Music, SFX, and dialogue controls remain independent.
- Corrupt local data fails safely and can be exported for recovery.

### Gate V2-08 — Release proof and freeze

- `mise run check` passes.
- The GitHub Actions quality gate passes for the accepted commit and retains
  its exact `dist/` artefact.
- A production build is deployed to the release-candidate URL.
- The owner receives the approved review package from questionnaire Q40–Q44
  and the batched view programme.
- Known issues are fixed, explicitly accepted, or moved to a named later
  milestone.
- Release notes, data schema, content manifests, provenance, and migrations are
  current.
- The accepted commit is tagged `v2.0.0`, its GitHub Release links the reviewed
  artefact and migration notes, and this document changes from **RATIFIED
  PROGRAMME CONTRACT — RELEASE NOT FROZEN** to **RELEASE ACCEPTED AND FROZEN**.

## 6. Change control after ratification

A V2 requirement changes only when the same change updates:

1. this release contract if scope or acceptance changed;
2. the owning design or technical authority;
3. affected content schema or migration;
4. the stable acceptance test or evidence;
5. `docs/specification-alignment.md` when an adopted source requirement is
   changed or rejected.

V2.0 patch work may improve quality without adding features. A change that
creates a new player capability, Character, mode, content family, online
dependency, or platform package moves to the roadmap unless it is required to
make an existing V2 promise function correctly.

## 7. Owner-questionnaire reconciliation

The questionnaire remains preserved owner input. This table records how every
answer affects V2 without turning uncertain source values into invented facts.

| Q   | Disposition               | Adopted V2 reading and authority                                                                                        |
| --- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 01  | `ADOPT`                   | Emotional target is “That was actually pretty fun”; section 2 owns the supporting proof.                                |
| 02  | `DELEGATE`                | No artificial ranking; dependency-ordered gates determine sequence and quality applies to all four outcomes.            |
| 03  | `SUPERSEDED 2026-08-07`   | V2–V2.3 remain committed; multiplayer is preserved as optional research without a committed milestone.                  |
| 04  | `ADOPT`                   | Polish one Quick Fight first, then Tournament, then Story; progression/rematch belongs to Story, not a lost Cup run.    |
| 05  | `ADOPT`                   | Six Characters plus the existing V2 proof content; agents stop asking for another minimum-content answer.               |
| 06  | `DELEGATE TO EVIDENCE`    | Fight duration is tuned through fixed-seed and real-reference observation; current V2 benchmark is recorded above.      |
| 07  | `DELEGATE TO EVIDENCE`    | First useful decision stays measured; the Viking benchmark currently reaches its first decision at 2.0 seconds.         |
| 08  | `DELEGATE TO EVIDENCE`    | Decision time varies by difficulty; current post-presentation AI windows remain provisional measured baselines.         |
| 09  | `ADOPT`                   | Easy is very hard to lose; Normal forgives ordinary play; Hard is a fair fight; Brutal is the AI at full effort.        |
| 10  | `ADOPT DIRECTION`         | Interruption policy is a Move timing property; current charge-ups lose spent Charge, other policies need schema proof.  |
| 11  | `ADAPT`                   | Use explicit seeded, bounded randomness and show explainable outcomes; exact unavailable source odds stay unknown.      |
| 12  | `ADOPT`                   | Results explain decisive Moves, damage race, Type, luck, switches, and the player's Move choices where evidence exists. |
| 13  | `ADAPT`                   | Cover source-equivalent pressure, saving, switching, Type, control, and protection with original tunable AI weights.    |
| 14  | `ADOPT`                   | Viking is permanent benchmark one; Grim Reaper is the first favourable opponent. More benchmarks wait for Gate 1.       |
| 15  | `ADOPT`                   | Numeric tiers may add authored qualitative properties; Viking's undodgeable Tier 1 axe is the first proof.              |
| 16  | `ADAPT`                   | Keep the original eight-category vocabulary as a readable equivalent rather than copying source labels.                 |
| 17  | `ADOPT`                   | One primary category stays visible; secondary effects belong in the summary and report.                                 |
| 18  | `ADOPT`                   | First capability work closes the six launch-kit primitive gaps listed in the launch calibration.                        |
| 19  | `DELEGATE TO CALIBRATION` | Team-wide frequency is kit and balance data, not an owner-blocking global percentage.                                   |
| 20  | `DELEGATE TO CALIBRATION` | Preserve bounded semantic Drops and tune frequency/queue/timing from deterministic play.                                |
| 21  | `ADOPT`                   | V2 has one team Accessory per side with independent Charge; tournament activation exhausts it for that run.             |
| 22  | `ADOPT WITH RESEARCH`     | Named Character combinations belong in V2; exact bonus and priority grammar remains an honest registry research row.    |
| 23  | `ADAPT`                   | Quick Fight is reward-neutral sandbox play, but fights/wins/losses and the last matchup are tracked per Profile.        |
| 24  | `ADOPT`                   | Story loss offers forgiving retry and a concrete hint to level, adjust the build, or change the Lineup.                 |
| 25  | `ADAPT`                   | Story uses an injectible menu-driven level path for fights, Tournaments, and bosses without introducing map walking.    |
| 26  | `DELEGATE`                | Agents author the shortest coherent V2 proof; substantial publishable Story length belongs to V2.1.                     |
| 27  | `SUPERSEDED 2026-08-07`   | A lost deployment repeats the same fight while any Roster member lives; complete defeat or forfeit ends the run.        |
| 28  | `ADOPT`                   | An activated Accessory is exhausted until the Tournament run ends or restarts.                                          |
| 29  | `EXPANDED 2026-08-07`     | Quick/Tournament use configurable sandbox instances; each Story Save exclusively owns its collection and progression.   |
| 30  | `ADAPT PENDING EVIDENCE`  | Retain deterministic local-first Store rotation; do not claim an unknown exact source schedule.                         |
| 31  | `ADOPT`                   | Players can sell duplicates; the current full listed-value return is the safe no-regret baseline.                       |
| 32  | `ADOPT`                   | V2 uses the known six Characters and V2.1 expands to twenty; no further roster brief is needed now.                     |
| 33  | `ADOPT`                   | No subject category requires owner pre-approval; provenance, rights, cultural care, and shipping review still apply.    |
| 34  | `ADOPT`                   | No single world premise is required now; stories may use an original flexible anthology frame.                          |
| 35  | `ADOPT`                   | Agents author extensive, deliberate, adult dark comedy; owner correction is review feedback, not an authoring blocker.  |
| 36  | `ADOPT`                   | Stabilise models and schemas through real work, then template them at Gate 5; image production may template earlier.    |
| 37  | `DEFER POLICY`            | No speculative universal invention policy; draft safely and surface shipping/canon decisions when they become real.     |
| 38  | `ADOPT`                   | Keep useful local diagnostic evidence broadly now and remove only data shown to have no use; no backend is implied.     |
| 39  | `ADOPT`                   | Show the clearest report-derived explanation that fits the result surface; the Gate 1 slice begins that work.           |
| 40  | `CONTEXTUAL`              | No global approval list; explicit requested gates govern. Battle geometry currently requires owner approval.            |
| 41  | `CONTEXTUAL`              | Review packages match the artefact rather than imposing one permanent format.                                           |
| 42  | `PARTIAL / NOT APPROVED`  | Main Menu Variant A is a useful hypothesis, but the batch must be regenerated from the real app and requirements.       |
| 43  | `RESEARCH-LED BATCH`      | The iPhone launcher task flow needs its own real-screenshot batch before implementation.                                |
| 44  | `RESEARCH-LED BATCH`      | Useful optional launcher information is chosen in that batch; no generated incidental copy becomes authority.           |

The current owner-ready V2 action is to playtest the implemented game-first
Battle flow against the supplied `screenshots/tt2-*` references. The playtest
decides whether to lock or revise that spatial direction; it no longer blocks
safe Gate 1 implementation around deterministic combat, reports, copy, tests,
or additional presentation treatments.
