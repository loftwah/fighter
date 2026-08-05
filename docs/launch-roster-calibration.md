# V2 launch-roster functional calibration

Status: **V2 ACCEPTANCE REGISTER**

Last reviewed: 2026-08-04

This register turns the six launch Characters into deliberate functional
benchmarks. It is subordinate to `docs/game-design.md` and
`docs/v2-release-spec.md`: it records how each accepted Character proves one
recognisable battle role without copying another game's character identity,
names, writing, artwork, or audiovisual presentation.

## Calibration rule

The launch roster is not accepted merely because it covers all six Combat
Types. Each Character must also reproduce the useful play loop of one
well-understood reference archetype:

- the same three-part tactical rhythm where our engine can express it;
- the same signature interactions and upgrade benefits;
- a comparable role, ease of use, and reason to switch;
- our own names, fiction, art, animation, balance values, and presentation;
- an explicit adaptation note wherever the source behaviour would require a
  mechanic we have deliberately changed or not yet implemented.

“Close” means the player makes materially similar decisions. It does not mean
matching protected surface expression or blindly copying bugs.

## Six-Character matrix

| LOFTWAH FIGHTER Character | Combat Type  | Calibration role              | Required three-Move rhythm                                                                  | Upgrade signature                                                 | V2 status             |
| ------------------------- | ------------ | ----------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------- |
| Viking                    | Brawler      | Accessible leader             | stack next-Move Power → dependable returning hit → strongest hit plus stun                  | more Power → returning hit becomes undodgeable → longer stun      | Benchmark implemented |
| Grim Reaper               | Beast        | Transforming bruiser          | cheap/free form change → conditional personal boon → heavy whole-Lineup hit                 | cheaper form → stronger boon → stun on the whole-Lineup hit       | Benchmark implemented |
| Humpty Dumpty             | Oddball      | Cute reflector                | shield with end value → surprise attack/boon → timed reflection                             | heal when shield ends → improved boon chance → reactive stun      | Benchmark implemented |
| Moses                     | Arcane       | Dark controller               | charged enemy Strip slow → direct hit → high-cost action disable                            | instant-charge chance → stun on hit → stronger or lasting disable | Benchmark implemented |
| Ned Kelly                 | Sharpshooter | Super support/blaster         | charged direct blast → team healing → team Strip acceleration                               | instant-charge chance → extra healing → allied Power bonus        | Benchmark implemented |
| Tux                       | Tech         | Battery and denial specialist | trade personal Health for Charge → direct shot with disruption chance → multi-hit bar drain | stronger battery → improved disruption → larger Charge drain      | Benchmark implemented |

The Type order intentionally follows the existing LOFTWAH FIGHTER wheel:

```text
Brawler → Beast → Oddball → Arcane → Sharpshooter → Tech → Brawler
```

## Viking: implemented benchmark

Viking is the default owned Story Character and the first active Character in
the default Quick Fight Lineup. He is the launch benchmark for “easy and fun”
rather than a neutral median:

1. **Battle Boast** sits at `1L`. Each Stock use banks a visible `+28%` Power
   stack for Viking's next attack. Using it again adds another stack. The UI
   combines the stack count and total Power, immediately updates the predicted
   hit on both attacks, and the next attack consumes every stored stack after
   all of its hits have resolved. Tier enhancement adds more Power.
2. **Axe First** sits at `2L`. It is an instant, dependable returning-weapon
   hit. Tier 1 makes it undodgeable; Tier 2 retains that property and increases
   its numeric output.
3. **Berserker Oath** sits at `3L`. It is Viking's strongest Stock hit and
   makes a separate `72%` stun roll after a landed hit. It is player-labelled
   as an Attack, with the Stun chance and scaled duration shown as secondary
   output. Numeric tier scaling increases its damage and stun duration without
   silently changing the authored chance.

This is a functional mapping, not a naming licence. The researched leader role
contributes the sequence “stack Power → returning direct hit with an
undodgeable enhancement → direct hit plus stun with a longer-stun
enhancement”. LOFTWAH FIGHTER uses its own Move names, writing, visuals, audio,
and tuning. Research labels remain evidence only and must not become
player-facing content.

Viking is intentionally slightly favourable: all three Moves use the low
offset in their band, his first two decisions resolve instantly, and the player
can choose between immediate damage and banking Power for the finisher. His
fixed-seed acceptance scenario must demonstrate that a first-time player can
win by understanding only this loop.

## Implemented reusable primitives

The five non-Viking rows now use reusable, schema-validated effect primitives:

- self-Health cost with deterministic Charge return;
- shield-end outcomes that also fire when a shield is depleted;
- data-authored surprise/boon tables with explicit seeded odds;
- Move-slot or whole-kit disable effects with clear duration and UI state;
- per-tier cost, charge-time, instant-charge and attached-effect properties;
- a bounded transform or form-state primitive;
- reactive upgrade hooks such as stun on reflection.

No row was closed by adding a Character-specific engine branch. Each primitive
has schema validation, deterministic domain tests, readable Move copy, battle
status feedback and AI valuation. The machine-checkable source-equivalence
authoring gate is recorded in `docs/reference-character-crosswalk.md` and
`src/content/character-calibration.ts`.

## Acceptance evidence

Before V2 freezes:

1. each row is either implemented or has an owner-approved documented
   adaptation;
2. Stock, Tier 1, and Tier 2 behaviour is covered by deterministic tests;
3. action previews and battle reports explain every signature interaction;
4. fixed-seed automated matches establish that no kit is unusable;
5. the Viking first-time-player scenario remains deliberately forgiving;
6. playtest notes record feel, clarity, and decision rhythm, not only win rate.

Automated evidence currently covers all 36 ordered one-on-one Standard-build
matchups. Every pairing completes, both Characters start at least one Move,
the shared AI issues no rejected command, and repeating the same seed produces
the same outcome and remaining Health. This is a broad usability regression
net, not a substitute for owner feel and balance playtesting.
