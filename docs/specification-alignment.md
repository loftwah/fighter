# Imported specification alignment

Status: maintained reconciliation record  
Last reviewed: 2026-07-31

## Purpose

The imported `ultimate-collectible-squad-battler-spec.md` is a strong
consolidation of project discussion, reference-informed structure, and
proposed baselines. It is not copied into the repository because much of it
duplicates `docs/game-design.md`, `docs/technical-design.md`, the two parity
audits, and content-authoring guidance.

Repository authority remains:

1. `docs/v2-release-spec.md` for V2 release scope and acceptance;
2. `docs/release-roadmap.md` for later milestone scope;
3. `docs/game-design.md` for product and rules;
4. `docs/technical-design.md` for architecture;
5. `DESIGN.md` for the implemented visual system;
6. this document for traceability back to the imported specification.

An imported **LOCKED** label is adopted when it agrees with direct owner
decisions and the established product. Conflicts are resolved explicitly below
rather than silently replacing tested behaviour.

## Alignment summary

| Area                                 | Status                                   | Repository position                                                                                                                                                                                                                                                                                                             |
| ------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No explorable overworld              | Aligned                                  | Story is a finite authored node graph.                                                                                                                                                                                                                                                                                          |
| Shared combat engine                 | Aligned                                  | Story, Quick Fight, Tournament, and Developer Lab create configurations for one domain engine.                                                                                                                                                                                                                                  |
| Two side-owned bars                  | Aligned                                  | Player and opponent Charge Strips fill independently and remain visible.                                                                                                                                                                                                                                                        |
| One-to-three battle squad            | Aligned                                  | Both sides support one, two, or three selected Characters.                                                                                                                                                                                                                                                                      |
| One active Character                 | Aligned                                  | Bench health and statuses remain in battle state.                                                                                                                                                                                                                                                                               |
| Free switching                       | Aligned                                  | No standard cost or cooldown; stun and Switch Lock can prevent it.                                                                                                                                                                                                                                                              |
| Target lock                          | Aligned 2026-07-31                       | Stable target instance IDs are captured at Move commit.                                                                                                                                                                                                                                                                         |
| Bench status ticking                 | Aligned                                  | Simulation time continues for benched Character statuses.                                                                                                                                                                                                                                                                       |
| Three Moves per Character            | Aligned                                  | Validated tuple of three stable Move IDs.                                                                                                                                                                                                                                                                                       |
| Two-band Move language               | Aligned 2026-07-31                       | Required authored tactical category drives an outer labelled band; Normal/Tier 1/Tier 2 remains the independent inner band. Pause owns the shared key.                                                                                                                                                                          |
| Nine action positions                | Aligned 2026-07-31                       | `1L` through `3H` are data values and independently configurable at level 10.                                                                                                                                                                                                                                                   |
| Charge-up and interruption           | Aligned                                  | Damage and stun can interrupt; Dodge prevents hit-driven interruption.                                                                                                                                                                                                                                                          |
| Multi-hit rolls                      | Aligned                                  | Dodge and Critical are resolved independently per hit.                                                                                                                                                                                                                                                                          |
| Predicted outcomes                   | Substantially aligned                    | Direct projected damage and effect summaries are live; a deeper calculation inspector remains.                                                                                                                                                                                                                                  |
| Six Combat Types                     | Aligned with deliberate wheel difference | Closed six-Type cycle plus Typeless. See deliberate decisions.                                                                                                                                                                                                                                                                  |
| Type and Trait separation            | Aligned                                  | One Type and zero-to-two Traits per Character.                                                                                                                                                                                                                                                                                  |
| Continuous dual-Trait contribution   | Aligned 2026-07-31                       | Dual-Trait Characters contribute `0.5` to each Trait.                                                                                                                                                                                                                                                                           |
| Launch roster mapping                | Aligned and mechanically calibrated      | Tux, Humpty Dumpty, Moses, Viking, Ned Kelly, and Grim Reaper cover the imported Type mapping. `docs/launch-roster-calibration.md` gates V2 on one source-role-equivalent kit per Type; all six signature loops now have deterministic tests.                                                                                   |
| Level cap 25                         | Aligned                                  | Enforced by schemas and battle construction.                                                                                                                                                                                                                                                                                    |
| Free stat respec                     | Aligned                                  | Allocation can be reclaimed outside active tournaments/battles.                                                                                                                                                                                                                                                                 |
| Modification at level 5              | Aligned                                  | One reusable, non-destructive Modification slot.                                                                                                                                                                                                                                                                                |
| Reordering/enhancement at level 10   | Aligned                                  | Both unlock at level 10 and lock during tournaments.                                                                                                                                                                                                                                                                            |
| Three permanent Move tiers           | Aligned                                  | Migration-safe `stock`, `gold`, and `platinum` IDs display as Normal, Tier 1, and Tier 2.                                                                                                                                                                                                                                       |
| Duplicate instances                  | Aligned                                  | Exact copies have independent builds and can deploy together.                                                                                                                                                                                                                                                                   |
| One team Accessory                   | Aligned core 2026-07-31                  | Separate charge meter, symmetric player/AI commands, data-authored effects, and persisted once-used Tournament exhaustion. Broader ownership remains.                                                                                                                                                                           |
| Drops versus hazards                 | Aligned core                             | Beneficial pickups and hostile Move-slot blocks are distinct engine state.                                                                                                                                                                                                                                                      |
| Six-Character Tournament Roster      | Aligned 2026-08-07                       | The player locks up to six and deploys one to three per fight. A non-victorious deployment repeats against the same damaged enemy Squad while any roster member lives; only all-six defeat or confirmed forfeit loses the run.                                                                                                  |
| Tournament attrition                 | Aligned 2026-08-07                       | Player Health/defeat and current enemy Health/defeat persist across repeat deployments. Recovery, revival, Charge, stun, and boost effects may occur between fights through authored nodes.                                                                                                                                     |
| Tournament Trophies                  | Adopted owner extension 2026-08-07       | Every preset or custom Tournament references one Trophy. A standalone win upserts it globally; a Story win records Story-local provenance and the same global ownership. Deleting a Story Save leaves the global record, while deleting its custom Tournament removes the dependent global Trophy record.                       |
| Story graph and replay               | Aligned 2026-08-07                       | No physical map. A Story is an ordered sequence of content, grants, fights, preset Tournaments, and extension hooks; boss presentation composes ordinary fight and content steps rather than a separate engine.                                                                                                                 |
| Story completion and end game        | Adopted owner extension 2026-08-07       | Every Story has at least one fight, one preset Tournament, and one completion award. A Story Save owns collection/progression/economy facts; Quick Fight remains an unrestricted, ownership-free sandbox.                                                                                                                       |
| Local-first save slots               | Adapted owner extension 2026-08-07       | First implementation uses one local-first Story Save per Story definition, with many different Stories concurrently active. Preferences and global Profile archives remain separate; explicit migration preserves the current First Run data.                                                                                   |
| Seeded randomness                    | Aligned                                  | Combat and Drops use separate explicit deterministic streams.                                                                                                                                                                                                                                                                   |
| Fixed-point integers                 | Planned                                  | Current transitions are deterministic JavaScript numbers; authoritative integer fixed-point conversion remains a contained engine migration.                                                                                                                                                                                    |
| Replay command stream                | Aligned core 2026-07-31                  | Reports capture an initial snapshot, exact simulation deltas, and accepted human, AI, and forfeit decisions; the headless replay executor reproduces deterministic state/events, tolerates pause metadata, and rejects direct state edits.                                                                                      |
| Full effect catalogue                | Partial                                  | Core damage, team damage, heal, stun, periodic effects, bar control, shield, cleanse, reflection, counter, lifesteal, stackable next-Move Power, tier properties, and hit properties exist. Channels, transforms, summons, staged Moves, forced switch, dispel, shield-end outcomes, action disable, and wider triggers remain. |
| Sandbox Quick Fight                  | Aligned 2026-08-07                       | Presets and Custom Match use ownership-free, progression-neutral temporary instances. Any registered Character, exact duplicate, supported level, build, Modification, and Accessory may be configured.                                                                                                                         |
| Profile Quick Fight                  | Adapted core 2026-07-31                  | Quick Fight stays reward-neutral while fights, wins, losses, last seed, and last Lineups persist on the selected Profile.                                                                                                                                                                                                       |
| AI versus AI                         | Architecture aligned                     | Domain AI is side-agnostic and headless; batch and visible AI-versus-AI controls need expansion.                                                                                                                                                                                                                                |
| Reduced motion and semantic controls | Aligned core                             | Combat controls are DOM controls and motion settings preserve information.                                                                                                                                                                                                                                                      |

## Baselines adopted from the imported specification

### Charge and positions

```text
neutral Tempo 5 full Strip: approximately 15.9 seconds

1L  18 Charge  ×0.70
1   25 Charge  ×0.80
1H  32 Charge  ×0.90
2L  40 Charge  ×1.00
2   50 Charge  ×1.15
2H  60 Charge  ×1.30
3L  70 Charge  ×1.50
3   82 Charge  ×1.75
3H  95 Charge  ×2.00
```

Position values remain balance data rather than engine branches.

### Trait contribution

```text
single Trait: 1.0 point
dual Traits:  0.5 point to each

Hero:     +3 maximum Health per point
Villain:  +1 Power per point
Monster:  2.5% damage resistance per point
Mythic:   +4% Charge speed per point
Historic: +5 starting Charge per point, capped at 20
Icon:     +2 Fortune per point
```

Monster uses the current explicit damage-resistance model because Defence is
not an allocated Character stat in this project.

### Timing

```text
Quick Fight:       90 seconds
Story battle:     120 seconds
Tournament round: 120 seconds
Boss/custom:      authored override
```

## Deliberate retained differences

### Owner answers delegate source equivalence, not protected expression

The completed V2 questionnaire repeatedly asks to match the researched game's
player decisions as closely as possible. The adopted reading is structural:
preserve the Charge race, timing families, interruption choices, build depth,
team combinations, Drops, Accessories, mode consequences, and explanation
value where evidence supports them. It does not authorise protected names,
writing, art, audio, UI assets, hidden constants, or guessed formulas.

`UNKNOWN EXACT` values remain measured LOFTWAH FIGHTER balance. The first such
proof is `v2.viking-acceptance`, not a claim about an unavailable source value.

The 2026-07-31 Viking correction makes that boundary concrete. Viking maps the
researched leader's three behaviours—stackable next-attack Power, a returning
direct hit whose Tier 1 enhancement is undodgeable, and a direct hit plus stun
whose enhancement lengthens the stun—under the original labels **Battle
Boast**, **Axe First**, and **Berserker Oath**. The `shield-bash` logical ID is
retained only for content/save compatibility. It is not a player-facing name
or a licence to preserve the obsolete shield-bash presentation.

### Charge pacing follows observed playability

The imported eight-second neutral Strip was implemented and rejected by live
playtest as too fast alongside low-cost Moves, Drops, Accessories, and opposing
AI. A ten-second follow-up remained too fast in owner testing because players
could not read Charge, Lineup Health, and attack outcomes before the opponent
acted again. A 14.3-second follow-up improved readability, but the August 2026
owner playtest still found the Strip slightly too quick once richer Move and
impact feedback was present. The authoritative baseline is now approximately
15.9 seconds at Tempo 5, paired with a 1.4-second Normal AI decision window
after presentation. Tempo, Traits, and explicit effects still create faster
teams without making the opening unreadable.

Owner testing also rejected splitting active Health from the Charge controls.
The retained presentation groups opponent Health with opponent Charge in the
upper console and player Health with the Move-and-Charge field below. This does
not change the imported combat model; it makes the two side-owned resource
states readable along the same play path. Lineup tickets retain persistent
Health and add a disclosure for attack names, costs, and upgrade tiers.
The same testing rejected a large centred `YOUR MOVE` banner and an
asymmetrical readiness signal. Compact labelled readiness lamps now sit beside
both active Health readouts, and the two-entry fight feed is reserved directly
beneath player Charge instead of floating over the arena. These are
presentation decisions only; they do not alter Charge timing or AI rules.

### Attack presentation pauses the fight

The imported specification permits overlapping action presentation and normal
simulation progress. The owner directly requested the reference series-like
experience where play pauses while an attack is presented and the player
cannot act during it.

The complete simulation therefore pauses during the readable presentation lock:
input, AI, elapsed time, Charge, statuses, and pending Moves wait. Periodic
health ticks use compact non-blocking feedback so they do not invisibly stretch
the match. Representative attacks hold for roughly two to three seconds, with
the acting Character and Move visibly identified. AI reaction delay restarts
after the lock, preserving a comprehension window before the opponent can act.

### Combat Type wheel

The repository retains:

```text
Brawler → Beast → Oddball → Arcane → Sharpshooter → Tech → Brawler
```

This is the relationship already verified and implemented by the reference
parity audit. Replacing it with the imported document's different order would
break established content, tests, teaching UI, and functional source-game
alignment without a demonstrated benefit.

### Five allocated stats

The imported proposal adds permanent Defence as a sixth stat. The project
retains:

```text
Vitality, Power, Evasion, Fortune, Tempo
```

Defence remains a temporary, explicit combat modifier. This keeps the
recognisable Health/Power/Dodge/Luck core while giving the active Character a
clear relationship to team Charge speed. Adding permanent Defence would require
a balance and persistence migration and is not justified solely by the imported
proposal.

### Direct duplicate enhancement

The imported baseline proposes converting duplicates into Enhancement Cores.
The current launch implementation consumes one explicitly selected,
same-definition duplicate to advance one Move tier. Both preserve duplicate
value; a generic Core layer is deferred until economy simulation demonstrates
that the extra inventory concept improves the experience.

### Quick Fight progression

Quick Fight currently defaults to one fair, ownership-free Standard Build and
never mutates Story progression. This directly satisfies the owner's earlier
request for balanced non-Story fights. A separately labelled Profile ruleset
can be added after challenge-rating validation prevents trivial reward farming.

### Hard and Brutal rewards

Easy and Normal remain equally rewarding. The current prototype does not add
Hard/Brutal progression multipliers; higher difficulty is for challenge,
records, and commentary until economy simulation supports a reward change.

## Prioritised remaining slices

1. Finish Gate 1 Battle understanding around `v2.viking-acceptance`: owner-test
   the implemented rail-first candidate, revise or lock it, and finish every
   important-state capture at the three Tier 1 references.
2. Complete the report-derived result explanation and local diagnostic package
   for the fixed seed, including honest loss evidence.
3. Implement the six launch-kit primitives in the owner-approved order:
   self-Health for Charge, shield-end outcomes, seeded surprise boons, action
   disable, per-tier timing/effect properties, bounded transformation, and
   reactive upgrades.
4. Resolve named-combination bonus and priority research before defining its
   content schema; do not overload the independent Team Trait system.
5. Add authored Gold/Platinum properties rather than relying only on generic
   multipliers.
6. Add enemy dispel, percentage Charge break, one-hit shield, and wider trigger
   families required by calibrated content.
7. Convert authoritative combat quantities to integer fixed point only as a
   versioned deterministic migration that cannot derail the readable vertical
   slice.
8. Complete Accessory ownership and the six-Character Story Active Roster
   surface without duplicating Tournament registration or combat rules.

## Completion rule

An imported requirement is not marked aligned merely because a document
mentions it. Material combat rules require implementation and tests. Deferred
requirements remain visible here and in the parity audit until representative
content can exercise them without character-specific engine branches.
