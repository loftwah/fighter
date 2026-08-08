import type { ActionDefinition, CharacterDefinition } from "../combat/types";

export const launchActions = [
  {
    id: "action.tux.ping",
    name: "Ping",
    description:
      "Trade 14 Health for an immediate burst of team Charge. This cannot knock Tux out.",
    category: "support",
    position: "1L",
    chargeMs: 0,
    effects: [
      { kind: "healthCost", target: "self", amount: 14, minimumHealth: 1 },
      { kind: "bar", target: "allies", amount: 44 },
    ],
    tierProperties: {
      gold: {
        additionalEffects: [{ kind: "bar", target: "allies", amount: 12 }],
      },
    },
    presentationId: "presentation.tux.ping",
    audioId: "sfx.action.quick",
  },
  {
    id: "action.tux.root-access",
    name: "Root Access",
    description:
      "Fire a direct shot with a chance to jam the target's middle Move.",
    category: "special",
    position: "2",
    chargeMs: 450,
    interruptionPolicy: "spend",
    effects: [
      { kind: "damage", target: "activeEnemy", power: 17 },
      {
        kind: "blockMove",
        target: "enemies",
        slotIndex: 1,
        durationMs: 2_500,
        chance: 0.35,
        requiresHit: true,
      },
    ],
    tierProperties: {
      gold: {
        additionalEffects: [
          {
            kind: "blockMove",
            target: "enemies",
            slotIndex: 1,
            durationMs: 3_500,
            chance: 0.35,
            requiresHit: true,
          },
        ],
      },
    },
    presentationId: "presentation.tux.root-access",
    audioId: "sfx.action.control",
  },
  {
    id: "action.tux.kernel-panic",
    name: "Kernel Panic",
    description:
      "Launch three missiles through the opposing Lineup and drain 25% of its current Charge.",
    category: "teamAttack",
    position: "3",
    chargeMs: 900,
    interruptionPolicy: "spend",
    effects: [
      { kind: "damage", target: "allEnemies", power: 5, hits: 3 },
      {
        kind: "barPercent",
        target: "enemies",
        ratio: -0.25,
        requiresHit: true,
      },
    ],
    tierProperties: {
      platinum: {
        additionalEffects: [
          {
            kind: "barPercent",
            target: "enemies",
            ratio: -0.12,
            requiresHit: true,
          },
        ],
      },
    },
    presentationId: "presentation.tux.kernel-panic",
    audioId: "sfx.action.finisher",
  },
  {
    id: "action.humpty.egg-on-your-face",
    name: "Egg on Your Face",
    description:
      "Raise a shell shield. At Tier 1 it restores Health when it expires or breaks.",
    category: "support",
    position: "1",
    chargeMs: 0,
    effects: [
      { kind: "shield", target: "self", amount: 20, durationMs: 4_500 },
    ],
    tierProperties: {
      gold: { shieldEndHealPower: 12 },
    },
    presentationId: "presentation.humpty.egg-on-your-face",
    audioId: "sfx.action.quick",
  },
  {
    id: "action.humpty.shell-game",
    name: "Shell Game",
    description:
      "Catch the opponent with a surprise hit and roll for a helpful personal boon.",
    category: "special",
    position: "2",
    chargeMs: 250,
    interruptionPolicy: "spend",
    effects: [
      { kind: "damage", target: "activeEnemy", power: 16 },
      {
        kind: "randomBoon",
        target: "self",
        options: [
          { weight: 60 },
          {
            weight: 20,
            effect: { kind: "heal", power: 12 },
          },
          {
            weight: 20,
            effect: {
              kind: "modifyAttack",
              magnitude: 0.2,
              durationMs: 5_000,
            },
          },
        ],
      },
    ],
    tierProperties: {
      gold: {
        additionalEffects: [
          {
            kind: "randomBoon",
            target: "self",
            options: [
              { weight: 40 },
              { weight: 30, effect: { kind: "bar", amount: 18 } },
              {
                weight: 30,
                effect: {
                  kind: "modifyEvasion",
                  magnitude: 3,
                  durationMs: 5_000,
                },
              },
            ],
          },
        ],
      },
    },
    presentationId: "presentation.humpty.shell-game",
    audioId: "sfx.action.guard",
  },
  {
    id: "action.humpty.great-fall",
    name: "Great Fall",
    description:
      "Turn incoming Health damage back on its source for a short window. Tier 2 can stun on reflection.",
    category: "support",
    position: "3",
    chargeMs: 850,
    interruptionPolicy: "spend",
    effects: [
      {
        kind: "reflectDamage",
        target: "self",
        ratio: 0.7,
        durationMs: 3_500,
      },
    ],
    tierProperties: {
      platinum: {
        reflectionStun: { chance: 1, durationMs: 700 },
      },
    },
    presentationId: "presentation.humpty.great-fall",
    audioId: "sfx.action.finisher",
  },
  {
    id: "action.moses.staff-tap",
    name: "Staff Tap",
    description:
      "Charge the staff, then slow the opposing Charge Strip. Upgrades may resolve it instantly.",
    category: "strip",
    position: "1H",
    chargeMs: 800,
    interruptionPolicy: "spend",
    effects: [
      {
        kind: "modifyChargeRate",
        target: "enemies",
        multiplier: 0.55,
        durationMs: 3_500,
      },
    ],
    tierProperties: {
      gold: { instantChargeChance: 0.35 },
      platinum: { instantChargeChance: 0.55 },
    },
    presentationId: "presentation.moses.staff-tap",
    audioId: "sfx.action.heal",
  },
  {
    id: "action.moses.part-the-strip",
    name: "Part the Strip",
    description: "Strike the active enemy directly. Tier 1 can stun on hit.",
    category: "stun",
    position: "2",
    chargeMs: 500,
    interruptionPolicy: "spend",
    effects: [{ kind: "damage", target: "activeEnemy", power: 18 }],
    tierProperties: {
      gold: {
        additionalEffects: [
          {
            kind: "stun",
            target: "activeEnemy",
            durationMs: 650,
            chance: 0.55,
            requiresHit: true,
          },
        ],
      },
    },
    presentationId: "presentation.moses.part-the-strip",
    audioId: "sfx.action.control",
  },
  {
    id: "action.moses.safe-passage",
    name: "Safe Passage",
    description:
      "Temporarily disable every opposing Move. Tier 2 extends the lock.",
    category: "special",
    position: "3H",
    chargeMs: 1_050,
    interruptionPolicy: "spend",
    effects: [
      {
        kind: "blockMove",
        target: "enemies",
        slotIndex: "all",
        durationMs: 2_000,
      },
    ],
    tierProperties: {
      platinum: {
        additionalEffects: [
          {
            kind: "blockMove",
            target: "enemies",
            slotIndex: "all",
            durationMs: 4_000,
          },
        ],
      },
    },
    presentationId: "presentation.moses.safe-passage",
    audioId: "sfx.action.heal",
  },
  {
    id: "action.viking.axe-first",
    name: "Axe First",
    description:
      "Throw a returning axe for dependable damage. Tier 1 makes it undodgeable.",
    category: "attack",
    position: "2L",
    chargeMs: 0,
    effects: [{ kind: "damage", target: "activeEnemy", power: 20 }],
    tierProperties: {
      gold: { undodgeable: true },
    },
    presentationId: "presentation.viking.axe-first",
    audioId: "sfx.action.quick",
  },
  {
    id: "action.viking.shield-bash",
    name: "Battle Boast",
    description:
      "Bank +28% Power for Viking's next attack. Use it again to stack; the attack spends every stack.",
    category: "support",
    position: "1L",
    chargeMs: 0,
    effects: [
      {
        kind: "empowerNextMove",
        target: "self",
        magnitude: 0.4,
      },
    ],
    presentationId: "presentation.viking.shield-bash",
    audioId: "sfx.action.guard",
  },
  {
    id: "action.viking.berserker-oath",
    name: "Berserker Oath",
    description:
      "Bring the axe down in Viking's strongest default hit. After it lands, it has a 72% chance to stun.",
    category: "attack",
    position: "3L",
    chargeMs: 700,
    interruptionPolicy: "spend",
    effects: [
      {
        kind: "damage",
        target: "activeEnemy",
        power: 20,
      },
      {
        kind: "stun",
        target: "activeEnemy",
        durationMs: 650,
        chance: 0.72,
        requiresHit: true,
      },
    ],
    presentationId: "presentation.viking.berserker-oath",
    audioId: "sfx.action.finisher",
  },
  {
    id: "action.ned-kelly.warning-shot",
    name: "Warning Shot",
    description:
      "Charge a direct armour-piercing blast. Upgrades may resolve it instantly.",
    category: "attack",
    position: "1",
    chargeMs: 750,
    interruptionPolicy: "spend",
    effects: [
      {
        kind: "damage",
        target: "activeEnemy",
        power: 13,
        undodgeable: true,
      },
    ],
    tierProperties: {
      gold: { instantChargeChance: 0.35 },
      platinum: { instantChargeChance: 0.55 },
    },
    presentationId: "presentation.ned-kelly.warning-shot",
    audioId: "sfx.action.quick",
  },
  {
    id: "action.ned-kelly.iron-outlaw",
    name: "Iron Outlaw",
    description: "Patch up every living ally. Tier 1 restores extra Health.",
    category: "teamSupport",
    position: "2L",
    chargeMs: 0,
    effects: [{ kind: "heal", target: "allAllies", power: 18 }],
    tierProperties: {
      gold: {
        additionalEffects: [{ kind: "heal", target: "allAllies", power: 8 }],
      },
    },
    presentationId: "presentation.ned-kelly.iron-outlaw",
    audioId: "sfx.action.guard",
  },
  {
    id: "action.ned-kelly.last-stand",
    name: "Last Stand",
    description:
      "Accelerate the whole team's Charge Strip. Tier 2 also raises allied Power.",
    category: "teamSupport",
    position: "3",
    chargeMs: 1_100,
    interruptionPolicy: "spend",
    effects: [
      {
        kind: "modifyChargeRate",
        target: "allies",
        multiplier: 1.35,
        durationMs: 5_000,
      },
    ],
    tierProperties: {
      platinum: {
        additionalEffects: [
          {
            kind: "modifyAttack",
            target: "allAllies",
            magnitude: 0.18,
            durationMs: 5_000,
          },
        ],
      },
    },
    presentationId: "presentation.ned-kelly.last-stand",
    audioId: "sfx.action.finisher",
  },
  {
    id: "action.grim-reaper.cold-touch",
    name: "Cold Touch",
    description:
      "Assume a bounded beast form that raises Power and hardens Grim against damage.",
    category: "special",
    position: "1L",
    chargeMs: 0,
    effects: [
      {
        kind: "transform",
        target: "self",
        formId: "form.grim-reaper.beast",
        attackMagnitude: 0.2,
        defenceMagnitude: -0.12,
        durationMs: 30_000,
      },
    ],
    tierProperties: {
      gold: { cost: 0 },
    },
    presentationId: "presentation.grim-reaper.cold-touch",
    audioId: "sfx.action.quick",
  },
  {
    id: "action.grim-reaper.deaths-shadow",
    name: "Death's Shadow",
    description:
      "Draw a seeded personal boon from the shadow: Health, Charge, or Power.",
    category: "support",
    position: "2L",
    chargeMs: 300,
    interruptionPolicy: "spend",
    requiredFormId: "form.grim-reaper.beast",
    effects: [
      {
        kind: "randomBoon",
        target: "self",
        options: [
          { weight: 1, effect: { kind: "heal", power: 16 } },
          { weight: 1, effect: { kind: "bar", amount: 18 } },
          {
            weight: 1,
            effect: {
              kind: "modifyAttack",
              magnitude: 0.28,
              durationMs: 6_000,
            },
          },
        ],
      },
      {
        kind: "modifyAttack",
        target: "self",
        magnitude: 0.12,
        durationMs: 24_000,
      },
    ],
    tierProperties: {
      gold: {
        additionalEffects: [
          {
            kind: "modifyAttack",
            target: "self",
            magnitude: 0.1,
            durationMs: 6_000,
          },
        ],
      },
    },
    presentationId: "presentation.grim-reaper.deaths-shadow",
    audioId: "sfx.action.control",
  },
  {
    id: "action.grim-reaper.final-harvest",
    name: "Final Harvest",
    description:
      "Drop the full weight of the beast form on the opposing Lineup. Tier 2 can stun everyone hit.",
    category: "teamAttack",
    position: "3L",
    chargeMs: 1_100,
    interruptionPolicy: "spend",
    effects: [
      {
        kind: "damage",
        target: "allEnemies",
        power: 16,
      },
      {
        kind: "damageOverTime",
        target: "allEnemies",
        power: 2,
        durationMs: 2_000,
        intervalMs: 1_000,
        requiresHit: true,
      },
    ],
    tierProperties: {
      platinum: {
        additionalEffects: [
          {
            kind: "stun",
            target: "allEnemies",
            durationMs: 850,
            chance: 0.6,
            requiresHit: true,
          },
        ],
      },
    },
    presentationId: "presentation.grim-reaper.final-harvest",
    audioId: "sfx.action.finisher",
  },
] satisfies ActionDefinition[];

export const launchCharacters = [
  {
    id: "character.tux",
    name: "Tux",
    lore: "A cheerful open-source penguin who treats every locked system as a polite invitation to collaborate.",
    typeId: "tech",
    traitIds: ["icon"],
    level: 6,
    baseStats: { health: 92, power: 4, evasion: 6, fortune: 4, tempo: 9 },
    actionIds: [
      "action.tux.ping",
      "action.tux.root-access",
      "action.tux.kernel-panic",
    ],
    portraitAssetId: "image.tux.canonical",
    idleAssetIds: ["image.tux.idle.a", "image.tux.idle.b"],
    reactionAssetId: "image.tux.reactions",
    musicId: "music.character.tux",
  },
  {
    id: "character.humpty",
    name: "Humpty Dumpty",
    lore: "The famous wall enthusiast insists the fall was tactical and the king's horses simply ignored the recovery plan.",
    typeId: "oddball",
    traitIds: ["icon"],
    level: 5,
    baseStats: { health: 94, power: 5, evasion: 8, fortune: 6, tempo: 6 },
    actionIds: [
      "action.humpty.egg-on-your-face",
      "action.humpty.shell-game",
      "action.humpty.great-fall",
    ],
    portraitAssetId: "image.humpty.canonical",
    idleAssetIds: ["image.humpty.idle.a", "image.humpty.idle.b"],
    reactionAssetId: "image.humpty.reactions",
    musicId: "music.character.humpty",
  },
  {
    id: "character.moses",
    name: "Moses",
    lore: "A miracle-working leader carrying a staff, a serious sense of purpose, and no patience for obstructed routes.",
    typeId: "arcane",
    traitIds: ["hero", "mythic"],
    level: 6,
    baseStats: { health: 98, power: 3, evasion: 4, fortune: 7, tempo: 5 },
    actionIds: [
      "action.moses.staff-tap",
      "action.moses.part-the-strip",
      "action.moses.safe-passage",
    ],
    portraitAssetId: "image.moses.canonical",
    idleAssetIds: ["image.moses.idle.a", "image.moses.idle.b"],
    reactionAssetId: "image.moses.reactions",
    musicId: "music.character.moses",
  },
  {
    id: "character.viking",
    name: "Viking",
    lore: "A saga-era raider who heard there would be prizes, misunderstood every other detail, and arrived battle-ready.",
    typeId: "brawler",
    traitIds: ["historic"],
    level: 7,
    baseStats: { health: 112, power: 6, evasion: 3, fortune: 5, tempo: 5 },
    actionIds: [
      "action.viking.shield-bash",
      "action.viking.axe-first",
      "action.viking.berserker-oath",
    ],
    portraitAssetId: "image.viking.canonical",
    idleAssetIds: ["image.viking.idle.a", "image.viking.idle.b"],
    reactionAssetId: "image.viking.reactions",
    musicId: "music.character.viking",
  },
  {
    id: "character.ned-kelly",
    name: "Ned Kelly",
    lore: "The armoured Australian outlaw enters the bracket under protest and refuses to remove the helmet for identification.",
    typeId: "sharpshooter",
    traitIds: ["hero", "historic"],
    level: 6,
    baseStats: { health: 108, power: 6, evasion: 4, fortune: 6, tempo: 4 },
    actionIds: [
      "action.ned-kelly.warning-shot",
      "action.ned-kelly.iron-outlaw",
      "action.ned-kelly.last-stand",
    ],
    portraitAssetId: "image.ned-kelly.canonical",
    idleAssetIds: ["image.ned-kelly.idle.a", "image.ned-kelly.idle.b"],
    reactionAssetId: "image.ned-kelly.reactions",
    musicId: "music.character.ned-kelly",
  },
  {
    id: "character.grim-reaper",
    name: "Grim Reaper",
    lore: "The embodiment of death has joined a light entertainment tournament and remains baffled by the waiver.",
    typeId: "beast",
    traitIds: ["monster", "mythic"],
    level: 5,
    baseStats: { health: 108, power: 7, evasion: 2, fortune: 3, tempo: 4 },
    actionIds: [
      "action.grim-reaper.cold-touch",
      "action.grim-reaper.deaths-shadow",
      "action.grim-reaper.final-harvest",
    ],
    portraitAssetId: "image.grim-reaper.canonical",
    idleAssetIds: ["image.grim-reaper.idle.a", "image.grim-reaper.idle.b"],
    reactionAssetId: "image.grim-reaper.reactions",
    musicId: "music.character.grim-reaper",
  },
] satisfies CharacterDefinition[];
