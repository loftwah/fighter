import type Phaser from "phaser";
import {
  resolveFramedShotMetadata,
  type FramedShotFacing,
  type NormalizedRect,
} from "../../assets/registry";
import type { Side } from "../../combat/types";
import { calculateCoverCrop, type Rect } from "./framing";

interface FramedShotOptions {
  side: Side;
  textureKey: string;
  depth?: number;
}

export interface FramedShotTextureOptions {
  crossfade?: boolean;
  reducedMotion?: boolean;
  sourceRegion?: NormalizedRect | null;
  facingOverride?: FramedShotFacing | null;
}

const fullSourceRegion: NormalizedRect = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
};

function sameRegion(
  first: NormalizedRect | null,
  second: NormalizedRect | null,
): boolean {
  return (
    first === second ||
    (first !== null &&
      second !== null &&
      first.x === second.x &&
      first.y === second.y &&
      first.width === second.width &&
      first.height === second.height)
  );
}

function shouldMirrorForSide(facing: FramedShotFacing, side: Side): boolean {
  if (facing === "camera" || facing === "none" || facing === "multiple") {
    return false;
  }
  return side === "player" ? facing === "left" : facing === "right";
}

/**
 * A complete opaque image presented through a fixed comic-panel window.
 *
 * Layout, panel travel, and image motion are deliberately separate. Battle
 * choreography animates `motionRoot`, while resizing only updates the fixed
 * layout and geometry mask. This prevents an idle swap or responsive layout
 * pass from cancelling attack motion.
 */
export class FramedShot {
  readonly layoutRoot: Phaser.GameObjects.Container;
  readonly motionRoot: Phaser.GameObjects.Container;

  readonly #scene: Phaser.Scene;
  readonly #side: Side;
  readonly #layers: [Phaser.GameObjects.Image, Phaser.GameObjects.Image];
  readonly #backing: Phaser.GameObjects.Rectangle;
  readonly #border: Phaser.GameObjects.Graphics;
  readonly #fallbackMark: Phaser.GameObjects.Star;
  readonly #fallbackLabel: Phaser.GameObjects.Text;
  readonly #maskShape: Phaser.GameObjects.Graphics;
  readonly #mask: Phaser.Display.Masks.GeometryMask;
  #frame: Rect = { x: 0, y: 0, width: 1, height: 1 };
  #frontLayer = 0;
  #textureKey: string;
  #sourceRegion: NormalizedRect | null = null;
  #facingOverride: FramedShotFacing | null = null;
  #layerSourceRegions: [NormalizedRect | null, NormalizedRect | null] = [
    null,
    null,
  ];
  #layerFacingOverrides: [FramedShotFacing | null, FramedShotFacing | null] = [
    null,
    null,
  ];
  #panelOffset = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene, options: FramedShotOptions) {
    this.#scene = scene;
    this.#side = options.side;
    this.#textureKey = options.textureKey;
    this.layoutRoot = scene.add.container().setDepth(options.depth ?? 4);
    this.motionRoot = scene.add.container();
    this.#backing = scene.add
      .rectangle(0, 0, 1, 1, options.side === "player" ? 0x111f46 : 0x2f2146)
      .setOrigin(0.5);
    this.#layers = [
      scene.add.image(0, 0, options.textureKey).setOrigin(0.5),
      scene.add.image(0, 0, options.textureKey).setOrigin(0.5).setAlpha(0),
    ];
    this.#fallbackMark = scene.add
      .star(0, -12, 8, 28, 58, options.side === "player" ? 0xef4d39 : 0xf2d742)
      .setVisible(false);
    this.#fallbackLabel = scene.add
      .text(0, 46, "UNPRINTED", {
        fontFamily: "sans-serif",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#f7f0dd",
        stroke: "#091128",
        strokeThickness: 7,
      })
      .setOrigin(0.5)
      .setVisible(false);
    this.#border = scene.add.graphics();
    this.#maskShape = scene.make.graphics({}, false);
    this.#mask = this.#maskShape.createGeometryMask();

    for (const layer of this.#layers) {
      layer.setMask(this.#mask);
    }
    this.motionRoot.add(this.#layers);
    this.layoutRoot.add([
      this.#backing,
      this.motionRoot,
      this.#fallbackMark,
      this.#fallbackLabel,
      this.#border,
    ]);
  }

  get frame(): Readonly<Rect> {
    return this.#frame;
  }

  get textureKey(): string {
    return this.#textureKey;
  }

  get worldCenter(): { x: number; y: number } {
    return {
      x: this.#frame.x + this.#frame.width / 2 + this.#panelOffset.x,
      y: this.#frame.y + this.#frame.height / 2 + this.#panelOffset.y,
    };
  }

  get displayHeight(): number {
    return this.#frame.height;
  }

  get visible(): boolean {
    return this.layoutRoot.visible;
  }

  setDepth(depth: number): this {
    this.layoutRoot.setDepth(depth);
    return this;
  }

  setVisible(visible: boolean): this {
    this.layoutRoot.setVisible(visible);
    return this;
  }

  setOpacity(alpha: number): this {
    this.motionRoot.setAlpha(alpha);
    return this;
  }

  setPanelOffset(x: number, y: number): this {
    this.#panelOffset = { x, y };
    this.layoutRoot.setPosition(
      this.#frame.x + this.#frame.width / 2 + x,
      this.#frame.y + this.#frame.height / 2 + y,
    );
    this.#maskShape.setPosition(x, y);
    return this;
  }

  setFrame(frame: Rect): this {
    this.#frame = { ...frame };
    this.setPanelOffset(this.#panelOffset.x, this.#panelOffset.y);
    this.#backing.setSize(frame.width, frame.height);
    this.#fallbackMark.setScale(Math.max(0.75, frame.height / 340));
    this.#fallbackLabel.setY(frame.height * 0.28);
    this.#fallbackLabel.setFontSize(
      Math.max(14, Math.min(24, frame.width * 0.07)),
    );

    this.#border.clear();
    this.#border
      .lineStyle(Math.max(6, frame.width * 0.012), 0x091128, 1)
      .strokeRect(
        -frame.width / 2,
        -frame.height / 2,
        frame.width,
        frame.height,
      )
      .lineStyle(Math.max(2, frame.width * 0.0035), 0xf7f0dd, 0.82)
      .strokeRect(
        -frame.width / 2 + 7,
        -frame.height / 2 + 7,
        Math.max(1, frame.width - 14),
        Math.max(1, frame.height - 14),
      );
    this.#maskShape
      .clear()
      .fillStyle(0xffffff)
      .fillRect(frame.x, frame.y, frame.width, frame.height);
    this.applyFraming(this.#layers[0], 0);
    this.applyFraming(this.#layers[1], 1);
    return this;
  }

  setTexture(textureKey: string, options: FramedShotTextureOptions = {}): this {
    const sourceRegion = options.sourceRegion ?? null;
    const facingOverride = options.facingOverride ?? null;
    if (
      textureKey === this.#textureKey &&
      sameRegion(sourceRegion, this.#sourceRegion) &&
      facingOverride === this.#facingOverride
    ) {
      return this;
    }
    this.#textureKey = textureKey;
    this.#sourceRegion = sourceRegion;
    this.#facingOverride = facingOverride;
    const nextIndex = this.#frontLayer === 0 ? 1 : 0;
    const incoming = this.#layers[nextIndex];
    const outgoing = this.#layers[this.#frontLayer]!;
    this.#scene.tweens.killTweensOf([incoming, outgoing]);
    incoming.setTexture(textureKey).setVisible(true).setAlpha(0);
    this.#layerSourceRegions[nextIndex] = sourceRegion;
    this.#layerFacingOverrides[nextIndex] = facingOverride;
    this.applyFraming(incoming, nextIndex);
    this.#frontLayer = nextIndex;
    this.showFallback(false);

    if (!options.crossfade || options.reducedMotion) {
      incoming.setAlpha(1);
      outgoing.setAlpha(0);
      return this;
    }

    this.#scene.tweens.add({
      targets: incoming,
      alpha: 1,
      duration: 220,
      ease: "Sine.easeInOut",
    });
    this.#scene.tweens.add({
      targets: outgoing,
      alpha: 0,
      duration: 220,
      ease: "Sine.easeInOut",
    });
    return this;
  }

  showFallback(visible: boolean, label = "UNPRINTED"): this {
    this.#fallbackMark.setVisible(visible);
    this.#fallbackLabel.setText(label).setVisible(visible);
    this.motionRoot.setVisible(!visible);
    return this;
  }

  resetMotion(): this {
    this.#scene.tweens.killTweensOf(this.motionRoot);
    this.motionRoot.setPosition(0, 0).setScale(1).setAngle(0).setAlpha(1);
    return this;
  }

  pulse(direction: -1 | 1): void {
    this.#scene.tweens.killTweensOf(this.motionRoot);
    this.#scene.tweens.add({
      targets: this.motionRoot,
      x: direction * Math.max(5, this.#frame.width * 0.018),
      y: -Math.max(2, this.#frame.height * 0.008),
      scaleX: 1.035,
      scaleY: 1.035,
      duration: 520,
      ease: "Sine.easeInOut",
      yoyo: true,
    });
  }

  destroy(): void {
    this.#mask.destroy();
    this.#maskShape.destroy();
    this.layoutRoot.destroy(true);
  }

  private applyFraming(
    layer: Phaser.GameObjects.Image,
    layerIndex: 0 | 1,
  ): void {
    const source = layer.texture.getSourceImage() as {
      width: number;
      height: number;
    };
    const metadata = resolveFramedShotMetadata(layer.texture.key);
    const normalizedRegion =
      this.#layerSourceRegions[layerIndex] ?? fullSourceRegion;
    const sourceRegion = {
      x: normalizedRegion.x * source.width,
      y: normalizedRegion.y * source.height,
      width: normalizedRegion.width * source.width,
      height: normalizedRegion.height * source.height,
    };
    const facing = this.#layerFacingOverrides[layerIndex] ?? metadata.facing;
    const crop = calculateCoverCrop(
      { width: sourceRegion.width, height: sourceRegion.height },
      { width: this.#frame.width, height: this.#frame.height },
      {
        focalPoint:
          this.#layerSourceRegions[layerIndex] === null
            ? metadata.focalPoint
            : { x: 0.5, y: 0.46 },
        safeCrop:
          this.#layerSourceRegions[layerIndex] === null
            ? metadata.safeCrop
            : fullSourceRegion,
        flipX: shouldMirrorForSide(facing, this.#side),
      },
    );
    const scale = crop.scaleX * 1.055;
    const cropCenterX = sourceRegion.x + crop.source.x + crop.source.width / 2;
    const cropCenterY = sourceRegion.y + crop.source.y + crop.source.height / 2;
    const sourceOffsetX = cropCenterX - source.width / 2;
    const sourceOffsetY = cropCenterY - source.height / 2;
    layer
      .setCrop()
      .setOrigin(0.5)
      .setScale(scale)
      .setFlipX(crop.flipX)
      .setPosition(
        (crop.flipX ? sourceOffsetX : -sourceOffsetX) * scale,
        -sourceOffsetY * scale,
      );
  }
}
