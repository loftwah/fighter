# Reference-Game Mechanics Audit and Source-Parity Compendium

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
