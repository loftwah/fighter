# Teeny Titans 2 functional audit and Riot Relics translation

Status: source-backed product audit  
Reviewed: 2026-07-30

## Purpose

This audit uses Teeny Titans 2 as a functional reference, not a visual asset
source or a licence to copy protected characters, writing, or art. Riot Relics
keeps its own rules, content, names, and Kinetic Print presentation.

The detailed combat mechanic and character-capability comparison now lives in
[the battle-capability parity audit](./teeny-titans-battle-parity.md).

## What the reference game proves

- Battles use teams of up to three figures, one active figure, three moves per
  figure, a shared battle bar, and free switching. The opponent's bar is visible
  enough to support interruption decisions.
- Per-figure Mod Chips and a separate one-per-team Accessory are different build
  layers. Accessories charge on their own cadence and are selected for the
  battle rather than attached to one figure.
- Type advantage is taught and surfaced during team selection instead of being
  left for the player to memorise.
- Tournaments are multi-fight runs. Health and defeated members carry between
  fights, while interludes supply recovery or temporary run effects.
- The collection hub is more than a grid: it combines figure records, lore,
  awards, build modification, move management, and cosmetic treatment.
- Loading feedback and retroactive achievements are durable parts of the game
  shell, not battle-specific afterthoughts.

Supporting sources:

- [Official Teeny Titans 2 pre-registration trailer](https://www.youtube.com/watch?v=pbTPap-o_1M)
- [Grumpyface v1.03 notes: loading, achievements, team bonuses, Mod Chips, tournaments](https://grumpyfaceblog.tumblr.com/post/177072839828/teeny-titans-2-new-v103-bugfix-patch-released)
- [Pocket Gamer review: team of three, switching, shared bar and Accessories](https://www.pocketgamer.com/teen-titans-go-figure/review/)
- [TouchArcade review: stat choices, Mod Chips, move upgrades and Accessories](https://toucharcade.com/2018/07/19/teen-titans-go-figure-review-remember-the-titans/)
- [AppUnwrapper guide: type wheel before fights and tournament carry rules](https://www.appunwrapper.com/2016/06/23/teeny-titans-a-teen-titans-go-figure-battling-game-tips-tricks-and-strategy-guide/)
- [Teeny Titans Mod Chips reference](https://teeny-titans-the-game.fandom.com/wiki/Mod_Chips)

## Confirmed Riot Relics view model

| Area        | Required view or state          | Current status      | Decision                                                                                                       |
| ----------- | ------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| Entry       | Intro / splash sequence         | Implemented         | Data-driven text, registered image, or registered video beats; always skippable                                |
| Entry       | Loading / waiting               | Implemented         | Shared three-bar wait language at startup and arena construction                                               |
| Global      | Main Menu                       | Implemented         | Exactly three player-facing game modes                                                                         |
| Global      | Settings                        | Implemented         | Global preferences shared by every profile and mode                                                            |
| Global      | Profile / saves                 | Implemented         | Three local Collector profiles                                                                                 |
| Global      | Achievements                    | Implemented         | Retroactive, profile-derived award ledger                                                                      |
| Development | Developer Lab                   | Implemented         | Fast deterministic access to common fight states                                                               |
| Quick Fight | Setup / character selection     | Implemented in mode | Standard Builds and 1–3 player/opponent selection work; extract the selector for Story and Tournament reuse    |
| Quick Fight | Match settings                  | Partial             | Difficulty, Lineup, and Accessory selection work; add build preset, arena/music, and supported rule overrides  |
| Tournament  | Lobby and run                   | Implemented         | Standalone runs now use progression-neutral Standard Builds                                                    |
| Tournament  | Roster and deployment           | Implemented         | Six locked launch Characters, one-to-three deployed each round, explicit starter, carry Health, and reserve XP |
| Story       | Story Home and node views       | Implemented         | Authored, replayable nodes; no walkable overworld                                                              |
| Story       | Store                           | Implemented         | Story-scoped                                                                                                   |
| Story       | Character points / upgrades     | Implemented         | Collection exposes free stat reallocation, Move order, and matching-duplicate enhancement                      |
| Story       | Modifications                   | Implemented in part | Patches are per-Relic Mod Chips; battle Accessories work but ownership/unlocks remain                          |
| Collection  | Collection and lore             | Implemented         | Revealed Relics expose lore; locked records remain sealed                                                      |
| Selection   | Character / Accessory selection | Partial             | Quick Fight and Tournament have Lineup controls; extract the shared Story selector and add Accessory ownership |
| Battle      | Main game view                  | Implemented         | Common battle engine and presentation across modes                                                             |
| Battle      | Pause Menu                      | Implemented         | Blocking resume/restart/exit and development access                                                            |
| Results     | Victory and Defeat              | Implemented         | One shared result contract with outcome-specific copy and mode-specific rewards                                |

## Functional parity ledger

This ledger is the binding answer to “do we have the Teeny Titans 2
equivalent?” Map traversal and the reference game's menu topology are outside
scope by product decision. A row marked **Equivalent** means the player can make
the same kind of decision, not that names, art, exact numbers, or proprietary
content were copied.

### Fighting and team construction

| Reference function                                        | Our equivalent                                            | Status                  | Remaining acceptance work                                                                              |
| --------------------------------------------------------- | --------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------ |
| Six classes in a closed advantage cycle                   | Six Combat Types                                          | Equivalent              | Corrected to `Brawler → Beast → Oddball → Arcane → Sharpshooter → Tech → Brawler`                      |
| Six equipped figures; choose up to three for a fight      | Six-copy Tournament Roster plus per-round deployed Lineup | Equivalent              | One-to-three living members and an explicit starter are selected before each ready round               |
| One active fighter and free switching                     | One active Character and bench controls                   | Equivalent              | Add explicit starting-active choice to shared selection                                                |
| Three powers at different bar positions                   | Three Moves across nine tuned threshold positions         | Equivalent              | Keep product balance; do not collapse to invented fixed thirds                                         |
| Shared side bar retained on switch                        | Independent 0–100 Charge Strip per side                   | Equivalent              | Continue balance and motion playtesting                                                                |
| Visible opposing bar and power positions                  | Enemy Charge Strip and threshold markers                  | Equivalent              | Improve presentation if playtests still miss it                                                        |
| Cast/charge-up and interruption                           | Pending Move, dodge, stun, and damage interruption        | Equivalent              | Add instant-cast and cast-speed build effects                                                          |
| Fight pauses while an attack presents                     | Full simulation and input presentation lock               | Equivalent              | Continue per-Move timing polish                                                                        |
| Team Accessory charged through combat                     | Separate charged team Accessory                           | Equivalent core         | Move starts and seeded Battery pickups charge it; ownership and tournament limits remain               |
| Charge, freeze, heal, shield, and power block Accessories | Five data-authored Accessory effects                      | Equivalent launch slice | Expand catalogue without character-specific engine branches                                            |
| Pickups from attacks                                      | Seeded Battery, Repair, and Surge battle drops            | Equivalent launch slice | Semantic expiry and keyboard/touch commands ship for both player and AI; expand effect catalogue later |
| Broad status and power vocabulary                         | Reusable action-effect schema                             | Partial                 | See the detailed battle audit for channels, transforms, summons, dispel, effect blocks, and triggers   |
| Same battle rules for player and CPU                      | Shared deterministic command engine                       | Equivalent core         | Improve survival, Type, control, and Accessory planning                                                |

### Character ownership and builds

| Reference function                | Our equivalent                                                      | Status                 | Remaining acceptance work                                                            |
| --------------------------------- | ------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------ |
| Individual figure copies          | Independent owned Character copies                                  | Equivalent             | —                                                                                    |
| Level, XP, stat choices           | Level 1–25, XP, and five allocatable stats                          | Adapted equivalent     | Reference has four displayed stats; Tempo is our explicit bar-build stat             |
| Move-order customisation          | Collection Move reorder controls                                    | Equivalent             | Unlocks at level 10 and updates threshold/output immediately                         |
| Enhance powers by feeding figures | Consume an explicitly selected matching copy to raise one Move tier | Adapted equivalent     | Replace generic multipliers with authored tier perks over time                       |
| One Mod Chip per figure           | One Modification per owned copy                                     | Adapted partial        | Four effects only; add start, reaction, cast, drop, KO, and Type-restricted families |
| Destroy chip when removed         | Reusable unique Modification moved between copies                   | Intentional divergence | Forgiving/local-first economy wins over destructive unequip                          |
| Cosmetic repaints                 | Cosmetic variants on owned copies                                   | Missing                | Requires approved art direction and persisted cosmetic selection                     |
| Figure wiki and collection record | Collection, reveal state, and lore                                  | Equivalent core        | Add filter, sort, favourites, richer stats, and variant records                      |
| Duplicate pawn/sale               | Full-value Character/Modification sale                              | Designed, not surfaced | Add confirmation UI and protect active Tournament Rosters                            |

### Modes, rewards, and surrounding systems

| Reference function                           | Our equivalent                                    | Status              | Remaining acceptance work                                                                               |
| -------------------------------------------- | ------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| Story battles and special-condition missions | Story nodes and authored match rules              | Partial             | Content breadth, not a new engine, is the main gap                                                      |
| Side and daily missions                      | Semantic mission evaluator                        | Partial             | Add rotating daily definitions and broader objective families                                           |
| Multi-round tournaments with carry health    | Wrong Door Cup run snapshot                       | Equivalent core     | Six-copy Roster, deployed Lineup, starter, reserve Health, and support XP ship; Accessory limits remain |
| Tournament bonus tofu/pickups                | Deterministic interlude repair and Charge choices | Adapted equivalent  | Add more authored hazards and reward choices                                                            |
| Figure, chip, repaint, and Accessory shops   | Deterministic Story Store                         | Partial             | Character/Modification stock exists; add Accessory ownership and cosmetic stock                         |
| Awards/achievements                          | Retroactive profile-derived achievements          | Equivalent core     | Expand authored award catalogue                                                                         |
| Multiplayer ladder and nearby battles        | None                                              | Excluded            | Multiplayer/backend requires a separately accepted product design change                                |
| Paid random eggs and IAP                     | None                                              | Excluded            | Monetisation is outside the product guardrails; deterministic earnable stock remains                    |
| Open-world travel, NPC errands, day/night    | Story/menu orchestration                          | Explicitly replaced | User-approved scope exclusion                                                                           |

## `alignment.md` adjudication

`alignment.md` is useful historical discovery, but it is not a rules source.
The following claims are corroborated and adopted:

- one active fighter from a larger squad, free switching, a shared side bar,
  three reorderable Moves, team bonuses, Type matchups, one Modification per
  Character, one charged team Accessory, tournaments, build progression,
  collection, and shops;
- control effects such as stun, Charge freeze/break, healing prevention,
  Move-slot blocking, summons, transformations, and reaction passives belong in
  the long-term reusable capability vocabulary.

The following claims are **not** authoritative and must not silently enter code
or balance:

- a universal six-second full bar, exactly `16.66` Charge per second, fixed
  `33/66/100` Move costs, or exact `1.5/0.75` Type multipliers;
- five equippable Moves per Character or the proposed level-unlock table;
- passive real-time Accessory cooldowns;
- repaint combat-stat bonuses;
- invented gacha odds, prices, accessory durations, AI thresholds, and status
  constants.

When a reference value cannot be recovered confidently, preserve the verified
decision shape and tune original seeded values through tests and playtesting.

## Shared object model

```text
Player
└── owns 1..3 local Profiles
    ├── Story progression
    ├── Collection and owned Relic copies
    ├── Relic levels, stat allocations, Move tiers, and Patches
    ├── Mission state
    ├── Achievements (derived from the profile)
    └── Tournament run snapshots

GameModeSession
├── StorySession
├── QuickFightSession
└── TournamentSession
         │
         ▼
MatchConfiguration
├── player and enemy Lineups (1..3 deployed)
├── Combatant Builds
├── team Accessory
├── difficulty and optional authored rules
├── arena / presentation identity
└── explicit deterministic seed
         │
         ▼
shared deterministic Battle engine
         │
         ▼
shared Result contract
```

The battle is not copied for each game mode. A mode creates and owns a match
configuration, consumes the same battle report, and decides what exists around
the fight: progression, rewards, persistence, tournament carry, or no mutation.

## Build contracts

### Story Build

Uses the selected owned Relic copy: level, allocations, Move order and tiers,
and equipped Patch. Authored story loans use explicit content builds.

### Standard Build

The default for Quick Fight and standalone Tournament:

- Level 10;
- nine allocation points, identical budget for every Relic;
- `2 Vitality / 2 Power / 2 Evasion / 2 Fortune / 1 Tempo`;
- Stock Move order and tiers;
- no progression Patch.

This keeps character base-stat identity while removing Story ownership and
progression advantages. Future custom Quick Fight and custom Tournament rules
may deliberately override any field, but the UI must label the match
`Custom` instead of `Standard`.

## Settings ownership

Global Settings own accessibility, audio, and the preferred difficulty. Match
Settings own only the selected fight: Lineups, Standard/Custom build policy,
Accessory, arena/music, and authored rule modifiers. A mode may constrain Match
Settings without duplicating them.

## Deliberate adaptations

- Do not add open-world walking or a city map. Story nodes provide the same
  functional transitions without violating the product boundary.
- Do not add multiplayer, backend accounts, monetisation, or mobile packaging.
- Do not copy Teeny Titans characters, art, names, maps, dialogue, or exact UI.
- Preserve rectangular art and Kinetic Print motion. The reference informs
  hierarchy and interaction, while Riot Relics owns the presentation.

## Next implementation order

1. Extract the working Quick Fight and Tournament pickers plus visual Type
   wheel into one reusable selection flow for Story.
2. Reuse Accessory control and Match Settings for optional Custom tournaments.
3. Add Accessory ownership and tournament limits around the implemented
   interactive battle drops.
4. Add cosmetic variants only after the replacement art direction is accepted.
