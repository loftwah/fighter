import type { Preferences } from "../persistence/save";

export type PauseKeyCommand = "pause" | "resume" | "toggle";

export interface PauseKeyInput {
  key: string;
  phase: "keydown" | "keyup";
  repeat: boolean;
  mode: Preferences["pauseKeyMode"];
  holdActive: boolean;
}

export function pauseKeyCommand(input: PauseKeyInput): PauseKeyCommand | null {
  if (input.key.toLowerCase() !== "p") {
    return null;
  }
  if (input.phase === "keyup") {
    return input.mode === "hold" && input.holdActive ? "resume" : null;
  }
  if (input.repeat) {
    return null;
  }
  if (input.mode === "toggle") {
    return "toggle";
  }
  return input.holdActive ? null : "pause";
}
