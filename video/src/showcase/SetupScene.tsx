import { Sequence } from "remotion";
import { captureTimeline } from "./capture-timeline";
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
        label="Pick both sides."
        {...captureTimeline.fighterSelect}
      />
    </Sequence>
    <Sequence from={60} durationInFrames={60} name="Choose the pace">
      <BandedFootage
        accent={colours.acid}
        label="Make it easy. Or brutal."
        {...captureTimeline.fightSettings}
      />
    </Sequence>
    <Sequence from={120} durationInFrames={60} name="Review the matchup">
      <BandedFootage
        accent={colours.tomato}
        label="See exactly what you're starting."
        {...captureTimeline.reviewFight}
      />
    </Sequence>
  </>
);
