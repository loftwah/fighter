import { CleanFootage } from "./design";
import { captureTimeline } from "./capture-timeline";

export const MenuScene: React.FC = () => (
  <CleanFootage {...captureTimeline.menu} />
);
