# Riot Relics view inventory

Status: authoritative interface map for the current prototype.

The application opens at a launcher. A game mode does not exist on screen until
the player deliberately starts or resumes it. Global navigation and in-game
navigation are separate.

## Global views

| View             | Purpose                                                   | Contains                                                                                        | Primary exits               |
| ---------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------- |
| Main Menu        | Choose what kind of game to play                          | Story Mode, Quick Fight, Tournament, current Collector summary, Profile, Settings               | Selected game setup/session |
| Profile          | Manage player identity and progression records            | Collector name, profile selector, story progress summary, collection count, badges              | Main Menu                   |
| Settings         | Manage application behaviour and local data               | Difficulty, reduced motion, music/SFX/dialogue controls, local-data recovery/export information | Main Menu                   |
| Storage Recovery | Explain invalid local data without silently destroying it | Warning, backup download, safe-default action                                                   | Prior view                  |
| Developer Lab    | Launch and inspect development-only game states           | Scenario switchboard, custom Lineups, seed/Charge/time controls, diagnostics, convenience tools | Dev Battle, Main Menu       |

The global shell never shows Store or Missions.

## Story Mode views

| View                  | Purpose                                                       | Contains                                                                                | Primary exits                          |
| --------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------- |
| Story Home            | Continue the selected story object                            | Current scene, dialogue, next action, complete node path                                | Next node, Story navigation, Main Menu |
| Story Lineup          | Confirm the authored Lineup for the next encounter            | Player Relics, loaners, opponent preview, synergy, difficulty                           | Story Battle, Story Home               |
| Story Battle          | Play an authored fight                                        | Arena, both Lineups, health, Moves, player Charge Strip, timer, matchup, event feedback | Result                                 |
| Story Result          | Explain outcome and progression                               | Verdict, Stamps, XP, first-clear reward, report ID                                      | Retry, Story Home                      |
| Story Collection      | Inspect and configure progression owned by this story/profile | Owned Relics, levels, XP, Patches, locked discoveries                                   | Story navigation                       |
| Story Store           | Buy story progression content                                 | Story-gated rotating Relics and Patches, balance, story node continuation               | Story navigation                       |
| Story Missions        | Inspect and claim story objectives                            | Mission requirements, progress, rewards, claim state                                    | Story navigation                       |
| Story Tournament Node | Play the authored tournament inside the story                 | Cup bracket, locked Case, carried health, interlude drops                               | Tournament Battle, Story Home          |
| Story Ending          | Archive the story run                                         | Ending scene, badge, rival reveal, final reward                                         | Story Home, Main Menu                  |

Store and Missions exist only inside an active Story Mode session.

## Quick Fight views

| View              | Purpose                                      | Contains                                                       | Primary exits                         |
| ----------------- | -------------------------------------------- | -------------------------------------------------------------- | ------------------------------------- |
| Quick Fight Setup | Configure a sandbox fight                    | Player Relic, opponent, difficulty, no-progression explanation | Quick Battle, Main Menu               |
| Quick Battle      | Play without story ownership or unlock rules | Same readable battle surface as Story Battle                   | Quick Result                          |
| Quick Result      | Explain the sandbox outcome                  | Verdict and deterministic battle report; no story rewards      | Rematch, Quick Fight Setup, Main Menu |

## Tournament views

| View                 | Purpose                                        | Contains                                                            | Primary exits                              |
| -------------------- | ---------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| Tournament Lobby     | Start or resume a standalone tournament object | Tournament identity, rules, current round, Case health, badge state | Tournament Battle, Main Menu               |
| Tournament Interlude | Choose one persistent between-round effect     | Heal active, heal Case/revive, or next-round Charge                 | Next round, Main Menu                      |
| Tournament Battle    | Play the current authored round                | Common battle surface plus round identity                           | Tournament Result                          |
| Tournament Result    | Explain round/run outcome                      | Round verdict, XP/Stamps, Cup purse when complete                   | Interlude, restart from Round 1, Main Menu |

## Shared battle composition

The battle surface is one viewport, not two areas the player must visually
cross-reference:

1. Opposing Lineups and the large Kinetic Print arena occupy the upper field.
2. The player's large Charge Strip owns the lower command field.
3. Three circular Move controls sit directly above their cost positions on the
   Strip and become explicitly labelled `Ready` when the fill reaches them.
4. Normal, Tier 1, and Tier 2 Moves use base, silver, and gold outlines in
   addition to visible tier labels.
5. Move name, effect, predicted value, cost, and charge time remain available
   through visible compact labels and focus/hover explanations.
6. Larger still-image layers, two-frame swaps, cut-ins, hit reactions, and
   stamped event feedback convey action without hiding rules or state.

## Shared pause and development inspector

- Escape toggles a blocking pause sheet during every active single-player
  battle.
- The pause sheet exposes Resume, Restart, Main Menu, and Developer tools.
- Developer tools open the fight paused and expose state, recent events, time
  stepping, Charge controls, and report export.
- Opening or closing the inspector never changes rewards or progression.

## Navigation rules

- The Riot Relics wordmark returns to the Main Menu; it never silently starts a
  story.
- Entering Story, Quick Fight, or Tournament is always an explicit action.
- Leaving a mode returns to the Main Menu without deleting its persisted state.
- Story navigation contains Story, Lineup, Collection, Store, and Missions.
- Global navigation contains Main Menu, Profile, and Settings.
- Development builds add Developer Lab without changing the three player-facing
  game modes.
- Tournament and Quick Fight never expose Story Store or Story Missions.
- Audio playback intent is a persisted preference. A paused/off choice survives
  navigation and reloads, and no screen turns music back on by itself.
