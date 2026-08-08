import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Showcase, SHOWCASE_FRAMES } from "./showcase/Showcase";

const FPS = 30;
const VIDEO_FRAMES = 990;

const palette = {
  acid: "#f2d742",
  chalk: "#f7f0dd",
  deep: "#091128",
  green: "#8eef5d",
  indigo: "#111f46",
  ink: "#14151a",
  tomato: "#ef4d39",
};

type ClipProps = {
  readonly accent: string;
  readonly durationInFrames: number;
  readonly eyebrow: string;
  readonly label: string;
  readonly sourceStartSeconds: number;
};

const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage:
        "radial-gradient(circle at 20% 30%, rgba(247,240,221,.14) 0 1px, transparent 1.5px), radial-gradient(circle at 80% 65%, rgba(9,17,40,.16) 0 1px, transparent 1.5px)",
      backgroundSize: "7px 7px, 11px 11px",
      mixBlendMode: "soft-light",
      opacity: 0.42,
      pointerEvents: "none",
    }}
  />
);

const GameMark: React.FC<{ readonly compact?: boolean }> = ({ compact }) => (
  <div
    style={{
      alignItems: "stretch",
      display: "flex",
      filter: "drop-shadow(8px 8px 0 rgba(9,17,40,.55))",
      height: compact ? 58 : 206,
      transform: "skewX(-3deg)",
    }}
  >
    <div
      style={{
        alignItems: "center",
        background: palette.acid,
        color: palette.ink,
        display: "flex",
        fontFamily: "Atkinson Hyperlegible",
        fontSize: compact ? 16 : 31,
        fontWeight: 700,
        justifyContent: "center",
        letterSpacing: compact ? 2.3 : 4.5,
        padding: compact ? "0 15px" : "0 27px",
        textOrientation: "mixed",
        writingMode: compact ? "horizontal-tb" : "vertical-rl",
      }}
    >
      LOFTWAH
    </div>
    <div
      style={{
        alignItems: "center",
        background: palette.tomato,
        color: palette.chalk,
        display: "flex",
        fontFamily: "League Gothic",
        fontSize: compact ? 43 : 174,
        letterSpacing: compact ? 2 : 6,
        lineHeight: 0.75,
        padding: compact ? "7px 17px 3px" : "21px 41px 7px",
        textTransform: "uppercase",
      }}
    >
      Fighter
    </div>
  </div>
);

const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = interpolate(frame, [0, 80], [1.05, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateRight: "clamp",
  });
  const titleIn = spring({ fps, frame: frame - 14, config: { damping: 17 } });
  const proofIn = spring({ fps, frame: frame - 60, config: { damping: 16 } });

  return (
    <AbsoluteFill style={{ background: palette.deep, overflow: "hidden" }}>
      <Video
        muted
        objectFit="cover"
        src={staticFile("generated/gameplay.mp4")}
        trimBefore={0}
        trimAfter={105}
        style={{
          height: "100%",
          opacity: 0.66,
          transform: `scale(${scale})`,
          width: "100%",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(9,17,40,.97) 0%, rgba(9,17,40,.74) 44%, rgba(9,17,40,.18) 100%)",
        }}
      />
      <div
        style={{
          left: 90,
          position: "absolute",
          top: 188,
          transform: `translateY(${(1 - titleIn) * 90}px)`,
        }}
      >
        <GameMark />
      </div>
      <div
        style={{
          background: palette.chalk,
          bottom: 92,
          color: palette.ink,
          fontFamily: "Atkinson Hyperlegible",
          fontSize: 25,
          fontWeight: 700,
          left: 94,
          letterSpacing: 3.5,
          opacity: proofIn,
          padding: "14px 22px 11px",
          position: "absolute",
          textTransform: "uppercase",
          transform: `translateX(${(1 - proofIn) * -60}px) rotate(-1deg)`,
        }}
      >
        Real gameplay · work in progress
      </div>
      <Grain />
    </AbsoluteFill>
  );
};

const GameplayClip: React.FC<ClipProps> = ({
  accent,
  durationInFrames,
  eyebrow,
  label,
  sourceStartSeconds,
}) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 8], [1, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });
  const labelIn = spring({
    fps: FPS,
    frame: frame - 4,
    config: { damping: 18 },
  });
  const sourceStart = Math.round(sourceStartSeconds * FPS);

  return (
    <AbsoluteFill style={{ background: palette.deep, overflow: "hidden" }}>
      <Video
        muted
        objectFit="cover"
        src={staticFile("generated/gameplay.mp4")}
        trimBefore={sourceStart}
        trimAfter={sourceStart + durationInFrames}
        style={{ height: "100%", width: "100%" }}
      />
      <div
        style={{
          background:
            "linear-gradient(90deg, rgba(9,17,40,.86), rgba(9,17,40,0))",
          bottom: 0,
          height: 260,
          left: 0,
          position: "absolute",
          width: 970,
        }}
      />
      <div
        style={{
          bottom: 58,
          left: 72,
          position: "absolute",
          transform: `translateX(${(1 - labelIn) * -90}px)`,
        }}
      >
        <div
          style={{
            background: accent,
            color: palette.ink,
            display: "inline-block",
            fontFamily: "Atkinson Hyperlegible",
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: 3.5,
            padding: "9px 15px 7px",
            textTransform: "uppercase",
            transform: "rotate(-1deg)",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            color: palette.chalk,
            fontFamily: "League Gothic",
            fontSize: 91,
            letterSpacing: 2,
            lineHeight: 0.9,
            marginTop: 13,
            textShadow: "6px 6px 0 #091128",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      </div>
      <div style={{ left: 60, position: "absolute", top: 50 }}>
        <GameMark compact />
      </div>
      <div
        style={{
          background: palette.deep,
          clipPath: "polygon(0 0, 100% 0, 86% 100%, 0 100%)",
          height: "100%",
          left: 0,
          position: "absolute",
          top: 0,
          transform: `translateX(${-102 * (1 - enter)}%)`,
          width: "56%",
        }}
      />
      <div
        style={{
          background: accent,
          height: "100%",
          left: 0,
          position: "absolute",
          top: 0,
          transform: `translateX(${-110 * (1 - enter)}%) skewX(-8deg)`,
          width: 34,
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const markIn = spring({ fps: FPS, frame, config: { damping: 17 } });
  const line = interpolate(frame, [18, 54], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        background: palette.deep,
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ transform: `scale(${0.86 + markIn * 0.14})` }}>
        <GameMark />
      </div>
      <div
        style={{
          background: palette.acid,
          bottom: 152,
          height: 8,
          left: "50%",
          position: "absolute",
          transform: `translateX(-50%) scaleX(${line})`,
          width: 540,
        }}
      />
      <div
        style={{
          bottom: 87,
          color: palette.chalk,
          fontFamily: "Atkinson Hyperlegible",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: 4,
          position: "absolute",
          textTransform: "uppercase",
        }}
      >
        Build your line-up. Own the fight.
      </div>
      <div
        style={{
          background: palette.indigo,
          height: 430,
          position: "absolute",
          right: -310,
          top: -170,
          transform: "rotate(34deg)",
          width: 760,
        }}
      />
      <div
        style={{
          background: palette.tomato,
          bottom: -260,
          height: 420,
          left: -270,
          position: "absolute",
          transform: "rotate(-18deg)",
          width: 780,
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};

const Soundtrack: React.FC = () => (
  <>
    <Sequence durationInFrames={120}>
      <Audio
        loop
        src={staticFile("generated/intro.mp3")}
        volume={(frame) =>
          interpolate(frame, [0, 20, 95, 120], [0, 0.7, 0.7, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </Sequence>
    <Sequence from={105} durationInFrames={180}>
      <Audio
        loop
        src={staticFile("generated/main.mp3")}
        volume={(frame) =>
          interpolate(frame, [0, 18, 155, 180], [0, 0.7, 0.7, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </Sequence>
    <Sequence from={270} durationInFrames={720}>
      <Audio
        loop
        src={staticFile("generated/battle.mp3")}
        volume={(frame) =>
          interpolate(frame, [0, 18, 670, 720], [0, 0.78, 0.78, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </Sequence>
  </>
);

const Trailer: React.FC = () => (
  <AbsoluteFill style={{ background: palette.deep }}>
    <Sequence durationInFrames={105}>
      <Opening />
    </Sequence>
    <Sequence from={105} durationInFrames={165}>
      <GameplayClip
        accent={palette.acid}
        durationInFrames={165}
        eyebrow="Quick Fight"
        label="Set the line-up"
        sourceStartSeconds={4}
      />
    </Sequence>
    <Sequence from={270} durationInFrames={120}>
      <GameplayClip
        accent={palette.tomato}
        durationInFrames={120}
        eyebrow="No filler"
        label="Straight to the fight"
        sourceStartSeconds={9.5}
      />
    </Sequence>
    <Sequence from={390} durationInFrames={90}>
      <GameplayClip
        accent={palette.green}
        durationInFrames={90}
        eyebrow="Charge it"
        label="Make your move"
        sourceStartSeconds={15.5}
      />
    </Sequence>
    <Sequence from={480} durationInFrames={75}>
      <GameplayClip
        accent={palette.acid}
        durationInFrames={75}
        eyebrow="Time it"
        label="Break their rhythm"
        sourceStartSeconds={19}
      />
    </Sequence>
    <Sequence from={555} durationInFrames={105}>
      <GameplayClip
        accent={palette.tomato}
        durationInFrames={105}
        eyebrow="Power up"
        label="Turn the pressure"
        sourceStartSeconds={27}
      />
    </Sequence>
    <Sequence from={660} durationInFrames={120}>
      <GameplayClip
        accent={palette.green}
        durationInFrames={120}
        eyebrow="Critical"
        label="Hit harder"
        sourceStartSeconds={41.3}
      />
    </Sequence>
    <Sequence from={780} durationInFrames={120}>
      <GameplayClip
        accent={palette.acid}
        durationInFrames={120}
        eyebrow="Victory"
        label="Own the result"
        sourceStartSeconds={45.5}
      />
    </Sequence>
    <Sequence from={900} durationInFrames={90}>
      <EndCard />
    </Sequence>
    <Soundtrack />
  </AbsoluteFill>
);

export const MyComposition: React.FC = () => (
  <>
    <Composition
      id="LoftwahFighterShowcase"
      component={Showcase}
      durationInFrames={SHOWCASE_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="LoftwahFighterTrailer"
      component={Trailer}
      durationInFrames={VIDEO_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
