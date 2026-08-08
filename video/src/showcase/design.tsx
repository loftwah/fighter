import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

export const colours = {
  acid: "#f2d742",
  chalk: "#f7f0dd",
  deep: "#091128",
  green: "#8eef5d",
  ink: "#14151a",
  tomato: "#ef4d39",
};

export const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage:
        "radial-gradient(circle at 20% 30%, rgba(247,240,221,.12) 0 1px, transparent 1.5px), radial-gradient(circle at 80% 65%, rgba(9,17,40,.2) 0 1px, transparent 1.5px)",
      backgroundSize: "7px 7px, 11px 11px",
      mixBlendMode: "soft-light",
      opacity: 0.38,
      pointerEvents: "none",
    }}
  />
);

export const BrandMark: React.FC<{ readonly compact?: boolean }> = ({
  compact,
}) => (
  <Interactive.Div
    name="LOFTWAH FIGHTER mark"
    style={{
      alignItems: "stretch",
      display: "flex",
      filter: "drop-shadow(8px 8px 0 rgba(9,17,40,.55))",
      height: compact ? 66 : 184,
      rotate: "-2deg",
    }}
  >
    <div
      style={{
        alignItems: "center",
        background: colours.acid,
        color: colours.ink,
        display: "flex",
        fontFamily: "Atkinson Hyperlegible",
        fontSize: compact ? 17 : 29,
        fontWeight: 700,
        justifyContent: "center",
        letterSpacing: compact ? 2.2 : 4.2,
        padding: compact ? "0 17px" : "0 26px",
        writingMode: compact ? "horizontal-tb" : "vertical-rl",
      }}
    >
      LOFTWAH
    </div>
    <div
      style={{
        alignItems: "center",
        background: colours.tomato,
        color: colours.chalk,
        display: "flex",
        fontFamily: "League Gothic",
        fontSize: compact ? 49 : 154,
        letterSpacing: compact ? 2 : 6,
        lineHeight: 0.8,
        padding: compact ? "7px 18px 3px" : "20px 39px 7px",
        textTransform: "uppercase",
      }}
    >
      Fighter
    </div>
  </Interactive.Div>
);

export const ModeCard: React.FC<{
  readonly accent: string;
  readonly eyebrow: string;
  readonly heading: string;
}> = ({ accent, eyebrow, heading }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        background: colours.deep,
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Interactive.Div
        name={`${eyebrow} chapter card`}
        style={{
          marginLeft: 40,
          opacity: interpolate(frame, [0, 8], [0, 1], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [0, 10], ["0px 48px", "0px 0px"], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          width: 1500,
        }}
      >
        <div
          style={{
            color: accent,
            fontFamily: "Atkinson Hyperlegible",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 5,
            marginBottom: 18,
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            color: colours.chalk,
            fontFamily: "League Gothic",
            fontSize: 128,
            letterSpacing: 2,
            lineHeight: 0.92,
            textTransform: "uppercase",
          }}
        >
          {heading}
        </div>
      </Interactive.Div>
      <div
        style={{
          background: accent,
          bottom: 0,
          height: 18,
          left: 0,
          position: "absolute",
          width: "100%",
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};

export const CleanFootage: React.FC<{
  readonly durationInFrames: number;
  readonly sourceStartFrame: number;
}> = ({ durationInFrames, sourceStartFrame }) => (
  <AbsoluteFill style={{ background: colours.deep, overflow: "hidden" }}>
    <Video
      name="Authentic game capture"
      muted
      src={staticFile("generated/gameplay.mp4")}
      trimBefore={sourceStartFrame}
      trimAfter={sourceStartFrame + durationInFrames}
      style={{ height: "100%", width: "100%" }}
    />
  </AbsoluteFill>
);

export const BandedFootage: React.FC<{
  readonly accent: string;
  readonly durationInFrames: number;
  readonly label: string;
  readonly sourceStartFrame: number;
}> = ({ accent, durationInFrames, label, sourceStartFrame }) => (
  <AbsoluteFill style={{ background: colours.deep, overflow: "hidden" }}>
    <Video
      name={`${label} game capture`}
      muted
      src={staticFile("generated/gameplay.mp4")}
      trimBefore={sourceStartFrame}
      trimAfter={sourceStartFrame + durationInFrames}
      style={{
        height: 1004,
        left: 68,
        position: "absolute",
        top: 0,
        width: 1785,
      }}
    />
    <div
      style={{
        background: colours.deep,
        borderLeft: `12px solid ${accent}`,
        bottom: 0,
        color: colours.chalk,
        display: "flex",
        fontFamily: "Atkinson Hyperlegible",
        fontSize: 38,
        fontWeight: 700,
        height: 76,
        left: 0,
        letterSpacing: 0.3,
        padding: "14px 64px",
        position: "absolute",
        width: "100%",
      }}
    >
      {label}
    </div>
  </AbsoluteFill>
);
