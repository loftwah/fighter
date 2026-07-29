import Phaser from "phaser";
import { BattleScene } from "./BattleScene";

export function createBattleGame(
  parent: HTMLElement,
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
      roundPixels: true,
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: "100%",
      height: "100%",
    },
    audio: {
      noAudio: true,
    },
    scene: [new BattleScene(onReady)],
  });
}
