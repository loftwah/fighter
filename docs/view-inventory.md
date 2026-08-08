# LOFTWAH FIGHTER view inventory

Status: authoritative interface map for the current prototype.

The application opens at a launcher. A game mode does not exist on screen until
the player deliberately starts or resumes it. Global navigation and in-game
navigation are separate.

[`docs/match-launch-flows.md`](match-launch-flows.md) owns the accepted route
through Character selection, Lineup preparation, Fight Settings, Review Fight,
and Battle. An implemented screen that contradicts that flow is implementation
debt, not a product decision.

`docs/view-mockup-programme.md` owns the batched composition-review process.
Mock-up choices do not change this inventory until an accepted answer is
reconciled into the relevant authority and surface brief.

Status terms: **implemented** is usable now, **partial** has a usable subset,
**planned** is an accepted contract that still needs implementation, and
**correction required** means current UI exists but contradicts an accepted
contract.

## Scrolling policy

Scrolling follows the job of the view rather than its game mode.

| Policy                         | Views                                                                                                                                                                                 | Contract                                                                                                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Viewport stage                 | Intro, loading, Main Menu, Character Select, Lineup preparation, ordinary Fight Settings, Review Fight, Battle/countdown, ordinary Pause, Tournament interlude, blocking confirmation | No deliberate document scroll at `1728 × 1117` or `390 × 844`; primary action and critical state remain visible. Emergency overflow is recoverable under zoom, large text, virtual keyboard, or exceptional localisation.      |
| Bounded internal sheet         | Battle Result, deployment/Tournament Result, development inspector, storage recovery, long help                                                                                       | The mounted stage does not scroll. One clearly owned sheet may scroll internally while its close/back action remains reachable.                                                                                                |
| Browsing or sequential content | Profile, Achievements, Settings, Developer Lab, Story Library/Home/content, Collection, Store, Missions, Tournament Library/Lobby/Builder                                             | One screen-content scroller is permitted. Context and primary actions remain stable; avoid nested scrolling regions. Large catalogues use explicit pagination and a stable detail region rather than infinite document growth. |

Story and Tournament therefore contain many legitimate scrolling views, but
they are not the only contexts where content length is real. Profile,
Achievements, Settings, Collection, Store, Missions, and Developer Lab also
scroll deliberately. Selection, confirmation, and gameplay do not.

## Entry states

| View              | Status      | Purpose                                   | Contains                                                                              | Primary exits       |
| ----------------- | ----------- | ----------------------------------------- | ------------------------------------------------------------------------------------- | ------------------- |
| Intro / Splash    | Implemented | Play optional pre-game editorial content  | Ordered text, registered image, or registered video beats; progress and skip controls | Loading             |
| Loading / Waiting | Implemented | Show an honest non-interactive transition | Reduced-motion-aware wait mark and plain-language status                              | Main Menu or Battle |

## Global views

| View             | Status      | Purpose                                                                                            | Contains                                                                                                                                             | Primary exits               |
| ---------------- | ----------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Main Menu        | Implemented | Choose what kind of game to play                                                                   | Story Mode, Quick Fight, Tournament, current Collector summary, Profile, Settings, Achievements                                                      | Selected game setup/session |
| Profile          | Partial     | Manage global identity, records, Story Saves, custom Tournaments, Trophy cabinet, and Story awards | Player name, local profile selector, Story Save list, Quick/Tournament records, global cabinets; current screen still reflects the retired flat save | Main Menu                   |
| Achievements     | Implemented | Inspect retroactive profile awards                                                                 | Unlocked and in-progress award tickets                                                                                                               | Main Menu, Profile          |
| Settings         | Implemented | Manage application behaviour and local data                                                        | Difficulty, reduced motion, music/SFX/dialogue controls, local-data recovery/export information                                                      | Main Menu                   |
| Storage Recovery | Implemented | Explain invalid local data without silently destroying it                                          | Warning, backup download, safe-default action                                                                                                        | Prior view                  |
| Developer Lab    | Implemented | Launch and inspect development-only game states                                                    | Scenario switchboard, custom Lineups, seed/Charge/time controls, diagnostics, convenience tools                                                      | Dev Battle, Main Menu       |

The global shell never shows Store or Missions.

Profile means the one currently selected global Player identity. Quick Fight
history, standalone Tournament records, custom Tournament definitions, global
Tournament Trophies, Story completion awards, Achievements, and the Story Save
list belong there. Character ownership, economy, builds, Missions, Store state,
active Squad, Story progress, and Story-local Trophy records belong inside one
selected Story Save. The local profile selector changes which Player is active;
it does not create another record layer inside a Player.

## Implementation ownership

| View family                                                                 | Route/state owner                      | Renderer                                                                                                    |
| --------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Intro / Loading                                                             | startup stage and `startup-content.ts` | `ui/screens/startup-screen.ts`                                                                              |
| Global launcher, Profile, Settings, Achievements                            | global route/session                   | matching `ui/screens/*-screen.ts` plus `ui/shell/app-shell.ts`                                              |
| Story Home, Lineup, Collection, Store, Missions                             | Story session and selected save        | matching `ui/screens/*-screen.ts`                                                                           |
| Quick Character Select, Lineup preparation, Fight Settings and Review Fight | Quick session workflow draft           | `app/fight-workflow.ts`, `app/quick-fight-workflow.ts`, and the matching `ui/screens/*-screen.ts` renderers |
| Tournament lobby/interlude                                                  | tournament session/run                 | `ui/screens/tournament-screen.ts`                                                                           |
| Developer Lab                                                               | development-only scenario draft        | `ui/screens/dev-lab-screen.ts`                                                                              |
| Battle shell                                                                | battle session controller              | `ui/screens/battle-screen.ts` plus Phaser `game/` adapter                                                   |
| Pause, inspector, victory, defeat                                           | blocking battle substates              | battle-session controller overlays                                                                          |

`app/routes.ts` is the exhaustive route contract. Pause, results, the battle
countdown, battle loading, and the development inspector are substates of the
shared battle screen because they must retain the same mounted battle and
report. They are intentionally not standalone routes.

## Story Mode views

| View                          | Status              | Purpose                                                          | Contains                                                                                                | Primary exits                                |
| ----------------------------- | ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Story Library                 | Planned             | Start, resume, restart, or delete one save per Story definition  | Story identity, completion award, progress/resume state, destructive confirmation                       | Story Home, Main Menu                        |
| Story Home                    | Implemented in part | Continue the selected Story Save                                 | Current Level/step, content, next action, Level path; current renderer still assumes one flat First Run | Next step, Story navigation, Main Menu       |
| Story Squad                   | Planned             | Choose up to six active Story-owned/loaned instances             | Story collection, builds, active-six membership, validation                                             | Story Home, Fight Lineup preparation         |
| Fight Lineup preparation      | Planned             | Deploy one to three eligible active Squad members                | Paginated eligible portraits, selected order/starter, Lineup Accessory, authored opponent preview       | Story Squad/current node, Fight Settings     |
| Fight Settings                | Planned             | Inspect authored rules and edit only explicitly permitted values | Effective difficulty, clock, opening conditions, locked build evidence and consequences                 | Fight Lineup preparation, Review Fight       |
| Review Fight                  | Partial             | Verify the resolved Story match and start it once                | Both Lineups, starter/bench order, builds, Accessories, synergy, difficulty, rules and provenance       | Story Battle, Fight Settings, Story Home     |
| Story Battle                  | Implemented         | Play an authored fight                                           | Arena, both Lineups, health, Moves, player Charge Strip, timer, matchup, event feedback                 | Result                                       |
| Story Result                  | Implemented         | Explain outcome and progression                                  | Verdict, Stamps, XP, first-clear reward, report ID                                                      | Retry, Story Home                            |
| Collection and Lore           | Implemented         | Inspect discoveries and configure owned builds                   | Revealed lore, locked files, owned copies, levels, XP, Patches                                          | Story navigation                             |
| Character Points and Upgrades | Partial             | Allocate points and manage Moves                                 | Persisted XP/unspent points and tiers; direct allocation/reorder/upgrade controls still planned         | Collection                                   |
| Modifications                 | Implemented in part | Equip per-Relic build modifiers                                  | Reusable Patches; shared team Accessories remain planned                                                | Collection, Selection                        |
| Story Store                   | Implemented         | Buy story progression content                                    | Story-gated rotating Relics and Patches, balance, story node continuation                               | Story navigation                             |
| Story Missions                | Implemented         | Inspect and claim story objectives                               | Mission requirements, progress, rewards, claim state                                                    | Story navigation                             |
| Story Tournament Node         | Implemented         | Play the authored tournament inside the story                    | Cup bracket, locked Case, carried health, interlude drops                                               | Tournament Battle, Story Home                |
| Story Ending                  | Implemented         | Verify and archive the story run                                 | Required Mission/Trophy checklist, ending scene, rival reveal, final reward, end-game Quick Fight link  | Missions, Tournament, Quick Fight, Main Menu |

Store and Missions exist only inside an active Story Mode session.

## Quick Fight views

The currently implemented large Quick preset destination is retired from the
accepted flow. Main Menu enters Character Select directly. Its code may remain
temporarily while the correction is in progress, but no design or test should
treat it as a required view.

| View                 | Status      | Purpose                                      | Contains                                                                                                                      | Primary exits                                                   |
| -------------------- | ----------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Character Select     | Implemented | Prepare both sandbox Lineups                 | Paginated full catalogue, exact duplicate instances, order/starter controls, and one visual Accessory picker per Lineup       | Quick Fight Settings, Main Menu                                 |
| Quick Fight Settings | Implemented | Configure the current sandbox match          | Compact preset selector, difficulty, clock, opening Charge, seed, per-instance levels/stats/Move tiers/order/Modifications    | Character Select, Review Fight, Main Menu                       |
| Review Fight         | Implemented | Verify the resolved sandbox match            | Read-only Lineups, build evidence, Accessories, synergies, effective difficulty/rules, provenance, and one Start Fight action | Quick Battle, Character Select, Quick Fight Settings, Main Menu |
| Quick Battle         | Implemented | Play without story ownership or unlock rules | Same readable battle surface as Story Battle                                                                                  | Quick Result; Pause offers Parent and Main Menu                 |
| Quick Result         | Implemented | Explain the sandbox outcome                  | Verdict and deterministic Battle Report; no Story rewards                                                                     | Rematch, Character Select, Main Menu                            |

## Tournament views

| View                         | Status              | Purpose                                                           | Contains                                                                                                                | Primary exits                                           |
| ---------------------------- | ------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Tournament Choice            | Implemented         | Choose a preset, resume a run, or choose the custom branch        | Preset/custom identity, mandatory Trophy, run state, safe replacement consequences                                      | Tournament Builder, Roster Select, Main Menu            |
| Tournament Builder           | Planned for V2.1    | Create a local custom Tournament definition                       | Name, generic Trophy, opponent Squads, global defaults, per-fight overrides, ordered content/chance/recovery nodes      | Tournament Choice, Main Menu                            |
| Tournament Lobby             | Implemented         | Inspect a definition and start/resume its run                     | Tournament identity, Trophy, current node and locked Roster Health; the first registered preset is the Wrong Door Cup   | Tournament Roster, current round, Main Menu             |
| Tournament Roster Select     | Implemented         | Configure and lock up to six sandbox or Story instances           | Paginated eligible instances/builds, Story or standalone policy, confirmation                                           | Tournament Settings, Tournament Choice/Lobby, Main Menu |
| Tournament Settings          | Implemented         | Resolve run-wide defaults and explicit per-fight overrides        | Preset or custom values, override map, effective-rule previews; preset edits create an isolated custom variant          | Tournament Roster, Lineup preparation, Main Menu        |
| Per-fight Lineup preparation | Partial             | Deploy up to three living Roster members                          | Persistent Health, defeated state, order/starter controls, Lineup Accessory, pending effects, authored opponent preview | Review Fight, Tournament Lobby, Main Menu               |
| Review Fight                 | Partial             | Verify the resolved Tournament deployment                         | Both Lineups, carried Health, order, Accessories, effective defaults/overrides, consequences and provenance             | Tournament Battle, Lineup preparation, Main Menu        |
| Tournament Interlude         | Implemented in part | Resolve a data-authored non-fight node                            | Heal, team heal/revive, Charge, future statuses/boosts/content/chance                                                   | Current/next node, Main Menu                            |
| Tournament Battle            | Implemented         | Play the current fight deployment                                 | Common battle surface plus Tournament/fight identity                                                                    | Deployment Result; Pause offers Parent and Main Menu    |
| Deployment Result            | Implemented         | Explain victory or non-victory without prematurely ending the run | Persistent player/opponent Health, living reserves, repeat-deployment/next-node/forfeit consequence                     | Lineup preparation, Interlude, Tournament Result        |
| Tournament Result            | Implemented         | Explain victory, complete-Roster defeat, or confirmed forfeit     | Run verdict, rewards and de-duplicated Trophy projection; one lost fight permits redeployment while the Roster survives | Restart, Profile, Main Menu                             |

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
- The pause sheet exposes Resume, Restart, Quit Fight to Parent, Quit to Main
  Menu, and Developer tools in development builds. Tournament quit confirmation
  names and applies the round consequence; it never restores a pre-fight Health
  snapshot.
- Developer tools open the fight paused and expose state, recent events, time
  stepping, Charge controls, and report export.
- Opening or closing the inspector never changes rewards or progression.

## Navigation rules

- The LOFTWAH FIGHTER wordmark returns to the Main Menu; it never silently starts a
  story.
- Entering Story, Quick Fight, or Tournament is always an explicit action.
- Quick Fight always enters Character Select. Its compact preset selector lives
  inside Quick Fight Settings and changes related controls in place. It never
  occupies a destination screen or bypasses selection.
- Story enters its authored node before eligible active-Squad selection.
  Tournament enters Tournament Choice or resume state, resolves a locked Roster
  plus global/per-fight settings, then opens per-fight Lineup preparation.
  Every path finishes at the read-only shared Review Fight.
- Every player-facing Battle requires confirmed Review Fight and a validated
  match configuration. Developer Lab may bypass the visible setup screen, but
  not validation, provenance, or its development/no-progression classification.
- Every non-Battle screen exposes an explicit Parent destination and Main Menu
  destination. Parent is workflow-owned and does not depend on browser history.
- Battle Pause exposes Quit Fight to Parent and Quit to Main Menu. Leaving a
  live fight cannot silently bypass Story or Tournament consequences.
- Leaving a mode returns to the Main Menu without deleting its persisted state.
- Story navigation contains Story, Lineup, Collection, Store, and Missions.
- Global navigation contains Main Menu, Achievements, Profile, and Settings.
- Development builds add Developer Lab without changing the three player-facing
  game modes.
- Tournament and Quick Fight never expose Story Store or Story Missions.
- Audio playback intent is a persisted preference. A paused/off choice survives
  navigation and reloads, and no screen turns music back on by itself.
