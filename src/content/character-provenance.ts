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
    rightsStatus: "development-review",
    rightsNote:
      "Create original game art and complete mascot, trademark, licence, and attribution review before distribution.",
  },
  {
    characterId: "character.humpty",
    sourceKind: "public-domain-fiction",
    rightsStatus: "development-review",
    rightsNote:
      "Use the nursery-rhyme character only; create an original visual interpretation and verify the final asset package.",
  },
  {
    characterId: "character.moses",
    sourceKind: "religious-mythological",
    rightsStatus: "development-review",
    rightsNote:
      "Use a respectful original interpretation and review cultural, religious, regional, and distribution context.",
  },
  {
    characterId: "character.viking",
    sourceKind: "historical-archetype",
    rightsStatus: "development-review",
    rightsNote:
      "Generic historical archetype; avoid copying a specific modern production design and review final assets.",
  },
  {
    characterId: "character.ned-kelly",
    sourceKind: "historical-figure",
    rightsStatus: "development-review",
    rightsNote:
      "Use original stylisation based on historical material; do not copy a performer likeness or modern production design.",
  },
  {
    characterId: "character.grim-reaper",
    sourceKind: "religious-mythological",
    rightsStatus: "development-review",
    rightsNote:
      "Use an original personification-of-death design and review the complete visual package before distribution.",
  },
] satisfies CharacterProvenance[];
