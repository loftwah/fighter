import { CleanFootage, colours, ModeCard } from "./design";

export const TournamentCard: React.FC = () => (
  <ModeCard
    accent={colours.acid}
    eyebrow="Tournament"
    heading="Or try the cup."
  />
);

export const TournamentScene: React.FC = () => (
  <CleanFootage durationInFrames={165} sourceStartFrame={368} />
);
