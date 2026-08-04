# End-to-end walkthrough of the game concept

This is the complete design direction that has emerged from the conversation, including the original idea, the systems added later, the technical architecture, the asset pipeline, the intended MVP, and the areas still requiring decisions.

The most important high-level conclusion is:

> This is a collectible squad battler with real-time battle-bar combat, character progression, a store, missions, tournaments, multiple story campaigns, and a distinctive static-image presentation built around animated rectangular and square panels.

It deliberately borrows some of the appealing structural ideas from the reference series, especially the battle bar, three-action characters, figure collection, upgrades, types, shops, tournaments and mod-style customisation. It deliberately removes open-world walking and exploration. The supplied reference-game breakdown is useful as system inspiration, but its cities, roaming NPCs, scavenging, day/night exploration and physical traversal are not part of this game.

The earlier imported discussion also established that the visual limitation should become the game’s intentional style: static rectangular artwork, image swaps, zooms, slides, shake, hit-stop, flashes, sound and two-frame character motion instead of conventional animation. 

---

# 1. The original problem

The original starting point was that conventional game animation felt like a major barrier.

You had already worked out a battle concept, but you did not want to become an animator or depend on large traditional sprite sets. You were considering:

* static character images
* attack images
* hurt images
* stunned images
* victory and defeat images
* sliding and zooming
* screen movement
* sound effects
* programmed impact effects
* rectangular blocks rather than transparent cut-out sprites

You also wanted a progression structure that did not require a fully explorable world.

A Candy Crush-style level path was initially considered because it is easy to understand and easy to extend, but you correctly identified the risks:

* it can become mechanically linear
* it can imply endless progression
* difficulty can rise until the game stops being enjoyable
* the story can become secondary to level inflation
* it does not naturally create a sense of place or purpose unless designed carefully

The design later evolved into something stronger:

> Use a level or chapter path as a delivery mechanism, but allow each node to contain any kind of authored content, not just another battle.

That removes the need for a walkable map without reducing the game to a meaningless sequence of fights.

---

# 2. The game’s current identity

The game is not yet named.

The agent working on the project should be allowed to invent:

* possible names
* a recommended working title
* terminology for the collectible characters
* terminology for squads
* terminology for character types
* terminology for mod chips
* terminology for actions
* terminology for upgrades
* terminology for the currency
* terminology for the rectangular animation style
* factions
* rivalries
* initial characters
* initial missions
* an initial tournament
* the tone of the world

The creative work should be treated as proposed until approved, but it should be strong enough to use immediately.

The world can be:

* funny
* stylish
* dramatic
* strange
* irreverent
* anime-inspired
* toy-like
* figurine-based
* self-aware
* serious in some moments and absurd in others

The initial characters should not be called generic things such as:

* Hero
* Enemy
* Fighter 1
* Attack 1
* Currency

The project needs a unique brand rather than looking like a generic implementation of another game’s mechanics.

---

# 3. The core player fantasy

The player owns and builds a collection of combat characters that behave somewhat like collectible figurines, units or pieces.

The player:

* obtains characters
* chooses a squad
* improves characters
* allocates their stats
* upgrades their three actions
* equips modifications
* exploits type strengths
* creates squad synergies
* fights increasingly strong opponents
* completes missions
* enters tournaments
* progresses through stories
* revisits older fights while much stronger
* experiments in Quick Fight and other modes

The emotional loop is important:

```text
Meet a difficult opponent
→ lose or barely survive
→ earn money and XP elsewhere
→ improve characters
→ adjust the squad and loadout
→ return stronger
→ dominate the old opponent
```

The game should intentionally allow the player to become overpowered.

Older fights should not scale endlessly to match the player.

The feeling of returning and crushing something that was previously difficult is part of the reward.

---

# 4. The full core loop

The current overall loop is:

```text
Choose or continue a story, tournament, challenge or quick fight
→ assemble a squad of 1 to 3 characters
→ choose builds, action upgrades and modifications
→ fight
→ win or lose
→ receive XP, currency and mission progress
→ level characters
→ upgrade actions
→ modify stat allocations
→ buy or unlock characters
→ unlock more fights, missions, stories and tournaments
→ repeat
```

The most compact form is:

```text
Fight
→ earn
→ upgrade
→ collect
→ unlock
→ fight again
```

This loop is supported by several independent systems:

* combat
* character collection
* character progression
* action upgrades
* stat allocation
* modifications
* squad synergy
* character-type effectiveness
* economy
* store
* missions
* tournaments
* stories
* quick fight
* challenge content
* presentation
* asset generation

---

# 5. No open-world exploration

This is now a firm exclusion.

The game does not need:

* walking around towns
* freely controlled map avatars
* physical navigation between shops
* environmental scavenging
* roaming NPCs
* tile maps
* collision
* pathfinding
* navigation meshes
* day/night walking
* weather-based exploration
* fast travel
* explorable hub cities
* manually finding quests in a physical environment

Those systems were part of the reference game inspiration, but they are not part of this project.

Anything normally delivered through exploration is converted into structured authored content.

| Exploration concept      | Replacement in this game                       |
| ------------------------ | ---------------------------------------------- |
| Walking to a shop        | Store node or permanent store menu             |
| Meeting an NPC           | Dialogue or character encounter                |
| Finding a quest          | Mission unlock node                            |
| Reaching another city    | Chapter transition                             |
| Discovering a tournament | Tournament unlock                              |
| Finding a character      | Story reward, shop unlock or mission reward    |
| Entering a landmark      | Static illustrated scene                       |
| Side quest               | Separate story or mission chain                |
| Day/night encounter      | Event condition or story condition             |
| Searching objects        | Reward node, mission objective or store system |

The campaign should feel like moving through an interactive anime, illustrated serial or graphic novel rather than walking across a physical map.

---

# 6. Story structure

Story Mode is a sequence of numbered or identified nodes.

A story can contain:

```text
00
01
02
03
...
n
```

There is no fixed upper limit.

The numbering is organisational. It does not mean every node is a fight.

A story node may be:

* battle
* dialogue
* narration
* static cut-scene
* multi-panel scene
* character encounter
* mission assignment
* mission resolution
* shop
* reward
* character unlock
* tournament
* tournament round
* tournament final
* tutorial
* choice
* branch
* media
* chapter transition
* ending
* optional side node
* challenge
* replay node

Example:

```text
00 Opening image sequence
01 Dialogue
02 Tutorial battle
03 Reward
04 Store opens
05 Character encounter
06 Mission assigned
07 Optional fight
08 Story fight
09 Choice
10 Tournament round one
11 Tournament round two
12 Tournament final
13 Character unlock
14 Closing scene
```

The visible interface could look like:

* a level path
* chapter cards
* a scrolling story board
* episode panels
* branching nodes
* a stylised timeline
* stacked rectangular scenes

It may borrow the clarity of Candy Crush’s progression map while using its own branding and allowing different node types.

The important rules are:

* not every node is combat
* stories may branch
* stories may contain optional content
* stories may have an ending
* stories can be replayed
* new stories can be added later
* additional content should come from authored stories and events rather than infinite stat escalation

---

# 7. Multiple stories

The game can support any number of story definitions.

Examples:

```text
Main Story
Character Story
Revenge Story
Tournament Arc
Seasonal Event
Side Story
Tutorial Campaign
Villain Campaign
Alternate Timeline
Comedy Episode
Challenge Story
```

Possible content structure:

```text
content/stories/
├── main/
├── first-rival/
├── vengeance-arc/
├── starter-tournament/
├── event-halloween/
└── character-origin/
```

Each story should define:

* stable ID
* display name
* summary
* cover artwork
* initial node
* node graph
* unlock conditions
* completion conditions
* rewards
* replay rules
* default difficulty
* associated music
* status
* whether it is permanent or event-limited

This allows the game to expand without changing the engine.

---

# 8. Game modes

The same combat engine and character data support several game modes.

## 8.1 Story Mode

The authored campaign experience.

It can include:

* fights
* dialogue
* choices
* shops
* missions
* character unlocks
* tournaments
* cut-scenes
* static media
* side branches
* optional challenges
* endings

## 8.2 Quick Fight

A flexible battle setup mode.

The player may choose:

* squad
* opponent
* difficulty
* arena
* music
* character levels
* action tiers
* modifications
* rule modifiers
* presentation mode

There may be two forms:

### Collection Quick Fight

Uses only characters the player owns.

### Sandbox Quick Fight

Allows unrestricted access for experimentation, testing and fun.

That distinction has not yet been confirmed, but it is a useful possibility.

## 8.3 Tournament Mode

A structured sequence of battles.

A tournament may include:

* several rounds
* fixed opponents
* random opponents
* authored bracket
* restrictions
* themed arenas
* special rules
* cumulative rewards
* final reward
* optional story scenes
* character requirements
* faction requirements
* difficulty choice

Tournaments use the normal battle and economy modules.

## 8.4 Combat or Challenge Mode

A replayable mode containing:

* curated fights
* generated matchups
* character-specific challenges
* squad restrictions
* unusual battle rules
* daily challenges later
* event fights
* boss fights
* high-difficulty content
* experimental modifiers

## 8.5 Collection and management

Outside combat, the player should have access to:

* character collection
* squad builder
* stat allocation
* saved loadouts
* action upgrades
* modification management
* store
* mission list
* story selection
* tournament selection

---

# 9. Difficulty system

The game should support:

```text
Easy
Normal
Hard
Brutal
```

Normal is the default.

Difficulty is not meant to be a moral judgement or a punishment.

The philosophy is:

## Easy

* strongly favours the player
* supports relaxed play
* supports power fantasy
* still creates the illusion that losing is possible
* gives full normal progression
* is the intended mode for players who enjoy winning and collecting more than struggling

## Normal

* intended default balance
* fair but not punishing
* losses are possible
* reasonable progression speed

## Hard

* more heavily weighted toward opponents
* stronger enemy configurations
* smarter AI or better action choices
* potentially slightly higher rewards

## Brutal

* intentionally hostile
* may require optimised builds
* may assume high-level characters
* may include substantial enemy advantages
* suitable for people who actively want difficulty

Difficulty should be changeable between fights.

A loss should not:

* remove currency
* remove experience
* destroy modifications
* damage characters permanently
* reduce levels
* regress story progress
* consume lives
* lock content
* create long-term consequences

After losing, the player should be able to:

* retry
* lower difficulty
* raise difficulty
* change squad
* reallocate stats
* equip different modifications
* upgrade actions
* play another mode
* grind earlier content
* return overpowered

Easy should not give reduced rewards merely because it is Easy.

A better initial philosophy is:

* Easy: full normal rewards
* Normal: full normal rewards
* Hard: modest reward bonus
* Brutal: somewhat larger reward bonus

The bonuses should not create exclusive progression.

Harder difficulties should not be required to unlock:

* characters
* core story
* essential equipment
* necessary currency
* endings
* normal achievements required for progression

The exact reward multipliers remain balancing decisions.

---

# 10. Combat format

Combat is inspired by a real-time battle bar.

The current intended structure is:

* player squad of 1 to 3 characters
* enemy squad of 1 to 3 characters
* one active character at a time on each side
* three actions per character
* actions associated with battle-bar thresholds or costs
* real-time bar filling
* switching characters
* variable damage and effects
* status conditions
* team-based actions
* squad synergy
* type effectiveness

The game may eventually resemble a 3v3 active-time system, but the MVP can begin with simpler battles while preserving the architecture for squads.

The likely battle view contains:

* player active character
* enemy active character
* player squad cards
* enemy squad indicators
* health
* battle bar
* three actions
* statuses
* countdown or charging indicators
* current bonuses
* type matchup
* synergy indicator
* music and effects

---

# 11. The battle bar

The battle bar is a central real-time resource.

It fills dynamically.

Actions consume different amounts or become available at different thresholds.

The exact implementation is not fully finalised, but the intended concept is:

* low-cost action
* medium-cost action
* high-cost action

These may correspond to three slots.

The bar can support:

* normal filling
* speed increases
* speed decreases
* bar gain
* bar drain
* freeze
* interruption
* charge-up moves
* persistent bar across character switching
* special event modifiers
* equipment or modification effects

The bar should be visually dynamic.

Phaser can support:

* smooth fill animation
* glow when thresholds are reached
* pulsing action availability
* countdown overlays
* freeze effects
* bar drain animation
* colour changes
* shaking
* segmented regions
* current marker
* charge timers

The exact rules around whether player and enemy use:

* one shared global bar
* one bar per team
* one bar per side
* separate bars per fighter

still require confirmation.

The conversation leaned toward a reference-game-style persistent team bar, but this should be explicitly confirmed before implementation.

---

# 12. Character switching

A squad may contain one, two or three characters.

The likely combat model is:

* one active fighter
* remaining squad members are available to switch
* switching is immediate or nearly immediate
* battle resource may remain when switching
* statuses may remain on individual characters
* health is individual
* squad-wide effects remain with the squad
* defeat removes or disables a character
* battle ends when all required opposing fighters are defeated

Questions remain about:

* whether switching has a cooldown
* whether switching can happen during an enemy action
* whether switching can avoid damage
* whether the bar persists across switching
* whether active statuses continue while benched
* whether benched characters regenerate
* whether actions can target benched characters
* whether team attacks affect all three regardless of active state

---

# 13. Actions are Lego blocks

This is one of the strongest architectural decisions.

Every character can have unique:

* action names
* artwork
* sounds
* dialogue
* visual effects
* flavour
* presentation

But mechanically, actions are assembled from a limited vocabulary.

Two visually unrelated actions can be mechanically identical.

Example:

```text
Bone Rattle
Solar Break
Dumpster Meteor
Corporate Restructure
```

All four might mechanically mean:

```text
Deal medium single-target damage
Apply a temporary defence reduction
```

This allows a large roster without requiring new programming for every action.

---

# 14. Core effect primitives

The initial effect vocabulary may include:

* damage
* healing
* stun
* attack increase
* attack reduction
* defence increase
* defence reduction
* battle-bar gain
* battle-bar drain
* battle-bar freeze
* battle-bar speed increase
* battle-bar speed reduction
* shield
* cleanse
* remove positive effect
* damage over time
* healing over time
* dodge increase
* dodge reduction
* critical increase
* critical reduction
* status resistance
* status vulnerability
* multi-hit
* charge
* interrupt
* conditional effect

Not all need to be in the first build.

The minimum MVP set could be:

* damage
* healing
* stun
* attack modification
* defence modification
* bar gain or drain
* shield or dodge

The system should be extensible.

---

# 15. Targeting

Effect type and target type should be separate.

Targeting options may include:

* self
* active ally
* single ally
* all allies
* active enemy
* single enemy
* all enemies
* random enemy
* lowest-health ally
* highest-health enemy
* benched ally
* defeated ally later
* entire squad

The initial minimum can remain:

```text
self
single ally
all allies
single enemy
all enemies
```

This allows combinations such as:

```yaml
type: damage
target: allEnemies
```

or:

```yaml
type: heal
target: allAllies
```

or:

```yaml
type: modifyDefence
target: self
```

---

# 16. Multi-effect actions

An action can contain several effect blocks.

Example:

```yaml
id: action.rattle-smash
effects:
  - type: damage
    target: singleEnemy
    power: 24

  - type: modifyDefence
    target: singleEnemy
    magnitude: -2
    duration: 2
```

Another action could:

* damage
* heal the user
* lower enemy speed
* add bar points
* apply stun chance

The engine executes effects in a defined order.

The order matters and should be explicit.

For example:

```text
spend resource
→ play action start
→ resolve hit
→ resolve damage
→ apply statuses
→ trigger passive reactions
→ check defeats
→ produce battle events
```

---

# 17. Actions do not use fixed final amounts

This was corrected during the discussion.

An action does not simply say:

```text
Deal 20 damage
```

It says something closer to:

```text
Damage effect with power 20
```

The final result is calculated.

Potential factors include:

* action power
* action tier
* character level
* allocated Power stat
* target Health or Defence
* type advantage
* squad synergy
* temporary attack buff
* temporary defence debuff
* critical result
* random variance
* difficulty
* mission modifier
* tournament modifier
* event modifier
* modification chip
* passive effect
* low-health condition
* combo or charge state
* target resistance

The result may be below, equal to or above the action’s nominal power.

The same principle applies to:

* healing
* bar gain
* bar drain
* shields
* status probability
* stun duration
* damage over time

---

# 18. Deterministic randomness

Randomness should be seeded.

The same:

* starting state
* seed
* action sequence

should produce the same result.

This helps with:

* automated tests
* battle replays
* debugging
* issue reproduction
* future online synchronisation
* comparing balance changes
* validating AI decisions
* preventing hidden inconsistent behaviour

Randomness can affect:

* damage variance
* critical hits
* dodge
* status chance
* target choice
* AI choices
* reward variation
* special drops later

---

# 19. Action upgrade tiers

Each character has three actions.

Each action has three upgrade states:

```text
Base
Upgraded
Max
```

These were previously described as:

```text
none
upgraded
max
```

The exact display terminology can be branded later.

An upgrade can change:

* power
* scaling
* effect chance
* duration
* hit count
* target count
* bar cost
* charge duration
* secondary effect
* condition
* critical behaviour
* team coverage
* interruption resistance
* animation or presentation intensity

Examples:

## Direct attack

```text
Base:
Medium damage

Upgraded:
Higher damage

Max:
Higher damage plus defence reduction
```

## Heal

```text
Base:
Heal one ally

Upgraded:
More healing

Max:
Heal all allies or cleanse a status
```

## Stun action

```text
Base:
Low stun chance

Upgraded:
Higher chance

Max:
Higher chance plus bar drain
```

This means upgrades are not merely numerical.

---

# 20. Character progression layers

Character progression should remain divided into distinct systems.

## 20.1 Character level

Characters earn XP through fights.

Level influences general strength.

Possible improvements:

* base health
* base power
* resistance
* stat-point allowance
* access to modification slots
* action scaling
* unlock thresholds

The exact level cap is not decided.

The the reference series reference had a level 20 cap, but this project should not assume that exact number.

## 20.2 Allocated stats

Players can distribute build points.

The discussed categories were approximately:

* Power
* Dodge or Evasion
* Luck or Fortune
* Speed or Tempo
* Health or Vitality

Final names should fit the brand.

Their likely functions:

### Power

* increases outgoing damage
* may strengthen offensive status effects
* may strengthen shields or some attacks depending on scaling

### Evasion

* increases dodge chance
* may improve avoidance actions
* may reduce incoming targeted-hit probability

### Fortune

* increases critical chance
* improves probability-based effects
* may influence favourable damage variance
* may influence special reward chances later

### Tempo

* increases battle-bar fill
* reduces recovery
* may improve charge-up time
* may affect initiative

### Vitality

* increases maximum HP
* may improve healing received
* may improve resistance or survivability

Defence has not been fully resolved.

Options include:

* separate sixth stat
* derived from Vitality
* provided only by actions and modifications
* hidden defence value in character base data

## 20.3 Action upgrades

Each of three actions progresses independently through three tiers.

## 20.4 Modifications

One or more equipped modifications alter statistics or rules.

## 20.5 Squad synergy

Matching character types create squad bonuses.

## 20.6 Temporary battle effects

Buffs, debuffs, shields and statuses apply only in battle.

These layers should not collapse into one generic power score.

---

# 21. Saved loadouts

Players should be able to experiment with stat allocations and save configurations.

Possible loadouts:

* Balanced
* Glass Cannon
* Fast Control
* Tank
* Dodge Build
* Lucky Build
* Support
* Boss Killer

Respeccing should be:

* free
* very cheap
* or otherwise accessible

The game should encourage experimentation.

It should not permanently punish an early allocation mistake.

A saved loadout may contain:

* allocated stats
* selected action tiers if configurable
* equipped modification
* action order if action order becomes customisable
* squad slot
* cosmetic selection
* preferred music or presentation later

---

# 22. Modification system

The game may use mod chips or an original equivalent.

The final terminology should not copy the reference series exactly.

Possible concepts:

* modules
* cores
* patches
* augments
* inserts
* plates
* relics
* chips
* tags
* sigils

For the MVP:

* one slot per character
* deterministic effects
* no random rolls
* no rarity bloat
* no destructive replacement
* easy comparison
* easy swapping
* small manageable inventory

Potential modification effects:

* more maximum health
* more power
* more speed
* more dodge
* more critical chance
* more status chance
* start with battle-bar progress
* resistance to stun
* stronger healing
* trade Power for Speed
* trade Health for Luck
* shield on entry
* bonus when low health
* stronger type advantage
* reduced weakness penalty
* increased squad synergy later

The original reference destroyed the old chip when replacing it. This project does not need that punishment.

---

# 23. Character collection

Characters are bought, earned or unlocked.

The collection is a primary progression hook.

The player should see:

* owned characters
* locked characters
* character silhouettes
* purchase conditions
* story unlocks
* mission unlocks
* tournament rewards
* variants
* groups or factions
* completion progress

Characters may be obtained through:

* store purchase
* story completion
* mission reward
* tournament reward
* event reward
* challenge completion
* starter choice
* character-specific story
* achievement later

The initial store should be deterministic.

No:

* gacha
* loot boxes
* premium currency
* random character pulls
* real-money purchases

The architecture may allow optional monetisation later, but the MVP should not be designed around it.

---

# 24. Duplicates and variants

The MVP may use repeated copies or variants of the same character to prove squad behaviour.

This does not necessarily mean duplicates are a major final system.

There are several possible models:

## Exact duplicates allowed

The player can deploy multiple copies of the same character.

## Variants count as separate characters

Different editions or forms can appear together.

## Duplicates owned but only one deployed

Duplicates could be used for upgrades or collection.

## No permanent duplicate system

The MVP only duplicates a character temporarily because the roster is small.

This requires a final decision.

The current discussion explicitly allows three of the same character during the MVP so squad synergy can be tested.

---

# 25. Squad size

A squad may contain:

```text
Minimum: 1
Maximum: 3
```

The UI and engine should support all three sizes.

A one-character squad should be valid.

A two-character squad should be valid.

A three-character squad should be valid.

Potential reasons to use fewer than three:

* challenge conditions
* story restrictions
* self-imposed challenge
* stronger individual bonuses later
* character availability
* tutorial
* tournament rules

The game should not assume every battle always uses three characters.

---

# 26. Character types

Every character has one primary type.

Types form a circular strength-and-weakness system.

The inspiration used a wheel where each type is:

* strong against one type
* weak against one type
* neutral against the others

The final names must be original.

A hypothetical wheel might be:

```text
Might
→ Wild
→ Charm
→ Occult
→ Valor
→ Machine
→ Might
```

These are only placeholder examples.

The agent should invent approximately six types that fit the game’s actual world.

The data shape could be:

```yaml
types:
  might:
    strongAgainst: wild
    weakAgainst: machine

  wild:
    strongAgainst: charm
    weakAgainst: might
```

The engine should not contain bespoke `if` statements for each type.

It should query the type system.

---

# 27. Type effectiveness

When one character acts against another, the relationship may be:

* strong
* neutral
* weak

Example configurable values:

```text
Strong: 1.25×
Neutral: 1.00×
Weak: 0.80×
```

These values are not final.

Type effectiveness may influence:

* damage
* healing against certain types later
* status chance
* resistance
* bar manipulation
* passive effects

The simplest MVP applies it to damage.

The game should clearly show:

* attacker type
* defender type
* advantage
* disadvantage
* neutral matchup

The player should not need to memorise the entire wheel without help.

Possible presentation:

* type emblem
* arrow
* colour relationship
* strong/weak label
* pre-fight matchup summary
* attack preview
* subtle battle feedback

---

# 28. Squad type synergy

A squad receives a bonus based on the number of characters that share a type.

The confirmed conceptual rule is:

```text
1 matching type member = synergy level 1
2 matching type members = synergy level 2
3 matching type members = synergy level 3
```

The original `+1`, `+2`, `+3` damage or health idea was explicitly a placeholder.

The balancing system should decide what those levels actually mean.

Possible implementation:

```yaml
synergy:
  level1:
    healthPercent: 2

  level2:
    healthPercent: 4
    damagePercent: 2

  level3:
    healthPercent: 6
    damagePercent: 5
```

Or:

```yaml
synergy:
  perMatchingCharacter:
    flatPower: 1
```

Or type-specific bonuses:

```text
Machine synergy:
Bar fills faster

Occult synergy:
Status effects last longer

Wild synergy:
More health

Charm synergy:
More dodge

Might synergy:
More damage

Valor synergy:
More resistance
```

The initial design should probably begin with a universal simple rule and leave type-specific rewards for later.

The UI should show active synergy before battle.

---

# 29. Distinct modifier layers

These systems must remain separate:

1. Base character statistics
2. Player-allocated stats
3. Action power and scaling
4. Action upgrade tier
5. Equipped modification
6. Squad synergy
7. Character-type effectiveness
8. Temporary buffs and debuffs
9. Difficulty modifier
10. Mission or tournament modifier
11. Random variance
12. Critical and dodge results

The calculation should remain inspectable.

The player may not need to see every number, but developers and tests should be able to trace it.

A possible pipeline:

```text
Action power
→ character scaling
→ target mitigation
→ action tier
→ equipment/modification effects
→ temporary buffs/debuffs
→ type effectiveness
→ critical or dodge
→ variance
→ squad synergy
→ difficulty/context
→ caps and floors
→ final result
```

The exact order must be documented because order changes balance.

---

# 30. Economy module

The economy is a separate module from combat.

Combat does not award currency directly.

Combat produces a report.

Example:

```ts
{
  winner: "player",
  difficulty: "normal",
  duration: 82,
  playerTeamPower: 94,
  enemyTeamPower: 112,
  charactersDefeated: ["enemy-a", "enemy-b"],
  damageTaken: 40,
  perfectVictory: false,
  retries: 0,
  missionContext: "story.main.014"
}
```

The economy consumes that report and calculates:

* currency
* XP
* bonuses
* mission progress
* first-clear reward
* tournament reward
* event reward
* unlock progress

This separation allows reward rules to change without touching battle code.

---

# 31. Reward calculation

Rewards should account for challenge.

A fight against stronger competition should pay more.

Possible factors:

* enemy level
* enemy team strength
* player team strength
* difficulty
* fight performance
* victory margin
* characters remaining
* damage taken
* time
* first clear
* tournament round
* mission bonus
* event multiplier
* special condition
* underdog bonus
* repeat-clear reduction if desired

However, the design should avoid encouraging tedious optimisation such as deliberately prolonging fights or taking artificial damage.

A healthy reward model might emphasise:

* opponent strength
* difficulty
* first clear
* mission or tournament context

and use performance only as a modest bonus.

---

# 32. Currency

Initially use one normal in-game currency.

It is:

* earned in game
* spent in game
* not premium
* not bought with real money
* used for character purchases
* used for action upgrades
* potentially used for modifications
* potentially used for respecs if respec is not free
* potentially used for store unlocks or cosmetics later

The currency needs an original in-world name.

The exact economy values remain balancing data.

---

# 33. XP

XP is separate from currency.

XP should:

* come primarily from fighting
* level the characters who participated
* possibly grant smaller XP to benched squad members
* possibly scale with opponent difficulty
* possibly include mission bonuses

Questions remain around:

* whether XP is individual or squad-wide
* whether defeated characters receive XP
* whether unused characters receive passive XP
* whether duplicates can be consumed for XP
* whether there is a level cap
* whether level difference reduces rewards

The current direction favours XP-driven character level rather than buying levels directly.

---

# 34. Store

The store is part of the initial game.

It should support:

* buying characters
* buying action upgrades
* buying modifications
* possibly buying cosmetics later
* viewing locked content
* showing unlock conditions
* story-linked stock
* event stock later
* character-associated presentation and music

The initial store should be predictable.

No random stock is required.

Possible store models:

## Permanent store

Characters become available and remain available.

## Story store nodes

Some story points temporarily open a particular store interface.

## Themed stores

Different stores specialise in different character groups or modifications.

## Event stores

Temporary story or event content adds its own stock.

The store is data-driven.

---

# 35. Missions

Missions are generic data definitions.

They can require:

* own a specific character
* own a number of characters
* own characters of a specific type
* collect a faction
* defeat a specific character
* defeat a number of a type
* win with a specific character
* win with a specific squad
* avenge someone
* defeat an opponent after losing to them
* complete a tournament
* win without a character being defeated
* win on a specified difficulty
* use a particular action
* apply a status
* complete a story node
* purchase a character
* upgrade an action
* equip a modification
* reach a level
* complete a branch
* make a story choice

Mission rewards may include:

* currency
* XP
* character
* modification
* action upgrade
* store unlock
* tournament unlock
* story unlock
* artwork
* cosmetic
* title or badge later

The mission engine should evaluate generic requirement blocks.

No mission-specific hard-coded logic.

---

# 36. Vengeance missions

You specifically mentioned vengeance.

A vengeance mission might be:

```text
Character A was defeated or humiliated by Character B.
Own or deploy Character A.
Defeat Character B.
Receive a special reward or story scene.
```

Possible variations:

* win with the avenged character active
* land the final hit with that character
* defeat the rival without using another type
* complete a rematch on Hard
* unlock the rival after the fight
* unlock a character story branch

This is a strong narrative use of the mission system.

---

# 37. Tournaments

Tournaments are chains of fights.

They can be embedded in Story Mode or selected independently.

A tournament may define:

* number of rounds
* participants
* fixed bracket
* random bracket
* squad restrictions
* type restrictions
* level limits
* difficulty
* rewards
* special presentation
* music
* story scenes
* final boss
* retries
* health reset rules
* modification rules

The initial tournament can be short:

```text
Round 1
Semi-final
Final
```

A tournament does not need a separate combat engine.

It orchestrates normal battles.

---

# 38. Failure and retry

Losing is low consequence.

The intended feeling is:

> It looks like you might lose, and sometimes you do, but the game does not punish you for wanting another attempt.

A defeat can show:

* defeat artwork
* battle summary
* why the enemy was strong
* possible upgrades
* type mismatch
* available missions
* retry button
* squad edit button
* lower difficulty
* go to store
* replay earlier fights

It should not show:

* lost lives
* paid retry
* currency loss
* broken equipment
* permanent injury
* story reset

---

# 39. Visual identity

The game’s visual system is built around blocks.

This is not a compromise.

It is the brand.

The interface can use:

* squares
* wide rectangles
* tall cards
* stacked panels
* split frames
* borders
* diagonal crops
* inset windows
* overlapping image blocks
* animated card movement
* framed character tiles
* tiled story scenes

The agent should invent a name for the presentation language.

Possible generic working terms:

* living panels
* motion blocks
* battle frames
* kinetic cards
* animated panels

The final term should match the game.

---

# 40. What Phaser can animate

Even with static art, Phaser can create substantial motion.

## Character movement

* two-frame bounce
* bobbing
* small scale changes
* tilt
* recoil
* anticipation
* slide-in
* slide-out
* squash and stretch
* selected lift
* defeated fall
* victory bounce

## Camera

* zoom
* pan
* shake
* flash
* fade
* focus shift

## UI

* health bars
* battle bars
* countdown timers
* action availability
* pulsing buttons
* glowing selected state
* reward counters
* animated currency
* mission progress
* tournament bracket reveals

## Combat impact

* hit-stop
* screen shake
* white flash
* colour tint
* image recoil
* number pop
* particle burst
* speed-line overlay
* motion smear
* background swap
* short cut-in
* glow
* vignette
* status icons
* haptic hook for later mobile

## Scene transitions

* panel wipe
* slide
* fold
* fade
* stack
* zoom into image
* image replacement
* comic-page transition
* animated border

This is enough to make the game feel active.

---

# 41. Presentation primitives

Motion should also be data-driven.

Possible primitives:

```text
bob
pulse
glow
slide
zoom
shake
flash
hit-stop
recoil
tilt
fade
tint
particle burst
number pop
panel reveal
wipe
scale
hold
loop
```

An action can reference a presentation definition.

Example:

```yaml
presentation:
  enter: slide-left
  anticipation: pulse-medium
  cutIn: action-panel-wide
  impact:
    - flash-short
    - shake-heavy
    - hit-stop-120ms
  targetReaction: recoil-right
  exit: fade-fast
```

Different actions can reuse the same motion primitives with different artwork.

---

# 42. Two-frame character art

Each state can use two frames.

The likely character states are:

## Required or high priority

* battle idle
* action 1
* action 2
* action 3
* hurt
* dodge
* stunned
* defeat
* victory

## Potentially useful

* map or story token idle
* selected
* switch-in
* charge
* walk
* low-health
* special entrance

Because there is no explorable map, `map idle` may instead be used for:

* story-path token
* collection display
* squad selection
* tournament bracket
* loading or transition

Statuses such as poison, burn and shield should normally use overlays rather than separate character art.

---

# 43. Large rectangular character artwork

In addition to small two-frame states, characters may have larger illustrations.

Potential assets:

* canonical portrait
* store card
* collection tile
* action 1 cut-in
* action 2 cut-in
* action 3 cut-in
* victory panel
* defeat panel
* character introduction
* story reaction
* rivalry image
* event variant
* tournament entrance

These images should generally avoid including the exact opponent.

That avoids needing unique art for every possible matchup.

---

# 44. Image-template catalogue

The project needs formal templates for every image type.

Each template should define:

* stable template ID
* purpose
* aspect ratio
* source dimensions
* runtime dimensions
* safe regions
* cropping rules
* character placement
* visual hierarchy
* border style
* background style
* text rules
* reference-image requirements
* prompt structure
* output folder
* output format
* placeholder equivalent
* approval criteria

## Character templates

* canonical reference
* expression sheet
* portrait
* collection tile
* store card
* idle pair
* action pair
* hurt pair
* dodge pair
* stunned pair
* defeat pair
* victory pair
* action cut-in
* victory panel

## Battle templates

* normal fight background
* boss background
* tournament background
* action panel
* team action panel
* opponent introduction
* victory
* defeat
* reward

## Story templates

* dialogue background
* narration panel
* choice panel
* chapter cover
* story card
* character encounter
* branch
* ending
* event splash

## Store templates

* store background
* stock card
* locked item
* featured character
* modification tile
* currency icon

## Mission templates

* mission card
* mission complete
* mission failed
* revenge mission
* collection mission
* tournament mission

## Event templates

* event cover
* event story card
* event fight background
* event character variant
* event store treatment
* event reward

## Shared UI templates

* type emblem
* squad card
* status icon
* action icon
* currency icon
* tournament badge
* locked silhouette
* placeholder image
* generic impact image

---

# 45. Codex CLI image generation

You have tested image generation through Codex CLI and confirmed it works well.

The repository should treat that as an available production capability.

The image pipeline should support:

* character descriptions
* reference images
* supported aspect ratios
* square images
* rectangular images
* paired states
* consistent prompts
* repeated generation
* predictable paths
* metadata
* contact sheets
* human approval
* replacing failed images

The project should not assume unsupported capabilities.

It should use what has been verified:

* single image generation
* reference-guided generation
* multiple ratios
* square and rectangle output
* prompt-driven style
* repository-controlled workflows

---

# 46. Image-generation workflow

The ideal flow is:

```text
Character definition
→ structured asset request
→ image template selected
→ prompt compiled
→ Codex CLI generates candidate
→ file stored in raw output
→ validation
→ contact sheet
→ human review
→ approved asset copied or marked
→ asset registry updated
```

The pipeline should track:

* asset ID
* character ID
* template ID
* prompt version
* reference assets
* generation time
* candidate number
* output path
* status
* approval
* rejection reason
* replacement history

Approved art should never be overwritten silently.

---

# 47. Placeholder art

Placeholder art is explicitly acceptable.

The game should be able to run with:

* coloured rectangles
* text labels
* generated silhouettes
* generic icons
* temporary gradients
* simple shape compositions
* one character image reused across states
* generic action panels

Placeholder support should be built into the asset registry.

It should not be a temporary hack.

A missing approved asset can resolve to:

```text
specific approved asset
→ character placeholder
→ template placeholder
→ generic placeholder
```

This allows gameplay development before art completion.

---

# 48. ElevenLabs audio

Sound is deferred for now.

The repository should still be designed for future generation using ElevenLabs.

The expected future capabilities are:

* dialogue generation
* text-to-speech
* character voices
* sound effects
* multiple candidates
* direction
* pronunciation
* subtitles
* output conversion
* trimming
* normalisation
* metadata
* approval
* custom replacement

You will create an API key and upgrade the plan when required.

The design phase should not:

* call ElevenLabs
* require a key
* generate audio
* incur usage

It should create:

* integration specification
* example dialogue definitions
* example SFX definitions
* `.env.example`
* future commands
* asset paths
* API safety rules
* cost safeguards

---

# 49. Dialogue

Each character may have:

* battle start
* action line
* hurt
* dodge
* stun
* victory
* defeat
* switch-in
* story dialogue
* rivalry line
* tournament line
* store line
* mission line

Dialogue definitions should include:

* stable ID
* text
* character
* voice ID
* emotion
* energy
* pace
* pronunciation notes
* subtitle
* planned/approved status
* output file

Dialogue is optional in early MVP combat.

---

# 50. Sound effects

Sound effects may include:

* action whoosh
* impact
* heal
* stun
* bar fill
* bar drain
* shield
* dodge
* selection
* purchase
* reward
* character unlock
* tournament transition
* victory
* defeat
* UI panel movement

Custom sounds should be importable without changing code.

A stable logical ID should remain the same even if the file is replaced.

---

# 51. Music

Music now exists as placeholder content.

The repository contains:

```text
music/Can't Tell.mp3
music/Mirrors.mp3
music/No Control.mp3
music/Obsessed.mp3
music/Red Thread.mp3
music/Soft Static Halo.mp3
music/Weather Outside.mp3
```

These should be registered with stable IDs.

For example:

```text
music.cant-tell
music.mirrors
music.no-control
music.obsessed
music.red-thread
music.soft-static-halo
music.weather-outside
```

The system should support:

* menu music
* battle music
* story music
* character-associated music
* tournament music
* location or scene music
* victory music
* defeat music
* fallback music
* looping
* fades
* volume categories
* track replacement

No new Suno work is needed during the design phase.

Suno will later be used manually.

The agent may provide:

* music ideas
* style prompts
* lyrics
* track briefs

but should not attempt to automate the final Suno selection process.

Music is the one asset category expected to remain manually curated.

---

# 52. Character asset references

A character definition should reference:

* images
* dialogue
* sound effects
* music
* actions
* type
* progression
* modifications
* stats
* variants

All references use stable logical IDs.

The character should not directly depend on fragile filenames.

Example concept:

```yaml
id: character.bones

type: type.occult

actions:
  - action.bones.quick
  - action.bones.control
  - action.bones.finisher

visuals:
  portrait: image.bones.portrait
  battleIdle:
    - image.bones.idle.1
    - image.bones.idle.2

audio:
  battleMusic: music.red-thread
  dialogueSet: dialogue.bones
  actionSounds:
    action1: sound.bones.action1
```

---

# 53. Content-driven design

Most of the game should be data.

Data-driven content includes:

* characters
* types
* actions
* action tiers
* effects
* targets
* modifications
* stores
* store items
* missions
* mission requirements
* rewards
* tournaments
* encounters
* stories
* story nodes
* difficulty settings
* music
* sounds
* dialogue
* image templates
* presentation definitions
* events

The engine interprets these definitions.

Adding a character should not require bespoke TypeScript.

Adding a story should not require a new Phaser scene.

Adding a tournament should not require a new combat engine.

---

# 54. Technical stack

The current preferred stack is:

* Node.js 22
* pnpm 11
* mise
* TypeScript
* Vite
* Phaser
* Vitest
* ESLint
* Prettier
* optional Capacitor later

Phaser replaced the earlier Godot suggestion.

The earlier Godot recommendation is now superseded.

The game begins as a desktop web game.

---

# 55. Primary development target

The current target is:

* 16-inch M4 MacBook Pro
* desktop browser
* windowed mode
* full-screen mode
* responsive layout

Mobile comes later.

The first published version may also be desktop web before mobile.

The UI should not be a phone layout stretched across a large display.

It should use:

* responsive framing
* central safe gameplay region
* desktop-friendly information density
* scalable canvas
* controlled cropping
* optional side panels on wide screens
* full-screen presentation
* future mobile adaptation

---

# 56. Future mobile target

The later target is:

* mobile browser
* iPhone
* possible Capacitor packaging
* touch controls
* haptics
* safe areas
* portrait or landscape to be decided

There is an unresolved orientation conflict.

Earlier discussion mentioned portrait mobile.

Later Phaser examples used 16:9 landscape.

The desktop target now comes first.

The GDD should explicitly mark orientation as unresolved rather than accidentally deciding through implementation.

A responsive system might eventually support:

* 16:9 desktop
* wider desktop
* tablet landscape
* mobile landscape
* portrait-specific alternative layout

But that should not be assumed without a decision.

---

# 57. Phaser architecture

The code should be separated into modules.

Likely structure:

```text
src/
├── combat/
├── economy/
├── progression/
├── missions/
├── tournaments/
├── store/
├── stories/
├── content/
├── presentation/
├── audio/
├── game/
└── generated/
```

Core rule:

> Gameplay modules must not import Phaser.

Phaser may use the combat engine.

The combat engine must not know Phaser exists.

This allows:

* headless tests
* deterministic simulation
* alternate renderer
* future platform changes
* AI-generated testing
* clean module boundaries

---

# 58. Combat output events

The combat engine should emit semantic events.

Examples:

```text
battleStarted
characterSwitched
barChanged
actionStarted
actionCharged
actionInterrupted
damageApplied
healingApplied
statusApplied
statusRemoved
characterDodged
characterStunned
characterDefeated
battleWon
battleLost
```

The presentation layer listens and animates.

The audio system listens and plays sound.

The economy only receives the final battle report.

---

# 59. Presentation modes

The game may support multiple renderers.

Possible modes:

```text
placeholder
block-art
two-frame
hybrid
```

## Placeholder

* coloured rectangles
* labels
* simple bars
* no final art dependency

## Block art

* rectangular images
* slides
* cut-ins
* camera motion

## Two-frame

* small character pairs
* bobbing
* frame swaps
* generic effects

## Hybrid

* two-frame battle characters
* large rectangular action cut-ins
* static story panels
* programmed effects

The hybrid model currently appears strongest.

---

# 60. Mise

The project should use `mise.toml`.

Mise manages:

* Node version
* pnpm version
* environment files
* common tasks
* setup
* validation
* tests
* generation commands
* development server
* build

Potential tasks:

```text
mise run install
mise run dev
mise run build
mise run test
mise run typecheck
mise run validate
mise run content:compile
mise run character:new
mise run assets:images
mise run assets:sfx
mise run assets:dialogue
mise run assets:all
mise run check
```

---

# 61. Asset CLI

The repository should have one consistent asset CLI.

Examples:

```text
pnpm assets character create
pnpm assets generate images
pnpm assets generate dialogue
pnpm assets generate sfx
pnpm assets import image
pnpm assets import sound
pnpm assets import music
pnpm assets validate
pnpm assets contact-sheet
```

The CLI should handle:

* IDs
* paths
* validation
* metadata
* format conversion
* approval states
* placeholders
* indexing
* safe overwrite behaviour

---

# 62. Source of truth

This is a critical process change.

The conversation should not remain the project specification.

The hierarchy should be:

1. Game Design Document
2. Supporting technical and content documents
3. Structured schemas and content data
4. Tests
5. Implementation
6. Conversation as historical background only

The GDD is authoritative.

If implementation conflicts with the GDD, the GDD wins until deliberately updated.

A material design change should follow:

```text
Discuss
→ decide
→ update GDD
→ update technical specification
→ update content schemas
→ implement
→ test
```

No permanent game rule should silently originate in code.

---

# 63. Required documentation package

The design phase should produce at least:

```text
docs/
├── game-design-document.md
├── creative-concept.md
├── brand-and-art-direction.md
├── presentation-system.md
├── game-modes.md
├── difficulty-and-failure.md
├── character-builds-and-modifications.md
├── squad-and-affinity-system.md
├── technical-design.md
├── content-authoring.md
├── asset-production.md
├── image-template-catalogue.md
├── mvp-artwork-plan.md
├── balancing.md
├── elevenlabs-integration.md
├── music-integration.md
└── decisions/
```

Potential ADRs:

* Phaser and mobile-web architecture
* pure TypeScript gameplay modules
* content-driven actions
* rectangular visual language
* separate economy module
* repository-managed asset production
* finite authored stories
* no open-world exploration
* seeded randomness
* stable asset IDs

---

# 64. Repository instructions

`AGENTS.md` should tell all agents:

* GDD is authoritative
* chats are background only
* update docs when design changes
* do not silently invent permanent rules
* do not edit generated files
* do not overwrite approved assets
* keep gameplay independent of Phaser
* add tests for gameplay rule changes
* use stable IDs
* preserve module boundaries
* mark assumptions
* document unresolved decisions
* use Australian English
* do not add unnecessary architecture

---

# 65. MVP scope

The MVP should prove the central systems rather than build a large campaign.

A reasonable current MVP is:

## Characters

* one original primary character
* one opponent or rival
* one variant
* ability to form a squad of one to three
* repeated copies or variants allowed for testing

## Actions

* three actions per combat-ready character
* base, upgraded and max tier definitions
* at least damage
* at least healing or stun
* at least one team or resource effect
* variable effect calculation

## Combat

* one-versus-one first if needed
* architecture supports squads
* action bar
* switching
* health
* type effectiveness
* synergy
* basic AI
* victory
* defeat
* retry
* four difficulties

## Economy

* currency
* XP
* reward calculation
* opponent difficulty weighting
* first-clear bonus
* store purchase
* one action upgrade purchase

## Collection

* starter character
* one purchasable character
* locked character display
* collection screen

## Builds

* stat allocation
* one modification slot
* several example modifications
* saved loadout if practical

## Missions

* one collection mission
* one vengeance mission
* one specific-opponent mission

## Tournament

* one short tournament

## Story

* one small story
* mixed node types
* static story scene
* dialogue
* shop
* fight
* tournament
* reward
* ending

## Presentation

* placeholder renderer
* first rectangular art renderer
* two-frame character test
* battle bar
* timers
* glow
* bob
* shake
* cut-in
* reward panel

## Audio

* existing music catalogue
* no generated dialogue yet
* no generated SFX yet
* future ElevenLabs specification

## Art

* placeholder art
* one canonical character
* one portrait
* one idle pair
* three action pairs
* hurt
* dodge
* stun
* defeat
* victory
* one or more rectangular cut-ins
* one battle background
* one story background
* one store card
* one tournament background if practical

---

# 66. Deliverables for the current design and pre-production phase

Before full gameplay implementation, the agent should deliver:

1. Authoritative GDD
2. Creative concept
3. Three game-name options
4. Recommended working title
5. Brand system
6. Initial cast
7. Character types
8. Type wheel
9. Initial actions
10. Initial missions
11. Initial tournament
12. Initial story example
13. Technical design
14. Content-authoring guide
15. Schemas
16. Balancing model
17. Difficulty model
18. Economy design
19. Squad-synergy design
20. Character build design
21. Modification design
22. Presentation primitive design
23. Image-template catalogue
24. MVP art manifest
25. Codex image-generation workflow
26. Placeholder strategy
27. Existing music catalogue
28. Future ElevenLabs plan
29. `AGENTS.md`
30. ADRs
31. `mise.toml`
32. TypeScript/Vite/Phaser/Vitest skeleton
33. Basic responsive boot scene
34. Content validation foundation
35. Prioritised implementation plan

It should not yet build:

* the full campaign
* dozens of characters
* final balance
* mobile packaging
* full final art
* ElevenLabs output
* Suno output
* monetisation
* a backend
* multiplayer
* open-world exploration

---

# 67. What appears firmly decided

These points are now strong decisions:

* Phaser
* TypeScript
* Vite
* Node 22
* pnpm 11
* mise
* desktop-first web target
* mobile later
* no open-world exploration
* story nodes from 00 to n
* multiple stories
* fights, story, choices, shops and tournaments within story sequences
* Quick Fight
* Tournament Mode
* challenge/combat mode
* 1 to 3 characters per squad
* three actions per character
* actions composed from reusable effects
* variable results
* three action upgrade tiers
* currency
* XP
* store
* character collection
* character stat allocation
* modifications
* character types
* circular strengths and weaknesses
* squad-type synergy
* Easy, Normal, Hard, Brutal
* low-consequence failure
* ability to overlevel
* rectangle/square art language
* two-frame character states
* Codex CLI image pipeline
* ElevenLabs later
* music already exists as placeholders
* Suno manual later
* GDD as source of truth

---

# 68. What remains proposed rather than confirmed

These areas still contain proposals:

* the game name
* the world premise
* the exact terminology
* the type names
* the exact number of types
* the exact synergy bonuses
* the exact combat formulas
* the level cap
* whether Defence is a stat
* whether duplicate characters are permanently allowed
* exact action-bar ownership
* exact switching rules
* exact squad XP rules
* exact reward multipliers
* exact store structure
* whether Quick Fight has unrestricted sandbox access
* exact story-path visual
* final desktop aspect ratio
* future mobile orientation
* whether action slots can be reordered
* whether charge-up actions are in MVP
* whether team accessories exist
* whether passive equipment gets one slot or more later
* whether characters have one type only
* whether characters can have secondary types later
* whether healing and defence use the same core stat system
* whether choices meaningfully branch story or mostly change dialogue
* whether losses can trigger alternative scenes
* whether events can expire
* whether user-created stories or content are future goals

---

# Blindspot questions

These are the questions I would want answered before the agent finalises the GDD and begins implementing the combat engine.

They are grouped by importance.

# A. Combat fundamentals

1. **Does each team have its own battle bar, or is there literally one shared bar used by both sides?**

Each team/player has their own battle bar. I can use my actions based on how charged my bar is. It could only possibly be 1 human vs 1 computer, 1 human vs 1 human, 1 computer vs 1 computer. Our game should be able to support all of that right? We want easy, normal, hard and brutal difficulty levels and the AI should be pretty well thought out.

2. **Does switching preserve the current bar value?**

Yes. Switching players does not change the value of the bar. Using actions costs you and actions/powerups can be used against you in ways that will take your bar down or reset it back to zero altogether.

3. **Can the player switch at any time, or only when no action is resolving?**

The player can switch as long as they're not stunned, or there because of an action. An action/powerup/effect could prevent a character from being able to switch (temporarily or something).

4. **Does switching have a cooldown or cost?**

No (unlesss the game mode prevents switching or something).

5. **Can switching avoid an incoming attack?**

No. Switching should only provide an advantage by letting you avoid damage to a character, or to access a better attack for what you have. Switching can be an advantage but not really and not by design. You can use it wisely but it shouldn't allow you to dodge an attack or anything.

6. **Are all three squad members present in the fight but only one active, or are team-wide actions allowed to affect benched characters?**

Yes. All three are present but only one can be active at a time. There are team-wide actions like healing your entire team, stunning their entire team or healing your entire team.

I can

attack one
attack all (damage is distributed)
stun one
stun all
heal one (me)
heal team (heals are distributed)

7. **Does a battle end when all opposing characters are defeated?**

Yes. That or forfeight.

8. **Can a defeated character be revived during battle?**

Not during battle. In a tournament they can be alive or dead during the tournament and they can be revived as part of the tournament. The health carries over between fights in the tournament. If I lose a character I can't select them unless I have a revive. Tournament stages can be either a fight or a shop opportunity or just a reward like health, team health, revive, start next round with more attack points, start next round with other team stunned etc

9. **Do benched characters keep buffs, debuffs and damage-over-time effects ticking?**

Yes. I want to keep this as simple as we can. If I bench a character while they are stunned and bring them back in their time should have still been going down.

10. **Do benched characters regenerate health or battle resources?**

Only if an action or powerup allows them to. The bar generates over time and can either be slow because it is debuffed by the enemy, normal speed, fast (powerup, action, special game mode with fast bar etc)

11. **Can actions target a specific benched enemy, or only the active enemy and whole enemy team?**

As above earlier

I can

attack one
attack all (damage is distributed)
stun one
stun all
heal one (me)
heal team (heals are distributed)

Powerups should come out from time to time (tofu in the reference series) and they either give me

heal one
heal team
wipe effects
stun enemy (just the one that is out)
add attack bonus (adds attack points and this can be stacked)

I did forget I can also

tease the opponent where they are stunned but they also lose attack damage points. their 7 point attack would be 3 points after using this action
I can also add attack points. This one stacks too. My 7 point attack would be 19 points, and then if I used it again and again I could have a 73 point attack etc. This was an action one of the characters had.

12. **Do actions always occupy fixed slots 1, 2 and 3, or can the player reorder them?**

Yes they can be re-ordered as part of the character configuration. A player might feel that the attack/action is better suited to a fast attack with less damage or impact or they might want it at 3. Each action should be light/standard/heavy where it sits earlier, normal or later on the bar, with advantages and disadvantages. I might need a little more time but my attack is heavier etc. So my action can sit in 1L, 1, 1H, 2L, 2, 2H, 3L, 3, 3H. I hope this makes sense. It is up to me to find the character with the best actions/attacks combination.

13. **Does moving an action to a cheaper slot reduce its strength, or are the actions permanently tied to their slot?**

Yes. I think my explanation above covered it. I have an action/attack. It has attributes/stats. Each character should have a default for this so people can just play but I could assign to 1L and it would be the same action/attack but it would be at the lowest damage amount. 3H would be much heavier for example.

14. **Do you want charge-up actions in the MVP?**

Yes. We shoud be clear about what mechanisms and things there are.

I am a player. I am in the game. I have 1-3 characters (which I selected before the game).
My bar charges and so does the opponent bar.
I can use one of three actions/attacks. For me to use one my bar has to be charged up enough for it to be used.
Some actions fire instantly, or some need to be charged up (using the bar)
Powerups should come in throughout the game/round (tofu in the reference series) and that was either heal one, heal team, extra attack points, wipe effects, opponent stunned and I would like something similar

15. **Can charge-up actions be interrupted by damage or stun?**

Yes. If I am firing something that needs a charge-up and I am damaged or stunned it should stop the attack, but I can also dodge the attack too, or have a mod chip which would prevent the attack from being interrupted and it would go through anyway

16. **Do you want multi-hit actions to make multiple independent critical and dodge rolls?**

Yes please.

17. **Is dodge complete avoidance, partial reduction, or either depending on the action?**

complete avoidance usually, but if there is opportunity for either I am listening

18. **Should team attacks hit benched characters at full power or reduced power?**

team attacks are usually just put together in a way that makes them balanced? If I am using a team attack as my action then it is likely doing less attack points than my attack that just hits one of them. If I'm lucky I get critical hits that do more damage and that can hit any character. It is a trade-off. My single attack is gonna do more damage but my team attack can hit them all and if I use my extra attack points or actions that allow me to get extra attack points and defence is down or something then the team damage can be very effective. Think tournaments. If someone chipped away at my team it would hurt.

19. **Should healing be able to target benched characters?**

Yes. I can heal me or heal team (points balance). My heal me has more points than heal team. Roughly the same overall. It should balance out.

20. **Do you want a battle time limit?**

Yes. There should be a time limit. I don't think it will be reached but it should be there? 60 secs? 90 secs? configurable too?

# B. Squad and duplicate rules

21. **Can the final game permanently allow three exact copies of the same character?**

Yes. I can buy the same character from the shop over and over. Maybe some of them can be rare and harder to come by? More expensive etc. Collector type stuff.

22. **Should character variants count as the same character, or as separate collection entries?**

Yes they are the same character. Our characters could have variants if we supported it. Maybe variant artwork or something?

23. **Can different variants of one character appear in the same squad?**

Yes. I should be able to use the same character multiple times. Maybe there should be a team buff for this.

24. **Does squad synergy count exact matching types only, or can characters possess multiple tags that create several synergies?**

Yes I like the way the reference game has this. The synergys are character class and also if they're a villain or hero etc. So there should be two factors that can get synergy. I guess that allows 4 different combos. Is that as far as we should push it? My synergy is beast > cute so I have power there and my other synergy is that I'm a good guy/hero and there are 3 of me so I would have the good guy/hero bonus (+3 health) and if there were 2 of me it would be +2 health.

25. **Should a mixed squad receive multiple level-1 synergies at once?**

Example:

```text
One Might
One Machine
One Occult
```

Would that produce three separate level-1 bonuses?

This isn't the kind of synergy I had in mind for this game. The reference game
has class synergy where your class determines if you have an advantage or not
and your group, so if you are a villain or a hero and there are +2 or +3
villains you would get +3 Power or +3 Health or +3 Fortune (or whatever is
balanced to be useful). If I just have two of them and one odd one out, then I
get +2 Health.

26. **Should synergy bonuses be universal, or unique to each type?**

Just understand the actual game?

27. **Should a one-character squad receive a type synergy bonus at all, or should synergy only begin at two?**

You previously described one matching character as level 1, so the likely answer is yes.

I think you understand what we are doing?

28. **Should smaller squads receive compensation for bringing fewer characters?**

Yes and no. The XP for levelling up and upgrades is the same amount and is distributed between less characters. If you wanna level up fast this is the way to go.

29. **Can story missions force a squad size?**

Yes. This is good. Story missions could determine which characters/combintations can/can't be used (within reason)

30. **Can missions temporarily lend a character the player does not own?**

Yes. This is actually a solution to something I was worried about.

# C. Type system

31. **Do you want exactly six character types?**

Yes, I was going to call these classes?

32. **Should every character have exactly one type?**

Yes, although a character can have NO type and that system just doesn't apply to them.

33. **Can variants change a character’s type?**

No.

34. **Should attacks have their own type, or should type effectiveness use only the attacker’s character type?**

Only use the attacker's character type. My type gives me an advantage over one type and a disadvantage from another. 6 is the perfect amount for that.

35. **Can an action override its character’s type?**

Example:

```text
A Machine character uses an Occult action.
```

No.

36. **Should type advantage affect only damage, or also stun chance, healing, bar drain and status resistance?**

Yes it can affect anything that is reasonable without making it too complex

37. **Should weak attacks be visibly labelled before use?**

Yes, the idea is that I can always see how many attack points are going to be there. Say my boomerang attack does 17 damage (based on the attack damage, my level and any modifiers), it should have the number 17 on top or next to the icon for the attack. The attacker and one being attacked can know it will be 17. It might get dodged, or deal full damage, or deal extra damage.

38. **Should players be able to inspect the full type wheel at any time?**

I don't know what this means but probably yes. Nothing is hidden.

39. **Do bosses obey the same type system?**

Yes

40. **Can a character ever be neutral to all types?**

Yes. By having no type.

# D. Character stats

41. **Do you want five stats or six?**

Current five:

* Power
* Evasion
* Fortune
* Speed
* Health

Potential sixth:

* Defence

I'm okay with either. If Defence makes the game better? Sure.

42. **Should Defence exist separately from Health?**

Defence was something an action or a bonus could change and when my defence was down the opponent's attacks would do more damage to me and I would never be able to dodge.

43. **Does Speed control battle-bar filling for the entire team or only while that character is active?**

The bar is for the entire team and is shared between all characters on that team. There will always be two bars. There can only be two players in a fight. Most likely it will be player vs computer/bot but we might add support for human vs human.

44. **Does Fortune affect rewards, or only battle probability?**

Only battle probability.

45. **Does Evasion have a hard cap?**

Whatever is the smartest choice here. I'd actually prefer the power and health choices to be the best path. Not like overpowered but if you choose that you're gonna have a good time.

46. **Can a player allocate all points into one stat?**

Yes, if they please and they should be able to change them up whenver they like without consequences. Given they're not actively in a game.

47. **Should each character have different allocation limits?**

Your allocation limit should be based on your character's level, which is linked to XP. I can go from level 1 to level 25. Level 25 is max. I can upgrade my actions/attacks twice each (standard, gold, platinum) and I can have a mod chip (or whatever we call it) and I can purchase mod chips from the shop. If I upgrade my action it might do more damage, or it might also have a chance to stun, or make them lose attack points for their next attack.

48. **Does levelling grant automatic stat growth, allocation points, or both?**

Yes. When I level up I should be prompted to choose what to assign it to. I could leave them unused but I shouldn't and it should let me know if I have.

49. **Can stat points be freely moved at any time?**

Yes. Besides when actively in a game.

50. **Should loadouts include modifications and action order, or stats only?**

I don't know the answer to this sorry.

# E. Character levels and progression

51. **What should the initial level cap be?**

25

52. **Should the cap be easy to raise later?**

Not sure. Maybe? I don't like the idea of it infinitely just getting harder. Level 25 should be enough for now.

53. **Should level differences strongly affect combat?**

I like the reference series balance. If I find it too hard I should be able to just go level up my characters and come back and win.

54. **Should low-level characters gain catch-up XP?**

Yes and no. Low level characters should be easy to upgrade and get into the mix.

55. **Do defeated characters receive XP?**

Not sure. I guess so. We don't want to punish.

56. **Do benched characters receive full, partial or no XP?**

It depends how we do it. In the reference game I can have 7 or 8 characters active but I can only select 3 per battle (up to 3) Only the 3 in the battle should get the XP. Maybe the benched characters can get some too?

57. **Does the entire collection receive passive XP?**

Maybe.

58. **Can currency purchase XP items?**

What are currency items and what are XP items? I think we need to consider what this is. XP drives the character's level, power, health etc. We earn currency and we can buy characters, mod chips and upgrades. I can only have one mod chip assigned to my character and it does something like fast bar for a while at the start of a game, more money etc We should copy the reference series here.

59. **Should duplicate characters be consumed for XP or upgrades?**

Characters were consumed for upgrades to the attacks in the reference game. I like this but I'm not sure it is the best way to go? It is up to you.

60. **Should action upgrades require character level thresholds?**

Yes. I can get a mod chip at level 5 and customize my actions *choose slot* and upgrade them at level 10.

# F. Action upgrades

61. **Can an action be upgraded immediately if the player has currency, or does it require level or story progress?**

Actions can't be slot switched or upgraded until level 10.

62. **Does every action always have exactly three tiers?**

Yes. Stock, upgraded once, and upgraded twice.

63. **Can a max-tier upgrade alter the action dramatically?**

Yes.

64. **Can an upgraded action ever become worse in one respect to gain another?**

No.

65. **Can action upgrades be reverted or changed?**

No. Why would you? Once you're upgraded you're upgraded.

66. **Are tiers purchased individually per owned character copy, or globally for that character definition?**

each character (figure) has them. if i sell my character i sell the upgrades with it. if i get a new one of that same character i need to get the upgrades again

67. **Do variants share action upgrades?**

I don't know what this means.

68. **Should the player preview the exact tier changes before purchasing?**

Yes. The player should be able to see what the upgrade is before they buy it.

# G. Modifications

69. **Should the final name remain “mod chips”, or should the agent invent something original?**

Something original.

70. **Is one modification slot per character the long-term design, or only the MVP?**

One modification slot per character. I can take them out and swap them around though. Some modifications are only for specific classes (beast for example)

71. **Are modifications reusable across characters?**

Yes but only by one character at a time for each mod

72. **Can one modification be equipped by several characters simultaneously?**

No

73. **Do modifications have character-type restrictions?**

Yes but this is for special mods

74. **Should modifications have levels or upgrades?**

No. It can only be equipped after level 5 though.

75. **Should modifications ever be consumable?**

No.

76. **Should changing a modification be free?**

Yes

77. **Can modifications alter action behaviour, or only statistics?**

They can modify anything. For example one would be a modifcation that boosts your bar speed at the start of whenver that character is used in the game. One might be 50% chance of not being interupted for charging attacks, one might be +5 power, please look at the reference game for this.

78. **Can story-specific modifications exist?**

No.

# H. Economy

79. **What should the currency primarily represent in the fiction?**

Don't care.

80. **Should repeat fights always provide full rewards?**

Yes or at least most.

81. **Should replay rewards diminish to prevent one optimal grind stage?**

Nah unless there is something that sticks out like a sore thumb.

82. **Should Easy and Normal have exactly identical rewards?**

Yes.

83. **Should Hard and Brutal provide only currency bonuses, or XP too?**

It should actually just have commentary throughout the game (wouldn't there be less currency and tighter xp?)) that tells the person how much of a badass they are and how awesome they are (it is up to them to decide if they're being made fun of). Comments like "gee, I can only have fun if I play the game on the hardest settings, those easy mode people are hacks". That kinda energy and vibe.

84. **Should a loss provide partial XP or no rewards?**

Yes.

85. **Should mission progress count on a lost fight?**

Example: deal 1,000 total damage.

It depends I guess. Not opinionated.

86. **Should character prices be fixed or change based on story progress?**

They should have a range, and the market should fluctuate or I should be able to get them on special or for whatever random thing comes up

87. **Should stores ever rotate inventory?**

Yes absolutely. I should be able to find my favourites though.

88. **Should event stores be allowed later?**

Yes.

89. **Should players be able to sell characters or modifications?**

Yes. Without penalty.

90. **Should currency have a maximum cap?**

No.

# I. Store and collection

91. **Are all characters eventually purchasable, or are some only earned?**

Yes and no. There are common and rare characters though (a spectrum) and some are only earned and some are only bought if lucky or in special places.

92. **Should the store show every locked character from the beginning?**

No. They should be revealed as they are unlocked.

93. **Should some characters remain secret silhouettes?**

Yes.

94. **Can the player buy duplicate copies?**

Yes.

95. **Do purchased characters begin at level 1?**

Yes. Purchased characters should come between levels 2-10.

96. **Can store stock be gated by story, mission or tournament completion?**

Yes.

97. **Should each character have a dedicated store card and preview battle?**

Sure.

98. **Should the player be able to try a character before buying?**

Yes, although they can do this in non story mode. All characters should be available in non-story mode.

# J. Story design

99. **Is there one canonical main story, or can all stories be equally independent?**

There shoud be a canonical main story but also independent and unofficial stories should easily be able to be generated or added.

100. **Do story choices create meaningful branches or mostly dialogue differences?**

Only in the short term. Story choices should be able to affect what they touch and what they can reach but that is it.

101. **Can choices lock the player out of content?**

No.

102. **Can story nodes be replayed immediately?**

Yes.

103. **Does replaying a choice allow a different branch?**

If there are branches. I don't think we should restrict the player from playing everything.

104. **Can story fights be skipped after being cleared?**

Yes.

105. **Can story dialogue be skipped?**

Yes.

106. **Should stories support auto-advance?**

Yes.

107. **Should losses have unique defeat scenes?**

Can do. We can generate whatever art and as much art as we need.

108. **Can story characters fight using levels different from the player’s owned version?**

I don't know what this means. Probably no?

109. **Can stories temporarily override the player’s squad?**

Yes. Although, it should always give and never take. If we are overriding the squad, they get what we give them.

110. **Should story progress be shared across difficulties?**

Yes. There should be no punishment for changing difficulty

111. **Should each story have its own currency or only the global currency?**

Global currency. Maybe it can have a different image and name per story?

112. **Can an event story disappear, or should completed events remain accessible?**

Remain accessible. Besides if the tutorial is an event.

# K. Level-path presentation

113. **Should the level path scroll vertically, horizontally or use chapters/pages?**

Don't know. I haven't thought this part out yet.

114. **Should it branch visibly?**

TBA.

115. **Should cleared levels receive stars or ratings?**

Yeah that would be cool. Our game would have to give feedback to the level layer and however that is orchestrated. We would have to make sure the code makes sense here.

116. **Should story nodes show their content type before entry?**

I guess so? I don't know what this really means.

117. **Should hidden nodes exist?**

Maybe. I haven't decided this yet.

118. **Should players be able to jump directly to any completed node?**

Yes I think so.

119. **Should shops appear only as nodes, or also as permanent menu access?**

Probably both? I want them to feel like part of the game but having a menu where I can just go to them would be nice.

120. **Should missions appear attached to levels or in a separate mission screen?**

Not sure. I haven't really thought this part out yet.

# L. Tournaments

121. **Does health reset between tournament rounds?**

No. You start with the characters you have assigned (up to 8? or maybe 7? I think the reference series had 7 or 8). These are the only characters I can use in a tournament once it has started and their health and if they are alive or not carries through the tournament. The tournament has fights but also between fights there are opportunities for luck of the draw things where you can heal, heal team, revive (this should only come up if they can revive), start next round with more attack points etc

122. **Can the squad be changed between rounds?**

You can have characters in the squad and up to 3 characters can be selected for a game from that squad. I can have as many characters as I want in my inventory/collection but only 7-8 are in the game at once. I can only select my characters for battle from those 7-8. See the reference game for this one. They did this well and in the character select screen I could select my characters (drag and drop), I could select my accessory (see the reference game), it would show the game mode (if not standard) and it showed the class wheel too so you could always see which character type was better than the other etc.

123. **Can modifications be changed between rounds?**

No. A mod chip or whatever we call this is added before the tournament starts and can't be changed until the end of a tournament.

124. **Can difficulty be changed mid-tournament?**

Yes. Difficulty should be able to be changed at any time from a settings menu or something.

125. **What happens after losing a tournament round?**

If you lose a tournament round you're out of the tournament. Tournaments can be attempted again and as many times as needed. You have to do the tournament from start to finish in one go and it should be achievable.

126. **Can tournaments be replayed indefinitely?**

Yes

127. **Should repeat completions provide full rewards?**

Yes, at least most of the way.

128. **Should brackets be visible before entry?**

Sure. I don't think it matters. Whatever looks and feels the best.

129. **Should opponents be fixed, random or both?**

Fixed. Each level should have fixed opponents. Tournaments can be random and both. The main story levels would always be fixed though.

# M. Quick Fight and sandbox

130. **Should Quick Fight reward currency and XP?**

It could. I was thinking quick fight would be separate and same with just tournament mode and the currency and collecting characters only came into play during the story modes. You can select from any characters for quick fight and tournament mode right?

131. **Can Quick Fight be used for grinding?**

I'm not against it but I don't think quick play was counting as part of the story. Maybe it can? If there is an active story and quick play is used maybe the currency and XP can count? Not sure. It shouldn't just go to nothing that is a good point.

132. **Should unrestricted sandbox fights give no rewards?**

As above. I was thinking that but it should have something. Maybe gold or whatever the currency is. The currency can only be used for characters, upgrades, accessories etc.

133. **Can the player customise enemy levels and builds?**

In Quick Fight yes and same with Tournament Mode (tournaments should all be
custom-selectable, along with presets for all Story Mode tournaments). In Story
Mode the tournaments will not be customisable. Enemy levels should be balanced
for when and where they appear. I should be able to beat higher levels within
reason, but low-level Characters should not beat anyone. Tournament structure
should stay close to the documented reference behaviour. Our difference is
that we have standalone Tournament Mode as well as Story tournaments, plus our
own Quick Fight grind structure.

134. **Can the player use characters they do not own in sandbox mode?**

That is the idea in quick match. Everyone should be available. Same in tournament mode. All attacks and upgrade levels should be open too.

135. **Can Quick Fight select music manually?**

Game music should be an option.
Characters have a song (like a theme song)
In game has songs (selects from a pool at random or in story mode or tournaments songs can be selected per level/fight)
We can do things kind of like WWE entrances and theme music

As a user I can turn music on or off and change the volume level

There is only one pool of music and tracks can be used for any purpose

136. **Can Quick Fight apply event or tournament rules?**

Yes, although I'm not sure exactly what this means. Tournaments don't have special rules. the reference game has some different fight modes I would like to carry across.

137. **Should Quick Fight results count toward missions?**

We have probably covered this above.

# N. AI opponents

138. **Should Easy AI make intentionally poor choices?**

Within reason. It should just be way more forgiving. I shouldn't really be able to lose on easy. Normal I should be able to lose if I'm not paying attention. Hard should be a reasonable challenge. Brutal is where you kinda have to have a good to perfect run to win. Lean towards being more player friendly.

139. **Should harder difficulty improve AI behaviour, statistics, or both?**

Whatever makes sense.

140. **Can AI switch characters strategically?**

Yes absolutely

141. **Can AI inspect the player’s available actions?**

Yes, everything should be visible for both sides at all times: what they have,
Charge level, Moves, Health, and predicted damage. The reference game proves
that this information can remain readable.

142. **Should bosses use bespoke AI rules?**

I will trust your judgement here.

143. **Should AI follow the same rules as the player?**

I will trust your judgement here but mostly yes.

144. **Can Brutal AI receive hidden advantages?**

Probably not but maybe. I will trust your judgement.

145. **Should enemy builds be authored or generated?**

I don't know what you mean by this? Authored. The build (actions/attacks) come with the character from a pool of actions/attacks that are building blocks. As long as all of the building blocks are there each character can have whatever actions/attacks they want. The same action can take many forms etc. My attacks/actions can be built on what we deem appropriate. Example is there could be attack one, attack many, stun one, stun many, heal one, heal many and we can come up with how we decide to do it. The characters can then use this in their actions/attacks. I hope this makes sense. It is so it feels like we have heaps of different actions/attacks but at the core they're actually all just basically the same thing. This would make balancing easier right?

# O. Presentation and art

146. **Should the game’s main desktop layout be landscape?**

Desktop should be landscape and mobile would be portrait. I'm not opinionated actually.

147. **Should mobile later be portrait, landscape or both?**

I would go with landscape for desktop, and mobile can be portrait and/or landscape?

148. **Do you prefer anime, comic, toy-commercial, surreal, graffiti, hip-hop, cyber, fantasy or another initial visual direction?**

I'm undecided but I think we choose one and go for it for the main container and game. Characters and stories and tournaments would have their own vibes.

149. **Should the characters look like literal physical figurines, stylised people, spirits, toys or digital constructs?**

I like the idea of toys and figurines but we already have our style and direction. We should choose something and roll with it.

150. **Should rectangular frames remain visible at all times, or can some artwork fill the screen?**

I don't know how this is going to work. I am hoping you would have some ideas.

151. **Should large action cut-ins appear for every action or only stronger actions?**

As above. I don't know how we achieve this.

152. **Should two-frame motion be used in story scenes as well as battle?**

Not really sure how to answer this. I don't want our level and game overlay system to get caught up with the battle game.

153. **Should backgrounds also subtly animate through parallax, glow and particles?**

Yes. Please just make it look awesome.

154. **Should generated images contain text, or should all text be rendered by the game?**

It can be but it depends. Case by case basis. There probably aren't too many places we need text unless it was part of the background. This should be obvious with what we are generating.

155. **Should event art alter the whole visual theme or only selected panels?**

Don't know. It will probably just alter selected panels. Whatever makes sense.

156. **Do you want character designs to share a strict silhouette style?**

No not really. I want them to be consistent in the WHAT so our framework for the game always works but as long as it follows that I really don't care. I was expecting that we would have one or many references when we are creating the artwork for each character and we would generate the artwork using those references. That's how it would be consistent because when we are generating art for characters we are always following the same process and using the same prompts, and asking for the same things just with different attacks and actions etc.

157. **Should variants be recolours, costume changes, new forms or all three?**

the reference game has recolours/reskins. This works. That's probably all we need here too. Don't make it complicated. I have a character and I can recolour it. I don't actually know what this would change in the game. I don't want to have to generate too much extra artwork if we do it. I guess as long as it is thought out and consistent.

# P. Audio and music

158. **Should every character eventually have a unique voice?**

Not really. We can generate the voices/dialogue with elevenlabs so who knows how it goes?

159. **Should characters speak during every action or only occasionally?**

Only occasionally

160. **Should dialogue interrupt combat or overlap it?**

Overlap it or be on top of it. Dialogue can be part of story or tournament but it shouldn't leak into the actual battle/game.

161. **Should action SFX be character-specific or partly shared?**

Partly shared but also can be character-specific

162. **Should characters have associated battle themes?**

Yes, but this is from a pool of music and a character can have music, a story can have music, the battle has music. I want the characters to have WWE style entrances.

163. **Should the player be allowed to choose music in all modes?**

Yes you should be allowed to replace the characters music. It shouldn't matter. Any track can be selected for any thing.

164. **Should story nodes define their own track?**

Characters have music
Game has music
Tournament has music
Story levels background has music

We need to think about the surfaces for the music before answering this.

165. **Should music continue seamlessly across adjacent story nodes?**

I don't know. It should stop and start when it makes sense.

166. **Should vocal songs be allowed during battle?**

Yes you don't have to care what the music is.

167. **Should sound and dialogue be optional independently?**

Yes I think so and we will have a settings page

# Q. Save system

168. **Should save data remain local only initially?**

Yes please

169. **Do you want multiple save slots?**

Yes that would be great

170. **Should Story Mode support separate profiles?**

Yes whatever is simple and makes sense.

171. **Should the game autosave after every purchase and battle?**

Yes please

172. **Should settings and progression be stored separately?**

Yes because I should be able to keep my settings while wiping progression and vice versa

173. **Should users be able to export and import saves?**

Yes this would be cool but not needed at first or until we are happy with what this actually is. Don't wanna get caught up supporting legacy modes no one ever used.

174. **Should the desktop web build support cloud save later?**

Yes but we don't have cloud yet. I plan to use Cloudflare Workers and Cloudflare if and when we get to this. Local first.

# R. Player identity

175. **Is the player an explicit character in the story?**

I don't know. They can be, but they are not a big part of it. The reference
game let you select an avatar, but it did not materially affect the game.

176. **Does the player have a visible avatar?**

Yes can do

177. **Does the player have a name entered at the start?**

Yes

178. **Does the player speak through choices?**

Doesn't have to but can do. I don't know if it is worth it unless it actually is meaningful in the game.

179. **Is the player a collector, coach, summoner, owner or something else?**

Collector who fights against other collectors to be the ultimate collector

180. **Can the player customise their profile?**

Yes where it makes sense

# S. Scope and publishing

181. **Is the first public release intended to be free?**

Yes

182. **Should it run completely offline after loading?**

No preference

183. **Will it initially publish under one of your existing domains?**

Yes I was thinking Cloudflare Workers unless it is mobile first in an engine or sometihng. At the moment I think we are with Phaser.

184. **Do you expect keyboard and mouse only at first, or controller support too?**

Mouse, touch and keyboard should work. It is literally just clicking on stuff isn't it?

185. **Should touch input remain supported in desktop browsers from the beginning?**

Don't care. Touch is for mobile though.

186. **Should accessibility include reduced motion?**

We should consider accessibility where it makes sense.

187. **Should colour-blind indicators be designed into the type system?**

If we can sure.

188. **Should the MVP include sound settings even before SFX exist?**

Yeah we know they're gonna exist.

189. **Should the MVP be installable as a PWA?**

If it makes sense to. Depends on the stack right?

190. **Do you want analytics or no tracking initially?**

Don't care. It would be nice to consider observability and telemetry from the beginning. It depends where this is hosted and what the stack is.

---

# Highest-priority questions to answer first

The full list can be handled by the agent as unresolved design questions, but these are the ones that affect architecture immediately:

1. Is there one battle bar per team, or one truly shared by both teams?
2. Does the bar persist when switching characters?
3. Can exact duplicate characters be used permanently?
4. Do characters have one type or can actions have separate types?
5. Is Defence a sixth stat?
6. Does Speed affect the active character or the entire squad?
7. Does one matching type member genuinely provide synergy level 1?
8. Is synergy universal or type-specific?
9. Does Quick Fight award progression?
10. Are unrestricted sandbox characters allowed?
11. Does health reset between tournament rounds?
12. Should Story Mode use a horizontal, vertical or chapter-card path?
13. Is the first desktop layout landscape?
14. What does the player represent in the fiction?
15. Are modifications permanently reusable?
16. Are character duplicates part of the economy or merely an MVP shortcut?
17. Can action slots be reordered?
18. Does Easy provide exactly the same rewards as Normal?
19. Do losses grant XP or partial rewards?
20. What visual tone should the first creative concept explore?

**Confidence: 99%**
