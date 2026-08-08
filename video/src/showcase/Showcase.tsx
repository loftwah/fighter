import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import {
  BattleCard,
  ClosingBattleScene,
  OpeningBattleScene,
} from "./BattleScene";
import { colours } from "./design";
import { EndScene } from "./EndScene";
import { MenuScene } from "./MenuScene";
import { OpeningScene } from "./OpeningScene";
import { ResultScene } from "./ResultScene";
import { SetupCard, SetupScene } from "./SetupScene";
import { StoryCard, StoryScene } from "./StoryScene";
import { TournamentCard, TournamentScene } from "./TournamentScene";

export const SHOWCASE_FRAMES = 1315;

const ShowcaseSoundtrack: React.FC = () => (
  <>
    <Sequence durationInFrames={100} name="Opening music">
      <Audio
        loop
        src={staticFile("generated/intro.mp3")}
        volume={(frame) =>
          interpolate(frame, [0, 16, 78, 100], [0, 0.68, 0.68, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </Sequence>
    <Sequence from={75} durationInFrames={720} name="Menu and setup music">
      <Audio
        loop
        src={staticFile("generated/main.mp3")}
        volume={(frame) =>
          interpolate(frame, [0, 18, 690, 720], [0, 0.7, 0.7, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </Sequence>
    <Sequence from={745} durationInFrames={570} name="Battle music">
      <Audio
        loop
        src={staticFile("generated/battle.mp3")}
        volume={(frame) =>
          interpolate(frame, [0, 18, 535, 570], [0, 0.8, 0.8, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </Sequence>
  </>
);

export const Showcase: React.FC = () => (
  <AbsoluteFill style={{ background: colours.deep }}>
    <Sequence durationInFrames={75} name="Opening">
      <OpeningScene />
    </Sequence>
    <Sequence from={75} durationInFrames={75} name="Choose a game">
      <MenuScene />
    </Sequence>
    <Sequence from={150} durationInFrames={35} name="Story chapter">
      <StoryCard />
    </Sequence>
    <Sequence from={185} durationInFrames={105} name="Story gameplay">
      <StoryScene />
    </Sequence>
    <Sequence from={290} durationInFrames={35} name="Tournament chapter">
      <TournamentCard />
    </Sequence>
    <Sequence from={325} durationInFrames={165} name="Tournament gameplay">
      <TournamentScene />
    </Sequence>
    <Sequence from={490} durationInFrames={35} name="Quick Fight chapter">
      <SetupCard />
    </Sequence>
    <Sequence from={525} durationInFrames={180} name="Quick Fight setup">
      <SetupScene />
    </Sequence>
    <Sequence from={705} durationInFrames={35} name="Battle chapter">
      <BattleCard />
    </Sequence>
    <Sequence from={740} durationInFrames={240} name="Opening battle">
      <OpeningBattleScene />
    </Sequence>
    <Sequence from={980} durationInFrames={150} name="Closing battle">
      <ClosingBattleScene />
    </Sequence>
    <Sequence from={1130} durationInFrames={105} name="Result">
      <ResultScene />
    </Sequence>
    <Sequence from={1235} durationInFrames={80} name="End card">
      <EndScene />
    </Sequence>
    <ShowcaseSoundtrack />
  </AbsoluteFill>
);
