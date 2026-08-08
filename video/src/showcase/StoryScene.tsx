import { CleanFootage, colours, ModeCard } from "./design";

export const StoryCard: React.FC = () => (
  <ModeCard
    accent={colours.tomato}
    eyebrow="Story Mode"
    heading="Start with the story."
  />
);

export const StoryScene: React.FC = () => (
  <CleanFootage durationInFrames={105} sourceStartFrame={184} />
);
