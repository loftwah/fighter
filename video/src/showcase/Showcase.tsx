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

export const SHOWCASE_FRAMES = 1505;

const ShowcaseSoundtrack: React.FC = () => (
  <>
    <Sequence from={90} durationInFrames={815} name="Main theme">
      <Audio
        loop
        src={staticFile("generated/main.mp3")}
        volume={(frame) =>
          interpolate(frame, [0, 18, 780, 815], [0, 0.7, 0.7, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </Sequence>
    <Sequence from={870} durationInFrames={635} name="Battle music">
      <Audio
        loop
        src={staticFile("generated/battle.mp3")}
        volume={(frame) =>
          interpolate(frame, [0, 35, 600, 635], [0, 0.8, 0.8, 0], {
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
    <Sequence durationInFrames={90} name="Opening">
      <OpeningScene />
    </Sequence>
    <Sequence from={90} durationInFrames={75} name="Choose a game">
      <MenuScene />
    </Sequence>
    <Sequence from={165} durationInFrames={35} name="Story chapter">
      <StoryCard />
    </Sequence>
    <Sequence from={200} durationInFrames={120} name="Story gameplay">
      <StoryScene />
    </Sequence>
    <Sequence from={320} durationInFrames={35} name="Tournament chapter">
      <TournamentCard />
    </Sequence>
    <Sequence from={355} durationInFrames={300} name="Tournament gameplay">
      <TournamentScene />
    </Sequence>
    <Sequence from={655} durationInFrames={35} name="Quick Fight chapter">
      <SetupCard />
    </Sequence>
    <Sequence from={690} durationInFrames={180} name="Quick Fight setup">
      <SetupScene />
    </Sequence>
    <Sequence from={870} durationInFrames={35} name="Battle chapter">
      <BattleCard />
    </Sequence>
    <Sequence from={905} durationInFrames={240} name="Opening battle">
      <OpeningBattleScene />
    </Sequence>
    <Sequence from={1145} durationInFrames={150} name="Closing battle">
      <ClosingBattleScene />
    </Sequence>
    <Sequence from={1295} durationInFrames={105} name="Result">
      <ResultScene />
    </Sequence>
    <Sequence from={1400} durationInFrames={105} name="End card">
      <EndScene />
    </Sequence>
    <ShowcaseSoundtrack />
  </AbsoluteFill>
);
