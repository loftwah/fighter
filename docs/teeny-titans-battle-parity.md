# Teeny Titans 2 battle-capability parity audit

Status: source-backed implementation audit  
Reviewed: 2026-07-30

## Scope and evidence

This document audits the figure-fighting mode in _Teen Titans GO Figure!_
(_Teeny Titans 2_) as a functional reference. It does not authorise copying its
characters, names, writing, art, UI, exact balance values, or protected audiovisual
material. Riot Relics keeps its own Type labels, content, presentation, and
forgiving progression rules.

Evidence confidence:

- **High** — official developer/publisher material or multiple contemporary
  reviews and guides.
- **Medium** — consistent community documentation cross-checked across character
  pages or another guide.
- **Low** — isolated reports or uncertain edge-case semantics.

The public record is good enough to establish the capability surface, but not
the original game's exact formulas, durations, AI weights, or every move's
resolution order. Those values remain authored Riot Relics balance.

Primary and contemporary sources:

- [Grumpyface v1.0.3 and v1.1.4 notes](https://grumpyfaceblog.tumblr.com/post/177072839828/teeny-titans-2-new-v103-bugfix-patch-released)
- [Official Cartoon Network gameplay video](https://www.youtube.com/watch?v=jxMyQ0lqU9A)
- [TouchArcade hands-on preview](https://toucharcade.com/2018/06/21/teen-titans-go-figure-teeny-titans-2-hands-on-preview-another-day-in-jump-city)
- [TouchArcade review](https://toucharcade.com/2018/07/19/teen-titans-go-figure-review-remember-the-titans/)
- [Pocket Gamer battle guide](https://www.pocketgamer.com/teen-titans-go-figure/teen-titans-go-figure-cheats-and-tips-essential-tips-for-battling/)
- [Pocket Gamer review](https://www.pocketgamer.com/teen-titans-go-figure/review/)
- [Contemporary battle-system review mirror](https://www.sickgaming.net/thread-85872.html)
- [Community Move catalogue](https://www.reddit.com/r/teenytitans/comments/14w3xqp/complete_fig_list_with_abilities_and_gold_shiny/)
- [Community Mod Chip catalogue](https://www.reddit.com/r/teenytitans/comments/16x6a91/list_of_all_chips_and_their_effects_tt2/)
- [Teeny Titans Mod Chips reference](https://teeny-titans-the-game.fandom.com/wiki/Mod_Chips)

Representative character documentation:

- [Robin: damage, stacking Power, stun](https://teeny-titans-the-game.fandom.com/wiki/Robin_%28figure%29)
- [Cyborg: HP-for-Charge and team damage](https://teeny-titans-the-game.fandom.com/wiki/Cyborg)
- [Gizmo: stackable damage-over-time and combined control](https://teeny-titans-the-game.fandom.com/wiki/Gizmo_%28figure%29)
- [Beast Boy: transform, replacement Moves, staged attack](https://teeny-titans-the-game.fandom.com/wiki/Beast_Boy_%28figure%29)
- [See-More: interruptible casting, cleanse and enemy dispel](https://teeny-titans-the-game.fandom.com/wiki/See-More_%28figure%29)

## Executive finding

Riot Relics now has the correct fundamental shape: one active fighter from a
one-to-three-character Lineup, an independent shared Charge Strip per side,
three cost thresholds, switching, classes, seeded dodge/critical results,
charge-up interruption, full presentation pauses, team defeat, tournament
attrition, and semantic battle reports.

It is not yet capable of expressing the full reference combat roster. The
largest missing systems are:

1. conditional and event-triggered passives;
2. richer Charge manipulation and battle drops;
3. bespoke Move-tier enhancements;
4. transform, staged, channelled, summon, immunity, and disable mechanics;
5. build-management controls for combat systems already in the engine.

A first complete team Accessory contract and opponent Move-threshold rail were
implemented during this audit. Their remaining depth is recorded below.

The correct goal is capability parity, not a one-for-one clone of every figure.
Once a reusable effect or trigger exists, original Riot Relics characters can
combine it in their own authored ways.

## Core loop matrix

| Reference capability                                | Confidence          | Riot Relics | Decision or remaining work                                                                                   |
| --------------------------------------------------- | ------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| One to three fighters, one active                   | High                | Implemented | Shared domain engine supports 1–3 per side                                                                   |
| Independent continuously filling side bars          | High                | Implemented | Tempo produces a smooth side-level Charge rate                                                               |
| Three Move thresholds per active fighter            | High                | Implemented | Nine Low/Standard/High positions map to three bands                                                          |
| Earlier is cheaper/weaker; later is dearer/stronger | High                | Implemented | Position cost and output multiplier are authoritative                                                        |
| Move reordering changes bar placement               | High                | Implemented | Collection controls update threshold and output immediately                                                  |
| Shared bar retained while switching                 | High                | Implemented | Health and statuses remain character-owned                                                                   |
| Free switching                                      | High                | Implemented | Stun, pending cast, and switch lock can prevent it                                                           |
| AI uses switching                                   | High                | Partial     | Basic support-to-pressure switch added; class/health planning remains                                        |
| Player chooses the starting active fighter          | High                | Partial     | First selected entry starts; selection flow needs an explicit starter control                                |
| Opponent bar and Move thresholds are visible        | High                | Implemented | Current enemy nodes expose cost and Ready/Wait/Cast state                                                    |
| `3 → 2 → 1 → FIGHT` start                           | Medium-high         | Implemented | Simulation stays stopped through countdown                                                                   |
| Battle pauses during attack presentation            | High                | Implemented | Input, AI, clock, bars, statuses, and pending casts stop; 2–3 second reference-calibrated holds are explicit |
| Symmetric rules for player and AI                   | High                | Partial     | Same engine and content; both use Accessories, but AI strategy remains basic                                 |
| Whole-team elimination                              | High                | Implemented | Automatic next living fighter enters                                                                         |
| Semantic forfeit                                    | Product requirement | Implemented | Active tournament Restart/Leave now closes the current Case                                                  |

## Timing, interruption, and targeting

| Capability                                                | Confidence      | Riot Relics            | Gap                                                                     |
| --------------------------------------------------------- | --------------- | ---------------------- | ----------------------------------------------------------------------- |
| Per-Move cast time after spending bar                     | High            | Implemented            | —                                                                       |
| Damage or stun interrupts a cast                          | High            | Implemented            | —                                                                       |
| Dodge prevents a hit and its interruption                 | High            | Implemented            | —                                                                       |
| Faster cast, instant-cast chance, interruption resistance | High            | Partial                | Resistance Patch exists; speed and instant-cast effects do not          |
| Stun prevents action, switching, and bar fill             | High            | Implemented            | Bar-fill pause added 2026-07-30                                         |
| Target remains fixed through the impact presentation      | High            | Implemented atomically | Pending actions do not support an earlier telegraphed target-lock phase |
| Attached control requires a landed hit when authored      | High            | Implemented            | `requiresHit` prevents dodge-plus-status contradictions                 |
| Simultaneous cast resolution policy                       | Not recoverable | Authored adaptation    | Player-side-first order remains deterministic and must be playtested    |

## Reusable Move and status vocabulary

| Effect family                                  | Reference examples                               | Riot Relics                                                                      |
| ---------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------- |
| Single-target damage                           | Basic strikes and projectiles                    | Implemented                                                                      |
| Multi-hit damage                               | Rapid strikes and barrages                       | Implemented                                                                      |
| Whole-enemy-team damage                        | Missile/area attacks                             | Implemented                                                                      |
| Active and whole-team healing                  | Direct heal and party heal                       | Implemented                                                                      |
| Stun                                           | Damage-plus-stun and standalone control          | Implemented                                                                      |
| Attack/defence modification                    | Power increase/decrease, vulnerability           | Implemented                                                                      |
| Fixed Charge gain/drain                        | Battery-style gain and bar depleters             | Implemented                                                                      |
| Shield                                         | One-hit and lasting shields                      | Partial: consumable timed pools; one-hit and heal-on-expiry variants are missing |
| Cleanse                                        | Remove allied negative effects                   | Implemented                                                                      |
| Enemy dispel                                   | Remove opposing positive effects                 | Missing                                                                          |
| Damage over time                               | Poison, Robo Buddy, mines                        | Implemented periodic status; summons and delayed mines remain missing            |
| Healing over time/regeneration                 | Beatbox and passive regeneration                 | Implemented periodic status; passive trigger sources remain missing              |
| Life-steal                                     | Damage while restoring health                    | Engine implemented as a data-authored ratio; representative shipped Move missing |
| HP paid as an action cost                      | Self-damage for immediate Charge                 | Missing                                                                          |
| Bar haste/slow                                 | Dance and Curse                                  | Implemented timed rate multiplier                                                |
| Bar freeze/break                               | Temporary freeze or loss of accumulated progress | Partial: temporary freeze and fixed drain; complete percentage break is missing  |
| Periodic bar damage                            | Electrocute-style Charge ticks                   | Missing                                                                          |
| Dodge modification                             | Stackable smoke/dodge chance                     | Implemented numeric effect with a one-trigger counter stance                     |
| Critical/Luck modification                     | Temporary positive-result chance                 | Engine implemented; representative shipped Move missing                          |
| Undodgeable damage                             | Move enhancement or authored property            | Engine implemented; representative shipped Move missing                          |
| Shield piercing                                | Move enhancement                                 | Engine implemented; representative shipped Move missing                          |
| Reflection                                     | Return a percentage of incoming damage           | Implemented as queued, post-shield, non-recursive reaction damage                |
| Counter-on-dodge                               | Triggered retaliation                            | Implemented as a queued, consumable dodge reaction                               |
| Immunity/flight                                | Avoid eligible attacks while active              | Missing                                                                          |
| Switch lock/root                               | Prevent voluntary switching                      | Implemented as an authored timed effect                                          |
| Figure banish/disable                          | Temporarily prevent a figure being selected      | Missing                                                                          |
| Individual Move-slot block                     | Waffle-style ability disable                     | Implemented as a timed team-side slot block through an Accessory                 |
| Heal/effect block                              | Prevent a category of positive effect            | Missing                                                                          |
| Channelled action                              | Continue while bar drains or until interrupted   | Missing                                                                          |
| Transform/replacement kit                      | Swap to a different set of Moves                 | Missing                                                                          |
| Staged action                                  | Several activations prime a later release        | Missing                                                                          |
| Persistent summon                              | Repeated damage/heal or later-attack trigger     | Missing                                                                          |
| Random authored result                         | Random attack or generated battle bonus          | Missing                                                                          |
| On-hit/on-crit/on-dodge/on-KO/on-kill triggers | Character and chip reactions                     | Partial: dodge and damaged triggers; hit/crit/KO/kill remain                     |

Reliable public evidence did **not** establish a normal revive Move, true
opponent-Move copying, a conventional sleep status, or a direct forced swap.
Those are not parity requirements. Tournament interludes may still revive a
Case member as an authored run rule.

## Playable roster coverage

The six shipped Relics now exercise a useful first slice of the vocabulary:

| Relic         | Current playable kit                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| Viking        | Quick damage; charged damage plus hit-gated stun; charged multi-hit finisher plus self Power                 |
| Ned Kelly     | Quick damage; consumable shield plus Charge refund; charged damage, stun, and switch lock                    |
| Tux           | Damage plus allied Charge; damage plus enemy Charge drain and slow; whole-team damage                        |
| Moses         | Immediate heal plus regeneration; low damage plus defence reduction; whole-team heal and cleanse             |
| Humpty Dumpty | Damage plus Evasion and a dodge counter; shield plus reflection; damage-over-time plus enemy Power reduction |
| Grim Reaper   | Quick damage; self Power increase; whole-team damage                                                         |

This is not yet reference-scale character diversity. No shipped Move currently
uses the implemented Fortune, undodgeable, shield-piercing, or lifesteal
properties, and no Relic yet represents summons, transformation, channels,
staged actions or figure disable. Move-slot blocking is represented by a team
Accessory rather than a shipped Character Move.
Those remain explicit content-and-engine milestones rather than hidden
assumptions.

## Character-build systems

| System                             | Reference behaviour                                    | Riot Relics                                                                             |
| ---------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Four core displayed stats          | Health, Power, Dodge, Luck                             | Adapted to Vitality, Power, Evasion, Fortune, plus Tempo                                |
| Six-class advantage wheel          | Martial → Beast → Cute → Dark → Super → Tech           | Implemented with original labels and reference-equivalent relationships                 |
| Affiliation/team bonuses           | Named two/three-member stat bonuses                    | Adapted equivalent: six scored Team Traits with visible continuous bonuses              |
| Move unlocking                     | Moves arrive through levels                            | All three currently available immediately                                               |
| Move reordering                    | Unlocked later; changes threshold                      | Implemented in engine and Collection controls                                           |
| Individual Move enhancement        | Feed figures; bespoke gold/shiny secondary property    | Partial: matching-copy consumption and generic tiers implemented; bespoke perks missing |
| One passive Mod Chip per character | Static, start, reaction, casting, drop, and KO effects | Partial: four reusable Patches only                                                     |
| Separate visual repaint            | Cosmetic only                                          | Deliberately deferred with art direction                                                |

Numeric tier and slot scaling now improve damage, healing, periodic effects,
shields, Charge changes, timed Charge-rate effects, buff/debuff magnitude,
switch locks, and stun duration. That repairs pure-utility tiers and Move
reordering, but does not replace bespoke authored tier additions such as
`healOnExpiry` or `instantCastChance`. Undodgeable, shield-piercing, and
lifesteal properties are available to authored damage effects.

## Team Accessory

Reference behaviour is high confidence:

- each side selects one team Accessory;
- it has charge independent of the character Move bar;
- attacks and battery drops charge it;
- activation does not replace one of the active character's three Moves;
- player and AI can both activate it;
- examples freeze the opposing bar, increase team health, shield the team, or
  block an opposing Move.

Riot Relics now implements the structural layer separately from per-character
Patches:

- stable data definitions;
- independent 0–100 team charge;
- charge gain when starting a Move;
- an explicit player/AI activation command;
- symmetric legality and semantic events;
- Quick Fight selection;
- battle UI for both sides;
- Charge burst, enemy-strip freeze, whole-team heal, whole-team shield, and
  opposing Move-slot block effects.

Still missing are story ownership/unlocks, bespoke Accessory presentation
art/audio, run-limited tournament use, and the full reference-scale effect
catalogue. Seeded Battery pickups are part of the implemented interactive-drop
slice below.

Implemented contract:

```text
AccessoryDefinition
├── stable ID, name, description
└── ordered reusable effects

TeamState
└── accessory ID, current charge, activation count

BattleCommand
└── accessory
```

## Interactive battle drops

The reference game can drop coins, batteries, and temporary battle bonuses from
combat. Reported powers include healing, shielding, damage increase, immediate
Charge, bar speed, enemy freeze, and cleanse. These are interactive pickups,
not passive rewards.

Riot Relics now has a deterministic launch slice:

- successful damaging Moves may produce a side-owned Battery, Repair, or Surge;
- drop RNG is derived from the match seed but separated from combat RNG;
- Battery charges the team Accessory, Repair heals the active Character, and
  Surge adds normal Charge;
- drops expire in simulation time, so countdowns, pause, and presentation locks
  hold them consistently;
- the player uses touch/keyboard-accessible semantic buttons and the AI uses the
  same `pickup` command;
- a maximum of two pending drops per side prevents screen clutter.

Coins, temporary combat buffs, enemy debuffs, cleanse, and drop-affecting
Modifications remain catalogue breadth rather than a missing interaction
architecture.

## Tournament differences

| Capability                                         | Riot Relics                                                                              |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Normal battle engine reused                        | Implemented                                                                              |
| Multi-round authored ladder                        | Implemented                                                                              |
| Locked Case during a run                           | Implemented                                                                              |
| Health and defeated state carry                    | Implemented                                                                              |
| Interlude repair/revive/start-Charge effects       | Implemented                                                                              |
| Loss closes the run                                | Implemented                                                                              |
| Restart/Leave cannot restore the previous snapshot | Implemented 2026-07-30                                                                   |
| Per-round battle modifiers/hazards                 | Partial                                                                                  |
| Six-character reserve roster                       | Implemented with one-to-three deployment, explicit starter, carry Health, and support XP |
| One-use or run-limited Accessories                 | Missing with Accessory system                                                            |

## AI acceptance target

Exact reference AI weights are undocumented, so Riot Relics should meet a
behavioural contract instead:

1. never choose an illegal command;
2. use affordable damage when a full-health support action has no value;
3. heal only when healing can restore health;
4. switch away from a support lead when a healthy bench attacker can pressure;
5. consider survival and class advantage on Hard/Brutal;
6. understand Charge denial, cast interruption, and switch locks;
7. use its Accessory under the same legality rules as the player;
8. remain deterministic for the same state and seed.

The first four have direct coverage. Deeper class, survival, control, and
Accessory planning remain.

## 2026-07-30 implementation corrections

This audit directly produced the following repairs:

- reordered Moves now receive the new slot's Charge band and output multiplier
  for damage, healing, periodic, and utility effects while preserving their
  authored Low/Standard/High offset;
- Gold/Platinum tiers now improve numeric utility effects, not just damage and
  healing;
- attached effects can require a landed hit, so a dodged strike does not still
  stun or debuff;
- stun now pauses the affected side's Charge;
- the AI can switch from a healthy pure support into an affordable attacker,
  waits past zero-value healing, and no longer traps solo Velvet Hex below her
  damaging Move;
- every content character must have at least one damaging Move for valid solo
  Quick Fights; Moses's Part the Strip includes low direct damage;
- a deterministic `forfeitBattle` transition exists;
- restarting or leaving an active tournament battle clears the current Case;
- the opponent rail now shows all three active Move thresholds and states;
- each side can select, charge, and activate a separate team Accessory; the AI
  uses the same command, waits until the effect has value, and five deterministic
  Accessory effects ship;
- Collection now exposes free stat allocation, Move ordering, and explicit
  matching-copy enhancement, with every build control locked during Story or
  standalone Tournament Rosters;
- a separate seeded drop stream produces expiring Battery, Repair, and Surge
  commands without perturbing combat RNG; local players and AI share the same
  collection reducer;
- the Wrong Door Cup locks all six launch Characters, persists reserve Health,
  lets the player deploy one to three living Characters with an explicit
  starter each round, and grants owned reserves a 20% support XP pool;
- the Combat Type cycle now matches the reference relationships while retaining
  original labels: Brawler/Martial → Beast → Oddball/Cute → Arcane/Dark Arts →
  Sharpshooter/Super → Tech → Brawler/Martial;
- damage-over-time and regeneration tick deterministically without creating
  invisible presentation pauses or emitting zero healing, while active targets
  still receive compact non-blocking arena feedback;
- shields are consumed as finite pools; damage can be undodgeable,
  shield-piercing, or lifestealing;
- authored Evasion, Fortune, and switch-lock effects are reusable content data;
- positive Evasion and Fortune effects survive allied cleanse;
- stun and team Charge-rate effects stay active through their complete authored
  fixed-step duration;
- content validation rejects impossible periodic intervals and hit-gated effect
  ordering.
- reflection and counter-on-dodge use a deferred FIFO reaction queue, preserve
  triggering/grant provenance, cannot recurse, and ship together on Humpty
  Dumpty with narrow-screen status and Move labels.

## 2026-07-31 specification reconciliation

The imported “Ultimate Collectible Squad Battler” handoff was compared against
the authoritative design and implementation rather than copied wholesale.
Compatible improvements now implemented are:

- nine exact position values matching the new baseline, with level-10 controls
  for Low, Centre, or High inside every occupied band;
- a neutral Charge cadence now centred on a ten-second full Strip after direct
  playtest feedback that the imported eight-second baseline was too fast;
- continuous half-strength contribution from both Traits on a dual-Trait
  Character;
- action targets captured at commit, so switching during an opposing charge no
  longer redirects the hit;
- a strict six-Character Tournament Roster with safe repair of retired
  eight-entry v2 snapshots;
- 90-second Quick Fights and 120-second Story/Tournament baselines.

Deliberate retained differences are recorded in
`docs/specification-alignment.md`: full action-presentation pauses follow the
project owner's direct timing requirement; the reference-verified Combat Type
cycle remains; and Defence remains an explicit combat modifier rather than a
sixth allocated stat.

## 2026-07-31 presentation pacing correction

Live browser measurement showed the prior implementation locked the simulation
correctly but exposed an instant attack for only about 0.95 seconds. The
[official Cartoon Network gameplay preview](https://www.youtube.com/watch?v=wxRtSyYKt8M)
shows representative attack sequences occupying roughly two to three seconds.
The runtime now uses longer action, impact, Accessory, and defeat holds; stretches
the cut-in/impact motion to fill them; and displays the acting Character and Move
with an explicit paused-state label. The Neutral 1v1 development scenario is
also now a mirrored Tux matchup with no Accessories and zero starting Charge,
so it exposes the unmodified base Charge loop. The opponent's reaction delay
restarts when every presentation lock releases.

## Recommended implementation order

1. Expand the implemented Accessory layer with ownership, batteries, richer
   presentation, and tournament limits only when the surrounding modes need it.
2. Add self-health cost, percentage Charge break, enemy dispel, periodic Charge
   damage, effect blocking, and a one-hit shield variant.
3. Extend the implemented reaction queue from damaged/dodge triggers to on-hit,
   on-critical, on-KO, and on-kill Patches.
4. Add authored tier enhancements (`instantCastChance`, `healOnExpiry`, effect
   additions) independent of numeric multipliers.
5. Add channel, staged action, transform/replacement kit, summon, and figure
   disable only as original character kits require them.
6. Add Story starting-active selection, Accessory ownership, and cosmetic
   variants to the existing build controls.
7. Expand the implemented drop vocabulary with temporary buffs, cleanse, and
   drop-reactive Modifications as original content requires.

## Completion criterion

Parity is reached when every high-confidence effect family can be represented
by data without adding a character-specific engine branch, both sides can use
the same commands and counters, every visible reference-style timing decision
has a readable UI signal, and representative integration tests cover each
family. It does not require copying the reference roster or reproducing its
undocumented balance constants.
