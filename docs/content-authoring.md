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
  id: "action.mara-vex.invoice-breaker",
  name: "Invoice Breaker",
  position: "1",
  timing: { kind: "instant" },
  effects: [
    { kind: "damage", target: "activeEnemy", power: 18, hits: 1 }
  ],
  presentationId: "presentation.punch.quick",
  audioId: "sfx.action.quick",
}
```

Effects execute in array order. A multi-effect Move must never rely on object-key ordering.

## Relic example

```ts
{
  id: "character.mara-vex",
  name: "Mara Vex",
  classId: "class.impact",
  factionId: "faction.free-shelf",
  baseStats: { health: 120, power: 5, evasion: 2, fortune: 3, tempo: 5 },
  actionIds: [
    "action.mara-vex.invoice-breaker",
    "action.mara-vex.red-tape",
    "action.mara-vex.hostile-takeover",
  ],
  assetSetId: "asset-set.mara-vex",
  musicId: "music.red-thread",
}
```

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

- own at least `n` distinct Relics;
- defeat a specific opponent;
- defeat a previously victorious opponent;
- win `n` battles;
- deal total damage;
- use a specific class;
- clear a story/tournament node.

Requirements consume semantic battle/progression reports, not Phaser events.

## Asset IDs

Images, music, SFX, and dialogue use separate stable registries. Content references logical IDs such as `image.mara-vex.idle.a`, never `/assets/generated/mara-vex-idle-a.png`.

Generated candidates and approved files must retain prompt/reference metadata in the project art manifest. Replacing a file is an explicit approval action.
