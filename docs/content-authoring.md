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
  id: "action.viking.axe-first",
  name: "Axe First",
  description: "A direct opening hit with no attached trick.",
  position: "1L",
  chargeMs: 0,
  effects: [
    {
      kind: "damage",
      target: "activeEnemy",
      power: 18,
      hits: 1,
      undodgeable: false,
      shieldPiercing: false,
      lifeStealRatio: 0
    }
  ],
  presentationId: "presentation.generic.quick",
  audioId: "sfx.action.quick",
}
```

Effects execute in array order. A multi-effect Move must never rely on object-key ordering.
An attached effect that should only follow a landed hit must declare
`requiresHit: true`. Enemy follow-ups track their specific target; self and
allied follow-ups use any earlier landed hit in the Move. Position and tier
multipliers apply to numeric output;
moving utility earlier therefore makes it cheaper and weaker, while moving it
later makes it dearer and stronger. Shields are consumable timed pools rather
than renewable armour.

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
    "action.viking.axe-first",
    "action.viking.shield-bash",
    "action.viking.berserker-oath",
  ],
  portraitAssetId: "image.viking.canonical",
  idleAssetIds: ["image.viking.idle.a", "image.viking.idle.b"],
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

## Story node contract

Every node declares:

- stable ID and story ID;
- node type;
- title and authored payload;
- explicit prerequisites;
- explicit next-node IDs;
- replay/skip behavior;
- rewards or unlocks;
- optional music and art.

The story runner interprets the node. Do not add a scene class for a one-off node.

## Mission requirement blocks

Initial reusable requirements:

- own at least `n` distinct Characters;
- defeat a specific opponent;
- defeat a previously victorious opponent;
- win `n` battles;
- deal total damage;
- use a specific Combat Type or activate a specific Team Trait;
- clear a story/tournament node.

Requirements consume semantic battle/progression reports, not Phaser events.

## Asset IDs

Images, music, SFX, and dialogue use separate stable registries. Content
references logical IDs such as `image.viking.idle.a`, never a physical filename.

Generated candidates and approved files must retain prompt/reference metadata in the project art manifest. Replacing a file is an explicit approval action.
