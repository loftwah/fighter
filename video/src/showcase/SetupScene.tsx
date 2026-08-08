import { Sequence } from "remotion";
import { BandedFootage, colours, ModeCard } from "./design";

export const SetupCard: React.FC = () => (
  <ModeCard
    accent={colours.green}
    eyebrow="Quick Fight"
    heading="Or build the whole fight yourself."
  />
);

export const SetupScene: React.FC = () => (
  <>
    <Sequence durationInFrames={60} name="Pick both sides">
      <BandedFootage
        accent={colours.green}
        durationInFrames={60}
        label="Pick both sides."
        sourceStartFrame={600}
      />
    </Sequence>
    <Sequence from={60} durationInFrames={60} name="Choose the pace">
      <BandedFootage
        accent={colours.acid}
        durationInFrames={60}
        label="Make it easy. Or brutal."
        sourceStartFrame={673}
      />
    </Sequence>
    <Sequence from={120} durationInFrames={60} name="Review the matchup">
      <BandedFootage
        accent={colours.tomato}
        durationInFrames={60}
        label="See exactly what you're starting."
        sourceStartFrame={746}
      />
    </Sequence>
  </>
);
