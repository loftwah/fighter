export const FRAMED_SHOT_CONTRACT_VERSION = 2 as const;

export type FramedShotFrameClass =
  "landscape" | "portrait" | "square" | "contact-sheet";

export type FramedShotAspect = "16:9" | "4:5" | "1:1" | "3:2";

export type FramedShotFacing =
  "left" | "right" | "camera" | "none" | "multiple";

export type FramedShotMirrorPolicy = "side-aware" | "never";

export type FramedShotTextPolicy = "none" | "decorative-only" | "authored-copy";

export type FramedShotRole =
  | "arena-establishing"
  | "intro-establishing"
  | "story-establishing"
  | "tournament-establishing"
  | "character-canonical"
  | "character-idle"
  | "move-cut-in"
  | "reaction-sheet"
  | "accessory"
  | "modification"
  | "store-tile"
  | "trophy"
  | "placeholder";

export interface NormalizedPoint {
  /** Horizontal position from the source frame's left edge, from 0 to 1. */
  x: number;
  /** Vertical position from the source frame's top edge, from 0 to 1. */
  y: number;
}

export interface NormalizedRect extends NormalizedPoint {
  width: number;
  height: number;
}

/**
 * Versioned metadata for generated images that remain complete, opaque frames.
 *
 * `focalPoint` is the first point a cover-style crop should preserve.
 * `safeCrop` bounds the authored subject/detail that should remain visible when
 * practical. Both use source-relative coordinates so renderers do not depend on
 * a particular generated resolution.
 */
export interface FramedShotMetadataV2 {
  contractVersion: typeof FRAMED_SHOT_CONTRACT_VERSION;
  compositing: "opaque-frame";
  frameClass: FramedShotFrameClass;
  aspect: FramedShotAspect;
  focalPoint: NormalizedPoint;
  safeCrop: NormalizedRect;
  facing: FramedShotFacing;
  mirrorPolicy: FramedShotMirrorPolicy;
  textPolicy: FramedShotTextPolicy;
  shotRole: FramedShotRole;
}

export interface ImageAsset {
  id: string;
  path: string;
  fallback: string | null;
  framedShot: FramedShotMetadataV2;
}

const frameClassAspects: Record<FramedShotFrameClass, FramedShotAspect> = {
  landscape: "16:9",
  portrait: "4:5",
  square: "1:1",
  "contact-sheet": "3:2",
};

const fullFrameSafeCrop: NormalizedRect = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
};

function framedShot(
  frameClass: FramedShotFrameClass,
  shotRole: FramedShotRole,
  focalPoint: NormalizedPoint,
  safeCrop: NormalizedRect,
  facing: FramedShotFacing,
  textPolicy: FramedShotTextPolicy = "none",
  mirrorPolicy: FramedShotMirrorPolicy = facing === "left" || facing === "right"
    ? "side-aware"
    : "never",
): FramedShotMetadataV2 {
  return {
    contractVersion: FRAMED_SHOT_CONTRACT_VERSION,
    compositing: "opaque-frame",
    frameClass,
    aspect: frameClassAspects[frameClass],
    focalPoint,
    safeCrop,
    facing,
    mirrorPolicy,
    textPolicy,
    shotRole,
  };
}

const establishingFrame = (
  shotRole:
    | "arena-establishing"
    | "intro-establishing"
    | "story-establishing"
    | "tournament-establishing",
): FramedShotMetadataV2 =>
  framedShot(
    "landscape",
    shotRole,
    { x: 0.5, y: 0.46 },
    { x: 0.08, y: 0.08, width: 0.84, height: 0.84 },
    "none",
  );

const characterPortraitFrame = (
  shotRole: "character-canonical" | "character-idle",
  facing: "right" | "camera",
): FramedShotMetadataV2 =>
  framedShot(
    "portrait",
    shotRole,
    { x: 0.5, y: 0.38 },
    { x: 0.12, y: 0.06, width: 0.76, height: 0.86 },
    facing,
  );

const moveCutInFrame = (): FramedShotMetadataV2 =>
  framedShot(
    "landscape",
    "move-cut-in",
    { x: 0.46, y: 0.45 },
    { x: 0.06, y: 0.06, width: 0.88, height: 0.86 },
    "right",
  );

const trophyFrame = (): FramedShotMetadataV2 =>
  framedShot(
    "square",
    "trophy",
    { x: 0.5, y: 0.48 },
    { x: 0.08, y: 0.06, width: 0.84, height: 0.88 },
    "camera",
  );

const svgDataUri = (source: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;

const placeholderClass = svgDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><rect width="800" height="1000" fill="#ef4d39"/><path d="M0 160L800 20v210L0 370zm0 520l800-150v240L0 920z" fill="#f2d742"/><circle cx="400" cy="390" r="150" fill="#111f46"/><path d="M180 920c25-240 120-350 220-350s195 110 220 350" fill="#111f46"/></svg>`,
);

export function createAssetRegistry<T extends { id: string }>(
  registryName: string,
  source: readonly T[],
): Record<string, T> {
  const seenIds = new Set<string>();
  for (const asset of source) {
    if (seenIds.has(asset.id)) {
      throw new Error(
        `${registryName} contains duplicate asset ID ${asset.id}`,
      );
    }
    seenIds.add(asset.id);
  }

  return Object.fromEntries(source.map((asset) => [asset.id, asset]));
}

const launchRosterAssetManifest = launchArtContract.characters;

const launchRosterImageAssets = launchRosterAssetManifest.flatMap(
  ({ slug }) => [
    {
      id: `image.${slug}.canonical`,
      path: `/assets/generated/launch-roster/${slug}/canonical.png`,
      fallback: "image.placeholder.generic",
      framedShot: characterPortraitFrame("character-canonical", "camera"),
    },
    {
      id: `image.${slug}.idle.a`,
      path: `/assets/generated/launch-roster/${slug}/idle-a.png`,
      fallback: `image.${slug}.canonical`,
      framedShot: characterPortraitFrame("character-idle", "right"),
    },
    {
      id: `image.${slug}.idle.b`,
      path: `/assets/generated/launch-roster/${slug}/idle-b.png`,
      fallback: `image.${slug}.canonical`,
      framedShot: characterPortraitFrame("character-idle", "right"),
    },
    {
      id: `image.${slug}.reactions`,
      path: `/assets/generated/launch-roster/${slug}/reactions.png`,
      fallback: `image.${slug}.canonical`,
      framedShot: framedShot(
        "contact-sheet",
        "reaction-sheet",
        { x: 0.5, y: 0.5 },
        fullFrameSafeCrop,
        "multiple",
      ),
    },
  ],
);

const accessoryImageAssets = launchArtContract.accessories.map(({ slug }) => ({
  id: `image.accessory.${slug}`,
  path: `/assets/generated/launch-roster/accessories/${slug}.png`,
  fallback: "image.placeholder.generic",
  framedShot: framedShot(
    "square",
    "accessory",
    { x: 0.5, y: 0.5 },
    { x: 0.06, y: 0.06, width: 0.88, height: 0.88 },
    "none",
  ),
}));

const modificationImageAssets = launchArtContract.modifications.map(
  ({ slug }) => ({
    id: `image.modification.${slug}`,
    path: `/assets/generated/launch-roster/modifications/${slug}.png`,
    fallback: "image.placeholder.generic",
    framedShot: framedShot(
      "square",
      "modification",
      { x: 0.5, y: 0.5 },
      { x: 0.06, y: 0.06, width: 0.88, height: 0.88 },
      "none",
    ),
  }),
);

const trophyImageAssets = [
  {
    id: "image.trophy.wrong-door-cup",
    path: "/assets/generated/trophies/wrong-door-cup.png",
    fallback: "image.trophy.generic.gold-cup",
    framedShot: trophyFrame(),
  },
  {
    id: "image.trophy.generic.gold-cup",
    path: "/assets/generated/trophies/generic-gold-cup.png",
    fallback: "image.placeholder.generic",
    framedShot: trophyFrame(),
  },
  {
    id: "image.trophy.generic.silver-tower",
    path: "/assets/generated/trophies/generic-silver-tower.png",
    fallback: "image.trophy.generic.gold-cup",
    framedShot: trophyFrame(),
  },
  {
    id: "image.trophy.generic.bronze-chaos",
    path: "/assets/generated/trophies/generic-bronze-chaos.png",
    fallback: "image.trophy.generic.gold-cup",
    framedShot: trophyFrame(),
  },
] satisfies readonly ImageAsset[];

export const imageAssetList = [
  ...launchRosterImageAssets,
  ...accessoryImageAssets,
  ...modificationImageAssets,
  ...trophyImageAssets,
  {
    id: "image.arena.first-run",
    path: "/assets/generated/launch-roster/environments/arena.png",
    fallback: null,
    framedShot: establishingFrame("arena-establishing"),
  },
  {
    id: "image.story.first-run",
    path: "/assets/generated/launch-roster/environments/story.png",
    fallback: "image.arena.first-run",
    framedShot: establishingFrame("story-establishing"),
  },
  {
    id: "image.tournament.cheap-seats",
    path: "/assets/generated/launch-roster/environments/tournament.png",
    fallback: "image.arena.first-run",
    framedShot: establishingFrame("tournament-establishing"),
  },
  {
    id: "image.intro.launch-roster",
    path: "/assets/generated/launch-roster/environments/intro-launch-roster.png",
    fallback: "image.story.first-run",
    framedShot: establishingFrame("intro-establishing"),
  },
  {
    id: "image.intro.launch-roster.portrait",
    path: "/assets/generated/launch-roster/environments/intro-launch-roster-portrait.png",
    fallback: "image.intro.launch-roster",
    framedShot: framedShot(
      "portrait",
      "intro-establishing",
      { x: 0.5, y: 0.42 },
      { x: 0.08, y: 0.06, width: 0.84, height: 0.88 },
      "multiple",
    ),
  },
  {
    id: "image.mara-vex.canonical",
    path: "/assets/generated/mara-vex-canonical.png",
    fallback: "image.placeholder.impact",
    framedShot: characterPortraitFrame("character-canonical", "right"),
  },
  {
    id: "image.mara-vex.idle.a",
    path: "/assets/generated/mara-vex-idle-a.png",
    fallback: "image.mara-vex.canonical",
    framedShot: characterPortraitFrame("character-idle", "right"),
  },
  {
    id: "image.mara-vex.idle.b",
    path: "/assets/generated/mara-vex-idle-b.png",
    fallback: "image.mara-vex.canonical",
    framedShot: characterPortraitFrame("character-idle", "right"),
  },
  {
    id: "image.knuckle-tax.canonical",
    path: "/assets/generated/knuckle-tax-canonical.png",
    fallback: "image.placeholder.guard",
    framedShot: characterPortraitFrame("character-canonical", "camera"),
  },
  {
    id: "image.knuckle-tax.idle.a",
    path: "/assets/generated/knuckle-tax-idle-a.png",
    fallback: "image.knuckle-tax.canonical",
    framedShot: characterPortraitFrame("character-idle", "camera"),
  },
  {
    id: "image.knuckle-tax.idle.b",
    path: "/assets/generated/knuckle-tax-idle-b.png",
    fallback: "image.knuckle-tax.canonical",
    framedShot: characterPortraitFrame("character-idle", "camera"),
  },
  {
    id: "image.zipwire.canonical",
    path: "/assets/generated/zipwire-canonical.png",
    fallback: "image.placeholder.circuit",
    framedShot: characterPortraitFrame("character-canonical", "camera"),
  },
  {
    id: "image.zipwire.idle.a",
    path: "/assets/generated/zipwire-idle-a.png",
    fallback: "image.zipwire.canonical",
    framedShot: characterPortraitFrame("character-idle", "camera"),
  },
  {
    id: "image.zipwire.idle.b",
    path: "/assets/generated/zipwire-idle-b.png",
    fallback: "image.zipwire.canonical",
    framedShot: characterPortraitFrame("character-idle", "camera"),
  },
  {
    id: "image.velvet-hex.canonical",
    path: "/assets/generated/velvet-hex-canonical.png",
    fallback: "image.placeholder.hex",
    framedShot: characterPortraitFrame("character-canonical", "camera"),
  },
  {
    id: "image.velvet-hex.idle.a",
    path: "/assets/generated/velvet-hex-idle-a.png",
    fallback: "image.velvet-hex.canonical",
    framedShot: characterPortraitFrame("character-idle", "camera"),
  },
  {
    id: "image.velvet-hex.idle.b",
    path: "/assets/generated/velvet-hex-idle-b.png",
    fallback: "image.velvet-hex.canonical",
    framedShot: characterPortraitFrame("character-idle", "camera"),
  },
  {
    id: "image.gutter-grin.canonical",
    path: "/assets/generated/gutter-grin-canonical.png",
    fallback: "image.placeholder.guile",
    framedShot: characterPortraitFrame("character-canonical", "camera"),
  },
  {
    id: "image.gutter-grin.idle.a",
    path: "/assets/generated/gutter-grin-idle-a.png",
    fallback: "image.gutter-grin.canonical",
    framedShot: characterPortraitFrame("character-idle", "camera"),
  },
  {
    id: "image.gutter-grin.idle.b",
    path: "/assets/generated/gutter-grin-idle-b.png",
    fallback: "image.gutter-grin.canonical",
    framedShot: characterPortraitFrame("character-idle", "camera"),
  },
  {
    id: "image.scrapjack.canonical",
    path: "/assets/generated/scrapjack-canonical.png",
    fallback: "image.placeholder.feral",
    framedShot: characterPortraitFrame("character-canonical", "camera"),
  },
  {
    id: "image.scrapjack.idle.a",
    path: "/assets/generated/scrapjack-idle-a.png",
    fallback: "image.scrapjack.canonical",
    framedShot: characterPortraitFrame("character-idle", "camera"),
  },
  {
    id: "image.scrapjack.idle.b",
    path: "/assets/generated/scrapjack-idle-b.png",
    fallback: "image.scrapjack.canonical",
    framedShot: characterPortraitFrame("character-idle", "camera"),
  },
  {
    id: "image.action.mara.quick",
    path: "/assets/generated/mara-vex-action-quick.png",
    fallback: "image.mara-vex.canonical",
    framedShot: moveCutInFrame(),
  },
  {
    id: "image.action.mara.control",
    path: "/assets/generated/mara-vex-action-control.png",
    fallback: "image.mara-vex.canonical",
    framedShot: moveCutInFrame(),
  },
  {
    id: "image.action.mara.finisher",
    path: "/assets/generated/mara-vex-action-finisher.png",
    fallback: "image.mara-vex.canonical",
    framedShot: moveCutInFrame(),
  },
  {
    id: "image.mara-vex.reactions",
    path: "/assets/generated/mara-vex-reactions.png",
    fallback: "image.mara-vex.canonical",
    framedShot: framedShot(
      "contact-sheet",
      "reaction-sheet",
      { x: 0.5, y: 0.5 },
      fullFrameSafeCrop,
      "multiple",
    ),
  },
  {
    id: "image.store.mara-vex",
    path: "/assets/generated/store-mara-vex.png",
    fallback: "image.mara-vex.canonical",
    framedShot: framedShot(
      "square",
      "store-tile",
      { x: 0.5, y: 0.42 },
      { x: 0.08, y: 0.06, width: 0.84, height: 0.88 },
      "right",
    ),
  },
] satisfies readonly ImageAsset[];

export const imageAssets: Record<string, ImageAsset> = createAssetRegistry(
  "image asset registry",
  imageAssetList,
);

export function resolveImagePath(id: string): string {
  const asset = imageAssets[id];
  if (!asset) {
    return placeholderClass;
  }
  return asset.path;
}

export const fallbackImagePath = placeholderClass;

export interface VideoAsset {
  id: string;
  path: string | null;
}

export const videoAssets: Record<string, VideoAsset> = {
  "video.intro.first-print": {
    id: "video.intro.first-print",
    path: null,
  },
};

export function resolveVideoPath(id: string): string | null {
  return videoAssets[id]?.path ?? null;
}

export function nextImageFallback(
  id: string,
): { id: string; path: string } | null {
  const fallbackId = imageAssets[id]?.fallback;
  if (!fallbackId) {
    return { id: "image.placeholder.generic", path: placeholderClass };
  }
  return { id: fallbackId, path: resolveImagePath(fallbackId) };
}

export function imageFallbackChain(
  id: string,
): Array<{ id: string; path: string }> {
  const first = imageAssets[id]
    ? { id, path: resolveImagePath(id) }
    : { id: "image.placeholder.generic", path: placeholderClass };
  const chain: Array<{ id: string; path: string }> = [];
  const visited = new Set<string>();
  let current: { id: string; path: string } | null = first;

  while (current && !visited.has(current.id)) {
    chain.push(current);
    visited.add(current.id);
    current = nextImageFallback(current.id);
  }

  return chain;
}

export interface PresentationAsset {
  id: string;
  path: string | null;
  framedShot: FramedShotMetadataV2;
}

const launchRosterPresentationAssets = launchRosterAssetManifest.flatMap(
  ({ slug, moves }) =>
    moves.map((action) => ({
      id: `presentation.${slug}.${action}`,
      path: `/assets/generated/launch-roster/${slug}/actions/${action}.png`,
      framedShot: moveCutInFrame(),
    })),
);

export const presentationAssetList = [
  ...launchRosterPresentationAssets,
  {
    id: "presentation.mara.quick",
    path: "/assets/generated/mara-vex-action-quick.png",
    framedShot: moveCutInFrame(),
  },
  {
    id: "presentation.mara.control",
    path: "/assets/generated/mara-vex-action-control.png",
    framedShot: moveCutInFrame(),
  },
  {
    id: "presentation.mara.finisher",
    path: "/assets/generated/mara-vex-action-finisher.png",
    framedShot: moveCutInFrame(),
  },
  {
    id: "presentation.knuckle.quick",
    path: null,
    framedShot: moveCutInFrame(),
  },
  {
    id: "presentation.knuckle.guard",
    path: null,
    framedShot: moveCutInFrame(),
  },
  {
    id: "presentation.knuckle.finisher",
    path: null,
    framedShot: moveCutInFrame(),
  },
  {
    id: "presentation.generic.quick",
    path: null,
    framedShot: moveCutInFrame(),
  },
  {
    id: "presentation.generic.control",
    path: null,
    framedShot: moveCutInFrame(),
  },
  {
    id: "presentation.generic.finisher",
    path: null,
    framedShot: moveCutInFrame(),
  },
  {
    id: "presentation.generic.heal",
    path: null,
    framedShot: moveCutInFrame(),
  },
  {
    id: "presentation.generic.guard",
    path: null,
    framedShot: moveCutInFrame(),
  },
] satisfies readonly PresentationAsset[];

export const presentationAssets: Record<string, PresentationAsset> =
  createAssetRegistry("presentation asset registry", presentationAssetList);

export const fallbackFramedShot: FramedShotMetadataV2 = framedShot(
  "portrait",
  "placeholder",
  { x: 0.5, y: 0.42 },
  fullFrameSafeCrop,
  "camera",
);

export function resolveFramedShotMetadata(id: string): FramedShotMetadataV2 {
  return (
    imageAssets[id]?.framedShot ??
    presentationAssets[id]?.framedShot ??
    fallbackFramedShot
  );
}

export function resolveImageObjectPosition(id: string): string {
  const { focalPoint } = resolveFramedShotMetadata(id);
  return `${Math.round(focalPoint.x * 100)}% ${Math.round(focalPoint.y * 100)}%`;
}

function assertNormalizedCoordinate(
  assetId: string,
  field: string,
  value: number,
): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(
      `${assetId} has invalid ${field}; expected a normalized value from 0 to 1`,
    );
  }
}

export function assertValidFramedShotMetadata(
  assetId: string,
  metadata: FramedShotMetadataV2,
): void {
  if (metadata.contractVersion !== FRAMED_SHOT_CONTRACT_VERSION) {
    throw new Error(`${assetId} uses an unsupported framed-shot contract`);
  }
  if (metadata.compositing !== "opaque-frame") {
    throw new Error(`${assetId} must use opaque-frame compositing`);
  }
  if (
    metadata.mirrorPolicy === "side-aware" &&
    metadata.facing !== "left" &&
    metadata.facing !== "right"
  ) {
    throw new Error(
      `${assetId} uses side-aware mirroring without directional facing`,
    );
  }
  if (
    metadata.textPolicy === "authored-copy" &&
    metadata.mirrorPolicy !== "never"
  ) {
    throw new Error(`${assetId} cannot mirror authored copy`);
  }
  if (frameClassAspects[metadata.frameClass] !== metadata.aspect) {
    throw new Error(
      `${assetId} frame class ${metadata.frameClass} does not match ${metadata.aspect}`,
    );
  }

  assertNormalizedCoordinate(assetId, "focalPoint.x", metadata.focalPoint.x);
  assertNormalizedCoordinate(assetId, "focalPoint.y", metadata.focalPoint.y);
  assertNormalizedCoordinate(assetId, "safeCrop.x", metadata.safeCrop.x);
  assertNormalizedCoordinate(assetId, "safeCrop.y", metadata.safeCrop.y);
  assertNormalizedCoordinate(
    assetId,
    "safeCrop.width",
    metadata.safeCrop.width,
  );
  assertNormalizedCoordinate(
    assetId,
    "safeCrop.height",
    metadata.safeCrop.height,
  );

  const { x, y, width, height } = metadata.safeCrop;
  if (width === 0 || height === 0 || x + width > 1 || y + height > 1) {
    throw new Error(`${assetId} has a safe crop outside the source frame`);
  }
  if (
    metadata.focalPoint.x < x ||
    metadata.focalPoint.x > x + width ||
    metadata.focalPoint.y < y ||
    metadata.focalPoint.y > y + height
  ) {
    throw new Error(`${assetId} has a focal point outside its safe crop`);
  }
}

export function assertValidFramedShotRegistries(): void {
  assertValidFramedShotMetadata(
    "image.placeholder.generic",
    fallbackFramedShot,
  );
  for (const asset of [...imageAssetList, ...presentationAssetList]) {
    assertValidFramedShotMetadata(asset.id, asset.framedShot);
  }
}
import launchArtContract from "./launch-art-contract.json";
