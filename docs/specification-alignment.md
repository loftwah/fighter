# Imported specification alignment

Status: maintained reconciliation record  
Last reviewed: 2026-07-31

## Purpose

The imported `ultimate-collectible-squad-battler-spec.md` is a strong
consolidation of project discussion, Teeny Titans-inspired structure, and
proposed baselines. It is not copied into the repository because much of it
duplicates `docs/game-design.md`, `docs/technical-design.md`, the two parity
audits, and content-authoring guidance.

Repository authority remains:

1. `docs/game-design.md` for product and rules;
2. `docs/technical-design.md` for architecture;
3. `DESIGN.md` for the implemented visual system;
4. this document for traceability back to the imported specification.

An imported **LOCKED** label is adopted when it agrees with direct owner
decisions and the established product. Conflicts are resolved explicitly below
rather than silently replacing tested behaviour.

## Alignment summary

| Area                                 | Status                                   | Repository position                                                                                                                                                                                                                            |
| ------------------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No explorable overworld              | Aligned                                  | Story is a finite authored node graph.                                                                                                                                                                                                         |
| Shared combat engine                 | Aligned                                  | Story, Quick Fight, Tournament, and Developer Lab create configurations for one domain engine.                                                                                                                                                 |
| Two side-owned bars                  | Aligned                                  | Player and opponent Charge Strips fill independently and remain visible.                                                                                                                                                                       |
| One-to-three battle squad            | Aligned                                  | Both sides support one, two, or three selected Characters.                                                                                                                                                                                     |
| One active Character                 | Aligned                                  | Bench health and statuses remain in battle state.                                                                                                                                                                                              |
| Free switching                       | Aligned                                  | No standard cost or cooldown; stun and Switch Lock can prevent it.                                                                                                                                                                             |
| Target lock                          | Aligned 2026-07-31                       | Stable target instance IDs are captured at Move commit.                                                                                                                                                                                        |
| Bench status ticking                 | Aligned                                  | Simulation time continues for benched Character statuses.                                                                                                                                                                                      |
| Three Moves per Character            | Aligned                                  | Validated tuple of three stable Move IDs.                                                                                                                                                                                                      |
| Nine action positions                | Aligned 2026-07-31                       | `1L` through `3H` are data values and independently configurable at level 10.                                                                                                                                                                  |
| Charge-up and interruption           | Aligned                                  | Damage and stun can interrupt; Dodge prevents hit-driven interruption.                                                                                                                                                                         |
| Multi-hit rolls                      | Aligned                                  | Dodge and Critical are resolved independently per hit.                                                                                                                                                                                         |
| Predicted outcomes                   | Substantially aligned                    | Direct projected damage and effect summaries are live; a deeper calculation inspector remains.                                                                                                                                                 |
| Six Combat Types                     | Aligned with deliberate wheel difference | Closed six-Type cycle plus Typeless. See deliberate decisions.                                                                                                                                                                                 |
| Type and Trait separation            | Aligned                                  | One Type and zero-to-two Traits per Character.                                                                                                                                                                                                 |
| Continuous dual-Trait contribution   | Aligned 2026-07-31                       | Dual-Trait Characters contribute `0.5` to each Trait.                                                                                                                                                                                          |
| Launch roster mapping                | Aligned                                  | Tux, Humpty Dumpty, Moses, Viking, Ned Kelly, and Grim Reaper match the imported mapping.                                                                                                                                                      |
| Level cap 25                         | Aligned                                  | Enforced by schemas and battle construction.                                                                                                                                                                                                   |
| Free stat respec                     | Aligned                                  | Allocation can be reclaimed outside active tournaments/battles.                                                                                                                                                                                |
| Modification at level 5              | Aligned                                  | One reusable, non-destructive Modification slot.                                                                                                                                                                                               |
| Reordering/enhancement at level 10   | Aligned                                  | Both unlock at level 10 and lock during tournaments.                                                                                                                                                                                           |
| Three permanent Move tiers           | Aligned                                  | Migration-safe `stock`, `gold`, and `platinum` IDs display as Normal, Tier 1, and Tier 2.                                                                                                                                                      |
| Duplicate instances                  | Aligned                                  | Exact copies have independent builds and can deploy together.                                                                                                                                                                                  |
| One team Accessory                   | Aligned core                             | Separate charge meter, symmetric player/AI commands, and data-authored effects. Ownership and run limits remain.                                                                                                                               |
| Drops versus hazards                 | Aligned core                             | Beneficial pickups and hostile Move-slot blocks are distinct engine state.                                                                                                                                                                     |
| Six-Character Tournament Roster      | Aligned 2026-07-31                       | New registration rejects more than six; retired eight-entry saves migrate safely.                                                                                                                                                              |
| Tournament attrition                 | Aligned                                  | Health and defeat persist; recovery/revival occurs between rounds.                                                                                                                                                                             |
| Story graph and replay               | Aligned                                  | No physical map; cleared nodes and branches remain replayable.                                                                                                                                                                                 |
| Local-first save slots               | Aligned                                  | Three progression slots, separate preferences, explicit migrations.                                                                                                                                                                            |
| Seeded randomness                    | Aligned                                  | Combat and Drops use separate explicit deterministic streams.                                                                                                                                                                                  |
| Fixed-point integers                 | Planned                                  | Current transitions are deterministic JavaScript numbers; authoritative integer fixed-point conversion remains a contained engine migration.                                                                                                   |
| Replay command stream                | Aligned core 2026-07-31                  | Reports capture an initial snapshot, exact simulation deltas, and accepted human, AI, and forfeit decisions; the headless replay executor reproduces deterministic state/events, tolerates pause metadata, and rejects direct state edits.     |
| Full effect catalogue                | Partial                                  | Core damage, team damage, heal, stun, periodic effects, bar control, shield, cleanse, reflection, counter, lifesteal, and hit properties exist. Channels, transforms, summons, staged Moves, forced switch, dispel, and wider triggers remain. |
| Sandbox Quick Fight                  | Aligned                                  | Standard Build is ownership-free and progression-neutral.                                                                                                                                                                                      |
| Profile Quick Fight                  | Planned                                  | Reward eligibility and challenge validation remain an explicit open decision.                                                                                                                                                                  |
| AI versus AI                         | Architecture aligned                     | Domain AI is side-agnostic and headless; batch and visible AI-versus-AI controls need expansion.                                                                                                                                               |
| Reduced motion and semantic controls | Aligned core                             | Combat controls are DOM controls and motion settings preserve information.                                                                                                                                                                     |

## Baselines adopted from the imported specification

### Charge and positions

```text
neutral Tempo 5 full Strip: 10 seconds

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

### Charge pacing follows observed playability

The imported eight-second neutral Strip was implemented and then rejected by
live playtest as too fast alongside low-cost Moves, Drops, Accessories, and
opposing AI. The authoritative baseline is now ten seconds at Tempo 5. Tempo,
Traits, and explicit effects still create faster teams without making the
opening unreadable.

### Attack presentation pauses the fight

The imported specification permits overlapping action presentation and normal
simulation progress. The owner directly requested the Teeny Titans-like
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

1. Convert authoritative combat quantities to integer fixed point and version
   the implemented replay contract without changing presentation behaviour.
2. Add authored Gold/Platinum patches rather than relying only on generic
   multipliers.
3. Add enemy dispel, percentage Charge break, one-hit shield, heal/effect
   blocks, and periodic Charge effects.
4. Extend reaction hooks to on-hit, on-critical, on-KO, and on-kill.
5. Add channelled and staged Moves before transforms, summons, and temporary
   replacement kits.
6. Complete Accessory ownership, opponent setup disclosure, and
   tournament-use limits.
7. Add explicit Sandbox/Profile Quick Fight policy and saved presets.
8. Add the six-character Story Active Roster management surface without
   duplicating Tournament registration or combat rules.

## Completion rule

An imported requirement is not marked aligned merely because a document
mentions it. Material combat rules require implementation and tests. Deferred
requirements remain visible here and in the parity audit until representative
content can exercise them without character-specific engine branches.
