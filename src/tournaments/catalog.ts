export interface TournamentTrophyDefinition {
  id: string;
  name: string;
  description: string;
  imageAssetId: string;
  imageAlt: string;
  generic: boolean;
}

export interface TournamentDefinition {
  id: string;
  name: string;
  kind: "authored" | "custom";
  imageAssetId: string;
  imageAlt: string;
  trophyId: string;
  rounds: readonly TournamentRoundDefinition[];
}

export interface TournamentRoundDefinition {
  roundIndex: 0 | 1 | 2;
  title: string;
  subtitle: string;
  enemyCharacterIds: string[];
  seed: number;
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
    kind: "authored",
    imageAssetId: "image.tournament.cheap-seats",
    imageAlt: "The Wrong Door tournament arena.",
    trophyId: "trophy.wrong-door-cup",
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
  },
] satisfies readonly TournamentDefinition[];

export const tournamentDefinitions: Record<string, TournamentDefinition> =
  Object.fromEntries(
    tournamentDefinitionList.map((tournament) => [tournament.id, tournament]),
  );

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
