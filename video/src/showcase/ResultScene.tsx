import { CleanFootage } from "./design";
import { captureTimeline } from "./capture-timeline";

export const ResultScene: React.FC = () => (
  <CleanFootage {...captureTimeline.result} />
);
