# Teeny Titans 2 functional audit and Riot Relics translation

Status: source-backed product audit  
Reviewed: 2026-07-30

## Purpose

This audit uses Teeny Titans 2 as a functional reference, not a visual asset
source or a licence to copy protected characters, writing, or art. Riot Relics
keeps its own rules, content, names, and Kinetic Print presentation.

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
| Quick Fight | Match settings                  | Partial             | Difficulty works; add explicit Lineup size, build preset, Accessory, arena/music, and supported rule overrides |
| Tournament  | Lobby and run                   | Implemented         | Standalone runs now use progression-neutral Standard Builds                                                    |
| Tournament  | Case selection                  | Planned             | Reuse the shared character selector; authored Story Cases may remain fixed                                     |
| Story       | Story Home and node views       | Implemented         | Authored, replayable nodes; no walkable overworld                                                              |
| Story       | Store                           | Implemented         | Story-scoped                                                                                                   |
| Story       | Character points / upgrades     | Partial             | XP and unspent points persist; allocation and Move management need direct controls                             |
| Story       | Modifications                   | Implemented in part | Patches are per-Relic Mod Chips; a separate shared Accessory system is still required                          |
| Collection  | Collection and lore             | Implemented         | Revealed Relics expose lore; locked records remain sealed                                                      |
| Selection   | Character / Accessory selection | Partial             | Story preview exists; one reusable 1–3 selector, visual class wheel, and Accessory slot remain                 |
| Battle      | Main game view                  | Implemented         | Common battle engine and presentation across modes                                                             |
| Battle      | Pause Menu                      | Implemented         | Blocking resume/restart/exit and development access                                                            |
| Results     | Victory and Defeat              | Implemented         | One shared result contract with outcome-specific copy and mode-specific rewards                                |

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
├── team Accessory (planned)
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

1. Extract the working Quick Fight 1–3 picker and visual class wheel into a
   reusable selection flow for Story and Tournament.
2. Add a team Accessory content schema, independent charge state, battle event,
   selection slot, AI use rule, and deterministic tests.
3. Add direct stat allocation, Move order, and tier-upgrade controls to the
   Collection build view.
4. Reuse the selector and Match Settings for standalone Tournament Case setup
   and optional Custom tournaments.
5. Add selection and result analytics only after the core flow stabilises.
