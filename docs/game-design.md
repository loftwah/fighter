# Riot Relics — game design document

Status: authoritative for the current prototype  
Working title: **Riot Relics** (proposed, replaceable)  
Last design consolidation: 2026-07-30

## 1. Product statement

Riot Relics is a collectible squad battler about scrappy toy figures that come alive inside illicit printed fight cards. The player is a Collector building a Lineup, exploiting class matchups, upgrading three Moves per Relic, and returning to old opponents powerful enough to flatten them.

The compact loop is:

```text
fight → earn → upgrade → collect → unlock → fight again
```

Story, dialogue, shops, missions, rewards, choices, and tournaments are authored nodes from `00` to `n`. There is no walkable overworld.

## 2. Working language

These names are strong working proposals. Stable IDs must outlive display-name changes.

| Design concept                 | Working term  |
| ------------------------------ | ------------- |
| Collectible character          | Relic         |
| Player                         | Collector     |
| Deployed battle team           | Lineup        |
| Tournament roster              | Case          |
| Action                         | Move          |
| Battle resource                | Charge Strip  |
| Modification                   | Patch         |
| Currency                       | Stamps        |
| Random battle pickup           | Drop          |
| Rectangular animation language | Kinetic Print |

## 3. World and first cast

Rare figures are supposedly misprints. The corporate tournament circuit calls them defects; underground Collectors know the “errors” are what wake a Relic up. The canonical first story follows a small print-shop crew entering a rigged qualifier after **The Ledger** begins confiscating unofficial figures.

Initial factions:

- **Free Shelf** — collectors, bootleg printers, and figures who refuse official ownership.
- **The Ledger** — licensed enforcers who price, grade, and repossess everything.
- **House Stock** — independent fighters who care more about the match than either side.

Initial cast:

| ID                      | Name        | Class   | Faction     | Role                                    |
| ----------------------- | ----------- | ------- | ----------- | --------------------------------------- |
| `character.mara-vex`    | Mara Vex    | Impact  | Free Shelf  | Starter; direct damage and interruption |
| `character.knuckle-tax` | Knuckle Tax | Guard   | The Ledger  | First rival; defence and taunt          |
| `character.zipwire`     | Zipwire     | Circuit | Free Shelf  | Fast bar control                        |
| `character.velvet-hex`  | Velvet Hex  | Hex     | House Stock | Status and cleanse                      |
| `character.gutter-grin` | Gutter Grin | Guile   | House Stock | Dodge and critical play                 |
| `character.scrapjack`   | Scrapjack   | Feral   | The Ledger  | Team damage and pressure                |

## 4. Modes

Riot Relics opens on a Main Menu. The player explicitly starts or resumes Story
Mode, Quick Fight, or Tournament Mode; launching the application never drops
the player into an active game. Global navigation contains Main Menu, Profile,
and Settings only.

Before the Main Menu, the application may play an ordered, skippable startup
sequence made from text, registered images, and registered video. A visible
waiting state separates that sequence from the launcher and is reused for
genuine arena construction. Startup content never creates or resumes a game
session by itself.

### Story Mode

- One canonical main story and any number of independent or unofficial stories.
- Nodes can be dialogue, narration, choice, battle, store, mission unlock, reward, tournament, chapter transition, or ending.
- Cleared nodes are directly replayable. Dialogue and cleared fights can be skipped.
- Choices may alter reachable short-term nodes but never permanently lock content.
- Story progress is shared across difficulty settings.
- A story may lend characters or override a Lineup only by giving the player additional access, never by permanently taking owned content.
- Collection, Store, Missions, story Lineup, and authored story tournaments are
  scoped to an active Story Mode session. Store and Missions are not global
  Main Menu destinations.

### Quick Fight

- Quick Fight defaults to the progression-neutral **Standard Build**: Level 10,
  nine equally budgeted allocation points (`2 Vitality / 2 Power / 2 Evasion /
2 Fortune / 1 Tempo`), Stock Moves, and no Patch.
- All Relics and opponents are available without ownership. Supported custom
  rules may override levels, allocations, Move order/tiers, Patches, music, and
  encounter rules, but the setup and result must be labelled `Custom`.
- It is a sandbox and does not require ownership.
- Quick Fight never changes Story progress, Stamps, XP, Missions, ownership, or
  tournament runs.

### Tournament Mode

- The player selects a Case of up to eight Relics before entry.
- Up to three living Case members enter each fight.
- Health, defeat state, and equipped Patches persist between rounds.
- Patches cannot be changed during the tournament.
- Interstitial nodes can heal, heal the Case, revive, grant starting Charge, stun the next enemy, open a store, or give a reward.
- Losing a fight ends the run. A tournament can be restarted and replayed indefinitely.
- Standalone tournaments can be customised; Story tournaments are authored.
- A standalone tournament uses Standard Builds unless its authored or Custom
  rules explicitly provide another locked Case build. A Story tournament uses
  owned or authored-loan builds.

### Achievements

- Achievements belong to the selected Collector profile and remain available
  from the global shell.
- Achievement state is derived from durable profile facts wherever possible, so
  an award added in a later build can unlock retroactively.
- Achievements do not grant combat power unless an authored reward explicitly
  says so.

### Challenge Mode

Uses the same combat engine with authored constraints such as forced Lineups, time limits, reduced healing, pre-applied statuses, or target objectives.

### Developer Lab

- Development builds expose a Developer Lab from the Main Menu and from the
  pause menu during every battle.
- The Lab launches validated, named scenarios or a custom one-to-three-Relic
  matchup without requiring Story progress, ownership, or setup navigation.
- Scenario controls include Lineups, levels, Move presentation tiers, Patches,
  seed, difficulty, starting health and Charge, time limit, and whether the
  fight opens paused.
- Development battles and their in-battle debug actions never grant rewards,
  update missions, advance Story, or mutate a tournament run. A report records
  that the fight was a development sandbox.
- Convenience tools may inspect and export local state, open reached content,
  and grant explicit persistent development-only progression. Persistent tools
  are visibly separated from the isolated battle controls; destructive save
  actions remain labelled and confirmed.
- The Lab and its in-battle inspector are development surfaces, not a fourth
  player-facing game mode.

## 5. Combat rules

### 5.1 Format

- Two sides only: player and opponent.
- Each side deploys one to three Relics and has exactly one active Relic.
- Every side has an explicit controller assignment. The current player-facing
  modes assign the player side to one local human and the opponent to AI; the
  command boundary remains side-agnostic so a second local human controller can
  be added without changing combat rules.
- A battle ends when every Relic on a side is defeated or that side forfeits.
- Standard time limit: 90 seconds, content-configurable.
- At timeout, the side with the greater surviving-health percentage wins; exact ties favour the player on Easy/Normal and the opponent on Hard/Brutal.
- Once both sides' art and controls are ready, every player-facing fight runs an
  explicit `3 → 2 → 1 → FIGHT` countdown. Elapsed time, Charge, statuses,
  pending Moves, and AI decisions remain frozen until `FIGHT` clears.
- Escape pauses and resumes the complete single-player battle simulation.
  Opening the development inspector also pauses it. While paused, elapsed time,
  Charge, statuses, pending Moves, AI, and Phaser presentation time do not
  advance.

### 5.2 Charge Strips

- Each team owns an independent Charge Strip from 0 to 100.
- A Strip fills continuously and belongs to the team, not the active Relic.
- Switching never resets it.
- Both sides begin at 0 Charge unless an authored encounter, Patch, or
  tournament Drop supplies an explicit opening bonus.
- Base fill speed is `6 + Tempo × 0.3` Charge per second. A three-copy Echo
  Lineup multiplies that result by `1.08`. The current Tempo range therefore
  fills a complete Strip in roughly 11–14 seconds before other effects. A
  middle-Tempo Relic reaches a 25-cost Move in about 3.3 seconds, a 50-cost Move
  in about 6.7 seconds, and an 82-cost Move in about 10.9 seconds.
- The local player's Charge Strip is the primary combat control. It is large,
  persistent, and visually dominant beneath the arena.
- The active Relic's three Move controls are circular nodes anchored directly
  above their cost positions on the Strip. A node becomes explicitly ready
  when the fill reaches it; readiness never relies on colour alone.
- Player-facing Move tiers are Normal, Tier 1, and Tier 2. Persisted
  `stock`/`gold`/`platinum` identifiers remain compatible: Normal has the base
  outline, Tier 1 has a silver outline, and Tier 2 has a gold outline.
- Tempo, statuses, Patches, scenario rules, and Moves may change fill speed, add Charge, drain Charge, or freeze the Strip.
- Default Move costs are 25, 50, and 75. Reordering uses the nine positions `1L`, `1`, `1H`, `2L`, `2`, `2H`, `3L`, `3`, `3H`.
- Moving a Move earlier reduces its output; moving it later increases output.

Initial position model:

| Position | Cost | Output multiplier |
| -------- | ---: | ----------------: |
| `1L`     |   18 |              0.72 |
| `1`      |   25 |              0.82 |
| `1H`     |   32 |              0.92 |
| `2L`     |   43 |              0.94 |
| `2`      |   50 |              1.00 |
| `2H`     |   57 |              1.08 |
| `3L`     |   68 |              1.12 |
| `3`      |   75 |              1.22 |
| `3H`     |   82 |              1.34 |

### 5.3 Moves

- Every combat-ready Relic has three Move definitions.
- A Move is flavour, audiovisual references, a timing model, targeting, and an ordered list of reusable effects.
- Minimum effects are damage, healing, stun, attack modification, defence modification, Charge gain/drain, cleanse, shield, multi-hit, and charge-up.
- Targets are separate from effect types: self, active ally, all allies, active enemy, or all enemies.
- A Move may contain multiple effects. The engine resolves them in declared order.
- Predicted non-random base output is visible before selection. Critical hits, dodge, and variance can change the final result.

Resolution order:

```text
validate → spend Charge → start/charge → lock target → resolve hits
→ apply ordered effects → reactions/passives → defeats → semantic events
```

### 5.4 Charge-up and interruption

- Some Moves fire instantly. Others require an uninterrupted charge duration after spending Charge.
- Damage or stun interrupts a charging Relic by default.
- Dodge avoids the hit and therefore does not interrupt.
- A Patch or effect may grant interruption resistance.
- Starting, resolving, dodging, interrupting, and reacting to a Move creates a
  short presentation lock. During that lock the player cannot issue a Move or
  switch, the AI cannot decide, and elapsed time, Charge, statuses, and pending
  Moves do not advance. Automatic outcomes already decided by the deterministic
  transition—such as dodge, critical, status, damage, or defeat—play out before
  control returns.

### 5.5 Switching

- Switching is immediate and free unless a status or scenario prevents it.
- A stunned or switch-locked active Relic cannot switch.
- Switching cannot dodge an already targeted Move; the target is locked when resolution begins.
- Individual health and statuses remain on benched Relics.
- Status durations continue to tick while benched.
- Benched Relics do not regenerate unless an explicit effect allows it.

### 5.6 Core calculations

Combat is seeded. The same initial state, seed, time steps, and decisions must produce the same report.

Initial damage model:

```text
nominal = movePower × slotMultiplier
growth = 1 + (level - 1) × 0.035
power = 1 + allocatedPower × 0.035
temporary = attackMultiplier × targetDefenceMultiplier
class = 1.20 advantage | 0.82 disadvantage | 1 neutral
tier = 1.00 stock | 1.16 gold | 1.34 platinum
variance = seeded 0.94…1.06
critical = 1.55 when triggered
final = max(1, round(nominal × growth × power × temporary × class × tier × variance × critical))
```

Team-damage and team-healing Moves distribute their authored pool across living targets, preserving roughly the same total value as a stronger single-target Move.

Dodge normally prevents an entire hit. Multi-hit Moves roll dodge and critical independently per hit.

## 6. Classes and synergy

The six-class wheel is:

```text
Impact → Feral → Guile → Circuit → Hex → Guard → Impact
```

An arrow means “strong against.” A class is weak to the class pointing at it. Neutral Relics ignore the wheel. Moves inherit the acting Relic’s class and never carry a separate class.

Class effectiveness and Lineup synergy are different systems:

- Class effectiveness comes from the wheel.
- Faction synergy starts with two matching faction members.
- Two matching members grant `+2` effective Vitality to the Lineup.
- Three matching members grant `+2` effective Vitality and `+2` effective Power.
- Exact duplicate Relics are allowed. A three-copy “Echo Lineup” gains 8% faster Charge fill as an authored synergy.

All synergies are shown before battle and never rely on colour alone.

## 7. Relic progression

### 7.1 Stats

Allocated stats:

- **Power** — Move damage and offensive effects.
- **Evasion** — dodge probability, subject to a safe cap.
- **Fortune** — critical and positive battle probability.
- **Tempo** — team Charge fill contribution while deployed.
- **Vitality** — maximum health.

Defence is a temporary combat modifier, not a sixth allocated stat. Defence Down increases incoming damage and prevents dodge for its duration.

### 7.2 Levels

- Level cap: 25.
- Leveling grants automatic baseline growth and one freely reallocatable stat point.
- Stat points can be moved freely outside active battles and tournaments.
- Only Relics selected for the fight receive full XP; other members of a tournament Case may receive 20% support XP.
- Defeated participants receive XP.
- Smaller Lineups split the same fight XP across fewer Relics.

### 7.3 Move tiers

- Every owned Relic copy owns its own Move tiers.
- Tiers are Stock, Gold, and Platinum.
- Reordering and upgrading unlock at level 10.
- Upgrades never make a Move worse, are previewed exactly, and are permanent for that owned copy.

### 7.4 Patches

- One Patch slot per Relic, unlocked at level 5.
- Patches are reusable, freely removable outside tournaments, and can be equipped by only one owned Relic at a time.
- Some Patches are class-restricted.
- Patches do not level or expire.

Initial Patches:

- **Hot Start** — add 18 opening Charge to the shared Strip.
- **No Flinch** — 50% seeded chance for a charge-up Move to resist interruption.
- **Heavy Ink** — +3 effective Power.
- **Lucky Misprint** — +4 effective Fortune.

## 8. Economy, store, and rewards

- Stamps have no cap.
- Wins grant XP and Stamps; losses grant 30% of base XP and objective-appropriate mission progress.
- First clear adds an authored bonus.
- Easy and Normal grant identical rewards. Hard and Brutal do not multiply progression; their reward is challenge, optional commentary, and records.
- Repeat clears normally keep full base rewards.
- Store inventory rotates deterministically, supports specials, and is gated by story/tournament/mission progress.
- Favourited revealed Relics remain findable even when the featured rotation changes.
- Locked stock is hidden or shown as a silhouette until revealed.
- Owned Relics and Patches can be sold for their current full listed value in the prototype.
- Purchased Relics are usually level 2–10; specific offers declare the level.
- Duplicates are allowed and keep independent levels, tiers, allocations, and Patches.

## 9. Missions

Requirements are generic content blocks evaluated from semantic game reports.

Initial missions:

- **Fresh Ink** — add a second distinct Relic to the collection.
- **Invoice Denied** — defeat Knuckle Tax once.
- **Print It Personal** — after losing to a named opponent, return and defeat that opponent.

Mission progress can count on a loss when the objective describes an action actually completed, such as dealing damage. Win objectives never count on a loss.

## 10. Initial story: “First Run”

| Node | Type       | Title                 | Purpose                               |
| ---- | ---------- | --------------------- | ------------------------------------- |
| `00` | dialogue   | Wet Ink               | Introduce the print shop and Mara Vex |
| `01` | reward     | Shelf Space           | Lend and then grant Mara              |
| `02` | battle     | Tax Due               | Tutorial fight against Knuckle Tax    |
| `03` | store      | Backroom Counter      | Reveal rotating stock and Patches     |
| `04` | mission    | Read the Fine Print   | Unlock the three initial missions     |
| `05` | battle     | Qualifier Stamp       | Two-Relic rules introduction          |
| `06` | tournament | The Cheap Seats Cup   | Three-round tournament                |
| `07` | reward     | Officially Unofficial | Currency, rival reveal, ending panel  |

The first implementation may ship nodes `00`–`02` as the fully interactive vertical slice while representing later nodes in the path as locked previews.

## 11. Initial tournament: “The Cheap Seats Cup”

1. Fixed fight against a House Stock Relic.
2. Interstitial: choose one of heal active, heal Case, or start next round with +18 Charge.
3. Fixed fight against a two-Relic Lineup.
4. Interstitial store or revive offer when applicable.
5. Final against Knuckle Tax and Scrapjack.

Rewards are a tournament badge, Stamps, XP, and a chance to reveal a rare store offer.
The champion badge is unique. Replays remain a progression activity: a completed
replay pays its authored Stamp purse and battle XP again.

## 12. Presentation

Kinetic Print uses static rectangular and square art as its animation grammar:

- two-frame idle swaps;
- panel slides, wipes, stack reveals, and hard cuts;
- short cut-ins for powerful Moves;
- recoil, tilt, scale, hit-stop, flashes, shake, and number pops;
- halftone overlays and authored particles;
- character art never needs to include the opponent;
- status conditions usually use overlays instead of new character renders.

The working visual world is an underground risograph fight bill crossed with a collectible archive drawer. It uses indigo, tomato red, acid yellow, and chalk white spot inks; halftone portraits; torn seams; sticker seals; and rectangular pull tabs. It is proposed until approved but is the implementation target for this stage.

## 13. Audio

- All seven supplied tracks form one manually curated pool.
- Characters, stories, tournaments, battles, and menu surfaces may reference any track by stable ID.
- The player can replace associations, choose music in sandbox modes, mute music, and set volume.
- Music, SFX, and dialogue settings are independent.
- Music playback intent persists separately from volume/mute state. A player who
  stops music is never opted back in by navigation, battle entry, or reload.
- Dialogue and SFX are silent logical placeholders in this stage.
- Future dialogue is subtitled and normally overlaps presentation without pausing combat.

## 14. Profiles, saves, and accessibility

- The prototype supports three local Collector profiles. Slot-shaped storage is
  an implementation detail; the player manages identity and progression from
  Profile, not Settings.
- Autosave after battles, purchases, upgrades, and story progress.
- Preferences are separate from progression and survive progression wipes.
- Settings owns accessibility, audio, difficulty, and local-data management.
- Save export/import is deferred until the schema stabilises.
- Reduced motion, keyboard navigation, touch targets, subtitles, volume categories, readable contrast, and redundant class/status labels are required.

## 15. Current MVP

The current build should prove:

- story node to squad confirmation to playable battle to reward;
- Mara Vex and Knuckle Tax with three Moves each;
- one-to-three-character data structures and switching;
- two Charge Strips, class effectiveness, seeded damage/crit/dodge, basic statuses, charge-up interruption, AI, timer, win/loss, retry, and four difficulties;
- currency, XP, first-clear reward, a tiny store, collection, missions, and local saves;
- hybrid Phaser art renderer plus semantic DOM controls;
- real generated art, existing music, and silent SFX/dialogue fallbacks;
- content validation and automated domain tests.

It does not include the full campaign, final balance, backend, multiplayer, monetisation, mobile packaging, ElevenLabs output, or open-world systems.

## 16. Explicitly open decisions

- Final product name and permanent terminology.
- Final class names, bonuses, and wheel balance.
- Long-term mobile orientation.
- Final story-path topology and whether hidden nodes exist.
- Exact Quick Fight progression rewards.
- Final visual approval and future character/story-specific visual variance.
- Save export timing, PWA timing, analytics, observability provider, and cloud-save design.
