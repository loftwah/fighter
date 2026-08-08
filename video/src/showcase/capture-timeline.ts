export const CAPTURE_FPS = 30;

export const captureTimeline = {
  menu: {
    chapter: "mainMenu",
    durationInFrames: 75,
    sourceStartFrame: 90,
  },
  story: {
    chapter: "story",
    durationInFrames: 120,
    sourceStartFrame: 184,
  },
  tournamentChoice: {
    chapter: "tournamentChoice",
    durationInFrames: 60,
    sourceStartFrame: 366,
  },
  tournamentRoster: {
    chapter: "tournamentRoster",
    durationInFrames: 60,
    sourceStartFrame: 439,
  },
  tournamentBuild: {
    chapter: "tournamentBuild",
    durationInFrames: 60,
    sourceStartFrame: 495,
  },
  tournamentSettings: {
    chapter: "tournamentSettings",
    durationInFrames: 60,
    sourceStartFrame: 556,
  },
  tournamentDeployment: {
    chapter: "tournamentDeployment",
    durationInFrames: 60,
    sourceStartFrame: 624,
  },
  fighterSelect: {
    chapter: "fighterSelect",
    durationInFrames: 60,
    sourceStartFrame: 740,
  },
  fightSettings: {
    chapter: "fightSettings",
    durationInFrames: 60,
    sourceStartFrame: 812,
  },
  reviewFight: {
    chapter: "reviewFight",
    durationInFrames: 60,
    sourceStartFrame: 886,
  },
  openingBattle: {
    chapter: "battle",
    durationInFrames: 240,
    sourceStartFrame: 1080,
  },
  closingBattle: {
    durationInFrames: 150,
    sourceStartFrame: 1450,
  },
  result: {
    chapter: "result",
    durationInFrames: 105,
    sourceStartFrame: 1943,
  },
} as const;

export const requiredCaptureFrames = Math.max(
  ...Object.values(captureTimeline).map(
    ({ durationInFrames, sourceStartFrame }) =>
      sourceStartFrame + durationInFrames,
  ),
);
