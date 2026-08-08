import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { BrandMark, colours, Grain } from "./design";

export const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: colours.deep,
        overflow: "hidden",
        padding: "132px 110px",
      }}
    >
      <BrandMark compact />
      <Interactive.Div
        name="Opening headline"
        style={{
          color: colours.chalk,
          fontFamily: "League Gothic",
          fontSize: 164,
          letterSpacing: 2,
          lineHeight: 0.9,
          marginTop: 105,
          opacity: interpolate(frame, [4, 16], [0, 1], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          textTransform: "uppercase",
          translate: interpolate(frame, [4, 16], ["0px 54px", "0px 0px"], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Pick a fight.
      </Interactive.Div>
      <Interactive.Div
        name="Opening support"
        style={{
          color: colours.acid,
          fontFamily: "Atkinson Hyperlegible",
          fontSize: 46,
          fontWeight: 700,
          lineHeight: 1.2,
          marginTop: 34,
          maxWidth: 1200,
          opacity: interpolate(frame, [18, 30], [0, 1], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Start a story. Build a ridiculous matchup. Or try to survive the cup.
      </Interactive.Div>
      <div
        style={{
          background: colours.tomato,
          height: 430,
          position: "absolute",
          right: -330,
          rotate: "32deg",
          top: -200,
          width: 800,
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};
