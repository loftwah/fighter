import type {
  FramedShotMetadataV1,
  NormalizedPoint,
  NormalizedRect,
} from "../../assets/registry";

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Size {
  x: number;
  y: number;
}

export interface FramedShotFramingOptions extends Pick<
  FramedShotMetadataV1,
  "focalPoint" | "safeCrop"
> {
  /**
   * Mirrors the rendered frame after its source crop is selected. The source
   * crop remains stable so flipping a fighter cannot reveal different artwork.
   */
  flipX?: boolean;
}

export interface CoverCrop {
  /** Pixel rectangle sampled from the opaque source image. */
  source: Rect;
  /** Pixel rectangle occupied by the image in its destination panel. */
  destination: Rect;
  /** Uniform cover scale. Both values are exposed to make stretching testable. */
  scaleX: number;
  scaleY: number;
  flipX: boolean;
  /** Focal position inside the rendered panel, normalized from 0 to 1. */
  focalInDestination: NormalizedPoint;
}

export interface BattleLayout {
  orientation: "landscape" | "portrait";
  viewport: Rect;
  arena: Rect;
  playerFrame: Rect;
  enemyFrame: Rect;
  cutInFrame: Rect;
  impactFrame: Rect;
}

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(Math.max(value, minimum), maximum);

const assertPositiveSize = (name: string, size: Size): void => {
  if (
    !Number.isFinite(size.width) ||
    !Number.isFinite(size.height) ||
    size.width <= 0 ||
    size.height <= 0
  ) {
    throw new RangeError(`${name} must have finite positive dimensions`);
  }
};

const assertNormalizedPoint = (name: string, point: NormalizedPoint): void => {
  if (
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.y) ||
    point.x < 0 ||
    point.x > 1 ||
    point.y < 0 ||
    point.y > 1
  ) {
    throw new RangeError(`${name} must use coordinates from 0 to 1`);
  }
};

const assertNormalizedRect = (name: string, rect: NormalizedRect): void => {
  assertNormalizedPoint(name, rect);
  if (
    !Number.isFinite(rect.width) ||
    !Number.isFinite(rect.height) ||
    rect.width <= 0 ||
    rect.height <= 0 ||
    rect.x + rect.width > 1 ||
    rect.y + rect.height > 1
  ) {
    throw new RangeError(`${name} must be a positive rectangle within 0 to 1`);
  }
};

/**
 * Chooses a crop offset on one source axis.
 *
 * The focal point is centred first. If the safe region is smaller than the
 * crop, the crop shifts only enough to contain it. If the crop is smaller,
 * it remains inside the safe region. This gives metadata a predictable
 * contract even when a drastic aspect-ratio change makes full preservation
 * impossible.
 */
const calculateAxisOffset = (
  sourceLength: number,
  cropLength: number,
  focal: number,
  safeStart: number,
  safeLength: number,
): number => {
  const sourceMaximum = Math.max(0, sourceLength - cropLength);
  const ideal = focal * sourceLength - cropLength / 2;
  const safeStartPixels = safeStart * sourceLength;
  const safeEndPixels = (safeStart + safeLength) * sourceLength;

  const preferredMinimum =
    cropLength <= safeLength * sourceLength
      ? safeStartPixels
      : safeEndPixels - cropLength;
  const preferredMaximum =
    cropLength <= safeLength * sourceLength
      ? safeEndPixels - cropLength
      : safeStartPixels;

  const minimum = Math.max(0, preferredMinimum);
  const maximum = Math.min(sourceMaximum, preferredMaximum);

  if (minimum <= maximum) {
    return clamp(ideal, minimum, maximum);
  }

  // Invalid or floating-point-edge metadata should never push a crop outside
  // the source frame.
  return clamp(ideal, 0, sourceMaximum);
};

/**
 * Calculates an opaque, cover-style source crop for a destination panel.
 * The result always preserves source aspect ratio and never stretches.
 */
export const calculateCoverCrop = (
  sourceSize: Size,
  panelSize: Size,
  options: FramedShotFramingOptions,
): CoverCrop => {
  assertPositiveSize("sourceSize", sourceSize);
  assertPositiveSize("panelSize", panelSize);
  assertNormalizedPoint("focalPoint", options.focalPoint);
  assertNormalizedRect("safeCrop", options.safeCrop);
  if (
    options.focalPoint.x < options.safeCrop.x ||
    options.focalPoint.x > options.safeCrop.x + options.safeCrop.width ||
    options.focalPoint.y < options.safeCrop.y ||
    options.focalPoint.y > options.safeCrop.y + options.safeCrop.height
  ) {
    throw new RangeError("focalPoint must be inside safeCrop");
  }

  const sourceAspect = sourceSize.width / sourceSize.height;
  const panelAspect = panelSize.width / panelSize.height;
  const cropWidth =
    sourceAspect > panelAspect
      ? sourceSize.height * panelAspect
      : sourceSize.width;
  const cropHeight =
    sourceAspect > panelAspect
      ? sourceSize.height
      : sourceSize.width / panelAspect;
  const x = calculateAxisOffset(
    sourceSize.width,
    cropWidth,
    options.focalPoint.x,
    options.safeCrop.x,
    options.safeCrop.width,
  );
  const y = calculateAxisOffset(
    sourceSize.height,
    cropHeight,
    options.focalPoint.y,
    options.safeCrop.y,
    options.safeCrop.height,
  );
  const unflippedFocalX =
    (options.focalPoint.x * sourceSize.width - x) / cropWidth;
  const focalY = (options.focalPoint.y * sourceSize.height - y) / cropHeight;
  const scale = panelSize.width / cropWidth;
  const flipX = options.flipX ?? false;

  return {
    source: { x, y, width: cropWidth, height: cropHeight },
    destination: { x: 0, y: 0, ...panelSize },
    scaleX: scale,
    scaleY: panelSize.height / cropHeight,
    flipX,
    focalInDestination: {
      x: flipX ? 1 - unflippedFocalX : unflippedFocalX,
      y: focalY,
    },
  };
};

const rectFromViewport = (
  width: number,
  height: number,
  x: number,
  y: number,
  rectWidth: number,
  rectHeight: number,
): Rect => ({
  x: width * x,
  y: height * y,
  width: width * rectWidth,
  height: height * rectHeight,
});

/**
 * Provides stable comic-panel geometry for the Phaser presentation layer.
 * The deliberate overlap gives code-driven wipes and cut-ins room to move
 * while every opaque rectangle remains bounded by the viewport.
 */
export const calculateBattleLayout = (
  width: number,
  height: number,
): BattleLayout => {
  assertPositiveSize("viewport", { width, height });

  const viewport: Rect = { x: 0, y: 0, width, height };
  const arena = { ...viewport };

  if (width >= height) {
    return {
      orientation: "landscape",
      viewport,
      arena,
      playerFrame: rectFromViewport(width, height, 0.04, 0.3, 0.57, 0.65),
      enemyFrame: rectFromViewport(width, height, 0.51, 0.04, 0.45, 0.58),
      cutInFrame: rectFromViewport(width, height, 0.12, 0.15, 0.76, 0.7),
      impactFrame: rectFromViewport(width, height, 0.37, 0.16, 0.31, 0.32),
    };
  }

  return {
    orientation: "portrait",
    viewport,
    arena,
    playerFrame: rectFromViewport(width, height, 0.04, 0.4, 0.52, 0.34),
    enemyFrame: rectFromViewport(width, height, 0.52, 0.15, 0.44, 0.25),
    cutInFrame: rectFromViewport(width, height, 0.04, 0.18, 0.92, 0.5),
    impactFrame: rectFromViewport(width, height, 0.18, 0.29, 0.64, 0.25),
  };
};
