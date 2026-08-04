# Ultimate Reference-Equivalent Game Specification — V2

**Original collectible squad battler with source-parity combat grammar and no exploration**

**Generated:** 2026/07/31 12:23 AEST  
**UTC:** 2026/07/31 02:23 UTC

> This V2 file contains, in precedence order:
>
> 1. the exhaustive mechanics audit;
> 2. the authoritative V2 patch;
> 3. the original 25,000-word implementation specification.
>
> When text conflicts, the V2 patch wins.

---

# the reference game Mechanics Audit and Source-Parity Compendium

**Purpose:** catalogue every publicly verifiable, visibly demonstrated, or repeatedly community-documented non-exploration mechanic in the external reference game / the reference game, then state the equivalent required for this project.

**Generated:** 2026/07/31 12:23 AEST  
**UTC:** 2026/07/31 02:23 UTC

---

# 1. Honest completeness statement

The previous 25,000-word specification is already a large, implementation-oriented design document. It covers the intended product structure, deterministic engine, battle bar, action lifecycle, switching, statuses, progression, collection, Quick Match, Tournament Mode, Story Mode, AI, economy, data models, testing and presentation.

It does **not** yet contain every mechanic that was found during the deeper source-game audit. In several places it intentionally substituted project-friendly rules for source behaviour. Those substitutions are valid design choices, but an implementing agent must know when it is reproducing the source game's decision structure and when it is building an original extension.

This compendium therefore uses five evidence labels:

| Label                    | Meaning                                                                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **VERIFIED**             | Confirmed by an official description, an unambiguous game screenshot/video, or multiple reputable reviews.                                   |
| **CORROBORATED**         | Independently described by multiple guides, reviews or gameplay observations.                                                                |
| **COMMUNITY-CATALOGUED** | Recorded in a substantial player-maintained catalogue. Useful and usually based on in-game text, but not guaranteed to be error-free.        |
| **UNKNOWN EXACT**        | The system exists, but exact formula, probability, timing, cap or edge-case behaviour is not publicly established.                           |
| **PROJECT RULE**         | The original equivalent selected for this game. This is authoritative for implementation even where it deliberately differs from the source. |

No exact number should be represented as a source fact unless marked **VERIFIED** or **CORROBORATED**. Values marked **PROJECT BASELINE** are tunable starting values.

The target is not a copyrighted clone. The target is an original game with the same broad tactical grammar:

- three compact actions per character;
- one active character per side;
- team switching;
- a continuously filling, spendable action bar;
- readable enemy timing;
- short battles with tactical interruption and tempo control;
- collectible characters with individual progression;
- loadout customisation;
- team-composition bonuses;
- high-impact battle accessories;
- sequential tournament attrition;
- quick, tournament and authored story structures without an explorable map.

---

# 2. Scope boundary

## 2.1 Explicitly excluded

Do not implement:

- free-roaming walking;
- a navigable city;
- bus travel;
- day/night navigation;
- hidden overworld pickups;
- manholes, doors or physical world shortcuts;
- map-based shop placement;
- NPCs that must be physically approached;
- route guidance;
- world-coordinate quest objectives;
- location hunting as a prerequisite for normal battles.

## 2.2 Included after translation

Map-dependent functions may still exist as menu-driven or graph-driven systems:

| Source function             | Project equivalent                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| Encounter an NPC            | Select an authored dialogue or mission node                                                  |
| Enter a tournament building | Select a tournament from Tournament Mode or Story Mode                                       |
| Visit a shop                | Open the Store screen or a story-specific store node                                         |
| Find a figure               | Earn through a battle, mission, shop roll, achievement or unlock condition                   |
| Discover a secret           | Meet a hidden condition in a fight, mission chain or menu interaction                        |
| Travel to a new area        | Unlock a chapter, episode, league or themed menu collection                                  |
| Day/night availability      | Scheduled story state, rotating store inventory, challenge rotation or explicit chapter flag |
| Pick up a side mission      | Accept from a mission board, story node or post-battle offer                                 |
| Revisit a location          | Replay a node, chapter, challenge or tournament                                              |

---

# 3. Corrections to the previous specification

The following are the most important source-parity corrections.

| Topic                | Source-game shape                                                                                            | Previous project choice                           | v2 treatment                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Level cap            | Maximum level 20                                                                                             | Level cap 25                                      | Keep 25 only as a deliberate project extension; provide a source-parity profile with cap 20                                                                 |
| Primary stats        | Health, Power, Dodge, Luck                                                                                   | Health, Power, Defence, Speed, Dodge, Critical    | Default project parity profile uses the four-source-stat model; Defence and Speed become derived/action/status properties unless explicitly enabled         |
| Level-up choice      | One of three presented stat increases is selected                                                            | One free point each level into any of six stats   | Implement configurable `choice_offer_count`; source-parity value is 3 choices from the four-stat pool                                                       |
| Enhance unlock       | Level 5                                                                                                      | Level 10                                          | Enhancement unlocks at level 5 in parity rules                                                                                                              |
| Action configuration | At level 10, reorder the three existing powers                                                               | Reorder plus choose one of nine cost anchors      | Separate profiles: `REFERENCE_THREE_SLOT` and optional `EXTENDED_NINE_ANCHOR`                                                                               |
| Action upgrade tiers | Base, Gold and Shiny presentation                                                                            | Stock, Gold and Platinum                          | Use original names such as Base, Enhanced and Mastered in shipped content, but preserve two upgrade steps                                                   |
| Mod chips            | One per figure; removing destroys the chip                                                                   | Reusable, freely removable                        | Destructive source behaviour is documented; project defaults to reusable unless the project owner explicitly chooses the harsher economy                    |
| Repaints             | Cosmetic palette schemes                                                                                     | Cosmetic                                          | Already aligned                                                                                                                                             |
| Tofu                 | Beneficial battle pickups that grant an activatable temporary power                                          | General drops and hazards were partially combined | Keep beneficial pickups, batteries and hostile bar hazards as three separate systems                                                                        |
| Accessories          | One battle accessory, separately charged by attacks and battery drops                                        | Separate meter, mostly action charge              | Add battery drops and tournament per-accessory usage rules                                                                                                  |
| Team bonuses         | Named, authored combinations; only one active result with priority rules                                     | Six generic traits that can stack                 | Keep traits as the original game's scalable equivalent, but support named combo definitions and single-combo priority                                       |
| Tournament           | Six-figure registration, persistent HP/defeat, between-fight recovery, battle modifiers, accessory attrition | Similar but more generic                          | Add full recovery-choice, modifier and accessory inventory rules                                                                                            |
| Online               | Random, friend and CPU battle choices with rankings                                                          | Omitted                                           | Catalogue it; treat as optional post-MVP because the user's required modes are Quick Match, Tournament and Story                                            |
| Random eggs/IAP      | Random bundles of figures, accessories and repaint tokens existed                                            | Deliberately excluded                             | Keep excluded from monetisation; optional earnable mystery bundles may use transparent odds                                                                 |
| Figure disposal      | Duplicates can be fed, sold/trashed or retained as individual instances                                      | Generous full-refund selling                      | Preserve safe project economy, but include source-equivalent sacrifice/disposal operations as optional rules                                                |
| Action catalogue     | Many unusual actions beyond damage/heal/status                                                               | Primitive catalogue was broad but not exhaustive  | Add multi-use activation, permanent action disable, hack, no-cost transformations, fly, remote mines, counter stances, minions and action-generated pickups |

---

# 4. Source combat architecture

## 4.1 Duel composition

**VERIFIED / CORROBORATED**

- A normal duel supports one to three figures on each side.
- The common full team is three.
- One figure per side is active on the field at a time.
- Remaining figures are bench members.
- The player may switch among living team members during battle.
- Victory requires defeating every opposing figure.
- The battle does not wait for alternating turns. Time and both sides' bars advance continuously.
- Both sides can act according to their own meter state.
- The player's selected battle participants are the figures that earn normal battle XP in the source game.
- A defeated participant may remain eligible for post-battle XP, but exact source distribution should be verified through instrumentation before parity is claimed.

**PROJECT RULE**

- Support team sizes 1, 2 or 3 in all combat code.
- Story, Quick Match and individual tournament duels may author any legal size.
- Team size is a battle rule, not a separate combat implementation.
- Never implement a second engine for tournament or story battles.

## 4.2 Side state

Each side requires:

```ts
interface BattleSideState {
  sideId: SideId;
  team: CombatantState[]; // 1..3 selected for this duel
  activeIndex: number | null;
  bar: BattleBarState;
  accessory: AccessoryRuntimeState | null;
  pickupQueue: PickupPowerState[];
  teamCombo: ResolvedTeamCombo | null;
  switchState: SwitchRuntimeState;
  sideStatuses: StatusInstance[];
  defeatedOrder: CombatantId[];
  pendingAutoEntry: CombatantId | null;
}
```

Side-owned state is critical because the bar, accessory and several buffs persist when the active figure changes.

## 4.3 Figure state

```ts
interface CombatantState {
  instanceId: string;
  definitionId: string;
  level: number;
  maxHp: number;
  hp: number;
  power: number;
  dodge: number;
  luck: number;
  type: CombatType;
  actionLoadout: [ActionRuntime, ActionRuntime, ActionRuntime];
  statuses: StatusInstance[];
  modChip: ModChipRuntime | null;
  alive: boolean;
  active: boolean;
  chargesByActionId: Record<string, number>;
  summons: SummonRuntime[];
  delayedEffects: DelayedEffectRuntime[];
}
```

`Defence` and `Speed` are not required as assignable source-parity stats. An action can still grant damage reduction, shields, defence-up, defence-down, bar haste or bar slow through effects.

---

# 5. Battle bar

## 5.1 Two independent bars

**VERIFIED**

There is one bar for the player side and one bar for the opponent side. The opponent's bar and action positions are visible, making enemy timing part of normal decision-making.

Do not implement a single contested bar.

## 5.2 Team ownership

**VERIFIED / CORROBORATED**

- The bar belongs to the side, not to the active figure.
- Switching the active figure retains the current bar progress.
- The newly active figure exposes its own three actions on the retained bar.
- Team-wide bar speed changes survive a switch for their authored duration.
- Bar damage, drain, freezing and breaking apply to the side meter.

## 5.3 Continuous fill

The bar fills in real time whenever it is not paused by battle state or an explicit effect.

The source game's exact:

- base capacity;
- fill rate;
- action costs;
- threshold percentages;
- acceleration curve;
- post-action residual behaviour;
- pause behaviour during cinematics;
- frame-rate dependence;

are **UNKNOWN EXACT**.

The previous Gemini material asserted a 100-point bar, 33/66/100 costs and a six-second full charge as though they were measured facts. They were not established. Treat them only as one possible prototype baseline.

## 5.4 Action anchors

**VERIFIED BY UI**

Each active figure has three action icons attached to positions along the horizontal bar. The actions are not ordinary cooldown buttons. An action becomes selectable once fill reaches its anchor/cost.

Observed screenshots show anchors that are not necessarily exact thirds. The correct abstraction is:

```ts
interface ActionCostProfile {
  cost: number; // data-driven bar units
  visualAnchor: number; // usually derived from cost/capacity
}
```

The engine must allow any legal cost rather than hard-coding `33`, `66` and `100`.

## 5.5 Spending

**CORROBORATED, exact edge cases unknown**

- Committing an action spends an amount of bar corresponding to its action position.
- A player can choose a cheap action quickly or wait for a more expensive action.
- This creates the central decision between tempo and impact.
- Bar-drain actions can remove some of the opponent's accumulated progress.
- Self-damage actions can add bar progress.
- Some transformations or authored actions can have no bar cost.
- A freeze/break effect can erase the opponent's current progress.

Required project rule:

```ts
function tryCommitAction(side, actionId): CommitResult {
  validateBattleRunning();
  validateActiveCombatant();
  validateNotHardControlled();
  validateActionNotDisabled();
  validateRequiredUsesOrChargeState();
  validateBarAtLeast(action.cost);
  reserveTarget();
  spendCostAtConfiguredMoment();
  enterActionLifecycle();
}
```

Cost timing must be authored as one of:

- `ON_COMMIT`;
- `ON_CAST_COMPLETE`;
- `PER_CHANNEL_TICK`;
- `ON_RESOLUTION`;
- `NO_COST`.

The parity default is `ON_COMMIT`, because interruption is intended to carry resource risk.

## 5.6 Bar manipulation catalogue

The engine must support all of these independently:

| Mechanic               | Behaviour                                                |
| ---------------------- | -------------------------------------------------------- |
| Flat gain              | Add bar points                                           |
| Percent gain           | Add a percentage of capacity                             |
| Flat drain             | Remove points                                            |
| Percent drain          | Remove a percentage of current or maximum bar            |
| Fill-rate haste        | Multiply fill per second                                 |
| Fill-rate slow/curse   | Reduce fill per second                                   |
| Pause                  | Stop fill without deleting progress                      |
| Freeze and break       | Pause briefly, then remove accumulated progress          |
| Minimum bar floor      | Prevent drain below a threshold                          |
| Bar lock               | Prevent spending or filling for a duration               |
| Action-cost reduction  | Reduce one or more action costs                          |
| Refund                 | Return some cost after resolution, dodge or interruption |
| Set value              | Set bar to an explicit value                             |
| Full charge            | Set to capacity                                          |
| No-cost next action    | The next qualifying action spends zero                   |
| Self-damage conversion | Lose HP to gain bar                                      |
| On-hit gain            | Gain bar for each resolved hit                           |
| On-dodge gain          | Gain bar after a successful dodge                        |
| On-defeat gain         | Gain when ally or enemy is defeated                      |

## 5.7 Bar telegraphing

The battle HUD must communicate:

- current fill;
- maximum;
- each action cost/anchor;
- which action is currently affordable;
- hostile disabled or hacked action positions;
- current fill-rate multiplier;
- freeze/pause state;
- amount lost to a bar break;
- opponent action affordability;
- opponent cast/channel progress;
- queued pickup power;
- accessory charge.

The enemy is not allowed hidden bar resources in normal rules.

---

# 6. Switching

## 6.1 Normal behaviour

**CORROBORATED**

- Switching is a core tactical operation rather than an expensive special move.
- Switching retains side bar progress.
- Switching changes the active type matchup, action set, current individual statuses and mod-chip effects.
- Team-wide effects remain.
- Switching can protect a low-health or currently disadvantaged figure.
- Switching can bring in a specialised healer, bar controller, charger, dodger or finisher.

The exact source:

- switch cooldown;
- animation duration;
- invulnerability;
- whether a projectile retargets;
- whether a committed attack follows the outgoing target;
- whether a cast can be cancelled by switching;

are **UNKNOWN EXACT**.

Do not repeat Gemini's guessed 1.5–2-second swap cooldown as a fact.

## 6.2 Project commitment rule

To prevent switching from becoming a universal dodge:

1. An action selects and locks its target at the authored `TARGET_LOCK` phase.
2. If the target switches after target lock, the action follows the locked target unless the action explicitly targets `CURRENT_ACTIVE_AT_IMPACT`.
3. Team and group actions resolve against their authored set.
4. Switching may interrupt the outgoing figure's own uncommitted charge/channel.
5. A character cannot switch while defeated, during a hard cinematic lock, or when affected by an explicit `NO_SWITCH` status.
6. Standard switching has no bar cost.
7. Standard switching has either no cooldown or a very short presentation lock. This remains a project balance choice, not a source claim.
8. AI and human players obey identical switching rules.

## 6.3 Automatic entry after defeat

After the active figure reaches zero HP:

- its defeat event resolves;
- on-defeat effects and mod chips trigger;
- the accessory may charge or complete through a Comeback-style effect;
- the next living figure enters automatically or through a short player selection window;
- side bar is retained unless a battle rule says otherwise;
- team-wide statuses continue;
- the defeated figure cannot return in the same duel unless an explicit revive effect exists.

---

# 7. The four primary stats and level progression

## 7.1 Source stat model

**VERIFIED / CORROBORATED**

Every figure uses four player-visible primary stats:

1. **Health**
2. **Power**
3. **Dodge**
4. **Luck**

### Health

- Sets maximum HP.
- Higher HP permits more damage before defeat.
- Team bonuses and accessories may temporarily or permanently adjust effective HP.

### Power

- Increases damaging action output.
- It may also influence damage-over-time or summons, but exact inheritance is **UNKNOWN EXACT**.
- Healing and shields should use explicit scaling fields rather than assuming Power affects every beneficial action.

### Dodge

- Provides a chance to avoid a damaging hit.
- A dodged hit deals no ordinary damage.
- Dodge-triggered modifications may counterattack, heal or grant a power boost.
- Whether non-damage statuses attached to a dodged hit still apply is **UNKNOWN EXACT** and must be explicitly defined in this project.

### Luck

- Functions like a critical-hit or “Lucky Duck” chance.
- A lucky hit deals increased damage.
- Lucky Duck-triggered modifications can stun or heal.
- Community observations also associate Luck with beneficial tofu occurrence, but the precise relationship is not established.
- Exact lucky-hit multiplier and probability mapping are **UNKNOWN EXACT**.

## 7.2 Level range

**CORROBORATED**

- Figure levels run from 1 to 20 in the source game.
- Only a subset of the collection should be expected to reach maximum level during ordinary progression.
- Figures used in battle gain XP.
- A level-up can unlock a feature or present stat growth.

## 7.3 Stat-choice presentation

**CORROBORATED**

On a level-up, the game offers three stat choices drawn from the four primary stats, and the player chooses one. It is not a six-stat free-allocation screen.

Source parity data model:

```ts
interface LevelUpOffer {
  combatantInstanceId: string;
  offeredStats: [PrimaryStat, PrimaryStat, PrimaryStat];
  selectedStat?: PrimaryStat;
  incrementByStat: Partial<Record<PrimaryStat, number>>;
}
```

Project rules must decide whether offers are:

- pseudo-random;
- deterministic per character and level;
- weighted toward lower stats;
- guaranteed not to repeat;
- rerollable;
- fully previewable.

Recommended project equivalent: deterministic offers generated from `(characterDefinitionId, level)` so save/reload cannot reroll, with one free full respec outside an active tournament.

## 7.4 Project parity profile

```json
{
  "levelCap": 20,
  "primaryStats": ["HEALTH", "POWER", "DODGE", "LUCK"],
  "levelUpChoiceCount": 3,
  "choicesPerLevel": 1,
  "respecPolicy": "FREE_OUTSIDE_ACTIVE_RUN"
}
```

The project may still choose level 25 later, but content must not accidentally rely on 25 while claiming source parity.

---

# 8. Combat types

## 8.1 Source type wheel

**CORROBORATED**

The six source classes form this closed loop:

```text
Cute
  beats Dark Arts

Dark Arts
  beats Super

Super
  beats Tech

Tech
  beats Martial Arts

Martial Arts
  beats Beast

Beast
  beats Cute
```

Circular notation:

```text
Cute → Dark Arts → Super → Tech → Martial Arts → Beast → Cute
```

Each normal type is:

- strong against one;
- weak against one;
- neutral against three.

The exact damage multiplier is **UNKNOWN EXACT**. Do not encode `1.5×` and `0.75×` as source facts without measurement.

## 8.2 Project mapping

The project's original names can preserve the same six-node topology:

| Source role  | Current project label                      | Note                                                         |
| ------------ | ------------------------------------------ | ------------------------------------------------------------ |
| Martial Arts | Brawler                                    | Strong conceptual match                                      |
| Tech         | Tech                                       | Direct match                                                 |
| Cute         | Oddball                                    | Mechanically workable, but “Charm” or “Cute” would be closer |
| Dark Arts    | Arcane                                     | Direct conceptual match                                      |
| Super        | Sharpshooter currently has no close parity | This is the weakest mapping                                  |
| Beast        | Beast                                      | Direct match                                                 |

The project owner previously locked:

```text
Brawler → Tech → Oddball → Arcane → Beast → Sharpshooter → Brawler
```

That is a valid original cycle, but it is **not** a direct relabelling of the source wheel. The agent must preserve the project's locked wheel unless instructed otherwise.

## 8.3 Matchup UI

Before battle and during battle, show:

- type icon and text for every selected and opposing character;
- a visible type-wheel help panel;
- strong/weak indicators;
- an accessible text explanation;
- no reliance on colour alone;
- active matchup indicator beside the current opponent.

---

# 9. Action loadout and order customisation

## 9.1 Exactly three active powers

**VERIFIED**

Each figure has three active powers.

Those powers may be:

- direct attacks;
- buffs;
- heals;
- shields;
- control;
- bar manipulation;
- transformations;
- summons;
- delayed attacks;
- counters;
- pickup generation;
- hostile action disruption.

## 9.2 Cost and power tendency

**CORROBORATED**

Actions later on the bar generally require more waiting and tend to have greater impact. This is a tendency, not a requirement that every third action is raw damage or an “ultimate”.

A late action may instead be:

- a major team heal;
- a long disable;
- a transformation;
- a large bar drain;
- a group attack;
- a summon;
- a high-impact setup tool.

## 9.3 Level-10 order customisation

**CORROBORATED**

At level 10, the player may change the order of the figure's three powers.

This should be represented as a permutation of three actions across three authored positions:

```ts
type ThreeActionOrder = [ActionId, ActionId, ActionId];
```

There are six possible unique permutations when all three actions are distinct.

## 9.4 Reference versus extended profile

### `REFERENCE_THREE_SLOT`

- Three fixed cost positions per figure or ruleset.
- The player permutes the actions among those positions.
- Moving a power earlier makes it available sooner.
- The action's authored effect may scale, transform or remain constant according to explicit data.
- The UI shows exact result values before confirming.
- This is the closest source-equivalent profile.

### `EXTENDED_NINE_ANCHOR`

- Each of three broad bands has Low, Standard and High anchors.
- The player chooses one anchor within each band.
- This creates nine possible anchor labels while retaining three actions.
- This is an original project extension from the previous specification.
- Do not activate it by default while trying to reproduce source pacing.
- It can later become an advanced customisation mode.

## 9.5 Placement scaling

The source's exact rule for how moving a power changes strength is **UNKNOWN EXACT**.

The project must choose one of:

1. **Cost-only permutation:** moving a power changes only cost/timing.
2. **Cost and magnitude:** earlier is cheaper/weaker; later is slower/stronger.
3. **Authored variants:** each action has three explicit placement profiles.
4. **Restricted order:** actions may move only among allowed positions.

Recommended equivalent: explicit authored placement profiles because it avoids a universal formula breaking heals, shields, disables and multi-hit moves.

```ts
interface ActionPlacementProfile {
  positionId: "EARLY" | "MID" | "LATE";
  cost: number;
  damageScale?: number;
  healingScale?: number;
  durationScale?: number;
  statusChanceScale?: number;
  barMagnitudeScale?: number;
  chargeTimeScale?: number;
  addedEffects?: EffectDefinition[];
  removedEffects?: EffectTag[];
}
```

---

# 10. Action lifecycle

Every action must use the same deterministic lifecycle:

```text
IDLE
→ INPUT_ACCEPTED
→ VALIDATING
→ COST_RESERVED_OR_SPENT
→ TARGET_LOCKED
→ STARTUP
→ CHARGING / CHANNELING / MULTI_USE_BUILDUP / DELAYED_ARMING (optional)
→ COMMITTED
→ HIT_OR_EFFECT_RESOLUTION
→ RECOVERY
→ COMPLETE
```

Possible exits:

```text
VALIDATION_FAILED
CANCELLED_BEFORE_COMMIT
INTERRUPTED
TARGET_INVALID
OWNER_DEFEATED
BATTLE_ENDED
```

## 10.1 Instant action

- Short startup.
- Resolves once.
- May contain one or many hits.
- Can still be interrupted before its authored commit frame.

## 10.2 Purple charge-up action

**CORROBORATED**

- Visibly marked as a charge-style power.
- Begins an additional charge after selection.
- Damage during charge can interrupt it.
- Interrupting normally wastes the committed bar.
- Master Caster, Fast Cast and Insta-Caster-style chips specifically modify this system.
- Exact charge duration is action data.

## 10.3 Channel

- Applies repeated ticks during a duration.
- May heal, damage, drain or apply a status.
- Can be interruptible for the entire channel or only before first tick.
- Each tick can define its own dodge, critical, pickup and interruption behaviour.

## 10.4 Multi-hit

- Resolves a sequence of hits.
- Each hit may independently:
  - dodge;
  - lucky-hit;
  - apply secondary effects;
  - generate pickup rolls;
  - interrupt a charge;
  - trigger on-hit reactions.
- The action can stop on target defeat or retarget according to data.

## 10.5 Counter stance

- Applies a temporary reaction window.
- When a qualifying incoming event occurs, queue a counter action.
- Define whether the original hit is avoided, reduced or still taken.
- Prevent infinite counter recursion with reaction-depth guards.

## 10.6 Delayed or remote mine

- Places a delayed effect on the target or battlefield.
- Trigger may be elapsed time, opponent action, switch, hit count or manual detonation.
- Mine persists through switch only if authored.
- Damage rate upgrades affect tick rate or detonation magnitude, never both implicitly.

## 10.7 Summon or damage-over-time companion

- Creates a non-roster actor such as a robot, minion or persistent attacker.
- Summons cannot be selected or switched like figures.
- They have an owner, duration, tick/action schedule and dispel policy.
- They may trigger on-hit effects only when explicitly allowed.

## 10.8 Transformation

- Replaces or modifies the active figure's action set, stats, visuals or cost rules.
- Some source transformations are listed as no-cost.
- A transformation requires an explicit exit rule:
  - duration;
  - next action;
  - switch;
  - defeat;
  - manual cancel;
  - battle end.

## 10.9 Multi-use activation

Some powers require several selections before the payoff occurs.

Example abstraction:

```ts
interface MultiUseActivation {
  usesRequired: number;
  partialUseEffect?: EffectDefinition[];
  finalUseEffect: EffectDefinition[];
  resetOnSwitch: boolean;
  resetOnDefeat: boolean;
}
```

Source catalogue examples include powers requiring three uses.

## 10.10 Hack or disable

Two separate concepts:

- **Disable:** make one or more opponent actions unavailable.
- **Hack:** alter, replace, reorder, copy or corrupt opponent actions.

Permanent lock in the source catalogue likely means “for the rest of the duel” rather than permanent save damage. Project terminology must say `UNTIL_DUEL_END`.

## 10.11 Flight

Flight is a temporary defensive or targeting state. The exact source behaviour is not fully documented. The engine must support:

- dodge/evasion increase;
- immunity to ground-tagged actions;
- reduced incoming hit eligibility;
- visual elevation;
- duration;
- explicit counters.

Do not invent the final effect until tested or deliberately designed.

---

# 11. Exhaustive action-effect vocabulary

The community-maintained full figure catalogue reveals the following distinct mechanical vocabulary. Every item below requires an engine primitive, condition or modifier even if the initial roster does not use it.

## 11.1 Damage

- single-target direct damage;
- multi-hit direct damage;
- group/team damage;
- damage over time;
- channeled damage over time;
- remote mine damage;
- summon/minion damage;
- reflected damage;
- counterattack damage;
- self-damage;
- life-steal damage;
- fixed direct damage;
- type-neutral damage;
- shield-piercing damage;
- undodgeable damage;
- damage with bar depletion;
- damage with power decrease;
- damage with stun;
- damage with electrocution;
- damage with pickup chance;
- damage with hostile waffle chance;
- damage that scales per required use;
- delayed “surprise” damage;
- repeated bonus power over time.

## 11.2 Healing and health

- active-figure heal;
- team heal;
- channelled team heal;
- healing over time;
- bonus heart pickup;
- multiple bonus hearts over time;
- heal-on-shield-end;
- life-steal;
- heal on lucky hit;
- heal on dodge;
- revive between tournament rounds;
- maximum-health increase;
- temporary maximum-health increase;
- heal-effect amplification;
- heal block;
- effect-and-heal block;
- self-damage as a cost.

## 11.3 Protection

- finite shield;
- lasting shield;
- team shield;
- defence up;
- defence down;
- damage reflector;
- counter stance;
- dodge increase;
- flight;
- stun resistance;
- interruption resistance;
- immunity to a tagged status;
- one-hit protection;
- heal when a shield expires;
- no-dodge trade-off for more health;
- doubled dodge with halved health.

## 11.4 Power and critical behaviour

- flat Power increase;
- temporary Power increase;
- Power decrease;
- Power steal;
- bonus Power after dodge;
- bonus Power when damaged;
- bonus Power over time;
- starting Power buff;
- Lucky Duck / critical chance increase;
- double-luck effect;
- lucky hit plus stun;
- lucky hit plus heal;
- guaranteed or conditional undodgeable;
- bonus damage on an enhancement;
- type advantage amplification.

## 11.5 Control

- stun;
- longer stun;
- root/no-switch or no-movement-equivalent;
- action disable;
- duel-long action lock;
- action hack;
- effect/heal blocker;
- bar freeze;
- bar break;
- bar slow/curse;
- bar pause;
- electrocution;
- repeated minor interruption;
- forced action replacement;
- hostile waffle occupying/blocking an action;
- silence by action category;
- switch lock;
- transformation lock;
- clean/cleanse;
- team cleanse.

## 11.6 Tempo

- bar speed increase/dance;
- faster enhanced dance;
- bar slow/curse;
- flat or percentage bar drain;
- self-damage for bar fill;
- no-cost action;
- partial bar refund;
- full bar/accessory charge after defeat;
- action-generated battery;
- accessory charge acceleration;
- instant cast chance;
- faster charge time;
- interruption resistance;
- multi-use buildup;
- next-action cost waiver.

## 11.7 Pickup and hazard generation

- create beneficial tofu;
- increase tofu chance;
- generate a surprise bonus;
- generate a bonus heart;
- generate bonus Power;
- generate waffles;
- increase waffle chance;
- throw a waffle on defeat;
- throw waffles when dancing;
- battery drop;
- increase accessory charging;
- coin explosion;
- create a queued activatable pickup power.

## 11.8 Summons and persistent actors

- robot buddy;
- multiple robot buddies on defeat;
- dark minion;
- minion after each enemy defeat;
- beatbox object after a defeat;
- persistent chattering object;
- remote mine;
- repeated accessory actor;
- helper animal;
- delayed companion attack.

## 11.9 Enhancement modifiers found in the catalogue

- more Power increase;
- more duration;
- undodgeable;
- shield piercing;
- extra stun;
- tofu chance;
- waffle chance;
- percentage bar depletion;
- instant cast chance;
- extra heal;
- heal amount;
- faster bar effect;
- bonus heart;
- bonus Power;
- power decrease;
- counter on dodge;
- double luck;
- heal on end;
- no bar cost;
- damage rate;
- lasting shield duration;
- extra minion damage;
- permanent/duel-long lock;
- team cleanse duration.

---

# 12. Hit resolution

The exact source formula is unavailable. The project requires deterministic, testable order.

Recommended resolution:

```text
1. Confirm battle and source are valid.
2. Resolve target set from the locked target policy.
3. For each hit:
   a. evaluate immunity;
   b. evaluate dodge unless undodgeable;
   c. evaluate shield interception and shield piercing;
   d. evaluate type relationship;
   e. calculate base damage;
   f. evaluate lucky hit/critical;
   g. apply outgoing and incoming modifiers;
   h. round with a declared rule;
   i. apply HP loss;
   j. emit hit event;
   k. apply attached statuses according to dodge policy;
   l. roll or deterministically resolve pickup generation;
   m. trigger reactions, counters and interruption;
   n. process defeat;
4. Resolve end-of-action effects.
5. Enter recovery.
```

## 12.1 Deterministic randomness

All random checks must draw from a seeded PRNG stored in the battle log:

- dodge;
- lucky hit;
- status chance;
- tofu chance;
- battery chance;
- waffle chance;
- instant cast;
- interruption resistance;
- AI weighted choices;
- tournament reward choices.

A replay must reproduce the same result from:

```text
initial state + ruleset + seed + ordered command stream
```

## 12.2 Damage formula

Use a project formula, not Gemini's unverified defence formula.

Four-stat parity baseline:

```ts
raw = actionBaseDamage + attacker.power * action.powerRatio;
typed = raw * typeMultiplier;
lucky = typed * (didLuckyHit ? luckyMultiplier : 1);
modified = lucky * outgoingMultiplier * incomingMultiplier;
shieldResult = applyShield(modified, piercingProfile);
hpDamage = roundByRule(shieldResult.hpDamage);
```

No assignable Defence stat is required. Defence-up/down can modify `incomingMultiplier`.

## 12.3 Dodge

Required decisions:

- default dodge check is per hit, not per action;
- undodgeable bypasses the check;
- group attacks check each target independently;
- a dodge prevents ordinary damage;
- attached status policy is explicit:
  - `ON_HIT_ONLY`;
  - `EVEN_IF_DODGED`;
  - `ON_ACTION_RESOLVE`;
- dodge reactions resolve after the incoming hit is declared dodged;
- dodge cannot recursively dodge a counter unless the counter says so.

## 12.4 Lucky Duck

Required decisions:

- default lucky check is per hit;
- multi-hit actions may lucky-hit on some hits only;
- `Double Luck` can mean doubled probability or a second roll; choose one and state it;
- Lucky Duck presentation needs unique text, sound and impact treatment;
- Lucky Duck reactions occur after damage is determined but before defeat cleanup;
- a non-damaging action normally cannot lucky-hit unless explicitly tagged.

---

# 13. Status engine

## 13.1 Status ownership

Statuses can belong to:

- a figure;
- a side;
- the bar;
- an action slot;
- an accessory;
- a summon;
- the battle ruleset.

## 13.2 Duration models

Support:

- real-time seconds;
- number of hits;
- number of actions;
- number of switches;
- until shield breaks;
- until owner leaves active position;
- until target leaves active position;
- until duel end;
- until manually cleansed;
- permanent for tournament run;
- next-round only.

## 13.3 Stacking policies

Each status definition declares:

```ts
type StackingPolicy =
  | "REJECT"
  | "REFRESH_DURATION"
  | "ADD_DURATION"
  | "REPLACE_IF_STRONGER"
  | "STACK_MAGNITUDE"
  | "STACK_INDEPENDENT_INSTANCES"
  | "STACK_TO_CAP";
```

## 13.4 Required status definitions

At minimum:

- `POWER_UP`;
- `POWER_DOWN`;
- `POWER_STOLEN`;
- `DEFENCE_UP`;
- `DEFENCE_DOWN`;
- `DODGE_UP`;
- `LUCK_UP`;
- `BAR_HASTE`;
- `BAR_SLOW`;
- `BAR_FROZEN`;
- `STUNNED`;
- `ROOTED`;
- `NO_SWITCH`;
- `HEAL_BLOCKED`;
- `EFFECT_BLOCKED`;
- `DAMAGE_OVER_TIME`;
- `ELECTROCUTED`;
- `SHIELDED`;
- `LASTING_SHIELD`;
- `DAMAGE_REFLECT`;
- `COUNTER_STANCE`;
- `FLYING`;
- `ACTION_DISABLED`;
- `ACTION_HACKED`;
- `NEXT_ACTION_FREE`;
- `NEXT_ATTACK_POWERED`;
- `INTERRUPT_RESIST`;
- `CHARGE_SPEED_UP`;
- `REGENERATING`;
- `TRANSFORMED`;
- `TOFU_RATE_UP`;
- `ACCESSORY_RATE_UP`;
- `WAFFLE_HAZARD`;
- `CLEANSE_IMMUNITY_WINDOW`.

## 13.5 Cleanse

A cleanse definition declares which categories it removes:

```ts
interface CleanseProfile {
  removableTags: StatusTag[];
  protectedTags: StatusTag[];
  target: "ACTIVE_ALLY" | "TEAM" | "SELF";
  grantsImmunitySeconds?: number;
}
```

Do not make every negative state removable. A duel-long authored lock, tournament injury or story rule may be uncleanseable.

---

# 14. Beneficial tofu pickups

## 14.1 Separate system

**VERIFIED / CORROBORATED**

Tofu blocks can drop during combat. The player taps or collects one to gain a temporary activatable bonus power. Tofu is beneficial and must not be conflated with hostile waffles or bar curses.

## 14.2 Known tofu effect families

Documented effect families include:

- damage/Power bonus;
- immediate healing;
- removal of enemy effects or allied cleanse;
- faster battle-bar progress;
- shield;
- freeze and break the opponent bar;
- other temporary bonus powers.

The exact source pickup list, drop table and probabilities are **UNKNOWN EXACT**.

## 14.3 Pickup queue

Recommended project behaviour:

- A dropped pickup appears for a limited time.
- Tapping it adds its power to a side-owned queue.
- The queue holds one active pickup by default.
- Collecting another while full either:
  - replaces after confirmation;
  - stacks up to a cap;
  - converts to a smaller instant effect;
  - is disallowed.
- The queued power has its own battle button.
- Activating it does not use normal bar unless the pickup explicitly says so.
- Pickup powers expire at duel end.
- AI can see and use its own pickups under the same rules.

## 14.4 Generation events

Support pickup generation from:

- a resolved hit;
- an action enhancement;
- a specific “Tofu!” action;
- a mod chip;
- a summon;
- a tournament modifier;
- a defeated opponent;
- an accessory;
- scripted story battle conditions.

Community strategy discussion suggests rapid multi-hit or cheap first-slot attacks generate more pickup opportunities. The project must explicitly decide whether chance is:

- per action;
- per successful hit;
- per damage event;
- per fixed elapsed interval.

Recommended parity feel: per successful damaging hit with per-action caps to prevent runaway multi-hit dominance.

---

# 15. Battery pickups and accessory charging

## 15.1 Battery drops

**CORROBORATED**

Batteries randomly drop during battle and contribute to the separately charged accessory. Attacking also charges the accessory.

Treat a battery as distinct from tofu:

| Pickup            | Purpose                                      |
| ----------------- | -------------------------------------------- |
| Tofu              | Grants an activatable temporary battle power |
| Battery           | Adds accessory charge                        |
| Heart/Power bonus | Immediate or queued authored reward          |
| Waffle            | Hostile disruption applied to the opponent   |

## 15.2 Charge sources

An accessory may gain charge from:

- action completion;
- each successful hit;
- battery pickup;
- an explicit action effect;
- a Living Battery-style mod;
- ally defeat through Comeback;
- a tournament modifier;
- passive time, if an accessory explicitly allows it.

## 15.3 Charge display

Display:

- icon;
- current/maximum charge;
- charge gained event;
- ready state;
- remaining uses;
- tournament exhaustion;
- opponent accessory and charge when normal rules permit.

---

# 16. Hostile waffles, curses and action disruption

These are three different mechanics.

## 16.1 Waffle hazard

**CORROBORATED**

Waffles can temporarily block one of the opponent's powers. Actions and accessories can generate them.

Project representation:

```ts
interface ActionSlotHazard {
  slotIndex: 0 | 1 | 2;
  kind: "WAFFLE";
  expiresBy: "TIME" | "USE" | "CLEANSE" | "DUEL_END";
  durationSeconds?: number;
  clearCost?: number;
}
```

Exact source clearing behaviour is **UNKNOWN EXACT**. Do not assert that a player must always spend the full action cost to clear it unless measured.

Recommended equivalent:

- The blocked action icon is replaced or covered by the hazard.
- The player may clear it with a dedicated tap after the bar reaches a small clear threshold, or wait for expiry.
- A cleanse can remove it.
- Waffle generation never deletes the underlying action permanently.
- Multiple waffles obey a cap.

## 16.2 Curse

A curse affects bar behaviour, usually by reducing speed or applying a persistent hostile bar condition. It does not inherently replace an action icon.

## 16.3 Disable

Disables one or more actions for a duration or until duel end. It may be:

- slot-index based;
- action-ID based;
- category based;
- random;
- chosen by the attacker.

## 16.4 Hack

A hack can:

- swap action positions;
- temporarily replace an action;
- copy an action;
- corrupt costs;
- hide action information;
- force a random action;
- disable the most expensive action.

Only implement the specific behaviour authored for the game's original equivalent.

---

# 17. Accessories

## 17.1 Source shape

**VERIFIED / CORROBORATED**

- A side equips a battle accessory separately from figure actions.
- Both player and opponent can have one.
- It has an independent charge system.
- It charges through attacking and battery pickups.
- Once ready, the player activates it manually.
- Accessories can produce high-impact, match-shaping effects.
- Examples publicly described include repeated bar freezing, team-HP increase and temporary power blocking.

## 17.2 Known named examples

These names are source references only and must not be copied into original shipped content:

| Source item                             | Publicly described mechanical family                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------- |
| Lil' Penguin                            | Repeatedly interferes with/freezes the opponent bar                                           |
| Titan Coin                              | Increases team HP                                                                             |
| Reference technologist's Waffle Shooter | Temporarily blocks one opponent power                                                         |
| Bat Signal                              | High-impact battle assistance; exact effect requires verification                             |
| Reference powerhouse's Underpants       | Officially named as an accessory; exact effect requires verification                          |
| Reference occultist's Spell Book        | Persistent curse-oriented accessory according to community strategy                           |
| HIVE Chip/Coin                          | Persistent tempo or energy interaction according to community discussion                      |
| Kryptonite                              | Persistent anti-Super or weakening effect is plausible but exact effect requires verification |
| Mother Box                              | Community rates it highly; exact effect requires direct capture                               |
| Purple Lantern                          | Reported in early versions; effect and patch state require direct capture                     |
| Darkseid-themed accessory               | Community mentioned; exact effect requires direct capture                                     |

## 17.3 Accessory archetypes required by the engine

- direct neutral damage;
- repeated periodic damage;
- single-target stun;
- repeated bar freeze;
- immediate bar break;
- hostile waffle;
- curse/bar slow;
- whole-team maximum-HP increase;
- whole-team heal;
- whole-team shield;
- cleanse;
- full bar;
- generated tofu;
- summon/persistent actor;
- status immunity;
- type-specific weakening;
- opponent action disable;
- revive;
- tournament recovery;
- passive persistent field.

## 17.4 Tournament accessory attrition

**COMMUNITY-CATALOGUED**

In tournaments, an accessory can be used only once for the entire run. With six registered figures/accessory slots available, this permits at most six distinct accessory uses.

Project equivalent:

- Register up to six accessories with the six-character tournament roster.
- An accessory is assigned to a registered character or roster slot.
- Before each duel, select one unused registered accessory.
- Once activated, mark that accessory exhausted for the run.
- An exhausted accessory cannot be selected again unless a reward explicitly refreshes it.
- The accessory may remain unused and preserved if the duel ends before activation.
- Story tournaments may change the inventory cap.

This creates a meaningful “save it for later” decision comparable to persistent HP.

---

# 18. Mod chips

## 18.1 Source rules

**CORROBORATED**

- One mod chip can be installed on a figure.
- The system unlocks around level 5.
- Chips can grant stats, passive reactions, entry effects, type-specific effects, economy effects, charge modifications and defeat triggers.
- In the source, removing a chip destroys it.
- Some chips are restricted to a class.
- Chip rarity/tier is represented as Bronze, Silver and Gold.

## 18.2 Project economy decision

Default project rule remains:

- one modification slot;
- reusable chips;
- no destruction on unequip;
- cannot change during an active tournament;
- exact comparison shown before equipping.

Reason: destructive unequip discourages experimentation and is not necessary to reproduce combat strategy.

A `HARDCORE_SOURCE_ECONOMY` ruleset may enable destruction for a challenge mode, but it is not the default.

## 18.3 Community-catalogued chip list

The following list reflects player-transcribed in-game text and may contain spelling or wording errors.

### Bronze

| Chip            | Effect                       |
| --------------- | ---------------------------- |
| Quack Quack     | +3 Lucky Duck chance         |
| Sleepy Duck     | Lucky Duck hits briefly stun |
| Smokescreen     | +3 Dodge                     |
| Healthy Chip    | +5 Health                    |
| Tough Guy       | +1 Power                     |
| Simply Stunning | Stun effects last longer     |

### Silver: type-specific

| Chip                  | Restriction  | Effect                                          |
| --------------------- | ------------ | ----------------------------------------------- |
| Smoky Chip            | Martial Arts | Start with a smoke/dodge increase               |
| Power Dodge           | Martial Arts | Dodging grants a Power boost to the next attack |
| Beast Mode            | Beast        | Chance to receive a Power boost when damaged    |
| Beastly               | Beast        | Start with a damage/Power buff                  |
| Super Stun Resister   | Super        | Chance to resist stun                           |
| Super Stunner         | Super        | Start by stunning the opponent                  |
| Regenerating Cuteness | Cute         | Slowly regenerate HP while active               |
| Adorable Entrance     | Cute         | Start with a damage-reflection/cuteness effect  |
| Robo Avengers         | Tech         | Summon two robot buddies when defeated          |
| Curse Chip            | Dark Arts    | Start by cursing the opponent's bar             |

### Silver: general

| Chip             | Effect                                                              |
| ---------------- | ------------------------------------------------------------------- |
| Master Caster    | Chance to resist interruption while charging a purple action        |
| Fast Cast        | Purple charge time is faster                                        |
| Insta-Caster     | Chance for a purple charge action to activate instantly             |
| Coinsplosion     | Defeated opponents generate bonus coins                             |
| Living Battery   | Accessory charges faster while this figure is active                |
| Heavenly Waffle  | Throw a waffle when defeated                                        |
| Pointy           | Opponent takes fixed retaliation damage when this figure is damaged |
| Smokescreen 2.0  | Larger Dodge increase                                               |
| Beatbox Party    | Summon a beatbox after defeating an opponent                        |
| Tofu Lover       | Tofu is more likely while active                                    |
| Tough Guy 2.0    | Larger Power increase                                               |
| Healthy Chip 2.0 | Larger Health increase                                              |
| Healthy Duck     | Lucky Duck hits heal the user                                       |
| Healthy Dodge    | Dodging heals the user                                              |
| Hello, Nurse     | Healing actions are more effective                                  |
| Just Gotta Dance | Start the battle with a bar-speed dance                             |

### Gold

| Chip                              | Effect                                                        |
| --------------------------------- | ------------------------------------------------------------- |
| Haxxor                            | Tech-only; start with a robot buddy                           |
| Necromancer                       | Summon a dark minion whenever this figure defeats an opponent |
| Reference technologist's Ultimate | Dancing also throws waffles                                   |
| Ninja Skills                      | Double Dodge but halve Health                                 |
| Comeback                          | On defeat, fully charge the team's accessory                  |
| Grumpy                            | Large Power increase with large Health reduction              |
| Tough Stuff                       | Increase Health but prevent all dodging                       |

## 18.4 Engine trigger vocabulary from chips

The passive engine must support triggers:

- `ON_BATTLE_START`;
- `ON_SWITCH_IN`;
- `WHILE_ACTIVE_TICK`;
- `ON_DAMAGE_RECEIVED`;
- `ON_DODGE`;
- `ON_LUCKY_HIT`;
- `ON_ACTION_START`;
- `ON_CHARGE_INTERRUPTION_CHECK`;
- `ON_ACTION_COMPLETE`;
- `ON_ENEMY_DEFEATED`;
- `ON_OWNER_DEFEATED`;
- `ON_PICKUP_ROLL`;
- `ON_ACCESSORY_CHARGE_GAIN`;
- `ON_DANCE_APPLIED`;
- `ON_HEAL_CALCULATED`.

Each chip must be authored as data using reusable triggers and effects, not a character-specific conditional in the combat loop.

---

# 19. Figure enhancement

## 19.1 Source shape

**CORROBORATED**

- Enhancement becomes available at level 5.
- Other owned figures can be fed/sacrificed into the target figure.
- The same figure or similar figures provide more enhancement progress.
- Enhancement improves the target figure's individual powers.
- Each of the three powers has two visible rank-up steps described by community players as Gold and Shiny.
- The second step often adds a qualitative effect such as undodgeable, shield piercing, bar depletion, extra duration, pickup chance or instant casting.
- Enhancement belongs to the individual owned figure, not necessarily the definition globally.

## 19.2 Project equivalent tiers

Use original presentation names:

1. **Base**
2. **Enhanced**
3. **Mastered**

Internal migration aliases may accept:

- Stock → Base;
- Gold → Enhanced;
- Platinum/Shiny → Mastered.

## 19.3 Upgrade resource

Recommended project rule:

- Duplicates may be retained as independent figures.
- Unwanted figures may be converted to Enhancement Cores.
- Same-definition sacrifice gives a large affinity bonus.
- Same type or trait gives a smaller affinity bonus.
- Favourited, active-roster, locked or tournament-registered figures cannot be consumed without explicit removal and confirmation.
- Enhancement preview shows exact action changes.
- No random failure chance.
- No paid-only resource.
- A non-destructive “extract core” preview is shown before confirmation.

## 19.4 Action-specific enhancements

Do not implement enhancement as a universal `+10%`.

Each rank may:

- increase damage;
- increase healing;
- increase shield;
- add or increase bar drain;
- add stun;
- extend status;
- make undodgeable;
- pierce shields;
- add pickup chance;
- add waffle chance;
- add cleanse duration/immunity;
- add instant cast chance;
- increase charge speed;
- add bonus heart/Power;
- add counter-on-dodge;
- add heal-on-end;
- remove bar cost;
- add a target;
- convert single-target to group;
- improve summon damage;
- improve mine tick rate;
- make an action lock last until duel end.

---

# 20. Repaints and variants

## 20.1 Repaints

**VERIFIED**

- Figures can have several palette or costume colour schemes.
- Repaint tokens unlock them.
- Repaints are cosmetic.
- A repaint changes the figure's appearance without changing combat statistics.
- New repaint styles were added in updates.

Project rules:

- never sell statistical power through a cosmetic;
- every repaint can be previewed on portrait, card, selection pedestal and battle art;
- repaint ownership belongs to the character definition or instance according to an explicit rule;
- AI and opponents can display repaints;
- silhouette, colour-blind and contrast checks still apply.

## 20.2 True variants

The source also contains mechanically distinct versions of characters. A true variant is a separate definition with its own:

- type;
- actions;
- stats;
- team tags;
- enhancement profiles;
- art.

Do not model true variants as repaints.

---

# 21. Team combinations

## 21.1 Source shape

**COMMUNITY-CATALOGUED and visually supported**

- Selecting related figures can activate a named team bonus.
- The bonus can trigger with two members and become stronger with three.
- Bonuses affect Health, Power, Luck or Dodge.
- The source appears to resolve only one active team bonus even if several combinations match.
- Full three-member combinations take priority over two-member combinations.
- Special exclusive pairs can override ordinary partial matches.
- A fixed priority list resolves ties.

This is substantially different from allowing every matching trait to stack.

## 21.2 Community-catalogued examples

| Combo           | Two-member bonus | Full combo bonus | Membership concept          |
| --------------- | ---------------: | ---------------: | --------------------------- |
| Urban allies    |        +3 Health |        +6 Health | Allied city heroes          |
| Core heroes     |        +2 Health |        +3 Health | Main hero team and variants |
| Retro           |          +2 Luck |          +5 Luck | Period variants             |
| Tech collective |         +1 Power |         +2 Power | Shared organisation         |
| Urban rivals    |         +1 Power |         +2 Power | City villains               |
| Villains        |         +1 Power |         +2 Power | Broad villain tag           |
| Multiverse      |         +1 Power |         +2 Power | Multiverse variants         |
| Aquatic         |          +2 Luck |          +5 Luck | Aquatic Characters          |
| Allied heroes   |          +2 Luck |          +5 Luck | Allied hero team            |
| Young heroes    |         +1 Power |         +2 Power | Younger hero team           |
| Secret society  |          +3 Luck |          +6 Luck | Joke grouping               |

Exclusive pair examples:

| Combo           |     Bonus |
| --------------- | --------: |
| Rival affection | +5 Health |
| Unexpected pair | +3 Health |
| Comic duo       | +5 Health |
| Family first A  | +5 Health |
| Family first B  | +5 Health |
| Siblings        | +5 Health |
| Chaotic pair    | +5 Health |

## 21.3 Project implementation

Support both systems:

### Named combos

```ts
interface TeamComboDefinition {
  id: string;
  displayName: string;
  requiredMemberTags?: string[];
  allowedDefinitionIds?: string[];
  minimumMembers: 2 | 3;
  fullMembers?: 3;
  bonusAtTwo?: EffectDefinition[];
  bonusAtThree?: EffectDefinition[];
  priority: number;
  exclusive: boolean;
}
```

### Broad traits

The project can retain Hero, Villain, Monster, Mythic, Historic and Icon as scalable tags.

Recommended rule:

- Resolve all qualifying named combos.
- Select the highest-priority named combo.
- If no named combo qualifies, resolve one broad-trait synergy.
- Do not stack multiple full bonuses by default.
- Show the chosen combo and explain why competing combos did not activate.
- Quick Match may expose a “stack all synergies” experimental modifier.

---

# 22. Character collection and individual instances

## 22.1 Scale

**VERIFIED**

The sequel advertises more than 100 collectible figures.

Engine requirements:

- support at least 500 definitions without UI redesign;
- support duplicate owned instances;
- support separate level, stats, mod chip and enhancements per instance;
- support cosmetic repaint ownership;
- support collection completion;
- support locked silhouettes;
- support hidden unlocks;
- support favourites and locking;
- support sort/filter/search.

## 22.2 Figure acquisition

Non-map equivalents may award figures through:

- first clear;
- story node;
- tournament completion;
- achievement;
- daily/weekly mission;
- store purchase;
- transparent mystery bundle;
- challenge condition;
- ranked milestone;
- imported legacy reward;
- duplicate conversion;
- starter choice.

## 22.3 Duplicate uses

A duplicate can be:

- retained and built differently;
- assigned to a different loadout;
- fed to enhancement;
- converted to cores;
- sold/trashed for currency;
- used to unlock a cosmetic;
- required by a mission;
- protected from consumption.

No operation may silently destroy a built figure.

## 22.4 Selling/trashing

Community discussion confirms a collection-menu disposal operation.

Project safety rules:

- use `Convert` or `Release`, not a visually ambiguous trash button;
- show exact refund;
- show level, upgrades and equipped items being lost;
- return reusable mod chips;
- block favourites/locks;
- require long-press or second confirmation for rare/high-level figures;
- provide a short undo window outside cloud synchronisation;
- maintain audit log in save data.

---

# 23. Character management screen

A source-inspired management screen contains:

- a scrollable collection grid/pegboard;
- owned character cards with portrait and level;
- locked or unknown figures;
- selected full figure on a pedestal;
- selected name;
- type icon;
- level and XP bar;
- four stat rows;
- three action icons;
- enhancement entry;
- mod-chip entry;
- level-10 action-order lock or editor;
- repaint controls;
- equip/add-to-squad control;
- current squad strip;
- currency display;
- back/navigation control.

## 23.1 Required project layout

### Desktop/landscape

```text
+--------------------------------------------------------------------------------+
| BACK | COLLECTION | Search | Filters | Sort | Currency | Completion            |
+-------------------------------+------------------------------------------------+
| COLLECTION GRID               | SELECTED CHARACTER                              |
| [card][card][card][card]      | Name | Lv | XP | Type | Trait(s)                |
| [card][card][card][card]      | Large portrait/pedestal                          |
| [card][card][card][card]      | Health | Power | Dodge | Luck                    |
|                               | Action 1 | Action 2 | Action 3                    |
|                               | Enhance | Mod | Repaint | Action Order            |
|                               | Favourite | Lock | Compare | Add/Remove Squad     |
+-------------------------------+------------------------------------------------+
| ACTIVE ROSTER / LOADOUT STRIP                                                |
+--------------------------------------------------------------------------------+
```

### Mobile/portrait

Use tabs or a two-stage flow:

1. collection grid;
2. selected-character detail drawer/full screen.

Do not cram all desktop controls into a scaled-down panel.

## 23.2 Filters

At minimum:

- owned/locked;
- level;
- type;
- trait;
- named team tag;
- action role;
- heal;
- shield;
- stun;
- bar control;
- group damage;
- charge action;
- enhancement tier;
- mod equipped;
- favourite;
- duplicate count;
- repaint completion.

## 23.3 Comparison

Allow comparison between two owned instances showing:

- level;
- four stats;
- action order/costs;
- exact action values;
- enhancement;
- mod;
- team tags;
- repaint;
- current loadout membership;
- tournament lock.

---

# 24. Battle squad-selection menu

## 24.1 Source visual language

**VERIFIED BY SCREENSHOTS**

The squad-selection screen presents:

- three selected figures standing on toy-like bases/pedestals;
- a horizontal roster of available figure portraits/cards;
- visible level indicators;
- player avatar/identity;
- a prominent start/GO control;
- type/team-combination graphics behind or around the selected team;
- named team-combo badge;
- visible bonus icons and numbers on selected figures;
- direct tap-based replacement of squad positions.

## 24.2 Required information architecture

The selection screen must answer before the player starts:

1. Who is on my team?
2. Who is on the enemy team?
3. Which figure starts active?
4. What are the type matchups?
5. What named combo or trait synergy activates?
6. What bonus does it provide?
7. Which accessory is selected?
8. Are all figures legal for this mode?
9. Is HP persistent from a tournament?
10. Which figures or accessories are exhausted/defeated?
11. What rewards and battle modifiers apply?
12. Can the loadout be saved?

## 24.3 Standard selection screen

```text
+--------------------------------------------------------------------------------+
| BACK | MODE / NODE NAME | Enemy preview | Rules / Modifiers | HELP              |
+--------------------------------------------------------------------------------+
|                 SELECTED TEAM: 1 / 2 / 3 FIGURES                               |
|        [ SLOT 1 ]             [ SLOT 2 ]              [ SLOT 3 ]               |
|        Start Active           Tap to replace           Tap to replace           |
|        HP / Level / Type      HP / Level / Type        HP / Level / Type        |
|                                                                                |
| Team Combo: [Name] [Exact bonus]   Type coverage: [strong/weak warnings]        |
+--------------------------------------------------------------------------------+
| ACCESSORY: [icon/name] [effect] [uses/charge rules] [change]                    |
+--------------------------------------------------------------------------------+
| Search | Type | Trait | Role | Level | Favourite | Legal only | Sort            |
| [roster cards ... horizontally or grid]                                         |
+--------------------------------------------------------------------------------+
| [Auto Build] [Loadout] [Clear]                                  [START BATTLE]  |
+--------------------------------------------------------------------------------+
```

## 24.4 Selection interactions

- Tap an empty slot then tap a roster card.
- Tap a filled slot to make it the replacement target.
- Drag-and-drop may be added but cannot be the only method.
- Tap a selected figure to choose starting active.
- Tap a roster card's info affordance to inspect without selecting.
- Long-press is optional and must have a discoverable alternative.
- Illegal choices explain the exact rule.
- A type-warning does not block starting.
- Start remains disabled only for hard legality failures.
- Team combo updates immediately.
- Enemy preview can be expanded to show actions in modes where scouting is allowed.
- Tournament screen shows current HP, defeated state and locked build snapshot.
- Quick Match Sandbox can level-scale or normalise from this screen.

---

# 25. Battle HUD

## 25.1 Composition

Required layers:

### Opponent area

- active enemy figure;
- active HP;
- level;
- type;
- statuses;
- bench portraits and HP;
- enemy accessory and charge;
- enemy battle bar;
- enemy three action icons;
- enemy cast/channel progress.

### Centre arena

- active figures;
- hit effects;
- summons/mines;
- pickups;
- status icons;
- damage/heal text;
- switch and defeat presentation;
- pause access.

### Player area

- active player figure;
- active HP;
- type;
- statuses;
- bench portraits with tap-to-switch;
- player battle bar;
- three actions;
- queued tofu power;
- accessory;
- combo/synergy indicator where useful.

## 25.2 Action button states

- unavailable: bar below cost;
- ready: bar at or above cost;
- charging: selected and filling secondary charge;
- channeling: repeated resolution;
- disabled: blocked by status;
- waffled: covered by hostile hazard;
- hacked: altered and visibly marked;
- multi-use: progress pips shown;
- no-cost: free marker;
- target invalid: red/blocked state;
- enhanced: visible rank trim without obscuring readability.

## 25.3 Feedback

Every important event needs:

- immediate visual response;
- distinct sound;
- battle-log event;
- accessibility text/event cue;
- inspectable explanation in pause/help.

Events include:

- action ready;
- target lock;
- charge start;
- interruption;
- dodge;
- Lucky Duck;
- type advantage;
- shield absorb;
- shield break;
- bar drain;
- bar freeze/break;
- tofu/battery drop;
- pickup collect;
- accessory ready;
- waffle block;
- cleanse;
- defeat;
- team combo activation;
- victory;
- loss.

---

# 26. Tournament mode

## 26.1 Source shape

**CORROBORATED / COMMUNITY-CATALOGUED**

- Tournaments consist of multiple consecutive duels.
- The player prepares a broader roster, commonly six figures.
- Individual duels still use up to three.
- HP carries between duels.
- Defeated figures remain unavailable unless revived.
- Later opponents are generally harder.
- The run ends when a required duel is lost.
- Between battles, the player can receive recovery or improvement tofu/options.
- Battle-wide modifiers can alter a duel.
- Figures can gain XP and level during the run.
- Accessories have run-level attrition and cannot be reused after activation.
- Tournament wins grant significant rewards and sometimes unique figures.

## 26.2 Registration

At tournament start, snapshot:

```ts
interface TournamentRegistration {
  registeredCharacters: CharacterBuildSnapshot[]; // up to 6
  registeredAccessories: AccessorySnapshot[]; // up to 6
  startingCurrency?: number;
  difficulty: DifficultyId;
  seed: string;
}
```

A build snapshot includes:

- level;
- four stats;
- action order;
- action enhancement;
- mod chip;
- repaint;
- starting HP;
- eligibility tags.

No build changes during a run unless an explicit tournament reward permits them.

## 26.3 Duel preparation

Before each duel:

- preview opponent team according to scouting rules;
- show persistent HP;
- show defeated figures;
- select one to three living registered figures;
- choose starting active;
- choose one unused accessory;
- show modifier;
- show reward;
- allow forfeiting the run.

## 26.4 Persistent state

Persist:

- HP;
- defeated state;
- temporary tournament injuries;
- tournament-only buffs;
- XP and level-ups;
- unused/used accessory state;
- consumable recovery inventory;
- route/node progress;
- run currency;
- score;
- seed;
- reward history.

Normal duel statuses expire unless explicitly tagged `PERSIST_TOURNAMENT`.

## 26.5 Between-fight choices

Support reward options such as:

- heal one figure;
- heal all living figures;
- revive one defeated figure;
- increase maximum HP for the run;
- increase Power for the run;
- increase Dodge or Luck;
- restore an accessory;
- gain a new accessory;
- remove an injury;
- gain coins;
- gain enhancement resource;
- preview the next opponent;
- reroll reward choices;
- skip reward for score multiplier.

## 26.6 Battle modifiers

Community descriptions indicate modifiers from whole-duel bar speed changes to hazards such as damaging Joker teeth.

Required modifier primitives:

- both bars fill faster;
- both bars fill slower;
- player bar advantage;
- opponent bar advantage;
- periodic damage to both active figures;
- periodic hazards;
- reduced healing;
- increased pickup drops;
- no tofu;
- no accessories;
- action-cost shifts;
- type relationship amplified;
- forced team size;
- one action category disabled;
- bench damage;
- starting shields;
- escalating Power over time;
- sudden-death timer;
- boss rule;
- enemy reinforcements.

## 26.7 Loss and run completion

- Losing a required duel ends the run by default.
- Optional second-chance tokens must be authored and limited.
- Show run summary:
  - duels won;
  - damage;
  - remaining HP;
  - figures lost;
  - accessories used;
  - pickups;
  - rewards;
  - score;
  - XP;
  - unlocks.
- Return all temporary run state cleanly.
- Permanent XP/rewards already earned remain according to the ruleset.

---

# 27. Quick Match

The source game's multiplayer update offered random online battles, friend battles and CPU battles. The user's required equivalent is broader and menu-first.

## 27.1 Quick Match variants

### Sandbox

- all characters available;
- all actions/enhancements/mods/accessories available;
- choose exact levels or normalise;
- choose 1v1, 2v2 or 3v3;
- select player and CPU teams;
- select arena and music;
- change bar fill, damage, pickup and timer rules;
- no profile rewards by default;
- deterministic seed can be entered;
- replay and share battle setup.

### Profile

- owned collection only;
- uses built character instances;
- grants XP and currency;
- optional matchmaking or CPU difficulty;
- anti-farming reward decay;
- mission progress.

### Preset challenge

- authored opponent;
- fixed modifiers;
- fixed or restricted roster;
- scoring;
- one-time and repeat rewards.

## 27.2 Optional online parity

Not required for MVP, but the architecture may later support:

- random matchmaking;
- friend/private code;
- CPU practice;
- safe generated usernames;
- visible rank;
- seasonal rewards;
- exclusive cosmetic or character milestones;
- deterministic lockstep or authoritative server;
- reconnect;
- anti-cheat validation;
- balance rules separate from story;
- emotes/preset communication only.

Online mode must not be required for collection completion unless offline alternatives exist.

---

# 28. Story mode without exploration

## 28.1 Source functions to preserve

Even with no map, Story Mode should retain:

- authored main missions;
- optional side missions;
- character-specific challenges;
- battle composition requirements;
- win-condition variations;
- tournament gates;
- shops;
- figure rewards;
- accessory rewards;
- mod-chip rewards;
- repaint rewards;
- dialogue;
- humorous scenes;
- secret conditions;
- replay;
- post-game challenge chains;
- high-level rematches;
- chapter completion.

## 28.2 Story graph node types

```ts
type StoryNodeType =
  | "DIALOGUE"
  | "CHOICE"
  | "BATTLE"
  | "TOURNAMENT"
  | "SHOP"
  | "REWARD"
  | "LOADOUT_CHECK"
  | "MISSION_BOARD"
  | "CUTSCENE"
  | "TUTORIAL"
  | "CHALLENGE"
  | "ENDING"
  | "SECRET";
```

## 28.3 Mission objective vocabulary

Support:

- win a duel;
- win with a named character;
- win with one figure;
- win with exactly two/three figures;
- use three figures sharing a type;
- use three figures sharing a trait/team tag;
- defeat a specified enemy;
- finish with a specified figure active;
- do not lose a figure;
- win under a time limit;
- win without an accessory;
- use an accessory;
- use a tofu power;
- generate/clear a waffle;
- land a number of Lucky Ducks;
- dodge a number of hits;
- interrupt a charge;
- win with remaining HP threshold;
- perform a number of switches;
- use a charge action;
- use only early/mid/late actions;
- defeat an enemy with damage over time;
- win with a specific team combo;
- fully enhance a figure;
- equip a specified modification family;
- buy/convert/collect figures;
- complete a tournament;
- reach a level;
- collect an archetype;
- solve a dialogue/choice condition.

## 28.4 Daily and rotating missions

The source includes a daily mission board.

Project equivalent can include:

- three daily objectives;
- one weekly challenge;
- no map-dependent delivery tasks;
- transparent expiry shown in local and UTC time where displayed;
- no paid refresh;
- reroll one objective per day;
- objectives generated only from unlocked mechanics;
- accessibility-friendly alternatives;
- rewards capped to avoid compulsory daily play.

---

# 29. Economy and stores

## 29.1 Source shape

- Coins are earned from battles and missions.
- Coins purchase figures and other content.
- Different stores offer different inventories.
- Mystery packs/eggs can contain random figures, accessories and repaint tokens.
- Rare figures and extra repaint tokens were available through in-app purchases.
- The premium game was reportedly completable without buying IAP.
- Figures can be sold/trashed.
- Duplicate figures have enhancement value.

## 29.2 Project rule

No manipulative monetisation.

- Premium or free demo model is separate from combat balance.
- No paid random loot.
- Earnable mystery bundles require published odds and duplicate protection.
- Every gameplay item has a deterministic acquisition path.
- Cosmetics may be sold only if clearly cosmetic.
- No energy/stamina system limiting play.
- No paid respec.
- No paid tournament continues.
- No paid enhancement failure prevention.

## 29.3 Menu-driven stores

Store definition:

```ts
interface StoreDefinition {
  id: string;
  title: string;
  unlockCondition: ConditionDefinition;
  inventoryMode: "FIXED" | "ROTATING" | "WEIGHTED" | "STORY";
  refreshRule?: RefreshRule;
  offers: OfferDefinition[];
  duplicateProtection?: DuplicateProtectionRule;
}
```

Offer categories:

- known character;
- mystery character;
- enhancement core;
- mod chip;
- accessory;
- repaint token;
- specific repaint;
- tournament recovery item;
- bundle;
- cosmetic.

---

# 30. Rewards and post-battle flow

## 30.1 Victory

Source-style victory includes:

- remaining active figure celebration/dance;
- coin reward;
- XP for participants;
- mission progress;
- unlocks;
- level-up prompts;
- possible figure/reward;
- tournament continuation.

Project victory flow:

```text
LAST ENEMY DEFEATED
→ finish queued mandatory effects
→ freeze combat input
→ victory presentation
→ battle statistics
→ XP allocation
→ sequential level-up decisions
→ currency/items
→ mission progress
→ unlocks
→ next node / rematch / exit
```

## 30.2 Defeat

- No normal victory rewards.
- Profile modes may give reduced XP or currency if the project rules allow it.
- Story first-clear rewards require victory.
- Tournament defeat follows run-loss rules.
- Show useful cause-of-loss information:
  - damage sources;
  - unused accessory;
  - type disadvantages;
  - interrupted charges;
  - disabled actions;
  - suggested legal changes.
- Never automatically spend a continue resource.

## 30.3 Battle statistics

Track:

- actions used by ID;
- bar spent;
- bar wasted while capped;
- damage dealt/received;
- healing;
- shields;
- dodges;
- Lucky Ducks;
- switches;
- interruptions;
- bar drained;
- pickups collected/used;
- batteries;
- waffles applied/cleared;
- accessory charge/use;
- time active per figure;
- defeat order;
- team combo;
- seed and replay hash.

---

# 31. AI requirements

The exact source AI is not public. Build transparent utility AI with no hidden resources.

## 31.1 Information access

AI may use:

- visible HP;
- visible statuses;
- visible bars and action costs;
- known action definitions;
- known type wheel;
- legal switch targets;
- accessory charge;
- tournament persistence;
- mission-specific scripting.

AI may not use:

- future RNG values;
- hidden player input;
- fabricated bar;
- reduced costs not displayed;
- impossible reaction time on lower difficulties.

## 31.2 Decisions

AI chooses among:

- wait;
- use an affordable action;
- hold for a later action;
- switch;
- use pickup;
- use accessory;
- clear waffle/hazard;
- respond to charge;
- preserve an accessory during tournament;
- sacrifice an injured figure;
- target a setup or finisher sequence.

## 31.3 Utility factors

- expected immediate damage;
- expected healing waste;
- lethal probability;
- type matchup;
- current/maximum HP;
- interruption opportunity;
- bar denial;
- action disable value;
- pickup chance;
- status synergy;
- switch risk;
- opponent accessory readiness;
- tournament future value;
- action variety penalty;
- difficulty reaction delay;
- authored personality weights.

## 31.4 Difficulty

Change:

- reaction interval;
- lookahead;
- willingness to save bar;
- switch intelligence;
- accessory timing;
- combo recognition;
- tournament conservation;
- mistake probability.

Do not change fundamental rules unless the difficulty explicitly says it grants stat modifiers.

---

# 32. Presentation and static-art implementation

The source uses animated 3D figures. This project uses mostly static or two-frame artwork.

Equivalent feedback comes from:

- two-frame idle bounce;
- squash/stretch;
- short positional tween;
- attack cut-in;
- screen-space projectiles;
- hit flash;
- impact freeze/hit stop;
- camera punch;
- particle overlays;
- character portrait reaction;
- action icon animation;
- bar shake/crack;
- shield layer;
- status badge;
- defeat fall/fade;
- victory pose;
- foreground/background parallax;
- concise SFX;
- music intensity layers.

Each action definition includes presentation events without embedding game logic in animation code.

```ts
interface PresentationCue {
  atMs: number;
  kind:
    | "POSE"
    | "TWEEN"
    | "PROJECTILE"
    | "VFX"
    | "SFX"
    | "CAMERA"
    | "HIT_STOP"
    | "UI_PULSE"
    | "CUT_IN"
    | "TEXT";
  payload: Record<string, unknown>;
}
```

The deterministic engine emits semantic events. Phaser renders them. Rendering never decides whether a hit, dodge or status occurred.

---

# 33. Save model

Required persistent domains:

- profile identity;
- currencies;
- owned character instances;
- definition unlocks;
- XP and levels;
- stat choices/respec state;
- action order;
- action enhancements;
- mod chips;
- accessories;
- repaints;
- loadouts;
- story graph;
- mission progress;
- tournament runs;
- Quick Match presets;
- settings;
- tutorial flags;
- collection completion;
- achievements;
- online rank if implemented;
- migration version.

Never save source-game map coordinates because this game has no exploration.

---

# 34. Known unknowns

The following cannot honestly be called exact source specifications from current public evidence:

1. Exact bar capacity.
2. Exact base fill time.
3. Exact action cost of every power.
4. Whether action order changes effect strength, cost only, or both for every action.
5. Exact type multipliers.
6. Exact damage formula.
7. Exact healing formula.
8. Exact Lucky Duck multiplier.
9. Exact mapping from Luck stat to chance.
10. Exact mapping from Dodge stat to chance.
11. Stat caps and per-level increment values for every figure.
12. Exact XP curve.
13. Exact XP share for defeated or benched participants.
14. Exact switch animation lock and invulnerability.
15. Projectile target behaviour after switching.
16. Exact charge interruption frame.
17. Whether every damaging tick can interrupt.
18. Pickup roll frequency and table.
19. Whether multi-hit actions roll pickups per hit.
20. Battery drop chance and charge amount.
21. Full accessory list and exact values.
22. Full tofu effect list and exact values.
23. Exact waffle clearing rule.
24. Exact curse magnitude.
25. Exact disable/hack implementation for every power.
26. Exact flight behaviour.
27. Exact tournament recovery selection algorithm.
28. Exact tournament modifier catalogue.
29. Exact AI decision rules.
30. Exact ranked matchmaking and point formula.
31. Exact store restock tables.
32. Exact Gold/Shiny enhancement costs and affinity curve.
33. Exact repaint count per figure.
34. Edge cases involving simultaneous defeat, revive, reflect and damage-over-time.
35. Version-specific balance changes after multiplayer updates.

The specification must remain complete by defining project behaviour for these points, while keeping the source fact label honest.

---

# 35. Direct-measurement research protocol

To go beyond public guides, use a legally obtained playable copy and instrument gameplay capture.

## 35.1 Bar timing

For at least ten figures:

- record 60 fps;
- begin from empty;
- measure frames until each action anchor;
- measure frames to full;
- repeat with bar-speed buff, curse, freeze and dance;
- repeat after switch;
- test whether active figure changes base fill rate;
- test cap behaviour;
- test action spending from several initial values.

Report median and range.

## 35.2 Damage, Luck and Dodge

For controlled same-level matchups:

- perform each action at least 100 times;
- record normal and Lucky Duck damage;
- test type advantage, disadvantage and neutral;
- test shield and piercing;
- test Power stat increments;
- test dodge values across several figures;
- test multi-hit per-hit checks;
- test status application after dodge;
- infer formula candidates and confidence intervals.

## 35.3 Switching

Test:

- before target lock;
- after target lock;
- during projectile;
- during charge;
- during channel;
- under stun/root;
- at zero HP;
- simultaneous switch requests;
- switch while opponent uses group attack;
- switch with side-wide buff;
- switch with active-only regeneration;
- switch and re-enter with temporary statuses.

## 35.4 Pickups and accessories

Across at least 1,000 resolved hits:

- record tofu drops;
- record battery drops;
- separate per-action and per-hit rates;
- test Tofu Lover and Living Battery;
- record each tofu effect;
- record accessory charge per hit/action/battery;
- test charge retention through switch;
- test Comeback;
- test accessory use count in tournaments.

## 35.5 Tournament

Record:

- roster-registration limits;
- selected team size;
- HP persistence;
- XP and level-up timing;
- defeated-state persistence;
- recovery choices;
- resurrection;
- reward choices;
- modifiers;
- accessory exhaustion;
- loss behaviour;
- save/resume;
- post-run permanent rewards.

## 35.6 Save-state diff

Where platform tooling permits:

- make one controlled change;
- capture before/after save;
- identify level, stat, action-order, enhancement, repaint, chip and accessory fields;
- never distribute proprietary assets or the original binary;
- use results only to validate original implementation behaviour.

---

# 36. Source bibliography

The audit used the following publicly available source categories. These are research references, not assets to copy.

## Official and publisher/developer material

- Official publisher game page.
- Original developer portfolio page.
- original publisher tips videos and launch material.
- Release and update announcements reproduced by established games press.

## Reviews and guides

- TouchArcade review and multiplayer update coverage.
- Pocket Gamer review.
- SickGaming review reproducing detailed battle and customisation observations.
- AppUnwrapper guides for progression, type wheel and tournaments.
- LunarNebula strategy reviews.
- LevelWinner stat guide.

## Community catalogues

- Community complete Character/Move/enhancement list.
- Community complete Modification list.
- Community Team Trait testing.
- the reference series Wiki pages for tournaments, figures and game summaries.

Community catalogues contain corrections and version differences. They are evidence of system breadth, not canonical source code.

---

# 37. Acceptance checklist for mechanics coverage

An implementation brief is not complete until it explicitly answers every row.

## Combat

- [ ] 1–3 figures per side
- [ ] one active per side
- [ ] independent visible bars
- [ ] bar survives switching
- [ ] three actions per figure
- [ ] action order configuration
- [ ] exact project cost and scaling policy
- [ ] instant, charge, channel, multi-hit, counter, mine, summon, transform and multi-use lifecycles
- [ ] target lock
- [ ] interruption
- [ ] simultaneous resolution
- [ ] all-defeated victory
- [ ] group and team targeting
- [ ] deterministic seeded RNG
- [ ] replay log

## Stats and matchup

- [ ] Health
- [ ] Power
- [ ] Dodge
- [ ] Luck/Lucky Duck
- [ ] six-type cycle
- [ ] visible strong/weak help
- [ ] stat-choice level-up
- [ ] cap and XP curve
- [ ] respec policy

## Status and tempo

- [ ] stun
- [ ] root/no-switch
- [ ] Power up/down/steal
- [ ] defence up/down
- [ ] dodge/luck buffs
- [ ] damage over time
- [ ] electrocution
- [ ] heal/effect block
- [ ] cleanse/team cleanse
- [ ] shield/lasting shield
- [ ] reflect
- [ ] counter
- [ ] flight
- [ ] action disable
- [ ] action hack
- [ ] bar haste/slow/pause/freeze/break/drain/gain
- [ ] duel-long locks

## Battle extras

- [ ] tofu drop
- [ ] tofu queue and activation
- [ ] battery drop
- [ ] accessory charge
- [ ] hostile waffle
- [ ] curse
- [ ] heart/Power pickups
- [ ] pickup probability policy
- [ ] per-hit versus per-action policy

## Progression

- [ ] level 5 enhance
- [ ] two enhancement steps per action
- [ ] duplicate affinity
- [ ] individual instance upgrades
- [ ] level 10 action order
- [ ] one mod-chip slot
- [ ] mod rarity
- [ ] type restrictions
- [ ] mod trigger engine
- [ ] repaint cosmetics
- [ ] true variants
- [ ] selling/conversion safeguards

## Team building

- [ ] named combos
- [ ] two-member and three-member bonuses
- [ ] exclusive pairs
- [ ] priority resolution
- [ ] broad project traits
- [ ] selection screen updates instantly
- [ ] enemy preview
- [ ] accessory selection
- [ ] starting-active selection
- [ ] saved loadouts

## Modes

- [ ] Quick Match Sandbox
- [ ] Quick Match Profile
- [ ] preset challenges
- [ ] six-character tournament registration
- [ ] persistent HP
- [ ] defeated-state persistence
- [ ] recovery/revive choices
- [ ] tournament modifiers
- [ ] accessory exhaustion
- [ ] tournament XP/level-ups
- [ ] Story graph
- [ ] mission board
- [ ] daily/weekly objectives
- [ ] battle-restriction objectives
- [ ] shops and rewards without map
- [ ] optional ranked/friend/CPU online architecture

## UI and presentation

- [ ] collection grid
- [ ] four-stat detail
- [ ] three-action detail
- [ ] enhancement screen
- [ ] mod-chip screen
- [ ] repaint preview
- [ ] action-order editor
- [ ] toy-pedestal squad select
- [ ] team combo badge
- [ ] dual-bar HUD
- [ ] statuses
- [ ] pickups
- [ ] accessory
- [ ] victory dance/pose
- [ ] post-battle progression
- [ ] accessible non-colour cues

---

# V2 Authoritative Patch to the Original Project Specification

This patch overrides conflicting rules in the original 25,000-word build specification that follows it.

# P1. Ruleset profiles

The engine must support named ruleset profiles. Content declares a profile rather than scattering booleans across modes.

```ts
interface CombatRulesProfile {
  id: string;
  levelCap: number;
  primaryStats: PrimaryStat[];
  levelUpOfferCount: number;
  actionPlacementMode: "REFERENCE_THREE_SLOT" | "EXTENDED_NINE_ANCHOR";
  enhancementUnlockLevel: number;
  actionOrderUnlockLevel: number;
  enhancementTierCount: number;
  modUnequipPolicy: "REUSABLE" | "DESTROY_ON_UNEQUIP";
  teamSynergyMode: "SINGLE_PRIORITY_COMBO" | "STACKING_TRAITS" | "HYBRID";
  pickupRollMode: "PER_ACTION" | "PER_HIT_WITH_CAP";
  tournamentAccessoryPolicy: "ONE_PER_DUEL" | "REGISTERED_ONCE_PER_RUN";
}
```

# P2. Default project profile

```json
{
  "id": "PROJECT_STANDARD",
  "levelCap": 20,
  "primaryStats": ["HEALTH", "POWER", "DODGE", "LUCK"],
  "levelUpOfferCount": 3,
  "actionPlacementMode": "REFERENCE_THREE_SLOT",
  "enhancementUnlockLevel": 5,
  "actionOrderUnlockLevel": 10,
  "enhancementTierCount": 3,
  "modUnequipPolicy": "REUSABLE",
  "teamSynergyMode": "HYBRID",
  "pickupRollMode": "PER_HIT_WITH_CAP",
  "tournamentAccessoryPolicy": "REGISTERED_ONCE_PER_RUN"
}
```

The level-25, six-stat and nine-anchor model becomes an optional advanced profile, not the default.

# P3. Character stats

Authoritative default:

- Health;
- Power;
- Dodge;
- Luck.

Derived runtime values may include:

- outgoing damage multiplier;
- incoming damage multiplier;
- bar fill multiplier;
- charge-speed multiplier;
- healing multiplier;
- status resistance;
- shield strength;
- accessory charge multiplier.

Do not show derived values as primary assignable stats unless a later design decision explicitly enables them.

# P4. Action positions

Authoritative default:

- every combat character has exactly three actions;
- every action has an authored Early, Mid and Late placement profile;
- at level 10, the player permutes the three actions;
- three cost anchors are data-driven and need not be exact thirds;
- the nine-anchor system is disabled in normal progression;
- action previews show exact cost and effect values for each position.

# P5. Enhancement

Authoritative default:

- unlock at level 5;
- each of three actions has Base, Enhanced and Mastered ranks;
- duplicate/core feeding supplies progress;
- same-definition material gives affinity bonus;
- upgrades are deterministic;
- every rank has explicit effect deltas;
- no vague global percentage is sufficient;
- enhancements belong to the owned instance.

# P6. Modifications

Authoritative default:

- one slot, unlocked at level 5;
- reusable and freely movable outside battle and active tournament runs;
- Bronze/Silver/Gold content tiers may be retained under original names;
- all mod behaviours use the trigger/effect engine;
- class/type restrictions are data;
- source-style destruction is available only as a separate challenge ruleset.

# P7. Team synergy

Authoritative default hybrid:

1. Evaluate authored named combinations.
2. Select the highest-priority named combination.
3. If none qualifies, evaluate broad project traits.
4. Apply at most one normal synergy package.
5. Show the exact selected bonus.
6. Do not silently stack every matching tag.
7. Experimental Quick Match can permit stacked synergies.

# P8. Battle pickups and hazards

Maintain separate runtime domains:

```ts
side.pickupQueue;
side.accessory;
side.bar.slotHazards;
```

- Tofu is beneficial.
- Battery charges the accessory.
- Waffle blocks/disrupts actions.
- Curse changes bar behaviour.
- Freeze/break deletes accumulated bar.
- Heart/Power bonus is an immediate or queued pickup.
- No single generic `hazard` object should ambiguously represent all of them.

# P9. Accessories

Authoritative default:

- one selected accessory per duel;
- separate charge meter;
- charge from actions/hits plus battery drops;
- visible on both sides;
- manual activation;
- tournament registers up to six accessories;
- each activated accessory becomes exhausted for the run;
- unused accessory remains available;
- Comeback-style effects can fully charge but do not refresh an exhausted item.

# P10. Tournament

Authoritative required loop:

```text
REGISTER SIX
→ SNAPSHOT BUILDS
→ PREVIEW DUEL
→ SELECT 1–3 LIVING FIGURES
→ SELECT ONE UNUSED ACCESSORY
→ APPLY DUEL MODIFIER
→ FIGHT
→ PERSIST HP / DEFEATS / XP / ACCESSORY USE
→ CHOOSE RECOVERY OR REWARD
→ NEXT DUEL
→ RUN VICTORY OR RUN LOSS
```

# P11. Character selection

The squad menu is not merely a collection grid with three checkboxes. It must be a dedicated pre-battle decision screen with:

- three pedestal slots;
- starting-active selection;
- enemy preview;
- matchup indicators;
- named combo;
- exact bonus;
- accessory;
- mode restrictions;
- persistent tournament HP;
- roster filter;
- prominent start action.

# P12. Quick Match, Tournament and Story

These remain the required top-level modes.

- No map.
- No exploration.
- Optional online parity is post-MVP.
- Every battle uses the same deterministic engine.
- Story invokes battle and tournament definitions.
- Tournament does not duplicate combat code.
- Quick Match exposes Sandbox and Profile variants.

# P13. Source names

Source character, item, team and move names may appear only in the research appendix. Shipped content must use original characters, actions, accessories, modifications, team names, narrative and art.

# P14. Unknown exact values

Where the compendium marks a fact `UNKNOWN EXACT`, the agent must:

1. use an explicit project baseline;
2. put it in data/configuration;
3. add a test;
4. add telemetry;
5. avoid comments claiming it matches the source;
6. add a `researchConfidence` field.

Example:

```json
{
  "barCapacity": 100,
  "baseFillPerSecond": 14,
  "researchConfidence": "PROJECT_BASELINE_NOT_SOURCE_MEASURED"
}
```

# P15. Precedence

When instructions conflict:

1. the user's latest explicit direction;
2. this V2 patch;
3. the source-parity compendium;
4. the original project specification below;
5. prototype defaults;
6. the Gemini material.

---

# Original Full Implementation Specification

# Ultimate Collectible Squad Battler Specification

## reference-informed combat, rebuilt for this project

**Status:** Authoritative design and implementation handoff  
**Audience:** AI coding agents, game designers, content authors, balance agents and asset-generation agents  
**Authority:** This document supersedes the Gemini breakdown and any older notes where they conflict with the locked decisions below.  
**Design intent:** Match or exceed the appeal, clarity and tactical depth of the reference game combat and collection systems without copying its intellectual property, world, artwork, terminology, exact content or explorable-map structure.

---

# 0. Instructions to the implementing agent

Treat this file as the source of truth.

The implementing agent must:

1. Preserve every item marked **LOCKED**.
2. Treat every item marked **BASELINE** as the initial implementation and balancing default. It may be tuned through data, but must not be silently replaced with a different system.
3. Treat every item marked **EXTENSION** as supported architecture that does not have to appear in the first playable build.
4. Keep gameplay rules independent from Phaser and presentation code.
5. Use stable IDs and data-driven definitions for characters, actions, effects, statuses, modifications, accessories, battles, tournaments, stories and rewards.
6. Record any deliberate design change in the GDD or an ADR before changing code.
7. Never copy names, characters, dialogue, artwork, sound, user-interface assets or proprietary content from _the source franchise_, the reference series or source franchise.
8. Do not add open-world exploration, walkable maps or roaming-map systems.
9. Do not interpret an omission as permission to invent a permanent mechanic. Use the documented baseline or mark the issue as unresolved.
10. Build tests for every material combat rule.

The agent must not treat the Gemini response as factual source material. It was useful as a brainstorming document, but it included unsupported exact values and several incorrect interpretations. The audit in this document states which ideas are retained and which are rejected.

---

# 1. Executive alignment

## 1.1 The game being built

This project is a collectible squad battler with:

- real-time, visible battle bars;
- one battle bar for each side;
- squads containing one to three characters per battle;
- one active character per side at a time;
- free tactical switching;
- three configurable actions per character;
- charge-up, instant, channelled, multi-hit, team and control actions;
- visible projected outcomes on action icons;
- six combat types arranged in a counter wheel;
- separate character traits that create squad synergy;
- character levels, free stat allocation and respec;
- three permanent action upgrade tiers;
- one reusable modification slot per character;
- one team accessory or gadget per battle loadout;
- collectible duplicate character instances;
- Quick Match, Tournament Mode and Story Mode;
- a finite, authored, replayable story-node structure instead of open-world exploration;
- static and two-frame character art made dynamic with camera, panel and impact effects;
- deterministic, headless TypeScript simulation beneath a Phaser presentation layer.

## 1.2 The central player experience

The desired loop is:

```text
Choose a mode
→ select or configure characters
→ read the matchup
→ fight using timing, switching, action placement and team composition
→ earn or configure rewards where the mode allows it
→ improve the collection
→ return stronger or try a different strategy
```

The game should be easy to understand at first glance and unexpectedly deep after repeated play.

It should permit the player to become overpowered. Older Story battles should not endlessly scale to the player's current strength. Returning to defeat an opponent who was once difficult is an intended reward.

## 1.3 What is being borrowed structurally

The project deliberately takes inspiration from the following broad ideas:

- a constantly filling action bar;
- three actions displayed at different positions on that bar;
- one active fighter with bench switching;
- transparent opponent information;
- figure or character collection;
- level-up stat choices;
- type advantage;
- team-composition bonuses;
- action enhancement;
- modification items;
- team accessories;
- temporary battle drops and special effects;
- short, readable battles with tactical timing.

The implementation must be original in terminology, data, visual identity, balancing, stories and content.

---

# 2. Absolute exclusions

## 2.1 No explorable map

**LOCKED:** The game has no open-world or freely navigable map.

Do not build:

- a controllable overworld avatar;
- walking through towns or cities;
- tile maps;
- free movement between locations;
- collision or navigation meshes;
- roaming NPCs;
- environmental scavenging;
- trash cans or objects that can be searched;
- day and night movement schedules;
- physical shops entered from a map;
- fast-travel stations;
- city hubs;
- weather-based encounters;
- quests discovered by physically finding a character;
- map waypoints;
- pathfinding;
- an exploration stamina system.

Anything normally delivered through exploration must be represented as authored content, menus or nodes.

| Exploration function | Replacement in this project                           |
| -------------------- | ----------------------------------------------------- |
| Walk to a shop       | Open a store screen or enter a store story node       |
| Meet an NPC          | Dialogue, encounter or character-introduction node    |
| Discover a mission   | Mission unlock, message or story node                 |
| Reach another city   | Chapter, episode or campaign transition               |
| Find a tournament    | Tournament unlock or tournament node                  |
| Search an object     | Reward node, battle drop or mission reward            |
| Night-only encounter | Story condition, event condition or scheduled content |
| Side quest           | Optional story branch or independent mini-campaign    |
| Landmark             | Static illustrated scene or chapter background        |

## 2.2 Other exclusions

The initial game must not be designed around:

- gacha;
- loot boxes;
- premium currency;
- paid energy;
- paid retries;
- item durability;
- destructive modification replacement;
- permanent injury;
- lives systems;
- mandatory multiplayer;
- a backend requirement for the first playable version;
- procedural infinite story progression;
- endless enemy scaling;
- conventional frame-heavy character animation;
- hard-coded character-specific combat logic where reusable effects can express the same result.

---

# 3. Reference audit: what the source game does and what Gemini invented

This section exists to prevent incorrect assumptions from entering the implementation.

## 3.1 Reliably observed reference behaviour

The following broad behaviours are sufficiently supported by gameplay material and contemporary descriptions:

- A battle team selects up to three figures.
- One figure is active at a time.
- The player can switch between selected figures.
- The team's action bar persists when the active figure changes.
- The opponent's bar is visible.
- Each figure has three actions positioned at different locations on the bar.
- The player makes stat choices while levelling.
- Type advantage is shown during pre-battle selection.
- Charge-up actions can be interrupted.
- Effects can manipulate bar speed or bar progress.
- Effects can stack.
- Temporary tofu drops grant beneficial powers.
- Ability-disabling waffle effects are a separate family of mechanic from tofu rewards.
- Modifications unlock during character progression.
- Duplicate figures can contribute to action enhancement.
- Character-group combinations can grant Health, Power, Dodge or Luck bonuses.
- Action placement can be changed later in progression, with earlier positions costing less and later positions producing a stronger result.
- The action catalogue contains a wide range of reusable primitives such as group damage, channel damage, bar drain, charge, stun, shields, healing, damage reflection, life steal, cleanse, ability disabling, multi-hit, undodgeable attacks and transformations.

## 3.2 Gemini claims that must not be treated as facts

| Gemini claim                                                                  | Decision for this project                                                                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Actions unlock at exactly 33.3, 66.6 and 100 bar points                       | **REJECT AS REFERENCE FACT.** Our game uses nine configurable bar positions with data-driven costs.     |
| The full bar always takes exactly six seconds                                 | **REJECT.** No reliable source established this. Our fill timing is a tunable baseline.                 |
| Switching has a 1.5 to 2 second cooldown or bar penalty                       | **REJECT.** Our switching is free and has no standard cooldown or bar cost.                             |
| Type multipliers are exactly 1.5 and 0.75                                     | **REJECT.** No reliable evidence establishes those exact values. Our baseline is 1.25 and 0.80.         |
| Tofu and waffles are both garbage inserted into the enemy bar                 | **REJECT.** Tofu-style drops are beneficial temporary rewards. Ability disruption is a separate hazard. |
| Every buff automatically applies to the whole squad                           | **REJECT.** Targeting is defined per effect. Buffs can target self, active ally or team.                |
| The game has a universal Defence formula of `1 + DEF × 0.01`                  | **REJECT.** This was invented. Our Defence formula is documented separately.                            |
| Burn, poison, stun and silence use the exact durations and percentages listed | **REJECT.** Those exact numbers were invented.                                                          |
| Repaints grant fixed stat bonuses                                             | **REJECT.** Repaints are cosmetic unless a separately defined variant intentionally changes gameplay.   |
| Stores use the listed rarity percentages and hard-currency gacha table        | **REJECT.** Our economy has no premium gacha.                                                           |
| A day lasts exactly 24 real minutes and travel costs exactly 50 coins         | **IRRELEVANT AND REJECTED.** There is no exploration system.                                            |
| Characters unlock five moves at the listed levels                             | **REJECT.** Each combat-ready character has exactly three authored actions.                             |
| Character inspection requires a 3D, rotatable model                           | **REJECT.** Our visual system is static art, two-frame motion and panel effects.                        |
| The listed AI percentages reproduce the source game                           | **REJECT.** They were speculative. Our AI uses a utility model.                                         |
| The listed tournament health rules are confirmed source behaviour             | **DO NOT RELY ON IT.** Our tournament rules are our own locked design.                                  |

## 3.3 Principle for reverse-engineered inspiration

No exact numeric value from a review, community post or another model is authoritative for this project.

The project should reproduce the _experience_:

- readable timing;
- fast decisions;
- visible information;
- meaningful team construction;
- satisfying escalation;
- low-friction experimentation;
- broad action variety built from a small effect vocabulary.

It should not attempt a byte-for-byte or formula-for-formula clone.

---

# 4. Product structure

## 4.1 Top-level modes

**LOCKED:** The primary play surfaces are:

1. **Story Mode**
2. **Quick Match**
3. **Tournament Mode**

The same combat engine, character definitions, action definitions, AI and presentation framework are used everywhere.

A mode is an orchestration layer. It must not duplicate combat rules.

## 4.2 Shared supporting screens

The game also needs:

- Home or Main Menu;
- Player Profile;
- Collection;
- Active Roster;
- Character Detail;
- Character Build and Stats;
- Action Configuration;
- Action Enhancement;
- Modification Inventory;
- Accessory Inventory;
- Store;
- Missions;
- Story Select;
- Tournament Select;
- Battle Setup;
- Battle;
- Results;
- Rewards;
- Victory;
- Defeat;
- Settings;
- Save Slots;
- Credits and legal information.

## 4.3 Progression boundary

Story Mode is the canonical progression experience.

Quick Match and standalone Tournament Mode can operate as unrestricted sandbox experiences. To remove the conflict between experimentation and profile progression, each supports an explicit ruleset:

### Sandbox ruleset

- all characters available;
- all variants available;
- selectable character levels;
- selectable Stock, Gold and Platinum action tiers;
- all modifications and accessories available;
- configurable AI, arena, music and battle rules;
- no Story currency or Story XP;
- results may update local statistics and achievements specifically labelled as sandbox-compatible.

### Profile ruleset

- owned character instances only;
- owned modifications and accessories only;
- actual character levels and upgrades;
- small repeatable XP and currency rewards;
- no first-clear Story rewards;
- no ability to create money or XP through custom settings that make a battle trivial;
- reward calculation uses an authored or validated challenge rating.

**BASELINE:** Quick Match opens in Sandbox ruleset by default. Standalone Tournament opens with a clear choice between Exhibition and Profile Tournament.

---

# 5. Core combat model

## 5.1 Participants

A battle supports exactly two sides.

A side may be controlled by:

- one human;
- one AI;
- a replay command stream;
- a test harness;
- a future remote player.

Supported combinations include:

- human versus AI;
- human versus human;
- AI versus AI;
- replay versus deterministic simulation.

## 5.2 Squad size

**LOCKED:** Each side enters a battle with one to three selected characters.

- One-character squads are valid.
- Two-character squads are valid.
- Three-character squads are valid.
- One character is active at a time.
- Other selected characters are benched but remain part of the battle state.
- A side loses when all of its selected characters are defeated or it forfeits.

Story conditions may require or prohibit particular squad sizes.

## 5.3 Character state

Every selected character tracks at least:

- instance ID;
- definition ID;
- level;
- current HP;
- maximum HP;
- active or benched state;
- alive or defeated state;
- base and effective stats;
- type;
- traits;
- three configured actions;
- action enhancement tiers;
- modification;
- statuses;
- shields;
- persistent stacks;
- temporary battle modifiers;
- tournament HP and defeat state where applicable.

## 5.4 Side state

Each side tracks at least:

- controller;
- selected squad;
- active character instance ID;
- team battle-bar energy;
- battle-bar fill rate;
- accessory and accessory charge;
- team-wide statuses;
- trait synergy result;
- run or mode modifiers;
- queued or resolving action;
- switch lock;
- battle drops;
- surrendered state.

## 5.5 Real-time simulation

Combat advances continuously.

**BASELINE:**

- deterministic simulation tick: 20 Hz;
- visual renderer: up to 60 fps;
- user input is converted into timestamped commands at simulation boundaries;
- gameplay must never depend on the renderer frame rate;
- simultaneous commands use a documented deterministic ordering rule.

Recommended same-tick order:

1. process forfeits and battle-ending commands;
2. process legal action commitments;
3. process legal switches;
4. process accessory activations;
5. advance charge and channel timers;
6. resolve scheduled impacts;
7. process status ticks;
8. process bar fill and drain;
9. process defeats and automatic active-character replacement;
10. evaluate battle end;
11. emit presentation events.

This ordering is configurable only through an explicit engine version change.

---

# 6. The battle bar

## 6.1 Ownership

**LOCKED:** Each side has its own team battle bar.

There are always two bars in a normal fight:

- the player's side bar;
- the opponent's side bar.

The bar belongs to the side, not to the active character.

Changing the active character does not reset, reduce or otherwise alter current energy unless a specific action, status, mode rule or tournament modifier says so.

## 6.2 Range

**BASELINE:**

```text
minimum energy: 0
maximum energy: 100
```

Energy is represented internally as a fixed-point integer to avoid floating-point divergence in deterministic simulations. For example, `100.000` displayed energy may be stored as `100000` milli-energy units.

## 6.3 Base fill

**BASELINE:** A neutral side takes eight seconds to fill from 0 to 100.

```text
baseFillRate = 12.5 energy per second
```

This value is not intended to imitate an undocumented source-game number. It is a starting point that should create enough time to read both bars while keeping low-cost actions frequent.

The effective fill rate is:

```text
effectiveFillRate =
  baseFillRate
  × activeCharacterSpeedMultiplier
  × timedSpeedModifiers
  × modeSpeedModifier
  × globalBattleSpeedMultiplier
```

Recommended clamps:

```text
minimum effective fill rate: 10% of base
maximum normal effective fill rate: 250% of base
```

A true freeze sets the rate to zero and is not overridden by the minimum clamp.

## 6.4 Active Speed and a team-owned bar

**LOCKED:** The bar is team-owned, but the currently active character's Speed affects how quickly it fills.

This creates a tactical reason to bring a fast character forward without giving every character a separate timer.

Switching from a slow character to a fast character updates the fill rate from the next simulation tick. Current energy is preserved.

## 6.5 Bar behaviour during actions

**BASELINE:**

- The bar continues filling while an instant action animation resolves.
- The bar continues filling while a charge-up or channelled action is preparing unless the action definition sets `pauseOwnBarDuringCast: true`.
- An action's cost is deducted when the action is committed, not when it lands.
- An interrupted charge normally loses the committed energy.
- A modification, passive or action property may refund part or all of an interrupted action's cost.
- The side cannot commit another character action while one of its actions is in a mutually exclusive cast or resolution state.
- The opposing side continues acting independently and can resolve actions at the same time.

## 6.6 Bar manipulation

The engine must support:

- flat energy gain;
- percentage energy gain;
- flat energy drain;
- percentage energy drain;
- reset to zero;
- set to a fixed value;
- freeze;
- temporary fill-speed increase;
- temporary fill-speed reduction;
- fill-speed multiplier stacks;
- starting energy;
- energy gained on hit;
- energy gained on dodge;
- energy gained on defeat;
- energy stolen from the opponent;
- energy cost reduction;
- energy cost increase;
- temporary placement shift;
- action-specific free cast;
- delayed energy refund.

Every bar effect must identify:

- target side;
- amount or multiplier;
- duration if relevant;
- stacking policy;
- minimum and maximum result;
- whether it can be cleansed;
- source character and action;
- visual event.

## 6.7 Bar information in the interface

Both sides' bars are visible at all times unless a special accessibility-tested rule explicitly hides information.

The player must be able to see:

- current energy;
- fill direction and movement;
- fill speed state;
- each available action marker;
- when each action becomes usable;
- a queued charge or channel;
- frozen or cursed state;
- predicted opponent action availability;
- active bar hazards;
- energy change numbers when useful;
- the opponent's current action and cast progress.

The design principle is transparent competition. The AI is allowed to inspect the same visible information as the human.

---

# 7. Action placement: nine positions

## 7.1 The three action bands

**LOCKED:** Every combat-ready character has exactly three active actions.

The standard loadout contains one action in each major band:

```text
Band 1: quick / low-cost
Band 2: standard / medium-cost
Band 3: heavy / high-cost
```

The character's three authored actions can be reordered across these bands after action configuration unlocks.

Each band has three tuning positions:

```text
1L, 1, 1H
2L, 2, 2H
3L, 3, 3H
```

`L` means the earlier, cheaper and weaker edge of a band.  
No suffix means the normal centre position.  
`H` means the later, more expensive and stronger edge of a band.

The suffix does not mean a separate fourth action or a rarity. It is a placement profile.

## 7.2 Default placement constraint

**LOCKED:** In standard rules, a character must have exactly one action in each numbered band.

Valid example:

```text
Action A → 1H
Action B → 2L
Action C → 3
```

Invalid standard example:

```text
Action A → 1L
Action B → 1H
Action C → 2
```

A custom Quick Match rule may relax this constraint as an experimental modifier, but the engine, AI and balance must assume one action per band by default.

## 7.3 Baseline energy positions

**BASELINE:**

| Placement | Energy cost | General role               | Magnitude scale |
| --------- | ----------: | -------------------------- | --------------: |
| 1L        |          18 | fastest poke or utility    |            0.70 |
| 1         |          25 | quick action               |            0.80 |
| 1H        |          32 | strong quick action        |            0.90 |
| 2L        |          40 | economical standard action |            1.00 |
| 2         |          50 | standard action            |            1.15 |
| 2H        |          60 | strong standard action     |            1.30 |
| 3L        |          70 | economical heavy action    |            1.50 |
| 3         |          82 | heavy action               |            1.75 |
| 3H        |          95 | maximum commitment         |            2.00 |

The action icon is physically anchored at its energy position on the bar.

These are balance-data defaults. They must not be hard-coded into engine logic.

## 7.4 Effect-specific scaling

The `magnitude scale` is not blindly applied to every property.

Each effect family defines a placement-scaling curve.

Recommended defaults:

| Effect             | Placement scaling treatment                                                     |
| ------------------ | ------------------------------------------------------------------------------- |
| Direct damage      | Full magnitude scale                                                            |
| Healing            | 85% of the difference from 1.0 to avoid extreme team sustain                    |
| Shield             | Full magnitude scale with maximum-HP cap                                        |
| Damage over time   | Split between tick magnitude and duration                                       |
| Stun               | Small duration increase, not full magnitude scale                               |
| Status chance      | Bounded increase toward a hard cap                                              |
| Bar gain or drain  | Partial scale with explicit maximum                                             |
| Team-wide damage   | Full scale applied to a lower base coefficient                                  |
| Team-wide healing  | Full scale applied to a lower base coefficient                                  |
| Buff magnitude     | Partial scale                                                                   |
| Buff duration      | Partial scale                                                                   |
| Charge duration    | May become longer at stronger placement if the action is deliberately high risk |
| Multi-hit count    | Does not automatically increase; enhancement may add hits                       |
| Cleanse            | Binary effect; placement can add targets or secondary healing                   |
| Disable or silence | Duration scales gently and remains capped                                       |

Every action preview must show the actual resolved placement result rather than asking the player to infer it from a generic multiplier.

## 7.5 Unlocking configuration

**LOCKED:** Action reordering and position configuration unlock at character level 10.

Before level 10:

- the character uses its authored default placement;
- the player can inspect future placement options;
- the UI explains that configuration unlocks at level 10.

At and after level 10:

- the player can reorder the three actions between bands;
- the player can choose L, normal or H within each occupied band;
- configuration is free outside battle;
- configuration is locked for the duration of an active tournament run;
- saved loadouts may store different action configurations.

---

# 8. Action definition and lifecycle

## 8.1 Actions are reusable effect compositions

**LOCKED:** A character action is not bespoke gameplay code.

An action definition is composed from:

- presentation metadata;
- targeting rules;
- timing rules;
- one or more reusable effects;
- conditions;
- enhancement changes;
- AI metadata;
- accessibility text.

The same effect composition may support visually unrelated actions.

Example:

```text
Visible action: Tosses a haunted alarm clock
Visible action: Fires a plasma arrow
Visible action: Delivers a legal notice

Shared mechanics:
Deal medium single-target damage
Then apply Defence Down for six seconds
```

## 8.2 Execution styles

The engine must support:

### Instant

The action commits, spends energy and schedules its result with little or no vulnerable preparation.

### Charge-up

The action commits and displays a cast timer. Damage, stun or an interrupt effect may cancel it unless protected.

### Channel

The action produces repeated ticks while the caster continues channelling. It may end naturally, be cancelled or be interrupted.

### Multi-hit

The action schedules several discrete hits. Each hit can have its own dodge, critical and secondary-effect rules.

### Stance

The action applies a temporary state such as counter, reflect, shield, dodge or invulnerability.

### Toggle or transformation

The action changes the character's temporary form, action set, stats or effect rules.

### Multi-use activation

The action requires a configured number of uses before a final result activates.

### Delayed or remote

The action places a mine, mark, timer or delayed impact.

### Summon

The action creates a temporary minion or scheduled source of effects without introducing a fourth selectable squad member.

## 8.3 Commit validation

An action can be committed only when:

- its owner is alive;
- its owner is active unless the action explicitly permits bench use;
- the side has enough energy;
- the action is not disabled;
- the character is not stunned, asleep or otherwise unable to act;
- the side is not already resolving a mutually exclusive action;
- a legal target exists;
- all action-specific conditions are satisfied;
- the battle has not ended;
- the mode does not prohibit it.

Invalid input must produce a clear, non-punitive rejection event. It must not consume energy.

## 8.4 Commit and target lock

**LOCKED:** The target is locked when the action commits.

Switching characters after an opponent has committed a targeted action does not cause that action to miss and cannot be used as an artificial dodge.

For a single-target action:

- the action targets the character that was active or selected at commit time;
- if that character is defeated before impact, the action follows its configured `retargetPolicy`;
- the default policy is `fizzleIfTargetDefeated` for direct single-target attacks;
- an action may instead retarget the current active enemy or another legal target if explicitly authored.

Team-wide actions resolve against the team membership captured according to their definition.

## 8.5 Cost timing

**BASELINE:** Energy is spent immediately at commit.

If a charge-up action is interrupted:

- the action fails;
- the energy remains spent;
- no main effects occur;
- explicitly authored on-interrupt effects may occur;
- a modification can prevent interruption or refund energy;
- the interface reports why the cast failed.

## 8.6 Standard lifecycle

```text
Input received
→ validate legality
→ calculate and display final preview
→ commit action
→ spend energy
→ lock target or target set
→ emit ActionCommitted
→ play anticipation or charge
→ check interruption windows
→ resolve each hit or effect in authored order
→ trigger passives and reactions
→ apply defeat state
→ emit completion
→ release side action lock
```

## 8.7 Interruption

A charge or channel can be interrupted by:

- a damaging hit if the action is marked `interruptibleByDamage`;
- stun;
- explicit interrupt;
- knockdown;
- silence if the action category is affected;
- switching, where voluntary switching is permitted to cancel the player's own action;
- defeat;
- battle end.

A dodged incoming attack does not interrupt unless it carries an unavoidable explicit interrupt effect.

The engine must distinguish:

- damage that interrupts;
- control that interrupts;
- bar manipulation that does not interrupt;
- protection that guarantees completion;
- probabilistic interruption resistance;
- faster casting;
- instant-cast chance.

## 8.8 Simultaneous actions

Both sides may have actions in flight.

If two impacts occur on the same simulation tick:

1. impacts are ordered by scheduled sequence number;
2. sequence number is assigned deterministically at commit;
3. both already-committed impacts may still resolve even if the first defeats the caster, unless the action requires the caster to remain alive at impact;
4. the action definition states whether defeat cancels a projectile, delayed effect or summon.

This behaviour must be covered by tests.

---

# 9. Targeting

## 9.1 Target selectors

The engine must support at least:

- `self`;
- `activeAlly`;
- `singleAlly`;
- `allAllies`;
- `activeEnemy`;
- `singleEnemy`;
- `allEnemies`;
- `randomEnemy`;
- `lowestHealthAlly`;
- `highestHealthEnemy`;
- `allLivingAllies`;
- `allLivingEnemies`;
- `defeatedAlly` for tournament recovery outside battle only;
- `ownSide`;
- `opponentSide`.

## 9.2 Standard targeting rules

**LOCKED:** The normal action vocabulary includes:

- attack one enemy;
- attack the whole enemy squad;
- stun the active enemy;
- stun the whole enemy squad;
- heal the active or selected ally;
- heal the whole allied squad.

Team damage and team healing are balanced by lower per-target values.

A single-target attack should normally deliver more damage to one character than a team attack of the same placement delivers to each enemy.

A single-target heal should normally restore more HP to one character than a team heal of the same placement restores to each ally.

## 9.3 Benched targets

Benched characters:

- can be affected by team-wide damage;
- can be affected by team-wide healing;
- can be affected by team-wide stun or control if the action explicitly targets all enemies;
- retain and tick individual statuses;
- do not naturally regenerate health;
- cannot normally be individually selected by direct enemy actions;
- may be individually selected by an authored specialist action if the UI clearly exposes that capability.

## 9.4 Distributed team effects

An action may use one of these policies:

- **per target:** every target receives the stated amount;
- **split total:** a total amount is divided among valid targets;
- **weighted split:** lower-health or active targets receive a larger share;
- **falloff:** active target receives full value and bench targets receive a percentage;
- **random distribution:** discrete hits select targets independently.

The policy must be shown in the action description and preview.

**BASELINE:** Standard team damage and team healing use `per target` with a lower base coefficient. This is simpler to understand than hidden redistribution.

---

# 10. Action effect primitive catalogue

The implementation must begin with a composable effect library rather than hard-coded move scripts.

## 10.1 Damage primitives

- single-target damage;
- all-enemy damage;
- random-target damage;
- multi-hit damage;
- channelled damage;
- damage over time;
- delayed damage;
- execute damage below a threshold;
- self-damage;
- recoil damage;
- life-steal damage;
- percentage-current-HP damage;
- percentage-maximum-HP damage;
- fixed damage;
- Defence-ignoring damage;
- shield-piercing damage;
- undodgeable damage;
- critical-guaranteed damage;
- critical-disabled damage;
- escalating repeated-use damage;
- damage based on missing HP;
- damage based on current bar;
- damage based on status count;
- damage with bar drain;
- damage with a secondary status.

## 10.2 Recovery primitives

- heal self;
- heal selected ally;
- heal all allies;
- heal over time;
- life steal;
- heal on shield expiry;
- heal on dodge;
- heal on action completion;
- heal based on damage dealt;
- convert a debuff into healing;
- restore HP to a tournament character between rounds;
- revive a tournament character between rounds;
- temporary maximum-HP increase;
- overheal converted into shield.

**LOCKED:** No in-battle revival in the standard ruleset.

## 10.3 Defensive primitives

- temporary Defence increase;
- temporary damage reduction;
- normal shield;
- lasting shield;
- one-hit shield;
- team shield;
- reflect stance;
- counter stance;
- dodge increase;
- guaranteed dodge against one eligible hit;
- untargetable or flight state;
- control resistance;
- interruption resistance;
- status immunity;
- type weakness reduction;
- low-health protection;
- damage cap per hit.

## 10.4 Offensive modifiers

- Power increase;
- stacking Power increase;
- Power over time;
- Critical increase;
- guaranteed critical;
- type advantage amplification;
- Defence down;
- Dodge down;
- status vulnerability;
- mark target;
- next-action bonus;
- bonus against shielded targets;
- bonus against stunned targets;
- bonus against low-health targets;
- bonus for repeated use;
- bonus based on team traits.

## 10.5 Control primitives

- stun;
- team stun;
- sleep;
- root or switch lock;
- action lock;
- selected-action lock;
- silence;
- charge interruption;
- channel interruption;
- active-character forced switch;
- bar freeze;
- bar slow;
- bar reset;
- bar drain;
- cost increase;
- disable accessory;
- prevent healing;
- prevent positive effects;
- dispel positive effects;
- cleanse negative effects;
- duration extension;
- duration reduction.

## 10.6 Bar and tempo primitives

- gain energy;
- fill to a threshold;
- steal energy;
- reduce opponent energy;
- reset opponent energy;
- speed own bar;
- slow opponent bar;
- freeze either bar;
- reduce action cost;
- increase action cost;
- grant starting energy;
- gain energy per hit;
- gain energy after being hit;
- gain energy on dodge;
- free next action;
- instant-cast chance;
- faster charge time;
- preserve energy after interruption;
- refund energy;
- bar hazard placement.

## 10.7 Utility primitives

- generate a battle drop;
- consume a battle drop;
- transform;
- summon temporary helper;
- reveal or mark information;
- copy a buff;
- steal a buff;
- transfer a debuff;
- random effect from an authored pool;
- action replacement;
- temporary action upgrade;
- action position shift;
- accessory charge gain;
- currency bonus after battle;
- XP bonus after battle;
- conditional tournament bonus.

## 10.8 Effect composition

An action may contain any number of ordered effects.

Example:

```yaml
id: action.example.rattle-smash
targeting: activeEnemy
execution: charge
chargeMs: 900
effects:
  - type: damage
    basePower: 18
    powerRatio: 0.8
  - type: applyStatus
    statusId: status.defence-down
    chance: 0.65
    durationMs: 6000
```

The action engine must execute the list in order and produce traceable calculation events.

---

# 11. Hit, dodge, critical and damage resolution

## 11.1 Visible outcome philosophy

**LOCKED:** Action icons show a useful projected outcome before use.

For a direct attack, show:

- projected damage against the currently locked or active target;
- number of hits;
- whether the matchup is strong, neutral or weak;
- critical chance;
- dodge risk where relevant;
- major secondary-effect chance;
- target scope.

For healing, show projected healing.  
For bar effects, show projected energy gain or drain.  
For control, show chance and duration.  
For team actions, show per-target or total policy.

Do not add hidden damage variance merely to make numbers look less deterministic. A displayed 17-damage attack should deal 17 when it lands under the currently displayed state, unless a visible event such as critical, shield, mitigation change or reactive passive changes the resolution.

## 11.2 Seeded randomness

Randomness is permitted for:

- dodge;
- critical hits;
- authored status chances;
- random target selection;
- authored random battle drops;
- AI choice among similarly valued options;
- reward rolls;
- shop rotation;
- explicitly random action pools.

Randomness must be seeded. The same initial state, engine version, seed and command stream must reproduce the same result.

## 11.3 Per-hit resolution

**LOCKED:** Multi-hit actions make independent hit, dodge and critical rolls for each hit unless the action explicitly uses a shared roll.

Default per-hit process:

1. confirm target is still legal;
2. evaluate undodgeable property;
3. roll dodge if eligible;
4. if dodged, emit `CharacterDodged` and skip damage and hit-dependent secondary effects;
5. calculate pre-mitigation magnitude;
6. apply type relationship;
7. apply Defence and damage-reduction rules;
8. roll critical if eligible;
9. apply shield interaction;
10. apply HP damage;
11. apply on-hit secondary effects;
12. trigger reactive passives;
13. evaluate defeat.

## 11.4 Baseline damage formula

**BASELINE:**

```text
rawMagnitude =
  (actionBasePower + attackerEffectivePower × actionPowerRatio)
  × placementDamageScale
  × enhancementDamageScale
  × temporaryPowerMultiplier
  × contextualActionMultiplier

withType = rawMagnitude × typeMultiplier

defenceMitigation = effectiveDefence / (effectiveDefence + 50)
defenceMitigation = clamp(defenceMitigation, 0, 0.60)

afterDefence = withType × (1 - defenceMitigation)

afterCritical = afterDefence × criticalMultiplier

finalDamage = max(minimumDamage, round(afterCritical))
```

Recommended defaults:

```text
critical multiplier: 1.50
minimum landed damage: 1
normal Defence mitigation cap: 60%
```

An effect may explicitly:

- ignore a proportion of Defence;
- ignore all Defence;
- pierce shields;
- disable critical hits;
- guarantee a critical hit;
- use fixed damage;
- use HP-based damage;
- use a separate formula.

The calculation trace must identify every factor for tests and debugging.

## 11.5 Dodge

Dodge normally means complete avoidance of an eligible hit.

Recommended rules:

- dodge is rolled per hit;
- a dodged hit deals zero damage;
- hit-dependent statuses do not apply after a dodge;
- unavoidable statuses may still apply if clearly authored as separate effects;
- team-wide attacks can be dodged independently by each target;
- damage over time already applied is not dodged on each tick unless the status says so;
- fixed environmental effects may be undodgeable;
- Dodge has a normal permanent cap of 40%;
- temporary combat effects may raise effective Dodge to a maximum of 60%;
- guaranteed-dodge effects are separate from the numerical cap.

The UI must use text or symbols in addition to colour when a dodge occurs.

## 11.6 Critical

Recommended rules:

- Critical is rolled per eligible hit;
- critical chance is visible in character details and action previews;
- Critical has a normal permanent cap of 50%;
- temporary combat effects may raise effective Critical to 75%;
- guaranteed critical effects are separate from the numerical cap;
- healing does not normally critical unless the action opts in;
- damage over time does not normally critical unless the action opts in;
- control chance does not inherit Critical.

## 11.7 Defence Down and zero Defence

Defence is a normal character stat and a temporary combat property.

A Defence Down effect can reduce effective Defence to zero but not below zero unless the action explicitly supports vulnerability that increases incoming damage beyond zero-Defence damage.

The earlier design idea that Defence Down prevents dodging is not universal. If an action needs that behaviour, it applies two explicit effects:

```text
Defence Down
Dodge Disabled
```

This keeps combat rules inspectable.

## 11.8 Type relationship

Recommended default multipliers:

```text
advantage: 1.25
neutral: 1.00
disadvantage: 0.80
untyped relationship: 1.00
```

These values are data-driven and may be tuned globally after simulation and playtesting.

Type advantage primarily affects damage. An action may opt into type scaling for:

- healing;
- status chance;
- bar drain;
- shield strength;
- control duration.

The default for non-damage effects is neutral scaling to keep the system readable.

---

# 12. Healing and shielding

## 12.1 Baseline healing formula

```text
rawHealing =
  (actionBaseHealing + attackerEffectivePower × healingPowerRatio)
  × placementHealingScale
  × enhancementHealingScale
  × healingDoneMultiplier
  × healingReceivedMultiplier

finalHealing = max(0, round(rawHealing))
```

Healing cannot raise current HP above maximum HP unless the action explicitly converts excess healing into shield.

## 12.2 Single versus team healing

**BASELINE:** A single-target heal has approximately 2.1 to 2.5 times the per-character value of a team heal at the same action placement.

This means:

- single heal is best for saving one character;
- team heal is efficient when several characters are damaged;
- a three-character team heal can restore more total HP, but less to each character;
- tournament attrition makes team healing strategically important.

## 12.3 Shields

Shields are separate from HP and Defence.

A shield tracks:

- current shield value;
- source;
- duration or expiry condition;
- whether it can stack;
- whether it absorbs fixed, percentage or eligible damage;
- whether it blocks statuses;
- whether it heals on expiry;
- whether it persists while benched;
- whether it is removed between tournament battles.

Default damage order:

```text
incoming damage
→ shield absorption
→ remaining damage to HP
```

Shield-piercing actions bypass the configured proportion of shield.

---

# 13. Status system

## 13.1 Status ownership

A status can belong to:

- a character;
- a side;
- a battle bar;
- an action slot;
- an accessory;
- a tournament run;
- the battle environment.

Statuses must not be implemented as arbitrary flags. Each status definition includes duration, tick rules, stacking, dispel category and behaviour hooks.

## 13.2 Duration

Durations use simulation time, not animation time.

**LOCKED:** Character statuses continue ticking while the character is benched.

Example:

- a character is stunned for four seconds;
- the player benches it after one second where switching is legal;
- three seconds later the stun has expired;
- bringing it back does not restart or pause the status.

## 13.3 Between-battle behaviour

Standard Story and Quick Match battles clear temporary statuses at battle end.

Tournament rules:

- current HP persists;
- defeated state persists;
- temporary battle statuses clear between rounds;
- explicitly run-persistent injuries, blessings or modifiers persist only when authored as tournament effects;
- shields do not normally persist between rounds;
- action enhancement, stats, modifications and accessory choice remain locked to their registered loadout.

## 13.4 Stacking policies

Every status declares one of:

- `replace`;
- `refreshDuration`;
- `addDuration`;
- `addMagnitude`;
- `independentStacks`;
- `maxMagnitude`;
- `maxDuration`;
- `ignoreIfPresent`;
- `consumeAndUpgrade`.

It also declares `maxStacks` where applicable.

## 13.5 Required status catalogue

### Control

- Stun
- Sleep
- Root or Switch Lock
- Silence
- Action Slot Lock
- Accessory Lock
- Charge Vulnerability
- Interrupt Immunity
- Untargetable
- Forced Active Character

### Damage and recovery

- Burn
- Poison
- Bleed
- Damage Over Time
- Healing Over Time
- Heal Block
- Life Steal
- Regeneration

### Stats

- Power Up
- Power Down
- Defence Up
- Defence Down
- Speed Up
- Speed Down
- Dodge Up
- Dodge Down
- Critical Up
- Critical Down
- Status Resistance
- Status Vulnerability

### Bar

- Haste
- Slow
- Freeze
- Starting Energy
- Energy Gain per Hit
- Energy Drain per Hit
- Cost Reduction
- Cost Increase
- Free Next Action
- Bar Reset Pending

### Protection and reaction

- Shield
- Lasting Shield
- Reflect
- Counter
- One-Hit Immunity
- Dodge Next Hit
- Low-Health Guard
- Cleanse Immunity

### Action behaviour

- Instant-Cast Chance
- Faster Charge
- Uninterruptible
- Undodgeable
- Shield Piercing
- Guaranteed Critical
- Multi-use Progress
- Transformation
- Summoned Helper
- Delayed Mine

## 13.6 Recommended baseline durations

These are balance defaults, not source-game claims.

| Status                     | Baseline duration | Notes                                         |
| -------------------------- | ----------------: | --------------------------------------------- |
| Stun active target         |             1.5 s | Strong control; keep short                    |
| Team stun                  |            0.75 s | Lower duration because it affects up to three |
| Power Up or Down           |               8 s | Refresh by default                            |
| Defence Up or Down         |               8 s | Refresh by default                            |
| Speed Up or Slow           |               6 s | Multiplicative, capped                        |
| Dodge or Critical modifier |               8 s | Bounded by effective caps                     |
| Root or Switch Lock        |               3 s | Does not necessarily stop actions             |
| Silence                    |               4 s | Locks authored action categories or slots     |
| Heal Block                 |               5 s | Clearly visible                               |
| Reflect or Counter         |               4 s | May end after one trigger                     |
| Damage over time           |               6 s | Usually one tick per second                   |
| Healing over time          |               6 s | Usually one tick per second                   |
| Bar Freeze                 |            1.25 s | Very strong effect                            |
| Untargetable               |               2 s | May end on action                             |

All values live in data and must be simulated before final balance.

---

# 14. Switching

## 14.1 Standard switch rules

**LOCKED:** Switching:

- is free;
- has no normal energy cost;
- has no normal cooldown;
- preserves team-bar energy;
- changes which character's Speed affects the bar;
- is blocked when the side or active character is stunned;
- is blocked by Switch Lock;
- is blocked while the side is in an action state that cannot be cancelled;
- may cancel the player's own charge or channel if that action allows voluntary cancellation;
- cannot dodge an already committed incoming action;
- does not cleanse statuses;
- does not pause status durations;
- does not heal;
- does not reset action stacks or temporary character effects unless specifically authored.

## 14.2 Switching purpose

Switching exists to:

- protect a low-health character from future targeting;
- bring forward a favourable type matchup;
- access a different action set;
- use a fast character to accelerate the team bar;
- place a tank or defensive character in front;
- preserve a valuable character during a tournament;
- exploit a switch-in passive or modification;
- respond to the opponent's visible bar and likely action.

It must not become a reflex exploit that invalidates committed attacks.

## 14.3 Automatic switching after defeat

When the active character is defeated:

- the side enters a brief replacement state;
- if one living bench character remains, it becomes active automatically;
- if several remain, a human receives a short selection window;
- if the human does not choose, the engine selects according to a deterministic default;
- AI chooses according to utility;
- current team energy is preserved;
- the replacement cannot act until the defeat and entry lock finishes;
- the replacement lock is presentation-aware but simulated as a short, explicit duration.

**BASELINE:** replacement lock is 500 ms.

## 14.4 Switch-in effects

The modification and passive system may support:

- shield on entry;
- starting or bonus energy on entry;
- temporary Speed increase on entry;
- cleanse on entry;
- damage on entry;
- taunt on entry;
- bar curse on first entry;
- once-per-battle entry trigger;
- once-per-character entry trigger;
- every-entry trigger with cooldown.

---

# 15. Battle drops and bar hazards

## 15.1 Separate concepts

**LOCKED:** Beneficial temporary drops and hostile action-disabling hazards are separate mechanics.

Do not merge them into one generic “tofu/waffle” rule.

The project must use original names and visuals.

## 15.2 Battle drops

A battle drop is a temporary, clickable or automatically collected benefit created during combat.

A drop may be generated by:

- a character action;
- a modification;
- an accessory;
- a battle rule;
- a random authored schedule;
- an event modifier;
- a successful hit, dodge or defeat;
- a tournament blessing.

**BASELINE:** Drops appear in a dedicated drop lane near the owning side's bar. They expire after eight seconds if not collected unless their definition says otherwise.

Recommended initial drop effects:

- heal active character;
- heal entire team;
- cleanse negative effects;
- grant a temporary shield;
- add a stackable Power bonus;
- grant a Speed bonus;
- add energy;
- briefly stun the active enemy;
- grant interruption resistance;
- charge the team accessory;
- remove one hostile bar hazard.

The drop definition includes weight, eligibility, expiry, effect and AI value.

## 15.3 Hostile bar hazards

A bar hazard interferes with the opponent's action interface or energy economy.

Supported examples:

- temporary action-slot lock;
- replace one action marker with a harmless clear action;
- increase a specific action's cost;
- hide an action preview while leaving its location visible;
- disable the next action of a category;
- require spending energy to clear the hazard;
- drain energy when the bar crosses a marker;
- reset the bar at a marked threshold;
- slow the bar until a condition is met.

Hazards must be:

- visible;
- inspectable;
- time-limited or explicitly clearable;
- accessible without relying on colour;
- represented as engine state, not UI-only decoration.

## 15.4 Power stacking

The engine must support the player's requested escalating Power strategy.

A Power action can use:

- additive stacks;
- multiplicative stacks;
- escalating stack values;
- stacks consumed by the next attack;
- stacks that persist for a duration;
- stacks that persist until defeat;
- stacks limited by mode rules.

**BASELINE:** Story balance uses additive stacks with an authored maximum of five. Custom Quick Match may remove the cap. The action preview updates immediately so a normally 7-damage attack can visibly become 19 or much higher after deliberate stacking.

The action description must show whether stacks are additive, multiplicative, temporary or consumed.

---

# 16. Battle time limit and end conditions

## 16.1 Configurable limit

**LOCKED:** The engine supports a battle time limit.

**BASELINE presets:**

| Context                 | Default limit |
| ----------------------- | ------------: |
| Quick Match             |          90 s |
| Normal Story battle     |         120 s |
| Story boss              |         180 s |
| Tournament round        |         120 s |
| Custom or no-limit mode |  configurable |

The limit pauses when the battle is paused in a single-player context. It does not pause during normal action presentation.

## 16.2 Victory

A side wins when:

- all opposing selected characters are defeated;
- the opponent forfeits;
- a mode-specific objective is completed;
- time expires and the tiebreaker favours that side.

## 16.3 Time-expiry tiebreaker

Recommended order:

1. number of living characters;
2. combined current HP as a percentage of combined maximum HP;
3. total damage dealt;
4. total energy spent on successful actions;
5. draw.

A tournament draw counts as a failed round unless that tournament explicitly allows advancement.

## 16.4 Forfeit

Forfeit is always available from pause or battle controls where mode rules permit it.

Forfeit:

- ends the battle immediately;
- counts as a loss;
- does not delete currency, XP or items;
- ends a tournament run if used during a tournament round;
- records the reason as `forfeit` rather than `defeated`.

---

# 17. Character stats

## 17.1 Core stats

**LOCKED:** The standard character sheet contains six core combat stats:

1. **Health**
2. **Power**
3. **Defence**
4. **Speed**
5. **Dodge**
6. **Critical**

Energy is a side-owned battle resource, not a seventh character stat.

## 17.2 Stat responsibilities

### Health

- determines maximum HP;
- increases survival;
- may influence percentage shields and healing;
- is the primary straightforward defensive investment.

### Power

- scales direct damage;
- scales most healing where the action opts in;
- may scale shields, damage over time and offensive statuses;
- should remain one of the most satisfying allocation choices.

### Defence

- reduces eligible incoming damage;
- does not directly increase HP;
- can be raised or lowered by actions;
- is subject to a mitigation cap;
- can be ignored or pierced by special actions.

### Speed

- changes the side's team-bar fill rate while the character is active;
- may shorten recovery or charge time only where an action or passive explicitly says so;
- does not create a separate personal action bar.

### Dodge

- provides a chance to completely avoid eligible hits;
- is capped to prevent permanent near-invulnerability;
- is rolled independently for multi-hit actions.

### Critical

- provides a chance to multiply eligible damage;
- is independent from Dodge;
- affects battle probability only, not rewards or shop results.

## 17.3 Derived values

The engine may calculate:

- maximum HP;
- current HP percentage;
- Power multiplier;
- Defence mitigation;
- active Speed multiplier;
- effective Dodge chance;
- effective Critical chance;
- status resistance;
- healing done;
- healing received;
- interruption resistance;
- type multiplier;
- trait bonuses;
- starting energy contribution.

Derived values must remain inspectable in debug and test output.

## 17.4 Recommended stat caps

| Property                | Permanent normal cap |                 Temporary effective cap |
| ----------------------- | -------------------: | --------------------------------------: |
| Defence mitigation      |                  60% |    75% with explicit special protection |
| Dodge                   |                  40% |                                     60% |
| Critical                |                  50% |                                     75% |
| Speed stat multiplier   |                1.75× |                2.50× combined fill rate |
| Status resistance       |                  50% |                                     80% |
| Interruption resistance |                  75% | 100% through a specific immunity effect |

## 17.5 Allocation philosophy

**LOCKED:** Players may allocate heavily into one stat if they choose.

The system should not quietly force balanced builds. A player can make:

- a high-Health tank;
- a high-Power attacker;
- a fast battery character;
- a Dodge specialist;
- a Critical specialist;
- a Defence wall;
- a hybrid.

Power and Health should be reliable, satisfying choices. Dodge and Critical should be fun without becoming mathematically compulsory.

---

# 18. Levels, XP and stat allocation

## 18.1 Level cap

**LOCKED:** Character level range is 1 to 25.

Level 25 is the initial permanent cap. The engine may use data-driven caps, but content and balance must not assume infinite level expansion.

## 18.2 Level growth

Each level grants:

- automatic character-specific base-stat growth;
- one player-allocatable stat point;
- XP progress reset toward the next level;
- milestone unlocks where applicable;
- a clear level-up prompt.

A character can retain unspent allocation points, but the interface must show a persistent indicator until they are assigned.

## 18.3 Free respec

**LOCKED:** Allocated stat points can be moved freely:

- outside battle;
- outside an active tournament run;
- without currency cost;
- without item cost;
- without cooldown;
- without losing progression.

Tournament registration snapshots the build for that run.

## 18.4 Baseline allocation increments

**BASELINE:** One allocation point grants one of:

| Stat     |                Increase per point |
| -------- | --------------------------------: |
| Health   |                     +5 maximum HP |
| Power    |                          +1 Power |
| Defence  |                        +1 Defence |
| Speed    | +1.5% active fill-rate multiplier |
| Dodge    |               +1 percentage point |
| Critical |               +1 percentage point |

These values are data-driven. Automatic level growth and character archetypes make two characters with identical allocations remain mechanically distinct.

## 18.5 XP curve

**BASELINE:**

```text
xpForNextLevel(level) = round(50 + 30 × level + 8 × level²)
```

This is a starting curve, not a source-game reconstruction.

Design goals:

- early levels arrive quickly;
- a new character can become usable without excessive grinding;
- levels 20 to 25 require commitment but not an endless grind;
- the player can deliberately overlevel to overcome Story difficulty;
- repeat battles remain useful;
- low-level participants receive a catch-up multiplier when fighting significantly stronger opponents.

## 18.6 XP recipients

**BASELINE:**

- every character selected for the battle receives participation XP;
- active time and final-hit ownership do not determine base XP;
- defeated selected characters still receive XP;
- characters in the six-character Active Roster but not selected receive 20% of battle XP in Profile and Story rulesets;
- the rest of the collection receives no passive XP;
- one- or two-character squads divide the selected-character XP pool among fewer recipients, making small squads a valid levelling strategy;
- mission and first-clear XP may be awarded directly to specified characters or the selected team.

This avoids punishing a character for being defeated while preserving a reason to use it.

## 18.7 Loss rewards

**LOCKED:** A loss can provide partial XP and modest currency where progression is enabled.

Recommended:

```text
loss XP: 35% of normal participation XP
loss currency: 15% of normal repeat-clear currency
```

First-clear rewards, unlock rewards and tournament-completion rewards require success.

---

# 19. Combat types

## 19.1 Six types

**LOCKED:** The game has exactly six normal combat types plus optional Untyped.

The six types are:

1. **Brawler**
2. **Tech**
3. **Oddball**
4. **Arcane**
5. **Beast**
6. **Sharpshooter**

A character has exactly one combat type or is Untyped.

Actions do not have independent types and cannot override the acting character's type.

## 19.2 Locked type wheel

```text
Brawler
  beats Tech

Tech
  beats Oddball

Oddball
  beats Arcane

Arcane
  beats Beast

Beast
  beats Sharpshooter

Sharpshooter
  beats Brawler
```

Circular form:

```text
Brawler → Tech → Oddball → Arcane → Beast → Sharpshooter → Brawler
```

Each type is:

- strong against exactly one type;
- weak against exactly one type;
- neutral against the remaining three normal types;
- neutral against Untyped.

Untyped is neutral to and from all types.

## 19.3 Type visibility

The player must be able to inspect the type wheel:

- on Battle Setup;
- from Character Detail;
- from Help;
- from pause during single-player battle;
- through contextual strong and weak indicators.

The UI must not rely on colour alone. Each type needs:

- name;
- icon;
- shape;
- optional colour;
- strong-against arrow;
- weak-against arrow;
- readable text label.

## 19.4 Type and actions

Type relationship normally modifies damage only.

A character's action may opt into type influence for another effect when sensible, but this must be explicit. For example:

- an Arcane control action may gain a small status-chance bonus against Beast;
- a Tech bar-drain action may gain a small magnitude bonus against Oddball;
- healing normally ignores type.

Do not apply type to every numerical effect automatically.

---

# 20. Traits and squad synergy

## 20.1 Types and traits are different systems

**LOCKED:**

- **Type** controls the six-way combat matchup.
- **Trait** describes identity or affiliation and produces squad synergy.

A character can have:

- no traits;
- one trait;
- two traits.

Two traits is the normal maximum. A rare zero-trait character is allowed.

## 20.2 Locked traits

The six traits and their synergy rewards are:

| Trait    | Primary synergy |
| -------- | --------------- |
| Hero     | Health          |
| Villain  | Power           |
| Monster  | Defence         |
| Mythic   | Speed           |
| Historic | Starting Energy |
| Icon     | Critical        |

These names and associations are locked unless the project owner explicitly changes them.

## 20.3 Trait contribution

**LOCKED:**

- a one-trait character contributes `1.0` to that trait;
- a two-trait character contributes `0.5` to each trait;
- a zero-trait character contributes no trait score;
- only the one to three characters selected for the current battle contribute;
- the wider six-character Active Roster does not contribute to battle synergy;
- defeated characters remain part of the selected squad and retain their contribution for that battle unless a rule explicitly removes it.

Example:

```text
Moses: Hero + Mythic → Hero 0.5, Mythic 0.5
Ned Kelly: Hero + Historic → Hero 0.5, Historic 0.5
Viking: Historic → Historic 1.0

Selected-team total:
Hero 1.0
Mythic 0.5
Historic 1.5
```

## 20.4 Baseline synergy values

**BASELINE:** Trait bonuses are continuous and easy to calculate.

| Trait    |                                    Bonus per trait point |
| -------- | -------------------------------------------------------: |
| Hero     |                 +3 maximum HP to each selected character |
| Villain  |                      +1 Power to each selected character |
| Monster  |                    +1 Defence to each selected character |
| Mythic   |                            +4% side battle-bar fill rate |
| Historic |                                       +5 starting energy |
| Icon     | +2 percentage points Critical to each selected character |

Examples:

- `Hero 2.0` gives every selected character +6 maximum HP.
- `Villain 1.5` gives every selected character +1.5 effective Power internally, displayed with an understandable rounded or decimal value.
- `Historic 2.0` starts the side at 10 energy.
- `Icon 1.5` gives every selected character +3 Critical percentage points.

**BASELINE:** Fractional internal stat values are permitted. The UI may display one decimal where necessary.

## 20.5 Trait caps

Recommended battle caps:

```text
maximum contribution from selected squad: 3.0 total in a single trait
maximum starting energy from Historic synergy: 20
```

A future mode may introduce special characters or modifiers that exceed normal contribution, but standard content should remain within these boundaries.

## 20.6 Special authored combos

**EXTENSION:** The engine may support named combinations in addition to generic traits.

Examples:

- exact character pairs;
- three members of a named faction;
- rival pair;
- family pair;
- three variants of the same character;
- three identical character definitions.

Named combos must be data-defined and should remain exceptional. Generic trait synergy is the primary system.

## 20.7 Synergy UI

Battle Setup must show:

- every selected character's type and traits;
- total trait scores;
- exact bonuses produced;
- type coverage and vulnerabilities;
- named special combos if any;
- how the result changes while characters are added or removed.

Nothing should require memorising hidden group memberships.

---

# 21. Locked initial roster mapping

The launch framework begins with six characters, one for each type.

| Character     | Combat type  | Traits          |
| ------------- | ------------ | --------------- |
| Tux           | Tech         | Icon            |
| Humpty Dumpty | Oddball      | Icon            |
| Moses         | Arcane       | Hero, Mythic    |
| Viking        | Brawler      | Historic        |
| Ned Kelly     | Sharpshooter | Hero, Historic  |
| Grim Reaper   | Beast        | Monster, Mythic |

This mapping is locked.

The six types are therefore immediately represented in the initial playable roster.

## 21.1 Recommended initial mechanical roles

These are **BASELINE content proposals**, not permanent identity restrictions:

| Character     | Suggested role                                                            |
| ------------- | ------------------------------------------------------------------------- |
| Tux           | tempo controller, bar manipulation and precise multi-hit Tech attacks     |
| Humpty Dumpty | strange utility, drops, random authored outcomes and defence disruption   |
| Moses         | support-controller with shields, team recovery and Arcane control         |
| Viking        | durable close-range Power stacker with high-commitment Brawler attacks    |
| Ned Kelly     | accurate single-target burst, counters and Sharpshooter finishing attacks |
| Grim Reaper   | attrition, life steal, damage over time and Beast group pressure          |

Every character still receives exactly three actions and can be built differently through stats, placement, enhancements and modifications.

## 21.2 Example starter action kits

The names below are placeholders that content agents may improve without changing the mechanics.

### Tux

1. **Kernel Peck**  
   Multi-hit single-target damage. Each hit independently rolls dodge and critical. Gold adds minor energy drain. Platinum adds one hit and shield piercing.

2. **Root Access**  
   Opponent bar slow plus a small flat drain. Gold extends duration. Platinum briefly locks the opponent's currently highest-cost action.

3. **System Upgrade**  
   Team Speed increase and accessory charge. Gold adds a small Power increase. Platinum generates a beneficial battle drop.

### Humpty Dumpty

1. **Shell Game**  
   Single-target damage with a chance to generate a random authored drop for the user. Gold increases drop chance. Platinum creates two choices and lets the player select one.

2. **Great Fall**  
   Group damage with lower per-target output and Defence Down. Gold improves Defence Down. Platinum adds a short active-target stun.

3. **Put Me Together**  
   Self or team healing with cleanse. Gold increases healing. Platinum converts excess healing into shield.

### Moses

1. **Parting Line**  
   Single-target Arcane damage and bar drain. Gold increases drain. Platinum also applies Switch Lock.

2. **Guiding Light**  
   Team shield. Gold heals when the shield ends. Platinum grants interruption resistance while shielded.

3. **Commandment**  
   Charge-up team control action. Briefly stuns the active enemy and applies Power Down to the enemy team. Gold casts faster. Platinum cannot be interrupted once half charged.

### Viking

1. **Axe Tap**  
   Quick direct damage. Gold adds a stackable Power increase. Platinum gains bonus damage for each Power stack.

2. **War Cry**  
   Stackable Power and Defence increase. Gold adds Speed. Platinum grants one-hit interruption immunity.

3. **Longship Crash**  
   High-commitment group damage. Gold adds bar drain. Platinum is undodgeable against the active target while bench targets roll normally.

### Ned Kelly

1. **Warning Shot**  
   Accurate single-target damage with elevated critical chance. Gold adds Power Down. Platinum becomes undodgeable.

2. **Iron Suit**  
   Counter stance and Defence increase. Gold lasts longer. Platinum returns a portion of damage and grants energy on counter.

3. **Last Stand**  
   Heavy single-target damage scaling with missing HP. Gold gains shield piercing. Platinum guarantees a critical hit below a defined HP threshold.

### Grim Reaper

1. **Cold Touch**  
   Single-target damage and damage over time. Gold extends duration. Platinum applies Heal Block.

2. **Soul Tax**  
   Life-steal attack. Gold increases healing. Platinum drains bar based on healing received.

3. **Final Harvest**  
   Charge-up group damage with an execute bonus against low-health enemies. Gold charges faster. Platinum generates a heal-team drop for each enemy defeated.

These kits exist to prove the complete primitive library. The final art, names, numbers and story context remain content work.

---

# 22. Character instances, duplicates and variants

## 22.1 Definition versus instance

A character definition describes shared identity and base content.

A character instance describes one owned copy.

Definition data includes:

- name;
- type;
- traits;
- base stats and growth;
- three action definitions;
- default placements;
- available variants;
- asset references;
- dialogue and music references;
- shop and unlock metadata.

Instance data includes:

- unique instance ID;
- character definition ID;
- level and XP;
- allocated stats;
- Stock, Gold or Platinum tier for each action;
- configured action placement;
- equipped modification;
- selected visual variant;
- acquisition data;
- saved loadouts;
- favourite state;
- sale value.

## 22.2 Duplicates

**LOCKED:** Exact duplicate character instances can be owned and used together.

The player may deploy:

- three exact copies of one character;
- different variants of the same character;
- any legal mixture of definitions and instances.

Each instance has its own:

- level;
- XP;
- allocated stats;
- action enhancement;
- modification;
- loadout;
- tournament health state.

## 22.3 Variants and repaints

**LOCKED:** A normal repaint is cosmetic.

It may change:

- palette;
- costume colours;
- card frame;
- portrait;
- battle artwork;
- particles;
- entrance treatment.

It does not change type, traits, base stats or actions.

A true gameplay variant is represented as a separate character definition and must be clearly labelled. Avoid this in the initial scope because it increases balance and art requirements.

## 22.4 Duplicate enhancement resource

The source inspiration used duplicate figures as enhancement material. This project should preserve duplicate value without forcing destructive mistakes.

**BASELINE:** Duplicates may be converted voluntarily into **Enhancement Cores** or an eventual original equivalent.

Rules:

- conversion is explicit and reversible only before confirmation;
- favourited or Active Roster characters cannot be converted without removal and a second confirmation;
- same-definition duplicates grant a bonus amount of enhancement progress;
- generic cores can also be earned through Story, missions and tournaments;
- action enhancement requires currency plus cores;
- a player is never required to destroy a rare duplicate if they prefer to keep and use it.

## 22.5 Selling

**LOCKED:** Characters and modifications can be sold without punitive loss.

**BASELINE:** Selling a character instance refunds:

- its recorded acquisition value;
- all currency spent on its action enhancements;
- no refund for XP, because XP is not purchased;
- the equipped modification is returned to inventory;
- the character instance and its individual upgrades are removed.

This prevents experimentation from becoming a trap.

---

# 23. Action enhancement

## 23.1 Three permanent tiers

**LOCKED:** Every one of a character instance's three actions has exactly three permanent enhancement states:

1. **Stock**
2. **Gold**
3. **Platinum**

Enhancement belongs to the owned character instance, not globally to the character definition.

If the player owns two copies of Tux, upgrading one copy's action does not upgrade the other copy.

## 23.2 Unlock level

**LOCKED:** Action enhancement unlocks at character level 10, together with action placement configuration.

The player can preview enhancements before level 10 but cannot purchase them.

## 23.3 Enhancement philosophy

An enhancement may improve:

- base magnitude;
- scaling ratio;
- hit count;
- status chance;
- status duration;
- charge time;
- interrupt resistance;
- target scope;
- bar gain or drain;
- shield piercing;
- undodgeable behaviour;
- secondary effect;
- drop generation;
- conditional bonus;
- presentation intensity.

**LOCKED:** An enhancement never makes the action worse in one respect as a trade-off.

Gold and Platinum are always upgrades.

## 23.4 Baseline enhancement model

**BASELINE:**

### Gold

- approximately 10% to 15% primary magnitude improvement; and
- one small mechanical enhancement.

### Platinum

- approximately a further 10% to 15% primary magnitude improvement; and
- one meaningful additional effect or a substantial upgrade to the Gold effect.

Not every action must use the same percentage. Control actions may improve duration or reliability instead of raw damage.

## 23.5 Enhancement preview

The purchase screen must show exact before-and-after values for the character's current level, stats and default placement.

Example:

```text
Stock
Damage: 17
Defence Down: 40% chance, 5 seconds

Gold
Damage: 19
Defence Down: 55% chance, 5 seconds

Platinum
Damage: 22
Defence Down: 70% chance, 7 seconds
Bar drain: 5 energy
```

No purchase should rely on vague labels such as “better” or “more powerful”.

## 23.6 Irreversibility

**LOCKED:** Purchased enhancements are permanent for that character instance and do not need to be reverted.

They can be sold only by selling the character instance, with the documented full currency refund.

---

# 24. Modifications

## 24.1 Core rules

**LOCKED:**

- every character has one modification slot;
- the slot unlocks at level 5;
- modifications are reusable;
- changing a modification is free outside battle;
- one physical modification instance can be equipped by only one character at a time;
- some modifications can require a particular combat type or trait;
- modifications do not have levels;
- modifications are not consumable;
- removing a modification never destroys it;
- modifications cannot be changed during an active tournament run;
- Story-specific one-off modifications are not required.

The final in-world term should be original. Until named, the schema uses `modification`.

## 24.2 Modification categories

### Stat modifications

- maximum HP;
- Power;
- Defence;
- Speed;
- Dodge;
- Critical;
- status resistance;
- healing strength.

### Bar modifications

- start with energy;
- faster bar for a limited period after entry;
- energy on hit;
- energy on dodge;
- lower cost for one action band;
- partial refund after interruption;
- opponent bar curse at battle start.

### Charge modifications

- faster charge;
- chance to cast instantly;
- chance not to be interrupted;
- guaranteed completion once a charge passes a threshold;
- increased charge magnitude.

### Defensive modifications

- entry shield;
- damage reflection;
- counter on dodge;
- low-health protection;
- stun resistance;
- Heal Block resistance;
- first-hit reduction.

### Utility modifications

- chance to generate a battle drop;
- stronger drops;
- accessory charge gain;
- bonus currency;
- bonus XP;
- once-per-battle cleanse;
- type-specific passive.

## 24.3 Baseline examples

| Working name      | Effect                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Master Caster     | 50% chance that damage will not interrupt a charge-up action                               |
| Fast Cast         | Charge-up time reduced by 35%                                                              |
| Instant Spark     | Charge-up actions have a 15% chance to complete instantly                                  |
| Quick Start       | Start with 12 energy                                                                       |
| Front Loader      | Bar fills 30% faster for four seconds after this character becomes active, once per battle |
| Iron Nerves       | Stun duration reduced by 35%                                                               |
| Hard Shell        | +5 Defence                                                                                 |
| Heavy Hitter      | +5 Power                                                                                   |
| Long Haul         | +20 maximum HP                                                                             |
| Critical Patch    | +8 Critical percentage points                                                              |
| Reflex Patch      | +8 Dodge percentage points                                                                 |
| Clean Entry       | First switch-in cleanses one removable negative status                                     |
| Drop Magnet       | Battle-drop generation chance increased by 20% relative                                    |
| Historian's Spark | Historic trait required; +8 additional starting energy while selected                      |
| Beast Guard       | Beast type required; receive 15% less damage from Sharpshooter characters                  |

Names and exact values remain content and balance data.

## 24.4 Comparison UI

When selecting a modification, display:

- current modification;
- candidate modification;
- exact stat and rule changes;
- eligibility restrictions;
- which character currently holds the candidate;
- an option to move it from the current holder;
- tournament lock warning;
- searchable and filterable inventory.

---

# 25. Team accessories

## 25.1 Role

A team accessory is a high-impact battle tool selected for the side rather than an individual character.

It provides an additional tactical axis without becoming a fourth character action.

## 25.2 Core rules

**BASELINE:**

- one accessory per side;
- selected on Battle Setup;
- one owned accessory instance can be assigned to one active loadout at a time where inventory ownership matters;
- accessories use a separate 0 to 100 charge meter;
- accessory charge is visible;
- charge is gained through completed actions and authored effects;
- an accessory can be used again after recharging unless it has a per-battle use limit;
- accessory choice is locked for an active tournament run;
- sandbox modes expose all accessories;
- Story and Profile modes use owned accessories.

## 25.3 Baseline charge rules

```text
successful Band 1 action: +12 accessory charge
successful Band 2 action: +18 accessory charge
successful Band 3 action: +25 accessory charge
dodged or interrupted action: no normal completion charge
```

Actions, modifications and statuses may modify these amounts.

## 25.4 Accessory examples

- heal the whole team;
- instantly add team energy;
- briefly freeze the opponent bar;
- cleanse all allied characters;
- apply a short shield to all allies;
- deal neutral damage to the active enemy;
- generate three battle drops and allow one choice;
- revive a defeated character between tournament rounds only;
- grant starting Power stacks for the next tournament round;
- remove all hostile bar hazards.

## 25.5 Balance rules

- an accessory cannot be required to make a normal character kit functional;
- the strongest accessories need longer charge or a use limit;
- the AI must understand accessory timing;
- an opponent's accessory and charge are visible;
- Story battles may author opponents without accessories or with fixed accessories;
- accessory effects use the same reusable effect primitives as actions.

---

# 26. Collection and Active Roster

## 26.1 Unlimited collection

The player may own an unrestricted number of character instances subject only to practical save and interface constraints.

The collection supports:

- search;
- sort;
- filter by type;
- filter by trait;
- filter by level;
- filter by enhancement;
- filter by modification state;
- filter by favourite;
- filter by owned or locked definition;
- duplicate grouping;
- variant grouping;
- collection completion;
- secret silhouettes;
- visible unlock hints where appropriate.

## 26.2 Six-character Active Roster

**LOCKED:** Story and Profile rulesets use a six-character Active Roster.

This resolves the earlier uncertainty between seven and eight. Six provides:

- clear screen layout;
- meaningful tournament registration;
- enough type and role coverage;
- direct inspiration from the observed six-slot squad-management presentation;
- manageable decisions before each battle.

The player can change the Active Roster freely outside an active tournament and outside a battle.

## 26.3 Battle selection from the roster

In Story and Profile play:

- the Active Roster contains up to six owned character instances;
- Battle Setup selects one to three from those six;
- a Story node may lend temporary characters;
- a Story node may require, prohibit or preselect characters;
- restrictions should give options rather than arbitrarily remove the player's earned collection;
- borrowed characters never remove or overwrite owned characters.

In Sandbox play:

- no collection or Active Roster ownership restriction applies;
- the setup screen may still use a temporary six-character roster for interface consistency;
- the player can create and save presets.

## 26.4 Roster persistence

The Active Roster stores:

- ordered six instance IDs;
- default battle trio;
- accessory preset;
- optional name;
- optional music preset;
- last-used state.

Saved loadouts can preserve multiple rosters.

---

# 27. Character selection and Battle Setup screen

## 27.1 Purpose

Battle Setup must accomplish all of the following without requiring the player to navigate several disconnected screens:

- understand the opponent;
- choose one to three characters;
- understand type matchups;
- understand trait synergy;
- choose an accessory;
- inspect actions and expected values;
- validate Story or tournament restrictions;
- start the battle confidently.

## 27.2 Desktop layout

**BASELINE:** Landscape desktop layout uses four zones.

```text
┌───────────────────────────────────────────────────────────────────────┐
│ Header: mode, battle name, difficulty, rules, opponent summary       │
├──────────────────────┬──────────────────────────┬─────────────────────┤
│ Opponent preview     │ Selected battle team     │ Matchup and synergy │
│ 1–3 cards            │ 3 large pedestals/cards │ Type wheel          │
│ actions and levels   │ drag/drop or click       │ Trait bonuses       │
├──────────────────────┴──────────────────────────┴─────────────────────┤
│ Active Roster: six ordered character instance cards                  │
├───────────────────────────────────────────────────────────────────────┤
│ Accessory | Music | Rules details | Start Battle                     │
└───────────────────────────────────────────────────────────────────────┘
```

## 27.3 Selected team

The centre presents three large slots.

Each slot shows:

- character portrait or full figure panel;
- display name;
- level;
- current and maximum HP for tournament selection;
- combat type;
- traits;
- projected strong, weak or neutral relationship against the opponent's likely active character;
- modification icon;
- three action icons at their configured placements;
- Stock, Gold or Platinum indicators;
- status such as defeated, locked, borrowed or required.

The first selected slot is the starting active character unless the player changes the start order.

## 27.4 Six-card roster strip

Each Active Roster card shows:

- artwork;
- instance level;
- type icon;
- trait icons;
- HP state where tournament health persists;
- modification;
- selected state;
- legal or illegal state;
- duplicate-instance marker where useful.

Input methods:

- drag and drop;
- click or tap to add or remove;
- keyboard focus and Enter or Space;
- controller-ready focus architecture as an extension.

## 27.5 Opponent information

**LOCKED:** Opponent information is not hidden.

Show:

- one to three opponent characters;
- levels;
- current HP in tournaments;
- type;
- traits and synergy;
- stats or a clear stat summary;
- three actions;
- action placements;
- action enhancement tiers;
- modification;
- accessory;
- special battle rules;
- AI difficulty;
- authored hidden surprises only where a story specifically frames them as a discoverable mechanic, never as an unexplained cheat.

## 27.6 Type wheel panel

The type wheel is always available on this screen.

It highlights:

- selected starting character;
- opponent starting character;
- strong relationship;
- weak relationship;
- neutral relationship;
- untyped state.

## 27.7 Trait synergy panel

The panel recalculates live and shows exact values.

Example:

```text
Hero 1.0      +3 HP to selected characters
Historic 1.5  +7.5 starting energy
Mythic 0.5    +2% bar speed
```

## 27.8 Accessory selection

The accessory panel shows:

- current accessory;
- charge rule;
- effect;
- use limit;
- ownership or sandbox availability;
- eligibility;
- tournament lock notice.

## 27.9 Validation

The Start button is enabled only when:

- at least one legal character is selected;
- no more than three are selected;
- every selected Profile character is a unique owned instance;
- tournament characters are alive;
- Story restrictions are satisfied;
- borrowed characters are correctly included;
- action configurations are legal;
- modification assignments are legal;
- accessory is legal;
- no selected character is simultaneously registered where an exclusive inventory rule prevents it.

Validation errors must state the exact fix.

## 27.10 Quick comparison

Hovering, focusing or long-pressing an action shows:

- target;
- current placement and cost;
- projected magnitude;
- charge time;
- interruptibility;
- current tier;
- secondary effects;
- strong or weak type result;
- how the value changes against each opponent.

---

# 28. Character management screen

## 28.1 Structure

The character screen combines:

- large selected-character artwork;
- instance selector for duplicates;
- level and XP;
- six stats;
- unspent points;
- type and traits;
- three actions;
- action positions;
- action tiers;
- modification slot;
- repaint or variant;
- Active Roster controls;
- sell and favourite actions;
- saved loadouts.

## 28.2 Tabs

Recommended tabs:

1. Overview
2. Stats
3. Actions
4. Modification
5. Appearance
6. History or Records

## 28.3 Stats tab

- show base, automatic growth, allocated, trait, modification and temporary-preview contributions separately;
- allow one-click plus and minus;
- allow reset all;
- allow named loadouts;
- warn only when leaving unspent points, not as a blocking error;
- prevent changes during battle or active tournament.

## 28.4 Actions tab

Before level 10:

- show three default actions;
- show their positions;
- preview all nine placement outcomes;
- show Gold and Platinum previews;
- explain level-10 unlock.

After level 10:

- drag or select actions into Bands 1, 2 and 3;
- choose L, normal or H within each band;
- preview costs and effects live;
- validate one action per band;
- purchase Gold or Platinum enhancements;
- save configuration in a loadout.

## 28.5 Modification tab

- show one slot;
- show level-5 unlock if locked;
- compare inventory;
- filter eligible items;
- freely swap;
- show another holder and offer to move the item;
- prevent changes during an active tournament.

## 28.6 Appearance tab

- select repaint;
- preview all relevant art surfaces;
- show cosmetic-only label;
- avoid implying stat differences;
- preserve gameplay build when changing appearance.

---

# 29. Quick Match

## 29.1 Purpose

Quick Match is the fastest path from menu to battle.

It supports:

- immediate casual play;
- character experimentation;
- action and balance testing;
- AI versus AI observation;
- trying characters before buying them in Story Mode;
- custom matchups;
- saved presets;
- replaying a favourite battle without Story navigation.

## 29.2 Quick Match flows

### Quick Start

The player chooses:

- one character or a saved team;
- opponent difficulty;
- Start.

The game supplies sane defaults for everything else.

Target interaction count from Main Menu to battle: three to five inputs.

### Custom Match

The player can configure:

- controller for each side;
- one to three characters per side;
- starting active character;
- levels;
- stat allocations;
- action positions;
- action enhancement tiers;
- modifications;
- accessories;
- difficulty;
- battle time limit;
- starting energy;
- bar speed;
- type rules;
- trait rules;
- drop frequency;
- hazards;
- arena;
- music;
- presentation intensity;
- random seed;
- battle speed;
- special rules.

### Presets

Presets include:

- Balanced 3v3;
- Fast Bar;
- One-Hit Mayhem;
- No Types;
- No Traits;
- No Switching;
- Charge-Up Showcase;
- Team Damage Showcase;
- Level 1 Stock;
- Level 25 Platinum;
- Random Legal Teams;
- AI Tournament Test.

## 29.3 Sandbox and Profile toggle

### Sandbox Quick Match

- all content unlocked;
- no Story XP or currency;
- no permanent changes unless saving a preset;
- records sandbox win and usage statistics separately;
- supports unfair and experimental configurations.

### Profile Quick Match

- owned content and actual builds;
- validated opponent presets;
- modest repeatable rewards;
- mission progress only where a mission explicitly allows Quick Match;
- no reward when custom modifiers invalidate challenge rating;
- clear reward preview before battle.

## 29.4 Try before buying

The Store can open a Sandbox Quick Match using a prospective character.

The player can:

- use the character at a representative level;
- inspect Stock actions;
- optionally preview Gold and Platinum;
- fight a sensible demonstration opponent;
- return to the exact store listing.

This trial does not alter Story progression.

## 29.5 AI versus AI

Quick Match supports AI versus AI from the initial architecture.

Use cases:

- balance simulation;
- automated regression;
- entertainment;
- debugging;
- content validation;
- tournament preview;
- agent-driven batch tests.

The presentation may run at normal speed while headless simulation can run much faster.

---

# 30. Tournament Mode

## 30.1 Shared tournament engine

**LOCKED:** Story tournaments and standalone tournaments use the same tournament engine.

A tournament definition orchestrates:

- registration;
- rounds;
- opponents;
- between-round nodes;
- persistent health;
- defeats;
- rewards;
- final result;
- presentation.

It does not implement a separate combat engine.

## 30.2 Registered roster

**LOCKED:** A tournament run registers up to six characters.

Once the run begins:

- no outside character can be added;
- the registered character instances are fixed;
- their stat allocations are fixed;
- action positions are fixed;
- action enhancement tiers are fixed;
- modifications are fixed;
- accessory choice is fixed unless a tournament reward explicitly replaces or adds one for the run;
- cosmetic changes can be allowed only if they have no gameplay effect.

## 30.3 Round selection

Before each battle round:

- select one to three living registered characters;
- choose their starting order;
- inspect opponent information;
- inspect persistent HP;
- inspect run bonuses;
- inspect special rules;
- continue or abandon the tournament.

A defeated registered character cannot be selected until revived.

## 30.4 Persistent state

**LOCKED:** Between tournament battles:

- current HP persists;
- defeated state persists;
- XP and level do not update until the run ends unless a specific tournament rule allows mid-run levelling;
- transient battle statuses clear;
- normal shields clear;
- battle-bar energy resets to the next round's configured starting value;
- accessory charge resets unless the tournament definition says it persists;
- run bonuses and penalties persist;
- Story inventory outside the registered loadout is inaccessible.

This creates attrition without permanently damaging the player's collection.

## 30.5 Between-round node types

A tournament route can contain:

- Battle;
- Heal One;
- Heal Team;
- Revive One;
- Full Recovery;
- Currency Reward;
- Enhancement Resource Reward;
- Temporary Shop;
- Choose One of Three Rewards;
- Starting Energy Bonus;
- Starting Power Stacks;
- Starting Shield;
- Opponent Starts Stunned;
- Opponent Starts Slowed;
- Accessory Charge Bonus;
- Remove a Run Penalty;
- Add a Run Blessing;
- Random Authored Event;
- Story Dialogue;
- Rest Node;
- Risk and Reward Choice;
- Final Reward.

The node system must be data-driven.

## 30.6 Revival

**LOCKED:** Revival occurs only between tournament battles in the standard game.

A revive effect defines:

- which defeated character can be selected;
- restored HP percentage or amount;
- whether any run penalty applies;
- whether it is consumed;
- whether it can appear when no character is defeated.

A revive choice must not be generated when the registered roster has no defeated characters unless it can be converted into another reward.

## 30.7 Failure

**LOCKED:** Losing a tournament battle ends the run.

The player can:

- retry the tournament from the beginning;
- change difficulty before a new run;
- change registered roster before a new run;
- replay indefinitely;
- keep any explicitly banked rewards;
- receive partial participation rewards where the tournament defines them.

No entry ticket or paid retry is required in the baseline game.

## 30.8 Difficulty during a run

The global settings interface may change accessibility and presentation settings at any time.

**BASELINE resolution:** Combat difficulty is selected at tournament registration and locked for the run. This prevents changing difficulty immediately before a difficult round while preserving the user's freedom to restart at another difficulty.

A special casual tournament may allow mid-run difficulty changes, but this must be explicit.

## 30.9 Standalone tournament variants

### Exhibition Tournament

- all characters and builds available;
- custom or preset bracket;
- no Story progression rewards;
- supports AI versus AI;
- may use random legal opponents;
- ideal for experimentation.

### Profile Tournament

- owned collection;
- six-character registered roster;
- authored or validated bracket;
- XP, currency and mission progress;
- repeatable rewards;
- no custom rule exploit.

### Story Tournament

- accessed through a Story node;
- authored opponents and route;
- may include dialogue and scenes;
- uses Story collection unless characters are lent;
- grants Story progression and rewards;
- can be replayed after completion.

## 30.10 Bracket and route presentation

A tournament may use:

- visible bracket;
- linear gauntlet;
- branching reward route;
- chapter-card sequence;
- themed ladder;
- randomised but seeded bracket.

The same tournament data model supports all of these through nodes and edges.

## 30.11 Suspend and resume

Although the player should be able to complete a tournament in one sitting, local autosave must support safe suspend and resume between nodes.

Do not save in the middle of a combat simulation for the MVP. Save immediately:

- after registration;
- after a battle result;
- after a reward choice;
- after a shop purchase;
- before entering the next battle.

---

# 31. Story Mode

## 31.1 No-map campaign structure

**LOCKED:** Story Mode is a finite, authored graph of nodes.

The campaign should feel like an interactive animated series, illustrated serial, toy-commercial universe or graphic novel rather than a physical place the player walks through.

A node can be numbered or identified from `00` to any required value. Numbering is organisational and does not imply that every node is a battle.

## 31.2 Story node types

Required node types:

- Opening;
- Dialogue;
- Narration;
- Static Scene;
- Multi-panel Scene;
- Character Encounter;
- Battle;
- Boss Battle;
- Tutorial Battle;
- Shop;
- Reward;
- Character Unlock;
- Modification Unlock;
- Accessory Unlock;
- Mission Assignment;
- Mission Resolution;
- Choice;
- Branch;
- Merge;
- Tournament Entry;
- Tournament Round;
- Tournament Result;
- Media or Music Moment;
- Chapter Transition;
- Optional Challenge;
- Side Node;
- Ending;
- Defeat Scene;
- Replay Marker.

## 31.3 Example story flow

```text
00 Opening panels
01 Dialogue
02 Borrowed-character tutorial battle
03 Reward
04 Collection screen introduced
05 Store opens
06 Character encounter
07 Mission assigned
08 Optional challenge
09 Main battle
10 Choice
11 Branch dialogue A or B
12 Branches merge
13 Tournament registration
14 Tournament round one
15 Between-round recovery
16 Tournament final
17 Character unlock
18 Closing panels
19 Ending and replay options
```

## 31.4 Choices

**LOCKED:** Choices may influence reachable short-term nodes but cannot permanently lock the player out of content.

Rules:

- the player may replay a completed choice;
- alternate branches can be visited later;
- no choice deletes characters, progression or currency;
- no choice permanently blocks an ending from the save;
- a branch can change dialogue, immediate opponents, rewards or route;
- branches should merge when useful;
- the save records visited choices and all unlocked alternatives.

## 31.5 Replay

**LOCKED:** Completed nodes are directly replayable.

- dialogue can be skipped;
- dialogue can auto-advance;
- scenes can be skipped;
- completed battles can be replayed;
- a cleared battle may offer a skip or auto-resolve option where appropriate;
- replay rewards are clearly distinguished from first-clear rewards;
- replaying a choice can open another branch;
- completed events remain accessible unless there is a strong technical reason otherwise.

## 31.6 Borrowed and forced characters

Story nodes may:

- lend a character the player does not own;
- temporarily provide a required build;
- require an owned character;
- require a type or trait;
- cap squad size;
- preselect one or more characters;
- prohibit a character for narrative reasons.

Principles:

- Story overrides should give the player options, not confiscate earned progress;
- a borrowed character is clearly marked;
- a borrowed character does not become owned unless awarded;
- the player's original Active Roster is restored after the node;
- XP rules for borrowed characters are explicit;
- the Story may award the borrowed character after the sequence.

## 31.7 Canonical and independent stories

The content system supports:

- one canonical main story;
- character stories;
- side stories;
- unofficial or experimental stories;
- tournament arcs;
- event stories;
- tutorial campaign;
- villain campaign;
- alternate timelines;
- comedy episodes;
- challenge stories.

Every story is data-defined and uses the same node engine.

## 31.8 Story definition

A story defines:

- stable ID;
- display name;
- summary;
- cover artwork;
- status;
- canonical or optional flag;
- first node;
- node graph;
- unlock conditions;
- completion conditions;
- first-clear rewards;
- replay rewards;
- default difficulty;
- allowed difficulties;
- associated music;
- chapter metadata;
- accessibility text;
- version.

## 31.9 Story path presentation

**BASELINE:** Use a horizontally scrolling chapter-board or stacked episode-card interface.

It combines:

- graphic-novel panels;
- visible node type icons;
- clear completed and available states;
- branch lines;
- chapter dividers;
- direct replay navigation;
- no implication of physical walking.

The renderer may adapt to vertical mobile layouts later without changing the story graph.

## 31.10 Story economy

Story Mode owns canonical:

- currency;
- character collection;
- levels;
- XP;
- action enhancement;
- modifications;
- accessories;
- store unlocks;
- missions;
- campaign progression.

A Story can theme the visual representation of currency, but the underlying balance uses one global soft currency unless explicitly changed later.

---

# 32. Difficulty

## 32.1 Difficulty levels

**LOCKED:**

- Easy
- Normal
- Hard
- Brutal

Normal is the default.

## 32.2 Philosophy

### Easy

- strongly favours the player;
- AI makes plausible but forgiving choices;
- player-facing pacing remains engaging;
- the player should rarely lose while paying basic attention;
- full normal progression rewards;
- no shame or mechanical penalty.

### Normal

- fair default;
- meaningful tactical choices;
- loss is possible when ignoring type, health and opponent bar;
- intended authored balance.

### Hard

- improved AI planning;
- stronger authored enemy builds or visible stat modifiers;
- better switching and interruption timing;
- modest reward bonus;
- requires attention but not perfection.

### Brutal

- optimised authored builds;
- deeper AI lookahead;
- strong timing and resource denial;
- visible, documented enemy modifiers where used;
- intended for players who actively want pressure;
- still follows the same rules;
- no secret impossible dodge or damage cheats.

## 32.3 Commentary tone

Hard and Brutal may include humorous commentary praising or lightly mocking the player's desire for difficulty.

Example tone:

```text
“Excellent. Fun was apparently insufficient without statistical suffering.”
```

Commentary must not affect rewards or insult accessibility users.

## 32.4 Rewards

**LOCKED:** Easy and Normal provide the same base progression rewards.

**BASELINE:**

```text
Easy:   1.00× XP and currency
Normal: 1.00× XP and currency
Hard:   1.10× XP and currency
Brutal: 1.20× XP and currency
```

No character, ending or essential item is exclusive to Hard or Brutal.

## 32.5 Difficulty implementation

Difficulty may change:

- AI evaluation depth;
- AI decision delay;
- AI willingness to hold energy;
- switching quality;
- action timing;
- target priority;
- opponent level or authored build;
- visible Power, Health or Speed modifier;
- mistake probability;
- use of accessory;
- tournament recovery generosity.

Difficulty must not silently:

- change player action results after preview;
- ignore player control effects;
- invent energy;
- bypass action costs;
- see hidden random outcomes;
- violate switching rules;
- gain unexplained immunity.

---

# 33. AI opponents

## 33.1 Same rules

**LOCKED:** AI follows the same action, bar, target, switching, status and accessory rules as a human by default.

Bosses may have authored passives or battle rules, but those are visible and use normal engine primitives.

## 33.2 Information access

AI can inspect:

- all visible bars;
- all visible HP;
- all action definitions;
- placements and costs;
- stats;
- types and traits;
- modifications;
- accessories;
- statuses;
- expected action values;
- battle time;
- tournament persistence;
- known battle rules.

AI cannot inspect future seeded random rolls.

## 33.3 Utility evaluation

At each decision point, AI generates legal candidates:

- use available action;
- hold energy;
- switch;
- activate accessory;
- collect a battle drop;
- clear a hazard;
- forfeit only in a debugging or special ruleset.

Each candidate receives utility components such as:

- expected damage;
- expected knockout value;
- expected team damage;
- effective healing without overheal;
- survival value;
- interrupt value;
- bar denial;
- future energy efficiency;
- type advantage;
- trait and passive interaction;
- low-health protection;
- tournament preservation;
- status value;
- accessory value;
- time-limit urgency;
- risk of being interrupted;
- opponent's visible near-ready action;
- combo setup value;
- switch value;
- penalty for predictable repetition.

## 33.4 Difficulty profiles

### Easy AI

- evaluates less often;
- adds a visible reaction delay;
- considers immediate utility only;
- sometimes spends energy inefficiently;
- switches less aggressively;
- may overheal or miss optimal interrupts;
- avoids nonsensical actions.

### Normal AI

- evaluates immediate utility;
- protects low-health characters;
- uses clear type advantages;
- uses accessories sensibly;
- sometimes holds for a stronger action;
- recognises obvious interrupts.

### Hard AI

- one- to two-action lookahead;
- tracks likely opponent thresholds;
- uses switches to manipulate active Speed and matchups;
- values tournament health;
- times bar drain before high-cost actions;
- builds and consumes Power stacks;
- avoids overcommitting into counters.

### Brutal AI

- deeper bounded lookahead;
- authored strategic profiles per team;
- strong charge interruption;
- optimal accessory timing;
- evaluates target-lock and simultaneous resolution;
- adapts to repeated player behaviour;
- uses deterministic tie-breaking rather than hidden advantages.

## 33.5 AI personalities

An opponent definition may assign a personality:

- Aggressive;
- Defensive;
- Controller;
- Tempo;
- Gambler;
- Healer;
- Counterattacker;
- Bar Denial;
- Tournament Survivor;
- Boss Script with utility fallback.

Personality adjusts weights, not legal rules.

## 33.6 AI performance

AI evaluation must be deterministic under a seed and decision state.

Headless AI-versus-AI simulation should support thousands of battles for balance analysis without Phaser.

---

# 34. Economy and rewards

## 34.1 Separation from combat

**LOCKED:** Combat does not directly mutate progression.

The combat engine emits a Battle Report. The mode and economy systems consume that report and calculate rewards.

Example:

```ts
interface BattleReport {
  battleId: string;
  rulesetId: string;
  seed: string;
  winnerSideId: string | null;
  endReason: "defeat" | "forfeit" | "timeout" | "objective" | "draw";
  durationMs: number;
  difficulty: "easy" | "normal" | "hard" | "brutal";
  participants: ParticipantBattleReport[];
  totalDamage: Record<string, number>;
  totalHealing: Record<string, number>;
  actionsUsed: Record<string, number>;
  charactersDefeated: string[];
  retries: number;
  context?: {
    storyNodeId?: string;
    tournamentRunId?: string;
    quickMatchProfileEligible?: boolean;
  };
}
```

## 34.2 Currency

**LOCKED:** Use one normal, uncapped, earnable in-game currency for the initial game.

It is used for:

- buying character instances;
- action enhancement;
- modifications;
- accessories;
- cosmetic repaints where desired;
- tournament shops;
- optional convenience that does not sell power for real money.

The final name is an original branding decision.

## 34.3 Reward inputs

Reward calculation can consider:

- victory or loss;
- opponent authored challenge rating;
- player team challenge rating;
- difficulty;
- first clear;
- replay;
- Story node;
- tournament round;
- mission context;
- underdog difference;
- time only as a small modifier;
- characters remaining only as a small modifier;
- special objective;
- event multiplier;
- reward caps.

Avoid systems that encourage:

- intentionally taking damage;
- deliberately extending battles;
- farming a broken custom setup;
- avoiding a finishing move to maximise score;
- repetitive mandatory grinding.

## 34.4 Baseline battle reward

Example:

```text
baseCurrency = authoredBattleValue
baseXP = authoredBattleXP

challengeMultiplier = clamp(enemyRating / max(playerRating, 1), 0.75, 1.50)
difficultyMultiplier = 1.00 / 1.00 / 1.10 / 1.20
resultMultiplier = victory ? 1.00 : 0.35 for XP, 0.15 for currency
repeatMultiplier = firstClear ? 1.00 : 0.80

reward = base × challenge × difficulty × result × repeat
```

Story first-clear and unlock rewards are added separately.

## 34.5 Full repeatability

Repeat fights should continue providing useful XP and currency.

**BASELINE:** Repeat-clear rewards use 80% of normal battle rewards, not a rapidly collapsing scale.

A battle that becomes an obviously dominant farming exploit can be adjusted through authored reward value or challenge validation rather than applying a universal punishment.

## 34.6 Economy simulation

Before finalising prices, the balance agent must simulate:

- time to buy a common character;
- time to buy a rare character;
- time to enhance one action to Gold;
- time to enhance one action to Platinum;
- time to bring a new character from its purchase level to useful Story parity;
- expected currency after one chapter;
- expected currency after one tournament;
- full-refund selling behaviour;
- rotating-store behaviour;
- duplicate conversion supply.

No price table is final until the whole loop is simulated.

---

# 35. Store

## 35.1 Store surfaces

The Store is accessible:

- from the Main Menu;
- from Story shop nodes;
- from Profile management;
- from between-round tournament shop nodes;
- from a character unlock prompt where relevant.

A Story shop node can apply a themed background, seller, dialogue, stock table or discount without creating a separate economy engine.

## 35.2 Stock model

**LOCKED:** Store inventory may rotate and prices may fluctuate, but the player should be able to find favourites.

**BASELINE:** Use three stock layers:

### Permanent catalogue

- common unlocked characters;
- common modifications;
- common accessories;
- previously discovered standard stock;
- searchable and always available.

### Featured rotation

- discounts;
- levelled character instances;
- rare characters;
- rare modifications;
- themed stock;
- limited selection refreshed by a deterministic schedule or Story event.

### Secret or gated stock

- silhouettes until discovered;
- Story, mission or tournament unlock conditions;
- special characters;
- event stock that remains accessible after completion where possible.

This preserves discovery without making favourite basics disappear.

## 35.3 Transparent listings

A character listing shows before purchase:

- exact character definition;
- exact level;
- exact price;
- type;
- traits;
- base and current stats;
- three actions;
- default placements;
- visual repaint if relevant;
- whether it is already owned and how many copies;
- sale value;
- try-before-buy button.

No blind purchase is required.

## 35.4 Purchased level

**BASELINE:** Store character instances can be offered from level 2 to level 10.

- the exact level is visible;
- higher-level stock costs more;
- Story rewards may grant level 1 or authored levels;
- no random hidden level is rolled after payment.

## 35.5 Rarity

Rarity affects:

- stock frequency;
- price;
- unlock conditions;
- presentation;
- collector value.

Rarity must not automatically mean strict combat superiority. A common character can remain strategically excellent.

Suggested rarity labels are placeholders until branding:

- Common;
- Uncommon;
- Rare;
- Exceptional;
- Secret.

Do not add a paid premium rarity.

## 35.6 Selling and refunds

The Store supports selling:

- character instances;
- modifications;
- accessories where permitted;
- duplicate resources.

Before selling:

- show full refund amount;
- show action-upgrade refund;
- return equipped reusable items;
- warn if in Active Roster or favourite;
- prevent selling a character registered in an active tournament;
- require deliberate confirmation for rare or enhanced instances.

---

# 36. Missions

## 36.1 Generic mission engine

Missions are data definitions evaluated from semantic game events.

A mission must not require mission-specific TypeScript.

## 36.2 Requirement primitives

The engine supports requirements such as:

- own a character;
- own a number of characters;
- own a character of a type;
- own a character with a trait;
- own a duplicate;
- reach a character level;
- spend stat points;
- configure an action placement;
- enhance an action;
- equip a modification;
- equip an accessory;
- buy a character;
- sell a character;
- defeat a character;
- defeat a type;
- win with a character;
- win with a type;
- win with a trait composition;
- land the final hit with a character;
- use an action;
- deal total damage;
- heal total HP;
- interrupt a charge;
- drain energy;
- generate or collect drops;
- win without a defeat;
- win under a time limit;
- win on a difficulty;
- complete a Story node;
- visit a branch;
- make a choice;
- complete a tournament;
- revive a tournament character;
- finish a tournament with a specified survivor;
- replay a node;
- complete a named combo.

## 36.3 Progress on losses

A requirement declares its loss policy:

- `alwaysCount`;
- `countOnlyOnVictory`;
- `countPartialOnLoss`;
- `resetOnLoss` for special challenges only.

Routine cumulative requirements such as total damage should normally count on a loss. Victory requirements obviously do not.

## 36.4 Rewards

Mission rewards can include:

- currency;
- XP;
- direct character XP;
- character instance;
- modification;
- accessory;
- Enhancement Cores;
- repaint;
- Story unlock;
- tournament unlock;
- Store stock unlock;
- music;
- artwork;
- profile badge;
- title;
- battle preset.

## 36.5 Vengeance mission

The engine explicitly supports vengeance or rivalry missions.

Example:

```text
Trigger: Character A loses to Character B in Story.
Requirement: Defeat Character B while Character A is selected.
Optional condition: Character A lands the final hit.
Reward: special scene, currency, enhancement resource and rivalry badge.
```

The requirement uses generic event predicates rather than a bespoke vengeance code path.

---

# 37. Battle HUD

## 37.1 Information architecture

The Battle HUD must keep combat readable without covering the panel-based art.

Recommended landscape layout:

```text
┌───────────────────────────────────────────────────────────────────────┐
│ Pause | Enemy bench | Enemy active HP/status | Enemy accessory       │
│ Enemy battle bar with action markers and cast indicator              │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│     Enemy active panel / figure                                      │
│                                                                       │
│                    battle presentation area                           │
│                                                                       │
│     Player active panel / figure                                     │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│ Player bench | Player active HP/status | battle drops | accessory     │
│ Player battle bar with three clickable action markers                │
└───────────────────────────────────────────────────────────────────────┘
```

## 37.2 Player information

Always visible:

- active character name and level;
- current and maximum HP;
- shield;
- type and traits;
- statuses and durations;
- three action icons;
- action energy positions;
- actual projected outcome;
- action availability;
- current charge or channel progress;
- bench character cards and HP;
- team synergy summary;
- battle bar;
- accessory meter;
- battle drops;
- battle time;
- special objective.

## 37.3 Opponent information

Always visible:

- active character;
- active and bench HP;
- statuses;
- opponent bar;
- action markers and costs;
- current charge;
- accessory and charge;
- current active type relationship;
- visible modifications and rules.

## 37.4 Action button states

Each action marker supports:

- locked before unlock or by Story rule;
- unavailable due to insufficient energy;
- ready;
- selected or hovered;
- charging;
- channelled;
- disabled;
- hazard-obscured;
- free cast;
- strong matchup;
- weak matchup;
- interrupt opportunity;
- enhanced tier;
- predicted outcome changed by live buffs.

The icon should glow or pulse when usable, but reduced-motion mode replaces motion with a static, high-contrast outline.

## 37.5 Action preview

On hover, focus or long press:

```text
Longship Crash
Placement: 3H
Cost: 95
Charge: 1.3 seconds
Targets: all enemies
Projected damage: 28 each
Active target: strong matchup
Critical chance: 14% per target
Secondary: drains 8 enemy energy
Interruptible: yes
```

## 37.6 Switching controls

Bench cards are direct switch controls.

A card clearly indicates:

- legal switch;
- defeated;
- stunned or locked;
- incoming committed target warning;
- type relationship if switched in;
- Speed impact on fill rate;
- entry passive ready or consumed.

Clicking a legal card switches immediately. Clicking an illegal card explains the reason.

## 37.7 Numbers and feedback

Use:

- damage numbers;
- healing numbers;
- shield numbers;
- energy gain and drain;
- critical label;
- dodge label;
- strong or weak label;
- interrupt label;
- cleanse label;
- stack count;
- status icons with duration;
- defeat confirmation.

Do not rely on colour alone.

---

# 38. Presentation and art system

## 38.1 Visual direction

The game uses a bright, cute, playful, stylised and slightly absurd tone with room for dramatic character-specific moments.

The visual language may combine:

- anime framing;
- toy or figurine presentation;
- comic panels;
- kinetic television graphics;
- fandom-aware humour;
- surreal character contrast;
- polished game-show or tournament energy.

The main shell should be visually coherent. Individual stories, tournaments and characters may have their own themed surfaces.

## 38.2 Static art as a deliberate style

**LOCKED:** The game does not depend on conventional full animation.

Motion is created through:

- two-frame character cycles;
- image swaps;
- translation;
- scale;
- rotation;
- squash and stretch;
- camera pan;
- camera zoom;
- screen shake;
- hit stop;
- flashes;
- glows;
- particles;
- overlays;
- motion lines;
- panel wipes;
- background parallax;
- lighting pulses;
- sound and music.

## 38.3 Character battle states

Required per combat-ready character:

- idle frame A;
- idle frame B;
- action 1 frame A;
- action 1 frame B;
- action 2 frame A;
- action 2 frame B;
- action 3 frame A;
- action 3 frame B;
- charge frame A and B where useful;
- hurt frame A and B;
- dodge frame A and B;
- stunned frame A and B;
- defeat frame A and B;
- victory frame A and B;
- optional switch-in frame;
- optional low-health frame.

Status visuals such as burn, poison, shield and Power Up normally use overlays rather than dedicated character art.

## 38.4 Large panels

Recommended larger assets:

- canonical portrait;
- collection card;
- store card;
- entrance panel;
- each action cut-in;
- victory panel;
- defeat panel;
- Story reaction panel;
- tournament entrance;
- rivalry scene;
- character unlock.

Large action art should avoid depicting a specific opponent so it remains reusable.

## 38.5 Action presentation tiers

### Band 1

- short anticipation;
- small movement;
- minimal camera shift;
- quick impact;
- no long interruption to play.

### Band 2

- clearer cut-in or zoom;
- moderate shake;
- stronger impact overlay;
- slightly longer hit stop.

### Band 3

- large rectangular cut-in;
- strong anticipation;
- camera focus;
- distinctive sound cue;
- larger impact;
- still short enough to preserve battle pace.

Charge-up and Platinum actions may intensify presentation independently of band.

## 38.6 Presentation primitives

The presentation layer should interpret semantic instructions such as:

- `bob`;
- `pulse`;
- `glow`;
- `slide`;
- `zoom`;
- `shake`;
- `flash`;
- `hitStop`;
- `recoil`;
- `tilt`;
- `fade`;
- `tint`;
- `particleBurst`;
- `numberPop`;
- `panelReveal`;
- `wipe`;
- `scale`;
- `hold`;
- `loop`;
- `speedLines`;
- `vignette`;
- `parallax`.

Actions reference presentation definitions rather than coding Phaser tweens directly inside action logic.

## 38.7 Entrance themes

Characters can have WWE-style entrance presentation:

- theme music association;
- entrance panel;
- name card;
- short character motion;
- optional line;
- arena lighting;
- trait or type graphics.

Entrance length must be skippable and reduced in repeated battles.

## 38.8 Asset consistency

Consistency comes from a repeatable asset-generation process, not identical silhouettes.

Every character asset request uses:

- canonical reference images;
- shared composition templates;
- fixed state definitions;
- safe zones;
- aspect ratio;
- lighting rules;
- output naming;
- review criteria;
- stable asset IDs.

---

# 39. Audio and music

## 39.1 Audio categories

Independent volume controls:

- master;
- music;
- sound effects;
- dialogue;
- interface.

## 39.2 Music surfaces

A single track catalogue can assign any track to:

- Main Menu;
- player profile;
- character theme;
- entrance;
- Story node;
- chapter;
- battle;
- tournament;
- victory;
- defeat;
- Store;
- collection.

The player may replace character-associated music with another unlocked or available track.

Vocal music is allowed during battle.

## 39.3 Track selection priority

Recommended priority:

1. explicit Story or tournament battle track;
2. explicit arena track;
3. starting active character entrance theme for entrance only;
4. mode battle pool;
5. global fallback.

A Story node can specify whether music continues into the next node or fades.

## 39.4 Dialogue

Character speech is occasional, not attached to every action.

Possible triggers:

- entrance;
- first switch-in;
- rare action line;
- low health;
- rivalry;
- victory;
- defeat;
- Story dialogue;
- tournament final.

Dialogue overlays combat and does not pause it unless it is part of a Story scene outside battle.

Subtitles are supported independently from spoken audio.

## 39.5 Sound effects

Required logical sound IDs include:

- bar threshold;
- action ready;
- action commit;
- charge;
- interrupt;
- direct hit;
- group hit;
- critical;
- dodge;
- heal;
- shield;
- stun;
- status;
- bar gain;
- bar drain;
- battle drop;
- switch;
- defeat;
- victory;
- reward;
- purchase;
- level up;
- enhancement;
- modification equip;
- tournament transition;
- Story panel transition.

Audio files can be replaced without changing logical IDs.

---

# 40. Technical architecture

## 40.1 Stack

**LOCKED preferred stack:**

- Node.js 22;
- pnpm 11;
- mise;
- TypeScript;
- Vite;
- Phaser;
- Vitest;
- ESLint;
- Prettier;
- Zod or JSON Schema validation;
- optional Capacitor later;
- Cloudflare hosting or services later where useful.

## 40.2 Fundamental boundary

**LOCKED:** Gameplay modules must not import Phaser.

Phaser consumes state and semantic events from the gameplay engine.

The gameplay engine must run:

- in Vitest;
- in Node without a DOM;
- in batch simulation;
- in AI-versus-AI mode;
- in replay validation;
- under a future alternate renderer.

## 40.3 Suggested module structure

```text
src/
├── app/
├── game/
├── combat/
│   ├── engine/
│   ├── commands/
│   ├── events/
│   ├── actions/
│   ├── effects/
│   ├── statuses/
│   ├── ai/
│   ├── calculations/
│   ├── replay/
│   └── validation/
├── progression/
├── economy/
├── collection/
├── store/
├── missions/
├── tournaments/
├── stories/
├── saves/
├── content/
│   ├── schemas/
│   ├── definitions/
│   ├── compiler/
│   └── validation/
├── presentation/
│   ├── phaser/
│   ├── animation/
│   ├── ui/
│   └── accessibility/
├── audio/
├── assets/
└── telemetry/
```

## 40.4 Commands

Core combat commands:

```ts
type BattleCommand =
  | StartBattleCommand
  | SelectActionCommand
  | SwitchCharacterCommand
  | UseAccessoryCommand
  | CollectBattleDropCommand
  | ClearBarHazardCommand
  | PauseBattleCommand
  | ResumeBattleCommand
  | ForfeitBattleCommand;
```

A command includes:

- battle ID;
- side ID;
- controller ID;
- simulation tick;
- sequence;
- payload;
- optional client input time for diagnostics.

The engine validates commands and returns accepted or rejected events.

## 40.5 Semantic events

Required events include:

```text
BattleCreated
BattleStarted
CountdownStarted
CountdownCompleted
CommandRejected
BarChanged
BarSpeedChanged
ActionBecameReady
ActionCommitted
ActionCostPaid
ChargeStarted
ChargeProgressed
ChargeCompleted
ChannelStarted
ChannelTicked
ActionInterrupted
ActionCancelled
HitScheduled
HitDodged
HitCritical
DamageCalculated
DamageApplied
HealingApplied
ShieldApplied
ShieldBroken
StatusApplied
StatusStacked
StatusTicked
StatusExpired
StatusCleansed
EnergyGained
EnergyDrained
ActionSlotLocked
BarHazardApplied
BattleDropSpawned
BattleDropCollected
AccessoryChargeChanged
AccessoryActivated
CharacterSwitchRequested
CharacterSwitched
CharacterDefeated
ReplacementRequired
CharacterBecameActive
BattleTimedOut
BattleForfeited
BattleEnded
```

The presentation layer listens to these events. It never decides damage, legality or targeting.

## 40.6 State immutability and snapshots

Recommended:

- combat reducer receives state, command and deterministic context;
- it returns updated state and events;
- state snapshots are serialisable;
- debug builds can retain periodic snapshots;
- replay begins from initial snapshot plus command stream;
- event versioning permits future replay migrations or clear incompatibility messages.

## 40.7 Fixed-point calculations

Use fixed-point integers for:

- energy;
- percentages;
- multipliers;
- durations in ticks;
- fractional trait contributions;
- fractional stats where needed.

Avoid platform-dependent floating-point divergence in authoritative simulation.

Example:

```text
100.0 energy → 100000 milli-energy
1.25 multiplier → 12500 basis points
7.5 Historic energy → 7500 milli-energy
```

## 40.8 Random number generator

The RNG module must:

- accept an explicit seed;
- expose deterministic named streams or a documented sequence;
- record important roll events in debug traces;
- prevent presentation code from consuming gameplay RNG;
- allow tests to inject controlled rolls;
- support save and replay.

Recommended streams:

- combat hit and dodge;
- combat critical;
- combat statuses;
- action random choices;
- AI tie-breaks;
- rewards;
- Store rotation;
- Story random events.

Separate streams prevent a cosmetic or AI change from unexpectedly changing hit rolls.

## 40.9 Content compiler

Raw authoring content is compiled and validated into runtime definitions.

The compiler should:

- resolve stable IDs;
- verify references;
- verify one action per standard band in defaults;
- verify effect parameters;
- calculate previews where possible;
- reject impossible Story graphs;
- reject tournament reward nodes that cannot be used;
- verify every character has required assets or fallbacks;
- generate TypeScript types or validated JSON;
- produce human-readable validation errors;
- generate content indices;
- support content versioning.

## 40.10 No hard-coded content

Do not use code such as:

```ts
if (character.name === "Tux") {
  // special combat behaviour
}
```

Use:

- passive definitions;
- conditions;
- effects;
- tags;
- scripted boss rules represented in data;
- extension hooks with stable generic semantics.

A truly new mechanic may require engine code, but character identity alone must not.

---

# 41. Data model examples

The exact final interfaces may evolve, but these fields express required capabilities.

## 41.1 Character definition

```ts
interface CharacterDefinition {
  id: CharacterDefinitionId;
  displayName: string;
  type: CombatType | "untyped";
  traits: TraitId[]; // 0–2

  baseStats: {
    health: number;
    power: number;
    defence: number;
    speed: number;
    dodgeBasisPoints: number;
    criticalBasisPoints: number;
  };

  growthPerLevel: {
    health: number;
    power: number;
    defence: number;
    speed: number;
    dodgeBasisPoints: number;
    criticalBasisPoints: number;
  };

  actions: [ActionDefinitionId, ActionDefinitionId, ActionDefinitionId];
  defaultActionConfiguration: ActionConfiguration;
  passiveIds: PassiveDefinitionId[];
  variantIds: VisualVariantId[];

  assets: CharacterAssetReferences;
  audio: CharacterAudioReferences;
  music?: MusicTrackId;

  collection: {
    rarity: string;
    secretUntilUnlocked: boolean;
    storeTags: string[];
    unlockHint?: string;
  };
}
```

## 41.2 Character instance

```ts
interface CharacterInstance {
  id: CharacterInstanceId;
  definitionId: CharacterDefinitionId;

  level: number; // 1–25
  xp: number;
  unspentStatPoints: number;

  allocatedStats: {
    health: number;
    power: number;
    defence: number;
    speed: number;
    dodge: number;
    critical: number;
  };

  actionConfiguration: ActionConfiguration;

  enhancements: Record<ActionDefinitionId, "stock" | "gold" | "platinum">;
  modificationInstanceId?: ModificationInstanceId;
  visualVariantId: VisualVariantId;

  favourite: boolean;
  acquiredAt: string;
  acquisitionValue: number;
  enhancementCurrencySpent: number;

  savedLoadoutIds: LoadoutId[];
}
```

## 41.3 Action configuration

```ts
type ActionBand = 1 | 2 | 3;
type BandPosition = "low" | "normal" | "high";

interface ActionPlacement {
  actionId: ActionDefinitionId;
  band: ActionBand;
  position: BandPosition;
}

interface ActionConfiguration {
  placements: [ActionPlacement, ActionPlacement, ActionPlacement];
}
```

Validation requires one placement in each band under standard rules.

## 41.4 Action definition

```ts
interface ActionDefinition {
  id: ActionDefinitionId;
  displayName: string;
  description: string;
  tags: string[];

  targeting: TargetSelectorDefinition;
  execution: ActionExecutionDefinition;
  effects: EffectDefinition[];

  placementScaling: PlacementScalingDefinition;
  enhancement: {
    gold: ActionEnhancementPatch;
    platinum: ActionEnhancementPatch;
  };

  conditions?: ConditionDefinition[];
  ai: ActionAiMetadata;
  presentation: PresentationDefinitionId;
  assets: ActionAssetReferences;
  audio: ActionAudioReferences;

  accessibility: {
    conciseDescription: string;
    detailedDescription: string;
  };
}
```

## 41.5 Execution definition

```ts
type ActionExecutionDefinition =
  | { kind: "instant"; impactDelayMs: number }
  | {
      kind: "charge";
      chargeMs: number;
      interruptibleByDamage: boolean;
      cancelOnStun: boolean;
      cancelOnCasterDefeat: boolean;
      pauseOwnBarDuringCast: boolean;
    }
  | {
      kind: "channel";
      durationMs: number;
      tickEveryMs: number;
      interruptibleByDamage: boolean;
      cancelOnStun: boolean;
    }
  | { kind: "stance"; durationMs: number }
  | { kind: "delayed"; delayMs: number; cancelOnCasterDefeat: boolean }
  | { kind: "multiUse"; usesRequired: number; resetPolicy: string };
```

## 41.6 Effect definition

```ts
interface EffectDefinition {
  id?: string;
  kind: EffectKind;
  target?: TargetSelectorDefinition;
  chanceBasisPoints?: number;
  conditions?: ConditionDefinition[];
  parameters: Record<string, number | string | boolean>;
  scaling?: EffectScalingDefinition;
  onFailure?: EffectDefinition[];
  onSuccess?: EffectDefinition[];
}
```

`EffectKind` is a closed, versioned vocabulary. Unknown effects fail content validation.

## 41.7 Status definition

```ts
interface StatusDefinition {
  id: StatusDefinitionId;
  displayName: string;
  category: "positive" | "negative" | "neutral";
  ownerKind: "character" | "side" | "bar" | "actionSlot" | "run";
  durationMs?: number;
  tickEveryMs?: number;
  stacking: StackingDefinition;
  removable: boolean;
  tags: string[];
  hooks: StatusHookDefinition[];
  presentation: StatusPresentationDefinition;
}
```

## 41.8 Modification definition

```ts
interface ModificationDefinition {
  id: ModificationDefinitionId;
  displayName: string;
  description: string;
  restrictions: {
    types?: CombatType[];
    traits?: TraitId[];
    minimumLevel?: number;
  };
  passiveIds: PassiveDefinitionId[];
  statAdjustments?: Partial<CoreStats>;
  sellValue: number;
  rarity: string;
  assets: ItemAssetReferences;
}
```

## 41.9 Accessory definition

```ts
interface AccessoryDefinition {
  id: AccessoryDefinitionId;
  displayName: string;
  description: string;
  chargeRequired: number;
  usesPerBattle?: number;
  effects: EffectDefinition[];
  passiveIds?: PassiveDefinitionId[];
  ai: AccessoryAiMetadata;
  assets: ItemAssetReferences;
}
```

## 41.10 Battle rules

```ts
interface BattleRules {
  id: BattleRulesId;
  maxSquadSize: 1 | 2 | 3;
  timeLimitMs?: number;
  baseFillRate: number;
  startingEnergy: number;
  switchingAllowed: boolean;
  standardBandConstraint: boolean;
  typesEnabled: boolean;
  traitsEnabled: boolean;
  accessoriesEnabled: boolean;
  modificationsEnabled: boolean;
  battleDropsEnabled: boolean;
  defeatReplacementDelayMs: number;
  difficulty: Difficulty;
  rewardEligibility: "none" | "profile" | "story";
  specialModifiers: RuleModifierDefinition[];
}
```

## 41.11 Tournament definition

```ts
interface TournamentDefinition {
  id: TournamentDefinitionId;
  displayName: string;
  description: string;
  registeredRosterMax: 6;
  battleSquadMax: 3;
  entryNodeId: TournamentNodeId;
  nodes: TournamentNodeDefinition[];
  rewards: RewardDefinition[];
  allowedDifficulties: Difficulty[];
  persistence: {
    health: true;
    defeatedState: true;
    transientStatuses: false;
    accessoryCharge: boolean;
  };
  presentation: TournamentPresentationDefinition;
}
```

## 41.12 Story definition

```ts
interface StoryDefinition {
  id: StoryDefinitionId;
  displayName: string;
  summary: string;
  canonical: boolean;
  firstNodeId: StoryNodeId;
  nodes: StoryNodeDefinition[];
  unlockConditions: ConditionDefinition[];
  completionConditions: ConditionDefinition[];
  defaultDifficulty: Difficulty;
  allowedDifficulties: Difficulty[];
  coverAssetId: ImageAssetId;
  musicTrackId?: MusicTrackId;
  version: number;
}
```

## 41.13 Story node union

```ts
type StoryNodeDefinition =
  | DialogueNode
  | NarrationNode
  | SceneNode
  | BattleNode
  | ShopNode
  | RewardNode
  | MissionNode
  | ChoiceNode
  | TournamentNode
  | UnlockNode
  | ChapterNode
  | EndingNode;
```

Every node has stable ID, outgoing edges, completion state and replay policy.

---

# 42. Save system

## 42.1 Local-first

**LOCKED:** The first implementation stores saves locally.

The architecture must allow future Cloudflare-backed cloud save without making cloud connectivity a current requirement.

## 42.2 Multiple save slots

**LOCKED:** Support multiple progression save slots.

Recommended:

- three normal slots;
- one optional autosave recovery slot;
- named profile;
- last-played timestamp;
- chapter and collection summary;
- safe delete confirmation.

## 42.3 Settings separation

**LOCKED:** Global settings and progression saves are separate.

The player can:

- reset progression without losing settings;
- reset settings without losing progression;
- switch progression slots while retaining accessibility and audio preferences.

## 42.4 Autosave points

Autosave after:

- battle result;
- level up;
- stat allocation;
- action configuration;
- action enhancement;
- modification change;
- Store purchase or sale;
- mission completion;
- Story node completion;
- tournament registration;
- tournament node completion;
- reward selection;
- settings change where appropriate.

Use atomic write or equivalent browser-safe transaction behaviour to avoid corrupting the only save.

## 42.5 Save versioning

Save data includes:

- schema version;
- content version;
- engine version;
- migration history;
- checksum or integrity metadata;
- last successful save.

Migrations are explicit and tested.

## 42.6 Export and import

**EXTENSION:** Human-readable or packaged save export and import can be added after the data model stabilises.

Do not commit to indefinite compatibility during the earliest prototype. Once public export exists, versioning and migration become supported product behaviour.

---

# 43. Settings and accessibility

## 43.1 Input

Initial inputs:

- mouse;
- keyboard;
- touch-ready pointer handling;
- future controller support through focusable UI architecture.

Every action available through drag and drop must also be available through click, tap and keyboard selection.

## 43.2 Visual accessibility

Required settings and design features:

- reduced motion;
- screen shake strength;
- flash intensity;
- hit-stop intensity;
- particle density;
- high-contrast UI;
- scalable interface text;
- readable font option;
- colour-blind-safe type symbols;
- type names and shapes in addition to colours;
- status labels and tooltips;
- damage and healing number size;
- optional persistent action descriptions;
- configurable battle speed in single-player contexts;
- pause and inspect;
- safe-area support;
- no essential information contained only in an animation.

## 43.3 Reduced motion

Reduced-motion mode replaces:

- pulsing with static outline;
- large zooms with crossfades;
- heavy shake with short border emphasis;
- rapid parallax with fixed backgrounds;
- repeated bobbing with a selected-state marker;
- strong flashes with a controlled tint.

It does not remove timing information.

## 43.4 Audio accessibility

- subtitles independent of dialogue volume;
- visual cue for action readiness;
- visual cue for interruption;
- visual cue for bar freeze or slow;
- captions for important off-screen sounds;
- separate dialogue, music, SFX and UI volume;
- mono-compatible critical cues;
- no mechanic that requires hearing alone.

## 43.5 Cognitive clarity

- projected action values;
- transparent opponent actions;
- consistent icon vocabulary;
- plain-language detailed descriptions;
- optional advanced calculation panel;
- Undo during out-of-battle configuration;
- free respec;
- no permanent punishment for experimentation;
- clear mode and reward labels;
- confirmation for destructive collection actions;
- tutorial that teaches one concept at a time.

## 43.6 Pause and battle speed

Single-player battles support pause.

Recommended battle-speed settings:

- 0.75×;
- 1.00×;
- 1.25×;
- 1.50×;
- 2.00× for replays or AI observation.

Action previews, charge durations and status timers scale consistently with simulation speed.

Human-versus-human modes cannot use unilateral pause or speed changes.

---

# 44. Observability and telemetry

## 44.1 Local diagnostics first

The engine should emit structured local diagnostic records before any remote analytics decision.

Useful diagnostics:

- battle seed;
- ruleset;
- command stream;
- state hashes;
- calculation traces;
- rejected commands;
- AI utility summaries;
- content versions;
- performance timings;
- asset fallback usage;
- save migration events.

## 44.2 Balance telemetry

When analytics is enabled later and privacy requirements are satisfied, useful aggregate events include:

- character pick rate;
- character win rate by level and mode;
- action placement frequency;
- action usage and success;
- interruption frequency;
- average bar energy at action commit;
- switch frequency;
- type matchup outcomes;
- trait synergy frequency;
- modification and accessory usage;
- battle duration;
- tournament attrition;
- Story retry count;
- difficulty changes;
- player exits from Battle Setup;
- Store purchase and sale patterns.

## 44.3 Privacy

Do not add invasive tracking by default.

Any remote telemetry must be:

- documented;
- minimal;
- consent-aware where required;
- free of dialogue or personal text content;
- separable from essential game function;
- disableable where practical.

---

# 45. Content authoring

## 45.1 Stable IDs

Examples:

```text
character.tux
character.humpty-dumpty
character.moses
character.viking
character.ned-kelly
character.grim-reaper

action.tux.kernel-peck
status.power-up
modification.master-caster
accessory.team-repair
story.main
story.main.node.001
tournament.starter
music.red-thread
image.character.tux.idle.a
```

Display names can change without breaking saves.

## 45.2 Authoring format

Use YAML, JSON or TypeScript data definitions with schema validation.

Recommended workflow:

```text
author source
→ validate schema
→ resolve references
→ calculate derived previews
→ compile runtime content
→ run content tests
→ generate indices and reports
```

## 45.3 Character authoring checklist

A complete character requires:

- stable ID;
- display name;
- type;
- zero to two traits;
- base stats;
- level growth;
- three actions;
- default action placement;
- Gold and Platinum enhancement for each action;
- AI tags;
- modification compatibility;
- collection and Store metadata;
- required visual assets or placeholders;
- audio IDs or fallbacks;
- theme music association if any;
- accessible descriptions;
- balance role;
- unit tests or generated validation cases.

## 45.4 Action authoring checklist

- one clear purpose;
- target selector;
- execution style;
- cost comes from placement;
- placement scaling profile;
- exact effect order;
- charge or impact timing;
- interruption rules;
- dodge and critical rules;
- type interaction;
- secondary effects;
- stacking rules;
- Gold patch;
- Platinum patch;
- AI utility tags;
- preview formatter;
- presentation reference;
- SFX reference;
- accessibility description;
- tests at 1L, 2 and 3H.

## 45.5 Story authoring checklist

- finite entry and completion path;
- no reliance on physical navigation;
- all edges valid;
- branch replay rules;
- no permanent lockout;
- every battle references standard combat data;
- borrowed characters restore cleanly;
- first-clear and replay rewards separated;
- all dialogue skippable;
- all scenes have alt text or accessible summary;
- missing art has a fallback;
- music transition defined;
- Story completion test.

## 45.6 Tournament authoring checklist

- roster size and restrictions;
- registration snapshot;
- route graph;
- opponent definitions;
- between-round rewards;
- revive eligibility;
- persistent health test;
- no unusable reward generation;
- loss termination;
- resume save point;
- final reward;
- replay policy;
- Exhibition, Profile or Story eligibility.

---

# 46. Asset pipeline

## 46.1 Asset registry

Game data references logical asset IDs, never fragile direct paths.

Resolution order:

```text
approved specific asset
→ approved character-level fallback
→ template fallback
→ generic placeholder
```

Missing art must not prevent a combat test build.

## 46.2 Image templates

Every image template defines:

- template ID;
- purpose;
- aspect ratio;
- source dimensions;
- runtime dimensions;
- safe areas;
- character placement;
- crop behaviour;
- background rule;
- border treatment;
- text policy;
- required references;
- prompt structure;
- output path;
- approval criteria.

## 46.3 Minimum character asset manifest

```text
canonical reference
portrait
collection card
Store card
idle A/B
action 1 A/B
action 2 A/B
action 3 A/B
hurt A/B
dodge A/B
stunned A/B
defeat A/B
victory A/B
action 1 cut-in
action 2 cut-in
action 3 cut-in
entrance panel
victory panel
```

## 46.4 Battle assets

- standard arena background;
- tournament arena;
- boss arena;
- action overlays;
- impact overlays;
- charge overlays;
- type icons;
- trait icons;
- status icons;
- battle-drop icons;
- bar-hazard icons;
- accessory icons;
- generic placeholders.

## 46.5 Story assets

- story cover;
- chapter card;
- dialogue background;
- narration panel;
- encounter panel;
- choice panel;
- branch panel;
- reward panel;
- ending panel;
- defeat panel;
- Store background;
- tournament entry.

## 46.6 Generation tracking

Track:

- asset ID;
- character ID;
- template ID;
- prompt version;
- reference images;
- candidate number;
- generation tool and model;
- creation time;
- output path;
- approval state;
- rejection reason;
- replacement history;
- checksum.

Approved assets must never be overwritten silently.

## 46.7 Text in images

Render interface text in the game whenever possible.

Generated artwork may contain environmental or decorative text only when:

- it is intentional;
- it is checked for correctness;
- localisation is not required;
- accessibility does not depend on it.

---

# 47. Testing specification

## 47.1 Test layers

- unit tests;
- property tests;
- deterministic replay tests;
- content validation tests;
- AI simulation tests;
- mode integration tests;
- save migration tests;
- Phaser presentation smoke tests;
- visual regression tests where practical;
- accessibility checks.

## 47.2 Required battle-bar tests

1. Both sides fill independently.
2. Switching preserves exact energy.
3. Active Speed changes fill rate from the next tick.
4. Bar freeze stops fill.
5. Haste and Slow stack according to policy.
6. Energy never exceeds maximum or drops below minimum.
7. Action commit spends energy once.
8. Rejected action spends no energy.
9. Interrupted charge loses energy by default.
10. Refund modification restores the documented amount.
11. Bar drain cannot underflow.
12. Starting Energy includes Historic synergy.
13. Replays reproduce identical bar values.

## 47.3 Required switching tests

1. Free switch has no cost.
2. Switch has no default cooldown.
3. Stun blocks switching.
4. Switch Lock blocks switching.
5. Benched statuses continue ticking.
6. Switching does not cleanse.
7. Switching cannot change the locked target of a committed attack.
8. Active Speed changes after switch.
9. Entry passive triggers according to frequency.
10. Defeat replacement preserves energy.
11. Tournament defeated characters cannot be selected.

## 47.4 Required action tests

1. Standard loadout requires one action in each band.
2. Level below 10 cannot change placement.
3. Level 10 can change placement.
4. Placement cost and magnitude use data tables.
5. Effect-specific scaling differs where configured.
6. Multi-hit makes independent dodge rolls.
7. Multi-hit makes independent critical rolls.
8. Dodge prevents hit-dependent status.
9. Undodgeable bypasses Dodge.
10. Shield piercing behaves as authored.
11. Charge interruption and immunity work.
12. Channel ticks stop after interrupt.
13. Gold and Platinum patches only improve the action.
14. Projected outcome matches actual deterministic non-random result.
15. Simultaneous impacts use stable ordering.

## 47.5 Required type and trait tests

1. The six-way type wheel matches the locked order.
2. Untyped is neutral to every type.
3. Actions do not override character type.
4. Advantage uses the configured multiplier.
5. Disadvantage uses the configured multiplier.
6. Type and trait systems calculate independently.
7. Single trait contributes 1.0.
8. Dual traits contribute 0.5 each.
9. Only selected battle characters contribute synergy.
10. Historic adds starting energy.
11. Hero, Villain, Monster, Mythic and Icon apply correct bonuses.
12. Synergy previews equal battle state.

## 47.6 Required progression tests

1. Level cap is 25.
2. Level grants automatic growth and one allocation point.
3. Unspent points persist.
4. Free respec works outside battle.
5. Respec is blocked during battle and tournament.
6. Level 5 unlocks modification slot.
7. Level 10 unlocks configuration and enhancement.
8. Enhancement belongs to the instance.
9. Duplicate instance retains independent build.
10. Selling refunds documented investment.
11. Loss grants partial XP.
12. selected defeated characters receive XP.

## 47.7 Required tournament tests

1. Registration accepts at most six characters.
2. Registered build snapshot cannot change mid-run.
3. Current HP persists.
4. Defeated state persists.
5. Transient statuses clear.
6. Revive works only between battles.
7. Revive reward is not offered when unusable unless convertible.
8. One to three living characters can be selected.
9. Loss ends run.
10. Suspend and resume preserves node and roster state.
11. Story and standalone tournaments use the same engine.
12. Tournament completion rewards are issued once per completion event.

## 47.8 Required Story tests

1. Every node is reachable or intentionally optional.
2. No required path dead-ends before completion.
3. Choices do not permanently lock alternate content.
4. Completed nodes are replayable.
5. Borrowed characters restore original roster.
6. Battle nodes invoke the standard combat engine.
7. Tournament nodes invoke the standard tournament engine.
8. Story can complete without exploration modules.
9. First-clear and replay rewards differ correctly.
10. Dialogue skip and auto-advance work.

## 47.9 Required Quick Match tests

1. Sandbox exposes all content.
2. Sandbox cannot grant Story XP or currency.
3. Profile mode uses owned instances.
4. Invalid custom rules disable rewards.
5. AI versus AI runs without presentation.
6. Saved presets validate after content changes.
7. Try-before-buy returns to Store listing.

## 47.10 Balance simulation

Automated reports should include:

- win matrix for every initial character versus every other at equal level;
- type-advantage impact;
- action placement efficiency;
- time to first action;
- average battle duration;
- average switch count;
- action usage distribution;
- character pick and win rates;
- trait-composition win rates;
- tournament survivor HP;
- modification impact;
- accessory impact;
- Easy, Normal, Hard and Brutal results;
- player and AI perfect-play approximations.

A character should not become dominant solely because one action has superior damage per energy at every position.

---

# 48. Acceptance criteria for a matching or equivalent combat experience

The first serious combat build is accepted only when all of the following are true.

## 48.1 Readability

- Two independent bars are clearly visible.
- The player can read opponent action timing.
- Three action markers sit at their actual costs.
- Projected values update live.
- Type strength and weakness are visible.
- Trait bonuses are visible before battle.
- Statuses and durations are inspectable.
- Bench HP is always visible.

## 48.2 Tactical timing

- Waiting for a high-cost action feels meaningfully different from repeatedly using a quick action.
- Bar drain can disrupt an opponent who is near a strong action.
- Charge-up attacks create a real interruption opportunity.
- A fast active character increases tempo.
- Holding energy for a different character is useful.
- Opposing actions can overlap without breaking deterministic resolution.

## 48.3 Switching

- Switching is immediate and free when legal.
- Energy is preserved.
- Switching can protect future HP but cannot dodge a committed hit.
- The player can bring in a type counter or action specialist.
- Bench status timers continue.
- Tournament HP makes preservation meaningful.

## 48.4 Action diversity

The initial build demonstrates at least:

- single-target damage;
- group damage;
- multi-hit;
- charge-up;
- interrupt;
- heal one;
- heal team;
- stun;
- Power stacking;
- Defence Down;
- bar gain;
- bar drain;
- shield;
- damage over time;
- life steal;
- cleanse;
- undodgeable;
- shield piercing;
- battle drop;
- hostile bar hazard;
- accessory.

## 48.5 Progression

- Level-up stat choice changes battle outcomes.
- Free respec enables a new role.
- Level 5 modification changes strategy.
- Level 10 action configuration changes cost and effect.
- Gold and Platinum enhancements feel more interesting than simple percentage growth.
- Duplicate instances can coexist with different builds.
- The player can overlevel and overpower an earlier Story fight.

## 48.6 Modes

- Quick Match reaches a battle quickly and offers full customisation.
- Tournament health and defeat state persist correctly.
- Story advances through nodes without a map.
- Story tournaments use the same tournament implementation.
- No mode duplicates combat rules.

## 48.7 Presentation

- Static and two-frame art still feels active.
- Band 1, 2 and 3 actions have distinct presentation weight.
- Hurt, dodge, stun, defeat and victory states read clearly.
- Reduced-motion mode remains understandable.
- Audio can be muted without losing information.

---

# 49. MVP and implementation phases

## Phase 0: Documentation and content foundation

Deliver:

- authoritative GDD using this specification;
- ADRs;
- AGENTS.md;
- schemas;
- content compiler;
- stable ID conventions;
- placeholder asset registry;
- balancing workbook or data tables;
- mise tasks;
- repository skeleton.

Exit condition: all locked rules are represented in documentation and schemas.

## Phase 1: Headless 1v1 combat

Deliver:

- two side bars;
- one character per side;
- three action bands and nine positions;
- instant damage;
- charge-up and interrupt;
- HP, Power, Defence, Speed, Dodge and Critical;
- type wheel;
- deterministic RNG;
- AI command generation;
- battle result;
- replay tests.

Exit condition: thousands of deterministic AI battles can run headlessly.

## Phase 2: 3v3 and switching

Deliver:

- one to three characters;
- active and bench state;
- free switching;
- target locking;
- team damage and healing;
- bench status ticking;
- automatic replacement;
- full Battle Setup validation;
- trait synergy.

Exit condition: all switching acceptance tests pass.

## Phase 3: Full effect vocabulary

Deliver:

- statuses;
- shields;
- multi-hit;
- healing;
- bar manipulation;
- Power stacks;
- damage over time;
- life steal;
- cleanse;
- hostile hazards;
- battle drops;
- accessories;
- modifications.

Exit condition: initial six example kits can be expressed entirely through data.

## Phase 4: Progression and collection

Deliver:

- character instances;
- XP and level 25 cap;
- stat allocation and free respec;
- level 5 modification unlock;
- level 10 configuration and enhancement;
- Stock, Gold and Platinum;
- duplicates;
- six-character Active Roster;
- Store;
- currency;
- save slots.

Exit condition: profile loop survives save, reload, sale and replay.

## Phase 5: Quick Match

Deliver:

- Quick Start;
- Custom Match;
- Sandbox and Profile rulesets;
- saved presets;
- AI versus AI;
- try before buying;
- music and arena selection.

Exit condition: a new player can reach a valid battle in under one minute without Story progress.

## Phase 6: Tournament Mode

Deliver:

- six-character registration;
- persistent HP and defeat;
- between-round nodes;
- revival;
- Exhibition and Profile tournament;
- suspend and resume;
- final rewards.

Exit condition: a three-round tournament can be completed, lost, resumed and replayed.

## Phase 7: Story Mode

Deliver:

- node graph;
- mixed node types;
- dialogue and scenes;
- choices and replay;
- Story battles;
- Story tournament;
- Store node;
- borrowed character;
- first-clear rewards;
- finite ending.

Exit condition: a short complete campaign runs without an exploration scene or map module.

## Phase 8: Presentation polish

Deliver:

- two-frame art renderer;
- action cut-ins;
- shake, hit stop, flash and particles;
- entrance themes;
- victory and defeat panels;
- audio routing;
- reduced motion;
- responsive desktop layout;
- mobile layout research.

Exit condition: combat is clear and satisfying with both approved and placeholder art.

## Phase 9: Balance and public readiness

Deliver:

- simulation reports;
- difficulty tuning;
- economy tuning;
- accessibility review;
- save migration tests;
- performance profiling;
- telemetry decision;
- PWA or deployment decision;
- public release checklist.

---

# 50. Agent delivery package

The implementing AI agent should convert this specification into a repository documentation package containing at least:

```text
docs/
├── game-design-document.md
├── combat-system.md
├── battle-bar-and-actions.md
├── character-progression.md
├── types-and-traits.md
├── quick-match.md
├── tournament-mode.md
├── story-mode.md
├── character-selection-and-ui.md
├── economy-and-store.md
├── missions.md
├── ai-design.md
├── presentation-system.md
├── accessibility.md
├── technical-design.md
├── content-authoring.md
├── asset-production.md
├── balancing.md
├── testing.md
└── decisions/
    ├── 0001-pure-typescript-combat-engine.md
    ├── 0002-phaser-presentation-layer.md
    ├── 0003-no-open-world-exploration.md
    ├── 0004-two-team-battle-bars.md
    ├── 0005-nine-action-positions.md
    ├── 0006-types-versus-traits.md
    ├── 0007-six-character-active-roster.md
    ├── 0008-deterministic-simulation.md
    └── 0009-story-node-architecture.md
```

Also create:

- `AGENTS.md`;
- `mise.toml`;
- content schemas;
- example content for the initial six characters;
- headless combat tests;
- a prioritised implementation plan;
- a traceability matrix mapping locked requirements to code and tests.

# 51. Required AGENTS.md rules

`AGENTS.md` must tell every future agent:

1. This GDD is authoritative.
2. Chats and imported model outputs are historical background only.
3. Do not add exploration.
4. Do not silently change locked mechanics.
5. Keep gameplay independent from Phaser.
6. Use stable IDs.
7. Do not edit generated runtime content directly.
8. Do not overwrite approved assets.
9. Add or update tests when gameplay rules change.
10. Document assumptions.
11. Update the GDD and ADR before material design changes.
12. Use Australian English in player-facing and project documentation.
13. Avoid unnecessary architecture.
14. Do not copy protected names, art, text or content from the inspiration.
15. Preserve deterministic simulation and replay compatibility.
16. Treat action previews as a correctness requirement.
17. Keep Type and Trait systems separate.
18. Keep all three modes on one combat engine.
19. Keep the six-character Active Roster and one-to-three battle selection distinction.
20. Keep Sandbox rewards separate from Story progression.

# 52. Decisions the agent may make without approval

The agent may select sensible details that do not contradict locked rules, including:

- exact TypeScript folder names;
- Zod versus JSON Schema where both requirements are met;
- fixed-point scale;
- ECS versus reducer-style internal representation, provided headless determinism remains;
- Phaser scene organisation;
- responsive CSS and layout implementation;
- placeholder icon style;
- exact test helper design;
- internal naming of effect handlers;
- build and lint configuration;
- initial content-file format;
- exact interpolation and easing for presentation;
- performance optimisations;
- final original term for modifications, accessories, currency and battle drops as a proposed branding set;
- balance-data adjustments supported by simulation, provided the baseline and reason are documented.

# 53. Decisions requiring explicit approval

The agent must not independently change:

- removal of open-world exploration;
- top-level mode structure;
- two bars, one per side;
- one active character per side;
- battle squad size of one to three;
- six-character Active Roster;
- free, no-cost, no-cooldown switching;
- target locking that prevents switch dodging;
- status ticking while benched;
- three actions per character;
- nine action placements;
- one action per major band in standard rules;
- level 5 modification unlock;
- level 10 action configuration and enhancement unlock;
- Stock, Gold and Platinum tiers;
- level cap 25;
- free stat respec outside battle and tournament;
- six locked combat types and their wheel;
- six locked traits and their bonus identities;
- initial six character type and trait mapping;
- duplicate character instances being legal;
- reusable, non-destructive modifications;
- no normal in-battle revival;
- tournament HP and defeat persistence;
- Story choices not permanently locking content;
- Easy and Normal base reward equality;
- no premium gacha or paid energy;
- gameplay independence from Phaser;
- deterministic seeded simulation.

# 54. Immediate first implementation assignment

The first coding agent should not begin by building screens.

It should perform this sequence:

1. Import this document as the project design authority.
2. Create the documentation package and ADRs.
3. Define schemas for types, traits, characters, instances, actions, effects, statuses and battle rules.
4. Implement fixed-point arithmetic and seeded RNG.
5. Implement one side-owned bar per side.
6. Implement the nine placement table through data.
7. Implement one instant damage effect and one charge-up damage effect.
8. Implement command validation and semantic events.
9. Implement a headless 1v1 battle.
10. Add replay tests.
11. Add Tux and one opponent as data.
12. Run AI versus AI simulations.
13. Only then create a minimal Phaser battle renderer.

The first visible renderer can use rectangles, text and simple icons. Final art is not a dependency for validating combat.

# 55. Traceability matrix template

The agent must maintain a table similar to:

| Requirement                          | Design section | Schema or module   | Test                             | Status  |
| ------------------------------------ | -------------- | ------------------ | -------------------------------- | ------- |
| One bar per side                     | 6.1            | `combat/bar`       | `bar-ownership.test.ts`          | Planned |
| Switching preserves energy           | 14.1           | `combat/switch`    | `switch-energy.test.ts`          | Planned |
| Switch cannot dodge committed attack | 8.4, 14.1      | `combat/targeting` | `target-lock.test.ts`            | Planned |
| One action per band                  | 7.2            | content validator  | `action-layout.test.ts`          | Planned |
| Level 10 configuration               | 7.5, 23.2      | progression        | `level-unlock.test.ts`           | Planned |
| Types and traits separate            | 19, 20         | combat modifiers   | `type-trait-separation.test.ts`  | Planned |
| Tournament HP persists               | 30.4           | tournament state   | `tournament-persistence.test.ts` | Planned |
| No exploration dependency            | 2, 31          | Story engine       | `story-no-map.test.ts`           | Planned |

No locked requirement is complete until it has both implementation and test coverage.

# 56. Final non-negotiable checklist

Before calling the project aligned, answer **yes** to every item:

- [ ] Are there two battle bars, one for each side?
- [ ] Does the bar belong to the team rather than an individual character?
- [ ] Does active Speed affect that team bar?
- [ ] Does switching preserve current energy?
- [ ] Is switching normally free and without cooldown?
- [ ] Can switching not dodge a committed attack?
- [ ] Can one to three characters enter a battle?
- [ ] Is one character active at a time?
- [ ] Do bench statuses continue ticking?
- [ ] Can team actions affect bench characters?
- [ ] Does every character have exactly three active actions?
- [ ] Can those actions be configured across 1L through 3H at level 10?
- [ ] Does standard configuration contain one action per numbered band?
- [ ] Can actions be instant, charge-up, channelled or multi-hit?
- [ ] Can charge-up actions be interrupted?
- [ ] Do multi-hit attacks roll dodge and critical independently?
- [ ] Are action outcomes visibly previewed?
- [ ] Are there six locked combat types and optional Untyped?
- [ ] Is the type wheel exactly the documented wheel?
- [ ] Are traits separate from types?
- [ ] Do dual-trait characters contribute half to each trait?
- [ ] Are the initial six characters mapped exactly as documented?
- [ ] Is the level cap 25?
- [ ] Does level 5 unlock one reusable modification slot?
- [ ] Does level 10 unlock action configuration and enhancement?
- [ ] Are Stock, Gold and Platinum permanent instance upgrades?
- [ ] Can exact duplicate character instances be owned and deployed?
- [ ] Are modifications reusable and free to swap outside locked contexts?
- [ ] Is there one team accessory using a separate meter?
- [ ] Are beneficial battle drops separate from hostile bar hazards?
- [ ] Does Quick Match have an unrestricted Sandbox ruleset?
- [ ] Can Profile Quick Match provide controlled progression rewards?
- [ ] Does Tournament Mode register up to six characters?
- [ ] Does tournament HP and defeat state persist between rounds?
- [ ] Are revives between rounds rather than during battle?
- [ ] Does Story Mode use authored nodes and no explorable map?
- [ ] Can Story choices be replayed without permanent content lockout?
- [ ] Do Story tournaments use the same tournament engine?
- [ ] Do all modes use the same combat engine?
- [ ] Is the gameplay engine independent from Phaser?
- [ ] Is randomness seeded and replayable?
- [ ] Are Easy and Normal equally rewarding at base?
- [ ] Can the player overlevel and return stronger?
- [ ] Can the game run with placeholder art?
- [ ] Does reduced-motion mode preserve all information?
- [ ] Does the game avoid premium gacha, paid energy and punitive failure?

# 57. Compact statement of the game

> Build an original collectible squad battler in which each side controls a team-owned real-time battle bar, selects one to three characters from a six-character active roster, keeps one fighter active at a time, switches freely without resetting energy, and uses three configurable actions positioned across nine cost-and-strength locations. Characters develop through levels, freely allocated stats, three permanent action enhancement tiers and one reusable modification. Six combat types create a counter wheel while separate Hero, Villain, Monster, Mythic, Historic and Icon traits create squad synergy. Quick Match provides immediate sandbox or profile battles, Tournament Mode creates six-character attrition runs with between-round recovery and revival, and Story Mode delivers finite authored campaigns through dialogue, battle, shop, reward, choice and tournament nodes without any explorable map. All modes share one deterministic TypeScript combat engine rendered through Phaser using static panels, two-frame character states and programmed impact effects.

# 58. Confidence and provenance

This specification has three confidence layers:

- **Project-owner decisions:** very high confidence. These rules were directly selected or clarified in the project discussion.
- **Broad inspiration behaviour:** high confidence. The essential combat-bar, three-character selection, switching, visible opponent bar, progression, modification, enhancement and team-combination ideas are supported by gameplay descriptions and community documentation.
- **Exact source-game internals:** intentionally not claimed. The source code and canonical formulas are unavailable, so this project uses explicit original baseline values rather than presenting reverse-engineered guesses as facts.

The result is designed to be matching or equivalent in player experience while remaining an original, technically inspectable game rather than an unreliable clone built from invented numbers.

---

# Appendix A. Locked type and trait reference

## Combat type wheel

```text
Brawler → Tech → Oddball → Arcane → Beast → Sharpshooter → Brawler
```

## Traits

```text
Hero     → Health
Villain  → Power
Monster  → Defence
Mythic   → Speed
Historic → Starting Energy
Icon     → Critical
```

## Initial roster

```text
Tux             Tech          Icon
Humpty Dumpty   Oddball       Icon
Moses           Arcane        Hero + Mythic
Viking          Brawler       Historic
Ned Kelly       Sharpshooter  Hero + Historic
Grim Reaper     Beast         Monster + Mythic
```

# Appendix B. Baseline nine-position table

```text
1L  cost 18  scale 0.70
1   cost 25  scale 0.80
1H  cost 32  scale 0.90
2L  cost 40  scale 1.00
2   cost 50  scale 1.15
2H  cost 60  scale 1.30
3L  cost 70  scale 1.50
3   cost 82  scale 1.75
3H  cost 95  scale 2.00
```

# Appendix C. Baseline trait values

```text
Hero     +3 max HP per point to each selected character
Villain  +1 Power per point to each selected character
Monster  +1 Defence per point to each selected character
Mythic   +4% team-bar fill rate per point
Historic +5 starting energy per point
Icon     +2 Critical percentage points per point to each selected character
```

# Appendix D. Baseline combat constants

```text
bar range                    0–100
neutral full-bar time        8 seconds
base fill rate               12.5 energy/second
advantage multiplier         1.25
neutral multiplier           1.00
disadvantage multiplier      0.80
critical multiplier          1.50
normal Defence cap           60%
normal Dodge cap             40%
temporary Dodge cap          60%
normal Critical cap          50%
temporary Critical cap       75%
standard replacement lock    500 ms
Quick Match time limit       90 seconds
Story time limit             120 seconds
Tournament round limit       120 seconds
boss time limit              180 seconds
```

All Appendix B to D values are balance-data baselines and may be tuned through documented simulation without changing the surrounding system.

# Appendix E. Evidence basis used to correct the imported model response

The research pass considered:

- a contemporary Pocket Gamer review describing a three-character team, switching, a team-persistent bar, differently positioned moves and the visible opponent bar;
- a contemporary first-impressions and strategy article describing stat choices, charge interruption, stacking, temporary tofu powers, type information on character selection, team bonuses, level-5 modifications and duplicate-fed enhancement;
- a detailed community action catalogue demonstrating the breadth of effect primitives;
- a detailed community modification catalogue demonstrating charge protection, faster charge, instant cast, starting battle effects and stat modifications;
- community strategy discussion describing level-10 action repositioning and its cost-versus-effect trade-off;
- character-management screenshots showing six squad slots, three actions, core stats, enhancement and modification surfaces;
- the project owner's consolidated design answers and locked exclusions.

This evidence supports the broad structural inspiration. It does not support Gemini's invented exact formulas, timers, cooldowns, gacha tables or universal effect assumptions.

---

**End of authoritative specification.**
