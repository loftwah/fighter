import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { BrandMark, colours, Grain } from "./design";

export const EndScene: React.FC = () => {
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
        name="End mark"
        style={{
          opacity: interpolate(frame, [0, 12], [0, 1], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, 12], [0.92, 1], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
        }}
      >
        <BrandMark />
      </Interactive.Div>
      <Interactive.Div
        name="End domain"
        style={{
          bottom: 126,
          color: colours.acid,
          fontFamily: "Atkinson Hyperlegible",
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: 1.8,
          position: "absolute",
        }}
      >
        fighter.loftwah.com
      </Interactive.Div>
      <Interactive.Div
        style={{
          bottom: 78,
          color: colours.chalk,
          fontFamily: "Atkinson Hyperlegible",
          fontSize: 25,
          fontWeight: 700,
          letterSpacing: 2.4,
          position: "absolute",
          textTransform: "uppercase",
        }}
      >
        Story · Quick Fight · Tournament · Work in progress
      </Interactive.Div>
      <Grain />
    </AbsoluteFill>
  );
};
