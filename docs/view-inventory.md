# LOFTWAH FIGHTER view inventory

Status: authoritative interface map for the current prototype.

The application opens at a launcher. A game mode does not exist on screen until
the player deliberately starts or resumes it. Global navigation and in-game
navigation are separate.

`docs/view-mockup-programme.md` owns the batched composition-review process.
Mock-up choices do not change this inventory until an accepted answer is
reconciled into the relevant authority and surface brief.

Status terms: **implemented** is usable now, **partial** has a usable subset,
and **planned** is an accepted contract that still needs implementation.

## Entry states

| View              | Status      | Purpose                                   | Contains                                                                              | Primary exits       |
| ----------------- | ----------- | ----------------------------------------- | ------------------------------------------------------------------------------------- | ------------------- |
| Intro / Splash    | Implemented | Play optional pre-game editorial content  | Ordered text, registered image, or registered video beats; progress and skip controls | Loading             |
| Loading / Waiting | Implemented | Show an honest non-interactive transition | Reduced-motion-aware wait mark and plain-language status                              | Main Menu or Battle |

## Global views

| View             | Status      | Purpose                                                   | Contains                                                                                        | Primary exits               |
| ---------------- | ----------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------- |
| Main Menu        | Implemented | Choose what kind of game to play                          | Story Mode, Quick Fight, Tournament, current Collector summary, Profile, Settings, Achievements | Selected game setup/session |
| Profile          | Implemented | Manage player identity and progression records            | Collector name, profile selector, story progress, collection, Trophy cabinet, achievement count | Main Menu                   |
| Achievements     | Implemented | Inspect retroactive profile awards                        | Unlocked and in-progress award tickets                                                          | Main Menu, Profile          |
| Settings         | Implemented | Manage application behaviour and local data               | Difficulty, reduced motion, music/SFX/dialogue controls, local-data recovery/export information | Main Menu                   |
| Storage Recovery | Implemented | Explain invalid local data without silently destroying it | Warning, backup download, safe-default action                                                   | Prior view                  |
| Developer Lab    | Implemented | Launch and inspect development-only game states           | Scenario switchboard, custom Lineups, seed/Charge/time controls, diagnostics, convenience tools | Dev Battle, Main Menu       |

The global shell never shows Store or Missions.

## Implementation ownership

| View family                                      | Route/state owner                      | Renderer                                                       |
| ------------------------------------------------ | -------------------------------------- | -------------------------------------------------------------- |
| Intro / Loading                                  | startup stage and `startup-content.ts` | `ui/screens/startup-screen.ts`                                 |
| Global launcher, Profile, Settings, Achievements | global route/session                   | matching `ui/screens/*-screen.ts` plus `ui/shell/app-shell.ts` |
| Story Home, Lineup, Collection, Store, Missions  | Story session and selected save        | matching `ui/screens/*-screen.ts`                              |
| Quick Fight setup                                | Quick session draft                    | `ui/screens/quick-fight-screen.ts`                             |
| Tournament lobby/interlude                       | tournament session/run                 | `ui/screens/tournament-screen.ts`                              |
| Developer Lab                                    | development-only scenario draft        | `ui/screens/dev-lab-screen.ts`                                 |
| Battle shell                                     | battle session controller              | `ui/screens/battle-screen.ts` plus Phaser `game/` adapter      |
| Pause, inspector, victory, defeat                | blocking battle substates              | battle-session controller overlays                             |

`app/routes.ts` is the exhaustive route contract. Pause, results, the battle
countdown, battle loading, and the development inspector are substates of the
shared battle screen because they must retain the same mounted battle and
report. They are intentionally not standalone routes.

## Story Mode views

| View                          | Status              | Purpose                                        | Contains                                                                                                                     | Primary exits                                |
| ----------------------------- | ------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Story Home                    | Implemented         | Continue the selected story object             | Current scene, dialogue, next action, complete node path                                                                     | Next node, Story navigation, Main Menu       |
| Character Selection           | Partial             | Select or confirm a 1–3 Relic Lineup           | Player Relics, loaners, opponent preview, synergy, visual class wheel, difficulty; Story currently confirms authored Lineups | Story Battle, Story Home                     |
| Accessory Selection           | Planned             | Select the one shared team Accessory           | Owned/loaned Accessories, effect, charge rule, selection state                                                               | Character Selection, Battle                  |
| Story Battle                  | Implemented         | Play an authored fight                         | Arena, both Lineups, health, Moves, player Charge Strip, timer, matchup, event feedback                                      | Result                                       |
| Story Result                  | Implemented         | Explain outcome and progression                | Verdict, Stamps, XP, first-clear reward, report ID                                                                           | Retry, Story Home                            |
| Collection and Lore           | Implemented         | Inspect discoveries and configure owned builds | Revealed lore, locked files, owned copies, levels, XP, Patches                                                               | Story navigation                             |
| Character Points and Upgrades | Partial             | Allocate points and manage Moves               | Persisted XP/unspent points and tiers; direct allocation/reorder/upgrade controls still planned                              | Collection                                   |
| Modifications                 | Implemented in part | Equip per-Relic build modifiers                | Reusable Patches; shared team Accessories remain planned                                                                     | Collection, Selection                        |
| Story Store                   | Implemented         | Buy story progression content                  | Story-gated rotating Relics and Patches, balance, story node continuation                                                    | Story navigation                             |
| Story Missions                | Implemented         | Inspect and claim story objectives             | Mission requirements, progress, rewards, claim state                                                                         | Story navigation                             |
| Story Tournament Node         | Implemented         | Play the authored tournament inside the story  | Cup bracket, locked Case, carried health, interlude drops                                                                    | Tournament Battle, Story Home                |
| Story Ending                  | Implemented         | Verify and archive the story run               | Required Mission/Trophy checklist, ending scene, rival reveal, final reward, end-game Quick Fight link                       | Missions, Tournament, Quick Fight, Main Menu |

Store and Missions exist only inside an active Story Mode session.

## Quick Fight views

| View              | Status      | Purpose                                      | Contains                                                                                                                        | Primary exits                         |
| ----------------- | ----------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Quick Fight Setup | Partial     | Configure a sandbox fight                    | 1–3 player and opponent Lineups, visual class wheel, difficulty, Standard Build contract; Accessory and Custom settings planned | Quick Battle, Main Menu               |
| Quick Battle      | Implemented | Play without story ownership or unlock rules | Same readable battle surface as Story Battle                                                                                    | Quick Result                          |
| Quick Result      | Implemented | Explain the sandbox outcome                  | Verdict and deterministic battle report; no story rewards                                                                       | Rematch, Quick Fight Setup, Main Menu |

## Tournament views

| View                      | Status      | Purpose                                          | Contains                                                                                                    | Primary exits                                       |
| ------------------------- | ----------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Tournament Lobby          | Implemented | Start or resume a standalone tournament object   | Tournament identity, illustrated Trophy, Standard Build rules, current round, Case health, Trophy ownership | Tournament Battle, Main Menu                        |
| Tournament Case Selection | Planned     | Select a locked Case for a custom standalone run | Reusable character selector, Standard/Custom contract, Accessory                                            | Tournament Lobby                                    |
| Tournament Interlude      | Implemented | Choose one persistent between-round effect       | Heal active, heal Case/revive, or next-round Charge                                                         | Next round, Main Menu                               |
| Tournament Battle         | Implemented | Play the current authored round                  | Common battle surface plus round identity                                                                   | Tournament Result                                   |
| Tournament Result         | Implemented | Explain round/run outcome                        | Round verdict, XP/Stamps, Cup purse and one-time Trophy award when complete                                 | Interlude, restart from Round 1, Profile, Main Menu |

## Shared battle composition

The battle surface is one full-stage viewport modelled on the proven
action-battler structure in the supplied reference-game brief:

1. A full-bleed Kinetic Print arena owns most of the viewport.
2. Compact health readouts anchor the top corners and portrait Lineups hug the
   side edges.
3. The player's large Charge Strip owns the bottom command field.
4. Three circular Move controls sit directly above their cost positions on the
   Strip and become explicitly labelled `Ready` when the fill reaches them.
5. `3 → 2 → 1 → FIGHT` establishes the match before simulation advances.
6. Once a Move begins, simulation and commands lock while its cut-in, automatic
   dodge or interruption, impact, and reaction play.
7. Normal, Tier 1, and Tier 2 Moves use base, silver, and gold outlines in
   addition to visible tier labels.
8. Move name, effect, predicted value, cost, and charge time remain available
   through visible compact labels and focus/hover explanations.
9. Larger still-image layers, two-frame swaps, cut-ins, hit reactions, and
   stamped event feedback convey action without hiding rules or state.

## Shared pause and development inspector

- Escape toggles a blocking pause sheet during every active single-player
  battle. P either pauses while held or toggles pause, according to the global
  Play and accessibility preference.
- The pause sheet exposes Resume, Restart, Main Menu, and Developer tools.
- Developer tools open the fight paused and expose state, recent events, time
  stepping, Charge controls, and report export.
- Opening or closing the inspector never changes rewards or progression.

## Navigation rules

- The LOFTWAH FIGHTER wordmark returns to the Main Menu; it never silently starts a
  story.
- Entering Story, Quick Fight, or Tournament is always an explicit action.
- Leaving a mode returns to the Main Menu without deleting its persisted state.
- Story navigation contains Story, Lineup, Collection, Store, and Missions.
- Global navigation contains Main Menu, Achievements, Profile, and Settings.
- Development builds add Developer Lab without changing the three player-facing
  game modes.
- Tournament and Quick Fight never expose Story Store or Story Missions.
- Audio playback intent is a persisted preference. A paused/off choice survives
  navigation and reloads, and no screen turns music back on by itself.
