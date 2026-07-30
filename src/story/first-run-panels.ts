export interface StoryPanelContent {
  title: string;
  copy: string;
  speaker: string;
  line: string;
  action: string;
}

export const firstRunStoryPanels: Record<string, StoryPanelContent> = {
  "story.first-run.00": {
    title: "Everyone received the same invitation.",
    copy: "A Viking, an outlaw, a penguin, an egg, a prophet and Death itself have arrived at the wrong arena. Nobody wants to admit they might be in the correct place.",
    speaker: "VIKING",
    line: "The tiny bird says this is a tournament. I choose to believe him.",
    action: "Start First Run",
  },
  "story.first-run.01": {
    title: "The Viking skipped registration.",
    copy: "The Viking joins your Lineup before anyone explains Types, Traits, liability or indoor axe rules.",
    speaker: "VIKING",
    line: "If the rules mattered, they would be written on a shield.",
    action: "Enter the opening match",
  },
  "story.first-run.02": {
    title: "History has entered the chat.",
    copy: "Ned Kelly objects to the Viking's definition of an outlaw. Shared Charge belongs to the whole Lineup, so switching will not waste it.",
    speaker: "NED KELLY",
    line: "That helmet is historically inaccurate. Mine is merely inconvenient.",
    action: "Set the History Disagrees Lineup",
  },
  "story.first-run.03": {
    title: "Lost Property is open.",
    copy: "Winning unlocks a counter full of equipment from incompatible eras. Nobody remembers bringing any of it.",
    speaker: "TUX",
    line: "The inventory format is open. The padlock is decorative.",
    action: "Browse Lost Property",
  },
  "story.first-run.04": {
    title: "The noticeboard knows too much.",
    copy: "Three mission slips have appeared. Their rewards count whether the bracket makes sense or not.",
    speaker: "HUMPTY",
    line: "I have reviewed the wall-related objective and reject its assumptions.",
    action: "Open the mission board",
  },
  "story.first-run.05": {
    title: "Open source means backup.",
    copy: "The next match teaches Trait combinations, switching and shared Charge. Tux and Humpty activate Icon against a Mythic pairing.",
    speaker: "TUX",
    line: "Two contributors. One Strip. Fork responsibly.",
    action: "Set the Open Source Backup Lineup",
  },
  "story.first-run.06": {
    title: "The Wrong Door Cup.",
    copy: "Three rounds remain between this group and a trophy that may have been delivered to the wrong universe.",
    speaker: "GRIM REAPER",
    line: "I was promised a final. The wording was misleading.",
    action: "Enter the Wrong Door Cup",
  },
  "story.first-run.07": {
    title: "This explained nothing.",
    copy: "The first impossible bracket closes. Archive the run and reveal Ned Kelly's rival file.",
    speaker: "VIKING",
    line: "A successful saga traditionally answers fewer questions.",
    action: "Claim the ending",
  },
};

const fallbackStoryPanel: StoryPanelContent = {
  title: "Everyone received the same invitation.",
  copy: "Six incompatible characters have arrived at the wrong arena.",
  speaker: "VIKING",
  line: "Excellent. Nobody knows more than I do.",
  action: "Continue First Run",
};

export function firstRunStoryPanel(nodeId: string): StoryPanelContent {
  return firstRunStoryPanels[nodeId] ?? fallbackStoryPanel;
}
