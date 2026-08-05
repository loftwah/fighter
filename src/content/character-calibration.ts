/**
 * Internal authoring metadata. This is deliberately not part of CombatContent
 * and must never supply player-facing names, copy, art, or balance values.
 */
export interface CharacterCalibration {
  characterId: string;
  referenceGameCharacter: string;
  role: string;
  decisionLoop: readonly [string, string, string];
  adaptation: string;
}

export const characterCalibrations = [
  {
    characterId: "character.viking",
    referenceGameCharacter: "Robin",
    role: "accessible leader",
    decisionLoop: [
      "bank Power for the next Move",
      "use a dependable returning hit",
      "commit to the strongest hit with Stun",
    ],
    adaptation: "Original Viking fiction, values, Move names and presentation.",
  },
  {
    characterId: "character.grim-reaper",
    referenceGameCharacter: "Beast Boy",
    role: "transforming bruiser",
    decisionLoop: [
      "enter a bounded combat form",
      "roll a personal recovery or pressure boon",
      "hit the complete opposing Lineup",
    ],
    adaptation: "One bounded form status rather than a replacement art kit.",
  },
  {
    characterId: "character.humpty",
    referenceGameCharacter: "Silkie",
    role: "cute reflector",
    decisionLoop: [
      "set a shield with value when it ends",
      "risk a seeded surprise boon",
      "return incoming damage during a timed stance",
    ],
    adaptation: "Seeded boons replace opaque source randomness.",
  },
  {
    characterId: "character.moses",
    referenceGameCharacter: "Raven",
    role: "dark controller",
    decisionLoop: [
      "charge an opposing Strip slowdown",
      "land a direct control hit",
      "disable the complete opposing Move kit",
    ],
    adaptation: "Whole-kit disable is explicit, timed and visibly labelled.",
  },
  {
    characterId: "character.ned-kelly",
    referenceGameCharacter: "Starfire",
    role: "super support and blaster",
    decisionLoop: [
      "charge a dependable direct blast",
      "restore the living Lineup",
      "accelerate the team's Charge Strip",
    ],
    adaptation: "Original outlaw framing and progression-neutral tuning.",
  },
  {
    characterId: "character.tux",
    referenceGameCharacter: "Cyborg",
    role: "battery and denial specialist",
    decisionLoop: [
      "trade personal Health for Charge",
      "damage and disrupt a Move slot",
      "barrage the Lineup and drain its Strip",
    ],
    adaptation:
      "Health payment is non-lethal and Charge drain is percentage based.",
  },
] as const satisfies readonly CharacterCalibration[];
