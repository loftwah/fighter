import { CleanFootage, colours, ModeCard } from "./design";

export const BattleCard: React.FC = () => (
  <ModeCard
    accent={colours.tomato}
    eyebrow="The fight"
    heading="Then play it."
  />
);

export const OpeningBattleScene: React.FC = () => (
  <CleanFootage durationInFrames={240} sourceStartFrame={943} />
);

export const ClosingBattleScene: React.FC = () => (
  <CleanFootage durationInFrames={150} sourceStartFrame={1260} />
);
