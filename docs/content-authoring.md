# Content authoring guide

## Principles

- Content uses stable namespaced IDs.
- Mechanics are composed from reusable effects.
- Display names, copy, visuals, and audio may change without migrations.
- All references are validated before a build passes.
- Authored content declares defaults; player-owned state stores only deltas and choices.

## Move example

```ts
{
  id: "action.viking.shield-bash",
  name: "Battle Boast",
  description: "Bank +28% Power for the next attack. Reuse to stack it.",
  category: "support",
  position: "1L",
  chargeMs: 0,
  effects: [
    {
      kind: "empowerNextMove",
      target: "self",
      magnitude: 0.4
    }
  ],
  presentationId: "presentation.viking.shield-bash",
  audioId: "sfx.action.guard",
}
```

`portraitAssetId` is the camera-facing selection/profile plate.
`idleAssetIds` must contain two distinct, opponent-free battle frames authored
facing right. Their registry records must use `shotRole: character-idle`,
`mirrorPolicy: side-aware`, and `textPolicy: none`; the renderer mirrors only
the enemy copy. Do not reuse the canonical portrait as idle A.

Every Accessory definition also requires `imageAssetId`. The referenced asset
must be an opaque square with `shotRole: accessory`, `mirrorPolicy: never`, and
`textPolicy: none`. Its name, effect and Charge/readiness state remain live UI.

Every Modification (`patch.*`) also requires `imageAssetId` pointing to an
opaque square `modification` asset with `mirrorPolicy: never` and
`textPolicy: none`. Store and Collection render this plate beside live name,
effect, ownership and equipment state.

The complete V2 coverage inventory and the minimum V2.1 Character art roles
live in `src/assets/launch-art-contract.json`. Adding a Character requires one
canonical plate, two directional idle plates, one six-state reaction sheet and
three unique Move plates before the coverage gate passes.

Every Move declares one primary player-readable category: `attack`,
`teamAttack`, `stun`, `teamStun`, `support`, `teamSupport`, `strip`, or
`special`. Choose the tactical promise the player should recognise first. Do
not derive it mechanically from the effects: a damaging Move with a secondary
debuff may still be `attack`, while an unusual transform belongs to `special`.
The battle UI supplies the band, label, and shared key.

Effects execute in array order. A multi-effect Move must never rely on object-key ordering.
An attached effect that should only follow a landed hit must declare
`requiresHit: true`. Enemy follow-ups track their specific target; self and
allied follow-ups use any earlier landed hit in the Move. Position and tier
multipliers apply to numeric output;
moving utility earlier therefore makes it cheaper and weaker, while moving it
later makes it dearer and stronger. Shields are consumable timed pools rather
than renewable armour.

`empowerNextMove` is the reusable stack-and-spend Power primitive. Every
application creates a visible stack on the target. The engine applies the sum
to every hit of the target's next damaging Move and then consumes all stacks.
Do not approximate this rhythm with a short `modifyAttack` timer.

Numeric utility effects receive their Move-position multiplier. `Battle Boast`
is authored at `0.4` because its `1L` multiplier is `0.7`, producing the
player-facing Stock promise of `+28%` per stack. Tests must assert the resolved
status value as well as the authored content value.

A Move can add a qualitative upgrade without a bespoke engine branch:

```ts
tierProperties: {
  gold: {
    undodgeable: true;
  }
}
```

Tier properties are cumulative, so Tier 2 retains the Tier 1 property. Numeric
effects continue to use the normal tier multiplier.

Timed reactions are effects too:

```ts
{ kind: "reflectDamage", target: "self", ratio: 0.35, durationMs: 4500 }
{
  kind: "counterOnDodge",
  target: "self",
  power: 10,
  durationMs: 3000,
  uses: 1
}
```

Eligible reactions are captured when damage or a dodge occurs, then resolve
after the triggering Move completes. A counter's `uses` are spent when queued;
reaction damage cannot recursively trigger reflection or another counter.

## Character example

```ts
{
  id: "character.viking",
  name: "Viking",
  lore: "A historic raider who treats every rules briefing as optional.",
  typeId: "brawler",
  traitIds: ["historic"],
  level: 7,
  baseStats: { health: 120, power: 5, evasion: 2, fortune: 3, tempo: 5 },
  actionIds: [
    "action.viking.shield-bash",
    "action.viking.axe-first",
    "action.viking.berserker-oath",
  ],
  portraitAssetId: "image.viking.canonical",
  idleAssetIds: ["image.viking.idle.a", "image.viking.idle.b"],
  reactionAssetId: "image.viking.reactions",
  musicId: "music.character.viking",
}
```

`reactionAssetId` is optional. When present, the first opaque contact-sheet
contract uses a 3 × 2 grid in this order:

```text
hurt | dodge   | stunned
KO   | victory | tense
```

The presentation layer crops these regions inside the same fixed panel mask.
Characters without the sheet continue to use their current idle plate plus
code-native recoil, flashes, words, and camera motion.

## Character provenance

Combat data and rights/provenance data remain separate. Every Character included
in a preset roster must have exactly one validated entry in
`src/content/character-provenance.ts`. The entry records its source category,
distribution-review state, and an actionable note. `development-review` is not
permission to ship; only an explicitly reviewed
`approved-for-distribution` entry may enter a public production preset.

## Story definition and Level-step contract

Every Story definition declares:

- a stable Story ID, title, completion-award ID, and ordered Levels;
- at least one fight step and at least one preset-Tournament step across those
  Levels;
- its starting collection, economy state, active-Squad policy, and any loans;
- explicit completion and replay policy.

Each Level declares a stable ID and an ordered step list. Reusable step kinds
include content, grant, standard fight, preset Tournament, choice, Store hook,
Mission hook, and completion. Content may appear before or after a fight, and a
grant may intentionally precede Lineup so the new item is immediately usable.
A boss is authored through an ordinary fight plus content/reward steps rather
than a separate combat engine.

The Story runner interprets the steps. Do not add a scene class or domain branch
for a one-off Level.

A Story Tournament step references an existing preset Tournament ID. Story
content cannot embed a private duplicate Tournament definition. Reaching the
final step does not bypass declared completion requirements. When a Story is
complete, any post-game destination references an existing mode such as Quick
Fight rather than defining a bespoke renderer.

## Tournament and Trophy contract

Every Tournament definition declares:

- a stable Tournament ID and display name;
- a registered presentation image asset ID and useful alternative text;
- whether it is a shipped preset or a player-owned local custom definition;
- ordered nodes for fights, content, seeded chance, recovery/revival, reward,
  next-fight effects, Store hooks, and completion;
- at least one fight node;
- named enemy Squads containing one to three configured instances;
- one Tournament Match Settings default block containing the clock, opening
  Charge, and both team Accessory defaults; an individual fight node may store
  a partial override without copying the remaining defaults;
- a player Roster maximum of six and deployment maximum of three;
- its replay and deletion policy;
- exactly one registered Trophy ID.

Every Trophy definition declares:

- a stable Trophy ID;
- name and short cabinet description;
- logical opaque image asset ID and alternative text;
- whether the artwork is a reusable generic custom-Tournament option.

A preset may reference a unique illustrated Trophy. A custom Tournament must
select one of the registered generic Trophy designs and cannot exist without
that reference. A standalone victory upserts global ownership by Tournament
identity. A Story victory also records Story Save provenance and upserts the
same global ownership; deleting that Story Save removes only its local record.
Deleting a custom Tournament removes the global Trophy record dependent on that
definition. Preset removal requires an explicit versioned migration because
Story definitions may reference it.

During a run, player Health/defeat persists across all nodes and current-enemy
Health/defeat persists across repeated deployments. A non-victorious deployment
returns to Lineup while any of the locked six-player Roster remains alive. All
six defeated, or a confirmed whole-run forfeit, loses the Tournament.

## Mission requirement blocks

Initial reusable requirements:

- own at least `n` distinct Characters;
- defeat a specific opponent;
- win `n` Story battles;
- deal total damage;
- use a specific Combat Type or activate a specific Team Trait;
- clear a story/tournament node.

Requirements consume semantic battle/progression reports, not Phaser events.

## Asset IDs

Images, music, SFX, and dialogue use separate stable registries. Content
references logical IDs such as `image.viking.idle.a`, never a physical filename.

Generated candidates and approved files must retain prompt/reference metadata in the project art manifest. Replacing a file is an explicit approval action.

Every new bitmap starts from the required
[art brief template](art-brief-template.md). Gameplay artwork uses
`text_policy: none`; meaningful names, values, labels, instructions, and state
remain owned by the game UI. Promotional artwork may use fixed authored copy
only when the brief records that exact copy and prohibits mirroring.
