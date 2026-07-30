import type { Difficulty } from "../../combat/types";
import { formatLabel } from "../format";

const difficultyDescriptions: Record<Difficulty, string> = {
  easy: "Easy — mostly here for the posters",
  normal: "Normal — attentive is enough",
  hard: "Hard — look at you, trying",
  brutal: "Brutal — fun apparently requires paperwork",
};

export function renderDifficultyOptions(
  selectedDifficulty: Difficulty,
  compact = false,
): string {
  return (["easy", "normal", "hard", "brutal"] as const)
    .map(
      (difficulty) =>
        `<option value="${difficulty}" ${
          selectedDifficulty === difficulty ? "selected" : ""
        }>${
          compact ? formatLabel(difficulty) : difficultyDescriptions[difficulty]
        }</option>`,
    )
    .join("");
}
