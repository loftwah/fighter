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
        name="End line"
        style={{
          bottom: 112,
          color: colours.chalk,
          fontFamily: "Atkinson Hyperlegible",
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: 2.8,
          position: "absolute",
          textTransform: "uppercase",
        }}
      >
        Story · Quick Fight · Tournament · Work in progress
      </Interactive.Div>
      <div
        style={{
          background: colours.acid,
          bottom: 82,
          height: 8,
          position: "absolute",
          width: 690,
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};
