export interface StoryPanelContent {
  title: string;
  copy: string;
  speaker: string;
  line: string;
  action: string;
}

export const firstRunStoryPanels: Record<string, StoryPanelContent> = {
  "story.first-run.00": {
    title: "The ink is wet. The bill is due.",
    copy: "The Ledger has arrived to confiscate every unofficial Relic in the shop. Mara Vex has one reply and three increasingly expensive ways to print it.",
    speaker: "MARA",
    line: "Tell Knuckle Tax I kept the receipt. It says no refunds.",
    action: "Start First Run",
  },
  "story.first-run.01": {
    title: "Shelf space is a legal argument.",
    copy: "Mara Vex is off the display card and in your Lineup. The Ledger would prefer you called that evidence.",
    speaker: "MARA",
    line: "If they wanted it mint, they should have left it wrapped.",
    action: "Face the invoice",
  },
  "story.first-run.02": {
    title: "An invoice with fists.",
    copy: "Knuckle Tax is blocking the front door with a three-print collection notice. Your Charge Strip belongs to the whole Lineup—switch without losing it.",
    speaker: "KNUCKLE TAX",
    line: "Unofficial stock. Official consequences.",
    action: "Set the Tax Due Lineup",
  },
  "story.first-run.03": {
    title: "The backroom counter opens.",
    copy: "Winning bought breathing room and access to rotating Relics and reusable Patches. Browsing is free. The labels are not.",
    speaker: "MARA",
    line: "Nothing says legitimate like a price written by hand.",
    action: "Enter Backroom Counter",
  },
  "story.first-run.04": {
    title: "Read the fine print.",
    copy: "Three mission slips have appeared on the wall. Their rewards count whether the story likes your methods or not.",
    speaker: "ZIPWIRE",
    line: "I read all three. That felt more dangerous than fighting.",
    action: "Open the mission board",
  },
  "story.first-run.05": {
    title: "Two prints enter the qualifier.",
    copy: "The qualifier checks whether you can share Charge and switch cleanly. Zipwire is available as a story loan if you have not bought a copy.",
    speaker: "MARA",
    line: "Try not to make the teamwork look deliberate.",
    action: "Set the Qualifier Lineup",
  },
  "story.first-run.06": {
    title: "Cheap seats. Expensive mistakes.",
    copy: "The qualifier stamp is dry. The three-round Cup is the next print on the board.",
    speaker: "KNUCKLE TAX",
    line: "The bracket has already billed you for losing.",
    action: "Enter the Cheap Seats Cup",
  },
  "story.first-run.07": {
    title: "Officially unofficial.",
    copy: "The first print run survives. Stamp the ending panel to archive the run and reveal the rival file.",
    speaker: "MARA",
    line: "Put that on the invoice.",
    action: "Claim the ending print",
  },
};

const fallbackStoryPanel: StoryPanelContent = {
  title: "The ink is wet. The bill is due.",
  copy: "The Ledger has arrived to confiscate every unofficial Relic in the shop.",
  speaker: "MARA",
  line: "Tell Knuckle Tax I kept the receipt.",
  action: "Continue First Run",
};

export function firstRunStoryPanel(nodeId: string): StoryPanelContent {
  return firstRunStoryPanels[nodeId] ?? fallbackStoryPanel;
}
