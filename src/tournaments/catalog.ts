import type { Difficulty, StatBlock } from "../combat/types";

export interface TournamentTrophyDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly imageAssetId: string;
  readonly imageAlt: string;
  readonly generic: boolean;
}

export interface TournamentDefinition {
  readonly id: string;
  readonly name: string;
  readonly kind: "preset" | "variant" | "custom";
  readonly baseTournamentId?: string;
  readonly imageAssetId: string;
  readonly imageAlt: string;
  readonly trophyId: string;
  readonly matchDefaults: TournamentMatchSettings;
  rounds: readonly TournamentRoundDefinition[];
  nodes: readonly TournamentNodeDefinition[];
}

export interface TournamentMatchSettings {
  readonly difficulty?: Difficulty;
  readonly timeLimitMs: number;
  readonly playerStartingCharge: number;
  readonly opponentStartingCharge: number;
  /** @deprecated Player Accessories are selected with each deployment. */
  readonly playerAccessoryId: string | null;
  readonly opponentAccessoryId: string | null;
}

export type TournamentEffectDefinition =
  | { readonly kind: "heal-active"; readonly amount: number }
  | { readonly kind: "heal-roster"; readonly amount: number }
  | { readonly kind: "revive-one"; readonly healthRatio: number }
  | {
      readonly kind: "opening-charge";
      readonly side: "player" | "opponent";
      readonly amount: number;
    }
  | {
      readonly kind: "starting-status";
      readonly side: "player" | "opponent";
      readonly target: "active" | "all";
      readonly status:
        "stun" | "attack" | "defence" | "evasion" | "fortune" | "switchLock";
      readonly durationMs: number;
      readonly magnitude: number;
    }
  | {
      readonly kind: "temporary-stat";
      readonly side: "player" | "opponent";
      readonly target: "active" | "all";
      readonly stat: keyof StatBlock;
      readonly amount: number;
    };

export interface TournamentInterludeChoiceDefinition {
  readonly id: string;
  readonly label: string;
  readonly effects: readonly TournamentEffectDefinition[];
}

export type TournamentNodeDefinition =
  | {
      readonly id: string;
      readonly kind: "fight";
      readonly enemySquadName: string;
      readonly enemyCharacterIds: string[];
      readonly seed: number;
      readonly matchSettings?: Partial<TournamentMatchSettings>;
    }
  | {
      readonly id: string;
      readonly kind: "recovery";
      readonly choiceIds: string[];
      readonly choices?: readonly TournamentInterludeChoiceDefinition[];
    }
  | {
      readonly id: string;
      readonly kind: "content" | "chance" | "reward" | "next-fight-effect";
      readonly contentId: string;
      readonly effects?: readonly TournamentEffectDefinition[];
    };

export interface TournamentRoundDefinition {
  readonly roundIndex: number;
  readonly title: string;
  readonly subtitle: string;
  readonly enemyCharacterIds: string[];
  readonly seed: number;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value;
}

export const tournamentTrophyList = [
  {
    id: "trophy.wrong-door-cup",
    name: "Wrong Door Cup",
    description: "Won by surviving the complete Wrong Door tournament bracket.",
    imageAssetId: "image.trophy.wrong-door-cup",
    imageAlt:
      "A gold trophy formed from mismatched blue and red doors around a keyhole.",
    generic: false,
  },
  {
    id: "trophy.generic.gold-cup",
    name: "Champion Cup",
    description: "A classic gold Trophy for a custom Tournament.",
    imageAssetId: "image.trophy.generic.gold-cup",
    imageAlt: "A broad-handled gold champion cup on a purple plinth.",
    generic: true,
  },
  {
    id: "trophy.generic.silver-tower",
    name: "Victory Tower",
    description: "A sharp silver Trophy for a custom Tournament.",
    imageAssetId: "image.trophy.generic.silver-tower",
    imageAlt: "A tall stepped silver victory tower with a star-shaped crown.",
    generic: true,
  },
  {
    id: "trophy.generic.bronze-chaos",
    name: "Chaos Trophy",
    description: "An asymmetrical bronze Trophy for a custom Tournament.",
    imageAssetId: "image.trophy.generic.bronze-chaos",
    imageAlt:
      "An asymmetrical bronze shield-and-bolt trophy with a lime accent.",
    generic: true,
  },
] as const satisfies readonly TournamentTrophyDefinition[];

export const tournamentTrophies: Record<string, TournamentTrophyDefinition> =
  Object.fromEntries(tournamentTrophyList.map((trophy) => [trophy.id, trophy]));

export const genericTournamentTrophies = tournamentTrophyList.filter(
  (trophy) => trophy.generic,
);

export const tournamentDefinitionList = [
  {
    id: "tournament.cheap-seats",
    name: "The Wrong Door Cup",
    kind: "preset",
    imageAssetId: "image.tournament.cheap-seats",
    imageAlt: "The Wrong Door tournament arena.",
    trophyId: "trophy.wrong-door-cup",
    matchDefaults: {
      timeLimitMs: 120_000,
      playerStartingCharge: 0,
      opponentStartingCharge: 0,
      playerAccessoryId: "accessory.press-pass",
      opponentAccessoryId: "accessory.dead-air",
    },
    rounds: [
      {
        roundIndex: 0,
        title: "Miracle Warm-Up",
        subtitle: "Moses has read the rules and found several omissions.",
        enemyCharacterIds: ["character.moses"],
        seed: 20_260_906,
      },
      {
        roundIndex: 1,
        title: "Shell and Scythe",
        subtitle: "The nursery-rhyme egg has partnered with Death.",
        enemyCharacterIds: ["character.humpty", "character.grim-reaper"],
        seed: 20_260_907,
      },
      {
        roundIndex: 2,
        title: "The Wrong Door Final",
        subtitle:
          "Ned Kelly brought armour. Death brought a prior appointment.",
        enemyCharacterIds: ["character.ned-kelly", "character.grim-reaper"],
        seed: 20_260_908,
      },
    ],
    nodes: [
      {
        id: "round-1",
        kind: "fight",
        enemySquadName: "Miracle Warm-Up",
        enemyCharacterIds: ["character.moses"],
        seed: 20_260_906,
      },
      {
        id: "recovery-1",
        kind: "recovery",
        choiceIds: ["front-print-repair", "case-repair", "hot-start"],
        choices: [
          {
            id: "front-print-repair",
            label: "Repair the active fighter",
            effects: [{ kind: "heal-active", amount: 0.45 }],
          },
          {
            id: "case-repair",
            label: "Repair the whole Roster",
            effects: [
              { kind: "revive-one", healthRatio: 0.35 },
              { kind: "heal-roster", amount: 0.18 },
            ],
          },
          {
            id: "hot-start",
            label: "Start the next fight charged",
            effects: [{ kind: "opening-charge", side: "player", amount: 18 }],
          },
        ],
      },
      {
        id: "round-2",
        kind: "fight",
        enemySquadName: "Shell and Scythe",
        enemyCharacterIds: ["character.humpty", "character.grim-reaper"],
        seed: 20_260_907,
      },
      {
        id: "recovery-2",
        kind: "recovery",
        choiceIds: ["front-print-repair", "case-repair", "hot-start"],
        choices: [
          {
            id: "front-print-repair",
            label: "Repair the active fighter",
            effects: [{ kind: "heal-active", amount: 0.45 }],
          },
          {
            id: "case-repair",
            label: "Repair the whole Roster",
            effects: [
              { kind: "revive-one", healthRatio: 0.35 },
              { kind: "heal-roster", amount: 0.18 },
            ],
          },
          {
            id: "hot-start",
            label: "Start the next fight charged",
            effects: [{ kind: "opening-charge", side: "player", amount: 18 }],
          },
        ],
      },
      {
        id: "round-3",
        kind: "fight",
        enemySquadName: "The Wrong Door Final",
        enemyCharacterIds: ["character.ned-kelly", "character.grim-reaper"],
        seed: 20_260_908,
      },
    ],
  },
] satisfies readonly TournamentDefinition[];

deepFreeze(tournamentTrophyList);
deepFreeze(tournamentDefinitionList);

export const tournamentDefinitions: Record<string, TournamentDefinition> =
  Object.fromEntries(
    tournamentDefinitionList.map((tournament) => [tournament.id, tournament]),
  );

export function validateTournamentDefinition(
  definition: TournamentDefinition,
): TournamentDefinition {
  const trophy = tournamentTrophies[definition.trophyId];
  if (!trophy) {
    throw new Error(`Tournament ${definition.id} has no registered Trophy`);
  }
  if (definition.kind === "custom" && !trophy.generic) {
    throw new Error("A custom Tournament must use a registered generic Trophy");
  }
  if (definition.nodes.length === 0) {
    throw new Error(`Tournament ${definition.id} requires at least one node`);
  }
  if (
    !Number.isInteger(definition.matchDefaults.timeLimitMs) ||
    definition.matchDefaults.timeLimitMs < 30_000 ||
    definition.matchDefaults.timeLimitMs > 300_000 ||
    definition.matchDefaults.playerStartingCharge < 0 ||
    definition.matchDefaults.playerStartingCharge > 100 ||
    definition.matchDefaults.opponentStartingCharge < 0 ||
    definition.matchDefaults.opponentStartingCharge > 100
  ) {
    throw new Error(`Tournament ${definition.id} has invalid Match Settings`);
  }
  const nodeIds = definition.nodes.map((node) => node.id);
  if (new Set(nodeIds).size !== nodeIds.length) {
    throw new Error(`Tournament ${definition.id} node IDs must be unique`);
  }
  const fights = definition.nodes.filter(
    (node): node is Extract<TournamentNodeDefinition, { kind: "fight" }> =>
      node.kind === "fight",
  );
  if (fights.length === 0) {
    throw new Error(`Tournament ${definition.id} requires at least one fight`);
  }
  for (const node of definition.nodes) {
    const effects =
      node.kind === "recovery"
        ? (node.choices ?? []).flatMap((choice) => choice.effects)
        : "effects" in node
          ? (node.effects ?? [])
          : [];
    if (
      effects.some((effect) => {
        if (effect.kind === "revive-one") {
          return effect.healthRatio <= 0 || effect.healthRatio > 1;
        }
        if (effect.kind === "starting-status") {
          return effect.durationMs <= 0 || effect.magnitude < 0;
        }
        if (effect.kind === "temporary-stat") {
          return !Number.isFinite(effect.amount) || effect.amount === 0;
        }
        return (
          effect.amount <= 0 ||
          effect.amount > (effect.kind === "opening-charge" ? 100 : 1)
        );
      })
    ) {
      throw new Error(
        `Tournament ${definition.id} has an invalid interlude effect`,
      );
    }
  }
  if (
    fights.some(
      (fight) =>
        fight.enemyCharacterIds.length < 1 ||
        fight.enemyCharacterIds.length > 3 ||
        !Number.isInteger(fight.seed) ||
        (() => {
          const settings = {
            ...definition.matchDefaults,
            ...fight.matchSettings,
          };
          return (
            !Number.isInteger(settings.timeLimitMs) ||
            settings.timeLimitMs < 30_000 ||
            settings.timeLimitMs > 300_000 ||
            settings.playerStartingCharge < 0 ||
            settings.playerStartingCharge > 100 ||
            settings.opponentStartingCharge < 0 ||
            settings.opponentStartingCharge > 100
          );
        })(),
    )
  ) {
    throw new Error(
      `Tournament ${definition.id} fight nodes require one to three opponents and an explicit integer seed`,
    );
  }
  return definition;
}

for (const definition of tournamentDefinitionList) {
  validateTournamentDefinition(definition);
}
if (
  new Set(tournamentDefinitionList.map((definition) => definition.trophyId))
    .size !== tournamentDefinitionList.length
) {
  throw new Error("Every preset Tournament requires its own registered Trophy");
}

export function tournamentTrophy(
  tournamentId: string,
): TournamentTrophyDefinition {
  const tournament = tournamentDefinition(tournamentId);
  const trophy = tournamentTrophies[tournament.trophyId];
  if (!trophy) {
    throw new Error(`Tournament ${tournamentId} has no registered Trophy`);
  }
  return trophy;
}

export function tournamentDefinition(
  tournamentId: string,
): TournamentDefinition {
  const tournament = tournamentDefinitions[tournamentId];
  if (!tournament) {
    throw new Error(`Tournament ${tournamentId} is not registered`);
  }
  return tournament;
}

export function createTournamentVariant(
  presetId: string,
  input: {
    id: string;
    name?: string;
    trophyId?: string;
    matchDefaults?: Partial<TournamentMatchSettings>;
    fightOverrides?: Readonly<Record<string, Partial<TournamentMatchSettings>>>;
  },
): TournamentDefinition {
  const preset = tournamentDefinition(presetId);
  const nodes = preset.nodes.map((node) =>
    node.kind === "fight"
      ? {
          ...node,
          matchSettings: {
            ...node.matchSettings,
            ...input.fightOverrides?.[node.id],
          },
        }
      : node,
  );
  const variant = structuredClone({
    ...preset,
    id: input.id.trim(),
    name: input.name?.trim() || preset.name,
    kind: "variant" as const,
    baseTournamentId: preset.id,
    trophyId: input.trophyId ?? preset.trophyId,
    matchDefaults: { ...preset.matchDefaults, ...input.matchDefaults },
    nodes,
  });
  return deepFreeze(validateTournamentDefinition(variant));
}

export function resolveTournamentDefinition(
  tournamentId: string,
  customDefinitions:
    | readonly TournamentDefinition[]
    | Readonly<Record<string, TournamentDefinition>> = [],
): TournamentDefinition {
  const preset = tournamentDefinitions[tournamentId];
  if (preset) return preset;
  const customRegistry: Readonly<Record<string, TournamentDefinition>> =
    Array.isArray(customDefinitions)
      ? Object.fromEntries(
          (customDefinitions as readonly TournamentDefinition[]).map(
            (definition) => [definition.id, definition],
          ),
        )
      : (customDefinitions as Readonly<Record<string, TournamentDefinition>>);
  const custom = customRegistry[tournamentId];
  if (!custom) throw new Error(`Tournament ${tournamentId} is not registered`);
  return deepFreeze(validateTournamentDefinition(structuredClone(custom)));
}

export function resolveTournamentRunDefinition(
  run: {
    tournamentId: string;
    baseTournamentId?: string | null;
    definitionKind?: "preset" | "variant" | "custom";
    definitionTrophyId?: string;
    runSettings?: {
      defaults: TournamentMatchSettings;
      fightOverrides: Record<string, Partial<TournamentMatchSettings>>;
    };
  },
  persistedDefinitions:
    | readonly TournamentDefinition[]
    | Readonly<Record<string, TournamentDefinition>> = [],
): TournamentDefinition {
  if (run.definitionKind === "variant" && run.baseTournamentId) {
    return createTournamentVariant(run.baseTournamentId, {
      id: run.tournamentId,
      trophyId: run.definitionTrophyId,
      matchDefaults: run.runSettings?.defaults,
      fightOverrides: run.runSettings?.fightOverrides,
    });
  }
  return resolveTournamentDefinition(run.tournamentId, persistedDefinitions);
}

export interface PersistedTournamentDefinitionSource {
  readonly id: string;
  readonly name: string;
  readonly trophyId: string;
  readonly imageAssetId: string;
  readonly imageAlt: string;
  readonly matchDefaults: TournamentMatchSettings;
  readonly nodes: readonly {
    readonly id: string;
    readonly kind: "fight";
    readonly label: string;
    readonly opponentCharacterIds: readonly string[];
    readonly seed: number;
    readonly matchSettings?: Partial<TournamentMatchSettings>;
  }[];
}

export function tournamentDefinitionFromPersisted(
  source: PersistedTournamentDefinitionSource,
): TournamentDefinition {
  const definition: TournamentDefinition = {
    id: source.id,
    name: source.name,
    kind: "custom",
    imageAssetId: source.imageAssetId,
    imageAlt: source.imageAlt,
    trophyId: source.trophyId,
    matchDefaults: { ...source.matchDefaults },
    rounds: [],
    nodes: source.nodes.map((node) => ({
      id: node.id,
      kind: "fight",
      enemySquadName: node.label,
      enemyCharacterIds: [...node.opponentCharacterIds],
      seed: node.seed,
      matchSettings: { ...node.matchSettings },
    })),
  };
  return deepFreeze(validateTournamentDefinition(definition));
}

export function tournamentFightSettings(
  tournamentId: string,
  nodeId: string,
): TournamentMatchSettings {
  return tournamentFightDefinition(tournamentId, nodeId).settings;
}

export function tournamentFightDefinition(
  tournamentId: string,
  nodeId: string,
): {
  node: Extract<TournamentNodeDefinition, { kind: "fight" }>;
  settings: TournamentMatchSettings;
} {
  const tournament = tournamentDefinition(tournamentId);
  const node = tournament.nodes.find(
    (
      candidate,
    ): candidate is Extract<TournamentNodeDefinition, { kind: "fight" }> =>
      candidate.id === nodeId && candidate.kind === "fight",
  );
  if (!node) throw new Error(`Tournament fight ${nodeId} is not registered`);
  return {
    node,
    settings: deepFreeze({
      ...tournament.matchDefaults,
      ...node.matchSettings,
    }),
  };
}

export function awardTournamentTrophy(
  currentTrophyIds: readonly string[],
  tournamentId: string,
): { trophyIds: string[]; trophyId: string; awarded: boolean } {
  const trophy = tournamentTrophy(tournamentId);
  if (currentTrophyIds.includes(trophy.id)) {
    return {
      trophyIds: [...currentTrophyIds],
      trophyId: trophy.id,
      awarded: false,
    };
  }
  return {
    trophyIds: [...currentTrophyIds, trophy.id],
    trophyId: trophy.id,
    awarded: true,
  };
}

export function awardTournamentDefinitionTrophy(
  currentTrophyIds: readonly string[],
  definition: TournamentDefinition,
): { trophyIds: string[]; trophyId: string; awarded: boolean } {
  const trophy = tournamentTrophies[definition.trophyId];
  if (!trophy) {
    throw new Error(`Tournament ${definition.id} has no registered Trophy`);
  }
  const awarded = !currentTrophyIds.includes(trophy.id);
  return {
    trophyIds: awarded
      ? [...currentTrophyIds, trophy.id]
      : [...currentTrophyIds],
    trophyId: trophy.id,
    awarded,
  };
}
