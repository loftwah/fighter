import { Sequence } from "remotion";
import { captureTimeline } from "./capture-timeline";
import { CleanFootage, colours, ModeCard } from "./design";

export const TournamentCard: React.FC = () => (
  <ModeCard
    accent={colours.acid}
    eyebrow="Tournament"
    heading="Or try the cup."
  />
);

export const TournamentScene: React.FC = () => (
  <>
    <Sequence durationInFrames={60} name="Choose the Cup">
      <CleanFootage {...captureTimeline.tournamentChoice} />
    </Sequence>
    <Sequence from={60} durationInFrames={60} name="Browse the Roster">
      <CleanFootage {...captureTimeline.tournamentRoster} />
    </Sequence>
    <Sequence from={120} durationInFrames={60} name="Build the Roster">
      <CleanFootage {...captureTimeline.tournamentBuild} />
    </Sequence>
    <Sequence from={180} durationInFrames={60} name="Set the run rules">
      <CleanFootage {...captureTimeline.tournamentSettings} />
    </Sequence>
    <Sequence from={240} durationInFrames={60} name="Prepare the Lineup">
      <CleanFootage {...captureTimeline.tournamentDeployment} />
    </Sequence>
  </>
);
