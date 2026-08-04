# LOFTWAH FIGHTER V2 — game design document

Status: **RATIFIED V2 PRODUCT AND RULES AUTHORITY**

Player-facing title: **LOFTWAH FIGHTER**

Repository identity: `loftwah/fighter`

First intended release: **V2**

Last design consolidation: 2026-07-31

## 1. Product statement

The game is a collectible squad battler about an extensible roster of
characters drawn from public-domain fiction, history, mythology, religion,
open-source culture, parody, and original creations. Every source is translated
through one coherent combat and presentation language. The player builds a
Lineup, exploits Combat Type matchups and Team Trait synergies, upgrades three
Moves per Character, and returns to old opponents powerful enough to flatten
them.

The compact loop is:

```text
fight → earn → upgrade → collect → unlock → fight again
```

Story, dialogue, shops, missions, rewards, choices, and tournaments are authored nodes from `00` to `n`. There is no walkable overworld.

The first-session emotional test is deliberately untechnical: the player
should finish the benchmark and think, “That was actually pretty fun.” Battle
clarity, meaningful decisions, Character identity, and the urge to rematch are
the evidence behind that reaction.

## 2. Working language

Use plain functional names until the final product vocabulary is approved.
Stable IDs must outlive display-name changes. `Relic`, `Collector`, `Case`, and
`Kinetic Print` survive only in migration-safe identifiers and historical
documents; they are not release terminology.

| Design concept                 | Current term                |
| ------------------------------ | --------------------------- |
| Collectible combatant          | Character                   |
| Human using a profile          | Player                      |
| Deployed battle team           | Lineup                      |
| Locked tournament roster       | Tournament Roster           |
| Character action               | Move                        |
| Battle resource                | Charge Strip                |
| Character modification         | Modification                |
| Currency                       | Stamps                      |
| Random battle pickup           | Drop                        |
| Rectangular animation language | Kinetic Panel Motion        |
| Matchup category               | Combat Type (or Type in UI) |
| Team-building category         | Team Trait (or Trait in UI) |

## 3. World and first cast

The world is deliberately absurd and permissive: a Linux mascot, a nursery-rhyme
egg, a religious figure, a Viking, an Australian folk figure, and the
personification of death can plausibly meet in the same tournament. The game
does not require one corporate-print-shop fiction to justify that roster.
Individual stories may provide their own premise and tone while using the same
Characters and battle rules.

Accepted launch roster:

| Stable ID               | Name          | Combat Type  | Team Traits     | Battle identity                         |
| ----------------------- | ------------- | ------------ | --------------- | --------------------------------------- |
| `character.tux`         | Tux           | Tech         | Icon            | Charge manipulation and system pressure |
| `character.humpty`      | Humpty Dumpty | Oddball      | Icon            | Evasion, reflection, and risky control  |
| `character.moses`       | Moses         | Arcane       | Hero, Mythic    | Healing, cleansing, and safe passage    |
| `character.viking`      | Viking        | Brawler      | Historic        | Direct damage, stun, and multi-hit      |
| `character.ned-kelly`   | Ned Kelly     | Sharpshooter | Hero, Historic  | Reliable shots, armour, and lockdown    |
| `character.grim-reaper` | Grim Reaper   | Beast        | Monster, Mythic | Debuffs, team pressure, and lifesteal   |

The six launch Characters cover all six Combat Types. Five of the six Team
Traits are represented; Villain is intentionally available to the system but
not forced onto a launch Character it does not honestly describe. The first
appropriate antagonist can introduce it.

Every public release must record the source and rights status of each Character
interpretation. No subject category requires owner pre-approval before draft
production, but protected marks, recognisable modern designs, living cultures,
and religious figures still receive explicit provenance, rights, cultural-care,
and shipping review. The art pipeline creates a house interpretation and never
treats a familiar source image as reusable production art.

Agents own draft worldbuilding, biographies, dialogue, locations, Tournament
themes, and Story outlines. The target is extensive, deliberate, adult dark
comedy driven by Character behaviour, social friction, escalation, and
surprising consequences. It may be sharp or profane where the Character earns
it; generic swearing, copied catchphrases, and imitation plots are not a voice.
Owner corrections refine that work rather than requiring the owner to author it.

## 4. Modes

The application opens on a Main Menu. The player explicitly starts or resumes Story
Mode, Quick Fight, or Tournament Mode; launching the application never drops
the player into an active game. Global navigation contains Main Menu, Profile,
and Settings only.

Before the Main Menu, the application may play an ordered, skippable startup
sequence made from text, registered images, and registered video. A visible
waiting state separates that sequence from the launcher and is reused for
genuine arena construction. The opening beat remains readable until the player
advances or skips it; it never disappears on a timer. Its brief handoff names
the Main Menu rather than claiming a fight is loading. Startup content never
creates or resumes a game session by itself.

Every player-facing battle passes through a mode-appropriate **Fight Setup**
surface before arena construction. Quick Fight edits both Lineups, Story shows
owned and authored-loan access plus any forced composition, and Tournament
selects the deployed Lineup and starter from the locked Tournament Roster.
These surfaces share confirmation language even when a mode deliberately locks
some choices.

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
- Each Story definition declares the Missions and Tournament Trophies required
  for its ending. Reaching the final node is not completion by itself: the
  ending unlocks only when every declared requirement is complete.
- After the canonical Story is complete, Quick Fight remains the unrestricted
  end-game sandbox. This is a state of the existing mode, not a fourth mode.
- Player-facing numbered levels are battles, Tournaments, and later authored
  boss fights. Dialogue, rewards, choices, mission hooks, stores, and other
  interstitial nodes keep stable internal IDs but do not need to display a
  level number. The path may use a compact level-progression presentation, but
  it never becomes a walkable map.

### Quick Fight

- Quick Fight defaults to the progression-neutral **Standard Build**: Level 10,
  nine equally budgeted allocation points (`2 Vitality / 2 Power / 2 Evasion /
2 Fortune / 1 Tempo`), Stock Moves, and no Modification.
- All Characters and opponents are available without ownership. Supported custom
  rules may override levels, allocations, Move order/tiers, Modifications, music, and
  encounter rules, but the setup and result must be labelled `Custom`.
- It is a sandbox and does not require ownership.
- Quick Fight never changes Story progress, Stamps, XP, Missions, ownership, or
  tournament runs.
- The selected Profile records fights played, wins, losses, last seed, and the
  last two Lineups. This is history, not progression or a reward source.
- Story completion may relabel Quick Fight as the end-game sandbox, but never
  restricts its roster, rules, rematches, or matchup controls.
- The first V2 benchmark defaults to Standard-build Viking against
  Standard-build Grim Reaper with Second Wind versus Dead Air and seed
  `3844240869`.

### Tournament Mode

- The player selects a Tournament Roster of up to six Characters before entry.
- Up to three living Tournament Roster members enter each fight.
- The launch Wrong Door Cup locks all six launch Characters, lets the player
  deploy one to three living members before each ready round, and explicitly
  choose which deployed Character starts.
- Health, defeat state, and equipped Modifications persist between rounds.
- Modifications cannot be changed during the tournament.
- Interstitial nodes can heal, heal the Tournament Roster, revive, grant starting Charge, stun the next enemy, open a store, or give a reward.
- Losing a fight ends the run. A tournament can be restarted and replayed indefinitely.
- A loss clears the run and the next attempt begins at Round 1. Participants
  still receive the authored loss XP; there is no rematch inside the failed run.
- Activating the selected team Accessory exhausts it for the remainder of that
  Tournament run. Restarting or completing the run restores availability.
- Standalone tournaments can be customised; Story tournaments are authored.
- A standalone tournament uses Standard Builds unless its authored or Custom
  rules explicitly provide another locked Tournament Roster build. A Story tournament uses
  owned or authored-loan builds.
- Every authored Tournament names exactly one registered Trophy with an opaque
  image asset, name, description, and accessible alternative text.
- The first win permanently adds that Trophy to the selected Player profile.
  Replays can pay their authored repeat rewards, but cannot duplicate ownership.
- Custom Tournaments may select from registered generic Trophy designs. Generic
  designs are reusable presentation options; each completed custom Tournament
  still records its own authored award identity when custom persistence ships.

### Achievements

- Achievements belong to the selected Player profile and remain available
  from the global shell.
- Achievement state is derived from durable profile facts wherever possible, so
  an award added in a later build can unlock retroactively.
- Achievements do not grant combat power unless an authored reward explicitly
  says so.
- The Profile includes a Trophy cabinet derived from durable Tournament Trophy
  ownership. Trophy collection is also available to achievement rules.

### Challenge Mode

Uses the same combat engine with authored constraints such as forced Lineups, time limits, reduced healing, pre-applied statuses, or target objectives.

### Developer Lab

- Development builds expose a Developer Lab from the Main Menu and from the
  pause menu during every battle.
- The Lab launches validated, named scenarios or a custom one-to-three-Character
  matchup without requiring Story progress, ownership, or setup navigation.
- Scenario controls include Lineups, levels, Move presentation tiers, Modifications,
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
- Each side deploys one to three Characters and has exactly one active Character.
- Every side has an explicit controller assignment. The current player-facing
  modes assign the player side to one local human and the opponent to AI; the
  command boundary remains side-agnostic so a second local human controller can
  be added without changing combat rules.
- A battle ends when every Character on a side is defeated or that side forfeits.
- Leaving or restarting an active tournament round is a forfeit and closes the
  current Tournament Roster; it cannot restore the pre-round snapshot.
- Quick Fight uses a 90-second baseline. Normal Story and Tournament fights use
  120 seconds; boss and custom content can override the limit.
- At timeout, the side with the greater surviving-health percentage wins; exact ties favour the player on Easy/Normal and the opponent on Hard/Brutal.
- If a deferred reaction or simultaneous periodic step defeats both complete
  Lineups, the same difficulty tie rule applies explicitly.
- Once both sides' art and controls are ready, every player-facing fight runs an
  explicit `3 → 2 → 1 → FIGHT` countdown. Elapsed time, Charge, statuses,
  pending Moves, and AI decisions remain frozen until `FIGHT` clears.
- Escape pauses and resumes the complete single-player battle simulation.
  Opening the development inspector also pauses it. While paused, elapsed time,
  Charge, statuses, pending Moves, AI, and Phaser presentation time do not
  advance.

Difficulty changes AI judgement and reaction opportunity without changing
Story access or progression rewards:

- **Easy** — deliberately difficult to lose; the opponent leaves generous
  windows and avoids consistently optimal pressure.
- **Normal** — forgiving when the player engages with the fight, but prolonged
  inaction or repeatedly poor choices can lose.
- **Hard** — a fair, active fight with useful AI decisions and room to recover.
- **Brutal** — the same legal information and rules with the opponent using its
  strongest available judgement and shortest readable reaction window.

### 5.2 Charge Strips

- Each team owns an independent Charge Strip from 0 to 100.
- A Strip fills continuously and belongs to the team, not the active Character.
- Switching never resets it.
- Both sides begin at 0 Charge unless an authored encounter, Modification, or
  tournament Drop supplies an explicit opening bonus.
- Base fill speed is `5 + Tempo × 0.4` Charge per second. A three-copy Echo
  Lineup multiplies that result by `1.08`. The current Tempo range therefore
  fills a complete Strip in roughly 11.6–15.2 seconds before other effects. A
  middle-Tempo Character reaches a 25-cost Move in about 3.6 seconds, a 50-cost
  Move in about 7.1 seconds, and a 95-cost Move in about 13.6 seconds.
- The local player's Charge Strip is the primary combat control. It is large,
  persistent, and visually dominant beneath the arena.
- The active Character's three Move controls are circular nodes anchored directly
  above their cost positions on the Strip. A node becomes explicitly ready
  when the fill reaches it; readiness never relies on colour alone.
- Each side has a compact readiness marker attached to its Health readout.
  While waiting it names the next Move and exact Charge remaining; when a Move
  becomes usable the player marker switches to `YOUR MOVE`, identifies the
  green controls, and lists the available number keys, while the opponent
  marker switches to `OPPONENT READY`. The arena art recedes during player
  decision time so the player marker, Strip, and usable Moves own the hierarchy.
- The two most recent combat events sit in a reserved `FIGHT FEED` strip
  immediately beneath the player's Charge Strip. They do not float over the
  arena or obscure either resource console.
- Player and opponent information never share ambiguous labels. Readouts say
  `YOUR FIGHTER` and `OPPONENT`; blocking presentations say `YOUR MOVE` or
  `OPPONENT MOVE` before naming the Character and Move.
- Both Strips show their current whole-number Charge and effective
  Charge-per-second rate. The player's larger Strip also exposes 0, 25, 50, 75,
  and 100 scale marks so the retained 0–100 rules range reads as usable space.
- Player-facing Move tiers are Normal, Tier 1, and Tier 2. Persisted
  `stock`/`gold`/`platinum` identifiers remain compatible: Normal has the base
  outline, Tier 1 has a silver outline, and Tier 2 has a gold outline.
- Every Move declares one primary tactical category: Attack, Team attack, Stun,
  Team stun, Support, Team support, Charge control, or Special. The inner Move
  band and visible label communicate tier; a separate outer spot-colour band
  and visible label communicate category. Pause exposes the complete key.
  Colour is never the only carrier of either meaning.
- Tempo, statuses, Modifications, scenario rules, and Moves may change fill speed, add Charge, drain Charge, or freeze the Strip.
- Default centre Move costs are 25, 50, and 82. Reordering uses the nine
  positions `1L`, `1`, `1H`, `2L`, `2`, `2H`, `3L`, `3`, `3H`.
- Reordering changes the Move's Charge band and output multiplier. A Move keeps
  its configured Low, Standard, or High offset when it moves to slot 1, 2, or 3. At level 10 the player can also select that offset independently within
  each occupied band.
- Moving a Move earlier reduces its output; moving it later increases output.

Initial position model:

| Position | Cost | Output multiplier |
| -------- | ---: | ----------------: |
| `1L`     |   18 |              0.70 |
| `1`      |   25 |              0.80 |
| `1H`     |   32 |              0.90 |
| `2L`     |   40 |              1.00 |
| `2`      |   50 |              1.15 |
| `2H`     |   60 |              1.30 |
| `3L`     |   70 |              1.50 |
| `3`      |   82 |              1.75 |
| `3H`     |   95 |              2.00 |

### 5.3 Moves

- Every combat-ready Character has three Move definitions.
- A Move is flavour, one player-readable primary tactical category, audiovisual
  references, a timing model, targeting, and an ordered list of reusable
  effects. Category is authored content rather than inferred from effects, so
  unusual hybrid Moves still make one deliberate promise to the player.
- Minimum effects are damage, healing, stun, attack, defence, Evasion, and
  Fortune modification, damage-over-time, healing-over-time, lifesteal,
  Charge gain/drain, timed Charge-rate modification, cleanse, consumable
  shields, switch lock, timed reflection, counter-on-dodge, multi-hit,
  stackable next-damaging-Move Power, undodgeable and shield-piercing damage,
  and charge-up.
- Targets are separate from effect types: self, active ally, all allies, active enemy, or all enemies.
- A Move may contain multiple effects. The engine resolves them in declared order.
- Attached effects may declare `requiresHit`; those effects are skipped when
  the relevant damage was dodged. Enemy-targeted follow-ups require that
  specific enemy to have been hit; self- and ally-targeted follow-ups require
  any earlier hit in the Move. Content authors choose this explicitly rather
  than relying on effect order to imply it.
- Damage effects may explicitly be undodgeable, pierce shields, or return a
  declared fraction of damage actually dealt as health. These properties remain
  reusable Move data rather than character-specific rules.
- Next-Move Power is a consumable status rather than a timed attack buff.
  Repeated applications stack. The complete stack applies to every hit in the
  next damaging Move and is consumed once that Move's ordered effects finish,
  even if its damage is dodged.
- A shield is a timed pool. Incoming non-piercing damage consumes the oldest
  active pool before health; a depleted pool is removed immediately.
- Reflection returns an authored fraction of post-shield health damage. An
  ordinary timed reflector must survive the triggering hit. Counter-on-dodge
  stores authored response damage and may declare a limited number of triggers.
- Reaction eligibility is captured when the dodge or damage occurs, and a
  limited trigger is spent immediately. Responses wait in deterministic FIFO
  order until every hit and ordered effect in the triggering Move has
  completed. A later effect cannot react retroactively to an earlier hit.
- Reaction damage is terminal for reflection and counter triggers: it may
  interrupt or defeat its target, but it cannot create reflection ping-pong or
  another dodge counter. Defeats are emitted once after the reaction queue
  drains, then both sides select a living active Character.
- Predicted non-random base output is visible before selection. Critical hits, dodge, and variance can change the final result.
- A damaging Move's seal shows its current predicted attack points, not merely
  its Charge cost. Stackable Power raises every applicable attack number
  immediately; attack reductions lower those numbers immediately. The seal
  keeps the exact Charge cost alongside the changing attack value, and marks
  the direction and size of an active increase or reduction without relying on
  colour. Neutral attack points remain still; increased and reduced points use
  visually distinct rings, `+N` or `−N` labels, and reduced-motion-safe static
  treatments.

Resolution order:

```text
validate → lock target → spend Charge → start/charge → resolve hits
→ apply ordered effects → reactions/passives → defeats → semantic events
```

### 5.4 Charge-up and interruption

- Some Moves fire instantly. Others require an uninterrupted charge duration after spending Charge.
- Damage or stun interrupts a charging Character by default.
- Dodge avoids the hit and therefore does not interrupt.
- A Modification or effect may grant interruption resistance.
- Interruption is a data-authored Move timing policy. The current charge-up
  family spends Charge on commitment and refunds none when interrupted. Other
  refund or staged policies may be added only as explicit reusable schema
  values with deterministic tests; they are not inferred from colour or copied
  from an `UNKNOWN EXACT` source observation.
- Starting, resolving, dodging, interrupting, and reacting to a Move creates a
  readable presentation lock. An instant Move receives about 2.1 seconds, a
  charged Move's impact about 1.8 seconds, and a defeat about 2.6 seconds,
  extended for additional hits. During that lock the player cannot issue a Move or
  switch, the AI cannot decide, and elapsed time, Charge, statuses, and pending
  Moves do not advance. Automatic outcomes already decided by the deterministic
  transition—such as dodge, critical, status, damage, or defeat—play out before
  control returns.
- The arena names the acting Character and Move and explicitly states that the
  battle is paused while it resolves. Readability is part of the combat rule,
  not optional decorative timing.
- The opponent's normal reaction delay restarts after presentation releases. It
  cannot spend the hidden pause preparing a command and act on the first active
  frame. Baseline decision windows are 1.8 seconds on Easy, 1.4 seconds on
  Normal, 0.9 seconds on Hard, and 0.6 seconds on Brutal.
- Health, both Charge Strips, and every deployed Lineup portrait remain
  full-strength and readable throughout a Move presentation. The latest damage,
  healing, status, or defeat outcome remains as a compact visible receipt after
  the cut-in clears.
- Each active Character's Health and its team's Charge Strip form one combat
  console: opponent information is grouped across the upper field and player
  information is grouped across the lower Move-and-Charge field. The player
  never has to look at a separate arena corner to compare their Health and
  Charge.
- Periodic damage and regeneration ticks update health and semantic output
  with a compact non-blocking arena float instead of creating another
  attack-presentation lock. A defeat caused by a periodic tick still receives
  the normal defeat presentation.

### 5.5 Switching

- Switching is immediate and free unless a status or scenario prevents it.
- A stunned or switch-locked active Character cannot switch.
- Stun also pauses that side's shared Charge fill until the active Character
  recovers.
- Switching cannot dodge an already committed Move; its target or target set is
  captured when the Move commits. A defeated single target causes the Move to
  fizzle unless the Move explicitly defines another retarget policy.
- Individual health and statuses remain on benched Characters. Every deployed
  Character stays visible at the edge of the arena with numeric Health and a
  small Health track, including during Move presentation.
- Every Lineup ticket also exposes an `Attacks` disclosure. Its closed label
  summarises all three upgrade tiers; opening or hovering it shows each attack
  name, Charge cost, and `Normal`, `Tier 1`, or `Tier 2` label without replacing
  the persistent portrait or Health.
- Status durations continue to tick while benched.
- A status remains effective through the complete simulation slice in which its
  timer reaches zero, then expires. This prevents a one-second stun or
  Charge-rate effect from losing the final fixed step of its authored duration.
- Benched Characters do not regenerate unless an explicit effect allows it.

### 5.6 Team Accessories

- Each side may bring one team Accessory in addition to its three Moves per
  Character.
- An Accessory has its own 0–100 charge state. Spending the normal Charge Strip
  never spends Accessory charge.
- Starting a Move adds Accessory charge based on that Move's Charge cost.
- At 100, the Accessory may be activated while the side is otherwise able to
  act. Activation resets only Accessory charge and creates a presentation lock.
- Player and AI use the same Accessory legality and effects.
- The initial catalogue includes an allied Charge burst, opposing Charge-rate
  freeze, whole-team healing, whole-team shields, and a temporary opposing
  Move-slot block.
- Successful damaging Moves use a separate seeded drop stream and may create
  one of three seven-second battle pickups for the acting side: Battery adds 28
  Accessory charge, Repair restores 16 Health to the active Character, and
  Surge adds 18 normal Charge. At most two pickups per side may coexist.
- Drops are semantic buttons for a local player and legal deterministic commands
  for AI. They expire during simulation time, pause with presentation, and never
  require Phaser hit testing.
- Accessories do not use passive cooldowns: combat participation and Battery
  pickups are their charge sources.

### 5.7 Core calculations

Combat is seeded. The same initial state, seed, time steps, and decisions must produce the same report.

Initial damage model:

```text
nominal = movePower × slotMultiplier
growth = 1 + (level - 1) × 0.035
power = 1 + allocatedPower × 0.035
temporary = attackMultiplier × targetDefenceMultiplier
type = 1.25 advantage | 0.80 disadvantage | 1 neutral
tier = 1.00 stock | 1.16 gold | 1.34 platinum
variance = seeded 0.94…1.06
critical = 1.55 when triggered
final = max(1, round(nominal × growth × power × temporary × type × tier × variance × critical))
```

Team-damage and team-healing Moves distribute their authored pool across living targets, preserving roughly the same total value as a stronger single-target Move.

Dodge normally prevents an entire hit. Multi-hit Moves roll dodge and critical independently per hit.

Randomness stays bounded, seeded, and reportable. The result explanation names
critical hits and dodges when they occurred and explicitly says when neither
decided the fight. It also names the decisive Move, leading damage sources,
Type edge, and recorded player Move/switch choices. It never invents a cause
that the Battle Report cannot support.

## 6. Combat Types and Team Traits

Combat Type controls only matchup effectiveness. The six-Type wheel is:

```text
Brawler → Beast → Oddball → Arcane → Sharpshooter → Tech → Brawler
```

An arrow means “strong against.” The mnemonic is: training controls a Beast;
instinct catches an Oddball; nonsense disrupts Arcane; tricks outwit a
Sharpshooter; range disables Tech; and Tech keeps a Brawler out. This is the
functional reference-game class cycle with original product-facing labels:
Brawler maps to Martial Arts, Beast to Beast, Oddball to Cute, Arcane to Dark
Arts, Sharpshooter to Super, and Tech to Tech. A Type is weak to the Type
pointing at it. Typeless Characters are uncommon and ignore the wheel. Moves
inherit the acting Character’s Type and never carry a separate Type.

Team Traits are independent from Combat Types. A Character has zero, one, or
two Traits from Hero, Villain, Monster, Mythic, Historic, and Icon. Every
fractional point contributes continuously:

| Trait    | Bonus per Trait point                           |
| -------- | ----------------------------------------------- |
| Hero     | +3 maximum Health to each selected Character    |
| Villain  | +1 effective Power to each selected Character   |
| Monster  | 2.5% team damage resistance                     |
| Mythic   | +4% team Charge speed                           |
| Historic | +5 opening Charge, capped at +20                |
| Icon     | +2 effective Fortune to each selected Character |

Trait scoring is deterministic:

- A single-Trait Character contributes `1` to that Trait.
- A dual-Trait Character contributes `0.5` to each Trait.
- Fractional scores produce fractional bonuses rather than waiting for a hidden
  activation threshold.
- A Character never contributes more than `1` total Trait point.

Exact duplicate Characters are allowed. A three-copy “Echo Lineup” gains 8%
faster Charge fill as a separate authored synergy.

V2 also includes data-authored named Character combinations. Their exact bonus
and conflict-priority grammar remains a recorded research row until it can be
implemented without weakening the six independent Team Traits or inventing an
unsupported source constant. A named combination must always show its members,
activation requirement, exact effect, and priority behaviour before battle.

All synergies are shown before battle and never rely on colour alone.

## 7. Character progression

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
- Only Characters selected for the fight share the full battle XP pool. Owned
  reserve members of a Tournament Roster share a separate support pool equal to
  20% of that battle XP.
- Defeated participants receive XP.
- Smaller Lineups split the same fight XP across fewer Characters.

### 7.3 Move tiers

- Every owned Character copy owns its own Move tiers.
- Tiers are Stock, Gold, and Platinum.
- Tier multipliers improve every applicable numeric Move effect, including
  damage, healing, periodic effects, shields, Charge changes, timed Charge-rate
  effects, buff/debuff magnitude, switch locks, and stun duration. Cleanse and
  boolean hit properties remain binary.
- A Move may declare cumulative Tier 1 or Tier 2 binary properties in data.
  This is used when the defining upgrade is qualitative, such as making a
  returning-weapon hit undodgeable. The ordinary numeric multiplier still
  applies, and a property unlocked at Tier 1 remains active at Tier 2.
- Reordering and upgrading unlock at level 10.
- Upgrades never make a Move worse, are previewed exactly, and are permanent for that owned copy.
- Advancing one Move by one tier consumes one explicitly selected duplicate of
  the same Character. This is the launch adaptation of the reference game's
  figure-fed enhancement system: it keeps duplicate collecting meaningful
  without inventing an invisible enhancement currency.
- Stat allocation, Move order, Move enhancement, and Modifications are edited
  from Collection. All build editing is locked while either Story or standalone
  Tournament Roster is active.

### 7.4 Modifications

- One Modification slot per Character, unlocked at level 5.
- Modifications are reusable, freely removable outside tournaments, and can be
  equipped by only one owned Character at a time.
- Some Modifications are Combat-Type-restricted.
- Modifications do not level or expire. Existing `patch.*` stable IDs and
  internal types remain migration-compatible until a schema migration is
  warranted.

Initial Modifications:

- **Hot Start** — add 18 opening Charge to the shared Strip.
- **No Flinch** — 50% seeded chance for a charge-up Move to resist interruption.
- **Power Band** — +3 effective Power.
- **Lucky Charm** — +4 effective Fortune.

## 8. Economy, store, and rewards

- Stamps have no cap.
- Wins grant XP and Stamps; losses grant 30% of base XP and objective-appropriate mission progress.
- First clear adds an authored bonus.
- Easy and Normal grant identical rewards. Hard and Brutal do not multiply progression; their reward is challenge, optional commentary, and records.
- Repeat clears normally keep full base rewards.
- Store inventory rotates deterministically, supports specials, and is gated by story/tournament/mission progress.
- Favourited revealed Characters remain findable even when the featured
  rotation changes.
- Locked stock is hidden or shown as a silhouette until revealed.
- Owned Characters and Modifications can be sold for their current full listed
  value in the prototype.
- Deterministic local rotation is the V2 rule until measured evidence supports
  another honest local-first schedule. Device-clock manipulation must not create
  false scarcity or remove paid-for value.
- Purchased Characters are usually level 2–10; specific offers declare the
  level.
- Duplicates are allowed and keep independent levels, tiers, allocations, and
  Modifications.

## 9. Missions

Requirements are generic content blocks evaluated from semantic game reports.

Initial missions:

- **Unexpected Company** — own two distinct Characters.
- **History Settled** — defeat Ned Kelly once.
- **Run It Back** — win the two authored First Run Story fights.

Mission progress can count on a loss when the objective describes an action actually completed, such as dealing damage. Win objectives never count on a loss.

## 10. Initial story: “First Run”

| Node | Type       | Title                  | Purpose                                                |
| ---- | ---------- | ---------------------- | ------------------------------------------------------ |
| `00` | dialogue   | Wrong Door             | Introduce the impossible invitation                    |
| `01` | reward     | Axe First              | Lend and then grant Viking                             |
| `02` | battle     | History Disagrees      | Tutorial fight against Ned Kelly                       |
| `03` | store      | Lost Property          | Reveal rotating stock and equipment                    |
| `04` | mission    | Side Quests Happened   | Unlock the three initial missions                      |
| `05` | battle     | Open Source Backup     | Teach two-Character shared Charge                      |
| `06` | tournament | The Wrong Door Cup     | Three-round launch-roster tournament                   |
| `07` | reward     | This Explained Nothing | Completion check, currency, rival reveal, ending panel |

First Run completes only when all three initial Missions are complete and the
Wrong Door Cup Trophy has been collected. The final reward cannot be claimed
from node position alone. Completion exposes Quick Fight as the open-ended
post-Story sandbox.

## 11. Initial tournament: “The Wrong Door Cup”

1. Fixed fight against Moses.
2. Interstitial: choose one of heal active, heal the Tournament Roster, or start
   the next round with +18 Charge.
3. Fixed fight against Humpty Dumpty and Grim Reaper.
4. Interstitial store or revive offer when applicable.
5. Final against Ned Kelly and Grim Reaper.

The first victory awards the unique **Wrong Door Cup** Trophy, its registered
image, Stamps, XP, and a chance to reveal a rare store offer. The Trophy is
shown permanently on the selected Profile and is required for First Run
completion. Replays remain a progression activity: a completed replay pays its
authored Stamp purse and battle XP again without duplicating the Trophy.

## 12. Presentation

Kinetic Panel Motion uses static rectangular and square art as its animation
grammar:

- two-frame idle swaps;
- panel slides, wipes, stack reveals, and hard cuts;
- short cut-ins for powerful Moves;
- recoil, tilt, scale, hit-stop, flashes, shake, and number pops;
- halftone overlays and authored particles;
- character art never needs to include the opponent;
- status conditions usually use overlays instead of new character renders.

Generated bitmap sources are opaque rectangles or squares with their own baked
background fields. Transparency is not part of the required asset contract.
Rather than pretending these frames are sprites, the renderer presents them as
visible shots: fighter windows, comic panels, reaction inserts, full-field
cut-ins, and collection art. Code may crop or procedurally mask a frame, but the
registered source remains a complete rectangle or square.

Changing or exact information—Health, Charge, timers, costs, type state,
statuses, target state, action names, damage values, countdowns, focus, and
availability—always remains code-native and semantic. It is never baked into
generated artwork.

Battle presentation is split into four explicit effect classes:

- **gameplay-active** owns costs, damage, statuses, legal commands, seeded
  outcomes, and AI;
- **interaction-critical** owns the stable locations, reading order, touch
  geometry, focus, and labels for Health, Charge, Lineups, Moves, readiness,
  Accessory, pickups, timer, Pause, and the fight feed;
- **presentation-active** owns the blocking presentation lock because it
  freezes simulation and changes wall-clock feel even though it cannot change
  deterministic combat state;
- **cosmetic** owns crops, temporary panel arrangements, zooms, wipes, impact
  framing, and other visual choreography that neither moves controls nor
  changes the Battle Report.

Development Settings may expose cosmetic Battle styles for direct comparison.
The launch experiment choices are **Kinetic Print**, a single dominant moving
plate, and **Comic Cutaways**, three staggered lead/action/reaction frames.
Both consume the same semantic events, interaction shell, reduced-motion
preference, and presentation-lock duration. Gameplay experiments remain named
fixed-seed Developer Lab scenarios so they cannot contaminate normal fights or
progression.

The launch roster's implemented bitmap direction is **Saturday-Night Toybox**:
bright cartoon–anime collectible forms, character-dependent proportions, heavy
controlled ink, simple cel shading, large colour masses, and light tactile
texture. Each of the six launch Characters has canonical art, a compatible
two-frame idle pair, a six-reaction sheet, and three opponent-free Move
cut-ins. A responsive six-Character ensemble opens the game, and arena, Story,
and Tournament use matching establishing plates.

The interface still retains parts of the older underground-print structure
while its broader palette and material replacement is completed. The rejected
loftwah/fighter identity and name are not the raster-art target.
`docs/visual-direction-v2.md` defines the accepted bitmap direction and
`DESIGN.md` records the currently implemented combined system.

## 13. Audio

- All eighteen supplied tracks form one inclusive, manually curated pool.
- Main, wandering, battle, character-theme, and general roles influence seeded
  selection weights; they are not exclusive playlists. Every track remains
  eligible in every context.
- The main theme is favoured on global screens, `Wandering Around` is favoured
  between fights, and the three short battle tracks are favoured in combat.
- A Character theme receives an additional battle weight when that Character
  is in either Lineup. It is a lucky presentation moment, not a guaranteed
  override.
- Selection uses an explicit seed and avoids immediately repeating the current
  track. A selected track loops until the application changes music context.
- Characters, stories, tournaments, battles, and menu surfaces reference tracks
  by stable ID rather than filenames.
- The player can replace associations, choose music in sandbox modes, mute music, and set volume.
- Music, SFX, and dialogue settings are independent.
- Music playback intent persists separately from volume/mute state. A player who
  stops music is never opted back in by navigation, battle entry, or reload.
- Dialogue and SFX are silent logical placeholders in this stage.
- Future dialogue is subtitled and normally overlaps presentation without pausing combat.

## 14. Profiles, saves, and accessibility

- The prototype supports three local Player profiles. Slot-shaped storage is
  an implementation detail; the player manages identity and progression from
  Profile, not Settings.
- Autosave after battles, purchases, upgrades, and story progress.
- Preferences are separate from progression and survive progression wipes.
- Settings owns accessibility, audio, difficulty, and local-data management.
  Development builds add explicitly classified local presentation experiments;
  these are not progression settings or combat-rule switches.
- Save export/import is deferred until the schema stabilises.
- Quick Fight history is profile-owned and additively migrated with zeroed
  counts for older compatible V2 saves.
- Reduced motion, keyboard navigation, touch targets, subtitles, volume
  categories, readable contrast, and redundant Type/Trait/status labels are
  required.

## 15. V2 release baseline

`docs/v2-release-spec.md` owns the complete release contract. V2 proves:

- story node to squad confirmation to playable battle to reward;
- the accepted six-Character launch roster with three Moves each;
- one-to-three-character data structures and switching;
- two Charge Strips, Type effectiveness, Trait bonuses, seeded
  damage/crit/dodge, basic statuses, charge-up interruption, AI, timer,
  win/loss, retry, and four difficulties;
- currency, XP, first-clear reward, a tiny store, collection, missions, and local saves;
- hybrid Phaser art renderer plus semantic DOM controls;
- real generated art, existing music, and silent SFX/dialogue fallbacks;
- content validation and automated domain tests.

The six launch kits are calibrated against one proven role from each source
class, as recorded in `docs/launch-roster-calibration.md`. Viking is the
default forgiving leader benchmark: **Battle Boast** banks stackable
next-attack Power, **Axe First** is an instant returning-weapon attack whose
Tier 1 enhancement is undodgeable, and **Berserker Oath** is the strongest
default attack with secondary Stun and a longer enhanced stun. These original
labels own the shipped content; source labels remain research evidence only.
The remaining five calibration rows are release gates rather than optional
future roster breadth.

It does not include a broad Story or Tournament catalogue, more than the six
launch Characters, produced SFX/dialogue, PWA installation, final balance,
backend, multiplayer, monetisation, mobile packaging, ElevenLabs output, or
open-world systems.

## 16. Explicitly open decisions

- Final product-specific names for Character, Lineup, Move, Modification, and
  currency.
- Final Combat Type and Team Trait numeric balance after playtesting.
- Final orientation preference, while portrait and landscape remain supported.
- Final story-path topology and whether hidden nodes exist.
- Exact named-combination bonus and priority grammar; the capability itself is
  accepted for V2.
- Exact source timing, AI weights, Drop frequency, and Store rotation values
  that remain `UNKNOWN EXACT`; V2 uses measured original baselines.
- Final visual approval and future character/story-specific visual variance.
- The implemented Battle spatial candidate remains subject to owner playtest.
  The revised Main Menu, navigation, and Shared Fight Setup remain separate
  screenshot-led approval batches rather than accepted current production
  layouts.
- Analytics and observability provider, cloud-save design, and account identity.
  Multiplayer rules remain deliberately deferred until V2.4; PWA, account,
  native, and online milestone timing is fixed by `docs/release-roadmap.md`.
