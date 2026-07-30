import Phaser from "phaser";
import type { BattleState } from "../combat/types";
import { BattleScene } from "./BattleScene";

export function createBattleGame(
  parent: HTMLElement,
  initialSnapshot: BattleState,
  onReady: (scene: BattleScene) => void,
): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#111f46",
    transparent: false,
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: "100%",
      height: "100%",
    },
    audio: {
      noAudio: true,
    },
    scene: [new BattleScene(onReady, initialSnapshot)],
  });
}
