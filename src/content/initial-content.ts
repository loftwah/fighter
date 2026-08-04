import type { AccessoryDefinition, CombatContent } from "../combat/types";
import { launchActions, launchCharacters } from "./launch-roster";

export const accessories = [
  {
    id: "accessory.press-pass",
    name: "Second Wind",
    imageAssetId: "image.accessory.second-wind",
    description:
      "Trigger a fully charged boost to add 30 Charge to your team's Strip.",
    effects: [{ kind: "bar", target: "allies", amount: 30 }],
  },
  {
    id: "accessory.dead-air",
    name: "Dead Air",
    imageAssetId: "image.accessory.dead-air",
    description:
      "Blank the opposing Charge Strip for 2.4 seconds without removing its progress.",
    effects: [
      {
        kind: "modifyChargeRate",
        target: "enemies",
        multiplier: 0,
        durationMs: 2_400,
      },
    ],
  },
  {
    id: "accessory.field-kit",
    name: "Field Kit",
    imageAssetId: "image.accessory.field-kit",
    description: "Restore 22 Health to every living member of your team.",
    effects: [{ kind: "heal", target: "allies", amount: 22 }],
  },
  {
    id: "accessory.ward-projector",
    name: "Ward Projector",
    imageAssetId: "image.accessory.ward-projector",
    description:
      "Give every living team member an 18-point shield for 6 seconds.",
    effects: [
      {
        kind: "shield",
        target: "allies",
        amount: 18,
        durationMs: 6_000,
      },
    ],
  },
  {
    id: "accessory.slot-jammer",
    name: "Slot Jammer",
    imageAssetId: "image.accessory.slot-jammer",
    description:
      "Block the opposing active Character's middle Move for 4 seconds.",
    effects: [
      {
        kind: "blockMove",
        target: "enemies",
        slotIndex: 1,
        durationMs: 4_000,
      },
    ],
  },
] satisfies AccessoryDefinition[];

export const actions = launchActions;
export const characters = launchCharacters;

export const quickFightDefaults = {
  playerIds: ["character.viking"],
  enemyIds: ["character.grim-reaper"],
  playerAccessoryId: "accessory.press-pass",
  enemyAccessoryId: "accessory.dead-air",
  seed: 3_844_240_869,
} as const;

export const combatContent: CombatContent = {
  actions: Object.fromEntries(actions.map((action) => [action.id, action])),
  characters: Object.fromEntries(
    characters.map((character) => [character.id, character]),
  ),
  accessories: Object.fromEntries(
    accessories.map((accessory) => [accessory.id, accessory]),
  ),
};

export const storyNodes = [
  {
    id: "story.first-run.00",
    index: "00",
    type: "dialogue",
    title: "Wrong Door",
    summary: "Six incompatible legends receive the same tournament invitation.",
    next: "story.first-run.01",
  },
  {
    id: "story.first-run.01",
    index: "01",
    type: "reward",
    title: "Axe First",
    summary: "The Viking joins your Lineup before reading the rules.",
    next: "story.first-run.02",
  },
  {
    id: "story.first-run.02",
    index: "02",
    type: "battle",
    title: "History Disagrees",
    summary: "Ned Kelly disputes the Viking's version of a fair opening match.",
    next: "story.first-run.03",
  },
  {
    id: "story.first-run.03",
    index: "03",
    type: "store",
    title: "Lost Property",
    summary: "Useful equipment from several incompatible centuries.",
    next: "story.first-run.04",
  },
  {
    id: "story.first-run.04",
    index: "04",
    type: "mission",
    title: "Side Quests Happened",
    summary: "The noticeboard is somehow already aware of the fight.",
    next: "story.first-run.05",
  },
  {
    id: "story.first-run.05",
    index: "05",
    type: "battle",
    title: "Open Source Backup",
    summary: "Bring a second character and learn how shared Charge works.",
    next: "story.first-run.06",
  },
  {
    id: "story.first-run.06",
    index: "06",
    type: "tournament",
    title: "The Wrong Door Cup",
    summary: "Three rounds. Six impossible entrants. One unexplained trophy.",
    next: "story.first-run.07",
  },
  {
    id: "story.first-run.07",
    index: "07",
    type: "ending",
    title: "This Explained Nothing",
    summary: "The first bracket closes without answering a single question.",
    next: null,
  },
] as const;

export const missions = [
  {
    id: "mission.fresh-ink",
    name: "Unexpected Company",
    description: "Own two distinct characters.",
    target: 2,
    rewardStamps: 90,
  },
  {
    id: "mission.invoice-denied",
    name: "History Settled",
    description: "Defeat Ned Kelly.",
    target: 1,
    rewardStamps: 120,
  },
  {
    id: "mission.print-it-personal",
    name: "Run It Back",
    description: "Win two Story fights.",
    target: 2,
    rewardStamps: 180,
  },
] as const;
