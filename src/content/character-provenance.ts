export type CharacterSourceKind =
  | "public-domain-fiction"
  | "historical-figure"
  | "historical-archetype"
  | "religious-mythological"
  | "open-source-culture"
  | "parody"
  | "original";

export type CharacterRightsStatus =
  "development-review" | "approved-for-distribution" | "private-only";

export interface CharacterProvenance {
  characterId: string;
  sourceKind: CharacterSourceKind;
  rightsStatus: CharacterRightsStatus;
  rightsNote: string;
}

export const launchCharacterProvenance = [
  {
    characterId: "character.tux",
    sourceKind: "open-source-culture",
    rightsStatus: "approved-for-distribution",
    rightsNote:
      "Owner-approved for the current V2 web playground. Re-review attribution, mascot/trademark context, materially changed art, and any commercial or merchandise use.",
  },
  {
    characterId: "character.humpty",
    sourceKind: "public-domain-fiction",
    rightsStatus: "approved-for-distribution",
    rightsNote:
      "Owner-approved for the current V2 web playground as an original interpretation of the public-domain nursery-rhyme character. Re-review materially changed art or commercial use.",
  },
  {
    characterId: "character.moses",
    sourceKind: "religious-mythological",
    rightsStatus: "approved-for-distribution",
    rightsNote:
      "Owner-approved for the current V2 web playground as an original interpretation. Re-review materially changed art, cultural context, or commercial use.",
  },
  {
    characterId: "character.viking",
    sourceKind: "historical-archetype",
    rightsStatus: "approved-for-distribution",
    rightsNote:
      "Owner-approved for the current V2 web playground as a generic historical archetype. Re-review materially changed art or commercial use.",
  },
  {
    characterId: "character.ned-kelly",
    sourceKind: "historical-figure",
    rightsStatus: "approved-for-distribution",
    rightsNote:
      "Owner-approved for the current V2 web playground as an original historical stylisation without a performer likeness. Re-review materially changed art or commercial use.",
  },
  {
    characterId: "character.grim-reaper",
    sourceKind: "religious-mythological",
    rightsStatus: "approved-for-distribution",
    rightsNote:
      "Owner-approved for the current V2 web playground as an original personification-of-death design. Re-review materially changed art or commercial use.",
  },
] satisfies CharacterProvenance[];
