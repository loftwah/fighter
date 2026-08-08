import { CleanFootage, colours, ModeCard } from "./design";
import { captureTimeline } from "./capture-timeline";

export const BattleCard: React.FC = () => (
  <ModeCard
    accent={colours.tomato}
    eyebrow="The fight"
    heading="Then play it."
  />
);

export const OpeningBattleScene: React.FC = () => (
  <CleanFootage {...captureTimeline.openingBattle} />
);

export const ClosingBattleScene: React.FC = () => (
  <CleanFootage {...captureTimeline.closingBattle} />
);
