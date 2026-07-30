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

  present(events: BattleEvent[], durationMs = 0): void {
    const types = new Set(events.map((event) => event.type));
    const started = events.find(
      (event) => event.type === "actionStarted" && event.actionId,
    );
    const resolved = types.has("actionCharged");
    const actionSide =
      started?.side ?? events.find((event) => event.side)?.side;
    let impactDelay = 0;

    if (started?.actionId) {
      this.presentCutIn(started.actionId, started.side ?? "player");
      impactDelay = resolved ? 330 : 0;
      if (resolved) {
        this.presentLunge(started.side ?? "player", 250);
      }
    } else if (resolved && actionSide) {
      this.presentLunge(actionSide, 80);
      impactDelay = 190;
    }

    let damageIndex = 0;
    for (const event of events) {
      if (event.type === "damageApplied") {
        this.presentDamage(event, impactDelay + damageIndex * 105);
        damageIndex += 1;
      }
      if (event.type === "healingApplied") {
        this.presentFloat(
          event,
          `+${event.amount ?? 0}`,
          "#8de1ff",
          impactDelay,
        );
      }
      if (event.type === "characterDodged") {
        this.presentDodge(event, impactDelay);
      }
      if (event.type === "criticalHit") {
        this.presentImpactWord("CRITICAL!", "#f2d742", impactDelay);
      }
      if (event.type === "actionInterrupted") {
        this.presentImpactWord("INTERRUPTED!", "#ef4d39", impactDelay);
      }
      if (event.type === "interruptionResisted") {
        this.presentImpactWord("NO FLINCH!", "#8de1ff", impactDelay);
      }
      if (event.type === "statusApplied" && event.message === "stun") {
        this.presentImpactWord("STUNNED!", "#f2d742", impactDelay + 80);
      }
      if (event.type === "characterSwitched") {
        this.syncArt();
        this.presentEntrance(event.side ?? "player");
      }
      if (event.type === "characterDefeated") {
        this.presentDefeat(event, impactDelay + damageIndex * 105);
      }
    }

    if (durationMs > 0) {
      this.time.delayedCall(durationMs, () => {
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(this.scale.width / 2, this.scale.height / 2);
        this.layout();
      });
    }
  }

  presentCountdownBeat(label: "3" | "2" | "1" | "FIGHT"): void {
    if (this.#reducedMotion) {
      this.#playerArt?.setAlpha(1);
      this.#enemyArt?.setAlpha(1);
      return;
    }
    if (label === "3") {
      this.presentEntrance("player", 58);
      this.#enemyArt?.setAlpha(0.48);
      return;
    }
    if (label === "2") {
      this.#playerArt?.setAlpha(0.58);
      this.#enemyArt?.setAlpha(1);
      this.presentEntrance("enemy", 58);
      return;
    }
    if (label === "1") {
      this.#playerArt?.setAlpha(1);
      this.#enemyArt?.setAlpha(1);
      this.tweens.add({
        targets: [this.#playerArt, this.#enemyArt].filter(Boolean),
        scaleX: (target: Phaser.GameObjects.Image) => target.scaleX * 1.06,
        scaleY: (target: Phaser.GameObjects.Image) => target.scaleY * 1.06,
        duration: 180,
        ease: "Expo.easeOut",
        yoyo: true,
      });
      return;
    }
    this.#playerArt?.setAlpha(1);
    this.#enemyArt?.setAlpha(1);
    this.cameras.main.flash(90, 242, 215, 66, false);
    this.cameras.main.shake(120, 0.005);
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
    const isPortrait = height > width * 1.2;
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

    const characterHeight = isPortrait
      ? Math.min(height * 0.66, width * 1.36)
      : Math.min(height * 0.96, width * 0.46);
    const position = (side: Side): { x: number; y: number } => ({
      x: width * (side === "player" ? (isPortrait ? 0.27 : 0.25) : 0.75),
      y: height * (isPortrait ? (side === "player" ? 1.04 : 0.7) : 1.01),
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
          .setScale(characterHeight / source.height)
          .setDepth(isPortrait && side === "player" ? 5 : 4);
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
        .setPosition(
          width * (side === "player" ? 0.12 : 0.88),
          height * (isPortrait ? (side === "player" ? 1.08 : 0.73) : 1.1),
        )
        .setScale((characterHeight * (isPortrait ? 1.12 : 1.5)) / source.height)
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

  private targetFor(instanceId: string | undefined): {
    target: Phaser.GameObjects.Image | Phaser.GameObjects.Container;
    isPlayer: boolean;
  } | null {
    const isPlayer =
      this.#snapshot &&
      sideForInstance(this.#snapshot, instanceId) === "player";
    const art = isPlayer ? this.#playerArt : this.#enemyArt;
    const fallback = isPlayer ? this.#playerFallback : this.#enemyFallback;
    const target = art?.visible ? art : fallback;
    return target ? { target, isPlayer: Boolean(isPlayer) } : null;
  }

  private presentDamage(event: BattleEvent, delayMs = 0): void {
    this.time.delayedCall(delayMs, () => {
      const resolved = this.targetFor(event.targetId);
      if (!resolved) {
        return;
      }
      const { target, isPlayer } = resolved;
      const amount = this.add
        .text(
          target.x,
          target.y - target.displayHeight * 0.72,
          `-${event.amount ?? 0}`,
          {
            fontFamily: "sans-serif",
            fontSize: `${Math.max(32, this.scale.width * 0.038)}px`,
            fontStyle: "bold",
            color: "#f2d742",
            stroke: "#091128",
            strokeThickness: 10,
          },
        )
        .setOrigin(0.5)
        .setDepth(30);
      if (this.#reducedMotion) {
        this.time.delayedCall(420, () => amount.destroy());
        return;
      }
      this.cameras.main.shake(110, 0.009);
      this.cameras.main.flash(80, 247, 240, 221, false);
      this.tweens.add({
        targets: target,
        x: target.x + (isPlayer ? -34 : 34),
        angle: isPlayer ? -3 : 3,
        yoyo: true,
        duration: 85,
        ease: "Quad.easeOut",
      });
      this.tweens.add({
        targets: amount,
        y: amount.y - 92,
        scaleX: 1.2,
        scaleY: 1.2,
        alpha: 0,
        duration: 620,
        ease: "Cubic.easeOut",
        onComplete: () => amount.destroy(),
      });
    });
  }

  private presentFloat(
    event: BattleEvent,
    label: string,
    color: string,
    delayMs = 0,
  ): void {
    this.time.delayedCall(delayMs, () => {
      const resolved = this.targetFor(event.targetId);
      if (!resolved) {
        return;
      }
      const text = this.add
        .text(
          resolved.target.x,
          resolved.target.y - resolved.target.displayHeight * 0.72,
          label,
          {
            fontFamily: "sans-serif",
            fontSize: `${Math.max(30, this.scale.width * 0.034)}px`,
            fontStyle: "bold",
            color,
            stroke: "#091128",
            strokeThickness: 9,
          },
        )
        .setOrigin(0.5)
        .setDepth(30);
      this.tweens.add({
        targets: text,
        y: text.y - (this.#reducedMotion ? 0 : 72),
        alpha: 0,
        duration: 620,
        ease: "Cubic.easeOut",
        onComplete: () => text.destroy(),
      });
    });
  }

  private presentDodge(event: BattleEvent, delayMs = 0): void {
    this.time.delayedCall(delayMs, () => {
      const resolved = this.targetFor(event.targetId);
      if (!resolved) {
        return;
      }
      this.presentImpactWord("DODGE!", "#8de1ff", 0);
      if (this.#reducedMotion) {
        return;
      }
      this.tweens.add({
        targets: resolved.target,
        x: resolved.target.x + (resolved.isPlayer ? -86 : 86),
        duration: 110,
        ease: "Expo.easeOut",
        hold: 120,
        yoyo: true,
      });
    });
  }

  private presentImpactWord(label: string, color: string, delayMs = 0): void {
    this.time.delayedCall(delayMs, () => {
      const width = this.scale.width;
      const height = this.scale.height;
      const text = this.add
        .text(width / 2, height * 0.34, label, {
          fontFamily: "sans-serif",
          fontSize: `${Math.max(42, width * 0.062)}px`,
          fontStyle: "bold",
          color,
          stroke: "#091128",
          strokeThickness: 12,
        })
        .setOrigin(0.5)
        .setDepth(32)
        .setAngle(-3);
      if (!this.#reducedMotion) {
        text.setScale(1.45);
      }
      this.tweens.add({
        targets: text,
        scaleX: 1,
        scaleY: 1,
        alpha: { from: 1, to: 0 },
        duration: this.#reducedMotion ? 460 : 620,
        ease: "Expo.easeOut",
        hold: 120,
        onComplete: () => text.destroy(),
      });
    });
  }

  private presentEntrance(side: Side, distance = 44): void {
    const target = side === "player" ? this.#playerArt : this.#enemyArt;
    if (!target?.visible || this.#reducedMotion) {
      return;
    }
    const destination = target.x;
    target.x = destination + (side === "player" ? -distance : distance);
    this.tweens.add({
      targets: target,
      x: destination,
      duration: 240,
      ease: "Expo.easeOut",
    });
  }

  private presentLunge(side: Side, delayMs = 0): void {
    this.time.delayedCall(delayMs, () => {
      const target = side === "player" ? this.#playerArt : this.#enemyArt;
      if (!target?.visible || this.#reducedMotion) {
        return;
      }
      this.cameras.main.zoomTo(1.08, 150, "Expo.easeOut");
      this.tweens.add({
        targets: target,
        x: target.x + (side === "player" ? 78 : -78),
        scaleX: target.scaleX * 1.08,
        scaleY: target.scaleY * 1.08,
        duration: 130,
        ease: "Expo.easeOut",
        hold: 90,
        yoyo: true,
      });
    });
  }

  private presentDefeat(event: BattleEvent, delayMs = 0): void {
    this.time.delayedCall(delayMs, () => {
      const art = event.side === "player" ? this.#playerArt : this.#enemyArt;
      if (!art) {
        return;
      }
      this.presentImpactWord("K.O.", "#ef4d39", 0);
      this.tweens.add({
        targets: art,
        y: art.y + (this.#reducedMotion ? 0 : 70),
        angle: event.side === "player" ? -9 : 9,
        alpha: 0.42,
        duration: this.#reducedMotion ? 0 : 320,
        ease: "Cubic.easeIn",
      });
    });
  }

  private presentCutIn(actionId: string, side: Side): void {
    const action = combatContent.actions[actionId];
    const key = action?.presentationId;
    const width = this.scale.width;
    const height = this.scale.height;
    if (key && this.textures.exists(key)) {
      const cutIn = this.add
        .image(width / 2, height / 2, key)
        .setDepth(25)
        .setDisplaySize(width * 1.08, height * 1.08)
        .setFlipX(side === "enemy")
        .setAlpha(0.98);
      const title = this.add
        .text(
          side === "player" ? width * 0.08 : width * 0.92,
          height * 0.82,
          action.name.toUpperCase(),
          {
            fontFamily: "sans-serif",
            fontSize: `${Math.max(34, width * 0.055)}px`,
            fontStyle: "bold",
            color: "#f7f0dd",
            stroke: "#091128",
            strokeThickness: 12,
          },
        )
        .setOrigin(side === "player" ? 0 : 1, 0.5)
        .setDepth(27);
      if (this.#reducedMotion) {
        this.time.delayedCall(500, () => {
          cutIn.destroy();
          title.destroy();
        });
        return;
      }
      const destination = width / 2;
      cutIn.setX(side === "player" ? -width * 0.55 : width * 1.55);
      title.setAlpha(0);
      this.tweens.add({
        targets: cutIn,
        x: destination,
        duration: 170,
        ease: "Expo.easeOut",
        hold: 250,
        yoyo: true,
        onComplete: () => cutIn.destroy(),
      });
      this.tweens.add({
        targets: title,
        alpha: 1,
        duration: 100,
        hold: 300,
        yoyo: true,
        onComplete: () => title.destroy(),
      });
      return;
    }

    const art = side === "player" ? this.#playerArt : this.#enemyArt;
    if (!art?.visible || !action) {
      this.presentLunge(side);
      return;
    }
    const panelWidth = width * 0.66;
    const panel = this.add.graphics();
    panel.fillStyle(side === "player" ? 0xef4d39 : 0xf2d742, 0.97);
    panel.fillPoints(
      side === "player"
        ? [
            new Phaser.Geom.Point(0, 0),
            new Phaser.Geom.Point(panelWidth, 0),
            new Phaser.Geom.Point(panelWidth - width * 0.13, height),
            new Phaser.Geom.Point(0, height),
          ]
        : [
            new Phaser.Geom.Point(width - panelWidth, 0),
            new Phaser.Geom.Point(width, 0),
            new Phaser.Geom.Point(width, height),
            new Phaser.Geom.Point(width - panelWidth + width * 0.13, height),
          ],
      true,
    );
    const source = art.texture.getSourceImage() as {
      width: number;
      height: number;
    };
    const portrait = this.add
      .image(
        side === "player" ? width * 0.28 : width * 0.72,
        height * 1.04,
        art.texture.key,
      )
      .setOrigin(0.5, 1)
      .setFlipX(side === "enemy")
      .setScale((height * 1.18) / source.height);
    const title = this.add
      .text(
        side === "player" ? width * 0.05 : width * 0.95,
        height * 0.16,
        action.name.toUpperCase(),
        {
          fontFamily: "sans-serif",
          fontSize: `${Math.max(34, width * 0.058)}px`,
          fontStyle: "bold",
          color: side === "player" ? "#f7f0dd" : "#091128",
          stroke: side === "player" ? "#091128" : "#f7f0dd",
          strokeThickness: 8,
          align: side === "player" ? "left" : "right",
        },
      )
      .setOrigin(side === "player" ? 0 : 1, 0.5);
    const cutIn = this.add
      .container(side === "player" ? -width : width, 0, [
        panel,
        portrait,
        title,
      ])
      .setDepth(25);
    if (this.#reducedMotion) {
      cutIn.setX(0);
      this.time.delayedCall(500, () => cutIn.destroy(true));
      return;
    }
    this.tweens.add({
      targets: cutIn,
      x: 0,
      duration: 170,
      ease: "Expo.easeOut",
      hold: 250,
      yoyo: true,
      onComplete: () => cutIn.destroy(true),
    });
  }
}
