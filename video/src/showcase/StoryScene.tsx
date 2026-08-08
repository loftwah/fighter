import { CleanFootage, colours, ModeCard } from "./design";
import { captureTimeline } from "./capture-timeline";

export const StoryCard: React.FC = () => (
  <ModeCard
    accent={colours.tomato}
    eyebrow="Story Mode"
    heading="Start with the story."
  />
);

export const StoryScene: React.FC = () => (
  <CleanFootage {...captureTimeline.story} />
);
