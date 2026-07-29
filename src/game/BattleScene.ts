import Phaser from "phaser";
import { presentationAssets, resolveImagePath } from "../assets/registry";
import { sideForInstance } from "../combat/rules";
import type { BattleEvent, BattleState, Side } from "../combat/types";
import { combatContent } from "../content/initial-content";

export class BattleScene extends Phaser.Scene {
  #snapshot: BattleState | null = null;
  #background?: Phaser.GameObjects.Image;
  #playerEcho?: Phaser.GameObjects.Image;
  #enemyEcho?: Phaser.GameObjects.Image;
  #playerArt?: Phaser.GameObjects.Image;
  #enemyArt?: Phaser.GameObjects.Image;
  #playerFallback?: Phaser.GameObjects.Container;
  #enemyFallback?: Phaser.GameObjects.Container;
  #idleFrame = 0;
  #reducedMotion = false;
  #snapshotArtSignature = "";
  #onReady: (scene: BattleScene) => void;

  constructor(onReady: (scene: BattleScene) => void) {
    super("battle");
    this.#onReady = onReady;
  }

  preload(): void {
    this.load.image("arena-bg", "/assets/generated/arena-bg.png");
    const idleIds = new Set(
      Object.values(combatContent.characters).flatMap(
        (character) => character.idleAssetIds,
      ),
    );
    const portraitIds = new Set(
      Object.values(combatContent.characters).map(
        (character) => character.portraitAssetId,
      ),
    );
    for (const id of new Set([...idleIds, ...portraitIds])) {
      this.load.image(id, resolveImagePath(id));
    }
    for (const presentation of Object.values(presentationAssets)) {
      if (presentation.path) {
        this.load.image(presentation.id, presentation.path);
      }
    }
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#111f46");
    this.#background = this.add.image(0, 0, "arena-bg").setOrigin(0.5);
    this.#playerEcho = this.add
      .image(0, 0, "image.mara-vex.idle.a")
      .setOrigin(0.5, 1)
      .setDepth(2)
      .setAlpha(0.22);
    this.#enemyEcho = this.add
      .image(0, 0, "image.knuckle-tax.idle.a")
      .setOrigin(0.5, 1)
      .setFlipX(true)
      .setDepth(2)
      .setAlpha(0.22);
    this.#playerArt = this.add
      .image(0, 0, "image.mara-vex.idle.a")
      .setOrigin(0.5, 1)
      .setDepth(4);
    this.#enemyArt = this.add
      .image(0, 0, "image.knuckle-tax.idle.a")
      .setOrigin(0.5, 1)
      .setFlipX(true)
      .setDepth(4);
    this.#playerFallback = this.createFallback("player");
    this.#enemyFallback = this.createFallback("enemy");
    this.scale.on("resize", () => this.layout());
    this.time.addEvent({
      delay: 620,
      loop: true,
      callback: () => {
        if (!this.#reducedMotion) {
          this.#idleFrame = this.#idleFrame === 0 ? 1 : 0;
          this.syncArt();
        }
      },
    });
    this.time.addEvent({
      delay: 2_200,
      loop: true,
      callback: () => this.pulsePrintLayers(),
    });
    this.layout();
    this.#onReady(this);
  }

  setReducedMotion(reduced: boolean): void {
    this.#reducedMotion = reduced;
    if (reduced) {
      this.#idleFrame = 0;
      this.syncArt();
    }
  }

  setSnapshot(snapshot: BattleState): void {
    this.#snapshot = snapshot;
    const player =
      snapshot.player.squad[snapshot.player.activeIndex]?.instanceId ?? "";
    const enemy =
      snapshot.enemy.squad[snapshot.enemy.activeIndex]?.instanceId ?? "";
    const signature = `${player}:${enemy}`;
    if (signature !== this.#snapshotArtSignature) {
      this.#snapshotArtSignature = signature;
      this.syncArt();
    }
  }

  setSimulationPaused(paused: boolean): void {
    if (paused) {
      this.scene.pause();
    } else {
      this.scene.resume();
    }
  }

  present(events: BattleEvent[]): void {
    for (const event of events) {
      if (event.type === "damageApplied") {
        this.presentDamage(event);
      }
      if (event.type === "actionStarted" && event.actionId) {
        this.presentCutIn(event.actionId, event.side ?? "player");
      }
      if (event.type === "characterSwitched") {
        this.syncArt();
      }
      if (event.type === "characterDefeated") {
        const art = event.side === "player" ? this.#playerArt : this.#enemyArt;
        if (art) {
          this.tweens.add({
            targets: art,
            angle: event.side === "player" ? -8 : 8,
            alpha: 0.45,
            duration: this.#reducedMotion ? 0 : 240,
          });
        }
      }
    }
  }

  private createFallback(side: Side): Phaser.GameObjects.Container {
    const color = side === "player" ? 0xef4d39 : 0xf2d742;
    const shape = this.add.rectangle(0, 0, 190, 250, color);
    const mark = this.add
      .star(0, -18, 8, 46, 86, 0x111f46)
      .setAngle(side === "player" ? -9 : 9);
    const name = this.add
      .text(0, 78, "UNPRINTED", {
        fontFamily: "sans-serif",
        fontSize: "22px",
        fontStyle: "bold",
        color: side === "player" ? "#f7f0dd" : "#111f46",
      })
      .setOrigin(0.5);
    return this.add.container(0, 0, [shape, mark, name]).setVisible(false);
  }

  private syncArt(): void {
    if (!this.#snapshot || !this.#playerArt || !this.#enemyArt) {
      return;
    }
    const player =
      this.#snapshot.player.squad[this.#snapshot.player.activeIndex];
    const enemy = this.#snapshot.enemy.squad[this.#snapshot.enemy.activeIndex];
    if (!player || !enemy) {
      return;
    }
    this.setCharacterArt(
      this.#playerArt,
      this.#playerFallback,
      player.characterId,
    );
    this.setCharacterArt(
      this.#enemyArt,
      this.#enemyFallback,
      enemy.characterId,
    );
    if (this.#playerEcho && this.#playerArt.visible) {
      this.#playerEcho
        .setTexture(this.#playerArt.texture.key)
        .setVisible(true)
        .setAlpha(0.22);
    } else {
      this.#playerEcho?.setVisible(false);
    }
    if (this.#enemyEcho && this.#enemyArt.visible) {
      this.#enemyEcho
        .setTexture(this.#enemyArt.texture.key)
        .setVisible(true)
        .setAlpha(0.22);
    } else {
      this.#enemyEcho?.setVisible(false);
    }
    this.layout();
  }

  private setCharacterArt(
    art: Phaser.GameObjects.Image,
    fallback: Phaser.GameObjects.Container | undefined,
    characterId: string,
  ): void {
    const character = combatContent.characters[characterId];
    const keys = character?.idleAssetIds;
    const textureKey = keys?.[this.#idleFrame] ?? keys?.[0];
    const resolvedTextureKey =
      textureKey && this.textures.exists(textureKey)
        ? textureKey
        : character?.portraitAssetId &&
            this.textures.exists(character.portraitAssetId)
          ? character.portraitAssetId
          : null;
    if (!resolvedTextureKey) {
      art.setVisible(false);
      fallback?.setVisible(true);
      const label = fallback?.getAt<Phaser.GameObjects.Text>(2);
      if (label) {
        label.setText(
          combatContent.characters[characterId]?.name ?? "UNPRINTED",
        );
      }
      return;
    }
    art.setTexture(resolvedTextureKey);
    art.setVisible(true).setAlpha(1).setAngle(0);
    fallback?.setVisible(false);
  }

  private layout(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    if (this.#background) {
      const texture = this.#background.texture.getSourceImage() as {
        width: number;
        height: number;
      };
      const cover = Math.max(width / texture.width, height / texture.height);
      this.#background
        .setPosition(width / 2, height / 2)
        .setScale(cover)
        .setAlpha(0.88);
    }

    const characterHeight = Math.min(height * 0.83, width * 0.38);
    const position = (side: Side): { x: number; y: number } => ({
      x: width * (side === "player" ? 0.28 : 0.72),
      y: height * 0.98,
    });
    for (const [side, art, fallback] of [
      ["player", this.#playerArt, this.#playerFallback],
      ["enemy", this.#enemyArt, this.#enemyFallback],
    ] as const) {
      const point = position(side);
      if (art) {
        const source = art.texture.getSourceImage() as {
          width: number;
          height: number;
        };
        art
          .setPosition(point.x, point.y)
          .setScale(characterHeight / source.height);
      }
      fallback?.setPosition(point.x, point.y - characterHeight * 0.42);
    }
    for (const [side, echo] of [
      ["player", this.#playerEcho],
      ["enemy", this.#enemyEcho],
    ] as const) {
      if (!echo?.visible) {
        continue;
      }
      const source = echo.texture.getSourceImage() as {
        width: number;
        height: number;
      };
      echo
        .setPosition(width * (side === "player" ? 0.16 : 0.84), height * 1.08)
        .setScale((characterHeight * 1.36) / source.height)
        .setAngle(side === "player" ? -7 : 7);
    }
  }

  private pulsePrintLayers(): void {
    if (this.#reducedMotion) {
      return;
    }
    for (const [side, echo] of [
      ["player", this.#playerEcho],
      ["enemy", this.#enemyEcho],
    ] as const) {
      if (!echo?.visible) {
        continue;
      }
      const originX = echo.x;
      this.tweens.add({
        targets: echo,
        x: originX + (side === "player" ? 22 : -22),
        alpha: 0.32,
        scaleX: echo.scaleX * 1.035,
        scaleY: echo.scaleY * 1.035,
        duration: 420,
        ease: "Expo.easeOut",
        hold: 170,
        yoyo: true,
      });
    }
  }

  private presentDamage(event: BattleEvent): void {
    const targetIsPlayer =
      this.#snapshot &&
      sideForInstance(this.#snapshot, event.targetId) === "player";
    const art = targetIsPlayer ? this.#playerArt : this.#enemyArt;
    const fallback = targetIsPlayer
      ? this.#playerFallback
      : this.#enemyFallback;
    const target = art?.visible ? art : fallback;
    if (!target) {
      return;
    }
    const amount = this.add
      .text(
        target.x,
        target.y - target.displayHeight * 0.7,
        `-${event.amount ?? 0}`,
        {
          fontFamily: "sans-serif",
          fontSize: `${Math.max(28, this.scale.width * 0.032)}px`,
          fontStyle: "bold",
          color: "#f2d742",
          stroke: "#111f46",
          strokeThickness: 8,
        },
      )
      .setOrigin(0.5)
      .setDepth(20);
    if (this.#reducedMotion) {
      this.time.delayedCall(420, () => amount.destroy());
      return;
    }
    this.cameras.main.shake(90, 0.006);
    this.cameras.main.flash(70, 247, 240, 221, false);
    this.tweens.add({
      targets: target,
      x: target.x + (targetIsPlayer ? -18 : 18),
      yoyo: true,
      duration: 70,
      ease: "Quad.easeOut",
    });
    this.tweens.add({
      targets: amount,
      y: amount.y - 70,
      alpha: 0,
      duration: 620,
      ease: "Cubic.easeOut",
      onComplete: () => amount.destroy(),
    });
  }

  private presentCutIn(actionId: string, side: Side): void {
    const key = combatContent.actions[actionId]?.presentationId;
    if (!key || side !== "player" || !this.textures.exists(key)) {
      return;
    }
    const width = this.scale.width;
    const height = this.scale.height;
    const cutIn = this.add
      .image(width / 2, height / 2, key)
      .setDepth(15)
      .setDisplaySize(width, height)
      .setAlpha(0.96);
    if (this.#reducedMotion) {
      this.time.delayedCall(220, () => cutIn.destroy());
      return;
    }
    cutIn.setX(-width * 0.55);
    this.tweens.add({
      targets: cutIn,
      x: width / 2,
      duration: 150,
      ease: "Expo.easeOut",
      hold: 160,
      yoyo: true,
      onComplete: () => cutIn.destroy(),
    });
  }
}
